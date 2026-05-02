// sw.js v2.0 — Autodestructor silencioso (sin recargar la página)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister();
});
