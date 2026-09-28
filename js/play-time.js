// ── Time at the table ──
// How long each play took, estimated from BGG's playing time and adjusted for
// the table:
//   • Player count. BGG gives a time range over the game's player range, so
//     the time is read off that range at the number who played. A single time
//     is taken to be at BGG's best player count, and each player more or fewer
//     adds or takes off a share of it (less for simultaneous and real-time
//     games, where more players barely slow things down).
//   • Weight. Heavier games run longer than the box says.
//   • First plays. When someone plays a game for the first time, the rules get
//     taught (longer for heavier games, shorter for an expansion) and the game
//     goes slower, more so the more of the table is new to it.
//   • Replays. Playing the same game again the same day goes quicker: it's
//     already set up and the rules are fresh.
//   • A duration logged in BGStats replaces the estimate when it's believable
//     (a timer left running all evening isn't).
// A person's time is the sum over the plays they were in, so each play counts
// for everyone at the table, and new plays count as soon as they're imported.
// Boxes are optimistic, so the totals lean low.

const PT_HEAVY = 0.10;          // longer per weight point above 2
const PT_LEARN = 0.30;          // slower when the whole table is new to a weight-3 game
const PT_PER_PLAYER = 0.5;      // share of the time each player more adds, turn-based games
const PT_PER_PLAYER_SIM = 0.15; // …simultaneous play, party games, roll & writes
const PT_PER_PLAYER_RT = 0.05;  // …real-time games
const PT_SESSION = 180;         // most one sitting of a campaign game takes, in minutes
const PT_SLOW_MAX = 1.3;        // first plays: at most this much slower
const PT_REPLAY = 0.75;         // the same game again that day: already set up, rules fresh

function _ptRange(str) {
  const nums = String(str || '').match(/\d+/g);
  if (!nums) return null;
  const a = Number(nums[0]), b = Number(nums[1] || nums[0]);
  return a > 0 ? [Math.min(a, b), Math.max(a, b)] : null;
}

function _ptWeight(game) {
  const w = Number(game && game.complexity);
  return w > 0 ? w : 2.2;   // unknown: about an average game on the shelves
}

function _ptPerPlayer(game) {
  const tags = [...(game.mechanics || []), ...(game.categories || [])];
  if (tags.includes('Real-Time')) return PT_PER_PLAYER_RT;
  if (tags.some(t => t === 'Simultaneous Action Selection' || t === 'Paper-and-Pencil' || t === 'Party')) return PT_PER_PLAYER_SIM;
  return PT_PER_PLAYER;
}

// A campaign game's box time can be the whole campaign (The 7th Continent:
// 5-1000 min), but a logged play is one sitting. A range that wide says the
// same even when the game isn't tagged as a campaign.
function _ptIsCampaign(game) {
  const t = _ptRange(game.playTime);
  const tags = [...(game.mechanics || []), ...(game.categories || [])];
  return (typeof isCampaign === 'function' && isCampaign(game))
    || tags.some(x => /^(Campaign|Campaign \/ Legacy|Scenario \/ Mission \/ Campaign Game)$/.test(x))
    || !!(t && t[1] >= 300 && t[1] >= 6 * t[0]);
}

// BGG's time for a play with n players, in minutes.
function _ptBoxMinutes(game, n) {
  const box = _ptBoxRaw(game, n);
  return _ptIsCampaign(game) ? Math.min(box, PT_SESSION) : box;
}
function _ptBoxRaw(game, n) {
  const time = _ptRange(game.playTime) || [Math.round(15 + 20 * _ptWeight(game))];
  const t = time.length === 1 ? [time[0], time[0]] : time;
  const p = _ptRange(game.players) || [n, n];
  const share = _ptPerPlayer(game);
  // from the time at `from` players to the time at n
  const scale = (min, from) => min * Math.min(1.8, Math.max(0.5, 1 + share * (n - from) / from));
  if (t[1] > t[0] && p[1] > p[0]) {
    const m = Math.min(p[1], Math.max(p[0], n));
    const at = t[0] + (t[1] - t[0]) * (m - p[0]) / (p[1] - p[0]);
    return m === n ? at : scale(at, m);
  }
  const poll = typeof bggPlayerPoll === 'function' ? bggPlayerPoll(game.bggId) : null;
  const best = poll && poll.best.size ? [...poll.best] : null;
  const ref = best ? best.reduce((a, v) => a + v, 0) / best.length : (p[0] + p[1]) / 2;
  return scale((t[0] + t[1]) / 2, ref);
}

