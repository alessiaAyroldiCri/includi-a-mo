const CACHE_NAME = 'includiamo-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/api-handler.js',
  './js/quiz-engine.js',
  './favicon.ico',
  './manifest.json',
  './assets/logo/logo.png',
  './assets/icone/genere.png',
  './assets/icone/LGBTQ.png',
  './assets/icone/multiculturalita.png',
  './assets/icone/neurodiverista.png',
  // Video assets per offline
  './assets/video/video1-parte1.mp4',
  './assets/video/video1-parte2.mp4',
  './assets/video/video2-parte1.mp4',
  './assets/video/video2-parte2.mp4',
  './assets/video/freeze1.jpeg',
  './assets/video/freeze2.jpeg'
];

// Installazione: salvataggio file nella cache e attivazione immediata
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS_TO_CACHE);
    await self.skipWaiting();
  })());
});

// Attivazione e pulizia vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keyList = await caches.keys();
    await Promise.all(keyList.map((key) => {
      if (key !== CACHE_NAME) {
        return caches.delete(key);
      }
      return Promise.resolve();
    }));
    await self.clients.claim();
  })());
});

// Intercettazione richieste: prima rete, poi cache come fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith((async () => {
    try {
      const networkResponse = await fetch(event.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, networkResponse.clone());
      return networkResponse;
    } catch (err) {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;
      throw err;
    }
  })());
});