
const I18N = {
  zh: { tab_all:"全部", tab_high:"高頻", tab_mid:"中頻", tab_daily:"每日", back:"返回", choose_numbers:"選擇號碼", stake:"投注金額", quick_pick:"快速選號", clear:"清除", add_to_slip:"加入注單", submit_bets:"送出投注", drawing:"開獎中", result:"結果", closed:"封盤", open:"開放", next_draw:"倒數", slip_empty:"暫無注單", selected:"已選" },
  en: { tab_all:"All", tab_high:"High Freq", tab_mid:"Mid Freq", tab_daily:"Daily", back:"Back", choose_numbers:"Choose Numbers", stake:"Stake", quick_pick:"Quick Pick", clear:"Clear", add_to_slip:"Add to Slip", submit_bets:"Submit Bets", drawing:"Drawing", result:"Result", closed:"Closed", open:"Open", next_draw:"Countdown", slip_empty:"No bets yet", selected:"Selected" },
};
let LANG = localStorage.getItem("lang") || "zh";
function t(key){ return (I18N[LANG] && I18N[LANG][key]) || key; }
function applyI18N(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{ const k = el.getAttribute("data-i18n"); el.textContent = t(k); });
  document.getElementById("btn-lang-zh").classList.toggle("ghost", LANG!=="zh");
  document.getElementById("btn-lang-en").classList.toggle("ghost", LANG!=="en");
}
document.getElementById("btn-lang-zh").addEventListener("click", ()=>{ LANG="zh"; localStorage.setItem("lang", LANG); applyI18N(); renderLobby(); });
document.getElementById("btn-lang-en").addEventListener("click", ()=>{ LANG="en"; localStorage.setItem("lang", LANG); applyI18N(); renderLobby(); });

const MODELS = { "49-6B": { N:49, K:7, quickPick:6 }, "49-7": { N:49, K:7, quickPick:7 }, "36-5": { N:36, K:5, quickPick:5 } };
const GAMES = [
  {code:"ZA01-TBL", name_zh:"桌山之巔", name_en:"Table Mountain Peak", model:"49-6B", freq:"high"},
  {code:"ZA02-ZUL", name_zh:"祖魯戰士", name_en:"Zulu Warrior", model:"36-5", freq:"daily"},
  {code:"ZA03-MAN", name_zh:"曼德拉榮耀", name_en:"Mandela Glory", model:"49-6B", freq:"mid"},
  {code:"ZA04-SHK", name_zh:"沙卡王朝", name_en:"Shaka Dynasty", model:"36-5", freq:"mid"},
  {code:"ZA05-ZUD", name_zh:"祖魯舞彩", name_en:"Zulu Dance Lotto", model:"49-6B", freq:"daily"},
  {code:"ZA06-HER", name_zh:"Heritage Day 彩", name_en:"Heritage Day Lotto", model:"36-5", freq:"daily"},
  {code:"ZA07-CPC", name_zh:"開普狂歡彩", name_en:"Cape Carnival Lotto", model:"49-7", freq:"daily"},
  {code:"ZA08-HRV", name_zh:"收穫慶彩", name_en:"Harvest Festival Lotto", model:"36-5", freq:"daily"},
  {code:"ZA09-TSS", name_zh:"桌山日落", name_en:"Table Mountain Sunset", model:"49-6B", freq:"daily"},
  {code:"ZA10-KRG", name_zh:"克魯格獅彩", name_en:"Kruger Lion Lotto", model:"49-7", freq:"daily"},
  {code:"ZA11-DBN", name_zh:"德班海浪", name_en:"Durban Waves", model:"36-5", freq:"high"},
  {code:"ZA12-AVG", name_zh:"奧古斯汀瀑布彩", name_en:"Augrabies Falls Lotto", model:"49-7", freq:"daily"},
  {code:"ZA13-JNB", name_zh:"約堡之夜", name_en:"Johannesburg Nights", model:"49-6B", freq:"mid"},
  {code:"ZA14-CPT", name_zh:"開普港口彩", name_en:"Cape Harbour Lotto", model:"36-5", freq:"mid"},
  {code:"ZA15-SOW", name_zh:"Soweto 節奏", name_en:"Soweto Rhythm", model:"49-6B", freq:"daily"},
  {code:"ZA16-RAC", name_zh:"南非賽馬彩", name_en:"South Africa Horse Racing", model:"36-5", freq:"high"},
  {code:"ZA17-LIO", name_zh:"獅王彩", name_en:"Lion King Lotto", model:"49-7", freq:"daily"},
  {code:"ZA18-RHI", name_zh:"犀牛彩", name_en:"Rhino Lotto", model:"36-5", freq:"daily"},
  {code:"ZA19-ELE", name_zh:"大象彩", name_en:"Elephant Lotto", model:"49-6B", freq:"daily"},
  {code:"ZA20-BUF", name_zh:"水牛彩", name_en:"Buffalo Lotto", model:"36-5", freq:"daily"},
  {code:"ZA21-LEO", name_zh:"豹影彩", name_en:"Leopard Shadow Lotto", model:"49-7", freq:"daily"},
  {code:"ZA22-TOK", name_zh:"Tokoloshe 彩", name_en:"Tokoloshe Lotto", model:"36-5", freq:"high"},
  {code:"ZA23-HIP", name_zh:"河馬女神彩", name_en:"Hippo Goddess Lotto", model:"49-6B", freq:"daily"},
  {code:"ZA24-SEA", name_zh:"海怪傳奇彩", name_en:"Sea Monster Legend Lotto", model:"36-5", freq:"daily"},
];

