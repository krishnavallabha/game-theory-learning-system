/* ===== Game Theory Quiz 1 Dashboard — application engine ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const DAY = 864e5;

/* ---------- registry ---------- */
const CON = {}; CONCEPTS.forEach(c => CON[c.id] = c);
const QS = {}; QUESTIONS.forEach(q => { if (QS[q.id]) console.warn('dup question id', q.id); QS[q.id] = q; });
const ORDER = []; WEEKS.forEach(w => w.topics.forEach(t => t.cs.forEach(id => { if (!CON[id]) console.warn('missing concept', id); else ORDER.push(id); })));
CONCEPTS.forEach(c => { if (!ORDER.includes(c.id)) console.warn('concept not in syllabus', c.id); });
QUESTIONS.forEach(q => (q.cs || []).forEach(id => { if (!CON[id]) console.warn('question', q.id, 'bad concept', id); }));
const topicOf = {}; WEEKS.forEach(w => w.topics.forEach(t => t.cs.forEach(id => topicOf[id] = { w: w.n, t: t.title })));
const qsFor = cid => QUESTIONS.filter(q => (q.cs || []).includes(cid));
const autoGradable = q => q.type !== 'short';
const VARS = {}; QUESTIONS.filter(q => q.varOf).forEach(q => [].concat(q.varOf).forEach(k => VARS[k] = q));

/* ---------- persistence ---------- */
const KEY = 'gtdash.v1';
let S = { studied: {}, att: {}, mocks: [], cards: {}, theme: null };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
const BOXDAYS = [0, 0, 1, 3, 7, 15];

function record(q, resp, ok, mode) {
  const a = S.att[q.id] || { n: 0, c: 0, hist: [], box: 0, due: 0 };
  a.n++; if (ok) a.c++;
  a.hist = (a.hist || []).concat(ok ? 1 : 0).slice(-6);
  a.last = { r: resp, ok, t: Date.now(), mode: mode || 'practice' };
  if (ok) { a.box = Math.min((a.box || 0) + 1, 5); a.due = Date.now() + BOXDAYS[a.box] * DAY; }
  else { a.box = 1; a.due = Date.now(); }
  S.att[q.id] = a; save(); refreshSide();
}
function conceptStats(cid) {
  const qs = qsFor(cid).filter(autoGradable);
  const done = qs.filter(q => S.att[q.id]);
  const ok = done.filter(q => S.att[q.id].last.ok).length;
  const acc = done.length ? ok / done.length : null;
  return { total: qs.length, done: done.length, ok, acc, mastered: done.length >= 3 && acc >= 0.8 };
}
const dueList = () => QUESTIONS.filter(q => S.att[q.id] && S.att[q.id].due <= Date.now() && autoGradable(q));
const errorList = () => QUESTIONS.filter(q => S.att[q.id] && S.att[q.id].last && S.att[q.id].last.ok === false);

/* ---------- theme ---------- */
function applyTheme() { if (S.theme) document.documentElement.setAttribute('data-theme', S.theme); else document.documentElement.removeAttribute('data-theme'); }
applyTheme();

/* ---------- math ---------- */
let mathOK = true;
function typeset(el) {
  if (window.MathJax && MathJax.typesetPromise) { MathJax.typesetClear && MathJax.typesetClear([el]); MathJax.typesetPromise([el]).catch(() => { }); }
}
function mathFallback() {
  if (window.MathJax && MathJax.typesetPromise) return;
  mathOK = false; document.body.classList.add('tex-fallback');
  const b = $('#mathBanner'); if (b) b.style.display = 'block';
}

/* ---------- grading ---------- */
function parseNum(s) {
  s = String(s).trim().replace(/\s/g, ''); if (!s) return NaN;
  if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split('/').map(Number); return a / b; }
  return Number(s);
}
function grade(q, r) {
  if (q.type === 'mcq') return r === q.ans;
  if (q.type === 'msq') { const a = [...q.ans].sort().join(), b = [...(r || [])].sort().join(); return a === b; }
  if (q.type === 'num') { const x = parseNum(r); return !isNaN(x) && Math.abs(x - q.ans) <= (q.tol ?? 0.005); }
  return !!r;
}
const L = i => String.fromCharCode(65 + i);
function ansText(q, r) {
  if (r === null || r === undefined || r === '') return '<em>no answer</em>';
  if (q.type === 'mcq') return `(${L(r)}) ${q.opts[r]}`;
  if (q.type === 'msq') return r.length ? r.map(i => `(${L(i)}) ${q.opts[i]}`).join('; ') : '<em>none selected</em>';
  if (q.type === 'num') return esc(r);
  return r === true ? 'self-marked correct' : 'self-marked incorrect';
}
const correctText = q => q.type === 'num' ? (q.ansText || String(q.ans)) : q.type === 'short' ? 'see model answer' : ansText(q, q.ans);

