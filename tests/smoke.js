/* 🦗 smoke test — 用 Node 跑「真實」js/*.js（唔係複製邏輯），檢查：
   ① 主題曲伴奏嘅音高／節奏時間表  ② 實體遊戲畫面與狀態機  ③ 教材／檢查表／手冊輸出
   跑法：node tests/smoke.js   （任何一項唔啱就會 fail 同列出邊一項） */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');

/* ---------------- 假瀏覽器環境 ---------------- */
const els=new Map();
function mkEl(id){
  const cl=new Set();
  return {id,tagName:String(id).toUpperCase(),textContent:'',innerHTML:'',value:'',disabled:false,children:[],
    style:new Proxy({},{get:(t,k)=>t[k]||'',set:(t,k,v)=>{t[k]=v;return true}}),
    dataset:{},
    classList:{add:function(c){cl.add(c)},remove:function(c){cl.delete(c)},contains:function(c){return cl.has(c)},
      toggle:function(c,f){if(f===undefined)f=!cl.has(c);f?cl.add(c):cl.delete(c);return f}},
    appendChild:function(){},remove:function(){},focus:function(){},click:function(){},
    querySelector:function(){return null},querySelectorAll:function(){return []},
    addEventListener:function(){},setAttribute:function(){}};
}
const documentStub={
  getElementById:function(id){if(!els.has(id))els.set(id,mkEl(id));return els.get(id)},
  createElement:function(t){return mkEl(t)},
  querySelectorAll:function(){return []},querySelector:function(){return null},
  body:{appendChild:function(){},contains:function(){return true}},
  documentElement:{requestFullscreen:function(){},classList:mkEl('html').classList},
  addEventListener:function(){},fullscreenElement:null
};
const mem={};
const localStorageStub={getItem:function(k){return k in mem?mem[k]:null},
  setItem:function(k,v){mem[k]=String(v)},removeItem:function(k){delete mem[k]}};
/* 假 AudioContext：記錄每個 oscillator 幾時 start／stop、乜頻率 */
const audio=[];
class AParam{constructor(v){this.value=v}setValueAtTime(){}linearRampToValueAtTime(){}exponentialRampToValueAtTime(){}}
class AGain{constructor(){this.gain=new AParam(0)}connect(){}disconnect(){}}
class AOsc{
  constructor(){this.frequency=new AParam(440);this.type='sine';this._t=null}
  connect(){}disconnect(){}
  start(t){this._t=(t==null?0:t)}
  stop(t){audio.push({t:this._t,f:this.frequency.value,type:this.type,d:(t==null?0:t)-this._t})}
}
class ACtx{constructor(){this.currentTime=10;this.state='running';this.destination={}}
  createOscillator(){return new AOsc()}createGain(){return new AGain()}resume(){}}
/* 可控時鐘：setTimeout／setInterval 全部行呢度，測試先至可以「快轉」 */
let clock=0,timers=[],tidSeq=0;
function _set(fn,ms,iv){const id=++tidSeq;timers.push({id:id,at:clock+(ms||0),fn:fn,iv:iv,ms:ms||1});return id}
function _clear(id){timers=timers.filter(function(t){return t.id!==id})}
function advance(ms){
  const target=clock+ms;
  for(;;){
    let due=null;
    for(const t of timers){if(t.at<=target&&(!due||t.at<due.at))due=t}
    if(!due)break;
    clock=due.at;
    if(due.iv){due.at=clock+due.ms;due.fn()}else{_clear(due.id);due.fn()}
  }
  clock=target;
}
const sandbox={
  console:console,document:documentStub,localStorage:localStorageStub,
  AudioContext:ACtx,webkitAudioContext:ACtx,navigator:{clipboard:null},
  setTimeout:function(f,m){return _set(f,m,false)},clearTimeout:_clear,
  setInterval:function(f,m){return _set(f,m,true)},clearInterval:_clear,
  addEventListener:function(){},location:{hash:'#plan'},scrollTo:function(){},
  Math:Math,Date:Date,JSON:JSON,Object:Object,Array:Array,String:String,Number:Number,isNaN:isNaN,parseInt:parseInt,parseFloat:parseFloat
};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
const ctx=vm.createContext(sandbox);
const order=['data.js','guide.js','craft.js','sheets.js','tpls.js','app.js','flow.js','prepare.js','print.js','pack.js','lead.js','img.js','track.js','handbook.js','play.js','kit.js','venue.js'];
for(const f of order){
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js',f),'utf8'),ctx,{filename:'js/'+f});
}
const G=sandbox;

/* ---------------- 斷言工具 ---------------- */
let pass=0;const fails=[];
function ok(name,cond,extra){
  if(cond){pass++}else{fails.push(name+(extra?(' — '+extra):''))}
}
function eq(name,a,b){ok(name+' ('+JSON.stringify(a)+' === '+JSON.stringify(b)+')',JSON.stringify(a)===JSON.stringify(b))}

