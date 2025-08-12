
const $ = (sel, ctx=document)=>ctx.querySelector(sel);
const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));

const state = {
  games: [],
  slip: [],   // {code, name, name_en, market, numbers, stake, nextDrawAt}
  active: [], // placed bets
  history: [],
  filter: 'all'
};

// Simple schedule → simulated next draw timestamp (client side mock)
function computeNextDraw(freq) {
  const now = new Date();
  let next = new Date(now);
  if (freq === '5m') {
    next.setMinutes(Math.floor(now.getMinutes()/5)*5 + 5, 0, 0);
  } else if (freq === '10m') {
    next.setMinutes(Math.floor(now.getMinutes()/10)*10 + 10, 0, 0);
  } else if (freq === '30m') {
    next.setMinutes(now.getMinutes()<30?30:60, 0, 0);
  } else if (freq === '60m') {
    next.setHours(now.getMinutes()===0 ? now.getHours() : now.getHours()+1, 0, 0, 0);
  } else if (freq === 'daily2') {
    const slots = [14*60+30, 20*60+30]; // 14:30, 20:30 local
    const mins = now.getHours()*60 + now.getMinutes();
    const cand = slots.find(m => m > mins);
    if (cand!==undefined) {
      const h = Math.floor(cand/60), m = cand%60;
      next.setHours(h, m, 0, 0);
    } else {
      next.setDate(now.getDate()+1);
      next.setHours(14,30,0,0);
    }
  } else if (freq === 'daily') {
    // default 21:00
    const target = new Date(now); target.setHours(21,0,0,0);
    if (target <= now) target.setDate(target.getDate()+1);
    next = target;
  } else { next.setMinutes(now.getMinutes()+5,0,0); }
  return next.getTime();
}

