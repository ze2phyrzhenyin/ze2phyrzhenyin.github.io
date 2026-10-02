(() => {
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  const locale = ['en', 'fr', 'zh'].includes(requested) ? requested : 'en';
  const target = new URL(`${locale}/${document.documentElement.dataset.guideEntry || ''}`, url);
  target.search = url.search;
  target.searchParams.delete('lang');
  target.hash = url.hash;
  location.replace(target.href);
})();
