const CACHE = 'lectio-v1';
const CORE = ['/', '/quotes.json', '/archive', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Don't cache APIs or OG images
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/og/')) return;
  e.respondWith(
    caches
      .match(e.request)
      .then(
        (hit) =>
          hit ||
          fetch(e.request)
            .then((res) => {
              const clone = res.clone();
              caches
                .open(CACHE)
                .then((c) => c.put(e.request, clone))
                .catch(() => {});
              return res;
            })
            .catch(() => caches.match('/'))
      )
  );
});

