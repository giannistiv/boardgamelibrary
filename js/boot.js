// Migrate old Latin player name in localStorage
const _sp = localStorage.getItem('bgl-player');
if (_sp && NAME_MAP[_sp]) localStorage.setItem('bgl-player', NAME_MAP[_sp]);

// Hard guard: if anything bypasses the CSS lock (legacy browser, rogue
// element extending past viewport, browser quirk, etc.), snap the page
// back to scrollX = 0 immediately. The library shelf doesn't use
// document-level horizontal scroll at all — it pans the visual viewport
// on touch and scrolls inside .shelf-wrapper on desktop — so this is
// safe to apply unconditionally.
(function _lockHorizontalScroll() {
  const snap = () => {
    if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
  };
  window.addEventListener('scroll', snap, { passive: true });
  // Also snap on resize, since resizing can momentarily shift scroll position.
  window.addEventListener('resize', snap, { passive: true });
})();

// Load ratings and favorites from Firebase, then show the right view
// ── User profiles (Firebase-backed display-name overrides) ──
// A logged-in player can rename how they appear everywhere. Stored at
// profiles/{originalCanonicalName} = { name, updatedAt } — a `photo` field is
// reserved here for a future per-profile picture. The rename is applied at
// startup the same way NAME_MAP is: it folds into NAME_MAP, rewrites play
// names and remaps the Firebase caches, so the new name shows up on every
// device. Inert (no behaviour change) until at least one profile is renamed.
let PROFILE_OVERRIDES = {};   // originalCanonicalName → chosen display name
let PROFILE_DATA = {};        // originalCanonicalName → { name, photo, … }
let DISPLAY_TO_CANON = {};    // display name → originalCanonicalName (for re-renames)
// Profiles live at the clean /profiles node once a Firebase rule permits it.
// Until then we fall back to a namespaced child of the already-writable
// gameImages node (loadGameImages ignores it — no .url). Reads merge both
// (primary wins); writes try /profiles first, then the fallback. This makes
// the migration seamless: add the /profiles rule and it upgrades on its own.
const PROFILE_STORE_PRIMARY = 'profiles';
const PROFILE_STORE_FALLBACK = 'gameImages/_bglProfiles';

