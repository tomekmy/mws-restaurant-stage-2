importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

if (workbox) {
  workbox.routing.registerRoute(
    new RegExp('restaurant.html(.*)'),
    workbox.strategies.networkFirst({
      cacheName: 'restaurant-pages'
    })
  );

  workbox.routing.registerRoute(
    new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    workbox.strategies.cacheFirst({
      cacheName: 'googleapis',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 30
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    new RegExp('https://maps.googleapis.com/maps/api/(.*)'),
    workbox.strategies.networkFirst()
  );

  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
    workbox.strategies.cacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /\.(?:js|css|json)$/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'static-resources'
    })
  );

  workbox.precaching.precacheAndRoute([
    '/index.html',
    '/restaurant.html'
  ]);
} else {
  console.log(`Can't load Workbox :(`);
}
