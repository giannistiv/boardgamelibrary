const AUZTRALIA_BGG_IDS = new Set([231581, 320110]); // base + Tasmania
const GAME_PLAYER_NAME = '__GAME__';

function _leaderboardRanksForPlay(sc, bggId) {
  if (!Array.isArray(sc) || sc.length < 1) return null;
  const isAuztralia = bggId && AUZTRALIA_BGG_IDS.has(Number(bggId));
  const winners = sc.filter(s => s && s.w === true);
  if (winners.length === 0) {
    // AuZtralia: if no human won, the Game wins for Elo purposes
    if (isAuztralia && sc.length >= 1) {
      const ranks = sc.map(s => ({ player: s.n, rank: 2 }));
      ranks.push({ player: GAME_PLAYER_NAME, rank: 1 });
      return ranks;
    }
    return null;
  }
  if (sc.length < 2) return null;
  if (winners.length === sc.length && !isAuztralia) return null; // everyone wins → coop (skip unless AuZtralia)
  // winners.length < sc.length: some won, some lost (including 2+ winners = tie/team)

  const parsed = sc.map(s => {
    if (s.s == null || s.s === '') return null;
    const t = String(s.s).trim();
    if (!t) return null;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
    // scores like "16+3+16" → sum
    if (/^[\d.+\-\s]+$/.test(t)) {
      try {
        const v = t.split('+').reduce((a, b) => a + Number(b.trim() || 0), 0);
        return isFinite(v) ? v : null;
      } catch (_) { return null; }
    }
    return null;
  });

  if (parsed.every(v => v !== null)) {
    const wScores = sc.map((s, i) => s.w ? parsed[i] : null).filter(v => v !== null);
    const lScores = sc.map((s, i) => !s.w ? parsed[i] : null).filter(v => v !== null);
    const minW = Math.min(...wScores), maxW = Math.max(...wScores);
    const minL = Math.min(...lScores), maxL = Math.max(...lScores);

    let dir = null;
    if (minW > maxL) dir = 'desc';
    else if (maxW < minL) dir = 'asc';

    if (dir) {
      const indexed = sc.map((s, i) => ({ s, n: parsed[i] }));
      indexed.sort((a, b) => dir === 'desc' ? b.n - a.n : a.n - b.n);
      const out = [];
      let prev = null, rank = 0;
      indexed.forEach((item, i) => {
        if (prev === null || item.n !== prev) { rank = i + 1; prev = item.n; }
        out.push({ player: item.s.n, rank });
      });
      return out;
    }
  }

  // Fallback: winners all at rank 1, losers all at rank 2
  return sc.map(s => ({ player: s.n, rank: s.w ? 1 : 2 }));
}

function _yearStartCutoff() {
  return new Date().getFullYear() + '-01-01';
}

