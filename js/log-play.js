// ── Log a play: a signed-in person records a play in the app ──
// plays/{id} = { bggId, date, t, d, l, b, c, sc: [{n, s, w, r}], by, at }
// (by: their uid; the database rules let only them, or Στιβ, change it).
// The plays join PLAY_HISTORY like a BGStats import's, so every page counts
// them, unless the same play is there already from a BGStats file (same
// game, day and players): the file's copy wins. Names are saved as the
// players' original names, so a rename in Profile settings follows them.

let manualPlaysCache = {};   // id → the play as saved

async function loadManualPlays() {
  try {
    const res = await fetch(`${FIREBASE_DB}/plays.json`, { cache: 'no-store' });
    manualPlaysCache = (res.ok && await res.json()) || {};
  } catch (e) {
    manualPlaysCache = {};
  }
}
// After the BGStats plays have merged (boot.js).
function mergeManualPlays() {
  for (const id in manualPlaysCache) _lpMerge(id, manualPlaysCache[id]);
}

function _lpEntry(id, p) {
  const sc = (Array.isArray(p.sc) ? p.sc : Object.values(p.sc || {})).filter(s => s && s.n).map(s => {
    const o = { n: NAME_MAP[s.n] || s.n, s: s.s == null ? '' : String(s.s), w: !!s.w };
    if (s.r) o.r = s.r;
    return o;
  });
  const e = { date: p.date, t: p.t || `${p.date} 20:00:00`, e: p.t || `${p.date} 20:00:00`, sc, mp: id, by: p.by };
  if (p.d) e.d = p.d;
  if (p.b) e.b = p.b;
  if (p.l) e.l = typeof canonLocation === 'function' ? canonLocation(p.l, p.date) : p.l;
  if (p.c) e.c = p.c;
  return e;
}
function _lpUnmerge(id) {
  for (const g in PLAY_HISTORY) {
    const i = PLAY_HISTORY[g].findIndex(e => e.mp === id);
    if (i >= 0) PLAY_HISTORY[g].splice(i, 1);
  }
}
function _lpMerge(id, p) {
  _lpUnmerge(id);
  if (!p || !(Number(p.bggId) > 0) || !p.date) return;
  const arr = PLAY_HISTORY[p.bggId] || (PLAY_HISTORY[p.bggId] = []);
  const entry = _lpEntry(id, p);
  const names = new Set(entry.sc.map(s => s.n));
  const twin = arr.some(e => !e.mp && e.date === entry.date && e.sc.length === entry.sc.length
    && e.sc.filter(s => names.has(s.n)).length >= Math.max(1, e.sc.length - 1));
  if (!twin) arr.push(entry);
}

// Who may change a logged play here: whoever logged it, and Στιβ (the rules decide in the end).
function _lpCanEdit(play) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  return !!(a && play && play.mp && (play.by === a.uid || _acctDisplay(a.player) === ACCT_OWNERS.stiv));
}

// ── Buttons ──
function logPlayBtnHtml(game, where) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a) return '';
  return `<button type="button" class="lp-open${where ? ' lp-open-' + where : ''}" data-lp-open="${game ? game.bggId : ''}">+ Log a play</button>`;
}
function logPlayEditBtnHtml(play) {
  if (!_lpCanEdit(play)) return '';
  return `<button type="button" class="lp-edit" data-lp-edit="${_escapeHtml(play.mp)}" title="Edit this play" aria-label="Edit this play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>`;
}

// ── The form ──
let _lp = null;          // what's being logged: { id, bggId, date, time, d, l, b, c, sc: [{n, s, w, r}], roles }
let _lpOpen = false;

const _lpPad = (n) => String(n).padStart(2, '0');
function _lpToday() { const d = new Date(); return `${d.getFullYear()}-${_lpPad(d.getMonth() + 1)}-${_lpPad(d.getDate())}`; }
function _lpNow() { const d = new Date(); return `${_lpPad(d.getHours())}:${_lpPad(d.getMinutes())}`; }

