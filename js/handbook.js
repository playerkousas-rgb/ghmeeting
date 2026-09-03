/* 🦗 handbook.js — 手冊:支部內容、快樂傘、SFH、帶領貼士、關於 © 2026 Scout System */
var HB={
  tab:'core',
  html:function(){
    var tabs=[['core','⚖️ 核心內容'],['badge','🏅 獎章制度'],['chute','🌈 快樂傘'],['sfh','🛡️ 保護自己'],['tips','💡 帶領貼士'],['about','ℹ️ 關於']];
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
      f.song.map(function(l){return '<div style="font-size:1.1rem;font-weight:700">'+esc(l)+'</div>'}).join('')+
      '<div class="btns" style="margin-top:8px"><button class="btn sm" onclick="App.go(\'#lead\');setTimeout(function(){Lead._songSolo=1},50)">▶ 去帶領模式唱</button></div></div>'+
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
    return '<div class="card"><h2>🌈 快樂傘16式</h2><div class="mute" style="font-size:.83rem">安全三則:全體揸實傘邊・保持距離・傘面唔企人。「升降旗」玩法定全做埋團員章「揚動快樂傘」要求。</div>'+
      '<div class="grid2" style="margin-top:8px">'+DATA.chute.map(function(c){
        return '<div class="mem"><h4>'+c.ic+' '+c.n+' <span class="tag">'+c.tag+'</span></h4><div class="box" style="font-size:.85rem">'+esc(c.h)+'</div><small class="mute">💡 '+esc(c.t)+'</small></div>'}).join('')+'</div></div>';
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
  sfhGame:function(){Lead.quickTool('_');setTimeout(function(){
    document.getElementById('kidsArea').innerHTML=Lead.scr.judge();},80)},
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
