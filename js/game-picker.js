// ── Explore → Tonight: "What should we play tonight?" ──
// Say how many are playing, how long you have and whose shelves are within
// reach; it ranks the games on those shelves that fit that many players and
// the time. Filters narrow it down: co-op or competitive, weight, and under
// "More filters" the kind of game, what you haven't played (at all or
// lately), BGG's best player count and the group's favourites.
// Each suggestion says why it's there:
//   - BGG's player-count vote for exactly this many players
//   - the group's ratings (BGG's if nobody has rated it)
//   - freshness: never played or not played in months beats played last week
//   - Board South votes, and whether you've never played it
// Expansions are never suggested on their own.

const _gp = {
  count: 0,          // how many are playing: the last number used, else 4
  time: 0,           // 0 = any, else minutes available
  weights: new Set(),
  libs: null,        // Set of library keys; null = your own shelf (else every shelf)
  campaigns: true,   // include campaign / legacy games
  style: '',         // '' | 'coop' | 'pvp'
  kinds: new Set(),  // kind letters (any of them)
  only: new Set(),   // 'best' | 'new' | 'stale' | 'fav', all must hold
  more: false,       // "More filters" open
  shown: 8,
};
const GP_TIMES = [[45, '≤ 45 min'], [90, '≤ 1.5 h'], [120, '≤ 2 h'], [180, '≤ 3 h']];
const GP_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [n, n === 10 ? '10+' : String(n)]);
const GP_STYLES = [['coop', 'Co-op'], ['pvp', 'Competitive']];
const GP_KINDS = [['P', 'Party'], ['F', 'Family'], ['S', 'Strategy'], ['T', 'Thematic'], ['C', 'Card game'],
  ['D', 'Deduction'], ['A', 'Abstract'], ['Z', 'Puzzle'], ['W', 'Wargame']];
// the shelves' own tags, for games BGG has no kinds for
const GP_TAG_KIND = { Party: 'P', Family: 'F', Strategy: 'S', Thematic: 'T', 'Card Game': 'C', Deduction: 'D', Abstract: 'A', Puzzle: 'Z' };
const GP_LIB_OWNER = { stiv: 'Στιβ', giannis: 'Γιαννης Φωτοπουλος', lgeorge: 'LGeorge', dimitris: 'Δημητρης' };

function _gpLoad() {
  if (_gp.count) return;
  let n = 0;
  try {
    const saved = JSON.parse(localStorage.getItem('bgl-tonight') || 'null') || {};
    // (it used to keep who was playing: count them)
    n = Number(saved.count) || ((Array.isArray(saved.players) ? saved.players.length : 0) + (Number(saved.guests) || 0));
  } catch (_) {}
  _gp.count = Math.min(10, Math.max(1, n || 4));
}

function _gpSave() {
  try { localStorage.setItem('bgl-tonight', JSON.stringify({ count: _gp.count })); } catch (_) {}
}

// When each game was last played, and which ones you have played.
function _gpIndex() {
  const lastPlayed = {};        // bggId -> 'YYYY-MM-DD'
  const mine = new Set();       // bggIds you've played
  const me = _gbPlayer();
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (!lastPlayed[id] || p.date > lastPlayed[id]) lastPlayed[id] = p.date;
      if (me && p.sc.some(s => s.n === me)) mine.add(Number(id));
    }
  }
  return { lastPlayed, mine };
}

function _gpDaysSince(date) {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86400000);
}

function _gpAgo(days) {
  if (days < 1) return 'today';
  if (days < 14) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  const y = Math.round(days / 365);
  return `${y} year${y !== 1 ? 's' : ''} ago`;
}

function _gpActiveLibs(libs) {
  if (_gp.libs) return libs.filter(l => _gp.libs.has(l.key));
  // By default your own shelf, if you have one; otherwise every shelf.
  const me = _gbPlayer();
  const canon = me && typeof _origCanon === 'function' ? _origCanon(me) : me;
  const own = libs.filter(l => GP_LIB_OWNER[l.key] === canon);
  return own.length ? own : libs;
}

// Co-op or competitive: how the group actually plays it, else BGG, else the shelf's tags.
function _gpIsCoop(g, id) {
  const plays = PLAY_HISTORY[id];
  if (plays && plays.length && !isNoResultGame(id)) return _recIsCoop(g, plays);
  const bgg = bggIsCoop(id);
  if (bgg !== null) return bgg;
  return (g.categories || []).includes('Co-op') || (g.mechanics || []).includes('Cooperative Game');
}

