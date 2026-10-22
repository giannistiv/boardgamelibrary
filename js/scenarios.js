// ── Scenarios to pick, for games with a fixed set of them (Log a play) ──
// Sky Team's airports and difficulties, The Crew's and Bomb Busters'
// missions, Slay the Spire's bosses and ascensions, Marvel Champions'
// scenarios, Spirit Island's adversaries… are picked from lists instead of
// typed. They're written the way the BG Stats imports write them (the parts
// joined by "／"), which is what each game's board reads: Sky Team's flight
// map, the mission maps (js/progress-boards.js), the ascension ladder, the
// Marvel Champions board and Gauntlet, Spirit Island's ladders, Aeon's End,
// Eternal Decks, Oathsworn's bosses (js/ilioupoli.js).
//
// A game's picker: { fields: [{ key, label, options(vals) → [[value, text, group]],
// optional, show(vals), match(token, value) }], order: keys as written,
// sep: between the parts }. Anything the lists don't cover (a variant, the
// modular sets) is typed in the form's "Anything else" box and kept after them.

const SCEN_SEP = '／';
const _scNorm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9+]/g, '');
const _scNums = (word, n, names) => Array.from({ length: n }, (_, i) =>
  [`${word} ${i + 1}`, names && names[i] ? `${i + 1} · ${names[i]}` : String(i + 1)]);

// Played mission by mission: [what the plays call them, how many, the label]
const SCEN_NUMBERED = {
  284083: ['Mission', 50],               // The Crew: The Quest for Planet Nine
  413246: ['Mission', 66],               // Bomb Busters
  429293: ['Chapter', 18],               // The Fellowship of the Ring: Trick-Taking Game (older plays say "Campaign 5")
  291457: ['Scenario', 25],              // Gloomhaven: Jaws of the Lion
  393672: ['Scenario', 20],              // Gloomhaven: Buttons & Bugs
  209778: ['Scenario', 17],              // Magic Maze
  209010: ['Mission', 10],               // Mechs vs. Minions (and its Tutorial)
  339789: ['Adventure', 8],              // Welcome to the Moon
};
const SCEN_STS_BOSSES = [
  ['Act I', ['Slime Boss', 'The Guardian', 'Hexaghost']],
  ['Act II', ['The Collector', 'Bronze Automaton', 'The Champ']],
  ['Act III', ['Awakened One', 'The Time Eater', 'Donu and Deca']],
  ['Act IV', ['The Heart']],
];
const SCEN_DIFF_NAME = { easy: 'Easy', medium: 'Medium', hard: 'Hard', extreme: 'Extreme' };
// "Mission 5", "Scenario 5", "Chapter 5": BG Stats files don't agree on the word, the number is what counts
const SCEN_NUM = /^(?:mission|scenario|campaign|chapter|adventure)\s*0*(\d+)$/i;

