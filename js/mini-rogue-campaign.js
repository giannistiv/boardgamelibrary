// ── Mini Rogue campaigns (the Campaign tab on Mini Rogue's and The Council's game pages) ──
// The solo campaign: one player, one character for the whole campaign (to
// change character you start it over), a chapter at a time. Each attempt at a
// chapter is a game, in Roguelike difficulty; won, the book says where to go
// next, lost, you play it again (or, at a boss, the book may send you
// elsewhere). Every attempt earns Perk Points: 1 per Floor completed (a won
// chapter counts its last Floor) and 1 per Level reached past the first.
// They buy permanent Skills on the campaign sheet's tree (three paths, at
// most two of them, one branch per path); Relics are kept for good. Each
// campaign is kept in Firebase (mrCampaigns/{id}), and each attempt is logged
// as a play, offered to BG Stats.
//
// The base game's chapters are here in short, from Nuts! Publishing's
// campaign book (nutspublishing.com, Mini Rogue downloads): the setup, the
// goal and where each result leads. A chapter's own text shows once the
// campaign reaches it, so the story isn't given away. The Council's campaign
// book and the campaign sheet (the skill tree, what each Relic does) aren't
// published: there the chapters, Skills and Relics are written in as the
// campaign goes (MR_GAMES[…].chapters null: chapters by number).

const MR_BGGID = 311715;
const MRC_BGGID = 417020;

// The characters, by box. route: the group the base book's branches name
// (Rogue and Crusader one way, Priestess and Mage the other); the rest pick
// their road.
const MR_CHARS = [
  { id: 'rogue', name: 'Rogue', box: 'Mini Rogue', color: '#8a5ab0', blurb: 'Cunning, deadly strikes, and an expert at not being seen.' },
  { id: 'crusader', name: 'Crusader', box: 'Mini Rogue', color: '#b8892c', blurb: 'Uses armor both to attack and to shield from monsters.' },
  { id: 'priestess', name: 'Priestess', box: 'Mini Rogue', color: '#3f8f8a', blurb: 'Spends her life force to strengthen her attacks; calls for blessings.' },
  { id: 'mage', name: 'Mage', box: 'Mini Rogue', color: '#3c6fb4', blurb: 'Conjures magic attacks and foresees the dangers ahead.' },
  { id: 'ratcatcher', name: 'Rat Catcher', box: 'The Council', color: '#7d6a3a', blurb: 'Powers that trigger on spending and gaining Food.' },
  { id: 'flagellant', name: 'Flagellant', box: 'The Council', color: '#a0392f', blurb: 'Uses his own health as a resource.' },
  { id: 'plaguedoctor', name: 'Plague Doctor', box: 'The Council', color: '#4f7a3a', blurb: 'Powers that trigger when characters are poisoned.' },
  { id: 'alchemist', name: 'Alchemist', box: 'The Council', color: '#b06a2a', blurb: 'Buys potions while exploring; gold buys rerolls.' },
  { id: 'thief', name: 'Thief', box: 'Expansions', color: '#5b5f6b' },
  { id: 'cleric', name: 'Cleric', box: 'Expansions', color: '#c2a14a' },
  { id: 'witch', name: 'Witch', box: 'Expansions', color: '#6d3f8c' },
  { id: 'bones', name: 'Bones', box: 'Expansions', color: '#8c8c80' },
  { id: 'occultist', name: 'Occultist', box: 'Expansions', color: '#5a4a7a' },
  { id: 'tinkerer', name: 'Tinkerer', box: 'Expansions', color: '#7a6a4a' },
];

// The base game's campaign book. kind: 'story' (read, then go on), 'play' (a
// game), 'end' (an ending). side: the Dungeon mat's side; start: the Floor
// you start on; last: the Floor the chapter ends at (defeating its Boss wins
// it, and a Fall there only costs HP). win / boss: where a win, or being
// killed by the chapter's boss, leads (by character when the book says so);
// a death before that restarts the chapter. relic: gained at its setup.
// place: where the story has you (the book's chapters are numbered, not named).
const MR_BASE_CHAPTERS = [
  { n: '1', kind: 'story', place: 'The City', read: 'The King sends his elected champion north for the Og\'s Blood. Around his neck, an obsidian amulet shimmers.',
    go: { rogue: '8', crusader: '8', priestess: '10', mage: '10', cleric: '10' } },
  { n: '8', kind: 'play', place: 'An old sewer', side: 'Dungeon', start: 1, last: 2,
    read: 'On the way to the Emerald Tower, two robed figures ambush you in the Murky Forest. You wake in an old sewer.',
    setup: ['Add the Curse and Poison dice to your dice pool.'], goal: 'Defeat the Boss at the end of the second Floor.', win: '11', boss: '4' },
  { n: '10', kind: 'play', place: 'A derelict tower', side: 'Tower', start: 1, last: 2,
    read: 'Lost in the fog of the Ivory Plains, you enter an old tower and its doors seal behind you.',
    setup: ['Set the Cursed Dragon as the second Boss.', 'Add the Curse die to your dice pool.'], goal: 'Defeat the Cursed Dragon.', win: '11', boss: '5', bossName: 'the Cursed Dragon' },
  { n: '4', kind: 'play', place: 'The black tower', side: 'Tower', start: 1, last: 3, relic: 'pilgrim',
    read: 'An old man and young Eddar pulled you out of the sewers. Your potions are shards. You need the Eye to find the Og\'s Blood.',
    setup: ['Remove the Cursed Dragon from the game.', 'Gain the Pilgrim\'s Flesh.'], goal: 'Defeat the Boss of the third Floor.', win: { rogue: '6', crusader: '9' } },
  { n: '5', kind: 'play', place: 'The tower', side: 'Tower', start: 2, last: 3,
    read: 'The dragon\'s village ties you to a pyre. Strange words pour out of you, and you wake on cold ground.',
    setup: ['Start on the second Floor.', 'Remove the Cursed Dragon from the game.'], goal: 'Defeat the Boss of the third Floor.', win: { mage: '6', priestess: '9', cleric: '9' } },
  { n: '11', kind: 'play', place: 'The tower', side: 'Tower', start: 2, last: 3, relic: 'bone',
    read: 'A one-eyed woman nurses you and fastens an amulet around your neck: "They want you to finish what you\'ve started."',
    setup: ['Start on the second Floor.', 'Remove the Cursed Dragon from the game.', 'Gain the Bone of Ernazar.'], goal: 'Defeat the Boss of the third Floor.', win: { rogue: '6', mage: '6', priestess: '9', crusader: '9', cleric: '9' } },
  { n: '6', kind: 'play', place: 'The dungeon', side: 'Dungeon', start: 1, last: 4, relic: 'eye', final: true,
    read: 'The Eye of Constantine is yours, and you give in to its whispers: "Find the traitor\'s heart."',
    setup: ['HP 12 with the Pilgrim\'s Flesh, otherwise 10.', '1 XP more with the Bone of Ernazar.', 'Gain the Eye of Constantine.'], goal: 'Defeat Og\'s Remains on the last Floor.', win: '3', bossName: 'Og\'s Remains' },
  { n: '9', kind: 'play', place: 'The dungeon', side: 'Dungeon', start: 1, last: 4, relic: 'eye', final: true,
    read: 'The Eye of Constantine is yours, and it leads you to the dungeon of the Og\'s Blood.',
    setup: ['1 XP more with the Bone of Ernazar.', 'Gain the Eye of Constantine.'], goal: 'Defeat Og\'s Remains.', win: '3', bossName: 'Og\'s Remains' },
  { n: '3', kind: 'story', place: 'Og\'s Remains', read: 'The ruby is a blood-filled vial. A voice inside you says: "Wear the blood of the traitor."',
    choose: [['7', 'Put the Og\'s Blood around your neck'], ['2', 'Honor your word: bring it back to the King']] },
  { n: '2', kind: 'end', place: 'The City', read: 'You bring the King the Og\'s Blood and the Eye. They make him a god, and not a merciful one. You end up in his deepest cell… or do you?' },
  { n: '7', kind: 'end', place: 'Og\'s domain', read: 'The Old Gods speak to you. His lifeblood is now yours, and your life is theirs: you have become Og.' },
];
const MR_BASE_RELICS = [
  { id: 'pilgrim', name: 'Pilgrim\'s Flesh' },
  { id: 'eye', name: 'Eye of Constantine' },
  { id: 'bone', name: 'Bone of Ernazar' },
];
// How far a chapter is down the road: for the progress bar.
const MR_BASE_DEPTH = { 1: 0, 8: 1, 10: 1, 4: 2, 5: 2, 11: 2, 6: 3, 9: 3, 3: 4, 2: 5, 7: 5 };
const MR_GAMES = {
  [MR_BGGID]: { key: 'base', name: 'Mini Rogue', color: '#a3322f', chapters: MR_BASE_CHAPTERS, relics: MR_BASE_RELICS, first: ['Mini Rogue', 'Expansions', 'The Council'] },
  [MRC_BGGID]: { key: 'council', name: 'The Council', color: '#6a4a8c', chapters: null, relics: [], first: ['The Council', 'Mini Rogue', 'Expansions'] },
};
const MR_PATHS = [['exploration', 'Exploration'], ['survival', 'Survival'], ['combat', 'Combat']];

