// ── Codenames: Critical Role Adventures campaign (the Campaign tab on its game page) ──
// Each party's campaign, kept in Firebase (crCampaigns/{id}) so anyone at the
// table can fill it in on their phone, and each party carries on its own: the
// route on the map (missions done, the road taken), the mission fail counter,
// the treasure, the shops used, the items, and the three heroes' sheets, each
// with its player: XP track, hearts, roll modifier, item slots and the
// abilities unlocked so far. A campaign opens on the viewer's own (the latest
// they're in). What the heroes are is in data/cncr.js, loaded when the tab
// opens; the maps are here, since Log a play's mission list needs them too.

const CNCR_BGGID = 465849;
const _crM = (n, place, more) => {
  const m = String(n).match(/^(\d+)([ab]?)(?:-(\d))?$/);
  return { n, k: n === '?' ? 'q' : n, place, stage: m ? Number(m[1]) : 0, branch: m ? m[2] : '', part: m && m[3] ? Number(m[3]) : 1, secret: n === '?', ...more };
};
// The three campaigns, as their maps draw them: missions by number (2a or 2b:
// the party picks a road; 4a-1 then 4a-2: two missions in one place), the
// shops on the way, and the secret one ("?") the campaign book sends you to.
const CR_MAPS = [
  { key: 'taldorei', name: 'Tal\'Dorei', num: 1, missions: [
    _crM('1', 'Whitestone'), _crM('2a', 'Drynna'), _crM('2b', 'Westruun'), _crM('3', 'Stilben'),
    _crM('4a', 'Syngorn'), _crM('4b', 'Kymal'), _crM('5', 'Kraghammer'), _crM('6', 'Emon', { finale: true }), _crM('?', 'Byroden')],
    shops: [{ k: 's1', at: 'Stilben', before: 3 }, { k: 's2', at: 'Emon', before: 6 }] },
  { key: 'wildemount', name: 'Wildemount', num: 2, missions: [
    _crM('1', 'Port Zoon'), _crM('2a', 'Ruins of Shattengrod'), _crM('2b', 'Zadash'), _crM('3', 'Rexxentrum'),
    _crM('4a-1', 'Icehaven'), _crM('4a-2', 'Icehaven'), _crM('4b', 'Uthodurn'),
    _crM('5a', 'Aeor crash site', { finale: true }), _crM('5b', 'Mutalos', { finale: true }), _crM('?', 'Rumblecusp')],
    shops: [{ k: 's1', at: 'Rexxentrum', before: 3 }, { k: 's2', at: 'Syrinlya', before: 5 }] },
  { key: 'marquet', name: 'Marquet', num: 3, missions: [
    _crM('1', 'Foothills of the Serpentwind Peaks'), _crM('2a', 'Heartmoor Hamlet'), _crM('2b', 'Jrusar'), _crM('3', 'Ank\'Harel'),
    _crM('4a-1', 'Gelvaan'), _crM('4a-2', 'Gelvaan'), _crM('4b-1', 'Bassuras'), _crM('4b-2', 'Bassuras'),
    _crM('5', 'Yios', { finale: true }), _crM('?', 'the storm')],
    shops: [{ k: 's1', at: 'Ank\'Harel', before: 3 }, { k: 's2', at: 'Yios', before: 5 }] },
];
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

let _crData = null;          // data/cncr.js
let _crCamps = null;         // crCampaigns from Firebase: {id: campaign}
let _crSrc = {};             // id → the store it lives in ('main' | 'spare', see fbWrite)
let _crCampsAt = 0;
let _crId = null;            // the campaign on screen; null: the start form
let _crTab = 'map';          // 'map' | 'heroes' | 'items' | 'notes'
let _crHero = null;          // the hero slot shown on the Heroes tab
let _crDraft = null;         // the start form
let _crSaveTimers = {};

const _crMapOf = (c) => CR_MAPS.find(m => m.key === (c && c.map)) || CR_MAPS[0];
const _crHeroDef = (id) => (_crData && _crData.heroes.find(h => h.id === id)) || null;
const _crToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const _crSigned = (v) => (v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '+0');

function _crMe() { return typeof _navPlayer === 'function' ? _navPlayer() : null; }
// Everyone at the table: the heroes' players and whoever else plays (the GM goes round).
function _crPlayers(c) {
  const out = new Set((c && c.players) || []);
  for (const s of CR_SLOTS) { const h = ((c && c.heroes) || {})[s]; if (h && h.player) out.add(h.player); }
  return [...out];
}
function _crCanEdit(c) {
  const me = _crMe();
  if (!me) return false;
  const players = _crPlayers(c);
  return !players.length || players.includes(me);
}

async function _crLoad(force) {
  if (!_crData) {
    const src = await (await fetch('data/cncr.js', { cache: 'no-cache' })).text();
    _crData = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  }
  if (force || !_crCamps || Date.now() - _crCampsAt > 15000) {
    const { main, spare } = await fbReadBoth('crCampaigns');
    _crCamps = {};
    _crSrc = {};
    for (const [store, data] of [['spare', spare], ['main', main]]) {
      for (const id in (data || {})) { _crCamps[id] = data[id]; _crSrc[id] = store; }
    }
    _crCampsAt = Date.now();
  }
  if (_crId && !_crCamps[_crId]) _crId = null;
  if (!_crId && !_crDraft) {
    // the viewer's own campaign, the one played most recently
    const me = _crMe();
    _crId = Object.keys(_crCamps).filter(id => me && _crPlayers(_crCamps[id]).includes(me))
      .sort((a, b) => (_crCamps[b].updated || 0) - (_crCamps[a].updated || 0))[0] || null;
  }
}

