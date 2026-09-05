/* 🦗 img.js — 真圖優先・SVG 後備（圖缺／離線都唔會開天窗）© 2026 Scout System
   用法：Img.fig('chute-steps','alt','caption') → <figure> 包 <img>，
   載入失敗自動換返 Lead.parachuteSvg 等後備圖解。 */
var Img={
  reg:{
    'chute-top'  :{f:'img/chute-top.jpg',  fb:'chute'},
    'chute-steps':{f:'img/chute-steps.jpg',fb:'chute'}
  },
  fig:function(key,alt,caption){
    var e=this.reg[key];if(!e)return '';
    return '<figure class="fig">'+
      '<img loading="lazy" src="'+e.f+'" alt="'+(typeof esc==='function'?esc(alt||''):alt||'')+'" '+
      'onerror="Img.swap(this,\''+key+'\')">'+
      (caption?'<figcaption>'+esc(caption)+'</figcaption>':'')+
      '</figure>';
  },
  /* 圖載唔到（離線／檔案缺）→ 換返舊 SVG 圖解 */
  swap:function(el,key){
    var e=this.reg[key]||{};
    var html='';
    if(e.fb==='chute'&&typeof Lead!=='undefined'&&Lead.parachuteSvg)html=Lead.parachuteSvg('open');
    if(!html)html='<div class="mute" style="padding:10px;text-align:center">圖未載入（離線時改用圖解）</div>';
    var w=document.createElement('div');w.innerHTML=html;
    var node=w.firstChild||w;
    if(el&&el.parentNode)el.parentNode.replaceChild(node,el);
  }
};
