const CACHE_NAME = 'glass-finder-v1';
const APP_FILES = [
  './TemperedGlassFinder.html',
  './manifest.json'
];

// 1. App install hone par HTML aur Manifest ko save karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

// 2. Purane cache ko saaf karna
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 3. Network-First Strategy: Online hone par Google Sheets ka fresh data laye aur cache update kare, Offline hone par cache se dikhaye
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Agar response sahi hai to use cache me save/update karein
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Internet band hone par cache se data ya page nikalein
        return caches.match(event.request);
      })
  );
});
