function isCoop(game) {
  return game.categories.includes('Co-op');
}
function isExpansion(game) {
  return EXPANSION_IDS.has(game.id);
}
function isCampaign(game) {
  if (!game) return false;
  const hasCampaignCat = Array.isArray(game.categories) && game.categories.includes('Campaign');
  const hasLegacyMech  = Array.isArray(game.mechanics) && game.mechanics.includes('Legacy Game');
  return hasCampaignCat || hasLegacyMech;
}

// ── Render filters ──
function renderFilters() {
  // Populate category multi-select checkboxes
  const catDD = document.getElementById('f-category-dd');
  const catBtn = document.getElementById('f-category-btn');
  const usedCats = new Set();
  GAMES.forEach(g => g.categories.forEach(c => usedCats.add(c)));
  CATEGORIES.filter(c => usedCats.has(c)).forEach(cat => {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = cat;
    cb.addEventListener('change', () => { updateCatBtn(); applyFilters(); });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(cat));
    catDD.appendChild(label);
  });

  // Populate player count multi-select checkboxes
  const pDD = document.getElementById('f-players-dd');
  const pBtn = document.getElementById('f-players-btn');
  for (let i = 1; i <= 8; i++) {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = i;
    cb.addEventListener('change', () => { updatePBtn(); applyFilters(); });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(i === 8 ? '8+' : String(i)));
    pDD.appendChild(label);
  }

  // Toggle dropdowns open/close
  const allDropdowns = [
    { btn: catBtn, dd: catDD },
    { btn: pBtn, dd: pDD }
  ];
  allDropdowns.forEach(({ btn, dd }) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      allDropdowns.forEach(o => { if (o.dd !== dd) o.dd.classList.remove('open'); });
      dd.classList.toggle('open');
    });
  });
  document.addEventListener('click', (e) => {
    allDropdowns.forEach(({ btn, dd }) => {
      if (!dd.contains(e.target) && e.target !== btn) dd.classList.remove('open');
    });
  });

  function updateCatBtn() {
    const checked = catDD.querySelectorAll('input:checked');
    if (checked.length === 0) {
      catBtn.innerHTML = 'All <span class="filter-arrow">&#9662;</span>';
    } else if (checked.length === 1) {
      catBtn.innerHTML = checked[0].value + ' <span class="filter-arrow">&#9662;</span>';
    } else {
      catBtn.innerHTML = checked.length + ' selected <span class="filter-arrow">&#9662;</span>';
    }
  }

  function updatePBtn() {
    const checked = pDD.querySelectorAll('input:checked');
    if (checked.length === 0) {
      pBtn.innerHTML = 'Any <span class="filter-arrow">&#9662;</span>';
    } else if (checked.length === 1) {
      const v = checked[0].value;
      pBtn.innerHTML = (v === '8' ? '8+' : v) + ' <span class="filter-arrow">&#9662;</span>';
    } else {
      pBtn.innerHTML = checked.length + ' selected <span class="filter-arrow">&#9662;</span>';
    }
  }

  // Time slider
  const timeSlider = document.getElementById('f-time');
  const timeVal = document.getElementById('f-time-val');
  timeSlider.addEventListener('input', () => {
    const v = Number(timeSlider.value);
    timeVal.textContent = v >= 240 ? 'Any' : v + ' min';
    applyFilters();
  });

  // Wire up all dropdowns
  ['f-coop','f-difficulty','f-expansion'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });

  // Wire up checkboxes
  document.getElementById('f-campaign').addEventListener('change', applyFilters);

  // Reset
  document.getElementById('f-reset').addEventListener('click', () => {
    catDD.querySelectorAll('input:checked').forEach(cb => cb.checked = false);
    updateCatBtn();
    pDD.querySelectorAll('input:checked').forEach(cb => cb.checked = false);
    updatePBtn();
    document.getElementById('f-coop').value = '';
    document.getElementById('f-difficulty').value = '';
    document.getElementById('f-expansion').value = '';
    document.getElementById('f-campaign').checked = true;
    timeSlider.value = 240;
    timeVal.textContent = 'Any';
    document.getElementById('search-input').value = '';
    allDropdowns.forEach(({ dd }) => dd.classList.remove('open'));
    applyFilters();
  });

  // Search input
  document.getElementById('search-input').addEventListener('input', applyFilters);
}

