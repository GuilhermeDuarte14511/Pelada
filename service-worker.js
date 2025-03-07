const CACHE_NAME = "pelada-cache-v1";
const urlsToCache = [
    "index.html",
    "style.css",
    "script.js",
    "assets/bootstrap/css/bootstrap.min.css",
    "assets/bootstrap/js/bootstrap.bundle.min.js",
    "assets/FontAwesome/css/all.min.css",
    "assets/FontAwesome/js/all.min.js",
    "assets/icons/iconsPelada.jpg"
];

// Instalar o Service Worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Ativar o Service Worker
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Buscar no Cache
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
