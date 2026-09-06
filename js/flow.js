/* 🦗 flow.js — 🧭「帶你由頭做到尾」：揀咗一場集會之後，一步接一步帶新領袖行到散會 © 2026 Scout System
   設計原則（負責人指定）：
     ・上下兩條 bar 嘅按鈕＝**快速入口**，唔負責教流程。
     ・真正嘅 step by step 由「揀集會」嗰刻開始，喺畫面底部跟住你，做完一步自動跳下一步。
     ・每一步只問一件事：而家做乜、點解要做、撳邊個掣做。做咗會記住，收咗機返嚟都接得返。 */
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
  quit:function(){
    var s=Flow.st();s.on=0;Flow.save(s);
    if(typeof App!=='undefined')App.route();
    toast('已收起嚮導 — 隨時喺「揀集會」頁撳返「🧭 帶我做到尾」');
  },
  minimize:function(){var s=Flow.st();s.min=s.min?0:1;Flow.save(s);Flow.render()},
  reset:function(){var s=Flow.st();s.done={};s.on=1;s.tid=Flow.tidNow();Flow.save(s);if(typeof App!=='undefined')App.route()},
  /* 邊一步做咗、邊一步係「而家嗰步」 */
  isDone:function(k){return !!Flow.st().done[k]},
  mark:function(k,quiet){
    var s=Flow.st();
    if(s.done[k])return;
    s.done[k]=1;Flow.save(s);
    if(!s.on)return;
    var nx=Flow.cur();
    if(!quiet)toast(nx?('✓ 做咗！下一步：'+nx.ic+' '+nx.n):'🎉 全部步驟做齊，散會！');
    Flow.render();
  },
  unmark:function(k){var s=Flow.st();delete s.done[k];Flow.save(s);Flow.render()},
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
  doPick:function(){App.go('#plan');toast('揀一場：撳行事曆任何一格，或者下面「⚡ 臨時集會」')},
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
    if(!Flow.on()){el.innerHTML='';el.className='';if(view)view.style.paddingBottom='';return}
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
  /* 揀集會頁嘅入口卡：未開嚮導就叫你開，開咗就顯示行到邊 */
  inviteHtml:function(){
    if(Flow.on()){
      var c=Flow.cur();
      return '<div class="flow-invite on"><b>🧭 嚮導行緊</b>'+
        '<span>'+(c?('而家：'+c.ic+' '+esc(c.n)+'（第 '+Flow.curNo()+'／'+Flow.STEPS.length+' 步）'):'全部做齊 🎉')+'</span>'+
        '<div class="btns" style="margin:6px 0 0"><button class="btn sm ghost" onclick="Flow.reset()">🔁 由第一步再嚟</button>'+
        '<button class="btn sm ghost" onclick="Flow.quit()">✕ 唔使帶</button></div></div>';
    }
    return '<div class="flow-invite"><b>🧭 第一次帶集會？</b>'+
      '<span>揀好一場之後，我可以喺畫面底部一步步帶你：印教材 → 執袋 → 設場 → 帶領 → 記出席。</span>'+
      '<div class="btns" style="margin:6px 0 0"><button class="btn sm gr" onclick="Flow.start()">🧭 帶我由頭做到尾</button></div></div>';
  }
};
