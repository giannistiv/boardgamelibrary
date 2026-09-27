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
