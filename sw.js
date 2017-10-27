self.addEventListener('install',function(event){
    console.log('[Service worker] Installing Service worker ... ', event);
})

self.addEventListener('activate',function(event){
    console.log('[Service worker] Activating Service worker ... ', event);
    return self.clients.claim();
});

self.addEventListener('fetch',function(event){
    console.log('[Service worker] Fetching Service worker ... ', event);
    event.respondWith(fetch(event.request));
});