/* ---------- question rendering ---------- */
function badges(q) {
  let h = '';
  if (q.src === 'PYQ') h += `<span class="tag pyq">PYQ · ${q.paper} · Q${q.qno}</span><span class="tag">${q.otype}${q.marks != null ? ' · ' + q.marks + ' mark' + (q.marks == 1 ? '' : 's') : ''}</span>`;
  else if (q.src === 'GA') h += `<span class="tag ga">COURSE ASSIGNMENT (not a quiz PYQ)</span>`;
  else if (q.src === 'VAR') h += `<span class="tag var">MODIFIED VARIATION · NEW PRACTICE</span>`;
  else h += `<span class="tag new">NEW PRACTICE</span>`;
  h += `<span class="tag">${q.diff}</span><span class="tag">${q.cat}</span>`;
  if (q.type === 'msq') h += `<span class="tag">select all that apply</span>`;
  if (q.type === 'short') h += `<span class="tag">self-graded</span>`;
  return h;
}
function qHTML(q, uid) {
  let h = `<div class="q" id="${uid}" data-q="${q.id}"><div class="qh">${badges(q)}<span class="muted small" style="margin-left:auto">${q.id}</span></div>`;
  if (q.ctx) h += `<details class="ctx" ${q.ctxOpen === false ? '' : 'open'}><summary>Question context</summary>${q.ctx}</details>`;
  h += `<div class="stem">${q.stem}</div><div class="resp">`;
  if (q.type === 'mcq' || q.type === 'msq') h += q.opts.map((o, i) => `<label class="opt"><input type="${q.type === 'mcq' ? 'radio' : 'checkbox'}" name="${uid}-o" value="${i}"><span><b>${L(i)}.</b> ${o}</span></label>`).join('');
  else if (q.type === 'num') h += `<input class="numin" type="text" inputmode="decimal" placeholder="Enter a number or fraction, e.g. 5/13" style="width:260px">`;
  else h += `<textarea class="shortin" rows="4" style="width:100%" placeholder="Write your reasoning before revealing the model answer."></textarea>`;
  h += `</div><div class="actions row" style="margin-top:8px"></div><div class="out"></div></div>`;
  return h;
}
function readResp(box, q) {
  if (q.type === 'mcq') { const c = $('input:checked', box); return c ? +c.value : null; }
  if (q.type === 'msq') return $$('input:checked', box).map(c => +c.value);
  if (q.type === 'num') return $('.numin', box).value.trim();
  return null;
}
function solHTML(q, resp) {
  let h = '<div class="sol">';
  if (q.type === 'short') h += `<h5>Model answer</h5>${q.sol}`;
  else {
    h += `<div><b>Correct answer:</b> ${correctText(q)}</div>`;
    if (q.src === 'PYQ') h += `<div class="small muted" style="margin-top:4px">${q.key === 'official' ? 'Official answer key (green tick in the supplied paper) — independently re-derived below and confirmed.' : 'No official key in the supplied file — answer independently derived.'}${q.keyNote ? ' ' + q.keyNote : ''}</div>`;
    h += `<h5>Step-by-step solution</h5>${q.sol}`;
  }
  if (q.why && q.why.length) h += `<h5>Why each option is right or wrong</h5><ul class="why">${q.why.map((w, i) => w ? `<li><b>${L(i)}.</b> ${w}</li>` : '').join('')}</ul>`;
  if (q.concept) h += `<h5>Underlying concept</h5>${q.concept}`;
  if (q.trap) h += `<h5>Common traps</h5>${q.trap}`;
  const cl = (q.cs || []).map(id => CON[id] ? `<a href="#/c/${id}">${CON[id].title}</a>` : '').join(' · ');
  if (cl) h += `<div class="small" style="margin-top:8px">Concepts: ${cl}</div>`;
  if (VARS[q.id]) h += `<details class="reveal" style="margin-top:10px"><summary>Try the modified variation (NEW — not a PYQ)</summary><div class="varslot" data-v="${VARS[q.id].id}"></div></details>`;
  return h + '</div>';
}
let uidN = 0;
function mountQ(container, q, opts = {}) {
  const uid = 'q' + (++uidN);
  const wrap = document.createElement('div'); wrap.innerHTML = qHTML(q, uid); const box = wrap.firstElementChild; container.appendChild(box);
  if (opts.mode === 'mock') { return { box, read: () => readResp(box, q) }; }
  const act = $('.actions', box), out = $('.out', box);
  const prev = S.att[q.id];
  const status = () => { const a = S.att[q.id]; return a ? `<span class="small muted">Attempts: ${a.n} · last: ${a.last.ok ? '<span class="pill-ok">correct</span>' : '<span class="pill-no">incorrect</span>'}</span>` : ''; };
  function finish(resp, ok, revealOnly) {
    $$('input,textarea', box).forEach(i => i.disabled = true);
    if (q.type === 'mcq' || q.type === 'msq') $$('.opt', box).forEach((o, i) => {
      const isAns = q.type === 'mcq' ? i === q.ans : q.ans.includes(i);
      const picked = q.type === 'mcq' ? resp === i : (resp || []).includes(i);
      if (isAns) o.classList.add('right'); else if (picked) o.classList.add('wrong');
    });
    let fb = '';
    if (q.type !== 'short') fb = revealOnly ? `<div class="fb no"><b>Revealed without answering</b> — recorded as incorrect so it returns in spaced revision.</div>` : `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct.' : 'Not correct.'}</b> ${!ok ? 'Your answer: ' + ansText(q, resp) + '.' : ''} ${!ok && q.type === 'mcq' && q.why && q.why[resp] ? '<div style="margin-top:4px"><b>Why your choice fails:</b> ' + q.why[resp] + '</div>' : ''}</div>`;
    out.innerHTML = fb + solHTML(q, resp);
    act.innerHTML = `<button class="btn ghost sm retry">Retry</button>` + status();
    $('.retry', act).onclick = () => { box.remove(); const nb = document.createElement('div'); container.insertBefore(nb, box.nextSibling); mountQ(nb, q, opts); };
    const vs = $('.varslot', out); if (vs) { const d = vs.closest('details'); d.addEventListener('toggle', () => { if (d.open && !vs.childElementCount) { mountQ(vs, QS[vs.dataset.v], opts); typeset(vs); } }); }
    typeset(box); if (opts.onDone) opts.onDone(ok);
  }
  if (q.type === 'short') {
    act.innerHTML = `<button class="btn sm show">Reveal model answer</button>` + status();
    $('.show', act).onclick = () => {
      out.innerHTML = solHTML(q) + `<div class="row" style="margin-top:10px"><span class="small">Compare honestly with the model answer:</span><button class="btn sm good">I had the key points</button><button class="btn ghost sm bad">I missed key points</button></div>`;
      act.innerHTML = ''; typeset(out);
      $('.good', out).onclick = () => { record(q, true, true); $('.good', out).parentElement.innerHTML = '<span class="pill-ok">Self-marked: had the key points.</span>'; };
      $('.bad', out).onclick = () => { record(q, false, false); $('.bad', out).parentElement.innerHTML = '<span class="pill-no">Self-marked: missed key points — added to your error notebook.</span>'; };
    };
    return { box };
  }
  act.innerHTML = `<button class="btn sm submit">Submit</button><button class="btn ghost sm giveup">Give up &amp; reveal</button>` + status();
  $('.submit', act).onclick = () => {
    const r = readResp(box, q);
    if (q.type === 'msq') { if (!r.length && !confirm('Submit with no option selected?')) return; }
    else if (r === null || r === '') { alert('Choose or enter an answer first.'); return; }
    if (q.type === 'num' && isNaN(parseNum(r))) { alert('Enter a number (decimals or a fraction like 5/13).'); return; }
    const ok = grade(q, r); record(q, r, ok); finish(r, ok);
  };
  $('.giveup', act).onclick = () => { record(q, null, false); finish(null, false, true); };
  $$('.opt', box).forEach(o => o.addEventListener('change', () => { if (q.type === 'mcq') $$('.opt', box).forEach(x => x.classList.remove('picked')); o.classList.toggle('picked', $('input', o).checked); }));
  return { box };
}

/* ---------- sidebar ---------- */
function sideHTML() {
  let h = `<div class="grp">Dashboard</div><a class="nav" href="#/">Home</a>`;
  h += `<div class="grp">Syllabus (Weeks 1–4)</div>`;
  WEEKS.forEach(w => {
    h += `<details ${location.hash.includes('/week/' + w.n) || (location.hash.startsWith('#/c/') && topicOf[location.hash.slice(4)] && topicOf[location.hash.slice(4)].w === w.n) ? 'open' : ''}><summary>Week ${w.n} · ${w.short}</summary>`;
    h += `<a class="nav" style="padding-left:34px" href="#/week/${w.n}">Week ${w.n} overview</a>`;
    w.topics.forEach(t => {
      h += `<div class="topic">${t.title}</div>`;
      t.cs.forEach(id => { const c = CON[id]; if (!c) return; const st = conceptStats(id); h += `<a class="cpt" data-c="${id}" href="#/c/${id}"><span class="dot ${st.mastered ? 'ms' : (S.studied[id] ? 'st' : '')}"></span><span>${c.title}</span></a>`; });
    });
    h += `</details>`;
  });
  h += `<div class="grp">Practice</div><a class="nav" href="#/pyq">PYQ repository</a><a class="nav" href="#/practice">Practice bank</a><a class="nav" href="#/mock">Mock examinations</a>`;
  h += `<div class="grp">Revision</div><a class="nav" href="#/revision">Revision mode</a><a class="nav" href="#/errors">Error notebook</a><a class="nav" href="#/cards">Flashcards</a>` + WEEKS.map(w => `<a class="nav" href="#/sheet/${w.n}">Week ${w.n} revision sheet</a>`).join('');
  h += `<div class="grp">Reference</div><a class="nav" href="#/formulas">Formula &amp; notation handbook</a><a class="nav" href="#/compare">Concept comparisons</a><a class="nav" href="#/glossary">Glossary</a><a class="nav" href="#/library">Worked problem library</a>`;
  h += `<div class="grp">Reports</div><a class="nav" href="#/intel">Examination intelligence</a><a class="nav" href="#/sources">Sources &amp; coverage</a><a class="nav" href="#/qa">Quality assurance</a>`;
  h += `<div style="padding:16px"><button class="btn ghost sm" id="resetBtn">Reset all progress…</button></div>`;
  return h;
}
function refreshSide() {
  const side = $('#side'); const st = side.scrollTop; side.innerHTML = sideHTML(); side.scrollTop = st;
  $$('#side a').forEach(a => { if (a.getAttribute('href') === location.hash || (location.hash === '' && a.getAttribute('href') === '#/')) a.classList.add('on'); });
  $('#resetBtn').onclick = () => { if (confirm('Reset ALL progress (studied concepts, attempts, errors, mock results, flashcards)? This cannot be undone.')) { const th = S.theme; S = { studied: {}, att: {}, mocks: [], cards: {}, theme: th }; save(); route(); } };
}

