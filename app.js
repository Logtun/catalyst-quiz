(() => {
"use strict";
const W = 1200, H = 675;
const SITE = location.origin; // this site's own address, wherever it is deployed
const SITE_SHORT = location.host;

// Questions 1-5 and 10 come from catalyst.app (meta description + FAQ at /faq), read Oct 18 and re-checked Oct 24, 2026.
// Questions 6-9 come from the Catalyst blog (catalyst.app/blog) and @catalystapp posts on X, read Oct 24, 2026.
const QUESTIONS = [
  { q: "What do you give Catalyst to get started?",
    a: ["A Python script for your trading bot", "What you believe, in a natural language", "Your exchange password", "A chart full of indicators"], c: 1,
    why: "Describe your intent, thesis or trade in plain English. Catalyst takes it from there.", src: "catalyst.app/faq" },
  { q: "Once you tell it your idea, what does Catalyst do?",
    a: ["Hands it to a human broker", "Sends you a reading list", "Researches it, builds a strategy, monitors events and executes trades", "Nothing until you code it yourself"], c: 2,
    why: "Catalyst researches your idea, builds a trading strategy, monitors events and executes trades autonomously.", src: "catalyst.app" },
  { q: "Which markets does Catalyst support?",
    a: ["Spot tokens, perpetuals, tokenized stocks and prediction markets", "Only Bitcoin", "Only US stocks", "Only forex"], c: 0,
    why: "All four, and you can combine them in one workflow. More onchain and offchain assets are coming soon.", src: "catalyst.app/faq" },
  { q: "How much does Catalyst cost right now?",
    a: ["A monthly subscription", "A fee on every trade", "A one-time license", "It’s free during the research preview"], c: 3,
    why: "Catalyst is free during its research preview.", src: "catalyst.app/faq" },
  { q: "Does Catalyst hold your funds?",
    a: ["Yes, it pools everyone’s deposits", "Only for bigger accounts", "No. It’s non-custodial and trades inside the limits you set", "Only while a trade is open"], c: 2,
    why: "Catalyst has no access to user funds. You set the budget, strategy and conditions, and can pause or change strategies anytime.", src: "catalyst.app/faq" },
  { q: "When did Catalyst launch in research preview?",
    a: ["September 25, 2026", "October 8, 2026", "October 16, 2026", "October 21, 2026"], c: 1,
    why: "“Catalyst launched in research preview on October 8.” The same day, it announced a $30M seed round led by Sequoia.", src: "catalyst.app/blog · “Introducing Catalyst”" },
  { q: "Whose trades can you now copy on Catalyst?",
    a: ["Only Catalyst’s own in-house trading team", "Verified members of a paid VIP signal group", "Hyperliquid traders and Polymarket portfolios", "Only big accounts on centralized exchanges"], c: 2,
    why: "“Hyperliquid traders are now available to copy, and a Polymarket portfolio can be copied by giving Chat a username.”", src: "catalyst.app/blog · “What’s New: October 9 to October 16”" },
  { q: "What do X signals for Catalyst do?",
    a: ["Turn anyone’s market calls into trades", "Automatically post every trade you make to X", "Show how many followers a coin has", "Let you DM Catalyst’s team on X"], c: 0,
    why: "“Catalyst turns anyone’s market calls (and opinions) into trades.” It works on stocks, commodities, crypto, perps and prediction markets. Just tell Catalyst who to follow.", src: "@catalystapp on X · Oct 19, 2026" },
  { q: "What does Catalyst Earn offer?",
    a: ["Points you can swap for a future token", "A fixed 20% yearly return on every trade", "Cashback each time you invite a friend", "Up to 8% APY on your cash in Catalyst"], c: 3,
    why: "Opt in to earn up to 8% APY on your cash in Catalyst. Powered by Tempo and Privy.", src: "@catalystapp on X · Oct 21, 2026" },
  { q: "What is Catalyst Cash?",
    a: ["A cashback rewards program", "The system that routes your capital across venues automatically", "A prepaid debit card", "A token you stake for rewards"], c: 1,
    why: "Catalyst Cash is the internal capital routing system: deposit once and it routes your capital to any venue, no manual bridging.", src: "catalyst.app/faq" }
];
const BANDS = [
  { t: "Waitlist Rookie", s: "Every OG started somewhere." },
  { t: "Fresh Recruit", s: "Welcome in. Retake and level up." },
  { t: "Signal Seeker", s: "On the right track." },
  { t: "Strategy Builder", s: "Solid. You know the basics." },
  { t: "True Believer", s: "So close to perfect." },
  { t: "Catalyst OG", s: "Knows Catalyst inside out." }
];
// Score out of 10 -> band: 0-1 Rookie, 2-3 Recruit, 4-5 Seeker, 6-7 Builder, 8-9 Believer, 10 OG.
const bandFor = (n) => BANDS[n >= 10 ? 5 : Math.floor(n / 2)];
const TOTAL = QUESTIONS.length;

const T = { bg: "#0e0e0e", accent: "#fa5000", glowA: "rgba(250,80,0,0.55)", glowB: "rgba(116,170,216,0.16)", text: "#ffffff", sub: "#a39d95", card: "rgba(255,255,255,0.045)", cardLine: "rgba(255,255,255,0.11)", grid: "rgba(255,255,255,0.045)", onAccent: "#ffffff", blue: "#74aad8", yellow: "#ffbe5b" };

const $ = (id) => document.getElementById(id);
const canvas = $("card"), ctx = canvas.getContext("2d");
const els = { handle: $("handle") };
const state = { avatar: null, avatarUrl: "", xName: "", answers: [], idx: 0, score: 0 };

const STORE = "catalystQuiz1";
try { const sv = JSON.parse(localStorage.getItem(STORE) || "{}"); if (sv.handle) els.handle.value = sv.handle; } catch (e) {}
function persist() { try { localStorage.setItem(STORE, JSON.stringify({ handle: els.handle.value })); } catch (e) {} }

function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
const assets = {};
const ready = Promise.all([
  loadImg("assets/mark.png").then((i) => (assets.mark = i)),
  loadImg("assets/word.png").then((i) => (assets.word = i)),
  document.fonts ? Promise.all([
    document.fonts.load('700 40px "BDO"'), document.fonts.load('500 20px "BDO"'), document.fonts.load('400 20px "BDO"')
  ]).catch(() => {}) : Promise.resolve()
]);
// ---------- helpers ----------
const F = (w, s) => `${w} ${s}px "BDO", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function setLS(px) { if ("letterSpacing" in ctx) ctx.letterSpacing = px + "px"; }
function fitFont(text, weight, max, min, width) {
  let s = max;
  for (; s > min; s -= 1) { ctx.font = F(weight, s); if (ctx.measureText(text).width <= width) break; }
  ctx.font = F(weight, s); return s;
}
function wrap(text, width) {
  const words = text.split(/\s+/).filter(Boolean), lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width <= width || !line) line = t; else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}
function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "C";
  const a = Array.from(parts[0])[0] || "";
  const b = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] || "") : (Array.from(parts[0])[1] || "");
  return (a + b).toUpperCase();
}
function cleanHandle(h) { return h.trim().replace(/^@+/, "").replace(/\s+/g, ""); }
// The card name: the X display name from the lookup; if X has none for this handle, the handle itself (no @).
function displayName() { return (state.xName || "").trim() || cleanHandle(els.handle.value); }
function hexPath(cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; ctx[i ? "lineTo" : "moveTo"](cx + r * Math.cos(a), cy + r * Math.sin(a)); }
  ctx.closePath();
}


// ---------- card ----------
let drawVer = 0, raf = 0;
function schedule() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; draw(); persist(); }); }
function draw() {
  drawVer++; queuePre();
  const handle = cleanHandle(els.handle.value);
  const hasHandle = HANDLE_RE.test(handle);
  const name = hasHandle ? displayName() : "Catalyst quiz";
  const n = state.score, band = bandFor(n);
  ctx.save();
  ctx.clearRect(0, 0, W, H); setLS(0);
  ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(1080, -40, 0, 1080, -40, 640);
  g.addColorStop(0, T.glowA); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(80, 720, 0, 80, 720, 520);
  g.addColorStop(0, T.glowB); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = T.grid; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 0.5; x < W; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 0.5; y < H; y += 50) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 820);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.45)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // logo: the real Catalyst mark + wordmark (image assets, never redrawn)
  if (assets.mark) ctx.drawImage(assets.mark, 64, 52, 56, 56);
  if (assets.word) { const wh = 43, ww = wh * assets.word.width / assets.word.height; ctx.drawImage(assets.word, 132, 62, ww, wh); }

  // pill top right
  ctx.textBaseline = "middle"; ctx.font = F(700, 17); setLS(1.6);
  { const txt = "QUIZ RESULT", tw = ctx.measureText(txt).width, pw = tw + 70, ph = 44, x = W - 64 - pw, y = 58;
    rr(x, y, pw, ph, ph / 2); ctx.fillStyle = T.accent; ctx.fill();
    hexPath(x + 30, y + ph / 2, 10); ctx.fillStyle = T.onAccent; ctx.fill();
    ctx.textAlign = "left"; ctx.fillText(txt, x + 50, y + ph / 2 + 1); }
  setLS(0);

  // headline
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  setLS(-2);
  const hs = fitFont("know Catalyst?", 700, 66, 40, 540);
  ctx.fillStyle = T.text; ctx.fillText("How well do I", 64, 214);
  ctx.fillStyle = T.accent; ctx.fillText("know Catalyst?", 64, 214 + hs * 1.04);
  setLS(0);
  ctx.font = F(500, 23); ctx.fillStyle = T.sub;
  ctx.fillText("10 questions, straight from catalyst.app.", 64, 214 + hs * 1.04 + 50);

  // avatar
  const ax = 64, ay = 418, ad = 124, acx = ax + ad / 2, acy = ay + ad / 2;
  ctx.beginPath(); ctx.arc(acx, acy, ad / 2 + 7, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = T.accent; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(acx, acy, ad / 2, 0, Math.PI * 2); ctx.clip();
  if (hasHandle && state.avatar) {
    const im = state.avatar, sq = Math.min(im.width, im.height);
    ctx.drawImage(im, (im.width - sq) / 2, (im.height - sq) / 2, sq, sq, ax, ay, ad, ad);
  } else if (hasHandle) {
    const og = ctx.createLinearGradient(ax, ay, ax + ad, ay + ad); og.addColorStop(0, "#ff7a2e"); og.addColorStop(1, "#c93d00");
    ctx.fillStyle = og; ctx.fillRect(ax, ay, ad, ad);
    ctx.fillStyle = "#fff"; ctx.font = F(700, 48); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(initials(name), acx, acy + 2);
  } else {
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(ax, ay, ad, ad);
    if (assets.mark) ctx.drawImage(assets.mark, acx - 34, acy - 34, 68, 68);
  }
  ctx.restore();
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const nx = ax + ad + 30;
  fitFont(name, 700, 40, 22, 660 - nx - 20); ctx.fillStyle = T.text; ctx.fillText(name, nx, acy - 4);
  ctx.font = F(500, 23); ctx.fillStyle = T.sub;
  let sub = hasHandle ? "@" + handle : "Can you beat this score?";
  while (ctx.measureText(sub).width > 660 - nx - 20 && sub.length > 4) sub = sub.slice(0, -2) + "…";
  ctx.fillText(sub, nx, acy + 32);

  // score panel
  const px = 680, py = 150, pw = 456, ph = 400;
  rr(px, py, pw, ph, 26); ctx.fillStyle = "rgba(14,14,14,0.72)"; ctx.fill();
  ctx.fillStyle = T.card; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = T.cardLine; ctx.stroke();
  ctx.textBaseline = "middle"; ctx.font = F(700, 16); setLS(1.6);
  ctx.beginPath(); ctx.arc(px + 40, py + 46, 6, 0, Math.PI * 2); ctx.fillStyle = T.accent; ctx.fill();
  ctx.fillStyle = T.text; ctx.fillText("MY SCORE", px + 56, py + 47);
  ctx.textAlign = "right"; ctx.fillStyle = T.sub; ctx.fillText("10 QUESTIONS", px + pw - 32, py + 47);
  setLS(0);
  // big score
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.font = F(700, 176); setLS(-6);
  const big = String(n), bw = ctx.measureText(big).width;
  ctx.font = F(700, 84); const slash = "/" + TOTAL, sw = ctx.measureText(slash).width;
  const sx = px + (pw - bw - sw + 2) / 2, sy = py + 228;
  ctx.font = F(700, 176); ctx.fillStyle = T.accent; ctx.fillText(big, sx, sy);
  ctx.font = F(700, 84); ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.fillText(slash, sx + bw - 2, sy);
  setLS(-0.5);
  ctx.textAlign = "center"; fitFont(band.t, 700, 42, 26, pw - 60); ctx.fillStyle = T.text;
  ctx.fillText(band.t, px + pw / 2, py + 286);
  setLS(0);
  // ten answer marks: one row, glyph over question number
  const mw = 36, gap = 6, rowW = mw * TOTAL + gap * (TOTAL - 1), mx0 = px + (pw - rowW) / 2, my = py + 316, mh = 54;
  for (let i = 0; i < TOTAL; i++) {
    const ok = !!state.answers[i], x = mx0 + i * (mw + gap);
    rr(x, my, mw, mh, 10);
    if (ok) { ctx.fillStyle = T.accent; ctx.fill(); }
    else { ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.stroke(); }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = ok ? T.onAccent : T.sub;
    ctx.font = F(700, 25); ctx.fillText(ok ? "✓" : "✕", x + mw / 2, my + 21);
    ctx.font = F(600, 13); ctx.fillStyle = ok ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)";
    ctx.fillText("Q" + (i + 1), x + mw / 2, my + 41);
  }

  // footer strip
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(64, 600.5); ctx.lineTo(W - 64, 600.5); ctx.stroke();
  ctx.font = F(700, 21); ctx.fillStyle = T.accent; ctx.fillText("Take the quiz", 64, 637);
  const tq = ctx.measureText("Take the quiz ").width;
  ctx.font = F(500, 21); ctx.fillStyle = T.text; ctx.fillText("→ " + SITE_SHORT, 64 + tq, 637);
  ctx.textAlign = "right"; ctx.font = F(500, 18); ctx.fillStyle = T.sub;
  ctx.fillText("made by @iamlogtun · not official", W - 64, 637);
  ctx.restore();
}

// ---------- X lookup: display name + photo from the handle ----------
const xl = { box: $("xLookup"), av: $("xlAv"), text: $("xlText") };
let avatarSource = "none"; // "x" | "none"
let lookupTimer = 0, lookupSeq = 0, lookupCtl = null, lastLooked = "";
const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
function setLookup(st, html, avUrl) {
  xl.box.dataset.state = st; xl.text.innerHTML = html;
  xl.av.style.backgroundImage = avUrl ? `url("${avUrl}")` : "";
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function withTimeout(ms, outer) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  if (outer) outer.addEventListener("abort", () => c.abort());
  return { signal: c.signal, done: () => clearTimeout(t) };
}
// Fetch an image as a blob (CORS) and copy it onto our own canvas, so the card canvas
// never gets tainted and Download / Share / Copy keep working.
async function blobAvatar(url, outer) {
  const to = withTimeout(8000, outer);
  try {
    const r = await fetch(url, { mode: "cors", signal: to.signal, credentials: "omit" });
    if (!r.ok) throw new Error("img " + r.status);
    const b = await r.blob();
    if (!/^image\//.test(b.type) || b.size < 200) throw new Error("not an image");
    const u = URL.createObjectURL(b);
    try {
      const im = await loadImg(u);
      const s = Math.min(im.naturalWidth, im.naturalHeight), size = Math.min(s, 400);
      const c = document.createElement("canvas"); c.width = c.height = size;
      c.getContext("2d").drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      return { canvas: c, thumb: c.toDataURL("image/jpeg", 0.8) };
    } finally { URL.revokeObjectURL(u); }
  } finally { to.done(); }
}
async function fetchProfile(handle, outer) {
  const to = withTimeout(7000, outer);
  try {
    const r = await fetch("https://api.fxtwitter.com/" + encodeURIComponent(handle), { signal: to.signal, credentials: "omit" });
    const j = await r.json().catch(() => null);
    if (!j || !j.user) return { notFound: r.status === 404 || (j && j.code === 404) };
    return { name: j.user.name, screen: j.user.screen_name, avatar: j.user.avatar_url };
  } finally { to.done(); }
}
async function lookup(handle) {
  const seq = ++lookupSeq;
  if (lookupCtl) lookupCtl.abort();
  const ctl = (lookupCtl = new AbortController());
  lastLooked = handle.toLowerCase();
  setLookup("loading", `Looking up @${esc(handle)} on X…`);
  let prof = null;
  try { prof = await fetchProfile(handle, ctl.signal); } catch (e) { prof = null; }
  if (seq !== lookupSeq) return;
  if (prof && prof.name) {
    state.xName = prof.name;
    if (prof.screen && prof.screen.toLowerCase() === handle.toLowerCase() && prof.screen !== els.handle.value && document.activeElement !== els.handle) els.handle.value = prof.screen;
    schedule();
  }
  // photo: X's own image first (full size), then unavatar as a fallback
  let av = null;
  {
    const urls = [];
    if (prof && prof.avatar) urls.push(prof.avatar.replace(/_normal(\.[a-z]+)$/i, "_400x400$1"), prof.avatar);
    urls.push("https://unavatar.io/x/" + encodeURIComponent(handle) + "?fallback=false");
    for (const u of urls) {
      try { av = await blobAvatar(u, ctl.signal); av.url = u; break; } catch (e) { if (seq !== lookupSeq) return; }
    }
    if (seq !== lookupSeq) return;
    if (av) { state.avatar = av.canvas; state.avatarUrl = av.url; avatarSource = "x"; schedule(); }
  }
  if (prof && prof.name) {
    setLookup("found", `✓ <b>${esc(prof.name)}</b>${av ? "" : " <span class=\"muted\">(no photo, using initials)</span>"}`, av ? av.thumb : "");
  } else if (prof && prof.notFound) {
    setLookup("error", `Couldn’t find @${esc(handle)} on X. Check the spelling. Your handle will show as your name for now.`, av ? av.thumb : "");
  } else {
    setLookup("error", `Couldn’t reach X right now. Your handle will show as your name${av ? "" : ", with initials for the photo"}.`, av ? av.thumb : "");
  }
}
function onHandleInput(immediate) {
  clearTimeout(lookupTimer);
  const h = cleanHandle(els.handle.value);
  if (!h) {
    lookupSeq++; if (lookupCtl) lookupCtl.abort(); lastLooked = "";
    state.xName = "";
    if (avatarSource === "x") { state.avatar = null; state.avatarUrl = ""; avatarSource = "none"; }
    setLookup("idle", "Enter your handle and we’ll pull your X name and photo.");
    schedule(); return;
  }
  if (!HANDLE_RE.test(h)) { setLookup("error", "X handles are letters, numbers and _ only (max 15)."); schedule(); return; }
  if (h.toLowerCase() === lastLooked) return;
  // a different person: don't keep the previous person's auto-filled name/photo
  state.xName = "";
  if (avatarSource === "x") { state.avatar = null; state.avatarUrl = ""; avatarSource = "none"; }
  schedule();
  setLookup("loading", `Looking up @${esc(h)} on X…`);
  lookupTimer = setTimeout(() => lookup(h), immediate ? 0 : 650);
}

// ---------- screens ----------
const screens = ["sIntro", "sHandle", "sQuiz", "sResult"];
function show(id) {
  for (const s of screens) $(s).hidden = s !== id;
  window.scrollTo(0, 0);
  const h = $(id).querySelector("h1, h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
}
$("btnStart").addEventListener("click", () => { show("sHandle"); updateNext(); });
function updateNext() { $("btnHandleNext").textContent = cleanHandle(els.handle.value) ? "Start the quiz →" : "Skip, start the quiz →"; }
els.handle.addEventListener("input", () => { updateNext(); schedule(); onHandleInput(false); });
els.handle.addEventListener("change", () => onHandleInput(true));
els.handle.addEventListener("blur", () => { els.handle.value = cleanHandle(els.handle.value); schedule(); });
els.handle.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("btnHandleNext").click(); } });
$("btnHandleNext").addEventListener("click", () => { els.handle.value = cleanHandle(els.handle.value); persist(); startQuiz(); });

function startQuiz() { state.answers = []; state.idx = 0; state.score = 0; renderQ(); show("sQuiz"); }
const LETTERS = ["A", "B", "C", "D"];
function renderQ() {
  const i = state.idx, Q = QUESTIONS[i];
  $("qCount").textContent = `Question ${i + 1} of ${QUESTIONS.length}`;
  $("qScore").textContent = `${state.score} correct`;
  $("qBar").style.width = `${(i / QUESTIONS.length) * 100}%`;
  $("qText").textContent = Q.q;
  const box = $("qOpts"); box.replaceChildren();
  Q.a.forEach((txt, k) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "opt"; b.dataset.k = k;
    const l = document.createElement("span"); l.className = "opt-l"; l.textContent = LETTERS[k];
    const t = document.createElement("span"); t.className = "opt-t"; t.textContent = txt;
    b.append(l, t);
    b.addEventListener("click", () => answer(k));
    box.append(b);
  });
  $("qFeedback").hidden = true;
  $("btnNext").hidden = true;
}
function answer(k) {
  const Q = QUESTIONS[state.idx];
  if (state.answers.length > state.idx) return;
  const ok = k === Q.c;
  state.answers.push(ok); if (ok) state.score++;
  document.querySelectorAll("#qOpts .opt").forEach((b) => {
    const kk = +b.dataset.k; b.disabled = true;
    if (kk === Q.c) b.classList.add("right");
    else if (kk === k) b.classList.add("wrong");
    else b.classList.add("dim");
  });
  $("qScore").textContent = `${state.score} correct`;
  $("qBar").style.width = `${((state.idx + 1) / QUESTIONS.length) * 100}%`;
  const fb = $("qFeedback");
  fb.className = "feedback " + (ok ? "ok" : "no");
  $("fbHead").textContent = ok ? "Correct!" : "Not quite.";
  $("fbWhy").textContent = Q.why;
  $("fbSrc").textContent = "Source: " + (Q.src || "catalyst.app");
  fb.hidden = false;
  const nx = $("btnNext");
  nx.textContent = state.idx === QUESTIONS.length - 1 ? "See my score →" : "Next question →";
  nx.hidden = false; nx.focus({ preventScroll: true });
  fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
$("btnNext").addEventListener("click", () => {
  if (state.idx < QUESTIONS.length - 1) { state.idx++; renderQ(); window.scrollTo(0, 0); }
  else finish();
});
function finish() {
  const n = state.score, band = bandFor(n);
  $("rScore").textContent = n;
  $("rTitle").textContent = band.t;
  $("rSub").textContent = band.s;
  draw();
  show("sResult");
}
$("btnRetake").addEventListener("click", () => startQuiz());

// ---------- output ----------
function fileName() {
  const h = cleanHandle(els.handle.value).replace(/[^A-Za-z0-9_]/g, "");
  return `catalyst-quiz${h ? "-" + h : ""}-${state.score}of10.png`;
}
function getBlob() { draw(); return new Promise((res) => canvas.toBlob((b) => res(b), "image/png")); }
function shareText() {
  return `I scored ${state.score}/10 on the "How well do you know @catalystapp?" quiz 🧡\n\nCatalyst is an AI powered financial intelligence and trading platform. Tell it what you believe, it researches, builds the strategy and trades it for you.\n\nJoin us —> catalyst.app\n\nTake the quiz —> ${SITE}`;
}
function intentUrl() { return "https://x.com/intent/tweet?text=" + encodeURIComponent(shareText()); }
const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isInApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|Twitter|; wv\)/i.test(navigator.userAgent);

let lastUrl = null;
function showModal(url, withX) {
  $("modalImg").src = url;
  $("modalTitle").textContent = withX ? "Save your card, then post" : "Save your card";
  $("modalSteps").innerHTML = withX
    ? "Press and hold the image, tap <strong>Save to Photos</strong>, then tap <strong>Open X</strong> and attach it to your post."
    : "Press and hold the image, then tap <strong>Save to Photos</strong>.";
  const ox = $("modalOpenX"); ox.hidden = !withX; if (withX) ox.href = intentUrl();
  $("modal").hidden = false;
}

$("btnDownload").addEventListener("click", async () => {
  const blob = await getBlob();
  if (!blob) return toast("Something went wrong. Try again.");
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = URL.createObjectURL(blob);
  if (isIOS || isInApp) { showModal(lastUrl, false); return; }
  const a = document.createElement("a");
  a.href = lastUrl; a.download = fileName(); document.body.append(a); a.click(); a.remove();
  toast("Card downloaded. Now flex it on X.");
});

// Phones: share the card PNG + text through the native share sheet (pick X → image attached).
var canShareFiles = false;
try {
  const probe = new File([new Blob(["x"], { type: "image/png" })], "probe.png", { type: "image/png" });
  canShareFiles = !!(navigator.share && navigator.canShare && navigator.canShare({ files: [probe] }));
} catch (e) {}
var pre = { ver: -1, blob: null, file: null };
var preTimer = 0;
function queuePre() {
  clearTimeout(preTimer);
  preTimer = setTimeout(() => {
    const v = drawVer;
    canvas.toBlob((b) => { if (b && v === drawVer) pre = { ver: v, blob: b, file: new File([b], fileName(), { type: "image/png" }) }; }, "image/png");
  }, 250);
}
function blobNowSync() {
  const d = canvas.toDataURL("image/png"), bin = atob(d.split(",")[1]), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type: "image/png" });
}
function currentFile() {
  if (raf) { cancelAnimationFrame(raf); raf = 0; draw(); persist(); }
  if (pre.file && pre.ver === drawVer && pre.file.name === fileName()) return pre.file;
  const b = blobNowSync();
  pre = { ver: drawVer, blob: b, file: new File([b], fileName(), { type: "image/png" }) };
  return pre.file;
}
const shareDbg = (window.__shareDbg = { branch: "", intent: "", text: "" });
function fallbackShare(blob) {
  shareDbg.intent = intentUrl();
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = URL.createObjectURL(blob);
  if (isIOS || isInApp) { shareDbg.branch = "modal"; showModal(lastUrl, true); return; }
  shareDbg.branch = "download";
  const a = document.createElement("a");
  a.href = lastUrl; a.download = fileName(); document.body.append(a); a.click(); a.remove();
  let copy = Promise.resolve(false);
  try {
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write && !isIOS)
      copy = navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(() => true, () => false);
  } catch (e) {}
  const late = new Promise((r) => setTimeout(() => r(false), 700));
  Promise.race([copy, late]).then((copied) => {
    shareDbg.copied = copied;
    toast(copied ? "Card saved, attach it to your post 📎 (on desktop you can paste with Ctrl/Cmd+V)"
                 : "Card saved, attach it to your post 📎", null, 9000);
    setTimeout(() => {
      const w = window.open(shareDbg.intent, "_blank");
      if (w) { try { w.opener = null; } catch (e) {} }
      shareDbg.opened = !!w;
      if (!w) toast("Card saved 📎 Now open X and attach it.", { label: "Open X →", href: shareDbg.intent }, 12000);
    }, 600);
  });
}
$("btnShareX").addEventListener("click", () => {
  const file = currentFile();
  shareDbg.text = shareText();
  if (canShareFiles) {
    shareDbg.branch = "share";
    let p;
    try { p = navigator.share({ files: [file], text: shareDbg.text }); }
    catch (e) { return fallbackShare(file); }
    p.then(() => {}, (e) => { if (!e || e.name !== "AbortError") fallbackShare(file); });
    return;
  }
  fallbackShare(file);
});
$("modalClose").addEventListener("click", () => ($("modal").hidden = true));
$("modal").addEventListener("click", (e) => { if (e.target.id === "modal") $("modal").hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("modal").hidden = true; });

let tt = 0;
function toast(msg, action, ms) {
  const t = $("toast"); t.textContent = msg;
  if (action) { const a = document.createElement("a"); a.href = action.href; a.target = "_blank"; a.rel = "noopener"; a.textContent = action.label; a.className = "toast-act"; t.append(" ", a); }
  t.classList.toggle("act", !!action); t.classList.add("show");
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), ms || 3200);
}

updateNext();
draw();
ready.then(() => { draw(); document.documentElement.dataset.ready = "1"; });
window.__quiz = { state, QUESTIONS, BANDS, bandFor, draw, getBlob, shareText, intentUrl, lookup, canShareFiles: () => canShareFiles };
if (cleanHandle(els.handle.value)) onHandleInput(true);
})();
