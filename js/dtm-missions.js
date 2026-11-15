// ── Marvel Dice Throne Missions (the Campaign tab on its game page) ──
// The user, 15 Nov 2026: a tracker for the Missions, villain and difficulty,
// and a character sheet per player. From the game's own rulebook and Perk
// Sheet (dicethrone.com, both free downloads):
//   - 20 double-sided Missions, each of a level from 1 (Intro) to 5
//     (Ruthless). Side 1 is usually a Mission Run against the villain's
//     Henchmen, side 2 the Boss Fight. A Mission can be played harder: +N
//     makes its Total Difficulty its level + N.
//   - Perk Points after each Mission: 0 if no side was cleared, 1 for side 1
//     only, 2 for both sides, 3 for both plus side 1's Perfect Reward (the
//     extra point only the first time a player Perfects that Mission). The
//     approachable rules double them. A PP fills a circle in a column up to
//     the Mission's (Total) Difficulty.
//   - The Perk Sheet, one per player whatever hero they play: five perks
//     (Momentum, Grit, Leadership, Heroism, Feats) in five difficulty
//     columns, each unlocked once its circles are full; Momentum cards in
//     order. New Game+: a circle per level, filled the first time a Mission of
//     that level is Perfected and won; all five unlock a Mythic Ability, and
//     a new sheet may then be started with a "+" by the name. The back of the
//     sheet marks each Mission played, complete and Perfect.
// The villains are the ones confirmed by players' reports; three aren't
// public, so the tab asks for them the first time and remembers them.
//
// A Mission is a play logged here (or in Log a play: "Mission／Villain"), or
// one logged under a Marvel Dice Throne hero box (BG Stats offers those) whose
// scenario names a Mission or its villain and whose players all shared the
// result: the user's first ones were logged under the X-Men box. Its
// scores and heroes are the play's; what the play can't hold is kept in
// Firebase, followed live while the tab is open:
//   dtm/plays/{playKey} = { m: mission key, up: levels added, s1, s2, perfect, x2 }
//   dtm/sheets/{player key} = { name, fills: { 'grit-3': 2, … }, plus, since: 'YYYY-MM-DD HH:MM:SS' }
//   dtm/bosses/{mission key} = the villain, for the three not known here
// A play with no record counts as both sides won or none (its result).

const DTM_BGGID = 403495;
const DTM_NODE = 'dtm';
const DTM_LEVELS = [null, ['Intro', '#4fc3c9'], ['Moderate', '#7cc243'], ['Hard', '#e2cc3a'], ['Brutal', '#efa43a'], ['Ruthless', '#ec6f3c'], ['Insane', '#c0392b']];
// [key, name, level, villain (side 2), side 1's foe when it's a boss too]
const DTM_MISSIONS = [
  ['ock', 'Ock Knocks Knox', 1, 'Doctor Octopus', '', 'the tutorial'],
  ['morlock', 'Morlock Massacre', 1, 'Mister Sinister'],
  ['sauron', 'Sauron’s Hunger', 2, 'Sauron', 'a Stegosaurus'],
  ['nuclear', 'Nuclear Assault', 2, 'Sebastian Shaw'],
  ['maggia', 'The Maggia', 2, 'Kingpin'],
  ['vibranium', 'Vibranium Wars', 2, 'Klaw'],
  ['un', 'U.N. Catastrophe', 2, 'Mystique'],
  ['executive', 'Executive Crisis', 3, 'Mysterio'],
  ['sentinels', 'Savage Sentinels', 3, 'Master Mold'],
  ['goblin', 'Goblin Surprise', 3, 'Green Goblin'],
  ['asteroid', 'Asteroid Attack', 3, 'Magneto'],
  ['shield', 'S.H.I.E.L.D. Compromised', 3, ''],
  ['avengers', 'Revenge on Avengers', 4, 'Ultron'],
  ['cosmic', 'Cosmic Clash', 4, 'M.O.D.O.K.'],
  ['hel', 'From Hel', 4, 'Hela'],
  ['onslaught', 'Onslaught’s Citadel', 4, 'Onslaught'],
  ['mindstone', 'The Mind Stone', 5, 'Thanos', 'Ebony Maw'],
  ['demon', 'Demon Disaster', 5, ''],
  ['darkness', 'Darkness Falls', 5, 'Dormammu', 'Baron Mordo'],
  ['hulk', 'Hulk’s Legacy', 5, ''],
].map(([k, name, lvl, boss, foe1, note]) => ({ k, name, lvl, boss, foe1: foe1 || '', note: note || '' }));
// other names the plays give a villain
const DTM_AKA = { ock: ['Doc Ock', 'Dr. Octopus', 'Dr Octopus', 'Otto Octavius'], morlock: ['Mr. Sinister', 'Mr Sinister'], vibranium: ['Ulysses Klaue', 'Klaue'],
  maggia: ['Wilson Fisk'], cosmic: ['MODOK'], sentinels: ['Master-Mold'], goblin: ['Norman Osborn'] };
// Missions, and the Marvel Dice Throne boxes its games can be logged under
const DTM_FAMILY = [403495, 348406, 360153, 360152, 403511, 360061, 403494];
const DTM_HEALTH = { 1: 45, 2: 30, 3: 25, 4: 20 };   // starting Health by the number of heroes
// the Marvel heroes (the boxes here); any other Dice Throne hero can be typed
const DTM_HEROES = ['Black Panther', 'Black Widow', 'Captain Marvel', 'Cyclops', 'Deadpool', 'Doctor Strange', 'Gambit', 'Iceman',
  'Jean Grey', 'Loki', 'Psylocke', 'Rogue', 'Scarlet Witch', 'Spider-Man', 'Storm', 'Thor', 'Wolverine'];
