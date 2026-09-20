const CACHE_NAME = 'mandi-setu-v1';
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests or cross-origin requests
  if (event.request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // For API sync routes, do not cache using SW, let the app handle via IDB
  if (url.pathname.startsWith('/api/sync')) {
    return;
  }

  // Network First for Next.js document/data requests, fallback to Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache the successful response
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        // If network fails, try to return from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If it's a navigation request and we have no cache, return the root cache
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        
        // Return a basic offline response if possible, or nothing
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
