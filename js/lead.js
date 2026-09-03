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
      var c=Sfx.ac(),o=c.createOscillator(),g=c.createGain();
      o.type=type||'sine';o.frequency.value=f;
      g.gain.setValueAtTime(vol||.25,c.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,c.currentTime+(d||.2));
      o.connect(g);g.connect(c.destination);
      o.start();o.stop(c.currentTime+(d||.2));
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

/* 不依賴外部連結的伴奏：播放寄調 London Bridge 的旋律，卡拉OK同步高亮歌詞。 */
var Music={
  ctx:null,playing:false,beat:.44,iv:null,stopTimer:null,voices:[],
  notes:[
    392,440,392,349, 330,349,392, 294,330,349, 330,349,392,
    392,440,392,349, 330,349,392, 294,392, 330,262,
    392,440,392,349, 330,349,392,
    294,330,349, 330,349,392,
    392,440,392,349, 330,349,392,
    294,392, 330,262
  ],
  lines:[13, 11, 7, 6, 7, 4],
  play:function(){
    this.stop();
    try{
      this.ctx=Sfx.ac();
      var now=this.ctx.currentTime+.06;
      var self=this;
      for(var i=0;i<this.notes.length;i++){
        var o=this.ctx.createOscillator(),g=this.ctx.createGain(),at=now+i*this.beat;
        o.type='triangle';o.frequency.value=this.notes[i];
        g.gain.setValueAtTime(.001,at);
        g.gain.linearRampToValueAtTime(.24,at+.025);
        g.gain.exponentialRampToValueAtTime(.001,at+this.beat*.82);
        o.connect(g);g.connect(this.ctx.destination);
        o.start(at);o.stop(at+this.beat*.86);
        this.voices.push(o);
      }
      this.playing=true;
      this.highlight(0);
      this.iv=setInterval(function(){
        self.highlight((self._step||0)+1);
      },this.beat*1000);
      this.stopTimer=setTimeout(function(){
        self.stop();
      },this.notes.length*this.beat*1000+250);
    }catch(e){
      toast('裝置未能播放伴奏，請確認瀏覽器聲音已開啟');
    }
  },
  highlight:function(step){
    this._step=step;
    if(step<0){if(window.Lead&&Lead.songHighlight)Lead.songHighlight(-1);return;}
    var total=this.notes.length;
    if(step>=total){this.stop();return;}
    var n=step,line=0;
    while(line<this.lines.length&&n>=this.lines[line]){
      n-=this.lines[line];line++;
    }
    if(window.Lead&&Lead.songHighlight)Lead.songHighlight(line);
  },
  stop:function(){
    clearInterval(this.iv);clearTimeout(this.stopTimer);
    this.iv=null;this.stopTimer=null;
    this.voices.forEach(function(o){try{o.stop()}catch(e){}});
    this.voices=[];this.playing=false;this._step=0;
    if(window.Lead&&Lead.songHighlight)Lead.songHighlight(-1);
  }
};

