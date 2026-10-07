// ── Progress boards on a game's page (Plays tab), read from the logged plays ──
// Two kinds, each for any game whose plays carry the information, so a new
// game gets one as soon as it's logged that way:
//  - a mission map, for games played mission by mission ("Mission 4",
//    "Chapter 11.5", Take Time's "2-3"): every mission beaten, failed or still
//    ahead, the tries each took, the hardest, what's next and the streak;
//  - a hero × boss board, for games logged with a character per player and a
//    boss or scenario on the board ("Picket" against "Drellen"): which
//    pairings were played, won or never tried, the toughest boss.
// Games with a board of their own (Sky Team, Slay the Spire, Marvel
// Champions, Marvel United, Spirit Island, Aeon's End, Rove, Eternal Decks)
// and Leviathan Wilds are left out.

const PB_SKIP = new Set([373106, 338960, 285774, 162886, 424981, 365670, 439995, 358737, 241451, 390092]);
// How many missions a game has, where it's known (more in CAMPAIGN_PROGRESS).
// chapters × per: Take Time's 10 folders of 4 clocks.
const PB_TOTALS = {
  209778: 17,        // Magic Maze
  339789: 8,         // Welcome to the Moon
  291457: 25,        // Gloomhaven: Jaws of the Lion
  209010: 10,        // Mechs vs. Minions
  393672: 20,        // Gloomhaven: Buttons & Bugs
};
// Words on the board that are a difficulty or a variant, not the boss or the mission.
const PB_DIFFICULTY = /^(easy|normal|medium|moderate|hard|very hard|expert|heroic|heroic adventurer|adventurer|legendary|impossible|nightmare|standard|beginner|increased difficulty|roguelike difficulty|true solo|solo|ascension\s*\d+|stage\s*[a-z]|level\s*\d+)$/i;
// Games with names for their missions, in order.
const PB_NAMES = {
  339789: ['The Launch', 'The Journey', 'The Colony', 'The Mine', 'The Dome', 'The Virus', 'The Escape', 'The Battle'],   // Welcome to the Moon
};
const PB_MOON = 339789;   // drawn as the trip from the Earth to the Moon
const PB_CREW = 284083;   // The Crew: the voyage out to Planet Nine

// What's new since this device last showed a game's progress (to animate
// once): the keys it hasn't seen before. The first visit shows nothing new,
// so old progress never replays; then it remembers what it showed.
function pbFresh(scope, keys) {
  const me = (typeof _ptViewer === 'function' && _ptViewer()) || '';
  const k = `bgl-seen:${scope}:${me}`;
  let seen = null;
  try { seen = JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) {}
  try { localStorage.setItem(k, JSON.stringify([...keys])); } catch (_) {}
  if (!Array.isArray(seen)) return new Set();
  const old = new Set(seen);
  return new Set([...keys].filter(x => !old.has(x)));
}
const PB_SPLIT = /\s*[／｜|]\s*|\s*\/\s*(?!\/)/;
const PB_MISSION = /^(?:mission|scenario|campaign|chapter|adventure|case|map|year|episode|level|quest|game)\s*0*(\d{1,3})(?:\.(\d+))?(?:\s*[-–:]\s*(.+))?$/i;
const PB_CLOCK = /^(\d{1,2})\s*-\s*(\d{1,2})$/;

function _pbTokens(s) {
  return String(s || '').replace(/sp\s*\/\/\s*dr/ig, 'SPdr').split(PB_SPLIT).map(t => t.trim()).filter(Boolean);
}
const _pbWon = (p) => (p.sc || []).some(s => s && s.w);
// co-operative when everyone at the table shares the result in (almost) every play
function _pbCoop(plays) {
  const multi = plays.filter(p => (p.sc || []).length > 1);
  if (!multi.length) return true;
  return multi.filter(p => p.sc.every(s => !!s.w === !!p.sc[0].w)).length >= multi.length * 0.8;
}
function _pbOrder(plays) {
  if (typeof byPlayOrder === "function") return plays.slice().sort(byPlayOrder);
  return plays.slice().sort((a, b) => ((a.t || a.date) + (a.e || '')).localeCompare((b.t || b.date) + (b.e || '')));
}

// ── Mission maps ──
// A play's mission: {key, n, sub, title}, from the first board token that's numbered.
function _pbMission(p) {
  for (const t of _pbTokens(p.b)) {
    if (PB_DIFFICULTY.test(t)) continue;
    let m = t.match(PB_CLOCK);
    if (m) return { key: `${+m[1]}-${+m[2]}`, n: +m[1], sub: +m[2], clock: true };
    m = t.match(PB_MISSION);
    if (m && +m[1] < 200) return { key: m[2] ? `${+m[1]}.${+m[2]}` : String(+m[1]), n: +m[1], sub: m[2] ? +m[2] : 0, title: (m[3] || '').trim() };
  }
  return null;
}

