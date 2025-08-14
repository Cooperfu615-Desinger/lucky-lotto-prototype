
/* v4.3.3: add missing updateNote(), keep .startsWith guards and storage migration */
const I18N = {
  zh:{tab_all:"全部",tab_high:"高頻",tab_mid:"中頻",tab_daily:"每日",back:"返回",choose_numbers:"選擇號碼",stake:"投注金額",quick_pick:"快速選號",clear:"清除",add_to_slip:"加入注單",submit_bets:"送出投注",drawing:"開獎中",result:"結果",closed:"封盤",open:"開放",next_draw:"倒數",slip_empty:"暫無注單",selected:"已選",pick1:"買一球",pick2:"買兩球",pick3:"買三球",market_main:"主號",market_bonus:"特號",play_and_quick:"玩法與快速投注",bonus_number:"特號號碼",bonus_oe:"特號單雙",bonus_hl:"特號大小",odd:"單",even:"雙",low:"小",high:"大",my_bets:"我的投注",my_slips:"我的注單",my_slip:"我的注單"},
  en:{tab_all:"All",tab_high:"High Freq",tab_mid:"Mid Freq",tab_daily:"Daily",back:"Back",choose_numbers:"Choose Numbers",stake:"Stake",quick_pick:"Quick Pick",clear:"Clear",add_to_slip:"Add to Slip",submit_bets:"Submit Bets",drawing:"Drawing",result:"Result",closed:"Closed",open:"Open",next_draw:"Countdown",slip_empty:"No bets yet",selected:"Selected",pick1:"Pick 1",pick2:"Pick 2",pick3:"Pick 3",market_main:"Main",market_bonus:"Bonus",play_and_quick:"Play & Quick Bet",bonus_number:"Bonus Number",bonus_oe:"Bonus Odd/Even",bonus_hl:"Bonus High/Low",odd:"Odd",even:"Even",low:"Low",high:"High",my_bets:"My Bets",my_slips:"My Slips",my_slip:"My Slips"}
};
let LANG = localStorage.getItem("lang") || "zh";
function t(k){ return (I18N[LANG] && I18N[LANG][k]) || k; }
function applyI18N(){ document.querySelectorAll("[data-i18n]").forEach(el=>{ const k=el.getAttribute("data-i18n"); el.textContent=t(k); }); const zh=document.getElementById("btn-lang-zh"), en=document.getElementById("btn-lang-en"); if(zh) zh.classList.toggle("ghost", LANG!=="zh"); if(en) en.classList.toggle("ghost", LANG!=="en"); }
document.getElementById("btn-lang-zh").addEventListener("click", ()=>{ LANG="zh"; localStorage.setItem("lang",LANG); applyI18N(); renderLobby(); if(STATE.currentGame) openBetPage(STATE.currentGame.code); });
document.getElementById("btn-lang-en").addEventListener("click", ()=>{ LANG="en"; localStorage.setItem("lang",LANG); applyI18N(); renderLobby(); if(STATE.currentGame) openBetPage(STATE.currentGame.code); });

