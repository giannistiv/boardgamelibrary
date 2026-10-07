// ── Leviathan Wilds: the leviathans you've healed (game page, Plays tab) ──
// The campaign goes through the book in order and every win heals the next
// leviathan, so a player's wins, oldest first, are leviathans 1, 2, 3… A
// carousel opens on the last one you healed, in colour; slide on to the ones
// still ahead, shown as black silhouettes until you heal them. It's always
// the viewer's own journey: someone who hasn't played yet sees the first
// leviathan waiting in shadow.
// The art is the publisher's own: each leviathan's book spread from Moon Crab
// Games' Tabletop Simulator edition, in images/leviathans/<name>.jpg, with a
// <name>-shadow.jpg silhouette cut out of it. The Tyrant, the finale, was
// never released outside the box, so it stays a question mark.

const LW_BGGID = 358737;
const LW_LEVIATHANS = ['Sage', 'Sentinel', 'Storm', 'Watcher', 'Weaver', 'Avalanche', 'Hive', 'Collector', 'Fury',
  'Bloom', 'Forsaken', 'Tunneler', 'Twins', 'Vortex', 'Hunger', 'Deep', 'Tyrant'];
const LW_NO_ART = new Set(['Tyrant']);

// A player's journey: each won play heals the next leviathan.
function _lwJourney(plays, name) {
  const mine = plays.filter(p => (p.sc || []).some(s => s && s.n === name)).slice().sort(byPlayOrder);
  const healed = [];
  let tries = 0;
  for (const p of mine) {
    tries++;
    if (!(p.sc.find(s => s.n === name) || {}).w) continue;
    if (healed.length < LW_LEVIATHANS.length) {
      healed.push({ date: p.date, tries, with: p.sc.filter(s => s && s.n !== name).map(s => s.n) });
    }
    tries = 0;
  }
  return { name, healed, tries, plays: mine.length };
}

function buildLeviathanWildsHtml(game, plays) {
  if (Number(game && game.bggId) !== LW_BGGID) return '';
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  const j = _lwJourney(plays || [], me || '');
  const esc = _escapeHtml;
  const done = j.healed.length;
  const fmt = (d) => {
    const [y, m, day] = d.split('-').map(Number);
    return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${day}, ${y}`;
  };
  const nth = (t) => (t === 1 ? 'first try' : t === 2 ? 'second try' : t === 3 ? 'third try' : `try ${t}`);
  const slides = LW_LEVIATHANS.map((name, i) => {
    const h = j.healed[i];
    const next = i === done;
    const slug = name.toLowerCase();
    const art = LW_NO_ART.has(name)
      ? `<div class="lw-mystery">?</div>`
      : `<img src="images/leviathans/${slug}${h ? '' : '-shadow'}.jpg" alt="${h ? esc(name) : ''}" loading="lazy" decoding="async">`;
    const sub = h
      ? `<div class="lw-sub healed">Healed ${fmt(h.date)} &middot; ${nth(h.tries)}${h.with.length ? ` &middot; with ${h.with.map(esc).join(', ')}` : ''}</div>`
      : next
        ? `<div class="lw-sub next">Next up${j.tries ? ` &middot; ${j.tries} tr${j.tries === 1 ? 'y' : 'ies'} so far` : ''}</div>`
        : `<div class="lw-sub">${i === LW_LEVIATHANS.length - 1 ? 'The last leviathan' : 'Still ahead'}</div>`;
    return `<div class="lw-slide${h ? ' healed' : ''}" data-lw="${i}">
        <div class="lw-art">${art}${next ? '<span class="lw-flag">Next up</span>' : ''}</div>
        <div class="lw-cap"><div class="lw-name"><small>#${i + 1}</small>${esc(name)}</div>${sub}</div>
      </div>`;
  }).join('');
  const pips = LW_LEVIATHANS.map((name, i) =>
    `<button type="button" class="lw-pip${i < done ? ' healed' : ''}${i === done ? ' next' : ''}" data-lw-go="${i}" aria-label="${i + 1}. ${esc(name)}">${i + 1}</button>`).join('');
  return `<div class="lw-board" data-lw-start="${Math.max(0, done - 1)}">
      <div class="st-head"><span class="st-title">&#128009; Leviathans</span><span class="pb-count">${done === LW_LEVIATHANS.length ? 'All healed' : `${done} / ${LW_LEVIATHANS.length} healed`}</span></div>
      <div class="lw-stage">
        <div class="lw-track">${slides}</div>
        <button type="button" class="lw-arrow prev" data-lw-step="-1" aria-label="Previous leviathan">&lsaquo;</button>
        <button type="button" class="lw-arrow next" data-lw-step="1" aria-label="Next leviathan">&rsaquo;</button>
      </div>
      <div class="lw-pips">${pips}</div>
    </div>`;
}

function wireLeviathanWilds(root) {
  const board = root && root.querySelector('.lw-board');
  if (!board) return;
  const track = board.querySelector('.lw-track');
  const slides = [...track.children];
  const at = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  const go = (i, smooth) => {
    const s = slides[Math.max(0, Math.min(slides.length - 1, i))];
    track.scrollTo({ left: s.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
  };
  const mark = () => {
    const i = at();
    board.querySelectorAll('.lw-pip').forEach((p, k) => p.classList.toggle('cur', k === i));
    board.querySelector('.lw-arrow.prev').disabled = i <= 0;
    board.querySelector('.lw-arrow.next').disabled = i >= slides.length - 1;
  };
  track.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
  board.querySelectorAll('[data-lw-step]').forEach(b => b.addEventListener('click', () => go(at() + Number(b.dataset.lwStep), true)));
  board.querySelectorAll('[data-lw-go]').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.lwGo), true)));
  // open on the last one healed (the panel may still be hidden: wait until it has a width)
  const start = Number(board.dataset.lwStart) || 0;
  const open = () => {
    if (!track.clientWidth) return false;
    go(start, false); mark();
    return true;
  };
  if (!open()) {
    const ro = new ResizeObserver(() => { if (open()) ro.disconnect(); });
    ro.observe(track);
  }
}
