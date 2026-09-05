/* 🦗 play.js — 資深領袖的活動架：遊戲、手工、外部示範片分開找 © 2026 Scout System */
var Play={
  tab:'all',q:'',
  games:[
    {id:'traffic',ic:'🚦',n:'紅綠燈',meta:'實體跑動・5–10分鐘',d:'綠燈行、黃燈慢動作、紅燈定格；領袖手動或自動轉燈，唔使任何物資。'},
    {id:'leader',ic:'🙋',n:'領袖話',meta:'實體反應・5–10分鐘',d:'有「領袖話」先至做動作；冇講就係陷阱。14 種肢體指令由領袖撳出。'},
    {id:'catch',ic:'🦗',n:'草蜢跳格・實體九宮格',meta:'實體地貼・8–12分鐘',d:'地上貼 3×3 九宮格，螢幕叫「幾號・邊個位」，小朋友限時跳上去；秒數、回合、分組計分都自定。'},
    {id:'bodycard',ic:'🛡️',n:'身體地圖紅黃綠',meta:'教學＋肢體・10分鐘',d:'領袖撳部位講解，全場用手勢答：綠＝擊掌・黃＝雙手交叉・紅＝大聲「唔好！」'},
    {id:'recycle',ic:'♻️',n:'三色回收・四角分桶',meta:'實體走位・10分鐘',d:'四角貼桶標籤，螢幕出物件，小朋友行去嗰個角企好，領袖先至揭曉。'},
    {id:'task',ic:'🎯',n:'任務抽籤機・日行一善',meta:'領袖工具・5分鐘',d:'領袖轉輪盤抽任務，全體讀出＋講一句「我幾時做」，返屋企實踐打卡。'},
    {id:'flags',ic:'🇭🇰',n:'國旗與區旗敬禮',meta:'數碼儀式・8分鐘',d:'全螢幕旗幟展示與口令引導，配備響號敬禮音效。'},
    {id:'emotion',ic:'😊',n:'情緒面面觀・表情操',meta:'教學＋肢體・10分鐘',d:'領袖抽一個表情，全體一齊扮，再講一句「我幾時會咁」＋一個平復方法。'},
    {id:'clean',ic:'🧼',n:'洗手七步好寶寶',meta:'教學＋肢體・8分鐘',d:'20 秒計時自動逐步推進，全體徒手跟住搓；想慢教就用「◀／▶」逐步行。'},
    {id:'quiz',ic:'🏆',n:'問答擂台・四角搶答',meta:'實體走位・10分鐘',d:'四角貼 A／B／C／D 角牌，小朋友行去自己揀嘅角，領袖揭曉＋記分。'},
    {id:'memory',ic:'🃏',n:'記憶配對・口講位置',meta:'實體互動・10分鐘',d:'卡有編號，小朋友用口講「第 3 張同第 8 張」，領袖揭卡；配對成功全體拍手。'},
    {id:'guess',ic:'🔍',n:'估估下（剪影）',meta:'教學＋搶答・8分鐘',d:'先看黑色剪影，小朋友舉手搶答，領袖再俾提示或揭盅。'},
    {id:'judge',ic:'👍',n:'對錯法庭・左右分邊',meta:'實體走位・10分鐘',d:'左右貼 👍／👎，小朋友用腳表態行去嗰邊，領袖宣判＋請一位講原因。'},
    {id:'transport',ic:'🚗',n:'交通工具大圖鑑',meta:'教學＋肢體・8分鐘',d:'領袖逐個講，小朋友扮一次（揸巴士、搭船、讓座）＋講一句安全守則。'},
    {id:'foodrainbow',ic:'🌈',n:'彩虹健康飲食盤',meta:'教學＋肢體・10分鐘',d:'領袖揭一種顏色，小朋友講一樣嗰色嘅食物＋扮「食落肚」，數齊五色就拍手。'},
    {id:'moon',ic:'🌕',n:'中秋射月・真實投擲',meta:'實體投擲・8分鐘',d:'貼投擲線，輪流拋泡棉球向月亮靶；螢幕做靶同計分板，中冇中由領袖撳。'},
    {id:'rhythm',ic:'🎵',n:'節奏模仿・跟拍子',meta:'實體律動・8分鐘',d:'APP 出真實拍子聲（可揀 80／100／120 BPM），領袖做一次，全體跟住做。'},
    {id:'bpstory',ic:'🏕️',n:'貝登堡故事繪本',meta:'教學畫面・8分鐘',d:'四頁圖解故事卡，領袖翻頁講；講到左握禮即請小朋友伸左手握一次。'},
    {id:'scoutfamily',ic:'🌲',n:'童軍大家庭地圖',meta:'教學畫面・8分鐘',d:'領袖逐個支部講：小童軍到樂行童軍嘅年齡、徽章與銘言。'},
    {id:'chute',ic:'🌈',n:'快樂傘玩法卡',meta:'快樂傘・10分鐘',d:'抽一式，畫面有位置圖、步驟、口令和安全提示。'},
    {id:'story',ic:'📖',n:'故事寶盒',meta:'無需物資・8分鐘',d:'抽故事種子，領袖照住開場提示講，再問一條問題。'},
    {id:'roll',ic:'🎤',n:'音樂傳球點名',meta:'實體圍圈・5分鐘',d:'圍圈傳軟球，領袖停拍／撳「停球」，持球嗰位講名同一樣鍾意嘅嘢。'}
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
      if(!Craft.isCraft(s))return;
      var c=Craft.match(s);
      out.push({tid:t.id,si:i,ic:c?c.ic:'🎨',n:s.n,meta:(s.m||10)+'分鐘・'+t.mo,
        d:c?('成品長咁樣：'+c.look):((s.how||'按準備卡示範一次，再讓小朋友自己完成。')),
        mats:s.mats||[],ck:c?c.k:'',
        coach:c?('📚 有圖解自學卡・'+c.learn.length+' 步拆解＋後備版'):'🧯 未有圖解・用萬用六步救火'});
    })});
    return out;
  },
  html:function(){
    var h='<div class="card activity-hero"><span class="eyebrow">🎮 活動架</span><h2>想玩咩，就揀咩。</h2>'+
      '<p class="mute">螢幕只做<b>出題・叫位・計時・計分</b>，小朋友用身體玩。手工有「✂️ 即用紙」＋「📚 自學卡」。臨時開會：<button class="lnk" onclick="App.go(\'#pack\')">📦 集會套包</button>。</p>'+
      '<div class="activity-stat"><b>'+this.games.length+'</b><span>個即玩遊戲／數碼工具</span><b>'+this.craftItems().length+'</b><span>個手工活動（附自學卡）</span><b>'+this.videos.length+'</b><span>條參考片</span><b>'+Craft.list().length+'</b><span>張手工自學卡</span></div></div>'+
      '<div class="card"><div class="activity-tabs">'+[['all','全部'],['game','🎮 遊戲／工具'],['craft','🎨 手工'],['video','🎬 示範片']].map(function(x){return '<button class="pill '+(Play.tab===x[0]?'on':'')+'" onclick="Play.filterBy(\''+x[0]+'\')">'+x[1]+'</button>'}).join('')+'</div><input type="text" value="'+esc(this.q)+'" placeholder="🔎 搵活動，例如：回收、安全、交通、球、傘、燈籠、揮春" oninput="Play.search(this.value)"><div id="playList" class="activity-grid">'+this.listHtml()+'</div></div>';
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
    var arr=this.items();
    var cards=arr.length?arr.map(function(x){
      var action=x.kind==='game'?'<button class="btn sm gr" onclick="Lead.startGame(\''+x.id+'\',\''+esc(x.n)+'\')">▶ 即玩</button>':x.kind==='craft'?'<div class="act-col"><button class="btn sm gr" onclick="'+(x.ck?('Craft.open(\''+x.ck+'\')'):('Play.craftAny('+x.tid+','+x.si+')'))+'">'+(x.ck?'📚 跟我自學':'🧯 萬用六步')+'</button><button class="btn sm ghost" onclick="Play.craftDetail(\''+x.tid+'\','+x.si+')">🧭 睇步驟卡</button></div>':'<a class="btn sm ghost" href="'+x.url+'" target="_blank" rel="noopener">觀看 ↗</a>';
      var pm=(x.kind==='game'&&window.Lead&&Lead.playMeta)?Lead.playMeta[x.id]:null;
      var ktag=pm?'<span class="coach-tag '+(pm.kind==='實體互動'?'tag-play':'tag-tool')+'">'+(pm.kind==='實體互動'?'🧒 小朋友身體落場玩':pm.kind==='教學＋肢體'?'🧒 睇住做＋肢體':pm.kind==='領袖工具'?'🧑‍🏫 領袖操作・全場跟住做':'🧑‍🏫 領袖帶領')+'</span>':'';
      return '<article class="activity-card'+(x.kind==='craft'&&x.ck?' has-coach':'')+'"><div class="activity-icon">'+x.ic+'</div><div class="activity-copy"><h3>'+esc(x.n)+'</h3><small>'+esc(x.meta||x.src||'需要上網')+'</small>'+(x.kind==='craft'?'<span class="coach-tag">'+x.coach+'</span>':ktag)+'<p>'+esc(x.d)+'</p>'+(pm?'<div class="activity-mats">🧺 '+esc(pm.mats)+'</div>':(x.mats&&x.mats.length?'<div class="activity-mats">🧺 實物物資：'+esc(x.mats.join('、'))+'</div>':''))+'</div><div class="activity-action">'+action+'</div></article>';
    }).join(''):'<div class="empty">搵唔到呢類活動。試下其他字眼，或者撳「全部」。</div>';
    return cards+this.coachHtml();
  },
  coachHtml:function(){
    if(!(this.tab==='craft'||this.tab==='all'))return '';
    var covered={};this.craftItems().forEach(function(x){if(x.ck)covered[x.ck]=1});
    var q=this.q.trim().toLowerCase();
    var arr=Craft.list().filter(function(c){return !covered[c.k]&&(!q||(c.n+' '+c.look+' '+(c.need||'')).toLowerCase().indexOf(q)>=0)});
    if(!arr.length)return '';
    return '<div class="coach-wrap"><h4>📚 手工自學卡庫・即揀即學（未排入集會都用得）</h4><div class="coach-grid">'+
      arr.map(function(c){
        return '<article class="activity-card has-coach"><div class="activity-icon">'+c.ic+'</div><div class="activity-copy"><h3>'+esc(c.n)+'</h3><small>自學卡・'+c.learn.length+' 步拆解＋後備版＋常錯補救</small><span class="coach-tag">🎨 有成品示意圖，唔使領袖識做</span><p>成品長咁樣：'+esc(c.look)+'</p></div><div class="activity-action"><button class="btn sm gr" onclick="Craft.open(\''+c.k+'\')">📚 跟我自學</button></div></article>'
      }).join('')+'</div></div>';
  },
  craftDetail:function(tid,si){

    var t=dur(tid);if(!t||!t.stages[si])return;Prepare._detailId=tid;var st=t.stages[si],c=Craft.match(st);
    Modal.open('<div class="eyebrow">🎨 手工準備卡</div><h3>'+esc(st.n)+'</h3><div class="mute">來自「'+esc(t.n)+'」・可單獨使用</div>'+
      '<div class="attention" style="margin:8px 0"><b>未做過呢樣手工？</b> 先撳「跟我自學」—APP 有成品示意圖＋逐步拆解＋做唔掂嘅後備版；帶班時你只需要示範頭兩步。</div>'+
      '<div class="btns" style="margin:6px 0 10px"><button class="btn sm gr" onclick="Modal.close();Craft.open(\''+(c?c.k:'any')+'\')">📚 跟我自學</button>'+
      '<button class="btn sm" style="background:#2e7d32;color:#fff" onclick="Modal.close();App.go(\'#print\')">✂️ 去圖紙庫打印</button></div>'+
      Prepare.brief(st,si));
  },
  craftAny:function(tid,si){var t=dur(tid);if(!t||!t.stages[si])return;Craft.open('any')}
};
