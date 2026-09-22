const SKY_TEAM_BGGID = 373106;
const SKY_TEAM_DIFFS = {
  easy:    { label: 'Easy',    color: '#4caf50' },
  medium:  { label: 'Medium',  color: '#e2b04a' },
  hard:    { label: 'Hard',    color: '#e0613a' },
  extreme: { label: 'Extreme', color: '#9b6bff' },
};
const SKY_TEAM_AIRPORTS = [
  // Base game
  { code: 'YUL', name: 'Montréal-Trudeau',       diff: 'easy' },
  { code: 'HND', name: 'Haneda',                 diff: 'easy' },
  { code: 'ATL', name: 'Hartsfield-Jackson',     diff: 'easy' },
  { code: 'LHR', name: 'Heathrow',               diff: 'easy' },
  { code: 'OSL', name: 'Gardermoen',             diff: 'easy' },
  { code: 'PRG', name: 'Václav Havel',           diff: 'easy' },
  { code: 'LHR', name: 'Heathrow',               diff: 'medium' },
  { code: 'GIG', name: 'Galeão',                 diff: 'medium' },
  { code: 'PRG', name: 'Václav Havel',           diff: 'medium' },
  { code: 'TGU', name: 'Toncontín',              diff: 'medium' },
  { code: 'KEF', name: 'Keflavík',               diff: 'medium' },
  { code: 'KUL', name: 'Kuala Lumpur',           diff: 'medium' },
  { code: 'ATL', name: 'Hartsfield-Jackson',     diff: 'medium' },
  { code: 'PBH', name: 'Paro',                   diff: 'hard' },
  { code: 'GIG', name: 'Galeão',                 diff: 'hard' },
  { code: 'TGU', name: 'Toncontín',              diff: 'hard' },
  { code: 'HND', name: 'Haneda',                 diff: 'hard' },
  { code: 'OSL', name: 'Gardermoen',             diff: 'hard' },
  { code: 'KUL', name: 'Kuala Lumpur',           diff: 'extreme' },
  { code: 'KEF', name: 'Keflavík',               diff: 'extreme' },
  { code: 'PBH', name: 'Paro',                   diff: 'extreme' },
  // Expansion
  { code: 'CDG', name: 'Paris–Charles de Gaulle', diff: 'medium',  exp: true },
  { code: 'LGA', name: 'LaGuardia',              diff: 'medium',  exp: true },
  { code: 'DUS', name: 'Düsseldorf',             diff: 'medium',  exp: true },
  { code: 'TER', name: 'Lajes, Açores',          diff: 'medium',  exp: true },
  { code: 'HND', name: 'Haneda (Rebalanced)',    diff: 'hard',    exp: true },
  { code: 'CDG', name: 'Paris–Charles de Gaulle', diff: 'hard',    exp: true },
  { code: 'DUS', name: 'Düsseldorf',             diff: 'extreme', exp: true },
  { code: 'TER', name: 'Lajes, Açores',          diff: 'extreme', exp: true },
  { code: 'LGA', name: 'LaGuardia',              diff: 'extreme', exp: true },
];
const _ST_DIFF_ORDER = ['easy', 'medium', 'hard', 'extreme'];
// Easiest difficulty an airport code is offered at (for old plays that only
// recorded the airport, not the difficulty).
function _skyTeamEasiestDiff(code) {
  const up = String(code).toUpperCase();
  let best = null;
  for (const a of SKY_TEAM_AIRPORTS) {
    if (a.code.toUpperCase() !== up) continue;
    if (best === null || _ST_DIFF_ORDER.indexOf(a.diff) < _ST_DIFF_ORDER.indexOf(best)) best = a.diff;
  }
  return best;
}
function _skyTeamParse(b) {
  if (!b) return null;
  const parts = String(b).split(/[／/]/).map(s => s.trim()).filter(Boolean);
  let diff = null, airport = null;
  for (const part of parts) {
    const low = part.toLowerCase();
    if (SKY_TEAM_DIFFS[low]) diff = low;
    else airport = part;
  }
  if (!airport) return null;
  const code = airport.split(/[-–—]/)[0].trim().toUpperCase();
  if (!code) return null;
  return { diff, code }; // diff may be null for old plays without a difficulty
}
function _skyTeamCompleted(plays) {
  const done = new Set();
  for (const p of (plays || [])) {
    if (!(p.sc || []).some(s => s.w)) continue; // only successful landings count
    const parsed = _skyTeamParse(p.b);
    if (!parsed) continue;
    // Old plays often omitted the difficulty — default to the easiest tier that
    // airport is offered at (per the user's rule for past plays). New plays
    // always specify the difficulty, so this fallback never overrides them.
    const diff = parsed.diff || _skyTeamEasiestDiff(parsed.code);
    if (!diff) continue; // unknown airport code
    done.add(diff + '|' + parsed.code);
  }
  return done;
}
function buildSkyTeamHtml(plays) {
  const done = _skyTeamCompleted(plays);
  const total = SKY_TEAM_AIRPORTS.length;
  let doneCount = 0;
  const groups = { easy: [], medium: [], hard: [], extreme: [] };
  for (const a of SKY_TEAM_AIRPORTS) {
    const isDone = done.has(a.diff + '|' + a.code.toUpperCase());
    if (isDone) doneCount++;
    groups[a.diff].push({ ...a, done: isDone });
  }
  const rows = ['easy', 'medium', 'hard', 'extreme'].map(diff => {
    const list = groups[diff];
    if (!list.length) return '';
    const meta = SKY_TEAM_DIFFS[diff];
    const pills = list.map(a => {
      const cls = 'st-pill' + (a.done ? ' done' : '') + (a.exp ? ' exp' : '');
      const tick = a.done ? '<span class="st-tick">&#10003;</span>' : '';
      const title = `${a.code} · ${a.name}${a.exp ? ' (expansion)' : ''}${a.done ? ' — landed' : ''}`;
      return `<span class="${cls}" style="--d:${meta.color}" title="${title}">${tick}${a.code}</span>`;
    }).join('');
    return `<div class="st-row">
        <span class="st-difflabel" style="--d:${meta.color}">${meta.label}</span>
        <div class="st-pills">${pills}</div>
      </div>`;
  }).join('');
  return `
      <div class="sky-airports">
        <div class="st-head">
          <span class="st-title">&#9992;&#65039; Airports Landed</span>
          <span class="st-count">${doneCount} / ${total}</span>
        </div>
        ${rows}
        <div class="st-legend"><span class="st-exp-dash"></span> dashed = expansion &middot; hover for full name</div>
      </div>`;
}
// ── Slay the Spire: ascension ladder + the Heart ──
// Not a linear campaign — instead you climb 10 ascension levels. An ascension
// is "cleared" when you win a run by beating the Act III boss at that level.
// The Heart (Corrupt Heart, Act IV) is a separate end-game challenge, tracked
// on its own. Plays tag the ascension as "Ascension N" and the act/boss as
// "Act III - <boss>"; the Heart shows up as a tag containing "Heart".
const SLAY_SPIRE_BGGID = 338960;
const SLAY_SPIRE_ASCENSIONS = 10;
// Ascensions cleared in the past but not captured in the logged plays (e.g.
// played before tagging, or tagged without the Act III boss). New runs are
// detected automatically from play tags, so this only backfills history.
const SLAY_SPIRE_EXTRA_CLEARED = [3];
function buildSlaySpireHtml(plays) {
  const cleared = new Set(SLAY_SPIRE_EXTRA_CLEARED);
  let heartDone = false;
  for (const p of (plays || [])) {
    if (!(p.sc || []).some(s => s.w)) continue; // only won runs count
    const b = String(p.b || '');
    if (/heart/i.test(b)) heartDone = true;
    const am = b.match(/Ascension\s*(\d+)/i);
    const asc = am ? parseInt(am[1], 10) : 0;
    // A standard run is cleared by defeating the Act III boss.
    if (asc >= 1 && /Act\s*III\b/i.test(b)) cleared.add(asc);
  }
  const highest = cleared.size ? Math.max(...cleared) : 0;
  let rungs = '';
  for (let i = 1; i <= SLAY_SPIRE_ASCENSIONS; i++) {
    const done = cleared.has(i);
    const cls = 'sts-rung' + (done ? ' done' : '') + (i === highest ? ' peak' : '');
    const tick = done ? '<span class="sts-tick">&#10003;</span>' : '';
    rungs += `<span class="${cls}" title="Ascension ${i}${done ? ' — cleared' : ''}">A${i}${tick}</span>`;
  }
  const heartCls = 'sts-heart' + (heartDone ? ' done' : '');
  return `
      <div class="sts-box">
        <div class="st-head">
          <span class="st-title">&#128508;&#65039; Ascension Ladder</span>
          <span class="st-count">${cleared.size} / ${SLAY_SPIRE_ASCENSIONS}</span>
        </div>
        <div class="sts-ladder">${rungs}</div>
        ${highest
          ? `<div class="sts-foot">Highest cleared: Ascension ${highest}</div>`
          : `<div class="sts-foot dim">No ascension cleared yet</div>`}
        <div class="${heartCls}">
          <span class="sts-heart-icon">&#10084;&#65039;</span>
          <span class="sts-heart-label">Defeat the Heart</span>
          <span class="sts-heart-status">${heartDone ? '&#10003; Defeated' : 'Not yet'}</span>
        </div>
      </div>`;
}
// ── Marvel United: heroes played + villains defeated ──
// Two separate product lines (Avengers core + expansions, and X-Men core +
// teams). Every box in a line logs its plays under that line's core game, so
// each board pulls from the core's play history and is shown on the core page
// AND on every expansion page in that line. Heroes come from each play's
// per-player `r` field (played = appeared in any play); villains come from the
// `b` field (defeated = appeared in a *won* play). Difficulty/modifier tokens
// like "Hard" or "Secret Identity" are ignored because they match no roster
// name. Magneto & Mystique are anti-heroes, so they appear in both lists.
function _muNorm(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/^the/,''); }
const _MU_ALIASES = { jeangray:'jeangrey', sabertooth:'sabretooth' };
function _muCanon(s){ const n=_muNorm(s); return _MU_ALIASES[n]||n; }
const MARVEL_UNITED_LINES = {
  avengers: {
    bggIds: [298047, 302668, 302669, 303600, 339131, 302670],
    playBggId: 298047,
    heroes: [
      {name:'Iron Man',box:'Core'},{name:'Captain America',box:'Core'},{name:'Black Widow',box:'Core'},
      {name:'Hulk',box:'Core'},{name:'Captain Marvel',box:'Core'},{name:'Ant-Man',box:'Core'},{name:'Wasp',box:'Core'},
      {name:'Thor',box:'Asgard'},{name:'Valkyrie',box:'Asgard'},{name:'Korg',box:'Asgard'},
      {name:'Black Panther',box:'Black Panther'},{name:'Winter Soldier',box:'Black Panther'},{name:'Shuri',box:'Black Panther'},
      {name:'Spider-Man',box:'Spider-Verse'},{name:'Miles Morales',box:'Spider-Verse'},{name:'Ghost-Spider',box:'Spider-Verse'},
      {name:'Star-Lord',box:'Guardians'},{name:'Groot',box:'Guardians'},{name:'Rocket',box:'Guardians'},
      {name:'Deadpool',box:'Deadpool'},
    ],
    villains: [
      {name:'Red Skull',box:'Core'},{name:'Ultron',box:'Core'},{name:'Taskmaster',box:'Core'},
      {name:'Loki',box:'Asgard'},{name:'Killmonger',box:'Black Panther'},{name:'Green Goblin',box:'Spider-Verse'},
      {name:'Ronan',box:'Guardians'},{name:'Deadpool',box:'Deadpool'},{name:'Bob',key:'bob',box:'Deadpool'},
    ],
  },
  xmen: {
    bggIds: [336382, 339128, 339129],
    playBggId: 336382,
    heroes: [
      {name:'Cyclops',box:'Core'},{name:'Wolverine',box:'Core'},{name:'Storm',box:'Core'},{name:'Beast',box:'Core'},
      {name:'Jean Grey',box:'Core'},{name:'Professor X',box:'Core'},{name:'Magneto',box:'Core'},{name:'Mystique',box:'Core'},
      {name:'Archangel',box:'Gold Team'},{name:'Bishop',box:'Gold Team'},{name:'Colossus',box:'Gold Team'},{name:'Iceman',box:'Gold Team'},
      {name:'Psylocke',box:'Blue Team'},{name:'Jubilee',box:'Blue Team'},{name:'Rogue',box:'Blue Team'},{name:'Gambit',box:'Blue Team'},
    ],
    villains: [
      {name:'Magneto',box:'Core'},{name:'Mystique',box:'Core'},{name:'Juggernaut',box:'Core'},{name:'Sabretooth',box:'Core'},
      {name:'Sebastian Shaw',box:'Gold Team'},{name:'Mister Sinister',box:'Blue Team'},
    ],
  },
};
function _muLineFor(bggId){
  const n = Number(bggId);
  for (const k in MARVEL_UNITED_LINES) if (MARVEL_UNITED_LINES[k].bggIds.includes(n)) return MARVEL_UNITED_LINES[k];
  return null;
}
function _muPill(name, done, color, sub){
  const cls = 'st-pill' + (done ? ' done' : '');
  const tick = done ? '<span class="st-tick">&#10003;</span>' : '';
  const title = name + (sub ? ` · ${sub}` : '') + (done ? ' — done' : '');
  return `<span class="${cls}" style="--d:${color}" title="${title}">${tick}${name}</span>`;
}
function buildMarvelUnitedHtml(bggId){
  const line = _muLineFor(bggId);
  if (!line) return '';
  const plays = PLAY_HISTORY[line.playBggId] || [];
  if (!plays.length) return '';
  const playedHeroes = new Set();
  const defeatedVillains = new Set();
  const villainCanon = new Set(line.villains.map(v => v.key || _muCanon(v.name)));
  for (const p of plays){
    for (const s of (p.sc || [])){ const c = _muCanon(s.r); if (c) playedHeroes.add(c); }
    if ((p.sc || []).some(s => s.w)){
      for (const part of String(p.b || '').split(/[／/]/)){ const c = _muCanon(part); if (villainCanon.has(c)) defeatedVillains.add(c); }
    }
  }
  const heroDone = h => playedHeroes.has(h.key || _muCanon(h.name));
  const vilDone  = v => defeatedVillains.has(v.key || _muCanon(v.name));
  const HERO_COLOR = '#e2b04a', VILLAIN_COLOR = '#e0613a';
  const boxes = [];
  line.heroes.forEach(h => { if (!boxes.includes(h.box)) boxes.push(h.box); });
  const heroRows = boxes.map(box => {
    const pills = line.heroes.filter(h => h.box === box).map(h => _muPill(h.name, heroDone(h), HERO_COLOR, box)).join('');
    return `<div class="st-row"><span class="st-difflabel mu-box">${box}</span><div class="st-pills">${pills}</div></div>`;
  }).join('');
  const heroDoneCount = line.heroes.filter(heroDone).length;
  const vilPills = line.villains.map(v => _muPill(v.name, vilDone(v), VILLAIN_COLOR, v.box)).join('');
  const vilDoneCount = line.villains.filter(vilDone).length;
  return `
      <div class="sky-airports mu-board">
        <div class="st-head">
          <span class="st-title">&#129464; Heroes Played</span>
          <span class="st-count">${heroDoneCount} / ${line.heroes.length}</span>
        </div>
        ${heroRows}
        <div class="mu-divider"></div>
        <div class="st-head">
          <span class="st-title">&#129465; Villains Defeated</span>
          <span class="st-count mu-count-red">${vilDoneCount} / ${line.villains.length}</span>
        </div>
        <div class="st-row"><div class="st-pills">${vilPills}</div></div>
        <div class="st-legend">Heroes tick when played &middot; villains when defeated (won) &middot; hover for set</div>
      </div>`;
}
// ── Marvel Champions: hero×aspect matrix + villain checklist ──
// Goal 1: play every hero with all 4 aspects (260 combos).
// Goal 2: defeat every scenario/villain (55 scenarios).
// Plays log hero+aspect in each player's `r` (slash-separated, either order;
// Spider-Woman carries 2 aspects). Difficulty + scenario/modular live in `b`.
// Expert win = full completion (green); Standard-only win = partial (blue);
// played-but-never-won = red; never played = dim. Scenario credited only when a
// real villain/scenario name appears in `b` (modular-only plays stay unresolved
// on purpose — the user will send data corrections over time).
const MC_BGGID = 285774;
const MC_ASPECTS = ['Aggression','Justice','Leadership','Protection'];
const MC_ASPECT_SET = new Set(MC_ASPECTS);
function _mcNorm(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
const MC_HEROES = [
  // Core + Hero Packs
  {name:'Spider-Man',box:'Core'},{name:'Captain Marvel',box:'Core'},{name:'She-Hulk',box:'Core'},
  {name:'Iron Man',box:'Core'},{name:'Black Panther',box:'Core'},
  {name:'Captain America',box:'Heroes'},{name:'Ms. Marvel',box:'Heroes'},{name:'Thor',box:'Heroes'},
  {name:'Black Widow',box:'Heroes'},{name:'Doctor Strange',box:'Heroes'},{name:'Hulk',box:'Heroes'},
  {name:'Ant-Man',box:'Heroes'},{name:'Wasp',box:'Heroes'},{name:'Quicksilver',box:'Heroes'},{name:'Scarlet Witch',box:'Heroes'},
  {name:'Star-Lord',box:'Heroes'},{name:'Gamora',box:'Heroes'},{name:'Drax',box:'Heroes'},{name:'Venom',box:'Heroes'},
  {name:'Nebula',box:'Heroes'},{name:'War Machine',box:'Heroes'},{name:'Valkyrie',box:'Heroes'},{name:'Vision',box:'Heroes'},
  {name:'Nova',box:'Heroes'},{name:'Ironheart',box:'Heroes'},{name:'Spider-Ham',box:'Heroes'},{name:'SP//dr',box:'Heroes',m:['spdr','spidr']},
  {name:'Maria Hill',box:'Heroes'},{name:'Nick Fury',box:'Heroes'},{name:'Silk',box:'Heroes'},{name:'Falcon',box:'Heroes'},
  {name:'Winter Soldier',box:'Heroes'},{name:'Shuri',box:'Heroes'},{name:'Wonder Man',box:'Heroes'},{name:'Hercules',box:'Heroes'},
  // X-Men Hero Packs
  {name:'Colossus',box:'X-Men'},{name:'Shadowcat',box:'X-Men'},{name:'Cyclops',box:'X-Men'},{name:'Phoenix',box:'X-Men'},
  {name:'Wolverine',box:'X-Men'},{name:'Storm',box:'X-Men'},{name:'Gambit',box:'X-Men'},{name:'Rogue',box:'X-Men'},
  {name:'Cable',box:'X-Men'},{name:'Domino',box:'X-Men'},{name:'Psylocke',box:'X-Men'},{name:'Angel',box:'X-Men'},
  {name:'X-23',box:'X-Men'},{name:'Deadpool',box:'X-Men'},{name:'Bishop',box:'X-Men'},{name:'Magik',box:'X-Men'},
  {name:'Iceman',box:'X-Men'},{name:'Jubilee',box:'X-Men'},{name:'Nightcrawler',box:'X-Men'},{name:'Magneto',box:'X-Men'},
  // Campaign-box heroes
  {name:'Hawkeye',box:'Campaign'},{name:'Spider-Woman',box:'Campaign'},{name:'Rocket Raccoon',box:'Campaign',m:['rocket']},
  {name:'Groot',box:'Campaign'},{name:'Spectrum',box:'Campaign'},{name:'Adam Warlock',box:'Campaign'},
  {name:'Ghost-Spider',box:'Campaign'},{name:'Miles Morales',box:'Campaign',m:['milesmorales','milesspiderman']},
  {name:'Tigra',box:'Campaign'},{name:'Hulkling',box:'Campaign'},
];
const MC_SCENARIOS = [
  {name:'Rhino',box:'Core'},{name:'Klaw',box:'Core'},{name:'Ultron',box:'Core'},
  {name:'Crossbones',box:'Red Skull'},{name:'Absorbing Man',box:'Red Skull'},{name:'Taskmaster',box:'Red Skull'},{name:'Zola',box:'Red Skull',m:['armzola']},{name:'Red Skull',box:'Red Skull'},
  {name:'Drang',box:"Galaxy's"},{name:'Collector: Infiltrate',box:"Galaxy's",m:['infiltratethemuseum','collector']},{name:'Collector: Escape',box:"Galaxy's",m:['escapethemuseum']},{name:'Nebula',box:"Galaxy's"},{name:'Ronan',box:"Galaxy's",m:['ronantheaccuser']},
  {name:'Ebony Maw',box:'Mad Titan'},{name:'Tower Defense',box:'Mad Titan',m:['corvusglaive','proximamidnight']},{name:'Thanos',box:'Mad Titan'},{name:'Hela',box:'Mad Titan'},{name:'Loki',box:'Mad Titan'},
  {name:'Sandman',box:'Sinister'},{name:'Venom',box:'Sinister'},{name:'Mysterio',box:'Sinister'},{name:'Sinister Six',box:'Sinister'},{name:'Venom Goblin',box:'Sinister'},
  {name:'Sabretooth',box:'Mutant Gen'},{name:'Project Wideawake',box:'Mutant Gen',m:['sentinel']},{name:'Master Mold',box:'Mutant Gen'},{name:'Mansion Attack',box:'Mutant Gen'},{name:'Magneto',box:'Mutant Gen'},
  {name:'Morlock Siege',box:'NeXt Evo',m:['marauders']},{name:'On the Run',box:'NeXt Evo'},{name:'Juggernaut',box:'NeXt Evo'},{name:'Mister Sinister',box:'NeXt Evo'},{name:'Stryfe',box:'NeXt Evo'},
  {name:'Unus',box:'Apocalypse'},{name:'Four Horsemen',box:'Apocalypse'},{name:'Dark Beast',box:'Apocalypse'},{name:'Apocalypse',box:'Apocalypse'},{name:'En Sabah Nur',box:'Apocalypse',m:['apocalypseensabahnur']},
  {name:'Black Widow (Yelena)',box:'SHIELD',m:['yelena','yelenabelova']},{name:'Batroc',box:'SHIELD'},{name:'M.O.D.O.K.',box:'SHIELD',m:['modok']},{name:'Citizen V',box:'SHIELD'},{name:'Baron Zemo',box:'SHIELD',m:['zemo']},
  {name:'Green Goblin: Risky Business',box:'Packs',m:['riskybusiness']},{name:'Green Goblin: Mutagen Formula',box:'Packs',m:['mutagenformula']},
  {name:'Wrecking Crew',box:'Packs'},{name:'Kang',box:'Packs',m:['kangtheconqueror']},{name:'The Hood',box:'Packs',m:['hood']},
  {name:'MojoMania: Magog',box:'Packs',m:['magog']},{name:'MojoMania: Spiral',box:'Packs',m:['spiral']},{name:'MojoMania: Mojo',box:'Packs',m:['mojo']},
  {name:'Trickster: Enchantress',box:'Packs',m:['enchantress']},{name:'Trickster: Loki, God of Lies',box:'Packs',m:['godoflies','lokigodoflies']},
  {name:'Synthezoid: She-Hulk',box:'Packs',m:['synthezoidshehulk']},{name:'Synthezoid: Vision',box:'Packs',m:['synthezoidvision']},
];
// status precedence: 3 expertWin > 2 standardWin > 1 playedLost > 0 none
const MC_ST = {NONE:0, LOST:1, STD:2, EXP:3};
function _mcBetter(a,b){ return Math.max(a,b); }
function _mcParsePairs(r){
  const toks = String(r||'').split(/[／/]/).map(t=>t.trim()).filter(Boolean);
  const heroes = toks.filter(t=>!MC_ASPECT_SET.has(t));
  const aspects = toks.filter(t=>MC_ASPECT_SET.has(t));
  const pairs = [];
  if (heroes.length === 1) { aspects.forEach(a=>pairs.push([heroes[0],a])); if(!aspects.length) pairs.push([heroes[0],null]); }
  else heroes.forEach((h,i)=>{ if(aspects[i]) pairs.push([h,aspects[i]]); });
  return pairs;
}
function _mcHeroLookup(){
  const map = {};
  MC_HEROES.forEach((h,i)=>{ map[_mcNorm(h.name)]=i; (h.m||[]).forEach(a=>map[_mcNorm(a)]=i); });
  return map;
}
function _mcScenLookup(){
  const map = {};
  MC_SCENARIOS.forEach((s,i)=>{ map[_mcNorm(s.name)]=i; (s.m||[]).forEach(a=>map[_mcNorm(a)]=i); });
  return map;
}
function buildMarvelChampionsData(plays){
  const HL = _mcHeroLookup(), SL = _mcScenLookup();
  // per hero: aspects {A:{status,count}}, combos {A:[{sc,won,exp}]}
  const heroes = MC_HEROES.map(h=>({name:h.name, box:h.box,
    aspects:Object.fromEntries(MC_ASPECTS.map(a=>[a,{status:MC_ST.NONE,count:0}])),
    combos:Object.fromEntries(MC_ASPECTS.map(a=>[a,[]])) }));
  const scen = MC_SCENARIOS.map(s=>({name:s.name, box:s.box, status:MC_ST.NONE, count:0}));
  for (const p of (plays||[])){
    const won = (p.sc||[]).some(s=>s.w);
    const b = String(p.b||'');
    const exp = /\bexpert\b/i.test(b);
    const result = won ? (exp ? MC_ST.EXP : MC_ST.STD) : MC_ST.LOST;
    // resolve scenarios in this play; plays with no villain name only feed the
    // hero×aspect matrix (the combo was still played) — never the villain list.
    const sIdx = [];
    b.split(/[／/]/).forEach(tok=>{ const k=_mcNorm(tok); if(k in SL && !sIdx.includes(SL[k])) sIdx.push(SL[k]); });
    sIdx.forEach(i=>{ scen[i].count++; scen[i].status=_mcBetter(scen[i].status, result); });
    const scenNames = sIdx.map(i=>MC_SCENARIOS[i].name);
    // record hero+aspect combos (counts/status from every play; villain chips
    // only when a real villain was logged)
    for (const s of (p.sc||[])){
      for (const [hTok,aTok] of _mcParsePairs(s.r)){
        const hk=_mcNorm(hTok); if(!(hk in HL)) continue; const H=heroes[HL[hk]];
        if(!aTok) continue;
        H.aspects[aTok].count++;
        H.aspects[aTok].status=_mcBetter(H.aspects[aTok].status, result);
        scenNames.forEach(sn=>{ H.combos[aTok].push({sc:sn, won, exp}); });
      }
    }
  }
  return {heroes, scen};
}
function _mcStatusCls(st){ return st===MC_ST.EXP?'mc-exp':st===MC_ST.STD?'mc-std':st===MC_ST.LOST?'mc-lost':'mc-none'; }
function buildMarvelChampionsHtml(bggId, plays){
  if (Number(bggId) !== MC_BGGID) return '';
  const d = buildMarvelChampionsData(plays||[]);
  window._mcData = d;
  const totalCombos = MC_HEROES.length * 4;
  let comboExp=0, comboPlayed=0;
  d.heroes.forEach(h=>MC_ASPECTS.forEach(a=>{ const st=h.aspects[a].status; if(st===MC_ST.EXP)comboExp++; if(st>=MC_ST.LOST)comboPlayed++; }));
  const vilExp = d.scen.filter(s=>s.status===MC_ST.EXP).length;
  const vilBeat = d.scen.filter(s=>s.status>=MC_ST.STD).length;
  // hero overview grouped by box
  const boxes=[]; d.heroes.forEach(h=>{ if(!boxes.includes(h.box)) boxes.push(h.box); });
  const heroRows = boxes.map(box=>{
    const rows = d.heroes.map((h,i)=>({h,i})).filter(o=>o.h.box===box).map(({h,i})=>{
      const cells = MC_ASPECTS.map(a=>{
        const st=h.aspects[a].status, c=h.aspects[a].count;
        return `<span class="mc-cell ${_mcStatusCls(st)}" title="${h.name} · ${a}${c?` — ${c} play${c>1?'s':''}`:''}">${a[0]}${c?`<i>${c}</i>`:''}</span>`;
      }).join('');
      return `<button class="mc-hrow" data-mc-hero="${i}"><span class="mc-hname">${h.name}</span><span class="mc-cells">${cells}</span></button>`;
    }).join('');
    return `<div class="mc-box"><div class="mc-boxlabel">${box}</div>${rows}</div>`;
  }).join('');
  // villain checklist grouped by box
  const sboxes=[]; d.scen.forEach(s=>{ if(!sboxes.includes(s.box)) sboxes.push(s.box); });
  const vilRows = sboxes.map(box=>{
    const pills = d.scen.filter(s=>s.box===box).map(s=>{
      const cls=_mcStatusCls(s.status);
      const tick=s.status===MC_ST.EXP?'&#10003;':s.status===MC_ST.STD?'&#10003;':s.status===MC_ST.LOST?'&times;':'';
      return `<span class="mc-vpill ${cls}" title="${s.name}${s.count?` — ${s.count} play${s.count>1?'s':''}`:''}">${tick?`<span class="mc-vtick">${tick}</span>`:''}${s.name}</span>`;
    }).join('');
    return `<div class="mc-vbox"><span class="st-difflabel mc-vboxlabel">${box}</span><div class="st-pills">${pills}</div></div>`;
  }).join('');
  return `
      <div class="mc-board">
        <div class="st-head"><span class="st-title">&#129504; Marvel Champions</span></div>
        <div class="mc-stats">
          <div class="mc-stat"><span class="mc-stat-val mc-exp-txt">${comboExp}</span><span class="mc-stat-sub">/ ${totalCombos}</span><span class="mc-stat-label">Combos (Expert)</span></div>
          <div class="mc-stat"><span class="mc-stat-val">${comboPlayed}</span><span class="mc-stat-sub">/ ${totalCombos}</span><span class="mc-stat-label">Combos played</span></div>
          <div class="mc-stat"><span class="mc-stat-val mc-exp-txt">${vilExp}</span><span class="mc-stat-sub">/ ${MC_SCENARIOS.length}</span><span class="mc-stat-label">Villains (Expert)</span></div>
          <div class="mc-stat"><span class="mc-stat-val">${vilBeat}</span><span class="mc-stat-sub">/ ${MC_SCENARIOS.length}</span><span class="mc-stat-label">Villains beaten</span></div>
        </div>
        <div class="mc-sec-title">&#128081; Hero &times; Aspect <span class="mc-hint">tap a hero</span></div>
        <div class="mc-detail" id="mc-detail"><div class="mc-detail-empty">Tap any hero to see their 4 aspects and the villains faced.</div></div>
        <div class="mc-heroes">${heroRows}</div>
        <div class="mc-legend"><span class="mc-key mc-exp">Expert win</span><span class="mc-key mc-std">Standard win</span><span class="mc-key mc-lost">Lost</span><span class="mc-key mc-none">Not played</span></div>
        <div class="mu-divider"></div>
        <div class="mc-sec-title">&#128127; Villains &mdash; defeat them all</div>
        <div class="mc-villains">${vilRows}</div>
      </div>`;
}
function wireMarvelChampions(){
  const board = document.querySelector('.mc-board'); if(!board) return;
  const detail = board.querySelector('#mc-detail');
  const d = window._mcData; if(!d) return;
  const STcls = _mcStatusCls;
  const STtxt = st=>st===MC_ST.EXP?'Expert win':st===MC_ST.STD?'Standard win':st===MC_ST.LOST?'Played, no win':'Never played';
  let selHero=-1, selAspect=null;
  function renderDetail(){
    if(selHero<0){ detail.innerHTML='<div class="mc-detail-empty">Tap any hero to see their 4 aspects and the villains faced.</div>'; return; }
    const h=d.heroes[selHero];
    const tiles=MC_ASPECTS.map(a=>{
      const st=h.aspects[a].status, c=h.aspects[a].count;
      const sel=a===selAspect?' sel':'';
      return `<button class="mc-atile ${STcls(st)}${sel}" data-mc-aspect="${a}"><span class="mc-aname">${a}</span><span class="mc-astat">${c?`${c} play${c>1?'s':''}`:'—'}</span></button>`;
    }).join('');
    let vil='';
    if(selAspect){
      const list=h.combos[selAspect];
      const cnt=h.aspects[selAspect].count;
      if(!list.length) vil = cnt>0
        ? `<div class="mc-vempty">Played ${cnt}&times; as ${h.name} / ${selAspect} &mdash; no villain logged for ${cnt>1?'these games':'this game'}.</div>`
        : `<div class="mc-vempty">No games yet as ${h.name} / ${selAspect}.</div>`;
      else{
        // dedupe by scenario keeping best
        const best={};
        list.forEach(e=>{ const r=e.won?(e.exp?MC_ST.EXP:MC_ST.STD):MC_ST.LOST; best[e.sc]=Math.max(best[e.sc]||0,r); });
        vil=`<div class="mc-cvils">`+Object.keys(best).map(sc=>{
          const st=best[sc]; const lab=st===MC_ST.EXP?'Expert':st===MC_ST.STD?'Standard':'Lost';
          return `<span class="mc-cvil ${STcls(st)}">${sc}<i>${lab}</i></span>`;
        }).join('')+`</div>`;
      }
    }
    detail.innerHTML=`<div class="mc-dhead">${h.name}<span class="mc-dbox">${h.box}</span></div><div class="mc-atiles">${tiles}</div>${selAspect?vil:'<div class="mc-vhint">Tap an aspect above to see villains faced with it.</div>'}`;
  }
  board.querySelectorAll('.mc-hrow').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.mcHero);
      board.querySelectorAll('.mc-hrow').forEach(b=>b.classList.remove('sel'));
      if(selHero===i){ selHero=-1; selAspect=null; } else { selHero=i; selAspect=null; btn.classList.add('sel'); }
      renderDetail();
      detail.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
  });
  detail.addEventListener('click',e=>{
    const t=e.target.closest('[data-mc-aspect]'); if(!t) return;
    const a=t.dataset.mcAspect; selAspect=(selAspect===a)?null:a; renderDetail();
  });
}
// ── Eternal Decks: stage ladder ──
// Co-op campaign of 6 stages (A–F, F = The Dragon), each playable at Beginner /
// Standard / Expert / Pro, plus a New Game+ tier (A+–F+) unlocked after F.
// Plays log "Difficulty／Stage X" in `b`. A stage is cleared on a won play; we
// surface the *best* difficulty beaten (Expert/Pro highlighted gold).
const ED_BGGID = 424981;
const ED_DIFFS = ['Beginner','Standard','Expert','Pro']; // rank by index
const ED_STAGES = [
  {id:'A', name:'Nature Star'},{id:'B', name:'Ghost Town'},{id:'C', name:'Labyrinth'},
  {id:'D', name:'Gatekeeper'},{id:'E', name:'Silent'},{id:'F', name:'The Dragon'},
];
function buildEternalDecksHtml(plays){
  // status per stage id ('A','A+',...): {won:bool, bestDiff:idx|-1, attempted:bool}
  const st = {};
  ED_STAGES.forEach(s=>{ st[s.id]={won:false,bestDiff:-1,attempted:false}; st[s.id+'+']={won:false,bestDiff:-1,attempted:false}; });
  for (const p of (plays||[])){
    const b = String(p.b||'');
    const m = b.match(/stage\s*([a-f])\s*(\+)?/i);
    if (!m) continue;
    const id = m[1].toUpperCase() + (m[2]?'+':'');
    if (!(id in st)) continue;
    const won = (p.sc||[]).some(s=>s.w);
    let dIdx = -1;
    ED_DIFFS.forEach((d,i)=>{ if (new RegExp('\\b'+d+'\\b','i').test(b)) dIdx = i; });
    if (won){ st[id].won = true; if (dIdx>st[id].bestDiff) st[id].bestDiff = dIdx; }
    else st[id].attempted = true;
  }
  const rung = (s, suffix) => {
    const id = s.id + suffix;
    const cur = st[id];
    let cls='ed-stage', right='', tick='';
    if (cur.won){
      cls += ' done';
      const hard = cur.bestDiff>=2; // Expert or Pro
      if (hard) cls += ' hard';
      tick = '<span class="ed-tick">&#10003;</span>';
      right = `<span class="ed-diff${hard?' hard':''}">${cur.bestDiff>=0?ED_DIFFS[cur.bestDiff]:'Cleared'}</span>`;
    } else if (cur.attempted){
      cls += ' lost';
      right = '<span class="ed-diff lostlbl">Attempted</span>';
    } else {
      right = '<span class="ed-diff none">&mdash;</span>';
    }
    return `<div class="${cls}"><span class="ed-letter">${id}</span><span class="ed-name">${s.name}</span>${tick}${right}</div>`;
  };
  const clearedCount = Object.values(st).filter(x=>x.won).length;
  const baseDone = ED_STAGES.every(s=>st[s.id].won);
  const campaign = ED_STAGES.map(s=>rung(s,'')).join('');
  const advanced = ED_STAGES.map(s=>rung(s,'+')).join('');
  return `
      <div class="ed-box">
        <div class="st-head">
          <span class="st-title">&#127183; Stage Ladder</span>
          <span class="st-count">${clearedCount} / ${ED_STAGES.length*2} cleared</span>
        </div>
        <div class="ed-tier-label">Campaign</div>
        <div class="ed-stages">${campaign}</div>
        <div class="ed-tier-label ed-adv${baseDone?'':' locked'}">New Game+ ${baseDone?'':'<span class="ed-lockhint">&#128274; clears after Stage F</span>'}</div>
        <div class="ed-stages${baseDone?'':' dimmed'}">${advanced}</div>
        <div class="st-legend">Cleared shows best difficulty &middot; Expert / Pro highlighted gold &middot; red = attempted</div>
      </div>`;
}
// ── Aeon's End — Nemesis Codex ──────────────────────────────────────────
// Goal: defeat every nemesis. Nemeses are grouped by the box/wave they come
// from (owned boxes shown, unowned greyed + locked), each tagged with its
// printed difficulty rating. Status (defeated / attempted / not-yet-faced) is
// read from play history (nemesis = the play's board field), aggregated across
// every Aeon's End bggId. The Aeon's End: Legacy campaign is tracked separately
// and spoiler-free; Legacy of Gravehold (which reveals that story) is blurred
// behind a tap-to-reveal. Data: Aeon's End wiki (aeonsend.wiki.gg).
const AE_LEGACY_BGGID = 241451;
function _isAeonsEnd(bggId){ const g = findGameByBggId(bggId); return !!(g && /aeon.?s?\s*end/i.test(g.name || '')); }
function _aeNorm(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
// BGStats stores several "board"/variant selections in one field joined by a
// fullwidth solidus (／, U+FF0F); users also separate with /, |, comma, etc.
// So a play logged as "Rageborne／Increased difficulty" carries the nemesis in
// one token and difficulty/variant tags in the others. Split, then match any
// token against the roster instead of comparing the whole raw string.
const _AE_SPLIT = /[／｜\/|,;\n]+/;
let _aeRosterMap = null;
function _aeRoster(){
  if (_aeRosterMap) return _aeRosterMap;
  _aeRosterMap = {};
  for (const n of AE_NEMESES) _aeRosterMap[_aeNorm(n.n)] = n;
  return _aeRosterMap;
}
// Tokens that are difficulty/variant modifiers, never a nemesis name.
function _aeIsModifier(tok){
  return /difficulty|expedition|nightmare|expert|casual|increased|reduced|standard|(^|\b)(lvl|level|diff|easy|hard|normal)\b|^\s*\d+\s*$/i.test(tok);
}
// Parse a raw board string → {key, name} for the nemesis (or null).
function _aeParseNemesis(raw){
  const parts = String(raw || '').split(_AE_SPLIT).map(s => s.trim()).filter(Boolean);
  if (!parts.length) return null;
  const roster = _aeRoster();
  for (const part of parts){
    const hit = roster[_aeNorm(part)];
    if (hit) return { key: _aeNorm(hit.n), name: hit.n };
  }
  // Unknown nemesis (future content): pick the first non-modifier token so a
  // difficulty tag never becomes the displayed name.
  const named = parts.find(p => !_aeIsModifier(p)) || parts[0];
  return { key: _aeNorm(named), name: named };
}
// {n: name, d: difficulty, x: box}. Legacy-campaign nemeses are intentionally
// omitted (tracked spoiler-free below).
const AE_NEMESES = [
  { n:'Rageborne', d:2, x:"Aeon's End" },
  { n:'Carapace Queen', d:3, x:"Aeon's End" },
  { n:'Crooked Mask', d:5, x:"Aeon's End" },
  { n:'Prince of Gluttons', d:5, x:"Aeon's End" },
  { n:'Horde-Crone', d:6, x:'The Depths' },
  { n:'Umbra Titan', d:3, x:'War Eternal' },
  { n:'Hollow Crown', d:5, x:'War Eternal' },
  { n:'Magus of Cloaks', d:7, x:'War Eternal' },
  { n:'Gate Witch', d:7, x:'War Eternal' },
  { n:'Blight Lord', d:4, x:'The Nameless' },
  { n:'Wayward One', d:7, x:'The Nameless' },
  { n:'Thrice-Dead Prophet', d:5, x:'The Outer Dark' },
  { n:'Wraithmonger', d:6, x:'The Outer Dark' },
  { n:'Knight of Shackles', d:4, x:'The Void' },
  { n:'Maiden of Thorns', d:4, x:'The Void' },
  { n:'Maggoth', d:3, x:'The New Age' },
  { n:'Arachnos', d:4, x:'The New Age' },
  { n:'Ageless Walker', d:5, x:'The New Age' },
  { n:'Fenrix', d:7, x:'The New Age' },
  { n:'The Wailing', d:6, x:'Shattered Dreams' },
  { n:'The Wanderer', d:5, x:'The Ancients' },
  { n:'Experiment 153', d:3, x:'Outcasts' },
  { n:'Thief of Dreams', d:4, x:'Outcasts' },
  { n:'Risen Thrall', d:5, x:'Outcasts' },
  { n:'Fountain of Souls', d:8, x:'Outcasts' },
  { n:'Fortress', d:5, x:'Return to Gravehold' },
  { n:'Burrower', d:8, x:'Return to Gravehold' },
  { n:'The Burning Kor', d:7, x:'Southern Village' },
  { n:'Bishop of Scrolls', d:2, x:'Legacy of Gravehold' },
  { n:'Fate Shepherd', d:3, x:'Legacy of Gravehold' },
  { n:'Mother of Rust', d:4, x:'Legacy of Gravehold' },
  { n:'Paradox of Myth and Bone', d:5, x:'Legacy of Gravehold' },
  { n:'Rust Superion', d:5, x:'Legacy of Gravehold' },
  { n:'Rust Amalgam', d:6, x:'Legacy of Gravehold' },
  { n:'Bishop: Returned', d:7, x:'Legacy of Gravehold' },
  { n:'Brama: Corrupted', d:7, x:'Legacy of Gravehold' },
  { n:"Z'hana: Corrupted", d:7, x:'Legacy of Gravehold' },
  { n:'Griefweaver', d:8, x:'Legacy of Gravehold' },
  { n:'Paradox of Myth', d:8, x:'Legacy of Gravehold' },
  { n:'Paradox of Bone', d:8, x:'Legacy of Gravehold' },
  { n:'Mist Revealed', d:10, x:'Legacy of Gravehold' },
  { n:'Herald of the End', d:4, x:'Past and Future' },
  { n:'Stonemonger', d:4, x:'Past and Future' },
  { n:'Infested Mutation', d:6, x:'Past and Future' },
  { n:'The Changeling Nest', d:6, x:'Past and Future' },
  { n:'Corruption’s Core', d:8, x:'Past and Future' },
  { n:'Erythiza, Consumed', d:8, x:'Past and Future' },
  { n:'The Endless Decay', d:5, x:'Origins' },
  { n:'Clouded Mesmer', d:7, x:'Evolution' },
  { n:'The Infecter', d:4, x:'The Descent' },
  { n:'The Coven', d:5, x:'The Descent' },
  { n:'The Blight', d:7, x:'The Descent' },
  { n:'The Wrath', d:8, x:'The Descent' },
  { n:'Absorbing Wraith', d:8, x:'The Caverns' },
  { n:'The Reliquary', d:6, x:'The Abyss' },
  { n:'Crooked Mask (BtB)', d:5, x:'Beyond the Breach' },
  { n:'Oracle of Filth', d:6, x:'Beyond the Breach' },
  { n:'Twice-Dead Prophet', d:6, x:'Beyond the Breach' },
  { n:'The Terror in Brass', d:5, x:'Beyond the Breach' },
  { n:'Wayward Reflection', d:8, x:'Beyond the Breach' },
  { n:'The Timeless', d:7, x:'The Surface' },
  { n:'Necroswarm', d:7, x:'Into the Wild' },
  { n:'Rampaging Vin', d:8, x:'The Returned' },
];
// Box display order + ownership. spoiler:true → blurred until tapped.
const AE_BOXES = [
  { x:"Aeon's End", owned:true },
  { x:'The Depths', owned:true },
  { x:'War Eternal', owned:true },
  { x:'The Nameless', owned:true },
  { x:'The Outer Dark', owned:true },
  { x:'The Void', owned:true },
  { x:'The New Age', owned:true },
  { x:'Shattered Dreams', owned:true },
  { x:'The Ancients', owned:true },
  { x:'Outcasts', owned:true },
  { x:'Return to Gravehold', owned:true },
  { x:'Southern Village', owned:true },
  { x:'Legacy of Gravehold', owned:true, spoiler:true },
  { x:'Past and Future', owned:true },
  { x:'Origins', owned:true },
  { x:'Evolution', owned:true },
  { x:'The Descent', owned:true },
  { x:'The Caverns', owned:true },
  { x:'The Abyss', owned:true },
  { x:'Beyond the Breach', owned:true },
  { x:'The Surface', owned:true },
  { x:'Into the Wild', owned:true },
  { x:'The Returned', owned:false },
];

function buildAeonsEndHtml(bggId){
  if (!_isAeonsEnd(bggId)) return '';
  // Aggregate nemesis outcomes across every Aeon's End bggId except the
  // spoiler-laden Legacy campaign (tracked separately, name-free).
  const faced = {}; // norm → {name, won, wonNormal, wonIncreased, attempts}
  let legacyPlays = 0, legacyWins = 0;
  for (const id in PLAY_HISTORY){
    if (!_isAeonsEnd(id)) continue;
    const isLegacy = Number(id) === AE_LEGACY_BGGID;
    for (const p of PLAY_HISTORY[id]){
      const won = (p.sc || []).some(s => s && s.w);
      if (isLegacy){ legacyPlays++; if (won) legacyWins++; continue; }
      const parsed = _aeParseNemesis(p.b);
      if (!parsed) continue;
      // "Increased difficulty" is a BGStats board tag alongside the nemesis;
      // its absence means the play was on the default (Normal) difficulty.
      const inc = /increas/i.test(String(p.b || ''));
      const f = faced[parsed.key] || (faced[parsed.key] = { name: parsed.name, won: false, wonNormal: false, wonIncreased: false, attempts: 0 });
      f.attempts++;
      if (won){ f.won = true; if (inc) f.wonIncreased = true; else f.wonNormal = true; }
    }
  }
  const stat = (name) => {
    const f = faced[_aeNorm(name)];
    return {
      won: !!(f && f.won),
      wonIncreased: !!(f && f.wonIncreased),
      wonNormalOnly: !!(f && f.won && !f.wonIncreased),
      attempted: !!(f && !f.won && f.attempts)
    };
  };

  // Tally goal progress over OWNED boxes only.
  const ownedBoxNames = new Set(AE_BOXES.filter(b => b.owned).map(b => b.x));
  let defeated = 0, totalOwned = 0, bestDiff = 0, incN = 0;
  AE_NEMESES.forEach(n => {
    if (!ownedBoxNames.has(n.x)) return;
    totalOwned++;
    const s = stat(n.n);
    if (s.won){ defeated++; if (n.d > bestDiff) bestDiff = n.d; if (s.wonIncreased) incN++; }
  });

  // ☠ (gold) = beaten on Increased difficulty · ✓ = beaten on Normal only
  // (still to conquer on Increased) · ✗ = attempted · ○ = not yet faced.
  const pill = (n) => {
    const s = stat(n.n);
    let cls, icon, state;
    if (s.wonIncreased){ cls = 'ae-won ae-inc'; icon = '&#9760;&#65038;'; state = 'defeated on Increased difficulty'; }
    else if (s.won){ cls = 'ae-won'; icon = '&#10003;'; state = 'defeated on Normal (not yet on Increased)'; }
    else if (s.attempted){ cls = 'ae-lost'; icon = '&#10007;'; state = 'attempted'; }
    else { cls = 'ae-none'; icon = '&#9675;'; state = 'not yet faced'; }
    return `<span class="ae-pill ${cls}" title="${n.n} · difficulty ${n.d} · ${state}"><span class="ae-ic">${icon}</span>${n.n}<span class="ae-d">${n.d}</span></span>`;
  };

  const boxesHtml = AE_BOXES.map(box => {
    const mems = AE_NEMESES.filter(n => n.x === box.x).sort((a,b)=> a.d-b.d || a.n.localeCompare(b.n));
    if (!mems.length) return '';
    const done = mems.filter(n => stat(n.n).won).length;
    const lock = !box.owned;
    const spoiler = box.spoiler && !lock;
    const cls = 'ae-grp' + (lock ? ' ae-locked' : '') + (spoiler ? ' ae-spoiler' : '');
    const onclick = spoiler ? ' onclick="this.classList.toggle(\'ae-revealed\')"' : '';
    const head = `<div class="ae-grp-head"><span class="ae-grp-name">${lock?'&#128274; ':''}${box.x}</span><span class="ae-grp-count">${lock?'not owned':done+'/'+mems.length}</span></div>`;
    const body = `<div class="ae-pills">${mems.map(pill).join('')}</div>`;
    const veil = spoiler ? `<div class="ae-veil">&#128274; Legacy of Gravehold &mdash; tap to reveal (spoilers)</div>` : '';
    return `<div class="${cls}"${onclick}>${head}${veil}${body}</div>`;
  }).join('');

  // Any nemesis you've faced that isn't in the database (future content) →
  // its own group so your real history is always represented.
  const known = new Set(AE_NEMESES.map(n => _aeNorm(n.n)));
  const extras = Object.keys(faced).filter(k => !known.has(k)).map(k => faced[k]);
  const extrasHtml = extras.length ? `<div class="ae-grp"><div class="ae-grp-head"><span class="ae-grp-name">Other (from your plays)</span><span class="ae-grp-count">${extras.filter(e=>e.won).length}/${extras.length}</span></div><div class="ae-pills">${extras.map(e=>{const cls=e.won?('ae-won'+(e.wonIncreased?' ae-inc':'')):'ae-lost';const ic=e.won?(e.wonIncreased?'&#9760;&#65038;':'&#10003;'):'&#10007;';return `<span class="ae-pill ${cls}"><span class="ae-ic">${ic}</span>${e.name}</span>`;}).join('')}</div></div>` : '';

  const legacyHtml = legacyPlays > 0 ? `
    <div class="ae-legacy">
      <div class="ae-legacy-top"><span>&#128274; Legacy Campaign</span><span class="ae-legacy-stat">${legacyWins} won · ${legacyPlays} sessions</span></div>
      <div class="ae-legacy-sub">Hidden to keep the story spoiler-free.</div>
    </div>` : '';

  return `
    <div class="ae-box">
      <div class="st-head"><span class="st-title">&#128128; Nemesis Codex</span><span class="st-count">${defeated} / ${totalOwned} defeated</span></div>
      <div class="ae-stats">
        <div class="ae-stat"><span class="ae-stat-val ae-won-txt">${defeated}</span><span class="ae-stat-lbl">Defeated</span></div>
        <div class="ae-stat"><span class="ae-stat-val ae-inc-txt">${incN}</span><span class="ae-stat-lbl">On Increased <span class="ae-sk">&#9760;&#65038;</span></span></div>
        <div class="ae-stat"><span class="ae-stat-val">${bestDiff || '&mdash;'}</span><span class="ae-stat-lbl">Top difficulty</span></div>
      </div>
      ${boxesHtml}
      ${extrasHtml}
      ${legacyHtml}
      <div class="st-legend"><span class="ae-pill ae-inc" style="pointer-events:none"><span class="ae-ic">&#9760;&#65038;</span>Increased</span> <span class="ae-pill ae-won" style="pointer-events:none"><span class="ae-ic">&#10003;</span>Normal only</span> <span class="ae-pill ae-lost" style="pointer-events:none"><span class="ae-ic">&#10007;</span>attempted</span> <span class="ae-pill ae-none" style="pointer-events:none"><span class="ae-ic">&#9675;</span>not yet</span> &middot; small number = nemesis difficulty</div>
    </div>`;
}

