// ── Marvel Champions Gauntlet (Ilioupoli Bros) ──
// Δημητρης and Στιβ play every Marvel Champions scenario in release order, on
// Expert, with the heroes released by then; a hero who has been played is
// spent for the rest of the run. Progress is read from the logged plays of the
// two of them since GAUNTLET.start, matched to the products, heroes and
// scenarios in data/marvel-champions.js (MarvelCDB, with community win rates
// from Marvel Champions Tracker). Before a box each of them draws three heroes
// and picks one, then spins the aspect wheel: those draws, picks and spins are
// kept in Firebase (mcGauntlet/events), so both phones see the same result
// and a reload can't draw again.

const GAUNTLET = {
  start: '2025-12-27',
  players: ['Δημητρης', 'Στιβ'],
  short: { 'Δημητρης': 'Δ', 'Στιβ': 'Σ' },
  // The draw and the aspect wheel start with this box: Red Skull was already
  // under way when they were agreed.
  rulesFrom: 'toafk',
  // Two strikes (a loss burns the aspects, a second burns the heroes) count
  // losses from this day on.
  strikesFrom: '2026-10-02',
  strikes: 2,
  // How a logged play counts, where the log is wrong:
  // { date, scen (scenario id), won, note }
  fixes: [],
};
const GT_ASPECTS = ['Aggression', 'Justice', 'Leadership', 'Protection'];
const GT_ASPECT_KEY = { aggression: 'Aggression', justice: 'Justice', leadership: 'Leadership', protection: 'Protection', pool: "'Pool" };
// Heroes who don't take the dealt aspect: they count as matching any of it.
const GT_WILDCARDS = new Set(['warlock', 'deadpool']);
// Names people write for a hero, beyond the name and alter-ego.
const GT_HERO_ALIASES = {
  spider_man: ['spiderman', 'spidey', 'peterparker', 'spidermanpeterparker', 'spidermanpeter'],
  spider_man_morales: ['milesmorales', 'miles', 'spidermanmiles', 'spidermanmilesmorales'],
  black_panther: ['blackpanther', 'tchalla', 'blackpanthertchalla'],
  black_panther_shuri: ['shuri', 'blackpanthershuri'],
  ms_marvel: ['msmarvel', 'kamala'],
  doctor_strange: ['drstrange', 'strange'],
  rocket: ['rocket', 'rocketraccoon'],
  ghost_spider: ['ghostspider', 'spidergwen', 'gwen'],
  spdr: ['spdr', 'spidr', 'peni'],
  warlock: ['adamwarlock', 'warlock'],
  x23: ['x23', 'laurakinney'],
  ant: ['antman'], wsp: ['wasp'], qsv: ['quicksilver'], scw: ['scarletwitch', 'wanda'],
  stld: ['starlord'], gam: ['gamora'], vnm: ['venom', 'agentvenom'], nebu: ['nebula'],
  warm: ['warmachine'], valk: ['valkyrie'],
};
// Names people write for a scenario, beyond its own name.
const GT_SCEN_ALIASES = {
  brotherhood_of_badoon: ['drang', 'badoon'],
  infiltrate_the_museum: ['collector', 'collector1', 'collectorinfiltrate'],
  escape_the_museum: ['collector2', 'collectorescape'],
  ronan: ['ronan'],
  tower_defense: ['proximamidnight', 'corvusglaive', 'proximaandcorvus'],
  sinister_six: ['sinistersix'],
  project_wideawake: ['sentinel', 'wideawake'],
  'm.o.d.o.k.': ['modok'],
  thunderbolts: ['citizenv'],
  baron_zemo: ['zemo'],
  black_widow_villain: ['yelena', 'yelenabelova'],
  god_of_lies: ['lokigodoflies', 'godoflies'],
  en_sabah_nur: ['apocalypseensabahnur'],
  kang: ['kangtheconqueror'],
  the_hood: ['hood'],
  wrecking_crew: ['wreckingcrew', 'wrecker'],
};

let _gtTab = 'run';          // 'run' | 'heroes' | 'villains' | 'stats' | 'rules'
let _gtHeroFilter = 'all';   // 'all' | 'pool' | 'spent' | 'locked'

