// ── Explore → Trending: the games still to come out ──
// Every live crowdfunding campaign on BGG (Kickstarter, Gamefound, BackerKit)
// and the games on BGG's hot list that aren't out yet, the best fit for you
// first: games with the mechanics you rate highly and play most, near the
// weight you usually play. Each shows how its campaign is going, whose
// library has it and pictures from its gallery; tap one for its page. Open
// to everyone. data/bgg-hot.js is refreshed every few hours by a scheduled
// job (tools/fetch-hot.py) and fetched when the tab opens, so it's the latest.

let _hot = null;            // BGG_HOT once loaded
let _hotFilter = 'live';    // 'live' (campaigns running now) | 'soon' (hot on BGG, no campaign running)
let _hotSort = 'you';       // 'you' | 'ending' | 'backers' | 'hot'
let _hotTasteFor = null, _hotTasteCache;   // whose taste, and it (null: too few games to tell)

function trendingAllowed() { return true; }   // open to everyone

async function _loadHot() {
  if (_hot) return _hot;
  const res = await fetch('data/bgg-hot.js', { cache: 'no-cache' });
  const src = await res.text();
  _hot = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  return _hot;
}

function buildTrendingTabHtml() {
  return `<div class="stats-section hot" id="hot"><div class="stats-player-sub gb-empty">Loading what&rsquo;s coming&hellip;</div></div>`;
}

function _hotAgo(iso) {
  const h = Math.round((Date.now() - Date.parse(iso)) / 3600000);
  return h < 1 ? 'just now' : h < 24 ? `${h} hour${h !== 1 ? 's' : ''} ago` : `${Math.round(h / 24)} day${Math.round(h / 24) !== 1 ? 's' : ''} ago`;
}

const HOT_PLATFORMS = { kickstarter: 'Kickstarter', gamefound: 'Gamefound', backerkit: 'BackerKit' };
const _hotLive = (g) => !!(g.camp && Date.parse(g.camp.ends) > Date.now());

function _hotEnds(c) {
  const days = Math.floor((Date.parse(c.ends) - Date.now()) / 86400000);
  if (days < 1) return 'ends today';
  if (days < 2) return 'ends tomorrow';
  if (days < 14) return `${days} days left`;
  return 'ends ' + new Date(c.ends).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function _hotMoney(n, cur) {
  try { return new Intl.NumberFormat('en', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n); }
  catch (e) { return `${n.toLocaleString('en')} ${cur}`; }
}

// ── What you like, from your plays and ratings ──
// How much you like each game: your rating against your own average (what
// counts is liking a game more than you usually do), else how often you play
// it. From that, each BGG mechanic, shrunk towards nothing when you've met it
// in only a few games. Mechanics in more than a quarter of your games (and
// solo modes) say little about taste, so they don't count as a reason. Also
// the weight you usually play, and your favourites to compare new games with.
const HOT_NOT_TASTE = new Set(['Solo / Solitaire Game']);

function _hotTaste() {
  const viewer = _navPlayer();
  if (_hotTasteFor === viewer && _hotTasteCache !== undefined) return _hotTasteCache;
  const counts = {};
  let wSum = 0, wN = 0;
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (!p || !Array.isArray(p.sc) || !p.sc.some(s => s && s.n === viewer)) continue;
      counts[id] = (counts[id] || 0) + 1;
      const g = findGameByBggId(id);
      const w = g && Number(g.complexity);
      if (w > 0) { wSum += w; wN++; }
    }
  }
  const ratings = {};
  for (const id in ratingsCache || {}) {
    const r = _ratingValue((ratingsCache[id] || {})[viewer]);
    if (r) ratings[id] = r;
  }
  const rs = Object.values(ratings);
  const mean = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 7;
  const liking = {};
  for (const id of new Set([...Object.keys(counts), ...Object.keys(ratings)])) {
    const n = counts[id] || 0;
    liking[id] = ratings[id] ? ratings[id] - mean : n >= 8 ? 1 : n >= 3 ? 0.4 : 0.1;
  }
  const names = (id) => [...bggMechanics(id)].map(m => BGG_MECHANICS[m]).filter(Boolean);
  const sum = {}, seen = {};
  for (const id in liking) for (const m of names(id)) { sum[m] = (sum[m] || 0) + liking[id]; seen[m] = (seen[m] || 0) + 1; }
  const total = Object.keys(liking).length;
  const mech = {}, telling = new Set();
  for (const m in sum) {
    mech[m] = sum[m] / (seen[m] + 4);
    if (!HOT_NOT_TASTE.has(m) && seen[m] <= total / 4) telling.add(m);
  }
  const favs = Object.keys(liking).filter(id => liking[id] >= 1)
    .map(id => ({ id: Number(id), like: liking[id], mechs: new Set(names(id).filter(m => telling.has(m))), game: findGameByBggId(id) }))
    .filter(f => f.mechs.size >= 2 && f.game && !isExpansion(f.game));
  _hotTasteFor = viewer;
  _hotTasteCache = total >= 5 ? { mech, telling, favs, weight: wN ? wSum / wN : 0 } : null;
  return _hotTasteCache;
}