function scenarioPicker(bggId) {
  const id = Number(bggId);
  if (!id) return null;
  const num = SCEN_NUMBERED[id];
  if (num) {
    const [word, n, label] = num;
    const names = typeof PB_NAMES !== 'undefined' ? PB_NAMES[id] : null;
    const extra = id === 209010 ? [['Tutorial', 'Tutorial']] : [];
    return { numbered: word, fields: [{ key: 'm', label: label || word, options: () => [...extra, ..._scNums(word, n, names)],
      match: (t, v) => { const a = t.match(SCEN_NUM), b = v.match(SCEN_NUM); return a && b ? a[1] === b[1] : _scNorm(t) === _scNorm(v); } }] };
  }
  if (typeof SKY_TEAM_BGGID !== 'undefined' && id === SKY_TEAM_BGGID) {
    const cards = typeof SKY_TEAM_AIRPORTS !== 'undefined' ? SKY_TEAM_AIRPORTS : [];
    const code = (s) => String(s).split(/[-–—]/)[0].trim().toUpperCase();
    const rebal = (s) => /rebalanced/i.test(s);
    return { fields: [
      { key: 'airport', label: 'Airport', options: () => {
          const seen = new Set(), out = [];
          for (const a of cards) {
            const v = `${a.code} - ${a.name}`;
            if (seen.has(v)) continue;
            seen.add(v);
            out.push([v, `${a.code} · ${a.name}`, a.exp ? 'Turbulence expansion' : 'Base game']);
          }
          return out;
        },
        match: (t, v) => (code(t) === code(v) || _scNorm(t) === _scNorm(v.split(' - ')[1])) && rebal(t) === rebal(v) },
      { key: 'diff', label: 'Difficulty', options: (vals) => {
          const at = cards.filter(a => vals.airport && `${a.code} - ${a.name}` === vals.airport).map(a => a.diff);
          return (at.length ? at : Object.keys(SCEN_DIFF_NAME)).map(d => [SCEN_DIFF_NAME[d], SCEN_DIFF_NAME[d]]);
        } },
    ] };
  }
  if (typeof SLAY_SPIRE_BGGID !== 'undefined' && id === SLAY_SPIRE_BGGID) {
    return { order: ['asc', 'boss'], fields: [
      { key: 'boss', label: 'Boss', options: () => SCEN_STS_BOSSES.flatMap(([act, bosses]) => bosses.map(b => [`${act} - ${b}`, b, act])) },
      { key: 'asc', label: 'Ascension', optional: true, options: () => _scNums('Ascension', typeof SLAY_SPIRE_ASCENSIONS !== 'undefined' ? SLAY_SPIRE_ASCENSIONS : 10) },
    ] };
  }
  if (typeof MC_BGGID !== 'undefined' && id === MC_BGGID && typeof MC_PRODUCTS !== 'undefined') {
    return { order: ['diff', 'scen'], fields: [
      { key: 'scen', label: 'Scenario', options: () => MC_PRODUCTS.flatMap(p => p.scenarios.map(s => [s.name, s.name, p.name])) },
      { key: 'diff', label: 'Difficulty', optional: true, none: 'Standard', options: () => [['Expert', 'Expert']] },
    ] };
  }
  if (typeof SI_BGGID !== 'undefined' && id === SI_BGGID) {
    return { fields: [
      { key: 'adv', label: 'Adversary', optional: true, options: () => SI_ADVERSARIES.map(a => [a.name, a.name]),
        match: (t, v) => { const a = SI_ADVERSARIES.find(x => x.name === v); return [v, ...((a && a.m) || [])].some(k => _scNorm(k) === _scNorm(t)); } },
      { key: 'lvl', label: 'Level', show: (vals) => !!vals.adv, options: () => Array.from({ length: 7 }, (_, i) => [`Level ${i}`, String(i)]) },
      { key: 'scen', label: 'Scenario', optional: true, options: () => SI_SCENARIOS.map(s => [s.name, s.name]) },
    ] };
  }
  const mu = typeof _muLineFor === 'function' ? _muLineFor(id) : null;
  if (mu) {
    return { fields: [
      { key: 'vil', label: 'Villain', options: () => mu.villains.map(v => [v.name, v.name, v.box]),
        match: (t, v) => typeof _muCanon === 'function' ? _muCanon(t) === _muCanon(v) : _scNorm(t) === _scNorm(v) },
      { key: 'diff', label: 'Challenge', optional: true, none: 'Normal', options: () => [['Moderate', 'Moderate'], ['Heroic', 'Heroic']] },
    ] };
  }
  if (typeof _isAeonsEnd === 'function' && id !== AE_LEGACY_BGGID && _isAeonsEnd(id) && typeof AE_NEMESES !== 'undefined') {
    return { fields: [{ key: 'nem', label: 'Nemesis', options: () => AE_NEMESES.map(n => [n.n, n.n, n.x]) }] };
  }
  if (typeof ED_BGGID !== 'undefined' && id === ED_BGGID) {
    return { fields: [
      { key: 'diff', label: 'Difficulty', options: () => ED_DIFFS.map(d => [d, d]) },
      { key: 'stage', label: 'Stage', options: () => ED_STAGES.flatMap(s => [[`Stage ${s.id}`, `${s.id} · ${s.name}`], [`Stage ${s.id}+`, `${s.id}+ · ${s.name}`]]) },
    ] };
  }
  if (typeof OATHSWORN_BGGID !== 'undefined' && id === OATHSWORN_BGGID) {
    // "Chapter 7 - Boss": the Ilioupoli tab gathers the bosses from these
    return { sep: ' - ', fields: [
      { key: 'ch', label: 'Chapter', options: () => _scNums('Chapter', 21) },
      { key: 'boss', label: 'Boss', optional: true, options: () => (typeof _oathswornBosses === 'function' ? _oathswornBosses() : []).map(b => [b, b]) },
    ] };
  }
  return null;
}

