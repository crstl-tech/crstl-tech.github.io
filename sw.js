self.addEventListener('install', e=>{
    e.waitUntil(
        caches.open('music-cache-v1').then(cache=>{
            const urlsToCache = ['index.html', 'music.json'];
            return Promise.all(urlsToCache.map(url =>
                cache.add(url).catch(err => console.warn('Не удалось закешировать:', url))
            ));
        })
    );
});

self.addEventListener('fetch', e=>{
    e.respondWith(
        caches.match(e.request).then(r=>r||fetch(e.request))
    );
});
