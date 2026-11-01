/* ConnectPixel Studio v2 — progressive enhancement; no API/data writes. */
(() => {
  'use strict';
  const STORAGE_TAB = 'cp_studio_active_tab';
  const STORAGE_SUBTAB = 'cp_studio_active_subtab';
  const STORAGE_COLLAPSED = 'cp_studio_sidebar_collapsed';
  const icon = (type) => type === 'menu'
    ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M12.5 10.5l-2 1.5 2 1.5"/></svg>';
  function store(key, value, store = sessionStorage) {
    try { store.setItem(key, value); } catch {}
  }
  function read(key, store = sessionStorage) {
    try { return store.getItem(key); } catch { return null; }
  }
  function init() {
    const app = document.querySelector('.app');
    const aside = app?.querySelector('.side');
    if (!app || !aside || document.getElementById('studio-collapse')) return;
    document.title = document.body.classList.contains('logged') ? 'ConnectPixel Studio | Painel' : 'Entrar | ConnectPixel Studio';
    const subtitle = aside.querySelector('.brand span');
    if (subtitle) subtitle.textContent = 'Studio administrativo';

    const collapse = document.createElement('button');
    collapse.type = 'button';
    collapse.id = 'studio-collapse';
    collapse.className = 'studio-collapse-btn';
    collapse.innerHTML = icon('collapse');
    const logout = aside.querySelector('.logout');
    if (logout) logout.before(collapse); else aside.append(collapse);

    const mobile = document.createElement('button');
    mobile.type = 'button';
    mobile.className = 'studio-mobile-trigger';
    mobile.setAttribute('aria-label', 'Abrir menu');
    mobile.setAttribute('aria-expanded', 'false');
    mobile.setAttribute('aria-controls', 'studio-sidebar');
    mobile.innerHTML = icon('menu');
    aside.id = 'studio-sidebar';

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'studio-backdrop';
    backdrop.setAttribute('aria-label', 'Fechar menu');
    app.before(backdrop);
    app.before(mobile);

    function updateCollapse() {
      const on = document.body.classList.contains('studio-collapsed');
      collapse.setAttribute('aria-label', on ? 'Expandir menu lateral' : 'Recolher menu lateral');
      collapse.setAttribute('title', on ? 'Expandir menu lateral' : 'Recolher menu lateral');
      collapse.setAttribute('aria-pressed', on ? 'true' : 'false');
      // Rotate icon in collapsed state without layout jumps.
      const svg = collapse.querySelector('svg');
      if (svg) svg.style.transform = on ? 'scaleX(-1)' : '';
    }
    if (read(STORAGE_COLLAPSED, localStorage) === 'true') {
      document.body.classList.add('studio-collapsed');
    }
    updateCollapse();
    collapse.addEventListener('click', () => {
      const on = document.body.classList.toggle('studio-collapsed');
      store(STORAGE_COLLAPSED, String(on), localStorage);
      updateCollapse();
    });

    function setMobileOpen(open) {
      document.body.classList.toggle('studio-menu-open', open);
      mobile.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobile.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
    mobile.addEventListener('click', () => setMobileOpen(!document.body.classList.contains('studio-menu-open')));
    backdrop.addEventListener('click', () => setMobileOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
      if (event.matches) setMobileOpen(false);
    });

    for (const button of aside.querySelectorAll('.nav button[data-tab]')) {
      const tab = button.dataset.tab;
      button.title = button.querySelector('span')?.childNodes[0]?.textContent?.trim() || tab;
      button.addEventListener('click', () => {
        store(STORAGE_TAB, tab);
        setMobileOpen(false);
      });
    }
    const remembered = read(STORAGE_TAB);
    if (remembered && /^(home|site|bio|method|portfolio|media|publish|log|json|config|users)$/.test(remembered)) {
      aside.querySelector('.nav button[data-tab="' + remembered + '"]')?.click();
    }
    for (const button of document.querySelectorAll('.tabs button[data-sub]')) {
      button.addEventListener('click', () => store(STORAGE_SUBTAB, button.dataset.sub));
    }
    const subtab = read(STORAGE_SUBTAB);
    if (subtab && /^(reels|cards|carousels|clients|feedbacks|segments)$/.test(subtab)) {
      document.querySelector('.tabs button[data-sub="' + subtab + '"]')?.click();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