function _gtNorm(s) { return String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]/g, ''); }
function _gtToday() { return new Date().toISOString().slice(0, 10); }
function _gtDays(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
function _gtFmtDate(d, withYear = true) {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('en-GB', withYear ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' });
}
function _gtPct(x) { return Math.round(x * 100) + '%'; }

// The units of the run (the Core Set, every scenario pack and campaign box, in
// release order) and every hero, from the data file.
function _gtCatalog() {
  if (_gtCatalog.cache) return _gtCatalog.cache;
  const products = (typeof MC_PRODUCTS !== 'undefined') ? MC_PRODUCTS : [];
  const units = [], heroes = [], scen = [];
  for (const p of products) {
    for (const h of p.heroes) heroes.push({ ...h, wave: p.wave, pack: p.name, date: p.date, packCode: p.code });
    if (!p.scenarios.length) continue;
    const u = { code: p.code, name: p.name, date: p.date, wave: p.wave, type: p.type, note: p.note || '', idx: units.length, scen: [] };
    p.scenarios.forEach((s, i) => {
      const S = { ...s, key: `${p.code}:${s.id}`, unit: u, order: i, attempts: [], won: false };
      u.scen.push(S);
      scen.push(S);
    });
    units.push(u);
  }
  const heroByKey = {};
  for (const h of heroes) {
    // the first hero to claim a name keeps it: plain "Spider-Man" is Peter, "Black Panther" T'Challa
    for (const k of [_gtNorm(h.name), _gtNorm(h.alter), _gtNorm(h.id), ...(GT_HERO_ALIASES[h.id] || [])]) {
      if (k && !(k in heroByKey)) heroByKey[k] = h;
    }
  }
  const scenByKey = {};
  for (const s of scen) {
    for (const k of [_gtNorm(s.name), _gtNorm(s.id), ...(GT_SCEN_ALIASES[s.id] || [])]) {
      if (k && !(k in scenByKey)) scenByKey[k] = s;
    }
  }
  return (_gtCatalog.cache = { units, heroes, scen, heroByKey, scenByKey });
}

// What one player played in a logged play: heroes and aspects from the role,
// e.g. "Spider-Woman／Justice／Aggression" or "Leadership／Black Panther".
function _gtParseRole(r, cat) {
  const toks = String(r || '').replace(/sp\s*\/\/\s*dr/ig, 'SPdr').split(/[／/,+&]/).map(t => t.trim()).filter(Boolean);
  const heroes = [], aspects = [];
  for (const t of toks) {
    const k = _gtNorm(t);
    const ak = k.replace(/aspect$/, '');
    if (GT_ASPECT_KEY[ak]) { aspects.push(GT_ASPECT_KEY[ak]); continue; }
    const h = cat.heroByKey[k];
    if (h) heroes.push(h); else if (k) heroes.push({ unknown: t });
  }
  return { heroes, aspects };
}

// ── The draw and the wheel, kept in Firebase ──
// mcGauntlet/events/{push id} = {unit, player, kind: 'offer'|'pick'|'spin',
// heroes (offer), hero (pick), aspect (spin), round, at, by}. Push ids sort by
// time; when both phones save the same step, the first one counts.
let _gtEvents = null, _gtEventsAt = 0;
let _gtSel = {};              // player → hero id tapped in their offer, not saved yet
async function _gtLoadEvents(force) {
  if (!force && _gtEvents && Date.now() - _gtEventsAt < 20000) return _gtEvents;
  try {
    const res = await fetch(`${FIREBASE_DB}/mcGauntlet/events.json`, { cache: 'no-store' });
    const data = res.ok ? await res.json() : null;
    _gtEvents = Object.entries(data || {}).map(([key, v]) => ({ ...v, key })).sort((x, y) => x.key.localeCompare(y.key));
  } catch (e) {
    _gtEvents = _gtEvents || [];
  }
  _gtEventsAt = Date.now();
  return _gtEvents;
}
async function _gtSaveEvent(ev) {
  const res = await fetch(`${FIREBASE_DB}/mcGauntlet/events.json`, { method: 'POST', body: JSON.stringify(ev) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { name } = await res.json();
  (_gtEvents = _gtEvents || []).push({ ...ev, key: name });
}
// The same "YYYY-MM-DD HH:MM:SS" local time the logged plays carry.
function _gtNow() {
  const d = new Date(), z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
}
function _gtRandom(n) {
  const a = new Uint32Array(1);
  (window.crypto || window.msCrypto).getRandomValues(a);
  return a[0] % n;
}
function _gtCanAct() {
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  return GAUNTLET.players.includes(me) ? me : null;
}

// Each player's hero and aspect in the box you're playing, replayed from the
// draws, picks and spins and the games logged since: a loss (from
// strikesFrom on) burns both aspects; a second loss in a row burns both
// heroes. A win clears the strikes.
function _gtDraft(st) {
  const u = st.current;
  if (!u) return null;
  const evs = (_gtEvents || []).filter(e => e.unit === u.code);
  const fresh = u.idx >= st.rulesIdx;
  const slots = {};
  for (const p of GAUNTLET.players) {
    slots[p] = { player: p, hero: null, aspects: [], spun: [], burnedAspects: [], burnedHeroes: [], round: fresh ? 1 : 0, offer: null, problems: [] };
  }
  const setHero = (sl, h) => {
    sl.hero = h || null;
    sl.aspects = !h ? [] : h.id === 'warlock' ? GT_ASPECTS.slice() : h.id === 'deadpool' ? ["'Pool"] : [];
  };
  let strikes = 0;
  const tl = [
    ...evs.map(e => ({ at: e.at || '', e })),
    // a game counts from when it was logged (its start time can be a made-up 10:00)
    ...u.attempts.map(a => ({ at: (a.e && a.e.slice(0, 10) >= a.date ? a.e : a.t) || `${a.date} 23:59:59`, a })),
  ].sort((x, y) => x.at.localeCompare(y.at));
  for (const it of tl) {
    if (it.e) {
      const sl = slots[it.e.player], e = it.e;
      if (!sl) continue;
      if (e.kind === 'offer' && e.round === sl.round && !sl.hero && !sl.offer) sl.offer = (e.heroes || []).map(id => st.heroById[id]).filter(Boolean);
      if (e.kind === 'pick' && !sl.hero && st.heroById[e.hero]) { setHero(sl, st.heroById[e.hero]); sl.offer = null; }
      if (e.kind === 'spin' && sl.hero && !sl.aspects.length) { sl.aspects = [e.aspect]; sl.spun.push(e.aspect); }
      continue;
    }
    const a = it.a;
    // a box started before the draw (or played without it): the log says who and what
    for (const pk of a.picks) {
      const sl = slots[pk.player];
      if (!sl.hero && pk.heroes[0]) setHero(sl, pk.heroes[0]);
      if (!sl.aspects.length && pk.aspects.length) sl.aspects = pk.aspects.slice();
    }
    const want = GAUNTLET.players.map(p => slots[p].hero && slots[p].hero.id).filter(Boolean).sort().join('|');
    const got = a.picks.flatMap(pk => pk.heroes.map(h => h.id)).sort().join('|');
    if (want && got && want !== got) st.problems.push(`${a.scen.name} (${_gtFmtDate(a.date)}) was played with ${a.picks.map(pk => pk.heroes.map(h => h.name).join('+')).join(' and ')}, not the heroes picked.`);
    for (const pk of a.picks) {
      const sl = slots[pk.player];
      if (sl.hero && !GT_WILDCARDS.has(sl.hero.id) && sl.aspects.length && pk.aspects.length && !sl.aspects.some(x => pk.aspects.includes(x))) {
        st.problems.push(`${pk.player} played ${pk.aspects.join(' + ')} in ${a.scen.name} (${_gtFmtDate(a.date)}); the wheel gave ${sl.aspects.join(' + ')}.`);
      }
    }
    if (a.won) { strikes = 0; continue; }
    if (a.date < GAUNTLET.strikesFrom) continue;      // losses before the rule just count
    strikes++;
    for (const p of GAUNTLET.players) {
      const sl = slots[p];
      if (strikes >= GAUNTLET.strikes) {             // second strike: the heroes burn
        if (sl.hero) sl.burnedHeroes.push(sl.hero);
        setHero(sl, null);
        sl.round++;
        sl.offer = null;
      } else if (sl.hero && !GT_WILDCARDS.has(sl.hero.id)) {   // first strike: the aspects burn
        sl.burnedAspects.push(...sl.aspects);
        sl.aspects = [];
      }
    }
    if (strikes >= GAUNTLET.strikes) strikes = 0;
  }
  for (const p of GAUNTLET.players) {
    const sl = slots[p];
    sl.need = !sl.hero ? (sl.offer ? 'pick' : 'draw') : !sl.aspects.length ? 'spin' : null;
  }
  return { unit: u, slots, strikes, fresh };
}

// The aspects one player's spin can land on. Each player gets every aspect
// before any repeats, never the one they had in the box before, never the
// other player's, and never one burned in this box. 'Pool joins the wheel
// from the wave Deadpool came out in. When that leaves nothing, the rules
// loosen in that order.
function _gtWheel(st, d, p) {
  const u = d.unit;
  const base = [...GT_ASPECTS, ...(u.wave >= st.poolWave ? ["'Pool"] : [])];
  const sl = d.slots[p];
  const other = d.slots[GAUNTLET.players.find(x => x !== p)];
  const partner = other.hero && GT_WILDCARDS.has(other.hero.id) ? [] : other.aspects;
  // the aspects this player had in each box since the wheel started, in order
  const used = [];
  let prev = [];
  for (const x of st.units) {
    if (x.idx < st.rulesIdx || x.idx >= u.idx) continue;
    const spins = (_gtEvents || []).filter(e => e.unit === x.code && e.player === p && e.kind === 'spin').map(e => e.aspect);
    const logged = [...new Set(x.attempts.flatMap(a => a.picks.filter(pk => pk.player === p).flatMap(pk => pk.aspects)))];
    const had = spins.length ? spins : logged;
    if (had.length) { used.push(...had); prev = had; }
  }
  used.push(...sl.spun);
  let cycle = new Set();
  for (const a of used) { cycle.add(a); if (base.every(b => cycle.has(b))) cycle = new Set(); }
  const first = !sl.spun.length;
  const why = {};
  base.forEach(a => {
    if (sl.burnedAspects.includes(a)) why[a] = 'burned';
    else if (partner.includes(a)) why[a] = `${other.player}'s`;
    else if (first && prev.includes(a)) why[a] = 'had it last box';
    else if (cycle.has(a)) why[a] = 'had it this round';
  });
  const tiers = [
    a => !why[a],
    a => !sl.burnedAspects.includes(a) && !partner.includes(a) && !(first && prev.includes(a)),
    a => !sl.burnedAspects.includes(a) && !partner.includes(a),
    a => !partner.includes(a),
    () => true,
  ];
  for (const f of tiers) {
    const opts = base.filter(f);
    if (opts.length) return { opts, off: base.filter(a => !opts.includes(a)).map(a => [a, why[a] || '']) };
  }
  return { opts: base, off: [] };
}

// Everything the page shows, worked out from the plays.
function _gtState() {
  const cat = _gtCatalog();
  const today = _gtToday();
  // fresh per call: attempts and statuses are recomputed from the plays
  const units = cat.units.map(u => ({ ...u, scen: [] }));
  const scenByKey = {};
  units.forEach((u, ui) => {
    cat.units[ui].scen.forEach(s0 => {
      const s = { ...s0, unit: u, attempts: [], won: false, wonOn: null, tries: 0 };
      u.scen.push(s);
      scenByKey[s.key] = s;
    });
    u.released = u.date && u.date <= today;
  });
  const lookupScen = (k) => { const s0 = cat.scenByKey[k]; return s0 ? scenByKey[s0.key] : null; };
  const heroes = cat.heroes.map(h => ({ ...h, uses: [], released: h.date && h.date <= today }));
  const heroById = Object.fromEntries(heroes.map(h => [h.id, h]));

  const plays = ((typeof PLAY_HISTORY !== 'undefined' && PLAY_HISTORY[MC_BGGID]) || [])
    .filter(p => p && p.date >= GAUNTLET.start && Array.isArray(p.sc) && p.sc.length === 2
      && GAUNTLET.players.every(n => p.sc.some(s => s.n === n)))
    .slice().sort((a, b) => ((a.t || a.date) + (a.e || '')).localeCompare((b.t || b.date) + (b.e || '')));

  const attempts = [], problems = [];
  for (const p of plays) {
    const toks = String(p.b || '').split(/[／/]/).map(t => t.trim()).filter(Boolean);
    const matched = [];
    toks.forEach(t => { const s = lookupScen(_gtNorm(t)); if (s && !matched.includes(s)) matched.push(s); });
    const expert = /\bexpert\b/i.test(p.b || '');
    let won = p.sc.some(s => s.w);
    const scen = matched[0] || null;
    const fix = scen && GAUNTLET.fixes.find(f => f.date === p.date && f.scen === scen.id && !won !== !f.won);
    if (fix) won = fix.won;
    const picks = GAUNTLET.players.map(n => {
      const s = p.sc.find(x => x.n === n);
      const { heroes: hs, aspects } = _gtParseRole(s && s.r, cat);
      return { player: n, heroes: hs.filter(h => !h.unknown).map(h => heroById[h.id]), unknown: hs.filter(h => h.unknown).map(h => h.unknown), aspects };
    });
    const a = { date: p.date, t: p.t, e: p.e, won, expert, scen, picks, fix, board: p.b || '', place: p.l || '' };
    attempts.push(a);
    if (!scen) { problems.push({ kind: 'scenario', a, text: `A play on ${_gtFmtDate(p.date)} (“${p.b || 'no scenario'}”) doesn't name a scenario the app knows, so it isn't counted.` }); continue; }
    if (!expert) problems.push({ kind: 'expert', a, text: `${scen.name} on ${_gtFmtDate(p.date)} isn't marked Expert in the log. It's counted anyway.` });
    picks.forEach(pk => pk.unknown.forEach(u => problems.push({ kind: 'hero', a, text: `“${u}” (${pk.player}, ${scen.name}, ${_gtFmtDate(p.date)}) isn't a hero the app knows.` })));
    scen.attempts.push(a);
    if (!scen.won) { scen.tries++; if (won) { scen.won = true; scen.wonOn = p.date; } }
    for (const pk of picks) for (const h of pk.heroes) h.uses.push({ a, player: pk.player, unit: scen.unit, aspects: pk.aspects });
  }

  // units: done, started; the current one is the first released unit not done
  units.forEach(u => {
    u.done = u.scen.every(s => s.won);
    u.attempts = u.scen.flatMap(s => s.attempts).sort((x, y) => ((x.t || x.date)).localeCompare(y.t || y.date));
    u.started = u.attempts.length > 0;
    u.firstDate = u.started ? u.attempts[0].date : null;
    u.lastDate = u.started ? u.attempts[u.attempts.length - 1].date : null;
    u.wonDate = u.done ? u.scen.reduce((m, s) => (s.wonOn > m ? s.wonOn : m), '') : null;
  });
  const current = units.find(u => !u.done && u.released) || null;
  const nextScen = current ? (current.scen.find(s => !s.won) || null) : null;
  const curWave = current ? current.wave : (units.length ? units[units.length - 1].wave : 1);

  // the box in front of you: who drew and spun what, and the strikes
  const st = { cat, units, heroes, heroById, attempts: attempts.filter(x => x.scen), allAttempts: attempts, problems: [],
    current, nextScen, curWave, today,
    rulesIdx: Math.max(0, units.findIndex(x => x.code === GAUNTLET.rulesFrom)),
    poolWave: (heroById.deadpool || {}).wave || 7 };
  const draft = _gtDraft(st);
  st.draft = draft;
  st.strikes = draft ? draft.strikes : 0;
  const inPlay = new Set(), burned = new Set();
  if (draft) for (const p of GAUNTLET.players) {
    const sl = draft.slots[p];
    if (sl.hero) inPlay.add(sl.hero.id);
    sl.burnedHeroes.forEach(h => burned.add(h.id));
  }
  st.inPlay = inPlay;

  // heroes: who played them where, and what that means now
  for (const h of heroes) {
    const first = h.uses[0];
    const picker = draft && GAUNTLET.players.find(p => draft.slots[p].hero === h);
    h.spentIn = first ? first.unit : picker ? current : null;
    h.by = first ? first.player : picker || null;
    h.wins = h.uses.filter(u => u.a.won).length;
    if (inPlay.has(h.id)) h.status = 'play';
    else if (burned.has(h.id)) h.status = 'fallen';
    else if (h.uses.length) h.status = h.wins ? 'spent' : 'fallen';
    else if (!h.released) h.status = 'upcoming';
    else if (h.wave > curWave) h.status = 'locked';
    else h.status = 'pool';
    // a hero played again in a later unit, or before their wave
    const units2 = [...new Set(h.uses.map(u => u.unit))];
    if (units2.length > 1) problems.push({ kind: 'reuse', text: `${h.name} was spent in ${units2[0].name} but played again in ${units2.slice(1).map(u => u.name).join(', ')}.` });
    h.uses.filter(u => h.wave > u.unit.wave).slice(0, 1).forEach(u => problems.push({ kind: 'early', text: `${h.name} (wave ${h.wave}) was played in ${u.unit.name}, wave ${u.unit.wave}: a time-travel borrow.` }));
  }
  st.problems = [...new Set([...problems.map(x => x.text), ...st.problems])];
  return st;
}

// ── small pieces ──
function _gtImg(src, cls, alt) {
  return src ? `<img class="${cls}" src="${_escapeHtml(src)}" alt="${_escapeHtml(alt || '')}" loading="lazy" decoding="async">`
    : `<span class="${cls} gt-noimg">${_escapeHtml((alt || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 3))}</span>`;
}
function _gtWho(name) {
  const cls = name === GAUNTLET.players[0] ? 'gt-p0' : 'gt-p1';
  return `<span class="gt-who ${cls}" title="${_escapeHtml(name)}">${GAUNTLET.short[name] || name[0]}</span>`;
}
function _gtAspectChip(a, extra = '') {
  const k = String(a || '').toLowerCase().replace(/[^a-z]/g, '');
  return `<span class="gt-asp gt-asp-${k}${extra}">${_escapeHtml(a)}</span>`;
}
function _gtWrBar(wr, n, label) {
  if (wr == null) return '';
  const tone = wr >= 0.7 ? 'easy' : wr >= 0.5 ? 'mid' : wr >= 0.35 ? 'hard' : 'brutal';
  return `<span class="gt-wr gt-wr-${tone}" title="${label || 'Community win rate'}${n ? ` · about ${n.toLocaleString('en')} games` : ''}">
    <span class="gt-wr-bar"><i style="width:${Math.round(wr * 100)}%"></i></span><b>${_gtPct(wr)}</b></span>`;
}
function _gtDifficultyWord(wr) {
  if (wr == null) return '';
  return wr >= 0.75 ? 'one of the gentler ones' : wr >= 0.6 ? 'about average' : wr >= 0.45 ? 'a hard one' : wr >= 0.3 ? 'very hard' : 'one of the hardest';
}
function _gtHeroBest(h) {
  const asp = Object.entries(h.aspects || {}).filter(([k, v]) => v.n >= 40 && k !== "'pool");
  if (!asp.length) return null;
  asp.sort((a, b) => b[1].wr - a[1].wr);
  return { aspect: asp[0][0][0].toUpperCase() + asp[0][0].slice(1), ...asp[0][1] };
}
function _gtHeroAspectWr(h, aspect) {
  const x = (h.aspects || {})[String(aspect).toLowerCase()];
  return x && x.n >= 20 ? x : null;
}
const GT_STATUS = {
  spent: ['Spent', 'Played and won with; gone for the rest of the run'],
  fallen: ['Fallen', 'Played and never won with; gone'],
  play: ['In play', 'Playing the current box or pack'],
  pool: ['Available', 'Released and unlocked; not played yet'],
  locked: ['Next waves', 'Unlocks when you reach their wave'],
  upcoming: ['Not out yet', 'Announced, not released'],
};

// ── the big progress bar: every scenario of the run, box by box ──
function _gtProgressHtml(st) {
  const segs = st.units.map(u => {
    const cells = u.scen.map(s => {
      const cur = s === st.nextScen;
      const cls = s.won ? (s.tries === 1 ? 'won1' : 'won') : s.attempts.length ? 'lost' : !u.released ? 'future' : 'todo';
      return `<i class="gt-cell gt-${cls}${cur ? ' gt-cur' : ''}" title="${_escapeHtml(s.name)}${s.won ? ` · won ${_gtFmtDate(s.wonOn)}${s.tries > 1 ? ` (try ${s.tries})` : ''}` : s.attempts.length ? ` · ${s.attempts.length} loss${s.attempts.length > 1 ? 'es' : ''}` : ''}"></i>`;
    }).join('');
    return `<span class="gt-seg${u === st.current ? ' gt-seg-cur' : ''}${u.done ? ' gt-seg-done' : ''}" style="flex:${u.scen.length} 1 0" data-gt-unit="${u.idx}">${cells}</span>`;
  }).join('');
  // waves under the bar, as wide as their scenarios
  const waves = [];
  st.units.forEach(u => {
    const w = waves[waves.length - 1];
    if (w && w.wave === u.wave) w.n += u.scen.length; else waves.push({ wave: u.wave, n: u.scen.length });
  });
  const waveRow = waves.map(w => `<span class="gt-wave-lbl${w.wave === st.curWave ? ' cur' : ''}" style="flex:${w.n} 1 0">${w.wave}</span>`).join('');
  const released = st.units.filter(u => u.released).flatMap(u => u.scen);
  const won = released.filter(s => s.won).length;
  const all = st.units.flatMap(u => u.scen).length;
  return `
    <div class="gt-progress">
      <div class="gt-prog-head">
        <div class="gt-prog-big">${_gtPct(released.length ? won / released.length : 0)}</div>
        <div class="gt-prog-sub"><b>${won}</b> of ${released.length} scenarios beaten${all > released.length ? ` · ${all - released.length} more announced` : ''}<br>
          Wave <b>${st.curWave}</b> of ${st.units.length ? st.units[st.units.length - 1].wave : 0} · box ${st.current ? st.current.idx + 1 : st.units.length} of ${st.units.length}</div>
      </div>
      <div class="gt-bar">${segs}</div>
      <div class="gt-waves"><span class="gt-waves-lbl">Wave</span>${waveRow}</div>
      <div class="gt-legend">
        <span><i class="gt-cell gt-won1"></i>First try</span><span><i class="gt-cell gt-won"></i>Won</span>
        <span><i class="gt-cell gt-lost"></i>Lost so far</span><span><i class="gt-cell gt-todo"></i>To play</span>
        <span><i class="gt-cell gt-future"></i>Not out yet</span>
      </div>
    </div>`;
}

// Every hero as a small picture, outlined by where they stand in the run.
function _gtHeroBarHtml(st) {
  const order = ['play', 'spent', 'fallen', 'pool', 'locked', 'upcoming'];
  const counts = Object.fromEntries(order.map(k => [k, st.heroes.filter(h => h.status === k).length]));
  const faces = order.flatMap(k => st.heroes.filter(h => h.status === k).map(h =>
    `<button type="button" class="gt-face gt-h-${k}" data-gt-hero="${_escapeHtml(h.id)}" title="${_escapeHtml(h.name)}${h.alter && h.alter !== h.name ? ` (${_escapeHtml(h.alter)})` : ''} · ${GT_STATUS[k][0]}">${_gtImg(h.img, 'gt-face-img', h.name)}</button>`)).join('');
  return `
    <div class="gt-herobar">
      <div class="gt-hb-head"><span>Heroes</span><span>${counts.spent + counts.fallen + counts.play} of ${st.heroes.length} used</span></div>
      <div class="gt-faces">${faces}</div>
      <div class="gt-legend">${order.filter(k => counts[k]).map(k => `<span><i class="gt-hcell gt-h-${k}"></i>${GT_STATUS[k][0]} ${counts[k]}</span>`).join('')}</div>
    </div>`;
}

// How many heroes can still fall before the pool runs dry, wave by wave.
function _gtBank(st) {
  const maxWave = st.units.length ? st.units[st.units.length - 1].wave : 1;
  const used = st.heroes.filter(h => h.uses.length).length;
  const unitsDone = st.units.filter(u => u.done || u === st.current).length;
  let tight = null;
  for (let w = st.curWave; w <= maxWave; w++) {
    const pool = st.heroes.filter(h => h.wave <= w).length;
    const unitsTo = st.units.filter(u => u.wave <= w).length;
    // heroes still needed: two for every unit not yet started, up to this wave
    const need = 2 * (unitsTo - unitsDone);
    const spare = pool - used - need;
    if (!tight || spare < tight.spare) tight = { wave: w, spare };
  }
  return tight;
}

// ── Run tab: where you are and what's next ──
function _gtRunHtml(st) {
  const esc = _escapeHtml;
  let html = _gtProgressHtml(st);
  const u = st.current, s = st.nextScen;
  if (u && s) {
    const vill = s.villains && s.villains.length ? s.villains.join(', ') : '';
    const pos = `${u.scen.indexOf(s) + 1} of ${u.scen.length}`;
    const strikeText = st.strikes === 1 ? 'Strike 1 of 2: your aspects burned. Spin again; one more loss burns your heroes.' : '';
    html += `
      <div class="gt-next" data-gt-scen="${esc(s.key)}">
        ${_gtImg(s.img, 'gt-next-img', s.name)}
        <div class="gt-next-body">
          <div class="gt-kicker">Up next · ${esc(u.name)} · ${pos}</div>
          <div class="gt-next-title">${esc(s.name)}</div>
          ${vill && vill !== s.name ? `<div class="gt-next-line">${esc(vill)}</div>` : ''}
          ${s.modulars && s.modulars.length ? `<div class="gt-next-line gt-dim">Modular: ${esc(s.modulars.join(', '))}</div>` : ''}
          ${s.wr != null ? `<div class="gt-next-line">${_gtWrBar(s.wr, s.n, 'Community win rate on Expert')} <span class="gt-dim">on Expert, ${_gtDifficultyWord(s.wr)}</span></div>` : ''}
          ${strikeText ? `<div class="gt-strikes">${Array.from({ length: GAUNTLET.strikes }, (_, i) => `<i class="${i < st.strikes ? 'on' : ''}"></i>`).join('')}<span>${strikeText}</span></div>` : ''}
        </div>
      </div>`;
    if (st.draft) html += _gtDraftHtml(st, st.draft);
  } else if (!u) {
    html += `<div class="gt-next gt-next-done"><div class="gt-next-body"><div class="gt-kicker">All caught up</div>
      <div class="gt-next-title">Every released scenario is beaten</div>
      <div class="gt-next-line gt-dim">The next box joins the run the day it comes out.</div></div></div>`;
  }
  html += _gtHeroBarHtml(st);

  // the run so far, box by box
  const recent = st.units.filter(x => x.started).slice(-4).reverse();
  if (recent.length) {
    html += `<div class="gt-sec">The run so far</div>` + recent.map(x => _gtUnitRowHtml(st, x)).join('')
      + `<button type="button" class="gt-more" data-gt-tab="villains">Every box and scenario ›</button>`;
  }
  const bank = _gtBank(st);
  if (bank) {
    const pairs = Math.max(0, Math.floor(bank.spare / 2));
    html += `<div class="gt-note"><b>Hero bank.</b> ${bank.spare >= 0
      ? `With every hero you'll need set aside, ${bank.spare} spare hero${bank.spare === 1 ? '' : 'es'} remain at the tightest point (wave ${bank.wave}): ${pairs} pair${pairs === 1 ? '' : 's'} can fall before you'd have to time-travel.`
      : `You're ${-bank.spare} hero${bank.spare === -1 ? '' : 'es'} short by wave ${bank.wave}: time travel ahead.`}</div>`;
  }
  if (st.problems.length) {
    html += `<div class="gt-warn"><b>Check the log</b><ul>${st.problems.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`;
  }
  const fixes = st.attempts.filter(a => a.fix);
  if (fixes.length) {
    html += `<div class="gt-note">${fixes.map(a => `<b>${esc(a.scen.name)}, ${_gtFmtDate(a.date)}:</b> counted as a ${a.won ? 'win' : 'loss'}. ${esc(a.fix.note)}`).join('<br>')}</div>`;
  }
  html += _gtRadarHtml(st);
  return html;
}

// The box's draft: each player draws three heroes from the pool and picks
// one, then spins the wheel for their aspect. Either of you can tap for
// either (you're at the same table); anyone else sees it read-only.
function _gtDraftHtml(st, d) {
  const esc = _escapeHtml;
  if (_gtEvents === null) return `<div class="gt-draft"><div class="gt-draft-sub">Loading the draw…</div></div>`;
  const me = _gtCanAct();
  const u = d.unit;
  const pool = st.heroes.filter(h => h.status === 'pool').length;
  const col = (p) => {
    const sl = d.slots[p];
    let body = '';
    if (sl.need === 'draw') {
      body = me ? `<button type="button" class="gt-act" data-gt-draw="${esc(p)}">Draw 3 heroes</button>` : `<div class="gt-draft-note">Waiting for ${esc(p)} to draw.</div>`;
      body += `<div class="gt-draft-note">Fate deals three of the ${pool} heroes in the pool.</div>`;
    } else if (sl.need === 'pick') {
      const sel = _gtSel[p] && sl.offer.find(h => h.id === _gtSel[p]);
      body = `<div class="gt-offer">${sl.offer.map(h => {
        const best = _gtHeroBest(h);
        return `<button type="button" class="gt-ocard${sel === h ? ' on' : ''}" data-gt-sel="${esc(p)}|${esc(h.id)}">
          ${_gtImg(h.img, 'gt-ocard-img', h.name)}
          <span class="gt-ocard-name">${esc(h.name)}</span>
          ${h.wr != null ? `<span class="gt-ocard-wr">${_gtPct(h.wr)} wins</span>` : ''}
          ${best ? `<span class="gt-ocard-best">${_gtAspectChip(best.aspect)}</span>` : ''}
        </button>`;
      }).join('')}</div>`;
      body += sel
        ? `${me ? `<button type="button" class="gt-act" data-gt-pick="${esc(p)}">Play ${esc(sel.name)}</button>` : ''}<button type="button" class="gt-link" data-gt-hero="${esc(sel.id)}">About ${esc(sel.name)} ›</button>`
        : `<div class="gt-draft-note">${me ? 'Tap the hero you\'ll play.' : `Waiting for ${esc(p)} to pick.`} The chip is the aspect they win most with.</div>`;
    } else {
      const h = sl.hero;
      body = `<button type="button" class="gt-dhero" data-gt-hero="${esc(h.id)}"><span class="gt-dhero-face">${_gtImg(h.img, 'gt-dhero-img', h.name)}</span><span>${esc(h.name)}${h.name === 'Spider-Man' || h.name === 'Black Panther' ? ` <small>${esc(h.alter)}</small>` : ''}</span></button>`;
      if (sl.need === 'spin') {
        const w = _gtWheel(st, d, p);
        body += `${_gtWheelSvg(p, w.opts)}
          ${me ? `<button type="button" class="gt-act gt-act-spin" data-gt-spin="${esc(p)}" data-opts="${esc(w.opts.join('|'))}">Spin the wheel</button>` : `<div class="gt-draft-note">Waiting for ${esc(p)} to spin.</div>`}
          ${w.off.length ? `<div class="gt-draft-note">Not on the wheel: ${w.off.map(([a, why]) => `${esc(a)}${why ? ` (${esc(why)})` : ''}`).join(', ')}.</div>` : ''}`;
      } else {
        body += `<div class="gt-pair-asp">${h.id === 'warlock' ? _gtAspectChip('All four') : sl.aspects.map(a => _gtAspectChip(a)).join('')}</div>`;
        if (h.id === 'spider_woman') body += `<div class="gt-draft-note">Spider-Woman: add a second aspect of your choice.</div>`;
        if (GT_WILDCARDS.has(h.id)) body += `<div class="gt-draft-note">${esc(h.name)} skips the wheel.</div>`;
      }
    }
    const burned = [
      ...sl.burnedAspects.map(a => `<span class="gt-burn">${esc(a)}</span>`),
      ...sl.burnedHeroes.map(h => `<span class="gt-burn">${esc(h.name)}</span>`),
    ].join('');
    return `<div class="gt-draft-col">
      <div class="gt-draft-head">${_gtWho(p)} ${esc(p)}</div>
      ${body}
      ${burned ? `<div class="gt-burned">Burned in this box: ${burned}</div>` : ''}
    </div>`;
  };
  const ready = GAUNTLET.players.every(p => !d.slots[p].need);
  const title = ready ? `Your heroes for ${u.name}` : GAUNTLET.players.some(p => d.slots[p].need === 'spin') && GAUNTLET.players.every(p => d.slots[p].hero) ? `Spin for ${u.name}` : `Draw for ${u.name}`;
  return `<div class="gt-draft">
    <div class="gt-draft-title">${esc(title)}</div>
    ${ready ? '' : `<div class="gt-draft-sub">${me ? 'Draw three heroes, pick one, then spin the wheel for your aspect. What the wheel says is saved for both of you.' : `Log in as ${GAUNTLET.players.map(esc).join(' or ')} to draw and spin.`}</div>`}
    <div class="gt-draft-cols">${GAUNTLET.players.map(col).join('')}</div>
  </div>`;
}

// The aspect wheel, segment 0 at the top. Spinning turns the whole wheel so
// the chosen segment stops under the pointer.
function _gtWheelSvg(p, opts) {
  const n = opts.length, R = 74, seg = 360 / n;
  const pt = (deg, r) => [(r * Math.sin(deg * Math.PI / 180)).toFixed(2), (-r * Math.cos(deg * Math.PI / 180)).toFixed(2)];
  const parts = opts.map((a, i) => {
    const k = a.replace(/'/g, '').toLowerCase();
    const [x0, y0] = pt(i * seg - seg / 2, R), [x1, y1] = pt(i * seg + seg / 2, R);
    const shape = n === 1 ? `<circle r="${R}" class="gt-wseg gt-asp-bg-${k}"/>`
      : `<path d="M0 0 L${x0} ${y0} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z" class="gt-wseg gt-asp-bg-${k}"/>`;
    return `${shape}<text class="gt-wlbl gt-wlbl-${k}" transform="rotate(${(i * seg).toFixed(2)}) translate(0 ${(-R * 0.6).toFixed(1)})">${_escapeHtml(a)}</text>`;
  }).join('');
  return `<div class="gt-wheel-wrap"><span class="gt-wheel-ptr"></span>
    <svg class="gt-wheel" data-gt-wheel="${_escapeHtml(p)}" viewBox="-80 -80 160 160" aria-label="Aspect wheel">${parts}<circle r="9" class="gt-whub"/></svg></div>`;
}

function _gtUnitRowHtml(st, u) {
  const esc = _escapeHtml;
  const pairs = [];
  u.attempts.forEach(a => a.picks.forEach(pk => pk.heroes.forEach(h => {
    if (!pairs.some(x => x.h === h)) pairs.push({ h, player: pk.player, aspects: pk.aspects });
  })));
  const draft = u === st.current && st.draft ? GAUNTLET.players.map(p => st.draft.slots[p]).filter(sl => sl.hero) : [];
  const state = u.done ? `<span class="gt-tag gt-tag-done">Beaten ${_gtFmtDate(u.wonDate, false)}</span>`
    : u === st.current ? `<span class="gt-tag gt-tag-cur">Now</span>`
    : !u.released ? `<span class="gt-tag">Out ${_gtFmtDate(u.date)}</span>` : '';
  const scen = u.scen.map(s => {
    const cls = s.won ? (s.tries === 1 ? 'won1' : 'won') : s.attempts.length ? 'lost' : !u.released ? 'future' : 'todo';
    const res = s.won ? (s.tries > 1 ? `won on try ${s.tries}` : 'won first try') : s.attempts.length ? `${s.attempts.length} loss${s.attempts.length > 1 ? 'es' : ''}` : '';
    return `<button type="button" class="gt-srow" data-gt-scen="${esc(s.key)}">
      <i class="gt-cell gt-${cls}${s === st.nextScen ? ' gt-cur' : ''}"></i>
      <span class="gt-srow-name">${esc(s.name)}${s.final ? ' <span class="gt-dim">(finale)</span>' : ''}</span>
      <span class="gt-srow-res">${res}</span>
      ${s.wr != null ? _gtWrBar(s.wr, s.n, 'Community win rate on Expert') : '<span class="gt-wr gt-wr-none">–</span>'}
    </button>`;
  }).join('');
  return `<div class="gt-unit${u === st.current ? ' cur' : ''}${u.done ? ' done' : ''}">
    <div class="gt-unit-head">
      <div><div class="gt-unit-name">${esc(u.name)}</div>
      <div class="gt-unit-meta">${{ core: 'Core Set', campaign: 'Campaign box', scenario: 'Scenario pack' }[u.type] || ''} · ${_gtFmtDate(u.date)}</div></div>
      ${state}
    </div>
    ${pairs.length ? `<div class="gt-unit-heroes">${pairs.map(x => `<button type="button" class="gt-hchip" data-gt-hero="${esc(x.h.id)}">${_gtWho(x.player)}${esc(x.h.name)}${x.aspects.length ? ` <span class="gt-dim">${esc(x.aspects.join('/'))}</span>` : ''}</button>`).join('')}</div>`
      : draft.length ? `<div class="gt-unit-heroes">${draft.map(sl => `<button type="button" class="gt-hchip" data-gt-hero="${esc(sl.hero.id)}">${_gtWho(sl.player)}${esc(sl.hero.name)}${sl.aspects.length ? ` <span class="gt-dim">${esc(sl.aspects.join('/'))}</span>` : ''}</button>`).join('')}</div>` : ''}
    ${u.note ? `<div class="gt-unit-note">${esc(u.note)}</div>` : ''}
    <div class="gt-srows">${scen}</div>
  </div>`;
}

// What's coming out, and when the run reaches it.
function _gtRadarHtml(st) {
  const esc = _escapeHtml;
  const soon = (typeof MC_PRODUCTS !== 'undefined' ? MC_PRODUCTS : []).filter(p => p.date > st.today);
  if (!soon.length) return '';
  return `<div class="gt-sec">Coming out</div><div class="gt-radar">${soon.map(p => {
    const days = _gtDays(st.today, p.date);
    const list = p.heroes.length ? p.heroes.map(h => h.name).join(', ') : p.scenarios.map(s => s.name).join(', ');
    const what = p.note || (list !== p.name ? list : '');
    return `<div class="gt-radar-row"><span class="gt-radar-days">${days < 60 ? `${days}d` : `${Math.round(days / 30)}mo`}</span>
      <span><b>${esc(p.name)}</b> <span class="gt-dim">· ${p.heroes.length ? 'hero pack' : p.type === 'campaign' ? 'campaign box' : 'scenario pack'} · wave ${p.wave} · ~${_gtFmtDate(p.date)}</span>${what ? `<br><span class="gt-dim">${esc(what)}</span>` : ''}</span></div>`;
  }).join('')}</div>`;
}

// ── Heroes tab: every hero by wave ──
function _gtHeroesHtml(st) {
  const esc = _escapeHtml;
  const filt = { all: () => true, pool: h => h.status === 'pool', spent: h => ['spent', 'fallen', 'play'].includes(h.status), locked: h => h.status === 'locked' || h.status === 'upcoming' };
  const chips = [['all', 'All'], ['pool', 'Available'], ['spent', 'Used'], ['locked', 'Later']].map(([k, l]) =>
    `<button type="button" class="gt-filter${_gtHeroFilter === k ? ' active' : ''}" data-gt-hf="${k}">${l} ${st.heroes.filter(filt[k]).length}</button>`).join('');
  const waves = [...new Set(st.heroes.map(h => h.wave))];
  const body = waves.map(w => {
    const hs = st.heroes.filter(h => h.wave === w && filt[_gtHeroFilter](h));
    if (!hs.length) return '';
    const box = st.units.find(u => u.wave === w);
    return `<div class="gt-sec">Wave ${w}${box ? ` · ${esc(box.name)}` : ''}${w === st.curWave ? ' <span class="gt-tag gt-tag-cur">Now</span>' : ''}</div>
      <div class="gt-hgrid">${hs.map(h => {
        const best = _gtHeroBest(h);
        return `<button type="button" class="gt-hcard gt-hs-${h.status}" data-gt-hero="${esc(h.id)}">
          ${_gtImg(h.img, 'gt-hcard-img', h.name)}
          ${h.by ? `<span class="gt-hcard-by">${_gtWho(h.by)}</span>` : ''}
          <span class="gt-hcard-badge">${h.status === 'spent' ? '✓' : h.status === 'fallen' ? '✗' : h.status === 'play' ? '▶' : h.status === 'locked' ? '🔒' : h.status === 'upcoming' ? _gtFmtDate(h.date, false) : ''}</span>
          <span class="gt-hcard-name">${esc(h.name)}${h.name === 'Spider-Man' || h.name === 'Black Panther' ? `<small>${esc(h.alter)}</small>` : ''}</span>
          ${h.status === 'pool' && best ? `<span class="gt-hcard-best">${_gtAspectChip(best.aspect)}</span>` : h.spentIn ? `<span class="gt-hcard-where">${esc(h.spentIn.name.replace(/^The /, ''))}</span>` : ''}
        </button>`;
      }).join('')}</div>`;
  }).join('');
  return `<div class="gt-filters">${chips}</div>${body}
    <div class="lb-explain">The badge on an available hero is the aspect they win most with on Marvel Champions Tracker. Tap a hero for their numbers and history.</div>`;
}

// ── Villains tab: every box and scenario ──
function _gtVillainsHtml(st) {
  let html = '', w = 0;
  for (const u of st.units) {
    if (u.wave !== w) {
      w = u.wave;
      const heroes = st.heroes.filter(h => h.wave === w).length;
      html += `<div class="gt-wavehead"><span>Wave ${w}</span><span class="gt-dim">${heroes} new heroes</span></div>`;
    }
    html += _gtUnitRowHtml(st, u);
  }
  return html + `<div class="lb-explain">The bar on each scenario is how often players win it on Expert, from about ${Math.round(st.units.flatMap(u => u.scen).reduce((n, s) => n + (s.n || 0), 0) / 1000)} thousand Expert games logged on Marvel Champions Tracker (as of ${_gtFmtDate(typeof MC_STATS_DATE !== 'undefined' ? MC_STATS_DATE : '')}).</div>`;
}

// ── Stats tab ──
function _gtStatsHtml(st) {
  const esc = _escapeHtml;
  const at = st.attempts;
  const wins = at.filter(a => a.won).length;
  const beaten = st.units.flatMap(u => u.scen).filter(s => s.won);
  const firstTry = beaten.filter(s => s.tries === 1).length;
  const sessions = new Set(at.map(a => a.date)).size;
  const days = Math.max(1, _gtDays(GAUNTLET.start, st.today));
  // legend score: 3 for a first-try win, 2 for the second try, 1 for the third
  const score = beaten.reduce((n, s) => n + Math.max(1, 4 - s.tries), 0);
  const expected = at.reduce((n, a) => n + (a.scen.wr != null ? a.scen.wr : 0.5), 0);
  const released = st.units.filter(u => u.released).flatMap(u => u.scen);
  const left = released.filter(s => !s.won).length;
  const perMonth = beaten.length / (days / 30.44);
  const eta = perMonth > 0 ? new Date(Date.now() + (left / perMonth) * 30.44 * 86400000).toISOString().slice(0, 10) : null;
  const yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
  const releasedYear = st.units.filter(u => u.date > yearAgo && u.date <= st.today).reduce((n, u) => n + u.scen.length, 0);
  const tiles = [
    [`${wins}–${at.length - wins}`, 'Wins–losses'],
    [at.length ? _gtPct(wins / at.length) : '–', 'Win rate'],
    [`${firstTry}/${beaten.length}`, 'First-try wins'],
    [`${score}`, `Legend score / ${beaten.length * 3}`],
    [`${sessions}`, 'Game nights'],
    [`${days}`, 'Days in'],
  ].map(([v, l]) => `<div class="gm-tile"><div class="gm-tile-val">${v}</div><div class="gm-tile-label">${l}</div></div>`).join('');
  const odds = wins - expected;

  // aspects each of you has played in the run
  const perPlayer = GAUNTLET.players.map(p => {
    const asp = {}; const heroes = [];
    st.units.forEach(u => {
      const seen = new Set();
      u.attempts.forEach(a => a.picks.filter(pk => pk.player === p).forEach(pk => {
        pk.heroes.forEach(h => { if (!heroes.includes(h)) heroes.push(h); });
        pk.aspects.forEach(x => { if (!seen.has(x)) { seen.add(x); asp[x] = (asp[x] || 0) + 1; } });
      }));
    });
    const max = Math.max(1, ...Object.values(asp));
    return `<div class="gt-pstat">
      <div class="gt-pstat-head">${_gtWho(p)} ${esc(p)}</div>
      ${[...GT_ASPECTS, "'Pool"].filter(a => asp[a] || GT_ASPECTS.includes(a)).map(a => `<div class="gt-abar"><span>${esc(a)}</span><span class="gt-abar-track"><i class="gt-asp-bg-${a.replace(/'/g, '').toLowerCase()}" style="width:${((asp[a] || 0) / max) * 100}%"></i></span><b>${asp[a] || 0}</b></div>`).join('')}
      <div class="gt-pstat-heroes">${heroes.map(h => `<button type="button" class="gt-hchip" data-gt-hero="${esc(h.id)}">${esc(h.name)}</button>`).join('') || '<span class="gt-dim">No heroes yet</span>'}</div>
    </div>`;
  }).join('');

  // the ones that cost you games, and the hardest you've beaten by the community's numbers
  const losses = s => s.attempts.filter(x => !x.won).length;
  const tough = st.units.flatMap(u => u.scen).filter(s => losses(s)).sort((a, b) => losses(b) - losses(a) || (a.wr ?? 1) - (b.wr ?? 1)).slice(0, 3);
  const scalps = beaten.filter(s => s.wr != null).sort((a, b) => a.wr - b.wr).slice(0, 3);
  // the hardest still ahead, by the community's Expert numbers
  const ahead = st.units.flatMap(u => u.scen).filter(s => !s.won && s.wr != null && s.n >= 30).sort((a, b) => a.wr - b.wr).slice(0, 5);

  return `
    <div class="gm-tiles gt-tiles">${tiles}</div>
    <div class="gt-note"><b>Against the odds.</b> Players on Marvel Champions Tracker would expect about ${expected.toFixed(1)} wins from these ${at.length} Expert games; you have ${wins} (${odds >= 0 ? '+' : ''}${odds.toFixed(1)}).</div>
    ${_gtChartHtml(st)}
    <div class="gt-sec">Pace</div>
    <div class="gt-note">${beaten.length} scenario${beaten.length === 1 ? '' : 's'} in ${days} days: about ${perMonth.toFixed(1)} a month.
      ${eta ? ` At that pace the ${left} released scenario${left === 1 ? '' : 's'} still ahead take until about <b>${_gtFmtDate(eta)}</b>.` : ''}
      ${releasedYear ? ` In the last year ${releasedYear} new scenarios came out, ${(releasedYear / 12).toFixed(1)} a month: ${perMonth > releasedYear / 12 ? 'you\'re gaining on them.' : 'they\'re coming out faster than you play them.'}` : ''}</div>
    <div class="gt-sec">You two</div>
    <div class="gt-pstats">${perPlayer}</div>
    ${scalps.length ? `<div class="gt-sec">Best scalps</div>${scalps.map(s => `<button type="button" class="gt-srow" data-gt-scen="${esc(s.key)}"><span class="gt-srow-name">${esc(s.name)}</span><span class="gt-srow-res">${s.tries > 1 ? `try ${s.tries}` : 'first try'}</span>${_gtWrBar(s.wr, s.n, 'Community win rate on Expert')}</button>`).join('')}` : ''}
    ${tough.length ? `<div class="gt-sec">Cost you games</div>${tough.map(s => `<button type="button" class="gt-srow" data-gt-scen="${esc(s.key)}"><span class="gt-srow-name">${esc(s.name)}</span><span class="gt-srow-res">${losses(s)} lost${s.won ? ', then beaten' : ''}</span>${_gtWrBar(s.wr, s.n, 'Community win rate on Expert')}</button>`).join('')}` : ''}
    ${ahead.length ? `<div class="gt-sec">The hardest still ahead</div>${ahead.map(s => `<button type="button" class="gt-srow" data-gt-scen="${esc(s.key)}"><span class="gt-srow-name">${esc(s.name)}</span><span class="gt-srow-res">${esc(s.unit.name)}</span>${_gtWrBar(s.wr, s.n, 'Community win rate on Expert')}</button>`).join('')}` : ''}
    <div class="gt-sec">Every game</div>
    <div class="gt-log">${at.slice().reverse().map(a => `<button type="button" class="gt-logrow" data-gt-scen="${esc(a.scen.key)}">
      <span class="gt-log-date">${_gtFmtDate(a.date)}</span>
      <span class="gt-log-res ${a.won ? 'w' : 'l'}">${a.won ? 'W' : 'L'}</span>
      <span class="gt-log-what"><b>${esc(a.scen.name)}</b>${a.fix ? ' <span class="gt-dim">(corrected)</span>' : ''}<br><span class="gt-dim">${a.picks.map(pk => `${GAUNTLET.short[pk.player]} ${pk.heroes.map(h => h.name).join('+')}${pk.aspects.length ? ` (${pk.aspects.join('/')})` : ''}`).join(' · ')}</span></span>
    </button>`).join('')}</div>`;
}

// Scenarios beaten over time, from the first game to today.
function _gtChartHtml(st) {
  const wins = st.units.flatMap(u => u.scen).filter(s => s.won).map(s => s.wonOn).sort();
  if (!wins.length) return '';
  const W = 320, H = 90, d0 = GAUNTLET.start, span = Math.max(1, _gtDays(d0, st.today));
  const x = d => (Math.max(0, _gtDays(d0, d)) / span) * W;
  // the dashed line is the end of the current wave
  const total = st.units.filter(u => u.released && u.wave <= st.curWave).reduce((n, u) => n + u.scen.length, 0);
  const y = n => H - (n / Math.max(total, wins.length, 1)) * H;
  let pts = `0,${H}`;
  wins.forEach((d, i) => { pts += ` ${x(d).toFixed(1)},${y(i).toFixed(1)} ${x(d).toFixed(1)},${y(i + 1).toFixed(1)}`; });
  pts += ` ${W},${y(wins.length).toFixed(1)}`;
  return `<div class="gt-chart">
    <svg viewBox="0 -4 ${W} ${H + 8}" preserveAspectRatio="none" aria-label="Scenarios beaten over time">
      <line x1="0" y1="0" x2="${W}" y2="0" class="gt-chart-goal"/>
      <polyline points="${pts} ${W},${H}" class="gt-chart-fill"/>
      <polyline points="${pts}" class="gt-chart-line"/>
    </svg>
    <div class="gt-chart-axis"><span>${_gtFmtDate(d0)}</span><span>${wins.length} of ${total} to the end of wave ${st.curWave}</span><span>Today</span></div>
  </div>`;
}

// ── Rules tab ──
function _gtRulesHtml(st) {
  const from = st.units.find(u => u.code === GAUNTLET.rulesFrom);
  return `<div class="gt-rules">
    <div class="gt-rules-title">The Ilioupoli Gauntlet</div>
    <div class="gt-rules-sub">House rules, v2. Δημητρης and Στιβ against every villain, in release order.</div>
    <ol>
      <li><b>Expert, in release order.</b> Every scenario on Expert: villain stages II and III, the Standard and Expert sets, the recommended modular sets. Boxes and packs come in the order they came out.</li>
      <li><b>Waves.</b> A wave starts with the Core Set and with each big box. Every hero released by the end of your current wave is in the pool, along with anyone left over from earlier waves.</li>
      <li><b>Draw three, pick one.</b> Before a box, each of you draws three heroes from the pool and picks one to play the whole box.</li>
      <li><b>Spin for your aspect.</b> Then each of you spins the aspect wheel. You get every aspect before any repeats, never the one you had in the box before, and never the same as the other. 'Pool joins the wheel from wave 7, when Deadpool came out. Adam Warlock and Deadpool skip the wheel; Spider-Woman spins one aspect and picks her second.</li>
      <li><b>Spent on play.</b> A hero is spent the moment they're played, win or lose, and never comes back.</li>
      <li><b>Two strikes.</b> Lose a scenario and both your aspects burn: spin again (a burned aspect can't come back in that box) and replay it. Lose it again and both heroes burn: draw three each, pick, spin, and replay. A win clears the strikes.</li>
      <li><b>Time travel.</b> If the pool can't give you three heroes to draw from, the next wave lends some. A borrowed hero is spent when that wave arrives.</li>
      <li><b>Legend score.</b> A scenario won on the first try is worth 3, on the second 2, after that 1.</li>
    </ol>
    <div class="gt-rules-sub">The draw and the wheel start with ${from ? _escapeHtml(from.name) : 'the next box'}, and the two strikes count losses from ${_gtFmtDate(GAUNTLET.strikesFrom)}; everything before counts as it was played.</div>
    <div class="gt-rules-title gt-rules-title2">Logging a game</div>
    <ul>
      <li>Log it with exactly the two of you, as Marvel Champions.</li>
      <li>Board/scenario: <code>Expert／Absorbing Man／Hydra Patrol</code>. Write the scenario as this app names it; the order doesn't matter.</li>
      <li>Each player's role: <code>Hawkeye／Leadership</code>, the hero you picked and the aspect the wheel gave (Spider-Woman: both aspects).</li>
      <li>Anything the app can't read shows up under “Check the log” on the Run tab.</li>
    </ul>
    <div class="lb-explain">Heroes, scenarios and pictures: <a href="https://marvelcdb.com" target="_blank" rel="noopener">MarvelCDB</a>. Win rates: <a href="https://marvelchampionstracker.com/stats/" target="_blank" rel="noopener">Marvel Champions Tracker</a>. Release dates: Fantasy Flight Games.</div>
  </div>`;
}

// ── sheets ──
function _gtCardUrl(img) {
  const m = String(img || '').match(/cards\/(\w+)\.(?:png|jpg)/);
  return m ? `https://marvelcdb.com/card/${m[1]}` : 'https://marvelcdb.com';
}
function _gtOpenHero(st, id) {
  const esc = _escapeHtml;
  const h = st.heroById[id];
  if (!h) return;
  const stats = [['HP', h.hp], ['Hand', h.hand], ['THW', h.thw], ['ATK', h.atk], ['DEF', h.def], ['REC', h.rec]].filter(x => x[1] != null)
    .map(([l, v]) => `<div class="gt-stat"><b>${v}</b><span>${l}</span></div>`).join('');
  const asp = Object.entries(h.aspects || {}).sort((a, b) => b[1].wr - a[1].wr)
    .map(([k, v]) => `<div class="gt-abar"><span>${esc(k === "'pool" ? "'Pool" : k[0].toUpperCase() + k.slice(1))}</span>${_gtWrBar(v.wr, v.n)}<span class="gt-dim">${v.n.toLocaleString('en')}</span></div>`).join('');
  const uses = h.uses.map(u => `<div class="gt-use">${_gtWho(u.player)} <b>${esc(u.a.scen.name)}</b> <span class="gt-dim">${_gtFmtDate(u.a.date)}${u.aspects.length ? ` · ${esc(u.aspects.join('/'))}` : ''}</span> <span class="gt-log-res ${u.a.won ? 'w' : 'l'}">${u.a.won ? 'W' : 'L'}</span></div>`).join('');
  const [label, desc] = GT_STATUS[h.status];
  openInfoModal(`
    <div class="modal-body gt-sheet">
      <div class="gt-sheet-top">
        ${_gtImg(h.img, 'gt-sheet-card', h.name)}
        <div>
          <div class="modal-title">${esc(h.name)}</div>
          ${h.alter && h.alter !== h.name ? `<div class="modal-designer">${esc(h.alter)}</div>` : ''}
          <div class="gt-sheet-status gt-hs-${h.status}">${label}</div>
          <div class="gt-dim gt-sheet-desc">${desc}${h.by ? ` · ${esc(h.by)}, ${esc(h.spentIn.name)}` : ''}</div>
          <div class="gt-dim gt-sheet-desc">${esc(h.pack)} · wave ${h.wave} · ${_gtFmtDate(h.date)}</div>
          ${h.traits && h.traits.length ? `<div class="gt-traits">${h.traits.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
          ${h.aspectRule ? `<div class="gt-dim gt-sheet-desc">Deck: ${esc(h.aspectRule)}</div>` : ''}
        </div>
      </div>
      ${stats ? `<div class="gt-stats">${stats}</div>` : ''}
      ${h.wr != null ? `<div class="hot-sec">Community</div>
        <div class="gt-note">Won ${_gtPct(h.wr)} of about ${h.n.toLocaleString('en')} logged games on Marvel Champions Tracker, all difficulties.</div>
        ${asp ? `<div class="gt-asps">${asp}</div>` : ''}` : ''}
      ${uses ? `<div class="hot-sec">In the Gauntlet</div>${uses}` : ''}
      <div class="hot-sheet-links"><a class="modal-bgg-link" href="${esc(_gtCardUrl(h.img))}" target="_blank" rel="noopener">Hero card on MarvelCDB ↗</a></div>
    </div>`);
}
function _gtOpenScen(st, key) {
  const esc = _escapeHtml;
  const s = st.units.flatMap(u => u.scen).find(x => x.key === key);
  if (!s) return;
  const u = s.unit;
  const tries = s.attempts.map(a => `<div class="gt-use"><span class="gt-log-res ${a.won ? 'w' : 'l'}">${a.won ? 'W' : 'L'}</span> ${_gtFmtDate(a.date)} <span class="gt-dim">${a.picks.map(pk => `${GAUNTLET.short[pk.player]} ${pk.heroes.map(h => h.name).join('+')}`).join(' · ')}${a.fix ? ' · corrected' : ''}</span></div>`).join('');
  openInfoModal(`
    <div class="modal-body gt-sheet">
      <div class="gt-sheet-top">
        ${_gtImg(s.img, 'gt-sheet-card gt-sheet-villain', s.name)}
        <div>
          <div class="modal-title">${esc(s.name)}</div>
          <div class="modal-designer">${esc(u.name)} · wave ${u.wave} · ${_gtFmtDate(u.date)}</div>
          <div class="gt-sheet-status ${s.won ? 'gt-hs-spent' : s.attempts.length ? 'gt-hs-fallen' : 'gt-hs-pool'}">${s.won ? `Beaten ${_gtFmtDate(s.wonOn)}${s.tries > 1 ? ` on try ${s.tries}` : ', first try'}` : s.attempts.length ? `${s.attempts.length} loss${s.attempts.length > 1 ? 'es' : ''} so far` : u.released ? 'Not played yet' : 'Not out yet'}</div>
          ${s.villains && s.villains.length ? `<div class="gt-sheet-desc"><span class="gt-dim">${s.leader ? 'Leader' : 'Villain'}${s.villains.length > 1 ? 's' : ''}:</span> ${esc(s.villains.join(', '))}</div>` : ''}
          ${s.scheme ? `<div class="gt-sheet-desc"><span class="gt-dim">Opening scheme:</span> ${esc(s.scheme)}</div>` : ''}
          ${s.modulars && s.modulars.length ? `<div class="gt-sheet-desc"><span class="gt-dim">Modular:</span> ${esc(s.modulars.join(', '))}</div>` : ''}
        </div>
      </div>
      ${s.wr != null ? `<div class="hot-sec">On Expert</div><div class="gt-note">${_gtWrBar(s.wr, s.n, 'Community win rate on Expert')} Players win it ${_gtPct(s.wr)} of the time on Expert (about ${s.n.toLocaleString('en')} games), ${_gtDifficultyWord(s.wr)}${s.wrAll != null ? `; ${_gtPct(s.wrAll)} on any difficulty` : ''}.</div>` : ''}
      ${s.contents ? `<div class="hot-sec">Contents</div><div class="gt-note">${esc(s.contents)}</div>` : ''}
      ${s.setup ? `<div class="hot-sec">Setup</div><div class="gt-note">${esc(s.setup)}</div>` : ''}
      ${u.note ? `<div class="gt-note">${esc(u.note)}</div>` : ''}
      ${tries ? `<div class="hot-sec">Your games</div>${tries}` : ''}
      ${s.img ? `<div class="hot-sheet-links"><a class="modal-bgg-link" href="${esc(_gtCardUrl(s.img))}" target="_blank" rel="noopener">Villain on MarvelCDB ↗</a></div>` : ''}
    </div>`);
}

// ── the sub-tab ──
function buildGauntletHtml() {
  if (typeof MC_PRODUCTS === 'undefined') return `<div class="bsv-empty">The Marvel Champions data didn't load.</div>`;
  const st = _gtState();
  _gtState.last = st;
  const tabs = [['run', 'Run'], ['heroes', 'Heroes'], ['villains', 'Villains'], ['stats', 'Stats'], ['rules', 'Rules']];
  const body = { run: _gtRunHtml, heroes: _gtHeroesHtml, villains: _gtVillainsHtml, stats: _gtStatsHtml, rules: _gtRulesHtml }[_gtTab](st);
  return `<div class="gt-root">
    <div class="gt-head">
      <div class="gt-title">The Gauntlet</div>
      <div class="gt-subtitle">Marvel Champions · Expert · ${_gtWho(GAUNTLET.players[0])} ${_escapeHtml(GAUNTLET.players[0])} &amp; ${_gtWho(GAUNTLET.players[1])} ${_escapeHtml(GAUNTLET.players[1])} · since ${_gtFmtDate(GAUNTLET.start)}</div>
    </div>
    <div class="bs-subtabs gt-tabs">${tabs.map(([k, l]) => `<button class="bs-subtab${_gtTab === k ? ' active' : ''}" data-gt-tab="${k}">${l}</button>`).join('')}</div>
    <div class="gt-body">${body}</div></div>`;
}

function wireGauntlet(container, rerender) {
  const st = _gtState.last;
  const root = container.querySelector('.gt-root');
  if (!root) return;
  // the other phone may have drawn or spun since: catch up, then redraw if anything changed
  if (!_gtEvents || Date.now() - _gtEventsAt > 20000) {
    const before = _gtEvents ? _gtEvents.length : -1;
    _gtLoadEvents(true).then(ev => { if (ev.length !== before && document.body.contains(root)) _gtRerender(rerender); });
  }
  root.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-gt-tab],[data-gt-hf],[data-gt-hero],[data-gt-scen],[data-gt-unit],[data-gt-draw],[data-gt-sel],[data-gt-pick],[data-gt-spin]');
    if (!t || !root.contains(t) || t.disabled) return;
    if (t.dataset.gtTab) { if (_gtTab !== t.dataset.gtTab) { _gtTab = t.dataset.gtTab; rerender(); window.scrollTo(0, 0); } return; }
    if (t.dataset.gtHf) { _gtHeroFilter = t.dataset.gtHf; _gtRerender(rerender); return; }
    if (t.dataset.gtDraw) { _gtDraw(t, t.dataset.gtDraw, rerender); return; }
    if (t.dataset.gtSel) { const [p, id] = t.dataset.gtSel.split('|'); _gtSel[p] = id; _gtRerender(rerender); return; }
    if (t.dataset.gtPick) { _gtPick(t, t.dataset.gtPick, rerender); return; }
    if (t.dataset.gtSpin) { _gtSpin(root, t, t.dataset.gtSpin, rerender); return; }
    if (t.dataset.gtHero) { _gtOpenHero(st, t.dataset.gtHero); return; }
    if (t.dataset.gtScen) { _gtOpenScen(st, t.dataset.gtScen); return; }
    if (t.dataset.gtUnit) {
      const u = st.units[Number(t.dataset.gtUnit)];
      const s = u && (u.scen.find(x => x === st.nextScen) || u.scen.find(x => !x.won) || u.scen[0]);
      if (s) _gtOpenScen(st, s.key);
    }
  });
}

// Redraw where you are on the page.
function _gtRerender(rerender) {
  const y = window.scrollY;
  rerender();
  window.scrollTo(0, y);
}

// Before saving a step, fetch what the other phone may have saved: if this
// step was already taken, show that instead of taking it twice.
async function _gtFreshSlot(p) {
  await _gtLoadEvents(true);
  const st = _gtState();
  return st.draft ? { st, d: st.draft, sl: st.draft.slots[p] } : null;
}
function _gtSaveFailed(btn, e) {
  btn.disabled = false;
  btn.textContent = 'Not saved. Try again';
  console.warn('Gauntlet: not saved', e);
}

async function _gtDraw(btn, p, rerender) {
  btn.disabled = true;
  const f = await _gtFreshSlot(p);
  if (!f || f.sl.need !== 'draw') { _gtRerender(rerender); return; }
  // the pool, less whatever the other player is holding or has been offered
  const other = f.d.slots[GAUNTLET.players.find(x => x !== p)];
  const taken = new Set([other.hero, ...(other.offer || [])].filter(Boolean).map(h => h.id));
  const pool = f.st.heroes.filter(h => h.status === 'pool' && !taken.has(h.id));
  // time travel: when the pool runs short, the next wave lends a hand
  if (pool.length < 3) pool.push(...f.st.heroes.filter(h => h.status === 'locked' && h.wave === f.st.curWave + 1 && !taken.has(h.id)));
  const offer = [];
  while (offer.length < 3 && pool.length) offer.push(pool.splice(_gtRandom(pool.length), 1)[0].id);
  try {
    await _gtSaveEvent({ unit: f.d.unit.code, player: p, kind: 'offer', round: f.sl.round, heroes: offer, at: _gtNow(), by: _gtCanAct() });
    _gtRerender(rerender);
  } catch (e) { _gtSaveFailed(btn, e); }
}

async function _gtPick(btn, p, rerender) {
  btn.disabled = true;
  const id = _gtSel[p];
  const f = await _gtFreshSlot(p);
  if (!f || f.sl.need !== 'pick' || !f.sl.offer.some(h => h.id === id)) { _gtRerender(rerender); return; }
  try {
    await _gtSaveEvent({ unit: f.d.unit.code, player: p, kind: 'pick', round: f.sl.round, hero: id, at: _gtNow(), by: _gtCanAct() });
    delete _gtSel[p];
    _gtRerender(rerender);
  } catch (e) { _gtSaveFailed(btn, e); }
}

// The result is drawn and saved before the wheel turns, so closing the page
// mid-spin can't buy a second spin.
async function _gtSpin(root, btn, p, rerender) {
  btn.disabled = true;
  const f = await _gtFreshSlot(p);
  if (!f || f.sl.need !== 'spin') { _gtRerender(rerender); return; }
  const opts = _gtWheel(f.st, f.d, p).opts;
  if (opts.join('|') !== btn.dataset.opts) { _gtRerender(rerender); return; }   // the wheel changed meanwhile
  const k = _gtRandom(opts.length);
  try {
    await _gtSaveEvent({ unit: f.d.unit.code, player: p, kind: 'spin', aspect: opts[k], at: _gtNow(), by: _gtCanAct() });
  } catch (e) { _gtSaveFailed(btn, e); return; }
  btn.textContent = 'Spinning…';
  const wheel = root.querySelector(`[data-gt-wheel="${CSS.escape(p)}"]`);
  const seg = 360 / opts.length;
  const jitter = (Math.random() - 0.5) * seg * 0.6;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!wheel || reduce) { _gtRerender(rerender); return; }
  wheel.style.transition = 'transform 3.8s cubic-bezier(0.15, 0.7, 0.1, 1)';
  wheel.style.transform = `rotate(${360 * 6 - k * seg + jitter}deg)`;
  let done = false;
  const finish = () => { if (done) return; done = true; setTimeout(() => _gtRerender(rerender), 900); };
  wheel.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, 4500);
}
