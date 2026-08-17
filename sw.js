// CabLink Service Worker v2
const CACHE_NAME = 'cablink-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function() {
        // Non-fatal — cache what we can
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network first — fall back to cache
  if (e.request.url.includes('/api/')) return; // never cache API calls
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================

self.addEventListener('push', function(e) {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}

  const title = data.title || 'CabLink';
  const options = {
    body: data.body || '',
    tag: data.tag || 'cablink',
    data: data.data || {},
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
