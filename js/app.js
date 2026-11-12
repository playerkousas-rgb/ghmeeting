/* 🦗 app.js — 核心:路由、資料存取、規劃(年度行事曆+42個月路線圖) © 2026 Scout System */
/* 💾 Store：寫入失敗唔可以扮成功（F8）。set 回傳 true/false；失敗記低原因＋出紅 toast。 */
var Store={
  lastError:'',
  get:function(k,d){try{var v=localStorage.getItem('gh_'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){
    try{localStorage.setItem('gh_'+k,JSON.stringify(v));Store.lastError='';return true}
    catch(e){Store.lastError=(e&&e.name)||'StorageError';
      if(typeof toast==='function')toast('⚠️ 儲存失敗（'+Store.lastError+'）—請即匯出備份，唔好關機');
      return false}
  },
  del:function(k){localStorage.removeItem('gh_'+k)},
  /* F8 一鍵診斷：版本／bytes／keys／儲存狀態，唔使識 console */
  diag:function(){
    var keys=APP_DATA_KEYS.filter(function(k){return localStorage.getItem('gh_'+k)!==null});
    var bytes=0;keys.forEach(function(k){bytes+=(localStorage.getItem('gh_'+k)||'').length});
    return {appVersion:APP_VERSION,cache:(typeof navigator!=='undefined'&&navigator.serviceWorker&&navigator.serviceWorker.controller)?'controlled':'uncontrolled',
      keys:keys,bytes:bytes,lastError:Store.lastError,quota:(bytes>4*1024*1024?'接近上限':'正常')};
  }
};
/* 單一真理：本機資料 key 清單（匯出／匯入／診斷共用，F1/F10） */
var APP_DATA_KEYS=['settings','plan','members','recs','mymeets','owners','meetmeta','msgTpl','checkins','flow','bagtick','packkid','packcopies','packcur','packsel'];
var APP_VERSION='v5.4';
var App={
  view:'plan',
  init:function(){
    if(!Store.get('settings'))Store.set('settings',{group:'我的旅團',start:'9',dur:'60',startDate:''});
    if(!Store.get('plan'))App.seedPlan();
    if(!Store.get('members'))Store.set('members',[]);
    if(!Store.get('mymeets'))Store.set('mymeets',[]);
    /* 🦗 常駐頁底：© 一行永遠貼喺屏幕最底（下方五掣下面）——照用 DATA.official.note＋App.VER，唔准手寫第份 */
    var af=document.getElementById('appfoot');
    if(af&&typeof DATA!=='undefined'&&DATA.official)af.textContent=App.legalLine()+'・'+App.VER;
    addEventListener('hashchange',function(){App.route()});
    App.route();
  },
  route:function(){
    var h=(location.hash||'#plan').slice(1).split('?')[0];
    if(document.body.contains(document.getElementById('leadroot'))&&!document.getElementById('leadroot').classList.contains('hidden'))Lead.exit(false);
    var v={pack:'pack',plan:'plan',meet:'meet',play:'play',lead:'lead',track:'track',book:'book',print:'print',
           chute:'chute',song:'song',tools:'tools',prep:'prep'}[h]||'plan';
    App.view=v;
    /* 🅰️ 上方五入口 ＋ 🅱️ 下方即插即用五格：兩條 bar 都要著返正確嗰格 */
    document.querySelectorAll('#tabbar a, #topnav a').forEach(function(a){
      var on=a.dataset.tab===v;
      a.classList.toggle('on',on);
      /* 螢幕報讀器要知「而家喺邊一頁」；外連（官方套包）冇 data-tab，永遠唔會有 aria-current */
      if(on)a.setAttribute('aria-current','page');else if(a.removeAttribute)a.removeAttribute('aria-current');
    });
    var el=document.getElementById('view');
    if(v==='pack')el.innerHTML=Pack.html();
    if(v==='plan')el.innerHTML=Plan.html();
    if(v==='prep')el.innerHTML=Flow.prepHtml();   /* 🧭 逐步預備：揀好場之後一步步帶 */
    if(v==='meet')el.innerHTML=Prepare.html();
    if(v==='play')el.innerHTML=Play.html();
    if(v==='lead')el.innerHTML=Lead.html();
    if(v==='track')el.innerHTML=Track.html();
    if(v==='book')el.innerHTML=HB.html();
    if(v==='print')el.innerHTML=PrintKit.html();
    /* 🅱️ 即插即用：唔使準備，即開即用 */
    if(v==='chute')el.innerHTML=Chute.html();
    if(v==='song')el.innerHTML=Song.html();
    if(v==='tools')el.innerHTML=Tools.html();
    el.innerHTML+=App.foot(); /* 🦗 頁底「非官方」聲明：每一頁都有，唔想俾人誤會成官方出品 */
    if(typeof Flow!=='undefined')Flow.render();   /* 🧭 嚮導條跟住畫面更新 */
    scrollTo(0,0);
  },
  go:function(h){location.hash=h},
  /* 🦗 版權／非官方聲明：每一頁最底都印住。收埋嗰半「邊啲係官方」撳先展開，唔佔版面。
     文案全部喺 DATA.official（js/data.js）——紙本 p-foot 都用同一份，唔准各自亂寫。 */
  VER:APP_VERSION,
  /* 唯一版權／非官方紙本行：畫面、紙本、匯出文字都由 DATA.official.note 組成。 */
  legalLine:function(){
    var note=(typeof DATA!=='undefined'&&DATA.official)?DATA.official.note:'';
    return '© 2026 Scout System'+(note?'・'+note:'');
  },
  foot:function(){
    var o=(typeof DATA!=='undefined'&&DATA.official)?DATA.official:null;
    if(!o)return '';
    return '<footer class="app-foot">'+
      '<div class="foot-flag">'+esc(o.flag)+'　'+esc(o.claim)+'</div>'+
      '<p class="foot-note">'+esc(o.who)+'<br>內容如有出入，<b>一切以香港童軍總會公佈為準</b>。</p>'+
      '<p class="foot-links">'+
        '<a href="'+esc(o.site)+'" target="_blank" rel="noopener">'+esc(o.siteN)+'</a>'+
        '<a href="'+esc(o.pack)+'" target="_blank" rel="noopener">'+esc(o.packN)+'</a></p>'+
      '<details class="foot-more"><summary>✳️ 邊啲照錄官方？邊啲係延伸編寫？</summary>'+
        '<div class="foot-split">'+
          '<div><b>'+esc(o.theirsT)+'</b>'+o.theirs.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>'+
          '<div><b>'+esc(o.oursT)+'</b><p>'+esc(o.oursT2)+'</p>'+o.ours.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>'+
        '</div></details>'+
      '<div class="foot-ver">'+esc(App.legalLine())+'・'+App.VER+'</div>'+
    '</footer>';
  },
  /* ---- 隨手開會快速面板 ---- */
  quickHub:function(){
    var pl=Store.get('plan',{rows:[]});
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var nextT=next?dur(next.tid):dur('t01');
    var h='<div class="quick-hub-header"><span class="eyebrow">⚡ 隨手開會</span><h3>即刻開會・零物資</h3></div>'+
      '<div class="card" style="background:#fff4e6;border:2px solid #ffd9a8;padding:12px;margin:8px 0"><b style="color:var(--ord)">📦 想印齊今場教材？</b><div class="btns" style="margin:6px 0 0"><button class="btn blk" onclick="Modal.close();App.go(\'#pack\')">📦 去集會套包（一撳印齊）</button></div></div>'+
      (nextT?'<div class="card" style="background:#f1f8e9;border:2px solid #81c784;padding:12px;margin:8px 0"><div style="font-size:.78rem;font-weight:800;color:var(--grd)">📅 推薦：今日進度集會</div><h4 style="margin:4px 0;font-size:1.1rem;color:var(--ink)">'+esc(nextT.n)+'</h4><div class="mute" style="font-size:.8rem">'+esc(nextT.theme)+'・約 '+Plan.lenOf(nextT)+' 分鐘</div><div class="btns" style="margin-top:8px"><button class="btn gr blk" onclick="Modal.close();Lead.start(\''+nextT.id+'\','+(next?next.no:1)+')">▶ 即刻全螢幕帶領</button></div></div>':'')+
      '<div class="card" style="border:1.5px solid var(--line);padding:12px;margin:8px 0"><h4 style="margin:0 0 6px;color:var(--ord)">🎲 零準備即興集會（100% 數碼免道具）</h4><div class="mute" style="font-size:.78rem;margin-bottom:8px">領袖臨時頂位？撳一下自動組合 6 個流暢環節，即開即玩：</div>'+
      '<div class="grid2">'+
        '<button class="btn sm ghost" onclick="App.startInstant(\'general\',40)">🎲 歡樂綜合 (40分)</button>'+
        '<button class="btn sm ghost" onclick="App.startInstant(\'safety\',40)">🛡️ 身體安全 (40分)</button>'+
        '<button class="btn sm ghost" onclick="App.startInstant(\'health\',40)">🧼 健康技能 (40分)</button>'+
        '<button class="btn sm ghost" onclick="App.startInstant(\'nature\',40)">♻️ 環保自然 (40分)</button>'+
        '<button class="btn sm ghost" onclick="App.startInstant(\'fitness\',40)">🏃 體能反應 (40分)</button>'+
        '<button class="btn sm gr" onclick="App.startInstant(\'general\',60)">✨ 60分鐘全能大集會</button>'+
      '</div></div>'+
      '<div class="card" style="border:1.5px solid var(--line);padding:12px;margin:8px 0"><h4 style="margin:0 0 6px;color:var(--ord)">🧭 開會前點預備</h4>'+        '<div class="quick-tools-row">'+
        '<button class="btn sm" onclick="Modal.close();Kit.hubOpen()">🧰 點預備總覽</button>'+        '<button class="btn sm ghost" onclick="Modal.close();Kit.openCheckFor(dur(\''+(nextT?nextT.id:'t01')+'\'))">🧭 今場檢查表</button>'+        '<button class="btn sm ghost" onclick="Modal.close();Kit.msgOpen()">📣 家長訊息範本</button>'+        '</div></div>'+
      '<div class="card" style="border:1.5px solid var(--line);padding:12px;margin:8px 0"><h4 style="margin:0 0 6px;color:var(--ord)">🧰 隨手救急快鍵</h4><div class="quick-tools-row">'+
        '<button class="btn sm" onclick="Modal.close();Lead.quietQuick()">🤫 5秒安靜</button>'+
        '<button class="btn sm ghost" onclick="Sfx.whistle();toast(\'🎺 嗶————！集合！\')">🎺 吹哨</button>'+
        '<button class="btn sm ghost" onclick="Sfx.horn();toast(\'📯 號角響起！\')">📯 號角</button>'+
        '<button class="btn sm ghost" onclick="Modal.close();Lead.quickTool(\'wheel\')">🎲 點名抽籤</button>'+
        '<button class="btn sm ghost" onclick="Modal.close();Lead.quickTool(\'score\')">🥇 計分板</button>'+
        '<button class="btn sm ghost" onclick="Modal.close();Lead.quickTool(\'group\')">👥 分組機</button>'+
      '</div></div>'+
      '<div class="btns" style="margin-top:10px"><button class="btn ghost sm blk" onclick="Modal.close();App.go(\'#play\')">🎮 進入 22 個即玩遊戲與數碼工具庫 ↗</button></div>';
    Modal.open(h);
  },
  startInstant:function(theme, mins){
    Modal.close();
    var m=(typeof Pack!=='undefined')?Pack.instantMeet(theme,mins):null;
    if(!m)return;
    /* 砌好＝存入「我嘅集會」＋套包／執袋跟住呢場（同套包頁「⚡ 臨時集會」一致，唔係開完就唔見） */
    var my=Store.get('mymeets',[])||[];
    my.unshift(m);if(!Store.set('mymeets',my))return;
    if(typeof Pack!=='undefined')Pack.pick('my',m.id,0);
    if(typeof Lead!=='undefined'&&Lead.startMy)Lead.startMy(m.id);
    else if(typeof Lead!=='undefined'){Lead.cleanupTimers();Lead.S={meet:m,idx:0,left:(m.stages[0].m||5)*60,timerOn:false,no:0};Lead.open()}
    toast('⚡ 已砌好＋啟動「'+m.n+'」—完場套包照印');
  },
  /* ---- 設定 ---- */
  settings:function(){
    var s=Store.get('settings',{group:'',start:'9',dur:'60'});
    Modal.open('<h3>⚙️ 旅團設定</h3>'+
      '<label class="f">旅團名稱</label><input type="text" id="stG" value="'+esc(s.group)+'" placeholder="例如:第123旅小童軍團">'+
      '<label class="f">開季月份</label><select id="stS">'+['1','2','3','4','5','6','7','8','9','10','11','12'].map(function(m){return '<option value="'+m+'"'+(s.start===m?' selected':'')+'>'+m+'月</option>'}).join('')+'</select>'+
      '<label class="f">恆常集會時長</label><select id="stD">'+['40','60','90','120','180'].map(function(d){return '<option value="'+d+'"'+(s.dur===d?' selected':'')+'>'+d+' 分鐘</option>'}).join('')+'</select>'+
      '<label class="f">領袖名單（分工時可以直接揀名，用、分開）</label><input type="text" id="stL" value="'+esc(s.leaders||'')+'" placeholder="例：陳sir、Miss 王、Billie 師姐">'+
      '<label class="f">恆常集合時間／地點（貼心：家长訊息範本會自動填呢兩格）</label>'+
      '<div class="row2"><div><input type="text" id="stT" value="'+esc(s.time||'')+'" placeholder="例：9:15-10:15"></div><div><input type="text" id="stP" value="'+esc(s.place||'')+'" placeholder="例：旅團部地下球場"></div></div>'+
      '<label class="f">聯絡電話（只存喺你部機，用於家長訊息範本）</label><input type="text" id="stPh" value="'+esc(s.phone||'')+'" placeholder="例：9123 4567">'+
      '<div class="btns" style="margin-top:14px"><button class="btn blk" onclick="App.saveSettings()">儲存</button></div>'+
      '<hr class="soft"><div class="mute" style="font-size:.78rem">💾 <b>備份</b>：資料只存喺呢部裝置—換機/清理瀏覽器之前，save 一個 file 就唔會歸零。<br>'+      '<div class="btns" style="margin-top:6px"><button class="btn sm ghost" onclick="App.exportAll()">📦 匯出全部資料（一個 file）</button>'+      '<button class="btn sm ghost" onclick="document.getElementById(\'imF\').click()">📥 讀返一個備份</button>'+      '<input type="file" id="imF" accept="application/json,.json,text/plain" style="display:none" onchange="App.importAll(this)"></div>'+      '<div class="mute" style="font-size:.72rem;margin-top:5px">匯入會取代呢部裝置現有資料（名單＋規劃＋紀錄＋自製集會）。</div>'+      '<div class="btns" style="margin-top:6px"><button class="btn sm ghost" onclick="App.copyDiag()">🩺 一鍵診斷（複製報告）</button></div>'+
      '<hr class="soft"><div class="mute" style="font-size:.78rem">🧹 重建年度行事曆會重設規劃表(唔影響團員資料):<br><button class="btn sm ghost" onclick="App.seedPlan(true);Modal.close();toast(\'已重建年度行事曆\')">重建行事曆</button> '+
      '<button class="btn sm ghost rd" style="color:#b71c1c;border-color:#e53935" onclick="if(confirm(\'清除所有本機資料(含團員/集會/規劃)?\')){localStorage.clear();location.reload()}">清除全部資料</button></div>'+
      App.footMini());
  },
  copyDiag:function(){
    var d=Store.diag();
    var txt='【小童軍集會助手診斷】\n版本：'+d.appVersion+'\nSW：'+d.cache+'\n資料組：'+d.keys.join(', ')+'\nbytes：'+d.bytes+'（'+d.quota+'）\n最後儲存錯誤：'+(d.lastError||'無');
    if(navigator.clipboard)navigator.clipboard.writeText(txt).then(function(){toast('診斷報告已複製 ✓')}).catch(function(){Modal.open('<h3>🩺 診斷報告</h3><textarea rows="8" style="width:100%">'+esc(txt)+'</textarea>')});
    else Modal.open('<h3>🩺 診斷報告</h3><textarea rows="8" style="width:100%">'+esc(txt)+'</textarea>');
  },
  /* ⚙️ 設定 sheet 最底：同一份非官方聲明（細版，慳位） */
  footMini:function(){
    var o=(typeof DATA!=='undefined'&&DATA.official)?DATA.official:null;
    if(!o)return '';
    return '<hr class="soft"><div class="foot-mini">'+
      '<b>'+esc(o.flag)+'　'+esc(o.claim)+'</b><br>'+
      esc(o.who)+'內容如有出入，一切以香港童軍總會公佈為準。<br>'+
      '<a href="'+esc(o.site)+'" target="_blank" rel="noopener">'+esc(o.siteN)+'</a>　'+
      '<a href="'+esc(o.pack)+'" target="_blank" rel="noopener">'+esc(o.packN)+'</a></div>';
  },
  /* ================= 📮 意見回報（Scout Admin 統一回報 v1）=================
     有網：index.html 一行官方 widget（右下角 🐛💬 回報・意見）負責提交。
     離線／腳本被封：下面嘅模態係後備，提供可複製文字＋網頁版表單，唔會靜靜失敗。
     data-app 一定要用「小童軍集會」——唔可以用「小童軍」「童軍」「幼童軍」等單一支部名，
     否則 Scout Admin 會歸入「專章系統」，同獎章 APP 嘅回報混埋一齊。 */
  FB_APP:'小童軍集會',
  FB_FORM:'https://scout-admin-blue.vercel.app/report.html?app=',
  fbPage:function(){var h=(location.hash||'#plan').replace(/^#/,'').split('?')[0];return h||'plan'},
  fbTemplate:function(){
    var ua=(typeof navigator!=='undefined'&&navigator.userAgent)?navigator.userAgent:'（讀不到）';
    return '【'+App.FB_APP+'】\n'+
      '類別：（問題／建議／讚／其他）\n'+
      '頁面：#'+App.fbPage()+'\n'+
      '版本：'+App.VER+'（'+App.FB_APP+'）\n'+
      '裝置：'+ua+'\n\n'+
      '內容：\n\n'+
      '——\n（唔好填小朋友姓名、班別、地址或相片）';
  },
  fbUrl:function(){return App.FB_FORM+encodeURIComponent(App.FB_APP)},
  feedback:function(){
    Modal.open('<h2>📮 意見回報</h2>'+
      '<div class="fedb-privacy">🔒 只收<b>問題本身</b>：唔好填小朋友姓名、班別、地址或相片。姓名／聯絡方式全部選填，可以匿名。</div>'+
      '<p class="mute" style="font-size:.82rem">有網時右下角有官方 <b>🐛💬 回報・意見</b> 掣（Scout Admin 統一回報）；下面呢段係<b>離線後備</b>：複製文字，貼去電郵／群組，或者開網頁版表單。</p>'+
      '<textarea id="fb-ta" rows="8" style="width:100%;font-size:.82rem;line-height:1.5" aria-label="回報文字">'+esc(App.fbTemplate())+'</textarea>'+
      '<div class="btns"><button class="btn gr" onclick="App.copyFeedback()">📋 複製文字</button>'+
      '<a class="btn" href="'+esc(App.fbUrl())+'" target="_blank" rel="noopener">🌐 開網頁版表單</a></div>');
    return true;
  },
  copyFeedback:function(){
    var ta=document.getElementById('fb-ta');
    var txt=ta?ta.value:App.fbTemplate();
    var done=function(){toast('已複製 ✓ 貼去電郵／群組就得')};
    try{
      if(typeof navigator!=='undefined'&&navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(done).catch(function(){App._fbCopyFallback(txt,done)});
        return true;
      }
    }catch(e){}
    return App._fbCopyFallback(txt,done);
  },
  _fbCopyFallback:function(txt,done){
    var ta=document.getElementById('fb-ta');
    if(ta){try{ta.focus();ta.select();if(document.execCommand&&document.execCommand('copy')){done();return true}}catch(e){}}
    try{if(typeof prompt==='function'){prompt('複製下面文字：',txt);return true}}catch(e){}
    return false;
  },
  exportAll:function(silent){
    var data={app:'ghmeeting',ver:2,schemaVersion:2,at:new Date().toISOString(),appVersion:APP_VERSION,keys:{}};
    APP_DATA_KEYS.forEach(function(k){var v=Store.get(k,null);if(v!==null&&v!==undefined)data.keys[k]=v});
    return App._sha256(App._canonical(data.keys)).then(function(hash){
      if(hash)data.sha256=hash;
      try{
        var blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'});
        var a=document.createElement('a');a.href=URL.createObjectURL(blob);
        a.download='小童軍集會助手-備份-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.json';
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(function(){URL.revokeObjectURL(a.href)},4000);
        if(!silent)toast('已 save 咗一個備份 file ✓ 放去安全地方');
        return true;
      }catch(e){if(!silent)toast('export 唔到：'+e.message);return false}
    });
  },
  _canonical:function(v){
    if(Array.isArray(v))return '['+v.map(App._canonical).join(',')+']';
    if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+':'+App._canonical(v[k])}).join(',')+'}';
    return JSON.stringify(v);
  },
  _sha256:function(txt){
    try{
      if(typeof crypto!=='undefined'&&crypto.subtle&&crypto.subtle.digest){
        return crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)).then(function(buf){
          return Array.prototype.map.call(new Uint8Array(buf),function(b){return ('0'+b.toString(16)).slice(-2)}).join('');
        }).catch(function(){return null});
      }
    }catch(e){}
    return Promise.resolve(null);
  },
  /* F10/F11：allowlist＋逐 key schema＋hash＋原子還原（失敗回滾）＋匯入前自動備份 */
  _validateBackup:function(d){
    if(!d||typeof d!=='object'||!d.keys||typeof d.keys!=='object')return '呢個唔似備份 file ✗';
    if(d.app!=='ghmeeting')return '備份來源唔係小童軍集會助手 ✗';
    var sv=d.schemaVersion||d.ver;
    if(sv!==1&&sv!==2)return '備份 schema 版本唔支援（'+sv+'）✗';
    var ks=Object.keys(d.keys);
    for(var i=0;i<ks.length;i++){if(APP_DATA_KEYS.indexOf(ks[i])<0)return '備份含未知資料組「'+ks[i]+'」✗';}
    var arr=function(v){return Array.isArray(v)};
    var obj=function(v){return v&&typeof v==='object'&&!Array.isArray(v)};
    var id=function(x){return typeof x==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(x)};
    var str=function(x){return typeof x==='string'};
    var num=function(x){return typeof x==='number'&&isFinite(x)};
    var stage=function(x){return obj(x)&&str(x.n)&&arr(x.mats?x.mats:[])};
    var strMap=function(v){return obj(v)&&Object.keys(v).every(function(k){return str(v[k])})};
    var checks={
      settings:function(v){return obj(v)&&['group','start','dur','startDate','leaders','time','place','phone'].every(function(k){return v[k]===undefined||str(v[k])})},
      plan:function(v){return obj(v)&&arr(v.rows)&&v.rows.every(function(r){return obj(r)&&num(r.no)&&id(r.tid)&&['todo','done','skip'].indexOf(r.status)>=0&&(r.date===undefined||str(r.date))})},
      members:function(v){return arr(v)&&v.every(function(m){return obj(m)&&id(m.id)&&str(m.n)&&(m.badge===undefined||obj(m.badge))&&(m.gh===undefined||arr(m.gh))&&(m.step===undefined||num(m.step))})},
      recs:function(v){return arr(v)&&v.every(function(r){return obj(r)&&num(r.no)&&id(r.tid)&&str(r.date)&&arr(r.present)&&r.present.every(id)&&(r.badges===undefined||arr(r.badges))&&(r.gh===undefined||arr(r.gh))})},
      mymeets:function(v){return arr(v)&&v.every(function(m){return obj(m)&&id(m.id)&&str(m.n)&&arr(m.stages)&&m.stages.every(stage)})},
      owners:strMap,meetmeta:strMap,msgTpl:function(v){return str(v)||strMap(v)},
      checkins:function(v){return obj(v)&&Object.keys(v).every(function(k){return arr(v[k])&&v[k].every(num)})},
      flow:function(v){return obj(v)&&(v.done===undefined||obj(v.done))},
      bagtick:function(v){return obj(v)&&Object.keys(v).every(function(k){return arr(v[k])})},
      packkid:obj,packcopies:num,packcur:function(v){return obj(v)&&['tpl','my'].indexOf(v.type)>=0&&id(v.id)},packsel:obj
    };
    for(var j=0;j<ks.length;j++){var k=ks[j];if(checks[k]&&!checks[k](d.keys[k]))return '備份資料組「'+k+'」格式唔正確 ✗';}
    return null;
  },
  importAll:function(inp){
    var f=inp&&inp.files&&inp.files[0];if(!f)return;
    var fr=new FileReader();
    fr.onload=function(){
      var d=null;try{d=JSON.parse(fr.result)}catch(e){}
      var err=App._validateBackup(d);
      if(err){toast(err);inp.value='';return}
      var finish=function(hashOk){
        if(hashOk===false){toast('備份校驗和唔符（檔案可能損壞）✗');inp.value='';return}
        var ks=Object.keys(d.keys);
        if(!confirm('讀入 '+ks.length+' 組資料（備份日期：'+String(d.at||'?').slice(0,10)+'）\n會先自動下載而家呢部機嘅備份，然後取代現有資料。繼續？')){inp.value='';return}
        App.exportAll(true).then(function(backedUp){
          if(backedUp===false){toast('匯入前自動備份失敗—為安全起見已取消匯入 ✗');inp.value='';return}
          var snapshot={},payload={};
          try{ks.forEach(function(k){payload[k]=JSON.stringify(d.keys[k])})}catch(e){toast('備份內容無法序列化 ✗');inp.value='';return}
          APP_DATA_KEYS.forEach(function(k){var raw=localStorage.getItem('gh_'+k);if(raw!==null)snapshot[k]=raw});
          var failed=null;
          try{ks.forEach(function(k){localStorage.setItem('gh_'+k,payload[k])})}catch(e){failed=(e&&e.name)||'StorageError'}
          if(failed){ /* 原子回滾：先清走新寫入，再原樣還原 snapshot */
            var rollbackOk=true;
            APP_DATA_KEYS.forEach(function(k){try{localStorage.removeItem('gh_'+k)}catch(e){rollbackOk=false}});
            Object.keys(snapshot).forEach(function(k){try{localStorage.setItem('gh_'+k,snapshot[k])}catch(e){rollbackOk=false}});
            Store.lastError=failed;
            toast(rollbackOk?'匯入失敗（'+failed+'）—已還原原本資料 ✗':'匯入失敗（'+failed+'）—回滾亦失敗，請用剛才下載嘅備份還原 ✗');
            inp.value='';return;
          }
          Store.lastError='';
          toast('讀入咗 ✓ 重新整理');
          setTimeout(function(){location.reload()},600);
        });
      };
      if(d.sha256){App._sha256(App._canonical(d.keys)).then(function(h){finish(h===d.sha256)});}
      else finish(null);
    };
    fr.onerror=function(){toast('讀唔到個 file ✗')};
    fr.readAsText(f);
  },
  saveSettings:function(){
    var s=Store.get('settings',{});
    s.group=document.getElementById('stG').value||'我的旅團';
    s.start=document.getElementById('stS').value;s.dur=document.getElementById('stD').value;
    s.leaders=(document.getElementById('stL').value||'').trim();
    s.time=(document.getElementById('stT').value||'').trim();s.place=(document.getElementById('stP').value||'').trim();
    s.phone=(document.getElementById('stPh').value||'').trim();
    if(!Store.set('settings',s))return;
    Modal.close();App.route();toast('已儲存 ✓');
  },
  /* ---- 年度規劃種子(跟隨開季月份排22次) ---- */
  /* localStorage 被清空／舊版本留低嘅殘缺資料都要開到 APP */
  plan:function(){
    var p=Store.get('plan');
    if(!p||!p.rows){App.seedPlan();p=Store.get('plan')||{rows:[]}}
    return p;
  },
  seedPlan:function(force){
    if(Store.get('plan')&&!force)return;
    var rows=TPLS.filter(function(t){return t.cat!=='gh'&&t.cat!=='custom'}).map(function(t,i){
      return {no:i+1,tid:t.id,status:'todo',date:''};
    });
    Store.set('plan',{rows:rows,ghdone:[]});
  }
};
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function toast(m){var t=document.createElement('toast');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},1900)}
function dur(n){return TPLS.find(function(t){return t.id===n})}
function matsOf(meet){var a=[];(meet.stages||[]).forEach(function(s){(s.mats||[]).forEach(function(m){if(a.indexOf(m)<0)a.push(m)})});return a}
var Modal={
  /* .sheet＝flex 欄：✕ 永遠釘喺最上；dialog 語義＋focus 管理＋Esc／背景關（A11y／I6） */
  _prevFocus:null,
  open:function(html){
    var root=document.getElementById('modal');
    Modal._prevFocus=document.activeElement;
    root.innerHTML='<div class="sheet" role="dialog" aria-modal="true" aria-label="對話框"><button class="x" onclick="Modal.close()" aria-label="關閉">✕</button><div class="sheet-body">'+html+'</div></div>';
    var sheet=(root.querySelector&&root.querySelector('.sheet'))||root.firstChild;
    if(!sheet||!sheet.querySelector)return;
    var h=sheet.querySelector('h1,h2,h3');
    if(h){if(!h.id)h.id='modal-title';sheet.setAttribute('aria-labelledby','modal-title');sheet.removeAttribute('aria-label')}
    var f=sheet.querySelector('input,select,textarea,button:not(.x),a[href]')||sheet.querySelector('.x');
    if(f&&f.focus)f.focus();
  },
  close:function(){
    document.getElementById('modal').innerHTML='';
    if(Modal._prevFocus&&Modal._prevFocus.focus)Modal._prevFocus.focus();
    Modal._prevFocus=null;
  },
  _key:function(e){
    var root=document.getElementById('modal');
    if(!root||!root.innerHTML)return;
    if(e.key==='Escape'){e.preventDefault();Modal.close();return}
    if(e.key==='Tab'){
      var items=root.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if(!items.length)return;
      var first=items[0],last=items[items.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  },
  _backdrop:function(e){if(e.target&&e.target.id==='modal')Modal.close()}
};
if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('keydown',function(e){Modal._key(e)});
  document.addEventListener('click',function(e){Modal._backdrop(e)});
  /* A11：用戶資料一律經 data-*＋事件綁定，唔拼入 onclick JS 字串 */
  document.addEventListener('click',function(e){
    var el=e.target;
    if(!el||!el.closest)return;
    var chip=el.closest('[data-owner-chip]');
    if(chip){e.preventDefault();if(typeof Kit!=='undefined'&&Kit.setOwner(chip.getAttribute('data-owner-key'),chip.getAttribute('data-owner-name'))!==false){toast('已記低負責領袖 ✓');App.route()}return}
    var pick=el.closest('[data-pick-tid]');
    if(pick){e.preventDefault();Modal.close();Flow.select(Number(pick.getAttribute('data-pick-no'))||0,pick.getAttribute('data-pick-tid'));return}
    var lead=el.closest('[data-lead-tid]');
    if(lead){e.preventDefault();Modal.close();Lead.start(lead.getAttribute('data-lead-tid'),Number(lead.getAttribute('data-lead-no'))||0);return}
    var row=el.closest('[data-plan-tid]');
    if(row&&!el.closest('a,button,input,select,textarea')){e.preventDefault();Flow.select(Number(row.getAttribute('data-plan-no'))||0,row.getAttribute('data-plan-tid'))}
  });
  document.addEventListener('keydown',function(e){
    var el=e.target;
    if(!el||!el.closest)return;
    var row=el.closest('[data-plan-tid]');
    if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();Flow.select(Number(row.getAttribute('data-plan-no'))||0,row.getAttribute('data-plan-tid'))}
  });
  document.addEventListener('change',function(e){
    var el=e.target;
    if(el&&el.getAttribute&&el.hasAttribute('data-owner-key')){
      if(typeof Kit!=='undefined'&&Kit.setOwner(el.getAttribute('data-owner-key'),el.value)!==false)toast('已記低負責領袖 ✓');
    }
  });
}

