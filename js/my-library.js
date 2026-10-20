// ── My games: a signed-in person's own list of games ──
// libraries/{uid}/{bggId} = { at } (js/account.js signs them in). A game the
// site has never seen is saved to importedGames, like a game from a BGStats
// file, so every page knows it and the BGG sync fetches its cover. The
// Library shows the list as a shelf of its own (shell.js, owner 'mine'),
// next to the shelves of the people whose friend they are.

let _myLib = null;        // bggId → when it was added, for the signed-in person (null: nobody)
let _myLibUid = null;

// Signed in with a list of their own (Στιβ and Δημητρης have their shelves instead).
function myLibActive() {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  return !!(a && !acctIsOwner(a));
}
function myLibHas(bggId) { return !!(_myLib && _myLib[Number(bggId)]); }

function _myLibStore(uid, lib) {
  try { localStorage.setItem('bgl-mylib', JSON.stringify({ uid, lib })); } catch (_) {}
}
// The list as this device last saw it, then fresh from the database.
async function myLibLoad() {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a) { _myLib = null; _myLibUid = null; _myShelf.cache = null; return; }
  if (_myLibUid !== a.uid) {
    let kept = null;
    try { kept = JSON.parse(localStorage.getItem('bgl-mylib') || 'null'); } catch (_) {}
    _myLib = kept && kept.uid === a.uid ? kept.lib || {} : {};
    _myLibUid = a.uid;
    _myShelf.cache = null;
  }
  try {
    const res = await fetch(`${FIREBASE_DB}/libraries/${a.uid}.json`, { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) || {};
      _myLib = {};
      for (const id in data) _myLib[Number(id)] = (data[id] && data[id].at) || 1;
      _myLibStore(a.uid, _myLib);
      _myShelf.cache = null;
    }
  } catch (_) {}
  _myLibRedraw();
}

function _myLibRedraw() {
  if (typeof _libOwnerNow !== 'undefined' && _libOwnerNow === 'mine' && typeof _libRedraw === 'function') _libRedraw();
  document.querySelectorAll('[data-mylib-toggle]').forEach(_myLibBtnState);
}

// The list as shelf entries, filled in from what the site knows of each game.
function _myShelf() {
  if (_myShelf.cache) return _myShelf.cache;
  const ids = Object.keys(_myLib || {}).map(Number);
  return (_myShelf.cache = ids.map(id => {
    const g = findGameByBggId(id) || { name: `Game #${id}`, bggId: id, players: '', playTime: '' };
    const rich = GAMES.find(x => x.bggId === id) || EXTRA_GAMES[id] || {};
    const cats = (rich.categories && rich.categories.length) ? rich.categories
      : (g.categories && g.categories.length) ? g.categories
      : (typeof bggShelfCategories === 'function' ? bggShelfCategories(id, g.players) : []);
    return { ...g, id: 'my_' + id, bggId: id, libOwner: 'mine', categories: cats,
      mechanics: rich.mechanics || g.mechanics || [],
      spineColor: g.spineColor || rich.spineColor || '#555', boxSize: g.boxSize || rich.boxSize || 'md' };
  }).sort((a, b) => a.name.localeCompare(b.name)));
}

// Add a game: unknown to the site, it's saved for everyone first (its name,
// year, players and picture as far as they're known).
async function ensureKnownGame(id, info) {
  id = Number(id);
  if (!(id > 0) || findGameByBggId(id)) return;
  const entry = {
    id: 'imported_' + id, name: (info && info.name) || `Game #${id}`, bggId: id,
    year: (info && Number(info.year)) || null, designer: '',
    players: (info && info.players) || '', playTime: (info && info.playTime) || '',
    categories: [], mechanics: [], description: '', bggRating: null,
    urlImage: (info && info.img) || null, imported: true,
  };
  EXTRA_GAMES[id] = entry;
  await persistImportedGame(entry);
}
async function myLibAdd(id, info) {
  id = Number(id);
  const a = acctMe();
  if (!a || !(id > 0)) return;
  await ensureKnownGame(id, info);
  const at = Date.now();
  await acctWrite(`libraries/${a.uid}/${id}`, 'PUT', { at });
  (_myLib = _myLib || {})[id] = at;
  _myLibStore(a.uid, _myLib);
  _myShelf.cache = null;
  _myLibRedraw();
}
async function myLibRemove(id) {
  id = Number(id);
  const a = acctMe();
  if (!a) return;
  await acctWrite(`libraries/${a.uid}/${id}`, 'DELETE');
  if (_myLib) delete _myLib[id];
  _myLibStore(a.uid, _myLib || {});
  _myShelf.cache = null;
  _myLibRedraw();
}

