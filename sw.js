/* 小童軍集會助手 — Service Worker © SCOUT SYSTEM 2026
   策略：程式碼檔（html/js/manifest）網絡優先；其餘（css/圖片）快取優先。
   UP1：更新唔會偷換版——只有首次安裝先 skipWaiting；之後等頁面「立即更新」送 SKIP_WAITING。
   F：只快取 res.ok 嘅回應，503/404 唔會毒化離線快取。 */
var CACHE='ghub-v5-4-0-unofficial';
/* 安裝包＝程式碼＋圖示（細）第一次開就預快取；大圖喺背景補。 */
var ASSETS=[
  './','./index.html','./manifest.webmanifest','./css/app.css','./js/data.js','./js/guide.js',
  './js/craft.js','./js/sheets.js','./js/tpls.js','./js/app.js','./js/pwa.js','./js/flow.js','./js/prepare.js',
  './js/print.js','./js/pack.js','./js/lead.js','./js/img.js','./js/track.js','./js/handbook.js',
  './js/play.js','./js/kit.js','./js/venue.js','./js/chute.js','./js/song.js','./js/tools.js',
  './icons/favicon.ico','./icons/favicon-16.png','./icons/favicon-32.png','./icons/favicon-64.png',
  './icons/icon-192.png','./icons/icon-512.png','./icons/icon-48.png',
  './icons/icon-maskable-192.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png','./icons/og-image.png',
  './icons/gh-icons.svg'
];
var CACHE_EXTRA=[
  './img/ghmeeting_mascot.webp','./img/c-any.avif','./img/c-boat.avif','./img/c-card.avif','./img/c-decor.avif','./img/c-egg.avif',
  './img/c-frame.avif','./img/c-fu.avif','./img/c-junk.avif','./img/c-lantern.avif','./img/c-mask.avif','./img/c-mural.avif',
  './img/c-nametag.avif','./img/c-plane.avif','./img/c-popup.avif','./img/c-portrait.avif','./img/c-promise.avif','./img/chute-close.avif',
  './img/chute-steps.avif','./img/chute-top.avif','./img/g-ball.avif','./img/g-body.avif','./img/g-corners.avif','./img/g-faces.avif',
  './img/g-food.avif','./img/g-grid.avif','./img/g-judge.avif','./img/g-recycle.avif','./img/g-leader.avif','./img/g-salute.avif',
  './img/g-throw.avif','./img/g-traffic.avif','./img/g-wash.avif','./img/z1-wave.avif','./img/z10-flag.avif','./img/z11-merry.avif',
  './img/z12-cake.avif','./img/z13-shoes.avif','./img/z14-wind.avif','./img/z15-pole.avif','./img/z16-team.avif','./img/z2-typhoon.avif',
  './img/z3-yurt.avif','./img/z4-bubble.avif','./img/z5-swap.avif','./img/z6-tunnel.avif','./img/z7-net.avif','./img/z8-jump.avif',
  './img/z9-quiet.avif'
];
function isCode(u){
  return (u.pathname.endsWith('.html')||u.pathname.endsWith('.js')||u.pathname.endsWith('.webmanifest')||u.pathname==='/');
}
function putIfOk(cache,request,res){
  if(res&&res.ok){try{cache.put(request,res.clone())}catch(_){}}
  return res;
}
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){
    /* 首次安裝（冇 active worker）先即刻接手；更新則留喺 waiting 等用戶決定 */
    if(!self.registration.active)return self.skipWaiting();
  }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k.indexOf('ghub-')===0&&k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
/* 背景補大圖：逐張 add，任何一張 404/503 都唔會拖死其餘，亦唔會快取錯誤頁。 */
function fillExtra(){
  return caches.open(CACHE).then(function(c){
    return CACHE_EXTRA.reduce(function(p,u){
      return p.then(function(){
        return c.match(u,{ignoreSearch:true}).then(function(hit){
          if(hit)return;
          return fetch(u).then(function(res){if(res&&res.ok)return c.put(u,res)}).catch(function(){});
        });
      });
    },Promise.resolve());
  });
}
self.addEventListener('message',function(e){
  if(!e.data)return;
  if(e.data.t==='precache-extra'&&e.waitUntil)e.waitUntil(fillExtra());
  if(e.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(isCode(u)){
    /* 網絡優先：只快取成功回應；離線先落快取 */
    e.respondWith(fetch(e.request).then(function(res){
      return caches.open(CACHE).then(function(c){return putIfOk(c,e.request,res)});
    }).catch(function(){
      return caches.match(e.request,{ignoreSearch:true}).then(function(hit){
        if(hit)return hit;
        /* SPA fallback only for document navigation; never answer a missing JS file with HTML. */
        if(e.request.mode==='navigate'||u.pathname==='/'||u.pathname.endsWith('.html'))return caches.match('./index.html');
        return new Response('',{status:504,statusText:'Offline'});
      });
    }));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(hit){
    if(hit)return hit;
    return fetch(e.request).then(function(res){
      return caches.open(CACHE).then(function(c){return putIfOk(c,e.request,res)});
    }).catch(function(){
      if(e.request.mode==='navigate')return caches.match('./index.html');
      return new Response('',{status:504,statusText:'Offline'});
    });
  }));
});