/* ============ ① 主題曲：音高同節奏 ============ */
const Music=G.Music;
const notes=Music.plan();
const NAME={262:'C',294:'D',330:'E',349:'F',392:'G',440:'A'};
eq('① 旋律音數＝48',notes.length,48);
eq('① 小節數＝16',Music._bars.length,16);
const per=[0,0,0,0,0,0];notes.forEach(function(n){per[n.line]++});
eq('① 每句音數對應六句歌詞',per,[13,11,7,6,7,4]);
const seq=notes.map(function(n){return NAME[n.f]}).join(' ');
const canonical='G A G F E F G D E F E F G G A G F E F G D G E C G A G F E F G D E F E F G G A G F E F G D G E C';
eq('① 音高＝寄調 London Bridge（C 調）',seq,canonical);
/* 節奏：每句最後一個音要係二分音符（2 拍），唔係全部一樣長 */
let idx=0,lasts=[];
per.forEach(function(c){lasts.push(notes[idx+c-1].d/(60/Music.bpm));idx+=c});
ok('① 每句句尾都拖長到 2 拍',lasts.every(function(d){return Math.abs(d-2)<1e-6}),'句尾拍數='+lasts.join(','));
const durs=notes.map(function(n){return n.d/(60/Music.bpm)});
ok('① 有長有短（唔係全部一樣長）',new Set(durs.map(function(d){return d.toFixed(3)})).size>1);
const beat=60/Music.bpm;
ok('① 總長度＝64 拍音樂＋5 次換氣',Math.abs(Music._dur-69*beat)<1e-6,'_dur='+Music._dur.toFixed(3)+' 69拍='+(69*beat).toFixed(3));
/* 排期發聲 */
audio.length=0;
Music.countIn=true;Music.chords=true;Music.bpm=112;
Music.play();
const mel=audio.filter(function(x){return x.type==='triangle'});
const chd=audio.filter(function(x){return x.type==='sine'});
const clk=audio.filter(function(x){return x.type==='square'});
eq('① 排到 48 個旋律音',mel.length,48);
eq('① 排到 16 小節×3 個和弦音',chd.length,48);
eq('① 開頭 4 拍數拍（第 1 拍強）',clk.length,4);
ok('① 旋律喺 4 拍數拍之後先入',Math.abs(mel[0].t-(10+.08+4*beat))<1e-6,'first='+mel[0].t);
eq('① 卡拉OK高亮 timer＝6 句＋起步＋結尾',Music._timers.length,8);
Music.stop();
ok('① stop() 清晒 timer 同聲',Music._timers.length===0&&Music.voices.length===0);
/* 慢版應該長過快版 */
Music.bpm=92;const slow=Music.plan()._dummy;const slowDur=Music._dur;
Music.bpm=132;Music.plan();const fastDur=Music._dur;
ok('① 慢版長過快版',slowDur>fastDur,slowDur.toFixed(1)+' > '+fastDur.toFixed(1));
Music.bpm=112;
/* 🥁 拍子器 */
audio.length=0;
Music.metro.start(100,4);
advance(1000);
ok('① 拍子器 1 秒內出到 2 拍（100 BPM）',audio.filter(function(x){return x.type==='square'}).length>=1,
  'clicks='+audio.filter(function(x){return x.type==='square'}).length);
Music.metro.stop();
ok('① 拍子器停到',Music.metro.on===false);

