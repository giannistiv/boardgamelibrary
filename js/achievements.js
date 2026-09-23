const ACHIEVEMENTS = [
  { id:'first-win',       name:'First Blood',     desc:'Win your first game' },
  { id:'centurion',       name:'Centurion',       desc:'Play 100 games' },
  { id:'half-grand',      name:'Half-Grand',      desc:'Play 500 games' },
  { id:'graduated',       name:'Veteran',         desc:'Reach 10 plays (graduate from PROV)' },
  { id:'diversifier',     name:'Diversifier',     desc:'Play 25 different games' },
  { id:'social-butterfly',name:'Social Butterfly',desc:'Play with 25 different opponents' },
  { id:'globetrotter',    name:'Globetrotter',    desc:'Play in 5 different locations' },
  { id:'explorer',        name:'Explorer',        desc:'Play games from 8 different categories' },
  { id:'marathon',        name:'Marathon',        desc:'Play 5 games in a single day' },
  { id:'hot-streak',      name:'Hot Streak',      desc:'Win 3 in a row' },
  { id:'on-fire',         name:'On Fire',         desc:'Win 5 in a row' },
  { id:'inferno',         name:'Inferno',         desc:'Win 10 in a row' },
  { id:'comeback-kid',    name:'Comeback Kid',    desc:'Win after a 5-loss streak' },
  { id:'heavy-hitter',    name:'Heavy Hitter',    desc:'Win a game with weight 4+' },
  { id:'brain-burner',    name:'Brain Burner',    desc:'Win a game with weight 4.5+' },
  { id:'speed-demon',     name:'Speed Demon',     desc:'Win 10 light games (weight ≤1.5)' },
  { id:'heavy-lifter',    name:'Heavy Lifter',    desc:'Win 10 heavy games (weight ≥3)' },
  { id:'coop-captain',    name:'Coop Captain',    desc:'Earn 10 cooperative wins' },
  // ── Newer achievements ──
  { id:'beat-stiv',       name:'Stiv Slayer',     desc:'Win a game against Στιβ' },
  { id:'medalist',        name:'Medalist',        desc:'Finish top 3 on the main leaderboard' },
  { id:'ten-by-ten',      name:'Decuple',         desc:'Play 10 different games at least 10 times each' },
  { id:'campaigner',      name:'Campaigner',      desc:'Start a campaign or legacy game' },
  { id:'tastemaker',      name:'Tastemaker',      desc:'Pick a top 4 of favourite games' },
  { id:'critic',          name:'Critic',          desc:'Rate at least one game' },
  { id:'all-week-player', name:'All-Week Player', desc:'Have a play on every day of the week' },
  { id:'devoted',         name:'Devoted',         desc:'Play a single game more than 30 times' },
  { id:'streak-breaker',  name:'Streak Breaker',  desc:"End someone else's 3+ win streak" },
  { id:'coop-veteran',    name:'Coop Veteran',    desc:'Earn 50 cooperative wins' },
  { id:'tragic-hero',     name:'Tragic Hero',     desc:'Lose a cooperative game' },
  { id:'true-believer',   name:'True Believer',   desc:'Play 5 different Marvel games' },
  { id:'eurogamer',       name:'Eurogamer',       desc:'Play 5 different Euro-style games' },
  { id:'tactician',       name:'Tactician',       desc:'Play 5 different war or area-control games' },
  { id:'uwe-disciple',    name:'Uwe Disciple',    desc:'Play 5 different Uwe Rosenberg games' },
  // ── Latest additions ──
  { id:'year-of-champ',   name:'Year of the Champ',desc:'Finish a past year as #1 on the main leaderboard' },
  { id:'wooden-spoon',    name:'Wooden Spoon',    desc:'Finish last in 5 different games' },
  { id:'tiebreaker',      name:'Photo Finish',    desc:'Win a competitive game on a tiebreaker' },
  { id:'speed-run',       name:'Speed Run',       desc:'Play 10 games in a single calendar week' },
  { id:'big-group',       name:'Big Group',       desc:'Play with 6 or more players at one table' },
  { id:'decade-hopper',   name:'Decade Hopper',   desc:'Play games from 5 different release decades' },
  { id:'best-friend',     name:'Best Friend',     desc:'Reach 50 plays with the same opponent' },
  { id:'gateway-drug',    name:'Gateway Drug',    desc:"Win the first time someone else plays a new game" },
  { id:'renaissance',     name:'Renaissance Player',desc:'Play games from 5 different decades in a single year' },
];

