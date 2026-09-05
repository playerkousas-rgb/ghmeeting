/* 小童軍集會助手 — Service Worker (offline first) © Scout System */
var CACHE='ghub-v3-4-0';
var ASSETS=['./','./index.html','./manifest.webmanifest','./css/app.css','./js/data.js','./js/guide.js','./js/craft.js','./js/sheets.js','./js/tpls.js','./js/app.js','./js/prepare.js','./js/print.js','./js/pack.js','./js/lead.js','./js/img.js','./js/track.js','./js/handbook.js','./js/play.js','./js/kit.js','./js/venue.js','./icons/icon-192.png','./icons/icon-512.png','./img/c-any.jpg','./img/c-boat.jpg','./img/c-card.jpg','./img/c-decor.jpg','./img/c-egg.jpg','./img/c-frame.jpg','./img/c-fu.jpg','./img/c-junk.jpg','./img/c-lantern.jpg','./img/c-mask.jpg','./img/c-mural.jpg','./img/c-nametag.jpg','./img/c-plane.jpg','./img/c-popup.jpg','./img/c-portrait.jpg','./img/c-promise.jpg','./img/chute-steps.jpg','./img/chute-top.jpg','./img/g-ball.jpg','./img/g-body.jpg','./img/g-corners.jpg','./img/g-faces.jpg','./img/g-grid.jpg','./img/g-leader.jpg','./img/g-salute.jpg','./img/g-throw.jpg','./img/g-traffic.jpg','./img/g-wash.jpg'];
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
