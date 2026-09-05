/* 🦗 pack.js — 集會套包：新領袖一撳就攞到今場所有教材（分開「領袖用」同「小朋友即用紙」） © 2026 Scout System */
/* 目標：開會前一晚，一個按鈕印齊 → 執袋 → 第二日拎起就用。
   兩疊紙分得清清楚楚：領袖套包＝說明／流程／清單；小朋友套包＝印完即剪即摺即用，紙上冇說明書。 */
var Pack={
  /* ---------- 套包內容：預設只印三樣必要嘅紙，其餘全部喺 APP 內睇（慳紙） ---------- */
  /* print:1 = 預設印（紙先至做到嘅嘢：小朋友剪摺、貼地、領袖手揸一頁流程）
     print:0 = 預設唔印，撳「📱 APP 睇」即用（可以剔返開嚟印） */
  PARTS:[
    {k:'kid',    ic:'✂️', n:'小朋友圖紙', who:'kid', print:1, per:1, d:'即用紙・印完即剪・每人一份', app:'kid', at:'📱 手機睇樣'},
    {k:'floor',  ic:'🦗', n:'場地圖紙（貼地）', who:'kid', print:1, cond:1, d:'九宮格／角牌・貼地即用', app:'floor', at:'📱 投影設場'},
    {k:'cover',  ic:'📋', n:'今場程序表（1 頁）', who:'lead', print:1, d:'時間＋照讀一句・手揸一頁就夠'},
    {k:'bag',    ic:'🧺', n:'執袋單', who:'lead', print:0, d:'APP 內剔住執・已計人手', app:'bag'},
    {k:'cards',  ic:'🃏', n:'環節帶領卡', who:'lead', print:0, d:'跟綠色領袖欄就得', app:'cards'},
    {k:'craftc', ic:'📚', n:'手工自學卡', who:'lead', print:0, cond:1, d:'開會前 3 分鐘喺 APP 睇', app:'craftc'},
    {k:'venue',  ic:'📍', n:'設場清單', who:'lead', print:0, cond:1, d:'到場 30 分鐘逐項剔', app:'venue'},
    {k:'check',  ic:'🧭', n:'檢查表', who:'lead', print:0, cond:1, d:'APP 內剔・剔咗會記住', app:'check'},
    {k:'notice', ic:'📣', n:'家長通知', who:'lead', print:0, d:'一撳複製貼 WhatsApp', app:'notice'},
    {k:'cert',   ic:'🏅', n:'嘉許狀', who:'lead', print:0, cond:1, d:'完場先印・按名單一人一張', app:'cert'}
  ],
  /* 唔使印嘅嘢 → APP 內邊度睇 */
  appView:function(k){
    var cur=Pack.meet(),m=cur.m;
    if(k==='kid'){
      var ls=Pack.kidPicks(m);
      if(!ls.length){toast('呢場冇小朋友紙');return}
      Modal.open('<div class="eyebrow">✂️ 小朋友圖紙</div><h3>手機睇樣</h3>'+
        '<div class="mute" style="font-size:.82rem">印之前先睇清楚張紙。要剪要摺，始終要印出嚟。</div>'+
        ls.map(function(x){return '<div class="pk-prev">'+x.ic+' '+esc(x.n)+Sheets.one(x.kind,x.k)+'</div>'}).join(''));
      return;
    }
    if(k==='floor')return PrintKit.openModal('floor-grid');
    if(k==='bag')return Pack.bagModal();
    if(k==='cards'){Modal.close();Prepare._detailId=cur.tid;Prepare.detail(cur.tid);return}
    if(k==='craftc'){
      var cs=Sheets.forMeet(m).filter(function(x){return x.kind==='craft'});
      if(!cs.length){toast('呢場冇手工環節');return}
      if(cs.length===1){Modal.close();Craft.open(Sheets.craftFor({n:cs[0].stage})||cs[0].k);return}
      Modal.open('<h3>📚 手工自學卡</h3><div class="mute" style="font-size:.82rem">揀一樣，開會前 3 分鐘睇完就帶得。</div>'+
        '<div class="kit-grid" style="margin-top:8px">'+cs.map(function(x){
          return '<button class="btn sm gr" onclick="Modal.close();Craft.open(\''+x.k+'\')">'+x.ic+' '+esc(x.n)+'</button>'}).join('')+'</div>');
      return;
    }
    if(k==='venue')return Venue.open();
    if(k==='check')return Kit.openCheckFor(m);
    if(k==='notice')return Kit.msgOpen(Kit.ctxFor(cur.tid));
    if(k==='cert')return PrintKit.openModal('cert-sheet');
  },
  /* 執袋單（APP 內剔，唔使印）：剔咗記住，完場自動清 */
  bagTick:function(tid){var a=Store.get('bagtick',{})||{};return a[tid||'']||[]},
  bagSet:function(tid,on){var a=Store.get('bagtick',{})||{};if(on&&on.length)a[tid]=on.slice();else delete a[tid];Store.set('bagtick',a)},
  bagToggle:function(i){
    var tid=Pack.meet().tid,on=Pack.bagTick(tid),p=on.indexOf(i);
    if(p<0)on.push(i);else on.splice(p,1);
    Pack.bagSet(tid,on);
    var el=document.getElementById('bagRow'+i);
    if(el)el.className='kt-row'+(p<0?' on':'');
    var pb=document.getElementById('bagProg');
    if(pb)pb.innerHTML=Pack.bagProg(tid);
    if(p<0&&on.length===matsOf(Pack.meet().m).length){Sfx.ding();toast('✅ 執齊晒 — 可以出發')}
  },
  bagProg:function(tid){
    var n=matsOf(Pack.meet().m).length,on=Pack.bagTick(tid).length;
    return '<b>'+on+'/'+n+'</b>'+(n-on?('・未執 '+(n-on)+' 樣'):'・執齊晒 ✅');
  },
  bagModal:function(){
    var m=Pack.meet().m,tid=Pack.meet().tid,mats=matsOf(m),on=Pack.bagTick(tid);
    var rows=mats.length?mats.map(function(x,i){
      var t=Kit.mats[Kit.norm(x)]||Kit.fuzzy(x),q=t?Kit.qtyFor(x,t.q):'';
      return '<div class="kt-row'+(on.indexOf(i)>=0?' on':'')+'" id="bagRow'+i+'" onclick="Pack.bagToggle('+i+')">'+
        '<b>'+esc(x)+'</b><div>・人手：'+esc(t?t.q:'按實際人數')+(q?'<br><b class="kt-q">'+esc(q)+'</b>':'')+
        (t&&t.how?'<br>・備法：'+esc(t.how):'')+(t&&t.sub?'<br>♻️ 冇就改用：'+esc(t.sub):'')+'</div></div>';
    }).join(''):'<div class="mute">呢場唔使額外物資 — 帶部手機就夠。</div>';
    Modal.open('<div class="eyebrow">🧺 執袋單・'+esc(m.n)+'</div><h3>逐樣剔，剔咗會記住</h3>'+
      '<div class="kc-prog" id="bagProg">'+Pack.bagProg(tid)+'</div>'+
      '<div class="kit-tip open" style="margin-top:8px"><div class="kt-b" style="display:block">'+rows+'</div></div>'+
      '<div class="print-section" style="margin-top:10px"><div class="p-sec-title" style="font-size:.8rem">🎒 每次都要帶</div>'+
      '<div class="box" style="font-size:.8rem">手機／平板（充電）・哨子・急救包＋濕紙巾・名單紙本（含家長電話）・水・膠紙＋剪刀（大人用）</div></div>'+
      '<div class="btns"><button class="btn sm" onclick="Kit.copy(Kit.matsTipTxt(matsOf(Pack.meet().m)),this)">📋 複製清單</button>'+
      (on.length?'<button class="btn sm ghost" onclick="Pack.bagSet(Pack.meet().tid,[]);Pack.bagModal()">🧽 清重剔</button>':'')+
      '<button class="btn sm ghost" onclick="Modal.close();Pack.setPart(\'bag\',1);toast(\'已加入列印\')">🖨️ 我都想印</button></div>');
  },
  copies:function(){
    var n=Store.get('packcopies',0);
    if(n)return n;
    var mem=Store.get('members',[])||[];
    return mem.length||1;   /* 未填名單就印 1 份做樣版，唔好白白印 12 份 */
  },
  hasRoster:function(){return (Store.get('members',[])||[]).length>0},
  setCopies:function(v){Store.set('packcopies',Math.max(1,Math.min(40,+v||1)));Pack.route()},
  route:function(){if(App.view==='pack')App.route()},

  /* ---------- 今場係邊一場 ---------- */
  meet:function(){
    var cur=Store.get('packcur',null);
    if(cur&&cur.type==='my'){
      var my=(Store.get('mymeets',[])||[]).filter(function(m){return m.id===cur.id})[0];
      if(my)return {m:my,tid:my.id,no:0,mine:1};
    }
    if(cur&&cur.type==='tpl'&&dur(cur.id)){
      var pr=(typeof Kit!=='undefined'&&Kit.planRow)?Kit.planRow(cur.id):null;
      return {m:dur(cur.id),tid:cur.id,no:(pr&&pr.no)||cur.no||0};
    }
    var pl=Store.get('plan',{rows:[]});
    var next=(pl.rows||[]).filter(function(r){return r.status==='todo'})[0];
    if(next&&dur(next.tid))return {m:dur(next.tid),tid:next.tid,no:next.no};
    return {m:TPLS[0],tid:TPLS[0].id,no:1};
  },
  pick:function(type,id,no){
    Store.set('packcur',{type:type,id:id,no:no||0});
    Pack.route();
    toast('📦 已轉去：'+(type==='my'?'我嘅集會':'範本'));
  },
  sel:function(){
    var id=Pack.meet().tid,a=Store.get('packsel',{})||{},ch=0;
    if(!a[id])a[id]={};
    Pack.PARTS.forEach(function(p){if(a[id][p.k]===undefined){a[id][p.k]=p.print?1:0;ch=1}});
    if(ch)Store.set('packsel',a);
    return a[id];
  },
  /* 一組套包內容（wantPrint=1 要印嘅／0 喺 APP 睇嘅） */
  partsGroupHtml:function(m,kids,fl,sel,wantPrint){
    var rows=Pack.PARTS.filter(function(p){
      if(!!sel[p.k]!==!!wantPrint)return false;
      if(!p.cond)return true;
      if(p.k==='craftc')return kids.filter(function(x){return x.kind==='craft'}).length>0;
      if(p.k==='venue')return Pack.venueNeeds(m).length>0;
      if(p.k==='check')return Pack.checkKeys(m).length>0;
      if(p.k==='floor')return fl.length>0;
      if(p.k==='cert')return (Store.get('members',[])||[]).length>0;
      return true;
    }).map(function(p){
      var cnt=p.k==='kid'?(kids.length+' 款'):p.k==='cards'?(m.stages.length+' 節'):
        p.k==='craftc'?(kids.filter(function(x){return x.kind==='craft'}).length+' 張'):'';
      return '<div class="pk-part'+(sel[p.k]?' on':'')+'">'+
        '<button class="pp-main" onclick="Pack.toggle(\''+p.k+'\')">'+
          '<span class="pp-ic">'+p.ic+'</span><b>'+esc(p.n)+'</b><small>'+esc(p.d)+(cnt?'・'+cnt:'')+'</small>'+
          '<span class="pp-ck">'+(sel[p.k]?'🖨':'')+'</span></button>'+
        (p.app?'<button class="pp-app" onclick="Pack.appView(\''+p.k+'\')">'+(p.at||'📱 APP 睇')+'</button>':'')+
      '</div>';
    }).join('');
    if(!rows)return '';
    return '<div class="pk-gh'+(wantPrint?'':' app')+'">'+(wantPrint?'🖨️ 印呢幾樣':'📱 呢幾樣 APP 睇就夠')+'</div>'+
      '<div class="pk-parts">'+rows+'</div>';
  },
  toggle:function(k){Pack.setPart(k,Pack.on(k)?0:1);Pack.route()},
  setPart:function(k,on){
    var id=Pack.meet().tid,a=Store.get('packsel',{})||{};
    Pack.sel();a=Store.get('packsel',{})||{};
    if(!a[id])a[id]={};
    a[id][k]=on?1:0;
    Store.set('packsel',a);
    return a[id];
  },
  on:function(k){return !!Pack.sel()[k]},

  /* ---------- 時間表：有低時間就出鐘數 ---------- */
  startMin:function(){
    var s=Store.get('settings',{})||{};
    var m=String(s.time||'').match(/(\d{1,2})[:：](\d{2})/);
    return m?(+m[1])*60+(+m[2]):null;
  },
  clock:function(min){
    if(min==null)return '';
    var h=Math.floor(min/60)%24,mm=min%60;
    return h+':'+('0'+mm).slice(-2);
  },
  times:function(m){
    var t0=Pack.startMin(),acc=t0,out=[];
    (m.stages||[]).forEach(function(st){
      out.push({at:t0==null?'':Pack.clock(acc),m:+st.m||0,end:t0==null?'':Pack.clock(acc+(+st.m||0))});
      acc+=(+st.m||0);
    });
    return out;
  },
  mins:function(m){return (m.stages||[]).reduce(function(a,s){return a+(+s.m||0)},0)},

  /* ═════════════ 取代官方套包：官方有嘅我哋有，官方冇嘅我哋都有 ═════════════
     官方《小童軍團集會套包》內容＝集會程序＋物資表＋教學參考（發展署旅團支援組）。
     呢度逐項對照，寫明我哋點樣做到／做得更多，目標係新領袖唔使再開官方 PDF。 */
  COVER:[
    ['📄 22 次集會程序表','30 場範本・150 個環節，每節有時間・照讀一句・三步・安全','可調動・順延・補場・改分鐘，改完即刻存入「我嘅集會」'],
    ['🧺 物資表','47 項物資逐項寫明每人幾多・點備・冇就改用乜','按你團人數自動換算（「本團 12 人 → 約 24 張」）'],
    ['📖 教學參考（含 YouTube 連結）','每環節有圖解・照讀口令・成品示意圖，全部內置','離線都用得；集會中途唔使跳出去搵片'],
    ['🖨️ 紙模型／圖紙','15 樣手工有「✂️ 即用紙」（A4 實際尺寸，印完即剪）','另有領袖自學卡：未做過都跟得住'],
    ['📅 年度行事曆','首年 22 次已排好＋節日對齊','42 個月路線圖：團員章→進步獎章四步→小草蜢七範疇，唔會做完第一年斷'],
    ['—（官方冇）','當日投影帶領：計時・講稿・主題曲伴奏・遊戲畫面','領袖欄「而家做咩」，新領袖照住撳就帶完 60 分鐘'],
    ['—（官方冇）','團員進度追蹤：出席＋章項自動剔數','唔使再靠記憶／Excel 知邊個差幾多'],
    ['—（官方冇）','家長通知範本・檢查表・設場教學・現場救急','一撳複製／逐項剔，全部本機儲存'],
    ['—（官方冇）','⚡ 臨時集會：揀個主題即砌一場','套包照印、畫面照帶']
  ],
  coverHtml:function(){
    return '<div class="pk-cover"><table class="tbl"><tr><th>官方套包</th><th>呢個 APP</th><th>我哋多咗</th></tr>'+
      Pack.COVER.map(function(r){
        return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td class="pkc-more">'+esc(r[2])+'</td></tr>'}).join('')+
      '</table><small class="mute">非官方輔助工具；訓練綱要與獎章要求以香港童軍總會公佈為準。</small></div>';
  },

  /* ═════════════ 頁面（首頁 = 集會套包） ═════════════ */
  html:function(){
    var cur=Pack.meet(),m=cur.m,sel=Pack.sel();
    var kids=Sheets.forMeet(m),fl=Sheets.floorFor(m),cp=Pack.copies();
    var leadPages=Pack.pages('lead',m),kidPages=Pack.pages('kid',m);
    var printN=leadPages+kidPages;
    var appN=Pack.PARTS.filter(function(p){return !sel[p.k]&&p.app}).length;
    var h='';
    h+='<section class="pk-hero">'+
      '<span class="eyebrow">📦 集會套包</span>'+
      '<h1>'+esc(m.n)+'</h1>'+
      '<div class="pk-meta">'+esc(Pack.dateLine(m))+' ｜ '+Pack.mins(m)+' 分鐘 ｜ '+m.stages.length+' 個環節 ｜ '+(Store.get('members',[])||[]).length+' 人</div>'+
      /* 一撳＝教案＋圖紙一疊過，唔會印完教案仲要周圍搵圖紙 */
      '<div class="pk-big">'+
        '<button class="btn primary xl" onclick="Pack.open(\'all\')">🖨️ 印齊今場<small>教案 '+leadPages+' 頁 ＋ 圖紙 '+kidPages+' 頁＝'+printN+' 頁</small></button>'+
        (kidPages
          ?'<button class="btn gr xl" onclick="Pack.open(\'kid\')">✂️ 淨印小朋友圖紙<small>'+kidPages+' 頁（'+Pack.kidPicks(m).length+' 款 × '+cp+' 份）</small></button>'
          :'<button class="btn xl" disabled style="background:#eee;color:#999;box-shadow:none">✂️ 呢場冇圖紙<small>全部環節用螢幕／身體玩</small></button>')+
        '<button class="btn xl" style="background:#5d4037" onclick="Pack.open(\'lead\')">🧑‍🏫 淨印領袖教案<small>'+leadPages+' 頁</small></button>'+
        '<button class="btn ghost" onclick="Pack.lead()">▶ 即開帶領（APP 幫你帶）</button>'+
      '</div>'+
      Pack.sheetWhereHtml(m)+
      '<div class="pk-eco">🌱 淨係印 <b>'+printN+' 頁</b>：小朋友剪摺圖紙＋貼地標記＋領袖一頁流程。其餘 '+appN+' 樣喺 APP 睇，唔使印。</div>'+
      '<div class="pk-3"><b>1</b> 撳「印齊今場」<b>2</b> APP 剔住執袋<b>3</b> 到場撳「即開帶領」</div>'+
    '</section>';
    /* 套包內容：分兩組排——上面「要印」，下面「APP 睇就夠」，唔會撈埋一齊 */
    h+='<div class="card"><h2>套包入面有乜 <span class="tag">只印必要嘅</span></h2>'+
      Pack.partsGroupHtml(m,kids,fl,sel,1)+
      Pack.partsGroupHtml(m,kids,fl,sel,0)+
      (kids.length?'':'<div class="attention" style="margin-top:8px">呢場冇手工／工作紙環節 — 圖紙嗰疊空白，可以唔印。</div>')+
      (kids.length?'<label class="f">✂️ 呢場要印邊幾款（剔走就唔印）</label>'+
        '<div class="pk-kids">'+kids.map(function(x){
          return '<button class="pill'+(Pack.kidOn(x.k)?' on':'')+'" onclick="Pack.toggleKid(\''+x.k+'\')">'+x.ic+' '+esc(x.n)+'</button>'}).join('')+'</div>':'')+
      '<label class="f">🧒 印幾份</label>'+
      '<div class="pk-cp"><input type="number" min="1" max="40" value="'+cp+'" onchange="Pack.setCopies(this.value)">'+
      '<span class="mute">份・'+(Pack.hasRoster()?'已跟你團名單人數':'未填名單 — 去上面「4 🏅 記錄」加名單就自動印夠人數')+'</span></div>'+
    '</div>';
    /* 換一場 */
    h+='<div class="card"><h2>換一場集會</h2><div class="pk-pick">'+
      '<select onchange="Pack.pick(\'tpl\',this.value,0)">'+TPLS.map(function(t){
        return '<option value="'+t.id+'"'+(t.id===cur.tid?' selected':'')+'>'+esc(t.n)+'</option>'}).join('')+'</select>'+
      (Kit.dateRowHtml(cur.tid)||'')+
      ((Store.get('mymeets',[])||[]).length?'<div class="mute" style="font-size:.78rem;margin-top:6px">我嘅集會：'+
        (Store.get('mymeets',[])||[]).map(function(mm){
          return '<button class="pill'+(cur.mine&&cur.tid===mm.id?' on':'')+'" onclick="Pack.pick(\'my\',\''+mm.id+'\')">'+esc(mm.n)+'</button>'}).join('')+'</div>':'')+
      '</div></div>';
    /* 臨時集會（資深領袖） */
    h+='<div class="card"><h2>⚡ 臨時集會 <span class="tag">唔使排期</span></h2>'+
      '<div class="pk-inst">'+Pack.INST.map(function(x){
        return '<button class="btn sm ghost" onclick="Pack.instant(\''+x.k+'\','+x.mins+')">'+x.ic+' '+esc(x.n)+'（'+x.mins+'分）</button>'}).join('')+'</div></div>';
    /* 常用工具：淨係留最常撳嘅 4 樣，其餘全部喺「✂️ 圖紙」度 */
    h+='<div class="card"><h2>🎮 一撳就印嘅工具</h2><div class="pk-quick">'+
      '<button class="btn sm" onclick="PrintKit.openModal(\'game-cards\')">🃏 遊戲帶領卡</button>'+
      '<button class="btn sm ghost" onclick="PrintKit.openModal(\'floor-grid\')">🦗 九宮格地貼</button>'+
      '<button class="btn sm ghost" onclick="PrintKit.openModal(\'corner-signs\')">🅰️ 四角角牌</button>'+
      '<button class="btn sm ghost" onclick="App.go(\'#print\')">✂️ 全部圖紙 ↗</button>'+
      '</div></div>';
    /* 對照官方（收埋） */
    h+='<details class="card pk-cal"><summary>🆚 仲使唔使睇官方套包？</summary>'+Pack.coverHtml()+'</details>';
    /* 年度行事曆（收埋） */
    var pl=Store.get('plan',{rows:[]})||{rows:[]};
    h+='<details class="card pk-cal"><summary>📅 年度行事曆（'+(pl.rows||[]).length+' 次）</summary>'+
      ((pl.rows||[]).length?Plan.calendar(pl):'<div class="mute">未排行事曆 — 去上面「1 📅 揀集會」撳「重建行事曆」。</div>')+'</details>';
    return h;
  },
  dateLine:function(m){
    var d=(typeof Kit!=='undefined')?Kit.planRowDate(m.id):'';
    return d?Kit.fmtDate(d):'未訂日期';
  },
  lead:function(){
    var cur=Pack.meet();
    if(cur.mine){Lead.startMy(cur.tid)}else{Lead.start(cur.tid,cur.no||1)}
  },
  instant:function(k,mins){
    var m=Pack.instantMeet(k,mins);
    if(!m)return;
    var my=Store.get('mymeets',[])||[];
    my.unshift(m);Store.set('mymeets',my);
    Pack.pick('my',m.id,0);
    toast('⚡ 已砌好「'+m.n+'」—套包可以印');
  },
  /* 即興集會定義（App.startInstant 同套包共用同一份） */
  INST:[
    {k:'general',ic:'🎲',n:'歡樂綜合',mins:40},
    {k:'safety',ic:'🛡️',n:'身體安全',mins:40},
    {k:'health',ic:'🧼',n:'健康技能',mins:40},
    {k:'nature',ic:'♻️',n:'環保自然',mins:40},
    {k:'fitness',ic:'🏃',n:'體能反應',mins:40},
    {k:'general',ic:'✨',n:'60 分鐘全能',mins:60}
  ],
  instantMeet:function(theme,mins){
    var B={
      open:{t:'儀式',n:'開心快樂傘(開會)',m:5,how:'齊唸口號「小童軍向前進」揚傘開會。',script:'「全體預備——小童軍向前進！」',screen:'chuteopen'},
      close4:{t:'儀式',n:'開心快樂傘(散會)',m:4,how:'齊唸口號散會。',script:'「今日集會完滿結束！小童軍——向前進！」',screen:'chuteclose'},
      breath:{t:'靜息',n:'靜息深呼吸',m:3,how:'跟隨畫面圓圈緩慢深呼吸。',script:'「吸氣——呼氣——放鬆全身。」',screen:'breath'}
    };
    var sets={
      general:{n:'即興・歡樂綜合數碼集會 ('+mins+'分鐘)',theme:'破冰認識・主題曲・小草蜢互動・反應遊戲',
        stages:[B.open,{t:'唱遊',n:'學唱小童軍主題曲',m:mins===60?10:7,how:'跟隨畫面伴奏逐句齊唱並做動作。',script:'「小小童軍向前進——舉高雙手！」',screen:'song'},
          {t:'課程',n:'認識小草蜢與大自然',m:10,how:'領袖講圖鑑，全體即刻蹲低扮草蜢跳一次。',script:'「小草蜢跳得高、天天向上，好似小童軍一樣！」',screen:'ghinfo'},
          {t:'遊戲',n:'草蜢跳格(實體九宮格)',m:8,how:'地上九宮格：螢幕叫位，小朋友限時跳上去。',script:'「聽到幾號就跳上去！三、二、一—跳！」',screen:'catch',mats:['九宮格地貼']},
          mins===60?{t:'遊戲',n:'領袖話(體能版)',m:10,how:'聽領袖指令做動作，訓練聽力與專注。',script:'「領袖話——摸摸膝頭！」',screen:'leader'}:null,
          B.breath,B.close4]},
      safety:{n:'即興・自我保護與安全 ('+mins+'分鐘)',theme:'身體界線・紅黃綠燈・安全求助',
        stages:[B.open,{t:'課程',n:'身體地圖紅黃綠',m:12,how:'領袖撳部位講解，全場用手勢答紅黃綠，大聲練習講「唔好」。',script:'「你嘅身體屬於你！紅色部位唔可以隨便掂！」',screen:'bodycard'},
          {t:'遊戲',n:'對錯法庭(保護篇・左右分邊)',m:mins===60?12:10,how:'小朋友行去 👍／👎 嗰邊表態，領袖宣判＋講解。',script:'「呢件事啱定錯？行去你嗰邊——宣判！」',screen:'judge',mats:['角牌']},
          mins===60?{t:'唱遊',n:'小童軍主題曲',m:8,how:'伴奏齊唱主題曲。',script:'「小童軍愛護自己、日行一善！」',screen:'song'}:null,
          {t:'遊戲',n:'紅綠燈(交通安全版)',m:mins===60?10:8,how:'綠燈行、紅燈停，學習安全守則。',script:'「綠燈行——紅燈停！」',screen:'traffic'},
          B.breath,B.close4]},
      health:{n:'即興・健康生活好幫手 ('+mins+'分鐘)',theme:'洗手七步・彩虹飲食・家務挑戰',
        stages:[B.open,{t:'課程',n:'洗手七步好寶寶',m:10,how:'跟隨七步洗手圖解與 20 秒倒數計時歌做洗手操。',script:'「內外夾弓大立腕——細菌全走開！」',screen:'clean'},
          {t:'課程',n:'彩虹健康飲食盤',m:mins===60?12:10,how:'領袖揭顏色，小朋友講一樣嗰色嘅食物＋扮食落肚。',script:'「多食彩虹食物，身體健康！」',screen:'foodrainbow'},
          {t:'遊戲',n:'任務抽籤機(家務善行)',m:8,how:'轉動抽籤機抽取今日日行一善家務。',script:'「抽中邊個家務任務？返屋企實踐！」',screen:'task'},
          mins===60?{t:'遊戲',n:'節奏模仿律動',m:10,how:'APP 出拍子聲，領袖做一次，全體跟住做。',script:'「聽住拍子—拍手、踏步、草蜢跳！」',screen:'rhythm'}:null,
          B.breath,B.close4]},
      nature:{n:'即興・環保與大自然 ('+mins+'分鐘)',theme:'三色回收・動植物常識・愛護地球',
        stages:[B.open,{t:'課程',n:'三色回收・四角分桶',m:12,how:'四角貼桶標籤，小朋友行去嗰個角，領袖揭曉。',script:'「鋁罐去邊個桶？行去嗰個角企好！」',screen:'recycle',mats:['角牌']},
          {t:'遊戲',n:'問答擂台(四角搶答)',m:10,how:'四角貼 A/B/C/D，小朋友行去自己揀嘅角。',script:'「覺得係 A 就行去 A 角！」',screen:'quiz',mats:['角牌']},
          {t:'遊戲',n:'估估下(動植物剪影)',m:mins===60?10:8,how:'剪影猜動物植物。',script:'「呢個識飛嘅係咩生物？」',screen:'guess'},
          mins===60?{t:'遊戲',n:'草蜢跳格(大自然版)',m:8,how:'地上九宮格跳格；叫位時加一個草蜢動作。',script:'「3 號・單腳企！跳！」',screen:'catch',mats:['九宮格地貼']}:null,
          B.breath,B.close4]},
      fitness:{n:'即興・體能與反應大冒險 ('+mins+'分鐘)',theme:'肢體律動・紅綠燈・速度反應',
        stages:[B.open,{t:'遊戲',n:'紅綠燈(衝刺版)',m:10,how:'紅燈停綠燈跑，訓練心肺與反應。',script:'「綠燈行——紅燈停！」',screen:'traffic'},
          {t:'遊戲',n:'領袖話(大動作版)',m:10,how:'單腳企、摸腳尖、草蜢跳。',script:'「領袖話——草蜢跳五下！」',screen:'leader'},
          {t:'遊戲',n:'草蜢跳格(分組接力)',m:8,how:'分組輪流跳格，每格限時 3 秒，領袖記分。',script:'「下一組準備——跳！」',screen:'catch',mats:['九宮格地貼']},
          mins===60?{t:'遊戲',n:'記憶配對(運動版)',m:10,how:'翻牌配對訓練記憶力。',script:'「記住圖案位置！」',screen:'memory'}:null,
          B.breath,B.close4]}
    };
    var s=sets[theme]||sets.general;
    s.stages=s.stages.filter(Boolean).map(function(x){return JSON.parse(JSON.stringify(x))});
    s.id='m'+Date.now()+Math.floor(Math.random()*900+100);
    return s;
  },

  /* ═════════════ 各張紙 ═════════════ */
  cover:function(m){
    var s=Store.get('settings',{})||{},T=Pack.times(m),own=Kit.ownersOf(m);
    var mem=(Store.get('members',[])||[]).length;
    var h='<div class="a4-sheet pack-sheet">'+
      '<div class="print-header"><div class="p-title-group">'+
        '<span class="p-badge">📦 集會套包・領袖套包 1／3</span>'+
        '<h2>'+esc(s.group||'小童軍團')+' — '+esc(m.n)+'</h2>'+
        '<div class="p-meta">主題：<b>'+esc(m.theme||'')+'</b> ｜ '+esc(Pack.dateLine(m))+' ｜ <b>'+Pack.mins(m)+' 分鐘</b> ｜ '+m.stages.length+' 個環節'+(mem?' ｜ '+mem+' 人':'')+'</div>'+
      '</div><div class="p-logo">🦗</div></div>'+
      '<table class="print-table pack-run"><thead><tr>'+
        '<th style="width:11%">時間</th><th style="width:20%">環節</th><th style="width:9%">負責</th>'+
        '<th style="width:30%">🎤 照讀一句</th><th style="width:30%">做乜・要乜</th><th style="width:5%">✓</th>'+
      '</tr></thead><tbody>'+
      m.stages.map(function(st,i){
        var g=Guide.forStage(st),ck=Sheets.craftFor(st),c=ck?Craft.match(st):null;
        var doIt=c?('照「📚 自學卡」三步帶：'+c.teach.map(function(x){return x[2]}).join(' → ')):String(g.lead||'');
        if(doIt.length>120)doIt=doIt.slice(0,118)+'…';
        return '<tr><td><b>'+esc(T[i].at||'—')+'</b><br><span class="p-tag">'+(+st.m||0)+'分</span></td>'+
          '<td><b>'+(i+1)+'. '+esc(st.n)+'</b><br><span class="p-tag">'+esc(st.t)+'</span></td>'+
          '<td>'+esc(own[i]||'未定')+'</td>'+
          '<td style="font-size:8.5pt;font-style:italic">'+esc(st.script||g.say)+'</td>'+
          '<td style="font-size:8pt">'+esc(doIt)+((st.mats&&st.mats.length)?'<br>🧺 '+esc(st.mats.join('、')):'')+'</td>'+
          '<td class="ck-box"></td></tr>';
      }).join('')+
      '</tbody></table>'+
      '<div class="pk-open"><b>🎤 開場照讀</b>「各位小童軍，今日我哋玩'+esc((m.theme||'').split('・')[0])+'。規矩三條：聽到哨聲即刻返位、要嘢舉手、做完舉手等我睇。而家——小童軍向前進！」</div>'+
      Pack.sheetIndexPrint(m)+
      '<div class="print-footer-grid"><div class="p-sign-box">主領領袖：______________</div>'+
      '<div class="p-sign-box">出席：_____ / _____ 人</div><div class="p-sign-box">散會時間：__________</div></div>'+
    '</div>';
    return h;
  },
  bag:function(m){
    var mats=matsOf(m),s=Store.get('settings',{})||{};
    var rows=mats.length?mats.map(function(x){
      var t=Kit.mats[Kit.norm(x)]||Kit.fuzzy(x);
      return '<tr><td class="ck-box"></td><td><b>'+esc(x)+'</b></td>'+
        '<td style="font-size:8pt">'+(t?esc(t.q):'—')+(t?'<br><b class="pk-q">'+esc(Kit.qtyFor(x,t.q)||'')+'</b>':'')+'</td>'+
        '<td style="font-size:7.6pt">'+(t?esc(t.how):'')+(t&&t.sub?'<br>♻️ '+esc(t.sub):'')+'</td></tr>';
    }).join(''):'<tr><td colspan="4">呢場唔使額外物資 — 帶部手機就夠。</td></tr>';
    return '<div class="a4-sheet pack-sheet">'+
      '<div class="print-header-simple"><span>集會套包・領袖套包 2／3</span> <b>🧺 執袋單・'+esc(m.n)+'</b></div>'+
      '<div class="p-note">放落袋之前逐樣剔。人手已經跟名單人數計過；冇嗰樣就跟「後備」改。</div>'+
      '<table class="print-table check-table"><thead><tr><th style="width:5%">✓</th><th style="width:16%">物資</th><th style="width:30%">每人幾多</th><th style="width:49%">點備・冇就改用</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="print-section" style="margin-top:10px"><div class="p-sec-title">🎒 每次都要帶（唔使諗）</div>'+
      '<table class="print-table check-table"><tbody>'+
      ['手機／平板（APP 開到・充電・轉飛航模式前先開好畫面）','擴音器或哨子（場細就哨子）','急救包＋濕紙巾＋垃圾袋','團員名單紙本（含家長電話・過敏）','水（每人 500 毫升）','膠紙一卷＋剪刀（大人用）'].map(function(x){
        return '<tr><td class="ck-box"></td><td>'+esc(x)+'</td></tr>'}).join('')+
      '</tbody></table></div>'+
      '<div class="p-foot">旅團：'+esc(s.group||'____________')+'　日期：'+esc(Pack.dateLine(m))+'　© 2026 Scout System</div></div>';
  },
  cards:function(m){
    var T=Pack.times(m),own=Kit.ownersOf(m),kids=Sheets.forMeet(m),h='',i;
    var card=function(st,idx){
      var g=Guide.forStage(st),ck=Sheets.craftFor(st),wk=Sheets.wsFor(st);
      var kidTxt=ck?('✂️ 小朋友紙：'+Sheets.craft[ck].n):wk?('📝 小朋友紙：'+Sheets.ws[wk].n):'';
      return '<div class="pk-card">'+
        '<div class="pkc-h"><span class="pkc-no">'+(idx+1)+'</span><b>'+esc(st.n)+'</b>'+
          '<span class="pkc-m">'+esc(T[idx].at||'')+'・'+(+st.m||0)+'分鐘・'+esc(own[idx]||'未定')+'</span></div>'+
        '<div class="pkc-say">🎤 '+esc(st.script||g.say)+'</div>'+
        '<div class="pkc-row"><b>👣 三步</b>'+g.steps.map(function(x){return '<span>'+x[0]+'. '+esc(x[2])+'</span>'}).join('')+'</div>'+
        '<div class="pkc-row"><b>🧺 要乜</b>'+esc((st.mats&&st.mats.length)?st.mats.join('、'):'唔使物資')+'</div>'+
        '<div class="pkc-row"><b>🛡️ 注意</b>'+esc(g.safety)+'</div>'+
        (kidTxt?'<div class="pkc-kid">'+kidTxt+'</div>':'')+
      '</div>';
    };
    for(i=0;i<m.stages.length;i+=2){
      h+=(h?'<div class="pbreak"></div>':'')+'<div class="a4-sheet pack-sheet">'+
        '<div class="print-header-simple"><span>集會套包・領袖套包 3／3</span> <b>🃏 環節帶領卡・剪開手揸</b></div>'+
        '<div class="pk-cards">'+card(m.stages[i],i)+(m.stages[i+1]?card(m.stages[i+1],i+1):'')+'</div></div>';
    }
    return h;
  },
  venueNeeds:function(m){
    var out=[],seen={};
    (m.stages||[]).forEach(function(st){
      var v=(typeof Venue!=='undefined'&&Venue.needFor)?Venue.needFor(st):null;
      if(!v||!(v.setup||[]).length)return;
      v.setup.forEach(function(x){if(!seen[x]){seen[x]=1;out.push({st:st.n,x:x})}});
    });
    return out;
  },
  venueSheet:function(m){
    var need=Pack.venueNeeds(m);
    if(!need.length)return '';
    var zones={},rows='';
    (m.stages||[]).forEach(function(st){
      var v=(typeof Venue!=='undefined'&&Venue.needFor)?Venue.needFor(st):null;
      if(v)(v.zones||[]).forEach(function(z){zones[z]=1});
    });
    need.forEach(function(x){
      rows+='<tr><td class="ck-box"></td><td style="font-size:8.2pt">'+esc(x.x)+'</td><td style="font-size:7.6pt;color:#666">'+esc(x.st)+'</td></tr>';
    });
    return '<div class="a4-sheet pack-sheet">'+
      '<div class="print-header-simple"><span>集會套包・今場設場</span> <b>📍 到場 30 分鐘照住剔</b></div>'+
      '<div class="p-note">今場要設嘅分區：<b>'+Object.keys(zones).join('・')+'</b>。逐項剔晒先至開場。</div>'+
      '<table class="print-table check-table"><thead><tr><th style="width:5%">✓</th><th style="width:66%">做乜</th><th style="width:29%">因為呢節</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="print-section" style="margin-top:8px"><div class="p-sec-title">🗣️ 開會前 3 分鐘・五條規矩（每條即場練一次）</div><div class="p-para tiny">'+
      (typeof Venue!=='undefined'?Venue.rules.map(function(r,i){return (i+1)+'. '+esc(r.t||r)}).join('<br>'):'')+'</div></div>'+
      '<div class="p-foot">© 2026 Scout System</div></div>';
  },
  checkKeys:function(m){
    var out=[];
    (m.stages||[]).forEach(function(st){var c=Kit.checkFor(st);if(c&&out.indexOf(c.key)<0)out.push(c.key)});
    if(!out.length&&(m.stages||[]).length)out=['venue'];
    return out;
  },
  notice:function(m){
    var mats=matsOf(m),s=Store.get('settings',{})||{};
    var ctx={theme:m.theme,items:mats.slice(0,2),extra:mats.slice(0,3).join('、')||'水同毛巾',date:Kit.planRowDate(m.id)};
    return '<div class="a4-sheet pack-sheet">'+
      '<div class="print-header-simple"><span>集會套包・家長通知</span> <b>📣 已填好・影相發群就得</b></div>'+
      Pack.msgBlock(m,0,ctx)+Pack.msgBlock(m,1,ctx)+
      '<div class="p-foot">旅團：'+esc(s.group||'____________')+'　© 2026 Scout System</div></div>';
  },
  msgBlock:function(m,i,ctx){
    var mm=Kit.msgs[i];
    return '<div class="print-section"><div class="p-sec-title">'+mm.ic+' '+esc(mm.n)+'</div>'+
      '<div class="p-para" style="white-space:pre-line;font-size:9.5pt">'+esc(Kit.fill(mm.t,ctx))+'</div></div>';
  },
  craftCoach:function(m){
    var ks=[],h='';
    Sheets.forMeet(m).forEach(function(x){if(x.kind==='craft')ks.push(x.k)});
    ks.forEach(function(k,i){
      h+=(h?'<div class="pbreak"></div>':'')+Craft.printSheet(k);
    });
    return h;
  },
  floorSheets:function(m){
    var fl=Sheets.floorFor(m),h='';
    fl.forEach(function(x){h+=(h?'<div class="pbreak"></div>':'')+Sheets.one('floor',x.k)});
    return h;
  },
  /* 小朋友紙逐款揀：呢場要邊幾款先印邊幾款（護照／名牌可以下次先印） */
  kidSel:function(tid){var a=Store.get('packkid',{})||{};return a[tid||'']||null},
  kidOn:function(k){var sel=Pack.kidSel(Pack.meet().tid);return !sel||sel.indexOf(k)>=0},
  kidPicks:function(m){
    var all=Sheets.forMeet(m),sel=Pack.kidSel(m.id);
    return sel?all.filter(function(x){return sel.indexOf(x.k)>=0}):all;
  },
  /* ═══════ 「圖紙喺邊度？」：一場集會要用邊幾張圖紙，全部喺一個清單度 ═══════ */
  /* 圖紙＝印出嚟真係要落手用嘅紙：小朋友即用紙（剪／摺／描／塗）＋ 場地貼紙（九宮格・角牌） */
  sheetList:function(m){
    var cp=Pack.copies(),out=[];
    Pack.kidPicks(m).forEach(function(x){
      out.push({ic:x.ic||'✂️',n:x.n,cp:cp+' 份（每人一份）',who:x.stage||'',kind:x.kind,k:x.k});
    });
    Sheets.floorFor(m).forEach(function(x){
      out.push({ic:x.ic||'🦗',n:x.n,cp:'1 份（貼地／貼牆）',who:'全場共用',kind:'floor',k:x.k});
    });
    return out;
  },
  /* 首頁：講清楚今場圖紙有邊幾張、印咗會喺邊、想單獨再印撳邊度 */
  sheetWhereHtml:function(m){
    var ls=Pack.sheetList(m);
    if(!ls.length)return '<div class="pk-where none">✂️ 呢場唔使圖紙 — 印教案就夠。</div>';
    return '<div class="pk-where"><b>✂️ 今場圖紙（'+ls.length+' 款）</b>'+
      '<div class="pw-list">'+ls.map(function(x){
        return '<span class="pw-i">'+x.ic+' '+esc(x.n)+'<i>'+esc(x.cp)+'</i></span>'}).join('')+'</div>'+
      '<div class="pw-hint">撳「印齊今場」＝教案打頭陣，<b>圖紙自動跟喺後面</b>（中間有分隔頁）。想單獨再印：下面工具箱「✂️ 圖紙」。</div>'+
      '</div>';
  },
  /* 打印用：教案入面嘅「圖紙清單」，印完就知有幾多張紙要跟住剪 */
  sheetIndexPrint:function(m){
    var ls=Pack.sheetList(m);
    if(!ls.length)return '<div class="p-note">✂️ 今場冇圖紙要印（全部環節用螢幕／身體玩）。</div>';
    return '<div class="print-section"><div class="p-sec-title">✂️ 今場圖紙清單（跟喺呢份教案後面／或喺 APP「✂️ 圖紙」單獨再印）</div>'+
      '<table class="print-table check-table"><thead><tr><th style="width:5%">✓</th><th style="width:47%">圖紙</th><th style="width:23%">印幾多</th><th style="width:25%">邊個環節用</th></tr></thead><tbody>'+
      ls.map(function(x){
        return '<tr><td class="ck-box"></td><td><b>'+x.ic+' '+esc(x.n)+'</b></td><td>'+esc(x.cp)+'</td><td style="font-size:8pt">'+esc(x.who||'—')+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  },
  /* 兩疊紙中間嘅分隔頁：印完一疊唔會唔知邊張係邊張 */
  dividerSheet:function(m){
    var ls=Pack.sheetList(m);
    return '<div class="a4-sheet pack-sheet pk-divider">'+
      '<div class="pkd-big">✂️</div>'+
      '<h2 class="pkd-h">以下係「小朋友圖紙」</h2>'+
      '<div class="pkd-sub">'+esc(m.n)+'　｜　共 '+ls.length+' 款・'+Pack.pages('kid',m)+' 頁</div>'+
      '<div class="pkd-note">上面嗰疊＝領袖教案（程序表・執袋單・帶領卡），揸喺手用。<br>'+
      '下面呢疊＝小朋友用嘅紙，印完即剪即摺即塗，紙上冇說明書。<br>'+
      '建議：分隔頁對摺夾住下面嗰疊，返到場一拎就分得清。</div>'+
      '<div class="pkd-list">'+ls.map(function(x){return '<div>'+x.ic+' '+esc(x.n)+'　—　'+esc(x.cp)+'</div>'}).join('')+'</div>'+
      '<div class="p-foot">© 2026 Scout System</div></div>';
  },
  toggleKid:function(k){
    var tid=Pack.meet().tid,all=Sheets.forMeet(Pack.meet().m).map(function(x){return x.k});
    var sel=Pack.kidSel(tid)||all.slice();
    var p=sel.indexOf(k);if(p<0)sel.push(k);else sel.splice(p,1);
    var a=Store.get('packkid',{})||{};
    if(sel.length>=all.length)delete a[tid];else a[tid]=sel;
    Store.set('packkid',a);Pack.route();
  },
  kidSheets:function(m,copies){
    var list=Pack.kidPicks(m),n=Math.max(1,Math.min(40,+copies||1)),h='',i,j;
    for(i=0;i<n;i++)for(j=0;j<list.length;j++){
      h+=(h?'<div class="pbreak"></div>':'')+Sheets.one(list[j].kind,list[j].k);
    }
    return h;
  },

  /* ---------- 頁數估算 ---------- */
  /* all=1：唔理剔咗乜，全部出齊（教材庫預覽用） */
  want:function(k,all){return all?1:Pack.on(k)},
  pages:function(who,m,all){
    var n=0;
    if(who==='all')return Pack.pages('lead',m,all)+1+Pack.pages('kid',m,all);
    if(who==='lead'){
      if(Pack.want('cover',all))n+=1;
      if(Pack.want('bag',all))n+=1;
      if(Pack.want('cards',all))n+=Math.ceil(m.stages.length/2);
      if(Pack.want('craftc',all))n+=Sheets.forMeet(m).filter(function(x){return x.kind==='craft'}).length;
      if(Pack.want('venue',all)&&Pack.venueNeeds(m).length)n+=1;
      if(Pack.want('notice',all))n+=1;
      if(Pack.want('check',all))n+=Pack.checkKeys(m).length;
      if(Pack.want('cert',all))n+=Math.max(1,(Store.get('members',[])||[]).length);
    }else{
      if(Pack.want('kid',all))n+=Pack.kidPicks(m).length*Pack.copies();
      if(Pack.want('floor',all))n+=Sheets.floorFor(m).length;
    }
    return n;
  },
  sheets:function(who,m,all){
    var h=[];
    if(who==='all'){
      /* 教案 → 分隔頁 → 圖紙：一次過印晒，圖紙唔會失蹤 */
      var L=Pack.sheets('lead',m,all),K=Pack.sheets('kid',m,all);
      if(!L)return K;
      if(!K)return L;
      return L+'<div class="pbreak"></div>'+Pack.dividerSheet(m)+'<div class="pbreak"></div>'+K;
    }
    if(who==='lead'){
      if(Pack.want('cover',all))h.push(Pack.cover(m));
      if(Pack.want('bag',all))h.push(Pack.bag(m));
      if(Pack.want('cards',all))h.push(Pack.cards(m));
      if(Pack.want('craftc',all)&&Pack.craftCoach(m))h.push(Pack.craftCoach(m));
      if(Pack.want('venue',all)&&Pack.venueSheet(m))h.push(Pack.venueSheet(m));
      if(Pack.want('notice',all))h.push(Pack.notice(m));
      if(Pack.want('check',all)&&Pack.checkKeys(m).length)h.push(Kit.printSheets(Pack.checkKeys(m)));
      if(Pack.want('cert',all))h.push(PrintKit.renderCertSheet());
    }else{
      if(Pack.want('kid',all))h.push(Pack.kidSheets(m,Pack.copies()));
      if(Pack.want('floor',all))h.push(Pack.floorSheets(m));
    }
    return h.filter(function(x){return x&&x.length}).join('<div class="pbreak"></div>');
  },
  open:function(who){
    var m=Pack.meet().m,html=Pack.sheets(who,m);
    if(!html){toast('呢疊而家冇內容 — 上面剔返有嘅項目');return}
    var title=who==='lead'?'🧑‍🏫 領袖教案':who==='kid'?'✂️ 小朋友圖紙':'🖨️ 印齊今場（教案＋圖紙）';
    var sub=who==='lead'?'流程・清單・照讀口令':who==='kid'?'印完即剪即用，紙上冇說明':'前面係領袖教案，分隔頁之後就係小朋友圖紙';
    Modal.open('<div class="print-preview-modal">'+
      '<div class="print-preview-top"><div><h3>'+title+'・'+esc(m.n)+'</h3>'+
        '<small class="mute">約 '+Pack.pages(who,m)+' 頁 A4・'+sub+'</small></div>'+
      '<div class="btns"><button class="btn gr" onclick="PrintKit.triggerPrint()">🖨️ 即刻列印 / 存 PDF</button></div></div>'+
      '<div class="print-sheet-wrapper" id="printableArea">'+html+'</div></div>');
  }
};
