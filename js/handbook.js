/* 🦗 handbook.js — 手冊:支部內容、快樂傘、SFH、帶領貼士、關於 © 2026 Scout System */
var HB={
  tab:'core',
  html:function(){
    var tabs=[['core','⚖️ 核心內容'],['craft','🎨 手工自學'],['kit','🧰 點預備'],['venue','📍 場地設置'],['games','🎮 遊戲帶領'],['badge','🏅 獎章制度'],['chute','🌈 快樂傘'],['sfh','🛡️ 保護自己'],['tips','💡 帶領貼士'],['about','ℹ️ 關於']];
    var h='<div class="card"><h2>📖 手冊</h2><div>'+tabs.map(function(t){return '<span class="pill'+(HB.tab===t[0]?' on':'')+'" onclick="HB.t(\''+t[0]+'\')">'+t[1]+'</span>'}).join('')+'</div></div>';
    h+=HB[HB.tab]();
    return h;
  },
  t:function(x){HB.tab=x;App.route()},
  kit:function(){
    return '<div class="card"><h2>🧰 做之前點預備</h2><div class="mute" style="font-size:.84rem">物資幾多・場地查乜・家長訊息・章項去邊教。想一次過印齊：去 <button class="lnk" onclick="App.go(\'#pack\')">📦 集會套包</button>。</div></div>'+
      Kit.hubHtml()+
      '<div class="card"><h3>🧺 執袋（開會前晚 10 分鐘版）</h3><div class="box">'+
      '① 今場物資逐樣放落袋（用準備卡嗰個「剔走」清單）<br>② 後備版材料（已剪好／印好）另外一個膠袋<br>③ 大人工具：釘書機、切孔器、熱熔膠（貼低「領袖用」字句）<br>④ 名牌／咭套＋後備筆 2 支<br>⑤ 急救包、哨子、後備水樽<br>⑥ 手機充滿＋充電棒（投影用）<br><small class="mute">想紙本：「集會 → 撳張卡 → 🖨️ 打印本集 A4 教案」，檢查表會跟住印埋。</small></div></div>';
  },

  /* 📍 場地設置：新手由零開始 */
  venue:function(){return Venue.html()},
  /* 🎮 遊戲帶領總表：小朋友做乜・領袖撳乜・物資・安全（同 APP 帶領畫面同一份資料） */
  games:function(){
    var keys=Object.keys(Lead.playMeta);
    var phys=keys.filter(function(k){return Lead.playMeta[k].kind==='實體互動'});
    var body=keys.filter(function(k){return Lead.playMeta[k].kind==='教學＋肢體'});
    var tool=keys.filter(function(k){return Lead.playMeta[k].kind!=='實體互動'&&Lead.playMeta[k].kind!=='教學＋肢體'});
    var rows=function(arr){
      return arr.map(function(k){
        var m=Lead.playMeta[k];
        return '<div class="gcard"><div class="gc-h">'+m.ic+' <b>'+esc(m.n)+'</b><span class="tag">'+esc(m.kind)+'</span></div>'+
          '<div class="gc-row"><b>🧒 小朋友</b>'+esc(m.kids)+'</div>'+
          '<div class="gc-row"><b>🧑‍🏫 領袖</b>'+esc(m.lead)+'</div>'+
          '<div class="gc-row"><b>🧺 物資</b>'+esc(m.mats)+'</div>'+
          '<div class="gc-row"><b>🛡️ 安全</b>'+esc(m.safe)+'</div>'+
          '<div class="btns"><button class="btn sm gr" onclick="Lead.startGame(\''+k+'\',\''+esc(m.n)+'\')">▶ 即開</button>'+
          (m.print?'<button class="btn sm ghost" onclick="PrintKit.openModal(\''+m.print+'\')">🖨️ 印教具</button>':'')+'</div></div>';
      }).join('');
    };
    return '<div class="card"><h2>🎮 遊戲帶領總表：螢幕點用，小朋友點玩</h2>'+
      '<div class="attention"><b>我哋唔係打電子 GAME。</b>呢個 APP 嘅螢幕只係幫你<b>出題・叫位・計時・計分・播拍子</b>；遊戲本身係小朋友喺場內用身體玩。'+
      '十幾個小朋友唔使圍住一部機搶住撳—佢哋嘅手應該喺隊友手上、地上、傘邊。<br>'+
      '<b>新領袖點用：</b>開會前睇呢一頁，揀 2–3 個遊戲 → 撳「🖨️ 印教具」印地貼／角牌 → 當日撳「▶ 即開」跟住畫面嘅「🧭 點樣帶」卡做就得。</div>'+
      '<div class="box" style="font-size:.86rem">📊 遊戲庫：'+keys.length+' 個活動—<b>'+phys.length+' 個實體走位／跳動遊戲</b>・'+body.length+' 個教學＋肢體・'+tool.length+' 個領袖工具／教學畫面。全部都有「小朋友做乜・領袖撳乜・物資・安全」四項。</div></div>'+
      '<div class="card"><h3>🧒 實體互動遊戲（小朋友落場玩）</h3><div class="mute" style="font-size:.82rem">呢啲遊戲小朋友要郁身體：跳格、行角、分邊、拋球、圍圈傳球、揚傘。螢幕由領袖操作。</div>'+
      '<div class="gcards">'+rows(phys)+'</div></div>'+
      '<div class="card"><h3>🖐️ 教學＋肢體（睇住畫面一齊做）</h3><div class="mute" style="font-size:.82rem">領袖撳住講，全體跟住做動作／答問題—唔使逐個上機。</div>'+
      '<div class="gcards">'+rows(body)+'</div></div>'+
      '<div class="card"><h3>🧑‍🏫 領袖工具・教學畫面</h3><div class="mute" style="font-size:.82rem">抽籤、故事、呼吸、圖鑑—領袖操作，全場一齊參與。</div>'+
      '<div class="gcards">'+rows(tool)+'</div></div>'+
      '<div class="card"><h3>🖨️ 想做實體教具？</h3><div class="box" style="font-size:.86rem">'+
      '・<b>九宮格地貼</b>：草蜢跳格用（A4 九格，可放大或直接貼地）＋玩法卡<br>'+
      '・<b>場地圖卡</b>：A／B／C／D 四角角牌・👍👎 分邊牌・三色回收桶標籤・射月靶與投擲線<br>'+
      '・<b>互動遊戲帶領卡</b>：每個遊戲一張 A4，寫晒小朋友做乜・領袖撳乜・物資・安全<br>'+
      '・<b>地貼／體能遊戲前檢查表</b>：10 項逐項剔（清場・地面・地貼・界線・鞋襪・分組・停手口令・距離・計時・水）</div>'+
      '<div class="btns" style="margin-top:8px"><button class="btn sm gr" onclick="App.go(\'#print\')">🖨️ 去教材打印中心</button>'+
      '<button class="btn sm ghost" onclick="Kit.openCheck(\'floor\')">🧭 地貼／體能遊戲檢查表</button></div></div>';
  },
  core:function(){
    var f=DATA.facts;
    return '<div class="card"><h2>⚖️ 小童軍核心內容</h2>'+
      '<div class="mem" style="margin:10px 0"><h4>🫡 誓詞</h4><div class="big" style="font-size:1.25rem;line-height:1.8">'+f.promise.map(esc).join('<br>')+'</div><small class="mute">'+esc(f.promise_en)+'</small></div>'+
      '<div class="mem" style="margin:10px 0"><h4>📜 規律</h4><div class="big" style="font-size:1.25rem">'+esc(f.law)+'</div><small class="mute">'+esc(f.law_en)+'</small></div>'+
      '<div class="grid2"><div class="mem"><h4>📣 口號</h4><div class="big" style="font-size:1.3rem">'+f.slogan+'</div></div>'+
      '<div class="mem"><h4>🏔️ 銘言</h4><div class="big" style="font-size:1.3rem">'+f.motto+'</div></div></div>'+
      '<div class="mem" style="margin:10px 0"><h4>🎵 主題曲 Greeny Marchin\u2019 On <span class="tag">'+f.songNote+'</span></h4>'+
      f.song.map(function(l,i){return '<div style="font-size:1.1rem;font-weight:700"><span class="tag">'+(i+1)+'</span>'+esc(l)+'</div>'}).join('')+
      '<div class="song-note" style="margin-top:8px"><b>新領袖唔識旋律？</b> 去帶領畫面撳「▶ 播放伴奏」：APP 會即時彈出寄調 London Bridge 嘅旋律（C 調・4/4・句尾拖長・句與句之間換氣・有和弦托底），先數 4 拍先入，跟住黃色句子唱。可以揀慢／中／快三種速度—第一次帶用「慢」。</div><div class="btns" style="margin-top:8px"><button class="btn sm" onclick="Lead.startStage(\'t02\',1)">▶ 直接開卡拉OK</button></div></div>'+
      '<div class="mem" style="margin:10px 0"><h4>🦗 支部小檔案</h4><div class="box">・年齡:4至7歲(8歲生日自動結束小童軍身分)<br>・特色:不設考驗,透過遊戲、唱歌、故事、律動、美勞學習<br>・目標:德智體群美靈平衡・認識自己、快樂同行<br>・團:最少6人、最多36人;領袖比例最好1:6<br>・快樂傘(PARABALLOON)係支部標誌,用於開會散會儀式</div></div></div>';
  },
  badge:function(){
    return '<div class="card"><h2>👑 團員章</h2><div class="box">參加<b>4次集會</b>並完成以下各項,正式成為小童軍:</div>'+
      DATA.badgeItems.map(function(b){return '<div class="chk">'+(b.k==='attend'?'📅':'✅')+b.t+'</div>'}).join('')+'</div>'+
      '<div class="card"><h2>🚩 進步獎章(四步)</h2><div class="road">'+
      DATA.steps.map(function(s,i){return '<div class="stop"><b><span style="color:'+s.c+'">⬤</span> '+s.n+'</b><br><small class="mute">'+s.mo+'</small></div>'}).join('')+
      '</div><div class="mute" style="font-size:.82rem">進度喺「🏅追蹤」記錄;建議喺集會/典禮中頒發。</div></div>'+
      '<div class="card"><h2>🦗 小草蜢獎章</h2><div class="box">完成進步獎章或年滿6歲開展「小草蜢歷險」:<b>七大範疇各完成2項體驗</b>(每範疇可獲體驗證書),全部完成=小草蜢獎章,約18個月,銜接幼童軍。</div>'+
      '<div class="grid2" style="margin-top:8px">'+DATA.ghDomains.map(function(d){return '<div class="mem"><h4>'+d.ic+' '+d.n+'</h4><small class="mute">2項體驗</small></div>'}).join('')+'</div></div>';
  },
  chute:function(){
    return '<div class="card"><h2>🌈 快樂傘：先學基本動作，再揀玩法</h2><div class="mute" style="font-size:.83rem">睇圖就會帶。安全三句：執實傘邊、留一隻手臂距離、傘面唔企人。</div>'+
      Img.fig('chute-top','圍圈執實傘邊','圍一圈，雙手執實傘邊，領袖喺外面打手勢')+
      Img.fig('chute-steps','三步：執傘、揚高、蒙古包','① 執實 ② 數一二三揚高 ③ 踏前趴低變蒙古包')+Lead.parachuteSvg('open')+
      '<div class="attention"><b>開會口令</b> 「面向傘、跪低、執實」→ 一、二、三揚傘。<br><b>散會口令</b> 「停、口號、慢慢放低」→ 傘落到膝頭才整理。</div>'+
      '<h3 style="margin-top:16px">16式玩法卡</h3><div class="grid2" style="margin-top:8px">'+DATA.chute.map(function(c,i){
        return '<div class="mem"><h4>'+c.ic+' '+c.n+' <span class="tag">'+c.tag+'</span></h4><div class="box" style="font-size:.85rem">'+esc(c.h)+'</div><small class="mute">💡 '+esc(c.t)+'</small><div class="btns"><button class="btn sm gr" onclick="Lead.startChute('+i+')">▶ 開圖卡</button></div></div>'}).join('')+'</div></div>';
  },
  sfh:function(){
    return '<div class="card"><h2>🛡️ 保護自己免受傷害</h2><div class="box">團員章必須項。學習目標:</div>'+
      '<div class="chk">1. 認識身體是自己的,未經允許無人可以觸碰</div>'+
      '<div class="chk">2. 分辨「好觸摸」與「壞觸摸」</div>'+
      '<div class="chk">3. 學習講「不」及搵信任的大人</div>'+
      '<div class="chk">4. 認識求助對象(父母、老師、領袖、警察)</div>'+
      '<div class="chk">5. 用遊戲、圖畫書、角色扮演學習</div>'+
      '<hr class="soft"><b>常用活動</b><div class="box" style="font-size:.88rem">身體地圖紅黃綠・好/壞觸摸分類・信任圈・我話唔好角色扮演・安全密語・安全故事時間</div>'+
      '<div class="btns"><button class="btn sm" onclick="HB.sfhGame()">👨‍⚖️ 即玩:對錯法庭(SFH篇)</button></div></div>';
  },
  sfhGame:function(){Lead.startGame('judge','對錯法庭 (保護自己篇)');},
  craft:function(){
    var rules=[
      ['📱','開會前 3 分鐘','撳「跟我自學」睇完成品圖＋逐步拆解；唔使自己先整好一份帶去—成品圖 APP 畫俾你睇。'],
      ['🧩','一次一個動作','「摺埋再剪」係兩個動作—拆到一句做得完，先至有人跟得到。'],
      ['🙋','做完一步舉手','設檢查位，通過先做下一步；避免半班越做越亂。'],
      ['🧑‍🤝‍🧑','大人一檔','打孔、大剪、熱溶膠、白膠水集中喺領袖位；小朋友只拿安全剪刀與貼紙。'],
      ['🛟','零失敗後備','每樣手工都寫咗「做唔掂版」—卡咗好耐嘅人即刻轉，唔會喊住散會。'],
      ['👏','收結一定要做','每人一句「我整咗××」＋大合照：完成感係收結帶嚟嘅，唔係靚仔帶嚟。']
    ];
    var h='<div class="card"><h2>🎨 手工自學：領袖先識做，先教到人</h2>';
    h+='<div class="attention"><b>兩疊紙，分清楚：</b>「✂️ 即用紙」係小朋友用嘅（印完即剪，紙上冇說明）；「📚 自學卡」係你自己睇嘅說明書。</div>';
    h+='<div class="craft-rules">'+rules.map(function(x){return '<div class="cr-row"><span>'+x[0]+'</span><div><b>'+esc(x[1])+'</b><small>'+esc(x[2])+'</small></div></div>'}).join('')+'</div>';
    h+='<h3 style="margin-top:14px">已附自學卡嘅手工（'+Craft.list().length+' 樣）</h3>';
    h+='<div class="mute" style="font-size:.82rem">每樣都包括：成品示意圖・關鍵摺法圖解（部分）・逐步自學・帶班拆法・常錯補救・後備版・時間剪法・安全提示。自己加嘅活動用「萬用六步」一樣搞得掂。</div>';
    h+=Craft.indexHtml();
    h+='<h3 style="margin-top:14px">✂️ 即用紙（小朋友用・印完即剪）</h3>';
    h+='<div class="mute" style="font-size:.82rem">剪線・摺線・描紅・塗色格，一張紙一件事。</div>';
    h+=Sheets.listHtml();
    h+='<div class="btns" style="margin-top:12px"><button class="btn sm gr" onclick="App.go(\'#pack\')">📦 印齊今場套包</button><button class="btn sm" onclick="PrintKit.openModal(\'craft-coach\')">🖨️ 自學卡總表</button><button class="btn sm ghost" onclick="Craft.open(\'any\')">🧯 萬用六步</button></div>';
    h+='</div>';
    return h;
  },
  tips:function(){
    return '<div class="card"><h2>💡 帶領貼士(4-7歲)</h2><div class="box">'+
      '<b>① 5-10分鐘一轉</b><br>幼兒專注力短,每個環節唔好過15分鐘,動靜交替:狂野遊戲後接靜態故事/靜息。<br><br>'+
      '<b>② 指令短過一句</b><br>「執住傘邊——蹲低!」好過長篇解釋。先示範、後邀請。<br><br>'+
      '<b>③ 儀式感係魔法</b><br>開會散會快樂傘、口號、敬禮,次次一樣——安全感+歸屬感就嚟自重複。<br><br>'+
      '<b>④ 人人有獎</b><br>計分遊戲記得輪流贏;讚具體行為:「你剛才讓位俾隊友,好嘢!」<br><br>'+
      '<b>⑤ 預備執輸</b><br>環節爛咗/唔啱玩?即刻轉後備:快樂傘一式、律動指令、靜息呼吸。<br><br>'+
      '<b>⑥ 一句完場</b><br>散會前圍圈,每人講「今日最開心係……」,家長接得放心。<br><br>'+
      '<b>⑦ 影相同意（一次搞掂，一年唔使再問）</b><br>'+esc(Kit.photo.replace(/^📷\s*/,''))+'<br><small class="mute">想直接抄範本：去「🧰 點預備」→ 家長訊息範本。</small></div></div>';
  },
  about:function(){
    return '<div class="card"><h2>ℹ️ 關於</h2><div class="box">🦗 <b>小童軍集會助手 Grasshopper Hub</b><br>由年度計劃到散會嗰刻:規劃→執集會→帶領→追蹤。<br><br>'+
      '📚 內容依據《小童軍活動指引》第三版(2026年8月,2026-08-15生效)之訓練綱要編寫。<br><br>'+
      '🔒 團員資料只儲存在你自己裝置嘅瀏覽器,不會上傳。<br><br>'+
      '📴 支援離線使用:第一次開啟後,冇網都用到(加至主畫面更好用)。<br><br>'+
      '© 2026 Scout System</div>'+
      '<div class="mute" style="font-size:.8rem;margin-top:8px">此為非官方輔助工具,一切以香港童軍總會最新公佈為準。官方資料:小童軍支部網站 sites.google.com/scouting.org.hk/grasshopper</div></div>';
  }
};
