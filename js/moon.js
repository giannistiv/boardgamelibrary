// ── Welcome to the Moon (339789): adventure by adventure ──
// The user, 18 Nov 2026: "do something for Welcome to the Moon. Dig deep".
// The game is eight Adventures, each on its own sheet with its own scoring,
// so a score only means something next to the same Adventure's. On the Plays
// tab, under the trip from the Earth to the Moon (progress-boards.js), each
// Adventure gets its row: the viewer's games, wins and best, and the record;
// tapped, their games, the best scores ever and where the points come from.
// Then the campaign runs: Adventures played in order by the same people, who
// won each (the winner becomes Captain) and which one is next.
// Older plays from BG Stats often don't say the Adventure, but their score
// sheets do: rows only one Adventure's sheet has ("Space station 2", "Ruby
// factory") tell which, and such plays are marked so when the page loads.
// The rules (a fold-out per Adventure) are in data/rules.js, and Log a play
// takes each Adventure's own score sheet (SCORESHEET_VARS).

const MOON_BGGID = 339789;
const MOON_ADV = [
  ['The Launch', '&#128640;'], ['The Journey', '&#128752;&#65039;'], ['The Colony', '&#127960;&#65039;'], ['The Mine', '&#9935;&#65039;'],
  ['The Dome', '&#127961;&#65039;'], ['The Virus', '&#129440;'], ['The Escape', '&#127744;'], ['The Battle', '&#129680;'],
];
let _moonCtx = null;   // the board on screen: { game, mine, all }
let _moonOpen = 0;     // the Adventure folded out

const _moonCanon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
const _moonScore = (s) => (s && typeof _recScore === 'function' ? _recScore(s.s) : null);
const _moonTime = (p) => `${p.date} ${p.e || p.t || ''}`;
const _moonDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const _moonNum = (x) => (Math.round(x * 10) / 10).toLocaleString('en');

// The rows only one Adventure's score sheet has, by Adventure.
let _moonRows = null;
function _moonDistinctRows() {
  if (_moonRows) return _moonRows;
  const vars = (typeof SCORESHEET_VARS !== 'undefined' && SCORESHEET_VARS[MOON_BGGID]) || {};
  const labels = {};
  for (const vid in vars) {
    const n = Number((vid.match(/(\d+)$/) || [])[1]);
    if (n) labels[n] = new Set(vars[vid].g.flatMap(g => g.rows.map(r => r.l)));
  }
  _moonRows = {};
  for (const n in labels) {
    _moonRows[n] = new Set([...labels[n]].filter(l => !Object.keys(labels).some(m => m !== n && labels[m].has(l))));
  }
  return _moonRows;
}

// Which Adventure a play was: the one it names, its sheet's, or the one its
// score sheet's rows give away. 0 when there's no telling.
function moonAdventureOf(p) {
  if (!p) return 0;
  const m = String(p.b || '').match(/adventure\s*#?\s*0*([1-8])\b/i);
  if (m) return Number(m[1]);
  if (p.ss) {
    try { const k = String(JSON.parse(p.ss).k || '').match(/adventure(\d)$/); if (k) return Number(k[1]); } catch (_) {}
  }
  const pts = typeof playPointsOf === 'function' ? playPointsOf(MOON_BGGID, p) : null;
  if (!pts) return 0;
  const cats = Array.isArray(pts) ? pts.map(x => x && x.c) : Object.keys(pts);
  const rows = _moonDistinctRows();
  let best = 0, hits = 0;
  for (const n in rows) {
    const h = cats.filter(c => rows[n].has(c)).length;
    if (h > hits) { best = Number(n); hits = h; }
  }
  return best;
}
// Plays that don't name their Adventure get it from their score sheet, so the
// trip, the play list and Log a play's next Adventure all count them.
function moonNoteAdventures() {
  for (const p of (typeof PLAY_HISTORY !== 'undefined' && PLAY_HISTORY[MOON_BGGID]) || []) {
    if (!p || p._moon || /adventure/i.test(p.b || '')) continue;
    p._moon = 1;
    const n = moonAdventureOf(p);
    if (n) { p.b = [`Adventure ${n}`, p.b].filter(Boolean).join('／'); p.bFrom = 'sheet'; }
  }
}
moonNoteAdventures();

// The Adventure to log next for someone: the one after their last (a run of
// the campaign goes on), #1 after #8 or before any.
function moonNextAdventure(me) {
  moonNoteAdventures();
  const last = ((typeof PLAY_HISTORY !== 'undefined' && PLAY_HISTORY[MOON_BGGID]) || [])
    .filter(p => _moonSeat(p, me) >= 0 && moonAdventureOf(p))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.e || b.t || '').localeCompare(a.e || a.t || '') || moonAdventureOf(b) - moonAdventureOf(a))[0];
  const n = last ? moonAdventureOf(last) : 0;
  return n && n < 8 ? n + 1 : 1;
}

