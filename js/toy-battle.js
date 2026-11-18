// ── Toy Battle: its eight Terrains (a board on the game page, a pick in Log a play) ──
// The user, 15 Nov 2026: choose the Terrain a game is played on, or let a
// random pick choose, with the game's bright toy look on its page. Names from
// Repos Production's rulebook; the special bases as the player aid gives them
// (Board Game Arena lists them), in short; each picture is the Terrain's HQ,
// from the rulebook's back page (images/toybattle).
// A play's Terrain is its scenario field: "Castle Field", maybe
// "Castle Field／No special bases" (first games play without them).

const TOY_BGGID = 434654;
const TOY_TERRAINS = [
  { k: 'castle', name: 'Castle Field', c: '#4f9d2a', base: 'Take one of your other Troops, wherever it is, back onto your rack.' },
  { k: 'pool', name: 'Tropical Pool', c: '#1f95cf', base: 'Only Troops of the values shown there can be placed on its special bases and HQ.' },
  { k: 'clouds', name: 'City of Clouds', c: '#e0a21c', base: 'Draw 1 Troop from your reserve onto your rack.' },
  { k: 'jungle', name: 'Volcanic Jungle', c: '#c2611d', base: 'Move an enemy Troop next to this base onto a base next to where it stood, ignoring the placement rules.' },
  { k: 'cemetery', name: 'Cursed Cemetery', c: '#3f6283', base: 'Take one of your Troops from the discard back onto your rack.' },
  { k: 'caribbean', name: 'Caribbean Sea', c: '#17a594', base: 'No special bases: it’s lopsided instead, with two blue HQs against one red.' },
  { k: 'metalx', name: 'Station Metal-X', c: '#6b4fd0', base: 'Troop effects don’t apply on its special bases.' },
  { k: 'battlefield', name: 'Battlefield', c: '#c9952a', base: 'Pick one of your opponent’s Troops at random: it’s frozen and can’t be placed until the next turn.' },
];
const TOY_NO_BASES = 'No special bases';

let _toySel = null;      // the Terrain picked on the board
let _toyRolling = false;

