// ── Rove campaign (the Campaign tab on Rove's game page) ──
// The paper campaign sheet, kept for the party in Firebase
// (roveCampaigns/{id}) so anyone in the party can fill it in on any phone:
// party and level, each Rover's class (base → prime → apex) and traits, the
// branching campaign of quests and encounters, milestones, merchant level,
// reward armor and weapons, the adversary ether fields, lyst, items bought,
// the Xulc expansion's sheet and notes. Logged games of Rove ("Scenario 0.1")
// show against their encounter. What the game is (classes, quests, items, the
// sheet's lists) is in data/rove.js (tools/build-rove-data.py), loaded only
// when the tab opens.

const ROVE_IDS = new Set([365670, 439995]);   // Rove, and its Xulc expansion: the same campaign
const ROVE_BGGID = 365670;
const RV_LEVELS = [['Base', [1, 2, 3]], ['Prime', [4, 5, 6]], ['Apex', [7, 8, 9]]];
const RV_SLOTS = ['r0', 'r1', 'r2', 'r3'];
const RV_SLOT_NAMES = { hand: 'Hand', body: 'Body', head: 'Head', foot: 'Foot', pocket: 'Pocket', none: 'Other' };
const RV_AFF = { fire: 'Fire', water: 'Water', ice: 'Ice', earth: 'Earth', wind: 'Wind', crux: 'Crux', morph: 'Morph' };

let _rvData = null;          // data/rove.js
let _rvCamps = null;         // roveCampaigns from Firebase: {id: campaign}
let _rvSrc = {};             // id → the store it lives in ('main' | 'spare', see fbWrite)
let _rvCampsAt = 0;
let _rvId = null;            // the campaign on screen
let _rvTab = 'sheet';        // 'sheet' | 'rovers' | 'shop' | 'xulc' | 'notes'
let _rvShopSlot = 'all';
let _rvSaveTimers = {};

