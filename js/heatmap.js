let _heatmapYear = null; // selected year (per session); null → resolve on render

// Plays-per-day for a player in a given year, + active days and streaks.
function _heatmapData(playerName, year) {
  year = Number(year);
  const counts = {};        // 'YYYY-MM-DD' → play count
  const games = {};         // 'YYYY-MM-DD' → [game names]
  const years = new Set();  // every year the player has plays (for nav range)
  for (const bggId in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[bggId]) {
      if (!p || !p.date || !Array.isArray(p.sc)) continue;
      if (!p.sc.some(s => s && s.n === playerName)) continue;
      const py = Number(p.date.slice(0, 4));
      years.add(py);
      if (py !== year) continue;
      counts[p.date] = (counts[p.date] || 0) + 1;
      const g = findGameByBggId(bggId);
      (games[p.date] = games[p.date] || []).push((g && g.name) || ('Game #' + bggId));
    }
  }
  // streaks across the calendar year
  const dayKey = (d) => d.toISOString().slice(0, 10);
  let curDay = 0, bestDay = 0, total = 0;
  for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    if (counts[dayKey(d)]) { curDay++; if (curDay > bestDay) bestDay = curDay; } else curDay = 0;
  }
  // week streak: consecutive ISO-ish weeks (Sun-start) with ≥1 play
  let curWk = 0, bestWk = 0;
  const wkStart = new Date(Date.UTC(year, 0, 1));
  wkStart.setUTCDate(wkStart.getUTCDate() - wkStart.getUTCDay()); // back to Sunday
  for (; wkStart.getUTCFullYear() <= year; wkStart.setUTCDate(wkStart.getUTCDate() + 7)) {
    let has = false;
    for (let i = 0; i < 7; i++) {
      const d = new Date(wkStart); d.setUTCDate(d.getUTCDate() + i);
      if (d.getUTCFullYear() === year && counts[dayKey(d)]) { has = true; break; }
    }
    if (has) { curWk++; if (curWk > bestWk) bestWk = curWk; } else curWk = 0;
    if (wkStart.getUTCFullYear() === year + 1) break;
  }
  for (const k in counts) total += counts[k];
  return { counts, games, total, activeDays: Object.keys(counts).length, bestDayStreak: bestDay, bestWeekStreak: bestWk, years: Array.from(years).sort() };
}

function _heatmapLevel(n) { return !n ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4; }

