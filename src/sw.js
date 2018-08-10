self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('rvp').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/runtime.js',
        '/polyfills.js',
        '/scripts.js',
        '/styles.css',
        '/main.js',
        '/assets/img/rv_animation.gif',
        '/ionicons.ttf?v=2.0.0',
        '/ionicons.woff?v=2.0.0',
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
