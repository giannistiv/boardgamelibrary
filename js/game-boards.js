// ── Game pages' own tools and boards, one game each ──
// The user, 19 Nov 2026, picked all fifteen game-specific ideas: "Do everything".
// Each game here gets a tool for the table (shown whether or not anyone's
// played) or a board read from the plays: always the viewer's own plays, an
// empty board before their first (feedback: personal views). A game's own
// lists for Log a play (js/scenarios.js) are here too, so its board can read
// what gets logged.
//   Tools: Magic Maze's sand timer, Heat's track roller.
//   Boards: Turing Machine's puzzles, the case files (MicroMacro, Chronicles
//   of Crime), Paleo's levels, Friday's ladder, Arkham Horror's campaign log,
//   Frosthaven's retirements, Pandemic Legacy's year, The King's Dilemma's
//   chronicle, Domianne's Tower, 7 Wonders Architects' wonders, Hanabi's
//   fireworks, Mind MGMT's two sides.
// (The Fellowship of the Ring's journey is a mission map: js/progress-boards.js.)

const GB = {};   // bggId → { tool?: (game) → html, board?: (game, mine, all) → html, wire?: (box, game) }
function gbRegister(ids, def) { [].concat(ids).forEach(id => { GB[id] = def; }); }

function gameToolHtml(game) {
  const d = game && GB[Number(game.bggId)];
  return d && d.tool ? `<div class="gb gb-tool" data-gb="${game.bggId}">${d.tool(game)}</div>` : '';
}
function gameBoardHtml(game, mine, all) {
  const d = game && GB[Number(game.bggId)];
  if (!d || !d.board || !(all || []).length) return '';
  const html = d.board(game, mine || [], all || []);
  return html ? `<div class="gb gb-board" data-gb="${game.bggId}">${html}</div>` : '';
}
function wireGameBoards(root, game) {
  const d = game && GB[Number(game.bggId)];
  if (!d || !d.wire || !root) return;
  root.querySelectorAll(`[data-gb="${game.bggId}"]`).forEach(box => {
    if (box.dataset.gbWired) return;
    box.dataset.gbWired = '1';
    d.wire(box, game);
  });
}
// A game's own lists for Log a play (js/scenarios.js asks here first).
function gbScenarioPicker(id) {
  const d = GB[Number(id)];
  return d && d.picker ? d.picker() : null;
}

// ── Helpers ──
const _gbEsc = (s) => _escapeHtml(String(s == null ? '' : s));
const _gbMe = () => (typeof _ptViewer === 'function' ? _ptViewer() : null);
const _gbCanon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
const _gbSeat = (p, me) => (me ? (p.sc || []).findIndex(s => s && (s.n === me || _gbCanon(s.n) === _gbCanon(me))) : -1);
const _gbAsc = (plays) => plays.slice().sort(typeof byPlayOrder === 'function' ? byPlayOrder
  : (a, b) => ((a.t || a.date) + (a.e || '')).localeCompare((b.t || b.date) + (b.e || '')));
const _gbWon = (p) => (p.sc || []).some(s => s && s.w);
const _gbNR = (p, id) => (typeof isNoResultPlay === 'function' ? isNoResultPlay(p, id) : !!p.nr);
const _gbDate = (d) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const _gbMonth = (d) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '');
const _gbFirst = (n) => _gbEsc(String(n || '').split(/[\s-]/)[0]);
const _gbScore = (s) => (s && typeof _recScore === 'function' ? _recScore(s.s) : null);
const _gbNum = (x) => (Math.round(x * 10) / 10).toLocaleString('en');
const _gbParts = (b) => String(b || '').split(/\s*[／｜|]\s*/).map(t => t.trim()).filter(Boolean);
const _gbNorm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]/g, '');
const _gbHead = (title, count) => `<div class="st-head"><span class="st-title">${title}</span>${count != null && count !== '' ? `<span class="st-count">${count}</span>` : ''}</div>`;
const _gbNote = (t) => `<div class="gb-note">${t}</div>`;
// The viewer's place at the table: winners first, then by score (higher better).
function _gbPlace(p, i) {
  const sc = p.sc || [], me = sc[i];
  if (!me) return 0;
  const v = (s) => { const x = _gbScore(s); return x == null ? -1e9 : x; };
  return 1 + sc.filter((s, k) => k !== i && ((s.w && !me.w) || (!!s.w === !!me.w && v(s) > v(me)))).length;
}
const _gbOrd = (n) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
// Log a play opened for this game with the viewer, a scenario and a result.
function _gbLog(bggId, b, extra) {
  if (typeof logPlayWith !== 'function') return;
  const me = _gbMe();
  logPlayWith({ bggId, names: me ? [me] : [], b: b || '', tab: 'plays', ...(extra || {}) });
}
const _gbSignedIn = () => typeof acctMe === 'function' && !!acctMe();

// ════════════════════════════ Magic Maze: the sand timer ════════════════════════════
// 3 minutes, flipped on a Sand Timer space: like the real one, a flip leaves
// what had already run down (the rulebook: "do not use a regular timer
// instead of a sand timer; the result is not the same!"). Each flip is a Sand
// Timer space used (the Great Book of Challenges counts them, fewer the
// better), and from Scenario 3 everyone passes their Action tile left. At 0
// the phone buzzes and beeps. The screen stays on while it runs.
const MM_BGGID = 209778, MM_FULL = 180;
const MM_SCENARIOS = ['Discovery', 'Several exits', 'Pass your Action tile', 'Dwarf & Elf special abilities', 'Mage special ability',
  'Barbarian special ability', 'Maximum Surveillance', 'Divination', 'Follow the leader!', 'Trick the Guards', 'Rearrangement mode',
  'Gestures only', 'Multidimensional mall', 'No communication', 'You have beautiful eyes', 'Vortex out of service', 'Groups forbidden'];