// How well a game fits you, and why: its three mechanics you like best, less a
// little for a weight far from yours; the favourite of yours it shares the
// most telling mechanics with. A touch of buzz (backers, the hot list) breaks ties.
function _hotFit(g, t) {
  const buzz = (g.camp ? Math.log10(g.camp.backers + 1) * 0.03 : 0) + (g.pos ? (51 - g.pos) / 50 * 0.08 : 0);
  if (!t) return { score: buzz };
  const mechs = (g.mechs || []).filter(m => !HOT_NOT_TASTE.has(m));
  const top = mechs.map(m => t.mech[m] || 0).sort((a, b) => b - a).slice(0, 3);
  let score = top.reduce((a, b) => a + b, 0) / 3 + buzz;
  if (g.weight > 0 && t.weight) score -= Math.min(Math.abs(g.weight - t.weight), 2) * 0.15;
  let like = null;
  for (const f of t.favs) {
    const shared = mechs.filter(m => f.mechs.has(m));
    if (shared.length >= 2 && (!like || shared.length > like.shared.length || (shared.length === like.shared.length && f.like > like.f.like))) like = { f, shared };
  }
  const loved = mechs.filter(m => t.telling.has(m) && (t.mech[m] || 0) >= 0.25).sort((a, b) => t.mech[b] - t.mech[a]);
  return { score, like, loved };
}

// Everyone's scores run on their own scale (someone who rates nothing has
// only how often they play to go on), so the labels are relative to your own
// list: the games that stand out from the rest of it, about the top tenth
// great matches and the next fifth good ones.
let _hotFitsFor = null, _hotFitsCache = null;
function _hotFits() {
  const key = _navPlayer() + '|' + (_hot && _hot.updated);
  if (_hotFitsFor === key) return _hotFitsCache;
  const taste = _hotTaste();
  const games = (_hot.games || []).filter(g => _hotLive(g) || g.pos);
  const fits = new Map(games.map(g => [g.id, _hotFit(g, taste)]));
  if (taste) {
    const order = games.map(g => fits.get(g.id)).sort((a, b) => b.score - a.score);
    const mean = order.reduce((a, f) => a + f.score, 0) / (order.length || 1);
    const sd = Math.sqrt(order.reduce((a, f) => a + (f.score - mean) ** 2, 0) / (order.length || 1));
    if (sd > 0.02) order.forEach((f, i) => {
      const z = (f.score - mean) / sd;
      if (i < Math.ceil(order.length * 0.1) && z >= 1.2) f.match = ['great', 'Great match'];
      else if (i < Math.ceil(order.length * 0.3) && z >= 0.5) f.match = ['good', 'Good match'];
    });
  }
  _hotFitsFor = key;
  _hotFitsCache = fits;
  return fits;
}

function _hotWhy(fit) {
  if (fit.like) return `Like <b>${_escapeHtml(fit.like.f.game.name)}</b>: ${fit.like.shared.slice(0, 2).map(_escapeHtml).join(', ')}`;
  if (fit.loved && fit.loved.length) return `Mechanics you enjoy: ${fit.loved.slice(0, 2).map(_escapeHtml).join(', ')}`;
  return '';
}

