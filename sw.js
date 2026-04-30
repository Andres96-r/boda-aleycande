// sw.js — Service Worker Boda Ale & Cande
const CACHE = 'boda-cache-v1';

// Al instalarse, toma control inmediato
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const req = event.request;

  // Para el HTML principal: SIEMPRE buscar en red primero
  // Si falla la red (offline), usar lo que haya en caché
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          // Guardar copia fresca en caché
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Para imágenes, fuentes, JS, etc: caché primero (performance)
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