function buildMissionMapHtml(game, plays) {
  const id = Number(game && game.bggId);
  if (!id || PB_SKIP.has(id) || !plays || plays.length < 3) return '';
  const tagged = plays.filter(p => p.b);
  const parsed = tagged.map(p => ({ p, m: _pbMission(p) }));
  const numbered = parsed.filter(x => x.m);
  // a mission game: most of its tagged plays name a numbered mission
  if (numbered.length < 3 || numbered.length < tagged.length * 0.6) return '';
  // a game with no winner (Cozy Stickerville) is played through, not beaten
  const coop = !(typeof isNoResultGame === 'function' && isNoResultGame(id)) && _pbCoop(plays);
  const clocks = numbered.some(x => x.m.clock);
  const cfg = (typeof CAMPAIGN_PROGRESS !== 'undefined' && CAMPAIGN_PROGRESS[id]) || {};
  const per = clocks ? (cfg.perFolder || Math.max(...numbered.map(x => x.m.sub))) : 0;

  // every play of each mission, in order
  const byKey = new Map();
  for (const { p, m } of _pbOrder(numbered.map(x => x.p)).map(p => ({ p, m: _pbMission(p) }))) {
    const e = byKey.get(m.key) || { ...m, plays: [] };
    if (!e.title && m.title) e.title = m.title;
    e.plays.push(p);
    byKey.set(m.key, e);
  }
  for (const e of byKey.values()) {
    e.won = coop ? e.plays.some(_pbWon) : true;
    const first = coop ? e.plays.findIndex(_pbWon) : 0;
    e.tries = first >= 0 ? first + 1 : e.plays.length;
    e.losses = coop ? e.plays.filter(p => !_pbWon(p)).length : 0;
    e.when = (coop ? e.plays.find(_pbWon) : e.plays[0]) || null;
  }

  // the whole map: 1..total, or as far as you've got and a little beyond
  const known = clocks ? (cfg.total ? cfg.total / per : 0) : (cfg.total || PB_TOTALS[id] || 0);
  const maxN = Math.max(...numbered.map(x => x.m.n));
  const done = !!cfg.complete;
  const last = Math.max(known, done || !coop ? maxN : maxN + 1);
  const cells = [];
  if (clocks) {
    for (let c = 1; c <= last; c++) for (let s = 1; s <= per; s++) cells.push({ key: `${c}-${s}`, n: c, sub: s, label: `${c}-${s}` });
  } else {
    const subs = {};
    for (const e of byKey.values()) if (e.sub) (subs[e.n] = subs[e.n] || new Set()).add(e.sub);
    for (let n = 1; n <= last; n++) {
      if (byKey.has(String(n)) || !subs[n]) cells.push({ key: String(n), n, sub: 0, label: String(n) });
      for (const s of [...(subs[n] || [])].sort((a, b) => a - b)) cells.push({ key: `${n}.${s}`, n, sub: s, label: `${n}.${s}` });
    }
  }
  const total = known ? (clocks ? known * per : known) : 0;
  // (a half chapter like Oathsworn's 11.5 doesn't count past the total)
  const won = Math.min(cells.filter(c => (byKey.get(c.key) || {}).won).length, total || Infinity);
  // what's next: the first one not yet beaten after the furthest one beaten
  // (a mission lost and left behind stays red, it isn't "next")
  let lastWon = -1;
  cells.forEach((c, i) => { if ((byKey.get(c.key) || {}).won) lastWon = i; });
  const nextCell = done ? null : cells.slice(lastWon + 1).find(c => !(byKey.get(c.key) || {}).won) || null;
  const tries = numbered.length;

  // streaks, in play order (co-op: a win; competitive: every play counts)
  let streak = 0, best = 0, run = 0;
  for (const { p } of _pbOrder(numbered.map(x => x.p)).map(p => ({ p }))) {
    if (!coop || _pbWon(p)) { run++; best = Math.max(best, run); } else run = 0;
  }
  streak = run;
  const hardest = [...byKey.values()].filter(e => e.losses).sort((a, b) => b.losses - a.losses || b.n - a.n).slice(0, 3);
  const firstTry = [...byKey.values()].filter(e => e.won && e.tries === 1).length;
  const esc = _escapeHtml;
  const unit = (cfg.label || (tagged[0] && (String(tagged[0].b).match(/^[A-Za-z]+/) || [''])[0]) || 'Mission').replace(/^./, ch => ch.toUpperCase());

  // beaten (or, with no winner to beat, played) since this device last looked
  const fresh = pbFresh(id, cells.filter(c => (byKey.get(c.key) || {}).won).map(c => c.key));
  const cellHtml = (c) => {
    const e = byKey.get(c.key);
    const cls = (!e ? 'todo' : e.won ? (coop && e.tries === 1 ? 'won1' : 'won') : 'lost') + (fresh.has(c.key) ? ' pb-new' : '');
    const tip = `${unit} ${c.label}${e && e.title ? ` · ${e.title}` : ''}${e ? (e.won ? (coop ? ` · won${e.tries > 1 ? ` on try ${e.tries}` : ' first try'}` : ` · played ${e.plays.length}×`) : ` · ${e.losses} loss${e.losses > 1 ? 'es' : ''}`) : ''}`;
    return `<span class="pb-cell pb-${cls}${c === nextCell ? ' pb-next' : ''}" title="${esc(tip)}">${esc(c.label)}${e && e.losses ? `<i>${e.losses}</i>` : ''}</span>`;
  };
  // what a mission says when tapped
  const capOf = (c) => {
    const e = byKey.get(c.key);
    const name = (PB_NAMES[id] || [])[c.n - 1] || (e && e.title) || '';
    let say = `<b>${esc(unit)} ${esc(c.label)}</b>${name ? ` ${esc(name)}` : ''}`;
    if (!e) say += c === nextCell ? ' · next' : done ? ' · not logged' : ' · ahead';
    else if (!coop) {
      const wins = {};
      for (const p of e.plays) for (const sc of p.sc || []) if (sc && sc.w) wins[sc.n] = (wins[sc.n] || 0) + 1;
      const w = Object.entries(wins).sort((a, b) => b[1] - a[1]).map(([n, k]) => `${esc(n)}${k > 1 ? ` (${k})` : ''}`);
      say += ` · played ${e.plays.length === 1 ? 'once' : `${e.plays.length}×`}${w.length ? ` · won by ${w.join(', ')}` : ''}`;
    } else if (e.won) say += ` · ${e.tries === 1 ? 'won first try' : `won on try ${e.tries}`} · ${fmtPlayDate(e.when.date)}`;
    else say += ` · ${e.losses} loss${e.losses > 1 ? 'es' : ''} so far`;
    return say;
  };
  const drawn = clocks || id === PB_MOON || id === PB_CREW;
  const rows = clocks ? _pbClocksHtml(cells, byKey, nextCell, last, per, coop, capOf, fresh)
    : id === PB_MOON ? _pbMoonHtml(cells, byKey, nextCell, capOf, fresh)
    : id === PB_CREW ? _pbCrewHtml(cells, byKey, nextCell, capOf, fresh, coop)
    : `<div class="pb-grid">${cells.map(cellHtml).join('')}</div>`;
  const firstCap = (() => {
    const lastPlayed = [...cells].reverse().find(c => byKey.has(c.key));
    return drawn ? capOf(nextCell || lastPlayed || cells[0]) : '';
  })();
  const pct = total ? Math.round(won / total * 100) : null;

  return `<div class="pb-board pb-missions">
    <div class="st-head"><span class="st-title">&#128506; ${esc(unit)}s</span><span class="pb-count">${won}${total ? ` / ${total}` : ''} ${coop ? 'beaten' : 'played'}</span></div>
    ${total ? `<div class="pb-bar"><span style="width:${pct}%"></span></div>` : ''}
    <div class="pb-stats">
      ${nextCell ? `<div class="pb-stat"><b>${esc(nextCell.label)}</b><span>Next ${esc(unit.toLowerCase())}</span></div>` : `<div class="pb-stat"><b>✓</b><span>${done ? 'Finished' : 'All done'}</span></div>`}
      <div class="pb-stat"><b>${tries}</b><span>Game${tries === 1 ? '' : 's'}</span></div>
      ${coop ? `<div class="pb-stat"><b>${firstTry}</b><span>First-try wins</span></div>
      <div class="pb-stat"><b>${streak}</b><span>Win streak${best > streak ? ` · best ${best}` : ''}</span></div>` : ''}
    </div>
    ${rows}
    ${firstCap ? `<div class="pb-cap" aria-live="polite">${firstCap}</div>` : ''}
    <div class="pb-legend">${coop ? '<span><i class="pb-cell pb-won1"></i>First try</span><span><i class="pb-cell pb-won"></i>Won</span><span><i class="pb-cell pb-lost"></i>Not yet beaten</span>' : '<span><i class="pb-cell pb-won"></i>Played</span>'}<span><i class="pb-cell pb-todo"></i>${done ? 'Not logged' : 'Ahead'}</span></div>
    ${hardest.length ? `<div class="pb-note">Hardest: ${hardest.map(e => `<b>${esc(unit)} ${esc(e.key)}</b> (${e.losses} loss${e.losses > 1 ? 'es' : ''}${e.won ? `, beaten on try ${e.tries}` : ''})`).join(' · ')}</div>` : ''}
  </div>`;
}

