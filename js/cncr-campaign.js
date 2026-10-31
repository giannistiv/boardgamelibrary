// ── Codenames: Critical Role Adventures campaign (the Campaign tab on its game page) ──
// Each party's campaign, kept in Firebase (crCampaigns/{id}) so the whole table
// can have it open during a mission: who's at the table (the GM, who can change
// from mission to mission, and the players, who run the three heroes
// together), the mission being played with its rules, the route on the map,
// the fail counter, the treasure, the shops, the items, and the three heroes'
// sheets. While the game page is open it follows the campaign as it changes
// (Firebase's event stream), so a heart lost or an XP token taken on one phone
// shows on everyone's. Each party carries on its own campaign: they're listed
// as tabs, and one opens when it's tapped (it can be stopped, and picked up
// again). Each mission won or lost is logged as a play, offered to BG Stats
// as a QR code. The heroes and each
// mission's rules are in data/cncr.js, loaded when the tab opens; the maps are
// here, since Log a play's mission list needs them too.

const CNCR_BGGID = 465849;
// A mission as the map draws it: 2A or 2B, the party picks a road; 4A-1 then
// 4A-2, two missions in one place.
const _crM = (n, place, title, more) => {
  const m = n.match(/^(\d+)([A-C]?)(?:-(\d))?$/);
  return { n, k: n.toLowerCase(), place, title, stage: Number(m[1]), branch: m[2], part: m[3] ? Number(m[3]) : 1, ...more };
};
// The three campaigns, from the campaign book: boss fights (the black word
// is the boss, guessed after the win condition), the extremely difficult
// ones, the locked ones (lock: what opens them), and the shops, each before
// a boss fight.
const CR_MAPS = [
  { key: 'taldorei', name: 'Tal\'Dorei', num: 1, color: '#a3326a', missions: [
    _crM('1', 'Whitestone', 'Guard Duty'), _crM('2A', 'Drynna', 'Fishy Clues'), _crM('2B', 'Westruun', 'Just Act Natural'),
    _crM('3', 'Stilben', 'Hidden in the Crowd', { boss: true }),
    _crM('4A', 'Syngorn', 'Knocking on Doors'), _crM('4B', 'Kymal', 'Den of Thieves'), _crM('4C', 'Byroden', 'Timely Rescue', { lock: 'unharmed', hard: true }),
    _crM('5', 'Kraghammer', 'Snooping Around'), _crM('6', 'Emon', 'A Meeting Long Overdue', { boss: true, finale: true })],
    shops: [{ k: 's1', at: 'Stilben', name: 'Dockside Market', before: 3 }, { k: 's2', at: 'Emon', name: 'Gilmore\'s Glorious Goods', before: 6 }] },
  { key: 'wildemount', name: 'Wildemount', num: 2, color: '#5f8a2e', missions: [
    _crM('1', 'Port Zoon', 'In the Name of Science'), _crM('2A', 'Ruins of Shattengrod', 'Reading Is Good for You'), _crM('2B', 'Zadash', 'It Had to Be Spiders…'),
    _crM('2C', 'Rumblecusp', 'Walk of Trust', { lock: 'map' }),
    _crM('3', 'Rexxentrum', 'Needle in the Stacks', { boss: true }),
    _crM('4A-1', 'Icehaven', 'Expedition Delayed'), _crM('4A-2', 'Icehaven', 'Through Blinding Snow'), _crM('4B', 'Uthodurn', 'The Labyrinth', { hard: true }),
    _crM('5A', 'Aeor Crash Site', 'Vessa\'s Legacy', { boss: true, finale: true }), _crM('5B', 'Mutalos', 'Vessa\'s People', { boss: true, finale: true })],
    shops: [{ k: 's1', at: 'Rexxentrum', name: 'Thaydeen\'s Endless Emporium', before: 3 }, { k: 's2', at: 'Syrinlya', name: 'The Buyer', before: 5, haldane: true }] },
  { key: 'marquet', name: 'Marquet', num: 3, color: '#1e86a0', missions: [
    _crM('1', 'Foothills of Serpentwind Peaks', 'The Spring Festival'), _crM('2A', 'Heartmoor Hamlet', 'Among the Druids'), _crM('2B', 'Jrusar', 'Militia\'s Aid'),
    _crM('3', 'Ank\'Harel', 'Defiled Sanctuary', { boss: true }),
    _crM('4A-1', 'Gelvaan', 'The Chained Forest'), _crM('4A-2', 'Gelvaan', 'Guiding Light'), _crM('4B-1', 'Bassuras', 'Embracing Darkness'), _crM('4B-2', 'Bassuras', 'The One Who Chose You'),
    // the finale, unless the offering at Yios opened mission 6
    _crM('5', 'Yios', 'The Divine Pool', { boss: true, finale: 'offering' }), _crM('6', 'Unknown', 'Battle for One Man\'s Soul', { lock: 'offering', hard: true, finale: true })],
    shops: [{ k: 's1', at: 'Ank\'Harel', name: 'Suncut Bazaar', before: 3 }, { k: 's2', at: 'Yios', name: 'A Blind Hermit', before: 5, offering: 18 }] },
];
const CR_LOCKS = {
  unharmed: 'Opens if you win mission 3 with no hero missing a heart.',
  map: 'Opens if you find both blue words in mission 1.',
  offering: 'Opens with the offering at Yios: 18 coins, with at least 2 heroes still in the party.',
};
// The mission fail counter, the same on every map (healing rounds up).
const CR_FAILS = [
  { xp: 0, heal: 'half', text: 'Each hero heals half their lost hearts.' },
  { xp: 3, heal: 'half', text: 'Split 3 XP among the heroes. Each hero heals half their lost hearts.' },
  { xp: 5, heal: 'half', text: 'Split 5 XP. Each hero heals half their lost hearts.' },
  { xp: 7, heal: 'all', text: 'Split 7 XP. Each hero heals all their lost hearts.' },
  { lost: true, text: 'The campaign is lost.' },
];
const CR_SLOTS = ['h0', 'h1', 'h2'];
const CR_FIRST = ['grog', 'vex', 'nott'];   // the rulebook's party for a first campaign
// A hero out of the missions: with Haldane until Syrinlya (Wildemount),
// chained in the dream (Marquet 4A), or gone for good (Marquet 4A-2).
const CR_OUT = { quest: 'with Haldane', chained: 'chained', gone: 'left the party' };
const CR_OUT_MAP = { wildemount: ['quest'], marquet: ['chained', 'gone'] };

let _crData = null;          // data/cncr.js
let _crCamps = null;         // crCampaigns from Firebase: {id: campaign}
let _crSrc = {};             // id → the store it lives in ('main' | 'spare', see fbWrite)
let _crId = null;            // the campaign open; null: none (or the start form, with _crDraft)
let _crTab = 'map';          // 'map' | 'heroes' | 'items' | 'notes'
let _crHero = null;          // the hero slot shown on the Heroes tab
let _crDraft = null;         // the start form, while it's open
let _crRw = null;            // the reward being taken on this phone
let _crKind = 'always';      // the item being added: green ('always') or orange ('once')
let _crPanel = null;         // the tab on screen
let _crLate = false;         // a change came in while typing: drawn when the field's left
let _crES = null, _crESid = null, _crWatch = null;
let _crSaveTimers = {};
let _crPlaysStale = false;   // a mission's play was logged: the game page's Plays tab is drawn again when opened

const _crMapOf = (c) => CR_MAPS.find(m => m.key === (c && c.map)) || CR_MAPS[0];
const _crMis = (c, k) => _crMapOf(c).missions.find(m => m.k === k) || null;
const _crRules = (c, k) => ((_crData && _crData.missions[_crMapOf(c).key]) || {})[k] || {};
const _crHeroDef = (id) => (_crData && _crData.heroes.find(h => h.id === id)) || null;
const _crHeroName = (h) => { const H = _crHeroDef(h && h.id) || {}; return (H.alt && h.curse1 && h.curse20 ? H.alt : H.short || H.name) || '?'; };
const _crList = (v) => (Array.isArray(v) ? v : Object.values(v || {})).filter(x => typeof x === 'string' && x);
const _crToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const _crSigned = (v) => (v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '+0');
const _crFinale = (c, m) => m.finale === true || (m.finale === 'offering' && !(c.unlock || {})['6']);

function _crMe() { return typeof _navPlayer === 'function' ? _navPlayer() : null; }
// Everyone who's been at the table: the players, the GM, whoever started it or GMed a mission.
function _crPeople(c) {
  const out = new Set(_crList(c && c.players));
  if (c && c.gm) out.add(c.gm);
  if (c && c.by) out.add(c.by);
  for (const l of Object.values((c && c.log) || {})) { if (l && l.gm) out.add(l.gm); }
  return [...out];
}
function _crCanEdit(c) {
  const me = _crMe();
  if (!me) return false;
  const people = _crPeople(c);
  return !people.length || people.includes(me);
}
// The heroes taking part: not away with Haldane, not gone.
function _crInParty(c) {
  return CR_SLOTS.filter(s => { const h = ((c && c.heroes) || {})[s]; return h && h.id && h.out !== 'quest' && h.out !== 'gone'; });
}

async function _crLoad(force) {
  if (!_crData) {
    const src = await (await fetch('data/cncr.js', { cache: 'no-cache' })).text();
    _crData = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  }
  if (force || !_crCamps) {
    const { main, spare } = await fbReadBoth('crCampaigns');
    _crCamps = {};
    _crSrc = {};
    for (const [store, data] of [['spare', spare], ['main', main]]) {
      for (const id in (data || {})) { _crCamps[id] = data[id]; _crSrc[id] = store; }
    }
  }
  if (_crId && !_crCamps[_crId]) _crId = null;
}

// Write some fields of the campaign: {path: value}, path relative to it
// ("done/2a", "heroes/h0/xp"); null removes. Firebase applies them together
// without touching the rest, so two phones filling in different boxes don't
// overwrite each other.
async function _crPatch(updates, id = _crId) {
  const c = _crCamps[id];
  if (!c) return;
  for (const [path, v] of Object.entries(updates)) _crSetAt(c, path.split('/'), v);
  c.updated = Date.now();
  try {
    await fbWrite(`crCampaigns/${id}`, 'PATCH', { ...updates, updated: c.updated }, _crSrc[id]);
  } catch (e) {
    console.warn('Codenames campaign: not saved', e);
    _crToast('Not saved. Check the connection and try again.');
  }
}
function _crSetAt(o, parts, v) {
  for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
  const last = parts[parts.length - 1];
  if (v === null || v === undefined) delete o[last]; else o[last] = v;
}
async function _crCreate(c) {
  const { store, json } = await fbWrite('crCampaigns', 'POST', c);
  _crCamps[json.name] = c;
  _crSrc[json.name] = store;
  _crId = json.name;
}
function _crToast(msg, ok) {
  const el = document.querySelector('.cr .rv-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('ok', !!ok);
  el.hidden = false;
  clearTimeout(_crToast.t);
  _crToast.t = setTimeout(() => { el.hidden = true; }, 5000);
}

// ── Following the campaign while it's on screen ──
// One stream, for the campaign shown, while the game page is open and the
// app in front (a phone drops it in the background; coming back opens it
// again, and its first message is the whole campaign, so it catches up).
function _crShown() {
  const ov = document.getElementById('modal-overlay');
  return !!(_crPanel && _crPanel.isConnected && ov && ov.classList.contains('open') && !document.hidden);
}
function _crFollow() {
  const id = _crId;
  if (_crES && _crESid === id && _crES.readyState !== 2) return;
  _crUnfollow();
  if (!id || typeof EventSource === 'undefined' || !FIREBASE_DB || !_crShown()) return;
  const path = `crCampaigns/${id}`;
  const es = new EventSource(`${FIREBASE_DB}/${_crSrc[id] === 'spare' ? _fbSpare(path) : path}.json`);
  const on = (kind) => (ev) => {
    let msg = null;
    try { msg = JSON.parse(ev.data); } catch (_) {}
    if (msg && typeof msg.path === 'string') _crApply(id, kind, msg.path, msg.data);
  };
  es.addEventListener('put', on('put'));
  es.addEventListener('patch', on('patch'));
  es.addEventListener('keep-alive', () => { if (!_crShown()) _crUnfollow(); });
  es.addEventListener('cancel', _crUnfollow);
  _crES = es;
  _crESid = id;
  if (!_crWatch && typeof MutationObserver === 'function') {
    // the game page closing: let the stream go
    _crWatch = new MutationObserver(() => { if (!_crShown()) _crUnfollow(); });
    _crWatch.observe(document.getElementById('modal-overlay'), { attributes: true, attributeFilter: ['class'] });
  }
}
function _crUnfollow() {
  if (_crES) _crES.close();
  _crES = null;
  _crESid = null;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) _crUnfollow(); else if (_crShown()) _crFollow(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && _crZoom && _crPanel && _crPanel.isConnected) { e.stopPropagation(); _crZoom = null; _crRender(_crPanel); } }, true);

