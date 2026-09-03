/* 🦗 kit.js — 「叫你做」之外，補返「點做」：物資備料・檢查表・家長訊息・分工・章項對照 © 2026 Scout System */
/* 原則：任何一句要求領袖做的說話，都要有可執行的數量、次序、工具或範本；紙筆這類成人即明的除外。 */
var Kit={
  /* ============ ① 物資備料庫：清單唔止列名，仲話你每人幾多、點備、冇點算 ============ */
  mats:{
    '卡紙':{q:'每人 1–2 張 A4（160–250g 較挺，120g 會軟）',how:'開會前一次剪好每人份：先對摺再對摺，沿線剪開＝1 張 A4 出 4 份',sub:'淨返普通影相紙？折 2 層變雙層，或者改用雪紙／紙袋'},
    '畫紙':{q:'每人 1 張 A4；集體畫用牛皮紙 1 米 × 0.5 米',how:'四角剪圓先唔會插人；細手用 A3 比 A4 易落筆',sub:'冇畫紙：影相紙背面都得；集體畫改「每人一張 A4，貼牆砌成一幅」'},
    '顏色筆':{q:'每 2 人 1 盒（12 色）—唔使每人一盒，浪費又易爭較',how:'開會前數返筆帽有冇齊、試畫一格；筆帽缺就整盒抽走',sub:'只得蠟筆：改用蠟筆畫＋膠水貼碎紙（質感仲好）'},
    '蠟筆':{q:'每人 2–3 支（太齊會慢慢執）',how:'預先剝走紙套？唔使—紙套防黐手；用粗身三角蠟筆最啱細手',sub:'冇蠟筆：用蠟燭頭画（得線條，效果意外好）'},
    '安全剪刀':{q:'每人 1 把（圓頭、刀身膠製或塑膠包邊）',how:'開會前逐把試剪一格紙：剪唔斷就扔—唔好等到現場先發現',sub:'無安全剪刀：全部由領袖預剪，环节改「撕＋貼」（撕紙對 4 歲仲好）'},
    '漿糊':{q:'每 4 人 1 支（用膠棒替代更乾淨）',how:'倒一小碟＋每次用海棉掃抹，避免整班黐晒手',sub:'冇漿糊：雙面膠預剪 2 厘米小段、或者藍丁豆（可重貼）'},
    '白膠水':{q:'每 4 人 1 支，配膠蓋攤平用',how:'膠樽盖钻一個細孔控制流量；預濕布抹手',sub:'改膠棒／雙面膠；紙盒重貨先改藍丁豆＋膠紙'},
    '貼紙':{q:'每人 6–10 粒（夠装饰又唔會亂貼）',how:'開會前將大張剪成小份，避免一齊搶一张',sub:'冇貼紙：画圓圈再塗色；或者用碎紙＋膠水'},
    '雙面膠':{q:'每組 1 卷',how:'預剪 2–3 厘米小段貼枱邊，随用随攞（現場剪膠帶最阻時間）',sub:'紙膠帶／藍丁豆都得；要掛重物先請家長用熱溶膠'},
    '膠紙':{q:'每人預剪 3–4 段；大卷 2 個',how:'預先將膠紙圍喺膠樽外側—一拉即斷，領袖唔使逐次剪',sub:'免膠紙：用藍丁豆或釘書機（釘書機只由領袖用）'},
    '藍丁豆':{q:'每 4 人 1 盒（豆大小一粒／件）',how:'放雪櫃 5 分鐘變硬更好搓；牆位先抹塵先貼得住',sub:'膠紙、紙箱夾（剪 1 厘米條做卡扣）都得'},
    '掛繩':{q:'每人 1 條 25–30 厘米',how:'預先每條打一個活結圈（現場唔使逐個剪繩）；長度唔超過 30 厘米防纏頸',sub:'用鞋帶（短）、或者咭套勾；完全冇就將卡用藍丁豆貼喺胸前'},
    '切孔器':{q:'1 個（領袖用）',how:'枱下墊舊報紙，孔位先至唔會撕裂',sub:'冇打孔器：用透明膠紙做一條「穿繩耳」貼喺卡頂；或用咭套'},
    '顏料':{q:'每組 2 色即可（色太多會糊）',how:'用海棉掃／舊牙刷，海棉比筆快；枱鋪報紙＋預濕布',sub:'改色水（食用色素＋洗潔精）或蠟筆＋水彩（蠟拒水，效果最靚）'},
    '利是封':{q:'每人 4–8 個（做燈籠 12–16 個最飽滿）',how:'收一星期先夠；開口向外對摺一次先至好砌',sub:'改 A4 紅紙裁 8×15 厘米；或直接用紙杯版'},
    'LED燈':{q:'每組 1–2 支（唔使每人一支：貴、又容易擺錯方向）',how:'開會前逐支試亮、貼住膠紙防反接；預留多 2 支後備',sub:'熒光棒（折亮即得）、電話手電筒加衛生紙罩、或者改「無燈紙燈」白天巡遊'},
    '熒光棒':{q:'每人 1 支（折亮後入燈肚）',how:'預先折亮一半备用；尖端用膠紙包防割手',sub:'LED 茶蠟燭；或者改手電筒輪流照'},
    '軟身球':{q:'每組 1 個（直徑 15–20 厘米）',how:'吹到七分飽—太實會痛；備 1 個後備',sub:'襪子捲成波＋膠紙包（零成本、最安全）；或改「傳紙波」'},
    '雪糕筒':{q:'8 個（分界／繞柱）',how:'入面放少許沙／水增重防吹倒',sub:'膠樽入水、紙箱、書包排一排—完全够用'},
    '圈':{q:'每 4 人 1 個（跳圈／投擲）',how:'直徑 60 厘米最啱 4–7 歲',sub:'用膠紙喺地貼圈、或者整紙皮圈—貼地線仲防跣'},
    '隧道':{q:'每組 1 條',how:'出口兩邊要有人望住',sub:'兩張枱對拼＋布蓋、紙箱拆開接成長筒（效果一樣、仲似秘密基地）'},
    '旅巾':{q:'每人 1 條（檢查巾圈 size）',how:'預先逐條試摺一次，知邊啲巾圈太緊要剪返',sub:'用方巾／大手帕代替練習'},
    '獎章':{q:'按名單數量＋2 個後備',how:'開會前按名單順序排喺盒/枱（叫名先至唔使搵）',sub:'冇獎章：用打印嘉許狀先頒，獎章稍後補（本 APP 可打印）'},
    '證書':{q:'每人 1 份',how:'官方證書要經旅團向總部申請，一般需時數星期—所以現場用打印嘉許狀先颁',sub:'🖨️ 教材庫「小童軍嘉許狀」即刻打印填名頒發'},
    '急救包':{q:'1 個／小隊（戶外必須）',how:'檢查有無：膠布、無菌紗、生理鹽水、唔放針線、剪刀',sub:'向旅團借；出發前確認負責人識用'},
    '名單':{q:'紙本 1 份＋手機 1 份',how:'出發前印一次（含緊急聯絡人、過敏、服食藥物）',sub:'用 APP「🏅追蹤」截圖離線睇；完全冇網都要有紙本'},
    '飲用水':{q:'每人 500 毫升＋每組備 1 支後備',how:'天氣熱加電解質；標名避免飲錯',sub:'確認場地方有飲水機；冇就減短活動時間'},
    '毛巾':{q:'每人 1 條＋場地抹地布 2 條',how:'玩水後即刻抹頭髪耳朵；抹地布係防跣嘅關鍵',sub:'舊衫／紙巾（成本貴但救急）'},
    '更換衣物':{q:'每人一套＋膠袋裝濕衫',how:'通知家長時就話明「濕衫袋自備」',sub:'用大膠袋／垃圾袋臨時分裝'},
    '團旗':{q:'1 支',how:'開會散會用—旗桿頭要圓；先檢查旗套有冇甩線',sub:'用印住團徽嘅卡紙旗／畫一支旗都得（儀式感重於物質）'},
    '雪糕棒':{q:'每人 5 支（4 支砌框＋1 支做腳）',how:'預先砂紙抹圓尖端；計好數先唔會搶',sub:'冰條棍、紙皮剪 15×2 厘米條、飲管（軟，要 2 支併埋）'},
    '紙杯':{q:'每 4 人 1 個（疊塔／燈籠後備）',how:'檢查杯口冇利邊',sub:'膠樽剪半、紙皮做積木；改「用書本疊高」一樣教合作'},
    '畫板／紙巾':{q:'每組 1 包濕紙巾',how:'收尾時即刻抹手，避免跑到廁前黐晒牆',sub:'預留一桶水＋毛巾；或者改乾式工具（蠟筆）'},
    '毛筆':{q:'每 2 人 1 支（中楷）',how:'先浸水 30 秒甩乾才蘸墨—乾筆最難用，領袖最容易忽略',sub:'用馬克筆／蠟筆代替（唔會爆墨，4–7 歲更成功）'},
    '紅紙':{q:'每人 1 張 21×21 厘米（A4 約 1/3）',how:'預先一次裁好，唔使現場量',sub:'用紅卡紙；冇紅色就白紙画框＋金色筆，倒轉貼都係「福到」'},
    '白殼蛋':{q:'優先塑料蛋；真蛋要焗熟',how:'焗熟蛋先洗乾＋抹乾；塑料蛋用顏料要先上底料，否則甩色',sub:'用紙蛋（卡紙剪蛋形）—零風險、效果一樣'},
    '快樂傘':{q:'1 張／4–5 人（20 人預 5 張）；另備 1 張後備',how:'開會前試揚 3 次：確認唔漏氣、傘邊唔笠手；太滑就圍一圈膠紙。玩法直接喺 APP「活動 → 快樂傘 21 式」揀，唔使自己諗',sub:'冇傘：用大型垃圾膠袋（玩法一樣，壽命短）；或 8 人拉一根長繩做「人肉傘」，同樣练合作'},
    '海灘波':{q:'1 個／小隊；打氣至七成飽',how:'預先試打氣、綁實結；太硬會傷細個嘅頭，放氣少少',sub:'冇波：用膠樽入水（撞到＝1 分）或紙球（安全、安靜版）'},
    '皮球':{q:'4–6 人 1 個（氣球每人 1 隻）',how:'氣球預先吹 10 隻（細個嘅吹得慢）；皮波打氣至彈得起但唔瀉手',sub:'冇波：錫紙搓成球（一樣彈到手心就傳）；或改用「拍手代替傳波」玩口令遊戲'},
    '團員章':{q:'每人 1 套（6 枚）；另預 2 套後備',how:'開會前對住名單剔好邊個差邊一枚；針腳式別針逐個試扣，鬆咗即扭緊',sub:'未領到官方章：用「🖨️教材包 → 工作紙」印紙版章即場貼，事後補發，儀式感唔走'},
    '彩色紙':{q:'每人 2–3 張唔同色',how:'要嘅形狀預先剪好（細手淨係剪直線）；深色放枱邊睇唔清，淺色為主',sub:'冇彩色紙：白紙＋蠟筆／水彩塗色再用；或直接改用枱布顏色做分組色'},
    '裝飾':{q:'場內 4 個位：門口・禮堂・枱面・影相位',how:'用藍丁豆／紙膠帶貼，唔好釘牆；高度睇小朋友視線（離地 1 米內）',sub:'冇裝飾：將今場作品貼上牆一樣有氣氛；完場連作品一齊收，唔執走兩次'},
    '歌詞卡':{q:'每人 1 張（或投影大字）',how:'影印字體大過 20pt、一段一行；先睇一次再唱，唔好即場讀',sub:'冇卡：投影／白板逐句寫；或跟領袖口語跟唱（細個嘅聽覺比視覺快）'},
    '乾淨回收物':{q:'每人 2–3 件（一星期前派任務）',how:'領袖逐件摸尖位，尖位一律膠紙包埋；撕走標籤',sub:'預留「物料銀行」6 件後備，借俾冇帶嘅人'}
  },
  /* ============ ② 檢查表：話你「檢查場地」之外，仲列出檢查咩 ============ */
  checks:{
    outdoor:{key:'outdoor',n:'戶外／遠足出發前檢查表',ic:'🥾',when:/遠足|戶外|公园|公園|花展|行山|探索|參觀/,
      items:['點名兩次：出發前、上車前（名單對住讀名，唔好靠記憶）','交代界線：指住實物講「淨係可以去呢度」＋集合口令，試喊一次睇有冇反應','集合點與解散點確認（同家長講明邊度交收小朋友）','地面／路線行一次：睇有冇碎玻璃、水窪、斜坡、車路','每小隊配 1 位大人；4–7 歲建議 1:4 至 1:6','急救包、水、後備衣物、防曬／雨具（逐樣講畀家長知）','過敏與服藥名單帶住（紙本）','回校／回車時間講清楚，並設「延遲通報」聯絡人','回程前再點名＋清點物品（每人執自己垃圾）','天氣／場地電話確認（出發前 2 小時再睇一次預報）']},
    water:{key:'water',n:'玩水／夏水禮安全檢查表',ic:'💦',when:/水槍|玩水|運水|泡泡|沖身|更衣/,
      items:['場地批准：確認場地准許玩水、有排水位、範圍內冇裸露插蘇','劃三線：遊戲區／補水區／休息區（用膠紙或雪糕筒）','地面防滑：走一遍濕位，出口鋪墊／乾毛巾','水壓：只用兒童水槍，唔准加壓型；唔准對住人面／眼射','人手：成人全程望住，1:4 為上限','每回合 2–3 分鐘就停—細個嘅失溫快','備換衫、毛巾、膠袋；頭髮長者束起','收水後：先點名再換衫（唔好濕身行入冷氣房）','電器／插蘇離水 2 米以上，樂器用電池版','備「後備乾活動」：玩法被取消時即轉（問答／快樂傘）']},
    award:{key:'award',n:'頒獎／典禮前檢查表',ic:'🏅',when:/頒獎|典禮|證書|嘉許|晋團|晉團/,
      items:['獎章、證書按名單順序排好（一疊一格，叫名即攞）','上台路綫走一次：邊度企、面向邊度、影相喺邊','名單核對：出席／缺席、級別、姓名讀音（寫低讀音提示）','影相同意：確認家長同意書；唔同意就不影正面（或用後方／剪影）','講稿：每個名後加一句「佢做到××」（具體才有意義）','試音／試燈：麥克風、投影、伴奏先过一次','拍照位：光線面向窗、背景唔好太雜（會搶走張相）','時間控制：30 人頒獎 12 分鐘為上限，超過就分組','完場：即時喺 APP「記錄完成」剔數，唔好等返屋企先補','遺漏處理：缺席者另定日期補頒（不要「下次先」）']},
    craft:{key:'craft',n:'美勞／手工前檢查表',ic:'🎨',when:/美勞|手工|DIY|燈籠|揮春|相框|卡|畫|摺|剪/,
      items:['未做過都帶得：開會前撳「📚 跟我自學」睇成品圖＋逐步拆解（3 分鐘）；有多 5 分鐘就自己試做一個','工具測試：剪刀逐把試剪、切孔器試打一個孔','每人事先定量：物料一次派完，避免為輪流爭拗','尖利工具集中喺「大人一檔」，唔准離開','枱面鋪紙／報紙；濕布與膠袋放定（收尾快一倍）','定規矩：做完一步舉手；「停」嘅手勢示範一次','時間死線：宣布幾時收工，到點一律停手','未完成方案：預留膠紙—貼好帶返屋企繼續','影相：影作品＋作者，唔好影到其他團／途人正面','安全：顏料唔入口、貼牆位由領袖處理']}
  },
  checkFor:function(st){
    if(!st)return null;
    if(Object.prototype.toString.call(st)==='[object Array]'){ // 成場：逐節睇，揾最緊要嗰張表
      var order=['water','outdoor','award','craft'];
      for(var j=0;j<order.length;j++){
        for(var i2=0;i2<st.length;i2++){var c2=this.checks[order[j]];if(c2.when.test((st[i2].t||'')+' '+(st[i2].n||'')+' '+(st[i2].how||'')))return c2}
      }
      return null;
    }
    var n=(st.t||'')+' '+(st.n||'')+' '+(st.how||'');
    var order2=['water','outdoor','award','craft'];
    for(var k=0;k<order2.length;k++){var c=this.checks[order2[k]];if(c.when.test(n))return c}
    return null;
  },
  /* ============ ③ 家長訊息範本：一撳複製，唔使由零寫 ============ */
  msgs:[
    {ic:'📣',n:'集會通知（每週固定版）',t:'【小童軍集會通知】\n日期：{date}（{weekday}）\n時間：{time}\n地點：{place}\n請帶：水、{extra}\n當日主題：{theme}\n如未能出席，請於 {deadline} 前告知（方便排活動分組）。\n多晒！—{leader} 領袖'},
    {ic:'🧺',n:'物資／回收物收集',t:'【小小任務：收集物料】\n本週主題係「{theme}」，想請小朋友同你一齊準備：\n・{item1}（乾淨、無尖角）\n・{item2}\n請喺 {date} 帶到集會現場，放喺「物料銀行」好嗎？多謝你哋！\n（用過的物料都會帶返屋企繼續玩）'},
    {ic:'🥾',n:'戶外／親子活動須知',t:'【戶外活動須知】\n集合：{time} 假 {place}（準時出發，{depart} 開隊）\n請帶：水 500 毫升、帽子、後備衫、{extra}\n請注意：穿長袖薄衫（防蚊）、唔戴昂貴飾物（會失落）、塗防曬\n回程：約 {back} 返回同一地點，交收時請家長親身接\n身體不適請早講—我哋會安排大人陪同休息。\n負責人：{leader}（電話：{phone}）'},
    {ic:'🌟',n:'活動後多謝＋分享',t:'【今日集會小結】\n今日我哋：{done}\n最靚一刻：{highlight}\n功課（好開心嗰種）：返屋企同屋企人講一句「我今日整咗／學咗××」\n多謝各位家長準備{thanks}—下次見！\n⚠️ 如不希望小朋友嘅相被收集／分享，請私訊我，我哋會將佢嘅相只作內部記錄。'},
    {ic:'🙋',n:'缺席跟進（溫和版）',t:'Hi {parent}，今日未見得 {child}，好掛住佢呀！\n無事唔使回—只想話你知今日我哋玩咗：{done}。\n下次集會 {date} {time}，如需要我幫手準備物資／車位，講一聲得了。'}
  ],
  /* 大括號位會自動填：設定入面嘅資料 → 上下文 → 合理預設 → （請填 xxx） */
  fill:function(text,o){
    o=o||{};
    var s=Store.get('settings',{group:'',dur:'60'});
    var tm=String(s.time||'').match(/(\d{1,2}[:：]\d{2})\D{0,4}(\d{1,2}[:：]\d{2})/);
    var d=o.date||new Date().toLocaleDateString('zh-HK');
    return String(text).replace(/\{(\w+)\}/g,function(_,k){
      if(o[k]!=null&&o[k]!=='')return o[k];
      if(k==='date')return d;
      if(k==='weekday')return '星期'+'日一二三四五六'.charAt(new Date().getDay());
      if(k==='place'||k==='time'||k==='phone')return s[k]||'(請填'+(k==='place'?'集合地點':k==='time'?'時間':'電話')+')';
      if(k==='leader')return ((s.leaders||'').split(/[,，、\/]+/)[0]||'').trim()||s.group||'(請填聯絡人)';
      if(k==='depart')return tm?Kit._addMin(tm[1],5):'(開隊時間)';
      if(k==='back')return tm?tm[2]:'(完場時間)';
      if(k==='deadline')return '集會前一日';
      if(k==='item1'||k==='item2')return o.items?o.items[+k.slice(4)-1]||'(請填物料)':'(請填物料)';
      return '(請填 '+k+')';
    });
  },
  _addMin:function(hm,add){
    var p=String(hm).replace('：',':').split(':');var t=(+p[0])*60+(+p[1]||0)+add;
    return ((Math.floor(t/60))%24)+':'+('0'+(t%60)).slice(-2);
  },
  copy:function(txt,btn){
    var t=this.fill(txt,this._ctx||{});
    var done=function(){toast('已複製・貼去 WhatsApp／群組就得 ✓');if(btn){var o=btn.textContent;btn.textContent='✓ 已複製';setTimeout(function(){btn.textContent=o},1600)}};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){Kit._fallback(t,done)})}
    else this._fallback(t,done);
  },
  _fallback:function(t,cb){
    var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy')}catch(e){}
    document.body.removeChild(ta);cb();
  },
  msgHtml:function(){
    return this.msgs.map(function(m,i){
      return '<div class="kit-msg"><div class="km-h"><span>'+m.ic+'</span><b>'+esc(m.n)+'</b>'+
        '<button class="btn sm" onclick="Kit.copy(Kit.msgs['+i+'].t,this)">📋 複製</button>'+
        '<button class="btn sm ghost" onclick="Kit.editMsg('+i+')">✏️ 改內容</button></div>'+
        '<pre class="km-b">'+esc(Kit.fill(m.t,Kit._ctx||{}))+'</pre></div>'
    }).join('');
  },
  editMsg:function(i){
    var m=this.msgs[i];
    Modal.open('<h3>✏️ 改範本：'+esc(m.n)+'</h3><div class="mute" style="font-size:.8rem">可以用呢啲符號，複製時自動填你旅團設定嘅資料：{date} {weekday} {time} {place} {phone} {leader} {theme} {extra} {deadline} {depart} {back} {item1} {item2} {done} {highlight} {thanks} {parent} {child}；冇填到嘅會顯示「請填」，當提醒自己補返就得。</div>'+
      '<textarea id="kgMsg" style="width:100%;min-height:220px;font-size:.85rem">'+esc(m.t)+'</textarea>'+
      '<div class="btns"><button class="btn sm gr" onclick="Kit.saveMsg('+i+')">💾 儲存</button><button class="btn sm ghost" onclick="Kit.copy(document.getElementById(\'kgMsg\').value,this)">📋 複製而家呢份</button></div>');
  },
  saveMsg:function(i){
    var v=document.getElementById('kgMsg').value.trim();
    if(!v)return;
    var a=Store.get('msgTpl',{});a[i]=v;Store.set('msgTpl',a);toast('已儲存 ✓');Modal.close();
  },
  mergeMsgs:function(){
    var a=Store.get('msgTpl',{});
    this.msgs.forEach(function(m,i){if(a[i]!=null)m.t=a[i]});
  },
  /* ============ ④ 分工：每個環節有人負責，唔係「邊個得閒邊個做」 ============ */
  owners:function(){return Store.get('owners',{})},
  setOwner:function(key,name){var o=this.owners();if(name)o[key]=name;else delete o[key];Store.set('owners',o)},
  leaderNames:function(){
    var s=Store.get('settings',{});
    var a=(s.leaders||'').split(/[,，、\/]+/).map(function(x){return x.trim()}).filter(function(x){return x});
    return a.length?a:[];
  },
  ownerHtml:function(tid,i,st){
    if(!tid)return '';
    return Kit.ownerRowHtml(tid,i,st);
  },
  ctxFor:function(tid){
    var t=(typeof dur==='function')?dur(tid):null;if(!t)return {};
    var mats=(typeof matsOf==='function')?matsOf(t):[];
    return {theme:t.theme||'',items:mats.slice(0,2),extra:mats.slice(0,3).join('、')||'水同毛巾就得'};
  },
  msgOpen:function(ctx){
    if(typeof ctx==='string')ctx=Kit.ctxFor(ctx);
    Kit._ctx=ctx||{};
    var note=Kit._ctx.theme?'<div class="attention" style="margin:8px 0"><b>已用今場資料預填</b>　主題：'+esc(Kit._ctx.theme)+(Kit._ctx.items&&Kit._ctx.items.length?'　・要帶：'+esc(Kit._ctx.items.join('、')):'')+'　（得返日期／聯絡人要改）</div>':'';
    Modal.open('<div class="card"><h2>📣 家長訊息範本</h2><div class="mute" style="font-size:.82rem">撳「📋 複製」即貼去 WhatsApp／群組。大括號位會自動填「設定 → 旅團設定」嘅時間、地點、電話；未填嘅會寫「請填」。</div>'+note+Kit.msgHtml()+'</div>');
  },
  ownerRowHtml:function(tid,i,st){
    var key=tid+':'+i,nm=this.ownerOf(tid,i,st);
    var names=this.leaderNames();
    var inp='<input class="owner-in" list="leaderList" placeholder="邊個帶" value="'+esc(nm)+'" onchange="Kit.setOwner(\''+key+'\',this.value);toast(\'已記低負責領袖 ✓\')">';
    if(!Kit._dl){Kit._dl=1;inp='<datalist id="leaderList">'+names.map(function(x){return '<option value="'+esc(x)+'">'+'</option>'}).join('')+'</datalist>'+inp}
    return '<div class="owner-row">🧑‍🏫 負責領袖'+inp+(names.length?'<div class="owner-chips">'+names.map(function(x){return '<button class="pill'+(nm===x?' on':'')+'" onclick="Kit.setOwner(\''+key+'\',\''+esc(x)+'\');App.route()">'+esc(x)+'</button>'}).join('')+'</div>':'')+'</div>';
  },
  /* ============ ⑤ 團員章・小草蜢：話你「去做」之外，話你去邊度教、點計數 ============ */
  badgeMap:[
    {k:'attend',t:'參加 4 次團集會',where:'📅規劃 → 每次集會完撳「記錄完成」',how:'出席自動累計，唔使自己數；第 4 次即達標。',link:'Modal.close();App.go(\'#plan\')'},
    {k:'song',t:'唱小童軍主題歌',where:'▶️帶領 → 主題曲卡拉OK（APP 即時彈奏）',how:'先聽一次伴奏、再逐句跟唱；願意唱就得，唔要求音準同記憶晒歌詞。',link:'Modal.close();Lead.startStage(\'t02\',1)'},
    {k:'chute',t:'揚動快樂傘',where:'▶️帶領 → 快樂傘開會／散會 + 16 式玩法卡',how:'開會散會都得計；識握傘邊、跟口令揚傘收傘就算完成。',link:'Modal.close();Lead.startGame(\'chute\',\'快樂傘玩法卡\')'},
    {k:'scarf',t:'整理領巾',where:'🎨活動架 → 「整理領巾」教學（三步圖解：攤平・捲起・穿巾圈）',how:'每人試一次＋領袖逐個檢查；巾圈太緊要剪返，唔使硬塞。',link:'Modal.close();Lead.startGame(\'scarf\',\'整理領巾圖解\')'},
    {k:'promise',t:'說出誓詞・規律・口號',where:'▶️帶領 → 誓詞大字投影（照住讀）',how:'分三段讀：「我願參加小童軍」／「愛神愛人愛國家」／規律一句；肯跟讀就算，唔使逐字背。',link:'Modal.close();Lead.startGame(\'promise\',\'誓詞・規律・口號\')'},
    {k:'sfh',t:'認識保護自己免受傷害',where:'🎮活動架 → 身體地圖紅黃綠（數碼互動）',how:'用螢幕點擊身體部位＋演練講「唔好！」；唔要求小朋友講私人經歷。',link:'Modal.close();Lead.startGame(\'bodycard\',\'身體地圖紅黃綠\')'}
  ],
  ghMap:[
    {n:'我愛戶外',ic:'🌳',sug:'公園自然探索、尋寶 Bingo、戶外遊戲、植樹／澆花',meet:'t12 公園探索・t05 戶外遊戲'},
    {n:'我愛運動與健康',ic:'🏃',sug:'障碍賽、運水接力、律動指令、洗手七步、彩虹飲食',meet:'t18 夏水禮・g1 體能反應'},
    {n:'認識自己・幫助他人',ic:'🤝',sug:'日行一善承諾卡、家務任務抽籤、情緒面面觀、幫隊友扣旅巾',meet:'t07 誓詞與善行・g2 社區'},
    {n:'我愛科學與大自然',ic:'🔬',sug:'三色回收分類、浮沉／紙船載重、觀察天氣記錄、昆蟲與小草蜢',meet:'t17 廢物變寶・g4 環保大自然'},
    {n:'我愛創新',ic:'🎨',sug:'集體創新畫、燈籠／心意卡／相框 DIY、廢物變寶（每件有名字同一句介紹）',meet:'t03 中秋燈籠・t18 立體卡・g5 創新畫'},
    {n:'我愛國家與社區',ic:'🏇',sug:'國旗與區旗禮儀、節日習俗（揮春／中秋）、社區地圖、探險街道安全',meet:'t11 新春・t03 中秋・t15 交通'},
    {n:'我愛童軍大家庭',ic:'🏕️',sug:'貝登堡故事、左握禮、認識支部圖鑑、同幼童軍哥哥姐姐玩一次',meet:'t01 認識我哋・t20 父親節・t21 支部之旅'}
  ],
  /* ============ ⑥ 影相與私隱：4 句就夠，但要講 ============ */
  photo:'📷 影相四句：①開季問家長有冇不同意收集／分享；②只影自己團員，唔影外人／其他團正面；③唔將相放入公開群組（用旅團專用群）；④有隊員唔想被影—佢做「攝影師助手」一樣有份。',
  /* 成場集會嘅「預備包」：備料指引 + 執行檢查表 + 分工（準備卡底部用） */
  meetKitHtml:function(t){
    var mats=(typeof matsOf==='function')?matsOf(t):[];
    var names=this.leaderNames();
    var def=(Store.get('meetmeta',{}).__def)||'';
    var h='<div class="card kit-card"><h4 class="kit-h4">🧰 做之前點預備（備料・檢查表・分工）</h4>';
    h+=this.matsTipHtml(mats);
    h+=this.checkHtml(t.stages||[]);
    h+='<div class="kit-owner"><b>👥 邊個帶邊節（填咗即刻儲存，打印教案都會跟住出）</b>';
    h+='<input class="owner-in" list="leaderList" placeholder="全部未定＝你一個帶晒（呢格係預設負責人）" value="'+esc(def)+'" oninput="Kit.setDefaultOwner(this.value)">';
    h+='<div class="mute kit-note">填呢格＝所有未註明嘅環節都算呢位帶；想逐節唔同，喺下面每個環節入面改。';
    h+=(names.length?'':'（想下次快速揀名：去「設定 → 旅團設定 → 領袖名單」填，用、分開）');
    h+='</div></div>';
    var best=this.checkFor(t.stages||[]);
    h+='<div class="btns" style="margin-top:8px">'+
      '<button class="btn sm ghost" onclick="Kit.prepMsgFor(\''+esc(t.id||'')+'\')">📣 抄畀家長（已填主題・物資）</button>'+
      (best?'<button class="btn sm ghost" onclick="Kit.prepCheckPrint(\''+esc(t.id||'')+'\')">🖨️ 打印'+esc(best.n)+'</button>':'')+
      '</div>';
    return h+'</div>';
  },
  setDefaultOwner:function(v){
    Kit._def=v;clearTimeout(Kit._dt);
    Kit._dt=setTimeout(function(){var m=Store.get('meetmeta',{});m.__def=Kit._def;Store.set('meetmeta',m)},500);
  },
  ownerOf:function(tid,i,st){
    var v=this.owners()[tid+':'+i];
    if(v)return v;
    var m=Store.get('meetmeta',{});return (m&&m.__def)||'';
  },

  /* ============ 渲染工具 ============ */
  matsTipHtml:function(list){
    var arr=(list||[]).filter(function(m){return Kit.mats[Kit.norm(m)]||Kit.fuzzy(m)});
    if(!arr.length)return '';
    return '<div class="kit-tip"><div class="kt-h">📦 呢啲物資點備・每人幾多（撳一下就收埋）</div><button class="btn sm ghost kt-t" onclick="this.parentNode.classList.toggle(\'open\')">展開／收起</button><div class="kt-b">'+
      arr.map(function(m){var t=Kit.mats[Kit.norm(m)]||Kit.fuzzy(m);
        return '<div class="kt-row"><b>'+esc(m)+'</b><div>・人手：'+esc(t.q)+(t.how?'<br>・備法：'+esc(t.how):'')+(t.sub?'<br>♻️ 冇就改用：'+esc(t.sub):'')+'</div></div>'}).join('')+
      '</div></div>';
  },
  norm:function(m){return String(m||'').replace(/\s/g,'')},
  fuzzy:function(m){
    var k=this.norm(m);if(!k)return null;
    for(var key in this.mats){if(k.indexOf(key)>-1||key.indexOf(k)>-1)return this.mats[key]}
    return null;
  },
  checkHtml:function(st,t){
    var c=this.checkFor(st||{t:(t&&t.t)||'',n:(t&&t.n)||'',how:''});
    if(!c)c=this.checkFor(t||null);
    if(!c)return '';
    return '<div class="kit-check"><div class="kc-h">'+c.ic+' '+esc(c.n)+' <span class="tag">逐項剔走・可打印</span></div>'+
      '<ol class="kc-list">'+c.items.map(function(x,i){return '<li onclick="this.classList.toggle(\'on\')"><span class="kc-no">'+(i+1)+'</span>'+esc(x)+'</li>'}).join('')+'</ol>'+
      '<div class="kc-foot"><button class="btn sm" onclick="Kit.copy(Kit.checkTxt(\''+c.n.replace(/'/g,'')+'\'),this)">📋 複製清單</button><small class="mute">出發前讀一次；完成晒先至開隊。</small></div></div>';
  },
  checkTxt:function(name){
    for(var k in this.checks)if(this.checks[k].n===name)return '🦗 '+this.checks[k].n+'\n'+this.checks[k].items.map(function(x,i){return (i+1)+'. '+x}).join('\n');
    return '';
  },
  /* 集合時用嘅「一撳即用」頁（隨手開會＋手冊都會用到） */
  hubHtml:function(){
    var self=this;
    return '<div class="card"><h2>🧰 做之前點預備</h2>'+
      '<div class="attention"><b>呢度係「叫你做 → 教你點做」嘅補漏位</b><br>物資有每人幾多同一個後備、場地檢查表有逐項清單、家長訊息有範本、頒獎有流程、章項有去邊度教—唔使自己由零估。</div>'+
      '<div class="kit-grid">'+
        ['<button class="btn sm gr" onclick="Kit.openCheck(\'outdoor\')">🥾 戶外出發前檢查表</button>',
         '<button class="btn sm" onclick="Kit.openCheck(\'water\')">💦 玩水安全檢查表</button>',
         '<button class="btn sm" onclick="Kit.openCheck(\'award\')">🏅 頒獎前檢查表</button>',
         '<button class="btn sm" onclick="Kit.openCheck(\'craft\')">🎨 美勞前檢查表</button>'].join('')+
      '</div>'+
      '<h3 style="margin-top:14px">📣 家長訊息範本（改一次，之後每次直接用）</h3>'+
      '<div class="mute" style="font-size:.82rem">大括號位會自動填你「旅團設定」嘅資料；撳「改內容」就改成你自己團嘅版本。</div>'+
      this.msgHtml()+
      '<h3 style="margin-top:14px">⚖️ 團員章六項：去邊度教・點計數</h3>'+
      '<div class="kit-badge">'+this.badgeMap.map(function(b){
        return '<div class="kb-row"><b>'+esc(b.t)+'</b><small>📍 '+esc(b.where)+'</small><small>💡 '+esc(b.how)+'</small><button class="btn sm ghost" onclick="'+b.link+'">▶ 即刻開</button></div>'
      }).join('')+'</div>'+
      '<h3 style="margin-top:14px">🦗 小草蜢七大範疇：體驗去邊搵</h3>'+
      '<div class="kit-gh">'+this.ghMap.map(function(g){return '<div class="kg-row"><span>'+g.ic+'</span><div><b>'+esc(g.n)+'</b><small>建議體驗：'+esc(g.sug)+'</small><small class="mute">對照範本：'+esc(g.meet)+'</small></div></div>'}).join('')+'</div>'+
      '<div class="song-note" style="margin-top:12px"><b>'+this.photo+'</b></div>'+
      '</div>';
  },
  hubOpen:function(){Modal.open(Kit.hubHtml())},
  prepMsgFor:function(tid){Kit.msgOpen(Kit.ctxFor(tid))},
  prepCheckPrint:function(tid){
    var t=dur(tid);if(!t)return;
    var c=Kit.checkFor(t.stages||[]);
    Modal.close();PrintKit.openModal('checklists',c?c.key:'');
  },
  /* 帶領中／工具箱用：開今場最啱嘅檢查表 */
  openCheckFor:function(m){
    var st=(m&&m.stages)||[];
    var c=Kit.checkFor(st);
    Kit.openCheck(c?c.key:'outdoor');
  },
  checkToolHtml:function(m){
    var st=(m&&m.stages)||[];
    var keys=Object.keys(this.checks).filter(function(k){var c=Kit.checks[k];
      return st.some(function(x){return c.when.test((x.t||'')+' '+(x.n||'')+' '+(x.how||''))})});
    if(!keys.length)keys=['outdoor'];
    return '<div class="tool-check">'+st.map(function(x){var c=Kit.checkFor(x);
        return '<div class="tc-row"><b>'+esc(x.n)+'</b><small>'+(c?c.ic+' '+esc(c.n):'一般環節・跟常規就夠')+'</small>'+(c?'<button class="btn sm ghost" onclick="Kit.openCheck(\''+c.key+'\')">打開</button>':'')+'</div>'}).join('')+
      '<div class="btns" style="margin-top:8px">'+keys.map(function(k){return '<button class="btn sm gr" onclick="Kit.openCheck(\''+k+'\')">'+Kit.checks[k].ic+' '+esc(Kit.checks[k].n)+'</button>'}).join('')+'</div>'+
      '<div class="mute" style="font-size:.75rem;margin-top:6px">逐項剔走；完成晒先至開隊。呢張表係領袖自己用，唔使讀俾小朋友聽。</div></div>';
  },
  badgeInfo:function(k){return this.badgeMap.filter(function(b){return b.k===k})[0]||null},
  matsTipPrint:function(list){
    var arr=(list||[]).filter(function(m){return Kit.mats[Kit.norm(m)]||Kit.fuzzy(m)});
    if(!arr.length)return '';
    return '<div class="p-mat-tips"><div class="p-tip-title">📦 人手・備法・後備</div>'+arr.map(function(m){var t=Kit.mats[Kit.norm(m)]||Kit.fuzzy(m);
      return '<div class="p-mat-tip"><b>'+esc(m)+'</b>：'+esc(t.q)+(t.how?'　備法：'+esc(t.how):'')+(t.sub?'　後備：'+esc(t.sub):'')+'</div>'}).join('')+'</div>';
  },
  matsTipTxt:function(list){
    var arr=(list||[]).filter(function(m){return Kit.mats[Kit.norm(m)]||Kit.fuzzy(m)});
    return arr.map(function(m){var t=Kit.mats[Kit.norm(m)]||Kit.fuzzy(m);
      return '・'+m+'：'+t.q+(t.how?'（備法：'+t.how+'）':'')+(t.sub?' 後備：'+t.sub:'')}).join('\n');
  },
  ownersOf:function(t){
    var id=t.id||((typeof Prepare!=='undefined')&&Prepare._detailId)||'';
    return (t.stages||[]).map(function(s,i){return Kit.ownerOf(id,i,s)});
  },
  openCheck:function(k){
    var c=this.checks[k];
    if(!c){for(var kk in this.checks){if(this.checks[kk].n===k)c=this.checks[kk]}}
    if(!c)return;
    Modal.open('<div class="eyebrow">🧭 執行檢查表</div><h3>'+c.ic+' '+esc(c.n)+'</h3>'+
      '<div class="mute" style="font-size:.82rem">逐項剔走（剔咗變綠色）。呢個清單係俾領袖用嘅—唔使讀俾小朋友聽。</div>'+
      '<div class="kit-check modal-check"><ol class="kc-list">'+c.items.map(function(x,i){return '<li onclick="this.classList.toggle(\'on\')"><span class="kc-no">'+(i+1)+'</span>'+esc(x)+'</li>'}).join('')+'</ol></div>'+
      '<div class="btns"><button class="btn sm gr" onclick="Kit.copy(Kit.checkTxt(\''+c.n+'\'),this)">📋 複製清單（貼去領袖群）</button>'+
      '<button class="btn sm ghost" onclick="Modal.close();PrintKit.openModal(\'checklists\',\''+k+'\')">🖨️ 打印 A4</button></div>');
  },
  /* A4 打印：檢查表（全部場景一頁）或單頁 */
  printSheet:function(k){
    var keys=k?[k]:Object.keys(this.checks);
    return '<div class="a4-sheet kit-sheet"><div class="print-header-simple"><span>小童軍訓練教材套包 10</span> <b>🧭 '+esc(this.checks[k]?this.checks[k].n:'集會執行檢查表（全套）')+'</b></div>'+
      '<div class="p-note">用途：將「要做嘅事」變成逐項可剔嘅清單—領隊執行用，唔使讀俾小朋友聽。完成晒先至開隊。</div>'+
      keys.map(function(key){var c=Kit.checks[key];
        return '<div class="print-section"><div class="p-sec-title">'+c.ic+' '+esc(c.n)+'</div><table class="print-table check-table"><tbody>'+
          c.items.map(function(x,i){return '<tr><td class="ck-no">'+(i+1)+'</td><td class="ck-box"></td><td>'+esc(x)+'</td></tr>'}).join('')+
        '</tbody></table></div>'}).join('')+
      '<div class="print-section"><div class="p-sec-title">📷 影相與私隱（四句就夠）</div><div class="p-para">'+esc(Kit.photo.replace(/^📷\s*/,''))+'</div></div>'+
      '<div class="p-foot">旅團：____________　集會日期：____________　負責領袖：____________　© 2026 Scout System</div></div>';
  },
  /* A4 嘉許狀（內部即時頒發版；官方獎章證書仍按旅團程序申請） */
  printCert:function(name,item){
    var s=Store.get('settings',{group:'小童軍團'});
    return '<div class="a4-sheet cert-sheet"><div class="cert-box">'+
      '<div class="cert-ic">🦗</div><h2 class="cert-t">'+esc(s.group||'小童軍團')+'</h2>'+
      '<div class="cert-sub">嘉 許 狀 ・ Certificate of Achievement</div>'+
      '<div class="cert-lead">茲證明</div>'+
      '<div class="cert-name">'+esc(name||'＿＿＿＿＿＿')+'</div>'+
      '<div class="cert-lead">已完成並表現出色：「'+esc(item||'小童軍集會體驗')+'」</div>'+
      '<div class="cert-quote">「小童軍向前進」・小童軍日行一善</div>'+
      '<div class="cert-sign"><div>主領領袖：______________</div><div>日期：______________</div></div>'+
      '<div class="cert-note">本嘉許狀為旅團內部即時鼓勵用途；官方獎章與證書請按香港童軍總會程序向總部申請。</div>'+
      '</div></div>';
  }
};
Kit.mergeMsgs();
