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

// ── The shared view (#games-view) ──
// Once "Explore", now the screens of several destinations (js/nav.js):
//   Library → Find a game ('games')        Play → Latest plays, Tonight, Campaigns
//   Crowdfunding → its lists ('trending')   Group → Players, Stats
let _exploreTab = 'games'; // the screen on show; survives re-renders and modal round-trips
let _explorePlaysShown = 40;   // Latest plays: how many are on show
let _explorePlaysWho = (() => { try { return localStorage.getItem('bgl-plays-who') === 'mine' ? 'mine' : 'all'; } catch (_) { return 'all'; } })();   // Latest plays: everyone's or yours

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
      allPlays.push({ game, date: play.date, t: play.t, e: play.e, sc: play.sc, b: play.b || '' });
      if (!gamePlayCounts[bggId]) gamePlayCounts[bggId] = { game, count: 0 };
      gamePlayCounts[bggId].count++;

      const [y, m, d] = play.date.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow];
      allDays[dayName] = (allDays[dayName] || 0) + 1;

      const loc = play.l || '';
      if (loc) allLocs[loc] = (allLocs[loc] || 0) + 1;

      const decided = !isNoResultPlay(play, bggId);  // no result: neither won nor lost
      for (const s of play.sc) {
        if (HIDDEN_PLAYERS.has(s.n)) continue;
        if (!playerStats[s.n]) playerStats[s.n] = { plays: 0, wins: 0, decided: 0, games: new Set() };
        playerStats[s.n].plays++;
        if (decided && !isNoResultSeat(s)) playerStats[s.n].decided++;
        if (s.w) playerStats[s.n].wins++;
        playerStats[s.n].games.add(Number(bggId));
      }
    }
  }
  allPlays.sort((a, b) => byPlayOrder(b, a));

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

  // ── Library → Find a game: search and filters across every catalogue ──
  const buildGamesTab = () => `${buildGameBrowserHtml()}
      <div id="games-curated" class="stats-player-sub gb-idle">Type a name to find a game: the ones on your shelves and in your plays first, then all of BoardGameGeek. Or open Filters to browse by players, time, weight and more.</div>`;

  // ── Group → Stats: the most played, the newest ratings, when and where ──
  const buildCuratedHtml = () => {
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
    .map(([name, d]) => ({ name, plays: d.plays, wins: d.wins, games: d.games.size, wr: d.decided ? Math.round(d.wins / d.decided * 100) : 0 }))
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
      const scoresHtml = _playScoresHtml(p.sc);
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
      ${buildCuratedHtml()}`;
  };
  // ── Play → Latest plays: everyone's or just yours, newest first ──
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const meCanon = me && typeof _origCanon === 'function' ? _origCanon(me) : me;
  const isMine = (p) => (p.sc || []).some(s => s && (s.n === me || (typeof _origCanon === 'function' && _origCanon(s.n) === meCanon)));
  const playsWho = me && _explorePlaysWho === 'mine' ? 'mine' : 'all';
  const shownPlays = playsWho === 'mine' ? allPlays.filter(isMine) : allPlays;
  const buildPlaysTab = () => {
    const playRowHtml = (p) => {
      const scoresHtml = _playScoresHtml(p.sc);
      const boardHtml = p.b ? `<span class="stats-recent-result">&nbsp;&middot; &#9876; ${_escapeHtml(p.b)}</span>` : '';
      const img = p.game.bggId >= 0 ? `<img class="ex-play-img" src="images/${p.game.bggId}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${p.game.bggId})">` : '<span class="ex-play-img"></span>';
      return `<div class="stats-recent-play ex-play" data-bgg-id="${p.game.bggId}">
        ${img}
        <div class="ex-play-main">
          <div class="stats-recent-top">
            <span class="stats-recent-game">${_escapeHtml(p.game.name)}</span>
            <span class="stats-recent-date">${_fmtDateShort(p.date)}</span>
          </div>
          <div class="play-scores" style="margin-top:0.3rem">${scoresHtml}</div>
          ${boardHtml}
        </div>
      </div>`;
    };
    const logBtn = typeof logPlayBtnHtml === 'function' ? logPlayBtnHtml(null, 'plays') : '';
    // everyone's or yours: the same list, the same rows
    const seg = me ? `<div class="ex-plays-who"><div class="seg" role="tablist" aria-label="Whose plays">
        <button type="button" class="seg-btn${playsWho === 'all' ? ' active' : ''}" data-plays-who="all" role="tab" aria-selected="${playsWho === 'all'}">Everyone</button>
        <button type="button" class="seg-btn${playsWho === 'mine' ? ' active' : ''}" data-plays-who="mine" role="tab" aria-selected="${playsWho === 'mine'}">Yours</button>
      </div></div>` : '';
    return `${seg}${logBtn ? `<div class="ex-log">${logBtn}</div>` : ''}
      <div class="stats-section">
        ${shownPlays.slice(0, _explorePlaysShown).map(playRowHtml).join('') || '<div class="stats-player-sub gb-empty">No plays of yours yet. Log one and it shows here.</div>'}
        ${shownPlays.length > _explorePlaysShown ? `<button type="button" class="gb-more" id="ex-plays-more">Show more</button>` : ''}
      </div>`;
  };

  if (_exploreTab === 'trending' && !(typeof trendingAllowed === 'function' && trendingAllowed())) _exploreTab = 'games';
  const tabContent = _exploreTab === 'players' ? buildPlayersTab()
    : _exploreTab === 'trending' ? buildTrendingTabHtml()
    : _exploreTab === 'stats' ? buildStatsTab()
    : _exploreTab === 'tonight' ? buildTonightTabHtml()
    : _exploreTab === 'plays' ? buildPlaysTab()
    : _exploreTab === 'campaigns' ? buildCampaignsTabHtml()
    : buildGamesTab();
  const counts = `${totalPlays.toLocaleString('en')} plays &middot; ${Object.keys(gamePlayCounts).length} games &middot; ${topPlayers.length} players`;
  const [title, sub] = {
    games: ['Find a game', 'Every game on your shelves and in your plays, and all of BoardGameGeek.'],
    tonight: ['Tonight', 'What should we play tonight? Pick how many of you are playing, whose place it is and how long you have.'],
    campaigns: ['Campaigns', 'Your campaigns and where each one stands, and the ones you can start for your group.'],
    plays: ['Latest plays', `${playsWho === 'mine' ? 'Your' : 'Everyone&rsquo;s'} plays, newest first &middot; ${shownPlays.length.toLocaleString('en')} in all`],
    trending: ['Crowdfunding', 'The crowdfunding campaigns running now, the new games everyone&rsquo;s talking about and what&rsquo;s new for the games you own.'],
    players: ['Players', counts],
    stats: ['Group stats', counts],
  }[_exploreTab] || ['Find a game', ''];

  container.innerHTML = `
    <div class="stats-header">
      <div class="stats-player-name">${title}</div>
      <div class="stats-player-sub">${sub}</div>
    </div>
    ${tabContent}
  `;
  const morePlays = container.querySelector('#ex-plays-more');
  if (morePlays) morePlays.addEventListener('click', () => { _explorePlaysShown += 40; showGamesView(); });
  container.querySelectorAll('[data-plays-who]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.playsWho === _explorePlaysWho) return;
    _explorePlaysWho = b.dataset.playsWho;
    _explorePlaysShown = 40;
    try { localStorage.setItem('bgl-plays-who', _explorePlaysWho); } catch (_) {}
    showGamesView();
  }));
  if (_exploreTab === 'campaigns') wireCampaignsTab(container);

  // Wire game/play rows (covers every sub-tab's [data-bgg-id] rows)
  container.querySelectorAll('.stats-section [data-bgg-id]').forEach(el => {
    el.addEventListener('click', () => {
      const game = findGameByBggId(el.dataset.bggId);
      if (game) openModal(game);
    });
  });

  // Games sub-tab: search + filters across every catalogue
  if (_exploreTab === 'games') wireGameBrowser(container);
  if (_exploreTab === 'tonight') wireTonightTab(container);
  if (_exploreTab === 'trending') wireTrendingTab(container);

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


