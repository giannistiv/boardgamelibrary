// ── Clank! Legacy: Acquisitions Incorporated (the Campaign tab on its game page) ──
// The user, 11 Nov 2026, the night before their first game. A franchise (a
// party of 2 to 4) plays a campaign of ten games or more; what the box keeps
// on paper between games is kept here, for the whole table on their phones:
//   - each game's Mission Report: the scores, the Most Valuable Employee (the
//     winner), the Associate Spotlight and the side of the board;
//   - the Employee Reviews: a Checkmark of Grudging Approval for scoring above
//     0, one for winning, one for a row of Personal Goals, and those a
//     Contract or a passage gave during the game;
//   - each player's Associate Status: promoted to Copper, Silver and Gold on
//     their 5th, 11th and 18th checkmark (Dire Wolf's FAQ);
//   - the Dran Enterprises Track: an X for a game where anyone scored 0.
// The Contracts aren't listed (the user, 13 Nov 2026: too much to write
// down); the cards stay in the box with the Reserve.
// Nothing of the story is here: the Book of Secrets has it, read as the game
// says. The steps are the rulebook's ("End of a Campaign Game"), in short.
//
// A game is a play logged as "Game N". The tab logs it itself: the franchise's
// players are already there, so only the points are typed (the user, 13 Nov
// 2026, after Game 1: Log a play asked for the people again). Saving opens
// BG Stats' QR code at once, as the Mini Rogue campaign does. The scores and
// winner come from the play; the rest is the campaign's, in Firebase,
// followed live while the tab is open:
//   clankCampaigns/{id} = { name: the franchise, players: [..], chars: {key: name on the deck box},
//     start, by, created, updated, status?: 'stopped', stopped?,
//     games: { N: { goals: {key: true}, extra: {key: n}, spot: player, spotNote, side: 'over' | 'under', done } },
//     assign: { playKey: N }   (a play logged without its game number)
//     notes }   (an old campaign may still carry contracts: {}; unused)
// key: a player's original name as a Firebase key (_acctKey).

const CL_BGGID = 266507;
const CL_NODE = 'clankCampaigns';
const CL_GAMES = 10;                                            // "a campaign of at least 10 games"
const CL_RANKS = [[5, 'Copper'], [11, 'Silver'], [18, 'Gold']];  // the checkmark that promotes
const CL_MAX = 4;
const CL_GAME_RE = /(?:^|／|\s)Game\s*0*(\d+)\b/i;

let _clCamps = null;          // clankCampaigns from Firebase: {id: campaign}
let _clSrc = {};              // id → the store it lives in ('main' | 'spare', see fbWrite)
let _clId = null;             // the campaign open; null: none (or the start form, with _clDraft)
let _clTab = 'camp';          // 'camp' | 'reports' | 'notes'
let _clDraft = null;          // the start form, while it's open
let _clGameOpen = null;       // the game whose report is open on the Mission Reports tab
let _clLog = null;            // the next game's points while they're typed in the tab:
                              // { id, n, rows: {key: {s, out}}, win: [key] | null (the best score), date, l }
let _clPanel = null;
let _clLate = false;          // a change came in while typing: drawn when the field's left
let _clES = null, _clESid = null, _clWatch = null;
let _clTimers = {};

