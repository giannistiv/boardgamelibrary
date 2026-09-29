// ── Explore → Trending: BGG's hot list ──
// The 50 games trending on BGG right now, the ones still to come out first,
// each with a few facts, whose library has it, and pictures from its gallery
// (tap one to see it large). Only for Στιβ and the Board South players.
// data/bgg-hot.js is refreshed every few hours by a scheduled job
// (tools/fetch-hot.py) and fetched when the tab opens, so it's the latest.

let _hot = null;            // BGG_HOT once loaded
let _hotFilter = 'all';     // 'all' | 'upcoming' | 'out'

function trendingAllowed() {
  return typeof _activeBoardSouthVoter === 'function' && !!_activeBoardSouthVoter();
}

async function _loadHot() {
  if (_hot) return _hot;
  const res = await fetch('data/bgg-hot.js', { cache: 'no-cache' });
  const src = await res.text();
  _hot = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  return _hot;
}

function buildTrendingTabHtml() {
  return `<div class="stats-section hot" id="hot"><div class="stats-player-sub gb-empty">Loading what's hot on BGG&hellip;</div></div>`;
}

function _hotAgo(iso) {
  const h = Math.round((Date.now() - Date.parse(iso)) / 3600000);
  return h < 1 ? 'just now' : h < 24 ? `${h} hour${h !== 1 ? 's' : ''} ago` : `${Math.round(h / 24)} day${Math.round(h / 24) !== 1 ? 's' : ''} ago`;
}

function _hotCardHtml(g, libs) {
  const esc = _escapeHtml;
  const facts = [
    g.minp ? (g.minp === g.maxp || !g.maxp ? `${g.minp} players` : `${g.minp}&ndash;${g.maxp} players`) : '',
    g.tmin ? (g.tmin === g.tmax || !g.tmax ? `${g.tmin} min` : `${g.tmin}&ndash;${g.tmax} min`) : '',
    g.weight > 0 ? `weight ${g.weight.toFixed(1)}` : '',
    g.rating > 0 && g.owned >= 150 ? `BGG ${g.rating.toFixed(1)}` : '',
  ].filter(Boolean).join(' &middot; ');
  const move = g.delta > 0 ? `<span class="hot-up">&#9650;${g.delta}</span>` : g.delta < 0 ? `<span class="hot-down">&#9660;${-g.delta}</span>` : '';
  const owners = libs.filter(l => l.ids.has(g.id)).map(l => `<span class="gb-owner">${esc(l.label)}</span>`).join('');
  const pics = (g.pics || []).map((p, i) => `<button type="button" class="hot-pic" data-hot-pic="${g.id}:${i}" aria-label="Picture ${i + 1}"><img src="${esc(p.s)}" alt="" loading="lazy"></button>`).join('');
  return `<article class="hot-card">
      <div class="hot-top">
        <span class="hot-pos">#${g.pos}${move}</span>
        <img class="hot-box" src="${esc(g.img || '')}" alt="" loading="lazy">
        <div class="hot-main">
          <div class="hot-name">${esc(g.name)}</div>
          <div class="hot-tags">${g.upcoming ? `<span class="hot-tag up">Upcoming${g.year ? ' &middot; ' + g.year : ''}</span>` : g.year ? `<span class="hot-tag">${g.year}</span>` : ''}${owners}</div>
          ${facts ? `<div class="stats-game-detail">${facts}</div>` : ''}
        </div>
      </div>
      ${g.desc ? `<p class="hot-desc">${esc(g.desc)}</p>` : ''}
      ${pics ? `<div class="hot-pics">${pics}</div>` : ''}
      <a class="hot-link" href="https://boardgamegeek.com/boardgame/${g.id}" target="_blank" rel="noopener">On BGG &#8599;</a>
    </article>`;
}

function _renderHot(box) {
  const libs = _gbLibraries();
  const all = _hot.games || [];
  // the ones still to come out first, each part in hot-list order
  const list = (_hotFilter === 'upcoming' ? all.filter(g => g.upcoming)
    : _hotFilter === 'out' ? all.filter(g => !g.upcoming)
    : [...all.filter(g => g.upcoming), ...all.filter(g => !g.upcoming)]);
  const n = all.filter(g => g.upcoming).length;
  box.innerHTML = `
      <div class="hot-head">
        <div class="gb-chips">${_gbChips('hot', [['all', `All ${all.length}`], ['upcoming', `Upcoming ${n}`], ['out', `Out now ${all.length - n}`]], v => _hotFilter === v)}</div>
        <span class="hot-updated">BGG's hot list &middot; updated ${_hotAgo(_hot.updated)}</span>
      </div>
      ${list.map(g => _hotCardHtml(g, libs)).join('')}`;
}

function wireTrendingTab(container) {
  const box = container.querySelector('#hot');
  if (!box) return;
  _loadHot().then(() => _renderHot(box)).catch(() => {
    box.innerHTML = '<div class="stats-player-sub gb-empty">The hot list couldn&rsquo;t be loaded. Try again in a moment.</div>';
  });
  box.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-gb="hot"]');
    if (chip) { _hotFilter = chip.dataset.v; _renderHot(box); return; }
    const pic = e.target.closest('[data-hot-pic]');
    if (pic) {
      const [id, i] = pic.dataset.hotPic.split(':').map(Number);
      const g = (_hot.games || []).find(x => x.id === id);
      if (g) _openPics(g, i);
    }
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
