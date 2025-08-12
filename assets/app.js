
const $ = (sel, ctx=document)=>ctx.querySelector(sel);
const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));

const i18n = {
  zh: {
    app_title: "Lucky Numbers — 南非原型",
    nav_lobby: "大廳",
    nav_active: "我的投注",
    nav_history: "我的注單",
    nav_betslip: "暫存注單",
    filters_all: "全部",
    filters_hf: "高頻 (5/10分)",
    filters_mf: "中頻 (30/60分)",
    filters_df: "每日",
    badge_open: "開放",
    badge_closed: "封盤 (截單)",
    next_draw_in: "距下期",
    details: "詳情",
    bet: "投注",
    numbers: (n)=>`號碼 (1–${n})`,
    quick_hot: "熱門",
    quick_cold: "冷門",
    quick_rand: "隨機",
    quick_clear: "清除",
    quick_base_mock: "基於最近20期（模擬）",
    markets: "玩法",
    m1: "猜 1 球",
    m2: "猜 2 球",
    m3: "猜 3 球",
    m4: "猜 4 球",
    bonus: "特別號",
    odd_even: "單雙",
    hi_lo: "大小",
    sum_range: "總和值",
    stake: "金額 (R)",
    apply_multi: "套用到多彩種",
    same_model: (m)=>`相同型別：${m}，可勾選以下彩種`,
    add_to_slip: "加入注單",
    slip_title: "暫存注單",
    total_stakes: "合計金額：",
    submit_all: "送出全部投注",
    draw_in: "開獎倒數：",
    closed_cutoff: "封盤 (截單)",
    open_status: "開放",
    fix_select_target: "請至少勾選一個目標彩種",
    toast_added: (n)=>`已加入 ${n} 筆到注單`,
    toast_removed: (name)=>`已刪除 ${name}`,
    toast_next: "已移動到下一期",
    toast_fix: (n)=>`請修正 ${n} 筆（封盤或未填金額）`,
    toast_submitted: "投注已送出！",
    active_empty: "目前沒有等待中的投注 — 回大廳看看",
    history_empty: "尚無結算紀錄",
    payout: "派彩",
    move_next: "⟳ 下一期",
    edit: "✎ 編輯",
    del: "🗑 刪除"
  },
  en: {
    app_title: "Lucky Numbers — SA Prototype",
    nav_lobby: "Lobby",
    nav_active: "Active Bets",
    nav_history: "Bet History",
    nav_betslip: "Bet Slip",
    filters_all: "All",
    filters_hf: "High Freq (5/10m)",
    filters_mf: "Medium (30/60m)",
    filters_df: "Daily",
    badge_open: "Open",
    badge_closed: "Closed (cutoff)",
    next_draw_in: "Next draw in",
    details: "Details",
    bet: "Bet",
    numbers: (n)=>`Numbers (1–${n})`,
    quick_hot: "Hot",
    quick_cold: "Cold",
    quick_rand: "Random",
    quick_clear: "Clear",
    quick_base_mock: "Based on last 20 draws (mock)",
    markets: "Markets",
    m1: "1 Ball",
    m2: "2 Balls",
    m3: "3 Balls",
    m4: "4 Balls",
    bonus: "Bonus Ball (if applicable)",
    odd_even: "Odd/Even",
    hi_lo: "Hi/Lo",
    sum_range: "Sum Range",
    stake: "Stake (R)",
    apply_multi: "Apply to multiple games",
    same_model: (m)=>`Same model: ${m}. Select targets below.`,
    add_to_slip: "Add to Bet Slip",
    slip_title: "Bet Slip (Pending)",
    total_stakes: "Total Stakes:",
    submit_all: "Submit All Bets",
    draw_in: "Draw in:",
    closed_cutoff: "Closed (cutoff)",
    open_status: "Open",
    fix_select_target: "Select at least one target game",
    toast_added: (n)=>`Added ${n} bet${n>1?'s':''} to slip`,
    toast_removed: (name)=>`Removed ${name}`,
    toast_next: "Moved to next draw window",
    toast_fix: (n)=>`Please fix ${n} item(s) (closed or missing stake)`,
    toast_submitted: "Bets submitted!",
    active_empty: "No active bets — go to Lobby",
    history_empty: "No history yet.",
    payout: "Payout",
    move_next: "⟳ Move to next draw",
    edit: "✎ Edit",
    del: "🗑 Delete"
  }
};

