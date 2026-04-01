self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("weldvision-mobile-x-v1").then((cache) =>
      cache.addAll(["/", "/assets/styles.css", "/assets/app.js", "/manifest.webmanifest"]),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});
