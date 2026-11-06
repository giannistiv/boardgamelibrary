// ── Score sheet: count the points at the table, in Log a play ──
// The user, 6 Nov 2026: BG Stats has score sheets for a lot of games to
// count the points quickly. A game's own sheet is the one last used for it in
// BG Stats (data/scoresheets.js, from the exports: tools/build-scoresheets.py);
// any other game gets a sheet of rounds. Rows down, players across, a total
// under each; Done puts the totals in the players' scores and stars the best.
// The sheet goes up with the play (plays/{id}.ss, the seat order's values) so
// editing the play brings it back.

const SS_ROUNDS = { g: [{ rows: [{ l: 'Round {round}' }], rep: 0, min: 3 }] };
const SS_MAX = 6000;   // the longest sheet the database takes (characters)

let _ss = null;   // { key, sheet, opt, reps: {gi: n}, v: {cell: {name: value}} } — kept in _lp.ss

function _ssSheet(bggId) {
  return (typeof SCORESHEETS !== 'undefined' && SCORESHEETS[bggId]) || SS_ROUNDS;
}
// Whether the lowest total wins this game (golf-style: Skyjo, Turing Machine),
// from which end the winners' scores sat at in its plays (js/records.js).
function _ssLowWins() {
  return typeof _recLowBest === 'function' && _recLowBest(PLAY_HISTORY[_lp.bggId] || [], false);
}
// The game's own sheet or the rounds one; none for a co-op (Everyone won / lost).
function scoreSheetFor(bggId) {
  if (!bggId) return null;
  const g = findGameByBggId(bggId);
  if (g && isCoop(g) && !(typeof SCORESHEETS !== 'undefined' && SCORESHEETS[bggId])) return null;
  return { key: (typeof SCORESHEETS !== 'undefined' && SCORESHEETS[bggId]) ? bggId : 'rounds', sheet: _ssSheet(bggId) };
}

// The blocks shown at this many players, each with its index in the sheet.
function _ssGroups(sheet, n) {
  return sheet.g.map((g, gi) => ({ g, gi })).filter(({ g }) => (!g.pmin || n >= g.pmin) && (!g.pmax || n <= g.pmax));
}
function _ssReps(gi, g) { return g.rep == null ? 1 : Math.max(g.min || 1, (_ss.reps[gi] || 0)); }
const _ssCell = (gi, r, ri) => `${gi}.${r}.${ri}`;
const _ssNum = (v) => { const x = parseFloat(String(v || '').replace(',', '.')); return isFinite(x) ? x : 0; };

// Each player's total, and who won or lost outright on the sheet.
function _ssTotals(names) {
  const tot = names.map(() => 0), won = names.map(() => false), lost = names.map(() => false);
  let any = false;
  for (const { g, gi } of _ssGroups(_ss.sheet, names.length)) {
    for (let r = 1; r <= _ssReps(gi, g); r++) {
      g.rows.forEach((row, ri) => {
        if (row.opt && !_ss.opt) return;
        const cell = _ss.v[_ssCell(gi, r, ri)] || {};
        names.forEach((n, i) => {
          const val = cell[n];
          if (val == null || val === '' || val === false) return;
          any = true;
          if (row.t === 'stat') return;
          if (row.t === 'check' || row.t === 'radio' || row.t === 'win') {
            if (row.v === 'win') won[i] = true;
            else if (row.v === 'lose') lost[i] = true;
            else tot[i] += (row.neg ? -1 : 1) * Math.abs(_ssNum(row.v));
            return;
          }
          const x = _ssNum(val);
          tot[i] += row.neg ? -Math.abs(x) : x;
        });
      });
    }
  }
  return { tot: tot.map(x => Math.round(x * 100) / 100), won, lost, any };
}

// ── The sheet on screen ──
function scoreSheetOpen() {
  const s = scoreSheetFor(_lp.bggId);
  if (!s || !_lp.sc.length) return;
  if (!_lp.ss || _lp.ss.key !== s.key) _lp.ss = { key: s.key, sheet: s.sheet, opt: false, reps: {}, v: {} };
  _ss = _lp.ss;
  let ov = document.getElementById('ss-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'ss-overlay';
    ov.className = 'acct-overlay lp-overlay ss-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
    ov.addEventListener('click', _ssClick);
    ov.addEventListener('input', _ssInput);
    ov.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.matches('.ss-in')) return;
      e.preventDefault();
      // down the player's column: one player's points, row after row
      const col = [...ov.querySelectorAll(`.ss-in[data-p="${e.target.dataset.p}"]`)];
      const next = col[col.indexOf(e.target) + 1];
      if (next) next.focus(); else e.target.blur();
    });
  }
  _ssRender();
  ov.classList.add('open');
  ov._navClose = _ssClose;
  if (typeof navOverlayOpened === 'function') navOverlayOpened('ss');
}
function _ssClose() {
  const ov = document.getElementById('ss-overlay');
  if (!ov || !ov.classList.contains('open')) return;
  ov.classList.remove('open');
  ov._navClose = null;
  if (typeof navOverlayClosed === 'function') navOverlayClosed('ss');
  if (typeof _lpRenderSheetBtn === 'function') _lpRenderSheetBtn();
}

