// ── Win odds ──
// Who's likely to win a competitive game, from how everyone has done before:
//   • Overall skill: an Elo rating over every competitive play since the
//     start (the leaderboard's rules, never reset). It counts for less in
//     light games, where luck decides more.
//   • This game: a separate rating from this game's plays only, trusted more
//     the more someone has played it.
//   • A first play: someone new to the game starts behind, more so in a
//     heavy one.
// The ratings become chances with the usual Elo formula: each player gets
// their share of 10^(rating/400) — for two players, the leaderboard's
// expected score.
// Tuned by predicting every competitive play since 2024 from the plays
// before it: the favourite won 49% of the time against 49% predicted, and
// odds of ~15%, ~28%, ~48% and ~68% came true about that often.

const WO_NEW = 40;        // Elo points behind per weight point, on a first play
const WO_TRUST = 8;       // plays of a game before its own rating counts half

let _woCache = null;      // {sig, all: {name: {r, n}}, games: {bggId: {name: {r, n, wins}}}}

function _woReplay() {
  const sig = _ptSig();
  if (_woCache && _woCache.sig === sig) return _woCache;
  const flat = [];
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (p && p.date && Array.isArray(p.sc)) flat.push({ id: Number(id), p, k: playOrderKey(p) });
    }
  }
  flat.sort((a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : 0));
  const all = {}, games = {};
  // one Elo step for the players of a play, in `book` (name → {r, n})
  const step = (book, parts, w) => {
    const pre = {}, cnt = {}, d = {};
    const lossMult = Math.min(1, Math.max(0.7, 3 / parts.length));
    for (const m of parts) {
      if (!book[m.player]) book[m.player] = { r: 1000, n: 0, wins: 0 };
      pre[m.player] = book[m.player].r; cnt[m.player] = book[m.player].n; d[m.player] = 0;
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], b = parts[j];
        if (a.rank === b.rank) continue;
        const win = a.rank < b.rank ? a : b, lose = a.rank < b.rank ? b : a;
        const ew = 1 / (1 + Math.pow(10, (pre[lose.player] - pre[win.player]) / 400));
        d[win.player] += (cnt[win.player] < 5 ? 48 : 32) * w * (1 - ew);
        d[lose.player] -= (cnt[lose.player] < 5 ? 48 : 32) * w * (1 - ew) * lossMult;
      }
    }
    for (const m of parts) {
      if (m.player === GAME_PLAYER_NAME) { book[m.player].r = 1000; continue; }
      book[m.player].r += d[m.player];
      book[m.player].n++;
      if (m.rank === 1) book[m.player].wins++;
    }
  };
  for (const { id, p } of flat) {
    const ranks = _leaderboardRanksForPlay(p.sc, id);
    if (!ranks) continue;
    const best = {};
    for (const r of ranks) {
      const n = NAME_MAP[r.player] || r.player;
      if (n && (best[n] == null || r.rank < best[n])) best[n] = r.rank;
    }
    const parts = Object.keys(best).map(n => ({ player: n, rank: best[n] }));
    if (parts.length < 2) continue;
    const g = findGameByBggId(id);
    const cx = g && Number(g.complexity) > 0 ? Number(g.complexity) : 2.5;
    step(all, parts, cx / 5);
    step(games[id] || (games[id] = {}), parts, 1);
  }
  delete all[GAME_PLAYER_NAME];
  return (_woCache = { sig, all, games });
}

// Competitive: not a co-op, and results are kept.
function woIsCompetitive(game, plays) {
  if (isNoResultGame(game.bggId)) return false;
  if (plays && plays.length) return !_recIsCoop(game, plays);
  return !(Array.isArray(game.categories) && game.categories.includes('Co-op'));
}

// [{name, p, r, plays, wins, isNew}], most likely first. Names not in the
// history (guests) count as average players new to the game.
function winOdds(bggId, names) {
  const { all, games } = _woReplay();
  const here = games[bggId] || {};
  const g = findGameByBggId(bggId) || {};
  const w = Number(g.complexity) > 0 ? Number(g.complexity) : 2.5;
  const skill = Math.min(1, Math.max(0.25, (w - 1) / 3));   // how much overall skill carries over
  const played = new Set();
  for (const p of PLAY_HISTORY[bggId] || []) for (const s of p.sc) if (s && s.n) played.add(s.n);
  const rows = names.map(name => {
    const o = all[name], h = here[name];
    const isNew = !played.has(name);
    const trust = h ? h.n / (h.n + WO_TRUST) : 0;
    const r = 1000 + skill * ((o ? o.r : 1000) - 1000) + trust * ((h ? h.r : 1000) - 1000) - (isNew ? WO_NEW * w : 0);
    return { name, r, plays: h ? h.n : 0, wins: h ? h.wins : 0, isNew, known: !!o };
  });
  const sum = rows.reduce((a, x) => a + Math.pow(10, x.r / 400), 0);
  rows.forEach(x => { x.p = Math.pow(10, x.r / 400) / sum; });
  return rows.sort((a, b) => b.p - a.p);
}

const _woPct = p => `${Math.round(p * 100)}%`;