function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
  const selectedCats = Array.from(document.querySelectorAll('#f-category-dd input:checked')).map(cb => cb.value);
  const coop = document.getElementById('f-coop').value;
  const selectedPlayers = Array.from(document.querySelectorAll('#f-players-dd input:checked')).map(cb => Number(cb.value));
  const diff = document.getElementById('f-difficulty').value;
  const expansion = document.getElementById('f-expansion').value;
  const showCampaign = document.getElementById('f-campaign').checked;
  const maxTime = Number(document.getElementById('f-time').value);
  const timeActive = maxTime < 240;

  const anyActive = searchTerm || selectedCats.length > 0 || coop || selectedPlayers.length > 0 || diff || expansion || !showCampaign || timeActive;
  const passes = (game) => {
    if (!anyActive) return true;
    if (!game) return false;
    if (searchTerm && !game.name.toLowerCase().includes(searchTerm)) return false;
    if (selectedCats.length > 0 && !selectedCats.some(c => game.categories.includes(c))) return false;
    if (coop === 'coop' && !isCoop(game)) return false;
    if (coop === 'competitive' && isCoop(game)) return false;
    if (selectedPlayers.length > 0) {
      const supported = parsePlayers(game.players);
      if (!selectedPlayers.some(p => supported.includes(p) || (p === 8 && Math.max(...supported) >= 8))) return false;
    }
    if (diff && difficultyBucket(game.complexity) !== diff) return false;
    if (expansion === 'core' && isExpansion(game)) return false;
    if (expansion === 'expansion' && !isExpansion(game)) return false;
    if (!showCampaign && isCampaign(game)) return false;
    if (timeActive && parseMinTime(game.playTime) > maxTime) return false;
    return true;
  };
  const byId = id => GAMES.find(g => g.id === id);
  const covers = _libMode() === 'covers';
  let matchCount = 0;

  document.querySelectorAll('.game-spine').forEach(el => {
    const pass = passes(byId(el.dataset.gameId));
    el.classList.toggle('faded', !pass);
    if (pass && !covers) matchCount++;
  });
  document.querySelectorAll('.lib-cover').forEach(el => {
    const pass = passes(byId(el.dataset.gameId));
    el.hidden = !pass;
    if (pass && covers) matchCount++;
  });

  const toggle = document.getElementById('lib-filter-toggle');
  if (toggle) {
    const n = selectedCats.length + (coop ? 1 : 0) + selectedPlayers.length + (diff ? 1 : 0) + (expansion ? 1 : 0) + (showCampaign ? 0 : 1) + (timeActive ? 1 : 0);
    toggle.innerHTML = `Filters${n ? ` <span class="gb-badge">${n}</span>` : ''}`;
  }

  // Show count badge
  const countEl = document.getElementById('f-count');
  if (anyActive) {
    countEl.innerHTML = `<span class="filter-active-count">${matchCount} game${matchCount !== 1 ? 's' : ''}</span>`;
  } else {
    countEl.innerHTML = '';
  }
}

// ── Render shelf ──
let _showingOtherSide = false;

function renderShelf() {
  const shelfEl = document.getElementById('shelf');
  shelfEl.innerHTML = '';
  shelfEl.style.gridTemplateColumns = _showingOtherSide ? 'repeat(3,1fr)' : 'repeat(6,1fr)';

  const rowRange = _showingOtherSide ? [7, 8] : [1, 6];
  const colCount = _showingOtherSide ? 3 : 6;

  for (let row = rowRange[0]; row <= rowRange[1]; row++) {
    for (let col = 1; col <= colCount; col++) {
      const key = `${row}-${col}`;
      const cfg = _showingOtherSide ? {} : (CUBBY_CONFIG[key] || {});

      if (cfg.skip) continue;

      const cubby = document.createElement('div');
      cubby.className = 'cubby';
      if (cfg.tall) cubby.classList.add('tall');

      if (cfg.filler) {
        cubby.classList.add('filler-cubby');
        cubby.textContent = cfg.filler;
        shelfEl.appendChild(cubby);
        continue;
      }

      let cubbyGames = GAMES.filter(g => g.row === row && g.col === col);
      if (cfg.tall) {
        const nextRowGames = GAMES.filter(g => g.row === row + 1 && g.col === col);
        cubbyGames = [...cubbyGames, ...nextRowGames];
      }

      if (cubbyGames.length <= 2) {
        cubby.classList.add('horizontal-layout');
      }

      cubbyGames.forEach(game => {
        const spine = document.createElement('div');
        spine.className = `game-spine box-${game.boxSize}${game.otherSide ? ' other-side' : ''}`;
        spine.style.background = game.spineColor;
        spine.dataset.gameId = game.id;
        spine.title = game.name;

        const text = document.createElement('span');
        text.className = 'spine-text';
        text.textContent = game.name;
        spine.appendChild(text);

        spine.addEventListener('click', () => openModal(game));
        cubby.appendChild(spine);
      });

      shelfEl.appendChild(cubby);
    }
  }
}

