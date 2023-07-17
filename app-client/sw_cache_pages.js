//==============================================================================
/**
* @file This File defines the central consumer application's offline behavior.
*
* @see   {@link https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker|PWA Dokumentation}
*
* @author       Hebrus
*
* @see {@link ConsumerApp} - The AppEditor namespace.
*/

const cacheName = 'v0';

const cacheAssets = [
  'favicon.ico',
  'home.html',
  'script.js',
  'analytics.js',
  'style.css',
  'manifest.json',
  'assets/de.png',
  'assets/en.png',
  'assets/interreg.png',
  'assets/pccr.png',
  'assets/visit.png',
  'templates/admission/basic.layout.html',
  'templates/appmeta/basic.layout.html',
  'templates/event/basic.layout.html',
  'templates/hours/basic.layout.html',
  'templates/info/basic.layout.html',
  'templates/legal/basic.layout.html',
  'templates/object/full.layout.html',
  'templates/object/image.layout.html',
  'templates/object/info.layout.html',
  'templates/object/text.layout.html',
  'templates/person/basic.layout.html',
  'templates/person/image.layout.html',
  'templates/place/basic.layout.html',
  'templates/question/image.layout.html',
  'templates/question/text.layout.html',
  'templates/quiz/basic.layout.html',
  'templates/room/indoor.layout.html',
  'templates/room/outdoor.layout.html',
  'templates/text/basic.layout.html'
];

// Call Install Event
self.addEventListener('install', (e) =>{
  console.log('Service worker: Installed');

  e.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Call Activate Event
self.addEventListener('activate', (e) =>{
  console.log('Service worker: Activated');
  // Remove old caches
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if(cache != cacheName){
            console.log('Service Worker: Clar Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
      .then(() => self.skipWaiting())
  );
});

// Call Fetch Event
self.addEventListener('fetch', e => {
  console.log('Service Worker: Fetching...', e.request.url);
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});
