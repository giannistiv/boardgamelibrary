// ── Explore → Games: search + filters ──
// Every game the site knows (the shelf, BGStats imports and the friends'
// libraries), narrowed by name, player count, play time (BGG's, at the chosen
// player count when there is one), weight, mechanics, whose library it's in,
// BGG rating, the group's rating, your own rating and whether it's been
// played, then sorted. While nothing is set the tab shows its usual
// lists; as soon as something is, the matching games replace them.
// A name can also be looked up on BoardGameGeek (its button, or Enter), as in
// Log a play: every other game by that name, each opening its BGG page.
//
// The state lives here, outside the view, so it survives re-renders and a
// round trip through a game's page.
const _gb = {
  q: '', open: false, shown: 0,
  players: 0,        // 0 = any; 6 means 6+
  time: 0,           // 0 = any; else fits in this many minutes
  weights: new Set(),
  mechs: new Set(),  // mechanics (any of them), see MECH_GROUPS
  libs: new Set(),
  bgg: 0,            // minimum BGG rating
  group: 0,          // minimum average rating from the app's players
  mine: '',          // '' | 'rated' | 'unrated'
  played: '',        // '' | 'played' | 'unplayed'
  sort: 'name',
  remote: null,      // BoardGameGeek's answer for a name: { q, state: 'searching'|'done'|'failed', list }
};
const GB_PAGE = 40;

const GB_WEIGHTS = [
  ['easy', 'Easy', 'Weight up to 2.1'],
  ['medium', 'Medium', 'Weight 2.1 – 3.1'],
  ['hard', 'Hard', 'Weight 3.1 – 4.1'],
  ['expert', 'Expert', 'Weight above 4.1'],
];
const GB_SORTS = [
  ['name', 'Name'], ['bgg', 'BGG rating'], ['group', 'Group rating'],
  ['weight', 'Heaviest'], ['light', 'Lightest'], ['plays', 'Most played'], ['year', 'Newest'],
];

function _gbPlayer() {
  const raw = localStorage.getItem('bgl-player');
  return raw ? (NAME_MAP[raw] || raw) : null;
}

// Whose library a game is in. Δημητρης's shelf is private to the Ilioupoli
// members, so it's only offered to them.
function _gbLibraries() {
  const libs = [
    { key: 'stiv', label: 'Στιβ', ids: new Set(GAMES.map(g => g.bggId)) },
    { key: 'giannis', label: 'Γιαννης Φ.', ids: new Set(Object.keys(GIANNIS_GAMES || {}).map(Number)) },
    { key: 'lgeorge', label: 'LGeorge', ids: new Set(Object.keys(LGEORGE_GAMES || {}).map(Number)) },
  ];
  const me = _gbPlayer();
  if (me && ((typeof ILIOUPOLI_MEMBERS !== 'undefined' && ILIOUPOLI_MEMBERS.has(me)) || (typeof acctFriendOf === 'function' && acctFriendOf('dimitris')))) {
    libs.push({ key: 'dimitris', label: 'Δημητρης', ids: new Set(Object.keys(DIMITRIS_GAMES || {}).map(Number)) });
  }
  // a signed-in friend's own games (js/my-library.js)
  if (typeof myLibActive === 'function' && myLibActive()) {
    libs.unshift({ key: 'mine', label: me || 'Mine', ids: new Set(typeof myLibIds === 'function' ? myLibIds() : Object.keys(_myLib || {}).map(Number)) });
  }
  return libs;
}

function _gbPlayerRange(players) {
  const m = /^(\d+)(?:-(\d+))?$/.exec(String(players || '').trim());
  return m ? [Number(m[1]), Number(m[2] || m[1])] : null;
}

function _gbActiveCount() {
  return (_gb.players ? 1 : 0) + (_gb.time ? 1 : 0) + (_gb.weights.size ? 1 : 0) + (_gb.mechs.size ? 1 : 0) + (_gb.libs.size ? 1 : 0)
    + (_gb.bgg ? 1 : 0) + (_gb.group ? 1 : 0) + (_gb.mine ? 1 : 0) + (_gb.played ? 1 : 0);
}

function _gbIsActive() { return !!_gb.q.trim() || _gbActiveCount() > 0; }

function _gbChips(group, options, isOn) {
  return options.map(([value, label, title]) =>
    `<button type="button" class="gb-chip${isOn(value) ? ' on' : ''}" data-gb="${group}" data-v="${value}"`
    + ` aria-pressed="${isOn(value)}"${title ? ` title="${title}"` : ''}>${label}</button>`).join('');
}

