// ── Live: new plays without reloading ──
// The plays logged in the app (plays/) and the BGStats uploads (importedPlays/)
// are followed as they change (Firebase's event stream: the whole node on
// connecting, then each change); a game a new play brings (importedGames/) is
// read once when it comes. What changed is merged into PLAY_HISTORY the way
// the start-up merge does it, and the screen that's open is drawn again where
// it was; with a game page or a form open, that waits until it's closed. A
// phone stops the stream in the background, so coming back opens it again
// and catches up.
// Firebase answers over HTTP/1.1, and a browser opens at most 6 connections
// to one server for all the tabs of a site together, each stream keeping one
// for as long as it's open: with every tab streaming, two tabs left nothing
// for a rating or a backing, which waited for ever. So one tab follows the
// streams (the first one open, then the next when it closes) and passes on
// what comes to the others.
// A new version of the app (a deploy) is noticed when it comes back to the
// front after a while: it reloads by itself when nothing is open, else it
// offers to. The app added to the Home Screen has no reload button, so there
// a pull down at the top reloads it.

const LIVE_NODES = ['importedPlays', 'plays'];
let _playsRev = 0;            // bumped on every live change (js/play-time.js _ptSig: caches redo)
const _liveStreams = {};
let _liveDirty = false, _liveNew = 0, _liveHiddenAt = 0;
let _liveOn = false, _liveLead = false, _liveAsked = false;
const _liveChan = typeof BroadcastChannel === 'function' ? new BroadcastChannel('bgl-live') : null;
const _liveShared = () => !!(_liveChan && navigator.locks);

function liveStart() {
  if (typeof EventSource === 'undefined' || !FIREBASE_DB) return;
  _liveOn = true;
  if (_liveShared() && !_liveLead) {
    // held until this tab closes; meanwhile another tab's streams come in by _liveChan
    if (!_liveAsked) { _liveAsked = true; navigator.locks.request('bgl-live', () => { _liveLead = true; liveStart(); return new Promise(() => {}); }); }
    return;
  }
  for (const node of LIVE_NODES) {
    const old = _liveStreams[node];
    if (old && old.readyState !== 2) continue;   // still open (or reconnecting by itself)
    _liveOpen(node);
  }
}
function _liveOpen(node) {
  if (_liveStreams[node]) _liveStreams[node].close();
  const es = new EventSource(`${FIREBASE_DB}/${node}.json`);
  const on = (kind) => (ev) => {
    let msg = null;
    try { msg = JSON.parse(ev.data); } catch (_) {}
    if (!msg || typeof msg.path !== 'string') return;
    _liveApply(node, kind, msg.path, msg.data);
    if (_liveLead) _liveChan.postMessage({ node, kind, path: msg.path, data: msg.data });
  };
  es.addEventListener('put', on('put'));
  es.addEventListener('patch', on('patch'));
  es.addEventListener('cancel', () => es.close());
  _liveStreams[node] = es;
}
function _liveRestart() {
  if (_liveShared() && !_liveLead) return liveStart();
  for (const node of LIVE_NODES) if (_liveStreams[node]) _liveStreams[node].close();
  for (const node of LIVE_NODES) _liveOpen(node);
}
// The tab that follows the streams passes each change on (once this tab has
// its own copy of the plays: the start-up read comes first).
if (_liveChan) _liveChan.onmessage = (ev) => {
  const m = ev.data;
  if (_liveOn && !_liveLead && m && LIVE_NODES.includes(m.node)) _liveApply(m.node, m.kind, m.path, m.data);
};