function _ptIsAnon(name) { return /^(anonymous|player \d+$)/i.test(name || ''); }

// One play: {min, logged, est, box, heavy, slow, replay, teach, newcomers, n, loggedRaw}
// `replay`: it's not the first play of this game that day.
function _ptEstimate(game, play, newcomers, replay) {
  const n = Math.max(1, play.sc.length);
  const w = _ptWeight(game);
  const exp = typeof isBggExpansion === 'function' && isBggExpansion(game.bggId);
  const box = _ptBoxMinutes(game, n);
  const heavy = 1 + PT_HEAVY * Math.max(0, w - 2);
  const slow = newcomers ? Math.min(PT_SLOW_MAX, 1 + PT_LEARN * (newcomers / n) * (w / 3) * (exp ? 0.5 : 1)) : 1;
  const again = replay ? PT_REPLAY : 1;
  const teach = newcomers ? (5 + 10 * Math.max(0, w - 1)) * (exp ? 1 / 3 : 1) : 0;
  const est = box * heavy * slow * again + teach;
  const loggedRaw = Number(play.d) || 0;
  const logged = loggedRaw > 0 && loggedRaw >= est * 0.4 && loggedRaw <= est * 3;
  return { min: logged ? loggedRaw : est, logged, est, box, heavy, slow, replay: !!replay, teach, newcomers, n, loggedRaw };
}

// Every play's estimate, worked out once and again whenever the plays change
// (an import adds plays or replaces them with new objects).
let _ptCache = null;
function _ptSig() {
  let games = 0, plays = 0;
  for (const id in PLAY_HISTORY) { games++; plays += PLAY_HISTORY[id].length; }
  return games + '|' + plays;
}
function _ptAll() {
  const sig = _ptSig();
  if (_ptCache && _ptCache.sig === sig) return _ptCache;
  const byPlay = new WeakMap();
  for (const id in PLAY_HISTORY) {
    const game = findGameByBggId(id) || { bggId: Number(id) };
    const seen = new Set();   // who has played it before
    let lastDate = '';
    for (const p of PLAY_HISTORY[id].slice().reverse().sort(byPlayOrder)) {
      if (!p || !Array.isArray(p.sc)) continue;
      const names = p.sc.map(s => s && s.n).filter(n => n && !_ptIsAnon(n));
      const newcomers = names.filter(n => !seen.has(n)).length;
      names.forEach(n => seen.add(n));
      byPlay.set(p, _ptEstimate(game, p, newcomers, p.date === lastDate));
      lastDate = p.date;
    }
  }
  return (_ptCache = { sig, byPlay });
}

function playTimeEstimate(play) {
  let c = _ptAll();
  if (!c.byPlay.has(play)) { _ptCache = null; c = _ptAll(); }
  return c.byPlay.get(play) || null;
}