// Compute the main Elo leaderboard for a closed past year [YYYY-01-01, YYYY-12-31].
// Returns { ratings, plays, lastPlayDate } similar to _computeEloLeaderboard.
// Used by the 'year-of-champ' achievement.
function _computeMainEloForYear(year) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const flat = [];
  for (const bggId in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[bggId]) {
      if (!p || !p.date || !Array.isArray(p.sc)) continue;
      if (p.date < start || p.date > end) continue;
      flat.push({ bggId: Number(bggId), date: p.date, t: p.t || p.date, sc: p.sc });
    }
  }
  flat.sort((a, b) => a.t.localeCompare(b.t));

  const ratings = {}, plays = {}, lastPlayDate = {};
  for (const play of flat) {
    const ranks = _leaderboardRanksForPlay(play.sc, play.bggId);
    if (!ranks) continue;
    const byName = {};
    for (const r of ranks) {
      const mapped = NAME_MAP[r.player] || r.player;
      if (!mapped) continue;
      if (byName[mapped] == null || r.rank < byName[mapped]) byName[mapped] = r.rank;
    }
    const participants = Object.keys(byName).map(n => ({ player: n, rank: byName[n] }));
    if (participants.length < 2) continue;
    const game = findGameByBggId(play.bggId);
    const cx = (game && typeof game.complexity === 'number' && game.complexity > 0) ? game.complexity : 2.5;
    const w = cx / 5;
    const lossMult = Math.min(1, Math.max(0.7, 3 / participants.length));
    for (const m of participants) {
      if (ratings[m.player] == null) ratings[m.player] = 1000;
      if (plays[m.player] == null) plays[m.player] = 0;
    }
    const pre = {}, preCount = {};
    for (const m of participants) { pre[m.player] = ratings[m.player]; preCount[m.player] = plays[m.player]; }
    const deltas = {};
    for (const m of participants) deltas[m.player] = 0;
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const a = participants[i], b = participants[j];
        if (a.rank === b.rank) continue;
        const winner = a.rank < b.rank ? a : b;
        const loser  = a.rank < b.rank ? b : a;
        const Rw = pre[winner.player], Rl = pre[loser.player];
        const Ew = 1 / (1 + Math.pow(10, (Rl - Rw) / 400));
        const Kw = preCount[winner.player] < 5 ? 48 : 32;
        const Kl = preCount[loser.player]  < 5 ? 48 : 32;
        deltas[winner.player] += Kw * w * (1 - Ew);
        deltas[loser.player]  -= Kl * w * (1 - Ew) * lossMult;
      }
    }
    for (const m of participants) {
      if (m.player === GAME_PLAYER_NAME) { ratings[m.player] = 1000; continue; }
      ratings[m.player] += deltas[m.player];
      plays[m.player]++;
      lastPlayDate[m.player] = play.date;
    }
  }
  delete ratings[GAME_PLAYER_NAME];
  return { ratings, plays, lastPlayDate };
}

// Replay every competitive play of the current year through the same Elo
// pipeline used by the leaderboard, capturing each participant's per-play
// delta. Returned as a Map keyed by `${bggId}|${date}|${idx}` so callers can
// look up the deltas for any specific play they hold.
function _computePerPlayElo(mode) {
  const yearStart = _yearStartCutoff();
  const flat = [];
  for (const bggId in PLAY_HISTORY) {
    const arr = PLAY_HISTORY[bggId];
    arr.forEach((p, idx) => {
      if (!p || !p.date || !Array.isArray(p.sc)) return;
      if (p.date < yearStart) return;
      if (mode === 'south' && !_isBoardSouthPlay(p)) return;
      flat.push({ bggId: Number(bggId), idx, p });
    });
  }
  // Replay oldest→newest — the exact reverse of the newest-first order the
  // plays lists render with, so each play's +/- deltas line up with where it
  // sits in the displayed list. Same-timestamp plays (one BGStats batch) can't
  // be separated by time, so we mirror the display tie-break in reverse:
  // descending bggId, then descending array index.
  flat.sort((a, b) => {
    const at = a.p.t || a.p.date;
    const bt = b.p.t || b.p.date;
    if (at !== bt) return at.localeCompare(bt);
    if (a.bggId !== b.bggId) return b.bggId - a.bggId;
    return b.idx - a.idx;
  });

  const ratings = {}, counts = {};
  const out = new Map();

  for (const { bggId, idx, p } of flat) {
    const ranks = _leaderboardRanksForPlay(p.sc, bggId);
    if (!ranks) continue;
    const byName = {};
    for (const r of ranks) {
      const mapped = NAME_MAP[r.player] || r.player;
      if (!mapped) continue;
      if (byName[mapped] == null || r.rank < byName[mapped]) byName[mapped] = r.rank;
    }
    const participants = Object.keys(byName).map(n => ({ player: n, rank: byName[n] }));
    if (participants.length < 2) continue;
    const game = findGameByBggId(bggId);
    const cx = (game && typeof game.complexity === 'number' && game.complexity > 0) ? game.complexity : 2.5;
    const w = cx / 5;
    const lossMult = Math.min(1, Math.max(0.7, 3 / participants.length));
    for (const m of participants) {
      if (ratings[m.player] == null) ratings[m.player] = 1000;
      if (counts[m.player] == null) counts[m.player] = 0;
    }
    const pre = {}, preCount = {};
    for (const m of participants) { pre[m.player] = ratings[m.player]; preCount[m.player] = counts[m.player]; }
    const deltas = {};
    for (const m of participants) deltas[m.player] = 0;
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const a = participants[i], b = participants[j];
        if (a.rank === b.rank) continue;
        const winner = a.rank < b.rank ? a : b;
        const loser  = a.rank < b.rank ? b : a;
        const Rw = pre[winner.player], Rl = pre[loser.player];
        const Ew = 1 / (1 + Math.pow(10, (Rl - Rw) / 400));
        const El = 1 - Ew;
        const Kw = preCount[winner.player] < 5 ? 48 : 32;
        const Kl = preCount[loser.player]  < 5 ? 48 : 32;
        deltas[winner.player] += Kw * w * (1 - Ew);
        deltas[loser.player]  -= Kl * w * El * lossMult;
      }
    }
    out.set(`${bggId}|${p.date}|${idx}`, deltas);
    for (const m of participants) {
      if (m.player === GAME_PLAYER_NAME) continue;
      ratings[m.player] += deltas[m.player];
      counts[m.player]++;
    }
  }
  return out;
}

