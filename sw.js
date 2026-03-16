const CACHE_NAME = 'mini-boo-v1';

const ASSETS_TO_CACHE = [
  '/mini-boo/',
  '/mini-boo/index.html',
  '/mini-boo/logo.jpg',
  '/mini-boo/manifest.json',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Install: cache all game assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Offline fallback: return cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/mini-boo/index.html');
        }
      });
    })
  );
});
