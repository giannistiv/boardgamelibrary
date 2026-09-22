let favoritesCache = {};
let favoritesCacheReady = false;

function _loadFavoritesFromLocal() {
  try {
    const raw = localStorage.getItem('bgl-favorites');
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function _saveFavoritesToLocal() {
  try { localStorage.setItem('bgl-favorites', JSON.stringify(favoritesCache)); } catch (e) {}
}

async function loadAllFavorites() {
  const local = _loadFavoritesFromLocal();
  favoritesCache = local;
  favoritesCacheReady = true;
  if (!FIREBASE_DB) return;
  try {
    const res = await fetch(`${FIREBASE_DB}/favorites.json`);
    const data = await res.json();
    if (data) {
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          favoritesCache[key] = data[key];
        }
      }
      _saveFavoritesToLocal();
    } else {
      const localKeys = Object.keys(local).filter(k => Array.isArray(local[k]) && local[k].length > 0);
      if (localKeys.length > 0) {
        await fetch(`${FIREBASE_DB}/favorites.json`, {
          method: 'PUT',
          body: JSON.stringify(local)
        });
      }
    }
  } catch (e) {
    console.warn('Failed to load favorites from Firebase:', e);
  }
}

function getPlayerFavorites(playerName) {
  let f = favoritesCache[playerName];
  // Defensive: if a rename left nothing under the display name, fall back to
  // the original canonical name's favorites.
  if ((!Array.isArray(f) || !f.length) && typeof _origCanon === 'function') {
    const c = _origCanon(playerName);
    if (c !== playerName && Array.isArray(favoritesCache[c]) && favoritesCache[c].length) {
      f = favoritesCache[c];
    }
  }
  return Array.isArray(f) ? f : [];
}

async function saveFavorites(playerName, bggIds) {
  favoritesCache[playerName] = bggIds;
  _saveFavoritesToLocal();
  if (!FIREBASE_DB) return;
  try {
    // Persist under the original canonical name so favorites stay keyed
    // consistently across a rename (everyone else's data is keyed that way).
    await fetch(`${FIREBASE_DB}/favorites/${encodeURIComponent(_origCanon(playerName))}.json`, {
      method: 'PUT',
      body: JSON.stringify(bggIds)
    });
  } catch (e) {
    console.warn('Failed to save favorites to Firebase:', e);
  }
}

async function toggleFavorite(playerName, bggId) {
  const favs = getPlayerFavorites(playerName).slice();
  const idx = favs.indexOf(bggId);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    if (favs.length >= 4) return false;
    favs.push(bggId);
  }
  await saveFavorites(playerName, favs);
  return true;
}

function isFavorited(playerName, bggId) {
  return getPlayerFavorites(playerName).includes(bggId);
}

function updateFavButton(bggId) {
  const btn = document.getElementById('modal-fav');
  if (!btn) return;
  const player = localStorage.getItem('bgl-player');
  if (!player || bggId <= 0) {
    btn.style.display = 'none';
    return;
  }
  btn.style.display = 'flex';
  const faved = isFavorited(player, bggId);
  const favs = getPlayerFavorites(player);
  const full = favs.length >= 4 && !faved;
  btn.classList.toggle('favorited', faved);
  btn.classList.toggle('full', full);
  btn.title = faved ? 'Remove from favorites' : (full ? 'Favorites full (4/4)' : 'Add to favorites');
  btn.dataset.bggId = bggId;
}

function wireFavButton() {
  const btn = document.getElementById('modal-fav');
  if (btn._wired) return;
  btn._wired = true;
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const player = localStorage.getItem('bgl-player');
    const bggId = Number(btn.dataset.bggId);
    if (!player || !bggId) return;
    if (btn.classList.contains('full') && !btn.classList.contains('favorited')) return;

    // Optimistic update: flip the in-memory state + UI *before* awaiting
    // the Firebase round-trip, so the star colour changes the moment the
    // user taps it. Roll back if the network write fails.
    const favsBefore = getPlayerFavorites(player).slice();
    const idx = favsBefore.indexOf(bggId);
    const next = favsBefore.slice();
    if (idx >= 0) next.splice(idx, 1);
    else if (next.length < 4) next.push(bggId);
    else return;
    favoritesCache[player] = next;
    updateFavButton(bggId);
    // Drop focus / sticky :hover on touch so the colour swap is visible
    // even on iOS where the hover state lingers until the next touch.
    try { btn.blur(); } catch (_) {}

    try {
      await saveFavorites(player, next);
    } catch (err) {
      console.warn('Favorite toggle failed, rolling back:', err);
      favoritesCache[player] = favsBefore;
      updateFavButton(bggId);
    }
  });
}