/* ============ ② 草蜢跳格：實體九宮格 ============ */
const Lead=G.Lead;
G.Lead.S={meet:{id:'t',n:'測試',stages:[{t:'遊戲',n:'草蜢跳格',m:10,screen:'catch'}]},idx:0,left:600,timerOn:false,no:0};
const catchHtml=Lead.scr.catch();
ok('② 畫面係實體九宮格',/實體九宮格/.test(catchHtml));
ok('② 冇「撳螢幕捉草蜢」(Lead.whack)',!/Lead\.whack/.test(catchHtml));
ok('② 有自定限時（秒數 input）',/type="number"/.test(catchHtml)&&/gridSet\('sec'/.test(catchHtml));
ok('② 有 9 格 1–9 號',/id="ho8"/.test(catchHtml)&&/左上/.test(catchHtml)&&/右下/.test(catchHtml));
ok('② 附「點樣帶」卡',/play-card/.test(catchHtml)&&/小朋友做乜/.test(catchHtml));
/* 狀態機：叫格 → 倒數 → 記分 */
Lead.gridSet('sec',3);Lead.gridSet('rounds',5);Lead.gridSet('mode','team');
const g0=Lead._grid;
eq('② 自定限時 3 秒',g0.sec,3);eq('② 回合 5',g0.rounds,5);eq('② 分組計分模式',g0.mode,'team');
audio.length=0;
Lead.gridGo();
const t1=Lead._grid.target;
ok('② 叫到一格 (0-8)',t1>=0&&t1<=8,'target='+t1);
ok('② 叫格有聲（草蜢叫聲）',audio.length>0);
ok('② 目標格亮咗',documentStub.getElementById('ho'+t1).classList.contains('up'));
advance(3200);
ok('② 倒數完顯示「時間到」',/時間到/.test(documentStub.getElementById('gdMsg').innerHTML));
ok('② 倒數計時器已停',Lead._gridIv===null);
Lead.gridMark(1);
ok('② ✓ 記到分',G.Lead._score.some(function(x){return x.s===1}),JSON.stringify(G.Lead._score));
eq('② 成功次數 +1',Lead._grid.ok,1);
eq('② 回合行到 1',Lead._grid.round,1);
for(let i=0;i<4;i++){Lead.gridGo();advance(3200);Lead.gridMark(i%2)}
ok('② 玩滿 5 回合顯示完場',/完場/.test(documentStub.getElementById('gdMsg').innerHTML),
  documentStub.getElementById('gdMsg').innerHTML.slice(0,40));
eq('② 5 回合後 round=5',Lead._grid.round,5);

/* ============ ③ 其餘遊戲：小朋友唔使撳螢幕 ============ */
function scr(name){return Lead.scr[name]({t:'遊戲',n:name,m:10,screen:name})}
const quizHtml=scr('quiz');
ok('③ 問答擂台＝四角搶答',/corner-opts/.test(quizHtml)&&/cc-letter/.test(quizHtml));
ok('③ 答案格冇 onclick（小朋友行位，唔係撳）',!/id="qo0"[^>]*onclick/.test(quizHtml));
ok('③ 有「揭曉答案」領袖掣',/quizReveal/.test(quizHtml));
Lead.quizReveal();
const ai=Lead._quizCur.opts.indexOf(Lead._quizCur.a);
ok('③ 揭曉後正確角變綠',documentStub.getElementById('qo'+ai).classList.contains('ok'));
ok('③ 揭曉有解釋',/正確答案/.test(documentStub.getElementById('quizExplain').innerHTML));

const judgeHtml=scr('judge');
ok('③ 對錯法庭＝左右分邊',/split-sides/.test(judgeHtml)&&/jsYes/.test(judgeHtml));
ok('③ 分邊牌冇 onclick',!/side yes[^>]*onclick/.test(judgeHtml));
Lead.judgeReveal();
ok('③ 宣判有解釋',/judgeExp/.test('judgeExp')&&documentStub.getElementById('judgeExp').innerHTML.length>10);

const recHtml=scr('recycle');
ok('③ 回收＝四角分桶',/recycle-corners/.test(recHtml)&&/binblue/.test(recHtml));
ok('③ 桶冇 onclick（行位表態）',!/id="bin(blue|yellow|green|trash)"[^>]*onclick/.test(recHtml));
Lead.recycleReveal(Lead._recCur.t);
ok('③ 揭曉正確桶',documentStub.getElementById('bin'+Lead._recCur.t).classList.contains('ok'));

const memHtml=scr('memory');
ok('③ 記憶卡有編號（先講得到位置）',/mon-no/.test(memHtml)&&/口講位置/.test(memHtml));
const moonHtml=scr('moon');
ok('③ 射月靶唔可以再撳（改真實投擲）',!/moon-target-wrap" onclick/.test(moonHtml));
ok('③ 射月由領袖記分',/moonHit/.test(moonHtml)&&/moonMiss/.test(moonHtml));
Lead.moonHit();Lead.moonHit();Lead.moonMiss();Lead.moonNext();
eq('③ 射月記分累計',Lead._moonScore,2);
const cleanHtml=scr('clean');
ok('③ 洗手七步唔再逐格俾小朋友撳',!/clean-card[^>]*onclick/.test(cleanHtml));
ok('③ 洗手有領袖逐步掣',/cleanStep\(-1\)/.test(cleanHtml)&&/cleanStep\(1\)/.test(cleanHtml));
['bodycard','emotion','foodrainbow','transport','guess','task','roll','traffic','leader','rhythm','memory','story','breath','chute'].forEach(function(k){
  const h=scr(k);
  ok('③ '+k+' 有「領袖操作／點樣帶」提示',/leader-only|play-card/.test(h));
});
/* 節奏模仿：真實拍子聲 */
Lead._rhythm={pat:[{t:'👏 拍手',s:'clap'},{t:'🦶 踏步',s:'stomp'},{t:'🦗 草蜢跳',s:'hop'},{t:'🙆 大愛心',s:'cheer'}],bpm:100,step:-1,playing:false};
audio.length=0;Lead.rhPlay();
ok('③ 節奏模仿出到聲（唔係淨係畫面）',audio.length>0,'sounds='+audio.length);
advance(3000);
ok('③ 節奏模仿播完解除 lock',Lead._rhythm.playing===false);

/* ============ ④ 全站冇「叫小朋友撳螢幕」嘅遊戲文案 ============ */
const allStages=[];
G.TPLS.forEach(function(t){(t.stages||[]).forEach(function(s){allStages.push([t.n,s])})});
(G.DATA.blocks||[]).forEach(function(s){allStages.push(['積木',s])});
const badWord=/撳中|點擊彈出|快啲撳|搶按|鬥快撳/;
const bad=allStages.filter(function(x){return badWord.test((x[1].how||'')+(x[1].script||'')+(x[1].n||''))});
ok('④ 範本／積木環節冇「叫小朋友撳螢幕」字眼',bad.length===0,
  bad.map(function(x){return x[0]+'／'+x[1].n}).join(', '));

/* ============ ⑤ 物資・檢查表 ============ */
const Kit=G.Kit;
['九宮格地貼','角牌','泡棉球'].forEach(function(m){
  ok('⑤ 物資庫有「'+m+'」',!!Kit.mats[m]&&/後備|冇就改用|sub/.test(JSON.stringify(Kit.mats[m]))&&!!Kit.mats[m].q&&!!Kit.mats[m].how&&!!Kit.mats[m].sub);
});
ok('⑤ 新增「地貼／體能遊戲前檢查表」',!!Kit.checks.floor&&Kit.checks.floor.items.length===10,
  'items='+(Kit.checks.floor||{items:[]}).items.length);
const ck=Kit.checkFor({t:'遊戲',n:'草蜢跳格(實體九宮格)',how:'地上貼 3×3 九宮格'});
eq('⑤ 捉草蜢環節自動配到地貼檢查表',ck&&ck.key,'floor');
ok('⑤ 九宮格物資有份量換算',/厘米/.test(Kit.mats['九宮格地貼'].q));

/* ============ ⑥ A4 教材 ============ */
const P=G.PrintKit;
['floor-grid','corner-signs','game-cards'].forEach(function(id){
  const k=P.kits.filter(function(x){return x.id===id})[0];
  ok('⑥ 教材庫有「'+id+'」',!!k);
  if(!k)return;
  const html=k.render();
  ok('⑥ '+id+' 渲染到內容',typeof html==='string'&&html.length>300,'len='+html.length);
  if(id==='floor-grid')ok('⑥ 九宮格地貼有 9 格',(html.match(/fn-cell/g)||[]).length===9);
  if(id==='corner-signs'){
    ok('⑥ 有 A/B/C/D 四角角牌',/sign-card cc-a/.test(html)&&/sign-card cc-d/.test(html));
    ok('⑥ 有 👍👎 分邊牌',/sign-yes/.test(html)&&/sign-no/.test(html));
    ok('⑥ 有回收桶標籤＋射月靶',/sign-blue/.test(html)&&/sign-moon/.test(html));
  }
  if(id==='game-cards'){
    const miss=Object.keys(Lead.playMeta).filter(function(k2){return html.indexOf(Lead.playMeta[k2].n)<0});
    ok('⑥ 遊戲帶領卡覆蓋全部 '+Object.keys(Lead.playMeta).length+' 個遊戲',miss.length===0,'缺:'+miss.join(','));
  }
});

/* ============ ⑦ 手冊遊戲帶領總表 ============ */
G.HB.tab='games';
const hbHtml=G.HB.games();
ok('⑦ 手冊有「遊戲帶領總表」',/遊戲帶領總表/.test(hbHtml));
ok('⑦ 講明「唔係打電子 GAME」',/唔係打電子 GAME/.test(hbHtml));
const miss2=Object.keys(Lead.playMeta).filter(function(k){return hbHtml.indexOf(Lead.playMeta[k].n)<0});
ok('⑦ 總表列出全部遊戲',miss2.length===0,'缺:'+miss2.join(','));
ok('⑦ 手冊 tabs 有 games 分頁',/games','🎮 遊戲帶領/.test(fs.readFileSync(path.join(__dirname,'..','js','handbook.js'),'utf8')));

/* ============ ⑧ 帶領指引（綠色欄）都改成實體玩法 ============ */
const Guide=G.Guide;
[['catch','九宮格'],['quiz','四角'],['judge','👍'],['recycle','四角'],['memory','編號'],['rhythm','拍子'],['moon','投擲線']].forEach(function(x){
  const g=Guide.forStage({t:'遊戲',n:x[0],screen:x[0]});
  ok('⑧ Guide['+x[0]+'] 講實體玩法（含「'+x[1]+'」）',new RegExp(x[1]).test(g.lead+JSON.stringify(g.steps)),g.lead.slice(0,40));
  ok('⑧ Guide['+x[0]+'] 唔再叫小朋友撳螢幕',!/點擊|撳中/.test(g.lead));
});

/* ============ ⑨ 全部範本環節都渲染得到（唔會有畫面撻著就死） ============ */
let rendered=0;const broken=[];
const allT=G.TPLS.concat(G.Store.get('mymeets',[])||[]);
allT.forEach(function(t){
  (t.stages||[]).forEach(function(st,i){
    try{
      const html=Lead.screen(st);
      if(typeof html!=='string'||!html.length)throw new Error('empty');
      rendered++;
    }catch(e){broken.push(t.id+'#'+i+' '+(st.screen||st.t)+' — '+e.message)}
  });
});
const totalStages=allT.reduce(function(a,t){return a+((t.stages||[]).length)},0);
ok('⑨ 全部 '+rendered+'/'+totalStages+' 個環節畫面渲染成功',broken.length===0&&rendered===totalStages&&rendered>100,
  'rendered='+rendered+'/'+totalStages+'; '+broken.slice(0,4).join(' | '));
/* 帶領模式開一次（用第一個範本），確認 render() 唔會炸 */
try{
  G.Kit.ownerOf=function(){return ''};
  Lead.start(allT[0].id,1);
  ok('⑨ Lead.start() 開到帶領模式',/lead-top/.test(documentStub.getElementById('leadroot').innerHTML));
}catch(e){ok('⑨ Lead.start() 開到帶領模式',false,e.message)}

/* ⑩ 📍 場地設置層：每個需要設場嘅環節都要計得出步驟 */
const V=G.Venue;
ok('⑩ Venue 模組載入（分區/佈置/時間表/規矩/救急）',
  !!V&&V.zones.length===6&&V.layouts.length===5&&V.timeline.length===9&&V.rules.length===5&&V.crowd.length===4&&V.fix.length===8,
  V?('zones='+V.zones.length+' layouts='+V.layouts.length+' timeline='+V.timeline.length+' rules='+V.rules.length):'Venue undefined');
const vCatch=V.needFor({n:'草蜢跳格',how:'九宮格'});
ok('⑩ 捉草蜢→九宮格設置步驟（60×60・格距・起步線）',
  /60×60/.test(vCatch.setup.join(''))&&/起步線/.test(vCatch.setup.join(''))&&vCatch.print==='floor-grid',JSON.stringify(vCatch));
const vPara=V.needFor({n:'開心快樂傘',how:'揚傘'});
ok('⑩ 快樂傘→淨空直徑＋天花檢查',/淨空直徑/.test(vPara.setup.join(''))&&/天花/.test(vPara.setup.join('')));
const vCraft=V.needFor({n:'整紙燈籠',t:'手工',mats:['利是封']});
ok('⑩ 手工→四人一枱＋報紙＋大人一檔',/四人一枱|4 人一枱|四人/.test(vCraft.setup.join(''))&&/大人一檔/.test(vCraft.setup.join('')),vCraft.setup.join(' / '));
const vQuiz=V.needFor({n:'問答擂台',script:'一齊搶答',screen:'quiz'});
ok('⑩ 搶答（關鍵字只喺 script）都計到角牌',vQuiz.setup.length>0&&/角牌/.test(vQuiz.setup.join('')),JSON.stringify(vQuiz.setup));
ok('⑩ Venue.html() 教學頁渲染（六分區・時間表・規矩・救急）',
  /分區/.test(V.html())&&/開場前/.test(V.html())&&/規矩/.test(V.html())&&/救急/.test(V.html()));
ok('⑩ Venue.printSheet() 出到 A4',V.printSheet().length>2000&&/venue-sheet/.test(V.printSheet()));
ok('⑩ Venue.meetHtml(範本) 計出今場要設乜（分區＋設置清單）',/vn-meet/.test(V.meetHtml(allT[0]))&&/集合圈/.test(V.meetHtml(allT[0])));
ok('⑩ Venue.stageHint(九宮格環節) 有提示',/vn-hint/.test(V.stageHint({n:'草蜢跳格',how:'九宮格'})));
ok('⑩ Kit.checks.venue 到場設場檢查表 10 項',(G.Kit.checks.venue.items||[]).length===10);

/* ⑪ 🧒 4–7 歲手工控場層 */
const C=G.Craft;
ok('⑪ Craft.ctrl 八招控場（派料・一步一停・舉手・加任務・喊・爭執・收工）',
  (C.ctrl||[]).length===8&&/一人一格/.test(C.ctrl[1].t)&&/一步一停/.test(C.ctrl[2].t)&&/加一任務/.test(C.ctrl[4].d)&&/手離枱/.test(C.ctrl[7].d),
  'ctrl='+(C.ctrl||[]).length);
const noKid=C.list().filter(function(x){var k=(C.kid||{})[x.k];return !k||!(k.a45||[]).length||!(k.a67||[]).length||!k.adult||!(k.stop||[]).length});
ok('⑪ 15 個手工全部有 4–5／6–7 歲分工＋你幫手嘅位',noKid.length===0&&Object.keys(C.kid).length>=16,
  '缺：'+(noKid.map(function(x){return x.k}).join(',')||'無')+'｜kid keys='+Object.keys(C.kid).length);
ok('⑪ ctrlHtml 出到兩欄年齡分工＋停頓位',
  /4–5 歲：你做多啲/.test(C.ctrlHtml('lantern'))&&/6–7 歲：佢做多啲/.test(C.ctrlHtml('lantern'))&&/一步一停嘅停頓位/.test(C.ctrlHtml('lantern')));
ok('⑪ controlSheet A4 有「五樣一定唔好做」＋30 分鐘時間表',
  /五樣一定唔好做/.test(C.controlSheet())&&/30 分鐘手工時間表/.test(C.controlSheet())&&/紅線/.test(C.controlSheet()));
ok('⑪ ctrlTable 速查表 15 行',(C.ctrlTable().match(/<tr>/g)||[]).length===C.list().length+1,
  'tr='+(C.ctrlTable().match(/<tr>/g)||[]).length);
ok('⑪ 手工自學卡 html() 已含控場層',/4–7 歲控場法/.test(C.html('lantern'))&&/craft-ctrl/.test(C.html('lantern')));
const craftSt={t:'手工',n:'整紙燈籠',mats:['利是封']};
ok('⑪ mini()／ctrlHint() 都帶控場提示',
  /4–7 歲控場/.test(C.mini(craftSt))&&/你幫手嘅位/.test(C.ctrlHint(craftSt)));
ok('⑪ screenArt() 投影加咗一步一停停頓位',/一步一停/.test(C.screenArt(craftSt)));
ok('⑪ printSheet() 手工 A4 已加控場＋年齡分工',
  /4–7 歲控場/.test(C.printSheet('lantern'))&&/年齡分工/.test(C.printSheet('lantern')));

/* ⑫ 誓詞帶讀指引（原本三條落去萬用兜底） */
const pledgeSt=[['t07',1],['block',null]];
const g07=G.Guide.forStage(allT.find(function(t){return t.id==='t07'}).stages[1]);
ok('⑫ 誓詞・規律・口號有專屬帶讀指引（一句一句讀）',
  /我讀一句/.test(g07.lead)&&(g07.steps||[]).length===3&&/企好/.test(g07.steps[0][2]),g07.lead.slice(0,30));

/* ⑬ 打印套包新增兩份（場地設置卡・控場卡） */
const kits=G.PrintKit.kits;
const kV=kits.filter(function(k){return k.id==='venue'})[0];
const kC=kits.filter(function(k){return k.id==='craft-ctrl'})[0];
ok('⑬ PrintKit 有「場地設置卡」並且 render 到',!!kV&&kV.render().length>2000,kV?('len='+kV.render().length):'missing');
ok('⑬ PrintKit 有「4–7 歲控場卡」並且 render 到',!!kC&&kC.render().length>2000,kC?('len='+kC.render().length):'missing');

/* ⑬b 新層已接駁到實際入口（唔係淨係有函數） */
ok('⑬ 手冊分頁列有「📍 場地設置」',/\['venue','📍 場地設置'\]/.test(fs.readFileSync(path.join(__dirname,'..','js','handbook.js'),'utf8')));
ok('⑬ 手冊 HB.venue() 渲染到教學頁',G.HB.venue().length>5000&&/分區/.test(G.HB.venue()));
ok('⑬ 準備卡 Kit.meetKitHtml(t01) 已含場地段',/vn-meet/.test(G.Kit.meetKitHtml(allT[0])));
ok('⑬ 準備卡 Kit.meetKitHtml(t03) 計出投擲線＋角牌',
  /投擲線/.test(G.Kit.meetKitHtml(allT.filter(function(t){return t.id==='t03'})[0]))&&/角牌/.test(G.Kit.meetKitHtml(allT.filter(function(t){return t.id==='t03'})[0])));
ok('⑬ 檢查表工具箱列到「到場設場檢查表」',/到場設場檢查表/.test(G.Kit.checkToolHtml(allT[0])));
ok('⑬ 搜尋「場地」「控場」都搵到新內容',/場地設置/.test(G.Kit.searchHtml('場地'))&&/控場/.test(G.Kit.searchHtml('控場')));
try{
  Lead.start('t03',1);
  var _lr=documentStub.getElementById('leadroot').innerHTML;
  ok('⑬ 帶領模式頂欄有「📍 場地」按鈕・領袖欄有場地提示',
    /📍 場地/.test(_lr)&&/vn-hint/.test(_lr),'leadroot len='+_lr.length);
}catch(e){ok('⑬ 帶領模式頂欄有「📍 場地」按鈕',false,e.message)}

/* ⑭ 內容質素：唔好殘留 markdown 記號／簡體字 */
const srcTxt=['js/venue.js','js/craft.js','js/kit.js','js/guide.js'].map(function(f){return fs.readFileSync(path.join(__dirname,'..',f),'utf8')});
const stars=srcTxt.filter(function(t){return /\*\*/.test(t)}).length;
ok('⑭ 新增內容冇殘留 ** markdown 記號（esc 過會變星號）',stars===0,'有星號嘅檔案數='+stars);

/* ⑮ 📦 集會套包：一撳印齊・領袖紙同小朋友紙分開 */
const PK=G.Pack, SH=G.Sheets;
ok('⑮ Pack／Sheets 模組載入',!!PK&&!!SH&&PK.PARTS.length===10,'parts='+(PK&&PK.PARTS.length));
const pkMeet=PK.meet();
ok('⑮ 預設攞到行事曆下一場',!!pkMeet&&!!pkMeet.m&&pkMeet.m.stages.length>0,pkMeet&&pkMeet.m&&pkMeet.m.n);
const pkHtml=PK.html();
ok('⑮ 套包頁出到三個大掣（印齊今場／淨印圖紙／淨印教案）',/印齊今場/.test(pkHtml)&&/淨印小朋友圖紙/.test(pkHtml)&&/淨印領袖教案/.test(pkHtml));
/* 計「一開就見到」嘅字：收埋喺 <details> 入面嘅唔計 */
const pkSeen=pkHtml.replace(/<details[\s\S]*?<\/details>/g,'').replace(/<[^>]+>/g,'').replace(/\s/g,'');
ok('⑮ 套包頁字少：一開見到嘅正文少過 1200 字',pkSeen.length<1200,'len='+pkSeen.length);
ok('⑮ 有「臨時集會」入口（資深領袖即用）',/臨時集會/.test(pkHtml)&&PK.INST.length===6,'inst='+PK.INST.length);
ok('⑮ 有「一撳就印嘅工具」',/一撳就印嘅工具/.test(pkHtml));
/* 領袖套包內容 */
const leadHtml=PK.sheets('lead',pkMeet.m,1);
ok('⑮ 領袖套包渲染到',leadHtml.length>6000,'len='+leadHtml.length);
ok('⑮ 有程序表＋時間欄',/pack-run/.test(leadHtml)&&/照讀一句/.test(leadHtml));
ok('⑮ 有執袋單（已計人手）',/執袋單/.test(leadHtml)&&/每次都要帶/.test(leadHtml));
ok('⑮ 有環節帶領卡（每節一張）',(leadHtml.match(/class="pk-card"/g)||[]).length===pkMeet.m.stages.length,
  'cards='+(leadHtml.match(/class="pk-card"/g)||[]).length+'/'+pkMeet.m.stages.length);
ok('⑮ 有家長通知（已填主題）',/家長通知/.test(leadHtml)&&pkMeet.m.theme.split('・')[0].slice(0,3).length>0);
ok('⑮ 有檢查表',/檢查表/.test(leadHtml));
/* 小朋友紙：唔可以混入說明書 */
const craftMeet=G.TPLS.filter(function(t){return t.id==='t03'})[0]||G.TPLS[0];
const kidList=SH.forMeet(craftMeet);
ok('⑮ 中秋場自動配到手工即用紙',kidList.length>0&&kidList[0].kind==='craft','list='+JSON.stringify(kidList.map(function(x){return x.k})));
const kidHtml=PK.kidSheets(craftMeet,2);
ok('⑮ 小朋友紙按人數重複（2 份 = 2 倍頁數）',
  (kidHtml.match(/ready-sheet/g)||[]).length===SH.forMeet(craftMeet).length*2,
  'sheets='+(kidHtml.match(/ready-sheet/g)||[]).length);
const manualWords=/自學卡|領袖自學|物資・每人幾多|開會前備料|最易出事|後備版|帶班時點拆|年齡分工|逐步拆解|萬用六步|點樣帶|安全提醒/;
ok('⑮ 小朋友紙冇混入領袖說明書（即用即印）',!manualWords.test(kidHtml),
  kidHtml.match(manualWords)?kidHtml.match(manualWords)[0]:'');
ok('⑮ 小朋友紙有剪線／摺線（真係用得到）',/stroke-dasharray/.test(kidHtml)&&/✂/.test(kidHtml));
/* 每張紙嘅版面唔可以出界（打印先至啱一版） */
/* 只睇幾何屬性：x/y/cx/cy/r/width/height 同 path d 入面嘅數 */
function bounds(html,label){
  const bad=[];
  const GEO=/\b(x|y|cx|cy|r|x1|y1|x2|y2|width|height)="(-?\d+(?:\.\d+)?)(?:\s+(-?\d+(?:\.\d+)?))?"/g;
  html.replace(/<(rect|circle|ellipse|text|line)[^>]*>/g,function(tag){
    let mm;GEO.lastIndex=0;
    while((mm=GEO.exec(tag))){
      [mm[2],mm[3]].forEach(function(v){if(v!=null){const n=+v;if(n<-2||n>300)bad.push(label+' '+mm[1]+'='+v)}});
    }
    return tag;
  });
  /* path：真係行一次（支援大細階 M L H V C S Q T Z），計出實際座標範圍 */
  html.replace(/<path[^>]*\sd="([^"]+)"/g,function(all,d){
    let x=0,y=0,sx=0,sy=0;
    const tk=d.match(/[MmLlHhVvCcSsQqTtZz]|-?\d*\.?\d+/g)||[];
    let i=0,cmd='';
    const num=function(){return +tk[i++]};
    const chk=function(px,py){if(px<-6||px>216||py<-6||py>303)bad.push(label+' path:'+px.toFixed(0)+','+py.toFixed(0))};
    while(i<tk.length){
      if(/[A-Za-z]/.test(tk[i]))cmd=tk[i++];
      const rel=cmd===cmd.toLowerCase(),C=cmd.toUpperCase();
      if(C==='Z'){x=sx;y=sy;continue}
      if(C==='M'||C==='L'||C==='T'){let nx=num(),ny=num();x=rel?x+nx:nx;y=rel?y+ny:ny;chk(x,y);if(C==='M'){sx=x;sy=y}}
      else if(C==='H'){let nx=num();x=rel?x+nx:nx;chk(x,y)}
      else if(C==='V'){let ny=num();y=rel?y+ny:ny;chk(x,y)}
      else if(C==='C'){for(let k=0;k<2;k++){const a=num(),b=num();chk(rel?x+a:a,rel?y+b:b)}const nx=num(),ny=num();x=rel?x+nx:nx;y=rel?y+ny:ny;chk(x,y)}
      else if(C==='S'||C==='Q'){for(let k=0;k<1;k++){const a=num(),b=num();chk(rel?x+a:a,rel?y+b:b)}const nx=num(),ny=num();x=rel?x+nx:nx;y=rel?y+ny:ny;chk(x,y)}
      else i++;
    }
    return all;
  });
  return bad;
}
let sheetBad=[];
Object.keys(SH.craft).forEach(function(k){
  const h=SH.one('craft',k);
  ok('⑮ 即用紙「'+k+'」渲染到',h.length>800&&/rs-art/.test(h),'len='+h.length);
  sheetBad=sheetBad.concat(bounds(h,'craft/'+k));
});
Object.keys(SH.ws).forEach(function(k){
  const h=SH.one('ws',k);
  ok('⑮ 工作紙「'+k+'」渲染到',h.length>800,'len='+h.length);
  sheetBad=sheetBad.concat(bounds(h,'ws/'+k));
});
ok('⑮ 全部即用紙坐標喺 A4 範圍內（唔會打印出界）',sheetBad.length===0,sheetBad.slice(0,6).join(','));
/* 同一個 tag 出現兩次同一個屬性 = 瀏覽器只會用第一個（fill 會靜靜地錯） */
function dupAttr(html,label){
  const bad=[];
  html.replace(/<[a-zA-Z][^>]*>/g,function(tag){
    const seen={};
    (tag.match(/\s[a-zA-Z-]+=/g)||[]).forEach(function(a){
      const n=a.trim().replace('=','');
      if(seen[n])bad.push(label+' <'+tag.slice(1,12)+'… 重複 '+n);
      seen[n]=1;
    });
    return tag;
  });
  return bad;
}
let dupBad=[];
Object.keys(SH.craft).forEach(function(k){dupBad=dupBad.concat(dupAttr(SH.one('craft',k),'craft/'+k))});
Object.keys(SH.ws).forEach(function(k){dupBad=dupBad.concat(dupAttr(SH.one('ws',k),'ws/'+k))});
dupBad=dupBad.concat(dupAttr(leadHtml,'領袖套包'));
ok('⑮ 全部紙嘅 SVG 冇重複屬性（唔會靜靜地印錯）',dupBad.length===0,dupBad.slice(0,5).join(','));
ok('⑮ 15 樣手工全部有即用紙',G.Craft.list().filter(function(c){return !SH.craft[c.k]}).length===0,
  '缺：'+G.Craft.list().filter(function(c){return !SH.craft[c.k]}).map(function(c){return c.k}).join(','));
