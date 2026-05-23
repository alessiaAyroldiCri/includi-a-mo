const CACHE_NAME = 'includiamo-v6';
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
  './assets/video/video2-parte2.mp4'
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

// Intercettazione richieste: cache-first per video, network-first per il resto
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Cache-first per i video (così rimangono disponibili offline)
  if (url.pathname.includes('/assets/video/')) {
    event.respondWith((async () => {
      try {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // Se non in cache, prova network e cachea
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        console.warn('Video non disponibile:', url.pathname, err);
        // Se offline e niente in cache, ritorna una risposta vuota senza errore
        return new Response('', {
          status: 204,
          statusText: 'No Content - Offline'
        });
      }
    })());
    return;
  }

  // Network-first per il resto (HTML, CSS, JS, immagini) con fallback a cache
  event.respondWith((async () => {
    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    } catch (err) {
      // Se network fallisce, prova la cache
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;
      
      // Se nemmeno la cache ha il file, ritorna una risposta di fallback
      if (url.pathname.endsWith('.html')) {
        return new Response('Offline - Pagina non disponibile', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      throw err;
    }
  })());
});