const MODELS={ "49-6B":{N:49,K:7,label:"1-49, draw 6+bonus",quickPick:6,hasBonus:true}, "49-7":{N:49,K:7,label:"1-49, draw 7",quickPick:7,hasBonus:false}, "36-5":{N:36,K:5,label:"1-36, draw 5",quickPick:5,hasBonus:false} };
const FREQ_LABEL={high:"Every 10m",mid:"Every 1h",daily:"Every 6h"};
const GAMES=[
  {code:"ZA01-TBL",name_zh:"桌山之巔",name_en:"Table Mountain Peak",model:"49-6B",freq:"high"},
  {code:"ZA02-ZUL",name_zh:"祖魯戰士",name_en:"Zulu Warrior",model:"36-5",freq:"daily"},
  {code:"ZA03-MAN",name_zh:"曼德拉榮耀",name_en:"Mandela Glory",model:"49-6B",freq:"mid"},
  {code:"ZA04-SHK",name_zh:"沙卡王朝",name_en:"Shaka Dynasty",model:"36-5",freq:"mid"},
  {code:"ZA05-ZUD",name_zh:"祖魯舞彩",name_en:"Zulu Dance Lotto",model:"49-6B",freq:"daily"},
  {code:"ZA06-HER",name_zh:"Heritage Day 彩",name_en:"Heritage Day Lotto",model:"36-5",freq:"daily"},
  {code:"ZA07-CPC",name_zh:"開普狂歡彩",name_en:"Cape Carnival Lotto",model:"49-7",freq:"daily"},
  {code:"ZA08-HRV",name_zh:"收穫慶彩",name_en:"Harvest Festival Lotto",model:"36-5",freq:"daily"},
  {code:"ZA09-TSS",name_zh:"桌山日落",name_en:"Table Mountain Sunset",model:"49-6B",freq:"daily"},
  {code:"ZA10-KRG",name_zh:"克魯格獅彩",name_en:"Kruger Lion Lotto",model:"49-7",freq:"daily"},
  {code:"ZA11-DBN",name_zh:"德班海浪",name_en:"Durban Waves",model:"36-5",freq:"high"},
  {code:"ZA12-AVG",name_zh:"奧古斯汀瀑布彩",name_en:"Augrabies Falls Lotto",model:"49-7",freq:"daily"},
  {code:"ZA13-JNB",name_zh:"約堡之夜",name_en:"Johannesburg Nights",model:"49-6B",freq:"mid"},
  {code:"ZA14-CPT",name_zh:"開普港口彩",name_en:"Cape Harbour Lotto",model:"36-5",freq:"mid"},
  {code:"ZA15-SOW",name_zh:"Soweto 節奏",name_en:"Soweto Rhythm",model:"49-6B",freq:"daily"},
  {code:"ZA16-RAC",name_zh:"南非賽馬彩",name_en:"South Africa Horse Racing",model:"36-5",freq:"high"},
  {code:"ZA17-LIO",name_zh:"獅王彩",name_en:"Lion King Lotto",model:"49-7",freq:"daily"},
  {code:"ZA18-RHI",name_zh:"犀牛彩",name_en:"Rhino Lotto",model:"36-5",freq:"daily"},
  {code:"ZA19-ELE",name_zh:"大象彩",name_en:"Elephant Lotto",model:"49-6B",freq:"daily"},
  {code:"ZA20-BUF",name_zh:"水牛彩",name_en:"Buffalo Lotto",model:"36-5",freq:"daily"},
  {code:"ZA21-LEO",name_zh:"豹影彩",name_en:"Leopard Shadow Lotto",model:"49-7",freq:"daily"},
  {code:"ZA22-TOK",name_zh:"Tokoloshe 彩",name_en:"Tokoloshe Lotto",model:"36-5",freq:"high"},
  {code:"ZA23-HIP",name_zh:"河馬女神彩",name_en:"Hippo Goddess Lotto",model:"49-6B",freq:"daily"},
  {code:"ZA24-SEA",name_zh:"海怪傳奇彩",name_en:"Sea Monster Legend Lotto",model:"36-5",freq:"daily"},
];
const NOW=()=>Date.now();
function nextDrawOffset(f){ if(f==="high")return 2*60*1000; if(f==="mid")return 60*60*1000; return 6*60*60*1000; }

