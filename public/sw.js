const CACHE = 'shastra-v5'
// trailingSlash:true means static export generates /offline/index.html → URL is /offline/
const OFFLINE_URL = '/offline/'

const PRECACHE = [
  '/',
  '/dashboard/',
  '/offline/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Oracle card images — needed for offline use on the Oracle tab
  '/images/oracle/lotus.svg',
  '/images/oracle/om.svg',
  '/images/oracle/diya.svg',
  '/images/oracle/chakra.svg',
  '/images/oracle/mandala.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return

  // Navigation requests (HTML pages) → network-first so users always get the
  // latest app shell; fall back to cache only when offline.
  // Asset requests (JS/CSS/images) → cache-first for speed.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone()
            caches.open(CACHE).then((cache) => cache.put(event.request, clone).catch(() => {}))
          }
          return response
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
    )
    return
  }

  // Assets — cache-first, update cache in background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone).catch(() => {}))
        }
        return response
      }).catch(() => cached || new Response('Offline', { status: 503 }))
      return cached || fetchPromise
    })
  )
})

// SW update: notify clients when a new version is waiting
self.addEventListener('message', (event) => {
  // Only accept messages from the same origin
  if (event.origin && event.origin !== self.location.origin) return
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
