// ── Game page insights (Plays tab) ──
// Characters: how each role logged in BGStats (a character, hero, spirit,
// faction…) has done, and your favourite and best. Your scores: your score
// in the game play by play, and whether you're getting better.

// "Leadership／Hawkeye" (an aspect and a hero) counts for both.
function _giRoleTags(r) { return String(r || '').split('／').map(x => x.trim()).filter(Boolean); }

function buildRolesHtml(game, plays) {
  if (!plays || plays.length < 3) return '';
  const noResult = isNoResultGame(game.bggId);
  const me = _ptViewer();
  const tags = new Map();   // role → {name, plays, wins, mine, myWins}
  let withRoles = 0;
  for (const p of plays) {
    let any = false;
    for (const s of p.sc) {
      if (!s) continue;
      for (const t of _giRoleTags(s.r)) {
        any = true;
        const r = tags.get(t) || { name: t, plays: 0, wins: 0, mine: 0, myWins: 0 };
        r.plays++;
        if (s.w) r.wins++;
        if (s.n === me) { r.mine++; if (s.w) r.myWins++; }
        tags.set(t, r);
      }
    }
    if (any) withRoles++;
  }
  if (withRoles < 3 || tags.size < 2) return '';
  const list = [...tags.values()].sort((a, b) => b.plays - a.plays || b.wins - a.wins);
  const pct = (w, n) => Math.round((w / n) * 100);
  const esc = _escapeHtml;

  // your favourite (most played) and your best (highest win rate, 3+ plays)
  const mine = list.filter(r => r.mine > 0);
  const fav = mine.slice().sort((a, b) => b.mine - a.mine)[0];
  const best = noResult ? null : mine.filter(r => r.mine >= 3 && r.myWins > 0)
    .sort((a, b) => b.myWins / b.mine - a.myWins / a.mine || b.mine - a.mine)[0];
  let yours = '';
  if (fav && fav.mine >= 2) {
    yours = best && best !== fav
      ? `Your favourite: <b>${esc(fav.name)}</b> (${fav.mine} plays) &middot; your best: <b>${esc(best.name)}</b> (${pct(best.myWins, best.mine)}% won)`
      : `Your favourite${best ? ' and your best' : ''}: <b>${esc(fav.name)}</b> (${fav.mine} plays${best ? `, ${pct(best.myWins, best.mine)}% won` : ''})`;
  }

  const SHOW = 8;
  const top = list[0].plays;
  const rows = list.slice(0, SHOW).map(r => `
          <div class="pt-p${r.mine ? ' mine' : ''}" title="${esc(r.name)}: ${r.plays} play${r.plays !== 1 ? 's' : ''}${noResult ? '' : `, ${r.wins} won`}${r.mine ? ` · you: ${r.mine}` : ''}">
            <span class="pt-p-name">${esc(r.name)}</span>
            <span class="pt-p-bar"><i style="width:${Math.max(3, Math.round((r.plays / top) * 100))}%"></i></span>
            <span class="pt-p-val">${r.plays}${noResult ? '' : `<small> &middot; ${pct(r.wins, r.plays)}%</small>`}</span>
          </div>`).join('');
  const more = list.length - SHOW;
  return `
        <div class="gi-block">
          <div class="gr-title">Characters</div>
          <div class="gi-sub">${list.length} logged over ${withRoles} play${withRoles !== 1 ? 's' : ''}${noResult ? '' : ', with how often each won'}.</div>
          ${yours ? `<div class="gi-yours">${yours}</div>` : ''}
          ${rows}
          ${more > 0 ? `<div class="pt-game-more">+${more} more</div>` : ''}
        </div>`;
}

// Your scores in this game, oldest to newest, and the trend.
function buildScoreTrendHtml(game, plays) {
  const me = _ptViewer();
  if (!me || !plays || plays.length < 4) return '';
  const asc = plays.slice().reverse().sort(byPlayOrder);
  const pts = [];
  for (const p of asc) {
    const s = p.sc.find(x => x && x.n === me);
    if (!s) continue;
    const v = _recScore(s.s);
    if (v !== null) pts.push({ v, w: !!s.w, date: p.date });
  }
  if (pts.length < 4 || pts.every(x => x.v === 0)) return '';   // all zeros: no score kept
  const low = _recLowBest(asc, _recIsCoop(game, plays));
  const better = (a, b) => (low ? a < b : a > b);
  const avgOf = xs => xs.reduce((a, x) => a + x.v, 0) / xs.length;
  const num = n => _recNum(Math.round(n * 10) / 10);

  // the chart: the last 40 plays, better always up
  const shown = pts.slice(-40);
  const vals = shown.map(x => x.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const W = 300, H = 90, P = 7;
  const x = i => (shown.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (shown.length - 1));
  const y = v => { const f = (v - lo) / (hi - lo); return P + (low ? f : 1 - f) * (H - 2 * P); };
  const all = avgOf(pts);
  const line = shown.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const dots = shown.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="3.4" class="${p.w ? 'w' : 'l'}"><title>${_fmtDateShort(p.date)}: ${num(p.v)}${p.w ? ' (won)' : ''}</title></circle>`).join('');
  const avgY = y(all).toFixed(1);

  let best = pts[0];
  for (const p of pts) if (better(p.v, best.v)) best = p;

  // trend: the last five against everything before them
  let trend = '';
  if (pts.length >= 8) {
    const recent = avgOf(pts.slice(-5)), before = avgOf(pts.slice(0, -5));
    const gain = low ? before - recent : recent - before;
    const step = Math.max(1, Math.abs(before) * 0.06);
    trend = gain >= step
      ? `<span class="gi-trend up">&#9650; Getting better</span> your last 5 average ${num(recent)}, ${low ? 'down' : 'up'} from ${num(before)}`
      : gain <= -step
        ? `<span class="gi-trend down">&#9660; Slipping</span> your last 5 average ${num(recent)}, ${low ? 'up' : 'down'} from ${num(before)}`
        : `<span class="gi-trend">Steady</span> your last 5 average ${num(recent)}, much like before (${num(before)})`;
  }

  return `
        <div class="gi-block">
          <div class="gr-title">Your scores</div>
          <div class="gi-sub">${pts.length} scored play${pts.length !== 1 ? 's' : ''}${pts.length > shown.length ? `, the last ${shown.length} shown` : ''}${low ? '. Lowest wins here, so lower sits higher' : ''}. Filled dots are wins.</div>
          <svg class="gi-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Your scores over time">
            <line x1="${P}" x2="${W - P}" y1="${avgY}" y2="${avgY}" class="avg"/>
            <polyline points="${line}"/>
            ${dots}
          </svg>
          <div class="gi-stats">
            <span>Best <b>${num(best.v)}</b> <small>${_fmtDateShort(best.date)}</small></span>
            <span>Average <b>${num(all)}</b></span>
          </div>
          ${trend ? `<div class="gi-trend-line">${trend}</div>` : ''}
        </div>`;
}
