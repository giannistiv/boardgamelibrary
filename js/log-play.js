// ── Log a play: a signed-in person records a play in the app ──
// plays/{id} = { bggId, date, t, d, l, b, c, sc: [{n, s, w, r}], by, at }
// (by: their uid; the database rules let only them, or Στιβ, change it).
// The plays join PLAY_HISTORY like a BGStats import's, so every page counts
// them, unless the same play is there already from a BGStats file (same
// game, day and players): the file's copy wins. Names are saved as the
// players' original names, so a rename in Profile settings follows them.
// Without signal the play is kept on the phone (LP_QUEUE) and shows as
// waiting to send until it goes up; saving one says what it did (js/play-moments.js).

let manualPlaysCache = {};   // id → the play as saved (and any waiting to send: pending)

async function loadManualPlays() {
  try {
    const res = await fetch(`${FIREBASE_DB}/plays.json`);   // on a slow connection the last copy (sw.js); js/live.js brings what changed
    manualPlaysCache = (res.ok && await res.json()) || {};
  } catch (e) {
    manualPlaysCache = {};
  }
  if (typeof liveRemember === 'function') liveRemember('plays', manualPlaysCache);   // as it came (js/live.js)
  for (const it of _lpQueue()) manualPlaysCache[it.key] = { ...it.rec, pending: true };   // logged without signal
}
// After the BGStats plays have merged (boot.js), and again after an upload
// brings more: oldest first, so each pairs with its own BGStats copy.
function mergeManualPlays() {
  for (const id in manualPlaysCache) _lpUnmerge(id);
  Object.keys(manualPlaysCache)
    .sort((x, y) => String(manualPlaysCache[x].t || '').localeCompare(String(manualPlaysCache[y].t || '')))
    .forEach(id => _lpMerge(id, manualPlaysCache[id]));
}
// A logged play hidden because a BGStats file has the same play: that copy,
// so each BGStats play stands in for one logged play only.
const _lpTwin = new Map();      // logged play id → the BGStats play it matched
const _lpTaken = new Set();     // BGStats plays already matched

function _lpEntry(id, p) {
  const sc = (Array.isArray(p.sc) ? p.sc : Object.values(p.sc || {})).filter(s => s && s.n).map(s => {
    const o = { n: NAME_MAP[s.n] || s.n, s: s.s == null ? '' : String(s.s), w: !!s.w };
    if (s.r) o.r = s.r;
    if (s.tm) o.tm = String(s.tm);
    return o;
  });
  const e = { date: p.date, t: p.t || `${p.date} 20:00:00`, e: p.t || `${p.date} 20:00:00`, sc, mp: id, by: p.by };
  if (p.d) e.d = p.d;
  if (p.b) e.b = p.b;
  if (p.l) e.l = typeof canonLocation === 'function' ? canonLocation(p.l, p.date) : p.l;
  if (p.c) e.c = p.c;
  const x = Array.isArray(p.x) ? p.x : Object.values(p.x || {});
  if (x.length) e.x = x.map(Number);   // the expansions (js/play-extras.js)
  if (p.ss) e.ss = p.ss;               // the score sheet, for the points by category
  if (p.pending) e.pending = true;
  return e;
}
function _lpUnmerge(id) {
  const tw = _lpTwin.get(id);
  if (tw) { _lpTaken.delete(tw); _lpTwin.delete(id); }
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
  // the same play from a BGStats file (samePlay: scores, results, scenarios
  // agree), one not already standing in for another logged play; the nearest
  // in time when several fit. Two games in one evening stay two.
  const when = (x) => Date.parse(String(x.t || x.date).replace(' ', 'T')) || 0;
  const twin = arr.filter(e => !e.mp && !_lpTaken.has(e) && samePlay(e, entry))
    .sort((x, y) => Math.abs(when(x) - when(entry)) - Math.abs(when(y) - when(entry)))[0];
  if (twin) { _lpTaken.add(twin); _lpTwin.set(id, twin); return; }
  arr.push(entry);
}

// Who may change a logged play here: whoever logged it, and Στιβ (the rules decide in the end).
function _lpCanEdit(play) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  return !!(a && play && play.mp && (play.by === a.uid || _acctDisplay(a.player) === ACCT_OWNERS.stiv));
}

// ── Buttons ──
function logPlayBtnHtml(game, where) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a || (game && !(Number(game.bggId) > 0))) return '';   // a play is saved by the game's BGG id
  return `<button type="button" class="lp-open${where ? ' lp-open-' + where : ''}" data-lp-open="${game ? game.bggId : ''}">+ Log a play</button>`;
}
// ↻ on a play you were in: the same game and people again, today.
function logPlayAgainBtnHtml(bggId, idx, play) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  const me = a && _navPlayer();
  if (!me || !(Number(bggId) > 0) || idx < 0 || !play || !play.sc.some(s => s.n === me)) return '';
  return `<button type="button" class="lp-edit lp-again" data-lp-again="${Number(bggId)}|${idx}" title="Log this again" aria-label="Log this again"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4.5h-4.5"/></svg></button>`;
}
function logPlayEditBtnHtml(play) {
  if (!_lpCanEdit(play)) return '';
  return `<button type="button" class="lp-edit" data-lp-edit="${_escapeHtml(play.mp)}" title="Edit this play" aria-label="Edit this play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>`;
}

// ── The form ──
let _lp = null;          // what's being logged: { id, bggId, date, time, d, lenSet, l, b, c, sc: [{n, s, w, r}], roles, gameWon }
let _lpOpen = false;

const _lpPad = (n) => String(n).padStart(2, '0');
function _lpToday() { const d = new Date(); return `${d.getFullYear()}-${_lpPad(d.getMonth() + 1)}-${_lpPad(d.getDate())}`; }
function _lpNow() { const d = new Date(); return `${_lpPad(d.getHours())}:${_lpPad(d.getMinutes())}:${_lpPad(d.getSeconds())}`; }

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
// Where you play, the places you've been lately first.
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