// Known Board South regulars whose mere presence in a play is enough to
// classify it as a Board South play (in addition to the " - BS" suffix
// convention). Names here should match post-NAME_MAP canonical names.
const BOARD_SOUTH_REGULARS = new Set([
  'LGeorge', 'Θανος', 'Στιβ',
  'Γιαννης Φωτοπουλος', 'Ολγα Σιδερη', 'Μαντσος',
]);

// A play counts as Board South only if EITHER:
//   - the location is explicitly "Board South", OR
//   - LGeorge participated (LGeorge is the BS anchor — if he's at the table
//     it's Board South, otherwise it isn't, by the user's own rule).
// The " - BS" name suffix only marks individual *members* (see
// _isBoardSouthMember) — it doesn't promote a random play to BS on its own.
function _isBoardSouthPlay(p) {
  if (!p) return false;
  if (p.l === 'Board South') return true;
  if (Array.isArray(p.sc)) {
    for (const s of p.sc) {
      if (!s || typeof s.n !== 'string') continue;
      const canonical = (typeof NAME_MAP !== 'undefined' && NAME_MAP[s.n]) || s.n;
      if (canonical === 'LGeorge') return true;
    }
  }
  return false;
}

function _computeEloLeaderboard(mode) {
  const yearStart = _yearStartCutoff();
  const flat = [];
  for (const bggId in PLAY_HISTORY) {
    PLAY_HISTORY[bggId].forEach((p, idx) => {
      if (!p || !p.date || !Array.isArray(p.sc)) return;
      if (p.date < yearStart) return;
      if (mode === 'south' && !_isBoardSouthPlay(p)) return;
      flat.push({ bggId: Number(bggId), idx, date: p.date, t: p.t || p.date, sc: p.sc });
    });
  }
  // Replay oldest→newest. Full timestamp first (from the BGStats import) so
  // same-day plays keep chronological order. Plays from a single batch upload
  // share an identical timestamp, so we break that tie as the exact reverse of
  // the newest-first plays list (descending bggId, then descending array
  // index) — keeping the leaderboard, the per-play deltas and the displayed
  // play order all in agreement.
  flat.sort((a, b) => {
    if (a.t !== b.t) return a.t.localeCompare(b.t);
    if (a.bggId !== b.bggId) return b.bggId - a.bggId;
    return b.idx - a.idx;
  });

  const ratings = {};
  const plays = {};
  const lastPlayDate = {};
  const lastDelta = {};
  const firstPlayDate = {};
  const streaks = {}; // current consecutive-win streak per player

  for (const play of flat) {
    const ranks = _leaderboardRanksForPlay(play.sc, play.bggId);
    if (!ranks) continue;

    // Normalize names via NAME_MAP, dedupe duplicate names (keep best rank)
    const byName = {};
    for (const r of ranks) {
      const mapped = NAME_MAP[r.player] || r.player;
      if (!mapped) continue;
      if (byName[mapped] == null || r.rank < byName[mapped]) byName[mapped] = r.rank;
    }
    const participants = Object.keys(byName).map(n => ({ player: n, rank: byName[n] }));
    const N = participants.length;
    if (N < 2) continue;

    const game = findGameByBggId(play.bggId);
    const cx = (game && typeof game.complexity === 'number' && game.complexity > 0) ? game.complexity : 2.5;
    const w = cx / 5;
    const lossMult = Math.min(1, Math.max(0.7, 3 / N));

    for (const m of participants) {
      if (ratings[m.player] == null) ratings[m.player] = 1000;
      if (plays[m.player] == null) plays[m.player] = 0;
    }

    const pre = {}, preCount = {};
    for (const m of participants) {
      pre[m.player] = ratings[m.player];
      preCount[m.player] = plays[m.player];
    }

    const deltas = {};
    for (const m of participants) deltas[m.player] = 0;

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const a = participants[i], b = participants[j];
        if (a.rank === b.rank) continue;
        const winner = a.rank < b.rank ? a : b;
        const loser  = a.rank < b.rank ? b : a;
        const Rw = pre[winner.player], Rl = pre[loser.player];
        const Ew = 1 / (1 + Math.pow(10, (Rl - Rw) / 400));
        const El = 1 - Ew;
        const Kw = preCount[winner.player] < 5 ? 48 : 32;
        const Kl = preCount[loser.player]  < 5 ? 48 : 32;
        deltas[winner.player] += Kw * w * (1 - Ew);
        deltas[loser.player]  -= Kl * w * El * lossMult;
      }
    }

    for (const m of participants) {
      if (m.player === GAME_PLAYER_NAME) {
        ratings[m.player] = 1000; // pin synthetic Game opponent at base
        continue;
      }
      ratings[m.player] += deltas[m.player];
      plays[m.player]++;
      lastPlayDate[m.player] = play.date;
      if (!firstPlayDate[m.player]) firstPlayDate[m.player] = play.date;
      lastDelta[m.player] = deltas[m.player];
      if (m.rank === 1) {
        streaks[m.player] = (streaks[m.player] || 0) + 1;
      } else {
        streaks[m.player] = 0;
      }
    }
  }

  delete ratings[GAME_PLAYER_NAME];
  return { ratings, plays, lastPlayDate, lastDelta, firstPlayDate, streaks };
}

