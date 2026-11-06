/* ================= PERGUNTAS ================= */
const QUESTIONS = [
{ title:"O que aparece no console?",
code:`let nota = 8;

if (nota >= 7) {
  console.log("Aprovado");
} else {
  console.log("Reprovado");
}`,
opts:['"Aprovado"','"Reprovado"','Os dois','Erro'], ok:0,
why:"8 >= 7 é verdadeiro, então só o bloco do if executa."},

{ title:"E agora, com nota 7?",
code:`let nota = 7;

if (nota > 7) {
  console.log("Ótimo");
} else if (nota === 7) {
  console.log("Bom");
} else {
  console.log("Estude mais");
}`,
opts:['"Ótimo"','"Bom"','"Estude mais"','Nada aparece'], ok:1,
why:"7 > 7 é falso. Depois, 7 === 7 é verdadeiro: \"Bom\"."},

{ title:"O que aparece no console?",
code:`let idade = 17;

if (idade >= 18) {
  console.log("Pode dirigir");
} else if (idade >= 16) {
  console.log("Pode votar");
} else {
  console.log("Ainda não");
}`,
opts:['"Pode dirigir"','"Ainda não"','"Pode votar"','"Pode votar" e "Ainda não"'], ok:2,
why:"O else if só é testado se o if falhar. 17 >= 16 é verdadeiro."},

{ title:"Pegadinha do tipo!",
code:`let x = "10";

if (x === 10) {
  console.log("igual");
} else {
  console.log("diferente");
}`,
opts:['"igual"','"diferente"','Erro','undefined'], ok:1,
why:"\"10\" é texto e 10 é número. O === compara o tipo também."},

{ title:"Quantas linhas aparecem?",
code:`let total = 150;

if (total > 200) {
  console.log("Frete grátis");
} else if (total > 100) {
  console.log("Frete R$ 10");
} else {
  console.log("Frete R$ 20");
}
console.log("Fim");`,
opts:['"Frete R$ 10"','"Frete grátis" e "Fim"','"Frete R$ 20" e "Fim"','"Frete R$ 10" e "Fim"'], ok:3,
why:"150 > 100 dá \"Frete R$ 10\". O \"Fim\" está fora do if, então sempre aparece."},

{ title:"&& ou || ?",
code:`let a = 5;
let b = 3;

if (a > b && b > 5) {
  console.log("A");
} else if (a > b || b > 5) {
  console.log("B");
} else {
  console.log("C");
}`,
opts:['"A"','"B"','"C"','"A" e "B"'], ok:1,
why:"&& exige os dois verdadeiros (b > 5 é falso). || aceita só um."},

{ title:"O sinal de ! (não)",
code:`let chovendo = false;

if (!chovendo) {
  console.log("Sair sem guarda-chuva");
} else {
  console.log("Levar guarda-chuva");
}`,
opts:['"Levar guarda-chuva"','"Sair sem guarda-chuva"','Erro','Nada aparece'], ok:1,
why:"!false vira true, então o bloco do if executa."},

{ title:"Que horas são?",
code:`let hora = 20;

if (hora < 12) {
  console.log("Bom dia");
} else if (hora < 18) {
  console.log("Boa tarde");
} else {
  console.log("Boa noite");
}`,
opts:['"Bom dia"','"Boa tarde"','"Boa noite"','"Boa tarde" e "Boa noite"'], ok:2,
why:"20 não é < 12 nem < 18, então cai no else."},

{ title:"FizzBuzz quebrado: n = 15",
code:`let n = 15;

if (n % 3 === 0) {
  console.log("Fizz");
} else if (n % 15 === 0) {
  console.log("FizzBuzz");
} else {
  console.log(n);
}`,
opts:['"FizzBuzz"','"Fizz"','15','"Fizz" e "FizzBuzz"'], ok:1,
why:"15 % 3 é 0, então o primeiro if já é verdadeiro e o resto é ignorado. A ordem importa!"},

{ title:"Sistema de menções Senac",
code:`let total = 9;
let atendidos = 9;

if (atendidos > 0) {
  console.log("PA");
} else if (atendidos === total) {
  console.log("A");
} else {
  console.log("NA");
}`,
opts:['"A"','"NA"','"PA"','"PA" e "A"'], ok:2,
why:"9 > 0 já é verdadeiro, e o A nunca é testado. O teste de \"todos\" tem que vir primeiro."}
];
const TIME = 40;
const SHAPES = ["▲","◆","●","■"];
const EMOJIS = ["🐱","🐶","🦊","🐼","🐸","🐵","🦁","🐯","🐨","🐙","🦄","🐧","🐢","🦖","👾","🤖","👻","🐝"];
const COLORS = ["#e21b3c","#1368ce","#d89e00","#26890c","#864cbf","#0aa3a3","#ff7a00","#e84393","#2d3436","#6c5ce7","#00b894","#fdcb6e"];
const PREFIX = "uc7-ifelse-";

