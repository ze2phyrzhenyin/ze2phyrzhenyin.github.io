// /guides/circular-africa/ without a language: ?lang= first, then ?from= (the guides index the reader came from, if that language exists), then the browser language, then English.
(() => {
  const url = new URL(location.href);
  const locales = ['en', 'es', 'zh'];
  const nav = (navigator.languages || [navigator.language || '']).map(l => l.slice(0, 2).toLowerCase());
  const locale = [url.searchParams.get('lang'), url.searchParams.get('from'), ...nav].find(v => locales.includes(v)) || 'en';
  const target = new URL(`/guides/circular-africa/${locale}/${document.documentElement.dataset.guideEntry || ''}`, url);
  target.search = url.search;
  target.searchParams.delete('lang');
  if (locales.includes(url.searchParams.get('from'))) target.searchParams.delete('from');
  target.hash = url.hash;
  location.replace(target.href);
})();