// When a local images/<bggId>.jpg is missing, fall back to the remote
// urlImage stored on the game. urlImage is populated from BGStats imports
// (the .bgsplay file carries CDN URLs for every game) and persisted to
// Firebase under /gameImages/{bggId} so the cover sticks across reloads
// for hardcoded games too. BGG's xmlapi2 is no longer usable from the
// browser (Bearer auth required), so there is no online lookup fallback.
function _hideImgWithFallback(img){
  img.style.display = 'none';
  if (img.nextElementSibling && img.nextElementSibling.classList.contains('modal-cover-fallback')) {
    img.nextElementSibling.style.display = 'flex';
  }
}
// Image fallback specific to the favorite-picker rows: local → urlImage →
// generic dice placeholder so unowned/uncovered games still render cleanly.
window.__favPickerImgFallback = function(img, urlImage) {
  if (!img.dataset.fbStep) {
    img.dataset.fbStep = '1';
    if (urlImage) { img.src = urlImage; return; }
  }
  if (img.dataset.fbStep !== '2') {
    img.dataset.fbStep = '2';
    img.src = 'images/game-placeholder.svg';
    return;
  }
  img.style.visibility = 'hidden';
};

window.__imgFallback = function(img, bggId){
  // Resolution chain: local file → stored BGG urlImage → final fallback.
  if (!img.dataset.fb) {
    img.dataset.fb = '1';
    const game = findGameByBggId(bggId);
    if (game && game.urlImage) { img.src = game.urlImage; return; }
  }
  // Final fallback. Two contexts keep their nicer specialised fallback: the
  // game modal (a colored box with the game's name) and Category Bingo cells
  // (the name shown inside the square). Everywhere else, show the default
  // dice placeholder instead of leaving a blank gap.
  const sib = img.nextElementSibling;
  const hasModalBox = sib && sib.classList && sib.classList.contains('modal-cover-fallback');
  const hasBingoName = img.parentElement && img.parentElement.querySelector('.ch-bingo-name');
  if (hasModalBox || hasBingoName) {
    _hideImgWithFallback(img);
  } else if (!img.dataset.ph) {
    img.dataset.ph = '1';
    img.style.display = '';
    img.src = 'images/game-placeholder.svg';
  }
};

// ── Game image overrides (Firebase-backed) ──
// Lets us capture urlImage from BGStats imports for hardcoded games whose
// GAMES entry doesn't have one baked in.
async function loadGameImages() {
  if (!FIREBASE_DB) return;
  try {
    const res = await fetch(`${FIREBASE_DB}/gameImages.json`);
    const data = await res.json();
    if (!data) return;
    for (const bggId in data) {
      const url = data[bggId] && data[bggId].url;
      if (!url) continue;
      const g = findGameByBggId(bggId);
      if (g && !g.urlImage) g.urlImage = url;
    }
  } catch (e) {
    console.warn('Failed to load game images from Firebase:', e);
  }
}
async function persistGameImage(bggId, url) {
  if (!FIREBASE_DB || !url) return;
  try {
    await fetch(`${FIREBASE_DB}/gameImages/${encodeURIComponent(bggId)}.json`, {
      method: 'PUT',
      body: JSON.stringify({ url })
    });
  } catch (e) {
    console.warn('Failed to save game image to Firebase:', e);
  }
}

