self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('rvp').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        // '/inline.js',
        '/polyfills.js',
        '/scripts.js',
        '/styles.css',
        // '/vendor.js',
        '/main.js',
        '/assets/img/rv_animation.gif',
        '/ionicons.ttf',
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
