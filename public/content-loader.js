/*
ConnectPixel Content Loader
Base preparada para a próxima etapa: aplicar no DOM os dados salvos no R2.
*/
(async () => {
  try {
    const page = location.pathname.startsWith("/bio") ? "bio-content" : "site-content";
    const res = await fetch(`/api/content/${page}`, { cache: "no-store" });
    if (!res.ok) return;
    window.CONNECTPIXEL_CONTENT = await res.json();
    document.dispatchEvent(new CustomEvent("connectpixel:content", { detail: window.CONNECTPIXEL_CONTENT }));
  } catch (e) {
    console.warn("ConnectPixel content loader:", e);
  }
})();
