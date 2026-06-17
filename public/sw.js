// Minimal service worker for an installable, offline-capable PWA shell.
// The app's data lives in LocalStorage, so we only need to cache the app shell.
const CACHE = 'habits-shell-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-first for navigations so deploys aren't stale; fall back to cache offline.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }

  // Cache-first for everything else.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
