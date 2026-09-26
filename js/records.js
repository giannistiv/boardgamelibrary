// ── Game records ──
// Group-wide records shown on a game's page, under the play-history stats:
// champion, most wins, longest win streak, best / worst / average winning
// score, most plays and the first play. Co-op games (everyone wins or loses
// together) get team records instead, and no-result games only the ones that
// don't need a winner.

const REC_MIN_PLAYS = 2;

// "134", "-5", "12.5", and round-by-round sums as typed into BGStats
// ("14+4+2", "51-6"). Anything else isn't a score.
function _recScore(v) {
  const t = String(v == null ? '' : v).replace(/\s+/g, '');
  if (!/^-?\d+(\.\d+)?([+-]\d+(\.\d+)?)*$/.test(t)) return null;
  const sum = t.match(/[+-]?\d+(\.\d+)?/g).reduce((a, n) => a + Number(n), 0);
  return Math.round(sum * 100) / 100;
}

function _recIsAnon(name) { return /^anonymous/i.test(name || ''); }

function _recNames(names) {
  const esc = names.map(_escapeHtml);
  return esc.length <= 2 ? esc.join(' &amp; ') : `${esc[0]}, ${esc[1]} +${esc.length - 2}`;
}

function _recNum(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''); }

// The names sharing the top count in a Map(name -> count), and that count.
function _recTop(counts) {
  let best = 0, names = [];
  counts.forEach((n, name) => {
    if (n > best) { best = n; names = [name]; }
    else if (n === best) names.push(name);
  });
  return { best, names };
}

function _recTile(icon, label, value, sub, title) {
  const t = title ? ` title="${_escapeHtml(title)}"` : '';
  return `<div class="gr-tile"${t}><span class="gr-label">${icon} ${label}</span>`
    + `<span class="gr-val">${value}</span>${sub ? `<span class="gr-sub">${sub}</span>` : ''}</div>`;
}

// Co-op when nobody ever wins alone: every play is won or lost by the whole
// table. Categories alone miss imported games, which often have none.
function _recIsCoop(game, plays) {
  let teamWins = 0;
  for (const p of plays) {
    const w = p.sc.filter(s => s.w).length;
    if (w && w < p.sc.length) return false;
    if (w && p.sc.length > 1) teamWins++;
  }
  return teamWins > 0 || (Array.isArray(game.categories) && game.categories.includes('Co-op'));
}

// Longest run of consecutive wins in `seq` (oldest first, true = win).
function _recStreak(seq) {
  let cur = 0, max = 0;
  for (const won of seq) { cur = won ? cur + 1 : 0; if (cur > max) max = cur; }
  return { max, ongoing: max > 0 && cur === max };
}