// One tap for the people (the user, 5 Nov 2026: finding them was the slow,
// boring part): the tables you usually play at, a button each, and the people
// you play with as faces. Both are ranked for this play: whoever you played
// with that day first, then this game, this place, and how near the day your
// plays together were. Typing is for anyone else.
let _lpCrews = [];   // the tables on show, for their buttons
function _lpSuggest() {
  const me = _navPlayer();
  const hidden = (n) => typeof HIDDEN_PLAYERS !== 'undefined' && HIDDEN_PLAYERS.has(n);
  const inPlay = new Set(_lp.sc.map(p => p.n.toLowerCase()));
  const dateEl = document.getElementById('lp-date'), placeEl = document.getElementById('lp-l');
  const day = (dateEl && dateEl.value) || _lp.date;
  const place = String((placeEl ? placeEl.value : _lp.l) || '').trim().toLowerCase();
  const dayNo = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;
  const today = dayNo(day);
  const people = new Map(), crews = new Map();
  for (const id in PLAY_HISTORY) for (const p of PLAY_HISTORY[id]) {
    if (!p.date || (me && !p.sc.some(s => s.n === me))) continue;
    const others = p.sc.map(s => s.n).filter(n => n && n !== me && !hidden(n));
    if (!others.length) continue;
    // recent plays count most; this game's and this place's are remembered longer
    const gap = Math.abs(dayNo(p.date) - today);
    const long = Math.exp(-gap / 730);
    const w = Math.exp(-gap / 120) + (Number(id) === _lp.bggId ? 8 * long : 0)
      + (place && String(p.l || '').toLowerCase() === place ? 2 * long : 0) + (gap === 0 ? 1000 : 0);
    for (const n of others) people.set(n, (people.get(n) || 0) + w);
    if (others.length < 2) continue;
    const key = [...new Set(others)].sort().join('\n');
    const c = crews.get(key) || { names: key.split('\n'), score: 0, plays: 0, sameDay: false };
    c.score += w; c.plays++; c.sameDay = c.sameDay || gap === 0;
    crews.set(key, c);
  }
  const outCrews = [...crews.values()]
    .filter(c => c.plays >= 2 || c.sameDay)
    .filter(c => c.names.some(n => !inPlay.has(n.toLowerCase())))
    .sort((a, b) => b.score - a.score).slice(0, 2);
  const outPeople = [...people.entries()].filter(([n]) => !inPlay.has(n.toLowerCase()))
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(x => x[0]);
  if (me && !inPlay.has(me.toLowerCase())) outPeople.unshift(me);
  return { crews: outCrews, people: outPeople, day };
}
function _lpRenderSugg() {
  const box = document.getElementById('lp-sugg');
  if (!box) return;
  const esc = _escapeHtml;
  const { crews, people, day } = _lpSuggest();
  _lpCrews = crews;
  const face = (n) => `<span class="lp-avatar" aria-hidden="true">${avatarInner(n)}</span>`;
  box.innerHTML = crews.map((c, i) => `<button type="button" class="lp-crew" data-lp-crew="${i}">
      <span class="lp-crew-faces">${c.names.slice(0, 3).map(face).join('')}</span>
      <span class="lp-crew-names"><b>${esc(c.names.length > 4 ? c.names.slice(0, 3).join(', ') + ` +${c.names.length - 3}` : c.names.join(', '))}</b>
        <span>${c.sameDay ? (day === _lpToday() ? 'Earlier today' : 'Same day') : `${c.plays} plays together`}</span></span>
      <span class="lp-crew-add" aria-hidden="true">+</span>
    </button>`).join('')
    + (people.length ? `<div class="lp-who">${people.map(n => `<button type="button" class="lp-who-chip" data-lp-who="${esc(n)}">${face(n)}<span>${esc(n === _navPlayer() ? `${n} (you)` : n)}</span></button>`).join('')}</div>` : '');
  box.hidden = !crews.length && !people.length;
}
function _lpAddNames(names) {
  _lpSyncPlayers();
  for (const n of names) if (!_lp.sc.some(p => p.n.toLowerCase() === n.toLowerCase())) _lp.sc.push({ n, s: '', w: false, r: '' });
  _lpRenderPlayers();
  _lpRenderLen();
  _lpSay('');
}

function logPlayOpen(bggId) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a) { if (typeof acctOpenSheet === 'function') acctOpenSheet(); return; }
  const me = _navPlayer();
  _lp = { id: null, bggId: Number(bggId) || 0, date: _lpToday(), time: _lpNow(), d: '', lenSet: false, l: _lpPlaces()[0] || '', b: '', c: '',
    sc: me ? [{ n: me, s: '', w: false, r: '', tm: '' }] : [], roles: false, teams: false, gameWon: false, x: [] };
  _lpUsualSeats();
  _lpShow();
}
// A play with its game, people, characters and scenario filled in: a
// campaign's next game (js/clank-legacy.js). tab: the game page's tab to go
// back to once it's saved.
function logPlayWith(o) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a) { if (typeof acctOpenSheet === 'function') acctOpenSheet(); return; }
  const roles = o.roles || {};
  _lp = { id: null, bggId: Number(o.bggId), date: _lpToday(), time: _lpNow(), d: '', lenSet: false, l: o.l || _lpPlaces()[0] || '', b: o.b || '', c: '',
    sc: (o.names || []).map(n => ({ n, s: '', w: false, r: roles[n] || '', tm: '' })), roles: Object.values(roles).some(Boolean), teams: false,
    gameWon: false, x: [], tab: o.tab || '', after: typeof o.after === 'function' ? o.after : null };
  _lpUsualSeats();
  _lpShow();
}
// The same game, people, characters, place and scenario as a past play;
// today, and no scores or winners yet.
function logPlayAgain(bggId, idx) {
  const play = (PLAY_HISTORY[bggId] || [])[idx];
  if (!play) return logPlayOpen(bggId);
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a) { if (typeof acctOpenSheet === 'function') acctOpenSheet(); return; }
  const sc = play.sc.filter(s => s && s.n).map(s => ({ n: s.n, s: '', w: false, r: s.r || '', tm: s.tm || '' }));
  _lp = { id: null, bggId: Number(bggId), date: _lpToday(), time: _lpNow(), d: '', lenSet: false, l: play.l || _lpPlaces()[0] || '',
    b: play.b || '', c: '', sc, roles: sc.some(s => s.r), teams: sc.some(s => s.tm), gameWon: false,
    x: typeof playExpansionsOf === 'function' ? playExpansionsOf(Number(bggId), play) : [] };
  _lpShow();
}
// Your last few plays, one per game and group: the picks at the top of a new log.
function _lpRecentCombos() {
  const me = _navPlayer();
  if (!me) return [];
  const mine = [];
  for (const id in PLAY_HISTORY) PLAY_HISTORY[id].forEach((p, i) => { if (p.sc.some(s => s.n === me)) mine.push({ id: Number(id), i, p }); });
  mine.sort((x, y) => String(y.p.t || y.p.date).localeCompare(String(x.p.t || x.p.date)));
  const seen = new Set(), out = [];
  for (const m of mine) {
    const key = m.id + '|' + m.p.sc.map(s => s.n).sort().join(',');
    if (seen.has(key) || !findGameByBggId(m.id)) continue;
    seen.add(key);
    out.push(m);
    if (out.length === 3) break;
  }
  return out;
}
function logPlayEdit(id) {
  const p = manualPlaysCache[id];
  if (!p) return;
  const sc = (Array.isArray(p.sc) ? p.sc : Object.values(p.sc || {})).map(s => ({ n: NAME_MAP[s.n] || s.n, s: s.s == null ? '' : String(s.s), w: !!s.w, r: s.r || '', tm: s.tm || '' }));
  _lp = { id, bggId: Number(p.bggId), date: p.date, time: String(p.t || '').slice(11, 19) || _lpNow(), d: p.d || '', lenSet: !!p.d,
    l: p.l || '', b: p.b || '', c: p.c || '', sc, roles: sc.some(s => s.r), teams: sc.some(s => s.tm), gameWon: sc.length > 0 && !sc.some(s => s.w), winSet: true,
    ss: p.ss && typeof scoreSheetUnpack === 'function' ? scoreSheetUnpack(p.ss, sc) : null,
    x: (Array.isArray(p.x) ? p.x : Object.values(p.x || {})).map(Number) };
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
    ov.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.target.id === 'lp-pname') { e.preventDefault(); _lpAddPlayer(); }
      else if (e.target.id === 'lp-gq') { e.preventDefault(); _lpGameSearch(); }
    });
    ov.addEventListener('submit', (e) => { e.preventDefault(); _lpSave(); });
    ov.addEventListener('input', (e) => {
      if (e.target.classList.contains('lp-score')) {
        const p = _lp.sc[Number(e.target.closest('.lp-prow').dataset.i)];
        if (p) { p.s = e.target.value.trim(); _lpAutoWinner(); }
        return;
      }
      if (e.target.classList.contains('lp-role')) {   // typed: the one-tap characters step aside
        const chips = e.target.parentElement.querySelector('.lp-rchips');
        if (chips) chips.hidden = !!e.target.value.trim();
        return;
      }
      const n = e.target.closest('[data-sc-num]');
      if (!n) return;
      const v = n.value.trim().replace(',', '.');
      if (/^\d{1,3}(\.\d+)?$/.test(v)) _lp.pick[n.dataset.scNum] = `${n.dataset.word} ${Number(v)}`; else delete _lp.pick[n.dataset.scNum];
      _lp.scenGuessed = false;
      const hint = document.getElementById('lp-scen-hint');
      if (hint) hint.hidden = true;
    });
    ov.addEventListener('change', (e) => {
      if (e.target.id === 'lp-date' || e.target.id === 'lp-l') { _lpRenderSugg(); return; }
      const s = e.target.closest('[data-sc]');
      if (!s) return;
      if (s.value) _lp.pick[s.dataset.sc] = s.value; else delete _lp.pick[s.dataset.sc];
      _lp.scenGuessed = false;
      _lpRenderScen();
    });
  }
  return ov;
}

