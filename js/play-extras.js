// ── More than the result: points by category and expansions, per play ──
// The user, 6 Nov 2026. A play's points by category come from its score
// sheet: a BG Stats export's (data/play-extras.js, tools/build-play-extras.py)
// or the app's own (plays/{id}.ss, js/score-sheet.js). Its expansions come from
// the export's expansionPlays or the app's plays/{id}.x. A game's page shows
// where the points come from and how it goes with each expansion; both are
// the viewer's own where they've played (everyone's otherwise).

// data/play-extras.js knows a play by its entry time (e): two plays of a day
// can share a play time, never an entry time.
const _pxIndex = new Map();   // bggId → the entry times as numbers, for near matches
function _pxFind(bggId, p) {
  const all = typeof PLAY_EXTRAS !== 'undefined' && PLAY_EXTRAS[bggId];
  const e = p && (p.e || p.t);
  if (!all || !e) return null;
  // the players have to fit: a play copied in BG Stats keeps its entry time
  const names = new Set((p.sc || []).map(s => s.n));
  const fits = (k) => {
    const ss = all[k].ss;
    return !ss || Object.values(ss).every(c => Object.keys(c).every(n => names.has((typeof NAME_MAP !== 'undefined' && NAME_MAP[n]) || n)));
  };
  if (all[e] && fits(e)) return all[e];
  // a copy can be a few seconds out: the nearest within ten minutes (one with
  // no sheet, within a minute) that isn't another play's own
  let idx = _pxIndex.get(bggId);
  if (!idx) { idx = Object.keys(all).map(k => ({ k, ms: Date.parse(k.replace(' ', 'T')) })); _pxIndex.set(bggId, idx); }
  const ms = Date.parse(String(e).replace(' ', 'T'));
  const theirs = new Set((PLAY_HISTORY[bggId] || []).filter(q => q !== p).map(q => q.e || q.t));
  const near = idx.filter(x => x.k !== e && !theirs.has(x.k) && Math.abs(x.ms - ms) <= (all[x.k].ss ? 600000 : 60000))
    .sort((a, b) => Math.abs(a.ms - ms) - Math.abs(b.ms - ms)).find(x => fits(x.k));
  return near ? all[near.k] : null;
}
// The expansions a play was played with (BGG ids). A play logged in the app,
// or uploaded since uploads keep these (det), says itself; any other is
// looked up in data/play-extras.js.
function playExpansionsOf(bggId, p) {
  if (p.mp || p.det) return (p.x || []).map(Number);
  const e = _pxFind(bggId, p);
  return (e && e.x) || [];
}
// A play's points by category: { category: { player: points } }, or null.
function playPointsOf(bggId, p) {
  if (p.mp) return p.ss && typeof scoreSheetBreakdown === 'function' ? scoreSheetBreakdown(p.ss, p.sc) : null;
  if (p.pts || p.det) return p.pts || null;
  const e = _pxFind(bggId, p);
  if (!e || !e.ss) return null;
  const out = {};
  for (const cat in e.ss) {
    out[cat] = {};
    for (const n in e.ss[cat]) out[cat][(typeof NAME_MAP !== 'undefined' && NAME_MAP[n]) || n] = e.ss[cat][n];
  }
  return out;
}
// The expansions known for a game: [[id, name], ...] (owned by anyone here,
// played with, or on its score sheet).
function expansionsOf(bggId) {
  return (typeof EXPANSIONS_OF !== 'undefined' && EXPANSIONS_OF[bggId]) || [];
}