document.getElementById('btn-other-side').addEventListener('click', () => {
  _showingOtherSide = !_showingOtherSide;
  const btn = document.getElementById('btn-other-side');
  btn.innerHTML = _showingOtherSide ? '&#x21C4; Show Main Shelf' : '&#x21C4; Show Other Side';
  renderShelf();
  applyFilters();
  _scrollToShelfCenter();
});

// ── Covers view: every game on the shelf (both sides) as a grid of boxes ──
function renderCovers() {
  const grid = document.getElementById('lib-covers');
  if (!grid) return;
  const games = GAMES.slice().sort((a, b) => a.name.localeCompare(b.name));
  grid.innerHTML = games.map(g => `<button type="button" class="lib-cover" data-game-id="${_escapeHtml(g.id)}" title="${_escapeHtml(g.name)}">
      <span class="lib-cover-art" style="--spine:${_escapeHtml(g.spineColor || '#555')}"><img src="images/${g.bggId}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${g.bggId})"></span>
      <span class="lib-cover-name">${_escapeHtml(g.name)}</span>
    </button>`).join('');
  grid.querySelectorAll('.lib-cover').forEach(el => {
    el.addEventListener('click', () => { const g = GAMES.find(x => x.id === el.dataset.gameId); if (g) openModal(g); });
  });
}

function _applyLibMode() {
  const mode = _libMode();
  const view = document.getElementById('library-view');
  view.dataset.mode = mode;
  document.querySelectorAll('#lib-mode .seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
    b.setAttribute('aria-selected', String(b.dataset.mode === mode));
  });
  if (mode === 'covers' && !document.getElementById('lib-covers').childElementCount) renderCovers();
  const sub = document.getElementById('lib-sub');
  if (sub) {
    sub.textContent = `${GAMES.length} games · front and back`;
  }
  applyFilters();
}

document.getElementById('lib-mode').addEventListener('click', (e) => {
  const b = e.target.closest('.seg-btn');
  if (!b || b.dataset.mode === _libMode()) return;
  try { localStorage.setItem('bgl-libmode', b.dataset.mode); } catch (_) {}
  _applyLibMode();
  switchToLibrary();
});

document.getElementById('lib-filter-toggle').addEventListener('click', (e) => {
  const view = document.getElementById('library-view');
  const open = view.classList.toggle('filters-open');
  e.currentTarget.setAttribute('aria-expanded', String(open));
});

// ── Modal ──
const VP_LIBRARY = 'width=1200, user-scalable=yes, viewport-fit=cover';
const VP_LOCKED  = 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
const _isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// The Library shows either the shelf (cubbies of spines, as on the real
// bookcase) or a grid of covers. Phones default to covers — the shelf is
// unreadable at phone width; on touch screens it needs the zoomed-out 1200-px
// viewport. Bigger screens default to the shelf. A pick is remembered.
function _libMode() {
  let m = null;
  try { m = localStorage.getItem('bgl-libmode'); } catch (_) {}
  if (m === 'shelf' || m === 'covers') return m;
  return Math.min(screen.width, screen.height) < 700 ? 'covers' : 'shelf';
}
const _libZoomedShelf = () => _isTouchDevice() && _libMode() === 'shelf';
let _modalOpenedFromStats = false;
let _modalOpenedFromGames = false;
let _modalOpenedFromLeaderboard = false;
let _modalOpenedFromBoardSouth = false;
let _modalOpenedFromIlioupoli = false;
let _modalOpenedFromChallenges = false;
let _modalTab = 'overview';   // the game page's last-used tab, kept across games

function _setViewport(content) {
  const vp = document.querySelector('meta[name=viewport]');
  if (vp) vp.content = content;
}

function _scrollToShelfCenter() {
  const scrollX = Math.max(0, (document.documentElement.scrollWidth - window.innerWidth) / 2);
  window.scrollTo(scrollX, 0);
}

