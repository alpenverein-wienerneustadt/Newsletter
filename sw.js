// Minimaler Service Worker – vor allem nötig, damit Chrome/Android die Seite
// überhaupt als installierbare PWA erkennt. Cacht bewusst nichts Kritisches,
// damit Tourdaten und Login-Status immer live von Firebase kommen.

const CACHE_NAME = 'tourenportal-shell-v1';
const SHELL_FILES = [
  'dashboard.html',
  'login.html',
  'index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: immer versuchen, aktuelle Daten zu laden (Firestore, Auth-Status).
// Nur bei echtem Offline-Fall auf die gecachte Shell zurückfallen.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
