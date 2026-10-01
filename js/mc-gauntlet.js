// ── Marvel Champions Gauntlet (Ilioupoli Bros) ──
// Δημητρης and Στιβ play every Marvel Champions scenario in release order, on
// Expert, with the heroes released by then; a hero who has been played is
// spent for the rest of the run. Everything here is read from the logged
// plays of the two of them since GAUNTLET.start, matched to the products,
// heroes and scenarios in data/marvel-champions.js (MarvelCDB, with community
// win rates from Marvel Champions Tracker). Nothing is stored: the aspect
// wheel and the hero offers are dealt from fixed seeds, so both of you see
// the same cards.

const GAUNTLET = {
  start: '2025-12-27',
  players: ['Δημητρης', 'Στιβ'],
  short: { 'Δημητρης': 'Δ', 'Στιβ': 'Σ' },
  // House rules v1 (aspect wheel, three strikes) apply from this unit on:
  // Red Skull was already under way when they were written.
  rulesFrom: 'toafk',
  strikes: 3,
  // How a logged play counts, where the log is wrong.
  fixes: [
    { date: '2025-12-27', scen: 'ultron', won: true,
      note: 'Logged as a loss by mistake. Δημητρης\'s own log of that night has it as a win.' },
  ],
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

// A small seeded random generator, so a deal is the same on every phone.
function _gtRng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
function _gtShuffle(a, rng) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

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

// The aspect wheel: from rulesFrom on, each unit deals each player an aspect
// from a personal shuffled bag of the four, never the one they had last
// time, and never the same as the other player's.
function _gtAspectDeal(units) {
  const from = units.findIndex(u => u.code === GAUNTLET.rulesFrom);
  const out = {};
  if (from < 0) return out;
  const rng = _gtRng('ilioupoli-gauntlet-aspect-wheel');
  const bag = {}, last = {};
  GAUNTLET.players.forEach(p => { bag[p] = []; last[p] = null; });
  const refill = (p) => {
    const a = _gtShuffle(GT_ASPECTS.slice(), rng);
    if (a[0] === last[p]) a.push(a.shift());
    bag[p].push(...a);
  };
  for (let i = from; i < units.length; i++) {
    // take turns drawing first
    const order = (i - from) % 2 ? GAUNTLET.players.slice().reverse() : GAUNTLET.players;
    const deal = {};
    for (const p of order) {
      const taken = Object.values(deal);
      if (!bag[p].some(x => !taken.includes(x) && x !== last[p])) refill(p);
      let j = bag[p].findIndex(x => !taken.includes(x) && x !== last[p]);
      if (j < 0) j = bag[p].findIndex(x => !taken.includes(x));
      deal[p] = bag[p].splice(j, 1)[0];
      last[p] = deal[p];
    }
    out[units[i].code] = deal;
  }
  return out;
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
    const a = { date: p.date, t: p.t, won, expert, scen, picks, fix, board: p.b || '', place: p.l || '' };
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

  // heroes: who played them where, and what that means now
  const inPlay = new Set();
  if (current && current.attempts.length) {
    const lastA = current.attempts[current.attempts.length - 1];
    lastA.picks.forEach(pk => pk.heroes.forEach(h => inPlay.add(h.id)));
  }
  for (const h of heroes) {
    const first = h.uses[0];
    h.spentIn = first ? first.unit : null;
    h.by = first ? first.player : null;
    h.wins = h.uses.filter(u => u.a.won).length;
    if (h.uses.length) {
      if (inPlay.has(h.id) && current && h.uses.some(u => u.unit === current)) h.status = 'play';
      else h.status = h.wins ? 'spent' : 'fallen';
    } else if (!h.released) h.status = 'upcoming';
    else if (h.wave > curWave) h.status = 'locked';
    else h.status = 'pool';
    // a hero played again in a later unit, or before their wave
    const units2 = [...new Set(h.uses.map(u => u.unit))];
    if (units2.length > 1) problems.push({ kind: 'reuse', text: `${h.name} was spent in ${units2[0].name} but played again in ${units2.slice(1).map(u => u.name).join(', ')}.` });
    h.uses.filter(u => h.wave > u.unit.wave).slice(0, 1).forEach(u => problems.push({ kind: 'early', text: `${h.name} (wave ${h.wave}) was played in ${u.unit.name}, wave ${u.unit.wave}: a time-travel borrow.` }));
  }

  // the aspect wheel, and whether the logged plays kept to it
  const deal = _gtAspectDeal(units);
  for (const u of units) {
    const d = deal[u.code];
    if (!d) continue;
    for (const a of u.attempts) {
      const asp = a.picks.map(pk => pk.aspects);
      a.picks.forEach(pk => {
        if (pk.heroes.some(h => GT_WILDCARDS.has(h.id)) || !pk.aspects.length) return;
        if (!pk.aspects.includes(d[pk.player])) problems.push({ kind: 'aspect', text: `${pk.player} played ${pk.aspects.join(' + ')} in ${a.scen.name} (${_gtFmtDate(a.date)}); the wheel dealt ${d[pk.player]}.` });
      });
      if (asp[0].length && asp[0].some(x => asp[1].includes(x))) problems.push({ kind: 'aspect', text: `You both played ${asp[0].find(x => asp[1].includes(x))} in ${a.scen.name} (${_gtFmtDate(a.date)}).` });
    }
  }

  // strikes on the scenario in front of you, with the pair playing it
  let strikes = 0;
  if (nextScen) {
    const pair = [...inPlay].sort().join('|');
    for (let i = nextScen.attempts.length - 1; i >= 0; i--) {
      const at = nextScen.attempts[i];
      const p2 = at.picks.flatMap(pk => pk.heroes.map(h => h.id)).sort().join('|');
      if (at.won || (pair && p2 !== pair)) break;
      strikes++;
    }
  }
  const uniq = (arr) => [...new Set(arr)];
  return { cat, units, heroes, heroById, attempts: attempts.filter(a => a.scen), allAttempts: attempts, problems: uniq(problems.map(p => p.text)),
    current, nextScen, curWave, inPlay, deal, strikes, today };
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
  const k = String(a || '').replace(/'/g, '').toLowerCase();
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

function _gtHeroBarHtml(st) {
  const order = ['spent', 'fallen', 'play', 'pool', 'locked', 'upcoming'];
  const counts = Object.fromEntries(order.map(k => [k, st.heroes.filter(h => h.status === k).length]));
  const cells = order.flatMap(k => st.heroes.filter(h => h.status === k).map(h =>
    `<i class="gt-hcell gt-h-${k}" title="${_escapeHtml(h.name)}${h.alter && h.alter !== h.name ? ` (${_escapeHtml(h.alter)})` : ''} · ${GT_STATUS[k][0]}"></i>`)).join('');
  return `
    <div class="gt-herobar">
      <div class="gt-hb-head"><span>Heroes</span><span>${counts.spent + counts.fallen + counts.play} of ${st.heroes.length} used</span></div>
      <div class="gt-hb-cells">${cells}</div>
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
    const pair = u.attempts.length ? u.attempts[u.attempts.length - 1].picks : null;
    const deal = st.deal[u.code];
    const vill = s.villains && s.villains.length ? s.villains.join(', ') : '';
    const pos = `${u.scen.indexOf(s) + 1} of ${u.scen.length}`;
    html += `
      <div class="gt-next" data-gt-scen="${esc(s.key)}">
        ${_gtImg(s.img, 'gt-next-img', s.name)}
        <div class="gt-next-body">
          <div class="gt-kicker">Up next · ${esc(u.name)} · ${pos}</div>
          <div class="gt-next-title">${esc(s.name)}</div>
          ${vill && vill !== s.name ? `<div class="gt-next-line">${esc(vill)}</div>` : ''}
          ${s.modulars && s.modulars.length ? `<div class="gt-next-line gt-dim">Modular: ${esc(s.modulars.join(', '))}</div>` : ''}
          ${s.wr != null ? `<div class="gt-next-line">${_gtWrBar(s.wr, s.n, 'Community win rate on Expert')} <span class="gt-dim">on Expert, ${_gtDifficultyWord(s.wr)}</span></div>` : ''}
          ${st.strikes ? `<div class="gt-strikes">${Array.from({ length: GAUNTLET.strikes }, (_, i) => `<i class="${i < st.strikes ? 'on' : ''}"></i>`).join('')}<span>${st.strikes} loss${st.strikes > 1 ? 'es' : ''} with this pair${st.strikes >= GAUNTLET.strikes ? ': the pair falls, draft two new heroes' : ''}</span></div>` : ''}
        </div>
      </div>`;
    if (pair) {
      html += `<div class="gt-pair">${pair.map(pk => `
        <div class="gt-pair-card">
          ${pk.heroes[0] ? _gtImg(pk.heroes[0].img, 'gt-pair-img', pk.heroes[0].name) : ''}
          <div>${_gtWho(pk.player)} <b>${esc(pk.heroes.map(h => h.name).join(' + ') || '?')}</b></div>
          <div class="gt-pair-asp">${pk.aspects.map(a => _gtAspectChip(a)).join('')}</div>
        </div>`).join('')}</div>`;
    } else {
      html += _gtDraftHtml(st, u, deal);
    }
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

// Choosing the pair for a box: the aspects the wheel dealt, three heroes
// fate offers each of you, and the strongest heroes in your aspect.
function _gtDraftHtml(st, u, deal) {
  const esc = _escapeHtml;
  const pool = st.heroes.filter(h => h.status === 'pool');
  const rng = _gtRng(`ilioupoli-gauntlet-offer:${u.code}`);
  const deck = _gtShuffle(pool.slice(), rng);
  const offers = {};
  GAUNTLET.players.forEach((p, i) => { offers[p] = deck.slice(i * 3, i * 3 + 3); });
  const col = (p) => {
    const asp = deal ? deal[p] : null;
    const best = asp ? pool.map(h => ({ h, x: _gtHeroAspectWr(h, asp) })).filter(o => o.x).sort((a, b) => b.x.wr - a.x.wr).slice(0, 4) : [];
    return `<div class="gt-draft-col">
      <div class="gt-draft-head">${_gtWho(p)} ${esc(p)}${asp ? ` · ${_gtAspectChip(asp)}` : ''}</div>
      <div class="gt-draft-lbl">Fate offers</div>
      <div class="gt-draft-offer">${offers[p].map(h => `<button type="button" class="gt-mini" data-gt-hero="${esc(h.id)}">${_gtImg(h.img, 'gt-mini-img', h.name)}<span>${esc(h.name)}</span></button>`).join('')}</div>
      ${best.length ? `<div class="gt-draft-lbl">Strongest in ${esc(asp)}</div>
        ${best.map(o => `<button type="button" class="gt-best" data-gt-hero="${esc(o.h.id)}"><span>${esc(o.h.name)}</span>${_gtWrBar(o.x.wr, o.x.n, `Community win rate as ${asp}`)}</button>`).join('')}` : ''}
    </div>`;
  };
  return `<div class="gt-draft">
    <div class="gt-draft-title">Pick your heroes for ${esc(u.name)}</div>
    <div class="gt-draft-sub">${pool.length} heroes in the pool. ${deal ? 'Play the aspect the wheel dealt you; ' : ''}take one of fate's offers or anyone else from the pool.</div>
    <div class="gt-draft-cols">${GAUNTLET.players.map(col).join('')}</div>
  </div>`;
}

function _gtUnitRowHtml(st, u) {
  const esc = _escapeHtml;
  const pairs = [];
  u.attempts.forEach(a => a.picks.forEach(pk => pk.heroes.forEach(h => {
    if (!pairs.some(x => x.h === h)) pairs.push({ h, player: pk.player, aspects: pk.aspects });
  })));
  const deal = st.deal[u.code];
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
      : deal ? `<div class="gt-unit-heroes">${GAUNTLET.players.map(p => `<span class="gt-hchip gt-hchip-deal">${_gtWho(p)}${_gtAspectChip(deal[p])}</span>`).join('')}<span class="gt-dim gt-deal-lbl">dealt by the wheel</span></div>` : ''}
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
    <div class="gt-rules-sub">House rules, v1. Δημητρης and Στιβ against every villain, in release order.</div>
    <ol>
      <li><b>Expert, in release order.</b> Every scenario on Expert: villain stages II and III, the Standard and Expert sets, the recommended modular sets. Boxes and packs come in the order they came out.</li>
      <li><b>Waves.</b> A wave starts with the Core Set and with each big box. Every hero released by the end of your current wave is in the pool, along with anyone left over from earlier waves.</li>
      <li><b>One pair per box.</b> Each of you picks one hero for the whole box or pack. You may swap them between you from one scenario to the next.</li>
      <li><b>Spent on play.</b> A hero is spent the moment they're played, win or lose, and never comes back.</li>
      <li><b>Three strikes.</b> Lose, and try the scenario again with the same pair. The third loss in the same scenario and the pair falls: both are spent; draft a new pair from the pool and start that scenario again.</li>
      <li><b>The aspect wheel.</b> For every box the app deals each of you an aspect. Each of you gets all four before any repeats, never the same one twice in a row, and never the same as the other. Adam Warlock and Deadpool ('Pool) ignore the wheel; Spider-Woman takes the dealt aspect plus one of her choice.</li>
      <li><b>Fate's offer.</b> Before a box, the app offers each of you three heroes from the pool. You can take one or pick anyone else in the pool.</li>
      <li><b>Time travel.</b> If the pool can't give you two heroes, borrow from the next wave. A borrowed hero is spent when that wave arrives.</li>
      <li><b>Legend score.</b> A scenario won on the first try is worth 3, on the second 2, after that 1.</li>
    </ol>
    <div class="gt-rules-sub">The wheel and three strikes apply from ${from ? _escapeHtml(from.name) : 'the next box'} on; everything before counts as it was played.</div>
    <div class="gt-rules-title gt-rules-title2">Logging a game</div>
    <ul>
      <li>Log it with exactly the two of you, as Marvel Champions.</li>
      <li>Board/scenario: <code>Expert／Absorbing Man／Hydra Patrol</code>. Write the scenario as this app names it; the order doesn't matter.</li>
      <li>Each player's role: <code>Hawkeye／Leadership</code> (Spider-Woman: both aspects).</li>
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
  const deal = st.deal[u.code];
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
      ${deal ? `<div class="hot-sec">Aspects dealt for ${esc(u.name)}</div><div class="gt-unit-heroes">${GAUNTLET.players.map(p => `<span class="gt-hchip gt-hchip-deal">${_gtWho(p)}${_gtAspectChip(deal[p])}</span>`).join('')}</div>` : ''}
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
  root.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-gt-tab],[data-gt-hf],[data-gt-hero],[data-gt-scen],[data-gt-unit]');
    if (!t || !root.contains(t)) return;
    if (t.dataset.gtTab) { if (_gtTab !== t.dataset.gtTab) { _gtTab = t.dataset.gtTab; rerender(); window.scrollTo(0, 0); } return; }
    if (t.dataset.gtHf) { const y = window.scrollY; _gtHeroFilter = t.dataset.gtHf; rerender(); window.scrollTo(0, y); return; }
    if (t.dataset.gtHero) { _gtOpenHero(st, t.dataset.gtHero); return; }
    if (t.dataset.gtScen) { _gtOpenScen(st, t.dataset.gtScen); return; }
    if (t.dataset.gtUnit) {
      const u = st.units[Number(t.dataset.gtUnit)];
      const s = u && (u.scen.find(x => x === st.nextScen) || u.scen.find(x => !x.won) || u.scen[0]);
      if (s) _gtOpenScen(st, s.key);
    }
  });
}
