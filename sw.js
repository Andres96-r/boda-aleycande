// sw.js — Service Worker Boda Ale & Cande
const CACHE = 'boda-assets-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // ── HTML: siempre fresco, con timestamp para romper caché del CDN ──
  if (req.mode === 'navigate') {
    const url = new URL(req.url);
    url.searchParams.set('_sw', Date.now()); // cada visita = URL única = CDN miss
    event.respondWith(
      fetch(url.toString(), { cache: 'reload' })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ── Assets estáticos: caché primero ──
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok) {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
        }
        return res;
      });
    })
  );
});