// ── Play → Campaigns: every campaign in one list ──
// The four games with a campaign sheet (Codenames: Critical Role Adventures
// and Rove on their game page's Campaign tab, Oathsworn and the Marvel
// Champions Gauntlet on the campaign page), open to everyone: your own
// campaign's progress, or a start. Then the campaigns followed from the plays
// (CAMPAIGN_PROGRESS) you were in: only yours, nobody else's (the user, 2 Nov
// 2026). A bar goes green when you've done the final scenario, and is faded
// where your plays start mid-campaign (the earlier ones aren't logged).
const EX_SHEETS = [
  { kind: 'cr', id: () => (typeof CNCR_BGGID !== 'undefined' ? CNCR_BGGID : 0), what: 'The map, the heroes and each mission&rsquo;s rules' },
  { kind: 'rove', id: () => (typeof ROVE_BGGID !== 'undefined' ? ROVE_BGGID : 0), what: 'The Rovers, the lyst and the ether' },
  { kind: 'oath', id: () => (typeof OATHSWORN_BGGID !== 'undefined' ? OATHSWORN_BGGID : 0), what: 'The trail through the Deepwood and the boss rankings' },
  { kind: 'gauntlet', id: () => (typeof MC_BGGID !== 'undefined' ? MC_BGGID : 0), what: 'The Gauntlet: every villain in release order, on Expert' },
];
let _exSheets = null;      // kind → the viewer's campaigns [{cid, name, pct, text, done, at}], once loaded
let _exSheetsFor = null;   // whose they are
const _exDay = (ms) => { if (!ms) return ''; const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// The viewer's campaigns of each sheet game, newest first.
async function _exLoadSheets() {
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const out = {};
  const canon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
  const isMe = (n) => !!me && !!n && canon(n) === canon(me);
  const add = (kind, cid, c, sum, name) => {
    if (!sum) return;
    (out[kind] = out[kind] || []).push({ cid, name, ...sum, stopped: c.status === 'stopped', at: _exDay(c.updated || c.created) });
  };
  await Promise.all([
    typeof _crLoad === 'function' && _crLoad(true).then(() => {
      for (const cid in _crCamps) {
        const c = _crCamps[cid];
        if (!_crList(c.players).concat(c.gm || []).some(isMe)) continue;
        add('cr', cid, c, crSummary(c), c.name || CR_SLOTS.map(s => (c.heroes || {})[s]).filter(h => h && h.id).map(_crHeroName).join(', '));
      }
    }).catch(e => console.warn('Campaigns: Codenames', e)),
    typeof _rvLoad === 'function' && _rvLoad(true).then(() => {
      for (const cid in _rvCamps) if (_rvMine(_rvCamps[cid])) add('rove', cid, _rvCamps[cid], rvSummary(_rvCamps[cid]), _rvCamps[cid].name || _rvParty(_rvCamps[cid]).players.join(', '));
    }).catch(e => console.warn('Campaigns: Rove', e)),
    ...['oath', 'gauntlet'].map(kind => typeof pcLoad === 'function' && pcLoad(kind).then(camps => {
      for (const cid in camps) if (pcIsMine(camps[cid])) add(kind, cid, camps[cid], pcSummary(kind, cid, camps[cid]), camps[cid].name || pcPlayers(camps[cid]).join(', '));
    }).catch(e => console.warn('Campaigns:', kind, e))),
  ]);
  for (const k in out) out[k].sort((a, b) => (a.stopped - b.stopped) || b.at.localeCompare(a.at));
  _exSheets = out;
  _exSheetsFor = me;
}

// A progress bar: green when done; faded up to where your plays start.
function _exBarHtml(pct, done, firstPct) {
  const w = Math.max(3, Math.min(100, pct));
  const known = firstPct > 0 && w > 0 ? Math.min(100, Math.round(firstPct / w * 100)) : 0;
  return `<span class="ex-camp-bar${done ? ' done' : ''}"><i style="width:${w}%${known ? `;--known:${known}%` : ''}"${known ? ' class="part"' : ''}></i></span>`;
}

function _exCampaignCards() {
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const esc = _escapeHtml;
  const cards = [];
  // the sheet games: yours, or a start
  for (const S of EX_SHEETS) {
    const id = S.id();
    const game = id && findGameByBggId(id);
    if (!game) continue;
    const loaded = _exSheets && _exSheetsFor === me;
    const mine = (loaded && _exSheets[S.kind]) || [];
    const top = mine[0];
    let body;
    if (top) {
      body = `<span class="ex-camp-party">${esc(top.name || 'Your party')}${top.stopped ? ' &middot; stopped' : ''}</span>
        ${_exBarHtml(top.pct, top.done, 0)}
        <span class="ex-camp-sub">${esc(top.text)}</span>
        ${mine.length > 1 ? `<span class="ex-camp-sub">and ${mine.length - 1} more of yours</span>` : ''}`;
    } else {
      body = `<span class="ex-camp-what">${S.what}</span>
        <span class="ex-camp-sub ex-camp-start">${!me ? 'Pick who you are to start one' : loaded ? 'Start a campaign for your group &rsaquo;' : 'Looking for yours&hellip;'}</span>`;
    }
    cards.push({
      order: top ? (top.done ? 2 : top.stopped ? 1.5 : 0) : 1, at: top ? top.at : '',
      html: `<button type="button" class="ex-camp${top && top.done ? ' done' : ''}" data-ex-camp="${S.kind}|${id}|${top ? esc(top.cid) : ''}">
        <img class="ex-camp-cover" src="images/${id}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${id})">
        <span class="ex-camp-main"><b>${esc(game.name)}</b><span class="ex-camp-tag">Campaign sheet</span>${body}</span>
      </button>`,
    });
  }
  // followed from the plays you were in
  const sheetIds = new Set(EX_SHEETS.map(S => S.id()));
  if (me && typeof progressPlaysOf === 'function') {
    for (const id of Object.keys(typeof CAMPAIGN_PROGRESS !== 'undefined' ? CAMPAIGN_PROGRESS : {}).map(Number)) {
      if (sheetIds.has(id)) continue;
      const game = findGameByBggId(id);
      const p = progressPlaysOf(PLAY_HISTORY[id] || []);
      if (!game || !p.mine) continue;   // only the ones you play
      const cp = campaignProgress(id, p.plays);
      if (!cp) continue;
      const last = p.plays.reduce((d, x) => (x.date > d ? x.date : d), '');
      const done = !!cp.complete;
      const firstPct = !done && cp.first > 1 ? Math.round((cp.first - 1) / cp.total * 100) : 0;
      cards.push({
        order: done ? 2 : 0, at: last,
        html: `<button type="button" class="ex-camp${done ? ' done' : ''}" data-ex-camp="plays|${id}|">
          <img class="ex-camp-cover" src="images/${id}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${id})">
          <span class="ex-camp-main"><b>${esc(game.name)}</b>
            ${_exBarHtml(cp.pct, done, firstPct)}
            <span class="ex-camp-sub">${done ? esc(cp.reachedText || cp.stageText) : `${esc(cp.stageText)}${cp.reachedText ? ` &middot; ${esc(cp.reachedText)}` : ''}`}</span>
            ${firstPct ? `<span class="ex-camp-sub ex-camp-gap">Your plays start at ${esc(_exStage(id, cp.first))}: the ones before aren&rsquo;t logged</span>` : ''}
            <span class="ex-camp-sub">You last played it ${_fmtDateShort(last)}</span>
          </span>
        </button>`,
      });
    }
  }
  // what you're playing, newest first; then campaigns to start; then the finished ones
  return cards.sort((a, b) => (a.order - b.order) || b.at.localeCompare(a.at)).map(c => c.html);
}
// A stage as the game counts it: "mission 6", Take Time's "folder 5, clock 1".
function _exStage(id, n) {
  const cfg = CAMPAIGN_PROGRESS[id] || {};
  if (cfg.format === 'folder-clock') {
    const per = cfg.perFolder || 1, folder = Math.ceil(n / per);
    return `folder ${folder}, clock ${n - (folder - 1) * per}`;
  }
  return `${(cfg.label || 'stage').toLowerCase()} ${n}`;
}
function buildCampaignsTabHtml() {
  return `<div class="stats-section"><div class="ex-camps" id="ex-camps">${_exCampaignCards().join('')}</div></div>`;
}
function wireCampaignsTab(container) {
  const box = container.querySelector('#ex-camps');
  if (!box) return;
  box.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-ex-camp]');
    if (!el) return;
    const [kind, id, cid] = el.dataset.exCamp.split('|');
    if (kind === 'oath' || kind === 'gauntlet') {
      _ilioSubTab = kind === 'oath' ? 'oathsworn' : 'gauntlet';
      if (cid) { _pcOpen[kind] = cid; _pcDraft = null; }
      switchToIlioupoli();
      return;
    }
    const game = findGameByBggId(Number(id));
    if (!game) return;
    if (kind === 'cr' && cid) { _crId = cid; _crDraft = null; }
    if (kind === 'rove' && cid) { _rvId = cid; _rvDraft = null; }
    _modalTab = kind === 'plays' ? 'plays' : 'campaign';
    _modalTabFor = game.bggId;
    openModal(game);
  });
  // the campaigns kept on the sheets: yours, once they're in
  _exLoadSheets().then(() => {
    if (box.isConnected && _exploreTab === 'campaigns') box.innerHTML = _exCampaignCards().join('');
  }).catch(() => {});
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
