const CACHE_NAME = 'ufsm-digital-v1';
const APP_SHELL = [
    './',
    './index.html',
    './home.html',
    './carteira.html',
    './configuracoes.html',
    './manifest.webmanifest',
    './assets/js/conta.js',
    './assets/js/pwa.js',
    './assets/images/Logo-UFSM.png',
    './assets/images/Logo-UFSM-branco.png',
    './assets/images/icon-192.png',
    './assets/images/icon-512.png',
    './assets/images/icon-512-maskable.png',
    './assets/images/apple-touch-icon.png',
    './assets/images/avatar-placeholder.svg',
    './assets/images/qr-placeholder.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );

    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    const isSameOrigin = requestUrl.origin === self.location.origin;

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return response;
                })
                .catch(async () => {
                    const cachedPage = await caches.match(event.request);
                    return cachedPage || caches.match('./home.html');
                })
        );

        return;
    }

    if (!isSameOrigin) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(event.request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            });
        })
    );
});