function fmtCountdown(ts) {
  const now = Date.now();
  let s = Math.max(0, Math.floor((ts-now)/1000));
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

function badgeForFreq(freq) {
  return ({
    '5m':'Every 5m','10m':'Every 10m','30m':'Every 30m','60m':'Hourly','daily2':'Twice Daily','daily':'Daily'
  })[freq] || freq;
}

async function loadGames() {
  const res = await fetch('data/games.json');
  state.games = await res.json();
  // precompute next draw
  state.games = state.games.map(g => ({...g, nextDrawAt: computeNextDraw(g.freq)}));
}

function renderLobby() {
  const container = document.createElement('div');
  container.innerHTML = `
    <section>
      <div class="filters">
        <button class="filter ${state.filter==='all'?'active':''}" data-f="all">All</button>
        <button class="filter ${state.filter==='hf'?'active':''}" data-f="hf">High Freq (5/10m)</button>
        <button class="filter ${state.filter==='mf'?'active':''}" data-f="mf">Medium (30/60m)</button>
        <button class="filter ${state.filter==='df'?'active':''}" data-f="df">Daily</button>
      </div>
      <div class="grid cols-4" id="game-grid"></div>
    </section>
  `;
  const grid = $('#game-grid', container);

  const filt = (g)=>{
    if(state.filter==='all') return true;
    if(state.filter==='hf') return g.freq==='5m'||g.freq==='10m';
    if(state.filter==='mf') return g.freq==='30m'||g.freq==='60m';
    if(state.filter==='df') return g.freq==='daily'||g.freq==='daily2';
    return true;
  };

  state.games.filter(filt).forEach(g => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="title">${g.name} <span class="small">(${g.name_en})</span></div>
      <div class="badges">
        <span>${badgeForFreq(g.freq)}</span>
        <span>Range ${g.range}</span>
        <span>Draw ${g.draw}</span>
      </div>
      <div class="row">
        <span class="muted">Next draw in</span>
        <strong class="countdown" data-code="${g.code}">--:--</strong>
      </div>
      <div class="footer-actions">
        <button class="btn" data-open="${g.code}">Details</button>
        <button class="btn primary" data-bet="${g.code}">Bet</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // add listeners
  $$('.filter', container).forEach(btn=>btn.addEventListener('click', e=>{
    state.filter = e.target.dataset.f;
    route('#/lobby');
  }));

  grid.addEventListener('click', (e)=>{
    const code = e.target.dataset.open || e.target.dataset.bet;
    if(!code) return;
    const game = state.games.find(x=>x.code===code);
    openBetPanel(game);
  });

  $('#app').innerHTML = '';
  $('#app').appendChild(container);
  startTick();
}

let tickTimer;
function startTick(){
  if (tickTimer) clearInterval(tickTimer);
  function tick(){
    state.games.forEach(g=>{
      const el = document.querySelector(`.countdown[data-code="${g.code}"]`);
      if(!el) return;
      el.textContent = fmtCountdown(g.nextDrawAt);
      if (Date.now() >= g.nextDrawAt) {
        // roll next draw forward to keep lobby alive
        g.nextDrawAt = computeNextDraw(g.freq);
      }
    });
  }
  tick();
  tickTimer = setInterval(tick, 1000);
}

function openBetPanel(game){
  $('#modal-title').textContent = `${game.name} (${game.name_en})`;
  const body = $('#modal-body');
  body.innerHTML = '';

  // Number grid
  const max = game.range.includes('36') ? 36 : 49;
  const panelLeft = document.createElement('div');
  panelLeft.className = 'panel';
  panelLeft.innerHTML = `<h4>Numbers (1–${max})</h4><div class="num-grid" id="num-grid"></div>`;
  const grid = $('#num-grid', panelLeft);
  const selected = new Set();

  for (let i=1;i<=max;i++){
    const n = document.createElement('div');
    n.className = 'num';
    n.textContent = i;
    n.addEventListener('click', ()=>{
      if(selected.has(i)) { selected.delete(i); n.classList.remove('selected'); }
      else { selected.add(i); n.classList.add('selected'); }
    });
    grid.appendChild(n);
  }

  // Markets + stake
  const panelRight = document.createElement('div');
  panelRight.className = 'panel';
  panelRight.innerHTML = `
    <h4>Markets</h4>
    <div class="row">
      <label><input type="radio" name="mkt" value="1-ball" checked> 1 Ball</label>
      <label><input type="radio" name="mkt" value="2-balls"> 2 Balls</label>
      <label><input type="radio" name="mkt" value="3-balls"> 3 Balls</label>
      <label><input type="radio" name="mkt" value="4-balls"> 4 Balls</label>
    </div>
    <div class="row">
      <label><input type="checkbox" id="m-bonus"> Bonus Ball (if applicable)</label>
      <label><input type="checkbox" id="m-odd"> Odd/Even</label>
      <label><input type="checkbox" id="m-hi"> Hi/Lo</label>
      <label><input type="checkbox" id="m-sum"> Sum Range</label>
    </div>
    <div class="row">
      <label>Stake (R): <input id="stake" type="number" min="1" step="1" value="10"></label>
      <span class="muted">Next draw in <strong>${fmtCountdown(game.nextDrawAt)}</strong></span>
    </div>
    <div class="row" style="justify-content:flex-end;">
      <button id="add-slip" class="btn success">Add to Bet Slip</button>
    </div>
  `;

  body.appendChild(panelLeft);
  body.appendChild(panelRight);

  $('#add-slip').onclick = ()=>{
    const mkt = ($$('input[name="mkt"]')).find(x=>x.checked).value;
    const nums = Array.from(selected).sort((a,b)=>a-b);
    const stake = parseFloat($('#stake').value||'0');
    state.slip.push({
      code: game.code,
      name: game.name,
      name_en: game.name_en,
      market: mkt,
      numbers: nums,
      stake: stake,
      nextDrawAt: game.nextDrawAt
    });
    updateSlipBadge();
    closeModal();
    openSlip();
    renderSlipList();
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

function updateSlipBadge(){
  $('#open-slip').textContent = `Bet Slip (${state.slip.length})`;
}

function renderSlipList(){
  const list = $('#slip-list');
  list.innerHTML = '';
  let total = 0;
  state.slip.forEach((it,idx)=>{
    total += (it.stake||0);
    const item = document.createElement('div');
    item.className = 'slip-item';
    item.innerHTML = `
      <div class="slip-row"><strong>${it.name} (${it.name_en})</strong><span class="small">${it.market}</span></div>
      <div class="slip-row"><span class="muted">Numbers:</span><span>${(it.numbers||[]).join(', ')||'-'}</span></div>
      <div class="slip-row">
        <label>Stake (R): <input data-idx="${idx}" class="stake-input" type="number" min="1" step="1" value="${it.stake||0}"></label>
        <button class="icon-btn" data-del="${idx}">🗑</button>
      </div>
      <div class="small">Next draw in: ${fmtCountdown(it.nextDrawAt)}</div>
    `;
    list.appendChild(item);
  });
  $('#total-stake').textContent = `R ${total.toFixed(2)}`;

  list.onclick = (e)=>{
    if(e.target.dataset.del){
      const i = parseInt(e.target.dataset.del,10);
      state.slip.splice(i,1);
      updateSlipBadge();
      renderSlipList();
    }
  };
  $$('.stake-input', list).forEach(inp=>{
    inp.addEventListener('change', e=>{
      const i = parseInt(e.target.dataset.idx,10);
      state.slip[i].stake = parseFloat(e.target.value||'0');
      let sum = state.slip.reduce((a,b)=>a+(b.stake||0),0);
      $('#total-stake').textContent = `R ${sum.toFixed(2)}`;
    });
  });
}

$('#submit-bets').onclick = ()=>{
  // Validation: mock closing window 60s before nextDrawAt
  const now = Date.now();
  const errors = [];
  state.slip.forEach((it, i)=>{
    const closed = (it.nextDrawAt - now) <= 60000; // 60s cutoff
    const noStake = !it.stake || it.stake <= 0;
    if (closed || noStake) errors.push({i, closed, noStake, it});
  });
  if (errors.length) {
    alert("Some items need attention:\n" + errors.map(e=>`- ${e.it.name_en}: ${e.closed?'Closed':''}${e.closed&&e.noStake?' & ':''}${e.noStake?'No stake':''}`).join('\n'));
    return;
  }
  // move to active, clear slip
  state.active.push(...state.slip.map(x=>({...x, placedAt: new Date().toISOString()})));
  state.slip = [];
  updateSlipBadge();
  renderSlipList();
  closeSlip();
  location.hash = '#/active';
  renderRoute();
};

function renderActive(){
  const container = document.createElement('div');
  container.innerHTML = `<h2>Active Bets</h2><div class="grid cols-4" id="active-grid"></div>`;
  const grid = $('#active-grid', container);

  if (!state.active.length){
    grid.innerHTML = `<div class="card">No active bets — go to <a href="#/lobby">Lobby</a></div>`;
  } else {
    state.active.forEach((it, idx)=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="title">${it.name_en}</div>
        <div class="small">${it.name} • ${it.market}</div>
        <div class="small">Numbers: ${(it.numbers||[]).join(', ')||'-'}</div>
        <div class="row"><span class="muted">Draw in</span><strong class="countdown" data-active="${idx}">${fmtCountdown(it.nextDrawAt)}</strong></div>
      `;
      grid.appendChild(card);
    });
  }

  $('#app').innerHTML = '';
  $('#app').appendChild(container);

  // countdown
  let tm = setInterval(()=>{
    $$('.countdown').forEach(el=>{
      const i = el.dataset.active;
      if(i===undefined) return;
      const it = state.active[i];
      el.textContent = fmtCountdown(it.nextDrawAt);
      if(Date.now() >= it.nextDrawAt){
        // Settle to history (mock result)
        state.history.push({...it, result: 'SETTLED', payout: 0});
        state.active.splice(i,1);
        renderActive();
      }
    });
    if (!state.active.length) clearInterval(tm);
  },1000);
}

function renderHistory(){
  const container = document.createElement('div');
  container.innerHTML = `<h2>Bet History</h2><div class="grid cols-4" id="hist-grid"></div>`;
  const grid = $('#hist-grid', container);
  if (!state.history.length) {
    grid.innerHTML = `<div class="card">No history yet.</div>`;
  } else {
    state.history.slice().reverse().forEach(it=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="title">${it.name_en} <span class="small">(${it.market})</span></div>
        <div class="small">Numbers: ${(it.numbers||[]).join(', ')||'-'}</div>
        <div class="row"><span class="muted">Payout</span><strong>R ${Number(it.payout||0).toFixed(2)}</strong></div>
      `;
      grid.appendChild(card);
    });
  }
  $('#app').innerHTML = '';
  $('#app').appendChild(container);
}

function renderRoute(){
  const hash = location.hash || '#/lobby';
  if (hash.startsWith('#/active')) renderActive();
  else if (hash.startsWith('#/history')) renderHistory();
  else renderLobby();
}

window.addEventListener('hashchange', renderRoute);

// init
loadGames().then(()=>{
  renderRoute();
  updateSlipBadge();
});
