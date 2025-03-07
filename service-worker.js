const CACHE_NAME = "pelada-cache-v1";
const urlsToCache = [
    "index.html",
    "style.css",
    "script.js",
    "assets/bootstrap/css/bootstrap.min.css",
    "assets/bootstrap/js/bootstrap.bundle.min.js",
    "assets/FontAwesome/css/all.min.css",
    "assets/FontAwesome/js/all.min.js",
    "assets/icons/iconsPelada.jpg",
    "assets/icons/iconsPelada.jpg"
];

// Instala o Service Worker e armazena os arquivos em cache
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativa o Service Worker e remove caches antigos
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

// Intercepta as requisições e serve os arquivos do cache
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