// Places at the table: the winners first (Adventure #1: whoever launched),
// then by score; the same score shares a place.
function _moonPlaces(p) {
  const seats = (p.sc || []).map((s, i) => ({ i, w: !!s.w, v: _moonScore(s) }));
  seats.sort((a, b) => (b.w - a.w) || ((b.v == null ? -Infinity : b.v) - (a.v == null ? -Infinity : a.v)));
  const place = [];
  seats.forEach((x, k) => {
    const prev = seats[k - 1];
    place[x.i] = prev && prev.w === x.w && prev.v === x.v ? place[prev.i] : k + 1;
  });
  return place;
}
const _moonSeat = (p, me) => (p.sc || []).findIndex(s => s && me && (s.n === me || _moonCanon(s.n) === _moonCanon(me)));

// ── The board ──
function buildMoonHtml(game, mine, all) {
  if (!game || Number(game.bggId) !== MOON_BGGID || !(all || []).length) return '';
  moonNoteAdventures();
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  _moonCtx = { game, mine: mine || [], all: all || [] };
  const esc = _escapeHtml;
  const rows = MOON_ADV.map(([name, icon], k) => {
    const n = k + 1;
    const ours = _moonCtx.mine.filter(p => moonAdventureOf(p) === n);
    const every = _moonCtx.all.filter(p => moonAdventureOf(p) === n);
    let wins = 0, best = null;
    for (const p of ours) {
      const i = _moonSeat(p, me);
      if (i < 0) continue;
      if (p.sc[i].w) wins++;
      const v = _moonScore(p.sc[i]);
      if (v != null && (best == null || v > best)) best = v;
    }
    let rec = null;
    for (const p of every) for (const s of p.sc || []) {
      const v = _moonScore(s);
      if (v != null && (!rec || v > rec.v)) rec = { v, n: s.n };
    }
    const you = ours.length
      ? `${ours.length} game${ours.length > 1 ? 's' : ''}${wins ? ` &middot; <b class="moon-won">${wins} won</b>` : ''}${best != null ? ` &middot; best ${_moonNum(best)}` : ''}`
      : every.length ? 'Not played yet' : 'Nobody here has played it yet';
    const cls = ours.length ? (wins ? ' won' : ' played') : '';
    return `<button type="button" class="moon-row${cls}${_moonOpen === n ? ' open' : ''}" data-moon-adv="${n}" aria-expanded="${_moonOpen === n}"${every.length ? '' : ' disabled'}>
        <span class="moon-ic" aria-hidden="true">${icon}</span>
        <span class="moon-main"><b><small>#${n}</small> ${esc(name)}</b><span>${you}</span></span>
        ${rec ? `<span class="moon-rec" title="The best score in this Adventure"><b>${_moonNum(rec.v)}</b><span>${esc(String(rec.n).split(/[\s-]/)[0])}</span></span>` : ''}
      </button>
      <div class="moon-detail" data-moon-detail="${n}"${_moonOpen === n ? '' : ' hidden'}>${_moonOpen === n ? _moonDetailHtml(n) : ''}</div>`;
  }).join('');
  const untold = _moonCtx.mine.filter(p => !moonAdventureOf(p)).length;
  const runs = _moonRuns(_moonCtx.mine);
  return `<div class="moon" data-moon>
      <div class="st-head"><span class="st-title">&#127775; Adventure by adventure</span><span class="st-count">best ever</span></div>
      <div class="moon-rows">${rows}</div>
      ${untold ? `<div class="moon-note">${untold} of ${me && _moonCtx.mine.length ? 'your' : 'these'} games don&rsquo;t say which Adventure, and their score sheets don&rsquo;t tell.</div>` : ''}
      ${runs.length ? `<div class="moon-sec">Campaign runs <span>Adventures in order, the same people</span></div>${runs.map(_moonRunHtml).join('')}` : ''}
    </div>`;
}

