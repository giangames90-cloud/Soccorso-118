const CACHE_NAME = "soccorso118-v3";

// Aggiungi qui ogni nuovo file content/*.json che crei,
// altrimenti non sarà disponibile offline
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./content/cardiovascolare.json",
  "./content/neurologico.json",
  "./content/metabolico-endocrino.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
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

// Strategia: network-first per i contenuti (così se aggiorni un JSON su
// GitHub lo vedi appena hai connessione), cache-first per il resto
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  if (url.includes("/content/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