// Achievements with custom SVG icons. Anything else falls back to default.svg
// (a simple star shape) so new entries render cleanly until we ship art.
const _ACH_ICON_IDS = new Set([
  // Original art set
  'first-win','centurion','half-grand','graduated','diversifier','social-butterfly',
  'globetrotter','explorer','marathon','hot-streak','on-fire','inferno','comeback-kid',
  'heavy-hitter','brain-burner','speed-demon','heavy-lifter','coop-captain',
  // Pre-existing extras still on disk:
  'giant-slayer','south-champ','top-dog','underdog',
  // Latest custom icons (newer + freshest additions):
  'beat-stiv','medalist','ten-by-ten','campaigner','tastemaker','critic',
  'all-week-player','devoted','streak-breaker','coop-veteran','tragic-hero',
  'true-believer','eurogamer','tactician','uwe-disciple',
  'year-of-champ','wooden-spoon','tiebreaker','speed-run','big-group',
  'decade-hopper','best-friend','gateway-drug','renaissance',
]);
function _achievementIcon(id) {
  return _ACH_ICON_IDS.has(id) ? `images/achievements/${id}.svg` : `images/achievements/default.svg`;
}

// Heuristics for thematic-family achievements.
function _isMarvelGame(g) {
  return g && typeof g.name === 'string' && /\bmarvel\b/i.test(g.name);
}
function _isEuroGame(g) {
  return g && Array.isArray(g.categories) && g.categories.includes('Euro');
}
function _isWarGame(g) {
  if (!g) return false;
  if (Array.isArray(g.categories) && g.categories.includes('Area Control')) return true;
  if (typeof g.name === 'string' && /\b(war|wars|battle|combat|skirmish)\b/i.test(g.name)) return true;
  // Known wargames in the library that don't match the regex above.
  const knownWargameIds = new Set([12333 /* Twilight Struggle */]);
  return knownWargameIds.has(Number(g.bggId));
}
function _isUweGame(g) {
  return g && typeof g.designer === 'string' && /Uwe Rosenberg/i.test(g.designer);
}

