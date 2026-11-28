// This guide no longer keeps an offline copy: remove the worker installed by earlier versions and its caches.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('circular-africa-')).map(k => caches.delete(k)))).then(() => self.registration.unregister()).then(() => self.clients.matchAll()).then(cs => cs.forEach(c => c.navigate(c.url)))); });
