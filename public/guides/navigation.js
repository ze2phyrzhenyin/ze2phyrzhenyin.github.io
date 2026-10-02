(() => {
  'use strict';
  const route = location.pathname.split('/')[1];
  const labels = { en: '← All guides', fr: '← Tous les guides', zh: '← 返回攻略总页' };
  const themeLabels = {
    en: {light:'Light', dark:'Dark', lightAction:'Switch to light mode', darkAction:'Switch to dark mode'},
    fr: {light:'Clair', dark:'Sombre', lightAction:'Passer au mode clair', darkAction:'Passer au mode sombre'},
    zh: {light:'亮色', dark:'深色', lightAction:'切换到亮色模式', darkAction:'切换到深色模式'}
  };
  const themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.className = 'guide-theme-toggle';
  themeButton.addEventListener('click', () => window.GuideTheme.toggle());
  document.querySelector('.guide-navigation-languages')?.prepend(themeButton);
  function updateTheme() {
    const locale = document.documentElement.lang.slice(0, 2);
    const messages = themeLabels[locale] || themeLabels.en;
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    themeButton.textContent = (next === 'light' ? '☀ ' : '☾ ') + messages[next];
    themeButton.setAttribute('aria-label', messages[next + 'Action']);
    themeButton.title = messages[next + 'Action'];
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.removeAttribute('media');
      meta.content = next === 'light' ? '#1c1917' : '#f8f8f7';
    }
  }
  document.addEventListener('guide-theme-change', updateTheme);
  function update() {
    updateTheme();
    const locale = document.documentElement.lang.slice(0, 2);
    for (const link of document.querySelectorAll('[data-guide-home]')) {
      link.href = `/guides/${locale}/`;
      link.textContent = labels[locale] || labels.en;
    }
    for (const link of document.querySelectorAll('.guide-navigation [hreflang]')) {
      const active = link.hreflang.slice(0, 2) === locale;
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
  update();
  new MutationObserver(update).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    // Only language controls should inherit the current view. Section links
    // such as #clubs and #resources must retain their own destination.
    if (!link?.matches('.guide-navigation a[hreflang]')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || !target.pathname.startsWith(`/${route}/`)) return;
    if (!/^\/(?:[^/]+)\/(en|fr|zh)\//.test(target.pathname)) return;
    target.search = location.search;
    if (location.hash) target.hash = location.hash;
    link.href = target.href;
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
      try { sessionStorage.setItem('guide-reading-position', JSON.stringify({path:target.pathname, y:scrollY})); } catch { /* Navigation works without storage. */ }
    }
  });
  function restorePosition() {
    try {
      const saved = JSON.parse(sessionStorage.getItem('guide-reading-position'));
      if (saved?.path === location.pathname && document.documentElement.scrollHeight >= saved.y + innerHeight) {
        scrollTo({top:saved.y, behavior:'instant'});
        sessionStorage.removeItem('guide-reading-position');
      }
    } catch { /* A fresh page needs no saved position. */ }
  }
  window.addEventListener('load', restorePosition);
  document.addEventListener('guide-ready', restorePosition);
})();