let _mrCamps = null;          // mrCampaigns from Firebase: {id: campaign}
let _mrSrc = {};              // id → the store it lives in ('main' | 'spare', see fbWrite)
let _mrGame = null;           // the game page open (its bggId)
let _mrId = null;             // the campaign open; null: none (or the start form, with _mrDraft)
let _mrTab = 'camp';          // 'camp' | 'sheet' | 'notes'
let _mrDraft = null;          // the start form, while it's open
let _mrRes = null;            // the result being filled in on this phone
let _mrPanel = null;
let _mrSaveTimers = {};
let _mrPlaysStale = false;    // an attempt's play was logged: the Plays tab is drawn again when opened
const _mrLogging = new Set(); // id + log key: being logged on this phone

const _mrG = (c) => MR_GAMES[(c && c.game) || _mrGame] || MR_GAMES[MR_BGGID];
const _mrChar = (id) => MR_CHARS.find(x => x.id === id) || null;
const _mrCharName = (c) => { const ch = _mrChar(c && c.char); return ch ? ch.name : (c && c.charName) || 'Adventurer'; };
const _mrCh = (c, n) => { const list = _mrG(c).chapters; return list ? list.find(x => x.n === String(n)) || null : null; };
const _mrMe = () => (typeof _navPlayer === 'function' ? _navPlayer() : null);
const _mrToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function _mrDate(v) {
  if (!v) return '';
  const d = typeof v === 'number' ? new Date(v) : new Date(`${v}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
// The player's, and whoever started it: the ones who fill it in.
function _mrCanEdit(c) {
  const me = _mrMe();
  if (!me || !c) return false;
  return !c.player || c.player === me || c.by === me;
}
// Where a result leads: a chapter, by character when the book says so (null:
// the book names other characters, so the player picks).
function _mrLead(c, to) {
  if (!to) return null;
  if (typeof to === 'string') return to;
  return to[c.char] || null;
}
// Perk Points for an attempt: a point per Floor completed, a point per Level past the first.
const _mrPP = (floors, level) => Math.max(0, floors || 0) + Math.max(0, (level || 1) - 1);

async function _mrLoad(force) {
  if (force || !_mrCamps) {
    const { main, spare } = await fbReadBoth('mrCampaigns');
    _mrCamps = {};
    _mrSrc = {};
    for (const [store, data] of [['spare', spare], ['main', main]]) {
      for (const id in (data || {})) { if (data[id] && typeof data[id] === 'object') { _mrCamps[id] = data[id]; _mrSrc[id] = store; } }
    }
  }
  if (_mrId && !_mrCamps[_mrId]) _mrId = null;
}
// Some fields of the campaign: {path: value}, path relative to it; null removes.
async function _mrPatch(updates, id = _mrId) {
  const c = _mrCamps[id];
  if (!c) return;
  for (const [path, v] of Object.entries(updates)) _mrSetAt(c, path.split('/'), v);
  c.updated = Date.now();
  try {
    await fbWrite(`mrCampaigns/${id}`, 'PATCH', { ...updates, updated: c.updated }, _mrSrc[id]);
  } catch (e) {
    console.warn('Mini Rogue campaign: not saved', e);
    _mrToast('Not saved. Check the connection and try again.');
  }
}
function _mrSetAt(o, parts, v) {
  for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
  const last = parts[parts.length - 1];
  if (v === null || v === undefined) delete o[last]; else o[last] = v;
}
function _mrToast(msg, ok) {
  const el = _mrPanel && _mrPanel.querySelector('.rv-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('ok', !!ok);
  el.hidden = false;
  clearTimeout(_mrToast.t);
  _mrToast.t = setTimeout(() => { el.hidden = true; }, 5000);
}

// ── Where a campaign stands ──
function _mrState(c) {
  if (c.status === 'won') { const e = _mrCh(c, c.at); return e && e.kind === 'end' ? `ending ${e.n} reached` : 'won'; }
  if (c.status === 'stopped') return `stopped ${_mrDate(c.stopped)}`;
  if (c.playing) return `playing chapter ${c.at}`;
  const ch = _mrCh(c, c.at);
  if (ch && ch.kind === 'story') return `read chapter ${c.at}`;
  return `chapter ${c.at || 1}`;
}
// For Play → Campaigns: { pct, text, done }.
function mrSummary(c) {
  const done = c.status === 'won';
  const g = _mrG(c);
  let pct;
  if (g.chapters) pct = Math.round(((MR_BASE_DEPTH[c.at] || 0) / 5) * 100);
  else pct = Math.min(90, new Set(Object.values(c.log || {}).filter(l => l && l.won).map(l => l.ch)).size * 10);
  return { pct: done ? 100 : pct, text: `${_mrCharName(c)} · ${_mrState(c)}`, done };
}
// Each campaign of the game, for its own tab: the viewer's first, then the latest.
function _mrIdsOf(game) {
  const me = _mrMe();
  const mine = (c) => !!(me && (c.player === me || c.by === me));
  return Object.keys(_mrCamps || {}).filter(id => Number(_mrCamps[id].game) === Number(game))
    .sort((a, b) => { const A = _mrCamps[a], B = _mrCamps[b]; return (mine(B) - mine(A)) || ((B.updated || 0) - (A.updated || 0)); });
}

// ── rendering ──
function buildMrCampaignHtml(game) {
  if (!game || !MR_GAMES[Number(game.bggId)]) return '';
  return `<div class="rv cr mr" data-mr="${Number(game.bggId)}"><div class="rv-loading">Opening the campaigns…</div></div>`;
}

function wireMrCampaign(content) {
  const panel = content.querySelector('[data-mr]');
  if (!panel) return;
  const game = Number(panel.dataset.mr);
  if (_mrGame !== game) { _mrGame = game; _mrId = null; _mrDraft = null; _mrRes = null; _mrTab = 'camp'; }
  _mrPanel = panel;
  _mrLoad(true).then(() => {
    if (_mrId && Number((_mrCamps[_mrId] || {}).game) !== game) _mrId = null;
    _mrRender(panel);
  }).catch(e => {
    panel.innerHTML = `<div class="rv-loading">The campaigns couldn't be loaded. Try again in a moment.</div>`;
    console.warn('Mini Rogue campaign:', e);
  });
  panel.addEventListener('click', (ev) => _mrClick(panel, ev));
  panel.addEventListener('input', (ev) => _mrInput(panel, ev));
  // an attempt's play logged since the page opened: its Plays tab drawn again
  const tabs = content.querySelector('.gm-tabs');
  if (tabs) tabs.addEventListener('click', (ev) => {
    const t = ev.target.closest('.gm-tab');
    if (!t || t.dataset.tab !== 'plays' || !_mrPlaysStale) return;
    _mrPlaysStale = false;
    _modalTab = 'plays';
    _modalTabFor = game;
    openModal(findGameByBggId(game));
  });
}

