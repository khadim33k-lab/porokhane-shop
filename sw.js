// Service Worker — Porokhane Shop
// Cache les ressources pour un chargement instantané

const CACHE_NAME = 'porokhane-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
]

// Installation — mise en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activation — nettoyage anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — stratégie Network First avec fallback cache
self.addEventListener('fetch', event => {
  // Ignorer les requêtes Supabase (toujours en réseau)
  if (event.request.url.includes('supabase.co')) return

  // Ignorer les méthodes non-GET
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache la réponse fraîche
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone)
        })
        return response
      })
      .catch(() => {
        // Hors ligne → utiliser le cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('/'))
      })
  )
})