function computeAchievements(playerName) {
  // ── Build per-player play list and a global timeline (for cross-player
  //    streak detection used by 'streak-breaker'). ──
  const plays = []; // plays where playerName participated
  const allPlays = []; // every play, every player — for global streak tracking
  for (const bggId in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[bggId]) {
      if (!p || !p.date || !Array.isArray(p.sc)) continue;
      const me = p.sc.find(s => s.n === playerName);
      const entry = { date: p.date, bggId: Number(bggId), sc: p.sc, location: p.l };
      allPlays.push(entry);
      if (me) plays.push({ ...entry, me });
    }
  }
  plays.sort((a, b) => a.date.localeCompare(b.date));
  allPlays.sort((a, b) => a.date.localeCompare(b.date));

  const earned = {};
  const mark = (id, date) => { if (!earned[id]) earned[id] = date; };

  let totalPlays = 0, totalWins = 0;
  let coopWins = 0;
  let lightWins = 0, heavyWins = 0;
  let curStreak = 0, curLossStreak = 0;
  const gamesPlayed = new Set();
  const opponents = new Set();
  const locations = new Set();
  const categories = new Set();
  const perGameWR = {}; // bggId -> {plays, wins}
  const playsByDate = {}; // date -> count
  const tenPlayGames = new Set(); // bggIds the player has played at least 10 times
  const daysOfWeek = new Set();   // 0..6 weekdays the player has played on
  const marvelSet = new Set(), euroSet = new Set(), warSet = new Set(), uweSet = new Set();
  const lastPlaceGames = new Set();  // bggIds where the player finished last
  const playsByIsoWeek = {};         // 'YYYY-Www' → count
  const decadeSet = new Set();       // distinct release decades played
  const decadeByYear = {};           // calendar year → Set of decades played that year
  const opponentPlayCounts = {};     // opponent name → count of plays together

  // Pre-compute first-play date per (bggId, name) for 'gateway-drug'.
  const firstPlayOfGameByName = {}; // bggId → { name → 'YYYY-MM-DD' }
  for (const p of allPlays) {
    if (!firstPlayOfGameByName[p.bggId]) firstPlayOfGameByName[p.bggId] = {};
    for (const s of p.sc) {
      if (!s || !s.n) continue;
      const cur = firstPlayOfGameByName[p.bggId][s.n];
      if (!cur || p.date < cur) firstPlayOfGameByName[p.bggId][s.n] = p.date;
    }
  }

  // ISO week key helper: returns 'YYYY-Www' for a YYYY-MM-DD date string.
  const isoWeekKey = (dateStr) => {
    const [yy, mm, dd] = dateStr.split('-').map(Number);
    if (!yy) return null;
    const d = new Date(Date.UTC(yy, mm - 1, dd));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  };

  // ── Pass 1: walk the GLOBAL timeline tracking each player's competitive
  //    win-streak. When the active player wins a play in which an opponent's
  //    incoming streak is ≥ 3, mark 'streak-breaker'. We update streaks AFTER
  //    the check so the play that breaks the streak still sees the old value.
  const globalStreaks = {};
  for (const p of allPlays) {
    const isSolo = p.sc.length === 1;
    const allSame = p.sc.every(s => !!s.w === !!p.sc[0].w);
    const isCoop = !isSolo && allSame;
    if (!isSolo && !isCoop) {
      const me = p.sc.find(s => s.n === playerName);
      if (me && me.w) {
        for (const s of p.sc) {
          if (!s || s.n === playerName) continue;
          if ((globalStreaks[s.n] || 0) >= 3) {
            mark('streak-breaker', p.date);
            break;
          }
        }
      }
      // Update streaks for everyone in this play.
      for (const s of p.sc) {
        if (!s || !s.n) continue;
        if (s.w) globalStreaks[s.n] = (globalStreaks[s.n] || 0) + 1;
        else globalStreaks[s.n] = 0;
      }
    }
  }

  // ── Pass 2: walk the player's plays for per-player counters/conditions. ──
  for (const p of plays) {
    totalPlays++;
    gamesPlayed.add(p.bggId);
    if (p.location) locations.add(p.location);
    playsByDate[p.date] = (playsByDate[p.date] || 0) + 1;

    // Day-of-week tracking for 'all-week-player'.
    // YYYY-MM-DD parsed as UTC to avoid local-timezone drift.
    const [yy, mm, dd] = p.date.split('-').map(Number);
    if (yy && mm && dd) {
      const dow = new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay();
      daysOfWeek.add(dow);
      if (daysOfWeek.size === 7) mark('all-week-player', p.date);
    }

    for (const s of p.sc) {
      if (s && s.n && s.n !== playerName) opponents.add(s.n);
    }

    const game = findGameByBggId(p.bggId);
    if (game && Array.isArray(game.categories)) {
      for (const c of game.categories) categories.add(c);
    }

    // Thematic-family sets — counted per unique game played.
    if (game) {
      if (_isMarvelGame(game)) { marvelSet.add(p.bggId); if (marvelSet.size === 5) mark('true-believer', p.date); }
      if (_isEuroGame(game))   { euroSet.add(p.bggId);   if (euroSet.size === 5)   mark('eurogamer',     p.date); }
      if (_isWarGame(game))    { warSet.add(p.bggId);    if (warSet.size === 5)    mark('tactician',     p.date); }
      if (_isUweGame(game))    { uweSet.add(p.bggId);    if (uweSet.size === 5)    mark('uwe-disciple',  p.date); }
      if (isCampaign(game))    mark('campaigner', p.date);
    }

    const meWon = !!p.me.w;
    const isSolo = p.sc.length === 1;
    const allSame = p.sc.every(s => !!s.w === !!p.sc[0].w);
    const isCoop = !isSolo && allSame;

    if (meWon) totalWins++;
    if (isCoop && meWon) coopWins++;
    if (isCoop && !meWon && !isNoResultGame(p.bggId)) mark('tragic-hero', p.date);

    if (!perGameWR[p.bggId]) perGameWR[p.bggId] = { plays: 0, wins: 0 };
    perGameWR[p.bggId].plays++;
    if (meWon) perGameWR[p.bggId].wins++;

    // Devoted: any single game played > 30 times.
    if (perGameWR[p.bggId].plays === 31) mark('devoted', p.date);
    // Decuple: 10 different games each with ≥ 10 plays.
    if (perGameWR[p.bggId].plays === 10) {
      tenPlayGames.add(p.bggId);
      if (tenPlayGames.size === 10) mark('ten-by-ten', p.date);
    }

    // Competitive plays drive streaks + the Stiv Slayer marker.
    if (!isCoop && !isSolo) {
      if (meWon) {
        if (curLossStreak >= 5) mark('comeback-kid', p.date);
        curStreak++;
        curLossStreak = 0;
        if (curStreak >= 3)  mark('hot-streak', p.date);
        if (curStreak >= 5)  mark('on-fire',    p.date);
        if (curStreak >= 10) mark('inferno',    p.date);
        // Beat Στιβ: any competitive win where Στιβ was a participant who lost.
        if (playerName !== 'Στιβ') {
          for (const s of p.sc) {
            if (s && _origCanon(s.n) === 'Στιβ' && !s.w) { mark('beat-stiv', p.date); break; }
          }
        }
      } else {
        curStreak = 0;
        curLossStreak++;
      }
    }

    if (meWon && game && typeof game.complexity === 'number') {
      if (game.complexity >= 4)   mark('heavy-hitter', p.date);
      if (game.complexity >= 4.5) mark('brain-burner', p.date);
      if (game.complexity >= 3)              heavyWins++;
      if (game.complexity > 0 && game.complexity <= 1.5) lightWins++;
    }

    if (totalWins === 1)             mark('first-win',        p.date);
    if (totalPlays === 10)           mark('graduated',        p.date);
    if (totalPlays === 100)          mark('centurion',        p.date);
    if (totalPlays === 500)          mark('half-grand',       p.date);
    if (gamesPlayed.size === 25)     mark('diversifier',      p.date);
    if (opponents.size === 25)       mark('social-butterfly', p.date);
    if (locations.size === 5)        mark('globetrotter',     p.date);
    if (categories.size === 8)       mark('explorer',         p.date);
    if (playsByDate[p.date] === 5)   mark('marathon',         p.date);
    if (lightWins === 10)            mark('speed-demon',      p.date);
    if (heavyWins === 10)            mark('heavy-lifter',     p.date);
    if (coopWins === 10)             mark('coop-captain',     p.date);
    if (coopWins === 50)             mark('coop-veteran',     p.date);

    // ── Big Group: 6 or more distinct players at the same table. ──
    {
      const distinctPlayers = new Set(p.sc.map(s => s && s.n).filter(Boolean));
      if (distinctPlayers.size >= 6) mark('big-group', p.date);
    }

    // ── Speed Run: 10 plays in one ISO week. ──
    {
      const wk = isoWeekKey(p.date);
      if (wk) {
        playsByIsoWeek[wk] = (playsByIsoWeek[wk] || 0) + 1;
        if (playsByIsoWeek[wk] === 10) mark('speed-run', p.date);
      }
    }

    // ── Decade tracking: lifetime + per-year. ──
    if (game && typeof game.year === 'number' && game.year > 0) {
      const decade = Math.floor(game.year / 10) * 10;
      decadeSet.add(decade);
      if (decadeSet.size === 5) mark('decade-hopper', p.date);
      const py = (yy != null) ? yy : Number(p.date.slice(0, 4));
      if (!decadeByYear[py]) decadeByYear[py] = new Set();
      decadeByYear[py].add(decade);
      if (decadeByYear[py].size === 5) mark('renaissance', p.date);
    }

    // ── Best Friend: 50 plays with the same opponent. ──
    {
      const seenInThisPlay = new Set();
      for (const s of p.sc) {
        if (!s || !s.n || s.n === playerName) continue;
        if (seenInThisPlay.has(s.n)) continue;
        seenInThisPlay.add(s.n);
        opponentPlayCounts[s.n] = (opponentPlayCounts[s.n] || 0) + 1;
        if (opponentPlayCounts[s.n] === 50) mark('best-friend', p.date);
      }
    }

    // ── Wooden Spoon: finish last in 5 different competitive games. ──
    if (!isCoop && !isSolo) {
      const ranks = _leaderboardRanksForPlay(p.sc, p.bggId);
      if (ranks) {
        const myRank = ranks.find(r => r.player === playerName);
        if (myRank) {
          const maxRank = Math.max(...ranks.map(r => r.rank));
          if (myRank.rank === maxRank && maxRank > 1) {
            lastPlaceGames.add(p.bggId);
            if (lastPlaceGames.size === 5) mark('wooden-spoon', p.date);
          }
        }
      }
    }

    // ── Photo Finish: win on a tiebreaker (tied top score, marked winner). ──
    if (!isCoop && !isSolo && meWon && !earned['tiebreaker']) {
      const parsed = p.sc.map(s => {
        if (!s || s.s == null || s.s === '') return null;
        const t = String(s.s).trim();
        if (!t) return null;
        if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
        return null;
      });
      if (parsed.every(v => v !== null)) {
        const myIdx = p.sc.findIndex(s => s.n === playerName);
        const myScore = parsed[myIdx];
        // True tiebreaker = at least one other player also has my score AND is NOT a winner.
        const tiedNonWinner = p.sc.some((s, i) => i !== myIdx && parsed[i] === myScore && !s.w);
        if (tiedNonWinner) mark('tiebreaker', p.date);
      }
    }

    // ── Gateway Drug: win the first time an opponent ever played this game. ──
    if (meWon && !isSolo && !earned['gateway-drug']) {
      const fp = firstPlayOfGameByName[p.bggId] || {};
      for (const s of p.sc) {
        if (!s || !s.n || s.n === playerName) continue;
        if (fp[s.n] === p.date) { mark('gateway-drug', p.date); break; }
      }
    }
  }

  // ── Static post-checks: data outside PLAY_HISTORY ──
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = plays.length > 0 ? plays[plays.length - 1].date : today;

  // Tastemaker: the player has at least 4 favourites pinned.
  try {
    const favs = (typeof getPlayerFavorites === 'function')
      ? getPlayerFavorites(playerName)
      : [];
    if (Array.isArray(favs) && favs.length >= 4) mark('tastemaker', lastDate);
  } catch (_) {}

  // Critic: the player has rated at least one game.
  try {
    if (typeof ratingsCache !== 'undefined' && ratingsCache) {
      for (const bggId in ratingsCache) {
        const v = ratingsCache[bggId] && ratingsCache[bggId][playerName];
        if (v == null) continue;
        const value = (typeof v === 'object') ? v.value : v;
        if (typeof value === 'number' && value > 0) {
          mark('critic', lastDate);
          break;
        }
      }
    }
  } catch (_) {}

  // Medalist: currently top 3 on the main Elo leaderboard for this year.
  try {
    if (typeof _computeEloLeaderboard === 'function') {
      const data = _computeEloLeaderboard('main');
      const rows = Object.keys(data.ratings || {})
        .filter(p => (data.plays[p] || 0) >= 1)
        .map(p => ({ name: p, elo: data.ratings[p], lastDate: data.lastPlayDate[p] || today }))
        .sort((a, b) => b.elo - a.elo)
        .slice(0, 3);
      const me = rows.find(r => r.name === playerName);
      if (me) mark('medalist', me.lastDate);
    }
  } catch (_) {}

  // Year of the Champ: finished a past (already-closed) calendar year as #1
  // on the main Elo leaderboard. Skips the current in-progress year.
  try {
    const currentYear = new Date().getFullYear();
    const yearsSeen = new Set();
    for (const p of allPlays) {
      const y = Number(p.date.slice(0, 4));
      if (y && y < currentYear) yearsSeen.add(y);
    }
    let earliestWinYear = null;
    for (const y of yearsSeen) {
      const data = _computeMainEloForYear(y);
      const rows = Object.keys(data.ratings || {})
        .filter(p => (data.plays[p] || 0) >= 1)
        .map(p => ({ name: p, elo: data.ratings[p] }))
        .sort((a, b) => b.elo - a.elo);
      if (rows.length > 0 && rows[0].name === playerName) {
        if (earliestWinYear === null || y < earliestWinYear) earliestWinYear = y;
      }
    }
    if (earliestWinYear !== null) mark('year-of-champ', `${earliestWinYear}-12-31`);
  } catch (_) {}

  return earned;
}

