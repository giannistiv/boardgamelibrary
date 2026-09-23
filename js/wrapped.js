const WRAPPED_OWNER = 'Στιβ'; // the library owner — excluded from others' "most played with"

function _wrappedYear() {
  const d = new Date();
  return d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear();
}
function _wrappedAvailable() {
  try {
    if (localStorage.getItem('bgl-wrapped-preview') === '1') return true;
    if (location.search.indexOf('wrapped') !== -1) return true;
  } catch (_) {}
  const d = new Date(), m = d.getMonth(), day = d.getDate();
  return (m === 11 && day >= 15) || (m === 0 && day <= 18); // Dec 15 – mid-Jan
}
function _estPlayMinutes(game) {
  const t = game && game.playTime;
  if (!t) return 45;
  const nums = String(t).match(/\d+/g);
  if (!nums || !nums.length) return 45;
  const v = nums.map(Number);
  return v.length > 1 ? (v[0] + v[v.length - 1]) / 2 : v[0];
}

function computeWrapped(playerName, year) {
  year = String(year || _wrappedYear());
  const isOwner = _origCanon(playerName) === WRAPPED_OWNER || playerName === WRAPPED_OWNER;
  const DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const plays = [];
  for (const bggId in PLAY_HISTORY) {
    for (const p of PLAY_HISTORY[bggId]) {
      if (!p || !p.date || p.date.slice(0, 4) !== year || !Array.isArray(p.sc)) continue;
      const me = p.sc.find(s => s && s.n === playerName);
      if (!me) continue;
      plays.push({ bggId: Number(bggId), date: p.date, sc: p.sc, me, b: p.b, l: p.l });
    }
  }
  const totalPlays = plays.length;
  let wins = 0, minutes = 0, coop = 0, pvp = 0, solo = 0, coopWins = 0, maxTable = 0;
  let biggestTablePlay = null;
  const gameCount = {}, gameWins = {}, comp = {}, mech = {}, cat = {}, byDate = {}, byDow = {}, byMonth = {}, byLoc = {}, byDateMin = {}, designer = {};
  let wSum = 0, wN = 0, heaviest = null, lightest = null;
  let oldest = null, newest = null;
  const rivalStats = {}; // opponent → {games, myWins, theirWins}

  for (const p of plays) {
    const g = findGameByBggId(p.bggId);
    const mins = _estPlayMinutes(g);
    if (p.me.w) wins++;
    minutes += mins;
    gameCount[p.bggId] = (gameCount[p.bggId] || 0) + 1;
    gameWins[p.bggId] = (gameWins[p.bggId] || 0) + (p.me.w ? 1 : 0);
    if (g && g.complexity) { wSum += g.complexity; wN++;
      if (!heaviest || g.complexity > heaviest.complexity) heaviest = g;
      if (!lightest || g.complexity < lightest.complexity) lightest = g;
    }
    if (g && g.year && g.year > 1900) {
      if (!oldest || g.year < oldest.year) oldest = g;
      if (!newest || g.year > newest.year) newest = g;
    }
    if (g && g.designer) String(g.designer).split(',').forEach(name => {
      const dn = name.trim(); if (dn) designer[dn] = (designer[dn] || 0) + 1;
    });
    if (g && Array.isArray(g.mechanics)) g.mechanics.forEach(m => mech[m] = (mech[m] || 0) + 1);
    if (g && Array.isArray(g.categories)) g.categories.forEach(c => cat[c] = (cat[c] || 0) + 1);
    const [yy, mm, dd] = p.date.split('-').map(Number);
    byDate[p.date] = (byDate[p.date] || 0) + 1;
    byDateMin[p.date] = (byDateMin[p.date] || 0) + mins;
    byDow[new Date(yy, mm - 1, dd).getDay()] = (byDow[new Date(yy, mm - 1, dd).getDay()] || 0) + 1;
    byMonth[mm - 1] = (byMonth[mm - 1] || 0) + 1;
    if (p.l) byLoc[p.l] = (byLoc[p.l] || 0) + 1;

    const tableSize = p.sc.filter(s => s && s.n).length;
    if (tableSize > maxTable) { maxTable = tableSize; biggestTablePlay = { game: g, bggId: p.bggId, date: p.date, size: tableSize }; }
    const isSolo = p.sc.length === 1;
    if (isSolo) solo++;
    const allSame = p.sc.every(s => !!s.w === !!p.sc[0].w);
    const isCoop = !isSolo && allSame;
    if (isCoop) { coop++; if (p.me.w) coopWins++; }
    const isPvP = !isSolo && !isCoop;
    if (isPvP) pvp++;
    for (const s of p.sc) {
      if (!s || !s.n || s.n === playerName || HIDDEN_PLAYERS.has(s.n)) continue;
      const isOwnerCo = _origCanon(s.n) === WRAPPED_OWNER || s.n === WRAPPED_OWNER;
      if (!isOwner && isOwnerCo) continue; // exclude the owner from others' crew
      comp[s.n] = (comp[s.n] || 0) + 1;
      if (isPvP) {
        const r = rivalStats[s.n] || (rivalStats[s.n] = { games: 0, myWins: 0, theirWins: 0 });
        r.games++; if (p.me.w) r.myWins++; if (s.w) r.theirWins++;
      }
    }
  }

  const sortEnt = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
  const topGames = Object.keys(gameCount).map(b => ({ bggId: Number(b), count: gameCount[b], game: findGameByBggId(b) })).sort((a, b) => b.count - a.count);
  const companions = sortEnt(comp).map(([name, count]) => ({ name, count }));
  const rivals = Object.keys(rivalStats).map(n => ({ name: n, ...rivalStats[n] })).sort((a, b) => b.games - a.games);

  // first-ever play per game (all history) → which were new this year
  const firstEver = {};
  for (const bggId in PLAY_HISTORY) for (const p of PLAY_HISTORY[bggId]) {
    if (!p || !p.date || !Array.isArray(p.sc) || !p.sc.some(s => s && s.n === playerName)) continue;
    const k = Number(bggId);
    if (!(k in firstEver) || p.date < firstEver[k]) firstEver[k] = p.date;
  }
  const newToMe = Object.keys(firstEver).filter(k => firstEver[k].slice(0, 4) === year).map(Number);

  const avgWeight = wN ? wSum / wN : 0;
  const topMech = sortEnt(mech)[0] || null;
  const topCat = sortEnt(cat)[0] || null;
  const busiestDay = sortEnt(byDate)[0] || null;
  const favDow = sortEnt(byDow)[0] || null;
  const favMonth = sortEnt(byMonth)[0] || null;
  const favLoc = sortEnt(byLoc)[0] || null;
  const winRate = totalPlays ? Math.round(wins / totalPlays * 100) : 0;
  const coopRatio = totalPlays ? coop / totalPlays : 0;
  const newRatio = topGames.length ? newToMe.length / topGames.length : 0;
  const topDesigner = sortEnt(designer)[0] || null;
  const mechCount = Object.keys(mech).length;
  const marathon = sortEnt(byDateMin)[0] || null; // [date, minutes]

  // Longest consecutive-win run (over plays that had a winner), chronological.
  const chrono = plays.slice().sort((a, b) => a.date.localeCompare(b.date));
  let winStreak = 0, curStreak = 0;
  for (const p of chrono) {
    const someoneWon = p.sc.some(s => s && s.w);
    if (!someoneWon) continue;
    if (p.me.w) { curStreak++; if (curStreak > winStreak) winStreak = curStreak; }
    else curStreak = 0;
  }

  // Bogey (most-played low-win game) & specialty (most-played high-win game).
  let bogey = null, specialty = null;
  for (const bId in gameCount) {
    const c = gameCount[bId]; if (c < 5) continue;
    const wr = (gameWins[bId] || 0) / c;
    const g = findGameByBggId(bId);
    if (wr <= 0.30 && (!bogey || wr < bogey.wr || (wr === bogey.wr && c > bogey.count))) bogey = { game: g, bggId: Number(bId), count: c, wins: gameWins[bId] || 0, wr };
    if (wr >= 0.70 && (!specialty || wr > specialty.wr || (wr === specialty.wr && c > specialty.count))) specialty = { game: g, bggId: Number(bId), count: c, wins: gameWins[bId] || 0, wr };
  }

  // "Love at first play" — a game discovered this year and then played a lot.
  let loveAtFirst = null;
  for (const id of newToMe) {
    const c = gameCount[id] || 0;
    if (c >= 5 && (!loveAtFirst || c > loveAtFirst.count)) loveAtFirst = { game: findGameByBggId(id), bggId: id, count: c, firstDate: firstEver[id] };
  }

  // Plays last year (for year-over-year) and rank among players this year.
  const ly = String(Number(year) - 1);
  let lastYearPlays = 0;
  const yearCounts = {}; // every non-hidden player's plays this year (for ranking)
  for (const bggId in PLAY_HISTORY) for (const p of PLAY_HISTORY[bggId]) {
    if (!p || !p.date || !Array.isArray(p.sc)) continue;
    const yr = p.date.slice(0, 4);
    if (yr === ly && p.sc.some(s => s && s.n === playerName)) lastYearPlays++;
    if (yr === year) for (const s of p.sc) {
      if (!s || !s.n || HIDDEN_PLAYERS.has(s.n)) continue;
      yearCounts[s.n] = (yearCounts[s.n] || 0) + 1;
    }
  }
  // rank: exclude the owner from the field for everyone but the owner themselves
  const field = Object.keys(yearCounts).filter(n => isOwner || !(_origCanon(n) === WRAPPED_OWNER || n === WRAPPED_OWNER));
  field.sort((a, b) => yearCounts[b] - yearCounts[a]);
  const rankPos = field.indexOf(playerName) + 1;
  const rank = rankPos > 0 ? { pos: rankPos, of: field.length } : null;

  const firstPlay = chrono[0] ? { game: findGameByBggId(chrono[0].bggId), bggId: chrono[0].bggId, date: chrono[0].date } : null;

  let ch = null; try { ch = computeChallenges(playerName); } catch (_) {}

  const bsNames = (typeof _allBoardSouthVoterNames === 'function') ? _allBoardSouthVoterNames() : new Set();
  const isBoardSouth = bsNames.has(playerName) || (typeof playerName === 'string' && playerName.includes(' - BS'));
  const isIlioupoli = (typeof ILIOUPOLI_MEMBERS !== 'undefined') && ILIOUPOLI_MEMBERS.has(playerName);

  // gamer archetype
  const arch = (() => {
    if (totalPlays < 5) return { title: 'The Newcomer', sub: 'Your table legend is just beginning.' };
    if (coopRatio >= 0.6) return { title: 'The Team Player', sub: 'You win together — or not at all.' };
    if (avgWeight >= 3.2) return { title: 'The Heavyweight', sub: 'The crunchier the rulebook, the better.' };
    if (newRatio >= 0.5) return { title: 'The Explorer', sub: 'Always chasing the next new box.' };
    if (winRate >= 65) return { title: 'The Closer', sub: 'You came to win. And you did.' };
    if (avgWeight && avgWeight < 1.9) return { title: 'The Socialite', sub: 'Light games, loud table, big laughs.' };
    return { title: 'The All-Rounder', sub: 'A little of everything, mastered.' };
  })();

  return {
    playerName, year, isOwner, totalPlays, wins, winRate, minutes,
    hours: Math.round(minutes / 60), distinct: topGames.length,
    topGames, companions, rivals, newToMe, newCount: newToMe.length,
    avgWeight, heaviest, lightest, topMech, topCat,
    busiestDay, favDow: favDow ? { name: DOW[favDow[0]], count: favDow[1] } : null,
    favMonth: favMonth ? { name: MON[favMonth[0]], count: favMonth[1] } : null,
    favLoc: favLoc ? { name: favLoc[0], count: favLoc[1] } : null,
    coop, pvp, solo, coopWins, ch, isBoardSouth, isIlioupoli, arch,
    // newer slices
    firstPlay, loveAtFirst, winStreak, bogey, specialty,
    biggestTable: biggestTablePlay,
    marathonHours: marathon ? Math.round(marathon[1] / 60) : 0, marathonDate: marathon ? marathon[0] : null,
    lastYearPlays, rank, topDesigner, mechCount, oldest, newest
  };
}

