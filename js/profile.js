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

// ── "Rate your games" carousel ──
// A banner near the top of your OWN profile: a swipeable carousel of your most
// recent games. Each card rates a game with 10 whole stars (click a position or
// slide across them, then Submit). Rated games show their existing score so you
// can browse previous ratings and change them. Returns '' when there is nothing
// to show (visiting someone else, or no plays).
const RLG_MAX_GAMES = 15;
function _rlgEsc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function buildRateLastGameBar(playerName, isOwnProfile, recentPlays) {
  if (_rlgDismissed) return '';
  if (!isOwnProfile || !recentPlays || !recentPlays.length) return '';
  // Distinct recent games, newest first, capped.
  const seen = new Set();
  const games = [];
  for (const p of recentPlays) {
    if (!p.game || !(p.bggId >= 0) || seen.has(p.bggId)) continue;
    seen.add(p.bggId);
    games.push({ bggId: p.bggId, name: p.game.name });
    if (games.length >= RLG_MAX_GAMES) break;
  }
  if (!games.length) return '';
  // Open on the first unrated game (fall back to the newest).
  let start = games.findIndex(g => getPlayerRating(playerName, g.bggId) === 0);
  if (start < 0) start = 0;

  const star = '<span class="rlg-star">&#9733;</span>';
  const card = (g, i) => {
    const rating = getPlayerRating(playerName, g.bggId);
    const rated = rating > 0;
    const prompt = rated ? 'Your rating' : (i === 0 ? 'Rate your last game' : 'Rate a recent game');
    return `<div class="rlg-card" data-bgg="${g.bggId}" data-saved="${rating}">
      <div class="rate-last-cover"><img class="rate-last-cover-img" src="images/${g.bggId}.jpg" alt="" onerror="__imgFallback(this, ${g.bggId})"></div>
      <div class="rate-last-body">
        <div class="rate-last-prompt">${prompt}</div>
        <div class="rate-last-game" title="${_rlgEsc(g.name)}">${_rlgEsc(g.name)}</div>
        <div class="rate-last-rate">
          <div class="rlg-stars" role="slider" tabindex="0" aria-label="Rate ${_rlgEsc(g.name)} from 1 to 10" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${rating}">${star.repeat(10)}</div>
          <span class="rlg-value"></span>
          <button class="rlg-submit" type="button" disabled>${rated ? 'Update' : 'Rate'}</button>
        </div>
      </div>
    </div>`;
  };
  const nav = games.length > 1
    ? `<div class="rlg-nav">
         <button class="rlg-arrow rlg-prev" type="button" aria-label="Previous game">&#8249;</button>
         <span class="rlg-count"></span>
         <button class="rlg-arrow rlg-next" type="button" aria-label="Next game">&#8250;</button>
       </div>`
    : '';
  return `<div class="rate-last-bar" id="rate-last-bar" data-start="${start}">
    <button class="rate-last-close" id="rate-last-close" type="button" aria-label="Hide">&times;</button>
    <div class="rlg-viewport" id="rlg-viewport">
      <div class="rlg-track" id="rlg-track">${games.map(card).join('')}</div>
    </div>
    ${nav}
  </div>`;
}

