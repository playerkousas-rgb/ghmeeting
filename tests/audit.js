/* 🦗 audit.js — 全站排查：150 個環節逐個問四題
   ① 有冇「小朋友要撳螢幕」嘅玩法  ② 有冇「假定領袖識」但冇步驟
   ③ 物資有冇份量/後備  ④ 需唔需要設場（貼地/分區）而冇教
   跑法：node tests/audit.js */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const s={console,document:{getElementById:()=>null,querySelectorAll:()=>[],createElement:()=>({classList:{add(){}},style:{}}),body:{appendChild(){}},documentElement:{classList:{add(){}}},addEventListener(){}},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}},addEventListener(){},location:{hash:''},
  Math,Date,JSON,Object,Array,String,Number,isNaN,parseInt,parseFloat,setTimeout:()=>0,clearTimeout(){},
  setInterval:()=>0,clearInterval(){},navigator:{},
  AudioContext:function(){this.currentTime=0;this.destination={};this.state='running';
    this.createOscillator=()=>({frequency:{value:0},connect(){},start(){},stop(){}});
    this.createGain=()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});
    this.resume=()=>{};}};
s.window=s;const c=vm.createContext(s);
['data.js','guide.js','craft.js','sheets.js','tpls.js','app.js','prepare.js','print.js','pack.js','lead.js','track.js','handbook.js','play.js','kit.js','venue.js']
  .forEach(f=>vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js',f),'utf8'),c,{filename:f}));
const {TPLS,DATA,Kit,Guide,Craft,Venue,Sheets,Pack}=s;

const rows=[];
TPLS.forEach(t=>(t.stages||[]).forEach((st,i)=>rows.push({t:t.id,tn:t.n,i,st})));
(DATA.blocks||[]).forEach((st,i)=>rows.push({t:'block',tn:'環節積木',i,st}));
console.log('環節總數：'+rows.length);

const touchKid=/撳中|快啲撳|點擊彈出|搶按|鬥快撳|點擊正確|點擊身體|點擊不同|點擊各|點擊顏色|點擊表情|點擊藍/;
const needVenue=/九宮格|跳格|地貼|四角|分邊|搶答|投擲線|障礙|循環|接力|分組比賽|快樂傘|圍圈|傳球/;
const assumeSkill=/示範|帶讀|帶唱|帶領全體|即場講|自創動作|設計動作|編排|彈奏|伴奏|摺|剪|貼|釘|打孔/;

const bad={touch:[],noVenue:[],noGuide:[],noMats:[],craftNoCard:[],craftNoKid:[],craftNoCtrl:[],craftNoSheet:[]};
rows.forEach(r=>{
  const st=r.st, txt=(st.n||'')+' '+(st.how||'')+' '+(st.script||'');
  const label=r.t+'#'+r.i+' '+(st.n||'');
  if(touchKid.test(txt))bad.touch.push(label+' → '+txt.match(touchKid)[0]);
  const g=Guide.forStage(st);
  const generic=/領袖先做一次，完成一個小步驟就停低/.test(g.lead);
  if(generic&&assumeSkill.test(txt))bad.noGuide.push(label+' → 用萬用指引但要「'+txt.match(assumeSkill)[0]+'」');
  if(needVenue.test(txt)){
    const nd=(Venue&&Venue.needFor)?Venue.needFor(st):{setup:[],zones:[]};
    if(!nd||!(nd.setup||[]).length)bad.noVenue.push(label+' → 冇場地設置步驟');
  }
  (st.mats||[]).forEach(m=>{
    const k=Kit.norm(m);
    if(!Kit.mats[k]&&!Kit.fuzzy(m))bad.noMats.push(label+' → 物資「'+m+'」冇份量/後備');
  });
  if(Craft.isCraft(st)&&!Craft.match(st))bad.craftNoCard.push(label);
  const cc=Craft.match(st);
  if(cc){
    const kid=(Craft.kid||{})[cc.k];
    if(!kid||!(kid.a45||[]).length||!(kid.a67||[]).length||!kid.adult||!(kid.stop||[]).length)
      bad.craftNoKid.push(label+' → '+cc.k+' 冇 4–7 歲分工');
    if(!(Craft.ctrl||[]).length||!Craft.ctrlHtml)bad.craftNoCtrl.push(label+' → 冇控場層');
  }
  /* ⑤ 手工環節必須有一張「小朋友即用紙」（印完即剪，唔使再睇說明） */
  if(Craft.isCraft(st)){
    const sk=Sheets.craftFor(st);
    if(!sk||!Sheets.craft[sk])bad.craftNoSheet.push(label+' → 冇即用紙');
    else{
      const html=Sheets.one('craft',sk);
      if(!/rs-art/.test(html)||html.length<800)bad.craftNoSheet.push(label+' → 即用紙渲染唔到');
      if(/自學卡|逐步拆解|後備版|物資・每人幾多/.test(html))bad.craftNoSheet.push(label+' → 即用紙混入咗說明書');
    }
  }
});

Object.keys(bad).forEach(k=>{
  console.log('\n=== '+k+'：'+bad[k].length+' 項 ===');
  bad[k].slice(0,12).forEach(x=>console.log('  ・'+x));
  if(bad[k].length>12)console.log('  …其餘 '+(bad[k].length-12)+' 項');
});
/* 套包層：每場範本都要出到兩疊紙 */
if(Pack){
  let noLead=0,noKid=0,mix=0;
  TPLS.forEach(t=>{
    const L=Pack.sheets('lead',t,1),K=Pack.sheets('kid',t,1);
    if(L.length<3000)noLead++;
    if(/pack-run|執袋單/.test(K))mix++;
    const hasCraft=(t.stages||[]).some(x=>Craft.isCraft(x));
    if(hasCraft&&K.length<500)noKid++;
  });
  console.log('\n📦 套包檢查：'+TPLS.length+' 場範本｜領袖套包太短：'+noLead+'｜有手工但冇小朋友紙：'+noKid+'｜兩疊紙混雜：'+mix);
  console.log('小朋友紙款式：'+Sheets.forMeet(TPLS.filter(t=>t.id==='t03')[0]).map(x=>x.k).join('、'));
}
console.log('\nVenue 模組：'+(Venue?('已載入・'+Object.keys(Venue).length+' 個成員'):'❌ 未有'));
if(Venue){
  console.log('場地佈置：'+Venue.layouts.length+' 種｜分區：'+Venue.zones.length+' 個｜時間表：'+Venue.timeline.length+' 步｜規矩：'+Venue.rules.length+' 條');
  console.log('needFor(捉草蜢)：'+JSON.stringify(Venue.needFor({n:'草蜢跳格',how:'九宮格'})));
  console.log('needFor(快樂傘)：'+JSON.stringify(Venue.needFor({n:'快樂傘遊戲',how:'揚傘'})));
  console.log('needFor(靜息)：'+JSON.stringify(Venue.needFor({n:'靜息呼吸',how:'呼吸'})));
}