function _lpShow() {
  const ov = _lpEl();
  const esc = _escapeHtml;
  ov.innerHTML = `<form class="lp-sheet" novalidate>
      <header class="lp-head">
        <span class="lp-headside"></span>
        <div class="lp-title">${_lp.id ? 'Edit the play' : 'Log a play'}</div>
        <button type="button" class="lp-close" data-lp="close" aria-label="Close">&times;</button>
      </header>
      <div class="lp-body">
        ${!_lp.id && !_lp.bggId && _lpRecentCombos().length ? `<section class="lp-part">
          <h3 class="lp-h">Play it again</h3>
          <div class="lp-again-list">${_lpRecentCombos().map(m => {
            const g = findGameByBggId(m.id);
            const others = m.p.sc.map(s => s.n).filter(n => n !== _navPlayer());
            return `<button type="button" class="lp-gpick" data-lp-again="${m.id}|${m.i}">
              <img class="lp-gcover" src="images/${m.id}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${m.id})">
              <span class="lp-gname"><b>${esc(g.name)}</b><span>${others.length ? 'with ' + esc(others.slice(0, 3).join(', ')) + (others.length > 3 ? ` +${others.length - 3}` : '') : 'solo'} &middot; ${_fmtDateShort(m.p.date)}</span></span>
              <span class="lp-again-ico" aria-hidden="true">&#8635;</span>
            </button>`;
          }).join('')}</div>
        </section>` : ''}
        <section class="lp-part">
          <h3 class="lp-h">Game</h3>
          <div id="lp-game"></div>
          <div id="lp-exp" class="lp-exp" hidden></div>
        </section>
        <section class="lp-part" id="lp-scen-part" hidden>
          <h3 class="lp-h">Scenario</h3>
          <div id="lp-scen" class="lp-scen"></div>
          <div class="lp-hint" id="lp-scen-hint" hidden>The next one for you, from your plays so far.</div>
        </section>
        <section class="lp-part">
          <h3 class="lp-h">When and where</h3>
          <div class="lp-pair">
            <label class="lp-field"><span>Day</span><input class="lp-input" type="date" id="lp-date" value="${esc(_lp.date)}" max="${_lpToday()}" required></label>
            <label class="lp-field"><span>Where</span><input class="lp-input" id="lp-l" value="${esc(_lp.l)}" maxlength="80" placeholder="Home, a café…"></label>
          </div>
          <div id="lp-len" class="lp-len"></div>
        </section>
        <section class="lp-part">
          <div class="lp-hrow"><h3 class="lp-h">Players</h3><span class="lp-hbtns"><button type="button" class="lp-textbtn" data-lp="teams">${_lp.teams ? 'No teams' : '+ Teams'}</button><button type="button" class="lp-textbtn" data-lp="roles">${_lp.roles ? 'Hide characters' : '+ Characters'}</button></span></div>
          <div id="lp-ssbtn" class="lp-ssrow" hidden></div>
          <div class="lp-all">
            <button type="button" class="lp-chip" data-lp="allwon"><span aria-hidden="true">&#9733;</span> Everyone won</button>
            <button type="button" class="lp-chip" data-lp="alllost"><span aria-hidden="true">&#9760;&#65038;</span> Everyone lost</button>
          </div>
          <div id="lp-players" class="lp-players"></div>
          <div id="lp-sugg" class="lp-sugg" hidden></div>
          <div class="lp-addp">
            <input class="lp-input" id="lp-pname" placeholder="Add a player" maxlength="60" enterkeyhint="done">
            <button type="button" class="lp-btn" data-lp="addp">Add</button>
          </div>
          <div class="lp-hint">Tap &#9733; for each winner.</div>
        </section>
        <details class="lp-part lp-more"${_lp.b || _lp.c ? ' open' : ''}>
          <summary class="lp-h" id="lp-more-h">Scenario and notes</summary>
          <label class="lp-field"><span id="lp-b-label">Scenario, map or variant</span><input class="lp-input" id="lp-b" value="${esc(_lp.b)}" maxlength="300" autocomplete="off"></label>
          <label class="lp-field"><span>Notes</span><textarea class="lp-input" id="lp-c" rows="3" maxlength="1000">${esc(_lp.c)}</textarea></label>
        </details>
        ${_lp.id ? '<button type="button" class="lp-textbtn lp-del" data-lp="delete">Delete this play</button>' : ''}
      </div>
      <footer class="lp-foot">
        <div class="acct-msg lp-msg" id="lp-msg" hidden></div>
        <button type="submit" class="lp-save">${_lp.id ? 'Save the changes' : 'Save the play'}</button>
      </footer>
    </form>`;
  _lpRenderGame();
  _lpRenderPlayers();
  _lpRenderLen();
  if (typeof comboAttach === 'function') {
    comboAttach(document.getElementById('lp-pname'), {
      options: () => { const inPlay = new Set(_lp.sc.map(p => p.n)); return _lpPeople().filter(n => !inPlay.has(n)); },
      onPick: () => _lpAddPlayer(),
    });
    comboAttach(document.getElementById('lp-l'), { options: _lpPlaces, onPick: () => _lpRenderSugg() });
  }
  if (!_lpOpen) {
    _lpOpen = true;
    ov.classList.add('open');
    ov._navClose = _lpClose;
    if (typeof navOverlayOpened === 'function') navOverlayOpened('lp');
  }
  const body = ov.querySelector('.lp-body');
  if (body) body.scrollTop = 0;
}
function _lpClose() {
  const ov = document.getElementById('lp-overlay');
  if (!ov || !_lpOpen) return;
  _lpOpen = false;
  if (typeof scoreSheetEnd === 'function') scoreSheetEnd();   // a sheet counted together is over
  ov.classList.remove('open');
  ov._navClose = null;
  if (typeof navOverlayClosed === 'function') navOverlayClosed('lp');
}