const state = {
  lang: localStorage.getItem('ln_lang') || 'zh',
  games: [],
  slip: [],
  active: [],
  history: [],
  filter: 'all'
};

function t(key, ...args){
  const pack = i18n[state.lang];
  const v = pack[key];
  if (typeof v === 'function') return v(...args);
  return v || key;
}
function setLang(lang){
  state.lang = lang;
  localStorage.setItem('ln_lang', lang);
  refreshChrome();
  renderRoute();
}

const LS_KEYS = { SLIP:'ln_sa_slip_v1', HIST:'ln_sa_hist_v1' };
function saveSlip(){ localStorage.setItem(LS_KEYS.SLIP, JSON.stringify(state.slip)); }
function loadSlip(){ try{ state.slip = JSON.parse(localStorage.getItem(LS_KEYS.SLIP)||'[]'); }catch(e){ state.slip=[]; } }
function saveHistory(){ localStorage.setItem(LS_KEYS.HIST, JSON.stringify(state.history)); }
function loadHistory(){ try{ state.history = JSON.parse(localStorage.getItem(LS_KEYS.HIST)||'[]'); }catch(e){ state.history=[]; } }

function toast(msg, type='ok', ttl=3000){
  const host = $('#toasts'); if(!host) return;
  const tdiv = document.createElement('div');
  tdiv.className = `toast ${type}`; tdiv.textContent = msg;
  host.appendChild(tdiv);
  setTimeout(()=>{ tdiv.style.opacity='0'; }, ttl-300);
  setTimeout(()=>{ tdiv.remove(); }, ttl);
}

function computeNextDraw(freq) {
  const now = new Date();
  let next = new Date(now);
  if (freq === '5m') next.setMinutes(Math.floor(now.getMinutes()/5)*5 + 5, 0, 0);
  else if (freq === '10m') next.setMinutes(Math.floor(now.getMinutes()/10)*10 + 10, 0, 0);
  else if (freq === '30m') next.setMinutes(now.getMinutes()<30?30:60, 0, 0);
  else if (freq === '60m') next.setHours(now.getMinutes()===0 ? now.getHours() : now.getHours()+1, 0, 0, 0);
  else if (freq === 'daily2') {
    const slots = [14*60+30, 20*60+30]; const mins = now.getHours()*60 + now.getMinutes();
    const cand = slots.find(m => m > mins);
    if (cand!==undefined) { const h = Math.floor(cand/60), m = cand%60; next.setHours(h, m, 0, 0); }
    else { next.setDate(now.getDate()+1); next.setHours(14,30,0,0); }
  } else if (freq === 'daily') { const t = new Date(now); t.setHours(21,0,0,0); if (t<=now) t.setDate(t.getDate()+1); next=t; }
  else next.setMinutes(now.getMinutes()+5,0,0);
  return next.getTime();
}
function fmtCountdown(ts){ const s=Math.max(0,Math.floor((ts-Date.now())/1000)); const mm=String(Math.floor(s/60)).padStart(2,'0'); const ss=String(s%60).padStart(2,'0'); return `${mm}:${ss}`; }
function countdownClass(ts){ const s = Math.floor((ts-Date.now())/1000); if(s<=20) return 'danger'; if(s<=60) return 'warn'; return ''; }
function isClosed(ts){ return (ts - Date.now()) <= 60000; }