function _ssRender() {
  const ov = document.getElementById('ss-overlay');
  const esc = _escapeHtml;
  const names = _lp.sc.map(p => p.n);
  const game = findGameByBggId(_lp.bggId);
  const groups = _ssGroups(_ss.sheet, names.length);
  const hasOpt = groups.some(({ g }) => g.rows.some(r => r.opt));
  const cols = names.length;
  const head = names.map((n, i) => `<th class="ss-p" scope="col" title="${esc(n)}"><span class="lp-avatar" aria-hidden="true">${avatarInner(n)}</span><span class="ss-pn">${esc(String(n).split(/[\s-]/)[0])}</span></th>`).join('');
  let body = '';
  for (const { g, gi } of groups) {
    const reps = _ssReps(gi, g);
    if (g.h) body += `<tr class="ss-h"><th colspan="${cols + 1}">${esc(g.h)}</th></tr>`;
    for (let r = 1; r <= reps; r++) {
      if (g.rep != null && g.rows.length > 1) body += `<tr class="ss-h"><th colspan="${cols + 1}">Round ${r}</th></tr>`;
      g.rows.forEach((row, ri) => {
        if (row.opt && !_ss.opt) return;
        const key = _ssCell(gi, r, ri);
        const cell = _ss.v[key] || {};
        const worth = typeof row.v === 'number' ? ` <small>${row.neg ? '−' : '+'}${row.v}</small>` : row.v === 'win' ? ' <small>wins</small>' : row.v === 'lose' ? ' <small>out</small>' : '';
        const label = `${row.neg && row.t !== 'check' && row.t !== 'radio' ? '<span class="ss-neg">−</span>' : ''}${esc(String(row.l).replace(/\{round(Label)?\}/g, r))}${worth}`;
        body += `<tr class="${row.t === 'stat' ? 'ss-stat' : ''}"><th class="ss-lab" scope="row">${label}</th>${names.map((n, i) => {
          if (row.t === 'check' || row.t === 'radio' || row.t === 'win') {
            const on = !!cell[n];
            return `<td><button type="button" class="ss-tick${on ? ' on' : ''}" data-ss-tick="${key}" data-p="${i}" aria-pressed="${on}" aria-label="${esc(n)}: ${esc(row.l)}">${on ? '&#10003;' : ''}</button></td>`;
          }
          return `<td><input class="ss-in" data-ss="${key}" data-p="${i}" value="${esc(cell[n] == null ? '' : cell[n])}" inputmode="decimal" enterkeyhint="next" autocomplete="off" aria-label="${esc(n)}: ${esc(row.l)}"></td>`;
        }).join('')}</tr>`;
      });
    }
    if (g.rep != null && (g.rep === 0 || reps < g.rep)) body += `<tr class="ss-more"><td colspan="${cols + 1}"><button type="button" class="lp-textbtn" data-ss-more="${gi}">+ Round ${reps + 1}</button>${reps > (g.min || 1) ? ` <button type="button" class="lp-textbtn" data-ss-less="${gi}">Remove round ${reps}</button>` : ''}</td></tr>`;
  }
  ov.innerHTML = `<div class="lp-sheet ss-sheet">
      <header class="lp-head">
        <span class="lp-headside"></span>
        <div class="lp-title">${esc(game ? game.name : 'Score sheet')}</div>
        <button type="button" class="lp-close" data-ss="close" aria-label="Close">&times;</button>
      </header>
      <div class="ss-wrap">
        <table class="ss-table">
          <thead><tr><th class="ss-lab ss-corner">${_ss.key === 'rounds' ? 'Points' : ''}</th>${head}</tr></thead>
          <tbody>${body}</tbody>
          <tfoot><tr><th class="ss-lab" scope="row">Total</th>${names.map((n, i) => `<td class="ss-tot" data-ss-tot="${i}"></td>`).join('')}</tr></tfoot>
        </table>
        ${hasOpt ? `<button type="button" class="lp-textbtn ss-opt" data-ss="opt">${_ss.opt ? 'Hide the expansion rows' : '+ Expansion rows'}</button>` : ''}
        ${_ss.key !== 'rounds' ? '<div class="lp-hint ss-from">The rows of the score sheet you last used for it in BG Stats.</div>' : ''}
      </div>
      <footer class="lp-foot">
        <button type="button" class="lp-save" data-ss="done">Done: put the totals in</button>
      </footer>
    </div>`;
  _ssShowTotals();
}
function _ssShowTotals() {
  const names = _lp.sc.map(p => p.n);
  const { tot, won, lost } = _ssTotals(names);
  const best = (_ssLowWins() ? Math.min : Math.max)(...tot.filter((_, i) => !lost[i]));
  document.querySelectorAll('#ss-overlay [data-ss-tot]').forEach(td => {
    const i = Number(td.dataset.ssTot);
    td.textContent = String(tot[i]);
    td.classList.toggle('best', won.some(Boolean) ? won[i] : (!lost[i] && tot[i] === best && tot.some(x => x)));
    td.classList.toggle('out', lost[i]);
  });
}