let _mm = { top: MM_FULL, at: 0, running: false, flips: 0, over: false, scen: 0, tick: null, lock: null, said: '' };
const _mmLeft = () => (_mm.running ? Math.max(0, _mm.top - (Date.now() - _mm.at) / 1000) : _mm.top);
function _mmTool() {
  const left = _mmLeft();
  const frac = left / MM_FULL;
  const mmss = `${Math.floor(Math.ceil(left) / 60)}:${String(Math.ceil(left) % 60).padStart(2, '0')}`;
  const scen = MM_SCENARIOS.map((n, i) => `<option value="${i + 1}"${_mm.scen === i + 1 ? ' selected' : ''}>${i + 1} · ${_gbEsc(n)}</option>`).join('');
  return `${_gbHead('&#9203; Sand timer', _mm.flips ? `flipped ${_mm.flips}&times;` : '3 minutes')}
    <div class="mm-wrap${_mm.over ? ' over' : ''}${_mm.running ? ' run' : ''}">
      <svg class="mm-glass" viewBox="0 0 60 100" aria-hidden="true">
        <path class="mm-frame" d="M8 4h44M8 96h44M12 4c0 26 14 32 14 46S12 70 12 96M48 4c0 26-14 32-14 46s14 20 14 46"/>
        <clipPath id="mm-top"><path d="M12 6c0 24 13 30 15 44h6c2-14 15-20 15-44z"/></clipPath>
        <clipPath id="mm-bot"><path d="M27 50c-2 14-15 20-15 44h36c0-24-13-30-15-44z"/></clipPath>
        <rect class="mm-sand" clip-path="url(#mm-top)" x="0" y="${(50 - 44 * frac).toFixed(1)}" width="60" height="${(44 * frac).toFixed(1)}"/>
        <rect class="mm-sand" clip-path="url(#mm-bot)" x="0" y="${(94 - 44 * (1 - frac)).toFixed(1)}" width="60" height="${(44 * (1 - frac)).toFixed(1)}"/>
        ${_mm.running ? '<line class="mm-stream" x1="30" y1="50" x2="30" y2="94"/>' : ''}
      </svg>
      <div class="mm-side">
        <div class="mm-time" aria-live="polite">${_mm.over ? '0:00' : mmss}</div>
        <div class="mm-say">${_mm.over ? 'Time&rsquo;s up: the guards nab you.' : _mm.said || (_mm.running ? 'Silence! Talk only right after a flip.' : 'Plan out loud, then start.')}</div>
        <div class="mm-btns">
          ${_mm.running ? '<button type="button" class="rv-btn rv-btn-sm" data-mm="flip">Flip it</button><button type="button" class="rv-btn rv-btn-sm rv-btn-soft" data-mm="stop">Stop</button>'
            : _mm.over || _mm.flips || _mm.top !== MM_FULL ? '<button type="button" class="rv-btn rv-btn-sm" data-mm="reset">New game</button>' : '<button type="button" class="rv-btn rv-btn-sm" data-mm="start">Start (3:00)</button>'}
        </div>
      </div>
    </div>
    <label class="mm-scen"><span>Scenario</span><select class="lp-input" data-mm-scen><option value="0">Pick one (for its reminders)…</option>${scen}</select></label>
    ${(_mm.over || (!_mm.running && _mm.at)) && _gbSignedIn() ? `<div class="mm-end"><span>How did it go?</span>
      <button type="button" class="rv-btn rv-btn-sm" data-mm-log="won">We escaped</button><button type="button" class="rv-btn rv-btn-sm rv-btn-soft" data-mm-log="lost">Caught</button></div>` : ''}`;
}
// (off screen it keeps counting; the page shows it again when it's back)
function _mmRedraw(box) {
  if (box && box.isConnected) box.innerHTML = _mmTool();
}
function _mmBeep() {
  try {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return;
    const ac = new A();
    [0, 0.35, 0.7].forEach(t => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.18, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.3);
      o.connect(g); g.connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.32);
    });
    setTimeout(() => ac.close && ac.close(), 1500);
  } catch (_) {}
}
async function _mmLock(on) {
  try {
    if (on && navigator.wakeLock && !_mm.lock) _mm.lock = await navigator.wakeLock.request('screen');
    if (!on && _mm.lock) { await _mm.lock.release(); _mm.lock = null; }
  } catch (_) { _mm.lock = null; }
}
function _mmRun(box) {
  clearInterval(_mm.tick);
  _mm.tick = setInterval(() => {
    const live = document.querySelector(`[data-gb="${MM_BGGID}"]`);
    if (_mmLeft() <= 0 && _mm.running) {
      _mm.running = false; _mm.top = 0; _mm.over = true;
      clearInterval(_mm.tick); _mm.tick = null;
      if (navigator.vibrate) navigator.vibrate([400, 150, 400, 150, 600]);
      _mmBeep();
      _mmLock(false);
    }
    _mmRedraw(live || box);
  }, 250);
}
gbRegister(MM_BGGID, {
  tool: () => _mmTool(),
  wire: (box) => {
    if (_mm.running) _mmRun(box);
    box.addEventListener('change', (e) => {
      if (!e.target.matches('[data-mm-scen]')) return;
      _mm.scen = Number(e.target.value) || 0;
      _mm.said = '';
      _mmRedraw(box);
    });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mm],[data-mm-log]');
      if (!b) return;
      const what = b.dataset.mm;
      if (b.dataset.mmLog) {
        const won = b.dataset.mmLog === 'won';
        const note = _mm.flips ? `Sand timer flipped ${_mm.flips}×` : '';
        _gbLog(MM_BGGID, _mm.scen ? `Scenario ${_mm.scen}` : '', { won, c: note });
        return;
      }
      if (what === 'start') {
        _mm = { ..._mm, top: MM_FULL, at: Date.now(), running: true, flips: 0, over: false, said: '' };
        _mmLock(true);
        _mmRun(box);
      } else if (what === 'flip') {
        // the sand that had run down is now on top
        _mm.top = MM_FULL - _mmLeft();
        _mm.at = Date.now();
        _mm.flips++;
        _mm.said = `Talk now, while the sand runs${_mm.scen >= 3 ? ' · pass your Action tile to the left' : ''}.`;
        if (navigator.vibrate) navigator.vibrate(60);
      } else if (what === 'stop') {
        _mm.top = _mmLeft(); _mm.running = false;
        clearInterval(_mm.tick); _mm.tick = null;
        _mm.said = 'Stopped. Escaped, or caught?';
        _mmLock(false);
      } else if (what === 'reset') {
        clearInterval(_mm.tick);
        _mm = { ..._mm, top: MM_FULL, at: 0, running: false, flips: 0, over: false, tick: null, said: '' };
        _mmLock(false);
      }
      _mmRedraw(box);
    });
  },
});

// ════════════════════════════ Heat: the track roller ════════════════════════════
// A track at random from the boxes (the user's plays use Heavy Rain), the
// one raced least likelier, and each track's record: the viewer's races,
// best finish and wins. Log a play picks the track too.
const HEAT_BGGID = 366013;
const HEAT_TRACKS = [['USA', 'Base game'], ['Italy', 'Base game'], ['France', 'Base game'], ['Great Britain', 'Base game'], ['Japan', 'Heavy Rain'], ['Mexico', 'Heavy Rain']];
let _heatPick = null;
const _heatTrackOf = (p) => { const parts = _gbParts(p.b).map(_gbNorm); return (HEAT_TRACKS.find(([t]) => parts.includes(_gbNorm(t))) || [null])[0]; };
function _heatStats(mine) {
  const me = _gbMe(), by = {};
  for (const p of mine) {
    const t = _heatTrackOf(p); if (!t) continue;
    const i = _gbSeat(p, me); if (i < 0) continue;
    const r = by[t] = by[t] || { n: 0, w: 0, best: 0 };
    r.n++; if (p.sc[i].w) r.w++;
    const pl = _gbPlace(p, i); if (pl && (!r.best || pl < r.best)) r.best = pl;
  }
  return by;
}
function _heatTool() {
  const all = PLAY_HISTORY[HEAT_BGGID] || [];
  const me = _gbMe();
  const mine = me ? all.filter(p => _gbSeat(p, me) >= 0) : [];
  const by = _heatStats(mine);
  const untold = mine.filter(p => !_heatTrackOf(p)).length;
  const tiles = HEAT_TRACKS.map(([t, box]) => {
    const r = by[t];
    return `<div class="heat-t${_heatPick === t ? ' on' : ''}${r ? ' raced' : ''}"><b>${_gbEsc(t)}</b><span>${r ? `${r.n} race${r.n > 1 ? 's' : ''} · best ${_gbOrd(r.best)}${r.w ? ` · ${r.w} won` : ''}` : box === 'Base game' ? 'not raced yet' : `${_gbEsc(box)} · not raced yet`}</span></div>`;
  }).join('');
  return `${_gbHead('&#127937; Tracks', 'your races')}
    <div class="heat-grid">${tiles}</div>
    <div class="heat-act"><button type="button" class="toy-dice" data-heat-roll><span aria-hidden="true">&#127922;</span> Random track</button>
      ${_heatPick && _gbSignedIn() ? `<button type="button" class="rv-btn rv-btn-sm" data-heat-log>Log a race in ${_gbEsc(_heatPick)}</button>` : ''}</div>
    ${untold ? _gbNote(`${untold} of your race${untold > 1 ? 's don&rsquo;t' : ' doesn&rsquo;t'} say the track: pick it in Log a play to count it.`) : ''}`;
}
gbRegister(HEAT_BGGID, {
  tool: () => _heatTool(),
  picker: () => ({ fields: [{ key: 'track', label: 'Track', optional: true, options: () => HEAT_TRACKS.map(([t, box]) => [t, t, box]) }] }),
  wire: (box) => box.addEventListener('click', (e) => {
    if (e.target.closest('[data-heat-log]')) { _gbLog(HEAT_BGGID, _heatPick); return; }
    if (!e.target.closest('[data-heat-roll]')) return;
    const me = _gbMe();
    const by = _heatStats(me ? (PLAY_HISTORY[HEAT_BGGID] || []).filter(p => _gbSeat(p, me) >= 0) : []);
    const pool = HEAT_TRACKS.map(([t]) => t).filter(t => t !== _heatPick);
    const w = pool.map(t => 1 / (1 + ((by[t] || {}).n || 0)));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    _heatPick = pool.find((t, i) => (r -= w[i]) <= 0) || pool[pool.length - 1];
    box.innerHTML = _heatTool();
  }),
});