function _gbPanelHtml(libs) {
  const row = (label, chips) => `<div class="gb-row"><span class="gb-label">${label}</span><div class="gb-chips">${chips}</div></div>`;
  const me = _gbPlayer();
  return [
    row('Players', _gbChips('players', [1, 2, 3, 4, 5, 6].map(n => [n, n === 6 ? '6+' : String(n), `Plays with ${n}${n === 6 ? ' or more' : ''}`]), v => _gb.players === Number(v))),
    row('Time', _gbChips('time', [[30, '≤ 30 min'], [60, '≤ 1 h'], [90, '≤ 1.5 h'], [120, '≤ 2 h']], v => _gb.time === Number(v))),
    row('Weight', _gbChips('weights', GB_WEIGHTS, v => _gb.weights.has(v))),
    row('Mechanic', mechanicChipsHtml('mechs', _gb.mechs)),
    row('Library', _gbChips('libs', libs.map(l => [l.key, l.label, `In ${l.label}'s library`]), v => _gb.libs.has(v))),
    row('BGG', _gbChips('bgg', [[6.5, '6.5+'], [7, '7+'], [7.5, '7.5+'], [8, '8+']], v => _gb.bgg === Number(v))),
    row('Group', _gbChips('group', [[6, '6+'], [7, '7+'], [8, '8+'], [9, '9+']].map(([v, l]) => [v, '&#9733; ' + l, 'Average rating from the app\'s players']), v => _gb.group === Number(v))),
    me ? row('You', _gbChips('mine', [['rated', 'Rated'], ['unrated', 'Not rated']], v => _gb.mine === v)) : '',
    row('Played', _gbChips('played', me ? [['played', 'Played', 'Games you have played'], ['unplayed', 'Never played', 'Games you have never played']] : [['played', 'Played'], ['unplayed', 'Never played']], v => _gb.played === v)),
  ].join('');
}

function buildGameBrowserHtml() {
  const libs = _gbLibraries();
  // A library the player can't see any more (switched player) can't stay selected.
  for (const k of [..._gb.libs]) if (!libs.some(l => l.key === k)) _gb.libs.delete(k);
  const n = _gbActiveCount();
  return `
      <div class="stats-section gb">
        <div class="gb-top">
          <input type="text" class="insights-search gb-search" id="games-search" placeholder="Search all games..." autocomplete="off" value="${_escapeHtml(_gb.q)}">
          <button type="button" class="gb-toggle${_gb.open ? ' open' : ''}" id="gb-toggle" aria-expanded="${_gb.open}">
            Filters${n ? ` <span class="gb-badge">${n}</span>` : ''}
          </button>
        </div>
        <div class="gb-panel" id="gb-panel"${_gb.open ? '' : ' hidden'}>${_gbPanelHtml(libs)}</div>
        <div id="games-search-results"></div>
      </div>`;
}

function _gbMatches(libs) {
  const q = _gb.q.trim().toLowerCase();
  const me = _gbPlayer();
  const selLibs = libs.filter(l => _gb.libs.has(l.key));
  const out = [];
  for (const g of _allGames()) {
    if (q && !(g.name || '').toLowerCase().includes(q)) continue;
    if (_gb.players) {
      const r = _gbPlayerRange(g.players);
      if (!r || (_gb.players === 6 ? r[1] < 6 : (_gb.players < r[0] || _gb.players > r[1]))) continue;
    }
    if (_gb.time) {
      // at the chosen player count when there is one, else the game's shortest
      const t = _gb.players ? _ptBoxMinutes(g, _gb.players) : gameMinTime(g);
      if (!t || t > _gb.time) continue;
    }
    const weight = Number(g.complexity) || 0;
    if (_gb.weights.size && !(weight > 0 && _gb.weights.has(difficultyBucket(weight)))) continue;
    if (!gameHasMechanic(g.bggId, _gb.mechs)) continue;
    if (selLibs.length && !selLibs.some(l => l.ids.has(Number(g.bggId)))) continue;
    const bgg = Number(g.bggRating) || 0;
    if (_gb.bgg && bgg < _gb.bgg) continue;
    const group = getCommunityRating(g.bggId);
    if (_gb.group && !(group && group.avg >= _gb.group)) continue;
    const mine = me ? getPlayerRating(me, g.bggId) : 0;
    if (_gb.mine === 'rated' && !mine) continue;
    if (_gb.mine === 'unrated' && mine) continue;
    // a signed-in player's own plays; everyone's for a visitor
    const all = PLAY_HISTORY[g.bggId] || [];
    const plays = me ? ((typeof _gameMyPlays === 'function' && _gameMyPlays(all, g.bggId)) || { mine: [] }).mine.length : all.length;
    if (_gb.played === 'played' && !plays) continue;
    if (_gb.played === 'unplayed' && plays) continue;
    out.push({ g, weight, bgg, group: group ? group.avg : 0, plays, mine });
  }
  const byName = (a, b) => (a.g.name || '').localeCompare(b.g.name || '');
  const cmp = {
    name: byName,
    bgg: (a, b) => b.bgg - a.bgg || byName(a, b),
    group: (a, b) => b.group - a.group || b.bgg - a.bgg || byName(a, b),
    weight: (a, b) => b.weight - a.weight || byName(a, b),
    light: (a, b) => (a.weight || 99) - (b.weight || 99) || byName(a, b),
    plays: (a, b) => b.plays - a.plays || byName(a, b),
    year: (a, b) => (Number(b.g.year) || 0) - (Number(a.g.year) || 0) || byName(a, b),
  }[_gb.sort] || byName;
  return out.sort(cmp);
}

