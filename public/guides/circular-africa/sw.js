// Offline copy of the guide: pages are fetched from the network first and kept for offline use;
// versioned assets are served from the cache.
const VERSION = 'v3-202611280205';
const CACHE = 'circular-africa-' + VERSION;
const BASE = '/guides/circular-africa/';
const LANG = new URL(location.href).searchParams.get('lang') || 'en';
const PRECACHE = [BASE + LANG + '/field/', BASE + LANG + '/', BASE + 'assets/styles.css?' + VERSION, BASE + 'assets/app.js?' + VERSION, BASE + 'assets/field.js?' + VERSION, BASE + 'assets/archivo-latin-wdth.woff2', BASE + 'assets/search.' + LANG + '.json?' + VERSION, '/guides/theme.js?v=20260924c'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('circular-africa-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (!url.pathname.startsWith(BASE) && url.pathname !== '/guides/theme.js') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(url.pathname, copy)); return r; }).catch(() => caches.match(url.pathname).then(r => r || caches.match(BASE + LANG + '/field/'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok && !url.pathname.includes('/files/')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })));
});