// the Perk Sheet: a row per perk, a cell per difficulty column: [circles, short, in full]
const DTM_PERKS = [
  { row: 'momentum', name: 'Momentum', cells: [
    [0, 'Level 1 card', 'Start each game with the Level 1 Momentum Card (free).'],
    [3, 'Level 2 card', 'Replace your Level 1 Momentum Card with Level 2.'],
    [3, 'Level 3 card', 'Replace your Level 2 Momentum Card with Level 3.'],
    [4, 'Level 4 card', 'Replace your Level 3 Momentum Card with Level 4.'],
    [4, 'Level 5 card', 'Replace your Level 4 Momentum Card with Level 5.']] },
  { row: 'grit', name: 'Grit', cells: [
    [1, '+1 Health', 'Your starting Health goes up by 1.'],
    [2, '+2 Health', 'Your starting Health goes up by 2.'],
    [3, '+3 Health', 'Your starting Health goes up by 3.'],
    [3, '+4 Health', 'Your starting Health goes up by 4.'],
    [3, '2 Flight', 'At game start, a hero you choose gains 2 Flight.']] },
  { row: 'leader', name: 'Leadership', cells: [
    [3, 'Focus Fire', 'At game start, an enemy you choose gets Focus Fire.'],
    [3, '+3 Damage', 'At game start, a hero you choose gains a +3 Damage Bonus.'],
    [3, 'Sell & draw', 'At game start, you may sell a card, then draw one to replace it.'],
    [4, 'Free Ally', 'At game start, recruit an Ally for free.'],
    [4, '2 Shield', 'At game start, a hero you choose gains 2 Shield.']] },
  { row: 'heroism', name: 'Heroism', cells: [
    [2, '+1 Momen\u00adtum', 'At game start, gain 1 Momentum.'],
    [2, '+1 CP', 'At game start, gain 1 CP.'],
    [2, '+2 Momen\u00adtum', 'At game start, gain 2 Momentum.'],
    [3, '+1 card', 'At game start, draw 1 card.'],
    [3, '+1 CP, +1 card', 'At game start, gain 1 CP and draw 1 card.']] },
  { row: 'feats', name: 'Feats', cells: [
    [3, 'Re-roll an enemy die', 'Once a game: re-roll an enemy die.'],
    [3, '+1 die of damage', 'Once a game: roll 1 die and add it to your Attack’s damage.'],
    [4, 'Undefend\u00adable', 'Once a game: your Attack becomes undefendable.'],
    [4, 'Crisis Clock −1', 'Once a game: the Crisis Clock moves one space less.'],
    [4, 'Exhaust, keep the Ally', 'Once a game: use an Ally’s Exhaust power without discarding them (not the same one twice in a turn).']] },
];
const DTM_RESULTS = [   // [key, label, s1, s2, perfect]
  ['lost', 'Lost on side 1', false, false, false],
  ['s1', 'Side 1 cleared, lost side 2', true, false, false],
  ['won', 'Won both sides', true, true, false],
  ['perfect', 'Won, with side 1 Perfect', true, true, true],
];

let _dtm = null;          // dtm from Firebase
let _dtmSrc = undefined;  // the store it lives in ('main' | 'spare', see fbWrite)
let _dtmTab = 'missions'; // 'missions' | 'sheets'
let _dtmWho = null;       // whose marks and sheet are shown
let _dtmOpen = null;      // the Mission open on the board
let _dtmCell = null;      // the perk whose full text shows ('grit-3')
let _dtmPaper = false;    // copying a paper sheet: no PP limits
let _dtmLog = null;       // a Mission being logged: { m, up, x2, party: [{n, hero}], res, boss, date, l }
let _dtmPanel = null;
let _dtmLate = false;
let _dtmES = null, _dtmWatch = null;
let _dtmTimers = {};

