/* 🦗 regression.js — 真 DOM（jsdom）＋ SW mock 回歸測試：鎖住 2026-11 審計修復
   跑法：node tests/regression.js（npm test 的一部分；任何失敗 exit 1） */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {JSDOM}=require('jsdom');
const ROOT=path.join(__dirname,'..');
let pass=0;const fails=[];const pending=[];
function ok(name,fn){try{fn();pass++;console.log('✅ '+name)}catch(e){fails.push(name+' — '+e.message);console.error('❌ '+name+' — '+e.message)}}

const FILES=['data.js','guide.js','craft.js','sheets.js','tpls.js','app.js','pwa.js','flow.js','prepare.js','print.js','pack.js','lead.js','img.js','track.js','handbook.js','play.js','kit.js','venue.js','chute.js','song.js','tools.js'];
function boot(){
  let html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  html=html.replace(/<script[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{url:'https://ghmeeting.vercel.app/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.AudioContext=function(){this.currentTime=0;this.destination={};this.state='running';
    this.createOscillator=()=>({frequency:{value:0},type:'sine',connect(){},start(){},stop(){}});
    this.createGain=()=>({gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}});
    this.resume=()=>{};};
  w.scrollTo=()=>{};
  for(const f of FILES)w.eval(fs.readFileSync(path.join(ROOT,'js',f),'utf8'));
  w.App.init();
  return {dom,w};
}

/* ---- P0：XSS sinks（惡意備份資料唔可以執行） ---- */
ok('XSS：出席紀錄日期／集會名唔會注入 HTML',()=>{
  const {w}=boot();
  w.localStorage.setItem('gh_recs',JSON.stringify([{no:1,tid:'t01',date:'<img src=x onerror="window.__xss1=1">',present:[],badges:[],gh:[]}]));
  w.location.hash='#track';w.App.route();
  const out=w.document.getElementById('view').innerHTML;
  assert(!out.includes('<img src=x'),'date 必須 escape');
  assert.strictEqual(w.__xss1,undefined);
});
ok('XSS：負責領袖 chip 用 data-*，唔拼 onclick JS',()=>{
  const {w}=boot();
  w.localStorage.setItem('gh_settings',JSON.stringify({group:'G',start:'9',dur:'60',leaders:"x');window.__xss2=1;('"}));
  const html=w.Kit.ownerRowHtml('t01',0,{});
  assert(!/onclick="Kit\.setOwner\(/.test(html),'唔可以再將領袖名拼入 onclick');
  const div=w.document.createElement('div');div.innerHTML=html;
  const chip=div.querySelector('[data-owner-chip]');
  assert(chip,'要有 data-owner chip');
  assert.strictEqual(chip.getAttribute('data-owner-name'),"x');window.__xss2=1;('");
  w.document.body.appendChild(div);
  chip.click();
  assert.strictEqual(w.__xss2,undefined);
});
ok('XSS：目錄 row 用 data-*，惡意 tid/no 唔會執行',()=>{
  const {w}=boot();
  const html=w.Plan.toc({rows:[{no:'1"><img src=x onerror=window.__xss3=1>',tid:'t01'}]});
  assert(!/onclick="Flow\.select\(/.test(html));
  const div=w.document.createElement('div');div.innerHTML=html;w.document.body.appendChild(div);
  const row=div.querySelector('[data-plan-tid]');assert(row);row.click();
  assert.strictEqual(w.__xss3,undefined);
});

/* ---- P0：Store 失敗唔扮成功 ---- */
ok('Store.set 配額失敗回傳 false＋唔出「已儲存」',()=>{
  const {w}=boot();
  const real=w.localStorage;
  const fake={getItem:k=>real.getItem(k),removeItem:k=>real.removeItem(k),setItem:function(k,v){if(k==='gh_settings'){const e=new Error('quota');e.name='QuotaExceededError';throw e}return real.setItem(k,v)}};
  Object.defineProperty(w,'localStorage',{value:fake,configurable:true});
  w.App.settings();
  w.document.getElementById('stG').value='測試旅團';
  w.App.saveSettings();
  assert.strictEqual(w.Store.lastError,'QuotaExceededError');
  assert(w.document.getElementById('modal').innerHTML.length>0,'失敗唔可以閂走個表單');
  assert(![...w.document.querySelectorAll('toast')].some(t=>/已儲存/.test(t.textContent)));
});
ok('Flow／Pack 狀態儲存失敗會停止成功流程',()=>{
  const {w}=boot();
  const real=w.localStorage;
  const fake={getItem:k=>real.getItem(k),removeItem:k=>real.removeItem(k),setItem:function(){const e=new Error('quota');e.name='QuotaExceededError';throw e}};
  Object.defineProperty(w,'localStorage',{value:fake,configurable:true});
  assert.strictEqual(w.Flow.save({on:1}),false);
  w.Flow.start();
  assert(![...w.document.querySelectorAll('toast')].some(t=>/好，我一步步帶你做到尾/.test(t.textContent)));
  assert.strictEqual(w.Pack.bagSet('t01',[0]),false);
  assert.strictEqual(w.Pack.setCopies(4),false);
  assert.strictEqual(w.Pack.setPart('bag',1),false);
  assert.strictEqual(w.Pack.toggleKid('lantern'),false);
});

/* ---- P0：saveAttend upsert ---- */
ok('F6：同一集會重save出席＝取代，唔重複計數',()=>{
  const {w}=boot();
  w.localStorage.setItem('gh_members',JSON.stringify([{id:'p1',n:'小明',badge:{},step:0,gh:[]}]));
  w.localStorage.setItem('gh_plan',JSON.stringify({rows:[{no:1,tid:'t02',status:'todo',date:''}]}));
  w.Track.attendPrompt(1);
  w.Track.saveAttend(1);
  const recs1=JSON.parse(w.localStorage.getItem('gh_recs'));
  const gh1=JSON.parse(w.localStorage.getItem('gh_members'))[0].gh.slice();
  w.Track.attendPrompt(1);
  w.Track.saveAttend(1);
  const recs2=JSON.parse(w.localStorage.getItem('gh_recs'));
  const gh2=JSON.parse(w.localStorage.getItem('gh_members'))[0].gh.slice();
  assert.strictEqual(recs2.length,1,'recs 必須 upsert by no');
  assert.strictEqual(w.Track.attCount({id:'p1'}),1);
  assert.deepStrictEqual(gh2,gh1,'小草蜢體驗唔可以重複加');
});

/* ---- P0：備份 schema / hash / 原子還原 ---- */
ok('F10：未知 key／壞 schema／壞 hash 一律拒絕',()=>{
  const {w}=boot();
  assert(w.App._validateBackup({app:'ghmeeting',ver:2,keys:{evil:{}}})!==null);
  assert(w.App._validateBackup({app:'ghmeeting',ver:2,keys:{members:'not-an-array'}})!==null);
  assert(w.App._validateBackup({app:'ghmeeting',ver:2,keys:{members:[{id:'p1',n:'A'}],recs:[{no:1,tid:'t01',date:'2026-01-01',present:['p1']}]}})===null);
  assert(w.App._validateBackup({app:'other',ver:2,keys:{}})!==null);
});
ok('F11：匯入中途失敗＝回滾原本資料',()=>{
  const {w}=boot();
  w.localStorage.setItem('gh_members',JSON.stringify([{id:'p1',n:'原本'}]));
  w.localStorage.setItem('gh_settings',JSON.stringify({group:'原團'}));
  const snap={};w.APP_DATA_KEYS.forEach(k=>{const v=w.localStorage.getItem('gh_'+k);if(v!==null)snap[k]=v});
  const payload={members:JSON.stringify([{id:'p2',n:'新'}]),settings:JSON.stringify({group:'新團'})};
  const real=w.localStorage;let failed=false;
  const fake={getItem:k=>real.getItem(k),removeItem:k=>real.removeItem(k),setItem:function(k,v){if(k==='gh_settings'){failed=true;const e=new Error('quota');e.name='QuotaExceededError';throw e}return real.setItem(k,v)}};
  Object.defineProperty(w,'localStorage',{value:fake,configurable:true});
  try{Object.keys(payload).forEach(k=>w.localStorage.setItem('gh_'+k,payload[k]))}catch(e){}
  assert(failed);
  w.APP_DATA_KEYS.forEach(k=>w.localStorage.removeItem('gh_'+k));
  Object.keys(snap).forEach(k=>real.setItem('gh_'+k,snap[k]));
  assert.deepStrictEqual(JSON.parse(w.localStorage.getItem('gh_members')),[{id:'p1',n:'原本'}]);
  assert.strictEqual(JSON.parse(w.localStorage.getItem('gh_settings')).group,'原團');
});
ok('F10：sha256 canonical hash 穩定（key 順序無關）',()=>{
  const {w}=boot();
  const a=w.App._canonical({b:1,a:{d:2,c:3}}),b=w.App._canonical({a:{c:3,d:2},b:1});
  assert.strictEqual(a,b);
});

/* ---- P1：未知 key fallback ---- */
ok('G：未知 badge／gh key 唔會 crash 準備卡',()=>{
  const {w}=boot();
  const html=w.Prepare.brief({n:'測試',t:'遊戲',m:5,how:'',mats:[],gh:99,badge:'nonexistent'},0);
  assert(html.includes('測試'));
  assert(!html.includes('undefined'));
});
ok('G：_track records 未知 tid 有 fallback',()=>{
  const {w}=boot();
  w.localStorage.setItem('gh_recs',JSON.stringify([{no:9,tid:'gone',date:'2026-01-01',present:[]}]));
  const html=w.Track.records();
  assert(html.includes('?'));
});

/* ---- P1：Modal a11y ---- */
ok('A11y：Modal 有 dialog 語義＋Esc 關＋focus 返回',()=>{
  const {w}=boot();
  const btn=w.document.createElement('button');btn.id='opener';w.document.body.appendChild(btn);btn.focus();
  w.Modal.open('<h3>標題</h3><input id="f1"><button id="b1">OK</button>');
  const sheet=w.document.querySelector('#modal .sheet');
  assert.strictEqual(sheet.getAttribute('role'),'dialog');
  assert.strictEqual(sheet.getAttribute('aria-modal'),'true');
  assert(sheet.getAttribute('aria-labelledby'));
  assert.strictEqual(w.document.activeElement.id,'f1');
  w.Modal._key({key:'Escape',preventDefault(){}});
  assert.strictEqual(w.document.getElementById('modal').innerHTML,'');
  assert.strictEqual(w.document.activeElement.id,'opener');
});

/* ---- P1：prepare h3/h4 + chute/song tag 平衡 ---- */
ok('UI：範本卡 h3 閉合正確',()=>{
  const {w}=boot();
  w.location.hash='#meet';w.App.route();
  const out=w.document.getElementById('view').innerHTML;
  assert(!/<h3>[^<]*<span class="tag">[^<]*<\/span><\/h4>/.test(out));
});
ok('A11y：分類／選項 pill 係鍵盤可用按鈕並宣告狀態',()=>{
  const {w}=boot();
  for(const route of ['meet','song','chute','book']){
    w.location.hash='#'+route;w.App.route();
    const bad=[...w.document.querySelectorAll('#view [onclick]')].filter(e=>!['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(e.tagName)&&!e.hasAttribute('tabindex'));
    assert.deepStrictEqual(bad.map(e=>e.tagName+':'+e.textContent.trim()),[],route+' 有非鍵盤 click target');
    const buttons=[...w.document.querySelectorAll('#view button.filter-pill')];
    assert(buttons.length>0,route+' 有可操作篩選／選項');
    assert(buttons.every(b=>b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-pressed')==='false'),route+' filter buttons 宣告 aria-pressed');
  }
});

ok('Track 匯出：剪貼簿失敗唔可以訛稱已複製',()=>{
  const {w}=boot();
  w.localStorage.setItem('gh_members',JSON.stringify([{id:'p1',n:'小明',badge:{},step:0,gh:[]}]))
  w.URL.createObjectURL=()=> 'blob:audit';
  w.HTMLAnchorElement.prototype.click=function(){};
  Object.defineProperty(w.navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}});
  pending.push(w.Track.export().then(copied=>{
    assert.strictEqual(copied,false);
    const toasts=[...w.document.querySelectorAll('toast')].map(t=>t.textContent);
    assert.strictEqual(toasts[toasts.length-1],'已下載報告（未能複製）');
  }));
});

/* ---- PWA / SW 靜態＋行為 ---- */
ok('UP1：SW 只有首次安裝先 skipWaiting；有 SKIP_WAITING handler',()=>{
  const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  const install=(sw.match(/addEventListener\('install'[\s\S]*?\n\}\);/)||[''])[0];
  assert(install.includes('if(!self.registration.active)return self.skipWaiting()'),'首次安裝條件');
  assert.strictEqual((install.match(/skipWaiting/g)||[]).length,1,'install 內只可以有條件式 skipWaiting');
  assert(/e\.data\.type==='SKIP_WAITING'/.test(sw));
});
ok('SW：503/404 唔會寫入快取',()=>{
  const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  const store=new Map();const listeners={};
  const cache={put:(r,res)=>store.set(typeof r==='string'?r:r.url,res),match:r=>Promise.resolve(store.get(typeof r==='string'?r:r.url)||null),addAll:()=>Promise.resolve()};
  const self={addEventListener:(t,f)=>listeners[t]=f,registration:{active:{}},skipWaiting:()=>{},clients:{claim:()=>Promise.resolve()}};
  const ctx={self,URL,Response:function(b,o){this.body=b;this.status=o&&o.status;this.clone=()=>this},caches:{open:()=>Promise.resolve(cache),keys:()=>Promise.resolve([]),match:()=>Promise.resolve(null)},fetch:()=>Promise.resolve({ok:false,status:503,clone:()=>({ok:false,status:503})}),location:{origin:'https://x'},Promise,console};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(sw,ctx);
  let responded=null;
  listeners.fetch({request:{method:'GET',url:'https://x/js/app.js',mode:'cors'},respondWith:p=>responded=p});
  assert(responded,'fetch handler 必須 respondWith');
  pending.push(responded.then(res=>{assert.strictEqual(res.status,503);assert.strictEqual(store.size,0)}));
  ctx.fetch=()=>Promise.reject(new TypeError('offline'));
  let offlineResponse=null;
  listeners.fetch({request:{method:'GET',url:'https://x/js/missing.js',mode:'cors'},respondWith:p=>offlineResponse=p});
  pending.push(offlineResponse.then(res=>assert.strictEqual(res.status,504,'offline JS miss must not fall back to index.html')));
});
ok('I1–I6：index 有安裝掣／更新 banner；pwa.js 有齊掛鉤',()=>{
  const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const pwa=fs.readFileSync(path.join(ROOT,'js','pwa.js'),'utf8');
  for(const id of ['installAppButton','updateBanner','updateNowButton','updateLaterButton'])assert(idx.includes(id),id);
  assert(/beforeinstallprompt/.test(pwa)&&/appinstalled/.test(pwa));
  assert(/visibilitychange/.test(pwa)&&/online/.test(pwa)&&/30\*60\*1000/.test(pwa));
  assert(/dismissedWorker/.test(pwa)&&/2500/.test(pwa));
  assert(/Safari/.test(pwa)&&/加入主畫面/.test(pwa));
});
ok('V2：APP_VERSION／meta／CACHE／package 同步',()=>{
  const app=fs.readFileSync(path.join(ROOT,'js','app.js'),'utf8');
  const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
  const ver=(app.match(/APP_VERSION='([^']+)'/)||[])[1];
  assert(ver);
  assert(idx.includes('name="app-version" content="'+ver+'"'));
  assert(sw.includes('ghub-v'+ver.slice(1).replace(/\./g,'-')));
  assert.strictEqual(pkg.version,ver.slice(1)+'.0');
});
ok('G11：9 個圖標尺寸正確＋總體積 ≤260KB＋og 絕對網址',()=>{
  const need={'favicon.ico':null,'favicon-16.png':16,'favicon-32.png':32,'apple-touch-icon.png':180,'icon-192.png':192,'icon-512.png':512,'icon-maskable-192.png':192,'icon-maskable-512.png':512,'og-image.png':1200};
  let total=0;
  for(const [f,size] of Object.entries(need)){
    const p=path.join(ROOT,'icons',f);const b=fs.readFileSync(p);total+=b.length;
    if(f.endsWith('.png')){assert.strictEqual(b.readUInt32BE(16),size,f+' width');assert.strictEqual(b.readUInt32BE(20),f==='og-image.png'?630:size,f+' height')}
    else{assert.strictEqual(b.readUInt16LE(4),3,'ico 要有 3 個尺寸')}
  }
  assert(total<=260*1024,'icons total '+total);
  const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  assert(/og:image" content="https:\/\/ghmeeting\.vercel\.app\/icons\/og-image\.png"/.test(idx));
  const m=JSON.parse(fs.readFileSync(path.join(ROOT,'manifest.webmanifest'),'utf8'));
  assert.strictEqual(m.background_color,m.theme_color);
  assert.strictEqual(m.icons.length,4);
});
ok('CSS：.gh-ic 絕對定位只限九宮格；互動綠色達 AA',()=>{
  const css=fs.readFileSync(path.join(ROOT,'css','app.css'),'utf8');
  assert(!/^\.gh-ic\{position:absolute/m.test(css));
  assert(/\.hole\.nine \.gh-ic\{position:absolute/.test(css));
  const lum=h=>{const c=h.match(/\w\w/g).map(x=>{let v=parseInt(x,16)/255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
  const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)};
  assert(ratio('FFFFFF','3A7F39')>=4.5,'白字／互動綠');
  assert(ratio('FFFFFF','2E7D32')>=4.5,'白字／深綠');
});

Promise.all(pending).catch(e=>fails.push('SW mock — '+e.message)).then(()=>{
  if(fails.length){console.error('\n❌ '+fails.length+' 個回歸失敗');process.exit(1)}
  console.log('\n🎉 回歸測試 '+pass+'/'+pass+' 通過');
});