function _restoreAfterModal() {
  if (!_isTouchDevice()) return;
  if (_modalOpenedFromStats || _modalOpenedFromGames || _modalOpenedFromLeaderboard || _modalOpenedFromBoardSouth || _modalOpenedFromIlioupoli || _modalOpenedFromChallenges) {
    document.body.style.minWidth = 'auto';
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  } else if (_libZoomedShelf()) {
    document.body.style.minWidth = '';
    _setViewport(VP_LIBRARY);
    requestAnimationFrame(_scrollToShelfCenter);
  } else {
    document.body.style.minWidth = 'auto';
    _setViewport(VP_LOCKED);
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay.classList.contains('open')) {
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
    _restoreAfterModal();
    if (_modalOpenedFromStats) {
      const player = _viewingProfile || localStorage.getItem('bgl-player');
      _rlgResume = true; // keep the rating carousel on the card you were viewing
      if (player) showStatsView(player, _viewingProfile ? 'visiting' : undefined);
    } else if (_modalOpenedFromGames) {
      showGamesView();
    } else if (_modalOpenedFromLeaderboard) {
      showLeaderboardView();
    } else if (_modalOpenedFromBoardSouth) {
      showBoardSouthView();
    } else if (_modalOpenedFromIlioupoli) {
      showIlioupoliView();
    } else if (_modalOpenedFromChallenges) {
      const player = localStorage.getItem('bgl-player');
      if (player) showChallengesView(player);
    }
    if (history.state && history.state.bgl === 'modal') history.back();   // drop its back-button entry (nav.js)
  }
}
window.addEventListener('popstate', e => {
  const overlay = document.getElementById('modal-overlay');
  if (overlay.classList.contains('open')) {
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
    _restoreAfterModal();
    if (_modalOpenedFromStats) {
      const player = _viewingProfile || localStorage.getItem('bgl-player');
      _rlgResume = true; // keep the rating carousel on the card you were viewing
      if (player) showStatsView(player, _viewingProfile ? 'visiting' : undefined);
    } else if (_modalOpenedFromGames) {
      showGamesView();
    } else if (_modalOpenedFromLeaderboard) {
      showLeaderboardView();
    } else if (_modalOpenedFromBoardSouth) {
      showBoardSouthView();
    } else if (_modalOpenedFromIlioupoli) {
      showIlioupoliView();
    } else if (_modalOpenedFromChallenges) {
      const player = localStorage.getItem('bgl-player');
      if (player) showChallengesView(player);
    }
  }
});