// ── H-index ──
// Academic h-index applied to play counts: a player has an h-index of H when
// they have played H distinct games at least H times each. Returns the index
// plus the per-game play counts (sorted desc) so the UI can show which games
// form the "core" and which game is closest to pushing the index up.
function _computeHIndex(playerName) {
  const counts = {}; // bggId -> number of plays this player took part in
  for (const bggId in PLAY_HISTORY) {
    const arr = PLAY_HISTORY[bggId];
    if (!Array.isArray(arr)) continue;
    for (const p of arr) {
      if (!p || !Array.isArray(p.sc)) continue;
      if (p.sc.some(s => s && s.n === playerName)) {
        counts[bggId] = (counts[bggId] || 0) + 1;
      }
    }
  }
  const list = Object.keys(counts)
    .map(b => ({ bggId: Number(b), count: counts[b] }))
    .sort((a, b) => b.count - a.count || a.bggId - b.bggId);
  let h = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].count >= i + 1) h = i + 1;
    else break;
  }
  return { h, list };
}

function buildAchievementsHtml(playerName) {
  const earned = computeAchievements(playerName);
  const today = new Date().toISOString().slice(0, 10);
  const sevenAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString().slice(0, 10);

  const all = ACHIEVEMENTS.map(a => ({ ...a, earnedDate: earned[a.id] || null }));
  // Status-based achievements (currently top-3, has favourites, has rated)
  // carry the player's latest qualifying date, which advances with every
  // play — they'd sit in "Recently Earned" forever. Keep them out of the
  // recent list; they still appear in the full grid below.
  const statusAch = new Set(['tastemaker', 'critic', 'medalist']);
  const recent = all.filter(a => a.earnedDate && a.earnedDate >= sevenAgo
                                 && a.earnedDate <= today && !statusAch.has(a.id))
                    .sort((a, b) => b.earnedDate.localeCompare(a.earnedDate));
  const earnedCount = all.filter(a => a.earnedDate).length;

  const card = (a) => {
    const e = a.earnedDate;
    const tip = e ? `${a.desc} · earned ${e}` : a.desc;
    // Always show the description, regardless of earned/locked state.
    // Earned date is appended underneath when present.
    const dateLine = e ? `<div class="ach-date">Earned ${_fmtDateShort(e)}</div>` : '';
    return `<div class="ach-card${e ? '' : ' locked'}" title="${tip}">
      <div class="ach-icon" style="-webkit-mask-image:url(${_achievementIcon(a.id)});mask-image:url(${_achievementIcon(a.id)})"></div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
      ${dateLine}
    </div>`;
  };

  const recentHtml = recent.length > 0 ? `<div class="stats-section ach-recent">
    <div class="stats-section-title">🎉 Recently Earned</div>
    <div class="ach-grid">${recent.map(card).join('')}</div>
  </div>` : '';

  const allHtml = `<div class="stats-section">
    <div class="stats-section-title">Achievements (${earnedCount}/${ACHIEVEMENTS.length})</div>
    <div class="ach-grid">${all.map(card).join('')}</div>
    <div class="ach-credit">Icons by <a href="https://game-icons.net" target="_blank" rel="noopener">game-icons.net</a> (CC BY 3.0)</div>
  </div>`;

  return { recentHtml, allHtml };
}

