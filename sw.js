const sw = self;
const CACHE = 'absolute-cas-1.0.0-mwk8uioe';
const HEAVY = /\/(pyodide|py\/wheels|mathlive|_next\/static|icons)\//;
sw.addEventListener('install', (event) => {
    event.waitUntil(caches
        .open(CACHE)
        .then((cache) => cache.addAll([sw.registration.scope]))
        .then(() => sw.skipWaiting()));
});
sw.addEventListener('activate', (event) => {
    event.waitUntil(caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key.startsWith('absolute-cas-') && key !== CACHE).map((key) => caches.delete(key))))
        .then(() => sw.clients.claim()));
});
const cacheFirst = async (request) => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(request);
    if (hit)
        return hit;
    const response = await fetch(request);
    if (response.ok)
        void cache.put(request, response.clone());
    return response;
};
const networkFirst = async (request) => {
    const cache = await caches.open(CACHE);
    try {
        const response = await fetch(request);
        if (response.ok)
            void cache.put(request, response.clone());
        return response;
    }
    catch (error) {
        const hit = (await cache.match(request)) ?? (request.mode === 'navigate' ? await cache.match(sw.registration.scope) : undefined);
        if (hit)
            return hit;
        throw error;
    }
};
sw.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== location.origin)
        return;
    event.respondWith(HEAVY.test(new URL(request.url).pathname) ? cacheFirst(request) : networkFirst(request));
});
