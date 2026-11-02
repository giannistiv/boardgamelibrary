// ── What's new for the games we play ──
// New expansions and promos, new editions and English/Greek printings of the
// games we play, from data/game-news.js (tools/fetch-game-news.py, refreshed
// by the BGG sync Action). Shown on a game's page (Overview) and in
// Crowdfunding → For your games (the games you own), where a live
// crowdfunding campaign for any of it (data/bgg-hot.js) shows too, and each
// can be put away: "Don't care" or "Have it".

let _news = null;
async function _loadNews() {
  if (_news) return _news;
  const res = await fetch('data/game-news.js', { cache: 'no-cache' });
  const src = await res.text();
  _news = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  return _news;
}

const GN_KIND = { expansion: 'Expansion', promo: 'Promo', edition: 'New edition', printing: 'New printing' };
const GN_RECENT_DAYS = 200;   // "For your games" shows what's not out yet and what BGG added this recently
const GN_FIRST = 20;          // games shown before "Show more"
let _gnShowAll = false;
// Trending leaves out routine reprints; a Greek printing is news. (The game page shows them all.)
const _gnNews = (x) => x.kind !== 'printing' || /greek|[\u0370-\u03ff]/i.test(x.name);

// The item's name without its game's name in front ("Spirit Island: Nature Incarnate" → "Nature Incarnate").
function _gnShort(name, base) {
  if (!base) return name;
  const b = base.replace(/\s*\(.*\)$/, '');
  const m = name.match(new RegExp('^' + b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^:–—-]*\\s*[:–—-]\\s*(.+)$', 'i'));
  return m ? m[1] : name;
}

// A live campaign on BGG's crowdfunding list for this item (or, by name, for its game).
function _gnCampaign(x) {
  const hot = (_hot && _hot.games) || [];
  const live = hot.filter(_hotLive);
  return live.find(g => g.id === x.id) || null;
}
function _gnCampaignsByName(baseName) {
  const hot = (_hot && _hot.games) || [];
  const b = String(baseName || '').replace(/\s*\(.*\)$/, '').trim();
  if (b.length < 5) return [];
  const re = new RegExp('^' + b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
  return hot.filter(g => _hotLive(g) && re.test(g.name || ''));
}

function _gnItemHtml(x, baseName, acts) {
  const esc = _escapeHtml;
  const camp = _gnCampaign(x);
  const url = x.href ? `https://boardgamegeek.com${x.href}` : `https://boardgamegeek.com/boardgame/${x.id}`;
  const tags = [
    `<span class="gn-tag gn-${x.kind}">${GN_KIND[x.kind] || x.kind}</span>`,
    x.soon ? '<span class="gn-tag gn-soon">Not out yet</span>' : '',
    x.year ? `<span class="gn-year">${x.year}</span>` : '',
  ].join('');
  const link = `<a class="${acts ? 'gn-link' : 'gn-item'}" href="${esc(camp ? camp.camp.url : url)}" target="_blank" rel="noopener">
    ${x.img ? `<img class="gn-img" src="${esc(x.img)}" alt="" loading="lazy">` : '<span class="gn-img gn-noimg"></span>'}
    <span class="gn-body">
      <span class="gn-name">${esc(_gnShort(x.name, baseName))}</span>
      <span class="gn-tags">${tags}</span>
      ${camp ? `<span class="gn-camp">Live on ${HOT_PLATFORMS[camp.camp.on] || 'crowdfunding'} · ${camp.camp.pct}% funded · ${_hotEnds(camp.camp)}</span>` : ''}
    </span>
  </a>`;
  if (!acts) return link;
  // For your games: put it away, or (put away already, shown again) bring it back
  const put = acts === 'nocare' ? 'You don&rsquo;t care' : acts === 'have' ? 'You have it' : '';
  return `<div class="gn-item gn-row${put ? ' gn-put' : ''}">${link}
    <span class="gn-acts">${put
      ? `<span class="gn-put-what">${put}</span><button type="button" class="gn-act" data-gn-skip="${x.id}|">Undo</button>`
      : `<button type="button" class="gn-act" data-gn-skip="${x.id}|nocare">Don&rsquo;t care</button><button type="button" class="gn-act" data-gn-skip="${x.id}|have">Have it</button>`}</span>
  </div>`;
}

// ── on a game's page ──
function buildGameNewsHtml(bggId) {
  return bggId > 0 ? `<div class="gn-page" data-gn="${Number(bggId)}" hidden></div>` : '';
}
function wireGameNews(content) {
  const el = content.querySelector('[data-gn]');
  if (!el) return;
  const id = el.dataset.gn;
  Promise.all([_loadNews(), _loadHot().catch(() => null)]).then(([news]) => {
    const items = (news.games || {})[id];
    const game = findGameByBggId(Number(id));
    const extra = _gnCampaignsByName(game && game.name).filter(g => !(items || []).some(x => x.id === g.id));
    if ((!items || !items.length) && !extra.length) return;
    const shown = (items || []).slice(0, 6);
    el.innerHTML = `<div class="gn-head">What's new</div>
      ${extra.map(g => _gnItemHtml({ id: g.id, name: g.name, kind: 'expansion', year: g.year, img: g.img, soon: true }, game && game.name)).join('')}
      ${shown.map(x => _gnItemHtml(x, game && game.name)).join('')}
      ${items && items.length > shown.length ? `<div class="gn-more">and ${items.length - shown.length} more on BGG</div>` : ''}`;
    el.hidden = false;
  }).catch(() => {});
}

// ── Crowdfunding → For your games ──
// News for the games you own, not every game you've played (the user, 2 Nov
// 2026: "too much info"): Στιβ's shelf, Δημητρης's, anyone else's own list.
function _gnOwned() {
  const o = typeof _libOwner === 'function' ? _libOwner() : 'mine';
  if (o === 'stiv') return new Set(GAMES.map(g => Number(g.bggId)));
  if (o === 'dimitris' && typeof DIMITRIS_GAMES !== 'undefined') return new Set(Object.keys(DIMITRIS_GAMES).map(Number));
  return new Set(typeof myLibIds === 'function' ? myLibIds() : []);
}
// How often the viewer played each game: the ones played most come first.
function _gnYourPlays() {
  const viewer = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const counts = {};
  if (!viewer) return counts;
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (p && Array.isArray(p.sc) && p.sc.some(s => s && s.n === viewer)) counts[id] = (counts[id] || 0) + 1;
    }
  }
  return counts;
}