// The people you play with, most often first; then everyone else.
function _lpPeople() {
  const me = _navPlayer();
  const withMe = new Map(), all = new Map();
  for (const id in PLAY_HISTORY) for (const p of PLAY_HISTORY[id]) {
    const mine = p.sc.some(s => s.n === me);
    for (const s of p.sc) {
      if (!s.n || s.n === me || (typeof HIDDEN_PLAYERS !== 'undefined' && HIDDEN_PLAYERS.has(s.n))) continue;
      all.set(s.n, (all.get(s.n) || 0) + 1);
      if (mine) withMe.set(s.n, (withMe.get(s.n) || 0) + 1);
    }
  }
  const rank = (n) => (withMe.get(n) || 0) * 1000 + (all.get(n) || 0);
  return [...all.keys()].sort((a, b) => rank(b) - rank(a));
}
// Where you play, most recent first.
function _lpPlaces() {
  const me = _navPlayer();
  const last = new Map();
  for (const id in PLAY_HISTORY) for (const p of PLAY_HISTORY[id]) {
    if (!p.l) continue;
    const k = (p.sc.some(s => s.n === me) ? '1' : '0') + (p.t || p.date);
    if (!last.has(p.l) || last.get(p.l) < k) last.set(p.l, k);
  }
  return [...last.entries()].sort((a, b) => b[1].localeCompare(a[1])).map(x => x[0]);
}

function logPlayOpen(bggId) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a) { if (typeof acctOpenSheet === 'function') acctOpenSheet(); return; }
  const me = _navPlayer();
  _lp = { id: null, bggId: Number(bggId) || 0, date: _lpToday(), time: _lpNow(), d: '', l: _lpPlaces()[0] || '', b: '', c: '',
    sc: me ? [{ n: me, s: '', w: false, r: '' }] : [], roles: false };
  _lpShow();
}
function logPlayEdit(id) {
  const p = manualPlaysCache[id];
  if (!p) return;
  const t = String(p.t || '');
  const sc = (Array.isArray(p.sc) ? p.sc : Object.values(p.sc || {})).map(s => ({ n: NAME_MAP[s.n] || s.n, s: s.s == null ? '' : String(s.s), w: !!s.w, r: s.r || '' }));
  _lp = { id, bggId: Number(p.bggId), date: p.date, time: t.slice(11, 16) || '20:00', d: p.d || '', l: p.l || '', b: p.b || '', c: p.c || '',
    sc, roles: sc.some(s => s.r) };
  _lpShow();
}

function _lpEl() {
  let ov = document.getElementById('lp-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'lp-overlay';
    ov.className = 'acct-overlay lp-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
    ov.addEventListener('click', _lpClick);
    ov.addEventListener('input', (e) => { if (e.target.id === 'lp-gq') _lpGameResults(); });
    ov.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'lp-pname') { e.preventDefault(); _lpAddPlayer(); }
    });
    ov.addEventListener('submit', (e) => { e.preventDefault(); _lpSave(); });
  }
  return ov;
}

function _lpShow() {
  const ov = _lpEl();
  const esc = _escapeHtml;
  ov.innerHTML = `<form class="acct-sheet lp-sheet" novalidate>
      <button type="button" class="acct-x" data-lp="close" aria-label="Close">&times;</button>
      <div class="acct-title">${_lp.id ? 'Edit the play' : 'Log a play'}</div>
      <div id="lp-game"></div>
      <div class="lp-when">
        <label><span class="acct-label">Day</span><input class="acct-input" type="date" id="lp-date" value="${esc(_lp.date)}" max="${_lpToday()}" required></label>
        <label><span class="acct-label">Started</span><input class="acct-input" type="time" id="lp-time" value="${esc(_lp.time)}"></label>
        <label><span class="acct-label">Minutes</span><input class="acct-input" type="number" id="lp-d" value="${esc(String(_lp.d || ''))}" min="0" max="10000" inputmode="numeric" placeholder="—"></label>
      </div>
      <div class="lp-sec"><span class="acct-label">Players</span><button type="button" class="acct-link" data-lp="roles">${_lp.roles ? 'Hide characters' : '+ Characters'}</button></div>
      <div class="lp-hint">Tap &#9733; for the winners. Co-op: star everyone if you won, no one if the game won.</div>
      <div id="lp-players"></div>
      <div class="lp-addp">
        <input class="acct-input" id="lp-pname" list="lp-people" placeholder="Add a player: a name" autocomplete="off" maxlength="60">
        <button type="button" class="acct-btn" data-lp="addp">Add</button>
      </div>
      <datalist id="lp-people">${_lpPeople().slice(0, 300).map(n => `<option value="${esc(n)}">`).join('')}</datalist>
      <label><span class="acct-label">Where</span><input class="acct-input" id="lp-l" list="lp-places" value="${esc(_lp.l)}" maxlength="80" placeholder="Home, a friend's place, a café…" autocomplete="off"></label>
      <datalist id="lp-places">${_lpPlaces().slice(0, 60).map(n => `<option value="${esc(n)}">`).join('')}</datalist>
      <label><span class="acct-label">Scenario, map or variant <small>(if any)</small></span><input class="acct-input" id="lp-b" value="${esc(_lp.b)}" maxlength="300" autocomplete="off"></label>
      <label><span class="acct-label">Notes <small>(if any)</small></span><textarea class="acct-input" id="lp-c" rows="2" maxlength="1000">${esc(_lp.c)}</textarea></label>
      <div class="acct-msg" id="lp-msg" hidden></div>
      <button type="submit" class="acct-btn acct-main">${_lp.id ? 'Save the changes' : 'Save the play'}</button>
      ${_lp.id ? '<button type="button" class="acct-link lp-del" data-lp="delete">Delete this play</button>' : ''}
    </form>`;
  _lpRenderGame();
  _lpRenderPlayers();
  if (!_lpOpen) {
    _lpOpen = true;
    ov.classList.add('open');
    ov._navClose = _lpClose;
    if (typeof navOverlayOpened === 'function') navOverlayOpened('lp');
  }
  ov.scrollTop = 0;
}
function _lpClose() {
  const ov = document.getElementById('lp-overlay');
  if (!ov || !_lpOpen) return;
  _lpOpen = false;
  ov.classList.remove('open');
  ov._navClose = null;
  if (typeof navOverlayClosed === 'function') navOverlayClosed('lp');
}