// A play's scenario text → what each list has picked, and what's left over.
function scenarioParse(cfg, text) {
  const vals = {};
  let toks = String(text || '').split(/\s*[／｜|]\s*/).map(t => t.trim()).filter(Boolean);
  if (cfg.sep === ' - ') toks = toks.flatMap(t => t.split(/\s+-\s+/));
  for (const f of cfg.fields) {
    const opts = f.options(vals);
    const i = toks.findIndex(t => opts.some(([v]) => (f.match ? f.match(t, v) : _scNorm(t) === _scNorm(v))));
    if (i < 0) continue;
    const opt = opts.find(([v]) => (f.match ? f.match(toks[i], v) : _scNorm(toks[i]) === _scNorm(v)));
    vals[f.key] = opt[0];
    toks.splice(i, 1);
  }
  return { vals, rest: toks.join(SCEN_SEP) };
}
// …and back: the picks in the game's order, then anything typed.
function scenarioCompose(cfg, vals, rest) {
  const keys = cfg.order || cfg.fields.map(f => f.key);
  const shown = new Set(cfg.fields.filter(f => !f.show || f.show(vals)).map(f => f.key));
  const parts = keys.filter(k => shown.has(k) && vals[k]).map(k => vals[k]);
  const main = parts.join(cfg.sep || SCEN_SEP);
  return [main, String(rest || '').trim()].filter(Boolean).join(SCEN_SEP);
}
// What's missing before the play can be saved (a list that isn't optional).
function scenarioMissing(cfg, vals) {
  const f = cfg.fields.find(x => !x.optional && (!x.show || x.show(vals)) && !vals[x.key]);
  return f ? f.label : '';
}

// A new log of a game played mission by mission: the next one. The mission
// after the furthest you've won, or the one you last lost, if that's later.
function scenarioGuess(bggId, me) {
  const cfg = scenarioPicker(bggId);
  if (!cfg || !cfg.numbered || !me) return null;
  const plays = ((typeof PLAY_HISTORY !== 'undefined' && PLAY_HISTORY[bggId]) || [])
    .filter(p => p && Array.isArray(p.sc) && p.sc.some(s => s.n === me));
  const re = /(?:mission|scenario|campaign|chapter|adventure)\s*(\d+)/i;
  let won = 0, last = null;
  for (const p of plays) {
    const m = String(p.b || '').match(re);
    if (!m) continue;
    const n = Number(m[1]);
    if (p.sc.some(s => s.w)) won = Math.max(won, n);
    const when = (p.t || p.date) + (p.e || '');
    if (!last || when > last.when) last = { n, won: p.sc.some(s => s.w), when };
  }
  const next = last && !last.won && last.n > won ? last.n : won + 1;
  const opt = cfg.fields[0].options({}).find(([v]) => v === `${cfg.numbered} ${next}`);
  return opt ? { m: opt[0] } : null;
}
