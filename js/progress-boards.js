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

  const cellHtml = (c) => {
    const e = byKey.get(c.key);
    const cls = !e ? 'todo' : e.won ? (coop && e.tries === 1 ? 'won1' : 'won') : 'lost';
    const tip = `${unit} ${c.label}${e && e.title ? ` · ${e.title}` : ''}${e ? (e.won ? (coop ? ` · won${e.tries > 1 ? ` on try ${e.tries}` : ' first try'}` : ` · played ${e.plays.length}×`) : ` · ${e.losses} loss${e.losses > 1 ? 'es' : ''}`) : ''}`;
    return `<span class="pb-cell pb-${cls}${c === nextCell ? ' pb-next' : ''}" title="${esc(tip)}">${esc(c.label)}${e && e.losses ? `<i>${e.losses}</i>` : ''}</span>`;
  };
  const rows = clocks
    ? Array.from({ length: last }, (_, i) => `<div class="pb-row"><span class="pb-rowlbl">${i + 1}</span>${cells.filter(c => c.n === i + 1).map(cellHtml).join('')}</div>`).join('')
    : `<div class="pb-grid">${cells.map(cellHtml).join('')}</div>`;
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
    <div class="pb-legend">${coop ? '<span><i class="pb-cell pb-won1"></i>First try</span><span><i class="pb-cell pb-won"></i>Won</span><span><i class="pb-cell pb-lost"></i>Not yet beaten</span>' : '<span><i class="pb-cell pb-won"></i>Played</span>'}<span><i class="pb-cell pb-todo"></i>${done ? 'Not logged' : 'Ahead'}</span></div>
    ${hardest.length ? `<div class="pb-note">Hardest: ${hardest.map(e => `<b>${esc(unit)} ${esc(e.key)}</b> (${e.losses} loss${e.losses > 1 ? 'es' : ''}${e.won ? `, beaten on try ${e.tries}` : ''})`).join(' · ')}</div>` : ''}
  </div>`;
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