// The game: the one picked, or a search for one.
function _lpRenderGame() {
  const box = document.getElementById('lp-game');
  if (!box) return;
  const esc = _escapeHtml;
  if (_lp.bggId) {
    const g = findGameByBggId(_lp.bggId) || (_lpPicked && _lpPicked.id === _lp.bggId ? _lpPicked : { name: `Game #${_lp.bggId}` });
    box.innerHTML = `<div class="lp-gamecard">
        <img class="mylib-cover" src="images/${_lp.bggId}.jpg" alt="" data-img="${esc(g.urlImage || g.img || '')}" onerror="__myLibImg(this)">
        <b>${esc(g.name)}</b>
        <button type="button" class="acct-link" data-lp="game">Change</button>
      </div>`;
    return;
  }
  box.innerHTML = `<span class="acct-label">Game</span>
    <input type="search" class="acct-input" id="lp-gq" placeholder="Search games…" autocomplete="off">
    <div class="mylib-results lp-gresults" id="lp-gresults"></div>`;
  _lpGameResults();
  if (typeof _loadHot === 'function' && (typeof _hot === 'undefined' || !_hot)) _loadHot().then(_lpGameResults).catch(() => {});
}
let _lpPicked = null;   // the game picked from the search, while the site may not know it yet
function _lpGameResults() {
  const box = document.getElementById('lp-gresults');
  if (!box) return;
  const q = ((document.getElementById('lp-gq') || {}).value || '').trim();
  let list;
  if (q) {
    list = _myLibSearch(q);
    const link = _myLibParseLink(q);
    if (link && !list.some(g => g.id === link.id)) list.unshift({ id: link.id, name: (findGameByBggId(link.id) || {}).name || link.name || `Game #${link.id}`, year: '', img: '', players: '', plays: 0 });
  } else {
    // your games and the games you've played lately
    const me = _navPlayer();
    const recent = [];
    for (const id in PLAY_HISTORY) {
      const last = PLAY_HISTORY[id].find(p => p.sc.some(s => s.n === me));
      if (last) recent.push([Number(id), last.t || last.date]);
    }
    recent.sort((a, b) => b[1].localeCompare(a[1]));
    const ids = [...new Set([...Object.keys((typeof _myLib !== 'undefined' && _myLib) || {}).map(Number), ...recent.map(r => r[0])])].slice(0, 12);
    const idx = new Map(_myLibIndex().map(g => [g.id, g]));
    list = ids.map(id => idx.get(id)).filter(Boolean);
  }
  box.innerHTML = list.slice(0, 30).map(g => `<button type="button" class="mylib-row lp-gpick" data-lp-game="${g.id}">
      <img class="mylib-cover" src="images/${g.id}.jpg" alt="" loading="lazy" data-img="${_escapeHtml(g.img || '')}" onerror="__myLibImg(this)">
      <span class="mylib-info"><b>${_escapeHtml(g.name)}</b><span>${[g.year, g.plays ? `played ${g.plays}&times;` : ''].filter(Boolean).join(' &middot; ')}</span></span>
    </button>`).join('') || `<div class="mylib-hint">${q ? 'No game by that name here. Paste its BoardGameGeek link instead.' : 'Type a game\'s name, or paste its BoardGameGeek link.'}</div>`;
}

