// Stellarenes service worker — bump VERSION on every deploy to force reload
const VERSION = '2026-07-06-1616';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Always fetch from network — no offline caching needed
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
