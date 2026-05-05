(()=>{const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));async function get(n){let r=await fetch(`/api/content/${n}?t=${Date.now()}`,{cache:"no-store"});if(!r.ok)throw new Error(n);return r.json()}function accent(t){let s=esc(t);return s.replace(/(resultados|direção|marca|DNA|digital)/i,"<span>$1</span>")}function site(d){let s=d.site||{};if(s.navbar?.length){let nav=q("nav .nav-links");if(nav)nav.innerHTML=s.navbar.filter(x=>x.visible!==false).sort((a,b)=>(a.order||0)-(b.order||0)).map(x=>`<li><a href="${esc(x.target||"#")}">${esc(x.label)}</a></li>`).join("")}if(s.about){let l=q("#sobre .section-label");if(l&&s.about.badge)l.textContent=s.about.badge;let h=q("#sobre .section-title");if(h&&s.about.headline)h.innerHTML=accent(s.about.headline);let wrap=q("#sobre .sobre-left");if(wrap&&s.about.paragraphs?.length){qa(".sobre-text",wrap).forEach(p=>p.remove());let ref=q(".section-title",wrap);s.about.paragraphs.forEach(t=>{let p=document.createElement("p");p.className="sobre-text";p.textContent=t;ref.after(p)})}}if(s.connectflow){let sec=q("#connectflow");if(sec){let l=q(".connectflow-head .section-label",sec);if(l&&s.connectflow.badge)l.textContent=s.connectflow.badge;let h=q(".connectflow-head .section-title",sec);if(h&&s.connectflow.headline)h.innerHTML=accent(s.connectflow.headline);let sub=q(".connectflow-sub",sec);if(sub&&s.connectflow.subheadline)sub.textContent=s.connectflow.subheadline;let tl=q(".connectflow-timeline",sec);if(tl&&s.connectflow.steps?.length)tl.innerHTML=s.connectflow.steps.map((x,i)=>`<article class="connectflow-item"><div class="connectflow-marker">${esc(x.number||String(i+1).padStart(2,"0"))}</div><div class="connectflow-card"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div></article>`).join("");let f=q(".connectflow-footer",sec);if(f&&s.connectflow.footer)f.innerHTML=`<span>${esc(s.connectflow.footer)}</span>`}}renderDynamicPortfolio(s);}function bio(d){let b=d.bio||{},t=q("#page-home .hero-title,.hero-title");if(t&&b.headline)t.innerHTML=esc(b.headline).replace(/(DNA)/i,'<span class="gradient-text">$1</span>');let c=q("#page-home .hero-copy,.hero-copy");if(c&&b.subtitle)c.textContent=b.subtitle;if(b.whatsapp?.phone){let msg=encodeURIComponent(b.whatsapp.message||"Olá ConnectPixel! Vim pelo link da bio.");qa('a[href*="wa.me"],a[href*="whatsapp.com"]').forEach(a=>a.href=`https://api.whatsapp.com/send?phone=${String(b.whatsapp.phone).replace(/\D/g,"")}&text=${msg}`)}}document.addEventListener("DOMContentLoaded",async()=>{try{let isBio=location.pathname.startsWith("/bio")||location.pathname.endsWith("/bio.html");let params=new URLSearchParams(location.search);let draft=params.get("preview")==="draft";let d=await get(isBio?(draft?"draft-bio-content":"bio-content"):(draft?"draft-site-content":"site-content"));window.CONNECTPIXEL_CONTENT=d;isBio?bio(d):site(d)}catch(e){console.warn("content loader",e)}})
function renderDynamicPortfolio(site){
  const p=site?.portfolio||{};
  const gridReels=document.getElementById("grid-reels");
  const gridCards=document.getElementById("grid-cards");
  const gridCar=document.getElementById("grid-carrosseis");
  const makeCard=(item,type)=>{
    const title=esc(item.title||item.titulo||"Projeto");
    const seg=esc(item.segment||item.nicho||"");
    const media=item.video||item.image||item.url||"";
    const safe=esc(media);
    const thumb=esc(item.thumb||item.image||item.url||"");
    const mediaHtml=type==="reels"||/\.mp4|\.mov|\.webm/i.test(media)
      ? `<video muted playsinline preload="metadata" ${thumb?`poster="${thumb}"`:""}><source src="${safe}"></video>`
      : `<img src="${safe}" alt="${title}" loading="lazy">`;
    return `<article class="p-card"><div class="p-media">${mediaHtml}</div><div class="p-body"><div class="p-tag">${seg}</div><h3>${title}</h3></div></article>`;
  };
  if(gridReels&&Array.isArray(p.reels)&&p.reels.length)gridReels.innerHTML=p.reels.filter(x=>x.visible!==false).sort((a,b)=>(a.order||0)-(b.order||0)).map(x=>makeCard(x,"reels")).join("");
  if(gridCards&&Array.isArray(p.cards)&&p.cards.length)gridCards.innerHTML=p.cards.filter(x=>x.visible!==false).sort((a,b)=>(a.order||0)-(b.order||0)).map(x=>makeCard(x,"cards")).join("");
  if(gridCar&&Array.isArray(p.carousels)&&p.carousels.length)gridCar.innerHTML=p.carousels.filter(x=>x.visible!==false).sort((a,b)=>(a.order||0)-(b.order||0)).map(x=>{
    const slides=(x.slides||[]).map(s=>typeof s==="string"?s:s.url).filter(Boolean);
    const first=slides[0]||x.url||"";
    return `<article class="p-card"><div class="p-media"><img src="${esc(first)}" alt="${esc(x.title||"Carrossel")}" loading="lazy"></div><div class="p-body"><div class="p-tag">${esc(x.segment||"Carrossel")}</div><h3>${esc(x.title||"Carrossel")}</h3><p>${slides.length||1} slides</p></div></article>`;
  }).join("");
}

})();