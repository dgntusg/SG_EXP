// SG Ledger Service Worker - Clean Network-First
const CACHE_NAME = 'sg-ledger-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always go straight to network to avoid any stale UI
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
