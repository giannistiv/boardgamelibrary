let _viewingProfile = null; // null = own profile, string = visiting someone
let _statsViewSource = null; // 'leaderboard' | 'insights' | null — where the visit was triggered from
let _rlgDismissed = false; // "rate last game" bar dismissed for this session (resets on refresh)
let _rlgPosBgg = null;     // bggId of the rating-carousel card currently shown
let _rlgResume = false;    // set when a modal opened from the profile closes → keep that card

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
// A banner near the top of your OWN profile. It opens on the most recently
// played game you haven't rated. One way lie your other unrated games (newest
// play first); the other way the games you've rated, most recently rated
// first, so going back always shows what you rated last, refresh or not. Each
// card rates a game with 10 whole stars (click a position or slide across
// them, then Submit). Returns '' when there is nothing left to rate (visiting
// someone else, no plays, or every game in reach already rated).
//
// The layout follows the device. With a mouse it reads left to right: past
// ratings, the current game, games to rate; ‹ › arrows on hover, a two-finger
// trackpad swipe or ←/→ step through it. On touch it's mirrored, so swiping
// left goes back to what you just rated and swiping right to the next game.
const RLG_MAX_RATED = 15;    // how far back the rated side reaches
const RLG_MAX_UNRATED = 35;  // unrated games offered, newest play first

function _rlgDesktop() {
  return !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
}

function buildRateLastGameBar(playerName, isOwnProfile, recentPlays) {
  const resume = _rlgResume;       // consumed: applies only to the render right after a modal closes
  _rlgResume = false;
  if (_rlgDismissed) return '';
  if (!isOwnProfile || !recentPlays || !recentPlays.length) return '';

  // Still to rate: distinct games, most recently played first.
  const seen = new Set();
  const unrated = [];
  for (const p of recentPlays) {
    if (!p.game || !(p.bggId >= 0) || seen.has(p.bggId)) continue;
    seen.add(p.bggId);
    if (getPlayerRating(playerName, p.bggId) !== 0) continue;
    unrated.push({ bggId: p.bggId, name: p.game.name, date: p.date, latest: seen.size === 1 });
    if (unrated.length >= RLG_MAX_UNRATED) break;
  }
  // Every game in reach is rated: no reason to show the banner.
  if (!unrated.length) return '';

  // Already rated: most recently rated first.
  const rated = [];
  for (const bggId in ratingsCache) {
    const r = ratingsCache[bggId] && ratingsCache[bggId][playerName];
    if (!(_ratingValue(r) > 0)) continue;
    const g = findGameByBggId(bggId);
    if (g) rated.push({ bggId: Number(bggId), name: g.name, ratedAt: (r && r.updatedAt) || 0 });
  }
  rated.sort((a, b) => b.ratedAt - a.ratedAt);
  rated.length = Math.min(rated.length, RLG_MAX_RATED);

  // Desktop, left → right: oldest rating … latest rating | next to rate …
  const desktop = _rlgDesktop();
  const ordered = rated.slice().reverse().concat(unrated);
  let start = rated.length;
  if (!desktop) { ordered.reverse(); start = ordered.length - 1 - start; }
  // Back from a game opened on this profile: stay on the card you were viewing.
  if (resume && _rlgPosBgg != null) {
    const at = ordered.findIndex(g => g.bggId === _rlgPosBgg);
    if (at >= 0) start = at;
  }

  const star = '<span class="rlg-star">&#9733;</span>';
  const card = (g) => {
    const rating = getPlayerRating(playerName, g.bggId);
    const prompt = rating > 0
      ? (g.ratedAt ? `Your rating &middot; ${_timeAgo(g.ratedAt)}` : 'Your rating')
      : g.latest ? 'Rate your last game' : `Not rated yet &middot; played ${_fmtDateShort(g.date)}`;
    return `<div class="rlg-card" data-bgg="${g.bggId}" data-saved="${rating}">
      <div class="rate-last-cover" role="button" tabindex="0" title="Open ${_escapeHtml(g.name)}"><img class="rate-last-cover-img" src="images/${g.bggId}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${g.bggId})"></div>
      <div class="rate-last-body">
        <div class="rate-last-prompt">${prompt}</div>
        <div class="rate-last-game" title="${_escapeHtml(g.name)}">${_escapeHtml(g.name)}</div>
        <div class="rate-last-rate">
          <div class="rlg-stars" role="slider" tabindex="0" aria-label="Rate ${_escapeHtml(g.name)} from 1 to 10" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${rating}">${star.repeat(10)}</div>
          <span class="rlg-value"></span>
          <button class="rlg-submit" type="button" disabled>${rating > 0 ? 'Update' : 'Rate'}</button>
        </div>
      </div>
    </div>`;
  };
  const prevLabel = 'Your previous rating', nextLabel = 'Next game to rate';
  const leftLabel = desktop ? prevLabel : nextLabel;
  const rightLabel = desktop ? nextLabel : prevLabel;
  const arrows = ordered.length > 1
    ? `<button class="rlg-arrow rlg-left" type="button" aria-label="${leftLabel}" title="${leftLabel}">&#8249;</button>
       <button class="rlg-arrow rlg-right" type="button" aria-label="${rightLabel}" title="${rightLabel}">&#8250;</button>`
    : '';
  return `<div class="rate-last-bar" id="rate-last-bar" data-start="${start}" data-next="${desktop ? 1 : -1}">
    <button class="rate-last-close" id="rate-last-close" type="button" aria-label="Hide">&times;</button>
    <div class="rlg-viewport" id="rlg-viewport">
      <div class="rlg-track" id="rlg-track">${ordered.map(card).join('')}</div>
    </div>
    ${arrows}
  </div>`;
}

