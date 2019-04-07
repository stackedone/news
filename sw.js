// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const SHELL_CACHE = 'shell-cache-v1'
const RUNTIME = 'runtime'

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  './',
  './main.css',
  './app.js'
]

// The install handler takes care of pre caching the resources we always need.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting()))
})

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', e => {
  const currentCaches = [SHELL_CACHE, RUNTIME]
  e.waitUntil(
      caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName))
      }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete)
        }))
      }).then(() => self.clients.claim())
  )
})

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', e => {
  // Skip cross-origin requests, like those for Google Analytics.
  // if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(caches.match(e.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('return cached response')
            return cachedResponse
          }

          return caches.open(RUNTIME).then(cache => {
            return fetch(e.request).then(response => {
              // Put a copy of the response in the runtime cache.
              return cache.put(e.request, response.clone()).then(() => {
                console.log(cache)
                return response
              })
            })
          })
        })
    )
  // }
})