/* ================= UTIL ================= */
const $ = id => document.getElementById(id);
const show = id => { document.querySelectorAll("body > .screen").forEach(s=>s.classList.add("hidden")); $(id).classList.remove("hidden"); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const avatarHTML = (p, cls="avatar") => `<div class="${cls}" style="background:${esc(p.color)}">${esc(p.emoji)}</div>`;
const PEER_OPTS = { debug: 0 };

/* ================= PROFESSOR ================= */
let H = null;
function startHost(){
  show("sHost");
  const pin = String(Math.floor(100000 + Math.random()*900000));
  const peer = new Peer(PREFIX + pin, PEER_OPTS);
  H = { peer, pin, players:{}, q:-1, open:false, startAt:0, timer:null };
  peer.on("open", () => { $("pinOut").textContent = pin; });
  peer.on("error", e => {
    if (e.type === "unavailable-id") { peer.destroy(); startHost(); return; }
    $("hostInfo").textContent = "Erro de conexão (" + e.type + "). Recarregue a página.";
  });
  peer.on("connection", conn => {
    conn.on("data", d => onHostData(conn, d));
    conn.on("close", () => {
      const p = H.players[conn.peer];
      if (p && H.q < 0) { delete H.players[conn.peer]; renderLobby(); }
      else if (p) p.online = false;
    });
  });
}
function send(p, msg){ try { if (p.conn && p.conn.open) p.conn.send(msg); } catch(e){} }
function broadcast(msg){ Object.values(H.players).forEach(p => send(p, msg)); }

function onHostData(conn, d){
  if (!d || typeof d !== "object") return;
  if (d.t === "join"){
    const name = String(d.name||"").slice(0,14).trim() || "Jogador";
    const old = H.players[conn.peer];
    H.players[conn.peer] = { conn, name, emoji:String(d.emoji||"🐱").slice(0,4), color:String(d.color||"#333").slice(0,9), score: old?old.score:0, ans:null, online:true };
    send(H.players[conn.peer], { t:"joined", started: H.q >= 0 });
    if (H.q < 0) renderLobby();
  }
  if (d.t === "answer" && H.open && d.q === H.q){
    const p = H.players[conn.peer];
    if (!p || p.ans) return;
    const choice = Number(d.choice);
    if (!(choice >= 0 && choice < 4)) return;
    const elapsed = (Date.now() - H.startAt)/1000;
    const right = choice === QUESTIONS[H.q].ok;
    const pts = right ? Math.round(1000 * (1 - Math.min(elapsed,TIME)/TIME/2)) : 0;
    p.ans = { choice, pts, right };
    p.score += pts;
    send(p, { t:"wait" });
    const n = Object.values(H.players).filter(x=>x.ans).length;
    $("aCount").textContent = n;
    if (n >= Object.values(H.players).filter(x=>x.online).length) closeQuestion();
  }
}
function renderLobby(){
  const ps = Object.values(H.players);
  $("pCount").textContent = ps.length + (ps.length===1?" jogador":" jogadores");
  $("lobby").innerHTML = ps.map(p => `<div class="pl">${avatarHTML(p)}<span>${esc(p.name)}</span></div>`).join("");
  $("startBtn").disabled = ps.length === 0;
}
function hostView(id){ ["hLobby","hQ","hBoard","hEnd"].forEach(x=>$(x).classList.toggle("hidden", x!==id)); }

function nextQuestion(){
  H.q++;
  if (H.q >= QUESTIONS.length) return endGame();
  const Q = QUESTIONS[H.q];
  Object.values(H.players).forEach(p => p.ans = null);
  hostView("hQ");
  $("qTitle").textContent = `${H.q+1}/${QUESTIONS.length} · ${Q.title}`;
  $("qCode").textContent = Q.code;
  $("qOpts").innerHTML = Q.opts.map((o,i)=>`<div class="opt c${i}"><span class="shape">${SHAPES[i]}</span><span class="txt">${esc(o)}</span><span class="n" id="n${i}"></span></div>`).join("");
  $("qWhy").classList.add("hidden");
  $("toBoard").classList.add("hidden");
  $("aCount").textContent = "0";
  let left = TIME; $("tOut").textContent = left;
  H.open = true; H.startAt = Date.now();
  broadcast({ t:"question", q:H.q, total:QUESTIONS.length, opts:Q.opts });
  clearInterval(H.timer);
  H.timer = setInterval(()=>{ left--; $("tOut").textContent = Math.max(left,0); if (left<=0) closeQuestion(); }, 1000);
}
function closeQuestion(){
  if (!H.open) return;
  H.open = false; clearInterval(H.timer);
  const Q = QUESTIONS[H.q];
  const counts = [0,0,0,0];
  Object.values(H.players).forEach(p => { if (p.ans) counts[p.ans.choice]++; });
  document.querySelectorAll("#qOpts .opt").forEach((el,i)=>{
    el.classList.add(i===Q.ok ? "right" : "dim");
    $("n"+i).textContent = counts[i];
  });
  $("qWhy").textContent = "✔ " + Q.why;
  $("qWhy").classList.remove("hidden");
  $("toBoard").classList.remove("hidden");
  const ranked = rank();
  Object.values(H.players).forEach(p=>{
    send(p, { t:"result", right: !!(p.ans && p.ans.right), answered: !!p.ans, pts: p.ans ? p.ans.pts : 0, score:p.score, rank: ranked.indexOf(p)+1, of: ranked.length, correct: Q.opts[Q.ok] });
  });
}
function rank(){ return Object.values(H.players).sort((a,b)=>b.score-a.score); }
function boardHTML(list){
  return list.map((p,i)=>`<div class="row"><span>${i+1}º</span>${avatarHTML(p)}<span class="nm">${esc(p.name)}</span><span class="sc">${p.score}</span></div>`).join("");
}
function showBoard(){
  hostView("hBoard");
  $("board").innerHTML = boardHTML(rank().slice(0,5));
  $("nextQ").textContent = H.q+1 >= QUESTIONS.length ? "Ver pódio" : "Próxima pergunta";
}
function endGame(){
  hostView("hEnd");
  const r = rank();
  const order = [1,0,2], heights = [170,230,130];
  $("podium").innerHTML = order.filter(i=>r[i]).map(i=>{
    const p = r[i];
    return `<div class="pod">${avatarHTML(p)}<div class="name">${esc(p.name)}</div><div class="bar" style="height:${heights[order.indexOf(i)]}px">${i+1}º<small>${p.score} pts</small></div></div>`;
  }).join("");
  $("finalBoard").innerHTML = boardHTML(r.slice(3));
  r.forEach((p,i)=>send(p,{ t:"end", rank:i+1, of:r.length, score:p.score }));
}

/* ================= ALUNO ================= */
let P = { emoji: EMOJIS[Math.floor(Math.random()*EMOJIS.length)], color: COLORS[Math.floor(Math.random()*COLORS.length)], name:"" };
let conn = null, myPeer = null, curQ = -1;

function buildPickers(){
  $("emojiPick").innerHTML = EMOJIS.map(e=>`<button type="button" data-e="${e}" aria-pressed="${e===P.emoji}">${e}</button>`).join("");
  $("colorPick").innerHTML = COLORS.map(c=>`<button type="button" data-c="${c}" aria-label="cor" style="background:${c}" aria-pressed="${c===P.color}"></button>`).join("");
  updatePreview();
}
function updatePreview(){
  $("pvAv").style.background = P.color; $("pvAv").textContent = P.emoji;
  $("pvName").textContent = P.name || "Seu nome";
  document.querySelectorAll("#emojiPick button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.e===P.emoji));
  document.querySelectorAll("#colorPick button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.c===P.color));
}
function playerScreen(which){
  document.body.classList.remove("okbg","badbg");
  ["pWait","pGrid","pFeed"].forEach(x=>$(x).classList.toggle("hidden", x!==which));
}
function waitMsg(t, s, icon="⏳"){ playerScreen("pWait"); $("pWaitT").textContent=t; $("pWaitS").textContent=s; $("pWait").querySelector(".icon").textContent=icon; }

function joinGame(){
  P.name = $("nameIn").value.trim();
  if (!P.name){ $("profErr").textContent = "Digite um apelido."; return; }
  $("profErr").textContent = "Conectando...";
  $("doJoin").disabled = true;
  myPeer = new Peer(PEER_OPTS);
  myPeer.on("open", () => {
    conn = myPeer.connect(PREFIX + P.pin, { reliable:true });
    conn.on("open", () => conn.send({ t:"join", name:P.name, emoji:P.emoji, color:P.color }));
    conn.on("data", onPlayerData);
    conn.on("close", () => waitMsg("Conexão perdida", "Recarregue a página e entre de novo com o mesmo PIN.", "📡"));
  });
  myPeer.on("error", e => {
    $("doJoin").disabled = false;
    $("profErr").textContent = e.type === "peer-unavailable" ? "PIN não encontrado. Confira com o professor." : "Erro de conexão: " + e.type;
  });
}
function onPlayerData(d){
  if (!d || typeof d !== "object") return;
  if (d.t === "joined"){
    show("sPlayer");
    $("meTag").innerHTML = avatarHTML(P) + esc(P.name);
    waitMsg("Você entrou!", d.started ? "O jogo já começou. Você entra na próxima pergunta." : "Olhe para o telão e aguarde o professor começar.");
  }
  if (d.t === "question"){
    curQ = d.q;
    playerScreen("pGrid");
    $("pGrid").innerHTML = d.opts.map((o,i)=>`<button class="pbtn c${i}" data-i="${i}"><span class="shape">${SHAPES[i]}</span><span class="txt">${esc(o)}</span></button>`).join("");
  }
  if (d.t === "wait") waitMsg("Resposta enviada!", "Será que acertou? 🤔", "🚀");
  if (d.t === "result"){
    playerScreen("pFeed");
    document.body.classList.add(d.right ? "okbg" : "badbg");
    $("fIcon").textContent = d.right ? "✅" : (d.answered ? "❌" : "⌛");
    $("fTitle").textContent = d.right ? "Acertou!" : (d.answered ? "Errou!" : "Tempo esgotado!");
    $("fPts").textContent = d.right ? `+${d.pts} pontos` : `Resposta: ${d.correct}`;
    $("fRank").textContent = `Você está em ${d.rank}º de ${d.of} · ${d.score} pts`;
  }
  if (d.t === "end"){
    playerScreen("pFeed");
    $("fIcon").textContent = d.rank===1 ? "🥇" : d.rank===2 ? "🥈" : d.rank===3 ? "🥉" : "🎉";
    $("fTitle").textContent = `${d.rank}º lugar!`;
    $("fPts").textContent = `${d.score} pontos`;
    $("fRank").textContent = `de ${d.of} jogadores. Fim de jogo!`;
  }
}

/* ================= EVENTOS ================= */
$("goHost").onclick = startHost;
$("startBtn").onclick = nextQuestion;
$("toBoard").onclick = showBoard;
$("nextQ").onclick = nextQuestion;
$("goJoin").onclick = () => {
  const pin = $("pinIn").value.replace(/\D/g,"");
  if (pin.length !== 6){ $("homeErr").textContent = "O PIN tem 6 números."; return; }
  P.pin = pin; buildPickers(); show("sProfile"); $("nameIn").focus();
};
$("pinIn").addEventListener("keydown", e=>{ if(e.key==="Enter") $("goJoin").click(); });
$("nameIn").addEventListener("input", e=>{ P.name = e.target.value.trim(); updatePreview(); });
$("nameIn").addEventListener("keydown", e=>{ if(e.key==="Enter") joinGame(); });
$("emojiPick").onclick = e => { const b=e.target.closest("button"); if(b){ P.emoji=b.dataset.e; updatePreview(); } };
$("colorPick").onclick = e => { const b=e.target.closest("button"); if(b){ P.color=b.dataset.c; updatePreview(); } };
$("doJoin").onclick = joinGame;
$("pGrid").onclick = e => {
  const b = e.target.closest(".pbtn"); if (!b || !conn) return;
  conn.send({ t:"answer", q:curQ, choice:Number(b.dataset.i) });
  waitMsg("Enviando...", "", "🚀");
};
window.addEventListener("beforeunload", e => { if (H && H.q >= 0 && H.q < QUESTIONS.length){ e.preventDefault(); e.returnValue=""; } });