var Lead={
  S:null,tmr:null,
  cleanupTimers:function(){
    if(Lead.tmr){clearInterval(Lead.tmr);Lead.tmr=null;}
    if(Lead._catch){
      if(Lead._catch.iv){clearInterval(Lead._catch.iv);Lead._catch.iv=null;}
      if(Lead._catch.tIv){clearInterval(Lead._catch.tIv);Lead._catch.tIv=null;}
      Lead._catch.running=false;
    }
    if(Lead._cleanIv){clearInterval(Lead._cleanIv);Lead._cleanIv=null;}
    if(Lead._tlTimer){clearInterval(Lead._tlTimer);Lead._tlTimer=null;}
    if(Lead._rhythmIv){clearInterval(Lead._rhythmIv);Lead._rhythmIv=null;}
    if(Lead._rollIv){clearInterval(Lead._rollIv);Lead._rollIv=null;}
    if(Lead._brhIv){clearInterval(Lead._brhIv);Lead._brhIv=null;}
    if(Lead._cdIv){clearInterval(Lead._cdIv);Lead._cdIv=null;}
    if(Lead._spinIv){clearInterval(Lead._spinIv);Lead._spinIv=null;}
    if(Lead._taskIv){clearInterval(Lead._taskIv);Lead._taskIv=null;}
    Music.stop();
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
    var titles={leader:'領袖話',traffic:'紅綠燈',catch:'捉草蜢',memory:'記憶配對',quiz:'問答擂台',guess:'估估下',judge:'對錯法庭',rhythm:'節奏模仿',chute:'快樂傘玩法卡',story:'故事寶盒',roll:'音樂傳球點名',bodycard:'身體地圖紅黃綠',recycle:'三色回收分類',flags:'國旗區旗敬禮',clean:'洗手七步好寶寶',emotion:'情緒面面觀',task:'任務抽籤機',bpstory:'貝登堡故事繪本',scoutfamily:'童軍大家庭地圖',foodrainbow:'彩虹健康飲食盤',transport:'交通工具大圖鑑',moon:'中秋射月拋圈',ghinfo:'認識小草蜢',badgego:'獎章Go Go Go',scarf:'整理領巾圖解',promise:'誓詞・規律・口號'};
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
       '<button class="lead-top-pill" onclick="Kit.openCheckFor(Lead.S.meet)" title="今場執行檢查表">🧭 檢查表</button>'+
       '<button class="lead-top-pill" onclick="Lead.addMiniGame()" title="加插遊戲">➕ 遊戲</button>'+
       '<button onclick="Lead.tools()" title="工具箱">🧰</button>'+
       '<button onclick="Lead.fs()" title="全螢幕">🖥️</button></div>'+
     '<div class="lead-stage" id="stageArea"><span class="stg-type">'+st.t+' ・ 環節 '+(S.idx+1)+'/'+S.meet.stages.length+'</span>'+
       '<h1>'+esc(st.n)+'</h1><div class="kids" id="kidsArea">'+Lead.screen(st)+'</div></div>'+
     '<div class="lead-bar"><div class="row"><div class="stagepill">'+pills+'</div></div>'+
       '<div class="row"><div style="flex:1;min-width:0"><span class="cue-label">領袖而家做'+(function(){var c=Kit.checkFor(st);return c?' <button class="lnk cue-chk" onclick="Kit.openCheck(\''+c.key+'\',\''+((Lead.S.meet&&Lead.S.meet.id)||'')+'\')">'+c.ic+' '+esc(c.n)+'</button>':' <button class="lnk cue-chk" onclick="Kit.hubOpen()">🧰 點預備</button>'})()+'</span><div class="now">'+esc(g.lead)+'</div><div class="leader-action">'+esc(g.watch)+'</div><div class="script">🎤 '+(esc(st.script||g.say)||'—')+'</div></div>'+
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
      {id:'traffic',ic:'🚦',n:'紅綠燈',d:'紅燈停綠燈行・5分鐘'},
      {id:'leader',ic:'🙋',n:'領袖話',d:'專注反應肢體・5分鐘'},
      {id:'catch',ic:'🦗',n:'捉草蜢',d:'眼明手快互動・30秒'},
      {id:'quiz',ic:'🏆',n:'問答擂台',d:'童軍與自然搶答・5分鐘'},
      {id:'guess',ic:'🔍',n:'估估下',d:'看剪影猜事物・5分鐘'},
      {id:'clean',ic:'🧼',n:'洗手七步操',d:'20秒計時歌・3分鐘'},
      {id:'task',ic:'🎯',n:'任務抽籤機',d:'轉動抽日行一善・3分鐘'},
      {id:'emotion',ic:'😊',n:'情緒面面觀',d:'心情輪盤表達・5分鐘'}
    ];
    var h='<h3>➕ 加插快閃遊戲／數碼工具</h3><div class="mute" style="font-size:.82rem;margin-bottom:10px">提早完成或想轉移焦點？點擊即刻開玩，玩完可隨時返回原集會流程：</div>'+
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
    return '<div class="digital-tool-bar"><b>💡 冇自備道具？</b> 唔使驚！撳呢度即轉 APP 內置免道具遊戲：'+
      '<div class="btns" style="justify-content:center;margin-top:6px">'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'traffic\')">🚦 紅綠燈</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'leader\')">🙋 領袖話</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'quiz\')">🏆 問答擂台</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'guess\')">🔍 估估下</button>'+
        '<button class="btn sm" onclick="Lead.switchToGame(\'catch\')">🦗 捉草蜢</button>'+
      '</div></div>'+
      '<div class="child-prompt">領袖先示範一次，小朋友跟住每一步做</div>'+craft+Lead.guideHtml(g)+mats;
  },

  /* 🛡️ 身體地圖紅黃綠 (Safe from Harm 數碼道具) */
  bodycard:function(){
    Lead._bodySel=null;
    return '<div class="qa-q">🛡️ 身體地圖紅黃綠・保護自己</div>'+
      '<div class="how" style="font-size:1.05rem">身體係你自己嘅！點擊身體部位，認識邊度可以掂、邊度絕對唔准！</div>'+
      '<div id="bodyCardBanner" class="tl-action-banner gr">👆 請點擊下方身體部位學習</div>'+
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
      '</div>';
  },

  /* ♻️ 三色回收分類擂台 (數碼互動道具) */
  recycle:function(){
    Lead._recScore=Lead._recScore||0;
    Lead._recCur=DATA.recycleItems[Math.floor(Math.random()*DATA.recycleItems.length)];
    return '<div class="qa-q">♻️ 三色回收分類擂台 <span class="tag g" id="recSc">得分: 0分</span></div>'+
      '<div class="how" style="font-size:1.15rem">將出現的物品放入正確的回收桶！</div>'+
      '<div class="huge" id="recItem" style="margin:8px 0">'+Lead._recCur.n+'</div>'+
      '<div id="recTip" class="tl-action-banner am">呢件物品應該放入邊個回收桶？</div>'+
      '<div class="recycle-bins">'+
        '<button class="bin-btn blue" onclick="Lead.recyclePick(\'blue\')"><b>🟦 藍色桶</b><span>廢紙類</span></button>'+
        '<button class="bin-btn yellow" onclick="Lead.recyclePick(\'yellow\')"><b>🟨 黃色桶</b><span>金屬鋁罐</span></button>'+
        '<button class="bin-btn green" onclick="Lead.recyclePick(\'green\')"><b>🟩 啡/綠桶</b><span>塑膠製品</span></button>'+
        '<button class="bin-btn trash" onclick="Lead.recyclePick(\'trash\')"><b>⬛ 垃圾筒</b><span>不可回收</span></button>'+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn sm ghost" onclick="Lead.nextRecycle()">換下一件物品 ▶</button>'+
      '</div>';
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
      '</div>';
  },

  /* 🧼 洗手七步好習慣 */
  clean:function(){
    Lead._cleanStep=0;
    return '<div class="qa-q">🧼 洗手七步好寶寶 <span class="tag b" id="cleanTmr">倒數 20秒</span></div>'+
      '<div class="how">跟隨畫面步驟洗手，趕走細菌與病毒！</div>'+
      '<div class="clean-grid">'+
        DATA.washSteps.map(function(w,i){
          return '<div class="clean-card" id="cw'+i+'" onclick="Lead.cleanPick('+i+')">'+
            '<span class="gnum">'+w.s+'</span><span class="clean-ic">'+w.ic+'</span><b>'+esc(w.n)+'</b><small>'+esc(w.d)+'</small>'+
          '</div>';
        }).join('')+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn" id="cleanBtn" onclick="Lead.cleanStart()">▶ 開始 20秒洗手歌與計時</button>'+
      '</div>';
  },

  /* 😊 情緒面面觀 (表情輪盤) */
  emotion:function(){
    return '<div class="qa-q">😊 情緒面面觀・認識心情</div>'+
      '<div class="how">每個人都有不同情緒，點擊表情一起討論！</div>'+
      '<div id="emoBanner" class="tl-action-banner am">點擊下面表情，分享自己幾時會有呢種感覺</div>'+
      '<div class="grid3" style="max-width:680px;margin:10px auto;width:100%">'+
        DATA.emotions.map(function(e,i){
          return '<div class="mem" style="cursor:pointer;text-align:center;padding:12px 8px" onclick="Lead.emoPick('+i+')">'+
            '<div style="font-size:2.8rem;line-height:1.1">'+e.ic+'</div>'+
            '<b style="font-size:1rem;color:var(--ord);display:block;margin-top:4px">'+esc(e.n)+'</b>'+
          '</div>';
        }).join('')+
      '</div>'+
      '<div class="btns" style="justify-content:center">'+
        '<button class="btn sm ghost" onclick="Lead.emoRandom()">🎲 隨機抽一個表情讓小朋友猜</button>'+
      '</div>';
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
      '<div class="mute" style="text-align:center;font-size:.85rem;margin-top:6px">💡 小童軍規律：小童軍日行一善。做完返屋企跟爸爸媽媽打卡！</div>';
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
      '</div>';
  },

  /* 🌲 童軍大家庭分支地圖 */
  scoutfamily:function(){
    return '<div class="qa-q">🌲 童軍大家庭分支地圖</div>'+
      '<div class="how">小童軍長大後會去哪裡？點擊查看各個支部！</div>'+
      '<div class="scout-tree">'+
        DATA.scoutFamily.map(function(s,i){
          return '<div class="scout-branch" style="border-left-color:'+s.c+'" onclick="Lead.scoutPick('+i+')">'+
            '<div class="sb-head"><span class="sb-ic">'+s.ic+'</span><b>'+esc(s.s)+'</b><span class="tag" style="background:'+s.c+'22;color:'+s.c+'">'+s.a+'</span></div>'+
            '<div class="sb-motto">銘言：<b>'+esc(s.motto)+'</b></div>'+
            '<small class="mute">'+esc(s.d)+'</small>'+
          '</div>';
        }).join('')+
      '</div>';
  },

  /* 🌈 彩虹健康飲食盤 */
  foodrainbow:function(){
    return '<div class="qa-q">🌈 彩虹健康飲食盤</div>'+
      '<div class="how">每天吃五種顏色的健康食物，身體健康快高長大！</div>'+
      '<div id="foodBanner" class="tl-action-banner gr">點擊顏色，查看健康食物與好處</div>'+
      '<div class="food-grid">'+
        DATA.foodRainbow.map(function(f,i){
          return '<div class="food-tile" style="border-color:'+f.c+'" onclick="Lead.foodPick('+i+')">'+
            '<b style="color:'+f.c+';font-size:1.1rem">'+esc(f.n)+'</b>'+
            '<div style="font-size:.9rem;margin:4px 0"><b>例子：</b>'+esc(f.ex)+'</div>'+
            '<small style="color:var(--mute)">💪 '+esc(f.benefit)+'</small>'+
          '</div>';
        }).join('')+
      '</div>';
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
      '</div>';
  },

  /* 🌕 中秋后羿射月/圈圈月餅數碼靶 */
  moon:function(){
    Lead._moonScore=0;
    return '<div class="qa-q">🌕 歡樂射月與投擲大賽 <span class="tag g" id="moonSc">得分: 0分</span></div>'+
      '<div class="how">點擊月亮靶心進行投擲，或者小朋友拿軟球輕碰螢幕投中月亮！</div>'+
      '<div class="moon-target-wrap" onclick="Lead.moonHit()">'+
        '<div class="moon-target" id="moonTarget">'+
          '<div class="moon-inner">🌕</div>'+
          '<span class="moon-hit-txt">🎯 點我投擲！</span>'+
        '</div>'+
      '</div>'+
      '<div id="moonMsg" class="tl-action-banner am">預備——瞄準月亮，拋出！</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn" onclick="Lead.moonHit()">🎯 命中靶心！</button>'+
        '<button class="btn sm ghost" onclick="Lead._moonScore=0;document.getElementById(\'moonSc\').textContent=\'得分: 0分\';toast(\'分數已歸零\')">🔄 歸零重賽</button>'+
      '</div>';
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
        '<button class="btn sm" onclick="Lead.startGame(\'catch\',\'捉草蜢\')">🦗 玩捉草蜢遊戲</button>'+
      '</div>';
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
      '<div class="attention" style="margin-top:10px;text-align:center"><b>遊戲玩法：</b> 小朋友雙腳跳或單腳跳沿著獎章顏色逐個跳過去！</div>';
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
      '</div>';
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
    var idx=st&&st.chuteIndex!=null?st.chuteIndex:Math.floor(Math.random()*DATA.chute.length);
    Lead._curChuteIdx=idx;
    var c=DATA.chute[idx];
    var g=Guide.chute(c);
    return '<div class="qa-q">'+c.ic+' '+c.n+' <span class="tag">'+c.tag+'</span></div>'+
      Lead.parachuteSvg('open')+Lead.guideHtml(g)+
      '<div class="btns" style="justify-content:center"><button class="btn sm" onclick="Lead.nextChute()">🔀 抽另一式</button></div>';
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
      '<div class="guide-steps" style="max-width:640px;margin:12px auto">'+g.steps.map(function(x){return '<div class="guide-step"><span class="gnum">'+esc(x[0])+'</span><span class="gicon">'+x[1]+'</span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></div>'}).join('')+'</div>';
  },
  quiz:function(){
    var q=DATA.quiz[Math.floor(Math.random()*DATA.quiz.length)];
    var opts=[q.a].concat(q.w);opts.sort(function(){return Math.random()-.5});
    Lead._quizCur={q:q, a:q.a};
    return '<div class="qa-q"><small class="tag">'+esc(q.c)+'</small><br>'+esc(q.q)+'</div>'+
      '<div class="qa-opts" id="quizOpts">'+
      opts.map(function(o,idx){
        return '<div class="gtile" id="qo'+idx+'" onclick="Lead.judgeOpt('+idx+')">'+esc(o)+'</div>';
      }).join('')+'</div>'+
      '<div id="quizExplain" style="text-align:center;margin-top:8px"></div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px"><button class="btn sm" onclick="Lead.rerender()">下一題 ▶</button></div>';
  },
  judge:function(){
    var arr=Math.random()<.5?DATA.judgeKind:DATA.judgeSfh;
    var j=arr[Math.floor(Math.random()*arr.length)];
    Lead._judgeCur=j;
    return '<div class="qa-q">👨‍⚖️ 對錯法庭</div>'+
      '<div class="how" style="font-size:1.4rem;font-weight:700">「'+esc(j.s)+'」</div>'+
      '<div class="qa-opts" id="judgeOpts">'+
        '<div class="gtile" onclick="Lead.judgeChoice(1)">👍 啱 (好行為)</div>'+
        '<div class="gtile" onclick="Lead.judgeChoice(0)">👎 錯 (唔應該)</div>'+
      '</div>'+
      '<div id="judgeExp" style="text-align:center;margin-top:10px"></div>'+
      '<div class="btns" style="justify-content:center;margin-top:12px"><button class="btn sm" onclick="Lead.rerender()">下一案 ▶</button></div>';
  },
  guess:function(){
    var g=DATA.guess[Math.floor(Math.random()*DATA.guess.length)];
    Lead._guessCur={emoji:g[0], name:g[1], revealed:false};
    return '<div class="qa-q">🔍 估估下:呢個係咩?</div>'+
      '<div class="huge" id="gz" style="filter:brightness(0);transition:filter .4s ease">'+g[0]+'</div>'+
      '<div class="big" id="gzt" style="min-height:1.8em">❓ 睇剪影估答案！</div>'+
      '<div class="btns" style="justify-content:center">'+
        '<button class="btn" id="gzBtn" onclick="Lead.guessReveal()">💡 揭盅</button>'+
        '<button class="btn ghost" onclick="Lead.rerender()">下一個 ▶</button>'+
      '</div>';
  },
  memory:function(){
    var set=DATA.guess.slice().sort(function(){return Math.random()-.5}).slice(0,6);
    var cards=set.concat(set).map(function(x){return x[0]}).sort(function(){return Math.random()-.5});
    Lead._mem={open:[],done:[],cards:cards,lock:false,totalPairs:6};
    return '<div class="qa-q">🃏 記憶配對 <span class="tag g" id="memProgress">進度: 0/6 對</span></div>'+
      '<div class="how" id="memStatus">輪流揭兩張圖卡，搵出相同的一對！</div>'+
      '<div class="mongrid">'+
      cards.map(function(c,i){return '<div class="mon flip" id="mo'+i+'" onclick="Lead.memFlip('+i+')">?</div>'}).join('')+'</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px"><button class="btn sm ghost" onclick="Lead.rerender()">🔄 新一局</button></div>';
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
      '<div class="ldr-banner" id="ldrBox"><div class="big" id="ldrCmd" style="margin:0">點擊「出指令」開始</div><div id="ldrHint" class="mute" style="font-size:.95rem;margin-top:4px">準備好未？</div></div>'+
      '<div class="btns" style="justify-content:center"><button class="btn" onclick="Lead.ldrGo()">📣 下一個指令</button></div>'+
      '<div class="mute" style="text-align:center;font-size:.82rem;margin-top:8px">💡 帶領貼士：先出2-3個真指令熱身，再突然出陷阱指令！</div>';
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
      '<div class="mute" style="text-align:center;font-size:.85rem;margin-top:6px">💡 遊戲規則：紅燈定格，郁咗嘅小童軍要退後一步／舉手做小草蜢！</div>';
  },
  catch:function(){
    Lead._catch={score:0,left:30,iv:null,tIv:null,running:false};
    return '<div class="qa-q">🦗 捉草蜢 <span class="tag g" id="cs">0分</span> <span class="tag b" id="cl">30秒</span></div>'+
      '<div class="how" id="catchTip">草蜢跳出嚟嗰陣快啲撳佢！限時30秒，鬥快計分！</div>'+
      '<div class="molefield">'+[0,1,2,3,4,5,6,7,8].map(function(i){return '<div class="hole" id="ho'+i+'" onclick="Lead.whack('+i+')">🕳️</div>'}).join('')+'</div>'+
      '<div class="btns" style="justify-content:center"><button class="btn" id="cb" onclick="Lead.catchGo()">▶ 開始 (30秒)</button></div>';
  },
  rhythm:function(){
    var pool=['👏 拍手','🖐️ 舉手','🦶 踏步','🦗 草蜢跳','🙆 大愛心'];
    var pat=[0,1,2,3].map(function(){return pool[Math.floor(Math.random()*pool.length)]});
    Lead._rhythm={pat:pat,step:-1,playing:false};
    return '<div class="qa-q">🎵 節奏模仿</div>'+
      '<div class="how">領袖做一次，全體跟住做！</div>'+
      '<div class="big" id="rhm" style="min-height:2.2em;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:10px auto">'+
        pat.map(function(p,i){return '<span class="pill" id="rhp'+i+'" style="font-size:1.15rem;padding:8px 14px">❓</span>'}).join('')+
      '</div>'+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
        '<button class="btn" id="rhPlayBtn" onclick="Lead.rhPlay()">▶ 逐個亮出節奏</button>'+
        '<button class="btn ghost" onclick="Lead.rerender()">🔄 換新節奏</button>'+
      '</div>';
  },
  breath:function(){
    Lead.after=function(){Lead.brhTick(true)};
    return '<div class="qa-q">🍃 靜息呼吸</div><div class="how">全體坐好，跟住個圓圈：放大=吸氣(1-2-3-4)，縮小=呼氣(1-2-3-4)</div>'+
      '<div class="breath" id="brh">吸~~~</div><div class="btns" style="justify-content:center"><button class="btn sm ghost" onclick="Lead.brhTick(true)">🔄 由頭開始</button></div>';
  }
};

