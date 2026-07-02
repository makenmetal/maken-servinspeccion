/* MAKEN · Inspección y Liberación — Service Worker
   Estrategia RED-PRIMERO: con internet siempre baja lo más nuevo;
   sin internet usa lo último guardado. Sube el número de versión al cambiar archivos. */
const CACHE = 'maken-insp-v8';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
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
  // Solo archivos propios (mismo origen) y GET. Apps Script (otro origen/POST) va directo a la red.
  if (req.method === 'GET' && url.origin === location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
  }
});