// What each node held when it was last read, as it came (the merge rewrites
// names and places in the copies it keeps): a change is told apart from that.
const _liveSeen = { importedPlays: new Map(), plays: new Map(), importedGames: new Map() };
function liveRemember(node, data) {
  const seen = _liveSeen[node];
  if (!seen) return;
  seen.clear();
  for (const k in data || {}) seen.set(k, JSON.stringify(data[k]));
}
function _liveApply(node, kind, path, data) {
  const seen = _liveSeen[node];
  const parts = path.split('/').filter(Boolean);
  const changed = new Map(), gone = new Set();   // key → its value now
  const setKey = (k, v) => {
    if (node === 'plays' && _liveKeptHere(k)) return;   // ours, waiting to send: the database's is older
    if (v == null) { if (seen.has(k)) { seen.delete(k); gone.add(k); } return; }
    const j = JSON.stringify(v);
    if (seen.get(k) !== j) { seen.set(k, j); changed.set(k, v); }
  };
  const current = (k) => (seen.has(k) ? JSON.parse(seen.get(k)) : {});
  if (!parts.length) {
    if (kind === 'put') {   // the whole node: on connecting, or catching up after the background
      const all = data || {};
      if (node !== 'importedGames') for (const k of [...seen.keys()]) if (!(k in all)) setKey(k, null);
      for (const k in all) setKey(k, all[k]);
    } else {
      for (const k in data || {}) setKey(k, data[k]);
    }
  } else {
    const k = parts[0];
    if (parts.length === 1) setKey(k, kind === 'put' ? data : { ...current(k), ...(data || {}) });
    else {
      const copy = current(k);
      let o = copy;
      for (const p of parts.slice(1, -1)) o = (o[p] = o[p] && typeof o[p] === 'object' ? o[p] : {});
      const last = parts[parts.length - 1];
      if (kind === 'put') { if (data == null) delete o[last]; else o[last] = data; } else o[last] = { ...(o[last] || {}), ...(data || {}) };
      setKey(k, copy);
    }
  }
  if (changed.size || gone.size) _liveMerge(node, changed, gone);
}
// A play logged here without signal and not sent yet (js/log-play.js), or an
// edit of one that's waiting: the database doesn't have it yet.
function _liveKeptHere(k) {
  return String(k).startsWith('local-') || (typeof _lpQueue === 'function' && _lpQueue().some(x => x.key === k));
}

function _liveMerge(node, changed, gone) {
  let added = 0;
  const countBefore = () => { let n = 0; for (const id in PLAY_HISTORY) n += PLAY_HISTORY[id].length; return n; };
  const before = countBefore();
  if (node === 'importedPlays') {
    for (const uuid of gone) {
      delete importedPlaysCache[uuid];
      for (const id in PLAY_HISTORY) {
        const i = PLAY_HISTORY[id].findIndex(e => e._uuid === uuid);
        if (i >= 0) PLAY_HISTORY[id].splice(i, 1);
      }
    }
    for (const [uuid, p] of changed) { importedPlaysCache[uuid] = p; _mergePlayIntoHistory(uuid, p); }
  } else if (node === 'plays') {
    for (const id of gone) { delete manualPlaysCache[id]; if (typeof _lpUnmerge === 'function') _lpUnmerge(id); }
    for (const [id, p] of changed) manualPlaysCache[id] = p;
  } else {
    // a game an upload brought: added, never taken away (the list also holds games from elsewhere)
    for (const [id, g] of changed) if (!EXTRA_GAMES[id]) EXTRA_GAMES[id] = g;
  }
  // the app's own plays pair with the BGStats copies afresh, as at start-up
  if (node !== 'importedGames' && typeof mergeManualPlays === 'function') mergeManualPlays();
  if (node !== 'importedGames' && [...changed.values()].some(p => p && p.bggId && !findGameByBggId(p.bggId))) _liveGamesSoon();
  _sortPlayHistory();
  added = Math.max(0, countBefore() - before);
  _playsRev++;
  _liveNew += added;
  _liveDirty = true;
  _liveSoon();
}

