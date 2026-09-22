let _viewingProfile = null; // null = own profile, string = visiting someone
let _statsViewSource = null; // 'leaderboard' | 'insights' | null — where the visit was triggered from
let _rlgDismissed = false; // "rate last game" bar dismissed for this session (resets on refresh)

function _goBackFromProfile() {
  const src = _statsViewSource;
  _statsViewSource = null;
  _viewingProfile = null;
  if (src === 'leaderboard') switchToLeaderboard();
  else if (src === 'insights') { _exploreTab = 'players'; switchToGames(); }
  else switchToLibrary();
}
window._goBackFromProfile = _goBackFromProfile;

// ── "Rate your last game" nudge ──
// A banner near the top of your OWN profile that offers to rate the most recent
// game you played but haven't rated yet. Returns '' when there is nothing to
// nudge (visiting someone else, no plays, or every recent game already rated).
function _rlgEsc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function buildRateLastGameBar(playerName, isOwnProfile, recentPlays) {
  if (_rlgDismissed) return '';
  if (!isOwnProfile || !recentPlays || !recentPlays.length) return '';
  // Walk plays newest-first, one game each, until we hit an unrated one.
  const seen = new Set();
  let target = null, isLatest = false;
  for (let i = 0; i < recentPlays.length; i++) {
    const p = recentPlays[i];
    if (!p.game || !(p.bggId >= 0) || seen.has(p.bggId)) continue;
    seen.add(p.bggId);
    if (getPlayerRating(playerName, p.bggId) === 0) { target = p; isLatest = (i === 0); break; }
  }
  if (!target) return '';
  const bggId = target.bggId;
  const imgSrc = `images/${bggId}.jpg`;
  let stars = '';
  for (let i = 1; i <= 10; i++) stars += `<span class="star" data-val="${i}">&#9733;</span>`;
  const prompt = isLatest ? 'Rate your last game' : 'Rate a recent game';
  return `<div class="rate-last-bar" id="rate-last-bar" data-bgg="${bggId}">
    <button class="rate-last-close" id="rate-last-close" type="button" aria-label="Hide">&times;</button>
    <div class="rate-last-cover"><img class="rate-last-cover-img" src="${imgSrc}" alt="" onerror="__imgFallback(this, ${bggId})"></div>
    <div class="rate-last-body">
      <div class="rate-last-prompt">${prompt}</div>
      <div class="rate-last-game" title="${_rlgEsc(target.game.name)}">${_rlgEsc(target.game.name)}</div>
      <div class="rate-last-stars" id="rate-last-stars">${stars}</div>
    </div>
  </div>`;
}

function wireRateLastGame(container, playerName, isOwnProfile, recentPlays) {
  const bar = container.querySelector('#rate-last-bar');
  if (!bar) return;
  const starsRow = bar.querySelector('#rate-last-stars');
  if (!starsRow) return;
  const stars = starsRow.querySelectorAll('.star');
  const bggId = Number(bar.dataset.bgg);

  // Dismiss for this session (reappears on a page refresh).
  const closeBtn = bar.querySelector('#rate-last-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      _rlgDismissed = true;
      bar.classList.add('rate-last-hide');
      setTimeout(() => bar.remove(), 320);
    });
  }

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = Number(star.dataset.val);
      stars.forEach(s => s.classList.toggle('hovered', Number(s.dataset.val) <= val));
    });
  });
  starsRow.addEventListener('mouseleave', () => stars.forEach(s => s.classList.remove('hovered')));

  stars.forEach(star => {
    star.addEventListener('click', async () => {
      const val = Number(star.dataset.val);
      stars.forEach(s => { s.classList.toggle('filled', Number(s.dataset.val) <= val); s.classList.remove('hovered'); });
      await saveRating(playerName, bggId, val);
      // Brief confirmation, then advance to the next unrated game (or fade out).
      const body = bar.querySelector('.rate-last-body');
      if (body && !body.querySelector('.rate-last-done')) {
        body.insertAdjacentHTML('beforeend', `<div class="rate-last-done">Saved &mdash; ${val}/10 &#10003;</div>`);
      }
      setTimeout(() => {
        const html = buildRateLastGameBar(playerName, isOwnProfile, recentPlays);
        if (html) {
          bar.outerHTML = html;
          wireRateLastGame(container, playerName, isOwnProfile, recentPlays);
        } else {
          bar.classList.add('rate-last-hide');
          setTimeout(() => bar.remove(), 320);
        }
      }, 900);
    });
  });
}

