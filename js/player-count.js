// ── Player count: BGG's votes vs how the group plays ──
// BGG_EXTRAS (data/bgg-extras.js) holds, per game, the player counts BGG
// voters call best and recommended. The game page shows them next to the
// count this group plays the game at most; the game-night picker scores games
// with the same helpers.

// "2,4" / "3-5" → Set of counts
function _pcSet(ranges) {
  const out = new Set();
  for (const part of String(ranges || '').split(',')) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part.trim());
    if (m) for (let n = Number(m[1]); n <= Number(m[2] || m[1]); n++) out.add(n);
  }
  return out;
}

// {best: Set, rec: Set, votes, expansion} or null when BGG has nothing on it
function bggPlayerPoll(bggId) {
  const e = (typeof BGG_EXTRAS !== 'undefined') ? BGG_EXTRAS[bggId] : null;
  if (!e) return null;
  return { best: _pcSet(e[0]), rec: _pcSet(e[1]), votes: e[2] || 0, expansion: !!e[3] };
}

// BGG's co-op flag and kinds (letters, see data/bgg-extras.js); null when unknown.
function bggIsCoop(bggId) {
  const e = (typeof BGG_EXTRAS !== 'undefined') ? BGG_EXTRAS[bggId] : null;
  return e && e.length > 4 ? !!e[4] : null;
}
function bggKinds(bggId) {
  const e = (typeof BGG_EXTRAS !== 'undefined') ? BGG_EXTRAS[bggId] : null;
  return e && e.length > 5 ? e[5] : null;
}

// BGG's play time [min, max] in minutes, its mechanics (a Set of ids) and its
// overall rank (0 when unranked); null / empty when unknown.
function bggTimes(bggId) {
  const e = (typeof BGG_EXTRAS !== 'undefined') ? BGG_EXTRAS[bggId] : null;
  return e && e.length > 7 && e[6] > 0 ? [e[6], Math.max(e[6], e[7])] : null;
}
function bggMechanics(bggId) {
  const e = (typeof BGG_EXTRAS !== 'undefined') ? BGG_EXTRAS[bggId] : null;
  return new Set(e && e.length > 8 && e[8] ? e[8].split(' ').map(Number) : []);
}
function bggRank(bggId) {
  const e = (typeof BGG_EXTRAS !== 'undefined') ? BGG_EXTRAS[bggId] : null;
  return e && e.length > 9 ? Number(e[9]) || 0 : 0;
}

// A game's play time as text: BGG's when known ("90–150 min"), else the list's own.
function gameTimeText(g) {
  const t = g && bggTimes(g.bggId);
  if (!t) return (g && g.playTime) || '';
  return t[0] === t[1] ? `${t[0]} min` : `${t[0]}–${t[1]} min`;
}
// The shortest a game takes, in minutes (BGG's minimum, else the list's own).
function gameMinTime(g) {
  const t = g && bggTimes(g.bggId);
  return t ? t[0] : (g && g.playTime ? parseMinTime(g.playTime) : 0);
}

// ── Mechanics filter ──
// The mechanics that say how a game plays come first as buttons (some group a
// few of BGG's: drafting is open, closed or action drafting); every other
// mechanic BGG knows is in an "Other…" list. A game matches if it has any of
// the ones picked. Picked values are a group key or 'm:<BGG id>'.
const MECH_GROUPS = [
  ['wp', 'Worker placement', [2082, 2933]], ['deck', 'Deck building', [2664]], ['draft', 'Drafting', [2041, 2984, 2838]],
  ['area', 'Area control', [2080]], ['tile', 'Tile placement', [2002]], ['route', 'Route building', [2081]],
  ['luck', 'Push your luck', [2661]], ['trick', 'Trick-taking', [2009]], ['deduce', 'Deduction', [3002]],
  ['hidden', 'Hidden roles', [2891, 2814]], ['bluff', 'Bluffing', [2014]], ['auction', 'Auction', [2012]],
  ['nego', 'Negotiation', [2915]], ['rt', 'Real-time', [2831]], ['dice', 'Dice', [2072]],
  ['set', 'Set collection', [2004]], ['teams', 'Teams', [2019]],
];
const _MECH_GROUP_IDS = new Set(MECH_GROUPS.flatMap(g => g[2]));