/* ---------- views ---------- */
const V = {};
const pct = x => x == null ? '—' : Math.round(x * 100) + '%';
function weekProgress(n) { const ids = ORDER.filter(id => topicOf[id].w === n); const s = ids.filter(id => S.studied[id]).length; return { s, t: ids.length, m: ids.filter(id => conceptStats(id).mastered).length }; }
function recommend() {
  const due = dueList(); if (due.length) return `<b>Spaced revision:</b> ${due.length} question${due.length > 1 ? 's are' : ' is'} due for review. <a href="#/revision">Open revision queue →</a>`;
  const err = errorList(); if (err.length) return `<b>Error notebook:</b> ${err.length} unresolved incorrect answer${err.length > 1 ? 's' : ''}. <a href="#/errors">Re-attempt →</a>`;
  const next = ORDER.find(id => !S.studied[id]); if (next) return `<b>Continue the syllabus:</b> <a href="#/c/${next}">${CON[next].title}</a> (Week ${topicOf[next].w}, ${CON[next].pri} priority).`;
  const weak = ORDER.map(id => [id, conceptStats(id)]).filter(x => x[1].acc !== null && !x[1].mastered).sort((a, b) => a[1].acc - b[1].acc)[0];
  if (weak) return `<b>Strengthen:</b> <a href="#/c/${weak[0]}">${CON[weak[0]].title}</a> — accuracy ${pct(weak[1].acc)}; answer its checkpoint and PYQs again.`;
  return `<b>Exam rehearsal:</b> take the <a href="#/mock">cumulative Week 1–4 mock</a>.`;
}
V.home = () => {
  const total = ORDER.length, studied = ORDER.filter(id => S.studied[id]).length, mastered = ORDER.filter(id => conceptStats(id).mastered).length;
  const pyqs = QUESTIONS.filter(q => q.src === 'PYQ'), pyqDone = pyqs.filter(q => S.att[q.id]).length;
  const prac = QUESTIONS.filter(q => q.src !== 'PYQ' && S.att[q.id] && autoGradable(q)); const pracAcc = prac.length ? prac.filter(q => S.att[q.id].last.ok).length / prac.length : null;
  const allAtt = QUESTIONS.filter(q => S.att[q.id] && autoGradable(q)); const allAcc = allAtt.length ? allAtt.filter(q => S.att[q.id].last.ok).length / allAtt.length : null;
  const mk = S.mocks; const lastMock = mk[mk.length - 1]; const best = mk.length ? Math.max(...mk.map(m => m.pct)) : null;
  const weak = ORDER.map(id => [id, conceptStats(id)]).filter(x => x[1].done >= 2 && x[1].acc < 0.8).sort((a, b) => a[1].acc - b[1].acc).slice(0, 5);
  let h = `<div class="wide"><div class="crumb">Game Theory &amp; Strategy · Quiz 1 preparation</div><h1>Weeks 1–4 learning &amp; exam dashboard</h1>
  <p class="muted" style="margin-top:0">Built from your notes, the lecture notes, the prescribed textbook and ${pyqs.length} original quiz questions from five past papers (2024 T2 – 2026 T2). Every past-paper question sits under the concept it tests.</p>
  <div class="panel" style="border-color:var(--acc)">${recommend()}</div>
  <div class="grid g4">
   <div class="stat"><div class="v">${Math.round(studied / total * 100)}%</div><div class="l">Syllabus studied (${studied}/${total} concepts)</div><div class="bar"><i style="width:${studied / total * 100}%"></i></div></div>
   <div class="stat"><div class="v">${mastered}</div><div class="l">Concepts mastered (≥3 answered, ≥80% correct)</div></div>
   <div class="stat"><div class="v">${pyqDone}/${pyqs.length}</div><div class="l">PYQs attempted</div><div class="bar"><i style="width:${pyqDone / pyqs.length * 100}%"></i></div></div>
   <div class="stat"><div class="v">${pct(pracAcc)}</div><div class="l">Practice accuracy (latest attempt per question) · overall ${pct(allAcc)}</div></div>
  </div>
  <h2>Weeks</h2><div class="grid g4">${WEEKS.map(w => { const p = weekProgress(w.n); return `<a class="stat" href="#/week/${w.n}" style="color:inherit;text-decoration:none"><div class="l">Week ${w.n}</div><div style="font-weight:650">${w.title}</div><div class="bar"><i style="width:${p.s / p.t * 100}%"></i></div><div class="l" style="margin-top:4px">${p.s}/${p.t} studied · ${p.m} mastered · ${QUESTIONS.filter(q => q.src === 'PYQ' && q.week === w.n).length} PYQs</div></a>`; }).join('')}</div>
  <div class="grid g2" style="margin-top:12px">
   <div class="panel"><h3 style="margin-top:0">Mock test performance</h3>${mk.length ? `<div>Last: <b>${lastMock.score}/${lastMock.n}</b> (${lastMock.pct}%) — ${esc(lastMock.scope)}</div><div>Best: <b>${best}%</b> · Mocks taken: ${mk.length}</div><table class="t">${mk.slice(-5).reverse().map(m => `<tr><td>${new Date(m.t).toLocaleDateString()}</td><td>${esc(m.scope)}</td><td>${m.score}/${m.n}</td><td>${m.pct}%</td></tr>`).join('')}</table>` : '<p class="muted">No mock taken yet. <a href="#/mock">Start one →</a></p>'}</div>
   <div class="panel"><h3 style="margin-top:0">Weakest concepts</h3>${weak.length ? `<table class="t">${weak.map(([id, s]) => `<tr><td><a href="#/c/${id}">${CON[id].title}</a></td><td>${s.ok}/${s.done} correct</td><td>${pct(s.acc)}</td></tr>`).join('')}</table>` : '<p class="muted">Appears once you have answered at least 2 questions on a concept with accuracy under 80%.</p>'}
   <p class="small muted">Due for spaced review: ${dueList().length} · Unresolved errors: ${errorList().length}</p></div>
  </div>
  <h2>How the adaptive system works</h2><p class="small">Each auto-graded question sits in a Leitner box (1–5). A wrong answer sends it to box 1 and makes it due immediately; a right answer moves it up one box and schedules it ${BOXDAYS.slice(1).join(', ')} days later for boxes 1–5. “Mastered” means at least 3 answered questions on the concept with ≥80% correct on your latest attempts. Recommendations follow a fixed priority: due reviews → unresolved errors → next unstudied concept → weakest concept → mock. There is no hidden AI model.</p></div>`;
  return h;
};
V.week = n => {
  const w = WEEKS.find(x => x.n == n); if (!w) return '<p>Unknown week.</p>';
  const p = weekProgress(w.n);
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a> › Week ${w.n}</div><h1>Week ${w.n} — ${w.title}</h1><p class="muted">${w.blurb}</p>
  <div class="grid g3"><div class="stat"><div class="v">${p.s}/${p.t}</div><div class="l">concepts studied</div><div class="bar"><i style="width:${p.s / p.t * 100}%"></i></div></div><div class="stat"><div class="v">${p.m}</div><div class="l">mastered</div></div><div class="stat"><div class="v">${QUESTIONS.filter(q => q.src === 'PYQ' && q.week === w.n).length}</div><div class="l">original PYQ items mapped here</div></div></div>
  <h2>Topic hierarchy</h2>`;
  w.topics.forEach(t => {
    h += `<h3>${t.title}</h3><table class="t"><tr><th>Concept</th><th>Priority</th><th>PYQs</th><th>Checkpoint</th><th>Status</th></tr>`;
    t.cs.forEach(id => { const c = CON[id]; if (!c) return; const st = conceptStats(id); const np = qsFor(id).filter(q => q.src === 'PYQ').length; h += `<tr><td><a href="#/c/${id}">${c.title}</a></td><td><span class="tag ${c.pri === 'High' ? 'hi' : c.pri === 'Medium' ? 'med' : 'sup'}">${c.pri}</span></td><td>${np}</td><td>${st.done}/${st.total} answered</td><td>${st.mastered ? '<span class="pill-ok">mastered</span>' : S.studied[id] ? 'studied' : '—'}</td></tr>`; });
    h += '</table>';
  });
  h += `<h2>Revision resources</h2><ul><li><a href="#/sheet/${w.n}">Week ${w.n} revision sheet</a></li><li><a href="#/mock?w=${w.n}">Week ${w.n} mock quiz</a></li><li><a href="#/pyq?w=${w.n}">Week ${w.n} PYQs only</a></li><li><a href="#/practice?w=${w.n}">Week ${w.n} practice questions</a></li><li><a href="#/cards?w=${w.n}">Week ${w.n} flashcards</a></li></ul></div>`;
  return h;
};
V.concept = id => {
  const c = CON[id]; if (!c) return '<p>Unknown concept.</p>';
  const i = ORDER.indexOf(id), prev = ORDER[i - 1], next = ORDER[i + 1];
  const pyqs = QUESTIONS.filter(q => q.src === 'PYQ' && q.cs[0] === id);
  const xref = QUESTIONS.filter(q => q.src === 'PYQ' && q.cs[0] !== id && q.cs.includes(id));
  const cps = QUESTIONS.filter(q => q.cp === id);
  const st = conceptStats(id);
  const sec = (k, t) => c[k] ? `<h2 id="s-${k}">${t}</h2>${c[k]}` : '';
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a> › <a href="#/week/${c.week}">Week ${c.week}</a> › ${topicOf[id].t}</div>
  <h1>${c.title}</h1><div class="row" style="margin:4px 0 6px"><span class="tag ${c.pri === 'High' ? 'hi' : c.pri === 'Medium' ? 'med' : 'sup'}">${c.pri} priority</span>${pyqs.length + xref.length ? `<span class="tag pyq">${pyqs.length} PYQ${pyqs.length === 1 ? '' : 's'} here${xref.length ? ' + ' + xref.length + ' cross-referenced' : ''}</span>` : '<span class="tag">not yet tested in supplied PYQs</span>'}<span class="small muted">Checkpoint: ${st.done}/${st.total} answered${st.acc != null ? ' · ' + pct(st.acc) + ' correct' : ''}</span>
  <button class="btn sm ${S.studied[id] ? 'ghost' : ''}" id="studyBtn" style="margin-left:auto">${S.studied[id] ? '✓ Studied (undo)' : 'Mark as studied'}</button></div>
  ${c.prereq && c.prereq.length ? `<div class="small muted">Prerequisites: ${c.prereq.map(p => CON[p] ? `<a href="#/c/${p}">${CON[p].title}</a>` : p).join(' · ')}</div>` : ''}
  <div class="toc">${[['intu', 'Intuition'], ['why', 'Why it matters'], ['formal', 'Formal definition'], ['math', 'Mathematics'], ['ex', 'Worked examples'], ['vis', 'Visual'], ['conn', 'Connections'], ['mis', 'Misconceptions'], ['exam', 'Exam perspective'], ['cp', 'Checkpoint'], ['pyq', 'PYQs']].filter(([k]) => k === 'cp' || k === 'pyq' || k === 'ex' ? true : c[k]).map(([k, t]) => `<a href="javascript:void 0" data-j="s-${k}">${t}</a>`).join('')}</div>
  <div class="reading">`;
  h += sec('intu', '1 · Intuition first') + sec('why', '2 · Why does it matter?') + sec('formal', '3 · Formal definition') + sec('math', '4 · Mathematical foundations');
  h += `<h2 id="s-ex">5 · Worked examples</h2>` + (c.ex || []).map(e => `<div class="ex"><div class="et">${e.lvl}</div><h4 style="margin-top:2px">${e.t}</h4>${e.q}<details class="reveal"><summary>Show complete solution</summary>${e.s}</details></div>`).join('');
  h += sec('vis', '6 · Visual understanding') + sec('conn', '7 · Connections') + sec('mis', '8 · Common misconceptions') + sec('exam', '9 · Examination perspective');
  h += `</div><h2 id="s-cp">10 · Concept mastery checkpoint</h2><p class="small muted">Answers stay hidden until you submit. Short-answer items are self-graded against a model answer.</p><div id="cpBox"></div>`;
  h += `<h2 id="s-pyq">Relevant PYQs — with detailed solutions</h2>`;
  h += pyqs.length ? `<p class="small muted">${pyqs.length} original question${pyqs.length > 1 ? 's' : ''} whose primary concept is this one. Repeated questions across papers are kept separately, as asked.</p><div id="pyqBox"></div>` : '<p class="muted small">No supplied PYQ has this as its primary concept.</p>';
  if (xref.length) h += `<h4>Also tests this concept (primary concept elsewhere)</h4><ul class="small">${xref.map(q => `<li><a href="#/c/${q.cs[0]}">${q.paper} Q${q.qno}</a> — ${strip(q.stem).slice(0, 110)}…</li>`).join('')}</ul>`;
  h += `<div class="navfoot"><div>${prev ? `<a href="#/c/${prev}">← ${CON[prev].title}</a>` : ''}</div><div>${next ? `<a href="#/c/${next}">${CON[next].title} →</a>` : ''}</div></div></div>`;
  setTimeout(() => {
    $('#studyBtn').onclick = () => { S.studied[id] = !S.studied[id]; if (!S.studied[id]) delete S.studied[id]; save(); route(); };
    cps.forEach(q => mountQ($('#cpBox'), q)); if (!cps.length) $('#cpBox').innerHTML = '<p class="muted">—</p>';
    if (pyqs.length) pyqs.forEach(q => mountQ($('#pyqBox'), q));
    $$('.toc a').forEach(a => a.onclick = () => { const t = document.getElementById(a.dataset.j); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
    typeset($('#main'));
  });
  return h;
};

/* filters shared by PYQ repo / practice bank */
function qParams() { const p = new URLSearchParams(location.hash.split('?')[1] || ''); return Object.fromEntries(p.entries()); }
function filterView(kind) {
  const P = qParams();
  const base = QUESTIONS.filter(q => kind === 'pyq' ? q.src === 'PYQ' : q.src !== 'PYQ');
  const papers = [...new Set(base.map(q => q.paper).filter(Boolean))];
  const cats = [...new Set(base.map(q => q.cat))].sort();
  const sel = (name, opts, cur) => `<select data-f="${name}"><option value="">All</option>${opts.map(o => `<option value="${esc(o[0])}" ${String(cur) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>${kind === 'pyq' ? 'Master PYQ repository' : 'Practice bank'}</h1>
  <p class="muted">${kind === 'pyq' ? `All ${base.length} original quiz items from the five supplied papers, with official keys verified. Wording is preserved; nothing generated is labelled PYQ.` : `${base.length} questions: NEW PRACTICE items (generated), modified variations of PYQs, and course-assignment items. None of these are past quiz questions.`}</p>
  <div class="panel row small">
   <label>Week ${sel('w', WEEKS.map(w => [w.n, 'Week ' + w.n]), P.w)}</label>
   <label>Concept ${sel('c', ORDER.map(id => [id, CON[id].title]), P.c)}</label>
   <label>Difficulty ${sel('d', ['Easy', 'Moderate', 'Difficult', 'Advanced'].map(d => [d, d]), P.d)}</label>
   <label>Question type ${sel('t', cats.map(c => [c, c]), P.t)}</label>
   ${kind === 'pyq' ? `<label>Paper ${sel('p', papers.map(p => [p, p]), P.p)}</label>` : `<label>Source ${sel('s', [['NEW', 'NEW PRACTICE'], ['VAR', 'PYQ variations'], ['GA', 'Course assignment']], P.s)}</label>`}
   <label>Status ${sel('st', [['un', 'Unattempted'], ['wrong', 'Last wrong'], ['right', 'Last right']], P.st)}</label>
   <input data-f="q" placeholder="Search text…" value="${esc(P.q || '')}" style="flex:1;min-width:140px">
  </div><div id="qcount" class="small muted"></div><div id="qlist"></div></div>`;
  setTimeout(() => {
    const apply = () => {
      const f = {}; $$('[data-f]').forEach(e => { if (e.value) f[e.dataset.f] = e.value; });
      const qs = base.filter(q => (!f.w || q.week == f.w) && (!f.c || q.cs.includes(f.c)) && (!f.d || q.diff === f.d) && (!f.t || q.cat === f.t) && (!f.p || q.paper === f.p) && (!f.s || q.src === f.s) &&
        (!f.st || (f.st === 'un' ? !S.att[q.id] : f.st === 'wrong' ? S.att[q.id] && !S.att[q.id].last.ok : S.att[q.id] && S.att[q.id].last.ok)) &&
        (!f.q || f.q.toLowerCase().split(/\s+/).every(w => strip(q.ctx + ' ' + q.stem + ' ' + (q.opts || []).join(' ')).toLowerCase().includes(w))));
      $('#qcount').textContent = `${qs.length} question${qs.length === 1 ? '' : 's'} match.` + (qs.length > 40 ? ' Showing the first 40 — narrow the filters to see others.' : '');
      const L = $('#qlist'); L.innerHTML = ''; qs.slice(0, 40).forEach(q => mountQ(L, q)); typeset(L);
    };
    $$('[data-f]').forEach(e => e.addEventListener(e.tagName === 'INPUT' ? 'input' : 'change', apply)); apply();
  });
  return h;
}
V.pyq = () => filterView('pyq');
V.practice = () => filterView('practice');

/* mock exams */
V.mock = () => {
  const P = qParams();
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Mock examinations</h1>
  <p class="muted">Five preset mocks use past-paper item types (MCQ/MSQ/numeric), sampled round-robin across concepts; items that share a passage show it with each item, but are not grouped into blocks. You can change scope, difficulty and length. Answers are hidden until you submit. Self-graded short answers are excluded because they cannot be scored automatically.</p>
  <div class="panel"><div class="row"><b>Presets:</b>${WEEKS.map(w => `<button class="btn ghost sm" data-pre="${w.n}">Week ${w.n} mock</button>`).join('')}<button class="btn ghost sm" data-pre="all">Cumulative Weeks 1–4</button></div>
  <div class="row small" style="margin-top:10px">
   <label>Scope <select id="mScope"><option value="all">Weeks 1–4</option>${WEEKS.map(w => `<option value="${w.n}" ${P.w == w.n ? 'selected' : ''}>Week ${w.n}</option>`).join('')}</select></label>
   <label>Questions <input id="mN" type="number" min="3" max="60" value="15" style="width:70px"></label>
   <label>Difficulty <select id="mD"><option value="mix">Mixed (exam-like)</option><option value="em">Easy + Moderate</option><option value="md">Moderate + Difficult</option><option value="da">Difficult + Advanced</option></select></label>
   <label>Pool <select id="mP"><option value="all">PYQs + new practice</option><option value="pyq">PYQs only</option><option value="new">New practice only</option></select></label>
   <button class="btn" id="mGo">Start mock</button></div></div><div id="mockArea"></div></div>`;
  setTimeout(() => {
    if (P.w) $('#mScope').value = P.w;
    $$('[data-pre]').forEach(b => b.onclick = () => { $('#mScope').value = b.dataset.pre; $('#mN').value = b.dataset.pre === 'all' ? 25 : 15; $('#mD').value = 'mix'; $('#mP').value = 'all'; startMock(); });
    $('#mGo').onclick = startMock;
  });
  return h;
};
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function startMock() {
  const scope = $('#mScope').value, n = Math.max(3, Math.min(60, +$('#mN').value || 15)), d = $('#mD').value, pool = $('#mP').value;
  const okD = { mix: () => true, em: q => ['Easy', 'Moderate'].includes(q.diff), md: q => ['Moderate', 'Difficult'].includes(q.diff), da: q => ['Difficult', 'Advanced'].includes(q.diff) }[d];
  let cand = QUESTIONS.filter(q => autoGradable(q) && q.src !== 'VAR' && (scope === 'all' || q.week == scope) && okD(q) && (pool === 'all' || (pool === 'pyq' ? q.src === 'PYQ' : q.src !== 'PYQ')));
  // de-duplicate identical repeated PYQs (same stem+context) so a mock doesn't ask the same item twice
  const seen = new Set(); cand = shuffle(cand).filter(q => { const k = strip(q.ctx || '').slice(0, 60) + strip(q.stem); if (seen.has(k)) return false; seen.add(k); return true; });
  // round-robin across concepts for coverage
  const by = {}; cand.forEach(q => (by[q.cs[0]] = by[q.cs[0]] || []).push(q));
  const keys = shuffle(Object.keys(by)); const pick = [];
  while (pick.length < n && keys.some(k => by[k].length)) keys.forEach(k => { if (pick.length < n && by[k].length) pick.push(by[k].shift()); });
  pick.sort((a, b) => a.week - b.week || ORDER.indexOf(a.cs[0]) - ORDER.indexOf(b.cs[0]));
  const area = $('#mockArea'); area.innerHTML = '';
  if (!pick.length) { area.innerHTML = '<p class="fb no">No questions match these settings. Widen the difficulty or pool.</p>'; return; }
  const scopeTxt = (scope === 'all' ? 'Weeks 1–4' : 'Week ' + scope) + ` · ${pick.length} Q · ${$('#mD').selectedOptions[0].text} · ${$('#mP').selectedOptions[0].text}`;
  area.innerHTML = `<div class="panel row"><b>${scopeTxt}</b>${pick.length < n ? `<span class="small muted">(only ${pick.length} matching questions available)</span>` : ''}<span id="mTimer" class="small muted" style="margin-left:auto"></span></div><div id="mQs"></div><button class="btn" id="mSubmit">Submit mock</button>`;
  const t0 = Date.now(); const tm = setInterval(() => { const el = $('#mTimer'); if (!el) return clearInterval(tm); const s = Math.floor((Date.now() - t0) / 1000); el.textContent = `Elapsed ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }, 1000);
  const handles = pick.map((q, i) => { const d = document.createElement('div'); d.innerHTML = `<div class="small muted" style="margin-top:14px">Question ${i + 1} of ${pick.length}</div>`; $('#mQs').appendChild(d); return [q, mountQ(d, q, { mode: 'mock' })]; });
  typeset(area);
  $('#mSubmit').onclick = () => {
    const unanswered = handles.filter(([q, hd]) => { const r = hd.read(); return r === null || r === '' || (Array.isArray(r) && !r.length); }).length;
    if (unanswered && !confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
    clearInterval(tm);
    let score = 0; const byC = {};
    const res = handles.map(([q, hd]) => { const r = hd.read(); const ok = (r === null || r === '' || (Array.isArray(r) && !r.length && q.type !== 'msq')) ? false : grade(q, r); if (ok) score++; record(q, r, ok, 'mock'); const c = q.cs[0]; byC[c] = byC[c] || [0, 0]; byC[c][1]++; if (ok) byC[c][0]++; return { q, r, ok }; });
    const p = Math.round(score / pick.length * 100);
    S.mocks.push({ t: Date.now(), scope: scopeTxt, n: pick.length, score, pct: p, byC }); save();
    const weakC = Object.entries(byC).filter(([c, [a, b]]) => a / b < 0.6);
    let h = `<div class="panel" style="border-color:var(--acc)"><h2 style="border:0;margin-top:0">Score: ${score}/${pick.length} (${p}%)</h2><div class="small muted">Time: ${$('#mTimer') ? $('#mTimer').textContent.replace('Elapsed ', '') : ''}</div>
    <h3>Topic-wise performance</h3><table class="t"><tr><th>Concept</th><th>Week</th><th>Correct</th></tr>${Object.entries(byC).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([c, [a, b]]) => `<tr><td><a href="#/c/${c}">${CON[c].title}</a></td><td>${topicOf[c].w}</td><td class="${a / b < 0.6 ? 'pill-no' : 'pill-ok'}">${a}/${b}</td></tr>`).join('')}</table>
    <h3>Weaknesses &amp; recommended revision</h3>${weakC.length ? `<ul>${weakC.map(([c]) => `<li><a href="#/c/${c}">${CON[c].title}</a> — reread the <i>Common misconceptions</i> and redo its checkpoint; misses were added to your error notebook.</li>`).join('')}</ul>` : '<p>No concept below 60% in this mock. Keep the spaced-review queue empty and try a harder difficulty setting.</p>'}</div><h3>Answers and solutions</h3>`;
    res.forEach(({ q, r, ok }, i) => { h += `<div class="q"><div class="qh">${badges(q)}</div><div class="small muted">Q${i + 1}</div>${q.ctx ? `<details class="ctx"><summary>Question context</summary>${q.ctx}</details>` : ''}<div class="stem">${q.stem}</div>${q.opts ? `<ol type="A" class="small">${q.opts.map(o => `<li>${o}</li>`).join('')}</ol>` : ''}<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct' : 'Incorrect'}</b> · Your answer: ${ansText(q, r)} · Correct: ${correctText(q)}</div><details class="reveal"><summary>Detailed solution</summary>${solHTML(q, r)}</details></div>`; });
    area.innerHTML = h; typeset(area); window.scrollTo(0, area.offsetTop - 60);
  };
}

/* revision & errors */
V.revision = () => {
  const P = qParams(); const tab = P.tab || 'due';
  const tabs = [['due', 'Due reviews'], ['errors', 'Incorrect answers'], ['defs', 'Key definitions'], ['formulas', 'Key formulas'], ['compare', 'Comparisons'], ['traps', 'Common traps'], ['cards', 'Flashcards']];
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Revision mode</h1><div class="chips">${tabs.map(([k, t]) => `<a class="chip ${k === tab ? 'on' : ''}" href="#/revision?tab=${k}">${t}</a>`).join('')}</div><div id="revArea"></div></div>`;
  setTimeout(() => {
    const A = $('#revArea');
    if (tab === 'due') {
      const due = dueList().sort((a, b) => (S.att[a.id].box - S.att[b.id].box) || (conceptStats(a.cs[0]).acc ?? 1) - (conceptStats(b.cs[0]).acc ?? 1));
      A.innerHTML = `<p class="small muted">${due.length} due. Lowest Leitner box and weakest concept first. Answer each; correct answers move up a box.</p>`;
      if (!due.length) A.innerHTML += '<p>Nothing is due. New questions enter this queue after you attempt them.</p>';
      due.slice(0, 15).forEach(q => mountQ(A, q)); typeset(A);
    } else if (tab === 'errors') { location.hash = '#/errors'; }
    else if (tab === 'defs') { A.innerHTML = GLOSSARY.filter(g => g.key).map(g => `<div class="panel"><b>${g.term}</b> <span class="tag">W${g.week}</span><div>${g.def}</div></div>`).join(''); typeset(A); }
    else if (tab === 'formulas') { A.innerHTML = FORMULAS.filter(f => f.key).map(formulaHTML).join(''); typeset(A); }
    else if (tab === 'compare') { A.innerHTML = COMPARISONS.map(compareHTML).join(''); typeset(A); }
    else if (tab === 'traps') { A.innerHTML = `<table class="t"><tr><th>Trap</th><th>Fix</th><th>Where</th></tr>${TRAPS.map(t => `<tr><td>${t.trap}</td><td>${t.fix}</td><td>${(t.cs || []).map(c => CON[c] ? `<a href="#/c/${c}">${CON[c].title}</a>` : '').join(', ')}</td></tr>`).join('')}</table>`; typeset(A); }
    else if (tab === 'cards') location.hash = '#/cards';
  });
  return h;
};
V.errors = () => {
  const errs = errorList();
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Personal error notebook</h1><p class="muted">Every question whose latest attempt was wrong. It leaves this list once you answer it correctly. Each entry shows your response, the correct solution, why the reasoning failed, the underlying misconception, a remedial explanation and a similar question to retry.</p><div id="errArea"></div></div>`;
  setTimeout(() => {
    const A = $('#errArea'); if (!errs.length) { A.innerHTML = '<p>No unresolved errors. 🎯</p>'; return; }
    errs.forEach(q => {
      const a = S.att[q.id]; const c = CON[q.cs[0]];
      const why = q.type === 'mcq' && a.last.r != null && q.why && q.why[a.last.r] ? q.why[a.last.r] : (a.last.r == null ? 'You revealed the answer without attempting — the method was not yet available to you.' : 'Your answer did not match: compare your working with the step-by-step solution line by line to find the first step that differs.');
      const sim = VARS[q.id] || QUESTIONS.find(x => x.id !== q.id && x.cs[0] === q.cs[0] && autoGradable(x) && (!S.att[x.id] || !S.att[x.id].last.ok)) || QUESTIONS.find(x => x.id !== q.id && x.cs.includes(q.cs[0]) && autoGradable(x));
      const d = document.createElement('div'); d.className = 'panel';
      d.innerHTML = `<div class="qh">${badges(q)}</div>${q.ctx ? `<details class="ctx"><summary>Question context</summary>${q.ctx}</details>` : ''}<div class="stem"><b>Question:</b> ${q.stem}</div>
      <div><b>Your response:</b> ${ansText(q, a.last.r)} <span class="muted small">(attempts ${a.n}, ${new Date(a.last.t).toLocaleString()})</span></div><div><b>Correct answer:</b> ${correctText(q)}</div>
      <h4>Why the reasoning failed</h4><div>${why}</div><h4>Underlying misconception</h4><div>${q.misc || (c && c.misShort) || 'See the concept\'s misconceptions section.'}</div>
      <h4>Remedial explanation</h4><div>Revisit <a href="#/c/${q.cs[0]}">${c ? c.title : ''}</a> — sections <i>Intuition</i>, <i>Mathematics</i> and <i>Common misconceptions</i>.</div>
      <details class="reveal"><summary>Full solution</summary>${solHTML(q, a.last.r)}</details>
      <details class="reveal"><summary>Retry: the original question</summary><div class="rq"></div></details>
      ${sim ? `<details class="reveal"><summary>Retry: a similar question (${sim.src === 'PYQ' ? 'PYQ' : 'NEW'})</summary><div class="sq"></div></details>` : ''}`;
      A.appendChild(d);
      const [d1, d2] = $$('details.reveal', d).slice(1);
      d1.addEventListener('toggle', () => { const s = $('.rq', d); if (d1.open && !s.childElementCount) { mountQ(s, q); typeset(s); } });
      if (sim && d2) d2.addEventListener('toggle', () => { const s = $('.sq', d); if (d2.open && !s.childElementCount) { mountQ(s, sim); typeset(s); } });
    });
    typeset(A);
  });
  return h;
};
V.cards = () => {
  const P = qParams();
  let deck = FLASHCARDS.filter(f => !P.w || f.week == P.w);
  const due = c => !S.cards[c.id] || S.cards[c.id].due <= Date.now();
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Flashcards</h1><div class="chips"><a class="chip ${!P.w ? 'on' : ''}" href="#/cards">All</a>${WEEKS.map(w => `<a class="chip ${P.w == w.n ? 'on' : ''}" href="#/cards?w=${w.n}">Week ${w.n}</a>`).join('')}</div>
  <p class="small muted">${deck.length} cards · ${deck.filter(due).length} due. Same Leitner schedule as questions: “Again” → box 1 (due now); “Knew it” → next box.</p><div id="cardArea"></div></div>`;
  setTimeout(() => {
    const A = $('#cardArea'); let q = deck.filter(due); if (!q.length) q = deck.slice(); q = shuffle(q); let k = 0;
    const show = () => {
      if (!q.length) { A.innerHTML = '<p>No cards.</p>'; return; }
      const c = q[k % q.length]; const b = S.cards[c.id] ? S.cards[c.id].box : 0;
      A.innerHTML = `<div class="card"><div class="fc"><div class="side">${c.kind} · Week ${c.week} · box ${b}</div><div>${c.front}</div><div id="back" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">${c.back}</div></div>
      <div class="row" style="justify-content:center;margin-top:10px"><button class="btn" id="flip">Reveal answer</button><button class="btn ghost" id="again" style="display:none">Again</button><button class="btn" id="knew" style="display:none">Knew it</button><button class="btn ghost sm" id="skip">Skip</button></div><div class="small muted" style="text-align:center">Card ${k % q.length + 1} of ${q.length}</div></div>`;
      typeset(A);
      $('#flip').onclick = () => { $('#back').style.display = 'block'; $('#flip').style.display = 'none'; $('#again').style.display = $('#knew').style.display = 'inline-block'; };
      const mark = ok => { const s = S.cards[c.id] || { box: 0 }; s.box = ok ? Math.min(s.box + 1, 5) : 1; s.due = Date.now() + (ok ? BOXDAYS[s.box] * DAY : 0); S.cards[c.id] = s; save(); k++; show(); };
      $('#again').onclick = () => mark(false); $('#knew').onclick = () => mark(true); $('#skip').onclick = () => { k++; show(); };
    };
    show();
  });
  return h;
};
function formulaHTML(f) { return `<div class="panel"><div class="row"><b>${f.name}</b><span class="tag">W${f.week}</span>${(f.cs || []).map(c => CON[c] ? `<a class="small" href="#/c/${c}">${CON[c].title}</a>` : '').join(' ')}</div><div style="margin:6px 0">${f.tex}</div><div class="small"><b>Symbols:</b> ${f.sym}</div><div class="small"><b>Applies when:</b> ${f.cond}</div>${f.note ? `<div class="small"><b>Note:</b> ${f.note}</div>` : ''}${f.ex ? `<div class="small"><b>Example:</b> ${f.ex}</div>` : ''}</div>`; }
function compareHTML(c) { return `<div class="panel"><h3 style="margin-top:0">${c.title}</h3><table class="t"><tr><th></th><th>${c.a}</th><th>${c.b}</th></tr>${c.rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>${c.tip ? `<div class="small"><b>Exam tip:</b> ${c.tip}</div>` : ''}</div>`; }
V.formulas = () => { setTimeout(() => typeset($('#main'))); return `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Formula &amp; notation handbook</h1><p class="muted">Every formula used in Weeks 1–4, with symbols, conditions of applicability and an example.</p>${WEEKS.map(w => `<h2>Week ${w.n}</h2>` + FORMULAS.filter(f => f.week === w.n).map(formulaHTML).join('')).join('')}</div>`; };
V.compare = () => { setTimeout(() => typeset($('#main'))); return `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Concept comparison handbook</h1><p class="muted">Side-by-side contrasts of the pairs that past papers and students most often confuse.</p>${COMPARISONS.map(compareHTML).join('')}</div>`; };
V.glossary = () => {
  setTimeout(() => {
    const draw = () => { const t = $('#gq').value.toLowerCase(), w = $('#gw').value; const L = GLOSSARY.filter(g => (!w || g.week == w) && (!t || strip(g.term + ' ' + g.def + ' ' + g.intu).toLowerCase().includes(t))).sort((a, b) => a.term.localeCompare(b.term));
      $('#glist').innerHTML = L.map(g => `<div class="panel"><div class="row"><b>${g.term}</b><span class="tag">Week ${g.week}</span></div><div>${g.def}</div><div class="small muted" style="margin-top:4px"><b>Intuition:</b> ${g.intu}</div>${g.rel && g.rel.length ? `<div class="small" style="margin-top:4px">Related: ${g.rel.map(c => CON[c] ? `<a href="#/c/${c}">${CON[c].title}</a>` : c).join(' · ')}</div>` : ''}</div>`).join('') || '<p>No match.</p>'; $('#gcount').textContent = L.length + ' terms'; typeset($('#glist')); };
    $('#gq').oninput = draw; $('#gw').onchange = draw; draw();
  });
  return `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Glossary</h1><div class="row panel"><input id="gq" placeholder="Search terms…" style="flex:1"><select id="gw"><option value="">All weeks</option>${WEEKS.map(w => `<option value="${w.n}">Week ${w.n}</option>`).join('')}</select><span id="gcount" class="small muted"></span></div><div id="glist"></div></div>`;
};
V.library = () => {
  setTimeout(() => typeset($('#main')));
  let h = `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Worked problem library</h1><p class="muted">All worked examples from every concept page, grouped by week and difficulty. Solutions are collapsed so you can attempt first.</p>`;
  WEEKS.forEach(w => { h += `<h2>Week ${w.n}</h2>`; ['Introductory', 'Standard', 'Exam-level'].forEach(lv => { const ex = ORDER.filter(id => topicOf[id].w === w.n).flatMap(id => (CON[id].ex || []).filter(e => e.lvl.startsWith(lv)).map(e => [id, e])); if (!ex.length) return; h += `<h3>${lv}</h3>` + ex.map(([id, e]) => `<div class="ex"><div class="et">${e.lvl} · <a href="#/c/${id}">${CON[id].title}</a></div><h4 style="margin-top:2px">${e.t}</h4>${e.q}<details class="reveal"><summary>Show solution</summary>${e.s}</details></div>`).join(''); }); });
  return h + '</div>';
};
V.sheet = n => { const s = SHEETS[n]; setTimeout(() => typeset($('#main'))); return `<div class="wrap"><div class="crumb"><a href="#/">Home</a> › <a href="#/week/${n}">Week ${n}</a></div><h1>Week ${n} revision sheet</h1><div class="reading">${s || 'Missing.'}</div></div>`; };

/* reports */
V.intel = () => {
  const P = QUESTIONS.filter(q => q.src === 'PYQ');
  const cnt = (arr, f) => { const m = {}; arr.forEach(x => { const k = f(x); m[k] = (m[k] || 0) + 1; }); return m; };
  const byC = cnt(P, q => q.cs[0]), byW = cnt(P, q => q.week), byCat = cnt(P, q => q.cat), byD = cnt(P, q => q.diff), byPaper = cnt(P, q => q.paper);
  const marks = {}; P.forEach(q => { marks[q.cs[0]] = (marks[q.cs[0]] || 0) + (q.marks || 0); });
  const untested = ORDER.filter(id => !P.some(q => q.cs.includes(id)));
  const tbl = (m, lab, f = k => k) => `<table class="t"><tr><th>${lab}</th><th>Items</th><th>Share</th></tr>${Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td>${f(k)}</td><td>${v}</td><td>${Math.round(v / P.length * 100)}%</td></tr>`).join('')}</table>`;
  setTimeout(() => typeset($('#main')));
  return `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Examination intelligence</h1><p class="muted">Computed live from the ${P.length} mapped PYQ items (five papers). Historical frequency describes the past; it does not guarantee what the next paper will ask.</p>
  <h2>A · Topic frequency</h2><h3>By week</h3>${tbl(byW, 'Week', k => 'Week ' + k)}<h3>By primary concept</h3><table class="t"><tr><th>Concept</th><th>Week</th><th>Items</th><th>Marks</th></tr>${Object.entries(byC).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td><a href="#/c/${k}">${CON[k].title}</a></td><td>${topicOf[k].w}</td><td>${v}</td><td>${marks[k]}</td></tr>`).join('')}</table>
  <h3>Syllabus concepts not appearing in any supplied PYQ (${untested.length})</h3><p class="small">${untested.map(id => `<a href="#/c/${id}">${CON[id].title}</a>`).join(' · ')}</p>
  <h3>By paper</h3>${tbl(byPaper, 'Paper')}
  <h2>B · Question structure</h2>${tbl(byCat, 'Category')}
  <h2>C · Difficulty</h2>${tbl(byD, 'Difficulty')}
  ${INTEL}</div>`;
};
V.sources = () => { setTimeout(() => typeset($('#main'))); return `<div class="wide"><div class="crumb"><a href="#/">Home</a></div><h1>Sources &amp; coverage</h1>${SOURCES_HTML}<h2>Source coverage matrix</h2><p class="small muted">✓ = covered; blank = not covered. PYQ column counts mapped items (primary or secondary).</p><table class="t"><tr><th>Concept</th><th>Wk</th><th>Personal notes (Quiz-1 guide)</th><th>Textbook (Dixit, Skeath &amp; Reiley)</th><th>Lecture notes (NotebookLM)</th><th>PYQs</th></tr>${ORDER.map(id => { const c = CON[id]; const n = QUESTIONS.filter(q => q.src === 'PYQ' && q.cs.includes(id)).length; return `<tr><td><a href="#/c/${id}">${c.title}</a></td><td>${c.week}</td><td>${c.src.notes || ''}</td><td>${c.src.text || ''}</td><td>${c.src.lec || ''}</td><td>${n || ''}</td></tr>`; }).join('')}</table>${DISCREPANCIES_HTML}</div>`; };
V.qa = () => { setTimeout(() => typeset($('#main'))); return `<div class="wrap"><div class="crumb"><a href="#/">Home</a></div><h1>Quality assurance report</h1>${QA_HTML}</div>`; };
V.search = q => {
  q = decodeURIComponent(q || ''); const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const m = t => words.every(w => t.toLowerCase().includes(w));
  const hl = t => { let s = esc(t); words.forEach(w => { s = s.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return s; };
  const snip = t => { const i = t.toLowerCase().indexOf(words[0] || ''); return hl(t.slice(Math.max(0, i - 60), i + 140)); };
  const cs = ORDER.map(id => [id, strip(Object.values(CON[id]).filter(v => typeof v === 'string').join(' ') + ' ' + (CON[id].ex || []).map(e => e.t + e.q + e.s).join(' '))]).filter(([id, t]) => m(CON[id].title + ' ' + t));
  const gs = GLOSSARY.filter(g => m(strip(g.term + ' ' + g.def + ' ' + g.intu)));
  const fs = FORMULAS.filter(f => m(strip(f.name + ' ' + f.tex + ' ' + f.sym + ' ' + f.cond)));
  const qs = QUESTIONS.filter(x => m(strip((x.ctx || '') + ' ' + x.stem + ' ' + (x.opts || []).join(' ') + ' ' + (x.paper || ''))));
  setTimeout(() => typeset($('#main')));
  return `<div class="wrap"><h1>Search: “${esc(q)}”</h1>${!words.length ? '<p>Type in the search box.</p>' : ''}
  <h2>Concepts (${cs.length})</h2>${cs.map(([id, t]) => `<div class="hit"><a href="#/c/${id}"><b>${CON[id].title}</b></a> <span class="tag">W${CON[id].week}</span><div class="small muted">…${snip(t)}…</div></div>`).join('') || '<p class="muted">None</p>'}
  <h2>Glossary (${gs.length})</h2>${gs.map(g => `<div class="hit"><b>${g.term}</b> — ${g.def}</div>`).join('') || '<p class="muted">None</p>'}
  <h2>Formulas (${fs.length})</h2>${fs.map(formulaHTML).join('') || '<p class="muted">None</p>'}
  <h2>Questions (${qs.length})</h2>${qs.slice(0, 40).map(x => `<div class="hit">${x.src === 'PYQ' ? `<span class="tag pyq">PYQ ${x.paper} Q${x.qno}</span>` : `<span class="tag new">${x.src === 'VAR' ? 'VARIATION' : x.src === 'GA' ? 'ASSIGNMENT' : 'NEW'}</span>`} <a href="#/c/${x.cs[0]}">${CON[x.cs[0]].title}</a><div class="small">${snip(strip(x.stem))}</div></div>`).join('') || '<p class="muted">None</p>'}</div>`;
};

/* ---------- router ---------- */
function route() {
  const h = location.hash || '#/'; const [path] = h.slice(1).split('?'); const parts = path.split('/').filter(Boolean);
  let html;
  try {
    if (!parts.length) html = V.home();
    else if (parts[0] === 'week') html = V.week(parts[1]);
    else if (parts[0] === 'c') html = V.concept(parts[1]);
    else if (parts[0] === 'sheet') html = V.sheet(parts[1]);
    else if (parts[0] === 'search') html = V.search(parts.slice(1).join('/'));
    else if (V[parts[0]]) html = V[parts[0]]();
    else html = '<p>Page not found. <a href="#/">Home</a></p>';
  } catch (e) { console.error(e); html = `<p class="fb no">Error rendering this page: ${esc(e.message)}</p>`; }
  $('#main').innerHTML = html; refreshSide(); $('#side').classList.remove('open');
  if (!location.hash.includes('?') || parts[0] !== 'mock') window.scrollTo(0, 0);
  typeset($('#main'));
}
window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', () => {
  $('#themeBtn').onclick = () => { const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); S.theme = cur === 'dark' ? 'light' : 'dark'; save(); applyTheme(); };
  $('#menuBtn').onclick = () => $('#side').classList.toggle('open');
  let st; $('#search').addEventListener('input', e => { clearTimeout(st); st = setTimeout(() => { const v = e.target.value.trim(); if (v.length >= 2) location.hash = '#/search/' + encodeURIComponent(v); }, 350); });
  route();
  setTimeout(mathFallback, 8000);
});
