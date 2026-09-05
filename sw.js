/* 小童軍集會助手 — Service Worker (offline first) © Scout System */
var CACHE='ghub-v3-5-0';
var ASSETS=['./','./index.html','./manifest.webmanifest','./css/app.css','./js/data.js','./js/guide.js','./js/craft.js','./js/sheets.js','./js/tpls.js','./js/app.js','./js/prepare.js','./js/print.js','./js/pack.js','./js/lead.js','./js/img.js','./js/track.js','./js/handbook.js','./js/play.js','./js/kit.js','./js/venue.js','./icons/icon-192.png','./icons/icon-512.png','./img/c-any.avif','./img/c-boat.avif','./img/c-card.avif','./img/c-decor.avif','./img/c-egg.avif','./img/c-frame.avif','./img/c-fu.avif','./img/c-junk.avif','./img/c-lantern.avif','./img/c-mask.avif','./img/c-mural.avif','./img/c-nametag.avif','./img/c-plane.avif','./img/c-popup.avif','./img/c-portrait.avif','./img/c-promise.avif','./img/chute-steps.avif','./img/chute-top.avif','./img/g-ball.avif','./img/g-body.avif','./img/g-corners.avif','./img/g-faces.avif','./img/g-grid.avif','./img/g-leader.avif','./img/g-salute.avif','./img/g-throw.avif','./img/g-traffic.avif','./img/g-wash.avif'];
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
