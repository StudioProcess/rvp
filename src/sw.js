self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('rvp').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/inline.bundle.js',
        '/polyfills.bundle.js',
        '/scripts.bundle.js',
        '/styles.bundle.css',
        '/vendor.bundle.js',
        '/main.bundle.js',
        '/assets/img/rv_animation.gif',
        '/ionicons.24712f6c47821394fba7.ttf',
        '/assets/img/rv-logo_1000px.png',
        '/assets/projects/default.rv'
      ]);
    })
  );
 });

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    }));
});
