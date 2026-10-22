// ── What a just-logged play did (Log a play) ──
// Checked against the game's other plays the moment one is saved: a new
// group record score or a personal best, a first win at the game, a winning
// streak, the furthest mission yet (or the whole campaign), someone's 10th,
// 25th… play of it or 500th play overall (js/moments.js), or the first play
// of it in a long while. The save message shows them, and the notification
// the others get carries the first one; both name the game already, so the
// lines don't.

function playMoments(bggId, entry) {
  const plays = ((typeof PLAY_HISTORY !== 'undefined' && PLAY_HISTORY[bggId]) || []).filter(p => p && Array.isArray(p.sc));
  if (!entry || !plays.includes(entry)) return [];   // a BGStats copy stands in for it: it's not new
  const game = (typeof findGameByBggId === 'function' && findGameByBggId(bggId)) || {};
  const order = plays.slice().sort(byPlayOrder);
  const before = order.slice(0, order.indexOf(entry));
  const real = (n) => !!n && !_recIsAnon(n) && !(typeof HIDDEN_PLAYERS !== 'undefined' && HIDDEN_PLAYERS.has(n));
  const names = (list) => (list.length <= 2 ? list.join(' and ') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`);
  const coop = _recIsCoop(game, plays);
  const out = [];

  // scores: a record for the game, or someone's best
  if (!coop) {
    const low = _recLowBest(plays, coop);
    const better = (a, b) => (low ? a < b : a > b);
    const scores = (ps) => ps.flatMap(p => p.sc.filter(s => real(s.n)).map(s => ({ n: s.n, v: _recScore(s.s) })).filter(x => x.v != null));
    const prev = scores(before), now = scores([entry]);
    if (now.length && prev.length >= REC_MIN_PLAYS) {
      const pick = (xs) => xs.reduce((b, x) => (!b || better(x.v, b.v) ? x : b), null);
      const was = pick(prev), top = pick(now);
      if (better(top.v, was.v)) out.push({ icon: '🏆', text: `New record: ${top.n}, ${_recNum(top.v)} (was ${_recNum(was.v)} by ${was.n})` });
      for (const x of now) {
        if (out.length && x === top) continue;
        const mine = prev.filter(y => y.n === x.n);
        if (mine.length >= 2 && mine.every(y => better(x.v, y.v))) out.push({ icon: '⭐', text: `Personal best for ${x.n}: ${_recNum(x.v)}` });
      }
    }
  }

  // a numbered campaign: the furthest mission won yet, or the last one
  const cfg = typeof scenarioPicker === 'function' ? scenarioPicker(bggId) : null;
  const won = entry.sc.some(s => s.w);
  const numOf = (p) => { const m = String(p.b || '').match(/(?:mission|scenario|campaign|chapter|adventure|case|episode|quest|year)\s*0*(\d+)/i); return m ? Number(m[1]) : 0; };
  if (cfg && cfg.numbered && won && numOf(entry)) {
    const n = numOf(entry);
    const table = new Set(entry.sc.map(s => s.n));
    const furthest = Math.max(0, ...before.filter(p => p.sc.some(s => s.w) && p.sc.some(s => table.has(s.n))).map(numOf));
    const total = typeof SCEN_NUMBERED !== 'undefined' && SCEN_NUMBERED[bggId] ? SCEN_NUMBERED[bggId][1] : 0;
    const word = cfg.fields[0].label;
    if (total && n === total && furthest < total) out.push({ icon: '🎉', text: `Campaign finished: all ${total} ${word.toLowerCase()}s won` });
    else if (furthest && n > furthest) out.push({ icon: '🚩', text: `${word} ${n} won, the furthest yet` });
  }

  // a first win at the game, after playing it before
  const winners = entry.sc.filter(s => s.w && real(s.n)).map(s => s.n);
  const firsts = winners.filter(n => {
    const theirs = before.filter(p => p.sc.some(s => s.n === n));
    return theirs.length >= 1 && !theirs.some(p => p.sc.some(s => s.n === n && s.w));
  });
  if (firsts.length) out.push({ icon: '🥇', text: `First-ever win for ${names(firsts)}` });

  // winning streaks at the game: 3 or more in a row (the plays they were in)
  const streaks = {};
  for (const n of winners) {
    let k = 0;
    for (let i = order.indexOf(entry); i >= 0; i--) {
      const s = order[i].sc.find(x => x.n === n);
      if (!s) continue;
      if (s.w) k++; else break;
    }
    if (k >= 3) (streaks[k] = streaks[k] || []).push(n);
  }
  for (const k of Object.keys(streaks).sort((a, b) => b - a)) out.push({ icon: '🔥', text: `${names(streaks[k])}: ${k} wins in a row` });

  // play counts: the 10th, 25th… of the game, the 500th overall
  if (typeof playerMilestones === 'function') {
    const byKind = {};
    for (const s of entry.sc) {
      if (!real(s.n)) continue;
      for (const h of playerMilestones(s.n).byPlay.get(entry) || []) {
        if (h.kind === 'first') continue;
        const key = h.kind === 'all' ? `${_ordinal(h.n)} play of any game` : `${_ordinal(h.n)} play of this one`;
        (byKind[key] = byKind[key] || []).push(s.n);
      }
    }
    for (const key in byKind) out.push({ icon: '🎯', text: `${names(byKind[key])}: ${key}` });
  }

  // back to it after a long while
  const last = before.length ? before[before.length - 1].date : null;
  if (last && entry.date) {
    const days = Math.round((Date.parse(entry.date) - Date.parse(last)) / 86400000);
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const when = new Date(last + 'T12:00:00').toLocaleDateString('en', { month: 'short', year: 'numeric' });
      out.push({ icon: '🕰', text: `Back after ${years > 1 ? `${years} years` : 'over a year'} (last played ${when})` });
    }
  }
  return out.slice(0, 3);
}