/* ================= 規劃 Plan ================= */
var Plan={
  /* 🅰️ 左1：22 次集會目錄＋時程。撳標題＝跳去該場睇詳細（流程・道具・帶領）；撳狀態＝改狀態/日期 */
  html:function(){
    var pl=App.plan();
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var done=pl.rows.filter(function(r){return r.status==='done'}).length;
    var nextT=next?dur(next.tid):null;
    var h='<section class="toc-hero"><span class="eyebrow">📅 22次集會目錄・時程</span><h1>撳一場，一步步預備。</h1>'+
      '<p>揀好場之後 STEP BY STEP 帶你：印教材 → 執袋 → 設場 → 帶領 → 記出席。</p>';
    if(nextT){
      h+='<div class="btns" style="margin:10px 0 0"><button class="btn primary" onclick="Lead.start(\''+nextT.id+'\','+next.no+')">▶ 帶第'+next.no+'次集會</button>';
      if(typeof Flow!=='undefined'){
        h+=Flow.on()?'<button class="btn sm ghost" onclick="Flow.quit()">🧭 嚮導行緊（撳收埋）</button>'
                    :'<button class="btn sm ghost" onclick="Flow.start()">🧭 帶我由頭做到尾</button>';
      }
      h+='</div>';
    }else{
      h+='<div class="attention" style="margin-top:10px"><b>🎉 全年流程完成</b> — 上面撳任何一場都可以重新帶領。</div>';
    }
    h+='<div class="stat" style="margin-top:10px"><div class="s"><b>'+(pl.rows.length-done)+'</b>尚餘集會</div><div class="s"><b>'+done+'/'+pl.rows.length+'</b>已完成</div></div></section>';
    h+='<div class="card"><h2>目錄 <span class="tag">'+pl.rows.length+' 次</span></h2>'+
      '<div class="mute" style="font-size:.82rem;margin-bottom:4px">撳<b>任何位置</b>＝入呢場嘅 STEP BY STEP 預備；撳<b>狀態</b>改完成・跳過・日期。</div>'+
      Plan.toc(pl)+'</div>';
    h+='<details class="card guide-more" style="padding:12px 14px"><summary>🗺️ 42 個月路線圖（團員章→進步獎章→小草蜢）</summary>'+
      '<div class="mute" style="font-size:.82rem">團員章 → 進步獎章（約 22 個月）→ 小草蜢獎章（7 範疇 ×2 體驗）→ 晉團幼童軍</div>'+Plan.roadmap()+'</details>';
    return h;
  },
  lenOf:function(t){return (t.stages||[]).reduce(function(a,s){return a+(+s.m||0)},0)},
  toc:function(pl){
    pl=pl||{rows:[]};if(!pl.rows)pl.rows=[];
    var cm=(typeof Pack!=='undefined')?Pack.meet():null;
    var h='';
    pl.rows.forEach(function(r){
      var t=dur(r.tid);if(!t)return;
      var st=r.status==='done'?'<span class="tag g">✓ 完成</span>':r.status==='skip'?'<span class="tag br">跳過</span>':'<span class="tag">未做</span>';
      var dt=r.date?esc(Kit.fmtDate(r.date)):esc(t.mo);
      var isCur=cm&&cm.tid===t.id&&((cm.no||0)===r.no);
      h+='<div class="toc-row'+(isCur?' on':'')+'" role="link" tabindex="0" title="入呢場嘅 STEP BY STEP 預備"'+
        ' data-plan-no="'+(Number(r.no)||0)+'" data-plan-tid="'+esc(t.id)+'"><b class="toc-no">'+(Number(r.no)||0)+'</b>'+
        '<div class="toc-mid"><b>'+esc(t.n)+'</b>'+(isCur?' <span class="tag g">今場</span>':'')+
        '<small class="mute">'+esc(t.theme)+'</small></div>'+
        '<div class="toc-right"><small class="mute">'+dt+'</small>'+
        '<a href="#plan" onclick="event.preventDefault();event.stopPropagation();Plan.rowAction('+(Number(r.no)||0)+')">'+st+'</a>'+
        '<b class="toc-go" aria-hidden="true">›</b></div></div>';
    });
    return h+'<div class="btns" style="margin-top:10px"><button class="btn sm ghost" onclick="Plan.markAllDone()">記低呢季完成晒</button></div>';
  },
  markAllDone:function(){var pl=App.plan();if(confirm('將所有未完成集會標記為完成?')){pl.rows.forEach(function(r){r.status='done'});Store.set('plan',pl);App.route()}},
  rowAction:function(no){
    var pl=App.plan();var r=pl.rows.find(function(x){return x.no===no});if(!r)return;var t=dur(r.tid)||{n:'（未知範本）',theme:''};
    Modal.open('<h3>第'+no+'次集會</h3><b>'+esc(t.n)+'</b><div class="mute" style="font-size:.85rem">'+esc(t.theme)+'</div>'+
      '<label class="f">狀態</label><div class="btns">'+
      '<button class="btn sm '+(r.status==='todo'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'todo\')">未做</button>'+
      '<button class="btn sm gr '+(r.status==='done'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'done\')">✓ 完成</button>'+
      '<button class="btn sm ghost" style="color:#4e342e" onclick="Plan.setRow('+no+',\'skip\')">跳過</button></div>'+
      '<label class="f">📅 今場日期（低一次，之後家長訊息、星期、截止日全部自動填）</label>'+
      '<div class="date-row"><input type="date" value="'+esc(r.date||'')+'" onchange="Plan.setDate('+no+',this.value)">'+(r.date?'<button class="btn sm ghost" onclick="Plan.setDate('+no+',\'\');Plan.rowAction('+no+')">清走</button>':'')+'</div>'+
      '<label class="f">改用其他範本</label><select onchange="Plan.swap('+no+',this.value)">'+
      TPLS.map(function(x){return '<option value="'+x.id+'"'+(x.id===r.tid?' selected':'')+'>'+esc(x.n)+'</option>'}).join('')+'</select>'+
      '<div class="btns" style="margin-top:12px"><button class="btn" data-pick-no="'+no+'" data-pick-tid="'+esc(r.tid)+'">🧭 揀呢場・STEP BY STEP 預備</button>'+
      '<button class="btn gr" data-lead-no="'+no+'" data-lead-tid="'+esc(r.tid)+'">▶ 直接帶領呢次</button></div>');
  },
  setRow:function(no,st){var pl=App.plan();var row=pl.rows.find(function(x){return x.no===no});if(!row)return;row.status=st;if(!Store.set('plan',pl))return;
    if(st==='done')Track.attendPrompt(no);else{Modal.close();App.route()}},
  setDate:function(no,v){
    if(typeof Kit!=='undefined'&&Kit.setPlanDate){Kit.setPlanDate(no,v)}
    else{var pl=App.plan();var r=pl.rows.find(function(x){return x.no===no});if(r){r.date=v||'';Store.set('plan',pl)}}
    if(typeof App!=='undefined')App.route();
    Modal.close();
  },
  swap:function(no,tid){var pl=App.plan();var row=pl.rows.find(function(x){return x.no===no});if(!row)return;row.tid=tid;if(!Store.set('plan',pl))return;toast('已換範本');Modal.close();App.route()},
  roadmap:function(){
    var mem=Store.get('members')||[];
    var avgStep=mem.length?Math.round(mem.reduce(function(a,m){return a+(m.step||0)},0)/mem.length):0;
    var stops=[
      {t:'👑 團員章',d:'參加4次集會+完成基本常識(唱主題歌/揚動快樂傘/整理領巾)、誓詞規律口號、保護自己',mo:'第1–2個月',ok:mem.length&&mem.every(function(m){return Track.memberDone(m)})},
      {t:'🔴 進步獎章・第一步',d:'參加約5-6個月',mo:'第6個月',ok:avgStep>=1},
      {t:'🟤 進步獎章・第二步',d:'參加約11-12個月',mo:'第12個月',ok:avgStep>=2},
      {t:'🔵 進步獎章・第三步',d:'參加約16-18個月',mo:'第18個月',ok:avgStep>=3},
      {t:'🟢 進步獎章・第四步',d:'參加約22個月',mo:'第22個月',ok:avgStep>=4},
      {t:'🦗 小草蜢獎章',d:'6歲起開展,七大範疇各2項體驗(每範疇可獲體驗證書),約18個月完成',mo:'第22–40個月',ok:mem.length&&mem.every(function(m){return Track.ghDone(m)})},
      {t:'🎒 晉團幼童軍',d:'8歲生日,展開新旅程',mo:'第40個月+',ok:false}
    ];
    return '<div class="road">'+stops.map(function(s){return '<div class="stop'+(s.ok?' done':'')+'"><b>'+s.t+'</b> <span class="tag">'+s.mo+'</span><br><small class="mute">'+s.d+'</small></div>'}).join('')+'</div>';
  }
};
