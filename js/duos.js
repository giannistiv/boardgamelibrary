// ── Ranks → Duos: who wins co-op games together ──
// Every co-op play with two or more at the table counts for each pair at that
// table (Duos), or for that exact line-up (Teams). Ranked by win rate,
// steadied towards the overall rate while a pair has only a few games, so
// 3 out of 3 doesn't beat 20 out of 25. Pick a game to see who's best at it;
// for a mission game, tries per win says who clears missions fastest.
// Logged in, you also see your own partners. Leviathan Wilds is left out.

const DUO_SKIP = new Set([358737]);
const DUO_MIN = { pair: 5, team: 4 };   // games together before a pair or team is ranked (all games)
const DUO_MIN_GAME = 3;                 // … and on one game
const DUO_PRIOR = 6;                    // how many games' worth the overall rate weighs
let _duoMode = 'pair';   // 'pair' | 'team'
let _duoGame = '';       // '' = every co-op game, else a bggId
let _duoAll = false;     // the whole list, not just the top

// Every co-op play with two or more at the table: {id, names (sorted), won}.
function _duoPlays() {
  const out = [];
  for (const id in PLAY_HISTORY) {
    if (DUO_SKIP.has(Number(id)) || isNoResultGame(id)) continue;
    const plays = PLAY_HISTORY[id];
    if (!_recIsCoop(findGameByBggId(id) || {}, plays)) continue;
    for (const p of plays) {
      const sc = (p.sc || []).filter(s => s && s.n);
      const names = [...new Set(sc.map(s => s.n))];
      if (names.length < 2) continue;
      const w = sc.filter(s => s.w).length;
      if (w && w < sc.length) continue;   // played competitively that time
      out.push({ id: Number(id), names: names.sort((a, b) => a.localeCompare(b)), won: w > 0 });
    }
  }
  return out;
}

function _duoPairs(names) {
  const out = [];
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) out.push([names[i], names[j]]);
  return out;
}

// Pairs (or teams) with their games together, ranked.
function _duoRank(plays, mode, min) {
  const map = new Map();
  for (const p of plays) {
    for (const names of mode === 'team' ? [p.names] : _duoPairs(p.names)) {
      const key = names.join('\u0000');
      const e = map.get(key) || { names, n: 0, w: 0, games: new Map() };
      e.n++; if (p.won) e.w++;
      const g = e.games.get(p.id) || { n: 0, w: 0 };
      g.n++; if (p.won) g.w++;
      e.games.set(p.id, g);
      map.set(key, e);
    }
  }
  const base = plays.length ? plays.filter(p => p.won).length / plays.length : 0.5;
  return [...map.values()].filter(e => e.n >= min)
    .map(e => Object.assign(e, { rate: e.w / e.n, score: (e.w + DUO_PRIOR * base) / (e.n + DUO_PRIOR) }))
    .sort((a, b) => b.score - a.score || b.n - a.n);
}

// The game a pair does best at (3+ games together).
function _duoBestGame(e) {
  let best = null;
  for (const [id, g] of e.games) {
    if (g.n < 3) continue;
    const s = (g.w + 1) / (g.n + 2);
    if (!best || s > best.s) best = { id, s, n: g.n, w: g.w };
  }
  return best;
}