function buildGameRecordsHtml(game, plays) {
  if (!plays || plays.length < REC_MIN_PLAYS) return '';
  // Oldest first; plays on the same day are stored newest first, so reverse
  // before the (stable) date sort.
  const asc = plays.slice().reverse().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const named = p => p.sc.filter(s => !_recIsAnon(s.n));
  const noResult = isNoResultGame(game.bggId);
  const coop = !noResult && _recIsCoop(game, plays);
  const tiles = [];

  // Plays and wins per player
  const playCount = new Map(), winCount = new Map();
  for (const p of asc) {
    for (const s of named(p)) {
      playCount.set(s.n, (playCount.get(s.n) || 0) + 1);
      if (s.w) winCount.set(s.n, (winCount.get(s.n) || 0) + 1);
    }
  }

  // Scores: which end wins (golf-style games are "lowest wins"), best, worst,
  // and the average winning score.
  const scored = [];
  let hiWins = 0, loWins = 0;
  const winScores = [];
  for (const p of asc) {
    const all = p.sc.map(s => ({ s, v: _recScore(s.s) })).filter(x => x.v !== null);
    all.forEach(x => { if (!_recIsAnon(x.s.n)) scored.push({ name: x.s.n, v: x.v, date: p.date }); });
    const won = all.filter(x => x.s.w);
    if (won.length) winScores.push(won[0].v);  // one per play, however many tied
    if (!coop && won.length && all.length > 1) {
      const vs = all.map(x => x.v), max = Math.max(...vs), min = Math.min(...vs);
      if (max !== min) {
        if (won.some(x => x.v === max)) hiWins++;
        else if (won.some(x => x.v === min)) loWins++;
      }
    }
  }
  // All zeros is BGStats' placeholder for "no score kept", not a record.
  if (scored.every(x => x.v === 0)) { scored.length = 0; winScores.length = 0; }
  const lowBest = loWins > hiWins;
  const better = (a, b) => (lowBest ? a < b : a > b);
  let best = null, worst = null;
  for (const x of scored) {  // oldest first, so ties go to whoever got there first
    if (!best || better(x.v, best.v)) best = x;
    if (!worst || better(worst.v, x.v)) worst = x;
  }

  if (coop) {
    const results = asc.map(p => p.sc.some(s => s.w));
    const won = results.filter(Boolean).length;
    const last = asc[asc.length - 1];
    const lastWon = results[results.length - 1];
    tiles.push(_recTile('&#129309;', 'Team record', `${won}&ndash;${results.length - won}`,
      `${Math.round((won / results.length) * 100)}% won`));
    tiles.push(_recTile(lastWon ? '&#9989;' : '&#9760;&#65039;', 'Last result', lastWon ? 'Won' : 'Lost',
      _fmtDateShort(last.date) + (last.b ? ` &middot; ${_escapeHtml(last.b)}` : '')));
    const st = _recStreak(results);
    if (st.max >= 2) {
      tiles.push(_recTile('&#128293;', 'Win streak', `${st.max} in a row`, st.ongoing ? 'still going' : ''));
    }
    const mw = _recTop(winCount);
    if (mw.best > 0) {
      tiles.push(_recTile('&#127942;', 'Most wins', _recNames(mw.names),
        `${mw.best} win${mw.best !== 1 ? 's' : ''}${mw.names.length > 1 ? ' each' : ''}`, mw.names.join(', ')));
    }
  } else if (!noResult) {
    // Champion: the winner(s) of the latest decided play
    for (let i = asc.length - 1; i >= 0; i--) {
      const winners = named(asc[i]).filter(s => s.w).map(s => s.n);
      if (winners.length) {
        tiles.push(_recTile('&#128081;', 'Champion', _recNames(winners),
          `won ${_fmtDateShort(asc[i].date)}`, winners.join(', ')));
        break;
      }
    }
    const mw = _recTop(winCount);
    if (mw.best > 0) {
      const sub = mw.names.length > 1
        ? `${mw.best} win${mw.best !== 1 ? 's' : ''} each`
        : `${mw.best} of ${playCount.get(mw.names[0])} plays`;
      tiles.push(_recTile('&#127942;', 'Most wins', _recNames(mw.names), sub, mw.names.join(', ')));
    }
    // Longest win streak per player, over the decided plays they were in
    const seqs = new Map();
    for (const p of asc) {
      if (!p.sc.some(s => s.w)) continue;
      for (const s of named(p)) {
        if (!seqs.has(s.n)) seqs.set(s.n, []);
        seqs.get(s.n).push(!!s.w);
      }
    }
    let stMax = 0, stNames = [], stOngoing = false;
    seqs.forEach((seq, name) => {
      const st = _recStreak(seq);
      if (st.max > stMax) { stMax = st.max; stNames = [name]; stOngoing = st.ongoing; }
      else if (st.max === stMax) { stNames.push(name); stOngoing = stOngoing || st.ongoing; }
    });
    if (stMax >= 2) {
      tiles.push(_recTile('&#128293;', 'Win streak', _recNames(stNames),
        `${stMax} in a row${stOngoing ? ' &middot; still going' : ''}`, stNames.join(', ')));
    }
  }

  // Everyone who shares a score record, in the order they first reached it.
  const holders = v => [...new Set(scored.filter(x => x.v === v).map(x => x.name))];
  const scoreTile = (icon, label, rec) => {
    const names = holders(rec.v);
    return _recTile(icon, label, _recNames(names),
      `${_recNum(rec.v)} &middot; ${names.length > 1 ? 'first ' : ''}${_fmtDateShort(rec.date)}`, names.join(', '));
  };
  if (best) {
    tiles.push(scoreTile('&#11088;', lowBest ? 'Best (lowest)' : 'Best score', best));
    if (!noResult && !coop && scored.length > 1 && worst.v !== best.v) {
      tiles.push(scoreTile('&#128201;', 'Worst score', worst));
    }
  }
  if (!noResult && !coop && winScores.length >= 3) {
    const avg = winScores.reduce((a, v) => a + v, 0) / winScores.length;
    tiles.push(_recTile('&#128202;', 'Avg winning score', _recNum(Math.round(avg * 10) / 10),
      `across ${winScores.length} plays`));
  }

  const mp = _recTop(playCount);
  if (mp.best >= 2) {
    tiles.push(_recTile('&#127922;', 'Most plays', _recNames(mp.names),
      `${mp.best} plays${mp.names.length > 1 ? ' each' : ''}`, mp.names.join(', ')));
  }
  const first = asc[0];
  const ago = _timeAgo(new Date(first.date + 'T12:00:00').getTime());
  tiles.push(_recTile('&#128197;', 'First played', _fmtDateShort(first.date), ago));

  return `
        <div class="game-records">
          <div class="gr-title">Records</div>
          <div class="gr-grid">${tiles.join('')}</div>
        </div>`;
}
