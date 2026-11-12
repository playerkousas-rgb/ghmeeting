/* 🦗 track.js — 團員名單、團員章/進步獎章/小草蜢進度、出席、匯出 © 2026 Scout System */
var Track={
  html:function(){
    var mem=Store.get('members',[])||[];
    var h='<div class="card"><h1>🏅 記錄（追蹤進度）</h1><div class="mute" style="font-size:.85rem">邊個團員章過咗幾多關、進步獎章去到第幾步、小草蜢七範疇體驗進度——唔使再靠記憶。資料只存喺你部裝置。</div>'+
      '<div class="btns" style="margin-top:10px"><button class="btn" onclick="Track.add()">➕ 加團員</button>'+
      '<button class="btn ghost" onclick="Track.export()">📤 匯出報告</button></div>'+
      '<div class="stat" style="margin-top:8px"><div class="s"><b>'+mem.length+'</b>團員</div>'+
      '<div class="s"><b>'+mem.filter(function(m){return Track.memberDone(m)}).length+'</b>已得團員章</div>'+
      '<div class="s"><b>'+mem.filter(Track.ghDone).length+'</b>小草蜢完成</div></div></div>';
    if(!mem.length){h+='<div class="card"><div class="empty">未有團員。撳上面「➕ 加團員」加入名單,<br>帶領模式嘅點名抽籤、分組、進度追蹤即刻用得。</div></div>';return h}
    h+='<h2>👥 團員 <span class="tag">'+mem.length+' 人</span></h2>';
    h+='<div class="badgegrid">'+mem.map(function(m,i){return Track.card(m,i)}).join('')+'</div>';
    h+='<div class="card"><h2>🗓️ 出席紀錄</h2>'+Track.records()+'</div>';
    return h;
  },
  card:function(m,i){
    var bi=m.badge||{};
    var memPct=Math.round(DATA.badgeItems.filter(function(b){return bi[b.k]}).length/DATA.badgeItems.length*100);
    var step=m.step||0;
    var ghDone=DATA.ghDomains.filter(function(d,i2){return (m.gh&&m.gh[i2]||0)>=2}).length;
    return '<div class="mem"><h3>'+esc(m.n)+' <small class="mute">'+esc(m.bday||'')+'</small></h3>'+
      '<div class="progbar"><i style="width:'+memPct+'%"></i></div><small class="mute">團員章 '+memPct+'%・出席 '+Track.attCount(m)+' 次</small>'+
      '<div style="margin:8px 0 4px"><b style="font-size:.85rem">團員章</b></div>'+
      DATA.badgeItems.map(function(b){var inf=Kit.badgeInfo(b.k);var on=Track.itemDone(m,b.k);var auto=b.k==='attend';
        return '<div class="chk" style="font-size:.8rem;padding:3px 0">'+(auto?'<span class="dot'+(on?' on':'')+'" title="出席自動計數，唔使自己剔"></span>':'<button type="button" class="dot'+(on?' on':'')+'" aria-pressed="'+(on?'true':'false')+'" aria-label="'+esc(b.t)+'" onclick="Track.tog('+i+',\''+b.k+'\')"></button>')+b.t+
        (auto?'<small class="mute" style="margin-left:5px">'+Track.attCount(m)+'/4 次（自動）</small>':'')+
        (on||!inf?'':'<small class="badge-where">📍 '+esc(inf.where)+(inf.link?' <button class="lnk" onclick="'+inf.link+'">▶ 即刻開</button>':'')+'</small>')+'</div>'}).join('')+
      '<div class="mute" style="font-size:.72rem;margin:2px 0 0">👆 未剔嘅項會顯示「去邊度教・即刻開」；剔咗即當作過關（資料只存喺你部機）。</div>'+
      '<div style="margin:8px 0 4px"><b style="font-size:.85rem">進步獎章</b></div><div class="btns">'+
      DATA.steps.map(function(s,si){return '<button type="button" class="pill'+(step>si?' on':'')+'" aria-pressed="'+(step>si?'true':'false')+'" onclick="Track.step('+i+','+(si+1)+')">'+s.n+'</button>'}).join('')+'</div>'+
      '<div style="margin:8px 0 4px"><b style="font-size:.85rem">🦗 小草蜢 '+ghDone+'/7</b></div>'+
      DATA.ghDomains.map(function(d,gi){var c=m.gh&&m.gh[gi]||0;var g=Kit.ghMap[gi];
        return '<div class="chk" style="font-size:.8rem;padding:3px 0">'+d.ic+' '+d.n+' '+
        (c?'':'<small class="badge-where">💡 '+(g?esc(g.sug):'')+'</small>')+
        '<span style="margin-left:auto">'+[0,1].map(function(x){return '<button type="button" class="dot'+(c>x?' on':'')+'" aria-pressed="'+(c>x?'true':'false')+'" aria-label="'+esc(d.n)+' 體驗 '+(x+1)+'" onclick="Track.gh('+i+','+gi+')"></button>'}).join('')+'</span></div>'}).join('')+
      '<div class="btns" style="margin-top:6px"><button class="btn sm ghost" onclick="Track.edit('+i+')">✏️</button>'+
      '<button class="btn sm ghost rd" style="color:#b71c1c;border-color:#e53935" onclick="Track.del('+i+')">🗑️</button></div></div>';
  },
  attCount:function(m){var recs=Store.get('recs',[]);return recs.filter(function(r){return (r.present||[]).indexOf(m.id)>=0}).length},
  itemDone:function(m,k){if(k==='attend')return Track.attCount(m)>=4;var bi=m.badge||{};return !!bi[k]},
  memberDone:function(m){return DATA.badgeItems.every(function(b){return Track.itemDone(m,b.k)})},
  /* 今場會自動計入邊啲範疇／章項（環節有標記，唔使自己記） */
  meetMarks:function(t){
    var gh={},bd={};
    ((t&&t.stages)||[]).forEach(function(s){if(s.gh!==undefined&&s.gh!==null)gh[s.gh]=1;if(s.badge)bd[s.badge]=1});
    return {gh:Object.keys(gh).map(Number),badge:Object.keys(bd)};
  },
  ghDone:function(m){return m.gh&&DATA.ghDomains.every(function(_,i){return (m.gh[i]||0)>=2})},
  tog:function(i,k){var mem=Store.get('members');mem[i].badge=mem[i].badge||{};mem[i].badge[k]=!mem[i].badge[k];if(!Store.set('members',mem))return;Sfx.ding();App.route()},
  step:function(i,v){var mem=Store.get('members');mem[i].step=(mem[i].step===v?0:v);if(!Store.set('members',mem))return;App.route()},
  gh:function(i,gi){var mem=Store.get('members',[])||[];var m=mem[i];if(!m)return;m.gh=m.gh||[];
    var auto=Track.autoGh(m,Store.get('recs',[])||[]);
    var next=((m.gh[gi]||0)+1)%3;m.gh[gi]=next;
    m.ghBase=m.ghBase||[];m.ghBase[gi]=Math.max(0,next-(auto[gi]||0));
    if(!Store.set('members',mem))return;Sfx.pop();App.route()},
  add:function(){
    Modal.open('<h3>➕ 加團員</h3><label class="f">姓名</label><input type="text" id="mN" placeholder="例如:陳小明">'+
      '<label class="f">出生日期(選填,計算8歲晉團)</label><input type="date" id="mB">'+
      '<label class="f">加入日期</label><input type="date" id="mJ" value="'+new Date().toISOString().slice(0,10)+'">'+
      '<div class="btns" style="margin-top:12px"><button class="btn" onclick="Track.saveAdd()">加入</button></div>');
  },
  saveAdd:function(){
    var n=document.getElementById('mN').value.trim();if(!n){toast('填個名先');return}
    var mem=Store.get('members');
    mem.push({id:'p'+Date.now()+Math.floor(Math.random()*99),n:n,bday:document.getElementById('mB').value,join:document.getElementById('mJ').value,badge:{},step:0,gh:[]});
    if(!Store.set('members',mem))return;Modal.close();App.route();toast('已加入 '+n);
  },
  edit:function(i){
    var mem=Store.get('members');var m=mem[i];
    Modal.open('<h3>✏️ '+esc(m.n)+'</h3><label class="f">姓名</label><input type="text" id="mN" value="'+esc(m.n)+'">'+
      '<label class="f">出生日期</label><input type="date" id="mB" value="'+(m.bday||'')+'">'+
      '<div class="btns" style="margin-top:12px"><button class="btn" onclick="Track.saveEdit('+i+')">儲存</button></div>');
  },
  saveEdit:function(i){var mem=Store.get('members');mem[i].n=document.getElementById('mN').value.trim()||mem[i].n;mem[i].bday=document.getElementById('mB').value;if(!Store.set('members',mem))return;Modal.close();App.route()},
  del:function(i){var mem=Store.get('members');if(confirm('移除 '+mem[i].n+'?')){mem.splice(i,1);if(!Store.set('members',mem))return;App.route()}},
  /* ---- 出席 ---- */
  attendPrompt:function(no){
    var pl=Store.get('plan',{rows:[]})||{rows:[]};var r=(pl.rows||[]).find(function(x){return x.no===no});var t=(r&&dur(r.tid))||{id:'',n:'（未知集會）',stages:[]};
    var mem=Store.get('members',[])||[];
    /* 未有名單：唔好死路——俾佢照樣標記完成（出席之後先補），或者先去加名單 */
    if(!mem.length){
      Modal.open('<h3>📝 第'+no+'次集會完成</h3><div class="mute" style="font-size:.85rem">'+esc(t.n)+'</div>'+
        '<div class="attention" style="margin:8px 0">未有團員名單，記唔到出席。想先記低呢場完成？</div>'+
        '<div class="btns"><button class="btn gr" onclick="Modal.close();Track.doneNoRoster('+no+')">✓ 標記完成（出席之後先補）</button>'+
        '<button class="btn ghost" onclick="Modal.close();App.go(\'#track\')">🏅 先去加團員名單</button></div>');
      return;
    }
    Modal.open('<h3>📝 第'+no+'次集會完成</h3><div class="mute" style="font-size:.85rem">'+esc(t.n)+'</div>'+
      '<label class="f">邊個有出席?(全體預設✓,撳一下取消)</label>'+
      mem.map(function(m,i){return '<div class="chk"><button type="button" class="dot on" id="at'+esc(m.id)+'" aria-pressed="true" aria-label="'+esc(m.n)+' 出席" onclick="this.classList.toggle(\'on\');this.setAttribute(\'aria-pressed\',this.classList.contains(\'on\')?\'true\':\'false\')"></button>'+esc(m.n)+'</div>'}).join('')+
      (function(){var mk=Track.meetMarks(t);
        return (mk.gh.length?'<div class="attention" style="margin:8px 0"><b>🦗 今場玩完會自動計入</b> '+mk.gh.map(function(g){var d=DATA.ghDomains[g];return d?(d.ic+' '+d.n):''}).filter(function(x){return x}).join('、')+'（每場每範疇加 1 次，2 次即完成）</div>':'')})()+
      '<label class="f">完成咗嘅團員章項目(會自動落入出席者度)</label>'+
      t.stages.filter(function(s){return s.badge}).map(function(s){var bi=DATA.badgeItems.find(function(b){return b.k===s.badge})||{t:s.badge};return '<div class="chk"><button type="button" class="dot" id="bg'+esc(s.badge)+'" aria-pressed="false" aria-label="'+esc(bi.t)+'" onclick="this.classList.toggle(\'on\');this.setAttribute(\'aria-pressed\',this.classList.contains(\'on\')?\'true\':\'false\')"></button>'+esc(bi.t)+'</div>'}).join('')+
      '<div class="btns" style="margin-top:12px"><button class="btn gr" onclick="Track.saveAttend('+no+')">✓ 儲存紀錄</button></div>');
  },
  /* 未有名單照樣收場：集會標完成＋嚮導記 ✓，出席紀錄留返加名單後補 */
  doneNoRoster:function(no){
    var pl=Store.get('plan',{rows:[]})||{rows:[]};var r=(pl.rows||[]).find(function(x){return x.no===no});if(!r)return;
    var t=dur(r.tid)||{id:'',stages:[]};
    var recs=(Store.get('recs',[])||[]).filter(function(x){return x.no!==no});
    recs.push({no:no,tid:r.tid,date:new Date().toISOString().slice(0,10),present:[],badges:[],gh:[],noroster:1});
    var snap={plan:localStorage.getItem('gh_plan'),recs:localStorage.getItem('gh_recs')};
    r.status='done';
    if(!Store.set('plan',pl)||!Store.set('recs',recs)){Track._rollback(snap);return}
    if(typeof Flow!=='undefined')Flow.mark('rec',1);
    if(typeof Kit!=='undefined'&&Kit.ckClear)Kit.ckClear(t.id);
    App.route();
    toast('✓ 第'+no+'次已標完成 — 加咗名單之後先補出席');
  },
  /* F6：同一 no 重save＝取代（upsert），出席／小草蜢唔會重複計；失敗回滾三个 key */
  autoGh:function(m,recs){
    var a=[];
    (recs||[]).forEach(function(r){
      if((r.present||[]).indexOf(m.id)<0)return;
      (r.gh||[]).forEach(function(g){a[g]=(a[g]||0)+1});
    });
    return a.map(function(x){return Math.min(2,x||0)});
  },
  _rollback:function(snap){
    Object.keys(snap).forEach(function(k){try{if(snap[k]===null)localStorage.removeItem('gh_'+k);else localStorage.setItem('gh_'+k,snap[k])}catch(e){}});
    toast('儲存失敗—已還原原本紀錄 ✗');
  },
  saveAttend:function(no){
    var pl=Store.get('plan',{rows:[]})||{rows:[]};var r=(pl.rows||[]).find(function(x){return x.no===no});
    var t=(r&&dur(r.tid))||{id:r?r.tid:'',n:'（未知集會）',stages:[]};
    var mem=Store.get('members',[])||[];
    var present=mem.filter(function(m){var e=document.getElementById('at'+m.id);return e&&e.classList.contains('on')}).map(function(m){return m.id});
    var badges=(t.stages||[]).filter(function(s){return s.badge&&document.getElementById('bg'+s.badge)&&document.getElementById('bg'+s.badge).classList.contains('on')}).map(function(s){return s.badge});
    var marks=Track.meetMarks(t),ghs=marks.gh.filter(function(g){return !!DATA.ghDomains[g]});
    badges=badges.concat(marks.badge.filter(function(b){return badges.indexOf(b)<0}));
    var wasDone=mem.map(Track.memberDone),wasGh=mem.map(Track.ghDone);
    var oldRecs=Store.get('recs',[])||[];
    var recs=oldRecs.filter(function(x){return x.no!==no});
    recs.push({no:no,tid:r?r.tid:'',date:new Date().toISOString().slice(0,10),present:present,badges:badges,gh:ghs});
    mem.forEach(function(m){
      if(m.ghBase===undefined){var oldAuto=Track.autoGh(m,oldRecs);m.ghBase=(m.gh||[]).map(function(v,i){return Math.max(0,(v||0)-(oldAuto[i]||0))})}
      var auto=Track.autoGh(m,recs);
      m.gh=DATA.ghDomains.map(function(_,i){return Math.min(2,(m.ghBase[i]||0)+(auto[i]||0))});
      if(present.indexOf(m.id)<0)return;
      m.badge=m.badge||{};badges.forEach(function(b){m.badge[b]=true});
      if(Track.attCount(m)>=4)m.badge.attend=true;
    });
    var snap={plan:localStorage.getItem('gh_plan'),recs:localStorage.getItem('gh_recs'),members:localStorage.getItem('gh_members')};
    if(r)r.status='done';
    if((r&&!Store.set('plan',pl))||!Store.set('recs',recs)||!Store.set('members',mem)){Track._rollback(snap);return}
    if(typeof Flow!=='undefined')Flow.mark('rec',1);
    if(typeof Kit!=='undefined'&&Kit.ckClear)Kit.ckClear(t.id);
    var newMem=mem.filter(function(m,i){return !wasDone[i]&&Track.memberDone(m)});
    var newGh=mem.filter(function(m,i){return !wasGh[i]&&Track.ghDone(m)});
    Modal.close();App.route();
    if(newMem.length){Sfx.fanfare();toast('🎉 '+newMem.map(function(m){return m.n}).slice(0,3).join('、')+(newMem.length>1?' 等 '+newMem.length+' 位':'')+' 團員章齊晒！')}
    else if(newGh.length){Sfx.fanfare();toast('🎉 '+newGh.length+' 位完成小草蜢七大範！')}
    else toast('已記錄:出席'+present.length+'人'+(ghs.length?'・🦗 自動計入 '+ghs.length+' 個範疇':''));
  },
  records:function(){
    var recs=Store.get('recs',[])||[];var mem=Store.get('members',[])||[];
    if(!recs.length)return '<div class="empty">完成集會時撳「✓ 記錄完成」就會自動出紀錄。</div>';
    var h='<div class="tbl"><tr><th>日期</th><th>集會</th><th>出席</th></tr>';
    recs.slice().reverse().forEach(function(r){
      var t=dur(r.tid);var names=(r.present||[]).map(function(id){var m=mem.find(function(x){return x.id===id});return m?m.n:'?'}).join('、');
      h+='<tr><td>'+esc(r.date||'')+'</td><td>'+(t?esc(t.n):'?')+'</td><td>'+(r.present||[]).length+'人<br><small class="mute">'+esc(names)+'</small></td></tr>';
    });
    return h+'</div>';
  },
  export:function(){
    var mem=Store.get('members',[])||[],recs=Store.get('recs',[])||[];
    if(!mem.length){toast('未有團員資料');return}
    var L=['🦗 小童軍進度報告('+new Date().toLocaleDateString('zh-HK')+')',''];
    mem.forEach(function(m){
      var items=DATA.badgeItems.map(function(b){return (Track.itemDone(m,b.k)?'✓':'✗')+b.t}).join(' ');
      var step=m.step?DATA.steps[m.step-1].n:'未開始';
      var gh=m.gh?DATA.ghDomains.map(function(d,i){return d.n+':'+(m.gh[i]||0)+'/2'}).join(' '):'';
      L.push('◆ '+m.n+(Track.memberDone(m)?' [團員章✓]':'')+' | 出席'+Track.attCount(m)+'次 | 進步獎章:'+step);
      L.push('  團員章:'+items);
      if(gh)L.push('  小草蜢:'+gh);
      L.push('');
    });
    L.push('集會紀錄:'+recs.length+'次');
    L.push('— 小童軍集會助手 '+App.legalLine());
    var txt=L.join('\n');
    var blob=new Blob(['\ufeff'+txt],{type:'text/plain;charset=utf-8'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='小童軍進度報告.txt';a.click();
    /* 下載一定已觸發；只有 Clipboard API 真正成功先可以話「已複製」。 */
    if(navigator.clipboard&&navigator.clipboard.writeText){
      return navigator.clipboard.writeText(txt).then(function(){toast('已下載報告（並複製咗一份）');return true},function(){toast('已下載報告（未能複製）');return false});
    }
    toast('已下載報告（未能複製）');return Promise.resolve(false);
  }
};
