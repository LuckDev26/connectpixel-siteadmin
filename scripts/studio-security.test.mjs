import assert from 'node:assert/strict';
import worker from '../src/index.js';
import {verifySession, mintSession} from '../src/studio-security.js';

const SECRET='a-random-very-long-staging-secret-value-for-tests-only';
class Bucket {
  constructor(name){this.name=name;this.objects=new Map();this.writes=[];}
  async get(key){const str=this.objects.get(key);return str===undefined?null:{text:async()=>str};}
  async put(key,text){const str=typeof text==='string'?text:await new Response(text).text();this.objects.set(key,str);this.writes.push(key);}
  async list(opts){return {objects:[...this.objects.keys()].filter(x=>x.startsWith(opts.prefix)).map(key=>({key,size:this.objects.get(key).length,uploaded:new Date()}))};}
}
const media=new Bucket('public-media');
const cms=new Bucket('private-cms');
const publicSite=JSON.stringify({meta:{},site:{navbar:[],portfolio:{reels:[],cards:[],carousels:[]}}});
const publicBio=JSON.stringify({meta:{},bio:{links:[]}});
media.objects.set('content/site-content.json',publicSite);
media.objects.set('content/bio-content.json',publicBio);
const env={ADMIN_TOKEN:SECRET,R2_BUCKET:media,R2_PRIVATE:cms,STUDIO_READ_ONLY:'false',LOGIN_RATE_LIMIT:{limit:async()=>({success:true})},ASSETS:{fetch:async()=>new Response('{}')}};

function request(path, method='GET', body, cookie='', origin='https://studio.test') {
  const headers={};
  if(cookie)headers.cookie='__Host-cp_studio='+cookie;
  if(method!=='GET'){headers.Origin=origin;headers['Content-Type']='application/json';}
  return new Request('https://studio.test'+path,{method,headers,body:body?JSON.stringify(body):undefined});
}
async function call(path,method='GET',body,cookie='',origin='https://studio.test',e=env) {
  return worker.fetch(request(path,method,body,cookie,origin),e);
}
const noSession=await call('/api/admin/diagnostics');
assert.equal(noSession.status,401,'Admin requires cookie');
const publiclyProtected=await call('/api/content/draft-site-content');
assert.equal(publiclyProtected.status,404,'draft cannot be obtained from public API');
const arbitrary=await call('/api/content/change-log');
assert.equal(arbitrary.status,404,'private log cannot be obtained from public API');
const live=await call('/api/content/site-content');
assert.equal(live.status,200,'published content is available');
assert.equal((await live.json()).site.portfolio.reels.length,0);
const csrfLogin=await call('/api/session/login','POST',{password:SECRET},'', 'https://evil.test');
assert.equal(csrfLogin.status,403);
const bad=await call('/api/session/login','POST',{password:'incorrect'});
assert.equal(bad.status,401);
const limitedEnv={...env,LOGIN_RATE_LIMIT:{limit:async()=>({success:false})}};
const rateLimited=await call('/api/session/login','POST',{password:SECRET},'','https://studio.test',limitedEnv);
assert.equal(rateLimited.status,429,'Rate limiter must reject excessive login attempts');
assert.equal(rateLimited.headers.get('Retry-After'),'60');
const noLimiterEnv={...env,LOGIN_RATE_LIMIT:undefined};
assert.equal((await call('/api/session/login','POST',{password:SECRET},'','https://studio.test',noLimiterEnv)).status,503,'Missing protection must fail closed');