const _dtmCanon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
const _dtmKey = (n) => (typeof _acctKey === 'function' ? _acctKey(_dtmCanon(n)) : String(_dtmCanon(n)).replace(/[.#$\[\]\/]/g, '_'));
const _dtmMe = () => (typeof _navPlayer === 'function' ? _navPlayer() : null);
const _dtmNorm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const _dtmNow = () => { const d = new Date(), p = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
const _dtmToday = () => _dtmNow().slice(0, 10);
const _dtmMission = (k) => DTM_MISSIONS.find(m => m.k === k) || null;
const _dtmBoss = (m) => (m && (m.boss || ((_dtm && _dtm.bosses) || {})[m.k])) || '';
const _dtmLvl = (n) => DTM_LEVELS[Math.max(1, Math.min(6, n))];
function _dtmDate(v) {
  if (!v) return '';
  return new Date(String(v).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function _dtmDie(lvl, small) {
  const L = _dtmLvl(lvl);
  return `<span class="dt-die${small ? ' sm' : ''}" style="--dt-c:${L[1]}" title="Level ${lvl}: ${L[0]}">${lvl}</span>`;
}

// ── The plays: Missions logged ──
function _dtmPlayKey(p) { return String(p.mp || p._uuid || p.e || p.t || p.date).replace(/[.#$\[\]\/ ]/g, '_'); }
const _dtmFrom = new WeakMap();   // a play → the game it's logged under
function _dtmPlays() {
  const out = [];
  for (const id of DTM_FAMILY) for (const p of PLAY_HISTORY[id] || []) {
    if (!p || !p.date || !Array.isArray(p.sc) || !p.sc.length) continue;
    if (id !== DTM_BGGID && !_dtmIsMission(p)) continue;
    _dtmFrom.set(p, id);
    out.push(p);
  }
  return out.sort(byPlayOrder);
}
// A hero box's play that was a Mission: one marked so here, or one naming a
// Mission or its villain where everyone shared the result (co-op, not a duel).
function _dtmIsMission(p) {
  const r = ((_dtm && _dtm.plays) || {})[_dtmPlayKey(p)];
  if (r && r.m) return true;
  const ws = p.sc.map(s => !!(s && s.w));
  return !!_dtmMatchB(p.b) && ws.every(w => w === ws[0]);
}
// The Mission a scenario field names: a Mission's name, or its villain by any name.
function _dtmMatchB(b) {
  const parts = String(b || '').split(/\s*[／|]\s*/).map(_dtmNorm).filter(Boolean);
  for (const part of parts) {
    const m = DTM_MISSIONS.find(x => [x.name, _dtmBoss(x), ...(DTM_AKA[x.k] || [])].some(n => n && _dtmNorm(n) === part));
    if (m) return m;
  }
  return null;
}
// Which Mission a play was: its record, else its scenario field.
function _dtmMissionOf(p) {
  const r = ((_dtm && _dtm.plays) || {})[_dtmPlayKey(p)];
  if (r && r.m) return _dtmMission(r.m);
  return _dtmMatchB(p.b);
}
// What a play did: { m, up, s1, s2, perfect, x2, lvl (its total difficulty) }
function _dtmRec(p) {
  const r = ((_dtm && _dtm.plays) || {})[_dtmPlayKey(p)] || {};
  const won = p.sc.some(s => s && s.w);
  const s2 = r.s2 !== undefined ? !!r.s2 : won;
  const s1 = r.s1 !== undefined ? !!r.s1 || s2 : won;
  const m = _dtmMission(r.m) || _dtmMissionOf(p);
  const up = Math.max(0, Math.min(4, Number(r.up) || 0));
  return { m, up, s1, s2, perfect: !!r.perfect && s1 && s2, x2: !!r.x2, lvl: (m ? m.lvl : 1) + up, known: !!r.m || !!m };
}
const _dtmResultOf = (r) => (r.perfect ? 'perfect' : r.s2 ? 'won' : r.s1 ? 's1' : 'lost');
const _dtmSeat = (p, name) => p.sc.find(s => s && s.n && _dtmCanon(s.n) === _dtmCanon(name));

// Everyone with a sheet or a Mission played, the viewer first.
function _dtmPeople() {
  const out = new Map();
  const add = (n) => { if (n && !out.has(_dtmCanon(n))) out.set(_dtmCanon(n), n); };
  add(_dtmMe());
  for (const p of _dtmPlays().slice().reverse()) for (const s of p.sc) add(s.n);
  for (const k in ((_dtm && _dtm.sheets) || {})) add(_dtm.sheets[k].name);
  return [...out.values()].filter(n => !(typeof HIDDEN_PLAYERS !== 'undefined' && HIDDEN_PLAYERS.has(n)));
}
const _dtmSheet = (name) => (((_dtm && _dtm.sheets) || {})[_dtmKey(name)]) || {};

// A player's sheet worked out: the Missions on its back, the PP earned (each
// with the level it can be spent up to), New Game+, the heroes played.
function _dtmStats(name) {
  const sh = _dtmSheet(name);
  const since = sh.since || '';
  const marks = {}, grants = [], ngp = {}, heroes = {}, games = [];
  const perfected = new Set();
  for (const p of _dtmPlays()) {
    const seat = _dtmSeat(p, name);
    if (!seat || String(p.t || p.date) < since) continue;
    const r = _dtmRec(p);
    let pp = r.s1 ? (r.s2 ? 2 : 1) : 0;
    let firstPerfect = false;
    if (r.perfect && r.m && !perfected.has(r.m.k)) { perfected.add(r.m.k); pp += 1; firstPerfect = true; }
    if (r.x2) pp *= 2;
    if (pp) grants.push({ lvl: Math.min(5, r.lvl), n: pp });
    if (r.m) {
      const mk = marks[r.m.k] = marks[r.m.k] || { played: 0, complete: false, perfect: false };
      mk.played++;
      if (r.s1 && r.s2) mk.complete = true;
      if (r.perfect) { mk.perfect = true; ngp[r.m.lvl] = true; }
    }
    if (seat.r) heroes[seat.r] = (heroes[seat.r] || 0) + 1;
    games.push({ p, r, pp, firstPerfect, hero: seat.r || '' });
  }
  return { sh, marks, grants, ngp, heroes, games, plus: Number(sh.plus) || 0 };
}
const _dtmFill = (sh, id) => Math.max(0, Number(((sh && sh.fills) || {})[id]) || 0);
const _dtmCells = () => DTM_PERKS.flatMap(R => R.cells.map((c, i) => ({ id: `${R.row}-${i + 1}`, row: R.row, rowName: R.name, col: i + 1, need: c[0], short: c[1], full: c[2] })));
const _dtmDone = (sh, cell) => cell.need === 0 || _dtmFill(sh, cell.id) >= cell.need;
// PP spent per column (1..5)
function _dtmSpent(fills) {
  const out = [0, 0, 0, 0, 0, 0];
  for (const c of _dtmCells()) out[c.col] += Math.min(c.need, Math.max(0, Number((fills || {})[c.id]) || 0));
  return out;
}
// Can these PP pay for these circles? A PP of level L fills a column up to L:
// for every x, the circles in columns x and up mustn't outnumber the PP of level x and up.
function _dtmFits(grants, spent) {
  for (let x = 1; x <= 5; x++) {
    let need = 0, have = 0;
    for (let c = x; c <= 5; c++) need += spent[c];
    for (const g of grants) if (g.lvl >= x) have += g.n;
    if (need > have) return false;
  }
  return true;
}
// The PP still to spend, by the level each can go up to: [_, n1..n5]
function _dtmLeft(grants, spent) {
  const pool = [0, 0, 0, 0, 0, 0];
  for (const g of grants) pool[Math.min(5, g.lvl)] += g.n;
  for (let c = 5; c >= 1; c--) {
    let need = spent[c];
    for (let L = c; L <= 5 && need > 0; L++) { const t = Math.min(pool[L], need); pool[L] -= t; need -= t; }
  }
  return pool;
}
// What a player's perks do at the start of a Mission.
function _dtmStart(name, heroes) {
  const sh = _dtmSheet(name);
  const done = _dtmCells().filter(c => _dtmDone(sh, c));
  const card = Math.max(1, ...done.filter(c => c.row === 'momentum').map(c => c.col));
  const grit = done.filter(c => c.row === 'grit' && c.col <= 4).reduce((a, c) => a + c.col, 0);
  const base = DTM_HEALTH[Math.max(1, Math.min(4, heroes || 1))];
  const effects = done.filter(c => c.row !== 'momentum' && c.row !== 'feats' && !(c.row === 'grit' && c.col <= 4)).map(c => c.short);
  const feats = done.filter(c => c.row === 'feats').map(c => c.short);
  return { card, health: base + grit, grit, base, effects, feats };
}
// Where the viewer stands, for Play → Campaigns.
function dtmSummary(name) {
  if (!name) return null;
  const S = _dtmStats(name);
  if (!S.games.length && !Object.keys(S.sh.fills || {}).length) return null;
  const won = DTM_MISSIONS.filter(m => (S.marks[m.k] || {}).complete).length;
  const left = _dtmLeft(S.grants, _dtmSpent(S.sh.fills)).reduce((a, b) => a + b, 0);
  return { pct: Math.round((won / DTM_MISSIONS.length) * 100), done: won === DTM_MISSIONS.length,
    text: `${won} of ${DTM_MISSIONS.length} Missions won${left ? ` · ${left} PP to spend` : ''}` };
}

// ── Firebase ──
function _dtmMerge(a, b) {
  if (!b || typeof b !== 'object') return b === undefined ? a : b;
  const out = { ...(a && typeof a === 'object' ? a : {}) };
  for (const k in b) out[k] = _dtmMerge(out[k], b[k]);
  return out;
}
async function _dtmLoad(force) {
  if (_dtm && !force) return _dtm;
  const { main, spare } = await fbReadBoth(DTM_NODE);
  _dtm = _dtmMerge(spare || {}, main || {});
  _dtmSrc = main ? 'main' : spare ? 'spare' : undefined;
  return _dtm;
}
// Fields of dtm: {path: value}, path relative to it; null removes. Applied
// together, leaving the rest alone (two phones, two sheets).
async function _dtmPatch(updates) {
  for (const [path, v] of Object.entries(updates)) _dtmSetAt(_dtm, path.split('/'), v);
  try {
    const { store } = await fbWrite(DTM_NODE, 'PATCH', updates, _dtmSrc);
    _dtmSrc = store;
    return true;
  } catch (e) {
    console.warn('Dice Throne Missions: not saved', e);
    _dtmToast('Not saved. Check the connection and try again.');
    return false;
  }
}
function _dtmSetAt(o, parts, v) {
  for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
  const last = parts[parts.length - 1];
  if (v === null || v === undefined) delete o[last]; else o[last] = v;
}
function _dtmToast(msg, ok) {
  const el = document.querySelector('.dt .rv-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('ok', !!ok);
  el.hidden = false;
  clearTimeout(_dtmToast.t);
  _dtmToast.t = setTimeout(() => { el.hidden = true; }, 6000);
}

// ── Followed live while on screen (sheets filled on several phones) ──
function _dtmShown() {
  const ov = document.getElementById('modal-overlay');
  return !!(_dtmPanel && _dtmPanel.isConnected && ov && ov.classList.contains('open') && !document.hidden);
}
function _dtmFollow() {
  if (_dtmES && _dtmES.readyState !== 2) return;
  _dtmUnfollow();
  if (typeof EventSource === 'undefined' || !FIREBASE_DB || !_dtmShown()) return;
  const es = new EventSource(`${FIREBASE_DB}/${_dtmSrc === 'spare' ? _fbSpare(DTM_NODE) : DTM_NODE}.json`);
  const on = (kind) => (ev) => {
    let msg = null;
    try { msg = JSON.parse(ev.data); } catch (_) {}
    if (msg && typeof msg.path === 'string') _dtmApply(kind, msg.path, msg.data);
  };
  es.addEventListener('put', on('put'));
  es.addEventListener('patch', on('patch'));
  es.addEventListener('keep-alive', () => { if (!_dtmShown()) _dtmUnfollow(); });
  es.addEventListener('cancel', _dtmUnfollow);
  _dtmES = es;
  if (!_dtmWatch && typeof MutationObserver === 'function') {
    _dtmWatch = new MutationObserver(() => { if (!_dtmShown()) _dtmUnfollow(); });
    _dtmWatch.observe(document.getElementById('modal-overlay'), { attributes: true, attributeFilter: ['class'] });
  }
}
function _dtmUnfollow() {
  if (_dtmES) _dtmES.close();
  _dtmES = null;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) _dtmUnfollow(); else if (_dtmShown()) _dtmFollow(); });
function _dtmApply(kind, path, data) {
  const before = JSON.stringify(_dtm || null);
  const parts = path.split('/').filter(Boolean);
  const box = { d: _dtm || {} };
  const put = (p, v) => _dtmSetAt(box, ['d', ...p], v);
  if (kind === 'put') put(parts, data);
  else for (const k in data || {}) put([...parts, ...k.split('/').filter(Boolean)], data[k]);
  _dtm = box.d || {};
  if (JSON.stringify(_dtm) !== before) _dtmRedraw();
}
function _dtmRedraw() {
  const p = _dtmPanel;
  if (!p || !p.isConnected) return;
  const a = document.activeElement;
  if (a && p.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) { _dtmLate = true; return; }
  _dtmRender(p);
}

// ── The tab ──
function buildDtmHtml(game) {
  if (!game || Number(game.bggId) !== DTM_BGGID) return '';
  return '<div class="rv dt" data-dt><div class="rv-loading">Opening the Missions…</div></div>';
}
function wireDtm(content) {
  const panel = content.querySelector('[data-dt]');
  if (!panel) return;
  _dtmPanel = panel;
  _dtmLoad(true).then(() => _dtmRender(panel)).catch(e => {
    panel.innerHTML = '<div class="rv-loading">The Missions couldn’t be loaded. Try again in a moment.</div>';
    console.warn('Dice Throne Missions:', e);
  });
  panel.addEventListener('click', (ev) => _dtmClick(panel, ev));
  panel.addEventListener('input', (ev) => _dtmInput(panel, ev));
  panel.addEventListener('change', (ev) => _dtmChange(panel, ev));
  panel.addEventListener('focusout', () => setTimeout(() => {
    const a = document.activeElement;
    if (_dtmLate && !(a && panel.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) _dtmRender(panel);
  }, 250));
}

function _dtmRender(panel) {
  const esc = _escapeHtml;
  _dtmPanel = panel;
  _dtmLate = false;
  const people = _dtmPeople();
  if (!_dtmWho || !people.some(n => _dtmCanon(n) === _dtmCanon(_dtmWho))) _dtmWho = people[0] || null;
  const who = _dtmWho;
  const chips = people.length ? `<div class="dt-who" role="tablist" aria-label="Whose">${people.map(n =>
    `<button type="button" class="cl-chip${who && _dtmCanon(n) === _dtmCanon(who) ? ' on' : ''}" data-dt-who="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : '';
  const tabs = [['missions', 'Missions'], ['sheets', 'Perk Sheets']];
  const body = _dtmTab === 'sheets' ? _dtmSheetHtml(who) : _dtmBoardHtml(who);
  panel.innerHTML = `
    ${_dtmLog ? _dtmLogHtml() : `<div class="dt-top"><button type="button" class="rv-btn" data-dt-play>Play a Mission</button>
      <span class="rv-hint">Setup for everyone at the table, then the result: PP are worked out, BG Stats’ QR code follows.</span></div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_dtmTab === k ? ' on' : ''}" data-dt-tab="${k}">${l}</button>`).join('')}</div>
    ${chips}
    <div class="rv-body">${body}</div>
    <div class="rv-toast" hidden></div>
    <div class="rv-credit">From Dice Throne’s <a href="https://shop.dicethrone.com/pages/faq" target="_blank" rel="noopener">Missions rulebook and Perk Sheet</a>. The villains come from players’ reports; three aren’t known yet, and you name them when you play them.</div>`;
  _dtmWire(panel);
  _dtmFollow();
}

// ── The Missions: the back of the Perk Sheet, with every attempt ──
function _dtmNext(S) {
  return DTM_MISSIONS.find(m => !(S.marks[m.k] || {}).complete) || null;
}
function _dtmBoardHtml(who) {
  const esc = _escapeHtml;
  const S = who ? _dtmStats(who) : { marks: {}, games: [] };
  const won = DTM_MISSIONS.filter(m => (S.marks[m.k] || {}).complete).length;
  const perfect = DTM_MISSIONS.filter(m => (S.marks[m.k] || {}).perfect).length;
  const next = _dtmNext(S);
  const all = _dtmPlays();
  const nextHtml = next ? `<div class="dt-next">
      ${_dtmDie(next.lvl)}
      <div><small>${who ? `Next for ${esc(who)}` : 'Start with'}</small><b>${esc(next.name)}</b>
        <span>${_dtmBoss(next) ? `vs ${esc(_dtmBoss(next))}` : 'villain not known yet'} · ${_dtmLvl(next.lvl)[0]}</span></div>
      <button type="button" class="rv-btn rv-btn-sm" data-dt-play="${next.k}">Play it</button></div>` : '';
  const levels = [1, 2, 3, 4, 5].map(L => {
    const ms = DTM_MISSIONS.filter(m => m.lvl === L);
    return `<div class="dt-lvl" style="--dt-c:${_dtmLvl(L)[1]}">
      <div class="dt-lvl-head">${_dtmDie(L)}<b>${_dtmLvl(L)[0]}</b><span>${ms.filter(m => (S.marks[m.k] || {}).complete).length} of ${ms.length} won</span></div>
      ${ms.map(m => _dtmMissionRowHtml(m, S, all)).join('')}</div>`;
  }).join('');
  const loose = all.filter(p => !_dtmRec(p).m);
  return `<div class="dt-score">${who ? `<b>${esc(who)}</b>: ` : ''}${won} of ${DTM_MISSIONS.length} won · ${perfect} Perfect</div>
    ${nextHtml}
    <div class="dt-legend"><span class="dt-mk on">&#9654;</span> played <span class="dt-mk on">&#10003;</span> won both sides <span class="dt-mk on star">&#9733;</span> Perfect</div>
    ${levels}
    ${loose.length ? `<div class="rv-sub">Plays without a Mission</div>${loose.map(p => _dtmGameHtml(p, true)).join('')}` : ''}`;
}
function _dtmMissionRowHtml(m, S, all) {
  const esc = _escapeHtml;
  const mk = S.marks[m.k] || {};
  const open = _dtmOpen === m.k;
  const games = all.filter(p => { const r = _dtmRec(p); return r.m && r.m.k === m.k; }).reverse();
  const boss = _dtmBoss(m);
  return `<div class="dt-m${open ? ' open' : ''}${mk.complete ? ' won' : ''}">
    <button type="button" class="dt-m-line" data-dt-open="${m.k}" aria-expanded="${open}">
      <span class="dt-marks"><span class="dt-mk${mk.played ? ' on' : ''}">&#9654;</span><span class="dt-mk${mk.complete ? ' on' : ''}">&#10003;</span><span class="dt-mk star${mk.perfect ? ' on' : ''}">&#9733;</span></span>
      <span class="dt-m-name"><b>${esc(m.name)}</b><small>${boss ? `vs ${esc(boss)}` : 'villain: ?'}${m.note ? ` · ${esc(m.note)}` : ''}</small></span>
      <span class="dt-m-n">${games.length ? `${games.length}&times;` : ''}</span>
    </button>
    ${open ? `<div class="dt-m-more">
      <div class="dt-m-facts">${_dtmDie(m.lvl, true)} Level ${m.lvl}, ${_dtmLvl(m.lvl)[0]}${m.foe1 ? ` · side 1 is a Boss Fight too, against ${esc(m.foe1)}` : ''}${boss ? ` · side 2: ${esc(boss)}` : ''}</div>
      ${games.length ? games.map(p => _dtmGameHtml(p, false)).join('') : '<div class="cr-note">Not played yet.</div>'}
      <button type="button" class="rv-btn rv-btn-sm" data-dt-play="${m.k}">Play ${esc(m.name)}</button>
    </div>` : ''}
  </div>`;
}
// One attempt: who played whom, how it went, and what it can still be told.
function _dtmGameHtml(p, loose) {
  const esc = _escapeHtml;
  const r = _dtmRec(p);
  const key = _dtmPlayKey(p);
  const from = _dtmFrom.get(p) || DTM_BGGID;
  const idx = (PLAY_HISTORY[from] || []).indexOf(p);
  const edit = !!_dtmMe();
  const acts = (idx >= 0 && typeof bgsSendBtnHtml === 'function' ? bgsSendBtnHtml(from, idx) : '') + (p.mp && typeof logPlayEditBtnHtml === 'function' ? logPlayEditBtnHtml(p) : '');
  const box = from !== DTM_BGGID ? findGameByBggId(from) : null;
  const res = _dtmResultOf(r);
  return `<div class="dt-g">
    <div class="dt-g-head"><b>${esc(_dtmDate(p.date))}</b>${r.up ? `<span class="dt-up">+${r.up} → level ${r.lvl}</span>` : ''}${r.x2 ? '<span class="dt-up">double PP</span>' : ''}<span class="cl-acts">${acts}</span></div>
    <div class="dt-g-who">${p.sc.map(s => `${esc(s.n)}${s.r ? ` <i>${esc(s.r)}</i>` : ''}`).join(' · ')}</div>
    ${box ? `<div class="dt-g-box">Logged as ${esc(box.name)}${p.b ? `: “${esc(p.b)}”` : ''}</div>` : ''}
    ${loose && edit ? `<label class="dt-assign">Which Mission? <select class="rv-in" data-dt-assign="${esc(key)}"><option value="">?</option>${DTM_MISSIONS.map(m => `<option value="${m.k}">${esc(m.name)}</option>`).join('')}</select></label>` : ''}
    <div class="dt-res">${DTM_RESULTS.map(([k, l]) => `<button type="button" class="cl-chip${res === k ? ' on' : ''}" data-dt-res="${esc(key)}|${k}"${edit ? '' : ' disabled'}>${l}</button>`).join('')}</div>
  </div>`;
}

// ── A Perk Sheet ──
function _dtmSheetHtml(who) {
  const esc = _escapeHtml;
  if (!who) return '<div class="cr-note">Pick who you are to keep a Perk Sheet.</div>';
  const S = _dtmStats(who);
  const sh = S.sh;
  const spent = _dtmSpent(sh.fills);
  const left = _dtmLeft(S.grants, spent);
  const total = left.reduce((a, b) => a + b, 0);
  const edit = !!_dtmMe();
  const ngpN = [1, 2, 3, 4, 5].filter(L => S.ngp[L]).length;
  const mythic = ngpN === 5 || S.plus > 0;
  const rows = DTM_PERKS.map(R => {
    const cells = R.cells.map((c, i) => {
      const cell = { id: `${R.row}-${i + 1}`, row: R.row, col: i + 1, need: c[0] };
      const n = _dtmFill(sh, cell.id), done = _dtmDone(sh, cell);
      const dots = c[0] ? Array.from({ length: c[0] }, (_, j) => `<i class="dt-dot${j < n ? ' on' : ''}"></i>`).join('')
        : '<span class="dt-free">free</span>';
      return `<button type="button" class="dt-cell${done ? ' done' : ''}${_dtmCell === cell.id ? ' sel' : ''}" style="--dt-c:${_dtmLvl(i + 1)[1]}" data-dt-cell="${cell.id}"
          aria-pressed="${_dtmCell === cell.id}" aria-label="${esc(R.name)}, level ${i + 1}: ${esc(c[2])} ${c[0] ? `${n} of ${c[0]} circles` : 'free'}">
        <span class="dt-cell-name">${esc(c[1])}</span>
        <span class="dt-dots">${dots}</span></button>`;
    }).join('');
    const sel = _dtmCell && _dtmCell.startsWith(R.row + '-') ? R.cells[Number(_dtmCell.split('-')[1]) - 1] : null;
    const selN = sel ? _dtmFill(sh, _dtmCell) : 0;
    const acts = sel && sel[0] && edit ? `<span class="dt-fill-acts">
        <button type="button" class="rv-btn rv-btn-sm" data-dt-fill="${_dtmCell}|1"${selN >= sel[0] ? ' disabled' : ''}>Fill a circle</button>
        <button type="button" class="rv-link" data-dt-fill="${_dtmCell}|-1"${selN ? '' : ' disabled'}>Empty one</button>
        <span class="dt-fill-n">${selN} of ${sel[0]}${selN >= sel[0] ? ': unlocked' : ''}</span></span>` : '';
    return `<div class="dt-row"><div class="dt-row-name">${esc(R.name)}</div><div class="dt-cells">${cells}</div>
      ${sel ? `<div class="dt-cell-full">${_dtmDie(Number(_dtmCell.split('-')[1]), true)} ${esc(sel[2])}${acts}</div>` : ''}</div>`;
  }).join('');
  const st = _dtmStart(who, 4);
  const heroes = Object.entries(S.heroes).sort((a, b) => b[1] - a[1]);
  const leftHtml = total ? `<div class="dt-pp"><b>${total} PP to spend</b>${[5, 4, 3, 2, 1].filter(L => left[L]).map(L =>
      `<span class="dt-pp-l" style="--dt-c:${_dtmLvl(L)[1]}">${left[L]} up to ${_dtmLvl(L)[0]}</span>`).join('')}
      <span class="rv-hint">Tap a perk, then fill its circles: a PP fills a circle in its level’s column or a lower one.</span></div>`
    : `<div class="dt-pp none">${S.grants.length ? 'Every PP is spent.' : 'No PP yet: they come with each Mission.'}</div>`;
  return `<div class="dt-sheet">
    <div class="dt-sheet-head"><b>${esc(who)}${'+'.repeat(S.plus)}</b>
      <span>${S.games.length} Mission${S.games.length === 1 ? '' : 's'} on this sheet${sh.since ? ` (since ${esc(_dtmDate(sh.since))})` : ''}</span></div>
    ${leftHtml}
    ${edit ? `<label class="dt-paper"><input type="checkbox" data-dt-paper${_dtmPaper ? ' checked' : ''}> Copy from a paper sheet (no PP limits while on)</label>` : ''}
    <div class="dt-grid">${rows}</div>
    <div class="dt-row dt-ngp"><div class="dt-row-name">New Game+</div>
      <div class="dt-ngp-dots">${[1, 2, 3, 4, 5].map(L => `<span class="dt-dot ro${S.ngp[L] ? ' on' : ''}" style="--dt-c:${_dtmLvl(L)[1]}" title="Perfect and win a level ${L} Mission"></span>`).join('')}</div>
      <div class="rv-hint">A circle fills the first time you Perfect side 1 of a Mission of that level and win side 2. ${mythic
        ? '<b>Mythic Ability unlocked</b>: you may start each Mission with one of the four Mythic cards.'
        : `${5 - ngpN} to go for a Mythic Ability.`}</div>
      ${edit && ngpN === 5 ? '<button type="button" class="rv-link" data-dt-newsheet>Start a New Game+ sheet (+ by the name; perks and Perfects start over)</button>' : ''}</div>
    <div class="rv-sub">At the start of each Mission</div>
    <ul class="dt-start">
      <li>Momentum Card: <b>Level ${st.card}</b></li>
      <li>Health: ${[1, 2, 3, 4].map(h => `${h} hero${h === 1 ? '' : 'es'} <b>${DTM_HEALTH[h] + st.grit}</b>`).join(' · ')}${st.grit ? ` (with +${st.grit} from Grit)` : ''}</li>
      ${st.effects.length ? `<li>${st.effects.map(esc).join(' · ')}</li>` : ''}
      ${st.feats.length ? `<li>Feats, once each a game (a plot token on each): ${st.feats.map(esc).join(' · ')}</li>` : ''}
      ${mythic ? '<li>A Mythic Ability</li>' : ''}
    </ul>
    ${heroes.length ? `<div class="rv-sub">Heroes played</div><div class="dt-heroes">${heroes.map(([h, n]) => `<span class="cr-person">${esc(h)} <small>${n}&times;</small></span>`).join('')}</div>` : ''}
  </div>`;
}

// ── Playing a Mission: the setup, then the result ──
function _dtmLastParty() {
  const last = _dtmPlays().slice(-1)[0];
  if (last) return last.sc.map(s => ({ n: s.n, hero: s.r || '' })).slice(0, 4);
  const me = _dtmMe();
  return me ? [{ n: me, hero: _dtmLastHero(me) }] : [];
}
function _dtmLastHero(name) {
  for (const p of _dtmPlays().slice().reverse()) { const s = _dtmSeat(p, name); if (s && s.r) return s.r; }
  return '';
}
function _dtmLogStart(mk) {
  const prev = _dtmPlays().slice(-1)[0];
  const r = prev ? _dtmRec(prev) : null;
  _dtmLog = { m: mk || (_dtmNext(_dtmStats(_dtmWho || _dtmMe() || '')) || DTM_MISSIONS[0]).k, up: 0, x2: !!(r && r.x2), party: _dtmLastParty(), res: '', boss: '',
    date: _dtmToday(), l: (prev && prev.l) || (typeof _lpPlaces === 'function' ? _lpPlaces()[0] : '') || '' };
}
// PP each would earn, with this result (the Perfect point only the first time).
function _dtmEarn(name, L) {
  const R = DTM_RESULTS.find(x => x[0] === L.res);
  if (!R) return null;
  let pp = R[2] ? (R[3] ? 2 : 1) : 0;
  const S = _dtmStats(name);
  const first = R[4] && !(S.marks[L.m] || {}).perfect;
  if (first) pp += 1;
  if (L.x2) pp *= 2;
  return { pp, first };
}
function _dtmLogHtml() {
  const esc = _escapeHtml;
  const L = _dtmLog;
  const m = _dtmMission(L.m);
  const boss = _dtmBoss(m);
  const total = m.lvl + L.up;
  const n = L.party.length;
  const party = L.party.map((s, i) => {
    const st = _dtmStart(s.n, n);
    const earn = _dtmEarn(s.n, L);
    return `<div class="dt-seat">
      <div class="dt-seat-top"><b>${esc(s.n)}</b>
        <input class="rv-in dt-hero" data-dt-hero="${i}" value="${esc(s.hero)}" placeholder="Hero" maxlength="40" aria-label="${esc(s.n)}'s hero">
        <button type="button" class="cr-person-x" data-dt-out="${i}" aria-label="Take ${esc(s.n)} off">&times;</button></div>
      <div class="dt-seat-start"><b>${st.health}</b> Health${st.grit ? ` (+${st.grit})` : ''} · Momentum Card ${st.card}${st.effects.length ? ` · ${st.effects.map(esc).join(' · ')}` : ''}${st.feats.length ? ` · Feats: ${st.feats.map(esc).join(', ')}` : ''}</div>
      ${earn ? `<div class="dt-seat-pp">+${earn.pp} PP${earn.pp ? `, up to ${_dtmLvl(Math.min(5, total))[0]}` : ''}${earn.first ? ' (first Perfect of it)' : ''}</div>` : ''}
    </div>`;
  }).join('');
  const ready = n > 0 && !!L.res && !!L.date && (boss || L.boss.trim());
  return `<div class="dt-log">
    <div class="dt-log-title">Play a Mission</div>
    <label class="rv-field"><span>Mission</span><select class="rv-in" data-dt-m>${[1, 2, 3, 4, 5].map(lv => `<optgroup label="Level ${lv}: ${_dtmLvl(lv)[0]}">${DTM_MISSIONS.filter(x => x.lvl === lv).map(x =>
      `<option value="${x.k}"${x.k === L.m ? ' selected' : ''}>${esc(x.name)}${_dtmBoss(x) ? ` · ${esc(_dtmBoss(x))}` : ''}</option>`).join('')}</optgroup>`).join('')}</select></label>
    ${boss ? '' : `<label class="rv-field"><span>Villain</span><input class="rv-in" data-dt-boss value="${esc(L.boss)}" placeholder="Who’s the boss? (on side 2)" maxlength="40"></label>`}
    <div class="dt-diff"><span>Harder</span>${[0, 1, 2, 3, 4].map(u => `<button type="button" class="cl-chip${L.up === u ? ' on' : ''}" data-dt-up="${u}">${u ? `+${u}` : 'As printed'}</button>`).join('')}</div>
    <div class="dt-diff-sum">${_dtmDie(Math.min(6, total), true)} ${total > 5 ? 'Total difficulty' : 'Level'} ${total}, ${_dtmLvl(Math.min(6, total))[0]}${L.up ? ` · setup: ${L.up} more black ${L.up === 1 ? 'die' : 'dice'}, ${Math.min(4, L.up)} Oppression on each hero, Henchmen +${L.up} Health, the “+1” Crisis Clock hand` : ''}</div>
    <label class="dt-paper"><input type="checkbox" data-dt-x2${L.x2 ? ' checked' : ''}> Approachable rules: double the PP</label>
    <div class="rv-sub">At the table <span class="cr-count">${n} of 4</span></div>
    <div class="dt-party">${party}</div>
    ${n < 4 ? '<input class="rv-in cr-who" data-dt-add placeholder="Add a player" maxlength="40" enterkeyhint="done">' : ''}
    <div class="rv-sub">How it went</div>
    <div class="dt-res">${DTM_RESULTS.map(([k, l]) => `<button type="button" class="cl-chip${L.res === k ? ' on' : ''}" data-dt-pick="${k}">${l}</button>`).join('')}</div>
    <div class="rv-fields pc-fields">
      <label class="rv-field"><span>Date</span><input type="date" class="rv-in" data-dt-date value="${esc(L.date)}" max="${_dtmToday()}"></label>
      <label class="rv-field"><span>Where</span><input class="rv-in" data-dt-where value="${esc(L.l)}" placeholder="Optional" maxlength="60"></label>
    </div>
    <div class="cl-log-acts"><button type="button" class="rv-btn" data-dt-save${ready ? '' : ' disabled'}>Save ${esc(m.name)}</button><button type="button" class="rv-link" data-dt-cancel>Cancel</button></div>
    ${typeof acctMe === 'function' && acctMe() ? '' : '<div class="rv-hint">Sign in to save it.</div>'}
  </div>`;
}
async function _dtmSave(panel, btn) {
  const L = _dtmLog;
  const m = L && _dtmMission(L.m);
  const R = L && DTM_RESULTS.find(x => x[0] === L.res);
  if (!m || !R || !L.party.length || typeof logPlaySave !== 'function') return;
  const boss = _dtmBoss(m) || L.boss.trim().slice(0, 40);
  if (!boss) return;
  const total = m.lvl + L.up;
  const rec = {
    bggId: DTM_BGGID, date: L.date, t: `${L.date} ${_dtmNow().slice(11)}`, b: `${m.name}／${boss}`,
    sc: L.party.map(s => { const o = { n: s.n, w: R[3] }; if (s.hero.trim()) o.r = s.hero.trim().slice(0, 40); return o; }),
    c: `Level ${m.lvl}${L.up ? ` +${L.up} (total ${total})` : ''} · ${R[1]}${L.x2 ? ' · double PP' : ''}`,
  };
  if (L.l.trim()) rec.l = L.l.trim().slice(0, 60);
  // what each earns, worked out before the play counts (the Perfect point is the first one's)
  const earned = rec.sc.map(s => `${s.n} +${(_dtmEarn(s.n, L) || { pp: 0 }).pp}`);
  btn.disabled = true;
  btn.textContent = 'Saving…';
  let r;
  try { r = await logPlaySave(rec); }
  catch (e) {
    btn.disabled = false;
    btn.textContent = `Save ${m.name}`;
    _dtmToast(`Not saved: ${e.message || 'check the connection and try again'}.`);
    return;
  }
  const key = _dtmPlayKey({ mp: r.id });
  const up = { [`plays/${key}`]: { m: m.k, up: L.up || null, s1: R[2], s2: R[3], perfect: R[4] || null, x2: L.x2 || null } };
  if (!_dtmBoss(m) && boss) up[`bosses/${m.k}`] = boss;
  await _dtmPatch(up);
  _dtmLog = null;
  _dtmOpen = m.k;
  _dtmTab = 'missions';
  _dtmRender(panel);
  _dtmToast(r.pending ? 'No signal, so it’s kept on this phone; it goes up by itself.' : `${m.name} saved. PP: ${earned.join(', ')}. Spend them on the Perk Sheets.`, true);
  const i = (PLAY_HISTORY[DTM_BGGID] || []).findIndex(e => e.mp === r.id);
  if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(DTM_BGGID, i);
}

// ── Taps and typing ──
function _dtmWire(panel) {
  if (typeof comboAttach !== 'function') return;
  const add = panel.querySelector('input[data-dt-add]');
  if (add) {
    const names = () => {
      const taken = new Set((_dtmLog ? _dtmLog.party : []).map(s => _dtmCanon(s.n)));
      const all = [...new Set([_dtmMe(), ..._dtmPeople(), ...(typeof _knownPlayerNames === 'function' ? [..._knownPlayerNames()].sort((a, b) => a.localeCompare(b)) : [])].filter(Boolean))];
      return all.filter(n => !taken.has(_dtmCanon(n)));
    };
    comboAttach(add, { options: names, onPick: (v) => _dtmAddSeat(panel, v), max: 80 });
    add.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); _dtmAddSeat(panel, add.value); } });
  }
  panel.querySelectorAll('input[data-dt-hero]').forEach(inp => {
    const used = () => [...new Set([...DTM_HEROES, ..._dtmPlays().flatMap(p => p.sc.map(s => s.r).filter(Boolean))])].sort((a, b) => a.localeCompare(b));
    comboAttach(inp, { options: used, onPick: (v) => { const s = _dtmLog && _dtmLog.party[Number(inp.dataset.dtHero)]; if (s) s.hero = v; inp.value = v; }, max: 80 });
  });
}
function _dtmAddSeat(panel, v) {
  v = String(v || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!v || !_dtmLog || _dtmLog.party.length >= 4) { _dtmRender(panel); return; }
  const known = [...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].find(n => n.toLowerCase() === v.toLowerCase());
  v = known || v;
  if (!_dtmLog.party.some(s => _dtmCanon(s.n) === _dtmCanon(v))) _dtmLog.party.push({ n: v, hero: _dtmLastHero(v) });
  _dtmRender(panel);
}
async function _dtmClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.dtTab) { _dtmTab = ds.dtTab; _dtmCell = null; _dtmRender(panel); return; }
  if (ds.dtWho) { _dtmWho = ds.dtWho; _dtmCell = null; _dtmRender(panel); return; }
  if (ds.dtOpen) { _dtmOpen = _dtmOpen === ds.dtOpen ? null : ds.dtOpen; _dtmRender(panel); return; }
  if (ds.dtCell) { _dtmCell = _dtmCell === ds.dtCell ? null : ds.dtCell; _dtmRender(panel); return; }
  if (ds.dtPlay !== undefined) { _dtmLogStart(ds.dtPlay || null); _dtmRender(panel); panel.scrollIntoView({ block: 'start' }); return; }
  if (ds.dtCancel !== undefined) { _dtmLog = null; _dtmRender(panel); return; }
  if (ds.dtUp !== undefined && _dtmLog) { _dtmLog.up = Number(ds.dtUp); _dtmRender(panel); return; }
  if (ds.dtPick && _dtmLog) { _dtmLog.res = ds.dtPick; _dtmRender(panel); return; }
  if (ds.dtOut !== undefined && _dtmLog) { _dtmLog.party.splice(Number(ds.dtOut), 1); _dtmRender(panel); return; }
  if (ds.dtSave !== undefined) { await _dtmSave(panel, t); return; }
  if (!_dtmMe()) return;
  if (ds.dtRes) {
    const [key, k] = ds.dtRes.split('|');
    const R = DTM_RESULTS.find(x => x[0] === k);
    const p = _dtmPlays().find(q => _dtmPlayKey(q) === key);
    const cur = p ? _dtmRec(p) : {};
    if (R) await _dtmPatch({ [`plays/${key}/s1`]: R[2], [`plays/${key}/s2`]: R[3], [`plays/${key}/perfect`]: R[4] || null, ...(cur.m && !((_dtm.plays || {})[key] || {}).m ? { [`plays/${key}/m`]: cur.m.k } : {}) });
    _dtmRender(panel);
    return;
  }
  if (ds.dtFill) { _dtmDot(panel, ds.dtFill); return; }
  if (ds.dtNewsheet !== undefined) {
    const who = _dtmWho;
    if (!who || !confirm(`Start a New Game+ sheet for ${who}? Every perk and Perfect starts over, a “+” goes by the name, and the Mythic Ability stays.`)) return;
    const S = _dtmStats(who);
    await _dtmPatch({ [`sheets/${_dtmKey(who)}`]: { name: _dtmCanon(who), fills: null, plus: S.plus + 1, since: _dtmNow() } });
    _dtmRender(panel);
  }
}
// A circle filled (+1) or emptied (-1) on the selected perk.
async function _dtmDot(panel, val) {
  const who = _dtmWho;
  if (!who) return;
  const [id, dStr] = val.split('|');
  const cell = _dtmCells().find(c => c.id === id);
  const S = _dtmStats(who);
  const fills = { ...((S.sh && S.sh.fills) || {}) };
  const cur = _dtmFill(S.sh, id);
  const to = Math.max(0, Math.min(cell.need, cur + Number(dStr)));
  if (to === cur) return;
  fills[id] = to;
  if (!_dtmPaper) {
    if (cell.row === 'momentum' && to > cur && cell.col > 2 && !_dtmDone(S.sh, _dtmCells().find(c => c.id === `momentum-${cell.col - 1}`))) {
      _dtmToast(`The Momentum Cards go in order: Level ${cell.col - 1} first.`); return;
    }
    if (cell.row === 'momentum' && to < cell.need && cell.col < 5 && _dtmFill(S.sh, `momentum-${cell.col + 1}`) > 0) {
      _dtmToast(`Level ${cell.col + 1} is built on this one: empty it first.`); return;
    }
    if (to > cur && !_dtmFits(S.grants, _dtmSpent(fills))) {
      const left = _dtmLeft(S.grants, _dtmSpent(S.sh.fills)).reduce((a, b) => a + b, 0);
      _dtmToast(left ? `Those PP can’t go this high: a PP fills a circle up to the level of the Mission it came from.` : 'No PP left to spend. They come with each Mission.');
      return;
    }
  }
  await _dtmPatch({ [`sheets/${_dtmKey(who)}/name`]: _dtmCanon(who), [`sheets/${_dtmKey(who)}/fills/${id}`]: to || null });
  _dtmRender(panel);
}
function _dtmInput(panel, ev) {
  const t = ev.target, L = _dtmLog;
  if (!L) return;
  if (t.matches('[data-dt-hero]')) { const s = L.party[Number(t.dataset.dtHero)]; if (s) s.hero = t.value; return; }
  if (t.matches('[data-dt-boss]')) {
    L.boss = t.value;
    const save = panel.querySelector('[data-dt-save]');
    if (save) save.disabled = !(L.party.length && L.res && L.date && L.boss.trim());
    return;
  }
  if (t.matches('[data-dt-where]')) { L.l = t.value; return; }
  if (t.matches('[data-dt-date]')) { L.date = t.value; }
}
async function _dtmChange(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-dt-paper]')) { _dtmPaper = t.checked; return; }
  if (_dtmLog && t.matches('[data-dt-m]')) { _dtmLog.m = t.value; _dtmLog.boss = ''; _dtmRender(panel); return; }
  if (_dtmLog && t.matches('[data-dt-x2]')) { _dtmLog.x2 = t.checked; _dtmRender(panel); return; }
  if (t.matches('[data-dt-assign]') && _dtmMe()) {
    await _dtmPatch({ [`plays/${t.dataset.dtAssign}/m`]: t.value || null });
    _dtmRender(panel);
  }
}

// From Log a play (js/log-play.js, _lpHandoff): the people, the day and the place so far.
function dtmLogFrom(ctx) {
  _dtmLogStart(null);
  const names = (ctx.names || []).filter(Boolean);
  if (names.length > 1) _dtmLog.party = names.slice(0, 4).map(n => ({ n, hero: _dtmLastHero(n) }));
  if (ctx.date) _dtmLog.date = ctx.date;
  if (ctx.l) _dtmLog.l = ctx.l;
  _dtmTab = 'missions';
  _modalTab = 'campaign';
  _modalTabFor = DTM_BGGID;
  const g = findGameByBggId(DTM_BGGID);
  if (g) openModal(g);
}