// ── Latest Plays modal ──
// Renders the full play log (any number of plays) for `playerName` as a
// scrollable modal. Each row shows every player's score + their per-play Elo
// delta when the play was competitive (and within the current Elo year).
function _openLatestPlaysModal(playerName, plays) {
  const overlay = document.getElementById('lpm-overlay');
  const list = document.getElementById('lpm-list');
  const titleEl = document.getElementById('lpm-title');
  const countEl = document.getElementById('lpm-count');
  if (!overlay || !list || !plays) return;

  // Per-play deltas covering current Elo year (older plays just show no delta).
  let perPlayElo;
  try { perPlayElo = _computePerPlayElo(); }
  catch (_) { perPlayElo = new Map(); }

  const fmt = (d) => {
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
  };

  titleEl.textContent = `${playerName}'s Plays`;
  countEl.textContent = `${plays.length} play${plays.length !== 1 ? 's' : ''}`;

  if (plays.length === 0) {
    list.innerHTML = '<div class="lpm-empty">No plays recorded yet.</div>';
  } else {
    list.innerHTML = plays.map(p => {
      const localCover = p.game.bggId >= 0 ? `images/${p.game.bggId}.jpg` : '';
      const fallback = (p.game.urlImage || '').replace(/'/g, "\\'");
      // <img> with onerror chain so missing local files fall through to the
      // BGG-hosted urlImage (same pattern the BS vote modal uses).
      const initialSrc = localCover || fallback;
      const coverHtml = initialSrc
        ? `<img class="lpm-row-cover" src="${initialSrc}" alt="" loading="lazy" onerror="window.__lpmImgFallback(this, '${fallback}')">`
        : '<div class="lpm-row-cover"></div>';
      const noResult = isNoResultGame(p.game.bggId);
      const tagHtml = noResult
        ? ''
        : (p.isCoop
            ? '<span class="lpm-row-tag">Coop</span>'
            : (p.isSolo ? '<span class="lpm-row-tag">Solo</span>' : ''));
      const resultHtml = noResult
        ? '<span class="lpm-row-result neutral">PLAYED</span>'
        : (p.won
            ? '<span class="lpm-row-result win">WIN</span>'
            : '<span class="lpm-row-result loss">LOSS</span>');
      const metaBits = [fmt(p.date)];
      if (p.location) metaBits.push(_escapeHtml(p.location));
      if (p.board) metaBits.push(_escapeHtml(p.board));
      metaBits.push(`${p.players} player${p.players !== 1 ? 's' : ''}`);

      const key = `${p.bggId}|${p.date}|${p.playIdx}`;
      const playDeltas = perPlayElo.get(key) || null;

      // Sort scoreboard by computed rank when available (so games where the
      // *lower* score wins, like Last Will, still list the winner first).
      // Fall back to win-flag-then-original-order for plays where ranks
      // can't be computed (coop, solo, missing scores).
      const ranks = _leaderboardRanksForPlay(p.allScores || [], p.bggId) || [];
      const rankByName = {};
      for (const r of ranks) {
        if (rankByName[r.player] == null || r.rank < rankByName[r.player]) {
          rankByName[r.player] = r.rank;
        }
      }
      const indexed = (p.allScores || []).map((s, i) => ({ s, i, rank: rankByName[s.n] }));
      indexed.sort((a, b) => {
        if (a.rank != null && b.rank != null && a.rank !== b.rank) return a.rank - b.rank;
        const aw = !!a.s.w, bw = !!b.s.w;
        if (aw !== bw) return aw ? -1 : 1;
        return a.i - b.i;
      });

      const scoreboardRows = indexed.map(({ s }) => {
        const cls = ['lpm-sb-name'];
        if (s.n === playerName) cls.push('me');
        if (s.w) cls.push('winner');
        const roleSuffix = s.r ? ` <span style="opacity:0.5;font-size:0.66rem">(${_escapeHtml(s.r)})</span>` : '';
        const score = (s.s != null && s.s !== '') ? _escapeHtml(s.s) : '—';
        let deltaHtml = '<span class="lpm-sb-delta"></span>';
        if (playDeltas && Object.prototype.hasOwnProperty.call(playDeltas, s.n)) {
          const d = playDeltas[s.n];
          const cls2 = d > 0 ? 'pos' : (d < 0 ? 'neg' : '');
          const sign = d > 0 ? '+' : '';
          deltaHtml = `<span class="lpm-sb-delta ${cls2}">${sign}${d.toFixed(1)}</span>`;
        }
        return `<div class="lpm-sb-row">
          <span class="${cls.join(' ')}">${_escapeHtml(s.n || '?')}${roleSuffix}</span>
          <span class="lpm-sb-score">${score}</span>
          ${deltaHtml}
        </div>`;
      }).join('');

      return `<div class="lpm-row" data-bgg-id="${p.bggId}">
        <div class="lpm-row-top">
          ${coverHtml}
          <div class="lpm-row-info">
            <div class="lpm-row-name">${_escapeHtml(p.game.name)}</div>
            <div class="lpm-row-meta">${metaBits.join(' · ')}</div>
          </div>
          ${tagHtml}
          ${resultHtml}
        </div>
        <div class="lpm-scoreboard">${scoreboardRows}</div>
      </div>`;
    }).join('');
  }

  // Wire row clicks → open the game's modal so the user can dive in.
  list.querySelectorAll('.lpm-row').forEach(row => {
    row.addEventListener('click', () => {
      const bggId = Number(row.dataset.bggId);
      const game = findGameByBggId(bggId);
      if (game && typeof openModal === 'function') {
        try { openModal(game); } catch (_) {}
      }
    });
  });

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

// Image-fallback helper for the Latest Plays modal covers — local image →
// BGG urlImage → hide. Defined on window so the inline onerror can find it.
window.__lpmImgFallback = function(img, fallback) {
  if (!img.dataset.lpmFb && fallback) {
    img.dataset.lpmFb = '1';
    img.src = fallback;
    return;
  }
  if (!img.dataset.ph) {
    img.dataset.ph = '1';
    img.src = 'images/game-placeholder.svg';
  }
};

function _closeLatestPlaysModal() {
  const overlay = document.getElementById('lpm-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Wire global modal-close handlers once.
(function _wireLpmCloseOnce() {
  const overlay = document.getElementById('lpm-overlay');
  if (!overlay || overlay.dataset.wired) return;
  overlay.dataset.wired = '1';
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) _closeLatestPlaysModal();
  });
  const btn = document.getElementById('lpm-close');
  if (btn) btn.addEventListener('click', _closeLatestPlaysModal);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && overlay.classList.contains('open')) {
      _closeLatestPlaysModal();
    }
  });
})();

function showAchievementsView(playerName) {
  const container = document.getElementById('achievements-view');
  if (!container) return;
  const { recentHtml, allHtml } = buildAchievementsHtml(playerName);
  container.innerHTML = `
    <div class="lb-header">
      <div class="lb-title">${playerName}'s Achievements</div>
    </div>
    ${recentHtml}
    ${allHtml}`;
  window.scrollTo(0, 0);
}

// ── Challenges view ──
// Personal yearly challenges in the BGStats tradition: 10×10, Alphabet and
// New-to-me count only the current calendar year's plays, so they reset
// automatically every January 1st. The H-index card is all-time.