// One line for a Tonight suggestion: "Odds: Στιβ 41% · Δημητρης 33% · …"
function winOddsLine(bggId, names, guests) {
  const g = findGameByBggId(bggId);
  if (!g || names.length + guests < 2 || !names.length || !woIsCompetitive(g, PLAY_HISTORY[bggId])) return '';
  const guestNames = Array.from({ length: guests }, (_, i) => `\u0000guest${i}`);
  const rows = winOdds(bggId, names.concat(guestNames));
  const guestP = rows.filter(x => x.name.startsWith('\u0000')).reduce((a, x) => a + x.p, 0);
  const named = rows.filter(x => !x.name.startsWith('\u0000'));
  const parts = named.slice(0, 4).map(x => `${_escapeHtml(x.name)} <b>${_woPct(x.p)}</b>`);
  if (named.length > 4) parts.push('&hellip;');
  if (guests) parts.push(`guest${guests !== 1 ? 's' : ''} ${_woPct(guestP)}`);
  return `<div class="wo-line"><span>Odds</span> ${parts.join(' &middot; ')}</div>`;
}

// ── Game page: "Who'd win?" ──
// Chips for the people likely to play it; tap to change the table.
const _woPick = {};   // bggId → Set of names picked on this game's page

function _woCandidates(game) {
  const me = _ptViewer();
  const count = new Map();
  for (const p of PLAY_HISTORY[game.bggId] || []) {
    for (const s of p.sc) {
      if (!s || !s.n || _ptIsAnon(s.n) || HIDDEN_PLAYERS.has(s.n)) continue;
      count.set(s.n, (count.get(s.n) || 0) + 1);
    }
  }
  let tonight = [];
  try { tonight = (JSON.parse(localStorage.getItem('bgl-tonight') || 'null') || {}).players || []; } catch (_) {}
  const regulars = [...count.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n).slice(0, 8);
  const names = [...new Set([...(me ? [me] : []), ...tonight, ...regulars])].slice(0, 12);
  // who's playing to start with: tonight's group, else the latest table with you in it
  let start = tonight.filter(n => names.includes(n));
  if (start.length < 2) {
    const latest = (PLAY_HISTORY[game.bggId] || []).find(p => !me || p.sc.some(s => s.n === me));
    start = latest ? latest.sc.map(s => s.n).filter(n => names.includes(n)) : [];
    if (me && !start.includes(me)) start.unshift(me);
  }
  if (start.length < 2) start = names.slice(0, 2);
  return { names, start };
}

function _woRowsHtml(game, picked) {
  if (picked.length < 2) return '<div class="pc-note">Pick at least two players.</div>';
  const rows = winOdds(game.bggId, picked);
  const top = rows[0];
  const esc = _escapeHtml;
  const bars = rows.map(x => `
          <div class="pt-p wo-row${x === top ? ' fav' : ''}">
            <span class="pt-p-name">${esc(x.name)}</span>
            <span class="pt-p-bar"><i style="width:${Math.max(2, Math.round(x.p * 100))}%"></i></span>
            <span class="pt-p-val">${_woPct(x.p)}</span>
          </div>`).join('');
  const fresh = rows.filter(x => x.isNew).map(x => esc(x.name));
  const notes = [
    top.plays ? `${esc(top.name)} has won ${top.wins} of ${top.plays} competitive play${top.plays !== 1 ? 's' : ''} of it` : `${esc(top.name)} leads on overall form`,
    fresh.length ? `new to it: ${fresh.join(', ')}` : '',
  ].filter(Boolean).join(' &middot; ');
  return `${bars}<div class="pc-note">${notes}.</div>`;
}

function buildWinOddsHtml(game) {
  if (!(game.bggId > 0) || !woIsCompetitive(game, PLAY_HISTORY[game.bggId])) return '';
  const range = _gbPlayerRange(game.players);
  if (range && range[1] < 2) return '';   // solo only
  const { names, start } = _woCandidates(game);
  if (names.length < 2) return '';
  const picked = _woPick[game.bggId] || (_woPick[game.bggId] = new Set(start));
  return `
      <div class="pc wo" id="wo-box" data-bgg="${game.bggId}">
        <div class="pc-head"><span class="pc-title">Who'd win?</span><span class="pc-src" title="Overall form (an all-time Elo, counted less in light games), each person's record in this game, and a handicap for a first play">from past results</span></div>
        <div class="wo-chips">${names.map(n => `<button type="button" class="gb-chip${picked.has(n) ? ' on' : ''}" data-wo="${_escapeHtml(n)}" aria-pressed="${picked.has(n)}">${_escapeHtml(n)}</button>`).join('')}</div>
        <div class="wo-rows" id="wo-rows">${_woRowsHtml(game, [...picked])}</div>
      </div>`;
}

function wireWinOdds(container, game) {
  const box = container.querySelector('#wo-box');
  if (!box) return;
  box.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-wo]');
    if (!chip) return;
    const set = _woPick[game.bggId];
    const name = chip.dataset.wo;
    if (set.has(name)) set.delete(name); else set.add(name);
    chip.classList.toggle('on', set.has(name));
    chip.setAttribute('aria-pressed', String(set.has(name)));
    box.querySelector('#wo-rows').innerHTML = _woRowsHtml(game, [...set]);
  });
}