function rangeOfModel(model){ if(model==='49-6B'||model==='49-7') return 49; if(model==='36-5') return 36; return 49; }
function kOfModel(model){ if(model==='49-6B') return 7; if(model==='49-7') return 7; if(model==='36-5') return 5; return 6; }
function pickDistinct(n,k){ const a=Array.from({length:n},(_,i)=>i+1); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a.slice(0,k).sort((a,b)=>a-b); }
function getHistory(code, model){ const key=`ln_hist_${code}`; let hist; try{ hist=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ hist=[]; } if(!hist||hist.length<20){ const N=rangeOfModel(model); const K=kOfModel(model); hist=Array.from({length:20},()=>pickDistinct(N,K)); localStorage.setItem(key, JSON.stringify(hist)); } return hist; }
function hotColdSelect(game, want='hot', count=3){ const hist=getHistory(game.code, game.model); const N=rangeOfModel(game.model); const freq=Array.from({length:N+1},()=>0); hist.forEach(d=>d.forEach(n=>freq[n]++)); const ent=[]; for(let i=1;i<=N;i++){ ent.push({n:i,c:freq[i]}); } ent.sort((a,b)=> want==='hot' ? (b.c-a.c || a.n-b.n) : (a.c-b.c || a.n-b.n)); return ent.slice(0,count).map(e=>e.n).sort((a,b)=>a-b); }

async function loadGames(){ const res = await fetch('data/games.json'); const arr = await res.json(); state.games = arr.map(g=>({...g, nextDrawAt: computeNextDraw(g.freq)})); state.gameMap = Object.fromEntries(state.games.map(g=>[g.code,g])); }

function refreshChrome(){
  $('#title').textContent = t('app_title');
  $('#nav-lobby').textContent = t('nav_lobby');
  $('#nav-active').textContent = t('nav_active');
  $('#nav-history').textContent = t('nav_history');
  $('#slip-title').textContent = t('slip_title');
  $('#total-stakes-label').textContent = t('total_stakes');
  $('#submit-bets').textContent = t('submit_all');
  $('#lang-toggle').textContent = (state.lang==='zh' ? 'EN' : '中');
  // Bet Slip badge text updated elsewhere with count
  updateSlipBadge();
}

function renderLobby(){
  const container = document.createElement('div');
  container.innerHTML = `
    <section>
      <div class="filters">
        <button class="filter ${state.filter==='all'?'active':''}" data-f="all">${t('filters_all')}</button>
        <button class="filter ${state.filter==='hf'?'active':''}" data-f="hf">${t('filters_hf')}</button>
        <button class="filter ${state.filter==='mf'?'active':''}" data-f="mf">${t('filters_mf')}</button>
        <button class="filter ${state.filter==='df'?'active':''}" data-f="df">${t('filters_df')}</button>
      </div>
      <div class="grid cols-4" id="game-grid"></div>
    </section>
  `;
  const grid = $('#game-grid', container);
  const filt = (g)=> state.filter==='all' ? true : state.filter==='hf' ? (g.freq==='5m'||g.freq==='10m') : state.filter==='mf' ? (g.freq==='30m'||g.freq==='60m') : (g.freq==='daily'||g.freq==='daily2');

  state.games.filter(filt).forEach(g=>{
    const card = document.createElement('div'); card.className='card';
    const closed = isClosed(g.nextDrawAt);
    const nameMain = state.lang==='zh' ? g.name : g.name_en;
    const nameSub = state.lang==='zh' ? g.name_en : g.name;
    card.innerHTML = `
      <div class="title">${nameMain} <span class="small">(${nameSub})</span></div>
      <div class="badges">
        <span class="badge">${g.model}</span>
        <span class="badge">${g.range} • draw ${g.draw}</span>
        <span class="badge">${badgeForFreq(g.freq)}</span>
        <span class="badge ${closed?'closed':''}" data-closed="${g.code}">${closed?t('badge_closed'):t('badge_open')}</span>
      </div>
      <div class="row">
        <span class="muted">${t('next_draw_in')}</span>
        <strong class="countdown" data-code="${g.code}">--:--</strong>
      </div>
      <div class="footer-actions">
        <button class="btn" data-open="${g.code}">${t('details')}</button>
        <button class="btn primary" data-bet="${g.code}">${t('bet')}</button>
      </div>
    `;
    grid.appendChild(card);
  });

  $$('.filter', container).forEach(btn=>btn.addEventListener('click', e=>{ state.filter=e.target.dataset.f; route('#/lobby'); }));
  grid.addEventListener('click', (e)=>{ const code = e.target.dataset.open || e.target.dataset.bet; if(!code) return; openBetPanel(state.games.find(x=>x.code===code)); });

  $('#app').innerHTML = ''; $('#app').appendChild(container); startTick();
}

