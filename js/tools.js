/* 🦗 tools.js — 🎲 快鍵（🅱️ 工具箱）：控場救急＋臨時加節目，全部一撳即開 © 2026 Scout System
   定位：下方工具箱最後一格。集會途中先至會撳嘅嘢全部擺呢度——
     ・⚡ 臨時加節目：突然想加一節，唔使準備、唔使印嘢，撳一下全螢幕就開。
     ・🧰 控場快鍵：嘈、亂、要分組、要計分、要佢哋靜——一撳搞掂。
   呢頁唔負責教你點帶（嗰啲喺 🅰️ 上方集會五步）；呢頁只負責「而家即刻要用」。 */
var Tools={
  /* ---------- ⚡ 臨時加節目：零物資、零準備 ---------- */
  PROGRAMS:[
    ['🌈','快樂傘抽一式','唔知揀邊式就交俾 APP','Chute.random()'],
    ['📖','故事寶盒','抽個故事種子，即場講','Lead.startGame(\'story\',\'故事寶盒\')'],
    ['🎤','音樂傳球點名','停球嗰位講名＋一樣鍾意嘅嘢','Lead.startGame(\'roll\',\'音樂傳球點名\')'],
    ['🤸','領袖話（律動指令）','有「領袖話」先至做，做錯坐低','Lead.startGame(\'leader\',\'領袖話\')'],
    ['🏆','問答擂台・四角搶答','行去自己揀嘅角，領袖揭曉記分','Lead.startGame(\'quiz\',\'問答擂台・四角搶答\')'],
    ['😊','情緒面面觀','抽表情全體扮，再講一句平復方法','Lead.startGame(\'emotion\',\'情緒面面觀・表情操\')'],
    ['🧼','洗手七步歌','20 秒計時，全體跟住搓','Lead.startGame(\'clean\',\'洗手七步好寶寶\')'],
    ['🚦','紅綠燈','消耗體力一流，零物資','Lead.startGame(\'traffic\',\'紅綠燈\')'],
    ['🔍','估估下（剪影）','睇剪影估嘢，靜態之選','Lead.startGame(\'guess\',\'估估下（剪影）\')'],
    ['🍃','靜息呼吸','玩到太興奮，一齊唞氣收','Lead.quickTool(\'breath\')']
  ],
  /* ---------- 🧰 控場快鍵：呢秒就要用 ---------- */
  QUICK:[
    ['🤫','5 秒安靜','大 🤫 全螢幕＋倒數，變木頭人','Lead.quietQuick()'],
    ['🎺','吹哨集合','嗶————！一聲全場停','Sfx.whistle();toast(\'🎺 嗶————！集合！\')'],
    ['📯','號角','散會／頒獎用，氣勢即刻有','Sfx.horn();toast(\'📯 號角響起！\')'],
    ['🎡','抽籤轉盤','用團員名單轉，抽中邊個就邊個','Lead.quickTool(\'wheel\')'],
    ['👥','隨機分組','2／3／4 組，一撳分好','Lead.quickTool(\'group\')'],
    ['🥇','計分板','加隊、加減分，全場睇到','Lead.quickTool(\'score\')'],
    ['⏳','大聲倒數','30秒／1分／2分／5分，最後 5 秒有聲','Lead.quickTool(\'cd\')'],
    ['🥁','拍子機','80–140 BPM；2 拍揚傘、3 拍跳舞','Lead.quickTool(\'metro\')'],
    ['📣','音效板','叮、錯、時間到、恭喜','Lead.quickTool(\'sfx\')'],
    ['🧭','今場檢查表','邊項未剔，一眼睇到','Kit.openCheckFor(Pack.meet().m)']
  ],
  html:function(){
    var h='<div class="card tools-hero"><span class="eyebrow">🎲 快鍵</span>'+
      '<h2>而家即刻要用的，全部喺呢度。</h2>'+
      '<p class="mute">途中先至會撳嘅嘢：突然想<b>加個節目</b>、要佢哋<b>靜落嚟</b>、要<b>分組計分</b>——一撳即開，唔使準備。'+
      '想由頭帶一場？去 <button class="lnk" onclick="App.go(\'#lead\')">▶️ 帶領</button>。</p>'+
      '<div class="btns"><button class="btn gr" onclick="App.quickHub()">⚡ 隨手開會面板</button>'+
      '<button class="btn ghost" onclick="App.startInstant(\'general\',40)">🎲 零準備即興集會（40分）</button></div></div>';

    /* ① 臨時加節目 */
    h+='<div class="card"><h3>⚡ 臨時加節目 <span class="tag">零物資・即開</span></h3>'+
      '<div class="mute" style="font-size:.82rem">環節快過頭／唔啱玩／想加多節？撳一下全螢幕就開，領袖照住畫面做。</div>'+
      '<div class="tk-grid">'+this.PROGRAMS.map(function(p){
        return qBtn(p[0],p[1],p[2],p[3])}).join('')+'</div></div>';

    /* ② 控場快鍵 */
    h+='<div class="card"><h3>🧰 控場快鍵 <span class="tag">呢秒就要用</span></h3>'+
      '<div class="tk-grid">'+this.QUICK.map(function(p){
        return qBtn(p[0],p[1],p[2],p[3])}).join('')+'</div>'+
      '<div class="mute" style="font-size:.78rem;margin-top:8px">💡 抽籤／分組會自動用返「🏅 記錄」入面嘅團員名單。</div></div>';

    /* ③ 頂位：連集會都未砌 */
    h+='<div class="card"><h3>🎲 臨時頂位：連集會都未砌</h3>'+
      '<div class="mute" style="font-size:.82rem">揀個主題＋時長，APP 即刻砌好一場（套包照印、畫面照帶）。</div>'+
      '<div class="tk-grid">'+
      qBtn('🎲','歡樂綜合','40 分鐘・動靜交替','App.startInstant(\'general\',40)')+
      qBtn('🛡️','身體安全','40 分鐘・保護自己','App.startInstant(\'safety\',40)')+
      qBtn('🧼','健康技能','40 分鐘・洗手・飲食','App.startInstant(\'health\',40)')+
      qBtn('♻️','環保自然','40 分鐘・回收・大自然','App.startInstant(\'nature\',40)')+
      qBtn('🏃','體能反應','40 分鐘・郁到盡','App.startInstant(\'fitness\',40)')+
      qBtn('✨','60 分鐘全能','大集會・一次過帶晒','App.startInstant(\'general\',60)')+
      '</div></div>';

    /* ④ 其他入口：唔常用但要搵得到 */
    h+='<div class="card"><h3>🔎 其他入口</h3><div class="tk-grid">'+
      qBtn('🔍','全站搵嘢','範本・手工・圖紙・物料，一框搵晒','Kit.searchOpen()')+
      qBtn('🧰','點預備總覽','物資幾多・檢查表・家長訊息','Kit.hubOpen()')+
      qBtn('📖','手冊','誓詞・規律・獎章・帶領貼士','App.go(\'#book\')')+
      qBtn('📍','場地設置','六分區・30 分鐘清單・規矩','Venue.open()')+
      '</div></div>';
    return h;
  }
};
