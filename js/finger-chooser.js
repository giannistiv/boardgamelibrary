// ── Tonight → Who goes first? ──
// A finger chooser: everyone puts a finger on the phone, and once the fingers
// have stayed put for a couple of seconds one of them is picked. Lift every
// finger to go again. On a computer, click to drop a marker for each player
// (click one to take it away). Back, ✕ or Escape closes it.

const FC_COLORS = ['#e8b04b', '#5bc46b', '#4fa3e3', '#e0613a', '#b07cff', '#ff7eb6', '#3fd0c9', '#f2e35b', '#c9c2b8', '#ff9f43'];
const FC_WAIT = 2200;   // how long the fingers must stay put, ms

function openFingerChooser() {
  let ov = document.getElementById('fc-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'fc-overlay';
    ov.className = 'fc-overlay';
    document.body.appendChild(ov);
  }
  const touch = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  ov.innerHTML = `<button type="button" class="fc-x" aria-label="Close">&times;</button>
    <div class="fc-hint" aria-live="polite"><b>Who goes first?</b><span></span></div>`;
  const head = ov.querySelector('.fc-hint b');
  const say = ov.querySelector('.fc-hint span');
  const dots = new Map();   // pointer id (or a marker's id) → {el, color}
  let timer = null, picked = null, used = 0, markers = 0;

  const hint = () => {
    say.textContent = picked ? (touch ? 'Lift every finger to go again' : 'Click anywhere to go again')
      : dots.size === 0 ? (touch ? 'Everyone put a finger on the screen' : 'Click once for each player')
      : dots.size === 1 ? 'Waiting for more players…'
      : 'Hold still…';
    head.textContent = picked ? 'You go first!' : 'Who goes first?';
    ov.classList.toggle('fc-done', !!picked);
  };
  const place = (d, x, y) => { d.el.style.left = `${x}px`; d.el.style.top = `${y}px`; };
  const add = (id, x, y) => {
    const color = FC_COLORS[used++ % FC_COLORS.length];
    const el = document.createElement('div');
    el.className = 'fc-dot';
    el.style.setProperty('--c', color);
    el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" pathLength="1"/></svg>';
    ov.appendChild(el);
    const d = { el, color };
    place(d, x, y);
    dots.set(id, d);
  };
  const remove = (id) => {
    const d = dots.get(id);
    if (!d) return;
    d.el.remove();
    dots.delete(id);
  };
  const reset = () => {
    clearTimeout(timer);
    for (const id of [...dots.keys()]) remove(id);
    picked = null;
    used = 0;
    ov.style.removeProperty('--win');
    hint();
  };
  // any change starts the wait again; with two or more, one is picked at the end of it
  const restart = () => {
    clearTimeout(timer);
    for (const d of dots.values()) {
      d.el.classList.remove('fc-wait');
      void d.el.offsetWidth;   // restart the ring's animation
    }
    if (dots.size >= 2) {
      for (const d of dots.values()) d.el.classList.add('fc-wait');
      timer = setTimeout(pick, FC_WAIT);
    }
    hint();
  };
  const pick = () => {
    const ids = [...dots.keys()];
    if (ids.length < 2) return;
    picked = ids[Math.floor(Math.random() * ids.length)];
    for (const [id, d] of dots) {
      d.el.classList.remove('fc-wait');
      d.el.classList.add(id === picked ? 'fc-win' : 'fc-lose');
    }
    ov.style.setProperty('--win', dots.get(picked).color);
    try { if (navigator.vibrate) navigator.vibrate(120); } catch (_) {}
    hint();
  };

  ov.onpointerdown = (e) => {
    if (e.target.closest('.fc-x')) return;
    e.preventDefault();
    if (e.pointerType === 'mouse') {
      // a computer: each click drops a marker, clicking one takes it away
      if (picked) { reset(); return; }
      const hit = e.target.closest('.fc-dot');
      const id = hit && [...dots.entries()].find(([, d]) => d.el === hit);
      if (id) remove(id[0]); else add(`m${++markers}`, e.clientX, e.clientY);
      restart();
      return;
    }
    if (picked) return;   // the pick stands until every finger is lifted
    add(e.pointerId, e.clientX, e.clientY);
    restart();
  };
  ov.onpointermove = (e) => {
    const d = dots.get(e.pointerId);
    if (d && e.pointerType !== 'mouse') place(d, e.clientX, e.clientY);
  };
  const lift = (e) => {
    if (e.pointerType === 'mouse' || !dots.has(e.pointerId)) return;
    if (picked) {
      // keep the circles until the last finger leaves, then start over
      dots.get(e.pointerId).el.classList.add('fc-gone');
      dots.get(e.pointerId).lifted = true;
      if ([...dots.values()].every(d => d.lifted)) setTimeout(reset, 400);
      return;
    }
    remove(e.pointerId);
    restart();
  };
  ov.onpointerup = lift;
  ov.onpointercancel = lift;
  ov.oncontextmenu = (e) => e.preventDefault();

  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    clearTimeout(timer);
    ov.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    ov._navClose = null;
    navOverlayClosed('first');
  };
  ov.querySelector('.fc-x').onclick = close;
  document.addEventListener('keydown', onKey);
  ov._navClose = close;
  reset();
  ov.classList.add('open');
  navOverlayOpened('first');   // back closes it (nav.js)
}