let tickTimer;
function startTick(){
  if (tickTimer) clearInterval(tickTimer);
  function tick(){
    state.games.forEach(g=>{
      const el=$(`.countdown[data-code="${g.code}"]`); const st=$(`.badge[data-closed="${g.code}"]`);
      if(!el||!st) return;
      el.textContent=fmtCountdown(g.nextDrawAt);
      el.classList.remove('warn','danger'); const cls=countdownClass(g.nextDrawAt); if(cls) el.classList.add(cls);
      const closed=isClosed(g.nextDrawAt); st.textContent=closed?t('badge_closed'):t('badge_open'); st.classList.toggle('closed', closed);
      if(Date.now()>=g.nextDrawAt){ g.nextDrawAt=computeNextDraw(g.freq); }
    });
  }
  tick(); tickTimer=setInterval(tick,1000);
}
function badgeForFreq(freq){ return ({'5m':'Every 5m','10m':'Every 10m','30m':'Every 30m','60m':'Hourly','daily2':'Twice Daily','daily':'Daily'})[freq]||freq; }

function openBetPanel(game){
  $('#modal-title').textContent = state.lang==='zh' ? `${game.name} (${game.name_en})` : `${game.name_en} (${game.name})`;
  const body = $('#modal-body'); body.innerHTML='';
  const max = rangeOfModel(game.model);
  const panelLeft = document.createElement('div'); panelLeft.className='panel';
  panelLeft.innerHTML = `
    <h4>${t('numbers', max)}</h4>
    <div class="row">
      <button id="qp-hot" class="btn">${t('quick_hot')}</button>
      <button id="qp-cold" class="btn">${t('quick_cold')}</button>
      <button id="qp-rand" class="btn">${t('quick_rand')}</button>
      <button id="qp-clear" class="btn">${t('quick_clear')}</button>
      <span class="small">${t('quick_base_mock')}</span>
    </div>
    <div class="num-grid" id="num-grid"></div>`;
  const grid = $('#num-grid', panelLeft); const selected=new Set();
  for(let i=1;i<=max;i++){ const n=document.createElement('div'); n.className='num'; n.textContent=i; n.addEventListener('click',()=>{ if(selected.has(i)){selected.delete(i); n.classList.remove('selected');} else {selected.add(i); n.classList.add('selected');} }); grid.appendChild(n); }

  const panelRight = document.createElement('div'); panelRight.className='panel';
  const closed=isClosed(game.nextDrawAt);
  panelRight.innerHTML = `
    <h4>${t('markets')}</h4>
    <div class="row">
      <label><input type="radio" name="mkt" value="1-balls" checked> ${t('m1')}</label>
      <label><input type="radio" name="mkt" value="2-balls"> ${t('m2')}</label>
      <label><input type="radio" name="mkt" value="3-balls"> ${t('m3')}</label>
      <label><input type="radio" name="mkt" value="4-balls"> ${t('m4')}</label>
    </div>
    <div class="row">
      <label><input type="checkbox" id="m-bonus"> ${t('bonus')}</label>
      <label><input type="checkbox" id="m-odd"> ${t('odd_even')}</label>
      <label><input type="checkbox" id="m-hi"> ${t('hi_lo')}</label>
      <label><input type="checkbox" id="m-sum"> ${t('sum_range')}</label>
    </div>
    <div class="row">
      <label>${t('stake')}: <input id="stake" type="number" min="1" step="1" value="10"></label>
      <span class="muted">${t('next_draw_in')} <strong class="countdown ${countdownClass(game.nextDrawAt)}">${fmtCountdown(game.nextDrawAt)}</strong></span>
      <span class="badge ${closed?'closed':''}">${closed?t('closed_cutoff'):t('open_status')}</span>
    </div>
    <h4>${t('apply_multi')}</h4>
    <div class="row small muted">${t('same_model', game.model)}</div>
    <div id="compat" class="panel" style="max-height:180px; overflow:auto;"></div>
    <div class="row" style="justify-content:flex-end;">
      <button id="add-slip" class="btn success" ${closed?'disabled':''}>${t('add_to_slip')}</button>
    </div>`;

  const compat = $('#compat', panelRight);
  state.games.filter(g=>g.model===game.model).forEach(g2=>{
    const wrap=document.createElement('label'); wrap.style.display='flex'; wrap.style.alignItems='center'; wrap.style.gap='8px'; wrap.style.margin='4px 0';
    const nm = state.lang==='zh' ? g2.name_en : g2.name_en; // show English in list for clarity
    wrap.innerHTML=`<input type="checkbox" value="${g2.code}" ${g2.code===game.code?'checked':''}> <span>${nm}</span> <span class="small muted">(${badgeForFreq(g2.freq)})</span>`;
    compat.appendChild(wrap);
  });

  body.appendChild(panelLeft); body.appendChild(panelRight);

  function requiredCount(){ const val=($$('input[name="mkt"]')).find(x=>x.checked).value; return parseInt(val,10)||1; }
  function setSelected(nums){ selected.clear(); $$('.num', grid).forEach(n=>n.classList.remove('selected')); nums.forEach(v=>{ selected.add(v); const el=$$('.num',grid)[v-1]; if(el) el.classList.add('selected'); }); }
  $('#qp-hot').onclick = ()=> setSelected(hotColdSelect(game,'hot', requiredCount()));
  $('#qp-cold').onclick = ()=> setSelected(hotColdSelect(game,'cold', requiredCount()));
  $('#qp-rand').onclick = ()=> { const N=rangeOfModel(game.model); const k=requiredCount(); setSelected(pickDistinct(N,k)); };
  $('#qp-clear').onclick = ()=> setSelected([]);

  $('#add-slip').onclick = ()=>{
    const mkt = ($$('input[name="mkt"]')).find(x=>x.checked).value;
    const nums = Array.from(selected).sort((a,b)=>a-b);
    const stake = parseFloat($('#stake').value||'0');
    const targets = Array.from($$('#compat input[type="checkbox"]:checked')).map(x=>x.value);
    if(!targets.length){ toast(t('fix_select_target'),'warn'); return; }
    targets.forEach(code=>{
      const g2=state.games.find(x=>x.code===code);
      state.slip.push({ code:g2.code, name:g2.name, name_en:g2.name_en, market:mkt, numbers:nums, stake:stake, nextDrawAt:g2.nextDrawAt });
    });
    saveSlip(); updateSlipBadge(); toast(t('toast_added')(targets.length),'ok'); closeModal(); openSlip(); renderSlipList();
  };

  openModal();
}

