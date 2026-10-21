// ── Crowdfunding together ──
// backing/{bggId}/{uid} = { s: 'backed' | 'interested', at, name, img, url, on, ends, ver, rel, arrived }
// A signed-in person marks a live campaign Interested or Backed (Trending), so
// the group sees who's in before it ends. Trending → Backed lists everything
// someone backed, with when it should arrive: BGG's release month for the
// campaign's edition (tools/fetch-hot.py keeps it fresh in data/bgg-hot.js
// 'backed'), or the month the backer set when BGG has none. It counts as
// arrived once the backer says so, or once it's in their collection.

let _backing = null;        // bggId → { uid → entry }
let _backNames = {};        // uid → name, from users/
let _backingLoading = null;

function loadBacking(force) {
  if (_backing && !force) return Promise.resolve(_backing);
  if (!_backingLoading || force) {
    _backingLoading = Promise.all([
      fetch(`${FIREBASE_DB}/backing.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${FIREBASE_DB}/users.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([b, users]) => {
      _backing = b || {};
      _backNames = {};
      for (const uid in users || {}) if (users[uid] && users[uid].name) _backNames[uid] = users[uid].name;
      return _backing;
    }).finally(() => { _backingLoading = null; });
  }
  return _backingLoading;
}

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
  await acctWrite(path, 'PUT', e);
  ((_backing[id] = _backing[id] || {}))[a.uid] = e;
}

// ── When it should arrive ──
// BGG's month for the edition (fresh), else the month saved with the backing.
function backingRelease(id, e) {
  const fresh = typeof _hot !== 'undefined' && _hot && _hot.backed && _hot.backed[id];
  const g = typeof _hot !== 'undefined' && _hot && (_hot.games || []).find(x => x.id === Number(id));
  const rel = (e && e.relMine) || (fresh && fresh.rel) || (g && g.camp && g.camp.rel) || (e && e.rel) || '';
  const st = (fresh && fresh.relst) || (g && g.camp && g.camp.relst) || '';
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
  const name = e.who;
  const lists = { 'Στιβ': () => GAMES.some(g => g.bggId === Number(id)), 'Δημητρης': () => typeof DIMITRIS_GAMES !== 'undefined' && !!DIMITRIS_GAMES[id],
    'Γιαννης Φωτοπουλος': () => typeof GIANNIS_GAMES !== 'undefined' && !!GIANNIS_GAMES[id], 'LGeorge': () => typeof LGEORGE_GAMES !== 'undefined' && !!LGEORGE_GAMES[id] };
  if (lists[name] && lists[name]()) return true;
  const user = typeof BGG_USERS !== 'undefined' && BGG_USERS[name];
  const C = typeof BGG_COLLECTIONS !== 'undefined' ? BGG_COLLECTIONS : {};
  if (user && C[user] && C[user][id]) return true;
  const a = typeof acctMe === 'function' ? acctMe() : null;
  return !!(a && e.uid === a.uid && typeof myLibHas === 'function' && myLibHas(id));
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
    let status = '';
    if (backed.length) {
      const arrived = backed.filter(e => _backingHas(e, id));
      const { rel, st } = backingRelease(id, mine && mine.s === 'backed' ? mine : backed[0]);
      const cd = backingCountdown(rel, st, backed[0].at);
      status = arrived.length === backed.length
        ? '<div class="bk-status arrived">&#10003; Arrived</div>'
        : `<div class="bk-status ${cd.cls}">${cd.text}${arrived.length ? ` &middot; arrived for ${arrived.map(e => esc(e.who)).join(', ')}` : ''}</div>
           ${cd.pct ? `<div class="bk-bar"><i style="width:${cd.pct}%"></i></div>` : ''}`;
    }
    const camp = live ? `<span class="bk-live">${HOT_PLATFORMS[g.camp.on] || 'Campaign'} &middot; ${_hotEnds(g.camp)}</span>` : (first.on ? `<span class="bk-ended">${HOT_PLATFORMS[first.on] || 'Campaign'} ended</span>` : '');
    const tools = mine && mine.s === 'backed' ? `<div class="bk-tools">
        ${!backingRelease(id, mine).rel || mine.relMine ? `<label class="bk-month">Due <input type="month" value="${esc(mine.relMine || '')}" data-bk-month="${id}" aria-label="When it's due"></label>` : ''}
        <button type="button" class="lp-textbtn" data-bk-arrived="${id}">${mine.arrived ? 'Not arrived yet' : 'It arrived'}</button>
      </div>` : '';
    return `<div class="bk-item" data-bk-open="${id}">
        <img class="bk-cover" src="${esc(img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="bk-info">
          <b>${esc(name)}</b>
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

// The month a backer sets when BGG has none, and "it arrived".
async function setBackingMonth(id, month) {
  const a = acctMe();
  const mine = myBacking(id);
  if (!a || !mine) return;
  const v = /^\d{4}-\d{2}$/.test(month) ? month : '';
  await acctWrite(`backing/${id}/${a.uid}/relMine`, v ? 'PUT' : 'DELETE', v || undefined);
  if (v) mine.relMine = v; else delete mine.relMine;
}
async function setBackingArrived(id) {
  const a = acctMe();
  const mine = myBacking(id);
  if (!a || !mine) return;
  const v = !mine.arrived;
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
}, true);
document.addEventListener('change', async (e) => {
  const m = e.target.closest('[data-bk-month]');
  if (!m) return;
  try { await setBackingMonth(Number(m.dataset.bkMonth), m.value); } catch (err) { if (typeof _acctToast === 'function') _acctToast(err.message); }
  if (typeof backingRedraw === 'function') backingRedraw();
});
