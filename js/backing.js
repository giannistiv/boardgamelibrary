// ── Crowdfunding together ──
// backing/{bggId}/{uid} = { s: 'backed' | 'interested', at, name, img, url, on, ends, ver, rel, arrived }
// A signed-in person marks a live campaign Interested or Backed (Trending), so
// the group sees who's in before it ends. Trending → Backed lists everything
// someone backed, with when it should arrive: BGG's release month for the
// campaign's edition (tools/fetch-hot.py keeps it fresh in data/bgg-hot.js
// 'backed'), or the month the backer set when BGG has none. It counts as
// arrived once the backer says so, or once it's in their collection.
// data/backed.js adds backings given as a list (fixed: true until changed).

let _backing = null;        // bggId → { uid → entry }
let _backNames = {};        // uid → name, from users/
let _backPlayer = {};       // uid → the player they are (users/), for their profile
let _backFixed = {};        // bggId → its line in data/backed.js (for the pledge note)
let _backingLoading = null;
const BACKING_NOT_BGG = 9000000;   // ids from here up are made up (data/backed.js): no BGG page

function loadBacking(force) {
  if (_backing && !force) return Promise.resolve(_backing);
  if (!_backingLoading || force) {
    _backingLoading = Promise.all([
      fetch(`${FIREBASE_DB}/backing.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${FIREBASE_DB}/users.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null),
      fetch('data/backed.js', { cache: 'no-cache' }).then(r => (r.ok ? r.text() : '')).then(src => JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1))).catch(() => null),
    ]).then(([b, users, fixed]) => {
      _backing = b || {};
      _backNames = {};
      _backPlayer = {};
      for (const uid in users || {}) {
        if (users[uid] && users[uid].name) _backNames[uid] = users[uid].name;
        if (users[uid] && users[uid].player) _backPlayer[uid] = users[uid].player;
      }
      _backingAddFixed(fixed, users);
      return _backing;
    }).finally(() => { _backingLoading = null; });
  }
  return _backingLoading;
}

// The listed backings count as their player's until that player changes one
// in the app (then Firebase has it, and that wins).
function _backingAddFixed(fixed, users) {
  _backFixed = {};
  for (const player in fixed || {}) {
    if (!Array.isArray(fixed[player])) continue;
    const uid = Object.keys(users || {}).find(u => users[u] && users[u].player === player) || `player:${player}`;
    if (!_backNames[uid]) _backNames[uid] = player;
    if (!_backPlayer[uid]) _backPlayer[uid] = player;
    for (const f of fixed[player]) {
      _backFixed[f.id] = f;
      const people = (_backing[f.id] = _backing[f.id] || {});
      if (!people[uid]) people[uid] = { s: 'backed', at: Date.parse(f.at) || 0, name: f.name, img: f.img, url: f.url, on: f.on, relMine: f.rel, fixed: true };
    }
  }
}
// A listed backing isn't in Firebase yet: its first change saves all of it.
async function _backingPutWhole(id, a, mine, change) {
  const e = { ...mine };
  delete e.fixed;
  change(e);
  await acctWrite(`backing/${id}/${a.uid}`, 'PUT', e);
  _backing[id][a.uid] = e;
}
function backingOnBgg(id) { return Number(id) < BACKING_NOT_BGG; }

// Everyone in on a game: [{ uid, who, s, ... }], backers first.
function backingFor(id) {
  const people = (_backing && _backing[id]) || {};
  return Object.entries(people).filter(([, e]) => e && e.s)
    .map(([uid, e]) => ({ ...e, uid, who: _backNames[uid] || 'Someone' }))
    .sort((a, b) => (a.s === 'backed' ? 0 : 1) - (b.s === 'backed' ? 0 : 1) || a.at - b.at);
}
function myBacking(id) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  return a && _backing && _backing[id] ? _backing[id][a.uid] || null : null;
}

// ── On a campaign: the two buttons, and who's in ──
function backingWhoHtml(id) {
  const all = backingFor(id);
  if (!all.length) return '';
  const esc = _escapeHtml;
  const backed = all.filter(e => e.s === 'backed').map(e => esc(e.who));
  const watching = all.filter(e => e.s === 'interested').map(e => esc(e.who));
  return `<div class="bk-who">${backed.length ? `<span class="bk-pill bk-backed">&#10003; Backed: ${backed.join(', ')}</span>` : ''}${watching.length ? `<span class="bk-pill">&#9734; Interested: ${watching.join(', ')}</span>` : ''}</div>`;
}
function backingButtonsHtml(g) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  const who = backingWhoHtml(g.id);
  if (!a) return who;
  const mine = myBacking(g.id);
  const s = mine && mine.s;
  return `<div class="bk-row">
      <button type="button" class="bk-btn${s === 'interested' ? ' on' : ''}" data-bk="${g.id}|interested">${s === 'interested' ? '&#9733; Interested' : '&#9734; Interested'}</button>
      <button type="button" class="bk-btn bk-btn-back${s === 'backed' ? ' on' : ''}" data-bk="${g.id}|backed">${s === 'backed' ? '&#10003; Backed' : 'I backed it'}</button>
    </div>${who}`;
}

// Tap again to take it back.
async function setBacking(id, state) {
  const a = acctMe();
  if (!a) { if (typeof acctOpenSheet === 'function') acctOpenSheet(); return; }
  const g = (typeof _hot !== 'undefined' && _hot && (_hot.games || []).find(x => x.id === id)) || {};
  const mine = myBacking(id);
  const path = `backing/${id}/${a.uid}`;
  if (mine && mine.s === state) {
    if (mine.fixed) throw new Error('It\'s on your list of backed games in the app, so it stays in Backed.');
    await acctWrite(path, 'DELETE');
    delete _backing[id][a.uid];
    return;
  }
  const c = g.camp || {};
  const e = { s: state, at: (mine && mine.at) || Date.now(), name: g.name || (mine && mine.name) || `Game #${id}` };
  const opt = { img: g.img || (mine && mine.img), url: c.url || (mine && mine.url), on: c.on || (mine && mine.on), ends: c.ends || (mine && mine.ends),
    ver: c.ver || (mine && mine.ver), rel: (mine && mine.rel) || c.rel };
  for (const k in opt) if (opt[k]) e[k] = String(opt[k]).slice(0, k === 'name' ? 200 : 500);
  if (mine && mine.arrived) e.arrived = true;
  if (mine && mine.relMine) e.relMine = mine.relMine;
  await acctWrite(path, 'PUT', e);
  ((_backing[id] = _backing[id] || {}))[a.uid] = e;
}

// ── When it should arrive ──
// The backer's own month, else BGG's for the edition (fresh), else the month
// saved with the backing. BGG's "released" only counts with BGG's month: a
// game in shops can still be on its way to backers.
function backingRelease(id, e) {
  const fresh = typeof _hot !== 'undefined' && _hot && _hot.backed && _hot.backed[id];
  const g = typeof _hot !== 'undefined' && _hot && (_hot.games || []).find(x => x.id === Number(id));
  const rel = (e && e.relMine) || (fresh && fresh.rel) || (g && g.camp && g.camp.rel) || (e && e.rel) || '';
  const st = e && e.relMine ? '' : (fresh && fresh.relst) || (g && g.camp && g.camp.relst) || '';
  return { rel, st };
}
const _bkMonth = (y, m) => new Date(y, m - 1, 1).toLocaleString('en', { month: 'short', year: 'numeric' });
function backingCountdown(rel, st, from) {
  if (st === 'released') return { text: 'Out now', cls: 'due', pct: 100 };
  if (!rel) return { text: 'No release date yet', cls: '', pct: 0 };
  const [y, m] = rel.split('-').map(Number);
  const now = new Date();
  const cur = now.getFullYear() * 12 + now.getMonth();
  if (!m) {
    const text = y > now.getFullYear() ? `Due in ${y}` : y === now.getFullYear() ? 'Due this year' : `Was due in ${y}`;
    return { text, cls: y < now.getFullYear() ? 'late' : '', pct: 0 };
  }
  const due = y * 12 + (m - 1), diff = due - cur, label = _bkMonth(y, m);
  const start = from ? new Date(from) : null;
  const span = start ? due - (start.getFullYear() * 12 + start.getMonth()) : 0;
  const pct = span > 0 ? Math.max(0, Math.min(100, Math.round(((span - Math.max(0, diff)) / span) * 100))) : 0;
  if (diff > 1) return { text: `Due ${label} &middot; in ${diff} months`, cls: '', pct };
  if (diff === 1) return { text: `Due ${label} &middot; next month`, cls: 'soon', pct };
  if (diff === 0) return { text: `Due this month (${label})`, cls: 'due', pct: 100 };
  return { text: `Was due ${label} &middot; ${-diff} month${-diff > 1 ? 's' : ''} late`, cls: 'late', pct: 100 };
}
// In the backer's collection by now (their shelf, BGG collection or My games).
function _backingHas(e, id) {
  if (e.arrived) return true;
  const name = _bkPlayerOf(e.uid) || e.who;
  const lists = { 'Στιβ': () => GAMES.some(g => g.bggId === Number(id)), 'Δημητρης': () => typeof DIMITRIS_GAMES !== 'undefined' && !!DIMITRIS_GAMES[id],
    'Γιαννης Φωτοπουλος': () => typeof GIANNIS_GAMES !== 'undefined' && !!GIANNIS_GAMES[id], 'LGeorge': () => typeof LGEORGE_GAMES !== 'undefined' && !!LGEORGE_GAMES[id] };
  if (lists[name] && lists[name]()) return true;
  const user = typeof BGG_USERS !== 'undefined' && BGG_USERS[name];
  const C = typeof BGG_COLLECTIONS !== 'undefined' ? BGG_COLLECTIONS : {};
  if (user && C[user] && C[user][id]) return true;
  const a = typeof acctMe === 'function' ? acctMe() : null;
  return !!(a && e.uid === a.uid && typeof myLibHas === 'function' && myLibHas(id));
}

// The player a backer is, as the app shows them now (a rename changes it).
function _bkPlayerOf(uid) {
  const p = _backPlayer[uid];
  return p && typeof _acctDisplay === 'function' ? _acctDisplay(p) : p;
}
// How far along a backed game is, for the backers given (all arrived, or the countdown).
function _bkStatusHtml(id, backed, rel) {
  const esc = _escapeHtml;
  const arrived = backed.filter(e => _backingHas(e, id));
  if (arrived.length === backed.length) return '<div class="bk-status arrived">&#10003; Arrived</div>';
  const cd = backingCountdown(rel.rel, rel.st, backed[0].at);
  return `<div class="bk-status ${cd.cls}">${cd.text}${arrived.length ? ` &middot; arrived for ${arrived.map(e => esc(e.who)).join(', ')}` : ''}</div>
     ${cd.pct ? `<div class="bk-bar"><i style="width:${cd.pct}%"></i></div>` : ''}`;
}
// The backer's own controls: the month (when BGG has none, or they set one) and "It arrived".
function _bkToolsHtml(id, mine) {
  if (!mine || mine.s !== 'backed') return '';
  return `<div class="bk-tools">
      ${!backingRelease(id, mine).rel || mine.relMine ? `<label class="bk-month">Due <input type="month" value="${_escapeHtml(mine.relMine || '')}" data-bk-month="${id}" aria-label="When it's due"></label>` : ''}
      <button type="button" class="lp-textbtn" data-bk-arrived="${id}">${mine.arrived ? 'Not arrived yet' : 'It arrived'}</button>
    </div>`;
}

// ── Trending → Backed: what the group backed, and what it's watching ──
function backedCount() {
  if (!_backing) return 0;
  return Object.keys(_backing).filter(id => backingFor(id).length).length;
}
function backedListHtml() {
  const esc = _escapeHtml;
  const a = typeof acctMe === 'function' ? acctMe() : null;
  const ids = Object.keys(_backing || {}).filter(id => backingFor(id).length);
  const row = (id) => {
    const all = backingFor(id);
    const first = all[0];
    const backed = all.filter(e => e.s === 'backed');
    const mine = a && all.find(e => e.uid === a.uid);
    const g = typeof _hot !== 'undefined' && _hot && (_hot.games || []).find(x => x.id === Number(id));
    const live = g && typeof _hotLive === 'function' && _hotLive(g);
    const img = (g && g.img) || first.img || '';
    const name = (g && g.name) || first.name;
    const note = _backFixed[id] && _backFixed[id].note;
    const status = backed.length ? _bkStatusHtml(id, backed, backingRelease(id, mine && mine.s === 'backed' ? mine : backed[0])) : '';
    const camp = live ? `<span class="bk-live">${HOT_PLATFORMS[g.camp.on] || 'Campaign'} &middot; ${_hotEnds(g.camp)}</span>` : (first.on ? `<span class="bk-ended">${HOT_PLATFORMS[first.on] || 'Campaign'} ended</span>` : '');
    const tools = _bkToolsHtml(id, mine);
    return `<div class="bk-item" data-bk-open="${id}">
        <img class="bk-cover" src="${esc(img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="bk-info">
          <b>${esc(name)}</b>
          ${note ? `<div class="bk-note">${esc(note)}</div>` : ''}
          <div class="bk-meta">${camp}</div>
          ${backingWhoHtml(id)}
          ${status}
          ${tools}
        </div>
      </div>`;
  };
  const backedIds = ids.filter(id => backingFor(id).some(e => e.s === 'backed'));
  const watchIds = ids.filter(id => !backingFor(id).some(e => e.s === 'backed'));
  const due = (id) => { const r = backingRelease(id, backingFor(id)[0]).rel || '9999'; return r.length === 4 ? r + '-12' : r; };
  backedIds.sort((x, y) => due(x).localeCompare(due(y)));
  watchIds.sort((x, y) => String(backingFor(x)[0].ends || '9').localeCompare(String(backingFor(y)[0].ends || '9')));
  if (!ids.length) {
    return `<div class="stats-player-sub gb-empty">Nothing backed yet. On a live campaign, tap <b>I backed it</b> or <b>Interested</b>: the group sees it here, with a countdown to when it arrives.</div>`;
  }
  return `${backedIds.length ? `<div class="hot-sec">Backed &middot; ${backedIds.length}</div>${backedIds.map(row).join('')}` : ''}
    ${watchIds.length ? `<div class="hot-sec">Watching &middot; ${watchIds.length}</div>${watchIds.map(row).join('')}` : ''}`;
}

// ── A player's profile: only the games they backed ──
// On the way first (soonest due), then the ones that came. Someone else's
// profile shows theirs too; only your own has the month and "It arrived".
function backedProfile(name) {
  if (!_backing) return null;
  const esc = _escapeHtml;
  const a = typeof acctMe === 'function' ? acctMe() : null;
  const uids = Object.keys(_backPlayer).filter(uid => _bkPlayerOf(uid) === name);
  const rows = [];
  for (const id in _backing) {
    const uid = uids.find(u => _backing[id][u] && _backing[id][u].s === 'backed');
    if (!uid) continue;
    const e = { ..._backing[id][uid], uid, who: _backNames[uid] || name };
    const rel = backingRelease(id, e);
    rows.push({ id, e, rel, came: _backingHas(e, id), due: rel.rel ? (rel.rel.length === 4 ? `${rel.rel}-12` : rel.rel) : '9999' });
  }
  if (!rows.length) return null;
  rows.sort((x, y) => (x.came - y.came) || x.due.localeCompare(y.due));
  const row = ({ id, e, rel }) => {
    const g = typeof _hot !== 'undefined' && _hot && (_hot.games || []).find(x => x.id === Number(id));
    const note = _backFixed[id] && _backFixed[id].note;
    const others = backingFor(id).filter(o => o.s === 'backed' && !uids.includes(o.uid)).map(o => esc(o.who));
    const meta = [e.on ? HOT_PLATFORMS[e.on] || '' : '', others.length ? `also backed by ${others.join(', ')}` : ''].filter(Boolean).join(' &middot; ');
    return `<div class="bk-item" data-bk-prof-open="${id}">
        <img class="bk-cover" src="${esc((g && g.img) || e.img || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="bk-info">
          <b>${esc((g && g.name) || e.name)}</b>
          ${note ? `<div class="bk-note">${esc(note)}</div>` : ''}
          ${meta ? `<div class="bk-meta">${meta}</div>` : ''}
          ${_bkStatusHtml(id, [e], rel)}
          ${a && a.uid === e.uid ? _bkToolsHtml(id, _backing[id][e.uid]) : ''}
        </div>
      </div>`;
  };
  const coming = rows.filter(r => !r.came), came = rows.filter(r => r.came);
  const next = coming.find(r => r.rel.rel);
  const nextLabel = next ? (next.rel.rel.length === 4 ? next.rel.rel : _bkMonth(...next.rel.rel.split('-').map(Number))) : '';
  const summary = [coming.length ? `${coming.length} on the way` : '', nextLabel ? `next ${nextLabel}` : '', came.length ? `${came.length} arrived` : ''].filter(Boolean).join(' &middot; ');
  return { summary, html: `<div class="stats-section bk-prof">
      <div class="stats-section-title">Backed</div>
      ${coming.map(row).join('')}
      ${came.length ? `<div class="hot-sec">Arrived &middot; ${came.length}</div>${came.map(row).join('')}` : ''}
    </div>` };
}
// The profile draws a spot for it; it fills once the backings have loaded.
function backingProfileFill(root) {
  const els = (root || document).querySelectorAll('[data-bk-prof]');
  if (els.length) loadBacking().then(() => els.forEach(_bkProfRender)).catch(() => {});
}
function _bkProfRender(el) {
  const p = backedProfile(el.dataset.bkProf);
  el.hidden = !p;
  el.innerHTML = p && typeof _pcFold === 'function' ? _pcFold('backed', 'Backed', p.summary, p.html) : p ? p.html : '';
  if (p && typeof _wirePcFolds === 'function') _wirePcFolds(el);
}
const _bkProfRedraw = () => document.querySelectorAll('[data-bk-prof]').forEach(_bkProfRender);
document.addEventListener('click', (e) => {
  const row = e.target.closest('[data-bk-prof-open]');
  if (row && !e.target.closest('button, input, label, a') && typeof openBackedGame === 'function') openBackedGame(Number(row.dataset.bkProfOpen));
});

// The month a backer sets when BGG has none, and "it arrived".
async function setBackingMonth(id, month) {
  const a = acctMe();
  const mine = myBacking(id);
  if (!a || !mine) return;
  const v = /^\d{4}-\d{2}$/.test(month) ? month : '';
  if (mine.fixed) return _backingPutWhole(id, a, mine, e => { if (v) e.relMine = v; else delete e.relMine; });
  await acctWrite(`backing/${id}/${a.uid}/relMine`, v ? 'PUT' : 'DELETE', v || undefined);
  if (v) mine.relMine = v; else delete mine.relMine;
}
async function setBackingArrived(id) {
  const a = acctMe();
  const mine = myBacking(id);
  if (!a || !mine) return;
  const v = !mine.arrived;
  if (mine.fixed) return _backingPutWhole(id, a, mine, e => { if (v) e.arrived = true; else delete e.arrived; });
  await acctWrite(`backing/${id}/${a.uid}/arrived`, v ? 'PUT' : 'DELETE', v || undefined);
  if (v) mine.arrived = true; else delete mine.arrived;
}

// Clicks anywhere (Trending's list and the game sheet). Caught before the
// card's own click, which opens the sheet.
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-bk], [data-bk-arrived]');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  if (b.disabled) return;
  b.disabled = true;
  try {
    if (b.dataset.bk) {
      const [id, state] = b.dataset.bk.split('|');
      await setBacking(Number(id), state);
    } else {
      await setBackingArrived(Number(b.dataset.bkArrived));
    }
  } catch (err) { if (typeof _acctToast === 'function') _acctToast(err.message); }
  b.disabled = false;
  if (typeof backingRedraw === 'function') backingRedraw();
  _bkProfRedraw();
}, true);
document.addEventListener('change', async (e) => {
  const m = e.target.closest('[data-bk-month]');
  if (!m) return;
  try { await setBackingMonth(Number(m.dataset.bkMonth), m.value); } catch (err) { if (typeof _acctToast === 'function') _acctToast(err.message); }
  if (typeof backingRedraw === 'function') backingRedraw();
  _bkProfRedraw();
});