// The game: the one picked, or a search for one (run by the Search button).
let _lpPicked = null;   // the game picked from the search, while the site may not know it yet
function _lpRenderGame() {
  const box = document.getElementById('lp-game');
  if (!box) return;
  const esc = _escapeHtml;
  _lpRenderSugg();   // the people who play this game come up
  _lpRenderSheetBtn();
  _lpRenderExp();
  if (_lp.bggId) {
    const g = findGameByBggId(_lp.bggId) || (_lpPicked && _lpPicked.id === _lp.bggId ? _lpPicked : { name: `Game #${_lp.bggId}` });
    const sub = [g.year, g.players ? `${g.players} players` : ''].filter(Boolean).join(' &middot; ');
    box.innerHTML = `<div class="lp-gamecard">
        <img class="lp-gcover" src="images/${_lp.bggId}.jpg" alt="" data-img="${esc(g.urlImage || g.img || '')}" onerror="__myLibImg(this)">
        <div class="lp-gname"><b>${esc(g.name)}</b>${sub ? `<span>${sub}</span>` : ''}</div>
        <button type="button" class="lp-textbtn" data-lp="game">Change</button>
      </div>`;
    _lpRenderScen();
    return;
  }
  _lpRenderScen();
  box.innerHTML = `<div class="lp-gsearch">
      <input type="search" class="lp-input" id="lp-gq" placeholder="A game's name" autocomplete="off" enterkeyhint="search">
      <button type="button" class="lp-btn lp-btn-main" data-lp="gsearch">Search</button>
    </div>
    <div class="lp-hint" id="lp-ghint"></div>
    <div class="lp-gresults" id="lp-gresults"></div>`;
  _lpGameList(null);
  if (typeof _loadHot === 'function' && (typeof _hot === 'undefined' || !_hot)) _loadHot().catch(() => {});
}
// The scenario: lists, for a game that has a fixed set of them
// (js/scenarios.js); anything else goes in the box under "Scenario and notes".
function _lpRenderScen() {
  const part = document.getElementById('lp-scen-part'), box = document.getElementById('lp-scen');
  const bIn = document.getElementById('lp-b'), bLabel = document.getElementById('lp-b-label');
  if (!part || !box) return;
  const cfg = _lp.bggId && typeof scenarioPicker === 'function' ? scenarioPicker(_lp.bggId) : null;
  if (_lp.scenFor !== _lp.bggId) {   // another game: what was written so far, read for this one
    const typed = bIn ? bIn.value : _lp.b;
    const raw = _lp.scenCfg ? scenarioCompose(_lp.scenCfg, _lp.pick || {}, typed) : typed;
    const p = cfg ? scenarioParse(cfg, raw) : { vals: {}, rest: raw };
    const guess = cfg && !raw && !_lp.id ? scenarioGuess(_lp.bggId, _navPlayer()) : null;
    if (guess) Object.assign(p.vals, guess);
    Object.assign(_lp, { pick: p.vals, scenFor: _lp.bggId, scenCfg: cfg, scenGuessed: !!guess });
    if (bIn) bIn.value = p.rest;
    const more = document.querySelector('#lp-overlay .lp-more');
    if (more && cfg) more.open = !!(p.rest || _lp.c);
  }
  part.hidden = !cfg;
  if (bLabel) bLabel.textContent = cfg ? 'Anything else (a variant, modules…)' : 'Scenario, map or variant';
  const moreH = document.getElementById('lp-more-h');
  if (moreH) moreH.textContent = cfg ? 'Variant and notes' : 'Scenario and notes';
  const hint = document.getElementById('lp-scen-hint');
  if (hint) hint.hidden = !(cfg && _lp.scenGuessed);
  if (!cfg) { box.innerHTML = ''; return; }
  const esc = _escapeHtml;
  box.innerHTML = cfg.fields.filter(f => !f.show || f.show(_lp.pick)).map(f => {
    if (f.num) {   // the word, and the number to fill in
      const n = (String(_lp.pick[f.key] || '').match(/(\d+(?:\.\d+)?)$/) || [])[1] || '';
      return `<label class="lp-field"><span class="lp-num"><span class="lp-num-word">${esc(f.num)}</span>
          <input class="lp-input" data-sc-num="${f.key}" data-word="${esc(f.num)}" value="${esc(n)}" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="No."></span></label>`;
    }
    const opts = f.options(_lp.pick);
    // a pick this list no longer has (another airport's difficulty) goes; a single choice is made
    if (_lp.pick[f.key] && !opts.some(o => o[0] === _lp.pick[f.key])) delete _lp.pick[f.key];
    if (!_lp.pick[f.key] && !f.optional && opts.length === 1) _lp.pick[f.key] = opts[0][0];
    let html = '', group = null;
    for (const [v, text, g] of opts) {
      if ((g || null) !== group) { html += `${group ? '</optgroup>' : ''}${g ? `<optgroup label="${esc(g)}">` : ''}`; group = g || null; }
      html += `<option value="${esc(v)}"${_lp.pick[f.key] === v ? ' selected' : ''}>${esc(text)}</option>`;
    }
    if (group) html += '</optgroup>';
    return `<label class="lp-field"><span>${esc(f.label)}</span><select class="lp-input" data-sc="${f.key}">
        <option value="">${esc(f.optional ? f.none || 'None' : 'Pick…')}</option>${html}</select></label>`;
  }).join('');
}

// Your games and the games you've played lately: what's shown before a search.
function _lpRecentGames() {
  const me = _navPlayer();
  const recent = [];
  for (const id in PLAY_HISTORY) {
    const last = PLAY_HISTORY[id].find(p => p.sc.some(s => s.n === me));
    if (last) recent.push([Number(id), last.t || last.date]);
  }
  recent.sort((a, b) => b[1].localeCompare(a[1]));
  const mine = typeof myLibIds === 'function' ? myLibIds() : [];
  // the games you played lately first, then the rest of your games
  const ids = [...new Set([...recent.map(r => r[0]), ...mine])].slice(0, 12);
  const idx = new Map(_myLibIndex().map(g => [g.id, g]));
  return ids.map(id => idx.get(id)).filter(Boolean);
}
function _lpGameSearch() {
  const q = ((document.getElementById('lp-gq') || {}).value || '').trim();
  const input = document.getElementById('lp-gq');
  if (input) input.blur();
  _lpGameList(q || null);
}
let _lpList = [], _lpSeq = 0;   // the games on show, and which search they came from
function _lpGameList(q) {
  if (!q) { _lpShowGames(_lpRecentGames(), _lpRecentGames().length ? 'Your games and the ones you played lately:' : 'Type a game\'s name and tap Search.'); return; }
  const seq = ++_lpSeq;
  searchGames(q, (list, state) => { if (seq === _lpSeq) _lpShowGames(list, searchHint(q, list, state)); });
}
function _lpShowGames(list, hintText) {
  const box = document.getElementById('lp-gresults');
  const hint = document.getElementById('lp-ghint');
  if (!box) return;
  _lpList = list;
  if (hint) hint.textContent = hintText;
  box.innerHTML = list.slice(0, 40).map(g => `<button type="button" class="lp-gpick" data-lp-game="${g.id}">
      <img class="lp-gcover" src="images/${g.id}.jpg" alt="" loading="lazy" data-img="${_escapeHtml(g.img || '')}" onerror="__myLibImg(this)">
      <span class="lp-gname"><b>${_escapeHtml(g.name)}</b><span>${gameRowMeta(g)}</span></span>
    </button>`).join('');
}