const NOW = ()=>Date.now();
function nextDrawOffset(freq){ if(freq==="high") return 2*60*1000; if(freq==="mid") return 60*60*1000; return 6*60*60*1000; }
const STATE = { filter:"all", draws:{}, slip: JSON.parse(localStorage.getItem("slip")||"[]"), selection:[], currentGame:null };
function ensureDrawState(code, freq){ if(!STATE.draws[code]){ const due = NOW()+nextDrawOffset(freq); STATE.draws[code]={nextDue:due,phase:"open",reveal:[],resultHoldUntil:0}; } }

function renderLobby(){
  const grid = document.getElementById("grid-games"); grid.innerHTML="";
  GAMES.forEach(g=> ensureDrawState(g.code, g.freq));
  const list = GAMES.filter(g => STATE.filter==="all" ? true : g.freq===STATE.filter);
  list.forEach(g=>{
    const st = STATE.draws[g.code];
    const card = document.createElement("div"); card.className="card"; card.dataset.code=g.code;
    card.innerHTML = `
      <div class="title">${LANG==="zh"?g.name_zh:g.name_en}</div>
      <div class="meta">
        <span class="badge blue">${g.freq.toUpperCase()}</span>
        <span class="badge" data-i18n="next_draw">${t("next_draw")}:</span>
        <span class="countdown" data-ctr="${g.code}">--:--</span>
      </div>
      <div class="badges" id="badges-${g.code}"></div>
      <div class="reveal-wrap" id="reveal-${g.code}"></div>
    `;
    card.addEventListener("click", ()=> openBetPage(g.code));
    grid.appendChild(card);
  });
  applyI18N();
}

function formatMMSS(ms){ if(ms<0) ms=0; const s=Math.floor(ms/1000); const m=Math.floor(s/60); const sec=s%60; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

function tick(){
  const now = NOW();
  GAMES.forEach(g=>{
    const st = STATE.draws[g.code]; if(!st) return;
    const ctr = document.querySelector(`.countdown[data-ctr="${g.code}"]`);
    const badges = document.getElementById(`badges-${g.code}`);
    const reveal = document.getElementById(`reveal-${g.code}`);
    if(!badges || !reveal) return;
    badges.innerHTML = "";
    if(st.phase==="open"){
      const sealMs=60000; const remaining = st.nextDue - now;
      badges.innerHTML += (remaining<=sealMs) ? `<span class="badge orange">${t("closed")}</span>` : `<span class="badge green">${t("open")}</span>`;
      if(ctr) ctr.textContent = formatMMSS(remaining);
      if(remaining<=0){ st.phase="drawing"; st.reveal=[]; reveal.innerHTML=""; badges.innerHTML = `<span class="badge orange">${t("drawing")}</span>`; }
    }else if(st.phase==="drawing"){
      if(ctr) ctr.textContent="--:--";
      const model = GAMES.find(x=>x.code===g.code).model;
      const balls = (model==="49-6B")?7: (model==="49-7")?7:5;
      const interval = 500;
      if(st.reveal.length<balls){
        if(!st._lastReve || now-st._lastReve>=interval){
          st._lastReve = now;
          const N = MODELS[model].N;
          let n; do{ n = 1+Math.floor(Math.random()*N); }while(st.reveal.includes(n));
          st.reveal.push(n);
          const b = document.createElement("div"); b.className="reveal-ball"; b.textContent=n; reveal.appendChild(b);
        }
      }else{ st.phase="result"; st.resultHoldUntil = now + 30000; badges.innerHTML = `<span class="badge">${t("result")}</span>`; }
    }else if(st.phase==="result"){
      if(now>=st.resultHoldUntil){ st.phase="open"; st.nextDue = now + nextDrawOffset(g.freq); reveal.innerHTML=""; }
    }
  });
  requestAnimationFrame(tick);
}

document.querySelectorAll(".filters .tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".filters .tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active"); STATE.filter = btn.dataset.filter; renderLobby();
  });
});

