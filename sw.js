/* 小童軍集會助手 — Service Worker (offline first) © Scout System */
var CACHE='ghub-v2-8-0';
var ASSETS=['./','./index.html','./manifest.webmanifest','./css/app.css','./js/data.js','./js/guide.js','./js/craft.js','./js/tpls.js','./js/app.js','./js/prepare.js','./js/print.js','./js/lead.js','./js/track.js','./js/handbook.js','./js/play.js','./js/kit.js','./js/venue.js','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(function(hit){
      if(hit)return hit;
      return fetch(e.request).then(function(res){
        var copy=res.clone();
        caches.open(CACHE).then(function(c){try{c.put(e.request,copy)}catch(_){}});
        return res;
      }).catch(function(){return caches.match('./index.html')});
    })
  );
});