const _toyNorm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const _toyMe = () => (typeof _navPlayer === 'function' ? _navPlayer() : null);
const _toyCanon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
// The Terrain a play was on, from its scenario field.
function toyTerrainOf(p) {
  const parts = String((p && p.b) || '').split(/\s*[／|]\s*/).map(_toyNorm);
  return TOY_TERRAINS.find(t => parts.includes(_toyNorm(t.name))) || null;
}
// Each Terrain's plays and wins: always the viewer's own (none yet: every Terrain new).
function _toyStats() {
  const me = _toyMe();
  const all = (PLAY_HISTORY[TOY_BGGID] || []).filter(p => p && Array.isArray(p.sc));
  const plays = me ? all.filter(p => p.sc.some(s => s && _toyCanon(s.n) === _toyCanon(me))) : [];
  const mine = plays;
  const by = {};
  let last = null;
  for (const p of plays.slice().sort(byPlayOrder)) {
    const t = toyTerrainOf(p);
    if (!t) continue;
    const s = by[t.k] = by[t.k] || { n: 0, w: 0 };
    s.n++;
    const seat = me && p.sc.find(x => x && _toyCanon(x.n) === _toyCanon(me));
    if (seat && seat.w) s.w++;
    last = t.k;
  }
  return { by, last, mine: !!mine.length, any: plays.length };
}
// A Terrain at random: the ones played least are likelier, never the last one again.
function toyRandomTerrain() {
  const { by, last } = _toyStats();
  const pool = TOY_TERRAINS.filter(t => t.k !== last);
  const weights = pool.map(t => 1 / (1 + ((by[t.k] || {}).n || 0)));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

// ── The board on the game page ──
function buildToyBattleHtml(game) {
  if (!game || Number(game.bggId) !== TOY_BGGID) return '';
  return `<div class="toy" data-toy>${_toyInner()}</div>`;
}
function _toyInner() {
  const esc = _escapeHtml;
  const S = _toyStats();
  const sel = TOY_TERRAINS.find(t => t.k === _toySel) || null;
  const tiles = TOY_TERRAINS.map(t => {
    const s = S.by[t.k];
    const badge = s ? `${s.n}&times;${S.mine ? ` · ${s.w} won` : ''}` : (t.k === 'castle' && !S.any ? 'first game' : 'new');
    return `<button type="button" class="toy-tile${_toySel === t.k ? ' on' : ''}${s ? '' : ' fresh'}" style="--toy-c:${t.c}" data-toy-t="${t.k}" aria-pressed="${_toySel === t.k}">
      <img src="images/toybattle/${t.k}.jpg" alt="" loading="lazy">
      <span class="toy-name">${esc(t.name)}</span>
      <span class="toy-badge">${badge}</span></button>`;
  }).join('');
  const signed = typeof acctMe === 'function' && acctMe();
  const detail = sel ? `<div class="toy-sel" style="--toy-c:${sel.c}">
      <img src="images/toybattle/${sel.k}.jpg" alt="">
      <div><b>${esc(sel.name)}</b><span>${esc(sel.base)}</span>
        ${signed ? `<button type="button" class="toy-go" data-toy-log>Log a game on ${esc(sel.name)}</button>` : ''}</div></div>` : '';
  return `<div class="toy-head"><b>The Terrains</b><span>${S.mine ? 'Your games on each' : 'Pick one, or let the dice decide'}</span></div>
    <div class="toy-grid">${tiles}</div>
    <button type="button" class="toy-dice" data-toy-roll${_toyRolling ? ' disabled' : ''}><span aria-hidden="true">&#127922;</span> Random Terrain</button>
    ${detail}
    <div class="toy-note">The least-played Terrains come up most, and never the last one twice.</div>`;
}
function _toyRedraw(box) {
  if (box && box.isConnected) box.innerHTML = _toyInner();
}
function wireToyBattle(content) {
  const box = content.querySelector('[data-toy]');
  if (!box) return;
  box.addEventListener('click', (ev) => {
    const t = ev.target.closest('button');
    if (!t || !box.contains(t) || t.disabled) return;
    if (t.dataset.toyT) { _toySel = _toySel === t.dataset.toyT ? null : t.dataset.toyT; _toyRedraw(box); return; }
    if (t.dataset.toyRoll !== undefined) { _toyRoll(box); return; }
    if (t.dataset.toyLog !== undefined) {
      const sel = TOY_TERRAINS.find(x => x.k === _toySel);
      if (!sel || typeof logPlayWith !== 'function') return;
      // you and whoever you played it with last
      const me = _toyMe();
      const last = (PLAY_HISTORY[TOY_BGGID] || []).slice().sort(byPlayOrder).reverse().find(p => me && p.sc.some(s => _toyCanon(s.n) === _toyCanon(me)));
      const other = last ? last.sc.map(s => s.n).find(n => _toyCanon(n) !== _toyCanon(me)) : null;
      logPlayWith({ bggId: TOY_BGGID, names: [me, other].filter(Boolean), b: sel.name, tab: 'plays' });
    }
  });
}
// The dice: a quick run across the tiles, landing on the pick.
function _toyRoll(box) {
  const pick = toyRandomTerrain();
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  _toyRolling = true;
  const steps = reduce ? 0 : 14;
  let i = 0, at = TOY_TERRAINS.findIndex(t => t.k === _toySel);
  const tick = () => {
    if (i >= steps) {
      _toySel = pick.k;
      _toyRolling = false;
      _toyRedraw(box);
      const on = box.querySelector('.toy-tile.on');
      if (on) on.classList.add('landed');
      return;
    }
    at = (at + 1 + Math.floor(Math.random() * 3)) % TOY_TERRAINS.length;
    _toySel = TOY_TERRAINS[at].k;
    _toyRedraw(box);
    i++;
    setTimeout(tick, 45 + i * 9);
  };
  tick();
}