function wireRateLastGame(container, playerName, isOwnProfile, recentPlays) {
  const bar = container.querySelector('#rate-last-bar');
  if (!bar) return;
  const track = bar.querySelector('#rlg-track');
  const viewport = bar.querySelector('#rlg-viewport');
  if (!track || !viewport) return;
  const cards = [...track.querySelectorAll('.rlg-card')];
  const count = cards.length;
  let current = Math.max(0, Math.min(count - 1, Number(bar.dataset.start) || 0));

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

  const countEl = bar.querySelector('.rlg-count');
  const prevBtn = bar.querySelector('.rlg-prev');
  const nextBtn = bar.querySelector('.rlg-next');

  // Card width == viewport width, so a % transform is resize-proof.
  const goTo = (i, animate = true) => {
    current = Math.max(0, Math.min(count - 1, i));
    track.style.transition = animate ? 'transform 0.3s ease' : 'none';
    track.style.transform = `translateX(${-current * 100}%)`;
    if (countEl) countEl.textContent = `${current + 1} / ${count}`;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === count - 1;
  };

  // Per-card rating slider (each card is independent; pre-filled to its rating).
  cards.forEach((card, cardIdx) => {
    const bggId = Number(card.dataset.bgg);
    let saved = Number(card.dataset.saved) || 0;
    const starsEl = card.querySelector('.rlg-stars');
    const starEls = [...starsEl.querySelectorAll('.rlg-star')];
    const valueEl = card.querySelector('.rlg-value');
    const submitBtn = card.querySelector('.rlg-submit');
    let pending = saved;

    const render = (v) => {
      for (let i = 0; i < starEls.length; i++) starEls[i].classList.toggle('filled', (i + 1) <= v);
      valueEl.textContent = v ? `${v}/10` : '';
      starsEl.setAttribute('aria-valuenow', String(v || 0));
    };
    const valueFromX = (clientX) => {
      for (let i = 0; i < starEls.length; i++) if (clientX <= starEls[i].getBoundingClientRect().right) return i + 1;
      return 10;
    };
    const refreshSubmit = () => {
      submitBtn.disabled = !pending || pending === saved;
      submitBtn.textContent = saved ? 'Update' : 'Rate';
    };
    const setPending = (v) => { pending = v; render(v); refreshSubmit(); };

    render(saved);
    refreshSubmit();

    let dragging = false;
    starsEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();                 // don't let the carousel swipe start
      dragging = true;
      try { starsEl.setPointerCapture(e.pointerId); } catch (_) {}
      setPending(valueFromX(e.clientX));
      e.preventDefault();
    });
    starsEl.addEventListener('pointermove', (e) => {
      if (dragging) setPending(valueFromX(e.clientX));
      else render(valueFromX(e.clientX));   // hover preview (no commit)
    });
    const endDrag = (e) => { if (!dragging) return; dragging = false; try { starsEl.releasePointerCapture(e.pointerId); } catch (_) {} };
    starsEl.addEventListener('pointerup', endDrag);
    starsEl.addEventListener('pointercancel', endDrag);
    starsEl.addEventListener('pointerleave', () => { if (!dragging) render(pending); });
    starsEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setPending(Math.min(10, (pending || 0) + 1)); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setPending(Math.max(1, (pending || 1) - 1)); e.preventDefault(); }
      else if (e.key === 'Enter' && !submitBtn.disabled) { submit(); }
    });

    async function submit() {
      if (submitBtn.disabled) return;
      const val = pending;
      submitBtn.disabled = true;
      await saveRating(playerName, bggId, val);
      saved = val;
      card.dataset.saved = String(val);
      card.querySelector('.rate-last-prompt').textContent = 'Your rating';
      const body = card.querySelector('.rate-last-body');
      let done = body.querySelector('.rate-last-done');
      if (!done) { body.insertAdjacentHTML('beforeend', '<div class="rate-last-done"></div>'); done = body.querySelector('.rate-last-done'); }
      done.innerHTML = `Saved &mdash; ${val}/10 &#10003;`;
      refreshSubmit();
      // Gentle flow: clear the note and advance to the next game, if any.
      setTimeout(() => {
        if (done) done.remove();
        if (current === cardIdx && current < count - 1) goTo(current + 1);
      }, 900);
    }
    submitBtn.addEventListener('click', submit);
  });

  // Arrow navigation.
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Swipe navigation — active only outside the stars/buttons so rating still works.
  if (count > 1) {
    let swiping = false, startX = 0, basePx = 0;
    viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.rlg-stars') || e.target.closest('button')) return;
      swiping = true;
      startX = e.clientX;
      basePx = -current * viewport.clientWidth;
      track.style.transition = 'none';
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!swiping) return;
      track.style.transform = `translateX(${basePx + (e.clientX - startX)}px)`;
    });
    const endSwipe = (e) => {
      if (!swiping) return;
      swiping = false;
      try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
      const dx = e.clientX - startX;
      const threshold = viewport.clientWidth * 0.2;
      if (dx <= -threshold && current < count - 1) goTo(current + 1);
      else if (dx >= threshold && current > 0) goTo(current - 1);
      else goTo(current);
    };
    viewport.addEventListener('pointerup', endSwipe);
    viewport.addEventListener('pointercancel', endSwipe);
  }

  goTo(current, false);
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
