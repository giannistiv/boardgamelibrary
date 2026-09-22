const PIE_COLORS = ['#e2b04a','#4fc3f7','#22c55e','#f87171','#a78bfa','#f59e0b','#ec4899','#14b8a6','#8b5cf6','#6366f1'];

function buildPieHtml(data, _passedTotal, title, maxVisible) {
  if (!data || Object.keys(data).length === 0) return '';
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  // Use the SUM of the slice values, not the caller-supplied total. Locations
  // are optional on plays, so a "player total" coming in here would leave the
  // pie short of 360° and the percentages summing to <100%. Each chart should
  // describe what's *in* it, full circle.
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  if (total <= 0) return '';
  let gradParts = [];
  let angle = 0;
  const items = [];
  sorted.forEach(([label, count], i) => {
    const pct = (count / total * 100);
    const color = PIE_COLORS[i % PIE_COLORS.length];
    gradParts.push(`${color} ${angle.toFixed(1)}deg ${(angle + pct * 3.6).toFixed(1)}deg`);
    angle += pct * 3.6;
    items.push({ label, count, pct: Math.round(pct), color });
  });
  const grad = `conic-gradient(${gradParts.join(',')})`;
  const limit = maxVisible && items.length > maxVisible ? maxVisible : items.length;
  const visibleHtml = items.slice(0, limit).map(it =>
    `<div class="pie-legend-item"><span class="pie-legend-dot" style="background:${it.color}"></span>${it.label}<span class="pie-legend-pct">${it.pct}%</span></div>`
  ).join('');
  const hiddenHtml = items.length > limit ? items.slice(limit).map(it =>
    `<div class="pie-legend-item"><span class="pie-legend-dot" style="background:${it.color}"></span>${it.label}<span class="pie-legend-pct">${it.pct}%</span></div>`
  ).join('') : '';
  const showMoreBtn = hiddenHtml ? `<div class="pie-legend-hidden" style="display:none">${hiddenHtml}</div><button class="pie-legend-more" onclick="var h=this.previousElementSibling;h.style.display=h.style.display==='none'?'block':'none';this.textContent=h.style.display==='none'?'Show more':'Show less'">Show more</button>` : '';
  return `<div class="chart-block">
    <div class="chart-block-title">${title}</div>
    <div class="pie-wrap">
      <div class="pie" style="background:${grad}"><div class="pie-center">${total}</div></div>
      <div class="pie-legend">${visibleHtml}${showMoreBtn}</div>
    </div>
  </div>`;
}

function buildChartsHtml(days, locations, total) {
  const dayPie = buildPieHtml(days, total, 'Play Days');
  const locPie = buildPieHtml(locations, total, 'Locations', 5);
  if (!dayPie && !locPie) return '';
  return `<div class="stats-section"><div class="chart-row">${dayPie}${locPie}</div></div>`;
}

// ── Insights View ──
// ── Explore (merged Games + Players + Stats) ──
let _exploreTab = 'games'; // active sub-tab; survives re-renders and modal round-trips