// A game the app hadn't seen came with a play: its name and cover are in importedGames.
let _liveGamesTimer = null;
function _liveGamesSoon() {
  clearTimeout(_liveGamesTimer);
  _liveGamesTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${FIREBASE_DB}/importedGames.json`);
      if (res.ok) _liveApply('importedGames', 'put', '/', await res.json());
    } catch (_) { /* no signal: the next start-up reads them */ }
  }, 1000);
}

// ── Drawing the screen again ──
let _liveTimer = null;
function _liveSoon() {
  clearTimeout(_liveTimer);
  _liveTimer = setTimeout(_liveRedraw, 500);
}
function _liveBusy() {
  const open = (id) => { const el = document.getElementById(id); return !!(el && el.classList.contains('open')); };
  return (typeof _navModalOpen === 'function' && _navModalOpen()) || (typeof _navOpenOverlays === 'function' && _navOpenOverlays().length > 0)
    || open('picker-overlay');
}
function _liveRedraw() {
  if (!_liveDirty) return;
  if (document.hidden || _liveBusy()) { _liveTimer = setTimeout(_liveRedraw, 1500); return; }   // when it's closed
  _liveDirty = false;
  const y = window.scrollY;
  redrawOpenViews();
  window.scrollTo(0, y);
  if (_liveNew > 0 && typeof _acctToast === 'function') _acctToast(_liveNew === 1 ? 'A new play came in.' : `${_liveNew} new plays came in.`);
  _liveNew = 0;
}
// Every view that's open, drawn again with the plays as they are now.
function redrawOpenViews() {
  const isOpen = (id) => { const el = document.getElementById(id); return !!(el && el.classList.contains('open')); };
  const player = localStorage.getItem('bgl-player');
  const visiting = typeof _viewingProfile !== 'undefined' && _viewingProfile;
  try {
    const lib = document.getElementById('library-view');
    if (lib && lib.style.display !== 'none' && !isOpen('stats-view') && typeof renderShelf === 'function') renderShelf();
    if (isOpen('stats-view') && (visiting || player)) showStatsView(visiting || player, visiting ? 'visiting' : undefined);
    if (isOpen('games-view') && typeof showGamesView === 'function') showGamesView();
    if (isOpen('leaderboard-view') && typeof showLeaderboardView === 'function') showLeaderboardView();
    if (isOpen('achievements-view') && player && typeof showAchievementsView === 'function') showAchievementsView(player);
    if (isOpen('challenges-view') && player && typeof showChallengesView === 'function') showChallengesView(player);
    if (isOpen('boardsouth-view') && typeof showBoardSouthView === 'function') showBoardSouthView();
    if (isOpen('ilioupoli-view') && typeof showIlioupoliView === 'function') showIlioupoliView();
    if (isOpen('backed-view') && typeof showBackedView === 'function') showBackedView();
  } catch (e) { console.warn('Redrawing after new plays:', e); }
}

// ── Coming back to the app ──
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { _liveHiddenAt = Date.now(); return; }
  const away = _liveHiddenAt ? Date.now() - _liveHiddenAt : 0;
  // a phone drops the stream in the background: open it again (it catches up)
  if (away > 30e3) _liveRestart(); else liveStart();
  if (away > 60e3) _liveCheckVersion(away);
  if (_liveDirty) _liveSoon();
});

// A newer version of the app: the page on the server references other files
// (each stamped with its own version) than the ones running here.
function _liveStamps(html) {
  return [...String(html).matchAll(/(?:src|href)="([^"]+\?v=[0-9a-f]+)"/g)].map(m => m[1]).sort().join('|');
}
let _liveUpdateShown = false;
async function _liveCheckVersion(away) {
  try {
    const res = await fetch(`./?check=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const theirs = _liveStamps(await res.text());
    const ours = _liveStamps(document.documentElement.outerHTML);
    if (!theirs || theirs === ours) return;
    if (away > 10 * 60e3 && !_liveBusy()) { location.reload(); return; }   // like opening the app afresh
    if (_liveUpdateShown) return;
    _liveUpdateShown = true;
    const bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'live-update';
    bar.textContent = 'A new version of the app is ready · Reload';
    bar.addEventListener('click', () => location.reload());
    document.body.appendChild(bar);
    setTimeout(() => bar.classList.add('show'), 50);
    setTimeout(() => { bar.classList.remove('show'); setTimeout(() => bar.remove(), 400); _liveUpdateShown = false; }, 15000);
  } catch (_) { /* no signal: next time */ }
}

// ── Pull down at the top to reload (the Home Screen app has no reload button) ──
(function livePull() {
  const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  if (!standalone || !('ontouchstart' in window)) return;
  const PULL = 110;
  let startY = null, dy = 0;
  const tip = document.createElement('div');
  tip.className = 'live-pull';
  tip.innerHTML = '<span class="live-pull-ico" aria-hidden="true">&#8635;</span><span class="live-pull-text">Pull to reload</span>';
  document.body.appendChild(tip);
  const text = tip.querySelector('.live-pull-text');
  const reset = () => { startY = null; dy = 0; tip.classList.remove('show', 'ready'); tip.style.transform = ''; };
  window.addEventListener('touchstart', (e) => {
    const field = e.target && e.target.closest && e.target.closest('input, textarea, select');
    startY = window.scrollY <= 0 && e.touches.length === 1 && !_liveBusy() && !field ? e.touches[0].clientY : null;
    dy = 0;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (startY == null) return;
    if (window.scrollY > 0) { reset(); return; }
    dy = e.touches[0].clientY - startY;
    if (dy < 20) { tip.classList.remove('show', 'ready'); return; }
    tip.classList.add('show');
    tip.classList.toggle('ready', dy > PULL);
    text.textContent = dy > PULL ? 'Release to reload' : 'Pull to reload';
    tip.style.transform = `translate(-50%, ${Math.min(dy, PULL + 30) * 0.5}px)`;
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (startY != null && dy > PULL) { text.textContent = 'Reloading…'; location.reload(); return; }
    reset();
  }, { passive: true });
  window.addEventListener('touchcancel', reset, { passive: true });
})();
