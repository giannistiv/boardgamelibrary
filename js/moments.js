// ── Milestones and "on this day" ──
// Milestones: a player's first play of a game, their 10th, 25th, 50th and
// 100th (then every 100th) play of it, and their 100th, 250th, 500th (then
// every 500th) play overall. They show as small badges on the play lists and
// the game page, and in Wrapped.
// On this day: what a player played on today's date in earlier years, as a
// small card on the profile.

const MS_GAME = [10, 25, 50, 100];   // then every 100th
const MS_ALL = [100, 250, 500];      // then every 500th

function _msGameHit(n) { return n === 1 || MS_GAME.includes(n) || (n > 100 && n % 100 === 0); }
function _msAllHit(n) { return MS_ALL.includes(n) || (n > 500 && n % 500 === 0); }

function _ordinal(n) {
  const v = n % 100, s = ['th', 'st', 'nd', 'rd'];
  return n.toLocaleString('en') + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Per player: {byPlay: WeakMap(play → [hit]), list: [hit], perGame: {bggId: plays}},
// hit = {kind: 'first'|'game'|'all', n, bggId, date}. Worked out again when the
// plays change (same signature as the play-time cache).
const _msCache = new Map();
function playerMilestones(name) {
  const sig = _ptSig();
  const c = _msCache.get(name);
  if (c && c.sig === sig) return c;
  const mine = [];
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (p && p.date && Array.isArray(p.sc) && p.sc.some(s => s && s.n === name)) mine.push({ id, p });
    }
  }
  mine.sort((a, b) => byPlayOrder(a.p, b.p));
  const perGame = {}, byPlay = new WeakMap(), list = [];
  mine.forEach(({ id, p }, i) => {
    const n = perGame[id] = (perGame[id] || 0) + 1;
    const hits = [];
    if (_msGameHit(n)) hits.push({ kind: n === 1 ? 'first' : 'game', n, bggId: Number(id), date: p.date });
    if (_msAllHit(i + 1)) hits.push({ kind: 'all', n: i + 1, bggId: Number(id), date: p.date });
    if (hits.length) { byPlay.set(p, hits); list.push(...hits); }
  });
  const res = { sig, byPlay, list, perGame };
  _msCache.set(name, res);
  return res;
}

function milestoneText(h, you) {
  if (h.kind === 'first') return you ? 'Your first' : 'First play';
  if (h.kind === 'all') return `${_ordinal(h.n)} play overall`;
  return you ? `Your ${_ordinal(h.n)}` : `${_ordinal(h.n)} play`;
}

// Badges for one play. `you`: word them for the viewer ("Your 25th").
function milestoneBadges(name, play, you) {
  if (!name || !play) return '';
  const hits = playerMilestones(name).byPlay.get(play);
  if (!hits) return '';
  return hits.map(h => `<span class="ms-badge ${h.kind}">${milestoneText(h, you)}</span>`).join('');
}

// ── On this day ──
function onThisDay(name, today) {
  const now = today || new Date();
  const md = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const thisYear = now.getFullYear();
  const byYear = {};
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (!p || !p.date || p.date.slice(5) !== md || !Array.isArray(p.sc)) continue;
      const y = Number(p.date.slice(0, 4));
      if (y >= thisYear || !p.sc.some(s => s && s.n === name)) continue;
      (byYear[y] = byYear[y] || []).push({ id, p });
    }
  }
  return Object.keys(byYear).map(Number).sort((a, b) => b - a).map(y => {
    const games = {}, people = new Set();
    let wins = 0;
    for (const { id, p } of byYear[y]) {
      games[id] = (games[id] || 0) + 1;
      for (const s of p.sc) {
        if (!s || !s.n) continue;
        if (s.n === name) { if (s.w) wins++; continue; }
        if (!_ptIsAnon(s.n) && !(typeof HIDDEN_PLAYERS !== 'undefined' && HIDDEN_PLAYERS.has(s.n))) people.add(s.n);
      }
    }
    const top = Object.entries(games).sort((a, b) => b[1] - a[1]);
    return { year: y, ago: thisYear - y, plays: byYear[y].length, wins, games: top, people: [...people] };
  });
}

function buildOnThisDayHtml(name) {
  const years = onThisDay(name).slice(0, 3);
  if (!years.length) return '';
  const now = new Date();
  const today = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const gameName = id => { const g = findGameByBggId(id); return g ? g.name : 'Game #' + id; };
  const rows = years.map(y => {
    const [firstId] = y.games[0];
    const shown = y.games.slice(0, 2).map(([id, n]) => _escapeHtml(gameName(id)) + (n > 1 ? ` &times;${n}` : ''));
    const more = y.games.length - shown.length;
    const who = y.people.slice(0, 3).map(_escapeHtml).join(', ') + (y.people.length > 3 ? ` +${y.people.length - 3}` : '');
    return `<div class="otd-row" data-bgg-id="${firstId}" role="button" tabindex="0">
        <img src="images/${firstId}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${firstId})">
        <div class="otd-text">
          <div class="otd-when">${y.ago === 1 ? 'A year ago' : `${y.ago} years ago`} <span>&middot; ${y.year}</span></div>
          <div class="otd-what">${shown.join(', ')}${more > 0 ? ` <span>+${more} more</span>` : ''}</div>
          ${who ? `<div class="otd-who">with ${who}</div>` : ''}
        </div>
      </div>`;
  }).join('');
  return `<div class="stats-section otd">
      <div class="otd-head"><span class="otd-kicker">On this day</span><span class="otd-date">${today}</span></div>
      ${rows}
    </div>`;
}