// "5 min", "1 h 25 min", "38 h": estimates go to the nearest 5 minutes
function fmtPlayTime(min) {
  const m = Math.max(5, Math.round(min / 5) * 5);
  if (m < 60) return `${m} min`;
  if (m >= 600) return `${Math.round(m / 60).toLocaleString('en')} h`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

// What went into one play's estimate, for a tooltip.
function playTimeWhy(e) {
  if (!e) return '';
  const bits = [`BGG time at ${e.n} player${e.n !== 1 ? 's' : ''}: ${fmtPlayTime(e.box)}`];
  if (e.heavy > 1.001) bits.push(`heavy game: +${Math.round((e.heavy - 1) * 100)}%`);
  if (e.replay) bits.push(`played again that day: −${Math.round((1 - PT_REPLAY) * 100)}%`);
  if (e.newcomers) bits.push(`${e.newcomers} new to it: teaching +${fmtPlayTime(e.teach)}, slower play +${Math.round((e.slow - 1) * 100)}%`);
  if (e.logged) return `Logged in BGStats: ${e.loggedRaw} min (estimate was ${fmtPlayTime(e.est)})`;
  if (e.loggedRaw) bits.push(`logged ${e.loggedRaw} min looks off, not used`);
  return 'Estimated · ' + bits.join(' · ');
}

// ── Per person ──
// {years: [..], year: {min, plays, logged, days: Map(date → {min, plays}),
//  months: [12], games: Map(bggId → {min, plays})}, allMin, first}
function playTimeFor(name, year) {
  const c = _ptAll();
  const years = new Set();
  const out = { min: 0, plays: 0, logged: 0, days: new Map(), months: Array(12).fill(0), games: new Map() };
  let allMin = 0, allPlays = 0, first = '', prevMin = 0, prevToDate = 0;
  const today = new Date();
  const md = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (!p || !p.date || !Array.isArray(p.sc) || !p.sc.some(s => s && s.n === name)) continue;
      const e = c.byPlay.get(p);
      if (!e) continue;
      const y = Number(p.date.slice(0, 4));
      years.add(y);
      allMin += e.min; allPlays++;
      if (!first || p.date < first) first = p.date;
      if (y === year - 1) { prevMin += e.min; if (p.date.slice(5) <= md) prevToDate += e.min; }
      if (y !== year) continue;
      out.min += e.min; out.plays++;
      if (e.logged) out.logged++;
      out.months[Number(p.date.slice(5, 7)) - 1] += e.min;
      const d = out.days.get(p.date) || { min: 0, plays: 0 };
      d.min += e.min; d.plays++; out.days.set(p.date, d);
      const g = out.games.get(id) || { min: 0, plays: 0 };
      g.min += e.min; g.plays++; out.games.set(id, g);
    }
  }
  return { years: [...years].sort((a, b) => a - b), year: out, allMin, allPlays, first, prevMin, prevToDate };
}

// Per player on one game, most time first: [{name, min, plays}]
function playTimeOnGame(bggId) {
  const c = _ptAll();
  const by = new Map();
  let total = 0;
  for (const p of PLAY_HISTORY[bggId] || []) {
    const e = c.byPlay.get(p);
    if (!e) continue;
    total += e.min;
    for (const s of p.sc) {
      if (!s || !s.n || _ptIsAnon(s.n)) continue;
      const r = by.get(s.n) || { name: s.n, min: 0, plays: 0 };
      r.min += e.min; r.plays++; by.set(s.n, r);
    }
  }
  return { total, players: [...by.values()].sort((a, b) => b.min - a.min || b.plays - a.plays) };
}

function _ptViewer() {
  const raw = localStorage.getItem('bgl-player');
  return raw ? (NAME_MAP[raw] || raw) : null;
}

// ── Profile card ──
let _ptYear = null;   // the year shown (per session)