function _computeRivalryOfYear(mode, forPlayer) {
  const cutoff = _yearStartCutoff();
  const focus = forPlayer ? (NAME_MAP[forPlayer] || forPlayer) : null;

  const pairs = {};
  for (const bggId in PLAY_HISTORY) {
    for (const play of PLAY_HISTORY[bggId]) {
      if (!play || !play.date || play.date < cutoff || !Array.isArray(play.sc)) continue;
      if (mode === 'south' && !_isBoardSouthPlay(play)) continue;
      const ranks = _leaderboardRanksForPlay(play.sc, bggId);
      if (!ranks) continue;
      const byName = {};
      for (const r of ranks) {
        if (r.player === GAME_PLAYER_NAME) continue;
        const m = NAME_MAP[r.player] || r.player;
        if (!m) continue;
        if (byName[m] == null || r.rank < byName[m]) byName[m] = r.rank;
      }
      const list = Object.entries(byName);
      if (list.length < 2) continue;
      // If we have a focus player, skip plays they weren't in
      if (focus && byName[focus] == null) continue;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const [n1, r1] = list[i];
          const [n2, r2] = list[j];
          // If focusing on a player, only consider pairs that include them
          if (focus && n1 !== focus && n2 !== focus) continue;
          // In Board South mode, both members of the pair must be BS members.
          if (mode === 'south' && (!_isBoardSouthMember(n1) || !_isBoardSouthMember(n2))) continue;
          const [a, b] = n1 < n2 ? [n1, n2] : [n2, n1];
          const aRank = a === n1 ? r1 : r2;
          const bRank = a === n1 ? r2 : r1;
          const key = a + '||' + b;
          if (!pairs[key]) pairs[key] = { a, b, total: 0, aWins: 0, bWins: 0, lastDate: '' };
          pairs[key].total++;
          if (aRank < bRank) pairs[key].aWins++;
          else if (bRank < aRank) pairs[key].bWins++;
          if (play.date > pairs[key].lastDate) pairs[key].lastDate = play.date;
        }
      }
    }
  }

  let best = null;
  if (mode === 'south') {
    // Board South rivalry — unchanged: most-played pair, then closest by
    // absolute win-difference.
    for (const k in pairs) {
      const p = pairs[k];
      if (p.total < 2) continue;
      const closeness = Math.abs(p.aWins - p.bWins);
      if (!best) { best = p; continue; }
      const bestCloseness = Math.abs(best.aWins - best.bWins);
      if (p.total > best.total) best = p;
      else if (p.total === best.total && closeness < bestCloseness) best = p;
    }
  } else {
    // Main rivalry — only pairs played within the last 2 months count, and
    // we pick the *proportionally* closest head-to-head record: |aWins-bWins|
    // divided by total games. So 90–100 (ratio 0.05) beats 4–12 (ratio 0.50).
    // Total games is only a tie-breaker when two pairs are equally close.
    const twoMonthsAgo = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 2);
      return d.toISOString().slice(0, 10);
    })();
    const ratio = (p) => Math.abs(p.aWins - p.bWins) / p.total;
    for (const k in pairs) {
      const p = pairs[k];
      if (p.total < 2) continue;
      if (p.lastDate < twoMonthsAgo) continue; // recency gate
      if (!best) { best = p; continue; }
      const r = ratio(p), rBest = ratio(best);
      if (r < rBest) best = p;
      else if (r === rBest && p.total > best.total) best = p;
    }
  }
  return best;
}