function migrateStorage(){
  let slip=JSON.parse(localStorage.getItem("slip")||"[]");
  let hist=JSON.parse(localStorage.getItem("betsHistory")||"[]");
  slip = slip.map(it=>{
    const type=(typeof it.type==="string"&&it.type)?it.type:(Array.isArray(it.numbers)?"P"+(it.numbers.length||1):"BONUS_NUM");
    const detail=(typeof it.detail==="string")?it.detail:"";
    const game=it.game&&it.game.code?it.game:{code:"UNKNOWN",name_zh:"未知彩種",name_en:"Unknown Game",model:"49-6B"};
    return {game,type,numbers:Array.isArray(it.numbers)?it.numbers:[],detail,stake:Number(it.stake||0),createdAt:it.createdAt||new Date().toISOString()};
  });
  localStorage.setItem("slip",JSON.stringify(slip));
  hist = hist.map(b=>{
    if(!Array.isArray(b.items)) return b;
    b.items=b.items.map(it=>{
      const type=(typeof it.type==="string"&&it.type)?it.type:(Array.isArray(it.numbers)?"P"+(it.numbers.length||1):"BONUS_NUM");
      const detail=(typeof it.detail==="string")?it.detail:"";
      const game=it.game&&it.game.code?it.game:{code:"UNKNOWN",name_zh:"未知彩種",name_en:"Unknown Game",model:"49-6B"};
      return {game,type,numbers:Array.isArray(it.numbers)?it.numbers:[],detail,stake:Number(it.stake||0),createdAt:it.createdAt||new Date().toISOString()};
    });
    return b;
  });
  localStorage.setItem("betsHistory",JSON.stringify(hist));
}
migrateStorage();

const STATE={ filter:"all", draws:{}, slip:JSON.parse(localStorage.getItem("slip")||"[]"), betsHistory:JSON.parse(localStorage.getItem("betsHistory")||"[]"), selection:[], selectionBonus:null, currentGame:null, marketTab:"main", pickMode:"P1", bonusType:"BONUS_NUM" };
function saveLocal(){ localStorage.setItem("slip",JSON.stringify(STATE.slip)); localStorage.setItem("betsHistory",JSON.stringify(STATE.betsHistory)); }
function ensureDrawState(code,freq){ if(!STATE.draws[code]){ STATE.draws[code]={ nextDue: NOW()+nextDrawOffset(freq), phase:"open", reveal:[], resultHoldUntil:0 }; } }
function miniLabel(mk,fk){ const m=MODELS[mk]; const f=FREQ_LABEL[fk]||""; return `${m.label}, ${f}`; }

function renderLobby(){
  const grid=document.getElementById("grid-games"); grid.innerHTML="";
  GAMES.forEach(g=>ensureDrawState(g.code,g.freq));
  const list=GAMES.filter(g=>STATE.filter==="all"?true:g.freq===STATE.filter);
  list.forEach(g=>{
    const el=document.createElement("div");
    el.className="card"; el.setAttribute("data-code",g.code); el.setAttribute("role","button"); el.setAttribute("tabindex","0");
    el.innerHTML=`<div class="title">${LANG==="zh"?g.name_zh:g.name_en}</div>
      <div class="meta"><span class="mini">${miniLabel(g.model,g.freq)}</span>
        <span class="badge" data-i18n="next_draw">${t("next_draw")}:</span>
        <span class="countdown" data-ctr="${g.code}">--:--</span></div>
      <div class="badges" id="badges-${g.code}"></div>
      <div class="reveal-wrap" id="reveal-${g.code}"></div>`;
    grid.appendChild(el);
  });
  applyI18N();
}
document.getElementById("grid-games").addEventListener("click",(e)=>{ const card=e.target.closest?.(".card"); if(!card) return; const code=card.getAttribute("data-code"); if(code) openBetPage(code); });
document.getElementById("grid-games").addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" "){ const card=e.target.closest?.(".card"); if(!card) return; const code=card.getAttribute("data-code"); if(code) openBetPage(code); } });

