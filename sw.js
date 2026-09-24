/* Rautakirja – palvelutyöntekijä.
   Sivu ladataan verkosta kun se on saatavilla, muuten välimuistista.
   Nosta CACHE-versiota aina kun index.html muuttuu. */
const CACHE = "rautakirja-v11";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Sivu: verkko ensin lyhyellä aikakatkaisulla, sitten välimuisti.
   Näin saat päivitykset kotona mutta appi aukeaa salilla ilman verkkoa. */
function networkFirst(req, timeoutMs){
  return new Promise(resolve => {
    let done = false;
    const fallback = () => caches.match(req, {ignoreSearch: true})
      .then(hit => hit || caches.match("./index.html"))
      .then(hit => resolve(hit || Response.error()));
    const timer = setTimeout(() => { if(!done){ done = true; fallback(); } }, timeoutMs);
    fetch(req).then(res => {
      if(done) return;
      /* Vain onnistunut vastaus saa mennä välimuistiin. Ilman tätä
         palvelimen 404 tai virhesivu jäisi pysyvästi tarjolle. */
      if(!res || !res.ok){
        done = true; clearTimeout(timer);
        caches.match("./index.html").then(hit => resolve(hit || res));
        return;
      }
      done = true; clearTimeout(timer);
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      resolve(res);
    }).catch(() => { if(!done){ done = true; clearTimeout(timer); fallback(); } });
  });
}

/* Fontit ja muut staattiset: välimuisti ensin, haetaan kerran verkosta. */
function cacheFirst(req){
  return caches.match(req).then(hit => hit || fetch(req).then(res => {
    if(res && (res.ok || res.type === "opaque") && res.status !== 404){
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
    }
    return res;
  }));
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);

  if(req.mode === "navigate"){ e.respondWith(networkFirst(req, 2500)); return; }
  if(url.origin === self.location.origin){ e.respondWith(cacheFirst(req)); return; }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){ e.respondWith(cacheFirst(req)); return; }
});
