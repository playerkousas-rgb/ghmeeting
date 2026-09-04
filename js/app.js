/* 🦗 app.js — 核心:路由、資料存取、規劃(年度行事曆+42個月路線圖) © 2026 Scout System */
var Store={
  get:function(k,d){try{var v=localStorage.getItem('gh_'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem('gh_'+k,JSON.stringify(v))}catch(e){}},
  del:function(k){localStorage.removeItem('gh_'+k)}
};
var App={
  view:'plan',
  init:function(){
    if(!Store.get('settings'))Store.set('settings',{group:'我的旅團',start:'9',dur:'60',startDate:''});
    if(!Store.get('plan'))App.seedPlan();
    if(!Store.get('members'))Store.set('members',[]);
    if(!Store.get('mymeets'))Store.set('mymeets',[]);
    addEventListener('hashchange',function(){App.route()});
    App.route();
  },
  route:function(){
    var h=(location.hash||'#plan').slice(1).split('?')[0];
    if(document.body.contains(document.getElementById('leadroot'))&&!document.getElementById('leadroot').classList.contains('hidden'))Lead.exit(false);
    var v={plan:'plan',meet:'meet',play:'play',lead:'lead',track:'track',book:'book',print:'print'}[h]||'plan';
    App.view=v;
    document.querySelectorAll('#tabbar a').forEach(function(a){a.classList.toggle('on',a.dataset.tab===v)});
    var el=document.getElementById('view');
    if(v==='plan')el.innerHTML=Plan.html();
    if(v==='meet')el.innerHTML=Prepare.html();
    if(v==='play')el.innerHTML=Play.html();
    if(v==='lead')el.innerHTML=Lead.html();
    if(v==='track')el.innerHTML=Track.html();
    if(v==='book')el.innerHTML=HB.html();
    if(v==='print')el.innerHTML=PrintKit.html();
    scrollTo(0,0);
  },
  go:function(h){location.hash=h},
  /* ---- 隨手開會快速面板 ---- */
  quickHub:function(){
    var pl=Store.get('plan',{rows:[]});
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var nextT=next?dur(next.tid):dur('t01');
    var h='<div class="quick-hub-header"><span class="eyebrow">⚡ 一APP在手・集會隨手</span><h3>即刻開會・零物資救急</h3><p class="mute" style="font-size:.83rem">全數碼內置教具、伴奏、計分與遊戲，拎起手機隨時出發！</p></div>'+
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
      '<div class="card" style="border:1.5px solid var(--line);padding:12px;margin:8px 0"><h4 style="margin:0 0 6px;color:var(--ord)">🧭 開會前點預備（叫你做 → 教你點做）</h4>'+
        '<div class="mute" style="font-size:.78rem;margin-bottom:8px">物資每人幾多、場地檢查咩、家長訊息點寫、章項去邊度教—全部有清單同範本，唔使自己由零估。</div>'+        '<div class="quick-tools-row">'+
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
    var meets={
      general:{
        n:'即興・歡樂綜合數碼集會 ('+mins+'分鐘)',theme:'破冰認識・主題曲・小草蜢互動・反應遊戲',
        stages:[
          {t:'儀式',n:'開心快樂傘(開會)',m:5,how:'齊唸口號「小童軍向前進」揚傘開會。',script:'「全體預備——小童軍向前進！」',screen:'chuteopen'},
          {t:'唱遊',n:'學唱小童軍主題曲',m:mins===60?10:7,how:'跟隨畫面伴奏逐句齊唱並做動作。',script:'「小小童軍向前進——舉高雙手！」',screen:'song'},
          {t:'課程',n:'認識小草蜢與大自然',m:10,how:'觀看小草蜢圖鑑，學習草蜢活潑特徵。',script:'「小草蜢跳得高、天天向上，好似小童軍一樣！」',screen:'ghinfo'},
          {t:'遊戲',n:'捉草蜢(眼明手快)',m:8,how:'點擊彈出的小草蜢搶分。',script:'「小草蜢跳出嚟喇！快啲撳佢！」',screen:'catch'},
          mins===60?{t:'遊戲',n:'領袖話(體能版)',m:10,how:'聽領袖指令做動作，訓練聽力與專注。',script:'「領袖話——摸摸膝頭！」',screen:'leader'}:null,
          {t:'靜息',n:'靜息深呼吸',m:3,how:'跟隨畫面圓圈緩慢深呼吸。',script:'「吸氣——呼氣——放鬆全身。」',screen:'breath'},
          {t:'儀式',n:'開心快樂傘(散會)',m:mins===60?5:4,how:'齊唸口號散會。',script:'「今日集會完滿結束！小童軍——向前進！」',screen:'chuteclose'}
        ].filter(Boolean)
      },
      safety:{
        n:'即興・自我保護與安全 ('+mins+'分鐘)',theme:'身體界線・紅黃綠燈・安全求助',
        stages:[
          {t:'儀式',n:'開心快樂傘(開會)',m:5,how:'齊唸口號揚傘開會。',script:'「今日我哋學識保護自己！」',screen:'chuteopen'},
          {t:'課程',n:'身體地圖紅黃綠',m:12,how:'點擊身體部位學習身體界線，大聲練習講「唔好」。',script:'「你嘅身體屬於你！紅色部位唔可以隨便掂！」',screen:'bodycard'},
          {t:'遊戲',n:'對錯法庭(保護篇)',m:mins===60?12:10,how:'舉手判斷安全情景，建立信任求助圈。',script:'「呢件事啱定錯？判——」',screen:'judge'},
          mins===60?{t:'唱遊',n:'小童軍主題曲',m:8,how:'伴奏齊唱主題曲。',script:'「小童軍愛護自己、日行一善！」',screen:'song'}:null,
          {t:'遊戲',n:'紅綠燈(交通安全版)',m:mins===60?10:8,how:'綠燈行、紅燈停，學習安全守則。',script:'「綠燈行——紅燈停！」',screen:'traffic'},
          {t:'靜息',n:'靜息深呼吸',m:3,how:'深呼吸冷靜放鬆。',script:'「吸氣——呼氣。」',screen:'breath'},
          {t:'儀式',n:'開心快樂傘(散會)',m:4,how:'齊唸口號散會。',script:'「記住：有事搵信任大人求助！散會！」',screen:'chuteclose'}
        ].filter(Boolean)
      },
      health:{
        n:'即興・健康生活好幫手 ('+mins+'分鐘)',theme:'洗手七步・彩虹飲食・家務挑戰',
        stages:[
          {t:'儀式',n:'開心快樂傘(開會)',m:5,how:'齊唸口號揚傘開會。',script:'「今日做個健康清潔好寶寶！」',screen:'chuteopen'},
          {t:'課程',n:'洗手七步好寶寶',m:10,how:'跟隨七步洗手圖解與 20 秒倒數計時歌做洗手操。',script:'「內外夾弓大立腕——細菌全走開！」',screen:'clean'},
          {t:'課程',n:'彩虹健康飲食盤',m:mins===60?12:10,how:'探索五色蔬果好處。',script:'「多食彩虹食物，身體健康！」',screen:'foodrainbow'},
          {t:'遊戲',n:'任務抽籤機(家務善行)',m:8,how:'轉動抽籤機抽取今日日行一善家務。',script:'「抽中邊個家務任務？返屋企實踐！」',screen:'task'},
          mins===60?{t:'遊戲',n:'節奏模仿律動',m:10,how:'跟隨節奏拍手敲擊。',script:'「跟住螢幕節奏拍拍手！」',screen:'rhythm'}:null,
          {t:'靜息',n:'靜息深呼吸',m:3,how:'深呼吸放鬆。',script:'「吸氣——呼氣。」',screen:'breath'},
          {t:'儀式',n:'開心快樂傘(散會)',m:4,how:'齊唸口號散會。',script:'「日行一善由屋企開始！散會！」',screen:'chuteclose'}
        ].filter(Boolean)
      },
      nature:{
        n:'即興・環保與大自然 ('+mins+'分鐘)',theme:'三色回收・動植物常識・愛護地球',
        stages:[
          {t:'儀式',n:'開心快樂傘(開會)',m:5,how:'齊唸口號揚傘開會。',script:'「地球病咗，等小童軍救佢！」',screen:'chuteopen'},
          {t:'課程',n:'三色回收分類擂台',m:12,how:'點擊藍黃綠回收桶搶分，學習乾淨回收。',script:'「鋁罐去黃桶，膠樽去綠桶！」',screen:'recycle'},
          {t:'遊戲',n:'問答擂台(大自然常識)',m:10,how:'自然動植物題目搶答。',script:'「香港市花係——洋紫荊！」',screen:'quiz'},
          {t:'遊戲',n:'估估下(動植物剪影)',m:mins===60?10:8,how:'剪影猜動物植物。',script:'「呢個識飛嘅係咩生物？」',screen:'guess'},
          mins===60?{t:'遊戲',n:'捉草蜢(自然探險版)',m:8,how:'眼明手快捉草蜢。',script:'「小草蜢跳出嚟喇！」',screen:'catch'}:null,
          {t:'靜息',n:'靜息深呼吸',m:3,how:'放鬆呼吸。',script:'「吸氣——呼氣。」',screen:'breath'},
          {t:'儀式',n:'開心快樂傘(散會)',m:4,how:'齊唸口號散會。',script:'「愛護大自然！散會！」',screen:'chuteclose'}
        ].filter(Boolean)
      },
      fitness:{
        n:'即興・體能與反應大冒險 ('+mins+'分鐘)',theme:'肢體律動・紅綠燈・速度反應',
        stages:[
          {t:'儀式',n:'開心快樂傘(開會)',m:5,how:'齊唸口號揚傘開會。',script:'「今日動起來！」',screen:'chuteopen'},
          {t:'遊戲',n:'紅綠燈(衝刺版)',m:10,how:'紅燈停綠燈跑，訓練心肺與反應。',script:'「綠燈行——紅燈停！」',screen:'traffic'},
          {t:'遊戲',n:'領袖話(大動作版)',m:10,how:'單腳企、摸腳尖、草蜢跳。',script:'「領袖話——草蜢跳五下！」',screen:'leader'},
          {t:'遊戲',n:'捉草蜢(極速挑戰)',m:8,how:'限時 30 秒挑戰最高分。',script:'「突破最高分！」',screen:'catch'},
          mins===60?{t:'遊戲',n:'記憶配對(運動版)',m:10,how:'翻牌配對訓練記憶力。',script:'「記住圖案位置！」',screen:'memory'}:null,
          {t:'靜息',n:'靜息深呼吸+拉筋',m:3,how:'跟隨圓圈深呼吸放鬆肌肉。',script:'「吸——呼——」',screen:'breath'},
          {t:'儀式',n:'開心快樂傘(散會)',m:4,how:'齊唸口號散會。',script:'「個個都係運動家！散會！」',screen:'chuteclose'}
        ].filter(Boolean)
      }
    };
    var t=meets[theme]||meets.general;
    Lead.cleanupTimers();
    Lead.S={meet:JSON.parse(JSON.stringify(t)),idx:0,left:(t.stages[0].m||5)*60,timerOn:false,no:0};
    Lead.open();
    toast('⚡ 已啟動「'+t.n+'」！');
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
      '<hr class="soft"><div class="mute" style="font-size:.78rem">💾 <b>備份</b>：資料只存喺呢部裝置—換機/清理瀏覽器之前，save 一個 file 就唔會歸零。<br>'+      '<div class="btns" style="margin-top:6px"><button class="btn sm ghost" onclick="App.exportAll()">📦 匯出全部資料（一個 file）</button>'+      '<button class="btn sm ghost" onclick="document.getElementById(\'imF\').click()">📥 讀返一個備份</button>'+      '<input type="file" id="imF" accept="application/json,.json,text/plain" style="display:none" onchange="App.importAll(this)"></div>'+      '<div class="mute" style="font-size:.72rem;margin-top:5px">匯入會取代呢部裝置現有資料（名單＋規劃＋紀錄＋自製集會）。</div>'+      '<hr class="soft"><div class="mute" style="font-size:.78rem">🧹 重建年度行事曆會重設規劃表(唔影響團員資料):<br><button class="btn sm ghost" onclick="App.seedPlan(true);Modal.close();toast(\'已重建年度行事曆\')">重建行事曆</button> '+
      '<button class="btn sm ghost rd" style="color:#b71c1c;border-color:#e53935" onclick="if(confirm(\'清除所有本機資料(含團員/集會/規劃)?\')){localStorage.clear();location.reload()}">清除全部資料</button></div>');
  },
  exportAll:function(){
    var keys=['settings','plan','members','recs','mymeets','owners','meetmeta','msgTpl','checkins'],data={app:'ghmeeting',ver:1,at:new Date().toISOString(),keys:{}};
    keys.forEach(function(k){var v=Store.get(k,null);if(v!==null&&v!==undefined)data.keys[k]=v});
    try{
      var blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'});
      var a=document.createElement('a');a.href=URL.createObjectURL(blob);
      a.download='小童軍集會助手-備份-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(a.href)},4000);
      toast('已 save 咗一個備份 file ✓ 放去安全地方');
    }catch(e){toast('export 唔到：'+e.message)}
  },
  importAll:function(inp){
    var f=inp&&inp.files&&inp.files[0];if(!f)return;
    var fr=new FileReader();
    fr.onload=function(){
      var d=null;try{d=JSON.parse(fr.result)}catch(e){}
      if(!d||!d.keys){toast('呢個唔似備份 file ✗');inp.value='';return}
      var ks=Object.keys(d.keys);
      if(!confirm('讀入 '+ks.length+' 組資料（備份日期：'+String(d.at||'?').slice(0,10)+'）\n而家呢部機嘅名單／規劃／紀錄會被取代。繼續？')){inp.value='';return}
      ks.forEach(function(k){Store.set(k,d.keys[k])});
      toast('讀入咗 ✓ 重新整理');
      setTimeout(function(){location.reload()},600);
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
    Store.set('settings',s);Modal.close();App.route();toast('已儲存 ✓');
  },
  /* ---- 年度規劃種子(跟隨開季月份排22次) ---- */
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
  open:function(html){document.getElementById('modal').innerHTML='<div class="sheet"><button class="x" onclick="Modal.close()">✕</button>'+html+'</div>'},
  close:function(){document.getElementById('modal').innerHTML=''}
};

/* ================= 規劃 Plan ================= */
var Plan={
  html:function(){
    var s=Store.get('settings'),pl=Store.get('plan'),mem=Store.get('members');
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var done=pl.rows.filter(function(r){return r.status==='done'}).length;
    var nextT=next?dur(next.tid):null;
    var h='<section class="ready-hero"><span class="eyebrow">🦗 '+esc(s.group)+'・一APP在手 集會隨手</span><h1>拎起手機，集會即開即玩。</h1><p><b>100% 內置數碼道具與互動</b>：零物資準備、免印刷、免剪貼！開會口號、主題曲伴奏、互動教學、遊戲擂台與出席記錄，一機全包。<b>用心準備實體？</b> 亦可一鍵打印 A4 教材套包！</p>'+
      '<div class="action-grid"><button class="btn primary" onclick="'+(nextT?"Lead.start('"+nextT.id+"',"+next.no+")":"Lead.start('t01')")+'">⚡ '+(nextT?'隨手帶領第'+next.no+'次集會':'開始第1次集會')+'</button>'+
      '<button class="btn ghost" onclick="App.quickHub()">🎲 隨手開會面板</button>'+
      '<button class="btn ghost" onclick="App.go(\'#print\')" style="background:#e8f5e9;color:#1b5e20;border-color:#81c784">🖨️ A4 打印教材套包</button></div>'+
      (nextT?'<div class="next-strip"><span style="font-size:1.7rem">📅</span><div class="next-copy"><small>今日進度推薦</small><b>'+esc(nextT.n)+'</b><small>'+esc(nextT.theme)+'・約 '+Plan.lenOf(nextT)+' 分鐘</small></div><button class="btn sm gr" onclick="Lead.start(\''+nextT.id+'\','+next.no+')">▶ 即開</button></div>':'<div class="attention" style="margin-top:12px"><b>🎉 全年流程完成</b><br>可以去「集會」揀一張卡，或者隨時點擊「隨手開會面板」即興帶領。</div>')+
      '<div class="quick-tools-strip"><span style="font-size:.78rem;font-weight:800;color:var(--ord);display:block;margin-bottom:4px">🧰 現場隨手救急快鍵：</span>'+
        '<button class="pill" onclick="Lead.quietQuick()">🤫 5秒安靜</button>'+
        '<button class="pill" onclick="Sfx.whistle();toast(\'🎺 嗶————！集合！\')">🎺 吹哨</button>'+
        '<button class="pill" onclick="Sfx.horn();toast(\'📯 號角響起！\')">📯 號角</button>'+
        '<button class="pill" onclick="Lead.quickTool(\'wheel\')">🎲 點名抽籤</button>'+
        '<button class="pill" onclick="Lead.quickTool(\'score\')">🥇 計分板</button>'+
        '<button class="pill" onclick="Lead.quickTool(\'group\')">👥 分組機</button>'+
        '<button class="pill" onclick="Kit.searchOpen()">🔍 全站搵嘢</button>'+
        '<button class="pill" onclick="Kit.hubOpen()">🧰 點預備・檢查表</button>'+
      '</div>'+
      '</section><div class="steps-banner"><div class="mini-step"><b>01・即開</b>撳一下全螢幕帶領，免準備道具</div><div class="mini-step"><b>02・互動</b>小朋友睇螢幕玩遊戲，領袖睇講稿</div><div class="mini-step"><b>03・記出席</b>完場一鍵打卡，進度自動保存</div></div>'+
      '<div class="stat"><div class="s"><b>'+(pl.rows.length-done)+'</b>尚餘集會</div><div class="s"><b>'+done+'/'+pl.rows.length+'</b>已完成</div><div class="s"><b>'+mem.length+'</b>團員</div></div>';
    h+='<div class="card"><h2>🗓️ 年度行事曆 <span class="tag">'+done+'/'+pl.rows.length+' 完成</span></h2>'+
      '<div class="mute" style="font-size:.82rem;margin-bottom:8px">已按小童軍成長節奏排好：先熟習團生活，再逐步加入生活技能、合作、戶外和節日活動。撳任何一格可以換卡、標記完成或直接開始。</div>'+
      Plan.calendar(pl)+'</div>';
    h+='<div class="card"><h2>🗺️ 42個月完整路線圖</h2><div class="mute" style="font-size:.82rem">團員章 → 四級進步獎章(約22個月)→ 小草蜢獎章(7範疇×2體驗)→ 晉團幼童軍</div>'+Plan.roadmap()+'</div>';
    h+='<div class="card"><h2>🦗 小草蜢歷險(6歲起)</h2><div class="mute" style="font-size:.82rem;margin-bottom:8px">七大範疇各完成2項體驗=小草蜢獎章。app 已為每個範疇預備一次集會範本。</div><div class="grid2">'+
      DATA.ghDomains.map(function(d,i){var t=TPLS.filter(function(x){return x.cat==='gh'})[i];
        return '<div class="mem"><h4>'+d.ic+' '+d.n+'</h4><small class="mute">範本:'+esc(t.n)+'</small><div class="btns" style="margin:6px 0 0"><button class="btn sm ghost" onclick="App.go(\'#meet\');setTimeout(function(){Prepare.detail(\''+t.id+'\')},50)">查看</button><button class="btn sm" onclick="Lead.start(\''+t.id+'\')">▶</button></div></div>'}).join('')+
      '</div></div>';
    return h;
  },
  lenOf:function(t){return (t.stages||[]).reduce(function(a,s){return a+(+s.m||0)},0)},
  calendar:function(pl){
    var h='<div class="tbl"><tr><th>#</th><th>集會</th><th>狀態</th></tr>';
    pl.rows.forEach(function(r){
      var t=dur(r.tid);if(!t)return;
      var st=r.status==='done'?'<span class="tag g">✓ 完成</span>':r.status==='skip'?'<span class="tag br">跳過</span>':'<span class="tag">未做</span>';
      h+='<tr style="cursor:pointer;'+(r.status==='todo'?'':'opacity:.75')+'" onclick="Plan.rowAction('+r.no+')"><td><b>'+r.no+'</b><br><small class="mute">'+(r.date?esc(Kit.fmtDate(r.date))+'・'+esc(t.mo):esc(t.mo))+'</small></td>'+
        '<td><a href="#meet" onclick="event.preventDefault();event.stopPropagation();Prepare.detail(\''+t.id+'\')"><b>'+esc(t.n)+'</b></a><br><small class="mute">'+esc(t.theme)+'</small></td><td>'+st+'</td></tr>';
    });
    return h+'</div><div class="btns"><button class="btn sm ghost" onclick="Plan.markAllDone()">記低呢季完成晒</button></div>';
  },
  markAllDone:function(){var pl=Store.get('plan');if(confirm('將所有未完成集會標記為完成?')){pl.rows.forEach(function(r){r.status='done'});Store.set('plan',pl);App.route()}},
  rowAction:function(no){
    var pl=Store.get('plan');var r=pl.rows.find(function(x){return x.no===no});var t=dur(r.tid);
    Modal.open('<h3>第'+no+'次集會</h3><b>'+esc(t.n)+'</b><div class="mute" style="font-size:.85rem">'+esc(t.theme)+'</div>'+
      '<label class="f">狀態</label><div class="btns">'+
      '<button class="btn sm '+(r.status==='todo'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'todo\')">未做</button>'+
      '<button class="btn sm gr '+(r.status==='done'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'done\')">✓ 完成</button>'+
      '<button class="btn sm ghost" style="color:#4e342e" onclick="Plan.setRow('+no+',\'skip\')">跳過</button></div>'+
      '<label class="f">📅 今場日期（低一次，之後家長訊息、星期、截止日全部自動填）</label>'+
      '<div class="date-row"><input type="date" value="'+esc(r.date||'')+'" onchange="Plan.setDate('+no+',this.value)">'+(r.date?'<button class="btn sm ghost" onclick="Plan.setDate('+no+',\'\');Plan.rowAction('+no+')">清走</button>':'')+'</div>'+
      '<label class="f">改用其他範本</label><select onchange="Plan.swap('+no+',this.value)">'+
      TPLS.map(function(x){return '<option value="'+x.id+'"'+(x.id===r.tid?' selected':'')+'>'+esc(x.n)+'</option>'}).join('')+'</select>'+
      '<div class="btns" style="margin-top:12px"><button class="btn gr" onclick="Modal.close();Lead.start(\''+r.tid+'\','+no+')">▶ 帶領呢次</button></div>');
  },
  setRow:function(no,st){var pl=Store.get('plan');pl.rows.find(function(x){return x.no===no}).status=st;Store.set('plan',pl);
    if(st==='done')Track.attendPrompt(no);else{Modal.close();App.route()}},
  setDate:function(no,v){
    if(typeof Kit!=='undefined'&&Kit.setPlanDate){Kit.setPlanDate(no,v)}
    else{var pl=Store.get('plan');var r=pl.rows.find(function(x){return x.no===no});if(r){r.date=v||'';Store.set('plan',pl)}}
    if(typeof App!=='undefined')App.route();
    Modal.close();
  },
  swap:function(no,tid){var pl=Store.get('plan');pl.rows.find(function(x){return x.no===no}).tid=tid;Store.set('plan',pl);toast('已換範本');Modal.close();App.route()},
  roadmap:function(){
    var mem=Store.get('members');
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