function _crApply(id, kind, path, data) {
  const before = JSON.stringify(_crCamps[id] || null);
  const parts = path.split('/').filter(Boolean);
  const box = { c: _crCamps[id] };
  const put = (p, v) => _crSetAt(box, ['c', ...p], v);
  if (kind === 'put') put(parts, data);
  else for (const k in data || {}) put([...parts, ...k.split('/').filter(Boolean)], data[k]);
  if (box.c) _crCamps[id] = box.c; else delete _crCamps[id];
  if (JSON.stringify(box.c || null) === before || id !== _crId) return;
  if (!box.c) _crId = null;
  _crRedraw();
}
// Drawn again, unless someone's typing in it (then once they leave the field).
function _crRedraw() {
  const p = _crPanel;
  if (!p || !p.isConnected) return;
  const a = document.activeElement;
  if (a && p.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) { _crLate = true; return; }
  _crRender(p);
}

// ── A hero's sheet as the XP marked so far makes it ──
// Boxes are marked left to right; each symbol reached unlocks its upgrade. A
// two-way box (a heart or a modifier) is the party's pick, unless one of the
// two is already full, then it's the other.
function _crHeroState(h, H) {
  const out = { mods: 1, hearts: H.hearts[0], slots: 1, stress: H.stress ? H.stress[0] : 0, abil: 0, pending: [], boxes: [] };
  const track = H.track.replace(/\|/g, '');
  const xp = Math.min(h.xp || 0, track.length);
  const pick = h.pick || {};
  const roomM = () => out.mods < H.mods.length;
  const roomH = () => out.hearts < H.hearts[1];
  const roomT = () => !!H.stress && out.stress < H.stress[1];
  for (let i = 0; i < track.length; i++) {
    const s = track[i];
    let got = s;
    if (i < xp) {
      if (/[123]/.test(s)) out.abil = Math.max(out.abil, Number(s));
      else if (s === 'M') { if (roomM()) out.mods++; }
      else if (s === 'H') { if (roomH()) out.hearts++; }
      else if (s === 'S') out.slots++;
      else if (s === 'T') { if (roomT()) out.stress++; }
      else if (s === 'C' || s === 'X') {
        const other = s === 'C' ? 'H' : 'T', roomO = s === 'C' ? roomH() : roomT();
        let p = pick[i];
        if (p === 'M' && !roomM()) p = null;
        if (p && p !== 'M' && !roomO) p = null;
        if (!p) p = roomO && !roomM() ? other : roomM() && !roomO ? 'M' : null;
        if (p === 'M') out.mods++;
        else if (p === 'H') out.hearts++;
        else if (p === 'T') out.stress++;
        else if (roomO && roomM()) out.pending.push(i);
        got = p || s;
      }
    }
    out.boxes.push({ s, got, on: i < xp });
  }
  out.xp = xp;
  out.total = track.length;
  out.dmg = Math.min(h.dmg || 0, out.hearts);
  out.mod = H.mods[out.mods - 1] + (H.id === 'grog' ? 2 * out.dmg : 0);
  out.veth = !!(H.alt && h.curse1 && h.curse20);
  return out;
}

// ── The route: which missions are done, open, on the other road, locked or still ahead ──
function _crMissionStates(c) {
  const map = _crMapOf(c);
  const done = (c && c.done) || {}, unlock = (c && c.unlock) || {};
  const st = {};
  let prevDone = true;
  for (const s of [...new Set(map.missions.map(m => m.stage))].sort((a, b) => a - b)) {
    const ms = map.missions.filter(m => m.stage === s);
    const taken = ms.find(m => done[m.k]);   // the road taken through this stage
    for (const m of ms) {
      if (done[m.k]) st[m.k] = 'done';
      else if (taken && m.branch !== taken.branch) st[m.k] = 'closed';
      else if (m.lock && !unlock[m.k]) st[m.k] = 'locked';
      else if (!prevDone || (m.part > 1 && !ms.some(o => o.branch === m.branch && o.part === m.part - 1 && done[o.k]))) st[m.k] = 'later';
      else st[m.k] = 'open';
    }
    prevDone = !!taken && ms.filter(m => m.branch === taken.branch).every(m => done[m.k]);
  }
  return st;
}
// The mission to play next: the one the party chose, else the only one open.
function _crNext(c) {
  const map = _crMapOf(c);
  const st = _crMissionStates(c);
  const chosen = c.next && map.missions.find(m => m.k === c.next && st[m.k] === 'open');
  if (chosen) return { m: chosen };
  const open = map.missions.filter(m => st[m.k] === 'open');
  return open.length === 1 ? { m: open[0] } : { choice: open };
}
// Where the campaign stands: over, a reward to take, a mission being played,
// a shop on the way, or the next mission (or the choice of it).
function _crPhase(c) {
  if (c.status) return { end: c.status };
  if (c.reward && _crMis(c, c.reward)) return { reward: _crMis(c, c.reward) };
  if (c.playing && _crMis(c, c.playing)) return { play: _crMis(c, c.playing) };
  const next = _crNext(c);
  const stage = next.m ? next.m.stage : next.choice && next.choice.length ? next.choice[0].stage : 0;
  const shop = _crMapOf(c).shops.find(s => s.before === stage && !(c.shops || {})[s.k]);
  return { next, shop };
}

// ── rendering ──
function buildCrCampaignHtml(game) {
  if (!game || Number(game.bggId) !== CNCR_BGGID) return '';
  return `<div class="rv cr" data-cr><div class="rv-loading">Opening the campaign…</div></div>`;
}

function wireCrCampaign(content) {
  const panel = content.querySelector('[data-cr]');
  if (!panel) return;
  _crPanel = panel;
  _crLoad(true).then(() => _crRender(panel)).catch(e => {
    panel.innerHTML = `<div class="rv-loading">The campaign couldn't be loaded. Try again in a moment.</div>`;
    console.warn('Codenames campaign:', e);
  });
  panel.addEventListener('click', (ev) => _crClick(panel, ev));
  panel.addEventListener('change', (ev) => _crChange(panel, ev));
  panel.addEventListener('input', (ev) => _crInput(panel, ev));
  // a mission's play logged since the page opened: its Plays tab drawn again
  const tabs = content.querySelector('.gm-tabs');
  if (tabs) tabs.addEventListener('click', (ev) => {
    const t = ev.target.closest('.gm-tab');
    if (!t || t.dataset.tab !== 'plays' || !_crPlaysStale) return;
    _crPlaysStale = false;
    _modalTab = 'plays';
    _modalTabFor = CNCR_BGGID;
    openModal(findGameByBggId(CNCR_BGGID));
  });
  panel.addEventListener('focusout', () => setTimeout(() => {
    const a = document.activeElement;
    if (_crLate && !(a && panel.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName))) _crRender(panel);
  }, 250));
}

// Where a campaign stands, in a few words: for its tab.
function _crState(c) {
  if (c.status === 'won') return 'won';
  if (c.status === 'lost') return 'lost';
  if (c.status === 'stopped') return `stopped ${_crShortDate(c.stopped)}`;
  const ph = _crPhase(c);
  if (ph.reward) return `${ph.reward.n} won: reward to take`;
  if (ph.play) return `playing ${ph.play.n}`;
  if (ph.shop) return `shop at ${ph.shop.at}`;
  if (ph.next.m) return `next: ${ph.next.m.n} ${ph.next.m.place}`;
  return 'where next?';
}
// The campaigns as tabs: yours first, the stopped and finished ones apart.
function _crTabsHtml() {
  const esc = _escapeHtml;
  const me = _crMe();
  const mine = (c) => !!(me && _crPeople(c).includes(me));
  const ids = Object.keys(_crCamps).sort((a, b) => {
    const A = _crCamps[a], B = _crCamps[b];
    return (mine(B) - mine(A)) || ((B.updated || 0) - (A.updated || 0));
  });
  const tab = (id) => {
    const c = _crCamps[id], map = _crMapOf(c);
    const heroes = CR_SLOTS.map(s => (c.heroes || {})[s]).filter(h => h && h.id).map(_crHeroName).join(', ');
    const who = [c.gm ? `GM ${c.gm}` : '', _crList(c.players).join(', ')].filter(Boolean).join(' · ');
    return `<button type="button" class="cr-camp${id === _crId ? ' on' : ''}${c.status ? ` ended ${c.status}` : ''}" data-cr-camp="${esc(id)}" style="--cr-c:${map.color}" aria-expanded="${id === _crId}">
      <b>${esc(c.name || heroes || 'A party')}</b>
      <span>${esc(map.name)} · ${esc(_crState(c))}</span>
      ${who ? `<span class="cr-camp-who">${esc(who)}</span>` : ''}</button>`;
  };
  const active = ids.filter(id => !_crCamps[id].status), ended = ids.filter(id => _crCamps[id].status);
  const isNew = !_crId && !!_crDraft;
  return `<div class="cr-camps">${active.map(tab).join('')}
      <button type="button" class="cr-camp cr-camp-new${isNew ? ' on' : ''}" data-cr-camp="__new" aria-expanded="${isNew}"><b>+ A new campaign</b><span>Tal'Dorei, Wildemount or Marquet</span></button></div>
    ${ended.length ? `<div class="rv-sub">Stopped and finished</div><div class="cr-camps">${ended.map(tab).join('')}</div>` : ''}
    ${!_crId && !_crDraft && ids.length ? '<div class="rv-hint cr-camps-hint">Tap a campaign to open it.</div>' : ''}`;
}