function findGameByBggId(bggId) {
  const num = Number(bggId);
  // Resolution order: the hand-curated shelf and BGStats imports first
  // (richest metadata), then the per-person CSV catalogues so favorites /
  // votes / modals can resolve any owned game even if it's only known from
  // a collection import. Returns the first catalogue that has it.
  return GAMES.find(g => g.bggId === num)
    || EXTRA_GAMES[bggId]
    || (typeof GIANNIS_GAMES !== 'undefined' && GIANNIS_GAMES[num])
    || (typeof LGEORGE_GAMES !== 'undefined' && LGEORGE_GAMES[num])
    || (typeof DIMITRIS_GAMES !== 'undefined' && DIMITRIS_GAMES[num])
    || null;
}

// ── Board South "what to play next" voting (Firebase-backed) ──
// Each BS regular submits an ordered list of bggIds (highest priority first)
// per *library*. Two libraries are voted on independently:
//   - 'stiv'    → games from Στιβ's collection (GAMES + EXTRA_GAMES).
//                 Persisted at /boardSouthVotes/{encName} (legacy path).
//   - 'giannis' → games from Γιαννης Φωτοπουλος's collection (GIANNIS_GAMES).
//                 Persisted at /boardSouthVotesGiannis/{encName}.
const BSV_LIBRARIES = ['stiv', 'giannis', 'lgeorge'];
const BSV_LIB_LABEL = {
  stiv:    "Στιβ's library",
  giannis: "Φωτοπουλος library",
  lgeorge: "LGeorge library",
};
const BSV_LIB_PATH = {
  stiv:    'boardSouthVotes',
  giannis: 'boardSouthVotesGiannis',
  lgeorge: 'boardSouthVotesLGeorge',
};
// Each library has a single canonical owner — that player can prune games
// from the group ranking that they no longer own / aren't available.
const BSV_LIB_OWNER = {
  stiv:    'Στιβ',
  giannis: 'Γιαννης Φωτοπουλος',
  lgeorge: 'LGeorge',
};

let boardSouthVotes = { stiv: {}, giannis: {}, lgeorge: {} };
let _bsvLibrary = 'stiv'; // currently-selected library in the vote view

function _bsVoteEncodeName(name) {
  // Firebase keys can't contain . $ # [ ] / — replace each with _
  return encodeURIComponent(name).replace(/\./g, '%2E');
}

function _bsvGetVotes(library) {
  if (!boardSouthVotes[library]) boardSouthVotes[library] = {};
  return boardSouthVotes[library];
}

async function loadBoardSouthVotes() {
  // Init a namespace for every registered library — adding a new library
  // to BSV_LIBRARIES (e.g. 'lgeorge') used to require a parallel hand-edit
  // here; without it, boardSouthVotes[lib] was undefined and the load
  // silently failed with a TypeError caught by the try/catch below, leading
  // to votes appearing "lost" on every page reload.
  boardSouthVotes = {};
  for (const lib of BSV_LIBRARIES) boardSouthVotes[lib] = {};
  if (!FIREBASE_DB) return;
  await Promise.all(BSV_LIBRARIES.map(async (lib) => {
    try {
      const res = await fetch(`${FIREBASE_DB}/${BSV_LIB_PATH[lib]}.json`);
      const data = await res.json();
      if (!data) return;
      // Defensive: make sure the bucket still exists before writing into it.
      if (!boardSouthVotes[lib]) boardSouthVotes[lib] = {};
      for (const encName in data) {
        const decoded = decodeURIComponent(encName);
        const list = data[encName];
        if (Array.isArray(list)) {
          boardSouthVotes[lib][decoded] = list.map(Number).filter(n => Number.isFinite(n));
        } else if (list && typeof list === 'object') {
          const ordered = Object.keys(list).sort((a, b) => Number(a) - Number(b)).map(k => Number(list[k]));
          boardSouthVotes[lib][decoded] = ordered.filter(n => Number.isFinite(n));
        }
      }
    } catch (e) {
      console.warn(`Failed to load Board South votes (${lib}) from Firebase:`, e);
    }
  }));
}

async function persistBoardSouthVote(voterName, bggIds, library) {
  if (!voterName) return;
  const lib = library || _bsvLibrary;
  const clean = (bggIds || []).map(Number).filter(n => Number.isFinite(n));
  _bsvGetVotes(lib)[voterName] = clean;
  if (!FIREBASE_DB) return;
  try {
    await fetch(`${FIREBASE_DB}/${BSV_LIB_PATH[lib]}/${_bsVoteEncodeName(voterName)}.json`, {
      method: 'PUT',
      body: JSON.stringify(clean),
    });
  } catch (e) {
    console.warn(`Failed to save Board South vote (${lib}) to Firebase:`, e);
  }
}