function buildWrappedBanner(playerName) {
  if (!_wrappedAvailable()) return '';
  const d = computeWrapped(playerName);
  if (!d.totalPlays) return '';
  return `<div class="wr-banner" id="wrapped-banner" role="button" tabindex="0">
    <div class="wr-banner-spark">&#10024;</div>
    <div class="wr-banner-text">
      <div class="wr-banner-title">${d.year} Wrapped is here</div>
      <div class="wr-banner-sub">${d.totalPlays} plays. ${d.distinct} games. One unforgettable year &mdash; tap to relive it.</div>
    </div>
    <div class="wr-banner-go">&rsaquo;</div>
  </div>`;
}

function openWrappedModal(playerName, isOwnProfile) {
  const overlay = document.getElementById('wrapped-overlay');
  if (!overlay) return;
  const d = computeWrapped(playerName);
  const cover = (bggId) => `images/${bggId}.jpg`;
  // count-up number (animated from 0 when its slide becomes active)
  const cnum = (val, dec = 0) => `<span class="wr-count" data-count="${val}" data-dec="${dec}">${dec ? (0).toFixed(dec) : '0'}</span>`;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // an interactive guess slide: options carry data-correct; the prebaked
  // result reveals (with count-ups) when an option is tapped.
  const guessSlide = (kicker, question, options, revealHtml) => `
    <div class="wr-kicker">${kicker}</div>
    <div class="wr-big" style="font-size:1.5rem">${question}</div>
    <div class="wr-guess">
      ${options.map(o => `<button class="wr-guess-opt" data-correct="${o.correct ? 1 : 0}">${_escapeHtml(o.label)}</button>`).join('')}
    </div>
    <div class="wr-guess-result"><span class="wr-verdict"></span><span class="wr-fact">${revealHtml}</span><div class="wr-taphint" style="margin-top:0.6rem">tap to continue &rsaquo;</div></div>`;

  // ── Build slides ──
  const slides = [];
  const G = {
    purple: 'linear-gradient(155deg,#7928ca 0%,#b14bff 45%,#ff0080 100%)',
    sunset: 'linear-gradient(155deg,#ee0979 0%,#ff6a00 60%,#ffd200 100%)',
    teal:   'linear-gradient(155deg,#0cebeb 0%,#11998e 50%,#38ef7d 100%)',
    pink:   'linear-gradient(155deg,#fc466b 0%,#a020f0 55%,#3f5efb 100%)',
    blue:   'linear-gradient(155deg,#00c6ff 0%,#0072ff 55%,#5f2c82 100%)',
    forest: 'linear-gradient(155deg,#11998e 0%,#1f7a44 45%,#aef359 100%)',
    gold:   'linear-gradient(155deg,#f7971e 0%,#ff5e62 55%,#ffd200 100%)',
    night:  'linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#9d50bb 100%)'
  };
  const slide = (bg, body) => slides.push({ bg, body });

  slide(G.night, `
    <div class="wr-kicker">${_escapeHtml(d.year)} WRAPPED</div>
    <div class="wr-big" style="font-size:2.3rem;line-height:1.15">${_escapeHtml(d.playerName)}'s<br>Year at the Table</div>
    <div class="wr-lead">A year of dice, cards, and questionable alliances. Let's relive it.</div>
    <div class="wr-taphint">tap to begin &rsaquo;</div>`);

  slide(G.purple, `
    <div class="wr-kicker">YOU SHOWED UP</div>
    <div class="wr-num">${cnum(d.totalPlays)}</div>
    <div class="wr-label">plays logged in ${_escapeHtml(d.year)}</div>
    <div class="wr-lead">${d.totalPlays >= 200 ? "That's borderline professional." : d.totalPlays >= 80 ? "A seriously well-played year." : d.totalPlays >= 30 ? "A great year of gaming." : "Every session counts."}</div>`);

  const daysFlavor = `That's about ${Math.max(1, Math.round(d.hours / 24))} full day${Math.round(d.hours / 24) === 1 ? '' : 's'} of pure gaming${d.hours >= 100 ? " — no regrets." : "."}`;
  if (isOwnProfile && d.hours >= 20) {
    // Guess your hours
    const H = d.hours;
    const cand = Array.from(new Set([H, Math.max(5, Math.round(H * 0.45)), Math.round(H * 0.75), Math.round(H * 1.6)]));
    while (cand.length < 4) cand.push(Math.round(H * (1.2 + cand.length * 0.5)));
    const opts = shuffle(cand.slice(0, 4).map(v => ({ label: `~${v} hours`, correct: v === H })));
    slide(G.teal, guessSlide('TIME WELL SPENT', 'How many hours do you<br>think you played?', opts,
      `You spent about ${cnum(d.hours)} hours at the table. ${daysFlavor}`));
  } else {
    slide(G.teal, `
      <div class="wr-kicker">TIME WELL SPENT</div>
      <div class="wr-num">${cnum(d.hours)}</div>
      <div class="wr-label">hours around the table</div>
      <div class="wr-lead">${daysFlavor}</div>`);
  }

  slide(G.forest, `
    <div class="wr-kicker">YOUR LIBRARY</div>
    <div class="wr-num">${cnum(d.distinct)}</div>
    <div class="wr-label">different games played</div>
    <div class="wr-lead">${d.newCount} of them you tried for the very first time this year.</div>`);

  // How it began (first play of the year)
  if (d.totalPlays >= 8 && d.firstPlay) {
    slide(G.night, `
      <div class="wr-kicker">HOW IT ALL BEGAN</div>
      <div class="wr-cover-wrap"><img class="wr-cover" src="${cover(d.firstPlay.bggId)}" onerror="__imgFallback(this, ${d.firstPlay.bggId})"></div>
      <div class="wr-big" style="font-size:1.5rem">${_escapeHtml((d.firstPlay.game && d.firstPlay.game.name) || 'a game')}</div>
      <div class="wr-label">your first play of ${_escapeHtml(d.year)}, on ${_escapeHtml(_fmtDateShort(d.firstPlay.date))}</div>
      <div class="wr-lead">Little did you know what kind of year it would become.</div>`);
  }

  // You vs last year
  if (d.lastYearPlays >= 10 && d.totalPlays >= 10) {
    const diff = d.totalPlays - d.lastYearPlays;
    const pct = Math.round(Math.abs(diff) / d.lastYearPlays * 100);
    const up = diff >= 0;
    slide(G.blue, `
      <div class="wr-kicker">YOU vs LAST YEAR</div>
      <div class="wr-num">${up ? '+' : '&minus;'}${cnum(Math.abs(diff))}</div>
      <div class="wr-label">${up ? 'more' : 'fewer'} plays than ${Number(d.year) - 1} <b>(${up ? '+' : '&minus;'}${pct}%)</b></div>
      <div class="wr-lead">${up ? (pct >= 30 ? 'You seriously leveled up this year.' : 'Trending up — nicely done.') : 'Quality over quantity, clearly.'}</div>`);
  }

  // Guess slide (own profile, enough data) — guess your #1 game
  const topG = d.topGames[0];
  if (topG && d.topGames.length >= 3) {
    if (isOwnProfile) {
      const opts = shuffle([topG, ...d.topGames.slice(1, 4)].map(x => ({
        label: (x.game && x.game.name) || ('Game #' + x.bggId), correct: x.bggId === topG.bggId
      })));
      slide(G.gold, guessSlide('QUICK — GUESS', 'What did you play<br>the most this year?', opts,
        `You played <b>${_escapeHtml((topG.game && topG.game.name) || 'it')}</b> ${cnum(topG.count)} times.`));
    } else {
      slide(G.gold, `
        <div class="wr-kicker">MOST PLAYED</div>
        <div class="wr-cover-wrap"><img class="wr-cover" src="${cover(topG.bggId)}" onerror="__imgFallback(this, ${topG.bggId})"></div>
        <div class="wr-big" style="font-size:1.6rem">${_escapeHtml((topG.game && topG.game.name) || 'Game')}</div>
        <div class="wr-label">${topG.count} plays</div>`);
    }
  }

  // Top games podium
  if (d.topGames.length) {
    const top5 = d.topGames.slice(0, 5);
    slide(G.sunset, `
      <div class="wr-kicker">YOUR TOP GAMES</div>
      <div class="wr-toplist">
        ${top5.map((t, i) => `<div class="wr-toprow">
          <span class="wr-toprank">${i + 1}</span>
          <img class="wr-topcover" src="${cover(t.bggId)}" onerror="__imgFallback(this, ${t.bggId})">
          <span class="wr-topname">${_escapeHtml((t.game && t.game.name) || ('Game #' + t.bggId))}</span>
          <span class="wr-topcount">${t.count}&times;</span>
        </div>`).join('')}
      </div>`);
  }

  // Love at first play — a game discovered this year and then played a lot
  if (d.loveAtFirst) {
    const lf = d.loveAtFirst;
    slide(G.pink, `
      <div class="wr-kicker">LOVE AT FIRST PLAY</div>
      <div class="wr-cover-wrap"><img class="wr-cover" src="${cover(lf.bggId)}" onerror="__imgFallback(this, ${lf.bggId})"></div>
      <div class="wr-big" style="font-size:1.5rem">${_escapeHtml((lf.game && lf.game.name) || 'a new game')}</div>
      <div class="wr-label">discovered ${_escapeHtml(_fmtDateShort(lf.firstDate))} &middot; played ${lf.count}&times;</div>
      <div class="wr-lead">Some games you just know from the first turn.</div>`);
  }

  // Genre/decade traveler — span between oldest & newest game played
  if (d.oldest && d.newest && (d.newest.year - d.oldest.year) >= 25) {
    slide(G.forest, `
      <div class="wr-kicker">TIME TRAVELER</div>
      <div class="wr-big" style="font-size:1.6rem">${d.oldest.year} &rarr; ${d.newest.year}</div>
      <div class="wr-label">${d.newest.year - d.oldest.year} years of game design in one year of play</div>
      <div class="wr-lead">From <b>${_escapeHtml(d.oldest.name)}</b> to <b>${_escapeHtml(d.newest.name)}</b> — you play across the eras.</div>`);
  }

  // Weight class
  if (d.avgWeight) {
    const wLabel = d.avgWeight >= 3.5 ? 'Brain-Melting' : d.avgWeight >= 2.8 ? 'Heavy' : d.avgWeight >= 2.2 ? 'Medium-Heavy' : d.avgWeight >= 1.7 ? 'Medium-Light' : 'Filler-Friendly';
    slide(G.blue, `
      <div class="wr-kicker">YOUR WEIGHT CLASS</div>
      <div class="wr-num" style="font-size:3.2rem">${cnum(+d.avgWeight.toFixed(2), 2)}</div>
      <div class="wr-label">average complexity &mdash; <b>${wLabel}</b></div>
      ${d.heaviest ? `<div class="wr-lead">Your heaviest brain-burner: <b>${_escapeHtml(d.heaviest.name)}</b> (${d.heaviest.complexity}).</div>` : ''}`);
  }

  // Play style split (co-op / competitive / solo)
  if (d.totalPlays >= 10) {
    const pc = (n) => Math.round(n / d.totalPlays * 100);
    const coopP = pc(d.coop), pvpP = pc(d.pvp), soloP = pc(d.solo);
    const dominant = coopP >= pvpP && coopP >= soloP ? 'a co-op soul at heart'
      : pvpP >= coopP && pvpP >= soloP ? 'here to compete'
      : 'a master of the solo table';
    slide(G.teal, `
      <div class="wr-kicker">YOUR PLAY STYLE</div>
      <div class="wr-splitbar">
        <span style="width:${coopP}%;background:#38ef7d" title="Co-op"></span>
        <span style="width:${pvpP}%;background:#ff5e62" title="Competitive"></span>
        <span style="width:${soloP}%;background:#9d8bff" title="Solo"></span>
      </div>
      <div class="wr-splitkey">
        <span><i style="background:#38ef7d"></i>Co-op ${coopP}%</span>
        <span><i style="background:#ff5e62"></i>Competitive ${pvpP}%</span>
        <span><i style="background:#9d8bff"></i>Solo ${soloP}%</span>
      </div>
      <div class="wr-lead">You're ${dominant}.</div>`);
  }

  // Favorite mechanic
  if (d.topMech) {
    slide(G.pink, `
      <div class="wr-kicker">YOUR SIGNATURE MOVE</div>
      <div class="wr-big" style="font-size:1.9rem">${_escapeHtml(d.topMech[0])}</div>
      <div class="wr-label">your most-played mechanic</div>
      <div class="wr-lead">It showed up in ${d.topMech[1]} of your plays${d.mechCount >= 8 ? ` — across <b>${d.mechCount}</b> different mechanics in all` : ''}${d.topCat ? `. You can't resist a good <b>${_escapeHtml(d.topCat[0])}</b> game either.` : '.'}</div>`);
  }

  // Designer of the year
  if (d.topDesigner && d.topDesigner[1] >= 5) {
    slide(G.gold, `
      <div class="wr-kicker">DESIGNER OF YOUR YEAR</div>
      <div class="wr-big" style="font-size:1.8rem">${_escapeHtml(d.topDesigner[0])}</div>
      <div class="wr-label">behind ${d.topDesigner[1]} of your plays</div>
      <div class="wr-lead">When their name's on the box, you're in.</div>`);
  }

  // Crew / most played with (owner excluded for others)
  if (d.companions.length) {
    const top = d.companions.slice(0, 5);
    slide(G.purple, `
      <div class="wr-kicker">YOUR CREW</div>
      <div class="wr-big" style="font-size:1.5rem">You played most with</div>
      <div class="wr-toplist">
        ${top.map((c, i) => `<div class="wr-toprow">
          <span class="wr-toprank">${i + 1}</span>
          <span class="wr-avatar">${_escapeHtml((c.name[0] || '?').toUpperCase())}</span>
          <span class="wr-topname">${_escapeHtml(c.name)}</span>
          <span class="wr-topcount">${c.count}&times;</span>
        </div>`).join('')}
      </div>`);
  } else {
    slide(G.purple, `
      <div class="wr-kicker">LONE WOLF</div>
      <div class="wr-big" style="font-size:1.7rem">A solo year</div>
      <div class="wr-lead">Most of your battles this year were fought alone. Respect.</div>`);
  }

  // Guess your crew (own profile) — who you played with most (owner excluded)
  if (isOwnProfile && d.companions.length >= 3) {
    const topC = d.companions[0];
    const opts = shuffle(d.companions.slice(0, 4).map(c => ({ label: c.name, correct: c.name === topC.name })));
    slide(G.purple, guessSlide('ONE MORE GUESS', 'Who did you share the<br>table with most?', opts,
      `You played with <b>${_escapeHtml(topC.name)}</b> ${cnum(topC.count)} times.`));
  }

  // Biggest table
  if (d.biggestTable && d.biggestTable.size >= 5) {
    const bt = d.biggestTable;
    slide(G.sunset, `
      <div class="wr-kicker">THE FULL HOUSE</div>
      <div class="wr-num">${cnum(bt.size)}</div>
      <div class="wr-label">players at your biggest table</div>
      <div class="wr-lead">${_escapeHtml((bt.game && bt.game.name) || 'A big game')} on ${_escapeHtml(_fmtDateShort(bt.date))} — the more the merrier.</div>`);
  }

  // Rival
  const rival = d.rivals.find(r => r.games >= 3);
  if (rival) {
    const edge = rival.myWins > rival.theirWins ? `You hold the edge: <b>${rival.myWins}&ndash;${rival.theirWins}</b>.`
      : rival.myWins < rival.theirWins ? `They've got your number: <b>${rival.myWins}&ndash;${rival.theirWins}</b>. Time for revenge.`
      : `Dead even: <b>${rival.myWins}&ndash;${rival.theirWins}</b>. The rivalry continues.`;
    slide(G.sunset, `
      <div class="wr-kicker">YOUR NEMESIS</div>
      <div class="wr-big" style="font-size:1.8rem">${_escapeHtml(rival.name)}</div>
      <div class="wr-label">faced ${rival.games} times across the table</div>
      <div class="wr-lead">${edge}</div>`);
  }

  // Your specialty (most-played high-win game)
  if (d.specialty) {
    const sp = d.specialty;
    slide(G.forest, `
      <div class="wr-kicker">YOUR SPECIALTY</div>
      <div class="wr-cover-wrap"><img class="wr-cover" src="${cover(sp.bggId)}" onerror="__imgFallback(this, ${sp.bggId})"></div>
      <div class="wr-big" style="font-size:1.5rem">${_escapeHtml((sp.game && sp.game.name) || 'a game')}</div>
      <div class="wr-label">${Math.round(sp.wr * 100)}% wins over ${sp.count} plays</div>
      <div class="wr-lead">When this hits the table, you're the one to beat.</div>`);
  }

  // The one that got away (most-played low-win game)
  if (d.bogey) {
    const bg = d.bogey;
    slide(G.blue, `
      <div class="wr-kicker">THE ONE THAT GOT AWAY</div>
      <div class="wr-cover-wrap"><img class="wr-cover" src="${cover(bg.bggId)}" onerror="__imgFallback(this, ${bg.bggId})"></div>
      <div class="wr-big" style="font-size:1.5rem">${_escapeHtml((bg.game && bg.game.name) || 'a game')}</div>
      <div class="wr-label">${bg.count} plays &middot; only ${bg.wins} win${bg.wins === 1 ? '' : 's'}</div>
      <div class="wr-lead">Your white whale. ${Number(d.year) + 1} is for revenge.</div>`);
  }

  // Longest win streak
  if (d.winStreak >= 4) {
    slide(G.gold, `
      <div class="wr-kicker">ON FIRE</div>
      <div class="wr-num">${cnum(d.winStreak)}</div>
      <div class="wr-label">wins in a row &mdash; your hottest streak</div>
      <div class="wr-lead">For a while there, you simply could not lose.</div>`);
  }

  // Win rate
  slide(G.gold, `
    <div class="wr-kicker">THE SCOREBOARD</div>
    <div class="wr-num">${cnum(d.winRate)}<span style="font-size:2rem">%</span></div>
    <div class="wr-label">win rate &middot; ${d.wins} wins</div>
    <div class="wr-lead">${d.winRate >= 65 ? 'Ruthless. The table fears you.' : d.winRate >= 45 ? 'A worthy and balanced opponent.' : 'You play for the love of the game (and snacks).'}</div>`);

  // Co-op record
  if (d.coop >= 10) {
    const cwr = Math.round(d.coopWins / d.coop * 100);
    slide(G.teal, `
      <div class="wr-kicker">TEAM RECORD</div>
      <div class="wr-num">${cnum(cwr)}<span style="font-size:2rem">%</span></div>
      <div class="wr-label">co-op win rate &middot; ${d.coopWins}/${d.coop} beaten</div>
      <div class="wr-lead">${cwr >= 65 ? 'Your table tackles the toughest games and wins.' : 'The games fought back — but what a ride.'}</div>`);
  }

  // Challenges progress
  if (d.ch) {
    slide(G.teal, `
      <div class="wr-kicker">YOUR ${_escapeHtml(d.year)} QUESTS</div>
      <div class="wr-quests">
        <div class="wr-quest"><span class="wr-qnum">${d.ch.tenFilled}<span class="wr-qden">/100</span></span><span class="wr-qlbl">10&times;10</span></div>
        <div class="wr-quest"><span class="wr-qnum">${d.ch.alphaCount}<span class="wr-qden">/26</span></span><span class="wr-qlbl">Alphabet</span></div>
        <div class="wr-quest"><span class="wr-qnum">${d.ch.hi.h}</span><span class="wr-qlbl">H-Index</span></div>
      </div>
      <div class="wr-lead">${d.ch.tenComplete ? '10&times;10 complete — legendary.' : d.ch.alphaCount === 26 ? 'Full alphabet cleared!' : 'Plenty of quests still calling your name.'}</div>`);
  }

  // Busiest day
  if (d.busiestDay) {
    slide(G.blue, `
      <div class="wr-kicker">YOUR BIGGEST DAY</div>
      <div class="wr-big" style="font-size:1.7rem">${_escapeHtml(_fmtDateShort(d.busiestDay[0]))}</div>
      <div class="wr-label">${d.busiestDay[1]} games in a single day</div>
      ${d.favDow ? `<div class="wr-lead"><b>${_escapeHtml(d.favDow.name)}</b> was your power day${d.favLoc ? `, usually at <b>${_escapeHtml(d.favLoc.name)}</b>.` : '.'}</div>` : ''}`);
  }

  // Marathon day (most hours in a single day)
  if (d.marathonHours >= 5 && d.marathonDate) {
    slide(G.sunset, `
      <div class="wr-kicker">MARATHON MODE</div>
      <div class="wr-num">${cnum(d.marathonHours)}</div>
      <div class="wr-label">hours of gaming in one day</div>
      <div class="wr-lead">On ${_escapeHtml(_fmtDateShort(d.marathonDate))} you went the distance. Iron stamina.</div>`);
  }

  // Where you rank among the crew
  if (d.rank && d.totalPlays >= 10 && d.rank.of >= 3) {
    const r = d.rank;
    const sup = r.pos === 1 ? '' : r.pos === 2 ? 'nd' : r.pos === 3 ? 'rd' : 'th';
    const num = r.pos === 1 ? '#1' : r.pos + sup;
    slide(G.night, `
      <div class="wr-kicker">LEADERBOARD</div>
      <div class="wr-num" style="font-size:4.2rem">${num}</div>
      <div class="wr-label">most active player of ${_escapeHtml(d.year)}${d.isOwner ? '' : ' (of the crew)'}</div>
      <div class="wr-lead">${r.pos === 1 ? 'Nobody logged more games than you. The MVP.' : `Out of ${r.of} players — a serious presence at the table.`}</div>`);
  }

  // Special badges
  if (d.isBoardSouth) {
    slide(G.forest, `
      <div class="wr-badge">&#9876;</div>
      <div class="wr-kicker">BOARD SOUTH REGULAR</div>
      <div class="wr-big" style="font-size:1.7rem">A true Souther</div>
      <div class="wr-lead">You're part of the Board South crew that keeps the table alive.</div>`);
  }
  if (d.isIlioupoli) {
    slide(G.night, `
      <div class="wr-badge">&#127968;</div>
      <div class="wr-kicker">ILIOUPOLI BROS</div>
      <div class="wr-big" style="font-size:1.7rem">Inner circle</div>
      <div class="wr-lead">One of the Ilioupoli Bros — the games hit different at home.</div>`);
  }
  const duo = d.companions[0];
  if (duo && duo.count >= 40) {
    slide(G.pink, `
      <div class="wr-badge">&#129309;</div>
      <div class="wr-kicker">DYNAMIC DUO</div>
      <div class="wr-big" style="font-size:1.6rem">You &amp; ${_escapeHtml(duo.name)}</div>
      <div class="wr-label">${duo.count} games together this year</div>
      <div class="wr-lead">Some partnerships are just meant to be.</div>`);
  }

  // Finale + archetype + download
  slide(G.purple, `
    <div class="wr-kicker">YOUR ${_escapeHtml(d.year)} PERSONA</div>
    <div class="wr-big" style="font-size:2.1rem;background:linear-gradient(90deg,#ffd86b,#ff9ec7);-webkit-background-clip:text;background-clip:text;color:transparent">${_escapeHtml(d.arch.title)}</div>
    <div class="wr-lead">${_escapeHtml(d.arch.sub)}</div>
    <div class="wr-finale-stats">
      <span>${d.totalPlays} plays</span><span>${d.distinct} games</span><span>${d.hours}h</span><span>${d.winRate}% wins</span>
    </div>
    <button class="wr-download" id="wr-download">&#11015; Download your card</button>
    <div class="wr-taphint" id="wr-replay">tap to close &times;</div>`);

  // ── Render ──
  let idx = 0;
  const bars = slides.map((_, i) => `<div class="wr-bar" data-i="${i}"><span></span></div>`).join('');
  overlay.innerHTML = `
    <div class="wr-modal">
      <div class="wr-bars">${bars}</div>
      <button class="wr-close" id="wr-close" aria-label="Close">&times;</button>
      <div class="wr-stage" id="wr-stage">
        ${slides.map((s, i) => `<div class="wr-slide" data-idx="${i}" style="background:${s.bg}"><div class="wr-slide-inner">${s.body}</div></div>`).join('')}
      </div>
      <div class="wr-nav wr-nav-prev" id="wr-prev"></div>
      <div class="wr-nav wr-nav-next" id="wr-next"></div>
    </div>`;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const slideEls = Array.from(overlay.querySelectorAll('.wr-slide'));
  const barEls = Array.from(overlay.querySelectorAll('.wr-bar'));
  const isFinale = (i) => i === slides.length - 1;
  const show = (n) => {
    idx = Math.max(0, Math.min(slides.length - 1, n));
    slideEls.forEach((el, i) => el.classList.toggle('active', i === idx));
    barEls.forEach((el, i) => el.classList.toggle('seen', i <= idx));
    const cur = slideEls[idx];
    cur.querySelectorAll('.wr-count').forEach(_wrCountUp);
    if (isFinale(idx)) _wrConfetti(cur);
  };
  show(0);

  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    overlay.innerHTML = '';
    if (overlay._wrKey) { document.removeEventListener('keydown', overlay._wrKey); overlay._wrKey = null; }
  };
  const next = () => { if (idx >= slides.length - 1) { close(); } else { show(idx + 1); } };
  const prev = () => show(idx - 1);

  overlay.querySelector('#wr-next').addEventListener('click', next);
  overlay.querySelector('#wr-prev').addEventListener('click', prev);
  overlay.querySelector('#wr-close').addEventListener('click', (e) => { e.stopPropagation(); close(); });

  // Guess interactions (any number of guess slides). Each reveals its own
  // prebaked result with count-ups; a correct answer fires confetti.
  overlay.querySelectorAll('.wr-guess').forEach(gw => {
    gw.querySelectorAll('.wr-guess-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (gw.dataset.done) return;
        gw.dataset.done = '1';
        const correct = btn.dataset.correct === '1';
        gw.querySelectorAll('.wr-guess-opt').forEach(b => {
          b.classList.add('locked');
          if (b.dataset.correct === '1') b.classList.add('right');
          else if (b === btn) b.classList.add('wrong');
        });
        const res = gw.parentElement.querySelector('.wr-guess-result');
        if (res) {
          const v = res.querySelector('.wr-verdict');
          if (v) v.innerHTML = correct ? '&#127881; Nailed it! ' : 'Not quite! ';
          res.classList.add('show');
          res.querySelectorAll('.wr-count').forEach(_wrCountUp);
        }
        if (correct) _wrConfetti(gw.closest('.wr-slide'));
      });
    });
  });

  // Download
  const dl = overlay.querySelector('#wr-download');
  if (dl) dl.addEventListener('click', (e) => { e.stopPropagation(); _downloadWrapped(d); });

  // Keyboard
  overlay._wrKey = (e) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  };
  document.addEventListener('keydown', overlay._wrKey);
}