const _rvKey = (id) => String(id).replace(/[.#$\[\]\/]/g, '_');   // Firebase keys can't hold . # $ [ ] /
const _rvSlug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

async function _rvLoad(force) {
  if (!_rvData) {
    const src = await (await fetch('data/rove.js', { cache: 'no-cache' })).text();
    _rvData = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
    _rvData.classByName = Object.fromEntries(_rvData.classes.map(c => [c.name, c]));
    _rvData.itemByName = Object.fromEntries(_rvData.items.map(i => [i.name, i]));
  }
  if (force || !_rvCamps || Date.now() - _rvCampsAt > 15000) {
    const { main, spare } = await fbReadBoth('roveCampaigns');
    _rvCamps = {};
    _rvSrc = {};
    for (const [store, data] of [['spare', spare], ['main', main]]) {
      for (const id in (data || {})) { _rvCamps[id] = data[id]; _rvSrc[id] = store; }
    }
    _rvCampsAt = Date.now();
  }
  if (!_rvId || !_rvCamps[_rvId]) {
    // the campaign played most recently
    const ids = Object.keys(_rvCamps).sort((a, b) => (_rvCamps[b].updated || 0) - (_rvCamps[a].updated || 0));
    _rvId = ids[0] || null;
  }
}

// Write some fields of the campaign: {path: value}, path relative to the
// campaign ("enc/0_1", "rovers/r0/base"); null removes. Firebase applies them
// together without touching the rest, so two phones editing different boxes
// don't overwrite each other.
async function _rvPatch(updates) {
  const c = _rvCamps[_rvId];
  if (!c) return;
  for (const [path, v] of Object.entries(updates)) {
    const parts = path.split('/');
    let o = c;
    for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
    if (v === null) delete o[parts[parts.length - 1]]; else o[parts[parts.length - 1]] = v;
  }
  c.updated = Date.now();
  try {
    await fbWrite(`roveCampaigns/${_rvId}`, 'PATCH', { ...updates, updated: c.updated }, _rvSrc[_rvId]);
  } catch (e) {
    console.warn('Rove campaign: not saved', e);
    _rvToast('Not saved. Check the connection and try again.');
  }
}
async function _rvCreate(c) {
  const { store, json } = await fbWrite('roveCampaigns', 'POST', c);
  _rvCamps[json.name] = c;
  _rvSrc[json.name] = store;
  _rvId = json.name;
}
function _rvToast(msg) {
  const el = document.querySelector('.rv-toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(_rvToast.t);
  _rvToast.t = setTimeout(() => { el.hidden = true; }, 3500);
}

// Logged games of Rove, oldest first, with the encounter they name ("Scenario 0.1").
function _rvPlays() {
  const out = [];
  for (const id of ROVE_IDS) for (const p of (PLAY_HISTORY[id] || [])) {
    const m = String(p.b || '').match(/(\d+)\.(\d+)\s*([ab])?/i);
    out.push({ p, date: p.date, won: (p.sc || []).some(s => s.w), enc: m ? `${m[1]}.${m[2]}${(m[3] || '').toLowerCase()}` : null, xulc: id !== ROVE_BGGID });
  }
  return out.sort((a, b) => ((a.p.t || a.date) + (a.p.e || '')).localeCompare((b.p.t || b.date) + (b.p.e || '')));
}

// The party from the latest game: who played which class.
function _rvGuessRovers() {
  const plays = _rvPlays();
  const last = plays[plays.length - 1];
  if (!last) return {};
  const out = {};
  (last.p.sc || []).slice(0, 4).forEach((s, i) => {
    const cls = _rvData.classByName[String(s.r || '').trim()];
    out[RV_SLOTS[i]] = { player: s.n, ...(cls ? { [cls.tier]: cls.name, ...(cls.tier !== 'base' ? { base: cls.base } : {}) } : {}) };
  });
  return out;
}

function _rvMe() { return typeof _navPlayer === 'function' ? _navPlayer() : null; }
function _rvCanEdit(c) {
  const me = _rvMe();
  if (!me) return false;
  const players = Object.values((c && c.rovers) || {}).map(r => r && r.player).filter(Boolean);
  return !players.length || players.includes(me);
}

// ── The campaign's shape: which quests are open, taken or closed ──
function _rvQuestState(c) {
  const enc = (c && c.enc) || {};
  const done = (id) => !!enc[_rvKey(id)];
  const started = (q) => (_rvData.quests[q] || { encounters: [] }).encounters.some(e => done(e.id));
  const out = {};
  let prevDone = true;   // the chapter before is finished: this one's quests are open
  for (const ch of _rvData.chapters) {
    if (!ch.quests) continue;
    const taken = ch.quests.find(started);
    for (const q of ch.quests) {
      const need = ch.after && ch.after[q];
      let state = 'open';
      if (taken && taken !== q) state = 'closed';            // the other road
      else if (need && !started(need) && ch.quests.some(o => ch.after[o] && started(ch.after[o]))) state = 'closed';
      else if (need && !started(need)) state = 'waits';      // decided by an earlier choice
      if (taken === q) state = (_rvData.quests[q].encounters.filter(e => !e.after || started(e.after)).every(e => done(e.id))) ? 'done' : 'taken';
      else if (state !== 'closed' && !prevDone) state = 'later';
      out[q] = { state, need };
    }
    prevDone = ch.quests.some(q => out[q].state === 'done');
  }
  return out;
}
// Encounters on the road you're taking, in order, and the first one not done.
function _rvRoad(c) {
  const qs = _rvQuestState(c);
  const enc = (c && c.enc) || {};
  const road = [];
  for (const ch of _rvData.chapters) {
    if (ch.bonus) { road.push({ id: ch.bonus, bonus: true }); continue; }
    const q = ch.quests.find(x => ['taken', 'done'].includes(qs[x].state)) || (ch.quests.length === 1 ? ch.quests[0] : null);
    if (!q) { road.push({ choice: ch.quests }); continue; }
    for (const e of _rvData.quests[q].encounters) {
      if (e.after && !['taken', 'done'].includes((qs[e.after] || {}).state)) continue;
      road.push({ id: e.id, quest: q, title: e.title });
    }
  }
  const next = road.find(r => r.id && !r.bonus && !enc[_rvKey(r.id)]) || road.find(r => r.choice) || null;
  return { road, next };
}

// ── rendering ──
function buildRoveCampaignHtml(game) {
  if (!game || !ROVE_IDS.has(Number(game.bggId))) return '';
  return `<div class="rv" data-rv><div class="rv-loading">Opening the campaign sheet…</div></div>`;
}

function wireRoveCampaign(content) {
  const panel = content.querySelector('[data-rv]');
  if (!panel) return;
  _rvLoad(true).then(() => _rvRender(panel)).catch(e => {
    panel.innerHTML = `<div class="rv-loading">The campaign couldn't be loaded. Try again in a moment.</div>`;
    console.warn('Rove campaign:', e);
  });
  panel.addEventListener('click', (ev) => _rvClick(panel, ev));
  panel.addEventListener('change', (ev) => _rvChange(panel, ev));
  panel.addEventListener('input', (ev) => _rvInput(panel, ev));
}

function _rvRender(panel) {
  const esc = _escapeHtml;
  const c = _rvCamps[_rvId];
  if (!c) { panel.innerHTML = _rvStartHtml(); return; }
  const edit = _rvCanEdit(c);
  const others = Object.keys(_rvCamps).filter(id => id !== _rvId);
  const tabs = [['sheet', 'Sheet'], ['rovers', 'Rovers'], ['shop', 'Shop'], ['xulc', 'Xulc'], ['notes', 'Notes']];
  const body = { sheet: _rvSheetHtml, rovers: _rvRoversHtml, shop: _rvShopHtml, xulc: _rvXulcHtml, notes: _rvNotesHtml }[_rvTab](c, edit);
  panel.innerHTML = `
    <div class="rv-head">
      <input class="rv-party" data-rv-text="name" value="${esc(c.name || '')}" placeholder="Party name" ${edit ? '' : 'readonly'} aria-label="Party name">
      ${others.length ? `<select class="rv-pick" data-rv-camp aria-label="Campaign">${Object.keys(_rvCamps).map(id => `<option value="${esc(id)}"${id === _rvId ? ' selected' : ''}>${esc(_rvCamps[id].name || 'Unnamed party')}</option>`).join('')}</select>` : ''}
    </div>
    ${edit ? '' : `<div class="rv-ro">${_rvMe() ? 'Only the party can fill in this sheet.' : 'Log in to fill in the sheet.'}</div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_rvTab === k ? ' on' : ''}" data-rv-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body${edit ? '' : ' rv-readonly'}">${body}</div>
    <div class="rv-toast" hidden></div>
    <div class="rv-credit">Classes, quests and items from <a href="https://www.roveassistant.com" target="_blank" rel="noopener">Rove Assistant</a>; the sheet is Addax Games' campaign sheet.</div>`;
}

function _rvStartHtml() {
  const esc = _escapeHtml;
  const guess = _rvGuessRovers();
  const who = Object.values(guess).map(r => `${esc(r.player)}${r.base ? ` (${esc(r.base)})` : ''}`).join(', ');
  const logged = _rvPlays().filter(p => p.enc && p.won).length;
  return `<div class="rv-start">
    <div class="rv-start-title">Start the campaign sheet</div>
    <div class="rv-start-sub">${who ? `The party from your last game: ${who}.` : 'No games of Rove logged yet.'}${logged ? ` ${logged} encounter${logged === 1 ? '' : 's'} won in the logged games will be ticked.` : ''} You can change all of it after.</div>
    ${_rvMe() ? `<button type="button" class="rv-btn" data-rv-start>Start</button>` : '<div class="rv-start-sub">Log in to start it.</div>'}
  </div>`;
}

// ── Sheet: party level, the campaign, milestones, rewards, ether fields, lyst ──
function _rvSheetHtml(c, edit) {
  const esc = _escapeHtml;
  const D = _rvData;
  const enc = c.enc || {};
  const qs = _rvQuestState(c);
  const { road, next } = _rvRoad(c);
  const plays = _rvPlays();
  const byEnc = {};
  plays.forEach(p => { if (p.enc) (byEnc[p.enc] = byEnc[p.enc] || []).push(p); });
  const onRoad = road.filter(r => r.id && !r.bonus);
  const doneN = onRoad.filter(r => enc[_rvKey(r.id)]).length;
  const totalN = 29;   // prologue 3, four quests of 5, the finale 6
  const unticked = plays.filter(p => p.enc && p.won && !p.xulc && !enc[_rvKey(p.enc)] && Object.values(D.quests).some(q => q.encounters.some(e => e.id === p.enc)));

  const level = c.level || 1;
  const levelHtml = RV_LEVELS.map(([tier, lv]) => `<span class="rv-lvgroup"><span class="rv-lvname">${tier}</span>${lv.map(n =>
    `<button type="button" class="rv-dot rv-lv${n <= level ? ' on' : ''}" data-rv-level="${n}" aria-label="Level ${n}">${n}</button>`).join('')}</span>`).join('');

  const encRow = (e, q) => {
    const k = _rvKey(e.id), d = enc[k];
    const logs = byEnc[e.id] || [];
    const w = logs.filter(p => p.won).length, l = logs.length - w;
    const isNext = next && next.id === e.id;
    return `<button type="button" class="rv-enc${d ? ' done' : ''}${isNext ? ' next' : ''}" data-rv-enc="${esc(e.id)}">
      <span class="rv-check">${d ? '✓' : ''}</span>
      <span class="rv-enc-id">${esc(e.id.replace(/^chapter_\d\.I$/, '★'))}</span>
      <span class="rv-enc-name">${esc(e.title)}</span>
      ${logs.length ? `<span class="rv-logged" title="Logged games">${w ? `<b class="w">${w}W</b>` : ''}${l ? `<b class="l">${l}L</b>` : ''}</span>` : ''}
    </button>`;
  };
  const questCard = (q) => {
    const Q = D.quests[q];
    const st = qs[q];
    const encs = Q.encounters.filter(e => !e.after || ['taken', 'done'].includes((qs[e.after] || {}).state) || st.state === 'open' || st.state === 'waits');
    const done = Q.encounters.filter(e => enc[_rvKey(e.id)]).length;
    const label = { open: 'Open', waits: `After Quest ${st.need}`, later: st.need ? `Later · if Quest ${st.need}` : 'Later', closed: 'Not your road', taken: 'Your road', done: 'Done' }[st.state];
    const show = ['taken', 'done', 'open'].includes(st.state);
    return `<div class="rv-quest rv-q-${st.state}">
      <div class="rv-qhead"><span class="rv-qnum">${q === '0' ? '0' : q}</span><span class="rv-qtitle">${esc(Q.title)}</span><span class="rv-qstate">${label}${done ? ` · ${done}/${Q.encounters.filter(e => !e.after || encs.includes(e)).length}` : ''}</span></div>
      ${show && st.state !== 'closed' ? `<div class="rv-encs">${encs.map(e => encRow(e, q)).join('')}</div>` : ''}
    </div>`;
  };
  const map = D.chapters.map(ch => {
    if (ch.bonus) {
      const b = Object.values(D.quests).flatMap(q => q.encounters).find(e => e.id === ch.bonus);
      return `<div class="rv-bonus">${encRow(b)}<span class="rv-bonus-lbl">Bonus encounter</span></div>`;
    }
    return `<div class="rv-chapter${ch.quests.length > 1 ? ' rv-two' : ''}">${ch.quests.map(questCard).join(ch.quests.length > 1 ? '<span class="rv-or">or</span>' : '')}</div>`;
  }).join('');

  const ms = c.ms || {};
  const msHtml = D.milestones.map(m => {
    const v = ms[m.id];
    if (m.options) return `<div class="rv-ms rv-ms-opt"><span class="rv-ms-q">${m.quest === 'bonus' ? 'Bonus' : `Q${m.quest}`}</span><span class="rv-ms-label">${esc(m.label)}</span>
      <span class="rv-opts">${m.options.map(o => `<button type="button" class="rv-opt${v === o ? ' on' : ''}" data-rv-msv="${esc(m.id)}|${esc(o)}">${esc(o)}</button>`).join('')}</span></div>`;
    return `<button type="button" class="rv-ms${v ? ' on' : ''}" data-rv-ms="${esc(m.id)}"><span class="rv-check">${v ? '✓' : ''}</span><span class="rv-ms-q">${m.quest === 'bonus' ? 'Bonus' : `Q${m.quest}`}</span><span class="rv-ms-label">${esc(m.label)}</span></button>`;
  }).join('');

  const rewards = c.rewards || {};
  const rewardList = (names) => names.map(n => {
    const it = D.itemByName[n];
    const on = rewards[_rvSlug(n)];
    return `<button type="button" class="rv-reward${on ? ' on' : ''}" data-rv-reward="${esc(_rvSlug(n))}"><span class="rv-check">${on ? '✓' : ''}</span>${esc(n)}${it ? `<small>${esc(RV_SLOT_NAMES[it.slot] || it.slot)}</small>` : ''}</button>`;
  }).join('');

  const ether = c.ether || {};
  const etherHtml = D.etherFields.map(f => {
    const row = (kind, sym) => `<div class="rv-ether-row"><span class="rv-ether-sym rv-${kind}" title="${kind === 'aura' ? 'Aura' : 'Miasma'}">${sym}</span>${f[kind].map(([opt, text]) => {
      const v = opt || 'x';
      const on = (ether[f.id] || {})[kind] === v;
      return `<button type="button" class="rv-opt rv-ether-opt${on ? ' on' : ''}" data-rv-ether="${f.id}|${kind}|${v}">${opt ? `<b>${opt}</b> ` : ''}${esc(text)}</button>`;
    }).join('<span class="rv-or-sm">or</span>')}</div>`;
    return `<div class="rv-ether"><div class="rv-ether-label">${esc(f.label)}</div>${row('aura', '☀')}${row('miasma', '☾')}</div>`;
  }).join('');

  const lyst = Number(c.lyst) || 0;
  const merchant = c.merchant || 0;
  return `
    <div class="rv-card">
      <div class="rv-row"><span class="rv-label">Level</span><div class="rv-levels">${levelHtml}</div></div>
      <div class="rv-progress"><span style="width:${Math.round(doneN / totalN * 100)}%"></span></div>
      <div class="rv-progress-txt">${doneN} of ${totalN} encounters on your road${next && next.id ? ` · next: <b>${esc(next.id)} ${esc(next.title || '')}</b>` : next && next.choice ? ` · next: choose Quest ${next.choice.join(' or ')}` : ''}</div>
      ${unticked.length && edit ? `<button type="button" class="rv-btn rv-btn-soft" data-rv-fill>Tick ${unticked.length} encounter${unticked.length === 1 ? '' : 's'} won in logged games</button>` : ''}
    </div>
    <div class="rv-sec">Campaign</div>
    <div class="rv-map">${map}</div>
    <div class="rv-sec">Milestones</div>
    <div class="rv-card rv-mslist">${msHtml}</div>
    <div class="rv-sec">Merchant and rewards</div>
    <div class="rv-card">
      <div class="rv-row"><span class="rv-label">Merchant level</span><div class="rv-dots">${[1, 2, 3, 4].map(n => `<button type="button" class="rv-dot${n <= merchant ? ' on' : ''}" data-rv-merchant="${n}">${n}</button>`).join('')}</div></div>
      <div class="rv-sub">Reward armor</div><div class="rv-rewards">${rewardList(D.rewardArmor)}</div>
      <div class="rv-sub">Reward weapons</div><div class="rv-rewards">${rewardList(D.rewardWeapons)}</div>
    </div>
    <div class="rv-sec">Adversary ether fields</div>
    <div class="rv-card">${etherHtml}<div class="rv-hint">Mark the effect the campaign gives you for each stretch of quests.</div></div>
    <div class="rv-sec">Lyst</div>
    <div class="rv-card">${_rvLystHtml(c, edit)}</div>`;
}

function _rvLystHtml(c, edit) {
  const esc = _escapeHtml;
  const lyst = Number(c.lyst) || 0;
  const log = Object.entries(c.lystLog || {}).map(([k, v]) => ({ k, ...v })).sort((a, b) => b.at - a.at).slice(0, 8);
  return `<div class="rv-lyst">
      <span class="rv-lyst-val">${lyst}</span><span class="rv-lyst-unit">lyst</span>
      ${edit ? `<span class="rv-lyst-btns">${[-10, -5, -1, 1, 5, 10].map(d => `<button type="button" class="rv-dot rv-lyst-btn" data-rv-lyst="${d}">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}</span>` : ''}
    </div>
    ${edit ? `<div class="rv-lyst-custom"><input type="number" inputmode="numeric" class="rv-in rv-lyst-amt" placeholder="±" aria-label="Amount"><input type="text" class="rv-in rv-lyst-note" placeholder="What for (optional)" aria-label="What for"><button type="button" class="rv-btn rv-btn-sm" data-rv-lystadd>Add</button></div>` : ''}
    ${log.length ? `<div class="rv-lyst-log">${log.map(x => `<div><b class="${x.d >= 0 ? 'w' : 'l'}">${x.d >= 0 ? '+' : '−'}${Math.abs(x.d)}</b> ${esc(x.note || '')} <span class="rv-dim">${_rvAgo(x.at)}${x.by ? ` · ${esc(x.by)}` : ''}</span></div>`).join('')}</div>` : ''}`;
}
function _rvAgo(ms) {
  const d = Math.round((Date.now() - ms) / 86400000);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
}

// ── Rovers: class, evolution, traits, equipment ──
function _rvRoversHtml(c, edit) {
  const esc = _escapeHtml;
  const D = _rvData;
  const rovers = c.rovers || {};
  const level = c.level || 1;
  // the party and the Ilioupoli bros first, then everyone else
  const first = [...new Set([...Object.values(rovers).map(r => r && r.player).filter(Boolean), ...(typeof ILIOUPOLI_MEMBERS !== 'undefined' ? ILIOUPOLI_MEMBERS : [])])];
  const names = [...first, ...[...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].filter(n => !first.includes(n)).sort()];
  const items = c.items || {};
  const bases = D.classes.filter(x => x.tier === 'base');
  const card = (slot) => {
    const r = rovers[slot] || {};
    const base = D.classByName[r.base], prime = D.classByName[r.prime], apex = D.classByName[r.apex];
    const cur = apex || prime || base;
    const primes = base ? D.classes.filter(x => x.tier === 'prime' && x.base === base.name) : [];
    const apexes = prime ? D.classes.filter(x => x.tier === 'apex' && x.prime === prime.name) : [];
    const sel = (field, opts, value, placeholder, disabled) => `<select class="rv-in" data-rv-rover="${slot}|${field}"${disabled ? ' disabled' : ''}>
      <option value="">${placeholder}</option>${opts.map(o => `<option value="${esc(o.v)}"${o.v === value ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
    const own = D.items.filter(i => items[_rvKey(i.id)] === slot);
    if (!r.player && !r.base) {
      return `<div class="rv-rover rv-empty"><div class="rv-rover-top">${sel('player', names.map(n => ({ v: n, l: n })), '', 'Add a Rover…')}</div></div>`;
    }
    const stats = cur ? `<div class="rv-stats">
        <div class="rv-stat"><b>${cur.hp}</b><span>Health</span></div>
        <div class="rv-stat"><b>${cur.ether}</b><span>Ether limit</span></div>
        ${cur.def ? `<div class="rv-stat"><b>${cur.def}</b><span>Defense</span></div>` : ''}
      </div>
      <div class="rv-affs">${Object.entries(cur.aff || {}).map(([k, v]) => `<span class="rv-aff rv-aff-${k}${v > 0 ? ' up' : v < 0 ? ' down' : ''}">${RV_AFF[k] || k} ${v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '0'}</span>`).join('')}</div>
      ${cur.summons.length ? `<div class="rv-line"><span class="rv-dim">Summons:</span> ${cur.summons.map(esc).join(', ')}</div>` : ''}
      ${base && base.start.length ? `<div class="rv-line"><span class="rv-dim">Starts with:</span> ${base.start.map(esc).join(', ')}</div>` : ''}
      ${base && base.style ? `<div class="rv-style">${['melee', 'range', 'defense', 'support'].map(k => `<span class="rv-style-row"><span>${k[0].toUpperCase() + k.slice(1)}</span><span class="rv-bar"><i style="width:${(base.style[k] || 0) / 6 * 100}%"></i></span></span>`).join('')}<span class="rv-style-row"><span>Complexity</span><span class="rv-bar rv-bar-cx"><i style="width:${(base.style.complexity || 0) / 5 * 100}%"></i></span></span></div>` : ''}` : '';
    // what comes next stays hidden until the party reaches its level (or it's already chosen)
    const showPrime = level >= 4 || !!r.prime, showApex = level >= 7 || !!r.apex;
    const traitSel = (field, cls, label) => cls ? `<label class="rv-field"><span>${label}</span>${sel(field, cls.traits.map(t => ({ v: t, l: t })), r[field] || '', `Choose (${cls.name})`)}</label>` : '';
    const inf = ((c.xulc || {}).inf || {})[slot] || {};
    return `<div class="rv-rover" style="--rv-c:${esc((cur && cur.color) || '#888')}">
      <div class="rv-rover-top">${sel('player', names.map(n => ({ v: n, l: n })), r.player || '', 'Who')}<span class="rv-rover-cls">${esc(cur ? cur.name : 'No class yet')}</span></div>
      <div class="rv-evo">
        <label class="rv-field"><span>Base</span>${sel('base', bases.map(x => ({ v: x.name, l: x.name })), r.base || '', 'Base class')}</label>
        ${showPrime ? `<label class="rv-field"><span>Prime</span>${sel('prime', primes.map(x => ({ v: x.name, l: x.name + (x.x ? ' (Xulc)' : '') })), r.prime || '', 'Prime class', !base)}</label>` : ''}
        ${showApex ? `<label class="rv-field"><span>Apex</span>${sel('apex', apexes.map(x => ({ v: x.name, l: x.name })), r.apex || '', 'Apex class', !prime)}</label>` : ''}
      </div>
      ${prime || apex ? `<div class="rv-evo">${traitSel('trait1', prime, 'Trait 1')}${traitSel('trait2', apex, 'Trait 2')}</div>` : ''}
      ${stats}
      <div class="rv-sub">Equipment${own.length ? ` · ${own.length}` : ''}</div>
      ${own.length ? `<div class="rv-own">${own.map(i => `<span class="rv-item-chip">${esc(i.name)}<small>${esc(RV_SLOT_NAMES[i.slot] || i.slot)}</small></span>`).join('')}</div>` : `<div class="rv-hint">Give items from the Shop tab.</div>`}
      ${inf.stage ? `<div class="rv-line"><span class="rv-dim">Xulc infestation:</span> stage ${inf.stage}</div>` : ''}
      ${edit ? `<button type="button" class="rv-link" data-rv-remove="${slot}">Remove this Rover</button>` : ''}
    </div>`;
  };
  const used = RV_SLOTS.filter(s => rovers[s] && (rovers[s].player || rovers[s].base));
  const shown = used.length < 4 ? [...used, RV_SLOTS.find(s => !used.includes(s))] : used;
  return `<div class="rv-hint rv-hint-top">Level ${level}: ${level < 4 ? 'base classes. The next choices show up here at level 4.' : level < 7 ? 'prime classes. The next choices show up here at level 7.' : 'apex classes.'}</div>
    <div class="rv-rovers">${shown.map(card).join('')}</div>`;
}

// ── Shop: every item, what the merchant level opens, and who has what ──
function _rvShopHtml(c, edit) {
  const esc = _escapeHtml;
  const D = _rvData;
  const merchant = c.merchant || 0;
  const items = c.items || {};
  const rewards = c.rewards || {};
  const rovers = c.rovers || {};
  const who = RV_SLOTS.filter(s => rovers[s] && rovers[s].player).map(s => ({ s, n: rovers[s].player }));
  const slots = ['all', 'hand', 'body', 'head', 'foot', 'pocket'];
  const list = D.items.filter(i => (_rvShopSlot === 'all' || i.slot === _rvShopSlot) && (!i.x || (c.xulc && c.xulc.on)));
  const groups = [
    ['Rewards', list.filter(i => i.reward)],
    ...[1, 2, 3, 4].map(n => [`Merchant level ${n}`, list.filter(i => i.ml === n && !i.reward)]),
    ['Other', list.filter(i => !i.ml && !i.reward)],
  ].filter(g => g[1].length);
  const row = (i) => {
    const owner = items[_rvKey(i.id)] || '';
    const locked = i.reward ? !rewards[_rvSlug(i.name)] && !owner : (i.ml || 0) > merchant && !owner;
    return `<div class="rv-item${locked ? ' locked' : ''}${owner ? ' owned' : ''}">
      <span class="rv-item-name">${esc(i.name)}<small>${esc(RV_SLOT_NAMES[i.slot] || i.slot)}${i.hands > 1 ? ` · ${i.hands} slots` : ''}${i.x ? ' · Xulc' : ''}</small></span>
      <span class="rv-item-price">${i.price ? `${i.price}<small> lyst</small>` : i.reward ? 'reward' : ''}</span>
      ${who.length ? `<select class="rv-in rv-item-owner" data-rv-item="${esc(i.id)}" aria-label="Who has ${esc(i.name)}"${locked ? ' disabled' : ''}>
        <option value="">${i.price && !owner ? 'Buy for…' : '—'}</option>${who.map(w => `<option value="${w.s}"${owner === w.s ? ' selected' : ''}>${esc(w.n)}</option>`).join('')}</select>` : ''}
    </div>`;
  };
  return `<div class="rv-card rv-shop-top">
      <div class="rv-row"><span class="rv-label">Merchant level</span><b>${merchant || '–'}</b><span class="rv-label">Lyst</span><b>${Number(c.lyst) || 0}</b></div>
      <div class="rv-chips">${slots.map(s => `<button type="button" class="rv-chip${_rvShopSlot === s ? ' on' : ''}" data-rv-slot="${s}">${s === 'all' ? 'All' : RV_SLOT_NAMES[s]}</button>`).join('')}</div>
      <div class="rv-hint">Buying for a Rover takes the price off the lyst. Items above your merchant level, and rewards you haven't earned, are greyed out.</div>
    </div>
    ${groups.map(([label, its]) => `<div class="rv-sec">${esc(label)}${label.startsWith('Merchant') && Number(label.slice(-1)) > merchant ? ' <span class="rv-dim">· not yet</span>' : ''}</div><div class="rv-card rv-items">${its.map(row).join('')}</div>`).join('')}`;
}

// ── Xulc: the expansion's sheet ──
function _rvXulcHtml(c, edit) {
  const esc = _escapeHtml;
  const X = _rvData.xulc;
  const x = c.xulc || {};
  if (!x.on) {
    return `<div class="rv-card rv-start"><div class="rv-start-sub">The Xulc campaign picks up after Quest 9. Its sheet adds ten encounters, milestones, the Xulc infestation and the Xulc board.</div>
      ${edit ? '<button type="button" class="rv-btn" data-rv-xon>Start the Xulc sheet</button>' : ''}</div>`;
  }
  const enc = x.enc || {};
  const ms = x.ms || {};
  const rovers = c.rovers || {};
  const groups = X.groups.map(g => `<div class="rv-chapter${g.length > 1 ? ' rv-three' : ''}">${g.map(id => {
    const e = X.encounters.find(y => y.id === id);
    return `<button type="button" class="rv-enc${enc[id] ? ' done' : ''}" data-rv-xenc="${id}"><span class="rv-check">${enc[id] ? '✓' : ''}</span><span class="rv-enc-id">${id}</span><span class="rv-enc-name">${esc(e.title)}</span></button>`;
  }).join('')}</div>`).join('');
  const inf = x.inf || {};
  const infRows = RV_SLOTS.filter(s => rovers[s] && rovers[s].player).map(s => {
    const v = inf[s] || {};
    return `<div class="rv-inf">
      <span class="rv-inf-who">${esc(rovers[s].player)}</span>
      <span class="rv-opts">${[0, 1, 2, 3, 4].map(n => `<button type="button" class="rv-opt${(v.stage || 0) === n ? ' on' : ''}" data-rv-xinf="${s}|${n}">${n ? `Stage ${n}` : 'None'}</button>`).join('')}</span>
      ${(v.stage || 0) >= 3 ? `<input class="rv-in" data-rv-text="xulc/inf/${s}/s3" value="${esc(v.s3 || '')}" placeholder="Stage 3: infected trait chosen" ${edit ? '' : 'readonly'}>` : ''}
      ${(v.stage || 0) >= 4 ? `<input class="rv-in" data-rv-text="xulc/inf/${s}/s4" value="${esc(v.s4 || '')}" placeholder="Stage 4: −3 health or infected card" ${edit ? '' : 'readonly'}>` : ''}
    </div>`;
  }).join('');
  const ether = x.ether || {};
  const f = X.ether;
  const etherRow = (kind, sym) => `<div class="rv-ether-row"><span class="rv-ether-sym rv-${kind}">${sym}</span>${f[kind].map(([opt, text]) => `<button type="button" class="rv-opt rv-ether-opt${ether[kind] ? ' on' : ''}" data-rv-xether="${kind}">${esc(text)}</button>`).join('')}</div>`;
  return `<div class="rv-sec">Encounters</div>
    <div class="rv-map">${groups}</div>
    <div class="rv-hint">After the first, encounters 2–4 can come in any order, then 5, then 6–8 in any order.</div>
    <div class="rv-sec">Milestones</div>
    <div class="rv-card rv-mslist">${X.milestones.map(m => `<button type="button" class="rv-ms${ms[m.id] ? ' on' : ''}" data-rv-xms="${m.id}"><span class="rv-check">${ms[m.id] ? '✓' : ''}</span><span class="rv-ms-label">${esc(m.label)}</span></button>`).join('')}</div>
    <div class="rv-sec">Xulc infestation</div>
    <div class="rv-card">${X.infestation.map(s => `<div class="rv-line"><b>Stage ${s.stage}</b> ${esc(s.text)}</div>`).join('')}${infRows || '<div class="rv-hint">Add the Rovers first.</div>'}</div>
    <div class="rv-sec">Xulc board and ether field</div>
    <div class="rv-card">
      <div class="rv-row"><span class="rv-label">Xulc board</span><span class="rv-opts">${['A', 'B'].map(b => `<button type="button" class="rv-opt${x.board === b ? ' on' : ''}" data-rv-xboard="${b}">${b}</button>`).join('')}</span></div>
      <div class="rv-ether"><div class="rv-ether-label">${esc(f.label)}</div>${etherRow('aura', '☀')}${etherRow('miasma', '☾')}</div>
    </div>
    <div class="rv-hint">Rovers' advance and master traits are the Trait 1 and Trait 2 on the Rovers tab; Xulc's own classes are in the class lists there.</div>`;
}

// ── Notes and the games logged ──
function _rvNotesHtml(c, edit) {
  const esc = _escapeHtml;
  const plays = _rvPlays().slice().reverse();
  const D = _rvData;
  const title = (id) => { const e = Object.values(D.quests).flatMap(q => q.encounters).find(x => x.id === id); return e ? e.title : ''; };
  return `<textarea class="rv-notes" data-rv-text="notes" placeholder="Notes: story choices, keywords, what to remember next time…" ${edit ? '' : 'readonly'}>${esc(c.notes || '')}</textarea>
    <div class="rv-sec">Games logged · ${plays.length}</div>
    <div class="rv-card rv-log">${plays.length ? plays.map(p => `<div class="rv-logrow">
      <span class="rv-dim">${_fmtDateShort(p.date)}</span>
      <span class="rv-res ${p.won ? 'w' : 'l'}">${p.won ? 'W' : 'L'}</span>
      <span><b>${esc(p.enc || p.p.b || 'Rove')}</b> ${p.enc ? esc(title(p.enc)) : ''}<br><span class="rv-dim">${(p.p.sc || []).map(s => `${esc(s.n)}${s.r ? `: ${esc(s.r)}` : ''}`).join(' · ')}</span></span>
    </div>`).join('') : '<div class="rv-hint">No games of Rove logged yet. Log them with the encounter as the scenario, e.g. “Scenario 1.2”.</div>'}</div>`;
}

// ── what a tap or an edit does ──
async function _rvClick(panel, ev) {
  const t = ev.target.closest('button[data-rv-tab],button[data-rv-start],button[data-rv-enc],button[data-rv-level],button[data-rv-ms],button[data-rv-msv],button[data-rv-merchant],button[data-rv-reward],button[data-rv-ether],button[data-rv-lyst],button[data-rv-lystadd],button[data-rv-fill],button[data-rv-slot],button[data-rv-remove],button[data-rv-xon],button[data-rv-xenc],button[data-rv-xms],button[data-rv-xinf],button[data-rv-xboard],button[data-rv-xether]');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.rvTab) { _rvTab = ds.rvTab; _rvRender(panel); return; }
  if (ds.rvSlot) { _rvShopSlot = ds.rvSlot; _rvRender(panel); return; }
  if (ds.rvStart !== undefined) {
    t.disabled = true;
    const enc = {};
    _rvPlays().forEach(p => { if (p.enc && p.won && !p.xulc) enc[_rvKey(p.enc)] = p.date; });
    try {
      await _rvCreate({ name: '', level: 1, rovers: _rvGuessRovers(), enc, created: Date.now(), updated: Date.now(), by: _rvMe() });
    } catch (e) {
      console.warn('Rove campaign: not started', e);
      t.disabled = false;
      t.textContent = 'Couldn\'t start it. Try again';
      return;
    }
    _rvRender(panel);
    return;
  }
  const c = _rvCamps[_rvId];
  if (!c || !_rvCanEdit(c)) return;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const up = {};
  if (ds.rvEnc) { const k = _rvKey(ds.rvEnc); up[`enc/${k}`] = (c.enc || {})[k] ? null : today; }
  else if (ds.rvLevel) { const n = Number(ds.rvLevel); up.level = n === (c.level || 1) && n > 1 ? n - 1 : n; }
  else if (ds.rvMs) up[`ms/${ds.rvMs}`] = (c.ms || {})[ds.rvMs] ? null : true;
  else if (ds.rvMsv) { const [id, o] = ds.rvMsv.split('|'); up[`ms/${id}`] = (c.ms || {})[id] === o ? null : o; }
  else if (ds.rvMerchant) { const n = Number(ds.rvMerchant); up.merchant = n === c.merchant ? n - 1 : n; }
  else if (ds.rvReward) up[`rewards/${ds.rvReward}`] = (c.rewards || {})[ds.rvReward] ? null : true;
  else if (ds.rvEther) { const [f, kind, v] = ds.rvEther.split('|'); up[`ether/${f}/${kind}`] = ((c.ether || {})[f] || {})[kind] === v ? null : v; }
  else if (ds.rvLyst) _rvLystUp(c, up, Number(ds.rvLyst), '');
  else if (ds.rvLystadd !== undefined) {
    const amt = Number(panel.querySelector('.rv-lyst-amt').value);
    if (!amt) return;
    _rvLystUp(c, up, amt, panel.querySelector('.rv-lyst-note').value.trim());
  }
  else if (ds.rvFill !== undefined) _rvPlays().forEach(p => { if (p.enc && p.won && !p.xulc && !(c.enc || {})[_rvKey(p.enc)]) up[`enc/${_rvKey(p.enc)}`] = p.date; });
  else if (ds.rvRemove) { if (!confirm('Remove this Rover from the sheet?')) return; up[`rovers/${ds.rvRemove}`] = null; }
  else if (ds.rvXon !== undefined) up['xulc/on'] = true;
  else if (ds.rvXenc) up[`xulc/enc/${ds.rvXenc}`] = ((c.xulc || {}).enc || {})[ds.rvXenc] ? null : today;
  else if (ds.rvXms) up[`xulc/ms/${ds.rvXms}`] = ((c.xulc || {}).ms || {})[ds.rvXms] ? null : true;
  else if (ds.rvXinf) { const [s, n] = ds.rvXinf.split('|'); up[`xulc/inf/${s}/stage`] = Number(n) || null; }
  else if (ds.rvXboard) up['xulc/board'] = (c.xulc || {}).board === ds.rvXboard ? null : ds.rvXboard;
  else if (ds.rvXether) up[`xulc/ether/${ds.rvXether}`] = ((c.xulc || {}).ether || {})[ds.rvXether] ? null : true;
  if (!Object.keys(up).length) return;
  _rvPatch(up);
  _rvRender(panel);
}
function _rvLystUp(c, up, d, note) {
  up.lyst = (Number(c.lyst) || 0) + d;
  // quick taps in a row (+10, +10, +5) make one line in the log
  const me = _rvMe() || '';
  const [lastKey, last] = Object.entries(c.lystLog || {}).sort((a, b) => b[1].at - a[1].at)[0] || [];
  if (last && !note && !last.note && last.by === me && Date.now() - last.at < 15000) {
    up[`lystLog/${lastKey}`] = { ...last, d: last.d + d, at: Date.now() };
    return;
  }
  up[`lystLog/${Date.now()}`] = { d, note, at: Date.now(), by: me };
}

function _rvChange(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-rv-camp]')) { _rvId = t.value; _rvRender(panel); return; }
  const c = _rvCamps[_rvId];
  if (!c || !_rvCanEdit(c)) return;
  if (t.matches('[data-rv-rover]')) {
    const [slot, field] = t.dataset.rvRover.split('|');
    const up = { [`rovers/${slot}/${field}`]: t.value || null };
    // a new base class clears what grew out of the old one
    if (field === 'base') Object.assign(up, { [`rovers/${slot}/prime`]: null, [`rovers/${slot}/apex`]: null, [`rovers/${slot}/trait1`]: null, [`rovers/${slot}/trait2`]: null });
    if (field === 'prime') Object.assign(up, { [`rovers/${slot}/apex`]: null, [`rovers/${slot}/trait1`]: null, [`rovers/${slot}/trait2`]: null });
    if (field === 'apex') up[`rovers/${slot}/trait2`] = null;
    _rvPatch(up);
    _rvRender(panel);
    return;
  }
  if (t.matches('[data-rv-item]')) {
    const it = _rvData.items.find(i => i.id === t.dataset.rvItem);
    const k = _rvKey(it.id);
    const had = (c.items || {})[k];
    const up = { [`items/${k}`]: t.value || null };
    // buying from the merchant takes the price off the lyst
    if (!had && t.value && it.price) _rvLystUp(c, up, -it.price, `Bought ${it.name}`);
    _rvPatch(up);
    _rvRender(panel);
  }
}

// Typing in the party name, the notes or an infestation choice: saved a moment after you stop.
function _rvInput(panel, ev) {
  const t = ev.target;
  const path = t.dataset && t.dataset.rvText;
  if (!path) return;
  const c = _rvCamps[_rvId];
  if (!c || !_rvCanEdit(c)) return;
  clearTimeout(_rvSaveTimers[path]);
  _rvSaveTimers[path] = setTimeout(() => _rvPatch({ [path]: t.value }), 700);
}