function _ssInput(e) {
  const inp = e.target.closest('.ss-in');
  if (!inp) return;
  const n = _lp.sc[Number(inp.dataset.p)].n;
  const cell = _ss.v[inp.dataset.ss] || (_ss.v[inp.dataset.ss] = {});
  const v = inp.value.trim().slice(0, 8);
  if (v) cell[n] = v; else delete cell[n];
  _ssShowTotals();
}
function _ssClick(e) {
  const ov = document.getElementById('ss-overlay');
  if (e.target === ov) { _ssClose(); return; }
  const b = e.target.closest('[data-ss], [data-ss-tick], [data-ss-more], [data-ss-less]');
  if (!b) return;
  const what = b.dataset.ss;
  if (what === 'close') { _ssClose(); return; }
  if (what === 'opt') { _ss.opt = !_ss.opt; _ssRender(); return; }
  if (what === 'done') { _ssDone(); return; }
  if (b.dataset.ssMore != null || b.dataset.ssLess != null) {
    const gi = Number(b.dataset.ssMore != null ? b.dataset.ssMore : b.dataset.ssLess);
    const g = _ss.sheet.g[gi];
    const reps = _ssReps(gi, g);
    _ss.reps[gi] = b.dataset.ssMore != null ? reps + 1 : Math.max(g.min || 1, reps - 1);
    if (b.dataset.ssLess != null) g.rows.forEach((_, ri) => delete _ss.v[_ssCell(gi, reps, ri)]);
    const keep = ov.querySelector('.ss-wrap').scrollTop;
    _ssRender();
    ov.querySelector('.ss-wrap').scrollTop = keep;
    return;
  }
  if (b.dataset.ssTick) {
    const key = b.dataset.ssTick;
    const [gi, , ri] = key.split('.').map(Number);
    const row = _ss.sheet.g[gi].rows[ri];
    const n = _lp.sc[Number(b.dataset.p)].n;
    const cell = _ss.v[key] || (_ss.v[key] = {});
    const on = !cell[n];
    // a one-player bonus goes to one player; an outright win, to one player on the whole sheet
    if (on && row.t === 'radio') for (const k in cell) delete cell[k];
    if (on && row.t === 'win') {
      _ss.sheet.g.forEach((g, gj) => g.rows.forEach((r, rj) => {
        if (r.t !== 'win') return;
        for (const c of Object.keys(_ss.v)) if (c.startsWith(gj + '.') && c.endsWith('.' + rj)) _ss.v[c] = {};
      }));
    }
    const fresh = _ss.v[key] || (_ss.v[key] = {});
    if (on) fresh[n] = true; else delete fresh[n];
    const keep = ov.querySelector('.ss-wrap').scrollTop;
    _ssRender();
    ov.querySelector('.ss-wrap').scrollTop = keep;
  }
}
// The totals go in as the scores; the best (or whoever won outright) gets the star.
function _ssDone() {
  const names = _lp.sc.map(p => p.n);
  const { tot, won, lost, any } = _ssTotals(names);
  if (any) {
    const best = (_ssLowWins() ? Math.min : Math.max)(...tot.filter((_, i) => !lost[i]));
    _lp.sc.forEach((p, i) => {
      p.s = String(tot[i]);
      p.w = won.some(Boolean) ? won[i] : (!lost[i] && tot[i] === best);
    });
    _lp.gameWon = false;
  }
  _ssClose();
  if (typeof _lpRenderPlayers === 'function') _lpRenderPlayers();
}

// ── Saving and loading it with the play ──
// Packed by seat: { k: game id or 'rounds', o: 1 (expansion rows), r: {gi: rounds},
// v: {cell: [seat 0's value, …]} }. Nothing when the sheet is empty or too long.
function scoreSheetPack() {
  const s = _lp.ss;
  if (!s) return '';
  const names = _lp.sc.map(p => p.n);
  const v = {};
  for (const key in s.v) {
    const row = names.map(n => s.v[key][n] == null ? null : s.v[key][n]);
    if (row.some(x => x != null)) v[key] = row;
  }
  if (!Object.keys(v).length) return '';
  const out = JSON.stringify({ k: s.key, o: s.opt ? 1 : 0, r: s.reps, v });
  return out.length <= SS_MAX ? out : '';
}
function scoreSheetUnpack(str, sc) {
  try {
    const o = JSON.parse(str);
    const sheet = o.k === 'rounds' ? SS_ROUNDS : _ssSheet(o.k);
    const v = {};
    for (const key in o.v || {}) {
      v[key] = {};
      o.v[key].forEach((x, i) => { if (x != null && sc[i]) v[key][sc[i].n] = x; });
    }
    return { key: o.k, sheet, opt: !!o.o, reps: o.r || {}, v };
  } catch (_) {
    return null;
  }
}
// Whether a sheet has anything in it (for the button's wording).
function scoreSheetFilled() {
  return !!(_lp.ss && Object.values(_lp.ss.v).some(c => Object.keys(c).length));
}