// ←/→ step through the carousel while the pointer is over it or focus is in
// it (but not on the stars, where the arrow keys change the rating). One
// document listener for the page's lifetime; it drives whichever banner is
// currently rendered.
let _rlgKeysWired = false;
function _rlgWireKeys() {
  if (_rlgKeysWired) return;
  _rlgKeysWired = true;
  document.addEventListener('keydown', (e) => {
    if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const bar = document.getElementById('rate-last-bar');
    if (!bar || !bar._rlgStep) return;
    const a = document.activeElement;
    if (!(bar.matches(':hover') || (a && bar.contains(a)))) return;
    if (a && (a.closest('.rlg-stars') || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return;
    e.preventDefault();
    bar._rlgStep(e.key === 'ArrowLeft' ? -1 : 1);
  });
}

function wireRateLastGame(container, playerName, isOwnProfile, recentPlays) {
  const bar = container.querySelector('#rate-last-bar');
  if (!bar) return;
  const track = bar.querySelector('#rlg-track');
  const viewport = bar.querySelector('#rlg-viewport');
  if (!track || !viewport) return;
  const cards = [...track.querySelectorAll('.rlg-card')];
  const count = cards.length;
  const next = Number(bar.dataset.next) || 1;   // index step toward the next game to rate
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

  const leftBtn = bar.querySelector('.rlg-left');
  const rightBtn = bar.querySelector('.rlg-right');

  // Card width == viewport width, so a % transform is resize-proof.
  const goTo = (i, animate = true) => {
    current = Math.max(0, Math.min(count - 1, i));
    _rlgPosBgg = Number(cards[current].dataset.bgg);
    track.style.transition = animate ? 'transform 0.3s ease' : 'none';
    track.style.transform = `translateX(${-current * 100}%)`;
    if (leftBtn) leftBtn.disabled = current <= 0;
    if (rightBtn) rightBtn.disabled = current >= count - 1;
  };
  bar._rlgStep = (d) => goTo(current + d);
  _rlgWireKeys();

  // After a new rating, move on: the nearest unrated card in the "next"
  // direction, else the nearest one the other way.
  const nextUnrated = (from) => {
    const open = cards.map((c, i) => (Number(c.dataset.saved) > 0 ? -1 : i)).filter(i => i >= 0);
    const byDistance = (a, b) => Math.abs(a - from) - Math.abs(b - from);
    const ahead = open.filter(i => (i - from) * next > 0).sort(byDistance);
    return ahead.length ? ahead[0] : open.sort(byDistance)[0];
  };

  // Per-card rating slider (each card is independent; pre-filled to its rating).
  cards.forEach((card, cardIdx) => {
    const bggId = Number(card.dataset.bgg);
    let saved = Number(card.dataset.saved) || 0;

    // Cover opens the game's page (modal). Closing it returns to this profile.
    const cover = card.querySelector('.rate-last-cover');
    if (cover) {
      const openGame = () => { const g = findGameByBggId(bggId); if (g) openModal(g); };
      cover.addEventListener('click', openGame);
      cover.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGame(); } });
    }
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
      const isNew = !saved;
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
      setTimeout(() => {
        if (done) done.remove();
        // Nothing left unrated → no reason to keep the banner; fade it out.
        if (!cards.some(c => !(Number(c.dataset.saved) > 0))) {
          bar.classList.add('rate-last-hide');
          setTimeout(() => bar.remove(), 320);
          return;
        }
        // A first rating slides on to the next game to rate; changing an old
        // rating stays put. Either way, not if you've already moved on.
        if (isNew && current === cardIdx) goTo(nextUnrated(cardIdx));
      }, 900);
    }
    submitBtn.addEventListener('click', submit);
  });

  if (leftBtn) leftBtn.addEventListener('click', () => goTo(current - 1));
  if (rightBtn) rightBtn.addEventListener('click', () => goTo(current + 1));

  if (count > 1) {
    // Finger swipe (touch and pen). A mouse doesn't drag it: it has the
    // arrows, the keys and the trackpad instead.
    let swiping = false, startX = 0, basePx = 0;
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      if (e.target.closest('.rlg-stars') || e.target.closest('button') || e.target.closest('.rate-last-cover')) return;
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

    // Two-finger trackpad swipe: one card per gesture. Momentum events keep
    // arriving after the fingers lift, so stay locked until they stop.
    let wheelAcc = 0, wheelLocked = false, wheelQuiet = null;
    viewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   // vertical: let the page scroll
      e.preventDefault();                                      // and no browser back/forward swipe
      clearTimeout(wheelQuiet);
      wheelQuiet = setTimeout(() => { wheelLocked = false; wheelAcc = 0; }, 180);
      if (wheelLocked) return;
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) >= 40) { wheelLocked = true; goTo(current + Math.sign(wheelAcc)); }
    }, { passive: false });
  }

  goTo(current, false);
}