function _gpKinds(g, id) {
  const bgg = bggKinds(id);
  if (bgg) return bgg;
  return (g.categories || []).map(c => GP_TAG_KIND[c] || '').join('');
}

// How many filters are on (players and shelves aside), and clearing them.
function _gpFilterCount() {
  return (_gp.time ? 1 : 0) + _gp.weights.size + (_gp.style ? 1 : 0) + _gp.kinds.size + _gp.only.size + (_gp.campaigns ? 0 : 1);
}
function _gpClearFilters() {
  _gp.time = 0; _gp.weights.clear(); _gp.style = ''; _gp.kinds.clear(); _gp.only.clear(); _gp.campaigns = true;
}

function _gpVotes() {
  const byGame = {};
  for (const lib of ['stiv', 'giannis', 'lgeorge']) {
    let votes = {};
    try { votes = _bsvGetVotes(lib) || {}; } catch (_) {}
    for (const voter in votes) {
      if (!Array.isArray(votes[voter])) continue;
      for (const id of votes[voter]) byGame[id] = (byGame[id] || 0) + 1;
    }
  }
  return byGame;
}

function _gpSuggest(idx, libs) {
  const n = _gp.count;
  const active = _gpActiveLibs(libs);
  const ids = new Set();
  active.forEach(l => l.ids.forEach(id => ids.add(id)));
  const votes = _gpVotes();
  const out = [];
  for (const id of ids) {
    const g = findGameByBggId(id);
    if (!g || !g.name) continue;
    if (isBggExpansion(id) || (g.id && typeof EXPANSION_IDS !== 'undefined' && EXPANSION_IDS.has(g.id))) continue;
    if (!_gp.campaigns && isCampaign(g)) continue;
    // A legacy game nobody has touched in a year is finished (or abandoned).
    const legacy = Array.isArray(g.mechanics) && g.mechanics.includes('Legacy Game');
    if (legacy && (!idx.lastPlayed[id] || _gpDaysSince(idx.lastPlayed[id]) > 365)) continue;
    const range = _gbPlayerRange(g.players);
    if (!range || n < range[0] || n > range[1]) continue;
    if (_gp.time && !(g.playTime && parseMinTime(g.playTime) <= _gp.time)) continue;
    const weight = Number(g.complexity) || 0;
    if (_gp.weights.size && !(weight > 0 && _gp.weights.has(difficultyBucket(weight)))) continue;
    const coop = _gpIsCoop(g, id);
    if (_gp.style && (_gp.style === 'coop') !== coop) continue;
    if (_gp.kinds.size && ![..._gpKinds(g, id)].some(k => _gp.kinds.has(k))) continue;
    const poll = bggPlayerPoll(id);
    const lastPlay = idx.lastPlayed[id];
    if (_gp.only.has('best') && !(poll && poll.votes >= 5 && poll.best.has(n))) continue;
    if (_gp.only.has('new') && lastPlay) continue;
    if (_gp.only.has('stale') && lastPlay && _gpDaysSince(lastPlay) < 180) continue;
    if (_gp.only.has('fav')) { const fav = getCommunityRating(id); if (!fav || fav.avg < 8) continue; }

    let score = 0;
    const why = [];
    // Player count fit
    if (poll && poll.votes >= 5 && (poll.best.size || poll.rec.size)) {
      if (poll.best.has(n)) { score += 30; why.push({ t: `Best at ${n}`, k: 'good' }); }
      else if (poll.rec.has(n)) { score += 18; why.push({ t: `Good at ${n}`, k: 'ok' }); }
      else { score -= 10; why.push({ t: `Not great at ${n}`, k: 'warn' }); }
    } else {
      score += 8;
    }
    // The group's ratings, pulled towards BGG's while only a few of you have
    // rated it (one 10 shouldn't top the list)
    const group = getCommunityRating(id);
    const bgg = Number(g.bggRating) || 0;
    if (group) {
      const blended = (group.avg * group.count + (bgg || 7) * 2) / (group.count + 2);
      score += (blended - 5) * 6;
      why.push({ t: `&#9733; ${group.avg.toFixed(1)} from ${group.count} of you`, k: group.avg >= 7.5 ? 'good' : group.avg < 6 ? 'warn' : '' });
    } else if (bgg) {
      score += (bgg - 6) * 5;
      why.push({ t: `BGG ${bgg.toFixed(1)}`, k: '' });
    }
    // Freshness
    const last = idx.lastPlayed[id];
    if (!last) { score += 6; why.push({ t: 'Never played', k: 'new' }); }
    else {
      const days = _gpDaysSince(last);
      if (days < 14) { score -= 10; why.push({ t: `Played ${_gpAgo(days)}`, k: 'warn' }); }
      else if (days < 30) score -= 4;
      else if (days > 180) { score += 8; why.push({ t: `Not played in ${_gpAgo(days).replace(' ago', '')}`, k: 'new' }); }
      else if (days > 60) score += 4;
    }
    // Others have played it, you haven't
    if (last && _gbPlayer() && !idx.mine.has(Number(id))) {
      score += 4;
      why.push({ t: 'New to you', k: 'new' });
    }
    // Board South votes
    if (votes[id]) {
      score += Math.min(12, 3 * votes[id]);
      why.push({ t: `${votes[id]} Board South vote${votes[id] !== 1 ? 's' : ''}`, k: 'ok' });
    }
    if (coop && !_gp.style) why.push({ t: 'Co-op', k: '' });
    score += (bgg - 7) * 2;
    const owners = libs.filter(l => l.ids.has(Number(id))).map(l => l.label);
    out.push({ g, score, why, owners });
  }
  return out.sort((a, b) => b.score - a.score || (a.g.name || '').localeCompare(b.g.name || ''));
}