function showPage(id){ document.querySelectorAll(".page").forEach(p=>p.classList.remove("active")); document.getElementById(id).classList.add("active"); window.scrollTo({top:0,behavior:"smooth"}); }
document.getElementById("btn-back").addEventListener("click", ()=>{ showPage("page-lobby"); history.replaceState({}, "", "#/"); });

function openBetPage(code){
  const g = GAMES.find(x=>x.code===code); if(!g) return; STATE.currentGame=g;
  document.getElementById("bet-title").textContent = (LANG==="zh"?g.name_zh:g.name_en);
  const grid = document.getElementById("number-grid"); grid.innerHTML="";
  const model = MODELS[g.model]; const N = model.N; const want = model.quickPick; STATE.selection = [];
  for(let i=1;i<=N;i++){ const el=document.createElement("div"); el.className="ball"; el.textContent=i;
    el.addEventListener("click", ()=>{ const v=i; const at=STATE.selection.indexOf(v);
      if(at>=0){ STATE.selection.splice(at,1); el.classList.remove("active"); }
      else { if(STATE.selection.length>=want) return; STATE.selection.push(v); el.classList.add("active"); }
      updateNote();
    });
    grid.appendChild(el);
  }
  document.getElementById("btn-quick").onclick = ()=>{
    const nums=new Set(); while(nums.size<want){ nums.add(1+Math.floor(Math.random()*N)); }
    STATE.selection=[...nums];
    document.querySelectorAll("#number-grid .ball").forEach(el=>{ const v=parseInt(el.textContent,10); el.classList.toggle("active", STATE.selection.includes(v)); });
    updateNote();
  };
  document.getElementById("btn-clear").onclick = ()=>{ STATE.selection=[]; document.querySelectorAll("#number-grid .ball").forEach(el=>el.classList.remove("active")); updateNote(); };
  document.getElementById("btn-add-slip").onclick = addToSlip;
  document.getElementById("btn-submit").onclick = submitBets;
  renderSlip(); updateNote(); showPage("page-bet"); history.replaceState({}, "", "#/game/"+code);
}
function updateNote(){ const want=MODELS[STATE.currentGame.model].quickPick; document.getElementById("bet-note").textContent = `${t("selected")}: ${STATE.selection.length}/${want}`; }
function renderSlip(){
  const ul=document.getElementById("slip-list"); ul.innerHTML="";
  if(!STATE.slip.length){ const li=document.createElement("li"); li.textContent=t("slip_empty"); ul.appendChild(li); return; }
  STATE.slip.forEach((s,i)=>{ const li=document.createElement("li"); const name=(LANG==="zh"?s.game.name_zh:s.game.name_en);
    li.innerHTML=`<span>[${s.game.code}] ${name} — ${s.numbers.join(", ")} — $${s.stake}</span><button class="btn small ghost" data-idx="${i}">x</button>`;
    li.querySelector("button").addEventListener("click",(e)=>{ const idx=parseInt(e.currentTarget.dataset.idx,10); STATE.slip.splice(idx,1); localStorage.setItem("slip", JSON.stringify(STATE.slip)); renderSlip(); });
    ul.appendChild(li);
  });
}
function addToSlip(){
  const g=STATE.currentGame; const want=MODELS[g.model].quickPick;
  if(STATE.selection.length!==want){ alert(`需要選滿 ${want} 個號碼`); return; }
  const stake=parseInt(document.getElementById("stake").value,10); if(!(stake>0)){ alert("請輸入正確投注金額"); return; }
  STATE.slip.push({ game:g, numbers:[...STATE.selection].sort((a,b)=>a-b), stake }); localStorage.setItem("slip", JSON.stringify(STATE.slip)); renderSlip();
  STATE.selection=[]; document.querySelectorAll("#number-grid .ball").forEach(el=>el.classList.remove("active")); updateNote();
}
function submitBets(){ if(!STATE.slip.length){ alert("沒有注單"); return; } alert("已送出 "+STATE.slip.length+" 筆注單（原型示意）"); STATE.slip=[]; localStorage.setItem("slip", JSON.stringify(STATE.slip)); renderSlip(); }

// init
renderLobby(); applyI18N(); (function tick(){ const loop=()=>{const now=Date.now();}; })();
(function raf(){ requestAnimationFrame(raf); })();
function tickMain(){}
requestAnimationFrame(function loop(){ // main ticker
  // simple tick re-attach to ensure running after load
});
// Proper ticker
(function startTick(){
  function frame(){ // use previous tick implementation
    const now = Date.now(); // not used
  }
})();

// real ticker reuse from earlier:
function _tick(){ requestAnimationFrame(_tick); } // placeholder

// Use the working tick defined above:
(function(){ function _t(){ tick(); } requestAnimationFrame(_t); })();