function openModal(){ $('#modal').classList.remove('hidden'); }
function closeModal(){ $('#modal').classList.add('hidden'); }
$('#modal-close').onclick = closeModal;

function openSlip(){ $('#slip-drawer').classList.remove('hidden'); }
function closeSlip(){ $('#slip-drawer').classList.add('hidden'); }
$('#open-slip').onclick = ()=>{ openSlip(); renderSlipList(); };
$('#close-slip').onclick = closeSlip;

function updateSlipBadge(){ $('#open-slip').textContent = `${(state.lang==='zh'?i18n.zh.nav_betslip:i18n.en.nav_betslip)} (${state.slip.length})`; }

let slipTimer;
function renderSlipList(){
  const list = $('#slip-list'); list.innerHTML=''; if(slipTimer) clearInterval(slipTimer);
  let total=0;
  state.slip.forEach((it,idx)=>{
    total += (it.stake||0);
    const closed=isClosed(it.nextDrawAt);
    const nameMain = state.lang==='zh' ? it.name_en : it.name_en; // keep EN main in slip for clarity
    const item = document.createElement('div'); item.className='slip-item' + (closed||!it.stake?' error':'');
    item.innerHTML = `
      <div class="slip-row"><strong>${nameMain}</strong><span class="small">${state.lang==='zh'?it.name:it.name} • ${it.market}</span></div>
      <div class="slip-row"><span class="muted">${t('numbers','')}</span><span>${(it.numbers||[]).join(', ')||'-'}</span></div>
      <div class="slip-row">
        <label>${t('stake')}: <input data-idx="${idx}" class="stake-input" type="number" min="1" step="1" value="${it.stake||0}"></label>
        <div class="fix-actions">
          <button class="icon-btn" data-next="${idx}">${t('move_next')}</button>
          <button class="icon-btn" data-edit="${idx}">${t('edit')}</button>
          <button class="icon-btn" data-del="${idx}">${t('del')}</button>
        </div>
      </div>
      <div class="small">
        <span>${t('draw_in')} <strong class="countdown ${countdownClass(it.nextDrawAt)}" data-s-idx="${idx}">${fmtCountdown(it.nextDrawAt)}</strong></span>
        ${closed?`<span class="error-msg">${t('closed_cutoff')}</span>`:''}
        ${!it.stake?`<span class="error-msg">${t('stake')} ?</span>`:''}
      </div>`;
    list.appendChild(item);
  });
  $('#total-stake').textContent = `R ${total.toFixed(2)}`;

  list.onclick = (e)=>{
    if(e.target.dataset.del){ const i=+e.target.dataset.del; const rem=state.slip.splice(i,1); saveSlip(); updateSlipBadge(); renderSlipList(); toast(t('toast_removed')(rem[0].name_en),'warn'); }
    if(e.target.dataset.edit){ const i=+e.target.dataset.edit; const it=state.slip[i]; const game=state.games.find(g=>g.code===it.code); openBetPanel(game); }
    if(e.target.dataset.next){ const i=+e.target.dataset.next; const it=state.slip[i]; const g=state.gameMap[it.code]; it.nextDrawAt=computeNextDraw(g.freq); saveSlip(); renderSlipList(); toast(t('toast_next'),'ok'); }
  };
  $$('.stake-input', list).forEach(inp=>{
    inp.addEventListener('change', e=>{
      const i=+e.target.dataset.idx; state.slip[i].stake=parseFloat(e.target.value||'0'); saveSlip();
      let sum=state.slip.reduce((a,b)=>a+(b.stake||0),0); $('#total-stake').textContent=`R ${sum.toFixed(2)}`; renderSlipList();
    });
  });

  function tickSlip(){
    $$('.countdown[data-s-idx]').forEach(el=>{
      const i=+el.dataset.sIdx; const it=state.slip[i]; if(!it) return;
      el.textContent=fmtCountdown(it.nextDrawAt);
      el.classList.remove('warn','danger'); const cls=countdownClass(it.nextDrawAt); if(cls) el.classList.add(cls);
    });
  }
  tickSlip(); slipTimer=setInterval(tickSlip, 1000);
}

