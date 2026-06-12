/* NULA service worker — app shell offline cache */
const V='nula-v1';
const SHELL=['.','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
/* runtime cache samo za fontove i firebase ESM bundle — NIKAD za Firestore API */
const RUNTIME=/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com\/firebasejs)/;

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  /* navigacija/index: network-first (update se propagira), cache fallback (offline) */
  if(e.request.mode==='navigate'||(u.origin===location.origin&&u.pathname.endsWith('index.html'))){
    e.respondWith(
      fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r;})
        .catch(()=>caches.match(e.request).then(r=>r||caches.match('.'))));
    return;
  }
  /* shell + dozvoljeni runtime: cache-first */
  if(u.origin===location.origin||RUNTIME.test(e.request.url)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));}
      return res;})));
  }
});