function _renderDuosInto(container) {
  const all = _duoPlays();
  const esc = _escapeHtml;
  const me = typeof _ptViewer === 'function' ? _ptViewer() : _navPlayer();
  const gameName = (id) => { const g = findGameByBggId(id); return g ? g.name : `Game #${id}`; };

  // the games with enough co-op plays to pick
  const perGame = new Map();
  for (const p of all) perGame.set(p.id, (perGame.get(p.id) || 0) + 1);
  const games = [...perGame.entries()].filter(([, n]) => n >= 5).sort((a, b) => b[1] - a[1]);
  if (_duoGame && !perGame.has(Number(_duoGame))) _duoGame = '';
  const plays = _duoGame ? all.filter(p => p.id === Number(_duoGame)) : all;
  const min = _duoGame ? DUO_MIN_GAME : DUO_MIN[_duoMode];
  const list = _duoRank(plays, _duoMode, min);
  const base = plays.length ? Math.round(plays.filter(p => p.won).length / plays.length * 100) : 0;

  const pct = (e) => `${Math.round(e.rate * 100)}<small>%</small>`;
  const avs = (names) => `<span class="duo-avs">${names.slice(0, 4).map(n => `<span class="lb-avatar">${avatarInner(n)}</span>`).join('')}</span>`;
  const sub = (e) => {
    const bits = [`${e.w} of ${e.n} won`];
    if (_duoGame) {
      if (e.w) bits.push(`${(e.n / e.w).toFixed(1)} tries a win`);
    } else {
      const b = _duoBestGame(e);
      if (b && e.games.size > 1) bits.push(`best at ${esc(gameName(b.id))} (${b.w}/${b.n})`);
    }
    return bits.map((b, i) => `<span${i ? ' class="duo-best"' : ''}>${b}</span>`).join('<span>&middot;</span>');
  };
  const row = (e, rank) => `<div class="lb-row duo-row${me && e.names.includes(me) ? ' hr-me' : ''}">
      <div class="lb-rank">${rank}</div>
      ${avs(e.names)}
      <div class="lb-name-block"><div class="duo-names${e.names.length > 2 ? ' duo-team' : ''}">${e.names.length > 2 ? e.names.map(esc).join(', ') : e.names.map(n => `<span>${esc(n)}</span>`).join('')}</div><div class="lb-sub">${sub(e)}</div></div>
      <div class="lb-elo-block"><div class="lb-elo hr-val">${pct(e)}</div></div>
    </div>`;
  const TOP = 10;
  const shown = _duoAll ? list : list.slice(0, TOP);
  const moreBtn = list.length > TOP ? `<button type="button" class="lpm-view-all-btn" data-duo-all>${_duoAll ? 'Show fewer' : `Show all ${list.length}`}</button>` : '';

  // your partners: everyone you've played co-op with (3+ games), best first
  let mineHtml = '';
  if (me) {
    const mine = _duoRank(plays.filter(p => p.names.includes(me)), 'pair', 3).filter(e => e.names.includes(me)).slice(0, 8);
    if (mine.length) {
      mineHtml = `<div class="hr-together duo-mine">
        <div class="stats-section-title">Your partners${_duoGame ? ` at ${esc(gameName(_duoGame))}` : ''}</div>
        ${mine.map(e => {
          const other = e.names.find(n => n !== me);
          return `<div class="pt-p" data-visit-player="${esc(other)}">
            <span class="pt-p-name">${esc(other)}</span>
            <span class="pt-p-bar"><i style="width:${Math.max(3, Math.round(e.rate * 100))}%"></i></span>
            <span class="pt-p-val">${e.w}/${e.n} &middot; ${Math.round(e.rate * 100)}%</span>
          </div>`;
        }).join('')}
      </div>`;
    }
  }

  const seg = (v, label) => `<button type="button" class="gb-chip${_duoMode === v ? ' on' : ''}" data-duo-mode="${v}" aria-pressed="${_duoMode === v}">${label}</button>`;
  container.innerHTML = `
    <div class="lb-header hr-header">
      <div class="lb-title">${_duoMode === 'team' ? 'Teams' : 'Duos'}</div>
    </div>
    <div class="hr-intro">Who wins co-op games together. ${_duoMode === 'team'
      ? 'Each exact line-up at the table, with'
      : 'Every pair at the table, with'} ${_duoGame ? DUO_MIN_GAME : DUO_MIN[_duoMode]}+ games together, ranked by win rate, steadied towards the usual ${base}% while they've played only a few.</div>
    <div class="duo-controls">
      <div class="gb-chips">${seg('pair', 'Duos')}${seg('team', 'Teams')}</div>
      <select class="gb-sort" id="duo-game" aria-label="Game">
        <option value="">Every co-op game</option>
        ${games.map(([id, n]) => `<option value="${id}"${String(id) === String(_duoGame) ? ' selected' : ''}>${esc(gameName(id))} (${n})</option>`).join('')}
      </select>
    </div>
    ${list.length ? `<div class="lb-list">${shown.map((e, i) => row(e, i + 1)).join('')}</div>${moreBtn}`
      : `<div class="lb-empty">No ${_duoMode === 'team' ? 'team' : 'pair'} has ${min} co-op games together${_duoGame ? ' at this game' : ''} yet.</div>`}
    ${mineHtml}`;

  container.querySelectorAll('[data-duo-mode]').forEach(b => b.addEventListener('click', () => {
    _duoMode = b.dataset.duoMode; _duoAll = false; _renderDuosInto(container);
  }));
  container.querySelector('#duo-game').addEventListener('change', (e) => {
    _duoGame = e.target.value; _duoAll = false; _renderDuosInto(container);
  });
  const allBtn = container.querySelector('[data-duo-all]');
  if (allBtn) allBtn.addEventListener('click', () => { _duoAll = !_duoAll; _renderDuosInto(container); });
  container.querySelectorAll('[data-visit-player]').forEach(el => el.addEventListener('click', () => {
    showStatsView(el.dataset.visitPlayer, 'visiting');
    window.scrollTo(0, 0);
  }));
}
