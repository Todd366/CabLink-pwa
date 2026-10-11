// CabLink service worker.
// - App shell is cached on install so the app opens with no signal.
// - Static files: serve from cache, refresh in the background.
// - API calls are never cached (ride data must be live).
const VERSION = "cablink-v6";
const SHELL = [
    "/", "/index.html", "/manifest.json", "/app/css/app.css",
    "/app/js/main.js", "/app/js/store.js", "/app/js/api.js", "/app/js/i18n.js", "/app/js/ui.js",
    "/app/js/router.js", "/app/js/shell.js", "/app/js/places.js", "/app/js/fare.js",
    "/app/js/screens/welcome.js", "/app/js/screens/auth.js", "/app/js/screens/common.js",
    "/app/js/screens/rider.js", "/app/js/screens/driver.js", "/app/js/screens/account.js", "/app/js/screens/admin.js",
    "/app/icons/icon.svg", "/app/icons/icon-192.png", "/app/icons/icon-512.png"
];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
    const url = new URL(e.request.url);
    if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request).then(res => {
            if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
            return res;
        }).catch(() => hit || caches.match("/index.html"));
        return hit || net;
    }));
});

self.addEventListener("push", e => {
    let data = {};
    try { data = e.data ? e.data.json() : {}; } catch (err) { /* plain text */ }
    e.waitUntil(self.registration.showNotification(data.title || "CabLink", {
        body: data.body || "", tag: data.tag || "cablink", data: data.data || {},
        icon: "/app/icons/icon-192.png", badge: "/app/icons/icon-192.png"
    }));
});
self.addEventListener("notificationclick", e => {
    e.notification.close();
    e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => {
        for (const c of cs) if ("focus" in c) return c.focus();
        return self.clients.openWindow("/");
    }));
});