// Animate a number from 0 → its data-count when its slide appears.
function _wrCountUp(el) {
  const target = parseFloat(el.dataset.count) || 0;
  const dec = parseInt(el.dataset.dec, 10) || 0;
  const fmt = (v) => dec ? v.toFixed(dec) : Math.round(v).toLocaleString();
  if (target === 0) { el.textContent = fmt(0); return; }
  const dur = 900, start = performance.now();
  const step = (t) => {
    let p = Math.min(1, (t - start) / dur);
    p = 1 - Math.pow(1 - p, 3); // ease-out cubic
    el.textContent = fmt(target * p);
    if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
  };
  requestAnimationFrame(step);
}

// A short, lightweight confetti burst inside a slide.
function _wrConfetti(slideEl) {
  if (!slideEl || slideEl._confettied) return;
  slideEl._confettied = true;
  const colors = ['#ffd86b', '#ff7ab6', '#5bd6c0', '#9d8bff', '#ff9e6b', '#7af0c0'];
  const layer = document.createElement('div');
  layer.className = 'wr-confetti';
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(p);
  }
  slideEl.appendChild(layer);
  setTimeout(() => { if (layer.parentNode) layer.remove(); }, 3600);
}

// Render the year's highlights to a shareable PNG (story size). Same-origin
// covers draw without tainting the canvas, so toBlob works.
async function _downloadWrapped(d) {
  try {
    const W = 1080, H = 1920;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#3a1c71'); grad.addColorStop(0.55, '#6a2c9c'); grad.addColorStop(1, '#b34bd4');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    ctx.font = '700 56px sans-serif'; ctx.fillText(`${d.year} WRAPPED`, W / 2, 150);
    ctx.font = '800 84px sans-serif'; ctx.fillText(d.playerName, W / 2, 250);

    const loadImg = (src) => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
    const top3 = d.topGames.slice(0, 3);
    const imgs = await Promise.all(top3.map(t => loadImg(`images/${t.bggId}.jpg`)));
    const cw = 240, gap = 60, startX = (W - (cw * 3 + gap * 2)) / 2, y = 360;
    top3.forEach((t, i) => {
      const x = startX + i * (cw + gap);
      ctx.save();
      if (imgs[i]) ctx.drawImage(imgs[i], x, y, cw, cw * 1.3);
      else { ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y, cw, cw * 1.3); }
      ctx.restore();
      ctx.fillStyle = '#ffd86b'; ctx.font = '700 40px sans-serif';
      ctx.fillText(`${t.count}×`, x + cw / 2, y + cw * 1.3 + 50);
    });

    const stats = [[d.totalPlays, 'PLAYS'], [d.distinct, 'GAMES'], [d.hours + 'h', 'PLAYED'], [d.winRate + '%', 'WINS']];
    const sy = 1080;
    stats.forEach((s, i) => {
      const x = (i % 2 === 0) ? W * 0.3 : W * 0.7;
      const yy = sy + Math.floor(i / 2) * 230;
      ctx.fillStyle = '#fff'; ctx.font = '800 110px sans-serif'; ctx.fillText(String(s[0]), x, yy);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '600 38px sans-serif'; ctx.fillText(s[1], x, yy + 56);
    });

    ctx.fillStyle = '#ffd86b'; ctx.font = '800 76px sans-serif'; ctx.fillText(d.arch.title, W / 2, 1640);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '400 38px sans-serif'; ctx.fillText(d.arch.sub, W / 2, 1700);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '600 34px sans-serif'; ctx.fillText('Board Game Library', W / 2, 1850);

    cv.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${d.playerName}-wrapped-${d.year}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png');
  } catch (e) { console.warn('Wrapped download failed:', e); }
}

// ── Ilioupoli Bros — Δημητρης's private library shelf ──
// Tab visible only to these players.
