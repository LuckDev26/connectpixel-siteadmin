import assert from 'node:assert/strict';
import worker from '../src/index.js';

const ownerId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const people=new Map([[ownerId,{user_id:ownerId,email:'owner@connectpixel.test',username:'admin',role:'owner',permissions:['site.read','site.edit','portfolio.edit','media.read','publish','users.manage'],is_active:true,must_change_password:false,created_at:'2026-11-01T00:00:00Z'}]]);
const passwordByEmail=new Map([['owner@connectpixel.test','owner-password-for-test']]);
let usedPrivilegedApi=false;
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
globalThis.fetch=async(input,options={})=>{
 const u=new URL(String(input));
 assert.equal(u.origin,'https://testproject.supabase.co','No calls to external services other than configured Supabase mock');
 const method=options.method||'GET';
 const body=options.body?JSON.parse(options.body):null;
 const apiKey=options.headers?.apikey;
 assert.ok(apiKey==='sb_publishable_test'||apiKey==='service_role_dummy_key_for_backend_tests_1234567890');
 if(options.headers?.Authorization?.includes('service_role_dummy_key'))usedPrivilegedApi=true;
 if(u.pathname==='/auth/v1/token'&&method==='POST'){
  const person=[...people.values()].find(p=>p.email===body.email);
  if(!person||passwordByEmail.get(body.email)!==body.password)return json({error:'Invalid login credentials'},400);
  return json({user:{id:person.user_id,email:person.email},access_token:'test-access'});
 }
 if(u.pathname==='/auth/v1/admin/users'&&method==='POST'){
  if([...people.values()].some(p=>p.email===body.email))return json({msg:'Already registered'},422);
  const id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  passwordByEmail.set(body.email,body.password);
  return json({id,email:body.email});
 }
 if(u.pathname.startsWith('/auth/v1/admin/users/')&&method==='PUT'){
  const id=u.pathname.split('/').at(-1);const person=people.get(id);
  if(!person)return json({error:'not found'},404);
  passwordByEmail.set(person.email,body.password);
  return json({id});
 }
 if(u.pathname.startsWith('/auth/v1/admin/users/')&&method==='DELETE')return json({},200);
 if(u.pathname==='/rest/v1/cp_studio_accounts'){
  if(method==='POST'){const p=body;people.set(p.user_id,{...p,created_at:new Date().toISOString()});return json({},201);}
  if(method==='PATCH'){
   const id=(u.searchParams.get('user_id')||'').replace(/^eq\./,'');const p=people.get(id);if(!p)return json({},404);
   people.set(id,{...p,...body});return json({},204);
  }
  let rows=[...people.values()];
  for(const field of ['username','email','user_id']){
   const term=u.searchParams.get(field);if(term?.startsWith('eq.'))rows=rows.filter(p=>p[field]===term.slice(3));
  }
  return json(rows,200);
 }
 throw Error('Unmocked Supabase path: '+method+' '+u.pathname);
};
class Bucket{
 constructor(){this.objects=new Map();this.writes=[]}
 async get(key){let t=this.objects.get(key);return t===undefined?null:{text:async()=>t}}
 async put(key,value){let t=typeof value==='string'?value:await new Response(value).text();this.objects.set(key,t);this.writes.push(key)}
 async list({prefix}){return {objects:[...this.objects].filter(([k])=>k.startsWith(prefix)).map(([key,val])=>({key,size:val.length,uploaded:new Date()}))}}
}
const media=new Bucket(),published=new Bucket(),privateBucket=new Bucket();
const initialSite={meta:{},site:{navbar:[],portfolio:{reels:[],cards:[],carousels:[]}}};
const initialBio={meta:{},bio:{links:[]}};
published.objects.set('content/site-content.json',JSON.stringify(initialSite));
published.objects.set('content/bio-content.json',JSON.stringify(initialBio));
const env={
 CRM_SUPABASE_URL:'https://testproject.supabase.co',
 CRM_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',
 STUDIO_SUPABASE_SERVICE_ROLE_KEY:'service_role_dummy_key_for_backend_tests_1234567890',
 STUDIO_SESSION_SECRET:'session_dummy_signing_secret_for_studio_tests_only_at_least_32_chars',
 CRM_CMS_BRIDGE_ENABLED:'false',
 R2_BUCKET:media,R2_PRIVATE:privateBucket,R2_PUBLISHED:published,
 STUDIO_ENV:'staging',STUDIO_READ_ONLY:'false',
 LOGIN_RATE_LIMIT:{limit:async()=>({success:true})},
 ASSETS:{fetch:async()=>json(initialSite)}
};
function req(path,method='GET',payload,token,origin='https://studio.test'){
 const headers={};
 if(token)headers.cookie=token;
 if(method!=='GET'){headers.Origin=origin;headers['Content-Type']='application/json'}
 return new Request('https://studio.test'+path,{method,headers,body:payload?JSON.stringify(payload):undefined});
}
async function call(path,method='GET',payload,token,origin='https://studio.test',override=env){return worker.fetch(req(path,method,payload,token,origin),override);}
const unauth=await call('/api/admin/users');
assert.equal(unauth.status,401);
assert.equal((await call('/api/content/draft-site-content')).status,404);
assert.equal((await call('/api/content/change-log')).status,404);
assert.equal((await call('/api/content/site-content')).status,200);
assert.equal((await call('/api/session')).status,401);
assert.equal((await call('/api/session/login','POST',{username:'admin',password:'owner-password-for-test'},'','https://evil.test')).status,403);
assert.equal((await call('/api/session/login','POST',{username:'nobody',password:'owner-password-for-test'})).status,401);
assert.equal((await call('/api/session/login','POST',{username:'admin',password:'wrong'})).status,401);
const login=await call('/api/session/login','POST',{username:'admin',password:'owner-password-for-test'});
assert.equal(login.status,200);assert.equal((await login.clone().json()).user.role,'owner');
const ticket=login.headers.get('set-cookie');assert.match(ticket,/HttpOnly/);assert.match(ticket,/SameSite=Strict/);
const cookie=ticket.split(';')[0];
assert.equal((await call('/api/session','GET',undefined,cookie)).status,200);
assert.equal((await call('/api/admin/users','GET',undefined,cookie)).status,200);
assert.equal((await call('/api/admin/users/invite','POST',{username:'visitor1',email:'visitor@connectpixel.test',role:'editor'},cookie,'https://evil.test')).status,403);
const invitation=await call('/api/admin/users/invite','POST',{username:'visitor1',email:'visitor@connectpixel.test',role:'editor'},cookie);
assert.equal(invitation.status,201);
const inviteData=await invitation.json();assert.ok(inviteData.temporaryPassword.length>=20);
assert.equal(people.size,2);
const editorLogin=await call('/api/session/login','POST',{username:'visitor1',password:inviteData.temporaryPassword});
assert.equal(editorLogin.status,200);assert.equal((await editorLogin.clone().json()).user.mustChangePassword,true);
const editorCookie=editorLogin.headers.get('set-cookie').split(';')[0];
assert.equal((await call('/api/admin/users','GET',undefined,editorCookie)).status,403);
assert.equal((await call('/api/admin/publish','POST',{siteContent:initialSite,bioContent:initialBio},editorCookie)).status,403);
assert.equal((await call('/api/admin/save-draft','POST',{siteContent:initialSite,bioContent:initialBio},editorCookie)).status,403,'Must rotate initial password');
const changed=await call('/api/admin/change-password','POST',{oldPassword:inviteData.temporaryPassword,newPassword:'new-test-editor-password-2026'},editorCookie);
assert.equal(changed.status,200);
assert.equal(people.get('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb').must_change_password,false);
const drafted=await call('/api/admin/save-draft','POST',{siteContent:initialSite,bioContent:initialBio},editorCookie);
assert.equal(drafted.status,200,'Editor can save after rotation');
assert.ok(privateBucket.objects.has('content/draft-site-content.json'));
assert.equal(media.writes.length,0);
assert.equal((await call('/api/admin/publish','POST',{siteContent:initialSite,bioContent:initialBio},editorCookie)).status,403,'Editor cannot publish');
const pub=await call('/api/admin/publish','POST',{siteContent:initialSite,bioContent:initialBio},cookie);
assert.equal(pub.status,200,'Owner can publish to isolated preview');
assert.equal(media.writes.length,0,'Production bucket never written in staging');
assert.ok(published.writes.includes('content/site-content.json'));
const disable=await call('/api/admin/users/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','PATCH',{active:false},cookie);
assert.equal(disable.status,200);
assert.equal((await call('/api/admin/diagnostics','GET',undefined,editorCookie)).status,401,'Disabled user immediately loses access');
assert.equal((await call('/api/admin/publish','POST',{siteContent:initialSite,bioContent:initialBio},cookie,'https://evil.test')).status,403);
const stageWithoutR2={...env,R2_PUBLISHED:undefined};
assert.equal((await call('/api/admin/publish','POST',{siteContent:initialSite,bioContent:initialBio},cookie,'https://studio.test',stageWithoutR2)).status,503);
assert.ok(usedPrivilegedApi,'Service-role calls are exclusively server side');
console.log('Studio Supabase: auth, cookie, roles, invite, password rotation, access revocation, CSRF and isolated publishing passed');
