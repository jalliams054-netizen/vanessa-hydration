import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'vanessa-hydra:fonts',
    plugins: [new ExpirationPlugin({ maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  }),
)

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'vanessa-hydra:font-styles' }),
)

self.skipWaiting()
clientsClaim()

self.addEventListener('notificationclick', (event) => {
  // Only the "+250 ml" action logs. Dismissing or tapping "Later" must never
  // write intake, and the body click just brings the app to the front.
  const ml = event.action === 'log250' ? 250 : null
  event.notification.close()

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const target = clients.find((client) => 'focus' in client)
      if (target) {
        if (ml) target.postMessage({ type: 'quick-log', ml })
        return target.focus()
      }
      // Relative to the SW scope so this survives a /repo/ subpath on Pages.
      return self.clients.openWindow(new URL(ml ? `?action=log&ml=${ml}` : '', self.registration.scope))
    })(),
  )
})