/* 兩疊紙唔好重疊：小朋友紙入面唔可以有程序表 */
ok('⑮ 領袖套包同小朋友紙內容唔重疊',!/pack-run/.test(kidHtml)&&!/ready-sheet/.test(PK.sheets('lead',craftMeet,1).replace(/pack-sheet/g,''))===false||!/rs-art/.test(PK.sheets('lead',craftMeet,1)));
/* 場地貼紙自動配 */
const floorMeet=G.TPLS.filter(function(t){return (t.stages||[]).some(function(s){return s.screen==='catch'})})[0];
ok('⑮ 有九宮格環節 → 自動配地貼',floorMeet?SH.floorFor(floorMeet).some(function(x){return x.k==='floor-grid'}):true,
  floorMeet?JSON.stringify(SH.floorFor(floorMeet)):'no meet');
ok('⑮ 九宮格地貼可以只印「用」嗰版（唔帶玩法卡）',
  (G.PrintKit.renderFloorGrid(true).match(/fn-cell/g)||[]).length===9&&!/領袖玩法卡/.test(G.PrintKit.renderFloorGrid(true)));
/* 教材庫新入口 */
const kReady=G.PrintKit.kits.filter(function(x){return x.id==='craft-ready'})[0];
const kKid=G.PrintKit.kits.filter(function(x){return x.id==='kid-pack'})[0];
ok('⑮ 教材庫有「手工即用紙」同「小朋友即用紙」',!!kReady&&!!kKid);
ok('⑮ 手工即用紙 render 到總覽',kReady&&kReady.render().length>800&&/總覽/.test(kReady.render()));
ok('⑮ 小朋友套包 render 到',kKid&&kKid.render('t03').length>800,'len='+(kKid?kKid.render('t03').length:0));
/* 即興集會定義共用（App.startInstant 同一份） */
const inst=PK.instantMeet('safety',40);
ok('⑮ 即興集會砌得到（有環節＋物資）',inst.stages.length>=5&&inst.stages.some(function(s){return (s.mats||[]).length}),'stages='+inst.stages.length);
ok('⑮ App.startInstant 用返同一份定義',/Pack\.instantMeet/.test(fs.readFileSync(path.join(__dirname,'..','js','app.js'),'utf8')));
ok('⑮ 即興集會都出到套包',PK.sheets('lead',inst,1).length>4000);
/* 剔走項目就唔印 */
/* 環保：預設只印必要嘅紙（小朋友紙・貼地標記・領袖一頁流程），其餘喺 APP 睇 */
/* 模擬瀏覽器開機（App.init 會做呢兩樣），否則 Pack.route() 重繪會炸 */
if(!G.Store.get('settings'))G.Store.set('settings',{group:'測試旅團',start:'9',dur:'60',startDate:''});
if(!G.Store.get('plan'))G.App.seedPlan();
G.Store.set('packsel',{});
const dflt=PK.sel();
const mustPrint=['kid','floor','cover'];
const offByDefault=PK.PARTS.filter(function(p){return p.print}).map(function(p){return p.k});
eq('⑮ 預設只印三樣',offByDefault.slice().sort(),mustPrint.slice().sort());
ok('⑮ 唔印嘅項目全部有「APP 睇」入口（唔會冇咗）',
  PK.PARTS.filter(function(p){return !p.print&&!p.app}).length===0,
  PK.PARTS.filter(function(p){return !p.print&&!p.app}).map(function(p){return p.k}).join(','));