function formatMMSS(ms){ if(ms<0)ms=0; const s=Math.floor(ms/1000); const m=Math.floor(s/60); const sec=s%60; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }
function tick(){
  const now=NOW();
  GAMES.forEach(g=>{
    const st=STATE.draws[g.code]; if(!st) return;
    const ctr=document.querySelector(`.countdown[data-ctr="${g.code}"]`);
    const badges=document.getElementById(`badges-${g.code}`);
    const reveal=document.getElementById(`reveal-${g.code}`);
    if(!badges||!reveal) return;
    badges.innerHTML="";
    if(st.phase==="open"){
      const seal=60000, remain=st.nextDue-now;
      badges.innerHTML+=(remain<=seal)?`<span class="badge orange">${t("closed")}</span>`:`<span class="badge green">${t("open")}</span>`;
      if(ctr) ctr.textContent=formatMMSS(remain);
      if(remain<=0){ st.phase="drawing"; st.reveal=[]; reveal.innerHTML=""; badges.innerHTML=`<span class="badge orange">${t("drawing")}</span>`; }
    }else if(st.phase==="drawing"){
      if(ctr) ctr.textContent="--:--";
      const balls=(g.model==="36-5")?5:7;
      const interval=500;
      if(st.reveal.length<balls){
        if(!st._lastReve||now-st._lastReve>=interval){
          st._lastReve=now;
          const N=MODELS[g.model].N;
          let n; do{ n=1+Math.floor(Math.random()*N); }while(st.reveal.includes(n));
          st.reveal.push(n);
          const b=document.createElement("div"); b.className="reveal-ball"; b.textContent=n; reveal.appendChild(b);
        }
      }else{ st.phase="result"; st.resultHoldUntil=now+30000; badges.innerHTML=`<span class="badge">${t("result")}</span>`; }
    }else if(st.phase==="result"){
      if(now>=st.resultHoldUntil){ st.phase="open"; st.nextDue=now+nextDrawOffset(g.freq); reveal.innerHTML=""; }
    }
  });
  requestAnimationFrame(tick);
}

document.querySelectorAll(".filters .tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filters .tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active"); STATE.filter=btn.getAttribute("data-filter"); renderLobby();
  });
});
function showPage(id){ document.querySelectorAll(".page").forEach(p=>p.classList.remove("active")); const el=document.getElementById(id); if(el) el.classList.add("active"); window.scrollTo({top:0,behavior:"smooth"}); }
document.getElementById("btn-back").addEventListener("click",()=>{ showPage("page-lobby"); history.replaceState({}, "", "#/"); });

