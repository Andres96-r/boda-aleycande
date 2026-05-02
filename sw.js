// sw.js — Autodestructor: desinstala el service worker de todos los browsers
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister()
    .then(() => self.clients.matchAll())
    .then(clients => clients.forEach(c => c.navigate(c.url)));
});