function _mrTabsHtml() {
  const esc = _escapeHtml;
  const ids = _mrIdsOf(_mrGame);
  const tab = (id) => {
    const c = _mrCamps[id], ch = _mrChar(c.char);
    return `<button type="button" class="cr-camp${id === _mrId ? ' on' : ''}${c.status ? ` ended ${c.status}` : ''}" data-mr-camp="${esc(id)}" style="--cr-c:${esc((ch && ch.color) || '#888')}" aria-expanded="${id === _mrId}">
      <b>${esc(c.name || `The ${_mrCharName(c)}`)}</b>
      <span>${esc(_mrCharName(c))} · ${esc(_mrState(c))}</span>
      ${c.player ? `<span class="cr-camp-who">${esc(c.player)}</span>` : ''}</button>`;
  };
  const active = ids.filter(id => !_mrCamps[id].status), ended = ids.filter(id => _mrCamps[id].status);
  const isNew = !_mrId && !!_mrDraft;
  return `<div class="cr-camps">${active.map(tab).join('')}
      <button type="button" class="cr-camp cr-camp-new${isNew ? ' on' : ''}" data-mr-camp="__new" aria-expanded="${isNew}"><b>+ A new campaign</b><span>Solo · one character, start to end</span></button></div>
    ${ended.length ? `<div class="rv-sub">Stopped and finished</div><div class="cr-camps">${ended.map(tab).join('')}</div>` : ''}
    ${!_mrId && !_mrDraft && ids.length ? '<div class="rv-hint cr-camps-hint">Tap a campaign to open it.</div>' : ''}`;
}

