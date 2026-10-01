// ── What's new for the games we play ──
// New expansions and promos, new editions and English/Greek printings of the
// games we play, from data/game-news.js (tools/fetch-game-news.py, refreshed
// by the BGG sync Action). Shown on a game's page (Overview) and in
// Explore → Trending → "For your games", where a live crowdfunding campaign
// for any of it (data/bgg-hot.js) shows too.

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

function _gnItemHtml(x, baseName) {
  const esc = _escapeHtml;
  const camp = _gnCampaign(x);
  const url = x.href ? `https://boardgamegeek.com${x.href}` : `https://boardgamegeek.com/boardgame/${x.id}`;
  const tags = [
    `<span class="gn-tag gn-${x.kind}">${GN_KIND[x.kind] || x.kind}</span>`,
    x.soon ? '<span class="gn-tag gn-soon">Not out yet</span>' : '',
    x.year ? `<span class="gn-year">${x.year}</span>` : '',
  ].join('');
  return `<a class="gn-item" href="${esc(camp ? camp.camp.url : url)}" target="_blank" rel="noopener">
    ${x.img ? `<img class="gn-img" src="${esc(x.img)}" alt="" loading="lazy">` : '<span class="gn-img gn-noimg"></span>'}
    <span class="gn-body">
      <span class="gn-name">${esc(_gnShort(x.name, baseName))}</span>
      <span class="gn-tags">${tags}</span>
      ${camp ? `<span class="gn-camp">Live on ${HOT_PLATFORMS[camp.camp.on] || 'crowdfunding'} · ${camp.camp.pct}% funded · ${_hotEnds(camp.camp)}</span>` : ''}
    </span>
  </a>`;
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

// ── Explore → Trending → For your games ──
// The games the viewer plays (everyone's when nobody's logged in), most played first.
function _gnYourGames() {
  const viewer = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const counts = {};
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (!p || !Array.isArray(p.sc)) continue;
      if (viewer && !p.sc.some(s => s && s.n === viewer)) continue;
      counts[id] = (counts[id] || 0) + 1;
    }
  }
  return counts;
}
function _gnForYou() {
  if (!_news) return [];
  const counts = _gnYourGames();
  const cutoff = new Date(Date.now() - GN_RECENT_DAYS * 86400000).toISOString().slice(0, 10);
  const groups = [];
  for (const id in counts) {
    const game = findGameByBggId(Number(id));
    if (counts[id] < 2) continue;
    const items = ((_news.games || {})[id] || []).filter(x => _gnNews(x) && (x.soon || x.posted >= cutoff || _gnCampaign(x)));
    const extra = _gnCampaignsByName(game && game.name).filter(g => !items.some(x => x.id === g.id))
      .map(g => ({ id: g.id, name: g.name, kind: 'expansion', year: g.year, img: g.img, soon: true }));
    const all = [...extra, ...items];
    if (all.length) groups.push({ id, game, plays: counts[id], items: all });
  }
  // live campaigns first, then the games you play most
  const live = (gr) => gr.items.some(x => _gnCampaign(x));
  groups.sort((a, b) => live(b) - live(a) || b.plays - a.plays);
  return groups;
}
function _gnForYouHtml() {
  const esc = _escapeHtml;
  const groups = _gnForYou();
  if (!groups.length) return '<div class="stats-player-sub gb-empty">Nothing new for the games you play right now.</div>';
  const shown = _gnShowAll ? groups : groups.slice(0, GN_FIRST);
  return shown.map(gr => `<div class="gn-group">
      <div class="gn-ghead"><span>${esc(gr.game ? gr.game.name : `Game #${gr.id}`)}</span><span class="gn-plays">${gr.plays} play${gr.plays === 1 ? '' : 's'}</span></div>
      ${gr.items.slice(0, 5).map(x => _gnItemHtml(x, gr.game && gr.game.name)).join('')}
    </div>`).join('')
    + (groups.length > shown.length ? `<button type="button" class="gn-showall" data-gn-all="1">Show ${groups.length - shown.length} more games</button>` : '');
}
