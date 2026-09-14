/* 小童軍集會助手 — Service Worker © Scout System
   策略：程式碼檔（html/js/manifest）網絡優先——有信号就即刻用最新版，离线先落到快取；
   其餘（css/圖片）快取優先（離線快）。每次改完上載，用戶下一次開 app 就會見到新版。 */
var CACHE='ghub-v5-0-0-brand';
var ASSETS=['./','./index.html','./manifest.webmanifest','./css/app.css','./js/data.js','./js/guide.js','./js/craft.js','./js/sheets.js','./js/tpls.js','./js/app.js','./js/flow.js','./js/prepare.js','./js/print.js','./js/pack.js','./js/lead.js','./js/img.js','./js/track.js','./js/handbook.js','./js/play.js','./js/kit.js','./js/venue.js','./js/chute.js','./js/song.js','./js/tools.js','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-48.png','./icons/icon-512-maskable.png','./icons/apple-touch-icon.png','./icons/favicon-64.png','./icons/gh-icons.svg','./img/ghmeeting_mascot.png','./img/c-any.avif','./img/c-boat.avif','./img/c-card.avif','./img/c-decor.avif','./img/c-egg.avif','./img/c-frame.avif','./img/c-fu.avif','./img/c-junk.avif','./img/c-lantern.avif','./img/c-mask.avif','./img/c-mural.avif','./img/c-nametag.avif','./img/c-plane.avif','./img/c-popup.avif','./img/c-portrait.avif','./img/c-promise.avif','./img/chute-close.avif','./img/chute-steps.avif','./img/chute-top.avif','./img/g-ball.avif','./img/g-body.avif','./img/g-corners.avif','./img/g-faces.avif','./img/g-food.avif','./img/g-grid.avif','./img/g-judge.avif','./img/g-recycle.avif','./img/g-leader.avif','./img/g-salute.avif','./img/g-throw.avif','./img/g-traffic.avif','./img/g-wash.avif','./img/z1-wave.avif','./img/z10-flag.avif','./img/z11-merry.avif','./img/z12-cake.avif','./img/z13-shoes.avif','./img/z14-wind.avif','./img/z15-pole.avif','./img/z16-team.avif','./img/z2-typhoon.avif','./img/z3-yurt.avif','./img/z4-bubble.avif','./img/z5-swap.avif','./img/z6-tunnel.avif','./img/z7-net.avif','./img/z8-jump.avif','./img/z9-quiet.avif'];
function isCode(u){
  return (u.pathname.endsWith('.html')||u.pathname.endsWith('.js')||u.pathname.endsWith('.webmanifest')||u.pathname==='/');
}
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(isCode(u)){
    /* 網絡優先：永遠攞最新程式碼；离线／失败先落快取 */
    e.respondWith(fetch(e.request).then(function(res){
      var copy=res.clone();
      caches.open(CACHE).then(function(c){try{c.put(e.request,copy)}catch(_){}});
      return res;
    }).catch(function(){
      return caches.match(e.request,{ignoreSearch:true}).then(function(hit){
        return hit||caches.match('./index.html');
      });
    }));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(hit){
    if(hit)return hit;
    return fetch(e.request).then(function(res){
      var copy=res.clone();
      caches.open(CACHE).then(function(c){try{c.put(e.request,copy)}catch(_){}});
      return res;
    }).catch(function(){return caches.match('./index.html')});
  }));
});
