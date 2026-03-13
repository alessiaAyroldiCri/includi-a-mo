const CACHE_NAME = 'includiamo-v1';
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
  './assets/icone/LGBT+.png',
  './assets/icone/multiculturalita.png',
  './assets/icone/neurodiverista.png'
];

// Installazione: salvataggio file nella cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Attivazione e pulizia vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Intercettazione richieste: se offline, usa la cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});