function _gbRowHtml(m, libs) {
  const g = m.g;
  const bits = [];
  if (g.year) bits.push(String(g.year));
  if (g.players) bits.push(`${_escapeHtml(g.players)} players`);
  if (gameTimeText(g)) bits.push(_escapeHtml(gameTimeText(g)));
  if (m.weight) bits.push(`weight ${m.weight.toFixed(1)}`);
  if (m.bgg) bits.push(`BGG ${m.bgg.toFixed(1)}`);
  if (m.plays) bits.push(_gbPlayer() ? `you played ${m.plays}&times;` : `${m.plays} play${m.plays !== 1 ? 's' : ''}`);
  const owners = libs.filter(l => l.ids.has(Number(g.bggId))).map(l => `<span class="gb-owner">${_escapeHtml(l.label)}</span>`).join('');
  const img = g.bggId >= 0
    ? `<img class="stats-game-img" src="images/${g.bggId}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${g.bggId})">` : '';
  const right = m.group ? `<div class="stats-game-wr gb-group" title="Group rating">&#9733; ${m.group}</div>` : '';
  return `<div class="stats-game-row" data-bgg-id="${g.bggId}">
      ${img}
      <div class="stats-game-info">
        <div class="stats-game-name">${_escapeHtml(g.name)}</div>
        <div class="stats-game-detail">${bits.join(' &middot; ')}</div>
        ${owners ? `<div class="gb-owners">${owners}</div>` : ''}
      </div>
      ${right}
    </div>`;
}

