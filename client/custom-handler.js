self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(() => {
      caches.open('audio-cache').then(cache => {
        return cache.match(event.request).then(function(response) {
          // Cache hit - return the response from the cached version
          if (response) {
            return response;
          }
          throw Error('The cached response that was expected is missing.');
        });
      });
    })
  );
});