// Find a game by bggId in the selected library. Falls back through:
//   1. The library's own catalogue (GIANNIS_GAMES for 'giannis', GAMES/EXTRA_GAMES for 'stiv')
//   2. findGameByBggId(bggId) so we still pick up urlImage from any BGStats import
function _bsvFindGame(library, bggId) {
  const id = Number(bggId);
  // Pick the per-library catalogue (Γιαννης or LGeorge), then overlay any
  // imported metadata (urlImage etc.) from EXTRA_GAMES so newly imported
  // BGStats covers show up automatically.
  let base = null;
  if (library === 'giannis')      base = (typeof GIANNIS_GAMES !== 'undefined') ? GIANNIS_GAMES[id] : null;
  else if (library === 'lgeorge') base = (typeof LGEORGE_GAMES !== 'undefined') ? LGEORGE_GAMES[id] : null;
  if (base) {
    const imported = (typeof EXTRA_GAMES !== 'undefined') ? EXTRA_GAMES[id] : null;
    if (imported) return { ...base, urlImage: imported.urlImage || base.urlImage };
    return base;
  }
  return findGameByBggId(id);
}

function _bsvLibraryCatalogue(library) {
  if (library === 'giannis') return (typeof GIANNIS_GAMES !== 'undefined') ? Object.values(GIANNIS_GAMES) : [];
  if (library === 'lgeorge') return (typeof LGEORGE_GAMES !== 'undefined') ? Object.values(LGEORGE_GAMES) : [];
  return (typeof GAMES !== 'undefined') ? GAMES : [];
}

// Returns the canonical name of the currently-logged-in Board South voter,
// or null if the active player isn't allowed to vote.
function _activeBoardSouthVoter() {
  const raw = localStorage.getItem('bgl-player');
  if (!raw) return null;
  const name = NAME_MAP[raw] || raw;
  if (BOARD_SOUTH_REGULARS.has(name)) return name;
  if (typeof name === 'string' && name.includes(' - BS')) return name;
  return null;
}

// Returns the set of all canonical voter names ever seen — both the
// BOARD_SOUTH_REGULARS allowlist and anyone tagged " - BS" from PLAY_HISTORY.
function _allBoardSouthVoterNames() {
  const set = new Set(BOARD_SOUTH_REGULARS);
  for (const bggId in PLAY_HISTORY) {
    for (const play of PLAY_HISTORY[bggId]) {
      if (!play || !Array.isArray(play.sc)) continue;
      for (const s of play.sc) {
        if (s && typeof s.n === 'string' && s.n.includes(' - BS')) {
          set.add(NAME_MAP[s.n] || s.n);
        }
      }
    }
  }
  return set;
}

// Build the aggregate ranking of voted-on games.
// Each voter contributes 1 vote per listed game. Among games with the same
// vote count, sort by the sum of inverse rank (1/position) so games people
// place near the top of their list win ties.
// Average rating given by *app users* to a game (0 when nobody rated it).
// Distinct from the static BGG rating carried on the game object.
function _avgAppRating(bggId) {
  const r = (typeof ratingsCache !== 'undefined') ? ratingsCache[bggId] : null;
  if (!r) return 0;
  let sum = 0, n = 0;
  for (const p in r) {
    const val = _ratingValue(r[p]);
    if (typeof val === 'number' && val > 0) { sum += val; n++; }
  }
  return n ? sum / n : 0;
}

