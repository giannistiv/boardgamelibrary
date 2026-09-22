let _chOpenCard = null; // which card's detail panel stays expanded across re-renders

function computeChallenges(playerName) {
  const year = String(new Date().getFullYear());
  const gameName = (id) => { const g = findGameByBggId(id); return (g && g.name) || ('Game #' + id); };

  const plays = [];
  for (const bggId in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[bggId]) {
      if (!p || !p.date || !Array.isArray(p.sc)) continue;
      if (p.sc.some(s => s && s.n === playerName)) plays.push({ bggId: Number(bggId), date: p.date });
    }
  }
  plays.sort((a, b) => a.date.localeCompare(b.date));

  // New to me: games whose first-EVER play (all history) falls in this year.
  const firstPlay = {};
  for (const p of plays) if (!(p.bggId in firstPlay)) firstPlay[p.bggId] = p.date;
  const newToMe = Object.keys(firstPlay)
    .filter(id => firstPlay[id].slice(0, 4) === year)
    .map(id => ({ bggId: Number(id), name: gameName(id), date: firstPlay[id] }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const yearPlays = plays.filter(p => p.date.slice(0, 4) === year);

  // 10×10: ten games played ten times each within the year. Progress is the
  // number of "banked" plays — each game contributes at most 10.
  const counts = {};
  for (const p of yearPlays) counts[p.bggId] = (counts[p.bggId] || 0) + 1;
  const tenTop = Object.keys(counts)
    .map(id => ({ bggId: Number(id), name: gameName(id), count: counts[id] }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 10);
  const tenFilled = tenTop.reduce((s, g) => s + Math.min(g.count, 10), 0);
  const tenComplete = tenTop.length === 10 && tenTop.every(g => g.count >= 10);

  // Alphabet: cover all 26 letters with the first A-Z letter found in each
  // game's name ("7 Wonders" counts as W). First covering play wins.
  const alpha = {};
  for (const p of yearPlays) {
    const m = gameName(p.bggId).toUpperCase().match(/[A-Z]/);
    if (m && !alpha[m[0]]) alpha[m[0]] = { bggId: p.bggId, name: gameName(p.bggId), date: p.date };
  }

  // Time Traveler: play a game from every 5-year release era ('pre' = before
  // 1980). First covering play claims the era.
  const eras = {};
  for (const p of yearPlays) {
    const g = findGameByBggId(p.bggId);
    const y = g && g.year;
    if (!y || y < 1900) continue;
    const k = y < 1980 ? 'pre' : String(Math.min(Math.floor(y / 5) * 5, 2025));
    if (!eras[k]) eras[k] = { bggId: p.bggId, name: gameName(p.bggId), date: p.date, year: y };
  }

  // Weight Ladder: one game from every complexity band (heaviest first).
  const weights = {};
  for (const p of yearPlays) {
    const g = findGameByBggId(p.bggId);
    const c = g && g.complexity;
    if (!c) continue;
    const band = CH_WEIGHT_BANDS.find(b => c >= b.min && c < b.max);
    if (band && !weights[band.key]) weights[band.key] = { bggId: p.bggId, name: gameName(p.bggId), date: p.date, complexity: c };
  }

  // Category Bingo: a personal 4×4 card of 16 categories, shuffled with a
  // seed of player+year so everyone gets their own layout each season. The
  // twist: every square must be claimed by a DIFFERENT game. Plays are
  // walked chronologically; each new game claims the scarcest matching
  // square still open.
  const rng = (() => {
    let h = 1779033703;
    const s = playerName + '·' + year;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  })();
  const bingoCard = CH_BINGO_CATS.slice();
  for (let i = bingoCard.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bingoCard[i], bingoCard[j]] = [bingoCard[j], bingoCard[i]];
  }
  const bingoCovered = {};
  const bingoUsed = new Set();
  for (const p of yearPlays) {
    if (bingoUsed.has(p.bggId)) continue;
    const g = findGameByBggId(p.bggId);
    if (!g || !Array.isArray(g.categories) || !g.categories.length) continue;
    const options = [];
    for (let i = 0; i < 16; i++) {
      if (!bingoCovered[i] && g.categories.includes(bingoCard[i])) options.push(i);
    }
    if (!options.length) continue;
    options.sort((a, b) => CH_CAT_RARITY[bingoCard[a]] - CH_CAT_RARITY[bingoCard[b]]);
    bingoCovered[options[0]] = { bggId: p.bggId, name: gameName(p.bggId), date: p.date };
    bingoUsed.add(p.bggId);
  }
  const bingoLines = CH_BINGO_LINES.filter(L => L.every(i => bingoCovered[i])).length;

  return {
    year, yearPlayCount: yearPlays.length, newToMe,
    tenTop, tenFilled, tenComplete,
    alpha, alphaCount: Object.keys(alpha).length,
    eras, eraCount: Object.keys(eras).length,
    weights, weightCount: Object.keys(weights).length,
    bingoCard, bingoCovered, bingoCount: Object.keys(bingoCovered).length, bingoLines,
    hi: _computeHIndex(playerName)
  };
}

// Era bands for Time Traveler: pre-1980, then 5-year steps to the present.
const CH_ERA_BANDS = [
  { key: 'pre',  label: "&le;'79" },
  { key: '1980', label: "'80" }, { key: '1985', label: "'85" },
  { key: '1990', label: "'90" }, { key: '1995', label: "'95" },
  { key: '2000', label: "'00" }, { key: '2005', label: "'05" },
  { key: '2010', label: "'10" }, { key: '2015', label: "'15" },
  { key: '2020', label: "'20" }, { key: '2025', label: "'25" },
];

// Complexity rungs for the Weight Ladder, heaviest at the top.
const CH_WEIGHT_BANDS = [
  { key: 'w40', label: '4.0+',        min: 4.0, max: 9.9 },
  { key: 'w35', label: '3.5–4.0', min: 3.5, max: 4.0 },
  { key: 'w30', label: '3.0–3.5', min: 3.0, max: 3.5 },
  { key: 'w25', label: '2.5–3.0', min: 2.5, max: 3.0 },
  { key: 'w20', label: '2.0–2.5', min: 2.0, max: 2.5 },
  { key: 'w15', label: '1.5–2.0', min: 1.5, max: 2.0 },
  { key: 'w10', label: '< 1.5',        min: 0.1, max: 1.5 },
];

// The 16 bingo categories. Fantasy, Solo, Racing and Area Control are left
// out — too few games carry them for anyone but the heaviest player to have
// a real shot. Rarity ranks (fewest plays first) decide which square a
// multi-category game claims.
const CH_BINGO_CATS = ['Co-op','Strategy','Thematic','Card Game','Family','Campaign','Puzzle','Adventure','Deck Building','Euro','Abstract','Party','Deduction','Dice','Engine Building','Worker Placement'];
const CH_CAT_RARITY = { 'Worker Placement': 0, 'Engine Building': 1, 'Dice': 2, 'Deduction': 3, 'Party': 4, 'Abstract': 5, 'Euro': 6, 'Deck Building': 7, 'Adventure': 8, 'Puzzle': 9, 'Campaign': 10, 'Family': 11, 'Card Game': 12, 'Thematic': 13, 'Strategy': 14, 'Co-op': 15 };
const CH_BINGO_LINES = [
  [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
  [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
  [0,5,10,15],[3,6,9,12],
];

function showChallengesView(playerName) {
  const container = document.getElementById('challenges-view');
  if (!container) return;
  const d = computeChallenges(playerName);
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const open = (key) => _chOpenCard === key ? ' open' : '';

  const gameRow = (g, extra) => `
    <div class="ch-row" data-bgg-id="${g.bggId}">
      <img class="ch-row-img" src="images/${g.bggId}.jpg" alt="" onerror="__imgFallback(this, ${g.bggId})">
      <span class="ch-row-name">${g.name}</span>
      <span class="ch-row-extra">${extra}</span>
    </div>`;

  // ── 10×10 ──
  // The games are visible right on the card (cover + dots), so there is no
  // drill-down list here; clicking a cover opens the game's modal.
  let dotRows = '';
  for (let i = 0; i < 10; i++) {
    const g = d.tenTop[i];
    const thumb = g
      ? `<img class="ch-dot-img" data-bgg-id="${g.bggId}" src="images/${g.bggId}.jpg" alt="" title="${g.name} — ${g.count} play${g.count === 1 ? '' : 's'}" onerror="__imgFallback(this, ${g.bggId})">`
      : `<span class="ch-dot-img"></span>`;
    let dots = '';
    for (let j = 0; j < 10; j++) dots += `<span class="ch-dot${g && g.count > j ? ' on' : ''}"></span>`;
    dotRows += `<div class="ch-dotrow">${thumb}${dots}</div>`;
  }

  // ── Alphabet ──
  const alphaChips = LETTERS.map(L =>
    `<span class="ch-letter${d.alpha[L] ? ' on' : ''}" data-letter="${L}">${L}</span>`).join('');
  const missing = LETTERS.filter(L => !d.alpha[L]);
  const alphaDetail = `<div class="ch-alpha-hint">Tap a letter above to see what you played &mdash; or, for an empty letter, what you could play.</div>` +
    (missing.length
      ? `<div class="ch-missing">Missing: ${missing.join(' &middot; ')}</div>`
      : `<div class="ch-missing ch-done-txt">Every letter covered — alphabet complete!</div>`);

  // Candidate games per letter (from every catalogue) for empty-letter hints.
  const alphaCandidates = {};
  const seenCand = new Set();
  _allGames().forEach(g => {
    if (!g || g.bggId == null || seenCand.has(g.bggId)) return;
    const m = String(g.name || '').toUpperCase().match(/[A-Z]/);
    if (!m) return;
    seenCand.add(g.bggId);
    (alphaCandidates[m[0]] = alphaCandidates[m[0]] || []).push({ bggId: g.bggId, name: g.name });
  });
  Object.values(alphaCandidates).forEach(list => list.sort((a, b) => a.name.localeCompare(b.name)));

  // Detail panel for one clicked letter: the claiming game if done, else a
  // faded list of games (from any list) that start with that letter.
  const renderAlphaLetter = (L) => {
    const a = d.alpha[L];
    if (a) {
      return `<div class="ch-alpha-head"><b>${L}</b> &mdash; played this year</div>
        <div class="ch-row" data-bgg-id="${a.bggId}">
          <span class="ch-letter on">${L}</span>
          <img class="ch-row-img" src="images/${a.bggId}.jpg" alt="" onerror="__imgFallback(this, ${a.bggId})">
          <span class="ch-row-name">${a.name}</span>
          <span class="ch-row-extra">${_fmtDateShort(a.date)}</span>
        </div>`;
    }
    const cands = alphaCandidates[L] || [];
    if (!cands.length) return `<div class="ch-alpha-head"><b>${L}</b> &mdash; not played yet</div>
      <div class="ch-missing">No game starting with ${L} in any collection.</div>`;
    const shown = cands.slice(0, 40);
    return `<div class="ch-alpha-head"><b>${L}</b> &mdash; not played yet &middot; play one of these:</div>
      ${shown.map(g => `<div class="ch-row ch-opt" data-bgg-id="${g.bggId}">
        <span class="ch-letter">${L}</span>
        <img class="ch-row-img" src="images/${g.bggId}.jpg" alt="" onerror="__imgFallback(this, ${g.bggId})">
        <span class="ch-row-name">${g.name}</span>
      </div>`).join('')}
      ${cands.length > shown.length ? `<div class="ch-missing">+${cands.length - shown.length} more in your collections</div>` : ''}`;
  };

  // ── Category Bingo ──
  const bingoCells = d.bingoCard.map((cat, i) => {
    const c = d.bingoCovered[i];
    return c
      ? `<div class="ch-bingo-cell on" data-bgg-id="${c.bggId}" title="${cat} — ${c.name} (${_fmtDateShort(c.date)})">
          <span class="ch-bingo-name">${c.name}</span>
          <img src="images/${c.bggId}.jpg" alt="" onerror="__imgFallback(this, ${c.bggId})">
          <span class="ch-bingo-lbl">${cat}</span>
        </div>`
      : `<div class="ch-bingo-cell"><span class="ch-bingo-lbl">${cat}</span></div>`;
  }).join('');
  const bingoStatus = d.bingoCount === 16
    ? 'BLACKOUT! Card complete'
    : (d.bingoLines
      ? `BINGO &times;${d.bingoLines} &mdash; blackout to finish`
      : 'complete a row, column or diagonal for BINGO');

  // ── Time Traveler ──
  const eraSegs = CH_ERA_BANDS.map(b => {
    const e = d.eras[b.key];
    return `<div class="ch-era${e ? ' on' : ''}"${e ? ` title="${e.name} (${e.year})"` : ''}>
      <div class="ch-era-seg"></div>
      <span class="ch-era-lbl">${b.label}</span>
    </div>`;
  }).join('');
  const eraMissing = CH_ERA_BANDS.filter(b => !d.eras[b.key]);
  const eraDetail =
    CH_ERA_BANDS.filter(b => d.eras[b.key]).map(b => {
      const e = d.eras[b.key];
      return `<div class="ch-row" data-bgg-id="${e.bggId}">
        <span class="ch-letter on ch-era-chip">${b.label}</span>
        <img class="ch-row-img" src="images/${e.bggId}.jpg" alt="" onerror="__imgFallback(this, ${e.bggId})">
        <span class="ch-row-name">${e.name} <span class="ch-over">(${e.year})</span></span>
        <span class="ch-row-extra">${_fmtDateShort(e.date)}</span>
      </div>`;
    }).join('') +
    (eraMissing.length
      ? `<div class="ch-missing">Missing eras: ${eraMissing.map(b => b.label).join(' &middot; ')}</div>`
      : `<div class="ch-missing ch-done-txt">Every era visited — time traveler!</div>`);

  // ── Weight Ladder ──
  const rungs = CH_WEIGHT_BANDS.map(b => {
    const w = d.weights[b.key];
    return w
      ? `<div class="ch-rung on" data-bgg-id="${w.bggId}">
          <span class="ch-rung-lbl">${b.label}</span>
          <img class="ch-rung-img" src="images/${w.bggId}.jpg" alt="" onerror="__imgFallback(this, ${w.bggId})">
          <span class="ch-rung-name">${w.name}</span>
          <span class="ch-rung-w">${w.complexity}</span>
        </div>`
      : `<div class="ch-rung">
          <span class="ch-rung-lbl">${b.label}</span>
          <span class="ch-rung-empty">&mdash;</span>
        </div>`;
  }).join('');

  // ── New to me ──
  const newDetail = d.newToMe.length
    ? d.newToMe.map(g => gameRow(g, _fmtDateShort(g.date))).join('')
    : `<div class="ch-empty">No new games discovered yet in ${d.year}.</div>`;

  // ── H-index (all-time) ──
  const hiCore = d.hi.list.slice(0, d.hi.h);
  const hiName = (id) => { const g = findGameByBggId(id); return (g && g.name) || ('Game #' + id); };
  let hiNext = '';
  if (d.hi.list.length > d.hi.h) {
    const nxt = d.hi.list[d.hi.h];
    const need = (d.hi.h + 1) - nxt.count;
    if (need > 0) hiNext = `<div class="ch-missing">Next: <b>${hiName(nxt.bggId)}</b> needs ${need} more play${need === 1 ? '' : 's'} to reach H&nbsp;${d.hi.h + 1}</div>`;
  }
  const hiDetail = hiCore.map(it => gameRow({ bggId: it.bggId, name: hiName(it.bggId) }, `${it.count}&times;`)).join('') + hiNext;

  container.innerHTML = `
    <div class="lb-header">
      <div class="lb-title">${playerName}'s Challenges</div>
      <div class="ch-year">${d.year} season &middot; ${d.yearPlayCount} plays &middot; yearly challenges reset January 1st</div>
    </div>
    <div class="ch-grid">

      <div class="ch-card${d.tenComplete ? ' done' : ''}${open('ten')}" data-ch="ten">
        <div class="ch-head">
          <div>
            <div class="ch-name">10 &times; 10 <span class="ch-tag">${d.year}</span></div>
            <div class="ch-sub">Play 10 games 10 times each</div>
          </div>
          <div class="ch-score">${d.tenFilled}<span class="ch-score-sub">/100</span></div>
        </div>
        <div class="ch-viz">${dotRows}</div>
        <div class="ch-barrow">
          <div class="ch-bar"><div class="ch-bar-fill" style="width:${d.tenFilled}%"></div></div>
          <span class="ch-pct">${d.tenFilled}%</span>
        </div>
      </div>

      <div class="ch-card${d.alphaCount === 26 ? ' done' : ''}${open('alpha')}" data-ch="alpha">
        <div class="ch-head">
          <div>
            <div class="ch-name">Alphabet <span class="ch-tag">${d.year}</span></div>
            <div class="ch-sub">Play a game for every letter A&ndash;Z</div>
          </div>
          <div class="ch-score">${d.alphaCount}<span class="ch-score-sub">/26</span></div>
        </div>
        <div class="ch-letters">${alphaChips}</div>
        <div class="ch-barrow">
          <div class="ch-bar"><div class="ch-bar-fill" style="width:${Math.round(d.alphaCount / 26 * 100)}%"></div></div>
          <span class="ch-pct">${Math.round(d.alphaCount / 26 * 100)}%</span>
        </div>
        <div class="ch-detail">${alphaDetail}</div>
        <div class="ch-expand"><span class="ch-x-show">&#9662; show letters</span><span class="ch-x-hide">&#9652; hide</span></div>
      </div>

      <div class="ch-card${d.bingoCount === 16 ? ' done' : ''}" data-ch="bingo">
        <div class="ch-head">
          <div>
            <div class="ch-name">Category Bingo <span class="ch-tag">${d.year}</span></div>
            <div class="ch-sub">Your personal card &mdash; every square needs a different game</div>
          </div>
          <div class="ch-score">${d.bingoCount}<span class="ch-score-sub">/16</span></div>
        </div>
        <div class="ch-bingo">${bingoCells}</div>
        <div class="ch-sub" style="text-align:center;margin-top:0.55rem">${bingoStatus}</div>
      </div>

      <div class="ch-card${d.eraCount === CH_ERA_BANDS.length ? ' done' : ''}${open('eras')}" data-ch="eras">
        <div class="ch-head">
          <div>
            <div class="ch-name">Time Traveler <span class="ch-tag">${d.year}</span></div>
            <div class="ch-sub">Play a game from every 5-year era</div>
          </div>
          <div class="ch-score">${d.eraCount}<span class="ch-score-sub">/${CH_ERA_BANDS.length}</span></div>
        </div>
        <div class="ch-eras">${eraSegs}</div>
        <div class="ch-barrow">
          <div class="ch-bar"><div class="ch-bar-fill" style="width:${Math.round(d.eraCount / CH_ERA_BANDS.length * 100)}%"></div></div>
          <span class="ch-pct">${Math.round(d.eraCount / CH_ERA_BANDS.length * 100)}%</span>
        </div>
        <div class="ch-detail">${eraDetail}</div>
        <div class="ch-expand"><span class="ch-x-show">&#9662; show eras</span><span class="ch-x-hide">&#9652; hide</span></div>
      </div>

      <div class="ch-card${d.weightCount === CH_WEIGHT_BANDS.length ? ' done' : ''}" data-ch="weight">
        <div class="ch-head">
          <div>
            <div class="ch-name">Weight Ladder <span class="ch-tag">${d.year}</span></div>
            <div class="ch-sub">One game from every complexity band</div>
          </div>
          <div class="ch-score">${d.weightCount}<span class="ch-score-sub">/${CH_WEIGHT_BANDS.length}</span></div>
        </div>
        <div class="ch-rungs">${rungs}</div>
      </div>

      <div class="ch-card${open('new')}" data-ch="new">
        <div class="ch-head">
          <div>
            <div class="ch-name">New To Me <span class="ch-tag">${d.year}</span></div>
            <div class="ch-sub">Games played for the very first time</div>
          </div>
        </div>
        <div class="ch-big">${d.newToMe.length}</div>
        <div class="ch-sub" style="text-align:center">new game${d.newToMe.length === 1 ? '' : 's'} discovered in ${d.year}</div>
        <div class="ch-detail">${newDetail}</div>
        <div class="ch-expand"><span class="ch-x-show">&#9662; show games</span><span class="ch-x-hide">&#9652; hide</span></div>
      </div>

      <div class="ch-card${open('hindex')}" data-ch="hindex">
        <div class="ch-head">
          <div>
            <div class="ch-name">H-Index <span class="ch-tag ch-tag-alltime">all-time</span></div>
            <div class="ch-sub">${d.hi.h} games played at least ${d.hi.h} times each</div>
          </div>
        </div>
        <div class="ch-big">${d.hi.h}</div>
        <div class="ch-sub" style="text-align:center">lifetime h-index</div>
        <div class="ch-detail">${hiDetail}</div>
        <div class="ch-expand"><span class="ch-x-show">&#9662; show games</span><span class="ch-x-hide">&#9652; hide</span></div>
      </div>

    </div>`;
  window.scrollTo(0, 0);
  wireChallenges();

  // Alphabet: clicking a letter shows that letter's detail in-place (the
  // played game, or faded candidates for an empty letter) without collapsing
  // the card. stopPropagation keeps the card-level toggle from firing.
  const alphaCard = container.querySelector('.ch-card[data-ch="alpha"]');
  if (alphaCard) {
    const detail = alphaCard.querySelector('.ch-detail');
    const wireDetailRows = () => detail.querySelectorAll('[data-bgg-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const g = findGameByBggId(el.dataset.bggId);
        if (g) openModal(g);
      });
    });
    alphaCard.querySelectorAll('.ch-letters .ch-letter').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const L = chip.dataset.letter;
        alphaCard.querySelectorAll('.ch-letters .ch-letter').forEach(c => c.classList.remove('sel'));
        chip.classList.add('sel');
        container.querySelectorAll('.ch-card').forEach(c => c.classList.remove('open'));
        alphaCard.classList.add('open');
        _chOpenCard = 'alpha';
        detail.innerHTML = renderAlphaLetter(L);
        wireDetailRows();
      });
    });
  }
}

function wireChallenges() {
  const container = document.getElementById('challenges-view');
  if (!container) return;
  container.querySelectorAll('.ch-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const clickable = e.target.closest('.ch-row, .ch-dot-img, .ch-bingo-cell, .ch-rung');
      if (clickable && clickable.dataset.bggId) {
        const g = findGameByBggId(clickable.dataset.bggId);
        if (g) openModal(g);
        return;
      }
      if (!card.querySelector('.ch-detail')) return; // 10×10 has no drill-down
      const wasOpen = card.classList.contains('open');
      container.querySelectorAll('.ch-card').forEach(c => c.classList.remove('open'));
      if (!wasOpen) card.classList.add('open');
      _chOpenCard = wasOpen ? null : card.dataset.ch;
    });
  });
}

// ── Play heatmap (GitHub-style contribution calendar) ───────────────────
