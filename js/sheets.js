/* 🦗 sheets.js — 「即用紙」：印出嚟就直接剪／摺／塗，紙上唔附說明書 © 2026 Scout System */
/* 原則：呢啲係俾小朋友用嘅教材紙。一張紙只做一件事，印完即用。
   領袖點帶、點備料、點救火 —— 全部喺「領袖套包」嗰疊，唔會混喺呢度。
   尺寸用真毫米：viewBox 210×297 = A4，打印時揀「實際大小／100%」就係實物尺寸。
   版面邊界：標題帶 y 0–12・內容 y 16–282・頁脚 y 286–297。 */
var Sheets={
  /* ---------- 每張紙嘅外殼（標題同頁脚都喺 SVG 入面，所以打印啱啱好一版） ---------- */
  page:function(o){
    var tag=o.tag||'小童軍集會即用紙';
    var head='<text x="8" y="8" font-size="4.6" fill="#e65100" font-weight="700">'+(o.ic||'✂️')+' '+esc(o.n)+'</text>'+
      (o.tip?'<text x="202" y="8" font-size="3.6" fill="#777" text-anchor="end">✂ '+esc(o.tip)+'</text>':'')+
      '<path d="M8 11H202" stroke="#e65100" stroke-width=".4"/>';
    var foot='<path d="M8 287H202" stroke="#bbb" stroke-width=".3"/>'+
      '<text x="8" y="292" font-size="3.2" fill="#888">'+(o.name===false?'':esc('姓名：________________　'))+'日期：____________　'+esc(tag)+'　© 2026 Scout System</text>';
    return '<div class="a4-sheet ready-sheet">'+
      '<div class="rs-top"><span class="rs-ic">'+(o.ic||'✂️')+'</span><b>'+esc(o.n)+'</b>'+(o.tip?'<span class="rs-tip">✂ '+esc(o.tip)+'</span>':'')+'</div>'+
      '<svg class="rs-art" viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(o.n)+'">'+head+(o.art||'')+foot+'</svg>'+
    '</div>';
  },
  /* 常用筆畫 */
  cut:'stroke="#333" stroke-width=".5" fill="none"',
  fold:'stroke="#777" stroke-width=".4" stroke-dasharray="4 3" fill="none"',
  stop:'stroke="#d32f2f" stroke-width="1.1" fill="none"',
  guide:'stroke="#bbb" stroke-width=".35" stroke-dasharray="1.6 2.4" fill="none"',
  t:function(x,y,s,size,anchor){return '<text x="'+x+'" y="'+y+'" font-size="'+(size||4)+'" fill="#666" text-anchor="'+(anchor||'middle')+'">'+esc(s)+'</text>'},
  sc:function(x,y){return '<text x="'+x+'" y="'+y+'" font-size="7">✂</text>'},
  cutFill:function(c){return 'stroke="#333" stroke-width=".5" fill="'+c+'"'},
  no:function(x,y,n){return '<circle cx="'+x+'" cy="'+y+'" r="6" fill="#fff" stroke="#e65100" stroke-width=".6"/><text x="'+x+'" y="'+(y+2.6)+'" font-size="7" fill="#e65100" text-anchor="middle">'+n+'</text>'},

  /* ═══════════ 手工即用紙（15 樣，全部有） ═══════════ */
  craft:{
    lantern:{n:'紙燈籠・剪線紙',tip:'沿摺線對摺 → 由摺線剪上紅線停',art:function(){
      var g='',x;
      for(x=22;x<=188;x+=18)g+='<path d="M'+x+' 150V40" '+Sheets.guide+'/>';
      return '<path d="M12 150H198" '+Sheets.fold+'/>'+Sheets.t(105,145,'摺 線',4.6)+
        '<path d="M12 38H198" '+Sheets.stop+'/>'+Sheets.t(105,33,'剪 到 呢 度 停',4.6)+
        g+Sheets.sc(6,154)+
        '<rect x="20" y="196" width="170" height="30" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(105,214,'手 挽（剪 落 嚟）',4.4)+
        Sheets.t(105,248,'燈身貼好後，手挽兩端貼喺燈口冇剪開嗰邊',3.8)+
        Sheets.t(105,270,'用 A4 色紙印・印完對摺先剪',3.6);
    }},
    nametag:{n:'名牌・寫名掛胸前',tip:'沿虛線剪開・領袖打孔穿繩',art:function(){
      var out='',i,j,x,y;
      for(i=0;i<2;i++)for(j=0;j<2;j++){
        x=12+i*95;y=16+j*134;
        out+='<rect x="'+x+'" y="'+y+'" width="86" height="122" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
          '<circle cx="'+(x+14)+'" cy="'+(y+10)+'" r="3" '+Sheets.guide+'/>'+
          '<circle cx="'+(x+72)+'" cy="'+(y+10)+'" r="3" '+Sheets.guide+'/>'+
          '<path d="M'+(x+8)+' '+(y+36)+'h70M'+(x+8)+' '+(y+52)+'h70" '+Sheets.guide+'/>'+
          Sheets.t(x+43,y+30,'名 字（寫 大 啲）',4)+
          '<rect x="'+(x+12)+'" y="'+(y+60)+'" width="62" height="50" '+Sheets.guide+'/>'+
          Sheets.t(x+43,y+88,'畫 一 樣 我 鍾 意',4);
      }
      return out+Sheets.t(105,278,'兩 個 圓 圈 由 領 袖 打 孔 穿 繩',3.8);
    }},
    portrait:{n:'自畫像・跟線畫',tip:'跟住灰線畫就有一張面',art:function(){
      var out='',i,j,cx,cy;
      for(i=0;i<2;i++)for(j=0;j<2;j++){
        cx=55+i*100;cy=74+j*128;
        out+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="29" ry="36" '+Sheets.guide+'/>'+
          '<path d="M'+(cx-29)+' '+(cy+2)+'h58" '+Sheets.guide+'/>'+
          '<path d="M'+cx+' '+(cy-6)+'v20" '+Sheets.guide+'/>'+
          '<path d="M'+(cx-12)+' '+(cy+21)+'h24" '+Sheets.guide+'/>'+
          '<path d="M'+(cx-22)+' '+(cy+34)+'l-12 18M'+(cx+22)+' '+(cy+34)+'l12 18" '+Sheets.guide+'/>'+
          '<path d="M'+(cx-16)+' '+(cy-26)+'q16-10 32 0" '+Sheets.guide+'/>'+
          '<path d="M'+(cx-33)+' '+(cy+86)+'h66" '+Sheets.guide+'/>'+
          Sheets.t(cx,cy+98,'名 字',3.6);
      }
      return out+Sheets.t(105,278,'畫 完 貼 牆 ， 每 人 講 一 句 「 我 係 ×× 」',3.8);
    }},
    card:{n:'心意卡・封面同入面',tip:'沿摺線對摺就係一張卡',art:function(){
      return '<path d="M105 16v262" '+Sheets.fold+'/>'+Sheets.t(105,284,'摺 線',4)+
        '<rect x="118" y="24" width="80" height="176" '+Sheets.cut+'/>'+
        Sheets.t(158,38,'封 面',4.6)+
        '<path d="M126 172h64" '+Sheets.guide+'/>'+Sheets.t(158,168,'致：____________',4)+
        '<rect x="12" y="24" width="80" height="84" '+Sheets.cut+'/>'+
        Sheets.t(52,38,'寫 一 句 祝 福',4)+
        '<path d="M22 54h60M22 68h60M22 82h44" '+Sheets.guide+'/>'+
        '<rect x="12" y="116" width="80" height="84" '+Sheets.cut+'/>'+
        Sheets.t(52,130,'畫 一 樣 嘢 送 佢',4)+
        Sheets.t(105,240,'對 摺 後 用 匙 背 刮 實 摺 線',3.8);
    }},
    popup:{n:'彈出卡・剪口紙＋花',tip:'沿摺線對摺・領袖剪兩條黑線',art:function(){
      return '<path d="M70 16v262" '+Sheets.fold+'/>'+Sheets.t(70,284,'摺 線',4)+
        '<path d="M70 118v40M70 168v40" stroke="#111" stroke-width="2.2"/>'+
        Sheets.t(124,112,'← 兩 條 黑 線 由 摺 線 剪 入 去',3.6)+
        Sheets.t(96,224,'剪 完 由 背 面 頂 出 梯 級',3.6)+
        '<circle cx="150" cy="70" r="18" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        '<circle cx="128" cy="90" r="15" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        '<circle cx="172" cy="90" r="15" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        '<circle cx="150" cy="90" r="9" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(150,44,'剪 一 朵 花',4)+
        '<path d="M150 106v18" '+Sheets.cut+'/>'+
        '<rect x="138" y="124" width="24" height="11" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(150,146,'呢 條 係 貼 位（摺 90°）',3.6)+
        '<rect x="100" y="196" width="92" height="56" '+Sheets.cut+'/>'+
        Sheets.t(146,228,'寫 一 句 祝 福',4);
    }},
    fu:{n:'揮春・「福」字描紅紙',tip:'跟住灰線描・四角加金點',art:function(){
      return '<rect x="15" y="22" width="180" height="180" '+Sheets.cutFill('#fff8f8')+'/>'+
        '<path d="M105 22v180M15 112h180M15 22l180 180M195 22L15 202" '+Sheets.guide+'/>'+
        '<text x="105" y="150" text-anchor="middle" font-size="118" font-weight="700" fill="none" stroke="#c9a0a0" stroke-width="1">福</text>'+
        '<circle cx="27" cy="34" r="5" '+Sheets.guide+'/><circle cx="183" cy="34" r="5" '+Sheets.guide+'/>'+
        '<circle cx="27" cy="190" r="5" '+Sheets.guide+'/><circle cx="183" cy="190" r="5" '+Sheets.guide+'/>'+
        Sheets.t(105,222,'貼 嘅 時 候 倒 轉 ＝ 福 到',4.4)+
        Sheets.t(105,248,'名 字 ：________________',4)+
        Sheets.t(105,270,'印 喺 紅 卡 紙 最 似 揮 春',3.6);
    }},
    egg:{n:'蛋仔・剪出嚟塗色',tip:'沿虛線剪・跟住點點畫花紋',art:function(){
      var out='',i,x;
      for(i=0;i<2;i++){
        x=55+i*100;
        out+='<path d="M'+x+' 26c24 0 37 30 37 58s-16 48-37 48-37-20-37-48S'+(x-24)+' 26 '+x+' 26z" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
          '<path d="M'+(x-33)+' 66h66M'+(x-35)+' 96h70" '+Sheets.guide+'/>'+
          '<circle cx="'+(x-16)+'" cy="48" r="4" '+Sheets.guide+'/><circle cx="'+x+'" cy="42" r="4" '+Sheets.guide+'/><circle cx="'+(x+16)+'" cy="48" r="4" '+Sheets.guide+'/>'+
          '<circle cx="'+(x-16)+'" cy="118" r="4" '+Sheets.guide+'/><circle cx="'+x+'" cy="124" r="4" '+Sheets.guide+'/><circle cx="'+(x+16)+'" cy="118" r="4" '+Sheets.guide+'/>'+
          '<circle cx="'+(x-8)+'" cy="82" r="3" fill="none" stroke="#999" stroke-width=".4"/>'+
          '<circle cx="'+(x+8)+'" cy="82" r="3" fill="none" stroke="#999" stroke-width=".4"/>'+
          '<path d="M'+(x-7)+' 92q7 6 14 0" stroke="#999" stroke-width=".4" fill="none"/>'+
          Sheets.t(x,148,'我 隻 蛋 叫 ：__________',3.8);
      }
      return out+'<path d="M12 168h186" '+Sheets.guide+'/>'+
        Sheets.t(105,186,'多 剪 兩 隻 出 嚟 玩 尋 蛋',4)+
        '<path d="M45 204c0-15 11-24 22-24s22 9 22 24-10 22-22 22-22-7-22-22z" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        '<path d="M121 204c0-15 11-24 22-24s22 9 22 24-10 22-22 22-22-7-22-22z" '+Sheets.cut+' stroke-dasharray="4 3"/>';
    }},
    junk:{n:'廢物變寶・名牌＋零件',tip:'剪出名牌貼喺作品側面',art:function(){
      var out='',i,j,x,y;
      for(i=0;i<2;i++)for(j=0;j<2;j++){
        x=12+i*95;y=16+j*70;
        out+='<rect x="'+x+'" y="'+y+'" width="86" height="58" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
          Sheets.t(x+43,y+13,'我 嘅 作 品 叫',3.8)+
          '<path d="M'+(x+10)+' '+(y+24)+'h66" '+Sheets.guide+'/>'+
          Sheets.t(x+43,y+36,'佢 可 以 用 嚟',3.8)+
          '<path d="M'+(x+10)+' '+(y+46)+'h66" '+Sheets.guide+'/>'+
          Sheets.t(x+43,y+55,'作 者 ：________',3.4);
      }
      return out+
        '<circle cx="40" cy="182" r="14" '+Sheets.cut+' stroke-dasharray="4 3"/><circle cx="40" cy="182" r="5" '+Sheets.cut+'/>'+
        '<circle cx="80" cy="182" r="14" '+Sheets.cut+' stroke-dasharray="4 3"/><circle cx="80" cy="182" r="5" '+Sheets.cut+'/>'+
        '<path d="M110 176q22 16 44 0" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        '<path d="M170 168v14" '+Sheets.cut+' stroke-dasharray="4 3"/><circle cx="170" cy="162" r="7" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(105,210,'剪 落 嚟 貼 做 眼 ・ 嘴 ・ 天 線',3.8)+
        '<rect x="30" y="224" width="150" height="28" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(105,241,'腰 帶 （ 纏 一 圈 黐 實 ）',3.8)+
        Sheets.t(105,270,'先 要 企 得 住 ， 先 至 加 兩 隻 眼',3.6);
    }},
    frame:{n:'紙相框・剪出嚟黐',tip:'外面剪實線・中間挖空',art:function(){
      return '<rect x="40" y="22" width="130" height="130" '+Sheets.cut+'/>'+
        '<rect x="65" y="47" width="80" height="80" '+Sheets.cutFill('#f4f4f4')+'/>'+
        Sheets.sc(96,90)+Sheets.t(105,96,'挖 空',4)+
        Sheets.t(105,166,'相 貼 喺 背 面（ 只 貼 頂 邊 ， 以 後 先 換 到 ）',3.8)+
        '<rect x="40" y="182" width="130" height="22" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(105,196,'腳 （ 斜 斜 黐 喺 背 面 底 位 ）',3.8)+
        '<rect x="40" y="216" width="130" height="42" '+Sheets.guide+'/>'+
        Sheets.t(105,240,'呢 張 相 係 我 同 ________ 影 嘅',3.8);
    }},
    plane:{n:'紙飛機・摺線紙',tip:'跟住 1→2→3 摺',art:function(){
      return '<path d="M105 16v258" '+Sheets.fold+'/>'+
        Sheets.no(105,26,1)+Sheets.t(105,42,'對 摺 後 攤 開',3.6)+
        '<path d="M20 16L105 100M190 16L105 100" '+Sheets.cut+'/>'+
        Sheets.no(26,22,2)+Sheets.t(105,114,'兩 個 角 摺 入 中 線',3.6)+
        '<path d="M20 100L105 186M190 100L105 186" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.no(26,106,3)+Sheets.t(105,200,'斜 邊 再 摺 入 中 線 一 次',3.6)+
        '<path d="M20 214h80M190 214h-80" '+Sheets.cut+'/>'+
        Sheets.t(105,228,'由 底 向 上 摺 出 機 翼（ 兩 邊 一 樣 闊 ）',3.6)+
        '<path d="M60 246h90" '+Sheets.stop+'/>'+
        Sheets.t(105,262,'機 頭 貼 一 段 膠 紙（ 耐 撞 ）',3.6);
    }},
    boat:{n:'紙船・摺線紙',tip:'跟住 1→2→3 摺',art:function(){
      return '<path d="M12 78h186" '+Sheets.cut+'/>'+
        Sheets.no(20,70,1)+Sheets.t(105,94,'上 邊 落 摺 到 呢 度',3.8)+
        '<path d="M105 78L60 128M105 78l45 50" '+Sheets.cut+'/>'+
        Sheets.no(112,86,2)+Sheets.t(105,146,'兩 個 角 摺 入 中 間',3.8)+
        '<path d="M60 158h90" '+Sheets.cut+'/>'+
        '<path d="M12 158h48M150 158h48" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.no(66,150,3)+Sheets.t(105,176,'紙 帶 向 上 摺（ 前 後 各 一 次 ）',3.8)+
        '<path d="M105 192l32 32H73z" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(105,244,'撐 開 成 方 形 ， 慢 慢 拉 兩 邊 出 船',3.8)+
        Sheets.t(105,268,'用 影 畫 紙 印 ， 落 水 先 唔 會 沉',3.6);
    }},
    mask:{n:'面具・眼窿位紙',tip:'領袖剪眼窿・兩邊穿繩',art:function(){
      return '<path d="M52 62q-16-40 6-46 20-4 20 40z" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        '<path d="M158 62q16-40-6-46-20-4-20 40z" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        Sheets.t(105,32,'耳 朵 （ 剪 落 嚟 黐 喺 碟 邊 ）',3.8)+
        '<circle cx="105" cy="150" r="80" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
        '<circle cx="79" cy="130" r="13" '+Sheets.cutFill('#f4f4f4')+'/><circle cx="131" cy="130" r="13" '+Sheets.cutFill('#f4f4f4')+'/>'+
        Sheets.sc(73,134)+Sheets.sc(125,134)+
        Sheets.t(105,112,'眼 窿 （ 由 領 袖 剪 ）',3.8)+
        '<circle cx="27" cy="150" r="4" '+Sheets.cut+'/><circle cx="183" cy="150" r="4" '+Sheets.cut+'/>'+
        Sheets.t(105,166,'鼻',3.4)+
        '<path d="M80 178q25 16 50 0" '+Sheets.guide+'/>'+
        Sheets.t(105,248,'戴 住 行 兩 步 ， 睇 到 嘢 先 算 完 成',4)+
        Sheets.t(105,270,'呢 張 紙 貼 喺 紙 碟 面 先 剪',3.6);
    }},
    mural:{n:'集體畫・每人一格',tip:'一格一個人・聽到停手就換格',art:function(){
      var out='',i,j,x,y;
      for(i=0;i<4;i++)for(j=0;j<2;j++){
        x=12+i*47;y=16+j*126;
        out+='<rect x="'+x+'" y="'+y+'" width="44" height="108" '+Sheets.cut+'/>'+
          '<path d="M'+(x+6)+' '+(y+100)+'h32" '+Sheets.guide+'/>'+
          Sheets.t(x+22,y+96,'名',3.4);
      }
      return out+Sheets.t(105,272,'畫 完 由 領 袖 用 黑 筆 畫 一 條 路 連 起',4);
    }},
    promise:{n:'日行一善・7 日打卡',tip:'做咗就貼一粒星',art:function(){
      var out='',j,y,i,x;
      for(j=0;j<2;j++){
        y=16+j*134;
        out+='<rect x="12" y="'+y+'" width="186" height="122" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
          Sheets.t(105,y+13,'我 承 諾 每 日 做 一 件 小 善 事',4.4)+
          '<path d="M26 '+(y+24)+'h158" '+Sheets.guide+'/>'+
          Sheets.t(105,y+22,'我 嘅 善 行 ：____________________　名 ：__________',3.6);
        for(i=0;i<7;i++){
          x=22+(i%4)*46;var yy=y+34+Math.floor(i/4)*38;
          out+='<rect x="'+x+'" y="'+yy+'" width="34" height="30" '+Sheets.cut+'/>'+
            Sheets.t(x+17,yy+11,'第 '+(i+1)+' 日',3.2)+
            '<path d="M'+(x+17)+' '+(yy+20)+'l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z" fill="none" stroke="#bbb" stroke-width=".4"/>';
        }
      }
      return out+Sheets.t(105,278,'貼 喺 雪 櫃 當 眼 位 ， 7 粒 星 換 一 個 印 章',3.8);
    }},
    decor:{n:'紙鏈・剪紙條',tip:'每條頭尾黐 2 厘米',art:function(){
      var out='',i,y;
      for(i=0;i<8;i++){
        y=18+i*27;
        out+='<rect x="14" y="'+y+'" width="182" height="20" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
          '<path d="M176 '+y+'v20" '+Sheets.fold+'/>';
      }
      return out+Sheets.t(105,248,'虛 線 嗰 格 ＝ 黐 埋 去 下 一 條 嘅 位（ 2 厘 米 ）',4)+
        Sheets.t(105,268,'一 條 一 色 ， 砌 到 牆 角 就 停',4);
    }},
    any:{n:'今日我整咗……',tip:'畫低你今日整嘅嘢',art:function(){
      return '<rect x="16" y="18" width="178" height="28" '+Sheets.cut+'/>'+
        Sheets.t(105,36,'今 日 我 整 咗 ：____________________',4.6)+
        '<rect x="16" y="52" width="178" height="168" '+Sheets.cut+'/>'+
        Sheets.t(105,140,'畫 低 佢',5)+
        '<rect x="16" y="228" width="178" height="32" '+Sheets.cut+'/>'+
        Sheets.t(105,248,'佢 最 叻 嘅 一 個 位 ：____________________',4);
    }}
  },

  /* ═══════════ 工作紙（按環節自動配） ═══════════ */
  ws:{
    placemat:{n:'彩虹餐盤・貼或畫食物',re:/彩虹|飲食|食物|營養/,art:function(){
      var c=[['🍎','#ffcdd2',105,64],['🥕','#ffe0b2',172,122],['🥦','#c8e6c9',148,196],['🥛','#eceff1',62,196],['🍇','#e1bee7',38,122]];
      return '<circle cx="105" cy="140" r="86" stroke="#333" stroke-width=".6" fill="#fff"/>'+
        c.map(function(p){return '<circle cx="'+p[2]+'" cy="'+p[3]+'" r="29" fill="'+p[1]+'" stroke="#999" stroke-width=".4"/>'+
          '<text x="'+p[2]+'" y="'+(p[3]+6)+'" font-size="18" text-anchor="middle">'+p[0]+'</text>'}).join('')+
        '<circle cx="105" cy="140" r="25" fill="#fff" stroke="#333" stroke-width=".5"/>'+
        Sheets.t(105,136,'我 食 咗',4)+Sheets.t(105,148,'____ 種 顏 色',4)+
        Sheets.t(105,252,'喺 每 個 圈 畫 一 樣 嗰 色 嘅 食 物',4.4);
    }},
    emotion:{n:'情緒面面觀・今日心情',re:/情緒|心情/,art:function(){
      var e=[['😊','開 心'],['😡','生 氣'],['😢','傷 心'],['😨','害 怕'],['😲','驚 訝'],['😌','平 靜']];
      return e.map(function(x,i){
        var cx=40+(i%3)*65,cy=58+Math.floor(i/3)*82;
        return '<circle cx="'+cx+'" cy="'+cy+'" r="25" stroke="#333" stroke-width=".5" fill="#fffdf5"/>'+
          '<text x="'+cx+'" y="'+(cy+9)+'" font-size="23" text-anchor="middle">'+x[0]+'</text>'+
          Sheets.t(cx,cy+38,x[1],4.2);
      }).join('')+
        '<path d="M20 232h170" '+Sheets.guide+'/>'+
        Sheets.t(105,228,'今 日 我 嘅 心 情 係 ：____________　因 為 ：________________',4)+
        Sheets.t(105,258,'唔 開 心 嗰 陣 我 可 以 ：____________________',4);
    }},
    sfh:{n:'身體紅黃綠・舉卡',re:/身體地圖|保護自己|Safe|好觸摸|身體界線/,art:function(){
      var c=[['🟥','紅 色 ： 唔 可 以 掂','泳 衣 蓋 住 嘅 位'],['🟨','黃 色 ： 先 問 准','面 頰 ・ 頭 髮 ・ 腰'],['🟩','綠 色 ： 禮 貌 得','手 ・ 膊 頭 ・ 擊 掌']];
      return c.map(function(x,i){
        var y=18+i*84;
        return '<rect x="16" y="'+y+'" width="178" height="70" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
          '<text x="42" y="'+(y+45)+'" font-size="28" text-anchor="middle">'+x[0]+'</text>'+
          Sheets.t(122,y+30,x[1],5)+Sheets.t(122,y+52,x[2],4);
      }).join('')+
        Sheets.t(105,278,'遇 到 唔 舒 服 ： 大 聲 講 「 唔 好 」 ＋ 話 俾 信 任 嘅 大 人 知',4.2);
    }},
    task:{n:'日行一善・任務抽籤',re:/任務抽籤|家務|日行一善/,art:function(){
      var t=['👟 排 好 全 家 鞋','🍽️ 飯 後 收 碗','🛏️ 起 身 摺 被','🧹 抹 枱','🥛 幫 家 人 倒 水','🧸 收 拾 玩 具','🎒 執 書 包','🌱 澆 花','🫂 安 慰 朋 友','👂 專 心 聽 人 講','🧣 整 理 旅 巾','❤️ 講 一 句 多 謝'];
      return t.map(function(x,i){
        var cx=12+(i%3)*63,cy=16+Math.floor(i/3)*66;
        return '<rect x="'+cx+'" y="'+cy+'" width="60" height="62" '+Sheets.cut+' stroke-dasharray="4 3"/>'+
          Sheets.t(cx+30,cy+34,x,4);
      }).join('')+Sheets.t(105,278,'剪 開 摺 埋 ， 輪 流 抽 一 張 返 屋 企 做',3.8);
    }},
    passport:{n:'小草蜢護照・七大範疇',re:/護照|小草蜢|七大範疇/,art:function(){
      var d=['🌳 我 愛 戶 外','🏃 運 動 與 健 康','🤝 認 識 自 己 ・ 幫 助 他 人','🔬 科 學 與 大 自 然','🎨 我 愛 創 新','🏇 國 家 與 社 區','🏕️ 童 軍 大 家 庭'];
      return '<rect x="12" y="16" width="186" height="234" '+Sheets.cut+'/>'+
        '<path d="M105 16v234" '+Sheets.fold+'/>'+
        Sheets.t(105,30,'小 草 蜢 歷 險 護 照',5)+
        d.map(function(x,i){
          var y=46+i*27;
          return Sheets.t(66,y,x,4.2)+
            '<rect x="126" y="'+(y-9)+'" width="20" height="16" '+Sheets.cut+'/>'+
            '<rect x="152" y="'+(y-9)+'" width="20" height="16" '+Sheets.cut+'/>';
        }).join('')+
        Sheets.t(105,244,'名 字 ：________________',4)+
        Sheets.t(105,266,'沿 中 間 摺 埋 ， 就 係 一 本 護 照',3.8);
    }}}
  ,

  /* ═══════════ 由環節計出要印邊啲紙 ═══════════ */
  craftFor:function(st){
    if(typeof Craft==='undefined'||!Craft.lib)return null;
    var c=Craft.match(st);
    if(c&&Sheets.craft[c.k])return c.k;
    return (Craft.isCraft&&Craft.isCraft(st))?'any':null;
  },
  wsFor:function(st){
    var hay=(st.t||'')+' '+(st.n||'')+' '+(st.how||'');
    for(var k in Sheets.ws){if(Sheets.ws[k].re&&Sheets.ws[k].re.test(hay))return k}
    return null;
  },
  /* 一場集會要印嘅小朋友紙（去重、跟環節次序） */
  forMeet:function(m){
    var out=[],seen={};
    ((m&&m.stages)||[]).forEach(function(st){
      var ck=Sheets.craftFor(st);
      if(ck&&!seen['c'+ck]){seen['c'+ck]=1;out.push({kind:'craft',k:ck,n:Sheets.craft[ck].n,ic:'✂️',stage:st.n})}
      var wk=Sheets.wsFor(st);
      if(wk&&!seen['w'+wk]){seen['w'+wk]=1;out.push({kind:'ws',k:wk,n:Sheets.ws[wk].n,ic:'📝',stage:st.n})}
    });
    return out;
  },
  /* 場地貼紙（九宮格／角牌）：由遊戲 metadata 同場地層一齊計 */
  floorFor:function(m){
    var need={},out=[];
    ((m&&m.stages)||[]).forEach(function(st){
      var pm=(typeof Lead!=='undefined'&&Lead.playMeta&&st.screen)?Lead.playMeta[st.screen]:null;
      if(pm&&pm.print)need[pm.print]=1;
      if(typeof Venue!=='undefined'&&Venue.needFor){var v=Venue.needFor(st);if(v&&v.print)need[v.print]=1}
    });
    if(need['floor-grid'])out.push({k:'floor-grid',n:'九宮格地貼（1–9 號）',ic:'🦗'});
    if(need['corner-signs'])out.push({k:'corner-signs',n:'四角角牌・分邊牌・靶',ic:'🅰️'});
    return out;
  },
  one:function(kind,k){
    if(kind==='craft'){var c=Sheets.craft[k]||Sheets.craft.any;return Sheets.page({ic:'✂️',n:c.n,tip:c.tip,art:c.art()})}
    if(kind==='ws'){var w=Sheets.ws[k];return w?Sheets.page({ic:'📝',n:w.n,art:w.art()}):''}
    if(kind==='floor'&&typeof PrintKit!=='undefined'){
      if(k==='floor-grid')return PrintKit.renderFloorGrid(true);
      return PrintKit.renderCornerSigns();
    }
    return '';
  },
  pagesOf:function(m,copies){
    var n=Math.max(1,Math.min(40,+copies||1));
    return Sheets.forMeet(m).length*n+Sheets.floorFor(m).length;
  },
  listHtml:function(){
    return '<div class="ready-grid">'+Object.keys(Sheets.craft).map(function(k){
      var c=Sheets.craft[k];
      return '<button class="ready-cell" onclick="PrintKit.openModal(\'craft-ready\',\''+k+'\')">'+
        '<span class="rc-ic">✂️</span><b>'+esc(c.n)+'</b><small>'+esc(c.tip||'印完即用')+'</small></button>';
    }).join('')+
    Object.keys(Sheets.ws).map(function(k){
      var w=Sheets.ws[k];
      return '<button class="ready-cell" onclick="PrintKit.openModal(\'craft-ready\',\'ws:'+k+'\')">'+
        '<span class="rc-ic">📝</span><b>'+esc(w.n)+'</b><small>按環節自動配</small></button>';
    }).join('')+'</div>';
  },
  printSheet:function(k){
    if(!k)return Sheets.page({ic:'✂️',n:'手工即用紙・總覽',name:false,tag:'揀一樣先印',art:function(){
      var ks=Object.keys(Sheets.craft);
      return ks.map(function(x,i){
        var cx=14+(i%2)*95,cy=18+Math.floor(i/2)*33;
        return '<rect x="'+cx+'" y="'+cy+'" width="88" height="28" '+Sheets.cut+'/>'+
          Sheets.t(cx+44,cy+17,Sheets.craft[x].n,4.4);
      }).join('')+Sheets.t(105,272,'呢 疊 係 小 朋 友 用 嘅 紙 ・ 領 袖 說 明 喺 另 一 疊',4.4);
    }});
    if(String(k).indexOf('ws:')===0)return Sheets.one('ws',String(k).slice(3));
    return Sheets.one('craft',k);
  }
};