function _computeBoardSouthVoteRanking(library) {
  const lib = library || _bsvLibrary;
  const owner = BSV_LIB_OWNER[lib];
  const votes = _bsvGetVotes(lib);
  const tally = {}; // bggId → { votes, score, voters: [{name, position}] }
  for (const voter in votes) {
    const list = votes[voter];
    if (!Array.isArray(list)) continue;
    list.forEach((bggId, idx) => {
      if (!Number.isFinite(bggId)) return;
      if (!tally[bggId]) tally[bggId] = { bggId, votes: 0, score: 0, voters: [] };
      tally[bggId].votes++;
      // score = Σ(1/position): a #2 placement weighs more than a #3, so it
      // breaks ties in favour of games people ranked higher in their lists.
      tally[bggId].score += 1 / (idx + 1);
      tally[bggId].voters.push({ name: voter, position: idx + 1 });
    });
  }
  // Sort, once vote counts are equal:
  //   1. priority score Σ(1/position) — this groups games by how high
  //      they sit in voters' lists. Two games each placed #4 by their
  //      voter both score 0.25, tie here, and so land next to each other.
  //   2. within the same position, the descriptive tie-break rules:
  //        a. games the library owner voted for come first
  //        b. highest average rating from this app's users
  //        c. highest BGG rating
  //   3. name, as the final stable order.
  return Object.values(tally).sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;

    // Position grouping — higher score (better placements) ranks first.
    if (b.score !== a.score) return b.score - a.score;

    // Same position → owner, then ratings.
    const aOwner = owner && a.voters.some(v => v.name === owner) ? 1 : 0;
    const bOwner = owner && b.voters.some(v => v.name === owner) ? 1 : 0;
    if (bOwner !== aOwner) return bOwner - aOwner;

    const aApp = _avgAppRating(a.bggId), bApp = _avgAppRating(b.bggId);
    if (bApp !== aApp) return bApp - aApp;

    const ga = _bsvFindGame(lib, a.bggId);
    const gb = _bsvFindGame(lib, b.bggId);
    const aBgg = Number(ga && ga.bggRating) || 0;
    const bBgg = Number(gb && gb.bggRating) || 0;
    if (bBgg !== aBgg) return bBgg - aBgg;

    return (ga ? ga.name : '').localeCompare(gb ? gb.name : '');
  });
}

function buildFavoritesHtml(playerName, isOwnProfile) {
  const favs = getPlayerFavorites(playerName);
  if (favs.length === 0 && !isOwnProfile) return '';

  let cards = '';
  for (let i = 0; i < 4; i++) {
    if (i < favs.length) {
      const game = findGameByBggId(favs[i]);
      const name = game ? game.name : 'Game #' + favs[i];
      const imgSrc = `images/${favs[i]}.jpg`;
      const removeBtn = isOwnProfile ? `<button class="fav-remove" data-fav-idx="${i}" title="Remove">&times;</button>` : '';
      cards += `<div class="fav-card" data-fav-bgg="${favs[i]}">
        ${removeBtn}
        <img src="${imgSrc}" alt="${name}" onerror="__imgFallback(this, ${favs[i]})">
        <div class="fav-card-name">${name}</div>
      </div>`;
    } else {
      cards += `<div class="fav-card fav-card-empty"><span>&#9733;</span></div>`;
    }
  }

  return `<div class="favorites-section">
    <div class="stats-section-title">Favorite Games</div>
    <div class="favorites-grid">${cards}</div>
  </div>`;
}

function wireFavoritesGrid(container, playerName, isOwnProfile) {
  container.querySelectorAll('.fav-card[data-fav-bgg]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.fav-remove')) return;
      const game = findGameByBggId(el.dataset.favBgg);
      if (game) openModal(game);
    });
  });
  container.querySelectorAll('.fav-remove').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.favIdx);
      const favs = getPlayerFavorites(playerName).slice();
      favs.splice(idx, 1);
      await saveFavorites(playerName, favs);
      showStatsView(playerName);
    });
  });
  if (isOwnProfile) {
    container.querySelectorAll('.fav-card-empty').forEach(el => {
      el.addEventListener('click', () => openFavPicker(playerName));
    });
  }
}