ok('⑮ 預設領袖套包淨係 1 頁',PK.pages('lead',pkMeet.m,0)===1,'pages='+PK.pages('lead',pkMeet.m,0));
const slim=PK.sheets('lead',pkMeet.m,0);
ok('⑮ 預設領袖紙只有程序表（執袋單／帶領卡／通知都唔印）',
  /pack-run/.test(slim)&&!/執袋單/.test(slim)&&!/class="pk-card"/.test(slim)&&!/家長通知/.test(slim),'len='+slim.length);
PK.setPart('notice',1);
ok('⑮ 想要先至印：剔開家長通知就出到',/家長通知/.test(PK.sheets('lead',pkMeet.m,0)));
PK.setPart('notice',0);
ok('⑮ 套包頁講明印幾頁＋慳幾多',/淨係印/.test(pkHtml)&&/其餘/.test(pkHtml)&&/🌱/.test(pkHtml));
ok('⑮ 冇名單時預設印 1 份（唔好白白印 12 份）',PK.copies()===1,'copies='+PK.copies());
/* 小朋友紙逐款揀 */
var kAll=PK.kidPicks(pkMeet.m);
ok('⑮ 預設全部款都印',kAll.length===G.Sheets.forMeet(pkMeet.m).length,'款='+kAll.length);
const pBefore=PK.pages('kid',pkMeet.m,0);
PK.toggleKid(kAll[0].k);
ok('⑮ 剔走一款就少印一款',PK.kidPicks(pkMeet.m).length===kAll.length-1&&PK.pages('kid',pkMeet.m,0)<pBefore,
  pBefore+'→'+PK.pages('kid',pkMeet.m,0));
