// Bump VERSION whenever any cached file changes so devices fetch fresh copies.
// Caches are namespaced with PREFIX so this app never clears another app's cache on the shared github.io origin.
const PREFIX = 'blitz-theory-all-';
const VERSION = PREFIX + 'v30';
const ASSETS = ['./','./index.html','./glyphs.js','./theory.js','./engrave.js','./gen.js','./refs.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png',
  './aural/index.html','./aural/audio.js','./aural/samples.js','./aural/engrave.js','./aural/content.js','./aural/refs.js','./aural/glyphs.js','./aural/embed.js','./aural/samples/cello_C3.mp3','./aural/samples/cello_G3.mp3','./aural/samples/clarinet_As4.mp3','./aural/samples/clarinet_D4.mp3','./aural/samples/flute_C5.mp3','./aural/samples/flute_E5.mp3','./aural/samples/guitar_B3.mp3','./aural/samples/guitar_E3.mp3','./aural/samples/piano_A2.mp3','./aural/samples/piano_A3.mp3','./aural/samples/piano_A4.mp3','./aural/samples/piano_A5.mp3','./aural/samples/piano_C2.mp3','./aural/samples/piano_C3.mp3','./aural/samples/piano_C4.mp3','./aural/samples/piano_C5.mp3','./aural/samples/piano_C6.mp3','./aural/samples/piano_Ds2.mp3','./aural/samples/piano_Ds3.mp3','./aural/samples/piano_Ds4.mp3','./aural/samples/piano_Ds5.mp3','./aural/samples/piano_Fs2.mp3','./aural/samples/piano_Fs3.mp3','./aural/samples/piano_Fs4.mp3','./aural/samples/piano_Fs5.mp3','./aural/samples/saxophone_C4.mp3','./aural/samples/saxophone_G4.mp3','./aural/samples/trombone_C3.mp3','./aural/samples/trombone_F3.mp3','./aural/samples/trumpet_C4.mp3','./aural/samples/trumpet_G4.mp3','./aural/samples/violin_A4.mp3','./aural/samples/violin_E5.mp3','./aural/samples/xylophone_C6.mp3','./aural/samples/xylophone_G5.mp3','./embed.js','./qr.js','./task.js','./aural/qr.js','./aural/task.js','./testkit.js','./aural/testkit.js','./blitzui.js','./aural/blitzui.js','./aural/live.js'];
// Install: fetch every file fresh from the server (never from the browser's HTTP cache), so one version is cached as a set.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
// Pages and scripts: network first (always the newest matching set when online), cached copy when offline or the network stalls.
// Audio samples: cache first (they never change).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const key = url.origin + url.pathname;
  if (/\.mp3$/i.test(url.pathname)) {
    e.respondWith(caches.match(key, { ignoreSearch: true }).then(r => r || fetch(req).then(res => { if (res && res.ok && res.status === 200) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(key, copy)).catch(() => {}); } return res; })));
    return;
  }
  e.respondWith(new Promise(resolve => {
    let done = false;
    const fromCache = () => caches.match(key, { ignoreSearch: true }).then(r => r || caches.match(req, { ignoreSearch: true }));
    const timer = setTimeout(() => { fromCache().then(r => { if (r && !done) { done = true; resolve(r); } }); }, 6000);
    fetch(new Request(url.href, { cache: 'no-cache', credentials: 'same-origin' })).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(key, copy)).catch(() => {}); }
      if (!done) { done = true; clearTimeout(timer); resolve(res); }
    }).catch(() => fromCache().then(r => { if (!done) { done = true; clearTimeout(timer); resolve(r || Response.error()); } }));
  }));
});