// Inner HTML for one year's heatmap (grid + months + stats + legend).
function _heatmapInner(playerName, year) {
  const d = _heatmapData(playerName, year);
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayKey = (dt) => dt.toISOString().slice(0, 10);
  const start = new Date(Date.UTC(year, 0, 1)); start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const end = new Date(Date.UTC(year, 11, 31)); end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  let cells = '', monthRow = '', cols = 0, lastMonthShown = -1;
  for (let col = new Date(start); col <= end; col.setUTCDate(col.getUTCDate() + 7)) {
    cols++;
    // month label: show when a new month first appears in this week column
    let label = '';
    for (let i = 0; i < 7; i++) {
      const dd = new Date(col); dd.setUTCDate(dd.getUTCDate() + i);
      if (dd.getUTCFullYear() === year && dd.getUTCDate() <= 7 && dd.getUTCMonth() !== lastMonthShown) {
        label = MON[dd.getUTCMonth()]; lastMonthShown = dd.getUTCMonth(); break;
      }
    }
    monthRow += `<span class="hm-mon">${label}</span>`;
  }
  for (let dt = new Date(start); dt <= end; dt.setUTCDate(dt.getUTCDate() + 1)) {
    const inYear = dt.getUTCFullYear() === year;
    const key = dayKey(dt);
    const n = inYear ? (d.counts[key] || 0) : 0;
    const cls = inYear ? `hm-cell hm-l${_heatmapLevel(n)}` : 'hm-cell hm-out';
    const title = inYear ? `${n} play${n === 1 ? '' : 's'} · ${MON[dt.getUTCMonth()]} ${dt.getUTCDate()}` : '';
    cells += `<div class="${cls}"${inYear ? ` data-date="${key}" title="${title}"` : ''}></div>`;
  }

  const yrs = d.years.length ? d.years : [year];
  const minY = yrs[0], maxY = yrs[yrs.length - 1];
  const prevDis = year <= minY ? ' disabled' : '';
  const nextDis = year >= maxY ? ' disabled' : '';

  return `
    <div class="hm-head">
      <div class="stats-section-title" style="border:none;margin:0">Play Activity</div>
      <div class="hm-nav">
        <button class="hm-arrow" data-hm-prev${prevDis}>&lsaquo;</button>
        <span class="hm-year">${year}</span>
        <button class="hm-arrow" data-hm-next${nextDis}>&rsaquo;</button>
      </div>
    </div>
    <div class="hm-stats">
      <span><b>${d.total}</b> plays</span>
      <span><b>${d.activeDays}</b> active days</span>
      <span><b>${d.bestWeekStreak}</b>-week streak</span>
    </div>
    <div class="hm-body">
      <div class="hm-days"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>
      <div class="hm-scroll">
        <div class="hm-cols" style="--hm-cols:${cols}">${monthRow}</div>
        <div class="hm-grid">${cells}</div>
      </div>
    </div>
    <div class="hm-foot">
      <div class="hm-detail" id="hm-detail">${d.total ? 'Tap a day to see what you played.' : `No plays logged in ${year}.`}</div>
      <div class="hm-legend">Less ${[0,1,2,3,4].map(l => `<i class="hm-l${l}"></i>`).join('')} More</div>
    </div>`;
}

function buildPlayHeatmapHtml(playerName) {
  const data = _heatmapData(playerName, new Date().getFullYear());
  const yrs = data.years;
  if (!yrs.length) return ''; // player has no plays at all
  const cy = new Date().getFullYear();
  let year = _heatmapYear;
  if (year == null || !yrs.includes(year)) year = yrs.includes(cy) ? cy : yrs[yrs.length - 1];
  _heatmapYear = year;
  return `<div class="stats-section hm-section" id="hm-section">${_heatmapInner(playerName, year)}</div>`;
}

function _wireHeatmap(playerName) {
  const section = document.getElementById('hm-section');
  if (!section) return;
  const rerender = (year) => {
    _heatmapYear = year;
    section.innerHTML = _heatmapInner(playerName, year);
    _wireHeatmap(playerName);
  };
  const prev = section.querySelector('[data-hm-prev]');
  const next = section.querySelector('[data-hm-next]');
  if (prev && !prev.disabled) prev.addEventListener('click', () => rerender(_heatmapYear - 1));
  if (next && !next.disabled) next.addEventListener('click', () => rerender(_heatmapYear + 1));

  const detail = section.querySelector('#hm-detail');
  const data = _heatmapData(playerName, _heatmapYear);
  section.querySelectorAll('.hm-cell[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      const date = cell.dataset.date;
      const list = data.games[date];
      section.querySelectorAll('.hm-cell.sel').forEach(c => c.classList.remove('sel'));
      cell.classList.add('sel');
      if (!list || !list.length) { detail.textContent = `${_fmtDateShort(date)} — no plays.`; return; }
      const uniq = {};
      list.forEach(n => uniq[n] = (uniq[n] || 0) + 1);
      const parts = Object.keys(uniq).map(n => uniq[n] > 1 ? `${n} ×${uniq[n]}` : n);
      detail.innerHTML = `<b>${_fmtDateShort(date)}</b> — ${parts.join(', ')}`;
    });
  });
}

// ── Year in Review ("Wrapped") ──────────────────────────────────────────
// A Spotify-Wrapped-style, story-paced recap of a player's year at the table.
// Surfaces as a banner on the profile that opens a full-screen slide modal.
// Available mid-December → mid-January; force any time with the preview flag
// localStorage['bgl-wrapped-preview']='1' or the ?wrapped URL param.