function _crRender(panel) {
  const esc = _escapeHtml;
  _crPanel = panel;
  _crLate = false;
  // the artwork open full screen stays where it was scrolled to
  const zw = panel.querySelector('.cr-artwrap.zoom');
  const zs = zw ? [zw.scrollLeft, zw.scrollTop] : null;
  queueMicrotask(() => { const z = zs && panel.querySelector('.cr-artwrap.zoom'); if (z) { z.scrollLeft = zs[0]; z.scrollTop = zs[1]; } });
  const c = _crId && _crCamps[_crId];
  if (!c) {
    _crUnfollow();
    panel.innerHTML = `${_crTabsHtml()}${_crDraft ? _crStartHtml() : ''}<div class="rv-toast" hidden></div>${_crCreditHtml()}`;
    _crWire(panel);
    return;
  }
  const edit = _crCanEdit(c);
  const nItems = Object.keys(c.items || {}).length;
  const tabs = [['map', 'Campaign'], ['heroes', 'Heroes'], ['items', `Items${nItems ? ` <span class="gm-tab-n">${nItems}</span>` : ''}`], ['notes', 'Notes']];
  const body = { map: _crCampHtml, heroes: _crHeroesHtml, items: _crItemsHtml, notes: _crNotesHtml }[_crTab](c, edit);
  const players = _crList(c.players);
  panel.innerHTML = `
    ${_crTabsHtml()}
    <div class="cr-open" style="--cr-m:${_crMapOf(c).color}">
    <div class="rv-head">
      <input class="rv-party" data-cr-text="name" value="${esc(c.name || '')}" placeholder="Party name" ${edit ? '' : 'readonly'} aria-label="Party name">
    </div>
    <div class="cr-sub">Campaign ${_crMapOf(c).num}: ${esc(_crMapOf(c).name)}${c.gm ? ` · GM ${esc(c.gm)}` : ''}${players.length ? ` · ${players.map(esc).join(', ')}` : ''}</div>
    ${edit ? '' : `<div class="rv-ro">${_crMe() ? 'Only the people at its table can fill in this campaign.' : 'Log in to fill in the campaign.'}</div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_crTab === k ? ' on' : ''}" data-cr-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body${edit ? '' : ' rv-readonly'}">${body}</div>
    </div>
    <div class="rv-toast" hidden></div>
    ${_crCreditHtml()}`;
  _crWire(panel);
  _crFollow();
}
function _crCreditHtml() {
  return `<div class="rv-credit">Heroes, maps and missions from Czech Games Edition's <a href="https://www.czechgames.com/games/codenames-critical-role-adventures" target="_blank" rel="noopener">rules, campaign book and printable sheets</a>, in short here: the book and the sheets have them in full.</div>`;
}

