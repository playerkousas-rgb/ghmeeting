/* 🦗 play.js — 資深領袖的活動架：遊戲、手工、外部示範片分開找 © 2026 Scout System */
var Play={
  tab:'all',q:'',
  games:[
    {id:'leader',ic:'🙋',n:'領袖話',meta:'無需物資・5–10分鐘',d:'有「領袖話」才做動作；沒有就是陷阱。'},
    {id:'traffic',ic:'🚦',n:'紅綠燈',meta:'無需物資・5–10分鐘',d:'綠燈行、黃燈慢動作、紅燈定格；可以手動轉燈。'},
    {id:'catch',ic:'🦗',n:'捉草蜢',meta:'投影互動・30秒',d:'草蜢彈出就撳；限時鬥反應，畫面自動計分。'},
    {id:'memory',ic:'🃏',n:'記憶配對',meta:'投影互動・10分鐘',d:'輪流揭兩張圖卡，配對成功就全體拍手。'},
    {id:'quiz',ic:'🏆',n:'問答擂台',meta:'投影互動・10分鐘',d:'隨機題目、按答案揭曉；誓詞、安全、大自然和善行都有。'},
    {id:'guess',ic:'🔍',n:'估估下',meta:'投影互動・8分鐘',d:'先看黑色剪影，逐步給提示，最後揭盅。'},
    {id:'judge',ic:'👍',n:'對錯法庭',meta:'全體投票・10分鐘',d:'舉手判斷善行或保護自己的情景，再看解釋。'},
    {id:'rhythm',ic:'🎵',n:'節奏模仿',meta:'無需物資・8分鐘',d:'畫面逐個亮出拍手、腳步和動作，全體跟住做。'},
    {id:'chute',ic:'🌈',n:'快樂傘玩法卡',meta:'快樂傘・10分鐘',d:'抽一式，畫面有位置圖、步驟、口令和安全提示。'},
    {id:'story',ic:'📖',n:'故事寶盒',meta:'無需物資・8分鐘',d:'抽故事種子，領袖照住開場提示講，再問一條問題。'},
    {id:'roll',ic:'🎤',n:'音樂傳球點名',meta:'軟身球・5分鐘',d:'有音樂就傳；冇音樂由領袖拍手，停拍就停球抽名。'}
  ],
  videos:[
    {ic:'🎵',n:'London Bridge Is Falling Down・歌詞版',src:'Super Simple Songs',d:'主題曲寄調的旋律示範。集會前領袖先聽兩次，再回 APP 播放內置伴奏。',url:'https://www.youtube.com/watch?v=ROCxUzgr2PE'},
    {ic:'🛡️',n:'學會說「不」・身體界線課',src:'EasyFun Kids',d:'適合3–8歲的安全教育動畫，可配合保護自己環節；播放前先確認內容適合本團。',url:'https://www.youtube.com/watch?v=E0APX1RAVAs'},
    {ic:'🌈',n:'氣球傘遊戲介紹・13種玩法圖例',src:'Jenher',d:'有不同傘上玩法、圖例和安全提醒；想加新玩法時作靈感。',url:'https://jenher.com/%E5%B9%BC%E5%85%92%E9%AB%94%E8%83%BD%E9%81%8A%E6%88%B2500%E4%BE%8B-%E7%9B%AE%E9%8C%84/%E5%AF%A6%E4%BE%8B%E7%AF%87-%E6%B0%A3%E7%90%83%E5%82%98%E9%81%8A%E6%88%B2/'},
    {ic:'🏃',n:'幼兒及小學遊戲教學',src:'Pinky老師',d:'用來觀察幼兒遊戲節奏和領袖示範方式；影片需要上網。',url:'https://www.youtube.com/watch?v=oENwIwjvotY'},
    {ic:'⚽',n:'親子體能遊戲・空中氣球',src:'教育城 家長智Net',d:'不需快樂傘也可以玩的親子體能活動，適合做後備方案。',url:'https://www.parent.edu.hk/smart-parent-net/topics/article/video-balloongame'}
  ],
  craftItems:function(){
    var out=[];
    TPLS.forEach(function(t){t.stages.forEach(function(s,i){
      if(s.t==='美勞'||/DIY|名牌|燈籠|揮春|承諾卡|紙飛機|紙船|相框|彩繪|創作/.test(s.n))out.push({tid:t.id,si:i,ic:'🎨',n:s.n,meta:(s.m||10)+'分鐘・'+t.mo,d:s.how||'按準備卡示範一次，再讓小朋友自己完成。',mats:s.mats||[]});
    })});
    return out;
  },
  html:function(){
    var h='<div class="card activity-hero"><span class="eyebrow">🎮 資深領袖活動架</span><h2>想玩咩，就揀咩。</h2><p class="mute">遊戲、手工、示範片分開整理；唔使先開年度集會，撳一下就可以投影或開準備卡。</p><div class="activity-stat"><b>'+this.games.length+'</b><span>個即玩遊戲</span><b>'+this.craftItems().length+'</b><span>個手工活動</span><b>'+this.videos.length+'</b><span>條參考片</span></div></div>'+
      '<div class="card"><div class="activity-tabs">'+[['all','全部'],['game','🎮 遊戲'],['craft','🎨 手工'],['video','🎬 示範片']].map(function(x){return '<button class="pill '+(Play.tab===x[0]?'on':'')+'" onclick="Play.filterBy(\''+x[0]+'\')">'+x[1]+'</button>'}).join('')+'</div><input type="text" value="'+esc(this.q)+'" placeholder="🔎 搵活動，例如：球、傘、聖誕、手工" oninput="Play.search(this.value)"><div id="playList" class="activity-grid">'+this.listHtml()+'</div></div>';
    return h;
  },
  filterBy:function(t){this.tab=t;this.q='';App.route()},
  search:function(q){this.q=q;var el=document.getElementById('playList');if(el)el.innerHTML=this.listHtml()},
  items:function(){
    var all=[];
    if(this.tab==='all'||this.tab==='game')all=all.concat(this.games.map(function(x){return Object.assign({kind:'game'},x)}));
    if(this.tab==='all'||this.tab==='craft')all=all.concat(this.craftItems().map(function(x){return Object.assign({kind:'craft'},x)}));
    if(this.tab==='all'||this.tab==='video')all=all.concat(this.videos.map(function(x){return Object.assign({kind:'video'},x)}));
    var q=this.q.trim().toLowerCase();return q?all.filter(function(x){return (x.n+' '+(x.d||'')+' '+(x.meta||'')+' '+(x.src||'')).toLowerCase().indexOf(q)>=0}):all;
  },
  listHtml:function(){
    var arr=this.items();if(!arr.length)return '<div class="empty">搵唔到呢類活動。試下其他字眼，或者撳「全部」。</div>';
    return arr.map(function(x){
      var action=x.kind==='game'?'<button class="btn sm gr" onclick="Lead.startGame(\''+x.id+'\',\''+esc(x.n)+'\')">▶ 即玩</button>':x.kind==='craft'?'<button class="btn sm" onclick="Play.craftDetail(\''+x.tid+'\','+x.si+')">🧭 睇步驟</button>':'<a class="btn sm ghost" href="'+x.url+'" target="_blank" rel="noopener">觀看 ↗</a>';
      return '<article class="activity-card"><div class="activity-icon">'+x.ic+'</div><div class="activity-copy"><h3>'+esc(x.n)+'</h3><small>'+esc(x.meta||x.src||'需要上網')+'</small><p>'+esc(x.d)+'</p>'+(x.mats&&x.mats.length?'<div class="activity-mats">🧺 '+esc(x.mats.join('、'))+'</div>':'')+'</div><div class="activity-action">'+action+'</div></article>';
    }).join('');
  },
  craftDetail:function(tid,si){
    var t=dur(tid);if(!t||!t.stages[si])return;Prepare._detailId=tid;
    Modal.open('<div class="eyebrow">🎨 手工準備卡</div><h3>'+esc(t.stages[si].n)+'</h3><div class="mute">來自「'+esc(t.n)+'」・可單獨使用</div>'+Prepare.brief(t.stages[si],si));
  }
};