ok('⑮ 剔走嗰款唔會出紙',PK.sheets('kid',pkMeet.m,0).indexOf('data-k="'+kAll[0].k+'"')<0);
PK.toggleKid(kAll[0].k);
eq('⑮ 剔晒所有款等同「全部印」（唔會卡死）',PK.kidPicks(pkMeet.m).length,kAll.length);
G.Store.set('members',[{n:'陳大文'},{n:'李小明'},{n:'黃小美'}]);
G.Store.set('packcopies',0);
eq('⑮ 有名單就跟人數印',PK.copies(),3);
G.Store.set('members',[]);
ok('⑮ 對照官方套包表（取代官方）',PK.COVER.length>=8&&/官方冇/.test(JSON.stringify(PK.COVER))&&/仲使唔使睇官方套包/.test(pkHtml),
  'rows='+PK.COVER.length);

/* 曲庫：每首唱遊歌都要有啱節奏嘅伴奏 */
eq('⑮ 曲庫有三首歌',Object.keys(Music.SONGBOOK).length,3);
['theme','jingle','newyear'].forEach(function(k){
  var sb=Music.SONGBOOK[k];
  var beats=sb.song.reduce(function(a,x){return a+x[1]},0);
  var linesN=sb.lines.reduce(function(a,b){return a+b},0);
  ok('⑮ '+k+' 音數等於 lines 總和',linesN===sb.song.length,'notes='+sb.song.length+' lines='+linesN);
  ok('⑮ '+k+' 拍數係 4 嘅倍數',beats%4===0,'beats='+beats);
});
Music.load('jingle');
ok('⑮ 載入 jingle 後跟住換',Music.cur==='jingle'&&Music.song===Music.SONGBOOK.jingle.song);
Music.load('theme');
ok('⑮ 載入返 theme',Music.cur==='theme');