// ════════════════════════════ Turing Machine: the puzzles ════════════════════════════
// The score logged is the one where fewer is better (rounds or questions).
// Log a play takes the puzzle's mode, difficulty and verifiers; the code goes
// in "Anything else". A new puzzle is a tap away on the official site.
const TM_BGGID = 356123;
const TM_MODES = ['Classic', 'Extreme', 'Nightmare'], TM_DIFFS = ['Easy', 'Standard', 'Hard'], TM_VERS = ['4 verifiers', '5 verifiers', '6 verifiers'];
function _tmBoard(game, mine) {
  const me = _gbMe();
  const games = mine.map(p => ({ p, i: _gbSeat(p, me) })).filter(x => x.i >= 0);
  const scored = games.map(x => ({ ...x, v: _gbScore(x.p.sc[x.i]) })).filter(x => x.v != null);
  const wins = games.filter(x => x.p.sc[x.i].w).length;
  const best = scored.length ? Math.min(...scored.map(x => x.v)) : null;
  const avg = scored.length ? scored.reduce((a, x) => a + x.v, 0) / scored.length : null;
  // how often each score came up
  const hist = {};
  scored.forEach(x => { hist[x.v] = (hist[x.v] || 0) + 1; });
  const keys = Object.keys(hist).map(Number).sort((a, b) => a - b);
  const top = Math.max(1, ...Object.values(hist));
  const bars = keys.map(k => `<div class="tm-bar${k === best ? ' best' : ''}" title="${hist[k]} game${hist[k] > 1 ? 's' : ''} with ${k}"><i style="height:${Math.round(hist[k] / top * 100)}%"></i><b>${_gbNum(k)}</b><small>${hist[k]}</small></div>`).join('');
  // by mode × verifiers, once they're logged
  const cell = {};
  for (const x of games) {
    const parts = _gbParts(x.p.b);
    const mode = TM_MODES.find(m => parts.includes(m)) || (parts.some(t => TM_VERS.includes(t) || TM_DIFFS.includes(t)) ? 'Classic' : null);
    const ver = TM_VERS.find(v => parts.includes(v));
    if (!mode || !ver) continue;
    const c = cell[`${mode}|${ver}`] = cell[`${mode}|${ver}`] || { n: 0, w: 0 };
    c.n++; if (x.p.sc[x.i].w) c.w++;
  }
  const anyGrid = Object.keys(cell).length;
  const grid = `<table class="tm-grid"><thead><tr><th></th>${TM_VERS.map(v => `<th>${v[0]}</th>`).join('')}</tr></thead><tbody>${TM_MODES.map(m => `<tr><th>${m}</th>${TM_VERS.map(v => {
    const c = cell[`${m}|${v}`];
    return `<td class="${c ? (c.w ? 'won' : 'tried') : ''}">${c ? `${c.w}/${c.n}` : ''}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table>`;
  return `${_gbHead('&#129518; Puzzles', `${games.length} puzzle${games.length !== 1 ? 's' : ''}`)}
    <div class="gb-stats">
      <div class="pb-stat"><b>${games.length}</b><span>Games</span></div>
      <div class="pb-stat"><b>${wins}</b><span>Won</span></div>
      <div class="pb-stat"><b>${best != null ? _gbNum(best) : '–'}</b><span>Best (fewest)</span></div>
      <div class="pb-stat"><b>${avg != null ? _gbNum(avg) : '–'}</b><span>Average</span></div>
    </div>
    ${keys.length ? `<div class="gb-sub">Your scores, fewer is better</div><div class="tm-bars">${bars}</div>` : ''}
    <div class="gb-sub">Mode &times; verifiers <span>won / played</span></div>
    ${grid}
    ${anyGrid ? '' : _gbNote('Pick the mode, difficulty and verifiers in Log a play and this fills in.')}
    <a class="rv-btn rv-btn-sm gb-link" href="https://turingmachine.info/" target="_blank" rel="noopener">A new puzzle on turingmachine.info &#8599;</a>`;
}
gbRegister(TM_BGGID, {
  board: _tmBoard,
  picker: () => ({ order: ['mode', 'diff', 'ver'], fields: [
    { key: 'mode', label: 'Mode', optional: true, none: 'Classic', options: () => [['Extreme', 'Extreme'], ['Nightmare', 'Nightmare']] },
    { key: 'diff', label: 'Difficulty', optional: true, options: () => TM_DIFFS.map(d => [d, d]) },
    { key: 'ver', label: 'Verifiers', optional: true, options: () => TM_VERS.map(v => [v, v]) },
  ] }),
});

// ════════════════════════════ Case files: MicroMacro, Chronicles of Crime ════════════════════════════
const MMC_BGGID = 318977;
const MMC_CASES = ['The Top Hat', 'The Car Accident', 'The Bank Heist', 'Leo Moustache', 'Dead Cat', 'Sweet and Sour', 'Death from Above',
  'Disappeared Without a Trace', 'Big Betty', 'Hairy Tales', 'Dangerous Hobby', 'Love Song', 'Nature Kills', 'The Masked Avenger', 'The Sunday Stroll', 'Carnival'];
const COC_BGGID = 239188;
const _caseOf = (p, names) => { const parts = _gbParts(p.b).map(_gbNorm); return names.find(n => parts.includes(_gbNorm(n))) || null; };
function _casesHtml(title, names, mine, all, opts) {
  const me = _gbMe();
  const mineBy = {}, allBy = {};
  for (const p of all) {
    const c = _caseOf(p, names); if (!c) continue;
    (allBy[c] = allBy[c] || []).push(p);
  }
  for (const p of _gbAsc(mine)) {
    const c = _caseOf(p, names); if (!c) continue;
    (mineBy[c] = mineBy[c] || []).push(p);
  }
  const solved = names.filter(n => (mineBy[n] || []).some(_gbWon)).length;
  const rows = names.map((n, k) => {
    const ours = mineBy[n] || [], every = allBy[n] || [];
    const won = ours.some(_gbWon);
    const last = ours.length ? ours[ours.length - 1] : null;
    const with_ = last ? last.sc.filter(s => !(s.n === me || _gbCanon(s.n) === _gbCanon(me))).map(s => _gbFirst(s.n)).join(', ') : '';
    const others = !ours.length && every.length ? `played here ${every.length}&times;` : '';
    return `<div class="case${won ? ' solved' : ours.length ? ' tried' : ''}">
        <span class="case-n">${opts.numbered ? k + 1 : '&#9679;'}</span>
        <span class="case-name">${_gbEsc(n)}${opts.intro && k === 0 ? ' <small>intro</small>' : ''}</span>
        <span class="case-what">${won ? `&#10003; ${_gbDate(last.date)}${with_ ? ` · with ${with_}` : ''}` : ours.length ? 'not solved yet' : others || 'not opened yet'}</span>
      </div>`;
  }).join('');
  const untold = mine.filter(p => !_caseOf(p, names)).length;
  return `${_gbHead(title, `${solved} / ${names.length} solved`)}
    <div class="case-list">${rows}</div>
    ${untold ? _gbNote(`${untold} of your games don&rsquo;t say which case${opts.when ? ` (${opts.when(mine.filter(p => !_caseOf(p, names)))})` : ''}: pick it in Log a play next time.`) : ''}
    ${opts.foot || ''}`;
}
gbRegister(MMC_BGGID, {
  board: (game, mine, all) => _casesHtml('&#128269; The cases', MMC_CASES, mine, all, {
    numbered: true, intro: true,
    when: (ps) => [...new Set(ps.map(p => _gbDate(p.date)))].slice(0, 2).join(', '),
    foot: _gbNote('The first five in order if you&rsquo;re new to it, as the rulebook says; the rest in any order.'),
  }),
  picker: () => ({ fields: [{ key: 'case', label: 'Case', optional: true, options: () => MMC_CASES.map((n, i) => [n, `${i + 1} · ${n}`]) }] }),
});
// Chronicles of Crime's cases come from the app, so the list is the ones played here
function _cocCases() {
  const seen = new Map();
  for (const p of _gbAsc(PLAY_HISTORY[COC_BGGID] || [])) for (const t of _gbParts(p.b)) if (!seen.has(_gbNorm(t))) seen.set(_gbNorm(t), t);
  return [...seen.values()];
}
gbRegister(COC_BGGID, {
  board: (game, mine, all) => {
    const names = _cocCases();
    if (!names.length) return '';
    return _casesHtml('&#128373;&#65039; Case files', names, mine, all, {
      foot: _gbNote('The cases are the ones logged here (the app has the rest). A new one joins this list when it&rsquo;s logged.'),
    });
  },
  picker: () => ({ fields: [{ key: 'case', label: 'Case', optional: true, none: 'Another case (type it below)', options: () => _cocCases().map(n => [n, n]) }] }),
});

// ════════════════════════════ Paleo: the seven levels ════════════════════════════
// From the rules supplement: two modules a level (three in Level VII).
const PALEO_BGGID = 300531;
const PALEO_MODULES = { A: 'Bountiful Prey', B: 'A New World', C: 'Howls in the Night', D: 'The Next Step', E: 'Heroes of the Ice Age',
  F: 'Snowstorm', G: 'Strange Fever', H: 'The Wide River', I: 'Attack of the White Hands', J: 'The Beast' };
const PALEO_LEVELS = ['AB', 'CD', 'EF', 'CG', 'AH', 'BI', 'DEJ'];
const _paleoLevelOf = (p) => { const m = String(p.b || '').match(/\b(?:level|scenario)\s*0*([1-7])\b/i); return m ? Number(m[1]) : 0; };
gbRegister(PALEO_BGGID, {
  board: (game, mine) => {
    const me = _gbMe();
    const by = {};
    for (const p of mine) { const l = _paleoLevelOf(p); if (!l) continue; const r = by[l] = by[l] || { n: 0, w: 0, when: '' }; r.n++; if (_gbWon(p)) { r.w++; r.when = r.when || p.date; } }
    const beaten = Object.values(by).filter(r => r.w).length;
    const next = PALEO_LEVELS.findIndex((_, i) => !(by[i + 1] || {}).w) + 1;
    const rows = PALEO_LEVELS.map((mods, i) => {
      const r = by[i + 1];
      const st = r ? (r.w ? 'won' : 'lost') : i + 1 === next ? 'next' : '';
      return `<div class="paleo-l ${st}">
          <span class="paleo-n">${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]}</span>
          <span class="paleo-m">${mods.split('').map(m => `<span><b>${m}</b> ${_gbEsc(PALEO_MODULES[m])}</span>`).join('')}</span>
          <span class="paleo-r">${r ? `${r.w ? '&#10003; ' : ''}${r.w}/${r.n}` : st === 'next' ? 'next' : ''}</span>
        </div>`;
    }).join('');
    const untold = mine.filter(p => !_paleoLevelOf(p));
    const wonUntold = untold.filter(_gbWon).length;
    return `${_gbHead('&#129460; The levels', `${beaten} / 7 beaten`)}
      <div class="paleo-ls">${rows}</div>
      ${untold.length ? _gbNote(`${untold.length} of your games (${wonUntold} won) don&rsquo;t say the level: pick it in Log a play to count it.`) : ''}`;
  },
  picker: () => ({ fields: [{ key: 'lvl', label: 'Level', optional: true, none: 'Other modules (type them below)',
    options: () => PALEO_LEVELS.map((m, i) => [`Level ${i + 1}`, `${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]} · ${m.split('').join(' + ')}`]),
    match: (t, v) => { const a = t.match(/(?:level|scenario)\s*0*(\d)/i), b = v.match(/(\d)/); return !!(a && b && a[1] === b[1]); } }] }),
});

// ════════════════════════════ Friday: the difficulty ladder ════════════════════════════
const FRIDAY_BGGID = 43570;
const FRIDAY_LEVELS = ['As in the rules', '+ an aging card among Robinson’s', '+ “Very Stupid” in the aging pile', '18 life points: the real game'];
const _fridayLevelOf = (p) => { const m = String(p.b || '').match(/\blevel\s*([1-4])\b/i); return m ? Number(m[1]) : 0; };
gbRegister(FRIDAY_BGGID, {
  board: (game, mine) => {
    const by = {};
    for (const p of mine) { const l = _fridayLevelOf(p); if (!l) continue; const r = by[l] = by[l] || { n: 0, w: 0 }; r.n++; if (_gbWon(p)) r.w++; }
    const top = [4, 3, 2, 1].find(l => (by[l] || {}).w) || 0;
    const rungs = [4, 3, 2, 1].map(l => {
      const r = by[l];
      return `<div class="fri-l${r && r.w ? ' won' : r ? ' tried' : ''}${l === top + 1 ? ' next' : ''}"><b>Level ${l}</b><span>${_gbEsc(FRIDAY_LEVELS[l - 1])}</span><em>${r ? `${r.w} / ${r.n}` : l === top + 1 ? 'next' : ''}</em></div>`;
    }).join('');
    const untold = mine.filter(p => !_fridayLevelOf(p));
    const decided = untold.filter(p => !_gbNR(p, FRIDAY_BGGID));
    return `${_gbHead('&#127965;&#65039; Robinson&rsquo;s ladder', top ? `Level ${top} beaten` : 'climb to Level 4')}
      <div class="fri-ls">${rungs}</div>
      ${untold.length ? _gbNote(`${untold.length} game${untold.length > 1 ? 's' : ''} from before levels were noted: ${decided.filter(_gbWon).length} won, ${untold.length - decided.length} without a result.`) : ''}`;
  },
  picker: () => ({ fields: [{ key: 'lvl', label: 'Level', options: () => [1, 2, 3, 4].map(l => [`Level ${l}`, `${l} · ${FRIDAY_LEVELS[l - 1]}`]) }] }),
});

// ════════════════════════════ Arkham Horror LCG: the campaign log ════════════════════════════
// The campaigns in order, from their campaign guides; a scenario played is
// lit (won or not), and the investigators who played it are on it.
const AH_BGGID = 359609;
const AH_CAMPAIGNS = [
  ['Night of the Zealot', ['The Gathering', 'The Midnight Masks', 'The Devourer Below']],
  ['The Feast of Hemlock Vale', ['Prologue: The Vale', 'Written in Rock', 'Hemlock House', 'The Silent Heath', 'The Lost Sister', 'The Thing in the Depths', 'The Twisted Hollow', 'The Longest Night', 'Fate of the Vale']],
  ['The Scarlet Keys', ['Riddles and Rain', 'Dead Heat', 'Sanguine Shadows', 'Dealings in the Dark', 'Dancing Mad', 'On Thin Ice', 'Dogs of War', 'Shades of Suffering', 'Without a Trace', 'Congress of the Keys']],
];
const _ahFind = (b) => { const parts = _gbParts(b).map(_gbNorm); for (const [c, ss] of AH_CAMPAIGNS) { const s = ss.find(x => parts.includes(_gbNorm(x))); if (s) return [c, s]; } return null; };
gbRegister(AH_BGGID, {
  board: (game, mine) => {
    const me = _gbMe();
    const camps = AH_CAMPAIGNS.map(([c, ss]) => {
      const plays = mine.filter(p => (_ahFind(p.b) || [])[0] === c);
      if (!plays.length) return '';
      const by = {};
      const asc = _gbAsc(plays);
      for (const p of asc) { const s = _ahFind(p.b)[1]; (by[s] = by[s] || []).push(p); }
      const last = asc[asc.length - 1];
      const chips = ss.map((s, k) => {
        const ps = by[s] || [];
        const won = ps.some(_gbWon);
        const who = ps.length ? [...new Set(ps.flatMap(p => p.sc.map(x => x.r).filter(Boolean)))].map(_gbEsc).join(', ') : '';
        return `<div class="ah-s${won ? ' won' : ps.length ? ' lost' : ''}${last && _ahFind(last.b)[1] === s ? ' at' : ''}" title="${_gbEsc(s)}${ps.length ? ` · ${ps.length} game${ps.length > 1 ? 's' : ''}` : ''}">
            <b>${k + 1}</b><span>${_gbEsc(s.replace(/^Prologue: /, ''))}</span>${ps.length ? `<small>${won ? '&#10003; ' : ''}${ps.length}&times;${who ? ` · ${who}` : ''}</small>` : ''}</div>`;
      }).join('');
      const i = _gbSeat(last, me);
      return `<div class="ah-camp"><div class="ah-top"><b>${_gbEsc(c)}</b><span>${_gbMonth(asc[0].date)}${_gbMonth(last.date) !== _gbMonth(asc[0].date) ? ` &ndash; ${_gbMonth(last.date)}` : ''}</span></div>
          <div class="ah-who">${last.sc.map(s => `${_gbFirst(s.n)}${s.r ? ` <i>${_gbEsc(s.r)}</i>` : ''}`).join(' · ')}</div>
          <div class="ah-ss">${chips}</div>
          <div class="gb-note">Last: <b>${_gbEsc(_ahFind(last.b)[1])}</b> on ${_gbDate(last.date)}${i >= 0 && last.sc[i].w ? ', won' : ''}.</div></div>`;
    }).join('');
    const other = mine.filter(p => !_ahFind(p.b));
    if (!camps && !other.length) return `${_gbHead('&#128213; Campaign log')}${_gbNote('Your campaigns show here once you&rsquo;ve played one.')}`;
    return `${_gbHead('&#128213; Campaign log', `${mine.length} scenario${mine.length !== 1 ? 's' : ''} played`)}${camps}
      ${other.length ? _gbNote(`Also: ${[...new Set(other.map(p => p.b || 'untitled'))].map(_gbEsc).join(', ')}.`) : ''}`;
  },
  picker: () => ({ fields: [{ key: 'scen', label: 'Scenario', optional: true, none: 'Another scenario (type it below)',
    options: () => AH_CAMPAIGNS.flatMap(([c, ss]) => ss.map(s => [s, s, c])) }] }),
});

// ════════════════════════════ Frosthaven: the retirements ════════════════════════════
// Each player a lane across the campaign: the class they played, one after
// another (a new class is the old one retired), from its first session to
// its last. A retired class doesn't come back, so a class is one span even
// when two sessions of a day are logged out of order.
const FH_BGGID = 295770;
const FH_HUES = [12, 200, 140, 280, 40, 330, 95, 250, 175, 60];
gbRegister(FH_BGGID, {
  board: (game, mine) => {
    if (!mine.length) return `${_gbHead('&#10052;&#65039; Retirements')}${_gbNote('Your party&rsquo;s classes show here once you&rsquo;ve played.')}`;
    const ps = _gbAsc(mine);
    const n = ps.length;
    const lanes = new Map();
    ps.forEach((p, k) => p.sc.forEach(s => {
      if (!s.n) return;
      const key = _gbCanon(s.n);
      const l = lanes.get(key) || { name: s.n, segs: [], games: 0 };
      l.games++;
      const cls = s.r || '?';
      const seg = l.segs.find(x => x.cls === cls);
      if (seg) { seg.to = k; seg.n++; if (p.sc.some(x => x.w)) seg.w++; }
      else l.segs.push({ cls, from: k, to: k, n: 1, w: p.sc.some(x => x.w) ? 1 : 0, date: p.date });
      lanes.set(key, l);
    }));
    // "Deathwalker" logged without its race is the "Valrath Deathwalker" of the same lane
    for (const l of lanes.values()) {
      for (const a of l.segs.slice()) {
        const b = l.segs.find(x => x !== a && x.cls.endsWith(` ${a.cls}`));
        if (!b) continue;
        b.from = Math.min(b.from, a.from); b.to = Math.max(b.to, a.to); b.n += a.n; b.w += a.w;
        l.segs.splice(l.segs.indexOf(a), 1);
      }
      l.segs.sort((x, y) => x.from - y.from);
    }
    const me = _gbMe();
    const rows = [...lanes.values()].filter(l => l.games >= Math.min(5, n)).sort((a, b) => (_gbCanon(b.name) === _gbCanon(me)) - (_gbCanon(a.name) === _gbCanon(me)) || b.games - a.games);
    const hue = new Map();
    const colour = (c) => { if (!hue.has(c)) hue.set(c, FH_HUES[hue.size % FH_HUES.length]); return hue.get(c); };
    const lane = (l) => `<div class="fh-lane"><div class="fh-who">${_gbFirst(l.name)}<small>${l.segs.length} class${l.segs.length > 1 ? 'es' : ''}</small></div>
        <div class="fh-bar">${l.segs.map((s, i) => {
          const cls = s.cls.split(' ');
          const name = cls.length > 1 ? cls.slice(1).join(' ') : s.cls;
          return `<div class="fh-seg${i < l.segs.length - 1 ? ' retired' : ''}" style="left:${(s.from / n * 100).toFixed(2)}%;width:${(Math.max(1, s.to - s.from + 1) / n * 100).toFixed(2)}%;--h:${colour(s.cls)}" title="${_gbEsc(s.cls)} · ${s.n} session${s.n > 1 ? 's' : ''}, ${s.w} won · from ${_gbDate(s.date)}${i < l.segs.length - 1 ? ' · retired' : ''}"><span>${_gbEsc(name)}</span></div>`;
        }).join('')}</div></div>`;
    const months = [];
    let lastM = '';
    ps.forEach((p, k) => { const m = p.date.slice(0, 7); if (m !== lastM) { months.push([k, m]); lastM = m; } });
    const axis = months.filter((_, i) => i % Math.ceil(months.length / 6) === 0).map(([k, m]) => `<span style="left:${(k / n * 100).toFixed(1)}%">${new Date(`${m}-15`).toLocaleDateString('en-GB', { month: 'short' })}</span>`).join('');
    const wins = ps.filter(_gbWon).length;
    const list = rows.map(l => `<div class="fh-list"><b>${_gbFirst(l.name)}</b> ${l.segs.map((s, i) => `<span class="fh-chip" style="--h:${colour(s.cls)}">${_gbEsc(s.cls)} <small>${s.n}</small></span>${i < l.segs.length - 1 ? '<i>&rarr;</i>' : ''}`).join('')}</div>`).join('');
    return `${_gbHead('&#10052;&#65039; Retirements', `${n} sessions · ${wins} won`)}
      <div class="fh-span">${_gbDate(ps[0].date)} &ndash; ${_gbDate(ps[n - 1].date)}${typeof CAMPAIGN_PROGRESS !== 'undefined' && (CAMPAIGN_PROGRESS[FH_BGGID] || {}).complete ? ' · campaign finished' : ''}</div>
      <div class="fh-lanes">${rows.map(lane).join('')}<div class="fh-axis">${axis}</div></div>
      <details class="fh-more"><summary>Class by class</summary>${list}</details>`;
  },
});

// ════════════════════════════ Pandemic Legacy S1: the year ════════════════════════════
// Rebuilt from the games in order: a month is won, or tried twice (the
// rulebook: "each month is played once or twice"). Funding goes down 2 after
// a win and up 2 after a loss, so its change shows month by month too.
const PL_BGGID = 161936;
const PL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
gbRegister(PL_BGGID, {
  board: (game, mine) => {
    if (!mine.length) return `${_gbHead('&#129440; The year')}${_gbNote('Your year shows here once you&rsquo;ve played.')}`;
    const months = [];
    let m = 0, tries = 0;
    for (const p of _gbAsc(mine)) {
      if (m >= 12) break;
      (months[m] = months[m] || []).push(p);
      tries++;
      if (_gbWon(p) || tries === 2) { m++; tries = 0; }
    }
    const won = months.filter(g => g.some(_gbWon)).length;
    let funding = 0;
    const cells = PL_MONTHS.map((name, i) => {
      const g = months[i] || [];
      const w = g.some(_gbWon);
      const delta = g.reduce((d, p) => d + (_gbWon(p) ? -2 : 2), 0);
      funding += delta;
      const roles = g.length ? [...new Set(g.flatMap(p => p.sc.map(s => s.r).filter(Boolean)))] : [];
      return `<div class="pl-m${g.length ? (w ? ' won' : ' lost') : ''}" title="${name}${g.length ? ` · ${g.map(p => (_gbWon(p) ? 'won' : 'lost')).join(', then ')} · ${_gbDate(g[0].date)}` : ''}">
          <b>${name.slice(0, 3)}</b>
          <span class="pl-dots">${g.map(p => `<i class="${_gbWon(p) ? 'w' : 'l'}"></i>`).join('')}</span>
          <small>${g.length ? (w ? (g.length > 1 ? 'won 2nd try' : 'won') : 'lost twice') : ''}</small>
          ${g.length ? `<em>${delta > 0 ? `+${delta}` : delta} funding</em>` : ''}
        </div>`;
    }).join('');
    const team = [...new Map(mine.flatMap(p => p.sc.map(s => [_gbCanon(s.n), s]))).values()];
    const roleOf = (n) => [...new Set(_gbAsc(mine).flatMap(p => p.sc.filter(s => _gbCanon(s.n) === _gbCanon(n)).map(s => s.r).filter(Boolean)))];
    return `${_gbHead('&#129440; The year', `${won} / 12 months won`)}
      <div class="pl-cal">${cells}</div>
      <div class="pl-team">${team.map(s => `<span><b>${_gbFirst(s.n)}</b> ${roleOf(s.n).map(_gbEsc).join(' → ')}</span>`).join('')}</div>
      ${_gbNote(`${mine.length} games, ${_gbDate(_gbAsc(mine)[0].date)} &ndash; ${_gbDate(_gbAsc(mine).pop().date)}. Months rebuilt from the wins and losses in order; funding as the rulebook moves it (−2 a win, +2 a loss), net ${funding > 0 ? '+' : ''}${funding} over the year.`)}`;
  },
});

// ════════════════════════════ The King's Dilemma: the chronicle ════════════════════════════
const KD_BGGID = 245655;
gbRegister(KD_BGGID, {
  board: (game, mine) => {
    if (!mine.length) return `${_gbHead('&#128081; The chronicle')}${_gbNote('Your reign shows here once you&rsquo;ve played.')}`;
    const ps = _gbAsc(mine);
    const houses = new Map();   // player → { name, house, total, wins, line: [] }
    ps.forEach((p, k) => p.sc.forEach(s => {
      const key = _gbCanon(s.n);
      const h = houses.get(key) || { name: s.n, house: s.r || '', total: 0, wins: 0, line: [] };
      h.house = s.r || h.house;
      h.total += _gbScore(s) || 0;
      if (s.w) h.wins++;
      h.line[k] = h.total;
      houses.set(key, h);
    }));
    const H = [...houses.values()].sort((a, b) => b.total - a.total);
    const hues = [42, 0, 210, 130, 280, 30, 180];
    H.forEach((h, i) => { h.hue = hues[i % hues.length]; });
    const W = 320, Ht = 110, max = Math.max(1, ...H.map(h => h.total));
    const lines = H.map(h => `<polyline style="--h:${h.hue}" points="${ps.map((_, k) => `${(ps.length > 1 ? k / (ps.length - 1) * W : W / 2).toFixed(1)},${(Ht - (h.line[k] || 0) / max * Ht).toFixed(1)}`).join(' ')}"/>`).join('');
    const sessions = ps.map((p, k) => {
      const win = p.sc.filter(s => s.w);
      return `<div class="kd-s"><span class="kd-n">${k + 1}</span><span class="kd-d">${_gbDate(p.date)}</span>
          <span class="kd-crown">${win.map(s => `&#128081; ${_gbEsc(s.r || s.n)}`).join(', ') || '&ndash;'}</span>
          ${p.b ? `<span class="kd-b">${_gbEsc(p.b)}</span>` : ''}</div>`;
    }).join('');
    return `${_gbHead('&#128081; The chronicle', `${ps.length} sessions`)}
      <div class="kd-span">${_gbDate(ps[0].date)} &ndash; ${_gbDate(ps[ps.length - 1].date)}</div>
      <div class="kd-houses">${H.map((h, i) => `<div class="kd-h" style="--h:${h.hue}"><span class="kd-rank">${i + 1}</span><b>${_gbEsc(h.house || h.name)}</b><span>${_gbFirst(h.name)}</span><em>${_gbNum(h.total)}<small>${h.wins} crown${h.wins !== 1 ? 's' : ''}</small></em></div>`).join('')}</div>
      <svg class="kd-chart" viewBox="-4 -6 ${W + 8} ${Ht + 12}" aria-label="Points added up, session by session">${lines}</svg>
      <details class="kd-more"><summary>Session by session</summary>${sessions}</details>`;
  },
});

// ════════════════════════════ Adventure Tactics: Domianne's Tower ════════════════════════════
// Each climb starts again at the first fight; a fight's floor is how far up
// the climb it came, so the tower is the plays themselves.
const AT_BGGID = 268504;
// A play joins the latest climb of the same table (2+ of them, within a
// month) unless it's that climb's first fight again (a new climb). The same
// fight twice in a row is a retry on its floor; anything else is the next
// floor up, won or lost (the campaign goes on after a lost chapter).
function _atClimbs(plays) {
  const climbs = [];
  for (const p of _gbAsc(plays)) {
    const boss = _gbParts(p.b)[0];
    if (!boss) continue;
    const who = new Set(p.sc.map(s => _gbCanon(s.n)));
    const cur = climbs.slice().reverse().find(c => {
      const last = c.steps[c.steps.length - 1];
      const shared = [...who].filter(n => last.who.has(n)).length;
      return shared >= Math.min(2, who.size, last.who.size) && (Date.parse(p.date) - Date.parse(last.p.date)) / 864e5 <= 31
        && !(boss === c.first && last.boss !== boss);
    });
    if (!cur) { climbs.push({ first: boss, steps: [{ p, boss, who, floor: 1 }] }); continue; }
    const last = cur.steps[cur.steps.length - 1];
    cur.steps.push({ p, boss, who, floor: last.boss === boss ? last.floor : last.floor + 1 });
  }
  return climbs;
}
gbRegister(AT_BGGID, {
  board: (game, mine, all) => {
    const climbs = _atClimbs(mine);
    const floors = {};
    for (const c of _atClimbs(all)) for (const s of c.steps) (floors[s.floor] = floors[s.floor] || new Set()).add(s.boss);
    const top = Math.max(1, ...Object.keys(floors).map(Number));
    const me = _gbMe();
    const mineAt = {};
    for (const c of climbs) for (const s of c.steps) {
      const r = mineAt[`${s.floor}|${s.boss}`] = mineAt[`${s.floor}|${s.boss}`] || { n: 0, w: 0, heroes: new Set() };
      r.n++; if (_gbWon(s.p)) r.w++;
      const i = _gbSeat(s.p, me); if (i >= 0 && s.p.sc[i].r) r.heroes.add(s.p.sc[i].r);
    }
    const best = Math.max(0, ...climbs.map(c => Math.max(...c.steps.filter(s => _gbWon(s.p)).map(s => s.floor), 0)));
    const rows = [];
    for (let f = top; f >= 1; f--) {
      const bosses = [...(floors[f] || [])];
      rows.push(`<div class="at-floor${f <= best ? ' won' : f === best + 1 ? ' next' : ''}"><span class="at-n">${f}</span><div class="at-bs">${bosses.map(b => {
        const r = mineAt[`${f}|${b}`];
        return `<span class="at-b${r ? (r.w ? ' won' : ' lost') : ''}" title="${_gbEsc(b)}${r ? ` · ${r.w} won of ${r.n}${r.heroes.size ? ` · as ${[...r.heroes].join(', ')}` : ''}` : ' · not fought yet'}">${_gbEsc(b)}${r ? `<small>${r.w ? '&#10003;' : '&#10007;'}${r.n > 1 ? ` ${r.n}&times;` : ''}</small>` : ''}</span>`;
      }).join('')}</div></div>`);
    }
    const climbList = climbs.slice().reverse().map(c => {
      const high = Math.max(0, ...c.steps.filter(s => _gbWon(s.p)).map(s => s.floor));
      const reached = Math.max(...c.steps.map(s => s.floor));
      const ppl = [...new Map(c.steps.flatMap(s => s.p.sc.map(x => [_gbCanon(x.n), x.n]))).values()];
      return `<div class="at-climb"><b>${_gbDate(c.steps[0].p.date)}</b><span>${ppl.map(_gbFirst).join(', ')}</span><em>${high ? `beat floor ${high}` : 'no floor beaten'}${reached > high ? ` · reached ${reached}` : ''}</em></div>`;
    }).join('');
    return `${_gbHead('&#127984; Domianne&rsquo;s Tower', climbs.length ? `best: floor ${best}` : '')}
      <div class="at-tower">${rows.join('')}<div class="at-base">The gate</div></div>
      ${climbs.length ? `<div class="gb-sub">Your climbs</div>${climbList}` : _gbNote('Your climbs show here once you&rsquo;ve played.')}
      ${_gbNote('Floors are how far up each climb the fight came; where the tower branches, both fights share the floor.')}`;
  },
  picker: () => ({ fields: [{ key: 'boss', label: 'Fight', optional: true, none: 'Another (type it below)', options: () => {
    const fl = {};
    for (const c of _atClimbs(PLAY_HISTORY[AT_BGGID] || [])) for (const s of c.steps) if (!(s.boss in fl)) fl[s.boss] = s.floor;
    return Object.keys(fl).sort((a, b) => fl[a] - fl[b]).map(b => [b, `${fl[b]} · ${b}`]);
  } }] }),
});

// ════════════════════════════ 7 Wonders Architects: the wonders ════════════════════════════
const W7A_BGGID = 346703;
const W7A_WONDERS = [['Alexandria', '&#9875;'], ['Babylon', '&#127807;'], ['Ephesus', '&#127963;&#65039;'], ['Gizah', '&#128314;'], ['Halicarnassus', '&#9904;&#65039;'], ['Olympia', '&#9889;'], ['Rhodes', '&#128509;']];
gbRegister(W7A_BGGID, {
  board: (game, mine, all) => {
    const me = _gbMe();
    const stat = (plays, onlyMe) => {
      const by = {};
      for (const p of plays) p.sc.forEach((s, i) => {
        if (onlyMe && !(s.n === me || _gbCanon(s.n) === _gbCanon(me))) return;
        const w = W7A_WONDERS.find(([n]) => _gbNorm(n) === _gbNorm(s.r));
        if (!w) return;
        const r = by[w[0]] = by[w[0]] || { n: 0, w: 0, best: null };
        r.n++; if (s.w) r.w++;
        const v = _gbScore(s); if (v != null && (r.best == null || v > r.best)) r.best = v;
      });
      return by;
    };
    const mineBy = stat(mine, true), allBy = stat(all, false);
    const cards = W7A_WONDERS.map(([n, ic]) => {
      const r = mineBy[n], a = allBy[n];
      return `<div class="w7-c${r ? (r.w ? ' won' : ' played') : ''}"><span class="w7-ic" aria-hidden="true">${ic}</span><b>${n}</b>
          <span>${r ? `${r.n}&times; · ${r.w} won${r.best != null ? ` · best ${_gbNum(r.best)}` : ''}` : 'not built yet'}</span>
          ${a ? `<small>everyone: ${Math.round(a.w / a.n * 100)}% won of ${a.n}</small>` : ''}</div>`;
    }).join('');
    const built = W7A_WONDERS.filter(([n]) => mineBy[n]).length, wonWith = W7A_WONDERS.filter(([n]) => (mineBy[n] || {}).w).length;
    return `${_gbHead('&#127963;&#65039; The seven wonders', `${wonWith} won with · ${built} built`)}<div class="w7-grid">${cards}</div>`;
  },
});

// ════════════════════════════ Hanabi: the fireworks ════════════════════════════
// Every scored game a firework over the night, as big as its score, and the
// rulebook's verdict on the best.
const HANABI_BGGID = 98778;
const HANABI_SCALE = [[5, 'horrible, booed by the crowd'], [10, 'mediocre, a hint of scattered applause'], [15, 'an honorable attempt, but quickly forgotten'],
  [20, 'excellent, crowd pleasing'], [24, 'amazing: they’ll be talking about it for weeks'], [25, 'legendary: everyone left speechless']];
const _hanabiSays = (v) => (HANABI_SCALE.find(([m]) => v <= m) || HANABI_SCALE[5])[1];
gbRegister(HANABI_BGGID, {
  board: (game, mine) => {
    const me = _gbMe();
    const shows = _gbAsc(mine).map(p => ({ p, v: _gbScore(p.sc[Math.max(0, _gbSeat(p, me))]) })).filter(x => x.v != null);
    if (!shows.length) return `${_gbHead('&#127878; Fireworks')}${_gbNote('Your fireworks go up here once you&rsquo;ve scored a game.')}`;
    const best = shows.reduce((b, x) => (x.v > b.v ? x : b), shows[0]);
    const W = 320, H = 150, colours = ['#f0544f', '#f5c242', '#4fb3f0', '#5ad68a', '#f4ece1'];
    const bursts = shows.map((x, k) => {
      const cx = shows.length > 1 ? 30 + k / (shows.length - 1) * (W - 60) : W / 2;
      const cy = 40 + ((k * 37) % 50);
      const r = 6 + x.v / 25 * 30;
      const col = colours[k % colours.length];
      const rays = Array.from({ length: 12 }, (_, i) => {
        const a = i / 12 * Math.PI * 2;
        return `<line x1="${(cx + Math.cos(a) * r * 0.25).toFixed(1)}" y1="${(cy + Math.sin(a) * r * 0.25).toFixed(1)}" x2="${(cx + Math.cos(a) * r).toFixed(1)}" y2="${(cy + Math.sin(a) * r).toFixed(1)}"/>`;
      }).join('');
      return `<g class="hb-burst${x === best ? ' best' : ''}" style="--c:${col};--d:${(k * 0.25).toFixed(2)}s"><title>${_gbDate(x.p.date)} · ${_gbNum(x.v)} points</title>
          <line class="hb-trail" x1="${cx.toFixed(1)}" y1="${H}" x2="${cx.toFixed(1)}" y2="${(cy + r).toFixed(1)}"/>${rays}<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.2"/>
          <text x="${cx.toFixed(1)}" y="${(cy + r + 11).toFixed(1)}">${_gbNum(x.v)}</text></g>`;
    }).join('');
    const zero = shows.filter(x => x.v === 0).length;
    return `${_gbHead('&#127878; Fireworks', `best ${_gbNum(best.v)} / 25`)}
      <svg class="hb-sky" viewBox="0 0 ${W} ${H}" role="img" aria-label="Your Hanabi scores as fireworks">${bursts}</svg>
      <div class="hb-say"><b>${_gbNum(best.v)}</b>: ${_gbEsc(_hanabiSays(best.v))} <small>(${_gbDate(best.p.date)}, the rulebook&rsquo;s scale)</small></div>
      ${zero ? _gbNote(`${zero} game${zero > 1 ? 's' : ''} at 0: the fuse burned down.`) : ''}`;
  },
});

// ════════════════════════════ Mind MGMT: the two sides ════════════════════════════
const MIND_BGGID = 284653;
gbRegister(MIND_BGGID, {
  board: (game, mine) => {
    const me = _gbMe();
    const side = (s) => (/recruit/i.test(s.r || '') ? 'Recruiter' : /agent/i.test(s.r || '') ? 'Agents' : null);
    let rec = 0, ag = 0;
    const you = { Recruiter: { n: 0, w: 0 }, Agents: { n: 0, w: 0 } };
    const recruiters = new Map();
    for (const p of mine) {
      const winners = p.sc.filter(s => s.w).map(side);
      if (winners.includes('Recruiter')) rec++; else if (winners.includes('Agents')) ag++;
      const i = _gbSeat(p, me);
      if (i >= 0) { const sd = side(p.sc[i]); if (sd) { you[sd].n++; if (p.sc[i].w) you[sd].w++; } }
      const r = p.sc.find(s => side(s) === 'Recruiter');
      if (r) { const x = recruiters.get(_gbCanon(r.n)) || { name: r.n, n: 0, w: 0 }; x.n++; if (r.w) x.w++; recruiters.set(_gbCanon(r.n), x); }
    }
    if (!mine.length) return `${_gbHead('&#129504; Recruiter vs Agents')}${_gbNote('Your games show here once you&rsquo;ve played.')}`;
    const tot = rec + ag || 1;
    return `${_gbHead('&#129504; Recruiter vs Agents', `${mine.length} games`)}
      <div class="mind-bar"><span class="rec" style="width:${(rec / tot * 100).toFixed(1)}%">Recruiter ${rec}</span><span class="ag" style="width:${(ag / tot * 100).toFixed(1)}%">Agents ${ag}</span></div>
      <div class="gb-stats">
        <div class="pb-stat"><b>${you.Recruiter.w}<small>/${you.Recruiter.n}</small></b><span>You as the Recruiter</span></div>
        <div class="pb-stat"><b>${you.Agents.w}<small>/${you.Agents.n}</small></b><span>You with the Agents</span></div>
      </div>
      <div class="gb-sub">Recruiters</div>
      ${[...recruiters.values()].sort((a, b) => b.w - a.w || b.n - a.n).map(r => `<div class="mind-r"><b>${_gbEsc(r.name)}</b><span>${r.w} won of ${r.n}</span></div>`).join('')}`;
  },
});
