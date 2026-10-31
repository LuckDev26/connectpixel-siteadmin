/* ConnectPixel Studio — accessible sign-in and navigation polish. */
(() => {
  "use strict";
  const byId = id => document.getElementById(id);
  const icons = {
    home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    site: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M7 6.6h.01M10 6.6h.01"/>',
    bio: '<path d="M10 13a5 5 0 0 0 7 .1l2-2a5 5 0 1 0-7.1-7.1l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7-.1l-2 2a5 5 0 1 0 7.1 7.1l1.2-1.2"/>',
    method: '<circle cx="12" cy="12" r="9"/><path d="m10 16 4-8 2 6-6 2Z"/>',
    portfolio: '<rect x="3" y="5" width="18" height="15" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4M10 13.5l5 2.5-5 2.5v-5Z"/>',
    media: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="9" r="1.5"/><path d="m3 17 5-5 3 3 3-4 7 7"/>',
    publish: '<path d="M12 16V3m0 0-4 4m4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    log: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    json: '<path d="M8 4H6a2 2 0 0 0-2 2v3a3 3 0 0 1-2 3 3 3 0 0 1 2 3v3a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v3a3 3 0 0 0 2 3 3 3 0 0 0-2 3v3a2 2 0 0 1-2 2h-2"/>',
    config: '<path d="M12 2.6 14 4l2.6-.3.8 2.5 2.4 1.3-.6 2.7 1.2 1.8-1.2 1.8.6 2.7-2.4 1.3-.8 2.5-2.6-.3L12 21.4l-2-1.4-2.6.3-.8-2.5-2.4-1.3.6-2.7L3.6 12l1.2-1.8-.6-2.7 2.4-1.3.8-2.5L10 4l2-1.4Z"/><circle cx="12" cy="12" r="3"/>'
  };
  function init() {
    const input = byId("loginToken");
    const toggle = byId("studioPasswordToggle");
    const caps = byId("loginCaps");
    if(input && toggle) {
      const eye = '<path d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
      const eyeOff = '<path d="m3 3 18 18M10.5 5.1C11 5 11.5 5 12 5c6.3 0 10 7 10 7a15.6 15.6 0 0 1-3.2 3.8M6.4 6.6C3.6 8.3 2 12 2 12s3.7 7 10 7c1.4 0 2.7-.3 3.9-.9"/><path d="M10 10a3 3 0 0 0 4 4"/>';
      toggle.addEventListener("click", () => {
        const visible = input.type === "password";
        input.type = visible ? "text" : "password";
        toggle.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
        toggle.setAttribute("aria-pressed", String(visible));
        toggle.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(visible?eyeOff:eye)+'</svg>';
        input.focus({preventScroll:true});
      });
      input.addEventListener("keyup", e => {if(caps)caps.hidden = !e.getModifierState("CapsLock");});
      input.addEventListener("keydown", e => {if(caps)caps.hidden = !e.getModifierState("CapsLock");});
      input.addEventListener("input", () => {
        const error = byId("loginError");
        input.removeAttribute("aria-invalid");
        if(error){error.hidden=true;error.textContent="";}
      });
    }
    const username = byId("loginUsername");
    if (username) {
      username.addEventListener("input", () => {
        username.removeAttribute("aria-invalid");
        const error = byId("loginError");
        if (error) { error.hidden = true; error.textContent = ""; }
      });
    }
    for (const tab of document.querySelectorAll(".side .nav button[data-tab]")) {
      const marker=tab.querySelector("i");
      if(!marker || !icons[tab.dataset.tab])continue;
      marker.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[tab.dataset.tab]+'</svg>';
      marker.setAttribute("aria-hidden","true");
    }
    const stage=document.querySelector(".studio-environment");
    if(stage && !/studio-staging|studio-preview/i.test(location.hostname)){
      stage.textContent="Área administrativa";
    }
    const title=byId("title");
    if(title) {
      const names={home:"Visão geral",site:"Editar site",bio:"Link da bio",method:"ConnectFlow™",portfolio:"Portfólio",media:"Biblioteca de mídia",publish:"Publicação",log:"Histórico",json:"Editor avançado",config:"Segurança"};
      document.querySelectorAll(".side .nav button[data-tab]").forEach(tab=>tab.addEventListener("click",()=>{
        if(names[tab.dataset.tab])title.textContent=names[tab.dataset.tab];
      }));
      const active=document.querySelector(".side .nav button.active[data-tab]");
      if(active && names[active.dataset.tab])title.textContent=names[active.dataset.tab];
    }
  }
  if(document.readyState === "loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
