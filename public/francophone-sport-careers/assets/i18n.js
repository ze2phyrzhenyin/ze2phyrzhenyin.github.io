/* i18next owns message resolution and plurals; the research catalog stays immutable. */
(() => {
  'use strict';
  const languages = ['fr', 'en', 'zh'];
  const storageKey = 'francophone-sport-careers.locale';
  const supported = value => languages.includes(value);
  /* Detect locale: data-locale attribute > URL path segment > query param > localStorage > default */
  const htmlLocale = document.documentElement.dataset.locale;
  const pathMatch = location.pathname.match(/\/(?:en|fr|zh)\//);
  const pathLocale = pathMatch ? pathMatch[0].replace(/\//g, '') : null;
  const explicit = supported(htmlLocale) ? htmlLocale : supported(pathLocale) ? pathLocale : new URL(location.href).searchParams.get('lang');
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* URL still preserves the choice. */ }
  const language = supported(explicit) ? explicit : supported(saved) ? saved : 'fr';
  const engine = window.i18next.createInstance();
  const ready = engine.init({
    lng: language,
    fallbackLng: 'fr',
    supportedLngs: languages,
    ns: ['ui', 'content'],
    defaultNS: 'ui',
    resources: window.SPORT_LOCALES,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  const t = (key, options) => engine.t(key, options);
  const localeTag = () => ({fr:'fr-CA',en:'en-CA',zh:'zh-CN'}[engine.language]);
  function date(value) {
    if (!value) return t('detail.unknown');
    return new Intl.DateTimeFormat(localeTag(), {year:'numeric',month:'short',day:'numeric',timeZone:'UTC'})
      .format(new Date(`${value}T12:00:00Z`));
  }
  function applyDocument() {
    document.documentElement.lang = engine.language === 'zh' ? 'zh-CN' : engine.language;
    document.documentElement.dataset.locale = engine.language;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label',t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-language]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.language === engine.language)));
    document.querySelectorAll('[data-language-select]').forEach(el => { el.value = engine.language; });
    document.querySelectorAll('[data-snapshot-date]').forEach(el => { el.textContent = t('site.snapshot',{date:date(el.dataset.snapshotDate)}); });
    document.querySelectorAll('[data-footer-date]').forEach(el => { el.textContent = t('site.footer',{date:date(el.dataset.footerDate)}); });
    document.querySelector('meta[name="description"]').content = t('site.description');
    document.querySelector('meta[property="og:title"]').content = t('site.title');
    document.querySelector('meta[property="og:description"]').content = t('site.description');
  }
  function content(locale = engine.language) { return engine.getResourceBundle(locale, 'content'); }
  async function changeLanguage(locale) {
    if (!supported(locale)) return;
    /* If we are in a /en/, /fr/, /zh/ subdirectory, navigate to the sibling locale path */
    if (/\/francophone-sport-careers\/(?:en|fr|zh)\//.test(location.pathname)) {
      try { localStorage.setItem(storageKey,locale); } catch {}
      const target = location.pathname.replace(/\/(?:en|fr|zh)\//, `/${locale}/`) + location.hash;
      location.href = target;
      return;
    }
    await engine.changeLanguage(locale);
    try { localStorage.setItem(storageKey,locale); } catch { /* No storage required for browsing. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang',locale);
    history.replaceState(null,'',url.href);
    applyDocument();
  }
  window.SportI18n = {ready,t,date,content,applyDocument,changeLanguage,get language(){return engine.language;},languages};
  ready.then(applyDocument);
})();