const fmtPlayDate = (d) => {
  const [y, m, day] = String(d || '').split('-').map(Number);
  return y ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${day}, ${y}` : '';
};
const _pbState = (e, coop, isNext) => (isNext ? 'next' : !e ? 'todo' : e.won ? (coop && e.tries === 1 ? 'won1' : 'won') : 'lost');

// Take Time: each chapter a clock whose four quarters fill as its missions are
// beaten; the hand points at the one that's next.
function _pbClocksHtml(cells, byKey, nextCell, last, per, coop, capOf, fresh) {
  const R = 41, rad = (deg) => deg * Math.PI / 180;
  const pt = (deg, r) => `${(r * Math.cos(rad(deg))).toFixed(1)} ${(r * Math.sin(rad(deg))).toFixed(1)}`;
  const span = 360 / per;
  const clocks = [];
  for (let n = 1; n <= last; n++) {
    const mine = cells.filter(c => c.n === n);
    const quarters = mine.map((c, k) => {
      const e = byKey.get(c.key);
      const a0 = -90 + span * k, a1 = a0 + span;
      return `<path class="pbq pbq-${_pbState(e, coop, c === nextCell)}${fresh.has(c.key) ? ' pb-new' : ''}" d="M0 0 L${pt(a0, R)} A${R} ${R} 0 0 1 ${pt(a1, R)}Z" data-pb-cap="${_escapeHtml(capOf(c))}"><title>${_escapeHtml(capOf(c).replace(/<[^>]+>/g, ''))}</title></path>`;
    }).join('');
    const k = mine.indexOf(nextCell);
    const hand = k >= 0 ? `<line class="pbq-hand" x1="0" y1="0" x2="${pt(-90 + span * (k + 0.5), 33).replace(' ', '" y2="')}"/>` : '';
    const full = mine.every(c => (byKey.get(c.key) || {}).won);
    clocks.push(`<div class="pb-clock${full ? ' full' : ''}${k >= 0 ? ' now' : ''}">
        <svg viewBox="-50 -50 100 100" role="img" aria-label="Chapter ${n}">
          <circle class="pbq-rim" r="46"/>${quarters}
          <g class="pbq-ticks"><line x1="0" y1="-46" x2="0" y2="-40"/><line x1="46" y1="0" x2="40" y2="0"/><line x1="0" y1="46" x2="0" y2="40"/><line x1="-46" y1="0" x2="-40" y2="0"/></g>
          ${hand}<circle class="pbq-hub" r="13"/><text class="pbq-num" y="5">${n}</text>
        </svg>
      </div>`);
  }
  return `<div class="pb-clocks">${clocks.join('')}</div>`;
}

// A voyage: the missions as stops along a route (pts, sampled points; stop i
// at pts[stopIdx[i]]), lit up to the furthest one reached, a rocket on its way
// to the next. What's new since the last visit is animated once: the route
// draws on, the rocket flies over, the new stops pop in.
function _pbVoyageHtml(o) {
  const { cells, byKey, nextCell, capOf, fresh, coop, pts, stopIdx, W, H, cls, deco, names, r } = o;
  const reached = (c) => { const e = byKey.get(c.key); return !!e && (coop ? e.won : true); };
  const furthest = cells.reduce((f, c, i) => (reached(c) ? i : f), -1);
  const before = cells.reduce((f, c, i) => (reached(c) && !fresh.has(c.key) ? i : f), -1);
  const line = (a, b) => pts.slice(a, b + 1).map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  // a point off the route, at a right angle to it (+ to the left of travel, - to the right)
  const off = (k, d) => {
    const a = pts[Math.max(0, k - 3)], b = pts[Math.min(pts.length - 1, k + 3)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [pts[k][0] + dy / l * d, pts[k][1] - dx / l * d];
  };
  const heading = (k) => {
    const a = pts[Math.max(0, k - 3)], b = pts[Math.min(pts.length - 1, k + 3)];
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  };
  const stops = cells.map((c, i) => {
    const [x, y] = pts[stopIdx[i]];
    const st = _pbState(byKey.get(c.key), coop, c === nextCell);
    const name = names ? (names[i] || '').replace(/^The /, '') : '';
    const lab = name ? off(stopIdx[i], i % 2 === 0 ? 30 : -30) : null;
    return `<g class="pbm-stop pbm-${st}${fresh.has(c.key) ? ' pb-new' : ''}" data-pb-cap="${_escapeHtml(capOf(c))}" tabindex="0">
        <title>${_escapeHtml(capOf(c).replace(/<[^>]+>/g, ''))}</title>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>
        <text class="pbm-n" x="${x.toFixed(1)}" y="${(y + r * 0.37).toFixed(1)}">${c.n}</text>
        ${lab ? `<text class="pbm-name" x="${lab[0].toFixed(1)}" y="${(lab[1] + 6).toFixed(1)}">${_escapeHtml(name)}</text>` : ''}
      </g>`;
  }).join('');
  // the rocket: on its way from the furthest one reached to the next (from the start before any)
  const gap = stopIdx.length > 1 ? stopIdx[1] - stopIdx[0] : 30;
  const rocketK = (i) => (i >= 0 ? Math.min(pts.length - 1, stopIdx[i] + Math.round(gap / 2)) : Math.max(0, stopIdx[0] - Math.round(gap / 2)));
  const at = off(rocketK(furthest), 4);
  const was = off(rocketK(before), 4);
  const flew = furthest > before;
  const done = furthest < 0 ? '' : flew
    ? `${before >= 0 ? `<polyline class="pbm-done" points="${line(0, stopIdx[before])}"/>` : ''}<polyline class="pbm-done pbm-grow" pathLength="1" points="${line(before >= 0 ? stopIdx[before] : 0, stopIdx[furthest])}"/>`
    : `<polyline class="pbm-done" points="${line(0, stopIdx[furthest])}"/>`;
  return `<div class="pb-moon ${cls}">
      <svg viewBox="0 0 ${W} ${H}" role="img">
        ${deco}
        <polyline class="pbm-path" points="${line(0, pts.length - 1)}"/>
        ${done}
        ${stops}
        <g class="${flew ? 'pbm-fly' : ''}" style="--dx:${(was[0] - at[0]).toFixed(1)}px;--dy:${(was[1] - at[1]).toFixed(1)}px">
          <g transform="translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(${(heading(rocketK(furthest)) + 45).toFixed(0)})"><text class="pbm-rocket" y="10">&#128640;</text></g>
        </g>
      </svg>
    </div>`;
}

const _pbStars = (list) => list.map(([x, y], i) => `<circle class="pbm-star" cx="${x}" cy="${y}" r="${i % 3 ? 1.2 : 1.8}"/>`).join('');

// Welcome to the Moon: the adventures as stops on the way from the Earth to the Moon.
function _pbMoonHtml(cells, byKey, nextCell, capOf, fresh) {
  const P = [[94, 226], [250, 262], [300, 120], [424, 102]];   // the trajectory (a cubic curve)
  const at = (t) => [0, 1].map(i => (1 - t) ** 3 * P[0][i] + 3 * (1 - t) ** 2 * t * P[1][i] + 3 * (1 - t) * t ** 2 * P[2][i] + t ** 3 * P[3][i]);
  const pts = Array.from({ length: 241 }, (_, i) => at(i / 240));
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const idxAt = (want) => { let i = 0; while (i < len.length - 1 && len[i] < want) i++; return i; };
  const stopIdx = cells.map((_, i) => idxAt((i + 0.5) / cells.length * len[len.length - 1]));
  const deco = `${_pbStars([[40, 40], [150, 110], [240, 50], [300, 110], [370, 30], [505, 170], [440, 250], [290, 280], [500, 285], [90, 140], [200, 170], [360, 205], [130, 30]])}
        <g class="pbm-earth"><circle cx="40" cy="262" r="64"/><path d="M2 228 q18 -16 40 -6 q10 14 -6 26 q-22 6 -34 -20Z M56 286 q16 -18 34 -4 q-4 18 -24 22Z"/></g>
        <g class="pbm-moon"><circle cx="472" cy="58" r="42"/><circle class="pbm-crater" cx="456" cy="46" r="9"/><circle class="pbm-crater" cx="488" cy="74" r="6"/><circle class="pbm-crater" cx="480" cy="36" r="4"/><circle class="pbm-crater" cx="454" cy="78" r="5"/></g>`;
  return _pbVoyageHtml({ cells, byKey, nextCell, capOf, fresh, coop: false, pts, stopIdx, W: 520, H: 300, cls: 'pb-moonmap', deco, names: PB_NAMES[PB_MOON], r: 15 });
}

// The Crew: 50 missions winding out through the solar system, ten to a row,
// swinging round Mars, Jupiter, Saturn and Neptune on the way to Planet Nine.
function _pbCrewHtml(cells, byKey, nextCell, capOf, fresh, coop) {
  const L = 60, R = 380, Y0 = 70, ROW = 90, TURN = ROW / 2, per = 10;
  const rows = Math.max(1, Math.ceil(cells.length / per));
  const pts = [], len = [];
  const push = (x, y) => {
    if (pts.length) len.push(len[len.length - 1] + Math.hypot(x - pts[pts.length - 1][0], y - pts[pts.length - 1][1]));
    else len.push(0);
    pts.push([x, y]);
  };
  const rowStart = [];
  for (let r = 0; r < rows; r++) {
    const y = Y0 + r * ROW, ltr = r % 2 === 0;
    rowStart.push(len.length ? len[len.length - 1] : 0);
    for (let x = 0; x <= R - L; x += 4) push(ltr ? L + x : R - x, y);
    if (r < rows - 1) {   // the turn down to the next row, round a planet
      const cx = ltr ? R : L, cy = y + TURN;
      for (let a = 4; a < 180; a += 4) {
        const rad = (ltr ? -90 + a : -90 - a) * Math.PI / 180;
        push(cx + TURN * Math.cos(rad), cy + TURN * Math.sin(rad));
      }
    }
  }
  const step = (R - L) / (per - 1);
  const idxAt = (want) => { let i = 0; while (i < len.length - 1 && len[i] < want) i++; return i; };
  const stopIdx = cells.map((_, i) => idxAt(rowStart[Math.floor(i / per)] + (i % per) * step));
  const H = Y0 + (rows - 1) * ROW + 36;
  const planet = (k, x, y) => ({
    earth: `<g class="pbc-earth"><title>Earth</title><circle cx="${x}" cy="${y}" r="17"/><path d="M${x - 9} ${y - 6} q6 -6 12 -1 q2 6 -4 9 q-7 1 -8 -8Z M${x + 3} ${y + 6} q5 -4 9 0 q-2 5 -7 5Z"/></g>`,
    mars: `<g class="pbc-mars"><title>Mars</title><circle cx="${x}" cy="${y}" r="15"/><circle class="pbc-spot" cx="${x - 4}" cy="${y - 3}" r="3"/><circle class="pbc-spot" cx="${x + 5}" cy="${y + 5}" r="2"/></g>`,
    jupiter: `<g class="pbc-jupiter"><title>Jupiter</title><circle cx="${x}" cy="${y}" r="22"/><path d="M${x - 21} ${y - 6} h42 M${x - 22} ${y + 2} h44 M${x - 19} ${y + 10} h38"/><ellipse class="pbc-spot" cx="${x + 7}" cy="${y + 6}" rx="5" ry="3"/></g>`,
    saturn: `<g class="pbc-saturn"><title>Saturn</title><circle cx="${x}" cy="${y}" r="14"/><ellipse class="pbc-ring" cx="${x}" cy="${y}" rx="26" ry="7" transform="rotate(-18 ${x} ${y})"/></g>`,
    neptune: `<g class="pbc-neptune"><title>Neptune</title><circle cx="${x}" cy="${y}" r="16"/><path d="M${x - 14} ${y - 4} q14 -5 28 0"/></g>`,
    nine: `<g class="pbc-nine"><title>Planet Nine</title><circle class="pbc-glow" cx="${x}" cy="${y}" r="22"/><circle cx="${x}" cy="${y}" r="15"/><text class="pbc-lab pbc-end" x="${x + 22}" y="${y - 27}">Planet Nine</text></g>`,
  })[k];
  const turns = ['mars', 'jupiter', 'saturn', 'neptune'];
  const lastY = Y0 + (rows - 1) * ROW;
  const deco = _pbStars([[30, 20], [120, 34], [220, 22], [330, 40], [410, 18], [140, 118], [260, 112], [180, 205], [300, 200], [120, 292], [250, 296], [190, 385], [320, 384], [100, 470], [300, 472]])
    + planet('earth', 24, Y0)
    + turns.slice(0, rows - 1).map((k, r) => planet(k, r % 2 === 0 ? R : L, Y0 + r * ROW + TURN)).join('')
    + planet('nine', (rows - 1) % 2 === 0 ? R + 44 : L - 44, lastY);
  return _pbVoyageHtml({ cells, byKey, nextCell, capOf, fresh, coop, pts, stopIdx, W: 452, H, cls: 'pb-crewmap', deco, names: null, r: 11.5 });
}

// Tap a clock quarter or a stop on the way to the Moon to read about it.
function wireProgressBoards(root) {
  (root || document).querySelectorAll('.pb-board').forEach(board => {
    const cap = board.querySelector('.pb-cap');
    if (!cap || board.dataset.wired) return;
    board.dataset.wired = '1';
    board.addEventListener('click', (e) => {
      const el = e.target.closest('[data-pb-cap]');
      if (!el) return;
      board.querySelectorAll('.pb-sel').forEach(x => x.classList.remove('pb-sel'));
      el.classList.add('pb-sel');
      cap.innerHTML = el.dataset.pbCap;
    });
  });
}

// ── Hero × boss boards ──
// a player's colour isn't a character
const PB_COLOUR = /^(black|white|red|blue|green|yellow|purple|orange|pink|grey|gray|brown)$/i;
function _pbHeroes(s) { return _pbTokens(s && s.r).filter(t => !PB_DIFFICULTY.test(t) && !PB_COLOUR.test(t)); }
// The boss a play was against: its board, less difficulties, and less a
// scheme or a numbered episode when a named boss is there too ("Episode 4／Hastur").
function _pbBoss(p) {
  let toks = _pbTokens(p.b).filter(t => !PB_DIFFICULTY.test(t));
  const named = toks.filter(t => !/^scheme\b/i.test(t) && !PB_MISSION.test(t));
  if (named.length) toks = named;
  return toks.slice().sort((a, b) => a.localeCompare(b)).join(' · ');
}

function buildHeroBossHtml(game, plays) {
  const id = Number(game && game.bggId);
  if (!id || PB_SKIP.has(id) || !plays || plays.length < 3) return '';
  if (typeof _muLineFor === 'function' && _muLineFor(id)) return '';
  if (typeof _isAeonsEnd === 'function' && _isAeonsEnd(id)) return '';
  const rows = plays.filter(p => p.b && (p.sc || []).some(s => s && s.r)).map(p => ({ p, boss: _pbBoss(p), won: _pbWon(p) })).filter(x => x.boss);
  if (rows.length < 3) return '';
  const coop = _pbCoop(plays);
  const heroes = new Map(), bosses = new Map(), pairs = new Map();
  const canon = new Map();   // the same hero logged in different case is one hero
  const heroName = (t) => { const k = t.toLowerCase(); if (!canon.has(k)) canon.set(k, t); return canon.get(k); };
  for (const row of rows) {
    const { p, won } = row;
    const boss = row.boss = heroName(row.boss);
    const b = bosses.get(boss) || { name: boss, n: 0, w: 0 };
    b.n++; if (won) b.w++;
    bosses.set(boss, b);
    for (const s of p.sc) {
      for (const t of _pbHeroes(s)) {
        const name = heroName(t);
        const h = heroes.get(name) || { name, n: 0, w: 0, who: new Map() };
        const win = coop ? won : !!s.w;
        h.n++; if (win) h.w++;
        h.who.set(s.n, (h.who.get(s.n) || 0) + 1);
        heroes.set(name, h);
        const key = name + '\u0000' + boss;
        const x = pairs.get(key) || { n: 0, w: 0 };
        x.n++; if (win) x.w++;
        pairs.set(key, x);
      }
    }
  }
  // a roster worth a board: a few characters (not just "Detective" and "Chisel") and a few bosses
  if (heroes.size < 3 || bosses.size < 2) return '';
  const H = [...heroes.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  const B = [...bosses.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  const esc = _escapeHtml;
  const untried = H.length * B.length - pairs.size;
  const toughest = B.filter(b => b.n >= 2 && b.w < b.n).sort((a, b) => a.w / a.n - b.w / b.n || b.n - a.n)[0];
  // bosses, or scenarios when that's what the board names
  const foe = (/arkham|mansions of madness|mage knight|heroes of might|massive darkness|zombicide|sword & sorcery/i.test(game.name || '')
    || B.some(b => /scenario|campaign|conquest|chapter|mission|episode|quest|\d/i.test(b.name))) ? 'scenario' : 'boss';
  const foes = foe === 'boss' ? 'bosses' : 'scenarios';
  const unbeaten = B.filter(b => !b.w);
  const pct = (w, n) => n ? Math.round(w / n * 100) + '%' : '–';
  const cell = (h, b) => {
    const x = pairs.get(h.name + '\u0000' + b.name);
    const cls = !x ? 'todo' : x.w ? 'won' : 'lost';
    return `<td class="pb-mx pb-${cls}" title="${esc(h.name)} vs ${esc(b.name)}${x ? ` · ${x.n} game${x.n > 1 ? 's' : ''}, ${x.w} won` : ' · never tried'}">${x ? (x.w ? (x.n > 1 ? x.n : '✓') : '✗') : ''}</td>`;
  };
  // a grid while it fits; a list for long rosters (Arkham Horror's dozens of scenarios)
  const grid = B.length <= 12 && H.length <= 16;
  const short = (s) => s.length > 18 ? s.slice(0, 17) + '…' : s;
  const body = grid ? `<div class="pb-mxwrap"><table class="pb-matrix">
      <thead><tr><th></th>${B.map(b => `<th title="${esc(b.name)}"><span>${esc(short(b.name))}</span></th>`).join('')}</tr></thead>
      <tbody>${H.map(h => `<tr><th title="${esc(h.name)} · ${h.n} game${h.n > 1 ? 's' : ''}, ${pct(h.w, h.n)} won">${esc(h.name)}</th>${B.map(b => cell(h, b)).join('')}</tr>`).join('')}</tbody>
    </table></div>`
    : `<div class="pb-bosslist">${B.map((b, i) => {
      const hs = H.filter(h => pairs.has(h.name + '\u0000' + b.name));
      return `<div class="pb-boss"><div class="pb-boss-top"><b>${esc(b.name)}</b><span class="pb-dim">${b.n} game${b.n > 1 ? 's' : ''} · ${pct(b.w, b.n)} won</span></div>
        <div class="pb-chips">${hs.map(h => { const x = pairs.get(h.name + '\u0000' + b.name); return `<span class="pb-chip pb-${x.w ? 'won' : 'lost'}">${esc(h.name)}</span>`; }).join('')}</div></div>${i === 5 && B.length > 6 ? `<details class="pb-more"><summary>All ${B.length} ${foes}</summary>` : ''}`;
    }).join('')}${B.length > 6 ? '</details>' : ''}</div>`;
  const heroList = H.map(h => {
    const who = [...h.who.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n).slice(0, 3).join(', ');
    return `<div class="pb-hero"><span class="pb-hero-name">${esc(h.name)}</span><span class="pb-dim">${h.n} game${h.n > 1 ? 's' : ''} · ${pct(h.w, h.n)} won${who ? ` · ${esc(who)}` : ''}</span></div>`;
  }).join('');

  return `<div class="pb-board">
    <div class="st-head"><span class="st-title">&#9876;&#65039; Heroes × ${foes}</span><span class="pb-count">${H.length} × ${B.length}</span></div>
    <div class="pb-stats">
      <div class="pb-stat"><b>${pairs.size}</b><span>Pairings played</span></div>
      ${grid ? `<div class="pb-stat"><b>${untried}</b><span>Never tried</span></div>` : `<div class="pb-stat"><b>${rows.length}</b><span>Games</span></div>`}
      <div class="pb-stat"><b>${B.length - unbeaten.length}<small>/${B.length}</small></b><span>${coop ? `${foes[0].toUpperCase() + foes.slice(1)} beaten` : 'Won at least once'}</span></div>
    </div>
    ${toughest || (coop && unbeaten.length) ? `<div class="pb-note">${toughest ? `Toughest: <b>${esc(toughest.name)}</b>, ${toughest.w} won of ${toughest.n}.` : ''}${coop && unbeaten.length ? ` Never beaten: ${unbeaten.slice(0, 4).map(b => `<b>${esc(b.name)}</b>`).join(', ')}${unbeaten.length > 4 ? ` and ${unbeaten.length - 4} more` : ''}.` : ''}</div>` : ''}
    ${body}
    ${grid ? '<div class="pb-legend"><span><i class="pb-cell pb-won"></i>Won (number: games)</span><span><i class="pb-cell pb-lost"></i>Lost</span><span><i class="pb-cell pb-todo"></i>Never tried</span></div>' : ''}
    <details class="pb-heroes"><summary>Heroes · ${H.length}</summary>${heroList}</details>
  </div>`;
}

// The board this game gets, if any.
function buildProgressBoardHtml(game, plays) {
  return buildMissionMapHtml(game, plays) || buildHeroBossHtml(game, plays);
}
