/* 🦗 app.js — 核心:路由、資料存取、規劃(年度行事曆+42個月路線圖) © 2026 Scout System */
var Store={
  get:function(k,d){try{var v=localStorage.getItem('gh_'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem('gh_'+k,JSON.stringify(v))}catch(e){}},
  del:function(k){localStorage.removeItem('gh_'+k)}
};
var App={
  view:'plan',
  init:function(){
    if(!Store.get('settings'))Store.set('settings',{group:'我的旅團',start:'9',dur:'60',startDate:''});
    if(!Store.get('plan'))App.seedPlan();
    if(!Store.get('members'))Store.set('members',[]);
    if(!Store.get('mymeets'))Store.set('mymeets',[]);
    addEventListener('hashchange',function(){App.route()});
    App.route();
  },
  route:function(){
    var h=(location.hash||'#plan').slice(1).split('?')[0];
    if(document.body.contains(document.getElementById('leadroot'))&&!document.getElementById('leadroot').classList.contains('hidden'))Lead.exit(false);
    var v={plan:'plan',meet:'meet',lead:'lead',track:'track',book:'book'}[h]||'plan';
    App.view=v;
    document.querySelectorAll('#tabbar a').forEach(function(a){a.classList.toggle('on',a.dataset.tab===v)});
    var el=document.getElementById('view');
    if(v==='plan')el.innerHTML=Plan.html();
    if(v==='meet')el.innerHTML=Prepare.html();
    if(v==='lead')el.innerHTML=Lead.html();
    if(v==='track')el.innerHTML=Track.html();
    if(v==='book')el.innerHTML=HB.html();
    scrollTo(0,0);
  },
  go:function(h){location.hash=h},
  /* ---- 設定 ---- */
  settings:function(){
    var s=Store.get('settings',{group:'',start:'9',dur:'60'});
    Modal.open('<h3>⚙️ 旅團設定</h3>'+
      '<label class="f">旅團名稱</label><input type="text" id="stG" value="'+esc(s.group)+'" placeholder="例如:第123旅小童軍團">'+
      '<label class="f">開季月份</label><select id="stS">'+['1','2','3','4','5','6','7','8','9','10','11','12'].map(function(m){return '<option value="'+m+'"'+(s.start===m?' selected':'')+'>'+m+'月</option>'}).join('')+'</select>'+
      '<label class="f">恆常集會時長</label><select id="stD">'+['40','60','90','120','180'].map(function(d){return '<option value="'+d+'"'+(s.dur===d?' selected':'')+'>'+d+' 分鐘</option>'}).join('')+'</select>'+
      '<div class="btns" style="margin-top:14px"><button class="btn blk" onclick="App.saveSettings()">儲存</button></div>'+
      '<hr class="soft"><div class="mute" style="font-size:.78rem">🧹 重建年度行事曆會重設規劃表(唔影響團員資料):<br><button class="btn sm ghost" onclick="App.seedPlan(true);Modal.close();toast(\'已重建年度行事曆\')">重建行事曆</button> '+
      '<button class="btn sm ghost rd" style="color:#b71c1c;border-color:#e53935" onclick="if(confirm(\'清除所有本機資料(含團員/集會/規劃)?\')){localStorage.clear();location.reload()}">清除全部資料</button></div>');
  },
  saveSettings:function(){
    var s=Store.get('settings',{});
    s.group=document.getElementById('stG').value||'我的旅團';
    s.start=document.getElementById('stS').value;s.dur=document.getElementById('stD').value;
    Store.set('settings',s);Modal.close();App.route();toast('已儲存 ✓');
  },
  /* ---- 年度規劃種子(跟隨開季月份排22次) ---- */
  seedPlan:function(force){
    if(Store.get('plan')&&!force)return;
    var rows=TPLS.filter(function(t){return t.cat!=='gh'&&t.cat!=='custom'}).map(function(t,i){
      return {no:i+1,tid:t.id,status:'todo',date:''};
    });
    Store.set('plan',{rows:rows,ghdone:[]});
  }
};
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function toast(m){var t=document.createElement('toast');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},1900)}
function dur(n){return TPLS.find(function(t){return t.id===n})}
function matsOf(meet){var a=[];(meet.stages||[]).forEach(function(s){(s.mats||[]).forEach(function(m){if(a.indexOf(m)<0)a.push(m)})});return a}
var Modal={
  open:function(html){document.getElementById('modal').innerHTML='<div class="sheet"><button class="x" onclick="Modal.close()">✕</button>'+html+'</div>'},
  close:function(){document.getElementById('modal').innerHTML=''}
};

