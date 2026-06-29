/* MAKEN · Inspección y Liberación — Service Worker
   Guarda la página en el teléfono para que abra SIN INTERNET.
   Para forzar una actualización tras cambiar index.html, sube el número de versión. */
const CACHE = 'maken-insp-v3';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Solo manejamos archivos propios (mismo origen) y peticiones GET.
  // Todo lo que va a Google Apps Script (otro origen / POST) pasa directo a la red,
  // así la sincronización de datos nunca se sirve desde caché.
  if (req.method === 'GET' && url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(hit =>
        hit || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
  }
});