function _mrRender(panel) {
  const esc = _escapeHtml;
  _mrPanel = panel;
  const c = _mrId && _mrCamps[_mrId];
  if (!c) {
    panel.innerHTML = `${_mrTabsHtml()}${_mrDraft ? _mrStartHtml() : ''}<div class="rv-toast" hidden></div>${_mrCreditHtml()}`;
    _mrWire(panel);
    return;
  }
  const edit = _mrCanEdit(c);
  const g = _mrG(c), ch = _mrChar(c.char);
  const nSk = Object.keys(c.skills || {}).length, nRe = Object.keys(c.relics || {}).length;
  const tabs = [['camp', 'Campaign'], ['sheet', `Skills &amp; Relics${nSk + nRe ? ` <span class="gm-tab-n">${nSk + nRe}</span>` : ''}`], ['notes', 'Notes']];
  const body = { camp: _mrCampHtml, sheet: _mrSheetHtml, notes: _mrNotesHtml }[_mrTab](c, edit);
  panel.innerHTML = `
    ${_mrTabsHtml()}
    <div class="cr-open" style="--cr-m:${esc((ch && ch.color) || g.color)}">
    <div class="rv-head">
      <input class="rv-party" data-mr-text="name" value="${esc(c.name || '')}" placeholder="Campaign name" ${edit ? '' : 'readonly'} aria-label="Campaign name">
    </div>
    <div class="cr-sub">${esc(g.name)} campaign · ${esc(c.player || '?')} as the <b style="color:${esc((ch && ch.color) || 'inherit')}">${esc(_mrCharName(c))}</b> · Roguelike</div>
    ${edit ? '' : `<div class="rv-ro">${_mrMe() ? 'Only its player can fill in this campaign.' : 'Log in to fill in the campaign.'}</div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_mrTab === k ? ' on' : ''}" data-mr-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body${edit ? '' : ' rv-readonly'}">${body}</div>
    </div>
    <div class="rv-toast" hidden></div>
    ${_mrCreditHtml()}`;
  _mrWire(panel);
}
function _mrCreditHtml() {
  return `<div class="rv-credit">The chapters, Perk Points and Relics from Nuts! Publishing's <a href="https://www.nutspublishing.com/eshop/mini-rogue-en" target="_blank" rel="noopener">campaign book</a>, in short here: the book has them in full. The Council's campaign book and the campaign sheet (the skill tree, what each Relic does) aren't published, so they're written in as you go.</div>`;
}

// The player: typed, with the names the app knows offered as you type.
function _mrWire(panel) {
  if (typeof comboAttach !== 'function') return;
  panel.querySelectorAll('input[data-mr-who]').forEach(inp => {
    const names = () => {
      const top = [...new Set([...(_mrMe() ? [_mrMe()] : []), ...(typeof ILIOUPOLI_MEMBERS !== 'undefined' ? ILIOUPOLI_MEMBERS : [])])];
      return [...top, ...[...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].filter(n => !top.includes(n)).sort()];
    };
    comboAttach(inp, { options: names, onPick: (v) => { if (_mrDraft) _mrDraft.player = v; }, max: 80 });
  });
}
function _mrClean(v) { return String(v || '').trim().replace(/\s+/g, ' ').slice(0, 40); }

// ── Starting a campaign: the character and the player ──
function _mrStartHtml() {
  const esc = _escapeHtml;
  const d = _mrDraft, g = MR_GAMES[_mrGame];
  const boxes = g.first.map(box => {
    const chars = MR_CHARS.filter(x => x.box === box);
    return `<div class="rv-sub">${esc(box)}</div><div class="cr-hpicks">${chars.map(x => `<button type="button" class="cr-hpick${d.char === x.id ? ' on' : ''}" data-mr-draft-char="${x.id}" style="--cr-c:${esc(x.color)}" aria-pressed="${d.char === x.id}">
      <b>${esc(x.name)}</b>${x.blurb ? `<span>${esc(x.blurb)}</span>` : ''}</button>`).join('')}</div>`;
  }).join('');
  return `<div class="rv-start cr-start">
    <div class="rv-start-title">Start a ${esc(g.name)} campaign</div>
    <div class="rv-start-sub">Solo, in Roguelike difficulty: each chapter starts from the character's starting stats, with only the Skills unlocked and the Relics carried. The character stays for the whole campaign: a different one means a new campaign.${g.chapters ? '' : ' The Council\'s chapters are kept by number, as its campaign book sends you.'}</div>
    <div class="rv-sub">Who's playing</div>
    <input class="rv-in cr-who cr-who-wide" data-mr-who="player" value="${esc(d.player)}" placeholder="The player" maxlength="40" enterkeyhint="done">
    <div class="rv-sub">The character</div>
    ${boxes}
    <label class="rv-field cr-draft-name"><span>Campaign name</span><input class="rv-in" data-mr-draft-name value="${esc(d.name)}" placeholder="Optional"></label>
    ${_mrMe() ? `<button type="button" class="rv-btn" data-mr-start>Start the campaign</button>` : '<div class="rv-start-sub">Log in to start one.</div>'}
  </div>`;
}

// ── The Campaign tab: the chapter, the Perk Points, the road, the attempts ──
function _mrCampHtml(c, edit) {
  const esc = _escapeHtml;
  const g = _mrG(c);
  let top;
  if (c.status === 'stopped') top = `<div class="cr-end stopped">Stopped on ${esc(_mrDate(c.stopped))}: it's all kept as it was.${edit ? '<button type="button" class="rv-btn rv-btn-sm" data-mr-resume>Pick it up again</button>' : ''}</div>`;
  else if (g.chapters) top = _mrChapterHtml(c, edit);
  else top = _mrNumberedHtml(c, edit);
  const earned = Object.values(c.log || {}).reduce((n, l) => n + ((l && l.pp) || 0), 0);
  const log = Object.entries(c.log || {}).sort((a, b) => b[1].at - a[1].at);
  const road = _mrRoad(c);
  return `${top}
    <div class="rv-sec">Perk Points</div>
    <div class="cr-coins mr-pp">
      <button type="button" class="rv-dot" data-mr-pp="-1" aria-label="One Perk Point less"${c.perks > 0 ? '' : ' disabled'}>&minus;</button>
      <span class="cr-coins-n"><b>${c.perks || 0}</b> to spend</span>
      <button type="button" class="rv-dot" data-mr-pp="1" aria-label="One Perk Point more">+</button>
      <span class="cr-note">${earned} earned in all</span>
    </div>
    <div class="rv-hint">Spend them on Skills, on the Skills &amp; Relics tab. Each attempt adds its own: 1 per Floor completed, 1 per Level reached past the first.</div>
    ${road.length > 1 ? `<div class="rv-sec">Your road</div><div class="mr-road">${road.map((n, i) => `${i ? '<span class="mr-road-to" aria-hidden="true">&rarr;</span>' : ''}<span class="mr-road-ch${n === String(c.at) && !c.status ? ' at' : ''}" title="${esc(((_mrCh(c, n) || {}).place) || `Chapter ${n}`)}">${esc(n)}</span>`).join('')}</div>` : ''}
    ${log.length ? `<div class="rv-sec">Attempts <span class="cr-count">${log.length}</span></div><div class="cr-log mr-log">${log.map(([ts, l]) => `<div class="cr-log-row"><span>${esc(_mrDate(l.at))}</span><span>Chapter ${esc(l.ch)}<i> · ${esc(_mrResText(c, l))}</i></span><b class="${l.won ? 'won' : 'lost'}">+${l.pp || 0}&#8202;PP</b><span class="cr-log-acts">${_mrLogActs(c, ts, l, edit)}</span></div>`).join('')}</div>` : ''}
    ${edit ? `<div class="pc-foot">${c.status ? '' : '<button type="button" class="rv-link" data-mr-stop>Stop this campaign</button>'}<button type="button" class="rv-link pc-del" data-mr-delete>Delete this campaign</button></div>` : ''}`;
}
function _mrResText(c, l) {
  const lv = `Level ${l.level || 1}`;
  if (l.won) return `won · ${lv}`;
  const ch = _mrCh(c, l.ch);
  if (l.boss) return `killed by ${(ch && ch.bossName) || 'the Boss'} · ${lv}`;
  return `died${l.floor ? ` on Floor ${l.floor}` : ''} · ${lv}`;
}
// The chapters reached, in order (a chapter played again counts once).
function _mrRoad(c) {
  const road = (Array.isArray(c.road) ? c.road : Object.values(c.road || {})).map(String);
  const out = [];
  for (const n of road) if (out[out.length - 1] !== n) out.push(n);
  return out;
}

// The base game: the chapter the campaign is at, as its book has it.
function _mrChapterHtml(c, edit) {
  const esc = _escapeHtml;
  const ch = _mrCh(c, c.at);
  if (!ch) return `<div class="rv-card cr-card">Chapter ${esc(c.at)} isn't in the book.${edit ? ' <button type="button" class="rv-link" data-mr-goto>Go to another chapter</button>' : ''}</div>`;
  if (c.status === 'won' && ch.kind !== 'end') return `<div class="cr-end won">The campaign is won. &#127881;</div>${edit ? '<button type="button" class="rv-link" data-mr-unfinish>Not over after all</button>' : ''}`;
  const head = (st) => `<div class="cr-card-top"><span class="cr-mc-n">${esc(ch.n)}</span>
      <div class="cr-mc-id"><span class="cr-mc-st">${st}</span><b>Chapter ${esc(ch.n)}</b><span>${esc(ch.place)}${ch.side ? ` · ${esc(ch.side)} side` : ''}${ch.final ? ' · final battle' : ''}</span></div></div>`;
  const read = `<div class="mr-read">${esc(ch.read)}</div>`;
  if (ch.kind === 'end') {
    return `<div class="rv-card cr-card mr-ending">${head(c.status === 'won' ? 'The end' : 'An ending')}${read}
      <div class="cr-end won">The campaign is won. &#127881;</div>
      ${edit && c.status !== 'won' ? '<button type="button" class="rv-btn" data-mr-finish>It\'s over: the campaign is won</button>' : ''}
      ${edit ? `<div class="mr-other">${_mrOtherEnding(c)}</div>` : ''}</div>`;
  }
  if (ch.kind === 'story') {
    let go = '';
    if (ch.choose) go = ch.choose.map(([to, text]) => `<button type="button" class="cr-gobtn" data-mr-go="${to}"><span class="cr-mis-n">${esc(to)}</span><span><b>${esc(text)}</b><span>Go to chapter ${esc(to)}</span></span></button>`).join('');
    else {
      const to = _mrLead(c, ch.go);
      const opts = to ? [to] : [...new Set(Object.values(ch.go))];
      go = opts.map(n => `<button type="button" class="cr-gobtn" data-mr-go="${n}"><span class="cr-mis-n">${esc(n)}</span><span><b>Go to chapter ${esc(n)}</b><span>${esc(to ? `As the ${_mrCharName(c)}` : `As ${Object.keys(ch.go).filter(k => ch.go[k] === n).map(k => (_mrChar(k) || {}).name).join(' or ')}: your pick`)}</span></span></button>`).join('');
    }
    return `<div class="rv-card cr-card">${head('Read')}${read}
      <div class="rv-hint">Read chapter ${esc(ch.n)} in the campaign book${ch.choose ? ', then choose' : ''}. No game here.</div>
      ${edit ? `<div class="cr-go">${go}</div>` : ''}</div>`;
  }
  // a chapter to play
  const relics = c.relics || {};
  const setup = ch.setup.map(s => {
    // what the setup's conditions come to for this campaign
    if (/^HP 12 with the Pilgrim/.test(s)) return `${esc(s)} <b>${relics.pilgrim ? 'You have it: HP 12.' : 'You don\'t: HP 10.'}</b>`;
    if (/^1 XP more with the Bone of Ernazar/.test(s)) return `${esc(s)} <b>${relics.bone ? 'You have it: start with 1 XP.' : 'You don\'t have it.'}</b>`;
    return esc(s);
  });
  const win = _mrLead(c, ch.win);
  const winText = win ? `Go to chapter ${win}.` : `The book sends ${Object.entries(ch.win).map(([k, n]) => `the ${(_mrChar(k) || {}).name} to ${n}`).join(', ')}: choose.`;
  const lost = Object.values(c.log || {}).some(l => l && l.ch === ch.n && !l.won);
  const facts = `<div class="cr-facts">
      <div class="cr-fact rule"><span>Setup</span><p>Use the ${esc(ch.side)} side of the mat. Roguelike: −1 Food, −2 HP, −3 Gold.</p></div>
      ${setup.map(s => `<div class="cr-fact rule"><span>Setup</span><p>${s}</p></div>`).join('')}
      <div class="cr-fact win"><span>Goal</span><p>${esc(ch.goal)} The chapter ends at Floor ${ch.last}: a Fall there only costs the HP.</p></div>
      <div class="cr-fact rw"><span>Won</span><p>${esc(winText)}</p></div>
      ${ch.boss ? `<div class="cr-fact boss"><span>Killed</span><p>By ${esc(ch.bossName || `the Boss at the end of Floor ${ch.last}`)}: go to chapter ${esc(ch.boss)}. Dying before it: play the chapter again.</p></div>`
        : `<div class="cr-fact boss"><span>Died</span><p>Play the chapter again. The Perk Points earned stay.</p></div>`}
    </div>`;
  if (c.playing) return `<div class="rv-card cr-card cr-mcard playing">${head('Playing now')}${facts}${_mrResultHtml(c, ch, edit)}</div>`;
  return `<div class="rv-card cr-card cr-mcard">${head(lost ? 'Again' : 'Up next')}${read}${facts}
    ${edit ? `<button type="button" class="rv-btn cr-begin" data-mr-begin>Start chapter ${esc(ch.n)}</button>
      ${ch.relic && !relics[ch.relic] ? `<div class="rv-hint">Starting it adds the ${esc(MR_BASE_RELICS.find(r => r.id === ch.relic).name)} to your Relics.</div>` : ''}
      <button type="button" class="rv-link" data-mr-goto>Go to another chapter</button>` : ''}
  </div>`;
}
// At an ending: the other one, if you'd go back and choose again.
function _mrOtherEnding(c) {
  const other = c.at === '2' ? '7' : '2';
  return `<button type="button" class="rv-link" data-mr-go="3">Back to chapter 3, to choose again (ending ${other})</button>`;
}

// A result being filled in: won, killed by the boss, or died; the Floors completed and the Level reached.
function _mrResultHtml(c, ch, edit) {
  const esc = _escapeHtml;
  if (!edit) return '<div class="rv-hint">The chapter is being played.</div>';
  const numbered = !ch;
  if (!_mrRes || _mrRes.id !== _mrId || _mrRes.ch !== String(c.at)) _mrRes = { id: _mrId, ch: String(c.at), out: null, floors: 0, level: 1, next: '', end: false, pick: null };
  const r = _mrRes;
  const outs = [['won', 'Won']].concat(ch && ch.boss ? [['boss', `Killed by ${ch.bossName || 'the Boss'}`]] : []).concat([['died', 'Died']]);
  const last = ch ? ch.last : 4, first = ch ? ch.start || 1 : 1;
  const floorsMax = last - first + 1;
  // where it leads
  let lead = '';
  if (r.out === 'won' && ch) {
    const to = _mrLead(c, ch.win);
    lead = to ? `Then chapter ${to}.` : `<div class="cr-ask-q">Where does the book send you?</div><div class="cr-seg">${[...new Set(Object.values(ch.win))].map(n => `<button type="button" class="cr-seg-b${r.pick === n ? ' on' : ''}" data-mr-res-pick="${n}">Chapter ${n}</button>`).join('')}</div>`;
  } else if (r.out === 'boss' && ch) lead = `Then chapter ${ch.boss}.`;
  else if (r.out === 'died') lead = 'Then the chapter again.';
  if (numbered && r.out) {
    lead = r.out === 'won'
      ? `<label class="cr-row"><span class="cr-lbl cr-lbl-wide">The book sends you to chapter</span><input class="rv-in mr-chin" data-mr-res-next value="${esc(r.next)}" inputmode="numeric" maxlength="6" placeholder="No."></label>
        <button type="button" class="cr-flag${r.end ? ' on' : ''}" data-mr-res-end><span class="rv-check">${r.end ? '&#10003;' : ''}</span>That was the last chapter: the campaign is won</button>`
      : `<label class="cr-row"><span class="cr-lbl cr-lbl-wide">Sent elsewhere? Chapter</span><input class="rv-in mr-chin" data-mr-res-next value="${esc(r.next)}" inputmode="numeric" maxlength="6" placeholder="${esc(c.at)}"></label>
        <div class="rv-hint">Leave it as it is to play chapter ${esc(c.at)} again.</div>`;
  }
  const pp = _mrPP(r.floors, r.level);
  return `<div class="mr-result">
    <div class="cr-ask-q">How did it go?</div>
    <div class="cr-seg">${outs.map(([k, l]) => `<button type="button" class="cr-seg-b${r.out === k ? ' on' : ''}" data-mr-res-out="${k}">${esc(l)}</button>`).join('')}</div>
    ${r.out ? `
    <div class="cr-row"><span class="cr-lbl cr-lbl-wide">Floors completed${ch ? ` <span class="cr-note">(of ${floorsMax})</span>` : ''}</span>
      <button type="button" class="rv-dot" data-mr-res-floors="-1" aria-label="One less"${r.floors > 0 ? '' : ' disabled'}>&minus;</button><b class="cr-n">${r.floors}</b>
      <button type="button" class="rv-dot" data-mr-res-floors="1" aria-label="One more"${r.floors < (ch ? floorsMax : 4) ? '' : ' disabled'}>+</button></div>
    <div class="cr-row"><span class="cr-lbl cr-lbl-wide">Level reached</span>
      <span class="cr-seg cr-seg-sm">${[1, 2, 3].map(n => `<button type="button" class="cr-seg-b${r.level === n ? ' on' : ''}" data-mr-res-level="${n}">${n}</button>`).join('')}</span></div>
    <div class="mr-pp-sum"><b>+${pp}</b> Perk Point${pp === 1 ? '' : 's'}<span class="cr-note">${r.floors} for the Floors, ${Math.max(0, r.level - 1)} for the Levels</span></div>
    <div class="mr-lead">${lead}</div>
    <button type="button" class="rv-btn cr-begin" data-mr-save>Save the result</button>` : ''}
    <button type="button" class="rv-link" data-mr-cancel>Not playing it after all</button>
  </div>`;
}

