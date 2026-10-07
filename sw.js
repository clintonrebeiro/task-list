const CACHE="workinv-v1";
const ASSETS=["index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  // never cache GitHub API calls
  if(url.hostname==="api.github.com"){ return; }
  // network-first for the app shell so updates arrive; fall back to cache offline
  if(e.request.mode==="navigate" || ASSETS.some(a=>url.pathname.endsWith(a))){
    e.respondWith(fetch(e.request).then(r=>{
      const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
    }).catch(()=>caches.match(e.request).then(m=>m||caches.match("index.html"))));
    return;
  }
});