function showGamesView() {
  const container = document.getElementById('games-view');

  // ── Shared computations across all three sub-tabs ──
  const gamePlayCounts = {};
  const allDays = {};
  const allLocs = {};
  let totalPlays = 0;
  const playerStats = {};
  const allPlays = [];

  for (const bggId in PLAY_HISTORY) {
    const game = findGameByBggId(bggId)
      || { id: 'bgg_' + bggId, name: 'Game #' + bggId, bggId: Number(bggId), spineColor: '#555', categories: [] };
    for (const play of PLAY_HISTORY[bggId]) {
      totalPlays++;
      allPlays.push({ game, date: play.date, sc: play.sc, b: play.b || '' });
      if (!gamePlayCounts[bggId]) gamePlayCounts[bggId] = { game, count: 0 };
      gamePlayCounts[bggId].count++;

      const [y, m, d] = play.date.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow];
      allDays[dayName] = (allDays[dayName] || 0) + 1;

      const loc = play.l || '';
      if (loc) allLocs[loc] = (allLocs[loc] || 0) + 1;

      for (const s of play.sc) {
        if (HIDDEN_PLAYERS.has(s.n)) continue;
        if (!playerStats[s.n]) playerStats[s.n] = { plays: 0, wins: 0, games: new Set() };
        playerStats[s.n].plays++;
        if (s.w) playerStats[s.n].wins++;
        playerStats[s.n].games.add(Number(bggId));
      }
    }
  }
  allPlays.sort((a, b) => b.date.localeCompare(a.date));

  const gameRowHtml = (game, detail) => {
    const imgSrc = game.bggId >= 0 ? `images/${game.bggId}.jpg` : '';
    return `<div class="stats-game-row" data-bgg-id="${game.bggId}">
      ${imgSrc ? `<img class="stats-game-img" src="${imgSrc}" alt="" onerror="__imgFallback(this, ${game.bggId})">` : ''}
      <div class="stats-game-info">
        <div class="stats-game-name">${game.name}</div>
        <div class="stats-game-detail">${detail}</div>
      </div>
    </div>`;
  };

  // ── Games sub-tab ──
  const buildGamesTab = () => {
    const cutoff = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d.toISOString().slice(0, 10);
    })();
    const recentCounts = {};
    for (const p of allPlays) {
      if (p.date < cutoff) continue;
      const id = p.game.bggId;
      if (!recentCounts[id]) recentCounts[id] = { game: p.game, count: 0, lastPlayed: '' };
      recentCounts[id].count++;
      if (p.date > recentCounts[id].lastPlayed) recentCounts[id].lastPlayed = p.date;
    }
    const mostPlayedRecent = Object.values(recentCounts)
      .sort((a, b) => b.count - a.count || b.lastPlayed.localeCompare(a.lastPlayed)).slice(0, 10);
    const topGames = Object.values(gamePlayCounts).sort((a, b) => b.count - a.count).slice(0, 15);

    const newestRatings = [];
    for (const bggId in ratingsCache) {
      for (const player in ratingsCache[bggId]) {
        const r = ratingsCache[bggId][player];
        const value = typeof r === 'number' ? r : (r && r.value) || 0;
        const updatedAt = (r && typeof r === 'object' && r.updatedAt) || 0;
        if (!value) continue;
        newestRatings.push({ bggId: Number(bggId), player, value, updatedAt });
      }
    }
    newestRatings.sort((a, b) => b.updatedAt - a.updatedAt);
    const newestTop = newestRatings.filter(r => r.updatedAt > 0).slice(0, 10);
    const ratingRowHtml = (r) => {
      const game = findGameByBggId(r.bggId) || { name: 'Game #' + r.bggId, bggId: r.bggId };
      const imgSrc = r.bggId >= 0 ? `images/${r.bggId}.jpg` : '';
      return `<div class="stats-game-row" data-bgg-id="${r.bggId}">
        ${imgSrc ? `<img class="stats-game-img" src="${imgSrc}" alt="" onerror="__imgFallback(this, ${r.bggId})">` : ''}
        <div class="stats-game-info">
          <div class="stats-game-name">${game.name}</div>
          <div class="stats-game-detail">${r.player} &middot; ${_timeAgo(r.updatedAt)}</div>
        </div>
        <div class="stats-game-wr" style="color:#e2b04a">&#9733; ${r.value}</div>
      </div>`;
    };

    return `
      <div class="stats-section">
        <input type="text" class="insights-search" id="games-search" placeholder="Search all games..." autocomplete="off">
        <div id="games-search-results"></div>
      </div>

      ${mostPlayedRecent.length > 0 ? `<div class="stats-section">
        <div class="stats-section-title">Most Played Recently</div>
        <div class="stats-player-sub" style="margin:-0.3rem 0 0.6rem">Last 90 days</div>
        ${mostPlayedRecent.map(gs => gameRowHtml(gs.game, `${gs.count} play${gs.count !== 1 ? 's' : ''} &middot; Last: ${_fmtDateShort(gs.lastPlayed)}`)).join('')}
      </div>` : ''}

      <div class="stats-section">
        <div class="stats-section-title">Most Played All-Time</div>
        ${topGames.map(gs => gameRowHtml(gs.game, `${gs.count} play${gs.count !== 1 ? 's' : ''}`)).join('')}
      </div>

      ${newestTop.length > 0 ? `<div class="stats-section">
        <div class="stats-section-title">Newest Ratings</div>
        ${newestTop.map(ratingRowHtml).join('')}
      </div>` : ''}`;
  };

  // ── Players sub-tab ──
  const wrColor = (wr) => {
    if (wr >= 70) return '#22c55e';
    if (wr >= 50) return '#a3e635';
    if (wr >= 35) return '#e2b04a';
    return '#f87171';
  };
  const topPlayers = Object.entries(playerStats)
    .filter(([, d]) => d.plays >= 1)
    .map(([name, d]) => ({ name, plays: d.plays, wins: d.wins, games: d.games.size, wr: Math.round(d.wins / d.plays * 100) }))
    .sort((a, b) => b.plays - a.plays);

  const buildPlayersTab = () => `
    <div class="stats-section stats-players-section">
      <div class="stats-section-title">Players (${topPlayers.length})</div>
      <input type="text" class="insights-search" id="insights-player-search" placeholder="Search players..." autocomplete="off">
      <div id="insights-player-list" class="insights-player-scroll">
        ${_renderInsightsPlayers(topPlayers, wrColor)}
      </div>
    </div>`;

  // ── Stats sub-tab ──
  const buildStatsTab = () => {
    const playRowHtml = (p) => {
      const scoresHtml = p.sc.map(s => {
        const cls = s.w ? ' winner' : '';
        const trophy = s.w ? '<span class="trophy">&#9733;</span>' : '';
        const score = s.s ? ` (${s.s})` : '';
        const roleHtml = s.r ? `<span class="play-role">${s.r}</span>` : '';
        return `<span class="play-score${cls}"><span class="play-player"><span class="play-player-name">${trophy}${s.n}${score}</span>${roleHtml}</span></span>`;
      }).join('');
      const boardHtml = p.b ? `<span class="stats-recent-result">&nbsp;&middot; &#9876; ${p.b}</span>` : '';
      return `<div class="stats-recent-play" data-bgg-id="${p.game.bggId}">
        <div class="stats-recent-top">
          <span class="stats-recent-game">${p.game.name}</span>
          <span class="stats-recent-date">${_fmtDateShort(p.date)}</span>
        </div>
        <div class="play-scores" style="margin-top:0.3rem">${scoresHtml}</div>
        ${boardHtml}
      </div>`;
    };
    return `
      <div class="stats-section"><div class="chart-row">${buildPieHtml(allDays, totalPlays, 'Play Days')}${buildPieHtml(allLocs, totalPlays, 'Locations', 5)}</div></div>
      <div class="stats-section">
        <div class="stats-section-title">Recent Plays</div>
        ${allPlays.slice(0, 20).map(playRowHtml).join('')}
      </div>`;
  };

  const tabContent = _exploreTab === 'players' ? buildPlayersTab()
    : _exploreTab === 'stats' ? buildStatsTab()
    : buildGamesTab();

  const tabBtn = (key, label) =>
    `<button class="explore-tab${_exploreTab === key ? ' active' : ''}" data-tab="${key}">${label}</button>`;

  container.innerHTML = `
    <div class="stats-header">
      <div class="stats-player-name">Explore</div>
      <div class="stats-player-sub">${totalPlays} plays &middot; ${Object.keys(gamePlayCounts).length} games &middot; ${topPlayers.length} players</div>
    </div>
    <div class="explore-tabs">
      ${tabBtn('games', 'Games')}${tabBtn('players', 'Players')}${tabBtn('stats', 'Stats')}
    </div>
    ${tabContent}
  `;

  // Sub-tab switching
  container.querySelectorAll('.explore-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_exploreTab === btn.dataset.tab) return;
      _exploreTab = btn.dataset.tab;
      showGamesView();
    });
  });

  // Wire game/play rows (covers every sub-tab's [data-bgg-id] rows)
  container.querySelectorAll('.stats-section [data-bgg-id]').forEach(el => {
    el.addEventListener('click', () => {
      const game = findGameByBggId(el.dataset.bggId);
      if (game) openModal(game);
    });
  });

  // Games sub-tab: search across every catalogue
  const searchEl = document.getElementById('games-search');
  if (searchEl) {
    const resultsEl = document.getElementById('games-search-results');
    const allGames = _allGames();
    const renderSearch = (q) => {
      if (!q) { resultsEl.innerHTML = ''; return; }
      const ql = q.toLowerCase();
      const matches = allGames
        .filter(g => (g.name || '').toLowerCase().includes(ql))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 20);
      if (!matches.length) { resultsEl.innerHTML = '<div class="stats-player-sub" style="padding:0.6rem">No matches</div>'; return; }
      resultsEl.innerHTML = matches.map(g => gameRowHtml(g, `${g.year || ''}${g.players ? ' &middot; ' + g.players + ' players' : ''}`)).join('');
      resultsEl.querySelectorAll('[data-bgg-id]').forEach(el => {
        el.addEventListener('click', () => {
          const game = findGameByBggId(el.dataset.bggId);
          if (game) openModal(game);
        });
      });
    };
    searchEl.addEventListener('input', () => renderSearch(searchEl.value.trim()));
  }

  // Players sub-tab: player search
  const playerSearchEl = document.getElementById('insights-player-search');
  if (playerSearchEl) {
    playerSearchEl.addEventListener('input', () => {
      const q = playerSearchEl.value.toLowerCase();
      const filtered = q ? topPlayers.filter(p => p.name.toLowerCase().includes(q)) : topPlayers;
      const listEl = document.getElementById('insights-player-list');
      listEl.innerHTML = _renderInsightsPlayers(filtered, wrColor);
      _wireInsightsPlayerClicks(listEl);
    });
    _wireInsightsPlayerClicks(container);
  }
}


// ── Games Tab ──
function _fmtDateShort(d) {
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

function _timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  const d = Math.floor(s/86400);
  if (d < 30) return d + 'd ago';
  if (d < 365) return Math.floor(d/30) + 'mo ago';
  return Math.floor(d/365) + 'y ago';
}

function _allGames() {
  const seen = new Set();
  const all = [];
  // Merge every catalogue so the Games tab covers everyone's collection.
  // First-seen wins, and the source order is richest-metadata-first
  // (curated shelf → BGStats imports → the three per-person CSV libraries).
  const sources = [
    GAMES,
    Object.values(EXTRA_GAMES || {}),
    typeof GIANNIS_GAMES !== 'undefined' ? Object.values(GIANNIS_GAMES) : [],
    typeof LGEORGE_GAMES !== 'undefined' ? Object.values(LGEORGE_GAMES) : [],
    typeof DIMITRIS_GAMES !== 'undefined' ? Object.values(DIMITRIS_GAMES) : [],
  ];
  for (const src of sources) {
    (src || []).forEach(g => {
      if (g && g.bggId != null && !seen.has(g.bggId)) { seen.add(g.bggId); all.push(g); }
    });
  }
  return all;
}



// ── Leaderboard (Elo) ──
