/* 🦗 song.js — 🎵 唱歌（🅱️ 工具箱）：主題曲卡拉OK＋曲庫＋唱得住嘅活動，即開即唱 © 2026 Scout System
   定位：下方工具箱＝即開即用。想加個唱遊、開會前想唱主題曲、洗手想有歌計時——撳一下就播。
   伴奏全部由 APP 即時彈（唔使上網、唔使搵片），速度・數拍・和弦喺呢頁定好，開到卡拉OK照用。 */
var Song={
  /* 主題曲逐句動作：4–7 歲係「唱＋做」，淨唱好快散（六句對齊 DATA.facts.song） */
  ACTIONS:[
    '原地踏步，雙手前後擺（行軍）',
    '舉高右手向前指三下，停',
    '拍手兩下＋踏步',
    '跺腳兩下（重拍）',
    '雙手舉高左右搖',
    '全體牽手一齊舉高（收結）'
  ],
  /* 一撳即唱：最常用嘅三首＋一句講解 */
  quick:function(){
    var h='';
    if(typeof Music!=='undefined'&&Music.SONGBOOK)Object.keys(Music.SONGBOOK).forEach(function(k){
      var s=Music.SONGBOOK[k];
      var desc=k==='theme'?'團員章項目・開會散會都唱':(k==='jingle'?'聖誕／冬天節慶用':'新年・生日場合用');
      h+=qBtn(k==='theme'?'🎵':'🎶',s.title,desc,'Song.start(\''+k+'\')');
    });
    return h;
  },
  html:function(){
    var f=(typeof DATA!=='undefined'&&DATA.facts)?DATA.facts:{song:[]};
    var h='<div class="card song-hero"><span class="eyebrow">🎵 唱歌</span>'+
      '<h2>想唱就唱，唔使搵片、唔使上網。</h2>'+
      '<p class="mute">APP 即時彈伴奏，撳一下就開唱：黃色＝唱緊嗰句，聽到 4 聲「嘀」先開聲。</p>'+
      '<div class="btns"><button class="btn gr blk" onclick="Song.start(\'theme\')">▶ 開主題曲卡拉OK</button></div>'+
      '<div class="song-setup" style="margin-top:10px">'+
        '<span>🐢 速度 '+Music.TEMPOS.map(function(t){
          return '<button class="pill'+(Music.bpm===t.bpm?' on':'')+'" onclick="Song.tempo(\''+t.k+'\')">'+esc(t.n)+' ('+t.bpm+')</button>'}).join('')+'</span>'+
        '<span class="pill'+(Music.countIn?' on':'')+'" onclick="Song.opt(\'countIn\')">🥁 4 拍數拍先入</span>'+
        '<span class="pill'+(Music.chords?' on':'')+'" onclick="Song.opt(\'chords\')">🎹 和弦伴奏</span>'+
      '</div>'+
      '<div class="mute" style="font-size:.78rem;margin-top:6px">第一次帶用「慢」；呢度定好嘅設定，開到卡拉OK 照用。</div></div>';

    /* ① 曲庫 */
    h+='<div class="card"><h3>📚 曲庫 <span class="tag">即開即唱</span></h3>'+
      '<div class="tk-grid">'+this.quick()+'</div>'+
      '<div class="mute" style="font-size:.8rem;margin-top:8px">全部公開領域旋律；主題曲寄調 London Bridge is Falling Down。</div></div>';

    /* ② 主題曲：歌詞＋逐句動作（團員章要唱呢首） */
    h+='<div class="card"><h3>🦗 小童軍主題曲・歌詞＋動作</h3>'+
      '<div class="mute" style="font-size:.82rem">'+esc(f.songHint||'')+'</div>'+
      '<div class="song-lyric">'+(f.song||[]).map(function(l,i){
        return '<div class="song-act"><i>'+(i+1)+'</i><div><b>'+esc(l)+'</b><small>🙌 '+esc(Song.ACTIONS[i]||'跟住節奏郁動')+'</small></div></div>';
      }).join('')+'</div>'+
      '<div class="btns"><button class="btn sm gr" onclick="Song.start(\'theme\')">▶ 開卡拉OK（跟住唱）</button></div></div>';

    /* ③ 唱得住嘅活動：想加節目就喺度揀 */
    h+='<div class="card"><h3>🎤 加個節目：呢啲都係「有聲音」嘅活動</h3>'+
      '<div class="mute" style="font-size:.82rem">臨時想加一節？一撳即開。</div>'+
      '<div class="tk-grid">'+
      qBtn('🧼','洗手七步歌','20 秒計時歌，全體跟住搓','Lead.startGame(\'clean\',\'洗手七步好寶寶\')')+
      qBtn('🎤','音樂傳球點名','停球嗰位講名＋一樣鍾意嘅嘢','Lead.startGame(\'roll\',\'音樂傳球點名\')')+
      qBtn('🥁','節奏模仿','APP 出拍子聲，領袖做一次全體跟','Lead.startGame(\'rhythm\',\'節奏模仿・跟拍子\')')+
      qBtn('🚩','唱住揚快樂傘','唱到「向前進」就揚高把傘','Song.flag()')+
      qBtn('🏕️','傘下唱歌／講故事','鶴立雞群：傘變帳幕，喺入面唱','Song.tent()')+
      qBtn('🫡','誓詞・規律・口號','大字投影，領袖帶讀全體跟','Lead.startGame(\'promise\',\'誓詞・規律・口號\')')+
      '</div></div>';

    /* ④ 4–7 歲唱歌貼士 */
    h+='<div class="card"><h3>💡 唱歌帶領貼士（4–7 歲）</h3><div class="box">'+
      '<b>① 先聽一次</b>：第一次淨聽，第二次先一齊唱。<br>'+
      '<b>② 你先唱</b>：你大聲，佢哋先敢跟。<br>'+
      '<b>③ 慢</b>：第一次用「慢」。<br>'+
      '<b>④ 每句一個動作</b>：記唔到詞都跟到。<br>'+
      '<b>⑤ 唱兩次就夠</b>；肯開聲就算完成。</div></div>';

    /* ⑤ 團員章：唱主題歌 */
    var b=(typeof Kit!=='undefined'&&Kit.badgeMap)?Kit.badgeMap.filter(function(x){return x.k==='song'})[0]:null;
    if(b)h+='<div class="card"><h3>🏅 唱完就計數：團員章「'+esc(b.t)+'」</h3>'+
      '<div class="box">📍 '+esc(b.where)+'<br>💡 '+esc(String(b.how).split("；")[0])+'。'+'</div>'+
      '<div class="btns"><button class="btn sm gr" onclick="'+b.link+'">▶ 即刻開</button>'+
      '<button class="btn sm ghost" onclick="App.go(\'#track\')">🏅 去記錄</button></div></div>';
    return h;
  },
  /* 開卡拉OK：直接開帶領畫面嗰張唱遊卡（同一份 Music 設定） */
  start:function(k){
    if(typeof Music==='undefined'||!Music.SONGBOOK||typeof Lead==='undefined')return;
    var key=Music.SONGBOOK[k]?k:'theme';
    var meta=Music.SONGBOOK[key];
    Lead.cleanupTimers();
    Lead.S={meet:{id:'song-'+key,n:'🎵 '+meta.title,
      stages:[{t:'唱遊',n:meta.title,m:8,how:'跟住畫面唱，APP 即時彈伴奏',script:'',screen:'song',song:key}]},
      idx:0,left:480,timerOn:false,no:0};
    Lead.open();
  },
  tempo:function(k){var t=Music.setTempo(k);toast('🎵 速度：'+t.n+'・'+t.bpm+' BPM');App.route()},
  opt:function(k){
    Music[k]=!Music[k];
    toast(k==='countIn'?(Music.countIn?'🥁 會先數 4 拍先入':'唔數拍，即刻開始'):(Music.chords?'🎹 加咗和弦伴奏':'淨旋律（冇和弦）'));
    App.route();
  },
  /* 快樂傘兩式同唱歌有關：升降旗（唱住揚傘）・鶴立雞群（傘下唱歌） */
  chuteIdx:function(n){for(var i=0;i<DATA.chute.length;i++)if(DATA.chute[i].n===n)return i;return 0},
  flag:function(){if(typeof Chute!=='undefined')Chute.play(this.chuteIdx('升降旗'))},
  tent:function(){if(typeof Chute!=='undefined')Chute.play(this.chuteIdx('鶴立雞群'))}
};
