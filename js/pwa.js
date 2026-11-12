/* 🦗 pwa.js — 安裝入口＋版本更新（I1–I8／UP1–UP5）© SCOUT SYSTEM 2026
   原則：安裝要有掣、更新要問過人。本機資料只存 localStorage；更新重載前 flush 延遲寫入。 */
var PWA={
  reg:null,deferredInstallPrompt:null,dismissedWorker:null,waitingWorker:null,
  updateReloading:false,hadController:false,_checkTimer:null,
  isStandalone:function(){
    try{return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}catch(e){return false}
  },
  isIos:function(){
    var ua=navigator.userAgent||'';
    return /iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  },
  init:function(){
    var self=this;
    PWA.hadController=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
    var btn=document.getElementById('installAppButton');
    if(btn&&!PWA.isStandalone())btn.hidden=false;
    window.addEventListener('beforeinstallprompt',function(e){
      e.preventDefault();PWA.deferredInstallPrompt=e;
      if(btn&&!PWA.isStandalone())btn.hidden=false;
    });
    window.addEventListener('appinstalled',function(){
      PWA.deferredInstallPrompt=null;if(btn)btn.hidden=true;
      if(typeof toast==='function')toast('已加入主畫面 ✓');
    });
    if(window.matchMedia){
      var mq=window.matchMedia('(display-mode: standalone)');
      var sync=function(){if(btn)btn.hidden=PWA.isStandalone()};
      if(mq.addEventListener)mq.addEventListener('change',sync);else if(mq.addListener)mq.addListener(sync);
    }
    if(!('serviceWorker' in navigator))return;
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      if(PWA.updateReloading){location.reload();return}
      PWA.hadController=true; /* 首次安裝 clients.claim 唔觸發 reload */
    });
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(reg){
      PWA.reg=reg;
      if(reg.waiting)PWA.showWaiting(reg.waiting);
      reg.addEventListener('updatefound',function(){
        var nw=reg.installing;
        if(!nw)return;
        nw.addEventListener('statechange',function(){
          if(nw.state==='installed'&&navigator.serviceWorker.controller)PWA.showWaiting(nw);
        });
      });
      reg.update().catch(function(){});
      var fill=function(){
        var sw=reg.active||navigator.serviceWorker.controller;
        if(sw&&sw.postMessage)sw.postMessage({t:'precache-extra'});
      };
      if('requestIdleCallback' in window)requestIdleCallback(fill,{timeout:8000});else setTimeout(fill,3000);
    }).catch(function(err){
      if(typeof console!=='undefined')console.warn('SW register failed',err);
      if(typeof toast==='function')toast('⚠️ 離線快取註冊失敗—仍可線上使用，請檢查網絡');
    });
    document.addEventListener('visibilitychange',function(){if(!document.hidden)PWA.check()});
    window.addEventListener('online',function(){PWA.check()});
    PWA._checkTimer=setInterval(function(){PWA.check()},30*60*1000);
  },
  check:function(){if(PWA.reg)PWA.reg.update().catch(function(){})},
  showWaiting:function(worker){
    if(!worker||worker===PWA.dismissedWorker)return;
    PWA.waitingWorker=worker;
    var b=document.getElementById('updateBanner');if(b)b.hidden=false;
  },
  install:function(){
    if(PWA.isStandalone())return;
    if(PWA.deferredInstallPrompt){
      var p=PWA.deferredInstallPrompt;PWA.deferredInstallPrompt=null;
      p.prompt();
      if(p.userChoice&&p.userChoice.then)p.userChoice.then(function(){var b=document.getElementById('installAppButton');if(b)b.hidden=true}).catch(function(){});
      return;
    }
    if(PWA.isIos()){PWA.iosHelp();return}
    PWA.genericHelp();
  },
  iosHelp:function(){
    Modal.open('<h3 id="installHelpTitle">📲 加入主畫面（iPhone／iPad）</h3>'+
      '<p>加主畫面＝全螢幕開啟，離線都開得返。請用 <b>Safari</b>：</p>'+
      '<ol class="install-steps"><li>喺 Safari 開啟呢一頁，撳底部「分享」<b>⬆</b></li>'+
      '<li>揀「<b>加入主畫面</b>」</li><li>撳「<b>加入</b>」，之後由主畫面圖示開啟</li></ol>'+
      '<div class="btns"><button class="btn gr" onclick="Modal.close()">知道了</button></div>');
  },
  genericHelp:function(){
    Modal.open('<h3 id="installHelpTitle">📲 加入主畫面</h3>'+
      '<p>加主畫面＝全螢幕開啟，離線都開得返。</p>'+
      '<ul class="install-steps"><li><b>Android／Chrome／Edge</b>：撳瀏覽器選單 ⋮ →「安裝應用程式」／「加入主畫面」。</li>'+
      '<li><b>iPhone／iPad</b>：用 Safari → 分享 ⬆ →「加入主畫面」→「加入」。</li>'+
      '<li>如果瀏覽器未提供安裝選項，可以先用書籤；離線快取仍會喺背景準備。</li></ul>'+
      '<div class="btns"><button class="btn gr" onclick="Modal.close()">知道了</button></div>');
  },
  applyUpdate:function(){
    var w=PWA.waitingWorker||(PWA.reg&&PWA.reg.waiting);
    if(!w||PWA.updateReloading)return;
    if(typeof Lead!=='undefined'&&Lead.S&&document.getElementById('leadroot')&&!document.getElementById('leadroot').classList.contains('hidden')){
      if(!confirm('更新會重新載入頁面；帶領計時會重置，已記錄嘅本機資料會保留。繼續？'))return;
    }
    if(typeof Kit!=='undefined'&&Kit.flushDefaultOwner)Kit.flushDefaultOwner();
    PWA.updateReloading=true;
    var b=document.getElementById('updateBanner');if(b)b.hidden=true;
    try{w.postMessage({type:'SKIP_WAITING'})}catch(e){}
    setTimeout(function(){if(PWA.updateReloading)location.reload()},2500);
  },
  later:function(){
    PWA.dismissedWorker=PWA.waitingWorker;
    var b=document.getElementById('updateBanner');if(b)b.hidden=true;
  }
};
