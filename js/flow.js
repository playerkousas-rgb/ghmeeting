/* 🦗 flow.js — 🧭「帶你由頭做到尾」：揀咗一場集會之後，STEP BY STEP 帶新領袖預備到散會 © 2026 Scout System
   設計原則（負責人指定）：
     ・下方按鈕＝即插即用（我知我要乜，直接搵）；上方入口＝指引（我仲唔知點做）。
     ・**撳住集會標題＝即時入「#prep 逐步預備頁」**——每步只做一件事：而家做乜、點解要做、撳邊個掣做。
       唔好一開波俾一堆資料；想睇全部資料先撳「📋 睇全部資料」。
     ・做咗會記住（印咗／剔齊／帶完自動標 ✓），收咗機返嚟都接得返；喺其他頁行緊預備，底部嚮導條跟住你。 */
var Flow={
  STEPS:[
    {k:'pick', ic:'📅', n:'揀今場集會',        why:'揀咗之後，印教材、執袋、帶領全部自動跟呢一場。',
      btn:'去揀集會',  go:'Flow.doPick()'},
    {k:'print',ic:'🖨️', n:'印齊教案＋圖紙',    why:'一疊過：領袖教案打頭陣，分隔頁之後就係小朋友圖紙。',
      btn:'即刻印',    go:'Flow.doPrint()'},
    {k:'bag',  ic:'🧺', n:'執袋（APP 內剔）',   why:'逐樣剔，人手已經跟名單人數計好；剔咗會記住。',
      btn:'開執袋單',  go:'Flow.doBag()'},
    {k:'venue',ic:'📍', n:'到場設場（30 分鐘）', why:'邊度做遊戲、邊度坐低、地貼貼邊度，逐項剔完先開場。',
      btn:'睇設場清單',go:'Flow.doVenue()'},
    {k:'lead', ic:'▶️', n:'開始帶領',          why:'跟綠色領袖欄一步步做，計時同畫面 APP 幫你出。',
      btn:'即開帶領',  go:'Flow.doLead()'},
    {k:'rec',  ic:'🏅', n:'完場記出席',        why:'記低邊個到咗，團員章同小草蜢進度自動計。',
      btn:'去記錄',    go:'Flow.doRec()'}
  ],
  /* ---------- 狀態（每場獨立記住） ---------- */
  st:function(){
    var s=Store.get('flow',null);
    if(!s||typeof s!=='object')s={on:0,tid:'',done:{},min:0};
    if(!s.done)s.done={};
    return s;
  },
  save:function(s){Store.set('flow',s)},
  tidNow:function(){return (typeof Pack!=='undefined')?Pack.meet().tid:''},
  /* 揀咗第二場 → 重新由第二步開始（第一步「揀集會」當做咗） */
  sync:function(){
    var s=Flow.st(),t=Flow.tidNow();
    if(s.on&&s.tid!==t){s.tid=t;s.done={pick:1};s.min=0;Flow.save(s)}
    return s;
  },
  on:function(){return !!Flow.st().on},
  start:function(){
    var s=Flow.st();
    s.on=1;s.min=0;s.tid=Flow.tidNow();
    if(!s.done)s.done={};
    Flow.save(s);
    if(typeof App!=='undefined')App.route();
    toast('🧭 好，我一步步帶你做到尾');
  },
  /* 揀咗一場＝即時入 STEP BY STEP 預備（整部 APP 都跟呢場：套包／工作紙／執袋全部自動係呢場） */
  select:function(no,tid){
    if(typeof Pack!=='undefined')Pack.pick('tpl',tid,no||0,true);
    var s=Flow.st();s.on=1;s.min=0;Flow.save(s);
    if(typeof App!=='undefined')App.go('#prep');
    var t=(typeof dur==='function')?dur(tid):null;
    toast('🧭 揀好「'+(t?esc(t.n):'')+'」— 跟住 6 步預備，一步只做一件事');
  },
  selectTpl:function(tid){
    var pr=(typeof Kit!=='undefined'&&Kit.planRow)?Kit.planRow(tid):null;
    Flow.select(pr?pr.no:0,tid);
  },
  /* 逐步預備頁入面嘅動作：全部「原地做」（彈窗疊喺預備頁上面），做完唔使返去其他頁 */
  prepGo:function(st){
    var no=(typeof Pack!=='undefined')?(Pack.meet().no||0):0;
    switch(st.k){
      case 'pick': return 'App.go(\'#plan\')';
      case 'print': return 'Pack.open(\'all\')';
      case 'bag': return 'Pack.bagModal()';
      case 'venue': return 'Venue.open()';
      case 'lead': return 'Pack.lead()';
      case 'rec': return no?('Track.attendPrompt('+no+')'):('App.go(\'#track\')');
    }
    return st.go;
  },
  quit:function(){
    var s=Flow.st();s.on=0;Flow.save(s);
    if(typeof App!=='undefined')App.route();
    toast('已收起嚮導 — 隨時喺「揀集會」頁撳返「🧭 帶我做到尾」');
  },
  minimize:function(){var s=Flow.st();s.min=s.min?0:1;Flow.save(s);Flow.render()},
  reset:function(){var s=Flow.st();s.done={};s.on=1;s.tid=Flow.tidNow();Flow.save(s);if(typeof App!=='undefined')App.route()},
  /* 邊一步做咗、邊一步係「而家嗰步」 */
  isDone:function(k){return !!Flow.st().done[k]},
  /* 喺逐步預備頁做咗一步 → 頁面即刻更新（下一步彈出嚟）；其他頁就更新底部條 */
  _after:function(){
    if(typeof App!=='undefined'&&App.view==='prep'){App.route();return}
    Flow.render();
  },
  mark:function(k,quiet){
    var s=Flow.st();
    if(s.done[k])return;
    s.done[k]=1;Flow.save(s);
    if(!s.on)return;
    var nx=Flow.cur();
    if(!quiet)toast(nx?('✓ 做咗！下一步：'+nx.ic+' '+nx.n):'🎉 全部步驟做齊，散會！');
    Flow._after();
  },
  unmark:function(k){var s=Flow.st();delete s.done[k];Flow.save(s);Flow._after()},
  cur:function(){
    var s=Flow.st(),i;
    for(i=0;i<Flow.STEPS.length;i++)if(!s.done[Flow.STEPS[i].k])return Flow.STEPS[i];
    return null;
  },
  curNo:function(){
    var c=Flow.cur();if(!c)return Flow.STEPS.length;
    for(var i=0;i<Flow.STEPS.length;i++)if(Flow.STEPS[i].k===c.k)return i+1;
    return 1;
  },
  doneCount:function(){var s=Flow.st();return Flow.STEPS.filter(function(x){return s.done[x.k]}).length},

  /* ---------- 每一步撳落去做乜 ---------- */
  doPick:function(){App.go('#plan');toast('撳「集會目錄」任何一題，即刻入逐步預備')},
  doPrint:function(){App.go('#pack');setTimeout(function(){Pack.open('all')},60)},
  doBag:function(){App.go('#pack');setTimeout(function(){Pack.bagModal()},60)},
  doVenue:function(){if(typeof Venue!=='undefined')Venue.open();else App.go('#pack')},
  doLead:function(){Modal.close();if(typeof Pack!=='undefined')Pack.lead()},
  doRec:function(){Modal.close();App.go('#track')},

  /* ---------- 底部嚮導條 ---------- */
  render:function(){
    var el=(typeof document!=='undefined')?document.getElementById('flowbar'):null;
    if(!el)return;
    var view=document.getElementById('view');
    /* 逐步預備頁本身就係嚮導——唔使再出底部條（其他頁行緊預備先出條跟住你） */
    if(!Flow.on()||(typeof App!=='undefined'&&App.view==='prep')){el.innerHTML='';el.className='';if(view)view.style.paddingBottom='';return}
    Flow.sync();
    el.className='on';
    el.innerHTML=Flow.barHtml();
    if(view)view.style.paddingBottom=(Flow.st().min?150:196)+'px';
  },
  dotsHtml:function(){
    var s=Flow.st();
    return '<span class="fb-dots">'+Flow.STEPS.map(function(x,i){
      var cls=s.done[x.k]?'d':(Flow.curNo()===i+1?'c':'');
      return '<i class="'+cls+'" title="'+esc(x.n)+'"></i>';
    }).join('')+'</span>';
  },
  barHtml:function(){
    var c=Flow.cur(),s=Flow.st(),m=(typeof Pack!=='undefined')?Pack.meet().m:null;
    var head='<div class="fb-top"><b>🧭 帶你由頭做到尾</b>'+
      (c?'<span class="fb-no">第 '+Flow.curNo()+' 步／共 '+Flow.STEPS.length+'</span>':'<span class="fb-no ok">全部做齊 🎉</span>')+
      Flow.dotsHtml()+
      '<button class="fb-ic" onclick="App.go(\'#prep\')" title="逐步預備頁">📋</button>'+
      '<button class="fb-ic" onclick="Flow.minimize()" title="縮細／放大">'+(s.min?'▲':'▼')+'</button>'+
      '<button class="fb-ic" onclick="Flow.quit()" title="唔使帶，我自己嚟">✕</button></div>';
    if(!c){
      return head+(s.min?'':'<div class="fb-main"><div class="fb-txt"><b>🎉 散會！今場由頭到尾做齊晒。</b>'+
        '<small>下一場想再要嚮導：撳「重頭再嚟」，或者喺「揀集會」頁再開。</small></div>'+
        '<div class="fb-act"><button class="btn sm" onclick="Flow.reset()">🔁 下一場重頭再嚟</button>'+
        '<button class="btn sm ghost" onclick="Flow.quit()">完成</button></div></div>');
    }
    if(s.min)return head;
    return head+'<div class="fb-main"><div class="fb-txt"><b>'+c.ic+' '+esc(c.n)+'</b>'+
      '<small>'+esc(c.why)+(m&&c.k!=='pick'?'　（今場：'+esc(m.n)+'）':'')+'</small></div>'+
      '<div class="fb-act"><button class="btn sm" onclick="'+c.go+'">'+esc(c.btn)+' ▸</button>'+
      '<button class="btn sm ghost" onclick="Flow.mark(\''+c.k+'\')">✓ 做咗</button></div></div>';
  },
  /* 📋 逐步預備頁（#prep）：撳住集會標題之後嘅主畫面——一步只做一件事，唔係一堆資料 */
  prepHtml:function(){
    Flow.sync();
    var s=Flow.st();
    var cm=(typeof Pack!=='undefined')?Pack.meet():{m:TPLS[0],tid:TPLS[0].id,no:0};
    var m=cm.m,no=cm.no||0;
    var cur=Flow.cur();
    var total=Flow.STEPS.length,doneN=Flow.doneCount();
    var h='<div class="card prep-hero"><span class="eyebrow">🧭 STEP BY STEP 預備</span>'+
      '<h2>'+esc(m.n)+'</h2>'+
      '<div class="mute" style="font-size:.85rem">'+(m.mo?esc(m.mo)+'・':'')+'約 '+Plan.lenOf(m)+' 分鐘・'+(m.stages?m.stages.length:0)+' 個環節</div>';
    if(m.stages&&m.stages.length)h+='<div class="prep-chips">'+m.stages.map(function(x){return '<span class="tag">'+esc(x.n)+'</span>'}).join('')+'</div>';
    h+='<div class="btns" style="margin-top:10px">'+
      '<button class="btn sm ghost" onclick="App.go(\'#plan\')">← 返目錄・換一場</button>'+
      '<button class="btn sm ghost" onclick="Prepare.detail(\''+cm.tid+'\')">📋 睇全部資料</button>'+
      '<button class="btn sm ghost" onclick="Flow.quit()">✕ 收埋嚮導</button></div></div>';
    if(!s.on){
      h+='<div class="card"><h3>第一次帶呢場？我一步步帶你。</h3>'+
        '<div class="mute" style="font-size:.85rem">印教材 → 執袋 → 設場 → 帶領 → 記出席。每步只做一件事，做咗會記住，收咗機返嚟都接得返。</div>'+
        '<div class="btns" style="margin-top:8px"><button class="btn gr" onclick="Flow.start()">🧭 帶我由頭做到尾</button></div></div>';
      return h;
    }
    h+='<div class="card"><div class="prep-prog"><b>'+(cur?('第 '+Flow.curNo()+' 步／共 '+total):'全部做齊 🎉')+'</b>'+
      '<div class="prep-prog-bar"><span style="width:'+(Math.round(doneN/total*100))+'%"></span></div></div>'+
      '<div class="prep-steps">'+
      Flow.STEPS.map(function(st,i){
        var isDone=!!s.done[st.k],isCur=(cur&&cur.k===st.k);
        if(isCur){
          return '<div class="prep-step cur"><span class="prep-step-no">'+(i+1)+'</span><div class="prep-step-b">'+
            '<b>'+st.ic+' '+esc(st.n)+'</b><small>'+esc(st.why)+'</small>'+
            '<div class="btns" style="margin-top:8px"><button class="btn gr blk" onclick="'+Flow.prepGo(st)+'">'+esc(st.btn)+' ▸</button>'+
            '<button class="btn ghost" onclick="Flow.mark(\''+st.k+'\')">✓ 做咗</button></div></div></div>';
        }
        if(isDone){
          return '<div class="prep-step done"><span class="prep-step-no">✓</span><div class="prep-step-b"><b>'+st.ic+' '+esc(st.n)+'</b></div>'+
            '<button class="btn sm ghost prep-undo" onclick="Flow.unmark(\''+st.k+'\')">↺</button></div>';
        }
        return '<div class="prep-step"><span class="prep-step-no">'+(i+1)+'</span><div class="prep-step-b"><b>'+st.ic+' '+esc(st.n)+'</b></div></div>';
      }).join('')+'</div></div>';
    if(!cur){
      h+='<div class="card prep-done"><h3>🎉 散會！由頭到尾做齊晒。</h3>'+
        '<div class="btns"><button class="btn" onclick="App.go(\'#plan\')">→ 去目錄揀下一場</button>'+
        '<button class="btn ghost" onclick="App.go(\'#track\')">🏅 去記錄睇進度</button></div></div>';
    }else{
      h+='<div class="mute" style="font-size:.78rem;text-align:center">每步只做一件事；印咗／執齊／帶完都會自動標 ✓，唔使自己記。</div>';
    }
    return h;
  }
};
