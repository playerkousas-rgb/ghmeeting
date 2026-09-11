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
    var v={pack:'pack',plan:'plan',meet:'meet',play:'play',lead:'lead',track:'track',book:'book',print:'print',
           chute:'chute',song:'song',tools:'tools',prep:'prep'}[h]||'plan';
    App.view=v;
    /* 🅰️ 上方五入口 ＋ 🅱️ 下方即插即用五格：兩條 bar 都要著返正確嗰格 */
    document.querySelectorAll('#tabbar a, #topnav a').forEach(function(a){a.classList.toggle('on',a.dataset.tab===v)});
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
    el.innerHTML+='<div class="app-foot">© Scout System・v4.6</div>'; /* v號跟 sw.js CACHE 版本行（改一齊） */
    if(typeof Flow!=='undefined')Flow.render();   /* 🧭 嚮導條跟住畫面更新 */
    scrollTo(0,0);
  },
  go:function(h){location.hash=h},
  /* ---- 隨手開會快速面板 ---- */
  quickHub:function(){
    var pl=Store.get('plan',{rows:[]});
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var nextT=next?dur(next.tid):dur('t01');
    var h='<div class="quick-hub-header"><span class="eyebrow">⚡ 隨手開會</span><h3>即刻開會・零物資</h3></div>'+
      '<div class="card" style="background:#fff4e6;border:2px solid #ffd9a8;padding:12px;margin:8px 0"><b style="color:var(--ord)">📦 想印齊今場教材？</b><div class="btns" style="margin:6px 0 0"><button class="btn blk" onclick="Modal.close();App.go(\'#pack\')">📦 去官方套包（一撳印齊）</button></div></div>'+
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
    var t=(typeof Pack!=='undefined')?Pack.instantMeet(theme,mins):null;
    if(!t)return;
    Lead.cleanupTimers();
    Lead.S={meet:t,idx:0,left:(t.stages[0].m||5)*60,timerOn:false,no:0};
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
  /* .sheet＝flex 欄：✕ 永遠釘喺最上（唔隨內容滑走，拉到最底都關到）；.sheet-body 先係捲動區 */
  open:function(html){document.getElementById('modal').innerHTML='<div class="sheet"><button class="x" onclick="Modal.close()" aria-label="關閉">✕</button><div class="sheet-body">'+html+'</div></div>'},
  close:function(){document.getElementById('modal').innerHTML=''}
};

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
        ' onclick="Flow.select('+r.no+',\''+t.id+'\')"'+
        ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();Flow.select('+r.no+',\''+t.id+'\')}"><b class="toc-no">'+r.no+'</b>'+
        '<div class="toc-mid"><b>'+esc(t.n)+'</b>'+(isCur?' <span class="tag g">今場</span>':'')+
        '<small class="mute">'+esc(t.theme)+'</small></div>'+
        '<div class="toc-right"><small class="mute">'+dt+'</small>'+
        '<a href="#plan" onclick="event.preventDefault();event.stopPropagation();Plan.rowAction('+r.no+')">'+st+'</a>'+
        '<b class="toc-go" aria-hidden="true">›</b></div></div>';
    });
    return h+'<div class="btns" style="margin-top:10px"><button class="btn sm ghost" onclick="Plan.markAllDone()">記低呢季完成晒</button></div>';
  },
  markAllDone:function(){var pl=App.plan();if(confirm('將所有未完成集會標記為完成?')){pl.rows.forEach(function(r){r.status='done'});Store.set('plan',pl);App.route()}},
  rowAction:function(no){
    var pl=App.plan();var r=pl.rows.find(function(x){return x.no===no});var t=dur(r.tid);
    Modal.open('<h3>第'+no+'次集會</h3><b>'+esc(t.n)+'</b><div class="mute" style="font-size:.85rem">'+esc(t.theme)+'</div>'+
      '<label class="f">狀態</label><div class="btns">'+
      '<button class="btn sm '+(r.status==='todo'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'todo\')">未做</button>'+
      '<button class="btn sm gr '+(r.status==='done'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'done\')">✓ 完成</button>'+
      '<button class="btn sm ghost" style="color:#4e342e" onclick="Plan.setRow('+no+',\'skip\')">跳過</button></div>'+
      '<label class="f">📅 今場日期（低一次，之後家長訊息、星期、截止日全部自動填）</label>'+
      '<div class="date-row"><input type="date" value="'+esc(r.date||'')+'" onchange="Plan.setDate('+no+',this.value)">'+(r.date?'<button class="btn sm ghost" onclick="Plan.setDate('+no+',\'\');Plan.rowAction('+no+')">清走</button>':'')+'</div>'+
      '<label class="f">改用其他範本</label><select onchange="Plan.swap('+no+',this.value)">'+
      TPLS.map(function(x){return '<option value="'+x.id+'"'+(x.id===r.tid?' selected':'')+'>'+esc(x.n)+'</option>'}).join('')+'</select>'+
      '<div class="btns" style="margin-top:12px"><button class="btn" onclick="Modal.close();Flow.select('+no+',\''+r.tid+'\')">🧭 揀呢場・STEP BY STEP 預備</button>'+
      '<button class="btn gr" onclick="Modal.close();Lead.start(\''+r.tid+'\','+no+')">▶ 直接帶領呢次</button></div>');
  },
  setRow:function(no,st){var pl=App.plan();pl.rows.find(function(x){return x.no===no}).status=st;Store.set('plan',pl);
    if(st==='done')Track.attendPrompt(no);else{Modal.close();App.route()}},
  setDate:function(no,v){
    if(typeof Kit!=='undefined'&&Kit.setPlanDate){Kit.setPlanDate(no,v)}
    else{var pl=App.plan();var r=pl.rows.find(function(x){return x.no===no});if(r){r.date=v||'';Store.set('plan',pl)}}
    if(typeof App!=='undefined')App.route();
    Modal.close();
  },
  swap:function(no,tid){var pl=App.plan();pl.rows.find(function(x){return x.no===no}).tid=tid;Store.set('plan',pl);toast('已換範本');Modal.close();App.route()},
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
