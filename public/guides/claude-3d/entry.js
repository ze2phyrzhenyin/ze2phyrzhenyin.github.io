// Addresses from before the guide had languages (/guides/claude-3d/, /guides/claude-3d/tools/ …) land here.
// ?lang= chooses the language, then ?from= (the language of the guide index the reader came from), then English,
// as /guides/entry.js does. The rest of the query and the section anchor are kept.
(() => {
  const url = new URL(location.href);
  const locales = ['en', 'fr', 'zh'];
  const locale = [url.searchParams.get('lang'), url.searchParams.get('from')].find(value => locales.includes(value)) || 'en';
  const target = new URL(`/guides/claude-3d/${locale}/${document.documentElement.dataset.guideEntry || ''}`, url);
  target.search = url.search;
  target.searchParams.delete('lang');
  target.searchParams.delete('from');
  target.hash = url.hash;
  location.replace(target.href);
})();