$('#submit-bets').onclick = ()=>{
  const now=Date.now(); const errors=[];
  state.slip.forEach((it,i)=>{ const closed=(it.nextDrawAt-now)<=60000; const noStake=!it.stake||it.stake<=0; if(closed||noStake) errors.push({i,closed,noStake,it}); });
  if(errors.length){ errors.forEach(e=>{ const item=$$('.slip-item')[e.i]; if(item) item.classList.add('error'); }); toast(t('toast_fix')(errors.length),'err',4000); return; }
  state.active.push(...state.slip.map(x=>({...x, placedAt:new Date().toISOString()}))); state.slip=[]; saveSlip(); updateSlipBadge(); renderSlipList(); closeSlip(); route('#/active'); renderRoute(); toast(t('toast_submitted'),'ok');
};

function renderActive(){
  const c=document.createElement('div'); c.innerHTML=`<h2>${t('nav_active')}</h2><div class="grid cols-4" id="active-grid"></div>`; const grid=$('#active-grid',c);
  if(!state.active.length){ grid.innerHTML=`<div class="card">${t('active_empty')} — <a href="#/lobby">${t('nav_lobby')}</a></div>`; }
  else state.active.forEach((it,idx)=>{ const card=document.createElement('div'); card.className='card'; const nameMain=state.lang==='zh'?it.name_en:it.name_en; card.innerHTML=`
      <div class="title">${nameMain}</div>
      <div class="small">${state.lang==='zh'?it.name:it.name} • ${it.market}</div>
      <div class="small">Numbers: ${(it.numbers||[]).join(', ')||'-'}</div>
      <div class="row"><span class="muted">${t('next_draw_in')}</span><strong class="countdown ${countdownClass(it.nextDrawAt)}" data-active="${idx}">${fmtCountdown(it.nextDrawAt)}</strong></div>`; grid.appendChild(card); });
  $('#app').innerHTML=''; $('#app').appendChild(c);
  let tm=setInterval(()=>{
    $$('.countdown').forEach(el=>{ const i=el.dataset.active; if(i===undefined) return; const it=state.active[i]; if(!it) return;
      el.textContent=fmtCountdown(it.nextDrawAt); el.classList.remove('warn','danger'); const cls=countdownClass(it.nextDrawAt); if(cls) el.classList.add(cls);
      if(Date.now()>=it.nextDrawAt){ state.history.push({...it,result:'SETTLED',payout:0}); saveHistory(); state.active.splice(i,1); renderActive(); }
    });
    if(!state.active.length) clearInterval(tm);
  },1000);
}

