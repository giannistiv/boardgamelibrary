// ── Spirit Island conquest board (game page, Plays tab) ──
// Every adversary level, spirit and scenario in our boxes, and how far we've
// pushed each. The adversary and scenario come from the play's board field;
// the level from the notes on the BGG play ("Level 2\n\nSweden"), which
// tools/fetch-play-notes.py brings in as BGG_PLAY_NOTES. A game with no level
// in its notes counts as played in order: the level after the last win
// against that adversary, the same level again after a loss, level 0 the
// first time. Difficulties are the official ones from the rulebooks.

const SI_BGGID = 162886;
const SI_BOXES = {
  base: 'Base game', bc: 'Branch & Claw', ff: 'Feather & Flame', je: 'Jagged Earth', hz: 'Horizons', ni: 'Nature Incarnate',
};
// The boxes on our shelf; other boxes only show up if a game used them.
const SI_OWNED = new Set(['base', 'bc', 'ff', 'je', 'hz']);
const SI_COMPLEXITY = { L: 'Low', M: 'Moderate', H: 'High', V: 'Very high' };
const SI_SPIRITS = [
  ["Lightning's Swift Strike", 'base', 'L'], ['River Surges in Sunlight', 'base', 'L'], ['Shadows Flicker Like Flame', 'base', 'L'],
  ['Vital Strength of the Earth', 'base', 'L'], ['Thunderspeaker', 'base', 'M'], ['A Spread of Rampant Green', 'base', 'M'],
  ["Ocean's Hungry Grasp", 'base', 'H'], ['Bringer of Dreams and Nightmares', 'base', 'H'],
  ['Keeper of the Forbidden Wilds', 'bc', 'M'], ['Sharp Fangs Behind the Leaves', 'bc', 'M'],
  ['Heart of the Wildfire', 'ff', 'H'], ['Serpent Slumbering Beneath the Island', 'ff', 'H'],
  ['Downpour Drenches the World', 'ff', 'H'], ['Finder of Paths Unseen', 'ff', 'V'],
  ['Volcano Looming High', 'je', 'M'], ['Lure of the Deep Wilderness', 'je', 'M'], ['Many Minds Move as One', 'je', 'M'],
  ['Shifting Memory of Ages', 'je', 'M'], ["Stone's Unyielding Defiance", 'je', 'M'], ['Grinning Trickster Stirs Up Trouble', 'je', 'M'],
  ['Vengeance as a Burning Plague', 'je', 'H'], ['Shroud of Silent Mist', 'je', 'H'],
  ['Starlight Seeks Its Form', 'je', 'V'], ['Fractured Days Split the Sky', 'je', 'V'],
  ['Devouring Teeth Lurk Underfoot', 'hz', 'L'], ['Sun-Bright Whirlwind', 'hz', 'L'], ['Rising Heat of Stone and Sand', 'hz', 'L'],
  ['Fathomless Mud of the Swamp', 'hz', 'L'], ['Eyes Watch From the Trees', 'hz', 'L'],
  ['Ember-Eyed Behemoth', 'ni', 'M'], ['Towering Roots of the Jungle', 'ni', 'M'], ['Hearth-Vigil', 'ni', 'M'],
  ['Breath of Darkness Down Your Spine', 'ni', 'H'], ['Relentless Gaze of the Sun', 'ni', 'H'], ['Dances Up Earthquakes', 'ni', 'V'],
  ['Wandering Voice Keens Delirium', 'ni', 'H'], ['Wounded Waters Bleeding', 'ni', 'H'],
].map(([name, box, cx]) => ({ name, box, cx }));
// Difficulty at levels 0–6.
const SI_ADVERSARIES = [
  { name: 'Brandenburg-Prussia', box: 'base', d: [1, 2, 4, 6, 7, 9, 10], m: ['prussia', 'brandenburg', 'bp'] },
  { name: 'England', box: 'base', d: [1, 3, 4, 6, 7, 9, 11] },
  { name: 'Sweden', box: 'base', d: [1, 2, 3, 5, 6, 7, 8] },
  { name: 'France', box: 'bc', d: [2, 3, 5, 7, 8, 9, 10], m: ['franceplantationcolony'] },
  { name: 'Habsburg Monarchy', box: 'je', d: [2, 3, 5, 6, 8, 9, 10], m: ['habsburg', 'habsburgmonarchylivestockcolony', 'livestockcolony'] },
  { name: 'Russia', box: 'je', d: [1, 3, 4, 6, 7, 9, 11] },
  { name: 'Scotland', box: 'ff', d: [1, 3, 4, 6, 7, 8, 10] },
  { name: 'Habsburg Mining Expedition', box: 'ni', d: [1, 3, 4, 5, 7, 9, 10], m: ['miningexpedition', 'habsburgmining'] },
];
const SI_SCENARIOS = [
  { name: 'Blitz', box: 'base', d: 0 }, { name: "Guard the Isle's Heart", box: 'base', d: 0 },
  { name: 'Rituals of Terror', box: 'base', d: 3 }, { name: 'Dahan Insurrection', box: 'base', d: 4 },
  { name: 'Second Wave', box: 'bc', d: 1 }, { name: 'Powers Long Forgotten', box: 'bc', d: 1 },
  { name: 'A Diversity of Spirits', box: 'ff', d: 0 }, { name: 'Varied Terrains', box: 'ff', d: 2 },
  { name: 'Elemental Invocation', box: 'je', d: 1 }, { name: 'Despicable Theft', box: 'je', d: 2 },
  { name: 'The Great River', box: 'je', d: 3 }, { name: 'Ward the Shores', box: 'je', d: 2 },
  { name: 'Rituals of the Destroying Flame', box: 'je', d: 3 },
  { name: 'Surges of Colonization', box: 'ni', d: 2 }, { name: 'Destiny Unfolds', box: 'ni', d: -1 },
];

