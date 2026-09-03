/* 🦗 prepare.js — 集會庫、範本詳情、自製編排器、物資清單、分享 © 2026 Scout System */
var Prepare={
  filter:'all',
  html:function(){
    var cats=[['all','全部'],['member','團員章'],['prog','進步'],['fest','特別'],['outdoor','戶外'],['gh','小草蜢'],['custom','自訂']];
    var h='<div class="card">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'+
        '<div><h2>🧩 帶領卡庫</h2><div class="mute" style="font-size:.83rem">'+TPLS.length+'張即用帶領卡。拆解成「先做咩、點樣示範、要講咩、要留意咩」。</div></div>'+
        '<button class="btn sm" onclick="App.go(\'#print\')" style="background:#2e7d32;color:#fff">🖨️ A4 打印教材套包庫 ↗</button>'+
      '</div>'+
      '<div class="attention" style="margin-top:10px"><b>用心準備實體物資？</b> 撳右上角「🖨️ A4 打印教材套包庫」或每張卡底部的「🖨️ 打印教案」，可直接列印出紙本教案、實體圖卡與工作紙！</div>'+
      '<div style="margin:8px 0">'+cats.map(function(c){return '<span class="pill'+(Prepare.filter===c[0]?' on':'')+'" onclick="Prepare.f(\''+c[0]+'\')">'+c[1]+'</span>'}).join('')+'</div>';
    var list=TPLS.filter(function(t){return Prepare.filter==='all'||t.cat===Prepare.filter});
    list.forEach(function(t){
      h+='<div class="mem" style="margin:10px 0"><h4>'+esc(t.n)+' <span class="tag">'+TPLS.catName[t.cat]+'</span></h4>'+
        '<small class="mute">'+esc(t.theme)+'・建議'+t.mo+'・約'+Plan.lenOf(t)+'分鐘・'+t.stages.length+'個環節</small>'+
        '<div class="btns" style="margin:8px 0 0">'+
        '<button class="btn sm" onclick="Prepare.detail(\''+t.id+'\')">🧭 睇準備卡</button>'+
        '<button class="btn sm gr" onclick="Lead.start(\''+t.id+'\')">▶ 即刻帶領</button>'+
        '<button class="btn sm ghost" onclick="PrintKit.openModal(\'lesson-plans\',\''+t.id+'\')">🖨️ 打印教案</button>'+
        '<button class="btn sm ghost" onclick="Prepare.edit(\''+t.id+'\')">✏️ 改內容</button>'+
        '</div></div>';
    });
    h+='</div>';
    var my=Store.get('mymeets',[]);
    h+='<div class="card"><h2>🗂️ 我嘅集會 <span class="tag g">'+my.length+'</span></h2>'+
      (my.length?'<div class="mute" style="font-size:.83rem">你儲存嘅自製／修改集會。</div>'+my.map(function(m){
        return '<div class="mem" style="margin:10px 0"><h4>'+esc(m.n)+'</h4><small class="mute">約'+m.stages.reduce(function(a,s){return a+(+s.m||0)},0)+'分鐘・'+m.stages.length+'環節</small>'+
        '<div class="btns" style="margin:8px 0 0"><button class="btn sm gr" onclick="Lead.startMy(\''+m.id+'\')">▶ 帶領</button>'+
        '<button class="btn sm ghost" onclick="Prepare.editMy(\''+m.id+'\')">✏️ 編輯</button>'+
        '<button class="btn sm ghost" onclick="Prepare.shareMy(\''+m.id+'\')">📤 分享</button>'+
        '<button class="btn sm ghost rd" style="color:#b71c1c;border-color:#e53935" onclick="Prepare.delMy(\''+m.id+'\')">🗑️</button></div></div>'}).join('')
      :'<div class="empty">未有自製集會。揀上面任何範本撳「✏️ 複製修改」,或者<br><button class="btn sm" onclick="Prepare.edit(\'blank\')" style="margin-top:8px">➕ 由空白開始</button></div>')+'</div>';
    return h;
  },
  f:function(c){Prepare.filter=c;App.route()},
  brief:function(s,i){
    var g=Guide.forStage(s);
    var mats=(s.mats||[]).length?'<div class="mats-bar"><b>🧺 要拎：</b>'+s.mats.map(function(m){return '<span class="pill" onclick="this.classList.toggle(\'on\')"><span class="dot"></span>'+esc(m)+'</span>'}).join('')+'</div>':'';
    var visual=(s.screen==='chuteopen'||s.screen==='chuteclose'||s.screen==='chute')?Lead.parachuteSvg(s.screen==='chuteclose'?'close':'open'):'';
    return '<article class="brief-card"><div class="brief-head"><span class="brief-no">'+(i+1)+'</span><div><h3>'+esc(s.n)+'</h3><small>'+esc(s.t)+'・'+(+s.m||0)+' 分鐘</small></div></div>'+mats+visual+
      '<div class="guide-lead"><b>領袖先做</b>'+esc(g.lead)+'</div><div class="guide-steps">'+g.steps.map(function(x){return '<div class="guide-step"><span class="gnum">'+esc(x[0])+'</span><span class="gicon">'+x[1]+'</span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></div>'}).join('')+'</div>'+
      '<div class="say-box"><b>🎤 可以直接照講</b>'+esc(g.say)+'</div><div class="watch-row"><div><b>👀 睇住呢樣</b><br>'+esc(g.watch)+'</div><div class="safe"><b>🛡️ 安全</b><br>'+esc(g.safety)+'</div></div>'+
      '<details style="margin-top:9px"><summary>顯示完整玩法文字</summary><div class="box" style="margin-top:6px">'+esc(s.how||'')+'</div></details><div class="btns"><button class="btn sm gr" onclick="Prepare.detailStage(\''+esc(Prepare._detailId||'')+'\','+i+')">▶ 試用呢節</button></div></article>';
  },
  detailStage:function(id,i){
    var t=dur(id);if(t&&t.stages[i])Lead.startStage(id,i);
  },
  detail:function(id){
    var t=dur(id);if(!t)return;Prepare._detailId=id;
    var mats=matsOf(t);
    var h='<div class="ready-detail"><div class="eyebrow">🧭 領袖準備卡・'+esc(t.mo)+'</div><h3>'+esc(t.n)+'</h3><div class="mute" style="font-size:.85rem">'+esc(t.theme)+'・約 <b>'+Plan.lenOf(t)+' 分鐘</b>・'+t.stages.length+' 個小步驟</div>'+
      '<div class="btns" style="margin-top:12px">'+
        '<button class="btn gr" onclick="Modal.close();Lead.start(\''+t.id+'\')">▶ 由頭開始帶領</button>'+
        '<button class="btn" style="background:#2e7d32;color:#fff" onclick="PrintKit.openModal(\'lesson-plans\',\''+t.id+'\')">🖨️ 打印本集 A4 教案</button>'+
        '<button class="btn ghost" onclick="Prepare.shareTpl(\''+t.id+'\')">📤 分享準備卡</button>'+
      '</div>'+
      '<div class="attention" style="margin-top:12px"><b>開場前只做三件事</b><br>① 按下面物資清單執齊　② 預留活動位置　③ 撳「由頭開始帶領」，跟綠色領袖欄一步一步做。</div>'+
      '<div class="card" style="box-shadow:none;border:1px solid var(--line);padding:11px;margin:12px 0"><h4 style="margin:0;color:var(--ord)">🧺 物資總清單・逐項撳一下剔走</h4><div class="mats-bar">'+(mats.length?mats.map(function(m){return '<span class="pill" onclick="this.classList.toggle(\'on\')"><span class="dot"></span>'+esc(m)+'</span>'}).join(''):'<span class="mute">今次唔需要額外物資</span>')+'</div></div>'+
      '<h4 style="margin:14px 0 4px;color:var(--ord)">跟住呢條流程做</h4>'+t.stages.map(function(s,i){return Prepare.brief(s,i)}).join('')+
      '<div class="attention"><b>收尾</b><br>完成後返到帶領畫面最後一頁，撳「記錄完成＋記出席」，就唔使另外抄名單。</div></div>';
    Modal.open(h);
  },
  /* ---------- 編排器 ---------- */
  edit:function(id){ // 由範本新做一份(存入 mymeets)
    var t=dur(id);var m={id:'m'+Date.now(),n:t?('(改)'+t.n):'新集會',stages:JSON.parse(JSON.stringify(t?t.stages:[]))};
    Prepare.editor(m,false);
  },
  editMy:function(id){var m=Store.get('mymeets').find(function(x){return x.id===id});if(m)Prepare.editor(m,true)},
  delMy:function(id){if(confirm('刪除呢個自製集會?')){Store.set('mymeets',Store.get('mymeets').filter(function(x){return x.id!==id}));App.route()}},
  editor:function(m,isMy){
    Prepare._m=m;Prepare._isMy=isMy;
    var h='<h3>🛠️ 集會編排器</h3>'+
      '<label class="f">集會名稱</label><input type="text" id="edN" value="'+esc(m.n)+'">'+
      '<div class="btns"><button class="btn sm" onclick="Prepare.save()">💾 儲存</button>'+
      (isMy?'<button class="btn sm gr" onclick="Prepare.save();Lead.startMy(\''+m.id+'\')">▶ 儲存並帶領</button>':'')+
      '<button class="btn sm ghost" onclick="Prepare.addBlock()">➕ 加環節</button>'+
      '<button class="btn sm ghost" onclick="Prepare.preview()">👁️ 預視物資</button></div>'+
      '<div id="edStages"></div>';
    Modal.open(h);Prepare.renderStages();
  },
  renderStages:function(){
    var m=Prepare._m;var el=document.getElementById('edStages');if(!el)return;
    if(!m.stages.length){el.innerHTML='<div class="empty">冇環節,撳「➕ 加環節」</div>';return}
    var total=m.stages.reduce(function(a,s){return a+(+s.m||0)},0);
    var h='<div class="mute" style="font-size:.8rem">合計 <b>'+total+'</b> 分鐘</div><div class="tbl"><tr><th>分</th><th>環節</th><th></th></tr>';
    m.stages.forEach(function(s,i){
      h+='<tr><td><input type="number" value="'+(+s.m||0)+'" min="1" max="120" style="width:56px;padding:5px" onchange="Prepare._m.stages['+i+'].m=+this.value;Prepare.renderStages()"></td>'+
        '<td><b>'+esc(s.n)+'</b><br><small class="mute">'+s.t+'</small></td>'+
        '<td style="white-space:nowrap"><button class="btn sm ghost" onclick="Prepare.stageOpts('+i+')">✏️</button> '+
        '<button class="btn sm ghost" onclick="Prepare.move('+i+',-1)">⬆️</button><button class="btn sm ghost" onclick="Prepare.move('+i+',1)">⬇️</button> '+
        '<button class="btn sm ghost rd" style="color:#b71c1c;border-color:#e53935" onclick="Prepare._m.stages.splice('+i+',1);Prepare.renderStages()">🗑️</button></td></tr>';
    });
    el.innerHTML=h+'</div>';
  },
  move:function(i,d){var a=Prepare._m.stages;var j=i+d;if(j<0||j>=a.length)return;a.splice(j,0,a.splice(i,1)[0]);Prepare.renderStages()},
  addBlock:function(){
    var h='<h3>➕ 揀環節積木</h3><div class="grid2">'+
      DATA.blocks.map(function(b,i){return '<div class="mem" style="margin:0"><h4>'+b.ic+' '+esc(b.n)+'</h4><small class="mute">'+b.t+'・'+b.m+'分鐘</small><br><button class="btn sm" style="margin-top:6px" onclick="Prepare.addBlockIdx('+i+')">加入</button></div>'}).join('')+
      '</div><div class="btns" style="margin-top:10px"><button class="btn sm ghost" onclick="Prepare.stageOpts(-1)">🧪 自訂環節…</button></div>';
    Modal.stack=h;Modal.open(h);
  },
  addBlockIdx:function(i){
    var b=JSON.parse(JSON.stringify(DATA.blocks[i]));delete b.ic;
    Prepare._m.stages.push(b);toast('已加入 '+b.n);
    Modal.open(Prepare._editorHtml());Prepare.renderStages();
  },
  _editorHtml:function(){var m=Prepare._m;
    return '<h3>🛠️ 集會編排器</h3><label class="f">集會名稱</label><input type="text" id="edN" value="'+esc(m.n)+'">'+
      '<div class="btns"><button class="btn sm" onclick="Prepare.save()">💾 儲存</button>'+
      '<button class="btn sm ghost" onclick="Prepare.addBlock()">➕ 加環節</button>'+
      '<button class="btn sm ghost" onclick="Prepare.preview()">👁️ 預視物資</button></div><div id="edStages"></div>'},
  stageOpts:function(i){
    var s=i>=0?Prepare._m.stages[i]:{t:'自訂',n:'新環節',m:5,how:'',script:'',mats:[]};
    Prepare._si=i;
    Modal.open('<h3>'+(i>=0?'✏️ 編輯環節':'🧪 自訂環節')+'</h3>'+
      '<label class="f">名稱</label><input type="text" id="soN" value="'+esc(s.n)+'">'+
      '<label class="f">類型</label><select id="soT">'+['儀式','點名','課程','遊戲','美勞','故事','唱遊','靜息','特備','頒獎'].map(function(t){return '<option'+(s.t===t?' selected':'')+'>'+t+'</option>'}).join('')+'</select>'+
      '<label class="f">分鐘</label><input type="number" id="soM" value="'+(+s.m||5)+'" min="1" max="180">'+
      '<label class="f">點玩/內容</label><textarea id="soH">'+esc(s.how||'')+'</textarea>'+
      '<label class="f">🎤 領袖講稿(帶領模式顯示)</label><textarea id="soS">'+esc(s.script||'')+'</textarea>'+
      '<label class="f">物資(逗號分隔)</label><input type="text" id="soMat" value="'+esc((s.mats||[]).join(','))+'">'+
      '<label class="f">投影畫面</label><select id="soScr">'+Prepare.scrList(s.screen)+'</select>'+
      '<div class="btns" style="margin-top:12px"><button class="btn" onclick="Prepare.saveStage()">確定</button></div>');
  },
  scrList:function(cur){
    var opts=[
      ['howto','內容卡(預設)'],
      ['bodycard','🛡️ 身體地圖紅黃綠(免實物卡)'],
      ['recycle','♻️ 三色回收分類擂台(免實物垃圾)'],
      ['task','🎯 任務抽籤機(善行/家務)'],
      ['flags','🇭🇰 國旗與區旗敬禮'],
      ['clean','🧼 洗手七步與計時歌'],
      ['emotion','😊 情緒面面觀輪盤'],
      ['transport','🚗 交通工具大圖鑑'],
      ['foodrainbow','🌈 彩虹健康飲食盤'],
      ['moon','🌕 中秋射月拋圈靶'],
      ['bpstory','🏕️ 貝登堡故事繪本'],
      ['scoutfamily','🌲 童軍大家庭地圖'],
      ['badgego','🏅 獎章路線圖'],
      ['scarf','🧣 整理領巾三步圖解'],
      ['ghinfo','🦗 認識小草蜢圖鑑'],
      ['chuteopen','快樂傘開會儀式'],
      ['chuteclose','快樂傘散會儀式'],
      ['promise','誓詞/規律大字'],
      ['song','主題曲卡拉OK'],
      ['roll','點名抽籤'],
      ['chute','快樂傘玩法卡'],
      ['quiz','問答擂台'],
      ['judge','對錯法庭'],
      ['guess','估估下剪影'],
      ['memory','記憶配對'],
      ['leader','領袖話'],
      ['traffic','紅綠燈'],
      ['catch','捉草蜢'],
      ['rhythm','律動/節奏'],
      ['breath','靜息呼吸'],
      ['story','故事卡']
    ];
    var seen={};return opts.filter(function(o){return seen[o[0]]?!1:seen[o[0]]=1}).map(function(o){return '<option value="'+o[0]+'"'+(cur===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('');
  },
  saveStage:function(){
    var s={t:document.getElementById('soT').value,n:document.getElementById('soN').value,
      m:+document.getElementById('soM').value||5,how:document.getElementById('soH').value,
      script:document.getElementById('soS').value,screen:document.getElementById('soScr').value,
      mats:document.getElementById('soMat').value.split(/[,、]/).map(function(x){return x.trim()}).filter(Boolean)};
    if(Prepare._si>=0)Prepare._m.stages[Prepare._si]=s;else Prepare._m.stages.push(s);
    Modal.open(Prepare._editorHtml());Prepare.renderStages();
  },
  save:function(){
    var m=Prepare._m;m.n=document.getElementById('edN').value||m.n;
    var my=Store.get('mymeets');var i=my.findIndex(function(x){return x.id===m.id});
    if(i>=0)my[i]=m;else my.push(m);
    Store.set('mymeets',my);toast('已儲存 ✓');App.route();Modal.close();
  },
  preview:function(){
    var mats=matsOf(Prepare._m);
    var inner='<h3>🧺 物資自動埋單</h3>'+(mats.length?mats.map(function(x){return '<div class="chk"><span class="dot"></span>'+esc(x)+'</div>'}).join(''):'<div class="empty">呢個集會暫時唔需要物資</div>')+
      '<div class="btns" style="margin-top:10px"><button class="btn sm ghost" onclick="Prepare.backToEditor()">返回編排器</button></div>';
    Modal.open(inner);
  },
  backToEditor:function(){Modal.open(Prepare._editorHtml());Prepare.renderStages()},
  /* ---------- 分享 ---------- */
  shareTpl:function(id){var t=dur(id);Prepare.share(t)},
  shareMy:function(id){var m=Store.get('mymeets').find(function(x){return x.id===id});if(m)Prepare.share(m)},
  share:function(t){
    var lines=['🦗 '+t.n+'('+Plan.lenOf(t)+'分鐘)','主題:'+t.theme,''];
    t.stages.forEach(function(s,i){lines.push((i+1)+'. ['+s.m+'分鐘]['+s.t+'] '+s.n);if(s.how)lines.push('   '+s.how);if(s.mats&&s.mats.length)lines.push('   🧺 '+s.mats.join('、'))});
    var mats=matsOf(t);if(mats.length)lines.push('','🧺 物資總清單:'+mats.join('、'));
    lines.push('','— 分享自 小童軍集會助手 © Scout System');
    var txt=lines.join('\n');
    if(navigator.share)navigator.share({text:txt}).catch(function(){});
    else if(navigator.clipboard)navigator.clipboard.writeText(txt).then(function(){toast('已複製,可直接貼俾其他領袖')});
    else toast('請手动抄低 🙂');
  }
};
