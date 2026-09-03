/* 🦗 handbook.js — 手冊:支部內容、快樂傘、SFH、帶領貼士、關於 © 2026 Scout System */
var HB={
  tab:'core',
  html:function(){
    var tabs=[['core','⚖️ 核心內容'],['craft','🎨 手工自學'],['badge','🏅 獎章制度'],['chute','🌈 快樂傘'],['sfh','🛡️ 保護自己'],['tips','💡 帶領貼士'],['about','ℹ️ 關於']];
    var h='<div class="card"><h2>📖 手冊</h2><div>'+tabs.map(function(t){return '<span class="pill'+(HB.tab===t[0]?' on':'')+'" onclick="HB.t(\''+t[0]+'\')">'+t[1]+'</span>'}).join('')+'</div></div>';
    h+=HB[HB.tab]();
    return h;
  },
  t:function(x){HB.tab=x;App.route()},
  core:function(){
    var f=DATA.facts;
    return '<div class="card"><h2>⚖️ 小童軍核心內容</h2>'+
      '<div class="mem" style="margin:10px 0"><h4>🫡 誓詞</h4><div class="big" style="font-size:1.25rem;line-height:1.8">'+f.promise.map(esc).join('<br>')+'</div><small class="mute">'+esc(f.promise_en)+'</small></div>'+
      '<div class="mem" style="margin:10px 0"><h4>📜 規律</h4><div class="big" style="font-size:1.25rem">'+esc(f.law)+'</div><small class="mute">'+esc(f.law_en)+'</small></div>'+
      '<div class="grid2"><div class="mem"><h4>📣 口號</h4><div class="big" style="font-size:1.3rem">'+f.slogan+'</div></div>'+
      '<div class="mem"><h4>🏔️ 銘言</h4><div class="big" style="font-size:1.3rem">'+f.motto+'</div></div></div>'+
      '<div class="mem" style="margin:10px 0"><h4>🎵 主題曲 Greeny Marchin\u2019 On <span class="tag">'+f.songNote+'</span></h4>'+
      f.song.map(function(l,i){return '<div style="font-size:1.1rem;font-weight:700"><span class="tag">'+(i+1)+'</span>'+esc(l)+'</div>'}).join('')+
      '<div class="song-note" style="margin-top:8px"><b>新領袖唔識旋律？</b> 去帶領畫面按「播放伴奏」，APP 會用寄調 London Bridge 的旋律帶住唱；先聽一次，再逐句唱。</div><div class="btns" style="margin-top:8px"><button class="btn sm" onclick="Lead.startStage(\'t02\',1)">▶ 直接開卡拉OK</button></div></div>'+
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
    return '<div class="card"><h2>🌈 快樂傘：先學基本動作，再揀玩法</h2><div class="mute" style="font-size:.83rem">新領袖唔需要靠估。先看下面動作圖，開會／散會照做；之後每次只揀一式遊戲。安全優先：揸實傘邊・留一隻手臂距離・傘面唔企人。</div>'+Lead.parachuteSvg('open')+
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
    h+='<div class="attention"><b>「先睇成品」對新領袖冇用—因為自己未做過。</b> 所以呢度每樣手工都有兩份教材：<b>俾小朋友睇嘅成品示意圖</b>（APP 畫出嚟，唔使你帶實物）＋<b>俾領袖自己睇嘅逐步拆解</b>（物資點備、一步步跟住做、最易錯喺邊、做唔掂有咩後備）。</div>';
    h+='<div class="craft-rules">'+rules.map(function(x){return '<div class="cr-row"><span>'+x[0]+'</span><div><b>'+esc(x[1])+'</b><small>'+esc(x[2])+'</small></div></div>'}).join('')+'</div>';
    h+='<h3 style="margin-top:14px">已附自學卡嘅手工（'+Craft.list().length+' 樣）</h3>';
    h+='<div class="mute" style="font-size:.82rem">每樣都包括：成品示意圖・關鍵摺法圖解（部分）・逐步自學・帶班拆法・常錯補救・後備版・時間剪法・安全提示。自己加嘅活動用「萬用六步」一樣搞得掂。</div>';
    h+=Craft.indexHtml();
    h+='<div class="btns" style="margin-top:12px"><button class="btn sm gr" onclick="Craft.open(\'any\')">🧯 萬用六步（任何手工適用）</button><button class="btn sm" onclick="PrintKit.openModal(\'craft-coach\')">🖨️ 打印 A4 自學總表</button><button class="btn sm ghost" onclick="App.go(\'#play\')">🎮 去活動架揀手工</button></div>';
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
      '<b>⑥ 一句完場</b><br>散會前圍圈,每人講「今日最開心係……」,家長接得放心。</div></div>';
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