function showStatsView(playerName, visiting) {
  const loggedInPlayer = localStorage.getItem('bgl-player');
  const isOwnProfile = !visiting || visiting === loggedInPlayer;
  _viewingProfile = isOwnProfile ? null : playerName;

  if (visiting && !isOwnProfile) {
    if (!_statsViewSource) {
      const lbOpen = document.getElementById('leaderboard-view').classList.contains('open');
      const insOpen = document.getElementById('games-view').classList.contains('open');
      if (lbOpen) _statsViewSource = 'leaderboard';
      else if (insOpen) _statsViewSource = 'insights';
    }
  } else {
    _statsViewSource = null;
  }

  _deactivateAllTabs();
  document.getElementById('stats-view').classList.add('open');
  document.getElementById('btn-mystats').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    // The early-paint script adds mobile-library to <body> for the first
    // render. When this view is reached directly (e.g. saved-player boot
    // path) we need to drop it so the locked viewport doesn't inherit
    // library-only sizing or the 1200-wide min-width rule.
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }

  // Gather all play data for this player
  const gameStats = {};
  const recentPlays = [];

  for (const bggId in PLAY_HISTORY) {
    const game = GAMES.find(g => g.bggId === Number(bggId))
      || EXTRA_GAMES[bggId]
      || {id:'bgg_'+bggId, name:'Game #'+bggId, bggId:Number(bggId), spineColor:'#555', categories:[], players:'', playTime:'', complexity:0};

    PLAY_HISTORY[bggId].forEach((play, playIdx) => {
      const playerEntry = play.sc.find(s => s.n === playerName);
      if (!playerEntry) return;

      if (!gameStats[bggId]) {
        gameStats[bggId] = { game, plays: 0, wins: 0, pvpPlays: 0, pvpWins: 0, lastPlayed: '' };
      }
      gameStats[bggId].plays++;
      if (playerEntry.w) gameStats[bggId].wins++;
      if (play.date > gameStats[bggId].lastPlayed) gameStats[bggId].lastPlayed = play.date;

      // Classify play: PvP = competitive multi-player game (>=2 players, mixed
      // win flags). Excludes solo games and coop (everyone won/lost together).
      const isSoloPlay = play.sc.length === 1;
      const allSameFlag = play.sc.every(s => !!s.w === !!play.sc[0].w);
      const isCoopPlay  = !isSoloPlay && allSameFlag;
      const isPvP       = !isSoloPlay && !isCoopPlay;
      if (isPvP) {
        gameStats[bggId].pvpPlays++;
        if (playerEntry.w) gameStats[bggId].pvpWins++;
      }

      const hasWinner = play.sc.some(s => s.w);
      recentPlays.push({
        game,
        bggId: Number(bggId),
        playIdx,
        date: play.date,
        won: playerEntry.w,
        noWinner: !hasWinner,
        score: playerEntry.s,
        role: playerEntry.r || '',
        board: play.b || '',
        location: play.l || '',
        allScores: play.sc,
        players: play.sc.length,
        isCoop: isCoopPlay,
        isSolo: isSoloPlay,
      });
    });
  }

  recentPlays.sort((a, b) => b.date.localeCompare(a.date));

  const totalPlays = recentPlays.length;
  const totalWins = recentPlays.filter(p => p.won).length;
  // Coop play = 2+ participants where every winner flag is the same (everyone won
  // together OR everyone lost together). A coop *win* is the all-won subset.
  // Plays with mixed flags (some won, some lost) are competitive (incl. team games).
  const coopPlays = recentPlays.filter(p => {
    if (!p.allScores || p.allScores.length < 2) return false;
    const first = !!p.allScores[0].w;
    return p.allScores.every(s => !!s.w === first);
  });
  const coopWins = coopPlays.filter(p => p.won).length;
  // Win rate ignores no-result games (no win/loss to score).
  const decisivePlays = recentPlays.filter(p => !isNoResultGame(p.bggId)).length;
  const winRate = decisivePlays > 0 ? Math.round(totalWins / decisivePlays * 100) : 0;
  const uniqueGames = Object.keys(gameStats).length;
  const uniquePlayers = (() => {
    const set = new Set();
    for (const p of recentPlays) {
      for (const s of p.allScores) {
        if (s && s.n && s.n !== playerName) set.add(s.n);
      }
    }
    return set.size;
  })();

  const fmtDate = (d) => {
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m)-1]} ${parseInt(day)}, ${y}`;
  };

  // Top games by plays (still computed for win-rate filtering & charts).
  const topGames = Object.values(gameStats).sort((a, b) => b.plays - a.plays).slice(0, 10);

  // Latest individual plays (recentPlays is already sorted newest-first above).
  const latestPlays = recentPlays.slice(0, 10);
  const latestPlayRowHtml = (p) => {
    const imgSrc = p.game.bggId >= 0 ? `images/${p.game.bggId}.jpg` : '';
    // "No human winner" almost always means coop/solo loss (the game won),
    // so render LOSS instead of a dash — unless the game has no win/loss at all.
    const result = isNoResultGame(p.bggId)
      ? '<span class="stats-game-wr" style="color:#8a8f98">PLAYED</span>'
      : (p.won
          ? '<span class="stats-game-wr" style="color:#22c55e">WIN</span>'
          : '<span class="stats-game-wr" style="color:#f87171">LOSS</span>');
    const scoreTxt = p.score ? ` &middot; ${p.score} pts` : '';
    const roleTxt = p.role ? ` &middot; ${p.role}` : '';
    return `<div class="stats-game-row" data-bgg-id="${p.game.bggId}">
      ${imgSrc ? `<img class="stats-game-img" src="${imgSrc}" alt="" onerror="__imgFallback(this, ${p.game.bggId})">` : ''}
      <div class="stats-game-info">
        <div class="stats-game-name">${p.game.name}</div>
        <div class="stats-game-detail">${fmtDate(p.date)}${scoreTxt}${roleTxt} &middot; ${p.players} player${p.players !== 1 ? 's' : ''}</div>
      </div>
      ${result}
    </div>`;
  };

  // Best PvP win rates (min 3 competitive plays). Coop and solo games are
  // excluded since they don't produce a meaningful per-player win rate.
  const bestWR = Object.values(gameStats)
    .filter(g => g.pvpPlays >= 3)
    .map(g => ({
      ...g,
      // Display the PvP plays/wins under the row so the percentage matches.
      plays: g.pvpPlays,
      wins:  g.pvpWins,
      wr: Math.round(g.pvpWins / g.pvpPlays * 100),
    }))
    .sort((a, b) => b.wr - a.wr || b.plays - a.plays)
    .slice(0, 8);

  // Recommendations: games they haven't played, sorted by rating
  const playedBggIds = new Set(Object.keys(gameStats).map(Number));
  const recommendations = GAMES
    .filter(g => !playedBggIds.has(g.bggId) && g.bggRating && g.bggRating > 0 && !isExpansion(g))
    .sort((a, b) => (b.bggRating || 0) - (a.bggRating || 0))
    .slice(0, 6);

  const wrColor = (wr) => {
    if (wr >= 70) return '#22c55e';
    if (wr >= 50) return '#a3e635';
    if (wr >= 35) return '#e2b04a';
    return '#f87171';
  };

  const gameRowHtml = (gs) => {
    const wr = gs.plays > 0 ? Math.round(gs.wins / gs.plays * 100) : 0;
    const imgSrc = gs.game.bggId >= 0 ? `images/${gs.game.bggId}.jpg` : '';
    return `<div class="stats-game-row" data-bgg-id="${gs.game.bggId}">
      ${imgSrc ? `<img class="stats-game-img" src="${imgSrc}" alt="" onerror="__imgFallback(this, ${gs.game.bggId})">` : ''}
      <div class="stats-game-info">
        <div class="stats-game-name">${gs.game.name}</div>
        <div class="stats-game-detail">${gs.plays} play${gs.plays !== 1 ? 's' : ''} &middot; ${gs.wins} win${gs.wins !== 1 ? 's' : ''} &middot; Last: ${fmtDate(gs.lastPlayed)}</div>
      </div>
      <div class="stats-game-wr" style="color:${wrColor(wr)}">${wr}%</div>
    </div>`;
  };

  const backBtnHtml = (!isOwnProfile && _statsViewSource)
    ? `<button class="profile-back-btn" onclick="_goBackFromProfile()">← Back to ${_statsViewSource === 'leaderboard' ? 'Leaderboard' : 'Players'}</button>`
    : '';

  // Head-to-head when viewing someone else's profile
  let h2hHtml = '';
  if (!isOwnProfile && loggedInPlayer && loggedInPlayer !== playerName) {
    const h2hPlays = [];
    for (const bggId in PLAY_HISTORY) {
      for (const play of PLAY_HISTORY[bggId]) {
        if (!play || !Array.isArray(play.sc)) continue;
        const me = play.sc.find(s => s.n === loggedInPlayer);
        const them = play.sc.find(s => s.n === playerName);
        if (!me || !them) continue;
        h2hPlays.push({ date: play.date, sc: play.sc });
      }
    }
    h2hPlays.sort((a, b) => a.date.localeCompare(b.date));

    let myWins = 0, theirWins = 0, ties = 0;
    let curMyStreak = 0, longestMyStreak = 0;
    let curTheirStreak = 0, longestTheirStreak = 0;
    let lastResult = '', lastDate = '';
    for (const p of h2hPlays) {
      const me = p.sc.find(s => s.n === loggedInPlayer);
      const them = p.sc.find(s => s.n === playerName);
      const allSame = p.sc.every(s => !!s.w === !!p.sc[0].w);
      if (allSame) continue; // coop / all-lost
      const meW = !!me.w, themW = !!them.w;
      if (meW && !themW) {
        myWins++;
        curMyStreak++;
        curTheirStreak = 0;
        longestMyStreak = Math.max(longestMyStreak, curMyStreak);
        lastResult = 'You won';
      } else if (themW && !meW) {
        theirWins++;
        curTheirStreak++;
        curMyStreak = 0;
        longestTheirStreak = Math.max(longestTheirStreak, curTheirStreak);
        lastResult = `${playerName} won`;
      } else if (meW && themW) {
        ties++;
        curMyStreak = 0;
        curTheirStreak = 0;
        lastResult = 'Tied';
      } else {
        curMyStreak = 0;
        curTheirStreak = 0;
        lastResult = 'Both lost';
      }
      lastDate = p.date;
    }

    const decisive = myWins + theirWins + ties;
    if (decisive > 0) {
      const shortName = playerName.split(' ')[0];
      const streakLine = (longestMyStreak >= 2 || longestTheirStreak >= 2)
        ? ` · best streaks: you ${longestMyStreak} · ${shortName} ${longestTheirStreak}`
        : '';
      h2hHtml = `<div class="stats-section h2h-section">
        <div class="stats-section-title">You vs ${playerName}</div>
        <div class="h2h-grid">
          <div class="h2h-card"><div class="h2h-val" style="color:#22c55e">${myWins}</div><div class="h2h-label">You</div></div>
          <div class="h2h-card"><div class="h2h-val">${ties}</div><div class="h2h-label">Tied</div></div>
          <div class="h2h-card"><div class="h2h-val" style="color:#f87171">${theirWins}</div><div class="h2h-label">${shortName}</div></div>
        </div>
        <div class="h2h-meta">${decisive} head-to-head play${decisive !== 1 ? 's' : ''}${streakLine}${lastDate ? ` · last: ${lastResult} on ${fmtDate(lastDate)}` : ''}</div>
      </div>`;
    }
  }

  // Build favorites section
  const favoritesHtml = buildFavoritesHtml(playerName, isOwnProfile);

  // Achievements moved to their own dedicated tab (#achievements-view).
  // Profile no longer renders the grid.

  // Build day/location charts for this player
  const playerDays = {};
  const playerLocs = {};
  for (const p of recentPlays) {
    const [y, m, d] = p.date.split('-').map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow];
    playerDays[dayName] = (playerDays[dayName] || 0) + 1;
    const loc = p.location || '';
    if (loc) playerLocs[loc] = (playerLocs[loc] || 0) + 1;
  }
  const chartsHtml = buildChartsHtml(playerDays, playerLocs, totalPlays);

  const container = document.getElementById('stats-view');
  container.innerHTML = `
    ${backBtnHtml}
    <div class="stats-header">
      ${isOwnProfile ? `<button class="profile-cog" id="btn-edit-name" title="Profile settings" aria-label="Profile settings">&#9881;</button>` : ''}
      <div class="stats-player-name">${playerName}</div>
      <div class="stats-player-sub">${isOwnProfile ? 'Your Profile' : 'Player Profile'}</div>
      ${isOwnProfile ? `<div class="profile-edit-form" id="profile-edit-form">
        <div class="profile-edit-label">Display name</div>
        <input type="text" id="profile-name-input" class="profile-name-input" maxlength="40" autocomplete="off" value="${playerName.replace(/"/g, '&quot;')}">
        <div class="profile-edit-actions">
          <button class="profile-edit-save" id="profile-name-save">Save</button>
          <button class="profile-edit-cancel" id="profile-name-cancel">Cancel</button>
        </div>
        <div class="profile-edit-err" id="profile-name-err"></div>
      </div>` : ''}
      ${_bggCollectionUrl(playerName)
        ? `<a class="stats-bgg-btn" href="${_bggCollectionUrl(playerName)}" target="_blank" rel="noopener">
             View collection on BGG ↗
           </a>`
        : ''}
    </div>

    ${buildWrappedBanner(playerName)}

    ${buildRateLastGameBar(playerName, isOwnProfile, recentPlays)}

    ${favoritesHtml}

    ${h2hHtml}

    <div class="stats-grid">
      <div class="stats-card">
        <div class="stats-card-val">${totalPlays}</div>
        <div class="stats-card-label">Total Plays</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val">${totalWins}</div>
        <div class="stats-card-label">Total Wins</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val" style="color:${wrColor(winRate)}">${winRate}%</div>
        <div class="stats-card-label">Win Rate</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val">${coopWins}<span style="font-size:0.55em;opacity:0.55">/${coopPlays.length}</span></div>
        <div class="stats-card-label">Coop Wins</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val">${uniqueGames}</div>
        <div class="stats-card-label">Unique Games</div>
      </div>
      <div class="stats-card">
        <div class="stats-card-val">${uniquePlayers}</div>
        <div class="stats-card-label">Different Players</div>
      </div>
    </div>

    ${buildPlayHeatmapHtml(playerName)}

    <div class="stats-section">
      <div class="stats-section-title">Latest Plays</div>
      ${latestPlays.length > 0
        ? latestPlays.map(latestPlayRowHtml).join('')
        : '<div class="stats-game-detail" style="opacity:0.55;padding:0.4rem 0">No plays recorded yet.</div>'}
      ${recentPlays.length > 0 ? `<button class="lpm-view-all-btn" data-lpm-open="${playerName.replace(/"/g,'&quot;')}">View all ${recentPlays.length} plays →</button>` : ''}
    </div>

    ${bestWR.length > 0 ? `<div class="stats-section">
      <div class="stats-section-title">Best Win Rate in PvP (3+ plays)</div>
      ${bestWR.map(gameRowHtml).join('')}
    </div>` : ''}

    ${chartsHtml}

    ${isOwnProfile && recommendations.length > 0 ? `<div class="stats-section">
      <div class="stats-section-title">Recommended for You</div>
      <div class="stats-player-sub" style="margin:-0.3rem 0 0.6rem">Top-rated games from the shelf you haven't tried yet</div>
      ${recommendations.map(g => {
        const imgSrc = g.bggId >= 0 ? `images/${g.bggId}.jpg` : '';
        return `<div class="stats-rec-row" data-bgg-id="${g.bggId}">
          ${imgSrc ? `<img class="stats-game-img" src="${imgSrc}" alt="" onerror="__imgFallback(this, ${g.bggId})">` : ''}
          <div class="stats-game-info">
            <div class="stats-game-name">${g.name}</div>
            <div class="stats-game-detail">${g.players} players &middot; ${g.playTime} &middot; ${g.complexity}/5 weight</div>
          </div>
          <div class="stats-game-wr" style="color:${wrColor(Math.round((g.bggRating/10)*100))}">${g.bggRating}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    ${_origCanon(playerName) === 'Στιβ' ? `<div class="qr-section">
      <div class="stats-section-title" style="border:none;text-align:center">Share This Library</div>
      <div class="qr-canvas"><img id="qr-img" width="150" height="150" alt="QR Code" style="border-radius:8px"></div>
      <div class="qr-label">Scan to open on your phone</div>
    </div>` : ''}

    <!-- ── JSON Import (Στιβ only) ── -->
  ${_origCanon(playerName) === 'Στιβ' ? (() => {
    // Find the most recent play date across PLAY_HISTORY so the user can
    // tell from which day onwards they still need to upload.
    let latest = '';
    for (const bggId in PLAY_HISTORY) {
      for (const p of PLAY_HISTORY[bggId]) {
        if (p && p.date && p.date > latest) latest = p.date;
      }
    }
    const latestLabel = latest ? fmtDate(latest) : null;
    const sinceLine = latestLabel
      ? `<div class="import-last-play">Latest uploaded play: <b>${latestLabel}</b></div>`
      : '';
    return `<div class="import-section" id="importSection">
      <div class="import-section-title">📥 Import BGStats Play File</div>
      ${sinceLine}
      <div class="import-drop-zone" id="importDropZone">
        <input type="file" id="importFileInput" accept=".json,.bgsplay">
        <div class="import-drop-icon">📂</div>
        <div class="import-drop-label">Drop your BGStats Play export here</div>
        <div class="import-drop-sub">or click to browse — new plays, players & games will be merged</div>
      </div>
      <div class="import-result" id="importResult">
        <div class="import-result-title" id="importResultTitle"></div>
        <div class="import-result-lines" id="importResultLines"></div>
      </div>
    </div>`;
  })() : ''}

    ${isOwnProfile ? '<button class="change-profile-btn" id="btn-change-profile">Change Profile</button>' : ''}
  `;

  // Wire up importer for Στιβ
  if (_origCanon(playerName) === 'Στιβ' && typeof window.initImporter === 'function') {
    window.initImporter();
  }

  // Make game rows clickable
  container.querySelectorAll('[data-bgg-id]').forEach(el => {
    el.addEventListener('click', () => {
      const game = findGameByBggId(el.dataset.bggId);
      if (game) openModal(game);
    });
  });

  // Wire favorites grid
  wireFavoritesGrid(container, playerName, isOwnProfile);

  // Wire "View all plays" button → opens the full-log modal.
  const viewAllBtn = container.querySelector('[data-lpm-open]');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      _openLatestPlaysModal(viewAllBtn.dataset.lpmOpen, recentPlays);
    });
  }

  // Refresh favorites from Firebase for cross-device sync. Favorites are
  // stored under the player's ORIGINAL canonical name, so a renamed player
  // must read by that key — otherwise this fetch returns nothing and wipes
  // their favorites.
  if (FIREBASE_DB) {
    fetch(`${FIREBASE_DB}/favorites/${encodeURIComponent(_origCanon(playerName))}.json`)
      .then(r => r.json())
      .then(data => {
        if (!data) data = [];
        if (!Array.isArray(data)) return;
        const current = getPlayerFavorites(playerName);
        if (JSON.stringify(current) === JSON.stringify(data)) return;
        favoritesCache[playerName] = data;
        _saveFavoritesToLocal();
        const section = container.querySelector('.favorites-section');
        const newHtml = buildFavoritesHtml(playerName, isOwnProfile);
        if (section) {
          section.outerHTML = newHtml;
        } else if (newHtml) {
          const header = container.querySelector('.stats-header');
          if (header) header.insertAdjacentHTML('afterend', newHtml);
        }
        wireFavoritesGrid(container, playerName, isOwnProfile);
      })
      .catch(() => {});
  }

  // Change profile button
  const changeBtn = document.getElementById('btn-change-profile');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      localStorage.removeItem('bgl-player');
      if (typeof _updateBoardSouthBtnVisibility === 'function') _updateBoardSouthBtnVisibility();
      openPicker();
    });
  }

  // Year-in-Review "Wrapped" banner → opens the story modal.
  const wrappedBanner = container.querySelector('#wrapped-banner');
  if (wrappedBanner) {
    wrappedBanner.addEventListener('click', () => openWrappedModal(playerName, isOwnProfile));
  }

  // "Rate your last game" nudge (own profile only).
  wireRateLastGame(container, playerName, isOwnProfile, recentPlays);

  // Play heatmap (year nav + tap-a-day).
  _wireHeatmap(playerName);

  // Edit-name (own profile only): reveal an inline editor, save to Firebase,
  // then reload so the rename propagates through the startup machinery.
  const editBtn = document.getElementById('btn-edit-name');
  const editForm = document.getElementById('profile-edit-form');
  if (editBtn && editForm) {
    const input = document.getElementById('profile-name-input');
    const errEl = document.getElementById('profile-name-err');
    const close = () => { editForm.classList.remove('open'); errEl.textContent = ''; input.value = playerName; };
    editBtn.addEventListener('click', () => {
      const opening = !editForm.classList.contains('open');
      editForm.classList.toggle('open', opening);
      if (opening) { input.focus(); input.select(); }
    });
    document.getElementById('profile-name-cancel').addEventListener('click', close);
    const doSave = async () => {
      const saveBtn = document.getElementById('profile-name-save');
      saveBtn.disabled = true; errEl.style.color = ''; errEl.textContent = 'Saving…';
      const r = await _saveProfileName(input.value);
      if (r.ok) { window.location.reload(); }
      else { errEl.textContent = r.err; saveBtn.disabled = false; }
    };
    document.getElementById('profile-name-save').addEventListener('click', doSave);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); doSave(); }
      else if (e.key === 'Escape') close();
    });
  }

  // Generate QR code via API
  const qrImg = document.getElementById('qr-img');
  if (qrImg) {
    const url = encodeURIComponent(window.location.href.split('?')[0].split('#')[0]);
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`;
  }
}

// ── Rating System (Firebase Realtime Database) ──
// PASTE YOUR FIREBASE REALTIME DATABASE URL BELOW:
