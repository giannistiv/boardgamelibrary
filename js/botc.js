// ── Blood on the Clocktower: the Town Square tab on its game page ──
// The user, 15 Nov 2026: "check what you can do about Blood on the
// Clocktower… dig deep". What the game needs that a plain play doesn't:
//   - a team result: Good (Townsfolk, Outsiders) against Evil (Minions, the
//     Demon); everyone wins or loses with their team, as it stands at the end
//     (a Goon, a Cult Leader, a Snake Charmer… can change a player's team);
//   - a character per seat from the game's script, the Drunk (and Lunatic,
//     Marionette) with the character they thought they were ("Drunk／Investigator");
//   - the Storyteller, in the game but neither winning nor losing.
// A game is an ordinary play: b the script ("Trouble Brewing"), sc[i].r the
// character, sc[i].w the result, sc[i].tm 'Good' or 'Evil' (the team at the
// end), the Storyteller's seat r 'Storyteller'. Older plays without tm are read
// from their characters and stars. Characters: data/botc.js (the official
// list); what they do is on the official wiki, linked from here.

const BOTC_BGGID = 240980;
const BOTC_SCRIPTS = [['tb', 'Trouble Brewing'], ['bmr', 'Bad Moon Rising'], ['snv', 'Sects & Violets'], ['all', 'Another script']];
const BOTC_TEAMS = {   // [one, several, colour]
  t: ['Townsfolk', 'Townsfolk', '#2f7dff'], o: ['Outsider', 'Outsiders', '#33bfe0'],
  m: ['Minion', 'Minions', '#ff7a2a'], d: ['Demon', 'Demon', '#e0282e'], v: ['Traveller', 'Travellers', '#a66be0'],
};
// Townsfolk, Outsiders, Minions, Demons for 5 to 15 players (the setup sheet)
const BOTC_COUNTS = { 5: [3, 0, 1, 1], 6: [3, 1, 1, 1], 7: [5, 0, 1, 1], 8: [5, 1, 1, 1], 9: [5, 2, 1, 1], 10: [7, 0, 2, 1],
  11: [7, 1, 2, 1], 12: [7, 2, 2, 1], 13: [9, 0, 3, 1], 14: [9, 1, 3, 1], 15: [9, 2, 3, 1] };
// who thinks they're someone else, and what kind of character they think they are
const BOTC_THINKS = { drunk: 't', lunatic: 'd', marionette: 'to' };
const BOTC_ALIAS = { gravedigger: 'undertaker' };   // a name some plays use for the Undertaker
const BOTC_WIKI = 'https://wiki.bloodontheclocktower.com/';
// The official icons, one per character in BOTC_CHARS order, on a grid of
// BOTC_TOKEN_COLS in images/botc/tokens.jpg (tools/build-botc-tokens.py).
const BOTC_TOKEN_N = 156, BOTC_TOKEN_COLS = 13;

let _bcTab = 'games';     // 'games' | 'stats' | 'setup'
let _bcLog = null;        // a game being logged: { script, scriptName, st, seats: [{n, c, thinks, flip, trav}], win, date, l }
let _bcPick = null;       // the seat whose character list is open: { i, thinks }
let _bcOpen = null;       // the game whose details are open (its key)
let _bcSetupScript = 'tb';
let _bcPanel = null;

const _bcNorm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const _bcCanon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
const _bcMe = () => (typeof _navPlayer === 'function' ? _navPlayer() : null);
const _bcToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
let _bcIdx = null;
function _bcChars() {
  if (!_bcIdx) {
    _bcIdx = new Map();
    (typeof BOTC_CHARS !== 'undefined' ? BOTC_CHARS : []).forEach(([id, name, team, ed, setup], i) => {
      const c = { id, name, team, ed, setup, i };
      _bcIdx.set(id, c);
      _bcIdx.set(_bcNorm(name), c);
    });
  }
  return _bcIdx;
}
const _bcChar = (idOrName) => { const k = _bcNorm(idOrName); return _bcChars().get(BOTC_ALIAS[k] || k) || null; };
const _bcList = (script) => (typeof BOTC_CHARS !== 'undefined' ? BOTC_CHARS : []).map(r => _bcChar(r[0])).filter(c => script === 'all' || c.ed === script || (c.team === 'v' && c.ed === script));
const _bcBase = (c) => (!c ? null : c.team === 't' || c.team === 'o' ? 'good' : c.team === 'm' || c.team === 'd' ? 'evil' : null);
const _bcOther = (a) => (a === 'good' ? 'evil' : a === 'evil' ? 'good' : null);
const _bcWikiOf = (c) => BOTC_WIKI + encodeURIComponent(c.name.replace(/ /g, '_'));
const _bcScriptName = (k) => (BOTC_SCRIPTS.find(s => s[0] === k) || [k, k])[1];
function _bcShort(name) {
  const w = String(name).split(/[\s-]+/).filter(Boolean);
  if (name.length <= 4) return name;
  return w.length > 1 ? (w[0][0] + w[1][0]).toUpperCase() : name.slice(0, 2);
}

// ── A play read as a game ──
function _bcPlays() {
  return (PLAY_HISTORY[BOTC_BGGID] || []).filter(p => p && p.date && Array.isArray(p.sc) && p.sc.length).slice().sort(byPlayOrder);
}
const _bcKey = (p) => String(p.mp || p._uuid || p.e || p.t || p.date);
function _bcGame(p) {
  const st = [], seats = [];
  for (const s of p.sc) {
    if (!s || !s.n) continue;
    if (typeof isNoResultSeat === 'function' && isNoResultSeat(s)) { st.push(s.n); continue; }
    const [main, thought] = String(s.r || '').split(/\s*[／|]\s*/);
    const c = _bcChar(main), th = thought ? _bcChar(thought) : null;
    seats.push({ n: s.n, c, raw: s.r || '', thinks: th, w: !!s.w, tm: s.tm ? String(s.tm).toLowerCase() : '' });
  }
  // who won: the team written with the play, else the team of the stars' characters
  let win = null;
  const tmWin = seats.find(x => x.w && (x.tm === 'good' || x.tm === 'evil'));
  if (tmWin) win = tmWin.tm;
  else {
    let g = 0, e = 0;
    for (const x of seats) if (x.w) { const b = _bcBase(x.c); if (b === 'good') g++; else if (b === 'evil') e++; }
    win = g > e ? 'good' : e > g ? 'evil' : null;
  }
  for (const x of seats) {
    x.base = _bcBase(x.c);
    x.align = x.tm === 'good' || x.tm === 'evil' ? x.tm : win ? (x.w ? win : _bcOther(win)) : x.base;
    x.flipped = !!(x.base && x.align && x.base !== x.align);
  }
  // its script: written, else the one edition all its characters come from
  let script = BOTC_SCRIPTS.find(s => _bcNorm(s[1]) === _bcNorm(p.b)) ? BOTC_SCRIPTS.find(s => _bcNorm(s[1]) === _bcNorm(p.b))[0] : null;
  let scriptName = p.b || '';
  if (!script && !p.b) {
    const eds = new Set(seats.map(x => x.c && x.c.team !== 'v' ? x.c.ed : null).filter(Boolean));
    if (eds.size === 1 && !eds.has('carousel')) { script = [...eds][0]; scriptName = _bcScriptName(script); }
  }
  return { p, st, seats, win, script, scriptName, players: seats.filter(x => !(x.c && x.c.team === 'v')).length };
}

// ── Stats ──
function _bcStats() {
  const games = _bcPlays().map(_bcGame);
  const people = new Map(), chars = new Map();
  let good = 0, evil = 0;
  const byScript = {};
  const person = (n) => {
    const k = _bcCanon(n);
    if (!people.has(k)) people.set(k, { n, games: 0, gw: 0, gl: 0, ew: 0, el: 0, demon: 0, st: 0, chars: new Map() });
    return people.get(k);
  };
  for (const g of games) {
    if (g.win === 'good') good++; else if (g.win === 'evil') evil++;
    const sk = g.scriptName || 'Unknown script';
    const bs = byScript[sk] = byScript[sk] || { good: 0, evil: 0 };
    if (g.win) bs[g.win]++;
    for (const n of g.st) { const P = person(n); P.st++; }
    for (const x of g.seats) {
      const P = person(x.n);
      P.games++;
      if (x.align === 'good') { if (x.w) P.gw++; else P.gl++; }
      else if (x.align === 'evil') { if (x.w) P.ew++; else P.el++; }
      if (x.c) {
        if (x.c.team === 'd') P.demon++;
        P.chars.set(x.c.name, (P.chars.get(x.c.name) || 0) + 1);
        const C = chars.get(x.c.id) || { c: x.c, n: 0, w: 0 };
        C.n++; if (x.w) C.w++;
        chars.set(x.c.id, C);
      }
    }
  }
  return { games, people: [...people.values()], chars, good, evil, byScript };
}

// ── The tab ──
function buildBotcHtml(game) {
  if (!game || Number(game.bggId) !== BOTC_BGGID) return '';
  return '<div class="rv bc" data-bc></div>';
}
function wireBotc(content) {
  const panel = content.querySelector('[data-bc]');
  if (!panel) return;
  _bcPanel = panel;
  panel.addEventListener('click', (ev) => _bcClick(panel, ev));
  panel.addEventListener('input', (ev) => _bcInput(panel, ev));
  panel.addEventListener('change', (ev) => _bcChange(panel, ev));
  _bcRender(panel);
}
function _bcRender(panel) {
  _bcPanel = panel;
  const tabs = [['games', 'Games'], ['stats', 'Good & Evil'], ['setup', 'Setup']];
  const body = _bcTab === 'stats' ? _bcStatsHtml() : _bcTab === 'setup' ? _bcSetupHtml() : _bcGamesHtml();
  const signed = typeof acctMe === 'function' && acctMe();
  panel.innerHTML = `
    ${_bcLog ? _bcLogHtml() : `<div class="dt-top">${signed ? '<button type="button" class="rv-btn" data-bc-new>Log a game</button>' : ''}
      <span class="rv-hint">${signed ? 'The script, a character for each seat, and which team won: the stars and the teams follow.' : 'Sign in to log a game.'}</span></div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_bcTab === k ? ' on' : ''}" data-bc-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body">${body}</div>
    <div class="rv-toast" hidden></div>
    <div class="rv-credit">The characters are the official list; tap one for what it does, on the <a href="${BOTC_WIKI}" target="_blank" rel="noopener">official wiki</a>.</div>`;
  _bcWire(panel);
}
function _bcToast(msg, ok) {
  const el = document.querySelector('.bc .rv-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('ok', !!ok);
  el.hidden = false;
  clearTimeout(_bcToast.t);
  _bcToast.t = setTimeout(() => { el.hidden = true; }, 6000);
}

// A character token: the character's own icon on parchment, ringed in its
// team's colour; its initials when there's no icon for it.
function _bcToken(c, cls) {
  const T = c ? BOTC_TEAMS[c.team] : null;
  const k = `bc-tok${cls ? ' ' + cls : ''}`, col = `--bc-c:${T ? T[2] : '#666'}`;
  if (c && c.i < BOTC_TOKEN_N) {
    const rows = Math.ceil(BOTC_TOKEN_N / BOTC_TOKEN_COLS);
    const x = (c.i % BOTC_TOKEN_COLS) / (BOTC_TOKEN_COLS - 1) * 100, y = Math.floor(c.i / BOTC_TOKEN_COLS) / (rows - 1) * 100;
    return `<span class="${k} ic" role="img" aria-label="${_escapeHtml(c.name)}" title="${_escapeHtml(c.name)}" style="${col};background-position:${+x.toFixed(3)}% ${+y.toFixed(3)}%"></span>`;
  }
  return `<span class="${k}" style="${col}">${c ? _escapeHtml(_bcShort(c.name)) : '?'}</span>`;
}

// ── The games, each as its town square ──
function _bcGamesHtml() {
  const esc = _escapeHtml;
  const games = _bcPlays().map(_bcGame).reverse();
  if (!games.length) return '<div class="cr-note">No games logged yet.</div>';
  return games.map(g => {
    const key = _bcKey(g.p);
    const open = _bcOpen === key;
    const n = g.seats.length;
    const seats = g.seats.map((x, i) => {
      const a = (i / n) * 2 * Math.PI;
      const left = 50 + 40 * Math.sin(a), top = 50 - 40 * Math.cos(a);
      return `<span class="bc-seat${x.w ? ' won' : ''}${x.align === 'evil' ? ' evil' : ''}" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%">
        ${_bcToken(x.c)}${x.flipped ? '<i class="bc-flip" title="Ended on the other team">&#8644;</i>' : ''}
        <b>${esc(x.n)}</b><small>${esc(x.c ? x.c.name : x.raw || '?')}${x.thinks ? ` <em>(${esc(x.thinks.name)})</em>` : ''}</small></span>`;
    }).join('');
    const from = (PLAY_HISTORY[BOTC_BGGID] || []).indexOf(g.p);
    const acts = (from >= 0 && typeof bgsSendBtnHtml === 'function' ? bgsSendBtnHtml(BOTC_BGGID, from) : '') + (g.p.mp && typeof logPlayEditBtnHtml === 'function' ? logPlayEditBtnHtml(g.p) : '');
    const demon = g.seats.find(x => x.c && x.c.team === 'd');
    return `<div class="bc-game${g.win ? ' ' + g.win : ''}">
      <div class="bc-game-head"><b>${esc(_bcDate(g.p.date))}</b><span>${esc(g.scriptName || 'Script not noted')} · ${g.players} players${g.p.l ? ` · ${esc(g.p.l)}` : ''}</span><span class="cl-acts">${acts}</span></div>
      <div class="bc-square n${Math.min(20, n)}">
        ${seats}
        <div class="bc-centre"><span class="bc-clock" aria-hidden="true"></span>
          <span class="bc-res">${g.win === 'good' ? 'Good won' : g.win === 'evil' ? 'Evil won' : 'No result'}</span>
          ${g.st.length ? `<small>Storyteller<br>${g.st.map(esc).join(', ')}</small>` : ''}</div>
      </div>
      <button type="button" class="rv-link bc-more" data-bc-open="${esc(key)}" aria-expanded="${open}">${open ? 'Less' : 'Each seat'}</button>
      ${open ? `<ul class="bc-list">${g.seats.map(x => `<li class="${x.align || ''}">${_bcToken(x.c)}<span class="bc-li"><b>${esc(x.n)}</b>
          <span>${x.c ? `<a href="${_bcWikiOf(x.c)}" target="_blank" rel="noopener">${esc(x.c.name)}</a>` : esc(x.raw || '?')}${x.thinks ? `, thought they were the ${esc(x.thinks.name)}` : ''}${x.flipped ? `, ended ${x.align}` : ''}</span></span>
          <em>${x.w ? '&#9733; won' : 'lost'}</em></li>`).join('')}</ul>
        ${demon ? `<div class="rv-hint">${g.win === 'evil' ? `The ${esc(demon.c.name)} (${esc(demon.n)}) got away with it.` : `The ${esc(demon.c.name)} was ${esc(demon.n)}.`}</div>` : ''}` : ''}
    </div>`;
  }).join('');
}
function _bcDate(d) {
  return new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Good & Evil: the record, each player's, each character's ──
function _bcStatsHtml() {
  const esc = _escapeHtml;
  const S = _bcStats();
  if (!S.games.length) return '<div class="cr-note">No games logged yet.</div>';
  const total = S.good + S.evil || 1;
  const me = _bcMe();
  const mine = me ? S.people.find(P => _bcCanon(P.n) === _bcCanon(me)) : null;
  const rec = (w, l) => `${w}&ndash;${l}`;
  const pct = (w, l) => (w + l ? `${Math.round((w / (w + l)) * 100)}%` : '');
  const players = S.people.slice().sort((a, b) => (b.games + b.st) - (a.games + a.st) || a.n.localeCompare(b.n));
  const scripts = Object.entries(S.byScript);
  const eds = new Set(S.games.map(g => g.script).filter(s => s && s !== 'all'));
  const charGroups = [...eds].map(ed => {
    const list = _bcList(ed).filter(c => c.team !== 'v');
    return `<div class="rv-sub">${esc(_bcScriptName(ed))}</div><div class="bc-chars">${list.map(c => {
      const C = S.chars.get(c.id);
      return `<a class="bc-char${C ? '' : ' none'}" href="${_bcWikiOf(c)}" target="_blank" rel="noopener" title="${esc(c.name)}: ${C ? `${C.n} game${C.n === 1 ? '' : 's'}, ${C.w} won` : 'not played yet'}">
        ${_bcToken(c)}<span>${esc(c.name)}</span><small>${C ? `${C.n}&times; · ${C.w} won` : '–'}</small></a>`;
    }).join('')}</div>`;
  }).join('');
  return `<div class="bc-bar"><span class="good" style="width:${(S.good / total) * 100}%">Good ${S.good}</span><span class="evil" style="width:${(S.evil / total) * 100}%">Evil ${S.evil}</span></div>
    ${scripts.length > 1 ? `<div class="bc-scripts">${scripts.map(([k, v]) => `<span>${esc(k)}: Good ${v.good} · Evil ${v.evil}</span>`).join('')}</div>` : ''}
    ${mine ? `<div class="bc-me"><b>${esc(mine.n)}</b>
      <span>As Good <b>${rec(mine.gw, mine.gl)}</b> ${pct(mine.gw, mine.gl)}</span>
      <span>As Evil <b>${rec(mine.ew, mine.el)}</b> ${pct(mine.ew, mine.el)}</span>
      ${mine.demon ? `<span>The Demon ${mine.demon}&times;</span>` : ''}${mine.st ? `<span>Storyteller ${mine.st}&times;</span>` : ''}
      ${mine.chars.size ? `<small>${[...mine.chars.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${esc(c)}${n > 1 ? ` &times;${n}` : ''}`).join(' · ')}</small>` : ''}</div>` : ''}
    <div class="rv-sub">Everyone</div>
    <div class="bc-table"><div class="bc-tr bc-th"><span></span><span>Good</span><span>Evil</span><span>Demon</span><span>Story&shy;teller</span></div>
      ${players.map(P => `<div class="bc-tr${mine && P === mine ? ' me' : ''}"><b>${esc(P.n)}</b><span>${P.gw + P.gl ? rec(P.gw, P.gl) : '–'}</span><span>${P.ew + P.el ? rec(P.ew, P.el) : '–'}</span><span>${P.demon || '–'}</span><span>${P.st || '–'}</span></div>`).join('')}</div>
    <div class="rv-hint">Wins&ndash;losses on each team, as it stood at the end of the game.</div>
    ${charGroups}`;
}

// ── Setup: how many of each, by the number of players ──
function _bcSetupHtml() {
  const esc = _escapeHtml;
  const sc = _bcSetupScript;
  const mods = _bcList(sc).filter(c => c.setup || BOTC_THINKS[c.id]);
  return `<div class="bc-setup">
    <div class="bc-ctable"><div class="bc-cr bc-ch"><span>Players</span>${['t', 'o', 'm', 'd'].map(t => `<span style="color:${BOTC_TEAMS[t][2]}">${BOTC_TEAMS[t][1]}</span>`).join('')}</div>
      ${Object.entries(BOTC_COUNTS).map(([n, c]) => `<div class="bc-cr"><b>${n}</b>${c.map(x => `<span>${x}</span>`).join('')}</div>`).join('')}</div>
    <div class="rv-hint">Plus the Storyteller. Over 15 players, the extra ones play Travellers (up to 5); the Storyteller decides each Traveller’s team. Trouble Brewing works from 5 players, the other editions from 7.</div>
    <div class="rv-sub">Characters that change it</div>
    <div class="dt-res">${BOTC_SCRIPTS.map(([k, l]) => `<button type="button" class="cl-chip${sc === k ? ' on' : ''}" data-bc-sscript="${k}">${esc(l === 'Another script' ? 'All characters' : l)}</button>`).join('')}</div>
    <ul class="bc-mods">${mods.map(c => `<li>${_bcToken(c)}<a href="${_bcWikiOf(c)}" target="_blank" rel="noopener">${esc(c.name)}</a>
      <span>${c.id === 'drunk' ? 'isn’t handed out: the player gets a Townsfolk token and thinks they’re that' : c.id === 'lunatic' ? 'thinks they’re the Demon' : c.setup ? `[${esc(c.setup)}]` : 'changes the setup (see its page)'}</span></li>`).join('') || '<li>None in this script.</li>'}</ul>
  </div>`;
}

// ── Logging a game ──
function _bcLast() { return _bcPlays().map(_bcGame).slice(-1)[0] || null; }
function _bcStart() {
  const last = _bcLast();
  _bcLog = {
    script: last && last.script ? last.script : 'tb', scriptName: last && !last.script ? last.scriptName : '',
    st: last && last.st[0] ? last.st[0] : '',
    seats: last ? last.seats.map(x => ({ n: x.n, c: '', thinks: '', flip: false, trav: '' })) : (_bcMe() ? [{ n: _bcMe(), c: '', thinks: '', flip: false, trav: '' }] : []),
    win: '', date: _bcToday(), l: (last && last.p.l) || (typeof _lpPlaces === 'function' ? _lpPlaces()[0] : '') || '',
  };
  _bcPick = null;
}
function _bcSeatAlign(x) {
  const c = _bcChar(x.c);
  if (!c) return null;
  if (c.team === 'v') return x.trav || null;
  const b = _bcBase(c);
  return x.flip ? _bcOther(b) : b;
}
function _bcLogHtml() {
  const esc = _escapeHtml;
  const L = _bcLog;
  const list = _bcList(L.script);
  const players = L.seats.filter(x => { const c = _bcChar(x.c); return !(c && c.team === 'v'); }).length;
  const want = BOTC_COUNTS[players];
  const have = { t: 0, o: 0, m: 0, d: 0 };
  for (const x of L.seats) { const c = _bcChar(x.c); if (c && have[c.team] !== undefined) have[c.team]++; }
  const mods = L.seats.map(x => _bcChar(x.c)).filter(c => c && c.setup);
  const counts = want ? `<div class="bc-count">${['t', 'o', 'm', 'd'].map((t, i) =>
      `<span class="${have[t] === want[i] ? 'ok' : ''}" style="--bc-c:${BOTC_TEAMS[t][2]}">${BOTC_TEAMS[t][1]} <b>${have[t]}/${want[i]}</b></span>`).join('')}
      ${mods.length ? `<small>${mods.map(c => `${esc(c.name)}: ${esc(c.setup)}`).join(' · ')}</small>` : ''}</div>`
    : `<div class="bc-count"><small>${players < 5 ? 'Five players at least.' : 'Over 15: the extra players are Travellers.'}</small></div>`;
  const taken = new Set(L.seats.map(x => x.c).filter(Boolean));
  const seats = L.seats.map((x, i) => {
    const c = _bcChar(x.c), th = _bcChar(x.thinks);
    const al = _bcSeatAlign(x);
    const picking = _bcPick && _bcPick.i === i;
    return `<div class="bc-lseat${al ? ' ' + al : ''}">
      <div class="bc-lseat-top">
        <b>${esc(x.n)}</b>
        <button type="button" class="bc-pickbtn" data-bc-pick="${i}" aria-expanded="${!!(picking && !_bcPick.thinks)}">${c ? `${_bcToken(c)} ${esc(c.name)}` : 'Character…'}</button>
        <button type="button" class="cr-person-x" data-bc-out="${i}" aria-label="Take ${esc(x.n)} off">&times;</button></div>
      ${c && BOTC_THINKS[c.id] ? `<button type="button" class="rv-link bc-thinks" data-bc-thinks="${i}">${th ? `thought they were the ${esc(th.name)}` : `thought they were…`}</button>` : ''}
      ${c && c.team === 'v' ? `<div class="bc-trav">On the team of ${['good', 'evil'].map(a => `<button type="button" class="cl-chip${x.trav === a ? ' on' : ''}" data-bc-trav="${i}|${a}">${a === 'good' ? 'Good' : 'Evil'}</button>`).join('')}</div>`
        : c ? `<label class="bc-flipl"><input type="checkbox" data-bc-flip="${i}"${x.flip ? ' checked' : ''}> Ended on the other team (${_bcOther(_bcBase(c))})</label>` : ''}
      ${picking ? _bcPickerHtml(i, _bcPick.thinks ? (list.filter(k => BOTC_THINKS[c ? c.id : ''] && BOTC_THINKS[c.id].includes(k.team))) : list, taken, _bcPick.thinks) : ''}
    </div>`;
  }).join('');
  const missing = L.seats.filter(x => !_bcChar(x.c) || (_bcChar(x.c).team === 'v' && !x.trav)).map(x => x.n);
  const ready = L.seats.length >= 2 && !missing.length && !!L.win && !!L.date;
  return `<div class="dt-log bc-log">
    <div class="dt-log-title">Log a game</div>
    <div class="rv-sub">Script</div>
    <div class="dt-res">${BOTC_SCRIPTS.map(([k, l]) => `<button type="button" class="cl-chip${L.script === k ? ' on' : ''}" data-bc-script="${k}">${esc(l)}</button>`).join('')}</div>
    ${L.script === 'all' ? `<input class="rv-in bc-sname" data-bc-sname value="${esc(L.scriptName)}" placeholder="The script’s name (optional)" maxlength="60">` : ''}
    <div class="rv-sub">Storyteller</div>
    <input class="rv-in" data-bc-st value="${esc(L.st)}" placeholder="Who ran it" maxlength="40">
    <div class="rv-sub">Around the table <span class="cr-count">${L.seats.length}</span></div>
    ${counts}
    <div class="bc-lseats">${seats}</div>
    <input class="rv-in cr-who" data-bc-add placeholder="Add a player" maxlength="40" enterkeyhint="done">
    <div class="rv-sub">Who won</div>
    <div class="bc-win"><button type="button" class="bc-wbtn good${L.win === 'good' ? ' on' : ''}" data-bc-win="good">Good won</button><button type="button" class="bc-wbtn evil${L.win === 'evil' ? ' on' : ''}" data-bc-win="evil">Evil won</button></div>
    <div class="rv-fields pc-fields">
      <label class="rv-field"><span>Date</span><input type="date" class="rv-in" data-bc-date value="${esc(L.date)}" max="${_bcToday()}"></label>
      <label class="rv-field"><span>Where</span><input class="rv-in" data-bc-where value="${esc(L.l)}" placeholder="Optional" maxlength="60"></label>
    </div>
    ${missing.length ? `<div class="rv-hint">Still to pick: ${missing.map(esc).join(', ')}.</div>` : ''}
    <div class="cl-log-acts"><button type="button" class="rv-btn" data-bc-save${ready ? '' : ' disabled'}>Save the game</button><button type="button" class="rv-link" data-bc-cancel>Cancel</button></div>
  </div>`;
}
function _bcPickerHtml(i, list, taken, thinks) {
  const esc = _escapeHtml;
  const L = _bcLog;
  const groups = ['t', 'o', 'm', 'd', 'v'].map(t => {
    const cs = list.filter(c => c.team === t);
    if (!cs.length) return '';
    return `<div class="bc-pg"><div class="bc-pg-h" style="color:${BOTC_TEAMS[t][2]}">${BOTC_TEAMS[t][1]}</div><div class="bc-pg-list">${cs.map(c =>
      `<button type="button" class="bc-opt${!thinks && taken.has(c.id) && L.seats[i].c !== c.id ? ' taken' : ''}${(thinks ? L.seats[i].thinks : L.seats[i].c) === c.id ? ' on' : ''}" data-bc-set="${i}|${c.id}|${thinks ? 1 : 0}">${_bcToken(c, 'sm')}<span>${esc(c.name)}</span></button>`).join('')}</div></div>`;
  }).join('');
  return `<div class="bc-picker">${L.script === 'all' ? '<input class="rv-in bc-find" data-bc-find placeholder="Find a character" maxlength="30">' : ''}${groups}</div>`;
}
async function _bcSave(panel, btn) {
  const L = _bcLog;
  if (!L || typeof logPlaySave !== 'function') return;
  const st = L.st.trim();
  const sc = L.seats.map(x => {
    const c = _bcChar(x.c), th = _bcChar(x.thinks);
    const al = _bcSeatAlign(x);
    const o = { n: x.n, w: al === L.win, r: th ? `${c.name}／${th.name}` : c.name };
    if (al) o.tm = al === 'good' ? 'Good' : 'Evil';
    return o;
  });
  if (st) sc.push({ n: st, w: false, r: 'Storyteller' });
  const rec = { bggId: BOTC_BGGID, date: L.date, t: `${L.date} ${new Date().toTimeString().slice(0, 8)}`, sc,
    b: L.script === 'all' ? (L.scriptName.trim() || 'Custom script').slice(0, 60) : _bcScriptName(L.script) };
  if (L.l.trim()) rec.l = L.l.trim().slice(0, 60);
  btn.disabled = true;
  btn.textContent = 'Saving…';
  let r;
  try { r = await logPlaySave(rec); }
  catch (e) {
    btn.disabled = false;
    btn.textContent = 'Save the game';
    _bcToast(`Not saved: ${e.message || 'check the connection and try again'}.`);
    return;
  }
  _bcLog = null;
  _bcPick = null;
  _bcTab = 'games';
  _bcOpen = r.id;
  _bcRender(panel);
  _bcToast(r.pending ? 'No signal, so it’s kept on this phone; it goes up by itself.' : `Saved: ${L.win === 'good' ? 'Good' : 'Evil'} won.`, true);
  const i = (PLAY_HISTORY[BOTC_BGGID] || []).findIndex(e => e.mp === r.id);
  if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(BOTC_BGGID, i);
}

// ── Taps and typing ──
function _bcPeople() {
  const all = new Set();
  for (const p of _bcPlays()) for (const s of p.sc) if (s && s.n) all.add(s.n);
  if (typeof _knownPlayerNames === 'function') for (const n of _knownPlayerNames()) all.add(n);
  return [...all];
}
function _bcWire(panel) {
  if (typeof comboAttach !== 'function') return;
  const add = panel.querySelector('input[data-bc-add]');
  if (add) {
    const names = () => { const taken = new Set((_bcLog ? _bcLog.seats : []).map(x => _bcCanon(x.n))); return [_bcMe(), ..._bcPeople()].filter((n, i, a) => n && a.indexOf(n) === i && !taken.has(_bcCanon(n))); };
    comboAttach(add, { options: names, onPick: (v) => _bcAddSeat(panel, v), max: 80 });
    add.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); _bcAddSeat(panel, add.value); } });
  }
  const st = panel.querySelector('input[data-bc-st]');
  if (st) comboAttach(st, { options: () => _bcPeople(), onPick: (v) => { if (_bcLog) _bcLog.st = v; st.value = v; }, max: 80 });
}
function _bcAddSeat(panel, v) {
  v = String(v || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!v || !_bcLog || _bcLog.seats.length >= 20) { _bcRender(panel); return; }
  const known = _bcPeople().find(n => n.toLowerCase() === v.toLowerCase());
  v = known || v;
  if (!_bcLog.seats.some(x => _bcCanon(x.n) === _bcCanon(v))) _bcLog.seats.push({ n: v, c: '', thinks: '', flip: false, trav: '' });
  _bcRender(panel);
  const again = panel.querySelector('input[data-bc-add]');
  if (again && !(typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches)) again.focus();
}
async function _bcClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset, L = _bcLog;
  if (ds.bcTab) { _bcTab = ds.bcTab; _bcRender(panel); return; }
  if (ds.bcOpen) { _bcOpen = _bcOpen === ds.bcOpen ? null : ds.bcOpen; _bcRender(panel); return; }
  if (ds.bcSscript) { _bcSetupScript = ds.bcSscript; _bcRender(panel); return; }
  if (ds.bcNew !== undefined) { _bcStart(); _bcRender(panel); return; }
  if (!L) return;
  if (ds.bcCancel !== undefined) { _bcLog = null; _bcPick = null; _bcRender(panel); return; }
  if (ds.bcScript) { L.script = ds.bcScript; _bcPick = null; _bcRender(panel); return; }
  if (ds.bcPick !== undefined) { const i = Number(ds.bcPick); _bcPick = _bcPick && _bcPick.i === i && !_bcPick.thinks ? null : { i, thinks: false }; _bcRender(panel); return; }
  if (ds.bcThinks !== undefined) { const i = Number(ds.bcThinks); _bcPick = _bcPick && _bcPick.i === i && _bcPick.thinks ? null : { i, thinks: true }; _bcRender(panel); return; }
  if (ds.bcSet) {
    const [i, id, th] = ds.bcSet.split('|');
    const x = L.seats[Number(i)];
    if (th === '1') {
      x.thinks = id;
      const n = L.seats.length, at = Number(i);
      const next = Array.from({ length: n - 1 }, (_, k) => (at + 1 + k) % n).find(k => !L.seats[k].c);
      _bcPick = next !== undefined ? { i: next, thinks: false } : null;
    }
    else {
      if (x.c !== id) { x.thinks = ''; x.flip = false; x.trav = ''; }
      x.c = id;
      // the Drunk, the Lunatic, the Marionette: now who they thought they were;
      // anyone else: on to the next seat still without a character (a tap a player)
      const n = L.seats.length, at = Number(i);
      const next = Array.from({ length: n - 1 }, (_, k) => (at + 1 + k) % n).find(k => !L.seats[k].c);
      _bcPick = BOTC_THINKS[id] ? { i: at, thinks: true } : next !== undefined ? { i: next, thinks: false } : null;
    }
    _bcRender(panel);
    return;
  }
  if (ds.bcTrav) { const [i, a] = ds.bcTrav.split('|'); L.seats[Number(i)].trav = a; _bcRender(panel); return; }
  if (ds.bcOut !== undefined) { L.seats.splice(Number(ds.bcOut), 1); _bcPick = null; _bcRender(panel); return; }
  if (ds.bcWin) { L.win = ds.bcWin; _bcRender(panel); return; }
  if (ds.bcSave !== undefined) { await _bcSave(panel, t); }
}
function _bcInput(panel, ev) {
  const t = ev.target, L = _bcLog;
  if (!L) return;
  if (t.matches('[data-bc-st]')) L.st = t.value;
  else if (t.matches('[data-bc-sname]')) L.scriptName = t.value;
  else if (t.matches('[data-bc-where]')) L.l = t.value;
  else if (t.matches('[data-bc-date]')) L.date = t.value;
  else if (t.matches('[data-bc-find]')) {
    const q = _bcNorm(t.value);
    panel.querySelectorAll('.bc-picker .bc-opt').forEach(b => { b.hidden = !!q && !_bcNorm(b.textContent).includes(q); });
    panel.querySelectorAll('.bc-picker .bc-pg').forEach(g => { g.hidden = ![...g.querySelectorAll('.bc-opt')].some(b => !b.hidden); });
  }
}
function _bcChange(panel, ev) {
  const t = ev.target, L = _bcLog;
  if (L && t.matches('[data-bc-flip]')) { L.seats[Number(t.dataset.bcFlip)].flip = t.checked; _bcRender(panel); }
}

// From Log a play (js/log-play.js, _lpHandoff): the people, the day and the place so far.
function botcLogFrom(ctx) {
  _bcStart();
  const names = (ctx.names || []).filter(Boolean);
  if (names.length > 1) _bcLog.seats = names.map(n => ({ n, c: '', thinks: '', flip: false, trav: '' }));
  if (ctx.st) _bcLog.st = ctx.st;
  if (ctx.date) _bcLog.date = ctx.date;
  if (ctx.l) _bcLog.l = ctx.l;
  _bcTab = 'games';
  _modalTab = 'campaign';
  _modalTabFor = BOTC_BGGID;
  const g = findGameByBggId(BOTC_BGGID);
  if (g) openModal(g);
}
