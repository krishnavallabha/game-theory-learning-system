/* Visual helpers used by the content files. All return HTML strings. */
const R = String.raw;
const M = {};

/* Payoff matrix. cells: array of rows, each cell "a, b" (row payoff first).
   br:true underlines best responses (computed numerically); ne:'auto' highlights cells that are mutual best responses;
   ne:[[r,c]] highlights given cells; hl:[[r,c]] soft highlight. */
M.mat = function (o) {
  const rows = o.rows, cols = o.cols, cells = o.cells;
  const num = cells.map(r => r.map(c => String(c).replace(/−/g, '-').split(',').map(s => parseFloat(s))));
  const isNum = num.every(r => r.every(c => c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1])));
  let br1 = [], br2 = [];
  if (isNum && (o.br || o.ne === 'auto')) {
    br1 = rows.map(() => cols.map(() => false)); br2 = rows.map(() => cols.map(() => false));
    cols.forEach((_, j) => { const m = Math.max(...rows.map((_, i) => num[i][j][0])); rows.forEach((_, i) => { if (Math.abs(num[i][j][0] - m) < 1e-9) br1[i][j] = true; }); });
    rows.forEach((_, i) => { const m = Math.max(...cols.map((_, j) => num[i][j][1])); cols.forEach((_, j) => { if (Math.abs(num[i][j][1] - m) < 1e-9) br2[i][j] = true; }); });
  }
  const neSet = new Set();
  if (o.ne === 'auto' && isNum) rows.forEach((_, i) => cols.forEach((_, j) => { if (br1[i][j] && br2[i][j]) neSet.add(i + ',' + j); }));
  else if (Array.isArray(o.ne)) o.ne.forEach(([i, j]) => neSet.add(i + ',' + j));
  const hl = new Set((o.hl || []).map(([i, j]) => i + ',' + j));
  let h = '<div class="fig"><table class="mtx">';
  h += `<tr><td class="pl"></td><td class="pl"></td><td class="pl" colspan="${cols.length}">${o.cp || 'Player 2'}</td></tr>`;
  h += '<tr><td class="pl"></td><td class="pl"></td>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';
  rows.forEach((r, i) => {
    h += '<tr>' + (i === 0 ? `<td class="pl" rowspan="${rows.length}" style="writing-mode:vertical-rl;transform:rotate(180deg)">${o.rp || 'Player 1'}</td>` : '') + `<th>${r}</th>`;
    cols.forEach((_, j) => {
      let txt;
      if (isNum && o.br) {
        const [a, b] = String(cells[i][j]).split(',').map(s => s.trim());
        txt = (br1[i][j] ? `<u>${a}</u>` : a) + ', ' + (br2[i][j] ? `<u>${b}</u>` : b);
      } else txt = cells[i][j];
      const cls = neSet.has(i + ',' + j) ? 'ne' : (hl.has(i + ',' + j) ? 'hl' : '');
      h += `<td class="${cls}">${txt}</td>`;
    });
    h += '</tr>';
  });
  h += '</table></div>';
  if (o.cap) h += `<div class="mcap">${o.cap}</div>`;
  return h;
};