// What each person put away: newsSkips/{player}/{item id} = { k: 'nocare' | 'have', at },
// on every phone they use.
let _gnSkips = {}, _gnSkipsFor = null, _gnSkipSrc = {};
let _gnShowPut = false;   // the ones put away, shown again (to bring one back)
function _gnWho() {
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  return me ? _acctKey(typeof _origCanon === 'function' ? _origCanon(me) : me) : null;
}
async function _gnLoadSkips() {
  const who = _gnWho();
  if (!who) { _gnSkips = {}; _gnSkipsFor = null; return _gnSkips; }
  if (_gnSkipsFor === who) return _gnSkips;
  const { main, spare } = await fbReadBoth(`newsSkips/${who}`);
  _gnSkips = {};
  _gnSkipSrc = {};
  for (const [store, data] of [['spare', spare], ['main', main]]) {
    for (const id in (data || {})) { _gnSkips[id] = data[id]; _gnSkipSrc[id] = store; }
  }
  _gnSkipsFor = who;
  return _gnSkips;
}
// k: 'nocare' | 'have', or '' to bring it back
async function _gnSkip(id, k) {
  const who = _gnWho();
  if (!who) return;
  const was = _gnSkips[id];
  if (k) _gnSkips[id] = { k, at: Date.now() }; else delete _gnSkips[id];
  try {
    if (k) _gnSkipSrc[id] = (await fbWrite(`newsSkips/${who}/${id}`, 'PUT', _gnSkips[id])).store;
    else await fbWrite(`newsSkips/${who}/${id}`, 'DELETE', null, _gnSkipSrc[id]);
  } catch (e) {
    console.warn('For your games: not saved', e);
    if (was) _gnSkips[id] = was; else delete _gnSkips[id];
    alert('Not saved. Check the connection and try again.');
  }
}

function _gnForYou() {
  if (!_news) return { groups: [], put: 0 };
  const owned = _gnOwned();
  const plays = _gnYourPlays();
  const cutoff = new Date(Date.now() - GN_RECENT_DAYS * 86400000).toISOString().slice(0, 10);
  const groups = [];
  let put = 0;
  for (const id of owned) {
    const game = findGameByBggId(id);
    if (!game || isBggExpansion(id)) continue;
    const items = ((_news.games || {})[id] || []).filter(x => _gnNews(x) && (x.soon || x.posted >= cutoff || _gnCampaign(x)));
    const extra = _gnCampaignsByName(game.name).filter(g => !items.some(x => x.id === g.id))
      .map(g => ({ id: g.id, name: g.name, kind: 'expansion', year: g.year, img: g.img, soon: true }));
    // what you own already and what you put away stay out (put away: unless shown again)
    const all = [...extra, ...items].filter(x => !owned.has(Number(x.id))).map(x => ({ ...x, put: (_gnSkips[x.id] || {}).k || '' }));
    put += all.filter(x => x.put).length;
    const shown = _gnShowPut ? all : all.filter(x => !x.put);
    if (shown.length) groups.push({ id, game, plays: plays[id] || 0, items: shown });
  }
  // live campaigns first, then the games you play most
  const live = (gr) => gr.items.some(x => _gnCampaign(x));
  groups.sort((a, b) => live(b) - live(a) || b.plays - a.plays || a.game.name.localeCompare(b.game.name));
  return { groups, put };
}
function _gnForYouHtml() {
  const esc = _escapeHtml;
  const owned = _gnOwned();
  if (!owned.size) return `<div class="stats-player-sub gb-empty">${typeof _navPlayer === 'function' && _navPlayer() ? 'Add your games in Library and what&rsquo;s new for them shows here.' : 'Pick who you are, and what&rsquo;s new for your games shows here.'}</div>`;
  const { groups, put } = _gnForYou();
  const putBtn = put ? `<button type="button" class="gn-showput" data-gn-put="1">${_gnShowPut ? 'Hide the ones you put away' : `Show the ${put} you put away`}</button>` : '';
  if (!groups.length) return `<div class="stats-player-sub gb-empty">Nothing new for your games right now.</div>${putBtn}`;
  const shown = _gnShowAll ? groups : groups.slice(0, GN_FIRST);
  return shown.map(gr => `<div class="gn-group">
      <div class="gn-ghead"><span>${esc(gr.game.name)}</span>${gr.plays ? `<span class="gn-plays">${gr.plays} play${gr.plays === 1 ? '' : 's'}</span>` : ''}</div>
      ${gr.items.slice(0, 5).map(x => _gnItemHtml(x, gr.game.name, x.put || true)).join('')}
    </div>`).join('')
    + (groups.length > shown.length ? `<button type="button" class="gn-showall" data-gn-all="1">Show ${groups.length - shown.length} more games</button>` : '')
    + putBtn;
}
