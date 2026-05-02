// sw.js — Service Worker Boda Ale & Cande
const CACHE = 'boda-assets-v1';

// Toma control inmediato al instalar
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    // Elimina cachés viejas al activar una nueva versión del SW
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => {
        // Avisa a todas las pestañas abiertas para que recarguen
        return self.clients.matchAll({ type: 'window' });
      })
      .then(clients => {
        clients.forEach(client => client.navigate(client.url));
      })
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // ── HTML principal: SIEMPRE desde la red, NUNCA desde caché ──
  // cache:'reload' fuerza ignorar la caché HTTP del browser
  // Solo usa la caché como último recurso si no hay conexión
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'reload' })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ── Assets estáticos (imágenes, fuentes, JS, CSS): caché primero ──
  // Esto mejora la performance sin afectar actualizaciones del HTML
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
