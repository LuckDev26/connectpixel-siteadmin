const CACHE_NAME = "connectpixel-v38-pre-admin-safe";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/config.js",
  "/offline.html",
  "/assets/iconnew-192.png",
  "/assets/iconnew-512.png",
  "/assets/icon-maskable-512.png",
  "/assets/apple-touch-icon.png",
  "/assets/share2.jpg",
  "/assets/offline-image.svg",
  "/logo.png",
  "/favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // admin/api/content dynamic bypass
  const dynamicPath = new URL(event.request.url).pathname;
  if (
    dynamicPath.startsWith("/api/") ||
    dynamicPath.startsWith("/admin/") ||
    dynamicPath.startsWith("/content/")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  const request = event.request;
  const destination = request.destination;

  if (destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("/offline.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "error") return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          if (destination === "image") {
            return caches.match("/assets/offline-image.svg");
          }
          return caches.match("/offline.html");
        });
    })
  );
});
