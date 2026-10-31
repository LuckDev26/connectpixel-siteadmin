/**
 * ConnectPixel Studio — signed HttpOnly session.
 * No auth secrets in browser storage. Authenticated mutation requests require
 * same-origin Origin, preventing cross-site form/fetch requests.
 *
 * Security boundary: this module protects Worker APIs. Drafts and history MUST
 * reside in a non-public R2 bucket (R2_PRIVATE), not public media R2.
 */
const COOKIE = '__Host-cp_studio';
const DURATION = 8 * 60 * 60;
const encoder = new TextEncoder();

function respond(data, status=200, extra={}) {
  return new Response(JSON.stringify(data), {status, headers:{
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store, private',
    'X-Content-Type-Options':'nosniff',
    ...extra
  }});
}
function secret(env) {
  const pwd = String(env.ADMIN_TOKEN || '');
  if (pwd.length < 20) throw new Error('ADMIN_TOKEN deve possuir ao menos 20 caracteres aleatórios');
  return pwd;
}
async function digest(txt) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(txt)));
}
function equalBytes(a,b) {
  if (a.length !== b.length) return false;
  let diff=0;
  for (let i=0;i<a.length;i++) diff |= a[i]^b[i];
  return diff===0;
}
async function checkPassword(actual, expected) {
  const [a,b] = await Promise.all([digest(String(actual)), digest(String(expected))]);
  return equalBytes(a,b);
}
function b64(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function unb64(str) {
  if (!/^[A-Za-z0-9_-]+$/.test(str) || str.length > 300) return null;
  try {
    const raw=atob(str.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-str.length%4)%4));
    return Uint8Array.from(raw,c=>c.charCodeAt(0));
  } catch {return null;}
}
async function sign(value, key) {
  const cryptoKey=await crypto.subtle.importKey('raw',encoder.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return b64(new Uint8Array(await crypto.subtle.sign('HMAC',cryptoKey,encoder.encode(value))));
}
export async function mintSession(env, now=Date.now()) {
  const expires=Math.floor(now/1000)+DURATION;
  const nonce=b64(crypto.getRandomValues(new Uint8Array(20)));
  const payload=b64(encoder.encode(JSON.stringify({v:1,exp:expires,nonce})));
  return payload+'.'+await sign(payload,secret(env));
}
export async function verifySession(token, env, now=Date.now()) {
  if (!token || token.length > 700) return false;
  const parts=token.split('.');
  if(parts.length!==2) return false;
  const [payload,sig]=parts;
  const raw=unb64(payload),sigBytes=unb64(sig);
  if(!raw || !sigBytes || sigBytes.length !== 32) return false;
  let session;
  try {session=JSON.parse(new TextDecoder().decode(raw));} catch {return false;}
  if(session.v!==1||typeof session.exp!=='number'||session.exp<=Math.floor(now/1000)||session.exp>Math.floor(now/1000)+DURATION+60||!/^[-_a-zA-Z0-9]{24,40}$/.test(session.nonce))return false;
  const expected=unb64(await sign(payload,secret(env)));
  return !!expected && equalBytes(expected,sigBytes);
}
function cookieValue(request) {
  const str=request.headers.get('cookie')||'';
  return str.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';
}
export function checkSameOrigin(req) {
  const origin=req.headers.get('Origin');
  const target=new URL(req.url).origin;
  if (!origin||origin!==target) return false;
  // Fetch Metadata further limits cross-site and same-site credentials attacks.
  const site=req.headers.get('Sec-Fetch-Site');
  return !site || ['same-origin','none'].includes(site);
}
export async function requireAdmin(req,env) {
  if (!await verifySession(cookieValue(req),env)) return false;
  if(!['GET','HEAD'].includes(req.method) && !checkSameOrigin(req)) return false;
  return true;
}
export async function sessionRoute(req,env,url) {
  try {
    if(url.pathname==='/api/session/login' && req.method==='POST') {
      if(!checkSameOrigin(req))return respond({ok:false,error:'Origem não autorizada'},403);
      if(!env.LOGIN_RATE_LIMIT) return respond({ok:false,error:'Proteção de acesso indisponível'},503);
      const address=(req.headers.get('cf-connecting-ip')||'unknown').slice(0,64);
      const agent=(req.headers.get('user-agent')||'unknown').slice(0,64);
      const verdict=await env.LOGIN_RATE_LIMIT.limit({key:address+'|'+agent});
      if(!verdict.success) return respond({ok:false,error:'Muitas tentativas de acesso'},429,{'Retry-After':'60'});
      const length=Number(req.headers.get('content-length')||0);
      if(length > 8192)return respond({ok:false,error:'Requisição excessiva'},413);
      const text=await req.text();
      if(text.length>8192)return respond({ok:false,error:'Requisição excessiva'},413);
      let value;
      try {value=JSON.parse(text);} catch {return respond({ok:false,error:'JSON inválido'},400);}
      if(typeof value.password!=='string'||value.password.length>4096)return respond({ok:false,error:'Credenciais inválidas'},401);
      const good=await checkPassword(value.password,secret(env));
      if(!good)return respond({ok:false,error:'Credenciais inválidas'},401);
      const signed=await mintSession(env);
      return respond({ok:true,expiresInSeconds:DURATION},200,{'Set-Cookie':COOKIE+'='+signed+'; Max-Age='+DURATION+'; HttpOnly; Secure; SameSite=Strict; Path=/'});
    }
    if(url.pathname==='/api/session/logout' && req.method==='POST') {
      if(!checkSameOrigin(req))return respond({ok:false,error:'Origem não autorizada'},403);
      return respond({ok:true},200,{'Set-Cookie':COOKIE+'=; Max-Age=0; HttpOnly; Secure; SameSite=Strict; Path=/'});
    }
    if(url.pathname==='/api/session' && req.method==='GET') {
      const ok=await verifySession(cookieValue(req),env);
      return respond({ok},ok?200:401);
    }
    return respond({ok:false,error:'Rota não encontrada'},404);
  } catch {
    // Configuration failures do not expose the secret or permit fallback access.
    return respond({ok:false,error:'Autenticação indisponível'},503);
  }
}