function _eloToColorScore(elo) {
  // Map Elo to a 0–10 rating scale used by ratingColor().
  // 850 → 0 (red), 1000 → 5 (yellow), 1150+ → 10 (green).
  return Math.max(0, Math.min(10, (elo - 850) / 30));
}

let _leaderboardMode = 'main'; // 'main' | 'south' — kept for legacy callers; UI now splits across tabs
let _bsSubTab = 'leaderboard'; // 'leaderboard' | 'vote' — used by the dedicated Board South tab

// A canonical name belongs on the Board South leaderboard only if it's a
// known BS regular OR carries the " - BS" disambiguation suffix. Random
// people who happened to show up to a BS night don't get ranked here.
function _isBoardSouthMember(canonicalName) {
  if (!canonicalName) return false;
  if (BOARD_SOUTH_REGULARS.has(canonicalName)) return true;
  if (typeof canonicalName === 'string' && canonicalName.includes(' - BS')) return true;
  return false;
}

function _renderEloLeaderboardInto(container, mode) {
  const isSouth = mode === 'south';
  const data = _computeEloLeaderboard(mode);
  const currentYear = new Date().getFullYear();

  const rows = Object.keys(data.ratings)
    .filter(p => data.plays[p] >= 1)
    .filter(p => !isSouth || _isBoardSouthMember(p))
    .map(p => ({
      name: p,
      elo: Math.round(data.ratings[p]),
      plays: data.plays[p],
      lastPlayed: data.lastPlayDate[p],
      lastDelta: data.lastDelta[p] || 0,
      provisional: data.plays[p] < 5,
      streak: data.streaks[p] || 0,
    }))
    .sort((a, b) => b.elo - a.elo);

  const titleTxt = isSouth ? `Board South ${currentYear}` : `Leaderboard ${currentYear}`;

  const rawPlayer = localStorage.getItem('bgl-player');
  const focusPlayer = rawPlayer ? (NAME_MAP[rawPlayer] || rawPlayer) : null;
  const rivalry = _computeRivalryOfYear(mode, focusPlayer);
  const rivalryHead = focusPlayer ? '🔥 Your Top Rival' : '🔥 Top Rivalry';
  const rivalryHtml = rivalry ? `
    <div class="lb-rivalry">
      <div class="lb-rivalry-head">${rivalryHead}</div>
      <div class="lb-rivalry-body">
        <span class="lb-rivalry-name" data-visit-player="${rivalry.a.replace(/"/g, '&quot;')}">${rivalry.a}</span>
        <span class="lb-rivalry-score">${rivalry.aWins}–${rivalry.bWins}</span>
        <span class="lb-rivalry-name" data-visit-player="${rivalry.b.replace(/"/g, '&quot;')}">${rivalry.b}</span>
      </div>
      <div class="lb-rivalry-meta">${rivalry.total} play${rivalry.total !== 1 ? 's' : ''} in ${currentYear} · last ${_fmtDateShort(rivalry.lastDate)}</div>
    </div>` : '';

  if (rows.length === 0) {
    container.innerHTML = `
      <div class="lb-header">
        <div class="lb-title">${titleTxt}</div>
      </div>
      <div class="lb-empty">No active players to rank yet.</div>`;
    return;
  }

  const podium = rows.slice(0, Math.min(3, rows.length));
  const rest = rows.slice(podium.length);
  const medals = ['🥇', '🥈', '🥉'];
  const slotOrder = podium.length === 3 ? [1, 0, 2]
                   : podium.length === 2 ? [1, 0]
                   : [0];

  const podiumHtml = slotOrder.map(idx => {
    const p = podium[idx];
    if (!p) return '';
    const color = ratingColor(_eloToColorScore(p.elo));
    const initial = p.name.charAt(0).toUpperCase();
    const prov = p.provisional ? '<span class="lb-prov-badge">PROV</span>' : '';
    const streakHtml = p.streak >= 2 ? `<span class="lb-streak" title="${p.streak}-win streak">🔥 ${p.streak}</span>` : '';
    // Show the most recent point delta on the podium too — same convention as
    // the list rows below (green for gain, red for loss, dim for zero).
    const deltaCls = p.lastDelta > 0 ? 'pos' : (p.lastDelta < 0 ? 'neg' : '');
    const deltaSign = p.lastDelta > 0 ? '+' : '';
    const deltaTxt = `${deltaSign}${p.lastDelta.toFixed(1)}`;
    return `<div class="lb-podium-card rank-${idx + 1}" data-visit-player="${p.name.replace(/"/g, '&quot;')}">
      <div class="lb-podium-medal">${medals[idx]}</div>
      <div class="lb-podium-avatar">${initial}</div>
      <div class="lb-podium-name">${p.name}${prov}${streakHtml}</div>
      <div class="lb-podium-elo" style="color:${color}">${p.elo}</div>
      <div class="lb-podium-delta ${deltaCls}">${deltaTxt}</div>
      <div class="lb-podium-meta">${p.plays} play${p.plays !== 1 ? 's' : ''} · last ${_fmtDateShort(p.lastPlayed)}</div>
    </div>`;
  }).join('');

  const listHtml = rest.map((p, i) => {
    const rank = podium.length + i + 1;
    const color = ratingColor(_eloToColorScore(p.elo));
    const initial = p.name.charAt(0).toUpperCase();
    const deltaCls = p.lastDelta > 0 ? 'pos' : (p.lastDelta < 0 ? 'neg' : '');
    const deltaSign = p.lastDelta > 0 ? '+' : '';
    const deltaTxt = `${deltaSign}${p.lastDelta.toFixed(1)}`;
    const prov = p.provisional ? '<span class="lb-prov-badge">PROV</span>' : '';
    const streakHtml = p.streak >= 2 ? `<span class="lb-streak" title="${p.streak}-win streak">🔥 ${p.streak}</span>` : '';
    return `<div class="lb-row" data-visit-player="${p.name.replace(/"/g, '&quot;')}">
      <div class="lb-rank">${rank}</div>
      <div class="lb-avatar">${initial}</div>
      <div class="lb-name-block">
        <div class="lb-name">${p.name}${prov}</div>
        <div class="lb-sub"><span>${p.plays} play${p.plays !== 1 ? 's' : ''}</span>${streakHtml}</div>
      </div>
      <div class="lb-elo-block">
        <div class="lb-elo" style="color:${color}">${p.elo}</div>
        <div class="lb-delta ${deltaCls}">${deltaTxt}</div>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="lb-header">
      <div class="lb-title">${titleTxt}</div>
      <div class="lb-count">${rows.length} player${rows.length !== 1 ? 's' : ''}</div>
    </div>
    ${rivalryHtml}
    ${podium.length > 0 ? `<div class="lb-podium">${podiumHtml}</div>` : ''}
    <div class="lb-list">${listHtml}</div>
    <div class="lb-explain">
      ${isSouth ? '<b>Board South League:</b> A separate Elo using only plays where the location is "Board South". Independent of the main leaderboard.<br><br>' : ''}<b>How it works:</b> Everyone starts at 1000 on Jan 1. Each play of ${currentYear} replays in date order — winners gain, losers drop, with bigger swings when the underdog wins. Complexity scales points (a win on weight 5 = full value, lighter games = less). Losses scale down with player count, and finishing last costs more than finishing mid-pack. <b>PROV</b> means fewer than 5 plays this year (points move faster). The leaderboard resets every January 1st.
    </div>
    ${isSouth ? _boardSouthPlaysSectionHtml() : ''}`;

  container.querySelectorAll('[data-visit-player]').forEach(el => {
    el.addEventListener('click', () => {
      showStatsView(el.dataset.visitPlayer, 'visiting');
      window.scrollTo(0, 0);
    });
  });
}

function showLeaderboardView() {
  // Top-level Leaderboard tab now shows only the Main Elo league.
  // Board South lives in its own tab (for BS regulars).
  const container = document.getElementById('leaderboard-view');
  _renderEloLeaderboardInto(container, 'main');
  window.scrollTo(0, 0);
}

// ── Board South: scoring-formula legend + recent-plays list ──
// Rendered beneath the Board South leaderboard. The legend documents the exact
// Elo math (so the +/- numbers are explainable), and the plays list shows each
// game's scoreboard with every player's point swing for that play.

function _boardSouthFormulaHtml(year) {
  return `<div class="bs-formula">
    <div class="bs-formula-head">📐 How the +/- is calculated</div>
    <div class="bs-formula-body">
      <p>Everyone resets to <b>R&nbsp;=&nbsp;1000</b> on January&nbsp;1 (${year}). Each play is scored as a mini round-robin: you're compared head-to-head with every other ranked player at the table, and your <b>+/-</b> for that play is the sum of all those pairings.</p>
      <div class="bs-formula-eq">
        <div>Expected result against one opponent:</div>
        <code>E = 1 / ( 1 + 10^((R<sub>opp</sub> − R<sub>you</sub>) / 400) )</code>
        <div>Points earned from that pairing:</div>
        <code>Δ = K · w · (S − E)&nbsp;&nbsp;— a loss is also × L</code>
      </div>
      <ul class="bs-formula-legend">
        <li><b>R</b> — your current rating. Everyone starts at <b>1000</b> and the board resets every January&nbsp;1.</li>
        <li><b>E</b> — your <i>expected</i> score (between 0 and 1): how likely the rating gap said you were to beat that opponent. A 400-point lead ≈ a 91% expectation.</li>
        <li><b>S</b> — the <i>actual</i> result of the pairing: <b>1</b> if you finished ahead of them, <b>0</b> if behind. A tie between two players cancels — that pairing scores nothing for either.</li>
        <li><b>K</b> — the step size (how fast your rating moves): <b>48</b> while you have fewer than 5 games this year (shown as <b>PROV</b>), then <b>32</b> afterwards.</li>
        <li><b>w</b> — game weight = BGG complexity ÷ 5. A heavy weight-5 game pays full value (×1.0); a light weight-2.5 filler pays half (×0.5). Unknown weight defaults to 2.5.</li>
        <li><b>N</b> — the number of ranked players in the play.</li>
        <li><b>L</b> — loss softener = 3 ÷ N, capped between 0.7 and 1.0, applied <i>only</i> to points you lose — so finishing last in a big group costs less per opponent than losing a one-on-one.</li>
      </ul>
      <p class="bs-formula-tldr"><b>In plain words:</b> beating someone you were already expected to beat earns only a little; upsetting a higher-rated player earns a lot. Heavier games count for more than fillers, a newcomer's rating swings faster for their first five games, and one rough night in a crowded game won't sink you.</p>
    </div>
  </div>`;
}

// Open a game's modal from the Board South plays list (inline onclick so it
// survives the innerHTML copy that showBoardSouthView() does).