function _lpSyncPlayers() {
  document.querySelectorAll('#lp-players .lp-prow').forEach(row => {
    const p = _lp.sc[Number(row.dataset.i)];
    if (!p) return;
    p.s = row.querySelector('.lp-score').value.trim();
    const r = row.querySelector('.lp-role');
    if (r) p.r = r.value.trim();
  });
}
function _lpRenderPlayers() {
  const box = document.getElementById('lp-players');
  if (!box) return;
  const esc = _escapeHtml;
  box.innerHTML = _lp.sc.map((p, i) => `<div class="lp-prow" data-i="${i}">
      <div class="lp-pmain">
        <span class="picker-avatar" aria-hidden="true">${avatarInner(p.n)}</span>
        <span class="lp-pn">${esc(p.n)}</span>
        <input class="acct-input lp-score" value="${esc(p.s)}" placeholder="Score" maxlength="40" inputmode="decimal" aria-label="${esc(p.n)}'s score">
        <button type="button" class="lp-win${p.w ? ' on' : ''}" data-lp-win="${i}" aria-pressed="${p.w}" title="${p.w ? 'Won' : 'Tap if they won'}">&#9733;</button>
        <button type="button" class="lp-x" data-lp-del="${i}" aria-label="Remove ${esc(p.n)}">&times;</button>
      </div>
      ${_lp.roles ? `<input class="acct-input lp-role" value="${esc(p.r || '')}" placeholder="Character, faction, colour…" maxlength="120" aria-label="${esc(p.n)}'s character">` : ''}
    </div>`).join('') || '<div class="mylib-hint">Add the players below.</div>';
}
function _lpAddPlayer() {
  const input = document.getElementById('lp-pname');
  let name = (input.value || '').trim().replace(/\s+/g, ' ');
  if (!name) return;
  const known = [..._knownPlayerNames()].find(n => n.toLowerCase() === name.toLowerCase());
  if (known) name = known;
  _lpSyncPlayers();
  if (_lp.sc.some(p => p.n.toLowerCase() === name.toLowerCase())) { _lpSay(`${name} is already in this play.`); return; }
  _lp.sc.push({ n: name, s: '', w: false, r: '' });
  input.value = '';
  _lpRenderPlayers();
  _lpSay('');
}

function _lpSay(text) {
  const m = document.getElementById('lp-msg');
  if (!m) return;
  m.hidden = !text;
  m.textContent = text;
}

async function _lpClick(e) {
  const ov = document.getElementById('lp-overlay');
  if (e.target === ov) { _lpClose(); return; }
  const b = e.target.closest('[data-lp], [data-lp-game], [data-lp-win], [data-lp-del]');
  if (!b) return;
  const what = b.dataset.lp;
  if (what === 'close') { _lpClose(); return; }
  if (what === 'game') { _lp.bggId = 0; _lpRenderGame(); setTimeout(() => { const q = document.getElementById('lp-gq'); if (q) q.focus(); }, 30); return; }
  if (what === 'roles') { _lpSyncPlayers(); _lp.roles = !_lp.roles; b.textContent = _lp.roles ? 'Hide characters' : '+ Characters'; _lpRenderPlayers(); return; }
  if (what === 'addp') { _lpAddPlayer(); return; }
  if (what === 'delete') { await _lpDelete(); return; }
  if (b.dataset.lpGame) {
    const id = Number(b.dataset.lpGame);
    _lpPicked = _myLibIndex().find(g => g.id === id) || { id, name: b.querySelector('b').textContent };
    _lp.bggId = id;
    _lpRenderGame();
    return;
  }
  if (b.dataset.lpWin) {
    const p = _lp.sc[Number(b.dataset.lpWin)];
    p.w = !p.w;
    b.classList.toggle('on', p.w);
    b.setAttribute('aria-pressed', String(p.w));
    return;
  }
  if (b.dataset.lpDel) { _lpSyncPlayers(); _lp.sc.splice(Number(b.dataset.lpDel), 1); _lpRenderPlayers(); }
}

