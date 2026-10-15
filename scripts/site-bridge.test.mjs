import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../src/index.js';
const originalFetch=globalThis.fetch;
const previous={site:{navbar:[{label:'Sobre',target:'#sobre'}],portfolio:{reels:[],cards:[]},clients:[{name:'Anterior',logo:'https://example.com/old.png'}]}};
const envBase={
 ASSETS:{fetch:async()=>new Response(JSON.stringify(previous),{status:200})},
 R2_BUCKET:{get:async()=>({text:async()=>JSON.stringify(previous)})}
};
try{
 const req=new Request('https://connectpixel.online/api/content/site-content');
 const original=await worker.fetch(req,{...envBase});
 assert.equal(original.status,200);
 assert.deepEqual((await original.json()).site.clients,previous.site.clients);
 let called=0;
 globalThis.fetch=async()=>{called++;return new Response(JSON.stringify({site:{clients:[{name:'Novo',logo:'https://example.com/new.png'}],portfolio:{reels:[{title:'Novo Reel'}]}}}),{status:200,headers:{'content-type':'application/json'}})};
 const configured={...envBase,CRM_CMS_BRIDGE_ENABLED:'true',CRM_SUPABASE_URL:'https://example.supabase.co',CRM_SUPABASE_PUBLISHABLE_KEY:'public',CRM_ORGANIZATION_ID:'00000000-0000-0000-0000-000000000001'};
 const published=await worker.fetch(req,configured);
 const merged=await published.json();
 assert.equal(called,1);
 assert.equal(merged.site.clients[0].name,'Novo');
 assert.equal(merged.site.portfolio.reels[0].title,'Novo Reel');
 assert.equal(merged.site.navbar[0].label,'Sobre');
 globalThis.fetch=async()=>new Response('unavailable',{status:503});
 const fallback=await worker.fetch(req,configured);
 assert.equal((await fallback.json()).site.clients[0].name,'Anterior');
 const loader=await readFile('public/content-loader.js','utf8');
 assert.ok(loader.includes('d.meta?.crmPublished!==true'),'bio must preserve previous static UI unless bridge is enabled');
 assert.ok(loader.includes('renderDynamicClients(s)'),'client logo rendering must be connected');
 console.log('Cloudflare bridge: original preserved, CRM overlay merged, offline fallback and bio flag passed');
}finally{globalThis.fetch=originalFetch}