function renderHistory(){
  loadHistory();
  const c=document.createElement('div'); c.innerHTML=`<h2>${t('nav_history')}</h2><div class="grid cols-4" id="hist-grid"></div>`; const grid=$('#hist-grid',c);
  if(!state.history.length){ grid.innerHTML=`<div class="card">${t('history_empty')}</div>`; }
  else state.history.slice().reverse().forEach(it=>{ const card=document.createElement('div'); card.className='card'; const nameMain=state.lang==='zh'?it.name_en:it.name_en; card.innerHTML=`
      <div class="title">${nameMain} <span class="small">(${it.market})</span></div>
      <div class="small">Numbers: ${(it.numbers||[]).join(', ')||'-'}</div>
      <div class="row"><span class="muted">${t('payout')}</span><strong>R ${Number(it.payout||0).toFixed(2)}</strong></div>`; grid.appendChild(card); });
  $('#app').innerHTML=''; $('#app').appendChild(c);
}

function renderRoute(){ const hash=location.hash||'#/lobby'; if(hash.startsWith('#/active')) renderActive(); else if(hash.startsWith('#/history')) renderHistory(); else renderLobby(); }
function route(h){ location.hash=h; }
window.addEventListener('hashchange', renderRoute);

$('#lang-toggle').onclick = ()=> setLang(state.lang==='zh' ? 'en' : 'zh');

async function init(){ loadSlip(); loadHistory(); await loadGames(); refreshChrome(); renderRoute(); updateSlipBadge(); }
init();
