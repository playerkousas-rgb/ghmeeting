/* 🦗 chute.js — 🌈 快樂傘（🅱️ 工具箱）：臨時想加個節目，一撳就有圖卡＋口令＋點樣帶三步 © 2026 Scout System
   定位：下方工具箱＝即開即用，唔使事前準備——突然想加個節目，撳一下全螢幕圖卡就開。
   同一份資料（DATA.chute）亦供 ▶️帶領玩法卡、🧩範本環節、📖手冊快樂傘分頁使用：改一處，全站跟住改。 */
var Chute={
  tag:'all',
  TAGS:[['all','全部'],['動起來','💪 動起來'],['學嘢','🧠 學嘢'],['冷靜落嚟','🤫 冷靜落嚟']],
  /* ---------- 一撳即開的四個大掣：最常用嘅四個情景 ---------- */
  quick:function(){
    return qBtn('▶','開會儀式','面向傘・跪低・執實 → 齊叫口號揚傘','Chute.ritual(\'open\')')+
           qBtn('🏁','散會儀式','停・口號・慢慢放低 → 落到膝頭先整理','Chute.ritual(\'close\')')+
           qBtn('🎲','幫我抽一式','唔知揀邊式？APP 幫你抽','Chute.random()')+
           qBtn('🤫','要佢哋冷靜','玩到太興奮，一式就收得返','Chute.calm()');
  },
  list:function(){
    return this.tag==='all'?DATA.chute:DATA.chute.filter(function(c){return c.tag===Chute.tag});
  },
  f:function(t){this.tag=t;App.route()},
  random:function(){
    var arr=this.list();if(!arr.length)return;
    var c=arr[Math.floor(Math.random()*arr.length)];
    this.play(DATA.chute.indexOf(c));
  },
  /* 冷靜落嚟一式：優先「無聲傘」，其餘同類隨機 */
  calm:function(){
    var arr=DATA.chute.filter(function(c){return c.tag==='冷靜落嚟'});
    var c=arr.filter(function(x){return x.n==='無聲傘'})[0]||arr[Math.floor(Math.random()*arr.length)]||DATA.chute[0];
    this.play(DATA.chute.indexOf(c));
    toast('🤫 玩完呢式就收得返');
  },
  play:function(i){
    if(typeof Lead==='undefined'||!Lead.startChute)return;
    Lead.startChute(i);
  },
  /* 🔍 全站搜尋：開咗個框就幫你打關鍵字（例如「傘」） */
  find:function(q){
    if(typeof Kit==='undefined'||!Kit.searchOpen)return;
    Kit.searchOpen();
    setTimeout(function(){
      var i=document.getElementById('srchIn');
      if(i){i.value=q;Kit.searchType(i)}
    },90);
  },
  /* 開會／散會儀式：直接借用環節積木嗰張卡，帶領畫面、講稿、圖解全部跟足 */
  ritual:function(mode){
    if(typeof Lead==='undefined')return;
    var sc=mode==='open'?'chuteopen':'chuteclose';
    var b=(DATA.blocks||[]).filter(function(x){return x.screen===sc})[0];
    if(!b)return;
    Lead.cleanupTimers();
    Lead.S={meet:{id:'chute-'+sc,n:'🌈 '+(b.n||'快樂傘儀式'),stages:[JSON.parse(JSON.stringify(b))]},
      idx:0,left:(b.m||5)*60,timerOn:false,no:0};
    Lead.open();
  },
  html:function(){
    var n=DATA.chute.length;
    var m=(typeof Kit!=='undefined'&&Kit.mats)?Kit.mats['快樂傘']:null;
    var h='<div class="card chute-hero"><span class="eyebrow">🌈 快樂傘</span>'+
      '<h2>突然想加個節目？撳一下就開。</h2>'+
      '<p class="mute">'+n+' 式玩法卡，每張都有<b>點玩・口令・點樣帶三步</b>。'+
      '撳完開全螢幕圖卡＋動作圖解，領袖照住讀就得——<b>唔使事前準備</b>。</p>'+
      '<div class="tk-grid">'+this.quick()+'</div></div>';

    /* ① 基本動作：未玩過都要先識三步 */
    h+='<div class="card"><h3>👐 先學三步，乜式都玩得</h3>'+
      '<div class="mute" style="font-size:.83rem">新領袖／新團員第一次玩，先做一次呢三步，之後先揀玩法。</div>'+
      ((typeof Img!=='undefined')?Img.fig('chute-top','圍圈執實傘邊','圍一圈，雙手執實傘邊，領袖喺外面打手勢'):'')+
      ((typeof Img!=='undefined')?Img.fig('chute-steps','執傘・揚高・蒙古包','① 執實傘邊 ② 數一二三一齊揚高 ③ 踏前一步趴低變蒙古包'):'')+
      ((typeof Lead!=='undefined'&&Lead.parachuteSvg)?Lead.parachuteSvg('open'):'')+
      '<div class="attention"><b>開會口令</b>「面向傘、跪低、執實」→ 一、二、三，揚傘。<br>'+
      '<b>散會口令</b>「停、口號、慢慢放低」→ 傘落到膝頭先至整理。<br>'+
      '<b>安全三句</b>（每次開場講一次）：🤲 執實傘邊 ↔️ 留一隻手臂距離 🛑 聽到停就停。</div></div>';

    /* ② 幾多張傘・冇傘點算：開會前先知都唔遲 */
    if(m)h+='<div class="card"><h3>🧺 幾多張傘・冇傘點算</h3><div class="box">'+
      '<b>幾多：</b>'+esc(m.q)+'<br><b>點備：</b>'+esc(m.how)+'<br><b>冇傘：</b>'+esc(m.sub)+'</div>'+
      '<div class="btns"><button class="btn sm ghost" onclick="Chute.find(\'傘\')">🔍 搵晒同傘有關嘅嘢</button>'+
      '<button class="btn sm ghost" onclick="App.go(\'#book\');setTimeout(function(){HB.t(\'chute\')},60)">📖 手冊版快樂傘</button></div></div>';

    /* ③ 玩法卡：分類揀＋即開 */
    h+='<div class="card"><h3>🎴 '+n+' 式玩法卡 <span class="tag">即開即用</span></h3>'+
      '<div class="activity-tabs">'+this.TAGS.map(function(x){
        return '<span class="pill'+(Chute.tag===x[0]?' on':'')+'" onclick="Chute.f(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>'+
      '<div class="grid2">'+this.list().map(function(c){
        var i=DATA.chute.indexOf(c);
        var g=(typeof Guide!=='undefined'&&Guide.chute)?Guide.chute(c):{steps:[]};
        return '<div class="mem chute-card"><h4>'+c.ic+' '+esc(c.n)+' <span class="tag">'+esc(c.tag)+'</span></h4>'+
          '<div class="box" style="font-size:.85rem">'+esc(c.h)+'</div>'+
          '<div class="chute-steps">'+(g.steps||[]).map(function(s){
            return '<div><b>'+esc(s[0])+'</b>'+esc(s[1])+' '+esc(s[2])+'　'+esc(s[3])+'</div>'}).join('')+'</div>'+
          '<small class="mute">💡 '+esc(c.t)+'</small>'+
          '<div class="btns"><button class="btn sm gr" onclick="Chute.play('+i+')">▶ 即開圖卡</button></div></div>';
      }).join('')+'</div></div>';

    /* ④ 同團員章嘅關係：玩完記得計數 */
    var b=(typeof Kit!=='undefined'&&Kit.badgeMap)?Kit.badgeMap.filter(function(x){return x.k==='chute'})[0]:null;
    if(b)h+='<div class="card"><h3>🏅 玩完就計數：團員章「'+esc(b.t)+'」</h3>'+
      '<div class="box">📍 '+esc(b.where)+'<br>💡 '+esc(b.how)+'</div>'+
      '<div class="btns"><button class="btn sm gr" onclick="'+b.link+'">▶ 即刻開</button>'+
      '<button class="btn sm ghost" onclick="App.go(\'#track\')">🏅 去記錄</button></div></div>';
    return h;
  }
};

/* 🅱️ 工具箱三格共用嘅「一撳即開」大掣：快樂傘・唱歌・快鍵都用同一款，撳落去手感一致 */
function qBtn(ic,title,desc,go){
  return '<button class="tk-btn" onclick="'+go+'"><b>'+esc(ic+' '+title)+'</b><small>'+esc(desc)+'</small></button>';
}
