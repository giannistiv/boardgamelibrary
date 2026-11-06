// ── Score sheet: count the points at the table, in Log a play ──
// The user, 6 Nov 2026: BG Stats has score sheets for a lot of games to
// count the points quickly. A game's own sheet is the one last used for it in
// BG Stats (data/scoresheets.js, from the exports: tools/build-scoresheets.py);
// any other game gets a sheet of rounds. Rows down, players across, a total
// under each; Done puts the totals in the players' scores and stars the best.
// The sheet goes up with the play (plays/{id}.ss, the seat order's values) so
// editing the play brings it back. Under each total: that player's average and
// best in the game. Counting together: the other players open the sheet on
// their own phones (a link or QR code, sheets/{code} in Firebase) and fill in
// their own columns; it all comes together live on the phone logging the play.

const SS_ROUNDS = { g: [{ rows: [{ l: 'Round {round}' }], rep: 0, min: 3 }] };
const SS_MAX = 6000;   // the longest sheet the database takes (characters)

// The sheet on screen: { key, sheet, opt, reps: {gi: n}, v: {cell: {name: value}},
// names, bggId, x (its expansions), pace, join (opened from a link), me (that
// phone's column) }. Log a play keeps its own in _lp.ss.
let _ss = null;

function _ssSheet(bggId) {
  return (typeof SCORESHEETS !== 'undefined' && SCORESHEETS[bggId]) || SS_ROUNDS;
}
// Whether the lowest total wins this game (golf-style: Skyjo, Turing Machine),
// from which end the winners' scores sat at in its plays (js/records.js).
function _ssLowWins() {
  return typeof _recLowBest === 'function' && _recLowBest(PLAY_HISTORY[_ss.bggId] || [], false);
}
// Each player's average and best total in this game (2+ scored plays), for under their total.
function _ssPaceOf(bggId, names) {
  const low = typeof _recLowBest === 'function' && _recLowBest(PLAY_HISTORY[bggId] || [], false);
  const canon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
  return names.map(n => {
    const c = canon(n);
    const xs = [];
    for (const p of PLAY_HISTORY[bggId] || []) {
      const s = (p.sc || []).find(q => q && (q.n === n || canon(q.n) === c));
      const v = s && typeof _recScore === 'function' ? _recScore(s.s) : null;
      if (v !== null && v !== undefined) xs.push(v);
    }
    if (xs.length < 2) return null;
    return { avg: Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10, best: (low ? Math.min : Math.max)(...xs), low };
  });
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
// An expansion's row shows when the play has that expansion, or on "+ Expansion rows".
const _ssShows = (row) => !row.opt || _ss.opt || !!(row.x && row.x.some(id => (_ss.x || []).includes(Number(id))));
// a cell as typed: "12", "2,5", or a sum like "14+10" (js/records.js reads scores so)
const _ssNum = (v) => {
  const t = String(v || '').replace(',', '.');
  const x = typeof _recScore === 'function' ? _recScore(t) : parseFloat(t);
  return x === null || !isFinite(x) ? 0 : x;
};

// Each player's total, and who won or lost outright on the sheet.
function _ssTotals(names) {
  const tot = names.map(() => 0), won = names.map(() => false), lost = names.map(() => false), filled = names.map(() => false);
  let any = false;
  for (const { g, gi } of _ssGroups(_ss.sheet, names.length)) {
    for (let r = 1; r <= _ssReps(gi, g); r++) {
      g.rows.forEach((row, ri) => {
        if (!_ssShows(row)) return;
        const cell = _ss.v[_ssCell(gi, r, ri)] || {};
        names.forEach((n, i) => {
          const val = cell[n];
          if (val == null || val === '' || val === false) return;
          any = true;
          filled[i] = true;
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
  return { tot: tot.map(x => Math.round(x * 100) / 100), won, lost, any, filled };
}

// ── How each row scores, from the game's rules card (js/rules.js) ──
// The card's end-of-game lines, and any other line about points, go on top
// ("How it scores"); under a row goes the line that names it (a word of the
// row's own: "Horizontal lines" → "…each complete horizontal line…").
let _ssHow = [];
const SS_STOP = new Set(['points', 'point', 'score', 'scoring', 'scored', 'track', 'total', 'each', 'your', 'with', 'from', 'game', 'player', 'players',
  'card', 'cards', 'token', 'tokens', 'tile', 'tiles', 'final', 'bonus', 'bonuses', 'victory', 'most', 'least', 'value', 'other', 'during', 'remaining', 'left']);
// a few words the sheets and the cards say differently
const SS_SAME = { horizontal: 'row', vertical: 'column', colour: 'color', dollar: 'money', coin: 'money', vp: 'point' };
const _ssStems = (t) => (String(t).toLowerCase().match(/[a-z\u0370-\u03ff]{3,}/g) || [])
  .filter(w => w.length >= 4 || w === 'row').map(w => w.replace(/(es|s)$/, ''))
  .filter(w => !SS_STOP.has(w) && !SS_STOP.has(w + 's')).map(w => SS_SAME[w] || w);
// a part worth showing says what it's worth, and isn't a tie-breaker or a "then …"
const SS_WORTH = /\d|½|\b(VP|OP)\b|point|per |each|value|minus|−/i, SS_NOT = /^(ties?|then|tiebreak)\b/i;
// The part of a card's line that names the row ("+7 per full column" out of
// Azul's one line for rows, columns and colours), or the whole line.
function _ssHint(label) {
  const stems = _ssStems(String(label).replace(/\{round(Label)?\}/g, ''));
  if (!stems.length || !_ssHow.length) return '';
  const hits = (t) => { const w = new Set(_ssStems(t)); return stems.filter(s => w.has(s)).length; };
  let best = '', bestN = 0;
  for (const line of _ssHow) {
    const plain = line.replace(/\*\*/g, '');
    for (const part of [plain, ...plain.split(/[;,]\s+|\.\s+/)]) {
      if (SS_NOT.test(part.trim()) || !SS_WORTH.test(part)) continue;
      const n = hits(part);
      if (n > bestN || (n === bestN && n && part.length < best.length && part.length >= 12)) { best = part; bestN = n; }
    }
  }
  return bestN ? best.replace(/\.$/, '') : '';
}
function _ssLoadHints() {
  if (typeof _loadRules !== 'function') return;
  const id = _ss.bggId;
  _loadRules().then(all => {
    const r = all && all[id];
    if (!r || !_ss || _ss.bggId !== id) return;
    const pts = /\b(VP|OP|points?|scores?)\b/i;
    _ssHow = [...(r.end || []), ...[...(r.round || []), ...(r.forget || [])].filter(b => pts.test(b))];
    const ov = document.getElementById('ss-overlay');
    if (!_ssHow.length || !ov || !ov.classList.contains('open')) return;
    const keep = ov.querySelector('.ss-wrap').scrollTop;
    _ssRender();
    ov.querySelector('.ss-wrap').scrollTop = keep;
  }).catch(() => {});
}

// ── The sheet on screen ──
function scoreSheetOpen() {
  const s = scoreSheetFor(_lp.bggId);
  if (!s || !_lp.sc.length) return;
  if (!_lp.ss || _lp.ss.key !== s.key) {
    if (_ssLive && _ssLive.host) _ssLiveStop(true);   // another game: its sheet is over
    _lp.ss = { key: s.key, sheet: s.sheet, opt: false, reps: {}, v: {} };
  }
  _ss = _lp.ss;
  _ss.names = _lp.sc.map(p => p.n);
  _ss.bggId = _lp.bggId;
  _ss.x = (_lp.x || []).map(Number);
  _ss.pace = _ssPaceOf(_ss.bggId, _ss.names);
  if (_ssLive && _ssLive.host) _ssLivePushAll();   // players added or gone meanwhile
  _ssShow();
}
function _ssShow() {
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
    ov.addEventListener('focusout', (e) => { if (e.target.matches('.ss-in')) _ssFlush(); });
    ov.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.matches('.ss-in')) return;
      e.preventDefault();
      // down the player's column: one player's points, row after row
      const col = [...ov.querySelectorAll(`.ss-in[data-p="${e.target.dataset.p}"]`)];
      const next = col[col.indexOf(e.target) + 1];
      if (next) next.focus(); else e.target.blur();
    });
  }
  _ssHow = [];
  _ssRender();
  _ssLoadHints();
  ov.classList.add('open');
  ov._navClose = _ssClose;
  if (typeof navOverlayOpened === 'function') navOverlayOpened('ss');
}
function _ssClose() {
  const ov = document.getElementById('ss-overlay');
  if (!ov || !ov.classList.contains('open')) return;
  _ssFlush();
  ov.classList.remove('open');
  ov._navClose = null;
  if (typeof navOverlayClosed === 'function') navOverlayClosed('ss');
  if (_ss && _ss.join) { _ssLiveStop(false); _ss = null; return; }   // a joined sheet: done on this phone
  if (typeof _lpRenderSheetBtn === 'function') _lpRenderSheetBtn();
}

function _ssRender() {
  const ov = document.getElementById('ss-overlay');
  const esc = _escapeHtml;
  const names = _ss.names;
  const game = findGameByBggId(_ss.bggId);
  const groups = _ssGroups(_ss.sheet, names.length);
  const hasOpt = groups.some(({ g }) => g.rows.some(r => r.opt && !(r.x && r.x.some(id => (_ss.x || []).includes(Number(id))))));
  const cols = names.length;
  const me = (i) => (_ss.join && i === _ss.me ? ' me' : '');
  const head = names.map((n, i) => `<th class="ss-p${me(i)}" scope="col" title="${esc(n)}"><span class="lp-avatar" aria-hidden="true">${avatarInner(n)}</span><span class="ss-pn">${esc(String(n).split(/[\s-]/)[0])}</span></th>`).join('');
  let body = '';
  for (const { g, gi } of groups) {
    const reps = _ssReps(gi, g);
    if (g.h) body += `<tr class="ss-h"><th colspan="${cols + 1}">${esc(g.h)}</th></tr>`;
    for (let r = 1; r <= reps; r++) {
      if (g.rep != null && g.rows.length > 1) body += `<tr class="ss-h"><th colspan="${cols + 1}">Round ${r}</th></tr>`;
      g.rows.forEach((row, ri) => {
        if (!_ssShows(row)) return;
        const key = _ssCell(gi, r, ri);
        const cell = _ss.v[key] || {};
        const worth = typeof row.v === 'number' ? ` <small>${row.neg ? '−' : '+'}${row.v}</small>` : row.v === 'win' ? ' <small>wins</small>' : row.v === 'lose' ? ' <small>out</small>' : '';
        const hint = _ssHint(row.l);
        const label = `${row.neg && row.t !== 'check' && row.t !== 'radio' ? '<span class="ss-neg">−</span>' : ''}${esc(String(row.l).replace(/\{round(Label)?\}/g, r))}${worth}${
          hint ? `<span class="ss-hint" title="${esc(hint)}">${esc(hint)}</span>` : ''}`;
        body += `<tr class="${row.t === 'stat' ? 'ss-stat' : ''}"><th class="ss-lab" scope="row">${label}</th>${names.map((n, i) => {
          if (row.t === 'check' || row.t === 'radio' || row.t === 'win') {
            const on = !!cell[n];
            return `<td class="${me(i).trim()}"><button type="button" class="ss-tick${on ? ' on' : ''}" data-ss-tick="${key}" data-p="${i}" aria-pressed="${on}" aria-label="${esc(n)}: ${esc(row.l)}">${on ? '&#10003;' : ''}</button></td>`;
          }
          return `<td class="${me(i).trim()}"><input class="ss-in" data-ss="${key}" data-p="${i}" value="${esc(cell[n] == null ? '' : cell[n])}" inputmode="decimal" enterkeyhint="next" autocomplete="off" aria-label="${esc(n)}: ${esc(row.l)}"></td>`;
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
        ${_ssLiveHtml()}
        ${_ssHow.length ? `<details class="ss-how"><summary>How it scores</summary><ul>${_ssHow.map(b => `<li>${_rulesText(b)}</li>`).join('')}</ul></details>` : ''}
        <table class="ss-table">
          <thead><tr><th class="ss-lab ss-corner">${_ss.key === 'rounds' ? 'Points' : ''}</th>${head}</tr></thead>
          <tbody>${body}</tbody>
          <tfoot><tr><th class="ss-lab" scope="row">Total${_ss.pace && _ss.pace.some(Boolean) ? '<small class="ss-pace-h">their average and best</small>' : ''}</th>${names.map((n, i) => `<td class="ss-tot${me(i)}" data-ss-tot="${i}"><b></b><small></small></td>`).join('')}</tr></tfoot>
        </table>
        ${hasOpt ? `<button type="button" class="lp-textbtn ss-opt" data-ss="opt">${_ss.opt ? 'Hide the expansion rows' : '+ Expansion rows'}</button>` : ''}
        ${_ss.key !== 'rounds' ? '<div class="lp-hint ss-from">The rows of the score sheet you last used for it in BG Stats.</div>' : ''}
      </div>
      <footer class="lp-foot">
        <button type="button" class="lp-save" data-ss="done">${_ss.join ? 'Done' : 'Done: put the totals in'}</button>
      </footer>
    </div>`;
  _ss.drawn = _ssShape();
  _ssShowTotals();
}
// What a redraw depends on (more than the values): a change in it redraws the sheet.
function _ssShape() { return JSON.stringify([_ss.names, _ss.reps, _ss.opt, _ss.x, _ss.me, !!_ssLive]); }
function _ssShowTotals() {
  const names = _ss.names;
  const { tot, won, lost, filled } = _ssTotals(names);
  const best = (_ssLowWins() ? Math.min : Math.max)(...tot.filter((_, i) => !lost[i]));
  document.querySelectorAll('#ss-overlay [data-ss-tot]').forEach(td => {
    const i = Number(td.dataset.ssTot);
    td.querySelector('b').textContent = String(tot[i]);
    td.classList.toggle('best', won.some(Boolean) ? won[i] : (!lost[i] && tot[i] === best && tot.some(x => x)));
    td.classList.toggle('out', lost[i]);
    // their average and best here; a new best as it happens
    const pace = _ss.pace && _ss.pace[i];
    const beat = !!(pace && filled[i] && (pace.low ? tot[i] < pace.best : tot[i] > pace.best));
    td.classList.toggle('pb', beat);
    td.querySelector('small').innerHTML = !pace ? '' : beat ? 'new best!' : `avg ${pace.avg}<br>best ${pace.best}`;
  });
}

function _ssInput(e) {
  const inp = e.target.closest('.ss-in');
  if (!inp) return;
  const i = Number(inp.dataset.p);
  const n = _ss.names[i];
  const cell = _ss.v[inp.dataset.ss] || (_ss.v[inp.dataset.ss] = {});
  const v = inp.value.trim().slice(0, 8);
  if (v) cell[n] = v; else delete cell[n];
  _ssShowTotals();
  _ssQueue(inp.dataset.ss, i);
}
function _ssClick(e) {
  const ov = document.getElementById('ss-overlay');
  if (e.target === ov) { _ssClose(); return; }
  const b = e.target.closest('[data-ss], [data-ss-tick], [data-ss-more], [data-ss-less], [data-ss-me]');
  if (!b) return;
  const what = b.dataset.ss;
  if (what === 'close') { _ssClose(); return; }
  if (what === 'opt') { _ss.opt = !_ss.opt; _ssRender(); return; }
  if (what === 'done') { if (_ss.join) _ssClose(); else _ssDone(); return; }
  if (what === 'live') { _ssLiveStart(); return; }
  if (what === 'livestop') { _ssLiveStop(true); _ssRender(); return; }
  if (what === 'livelink') { _ssLiveShare(b); return; }
  if (b.dataset.ssMe != null) { _ss.me = Number(b.dataset.ssMe); _ssRender(); return; }
  if (b.dataset.ssMore != null || b.dataset.ssLess != null) {
    const gi = Number(b.dataset.ssMore != null ? b.dataset.ssMore : b.dataset.ssLess);
    const g = _ss.sheet.g[gi];
    const reps = _ssReps(gi, g);
    const before = JSON.stringify(_ss.v);
    _ss.reps[gi] = b.dataset.ssMore != null ? reps + 1 : Math.max(g.min || 1, reps - 1);
    if (b.dataset.ssLess != null) g.rows.forEach((_, ri) => delete _ss.v[_ssCell(gi, reps, ri)]);
    _ssPushDiff(before);
    _ssPushReps(gi);
    const keep = ov.querySelector('.ss-wrap').scrollTop;
    _ssRender();
    ov.querySelector('.ss-wrap').scrollTop = keep;
    return;
  }
  if (b.dataset.ssTick) {
    const key = b.dataset.ssTick;
    const [gi, , ri] = key.split('.').map(Number);
    const row = _ss.sheet.g[gi].rows[ri];
    const n = _ss.names[Number(b.dataset.p)];
    const before = JSON.stringify(_ss.v);
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
    _ssPushDiff(before);
    const keep = ov.querySelector('.ss-wrap').scrollTop;
    _ssRender();
    ov.querySelector('.ss-wrap').scrollTop = keep;
  }
}
// The totals go in as the scores; the best (or whoever won outright) gets the star.
function _ssDone() {
  _ssFlush();
  const names = _ss.names;
  const { tot, won, lost, any } = _ssTotals(names);
  if (any) {
    const best = (_ssLowWins() ? Math.min : Math.max)(...tot.filter((_, i) => !lost[i]));
    _lp.sc.forEach((p, i) => {
      p.s = String(tot[i]);
      p.w = won.some(Boolean) ? won[i] : (!lost[i] && tot[i] === best);
    });
    _lp.gameWon = false;
    _lp.winSet = true;   // the sheet settled it (an outright win beats the points)
  }
  if (_ssLive && _ssLive.host) _ssLiveStop(true);   // counted: the others' sheets close
  _ssClose();
  if (typeof _lpRenderPlayers === 'function') _lpRenderPlayers();
}

// ── Counting together ──
// sheets/{code} = { g: game, k: sheet, n: [names], v: { "0_1_2": { p0: value } },
// r: { g0: rounds }, o, x: [expansions], h: who logs it, at }. Firebase keys
// can't hold a dot, so a cell "0.1.2" goes up as "0_1_2", and a player as
// their seat (p0, p1…). Each change goes up on its own (one player's cell), so
// phones typing at once don't overwrite each other; the stream brings the
// rest. The phone logging the play deletes the sheet when it's done; a sheet
// left behind goes after half a day. Until the rules have sheets/, it lives
// in the spare store (FB_SPARE).
let _ssLive = null;   // { code, store, host, data (the sheet as Firebase has it), es }
const SS_LIVE_AGE = 12 * 3600000;
const _ssRemoteKey = (k) => k.replace(/\./g, '_');
const _ssLink = (code) => `${location.origin}${location.pathname}?sheet=${code}`;
const _ssLivePath = (rest) => `sheets/${_ssLive.code}${rest || ''}`;

function _ssLiveHtml() {
  if (_ss.join) {
    const esc = _escapeHtml;
    const ended = _ssLive && _ssLive.ended;
    return `<div class="ss-live-note">${ended ? 'Counting is over: the totals are in on the phone that logs the play.'
      : `Fill in your column: it shows up on ${esc(_ss.host || 'the')}${_ss.host ? '&rsquo;s' : ''} phone as you type.`}</div>
      ${!ended && _ss.me < 0 ? `<div class="ss-me"><span>Which one are you?</span>${_ss.names.map((n, i) => `<button type="button" class="lp-who-chip" data-ss-me="${i}"><span class="lp-avatar" aria-hidden="true">${avatarInner(n)}</span><span>${esc(n)}</span></button>`).join('')}</div>` : ''}`;
  }
  if (!_ssLive) {
    return `<button type="button" class="ss-live-btn" data-ss="live"><span aria-hidden="true">&#128241;</span> Count together
      <small>everyone fills in their own column, on their own phone</small></button>`;
  }
  return `<details class="ss-live-on" open>
      <summary>Counting together <small>others: scan this or open the link</small></summary>
      <div class="ss-qr" data-ss-qr>Making the QR code…</div>
      <div class="ss-live-acts">
        <button type="button" class="lp-textbtn" data-ss="livelink">${navigator.share ? 'Share the link' : 'Copy the link'}</button>
        <button type="button" class="lp-textbtn" data-ss="livestop">Stop</button>
      </div>
    </details>`;
}
// The sheet as it goes up.
function _ssToRemote() {
  const v = {};
  for (const k in _ss.v) {
    const cell = {};
    _ss.names.forEach((n, i) => { const x = _ss.v[k][n]; if (x != null && x !== '' && x !== false) cell[`p${i}`] = x; });
    if (Object.keys(cell).length) v[_ssRemoteKey(k)] = cell;
  }
  const r = {};
  for (const gi in _ss.reps) r[`g${gi}`] = _ss.reps[gi];
  return { g: _ss.bggId, k: _ss.key, n: _ss.names, v, r, o: _ss.opt ? 1 : 0, x: _ss.x || [], h: (typeof _navPlayer === 'function' && _navPlayer()) || '', at: Date.now() };
}
async function _ssLiveStart() {
  if (_ssLive) return;
  const code = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  try {
    const { store } = await fbWrite(`sheets/${code}`, 'PUT', _ssToRemote());
    _ssLive = { code, store, host: true, data: null };
  } catch (e) {
    alert('Couldn\'t start counting together. Check the connection and try again.');
    return;
  }
  _ssLiveListen();
  _ssRender();
  _ssLiveQr();
  _ssLiveSweep();
}
// A sheet left behind (its phone closed before Done) goes after half a day.
async function _ssLiveSweep() {
  try {
    const { main, spare } = await fbReadBoth('sheets');
    for (const [store, all] of [['main', main], ['spare', spare]]) {
      for (const code in all || {}) {
        if (!all[code] || !(Date.now() - (all[code].at || 0) > SS_LIVE_AGE)) continue;
        fbWrite(`sheets/${code}`, 'DELETE', null, store).catch(() => {});
      }
    }
  } catch (_) { /* next time */ }
}
// Stop: the stream closes; the phone logging the play deletes the sheet (remove).
function _ssLiveStop(remove) {
  if (!_ssLive) return;
  _ssFlush();
  if (_ssLive.es) _ssLive.es.close();
  if (remove && _ssLive.host) fbWrite(`sheets/${_ssLive.code}`, 'DELETE', null, _ssLive.store).catch(() => {});
  _ssLive = null;
}
// Log a play closed or saved: a sheet still being counted together is over.
function scoreSheetEnd() {
  if (_ssLive && _ssLive.host) _ssLiveStop(true);
}
function _ssLiveQr() {
  if (!_ssLive || typeof _bgsLoadQr !== 'function') return;
  const code = _ssLive.code;
  _bgsLoadQr().then(ok => {
    const box = document.querySelector('#ss-overlay [data-ss-qr]');
    if (!box || !_ssLive || _ssLive.code !== code) return;
    box.innerHTML = ok ? _bgsQrSvg(_ssLink(code)) : 'The QR code needs a connection the first time: share the link instead.';
  });
}
async function _ssLiveShare(btn) {
  const link = _ssLink(_ssLive.code);
  const game = findGameByBggId(_ss.bggId);
  if (navigator.share) {
    try { await navigator.share({ title: `${game ? game.name : 'Score sheet'}: count together`, url: link }); } catch (_) {}
    return;
  }
  try { await navigator.clipboard.writeText(link); btn.textContent = 'Link copied'; } catch (_) { btn.textContent = link; }
}
// Everything again (players added or gone while it was closed).
function _ssLivePushAll() {
  if (!_ssLive) return;
  const d = _ssToRemote();
  fbWrite(_ssLivePath('/n'), 'PUT', d.n, _ssLive.store).catch(() => {});
  fbWrite(_ssLivePath('/x'), 'PUT', d.x, _ssLive.store).catch(() => {});
}
// One player's cell goes up a moment after the typing stops (or when the field is left).
const _ssPending = new Map();   // "cell|seat" → timer
function _ssQueue(key, i) {
  if (!_ssLive) return;
  const id = `${key}|${i}`;
  clearTimeout(_ssPending.get(id));
  _ssPending.set(id, setTimeout(() => { _ssPending.delete(id); _ssPushCell(key, i); }, 350));
}
function _ssFlush() {
  for (const [id, t] of _ssPending) { clearTimeout(t); const [key, i] = id.split('|'); _ssPushCell(key, Number(i)); }
  _ssPending.clear();
}
function _ssPushCell(key, i) {
  if (!_ssLive || !_ss) return;
  const x = (_ss.v[key] || {})[_ss.names[i]];
  const path = _ssLivePath(`/v/${_ssRemoteKey(key)}/p${i}`);
  const off = x == null || x === '' || x === false;
  fbWrite(path, off ? 'DELETE' : 'PUT', off ? null : x, _ssLive.store).catch(() => {});
}
// After a tap that can change several cells (a one-player bonus, an outright win, a round gone).
function _ssPushDiff(before) {
  if (!_ssLive) return;
  const was = JSON.parse(before);
  const keys = new Set([...Object.keys(was), ...Object.keys(_ss.v)]);
  for (const k of keys) {
    _ss.names.forEach((n, i) => { if (((was[k] || {})[n]) !== ((_ss.v[k] || {})[n])) _ssPushCell(k, i); });
  }
}
function _ssPushReps(gi) {
  if (_ssLive) fbWrite(_ssLivePath(`/r/g${gi}`), 'PUT', _ss.reps[gi], _ssLive.store).catch(() => {});
}

// The stream: Firebase sends the sheet, then each change (put or patch at a path).
function _ssLiveListen() {
  const base = _ssLive.store === 'spare' ? _fbSpare(`sheets/${_ssLive.code}`) : `sheets/${_ssLive.code}`;
  const es = new EventSource(`${FIREBASE_DB}/${base}.json`);
  const live = _ssLive;
  const on = (kind) => (ev) => {
    let msg = null;
    try { msg = JSON.parse(ev.data); } catch (_) {}
    if (!msg || typeof msg.path !== 'string' || _ssLive !== live) return;
    if (kind === 'put') _ssSet(live, msg.path, msg.data);
    else for (const k in msg.data || {}) _ssSet(live, `${msg.path.replace(/\/$/, '')}/${k}`, msg.data[k]);
    _ssApplyRemote();
  };
  es.addEventListener('put', on('put'));
  es.addEventListener('patch', on('patch'));
  es.addEventListener('cancel', () => es.close());
  live.es = es;
}
function _ssSet(live, path, value) {
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) { live.data = value; return; }
  if (!live.data || typeof live.data !== 'object') live.data = {};
  let o = live.data;
  for (const p of parts.slice(0, -1)) { if (!o[p] || typeof o[p] !== 'object') o[p] = {}; o = o[p]; }
  if (value === null) delete o[parts[parts.length - 1]]; else o[parts[parts.length - 1]] = value;
}
// The sheet as Firebase has it, into this phone's; the field being typed in keeps what's typed.
function _ssApplyRemote() {
  const live = _ssLive, d = live && live.data;
  if (!live || !_ss) return;
  if (!d) {
    if (_ss.join) { live.ended = true; _ssDraw(true); }   // the phone logging the play is done
    return;
  }
  if (_ss.join) {
    _ss.names = (Array.isArray(d.n) ? d.n : Object.values(d.n || {})).map(String);
    _ss.x = (Array.isArray(d.x) ? d.x : Object.values(d.x || {})).map(Number);
    _ss.opt = !!d.o;
  }
  const typing = document.activeElement && document.activeElement.matches && document.activeElement.matches('#ss-overlay .ss-in') ? document.activeElement : null;
  const keep = typing ? { key: typing.dataset.ss, n: _ss.names[Number(typing.dataset.p)], v: (_ss.v[typing.dataset.ss] || {})[_ss.names[Number(typing.dataset.p)]] } : null;
  const v = {};
  for (const rk in d.v || {}) {
    const k = rk.replace(/_/g, '.');
    for (const pk in d.v[rk] || {}) {
      const n = _ss.names[Number(pk.slice(1))];
      if (n != null) (v[k] = v[k] || {})[n] = d.v[rk][pk];
    }
  }
  for (const id of _ssPending.keys()) {   // still to go up from here: this phone's is newer
    const [k, i] = id.split('|');
    const n = _ss.names[Number(i)];
    const mine = (_ss.v[k] || {})[n];
    if (mine == null) { if (v[k]) delete v[k][n]; } else (v[k] = v[k] || {})[n] = mine;
  }
  if (keep) { if (keep.v == null) { if (v[keep.key]) delete v[keep.key][keep.n]; } else (v[keep.key] = v[keep.key] || {})[keep.n] = keep.v; }
  _ss.v = v;
  const reps = {};
  for (const rk in d.r || {}) reps[Number(rk.slice(1))] = Number(d.r[rk]);
  _ss.reps = reps;
  if (!_ss.join && typeof _lp !== 'undefined' && _lp && _lp.ss === _ss) _lp.ss.v = v;
  _ssDraw(false);
}
// Redraw only what changed: values in place (never the field being typed in), the whole sheet when its shape did.
function _ssDraw(full) {
  const ov = document.getElementById('ss-overlay');
  if (!ov || !ov.classList.contains('open') || !_ss) return;
  if (full || _ss.drawn !== _ssShape()) {
    const wrap = ov.querySelector('.ss-wrap');
    const keep = wrap ? wrap.scrollTop : 0;
    _ssRender();
    const w = ov.querySelector('.ss-wrap');
    if (w) w.scrollTop = keep;
    if (_ssLive && _ssLive.host) _ssLiveQr();
    return;
  }
  ov.querySelectorAll('.ss-in').forEach(inp => {
    if (inp === document.activeElement) return;
    const x = (_ss.v[inp.dataset.ss] || {})[_ss.names[Number(inp.dataset.p)]];
    const want = x == null ? '' : String(x);
    if (inp.value !== want) inp.value = want;
  });
  ov.querySelectorAll('[data-ss-tick]').forEach(b => {
    const on = !!(_ss.v[b.dataset.ssTick] || {})[_ss.names[Number(b.dataset.p)]];
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
    b.innerHTML = on ? '&#10003;' : '';
  });
  _ssShowTotals();
}

// Opened from the link on another phone: that sheet, this phone's column first.
async function scoreSheetJoin(code) {
  if (!/^[a-z0-9]{4,20}$/.test(code || '')) return;
  let main = null, spare = null;
  try { ({ main, spare } = await fbReadBoth(`sheets/${code}`)); } catch (_) {}
  const d = main || spare;
  if (!d || !d.g) {
    if (typeof _acctToast === 'function') _acctToast('That score sheet is closed: its play has been logged.');
    return;
  }
  if (_ssLive) _ssLiveStop(false);
  const names = (Array.isArray(d.n) ? d.n : Object.values(d.n || {})).map(String);
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const meCanon = me && typeof _origCanon === 'function' ? _origCanon(me) : me;
  _ss = {
    key: d.k, sheet: d.k === 'rounds' ? SS_ROUNDS : _ssSheet(Number(d.k)), opt: !!d.o, reps: {}, v: {}, names,
    bggId: Number(d.g), x: [], join: true, host: d.h || '',
    me: names.findIndex(n => n === me || (typeof _origCanon === 'function' && _origCanon(n) === meCanon)),
  };
  _ss.pace = _ssPaceOf(_ss.bggId, names);
  _ssLive = { code, store: main ? 'main' : 'spare', host: false, data: d };
  _ssApplyRemote();
  _ssShow();
  _ssLiveListen();
  // straight to this phone's column
  setTimeout(() => {
    const th = document.querySelector('#ss-overlay .ss-p.me');
    if (th) th.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, 50);
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
// A saved sheet as points by category: { row: { player: points } }, rounds of
// the same row added up; outright wins, stats-only rows and numbered rounds
// (the rounds sheet) left out. For the game pages (js/play-extras.js).
function scoreSheetBreakdown(str, sc) {
  const s = scoreSheetUnpack(str, sc);
  if (!s) return null;
  const out = {};
  for (const key in s.v) {
    const [gi, , ri] = key.split('.').map(Number);
    const row = ((s.sheet.g[gi] || {}).rows || [])[ri];
    if (!row || row.t === 'win' || row.t === 'stat' || /\{round/.test(row.l)) continue;
    for (const n in s.v[key]) {
      const val = s.v[key][n];
      let x;
      if (row.t === 'check' || row.t === 'radio') {
        if (!val || typeof row.v !== 'number') continue;
        x = Math.abs(row.v);
      } else x = _ssNum(val);
      if (row.neg) x = -Math.abs(x);
      const c = out[row.l] || (out[row.l] = {});
      c[n] = Math.round(((c[n] || 0) + x) * 100) / 100;
    }
  }
  return Object.keys(out).length ? out : null;
}
// Whether a sheet has anything in it (for the button's wording).
function scoreSheetFilled() {
  return !!(_lp.ss && Object.values(_lp.ss.v).some(c => Object.keys(c).length));
}
