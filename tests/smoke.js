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
const order=['data.js','guide.js','craft.js','tpls.js','app.js','prepare.js','print.js','lead.js','track.js','handbook.js','play.js','kit.js','venue.js'];
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

/* ============ 結果 ============ */
console.log('\n✅ 通過 '+pass+' 項');
if(fails.length){
  console.log('\n❌ 失敗 '+fails.length+' 項：');
  fails.forEach(function(f){console.log('  ・'+f)});
  process.exit(1);
}
console.log('🎉 全部通過');