async function _fetchProfileStore(path) {
  try {
    const res = await fetch(`${FIREBASE_DB}/${path}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data && typeof data === 'object') ? data : null;
  } catch (e) { return null; }
}

async function loadProfiles() {
  if (!FIREBASE_DB) return;
  const fallback = await _fetchProfileStore(PROFILE_STORE_FALLBACK);
  const primary = await _fetchProfileStore(PROFILE_STORE_PRIMARY);
  const data = Object.assign({}, fallback || {}, primary || {}); // primary wins
  for (const enc in data) {
    const entry = data[enc];
    if (!entry || typeof entry !== 'object') continue;
    const canon = decodeURIComponent(enc);
    PROFILE_DATA[canon] = entry;
    if (entry.name && typeof entry.name === 'string' && entry.name !== canon) {
      PROFILE_OVERRIDES[canon] = entry.name;
    }
  }
}

// Remap an object's player-name keys through NAME_MAP, merging collisions.
function _rekeyByNameMap(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const k in obj) {
    const nk = NAME_MAP[k] || k;
    const val = obj[k];
    if (!(nk in out)) { out[nk] = val; continue; }
    // Collision (e.g. an old name and a stale renamed key both mapping here).
    const cur = out[nk];
    if (Array.isArray(cur) || Array.isArray(val)) {
      // Lists (favorites, votes): keep the richer one so a stale empty key
      // can never clobber real data — order-independent.
      const a = Array.isArray(cur) ? cur : [];
      const b = Array.isArray(val) ? val : [];
      out[nk] = b.length > a.length ? b : a;
    } else if (cur && val && typeof cur === 'object' && typeof val === 'object') {
      Object.assign(cur, val);
    } else {
      out[nk] = val || cur;
    }
  }
  return out;
}

// Original canonical name behind a (possibly renamed) display name.
function _origCanon(name) { return DISPLAY_TO_CANON[name] || name; }

function _applyProfileOverrides() {
  if (!PROFILE_OVERRIDES || !Object.keys(PROFILE_OVERRIDES).length) return;
  // 1. Fold renames into NAME_MAP so every NAME_MAP[x]||x read resolves to the
  //    new name; record the reverse map and update identity-sensitive lists.
  for (const orig in PROFILE_OVERRIDES) {
    const disp = PROFILE_OVERRIDES[orig];
    for (const k in NAME_MAP) if (NAME_MAP[k] === orig) NAME_MAP[k] = disp;
    NAME_MAP[orig] = disp;
    DISPLAY_TO_CANON[disp] = orig;
    if (typeof ILIOUPOLI_MEMBERS !== 'undefined' && ILIOUPOLI_MEMBERS.has(orig)) {
      ILIOUPOLI_MEMBERS.delete(orig); ILIOUPOLI_MEMBERS.add(disp);
    }
    if (typeof OATHSWORN_VOTERS !== 'undefined') {
      const oi = OATHSWORN_VOTERS.indexOf(orig); if (oi >= 0) OATHSWORN_VOTERS[oi] = disp;
    }
    if (typeof BOARD_SOUTH_REGULARS !== 'undefined' && BOARD_SOUTH_REGULARS.has(orig)) {
      BOARD_SOUTH_REGULARS.delete(orig); BOARD_SOUTH_REGULARS.add(disp);
    }
  }
  // A new display name could itself be a NAME_MAP key — keep the map chain-free.
  _resolveNameMapChains();
  // 2. Re-run the play-name rewrite for the freshly-added mappings.
  for (const bggId in PLAY_HISTORY)
    for (const play of PLAY_HISTORY[bggId])
      for (const s of play.sc) if (NAME_MAP[s.n]) s.n = NAME_MAP[s.n];
  // 3. Remap the Firebase caches keyed by player name.
  if (typeof favoritesCache === 'object') favoritesCache = _rekeyByNameMap(favoritesCache);
  if (typeof oathswornRanks === 'object') oathswornRanks = _rekeyByNameMap(oathswornRanks);
  if (typeof ratingsCache === 'object') for (const b in ratingsCache) ratingsCache[b] = _rekeyByNameMap(ratingsCache[b]);
  if (typeof boardSouthVotes === 'object') for (const lib in boardSouthVotes) boardSouthVotes[lib] = _rekeyByNameMap(boardSouthVotes[lib]);
  if (typeof gameNotesCache === 'object') for (const b in gameNotesCache) for (const id in gameNotesCache[b]) {
    const n = gameNotesCache[b][id];
    if (n && n.author && NAME_MAP[n.author]) n.author = NAME_MAP[n.author];
  }
  // 4. Migrate this device's login so the logged-in identity follows the rename.
  const raw = localStorage.getItem('bgl-player');
  if (raw) { const m = NAME_MAP[raw] || raw; if (m !== raw) localStorage.setItem('bgl-player', m); }
}

// Distinct player names currently in play history (post-remap).
function _knownPlayerNames() {
  const s = new Set();
  for (const bggId in PLAY_HISTORY)
    for (const play of PLAY_HISTORY[bggId])
      for (const sc of play.sc) if (sc && sc.n) s.add(sc.n);
  return s;
}

// Save the logged-in player's chosen display name, keyed by their ORIGINAL
// canonical name so repeated renames always rewrite the same identity.
async function _saveProfileName(newName) {
  newName = (newName || '').trim().replace(/\s+/g, ' ');
  const cur = localStorage.getItem('bgl-player');
  if (!cur) return { ok: false, err: 'Not logged in.' };
  if (!newName) return { ok: false, err: 'Name cannot be empty.' };
  if (newName.length > 40) return { ok: false, err: 'Name is too long (40 max).' };
  if (newName === cur) return { ok: false, err: 'That is already your name.' };
  const others = _knownPlayerNames(); others.delete(cur);
  if (others.has(newName)) return { ok: false, err: 'Another player already uses that name.' };
  if (!FIREBASE_DB) return { ok: false, err: 'No connection.' };
  const orig = _origCanon(cur) || (NAME_MAP[cur] || cur);
  const existing = PROFILE_DATA[orig] || {};
  if (!(await _putProfile(orig, { ...existing, name: newName, updatedAt: Date.now() }))) return { ok: false, err: 'Save failed — try again.' };
  PROFILE_DATA[orig] = { ...existing, name: newName };
  localStorage.setItem('bgl-player', newName);
  return { ok: true };
}

// Write a whole profile entry. Prefer the clean /profiles node; fall back to
// the gameImages piggyback if its rule isn't in place yet. fetch resolves even
// on HTTP errors, so we check ok.
async function _putProfile(orig, entry) {
  const body = JSON.stringify(entry);
  const put = async (path) => {
    try {
      const res = await fetch(`${FIREBASE_DB}/${path}/${encodeURIComponent(orig)}.json`, { method: 'PUT', body });
      return !!(res && res.ok);
    } catch (e) { return false; }
  };
  return (await put(PROFILE_STORE_PRIMARY)) || (await put(PROFILE_STORE_FALLBACK));
}

// Set (a data URL) or remove (null) the logged-in player's photo.
async function _saveProfilePhoto(dataUrl) {
  const cur = localStorage.getItem('bgl-player');
  if (!cur) return { ok: false, err: 'Not logged in.' };
  if (!FIREBASE_DB) return { ok: false, err: 'No connection.' };
  const orig = _origCanon(cur) || (NAME_MAP[cur] || cur);
  const next = { ...(PROFILE_DATA[orig] || {}), updatedAt: Date.now() };
  if (dataUrl) next.photo = dataUrl; else delete next.photo;
  if (!(await _putProfile(orig, next))) return { ok: false, err: 'Save failed — try again.' };
  PROFILE_DATA[orig] = next;
  return { ok: true };
}

Promise.all([loadAllRatings(), loadAllFavorites(), loadImportedGames(), loadImportedPlays(), loadGameImages(), loadBoardSouthVotes(), loadOathswornRanks(), loadAllNotes(), loadProfiles()]).then(() => {
  _applyProfileOverrides();
  _applyAllPlayOverrides();
  _sortPlayHistory();
  if (typeof _updateBoardSouthBtnVisibility === 'function') _updateBoardSouthBtnVisibility();
  const savedPlayer = localStorage.getItem('bgl-player');
  // Self-heal: a login can only ever be a player who exists in the play
  // history. If localStorage points at a name with no plays (e.g. a rename
  // that failed to persist), recover by sending them back to the picker
  // instead of rendering an empty zero-games profile.
  const isOrphanLogin = savedPlayer && !_knownPlayerNames().has(savedPlayer);
  if (savedPlayer && !isOrphanLogin) {
    // The boot-to-profile CSS hook already hid the library shell on first
    // paint; drop the class now so subsequent navigation works normally.
    document.documentElement.classList.remove('boot-to-profile');
    showStatsView(savedPlayer);
  } else {
    if (isOrphanLogin) localStorage.removeItem('bgl-player');
    document.documentElement.classList.remove('boot-to-profile');
    openPicker();
  }
  navBooted();   // from here on, each new screen is a step back can return to
});

// ── JSON Import ──
// ── BGStats Play File Importer ──
window.initImporter = function(){
  const dropZone  = document.getElementById('importDropZone');
  const fileInput = document.getElementById('importFileInput');
  const result    = document.getElementById('importResult');
  const resTitle  = document.getElementById('importResultTitle');
  const resLines  = document.getElementById('importResultLines');
  const imgDls    = document.getElementById('importImgDownloads');
  if(!dropZone || !fileInput) return;

  function showResult(type, title, lines){
    // Re-query by id so this still works after a view re-render rebuilds the
    // import panel (the closure-captured elements would otherwise be stale).
    const r = document.getElementById('importResult');
    const rt = document.getElementById('importResultTitle');
    const rl = document.getElementById('importResultLines');
    const ri = document.getElementById('importImgDownloads');
    if(!r || !rt || !rl) return;
    r.className = 'import-result ' + type;
    r.style.display = 'block';
    rt.textContent = title;
    rl.innerHTML = lines.filter(Boolean).join('<br>');
    if(ri) ri.innerHTML = '';
  }

  async function processImport(file){
    if(!file || !(/\.(json|bgsplay)$/i).test(file.name)){
      showResult('error','Invalid file',['Please select a .json or .bgsplay file exported from BGStats.']);
      return;
    }

    showResult('info','Reading file…',['Please wait…']);

    let data;
    try{
      const text = await file.text();
      data = JSON.parse(text);
    } catch(_){
      showResult('error','Parse error',['The file is not valid JSON.']);
      return;
    }

    // Validate it's a BGStats play file
    if(!data.plays || !data.games || !data.players){
      showResult('error','Wrong format',['This doesn\'t look like a BGStats Play export. Make sure you export using Share → Play File from BGStats.']);
      return;
    }

    // Build lookup maps from the imported file
    const importedGamesById  = {};  // id → game object
    const importedPlayersById = {}; // id → player object
    const importedLocationsById = {}; // id → location object
    data.games.forEach(g   => importedGamesById[g.id]   = g);
    data.players.forEach(p => importedPlayersById[p.id] = p);
    if (Array.isArray(data.locations)) {
      data.locations.forEach(l => importedLocationsById[l.id] = l);
    }

    // ── 1. Merge players ──
    // A player is "new" only if their mapped name doesn't already appear in PLAY_HISTORY
    const existingPlayerNames = new Set();
    for (const id in PLAY_HISTORY) {
      for (const play of PLAY_HISTORY[id]) {
        for (const s of play.sc) existingPlayerNames.add(s.n);
      }
    }
    let newPlayers = 0;
    data.players.forEach(p => {
      const mapped = NAME_MAP[p.name] || p.name;
      if(existingPlayerNames.has(mapped)) return;
      existingPlayerNames.add(mapped);
      newPlayers++;
    });

    // ── 2. Merge games → EXTRA_GAMES + PLAY_HISTORY images ──
    // Known = in any catalogue (the shelf, imported games, the friends'
    // libraries); only games none of them has become new imported games.
    // A full BGStats backup lists every game in its library, played or not;
    // only games this file has plays of are worth adding.
    const existingBggIds = new Set();
    data.games.forEach(g => { if (findGameByBggId(g.bggId)) existingBggIds.add(g.bggId); });
    const playedGameIds = new Set(data.plays.map(p => p.gameRefId));

    let newGames = 0;
    const gamePersists = [];

    data.games.forEach(g => {
      // Capture urlImage for ALL games (even already-known ones) so hardcoded
      // games can pick up covers from BGStats imports.
      const incomingUrl = g.urlImage || g.urlThumb || null;
      if (incomingUrl) {
        const existingGame = findGameByBggId(g.bggId);
        if (existingGame && !existingGame.urlImage) {
          existingGame.urlImage = incomingUrl;
          gamePersists.push(persistGameImage(g.bggId, incomingUrl));
        }
      }
      if(existingBggIds.has(g.bggId) || !playedGameIds.has(g.id)) return;
      existingBggIds.add(g.bggId);
      newGames++;

      const entry = {
        id: 'imported_' + g.bggId,
        name: g.bggName || g.name,
        bggId: g.bggId,
        year: g.bggYear || null,
        designer: g.designers || '',
        players: (g.minPlayerCount && g.maxPlayerCount)
          ? (g.minPlayerCount === g.maxPlayerCount ? String(g.minPlayerCount) : `${g.minPlayerCount}-${g.maxPlayerCount}`)
          : '',
        playTime: (g.minPlayTime && g.maxPlayTime)
          ? (g.minPlayTime === g.maxPlayTime ? `${g.minPlayTime} min` : `${g.minPlayTime}-${g.maxPlayTime} min`)
          : '',
        categories: [],
        mechanics: [],
        description: '',
        bggRating: g.rating ? (g.rating / 10).toFixed(1) : null,
        urlImage: g.urlImage || g.urlThumb || null,
        imported: true,
      };

      EXTRA_GAMES[entry.bggId] = entry;
      gamePersists.push(persistImportedGame(entry));
      if (entry.urlImage) gamePersists.push(persistGameImage(entry.bggId, entry.urlImage));
    });

    // ── 3. Merge plays → PLAY_HISTORY ──
    // Only new or changed plays are saved. A play whose saved copy was edited
    // in BGStats more recently than the one in this file is left alone, so
    // importing an old export can't undo newer edits.
    let newPlays = 0, updatedPlays = 0, unchanged = 0, olderSkipped = 0;
    const playPersists = [];

    data.plays.forEach(play => {
      const game = importedGamesById[play.gameRefId];
      if(!game || !game.bggId) return;
      const bggId = game.bggId;

      const fullStamp = play.playDate || play.entryDate || '';
      const dateStr = fullStamp.slice(0,10);
      // Preserve the full timestamp so plays on the same calendar day keep
      // their actual order through the leaderboard / per-play Elo replay.
      const tStamp = (fullStamp.length > 10 && fullStamp !== dateStr) ? fullStamp : null;

      const sc = (play.playerScores || []).map(ps => {
        const player = importedPlayersById[ps.playerRefId];
        let rawName = player ? player.name : ('Player ' + ps.playerRefId);
        const mappedName = NAME_MAP[rawName] || rawName;
        return {
          n: mappedName,
          s: ps.score !== null && ps.score !== undefined ? String(ps.score) : '',
          w: !!ps.winner,
          ...(ps.role ? {r: ps.role} : {}),
        };
      });

      const persistedEntry = { bggId, date: dateStr, sc };
      if(tStamp) persistedEntry.t = tStamp;
      if(play.durationMin) persistedEntry.d = play.durationMin;
      if(play.board) persistedEntry.b = play.board;
      const locObj = play.locationRefId ? importedLocationsById[play.locationRefId] : null;
      const locName = locObj && locObj.name ? locObj.name : '';
      if (locName) persistedEntry.l = LOCATION_MAP[locName] || locName;
      if (play.modificationDate) persistedEntry.m = play.modificationDate;
      if (play.entryDate) persistedEntry.e = play.entryDate;

      const saved = importedPlaysCache[play.uuid];
      if (saved && saved.m && persistedEntry.m && saved.m > persistedEntry.m) { olderSkipped++; return; }
      const status = _mergePlayIntoHistory(play.uuid, persistedEntry);
      // Unchanged plays aren't saved again — unless the saved copy predates
      // entry times (needed to keep one night's plays in order).
      const needsOrder = saved && persistedEntry.e && saved.e !== persistedEntry.e;
      if (status === 'same' && !needsOrder) { unchanged++; return; }
      if (status === 'same') { unchanged++; playPersists.push(persistImportedPlay(play.uuid, persistedEntry)); return; }
      playPersists.push(persistImportedPlay(play.uuid, persistedEntry));
      if (status === 'new') newPlays++; else updatedPlays++;
    });

    await Promise.all(gamePersists);
    await Promise.all(playPersists);

    // Build the result message.
    const nothingNew = (newPlays === 0 && updatedPlays === 0 && newGames === 0 && newPlayers === 0);
    const plural = (n, w) => `${n} ${w}${n !== 1 ? 's' : ''}`;
    const resType  = nothingNew ? 'info' : 'success';
    const resTitle = nothingNew ? 'Nothing new' : 'Import successful ✓';
    const resLines = [
      newPlays     ? `+${plural(newPlays, 'new play')}` : '',
      updatedPlays ? `✏️ ${plural(updatedPlays, 'play')} updated` : '',
      newGames     ? `+${plural(newGames, 'new game')}` : '',
      newPlayers   ? `+${plural(newPlayers, 'new player')}` : '',
      unchanged    ? `${plural(unchanged, 'play')} already up to date` : '',
      olderSkipped ? `${plural(olderSkipped, 'play')} skipped: the app has a newer version` : '',
      nothingNew && !unchanged && !olderSkipped ? 'This file has no plays.' : '',
    ];

    // Refresh every open view so updated plays — including changed locations —
    // appear immediately, instead of only after a reload/navigation. The
    // profile (where the importer lives) is re-rendered too; the result panel
    // is re-shown afterwards (showResult re-queries by id) and scrolled to.
    const isOpen = (id) => { const el = document.getElementById(id); return el && el.classList.contains('open'); };
    const player = (typeof localStorage !== 'undefined') ? localStorage.getItem('bgl-player') : null;
    try {
      if (isOpen('stats-view') && player && typeof showStatsView === 'function') {
        showStatsView((typeof _viewingProfile !== 'undefined' && _viewingProfile) || player,
                      (typeof _viewingProfile !== 'undefined' && _viewingProfile) ? 'visiting' : undefined);
      }
      if (isOpen('games-view') && typeof showGamesView === 'function') showGamesView();
      if (isOpen('challenges-view') && player && typeof showChallengesView === 'function') showChallengesView(player);
      if (isOpen('leaderboard-view') && typeof showLeaderboardView === 'function') showLeaderboardView();
      if (isOpen('boardsouth-view') && typeof showBoardSouthView === 'function') showBoardSouthView();
    } catch (_) {}
    if (typeof _updateBoardSouthBtnVisibility === 'function') { try { _updateBoardSouthBtnVisibility(); } catch (_) {} }

    showResult(resType, resTitle, resLines);
    const rEl = document.getElementById('importResult');
    if (rEl) rEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const fi = document.getElementById('importFileInput');
    if (fi) fi.value = '';
  }

  fileInput.addEventListener('change', e => processImport(e.target.files[0]));
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    processImport(e.dataTransfer.files[0]);
  });
};

// Installable app + offline support (sw.js).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