// ── From a BG Stats file being uploaded (js/boot.js) ──
// The play's expansions and its points by category, taken as
// tools/build-play-extras.py takes them, so an upload in the app brings them
// too. nameOf(playerScore, i): the name the play is saved with. Firebase keys
// can't hold every category or name ("1/2 per Grain"), so the points go up as
// a list: pts = [{ c: category, n: [names], v: [points] }].
const PX_ROUNDS = /\{(row|round|roundLabel)\}|^Round \d+$/;
// a number as typed: "41", "2,5", or a sum like "14+10" (js/records.js reads scores so)
const _pxNumOf = (v) => {
  const t = String(v == null ? '' : v).replace(',', '.');
  if (typeof _recScore === 'function') return _recScore(t);
  const x = parseFloat(t);
  return isFinite(x) ? x : null;
};
function bgsPlayExtras(play, gamesById, nameOf) {
  const out = { det: 1 };
  const xs = (play.expansionPlays || []).map(x => Number((gamesById[x.gameRefId] || {}).bggId)).filter(x => x > 0);
  if (xs.length) out.x = [...new Set(xs)].sort((a, b) => a - b);
  let ss = null;
  try { ss = play.scoresheet ? JSON.parse(play.scoresheet) : null; } catch (_) { ss = null; }
  if (!ss) return out;
  const byUuid = {};
  (play.playerScores || []).forEach((ps, i) => {
    let meta = {};
    try { meta = JSON.parse(ps.metaData || '{}'); } catch (_) { /* no sheet link */ }
    if (meta.scoreUuid) byUuid[meta.scoreUuid] = nameOf(ps, i);
  });
  const pts = new Map();
  for (const g of ss.groups || ss.rounds || []) {
    for (const r of g.rows || []) {
      const label = String(r.label || '').trim(), t = r.type;
      if (!label || PX_ROUNDS.test(label) || t === 'radioOverall' || t === 'ignoredForTotal') continue;
      for (const uuid in r.scores || {}) {
        const name = byUuid[uuid], v = r.scores[uuid];
        if (!name || v === '' || v == null || v === false || String(v).toLowerCase() === 'false') continue;
        let x = _pxNumOf(t === 'checkbox' || t === 'radio' ? r.value : v);
        if (x === null) continue;
        if (r.negative) x = -Math.abs(x);
        const c = pts.get(label) || new Map();
        c.set(name, Math.round(((c.get(name) || 0) + x) * 100) / 100);
        pts.set(label, c);
      }
    }
  }
  if (pts.size) out.pts = [...pts].map(([c, m]) => ({ c, n: [...m.keys()], v: [...m.values()] }));
  return out;
}

const _pxMe = (n, me, meCanon) => n === me || (typeof _origCanon === 'function' && _origCanon(n) === meCanon);
const _pxNum = (x) => (Math.round(x * 10) / 10).toLocaleString('en');

// ── Where the points come from ──
function buildPointsHtml(game, plays) {
  if (!plays || plays.length < 2) return '';
  const id = game.bggId;
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  const meCanon = me && typeof _origCanon === 'function' ? _origCanon(me) : me;
  const cats = new Map();   // category → { all: [], mine: [], best: {v, n, date} }
  let n = 0, mineN = 0;
  for (const p of plays) {
    const pts = playPointsOf(id, p);
    if (!pts) continue;
    n++;
    let mineHere = false;
    for (const cat in pts) {
      const c = cats.get(cat) || { all: [], mine: [], best: null };
      for (const who in pts[cat]) {
        const v = Number(pts[cat][who]);
        if (!isFinite(v)) continue;
        c.all.push(v);
        if (me && _pxMe(who, me, meCanon)) { c.mine.push(v); mineHere = true; }
        if (!c.best || Math.abs(v) > Math.abs(c.best.v)) c.best = { v, n: who, date: p.date };
      }
      cats.set(cat, c);
    }
    if (mineHere) mineN++;
  }
  if (n < 2 || !cats.size) return '';
  const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const yours = mineN >= 2;
  const rows = [...cats.entries()].filter(([, c]) => c.all.length)
    .map(([cat, c]) => ({ cat, all: avg(c.all), mine: c.mine.length ? avg(c.mine) : null, best: c.best }))
    .sort((a, b) => Math.abs(yours ? b.mine || 0 : b.all) - Math.abs(yours ? a.mine || 0 : a.all));
  const top = Math.max(...rows.map(r => Math.abs(yours && r.mine != null ? r.mine : r.all)), 1);
  const esc = _escapeHtml;
  const SHOW = 12;
  return `
        <div class="gi-block">
          <div class="gr-title">Where the points come from</div>
          <div class="gi-sub">From the score sheets of ${n} play${n !== 1 ? 's' : ''}${yours ? `, ${mineN} of them yours: your average in each, then everyone&rsquo;s` : ': the average in each'}.</div>
          ${rows.slice(0, SHOW).map(r => {
            const v = yours && r.mine != null ? r.mine : r.all;
            const tip = `${r.cat}: ${yours && r.mine != null ? `you ${_pxNum(r.mine)}, ` : ''}everyone ${_pxNum(r.all)}${r.best ? ` · most in one play: ${_pxNum(r.best.v)} (${r.best.n})` : ''}`;
            return `
          <div class="pt-p sp-row${v < 0 ? ' neg' : ''}" title="${esc(tip)}">
            <span class="pt-p-name">${esc(r.cat)}</span>
            <span class="pt-p-bar"><i style="width:${Math.max(3, Math.round((Math.abs(v) / top) * 100))}%"></i></span>
            <span class="pt-p-val">${_pxNum(v)}${yours ? `<small> &middot; ${r.mine != null ? 'all ' : ''}${_pxNum(r.all)}</small>` : ''}</span>
          </div>`;
          }).join('')}
          ${rows.length > SHOW ? `<div class="pt-game-more">+${rows.length - SHOW} more</div>` : ''}
        </div>`;
}

