const CACHE_NAME = 'porokhane-v16'
const SHELL = ['/', '/index.html', '/manifest.json', '/images/porokhane-logo.webp']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )))
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const request = event.request
  const url = new URL(request.url)
  if (url.hostname.includes('supabase.co') || url.origin !== self.location.origin) return

  // Vite ne doit jamais être mis en cache pendant le développement local.
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@react-refresh')
  ) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      try {
        const response = await Promise.race([fetch(request), timeout])
        if (response?.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put('/index.html', response.clone())
        }
        return response
      } catch {
        return (await caches.match('/index.html')) || (await caches.match('/'))
      }
    })())
    return
  }

  const isCode = ['script', 'style', 'worker'].includes(request.destination)

  if (isCode) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
      return response
    }).catch(() => caches.match(request)))
    return
  }

  event.respondWith(caches.match(request).then(cached => {
    const network = fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
      return response
    }).catch(() => cached)
    return cached || network
  }))
})