// ── The game page's button ──
function myLibModalBtnHtml(game) {
  if (!myLibActive() || !game || !(game.bggId > 0)) return '';
  const on = myLibHas(game.bggId);
  return `<button type="button" class="mylib-btn${on ? ' on' : ''}" data-mylib-toggle="${game.bggId}">${on ? '&#10003; In my games' : '+ Add to my games'}</button>`;
}
function _myLibBtnState(btn) {
  const on = myLibHas(btn.dataset.mylibToggle);
  btn.classList.toggle('on', on);
  btn.innerHTML = on ? '&#10003; In my games' : '+ Add to my games';
  btn.title = on ? 'Tap to take it off your list' : 'Add it to your list of games';
}

// ── Finding a game to add ──
// Every game the site knows: the shelves, the games played, BGG's top 100
// and the games on Trending; a game it doesn't know comes by its BGG link.
function _myLibIndex() {
  const out = new Map();
  // how often the person looking played each game (not everyone's plays)
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const mine = (id) => me ? (PLAY_HISTORY[id] || []).filter(p => p.sc.some(s => s.n === me)).length : 0;
  const add = (id, name, year, img, players) => {
    id = Number(id);
    if (!(id > 0) || !name) return;
    const g = out.get(id);
    if (!g) out.set(id, { id, name, year: year || '', img: img || '', players: players || '', plays: (PLAY_HISTORY[id] || []).length, mine: mine(id) });
    else { g.year = g.year || year || ''; g.img = g.img || img || ''; g.players = g.players || players || ''; }
  };
  GAMES.forEach(g => add(g.bggId, g.name, g.year, '', g.players));
  for (const k in EXTRA_GAMES) { const g = EXTRA_GAMES[k] || {}; add(g.bggId || k, g.name, g.year, g.urlImage, g.players); }
  [typeof GIANNIS_GAMES !== 'undefined' && GIANNIS_GAMES, typeof LGEORGE_GAMES !== 'undefined' && LGEORGE_GAMES,
   typeof DIMITRIS_GAMES !== 'undefined' && DIMITRIS_GAMES].forEach(L => L && Object.values(L).forEach(g => add(g.bggId, g.name, g.year, '', g.players)));
  if (typeof BGG_TOP100 !== 'undefined') (BGG_TOP100.games || []).forEach(g => add(g.id, g.name, g.year));
  if (typeof _hot !== 'undefined' && _hot) (_hot.games || []).forEach(g => add(g.id, g.name, g.year, g.img, g.minp ? (g.minp === g.maxp ? String(g.minp) : `${g.minp}-${g.maxp}`) : ''));
  return [...out.values()];
}
const _myNorm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function _myLibSearch(q) {
  const all = _myLibIndex();
  const nq = _myNorm(q);
  if (!nq) {
    // nothing typed: the games you've played that aren't on your list yet
    const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
    return all.filter(g => !myLibHas(g.id) && me && g.mine)
      .sort((a, b) => b.mine - a.mine).slice(0, 30);
  }
  // a BoardGameGeek link (or its number) pasted in finds that game, known or not
  const link = _myLibParseLink(q);
  if (link) {
    const g = all.find(x => x.id === link.id);
    return [g || { id: link.id, name: (findGameByBggId(link.id) || {}).name || link.name || `Game #${link.id}`, year: '', img: '', players: '', plays: 0, mine: 0 }];
  }
  const words = nq.split(' ');
  return all.map(g => {
    const n = _myNorm(g.name);
    if (!words.every(w => n.includes(w))) return null;
    const rank = n === nq ? 0 : n.startsWith(nq) ? 1 : n.split(' ').some(x => x.startsWith(words[0])) ? 2 : 3;
    return { g, rank };
  }).filter(Boolean).sort((a, b) => a.rank - b.rank || b.g.mine - a.g.mine || b.g.plays - a.g.plays || a.g.name.localeCompare(b.g.name))
    .slice(0, 40).map(x => x.g);
}