// One Adventure folded out: your games, the best scores, the points.
function _moonDetailHtml(n) {
  const C = _moonCtx;
  if (!C) return '';
  const esc = _escapeHtml;
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  const every = C.all.filter(p => moonAdventureOf(p) === n);
  const ours = C.mine.filter(p => moonAdventureOf(p) === n).slice().sort((a, b) => _moonTime(b).localeCompare(_moonTime(a)));
  const games = ours.map(p => {
    const i = _moonSeat(p, me), place = _moonPlaces(p);
    const v = i >= 0 ? _moonScore(p.sc[i]) : null;
    const others = p.sc.filter((s, j) => j !== i).map(s => esc(String(s.n).split(/[\s-]/)[0]));
    const pl = i >= 0 ? place[i] : 0;
    return `<div class="moon-game">
        <span class="moon-gdate">${_moonDate(p.date)}</span>
        <span class="moon-place p${Math.min(pl, 4)}">${pl === 1 ? '&#9733; 1st' : pl ? `${pl}${pl === 2 ? 'nd' : pl === 3 ? 'rd' : 'th'}` : ''}<small>of ${p.sc.length}</small></span>
        <span class="moon-gwho">${v != null ? `<b>${_moonNum(v)}</b> ` : ''}${others.length ? `with ${others.join(', ')}` : 'solo'}</span>
      </div>`;
  }).join('');
  const tops = [];
  for (const p of every) for (const s of p.sc || []) {
    const v = _moonScore(s);
    if (v != null) tops.push({ v, n: s.n, date: p.date, w: !!s.w });
  }
  tops.sort((a, b) => b.v - a.v || a.date.localeCompare(b.date));
  const best = tops.slice(0, 5).map((t, k) => `<div class="moon-top"><span class="moon-rank">${k + 1}</span><b>${_moonNum(t.v)}</b><span>${esc(t.n)}${t.w ? ' &#9733;' : ''}</span><small>${_moonDate(t.date)}</small></div>`).join('');
  const points = typeof buildPointsHtml === 'function' ? buildPointsHtml(C.game, every, { scenario: true, min: 1 }) : '';
  const [name] = MOON_ADV[n - 1];
  return `${ours.length ? `<div class="moon-sub">Your games of ${esc(name)}</div>${games}` : `<div class="moon-sub">You haven&rsquo;t played ${esc(name)} yet</div>`}
      ${best ? `<div class="moon-sub">Best scores${n === 1 ? ' <span>(a launched rocket is 150)</span>' : ''}</div>${best}` : ''}
      ${points}
      <button type="button" class="moon-rules" data-moon-rules>Its rules &rsaquo;</button>`;
}