function _ptInner(playerName, year) {
  const d = playTimeFor(playerName, year);
  const y = d.year;
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const cy = new Date().getFullYear();
  const minY = d.years[0], maxY = d.years[d.years.length - 1];
  const hours = y.min / 60;
  const big = hours >= 10 ? Math.round(hours).toLocaleString('en') : (Math.round(hours * 10) / 10).toString();

  // compared with last year: up to today's date for the current year, the whole year otherwise
  let vs = '';
  const prev = year === cy ? d.prevToDate : d.prevMin;
  if (prev > 0 && y.min > 0) {
    const diff = y.min - prev;
    const up = diff >= 0;
    vs = `<span class="pt-vs ${up ? 'up' : 'down'}">${up ? '&#9650;' : '&#9660;'} ${fmtPlayTime(Math.abs(diff))} ${up ? 'more' : 'less'} than ${year === cy ? `by this time in ${year - 1}` : `in ${year - 1}`}</span>`;
  }

  const nights = y.days.size;
  const sub = [
    `${y.plays} play${y.plays !== 1 ? 's' : ''}`,
    nights ? `${nights} day${nights !== 1 ? 's' : ''} at the table` : '',
    nights ? `about ${fmtPlayTime(y.min / nights)} a day` : '',
  ].filter(Boolean).join(' &middot; ');

  // hours per month
  const maxM = Math.max(...y.months, 1);
  const nowM = year === cy ? new Date().getMonth() : 11;
  const months = y.months.map((m, i) => {
    const h = Math.round((m / maxM) * 100);
    const cls = i > nowM ? ' future' : (year === cy && i === nowM ? ' now' : '');
    const tip = `${MON[i]} ${year}: ${m ? fmtPlayTime(m) : 'nothing'}`;
    return `<div class="pt-m${cls}" title="${tip}"><div class="pt-m-bar"><i style="height:${m ? Math.max(4, h) : 0}%"></i></div><span>${MON[i][0]}</span></div>`;
  }).join('');

  // where the time went
  const games = [...y.games.entries()].sort((a, b) => b[1].min - a[1].min).slice(0, 5);
  const topMin = games.length ? games[0][1].min : 1;
  const gameRows = games.map(([id, g]) => {
    const game = findGameByBggId(id);
    const name = game ? game.name : 'Game #' + id;
    return `<button type="button" class="pt-g" data-pt-game="${id}">
        <img src="images/${id}.jpg" alt="" loading="lazy" onerror="__imgFallback(this, ${id})">
        <span class="pt-g-main"><span class="pt-g-name">${_escapeHtml(name)}</span><span class="pt-g-bar"><i style="width:${Math.max(3, Math.round((g.min / topMin) * 100))}%"></i></span></span>
        <span class="pt-g-val">${fmtPlayTime(g.min)}<small>${g.plays} play${g.plays !== 1 ? 's' : ''}</small></span>
      </button>`;
  }).join('');

  let longest = null;
  y.days.forEach((v, date) => { if (!longest || v.min > longest.min) longest = { date, ...v }; });
  const facts = [
    longest ? `<div><span>Longest day</span><b>${_fmtDateShort(longest.date)}</b> &middot; ${fmtPlayTime(longest.min)}, ${longest.plays} play${longest.plays !== 1 ? 's' : ''}</div>` : '',
    `<div><span>All time</span><b>${fmtPlayTime(d.allMin)}</b> &middot; ${d.allPlays.toLocaleString('en')} plays since ${d.first.slice(0, 4)}</div>`,
  ].join('');

  return `
    <div class="hm-head">
      <div class="stats-section-title" style="border:none;margin:0">Time at the table</div>
      <div class="hm-nav">
        <button class="hm-arrow" data-pt-prev${year <= minY ? ' disabled' : ''} aria-label="Previous year">&lsaquo;</button>
        <span class="hm-year">${year}</span>
        <button class="hm-arrow" data-pt-next${year >= maxY ? ' disabled' : ''} aria-label="Next year">&rsaquo;</button>
      </div>
    </div>
    <div class="pt-card">
      <div class="pt-hero">
        <div class="pt-big">${y.min ? big : '0'}<span>hour${big === '1' ? '' : 's'}</span></div>
        <div class="pt-hero-side">
          <div class="pt-sub">${y.plays ? sub : `No plays in ${year}.`}</div>
          ${y.min >= 1440 ? `<div class="pt-sub">That's ${(Math.round((y.min / 1440) * 10) / 10)} whole days.</div>` : ''}
          ${vs}
        </div>
      </div>
      ${y.plays ? `<div class="pt-months">${months}</div>` : ''}
      ${gameRows ? `<div class="pt-games-title">Where the time went</div><div class="pt-games">${gameRows}</div>` : ''}
      <div class="pt-facts">${facts}</div>
      <details class="pt-how">
        <summary>How is this worked out?</summary>
        <p>Each play is estimated from BGG's playing time for the number of people who played, then adjusted:</p>
        <ul>
          <li>heavier games run longer than the box says: +${Math.round(PT_HEAVY * 100)}% per weight point above 2;</li>
          <li>when someone plays a game for the first time, the rules get taught (5 min for the lightest games, about half an hour for a weight-4 game) and the game goes slower;</li>
          <li>playing the same game again the same day is ${Math.round((1 - PT_REPLAY) * 100)}% quicker: it's set up and the rules are fresh;</li>
          <li>simultaneous and real-time games barely slow down with more players;</li>
          <li>a campaign game's play is one sitting (at most ${PT_SESSION / 60} hours from the box), not the whole campaign BGG's time sometimes means;</li>
          <li>a duration logged in BGStats is used instead when it's believable${y.logged ? ` (${y.logged} of these plays)` : ''}.</li>
        </ul>
        <p>Everyone at the table gets the play's time. Boxes are optimistic and setup isn't counted, so the real time is higher.</p>
      </details>
    </div>`;
}

function buildPlayTimeHtml(playerName) {
  const d = playTimeFor(playerName, new Date().getFullYear());
  if (!d.years.length) return '';
  const cy = new Date().getFullYear();
  let year = _ptYear;
  if (year == null || !d.years.includes(year)) year = d.years.includes(cy) ? cy : d.years[d.years.length - 1];
  _ptYear = year;
  return `<div class="stats-section pt-section" id="pt-section">${_ptInner(playerName, year)}</div>`;
}

function wirePlayTime(playerName) {
  const section = document.getElementById('pt-section');
  if (!section || section.dataset.wired) return;
  section.dataset.wired = '1';
  section.addEventListener('click', (ev) => {
    const step = ev.target.closest('[data-pt-prev],[data-pt-next]');
    if (step && !step.disabled) {
      const years = playTimeFor(playerName, _ptYear).years;
      const i = years.indexOf(_ptYear) + (step.hasAttribute('data-pt-next') ? 1 : -1);
      if (years[i] != null) { _ptYear = years[i]; section.innerHTML = _ptInner(playerName, _ptYear); }
      return;
    }
    const row = ev.target.closest('[data-pt-game]');
    if (row) {
      const game = findGameByBggId(row.dataset.ptGame);
      if (game) openModal(game);
    }
  });
}

// ── Ranks → Hours ──
// Everyone's time at the table in a year, and who spends it together.
let _hrYear = null;
let _hrAll = false;   // the whole list, not just the top

function playTimeRanking(year) {
  const c = _ptAll();
  const players = new Map(), pairs = new Map(), years = new Set();
  const hidden = typeof HIDDEN_PLAYERS !== 'undefined' ? HIDDEN_PLAYERS : new Set();
  for (const id in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[id]) {
      if (!p || !p.date || !Array.isArray(p.sc)) continue;
      const y = Number(p.date.slice(0, 4));
      years.add(y);
      if (y !== year) continue;
      const e = c.byPlay.get(p);
      if (!e) continue;
      const names = [...new Set(p.sc.map(s => s && s.n).filter(n => n && !_ptIsAnon(n) && !hidden.has(n)))];
      for (const n of names) {
        const r = players.get(n) || { name: n, min: 0, plays: 0 };
        r.min += e.min; r.plays++; players.set(n, r);
      }
      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          const [a, b] = [names[i], names[j]].sort();
          const k = a + '\u0000' + b;
          const r = pairs.get(k) || { a, b, min: 0, plays: 0 };
          r.min += e.min; r.plays++; pairs.set(k, r);
        }
      }
    }
  }
  const byTime = (x, y) => y.min - x.min || y.plays - x.plays;
  return { years: [...years].sort((a, b) => a - b), players: [...players.values()].sort(byTime), pairs: [...pairs.values()].sort(byTime) };
}

function _renderHoursRankingInto(container) {
  const cy = new Date().getFullYear();
  let year = _hrYear || cy;
  let d = playTimeRanking(year);
  if (!d.players.length && d.years.length) { year = d.years[d.years.length - 1]; d = playTimeRanking(year); }
  _hrYear = year;
  const me = _ptViewer();
  const esc = s => _escapeHtml(s);
  const visit = n => ` data-visit-player="${esc(n)}"`;
  const h = min => `${Math.round(min / 60).toLocaleString('en')}<small>h</small>`;
  const minY = d.years[0], maxY = d.years[d.years.length - 1];

  const podium = d.players.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const slots = podium.length === 3 ? [1, 0, 2] : podium.length === 2 ? [1, 0] : [0];
  const podiumHtml = slots.map(i => {
    const p = podium[i];
    return `<div class="lb-podium-card rank-${i + 1}"${visit(p.name)}>
        <div class="lb-podium-medal">${medals[i]}</div>
        <div class="lb-podium-avatar">${avatarInner(p.name)}</div>
        <div class="lb-podium-name">${esc(p.name)}</div>
        <div class="lb-podium-elo hr-val">${h(p.min)}</div>
        <div class="lb-podium-meta">${p.plays} play${p.plays !== 1 ? 's' : ''}</div>
      </div>`;
  }).join('');

  const TOP = 12;
  const rest = d.players.slice(3);
  let shown = _hrAll ? rest : rest.slice(0, TOP - 3);
  const myIdx = d.players.findIndex(p => p.name === me);
  const mineHidden = myIdx >= 3 && !shown.includes(d.players[myIdx]);
  const row = (p, rank) => `<div class="lb-row${p.name === me ? ' hr-me' : ''}"${visit(p.name)}>
        <div class="lb-rank">${rank}</div>
        <div class="lb-avatar">${avatarInner(p.name)}</div>
        <div class="lb-name-block"><div class="lb-name">${esc(p.name)}</div><div class="lb-sub"><span>${p.plays} play${p.plays !== 1 ? 's' : ''}</span></div></div>
        <div class="lb-elo-block"><div class="lb-elo hr-val">${h(p.min)}</div></div>
      </div>`;
  let listHtml = shown.map((p, i) => row(p, i + 4)).join('');
  if (mineHidden) listHtml += `<div class="hr-gap">&middot;&middot;&middot;</div>` + row(d.players[myIdx], myIdx + 1);
  const moreBtn = rest.length > shown.length || _hrAll
    ? `<button type="button" class="lpm-view-all-btn" data-hr-all>${_hrAll ? 'Show fewer' : `Show all ${d.players.length} players`}</button>` : '';

  // who spends their time together: the viewer's companions, else the closest pairs
  const mine = me ? d.pairs.filter(p => p.a === me || p.b === me).slice(0, 5) : [];
  const together = mine.length
    ? { title: 'Who you spend it with', rows: mine.map(p => ({ names: [p.a === me ? p.b : p.a], min: p.min, plays: p.plays })) }
    : { title: 'Most time together', rows: d.pairs.slice(0, 5).map(p => ({ names: [p.a, p.b], min: p.min, plays: p.plays })) };
  const topTogether = together.rows.length ? together.rows[0].min : 1;
  const togetherHtml = together.rows.length ? `
      <div class="hr-together">
        <div class="stats-section-title">${together.title}</div>
        ${together.rows.map(r => `<div class="pt-p"${r.names.length === 1 ? visit(r.names[0]) : ''}>
            <span class="pt-p-name">${r.names.map(esc).join(' &amp; ')}</span>
            <span class="pt-p-bar"><i style="width:${Math.max(3, Math.round((r.min / topTogether) * 100))}%"></i></span>
            <span class="pt-p-val">${fmtPlayTime(r.min)}</span>
          </div>`).join('')}
      </div>` : '';

  container.innerHTML = `
    <div class="lb-header hr-header">
      <div class="lb-title">Hours ${year}</div>
      <div class="hm-nav">
        <button class="hm-arrow" data-hr-step="-1"${year <= minY ? ' disabled' : ''} aria-label="Previous year">&lsaquo;</button>
        <span class="hm-year">${year}</span>
        <button class="hm-arrow" data-hr-step="1"${year >= maxY ? ' disabled' : ''} aria-label="Next year">&rsaquo;</button>
      </div>
    </div>
    <div class="hr-intro">Time at the table, estimated for every play from BGG's playing time, the player count, first plays and replays. Everyone at the table gets the play's time.</div>
    ${d.players.length ? `<div class="lb-podium">${podiumHtml}</div><div class="lb-list">${listHtml}</div>${moreBtn}${togetherHtml}`
      : `<div class="lb-empty">No plays logged in ${year}.</div>`}`;

  container.querySelectorAll('[data-visit-player]').forEach(el => el.addEventListener('click', () => {
    showStatsView(el.dataset.visitPlayer, 'visiting');
    window.scrollTo(0, 0);
  }));
  container.querySelectorAll('[data-hr-step]').forEach(b => b.addEventListener('click', () => {
    if (b.disabled) return;
    const ys = d.years, i = ys.indexOf(year) + Number(b.dataset.hrStep);
    if (ys[i] != null) { _hrYear = ys[i]; _hrAll = false; _renderHoursRankingInto(container); }
  }));
  const all = container.querySelector('[data-hr-all]');
  if (all) all.addEventListener('click', () => { _hrAll = !_hrAll; _renderHoursRankingInto(container); });
}

// ── Game page ──
// A tile with the viewer's own time on this game.
function buildGameTimeTile(bggId) {
  const me = _ptViewer();
  if (!me || !PLAY_HISTORY[bggId]) return '';
  const mine = playTimeOnGame(bggId).players.find(p => p.name === me);
  if (!mine) return '';
  return `<div class="gm-tile" title="Your time at the table with this game (estimated)"><div class="gm-tile-val">${fmtPlayTime(mine.min)}</div><div class="gm-tile-label">Your time</div></div>`;
}

// Everyone's time on this game, on the Plays tab.
function buildGameTimeHtml(game, plays) {
  if (!plays || !plays.length) return '';
  const { total, players } = playTimeOnGame(game.bggId);
  if (!players.length) return '';
  const me = _ptViewer();
  const SHOW = 6;
  let list = players.slice(0, SHOW);
  const mine = players.find(p => p.name === me);
  if (mine && !list.includes(mine)) list = list.concat(mine);
  const top = players[0].min || 1;
  const rows = list.map(p => `
          <div class="pt-p${p.name === me ? ' me' : ''}">
            <span class="pt-p-name">${_escapeHtml(p.name)}</span>
            <span class="pt-p-bar"><i style="width:${Math.max(3, Math.round((p.min / top) * 100))}%"></i></span>
            <span class="pt-p-val">${fmtPlayTime(p.min)}</span>
          </div>`).join('');
  const more = players.length - list.length;
  return `
        <div class="pt-game">
          <div class="gr-title">Time at the table</div>
          <div class="pt-game-sub">About ${fmtPlayTime(total)} over ${plays.length} play${plays.length !== 1 ? 's' : ''}, ${fmtPlayTime(total / plays.length)} a play. Estimated from BGG's time, the player count and first plays.</div>
          ${rows}
          ${more > 0 ? `<div class="pt-game-more">+${more} more player${more !== 1 ? 's' : ''}</div>` : ''}
        </div>`;
}

// The time shown on one play in the game's play list.
function playTimeBadge(play) {
  const e = playTimeEstimate(play);
  if (!e) return play.d ? `<span class="play-duration">${play.d} min</span>` : '';
  const exact = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`;
  return `<span class="play-duration${e.logged ? '' : ' est'}" title="${_escapeHtml(playTimeWhy(e))}">${e.logged ? exact(e.loggedRaw) : '&asymp; ' + fmtPlayTime(e.min)}</span>`;
}