/* Game tree. node: {p:'P1', id:'x', ch:[{a:'A', hl:true, n:{pay:'(2,0)'}}, ...]}. info: [['id1','id2','label']] dashed info sets. */
M.tree = function (root, o = {}) {
  const dx = o.dx || 92, dy = o.dy || 84, pad = 40;
  let leaf = 0, maxd = 0; const nodes = [], edges = [], byId = {};
  (function lay(n, d) {
    maxd = Math.max(maxd, d); n._d = d;
    if (!n.ch || !n.ch.length) { n._x = leaf++; }
    else { n.ch.forEach(c => lay(c.n, d + 1)); n._x = n.ch.reduce((s, c) => s + c.n._x, 0) / n.ch.length; }
    nodes.push(n); if (n.id) byId[n.id] = n;
  })(root, 0);
  const X = n => pad + n._x * dx + 30, Y = n => pad + n._d * dy;
  const W = pad * 2 + Math.max(leaf - 1, 1) * dx + 60, H = pad + maxd * dy + 46;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="game tree">`;
  (function draw(n) {
    (n.ch || []).forEach(c => {
      const x1 = X(n), y1 = Y(n), x2 = X(c.n), y2 = Y(c.n);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.hl ? 'var(--good)' : 'var(--muted)'}" stroke-width="${c.hl ? 3.2 : 1.4}"/>`;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, off = x2 < x1 ? -9 : (x2 > x1 ? 9 : 10);
      s += `<text x="${mx + off}" y="${my}" font-size="13" text-anchor="${x2 < x1 ? 'end' : 'start'}" font-weight="600">${c.a}</text>`;
      draw(c.n);
    });
  })(root);
  (o.info || []).forEach(([a, b, lab]) => {
    const A = byId[a], B = byId[b]; if (!A || !B) return;
    s += `<line x1="${X(A)}" y1="${Y(A)}" x2="${X(B)}" y2="${Y(B)}" stroke="var(--acc)" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    if (lab) s += `<text x="${(X(A) + X(B)) / 2}" y="${Y(A) - 10}" font-size="11.5" text-anchor="middle" fill="var(--acc)">${lab}</text>`;
  });
  nodes.forEach(n => {
    if (n.ch && n.ch.length) {
      s += `<circle cx="${X(n)}" cy="${Y(n)}" r="${n.chance ? 7 : 5.5}" fill="${n.chance ? 'var(--panel)' : 'var(--ink)'}" stroke="var(--ink)" stroke-width="1.4"/>`;
      s += `<text x="${X(n)}" y="${Y(n) - 11}" font-size="12.5" text-anchor="middle" font-weight="700">${n.p || ''}</text>`;
    } else {
      s += `<circle cx="${X(n)}" cy="${Y(n)}" r="3" fill="var(--muted)"/>`;
      s += `<text x="${X(n)}" y="${Y(n) + 20}" font-size="13" text-anchor="middle">${n.pay || ''}</text>`;
    }
  });
  s += '</svg>';
  return `<div class="fig">${s}</div>` + (o.cap ? `<div class="mcap">${o.cap}</div>` : '');
};

/* Line plot. lines:[{f:x=>.., lab, dash}], segs:[[x1,y1,x2,y2,colorVar]], pts:[{x,y,lab}] */
M.plot = function (o) {
  const W = o.w || 460, H = o.h || 300, L = 48, B = 38, T = 14, Rr = 70;
  const [x0, x1] = o.xr, [y0, y1] = o.yr;
  const sx = x => L + (x - x0) / (x1 - x0) * (W - L - Rr), sy = y => H - B - (y - y0) / (y1 - y0) * (H - B - T);
  const pal = ['var(--acc)', 'var(--bad)', 'var(--good)', 'var(--warn)', 'var(--intub)', 'var(--muted)'];
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${o.aria || 'plot'}">`;
  s += `<line x1="${L}" y1="${sy(y0)}" x2="${W - Rr + 6}" y2="${sy(y0)}" stroke="var(--ink2)"/><line x1="${L}" y1="${sy(y0)}" x2="${L}" y2="${T - 4}" stroke="var(--ink2)"/>`;
  (o.xt || []).forEach(t => { s += `<line x1="${sx(t[0])}" y1="${sy(y0)}" x2="${sx(t[0])}" y2="${sy(y0) + 4}" stroke="var(--ink2)"/><text x="${sx(t[0])}" y="${sy(y0) + 17}" font-size="11.5" text-anchor="middle">${t[1]}</text>`; });
  (o.yt || []).forEach(t => { s += `<line x1="${L - 4}" y1="${sy(t[0])}" x2="${L}" y2="${sy(t[0])}" stroke="var(--ink2)"/><text x="${L - 7}" y="${sy(t[0]) + 4}" font-size="11.5" text-anchor="end">${t[1]}</text>`; });
  if (o.xlab) s += `<text x="${W - Rr + 10}" y="${sy(y0) + 4}" font-size="12">${o.xlab}</text>`;
  if (o.ylab) s += `<text x="${L + 6}" y="${T + 2}" font-size="12">${o.ylab}</text>`;
  (o.lines || []).forEach((ln, k) => {
    const c = ln.c || pal[k % pal.length]; let d = '';
    for (let i = 0; i <= 80; i++) { const x = x0 + (x1 - x0) * i / 80; d += (i ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(ln.f(x)).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" ${ln.dash ? 'stroke-dasharray="6 4"' : ''}/>`;
    s += `<text x="${sx(x1) + 5}" y="${sy(ln.f(x1)) + 4}" font-size="12" fill="${c}" font-weight="600">${ln.lab || ''}</text>`;
  });
  (o.segs || []).forEach(g => { s += `<line x1="${sx(g[0])}" y1="${sy(g[1])}" x2="${sx(g[2])}" y2="${sy(g[3])}" stroke="${g[4] || 'var(--acc)'}" stroke-width="3" ${g[5] ? 'stroke-dasharray="6 4"' : ''}/>`; });
  (o.pts || []).forEach(p => { s += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5" fill="${p.c || 'var(--good)'}" stroke="var(--panel)" stroke-width="1.5"/>`; if (p.lab) s += `<text x="${sx(p.x) + (p.dx || 8)}" y="${sy(p.y) + (p.dy || -8)}" font-size="12" font-weight="600">${p.lab}</text>`; });
  (o.legend || []).forEach((t, k) => { s += `<text x="${L + 8}" y="${T + 18 + k * 15}" font-size="11.5" fill="${t[1] || 'var(--ink2)'}">${t[0]}</text>`; });
  s += '</svg>';
  return `<div class="fig">${s}</div>` + (o.cap ? `<div class="mcap">${o.cap}</div>` : '');
};

/* Two-route network (A→X→B, A→Y→B) with optional X–Y link. labels: {ax, xb, ay, yb, xy} */
M.net = function (lb, o = {}) {
  const W = 380, H = 220;
  const P = { A: [40, 110], X: [190, 30], Y: [190, 190], B: [340, 110] };
  const n = o.names || { A: 'A', X: 'X', Y: 'Y', B: 'B' };
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="road network">`;
  const e = (a, b, t, pos) => { const [x1, y1] = P[a], [x2, y2] = P[b]; s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--muted)" stroke-width="2.4"/>`; const mx = (x1 + x2) / 2 + (pos[0] || 0), my = (y1 + y2) / 2 + (pos[1] || 0); s += `<text x="${mx}" y="${my}" font-size="12" text-anchor="middle">${t}</text>`; };
  e('A', 'X', lb.ax, [-24, -6]); e('X', 'B', lb.xb, [26, -6]); e('A', 'Y', lb.ay, [-24, 16]); e('Y', 'B', lb.yb, [26, 16]);
  if (lb.xy) { const [x1, y1] = P.X, [x2, y2] = P.Y; s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--acc)" stroke-width="2.4" stroke-dasharray="${o.dash ? '6 4' : '0'}"/><text x="${x1 + 8}" y="${(y1 + y2) / 2}" font-size="12" fill="var(--acc)">${lb.xy}</text>`; }
  Object.entries(P).forEach(([k, [x, y]]) => { s += `<circle cx="${x}" cy="${y}" r="13" fill="var(--panel)" stroke="var(--ink)" stroke-width="1.5"/><text x="${x}" y="${y + 4.5}" font-size="13" text-anchor="middle" font-weight="700">${n[k]}</text>`; });
  s += '</svg>';
  return `<div class="fig">${s}</div>` + (o.cap ? `<div class="mcap">${o.cap}</div>` : '');
};

M.box = (kind, title, html) => `<div class="box ${kind}"><div class="bt">${title}</div>${html}</div>`;
M.def = h => M.box('', 'Definition', h);
M.intu = h => M.box('intu', 'Intuition', h);
M.exam = h => M.box('exam', 'Exam note', h);
M.trap = h => M.box('trap', 'Trap', h);
M.note = h => M.box('note', 'Note', h);