// ── People: typed, with everyone the app knows offered as you type ──
// Everyone who could be at the table: the given ones first, the Ilioupoli bros, then the rest.
function _crNames(first) {
  const top = [...new Set([...(first || []), ...(typeof ILIOUPOLI_MEMBERS !== 'undefined' ? ILIOUPOLI_MEMBERS : [])])];
  return [...top, ...[...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].filter(n => !top.includes(n)).sort()];
}
function _crWhoOptions(kind) {
  const c = _crCamps && _crCamps[_crId];
  const me = _crMe();
  if (kind === 'dgm' || kind === 'dplayer') {
    const d = _crDraft;
    return _crNames(me ? [me] : []).filter(n => kind === 'dgm' ? n !== d.gm : !d.players.includes(n));
  }
  const players = _crList(c && c.players);
  return _crNames(_crPeople(c)).filter(n => kind === 'gm' ? n !== c.gm : !players.includes(n));
}
function _crWire(panel) {
  if (typeof comboAttach !== 'function') return;
  panel.querySelectorAll('input[data-cr-who]').forEach(inp => {
    const kind = inp.dataset.crWho;
    comboAttach(inp, { options: () => _crWhoOptions(kind), onPick: (v) => _crWhoSet(panel, kind, v), max: 80 });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); _crWhoSet(panel, kind, inp.value); } });
  });
}
function _crWhoClean(v) {
  v = String(v || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return _crNames([]).find(n => n.toLowerCase() === v.toLowerCase()) || v;
}
// A name picked or typed (Enter) into one of the fields; later: drawn once
// the field's left (the GM typed, then a tap elsewhere: that tap still lands).
function _crWhoSet(panel, kind, v, later) {
  v = _crWhoClean(v);
  if (kind === 'dgm') { _crDraft.gm = v; return; }
  if (kind === 'dplayer') {
    if (v && !_crDraft.players.includes(v)) _crDraft.players.push(v);
    _crRender(panel);
    return;
  }
  const c = _crCamps[_crId];
  if (!c || !_crCanEdit(c)) return;
  const players = _crList(c.players);
  if (kind === 'gm') {
    if (v === (c.gm || '')) return;
    // the GM goes round: the one before joins the players, the new one leaves them
    const next = players.filter(p => p !== v);
    if (c.gm && v && !next.includes(c.gm)) next.push(c.gm);
    _crPatch({ gm: v || null, players: next });
  } else {
    if (!v || players.includes(v)) { _crRender(panel); return; }
    _crPatch({ players: [...players, v] });
  }
  if (later) _crLate = true; else _crRender(panel);
}
function _crPeopleHtml(names, xAttr, addAttr, placeholder, edit) {
  const esc = _escapeHtml;
  return `<div class="cr-people">${names.map(p => `<span class="cr-person">${esc(p)}${edit ? `<button type="button" class="cr-person-x" ${xAttr}="${esc(p)}" aria-label="Take ${esc(p)} off">&times;</button>` : ''}</span>`).join('')}
    ${edit ? `<input class="rv-in cr-who" ${addAttr} placeholder="${placeholder}" maxlength="40" enterkeyhint="done">` : names.length ? '' : '<span class="cr-note">nobody yet</span>'}</div>`;
}

// ── Starting a campaign: the map, the three heroes, the GM and the players ──
function _crStartHtml() {
  const esc = _escapeHtml;
  const me = _crMe();
  const d = _crDraft;
  const mine = Object.values(_crCamps || {}).filter(c => me && _crPeople(c).includes(me));
  const heroes = _crData.heroes.map(H => {
    const on = d.heroes.includes(H.id);
    return `<button type="button" class="cr-hpick${on ? ' on' : ''}" data-cr-draft-hero="${H.id}" style="--cr-c:${esc(H.color)}" aria-pressed="${on}">
      <b>${esc(H.alt ? `${H.name} / ${H.alt}` : H.name)}</b><span>${esc(H.blurb)}</span></button>`;
  }).join('');
  return `<div class="rv-start cr-start">
    <div class="rv-start-title">Start a campaign</div>
    <div class="rv-start-sub">The players run three heroes together, the same three for the whole campaign; the GM gives the clues. Each party's campaign is its own: start one for every group, and each carries on where it stopped.${mine.length ? '' : ' A first campaign: Tal\'Dorei, with Grog, Vex\'ahlia and Nott.'}</div>
    <div class="rv-sub">Campaign</div>
    <div class="cr-maps">${CR_MAPS.map(m => `<button type="button" class="cr-mapbtn${d.map === m.key ? ' on' : ''}" data-cr-draft-map="${m.key}"><b>${esc(m.name)}</b><span>Campaign ${m.num} · ${m.missions.length} missions</span></button>`).join('')}</div>
    <div class="rv-sub">The heroes <span class="cr-count">${d.heroes.length} of 3</span></div>
    <div class="cr-hpicks">${heroes}</div>
    <div class="rv-sub">GM</div>
    <input class="rv-in cr-who cr-who-wide" data-cr-who="dgm" value="${esc(d.gm)}" placeholder="Who gives the clues?" maxlength="40" enterkeyhint="done">
    <div class="rv-sub">Players</div>
    ${_crPeopleHtml(d.players, 'data-cr-draft-x', 'data-cr-who="dplayer"', 'Add a player', true)}
    <label class="rv-field cr-draft-name"><span>Party name</span><input class="rv-in" data-cr-draft-name value="${esc(d.name)}" placeholder="Optional: Vox Ilioupoli…"></label>
    ${me ? `<button type="button" class="rv-btn" data-cr-start>Start the campaign</button>` : '<div class="rv-start-sub">Log in to start one.</div>'}
  </div>`;
}

// ── The Campaign tab: the table, where the campaign stands, the party, the route ──
function _crCampHtml(c, edit) {
  const esc = _escapeHtml;
  const map = _crMapOf(c);
  const ph = _crPhase(c);
  let top = '';
  if (ph.end === 'won') top = `<div class="cr-end won">The campaign is won. &#127881;</div>`;
  else if (ph.end === 'lost') top = `<div class="cr-end lost">The campaign is lost: the fail counter ran out.</div>`;
  else if (ph.end === 'stopped') top = `<div class="cr-end stopped">Stopped on ${esc(_crShortDate(c.stopped))}: it's all kept as it was.${edit ? '<button type="button" class="rv-btn rv-btn-sm" data-cr-resume>Pick it up again</button>' : ''}</div>`;
  else if (ph.reward) top = _crRewardHtml(c, ph.reward, edit);
  else if (ph.play) top = _crMissionHtml(c, ph.play, edit, true);
  else if (ph.shop) top = _crShopHtml(c, ph.shop, edit);
  else if (ph.next.m) top = _crMissionHtml(c, ph.next.m, edit, false);
  else if (ph.next.choice && ph.next.choice.length) {
    top = `<div class="rv-card cr-card"><div class="cr-card-title">Where next?</div>
      <div class="rv-hint">The epilogue says where the party can go. Pick the road:</div>
      <div class="cr-go">${ph.next.choice.map(m => `<button type="button" class="cr-gobtn" data-cr-go="${m.k}"><span class="cr-mis-n">${esc(m.n)}</span><span><b>${esc(m.title)}</b><span>${esc(m.place)}${m.boss ? ' · boss fight' : ''}${m.hard ? ' · extremely difficult' : ''}</span></span></button>`).join('')}</div></div>`;
  }
  const mode = ph.play ? 'play' : ph.shop && !ph.end ? 'shop' : 'between';
  const fails = c.fails || 0;
  const log = Object.entries(c.log || {}).sort((a, b) => b[1].at - a[1].at).slice(0, 10);
  const party = `<div class="rv-sec">The party</div>${_crPartyHtml(c, edit, mode)}`;
  // during a mission the party comes first: its hearts and XP are what's tapped
  return `${_crTableHtml(c, edit)}
    ${ph.play ? party + top : top + (!ph.end && !ph.reward ? _crLevelUpHtml(c, edit) : '') + party}
    <div class="rv-sec">${esc(map.name)}</div>
    ${_crRouteHtml(c)}
    <div class="rv-sec">Mission fail counter</div>
    <div class="cr-fails">${CR_FAILS.map((f, i) => `<button type="button" class="cr-fail${i < fails ? ' on' : ''}${f.lost ? ' last' : ''}" data-cr-fail="${i + 1}"><span class="rv-check">${i < fails ? '&#10003;' : ''}</span><span>${esc(f.text)}</span></button>`).join('')}</div>
    <div class="rv-hint">A lost mission marks the next box by itself, healing included; its XP goes to the heroes on the party list.</div>
    <div class="rv-sec">Treasure</div>
    <div class="cr-coins">
      <button type="button" class="rv-dot" data-cr-coins="-1" aria-label="One coin less">&minus;</button>
      <span class="cr-coins-n"><b>${c.coins || 0}</b> coin${c.coins === 1 ? '' : 's'}</span>
      <button type="button" class="rv-dot" data-cr-coins="1" aria-label="One coin more">+</button>
    </div>
    ${log.length ? `<div class="rv-sec">Lately</div><div class="cr-log">${log.map(([ts, l]) => { const m = _crMis(c, l.m); return `<div class="cr-log-row"><span>${esc(_crShortDate(l.at))}</span><span>${esc(m ? `${m.n} · ${m.place}` : l.m)}${l.gm ? `<i> · GM ${esc(l.gm)}</i>` : ''}</span><b class="${l.won ? 'won' : 'lost'}">${l.won ? 'won' : 'lost'}</b><span class="cr-log-acts">${_crLogActs(ts, l, edit)}</span></div>`; }).join('')}</div>` : ''}
    ${edit && !c.status ? '<button type="button" class="rv-link cr-stop" data-cr-stop>Stop this campaign</button>' : ''}`;
}
// A mission's line: its play (BG Stats' QR code, and the pencil for whoever
// may change it), or a button to log it.
function _crLogActs(ts, l, edit) {
  if (l.play) {
    const i = _crPlayIdx(l.play);
    if (i < 0) return '';
    return (typeof bgsSendBtnHtml === 'function' ? bgsSendBtnHtml(CNCR_BGGID, i) : '')
      + (typeof logPlayEditBtnHtml === 'function' ? logPlayEditBtnHtml(PLAY_HISTORY[CNCR_BGGID][i]) : '');
  }
  const signed = typeof acctMe === 'function' && acctMe();
  return edit && signed ? `<button type="button" class="cr-mini" data-cr-logplay="${_escapeHtml(ts)}">Log the play</button>` : '';
}
const _crPlayIdx = (id) => (PLAY_HISTORY[CNCR_BGGID] || []).findIndex(e => e.mp === id);

// ── A mission's play: logged in the app (js/log-play.js) and offered to BG Stats ──
// Everyone at the table, the GM too (a co-operative game: the whole table
// wins or loses together), the campaign and mission as Log a play writes them
// ("Tal'Dorei／Mission 2A"), from when the mission was started.
async function _crLogPlay(id, ts) {
  const c = _crCamps[id], l = c && (c.log || {})[ts];
  if (!l || l.play) return null;
  if (typeof logPlaySave !== 'function' || !(typeof acctMe === 'function' && acctMe())) return { err: 'Sign in to have the mission logged as a play.' };
  const m = _crMis(c, l.m);
  const start = l.from && l.from < l.at && l.at - l.from < 12 * 3600e3 ? l.from : l.at;
  const d = new Date(start), pad = (n) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const gm = l.gm || c.gm || '';
  const names = [...new Set([gm, ..._crList(c.players)].filter(Boolean))];
  if (!names.length && _crMe()) names.push(_crMe());
  const heroes = CR_SLOTS.map(s => (c.heroes || {})[s]).filter(h => h && h.id).map(_crHeroName).join(', ');
  const rec = {
    bggId: CNCR_BGGID, date, t: `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    sc: names.map(n => ({ n, w: !!l.won, ...(n === gm ? { r: 'GM' } : {}) })),
    b: `${_crMapOf(c).name}／Mission ${m ? m.n : String(l.m).toUpperCase()}`,
    c: `${c.name ? `${c.name}: ` : ''}${heroes}${m ? ` · ${m.title}` : ''}`,
  };
  const mins = start === l.from ? Math.round((l.at - l.from) / 60000) : 0;
  if (mins >= 1) rec.d = mins;
  try {
    const r = await logPlaySave(rec);
    await _crPatch({ [`log/${ts}/play`]: r.id }, id);
    _crPlaysStale = true;
    return r;
  } catch (e) {
    return { err: `The play wasn't logged: ${e.message || 'try again'}. The "Log the play" button on the mission's line tries again.` };
  }
}
// After Won or Lost: the play logged, and BG Stats' QR code for it.
async function _crAfterMission(id, ts) {
  const r = await _crLogPlay(id, ts);
  if (!r) return;
  if (r.err) { _crToast(r.err); _crRedraw(); return; }
  _crRedraw();
  const i = _crPlayIdx(r.id);
  if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(CNCR_BGGID, i);
}

function _crShortDate(v) {
  if (!v) return '';
  const d = typeof v === 'number' ? new Date(v) : new Date(`${v}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function _crTableHtml(c, edit) {
  const esc = _escapeHtml;
  return `<div class="cr-table">
    <div class="cr-trow"><span class="cr-lbl">GM</span>${edit ? `<input class="rv-in cr-who cr-who-wide" data-cr-who="gm" value="${esc(c.gm || '')}" placeholder="Who gives the clues?" maxlength="40" enterkeyhint="done">` : `<span class="cr-person">${esc(c.gm || '–')}</span>`}</div>
    <div class="cr-trow"><span class="cr-lbl">Players</span>${_crPeopleHtml(_crList(c.players), 'data-cr-person-x', 'data-cr-who="player"', 'Add a player', edit)}</div>
  </div>`;
}

// A mission's card: what the campaign book says, and what to do with it.
function _crMissionHtml(c, m, edit, playing) {
  const esc = _escapeHtml;
  const d = _crRules(c, m.k);
  const flags = [m.boss ? 'boss fight' : '', m.hard ? 'extremely difficult' : '', _crFinale(c, m) ? 'finale' : ''].filter(Boolean);
  const grog = CR_SLOTS.find(s => (c.heroes || {})[s] && c.heroes[s].id === 'grog' && _crInParty(c).includes(s));
  const lostOnce = Object.values(c.log || {}).some(l => l && l.m === m.k && !l.won);
  return `<div class="rv-card cr-card cr-mcard${playing ? ' playing' : ''}">
    <div class="cr-card-top">
      <span class="cr-mc-n">${esc(m.n)}</span>
      <div class="cr-mc-id"><span class="cr-mc-st">${playing ? 'Playing now' : lostOnce ? 'Again' : 'Up next'}${c.gm ? ` · GM ${esc(c.gm)}` : ''}</span><b>${esc(m.title)}</b><span>${esc(m.place)}${flags.length ? ` · ${flags.join(' · ')}` : ''}</span></div>
    </div>
    <div class="cr-facts">
      <div class="cr-fact win"><span>Win</span><p>${esc(d.win || '')}</p></div>
      <div class="cr-fact time"><span>Time</span><p>${esc(d.time || '')}</p></div>
      <div class="cr-fact blue"><span>Blue</span><p>${esc(d.blue || '')}</p></div>
      ${(d.rules || []).map(([n, t]) => `<div class="cr-fact rule"><span>Rule</span><p><b>${esc(n)}.</b> ${esc(t)}</p></div>`).join('')}
      ${m.boss ? `<div class="cr-fact boss"><span>Boss</span><p>Once the win condition is met, guess the black word: then or in a later round, after a clue. It ends the mission, won; guessed before that, it's lost.</p></div>` : ''}
      ${d.reward ? `<div class="cr-fact rw"><span>Reward</span><p>${esc(_crRewardText(d.reward, d.tw))}</p></div>` : ''}
      ${m.k === '5' && m.finale === 'offering' ? `<div class="cr-fact rw"><span>After</span><p>${(c.unlock || {})['6'] ? 'You made the offering: mission 6 comes next.' : 'Without the offering the campaign ends here, won.'}</p></div>` : ''}
    </div>
    ${!edit ? '' : playing ? `<div class="cr-result-btns"><button type="button" class="rv-btn rv-btn-sm" data-cr-won="${m.k}">Won</button><button type="button" class="rv-btn rv-btn-sm rv-btn-soft" data-cr-lost="${m.k}">Lost</button></div>
      <button type="button" class="rv-link" data-cr-cancel>Not playing it after all</button>`
      : `<button type="button" class="rv-btn cr-begin" data-cr-begin="${m.k}">Start mission ${esc(m.n)}</button>
      <div class="rv-hint">Starting it marks the XP still waiting on the sheets${grog && c.heroes[grog].dmg ? ' and heals 1 of Grog\'s hearts (Tough)' : ''}. During the mission, tap the XP tokens and hearts on the party list below: everyone at the table sees them.</div>`}
  </div>`;
}
// "Each hero gains 1 XP per time tile left · 2 coins · …"
function _crRewardText(r, tw) {
  const items = (w) => w.length === 2 && w[0] === w[1] ? `two random items worth ${w[0]}` : w.map((v, i) => `${i ? 'one' : 'a random item'} worth ${v}`).join(' and ');
  const part = (o) => [
    o.t ? `each hero gains 1 XP per ${tw || 'time tile left'}` : '',
    o.each ? `each hero gains ${o.each} XP` : '',
    o.coins ? `${o.coins} coin${o.coins === 1 ? '' : 's'}` : '',
    o.split ? `split ${o.split} XP among the heroes` : '',
    o.heal ? `each hero heals ${o.heal} heart${o.heal === 1 ? '' : 's'}` : '',
    o.item ? items(o.item) : '',
  ].filter(Boolean).join(', ');
  const text = part(r);
  return (text ? text.charAt(0).toUpperCase() + text.slice(1) : '') + (r.choose ? `${text ? '. ' : ''}Choose: ${r.choose.map(part).join(', or ')}.` : '.');
}

// ── A won mission's reward: the time left, the choice, what it asks ──
function _crRewardHtml(c, m, edit) {
  const esc = _escapeHtml;
  const d = _crRules(c, m.k), r = d.reward || {};
  const party = _crInParty(c);
  const chained = party.filter(s => c.heroes[s].out === 'chained');
  if (!_crRw || _crRw.k !== m.k || _crRw.id !== _crId) {
    _crRw = { id: _crId, k: m.k, time: 0, pick: null, hero: null, flag: d.ask === 'unharmed' && party.every(s => !c.heroes[s].dmg), keep: chained };
  }
  const w = _crRw;
  const heroBtn = (s, attr, on) => `<button type="button" class="cr-seg-b${on ? ' on' : ''}" ${attr}="${s}" style="--cr-c:${esc((_crHeroDef(c.heroes[s].id) || {}).color || '#888')}">${esc(_crHeroName(c.heroes[s]))}</button>`;
  const ask = {
    unharmed: `<button type="button" class="cr-flag${w.flag ? ' on' : ''}" data-cr-rw-flag><span class="rv-check">${w.flag ? '&#10003;' : ''}</span>No hero is missing a heart: 4C Byroden opens</button>`,
    map: `<button type="button" class="cr-flag${w.flag ? ' on' : ''}" data-cr-rw-flag><span class="rv-check">${w.flag ? '&#10003;' : ''}</span>You found both blue words: 2C Rumblecusp opens</button>`,
    haldane: `<div class="cr-ask-q">Who guessed the black word? They go with Haldane until Syrinlya.</div><div class="cr-seg">${party.map(s => heroBtn(s, 'data-cr-rw-hero', w.hero === s)).join('')}</div>`,
    unchained: `<div class="cr-ask-q">Who isn't chained? They gain 3 XP; the other two stay incapacitated for 4A-2.</div><div class="cr-seg">${party.map(s => heroBtn(s, 'data-cr-rw-hero', w.hero === s)).join('')}</div>`,
    dream: chained.length ? `<div class="cr-ask-q">Still chained when you won? They leave the party for good.</div><div class="cr-seg">${chained.map(s => heroBtn(s, 'data-cr-rw-keep', w.keep.includes(s))).join('')}</div>` : '',
  }[d.ask] || '';
  const pick = r.choose && w.pick != null ? r.choose[w.pick] : null;
  const items = [...(r.item || []), ...((pick && pick.item) || [])];
  return `<div class="rv-card cr-card cr-reward">
    <div class="cr-card-title">Mission ${esc(m.n)} won: the reward</div>
    <div class="rv-hint">${esc(_crRewardText(r, d.tw))}</div>
    ${r.t ? `<div class="cr-row"><span class="cr-lbl cr-lbl-wide">${esc((d.tw || 'time tile left').replace('tile', 'tiles').replace(/^./, x => x.toUpperCase()))}</span>
      <button type="button" class="rv-dot" data-cr-rw-time="-1" aria-label="One less">&minus;</button><b class="cr-n">${w.time}</b>
      <button type="button" class="rv-dot" data-cr-rw-time="1" aria-label="One more">+</button></div>` : ''}
    ${r.choose ? `<div class="cr-ask-q">Choose one:</div><div class="cr-seg cr-seg-col">${r.choose.map((o, i) => `<button type="button" class="cr-seg-b${w.pick === i ? ' on' : ''}" data-cr-rw-pick="${i}">${esc(_crRewardText(o))}</button>`).join('')}</div>` : ''}
    ${ask}
    ${items.length ? `<div class="cr-ask-q">Draw ${esc(items.length === 1 ? `a random item worth ${items[0]}` : `the random items (worth ${items.join(' and ')})`)} and add ${items.length === 1 ? 'it' : 'them'}:</div>${edit ? _crItemAddHtml('free') : ''}` : ''}
    ${edit ? `<button type="button" class="rv-btn cr-begin" data-cr-take="${m.k}">Take the reward</button>` : ''}
  </div>`;
}
function _crTake(c, m) {
  const d = _crRules(c, m.k), r = d.reward || {}, w = _crRw;
  if (!w || w.k !== m.k) return null;
  if (r.choose && w.pick == null) return { err: 'Choose one of the two first.' };
  if ((d.ask === 'haldane' || d.ask === 'unchained') && !w.hero) return { err: d.ask === 'haldane' ? 'Who goes with Haldane?' : 'Who isn\'t chained?' };
  const up = { reward: null };
  const party = _crInParty(c);
  const tok = {}, dmg = {};
  for (const s of party) { tok[s] = c.heroes[s].tok || 0; dmg[s] = c.heroes[s].dmg || 0; }
  let coins = c.coins || 0, split = c.split || 0;
  for (const o of [r, r.choose && r.choose[w.pick]].filter(Boolean)) {
    for (const s of party) {
      tok[s] += (o.t ? w.time * o.t : 0) + (o.each || 0);
      dmg[s] = Math.max(0, dmg[s] - (o.heal || 0));
    }
    coins += o.coins || 0;
    split += o.split || 0;
  }
  const away = (s, how) => {
    up[`heroes/${s}/out`] = how;
    for (const [k, it] of Object.entries(c.items || {})) if (it && it.on === s) up[`items/${k}/on`] = null;   // their items go back to the party
  };
  if (d.ask === 'unharmed' && w.flag) up['unlock/4c'] = true;
  if (d.ask === 'map' && w.flag) up['unlock/2c'] = true;
  if (d.ask === 'haldane') away(w.hero, 'quest');
  if (d.ask === 'unchained') {
    tok[w.hero] += 3;
    for (const s of party) if (s !== w.hero) up[`heroes/${s}/out`] = 'chained';
  }
  if (d.ask === 'dream') for (const s of party.filter(x => c.heroes[x].out === 'chained')) { if (w.keep.includes(s)) away(s, 'gone'); else up[`heroes/${s}/out`] = null; }
  for (const s of party) {
    up[`heroes/${s}/tok`] = tok[s] || null;
    up[`heroes/${s}/dmg`] = dmg[s] || null;
  }
  up.coins = coins;
  if (split) up.split = split;
  _crRw = null;
  return { up, note: `Reward taken.${split ? ` Split the ${split} XP on the party list,` : ''} Then level up${_crPhase({ ...c, reward: null }).shop ? ' and go shopping' : ''}.` };
}

// ── A shop on the way, before a boss fight ──
function _crShopHtml(c, s, edit) {
  const esc = _escapeHtml;
  const away = s.haldane && CR_SLOTS.find(x => (c.heroes || {})[x] && c.heroes[x].out === 'quest');
  const offered = !!(c.unlock || {})['6'];
  const left = CR_SLOTS.filter(x => (c.heroes || {})[x] && c.heroes[x].id && c.heroes[x].out !== 'gone').length;
  return `<div class="rv-card cr-card cr-shopcard">
    <div class="cr-card-top"><span class="cr-mc-n cr-bag" aria-hidden="true">&#128176;</span>
      <div class="cr-mc-id"><span class="cr-mc-st">Shop · before mission ${s.before}</span><b>${esc(s.at)}: ${esc(s.name)}</b><span>${c.coins || 0} coin${c.coins === 1 ? '' : 's'} to spend</span></div></div>
    ${away ? `<div class="cr-back"><span><b>${esc(_crHeroName(c.heroes[away]))}</b> is back from escorting Haldane, with 8 XP and 3 coins.</span>${edit ? `<button type="button" class="rv-btn rv-btn-sm" data-cr-back="${away}">Welcome back</button>` : ''}</div>` : ''}
    <ul class="cr-shop-list">
      <li>The GM deals 4 items from the shuffled deck: buy any of them at their cost.</li>
      <li>Sell an item for its cost minus 1 (on the Items tab).</li>
      <li>Heal 1 heart, or give a hero 1 XP: 1 coin each, on the party list below.</li>
    </ul>
    ${s.offering ? `<div class="cr-offer${offered ? ' on' : ''}">
      <div><b>Make an offering</b>: ${s.offering} coins open mission 6, Battle for One Man's Soul (with at least 2 heroes still in the party).</div>
      ${edit ? offered ? `<button type="button" class="rv-btn rv-btn-sm rv-btn-soft" data-cr-offer>Offering made: undo</button>`
        : `<button type="button" class="rv-btn rv-btn-sm" data-cr-offer${(c.coins || 0) >= s.offering && left >= 2 ? '' : ' disabled'}>Offer ${s.offering} coins</button>` : ''}
    </div>` : ''}
    ${edit ? `<div class="cr-ask-q">Bought something?</div>${_crItemAddHtml('buy')}
      <button type="button" class="rv-btn cr-begin" data-cr-shopdone="${s.k}">Done shopping</button>` : ''}
    <div class="rv-hint">Once only: replaying the boss fight or falling back doesn't bring you here again.</div>
  </div>`;
}

// ── Leveling up between missions: the XP tokens marked on the sheets ──
function _crLevelUpHtml(c, edit) {
  const esc = _escapeHtml;
  const waiting = CR_SLOTS.filter(s => (c.heroes || {})[s] && c.heroes[s].tok > 0);
  if (!waiting.length) return '';
  return `<div class="rv-card cr-card cr-lvl">
    <div><b>Level up</b>: ${waiting.map(s => `${esc(_crHeroName(c.heroes[s]))} ${c.heroes[s].tok} XP`).join(', ')}.</div>
    ${edit ? `<button type="button" class="rv-btn rv-btn-sm" data-cr-levelup${c.split > 0 ? ' disabled' : ''}>Mark them on the sheets</button>` : ''}
    ${c.split > 0 ? '<div class="rv-hint">Split the XP first.</div>' : ''}
  </div>`;
}

// ── The party: each hero's hearts, XP tokens and roll at a glance ──
function _crPartyHtml(c, edit, mode) {
  const esc = _escapeHtml;
  const split = c.split || 0;
  const rows = CR_SLOTS.filter(s => (c.heroes || {})[s] && c.heroes[s].id).map(s => {
    const h = c.heroes[s], H = _crHeroDef(h.id);
    if (!H) return '';
    const S = _crHeroState(h, H);
    const color = (S.veth && H.altColor) || H.color;
    const out = h.out && CR_OUT[h.out];
    const ask = S.pending[0];
    return `<div class="cr-pm${h.out ? ` out-${h.out}` : ''}" style="--cr-c:${esc(color)}">
      <button type="button" class="cr-pm-name" data-cr-open="${s}"><b>${esc(_crHeroName(h))}</b><span>Roll ${_crSigned(S.mod)}${out ? ` · ${esc(out)}` : ''}</span></button>
      <div class="cr-pm-body">
        <span class="cr-hearts">${_crHeartsHtml(s, S, H)}</span>
        <span class="cr-pm-xp">
          <button type="button" class="rv-dot" data-cr-tok="${s}|-1" aria-label="One XP token less"${h.tok > 0 ? '' : ' disabled'}>&minus;</button>
          <span class="cr-pm-n"><b>${h.tok || 0}</b> XP</span>
          <button type="button" class="rv-dot${split > 0 && mode !== 'play' ? ' on' : ''}" data-cr-tok="${s}|1" aria-label="${split > 0 && mode !== 'play' ? 'Give 1 of the XP to split' : 'One XP token more'}">+</button>
        </span>
        ${mode === 'shop' && h.out !== 'gone' ? `<span class="cr-pm-shop">
          <button type="button" class="cr-mini" data-cr-buyheal="${s}"${S.dmg && c.coins > 0 ? '' : ' disabled'}>&#9829; 1 coin</button>
          <button type="button" class="cr-mini" data-cr-buyxp="${s}"${c.coins > 0 ? '' : ' disabled'}>+1 XP · 1 coin</button></span>` : ''}
      </div>
      ${H.stress ? `<div class="cr-pm-extra"><span class="cr-lbl">Stress</span><span class="cr-tokens">${_crStressHtml(s, h, S, H)}</span>${h.on > 0 ? `<span class="cr-note">threshold ${[0, 5, 9, 15, 22][Math.min(h.on, 4)]}</span>` : ''}</div>` : ''}
      ${H.alt && !S.veth ? `<div class="cr-pm-extra"><span class="cr-lbl">Curse</span><span class="cr-curse">${['1', '20'].map(n => `<button type="button" class="cr-curse-n${h['curse' + n] ? ' on' : ''}" data-cr-curse="${s}|${n}">${n}</button>`).join('')}</span><span class="cr-note">a natural ${h.curse1 ? '20' : h.curse20 ? '1' : '1 or 20'} rolled by anyone</span></div>` : ''}
      ${ask != null ? `<div class="cr-pm-extra cr-pm-ask"><span>XP box ${ask + 1}:</span>${_crPickBtns(s, ask, S)}</div>` : ''}
    </div>`;
  }).join('');
  return `${split > 0 ? `<div class="cr-pool"><span><b>${split} XP</b> to split: tap + on the heroes.</span>${edit ? '<button type="button" class="rv-link" data-cr-pool-drop>none after all</button>' : ''}</div>` : ''}
    <div class="cr-party">${rows}</div>`;
}
function _crHeartsHtml(s, S, H) {
  return Array.from({ length: H.hearts[1] }, (_, i) => {
    if (i >= S.hearts) return '<span class="cr-heart locked" aria-hidden="true">&#9825;</span>';
    const lost = i >= S.hearts - S.dmg;
    return `<button type="button" class="cr-heart${lost ? ' lost' : ''}" data-cr-dmg="${s}|${lost ? -1 : 1}" title="${lost ? 'Heal this heart' : 'Lose this heart'}">&#9829;</button>`;
  }).join('');
}
function _crStressHtml(s, h, S, H) {
  return Array.from({ length: H.stress[1] }, (_, k) => k >= S.stress ? '<span class="cr-token locked" aria-hidden="true"></span>'
    : `<button type="button" class="cr-token${k < (h.on || 0) ? ' charged' : ''}" data-cr-stress="${s}|${k < (h.on || 0) ? -1 : 1}" title="${k < (h.on || 0) ? 'Charged: tap to calm' : 'Calm: tap to charge'}">${k < (h.on || 0) ? '&#9889;' : '&#9728;'}</button>`).join('');
}
function _crPickBtns(s, i, S) {
  return `${S.boxes[i].s === 'X' ? `<button type="button" class="cr-mini" data-cr-pick="${s}|${i}|T">&#9728; Stress token</button>` : `<button type="button" class="cr-mini" data-cr-pick="${s}|${i}|H">&#9829; Heart</button>`}
    <button type="button" class="cr-mini" data-cr-pick="${s}|${i}|M">&#11041; Roll modifier</button>`;
}

// ── The map: CGE's printable one, marked as the party would mark it ──
// Missions crossed off, the road taken drawn on it, the mission ahead
// circled, the shops used, the fail counter and the treasure. A tap on a
// mission works like on the paper map's list: choose the road, take one off.
// Where each circle is comes from the PDF (data/cncr.js art).
const CR_ART = 'images/cncr/';
let _crZoom = null;          // the artwork open full screen: 'map' | 'sheet'
const _crBox = (b) => `left:${(b[0] * 100).toFixed(2)}%;top:${(b[1] * 100).toFixed(2)}%;width:${(b[2] * 100).toFixed(2)}%;height:${(b[3] * 100).toFixed(2)}%`;
const _crCtr = (b) => [b[0] * 100 + b[2] * 50, b[1] * 100 + b[3] * 50];
function _crArtWrap(kind, A, alt, inner) {
  const zoom = _crZoom === kind;
  return `<div class="cr-artwrap${zoom ? ' zoom' : ''}" data-cr-artwrap="${kind}">
    <div class="cr-art" style="aspect-ratio:${A.w}/${A.h}">
      <img src="${CR_ART}${A.img}" alt="${_escapeHtml(alt)}" draggable="false">
      ${inner}
    </div>
    <button type="button" class="cr-zoom" data-cr-zoom="${kind}" aria-label="${zoom ? 'Close' : 'Full screen'}">${zoom ? '&times;' : '&#10530; Full screen'}</button>
  </div>`;
}
function _crRouteHtml(c) {
  const esc = _escapeHtml;
  const map = _crMapOf(c);
  const A = _crData.art.maps[map.key];
  const st = _crMissionStates(c);
  const done = c.done || {};
  const ph = _crPhase(c);
  const cur = ph.play || (ph.next && ph.next.m);
  // the road taken, mission by mission, and on to the one ahead
  const taken = map.missions.filter(m => done[m.k]).sort((x, y) => x.stage - y.stage || x.part - y.part || String(done[x.k]).localeCompare(String(done[y.k])));
  const pts = taken.map(m => _crCtr(A.m[m.k]));
  const ahead = cur && !c.status && A.m[cur.k] ? _crCtr(A.m[cur.k]) : null;
  const svg = `<svg class="cr-roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${pts.length > 1 ? `<polyline points="${pts.map(p => p.join(',')).join(' ')}" vector-effect="non-scaling-stroke"/>` : ''}
      ${pts.length && ahead ? `<line class="ahead" x1="${pts[pts.length - 1][0]}" y1="${pts[pts.length - 1][1]}" x2="${ahead[0]}" y2="${ahead[1]}" vector-effect="non-scaling-stroke"/>` : ''}
    </svg>`;
  const pins = map.missions.map(m => {
    const s = st[m.k], isNext = cur && cur.k === m.k && !c.status;
    const say = s === 'done' ? `done ${_crShortDate(done[m.k])}` : s === 'closed' ? 'the other road' : s === 'locked' ? CR_LOCKS[m.lock] : isNext ? (ph.play ? 'playing now' : 'next') : s === 'open' ? 'open: tap to go there' : 'still ahead';
    return `<button type="button" class="cr-pin cr-${s}${isNext ? ' next' : ''}" style="${_crBox(A.m[m.k])}" data-cr-mis="${m.k}" title="${esc(`${m.n} ${m.place}: ${m.title} (${say})`)}" aria-label="${esc(`Mission ${m.n}, ${m.place}: ${say}`)}">${s === 'done' ? '&#10003;' : s === 'locked' ? '?' : ''}</button>`;
  }).join('');
  const shops = map.shops.map(x => `<button type="button" class="cr-pin cr-pin-shop${(c.shops || {})[x.k] ? ' on' : ''}" style="${_crBox(A.shops[x.k])}" data-cr-shop="${x.k}" title="${esc(`Shop: ${x.at}`)}" aria-label="${esc(`Shop at ${x.at}`)}">${(c.shops || {})[x.k] ? '&#10003;' : ''}</button>`).join('');
  const fails = A.fails.map((b, i) => `<button type="button" class="cr-pin cr-pin-fail${i < (c.fails || 0) ? ' on' : ''}" style="${_crBox(b)}" data-cr-fail="${i + 1}" aria-label="Fail counter box ${i + 1}">${i < (c.fails || 0) ? '&#10007;' : ''}</button>`).join('');
  const coins = `<span class="cr-pin-coins" style="${_crBox(A.treasure)}"><b>${c.coins || 0}</b></span>`;
  const locked = map.missions.filter(m => st[m.k] === 'locked');
  return `${_crArtWrap('map', A, `The ${map.name} map`, svg + pins + shops + fails + coins)}
    ${locked.map(m => `<div class="rv-hint">? ${esc(m.n)} ${esc(m.place)}: ${esc(CR_LOCKS[m.lock])}</div>`).join('')}`;
}

// ── Heroes: one sheet each ──
function _crHeroesHtml(c, edit) {
  const esc = _escapeHtml;
  const heroes = c.heroes || {};
  const slots = CR_SLOTS.filter(s => heroes[s] && heroes[s].id);
  if (!_crHero || !slots.includes(_crHero)) _crHero = slots[0];
  const chips = slots.map(s => {
    const h = heroes[s], H = _crHeroDef(h.id) || {};
    const S = _crHeroDef(h.id) ? _crHeroState(h, H) : null;
    const veth = H.alt && h.curse1 && h.curse20;
    return `<button type="button" class="cr-chip${s === _crHero ? ' on' : ''}" data-cr-hero="${s}" style="--cr-c:${esc((veth && H.altColor) || H.color || '#888')}">
      <b>${esc(_crHeroName(h))}</b><span>${h.out ? esc(CR_OUT[h.out]) : S ? `&#9829; ${S.hearts - S.dmg}/${S.hearts}${h.tok ? ` · ${h.tok} XP waiting` : ''}` : ''}</span></button>`;
  }).join('');
  return `<div class="cr-chips">${chips}</div>${_crHero ? _crSheetHtml(c, _crHero, edit) : ''}`;
}

// A hero's sheet: CGE's printable one, marked as the party marks the paper.
// The roll modifier ringed (the old ones crossed out), a token on each heart
// (red, or flipped when lost), the XP boxes filled in, FCG's Stress tokens,
// Nott's 1 and 20 crossed out, the items in their slots, and the abilities
// still folded away veiled. Tap a heart, a box or a token to change it. Under
// it, what the paper can't say: the XP count, the choices to make, the text.
function _crSheetHtml(c, slot, edit) {
  const esc = _escapeHtml;
  const h = (c.heroes || {})[slot] || {};
  const H = _crHeroDef(h.id);
  if (!H) return '';
  const S = _crHeroState(h, H);
  const P = _crData.art.heroes[H.id];
  const color = (S.veth && H.altColor) || H.color;
  const held = Object.entries(c.items || {}).filter(([, it]) => it && it.on === slot).map(([, it]) => it);
  const outs = [...new Set([...(CR_OUT_MAP[_crMapOf(c).key] || []), ...(h.out ? [h.out] : [])])];
  const glyph = { M: '&#11041;', H: '&#9829;', T: '&#9728;' };
  const ask = S.pending[0];

  // ── marks on the sheet ──
  const mods = P.mods.map((b, i) => i < S.mods ? `<span class="cr-o-mod${i ? '' : ' first'}${i === S.mods - 1 ? ' cur' : ' past'}" style="${_crBox(b)}"></span>` : '').join('');
  const hearts = P.hearts.map((b, i) => {
    if (i >= S.hearts) return '';
    const lost = i >= S.hearts - S.dmg;
    return `<button type="button" class="cr-o-heart${lost ? ' lost' : ''}${i >= H.hearts[0] ? ' earned' : ''}" style="${_crBox(b)}" data-cr-dmg="${slot}|${lost ? -1 : 1}" aria-label="${lost ? 'Heal this heart' : 'Lose this heart'}"><span>&#9829;</span></button>`;
  }).join('');
  const xp = P.xp.map((b, i) => {
    const x = S.boxes[i];
    const chosen = x.on && (x.s === 'C' || x.s === 'X') && glyph[x.got];
    return `<button type="button" class="cr-o-xp${x.on ? ' on' : ''}${S.pending.includes(i) ? ' ask' : ''}${i === S.xp ? ' nxt' : ''}" style="${_crBox(b)}" data-cr-xp="${slot}|${i}" aria-label="XP box ${i + 1}">${chosen ? `<i>${chosen}</i>` : ''}</button>`;
  }).join('');
  const stress = (P.stress || []).map((b, k) => {
    if (k >= S.stress) return '';
    const on = k < (h.on || 0);
    return `<button type="button" class="cr-o-token${on ? ' charged' : ''}${k ? '' : ' printed'}" style="${_crBox(b)}" data-cr-stress="${slot}|${on ? -1 : 1}" aria-label="${on ? 'Charged: tap to calm' : 'Calm: tap to charge'}">${on ? '&#9889;' : k ? '&#9728;' : ''}</button>`;
  }).join('');
  const curse = (P.curse || []).map((b, k) => {
    const n = k ? '20' : '1';
    return `<button type="button" class="cr-o-curse${h['curse' + n] ? ' on' : ''}" style="${_crBox(b)}" data-cr-curse="${slot}|${n}" aria-label="${h['curse' + n] ? `Un-cross ${n}` : `Cross out ${n}`}"></button>`;
  }).join('');
  const veth = S.veth && P.nimble ? `<span class="cr-o-cross" style="${_crBox(P.nimble)}"></span><span class="cr-o-glow" style="${_crBox(P.lucky)}"></span>
      <span class="cr-o-cross thin" style="${_crBox(P.names[0])}"></span><span class="cr-o-glow" style="${_crBox(P.names[1])}"></span>` : '';
  const slots = P.slots.map((b, k) => {
    if (k >= S.slots) return '';
    const it = held[k];
    return `<span class="cr-o-slot${k ? ' earned' : ''}" style="${_crBox(b)}">${it ? `<em class="${it.kind === 'once' ? 'once' : ''}">${esc(it.name)}</em>` : ''}</span>`;
  }).join('');
  const tabs = P.tabs.map((b, k) => {
    if (S.abil >= k + 1) return '';
    const at = S.boxes.findIndex(x => x.s === String(k + 1));
    return `<div class="cr-o-veil" style="${_crBox(b)}"><span>&#128274; XP box ${at + 1}${at >= S.xp ? ` &middot; ${at + 1 - S.xp} more XP` : ''}</span></div>`;
  }).join('');
  const out = h.out ? `<div class="cr-o-out"><span>${esc(CR_OUT[h.out])}</span></div>` : '';
  const sheet = _crArtWrap('sheet', P, `${H.name}'s hero sheet`, mods + hearts + xp + stress + curse + veth + slots + tabs + out);

  // ── what the paper can't say ──
  const upcoming = S.boxes.findIndex((b, k) => k >= S.xp && b.s !== '.');
  const what = (s) => /[123]/.test(s) ? `ability ${s}` : { M: 'a better roll modifier', H: 'a heart', S: 'an item slot', T: 'a Stress token', C: 'a heart or a roll modifier', X: 'a Stress token or a roll modifier' }[s];
  const table = (rows) => rows ? `<table class="cr-tbl">${rows.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>` : '';
  const grid = (cells) => {
    if (!cells) return '';
    const on = new Set(cells.map(([r, k]) => `${r}-${k}`));
    return `<div class="cr-grid" aria-hidden="true">${[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(k => `<span class="${(r === 0 || r === 4) && (k === 0 || k === 4) ? 'gap' : on.has(`${r}-${k}`) ? 'on' : ''}"></span>`).join('')).join('')}</div>`;
  };
  const trait = S.veth ? H.altTrait : H.trait;
  const abilities = H.abilities.map((a, k) => {
    const n = k + 1, open = S.abil >= n;
    const at = S.boxes.findIndex(b => b.s === String(n));
    const inner = `<div class="cr-text">${esc(a.text)}</div>${grid(a.grid)}${table(a.table)}`;
    return open
      ? `<div class="cr-ab"><div class="cr-ab-head"><span class="cr-ab-n">${n}</span><b>${esc(a.name)}</b><span class="cr-ab-when">${esc(a.when)}</span></div>${inner}</div>`
      : `<details class="cr-ab locked"><summary><span class="cr-ab-n">${n}</span><b>${esc(a.name)}</b><span class="cr-ab-when">unlocks at XP box ${at + 1}${at >= S.xp ? ` · ${at + 1 - S.xp} more XP` : ''}</span></summary>${inner}</details>`;
  }).join('');
  const others = _crData.heroes.filter(x => x.id === h.id || !CR_SLOTS.some(s => s !== slot && ((c.heroes || {})[s] || {}).id === x.id));

  return `<div class="cr-sheet" style="--cr-c:${esc(color)}">
    ${sheet}
    <div class="cr-sheet-facts">
      <span><b>${_crSigned(S.mod)}</b> roll${H.id === 'grog' && S.dmg ? ' (with Tough)' : ''}</span>
      <span><b>${S.hearts - S.dmg}</b> of ${S.hearts} &#9829;</span>
      <span><b>${S.slots}</b> item slot${S.slots === 1 ? '' : 's'}${held.length > S.slots ? ' <em class="cr-warn">too many items</em>' : ''}</span>
    </div>
    <div class="cr-xp-top">
      <span class="cr-lbl">XP</span>
      <button type="button" class="rv-dot" data-cr-xpstep="${slot}|-1" aria-label="One XP less"${S.xp ? '' : ' disabled'}>&minus;</button>
      <span class="cr-xp-n"><b>${S.xp}</b> / ${S.total}</span>
      <button type="button" class="rv-dot" data-cr-xpstep="${slot}|1" aria-label="One XP more"${S.xp < S.total ? '' : ' disabled'}>+</button>
      ${upcoming >= 0 ? `<span class="cr-note">${upcoming + 1 - S.xp} more for ${what(S.boxes[upcoming].s)}</span>` : '<span class="cr-note">the track is full</span>'}
    </div>
    ${h.tok ? `<div class="cr-note cr-tok-note">${h.tok} XP token${h.tok === 1 ? '' : 's'} waiting: marked here when you level up, or when the next mission starts.</div>` : ''}
    ${ask == null ? '' : `<div class="cr-ask"><span>XP box ${ask + 1}: which one?</span>${_crPickBtns(slot, ask, S)}</div>`}
    ${outs.length ? `<div class="cr-row"><span class="cr-lbl">Status</span><span class="cr-seg cr-seg-sm">${['', ...outs].map(o => `<button type="button" class="cr-seg-b${(h.out || '') === o ? ' on' : ''}" data-cr-out="${slot}|${o}">${o ? esc(CR_OUT[o]) : 'in the party'}</button>`).join('')}</span></div>` : ''}
    ${trait ? `<div class="cr-box"><div class="cr-box-title">${esc(trait.name)}${S.veth ? ` <span class="cr-note">instead of <s>${esc(H.trait.name)}</s></span>` : ''}</div><div class="cr-text">${esc(trait.text)}</div>${table(trait.table)}</div>` : ''}
    ${H.alt ? `<div class="cr-box"><div class="cr-box-title">Lifting the curse</div><div class="cr-text">${esc(H.curse)}${S.veth ? ' Done: Nott is Veth again.' : ''}</div></div>` : ''}
    <div class="rv-sub">Abilities</div>
    ${abilities}
    ${edit && !S.xp && !h.tok ? `<div class="rv-sub">A different hero?</div><div class="cr-seg cr-seg-wrap">${others.map(x => `<button type="button" class="cr-seg-b${x.id === h.id ? ' on' : ''}" data-cr-swap="${slot}|${x.id}" style="--cr-c:${esc(x.color)}">${esc(x.short || x.name)}</button>`).join('')}</div>` : ''}
  </div>`;
}

// ── Items: shared by the party, each held by a hero for the mission ──
function _crItemAddHtml(mode) {
  return `<div class="cr-item-add">
    <input class="rv-in cr-item-name" data-cr-item-name placeholder="Item name" maxlength="60">
    <span class="cr-seg cr-seg-sm"><button type="button" class="cr-seg-b green${_crKind === 'always' ? ' on' : ''}" data-cr-item-kind="always">Green</button><button type="button" class="cr-seg-b orange${_crKind === 'once' ? ' on' : ''}" data-cr-item-kind="once">Orange</button></span>
    <input class="rv-in cr-item-cost" data-cr-item-cost type="number" min="0" max="30" inputmode="numeric" placeholder="Cost" aria-label="Cost in coins">
    <button type="button" class="rv-btn rv-btn-sm" data-cr-item-add="${mode}">${mode === 'buy' ? 'Buy' : 'Add'}</button>
  </div>`;
}
function _crItemsHtml(c, edit) {
  const esc = _escapeHtml;
  const items = Object.entries(c.items || {}).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
  const party = _crInParty(c);
  return `<div class="rv-hint rv-hint-top">Items belong to the party: before each mission, choose who holds what (each hero has their item slots). Green ones work all mission; orange ones once a mission, ready again for the next.</div>
    ${items.length ? `<div class="cr-items">${items.map(([k, it]) => `<div class="cr-item ${it.kind === 'once' ? 'once' : 'always'}">
        <div class="cr-item-main"><b>${esc(it.name)}</b><span>${it.kind === 'once' ? 'Once per mission' : 'All mission'}${it.cost ? ` · cost ${it.cost}` : ''}</span></div>
        <div class="cr-seg cr-seg-sm cr-item-who">${party.map(s => `<button type="button" class="cr-seg-b${it.on === s ? ' on' : ''}" data-cr-item-on="${esc(k)}|${s}" style="--cr-c:${esc((_crHeroDef(c.heroes[s].id) || {}).color || '#888')}">${esc(_crHeroName(c.heroes[s]))}</button>`).join('')}</div>
        ${edit ? `<button type="button" class="rv-link cr-item-x" data-cr-item-x="${esc(k)}">${it.cost > 1 ? `sell for ${it.cost - 1}` : 'remove'}</button>` : ''}
      </div>`).join('')}</div>` : '<div class="gm-empty">No items yet: they come from the shops and the missions.</div>'}
    ${edit ? `<div class="rv-sub">Add an item</div>${_crItemAddHtml('free')}` : ''}`;
}

function _crNotesHtml(c, edit) {
  return `<textarea class="rv-in cr-notes" data-cr-text="notes" rows="10" placeholder="What the party learned, promises made, where you stopped…" ${edit ? '' : 'readonly'}>${_escapeHtml(c.notes || '')}</textarea>`;
}

// ── what a tap or an edit does ──
async function _crClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.crZoom) { _crZoom = _crZoom ? null : ds.crZoom; _crRender(panel); return; }
  if (ds.crTab) { _crTab = ds.crTab; _crZoom = null; _crRender(panel); return; }
  if (ds.crHero) { _crHero = ds.crHero; _crZoom = null; _crRender(panel); return; }
  if (ds.crOpen) { _crHero = ds.crOpen; _crTab = 'heroes'; _crZoom = null; _crRender(panel); panel.scrollIntoView({ block: 'start' }); return; }
  if (ds.crItemKind) {
    // switched in place: the name typed stays
    _crKind = ds.crItemKind;
    t.parentElement.querySelectorAll('[data-cr-item-kind]').forEach(b => b.classList.toggle('on', b === t));
    return;
  }
  if (ds.crCamp) {
    // a campaign's tab: opens it, or closes it when it's the one open
    const id = ds.crCamp;
    if (id === '__new') {
      const open = !_crId && _crDraft;
      _crId = null;
      _crDraft = open ? null : { map: 'taldorei', name: '', heroes: [...CR_FIRST], gm: '', players: _crMe() ? [_crMe()] : [] };
    } else if (_crId === id) _crId = null;
    else { _crId = id; _crDraft = null; _crHero = null; _crTab = 'map'; _crRw = null; }
    _crZoom = null;
    _crRender(panel);
    return;
  }
  if (!_crId) return _crDraftClick(panel, t, ds);
  if (ds.crRwTime || ds.crRwPick || ds.crRwHero || ds.crRwKeep || ds.crRwFlag !== undefined) {
    // the reward as this phone fills it in, saved when it's taken
    const w = _crRw;
    if (!w) return;
    if (ds.crRwTime) w.time = Math.max(0, Math.min(6, w.time + Number(ds.crRwTime)));
    else if (ds.crRwPick) w.pick = Number(ds.crRwPick);
    else if (ds.crRwHero) w.hero = ds.crRwHero;
    else if (ds.crRwKeep) w.keep = w.keep.includes(ds.crRwKeep) ? w.keep.filter(s => s !== ds.crRwKeep) : [...w.keep, ds.crRwKeep];
    else w.flag = !w.flag;
    _crRender(panel);
    return;
  }
  const c = _crCamps[_crId];
  if (!c || !_crCanEdit(c)) return;
  const map = _crMapOf(c);
  const hero = (s) => c.heroes[s];
  const up = {};
  let note = '', ok = false;
  let after = null;   // a mission's line, whose play is logged once it's saved
  if (ds.crStop !== undefined) {
    if (!confirm('Stop this campaign? Everything stays as it is, under "Stopped and finished", and it can be picked up again any time.')) return;
    up.status = 'stopped';
    up.stopped = Date.now();
    up.playing = null;
    note = 'Stopped. Pick it up again from its tab any time.';
    ok = true;
  } else if (ds.crResume !== undefined) {
    up.status = null;
    up.stopped = null;
  } else if (ds.crLogplay) {
    t.disabled = true;
    _crAfterMission(_crId, ds.crLogplay);
    return;
  } else if (ds.crPersonX) {
    const me = _crMe();
    if (ds.crPersonX === me && !confirm('Take yourself off this campaign? You won\'t be able to fill it in after that.')) return;
    up.players = _crList(c.players).filter(p => p !== ds.crPersonX);
  } else if (ds.crMis) {
    const k = ds.crMis, st = _crMissionStates(c)[k], m = _crMis(c, k);
    if (st === 'done') {
      if (!confirm(`Take mission ${m.n} (${m.place}) off the map?`)) return;
      up[`done/${k}`] = null;
      if (c.status === 'won') up.status = null;
    } else if (st === 'locked') {
      if (!confirm(`${m.n} ${m.place} is locked. ${CR_LOCKS[m.lock]} Open it?`)) return;
      up[`unlock/${k}`] = true;
    } else if (st === 'open' && !c.playing && !c.reward) up.next = k;
    else return;
  } else if (ds.crGo) up.next = ds.crGo;
  else if (ds.crBegin) {
    const m = _crMis(c, ds.crBegin);
    if (c.split > 0) { _crToast(`Split the ${c.split} XP among the heroes first.`); return; }
    up.playing = m.k;
    up.next = m.k;
    up.split = null;
    up.from = Date.now();   // when it began: the play's time and length
    const healed = [];
    for (const s of CR_SLOTS) {
      const h = hero(s);
      if (!h || !h.id) continue;
      if (h.tok) _crSpend(c, s, up);
      // Grog's Tough: 1 heart back at the start of every mission
      if (h.id === 'grog' && h.dmg && _crInParty(c).includes(s)) { up[`heroes/${s}/dmg`] = h.dmg - 1 || null; healed.push('Grog healed 1 heart'); }
    }
    note = `Mission ${m.n} on. ${healed.join('. ')}${healed.length ? '. ' : ''}Good luck!`;
    ok = true;
  } else if (ds.crCancel !== undefined) { up.playing = null; up.from = null; }
  else if (ds.crWon) {
    const m = _crMis(c, ds.crWon), d = _crRules(c, m.k);
    up[`done/${m.k}`] = _crToday();
    up.playing = null;
    up.next = null;
    up.from = null;
    after = String(Date.now());
    up[`log/${after}`] = { m: m.k, won: true, at: Date.now(), by: _crMe() || '', ...(c.gm ? { gm: c.gm } : {}), ...(c.from ? { from: c.from } : {}) };
    if (_crFinale(c, m)) { up.status = 'won'; note = 'The campaign is won!'; }
    else if (d.reward || d.ask) { up.reward = m.k; _crRw = null; note = 'Mission won! Now the reward.'; }
    ok = true;
  } else if (ds.crLost) {
    const m = _crMis(c, ds.crLost);
    const n = Math.min((c.fails || 0) + 1, CR_FAILS.length), f = CR_FAILS[n - 1];
    up.fails = n;
    up.playing = null;
    up.from = null;
    after = String(Date.now());
    up[`log/${after}`] = { m: m.k, won: false, at: Date.now(), by: _crMe() || '', ...(c.gm ? { gm: c.gm } : {}), ...(c.from ? { from: c.from } : {}) };
    if (f.lost) up.status = 'lost';
    else {
      _crHeal(c, up, f.heal);
      if (f.xp) up.split = (c.split || 0) + f.xp;
    }
    // falling back: lost the first mission of a road, the party may take another
    const other = m.branch && m.part === 1 && map.missions.some(x => x.stage === m.stage && x.branch !== m.branch && _crMissionStates(c)[x.k] === 'open');
    note = f.lost ? 'The fail counter ran out: the campaign is lost.'
      : `Fail counter ${n}: ${f.text} Healing done.${f.xp ? ` Split the ${f.xp} XP below.` : ''} Then play it again${other ? ', or fall back and take the other road on the map' : ''}.`;
  } else if (ds.crTake) {
    const r = _crTake(c, _crMis(c, ds.crTake));
    if (!r) return;
    if (r.err) { _crToast(r.err); return; }
    Object.assign(up, r.up);
    note = r.note;
    ok = true;
  } else if (ds.crBack) {
    const s = ds.crBack;
    up[`heroes/${s}/out`] = null;
    up[`heroes/${s}/tok`] = (hero(s).tok || 0) + 8;
    up.coins = (c.coins || 0) + 3;
    note = `${_crHeroName(hero(s))} is back: 8 XP and 3 coins.`;
    ok = true;
  } else if (ds.crOffer !== undefined) {
    const s = map.shops.find(x => x.offering);
    if ((c.unlock || {})['6']) { up['unlock/6'] = null; up.coins = (c.coins || 0) + s.offering; }
    else { up['unlock/6'] = true; up.coins = (c.coins || 0) - s.offering; note = 'The offering is made: mission 6 waits after Yios.'; ok = true; }
  } else if (ds.crShopdone) {
    up[`shops/${ds.crShopdone}`] = true;
    const away = map.shops.find(x => x.k === ds.crShopdone).haldane && CR_SLOTS.find(s => hero(s) && hero(s).out === 'quest');
    if (away) {
      up[`heroes/${away}/out`] = null;
      up[`heroes/${away}/tok`] = (hero(away).tok || 0) + 8;
      up.coins = (c.coins || 0) + 3;
      note = `${_crHeroName(hero(away))} is back from escorting Haldane: 8 XP and 3 coins.`;
    }
  } else if (ds.crBuyheal || ds.crBuyxp) {
    const s = ds.crBuyheal || ds.crBuyxp, h = hero(s);
    if (!(c.coins > 0)) return;
    up.coins = c.coins - 1;
    if (ds.crBuyheal) up[`heroes/${s}/dmg`] = Math.max(0, (h.dmg || 0) - 1) || null;
    else up[`heroes/${s}/tok`] = (h.tok || 0) + 1;
  } else if (ds.crTok) {
    const [s, d] = ds.crTok.split('|'), h = hero(s);
    const between = !c.playing;
    // between missions + and − give out (and take back) the XP to split
    if (Number(d) > 0 && between && c.split > 0) up.split = c.split - 1;
    else if (Number(d) < 0 && between && c.split != null) up.split = (c.split || 0) + 1;
    up[`heroes/${s}/tok`] = Math.max(0, (h.tok || 0) + Number(d)) || null;
  } else if (ds.crPoolDrop !== undefined) up.split = null;
  else if (ds.crLevelup !== undefined) {
    for (const s of CR_SLOTS) if (hero(s) && hero(s).tok) _crSpend(c, s, up);
    up.split = null;
    note = 'Marked on the sheets.';
    ok = true;
  } else if (ds.crFail) {
    const n = Number(ds.crFail);
    up.fails = n === (c.fails || 0) ? n - 1 : n;
    up.status = up.fails >= CR_FAILS.length ? 'lost' : c.status === 'lost' ? null : c.status || null;
  } else if (ds.crShop) up[`shops/${ds.crShop}`] = (c.shops || {})[ds.crShop] ? null : true;
  else if (ds.crCoins) up.coins = Math.max(0, (c.coins || 0) + Number(ds.crCoins));
  else if (ds.crDmg) {
    const [s, d] = ds.crDmg.split('|');
    const S = _crHeroState(hero(s), _crHeroDef(hero(s).id));
    up[`heroes/${s}/dmg`] = Math.max(0, Math.min(S.hearts, S.dmg + Number(d))) || null;
  } else if (ds.crStress) {
    const [s, d] = ds.crStress.split('|');
    const S = _crHeroState(hero(s), _crHeroDef(hero(s).id));
    up[`heroes/${s}/on`] = Math.max(0, Math.min(S.stress, (hero(s).on || 0) + Number(d))) || null;
  } else if (ds.crCurse) {
    const [s, n] = ds.crCurse.split('|');
    up[`heroes/${s}/curse${n}`] = hero(s)['curse' + n] ? null : true;
    if (!hero(s)['curse' + n] && hero(s)['curse' + (n === '1' ? '20' : '1')]) { note = 'The curse is lifted: Nott is Veth again, and Lucky works from now on.'; ok = true; }
  } else if (ds.crXp || ds.crXpstep) {
    const [s, v] = (ds.crXp || ds.crXpstep).split('|');
    const h = hero(s);
    const cur = h.xp || 0, total = _crHeroDef(h.id).track.replace(/\|/g, '').length;
    // a box: marked up to it (the last one marked: unmarked); a step: one more or less
    let xp = ds.crXp ? (Number(v) === cur - 1 ? cur - 1 : Number(v) + 1) : cur + Number(v);
    xp = Math.max(0, Math.min(total, xp));
    if (xp < cur - 1 && !confirm(`Unmark XP boxes ${xp + 1}–${cur}?`)) return;
    up[`heroes/${s}/xp`] = xp || null;
    for (const i in (h.pick || {})) if (Number(i) >= xp) up[`heroes/${s}/pick/${i}`] = null;
  } else if (ds.crPick) {
    const [s, i, p] = ds.crPick.split('|');
    up[`heroes/${s}/pick/${i}`] = p;
  } else if (ds.crOut) {
    const [s, o] = ds.crOut.split('|');
    up[`heroes/${s}/out`] = o || null;
    if (o === 'quest' || o === 'gone') for (const [k, it] of Object.entries(c.items || {})) if (it && it.on === s) up[`items/${k}/on`] = null;
  } else if (ds.crSwap) {
    const [s, id] = ds.crSwap.split('|');
    if (id === hero(s).id) return;
    up[`heroes/${s}`] = { id };
  } else if (ds.crItemAdd) {
    const box = t.closest('.cr-item-add');
    const name = box.querySelector('[data-cr-item-name]').value.trim();
    const cost = Math.max(0, Math.min(30, parseInt(box.querySelector('[data-cr-item-cost]').value, 10) || 0));
    if (!name) { box.querySelector('[data-cr-item-name]').focus(); return; }
    if (ds.crItemAdd === 'buy') {
      if (!cost) { _crToast('How much did it cost?'); return; }
      if (cost > (c.coins || 0)) { _crToast(`Not enough coins: ${c.coins || 0} left.`); return; }
      up.coins = (c.coins || 0) - cost;
    }
    up[`items/${Date.now()}`] = { name: name.slice(0, 60), kind: _crKind, at: Date.now(), ...(cost ? { cost } : {}) };
    _crKind = 'always';
    note = `${name} added${ds.crItemAdd === 'buy' ? ` for ${cost} coin${cost === 1 ? '' : 's'}` : ''}. Who holds it is on the Items tab.`;
    ok = true;
  } else if (ds.crItemOn) {
    const [k, s] = ds.crItemOn.split('|');
    up[`items/${k}/on`] = (c.items[k] || {}).on === s ? null : s;
  } else if (ds.crItemX) {
    const it = (c.items || {})[ds.crItemX] || {};
    const value = it.cost > 1 ? it.cost - 1 : 0;
    if (!confirm(value ? `Sell ${it.name || 'this item'} for ${value} coin${value === 1 ? '' : 's'}?` : `Remove ${it.name || 'this item'}?`)) return;
    up[`items/${ds.crItemX}`] = null;
    if (value) up.coins = (c.coins || 0) + value;
  }
  if (!Object.keys(up).length) return;
  const id = _crId;
  const saved = _crPatch(up);
  _crRender(panel);
  if (note) _crToast(note, ok);
  if (after) saved.then(() => _crAfterMission(id, after));
}
// The XP tokens a hero's waiting with, marked on their track.
function _crSpend(c, s, up) {
  const h = c.heroes[s], H = _crHeroDef(h.id);
  if (!H) return;
  up[`heroes/${s}/xp`] = Math.min(H.track.replace(/\|/g, '').length, (h.xp || 0) + (h.tok || 0)) || null;
  up[`heroes/${s}/tok`] = null;
}
// A lost mission's healing: half the lost hearts (rounded up), or all of them.
function _crHeal(c, up, how) {
  for (const s of _crInParty(c)) {
    const h = c.heroes[s];
    if (!h.dmg) continue;
    const left = how === 'all' ? 0 : h.dmg - Math.ceil(h.dmg / 2);
    up[`heroes/${s}/dmg`] = left || null;
  }
}

