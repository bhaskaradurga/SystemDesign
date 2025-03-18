const Version = "demo/v3"; // Change this every update
const cacheFiles = ["./index.html", "./Script.js", "./sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(Version).then((cache) => {
      console.log("New cache installed:", Version);
      return cache.addAll(cacheFiles);
    })
  );
  self.skipWaiting(); // Force activation
});

// Clean up old caches on activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== Version) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Immediately take control
});

// Fetch and update cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(Version).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