function openModal(game) {
  _modalOpenedFromStats = document.getElementById('stats-view').classList.contains('open');
  _modalOpenedFromGames = document.getElementById('games-view').classList.contains('open');
  _modalOpenedFromLeaderboard = document.getElementById('leaderboard-view').classList.contains('open');
  _modalOpenedFromBoardSouth = document.getElementById('boardsouth-view').classList.contains('open');
  _modalOpenedFromIlioupoli = document.getElementById('ilioupoli-view').classList.contains('open');
  _modalOpenedFromChallenges = document.getElementById('challenges-view').classList.contains('open');
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');

  const c = game.spineColor || '#555';
  const fallbackBg = `linear-gradient(135deg, ${c}, ${adjustColor(c, -30)})`;
  if (!Array.isArray(game.categories)) game.categories = [];
  if (!Array.isArray(game.mechanics)) game.mechanics = [];
  if (game.description == null) game.description = '';
  if (game.players == null) game.players = '';
  if (game.playTime == null) game.playTime = '';

  // Build cover image section
  let coverHtml;
  if (game.bggId >= 0) {
    coverHtml = `
      <div class="modal-cover">
        <img class="modal-cover-img"
             src="images/${game.bggId}.jpg"
             alt="${game.name}"
             onerror="__imgFallback(this, ${game.bggId})">
        <div class="modal-cover-fallback" style="display:none;background:${fallbackBg}">${game.name}</div>
      </div>`;
  } else {
    coverHtml = `<div class="modal-cover"><div class="modal-cover-fallback" style="background:${fallbackBg}">${game.name}</div></div>`;
  }

  // Rating tiles: BGG, the group's average, and how often it's been played.
  const community = game.bggId > 0 ? getCommunityRating(game.bggId) : null;
  const bggVal = Number(game.bggRating) || 0;
  const ratingTiles = [
    bggVal ? `<div class="gm-tile"><div class="gm-tile-val" style="color:${ratingColor(bggVal)}">${bggVal.toFixed(1)}</div><div class="gm-tile-label">BGG rating</div></div>` : '',
    community ? `<div class="gm-tile"><div class="gm-tile-val" style="color:${ratingColor(community.avg)}">&#9733; ${community.avg}</div><div class="gm-tile-label">Group &middot; ${community.count}</div></div>` : '',
    `<div class="gm-tile"><div class="gm-tile-val">${(PLAY_HISTORY[game.bggId] || []).length}</div><div class="gm-tile-label">Plays</div></div>`,
    buildGameTimeTile(game.bggId),
  ].filter(Boolean);

  // Mechanics
  let mechanicsHtml = '';
  if (game.mechanics && game.mechanics.length) {
    mechanicsHtml = `<div class="modal-mechanics">${game.mechanics.map(m => `<span class="modal-mech">${m}</span>`).join('')}</div>`;
  }

  // Play History
  let playHistoryHtml = '';
  const plays = PLAY_HISTORY[game.bggId];
  const noResultGame = isNoResultGame(game.bggId);
  if (plays && plays.length > 0) {
    // Compute stats
    const totalPlays = plays.length;
    const userPlays = plays.filter(p => p.sc.some(s => _origCanon(s.n) === 'Στιβ'));
    const wins = plays.filter(p => p.sc.some(s => _origCanon(s.n) === 'Στιβ' && s.w));
    const winRate = userPlays.length > 0 ? Math.round((wins.length / userPlays.length) * 100) : 0;
    const lastPlayed = plays[0].date;

    // Format date helper
    const fmtDate = (d) => {
      const [y,m,day] = d.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[parseInt(m)-1]} ${parseInt(day)}, ${y}`;
    };

    // Show first 5 plays, rest behind "show more"
    const INITIAL = 5;
    const visiblePlays = plays.slice(0, INITIAL);
    const hiddenPlays = plays.slice(INITIAL);

    const renderPlay = (play) => {
      const hasWinner = play.sc.some(s => s.w);
      const scoreHtml = play.sc.map(_playScoreChipHtml).join('');
      const boardHtml = play.b ? `<div class="play-board">&#9876; ${play.b}</div>` : '';
      const noWinnerHtml = (!hasWinner && !noResultGame) ? '<div class="play-no-winner">&#9760;&#65038; The game won</div>' : '';
      const durHtml = playTimeBadge(play);
      const msHtml = milestoneBadges(_ptViewer(), play, true);
      return `<div class="play-entry">
        <div class="play-entry-top"><span class="play-date">${fmtDate(play.date)}</span>${msHtml ? `<span class="ms-badges">${msHtml}</span>` : ''}${durHtml}</div>
        <div class="play-scores">${scoreHtml}</div>
        ${boardHtml}${noWinnerHtml}
      </div>`;
    };

    // Campaign progress bar (e.g. Cozy Stickerville's 10 in-game years).
    const cp = campaignProgress(game.bggId, plays);
    const campaignHtml = cp ? `
        <div class="campaign-progress">
          <div class="cp-top">
            <span class="cp-title">Campaign Progress</span>
            <span class="cp-stage">${cp.stageText}</span>
          </div>
          <div class="cp-bar-wrap"><div class="cp-bar${cp.complete ? ' complete' : ''}" style="width:${cp.pct}%"></div></div>
          <div class="cp-foot">
            ${cp.reachedText ? `<span class="cp-reached${cp.complete ? ' done' : ''}">${cp.reachedText}</span>` : '<span></span>'}
            <span class="cp-pct">${cp.pct}% complete</span>
          </div>
        </div>` : '';

    // Sky Team airport checklist (no percentage — a landed-airports board).
    const skyTeamHtml = (Number(game.bggId) === SKY_TEAM_BGGID) ? buildSkyTeamHtml(plays) : '';

    // Slay the Spire ascension ladder + the Heart (custom, not a % bar).
    const slaySpireHtml = (Number(game.bggId) === SLAY_SPIRE_BGGID) ? buildSlaySpireHtml(plays) : '';

    const visibleHtml = visiblePlays.map(renderPlay).join('');
    const hiddenHtml = hiddenPlays.length > 0
      ? `<div class="play-history-hidden" style="display:none">${hiddenPlays.map(renderPlay).join('')}</div>
         <button class="play-show-more" onclick="const h=this.previousElementSibling;h.style.display=h.style.display==='none'?'block':'none';this.textContent=h.style.display==='none'?'Show all ${totalPlays} plays':'Show less'">Show all ${totalPlays} plays</button>`
      : '';

    playHistoryHtml = `
      <div class="play-history">
        <div class="play-history-header">
          <span class="play-history-title">Play History</span>
          <span class="play-history-count">${totalPlays} play${totalPlays !== 1 ? 's' : ''} recorded</span>
        </div>
        <div class="play-history-stats">
          <div class="ph-stat"><span class="ph-stat-val">${totalPlays}</span><span class="ph-stat-label">Plays</span></div>
          <div class="ph-stat"><span class="ph-stat-val">${noResultGame ? '&mdash;' : wins.length}</span><span class="ph-stat-label">Wins</span></div>
          <div class="ph-stat"><span class="ph-stat-val">${noResultGame ? '&mdash;' : winRate + '%'}</span><span class="ph-stat-label">Win Rate</span></div>
          <div class="ph-stat"><span class="ph-stat-val">${fmtDate(lastPlayed)}</span><span class="ph-stat-label">Last Played</span></div>
        </div>
        ${buildScoreTrendHtml(game, plays)}
        ${buildGameRecordsHtml(game, plays)}
        ${buildRolesHtml(game, plays)}
        ${buildGameTimeHtml(game, plays)}
        ${campaignHtml}
        ${skyTeamHtml}
        ${slaySpireHtml}
        ${visibleHtml}
        ${hiddenHtml}
      </div>`;
  }

  // Marvel United heroes/villains board — shown on the core game AND on every
  // expansion page in the line, so it lives outside the play-history block.
  const marvelUnitedHtml = buildMarvelUnitedHtml(game.bggId);
  const marvelChampionsHtml = buildMarvelChampionsHtml(game.bggId, plays);
  const eternalDecksHtml = (Number(game.bggId) === ED_BGGID) ? buildEternalDecksHtml(plays || []) : '';
  const aeonsEndHtml = buildAeonsEndHtml(game.bggId);

  const fact = (icon, text) => `<span class="gm-fact"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>${text}</span>`;
  const facts = [
    game.players ? fact('<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 11.5a3 3 0 1 0-1-5.8M17.5 20a5.5 5.5 0 0 0-2.3-4.5"/>', `${_escapeHtml(game.players)} players`) : '',
    game.playTime ? fact('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', _escapeHtml(game.playTime)) : '',
    game.complexity > 0 ? fact('<path d="M12 4v16M5 20h14M6 8h12M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z"/>', `Weight ${Number(game.complexity).toFixed(1)}`) : '',
  ].join('');
  const playsPanel = [marvelUnitedHtml, marvelChampionsHtml, eternalDecksHtml, aeonsEndHtml, playHistoryHtml].join('');
  const tabs = [['overview', 'Overview'], ['plays', `Plays${plays && plays.length ? ` <span class="gm-tab-n">${plays.length}</span>` : ''}`]]
    .concat(game.bggId > 0 ? [['notes', 'Notes']] : []);
  const tab = tabs.some(t => t[0] === _modalTab) ? _modalTab : 'overview';

  content.innerHTML = `
    ${coverHtml}
    <div class="modal-body">
      <div class="modal-header">
        <span class="modal-title">${_escapeHtml(game.name)}</span>
        ${game.year ? `<span class="modal-year">${game.year}</span>` : ''}
      </div>
      ${game.designer ? `<div class="modal-designer">by ${_escapeHtml(game.designer)}</div>` : ''}
      <div class="gm-facts">${facts}</div>
      <div class="gm-tiles n${ratingTiles.length}">${ratingTiles.join('')}</div>
      ${game.bggId > 0 ? buildStarRatingHtml(game.bggId) : ''}
      <div class="gm-tabs" role="tablist">
        ${tabs.map(([k, label]) => `<button type="button" role="tab" class="gm-tab${k === tab ? ' active' : ''}" aria-selected="${k === tab}" data-tab="${k}">${label}</button>`).join('')}
      </div>
      <div class="gm-panel" data-panel="overview"${tab === 'overview' ? '' : ' hidden'}>
        ${buildPlayerCountHtml(game, plays)}
        ${game.description ? `<div class="modal-desc">${game.description}</div>` : ''}
        ${game.categories.length ? `<div class="modal-categories">${game.categories.map(c => `<span class="modal-cat">${c}</span>`).join('')}</div>` : ''}
        ${mechanicsHtml}
        ${game.bggId > 0
          ? `<a class="modal-bgg-link" href="https://boardgamegeek.com/boardgame/${game.bggId}" target="_blank" rel="noopener">View on BoardGameGeek &#8599;</a>`
          : `<a class="modal-bgg-link" href="https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(game.name)}" target="_blank" rel="noopener">Search on BoardGameGeek &#8599;</a>`
        }
      </div>
      <div class="gm-panel" data-panel="plays"${tab === 'plays' ? '' : ' hidden'}>
        ${playsPanel || '<div class="gm-empty">No plays logged yet. They show up here after the next BGStats import.</div>'}
      </div>
      ${game.bggId > 0 ? `<div class="gm-panel" data-panel="notes"${tab === 'notes' ? '' : ' hidden'}>${buildNotesHtml(game.bggId)}</div>` : ''}
    </div>
  `;
  content.querySelector('.gm-tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.gm-tab');
    if (!t) return;
    _modalTab = t.dataset.tab;
    content.querySelectorAll('.gm-tab').forEach(x => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', String(x === t)); });
    content.querySelectorAll('.gm-panel').forEach(pn => { pn.hidden = pn.dataset.panel !== _modalTab; });
  });
  overlay.classList.add('open');
  document.body.classList.add('modal-open');
  content.scrollTop = 0;
  document.querySelector('.modal').scrollTop = 0;

  // On mobile: reset zoom and shrink body so modal fits device screen
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }

  // a back-button entry (nav.js): back closes the game page
  if (!(history.state && history.state.bgl === 'modal')) history.pushState(navEntry('modal'), '');
  wireStarRating();
  wireNotes();
  wireMarvelChampions();
  updateFavButton(game.bggId);
  wireFavButton();
}

function adjustColor(hex, amount) {
  let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  r = Math.max(0,Math.min(255,r+amount));
  g = Math.max(0,Math.min(255,g+amount));
  b = Math.max(0,Math.min(255,b+amount));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function ratingColor(rating) {
  // Smooth gradient: 0 → red, 5 → yellow, 10 → green (HSL hue 0→120)
  const r = Math.max(0, Math.min(10, Number(rating) || 0));
  const hue = r * 12;
  const sat = 72;
  const light = 48 + (r - 5) * 0.8; // subtle lightness bump at the top end
  return `hsl(${hue.toFixed(1)}, ${sat}%, ${light.toFixed(1)}%)`;
}

// Close modal
document.getElementById('modal-close').addEventListener('click', () => closeModal());
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    document.getElementById('picker-overlay').classList.remove('open');
  }
});

// ── Player System ──
const HIDDEN_PLAYERS = new Set([
  'Anastasia Deel', 'Anonymous player', 'Δεσποινα', "Gadi's wife",
  'Game 🤖', 'Game2 🤖', 'Γιωργος Ιος - BS', 'Γιαννης Γιαουριδακης',
  'Giorgos - filos Dimitri', 'Kike', 'Κωστας Κορνηλιας',
  'Mike - Barcelona', 'Oscar - Barcelona', 'Πανος Μαντσου',
  'Raul - Barcelona ', 'Σακης - φιλος Μαντσου', 'Sharif'
]);

function getAllPlayers() {
  const playerMap = {};
  for (const bggId in PLAY_HISTORY) {
    for (const play of PLAY_HISTORY[bggId]) {
      for (const s of play.sc) {
        if (!playerMap[s.n]) playerMap[s.n] = { plays: 0, wins: 0, games: new Set() };
        playerMap[s.n].plays++;
        if (s.w) playerMap[s.n].wins++;
        playerMap[s.n].games.add(Number(bggId));
      }
    }
  }
  return Object.entries(playerMap)
    .filter(([name]) => !HIDDEN_PLAYERS.has(name))
    .map(([name, d]) => ({ name, plays: d.plays, wins: d.wins, games: d.games.size }))
    .sort((a, b) => b.plays - a.plays);
}

function renderPickerList(filter) {
  const list = document.getElementById('picker-list');
  const players = getAllPlayers().filter(p => p.plays >= 2);
  const q = (filter || '').toLowerCase();
  const filtered = q ? players.filter(p => p.name.toLowerCase().includes(q)) : players;

  list.innerHTML = filtered.map(p => {
    const wr = p.plays > 0 ? Math.round(p.wins / p.plays * 100) : 0;
    return `<div class="picker-player" data-name="${_escapeHtml(p.name)}">
      <span class="picker-avatar" aria-hidden="true">${avatarInner(p.name)}</span>
      <span class="picker-player-name">${_escapeHtml(p.name)}</span>
      <span class="picker-player-meta">${p.plays} plays &middot; ${wr}% wins</span>
    </div>`;
  }).join('');

  list.querySelectorAll('.picker-player').forEach(el => {
    el.addEventListener('click', () => {
      selectPlayer(el.dataset.name);
    });
  });
}

function selectPlayer(name) {
  localStorage.setItem('bgl-player', name);
  document.getElementById('picker-overlay').classList.remove('open');
  if (typeof _updateBoardSouthBtnVisibility === 'function') _updateBoardSouthBtnVisibility();
  showStatsView(name);
}

function openPicker() {
  if (_isTouchDevice()) _setViewport(VP_LOCKED);
  document.getElementById('picker-search').value = '';
  renderPickerList('');
  document.getElementById('picker-overlay').classList.add('open');
  setTimeout(() => document.getElementById('picker-search').focus(), 100);
}

document.getElementById('picker-search').addEventListener('input', e => {
  renderPickerList(e.target.value);
});

document.getElementById('picker-skip').addEventListener('click', () => {
  document.getElementById('picker-overlay').classList.remove('open');
  switchToLibrary();
});

document.getElementById('picker-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('open');
    if (_libZoomedShelf() && document.getElementById('library-view').style.display !== 'none') {
      document.body.style.minWidth = '';
      _setViewport(VP_LIBRARY);
    }
  }
});

// ── View switching ──
function _deactivateAllTabs() {
  document.getElementById('library-view').style.display = 'none';
  document.getElementById('stats-view').classList.remove('open');
  document.getElementById('games-view').classList.remove('open');
  document.getElementById('leaderboard-view').classList.remove('open');
  document.getElementById('achievements-view').classList.remove('open');
  document.getElementById('challenges-view').classList.remove('open');
  document.getElementById('boardsouth-view').classList.remove('open');
  document.getElementById('ilioupoli-view').classList.remove('open');
  document.getElementById('btn-library').classList.remove('active');
  document.getElementById('btn-mystats').classList.remove('active');
  document.getElementById('btn-games').classList.remove('active');
  document.getElementById('btn-leaderboard').classList.remove('active');
  document.getElementById('btn-achievements').classList.remove('active');
  document.getElementById('btn-challenges').classList.remove('active');
  document.getElementById('btn-boardsouth').classList.remove('active');
  document.getElementById('btn-ilioupoli').classList.remove('active');
}

function switchToLibrary() {
  _deactivateAllTabs();
  document.getElementById('library-view').style.display = '';
  document.getElementById('btn-library').classList.add('active');
  if (_libZoomedShelf()) {
    document.body.style.minWidth = '';
    document.body.classList.add('mobile-library');
    _setViewport(VP_LIBRARY);
    requestAnimationFrame(_scrollToShelfCenter);
  } else if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
}

function switchToStats() {
  const player = localStorage.getItem('bgl-player');
  if (!player) { openPicker(); return; }
  _deactivateAllTabs();
  document.getElementById('stats-view').classList.add('open');
  document.getElementById('btn-mystats').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
  showStatsView(player);
}

function switchToGames() {
  _deactivateAllTabs();
  document.getElementById('games-view').classList.add('open');
  document.getElementById('btn-games').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
  showGamesView();
  // Ratings are fetched once at startup, but the page often stays open for
  // days — ratings made on other devices would never appear. Refresh in the
  // background and re-render if anything changed (skip while mid-search so
  // we don't wipe the user's query).
  refreshRatings().then(changed => {
    const view = document.getElementById('games-view');
    const search = document.getElementById('games-search');
    if (changed && view && view.classList.contains('open') && (!search || !search.value)) {
      showGamesView();
    }
  });
}

function switchToLeaderboard() {
  _deactivateAllTabs();
  document.getElementById('leaderboard-view').classList.add('open');
  document.getElementById('btn-leaderboard').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
  showLeaderboardView();
}

function switchToAchievements() {
  const player = localStorage.getItem('bgl-player');
  if (!player) { openPicker(); return; }
  _deactivateAllTabs();
  document.getElementById('achievements-view').classList.add('open');
  document.getElementById('btn-achievements').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
  showAchievementsView(player);
}

function switchToChallenges() {
  const player = localStorage.getItem('bgl-player');
  if (!player) { openPicker(); return; }
  _deactivateAllTabs();
  document.getElementById('challenges-view').classList.add('open');
  document.getElementById('btn-challenges').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
  showChallengesView(player);
}

function switchToBoardSouth() {
  _deactivateAllTabs();
  document.getElementById('boardsouth-view').classList.add('open');
  document.getElementById('btn-boardsouth').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
  showBoardSouthView();
}

function switchToIlioupoli() {
  _deactivateAllTabs();
  document.getElementById('ilioupoli-view').classList.add('open');
  document.getElementById('btn-ilioupoli').classList.add('active');
  if (_isTouchDevice()) {
    document.body.style.minWidth = 'auto';
    document.body.classList.remove('mobile-library');
    _setViewport(VP_LOCKED);
    window.scrollTo(0, 0);
  }
  showIlioupoliView();
}

function _updateBoardSouthBtnVisibility() {
  const btn = document.getElementById('btn-boardsouth');
  if (btn) {
    const active = (typeof _activeBoardSouthVoter === 'function') ? _activeBoardSouthVoter() : null;
    btn.style.display = active ? '' : 'none';
  }
  // The "Ilioupoli Bros" tab is private to Στιβ and Δημητρης.
  const ilioBtn = document.getElementById('btn-ilioupoli');
  if (ilioBtn) {
    const raw = localStorage.getItem('bgl-player');
    const name = raw ? (NAME_MAP[raw] || raw) : null;
    ilioBtn.style.display = (name && ILIOUPOLI_MEMBERS.has(name)) ? '' : 'none';
  }
}

document.getElementById('btn-library').addEventListener('click', switchToLibrary);
document.getElementById('btn-games').addEventListener('click', switchToGames);
document.getElementById('btn-leaderboard').addEventListener('click', switchToLeaderboard);
document.getElementById('btn-mystats').addEventListener('click', switchToStats);
document.getElementById('btn-achievements').addEventListener('click', switchToAchievements);
document.getElementById('btn-challenges').addEventListener('click', switchToChallenges);
document.getElementById('btn-boardsouth').addEventListener('click', switchToBoardSouth);
document.getElementById('btn-ilioupoli').addEventListener('click', switchToIlioupoli);

// ── Achievements ──
