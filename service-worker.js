const CACHE_NAME = "pelada-cache-v1";
const urlsToCache = [
    "./index.html",
    "./style.css",
    "./script.js",
    "./assets/bootstrap/css/bootstrap.min.css",
    "./assets/bootstrap/js/bootstrap.bundle.min.js",
    "./assets/FontAwesome/css/all.min.css",
    "./assets/FontAwesome/js/all.min.js",
    "./assets/icons/iconsPelada.jpg",
    "./assets/icons/favicon.ico"
];

// Instalar o Service Worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caminhos para o cache:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(error => console.error('Falha ao adicionar ao cache:', error))
    );
});

// Ativar o Service Worker
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
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
        caches.match(event.request).then(response => {
            if (response) {
                console.log('Servindo do cache:', event.request.url);
                return response;
            }
            console.log('Buscando na rede:', event.request.url);
            return fetch(event.request).catch(() => caches.match('./index.html'));
        })
    );
});