// A BoardGameGeek link: the game's id, and a name from the link.
function _myLibParseLink(text) {
  const t = String(text || '').trim();
  const m = /boardgamegeek\.com\/(?:boardgame|boardgameexpansion|thing)\/(\d+)(?:\/([^/?#]+))?/i.exec(t);
  if (!m) return null;
  const slug = decodeURIComponent(m[2] || '').replace(/-/g, ' ').trim();
  return { id: Number(m[1]), name: slug ? slug.replace(/\b\w/g, c => c.toUpperCase()) : '' };
}

let _myAddOpen = false;
function myLibOpenAdd() {
  if (!myLibActive()) { if (typeof acctOpenSheet === 'function') acctOpenSheet(); return; }
  let ov = document.getElementById('mylib-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'mylib-overlay';
    ov.className = 'acct-overlay mylib-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
    ov.addEventListener('click', _myAddClick);
    ov.addEventListener('submit', (e) => { e.preventDefault(); _myAddSearch(); });
  }
  ov.innerHTML = `<div class="acct-sheet mylib-sheet">
      <button type="button" class="acct-x" data-mylib="close" aria-label="Close">&times;</button>
      <div class="acct-title">Add a game</div>
      <form class="lp-gsearch">
        <input type="search" class="acct-input" id="mylib-q" placeholder="A game's name" autocomplete="off" enterkeyhint="search">
        <button type="submit" class="acct-btn acct-main">Search</button>
      </form>
      <div class="mylib-hint" id="mylib-hint"></div>
      <div class="mylib-results" id="mylib-results"></div>
      <div class="acct-msg" id="mylib-msg" hidden></div>
    </div>`;
  if (!_myAddOpen) {
    _myAddOpen = true;
    ov.classList.add('open');
    ov._navClose = _myAddClose;
    if (typeof navOverlayOpened === 'function') navOverlayOpened('mylib');
  }
  _myAddQuery = '';
  _myAddResults();
  // Trending's games join the search once they've loaded
  if (typeof _loadHot === 'function' && (typeof _hot === 'undefined' || !_hot)) _loadHot().catch(() => {});
  setTimeout(() => { const q = document.getElementById('mylib-q'); if (q && !_isTouchDevice()) q.focus(); }, 60);
}
function _myAddClose() {
  const ov = document.getElementById('mylib-overlay');
  if (!ov || !_myAddOpen) return;
  _myAddOpen = false;
  ov.classList.remove('open');
  ov._navClose = null;
  if (typeof navOverlayClosed === 'function') navOverlayClosed('mylib');
}

let _myAddQuery = '';   // what was last searched (results change on the Search button, not while typing)
function _myAddSearch() {
  const input = document.getElementById('mylib-q');
  _myAddQuery = ((input || {}).value || '').trim();
  if (input) input.blur();
  _myAddResults();
}
function _myAddResults() {
  const box = document.getElementById('mylib-results');
  if (!box) return;
  const q = _myAddQuery;
  const list = _myLibSearch(q);
  const hint = document.getElementById('mylib-hint');
  if (hint) hint.textContent = q ? (list.length ? '' : `No game called “${q}” here yet.`) : (list.length ? 'Games you\'ve played:' : 'Type a game\'s name and tap Search.');
  box.innerHTML = list.map(g => {
    const on = myLibHas(g.id);
    return `<div class="mylib-row">
      <img class="mylib-cover" src="images/${g.id}.jpg" alt="" loading="lazy" data-img="${_escapeHtml(g.img || '')}" onerror="__myLibImg(this)">
      <div class="mylib-info"><b>${_escapeHtml(g.name)}</b><span>${[g.year, g.players ? `${g.players} players` : '', g.mine ? `you played ${g.mine}&times;` : ''].filter(Boolean).join(' &middot; ')}</span></div>
      <button type="button" class="mylib-add${on ? ' on' : ''}" data-mylib-add="${g.id}">${on ? '&#10003; Added' : 'Add'}</button>
    </div>`;
  }).join('');
}
window.__myLibImg = function (img) {
  if (img.dataset.img && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.img; return; }
  img.onerror = null;
  img.src = 'images/game-placeholder.svg';
};

async function _myAddClick(e) {
  const ov = document.getElementById('mylib-overlay');
  if (e.target === ov || e.target.closest('[data-mylib="close"]')) { _myAddClose(); return; }
  const b = e.target.closest('[data-mylib-add]');
  if (!b || b.disabled) return;
  const id = Number(b.dataset.mylibAdd);
  b.disabled = true;
  try {
    if (myLibHas(id)) await myLibRemove(id);
    else {
      const g = _myLibIndex().find(x => x.id === id) || {};
      await myLibAdd(id, g);
    }
  } catch (err) { _myAddSay(err.message); }
  b.disabled = false;
  _myAddResults();
}

function _myAddSay(text) {
  const m = document.getElementById('mylib-msg');
  if (m) { m.hidden = false; m.textContent = text; }
}

document.addEventListener('click', async (e) => {
  if (e.target.closest('[data-mylib-open]')) { e.preventDefault(); myLibOpenAdd(); return; }
  const t = e.target.closest('[data-mylib-toggle]');
  if (!t || t.disabled) return;
  e.preventDefault();
  const id = Number(t.dataset.mylibToggle);
  t.disabled = true;
  try {
    if (myLibHas(id)) await myLibRemove(id);
    else await myLibAdd(id, findGameByBggId(id) || {});
  } catch (err) { if (typeof _acctToast === 'function') _acctToast(err.message); }
  t.disabled = false;
  _myLibBtnState(t);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && _myAddOpen) _myAddClose(); });
