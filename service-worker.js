const CACHE_NAME = 'd365fo-sales-orders-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './src/app.js',
  './src/d365fo.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }

      try {
        const networkResponse = await fetch(event.request);

        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('./index.html');
          if (fallback) {
            return fallback;
          }
        }

        throw error;
      }
    })()
  );
});
