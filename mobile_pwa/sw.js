self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("welding-ai-mobile-v1").then((cache) => {
      return cache.addAll([
        "/mobile",
        "/mobile/assets/styles.css",
        "/mobile/assets/app.js",
        "/manifest.webmanifest",
      ]);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