// The Council: the chapters by number, as its campaign book sends you.
function _mrNumberedHtml(c, edit) {
  const esc = _escapeHtml;
  if (c.status === 'won') return `<div class="cr-end won">The campaign is won. &#127881;</div>${edit ? '<button type="button" class="rv-link" data-mr-unfinish>Not over after all</button>' : ''}`;
  const lost = Object.values(c.log || {}).some(l => l && l.ch === String(c.at) && !l.won);
  const head = `<div class="cr-card-top"><span class="cr-mc-n">${esc(c.at)}</span>
      <div class="cr-mc-id"><span class="cr-mc-st">${c.playing ? 'Playing now' : lost ? 'Again' : 'Up next'}</span><b>Chapter ${esc(c.at)}</b><span>The Council's campaign book</span></div></div>`;
  const rules = `<div class="cr-facts">
      <div class="cr-fact rule"><span>Setup</span><p>As the chapter says, in Roguelike: −1 Food, −2 HP, −3 Gold. Your Skills and Relics apply.</p></div>
      <div class="cr-fact boss"><span>Died</span><p>Play the chapter again, unless the book says otherwise. The Perk Points earned stay.</p></div></div>`;
  if (c.playing) return `<div class="rv-card cr-card cr-mcard playing">${head}${rules}${_mrResultHtml(c, null, edit)}</div>`;
  return `<div class="rv-card cr-card cr-mcard">${head}${rules}
    ${edit ? `<button type="button" class="rv-btn cr-begin" data-mr-begin>Start chapter ${esc(c.at)}</button>
      <div class="rv-hint">A chapter that's only read, with no game? Go on to the one it names:</div>
      <div class="cr-row"><input class="rv-in mr-chin" data-mr-goto-n placeholder="No." inputmode="numeric" maxlength="6" aria-label="Chapter"><button type="button" class="rv-btn rv-btn-sm rv-btn-soft" data-mr-goto-go>Go to that chapter</button>
      <button type="button" class="rv-link" data-mr-finish>The campaign is won</button></div>` : ''}
  </div>`;
}

// A line of the attempts: its play (BG Stats' QR code and the pencil), or a button to log it.
function _mrLogActs(c, ts, l, edit) {
  if (l.play) {
    const i = (PLAY_HISTORY[c.game] || []).findIndex(e => e.mp === l.play);
    if (i < 0) return '';
    return (typeof bgsSendBtnHtml === 'function' ? bgsSendBtnHtml(c.game, i) : '')
      + (typeof logPlayEditBtnHtml === 'function' ? logPlayEditBtnHtml(PLAY_HISTORY[c.game][i]) : '');
  }
  const signed = typeof acctMe === 'function' && acctMe();
  return edit && signed ? `<button type="button" class="cr-mini" data-mr-logplay="${_escapeHtml(ts)}">Log the play</button>` : '';
}