Lead.guideHtml=function(g){
  return '<div class="lead-guide"><div class="guide-lead"><b>領袖先做</b>'+esc(g.lead)+'</div><div class="guide-steps">'+g.steps.map(function(x){return '<div class="guide-step"><span class="gnum">'+esc(x[0])+'</span><span class="gicon">'+x[1]+'</span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></div>'}).join('')+'</div><div class="say-box"><b>🎤 領袖可以照讀</b>'+esc(g.say)+'</div><div class="watch-row"><div><b>👀 留意</b><br>'+esc(g.watch)+'</div><div class="safe"><b>🛡️ 安全</b><br>'+esc(g.safety)+'</div></div></div>';
};

Lead.parachuteSvg=function(mode){
  var raised=mode==='open';
  return '<div class="parachute-kit"><h3 style="margin:0;color:#1565c0">🌈 快樂傘動作圖</h3><div class="parachute-visual"><svg viewBox="0 0 520 205" role="img" aria-label="小朋友圍住快樂傘，一起揚起或放低"><path d="M70 70 Q260 '+(raised?'8':'125')+' 450 70 L425 102 Q260 '+(raised?'43':'159')+' 95 102 Z" fill="#ffca28" stroke="#e65100" stroke-width="5"/><path d="M95 101 Q260 '+(raised?'43':'160')+' 425 101" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8"/>'+[105,150,195,240,285,330,375,420].map(function(x){return '<circle cx="'+x+'" cy="'+(raised?'141':'180')+'" r="11" fill="#43a047" stroke="#1b5e20" stroke-width="3"/><path d="M'+x+' '+(raised?'151':'190')+' v18 m-13 -8 h26 m-5 8 l-8 14 m8-14 l8 14" stroke="#1b5e20" stroke-width="4" stroke-linecap="round" fill="none"/>'}).join('')+'<path d="M260 183 V'+(raised?'119':'156')+'" stroke="#e65100" stroke-width="5" stroke-linecap="round"/><path d="M250 '+(raised?'130':'156')+' l10 -14 10 14" fill="none" stroke="#e65100" stroke-width="5"/><text x="260" y="29" text-anchor="middle" font-size="17" font-weight="700" fill="#795548">'+(raised?'一起向上 ↑':'慢慢向下 ↓')+'</text></svg></div><div class="para-caption">綠色小人＝小朋友位置　黃色傘邊＝雙手執住　橙色箭咀＝跟領袖數拍子</div><div class="para-safety"><span>🤲 執實傘邊</span><span>↔️ 留一隻手臂距離</span><span>🛑 聽到停就停</span></div></div>';
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

/* 三色回收分類互動 */
Lead.recyclePick=function(binColor){
  var item=Lead._recCur;if(!item)return;
  var right=(binColor===item.t);
  var tip=document.getElementById('recTip');
  if(right){
    Lead._recScore=(Lead._recScore||0)+1;
    if(tip){
      tip.className='tl-action-banner gr';
      tip.innerHTML='🎉 <b>答啱咗！</b> '+esc(item.tip);
    }
    Sfx.fanfare();
  } else {
    if(tip){
      tip.className='tl-action-banner rd';
      tip.innerHTML='❌ <b>分類錯誤！</b> 正確應該係放入 <b>'+esc(item.bin)+'</b>！<br><small>'+esc(item.tip)+'</small>';
    }
    Sfx.wrong();
  }
  var sc=document.getElementById('recSc');if(sc)sc.textContent='得分: '+Lead._recScore+'分';
  setTimeout(function(){Lead.nextRecycle()},2200);
};
Lead.nextRecycle=function(){
  Lead._recCur=DATA.recycleItems[Math.floor(Math.random()*DATA.recycleItems.length)];
  var it=document.getElementById('recItem');if(it)it.textContent=Lead._recCur.n;
  var tip=document.getElementById('recTip');
  if(tip){tip.className='tl-action-banner am';tip.textContent='呢件物品應該放入邊個回收桶？';}
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
Lead.cleanPick=function(idx){
  var w=DATA.washSteps[idx];if(!w)return;
  document.querySelectorAll('.clean-card').forEach(function(c,i){c.classList.toggle('on',i===idx)});
  Sfx.pop();
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

/* 中秋射月投擲命中 */
Lead.moonHit=function(){
  Lead._moonScore=(Lead._moonScore||0)+1;
  var sc=document.getElementById('moonSc');if(sc)sc.textContent='得分: '+Lead._moonScore+'分';
  var msg=document.getElementById('moonMsg');
  if(msg){
    msg.className='tl-action-banner gr';
    msg.innerHTML='🎉 <b>百步穿楊！命中大月亮！</b> (累計命中 '+Lead._moonScore+' 次)';
  }
  Sfx.fanfare();
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

/* 問答擂台 */
Lead.judgeOpt=function(idx){
  var cur=Lead._quizCur;if(!cur)return;
  var el=document.getElementById('qo'+idx);if(!el)return;
  var sel=el.textContent;var ans=cur.a;
  var isRight=(sel===ans);
  el.classList.add(isRight?'ok':'no');
  if(isRight){
    Sfx.fanfare();
  }else{
    Sfx.wrong();
    setTimeout(function(){
      var p=document.getElementById('quizOpts');
      if(p){
        for(var i=0;i<p.children.length;i++){
          if(p.children[i].textContent===ans)p.children[i].classList.add('ok');
        }
      }
    },350);
  }
  var exp=document.getElementById('quizExplain');
  if(exp){
    exp.innerHTML=isRight?'<b style="color:#2e7d32">🎉 答啱咗！好嘢！</b>':'<b style="color:#c62828">💡 正確答案係：「'+esc(ans)+'」</b>';
  }
  document.querySelectorAll('#quizOpts .gtile').forEach(function(x){x.style.pointerEvents='none'});
};

/* 對錯法庭 */
Lead.judgeChoice=function(choice){
  var j=Lead._judgeCur;if(!j)return;
  var right=(choice===j.g);
  var opts=document.querySelectorAll('#judgeOpts .gtile');
  if(opts.length>=2){
    var selEl=choice===1?opts[0]:opts[1];
    selEl.classList.add(right?'ok':'no');
    opts.forEach(function(x){x.style.pointerEvents='none'});
  }
  right?Sfx.fanfare():Sfx.wrong();
  var exp=document.getElementById('judgeExp');
  if(exp){
    exp.innerHTML='<div class="mute" style="font-size:1.15rem;padding:8px;background:#f5f5f5;border-radius:12px">💡 <b>'+(right?'判決正確！':'留意返：')+'</b> '+esc(j.w)+'</div>';
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

/* 記憶配對 */
Lead.memFlip=function(i){
  var m=Lead._mem;if(!m||m.lock||m.open.indexOf(i)>=0||m.done.indexOf(i)>=0)return;
  var el=document.getElementById('mo'+i);if(!el)return;
  el.classList.remove('flip');el.textContent=m.cards[i];Sfx.pop();
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
          if(e){e.classList.add('flip');e.textContent='?';}
        });
        Sfx.wrong();m.open=[];m.lock=false;
      },900);
    }
  }
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

/* 捉草蜢 */
Lead.catchGo=function(){
  var S=Lead._catch;
  if(S.iv)clearInterval(S.iv);
  if(S.tIv)clearInterval(S.tIv);
  S.score=0;
  S.left=30;
  S.running=true;
  var btn=document.getElementById('cb');
  if(btn){btn.disabled=true;btn.style.opacity=.5;btn.textContent='🦗 遊戲進行中...';}
  var cs=document.getElementById('cs');if(cs)cs.textContent='0分';
  var cl=document.getElementById('cl');if(cl)cl.textContent='30秒';
  var tip=document.getElementById('catchTip');if(tip)tip.textContent='快啲撳出現嘅草蜢！';
  
  for(var i=0;i<9;i++){
    var e=document.getElementById('ho'+i);
    if(e){e.classList.remove('up');e.textContent='🕳️';}
  }
  
  S.iv=setInterval(function(){
    for(var i=0;i<9;i++){
      var e=document.getElementById('ho'+i);
      if(e){e.classList.remove('up');e.textContent='🕳️';}
    }
    var h=Math.floor(Math.random()*9);
    var eh=document.getElementById('ho'+h);
    if(eh){eh.classList.add('up');eh.textContent='🦗';}
    S._cur=h;Sfx.tick();
  },800);
  
  S.tIv=setInterval(function(){
    S.left--;
    var l=document.getElementById('cl');if(l)l.textContent=S.left+'秒';
    if(S.left<=0){
      clearInterval(S.tIv);clearInterval(S.iv);
      S.iv=null;S.tIv=null;S.running=false;
      for(var i=0;i<9;i++){
        var e=document.getElementById('ho'+i);
        if(e){e.classList.remove('up');e.textContent='🕳️';}
      }
      Sfx.fanfare();
      var b=document.getElementById('cb');
      if(b){b.disabled=false;b.style.opacity=1;b.textContent='再嚟一次 ↻';}
      var t=document.getElementById('catchTip');
      if(t)t.innerHTML='🎉 <b>時間到！一共捉到 '+S.score+' 隻草蜢！好嘢！</b>';
    }
  },1000);
};

Lead.whack=function(i){
  var S=Lead._catch;
  if(!S.running)return;
  var el=document.getElementById('ho'+i);
  if(el&&el.classList.contains('up')){
    S.score++;
    el.classList.remove('up');
    el.textContent='✅';
    Sfx.pop();
    var s=document.getElementById('cs');if(s)s.textContent=S.score+'分';
  }
};

/* 節奏模仿 */
Lead.rhPlay=function(){
  var R=Lead._rhythm;if(!R||R.playing)return;
  R.playing=true;R.step=-1;
  var btn=document.getElementById('rhPlayBtn');
  if(btn){btn.disabled=true;btn.style.opacity=.5;}
  if(Lead._rhythmIv)clearInterval(Lead._rhythmIv);
  
  for(var i=0;i<R.pat.length;i++){
    var e=document.getElementById('rhp'+i);
    if(e){e.textContent='❓';e.classList.remove('on');}
  }
  
  Lead._rhythmIv=setInterval(function(){
    R.step++;
    if(R.step>=R.pat.length){
      clearInterval(Lead._rhythmIv);
      Lead._rhythmIv=null;
      R.playing=false;
      if(btn){btn.disabled=false;btn.style.opacity=1;btn.textContent='▶ 再播一次';}
      Sfx.fanfare();
      return;
    }
    var curEl=document.getElementById('rhp'+R.step);
    if(curEl){
      curEl.textContent=R.pat[R.step];
      curEl.classList.add('on');
    }
    Sfx.pop();
  },750);
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
  var tabs=[['wheel','🎡 抽籤'],['group','👥 分組'],['score','🥇 計分'],['cd','⏳ 倒數'],['sfx','📣 音效'],['breath','🍃 呼吸'],['check','🧭 檢查表']];
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