// ── With each expansion ──
function buildExpansionsHtml(game, plays) {
  if (!plays || plays.length < 2) return '';
  const id = game.bggId;
  const named = new Map(expansionsOf(id).map(([x, name]) => [Number(x), name]));
  const mineOnly = typeof progressPlaysOf === 'function' ? progressPlaysOf(plays) : { plays, mine: false };
  const use = mineOnly.plays;
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  const meCanon = me && typeof _origCanon === 'function' ? _origCanon(me) : me;
  const coop = typeof _recIsCoop === 'function' && _recIsCoop(game, plays);
  const by = new Map();   // expansion id (0: none) → { plays, wins, decided }
  let any = 0;
  for (const p of use) {
    const xs = playExpansionsOf(id, p);
    if (xs.length) any++;
    const seat = mineOnly.mine ? p.sc.find(s => _pxMe(s.n, me, meCanon)) : null;
    const decided = typeof isNoResultPlay === 'function' ? !isNoResultPlay(p) : true;
    const won = seat ? !!seat.w : coop ? p.sc.some(s => s.w) : false;
    for (const x of (xs.length ? xs : [0])) {
      const r = by.get(x) || { plays: 0, wins: 0, decided: 0 };
      r.plays++;
      if (decided && (seat || coop)) { r.decided++; if (won) r.wins++; }
      by.set(x, r);
    }
  }
  if (!any) return '';
  const esc = _escapeHtml;
  const rows = [...by.entries()].sort((a, b) => (a[0] === 0) - (b[0] === 0) || b[1].plays - a[1].plays);
  const top = Math.max(...rows.map(([, r]) => r.plays));
  const nameOf = (x) => x === 0 ? 'Base game only' : named.get(x) || ((typeof findGameByBggId === 'function' && findGameByBggId(x)) || {}).name || `Expansion #${x}`;
  const short = (s) => typeof _gnShort === 'function' ? _gnShort(s, game.name) : s;
  return `
        <div class="gi-block">
          <div class="gr-title">With expansions</div>
          <div class="gi-sub">${mineOnly.mine ? 'Your' : 'Everyone&rsquo;s'} ${use.length} play${use.length !== 1 ? 's' : ''}, ${any} with expansions${rows.some(([, r]) => r.decided) ? `, and how often ${mineOnly.mine ? 'you' : coop ? 'the table' : 'they'} won` : ''}.</div>
          ${rows.map(([x, r]) => `
          <div class="pt-p${x ? '' : ' xp-base'}">
            <span class="pt-p-name">${esc(x ? short(nameOf(x)) : nameOf(x))}</span>
            <span class="pt-p-bar"><i style="width:${Math.max(3, Math.round((r.plays / top) * 100))}%"></i></span>
            <span class="pt-p-val">${r.plays}${r.decided ? `<small> &middot; ${Math.round((r.wins / r.decided) * 100)}% won</small>` : ''}</span>
          </div>`).join('')}
        </div>`;
}