// Write some fields of the campaign: {path: value}, path relative to it
// ("done/2a", "heroes/h0/xp"); null removes. Firebase applies them together
// without touching the rest, so two phones filling in different boxes don't
// overwrite each other.
async function _crPatch(updates) {
  const c = _crCamps[_crId];
  if (!c) return;
  for (const [path, v] of Object.entries(updates)) {
    const parts = path.split('/');
    let o = c;
    for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
    if (v === null) delete o[parts[parts.length - 1]]; else o[parts[parts.length - 1]] = v;
  }
  c.updated = Date.now();
  try {
    await fbWrite(`crCampaigns/${_crId}`, 'PATCH', { ...updates, updated: c.updated }, _crSrc[_crId]);
  } catch (e) {
    console.warn('Codenames campaign: not saved', e);
    _crToast('Not saved. Check the connection and try again.');
  }
}
async function _crCreate(c) {
  const { store, json } = await fbWrite('crCampaigns', 'POST', c);
  _crCamps[json.name] = c;
  _crSrc[json.name] = store;
  _crId = json.name;
}
function _crToast(msg) {
  const el = document.querySelector('.cr .rv-toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(_crToast.t);
  _crToast.t = setTimeout(() => { el.hidden = true; }, 4500);
}

// ── The route: which missions are done, open, on the other road or still ahead ──
function _crMissionStates(c) {
  const map = _crMapOf(c);
  const done = (c && c.done) || {};
  const st = {};
  let prevDone = true;
  for (const s of [...new Set(map.missions.filter(m => !m.secret).map(m => m.stage))].sort((a, b) => a - b)) {
    const ms = map.missions.filter(m => m.stage === s);
    const taken = ms.find(m => done[m.k]);   // the road taken through this stage
    for (const m of ms) {
      if (done[m.k]) st[m.k] = 'done';
      else if (taken && m.branch !== taken.branch) st[m.k] = 'closed';
      else if (!prevDone || (m.part > 1 && !ms.some(o => o.branch === m.branch && o.part === m.part - 1 && done[o.k]))) st[m.k] = 'later';
      else st[m.k] = 'open';
    }
    prevDone = !!taken && ms.filter(m => m.branch === taken.branch).every(m => done[m.k]);
  }
  for (const m of map.missions) if (m.secret) st[m.k] = done[m.k] ? 'done' : 'open';
  return st;
}
// The mission to play next: the one the party chose, else the only one open.
function _crNext(c) {
  const map = _crMapOf(c);
  const st = _crMissionStates(c);
  const chosen = c.next && map.missions.find(m => m.k === c.next && st[m.k] === 'open');
  if (chosen) return { m: chosen };
  const open = map.missions.filter(m => !m.secret && st[m.k] === 'open');
  return open.length === 1 ? { m: open[0] } : { choice: open };
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

// ── rendering ──
function buildCrCampaignHtml(game) {
  if (!game || Number(game.bggId) !== CNCR_BGGID) return '';
  return `<div class="rv cr" data-cr><div class="rv-loading">Opening the campaign…</div></div>`;
}

function wireCrCampaign(content) {
  const panel = content.querySelector('[data-cr]');
  if (!panel) return;
  _crLoad(true).then(() => _crRender(panel)).catch(e => {
    panel.innerHTML = `<div class="rv-loading">The campaign couldn't be loaded. Try again in a moment.</div>`;
    console.warn('Codenames campaign:', e);
  });
  panel.addEventListener('click', (ev) => _crClick(panel, ev));
  panel.addEventListener('change', (ev) => _crChange(panel, ev));
  panel.addEventListener('input', (ev) => _crInput(panel, ev));
}

function _crLabel(c) {
  const heroes = CR_SLOTS.map(s => ((c.heroes || {})[s] || {}).id).filter(Boolean).map(id => (_crHeroDef(id) || {}).short || (_crHeroDef(id) || {}).name || id);
  return `${c.name || heroes.join(', ') || 'A party'} · ${_crMapOf(c).name}${c.status === 'won' ? ' · won' : c.status === 'lost' ? ' · lost' : ''}`;
}
function _crPickerHtml() {
  const esc = _escapeHtml;
  const me = _crMe();
  const ids = Object.keys(_crCamps).sort((a, b) => (_crCamps[b].updated || 0) - (_crCamps[a].updated || 0));
  const mine = ids.filter(id => me && _crPlayers(_crCamps[id]).includes(me)), others = ids.filter(id => !mine.includes(id));
  const opt = (id) => `<option value="${esc(id)}"${id === _crId ? ' selected' : ''}>${esc(_crLabel(_crCamps[id]))}</option>`;
  const group = (label, list) => !list.length ? '' : mine.length && others.length ? `<optgroup label="${label}">${list.map(opt).join('')}</optgroup>` : list.map(opt).join('');
  return `<select class="rv-in rv-pick cr-pick" data-cr-camp aria-label="Campaign">
    ${group('Yours', mine)}${group('Other parties', others)}
    <option value="__new"${_crId ? '' : ' selected'}>+ A new campaign</option></select>`;
}

function _crRender(panel) {
  const esc = _escapeHtml;
  const c = _crId && _crCamps[_crId];
  if (!c) {
    panel.innerHTML = `${Object.keys(_crCamps).length ? `<div class="rv-head cr-head-new">${_crPickerHtml()}</div>` : ''}${_crStartHtml()}<div class="rv-toast" hidden></div>${_crCreditHtml()}`;
    return;
  }
  const edit = _crCanEdit(c);
  const tabs = [['map', 'Campaign'], ['heroes', 'Heroes'], ['items', `Items${Object.keys(c.items || {}).length ? ` <span class="gm-tab-n">${Object.keys(c.items).length}</span>` : ''}`], ['notes', 'Notes']];
  const body = { map: _crMapHtml, heroes: _crHeroesHtml, items: _crItemsHtml, notes: _crNotesHtml }[_crTab](c, edit);
  panel.innerHTML = `
    <div class="rv-head">
      <input class="rv-party" data-cr-text="name" value="${esc(c.name || '')}" placeholder="Party name" ${edit ? '' : 'readonly'} aria-label="Party name">
      ${_crPickerHtml()}
    </div>
    <div class="cr-sub">Campaign ${_crMapOf(c).num}: ${esc(_crMapOf(c).name)} · ${_crPlayers(c).map(esc).join(', ') || 'no players yet'}</div>
    ${edit ? '' : `<div class="rv-ro">${_crMe() ? 'Only the party can fill in this campaign.' : 'Log in to fill in the campaign.'}</div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_crTab === k ? ' on' : ''}" data-cr-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body${edit ? '' : ' rv-readonly'}">${body}</div>
    <div class="rv-toast" hidden></div>
    ${_crCreditHtml()}`;
}
function _crCreditHtml() {
  return `<div class="rv-credit">Heroes and maps from Czech Games Edition's <a href="https://www.czechgames.com/games/codenames-critical-role-adventures" target="_blank" rel="noopener">printable sheets</a>; the abilities are in short here, the sheets have them in full.</div>`;
}

// Everyone who could be at the table: the Ilioupoli bros first, then the rest.
function _crNames(first) {
  const top = [...new Set([...(first || []), ...(typeof ILIOUPOLI_MEMBERS !== 'undefined' ? ILIOUPOLI_MEMBERS : [])])];
  return [...top, ...[...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].filter(n => !top.includes(n)).sort()];
}
function _crPlayerSel(attr, value, names, placeholder) {
  const esc = _escapeHtml;
  return `<select class="rv-in" ${attr}><option value="">${placeholder}</option>${names.map(n => `<option value="${esc(n)}"${n === value ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
}

// ── Starting a campaign: the map, three heroes and who plays them ──
function _crStartHtml() {
  const esc = _escapeHtml;
  const me = _crMe();
  if (!_crDraft) _crDraft = { map: 'taldorei', name: '', heroes: CR_FIRST.map((id, i) => ({ id, player: i === 0 ? me || '' : '' })), extra: [] };
  const d = _crDraft;
  const names = _crNames(me ? [me] : []);
  const taken = new Set(d.heroes.map(h => h.id));
  const heroSel = (i) => `<select class="rv-in" data-cr-draft-hero="${i}">${_crData.heroes.map(H => `<option value="${H.id}"${H.id === d.heroes[i].id ? ' selected' : ''}${H.id !== d.heroes[i].id && taken.has(H.id) ? ' disabled' : ''}>${esc(H.alt ? `${H.name} / ${H.alt}` : H.name)}</option>`).join('')}</select>`;
  const mine = Object.values(_crCamps || {}).filter(c => me && _crPlayers(c).includes(me));
  return `<div class="rv-start cr-start">
    <div class="rv-start-title">Start a campaign</div>
    <div class="rv-start-sub">A party is always 3 heroes, kept for the whole campaign, whoever's playing. Each party's campaign is its own: start one for every group, and each carries on where it stopped.${mine.length ? '' : ' A first campaign: Tal\'Dorei, with Grog, Vex\'ahlia and Nott.'}</div>
    <div class="rv-sub">Campaign</div>
    <div class="cr-maps">${CR_MAPS.map(m => `<button type="button" class="cr-mapbtn${d.map === m.key ? ' on' : ''}" data-cr-draft-map="${m.key}"><b>${esc(m.name)}</b><span>Campaign ${m.num} · ${m.missions.filter(x => !x.secret).length} missions</span></button>`).join('')}</div>
    <div class="rv-sub">Heroes and their players</div>
    <div class="cr-draft-heroes">${d.heroes.map((h, i) => `<div class="cr-draft-row" style="--cr-c:${esc((_crHeroDef(h.id) || {}).color || '#888')}">${heroSel(i)}${_crPlayerSel(`data-cr-draft-player="${i}"`, h.player, names, 'Who plays them')}</div>`).join('')}</div>
    <div class="rv-sub">Also at the table</div>
    <div class="cr-draft-extra">${[...d.extra, ''].map((p, i) => _crPlayerSel(`data-cr-draft-extra="${i}"`, p, names, i < d.extra.length ? 'Nobody' : 'Add a player (the GM…)')).join('')}</div>
    <label class="rv-field cr-draft-name"><span>Party name (optional)</span><input class="rv-in" data-cr-draft-name value="${esc(d.name)}" placeholder="Vox Ilioupoli…"></label>
    ${me ? `<button type="button" class="rv-btn" data-cr-start>Start the campaign</button>` : '<div class="rv-start-sub">Log in to start one.</div>'}
  </div>`;
}

// ── Campaign: the route, the next mission, the fail counter, treasure and shops ──
function _crMapHtml(c, edit) {
  const esc = _escapeHtml;
  const map = _crMapOf(c);
  const st = _crMissionStates(c);
  const done = c.done || {};
  const next = _crNext(c);
  const fails = c.fails || 0;
  const chip = (m) => {
    const s = st[m.k];
    const isNext = next.m && next.m.k === m.k;
    return `<button type="button" class="cr-mis cr-${s}${isNext ? ' next' : ''}" data-cr-mis="${m.k}" ${s === 'later' || s === 'closed' ? 'aria-disabled="true"' : ''}>
      <span class="cr-mis-n">${esc(m.n)}</span><span class="cr-mis-place">${esc(m.place)}</span>
      <span class="cr-mis-st">${s === 'done' ? `&#10003; ${esc(_crShortDate(done[m.k]))}` : s === 'closed' ? 'other road' : isNext ? 'next' : s === 'open' ? (m.secret ? 'if the book sends you' : 'open') : ''}</span>
    </button>`;
  };
  const stages = [...new Set(map.missions.filter(m => !m.secret).map(m => m.stage))].sort((a, b) => a - b);
  const shopAt = (s) => map.shops.filter(x => x.before === s).map(x => `<button type="button" class="cr-shop${(c.shops || {})[x.k] ? ' on' : ''}" data-cr-shop="${x.k}"><span class="rv-check">${(c.shops || {})[x.k] ? '&#10003;' : ''}</span>Shop at ${esc(x.at)}</button>`).join('');
  const route = stages.map(s => {
    const ms = map.missions.filter(m => m.stage === s);
    const branches = [...new Set(ms.map(m => m.branch))];
    return `${shopAt(s)}<div class="cr-stage">${branches.map((b, i) => `${i ? '<span class="cr-or">or</span>' : ''}<div class="cr-branch">${ms.filter(m => m.branch === b).map(chip).join('')}</div>`).join('')}</div>`;
  }).join('<div class="cr-step" aria-hidden="true"></div>');
  const secret = map.missions.find(m => m.secret);

  let result = '';
  if (c.status === 'won') result = `<div class="cr-end won">The campaign is won. &#127881;</div>`;
  else if (c.status === 'lost') result = `<div class="cr-end lost">The campaign is lost: the fail counter ran out.</div>`;
  else if (next.m) result = `<div class="rv-card cr-result">
      <div class="cr-result-title">Mission ${esc(next.m.n)} · ${esc(next.m.place)}${next.m.finale ? ' <span class="cr-finale">finale</span>' : ''}</div>
      <div class="rv-hint">After you play it: the party keeps its XP and coins either way. A loss marks the fail counter and you play the mission again.</div>
      ${edit ? `<div class="cr-result-btns"><button type="button" class="rv-btn rv-btn-sm" data-cr-won="${next.m.k}">Won</button><button type="button" class="rv-btn rv-btn-sm rv-btn-soft" data-cr-lost="${next.m.k}">Lost</button></div>` : ''}
    </div>`;
  else if (next.choice && next.choice.length) result = `<div class="rv-card cr-result"><div class="cr-result-title">Where next?</div><div class="rv-hint">The epilogue says where the party can travel: tap ${next.choice.map(m => `${esc(m.n)} (${esc(m.place)})`).join(' or ')} on the map.</div></div>`;

  const log = Object.values(c.log || {}).sort((a, b) => b.at - a.at).slice(0, 8);
  return `${result}
    <div class="rv-sec">${esc(map.name)}</div>
    <div class="cr-route">${route}</div>
    ${secret ? `<div class="cr-secret">${chip(secret)}</div>` : ''}
    <div class="rv-sec">Mission fail counter</div>
    <div class="cr-fails">${CR_FAILS.map((f, i) => `<button type="button" class="cr-fail${i < fails ? ' on' : ''}${f.lost ? ' last' : ''}" data-cr-fail="${i + 1}"><span class="rv-check">${i < fails ? '&#10003;' : ''}</span><span>${esc(f.text)}</span></button>`).join('')}</div>
    <div class="rv-hint">A lost mission marks the next box: its healing is done for you here, the XP you split on the Heroes tab.</div>
    <div class="rv-sec">Treasure</div>
    <div class="cr-coins">
      <button type="button" class="rv-dot" data-cr-coins="-1" aria-label="One coin less">&minus;</button>
      <span class="cr-coins-n"><b>${c.coins || 0}</b> coin${c.coins === 1 ? '' : 's'}</span>
      <button type="button" class="rv-dot" data-cr-coins="1" aria-label="One coin more">+</button>
    </div>
    ${log.length ? `<div class="rv-sec">Lately</div><div class="cr-log">${log.map(l => { const m = map.missions.find(x => x.k === l.m); return `<div class="cr-log-row"><span>${esc(_crShortDate(l.at))}</span><span>Mission ${esc(m ? m.n : l.m)}${m ? ` · ${esc(m.place)}` : ''}</span><b class="${l.won ? 'won' : 'lost'}">${l.won ? 'won' : 'lost'}</b></div>`; }).join('')}</div>` : ''}`;
}
function _crShortDate(v) {
  if (!v) return '';
  const d = typeof v === 'number' ? new Date(v) : new Date(`${v}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Heroes: one sheet each, the viewer's own first ──
function _crHeroesHtml(c, edit) {
  const esc = _escapeHtml;
  const heroes = c.heroes || {};
  const me = _crMe();
  const slots = CR_SLOTS.filter(s => heroes[s] && heroes[s].id);
  if (!_crHero || !slots.includes(_crHero)) _crHero = slots.find(s => me && heroes[s].player === me) || slots[0];
  const chips = slots.map(s => {
    const H = _crHeroDef(heroes[s].id) || {};
    const veth = H.alt && heroes[s].curse1 && heroes[s].curse20;
    return `<button type="button" class="cr-chip${s === _crHero ? ' on' : ''}" data-cr-hero="${s}" style="--cr-c:${esc((veth && H.altColor) || H.color || '#888')}">
      <b>${esc(veth ? H.alt : H.short || H.name || '?')}</b><span>${esc(heroes[s].player || 'nobody yet')}</span></button>`;
  }).join('');
  return `<div class="cr-chips">${chips}</div>${_crHero ? _crSheetHtml(c, _crHero, edit) : ''}`;
}

function _crSheetHtml(c, slot, edit) {
  const esc = _escapeHtml;
  const h = (c.heroes || {})[slot] || {};
  const H = _crHeroDef(h.id);
  if (!H) return '';
  const S = _crHeroState(h, H);
  const color = (S.veth && H.altColor) || H.color;
  const names = _crNames(_crPlayers(c));

  const mods = H.mods.map((v, i) => `<span class="cr-mod${i === S.mods - 1 ? ' cur' : i < S.mods - 1 ? ' past' : ' locked'}">${_crSigned(v)}</span>`).join('');
  const hearts = Array.from({ length: H.hearts[1] }, (_, i) => {
    if (i >= S.hearts) return '<span class="cr-heart locked" aria-hidden="true">&#9825;</span>';
    const lost = i >= S.hearts - S.dmg;
    return `<button type="button" class="cr-heart${lost ? ' lost' : ''}" data-cr-dmg="${slot}|${lost ? -1 : 1}" title="${lost ? 'Heal this heart' : 'Lose this heart'}">&#9829;</button>`;
  }).join('');
  const held = Object.entries(c.items || {}).filter(([, it]) => it && it.on === slot);

  // the XP track, row by row as on the sheet
  const glyph = (b) => ({ M: '&#11041;', H: '&#9829;', S: '&#9635;', T: '&#9728;', C: '<i>&#9829;</i><i>&#11041;</i>', X: '<i>&#9728;</i><i>&#11041;</i>' })[b.got] || (/[123]/.test(b.got) ? b.got : '');
  let i = 0;
  const rows = H.track.split('|').map(row => `<div class="cr-xp-row">${[...row].map(() => {
    const b = S.boxes[i], at = i++;
    const up = b.s !== '.';
    const ask = S.pending.includes(at);
    return `<button type="button" class="cr-xp${up ? ' up' : ''}${b.on ? ' on' : ''}${ask ? ' ask' : ''}${/[123]/.test(b.s) ? ' ab' : ''}" data-cr-xp="${slot}|${at}" title="XP box ${at + 1}">${glyph(b)}</button>`;
  }).join('')}</div>`).join('');
  const upcoming = S.boxes.findIndex((b, k) => k >= S.xp && b.s !== '.');
  const what = (s) => /[123]/.test(s) ? `ability ${s}` : { M: 'a better roll modifier', H: 'a heart', S: 'an item slot', T: 'a Stress token', C: 'a heart or a roll modifier', X: 'a Stress token or a roll modifier' }[s];
  const ask = S.pending[0];
  const askHtml = ask == null ? '' : `<div class="cr-ask">
      <span>XP box ${ask + 1}: which one?</span>
      ${S.boxes[ask].s === 'X' ? `<button type="button" class="rv-btn rv-btn-sm" data-cr-pick="${slot}|${ask}|T">&#9728; A Stress token</button>` : `<button type="button" class="rv-btn rv-btn-sm" data-cr-pick="${slot}|${ask}|H">&#9829; A heart</button>`}
      <button type="button" class="rv-btn rv-btn-sm" data-cr-pick="${slot}|${ask}|M">&#11041; A roll modifier</button>
    </div>`;

  const table = (rows) => rows ? `<table class="cr-tbl">${rows.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>` : '';
  const grid = (cells) => {
    if (!cells) return '';
    const on = new Set(cells.map(([r, k]) => `${r}-${k}`));
    return `<div class="cr-grid" aria-hidden="true">${[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(k => `<span class="${(r === 0 || r === 4) && (k === 0 || k === 4) ? 'gap' : on.has(`${r}-${k}`) ? 'on' : ''}"></span>`).join('')).join('')}</div>`;
  };
  const trait = S.veth ? H.altTrait : H.trait;
  const curse = H.alt ? `<div class="cr-box">
      <div class="cr-box-title">Lifting the curse</div>
      <div class="cr-curse">${['1', '20'].map(n => `<button type="button" class="cr-curse-n${h['curse' + n] ? ' on' : ''}" data-cr-curse="${slot}|${n}">${n}</button>`).join('')}
        <span class="rv-hint">${S.veth ? 'Both crossed off: Nott is Veth again.' : 'Tap a number when anyone rolls it.'}</span></div>
      <div class="cr-text">${esc(H.curse)}</div>
    </div>` : '';
  const stress = H.stress ? `<div class="cr-row"><span class="cr-lbl">Stress</span><span class="cr-tokens">${Array.from({ length: H.stress[1] }, (_, k) => k >= S.stress ? '<span class="cr-token locked" aria-hidden="true"></span>'
      : `<button type="button" class="cr-token${k < (h.on || 0) ? ' charged' : ''}" data-cr-stress="${slot}|${k < (h.on || 0) ? -1 : 1}" title="${k < (h.on || 0) ? 'Charged: tap to calm' : 'Calm: tap to charge'}">${k < (h.on || 0) ? '&#9889;' : '&#9728;'}</button>`).join('')}</span>
      ${(h.on || 0) > 0 ? `<span class="cr-note">threshold ${[0, 5, 9, 15, 22][Math.min(h.on, 4)]}</span>` : ''}</div>` : '';
  const abilities = H.abilities.map((a, k) => {
    const n = k + 1, open = S.abil >= n;
    const at = S.boxes.findIndex(b => b.s === String(n));
    const inner = `<div class="cr-text">${esc(a.text)}</div>${grid(a.grid)}${table(a.table)}`;
    return open
      ? `<div class="cr-ab"><div class="cr-ab-head"><span class="cr-ab-n">${n}</span><b>${esc(a.name)}</b><span class="cr-ab-when">${esc(a.when)}</span></div>${inner}</div>`
      : `<details class="cr-ab locked"><summary><span class="cr-ab-n">${n}</span><b>${esc(a.name)}</b><span class="cr-ab-when">unlocks at XP box ${at + 1}${at >= S.xp ? ` · ${at + 1 - S.xp} more XP` : ''}</span></summary>${inner}</details>`;
  }).join('');

  return `<div class="cr-sheet" style="--cr-c:${esc(color)}">
    <div class="cr-sheet-head">
      <div class="cr-sheet-id">
        <span class="cr-sheet-name">${S.veth ? `<s>${esc(H.name)}</s> ${esc(H.alt)}` : esc(H.name)}</span>
        <span class="cr-sheet-blurb">${esc(H.blurb)}</span>
      </div>
      <div class="cr-sheet-who">${_crPlayerSel(`data-cr-player="${slot}"`, h.player || '', names, 'Who plays them')}</div>
    </div>
    <div class="cr-row"><span class="cr-lbl">Roll</span><span class="cr-mods">${mods}</span>${H.id === 'grog' && S.dmg ? `<span class="cr-note">now ${_crSigned(S.mod)}: +2 for each lost heart</span>` : ''}</div>
    <div class="cr-row"><span class="cr-lbl">Hearts</span><span class="cr-hearts">${hearts}</span><span class="cr-note">${S.hearts - S.dmg} of ${S.hearts}</span></div>
    ${stress}
    <div class="cr-row"><span class="cr-lbl">Items</span><span class="cr-note">${S.slots} slot${S.slots === 1 ? '' : 's'}${held.length ? `: ${held.map(([, it]) => esc(it.name)).join(', ')}` : ''}</span>${held.length > S.slots ? '<span class="cr-warn">too many</span>' : ''}</div>
    <div class="cr-xpbox">
      <div class="cr-xp-top">
        <span class="cr-lbl">XP</span>
        <button type="button" class="rv-dot" data-cr-xpstep="${slot}|-1" aria-label="One XP less"${S.xp ? '' : ' disabled'}>&minus;</button>
        <span class="cr-xp-n"><b>${S.xp}</b> / ${S.total}</span>
        <button type="button" class="rv-dot" data-cr-xpstep="${slot}|1" aria-label="One XP more"${S.xp < S.total ? '' : ' disabled'}>+</button>
        ${upcoming >= 0 ? `<span class="cr-note">${upcoming + 1 - S.xp} more for ${what(S.boxes[upcoming].s)}</span>` : '<span class="cr-note">the track is full</span>'}
      </div>
      ${rows}
      ${askHtml}
    </div>
    ${curse}
    ${trait ? `<div class="cr-box"><div class="cr-box-title">${esc(trait.name)}${S.veth ? ` <span class="cr-note">instead of <s>${esc(H.trait.name)}</s></span>` : ''}</div><div class="cr-text">${esc(trait.text)}</div>${table(trait.table)}</div>` : ''}
    <div class="rv-sub">Abilities</div>
    ${abilities}
    ${edit && !S.xp ? `<label class="rv-field cr-swap"><span>A different hero?</span><select class="rv-in" data-cr-swap="${slot}">${_crData.heroes.map(x => `<option value="${x.id}"${x.id === h.id ? ' selected' : ''}${x.id !== h.id && CR_SLOTS.some(s => s !== slot && ((c.heroes || {})[s] || {}).id === x.id) ? ' disabled' : ''}>${esc(x.alt ? `${x.name} / ${x.alt}` : x.name)}</option>`).join('')}</select></label>` : ''}
  </div>`;
}

// ── Items: shared by the party, each equipped by a hero for the mission ──
function _crItemsHtml(c, edit) {
  const esc = _escapeHtml;
  const heroes = c.heroes || {};
  const items = Object.entries(c.items || {}).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
  const who = (k, it) => `<select class="rv-in" data-cr-item-on="${esc(k)}"><option value="">Nobody</option>${CR_SLOTS.filter(s => heroes[s] && heroes[s].id).map(s => { const H = _crHeroDef(heroes[s].id) || {}; return `<option value="${s}"${it.on === s ? ' selected' : ''}>${esc(H.short || H.name)}</option>`; }).join('')}</select>`;
  return `<div class="rv-hint rv-hint-top">Items belong to the party: before each mission, choose who holds what (each hero has their item slots). Green ones work all mission; orange ones once a mission, ready again for the next.</div>
    ${items.length ? `<div class="cr-items">${items.map(([k, it]) => `<div class="cr-item ${it.kind === 'once' ? 'once' : 'always'}">
        <div class="cr-item-main"><b>${esc(it.name)}</b><span>${it.kind === 'once' ? 'Once per mission' : 'All mission'}</span></div>
        ${who(k, it)}
        ${edit ? `<button type="button" class="rv-link cr-item-x" data-cr-item-x="${esc(k)}" aria-label="Remove ${esc(it.name)}">&times;</button>` : ''}
      </div>`).join('')}</div>` : '<div class="gm-empty">No items yet: they come from the shops and the missions.</div>'}
    ${edit ? `<div class="rv-card cr-item-add">
      <input class="rv-in" data-cr-item-name placeholder="Item name" maxlength="60">
      <select class="rv-in" data-cr-item-kind><option value="always">Green: all mission</option><option value="once">Orange: once per mission</option></select>
      <button type="button" class="rv-btn rv-btn-sm" data-cr-item-add>Add</button>
    </div>` : ''}`;
}

function _crNotesHtml(c, edit) {
  return `<textarea class="rv-in cr-notes" data-cr-text="notes" rows="10" placeholder="What the party learned, promises made, where you stopped…" ${edit ? '' : 'readonly'}>${_escapeHtml(c.notes || '')}</textarea>`;
}

// ── what a tap or an edit does ──
async function _crClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.crTab) { _crTab = ds.crTab; _crRender(panel); return; }
  if (ds.crHero) { _crHero = ds.crHero; _crRender(panel); return; }
  if (ds.crDraftMap) { _crDraft.map = ds.crDraftMap; _crRender(panel); return; }
  if (ds.crStart !== undefined) {
    const d = _crDraft;
    if (new Set(d.heroes.map(h => h.id)).size < 3) { _crToast('Pick 3 different heroes.'); return; }
    t.disabled = true;
    const heroes = {};
    d.heroes.forEach((h, i) => { heroes[CR_SLOTS[i]] = { id: h.id, ...(h.player ? { player: h.player } : {}) }; });
    const players = [...new Set([...d.heroes.map(h => h.player), ...d.extra].filter(Boolean))];
    try {
      await _crCreate({ name: d.name.trim(), map: d.map, heroes, players, fails: 0, coins: 0, created: Date.now(), updated: Date.now(), by: _crMe() });
    } catch (e) {
      console.warn('Codenames campaign: not started', e);
      t.disabled = false;
      t.textContent = 'Couldn\'t start it. Try again';
      return;
    }
    _crDraft = null;
    _crTab = 'map';
    _crRender(panel);
    return;
  }
  const c = _crCamps[_crId];
  if (!c || !_crCanEdit(c)) return;
  const map = _crMapOf(c);
  const up = {};
  let note = '';
  if (ds.crMis) {
    const k = ds.crMis, st = _crMissionStates(c)[k];
    if (st === 'done') {
      const m = map.missions.find(x => x.k === k);
      if (!confirm(`Take mission ${m.n} (${m.place}) off the map?`)) return;
      up[`done/${k}`] = null;
      if (c.status === 'won') up.status = null;
    } else if (st === 'open') up.next = c.next === k ? null : k;
    else return;
  } else if (ds.crWon) {
    const m = map.missions.find(x => x.k === ds.crWon);
    up[`done/${m.k}`] = _crToday();
    up.next = null;
    up[`log/${Date.now()}`] = { m: m.k, won: true, at: Date.now(), by: _crMe() || '' };
    if (m.finale) up.status = 'won';
    note = m.finale ? 'The campaign is won!' : 'Mission won. Now spend each hero\'s XP on the Heroes tab.';
  } else if (ds.crLost) {
    const n = Math.min((c.fails || 0) + 1, CR_FAILS.length), f = CR_FAILS[n - 1];
    up.fails = n;
    up[`log/${Date.now()}`] = { m: ds.crLost, won: false, at: Date.now(), by: _crMe() || '' };
    if (f.lost) up.status = 'lost';
    else _crHeal(c, up, f.heal);
    note = f.lost ? 'The fail counter ran out: the campaign is lost.' : `Fail counter ${n}: ${f.text} Healing done; spend the XP on the Heroes tab, then play the mission again.`;
  } else if (ds.crFail) {
    const n = Number(ds.crFail);
    up.fails = n === (c.fails || 0) ? n - 1 : n;
    up.status = up.fails >= CR_FAILS.length ? 'lost' : c.status === 'lost' ? null : c.status || null;
  } else if (ds.crShop) up[`shops/${ds.crShop}`] = (c.shops || {})[ds.crShop] ? null : true;
  else if (ds.crCoins) up.coins = Math.max(0, (c.coins || 0) + Number(ds.crCoins));
  else if (ds.crDmg) {
    const [slot, d] = ds.crDmg.split('|');
    const h = c.heroes[slot], S = _crHeroState(h, _crHeroDef(h.id));
    up[`heroes/${slot}/dmg`] = Math.max(0, Math.min(S.hearts, S.dmg + Number(d))) || null;
  } else if (ds.crStress) {
    const [slot, d] = ds.crStress.split('|');
    const h = c.heroes[slot], S = _crHeroState(h, _crHeroDef(h.id));
    up[`heroes/${slot}/on`] = Math.max(0, Math.min(S.stress, (h.on || 0) + Number(d))) || null;
  } else if (ds.crCurse) {
    const [slot, n] = ds.crCurse.split('|');
    up[`heroes/${slot}/curse${n}`] = c.heroes[slot]['curse' + n] ? null : true;
  } else if (ds.crXp || ds.crXpstep) {
    const [slot, v] = (ds.crXp || ds.crXpstep).split('|');
    const h = c.heroes[slot];
    const cur = h.xp || 0, total = _crHeroDef(h.id).track.replace(/\|/g, '').length;
    // a box: marked up to it (the last one marked: unmarked); a step: one more or less
    let xp = ds.crXp ? (Number(v) === cur - 1 ? cur - 1 : Number(v) + 1) : cur + Number(v);
    xp = Math.max(0, Math.min(total, xp));
    if (xp < cur - 1 && !confirm(`Unmark XP boxes ${xp + 1}–${cur}?`)) return;
    up[`heroes/${slot}/xp`] = xp || null;
    for (const i in (h.pick || {})) if (Number(i) >= xp) up[`heroes/${slot}/pick/${i}`] = null;
  } else if (ds.crPick) {
    const [slot, i, p] = ds.crPick.split('|');
    up[`heroes/${slot}/pick/${i}`] = p;
  } else if (ds.crItemAdd !== undefined) {
    const name = panel.querySelector('[data-cr-item-name]').value.trim();
    if (!name) return;
    up[`items/${Date.now()}`] = { name: name.slice(0, 60), kind: panel.querySelector('[data-cr-item-kind]').value, at: Date.now() };
  } else if (ds.crItemX) {
    if (!confirm(`Remove ${((c.items || {})[ds.crItemX] || {}).name || 'this item'}?`)) return;
    up[`items/${ds.crItemX}`] = null;
  }
  if (!Object.keys(up).length) return;
  _crPatch(up);
  _crRender(panel);
  if (note) _crToast(note);
}
// A lost mission's healing: half the lost hearts (rounded up), or all of them.
function _crHeal(c, up, how) {
  for (const s of CR_SLOTS) {
    const h = (c.heroes || {})[s];
    if (!h || !h.dmg) continue;
    const left = how === 'all' ? 0 : h.dmg - Math.ceil(h.dmg / 2);
    up[`heroes/${s}/dmg`] = left || null;
  }
}

function _crChange(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-cr-camp]')) {
    if (t.value === '__new') { _crId = null; _crDraft = null; } else { _crId = t.value; _crHero = null; }
    _crRender(panel);
    return;
  }
  if (_crDraft && !_crId) {
    const d = _crDraft;
    if (t.matches('[data-cr-draft-hero]')) d.heroes[Number(t.dataset.crDraftHero)].id = t.value;
    else if (t.matches('[data-cr-draft-player]')) d.heroes[Number(t.dataset.crDraftPlayer)].player = t.value;
    else if (t.matches('[data-cr-draft-extra]')) {
      const i = Number(t.dataset.crDraftExtra);
      if (t.value) d.extra[i] = t.value; else d.extra.splice(i, 1);
    } else return;
    _crRender(panel);
    return;
  }
  const c = _crCamps[_crId];
  if (!c || !_crCanEdit(c)) return;
  const up = {};
  if (t.matches('[data-cr-player]')) {
    const slot = t.dataset.crPlayer;
    up[`heroes/${slot}/player`] = t.value || null;
    if (t.value && !(c.players || []).includes(t.value)) up.players = [...(c.players || []), t.value];
  } else if (t.matches('[data-cr-swap]')) up[`heroes/${t.dataset.crSwap}`] = { id: t.value, ...(c.heroes[t.dataset.crSwap].player ? { player: c.heroes[t.dataset.crSwap].player } : {}) };
  else if (t.matches('[data-cr-item-on]')) up[`items/${t.dataset.crItemOn}/on`] = t.value || null;
  else return;
  _crPatch(up);
  _crRender(panel);
}

// Typing in the party name or the notes: saved a moment after you stop.
function _crInput(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-cr-draft-name]') && _crDraft) { _crDraft.name = t.value; return; }
  const path = t.dataset && t.dataset.crText;
  if (!path) return;
  const c = _crCamps[_crId];
  if (!c || !_crCanEdit(c)) return;
  clearTimeout(_crSaveTimers[path]);
  _crSaveTimers[path] = setTimeout(() => _crPatch({ [path]: t.value }), 700);
}
