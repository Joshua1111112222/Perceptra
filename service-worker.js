const CACHE_NAME = 'perceptra-cache-v1';
const urlsToCache = [
  '/how-to-use.html',
  '/index.html',
  '/script.js',
  '/style.css',
  '/logo.png',
  '/logo1.png',
  '/logo2.png',
  '/manifest1.json',
  '/manifest2.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        return fetch(event.request.clone())
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync event
self.addEventListener('sync', function(event) {
  if (event.tag === 'keepalive-sync') {
    event.waitUntil(
      fetch('/ping.json') // A small dummy file to keep the service worker alive
        .then(response => {
          console.log('[Service Worker] Background Sync: keepalive successful');
        })
        .catch(error => {
          console.error('[Service Worker] Background Sync failed:', error);
        })
    );
  }
});