// The length: worked out like every play without one (BGG's time, the
// players, first plays), unless you set it.
function _lpEstimate() {
  if (!_lp.bggId || !_lp.sc.length || typeof _ptEstimate !== 'function') return 0;
  // a game just picked from BoardGameGeek isn't saved yet: its players and time come with the pick
  const picked = _lpPicked && _lpPicked.id === _lp.bggId ? _lpPicked : {};
  const game = findGameByBggId(_lp.bggId) || { bggId: _lp.bggId, players: picked.players || '', playTime: picked.time || picked.playTime || '' };
  const before = new Set();
  const others = (PLAY_HISTORY[_lp.bggId] || []).filter(p => p.mp !== _lp.id);
  for (const p of others) for (const s of p.sc) before.add(s.n);
  const date = (document.getElementById('lp-date') || {}).value || _lp.date;
  try {
    const e = _ptEstimate(game, { sc: _lp.sc, d: 0 }, _lp.sc.filter(s => !before.has(s.n)).length, others.some(p => p.date === date));
    return Math.round(e.est || 0);
  } catch (_) { return 0; }
}
function _lpRenderLen() {
  const box = document.getElementById('lp-len');
  if (!box) return;
  if (_lp.lenSet) {
    box.innerHTML = `<span class="lp-lenico" aria-hidden="true">&#9201;&#65038;</span>
      <input class="lp-input lp-mins" type="number" id="lp-d" value="${_escapeHtml(String(_lp.d || ''))}" min="1" max="10000" inputmode="numeric" placeholder="${_lpEstimate() || ''}" aria-label="Length in minutes"><span class="lp-lentext">minutes</span>
      <button type="button" class="lp-textbtn" data-lp="lenauto">Work it out</button>`;
    return;
  }
  const est = _lpEstimate();
  box.innerHTML = `<span class="lp-lenico" aria-hidden="true">&#9201;&#65038;</span>
    <span class="lp-lentext">${est ? `About <b>${fmtPlayTime(est)}</b>, from BGG's time and who played` : 'The length is worked out once the game and players are in'}</span>
    <button type="button" class="lp-textbtn" data-lp="lenset">Set it</button>`;
}

function _lpSyncPlayers() {
  document.querySelectorAll('#lp-players .lp-prow').forEach(row => {
    const p = _lp.sc[Number(row.dataset.i)];
    if (!p) return;
    p.s = row.querySelector('.lp-score').value.trim();
    const r = row.querySelector('.lp-role');
    if (r) p.r = r.value.trim();
  });
  const d = document.getElementById('lp-d');
  if (d) _lp.d = d.value;
}
function _lpRenderPlayers() {
  const box = document.getElementById('lp-players');
  if (!box) return;
  const esc = _escapeHtml;
  const lost = _lp.gameWon && _lp.sc.length && !_lp.sc.some(p => p.w);
  const st = STORYTELLER_GAMES.get(Number(_lp.bggId));   // a seat that neither wins nor loses
  box.innerHTML = (_lp.sc.map((p, i) => `<div class="lp-prow${p.w ? ' won' : ''}" data-i="${i}">
      <div class="lp-pmain">
        <span class="lp-avatar" aria-hidden="true">${avatarInner(p.n)}</span>
        <span class="lp-pn">${esc(p.n)}</span>
        <button type="button" class="lp-x" data-lp-del="${i}" aria-label="Remove ${esc(p.n)}">&times;</button>
      </div>
      <div class="lp-pscore">
        <input class="lp-input lp-score" value="${esc(p.s)}" placeholder="Score" maxlength="40" inputmode="decimal" aria-label="${esc(p.n)}'s score">
        ${st && isNoResultSeat(p) ? '' : `<button type="button" class="lp-win${p.w ? ' on' : ''}" data-lp-win="${i}" aria-pressed="${p.w}">&#9733; ${p.w ? 'Won' : 'Winner?'}</button>`}
        ${st ? `<button type="button" class="lp-win lp-st${isNoResultSeat(p) ? ' on' : ''}" data-lp-st="${i}" aria-pressed="${isNoResultSeat(p)}" title="Plays, but neither wins nor loses">${esc(st)}</button>` : ''}
      </div>
      ${_lp.teams ? `<div class="lp-teams">${_lpTeamNos().map(t => `<button type="button" class="lp-tchip${String(p.tm) === t ? ' on' : ''}" data-lp-team="${i}|${t}" aria-pressed="${String(p.tm) === t}">Team ${t}</button>`).join('')}</div>` : ''}
      ${_lp.roles ? `<input class="lp-input lp-role" value="${esc(p.r || '')}" placeholder="Character, faction, colour…" maxlength="120" aria-label="${esc(p.n)}'s character">${_lpRoleChips(i)}` : ''}
    </div>`).join('') || '<div class="lp-hint">Add the players below.</div>')
    + (lost ? '<div class="lp-gamewon">&#9760;&#65038; The game won</div>' : '');
  _lpRenderSugg();
  _lpRenderSheetBtn();
  if (_lp.bggId) _lpAutoWinner();   // a player gone or added: the stars follow the scores
}
// Characters in one tap (the user, 6 Nov 2026): the ones this game has been
// played with, the player's own most used first, then everyone's; a character
// someone else in the play has already is left out.
function _lpRoleChips(i) {
  const p = _lp.sc[i];
  if (!p || p.r || !_lp.bggId) return '';
  const st = STORYTELLER_GAMES.get(Number(_lp.bggId));
  const all = new Map(), theirs = new Map();
  for (const q of PLAY_HISTORY[_lp.bggId] || []) {
    for (const s of q.sc || []) {
      const r = String((s && s.r) || '').trim();
      if (!r || r === st) continue;
      all.set(r, (all.get(r) || 0) + 1);
      if (s.n === p.n) theirs.set(r, (theirs.get(r) || 0) + 1);
    }
  }
  const taken = new Set(_lp.sc.map(q => q.r).filter(Boolean));
  const list = [...all.keys()].filter(r => !taken.has(r))
    .sort((a, b) => (theirs.get(b) || 0) - (theirs.get(a) || 0) || all.get(b) - all.get(a)).slice(0, 12);
  return list.length ? `<div class="lp-rchips">${list.map(r => `<button type="button" class="lp-rchip" data-lp-role="${i}" data-role="${_escapeHtml(r)}">${_escapeHtml(r)}</button>`).join('')}</div>` : '';
}
// Teams 1, 2, and one more than the highest in use (up to 4).
function _lpTeamNos() {
  const hi = Math.max(0, ..._lp.sc.map(p => Number(p.tm) || 0));
  return Array.from({ length: Math.min(4, Math.max(2, hi + 1)) }, (_, k) => String(k + 1));
}
// A game usually played with characters or in teams starts with them on.
function _lpUsualSeats() {
  if (!_lp || _lp.id || !_lp.bggId) return;
  const recent = (PLAY_HISTORY[_lp.bggId] || []).slice(0, 20);
  if (recent.length < 2) return;
  const share = (f) => recent.filter(q => (q.sc || []).some(f)).length / recent.length;
  if (!_lp.roles && share(s => s && s.r && !isNoResultSeat(s)) >= 0.5) _lp.roles = true;
  if (!_lp.teams && share(s => s && s.tm) >= 0.5) {
    _lp.teams = true;
    _lp.sc.forEach((p, i) => { if (!p.tm) p.tm = String((i % 2) + 1); });
  }
  const rb = document.querySelector('#lp-overlay [data-lp="roles"]');
  if (rb) rb.textContent = _lp.roles ? 'Hide characters' : '+ Characters';
  const tb = document.querySelector('#lp-overlay [data-lp="teams"]');
  if (tb) tb.textContent = _lp.teams ? 'No teams' : '+ Teams';
}
// The expansions played with (the user, 6 Nov 2026): one tap each, for the
// ones you own for the game and the ones it's been played with before.
function _lpRenderExp() {
  const box = document.getElementById('lp-exp');
  if (!box) return;
  const id = _lp.bggId;
  const known = new Map((typeof expansionsOf === 'function' ? expansionsOf(id) : []).map(([x, name]) => [Number(x), name]));
  const owned = typeof _gnOwned === 'function' ? _gnOwned() : new Set();
  const used = new Map();
  if (id && typeof playExpansionsOf === 'function') {
    for (const p of PLAY_HISTORY[id] || []) for (const x of playExpansionsOf(id, p)) used.set(x, (used.get(x) || 0) + 1);
  }
  const ids = [...new Set([..._lp.x || [], ...[...known.keys()].filter(x => owned.has(x)), ...used.keys()])];
  box.hidden = !id || !ids.length;
  if (box.hidden) { box.innerHTML = ''; return; }
  const game = findGameByBggId(id);
  const nameOf = (x) => {
    const n = known.get(x) || ((findGameByBggId(x) || {}).name) || `Expansion #${x}`;
    return typeof _gnShort === 'function' && game ? _gnShort(n, game.name) : n;
  };
  ids.sort((a, b) => (owned.has(b) - owned.has(a)) || ((used.get(b) || 0) - (used.get(a) || 0)) || nameOf(a).localeCompare(nameOf(b)));
  box.innerHTML = `<div class="lp-exp-h">Played with</div><div class="lp-exp-list">${ids.map(x => {
    const on = (_lp.x || []).includes(x);
    return `<button type="button" class="lp-xchip${on ? ' on' : ''}" data-lp-x="${x}" aria-pressed="${on}">${on ? '&#10003; ' : ''}${_escapeHtml(nameOf(x))}</button>`;
  }).join('')}</div>`;
}
// The score sheet (js/score-sheet.js), once there are players to count for.
function _lpRenderSheetBtn() {
  const box = document.getElementById('lp-ssbtn');
  if (!box) return;
  const s = typeof scoreSheetFor === 'function' ? scoreSheetFor(_lp.bggId) : null;
  box.hidden = !s || !_lp.sc.length;
  box.innerHTML = box.hidden ? '' : `<button type="button" class="lp-chip lp-ssbtn" data-lp="sheet"><span aria-hidden="true">&#9638;</span> ${
    scoreSheetFilled() ? 'Back to the score sheet' : s.key === 'rounds' ? 'Score it round by round' : 'Score sheet'}</button>`;
}
// The best score gets the star as the scores are typed (the user, 6 Nov 2026:
// no tapping ★ as well), the lowest where the lowest wins, until someone
// picks the winners themselves. Not for a co-op, and not before two scores.
function _lpAutoWinner() {
  if (_lp.winSet) return;
  const g = findGameByBggId(_lp.bggId);
  if (g && isCoop(g)) return;
  const seats = _lp.sc.map((p, i) => ({ i, v: isNoResultSeat(p) ? null : _recScore(p.s) })).filter(x => x.v !== null);
  const low = typeof _recLowBest === 'function' && _recLowBest(PLAY_HISTORY[_lp.bggId] || [], false);
  const best = seats.length >= 2 ? (low ? Math.min : Math.max)(...seats.map(x => x.v)) : null;
  const win = new Set(seats.filter(x => x.v === best).map(x => x.i));
  if (_lp.teams) {   // a team wins together
    const teams = new Set([...win].map(i => String(_lp.sc[i].tm || '')).filter(Boolean));
    _lp.sc.forEach((p, i) => { if (p.tm && teams.has(String(p.tm))) win.add(i); });
  }
  _lp.sc.forEach((p, i) => { p.w = win.has(i); });
  _lp.gameWon = false;
  document.querySelectorAll('#lp-players .lp-prow').forEach(row => {
    const p = _lp.sc[Number(row.dataset.i)];
    const btn = row.querySelector('[data-lp-win]');
    if (!p) return;
    row.classList.toggle('won', p.w);
    if (btn) { btn.classList.toggle('on', p.w); btn.setAttribute('aria-pressed', String(p.w)); btn.innerHTML = `&#9733; ${p.w ? 'Won' : 'Winner?'}`; }
  });
  const gw = document.querySelector('#lp-players .lp-gamewon');
  if (gw) gw.remove();
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
  input.blur();   // keyboard away: the next tap is usually a score or the next player
  _lpRenderPlayers();
  _lpRenderLen();
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
  const b = e.target.closest('[data-lp], [data-lp-game], [data-lp-win], [data-lp-st], [data-lp-del], [data-lp-who], [data-lp-crew], [data-lp-x], [data-lp-team], [data-lp-role]');
  if (!b) return;
  if (b.dataset.lpRole != null) { _lpSyncPlayers(); const p = _lp.sc[Number(b.dataset.lpRole)]; if (p) p.r = b.dataset.role; _lpRenderPlayers(); return; }
  if (b.dataset.lpTeam) {
    _lpSyncPlayers();
    const [i, t] = b.dataset.lpTeam.split('|');
    const p = _lp.sc[Number(i)];
    if (p) p.tm = String(p.tm) === t ? '' : t;
    _lpRenderPlayers();
    return;
  }
  if (b.dataset.lpX) {
    const x = Number(b.dataset.lpX);
    _lp.x = (_lp.x || []).includes(x) ? _lp.x.filter(y => y !== x) : [...(_lp.x || []), x];
    _lpRenderExp();
    return;
  }
  if (b.dataset.lpWho != null) { _lpAddNames([b.dataset.lpWho]); return; }
  if (b.dataset.lpCrew != null) { const c = _lpCrews[Number(b.dataset.lpCrew)]; if (c) _lpAddNames(c.names); return; }
  const what = b.dataset.lp;
  if (what === 'close') { _lpClose(); return; }
  if (what === 'game') { _lp.bggId = 0; _lp.x = []; _lpRenderGame(); _lpRenderLen(); if (!_isTouchDevice()) setTimeout(() => { const q = document.getElementById('lp-gq'); if (q) q.focus(); }, 30); return; }
  if (what === 'gsearch') { _lpGameSearch(); return; }
  if (what === 'roles') { _lpSyncPlayers(); _lp.roles = !_lp.roles; b.textContent = _lp.roles ? 'Hide characters' : '+ Characters'; _lpRenderPlayers(); return; }
  if (what === 'teams') {
    _lpSyncPlayers();
    _lp.teams = !_lp.teams;
    if (_lp.teams && !_lp.sc.some(p => p.tm)) _lp.sc.forEach((p, i) => { p.tm = String((i % 2) + 1); });   // split by seat to start with
    b.textContent = _lp.teams ? 'No teams' : '+ Teams';
    _lpRenderPlayers();
    return;
  }
  if (what === 'addp') { _lpAddPlayer(); return; }
  if (what === 'sheet') { _lpSyncPlayers(); scoreSheetOpen(); return; }
  if (what === 'allwon' || what === 'alllost') {
    _lpSyncPlayers();
    _lp.winSet = true;
    _lp.sc.forEach(p => { p.w = what === 'allwon' && !isNoResultSeat(p); });
    _lp.gameWon = what === 'alllost';
    _lpRenderPlayers();
    return;
  }
  if (what === 'lenset') { _lpSyncPlayers(); _lp.lenSet = true; _lpRenderLen(); const d = document.getElementById('lp-d'); if (d) d.focus(); return; }
  if (what === 'lenauto') { _lpSyncPlayers(); _lp.lenSet = false; _lp.d = ''; _lpRenderLen(); return; }
  if (what === 'delete') { await _lpDelete(); return; }
  if (b.dataset.lpGame) {
    const id = Number(b.dataset.lpGame);
    _lpPicked = _lpList.find(g => g.id === id) || _myLibIndex().find(g => g.id === id) || { id, name: b.querySelector('b').textContent };
    _lp.bggId = id;
    _lp.x = [];
    _lpRenderGame();
    _lpRenderLen();
    _lpUsualSeats();
    _lpRenderPlayers();
    return;
  }
  if (b.dataset.lpWin) {
    _lpSyncPlayers();
    // the first tap after the automatic star picks the winner instead of it
    if (!_lp.winSet) _lp.sc.forEach((q, i) => { if (i !== Number(b.dataset.lpWin)) q.w = false; });
    _lp.winSet = true;
    const p = _lp.sc[Number(b.dataset.lpWin)];
    p.w = !p.w;
    if (_lp.teams && p.tm) _lp.sc.forEach(q => { if (String(q.tm) === String(p.tm)) q.w = p.w; });   // a team wins together
    _lp.gameWon = false;
    _lpRenderPlayers();
    return;
  }
  if (b.dataset.lpSt) {
    // the Storyteller: in the play, out of its result (kept as the role, as BG Stats has it)
    _lpSyncPlayers();
    _lp.winSet = true;
    const p = _lp.sc[Number(b.dataset.lpSt)];
    if (isNoResultSeat(p)) p.r = '';
    else { p.r = STORYTELLER_GAMES.get(Number(_lp.bggId)); p.w = false; _lp.roles = true; }
    const rb = document.querySelector('#lp-overlay [data-lp="roles"]');
    if (rb) rb.textContent = _lp.roles ? 'Hide characters' : '+ Characters';
    _lpRenderPlayers();
    return;
  }
  if (b.dataset.lpDel) { _lpSyncPlayers(); _lp.sc.splice(Number(b.dataset.lpDel), 1); _lpRenderPlayers(); _lpRenderLen(); }
}

