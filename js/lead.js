/* 🦗 lead.js — 帶領模式:投影引擎、大字畫面、計時、講稿、即用工具 © 2026 Scout System */
var Sfx={ctx:null,on:true,
  ac:function(){if(!Sfx.ctx)Sfx.ctx=new (window.AudioContext||window.webkitAudioContext)();if(Sfx.ctx.state==='suspended')Sfx.ctx.resume();return Sfx.ctx},
  tone:function(f,d,type,vol){if(!Sfx.on)return;try{var c=Sfx.ac(),o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(vol||.25,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+(d||.2));o.connect(g);g.connect(c.destination);
    o.start();o.stop(c.currentTime+(d||.2))}catch(e){}},
  ding:function(){Sfx.tone(880,.35)},pop:function(){Sfx.tone(520,.12,'triangle')},
  tick:function(){Sfx.tone(1200,.05,'square',.12)},wrong:function(){Sfx.tone(180,.4,'sawtooth',.2)},
  fanfare:function(){[523,659,784,1047].forEach(function(f,i){setTimeout(function(){Sfx.tone(f,.3)},i*130)})},
  alarm:function(){[0,1,2].forEach(function(i){setTimeout(function(){Sfx.tone(980,.18,'square',.3);},i*260)})}
};
/* 不依賴外部連結的簡單伴奏：手機／投影一按就會用瀏覽器彈出 London Bridge 旋律。 */
var Music={
  ctx:null,playing:false,beat:.42,iv:null,stopTimer:null,voices:[],
  notes:[392,440,392,349,330,349,392,294,330,349,330,349,392,392,440,392,349,330,349,392,294,392,330,262,262],
  lines:[4,4,4,4,4,5],
  play:function(){
    this.stop();
    try{
      this.ctx=Sfx.ac();var now=this.ctx.currentTime+.06;
      for(var i=0;i<this.notes.length;i++){
        var o=this.ctx.createOscillator(),g=this.ctx.createGain(),at=now+i*this.beat;
        o.type='triangle';o.frequency.value=this.notes[i];g.gain.setValueAtTime(.001,at);g.gain.linearRampToValueAtTime(.22,at+.025);g.gain.exponentialRampToValueAtTime(.001,at+this.beat*.82);o.connect(g);g.connect(this.ctx.destination);o.start(at);o.stop(at+this.beat*.86);this.voices.push(o);
      }
      this.playing=true;this.highlight(0);var self=this;this.iv=setInterval(function(){self.highlight((self._step||0)+1)},this.beat*1000);
      this.stopTimer=setTimeout(function(){self.stop()},this.notes.length*this.beat*1000+180);
    }catch(e){toast('裝置未能播放伴奏，請確認瀏覽器聲音已開啟')}
  },
  highlight:function(step){
    this._step=step;if(step<0){if(window.Lead&&Lead.songHighlight)Lead.songHighlight(-1);return}
    var total=this.notes.length;if(step>=total){this.stop();return}
    var n=step,line=0;while(line<this.lines.length&&n>=this.lines[line]){n-=this.lines[line];line++}
    if(window.Lead&&Lead.songHighlight)Lead.songHighlight(line);
  },
  stop:function(){clearInterval(this.iv);clearTimeout(this.stopTimer);this.iv=null;this.stopTimer=null;this.voices.forEach(function(o){try{o.stop()}catch(e){}});this.voices=[];this.playing=false;this._step=0;if(window.Lead&&Lead.songHighlight)Lead.songHighlight(-1)}
};
var Lead={
  S:null,tmr:null,
  html:function(){
    var s=Store.get('settings'),pl=Store.get('plan');
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var nextT=next?dur(next.tid):null;
    var my=Store.get('mymeets');
    var h='<div class="card"><h2>▶️ 現場帶領</h2><div class="mute" style="font-size:.85rem">左邊（或投影）係小朋友畫面；下面綠色欄係領袖提示。唔識唱、唔識玩都唔緊要：先睇圖，再照讀口令，最後撳「下一個」。</div>';
    h+='<div class="attention"><b>第一次用？</b> 先撳「帶領下次集會」，唔需要另外準備投影片；唱歌環節有內置伴奏，快樂傘有動作圖。</div>';
    if(nextT)h+='<div class="btns" style="margin-top:10px"><button class="btn gr blk" onclick="Lead.start(\''+nextT.id+'\','+next.no+')">▶ 帶領下次集會:'+esc(nextT.n).slice(0,18)+'…</button></div>';
    h+='</div>';
    h+='<div class="card"><h2>📚 現成範本</h2><div class="grid2">'+
      TPLS.map(function(t){return '<div class="mem" style="margin:0;padding:10px"><b style="font-size:.9rem">'+esc(t.n)+'</b><br><small class="mute">'+Plan.lenOf(t)+'分鐘</small><br><button class="btn sm gr" style="margin-top:6px" onclick="Lead.start(\''+t.id+'\')">▶</button></div>'}).join('')+
      '</div></div>';
    if(my.length)h+='<div class="card"><h2>🗂️ 我嘅集會</h2><div class="grid2">'+my.map(function(m){
      return '<div class="mem" style="margin:0;padding:10px"><b style="font-size:.9rem">'+esc(m.n)+'</b><br><button class="btn sm gr" style="margin-top:6px" onclick="Lead.startMy(\''+m.id+'\')">▶</button></div>'}).join('')+'</div></div>';
    h+='<div class="card"><h2>🧰 領袖工具(唔開集會都用得)</h2><div class="grid3">'+
      [['wheel','🎡 抽籤轉盤'],['group','👥 隨機分組'],['score','🥇 計分板'],['cd','⏳ 大聲倒數'],['sfx','📣 音效板'],['breath','🍃 靜息呼吸']].map(function(x){
      return '<button class="btn ghost" onclick="Lead.quickTool(\''+x[0]+'\')">'+x[1]+'</button>'}).join('')+'</div></div>';
    return h;
  },
  quickTool:function(t){
    Lead.S={meet:{id:'_q',n:'工具',stages:[{t:'工具',n:'領袖工具',m:99,how:'',script:'',screen:'howto'}]},idx:0,left:99*60,timerOn:false,no:0};
    Lead.open();Lead.tools(t);
  },
  start:function(id,no){
    var t=dur(id);if(!t)return;
    Lead.S={meet:JSON.parse(JSON.stringify(t)),idx:0,left:(t.stages[0].m||5)*60,timerOn:false,no:no||0};
    Lead.open();
  },
  startStage:function(id,i){
    var t=dur(id);if(!t||!t.stages[i])return;
    Lead.S={meet:{id:t.id,n:t.n+'・試用單一環節',stages:[JSON.parse(JSON.stringify(t.stages[i]))]},idx:0,left:(t.stages[i].m||5)*60,timerOn:false,no:0};
    Modal.close();Lead.open();
  },
  startChute:function(i){
    var c=DATA.chute[i];if(!c)return;
    Lead.S={meet:{id:'chute-'+i,n:'快樂傘玩法卡・'+c.n,stages:[{t:'遊戲',n:c.n,m:10,screen:'chute',chuteIndex:i}]},idx:0,left:600,timerOn:false,no:0};
    Lead.open();
  },
  startGame:function(screen,name){
    var titles={leader:'領袖話',traffic:'紅綠燈',catch:'捉草蜢',memory:'記憶配對',quiz:'問答擂台',guess:'估估下',judge:'對錯法庭',rhythm:'節奏模仿',chute:'快樂傘玩法卡',story:'故事寶盒',roll:'音樂傳球點名'};
    Lead.S={meet:{id:'game-'+screen,n:name||titles[screen]||'即玩活動',stages:[{t:'遊戲',n:name||titles[screen]||'即玩活動',m:10,screen:screen}]},idx:0,left:600,timerOn:false,no:0};
    Lead.open();
  },
  startMy:function(id){
    var m=Store.get('mymeets').find(function(x){return x.id===id});if(!m)return;
    Lead.S={meet:JSON.parse(JSON.stringify(m)),idx:0,left:(m.stages[0].m||5)*60,timerOn:false,no:0};
    Lead.open();
  },
  open:function(){
    document.getElementById('view').classList.add('hidden');
    var lr=document.getElementById('leadroot');lr.classList.remove('hidden');
    Lead.render();
    try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}catch(e){}
  },
  exit:function(reroute){
    clearInterval(Lead.tmr);Lead.tmr=null;Music.stop();
    document.getElementById('leadroot').classList.add('hidden');
    document.getElementById('view').classList.remove('hidden');
    if(document.fullscreenElement)try{document.exitFullscreen()}catch(e){}
    if(reroute!==false)App.route();
  },
  cur:function(){return Lead.S.meet.stages[Lead.S.idx]},
  render:function(){
    var S=Lead.S,st=Lead.cur(),g=Guide.forStage(st);
    var pills=S.meet.stages.map(function(x,i){return '<i class="'+(i<S.idx?'done':i===S.idx?'on':'')+'"></i>'}).join('');
    document.getElementById('leadroot').innerHTML=
     '<div class="lead-top"><button onclick="Lead.exit()">✕</button><div class="tt">'+esc(S.meet.n)+(S.no?' ・第'+S.no+'次':'')+'</div>'+
       '<button onclick="Lead.tools()">🧰</button><button onclick="Lead.fs()">🖥️</button></div>'+
     '<div class="lead-stage" id="stageArea"><span class="stg-type">'+st.t+' ・ 環節 '+(S.idx+1)+'/'+S.meet.stages.length+'</span>'+
       '<h1>'+esc(st.n)+'</h1><div class="kids" id="kidsArea">'+Lead.screen(st)+'</div></div>'+
     '<div class="lead-bar"><div class="row"><div class="stagepill">'+pills+'</div></div>'+
       '<div class="row"><div style="flex:1;min-width:0"><span class="cue-label">領袖而家做</span><div class="now">'+esc(g.lead)+'</div><div class="leader-action">'+esc(g.watch)+'</div><div class="script">🎤 '+(esc(st.script||g.say)||'—')+'</div></div>'+
       '<div class="timer" id="tmr" onclick="Lead.toggleTmr()">'+Lead.fmt(S.left)+'</div></div>'+
       '<div class="row"><button class="btn sm ghost" onclick="Lead.prev()" '+(S.idx?'':'disabled style="opacity:.4"')+'>◀ 上一個</button>'+
       '<button class="btn sm" onclick="Lead.toggleTmr()" id="tmrBtn">▶ 開始計時</button>'+
       '<button class="btn sm ghost" onclick="Lead.next()|Sfx.ding()">下一個 ▶</button></div></div>';
    Lead.stopTmr();Lead.renderTmr();
    Lead.after&&Lead.after();
  },
  fs:function(){if(document.fullscreenElement){document.exitFullscreen()}else{document.documentElement.requestFullscreen()}},
  fmt:function(s){s=Math.max(0,s);var m=Math.floor(s/60),x=s%60;return m+':'+(x<10?'0':'')+x},
  renderTmr:function(){var e=document.getElementById('tmr');if(e){e.textContent=Lead.fmt(Lead.S.left);e.classList.toggle('late',Lead.S.left<=0)}},
  toggleTmr:function(){Lead.S.timerOn?Lead.stopTmr():Lead.startTmr()},
  startTmr(){Lead.S.timerOn=true;var b=document.getElementById('tmrBtn');if(b)b.textContent='⏸ 暫停';clearInterval(Lead.tmr);
    Lead.tmr=setInterval(function(){Lead.S.left--;Lead.renderTmr();
      if(Lead.S.left<=0){Sfx.alarm();Lead.stopTmr();toast('⏰ 呢個環節完喇!')}
      else if(Lead.S.left<=10)Sfx.tick();},1000)},
  stopTmr(){Lead.S.timerOn=false;clearInterval(Lead.tmr);Lead.tmr=null;var b=document.getElementById('tmrBtn');if(b)b.textContent='▶ 開始計時'},
  next:function(){
    var S=Lead.S;if(S.idx>=S.meet.stages.length-1){Lead.finish();return}
    S.idx++;S.left=(Lead.cur().m||5)*60;Lead.render();
  },
  prev:function(){var S=Lead.S;if(!S.idx)return;S.idx--;S.left=(Lead.cur().m||5)*60;Lead.render()},
  finish:function(){
    Sfx.fanfare();
    document.getElementById('kidsArea').innerHTML='<div class="huge">🎉</div><div class="big">今日集會完滿結束!<br>小童軍——向前進!</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn gr" onclick="Lead.done()">✓ 記錄完成+記出席</button><button class="btn ghost" onclick="Lead.exit()">離開</button></div>';
    clearInterval(Lead.tmr);
  },
  done:function(){var no=Lead.S.no;if(no){var pl=Store.get('plan');var r=pl.rows.find(function(x){return x.no===no});if(r){r.status='done';Store.set('plan',pl)}Track.attendPrompt(no)}else Lead.exit()},
  /* ================= 投影畫面 ================= */
  screen:function(st){
    Lead.after=null;var k=st.screen||(st.t==='唱遊'?'song':'howto');
    if(k!=='song')Music.stop();
    var fn=Lead.scr[k]||Lead.scr.howto;return fn(st);
  }
};
Lead.scr={
  howto:function(st){
    var g=Guide.forStage(st);
    var mats=(st.mats||[]).length?'<div class="mats-bar" style="justify-content:center"><b>🧺</b>'+st.mats.map(function(m){return '<span class="pill">'+esc(m)+'</span>'}).join('')+'</div>':'';
    return '<div class="child-prompt">領袖先示範一次，小朋友跟住每一步做</div>'+Lead.guideHtml(g)+mats;
  },
  story:function(st){
    var p=DATA.storyPrompts[Math.floor(Math.random()*DATA.storyPrompts.length)];
    return '<div class="qa-q">📖 '+p.t+'</div><div class="how" style="font-size:1.2rem">'+esc(p.h)+'</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm ghost" onclick="Lead.rerender()">🔀 揀另一個</button></div>';
  },
  promise:function(){
    return '<div class="big" style="color:var(--ord)">我願參加小童軍,<br>愛神愛人愛國家。</div>'+
      '<div class="songline" style="font-size:1.2rem;color:var(--mute)">規律:小童軍日行一善 ・ 口號:小童軍向前進 ・ 銘言:前進</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm" onclick="Lead.promiseBig()">🔍 放大逐句讀</button></div>';
  },
  chuteopen:function(){
    var g=Guide.forStage({screen:'chuteopen'});
    return '<div class="big">🌈 快樂傘開會・跟圖做</div>'+Lead.parachuteSvg('open')+Lead.guideHtml(g)+'<div class="huge" style="font-size:clamp(2rem,8vw,4.5rem)">「小童軍——向前進!」</div>';
  },
  chuteclose:function(){
    var g=Guide.forStage({screen:'chuteclose'});
    return '<div class="big">🌈 快樂傘散會・跟圖做</div>'+Lead.parachuteSvg('close')+Lead.guideHtml(g)+'<div class="huge" style="font-size:clamp(2rem,8vw,4.5rem)">「小童軍——向前進!」</div>';
  },
  song:function(){
    Music.stop();var lines=DATA.facts.song;
    Lead.after=function(){};
    var g=Guide.forStage({t:'唱遊',screen:'song'});
    return '<div class="big" style="font-size:1.3rem;color:var(--mute)">🎵 小童軍主題曲・卡拉OK</div><div class="song-note"><b>唔使搵 YouTube：</b>'+esc(DATA.facts.songHint||'按播放，跟住黃色句子唱。')+' APP 會自己彈出寄調 London Bridge 的旋律。</div>'+
      lines.map(function(l,i){return '<div class="songline" id="sg'+i+'">'+esc(l)+'</div>'}).join('')+
      '<div class="song-tools"><button class="btn" onclick="Lead.songTick(0)">▶ 播放伴奏+卡拉OK</button><button class="btn sm ghost" onclick="Lead.songStop()">⏹ 停止</button></div>'+
      '<div class="child-prompt">第一次帶：先播放一次，領袖跟住旋律唱；第二次先邀請小朋友加入。</div>'+Lead.guideHtml(g);
  },
  chute:function(st){
    var c=st&&st.chuteIndex!=null?DATA.chute[st.chuteIndex]:null;
    c=c||DATA.chute[Math.floor(Math.random()*DATA.chute.length)];var g=Guide.chute(c);
    return '<div class="qa-q">'+c.ic+' '+c.n+' <span class="tag">'+c.tag+'</span></div>'+Lead.parachuteSvg('open')+Lead.guideHtml(g)+
      '<div class="btns" style="justify-content:center"><button class="btn sm" onclick="Lead.rerender()">🔀 抽另一式</button></div>';
  },
  roll:function(){
    var mem=Store.get('members').map(function(m){return m.n});
    Lead._pool=mem.length?mem:['(請先喺「🏅追蹤」加團員名單)'];
    var g=Guide.forStage({t:'點名',n:'音樂傳球點名'});
    return '<div class="qa-q">🎤 音樂傳球點名</div><div class="child-prompt">有音樂就跟節奏傳；冇音樂就由領袖拍手：一、二、一、二，停拍就停球。</div><div class="guide-steps" style="max-width:640px">'+g.steps.map(function(x){return '<div class="guide-step"><span class="gnum">'+esc(x[0])+'</span><span class="gicon">'+x[1]+'</span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></div>'}).join('')+'</div>'+
      '<div class="huge" id="rollOut">❓</div><div class="btns" style="justify-content:center"><button class="btn" onclick="Lead.roll()">⏸ 停球・抽一位</button></div>';
  },
  quiz:function(){
    var q=DATA.quiz[Math.floor(Math.random()*DATA.quiz.length)];
    var opts=[q.a].concat(q.w);opts.sort(function(){return Math.random()-.5});
    return '<div class="qa-q"><small class="tag">'+q.c+'</small><br>'+esc(q.q)+'</div><div class="qa-opts">'+
      opts.map(function(o){return '<div class="gtile" onclick="Lead.judge(this,\''+esc(o)+'\',\''+esc(q.a)+'\')">'+esc(o)+'</div>'}).join('')+'</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm" onclick="Lead.rerender()">下一題 ▶</button></div>';
  },
  judge:function(){
    var arr=Math.random()<.5?DATA.judgeKind:DATA.judgeSfh;
    var j=arr[Math.floor(Math.random()*arr.length)];
    return '<div class="qa-q">👨‍⚖️ 對錯法庭</div><div class="how" style="font-size:1.4rem;font-weight:700">「'+esc(j.s)+'」</div>'+
      '<div class="qa-opts"><div class="gtile" onclick="Lead.judgeAns(this,1,'+j.g+',\''+esc(j.w)+'\')">👍 啱</div><div class="gtile" onclick="Lead.judgeAns(this,0,'+j.g+',\''+esc(j.w)+'\')">👎 錯</div></div>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm" onclick="Lead.rerender()">下一案 ▶</button></div>';
  },
  guess:function(){
    var g=DATA.guess[Math.floor(Math.random()*DATA.guess.length)];
    return '<div class="qa-q">🔍 估估下:呢個係咩?</div><div class="huge" id="gz" style="filter:brightness(0)">'+g[0]+'</div>'+
      '<div class="big" id="gzt">??? </div><div class="btns" style="justify-content:center"><button class="btn" onclick="document.getElementById(\'gz\').style.filter=\'none\';document.getElementById(\'gzt\').textContent=\''+g[1]+'\';Sfx.fanfare()">💡 揭盅</button>'+
      '<button class="btn ghost" onclick="Lead.rerender()">下一個 ▶</button></div>';
  },
  memory:function(){
    var set=DATA.guess.slice().sort(function(){return Math.random()-.5}).slice(0,6);
    var cards=set.concat(set).map(function(x){return x[0]}).sort(function(){return Math.random()-.5});
    Lead._mem={open:[],done:[],cards:cards,lock:false};
    return '<div class="qa-q">🃏 記憶配對(輪流揭兩張)</div><div class="mongrid">'+
      cards.map(function(c,i){return '<div class="mon flip" id="mo'+i+'" onclick="Lead.memFlip('+i+')">?</div>'}).join('')+'</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm ghost" onclick="Lead.rerender()">🔄 新一局</button></div>';
  },
  leader:function(){
    var cmds=['摸鼻','舉高雙手','單腳企','拍手三下','轉一個圈','摸腳尖','學小草蜢跳','企定定'];
    Lead._ldr={withSfx:Math.random()<.6};
    return '<div class="qa-q">🙋 領袖話</div><div class="how">只做「領袖話」開頭嘅指令,做錯坐低,最後企住嘅贏!</div>'+
      '<div class="big" id="ldrCmd" style="min-height:2.2em;color:var(--grd)">——</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn" onclick="Lead.ldrGo()">📣 出指令</button></div>';
  },
  traffic:function(){
    Lead._tl='green';
    return '<div class="qa-q">🚦 紅綠燈</div><div class="how">綠燈行、紅燈停、黃燈單腳企!</div>'+
      '<div class="trafficlight"><div class="tl red" id="tlr"></div><div class="tl amber" id="tla"></div><div class="tl green" id="tlg"></div></div>'+
      '<div class="btns" style="justify-content:center"><button class="btn rd" onclick="Lead.tl(\'red\')">🔴</button><button class="btn" style="background:#fb8c00" onclick="Lead.tl(\'amber\')">🟡</button><button class="btn gr" onclick="Lead.tl(\'green\')">🟢</button><button class="btn ghost" onclick="Lead.tl()">🎲 隨機</button></div>';
  },
  catch:function(){
    Lead._catch={score:0,left:30,iv:null};
    return '<div class="qa-q">🦗 捉草蜢 <span class="tag g" id="cs">0分</span> <span class="tag b" id="cl">30秒</span></div>'+
      '<div class="molefield">'+[0,1,2,3,4,5,6,7,8].map(function(i){return '<div class="hole" id="ho'+i+'" onclick="Lead.whack('+i+')">🕳️</div>'}).join('')+'</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn" id="cb" onclick="Lead.catchGo()">▶ 開始(30秒)</button></div>';
  },
  rhythm:function(){
    var pool=['👏','🖐️','🦶','🦗','⬆️'];
    var pat=[0,1,2,3].map(function(){return pool[Math.floor(Math.random()*pool.length)]});
    Lead._rhythm={pat:pat,step:-1};
    return '<div class="qa-q">🎵 節奏模仿</div><div class="how">領袖做一次,全體跟住做!</div>'+
      '<div class="big" id="rhm" style="letter-spacing:12px;min-height:1.6em">'+pat.map(function(){return '❓'}).join(' ')+'</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn" onclick="Lead.rhPlay()">▶ 逐個亮出</button><button class="btn ghost" onclick="Lead.rerender()">🔄 新節奏</button></div>';
  },
  breath:function(){
    Lead.after=function(){Lead.brhTick(true)};
    return '<div class="qa-q">🍃 靜息呼吸</div><div class="how">全體坐好,跟住個波球:脹=吸氣(1-2-3-4),縮=呼氣(1-2-3-4)</div>'+
      '<div class="breath" id="brh">吸~~~</div><div class="btns" style="justify-content:center"><button class="btn sm ghost" onclick="Lead.brhTick(true)">🔄 由頭</button></div>';
  }
};
Lead.guideHtml=function(g){
  return '<div class="lead-guide"><div class="guide-lead"><b>領袖先做</b>'+esc(g.lead)+'</div><div class="guide-steps">'+g.steps.map(function(x){return '<div class="guide-step"><span class="gnum">'+esc(x[0])+'</span><span class="gicon">'+x[1]+'</span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></div>'}).join('')+'</div><div class="say-box"><b>🎤 領袖可以照讀</b>'+esc(g.say)+'</div><div class="watch-row"><div><b>👀 留意</b><br>'+esc(g.watch)+'</div><div class="safe"><b>🛡️ 安全</b><br>'+esc(g.safety)+'</div></div></div>';
};
Lead.parachuteSvg=function(mode){
  var raised=mode==='open';
  return '<div class="parachute-kit"><h3 style="margin:0;color:#1565c0">🌈 快樂傘動作圖</h3><div class="parachute-visual"><svg viewBox="0 0 520 205" role="img" aria-label="小朋友圍住快樂傘，一起揚起或放低"><path d="M70 70 Q260 '+(raised?'8':'125')+' 450 70 L425 102 Q260 '+(raised?'43':'159')+' 95 102 Z" fill="#ffca28" stroke="#e65100" stroke-width="5"/><path d="M95 101 Q260 '+(raised?'43':'160')+' 425 101" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/>'+[105,150,195,240,285,330,375,420].map(function(x){return '<circle cx="'+x+'" cy="'+(raised?'141':'180')+'" r="11" fill="#43a047" stroke="#1b5e20" stroke-width="3"/><path d="M'+x+' '+(raised?'151':'190')+' v18 m-13 -8 h26 m-5 8 l-8 14 m8-14 l8 14" stroke="#1b5e20" stroke-width="4" stroke-linecap="round" fill="none"/>'}).join('')+'<path d="M260 183 V'+(raised?'119':'156')+'" stroke="#e65100" stroke-width="5" stroke-linecap="round"/><path d="M250 '+(raised?'130':'156')+' l10 -14 10 14" fill="none" stroke="#e65100" stroke-width="5"/><text x="260" y="29" text-anchor="middle" font-size="17" font-weight="700" fill="#795548">'+(raised?'一起向上 ↑':'慢慢向下 ↓')+'</text></svg></div><div class="para-caption">綠色小人＝小朋友位置　黃色傘邊＝雙手執住　橙色箭咀＝跟領袖數拍子</div><div class="para-safety"><span>🤲 執實傘邊</span><span>↔️ 留一隻手臂距離</span><span>🛑 聽到停就停</span></div></div>';
};
Lead.rerender=function(){var a=document.getElementById('kidsArea');if(a){a.innerHTML=Lead.screen(Lead.cur());Lead.after&&Lead.after()}};
Lead.promiseBig=function(){
  document.getElementById('kidsArea').innerHTML=DATA.facts.promise.concat([DATA.facts.law]).map(function(l,i){
    return '<div class="songline" id="pb'+i+'" style="opacity:.25" onclick="this.style.opacity=1;Sfx.ding()">'+esc(l)+'</div>'}).join('')+
    '<div class="mute" style="text-align:center;font-size:.85rem">撳一句亮一句,一句一句跟讀</div>';
};
Lead.songHighlight=function(i){
  DATA.facts.song.forEach(function(_,j){var e=document.getElementById('sg'+j);if(e)e.classList.toggle('on',j===i)});
};
Lead.songTick=function(){Music.play()};
Lead.songStop=function(){Music.stop();clearInterval(Lead._songIv);Lead.songHighlight(-1)};
Lead.roll=function(){
  var names=Lead._pool||[];var out=document.getElementById('rollOut');var n=0;
  var iv=setInterval(function(){out.textContent=names[Math.floor(Math.random()*names.length)];Sfx.pop();if(++n>14){clearInterval(iv);Sfx.ding()}},90);
};
Lead.judge=function(el,sel,ans){
  if(sel===ans){el.classList.add('ok');Sfx.fanfare()}else{el.classList.add('no');Sfx.wrong();
    setTimeout(function(){var sibs=el.parentNode.children;for(var i=0;i<sibs.length;i++)if(sibs[i].textContent===ans)sibs[i].classList.add('ok')},350)}
  el.parentNode.querySelectorAll('.gtile').forEach(function(x){x.style.pointerEvents='none'});
};
Lead.judgeAns=function(el,choice,truth,why){
  var right=choice===truth;
  el.classList.add(right?'ok':'no');right?Sfx.fanfare():Sfx.wrong();
  var d=document.createElement('div');d.className='mute';d.style.textAlign='center';d.innerHTML='💡 '+esc(why);
  el.parentNode.after(d);
  el.parentNode.querySelectorAll('.gtile').forEach(function(x){x.style.pointerEvents='none'});
};
Lead.memFlip=function(i){
  var m=Lead._mem;if(m.lock||m.open.indexOf(i)>=0||m.done.indexOf(i)>=0)return;
  var el=document.getElementById('mo'+i);el.classList.remove('flip');el.textContent=m.cards[i];Sfx.pop();
  m.open.push(i);
  if(m.open.length===2){
    m.lock=true;var a=m.open[0],b=m.open[1];
    if(m.cards[a]===m.cards[b]){
      setTimeout(function(){[a,b].forEach(function(x){document.getElementById('mo'+x).classList.add('hit');m.done.push(x)});Sfx.ding();m.open=[];m.lock=false;
        if(m.done.length===m.cards.length)Sfx.fanfare();},420);
    }else{
      setTimeout(function(){[a,b].forEach(function(x){var e=document.getElementById('mo'+x);e.classList.add('flip');e.textContent='?'});Sfx.wrong();m.open=[];m.lock=false},900);
    }
  }
};
Lead.ldrGo=function(){
  var cmds=['摸鼻','舉高雙手','單腳企','拍手三下','轉一個圈','摸腳尖','學小草蜢跳','企定定'];
  var withSfx=Math.random()<.62;var c=cmds[Math.floor(Math.random()*cmds.length)];
  var el=document.getElementById('ldrCmd');el.textContent=(withSfx?'📢 領袖話——':'🤫(冇講領袖話!)')+c;
  el.style.color=withSfx?'var(--grd)':'var(--red)';withSfx?Sfx.ding():Sfx.wrong();
};
Lead.tl=function(c){
  if(!c)c=['red','amber','green'][Math.floor(Math.random()*3)];
  Lead._tl=c;['red','amber','green'].forEach(function(x){var e=document.getElementById('tl'+x[0]+(x==='amber'?'a':x[0]));if(e)e.classList.remove('on')});
  var map={red:'tlr',amber:'tla',green:'tlg'};document.getElementById(map[c]).classList.add('on');
  c==='red'?Sfx.wrong():Sfx.ding();
};
Lead.catchGo=function(){
  var S=Lead._catch;var btn=document.getElementById('cb');btn.disabled=true;btn.style.opacity=.4;
  S.iv=setInterval(function(){
    for(var i=0;i<9;i++)document.getElementById('ho'+i).classList.remove('up');
    var h=Math.floor(Math.random()*9);document.getElementById('ho'+h).classList.add('up');document.getElementById('ho'+h).textContent='🦗';
    S._cur=h;Sfx.tick();
  },850);
  var t=setInterval(function(){
    S.left--;var l=document.getElementById('cl');if(l)l.textContent=S.left+'秒';
    if(S.left<=0){clearInterval(t);clearInterval(S.iv);for(var i=0;i<9;i++){var e=document.getElementById('ho'+i);e.classList.remove('up');e.textContent='🕳️'}
      Sfx.fanfare();var b=document.getElementById('cb');b.disabled=false;b.style.opacity=1;b.textContent='再嚟一次 ↻';
      document.getElementById('cs')&&(document.getElementById('cs').textContent=S.score+'分');}
  },1000);
};
Lead.whack=function(i){
  var S=Lead._catch;var el=document.getElementById('ho'+i);
  if(el.classList.contains('up')){S.score++;el.classList.remove('up');el.textContent='✅';Sfx.pop();
    var s=document.getElementById('cs');if(s)s.textContent=S.score+'分'}
};
Lead.rhPlay=function(){
  var R=Lead._rhythm;var el=document.getElementById('rhm');R.step=-1;
  var iv=setInterval(function(){
    R.step++;
    if(R.step>=R.pat.length){clearInterval(iv);el.textContent=R.pat.join(' ');Sfx.fanfare();return}
    el.innerHTML=R.pat.slice(0,R.step+1).join(' ')+' '+(R.step<3?'❓':'');Sfx.tick();
  },650);
};
Lead.brhTick=function(re){
  var b=document.getElementById('brh');if(!b)return;var big=false;
  b.style.transform='scale(.62)';b.textContent='呼~~~';big=false;
  clearInterval(Lead._brhIv);
  Lead._brhIv=setInterval(function(){big=!big;b.style.transform=big?'scale(1)':'scale(.62)';b.textContent=big?'吸~~~':'呼~~~';Sfx.pop()},4000);
};
/* ================= 工具箱 ================= */
Lead.tools=function(tab){
  var mem=Store.get('members').map(function(m){return m.n});
  var t=tab||'wheel';
  var tabs=[['wheel','🎡 抽籤'],['group','👥 分組'],['score','🥇 計分'],['cd','⏳ 倒數'],['sfx','📣 音效'],['breath','🍃 呼吸']];
  var body=Lead.toolBody(t,mem);
  var w=document.createElement('div');w.className='toolwrap';
  w.innerHTML='<div class="toolbox"><h3><span>🧰 領袖工具</span><button class="iconbtn" style="background:#ffe0b2" onclick="this.closest(\'.toolwrap\').remove()">✕</button></h3>'+
    '<div style="margin:6px 0">'+tabs.map(function(x){return '<span class="pill'+(x[0]===t?' on':'')+'" onclick="Lead.tools(\''+x[0]+'\');this.closest(\'.toolwrap\').remove()">'+x[1]+'</span>'}).join('')+'</div>'+
    '<div id="toolBody">'+body+'</div>'+
    (mem.length?'':'<div class="mute" style="font-size:.78rem;margin-top:8px">💡 加咗團員名單(🏅追蹤)之後,抽籤/分組會自動用返啲名。</div>')+'</div>';
  w.onclick=function(e){if(e.target===w)w.remove()};
  document.getElementById('leadroot').appendChild(w);
  if(t==='breath')Lead.brhTick(true);
};
Lead.toolBody=function(t,mem){
  var names=mem.length?mem:['小明','小美','阿力','阿詩','子朗','恩恩'];
  if(t==='wheel')return '<input type="text" id="whN" value="'+esc(names.join(','))+'" placeholder="名單(逗號分隔)"><div class="wheel" id="whl"><b id="whName">🎲</b></div>'+
    '<div class="btns" style="justify-content:center"><button class="btn" onclick="Lead.spin()">🎡 轉!</button></div>';
  if(t==='group')return '<div class="btns"><span class="pill" onclick="Lead.grp(2)">2組</span><span class="pill" onclick="Lead.grp(3)">3組</span><span class="pill" onclick="Lead.grp(4)">4組</span></div><div id="grpOut"><div class="mute">撳上面揀組數</div></div>';
  if(t==='score'){Lead._score=Lead._score||[{n:'紅隊',s:0},{n:'藍隊',s:0}];
    return '<div id="scOut">'+Lead._score.map(function(x,i){return '<div class="scorerow"><span>'+esc(x.n)+'</span><span><button class="btn sm" onclick="Lead.sc('+i+',-1)">➖</button> <b>'+x.s+'</b> <button class="btn sm" onclick="Lead.sc('+i+',1)">➕</button></span></div>'}).join('')+'</div>'+
    '<div class="btns"><button class="btn sm ghost" onclick="Lead._score.push({n:\'隊\'+(Lead._score.length+1),s:0});Lead.tools(\'score\');document.querySelectorAll(\'.toolwrap\').forEach(function(w){w.remove()})">➕ 加一隊</button>'+
    '<button class="btn sm ghost" onclick="Lead._score=Lead._score.map(function(x){return {n:x.n,s:0}});Lead.tools(\'score\');document.querySelectorAll(\'.toolwrap\').forEach(function(w){w.remove()})">🔄 歸零</button></div>';
  }
  if(t==='cd')return '<div class="big" style="text-align:center" id="cdD">⏳ 60</div><div class="btns" style="justify-content:center">'+
    [30,60,120,300].map(function(x){return '<span class="pill" onclick="Lead.cd('+x+')">'+(x<60?x+'秒':(x/60)+'分鐘')+'</span>'}).join('')+'</div>';
  if(t==='sfx')return '<div class="sfxgrid">'+
    [['ding','🔔 叮'],['pop','🫧 波'],['fanfare','🎉 恭喜'],['tick','⏱️ 嘀'],['wrong','❌ 錯了'],['alarm','⏰ 時間到']].map(function(x){
      return '<button class="sfx" onclick="Sfx.'+x[0]+'()"><b>'+x[1].split(' ')[0]+'</b>'+x[1].split(' ')[1]+'</button>'}).join('')+'</div>'+
    '<div class="btns" style="margin-top:8px"><span class="pill'+(Sfx.on?' on':'')+'" onclick="Sfx.on=!Sfx.on;this.classList.toggle(\'on\')">'+(Sfx.on?'🔊 音效開':'🔇 音效關')+'</span></div>';
  if(t==='breath')return '<div class="breath" id="brh">吸~~~</div><div class="mute" style="text-align:center">投影俾全體跟住一齊唞氣</div>';
  return '';
};
Lead.spin=function(){
  var names=(document.getElementById('whN').value||'').split(/[,、]/).map(function(x){return x.trim()}).filter(Boolean);
  if(!names.length)return;var w=document.getElementById('whl'),o=document.getElementById('whName');
  var pick=names[Math.floor(Math.random()*names.length)];
  var deg=1080+Math.floor(Math.random()*360);w.style.transform='rotate('+deg+'deg)';
  var n=0;var iv=setInterval(function(){o.textContent=names[Math.floor(Math.random()*names.length)];if(++n>20){clearInterval(iv);o.textContent=pick;Sfx.fanfare()}},80);
};
Lead.grp=function(k){
  var mem=Store.get('members').map(function(m){return m.n});
  var names=(mem.length?mem:['小明','小美','阿力','阿詩','子朗','恩恩']).slice().sort(function(){return Math.random()-.5});
  var gs=[];for(var i=0;i<k;i++)gs.push([]);
  names.forEach(function(n,i){gs[i%k].push(n)});
  var colors=['🔴','🔵','🟡','🟢'];
  document.getElementById('grpOut').innerHTML=gs.map(function(g,i){return '<div class="mem" style="margin:8px 0"><h4>'+colors[i]+' 第'+(i+1)+'組</h4>'+g.map(function(n){return '<span class="pill">'+esc(n)+'</span>'}).join('')+'</div>'}).join('');
  Sfx.ding();
};
Lead.sc=function(i,d){Lead._score[i].s=Math.max(0,Lead._score[i].s+d);d>0?Sfx.ding():Sfx.pop();
  document.querySelectorAll('.toolwrap').forEach(function(w){w.remove()});Lead.tools('score')};
Lead.cd=function(sec){
  clearInterval(Lead._cdIv);var left=sec;var d=document.getElementById('cdD');
  Lead._cdIv=setInterval(function(){
    d.textContent='⏳ '+left;left--;
    if(left>=0&&left<=5)Sfx.tick();
    if(left<0){clearInterval(Lead._cdIv);d.textContent='⏰ 完成!';Sfx.alarm()}
  },1000);
};
