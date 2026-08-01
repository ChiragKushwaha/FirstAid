const CACHE_NAME = 'fieldaid-pwa-v3';

const STATIC_ASSETS = [
  '/',
  '/triage',
  '/cpr',
  '/dosage',
  '/protocols',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  /* All 20 protocol detail routes for complete offline availability */
  '/protocols/protocol_trauma_hemorrhage',
  '/protocols/protocol_cardiac_cpr_adult',
  '/protocols/protocol_cardiac_cpr_pediatric',
  '/protocols/protocol_airway_choking_adult',
  '/protocols/protocol_airway_choking_infant',
  '/protocols/protocol_environmental_anaphylaxis',
  '/protocols/protocol_trauma_burns',
  '/protocols/protocol_trauma_fractures',
  '/protocols/protocol_neurological_head_trauma',
  '/protocols/protocol_environmental_hypothermia',
  '/protocols/protocol_environmental_heatstroke',
  '/protocols/protocol_environmental_bites',
  '/protocols/protocol_neurological_seizure',
  '/protocols/protocol_respiratory_asthma',
  '/protocols/protocol_trauma_spinal',
  '/protocols/protocol_metabolic_diabetic',
  '/protocols/protocol_cardiac_stroke',
  '/protocols/protocol_respiratory_drowning',
  '/protocols/protocol_trauma_eye',
  '/protocols/protocol_trauma_amputation',
];

// Service Worker Installation: Pre-cache App Shell & All Routes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets for offline use');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial notice:', err);
      });
    })
  );
});

// Service Worker Activation: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Service Worker Fetch Handling
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass Service Worker caching on localhost/development to prevent Next.js HMR refresh loops
  const isDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (isDev && navigator.onLine) {
    return; // Pass through directly to dev server
  }

  // Handle HTML Page Navigation Requests (Network First -> Cache Fallback -> Offline Page)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;

          const offlinePage = await caches.match('/offline');
          if (offlinePage) return offlinePage;

          return new Response(
            '<!DOCTYPE html><html><head><title>FieldAid Offline</title></head><body style="background:#EDE8DB;color:#1A1510;text-align:center;padding:50px;font-family:sans-serif;"><h1>FieldAid Offline Mode</h1><p>You are offline. Pre-cached emergency protocols are accessible.</p><a href="/" style="color:#E87A3A;">Return to Home</a></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // Handle Static Assets (Cache First -> Network Fallback)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && url.origin === location.origin) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    })
  );
});