const _clList = (v) => (Array.isArray(v) ? v : Object.values(v || {})).filter(x => typeof x === 'string' && x);
const _clCanon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
const _clKey = (n) => (typeof _acctKey === 'function' ? _acctKey(_clCanon(n)) : String(_clCanon(n)).replace(/[.#$\[\]\/]/g, '_'));
const _clMe = () => (typeof _navPlayer === 'function' ? _navPlayer() : null);
const _clToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const _clOrd = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;
function _clDate(v) {
  if (!v) return '';
  const d = typeof v === 'number' ? new Date(v) : new Date(String(v).slice(0, 10) + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function _clCanEdit(c) {
  const me = _clMe();
  if (!me) return false;
  const people = _clList(c && c.players);
  return !people.length || people.some(p => _clCanon(p) === _clCanon(me)) || (!!c.by && _clCanon(c.by) === _clCanon(me));
}
function _clMine(c) {
  const me = _clMe();
  return !!me && _clList(c && c.players).some(p => _clCanon(p) === _clCanon(me));
}
const _clChar = (c, n) => ((c && c.chars) || {})[_clKey(n)] || '';

// ── The games: plays of this franchise logged as "Game N" ──
function _clPlayKey(p) { return String(p.mp || p._uuid || p.e || p.t || p.date).replace(/[.#$\[\]\/ ]/g, '_'); }
// Its plays: from its first day, with nobody outside the franchise at the table
// (someone missing a game is fine).
function _clPlays(c) {
  const party = new Set(_clList(c.players).map(_clCanon));
  if (!party.size) return [];
  const from = c.start || '';
  return (PLAY_HISTORY[CL_BGGID] || []).filter(p => p && p.date >= from && Array.isArray(p.sc) && p.sc.length
    && p.sc.every(s => s && party.has(_clCanon(s.n))));
}
function _clGameNo(c, p) {
  const a = (c.assign || {})[_clPlayKey(p)];
  if (a) return Number(a);
  const m = String(p.b || '').match(CL_GAME_RE);
  return m ? Number(m[1]) : 0;
}
// { games: [{ n, p, i (its place in PLAY_HISTORY) }] in order, loose: plays with no game number }
function _clGames(c) {
  const all = PLAY_HISTORY[CL_BGGID] || [];
  const byN = new Map(), loose = [];
  for (const p of _clPlays(c)) {
    const n = _clGameNo(c, p);
    if (!n) { loose.push(p); continue; }
    const had = byN.get(n);
    if (!had || String(p.t || p.date) > String(had.p.t || had.p.date)) byN.set(n, { n, p, i: all.indexOf(p) });
  }
  return { games: [...byN.values()].sort((a, b) => a.n - b.n), loose };
}
const _clNext = (games) => (games.length ? games[games.length - 1].n : 0) + 1;

// A game's Employee Reviews: each player's checkmarks.
function _clReview(c, g) {
  const x = (c.games || {})[g.n] || {};
  return g.p.sc.map(s => {
    const k = _clKey(s.n);
    const v = typeof _recScore === 'function' ? _recScore(s.s) : (isFinite(parseFloat(s.s)) ? parseFloat(s.s) : null);
    const pts = v !== null && v > 0, won = !!s.w, goals = !!(x.goals || {})[k];
    const extra = Math.max(0, Number((x.extra || {})[k]) || 0);
    return { n: s.n, k, v, pts, won, goals, extra, checks: (pts ? 1 : 0) + (won ? 1 : 0) + (goals ? 1 : 0) + extra };
  });
}
// Everyone's standing after the games so far: checkmarks, promotions (and in
// which game), wins, points; and the Dran Enterprises Track's Xs.
function _clStanding(c) {
  const { games, loose } = _clGames(c);
  const st = new Map();
  const of = (n) => {
    const k = _clKey(n);
    if (!st.has(k)) st.set(k, { n, k, checks: 0, wins: 0, pts: 0, played: 0, goals: 0, promos: [] });
    return st.get(k);
  };
  _clList(c.players).forEach(of);
  let dran = 0;
  const xs = [];
  for (const g of games) {
    const rev = _clReview(c, g);
    if (rev.some(r => r.v === 0)) { dran++; xs.push(g.n); }
    for (const r of rev) {
      const s = of(r.n);
      const before = s.checks;
      s.checks += r.checks;
      s.played++;
      if (r.won) s.wins++;
      if (r.v) s.pts += r.v;
      if (r.goals) s.goals++;
      for (const [at, name] of CL_RANKS) if (before < at && s.checks >= at) s.promos.push({ name, at, game: g.n });
    }
  }
  return { players: [...st.values()], dran, xs, games, loose };
}
const _clRank = (checks) => { let r = ''; for (const [at, name] of CL_RANKS) if (checks >= at) r = name; return r; };
const _clNextRank = (checks) => CL_RANKS.find(([at]) => checks < at) || null;

// Where a campaign stands, for its tab and Play → Campaigns: { pct, text, done }
function clSummary(c) {
  const { games } = _clGames(c);
  const n = games.length, next = _clNext(games);
  return { pct: Math.min(100, Math.round((n / CL_GAMES) * 100)), text: n ? `${n} game${n === 1 ? '' : 's'} played · Game ${next} next` : 'Game 1 next', done: false };
}
function _clState(c) {
  if (c.status === 'stopped') return `stopped ${_clDate(c.stopped)}`;
  return clSummary(c).text;
}

// ── Firebase ──
async function _clLoad(force) {
  if (force || !_clCamps) {
    const { main, spare } = await fbReadBoth(CL_NODE);
    _clCamps = {};
    _clSrc = {};
    for (const [store, data] of [['spare', spare], ['main', main]]) {
      for (const id in (data || {})) { if (data[id] && typeof data[id] === 'object') { _clCamps[id] = data[id]; _clSrc[id] = store; } }
    }
  }
  if (_clId && !_clCamps[_clId]) _clId = null;
}
// Some fields of the campaign: {path: value}, path relative to it ("games/3/side");
// null removes. Firebase applies them together, leaving the rest alone, so two
// phones filling in different boxes don't overwrite each other.
async function _clPatch(updates, id = _clId) {
  const c = _clCamps[id];
  if (!c) return;
  for (const [path, v] of Object.entries(updates)) _clSetAt(c, path.split('/'), v);
  c.updated = Date.now();
  try {
    await fbWrite(`${CL_NODE}/${id}`, 'PATCH', { ...updates, updated: c.updated }, _clSrc[id]);
  } catch (e) {
    console.warn('Clank! Legacy campaign: not saved', e);
    _clToast('Not saved. Check the connection and try again.');
  }
}
function _clSetAt(o, parts, v) {
  for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
  const last = parts[parts.length - 1];
  if (v === null || v === undefined) delete o[last]; else o[last] = v;
}
function _clToast(msg, ok) {
  const el = document.querySelector('.cl .rv-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('ok', !!ok);
  el.hidden = false;
  clearTimeout(_clToast.t);
  _clToast.t = setTimeout(() => { el.hidden = true; }, 5000);
}

// ── Following the campaign while it's on screen (as the Codenames campaign does) ──
function _clShown() {
  const ov = document.getElementById('modal-overlay');
  return !!(_clPanel && _clPanel.isConnected && ov && ov.classList.contains('open') && !document.hidden);
}
function _clFollow() {
  const id = _clId;
  if (_clES && _clESid === id && _clES.readyState !== 2) return;
  _clUnfollow();
  if (!id || typeof EventSource === 'undefined' || !FIREBASE_DB || !_clShown()) return;
  const path = `${CL_NODE}/${id}`;
  const es = new EventSource(`${FIREBASE_DB}/${_clSrc[id] === 'spare' ? _fbSpare(path) : path}.json`);
  const on = (kind) => (ev) => {
    let msg = null;
    try { msg = JSON.parse(ev.data); } catch (_) {}
    if (msg && typeof msg.path === 'string') _clApply(id, kind, msg.path, msg.data);
  };
  es.addEventListener('put', on('put'));
  es.addEventListener('patch', on('patch'));
  es.addEventListener('keep-alive', () => { if (!_clShown()) _clUnfollow(); });
  es.addEventListener('cancel', _clUnfollow);
  _clES = es;
  _clESid = id;
  if (!_clWatch && typeof MutationObserver === 'function') {
    _clWatch = new MutationObserver(() => { if (!_clShown()) _clUnfollow(); });
    _clWatch.observe(document.getElementById('modal-overlay'), { attributes: true, attributeFilter: ['class'] });
  }
}
function _clUnfollow() {
  if (_clES) _clES.close();
  _clES = null;
  _clESid = null;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) _clUnfollow(); else if (_clShown()) _clFollow(); });
function _clApply(id, kind, path, data) {
  const before = JSON.stringify(_clCamps[id] || null);
  const parts = path.split('/').filter(Boolean);
  const box = { c: _clCamps[id] };
  const put = (p, v) => _clSetAt(box, ['c', ...p], v);
  if (kind === 'put') put(parts, data);
  else for (const k in data || {}) put([...parts, ...k.split('/').filter(Boolean)], data[k]);
  if (box.c) _clCamps[id] = box.c; else delete _clCamps[id];
  if (JSON.stringify(box.c || null) === before || id !== _clId) return;
  if (!box.c) _clId = null;
  _clRedraw();
}
// Drawn again, unless someone's typing in it (then once they leave the field).
function _clRedraw() {
  const p = _clPanel;
  if (!p || !p.isConnected) return;
  const a = document.activeElement;
  if (a && p.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) { _clLate = true; return; }
  _clRender(p);
}

// ── The tab ──
function buildClCampaignHtml(game) {
  if (!game || Number(game.bggId) !== CL_BGGID) return '';
  return `<div class="rv cr cl" data-cl><div class="rv-loading">Opening the campaigns…</div></div>`;
}
function wireClCampaign(content) {
  const panel = content.querySelector('[data-cl]');
  if (!panel) return;
  _clPanel = panel;
  _clLoad(true).then(() => _clRender(panel)).catch(e => {
    panel.innerHTML = `<div class="rv-loading">The campaigns couldn't be loaded. Try again in a moment.</div>`;
    console.warn('Clank! Legacy campaign:', e);
  });
  panel.addEventListener('click', (ev) => _clClick(panel, ev));
  panel.addEventListener('input', (ev) => _clInput(panel, ev));
  panel.addEventListener('change', (ev) => _clChange(panel, ev));
  panel.addEventListener('focusout', () => setTimeout(() => {
    const a = document.activeElement;
    if (_clLate && !(a && panel.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName))) _clRender(panel);
  }, 250));
}

// The campaigns as tabs: yours first, the stopped ones apart.
function _clTabsHtml() {
  const esc = _escapeHtml;
  const ids = Object.keys(_clCamps).sort((a, b) => (_clMine(_clCamps[b]) - _clMine(_clCamps[a])) || ((_clCamps[b].updated || 0) - (_clCamps[a].updated || 0)));
  const tab = (id) => {
    const c = _clCamps[id];
    const who = _clList(c.players).join(', ');
    return `<button type="button" class="cr-camp${id === _clId ? ' on' : ''}${c.status ? ' ended' : ''}" data-cl-camp="${esc(id)}" style="--cr-c:#c8962e" aria-expanded="${id === _clId}">
      <b>${esc(c.name || who || 'A franchise')}</b>
      <span>${esc(_clState(c))}</span>
      ${c.name && who ? `<span class="cr-camp-who">${esc(who)}</span>` : ''}</button>`;
  };
  const active = ids.filter(id => !_clCamps[id].status), ended = ids.filter(id => _clCamps[id].status);
  const isNew = !_clId && !!_clDraft;
  return `<div class="cr-camps">${active.map(tab).join('')}
      <button type="button" class="cr-camp cr-camp-new${isNew ? ' on' : ''}" data-cl-camp="__new" aria-expanded="${isNew}"><b>+ A new campaign</b><span>For your franchise</span></button></div>
    ${ended.length ? `<div class="rv-sub">Stopped</div><div class="cr-camps">${ended.map(tab).join('')}</div>` : ''}
    ${!_clId && !_clDraft && ids.length ? '<div class="rv-hint cr-camps-hint">Tap a campaign to open it.</div>' : ''}`;
}

function _clRender(panel) {
  const esc = _escapeHtml;
  _clPanel = panel;
  _clLate = false;
  const c = _clId && _clCamps[_clId];
  if (!c) {
    _clUnfollow();
    panel.innerHTML = `${_clTabsHtml()}${_clDraft ? _clStartHtml() : ''}<div class="rv-toast" hidden></div>${_clCreditHtml()}`;
    _clWire(panel);
    return;
  }
  const edit = _clCanEdit(c);
  const players = _clList(c.players);
  const tabs = [['camp', 'Campaign'], ['reports', 'Mission Reports'], ['notes', 'Notes']];
  const body = { camp: _clCampHtml, reports: _clReportsHtml, notes: _clNotesHtml }[_clTab](c, edit);
  panel.innerHTML = `
    ${_clTabsHtml()}
    <div class="cr-open cl-open">
    <div class="rv-head">
      <input class="rv-party" data-cl-text="name" value="${esc(c.name || '')}" placeholder="The franchise&rsquo;s name" ${edit ? '' : 'readonly'} aria-label="The franchise's name">
    </div>
    <div class="cr-sub">${players.map(n => `${esc(n)}${_clChar(c, n) ? ` <i>as ${esc(_clChar(c, n))}</i>` : ''}`).join(' · ')}${c.start ? ` · since ${esc(_clDate(c.start))}` : ''}</div>
    ${edit ? '' : `<div class="rv-ro">${_clMe() ? 'Only its players can fill in this campaign.' : 'Pick who you are to fill in the campaign.'}</div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_clTab === k ? ' on' : ''}" data-cl-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body${edit ? '' : ' rv-readonly'}">${body}</div>
    </div>
    <div class="rv-toast" hidden></div>
    ${_clCreditHtml()}`;
  _clWire(panel);
  _clFollow();
}
function _clCreditHtml() {
  return `<div class="rv-credit">The end-of-game steps from Dire Wolf&rsquo;s <a href="https://www.direwolfdigital.com/clank-legacy-acquisitions-incorporated/" target="_blank" rel="noopener">rulebook and FAQ</a>, in short. Nothing of the story is here: the Book of Secrets has it.</div>`;
}

// ── People: typed, with everyone the app knows offered ──
function _clNames(not) {
  const me = _clMe();
  const all = [...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].sort((a, b) => a.localeCompare(b));
  return [...new Set([me, ...all].filter(Boolean))].filter(n => !not.some(x => _clCanon(x) === _clCanon(n)));
}
function _clClean(v) {
  v = String(v || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return _clNames([]).find(n => n.toLowerCase() === v.toLowerCase()) || v;
}
function _clPeopleHtml(names, xAttr, addAttr, edit) {
  const esc = _escapeHtml;
  return `<div class="cr-people">${names.map(p => `<span class="cr-person">${esc(p)}${edit ? `<button type="button" class="cr-person-x" ${xAttr}="${esc(p)}" aria-label="Take ${esc(p)} off">&times;</button>` : ''}</span>`).join('')}
    ${edit && names.length < CL_MAX ? `<input class="rv-in cr-who" ${addAttr} placeholder="Add a player" maxlength="40" enterkeyhint="done">` : names.length ? '' : '<span class="cr-note">nobody yet</span>'}</div>`;
}
function _clWire(panel) {
  if (typeof comboAttach !== 'function') return;
  panel.querySelectorAll('input[data-cl-who]').forEach(inp => {
    const where = inp.dataset.clWho;
    const taken = () => (where === 'draft' ? _clDraft.players : _clList((_clCamps[_clId] || {}).players));
    comboAttach(inp, { options: () => _clNames(taken()), onPick: (v) => _clAddPlayer(panel, where, v), max: 80 });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); _clAddPlayer(panel, where, inp.value); } });
  });
}
function _clAddPlayer(panel, where, v) {
  v = _clClean(v);
  if (!v) return;
  if (where === 'draft') {
    if (_clDraft.players.length < CL_MAX && !_clDraft.players.some(p => _clCanon(p) === _clCanon(v))) _clDraft.players.push(v);
    _clRender(panel);
    return;
  }
  const c = _clCamps[_clId];
  const players = _clList(c && c.players);
  if (!c || !_clCanEdit(c) || players.length >= CL_MAX || players.some(p => _clCanon(p) === _clCanon(v))) { _clRender(panel); return; }
  _clPatch({ players: [...players, v] }).then(() => _clRender(panel));
}

// ── Starting a campaign: the franchise's players and the names on their deck boxes ──
function _clStartHtml() {
  const esc = _escapeHtml;
  const d = _clDraft;
  return `<div class="rv-start cr-start">
    <div class="rv-start-title">Start a campaign</div>
    <div class="rv-start-sub">Your franchise: two to four players, each with the same deck box for the whole campaign. Each game is logged as a play (Game 1, Game 2…); its Mission Report, the Employee Reviews, everyone&rsquo;s Associate Status and the Dran Enterprises Track are kept here.</div>
    <div class="rv-sub">Players <span class="cr-count">${d.players.length} of ${CL_MAX}</span></div>
    ${_clPeopleHtml(d.players, 'data-cl-draft-x', 'data-cl-who="draft"', true)}
    ${d.players.length ? `<div class="rv-sub">The names on their deck boxes <span class="cr-count">optional</span></div>
    <div class="cl-chars">${d.players.map(n => `<label class="rv-field"><span>${esc(n)}</span><input class="rv-in" data-cl-draft-char="${esc(n)}" value="${esc(d.chars[n] || '')}" placeholder="Their character" maxlength="40"></label>`).join('')}</div>` : ''}
    <div class="rv-fields pc-fields">
      <label class="rv-field"><span>Franchise</span><input class="rv-in" data-cl-draft-name value="${esc(d.name)}" placeholder="Optional: its name" maxlength="40"></label>
      <label class="rv-field"><span>From</span><input type="date" class="rv-in" data-cl-draft-start value="${esc(d.start)}" max="${_clToday()}"></label>
    </div>
    ${_clMe() ? `<button type="button" class="rv-btn" data-cl-start${d.players.length >= 2 ? '' : ' disabled'}>Start the campaign</button>${d.players.length >= 2 ? '' : '<div class="rv-hint">Two players at least.</div>'}` : '<div class="rv-start-sub">Pick who you are to start one.</div>'}
  </div>`;
}

// ── The Campaign tab: the next game, the last game's reviews, everyone's status ──
function _clCampHtml(c, edit) {
  const esc = _escapeHtml;
  const S = _clStanding(c);
  const next = _clNext(S.games);
  const last = S.games[S.games.length - 1];
  const reviewFirst = last && !((c.games || {})[last.n] || {}).done;
  const signed = typeof acctMe === 'function' && acctMe();
  const logging = _clLog && _clLog.id === _clId && _clLog.n === next;
  const nextHtml = `<div class="cl-next">
      <div class="cl-next-n"><small>Next</small><b>Game ${next}</b>${next > CL_GAMES ? '<small>after the ten</small>' : ''}</div>
      <div class="cl-next-do">
        <ol class="cl-steps">
          <li>Read Game ${next}&rsquo;s Prologue: the Mission Reports say which passage, and it says which side of the board.</li>
          ${S.games.length ? '<li>Put any Contracts carried over above the board and read them aloud.</li>' : ''}
          <li>Each player takes their own deck box${S.games.length ? '' : ' and writes their character&rsquo;s name on it'}.</li>
        </ol>
        ${edit && signed ? (logging ? '' : `<button type="button" class="rv-btn" data-cl-log>Log Game ${next}</button><div class="rv-hint">Once it&rsquo;s played: just everyone&rsquo;s points. Its Employee Reviews come up here.</div>`)
          : edit ? '<div class="rv-hint">Sign in to log the game.</div>' : ''}
      </div>
    </div>${logging && edit && signed ? _clLogHtml(c, next) : ''}`;
  const reviewHtml = last ? _clReviewHtml(c, last, S, edit, true) : '';
  return `${reviewFirst ? reviewHtml + nextHtml : nextHtml + (last ? reviewHtml : '')}
    ${S.loose.length ? `<div class="cl-loose">${S.loose.length} play${S.loose.length === 1 ? '' : 's'} of yours without a game number: the Mission Reports tab sets ${S.loose.length === 1 ? 'it' : 'them'}.</div>` : ''}
    ${_clStatusHtml(c, S, edit)}
    ${_clDranHtml(S)}
    ${edit ? `<div class="cl-sec"><div class="rv-sub">The franchise&rsquo;s players</div>
      ${_clPeopleHtml(_clList(c.players), 'data-cl-x', 'data-cl-who="camp"', true)}
      <label class="pc-from">Its plays count from <input type="date" class="rv-in" data-cl-from value="${esc(c.start || '')}" max="${_clToday()}"></label></div>` : ''}
    ${edit ? `<div class="pc-foot">${c.status ? '<button type="button" class="rv-link" data-cl-resume>Pick it up again</button>' : '<button type="button" class="rv-link" data-cl-stop>Stop this campaign</button>'}<button type="button" class="rv-link pc-del" data-cl-delete>Delete this campaign</button></div>` : ''}`;
}

// A game's end, in the rulebook's order: its Mission Report (the scores from
// the play, the Associate Spotlight), the Epilogue, the Employee Reviews
// (worked out here; the Personal Goals row and any checkmark a Contract or a
// passage gave are ticked), the promotions they bring, the Dran Enterprises
// Track if anyone scored 0.
function _clReviewHtml(c, g, S, edit, isLast) {
  const esc = _escapeHtml;
  const x = (c.games || {})[g.n] || {};
  const rev = _clReview(c, g);
  const winner = rev.filter(r => r.won).map(r => r.n);
  const zero = rev.some(r => r.v === 0);
  const promos = S.players.flatMap(s => s.promos.filter(p => p.game === g.n).map(p => ({ ...p, n: s.n })));
  const play = g.i >= 0 ? PLAY_HISTORY[CL_BGGID][g.i] : null;
  const acts = play && g.i >= 0 ? (typeof bgsSendBtnHtml === 'function' ? bgsSendBtnHtml(CL_BGGID, g.i) : '') + (play.mp && typeof logPlayEditBtnHtml === 'function' ? logPlayEditBtnHtml(play) : '') : '';
  const side = (k, l) => `<button type="button" class="cl-chip${x.side === k ? ' on' : ''}" data-cl-side="${g.n}|${k}" aria-pressed="${x.side === k}"${edit ? '' : ' disabled'}>${l}</button>`;
  const rows = rev.map(r => `<div class="cl-rev-row">
      <span class="cl-rev-who"><b>${esc(r.n)}</b>${_clChar(c, r.n) ? `<small>${esc(_clChar(c, r.n))}</small>` : ''}</span>
      <span class="cl-rev-pts${r.v === 0 ? ' zero' : ''}">${r.v === null ? '–' : r.v}${r.won ? ' <span class="cl-mve" title="Most Valuable Employee">&#9733;</span>' : ''}</span>
      <span class="cl-rev-sum">+${r.checks}&#10003;</span>
      <span class="cl-ticks">
        <span class="cl-tick${r.pts ? ' on' : ''}" title="Scored more than 0">&#10003; scored</span>
        <span class="cl-tick${r.won ? ' on' : ''}" title="Won the game">&#10003; won</span>
        <button type="button" class="cl-tick cl-tap${r.goals ? ' on' : ''}" data-cl-goals="${g.n}|${esc(r.k)}" aria-pressed="${r.goals}"${edit ? '' : ' disabled'}>&#10003; Personal Goals row</button>
        <span class="cl-extra">${edit ? `<button type="button" class="cl-step" data-cl-extra="${g.n}|${esc(r.k)}|-1" aria-label="One fewer"${r.extra ? '' : ' disabled'}>&minus;</button>` : ''}<span title="Checkmarks a Contract or a passage gave">+${r.extra} other</span>${edit ? `<button type="button" class="cl-step" data-cl-extra="${g.n}|${esc(r.k)}|1" aria-label="One more">+</button>` : ''}</span>
      </span>
    </div>`).join('');
  return `<div class="cl-review${isLast ? ' last' : ''}">
    <div class="cl-rev-head"><b>Game ${g.n}</b><span>${esc(_clDate(g.p.date))}${winner.length ? ` · &#9733; ${winner.map(esc).join(', ')}` : ''}</span><span class="cl-acts">${acts}</span></div>
    <ol class="cl-steps">
      <li><b>Mission Report</b>: write the scores in Game ${g.n}&rsquo;s row, and the Associate Spotlight:
        <div class="cl-spot">${rev.map(r => `<button type="button" class="cl-chip${x.spot === r.n ? ' on' : ''}" data-cl-spot="${g.n}|${esc(r.n)}" aria-pressed="${x.spot === r.n}"${edit ? '' : ' disabled'}>${esc(r.n)}</button>`).join('')}
          <input class="rv-in cl-spot-note" data-cl-spotnote="${g.n}" value="${esc(x.spotNote || '')}" placeholder="What for (optional)" maxlength="80" ${edit ? '' : 'readonly'}></div>
        <div class="cl-side">Board: ${side('over', 'Overworld')}${side('under', 'Underworld')}</div></li>
      <li><b>Contracts and the Epilogue</b>: any Contract with end-of-game instructions, then Game ${g.n}&rsquo;s Epilogue passage.</li>
      <li><b>Employee Reviews</b>: a checkmark for scoring above 0, one for winning, one for completing a row of Personal Goals; and any a Contract or passage gave this game.
        <div class="cl-rev">${rows}</div></li>
      ${promos.length ? `<li><b>Promoted!</b> ${promos.map(p => `${esc(p.n)} reaches <span class="cl-rank cl-r-${p.name.toLowerCase()}">${p.name}</span> (the ${_clOrd(p.at)} checkmark): read the entry shown there on the deck box.`).join(' ')}</li>` : ''}
      <li><b>Reset</b>: every deck back to its ten starting cards; no tokens are kept.</li>
      ${zero ? '<li class="cl-dranstep"><b>Someone scored 0</b>: add one X to the Dran Enterprises Track (the rulebook&rsquo;s back cover) and read the passage it shows.</li>' : ''}
      <li><b>Contracts still in the row</b> carry over to the next game: they stay in the box with your Reserve.</li>
    </ol>
    ${edit && isLast && !x.done ? `<button type="button" class="rv-btn rv-btn-sm" data-cl-done="${g.n}">Reviews done</button>` : ''}
  </div>`;
}

// Associate Status: each player's checkmarks on a track like the deck box's,
// its sections from Copper (5), Silver (11) and Gold (18).
function _clStatusHtml(c, S, edit) {
  const esc = _escapeHtml;
  const len = Math.max(21, ...S.players.map(s => s.checks + 1));
  const sec = (i) => (i >= 18 ? 'g' : i >= 11 ? 's' : i >= 5 ? 'c' : 'n');
  const rows = S.players.map(s => {
    const rank = _clRank(s.checks), nr = _clNextRank(s.checks);
    const boxes = Array.from({ length: len }, (_, j) => {
      const i = j + 1, mark = CL_RANKS.find(([at]) => at === i);
      return `<i class="cl-box cl-${sec(i)}${i <= s.checks ? ' on' : ''}${mark ? ' cl-mark' : ''}" title="${i}${mark ? `: ${mark[1]}` : ''}"></i>`;
    }).join('');
    const ch = _clChar(c, s.n);
    return `<div class="cl-as">
      <div class="cl-as-head"><b>${esc(s.n)}</b>
        ${edit ? `<input class="rv-in cl-char" data-cl-char="${esc(s.k)}" value="${esc(ch)}" placeholder="name on the deck box" maxlength="40">` : ch ? `<small>${esc(ch)}</small>` : ''}
        ${rank ? `<span class="cl-rank cl-r-${rank.toLowerCase()}">${rank}</span>` : ''}<span class="cl-as-n">${s.checks}&#10003;</span></div>
      <div class="cl-track">${boxes}</div>
      <div class="cl-as-sub">${s.wins} win${s.wins === 1 ? '' : 's'} · ${s.played} game${s.played === 1 ? '' : 's'}${s.played ? ` · ${s.pts} points` : ''}${s.goals ? ` · ${s.goals} Personal Goals row${s.goals === 1 ? '' : 's'}` : ''}${nr ? ` · ${nr[1]} in ${nr[0] - s.checks}` : ''}</div>
    </div>`;
  }).join('');
  return `<div class="cl-sec"><div class="rv-sub">Associate Status</div>${rows}
    <div class="rv-hint">Your deck box has the track itself: this one follows the games logged here (and the Personal Goals and other checkmarks ticked in their reviews).</div></div>`;
}
function _clDranHtml(S) {
  return `<div class="cl-sec cl-dran"><div class="rv-sub">Dran Enterprises Track</div>
    <div class="cl-xs">${S.dran ? S.xs.map(n => `<span class="cl-x" title="Game ${n}">&#10007;</span>`).join('') : '<span class="cr-note">No X yet: nobody has scored 0.</span>'}</div></div>`;
}
// ── Logging the next game in the tab: the franchise's players, their points ──
function _clLogStart(c, n) {
  const { games } = _clGames(c);
  const prev = games.length ? games[games.length - 1].p : null;
  const rows = {};
  for (const name of _clList(c.players)) rows[_clKey(name)] = { s: '', out: false };
  _clLog = { id: _clId, n, rows, win: null, date: _clToday(),
    l: (prev && prev.l) || (typeof _lpPlaces === 'function' ? _lpPlaces()[0] : '') || '' };
}
const _clLogPts = (v) => (typeof _recScore === 'function' ? _recScore(v) : (isFinite(parseFloat(v)) ? parseFloat(v) : null));
// Who's starred: the ones picked, or else the best score (a tie stars both).
function _clLogWinners(c, L) {
  const playing = _clList(c.players).map(_clKey).filter(k => L.rows[k] && !L.rows[k].out);
  if (L.win) return new Set(L.win.filter(k => playing.includes(k)));
  let best = null;
  for (const k of playing) { const v = _clLogPts(L.rows[k].s); if (v !== null && (best === null || v > best)) best = v; }
  return new Set(best === null ? [] : playing.filter(k => _clLogPts(L.rows[k].s) === best));
}
function _clLogReady(c, L) {
  const playing = _clList(c.players).map(_clKey).filter(k => L.rows[k] && !L.rows[k].out);
  return playing.length > 0 && playing.every(k => _clLogPts(L.rows[k].s) !== null) && !!L.date;
}
function _clLogHtml(c, n) {
  const esc = _escapeHtml;
  const L = _clLog;
  const wins = _clLogWinners(c, L);
  const rows = _clList(c.players).map(name => {
    const k = _clKey(name), r = L.rows[k] || { s: '', out: false }, ch = _clChar(c, name);
    return `<div class="cl-log-row${r.out ? ' out' : ''}">
      <button type="button" class="cl-log-who" data-cl-lout="${esc(k)}" aria-pressed="${!r.out}" title="${r.out ? 'Tap: they played after all' : 'Tap if they sat this one out'}"><b>${esc(name)}</b><small>${r.out ? 'sat this one out' : esc(ch)}</small></button>
      <input class="rv-in cl-log-s" data-cl-ls="${esc(k)}" value="${esc(r.s)}" inputmode="numeric" placeholder="points" maxlength="12" aria-label="${esc(name)}'s points"${r.out ? ' disabled' : ''}>
      <button type="button" class="cl-log-star${wins.has(k) ? ' on' : ''}" data-cl-lwin="${esc(k)}" aria-pressed="${wins.has(k)}" aria-label="${esc(name)} won"${r.out ? ' disabled' : ''}>&#9733;</button>
    </div>`;
  }).join('');
  return `<div class="cl-log">
    <div class="cl-log-title">Game ${n}: the points</div>
    <div class="cl-log-rows">${rows}</div>
    <div class="rv-fields pc-fields">
      <label class="rv-field"><span>Date</span><input type="date" class="rv-in" data-cl-ldate value="${esc(L.date)}" max="${_clToday()}"></label>
      <label class="rv-field"><span>Where</span><input class="rv-in" data-cl-lplace value="${esc(L.l)}" placeholder="Optional" maxlength="60"></label>
    </div>
    <div class="cl-log-acts"><button type="button" class="rv-btn" data-cl-lsave${_clLogReady(c, L) ? '' : ' disabled'}>Save Game ${n}</button><button type="button" class="rv-link" data-cl-lcancel>Cancel</button></div>
    <div class="rv-hint">Knocked out in the Depths: 0. The best score gets the &#9733;; tap a star to change it. Tap a name if they sat this one out. Then BG Stats&rsquo; QR code opens. <button type="button" class="rv-link" data-cl-lsheet>Count it on the score sheet instead</button></div>
  </div>`;
}
// Typing a score: the stars and the Save button follow, without drawing the form again.
function _clLogSync(panel, c) {
  const L = _clLog;
  if (!L) return;
  const wins = _clLogWinners(c, L);
  panel.querySelectorAll('[data-cl-lwin]').forEach(b => { const on = wins.has(b.dataset.clLwin); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  const save = panel.querySelector('[data-cl-lsave]');
  if (save) save.disabled = !_clLogReady(c, L);
}
async function _clLogSave(panel, c, btn) {
  const L = _clLog;
  if (!L || !_clLogReady(c, L) || typeof logPlaySave !== 'function') return;
  const wins = _clLogWinners(c, L);
  const sc = _clList(c.players).filter(n => !(L.rows[_clKey(n)] || {}).out).map(n => {
    const k = _clKey(n), seat = { n, s: String(L.rows[k].s).trim(), w: wins.has(k) };
    if (_clChar(c, n)) seat.r = _clChar(c, n);
    return seat;
  });
  const d = new Date(), pad = (x) => String(x).padStart(2, '0');
  const rec = { bggId: CL_BGGID, date: L.date, t: `${L.date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`, b: `Game ${L.n}`, sc };
  if (L.l.trim()) rec.l = L.l.trim().slice(0, 60);
  btn.disabled = true;
  btn.textContent = 'Saving…';
  let r;
  try { r = await logPlaySave(rec); }
  catch (e) {
    btn.disabled = false;
    btn.textContent = `Save Game ${L.n}`;
    _clToast(`Not saved: ${e.message || 'check the connection and try again'}.`);
    return;
  }
  _clLog = null;
  _clRender(panel);
  if (r.pending) _clToast('No signal, so the game is kept on this phone. It goes up by itself when you\'re back online.', true);
  else _clToast(`Game ${rec.b.slice(5)} saved.${r.moments && r.moments[0] ? ` ${r.moments[0].text}` : ''}`, true);
  const i = (PLAY_HISTORY[CL_BGGID] || []).findIndex(e => e.mp === r.id);
  if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(CL_BGGID, i);
}

// ── Mission Reports: the games so far, each opening to its report ──
function _clReportsHtml(c, edit) {
  const esc = _escapeHtml;
  const S = _clStanding(c);
  const byN = new Map(S.games.map(g => [g.n, g]));
  const upTo = Math.max(CL_GAMES, _clNext(S.games));
  const rowsHtml = Array.from({ length: upTo }, (_, j) => {
    const n = j + 1, g = byN.get(n);
    if (!g) return `<div class="cl-mr todo"><b>Game ${n}</b><span>${n === _clNext(S.games) ? 'next' : ''}</span></div>`;
    const x = (c.games || {})[n] || {};
    const rev = _clReview(c, g);
    const open = _clGameOpen === n;
    const scores = rev.map(r => `${esc(r.n)} <b class="${r.v === 0 ? 'zero' : ''}">${r.v === null ? '–' : r.v}</b>${r.won ? '&#9733;' : ''}`).join(' · ');
    return `<div class="cl-mr${open ? ' open' : ''}">
      <button type="button" class="cl-mr-line" data-cl-game="${n}" aria-expanded="${open}">
        <b>Game ${n}</b><span class="cl-mr-when">${esc(_clDate(g.p.date))}${x.side ? ` · ${x.side === 'over' ? 'Overworld' : 'Underworld'}` : ''}</span>
        <span class="cl-mr-scores">${scores}</span>
        <span class="cl-mr-more">${x.spot ? `Spotlight: ${esc(x.spot)}${x.spotNote ? ` (${esc(x.spotNote)})` : ''} · ` : ''}+${rev.reduce((a, r) => a + r.checks, 0)}&#10003;${rev.some(r => r.v === 0) ? ' · &#10007; Dran' : ''}</span>
      </button>
      ${open ? _clReviewHtml(c, g, S, edit, false) : ''}
    </div>`;
  }).join('');
  const loose = S.loose.map(p => {
    const key = _clPlayKey(p);
    return `<div class="cl-mr cl-mr-loose"><b>${esc(_clDate(p.date))}</b><span>${p.sc.map(s => `${esc(s.n)} ${esc(s.s || '–')}${s.w ? '&#9733;' : ''}`).join(' · ')}</span>
      ${edit ? `<label class="cl-assign">Game <select class="rv-in" data-cl-assign="${esc(key)}"><option value="">?</option>${Array.from({ length: upTo }, (_, j) => `<option value="${j + 1}"${byN.has(j + 1) ? ' disabled' : ''}>${j + 1}</option>`).join('')}</select></label>` : ''}</div>`;
  }).join('');
  const st = S.players.slice().sort((a, b) => b.checks - a.checks || b.wins - a.wins || b.pts - a.pts);
  return `<div class="cl-mrs">${rowsHtml}</div>
    ${loose ? `<div class="rv-sub">Plays of yours without a game number</div>${loose}` : ''}
    ${S.games.length ? `<div class="rv-sub">So far</div>
    <div class="cl-table">${st.map(s => `<div class="cl-trow"><b>${esc(s.n)}</b><span>${s.checks}&#10003;</span><span>${s.wins} win${s.wins === 1 ? '' : 's'}</span><span>${s.played ? Math.round(s.pts / s.played) : 0} a game</span></div>`).join('')}</div>
    <div class="rv-hint">The Home Office weighs the Mission Reports and the checkmarks at the end of the campaign; how, the campaign tells you then.</div>` : ''}`;
}

function _clNotesHtml(c, edit) {
  return `<textarea class="rv-in cr-notes" data-cl-text="notes" rows="10" placeholder="What the franchise learned, where you stopped, who owes whom…" ${edit ? '' : 'readonly'}>${_escapeHtml(c.notes || '')}</textarea>`;
}

// ── What a tap or an edit does ──
async function _clClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.clCamp) {
    if (ds.clCamp === '__new') {
      const open = !_clId && _clDraft;
      _clDraft = open ? null : { name: '', players: _clMe() ? [_clMe()] : [], chars: {}, start: _clToday() };
      _clId = null;
    } else {
      _clId = _clId === ds.clCamp ? null : ds.clCamp;
      _clDraft = null;
      _clTab = 'camp';
      _clGameOpen = null;
    }
    _clRender(panel);
    return;
  }
  if (ds.clDraftX) { _clDraft.players = _clDraft.players.filter(p => p !== ds.clDraftX); _clRender(panel); return; }
  if (ds.clStart !== undefined) {
    const d = _clDraft;
    if (!d || d.players.length < 2) return;
    t.disabled = true;
    const chars = {};
    for (const n of d.players) if ((d.chars[n] || '').trim()) chars[_clKey(n)] = d.chars[n].trim().slice(0, 40);
    const now = Date.now();
    const rec = { name: d.name.trim(), players: d.players, chars, start: d.start || _clToday(), by: _clMe(), created: now, updated: now };
    try {
      const { store, json } = await fbWrite(CL_NODE, 'POST', rec);
      _clCamps[json.name] = rec;
      _clSrc[json.name] = store;
      _clId = json.name;
      _clDraft = null;
      _clTab = 'camp';
    } catch (e) {
      console.warn('Clank! Legacy campaign: not started', e);
      t.disabled = false;
      t.textContent = 'Couldn\'t start it. Try again';
      return;
    }
    _clRender(panel);
    return;
  }
  if (ds.clTab) { _clTab = ds.clTab; _clGameOpen = null; _clRender(panel); return; }
  if (ds.clGame) { const n = Number(ds.clGame); _clGameOpen = _clGameOpen === n ? null : n; _clRender(panel); return; }
  const c = _clCamps[_clId];
  if (!c || !_clCanEdit(c)) return;
  if (ds.clLog !== undefined) { _clLogStart(c, _clNext(_clGames(c).games)); _clRender(panel); return; }
  if (ds.clLcancel !== undefined) { _clLog = null; _clRender(panel); return; }
  if (ds.clLsave !== undefined) { await _clLogSave(panel, c, t); return; }
  if (ds.clLout && _clLog) {
    const r = _clLog.rows[ds.clLout];
    if (r) r.out = !r.out;
    _clRender(panel);
    return;
  }
  if (ds.clLwin && _clLog) {
    const cur = _clLogWinners(c, _clLog);
    if (cur.has(ds.clLwin)) cur.delete(ds.clLwin); else cur.add(ds.clLwin);
    _clLog.win = [...cur];
    _clLogSync(panel, c);
    return;
  }
  if (ds.clLsheet !== undefined) {
    // Log a play with the score sheet, the franchise already in it
    const L = _clLog;
    const names = _clList(c.players).filter(n => !(L && (L.rows[_clKey(n)] || {}).out));
    const roles = {};
    for (const n of names) if (_clChar(c, n)) roles[n] = _clChar(c, n);
    const n = _clNext(_clGames(c).games);
    _clLog = null;
    // saved: BG Stats' QR code, as from the tab
    const after = (id) => {
      const i = (PLAY_HISTORY[CL_BGGID] || []).findIndex(e => e.mp === id);
      if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(CL_BGGID, i);
    };
    if (typeof logPlayWith === 'function') logPlayWith({ bggId: CL_BGGID, names, roles, b: `Game ${n}`, l: L ? L.l : '', tab: 'campaign', after });
    if (typeof scoreSheetOpen === 'function') setTimeout(() => scoreSheetOpen(), 0);
    return;
  }
  if (ds.clSide) {
    const [n, k] = ds.clSide.split('|');
    await _clPatch({ [`games/${n}/side`]: ((c.games || {})[n] || {}).side === k ? null : k });
  } else if (ds.clSpot) {
    const [n, who] = ds.clSpot.split('|');
    await _clPatch({ [`games/${n}/spot`]: ((c.games || {})[n] || {}).spot === who ? null : who });
  } else if (ds.clGoals) {
    const [n, k] = ds.clGoals.split('|');
    await _clPatch({ [`games/${n}/goals/${k}`]: (((c.games || {})[n] || {}).goals || {})[k] ? null : true });
  } else if (ds.clExtra) {
    const [n, k, d] = ds.clExtra.split('|');
    const v = Math.max(0, Math.min(9, (Number((((c.games || {})[n] || {}).extra || {})[k]) || 0) + Number(d)));
    await _clPatch({ [`games/${n}/extra/${k}`]: v || null });
  } else if (ds.clDone) {
    await _clPatch({ [`games/${ds.clDone}/done`]: true });
  } else if (ds.clX) {
    const left = _clList(c.players).filter(p => p !== ds.clX);
    if (left.length < 2) { _clToast('A franchise keeps two players at least.'); return; }
    await _clPatch({ players: left });
  } else if (ds.clStop !== undefined) {
    await _clPatch({ status: 'stopped', stopped: Date.now() });
  } else if (ds.clResume !== undefined) {
    await _clPatch({ status: null, stopped: null });
  } else if (ds.clDelete !== undefined) {
    if (!confirm(`Delete “${c.name || _clList(c.players).join(', ')}”? Its plays stay in the play log; only the campaign goes.`)) return;
    try {
      await fbWrite(`${CL_NODE}/${_clId}`, 'DELETE', null, _clSrc[_clId]);
      delete _clCamps[_clId];
      _clId = null;
      _clUnfollow();
    } catch (e) {
      console.warn('Clank! Legacy campaign: not deleted', e);
      _clToast('Not deleted. Check the connection and try again.');
      return;
    }
  } else return;
  _clRender(panel);
}
function _clInput(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-cl-draft-name]')) { _clDraft.name = t.value; return; }
  if (t.matches('[data-cl-draft-start]')) { _clDraft.start = t.value; return; }
  if (t.matches('[data-cl-draft-char]')) { _clDraft.chars[t.dataset.clDraftChar] = t.value; return; }
  const c = _clCamps && _clCamps[_clId];
  if (!c || !_clCanEdit(c)) return;
  if (_clLog && t.matches('[data-cl-ls]')) { const r = _clLog.rows[t.dataset.clLs]; if (r) r.s = t.value; _clLogSync(panel, c); return; }
  if (_clLog && t.matches('[data-cl-ldate]')) { _clLog.date = t.value; _clLogSync(panel, c); return; }
  if (_clLog && t.matches('[data-cl-lplace]')) { _clLog.l = t.value; return; }
  // typed fields go up a moment after the typing stops
  const later = (key, path, v) => {
    clearTimeout(_clTimers[key]);
    _clTimers[key] = setTimeout(() => _clPatch({ [path]: v }), 600);
  };
  if (t.matches('[data-cl-text]')) later(t.dataset.clText, t.dataset.clText, t.value.slice(0, t.dataset.clText === 'notes' ? 5000 : 40) || null);
  else if (t.matches('[data-cl-char]')) later(`char-${t.dataset.clChar}`, `chars/${t.dataset.clChar}`, t.value.trim().slice(0, 40) || null);
  else if (t.matches('[data-cl-spotnote]')) later(`spot-${t.dataset.clSpotnote}`, `games/${t.dataset.clSpotnote}/spotNote`, t.value.trim().slice(0, 80) || null);
}
async function _clChange(panel, ev) {
  const t = ev.target;
  const c = _clCamps && _clCamps[_clId];
  if (!c || !_clCanEdit(c)) return;
  if (t.matches('[data-cl-assign]')) {
    await _clPatch({ [`assign/${t.dataset.clAssign}`]: t.value ? Number(t.value) : null });
    _clRender(panel);
  } else if (t.matches('[data-cl-from]') && t.value) {
    await _clPatch({ start: t.value });
    _clRender(panel);
  }
}
