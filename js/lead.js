/* 🦗 lead.js — 帶領模式:投影引擎、數碼互動道具、計時、講稿、即用工具 © 2026 Scout System */
var Sfx={ctx:null,on:true,
  ac:function(){
    if(!Sfx.ctx)Sfx.ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(Sfx.ctx.state==='suspended')try{Sfx.ctx.resume()}catch(e){}
    return Sfx.ctx;
  },
  tone:function(f,d,type,vol){
    if(!Sfx.on)return;
    try{
      Sfx.toneAt(f,null,d,type,vol);
    }catch(e){}
  },
  /* 精準排期版：伴奏／拍子器要用currentTime，唔可以用setTimeout(會甩拍) */
  toneAt:function(f,at,d,type,vol){
    if(!Sfx.on)return null;
    try{
      var c=Sfx.ac(),o=c.createOscillator(),g=c.createGain();
      var t0=(at==null||isNaN(at))?c.currentTime:at;
      var dur=(d==null?.2:d);
      o.type=type||'sine';o.frequency.value=f;
      g.gain.setValueAtTime(.0001,t0);
      g.gain.linearRampToValueAtTime(vol||.25,t0+.014);          /* 小attack，唔會有「啪」聲 */
      g.gain.exponentialRampToValueAtTime(.001,t0+dur);
      o.connect(g);g.connect(c.destination);
      o.start(t0);o.stop(t0+dur+.03);
      return o;
    }catch(e){return null}
  },
  /* 節拍click：strong=強拍(第1拍) */
  click:function(at,strong){Sfx.toneAt(strong?1500:1000,at,strong?.07:.045,'square',strong?.22:.13)},
  /* 草蜢叫聲：兩短音＋一下鼓，全場聽到就知要跳 */
  hop:function(){
    try{
      var t=Sfx.ac().currentTime;
      Sfx.toneAt(660,t,.09,'triangle',.32);
      Sfx.toneAt(990,t+.1,.12,'triangle',.34);
      Sfx.toneAt(150,t+.02,.16,'sine',.4);
    }catch(e){}
  },
  ding:function(){Sfx.tone(880,.35)},
  pop:function(){Sfx.tone(520,.12,'triangle',.3)},
  tick:function(){Sfx.tone(1200,.05,'square',.12)},
  wrong:function(){Sfx.tone(180,.4,'sawtooth',.22)},
  whistle:function(){
    Sfx.tone(2400,.45,'sawtooth',.35);
    setTimeout(function(){Sfx.tone(2700,.5,'sine',.4)},60);
    setTimeout(function(){Sfx.tone(2400,.35,'sawtooth',.35)},200);
  },
  horn:function(){
    var notes=[392,523,659,784];
    notes.forEach(function(f,i){
      setTimeout(function(){Sfx.tone(f,.28,'triangle',.35)},i*150);
    });
  },
  drum:function(){
    Sfx.tone(140,.25,'triangle',.5);
    setTimeout(function(){Sfx.tone(80,.3,'sine',.4)},40);
  },
  cheer:function(){
    [523,659,784,1047,1318].forEach(function(f,i){
      setTimeout(function(){Sfx.tone(f,.35,'sine',.3)},i*80);
    });
  },
  gong:function(){
    Sfx.tone(440,1.2,'sine',.4);
    setTimeout(function(){Sfx.tone(880,.8,'triangle',.2)},30);
  },
  fanfare:function(){
    [523,659,784,1047].forEach(function(f,i){
      setTimeout(function(){Sfx.tone(f,.3)},i*130);
    });
  },
  alarm:function(){
    [0,1,2].forEach(function(i){
      setTimeout(function(){Sfx.tone(980,.18,'square',.3);},i*260);
    });
  }
};

/* ================= 🎵 主題曲伴奏（唔使上網、唔使搵片） =================
   寄調 London Bridge is Falling Down・C 調・4/4
   舊版每個音一樣長，所以聽落「怪怪哋、同真歌嘅節奏唔同」：
   真嘅旋律係「行・行・行・行｜行・行・停 —｜停・停・停 —」——句尾要拖長（二分音符），
   句與句之間要換氣，仲要有和弦托底先似伴奏而唔似「逼逼聲」。
   所以而家每個音寫成 [頻率, 拍數]：1 = 四分音符、2 = 二分音符。 */
var Music={
  ctx:null,playing:false,_timers:[],voices:[],_notes:[],_bars:[],_dur:0,
  bpm:112,countIn:true,chords:true,breath:1,   /* breath = 每句之後換氣幾多拍 */
  TEMPOS:[{k:'slow',n:'慢・第一次唱',bpm:92},{k:'std',n:'中・平時用',bpm:112},{k:'fast',n:'快・熟晒先玩',bpm:132}],
  /* 六句歌詞一句對一句（次序同 DATA.facts.song 一樣）：G A G F｜E F G(拖)｜D E F(拖)｜E F G(拖) … */
  song:[
    /* ① 小小童軍向前進、向前進、向前進　13 個音／16 拍 */
    [392,1],[440,1],[392,1],[349,1],[330,1],[349,1],[392,2],
    [294,1],[330,1],[349,2],
    [330,1],[349,1],[392,2],
    /* ② 小小童軍向前進、前進不停。　11 個音／16 拍 */
    [392,1],[440,1],[392,1],[349,1],[330,1],[349,1],[392,2],
    [294,2],[392,2],[330,2],[262,2],
    /* ③ Greeny, Greeny, Marchin’ On　7 個音／8 拍 */
    [392,1],[440,1],[392,1],[349,1],[330,1],[349,1],[392,2],
    /* ④ Marchin’ On, Marchin’ On　6 個音／8 拍 */
    [294,1],[330,1],[349,2],[330,1],[349,1],[392,2],
    /* ⑤ Greeny, Greeny, Marchin’ On　7 個音／8 拍 */
    [392,1],[440,1],[392,1],[349,1],[330,1],[349,1],[392,2],
    /* ⑥ Marchin’ On Together　4 個音／8 拍 */
    [294,2],[392,2],[330,2],[262,2]
  ],
  lines:[13,11,7,6,7,4],
  /* 每 4 拍（1 小節）一個和弦：C = C-E-G、G = G-B-D（同鋼琴版伴奏一樣） */
  bars:['C','C','G','C','C','C','G','C','C','C','G','C','C','C','G','C'],
  /* 曲庫載入器：每首換走 song/lines/bars，卡拉OK 跟實 */
  SONGBOOK:null,cur:'theme',
  load:function(k){
    var hit=this.SONGBOOK&&this.SONGBOOK[k];
    this.cur=hit?k:'theme';
    var s=hit||this.SONGBOOK.theme;
    this.song=s.song;this.lines=s.lines;this.bars=s.bars;
    return s;
  },
  CH:{C:[130.81,164.81,196],G:[98,123.47,146.83]},
  beat:function(){return 60/this.bpm},
  /* 將樂譜變成時間表：每個音幾時響、響幾耐、屬第幾句；順便計出每小節起始時間（和弦用） */
  plan:function(){
    var beat=this.beat(),t=0,n=0,line=0,lineBeat=0,notes=[],bars=[];
    for(var i=0;i<this.song.length;i++){
      var f=this.song[i][0],b=this.song[i][1];
      notes.push({f:f,d:b*beat,t:t,line:line});
      t+=b*beat;lineBeat+=b;n++;
      while(lineBeat>=4){bars.push({t:t-(lineBeat-4)*beat,ch:this.bars[bars.length]||'C'});lineBeat-=4;}
      if(this.lines[line]!=null&&n>=this.lines[line]){
        n=0;line++;lineBeat=0;
        if(i<this.song.length-1)t+=this.breath*beat;   /* 句與句之間換氣；最後一句唔使 */
      }
    }
    this._notes=notes;this._bars=bars;this._dur=t;
    return notes;
  },
  setTempo:function(k){
    var t=this.TEMPOS.filter(function(x){return x.k===k})[0]||this.TEMPOS[1];
    this.bpm=t.bpm;this._tk=t.k;
    if(this.playing)this.play();
    return t;
  },
  play:function(){
    this.stop();
    try{
      var c=Sfx.ac();this.ctx=c;
      var self=this,beat=this.beat(),notes=this.plan();
      var lead=this.countIn?4*beat:0;             /* 4 拍數拍先入，全場一齊開聲 */
      var now=c.currentTime+.08;
      if(this.countIn)for(var k=0;k<4;k++)Sfx.click(now+k*beat,k===0);
      notes.forEach(function(x){
        var v=Sfx.toneAt(x.f,now+lead+x.t,x.d*.92,'triangle',.26);
        if(v)self.voices.push(v);
      });
      if(this.chords)this._bars.forEach(function(b){
        (self.CH[b.ch]||self.CH.C).forEach(function(f){
          var v=Sfx.toneAt(f,now+lead+b.t,beat*4*.88,'sine',.075);
          if(v)self.voices.push(v);
        });
      });
      /* 卡拉OK高亮跟實音時間行（音有長有短，唔可以再用固定 interval） */
      var last=-1;
      notes.forEach(function(x){
        if(x.line===last)return;
        last=x.line;
        self._timers.push(setTimeout(function(){Lead.songHighlight(x.line)},(lead+x.t)*1000));
      });
      this._timers.push(setTimeout(function(){if(Lead.songHighlight)Lead.songHighlight(0)},Math.max(0,lead*1000-40)));
      this.playing=true;
      this._timers.push(setTimeout(function(){self.stop()},(lead+this._dur+.5)*1000));
    }catch(e){
      toast('裝置未能播放伴奏，請確認瀏覽器聲音已開啟');
    }
  },
  stop:function(){
    this._timers.forEach(function(t){clearTimeout(t)});this._timers=[];
    this.voices.forEach(function(o){try{o.stop()}catch(e){}});
    this.voices=[];this.playing=false;
    if(window.Lead&&Lead.songHighlight)Lead.songHighlight(-1);
  },
  /* ---------- 🥁 拍子器：快樂傘數拍、節奏模仿、洗手歌、跳格倒數都用得 ---------- */
  metro:{on:false,tid:null,next:0,bpm:100,per:4,count:0,
    start:function(bpm,per){
      this.stop();
      this.bpm=bpm||this.bpm;this.per=per||this.per;
      var self=this;this.on=true;this.count=0;
      try{this.next=Sfx.ac().currentTime+.06}catch(e){this.next=0}
      this.tid=setInterval(function(){self._pump()},25);   /* 用 lookahead 排期，先至唔會甩拍 */
      Lead.metroBeat(0,this.per);
    },
    _pump:function(){
      if(!this.on)return;
      var beat=60/this.bpm;
      try{
        var c=Sfx.ac();
        while(this.next<c.currentTime+.15){
          var strong=(this.count%this.per===0),n=this.count+1,per=this.per;
          var delay=Math.max(0,(this.next-c.currentTime)*1000);
          Sfx.click(this.next,strong);
          setTimeout(function(){Lead.metroBeat(n,per,strong)},delay);
          this.next+=beat;this.count++;
        }
      }catch(e){this.stop()}
    },
    stop:function(){this.on=false;if(this.tid)clearInterval(this.tid);this.tid=null;Lead.metroBeat(-1,0)}
  }
};
/* 曲庫：主題曲（London Bridge 寄調）・Jingle Bells・新年好，全部公開領域旋律 */
Music.SONGBOOK={
  theme:{title:'小童軍主題曲',note:'寄調 London Bridge is Falling Down・C 調・4/4',song:Music.song,lines:Music.lines,bars:Music.bars,lyrics:null},
  jingle:{title:'Jingle Bells（鈴兒響叮噹）',note:'C 調・4/4・公開領域・副歌',
    lyrics:['Jingle bells, jingle bells, jingle all the way','Oh what fun it is to ride in a one-horse open sleigh'],
    lines:[11,15],bars:['C','C','C','C','F','C','G','G'],
    song:[[330,1],[330,1],[330,2],[330,1],[330,1],[330,2],[330,1],[392,1],[262,1],[294,1],[330,4],
          [349,1],[349,1],[349,1.5],[349,.5],[349,1],[330,1],[330,1],[330,.5],[330,.5],[330,1],[294,1],[294,1],[330,1],[294,2],[392,2]]},
  newyear:{title:'新年好',note:'C 調・4/4・公開領域',
    lyrics:['新年好呀，新年好呀，祝福大家新年好','我們唱歌，我們跳舞，祝福大家新年好'],
    lines:[15,15],bars:['C','C','C','G','G','C','C','G'],
    song:[[262,1],[262,1],[262,1],[392,1],[330,1],[330,1],[330,1],[262,1],[262,1],[330,1],[392,1],[392,1],[349,1],[330,1],[294,2],
          [294,1],[330,1],[349,1],[349,1],[330,1],[294,1],[330,1],[262,1],[262,1],[330,1],[392,1],[392,1],[349,1],[330,1],[294,2]]}
};
Music.SONGBOOK.theme.lyrics=DATA.facts.song;

