const ADMIN_CACHE = 'docupdf-admin-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ADMIN_CACHE).then((cache) =>
      cache.addAll([
        '/admin/',
        '/admin/index.html',
        '/admin/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== ADMIN_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(ADMIN_CACHE).then((cache) => cache.put(request, clone));
      }
      return res;
    }).catch(() => caches.match('/admin/'))
    )
  );
});