// ── Skills and Relics: the campaign sheet ──
function _mrSheetHtml(c, edit) {
  const esc = _escapeHtml;
  const g = _mrG(c);
  const skills = Object.entries(c.skills || {}).sort((a, b) => (a[1].rank || 1) - (b[1].rank || 1) || (a[1].at || 0) - (b[1].at || 0));
  const used = new Set(skills.map(([, s]) => s.path));
  const cols = MR_PATHS.map(([k, label]) => {
    const mine = skills.filter(([, s]) => s.path === k);
    const closed = !used.has(k) && used.size >= 2;
    return `<div class="mr-path${closed ? ' closed' : ''}"><div class="mr-path-h">${esc(label)}${closed ? ' <span class="cr-note">closed: two paths taken</span>' : ''}</div>
      ${mine.length ? mine.map(([id, s]) => `<div class="mr-skill"><span class="mr-rank">${s.rank || 1}</span><span class="mr-skill-main"><b>${esc(s.name)}</b>${s.text ? `<span>${esc(s.text)}</span>` : ''}</span>
        <span class="cr-note">${s.cost || 0}&#8202;PP</span>${edit ? `<button type="button" class="cr-person-x" data-mr-skill-x="${esc(id)}" aria-label="Take ${esc(s.name)} off">&times;</button>` : ''}</div>`).join('') : '<div class="cr-note">Nothing unlocked</div>'}</div>`;
  }).join('');
  const relics = c.relics || {};
  const known = g.relics.map(r => {
    const have = relics[r.id];
    return `<div class="mr-relic${have ? ' on' : ''}">
      <button type="button" class="cr-flag${have ? ' on' : ''}" data-mr-relic="${r.id}"><span class="rv-check">${have ? '&#10003;' : ''}</span><b>${esc(r.name)}</b></button>
      ${have ? `<input class="rv-in mr-relic-note" data-mr-text="relics/${r.id}/note" value="${esc(have.note || '')}" placeholder="What it does (from the campaign sheet)" maxlength="160" ${edit ? '' : 'readonly'}>` : ''}</div>`;
  }).join('');
  const own = Object.entries(relics).filter(([k]) => !g.relics.some(r => r.id === k)).sort((a, b) => (a[1].at || 0) - (b[1].at || 0)).map(([k, r]) => `<div class="mr-relic on">
      <div class="cr-flag on"><span class="rv-check">&#10003;</span><b>${esc(r.name || 'A Relic')}</b>${edit ? `<button type="button" class="cr-person-x" data-mr-relic-x="${esc(k)}" aria-label="Take it off">&times;</button>` : ''}</div>
      <input class="rv-in mr-relic-note" data-mr-text="relics/${esc(k)}/note" value="${esc(r.note || '')}" placeholder="What it does" maxlength="160" ${edit ? '' : 'readonly'}></div>`).join('');
  return `<div class="rv-sec">Skills <span class="cr-count">${c.perks || 0} Perk Point${c.perks === 1 ? '' : 's'} to spend</span></div>
    <div class="rv-hint rv-hint-top">The skill tree is on the campaign sheet, on the back of the character mat. Three paths: you may unlock at most two, and only one branch of each (once you have a rank 2 Skill in a path, its other rank 2 Skill is closed). Skills are passive: they apply in every game from now on.</div>
    <div class="mr-paths">${cols}</div>
    ${edit ? `<div class="rv-sub">Unlock a Skill</div>
    <div class="mr-skill-add">
      <input class="rv-in" data-mr-sk-name placeholder="Skill name" maxlength="50">
      <select class="rv-in" data-mr-sk-path aria-label="Path">${MR_PATHS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      <select class="rv-in" data-mr-sk-rank aria-label="Rank">${[1, 2, 3].map(n => `<option value="${n}">Rank ${n}</option>`).join('')}</select>
      <input class="rv-in mr-chin" data-mr-sk-cost type="number" min="0" max="20" inputmode="numeric" placeholder="PP" aria-label="Cost in Perk Points">
      <input class="rv-in mr-skill-text" data-mr-sk-text placeholder="What it does (optional)" maxlength="160">
      <button type="button" class="rv-btn rv-btn-sm" data-mr-sk-add>Unlock</button>
    </div>` : ''}
    <div class="rv-sec">Relics</div>
    <div class="rv-hint rv-hint-top">Kept for good: they don't count towards your Item limit and aren't lost when you die.</div>
    <div class="mr-relics">${known}${own}${!known && !own ? '<div class="cr-note">None yet.</div>' : ''}</div>
    ${edit ? `<div class="mr-relic-add"><input class="rv-in" data-mr-relic-name placeholder="${g.relics.length ? 'Another Relic' : 'A Relic the book gave you'}" maxlength="50"><button type="button" class="rv-btn rv-btn-sm" data-mr-relic-add>Add</button></div>` : ''}`;
}

function _mrNotesHtml(c, edit) {
  return `<textarea class="rv-in cr-notes" data-mr-text="notes" rows="10" placeholder="Choices made, what the story revealed, where you stopped…" ${edit ? '' : 'readonly'}>${_escapeHtml(c.notes || '')}</textarea>`;
}

// ── An attempt's play: logged in the app (js/log-play.js) and offered to BG Stats ──
// The player, with the character as their role; "Chapter 8" as the scenario,
// from when the chapter was started.
async function _mrLogPlay(id, ts) {
  const c = _mrCamps[id], l = c && (c.log || {})[ts];
  if (!l || l.play) return null;
  if (typeof logPlaySave !== 'function' || !(typeof acctMe === 'function' && acctMe())) return { err: 'Sign in to have the chapter logged as a play.' };
  const start = l.from && l.from < l.at && l.at - l.from < 12 * 3600e3 ? l.from : l.at;
  const d = new Date(start), pad = (n) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const player = c.player || _mrMe();
  const rec = {
    bggId: Number(c.game), date, t: `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    sc: [{ n: player, w: !!l.won, r: _mrCharName(c) }],
    b: `Chapter ${l.ch}`,
    c: `${c.name ? `${c.name}: ` : ''}campaign, Roguelike · ${_mrResText(c, l)} · +${l.pp || 0} Perk Point${l.pp === 1 ? '' : 's'}`,
  };
  const mins = start === l.from ? Math.round((l.at - l.from) / 60000) : 0;
  if (mins >= 1) rec.d = mins;
  try {
    const r = await logPlaySave(rec);
    await _mrPatch({ [`log/${ts}/play`]: r.id }, id);
    _mrPlaysStale = true;
    return r;
  } catch (e) {
    return { err: `The play wasn't logged: ${e.message || 'try again'}. The "Log the play" button on the attempt's line tries again.` };
  }
}
async function _mrAfter(id, ts) {
  if (_mrLogging.has(id + ts)) return;
  _mrLogging.add(id + ts);
  const r = await _mrLogPlay(id, ts).finally(() => _mrLogging.delete(id + ts));
  if (!r) return;
  if (r.err) { _mrToast(r.err); _mrRedraw(); return; }
  _mrRedraw();
  const c = _mrCamps[id];
  const i = (PLAY_HISTORY[c.game] || []).findIndex(e => e.mp === r.id);
  if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(c.game, i);
}
function _mrRedraw() {
  const p = _mrPanel;
  if (!p || !p.isConnected) return;
  const a = document.activeElement;
  if (a && p.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
  _mrRender(p);
}

// ── what a tap does ──
async function _mrClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.mrTab) { _mrTab = ds.mrTab; _mrRender(panel); return; }
  if (ds.mrCamp) {
    const id = ds.mrCamp;
    if (id === '__new') {
      const open = !_mrId && _mrDraft;
      _mrId = null;
      _mrDraft = open ? null : { char: MR_GAMES[_mrGame].key === 'council' ? 'ratcatcher' : 'rogue', player: _mrMe() || '', name: '' };
    } else if (_mrId === id) _mrId = null;
    else { _mrId = id; _mrDraft = null; _mrTab = 'camp'; _mrRes = null; }
    _mrRender(panel);
    return;
  }
  if (!_mrId) return _mrDraftClick(panel, t, ds);
  // the result as this phone fills it in, saved with "Save the result"
  if (ds.mrResOut || ds.mrResFloors || ds.mrResLevel || ds.mrResPick || ds.mrResEnd !== undefined) {
    const r = _mrRes, c = _mrCamps[_mrId];
    if (!r || !c) return;
    const ch = _mrCh(c, c.at);
    const span = ch ? ch.last - (ch.start || 1) + 1 : 4;
    if (ds.mrResOut) {
      r.out = ds.mrResOut;
      // a won chapter has all its Floors; a death keeps what was counted, less the last
      if (r.out === 'won') r.floors = span;
      else if (r.out === 'boss') r.floors = Math.max(0, span - 1);
      else r.floors = Math.min(r.floors, Math.max(0, span - 1));
    } else if (ds.mrResFloors) r.floors = Math.max(0, Math.min(span, r.floors + Number(ds.mrResFloors)));
    else if (ds.mrResLevel) r.level = Number(ds.mrResLevel);
    else if (ds.mrResPick) r.pick = ds.mrResPick;
    else r.end = !r.end;
    _mrRender(panel);
    return;
  }
  const c = _mrCamps[_mrId];
  if (!c || !_mrCanEdit(c)) return;
  if (ds.mrDelete !== undefined) {
    if (!confirm(`Delete “${c.name || 'this campaign'}”? Its plays stay in the play log; only the campaign goes.`)) return;
    const id = _mrId;
    try { await fbWrite(`mrCampaigns/${id}`, 'DELETE', null, _mrSrc[id]); }
    catch (e) { console.warn('Mini Rogue campaign: not deleted', e); _mrToast('Not deleted. Check the connection and try again.'); return; }
    delete _mrCamps[id];
    _mrId = null;
    _mrRender(panel);
    return;
  }
  if (ds.mrLogplay) {
    if (_mrLogging.has(_mrId + ds.mrLogplay)) return;
    t.disabled = true;
    _mrAfter(_mrId, ds.mrLogplay);
    return;
  }
  const up = {};
  let note = '', ok = false, after = null;
  const road = _mrRoad(c);
  const moveTo = (n) => {
    up.at = String(n);
    up.road = [...road, String(n)];
    const to = _mrCh(c, n);
    if (to && to.kind === 'end') { up.status = 'won'; up.ending = String(n); note = 'An ending: the campaign is won!'; ok = true; }
  };
  if (ds.mrStop !== undefined) {
    if (!confirm('Stop this campaign? Everything stays as it is, under "Stopped and finished", and it can be picked up again any time.')) return;
    Object.assign(up, { status: 'stopped', stopped: Date.now(), playing: null });
    note = 'Stopped. Pick it up again from its tab any time.';
  } else if (ds.mrResume !== undefined) { up.status = null; up.stopped = null; }
  else if (ds.mrPp) up.perks = Math.max(0, (c.perks || 0) + Number(ds.mrPp));
  else if (ds.mrGo) {
    if (c.status === 'won') { up.status = null; up.ending = null; }
    moveTo(ds.mrGo);
  } else if (ds.mrGoto !== undefined) {
    const n = _mrClean(prompt('Which chapter? (to correct where the campaign is)', c.at || '1'));
    if (!n) return;
    if (_mrG(c).chapters && !_mrCh(c, n)) { _mrToast(`The book has no chapter ${n}.`); return; }
    moveTo(n);
  } else if (ds.mrGotoGo !== undefined) {
    const n = _mrClean((panel.querySelector('[data-mr-goto-n]') || {}).value);
    if (!n) { const f = panel.querySelector('[data-mr-goto-n]'); if (f) f.focus(); return; }
    moveTo(n);
  } else if (ds.mrFinish !== undefined) {
    if (!c.status && !confirm('Mark the campaign as won?')) return;
    up.status = 'won';
    up.playing = null;
    note = 'The campaign is won!';
    ok = true;
  } else if (ds.mrUnfinish !== undefined) up.status = null;
  else if (ds.mrBegin !== undefined) {
    const ch = _mrCh(c, c.at);
    up.playing = Date.now();
    _mrRes = null;
    const gained = [];
    if (ch && ch.relic && !(c.relics || {})[ch.relic]) {
      up[`relics/${ch.relic}`] = { name: MR_BASE_RELICS.find(r => r.id === ch.relic).name, at: Date.now() };
      gained.push(`You gain the ${up[`relics/${ch.relic}`].name}.`);
    }
    note = `Chapter ${c.at} on. ${gained.join(' ')}Good luck!`;
    ok = true;
  } else if (ds.mrCancel !== undefined) { up.playing = null; _mrRes = null; }
  else if (ds.mrSave !== undefined) {
    const r = _mrRes, ch = _mrCh(c, c.at);
    if (!r || !r.out) return;
    let next = String(c.at);
    if (ch) {
      if (r.out === 'won') {
        next = _mrLead(c, ch.win) || r.pick;
        if (!next) { _mrToast('Where does the book send you? Pick the chapter.'); return; }
      } else if (r.out === 'boss') next = ch.boss;
    } else {
      const typed = _mrClean((panel.querySelector('[data-mr-res-next]') || {}).value) || r.next;
      if (r.out === 'won' && !typed && !r.end) { _mrToast('Which chapter does the book send you to? Or mark it the last one.'); return; }
      next = typed || next;
    }
    const pp = _mrPP(r.floors, r.level);
    after = String(Date.now());
    const first = ch ? ch.start || 1 : 1;
    up[`log/${after}`] = { ch: String(c.at), won: r.out === 'won', ...(r.out === 'boss' ? { boss: true } : {}), ...(r.out !== 'won' ? { floor: first + r.floors } : {}),
      level: r.level, pp, at: Date.now(), from: c.playing || Date.now(), by: _mrMe() || '' };
    up.perks = (c.perks || 0) + pp;
    up.playing = null;
    _mrRes = null;
    if (!ch && r.out === 'won' && r.end) { up.status = 'won'; note = `The campaign is won! +${pp} Perk Points.`; }
    else {
      if (next !== String(c.at)) moveTo(next);
      note = `+${pp} Perk Point${pp === 1 ? '' : 's'}${pp ? ': spend them on the Skills & Relics tab' : ''}. ${r.out === 'won' ? `Next: chapter ${next}.` : next !== String(c.at) ? `The book sends you to chapter ${next}.` : 'Play the chapter again.'}`;
    }
    ok = r.out === 'won';
  } else if (ds.mrSkAdd !== undefined) {
    const box = t.closest('.mr-skill-add');
    const name = _mrClean(box.querySelector('[data-mr-sk-name]').value);
    const path = box.querySelector('[data-mr-sk-path]').value, rank = Number(box.querySelector('[data-mr-sk-rank]').value);
    const cost = Math.max(0, Math.min(20, parseInt(box.querySelector('[data-mr-sk-cost]').value, 10) || 0));
    const text = String(box.querySelector('[data-mr-sk-text]').value || '').trim().slice(0, 160);
    if (!name) { box.querySelector('[data-mr-sk-name]').focus(); return; }
    const skills = Object.values(c.skills || {});
    const paths = new Set(skills.map(s => s.path));
    if (!paths.has(path) && paths.size >= 2) { _mrToast('You already have two paths: a third is closed.'); return; }
    if (rank === 2 && skills.some(s => s.path === path && s.rank === 2) && !confirm('You already have a rank 2 Skill in this path: only one branch per path. Unlock it anyway?')) return;
    if (cost > (c.perks || 0)) { _mrToast(`Not enough Perk Points: ${c.perks || 0} to spend.`); return; }
    up[`skills/${Date.now()}`] = { name, path, rank, cost, at: Date.now(), ...(text ? { text } : {}) };
    up.perks = (c.perks || 0) - cost;
    note = `${name} unlocked${cost ? ` for ${cost} Perk Point${cost === 1 ? '' : 's'}` : ''}.`;
    ok = true;
  } else if (ds.mrSkillX) {
    const s = (c.skills || {})[ds.mrSkillX] || {};
    if (!confirm(`Take ${s.name || 'this Skill'} off${s.cost ? ` and get its ${s.cost} Perk Point${s.cost === 1 ? '' : 's'} back` : ''}?`)) return;
    up[`skills/${ds.mrSkillX}`] = null;
    if (s.cost) up.perks = (c.perks || 0) + s.cost;
  } else if (ds.mrRelic) {
    const k = ds.mrRelic, r = _mrG(c).relics.find(x => x.id === k);
    up[`relics/${k}`] = (c.relics || {})[k] ? null : { name: r.name, at: Date.now() };
  } else if (ds.mrRelicX) {
    if (!confirm(`Take ${((c.relics || {})[ds.mrRelicX] || {}).name || 'this Relic'} off?`)) return;
    up[`relics/${ds.mrRelicX}`] = null;
  } else if (ds.mrRelicAdd !== undefined) {
    const f = panel.querySelector('[data-mr-relic-name]');
    const name = _mrClean(f && f.value);
    if (!name) { if (f) f.focus(); return; }
    up[`relics/${Date.now()}`] = { name, at: Date.now() };
  }
  if (!Object.keys(up).length) return;
  const id = _mrId;
  const saved = _mrPatch(up);
  _mrRender(panel);
  if (note) _mrToast(note, ok);
  if (after) saved.then(() => _mrAfter(id, after));
}

async function _mrDraftClick(panel, t, ds) {
  const d = _mrDraft;
  if (!d) return;
  if (ds.mrDraftChar) d.char = ds.mrDraftChar;
  else if (ds.mrStart !== undefined) {
    d.player = _mrClean((panel.querySelector('[data-mr-who="player"]') || {}).value) || _mrMe();
    if (!d.player) { _mrToast('Who\'s playing?'); return; }
    t.disabled = true;
    const c = { game: _mrGame, name: d.name.trim(), player: d.player, char: d.char, at: '1', road: ['1'], perks: 0, created: Date.now(), updated: Date.now(), by: _mrMe() };
    try {
      const { store, json } = await fbWrite('mrCampaigns', 'POST', c);
      _mrCamps[json.name] = c;
      _mrSrc[json.name] = store;
      _mrId = json.name;
    } catch (e) {
      console.warn('Mini Rogue campaign: not started', e);
      t.disabled = false;
      t.textContent = 'Couldn\'t start it. Try again';
      return;
    }
    _mrDraft = null;
    _mrTab = 'camp';
  } else return;
  _mrRender(panel);
}

// Typing in the name, a Relic's note or the notes: saved a moment after you stop.
function _mrInput(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-mr-draft-name]') && _mrDraft) { _mrDraft.name = t.value; return; }
  if (t.matches('[data-mr-who="player"]') && _mrDraft) { _mrDraft.player = t.value; return; }
  if (t.matches('[data-mr-res-next]') && _mrRes) { _mrRes.next = _mrClean(t.value); return; }
  const path = t.dataset && t.dataset.mrText;
  if (!path) return;
  const c = _mrCamps[_mrId];
  if (!c || !_mrCanEdit(c)) return;
  clearTimeout(_mrSaveTimers[path]);
  _mrSaveTimers[path] = setTimeout(() => _mrPatch({ [path]: t.value }), 700);
}