async function _lpSave() {
  const a = acctMe();
  if (!a) { _lpSay('Sign in first.'); return; }
  _lpSyncPlayers();
  const date = document.getElementById('lp-date').value;
  const time = document.getElementById('lp-time').value || '20:00';
  const d = Number(document.getElementById('lp-d').value) || 0;
  const l = document.getElementById('lp-l').value.trim();
  const b = document.getElementById('lp-b').value.trim();
  const c = document.getElementById('lp-c').value.trim();
  if (!_lp.bggId) { _lpSay('Pick the game.'); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { _lpSay('Pick the day.'); return; }
  if (date > _lpToday()) { _lpSay('That day hasn\'t come yet.'); return; }
  if (!_lp.sc.length) { _lpSay('Add the players.'); return; }
  const rec = {
    bggId: _lp.bggId, date, t: `${date} ${time}:00`,
    sc: _lp.sc.map(p => {
      const o = { n: typeof _origCanon === 'function' ? _origCanon(p.n) : p.n, w: !!p.w };
      if (p.s) o.s = p.s.slice(0, 40);
      if (_lp.roles && p.r) o.r = p.r.slice(0, 120);
      return o;
    }),
    by: _lp.id ? (manualPlaysCache[_lp.id] || {}).by || a.uid : a.uid,
    at: _lp.id ? (manualPlaysCache[_lp.id] || {}).at || Date.now() : Date.now(),
  };
  if (d) rec.d = Math.min(10000, Math.round(d));
  if (l) rec.l = l;
  if (b) rec.b = b;
  if (c) rec.c = c;
  _lpSay('Saving…');
  try {
    if (typeof ensureKnownGame === 'function') await ensureKnownGame(rec.bggId, _lpPicked && _lpPicked.id === rec.bggId ? _lpPicked : null);
    let id = _lp.id;
    if (id) await acctWrite(`plays/${id}`, 'PUT', rec);
    else id = (await acctWrite('plays', 'POST', rec)).name;
    manualPlaysCache[id] = rec;
    _lpMerge(id, rec);
    _sortPlayHistory();
    _lpClose();
    _lpRefresh(rec.bggId);
    if (typeof _acctToast === 'function') _acctToast(_lp.id ? 'Saved the changes.' : 'Play saved. It counts everywhere now.');
  } catch (err) { _lpSay(err.message || 'The save failed. Try again.'); }
}

async function _lpDelete() {
  if (!_lp.id || !confirm('Delete this play? This can\'t be undone.')) return;
  _lpSay('Deleting…');
  try {
    const bggId = (manualPlaysCache[_lp.id] || {}).bggId;
    await acctWrite(`plays/${_lp.id}`, 'DELETE');
    delete manualPlaysCache[_lp.id];
    _lpUnmerge(_lp.id);
    _lpClose();
    _lpRefresh(bggId);
    if (typeof _acctToast === 'function') _acctToast('The play is deleted.');
  } catch (err) { _lpSay(err.message || 'The delete failed. Try again.'); }
}

// Redraw what's on screen with the new play in it.
function _lpRefresh(bggId) {
  const modalOpen = document.getElementById('modal-overlay').classList.contains('open');
  if (modalOpen && bggId) {
    const g = findGameByBggId(bggId);
    if (g) { _modalTab = 'plays'; _modalTabFor = g.bggId; openModal(g); }
  }
  const stats = document.getElementById('stats-view');
  if (stats && stats.classList.contains('open') && typeof showStatsView === 'function') {
    showStatsView((typeof _viewingProfile !== 'undefined' && _viewingProfile) || _navPlayer());
  }
}

document.addEventListener('click', (e) => {
  const o = e.target.closest('[data-lp-open]');
  if (o) { e.preventDefault(); e.stopPropagation(); logPlayOpen(o.dataset.lpOpen); return; }
  const ed = e.target.closest('[data-lp-edit]');
  if (ed) { e.preventDefault(); e.stopPropagation(); logPlayEdit(ed.dataset.lpEdit); }
}, true);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && _lpOpen) _lpClose(); });