async function _lpSave() {
  const a = acctMe();
  if (!a) { _lpSay('Sign in first.'); return; }
  _lpSyncPlayers();
  const date = document.getElementById('lp-date').value;
  const d = _lp.lenSet ? Number(_lp.d) || 0 : 0;
  const l = document.getElementById('lp-l').value.trim();
  const extra = document.getElementById('lp-b').value.trim();
  const b = (_lp.scenCfg ? scenarioCompose(_lp.scenCfg, _lp.pick || {}, extra) : extra).slice(0, 300);
  const c = document.getElementById('lp-c').value.trim();
  if (!_lp.bggId) { _lpSay('Pick the game.'); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { _lpSay('Pick the day.'); return; }
  if (date > _lpToday()) { _lpSay('That day hasn\'t come yet.'); return; }
  if (!_lp.sc.length) { _lpSay('Add the players.'); return; }
  const rec = {
    bggId: _lp.bggId, date, t: `${date} ${_lp.time}`,
    sc: _lp.sc.map(p => {
      const o = { n: typeof _origCanon === 'function' ? _origCanon(p.n) : p.n, w: !!p.w };
      if (p.s) o.s = p.s.slice(0, 40);
      if (_lp.roles && p.r) o.r = p.r.slice(0, 120);
      if (_lp.teams && p.tm) o.tm = String(p.tm).slice(0, 30);
      return o;
    }),
    by: _lp.id ? (manualPlaysCache[_lp.id] || {}).by || a.uid : a.uid,
    at: _lp.id ? (manualPlaysCache[_lp.id] || {}).at || Date.now() : Date.now(),
  };
  if (d) rec.d = Math.min(10000, Math.round(d));
  if (l) rec.l = l;
  if (b) rec.b = b;
  if (c) rec.c = c;
  if (_lp.x && _lp.x.length) rec.x = _lp.x.slice(0, 20).map(Number);
  const sheet = typeof scoreSheetFor === 'function' && _lp.ss ? scoreSheetFor(rec.bggId) : null;
  if (sheet && sheet.key === _lp.ss.key) { const ss = scoreSheetPack(); if (ss) rec.ss = ss; }
  const picked = _lpPicked && _lpPicked.id === rec.bggId ? _lpPicked : null;
  // one still waiting to send is changed on the phone, and goes up as it is now
  if (_lp.id && _lp.id.startsWith('local-')) { _lpKeep(rec, _lp.id, picked); lpFlushQueue(); return; }
  _lpSay('Saving…');
  try {
    if (typeof ensureKnownGame === 'function') await ensureKnownGame(rec.bggId, picked);
    let id = _lp.id;
    if (id) await _lpWrite(`plays/${id}`, 'PUT', rec);
    else id = (await _lpWrite('plays', 'POST', rec)).name;
    manualPlaysCache[id] = rec;
    _lpMerge(id, rec);
    _sortPlayHistory();
    const moments = _lp.id ? [] : _lpMoments(id, rec);
    const after = _lp.id ? null : _lp.after;   // logPlayWith's caller, told about a new play
    // the others in it hear about it (js/notify.js), with what it did
    if (!_lp.id && typeof notifyPlayLogged === 'function') notifyPlayLogged(id, (findGameByBggId(rec.bggId) || {}).name || '', moments[0] && moments[0].text);
    _lpClose();
    _lpRefresh(rec.bggId);
    if (typeof _acctToast === 'function') {
      if (moments.length) _acctToast(['Play saved.', ...moments.map(m => `${m.icon} ${m.text}`)].join('\n'), 8000);
      else _acctToast(_lp.id ? 'Saved the changes.' : 'Play saved. It counts everywhere now.');
    }
    if (after) setTimeout(() => after(id), 0);
  } catch (err) {
    if (_lpOffline(err)) { _lpKeep(rec, _lp.id, picked); return; }
    _lpSay(err.message || 'The save failed. Try again.');
  }
}
// A play the database refuses for a field its rules don't have yet goes up
// without it: the expansions (plays/{id}.x) first, then the score sheet (.ss),
// then the teams (sc/{i}.tm).
async function _lpWrite(path, method, rec) {
  for (;;) {
    try {
      return await acctWrite(path, method, rec);
    } catch (err) {
      const drop = ['x', 'ss'].find(k => k in rec) || (rec.sc.some(s => 'tm' in s) ? 'tm' : '');
      if (err.code !== 'denied' || !drop) throw err;
      if (drop === 'tm') rec.sc.forEach(s => delete s.tm); else delete rec[drop];
    }
  }
}
// A play saved from elsewhere in the app, without the form (a campaign's
// mission, js/cncr-campaign.js): saved, counted and announced like one from
// the form. rec: { bggId, date, t, sc: [{n, w, s?, r?}], d?, l?, b?, c? }.
// Resolves to { id, pending } (pending: kept on the phone, no signal).
async function logPlaySave(rec) {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (!a) throw new Error('Sign in to have the play logged.');
  rec = { ...rec, sc: rec.sc.map(p => ({ ...p, n: typeof _origCanon === 'function' ? _origCanon(p.n) : p.n })), by: a.uid, at: Date.now() };
  try {
    if (typeof ensureKnownGame === 'function') await ensureKnownGame(rec.bggId, null);
    const id = (await acctWrite('plays', 'POST', rec)).name;
    manualPlaysCache[id] = rec;
    _lpMerge(id, rec);
    _sortPlayHistory();
    const moments = _lpMoments(id, rec);
    if (typeof notifyPlayLogged === 'function') notifyPlayLogged(id, (findGameByBggId(rec.bggId) || {}).name || '', moments[0] && moments[0].text);
    return { id, moments };
  } catch (err) {
    if (!_lpOffline(err)) throw err;
    return { id: _lpKeep(rec, null, null, true), pending: true };
  }
}
// What a play just saved did: a record, a first win, a streak… (js/play-moments.js)
function _lpMoments(id, rec) {
  if (typeof playMoments !== 'function') return [];
  const entry = (PLAY_HISTORY[rec.bggId] || []).find(e => e.mp === id);
  try { return playMoments(rec.bggId, entry); } catch (_) { return []; }
}

// ── Without signal: kept on the phone, sent when it's back ──
// LP_QUEUE = [{ key, put, rec, game }]: key is the play's id for a change to
// one already saved (put), or a 'local-…' one for a new play.
const LP_QUEUE = 'bgl-lp-queue';
function _lpQueue() { try { return JSON.parse(localStorage.getItem(LP_QUEUE) || '[]'); } catch (_) { return []; } }
function _lpQueueSave(q) { try { localStorage.setItem(LP_QUEUE, JSON.stringify(q)); } catch (_) {} }
function _lpOffline(err) {
  // fetch's own failures (Chrome "Failed to fetch", Safari "Load failed", Firefox "NetworkError…"), Firebase's auth/network-request-failed
  return (typeof navigator !== 'undefined' && navigator.onLine === false)
    || /network|failed to fetch|load failed|offline|internet/i.test(String((err && (err.code || err.message)) || ''));
}
function _lpKeep(rec, id, game, quiet) {
  const key = id || `local-${Date.now()}`;
  _lpQueueSave(_lpQueue().filter(x => x.key !== key).concat([{ key, put: !!id && !id.startsWith('local-'), rec, game: game || null }]));
  manualPlaysCache[key] = { ...rec, pending: true };
  _lpMerge(key, manualPlaysCache[key]);
  _sortPlayHistory();
  if (quiet) return key;   // saved from elsewhere (logPlaySave): that says it
  _lpClose();
  _lpRefresh(rec.bggId);
  if (typeof _acctToast === 'function') _acctToast('No signal, so the play is kept on this phone.\nIt goes up by itself when you\'re back online.', 7000);
}
let _lpFlushing = false;
async function lpFlushQueue() {
  const a = typeof acctMe === 'function' ? acctMe() : null;
  if (_lpFlushing || !a || !_lpQueue().length || navigator.onLine === false) return;
  _lpFlushing = true;
  const sent = [];
  try {
    for (const item of _lpQueue()) {
      if (item.rec.by !== a.uid) continue;   // someone else's, from before they signed out here
      if (typeof ensureKnownGame === 'function') await ensureKnownGame(item.rec.bggId, item.game);
      const id = item.put ? (await _lpWrite(`plays/${item.key}`, 'PUT', item.rec), item.key) : (await _lpWrite('plays', 'POST', item.rec)).name;
      _lpQueueSave(_lpQueue().filter(x => x.key !== item.key));
      _lpUnmerge(item.key);
      delete manualPlaysCache[item.key];
      manualPlaysCache[id] = item.rec;
      _lpMerge(id, item.rec);
      sent.push({ id, item });
    }
  } catch (err) {
    if (!_lpOffline(err) && typeof _acctToast === 'function') _acctToast(`A play logged without signal couldn't be sent yet: ${err.message || 'try again later'}.`, 7000);
  } finally {
    _lpFlushing = false;
  }
  if (!sent.length) return;
  _sortPlayHistory();
  for (const { id, item } of sent) {
    if (item.put || typeof notifyPlayLogged !== 'function') continue;
    const m = _lpMoments(id, item.rec);
    notifyPlayLogged(id, (findGameByBggId(item.rec.bggId) || {}).name || '', m[0] && m[0].text);
  }
  _lpRefresh(sent[0].item.rec.bggId);
  if (typeof _acctToast === 'function') _acctToast(sent.length === 1 ? 'The play you logged without signal is up now.' : `The ${sent.length} plays you logged without signal are up now.`);
}
window.addEventListener('online', () => lpFlushQueue());

async function _lpDelete() {
  if (!_lp.id || !confirm('Delete this play? This can\'t be undone.')) return;
  _lpSay('Deleting…');
  try {
    const bggId = (manualPlaysCache[_lp.id] || {}).bggId;
    const queued = _lpQueue().find(x => x.key === _lp.id);
    if (queued) _lpQueueSave(_lpQueue().filter(x => x.key !== _lp.id));   // not sent yet: it just goes
    if (!_lp.id.startsWith('local-')) await acctWrite(`plays/${_lp.id}`, 'DELETE');
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
    if (g) { _modalTab = (_lp && _lp.tab) || 'plays'; _modalTabFor = g.bggId; openModal(g); }
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
  if (ed) { e.preventDefault(); e.stopPropagation(); logPlayEdit(ed.dataset.lpEdit); return; }
  const ag = e.target.closest('[data-lp-again]');
  if (ag) { e.preventDefault(); e.stopPropagation(); const [id, i] = ag.dataset.lpAgain.split('|').map(Number); logPlayAgain(id, i); }
}, true);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && _lpOpen) _lpClose(); });
