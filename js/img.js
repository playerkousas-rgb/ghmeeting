/* 🦗 img.js — 真圖優先・自動後備（圖缺／離線都唔會開天窗）© 2026 Scout System
   用法：
     Img.fig(key, alt, caption, fbHtml) → <figure><img src="img/key.jpg">
       載入失敗自動換返 fbHtml（傳入嘅 SVG／圖解）或內置後備。
     Img.vid(kw) → 「▶ 睇示範片（上網）」YouTube 搜尋掣（條連結永遠啱題、唔會死鏈）。 */
var Img={
  /* 內置後備：chute 用回 Lead.parachuteSvg */
  reg:{'chute-top':{fb:'chute'},'chute-steps':{fb:'chute'}},
  /* 遊戲 → 「點玩一眼圖」（實體遊戲先至有） */
  games:{catch:'g-grid',quiz:'g-corners',judge:'g-corners',recycle:'g-corners',memory:'g-corners',
         traffic:'g-traffic',roll:'g-ball',leader:'g-leader',rhythm:'g-leader',moon:'g-throw',
         clean:'g-wash',bodycard:'g-body',flags:'g-salute',emotion:'g-faces'},
  gameFig:function(screen){
    var k=this.games[screen];if(!k)return '';
    return this.fig(k,screen,'點玩？睇圖就識帶');
  },
  _fb:{},
  vid:function(kw,label){
    if(!kw)return '';
    return '<a class="btn sm ghost" target="_blank" rel="noopener" '+
      'href="https://www.youtube.com/results?search_query='+encodeURIComponent(kw)+'">'+
      (label||'▶ 睇示範片（上網）')+'</a>';
  },
  fig:function(key,alt,caption,fbHtml){
    if(fbHtml)this._fb[key]=fbHtml;
    var e=typeof esc==='function'?esc:(function(x){return x});
    return '<figure class="fig">'+
      '<img loading="lazy" src="img/'+key+'.jpg" alt="'+e(alt||'')+'" '+
      'onerror="Img.swap(this,\''+key+'\')">'+
      (caption?'<figcaption>'+e(caption)+'</figcaption>':'')+
      '</figure>';
  },
  swap:function(el,key){
    var html='';
    var e=this.reg[key]||{};
    if(e.fb==='chute'&&typeof Lead!=='undefined'&&Lead.parachuteSvg)html=Lead.parachuteSvg('open');
    if(!html)html=this._fb[key]||'';
    if(!html)html='<div class="mute" style="padding:10px;text-align:center">圖未載入（離線時改用圖解）</div>';
    var w=document.createElement('div');w.innerHTML=html;
    var node=w.firstChild||w;
    if(el&&el.parentNode)el.parentNode.replaceChild(node,el);
  }
};