function _hotCampHtml(c, withLink) {
  return `<div class="hot-camp">
      <div class="hot-camp-top">
        <span class="hot-plat ${c.on}">${HOT_PLATFORMS[c.on] || 'Crowdfunding'}</span>
        <span class="hot-ends">${_hotEnds(c)}</span>
        ${withLink ? `<a class="hot-back" href="${_escapeHtml(c.url)}" target="_blank" rel="noopener">Back it &#8599;</a>` : ''}
      </div>
      <div class="hot-camp-bar"><div style="width:${Math.min(c.pct, 100)}%"></div></div>
      <div class="hot-camp-nums"><b>${c.pct.toLocaleString('en')}%</b> funded &middot; ${c.backers.toLocaleString('en')} backer${c.backers !== 1 ? 's' : ''} &middot; ${_hotMoney(c.pledged, c.cur)}</div>
    </div>`;
}

function _hotFacts(g) {
  return [
    g.minp ? (g.minp === g.maxp || !g.maxp ? `${g.minp} players` : `${g.minp}&ndash;${g.maxp} players`) : '',
    g.tmin ? (g.tmin === g.tmax || !g.tmax ? `${g.tmin} min` : `${g.tmin}&ndash;${g.tmax} min`) : '',
    g.weight > 0 ? `weight ${g.weight.toFixed(1)}` : '',
  ].filter(Boolean).join(' &middot; ');
}

function _hotCardHtml(g, libs, fit) {
  const esc = _escapeHtml;
  const live = _hotLive(g);
  const facts = _hotFacts(g);
  const move = g.delta > 0 ? ` <span class="hot-up">&#9650;${g.delta}</span>` : g.delta < 0 ? ` <span class="hot-down">&#9660;${-g.delta}</span>` : '';
  const owners = libs.filter(l => l.ids.has(g.id)).map(l => `<span class="gb-owner">${esc(l.label)}</span>`).join('');
  const match = fit.match;
  const why = _hotWhy(fit);
  const pics = (g.pics || []).map((p, i) => `<button type="button" class="hot-pic" data-hot-pic="${g.id}:${i}" aria-label="Picture ${i + 1}"><img src="${esc(p.s)}" alt="" loading="lazy"></button>`).join('');
  return `<article class="hot-card" data-hot-id="${g.id}">
      <div class="hot-top">
        <img class="hot-box" src="${esc(g.img || '')}" alt="" loading="lazy">
        <div class="hot-main">
          <div class="hot-name">${esc(g.name)}</div>
          <div class="hot-tags">${match ? `<span class="hot-match ${match[0]}">${match[1]}</span>` : ''}${g.pos ? `<span class="hot-tag">Hot #${g.pos}${move}</span>` : ''}${g.year ? `<span class="hot-tag">${g.year}</span>` : ''}${owners}</div>
          ${facts ? `<div class="stats-game-detail">${facts}</div>` : ''}
        </div>
      </div>
      ${why ? `<div class="hot-why">${why}</div>` : ''}
      ${g.desc ? `<p class="hot-desc">${esc(g.desc)}</p>` : ''}
      ${live ? _hotCampHtml(g.camp, true) : ''}
      ${pics ? `<div class="hot-pics">${pics}</div>` : ''}
    </article>`;
}

function _renderHot(box) {
  const libs = _gbLibraries();
  const taste = _hotTaste();
  const all = (_hot.games || []).filter(g => _hotLive(g) || g.pos);
  const live = all.filter(_hotLive), soon = all.filter(g => !_hotLive(g));
  if (_hotFilter === 'soon' && !soon.length) _hotFilter = 'live';
  const sorts = _hotFilter === 'live'
    ? [['you', 'Best for you'], ['ending', 'Ending soon'], ['backers', 'Most backed']]
    : [['you', 'Best for you'], ['hot', 'Hottest']];
  if (!sorts.some(s => s[0] === _hotSort)) _hotSort = 'you';
  if (!taste && _hotSort === 'you') _hotSort = _hotFilter === 'live' ? 'backers' : 'hot';
  const fits = _hotFits();
  const list = (_hotFilter === 'live' ? live : soon).slice().sort(
    _hotSort === 'ending' ? (a, b) => Date.parse(a.camp.ends) - Date.parse(b.camp.ends)
    : _hotSort === 'backers' ? (a, b) => b.camp.backers - a.camp.backers
    : _hotSort === 'hot' ? (a, b) => a.pos - b.pos
    : (a, b) => fits.get(b.id).score - fits.get(a.id).score);
  box.innerHTML = `
      <div class="hot-head">
        <div class="gb-chips">${_gbChips('hot', [['live', `Live campaigns ${live.length}`], ['soon', `Coming soon ${soon.length}`]], v => _hotFilter === v)}</div>
        <div class="gb-chips hot-sorts">${_gbChips('hotsort', sorts.filter(s => taste || s[0] !== 'you'), v => _hotSort === v)}</div>
        <span class="hot-updated">${_hotFilter === 'live' ? 'Crowdfunding campaigns running now, from BGG' : 'On BGG&rsquo;s hot list, not out yet'} &middot; updated ${_hotAgo(_hot.updated)}</span>
      </div>
      ${list.map(g => _hotCardHtml(g, libs, fits.get(g.id))).join('') || '<div class="stats-player-sub gb-empty">Nothing here right now.</div>'}`;
}

function wireTrendingTab(container) {
  const box = container.querySelector('#hot');
  if (!box) return;
  _loadHot().then(() => _renderHot(box)).catch(() => {
    box.innerHTML = '<div class="stats-player-sub gb-empty">The list couldn&rsquo;t be loaded. Try again in a moment.</div>';
  });
  box.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-gb="hot"], [data-gb="hotsort"]');
    if (chip) {
      if (chip.dataset.gb === 'hot') _hotFilter = chip.dataset.v; else _hotSort = chip.dataset.v;
      _renderHot(box);
      return;
    }
    if (_hotPicClick(e)) return;
    const card = e.target.closest('.hot-card');
    if (card && !e.target.closest('a')) {
      const g = (_hot.games || []).find(x => x.id === Number(card.dataset.hotId));
      if (g) _openHotGame(g);
    }
  });
}

function _hotPicClick(e) {
  const pic = e.target.closest('[data-hot-pic]');
  if (!pic) return false;
  const [id, i] = pic.dataset.hotPic.split(':').map(Number);
  const g = (_hot.games || []).find(x => x.id === id);
  if (g) _openPics(g, i);
  return true;
}

// ── An upcoming game's page, in the game-page sheet ──
function _openHotGame(g) {
  const esc = _escapeHtml;
  const libs = _gbLibraries().filter(l => l.ids.has(g.id));
  const ours = findGameByBggId(g.id);
  const facts = [
    g.minp ? gmFact('players', g.minp === g.maxp || !g.maxp ? `${g.minp} players` : `${g.minp}&ndash;${g.maxp} players`) : '',
    g.tmin ? gmFact('time', g.tmin === g.tmax || !g.tmax ? `${g.tmin} min` : `${g.tmin}&ndash;${g.tmax} min`) : '',
    g.weight > 0 ? gmFact('weight', `Weight ${g.weight.toFixed(1)}`) : '',
  ].join('');
  const move = g.delta > 0 ? ` <span class="hot-up">&#9650;${g.delta}</span>` : g.delta < 0 ? ` <span class="hot-down">&#9660;${-g.delta}</span>` : '';
  const live = _hotLive(g);
  const tiles = [
    g.pos ? `<div class="gm-tile"><div class="gm-tile-val">#${g.pos}${move}</div><div class="gm-tile-label">Hot on BGG</div></div>` : '',
    g.rank > 0 ? `<div class="gm-tile"><div class="gm-tile-val">#${g.rank.toLocaleString('en')}</div><div class="gm-tile-label">BGG rank</div></div>` : '',
    g.rating > 0 && g.owned >= 150 ? `<div class="gm-tile"><div class="gm-tile-val" style="color:${ratingColor(g.rating)}">${g.rating.toFixed(1)}</div><div class="gm-tile-label">BGG rating</div></div>` : '',
  ].filter(Boolean).slice(0, 3);
  const fit = _hotFits().get(g.id) || _hotFit(g, _hotTaste());
  const match = fit.match;
  const why = _hotWhy(fit);
  const tags = (match ? `<span class="hot-match ${match[0]}">${match[1]}</span>` : '')
    + libs.map(l => `<span class="gb-owner">${esc(l.label)}</span>`).join('');
  const camp = live ? `${_hotCampHtml(g.camp, false)}
      ${g.camp.more && g.camp.more.length ? `<div class="hot-more">Also in the campaign: ${g.camp.more.map(esc).join(', ')}</div>` : ''}
      <a class="modal-bgg-link hot-back-big" href="${esc(g.camp.url)}" target="_blank" rel="noopener">Back it on ${HOT_PLATFORMS[g.camp.on] || 'the campaign page'} &#8599;</a>` : '';
  const about = (g.about && g.about.length ? g.about : g.desc ? [g.desc] : []).map(p => `<p>${esc(p)}</p>`).join('');
  const chips = (list, cls) => list.map(x => `<span class="${cls}">${esc(x)}</span>`).join('');
  const pics = (g.pics || []).map((p, i) => `<button type="button" class="hot-pic" data-hot-pic="${g.id}:${i}" aria-label="Picture ${i + 1}"><img src="${esc(p.s)}" alt="" loading="lazy"></button>`).join('');
  openInfoModal(`
    <div class="modal-cover"><img class="modal-cover-img" src="${esc(g.cover || g.img || '')}" alt="${esc(g.name)}"></div>
    <div class="modal-body">
      <div class="modal-header">
        <span class="modal-title">${esc(g.name)}</span>
        ${g.year ? `<span class="modal-year">${g.year}</span>` : ''}
      </div>
      ${g.by && g.by.length ? `<div class="modal-designer">by ${esc(g.by.join(', '))}</div>` : ''}
      ${tags ? `<div class="hot-tags hot-sheet-tags">${tags}</div>` : ''}
      ${why ? `<div class="hot-why hot-sheet-why">${why}</div>` : ''}
      ${facts ? `<div class="gm-facts">${facts}</div>` : ''}
      ${tiles.length ? `<div class="gm-tiles hot-tiles">${tiles.join('')}</div>` : ''}
      ${camp ? `<div class="hot-sheet-camp">${camp}</div>` : ''}
      ${about ? `<div class="modal-desc hot-about">${about}</div>` : ''}
      ${g.mechs && g.mechs.length ? `<div class="hot-sec">Mechanics</div><div class="modal-mechanics">${chips(g.mechs, 'modal-mech')}</div>` : ''}
      ${g.cats && g.cats.length ? `<div class="hot-sec">Categories</div><div class="modal-categories">${chips(g.cats, 'modal-cat')}</div>` : ''}
      ${pics ? `<div class="hot-sec">Pictures</div><div class="hot-pics hot-sheet-pics">${pics}</div>` : ''}
      <div class="hot-sheet-links">
        ${ours ? `<button type="button" class="modal-bgg-link" data-hot-ours="${g.id}">Our game page &rsaquo;</button>` : ''}
        <a class="modal-bgg-link" href="https://boardgamegeek.com/boardgame/${g.id}" target="_blank" rel="noopener">View on BoardGameGeek &#8599;</a>
      </div>
    </div>`, (e) => {
    if (_hotPicClick(e)) return;
    if (e.target.closest('[data-hot-ours]')) openModal(ours);
  });
}

