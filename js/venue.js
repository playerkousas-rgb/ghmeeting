/* 🦗 venue.js — 場地設置層：由「乜都未做過」到「入到場就知道貼乜、企邊、幾多分鐘搞掂」 © 2026 Scout System */
/* 定位：新新新手領袖最怕唔係「玩乜」，係「入到禮堂之後點擺」。
   呢一層將場地拆成：6 個分區 → 5 種場地佈置（附平面圖）→ 開場前 30 分鐘時間表 → 5 條規矩 → 人數對策 → 救急。
   每個環節需要設乜場，由 Venue.needFor(stage) 自動計出嚟（準備卡・帶領畫面・A4 教案共用）。 */
var Venue={
  /* ============ ① 六個分區：任何場地都要有呢六個位 ============ */
  zones:[
    {ic:'⭕',n:'集合圈',what:'開會散會、點名、講故事、靜息、頒獎',
      how:'用粉筆或膠紙貼一個圈（或者用 8–12 個坐墊圍圈）。小朋友企／坐喺圈線上，唔好入圈中間—中間係領袖位。',
      size:'每人約 60 厘米闊：12 人 → 圈直徑約 2.5 米；20 人 → 約 4 米。量唔到就用「伸出手搵唔到隔籬」做準。',
      wrong:'圈太細 → 小朋友會推撞；圈太大 → 你講嘢佢哋聽唔到。寧細勿大，細可以逼埋啲。'},
    {ic:'🦗',n:'遊戲區（跑動區）',what:'草蜢跳格、紅綠燈、四角搶答、障礙接力',
      how:'喺集合圈以外劃一塊淨空長方形，四邊離牆／枱角最少 1 米。地貼、角牌全部貼喺呢區。',
      size:'最小 4×5 米先至玩到紅綠燈；6×8 米可以同時設九宮格＋四角。',
      wrong:'最常見嘅錯：遊戲區同家長等候位重疊 → 小朋友衝入人堆。中間用雪糕筒／書包排一條線分隔。'},
    {ic:'🧺',n:'物資枱',what:'派發手工材料、水樽、後備物資',
      how:'一張枱放晒今場物資，按人數逐份分好（一人一格／一疊），唔好成堆放中間等佢哋自己攞。枱角鋪報紙。',
      size:'每 6–8 人一份枱面空間；枱要靠牆，唔好放喺跑動路線上。',
      wrong:'材料一堆放枱面 = 一定搶。分好份、貼名／貼色，派嘅時候先至拎出嚟。'},
    {ic:'🖥️',n:'領袖位＋螢幕',what:'投影、播伴奏、計時、記分',
      how:'螢幕／電視放喺集合圈正面，高度對住小朋友視線（離地 0.8–1.2 米）。你企喺螢幕隔籬，唔好背住佢哋行去撳掣。',
      size:'手機投影：房燈熄一半先睇到；冇投影就用電視／平板舉高。',
      wrong:'螢幕放喺小朋友身後 → 個個轉身睇，個圈即刻散。一定放正面。'},
    {ic:'🍃',n:'冷靜位',what:'眼淚、鬧情緒、太攰、想靜一靜',
      how:'角落放 2 個坐墊＋一隻公仔＋一瓶水。呢個位唔係罰企位：話俾佢知「唔舒服可以去坐，坐完自己返嚟」。',
      size:'1–2 個位就夠，要喺你視線範圍內，但唔喺跑動區。',
      wrong:'冇冷靜位 → 一個小朋友喊，成場停。有位就可以一個大人陪住，其餘照玩。'},
    {ic:'👟',n:'門口位：鞋袋・書包・家長交收',what:'到場、離場、點名交收',
      how:'門口外放一排鞋袋／膠箱，書包全部放呢度（唔好放遊戲區）。貼一張「交收位」紙，家長喺呢度等。',
      size:'每人一個位；行路要留 1 米闊。',
      wrong:'書包放遊戲區 = 一定絆倒。第一日就定死呢個位，之後每次一樣。'}
  ],

  /* ============ ② 五種場地佈置（附平面圖） ============ */
  layouts:[
    {k:'classroom',n:'標準課室（約 6×8 米）',ppl:'12–20 人',mins:20,
      setup:'枱全部推埋兩邊牆，中間騰空。集合圈貼喺靠窗一邊，遊戲區喺中間，物資枱靠門。',
      zones:['集合圈貼窗邊（光線好，影相靚）','遊戲區＝房中間 4×5 米','物資枱靠門（攞完即走，唔穿場）','冷靜位＝房角','門口位＝門外走廊'],
      tip:'課室最大優勢：有枱可以做手工。手工時 4 人一枱，枱面鋪報紙。',
      wrong:'唔好保留「上課式」座位—小朋友坐定就唔肯起身，動靜交替做唔到。'},
    {k:'hall',n:'禮堂／活動室（大場）',ppl:'20–36 人',mins:25,
      setup:'用雪糕筒先劃出「今場用嘅範圍」，其餘空間封閉。範圍細啲先至control到。',
      zones:['集合圈貼近音響／螢幕','遊戲區劃喺圈外一邊，四角貼角牌','物資枱喺入口旁','冷靜位揀一個牆角（背住音響）'],
      tip:'大場最緊要劃細：用雪糕筒＋膠紙圍出 8×10 米就夠 24 人玩。空間大 ≠ 好玩，反而聽唔到口令。',
      wrong:'成個禮堂任由跑 → 你嗌到沙聲佢哋都聽唔到，而且睇唔到邊個走咗。'},
    {k:'small',n:'細房間／飯廳（唔夠位）',ppl:'6–12 人',mins:10,
      setup:'枱推埋一邊，只留一個 3×4 米淨空。所有遊戲改「原地版」：唔跑，改踏步／轉身／蹲起。',
      zones:['集合圈＝坐墊圍圈（坐低玩）','遊戲區＝圈本身（原地動作）','物資枱＝一張細枱或膠箱','冷靜位＝門外走廊（有大人在）'],
      tip:'細場玩呢啲最好：領袖話、節奏模仿、傳球點名、故事、對錯法庭（改用「舉手」代替行位）。',
      wrong:'細場硬玩四角搶答 → 一定撞。改用「四張色紙舉牌」或者「企／坐」代替行位。'},
    {k:'outdoor',n:'戶外草地／操場',ppl:'12–30 人',mins:30,
      setup:'第一件事：行一次界線，指住實物講「淨係可以去呢度」。用雪糕筒圍出範圍，先至開始玩。',
      zones:['集合圈＝用 4 個雪糕筒做四角','遊戲區＝圈外草地（檢查有冇玻璃、螞蟻窩、水窪）','物資枱＝一塊野餐墊','冷靜位＝樹蔭下'],
      tip:'戶外聲線要短：口令要短過一句，配合哨子。集合口令試喊一次先至開始。',
      wrong:'唔劃界線就開玩 → 一定有人走失。界線要用睇得到嘅實物（雪糕筒、繩、牆），唔好只用口講。'},
    {k:'noprojector',n:'冇投影／冇電／戶外冇插座',ppl:'任何人數',mins:5,
      setup:'APP 手機版照用：抽籤、計時、計分、音效、拍子器全部手機搞掂。大字內容改用打印海報。',
      zones:['領袖位＝你手持手機','大字內容＝🖨️ 印「誓詞・口號・歌詞大字報」貼牆','遊戲＝全部實體版（九宮格用粉筆畫、四角用粉筆寫 A B C D）'],
      tip:'其實大部分遊戲唔使螢幕：紅綠燈、領袖話、草蜢跳格、傳球點名、快樂傘。螢幕只係方便你出題同計分。',
      wrong:'唔好因為冇投影就唔帶—打印 4 張 A4（誓詞／歌詞／角牌／九宮格號碼）已經夠成場集會。'}
  ],

  /* ============ ③ 開場前 30 分鐘時間表（照住做就得） ============ */
  timeline:[
    {t:'-30',n:'行一次場地',d:'由門口行到最深位：睇有冇碎玻璃、水窪、尖角、裸露插蘇。枱角尖嘅用膠紙包或者移走。',say:''},
    {t:'-25',n:'劃界線＋劃分區',d:'用雪糕筒／膠紙圍出今場範圍，貼集合圈。呢一步唔好慳—劃好之後你只用「返圈」兩個字就control到全場。',say:''},
    {t:'-20',n:'貼地貼・角牌',d:'九宮格／A B C D 角牌／投擲線貼好，逐個用腳踩一次確認唔翹邊。',say:''},
    {t:'-15',n:'物資枱：按人數分好份',d:'一人一格／一疊，貼名或貼色。工具（剪刀、打孔器）放「大人一檔」，離開小朋友可及範圍。',say:''},
    {t:'-12',n:'試螢幕・試聲',d:'投影對位、音量試一次、伴奏播頭 4 拍試聲。手機熄螢幕掣關咗（唔好中途熄）。',say:''},
    {t:'-10',n:'冷靜位＋水＋急救包',d:'坐墊、公仔、水、急救包放定；確認自己知道廁所在邊、最近出口喺邊。',say:''},
    {t:'-5',n:'門口位・家長交收',d:'鞋袋／書包箱擺好，貼「交收位」紙；同早到嘅家長講明幾點接、去邊度接。',say:''},
    {t:'-3',n:'定 5 條規矩',d:'小朋友到齊，未開始玩之前先講規矩（見下面「五條規矩」）。呢 3 分鐘決定成場順唔順利。',say:'「我哋開始之前，記住五樣嘢——」'},
    {t:'0',n:'開會',d:'集合圈 → 口號 → 快樂傘開會。第一次玩嘅遊戲，一定先示範一次。',say:'「小童軍——向前進！」'}
  ],
  packUp:[
    {t:'+0',n:'圍圈收結',d:'每人講一句「今日最開心係……」；派返作品，逐個叫名（唔好一窩蜂攞）。'},
    {t:'+5',n:'小朋友一齊執',d:'「三張紙執埋一疊」—給任務先至肯執。膠紙／地貼由大人撕。'},
    {t:'+8',n:'點名交收',d:'逐個叫名交俾家長，確認邊個嚟接。唔熟嘅大人唔交。'},
    {t:'+10',n:'記數',d:'APP 撳「✓ 記錄完成」剔出席（自動落 badge／小草蜢計數）；撕走地貼，檢查有冇留低嘢。'}
  ],

  /* ============ ④ 五條規矩：4–7 歲控場核心（照讀） ============ */
  rules:[
    {ic:'✋',n:'「停」嘅手勢',say:'「我舉高手，你哋即刻變木頭人—試一次俾我睇！」',
      why:'4–7 歲聽唔到長句，但睇到手勢即刻停。呢一招要第一次就練，練到佢哋反射式停。',
      drill:'開場練 3 次：舉手 → 全體定住 → 讚「好快！」。之後成場只用呢個手勢，唔使再嗌。'},
    {ic:'📣',n:'集合口令',say:'「我嗌『小草蜢』，你哋答『集合』，然後跑返圈上企好。」',
      why:'一句口號好過「返嚟呀返嚟呀」。有問有答，佢哋會覺得係遊戲。',
      drill:'試喊一次先至開始玩；之後每次轉環節都用同一句，唔好轉口令。'},
    {ic:'🚧',n:'界線',say:'「呢條線以外唔可以去。聽到哨子就返圈。」',
      why:'界線要用睇得到嘅實物（膠紙、雪糕筒、繩），口講嘅界線對 4 歲無效。',
      drill:'帶全體沿界線行一次，用手指住實物講。'},
    {ic:'🚻',n:'廁所手勢',say:'「想去廁所就舉兩隻手指，唔使講出嚟，我會叫你慢慢行去。」',
      why:'唔使中斷成場；亦避免佢哋自己走甩。',
      drill:'指明廁所在邊、要唔要大人陪（4–5 歲一律要）。'},
    {ic:'🧸',n:'唔舒服點算',say:'「唔開心、攰、想靜一靜，可以去坐墊度坐，坐完自己返嚟。」',
      why:'有冷靜位，眼淚唔會變成全場停頓；亦唔使罰企。',
      drill:'開場指住冷靜位講一次；真係有人去，派一個大人陪，其餘照玩。'}
  ],

  /* ============ ⑤ 人數對策 ============ */
  crowd:[
    {n:'6–10 人',g:'唔使分組',r:'1 位領袖夠',
      how:'全體一齊玩；每人每回合都有份。九宮格用「全體一齊跳」模式。'},
    {n:'11–16 人',g:'分 2 組',r:'1 領袖＋1 幫手',
      how:'開始分組計分；跑動遊戲要輪流（一組玩、一組坐圈邊數拍子）。'},
    {n:'17–24 人',g:'分 3–4 組（每組 5–6 人）',r:'1 領袖＋2 幫手（每組一個大人最好）',
      how:'所有遊戲改「分組接力」；四角搶答照玩（行位唔會亂）；手工 4 人一枱。'},
    {n:'25 人以上',g:'分 5 組或以上',r:'最少 1:8，即 25 人要 3 位大人',
      how:'唔好全體一齊跑：改「一組落場、其餘坐圈邊做觀眾數拍子」。輪流制先至control到。'}
  ],

  /* ============ ⑥ 現場救急 ============ */
  fix:[
    {q:'小朋友周圍跑、聽唔到口令',a:'即刻停：舉「停」手勢 → 全體返圈坐低 → 玩一個 30 秒靜態遊戲（領袖話／節奏模仿）先至再開跑。唔好嗌，嗌只會更嘈。'},
    {q:'場地細過預計',a:'跑動遊戲全部改原地版：紅綠燈→「原地踏步／定格」；四角搶答→「舉 A／B／C／D 色紙」；九宮格→縮成 3 個格（1 米闊都得）。'},
    {q:'人數多過預計',a:'即場分多一組，改輪流制；冇多嘅大人就請一位家長幫手睇一組。'},
    {q:'地面滑／濕',a:'即刻抹乾＋鋪毛巾；跑動遊戲暫停，轉靜態（問答、故事、節奏模仿）。'},
    {q:'冇投影／電話冇電',a:'用打印海報（🖨️ 誓詞・口號・歌詞大字報）；遊戲全部實體版；計時用手機鬧鐘、記分用粉筆寫牆。'},
    {q:'有人喊／唔肯玩',a:'唔好迫：請佢去冷靜位，一個大人陪；話俾佢知「睇住都得」。多數 5 分鐘內自己返嚟。'},
    {q:'環節玩完但仲有 10 分鐘',a:'後備三寶：快樂傘一式、領袖話、靜息呼吸。APP 帶領畫面頂欄撳「➕ 遊戲」即插。'},
    {q:'落雨／空氣差',a:'去 🧰 點預備 →「☔ 落雨／空氣差點算」，4 場戶外範本已有室內版，一撳存入「我嘅集會」。'}
  ],

  /* ============ ⑦ 每個環節需要設乜場（準備卡・帶領畫面・A4 共用） ============ */
  needFor:function(st){
    if(!st)return null;
    var n=(st.t||'')+' '+(st.n||'')+' '+(st.how||'')+' '+(st.script||'')+' '+(st.screen||'')+' '+((st.mats||[]).join(' '));
    var out={zones:[],setup:[],print:''};
    if(/九宮格|跳格|草蜢跳/.test(n)){
      out.zones.push('遊戲區');
      out.setup.push('貼 3×3 九宮格：每格約 60×60 厘米、格距 10 厘米，1 號喺左上（同 APP 畫面一樣）');
      out.setup.push('起步線貼喺九宮格外 1 米；終點後留 1 米緩衝');
      out.print='floor-grid';
    }
    if(/四角|搶答|角牌/.test(n)){
      out.zones.push('遊戲區');
      out.setup.push('A／B／C／D 角牌貼禮堂四角（離地 1 米內），角與角之間留一條行人路');
      out.print=out.print||'corner-signs';
    }
    if(/分邊|對錯法庭/.test(n)){
      out.zones.push('遊戲區');
      out.setup.push('👍 貼左牆、👎 貼右牆；中間用膠紙畫條線，兩邊各留 3 米');
      out.print=out.print||'corner-signs';
    }
    if(/回收|分類/.test(n)){
      out.zones.push('遊戲區','物資枱');
      out.setup.push('四角各一個回收桶（或貼桶標籤嘅紙箱）；實物回收物放物資枱，尖位用膠紙包');
      out.print=out.print||'corner-signs';
    }
    if(/投擲|射月|拋圈|圈圈月餅/.test(n)){
      out.zones.push('遊戲區');
      out.setup.push('投擲線（膠紙）離靶 1.5–2 米；靶掛牆或放枱；投擲方向前方清空，其他人退後一步');
      out.print=out.print||'corner-signs';
    }
    if(/障礙|循環|接力|運動會/.test(n)){
      out.zones.push('遊戲區');
      out.setup.push('排路線：站與站之間留 1.5 米；轉位處要有一位大人站住；終點留 2 米緩衝');
    }
    if(/快樂傘|PARABALLOON|揚傘/.test(n)){
      out.zones.push('遊戲區');
      out.setup.push('淨空直徑＝傘直徑＋2 米；檢查天花／吊扇高度；傘中央唔好放波以外嘅物件');
    }
    if(/圍圈|傳球|點名|故事|靜息|呼吸/.test(n)){
      out.zones.push('集合圈');
      out.setup.push('集合圈：12 人約 2.5 米直徑、20 人約 4 米；坐墊或粉筆圈');
    }
    if(/美勞|手工|DIY|燈籠|揮春|相框|摺|剪|貼/.test(n)){
      out.zones.push('物資枱');
      out.setup.push('4 人一枱，枱面鋪報紙；濕布同膠袋放枱角；工具集中喺「大人一檔」');
      out.setup.push('派料按人數分好份先至開始（唔好成堆放枱面）');
    }
    if(/頒獎|嘉許|證書/.test(n)){
      out.zones.push('集合圈','領袖位＋螢幕');
      out.setup.push('預留一條上台路線（闊 1 米）；影相位要背光向窗，背景唔好太雜');
    }
    if(!out.setup.length)return null;
    return out;
  },
  /* 成場集會：合併所有環節嘅場地需求 */
  forMeet:function(t){
    var zones=[],setup=[],prints={};
    ((t&&t.stages)||[]).forEach(function(st){
      var v=Venue.needFor(st);if(!v)return;
      v.zones.forEach(function(z){if(zones.indexOf(z)<0)zones.push(z)});
      v.setup.forEach(function(x){if(setup.indexOf(x)<0)setup.push(x)});
      if(v.print)prints[v.print]=1;
    });
    if(!setup.length)return null;
    return {zones:zones,setup:setup,prints:Object.keys(prints)};
  },

  /* ============ 渲染 ============ */
  zoneHtml:function(){
    return '<div class="vn-zones">'+this.zones.map(function(z){
      return '<div class="vz"><div class="vz-h">'+z.ic+' <b>'+esc(z.n)+'</b><small>'+esc(z.what)+'</small></div>'+
        '<div class="vz-r"><b>點劃</b>'+esc(z.how)+'</div>'+
        '<div class="vz-r"><b>幾大</b>'+esc(z.size)+'</div>'+
        '<div class="vz-r warn"><b>最易錯</b>'+esc(z.wrong)+'</div></div>'}).join('')+'</div>';
  },
  mapSvg:function(k){
    var L=this.layouts.filter(function(x){return x.k===k})[0]||this.layouts[0];
    var out='<div class="vn-map"><svg viewBox="0 0 400 260" role="img" aria-label="'+esc(L.n)+' 平面圖">'+
      '<rect x="6" y="6" width="388" height="248" rx="10" fill="#fffdf5" stroke="#e65100" stroke-width="3"/>'+
      '<circle cx="110" cy="80" r="46" fill="none" stroke="#43a047" stroke-width="4" stroke-dasharray="9 7"/>'+
      '<text x="110" y="84" text-anchor="middle" font-size="13" fill="#2e7d32" font-weight="700">⭕ 集合圈</text>'+
      '<rect x="196" y="42" width="176" height="120" rx="8" fill="#fff3e0" stroke="#fb8c00" stroke-width="3"/>'+
      '<text x="284" y="106" text-anchor="middle" font-size="13" fill="#e65100" font-weight="700">🦗 遊戲區</text>'+
      '<text x="214" y="60" font-size="10" fill="#8d6e63">A</text><text x="356" y="60" font-size="10" fill="#8d6e63">B</text>'+
      '<text x="214" y="156" font-size="10" fill="#8d6e63">C</text><text x="356" y="156" font-size="10" fill="#8d6e63">D</text>'+
      '<rect x="16" y="160" width="92" height="42" rx="6" fill="#e3f2fd" stroke="#1e88e5" stroke-width="2"/>'+
      '<text x="62" y="186" text-anchor="middle" font-size="11" fill="#0d47a1">🧺 物資枱</text>'+
      '<rect x="120" y="160" width="86" height="42" rx="6" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="2"/>'+
      '<text x="163" y="186" text-anchor="middle" font-size="11" fill="#4a148c">🖥️ 領袖＋螢幕</text>'+
      '<rect x="218" y="186" width="66" height="40" rx="6" fill="#f1f8e9" stroke="#43a047" stroke-width="2"/>'+
      '<text x="251" y="210" text-anchor="middle" font-size="11" fill="#1b5e20">🍃 冷靜位</text>'+
      '<rect x="298" y="186" width="76" height="40" rx="6" fill="#efebe9" stroke="#795548" stroke-width="2"/>'+
      '<text x="336" y="210" text-anchor="middle" font-size="11" fill="#4e342e">👟 門口／交收</text>'+
      '<path d="M20 232 H380" stroke="#c62828" stroke-width="3" stroke-dasharray="12 8"/>'+
      '<text x="200" y="248" text-anchor="middle" font-size="11" fill="#b71c1c" font-weight="700">— 界線：以外唔可以去 —</text>'+
      '<text x="200" y="22" text-anchor="middle" font-size="13" fill="#3e2723" font-weight="700">'+esc(L.n)+'</text>'+
      '</svg><small class="mute">同一張圖適用大部分室內場地：只係大細唔同。先劃界線，再貼分區。</small></div>';
    return out;
  },
  layoutHtml:function(){
    var self=this;
    return '<div class="vn-layouts">'+this.layouts.map(function(L){
      return '<div class="vl"><div class="vl-h"><b>'+esc(L.n)+'</b>'+
        '<span class="tag">'+esc(L.ppl)+'</span><span class="tag">設場約 '+L.mins+' 分鐘</span></div>'+
        (L.k==='classroom'?self.mapSvg(L.k):'')+
        '<div class="vl-r"><b>點擺</b>'+esc(L.setup)+'</div>'+
        '<div class="vl-r"><b>分區</b>'+L.zones.map(esc).join('　・　')+'</div>'+
        '<div class="vl-r"><b>💡 貼士</b>'+esc(L.tip)+'</div>'+
        '<div class="vl-r warn"><b>⚠️ 最易錯</b>'+esc(L.wrong)+'</div></div>'}).join('')+'</div>';
  },
  timelineHtml:function(){
    return '<div class="vn-tl">'+this.timeline.map(function(x){
      return '<div class="vtl"><span class="vtl-t">'+esc(x.t)+'</span><div><b>'+esc(x.n)+'</b>'+
        (x.say?'<div class="vtl-say">🎤「'+esc(x.say)+'」</div>':'')+
        '<small>'+esc(x.d)+'</small></div></div>'}).join('')+
      '<div class="vtl-h">散場（唔好跳過—記數同交收先至算完）</div>'+
      this.packUp.map(function(x){
        return '<div class="vtl"><span class="vtl-t">'+esc(x.t)+'</span><div><b>'+esc(x.n)+'</b><small>'+esc(x.d)+'</small></div></div>'}).join('')+
      '</div>';
  },
  rulesHtml:function(){
    return '<div class="vn-rules">'+this.rules.map(function(r,i){
      return '<div class="vr"><span class="vr-no">'+(i+1)+'</span><div><b>'+r.ic+' '+esc(r.n)+'</b>'+
        '<div class="vr-say">🎤 照讀：「'+esc(r.say)+'」</div>'+
        '<small><b>點解：</b>'+esc(r.why)+'</small><br><small><b>點練：</b>'+esc(r.drill)+'</small></div></div>'}).join('')+'</div>';
  },
  crowdHtml:function(){
    return '<table class="vn-crowd"><thead><tr><th>人數</th><th>分組</th><th>人手</th><th>點玩</th></tr></thead><tbody>'+
      this.crowd.map(function(x){
        return '<tr><td><b>'+esc(x.n)+'</b></td><td>'+esc(x.g)+'</td><td>'+esc(x.r)+'</td><td>'+esc(x.how)+'</td></tr>'}).join('')+
      '</tbody></table>';
  },
  fixHtml:function(){
    return '<div class="vn-fix">'+this.fix.map(function(x){
      return '<div class="vf"><b>❓ '+esc(x.q)+'</b><span>'+esc(x.a)+'</span></div>'}).join('')+'</div>';
  },
  /* 準備卡用：成場集會嘅場地需求 */
  meetHtml:function(t){
    var v=this.forMeet(t);
    if(!v)return '<div class="kit-tip"><div class="kt-h">📍 呢場唔使特別設場（集合圈＋物資枱就夠）</div></div>';
    var self=this;
    return '<div class="kit-tip vn-meet"><div class="kt-h">📍 呢場要設嘅場（撳開就見到貼乜、幾大）</div>'+
      '<button class="btn sm ghost kt-t" onclick="this.parentNode.classList.toggle(\'open\')">展開／收起</button>'+
      '<div class="kt-b">'+
      '<div class="vm-row"><b>要用嘅分區</b>'+v.zones.map(function(z){
        var zz=self.zones.filter(function(x){return x.n===z})[0];
        return '<span class="pill">'+(zz?zz.ic:'')+' '+esc(z)+'</span>'}).join(' ')+'</div>'+
      '<ol class="vm-list">'+v.setup.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>'+
      (v.prints.length?'<div class="btns" style="margin-top:6px">'+v.prints.map(function(p){
        var k=PrintKit.kits.filter(function(x){return x.id===p})[0];
        return '<button class="btn sm ghost" onclick="PrintKit.openModal(\''+p+'\')">🖨️ 印'+(k?k.n.replace(/（.*/,''):p)+'</button>'}).join('')+'</div>':'')+
      '<div class="btns" style="margin-top:6px"><button class="btn sm gr" onclick="Venue.open()">📍 睇完整場地設置教學</button>'+
      '<button class="btn sm ghost" onclick="Kit.openCheck(\'venue\')">🧭 到場設場檢查表</button></div>'+
      '</div></div>';
  },
  /* 帶領畫面用：今個環節嘅場地提示（一行） */
  stageHint:function(st){
    var v=this.needFor(st);if(!v)return '';
    return '<div class="vn-hint">📍 <b>場地</b>：'+esc(v.setup[0])+(v.setup.length>1?('　＋另外 '+(v.setup.length-1)+' 項'):'')+
      ' <button class="lnk" onclick="Venue.open()">點設？</button></div>';
  },
  html:function(){
    return '<div class="card"><h2>📍 場地設置：入到場之後，由呢度開始</h2>'+
      '<div class="attention"><b>新新新手最驚嘅唔係玩乜，係入到禮堂之後點擺。</b>呢一頁由零開始教：六個分區貼邊、五種場地點擺（附平面圖）、開場前 30 分鐘逐步做乜、開會前 3 分鐘點定規矩、幾多人分幾組、出亂子點救。</div>'+
      '<div class="box" style="font-size:.86rem"><b>三分鐘版：</b>① 行一次場地執走障礙 ② 用雪糕筒／膠紙劃界線 ③ 貼集合圈 ④ 物資按人數分好份 ⑤ 開會前定 5 條規矩（舉手停・集合口令・界線・廁身手勢・冷靜位）。做完呢五步，成場就control到。</div>'+
      '<div class="btns" style="margin-top:8px"><button class="btn sm gr" onclick="PrintKit.openModal(\'venue\')">🖨️ 打印 A4 場地設置卡</button>'+
      '<button class="btn sm ghost" onclick="Kit.openCheck(\'venue\')">🧭 到場設場檢查表（10 項）</button></div></div>'+
      '<div class="card"><h3>① 六個分區（任何場地都要有）</h3>'+this.zoneHtml()+'</div>'+
      '<div class="card"><h3>② 五種場地佈置</h3><div class="mute" style="font-size:.82rem">揀最似你場地嗰個跟住做。平面圖係標準課室版，其他場地只係大細同位置唔同。</div>'+this.layoutHtml()+'</div>'+
      '<div class="card"><h3>③ 開場前 30 分鐘・逐步做乜</h3>'+this.timelineHtml()+'</div>'+
      '<div class="card"><h3>④ 開會前 3 分鐘：定 5 條規矩（4–7 歲控場核心）</h3>'+
      '<div class="mute" style="font-size:.82rem">呢 3 分鐘決定成場順唔順利。每條都要即場練一次，唔好淨係講。</div>'+this.rulesHtml()+'</div>'+
      '<div class="card"><h3>⑤ 幾多人點玩</h3>'+this.crowdHtml()+'</div>'+
      '<div class="card"><h3>⑥ 現場救急</h3>'+this.fixHtml()+'</div>';
  },
  open:function(){
    if(typeof Flow!=='undefined')Flow.mark('venue',1);Modal.open('<div class="eyebrow">📍 場地設置</div>'+this.html())},
  /* A4 打印 */
  printSheet:function(){
    return '<div class="a4-sheet venue-sheet">'+
      '<div class="print-header-simple"><span>小童軍訓練教材套包 14</span> <b>📍 場地設置卡（到場跟住做）</b></div>'+
      '<div class="print-cut-notice">📌 用途：第一次去一個新場地，或者新領袖未試過設場。印出嚟夾喺寫字板上，到場逐項剔。</div>'+
      '<div class="print-section"><div class="p-sec-title">① 六個分區：貼邊・幾大・最易錯</div>'+
        '<table class="print-table"><thead><tr><th style="width:14%">分區</th><th style="width:30%">點劃</th><th style="width:26%">幾大</th><th style="width:30%">最易錯</th></tr></thead><tbody>'+
        this.zones.map(function(z){return '<tr><td><b>'+z.ic+' '+esc(z.n)+'</b><br><span style="font-size:7pt;color:#666">'+esc(z.what)+'</span></td>'+
          '<td style="font-size:7.6pt">'+esc(z.how)+'</td><td style="font-size:7.6pt">'+esc(z.size)+'</td><td style="font-size:7.6pt">'+esc(z.wrong)+'</td></tr>'}).join('')+
        '</tbody></table></div>'+
      '<div class="print-section"><div class="p-sec-title">② 開場前 30 分鐘・時間表</div>'+
        '<table class="print-table check-table"><tbody>'+
        this.timeline.map(function(x){return '<tr><td style="width:8%"><b>'+esc(x.t)+'</b></td><td class="ck-box"></td>'+
          '<td><b>'+esc(x.n)+'</b>　<span style="font-size:7.6pt">'+esc(x.d)+'</span>'+(x.say?'<br><i style="font-size:7.4pt;color:#b71c1c">🎤「'+esc(x.say)+'」</i>':'')+'</td></tr>'}).join('')+
        this.packUp.map(function(x){return '<tr><td style="width:8%"><b>'+esc(x.t)+'</b></td><td class="ck-box"></td><td><b>'+esc(x.n)+'</b>　<span style="font-size:7.6pt">'+esc(x.d)+'</span></td></tr>'}).join('')+
        '</tbody></table></div>'+
      '<div class="print-section"><div class="p-sec-title">③ 開會前 3 分鐘：五條規矩（照讀＋即場練）</div>'+
        '<table class="print-table"><tbody>'+
        this.rules.map(function(r,i){return '<tr><td style="width:6%"><b>'+(i+1)+'</b></td><td style="width:18%"><b>'+r.ic+' '+esc(r.n)+'</b></td>'+
          '<td style="font-size:7.8pt"><i style="color:#b71c1c">🎤「'+esc(r.say)+'」</i><br>'+esc(r.drill)+'</td></tr>'}).join('')+
        '</tbody></table></div>'+
      '<div class="print-two"><div><div class="p-sec-title">④ 幾多人點玩</div>'+
        '<table class="print-table"><tbody>'+this.crowd.map(function(x){
          return '<tr><td style="width:26%"><b>'+esc(x.n)+'</b><br>'+esc(x.g)+'</td><td style="font-size:7.4pt">'+esc(x.r)+'<br>'+esc(x.how)+'</td></tr>'}).join('')+'</tbody></table></div>'+
      '<div><div class="p-sec-title">⑤ 現場救急</div><div class="p-para tiny">'+
        this.fix.map(function(x){return '<b>❓'+esc(x.q)+'</b>→ '+esc(x.a)}).join('<br>')+'</div></div></div>'+
      '<div class="p-foot">旅團：____________　場地：____________　日期：____________　© 2026 Scout System</div>'+
    '</div>';
  }
};