function openFavPicker(playerName) {
  const existing = document.getElementById('fav-picker-overlay');
  if (existing) existing.remove();

  const currentFavs = getPlayerFavorites(playerName);

  // Build a comprehensive game list across EVERY known catalogue so favorites
  // aren't restricted to my own shelf. Sources, in priority order (later
  // entries overwrite earlier ones, picking up newer urlImage/name data):
  //   1. GAMES (Στιβ's hardcoded shelf)
  //   2. EXTRA_GAMES (BGStats-imported games)
  //   3. GIANNIS_GAMES (Φωτοπουλος's catalogue)
  //   4. LGEORGE_GAMES (LGeorge's catalogue)
  //   5. Any bggId that has play history but no metadata anywhere.
  // bggId === 0 is allowed through (the "Η γεωγραφία ειναι πολυ κουλ" game).
  const byId = new Map();
  const add = (g) => {
    if (!g || g.bggId == null) return;
    const existing = byId.get(g.bggId);
    const merged = {
      bggId: g.bggId,
      name: g.name || (existing && existing.name) || `Game #${g.bggId}`,
      urlImage: g.urlImage || (existing && existing.urlImage) || '',
    };
    byId.set(g.bggId, merged);
  };
  if (typeof GAMES !== 'undefined') GAMES.forEach(add);
  if (typeof EXTRA_GAMES !== 'undefined') Object.values(EXTRA_GAMES).forEach(add);
  if (typeof GIANNIS_GAMES !== 'undefined') Object.values(GIANNIS_GAMES).forEach(add);
  if (typeof LGEORGE_GAMES !== 'undefined') Object.values(LGEORGE_GAMES).forEach(add);
  for (const bggIdStr in PLAY_HISTORY) {
    const id = Number(bggIdStr);
    if (!byId.has(id)) byId.set(id, { bggId: id, name: `Game #${id}`, urlImage: '' });
  }
  const allGames = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));

  const overlay = document.createElement('div');
  overlay.id = 'fav-picker-overlay';
  overlay.className = 'fav-picker-overlay';
  overlay.innerHTML = `
    <div class="fav-picker-panel">
      <div class="fav-picker-head">
        <div class="fav-picker-title">Add a Favorite</div>
        <button class="fav-picker-close" aria-label="Close">&times;</button>
      </div>
      <input type="text" class="fav-picker-search" id="fav-picker-search" placeholder="Search games..." autocomplete="off">
      <div class="fav-picker-list" id="fav-picker-list"></div>
    </div>`;
  document.body.appendChild(overlay);

  const listEl = overlay.querySelector('#fav-picker-list');
  const searchEl = overlay.querySelector('#fav-picker-search');

  const render = (q) => {
    const term = (q || '').trim().toLowerCase();
    const matches = allGames
      .filter(g => !term || g.name.toLowerCase().includes(term))
      .slice(0, 500);
    listEl.innerHTML = matches.map(g => {
      const already = currentFavs.includes(g.bggId);
      const imgSrc = `images/${g.bggId}.jpg`;
      // Local file → urlImage → generic placeholder. Same chain the BS
      // vote view uses so the picker is never visually empty.
      const urlAttr = (g.urlImage || '').replace(/'/g, "\\'");
      return `<div class="fav-picker-row${already ? ' already' : ''}" data-bgg="${g.bggId}">
        <img class="fav-picker-img" src="${imgSrc}" alt=""
             onerror="window.__favPickerImgFallback(this, '${urlAttr}')">
        <div class="fav-picker-name">${g.name}${already ? ' <span class="fav-picker-tag">already a favorite</span>' : ''}</div>
      </div>`;
    }).join('') || '<div class="fav-picker-empty">No games match.</div>';
    listEl.querySelectorAll('.fav-picker-row').forEach(row => {
      row.addEventListener('click', async () => {
        if (row.classList.contains('already')) { close(); return; }
        const bggId = Number(row.dataset.bgg);
        const favs = getPlayerFavorites(playerName).slice();
        if (favs.length >= 4) return;
        favs.push(bggId);
        await saveFavorites(playerName, favs);
        close();
        showStatsView(playerName, _viewingProfile ? 'visiting' : undefined);
      });
    });
  };

  const close = () => overlay.remove();
  overlay.querySelector('.fav-picker-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  searchEl.addEventListener('input', () => render(searchEl.value));
  render('');
  setTimeout(() => searchEl.focus(), 50);
}

// ── Init ──
renderFilters();
renderShelf();

// On touch devices, set library viewport so full shelf fits on screen
if (_isTouchDevice()) {
  document.body.classList.add('mobile-library');
  _setViewport(VP_LIBRARY);
  requestAnimationFrame(_scrollToShelfCenter);
}