// ── Pictures, large: one at a time, with the caption; arrows, swipe or keys to move ──
function _openPics(g, start) {
  let ov = document.getElementById('pics-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'pics-overlay';
    ov.className = 'pics-overlay';
    document.body.appendChild(ov);
  }
  let i = start;
  const pics = g.pics || [];
  const show = () => {
    const p = pics[i];
    ov.innerHTML = `<button type="button" class="pics-x" aria-label="Close">&times;</button>
      <div class="pics-stage"><img src="${_escapeHtml(p.l)}" alt=""></div>
      <div class="pics-foot"><b>${_escapeHtml(g.name)}</b>${p.c ? ` &middot; ${_escapeHtml(p.c)}` : ''}<span>${i + 1} / ${pics.length}</span></div>
      ${pics.length > 1 ? '<button type="button" class="pics-nav prev" aria-label="Previous">&lsaquo;</button><button type="button" class="pics-nav next" aria-label="Next">&rsaquo;</button>' : ''}`;
  };
  const step = (d) => { i = (i + d + pics.length) % pics.length; show(); };
  const close = () => {
    ov.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    ov._navClose = null;
    navOverlayClosed('pics');
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  };
  ov.onclick = (e) => {
    if (e.target.closest('.pics-x') || e.target === ov) close();
    else if (e.target.closest('.pics-nav.next')) step(1);
    else if (e.target.closest('.pics-nav.prev')) step(-1);
  };
  let x0 = null;
  ov.ontouchstart = (e) => { x0 = e.touches[0].clientX; };
  ov.ontouchend = (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };
  document.addEventListener('keydown', onKey);
  ov._navClose = close;
  show();
  ov.classList.add('open');
  navOverlayOpened('pics');   // back closes it (nav.js)
}