var Lead={
  S:null,tmr:null,
  cleanupTimers:function(){
    if(Lead.tmr){clearInterval(Lead.tmr);Lead.tmr=null;}
    if(Lead._gridIv){clearInterval(Lead._gridIv);Lead._gridIv=null;}
    if(Lead._cleanIv){clearInterval(Lead._cleanIv);Lead._cleanIv=null;}
    if(Lead._tlTimer){clearInterval(Lead._tlTimer);Lead._tlTimer=null;}
    if(Lead._rhythmIv){clearInterval(Lead._rhythmIv);Lead._rhythmIv=null;}
    if(Lead._rhTimers){Lead._rhTimers.forEach(function(t){clearTimeout(t)});Lead._rhTimers=null;}
    if(Lead._rollIv){clearInterval(Lead._rollIv);Lead._rollIv=null;}
    if(Lead._brhIv){clearInterval(Lead._brhIv);Lead._brhIv=null;}
    if(Lead._cdIv){clearInterval(Lead._cdIv);Lead._cdIv=null;}
    if(Lead._spinIv){clearInterval(Lead._spinIv);Lead._spinIv=null;}
    if(Lead._taskIv){clearInterval(Lead._taskIv);Lead._taskIv=null;}
    Music.stop();
    if(Music.metro&&Music.metro.on)Music.metro.stop();
  },
  html:function(){
    var s=Store.get('settings'),pl=Store.get('plan');
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var nextT=next?dur(next.tid):null;
    var my=Store.get('mymeets');
    var h='<div class="card"><h2>▶️ 現場帶領</h2><div class="mute" style="font-size:.85rem">左邊（或投影）係小朋友畫面；下面綠色欄係領袖提示。<b>毋須自備繁複道具</b>：APP 已內置全部互動卡、數碼道具、伴奏同遊戲畫面。</div>';
    h+='<div class="attention"><b>第一次用？</b> 先撳「帶領下次集會」，唔需要另外準備投影片；全部活動一按即玩。</div>';
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
    Lead.cleanupTimers();
    Lead.S={meet:{id:'_q',n:'工具',stages:[{t:'工具',n:'領袖工具',m:99,how:'',script:'',screen:'howto'}]},idx:0,left:99*60,timerOn:false,no:0};
    Lead.open();Lead.tools(t);
  },
  start:function(id,no){
    var t=dur(id);if(!t)return;
    Lead.cleanupTimers();
    Lead.S={meet:JSON.parse(JSON.stringify(t)),idx:0,left:(t.stages[0].m||5)*60,timerOn:false,no:no||0};
    Lead.open();
  },
  startStage:function(id,i){
    var t=dur(id);if(!t||!t.stages[i])return;
    Lead.cleanupTimers();
    Lead.S={meet:{id:t.id,n:t.n+'・試用單一環節',stages:[JSON.parse(JSON.stringify(t.stages[i]))]},idx:0,left:(t.stages[i].m||5)*60,timerOn:false,no:0};
    Modal.close();Lead.open();
  },
  startChute:function(i){
    var c=DATA.chute[i];if(!c)return;
    Lead.cleanupTimers();
    Lead.S={meet:{id:'chute-'+i,n:'快樂傘玩法卡・'+c.n,stages:[{t:'遊戲',n:c.n,m:10,screen:'chute',chuteIndex:i}]},idx:0,left:600,timerOn:false,no:0};
    Lead.open();
  },
  startGame:function(screen,name){
    var titles={leader:'領袖話',traffic:'紅綠燈',catch:'草蜢跳格・實體九宮格',memory:'記憶配對・口講位置',quiz:'問答擂台・四角搶答',guess:'估估下',judge:'對錯法庭・左右分邊',rhythm:'節奏模仿・跟拍子',chute:'快樂傘玩法卡',story:'故事寶盒',roll:'音樂傳球點名',bodycard:'身體地圖紅黃綠',recycle:'三色回收分類',flags:'國旗區旗敬禮',clean:'洗手七步好寶寶',emotion:'情緒面面觀',task:'任務抽籤機',bpstory:'貝登堡故事繪本',scoutfamily:'童軍大家庭地圖',foodrainbow:'彩虹健康飲食盤',transport:'交通工具大圖鑑',moon:'中秋射月拋圈',ghinfo:'認識小草蜢',badgego:'獎章Go Go Go',scarf:'整理領巾圖解',promise:'誓詞・規律・口號'};
    Lead.cleanupTimers();
    Lead.S={meet:{id:'game-'+screen,n:name||titles[screen]||'即玩活動',stages:[{t:'遊戲',n:name||titles[screen]||'即玩活動',m:10,screen:screen}]},idx:0,left:600,timerOn:false,no:0};
    Lead.open();
  },
  startMy:function(id){
    var m=Store.get('mymeets').find(function(x){return x.id===id});if(!m)return;
    Lead.cleanupTimers();
    Lead.S={meet:JSON.parse(JSON.stringify(m)),idx:0,left:(m.stages[0].m||5)*60,timerOn:false,no:0};
    Lead.open();
  },
  open:function(){
    Lead.cleanupTimers();
    document.getElementById('view').classList.add('hidden');
    var lr=document.getElementById('leadroot');lr.classList.remove('hidden');
    Lead.render();
    try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}catch(e){}
  },
  exit:function(reroute){
    Lead.cleanupTimers();
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
     '<div class="lead-top"><button onclick="Lead.exit()" title="離開">✕</button>'+
       '<div class="tt">'+esc(S.meet.n)+(S.no?' ・第'+S.no+'次':'')+
         (function(){var ow=Kit.ownerOf(S.meet.id,S.idx);return '<span class="tt-who">'+(ow?'🧑‍🏫 '+esc(ow):'🧑‍🏫 未分工・準備卡可填')+'</span>'})()+
       '</div>'+
       '<button class="lead-top-pill" onclick="Lead.quietQuick()" title="5秒安靜">🤫 安靜</button>'+
       '<button class="lead-top-pill" onclick="Sfx.whistle();toast(\'🎺 嗶————！集合！\')" title="吹哨">🎺 哨子</button>'+
       '<button class="lead-top-pill" onclick="Venue.open()" title="場地設置：分區・界線・規矩">📍 場地</button>'+
       '<button class="lead-top-pill" onclick="Kit.openCheckFor(Lead.S.meet)" title="今場執行檢查表">🧭 檢查表</button>'+
       '<button class="lead-top-pill" onclick="Lead.addMiniGame()" title="加插遊戲">➕ 遊戲</button>'+
       '<button onclick="Lead.tools()" title="工具箱">🧰</button>'+
       '<button onclick="Lead.fs()" title="全螢幕">🖥️</button></div>'+
     '<div class="lead-stage" id="stageArea"><span class="stg-type">'+st.t+' ・ 環節 '+(S.idx+1)+'/'+S.meet.stages.length+'</span>'+
       '<h1>'+esc(st.n)+'</h1><div class="kids" id="kidsArea">'+Lead.screen(st)+'</div></div>'+
     '<div class="lead-bar"><div class="row"><div class="stagepill">'+pills+'</div></div>'+
       '<div class="row"><div style="flex:1;min-width:0"><span class="cue-label">領袖而家做'+(function(){var c=Kit.checkFor(st);return c?' <button class="lnk cue-chk" onclick="Kit.openCheck(\''+c.key+'\',\''+((Lead.S.meet&&Lead.S.meet.id)||'')+'\')">'+c.ic+' '+esc(c.n)+'</button>':' <button class="lnk cue-chk" onclick="Kit.hubOpen()">🧰 點預備</button>'})()+'</span>'+(typeof Venue!=='undefined'?Venue.stageHint(st):'')+(typeof Craft!=='undefined'?Craft.ctrlHint(st):'')+'<div class="now">'+esc(g.lead)+'</div><div class="leader-action">'+esc(g.watch)+'</div><div class="script">🎤 '+(esc(st.script||g.say)||'—')+'</div></div>'+
       '<div class="timer" id="tmr" onclick="Lead.toggleTmr()">'+Lead.fmt(S.left)+'</div></div>'+
       '<div class="row"><button class="btn sm ghost" onclick="Lead.prev()" '+(S.idx?'':'disabled style="opacity:.4"')+'>◀ 上一個</button>'+
       '<button class="btn sm" onclick="Lead.toggleTmr()" id="tmrBtn">▶ 開始計時</button>'+
       '<button class="btn sm ghost" onclick="Lead.next()">下一個 ▶</button></div></div>';
    Lead.stopTmr();Lead.renderTmr();
    if(Lead.after)Lead.after();
  },
  quietQuick:function(){
    var root=document.getElementById('leadroot')||document.body;
    var existing=document.getElementById('quietOverlay');
    if(existing){existing.remove();return;}
    var ov=document.createElement('div');
    ov.id='quietOverlay';
    ov.className='toolwrap';
    ov.style.background='rgba(10,25,18,0.96)';
    ov.style.zIndex='350';
    ov.innerHTML='<div class="toolbox" style="text-align:center;max-width:480px;background:#fff;border-radius:24px;padding:24px">'+
      '<div class="huge" style="font-size:5rem;line-height:1">🤫</div>'+
      '<h2 style="color:var(--ord);font-size:1.8rem;margin:8px 0">請全體安靜・變木頭人！</h2>'+
      '<div id="quietCount" style="font-size:4.5rem;font-weight:900;color:var(--grd);margin:10px 0">5</div>'+
      '<p class="mute" style="font-size:1rem">睇下邊個最快靜晒同企定定...</p>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm ghost" onclick="document.getElementById(\'quietOverlay\').remove()">關閉</button></div>'+
      '</div>';
    root.appendChild(ov);
    var sec=5;
    Sfx.whistle();
    var iv=setInterval(function(){
      sec--;
      var num=document.getElementById('quietCount');
      if(!num){clearInterval(iv);return;}
      if(sec>0){
        num.textContent=sec;
        Sfx.tick();
      } else {
        clearInterval(iv);
        num.textContent='🎉';
        num.style.fontSize='3.5rem';
        var h2=ov.querySelector('h2');
        if(h2){h2.textContent='好叻！個個都安靜企定！';h2.style.color='var(--grd)';}
        Sfx.fanfare();
        setTimeout(function(){
          if(ov.parentNode)ov.remove();
        },1600);
      }
    },1000);
  },
  addMiniGame:function(){
    var games=[
      {id:'catch',ic:'🦗',n:'草蜢跳格（實體九宮格）',d:'地上九宮格・限時跳格・自定秒數'},
      {id:'traffic',ic:'🚦',n:'紅綠燈',d:'紅燈停綠燈行・唔使物資'},
      {id:'leader',ic:'🙋',n:'領袖話',d:'專注反應肢體・唔使物資'},
      {id:'quiz',ic:'🏆',n:'問答擂台（四角搶答）',d:'行去 A/B/C/D 角表態'},
      {id:'judge',ic:'👍',n:'對錯法庭（左右分邊）',d:'用腳表態・附解釋'},
      {id:'guess',ic:'🔍',n:'估估下',d:'看剪影猜事物・舉手搶答'},
      {id:'clean',ic:'🧼',n:'洗手七步操',d:'20秒計時・徒手跟住做'},
      {id:'task',ic:'🎯',n:'任務抽籤機',d:'抽日行一善・返屋企做'},
      {id:'emotion',ic:'😊',n:'情緒面面觀',d:'抽表情・全體扮一次'}
    ];
    var h='<h3>➕ 加插快閃遊戲（小朋友身體落場玩）</h3><div class="mute" style="font-size:.82rem;margin-bottom:10px">提早完成或想轉移焦點？撳一下即開—螢幕只係出題・叫位・計時・計分，小朋友用身體玩，玩完可隨時返回原集會流程：</div>'+
      '<div class="grid2">'+
        games.map(function(g){
          return '<div class="mem" style="margin:0;padding:10px"><h4 style="margin:0">'+g.ic+' '+g.n+'</h4><small class="mute">'+g.d+'</small><br><button class="btn sm gr" style="margin-top:6px" onclick="Lead.insertGameStage(\''+g.id+'\',\''+g.n+'\')">▶ 即插即玩</button></div>';
        }).join('')+
      '</div>';
    Modal.open(h);
  },
  insertGameStage:function(screen,name){
    Modal.close();
    var S=Lead.S;
    var newStage={t:'遊戲',n:'快閃：'+name,m:5,how:'臨時加插數碼互動遊戲',script:'「而家我哋嚟個快閃小挑戰——'+name+'！」',screen:screen};
    S.meet.stages.splice(S.idx+1,0,newStage);
    Lead.next();
    toast('已加插「'+name+'」！');
  },
  fs:function(){
    try{
      if(document.fullscreenElement){document.exitFullscreen()}else{document.documentElement.requestFullscreen()}
    }catch(e){}
  },
  fmt:function(s){s=Math.max(0,s);var m=Math.floor(s/60),x=s%60;return m+':'+(x<10?'0':'')+x},
  renderTmr:function(){var e=document.getElementById('tmr');if(e){e.textContent=Lead.fmt(Lead.S.left);e.classList.toggle('late',Lead.S.left<=0)}},
  toggleTmr:function(){Lead.S.timerOn?Lead.stopTmr():Lead.startTmr()},
  startTmr:function(){
    Lead.S.timerOn=true;var b=document.getElementById('tmrBtn');if(b)b.textContent='⏸ 暫停';
    if(Lead.tmr)clearInterval(Lead.tmr);
    Lead.tmr=setInterval(function(){
      Lead.S.left--;Lead.renderTmr();
      if(Lead.S.left<=0){Sfx.alarm();Lead.stopTmr();toast('⏰ 呢個環節完喇!')}
      else if(Lead.S.left<=10)Sfx.tick();
    },1000);
  },
  stopTmr:function(){
    Lead.S.timerOn=false;if(Lead.tmr)clearInterval(Lead.tmr);Lead.tmr=null;
    var b=document.getElementById('tmrBtn');if(b)b.textContent='▶ 開始計時';
  },
  next:function(){
    Lead.cleanupTimers();
    var S=Lead.S;if(S.idx>=S.meet.stages.length-1){Lead.finish();return;}
    S.idx++;S.left=(Lead.cur().m||5)*60;Sfx.ding();Lead.render();
  },
  prev:function(){
    Lead.cleanupTimers();
    var S=Lead.S;if(!S.idx)return;S.idx--;S.left=(Lead.cur().m||5)*60;Lead.render();
  },
  finish:function(){
    Lead.cleanupTimers();
    Sfx.fanfare();
    document.getElementById('kidsArea').innerHTML='<div class="huge">🎉</div><div class="big">今日集會完滿結束!<br>小童軍——向前進!</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn gr" onclick="Lead.done()">✓ 記錄完成+記出席</button><button class="btn ghost" onclick="Lead.exit()">離開</button></div>';
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
  /* 基礎圖解卡 + 免道具即玩切換橫額 */
  howto:function(st){
    var g=Guide.forStage(st);
    var mats=(st.mats||[]).length?'<div class="mats-bar" style="justify-content:center"><b>🧺 實物物資（選填）：</b>'+st.mats.map(function(m){return '<span class="pill">'+esc(m)+'</span>'}).join('')+'</div>':'';
    var craft=(typeof Craft!=='undefined')?Craft.screenArt(st):'';
    var vn=(typeof Venue!=='undefined')?(Venue.stageHint(st)+(typeof Craft!=='undefined'?Craft.ctrlHint(st):'')):'';
    return vn+'<div class="digital-tool-bar"><b>💡 冇自備道具？</b> 唔使驚！呢啲遊戲用身體玩，螢幕只係幫你出題・叫位・計分：'+
      '<div class="btns" style="justify-content:center;margin-top:6px">'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'catch\')">🦗 草蜢跳格（九宮格）</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'traffic\')">🚦 紅綠燈</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'leader\')">🙋 領袖話</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'quiz\')">🏆 四角搶答</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'guess\')">🔍 估估下</button>'+
      '</div></div>'+
      '<div class="child-prompt">領袖先示範一次，小朋友跟住每一步做</div>'+craft+Lead.guideHtml(g)+mats+
      ((typeof Img!=='undefined')?'<div class="btns" style="justify-content:center;margin-top:6px">'+Img.vid(st.n)+'</div>':'');
  },

  /* 🛡️ 身體地圖紅黃綠 (Safe from Harm 數碼道具) */
  bodycard:function(){
    Lead._bodySel=null;
    return '<div class="qa-q">🛡️ 身體地圖紅黃綠・保護自己</div>'+
      '<div class="how" style="font-size:1.05rem">身體係你自己嘅！領袖逐個部位講，小朋友用手勢答：綠＝擊掌・黃＝雙手交叉・紅＝大聲「唔好！」</div>'+
      '<div id="bodyCardBanner" class="tl-action-banner gr">🧑‍🏫 領袖撳一個身體部位開始講解（或撳「🎲 考考小朋友」）</div>'+
      '<div class="body-grid">'+
        DATA.bodyParts.map(function(b,i){
          return '<div class="body-tile '+b.c+'" onclick="Lead.bodyPick('+i+')">'+
            '<span class="body-icon">'+b.ic+'</span><b>'+esc(b.n)+'</b>'+
            '<span class="tag '+(b.c==='red'?'r':b.c==='yellow'?'y':'g')+'">'+(b.c==='red'?'🔴 絕對唔准':b.c==='yellow'?'🟡 要小心':'🟢 可以')+'</span>'+
          '</div>';
        }).join('')+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:8px">'+
        '<button class="btn sm ghost" onclick="Lead.bodyTest()">🎲 考考小朋友（隨機抽題）</button>'+
      '</div>'+
      Lead.leaderOnly('點身體部位講解由你撳；小朋友用手勢答（綠＝擊掌・黃＝雙手交叉・紅＝大聲「唔好！」）')+
      Lead.playCard('bodycard');
  },

  /* ♻️ 三色回收 → 四角分桶：螢幕出物件，小朋友行去桶角，領袖揭曉 */
  recycle:function(){
    Lead._recScore=Lead._recScore||0;
    Lead._recCur=DATA.recycleItems[Math.floor(Math.random()*DATA.recycleItems.length)];
    Lead._recShown=false;
    var bins=[['blue','🟦 藍色桶','廢紙類'],['yellow','🟨 黃色桶','金屬鋁罐'],['green','🟩 啡/綠桶','塑膠製品'],['trash','⬛ 垃圾筒','不可回收']];
    return '<div class="qa-q">♻️ 三色回收・四角分桶 <span class="tag g" id="recSc">全場答對: 0 件</span></div>'+
      '<div class="how" style="font-size:1.15rem">呢件嘢應該去邊個桶？<b>行去嗰個角企好</b>—領袖先至揭曉！</div>'+
      '<div class="huge" id="recItem" style="margin:8px 0">'+Lead._recCur.n+'</div>'+
      '<div class="recycle-corners">'+bins.map(function(b){
        return '<div class="corner-card bin '+b[0]+'" id="bin'+b[0]+'"><b>'+b[1]+'</b><small>'+b[2]+'</small></div>'}).join('')+'</div>'+
      '<div id="recTip" class="tl-action-banner am">🚶 行去你覺得啱嘅角・企定・數到 10 領袖就揭曉</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        bins.map(function(b){return '<button class="btn sm" onclick="Lead.recycleReveal(\''+b[0]+'\')">揭曉：'+b[1]+'</button>'}).join('')+
        '<button class="btn sm ghost" onclick="Lead.nextRecycle()">🎲 換物件 ▶</button>'+
      '</div>'+
      Lead.leaderOnly('小朋友行去桶角表態；邊個桶啱由你撳「揭曉」')+
      Lead.playCard('recycle');
  },

  /* 🇭🇰 國旗與區旗敬禮 */
  flags:function(){
    Lead._flagIdx=0;
    Lead.after=function(){Lead.flagShow(0)};
    return '<div class="qa-q">🇭🇰 國旗與區旗・敬禮儀式</div>'+
      '<div class="flag-stage">'+
        '<div class="flag-card" id="flagCard">'+
          '<div class="flag-icon" id="flagIcon">🇨🇳</div>'+
          '<h2 id="flagTitle" style="margin:4px 0;color:var(--ord)">中華人民共和國國旗 (五星紅旗)</h2>'+
          '<p id="flagDesc" class="mute">五星紅旗，紅色代表革命，大五角星代表團結，四顆小星圍繞象徵全國各界人民。</p>'+
        '</div>'+
      '</div>'+
      '<div id="flagCue" class="tl-action-banner rd">🫡 <b>全體立正！眼望國旗，行童軍禮／注目禮！</b></div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn sm" onclick="Lead.flagShow(0)">🇨🇳 國旗</button>'+
        '<button class="btn sm" onclick="Lead.flagShow(1)">🇭🇰 香港特區區旗</button>'+
        '<button class="btn sm" onclick="Lead.flagShow(2)">⚜️ 香港童軍總會會旗</button>'+
        '<button class="btn sm ghost" onclick="Sfx.fanfare();toast(\'敬禮！\')">🎺 響號敬禮</button>'+
      '</div>'+
      Lead.leaderOnly('轉旗同響號由你撳；小朋友立正、注目、行禮');
  },

  /* 🧼 洗手七步：畫面自動推進，全體徒手跟住做（唔使小朋友逐格撳） */
  clean:function(){
    Lead._cleanStep=0;
    return '<div class="qa-q">🧼 洗手七步好寶寶 <span class="tag b" id="cleanTmr">倒數 20秒</span></div>'+
      '<div class="how">跟住畫面七步徒手搓手，20 秒倒數完先停！</div>'+
      '<div class="clean-grid">'+
        DATA.washSteps.map(function(w,i){
          return '<div class="clean-card" id="cw'+i+'">'+
            '<span class="gnum">'+w.s+'</span><span class="clean-ic">'+w.ic+'</span><b>'+esc(w.n)+'</b><small>'+esc(w.d)+'</small>'+
          '</div>';
        }).join('')+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn gr" id="cleanBtn" onclick="Lead.cleanStart()">▶ 開始 20秒洗手歌與計時</button>'+
        '<button class="btn ghost" onclick="Lead.cleanStep(-1)">◀ 上一步</button>'+
        '<button class="btn ghost" onclick="Lead.cleanStep(1)">下一步 ▶</button>'+
      '</div>'+
      Lead.leaderOnly('撳「開始」自動逐步推進；想慢教就用「◀／▶」逐步行')+
      Lead.playCard('clean');
  },

  /* 😊 情緒面面觀 (表情輪盤) */
  emotion:function(){
    return '<div class="qa-q">😊 情緒面面觀・認識心情</div>'+
      '<div class="how">每個人都有不同情緒！領袖抽一個，全體一齊扮，再講一句「我幾時會咁」。</div>'+
      '<div id="emoBanner" class="tl-action-banner am">🧑‍🏫 領袖撳「🎲 抽表情」—小朋友跟住扮一次</div>'+
      '<div class="grid3" style="max-width:680px;margin:10px auto;width:100%">'+
        DATA.emotions.map(function(e,i){
          return '<div class="mem" style="cursor:pointer;text-align:center;padding:12px 8px" onclick="Lead.emoPick('+i+')">'+
            '<div style="font-size:2.8rem;line-height:1.1">'+e.ic+'</div>'+
            '<b style="font-size:1rem;color:var(--ord);display:block;margin-top:4px">'+esc(e.n)+'</b>'+
          '</div>';
        }).join('')+
      '</div>'+
      '<div class="btns" style="justify-content:center">'+
        '<button class="btn sm ghost" onclick="Lead.emoRandom()">🎲 抽表情・全體扮一次</button>'+
      '</div>'+
      Lead.leaderOnly('你抽表情，全體一齊扮＋講一句「我幾時會咁」')+
      Lead.playCard('emotion');
  },

  /* 🎯 任務抽籤機 (家務/善行挑戰) */
  task:function(){
    Lead._taskCur=DATA.tasks[0];
    return '<div class="qa-q">🎯 任務抽籤機・日行一善</div>'+
      '<div class="how">按下「轉動抽任務」，抽取今日的小童軍善行挑戰！</div>'+
      '<div class="task-box" id="taskBox">'+
        '<div class="huge" id="taskIc">🥣</div>'+
        '<h2 id="taskTitle" style="color:var(--ord);margin:6px 0">自己收碗筷</h2>'+
        '<p id="taskDesc" style="font-size:1.15rem;color:var(--ink)">食完飯將自己的碗筷同餐具收去廚房！</p>'+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:12px">'+
        '<button class="btn" id="taskBtn" onclick="Lead.taskSpin()">🎲 轉動抽任務！</button>'+
      '</div>'+
      '<div class="mute" style="text-align:center;font-size:.85rem;margin-top:6px">💡 小童軍規律：小童軍日行一善。做完返屋企跟爸爸媽媽打卡！</div>'+
      Lead.leaderOnly('轉輪盤由你撳；小朋友一齊讀出任務＋講一句「我幾時做」')+
      Lead.playCard('task');
  },

  /* 🏕️ 貝登堡勳爵故事繪本 */
  bpstory:function(){
    Lead._bpPage=0;
    Lead.after=function(){Lead.bpShow(0)};
    return '<div class="qa-q">🏕️ 貝登堡勳爵與童軍誕生故事</div>'+
      '<div class="bp-slide-box" id="bpSlideBox">'+
        '<div class="huge" id="bpIc">🫡</div>'+
        '<h2 id="bpTitle" style="color:var(--ord)">1. 童軍之父・貝登堡勳爵</h2>'+
        '<p id="bpDesc" style="font-size:1.2rem;line-height:1.6">1857年出生，自細熱愛大自然、觀察動物同露營生活。</p>'+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn sm ghost" onclick="Lead.bpPrev()">◀ 上一頁</button>'+
        '<span id="bpPageIndicator" class="pill on" style="margin:0 6px">1 / 4</span>'+
        '<button class="btn sm" onclick="Lead.bpNext()">下一頁 ▶</button>'+
      '</div>'+
      Lead.leaderOnly('翻頁由你撳；講到左握禮嗰頁，請小朋友即刻伸左手同隔籬握一次');
  },

  /* 🌲 童軍大家庭分支地圖 */
  scoutfamily:function(){
    return '<div class="qa-q">🌲 童軍大家庭分支地圖</div>'+
      '<div class="how">小童軍長大後會去哪裡？領袖逐個支部講；我哋而家係小草蜢！</div>'+
      '<div class="scout-tree">'+
        DATA.scoutFamily.map(function(s,i){
          return '<div class="scout-branch" style="border-left-color:'+s.c+'" onclick="Lead.scoutPick('+i+')">'+
            '<div class="sb-head"><span class="sb-ic">'+s.ic+'</span><b>'+esc(s.s)+'</b><span class="tag" style="background:'+s.c+'22;color:'+s.c+'">'+s.a+'</span></div>'+
            '<div class="sb-motto">銘言：<b>'+esc(s.motto)+'</b></div>'+
            '<small class="mute">'+esc(s.d)+'</small>'+
          '</div>';
        }).join('')+
      '</div>'+
      Lead.leaderOnly('逐個支部由你撳住講；小朋友跟住講一次自己支部嘅銘言「前進」');
  },

  /* 🌈 彩虹健康飲食盤 */
  foodrainbow:function(){
    return '<div class="qa-q">🌈 彩虹健康飲食盤</div>'+
      '<div class="how">每天吃五種顏色的健康食物，身體健康快高長大！</div>'+
      '<div id="foodBanner" class="tl-action-banner gr">🧑‍🏫 領袖撳一種顏色—小朋友講一樣嗰色嘅食物</div>'+
      '<div class="food-grid">'+
        DATA.foodRainbow.map(function(f,i){
          return '<div class="food-tile" style="border-color:'+f.c+'" onclick="Lead.foodPick('+i+')">'+
            '<b style="color:'+f.c+';font-size:1.1rem">'+esc(f.n)+'</b>'+
            '<div style="font-size:.9rem;margin:4px 0"><b>例子：</b>'+esc(f.ex)+'</div>'+
            '<small style="color:var(--mute)">💪 '+esc(f.benefit)+'</small>'+
          '</div>';
        }).join('')+
      '</div>'+
      Lead.leaderOnly('你撳顏色揭曉好處；小朋友講一樣嗰色嘅食物＋扮「食落肚」')+
      Lead.playCard('foodrainbow');
  },

  /* 🚗 交通工具大圖鑑 */
  transport:function(){
    Lead._tpIdx=0;
    Lead.after=function(){Lead.tpShow(0)};
    return '<div class="qa-q">🚗 交通工具大圖鑑與安全乘車</div>'+
      '<div class="tp-box" id="tpBox">'+
        '<div class="huge" id="tpIc">🚌</div>'+
        '<h2 id="tpTitle" style="color:var(--ord);margin:4px 0">雙層巴士</h2>'+
        '<div id="tpWhere" class="tag b" style="margin-bottom:8px">陸地道路</div>'+
        '<p id="tpRule" style="font-size:1.15rem;font-weight:700;color:var(--grd)">上車拍八達通、坐穩扶好、上層千祈唔准企！</p>'+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn sm ghost" onclick="Lead.tpPrev()">◀ 上一種</button>'+
        '<button class="btn sm ghost" onclick="Lead.tpRandom()">🎲 隨機抽查</button>'+
        '<button class="btn sm" onclick="Lead.tpNext()">下一種 ▶</button>'+
      '</div>'+
      Lead.leaderOnly('逐個講由你撳；小朋友扮一次＋講一句安全守則')+
      Lead.playCard('transport');
  },

  /* 🌕 中秋射月：真實投擲（螢幕做靶＋計分板，唔係俾人撳） */
  moon:function(){
    Lead._moonScore=0;Lead._moonTurn=0;
    return '<div class="qa-q">🌕 歡樂射月・真實投擲 <span class="tag g" id="moonSc">命中: 0 次</span></div>'+
      '<div class="how">企喺投擲線後，輪流用泡棉球拋向月亮靶！螢幕係<b>靶同計分板</b>—唔使掂螢幕。</div>'+
      '<div class="moon-target-wrap">'+
        '<div class="moon-target" id="moonTarget">'+
          '<div class="moon-inner">🌕</div>'+
          '<span class="moon-hit-txt">🎯 瞄準月亮！</span>'+
        '</div>'+
      '</div>'+
      '<div id="moonMsg" class="tl-action-banner am">📏 投擲線離靶 1.5–2 米・腳留喺線後・每人 3 球</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn gr" onclick="Lead.moonHit()">🎯 中咗 +1</button>'+
        '<button class="btn rd" onclick="Lead.moonMiss()">❌ 冇中</button>'+
        '<button class="btn ghost" onclick="Lead.moonNext()">🙋 下一位</button>'+
        '<button class="btn sm ghost" onclick="Lead.moonReset()">🔄 歸零</button>'+
      '</div>'+
      Lead.scoreBar()+
      Lead.leaderOnly('小朋友拋球；中冇中由你撳（佢哋唔使行埋嚟撳螢幕）')+
      Lead.playCard('moon');
  },

  /* 🦗 認識小草蜢 */
  ghinfo:function(){
    return '<div class="qa-q">🦗 認識小草蜢</div>'+
      '<div class="how">點解小童軍叫做「小草蜢」？一齊來認識草蜢的厲害！</div>'+
      '<div class="grid3" style="max-width:760px;margin:10px auto;width:100%">'+
        DATA.grasshopperFacts.map(function(g){
          return '<div class="mem" style="padding:14px 10px;text-align:center">'+
            '<div style="font-size:2.8rem">'+g.ic+'</div>'+
            '<h3 style="color:var(--ord);font-size:1.05rem;margin:6px 0">'+esc(g.t)+'</h3>'+
            '<p style="font-size:.85rem;line-height:1.45;color:var(--ink)">'+esc(g.d)+'</p>'+
          '</div>';
        }).join('')+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn sm" onclick="Lead.startGame(\'catch\',\'草蜢跳格・實體九宮格\')">🦗 玩草蜢跳格（實體九宮格）</button>'+
      '</div>'+
      Lead.leaderOnly('圖鑑由你講；小朋友即刻可以蹲低扮草蜢跳一次')+
      '<div class="child-prompt">🦘 即刻試：全體蹲低→數「一、二、三」→跳起！比下邊個跳得最輕盈。</div>';
  },

  /* 🚩 獎章 Go Go Go */
  badgego:function(){
    return '<div class="qa-q">🚩 獎章路線圖・進步獎章</div>'+
      '<div class="how">小童軍的成長旅程：由團員章到四級進步獎章，再到小草蜢獎章！</div>'+
      '<div class="badge-go-track">'+
        '<div class="bg-step" style="border-top-color:#f57c00"><b>👑 團員章</b><small>佩戴左胸・完成基本4次集會與常識</small></div>'+
        '<div class="bg-step" style="border-top-color:#e53935"><b>🔴 第一步 (紅)</b><small>約 5-6 個月</small></div>'+
        '<div class="bg-step" style="border-top-color:#795548"><b>🟤 第二步 (啡)</b><small>約 11-12 個月</small></div>'+
        '<div class="bg-step" style="border-top-color:#1e88e5"><b>🔵 第三步 (藍)</b><small>約 16-18 個月</small></div>'+
        '<div class="bg-step" style="border-top-color:#2e7d32"><b>🟢 第四步 (綠)</b><small>約 22 個月</small></div>'+
        '<div class="bg-step" style="border-top-color:#f57c00"><b>🦗 小草蜢獎章</b><small>7大範疇各完成2項體驗</small></div>'+
      '</div>'+
      '<div class="attention" style="margin-top:10px;text-align:center"><b>遊戲玩法：</b> 小朋友雙腳跳或單腳跳沿著獎章顏色逐個跳過去！</div>'+
      '<div class="child-prompt">🦘 地上貼五張顏色紙（紅・啡・藍・綠・黃），小朋友照住順序跳過去—螢幕只係告訴你跳乜色。</div>'+
      Lead.leaderOnly('你撳住講，小朋友用腳跳');
  },

  /* 🧣 整理領巾圖解 */
  scarf:function(){
    return '<div class="qa-q">🧣 整理領巾三步法</div>'+
      '<div class="how">睇圖跟住做，領巾戴得整整齊齊！</div>'+
      '<div class="grid3" style="max-width:760px;margin:10px auto;width:100%">'+
        '<div class="mem" style="padding:12px;text-align:center"><div class="gnum">1</div><div style="font-size:2.4rem;margin:4px 0">🧣</div><b>第一步：攤平</b><p style="font-size:.85rem">旅巾背面朝上平放，尖端朝前。</p></div>'+
        '<div class="mem" style="padding:12px;text-align:center"><div class="gnum">2</div><div style="font-size:2.4rem;margin:4px 0">↩️</div><b>第二步：慢慢捲起</b><p style="font-size:.85rem">由巾底向巾尖慢慢捲，約 3-3.5cm 粗，尖端留 12-15cm。</p></div>'+
        '<div class="mem" style="padding:12px;text-align:center"><div class="gnum">3</div><div style="font-size:2.4rem;margin:4px 0">⭕</div><b>第三步：穿巾圈</b><p style="font-size:.85rem">圍上衣領穿入巾圈，尖端在後頸中央，兩端等長對稱！</p></div>'+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn sm" onclick="Sfx.fanfare();toast(\'大家戴得好整齊！拍手！\')">👏 檢查完成・全體鼓掌</button>'+
      '</div>'+
      Lead.leaderOnly('你示範一次，逐個小朋友試；檢查由你做');
  },

  story:function(st){
    var p=DATA.storyPrompts[Math.floor(Math.random()*DATA.storyPrompts.length)];
    return '<div class="qa-q">📖 '+p.t+'</div><div class="how" style="font-size:1.2rem">'+esc(p.h)+'</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm ghost" onclick="Lead.rerender()">🔀 揀另一個</button></div>'+
      Lead.playCard('story');
  },
  promise:function(){
    return '<div class="big" style="color:var(--ord)">我願參加小童軍,<br>愛神愛人愛國家。</div>'+
      '<div class="songline" style="font-size:1.2rem;color:var(--mute)">規律:小童軍日行一善 ・ 口號:小童軍向前進 ・ 銘言:前進</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn sm" onclick="Lead.promiseBig()">🔍 放大逐句讀</button></div>'+
      Lead.leaderOnly('你撳一句亮一句，小朋友跟讀');
  },
  chuteopen:function(){
    var g=Guide.forStage({screen:'chuteopen'});
    return '<div class="big">🌈 快樂傘開會・跟圖做</div>'+Lead.parachuteSvg('open')+Lead.guideHtml(g)+'<div class="huge" style="font-size:clamp(2rem,8vw,4.5rem)">「小童軍——向前進!」</div>';
  },
  chuteclose:function(){
    var g=Guide.forStage({screen:'chuteclose'});
    return '<div class="big">🌈 快樂傘散會・跟圖做</div>'+Lead.parachuteSvg('close')+Lead.guideHtml(g)+'<div class="huge" style="font-size:clamp(2rem,8vw,4.5rem)">「小童軍——向前進!」</div>';
  },
  song:function(st){
    Music.stop();
    var sk=(st&&st.song)||'theme';
    var meta=Music.load(sk);
    var lines=meta.lyrics||DATA.facts.song;
    Lead.after=function(){};
    var g=Guide.forStage({t:'唱遊',screen:'song'});
    return '<div class="big" style="font-size:1.3rem;color:var(--mute)">🎵 '+esc(meta.title)+'・卡拉OK</div>'+
      '<div class="song-note"><b>唔使搵 YouTube：</b>'+esc(sk==='theme'?(DATA.facts.songHint||'按播放，跟住黃色句子唱。'):'按播放，跟住句子唱。')+
      ' APP 會即時彈出「'+esc(meta.title)+'」旋律：'+esc(meta.note)+
      '—句尾拖長、句與句之間換氣、有和弦托底，同真歌嘅節奏一樣。</div>'+
      lines.map(function(l,i){return '<div class="songline" id="sg'+i+'">'+esc(l)+'</div>'}).join('')+
      '<div class="song-tools">'+
        '<button class="btn gr" onclick="Lead.songTick(0)">▶ 播放伴奏+卡拉OK</button>'+
        '<button class="btn sm ghost" onclick="Lead.songStop()">⏹ 停止</button>'+
      '</div>'+
      '<div class="song-setup">'+
        '<span>🐢 速度 '+Music.TEMPOS.map(function(t){
          return '<button class="pill'+(Music.bpm===t.bpm?' on':'')+'" onclick="Lead.songTempo(\''+t.k+'\')">'+esc(t.n)+' ('+t.bpm+')</button>'}).join('')+'</span>'+
        '<span class="pill'+(Music.countIn?' on':'')+'" onclick="Lead.songOpt(\'countIn\')">🥁 4 拍數拍先入</span>'+
        '<span class="pill'+(Music.chords?' on':'')+'" onclick="Lead.songOpt(\'chords\')">🎹 和弦伴奏</span>'+
      '</div>'+
      '<div class="child-prompt">第一次帶：先播放一次，領袖跟住旋律唱；第二次先邀請小朋友加入。聽到 4 聲「嘀」先至開聲。</div>'+Lead.guideHtml(g);
  },
  chute:function(st){
    var idx=st&&st.chuteIndex!=null?st.chuteIndex:Math.floor(Math.random()*DATA.chute.length);
    Lead._curChuteIdx=idx;
    var c=DATA.chute[idx];
    var g=Guide.chute(c);
    return '<div class="qa-q">'+c.ic+' '+c.n+' <span class="tag">'+c.tag+'</span></div>'+
      Lead.parachuteSvg('open')+Lead.guideHtml(g)+
      '<div class="btns" style="justify-content:center"><button class="btn sm" onclick="Lead.nextChute()">🔀 抽另一式</button></div>'+
      Lead.playCard('chute');
  },
  roll:function(){
    var mem=(Store.get('members',[])||[]).map(function(m){return m.n});
    var hasMem=mem.length>0;
    Lead._pool=hasMem?mem:['小明','小美','阿力','阿詩','子朗','恩恩'];
    var g=Guide.forStage({t:'點名',n:'音樂傳球點名'});
    return '<div class="qa-q">🎤 音樂傳球點名</div>'+
      '<div class="child-prompt">有音樂就跟節奏傳；冇音樂就由領袖拍手：一、二、一、二，停拍就停球。</div>'+
      (!hasMem?'<div class="attention" style="margin:8px auto;max-width:560px">💡 提示：在「🏅追蹤」加入團員名單後，會自動使用團員名字點名。現在使用示範名單。</div>':'')+
      '<div class="huge" id="rollOut" style="min-height:1.4em;margin:10px 0">🎲</div>'+
      '<div id="rollPrompt" class="how" style="font-size:1.1rem;color:var(--mute)">撳「停球・抽一位」決定持球者</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px"><button class="btn" id="rollBtn" onclick="Lead.roll()">⏸ 停球・抽一位</button></div>'+
      '<div class="guide-steps" style="max-width:640px;margin:12px auto">'+g.steps.map(function(x){return '<div class="guide-step"><span class="gnum">'+esc(x[0])+'</span><span class="gicon">'+x[1]+'</span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></div>'}).join('')+'</div>'+
      Lead.playCard('roll');
  },
  /* 🏆 問答擂台 → 四角搶答：答案擺喺禮堂四角，小朋友行去表態 */
  quiz:function(){
    var q=DATA.quiz[Math.floor(Math.random()*DATA.quiz.length)];
    var opts=[q.a].concat(q.w);opts.sort(function(){return Math.random()-.5});
    Lead._quizCur={q:q,a:q.a,opts:opts,shown:false};
    var L=['A','B','C','D'];
    return '<div class="qa-q"><small class="tag">'+esc(q.c)+'</small><br>'+esc(q.q)+'</div>'+
      '<div class="corner-opts" id="quizOpts">'+
      opts.map(function(o,idx){
        return '<div class="corner-card" id="qo'+idx+'"><span class="cc-letter">'+L[idx]+'</span><span class="cc-txt">'+esc(o)+'</span></div>';
      }).join('')+'</div>'+
      '<div id="quizExplain" style="text-align:center;margin-top:8px"></div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn gr" onclick="Lead.quizReveal()">✅ 揭曉答案</button>'+
        '<button class="btn" onclick="Lead.rerender()">🎲 下一題 ▶</button>'+
      '</div>'+
      Lead.scoreBar()+
      Lead.leaderOnly('出題、揭曉、記分都由你撳；小朋友行去 A／B／C／D 角表態')+
      Lead.playCard('quiz');
  },
  /* 👍 對錯法庭 → 左右分邊：用腳表態，唔係撳螢幕 */
  judge:function(){
    var arr=Math.random()<.5?DATA.judgeKind:DATA.judgeSfh;
    var j=arr[Math.floor(Math.random()*arr.length)];
    Lead._judgeCur=j;Lead._judgeShown=false;
    return '<div class="qa-q">👨‍⚖️ 對錯法庭・左右分邊</div>'+
      '<div class="how" style="font-size:1.4rem;font-weight:700">「'+esc(j.s)+'」</div>'+
      '<div class="split-sides" id="judgeOpts">'+
        '<div class="side yes" id="jsYes"><span class="side-ic">👍</span><b>啱・好行為</b><small>覺得啱就行去呢邊</small></div>'+
        '<div class="side no" id="jsNo"><span class="side-ic">👎</span><b>錯・唔應該</b><small>覺得錯就行去呢邊</small></div>'+
      '</div>'+
      '<div id="judgeExp" style="text-align:center;margin-top:10px"></div>'+
      '<div class="btns" style="justify-content:center;margin-top:12px">'+
        '<button class="btn gr" onclick="Lead.judgeReveal()">⚖️ 宣判</button>'+
        '<button class="btn" onclick="Lead.rerender()">🎲 下一案 ▶</button>'+
      '</div>'+
      Lead.leaderOnly('小朋友行去 👍／👎 嗰邊表態；宣判由你撳，再請一位講點解')+
      Lead.playCard('judge');
  },
  guess:function(){
    var g=DATA.guess[Math.floor(Math.random()*DATA.guess.length)];
    Lead._guessCur={emoji:g[0], name:g[1], revealed:false};
    return '<div class="qa-q">🔍 估估下:呢個係咩?</div>'+
      '<div class="huge" id="gz" style="filter:brightness(0);transition:filter .4s ease">'+g[0]+'</div>'+
      '<div class="big" id="gzt" style="min-height:1.8em">❓ 睇剪影估答案！</div>'+
      '<div class="btns" style="justify-content:center">'+
        '<button class="btn gr" id="gzBtn" onclick="Lead.guessReveal()">💡 揭盅</button>'+
        '<button class="btn ghost" onclick="Lead.rerender()">下一個 ▶</button>'+
      '</div>'+
      Lead.leaderOnly('小朋友舉手搶答；揭盅由你撳')+
      Lead.playCard('guess');
  },
  /* 🃏 記憶配對：小朋友用口講位置，領袖揭卡（卡上有編號，先講得到） */
  memory:function(){
    var set=DATA.guess.slice().sort(function(){return Math.random()-.5}).slice(0,6);
    var cards=set.concat(set).map(function(x){return x[0]}).sort(function(){return Math.random()-.5});
    Lead._mem={open:[],done:[],cards:cards,lock:false,totalPairs:6};
    return '<div class="qa-q">🃏 記憶配對・口講位置 <span class="tag g" id="memProgress">進度: 0/6 對</span></div>'+
      '<div class="how" id="memStatus">輪流講「第 X 張同第 Y 張」，領袖揭開—配對成功全體拍手！</div>'+
      '<div class="mongrid">'+
      cards.map(function(c,i){return '<div class="mon flip" id="mo'+i+'" onclick="Lead.memFlip('+i+')" title="領袖揭卡"><span class="mon-no">'+(i+1)+'</span>?</div>'}).join('')+'</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn sm ghost" onclick="Lead.rerender()">🔄 新一局</button>'+
        '<button class="btn sm ghost" onclick="Lead.memCover()">🙈 全部蓋返</button></div>'+
      Lead.leaderOnly('小朋友用口講兩個位置（「第 3 張同第 8 張」），揭卡由你撳')+
      Lead.playCard('memory');
  },
  leader:function(){
    Lead._ldrCmds=[
      {cmd:'摸鼻',say:'摸鼻！'},
      {cmd:'舉高雙手',say:'舉高雙手！'},
      {cmd:'單腳企',say:'單腳企！'},
      {cmd:'拍手三下',say:'拍手三下！'},
      {cmd:'轉一個圈',say:'轉一個圈！'},
      {cmd:'摸腳尖',say:'摸腳尖！'},
      {cmd:'學小草蜢跳',say:'學小草蜢跳！'},
      {cmd:'企定定',say:'企定定！'},
      {cmd:'摸肚仔',say:'摸肚仔！'},
      {cmd:'拉拉耳仔',say:'拉拉耳仔！'},
      {cmd:'敬個禮',say:'敬個童軍禮！'},
      {cmd:'扮小兔跳',say:'扮小兔跳！'},
      {cmd:'雙手叉腰',say:'雙手叉腰！'},
      {cmd:'原地踏步',say:'原地踏步！'}
    ];
    return '<div class="qa-q">🙋 領袖話</div>'+
      '<div class="how">只做「領袖話」開頭嘅指令！冇講「領袖話」就係陷阱，唔准做！做錯坐低！</div>'+
      '<div class="ldr-banner" id="ldrBox"><div class="big" id="ldrCmd" style="margin:0">領袖撳「📣 下一個指令」開始</div><div id="ldrHint" class="mute" style="font-size:.95rem;margin-top:4px">準備好未？</div></div>'+
      '<div class="btns" style="justify-content:center"><button class="btn" onclick="Lead.ldrGo()">📣 下一個指令</button></div>'+
      '<div class="mute" style="text-align:center;font-size:.82rem;margin-top:8px">💡 帶領貼士：先出2-3個真指令熱身，再突然出陷阱指令！</div>'+
      Lead.playCard('leader');
  },
  traffic:function(){
    Lead._tl='green';
    Lead.after=function(){Lead.tl('green',true)};
    return '<div class="qa-q">🚦 紅綠燈</div>'+
      '<div class="how">綠燈大步向前行、黃燈慢動作／單腳企、紅燈定格唔准郁！</div>'+
      '<div id="tlAction" class="tl-action-banner gr">🟢 <b>綠燈！大步向前行！</b><br><small>小童軍向前進！</small></div>'+
      '<div class="trafficlight">'+
        '<div class="tl red" id="tlr" onclick="Lead.tl(\'red\')" title="轉紅燈"></div>'+
        '<div class="tl amber" id="tla" onclick="Lead.tl(\'amber\')" title="轉黃燈"></div>'+
        '<div class="tl green" id="tlg" onclick="Lead.tl(\'green\')" title="轉綠燈"></div>'+
      '</div>'+
      '<div class="btns" style="justify-content:center">'+
        '<button class="btn rd" onclick="Lead.tl(\'red\')">🔴 紅燈 (停)</button>'+
        '<button class="btn" style="background:#fb8c00" onclick="Lead.tl(\'amber\')">🟡 黃燈 (慢/單腳)</button>'+
        '<button class="btn gr" onclick="Lead.tl(\'green\')">🟢 綠燈 (行)</button>'+
        '<button class="btn ghost" onclick="Lead.tlRandom()">🎲 隨機轉燈</button>'+
        '<button class="btn ghost" id="tlAutoBtn" onclick="Lead.tlToggleAuto()">⏱️ 自動隨機: 關</button>'+
      '</div>'+
      '<div class="mute" style="text-align:center;font-size:.85rem;margin-top:6px">💡 遊戲規則：紅燈定格，郁咗嘅小童軍要退後一步／舉手做小草蜢！</div>'+
      Lead.playCard('traffic');
  },
  /* 🦗 草蜢跳格：實體九宮格——螢幕叫位，小朋友用腳跳上去（唔使掂螢幕） */
  catch:function(){
    var G=Lead._grid;
    if(!G||!G.ready)Lead.gridReset();
    G=Lead._grid;
    return '<div class="qa-q">🦗 草蜢跳格・實體九宮格 <span class="tag g" id="gdRound">第 0/'+G.rounds+' 回合</span></div>'+
      '<div class="how" id="gdHow">地上貼咗嘅 3×3 九宮格：螢幕亮邊格＋叫聲，小朋友就要喺<b>限時之內跳上嗰格</b>！<br><b>唔使掂螢幕</b>—螢幕嗌位，小朋友用腳玩。</div>'+
      '<div class="grid-setup">'+
        '<span>⏱️ 每格限時 '+[2,3,4,5].map(function(x){return '<button class="pill'+(G.sec===x?' on':'')+'" onclick="Lead.gridSet(\'sec\','+x+')">'+x+'秒</button>'}).join('')+
        '<input class="num-in" type="number" min="1" max="30" value="'+G.sec+'" onchange="Lead.gridSet(\'sec\',+this.value)" title="自訂秒數"> 秒</span>'+
        '<span>🔁 回合 '+[5,8,10].map(function(x){return '<button class="pill'+(G.rounds===x?' on':'')+'" onclick="Lead.gridSet(\'rounds\','+x+')">'+x+'</button>'}).join('')+'</span>'+
        '<span>🎯 玩法 <button class="pill'+(G.mode==='all'?' on':'')+'" onclick="Lead.gridSet(\'mode\',\'all\')">全體一齊跳</button>'+
        '<button class="pill'+(G.mode==='team'?' on':'')+'" onclick="Lead.gridSet(\'mode\',\'team\')">分組接力計分</button></span>'+
      '</div>'+
      '<div class="molefield big9" id="gdField">'+[0,1,2,3,4,5,6,7,8].map(function(i){
        return '<div class="hole nine" id="ho'+i+'"><b>'+(i+1)+'</b><small>'+Lead.gridPos(i)+'</small></div>'}).join('')+'</div>'+
      '<div id="gdMsg" class="tl-action-banner am">🦗 撳「▶ 叫格」開始—螢幕叫位，小朋友跳上去！</div>'+
      '<div class="btns" style="justify-content:center">'+
        '<button class="btn gr" id="gdGo" onclick="Lead.gridGo()">▶ 叫格</button>'+
        '<button class="btn" onclick="Lead.gridMark(1)">✓ 站到咗 +1</button>'+
        '<button class="btn rd" onclick="Lead.gridMark(0)">✗ 未去到</button>'+
        '<button class="btn ghost" onclick="Lead.gridCall()">🔊 再嗌一次</button>'+
        '<button class="btn ghost" onclick="Lead.gridStop()">⏹ 停</button>'+
      '</div>'+
      (G.mode==='team'?Lead.scoreBar():'')+
      Lead.playCard('catch');
  },
  /* 🎵 節奏模仿：真實拍子聲（Web Audio 排期，唔會甩拍），全體跟住做 */
  rhythm:function(){
    var pool=[['👏 拍手','clap'],['🦶 踏步','stomp'],['🦗 草蜢跳','hop'],['🙆 大愛心','cheer'],['🥁 拍膝頭','drum'],['🖐️ 舉手','tick']];
    var prev=Lead._rhythm||{};
    var bpm=prev.bpm||100;
    var pat=[0,1,2,3].map(function(){var x=pool[Math.floor(Math.random()*pool.length)];return {t:x[0],s:x[1]}});
    Lead._rhythm={pat:pat,bpm:bpm,step:-1,playing:false};
    return '<div class="qa-q">🎵 節奏模仿・跟拍子</div>'+
      '<div class="how">領袖跟住拍子做一次 → 全體跟住做！拍子聲由 APP 出，唔使自己數。</div>'+
      '<div class="big" id="rhm" style="min-height:2.2em;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:10px auto">'+
        pat.map(function(p,i){return '<span class="pill" id="rhp'+i+'" style="font-size:1.15rem;padding:8px 14px">❓</span>'}).join('')+
      '</div>'+
      '<div id="rhMsg" class="tl-action-banner am">撳「▶ 播出節奏」聽一次，再撳「📣 全體跟做一次」</div>'+
      '<div class="grid-setup"><span>🥁 拍子速度 '+[80,100,120].map(function(x){
        return '<button class="pill'+(bpm===x?' on':'')+'" onclick="Lead.rhBpm('+x+')">'+x+'</button>'}).join('')+' BPM</span></div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn gr" id="rhPlayBtn" onclick="Lead.rhPlay()">▶ 播出節奏（有拍子聲）</button>'+
        '<button class="btn" onclick="Lead.rhEcho()">📣 全體跟做一次</button>'+
        '<button class="btn ghost" onclick="Lead.rerender()">🔄 換新節奏</button>'+
      '</div>'+
      Lead.leaderOnly('你撳「播出節奏」，小朋友用身體跟—唔使行埋嚟撳螢幕')+
      Lead.playCard('rhythm');
  },
  breath:function(){
    Lead.after=function(){Lead.brhTick(true)};
    return '<div class="qa-q">🍃 靜息呼吸</div><div class="how">全體坐好，跟住個圓圈：放大=吸氣(1-2-3-4)，縮小=呼氣(1-2-3-4)</div>'+
      '<div class="breath" id="brh">吸~~~</div><div class="btns" style="justify-content:center"><button class="btn sm ghost" onclick="Lead.brhTick(true)">🔄 由頭開始</button></div>'+
      Lead.playCard('breath');
  }
};

Lead.guideHtml=function(g){
  return '<div class="lead-guide"><div class="guide-lead"><b>領袖先做</b>'+esc(g.lead)+'</div><div class="guide-steps">'+g.steps.map(function(x){return '<div class="guide-step"><span class="gnum">'+esc(x[0])+'</span><span class="gicon">'+x[1]+'</span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></div>'}).join('')+'</div><div class="say-box"><b>🎤 領袖可以照讀</b>'+esc(g.say)+'</div><div class="watch-row"><div><b>👀 留意</b><br>'+esc(g.watch)+'</div><div class="safe"><b>🛡️ 安全</b><br>'+esc(g.safety)+'</div></div></div>';
};

Lead.parachuteSvg=function(mode){
  var raised=mode==='open';
  return '<div class="parachute-kit"><h3 style="margin:0;color:#1565c0">🌈 快樂傘動作圖</h3><div class="parachute-visual"><svg viewBox="0 0 520 205" role="img" aria-label="小朋友圍住快樂傘，一起揚起或放低"><path d="M70 70 Q260 '+(raised?'8':'125')+' 450 70 L425 102 Q260 '+(raised?'43':'159')+' 95 102 Z" fill="#ffca28" stroke="#e65100" stroke-width="5"/><path d="M95 101 Q260 '+(raised?'43':'160')+' 425 101" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/>'+[105,150,195,240,285,330,375,420].map(function(x){return '<circle cx="'+x+'" cy="'+(raised?'141':'180')+'" r="11" fill="#43a047" stroke="#1b5e20" stroke-width="3"/><path d="M'+x+' '+(raised?'151':'190')+' v18 m-13 -8 h26 m-5 8 l-8 14 m8-14 l8 14" stroke="#1b5e20" stroke-width="4" stroke-linecap="round" fill="none"/>'}).join('')+'<path d="M260 183 V'+(raised?'119':'156')+'" stroke="#e65100" stroke-width="5" stroke-linecap="round"/><path d="M250 '+(raised?'130':'156')+' l10 -14 10 14" fill="none" stroke="#e65100" stroke-width="5"/><text x="260" y="29" text-anchor="middle" font-size="17" font-weight="700" fill="#795548">'+(raised?'一起向上 ↑':'慢慢向下 ↓')+'</text></svg></div><div class="para-caption">綠色小人＝小朋友位置　黃色傘邊＝雙手執住　橙色箭咀＝跟領袖數拍子</div><div class="para-safety"><span>🤲 執實傘邊</span><span>↔️ 留一隻手臂距離</span><span>🛑 聽到停就停</span></div></div>';
};

/* ============ 🎮 互動遊戲帶領卡（全站唯一來源） ============
   原則：APP 唔係電子遊戲機。螢幕只係「帶領工具」—出題、叫位、計時、計分；
   遊戲本身係小朋友喺場內用身體玩，領袖撳掣，小朋友唔使搶住掂螢幕。
   帶領畫面嘅「點樣帶」卡、📖手冊遊戲帶領總表、🖨️遊戲帶領卡，全部讀呢張表。 */
Lead.playMeta={
  catch:{ic:'🦗',n:'草蜢跳格・實體九宮格',kind:'實體互動',
    kids:'聽到「幾號・邊個位」就跳上地上九宮格嗰一格，限時之內雙腳站定；其他人喺格外一齊數拍子。',
    lead:'撳「▶ 叫格」→ 螢幕亮一格＋叫聲＋倒數；時間到撳「✓ 站到」記分或「✗ 未去到」，再叫下一格。',
    mats:'膠紙（2 厘米闊，約 10 米）或粉筆，貼一個 3×3 九宮格，每格約 60×60 厘米、格距 10 厘米；或 A4 紙 9 張＋膠紙固定。',
    print:'floor-grid',printLabel:'🖨️ 印九宮格地貼＋玩法卡',
    safe:'一次只一組入格；跳前睇清楚腳下；著波鞋、地面乾爽；聽到「停」即刻企定唔好再跳。'},
  quiz:{ic:'🏆',n:'問答擂台・四角搶答',kind:'實體互動',
    kids:'睇住四角嘅 A／B／C／D 角牌，覺得邊個答案啱就行去嗰個角企好（或者舉起對應顏色咭）。',
    lead:'撳「🎲 下一題」出題 → 小朋友行位 → 撳「✅ 揭曉」亮出正確角 → 撳隊名記分。',
    mats:'A4 角牌 4 張（A／B／C／D）貼喺禮堂四角；冇打印就用粉筆喺地寫 A B C D。',
    print:'corner-signs',printLabel:'🖨️ 印四角角牌',
    safe:'行位唔好跑；角與角之間留返一條行人路；每題限時 10 秒就揭曉，唔好爭拗。'},
  judge:{ic:'👍',n:'對錯法庭・左右分邊',kind:'實體互動',
    kids:'聽完個案，覺得「啱」就行去 👍 嗰邊，覺得「錯」就行去 👎 嗰邊；企定先至可以講原因。',
    lead:'撳「🎲 下一案」出個案 → 小朋友分邊 → 撳「⚖️ 宣判」顯示對錯同解釋 → 請一位講點解。',
    mats:'👍／👎 大咭各 1 張貼左右兩邊牆（或用粉筆畫條中線）。',
    print:'corner-signs',printLabel:'🖨️ 印 👍👎 分邊牌',
    safe:'唔准推人埋另一邊；分邊係表態唔係比賽，輸贏唔計分都玩得開心。'},
  recycle:{ic:'♻️',n:'三色回收・四角分桶',kind:'實體互動',
    kids:'睇住螢幕出嘅物件，行去自己覺得啱嘅回收桶角（藍廢紙／黃金屬／綠塑膠／⬛ 垃圾）企好。',
    lead:'撳「🎲 換物件」→ 小朋友行位 → 撳正確嗰個桶揭曉 → 講一句回收貼士 → 記分。',
    mats:'三色桶標籤 4 張貼四角（或者直接用真回收箱＋紙箱）；有乾淨實物更好玩。',
    print:'corner-signs',printLabel:'🖨️ 印回收桶標籤',
    safe:'用實物一定要乾淨、無尖角；行位唔好跑；玻璃、針、未清洗容器一律唔用。'},
  memory:{ic:'🃏',n:'記憶配對・口講位置',kind:'實體互動',
    kids:'用口講「第 3 張同第 8 張」，全場一齊睇；配對成功全體拍手，記唔住就一齊提示。',
    lead:'叫一位小朋友講兩個位置 → 領袖撳嗰兩張揭開 → 配對到就拍手，唔到就蓋返。',
    mats:'唔使物資（用螢幕）；想實體版就印圖卡 12 張反轉放地上。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'輪流講位置，一人一回合；唔准走去揭卡，避免搶撞。'},
  moon:{ic:'🌕',n:'中秋射月・真實投擲',kind:'實體互動',
    kids:'企喺投擲線後，輪流用泡棉球／紙球拋向月亮靶；拋完即刻返隊尾。',
    lead:'撳「🎯 中咗 +1」或「❌ 冇中」記分；撳「🙋 下一位」換人。螢幕係靶同計分板，唔係俾人撳。',
    mats:'泡棉球／襪子球每人 1 個、投擲線（膠紙）、月亮靶（打印或黃色圓卡紙）。',
    print:'corner-signs',printLabel:'🖨️ 印月亮靶／投擲線',
    safe:'一次只一位喺線前；投擲方向前面清空；領袖叫「停」先至可以執球。'},
  traffic:{ic:'🚦',n:'紅綠燈',kind:'實體互動',
    kids:'綠燈大步向前行、黃燈慢動作／單腳企、紅燈即刻定格變木頭人。',
    lead:'撳紅／黃／綠燈（或「🎲 隨機」「⏱️ 自動」）；郁咗嘅就叫佢退後一步。',
    mats:'唔使物資；場地要有一條直路可以行 5–8 米。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'終點要留緩衝位，唔好對住牆／枱角；紅燈時領袖行一圈睇邊個郁。'},
  leader:{ic:'🙋',n:'領袖話',kind:'實體互動',
    kids:'聽到「領袖話——」先至做動作；冇講「領袖話」就係陷阱，做咗要坐低。',
    lead:'撳「📣 下一個指令」；先出 2–3 個真指令熱身，先至出陷阱。',
    mats:'唔使物資。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'動作唔好涉及跑跳撞；坐低嘅小朋友下一回合即刻可以返嚟（唔好淘汰到執輸）。'},
  rhythm:{ic:'🎵',n:'節奏模仿・跟拍子',kind:'實體互動',
    kids:'聽住拍子，跟住螢幕亮出嘅動作一齊做（拍手、踏步、草蜢跳…）；領袖做完全體跟。',
    lead:'揀拍子速度 → 撳「▶ 播出節奏」（有真實拍子聲）→ 全體跟做一次 → 換新節奏。',
    mats:'唔使物資；想加樂器就用膠樽裝豆做沙鎚。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'動作原地做，前後留一隻手臂距離；拍手唔好太大力傷手心。'},
  bodycard:{ic:'🛡️',n:'身體地圖紅黃綠',kind:'教學＋肢體',
    kids:'跟住領袖講嘅身體部位做手勢：綠區擊掌、黃區雙手交叉「先問清楚」、紅區雙手前推大聲「唔好！」',
    lead:'撳身體部位講解（領袖撳），或者撳「🎲 考考小朋友」抽題，等小朋友大聲答紅／黃／綠。',
    mats:'唔使物資；有嘅話用紅黃綠三色咭一人一張舉牌。',
    print:'sfh-cards',printLabel:'🖨️ 印紅黃綠圖卡',
    safe:'唔要求小朋友講私人經歷；用「顏色」答題就得，氣氛保持輕鬆安心。'},
  emotion:{ic:'😊',n:'情緒面面觀・表情操',kind:'教學＋肢體',
    kids:'跟住領袖抽到嘅表情一齊扮一次，再講一句「我幾時會咁」；學一個平復動作。',
    lead:'撳「🎲 抽表情」（或自己撳一個）→ 全體扮 → 問一句原因 → 帶一個平復方法。',
    mats:'唔使物資；有表情咭更好。',
    print:'emotion-cards',printLabel:'🖨️ 印情緒表情卡',
    safe:'唔話邊個表情唔好；唔點名要小朋友講自己嘅私人事。'},
  foodrainbow:{ic:'🌈',n:'彩虹健康飲食盤',kind:'教學＋肢體',
    kids:'領袖亮出一種顏色，小朋友講出一樣嗰色嘅食物，再用身體扮「食落肚」嘅動作。',
    lead:'撳顏色揭曉好處 → 問「今日食咗邊種顏色？」→ 數齊五色就全體拍手。',
    mats:'唔使物資；有真蔬果或圖卡就舉出嚟。',
    print:'rainbow-placemat',printLabel:'🖨️ 印彩虹餐盤底紙',
    safe:'問飲食習慣時唔好比較身形；有過敏嘅小朋友唔勉強分享。'},
  clean:{ic:'🧼',n:'洗手七步・20 秒計時',kind:'教學＋肢體',
    kids:'跟住畫面七步徒手搓手，20 秒倒數完先停；每一步跟住領袖做。',
    lead:'撳「▶ 開始 20 秒」自動逐步推进；想慢教就用「◀／▶」逐步行。',
    mats:'唔使物資（徒手操）；真洗手就喺洗手間分批去。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'徒手操唔使水，地面保持乾爽；真洗手要抹乾手先至返場。'},
  transport:{ic:'🚗',n:'交通工具大圖鑑',kind:'教學畫面',
    kids:'睇圖講特徵，跟住領袖扮一次（揸巴士、搭船、讓座），講一句安全守則。',
    lead:'撳「下一種／🎲 隨機」逐個講；每种问一句「第一樣要點做？」',
    mats:'唔使物資；有玩具車更好。',
    print:'transport-cards',printLabel:'🖨️ 印交通工具圖卡',
    safe:'扮搭車時原地做，唔好喺場內跑動扮開車。'},
  guess:{ic:'🔍',n:'估估下（剪影）',kind:'教學＋搶答',
    kids:'睇住黑色剪影，舉手搶答；答啱就全體拍手，答錯領袖再俾一個提示。',
    lead:'撳「💡 揭盅」揭答案；撳「🔀 換一個」換題。',
    mats:'唔使物資。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'舉手搶答唔好企起身推撞；答唔中都要讚佢肯猜。'},
  task:{ic:'🎯',n:'任務抽籤機・日行一善',kind:'領袖工具',
    kids:'一齊讀出抽中嘅任務，講一句「我幾時做」；返屋企實踐，下次返嚟打卡。',
    lead:'撳「🎲 轉動抽任務」；想指定就再轉。',
    mats:'唔使物資；想實體就印任務抽籤卡。',
    print:'task-cards',printLabel:'🖨️ 印任務抽籤卡',
    safe:'任務要喺家長陪同下做；唔派有危險嘅家務。'},
  roll:{ic:'🎤',n:'音樂傳球點名',kind:'實體互動',
    kids:'圍圈傳軟球；音樂／拍手停嗰陣，持球嗰位講名同一樣鍾意嘅嘢。',
    lead:'撳「⏸ 停球・抽一位」（或者自己停拍）；唔想用螢幕就用拍手「一二、一二」。',
    mats:'軟身球／氣球 1 個（襪子球都得）。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'只用軟身球、唔向人拋；坐地傳球都保持手臂距離。'},
  chute:{ic:'🌈',n:'快樂傘玩法卡',kind:'實體互動',
    kids:'執實傘邊，跟住圖同口令一齊揚傘、蹲低、換位；聽到「停」即刻停。',
    lead:'撳「🔀 抽另一式」揀一式；跟住畫面嘅位置圖同三步做。',
    mats:'快樂傘 1 張／4–5 人；有海灘波更好玩。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'傘面唔企人；留一隻手臂距離；波跌咗先放低傘再執。'},
  story:{ic:'📖',n:'故事寶盒',kind:'領袖工具',
    kids:'坐近啲聽，跟住領袖嘅問題舉手回應；可以入快樂傘帳幕入面聽。',
    lead:'撳「🔀 揀另一個」抽故事種子，照住開場提示講，講完問一題。',
    mats:'唔使物資；快樂傘做帳幕更有氣氛。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'涉及身體界線嘅故事用簡單安心嘅語句，唔要求小朋友分享私人經歷。'},
  flags:{ic:'🇭🇰',n:'國旗與區旗敬禮',kind:'教學＋肢體',
    kids:'立正站好、眼望旗幟，跟住號角行注目禮／童軍禮；完禮即放鬆。',
    lead:'撳「🇨🇳／🇭🇰／⚜️」轉旗，撳「🎺 響號敬禮」帶全體行禮。',
    mats:'唔使物資（用螢幕）；有團旗就更莊重。',
    print:'promise-poster',printLabel:'🖨️ 印誓詞・口號大字報',
    safe:'站立平穩、保持安靜莊嚴；唔強求複雜隊形，注目禮就夠。'},
  bpstory:{ic:'🏕️',n:'貝登堡故事繪本',kind:'教學畫面',
    kids:'坐近啲聽故事；聽到左握禮嗰頁，即刻伸左手同隔籬握一次。',
    lead:'撳「下一頁 ▶」逐頁講；每頁問一條問題（「你估佢哋喺島上做乜？」）。',
    mats:'唔使物資；快樂傘做帳幕更有氣氛。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'左手握手要輕，唔好拉扯；唔要求幼兒背年代，講故事就得。'},
  scoutfamily:{ic:'🌲',n:'童軍大家庭地圖',kind:'教學畫面',
    kids:'跟住領袖由小草蜢數到樂行童軍，一齊講自己支部嘅銘言「前進」。',
    lead:'撳逐個支部講年齡、徽章同銘言；講完問「你而家係邊個？」',
    mats:'唔使物資。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'安坐觀賞，輪流舉手發問；唔好比較邊個「大個得快」。'},
  breath:{ic:'🍃',n:'靜息呼吸',kind:'領袖工具',
    kids:'坐好，跟住圓圈：放大吸氣數 1-2-3-4，縮小呼氣數 1-2-3-4。',
    lead:'撳「🔄 由頭開始」；自己先用慢聲示範一次。',
    mats:'唔使物資。',
    print:'game-cards',printLabel:'🖨️ 印遊戲帶領卡',
    safe:'唔舒服可以自己正常呼吸；唔強迫閉眼、唔要求屏息。'}
};
/* 帶領畫面用：每個遊戲底部嘅「點樣帶」卡 */
Lead.playCard=function(screen){
  var m=Lead.playMeta[screen];if(!m)return '';
  var row=function(ic,t,v,extra){return '<div class="pc-row"><b>'+ic+' '+t+'</b><span>'+v+(extra||'')+'</span></div>'};
  return '<div class="play-card"><div class="pc-h">🧭 點樣帶 <span class="tag">'+esc(m.kind)+'</span></div>'+
    row('🧒','小朋友做乜（身體落場玩）',esc(m.kids))+
    row('🧑‍🏫','領袖撳乜（螢幕由你操作）',esc(m.lead))+
    row('🧺','物資／場地',esc(m.mats))+
    (m.print?row('🖨️','想做實體教具',' ','<button class="btn sm ghost" onclick="PrintKit.openModal(\''+m.print+'\')">'+esc(m.printLabel||'打印教材')+'</button>'):'')+
    row('🛡️','安全',esc(m.safe))+
    '<div class="pc-note">💡 我哋唔係打電子 GAME：螢幕只係幫你出題、叫位、計時、計分。小朋友嘅手应该喺隊友手上、地上、傘邊，唔係喺螢幕。</div></div>';
};
/* 一句提醒：呢個畫面係領袖撳嘅 */
Lead.leaderOnly=function(txt){
  return '<div class="leader-only">🧑‍🏫 領袖操作'+(txt?'：'+esc(txt):'—小朋友唔使搶住掂螢幕，用身體玩')+'</div>';
};
/* 小組計分列：實體遊戲由領袖按「邊隊贏」記分 */
Lead.scoreBar=function(){
  Lead._score=Lead._score||[{n:'🔴 紅隊',s:0},{n:'🔵 藍隊',s:0}];
  return '<div class="score-bar" id="scoreBar"><b>🥇 記分</b>'+
    Lead._score.map(function(x,i){
      return '<span class="sb-team">'+esc(x.n)+' <b>'+x.s+'</b> '+
        '<button class="btn sm" onclick="Lead.scoreAdd('+i+')">+1</button></span>';
    }).join('')+
    '<button class="btn sm ghost" onclick="Lead.scoreResetBar()">🔄 歸零</button></div>';
};
Lead.scoreAdd=function(i){
  Lead._score=Lead._score||[{n:'🔴 紅隊',s:0},{n:'🔵 藍隊',s:0}];
  if(!Lead._score[i])return;
  Lead._score[i].s++;Sfx.ding();Lead.refreshScoreBar();
};
Lead.scoreResetBar=function(){
  (Lead._score||[]).forEach(function(x){x.s=0});
  Sfx.pop();Lead.refreshScoreBar();
};
Lead.refreshScoreBar=function(){
  var el=document.getElementById('scoreBar');
  if(el&&Lead.scoreBar)el.innerHTML=Lead.scoreBar().replace(/^<div class="score-bar" id="scoreBar">/,'').replace(/<\/div>$/,'');
};

Lead.rerender=function(){
  Lead.cleanupTimers();
  var a=document.getElementById('kidsArea');
  if(a){a.innerHTML=Lead.screen(Lead.cur());if(Lead.after)Lead.after();}
};

Lead.switchToGame=function(scr){
  Lead.cleanupTimers();
  var st=Lead.cur();
  if(st)st.screen=scr;
  Lead.render();
};

Lead.promiseBig=function(){
  document.getElementById('kidsArea').innerHTML=DATA.facts.promise.concat([DATA.facts.law]).map(function(l,i){
    return '<div class="songline" id="pb'+i+'" style="opacity:.25" onclick="this.style.opacity=1;Sfx.ding()">'+esc(l)+'</div>'}).join('')+
    '<div class="mute" style="text-align:center;font-size:.85rem">撳一句亮一句,一句一句跟讀</div>';
};

Lead.songHighlight=function(i){
  DATA.facts.song.forEach(function(_,j){
    var e=document.getElementById('sg'+j);
    if(e){e.classList.toggle('on',j===i);if(j<i)e.classList.add('sung');else e.classList.remove('sung');}
  });
};

Lead.songTick=function(){Music.play()};
Lead.songStop=function(){Music.stop()};
Lead.songTempo=function(k){
  var t=Music.setTempo(k);
  Lead.rerender();
  toast('🎵 速度：'+t.n+'・'+t.bpm+' BPM'+(Music.playing?'（已重新播放）':''));
};
Lead.songOpt=function(k){
  Music[k]=!Music[k];
  Lead.rerender();
  toast(k==='countIn'?(Music.countIn?'🥁 會先數 4 拍先入':'唔數拍，即刻開始'):(Music.chords?'🎹 加咗和弦伴奏':'淨旋律（冇和弦）'));
};
/* 🥁 拍子器嘅畫面反饋 */
Lead.metroBeat=function(n,per,strong){
  var el=document.getElementById('metroDots');
  if(n<0){if(el)el.innerHTML='';return;}
  if(el){
    var total=per||Music.metro.per||4,i=((n-1)%total)+1;
    el.innerHTML=Array.apply(null,Array(total)).map(function(_,j){
      return '<span class="mdot'+(j+1===i?' on':'')+(j===0?' first':'')+'"></span>'}).join('')+
      '<b style="margin-left:8px">第 '+n+' 拍</b>';
  }
  var big=document.getElementById('brh');
  if(big&&Music.metro.on)big.style.opacity=strong?'1':'.6';
};

/* 身體地圖紅黃綠互動 */
Lead.bodyPick=function(idx){
  var b=DATA.bodyParts[idx];if(!b)return;
  var banner=document.getElementById('bodyCardBanner');
  if(banner){
    banner.className='tl-action-banner '+(b.c==='red'?'rd':b.c==='yellow'?'am':'gr');
    banner.innerHTML='<b>'+b.tag+'：'+esc(b.n)+'</b><br><small>'+esc(b.desc)+'</small>';
  }
  b.c==='red'?Sfx.wrong():b.c==='yellow'?Sfx.pop():Sfx.ding();
};
Lead.bodyTest=function(){
  var idx=Math.floor(Math.random()*DATA.bodyParts.length);
  var b=DATA.bodyParts[idx];
  var banner=document.getElementById('bodyCardBanner');
  if(banner){
    banner.className='tl-action-banner am';
    banner.innerHTML='❓ <b>考考你：『'+esc(b.n)+'』係咩顏色區域？</b><small>小朋友大聲判斷：紅、黃、定係綠？</small>';
  }
  Sfx.pop();
};

/* 三色回收：領袖揭曉正確桶（小朋友已經企好位） */
Lead.recycleReveal=function(binColor){
  var item=Lead._recCur;if(!item||Lead._recShown)return;
  Lead._recShown=true;
  ['blue','yellow','green','trash'].forEach(function(c){
    var el=document.getElementById('bin'+c);
    if(el)el.classList.add(c===item.t?'ok':'dim');
  });
  var tip=document.getElementById('recTip');
  if(tip){
    tip.className='tl-action-banner gr';
    tip.innerHTML='🎉 <b>正確答案：'+esc(item.bin)+'</b><br><small>'+esc(item.tip)+'</small><br><small>企喺呢個角嘅小童軍—全體拍手！</small>';
  }
  Lead._recScore=(Lead._recScore||0)+1;
  var sc=document.getElementById('recSc');if(sc)sc.textContent='全場答對: '+Lead._recScore+' 件';
  Sfx.fanfare();
};
Lead.nextRecycle=function(){
  Lead._recCur=DATA.recycleItems[Math.floor(Math.random()*DATA.recycleItems.length)];
  Lead._recShown=false;
  var it=document.getElementById('recItem');if(it)it.textContent=Lead._recCur.n;
  ['blue','yellow','green','trash'].forEach(function(c){
    var el=document.getElementById('bin'+c);
    if(el){el.classList.remove('ok');el.classList.remove('dim');}
  });
  var tip=document.getElementById('recTip');
  if(tip){tip.className='tl-action-banner am';tip.textContent='🚶 行去你覺得啱嘅角・企定・數到 10 領袖就揭曉';}
  Sfx.pop();
};

/* 國旗區旗展示 */
Lead.flagShow=function(idx){
  Lead._flagIdx=idx;
  var flags=[
    {ic:'🇨🇳',t:'中華人民共和國國旗 (五星紅旗)',d:'五星紅旗紅色代表革命，大五星代表團結，四顆小星圍繞象徵全國各界人民。'},
    {ic:'🇭🇰',t:'香港特別行政區區旗',d:'紅底洋紫荊花，五片花瓣各有一顆星，象徵香港是中國不可分割的一部分，在祖國懷抱中蓬勃發展。'},
    {ic:'⚜️',t:'香港童軍總會會旗 (Scout Flag)',d:'金黃色鳶尾花徽號代表三條童軍誓詞，象徵童軍團結、服務與前進。'}
  ];
  var f=flags[idx]||flags[0];
  var ic=document.getElementById('flagIcon');if(ic)ic.textContent=f.ic;
  var tt=document.getElementById('flagTitle');if(tt)tt.textContent=f.t;
  var dc=document.getElementById('flagDesc');if(dc)dc.textContent=f.d;
  Sfx.ding();
};

/* 洗手七步計時 */
/* 洗手七步：領袖逐步推進（慢教用） */
Lead.cleanPick=function(idx){
  var w=DATA.washSteps[idx];if(!w)return;
  Lead._cleanStep=idx;
  document.querySelectorAll('.clean-card').forEach(function(c,i){c.classList.toggle('on',i===idx)});
  Sfx.pop();
};
Lead.cleanStep=function(d){
  if(Lead._cleanIv){clearInterval(Lead._cleanIv);Lead._cleanIv=null;}
  var n=DATA.washSteps.length;
  var i=((Lead._cleanStep||0)+d+n)%n;
  Lead.cleanPick(i);
  var btn=document.getElementById('cleanBtn');
  if(btn){btn.disabled=false;btn.textContent='▶ 開始 20秒洗手歌與計時';}
};
Lead.cleanStart=function(){
  if(Lead._cleanIv)clearInterval(Lead._cleanIv);
  var btn=document.getElementById('cleanBtn');if(btn){btn.disabled=true;btn.textContent='🧼 洗手中...';}
  var left=20;Lead._cleanStep=0;
  var tmr=document.getElementById('cleanTmr');
  Lead._cleanIv=setInterval(function(){
    left--;
    if(tmr)tmr.textContent='倒數 '+left+'秒';
    var step=Math.floor((20-left)/3)%7;
    document.querySelectorAll('.clean-card').forEach(function(c,i){c.classList.toggle('on',i===step)});
    if(left<=0){
      clearInterval(Lead._cleanIv);Lead._cleanIv=null;
      if(tmr)tmr.textContent='✓ 洗手完成！';
      if(btn){btn.disabled=false;btn.textContent='▶ 再嚟一次 20秒洗手';}
      Sfx.fanfare();
      toast('雙手洗得乾乾淨淨！好嘢！');
    } else {
      Sfx.tick();
    }
  },1000);
};

/* 情緒面面觀 */
Lead.emoPick=function(idx){
  var e=DATA.emotions[idx];if(!e)return;
  var banner=document.getElementById('emoBanner');
  if(banner){
    banner.className='tl-action-banner gr';
    banner.innerHTML='<b>'+e.ic+' '+esc(e.n)+'</b>：'+esc(e.say)+'<br><small>💡 領袖提示：'+esc(e.how)+'</small>';
  }
  Sfx.ding();
};
Lead.emoRandom=function(){
  var idx=Math.floor(Math.random()*DATA.emotions.length);
  Lead.emoPick(idx);
};

/* 任務抽籤機 */
Lead.taskSpin=function(){
  var box=document.getElementById('taskBox');
  var ic=document.getElementById('taskIc');
  var tt=document.getElementById('taskTitle');
  var dc=document.getElementById('taskDesc');
  var btn=document.getElementById('taskBtn');
  if(btn){btn.disabled=true;btn.textContent='🎲 正在抽籤...';}
  var n=0;
  if(Lead._taskIv)clearInterval(Lead._taskIv);
  var pick=DATA.tasks[Math.floor(Math.random()*DATA.tasks.length)];
  Lead._taskIv=setInterval(function(){
    var rand=DATA.tasks[Math.floor(Math.random()*DATA.tasks.length)];
    if(ic)ic.textContent=rand.ic;
    if(tt)tt.textContent=rand.t;
    if(dc)dc.textContent=rand.d;
    Sfx.pop();
    if(++n>16){
      clearInterval(Lead._taskIv);Lead._taskIv=null;
      if(ic)ic.textContent=pick.ic;
      if(tt)tt.textContent=pick.t;
      if(dc)dc.textContent=pick.d;
      if(btn){btn.disabled=false;btn.textContent='🎲 再抽一個任務！';}
      Sfx.fanfare();
    }
  },80);
};

/* 貝登堡故事卡 */
Lead.bpShow=function(page){
  Lead._bpPage=page;
  var card=DATA.bpStory[page];if(!card)return;
  var ic=document.getElementById('bpIc');if(ic)ic.textContent=card.ic;
  var tt=document.getElementById('bpTitle');if(tt)tt.textContent=card.t;
  var dc=document.getElementById('bpDesc');if(dc)dc.textContent=card.d;
  var ind=document.getElementById('bpPageIndicator');if(ind)ind.textContent=(page+1)+' / '+DATA.bpStory.length;
  Sfx.ding();
};
Lead.bpNext=function(){
  var next=(Lead._bpPage+1)%DATA.bpStory.length;
  Lead.bpShow(next);
};
Lead.bpPrev=function(){
  var prev=(Lead._bpPage-1+DATA.bpStory.length)%DATA.bpStory.length;
  Lead.bpShow(prev);
};

/* 童軍大家庭分支點選 */
Lead.scoutPick=function(idx){
  var s=DATA.scoutFamily[idx];if(!s)return;
  toast(s.s+'：'+s.motto);
  Sfx.ding();
};

/* 彩虹食物 */
Lead.foodPick=function(idx){
  var f=DATA.foodRainbow[idx];if(!f)return;
  var banner=document.getElementById('foodBanner');
  if(banner){
    banner.className='tl-action-banner gr';
    banner.innerHTML='<b>'+esc(f.n)+'</b>：'+esc(f.ex)+'<br><small>💪 好處：'+esc(f.benefit)+'</small>';
  }
  Sfx.ding();
};

/* 交通工具 */
Lead.tpShow=function(idx){
  Lead._tpIdx=idx;
  var tp=DATA.transports[idx];if(!tp)return;
  var ic=document.getElementById('tpIc');if(ic)ic.textContent=tp.ic;
  var tt=document.getElementById('tpTitle');if(tt)tt.textContent=tp.n;
  var wh=document.getElementById('tpWhere');if(wh)wh.textContent=tp.where;
  var rl=document.getElementById('tpRule');if(rl)rl.textContent=tp.rule;
  Sfx.ding();
};
Lead.tpNext=function(){
  var next=(Lead._tpIdx+1)%DATA.transports.length;
  Lead.tpShow(next);
};
Lead.tpPrev=function(){
  var prev=(Lead._tpIdx-1+DATA.transports.length)%DATA.transports.length;
  Lead.tpShow(prev);
};
Lead.tpRandom=function(){
  var idx=Math.floor(Math.random()*DATA.transports.length);
  Lead.tpShow(idx);
};

/* 🌕 中秋射月：領袖記分（小朋友真實投擲） */
Lead.moonHit=function(){
  Lead._moonScore=(Lead._moonScore||0)+1;
  var sc=document.getElementById('moonSc');if(sc)sc.textContent='命中: '+Lead._moonScore+' 次';
  var msg=document.getElementById('moonMsg');
  if(msg){msg.className='tl-action-banner gr';msg.innerHTML='🎉 <b>百步穿楊！命中大月亮！</b>（全場累計 '+Lead._moonScore+' 次）';}
  var mt=document.getElementById('moonTarget');if(mt)mt.classList.add('hit');
  Sfx.fanfare();
};
Lead.moonMiss=function(){
  var msg=document.getElementById('moonMsg');
  if(msg){msg.className='tl-action-banner am';msg.innerHTML='💪 差啲啫！調整下手勢—腳留喺線後，眼睛望住月亮。';}
  Sfx.pop();
};
Lead.moonNext=function(){
  Lead._moonTurn=(Lead._moonTurn||0)+1;
  var mt=document.getElementById('moonTarget');if(mt)mt.classList.remove('hit');
  var msg=document.getElementById('moonMsg');
  if(msg){msg.className='tl-action-banner am';msg.innerHTML='🙋 第 '+Lead._moonTurn+' 位上線—其他人退後一步等。';}
  Sfx.ding();
};
Lead.moonReset=function(){
  Lead._moonScore=0;Lead._moonTurn=0;
  var sc=document.getElementById('moonSc');if(sc)sc.textContent='命中: 0 次';
  var msg=document.getElementById('moonMsg');
  if(msg){msg.className='tl-action-banner am';msg.textContent='📏 投擲線離靶 1.5–2 米・腳留喺線後・每人 3 球';}
  var mt=document.getElementById('moonTarget');if(mt)mt.classList.remove('hit');
  toast('分數已歸零');
};

/* 快樂傘換一式 */
Lead.nextChute=function(){
  var current=Lead._curChuteIdx||0;
  var next=(current+1+Math.floor(Math.random()*(DATA.chute.length-1)))%DATA.chute.length;
  var st=Lead.cur();
  if(st)st.chuteIndex=next;
  Lead.rerender();
};

/* 音樂傳球點名 */
Lead.roll=function(){
  var names=Lead._pool||['小童軍'];
  var out=document.getElementById('rollOut');
  var prompt=document.getElementById('rollPrompt');
  var btn=document.getElementById('rollBtn');
  if(!out)return;
  if(Lead._rollIv)clearInterval(Lead._rollIv);
  if(btn){btn.disabled=true;btn.style.opacity=.5;}
  var pick=names[Math.floor(Math.random()*names.length)];
  var n=0;
  Lead._rollIv=setInterval(function(){
    out.textContent=names[Math.floor(Math.random()*names.length)];
    Sfx.pop();
    if(++n>16){
      clearInterval(Lead._rollIv);
      Lead._rollIv=null;
      out.textContent=pick;
      if(prompt)prompt.innerHTML='🎉 <b>到「'+esc(pick)+'」！</b> 請講出名字 ＋ 一樣最鍾意嘅嘢！<br>全體齊講：「'+esc(pick)+'，你好！」';
      if(btn){btn.disabled=false;btn.style.opacity=1;}
      Sfx.fanfare();
    }
  },85);
};

/* 問答擂台：揭曉正確角（小朋友已經行晒位，領袖先至揭） */
Lead.quizReveal=function(){
  var c=Lead._quizCur;if(!c||c.shown)return;
  c.shown=true;
  var i=c.opts.indexOf(c.a),L=['A','B','C','D'];
  c.opts.forEach(function(o,j){
    var el=document.getElementById('qo'+j);
    if(el)el.classList.add(j===i?'ok':'dim');
  });
  var ex=document.getElementById('quizExplain');
  if(ex)ex.innerHTML='<div class="reveal-line">✅ 正確答案：<b>'+L[i]+'・'+esc(c.a)+'</b>　企喺 '+L[i]+' 角嘅小童軍，全體拍手！</div>';
  Sfx.fanfare();
};

/* 對錯法庭：宣判（分邊已完成，領袖揭曉＋講解） */
Lead.judgeReveal=function(){
  var j=Lead._judgeCur;if(!j||Lead._judgeShown)return;
  Lead._judgeShown=true;
  var yes=document.getElementById('jsYes'),no=document.getElementById('jsNo');
  if(j.g===1){if(yes)yes.classList.add('ok');if(no)no.classList.add('dim');}
  else{if(no)no.classList.add('ok');if(yes)yes.classList.add('dim');}
  Sfx.fanfare();
  var exp=document.getElementById('judgeExp');
  if(exp){
    exp.innerHTML='<div class="reveal-line">'+(j.g?'👍 呢件事<b>啱</b>':'👎 呢件事<b>唔應該</b>')+'：'+esc(j.w)+
      '</div><div class="mute" style="font-size:.95rem;margin-top:6px">🎤 請一位企啱嗰邊嘅小童軍講一句「點解」。</div>';
  }
};

/* 估估下 */
Lead.guessReveal=function(){
  var cur=Lead._guessCur;if(!cur||cur.revealed)return;
  cur.revealed=true;
  var gz=document.getElementById('gz');if(gz)gz.style.filter='none';
  var gzt=document.getElementById('gzt');if(gzt)gzt.innerHTML='🎉 答案係：<b>'+esc(cur.name)+'</b> '+cur.emoji;
  var btn=document.getElementById('gzBtn');if(btn){btn.disabled=true;btn.style.opacity=.5;}
  Sfx.fanfare();
};

/* 記憶配對：領袖揭卡（小朋友口講位置） */
Lead.memFlip=function(i){
  var m=Lead._mem;if(!m||m.lock||m.open.indexOf(i)>=0||m.done.indexOf(i)>=0)return;
  var el=document.getElementById('mo'+i);if(!el)return;
  el.classList.remove('flip');el.innerHTML='<span class="mon-no">'+(i+1)+'</span>'+m.cards[i];Sfx.pop();
  m.open.push(i);
  if(m.open.length===2){
    m.lock=true;var a=m.open[0],b=m.open[1];
    if(m.cards[a]===m.cards[b]){
      setTimeout(function(){
        [a,b].forEach(function(x){
          var e=document.getElementById('mo'+x);
          if(e)e.classList.add('hit');
          m.done.push(x);
        });
        Sfx.ding();m.open=[];m.lock=false;
        var pairs=m.done.length/2;
        var prog=document.getElementById('memProgress');
        if(prog)prog.textContent='進度: '+pairs+'/'+m.totalPairs+' 對';
        if(pairs===m.totalPairs){
          Sfx.fanfare();
          var st=document.getElementById('memStatus');
          if(st)st.innerHTML='🎉 <b>全部配對成功！小童軍記憶力超強！</b>';
        }
      },420);
    }else{
      setTimeout(function(){
        [a,b].forEach(function(x){
          var e=document.getElementById('mo'+x);
          if(e){e.classList.add('flip');e.innerHTML='<span class="mon-no">'+(x+1)+'</span>?';}
        });
        Sfx.wrong();m.open=[];m.lock=false;
      },900);
    }
  }
};
Lead.memCover=function(){
  var m=Lead._mem;if(!m)return;
  m.cards.forEach(function(c,i){
    if(m.done.indexOf(i)>=0)return;
    var e=document.getElementById('mo'+i);
    if(e){e.classList.add('flip');e.innerHTML='<span class="mon-no">'+(i+1)+'</span>?';}
  });
  m.open=[];m.lock=false;
  Sfx.pop();
};

/* 領袖話 */
Lead.ldrGo=function(){
  var cmds=Lead._ldrCmds||[{cmd:'摸鼻',say:'摸鼻！'}];
  var isTrue=Math.random()<.62;
  var c=cmds[Math.floor(Math.random()*cmds.length)];
  var box=document.getElementById('ldrBox');
  var cmdEl=document.getElementById('ldrCmd');
  var hintEl=document.getElementById('ldrHint');
  if(!cmdEl)return;
  if(isTrue){
    if(box)box.className='ldr-banner true';
    cmdEl.textContent='📢 領袖話——' + c.cmd + '！';
    if(hintEl)hintEl.innerHTML='<span style="color:#2e7d32;font-weight:700">✓ 有講「領袖話」，大家快啲跟住做！</span>';
    Sfx.ding();
  } else {
    if(box)box.className='ldr-banner trap';
    cmdEl.textContent='🤫 ' + c.cmd + '！';
    if(hintEl)hintEl.innerHTML='<span style="color:#c62828;font-weight:700">❌ 陷阱！（冇講「領袖話」）千祈唔好郁！郁咗要坐低！</span>';
    Sfx.wrong();
  }
};

/* 紅綠燈 */
Lead.tl=function(c,silent){
  if(!c)return Lead.tlRandom();
  Lead._tl=c;
  ['tlr','tla','tlg'].forEach(function(id){
    var e=document.getElementById(id);
    if(e)e.classList.remove('on');
  });
  var map={red:'tlr',amber:'tla',green:'tlg'};
  var target=document.getElementById(map[c]);
  if(target)target.classList.add('on');

  var actionEl=document.getElementById('tlAction');
  if(actionEl){
    actionEl.className='tl-action-banner '+(c==='red'?'rd':c==='amber'?'am':'gr');
    if(c==='red'){
      actionEl.innerHTML='🔴 <b>紅燈！停！定格！唔准郁！</b><small>誰動了要退後一步／舉手做小草蜢！</small>';
    } else if(c==='amber'){
      actionEl.innerHTML='🟡 <b>黃燈！慢動作／單腳企！</b><small>慢慢行或單腳企穩！</small>';
    } else {
      actionEl.innerHTML='🟢 <b>綠燈！大步向前行！</b><small>小童軍向前進！</small>';
    }
  }
  if(!silent){
    if(c==='red')Sfx.wrong();
    else if(c==='amber')Sfx.pop();
    else Sfx.ding();
  }
};

Lead.tlRandom=function(){
  var colors=['red','amber','green'];
  var current=Lead._tl||'green';
  var available=colors.filter(function(x){return x!==current});
  var next=available[Math.floor(Math.random()*available.length)];
  Lead.tl(next);
};

Lead.tlToggleAuto=function(){
  if(Lead._tlTimer){
    clearInterval(Lead._tlTimer);
    Lead._tlTimer=null;
    var btn=document.getElementById('tlAutoBtn');
    if(btn)btn.textContent='⏱️ 自動隨機: 關';
    toast('已停止自動轉燈');
  } else {
    var btn=document.getElementById('tlAutoBtn');
    if(btn)btn.textContent='⏸️ 自動隨機: 開';
    toast('已開啟自動轉燈 (每3秒隨機切換)');
    Lead.tlRandom();
    Lead._tlTimer=setInterval(function(){
      Lead.tlRandom();
    },3000);
  }
};

/* 🦗 草蜢跳格：實體九宮格狀態機（螢幕叫位・小朋友跳・領袖記分） */
Lead.gridReset=function(){
  var prev=Lead._grid||{};
  Lead._grid={ready:true,sec:prev.sec||3,rounds:prev.rounds||8,mode:prev.mode||'all',
    round:0,ok:0,target:-1,last:-1,team:0,left:0};
  if(Lead._gridIv){clearInterval(Lead._gridIv);Lead._gridIv=null;}
};
Lead.gridPos=function(i){return ['左上','中上','右上','左中','正中','右中','左下','中下','右下'][i]||''};
Lead.gridSet=function(k,v){
  var G=Lead._grid;if(!G)return;
  if(k==='sec')v=Math.max(1,Math.min(30,Math.round(+v)||3));
  G[k]=v;
  Lead.rerender();
  toast(k==='sec'?('⏱️ 每格限時 '+G.sec+' 秒'):k==='rounds'?('🔁 共 '+G.rounds+' 回合'):(G.mode==='team'?'🎯 分組接力計分：每格輪一隊':'🎯 全體一齊跳'));
};
Lead.gridMsg=function(t,c){
  var m=document.getElementById('gdMsg');
  if(m){m.className='tl-action-banner '+(c||'am');m.innerHTML=t;}
};
Lead.gridShow=function(up){
  var G=Lead._grid;if(!G)return;
  for(var i=0;i<9;i++){
    var e=document.getElementById('ho'+i);if(!e)continue;
    e.classList.toggle('up',!!up&&i===G.target);
    e.innerHTML='<b>'+(i+1)+'</b><small>'+Lead.gridPos(i)+'</small>'+((!!up&&i===G.target)?'<span class="gh-ic">🦗</span>':'');
  }
};
Lead.gridCall=function(){
  var G=Lead._grid;if(!G||G.target<0)return;
  Sfx.hop();
  Lead.gridMsg('🦗 跳去 <b style="font-size:1.8rem">'+(G.target+1)+' 號・'+Lead.gridPos(G.target)+'</b>！','am');
};
Lead.gridGo=function(){
  var G=Lead._grid;if(!G)return;
  if(Lead._gridIv){clearInterval(Lead._gridIv);Lead._gridIv=null;}
  if(G.round>=G.rounds){G.round=0;G.ok=0;G.team=0;Lead._score=(Lead._score||[]).map(function(x){return {n:x.n,s:0}});}
  var t;do{t=Math.floor(Math.random()*9)}while(t===G.last);
  G.last=t;G.target=t;G.round++;G.left=G.sec;
  Lead.gridShow(true);
  Sfx.hop();
  Lead.gridMsg('🦗 <b style="font-size:2.2rem">'+(t+1)+' 號・'+Lead.gridPos(t)+'</b><br>跳上去！<b>'+G.sec+'</b> 秒','am');
  var r=document.getElementById('gdRound');if(r)r.textContent='第 '+G.round+'/'+G.rounds+' 回合';
  Lead._gridIv=setInterval(function(){
    G.left--;
    if(G.left>0){
      Sfx.tick();
      Lead.gridMsg('🦗 <b style="font-size:1.6rem">'+(G.target+1)+' 號・'+Lead.gridPos(G.target)+'</b>　<b style="font-size:2.6rem">'+G.left+'</b>','am');
    }else{
      clearInterval(Lead._gridIv);Lead._gridIv=null;
      Sfx.alarm();
      Lead.gridMsg('⏰ 時間到！'+(G.mode==='team'?'撳「✓ 站到咗」或「✗ 未去到」記分':'站到嘅全體拍手！準備下一格'),'rd');
    }
  },1000);
};
Lead.gridMark=function(ok){
  var G=Lead._grid;if(!G)return;
  if(Lead._gridIv){clearInterval(Lead._gridIv);Lead._gridIv=null;}
  Lead.gridShow(false);
  var btn=document.getElementById('gdGo');
  if(ok){
    G.ok++;
    if(G.mode==='team'){
      Lead._score=Lead._score||[{n:'🔴 紅隊',s:0},{n:'🔵 藍隊',s:0}];
      var tm=Lead._score[G.team%Lead._score.length];
      if(tm)tm.s++;
      G.team++;
      Lead.refreshScoreBar();
    }
    Sfx.pop();
    Lead.gridMsg('✅ 好嘢！站到咗（今場成功 <b>'+G.ok+'</b> 次）'+(G.round>=G.rounds?'':'・撳「▶ 叫下一格」'),'gr');
  }else{
    Sfx.wrong();
    Lead.gridMsg('💪 未去到都唔緊要—聽清楚「幾號・邊個位」再嚟！','am');
  }
  if(G.round>=G.rounds){
    Sfx.fanfare();
    Lead.gridMsg('🎉 完場！'+G.rounds+' 格玩晒'+(G.mode==='team'?'・睇下計分板邊隊贏':'・成功 <b>'+G.ok+'</b> 次')+'，全體拍手！','gr');
    if(btn)btn.textContent='🔄 再玩一次';
  }else if(btn)btn.textContent='▶ 叫下一格';
};
Lead.gridStop=function(){
  if(Lead._gridIv){clearInterval(Lead._gridIv);Lead._gridIv=null;}
  var G=Lead._grid;if(G)G.target=-1;
  Lead.gridShow(false);
  Lead.gridMsg('⏹ 停咗。撳「▶ 叫格」再玩。','am');
};

/* 節奏模仿：用 AudioContext 排期發聲，畫面用同一套時間高亮 */
Lead.rhBpm=function(v){
  var R=Lead._rhythm;if(!R)return;
  R.bpm=v;Lead.rerender();toast('🥁 拍子 '+v+' BPM');
};
Lead.rhSound=function(kind,at){
  switch(kind){
    case 'clap':Sfx.toneAt(1200,at,.06,'square',.28);Sfx.toneAt(2400,at+.01,.05,'square',.16);break;
    case 'stomp':Sfx.toneAt(90,at,.18,'sine',.5);break;
    case 'hop':Sfx.toneAt(660,at,.08,'triangle',.3);Sfx.toneAt(990,at+.09,.1,'triangle',.3);break;
    case 'cheer':[523,659,784].forEach(function(f,i){Sfx.toneAt(f,at+i*.06,.16,'sine',.24)});break;
    case 'drum':Sfx.toneAt(150,at,.2,'triangle',.45);break;
    default:Sfx.click(at,true);
  }
};
Lead.rhPlay=function(cb){
  var R=Lead._rhythm;if(!R||R.playing)return;
  R.playing=true;R.step=-1;
  if(Lead._rhTimers){Lead._rhTimers.forEach(function(t){clearTimeout(t)})}
  Lead._rhTimers=[];
  var btn=document.getElementById('rhPlayBtn');
  if(btn){btn.disabled=true;btn.textContent='🥁 播放中…';}
  var beat=60/(R.bpm||100);
  for(var i=0;i<R.pat.length;i++){
    var e=document.getElementById('rhp'+i);
    if(e){e.textContent='❓';e.classList.remove('on');}
  }
  try{
    var c=Sfx.ac(),start=c.currentTime+.15,off=start-c.currentTime;
    R.pat.forEach(function(x,i){
      Lead.rhSound(x.s,start+i*beat);
      Lead._rhTimers.push(setTimeout(function(){
        var el=document.getElementById('rhp'+i);
        if(el){el.textContent=x.t;el.classList.add('on');}
        R.step=i;
      },(off+i*beat)*1000));
    });
    Lead._rhTimers.push(setTimeout(function(){
      R.playing=false;
      var b=document.getElementById('rhPlayBtn');
      if(b){b.disabled=false;b.textContent='▶ 再播一次';}
      var m=document.getElementById('rhMsg');
      if(m){m.className='tl-action-banner gr';m.innerHTML='👏 而家全體跟住做一次—領袖帶，小朋友跟！';}
      if(typeof cb==='function')cb();else Sfx.fanfare();
    },(off+R.pat.length*beat)*1000));
  }catch(e){
    R.playing=false;
    if(btn){btn.disabled=false;btn.textContent='▶ 播出節奏（有拍子聲）';}
  }
};
Lead.rhEcho=function(){
  var m=document.getElementById('rhMsg');
  if(m){m.className='tl-action-banner am';m.innerHTML='📣 預備——聽到拍子就跟住做！';}
  Lead.rhPlay();
};

/* 靜息呼吸 */
Lead.brhTick=function(re){
  var b=document.getElementById('brh');if(!b)return;
  if(Lead._brhIv)clearInterval(Lead._brhIv);
  var big=true;
  b.style.transform='scale(1)';b.textContent='吸~~~';
  Sfx.pop();
  Lead._brhIv=setInterval(function(){
    big=!big;
    var el=document.getElementById('brh');
    if(!el){clearInterval(Lead._brhIv);Lead._brhIv=null;return;}
    el.style.transform=big?'scale(1)':'scale(.62)';
    el.textContent=big?'吸~~~':'呼~~~';
    Sfx.pop();
  },4000);
};

/* ================= 工具箱 ================= */
Lead.tools=function(tab){
  var mem=(Store.get('members',[])||[]).map(function(m){return m.n});
  var t=tab||'wheel';
  var tabs=[['wheel','🎡 抽籤'],['group','👥 分組'],['score','🥇 計分'],['cd','⏳ 倒數'],['metro','🥁 拍子'],['sfx','📣 音效'],['breath','🍃 呼吸'],['check','🧭 檢查表']];
  var body=Lead.toolBody(t,mem);
  Lead.closeTools();
  var w=document.createElement('div');w.className='toolwrap';
  w.innerHTML='<div class="toolbox"><h3><span>🧰 領袖工具</span><button class="iconbtn" style="background:#ffe0b2" onclick="Lead.closeTools()">✕</button></h3>'+
    '<div style="margin:6px 0">'+tabs.map(function(x){return '<span class="pill'+(x[0]===t?' on':'')+'" onclick="Lead.tools(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>'+
    '<div id="toolBody">'+body+'</div>'+
    (mem.length?'':'<div class="mute" style="font-size:.78rem;margin-top:8px">💡 加咗團員名單(🏅追蹤)之後,抽籤/分組會自動用返啲名。</div>')+'</div>';
  w.onclick=function(e){if(e.target===w)Lead.closeTools()};
  document.getElementById('leadroot').appendChild(w);
  if(t==='breath')Lead.brhTick(true);
};

Lead.closeTools=function(){
  if(Lead._spinIv){clearInterval(Lead._spinIv);Lead._spinIv=null;}
  if(Lead._cdIv){clearInterval(Lead._cdIv);Lead._cdIv=null;}
  document.querySelectorAll('.toolwrap').forEach(function(w){w.remove()});
};

Lead.toolBody=function(t,mem){
  var names=mem.length?mem:['小明','小美','阿力','阿詩','子朗','恩恩'];
  if(t==='check')return Kit.checkToolHtml(Lead.S?Lead.S.meet:null);
  if(t==='wheel')return '<input type="text" id="whN" value="'+esc(names.join(','))+'" placeholder="名單(逗號分隔)"><div class="wheel" id="whl"><b id="whName">🎲</b></div>'+
    '<div class="btns" style="justify-content:center"><button class="btn" onclick="Lead.spin()">🎡 轉!</button></div>';
  if(t==='group')return '<div class="btns"><span class="pill" onclick="Lead.grp(2)">2組</span><span class="pill" onclick="Lead.grp(3)">3組</span><span class="pill" onclick="Lead.grp(4)">4組</span></div><div id="grpOut"><div class="mute">撳上面揀組數</div></div>';
  if(t==='score'){Lead._score=Lead._score||[{n:'紅隊',s:0},{n:'藍隊',s:0}];
    return '<div id="scOut">'+Lead._score.map(function(x,i){return '<div class="scorerow"><span>'+esc(x.n)+'</span><span><button class="btn sm" onclick="Lead.sc('+i+',-1)">➖</button> <b>'+x.s+'</b> <button class="btn sm" onclick="Lead.sc('+i+',1)">➕</button></span></div>'}).join('')+'</div>'+
    '<div class="btns"><button class="btn sm ghost" onclick="Lead.addTeam()">➕ 加一隊</button>'+
    '<button class="btn sm ghost" onclick="Lead.resetScore()">🔄 歸零</button></div>';
  }
  if(t==='cd')return '<div class="big" style="text-align:center" id="cdD">⏳ 60</div><div class="btns" style="justify-content:center">'+
    [30,60,120,300].map(function(x){return '<span class="pill" onclick="Lead.cd('+x+')">'+(x<60?x+'秒':(x/60)+'分鐘')+'</span>'}).join('')+'</div>';
  if(t==='metro')return '<div class="metro-box"><div class="metro-dots" id="metroDots"></div>'+
    '<div class="btns" style="justify-content:center">'+[80,100,120,140].map(function(x){
      return '<button class="btn sm'+(Music.metro.bpm===x?' gr':' ghost')+'" onclick="Music.metro.start('+x+',4)">🥁 '+x+' BPM</button>'}).join('')+'</div>'+
    '<div class="btns" style="justify-content:center;margin-top:6px">'+
      '<button class="btn sm ghost" onclick="Music.metro.start(Music.metro.bpm,2)">2 拍（揚傘用）</button>'+
      '<button class="btn sm ghost" onclick="Music.metro.start(Music.metro.bpm,3)">3 拍（跳舞用）</button>'+
      '<button class="btn sm rd" onclick="Music.metro.stop()">⏹ 停</button></div>'+
    '<div class="mute" style="font-size:.78rem;text-align:center;margin-top:6px">快樂傘數拍、節奏模仿、跳格倒數都用得；第 1 拍聲重啲，跟住數就整齊。</div></div>';
  if(t==='sfx')return '<div class="sfxgrid">'+
    [['ding','🔔 叮'],['pop','🫧 波'],['fanfare','🎉 恭喜'],['tick','⏱️ 嘀'],['wrong','❌ 錯了'],['alarm','⏰ 時間到']].map(function(x){
      return '<button class="sfx" onclick="Sfx.'+x[0]+'()"><b>'+x[1].split(' ')[0]+'</b>'+x[1].split(' ')[1]+'</button>'}).join('')+'</div>'+
    '<div class="btns" style="margin-top:8px"><span class="pill'+(Sfx.on?' on':'')+'" onclick="Sfx.on=!Sfx.on;this.classList.toggle(\'on\')">'+(Sfx.on?'🔊 音效開':'🔇 音效關')+'</span></div>';
  if(t==='breath')return '<div class="breath" id="brh">吸~~~</div><div class="mute" style="text-align:center">投影俾全體跟住一齊唞氣</div>';
  return '';
};

Lead.spin=function(){
  var names=(document.getElementById('whN').value||'').split(/[,、]/).map(function(x){return x.trim()}).filter(Boolean);
  if(!names.length){toast('請填寫最少一個名字');return;}
  var w=document.getElementById('whl'),o=document.getElementById('whName');
  var pick=names[Math.floor(Math.random()*names.length)];
  Lead._wheelDeg=(Lead._wheelDeg||0)+1440+Math.floor(Math.random()*360);
  if(w)w.style.transform='rotate('+Lead._wheelDeg+'deg)';
  var n=0;
  if(Lead._spinIv)clearInterval(Lead._spinIv);
  Lead._spinIv=setInterval(function(){
    if(o)o.textContent=names[Math.floor(Math.random()*names.length)];
    if(++n>22){
      clearInterval(Lead._spinIv);
      Lead._spinIv=null;
      if(o)o.textContent=pick;
      Sfx.fanfare();
    }
  },80);
};

Lead.grp=function(k){
  var mem=(Store.get('members',[])||[]).map(function(m){return m.n});
  var names=(mem.length?mem:['小明','小美','阿力','阿詩','子朗','恩恩']).slice().sort(function(){return Math.random()-.5});
  var gs=[];for(var i=0;i<k;i++)gs.push([]);
  names.forEach(function(n,i){gs[i%k].push(n)});
  var colors=['🔴','🔵','🟡','🟢','🟣','🟠'];
  document.getElementById('grpOut').innerHTML=gs.map(function(g,i){return '<div class="mem" style="margin:8px 0"><h4>'+(colors[i]||'⚪')+' 第'+(i+1)+'組</h4>'+g.map(function(n){return '<span class="pill">'+esc(n)+'</span>'}).join('')+'</div>'}).join('');
  Sfx.ding();
};

Lead.sc=function(i,d){
  Lead._score=Lead._score||[{n:'紅隊',s:0},{n:'藍隊',s:0}];
  if(Lead._score[i]){
    Lead._score[i].s=Math.max(0,Lead._score[i].s+d);
    d>0?Sfx.ding():Sfx.pop();
  }
  var mem=(Store.get('members',[])||[]).map(function(m){return m.n});
  var body=document.getElementById('toolBody');
  if(body)body.innerHTML=Lead.toolBody('score',mem);
};

Lead.addTeam=function(){
  Lead._score=Lead._score||[{n:'紅隊',s:0},{n:'藍隊',s:0}];
  Lead._score.push({n:'隊'+(Lead._score.length+1),s:0});
  var mem=(Store.get('members',[])||[]).map(function(m){return m.n});
  var body=document.getElementById('toolBody');
  if(body)body.innerHTML=Lead.toolBody('score',mem);
};

Lead.resetScore=function(){
  Lead._score=(Lead._score||[]).map(function(x){return {n:x.n,s:0}});
  var mem=(Store.get('members',[])||[]).map(function(m){return m.n});
  var body=document.getElementById('toolBody');
  if(body)body.innerHTML=Lead.toolBody('score',mem);
};

Lead.cd=function(sec){
  if(Lead._cdIv)clearInterval(Lead._cdIv);
  var left=sec;
  var d=document.getElementById('cdD');
  if(d)d.textContent='⏳ '+left;
  Lead._cdIv=setInterval(function(){
    left--;
    var el=document.getElementById('cdD');
    if(!el){clearInterval(Lead._cdIv);Lead._cdIv=null;return;}
    if(left>0){
      el.textContent='⏳ '+left;
      if(left<=5)Sfx.tick();
    } else {
      clearInterval(Lead._cdIv);Lead._cdIv=null;
      el.textContent='⏰ 時間到!';
      Sfx.alarm();
    }
  },1000);
};