// Letterboxd-style ratings histogram: one bar per score 1-10, height by how
// many games the player rated that score. Returns '' if they've rated nothing.
function buildRatingsGraphHtml(playerName) {
  const counts = new Array(11).fill(0); // counts[1..10]
  let total = 0, sum = 0;
  for (const bggId in ratingsCache) {
    const entry = ratingsCache[bggId];
    if (!entry) continue;
    const v = _ratingValue(entry[playerName]);
    if (v >= 1 && v <= 10) { counts[v]++; total++; sum += v; }
  }
  if (!total) return '';
  const max = Math.max.apply(null, counts.slice(1));
  const avg = (sum / total).toFixed(1);
  let cols = '';
  for (let v = 1; v <= 10; v++) {
    const c = counts[v];
    const pct = c && max ? Math.max(Math.round(c / max * 100), 5) : 0;
    cols += `<div class="rg-col" title="${c} game${c === 1 ? '' : 's'} rated ${v}/10">
      <div class="rg-cnt">${c || ''}</div>
      <div class="rg-track"><div class="rg-bar${c ? '' : ' rg-bar-empty'}"${c ? ` style="height:${pct}%"` : ''}></div></div>
      <div class="rg-num">${v}</div>
    </div>`;
  }
  return `<div class="stats-section">
    <div class="stats-section-title">Ratings</div>
    <div class="rg-graph">${cols}</div>
    <div class="rg-summary"><span>${total} game${total === 1 ? '' : 's'} rated</span><span>avg ${avg}/10</span></div>
  </div>`;
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

    ${buildRatingsGraphHtml(playerName)}

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