// Under the app's own matches: BoardGameGeek's for the same name (the ones
// not listed already), closest names first, then the most rated.
function _gbBggHtml(local) {
  const q = _gb.q.trim();
  if (q.length < 2) return '';
  const esc = _escapeHtml;
  const r = _gb.remote && _gb.remote.q === q ? _gb.remote : null;
  if (!r) return `<button type="button" class="gb-more gb-bgg-btn" id="gb-bgg">Search BoardGameGeek for &ldquo;${esc(q)}&rdquo;</button>`;
  if (r.state === 'searching') return '<div class="gb-bgg-head">Searching BoardGameGeek&hellip;</div>';
  if (r.state === 'failed') return '<div class="gb-bgg-head">BoardGameGeek didn&rsquo;t answer.</div><button type="button" class="gb-more gb-bgg-btn" id="gb-bgg">Try again</button>';
  const have = new Set(local.map(m => Number(m.g.bggId)));
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9α-ω ]/g, '');
  const nq = norm(q);
  const tier = (g) => { const n = norm(g.name); return n === nq ? 0 : n.startsWith(nq) ? 1 : n.split(' ').some(w => w.startsWith(nq)) ? 2 : 3; };
  const list = r.list.filter(g => !have.has(g.id)).sort((a, b) => tier(a) - tier(b) || (b.rated || 0) - (a.rated || 0));
  const filtered = _gbActiveCount() ? ' (the filters don&rsquo;t apply to these)' : '';
  return `<div class="gb-bgg-head">On BoardGameGeek &middot; ${list.length} more${filtered}</div>
    ${list.map(g => {
      const bits = [g.year, g.exp ? 'expansion' : '', g.players ? `${esc(g.players)} players` : '', g.time ? esc(g.time) : '', g.rated ? `${g.rated.toLocaleString('en')} ratings` : ''].filter(Boolean);
      return `<div class="stats-game-row gb-bgg-row" data-bgg-remote="${g.id}">
          ${g.img ? `<img class="stats-game-img" src="${esc(g.img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="stats-game-img"></span>'}
          <div class="stats-game-info">
            <div class="stats-game-name">${esc(g.name)}</div>
            <div class="stats-game-detail">${bits.join(' &middot; ')}</div>
          </div>
        </div>`;
    }).join('') || '<div class="stats-player-sub gb-empty">Nothing else by that name on BoardGameGeek.</div>'}`;
}

function wireGameBrowser(container) {
  const search = container.querySelector('#games-search');
  const toggle = container.querySelector('#gb-toggle');
  const panel = container.querySelector('#gb-panel');
  const results = container.querySelector('#games-search-results');
  const curated = container.querySelector('#games-curated');
  if (!search || !results) return;
  const libs = _gbLibraries();

  const refreshToggle = () => {
    const n = _gbActiveCount();
    toggle.innerHTML = `Filters${n ? ` <span class="gb-badge">${n}</span>` : ''}`;
  };

  const render = (resetPage) => {
    if (resetPage) _gb.shown = GB_PAGE;
    const active = _gbIsActive();
    if (curated) curated.hidden = active;
    if (!active) { results.innerHTML = ''; return; }
    const all = _gbMatches(libs);
    const page = all.slice(0, Math.max(_gb.shown, GB_PAGE));
    const sortSel = `<select class="gb-sort" id="gb-sort" aria-label="Sort">${GB_SORTS.map(([v, l]) =>
      `<option value="${v}"${_gb.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    results.innerHTML = `
      <div class="gb-head">
        <span class="gb-count">${all.length} game${all.length !== 1 ? 's' : ''}</span>
        <span class="gb-head-right">${sortSel}<button type="button" class="gb-clear" id="gb-clear">Clear</button></span>
      </div>
      ${all.length ? page.map(m => _gbRowHtml(m, libs)).join('')
        : `<div class="stats-player-sub gb-empty">${_gb.q.trim() ? 'None of the games here match.' : 'No games match. Try removing a filter.'}</div>`}
      ${all.length > page.length ? `<button type="button" class="gb-more" id="gb-more">Show more (${all.length - page.length} left)</button>` : ''}
      ${_gbBggHtml(all)}`;
    results.querySelectorAll('[data-bgg-id]').forEach(el => {
      el.addEventListener('click', () => { const game = findGameByBggId(el.dataset.bggId); if (game) openModal(game); });
    });
    results.querySelector('#gb-sort').addEventListener('change', (e) => { _gb.sort = e.target.value; render(true); });
    results.querySelector('#gb-clear').addEventListener('click', () => {
      Object.assign(_gb, { q: '', players: 0, time: 0, bgg: 0, group: 0, mine: '', played: '' });
      _gb.weights.clear(); _gb.mechs.clear(); _gb.libs.clear();
      search.value = '';
      panel.innerHTML = _gbPanelHtml(libs);
      refreshToggle();
      render(true);
    });
    const more = results.querySelector('#gb-more');
    if (more) more.addEventListener('click', () => { _gb.shown = page.length + GB_PAGE; render(false); });
    const bggBtn = results.querySelector('#gb-bgg');
    if (bggBtn) bggBtn.addEventListener('click', () => searchBgg());
    results.querySelectorAll('[data-bgg-remote]').forEach(el => el.addEventListener('click', () => {
      const id = Number(el.dataset.bggRemote);
      const g = ((_gb.remote && _gb.remote.list) || []).find(x => x.id === id) || {};
      if (typeof openBggGame === 'function') openBggGame(id, g);
    }));
  };
  // BoardGameGeek, for a name (on the button or Enter, not while typing)
  const searchBgg = async () => {
    const q = _gb.q.trim();
    if (q.length < 2 || typeof bggSearch !== 'function') return;
    search.blur();
    _gb.remote = { q, state: 'searching', list: [] };
    render(false);
    try {
      const list = await bggSearch(q);
      if (_gb.remote && _gb.remote.q === q) _gb.remote = { q, state: 'done', list };
    } catch (_) {
      if (_gb.remote && _gb.remote.q === q) _gb.remote = { q, state: 'failed', list: [] };
    }
    if (results.isConnected && _gb.q.trim() === q) render(false);
  };
  search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchBgg(); } });

  search.addEventListener('input', () => { _gb.q = search.value; render(true); });
  toggle.addEventListener('click', () => {
    _gb.open = !_gb.open;
    panel.hidden = !_gb.open;
    toggle.classList.toggle('open', _gb.open);
    toggle.setAttribute('aria-expanded', String(_gb.open));
  });
  panel.addEventListener('click', (e) => {
    const chip = e.target.closest('.gb-chip');
    if (!chip) return;
    const group = chip.dataset.gb, v = chip.dataset.v;
    if (group === 'weights' || group === 'libs' || group === 'mechs') {
      const set = _gb[group];
      if (set.has(v)) set.delete(v); else set.add(v);
    } else {
      const val = (group === 'mine' || group === 'played') ? v : Number(v);
      _gb[group] = _gb[group] === val ? (typeof val === 'number' ? 0 : '') : val;  // tap again to clear
    }
    panel.innerHTML = _gbPanelHtml(libs);
    refreshToggle();
    render(true);
  });
  panel.addEventListener('change', (e) => {
    const sel = e.target.closest('[data-mech-more="mechs"]');
    if (!sel || !sel.value) return;
    _gb.mechs.add(sel.value);
    panel.innerHTML = _gbPanelHtml(libs);
    refreshToggle();
    render(true);
  });

  render(!_gb.shown);
}