/* ================= 規劃 Plan ================= */
var Plan={
  html:function(){
    var s=Store.get('settings'),pl=Store.get('plan'),mem=Store.get('members');
    var next=pl.rows.find(function(r){return r.status==='todo'});
    var done=pl.rows.filter(function(r){return r.status==='done'}).length;
    var nextT=next?dur(next.tid):null;
    var h='<div class="card"><h2>👋 '+esc(s.group)+'</h2>'+
      '<div class="stat"><div class="s"><b>'+(pl.rows.length-done)+'</b>尚餘集會</div><div class="s"><b>'+done+'/'+pl.rows.length+'</b>已完成</div><div class="s"><b>'+mem.length+'</b>團員</div></div>'+
      (nextT?'<hr class="soft"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><b>📅 下次集會</b> '+esc(nextT.n)+'<br><small class="mute">'+esc(nextT.theme)+'・建議 '+nextT.mo+'・約 '+Plan.lenOf(nextT)+' 分鐘</small></div>'+
        '<button class="btn gr" onclick="Lead.start(\''+nextT.id+'\',\''+next.no+'\')">▶ 帶領</button>'+
        '<button class="btn ghost" onclick="App.go(\'#meet\');setTimeout(function(){Prepare.detail(\''+nextT.id+'\')},50)">📄 預覽</button></div>'
      :'<hr class="soft"><div class="empty">🎉 全年集會完成!去「🧩集會」加自訂集會,或者重建行事曆再嚟一季。</div>')+
      '</div>';
    h+='<div class="card"><h2>🗓️ 年度行事曆 <span class="tag">'+done+'/'+pl.rows.length+' 完成</span></h2>'+
      '<div class="mute" style="font-size:.82rem;margin-bottom:8px">跟《小童軒活動指引》首年流程排好:第1–4次玩到攞團員章,之後進步獎章+節日特別集會。撳任何一格可以換範本/記完成。</div>'+
      Plan.calendar(pl)+'</div>';
    h+='<div class="card"><h2>🗺️ 42個月完整路線圖</h2><div class="mute" style="font-size:.82rem">團員章 → 四級進步獎章(約22個月)→ 小草蜢獎章(7範疇×2體驗)→ 晉團幼童軍</div>'+Plan.roadmap()+'</div>';
    h+='<div class="card"><h2>🦗 小草蜢歷險(6歲起)</h2><div class="mute" style="font-size:.82rem;margin-bottom:8px">七大範疇各完成2項體驗=小草蜢獎章。app 已為每個範疇預備一次集會範本。</div><div class="grid2">'+
      DATA.ghDomains.map(function(d,i){var t=TPLS.filter(function(x){return x.cat==='gh'})[i];
        return '<div class="mem"><h4>'+d.ic+' '+d.n+'</h4><small class="mute">範本:'+esc(t.n)+'</small><div class="btns" style="margin:6px 0 0"><button class="btn sm ghost" onclick="App.go(\'#meet\');setTimeout(function(){Prepare.detail(\''+t.id+'\')},50)">查看</button><button class="btn sm" onclick="Lead.start(\''+t.id+'\')">▶</button></div></div>'}).join('')+
      '</div></div>';
    return h;
  },
  lenOf:function(t){return (t.stages||[]).reduce(function(a,s){return a+(+s.m||0)},0)},
  calendar:function(pl){
    var h='<div class="tbl"><tr><th>#</th><th>集會</th><th>狀態</th></tr>';
    pl.rows.forEach(function(r){
      var t=dur(r.tid);if(!t)return;
      var st=r.status==='done'?'<span class="tag g">✓ 完成</span>':r.status==='skip'?'<span class="tag br">跳過</span>':'<span class="tag">未做</span>';
      h+='<tr style="'+(r.status==='todo'?'':'opacity:.75')+'"><td><b>'+r.no+'</b><br><small class="mute">'+t.mo+'</small></td>'+
        '<td><a href="#meet" onclick="event.preventDefault();Prepare.detail(\''+t.id+'\')"><b>'+esc(t.n)+'</b></a><br><small class="mute">'+esc(t.theme)+'</small></td><td>'+st+'</td></tr>';
    });
    return h+'</div><div class="btns"><button class="btn sm ghost" onclick="Plan.markAllDone()">記低呢季完成晒</button></div>';
  },
  markAllDone:function(){var pl=Store.get('plan');if(confirm('將所有未完成集會標記為完成?')){pl.rows.forEach(function(r){r.status='done'});Store.set('plan',pl);App.route()}},
  rowAction:function(no){
    var pl=Store.get('plan');var r=pl.rows.find(function(x){return x.no===no});var t=dur(r.tid);
    Modal.open('<h3>第'+no+'次集會</h3><b>'+esc(t.n)+'</b><div class="mute" style="font-size:.85rem">'+esc(t.theme)+'</div>'+
      '<label class="f">狀態</label><div class="btns">'+
      '<button class="btn sm '+(r.status==='todo'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'todo\')">未做</button>'+
      '<button class="btn sm gr '+(r.status==='done'?'':'ghost')+'" onclick="Plan.setRow('+no+',\'done\')">✓ 完成</button>'+
      '<button class="btn sm ghost" style="color:#4e342e" onclick="Plan.setRow('+no+',\'skip\')">跳過</button></div>'+
      '<label class="f">改用其他範本</label><select onchange="Plan.swap('+no+',this.value)">'+
      TPLS.map(function(x){return '<option value="'+x.id+'"'+(x.id===r.tid?' selected':'')+'>'+esc(x.n)+'</option>'}).join('')+'</select>'+
      '<div class="btns" style="margin-top:12px"><button class="btn gr" onclick="Modal.close();Lead.start(\''+r.tid+'\','+no+')">▶ 帶領呢次</button></div>');
  },
  setRow:function(no,st){var pl=Store.get('plan');pl.rows.find(function(x){return x.no===no}).status=st;Store.set('plan',pl);
    if(st==='done')Track.attendPrompt(no);else{Modal.close();App.route()}},
  swap:function(no,tid){var pl=Store.get('plan');pl.rows.find(function(x){return x.no===no}).tid=tid;Store.set('plan',pl);toast('已換範本');Modal.close();App.route()},
  roadmap:function(){
    var mem=Store.get('members');
    var avgStep=mem.length?Math.round(mem.reduce(function(a,m){return a+(m.step||0)},0)/mem.length):0;
    var stops=[
      {t:'👑 團員章',d:'參加4次集會+完成基本常識(唱主題歌/揚動快樂傘/整理領巾)、誓詞規律口號、保護自己',mo:'第1–2個月',ok:mem.length&&mem.every(function(m){return Track.memberDone(m)})},
      {t:'🔴 進步獎章・第一步',d:'參加約5-6個月',mo:'第6個月',ok:avgStep>=1},
      {t:'🟤 進步獎章・第二步',d:'參加約11-12個月',mo:'第12個月',ok:avgStep>=2},
      {t:'🔵 進步獎章・第三步',d:'參加約16-18個月',mo:'第18個月',ok:avgStep>=3},
      {t:'🟢 進步獎章・第四步',d:'參加約22個月',mo:'第22個月',ok:avgStep>=4},
      {t:'🦗 小草蜢獎章',d:'6歲起開展,七大範疇各2項體驗(每範疇可獲體驗證書),約18個月完成',mo:'第22–40個月',ok:mem.length&&mem.every(function(m){return Track.ghDone(m)})},
      {t:'🎒 晉團幼童軍',d:'8歲生日,展開新旅程',mo:'第40個月+',ok:false}
    ];
    return '<div class="road">'+stops.map(function(s){return '<div class="stop'+(s.ok?' done':'')+'"><b>'+s.t+'</b> <span class="tag">'+s.mo+'</span><br><small class="mute">'+s.d+'</small></div>'}).join('')+'</div>';
  }
};