function _mechIds(value) {
  if (String(value).startsWith('m:')) return [Number(String(value).slice(2))];
  const g = MECH_GROUPS.find(x => x[0] === value);
  return g ? g[2] : [];
}
function gameHasMechanic(bggId, picked) {
  if (!picked || !picked.size) return true;
  const have = bggMechanics(bggId);
  for (const v of picked) if (_mechIds(v).some(id => have.has(id))) return true;
  return false;
}
// Buttons for a filter panel: the groups, anything picked from "Other…" (so it
// can be turned off), and the "Other…" list itself.
function mechanicChipsHtml(group, picked) {
  const chips = MECH_GROUPS.map(([k, label]) => [k, label]);
  const names = (typeof BGG_MECHANICS !== 'undefined') ? BGG_MECHANICS : {};
  for (const v of picked) if (String(v).startsWith('m:')) chips.push([v, _escapeHtml(names[v.slice(2)] || 'Mechanic')]);
  const others = Object.entries(names)
    .filter(([id]) => !_MECH_GROUP_IDS.has(Number(id)) && !picked.has('m:' + id))
    .sort((a, b) => a[1].localeCompare(b[1]));
  return _gbChips(group, chips, v => picked.has(String(v)))
    + `<select class="gb-sort mech-more" data-mech-more="${group}" aria-label="Another mechanic"><option value="">Other&hellip;</option>`
    + others.map(([id, n]) => `<option value="m:${id}">${_escapeHtml(n)}</option>`).join('') + '</select>';
}

function isBggExpansion(bggId) {
  const p = bggPlayerPoll(bggId);
  return !!(p && p.expansion);
}

// The player count this game is played at most, from the logged plays.
function usualPlayerCount(plays) {
  const counts = {};
  for (const p of plays || []) counts[p.sc.length] = (counts[p.sc.length] || 0) + 1;
  let n = 0, times = 0;
  for (const k in counts) if (counts[k] > times) { n = Number(k); times = counts[k]; }
  return n ? { n, times, of: (plays || []).length } : null;
}

function _pcRangeText(set) {
  const a = [...set].sort((x, y) => x - y);
  if (!a.length) return '';
  const parts = [];
  for (let i = 0; i < a.length; i++) {
    let j = i;
    while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++;
    parts.push(i === j ? `${a[i]}` : `${a[i]}&ndash;${a[j]}`);
    i = j;
  }
  return parts.join(', ');
}

function buildPlayerCountHtml(game, plays) {
  const poll = bggPlayerPoll(game.bggId);
  const usual = usualPlayerCount(plays);
  const hasPoll = poll && poll.votes > 0 && (poll.best.size || poll.rec.size);
  if (!hasPoll && !usual) return '';
  // Chips cover what the box supports, plus anything voted on or played.
  const m = /^(\d+)(?:-(\d+))?$/.exec(String(game.players || '').trim());
  let lo = m ? Number(m[1]) : Infinity, hi = m ? Number(m[2] || m[1]) : 0;
  const extend = n => { lo = Math.min(lo, n); hi = Math.max(hi, n); };
  if (hasPoll) [...poll.best, ...poll.rec].forEach(extend);
  if (usual) extend(usual.n);
  if (!isFinite(lo) || hi - lo < 1) return '';   // one count only: nothing to compare
  const cap = Math.min(hi, lo + 9);
  let chips = '';
  for (let n = lo; n <= cap; n++) {
    const cls = hasPoll && poll.best.has(n) ? ' best' : hasPoll && poll.rec.has(n) ? ' rec' : '';
    const isUsual = usual && usual.n === n;
    const tip = [cls === ' best' ? 'Best (BGG)' : cls === ' rec' ? 'Recommended (BGG)' : hasPoll ? 'Not recommended (BGG)' : '',
                 isUsual ? 'Your group plays it most at this count' : ''].filter(Boolean).join(' · ');
    chips += `<span class="pc-n${cls}${isUsual ? ' usual' : ''}"${tip ? ` title="${tip}"` : ''}>${n}${n === cap && hi > cap ? '+' : ''}</span>`;
  }
  const notes = [];
  if (hasPoll && poll.best.size) notes.push(`Best at ${_pcRangeText(poll.best)}`);
  if (hasPoll && poll.rec.size) notes.push(`recommended ${_pcRangeText(poll.rec)}`);
  if (usual) notes.push(`you play it most with ${usual.n} (${usual.times} of ${usual.of} play${usual.of !== 1 ? 's' : ''})`);
  return `
      <div class="pc">
        <div class="pc-head"><span class="pc-title">Player count</span>${hasPoll ? `<span class="pc-src">BGG &middot; ${poll.votes} vote${poll.votes !== 1 ? 's' : ''}</span>` : ''}</div>
        <div class="pc-row">${chips}</div>
        <div class="pc-note">${notes.join(' &middot; ')}</div>
      </div>`;
}