function buildTonightTabHtml() {
  _gpLoad();
  return `
      <div class="stats-section gp">
        <div class="gp-panel" id="gp-panel"></div>
        <div id="gp-results"></div>
      </div>`;
}

function wireTonightTab(container) {
  const panel = container.querySelector('#gp-panel');
  const results = container.querySelector('#gp-results');
  if (!panel || !results) return;
  const idx = _gpIndex();
  const libs = _gbLibraries();

  const renderPanel = () => {
    const active = new Set(_gpActiveLibs(libs).map(l => l.key));
    const row = (label, html) => `<div class="gb-row"><span class="gb-label">${label}</span><div class="gb-chips">${html}</div></div>`;
    const n = _gp.count;
    const moreOn = _gp.kinds.size + _gp.only.size + (_gp.campaigns ? 0 : 1) + (_gp.libs ? 1 : 0);
    panel.innerHTML = [
      row('Players', _gbChips('count', GP_COUNTS, v => _gp.count === Number(v))),
      row('Style', _gbChips('style', GP_STYLES, v => _gp.style === v)),
      row('Time', _gbChips('time', GP_TIMES, v => _gp.time === Number(v))),
      row('Weight', _gbChips('weights', GB_WEIGHTS, v => _gp.weights.has(v))),
      `<details class="gp-more-filters" id="gp-more-filters"${_gp.more ? ' open' : ''}>
        <summary>More filters${moreOn ? ` <span class="gp-more-n">${moreOn} on</span>` : ''}</summary>`,
      row('Only', _gbChips('only', [['best', `Best at ${n}`, `BGG voters say it's best with ${n}`], ['new', 'Never played'], ['stale', 'Not in 6 months', 'Not played in the last 6 months (or never)'], ['fav', '&#9733; 8+ from you', 'Rated 8 or more by the group']], v => _gp.only.has(v))),
      row('Kind', _gbChips('kinds', GP_KINDS, v => _gp.kinds.has(v))),
      row('Shelves', _gbChips('libs', libs.map(l => [l.key, l.label, `Games in ${l.label}'s library`]), v => active.has(v))
        + (_gp.libs ? '<button type="button" class="gp-auto" id="gp-auto">reset</button>' : '')),
      row('Include', `<button type="button" class="gb-chip${_gp.campaigns ? ' on' : ''}" id="gp-campaigns" aria-pressed="${_gp.campaigns}" title="Campaign and legacy games">Campaign games</button>`),
      `</details>`,
    ].join('');
    panel.querySelector('#gp-more-filters').addEventListener('toggle', (e) => { _gp.more = e.target.open; });
  };

  const renderResults = (keepPage) => {
    if (!keepPage) _gp.shown = 8;
    const n = _gp.count;
    const list = _gpSuggest(idx, libs);
    const clear = _gpFilterCount() ? '<button type="button" class="gp-auto" id="gp-clear">clear filters</button>' : '';
    if (!list.length) {
      results.innerHTML = `<div class="stats-player-sub gb-empty">Nothing on these shelves fits ${n} player${n !== 1 ? 's' : ''} with these filters. Try fewer filters or more shelves. ${clear}</div>`;
      const c = results.querySelector('#gp-clear');
      if (c) c.addEventListener('click', () => { _gpClearFilters(); refresh(); });
      return;
    }
    const page = list.slice(0, _gp.shown);
    results.innerHTML = `
      <div class="gb-head">
        <span class="gb-count">${list.length} game${list.length !== 1 ? 's' : ''} fit ${clear}</span>
        <button type="button" class="gp-roll" id="gp-roll">&#127922; Pick one for us</button>
      </div>
      ${page.map((s, i) => `<div class="stats-game-row gp-row" data-bgg-id="${s.g.bggId}">
        <span class="gp-rank">${i + 1}</span>
        <img class="stats-game-img" src="images/${s.g.bggId}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${s.g.bggId})">
        <div class="stats-game-info">
          <div class="stats-game-name">${_escapeHtml(s.g.name)}</div>
          <div class="stats-game-detail">${[s.g.playTime && _escapeHtml(s.g.playTime), Number(s.g.complexity) > 0 && `weight ${Number(s.g.complexity).toFixed(1)}`, s.owners.length && _escapeHtml(s.owners.join(', '))].filter(Boolean).join(' &middot; ')}</div>
          <div class="gp-why">${s.why.map(w => `<span class="gp-tag${w.k ? ' ' + w.k : ''}">${w.t}</span>`).join('')}</div>
        </div>
      </div>`).join('')}
      ${list.length > page.length ? `<button type="button" class="gb-more" id="gp-more">Show more (${list.length - page.length} left)</button>` : ''}`;
    results.querySelectorAll('[data-bgg-id]').forEach(el => el.addEventListener('click', () => {
      const game = findGameByBggId(el.dataset.bggId); if (game) openModal(game);
    }));
    const more = results.querySelector('#gp-more');
    if (more) more.addEventListener('click', () => { _gp.shown += 8; renderResults(true); });
    results.querySelector('#gp-roll').addEventListener('click', (e) => roll(e.currentTarget));
    const clearBtn = results.querySelector('#gp-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => { _gpClearFilters(); refresh(); });
  };

  // Spin through the top few, weighted towards the best, and land on one.
  const roll = (btn) => {
    const rows = [...results.querySelectorAll('.gp-row')].slice(0, 5);
    if (!rows.length) return;
    const weights = rows.map((_, i) => rows.length - i);
    let r = Math.random() * weights.reduce((a, v) => a + v, 0), pick = 0;
    while (r > weights[pick]) { r -= weights[pick]; pick++; }
    btn.disabled = true;
    rows.forEach(x => x.classList.remove('gp-picked'));
    const total = rows.length * 2 + pick;   // two laps, then stop on the pick
    let i = 0;
    const tick = () => {
      rows.forEach(x => x.classList.remove('gp-spin'));
      const at = i % rows.length;
      if (i < total) { rows[at].classList.add('gp-spin'); i++; setTimeout(tick, 60 + i * 12); return; }
      rows[at].classList.add('gp-picked');
      rows[at].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      btn.disabled = false;
    };
    tick();
  };

  const refresh = () => { renderPanel(); renderResults(false); };

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.gb === 'count') {
      _gp.count = Number(t.dataset.v);
      _gpSave();
    } else if (t.id === 'gp-auto') {
      _gp.libs = null;
    } else if (t.id === 'gp-campaigns') {
      _gp.campaigns = !_gp.campaigns;
    } else if (t.dataset.gb === 'time') {
      const v = Number(t.dataset.v); _gp.time = _gp.time === v ? 0 : v;
    } else if (t.dataset.gb === 'weights') {
      if (_gp.weights.has(t.dataset.v)) _gp.weights.delete(t.dataset.v); else _gp.weights.add(t.dataset.v);
    } else if (t.dataset.gb === 'style') {
      _gp.style = _gp.style === t.dataset.v ? '' : t.dataset.v;
    } else if (t.dataset.gb === 'kinds' || t.dataset.gb === 'only') {
      const set = _gp[t.dataset.gb];
      if (set.has(t.dataset.v)) set.delete(t.dataset.v); else set.add(t.dataset.v);
    } else if (t.dataset.gb === 'libs') {
      // First manual pick starts from what was shown, then toggles.
      if (!_gp.libs) _gp.libs = new Set(_gpActiveLibs(libs).map(l => l.key));
      if (_gp.libs.has(t.dataset.v)) _gp.libs.delete(t.dataset.v); else _gp.libs.add(t.dataset.v);
    } else return;
    refresh();
  });
  renderPanel();
  renderResults(true);
}
