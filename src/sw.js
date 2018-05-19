importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

if (workbox) {
  // Cache visited restaurant pages
  workbox.routing.registerRoute(
    new RegExp('restaurant.html(.*)'),
    workbox.strategies.networkFirst({
      cacheName: 'restaurant-pages'
    })
  );

  // Cache Google Fonts
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

  // Cache restaurants requests
  workbox.routing.registerRoute(
    new RegExp('http://(.*)restaurants'),
    workbox.strategies.networkFirst()
  );

  // Cache Google Maps requests
  workbox.routing.registerRoute(
    new RegExp('https://maps.googleapis.com/maps/api/(.*)'),
    workbox.strategies.networkFirst()
  );

  // Cache requested images
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

  // Cache js, css and json files
  workbox.routing.registerRoute(
    /\.(?:js|css|json)$/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'static-resources'
    })
  );

  // Precache static html files
  workbox.precaching.precacheAndRoute([
    'index.html',
    'restaurant.html'
  ]);
} else {
  console.log(`Can't load Workbox :(`);
}
