/* 🦗 ui.js — 全站入口巡一遍：七個分頁・十個手冊分頁・24 份教材・30 場範本兩疊紙・搜尋・臨時集會
   跑法：node tests/ui.js   （載入真實 js/*.js，唔係複製邏輯） */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const mem={};const els=new Map();
function mk(id){const cl=new Set();return {id,innerHTML:'',textContent:'',value:'',style:{},dataset:{},
  classList:{add:c=>cl.add(c),remove:c=>cl.delete(c),contains:c=>cl.has(c),toggle:(c,f)=>{f===undefined?f=!cl.has(c):0;f?cl.add(c):cl.delete(c);return f}},
  querySelector:()=>null,querySelectorAll:()=>[],appendChild(){},remove(){},focus(){},scrollTop:0};}
const s={console,
  document:{getElementById:id=>{if(!els.has(id))els.set(id,mk(id));return els.get(id)},
    querySelectorAll:()=>[],querySelector:()=>null,createElement:t=>mk(t),
    body:{appendChild(){},contains:()=>true},documentElement:{classList:mk('html').classList,requestFullscreen(){}},
    addEventListener(){},fullscreenElement:null},
  localStorage:{getItem:k=>k in mem?mem[k]:null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}},
  addEventListener(){},location:{hash:'#pack'},scrollTo(){},
  Math,Date,JSON,Object,Array,String,Number,isNaN,parseInt,parseFloat,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},
  navigator:{clipboard:null},
  AudioContext:function(){this.currentTime=0;this.destination={};this.state='running';
    this.createOscillator=()=>({frequency:{value:0},type:'sine',connect(){},start(){},stop(){}});
    this.createGain=()=>({gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}});
    this.resume=()=>{};}};
s.window=s;const c=vm.createContext(s);
['data.js','guide.js','craft.js','sheets.js','tpls.js','app.js','prepare.js','print.js','pack.js','lead.js','track.js','handbook.js','play.js','kit.js','venue.js']
  .forEach(f=>vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js',f),'utf8'),c,{filename:f}));
const {App,HB,Play,Prepare,PrintKit,Pack,Kit,TPLS}=s;
App.init();
let fails=[];
['#pack','#plan','#meet','#play','#track','#book','#print'].forEach(h=>{
  s.location.hash=h;
  try{App.route();const out=els.get('view').innerHTML;
    if(!out||out.length<200)fails.push(h+' 內容太短 '+out.length);
    else console.log('view',h,'ok',out.length);
  }catch(e){fails.push(h+' → '+e.message)}
});
// 手冊每個分頁
['core','craft','kit','venue','games','badge','chute','sfh','tips','about'].forEach(t=>{
  try{HB.tab=t;const h=HB.html();if(h.length<500)fails.push('HB.'+t+' 太短')}catch(e){fails.push('HB.'+t+' → '+e.message)}
});
console.log('handbook 10 tabs ok');
// 教材庫每一格 render + openModal
PrintKit.kits.forEach(k=>{
  try{const h=k.render(k.id==='lesson-plans'||k.id==='meet-pack'||k.id==='kid-pack'?'t03':(k.id==='craft-coach'||k.id==='craft-ready'?'lantern':undefined));
    if(!h||h.length<200)fails.push('kit '+k.id+' 太短 '+(h||'').length);
  }catch(e){fails.push('kit '+k.id+' → '+e.message)}
});
console.log('print kits',PrintKit.kits.length,'ok');
// 準備卡每一場 + Pack 每一場兩疊紙
TPLS.forEach(t=>{
  try{Prepare._detailId=t.id;const md=s.document.getElementById('modal');md.innerHTML='';Prepare.detail(t.id);
    const h=md.innerHTML;if(h.length<500)fails.push('Prepare.detail '+t.id+' '+h.length);
    if(!/📦 印齊今場套包/.test(h))fails.push('準備卡冇套包掣 '+t.id);
    const L=Pack.sheets('lead',t,1),K=Pack.sheets('kid',t,1);
    if(L.length<2000)fails.push('Pack lead '+t.id+' '+(L||'').length);
    if(/pack-run/.test(K))fails.push('Pack kid 混入程序表 '+t.id);
  }catch(e){fails.push('tpl '+t.id+' → '+e.message)}
});
console.log('30 templates ok');
// 隨手開會 + 搜尋 + quickHub
try{App.quickHub();console.log('quickHub ok',els.get('modal').innerHTML.length)}catch(e){fails.push('quickHub → '+e.message)}
try{Kit.searchOpen();const r=Kit.searchHtml('套包');if(!/集會套包/.test(r))fails.push('搜尋「套包」搵唔到');
  const r2=Kit.searchHtml('燈籠 即用紙');if(!/即用紙/.test(r2))fails.push('搜尋「即用紙」搵唔到');
  console.log('search ok')}catch(e){fails.push('search → '+e.message)}
// 臨時集會
try{Pack.instant('safety',40);console.log('instant ok ->',Pack.meet().m.n)}catch(e){fails.push('instant → '+e.message)}
try{const kid=Pack.sheets('kid',Pack.meet().m,1);console.log('instant kid sheets len',kid.length)}catch(e){fails.push('instant kid → '+e.message)}
console.log('\n分頁 7・手冊分頁 10・教材 '+PrintKit.kits.length+' 份・範本 '+TPLS.length+' 場（每場兩疊紙）');
if(fails.length){console.log('\n❌ '+fails.length+' 個問題：');fails.forEach(function(f){console.log('  ・'+f)});process.exit(1)}
console.log('🎉 全部 UI 路徑行得');
