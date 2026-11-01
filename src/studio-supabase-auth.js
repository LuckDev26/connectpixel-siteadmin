/**
 * ConnectPixel Studio accounts — Supabase Auth, private session cookie, per-user roles.
 * Secrets NEVER reach the browser. Service key is used only in this Cloudflare Worker.
 * Roles/active status are re-checked at every protected request, so disabling a user
 * immediately denies API access even if their signed cookie has not yet expired.
 */
const COOKIE = '__Host-cp_studio';
const DURATION=2*3600;
const te=new TextEncoder();
const roles=new Set(['owner','admin','editor','viewer']);
function response(data,status=200,headers={}) {
 return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff',...headers}});
}
function conf(env) {
 const base=String(env.CRM_SUPABASE_URL||'').replace(/\/+$/,'');
 const pub=String(env.CRM_SUPABASE_PUBLISHABLE_KEY||'');
 const key=String(env.STUDIO_SUPABASE_SERVICE_ROLE_KEY||'');
 const signing=String(env.STUDIO_SESSION_SECRET||'');
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)||!pub||key.length<35||signing.length<32)
   throw new Error('Studio Supabase authentication is not configured');
 return {base,pub,key,signing};
}
const b64=x=>btoa(String.fromCharCode(...x)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function deb64(x) {
 if(!/^[\w-]+$/.test(x)||x.length>600)return null;
 try{return Uint8Array.from(atob(x.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-x.length%4)%4)),x=>x.charCodeAt(0));}catch{return null;}
}
async function signature(payload,key){
 const cryptoKey=await crypto.subtle.importKey('raw',te.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return b64(new Uint8Array(await crypto.subtle.sign('HMAC',cryptoKey,te.encode(payload))));
}
function sameOrigin(req){
 const origin=req.headers.get('Origin'),site=req.headers.get('Sec-Fetch-Site');
 return origin===new URL(req.url).origin && (!site||site==='same-origin'||site==='none');
}
function cookie(req){
 return (req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';
}
async function issue(uid,env,now=Date.now()){
 const {signing}=conf(env);
 const p=b64(te.encode(JSON.stringify({v:2,sub:uid,exp:Math.floor(now/1000)+DURATION,nonce:b64(crypto.getRandomValues(new Uint8Array(16)))})));
 return p+'.'+await signature(p,signing);
}
async function verify(req,env){
 try{
  const v=cookie(req),[p,sig,...rest]=v.split('.');if(!p||!sig||rest.length)return null;
  const payload=deb64(p),signBytes=deb64(sig);if(!payload||!signBytes||signBytes.length!==32)return null;
  const {signing}=conf(env),expected=deb64(await signature(p,signing));if(!expected||expected.length!==signBytes.length)return null;
  let diff=0;for(let i=0;i<expected.length;i++)diff|=expected[i]^signBytes[i];if(diff)return null;
  const o=JSON.parse(new TextDecoder().decode(payload));const now=Math.floor(Date.now()/1000);
  if(o.v!==2||!/^[-\da-f]{36}$/i.test(o.sub)||typeof o.exp!=='number'||o.exp<=now||o.exp>now+DURATION+60)return null;
  return o.sub;
 }catch{return null;}
}
async function requestSupabase(env,path,{method='GET',body,admin=true,accessToken}={}){
 const {base,pub,key}=conf(env);
 const headers={'apikey':admin?key:pub,'Content-Type':'application/json'};
 if(admin)headers.Authorization='Bearer '+key;else if(accessToken)headers.Authorization='Bearer '+accessToken;
 const res=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 const json=await res.json().catch(()=>({}));
 return {ok:res.ok,status:res.status,data:json};
}
function safeUsername(s){return typeof s==='string'&&/^[a-z0-9._-]{3,40}$/.test(s);}
function safeEmail(s){return typeof s==='string'&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);}
async function accountBy(env,field,value){
 const path='/rest/v1/cp_studio_accounts?select=user_id,email,username,role,permissions,is_active,must_change_password,created_at&'+field+'=eq.'+encodeURIComponent(value)+'&limit=1';
 const r=await requestSupabase(env,path);if(!r.ok)throw Error('Account lookup failed');
 return Array.isArray(r.data)?r.data[0]||null:null;
}
function publicAccount(a){return {id:a.user_id,email:a.email,username:a.username,role:a.role,permissions:a.permissions||[],active:a.is_active,mustChangePassword:a.must_change_password===true,createdAt:a.created_at};}
function hasPermission(a,cap){
 if(!a?.is_active)return false;
 if(a.role==='owner')return true;
 if(a.role==='admin')return cap!=='users.owner';
 return Array.isArray(a.permissions)&&a.permissions.includes(cap);
}
export async function currentAccount(req,env){
 const user=await verify(req,env);if(!user)return null;
 const a=await accountBy(env,'user_id',user);
 return a&&a.is_active?a:null;
}
export async function authorize(req,env,parts){
 let account;try{account=await currentAccount(req,env);}catch{return {ok:false,status:503};}
 if(!account)return {ok:false,status:401};
 if(!['GET','HEAD'].includes(req.method)&&!sameOrigin(req))return {ok:false,status:403};
 const area=parts[1]||'';
 let cap='site.read';
 if(area==='users'){
   cap=req.method==='GET'?'users.manage':'users.manage';
 } else if(!['GET','HEAD'].includes(req.method)){
   if(area==='publish'||area==='restore-version'||area==='reset-defaults')cap='publish';
   else if(area==='media'&&req.method==='DELETE')cap='media.delete';
   else if(area==='media'&&req.method==='POST')cap='media.upload';
   else cap='site.edit';
 }
 if(!hasPermission(account,cap))return {ok:false,status:403};
 return {ok:true,account};
}
export async function session(req,env,url){
 try{
  if(url.pathname==='/api/session/login'&&req.method==='POST'){
    if(!sameOrigin(req))return response({ok:false,error:'Origem não autorizada'},403);
    if(!env.LOGIN_RATE_LIMIT)return response({ok:false,error:'Proteção de acesso indisponível'},503);
    const verdict=await env.LOGIN_RATE_LIMIT.limit({key:(req.headers.get('cf-connecting-ip')||'unknown').slice(0,64)});
    if(!verdict.success)return response({ok:false,error:'Muitas tentativas de acesso'},429,{'Retry-After':'60'});
    if(Number(req.headers.get('content-length')||0)>8192)return response({ok:false,error:'Requisição excessiva'},413);
    const raw=await req.text();if(raw.length>8192)return response({ok:false,error:'Requisição excessiva'},413);
    let payload;try{payload=JSON.parse(raw);}catch{return response({ok:false,error:'JSON inválido'},400);}
    const username=String(payload.username||'').trim().toLowerCase();
    const password=payload.password;
    if((!safeUsername(username)&&!safeEmail(username))||typeof password!=='string'||password.length<1||password.length>4096)
     return response({ok:false,error:'Credenciais inválidas'},401);
    const a=await accountBy(env,username.includes('@')?'email':'username',username);
    if(!a||!a.is_active)return response({ok:false,error:'Credenciais inválidas'},401);
    const token=await requestSupabase(env,'/auth/v1/token?grant_type=password',{method:'POST',body:{email:a.email,password},admin:false});
    if(!token.ok||token.data.user?.id!==a.user_id)return response({ok:false,error:'Credenciais inválidas'},401);
    const ticket=await issue(a.user_id,env);
    return response({ok:true,user:publicAccount(a)},200,{'Set-Cookie':COOKIE+'='+ticket+'; Max-Age='+DURATION+'; HttpOnly; Secure; SameSite=Strict; Path=/'});
  }
  if(url.pathname==='/api/session/logout'&&req.method==='POST'){
    if(!sameOrigin(req))return response({ok:false,error:'Origem não autorizada'},403);
    return response({ok:true},200,{'Set-Cookie':COOKIE+'=; Max-Age=0; HttpOnly; Secure; SameSite=Strict; Path=/'});
  }
  if(url.pathname==='/api/session'&&req.method==='GET'){
    const a=await currentAccount(req,env);
    return response(a?{ok:true,user:publicAccount(a)}:{ok:false},a?200:401);
  }
  return response({ok:false,error:'Rota não encontrada'},404);
 }catch{return response({ok:false,error:'O acesso está indisponível. Verifique a configuração de autenticação.'},503);}
}
export async function users(req,env,parts,actor){
 try{
  if(!hasPermission(actor,'users.manage'))return response({ok:false,error:'Permissão insuficiente'},403);
  if(req.method==='GET'&&parts.length===2){
   const r=await requestSupabase(env,'/rest/v1/cp_studio_accounts?select=user_id,email,username,role,permissions,is_active,must_change_password,created_at&order=created_at.asc');
   return r.ok?response({ok:true,users:r.data.map(publicAccount)}):response({ok:false,error:'Não foi possível listar usuários'},503);
  }
  if(parts.length===3&&parts[2]==='invite'&&req.method==='POST'){
   if(actor.role!=='owner'&&actor.role!=='admin')return response({ok:false,error:'Permissão insuficiente'},403);
   const payload=await req.json();
   const username=String(payload.username||'').trim().toLowerCase(), email=String(payload.email||'').trim().toLowerCase();
   const role=String(payload.role||'viewer');
   if(!safeUsername(username)||!safeEmail(email)||!roles.has(role)||role==='owner'||(role==='admin'&&actor.role!=='owner'))
    return response({ok:false,error:'Dados de usuário inválidos'},400);
   const already=await accountBy(env,'username',username);
   if(already)return response({ok:false,error:'Usuário já cadastrado'},409);
   const provisional=b64(crypto.getRandomValues(new Uint8Array(25)));
   const created=await requestSupabase(env,'/auth/v1/admin/users',{method:'POST',body:{
     email,password:provisional,email_confirm:true,user_metadata:{cp_studio_invited:true}
   }});
   if(!created.ok||!created.data.id)return response({ok:false,error:'Não foi possível criar a conta. O e-mail pode já estar cadastrado.'},409);
   const perms=role==='viewer'?['site.read']:role==='editor'?['site.read','site.edit','portfolio.edit','media.read']:['site.read','site.edit','portfolio.edit','media.read','publish','users.manage'];
   const insert=await requestSupabase(env,'/rest/v1/cp_studio_accounts',{method:'POST',body:{
      user_id:created.data.id,username,email,role,permissions:perms,is_active:true,must_change_password:true,invited_by:actor.user_id
   }});
   if(!insert.ok){
     // New account never becomes privileged if the Studio membership insert fails.
     await requestSupabase(env,'/auth/v1/admin/users/'+created.data.id,{method:'DELETE'}).catch(()=>{});
     return response({ok:false,error:'Não foi possível vincular permissões'},503);
   }
   return response({ok:true,username,email,role,temporaryPassword:provisional,oneTimeOnly:true},201);
  }
  if(parts.length===3&&req.method==='PATCH'&&/^[-\da-f]{36}$/i.test(parts[2])){
   const patch=await req.json();const existing=await accountBy(env,'user_id',parts[2]);
   if(!existing)return response({ok:false,error:'Usuário não encontrado'},404);
   if(existing.role==='owner'||patch.role==='owner')return response({ok:false,error:'Permissões de proprietário não podem ser alteradas aqui'},403);
   if(actor.role!=='owner'&&actor.role!=='admin')return response({ok:false,error:'Permissão insuficiente'},403);
   if(actor.role==='admin'&&(existing.role==='admin'||patch.role==='admin'))return response({ok:false,error:'Apenas o proprietário gerencia administradores'},403);
   const changes={updated_at:new Date().toISOString()};
   if(patch.role!==undefined){if(!roles.has(patch.role)||patch.role==='owner')return response({ok:false,error:'Perfil inválido'},400);changes.role=patch.role;}
   if(typeof patch.active==='boolean')changes.is_active=patch.active;
   if(patch.permissions!==undefined){
     const allowed=new Set(['site.read','site.edit','portfolio.edit','media.read','publish','users.manage']);
     if(!Array.isArray(patch.permissions)||patch.permissions.some(x=>!allowed.has(x)))
       return response({ok:false,error:'Permissões inválidas'},400);
     changes.permissions=patch.permissions;
   }
   const updated=await requestSupabase(env,'/rest/v1/cp_studio_accounts?user_id=eq.'+parts[2],{method:'PATCH',body:changes});
   return updated.ok?response({ok:true}):response({ok:false,error:'Falha ao atualizar permissões'},503);
  }
  return response({ok:false,error:'Rota não encontrada'},404);
 }catch{return response({ok:false,error:'Não foi possível concluir a operação'},503);}
}
export async function changePassword(req,env,actor){
 if(!sameOrigin(req))return response({ok:false,error:'Origem não autorizada'},403);
 try{
  const {oldPassword,newPassword}=await req.json();
  if(typeof oldPassword!=='string'||typeof newPassword!=='string'||newPassword.length<12||newPassword.length>120)
    return response({ok:false,error:'A nova senha precisa ter de 12 a 120 caracteres'},400);
  const checked=await requestSupabase(env,'/auth/v1/token?grant_type=password',{method:'POST',body:{email:actor.email,password:oldPassword},admin:false});
  if(!checked.ok||checked.data.user?.id!==actor.user_id)return response({ok:false,error:'Senha atual incorreta'},401);
  const changed=await requestSupabase(env,'/auth/v1/admin/users/'+actor.user_id,{method:'PUT',body:{password:newPassword}});
  if(!changed.ok)return response({ok:false,error:'Falha ao alterar a senha'},503);
  await requestSupabase(env,'/rest/v1/cp_studio_accounts?user_id=eq.'+actor.user_id,{method:'PATCH',body:{must_change_password:false,updated_at:new Date().toISOString()}});
  return response({ok:true});
 }catch{return response({ok:false,error:'Falha ao alterar a senha'},503);}
}
