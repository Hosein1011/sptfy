/**
 * Melora Progressive Web App (PWA) Service Worker
 * Production-ready caching strategy designed for Next.js App Router and music streaming.
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE_NAME = `melora-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `melora-runtime-${CACHE_VERSION}`;
const IMAGES_CACHE_NAME = `melora-images-${CACHE_VERSION}`;

// Pre-cached application shell assets
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Install: Cache critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        // Do not force skipWaiting automatically to prevent cutting off active user playback
        console.log('[Melora SW] Pre-cached app shell assets successfully.');
      })
      .catch((err) => {
        console.warn('[Melora SW] Pre-caching encountered an issue:', err);
      })
  );
});

// Activate: Clean up old caches & claim clients
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE_NAME, RUNTIME_CACHE_NAME, IMAGES_CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('melora-') && !currentCaches.includes(cacheName)) {
              console.log(`[Melora SW] Deleting obsolete cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message listener: Handle user-requested updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event listener with selective caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle same-origin or HTTP/HTTPS requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 2. CRITICAL AUDIO CONSIDERATION:
  // Bypass Service Worker completely for audio streams and range requests
  // Prevents memory exhaustion, quota exceeded errors, and broken audio seek/scrubbing
  const isAudioRequest =
    url.pathname.startsWith('/audio/') ||
    /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(url.pathname) ||
    request.headers.get('range') !== null ||
    request.destination === 'audio' ||
    request.destination === 'video';

  if (isAudioRequest) {
    // Pass straight to the network
    return;
  }

  // 3. MUTATIONS & AUTHENTICATION:
  // Never cache mutation requests (POST/PUT/PATCH/DELETE) or auth endpoints to protect credentials
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/auth/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('token')
  ) {
    return;
  }

  // 4. NEXT.JS IMMUTABLE STATIC ASSETS & ICONS (Cache-First)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(woff|woff2|ttf|eot)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. IMAGES & COVERS (Stale-While-Revalidate)
  if (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(IMAGES_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 6. API GET ENDPOINTS (Network-First with graceful offline response)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(async () => {
          // If offline, return a safe fallback JSON response instead of crashing fetch callers
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'You are currently offline. Please check your internet connection.',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // 7. NAVIGATION / HTML PAGES (Network-First with Cached / Offline Fallback)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Try matched page from runtime cache
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          // Fallback to offline page
          const offlinePage = await caches.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }
          // Fallback to cached home shell
          const homePage = await caches.match('/');
          if (homePage) {
            return homePage;
          }
          return new Response('Network error occurred and no offline cache is available.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // 8. DEFAULT (Network-first with runtime cache fallback)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