// ── Campaign runs: Adventures in order (#1, #2, #3…) by the same people ──
// The next one within a month, with most of the same table, carries a run on.
function _moonRuns(plays) {
  const steps = plays.map(p => ({ p, n: moonAdventureOf(p), who: new Set((p.sc || []).map(s => _moonCanon(s.n))) }))
    .filter(x => x.n)
    .sort((a, b) => a.p.date.localeCompare(b.p.date) || (a.p.e || a.p.t || '').localeCompare(b.p.e || b.p.t || '') || a.n - b.n);
  const runs = [];
  let cur = null;
  for (const x of steps) {
    const last = cur && cur.steps[cur.steps.length - 1];
    const days = last ? (Date.parse(x.p.date) - Date.parse(last.p.date)) / 864e5 : 99;
    const shared = last ? [...x.who].filter(n => last.who.has(n)).length : 0;
    if (last && x.n === last.n + 1 && days <= 31 && shared >= Math.min(2, x.who.size, last.who.size)) cur.steps.push(x);
    else { cur = { steps: [x] }; runs.push(cur); }
  }
  return runs.filter(r => r.steps.length >= 2).reverse();
}
function _moonRunHtml(run) {
  const esc = _escapeHtml;
  const S = run.steps, first = S[0], last = S[S.length - 1];
  const short = (n) => esc(String(n).split(/[\s-]/)[0]);
  // the Captain: each Adventure's winner, a shared win keeps the one before
  let captain = null;
  const wins = new Map();
  const won = S.map(x => {
    const ws = x.p.sc.filter(s => s.w).map(s => s.n);
    ws.forEach(n => wins.set(n, (wins.get(n) || 0) + 1));
    if (ws.length === 1) captain = ws[0];
    return ws;
  });
  const people = [...new Map(S.flatMap(x => x.p.sc.map(s => [_moonCanon(s.n), s.n]))).values()];
  const byN = new Map(S.map((x, k) => [x.n, k]));
  // a winner on a chip: their photo, or the first letters (Μαντσος and Μαρια both start with Μ)
  const face = (n) => {
    const ph = typeof playerPhoto === 'function' ? playerPhoto(n) : null;
    return ph ? `<img class="moon-face" src="${esc(ph)}" alt="${esc(n)}">` : esc(String(n).slice(0, 3));
  };
  const chips = MOON_ADV.map(([name], k) => {
    const n = k + 1, at = byN.get(n);
    if (at != null) return `<span class="moon-step done" title="#${n} ${esc(name)} · ${_moonDate(S[at].p.date)}${won[at].length ? ` · won by ${won[at].map(esc).join(', ')}` : ''}"><b>${n}</b><span>${won[at].length ? won[at].slice(0, 2).map(face).join('') : '&ndash;'}</span></span>`;
    return `<span class="moon-step${n === last.n + 1 ? ' next' : ''}" title="#${n} ${esc(name)}"><b>${n}</b><span>${n === last.n + 1 ? 'next' : ''}</span></span>`;
  }).join('');
  const days = first.p.date === last.p.date ? _moonDate(first.p.date) : `${_moonDate(first.p.date)} &ndash; ${_moonDate(last.p.date)}`;
  const tally = [...wins.entries()].sort((a, b) => b[1] - a[1]).map(([n, k]) => `${short(n)} ${k}`).join(' &middot; ');
  const nextN = last.n < 8 ? last.n + 1 : 0;
  return `<div class="moon-run">
      <div class="moon-run-top"><b>${esc(last.p.l || first.p.l || 'Campaign')}</b><span>${days}</span></div>
      <div class="moon-run-who">${people.map(short).join(', ')}</div>
      <div class="moon-steps">${chips}</div>
      <div class="moon-run-foot">${captain ? `<span>&#127894;&#65039; Captain <b>${short(captain)}</b></span>` : ''}${tally ? `<span>Wins: ${tally}</span>` : ''}<span>${nextN ? `Next: <b>#${nextN} ${esc(MOON_ADV[nextN - 1][0])}</b>` : '<b>All 8 played</b>'}</span></div>
    </div>`;
}

function wireMoon(root) {
  const box = root && root.querySelector('[data-moon]');
  if (!box || box.dataset.wired) return;
  box.dataset.wired = '1';
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-moon-rules]')) {   // the Rules tab, this Adventure folded out
      const tab = root.querySelector('.gm-tab[data-tab="rules"]');
      if (!tab) return;
      const n = _moonOpen;
      tab.click();
      let tries = 0;
      const open = () => {
        const d = [...root.querySelectorAll('.rules-exp')].find(x => (x.querySelector('summary') || {}).textContent === `#${n} ${MOON_ADV[n - 1][0]}`);
        if (d) { d.open = true; d.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
        else if (++tries < 30) setTimeout(open, 100);
      };
      if (n) open();
      return;
    }
    const row = e.target.closest('[data-moon-adv]');
    if (!row || row.disabled) return;
    const n = Number(row.dataset.moonAdv);
    _moonOpen = _moonOpen === n ? 0 : n;
    box.querySelectorAll('[data-moon-adv]').forEach(r => {
      const on = Number(r.dataset.moonAdv) === _moonOpen;
      r.classList.toggle('open', on);
      r.setAttribute('aria-expanded', String(on));
    });
    box.querySelectorAll('[data-moon-detail]').forEach(d => {
      const on = Number(d.dataset.moonDetail) === _moonOpen;
      d.hidden = !on;
      d.innerHTML = on ? _moonDetailHtml(_moonOpen) : '';
    });
  });
}