function _siNorm(s) { return String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]/g, ''); }
function _siSpirit(name) {
  // BGG cuts the spirit at 32 characters, so a prefix is enough
  const k = _siNorm(name);
  if (!k) return null;
  return SI_SPIRITS.find(s => { const n = _siNorm(s.name); return n === k || (k.length >= 12 && n.startsWith(k)); }) || null;
}

// Every logged game, with its adversary, level and scenario worked out.
function _siGames(plays) {
  const adv = {}, scen = {};
  SI_ADVERSARIES.forEach(a => [a.name, ...(a.m || [])].forEach(k => { adv[_siNorm(k)] = a; }));
  SI_SCENARIOS.forEach(s => { scen[_siNorm(s.name)] = s; });
  const notes = (typeof BGG_PLAY_NOTES !== 'undefined' && BGG_PLAY_NOTES[SI_BGGID]) || [];
  const games = (plays || []).filter(p => p && Array.isArray(p.sc)).slice()
    .sort((a, b) => ((a.t || a.date) + (a.e || '')).localeCompare((b.t || b.date) + (b.e || '')))
    .map(p => {
      const spirits = p.sc.map(s => ({ player: s.n, spirit: _siSpirit(s.r), raw: s.r || '' }));
      // the BGG play this is: same day, and a spirit in common (or the only one that day)
      const sameDay = notes.filter(n => n.date === p.date);
      const mine = new Set(spirits.map(s => s.spirit && s.spirit.name));
      const note = sameDay.find(n => n.players.some(x => { const s = _siSpirit(x.color); return s && mine.has(s.name); }))
        || (sameDay.length === 1 ? sameDay[0] : null);
      const text = [p.b || '', note ? note.notes : ''].join('／');
      const toks = text.split(/[／/\n,]+/).map(t => t.replace(/#\w+/g, '').trim()).filter(Boolean);
      let a = null, s = null;
      for (const t of toks) {
        const k = _siNorm(t.replace(/\b(level|lvl|l)\s*\d\b/ig, ''));
        if (!a && adv[k]) a = adv[k];
        if (!s && scen[k]) s = scen[k];
      }
      const m = text.match(/\b(?:level|lvl)\s*(\d)\b/i);
      return { p, date: p.date, won: p.sc.some(x => x.w), spirits, adv: a, scen: s,
        level: a && m ? Number(m[1]) : null, levelFrom: a && m ? 'notes' : null, note };
    });
  // levels the notes don't give: as if played in order
  const last = {};
  for (const g of games) {
    if (!g.adv) continue;
    const prev = last[g.adv.name];
    if (g.level == null) {
      g.level = prev ? Math.min(6, prev.level + (prev.won ? 1 : 0)) : 0;
      g.levelFrom = 'order';
    }
    last[g.adv.name] = g;
  }
  games.forEach(g => {
    g.diff = (g.adv ? g.adv.d[g.level] : 0) + (g.scen ? g.scen.d : 0);
  });
  return games;
}

function buildSpiritIslandHtml(bggId, plays) {
  if (Number(bggId) !== SI_BGGID) return '';
  const esc = _escapeHtml;
  const games = _siGames(plays);
  if (!games.length) return '';
  const wins = games.filter(g => g.won);
  const shown = (box, used) => SI_OWNED.has(box) || used;

  // adversary ladders
  const ladders = SI_ADVERSARIES.map(a => {
    const gs = games.filter(g => g.adv === a);
    if (!shown(a.box, gs.length)) return null;
    const best = Math.max(-1, ...gs.filter(g => g.won).map(g => g.level));
    const cells = a.d.map((d, lvl) => {
      const at = gs.filter(g => g.level === lvl);
      const won = at.some(g => g.won);
      const cls = won ? 'won' : lvl <= best ? 'implied' : at.length ? 'lost' : lvl === best + 1 ? 'next' : '';
      const how = at.length ? at.map(g => `${_siDate(g.date)} ${g.won ? 'won' : 'lost'}${g.levelFrom === 'order' ? ' (level not in the notes)' : ''}`).join(', ') : lvl <= best ? 'cleared by a higher win' : 'not played';
      return `<span class="si-lvl si-${cls}" title="${esc(a.name)} level ${lvl} · difficulty ${d} · ${esc(how)}"><b>${lvl}</b><i>${d}</i></span>`;
    }).join('');
    return { a, best, gs, html: `<div class="si-ladder"><div class="si-lname">${esc(a.name)}<small>${esc(SI_BOXES[a.box])}${gs.length ? ` · ${gs.length} game${gs.length > 1 ? 's' : ''}` : ''}</small></div><div class="si-lvls">${cells}</div></div>` };
  }).filter(Boolean);
  const levelsBeaten = ladders.reduce((n, l) => n + l.best + 1, 0);
  const levelsAll = ladders.length * 7;

  // the next step up: the next rung of each adversary, around the hardest you've won
  const top = Math.max(0, ...wins.map(g => g.diff));
  const rungs = ladders.filter(l => l.best < 6).map(l => ({ a: l.a, lvl: l.best + 1, d: l.a.d[l.best + 1] }))
    .sort((x, y) => Math.abs(x.d - (top + 1)) - Math.abs(y.d - (top + 1)) || x.d - y.d).slice(0, 3);

  // spirits
  const bySpirit = new Map();
  games.forEach(g => g.spirits.forEach(s => {
    if (!s.spirit) return;
    const r = bySpirit.get(s.spirit) || { n: 0, w: 0, who: new Set() };
    r.n++; if (g.won) r.w++; r.who.add(s.player);
    bySpirit.set(s.spirit, r);
  }));
  const spiritsShown = SI_SPIRITS.filter(s => shown(s.box, bySpirit.has(s)));
  const boxes = [...new Set(spiritsShown.map(s => s.box))];
  const spiritHtml = boxes.map(b => `<div class="si-box"><div class="si-boxname">${esc(SI_BOXES[b])}</div><div class="si-spirits">${spiritsShown.filter(s => s.box === b).map(s => {
    const r = bySpirit.get(s);
    return `<span class="si-spirit${r ? (r.w ? ' won' : ' lost') : ''}" title="${esc(s.name)} · ${SI_COMPLEXITY[s.cx]} complexity${r ? ` · ${r.n} game${r.n > 1 ? 's' : ''}, ${r.w} won · ${esc([...r.who].join(', '))}` : ' · not played yet'}">
      <i class="si-cx si-cx-${s.cx}">${s.cx}</i>${esc(s.name)}${r ? `<b>${r.n}</b>` : ''}</span>`;
  }).join('')}</div></div>`).join('');
  const unplayed = spiritsShown.filter(s => !bySpirit.has(s));

  // scenarios
  const scenShown = SI_SCENARIOS.filter(s => shown(s.box, games.some(g => g.scen === s)));
  const scenHtml = scenShown.map(s => {
    const gs = games.filter(g => g.scen === s);
    const cls = gs.some(g => g.won) ? 'won' : gs.length ? 'lost' : '';
    return `<span class="si-scen si-${cls || 'none'}" title="${esc(s.name)} · difficulty ${s.d}${gs.length ? ` · ${gs.length} game${gs.length > 1 ? 's' : ''}` : ''}">${cls === 'won' ? '✓ ' : cls === 'lost' ? '✗ ' : ''}${esc(s.name)} <i>${s.d}</i></span>`;
  }).join('');

  // every game by difficulty, newest first
  const W = 320, H = 70, maxD = Math.max(8, ...games.map(g => g.diff));
  const dots = games.map((g, i) => {
    const x = games.length > 1 ? (i / (games.length - 1)) * W : W / 2;
    const y = H - (g.diff / maxD) * H;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" class="${g.won ? 'w' : 'l'}"><title>${esc(g.date)} · difficulty ${g.diff}</title></circle>`;
  }).join('');
  const line = games.map((g, i) => `${games.length > 1 ? ((i / (games.length - 1)) * W).toFixed(1) : W / 2},${(H - (g.diff / maxD) * H).toFixed(1)}`).join(' ');
  const log = games.slice().reverse().map(g => `<div class="si-game">
      <span class="si-gdate">${_siDate(g.date)}</span>
      <span class="si-gres ${g.won ? 'w' : 'l'}">${g.won ? 'W' : 'L'}</span>
      <span class="si-gwhat"><b>${g.adv ? `${esc(g.adv.name)} ${g.level}` : g.scen ? '' : 'No adversary'}${g.adv && g.scen ? ' · ' : ''}${g.scen ? esc(g.scen.name) : ''}</b>${g.levelFrom === 'order' ? ' <span class="si-dim" title="No level in the BGG notes: counted as played in order">(level by order)</span>' : ''}
        <br><span class="si-dim">${g.spirits.map(s => `${esc(s.player)}: ${esc(s.spirit ? s.spirit.name : s.raw || '?')}`).join(' · ')}</span></span>
      <span class="si-gdiff" title="Difficulty">${g.diff}</span>
    </div>`).join('');

  const hardest = wins.slice().sort((a, b) => b.diff - a.diff || b.date.localeCompare(a.date))[0];
  const never = ladders.filter(l => !l.gs.length).map(l => l.a.name);
  return `
    <div class="si-board">
      <div class="st-head"><span class="st-title">&#127755; Spirit Island conquest</span></div>
      <div class="si-tiles">
        <div class="si-tile"><b>${levelsBeaten}<small>/${levelsAll}</small></b><span>Adversary levels</span></div>
        <div class="si-tile"><b>${spiritsShown.length - unplayed.length}<small>/${spiritsShown.length}</small></b><span>Spirits played</span></div>
        <div class="si-tile"><b>${scenShown.filter(s => games.some(g => g.scen === s && g.won)).length}<small>/${scenShown.length}</small></b><span>Scenarios won</span></div>
        <div class="si-tile"><b>${hardest ? hardest.diff : 0}</b><span>Hardest win</span></div>
      </div>
      ${hardest ? `<div class="si-note">Hardest win: <b>${hardest.adv ? `${esc(hardest.adv.name)} level ${hardest.level}` : ''}${hardest.adv && hardest.scen ? ' + ' : ''}${hardest.scen ? esc(hardest.scen.name) : ''}</b>, difficulty ${hardest.diff} (${_siDate(hardest.date)}).</div>` : ''}
      ${rungs.length ? `<div class="si-sec">Next step up</div><div class="si-rungs">${rungs.map(r => `<div class="si-rung"><b>${esc(r.a.name)} ${r.lvl}</b><span>difficulty ${r.d}${r.d > top ? ` · +${r.d - top} on your best` : ''}</span></div>`).join('')}</div>` : ''}
      ${never.length ? `<div class="si-note">Never faced: <b>${esc(never.join(', '))}</b>.</div>` : ''}
      <div class="si-sec">Adversaries <span class="si-hint">level · difficulty</span></div>
      <div class="si-ladders">${ladders.map(l => l.html).join('')}</div>
      <div class="si-legend"><span><i class="si-lvl si-won"></i>Won</span><span><i class="si-lvl si-implied"></i>Cleared by a higher win</span><span><i class="si-lvl si-lost"></i>Lost</span><span><i class="si-lvl si-next"></i>Next</span></div>
      <div class="si-sec">Spirits <span class="si-hint">${unplayed.length} not played yet</span></div>
      ${spiritHtml}
      <div class="si-legend"><span><i class="si-cx si-cx-L">L</i>Low</span><span><i class="si-cx si-cx-M">M</i>Moderate</span><span><i class="si-cx si-cx-H">H</i>High</span><span><i class="si-cx si-cx-V">V</i>Very high complexity</span></div>
      <div class="si-sec">Scenarios <span class="si-hint">with difficulty</span></div>
      <div class="si-scens">${scenHtml}</div>
      <div class="si-sec">Every game by difficulty</div>
      <svg class="si-chart" viewBox="-6 -8 ${W + 12} ${H + 16}" aria-label="Difficulty of every game"><polyline points="${line}"/>${dots}</svg>
      <div class="si-games">${log}</div>
      <div class="si-note">Difficulty is the adversary level's plus the scenario's. Levels come from the notes on the BGG plays; a game without one counts as played in order. Write the level in the play's notes as “Level 3” to keep it exact.</div>
    </div>`;
}

function _siDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