const loggedIn=await call('/api/session/login','POST',{password:SECRET});
assert.equal(loggedIn.status,200);
const setCookie=loggedIn.headers.get('set-cookie')||'';
assert.match(setCookie,/HttpOnly/);assert.match(setCookie,/Secure/);assert.match(setCookie,/SameSite=Strict/);
const token=setCookie.split(';')[0].split('=')[1];
assert.ok(await verifySession(token,env));
assert.equal(await verifySession(token+'modified',env),false);
assert.equal(await verifySession(await mintSession(env,Date.now()-9*3600*1000),env),false);
assert.equal((await call('/api/session','GET',undefined,token)).status,200);
assert.equal((await call('/api/admin/diagnostics','GET',undefined,token)).status,200);
assert.equal((await call('/api/admin/diagnostics','GET',undefined,'bogus')).status,401);
const csrf=await call('/api/admin/save-draft','POST',{siteContent:JSON.parse(publicSite),bioContent:JSON.parse(publicBio)},token,'https://evil.test');
assert.notEqual(csrf.status,200,'Cross-origin mutation must fail');
const draft=JSON.parse(publicSite);
draft.site.hero={headline:'Rascunho alterado'};
const saved=await call('/api/admin/save-draft','POST',{siteContent:draft,bioContent:JSON.parse(publicBio)},token);
assert.equal(saved.status,200,'Draft saved');
assert.ok(cms.objects.has('content/draft-site-content.json'),'Draft in private R2');
assert.ok(!media.objects.has('content/draft-site-content.json'),'No draft in public R2');
assert.equal((await call('/api/content/draft-site-content')).status,404);
assert.equal((await (await call('/api/admin/preview/site-content','GET',undefined,token)).json()).site.hero.headline,'Rascunho alterado');
assert.equal((await call('/api/admin/preview/site-content')).status,401,'Unauthenticated preview denied');
const remains=await (await call('/api/content/site-content')).json();
assert.equal(remains.site.hero,undefined,'Saving draft did not publish');
const publish=await call('/api/admin/publish','POST',{siteContent:draft,bioContent:JSON.parse(publicBio)},token);
assert.equal(publish.status,200,'Explicit publishing succeeds');
assert.equal((await (await call('/api/content/site-content')).json()).site.hero.headline,'Rascunho alterado');
assert.ok([...cms.objects.keys()].some(x=>x.startsWith('content/versions/')));
assert.equal([...media.objects.keys()].some(x=>x.startsWith('content/versions/')),false);
const lockedEnv={...env,STUDIO_READ_ONLY:'true'};
assert.equal((await call('/api/admin/publish','POST',{siteContent:draft,bioContent:JSON.parse(publicBio)},token,'https://studio.test',lockedEnv)).status,403);
const logout=await call('/api/session/logout','POST',{},token);
assert.equal(logout.status,200);
assert.match(logout.headers.get('set-cookie')||'',/Max-Age=0/);
const stagingMediaWrites=media.writes.length;
const stagePublished=new Bucket('staging-published-content');
const stagedEnv={...env,R2_PUBLISHED:stagePublished,ASSETS:{fetch:async req=>new Response(new URL(req.url).pathname.includes('bio-content')?publicBio:publicSite)}};
const stageSession=await mintSession(stagedEnv);
const stageDoc=JSON.parse(publicSite);
stageDoc.site.about={headline:'Novo site em homologação'};
const stagePub=await call('/api/admin/publish','POST',{siteContent:stageDoc,bioContent:JSON.parse(publicBio)},stageSession,'https://studio.test',stagedEnv);
assert.equal(stagePub.status,200,'Staging publication should be allowed when explicitly unlocked');
assert.equal(JSON.parse(stagePublished.objects.get('content/site-content.json')).site.about.headline,'Novo site em homologação');
assert.equal(media.writes.length,stagingMediaWrites,'Staging publication must never write into original public media bucket');
const stageContent=await call('/api/content/site-content','GET',undefined,'','https://studio.test',stagedEnv);
assert.equal((await stageContent.json()).site.about.headline,'Novo site em homologação');
assert.equal((await call('/api/admin/media','DELETE',undefined,stageSession,'https://studio.test',stagedEnv)).status,403,'Media deletion always blocked in staging');
assert.equal((await call('/api/admin/media','POST',{},stageSession,'https://studio.test',stagedEnv)).status,403,'Media upload always blocked in staging');
console.log('Studio security: login/logout, expired/tampered sessions, private drafts, CSRF, read-only staging and isolated staging publication OK.');