async function _crDraftClick(panel, t, ds) {
  const d = _crDraft;
  if (!d) return;
  if (ds.crDraftMap) d.map = ds.crDraftMap;
  else if (ds.crDraftHero) {
    const id = ds.crDraftHero;
    if (d.heroes.includes(id)) d.heroes = d.heroes.filter(x => x !== id);
    else if (d.heroes.length >= 3) { _crToast('A party is 3 heroes: tap one of them to take it out first.'); return; }
    else d.heroes.push(id);
  } else if (ds.crDraftX) d.players = d.players.filter(p => p !== ds.crDraftX);
  else if (ds.crStart !== undefined) {
    // a name still being typed counts
    const typed = _crWhoClean((panel.querySelector('[data-cr-who="dplayer"]') || {}).value);
    if (typed && !d.players.includes(typed)) d.players.push(typed);
    d.gm = _crWhoClean((panel.querySelector('[data-cr-who="dgm"]') || {}).value);
    if (d.heroes.length !== 3) { _crToast('Pick 3 heroes.'); return; }
    t.disabled = true;
    const heroes = {};
    d.heroes.forEach((id, i) => { heroes[CR_SLOTS[i]] = { id }; });
    try {
      await _crCreate({ name: d.name.trim(), map: d.map, heroes, players: d.players.filter(p => p !== d.gm), ...(d.gm ? { gm: d.gm } : {}), fails: 0, coins: 0, created: Date.now(), updated: Date.now(), by: _crMe() });
    } catch (e) {
      console.warn('Codenames campaign: not started', e);
      t.disabled = false;
      t.textContent = 'Couldn\'t start it. Try again';
      return;
    }
    _crDraft = null;
    _crTab = 'map';
  } else return;
  _crRender(panel);
}

function _crChange(panel, ev) {
  if (ev.target.matches('[data-cr-who="gm"]')) _crWhoSet(panel, 'gm', ev.target.value, true);
}

// Typing in the party name or the notes: saved a moment after you stop.
function _crInput(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-cr-draft-name]') && _crDraft) { _crDraft.name = t.value; return; }
  if (t.matches('[data-cr-who="dgm"]') && _crDraft) { _crDraft.gm = t.value; return; }
  const path = t.dataset && t.dataset.crText;
  if (!path) return;
  const c = _crCamps[_crId];
  if (!c || !_crCanEdit(c)) return;
  clearTimeout(_crSaveTimers[path]);
  _crSaveTimers[path] = setTimeout(() => _crPatch({ [path]: t.value }), 700);
}