function openBetPage(code){
  const g=GAMES.find(x=>x.code===code); if(!g) return; STATE.currentGame=g;
  const title=document.getElementById("bet-title"); if(title) title.textContent=(LANG==="zh"?g.name_zh:g.name_en);
  STATE.selection=[]; STATE.selectionBonus=null; STATE.marketTab="main"; STATE.pickMode="P1"; STATE.bonusType="BONUS_NUM";
  const segMarket=document.getElementById("seg-market");
  if(segMarket){
    segMarket.querySelectorAll(".seg-btn").forEach(btn=>{
      btn.classList.toggle("active", btn.getAttribute("data-market")==="main");
      btn.onclick=()=>{
        segMarket.querySelectorAll(".seg-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        const tab=btn.getAttribute("data-market"); STATE.marketTab=tab;
        document.getElementById("main-panel").style.display=(tab==="main")?"block":"none";
        document.getElementById("bonus-panel").style.display=(tab==="bonus")?"block":"none";
        updateNote();
      };
    });
  }
  const segPick=document.getElementById("seg-pick");
  if(segPick){
    segPick.querySelectorAll(".seg-btn").forEach(btn=>{
      btn.classList.toggle("active", btn.getAttribute("data-pick")==="P1");
      btn.onclick=()=>{
        segPick.querySelectorAll(".seg-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active"); STATE.pickMode=btn.getAttribute("data-pick");
        if(STATE.selection.length>reqCount()) STATE.selection=[];
        updateNote(); refreshGrid();
      };
    });
  }
  const segBonus=document.getElementById("seg-bonus-type");
  if(segBonus){
    segBonus.querySelectorAll(".seg-btn").forEach(btn=>{
      btn.classList.toggle("active", btn.getAttribute("data-bonus")==="BONUS_NUM");
      btn.onclick=()=>{
        segBonus.querySelectorAll(".seg-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active"); STATE.bonusType=btn.getAttribute("data-bonus");
        document.getElementById("bonus-num-wrap").style.display=(STATE.bonusType==="BONUS_NUM")?"block":"none";
        document.getElementById("bonus-oe-wrap").style.display=(STATE.bonusType==="BONUS_OE")?"block":"none";
        document.getElementById("bonus-hl-wrap").style.display=(STATE.bonusType==="BONUS_HL")?"block":"none";
        STATE.selectionBonus=null; updateNote();
      };
    });
  }
  refreshGrid(); refreshBonusGrid();
  const btnQuick=document.getElementById("btn-quick"), btnClear=document.getElementById("btn-clear");
  if(btnQuick) btnQuick.onclick=()=>{ const N=MODELS[g.model].N, need=reqCount(); const s=new Set(); while(s.size<need){ s.add(1+Math.floor(Math.random()*N)); } STATE.selection=[...s]; markGridSelection(); updateNote(); };
  if(btnClear) btnClear.onclick=()=>{ STATE.selection=[]; markGridSelection(); updateNote(); };
  const bq=document.getElementById("btn-bonus-quick"), bc=document.getElementById("btn-bonus-clear");
  if(bq) bq.onclick=()=>{ if(STATE.bonusType!=="BONUS_NUM") return; const N=MODELS[g.model].N; STATE.selectionBonus=1+Math.floor(Math.random()*N); markBonusGrid(); updateNote(); };
  if(bc) bc.onclick=()=>{ STATE.selectionBonus=null; markBonusGrid(); updateNote(); };
  document.querySelectorAll("#bonus-oe-wrap .seg-btn").forEach(btn=> btn.onclick=()=>{ document.querySelectorAll("#bonus-oe-wrap .seg-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); STATE.selectionBonus=btn.getAttribute("data-oe"); updateNote(); });
  document.querySelectorAll("#bonus-hl-wrap .seg-btn").forEach(btn=> btn.onclick=()=>{ document.querySelectorAll("#bonus-hl-wrap .seg-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); STATE.selectionBonus=btn.getAttribute("data-hl"); updateNote(); });
  const add=document.getElementById("btn-add-slip"), submit=document.getElementById("btn-submit");
  if(add) add.onclick=addToSlip; if(submit) submit.onclick=submitBets;
  renderSlip(); updateNote(); showPage("page-bet"); history.replaceState({}, "", "#/game/"+code);
}

function reqCount(){ return {P1:1,P2:2,P3:3}[STATE.pickMode]; }
function refreshGrid(){
  const grid=document.getElementById("number-grid"); if(!grid) return; grid.innerHTML="";
  const g=STATE.currentGame; if(!g) return; const N=MODELS[g.model].N;
  for(let i=1;i<=N;i++){
    const el=document.createElement("div"); el.className="ball"; el.textContent=i;
    el.addEventListener("click",()=>{
      const v=i; const at=STATE.selection.indexOf(v);
      if(at>=0){ STATE.selection.splice(at,1); el.classList.remove("active"); }
      else { const need=reqCount(); if(STATE.selection.length>=need) return; STATE.selection.push(v); el.classList.add("active"); }
      updateNote();
    });
    grid.appendChild(el);
  }
  markGridSelection();
  const n=document.getElementById("main-note"); if(n) n.textContent=`${t("selected")}: ${STATE.selection.length}/${reqCount()}`;
}
function markGridSelection(){ document.querySelectorAll("#number-grid .ball").forEach(el=>{ const v=parseInt(el.textContent,10); el.classList.toggle("active", STATE.selection.includes(v)); }); }
function refreshBonusGrid(){
  const grid=document.getElementById("bonus-grid"); if(!grid) return; grid.innerHTML="";
  const g=STATE.currentGame; if(!g) return; const N=MODELS[g.model].N;
  for(let i=1;i<=N;i++){
    const el=document.createElement("div"); el.className="ball"; el.textContent=i;
    el.addEventListener("click",()=>{ STATE.selectionBonus=i; markBonusGrid(); updateNote(); });
    grid.appendChild(el);
  }
  markBonusGrid();
  const bn=document.getElementById("bonus-note"); if(bn) bn.textContent=`${t("bonus_number")} — ${t("selected")}: ${STATE.selectionBonus?1:0}/1`;
  const hasB=MODELS[STATE.currentGame.model].hasBonus;
  const bonusTab=document.querySelector('[data-market="bonus"]'); if(bonusTab) bonusTab.style.display=hasB?"inline-block":"none";
}
function markBonusGrid(){ document.querySelectorAll("#bonus-grid .ball").forEach(el=>{ const v=parseInt(el.textContent,10); el.classList.toggle("active", STATE.selectionBonus===v); }); }

function updateNote(){
  const note=document.getElementById("bet-note"); if(!note) return;
  if(STATE.marketTab==="main"){
    const n=document.getElementById("main-note"); if(n) n.textContent=`${t("selected")}: ${STATE.selection.length}/${reqCount()}`;
    const pm = ({P1:"pick1",P2:"pick2",P3:"pick3"})[STATE.pickMode] || "pick1";
    note.textContent=`(${t("market_main")} • ${t(pm)})`;
  }else{
    if(STATE.bonusType==="BONUS_NUM"){ const bn=document.getElementById("bonus-note"); if(bn) bn.textContent=`${t("bonus_number")} — ${t("selected")}: ${STATE.selectionBonus?1:0}/1`; }
    let choice=STATE.selectionBonus?`${STATE.selectionBonus}`:"-";
    if(STATE.bonusType==="BONUS_OE"||STATE.bonusType==="BONUS_HL"){ choice=STATE.selectionBonus||"-"; }
    const label = (STATE.bonusType==='BONUS_NUM')?'bonus_number':(STATE.bonusType==='BONUS_OE')?'bonus_oe':'bonus_hl';
    note.textContent=`(${t("market_bonus")} • ${t(label)}: ${choice})`;
  }
}

function renderSlip(){
  const ul=document.getElementById("slip-list"); if(!ul) return; ul.innerHTML="";
  if(!STATE.slip.length){ const li=document.createElement("li"); li.textContent=t("slip_empty"); ul.appendChild(li); return; }
  STATE.slip.forEach((s,idx)=>{
    const type = (typeof s.type==="string") ? s.type : "";
    const isPick = (type && type.startsWith && type.startsWith("P"));
    const name=(LANG==="zh"?(s.game?.name_zh||"未知彩種"):(s.game?.name_en||"Unknown Game"));
    const detail=isPick ? (Array.isArray(s.numbers)?s.numbers.join(", "):"") : (s.detail||"");
    const code = s.game?.code || "UNKNOWN";
    const stake = Number(s.stake||0);
    const li=document.createElement("li");
    li.innerHTML=`<span>[${code}] ${name} — ${type||"TYPE"} — ${detail} — R${stake}</span>
                  <button class="btn small ghost" data-idx="${idx}">x</button>`;
    li.querySelector("button").addEventListener("click",(e)=>{ const i=parseInt(e.currentTarget.getAttribute("data-idx"),10); STATE.slip.splice(i,1); saveLocal(); renderSlip(); });
    ul.appendChild(li);
  });
  syncDrawerSlips();
}
function syncDrawerSlips(){
  const ul=document.getElementById("drawer-slip-list"); if(!ul) return; ul.innerHTML="";
  if(!STATE.slip.length){ const li=document.createElement("li"); li.textContent=t("slip_empty"); ul.appendChild(li); return; }
  STATE.slip.forEach((s)=>{
    const type = (typeof s.type==="string") ? s.type : "";
    const isPick = (type && type.startsWith && type.startsWith("P"));
    const name=(LANG==="zh"?(s.game?.name_zh||"未知彩種"):(s.game?.name_en||"Unknown Game"));
    const detail=isPick ? (Array.isArray(s.numbers)?s.numbers.join(", "):"") : (s.detail||"");
    const code = s.game?.code || "UNKNOWN";
    const stake = Number(s.stake||0);
    const li=document.createElement("li");
    li.innerHTML=`<span>[${code}] ${name} — ${type||"TYPE"} — ${detail} — R${stake}</span>`;
    ul.appendChild(li);
  });
}
function addToSlip(){
  const g=STATE.currentGame; const stake=parseInt(document.getElementById("stake").value,10);
  if(!(stake>0)){ alert(LANG==='zh'?'請輸入正確投注金額':'Stake must be > 0'); return; }
  if(STATE.marketTab==="main"){
    const need=reqCount(); if(STATE.selection.length!==need){ alert((LANG==='zh'?'需要選滿 ':'Need ')+need+(LANG==='zh'?' 個號碼':' numbers')); return; }
    STATE.slip.push({ game:g, type:STATE.pickMode, numbers:[...STATE.selection].sort((a,b)=>a-b), stake, createdAt:new Date().toISOString() });
    STATE.selection=[]; markGridSelection(); updateNote();
  }else{
    if(STATE.bonusType==="BONUS_NUM"){ if(!STATE.selectionBonus){ alert(LANG==='zh'?'請選擇特號號碼':'Pick a bonus number'); return; } STATE.slip.push({ game:g, type:"BONUS_NUM", detail:String(STATE.selectionBonus), stake, createdAt:new Date().toISOString() }); STATE.selectionBonus=null; markBonusGrid(); updateNote(); }
    else if(STATE.bonusType==="BONUS_OE"){ if(!STATE.selectionBonus){ alert(LANG==='zh'?'請選擇單或雙':'Pick Odd/Even'); return; } STATE.slip.push({ game:g, type:"BONUS_OE", detail:STATE.selectionBonus, stake, createdAt:new Date().toISOString() }); }
    else if(STATE.bonusType==="BONUS_HL"){ if(!STATE.selectionBonus){ alert(LANG==='zh'?'請選擇大小':'Pick High/Low'); return; } STATE.slip.push({ game:g, type:"BONUS_HL", detail:STATE.selectionBonus, stake, createdAt:new Date().toISOString() }); }
  }
  saveLocal(); renderSlip();
}
function submitBets(){
  if(!STATE.slip.length){ alert(LANG==='zh'?'沒有注單':'No slips'); return; }
  const batch={ id:"B"+Date.now(), items:STATE.slip, submittedAt:new Date().toISOString() };
  STATE.betsHistory.unshift(batch); STATE.slip=[]; saveLocal(); renderSlip(); alert((LANG==='zh'?'已送出 ':'Submitted ')+batch.items.length+(LANG==='zh'?' 筆注單':' slips')); renderBetsDrawer();
}
function openDrawer(id){ const d=document.getElementById(id); if(d) d.classList.add("open"); }
function closeDrawer(id){ const d=document.getElementById(id); if(d) d.classList.remove("open"); }
document.getElementById("btn-open-bets").onclick=()=>{ renderBetsDrawer(); openDrawer("drawer-bets"); };
document.getElementById("btn-open-slips").onclick=()=>{ syncDrawerSlips(); openDrawer("drawer-slips"); };
document.querySelectorAll(".drawer [data-close]").forEach(btn=> btn.addEventListener("click",(e)=> e.currentTarget.closest(".drawer").classList.remove("open")));
function renderBetsDrawer(){
  const ul=document.getElementById("bets-list"); if(!ul) return; ul.innerHTML="";
  if(!STATE.betsHistory.length){ const li=document.createElement("li"); li.textContent=LANG==='zh'?'尚無投注紀錄':'No bet history'; ul.appendChild(li); return; }
  STATE.betsHistory.forEach(batch=>{
    const total=batch.items.reduce((s,it)=> s + Number(it.stake||0), 0);
    const li=document.createElement("li");
    li.innerHTML=`<span>#${batch.id} — ${new Date(batch.submittedAt).toLocaleString()} — R${total} — ${batch.items.length} items</span>`;
    ul.appendChild(li);
  });
}
renderLobby(); applyI18N(); requestAnimationFrame(tick);
