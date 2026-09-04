/* 🦗 print.js — 小童軍專屬 A4 打印教材套包庫 (Printable Teaching Kits & Worksheets) © 2026 Scout System */
var PrintKit={
  tab:'all',
  
  kits:[
    {
      id:'lesson-plans',
      cat:'plan',
      ic:'📋',
      n:'30次集會完整 A4 備課教案包',
      desc:'含時程表、物資清單、領袖講稿、動作圖解、安全注意事項與點名表。',
      pages:'全套 30 頁 (按需單頁列印)',
      render:function(tid){return PrintKit.renderLessonPlan(tid||'t01')}
    },
    {
      id:'sfh-cards',
      cat:'cards',
      ic:'🛡️',
      n:'身體界線紅黃綠圖卡套包 (Safe from Harm)',
      desc:'4張紅黃綠標誌卡 + 8張身體部位指示卡 + 6張情景求助卡，剪開即可用。',
      pages:'A4 2頁 (雙面/剪裁版)',
      render:function(){return PrintKit.renderSfhCards()}
    },
    {
      id:'recycle-cards',
      cat:'cards',
      ic:'♻️',
      n:'三色回收分類圖卡套包 (24件物品實物卡)',
      desc:'藍黃綠三色桶標誌卡 + 18張常見垃圾圖卡，剪裁後進行分組接力賽。',
      pages:'A4 2頁 (分類卡+桶標誌)',
      render:function(){return PrintKit.renderRecycleCards()}
    },
    {
      id:'venue',
      cat:'plan',
      ic:'📍',
      n:'場地設置卡（六分區・30 分鐘時間表・五條規矩・救急）',
      desc:'第一次去新場地／新領袖未試過設場用：六個分區貼邊・幾大・最易錯，開場前 30 分鐘逐步清單（連散場），開會前 3 分鐘照讀嘅五條規矩，人數分組對策，八個現場救急做法。',
      pages:'A4 2 頁（到場跟住剔）',
      render:function(){return Venue.printSheet()}
    },
    {
      id:'floor-grid',
      cat:'cards',
      ic:'🦗',
      n:'草蜢跳格・實體九宮格地貼＋玩法卡',
      desc:'A4 九宮格地貼（1–9 號，可放大影印或直接逐格剪開貼地）＋玩法卡：限時跳格規則、秒數對照、分組計分方法、安全提醒與三種變化玩法。',
      pages:'A4 2 頁（地貼＋玩法卡）',
      render:function(){return PrintKit.renderFloorGrid()}
    },
    {
      id:'corner-signs',
      cat:'cards',
      ic:'🅰️',
      n:'實體遊戲場地圖卡（四角角牌・👍👎分邊・回收桶・月亮靶）',
      desc:'一疊印齊實體遊戲要用嘅場地標記：A／B／C／D 四角搶答角牌、👍👎 對錯法庭分邊牌、三色回收桶標籤、中秋射月靶與投擲線牌。剪開貼牆／貼地即用。',
      pages:'A4 2 頁（大標記裁切版）',
      render:function(){return PrintKit.renderCornerSigns()}
    },
    {
      id:'game-cards',
      cat:'plan',
      ic:'🎮',
      n:'互動遊戲帶領卡（小朋友做乜・領袖撳乜・物資・安全）',
      desc:'由 APP 遊戲庫自動生成：每個遊戲一張卡，寫明小朋友用身體做乜、領袖撳邊個掣、要乜物資場地、安全提醒。新領袖開會前睇一疊就帶到全場遊戲。',
      pages:'A4 每頁 2 張卡（共約 10 頁）',
      render:function(){return PrintKit.renderGameCards()}
    },
    {
      id:'task-cards',
      cat:'cards',
      ic:'🎯',
      n:'小童軍日行一善／家務任務抽籤卡',
      desc:'12張精美善行與家務任務卡，帶回家實踐日行一善。',
      pages:'A4 1頁 (12格抽籤卡)',
      render:function(){return PrintKit.renderTaskCards()}
    },
    {
      id:'emotion-cards',
      cat:'cards',
      ic:'😊',
      n:'幼兒情緒面面觀表情卡與平復指南',
      desc:'喜怒哀樂大圖卡 + 幼兒情緒平復四部曲指南。',
      pages:'A4 1頁 (8張表情卡+指南)',
      render:function(){return PrintKit.renderEmotionCards()}
    },
    {
      id:'transport-cards',
      cat:'cards',
      ic:'🚌',
      n:'交通工具與社區安全常識圖卡',
      desc:'香港雙層巴士、港鐵、電車、救護車圖卡 + 乘車安全三守則。',
      pages:'A4 1頁 (8張交通安全卡)',
      render:function(){return PrintKit.renderTransportCards()}
    },
    {
      id:'nametag-sheet',
      cat:'worksheet',
      ic:'🏷️',
      n:'我是誰・自畫像與名牌底紙',
      desc:'第1次集會破冰必備：名牌裁切框、小草蜢圖鑑框與自畫像畫紙。',
      pages:'A4 1頁 (4人份名牌/自畫像)',
      render:function(){return PrintKit.renderNameTagSheet()}
    },
    {
      id:'craft-ctrl',
      cat:'coach',
      ic:'🧒',
      n:'4–7 歲手工控場卡（派料・一步一停・加任務・收工）＋15 個手工年齡分工速查',
      desc:'小童軍唔係唔聽話，係聽唔到三句指令。呢張卡貼喺枱邊：開工前 3 分鐘點做、一人一格點派料、一步一停嘅停止訊號、做完嘅人點安置、喊唔肯做點處理、爭執點拆、收工 3 分鐘；仲有五樣一定唔好做、安全紅線、30 分鐘手工時間表，同 15 個手工嘅 4–5 歲／6–7 歲分工速查。',
      pages:'A4 2 頁（貼枱邊・開工前睇一次）',
      render:function(){return Craft.controlSheet()+Craft.ctrlTable()}
    },
    {
      id:'craft-coach',
      cat:'worksheet',
      ic:'🎨',
      n:'手工自學卡（領袖版）・逐步圖解與後備版',
      desc:'每樣手工一張 A4：成品標準、物資與備料、領袖自己先學嘅逐步拆解、最易錯位與補救、零失敗後備版。新領袖唔識做都帶得。',
      pages:'A4 1頁／樣（可先睇總表再印單樣）',
      render:function(ck){return Craft.printSheet(ck)}
    },
    {
      id:'checklists',
      cat:'plan',
      ic:'🧭',
      n:'集會執行檢查表（戶外・玩水・頒獎・美勞）',
      desc:'將「檢查場地、執齊物資」呢類口號變返逐項可剔清單：戶外出發前 10 項、玩水安全 10 項、頒獎典禮 10 項、美勞前 10 項，附影相私隱四句。',
      pages:'A4 1–4 頁（全套或單張）',
      render:function(k){return Kit.printSheet(k)}
    },
    {
      id:'meet-pack',
      cat:'plan',
      ic:'🗂️',
      n:'今場全套（教案＋檢查表＋家長通知＋執袋單）',
      desc:'一疊印齊：本集 A4 教案、今場用得上嘅執行檢查表、已填好主題嘅家長通知、同埋放袋前逐樣剔嘅執袋單。開會前一晚一次過搞掂。',
      pages:'A4 3–5 頁／集會',
      render:function(tid){return PrintKit.renderMeetPack(tid)}
    },
    {
      id:'cert-sheet',
      cat:'admin',
      ic:'🏅',
      n:'嘉許狀（即時頒發版・自動按名單出）',
      desc:'跟團員名單一人一張，內容自動填咗嘅團員章項目；無名單就出空白版即場寫。官方獎章證書仍需按旅團程序向總部申請。',
      pages:'A4 1 頁／人',
      render:function(){return PrintKit.renderCertSheet()}
    },
    {
      id:'goodturn-sheet',
      cat:'worksheet',
      ic:'📅',
      n:'小童軍日行一善雪櫃打卡承諾卡',
      desc:'7天家務善行記錄表，附家長簽名蓋印欄，完成可貼在雪櫃。',
      pages:'A4 1頁 (2人份承諾卡)',
      render:function(){return PrintKit.renderGoodTurnSheet()}
    },
    {
      id:'rainbow-placemat',
      cat:'worksheet',
      ic:'🍽️',
      n:'五色彩虹健康飲食餐盤底紙',
      desc:'紅橙綠白紫五色餐盤分區，可供幼兒貼食物小貼紙或繪畫。',
      pages:'A4 1頁 (幼兒餐盤底紙)',
      render:function(){return PrintKit.renderRainbowPlacemat()}
    },
    {
      id:'gh-passport',
      cat:'worksheet',
      ic:'🦗',
      n:'小草蜢歷險七大範疇印章護照',
      desc:'A4 對摺護照，收錄戶外、運動、創新等七大範疇印章打卡格。',
      pages:'A4 1頁 (對摺成小手冊)',
      render:function(){return PrintKit.renderGhPassport()}
    },
    {
      id:'uniform-guide',
      cat:'admin',
      ic:'🧣',
      n:'整理旅巾三步指引與制服徽章位置海報',
      desc:'清晰三步捲巾圖解，團員章及進步獎章左胸左袖佩戴指南。',
      pages:'A4 1頁 (海報/領袖文件夾)',
      render:function(){return PrintKit.renderUniformGuide()}
    },
    {
      id:'promise-poster',
      cat:'admin',
      ic:'📜',
      n:'小童軍誓詞・規律・主題曲歌詞大字報',
      desc:'字體清晰大號，適合張貼在集會禮堂牆上或夾在講台備用。',
      pages:'A4 1頁 (掛牆大字版)',
      render:function(){return PrintKit.renderPromisePoster()}
    },
    {
      id:'attend-roster',
      cat:'admin',
      ic:'📝',
      n:'旅團全年度集會出席與進度簽到表',
      desc:'橫向表格，可一次記錄 20 位小童軍 22 次集會出席與獎章進度。',
      pages:'A4 橫向 1頁 (全團簽到表記錄)',
      render:function(){return PrintKit.renderAttendRoster()}
    }
  ],

  html:function(){
    var cats=[['all','全部教材'],['plan','📋 備課教案'],['cards','✂️ 實體圖卡'],['worksheet','📝 工作紙/手工'],['admin','📊 行政海報']];
    var filtered=PrintKit.tab==='all'?PrintKit.kits:PrintKit.kits.filter(function(k){return k.cat===PrintKit.tab});
    var h='<div class="card printable-hero">'+
      '<span class="eyebrow">🖨️ 教材套包打印中心</span>'+
      '<h2>用心備課・一鍵打印實體教材</h2>'+
      '<p class="mute">為用心準備實體集會的領袖提供<b>標準 A4 格式教材套包</b>：教案講稿、活動圖卡、工作紙、承諾卡與行政簽到表。撳一下「🖨️ 列印」即自動排版排妥，直接出 PDF 或打印機！</p>'+
      '<div class="activity-tabs" style="margin-top:12px">'+
        cats.map(function(c){return '<button class="pill '+(PrintKit.tab===c[0]?'on':'')+'" onclick="PrintKit.setTab(\''+c[0]+'\')">'+c[1]+'</button>'}).join('')+
      '</div>'+
    '</div>'+
    '<div class="grid2">'+
      filtered.map(function(k){
        return '<div class="card print-kit-card">'+
          '<div class="p-ic">'+k.ic+'</div>'+
          '<div class="p-body">'+
            '<h4>'+esc(k.n)+'</h4>'+
            '<div class="p-pages">📄 '+esc(k.pages)+'</div>'+
            '<p class="mute" style="font-size:.82rem;line-height:1.4;margin:4px 0 10px">'+esc(k.desc)+'</p>'+
            '<div class="btns">'+
              '<button class="btn sm gr" onclick="PrintKit.openModal(\''+k.id+'\')">🖨️ 預覽及列印</button>'+
            '</div>'+
          '</div>'+
        '</div>';
      }).join('')+
    '</div>';
    return h;
  },

  setTab:function(t){
    PrintKit.tab=t;App.route();
  },

  openModal:function(kitId, extra){
    var kit=PrintKit.kits.find(function(k){return k.id===kitId});
    if(!kit)return;
    var contentHtml=kit.render(extra);
    var h='<div class="print-preview-modal">'+
      '<div class="print-preview-top">'+
        '<div><h3>'+kit.ic+' '+esc(kit.n)+'</h3><small class="mute">A4 標準列印排版・'+esc(kit.pages)+'</small></div>'+
        '<div class="btns"><button class="btn gr" onclick="PrintKit.triggerPrint()"><span style="font-size:1.1rem">🖨️</span> 即刻列印 / 存為 PDF</button></div>'+
      '</div>'+
      '<div class="print-sheet-wrapper" id="printableArea">'+
        contentHtml+
      '</div>'+
    '</div>';
    Modal.open(h);
  },

  triggerPrint:function(){
    window.print();
  },

  /* ==========================================================================
     打印模板渲染函數 (A4 Standard Printable Templates)
     ========================================================================== */

  /* 1. 30次集會專屬備課教案 */
  /* 11c. 今場全套：直接組裝（教案 + Kit 後段） */
  renderMeetPack:function(tid){
    return this.renderLessonPlan(tid)+Kit.printPack(tid);
  },

  /* 11b. 嘉許狀：按名單一人一張（內部即時鼓勵版） */
  renderCertSheet:function(){
    var mem=Store.get('members',[]);
    if(!mem.length)return Kit.printCert('','小童軍集會全程參與');
    return mem.map(function(m,i){
      var items=(DATA.badgeItems||[]).filter(function(b){return m.badge&&m.badge[b.k]}).map(function(b){return b.t});
      var txt=items.length?('團員章進階：'+items.join('、')):'全年小童軍集會參與（出席 '+Track.attCount(m)+' 次）';
      return (i?'<div class="pbreak"></div>':'')+Kit.printCert(m.n,txt);
    }).join('');
  },

  /* 12a. 草蜢跳格：實體九宮格地貼 + 玩法卡 */
  renderFloorGrid:function(){
    var POS=['左上','中上','右上','左中','正中','右中','左下','中下','右下'];
    return '<div class="a4-sheet floor-grid-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 11</span> <b>🦗 草蜢跳格・實體九宮格地貼（1–9 號）</b></div>'+
      '<div class="print-cut-notice">✂️ 兩種用法：① 直接影印放大成 A3／A2，每格約 60×60 厘米貼地；② 沿虛線剪開 9 格，每格貼喺地上（格距 10 厘米）。號碼要同 APP 畫面一樣：由左上 1 數到右下 9。</div>'+
      '<div class="floor-nine">'+[0,1,2,3,4,5,6,7,8].map(function(i){
        return '<div class="fn-cell"><span class="fn-no">'+(i+1)+'</span><span class="fn-pos">'+POS[i]+'</span></div>'}).join('')+'</div>'+
      '<div class="p-note" style="margin-top:10px">💡 冇打印機？用膠紙／粉筆喺地貼九個格，每格入面用馬克筆寫大號 1–9 就得（10 分鐘搞掂，玩完可以撕走）。</div>'+
      '<div class="p-foot">旅團：____________　日期：____________　© 2026 Scout System</div>'+
    '</div>'+
    '<div class="pbreak"></div>'+
    '<div class="a4-sheet floor-grid-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 11</span> <b>🦗 草蜢跳格・領袖玩法卡</b></div>'+
      '<div class="print-section"><div class="p-sec-title">🧭 點樣帶（螢幕叫位・小朋友用腳跳）</div>'+
        '<table class="print-table"><tbody>'+
        '<tr><td class="ck-no">1</td><td><b>貼好九宮格</b>：每格約 60×60 厘米、格距 10 厘米；同螢幕一樣由左上 1 數到右下 9。</td></tr>'+
        '<tr><td class="ck-no">2</td><td><b>領袖示範一次</b>：聽「幾號・邊個位」→ 跳上去 → 雙腳站定；其他人喺格外一齊數拍子。</td></tr>'+
        '<tr><td class="ck-no">3</td><td><b>開 APP 叫格</b>：🎮活動 →「草蜢跳格」→ 揀每格限時（2–5 秒）同回合數 → 撳「▶ 叫格」。</td></tr>'+
        '<tr><td class="ck-no">4</td><td><b>記分</b>：時間到撳「✓ 站到咗 +1」或「✗ 未去到」；分組玩就每格輪一隊。</td></tr>'+
        '</tbody></table></div>'+
      '<div class="print-section"><div class="p-sec-title">⏱️ 限時點揀（4–7 歲實測）</div>'+
        '<table class="print-table"><tbody>'+
        '<tr><td><b>5 秒</b></td><td>第一次玩、4 歲、或者場地大（格離起步位遠）</td></tr>'+
        '<tr><td><b>3 秒</b></td><td>標準：玩過一輪之後用呢個</td></tr>'+
        '<tr><td><b>2 秒</b></td><td>挑戰版：6–7 歲、已經熟晒先玩，唔好一開始就用</td></tr>'+
        '</tbody></table></div>'+
      '<div class="print-section"><div class="p-sec-title">🔀 三種變化（同一個九宮格玩成場）</div>'+
        '<table class="print-table"><tbody>'+
        '<tr><td><b>① 全體一齊跳</b></td><td>所有人一齊跳去叫到嘅格（唔計分，純消耗體力）—人多、場地細就用呢個。</td></tr>'+
        '<tr><td><b>② 分組接力</b></td><td>每組派一人企起步線，叫格後跑去跳上；站到 +1，輪流落場。</td></tr>'+
        '<tr><td><b>③ 草蜢指令版</b></td><td>叫格時加一個動作：「3 號・單腳企」「7 號・蹲低」「5 號・轉身」—聽指令先至跳。</td></tr>'+
        '</tbody></table></div>'+
      '<div class="print-section"><div class="p-sec-title">🛡️ 安全（貼地之前讀一次）</div>'+
        '<div class="p-para">一次只一組入格；跳前睇清楚腳下；著波鞋、地面乾爽；聽到「停」即刻企定唔好再跳。地貼用美紋膠紙，撕走唔留膠；玩完即刻撕走，避免下次集會有人絆倒。開會前撳 APP「🧭 檢查表」→「🦗 地貼／體能遊戲前檢查表」逐項剔。</div></div>'+
      '<div class="p-foot">旅團：____________　日期：____________　負責領袖：____________　© 2026 Scout System</div>'+
    '</div>';
  },

  /* 12b. 實體遊戲場地圖卡：四角角牌・分邊牌・回收桶・月亮靶 */
  renderCornerSigns:function(){
    var signs=[
      {c:'cc-a',ic:'A',s:'第 1 個角・貼牆',d:'問答擂台四角搶答'},
      {c:'cc-b',ic:'B',s:'第 2 個角・貼牆',d:'問答擂台四角搶答'},
      {c:'cc-c',ic:'C',s:'第 3 個角・貼牆',d:'問答擂台四角搶答'},
      {c:'cc-d',ic:'D',s:'第 4 個角・貼牆',d:'問答擂台四角搶答'}
    ];
    return '<div class="a4-sheet corner-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 12</span> <b>🅰️ 四角搶答角牌（A／B／C／D）</b></div>'+
      '<div class="print-cut-notice">✂️ 沿虛線剪開，貼喺禮堂四角（離地 1 米內，小朋友望到）。貼完行一次，确认四角都望得到、角與角之間有行人路。</div>'+
      '<div class="cards-cut-grid col-2 big-sign">'+signs.map(function(x){
        return '<div class="cut-card sign-card '+x.c+'"><div class="sign-letter">'+x.ic+'</div><div class="sign-sub">'+x.s+'</div></div>'}).join('')+'</div>'+
      '<div class="p-note">玩法：領袖出題 → 小朋友行去自己揀嘅角企好 → 數 10 聲 → 領袖撳「✅ 揭曉答案」→ 企啱嘅全體拍手。冇打印機就用粉筆喺地寫 A B C D。</div>'+
    '</div>'+
    '<div class="pbreak"></div>'+
    '<div class="a4-sheet corner-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 12</span> <b>👍👎 分邊牌・♻️ 回收桶標籤・🌕 射月靶</b></div>'+
      '<div class="cards-cut-grid col-2 big-sign">'+
        '<div class="cut-card sign-card sign-yes"><div class="sign-letter">👍</div><div class="sign-sub">啱・好行為（貼左邊牆）</div></div>'+
        '<div class="cut-card sign-card sign-no"><div class="sign-letter">👎</div><div class="sign-sub">錯・唔應該（貼右邊牆）</div></div>'+
        '<div class="cut-card sign-card sign-blue"><div class="sign-letter">🟦</div><div class="sign-sub">藍桶・廢紙</div></div>'+
        '<div class="cut-card sign-card sign-yellow"><div class="sign-letter">🟨</div><div class="sign-sub">黃桶・金屬鋁罐</div></div>'+
        '<div class="cut-card sign-card sign-green"><div class="sign-letter">🟩</div><div class="sign-sub">綠／啡桶・塑膠</div></div>'+
        '<div class="cut-card sign-card sign-grey"><div class="sign-letter">⬛</div><div class="sign-sub">垃圾筒・不可回收</div></div>'+
        '<div class="cut-card sign-card sign-moon"><div class="sign-letter">🌕</div><div class="sign-sub">射月靶・掛牆或放枱</div></div>'+
        '<div class="cut-card sign-card sign-line"><div class="sign-letter">▬</div><div class="sign-sub">投擲線・貼地（腳留喺線後）</div></div>'+
      '</div>'+
      '<div class="p-note">👍👎 用法：讀出個案 → 小朋友行去自己覺得嗰邊 → 領袖撳「⚖️ 宣判」→ 請一位講點解。回收桶標籤貼喺真回收箱或紙箱上，四角各一個。射月靶掛牆，投擲線離靶 1.5–2 米。</div>'+
      '<div class="p-foot">旅團：____________　日期：____________　© 2026 Scout System</div>'+
    '</div>';
  },

  /* 12c. 互動遊戲帶領卡：由 Lead.playMeta 自動生成（同 APP 畫面同一份資料） */
  renderGameCards:function(){
    var keys=Object.keys(Lead.playMeta);
    var half=Math.ceil(keys.length/2);
    var card=function(k){
      var m=Lead.playMeta[k];
      return '<div class="play-print-card">'+
        '<div class="ppc-h"><span class="ppc-ic">'+m.ic+'</span><b>'+esc(m.n)+'</b><span class="ppc-kind">'+esc(m.kind)+'</span></div>'+
        '<div class="ppc-row"><b>🧒 小朋友做乜</b>'+esc(m.kids)+'</div>'+
        '<div class="ppc-row"><b>🧑‍🏫 領袖撳乜</b>'+esc(m.lead)+'</div>'+
        '<div class="ppc-row"><b>🧺 物資／場地</b>'+esc(m.mats)+'</div>'+
        '<div class="ppc-row"><b>🛡️ 安全</b>'+esc(m.safe)+'</div>'+
      '</div>';
    };
    var pages='';
    for(var i=0;i<keys.length;i+=2){
      pages+=(i?'<div class="pbreak"></div>':'')+
        '<div class="a4-sheet game-card-sheet">'+
        '<div class="print-header-simple"><span>小童軍訓練教材套包 13</span> <b>🎮 互動遊戲帶領卡（第 '+(Math.floor(i/2)+1)+' 頁）</b></div>'+
        '<div class="print-cut-notice">✂️ 沿虛線剪開，每張一個遊戲。螢幕只係出題・叫位・計時・計分；遊戲本身係小朋友用身體玩。</div>'+
        card(keys[i])+(keys[i+1]?card(keys[i+1]):'')+
        '</div>';
    }
    return pages;
  },

  renderLessonPlan:function(tid){
    var t=dur(tid)||TPLS[0];
    var s=Store.get('settings',{group:'香港童軍總會 小童軍團'});
    var mats=matsOf(t);
    var own=Kit.ownersOf(t);
    var h='<div class="a4-sheet lesson-plan-sheet">'+
      '<div class="print-header">'+
        '<div class="p-title-group">'+
          '<span class="p-badge">香港童軍總會・小童軍團集會教案</span>'+
          '<h2>'+esc(s.group||'小童軍團')+' — '+esc(t.n)+'</h2>'+
          '<div class="p-meta">主題：<b>'+esc(t.theme)+'</b> ｜ 建議時長：<b>'+Plan.lenOf(t)+' 分鐘</b> ｜ 建議月份：<b>'+t.mo+'</b></div>'+
        '</div>'+
        '<div class="p-logo">🦗</div>'+
      '</div>'+
      
      '<div class="print-section">'+
        '<div class="p-sec-title">🧺 本次集會物資採購與準備清單</div>'+
        '<div class="p-mats-grid">'+
          (mats.length?mats.map(function(m){return '<div class="p-mat-item"><span class="p-box"></span> '+esc(m)+'</div>'}).join(''):'<div class="mute">本次集會無需額外實物物資（全數碼/肢體互動）</div>')+
        '</div>'+
        Kit.matsTipPrint(mats)+
      '</div>'+

      '<div class="print-section">'+
        '<div class="p-sec-title">⏱️ 集會程序表、帶領講稿與安全指引（邊個帶邊節已填低）</div>'+
        '<table class="print-table">'+
          '<thead><tr><th style="width:10%">時間</th><th style="width:17%">環節名稱</th><th style="width:11%">負責</th><th style="width:36%">帶領步驟與領袖示範</th><th style="width:26%">領袖口語講稿 / 安全提醒</th></tr></thead>'+
          '<tbody>'+
            t.stages.map(function(st,idx){
              var g=Guide.forStage(st);
              return '<tr>'+
                '<td><b>'+st.m+'分鐘</b><br><span class="p-tag">'+st.t+'</span></td>'+
                '<td><b>'+(idx+1)+'. '+esc(st.n)+'</b></td>'+
                '<td class="p-owner"><b>'+esc(own[idx]||'未定')+'</b><br><span class="p-tag">'+esc(st.t)+'</span></td>'+
                '<td><div style="font-weight:700;color:#2e7d32;font-size:8.5pt">【先做】'+esc(g.lead)+'</div><div style="font-size:8pt;margin-top:2px">'+esc(st.how)+'</div></td>'+
                '<td><div style="font-style:italic;color:#b71c1c;font-size:8pt">🎤 '+esc(st.script||g.say)+'</div><div style="font-size:7.5pt;color:#555;margin-top:3px">🛡️ <b>注意：</b>'+esc(g.safety)+'</div></td>'+
              '</tr>';
            }).join('')+
          '</tbody>'+
        '</table>'+
      '</div>'+

      '<div class="print-footer-grid">'+
        '<div class="p-sign-box">主領領袖簽署：_________________</div>'+
        '<div class="p-sign-box">副領袖／家長義工：_________________</div>'+
        '<div class="p-sign-box">當日出席人數：_____ / _____ 人</div>'+
      '</div>'+
    '</div>';
    return h;
  },

  /* 2. 身體界線紅黃綠圖卡套包 (Safe from Harm) */
  renderSfhCards:function(){
    return '<div class="a4-sheet sfh-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 01</span> <b>🛡️ 身體界線紅黃綠互動色卡 (裁切版)</b></div>'+
      '<div class="print-cut-notice">✂️ 請沿虛線剪開，可過膠或貼在厚卡紙上，供幼兒於集會中進行舉卡與情景跑位遊戲。</div>'+
      
      '<div class="cards-cut-grid col-3">'+
        '<div class="cut-card card-red"><div class="c-badge">紅色區域・絕對禁止</div><div class="c-icon">🛑</div><h3>紅色：不可碰！</h3><p>泳衣覆蓋位置（胸部、私隱部位、臀部）。任何人未經同意絕對不可觸碰！</p><div class="c-rule">口訣：大聲講「唔好！」即刻走去求助！</div></div>'+
        '<div class="cut-card card-yellow"><div class="c-badge">黃色區域・需要同意</div><div class="c-icon">⚠️</div><h3>黃色：先問清楚</h3><p>面頰、頭髮、腰部。看醫生檢查需家長在場，朋友觸摸需雙方同意！</p><div class="c-rule">口訣：唔舒服就要開口拒絕！</div></div>'+
        '<div class="cut-card card-green"><div class="c-badge">綠色區域・禮貌互動</div><div class="c-icon">✅</div><h3>綠色：禮貌握手</h3><p>手部、肩膀、擊掌 High-five。友善打招呼、握手、擁抱家人。</p><div class="c-rule">口訣：尊重他人，友愛同伴！</div></div>'+
      '</div>'+

      '<div class="print-header-simple" style="margin-top:14px"><span>情景與求助信任圈卡片</span></div>'+
      '<div class="cards-cut-grid col-3">'+
        '<div class="cut-card"><div class="c-icon">🗣️</div><h4>大聲說「唔好！」</h4><p>身體屬於你自己，遇到不舒服勇敢拒絕！</p></div>'+
        '<div class="cut-card"><div class="c-icon">👨‍👩‍👧</div><h4>求助信任圈：爸媽</h4><p>第一時間將所有事情告訴爸爸媽媽！</p></div>'+
        '<div class="cut-card"><div class="c-icon">👮</div><h4>緊急求助：999 / 警察</h4><p>遇到危險或迷路，記住撥打 999 報警！</p></div>'+
        '<div class="cut-card"><div class="c-icon">🏕️</div><h4>求助信任圈：領袖</h4><p>集會期間有任何不適，立刻向領袖報告！</p></div>'+
        '<div class="cut-card"><div class="c-icon">👩‍🏫</div><h4>求助信任圈：老師</h4><p>在學校可找班主任或老師協助！</p></div>'+
        '<div class="cut-card"><div class="c-icon">🤝</div><h4>左手握手禮</h4><p>童軍放下盾牌，代表全心信任同伴！</p></div>'+
      '</div>'+
    '</div>';
  },

  /* 3. 三色回收圖卡套包 */
  renderRecycleCards:function(){
    var items=[
      {ic:'📰',n:'報紙雜誌',b:'藍桶 (廢紙)'},
      {ic:'📦',n:'紙皮箱',b:'藍桶 (廢紙)'},
      {ic:'📄',n:'畫紙/書本',b:'藍桶 (廢紙)'},
      {ic:'🥤',n:'鋁罐 (汽水罐)',b:'黃桶 (金屬)'},
      {ic:'🥫',n:'鐵罐 (罐頭)',b:'黃桶 (金屬)'},
      {ic:'🥄',n:'金屬匙羹',b:'黃桶 (金屬)'},
      {ic:'🧴',n:'洗頭水膠樽',b:'綠桶 (塑膠)'},
      {ic:'🍼',n:'飲品膠樽',b:'綠桶 (塑膠)'},
      {ic:'🛍️',n:'乾淨膠袋',b:'綠桶 (塑膠)'},
      {ic:'🧃',n:'紙包飲品盒',b:'藍桶 (紙盒)'},
      {ic:'🍎',n:'吃剩的果皮',b:'灰色 (廚餘/垃圾)'},
      {ic:'🧼',n:'抹手紙巾',b:'灰色 (不可回收)'}
    ];
    return '<div class="a4-sheet recycle-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 02</span> <b>♻️ 三色回收桶標誌與 12 件物品實物卡</b></div>'+
      '<div class="print-cut-notice">✂️ 剪下上方三個回收桶標誌貼在紙箱上；下方物品卡分給幼兒進行「回收分類接力賽」！</div>'+
      
      '<div class="cards-cut-grid col-3" style="margin-bottom:12px">'+
        '<div class="cut-card bin-blue"><div class="c-icon">🔵</div><h2>藍色廢紙桶</h2><p>報紙、書本、紙盒、紙張<br><b>（需保持乾淨乾燥）</b></p></div>'+
        '<div class="cut-card bin-yellow"><div class="c-icon">🟡</div><h2>黃色金屬桶</h2><p>汽水鋁罐、食物鐵罐、金屬器皿<br><b>（需先沖洗乾淨）</b></p></div>'+
        '<div class="cut-card bin-green"><div class="c-icon">🟢</div><h2>綠色塑膠桶</h2><p>膠樽、膠盒、清潔劑樽<br><b>（需沖洗及壓扁）</b></p></div>'+
      '</div>'+

      '<div class="cards-cut-grid col-4">'+
        items.map(function(it){
          return '<div class="cut-card small-item"><div class="item-ic">'+it.ic+'</div><b>'+esc(it.n)+'</b><div class="item-bin">'+esc(it.b)+'</div></div>';
        }).join('')+
      '</div>'+
    '</div>';
  },

  /* 4. 日行一善家務任務抽籤卡 */
  renderTaskCards:function(){
    var tasks=DATA.tasks||[
      {ic:'👟',t:'排好全家鞋履',d:'將門口所有鞋子整齊排好在鞋架上。'},
      {ic:'🍽️',t:'飯後幫手收碗',d:'吃完飯後主動將自己的碗筷收到廚房水槽。'},
      {ic:'🛏️',t:'起床自己摺被',d:'早上起床把被子和枕頭整理平整。'},
      {ic:'🧹',t:'幫手掃地抹枱',d:'拿起抹布幫家人把飯桌抹乾淨。'},
      {ic:'🥛',t:'為家人倒杯水',d:'主動為辛苦工作的爸爸媽媽倒一杯溫水。'},
      {ic:'🧸',t:'收拾玩具歸位',d:'玩完玩具後一件不漏收回玩具箱。'},
      {ic:'🎒',t:'自己收拾書包',d:'按手冊和時間表將明天的物品收好。'},
      {ic:'🌱',t:'幫植物澆澆水',d:'拿小水壺為家裡或陽台的花草澆水。'},
      {ic:'🫂',t:'安慰一位朋友',d:'看到隊友不開心，拍拍肩膀說「加油」。'},
      {ic:'👂',t:'專心聽人講嘢',d:'不插嘴、眼睛望著說話的家人或領袖。'},
      {ic:'🧣',t:'整理童軍旅巾',d:'自己捲好旅巾、戴上巾圈，整齊出發！'},
      {ic:'❤️',t:'講一句感恩的話',d:'對身邊幫過你的人真誠說一聲「多謝你！」'}
    ];
    return '<div class="a4-sheet task-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 03</span> <b>🎯 小童軍日行一善／家務任務抽籤卡 (12格)</b></div>'+
      '<div class="print-cut-notice">✂️ 請沿虛線剪裁成 12 張任務卡，裝入小盒子中供小童軍輪流抽籤，回家完成打卡！</div>'+
      '<div class="cards-cut-grid col-3">'+
        tasks.map(function(tk,i){
          return '<div class="cut-card task-card"><div class="task-no">善行卡 #'+(i+1)+'</div><div class="c-icon">'+tk.ic+'</div><h3>'+esc(tk.t)+'</h3><p>'+esc(tk.d)+'</p><div class="task-check-box">⬜ 回家完成請家長打勾</div></div>';
        }).join('')+
      '</div>'+
    '</div>';
  },

  /* 5. 情緒面面觀表情卡 */
  renderEmotionCards:function(){
    var emos=DATA.emotions||[
      {ic:'😊',n:'開心',say:'笑咪咪、想同朋友分享',how:'齊齊分享喜悅！'},
      {ic:'😡',n:'生氣',say:'握緊拳頭、心跳加速',how:'深呼吸三啖、數一到十。'},
      {ic:'😢',n:'傷心',say:'眼泛淚光、想喊',how:'抱抱公仔、搵信任大人傾訴。'},
      {ic:'😨',n:'害怕',say:'不敢向前、想縮埋',how:'牽住大人隻手、講出怕咩。'},
      {ic:'😲',n:'驚訝',say:'眼睛睜大、擘大口',how:'停一停，睇清楚發生咩事。'},
      {ic:'😌',n:'平靜',say:'呼吸平穩、心情舒服',how:'靜靜睇書或聽音樂。'}
    ];
    return '<div class="a4-sheet emotion-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 04</span> <b>😊 幼兒情緒面面觀表情卡與平復指南</b></div>'+
      '<div class="print-cut-notice">✂️ 剪開大表情圓卡，用於情緒識別教學；下方為幼兒情緒平復四部曲指引。</div>'+
      '<div class="cards-cut-grid col-3" style="margin-bottom:12px">'+
        emos.map(function(e){
          return '<div class="cut-card emo-card"><div class="emo-ic">'+e.ic+'</div><h3>'+esc(e.n)+'</h3><p>'+esc(e.say)+'</p><div class="emo-tip">💡 '+esc(e.how)+'</div></div>';
        }).join('')+
      '</div>'+
      '<div class="print-guide-banner">'+
        '<h4>🌬️ 幼兒情緒平復四部曲（平復口訣）：</h4>'+
        '<div class="guide-steps-4">'+
          '<div><b>1. 停一停</b><br>雙手放膝頭，不推人不丟東西</div>'+
          '<div><b>2. 慢呼吸</b><br>吸氣數四聲、呼氣數四聲</div>'+
          '<div><b>3. 講感受</b><br>用說話講「我現在覺得好生氣」</div>'+
          '<div><b>4. 搵求助</b><br>找爸爸媽媽或領袖幫手解決</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  },

  /* 6. 交通工具與安全圖卡 */
  renderTransportCards:function(){
    var transports=DATA.transports||[
      {ic:'🚌',n:'雙層巴士',where:'陸地',rule:'坐穩扶好、戴好安全帶、禮貌讓座'},
      {ic:'🚇',n:'港鐵 MTR',where:'地底/路軌',rule:'先落後上、請勿飲食、小心月台空隙'},
      {ic:'🚋',n:'香港電車',where:'路面軌道',rule:'後門上車前門落車、坐好睇風景'},
      {ic:'⛴️',n:'天星小輪',where:'海上',rule:'行慢一點、不倚靠船欄、留意救生衣'},
      {ic:'🚑',n:'緊急救護車',where:'道路緊急',rule:'緊急電話 999、所有車輛要讓路'},
      {ic:'🚒',n:'消防車',where:'道路緊急',rule:'火警求助 999、救火救人好英雄'}
    ];
    return '<div class="a4-sheet transport-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 05</span> <b>🚌 交通工具與社區安全常識圖卡</b></div>'+
      '<div class="print-cut-notice">✂️ 剪開圖卡，學習香港海陸交通與緊急求助車輛安全常識。</div>'+
      '<div class="cards-cut-grid col-3">'+
        transports.map(function(t){
          return '<div class="cut-card tp-card"><div class="tp-ic">'+t.ic+'</div><h3>'+esc(t.n)+'</h3><div class="tp-where">行駛於：'+esc(t.where)+'</div><p><b>安全守則：</b>'+esc(t.rule)+'</p></div>';
        }).join('')+
      '</div>'+
    '</div>';
  },

  /* 7. 我是誰・自畫像與名牌底紙 */
  renderNameTagSheet:function(){
    return '<div class="a4-sheet nametag-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍第 1 次集會專用</span> <b>🏷️ 我是誰・自畫像與自製名牌 (4人份)</b></div>'+
      '<div class="print-cut-notice">✂️ 沿十字虛線裁開分成 4 份，每位小童軍一份，畫上自畫像並寫上名字戴在胸前！</div>'+
      '<div class="cards-cut-grid col-2 row-2">'+
        [1,2,3,4].map(function(n){
          return '<div class="cut-card nametag-card">'+
            '<div class="nt-head"><span class="scout-tag">🦗 香港童軍總會 小童軍團</span><span class="nt-num">#0'+n+'</span></div>'+
            '<div class="nt-draw-area"><div class="draw-hint">🖼️ 請在此畫出你自己的可愛自畫像</div></div>'+
            '<div class="nt-fields">'+
              '<div class="nt-field"><b>姓名：</b>____________________</div>'+
              '<div class="nt-field"><b>我最鍾意食：</b>_______________</div>'+
              '<div class="nt-field"><b>旅團：</b>第 _______ 旅小童軍團</div>'+
            '</div>'+
          '</div>';
        }).join('')+
      '</div>'+
    '</div>';
  },

  /* 8. 小童軍日行一善雪櫃打卡承諾卡 */
  renderGoodTurnSheet:function(){
    return '<div class="a4-sheet goodturn-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍進步獎章實踐教材</span> <b>📅 日行一善・家庭好幫手 7天打卡承諾卡 (2人份)</b></div>'+
      '<div class="print-cut-notice">✂️ 沿中間虛線裁開成 2 張，帶回家貼在雪櫃上，每天完成一樣家務請家長簽名蓋印！</div>'+
      '<div class="cards-cut-grid col-2">'+
        [1,2].map(function(idx){
          return '<div class="cut-card goodturn-card">'+
            '<div class="gt-header"><h3>🦗 小童軍日行一善承諾卡</h3><p>小童軍姓名：____________ 旅團：第_____旅</p></div>'+
            '<div class="gt-promise-box">「我承諾每日幫屋企做一樣家務，日行一善！」</div>'+
            '<table class="gt-table">'+
              '<thead><tr><th>星期</th><th>我做的家務善行</th><th>家長簽名/印章</th></tr></thead>'+
              '<tbody>'+
                ['一','二','三','四','五','六','日'].map(function(d){
                  return '<tr><td><b>星期'+d+'</b></td><td style="height:28px"></td><td></td></tr>';
                }).join('')+
              '</tbody>'+
            '</table>'+
            '<div class="gt-footer">完成 7 天善行後，請於下次集會帶回交給領袖領取獎勵印章！🌟</div>'+
          '</div>';
        }).join('')+
      '</div>'+
    '</div>';
  },

  /* 9. 彩虹健康飲食餐盤底紙 */
  renderRainbowPlacemat:function(){
    return '<div class="a4-sheet rainbow-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍健康生活教材</span> <b>🍽️ 我的彩虹健康飲食餐盤 (Rainbow Nutrition Placemat)</b></div>'+
      '<div class="rainbow-plate-wrap">'+
        '<div class="plate-circle">'+
          '<div class="plate-sec sec-red"><b>🍎 紅色食物</b><br><small>番茄、蘋果、士多啤梨<br>（強壯心臟）</small></div>'+
          '<div class="plate-sec sec-orange"><b>🥕 橙黃色食物</b><br><small>香蕉、南瓜、紅蘿蔔<br>（保護視力）</small></div>'+
          '<div class="plate-sec sec-green"><b>🥦 綠色食物</b><br><small>西蘭花、菠菜、青瓜<br>（增強抵抗力）</small></div>'+
          '<div class="plate-sec sec-white"><b>🥛 白色食物</b><br><small>牛奶、豆腐、蘑菇<br>（骨骼牙齒強壯）</small></div>'+
          '<div class="plate-sec sec-purple"><b>🍇 紫色食物</b><br><small>提子、藍莓、紫薯<br>（頭腦聰明靈活）</small></div>'+
          '<div class="plate-center">小童軍姓名：_________<br><b>今日我食咗邊幾種顏色？</b></div>'+
        '</div>'+
      '</div>'+
      '<div class="print-cut-notice" style="margin-top:10px">💡 小童軍可以在上方對應分區畫上自己最喜歡的蔬果，或貼上食物小貼紙！</div>'+
    '</div>';
  },

  /* 10. 小草蜢歷險七大範疇護照 */
  renderGhPassport:function(){
    return '<div class="a4-sheet passport-print-sheet">'+
      '<div class="print-header-simple"><span>小草蜢獎章 (6歲起) 專屬</span> <b>🦗 小草蜢歷險七大範疇印章護照 (對摺手冊)</b></div>'+
      '<div class="passport-grid">'+
        '<div class="pass-page page-left">'+
          '<div class="pass-head"><h3>🦗 小草蜢歷險護照</h3><p>持有人姓名：_____________</p><p>旅團：第 ______ 旅小童軍團</p></div>'+
          '<div class="pass-motto">銘言：前進 ｜ 規律：日行一善</div>'+
          '<div class="pass-domain-item"><b>1. 🌳 我愛戶外</b> 體驗一 ⬜ 體驗二 ⬜</div>'+
          '<div class="pass-domain-item"><b>2. 🏃 我愛運動與健康</b> 體驗一 ⬜ 體驗二 ⬜</div>'+
          '<div class="pass-domain-item"><b>3. 🤝 認識自己幫助他人</b> 體驗一 ⬜ 體驗二 ⬜</div>'+
          '<div class="pass-domain-item"><b>4. 🔬 我愛科學與大自然</b> 體驗一 ⬜ 體驗二 ⬜</div>'+
        '</div>'+
        '<div class="pass-page page-right">'+
          '<div class="pass-domain-item"><b>5. 🎨 我愛創新</b> 體驗一 ⬜ 體驗二 ⬜</div>'+
          '<div class="pass-domain-item"><b>6. 🏇 我愛國家與社區</b> 體驗一 ⬜ 體驗二 ⬜</div>'+
          '<div class="pass-domain-item"><b>7. 🏕️ 我愛童軍大家庭</b> 體驗一 ⬜ 體驗二 ⬜</div>'+
          '<div class="pass-cert-box">'+
            '<h4>🏅 小草蜢獎章 完成印證</h4>'+
            '<p>完成全部 7 大範疇共 14 項體驗後，由團長簽署頒發小草蜢獎章及證書！</p>'+
            '<div class="sign-line">團長簽署：_________________ 日期：___/___/___</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  },

  /* 11. 整理旅巾與制服徽章位置海報 */
  renderUniformGuide:function(){
    return '<div class="a4-sheet uniform-print-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練綱要必備</span> <b>🧣 整理旅巾三步指引與徽章佩戴海報</b></div>'+
      '<div class="uniform-grid">'+
        '<div class="u-card"><h3>第一步：背面攤平</h3><div class="u-img">🧣</div><p>將旅巾背面朝上平放在桌上，巾尖向前，整齊拉直。</p></div>'+
        '<div class="u-card"><h3>第二步：由底向上捲</h3><div class="u-img">↩️</div><p>由巾底慢慢向上捲，保持約 <b>3–3.5 厘米</b> 粗，尖端預留 12–15 厘米。</p></div>'+
        '<div class="u-card"><h3>第三步：圍領穿巾圈</h3><div class="u-img">⭕</div><p>將旅巾圍上衣領，穿入巾圈。檢查尖端在後頸中央、兩端等長垂至肚臍。</p></div>'+
      '</div>'+
      '<div class="badge-pos-box">'+
        '<h3>🏅 小童軍徽章佩戴標準位置</h3>'+
        '<div class="pos-grid">'+
          '<div><b>👑 團員章 (Membership Badge)</b><br>佩戴於制服<b>左胸</b>口袋中央上方。</div>'+
          '<div><b>🔴🟤🔵🟢 進步獎章 (Progress Badges)</b><br>第一至四步依次佩戴於制服<b>左袖</b>。</div>'+
          '<div><b>🦗 小草蜢獎章 (Grasshopper Scout Award)</b><br>最高榮譽獎章，佩戴於制服<b>右胸</b>。</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  },

  /* 12. 誓詞規律大字報 */
  renderPromisePoster:function(){
    return '<div class="a4-sheet promise-print-sheet">'+
      '<div class="poster-border">'+
        '<div class="p-emblem">⚜️ 🦗 ⚜️</div>'+
        '<h1>香港童軍總會 小童軍團</h1>'+
        '<div class="poster-block">'+
          '<span class="pb-tag">小童軍誓詞 (The Scout Promise)</span>'+
          '<div class="pb-text">「我願參加小童軍，<br>愛神愛人愛國家。」</div>'+
        '</div>'+
        '<div class="poster-block">'+
          '<span class="pb-tag">小童軍規律 (The Scout Law)</span>'+
          '<div class="pb-text">「小童軍日行一善。」</div>'+
        '</div>'+
        '<div class="poster-block">'+
          '<span class="pb-tag">小童軍口號與銘言</span>'+
          '<div class="pb-text">口號：「小童軍向前進！」 ｜ 銘言：「前進」</div>'+
        '</div>'+
        '<div class="poster-block">'+
          '<span class="pb-tag">小童軍主題曲 (寄調 London Bridge)</span>'+
          '<div class="pb-song">小小童軍向前進，向前進，向前進，<br>小小童軍向前進，快樂前進！</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  },

  /* 13. 旅團全年度簽到出席與進度表 */
  renderAttendRoster:function(){
    var s=Store.get('settings',{group:'小童軍團'});
    var mem=Store.get('members',[]);
    var rows=[];
    for(var i=0;i<18;i++){
      var m=mem[i]||null;
      rows.push(m?{n:m.n,no:i+1}:{n:'',no:i+1});
    }
    return '<div class="a4-sheet roster-print-sheet landscape">'+
      '<div class="print-header-simple"><span>旅團行政備課表格</span> <b>📝 '+esc(s.group)+' — 集會出席與徽章進度記錄總表</b></div>'+
      '<table class="roster-table">'+
        '<thead>'+
          '<tr>'+
            '<th style="width:4%">#</th>'+
            '<th style="width:14%">團員姓名</th>'+
            '<th style="width:7%">團員章</th>'+
            '<th style="width:7%">第一步</th>'+
            '<th style="width:7%">第二步</th>'+
            '<th style="width:7%">第三步</th>'+
            '<th style="width:7%">第四步</th>'+
            '<th style="width:8%">小草蜢章</th>'+
            '<th style="width:39%">1-12次集會出席打勾 (✓ / ✗)</th>'+
            '<th style="width:7%">備註</th>'+
          '</tr>'+
        '</thead>'+
        '<tbody>'+
          rows.map(function(r){
            return '<tr>'+
              '<td>'+r.no+'</td>'+
              '<td style="text-align:left;font-weight:700">'+esc(r.n)+'</td>'+
              '<td>⬜</td><td>⬜</td><td>⬜</td><td>⬜</td><td>⬜</td><td>⬜</td>'+
              '<td class="attend-boxes"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span></td>'+
              '<td></td>'+
            '</tr>';
          }).join('')+
        '</tbody>'+
      '</table>'+
      '<div class="roster-foot">記錄領袖：_________________ 團長查核：_________________ 季度：2026-2027 年度</div>'+
    '</div>';
  }
};