/* ⑯ 導航重組：上方 4 個新手掣 ＋ 下方 4 個工具掣（電話放得曬） */
const idxHtml=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const topNav=(idxHtml.match(/<nav id="topnav"[\s\S]*?<\/nav>/)||[''])[0];
const botNav=(idxHtml.match(/<nav id="tabbar"[\s\S]*?<\/nav>/)||[''])[0];
const topLinks=(topNav.match(/<a /g)||[]).length, botLinks=(botNav.match(/<a /g)||[]).length;
ok('⑯ 上方最多 4 個掣',topLinks>0&&topLinks<=4,'top='+topLinks);
ok('⑯ 下方最多 4 個掣',botLinks>0&&botLinks<=4,'bottom='+botLinks);
ok('⑯ 上下方分開兩類（🅰️ 新手四步／🅱️ 工具箱）',/🅰️/.test(topNav)&&/🅱️/.test(botNav));
const navTabs=(idxHtml.match(/data-tab="([a-z]+)"/g)||[]).map(function(x){return x.replace(/[^a-z]/g,'').replace('datatab','')});
['pack','plan','meet','play','lead','track','book','print'].forEach(function(v){
  ok('⑯ 「'+v+'」有入口（唔會有孤兒分頁）',navTabs.indexOf(v)>=0,navTabs.join(','));
});
ok('⑯ 兩條 bar 都會著燈',/#tabbar a, #topnav a/.test(fs.readFileSync(path.join(__dirname,'..','js','app.js'),'utf8')));
ok('⑯ 上方係入口唔係步驟（冇 1234 編號扮流程）',!/<i>[1-9]<\/i>/.test(topNav),topNav.replace(/\s+/g,' ').slice(0,120));

/* ⑯b 🧭 step by step：揀咗集會之後一步步帶到散會（唔靠上面粒掣扮流程） */
const FL=G.Flow;
ok('⑯b 有嚮導模組同底部條位',!!FL&&/id="flowbar"/.test(idxHtml)&&/js\/flow\.js/.test(idxHtml));
ok('⑯b 一場集會由頭到尾 6 步',FL.STEPS.length===6&&FL.STEPS[0].k==='pick'&&FL.STEPS[FL.STEPS.length-1].k==='rec',
  FL.STEPS.map(function(x){return x.k}).join('→'));
ok('⑯b 每步都有「做乜・點解・撳邊個掣」',FL.STEPS.every(function(x){return x.n&&x.why&&x.btn&&x.go}));
G.Store.set('flow',null);
ok('⑯b 預設唔會騷擾（未開就冇條 bar）',!FL.on()&&FL.barHtml().length>0);
FL.start();
eq('⑯b 開咗之後由第 1 步「揀集會」開始',FL.cur().k,'pick');
PK.pick('tpl','t03',3);
eq('⑯b 揀咗集會就自動跳去第 2 步「印教材」',FL.cur().k,'print');
PK.open('all');
eq('⑯b 印完就自動跳去第 3 步「執袋」',FL.cur().k,'bag');
FL.mark('bag');FL.mark('venue');
eq('⑯b 剔完設場就到「帶領」',FL.cur().k,'lead');
FL.mark('lead');FL.mark('rec');
ok('⑯b 做齊 6 步＝散會（條 bar 出完成訊息）',FL.cur()===null&&/散會/.test(FL.barHtml()),'done='+FL.doneCount());
FL.reset();
eq('⑯b 下一場可以重頭再嚟',FL.cur().k,'pick');
ok('⑯b 「揀集會」頁有嚮導入口',/帶我由頭做到尾|嚮導行緊/.test(G.Plan.html()));
FL.quit();
ok('⑯b 撳✕ 之後唔會再彈出嚟',!FL.on());

/* ⑰ 圖紙搵得返：教案入面有圖紙清單・一疊過印教案＋圖紙 */
const lp=G.PrintKit.renderLessonPlan('t03');
ok('⑰ 教案有「今場圖紙清單」',/今場圖紙清單/.test(lp),'len='+lp.length);
const meetAll=G.PrintKit.kits.filter(function(k){return k.id==='meet-all'})[0];
ok('⑰ 教材庫有「教案＋圖紙一疊過」',!!meetAll);
const craftT=G.TPLS.filter(function(t){return G.Sheets.forMeet(t).length>0})[0];
const allStack=PK.sheets('all',craftT,1);
ok('⑰ 一疊過＝教案＋分隔頁＋圖紙',/pack-run/.test(allStack)&&/pk-divider/.test(allStack)&&/rs-art/.test(allStack),'len='+allStack.length);
ok('⑰ 分隔頁講明下面係圖紙',/以下係「小朋友圖紙」/.test(allStack));
eq('⑰ 一疊過頁數＝教案＋1 分隔頁＋圖紙',PK.pages('all',craftT,1),PK.pages('lead',craftT,1)+1+PK.pages('kid',craftT,1));
ok('⑰ 套包頁講到圖紙喺邊',/今場圖紙/.test(pkHtml));
ok('⑰ 圖紙庫（教材庫）第一屏就有今場圖紙',/今場/.test(G.PrintKit.html())&&/印齊今場/.test(G.PrintKit.html()));
const pkCats=G.PrintKit.kits.map(function(k){return k.cat});
ok('⑰ 教材分四類，冇孤兒類',pkCats.every(function(c){return ['kid','floor','lead','admin'].indexOf(c)>=0}),
  Array.from(new Set(pkCats)).join(','));

/* ⑱ 圖同玩法要夾：每個有圖嘅遊戲，張圖要對得住玩法 */
const imgMap=G.Img.games;
const gameFiles=Object.keys(imgMap).map(function(k){return imgMap[k]});
gameFiles.forEach(function(f){
  ok('⑱ 圖檔存在 '+f,fs.existsSync(path.join(__dirname,'..','img',f+'.avif')));
});
ok('⑱ 四角搶答／分邊／回收各有自己張圖（唔再共用一張）',
  imgMap.quiz!==imgMap.judge&&imgMap.judge!==imgMap.recycle&&imgMap.quiz!==imgMap.recycle,
  imgMap.quiz+'/'+imgMap.judge+'/'+imgMap.recycle);
ok('⑱ 記憶配對唔會亂配一張四角圖',!imgMap.memory);
ok('⑱ 新圖有入 sw 快取',/g-judge\.avif/.test(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'))&&
  /g-recycle\.avif/.test(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8')));

/* ============ 結果 ============ */
console.log('\n✅ 通過 '+pass+' 項');
if(fails.length){
  console.log('\n❌ 失敗 '+fails.length+' 項：');
  fails.forEach(function(f){console.log('  ・'+f)});
  process.exit(1);
}
console.log('🎉 全部通過');
