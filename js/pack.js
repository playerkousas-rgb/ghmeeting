/* 🦗 pack.js — 集會套包：新領袖一撳就攞到今場所有教材（分開「領袖用」同「小朋友即用紙」） © 2026 Scout System */
/* 目標：開會前一晚，一個按鈕印齊 → 執袋 → 第二日拎起就用。
   兩疊紙分得清清楚楚：領袖套包＝說明／流程／清單；小朋友套包＝印完即剪即摺即用，紙上冇說明書。 */
var Pack={
  /* ---------- 套包內容清單（可剔：印乜唔印乜） ---------- */
  PARTS:[
    {k:'cover',  ic:'📋', n:'今場一覽＋程序表', who:'lead', d:'時間・環節・照讀一句'},
    {k:'bag',    ic:'🧺', n:'執袋單（已計人手）', who:'lead', d:'每人幾多・冇就改用乜'},
    {k:'cards',  ic:'🃏', n:'環節帶領卡', who:'lead', d:'剪開手揸・一節一張'},
    {k:'craftc', ic:'📚', n:'手工領袖自學卡', who:'lead', d:'你自己先學做（說明書）', cond:1},
    {k:'venue',  ic:'📍', n:'今場設場清單', who:'lead', d:'貼邊・界線・幾大', cond:1},
    {k:'notice', ic:'📣', n:'家長通知（已填好）', who:'lead', d:'日期・主題・要帶嘢'},
    {k:'check',  ic:'🧭', n:'今場檢查表', who:'lead', d:'逐項剔・完成先開隊', cond:1},
    {k:'cert',   ic:'🏅', n:'嘉許狀', who:'lead', d:'按名單一人一張', cond:1, off:1},
    {k:'kid',    ic:'✂️', n:'小朋友即用紙', who:'kid', d:'印完即剪・每人一份', per:1},
    {k:'floor',  ic:'🦗', n:'場地貼紙', who:'kid', d:'九宮格／角牌・貼地即用', cond:1}
  ],
  copies:function(){
    var n=Store.get('packcopies',0);
    if(n)return n;
    var mem=Store.get('members',[])||[];
    return mem.length||12;
  },
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
    Pack.PARTS.forEach(function(p){if(a[id][p.k]===undefined){a[id][p.k]=p.off?0:1;ch=1}});
    if(ch)Store.set('packsel',a);
    return a[id];
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

  /* ═════════════ 頁面（首頁 = 集會套包） ═════════════ */
  html:function(){
    var cur=Pack.meet(),m=cur.m,sel=Pack.sel();
    var kids=Sheets.forMeet(m),fl=Sheets.floorFor(m),cp=Pack.copies();
    var leadPages=Pack.pages('lead',m),kidPages=Sheets.pagesOf(m,fl.length?cp:cp);
    var h='';
    /* 頂：今場 + 兩個大掣（字要少） */
    h+='<section class="pk-hero">'+
      '<span class="eyebrow">📦 集會套包</span>'+
      '<h1>'+esc(m.n)+'</h1>'+
      '<div class="pk-meta">'+esc(Pack.dateLine(m))+' ｜ '+Pack.mins(m)+' 分鐘 ｜ '+m.stages.length+' 個環節 ｜ '+(Store.get('members',[])||[]).length+' 人</div>'+
      '<div class="pk-big">'+
        '<button class="btn primary xl" onclick="Pack.open(\'lead\')">🧑‍🏫 印領袖套包<small>'+leadPages+' 頁</small></button>'+
        (kidPages
          ?'<button class="btn gr xl" onclick="Pack.open(\'kid\')">🧒 印小朋友紙<small>'+kidPages+' 頁（'+(kids.length||fl.length)+' 款 × '+cp+' 份）</small></button>'
          :'<button class="btn xl" disabled style="background:#eee;color:#999;box-shadow:none">🧒 呢場冇小朋友紙<small>全部環節用螢幕／身體玩</small></button>')+
        '<button class="btn ghost" onclick="Pack.lead()">▶ 即開帶領</button>'+
      '</div>'+
      (kids.length?'<div class="pk-list">✂️ '+kids.map(function(x){return esc(x.n)}).join('・')+'　×'+cp+' 份</div>':'')+
      '<div class="pk-3"><b>1</b> 印齊兩疊紙<b>2</b> 照執袋單執袋<b>3</b> 到場跟程序表帶</div>'+
    '</section>';
    /* 套包內容 */
    h+='<div class="card"><h2>套包入面有乜 <span class="tag">剔走就唔印</span></h2>'+
      '<div class="pk-parts">'+Pack.PARTS.map(function(p){
        var show=1;
        if(p.cond){
          if(p.k==='craftc'||p.k==='kid')show=kids.length?1:(p.k==='kid'?1:0);
          if(p.k==='venue')show=Pack.venueNeeds(m).length?1:0;
          if(p.k==='check')show=Pack.checkKeys(m).length?1:0;
          if(p.k==='floor')show=fl.length?1:0;
          if(p.k==='cert')show=(Store.get('members',[])||[]).length?1:0;
        }
        if(!show)return '';
        var cnt=p.k==='kid'?(kids.length+' 款'):p.k==='cards'?(m.stages.length+' 張'):p.k==='craftc'?(kids.filter(function(x){return x.kind==='craft'}).length+' 張'):'';
        return '<button class="pk-part'+(sel[p.k]?' on':'')+'" onclick="Pack.toggle(\''+p.k+'\')">'+
          '<span class="pp-ic">'+p.ic+'</span><b>'+esc(p.n)+'</b><small>'+esc(p.d)+(cnt?'・'+cnt:'')+'</small>'+
          '<span class="pp-ck">'+(sel[p.k]?'✓':'')+'</span></button>';
      }).join('')+'</div>'+
      (kids.length?'':'<div class="attention" style="margin-top:8px">呢場冇手工／工作紙環節 — 小朋友紙嗰疊會係空白，可以唔印。</div>')+
      '<label class="f">🧒 小朋友紙印幾份（每人一份）</label>'+
      '<div class="pk-cp"><input type="number" min="1" max="40" value="'+cp+'" onchange="Pack.setCopies(this.value)">'+
      '<span class="mute">份・一撳就自動印夠人數，唔使逐次印</span></div>'+
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
    h+='<div class="card"><h2>⚡ 臨時集會 <span class="tag">唔使排期・即刻出套包</span></h2>'+
      '<div class="mute" style="font-size:.82rem">臨時頂位／加場：揀個主題，套包同一樣印得到。</div>'+
      '<div class="pk-inst">'+Pack.INST.map(function(x){
        return '<button class="btn sm ghost" onclick="Pack.instant(\''+x.k+'\','+x.mins+')">'+x.ic+' '+esc(x.n)+'（'+x.mins+'分）</button>'}).join('')+'</div></div>';
    /* 臨時工具 */
    h+='<div class="card"><h2>🎮 一撳就印嘅工具</h2><div class="pk-quick">'+
      '<button class="btn sm" onclick="PrintKit.openModal(\'game-cards\')">🃏 22 個遊戲帶領卡</button>'+
      '<button class="btn sm ghost" onclick="PrintKit.openModal(\'craft-ready\')">✂️ 手工即用紙總覽</button>'+
      '<button class="btn sm ghost" onclick="PrintKit.openModal(\'floor-grid\')">🦗 九宮格地貼</button>'+
      '<button class="btn sm ghost" onclick="PrintKit.openModal(\'corner-signs\')">🅰️ 四角角牌／靶</button>'+
      '<button class="btn sm ghost" onclick="PrintKit.openModal(\'craft-ctrl\')">🧒 手工控場卡</button>'+
      '<button class="btn sm ghost" onclick="PrintKit.openModal(\'sfh-cards\')">🛡️ 身體界線卡</button>'+
      '</div></div>';
    /* 年度行事曆（收埋，唔使讀） */
    var pl=Store.get('plan',{rows:[]})||{rows:[]};
    h+='<details class="card pk-cal"><summary>📅 年度行事曆（'+(pl.rows||[]).length+' 次）</summary>'+
      ((pl.rows||[]).length?Plan.calendar(pl):'<div class="mute">未排行事曆 — 去「📅 規劃」撳「重建行事曆」。</div>')+'</details>';
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
  kidSheets:function(m,copies){
    var list=Sheets.forMeet(m),n=Math.max(1,Math.min(40,+copies||1)),h='',i,j;
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
      if(Pack.want('kid',all))n+=Sheets.forMeet(m).length*Pack.copies();
      if(Pack.want('floor',all))n+=Sheets.floorFor(m).length;
    }
    return n;
  },
  sheets:function(who,m,all){
    var h=[];
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
    var title=who==='lead'?'🧑‍🏫 領袖套包':'🧒 小朋友即用紙';
    Modal.open('<div class="print-preview-modal">'+
      '<div class="print-preview-top"><div><h3>'+title+'・'+esc(m.n)+'</h3>'+
        '<small class="mute">約 '+Pack.pages(who,m)+' 頁 A4・'+(who==='kid'?'印完即剪即用，紙上冇說明':'流程・清單・照讀口令')+'</small></div>'+
      '<div class="btns"><button class="btn gr" onclick="PrintKit.triggerPrint()">🖨️ 即刻列印 / 存 PDF</button></div></div>'+
      '<div class="print-sheet-wrapper" id="printableArea">'+html+'</div></div>');
  }
};
