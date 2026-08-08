// Stacks — service worker
// Caches the app shell (HTML/CSS/JS/icons + the PDF.js library) so the app
// opens and works offline after the first visit. All book data itself lives
// in IndexedDB on the device, never here and never on a server.

// Bump this whenever the app shell changes.  The previous cache-first v1
// strategy kept installed PWAs on an old index.html, so newer reader controls
// (including the Original/Reflow switch) never reached those clients.
const CACHE = "stacks-shell-v2";

const SHELL_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        SHELL_URLS.map((url) =>
          cache.add(url).catch(() => {
            /* ignore individual failures (e.g. first install offline) */
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // The document must be refreshed from the network whenever possible. This
  // lets an already-installed PWA receive UI and behaviour fixes; the cached
  // document remains the offline fallback.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      // Cache-first for the shell/library assets: instant load, refreshed in background.
      return cached || fetchPromise;
    })
  );
});
