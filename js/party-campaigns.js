// ── Campaigns kept per party: Oathsworn and the Marvel Champions Gauntlet ──
// Anyone can start one for their group (the user, 2 Nov 2026: "no Ilioupoli
// Bros anymore, available for everyone"): the players (typed, with everyone
// the app knows offered), a name if they like and the day it starts. The
// plays of that party from that day on are its progress. Like the Codenames
// campaigns they show as tabs (yours first), each opens only when tapped, and
// the people in it can stop it, pick it up again or delete it.
//   oathCampaigns/{id}   = { name, players: [..], start: 'YYYY-MM-DD', by, created, updated, status?: 'stopped', stopped? }
//   mcGauntlet/runs/{id} = the same; its draws and spins in mcGauntlet/runEvents/{id} (js/mc-gauntlet.js)
// The Ilioupoli Bros' two from before are built in (`builtin`): a change to
// one is saved under its id, and deleting it leaves { deleted: true }.

const PC_KINDS = {
  oath: {
    node: 'oathCampaigns', bggId: 251661, sub: 'oathsworn', name: 'Oathsworn', color: '#7fae5a',
    what: 'The trail through the Deepwood, chapter by chapter, and everyone&rsquo;s boss ranking.',
    count: 'The plays of these players from that day on count, any of them, with nobody else at the table.',
    builtin: { ilioupoli: { name: 'Ilioupoli Bros', players: ['Στιβ', 'Δημητρης', 'Μαντσος'], start: '2025-11-11', by: 'Στιβ' } },
  },
  gauntlet: {
    node: 'mcGauntlet/runs', bggId: 285774, sub: 'gauntlet', name: 'Marvel Champions Gauntlet', color: '#d9534f', exact: true,
    what: 'Every villain in release order, on Expert. Before each box everyone draws three heroes and spins for an aspect; a hero once played is spent.',
    count: 'The plays of exactly these players from that day on count.',
    builtin: { ilioupoli: { name: 'Ilioupoli Bros', players: ['Δημητρης', 'Στιβ'], start: '2025-12-27', rulesFrom: 'toafk', strikesFrom: '2026-10-02', events: 'mcGauntlet/events', by: 'Στιβ' } },
  },
};
const PC_MAX = 4;   // players in a party

let _pc = {};          // kind → { id: campaign } once loaded
let _pcAt = {};
let _pcSrc = {};       // `${kind}/${id}` → the store it lives in ('main' | 'spare', see fbWrite)
let _pcOpen = {};      // kind → the campaign open (null: none)
let _pcDraft = null;   // the start form: { kind, name, players: [], start }
let _pcTimers = {};

const _pcCanon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
const _pcShow = (n) => (typeof _acctDisplay === 'function' ? _acctDisplay(n) : n);
const _pcToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function _pcDate(v) {
  if (!v) return '';
  const d = typeof v === 'number' ? new Date(v) : new Date(String(v).slice(0, 10) + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function pcPlayers(c) {
  return (Array.isArray(c && c.players) ? c.players : Object.values((c && c.players) || {}))
    .filter(x => typeof x === 'string' && x).map(_pcShow);
}
function _pcMe() { return typeof _navPlayer === 'function' ? _navPlayer() : null; }
// One of its players: their own progress shows (the user: progress "only for those that play the game").
function pcIsMine(c) {
  const me = _pcMe();
  return !!me && pcPlayers(c).some(p => _pcCanon(p) === _pcCanon(me));
}
function pcCanEdit(c) {
  const me = _pcMe();
  if (!me) return false;
  return !pcPlayers(c).length || pcIsMine(c) || (!!c.by && _pcCanon(_pcShow(c.by)) === _pcCanon(me));
}

async function pcLoad(kind, force) {
  if (_pc[kind] && !force && Date.now() - (_pcAt[kind] || 0) < 15000) return _pc[kind];
  const K = PC_KINDS[kind];
  const { main, spare } = await fbReadBoth(K.node);
  const out = {};
  for (const id in K.builtin) out[id] = { ...K.builtin[id], builtin: true };
  for (const [store, data] of [['spare', spare], ['main', main]]) {
    for (const id in (data || {})) {
      if (!data[id] || typeof data[id] !== 'object') continue;
      out[id] = { ...(out[id] || {}), ...data[id] };
      _pcSrc[`${kind}/${id}`] = store;
    }
  }
  for (const id in out) if (out[id].deleted) delete out[id];
  _pc[kind] = out;
  _pcAt[kind] = Date.now();
  if (_pcOpen[kind] && !out[_pcOpen[kind]]) _pcOpen[kind] = null;
  return out;
}

// The party's plays: from its first day, with nobody outside it at the table
// (the Gauntlet: exactly the party).
function pcPlays(kind, c) {
  const K = PC_KINDS[kind];
  const party = new Set(pcPlayers(c).map(_pcCanon));
  if (!party.size) return [];
  const from = (c && c.start) || '';
  return (PLAY_HISTORY[K.bggId] || []).filter(p => p && p.date >= from && Array.isArray(p.sc) && p.sc.length
    && p.sc.every(s => s && party.has(_pcCanon(s.n)))
    && (!K.exact || new Set(p.sc.map(s => _pcCanon(s.n))).size === party.size));
}

// Where a campaign stands, for its tab and Play → Campaigns: { pct, text, done }
function pcSummary(kind, id, c) {
  if (kind === 'oath') {
    const plays = pcPlays('oath', c);
    const cp = typeof campaignProgress === 'function' ? campaignProgress(PC_KINDS.oath.bggId, plays) : null;
    if (!cp) return { pct: 0, text: plays.length ? `${plays.length} play${plays.length === 1 ? '' : 's'}, no chapter logged` : 'No chapter played yet', done: false };
    return { pct: cp.pct, text: cp.reachedText || cp.stageText, done: cp.current >= cp.total };
  }
  return typeof gauntletSummary === 'function' ? gauntletSummary(id, c) : null;
}
function _pcState(kind, id, c) {
  if (c.status === 'stopped') return `stopped ${_pcDate(c.stopped)}`;
  const s = pcSummary(kind, id, c);
  return s ? s.text : '';
}

// ── writing ──
async function pcPatch(kind, id, up) {
  const c = _pc[kind] && _pc[kind][id];
  if (!c) return;
  for (const k in up) { if (up[k] === null) delete c[k]; else c[k] = up[k]; }
  c.updated = Date.now();
  try {
    await fbWrite(`${PC_KINDS[kind].node}/${id}`, 'PATCH', { ...up, updated: c.updated }, _pcSrc[`${kind}/${id}`]);
  } catch (e) {
    console.warn('Campaign: not saved', e);
    alert('Not saved. Check the connection and try again.');
  }
}
async function pcCreate(kind, c) {
  const { store, json } = await fbWrite(PC_KINDS[kind].node, 'POST', c);
  (_pc[kind] = _pc[kind] || {})[json.name] = c;
  _pcSrc[`${kind}/${json.name}`] = store;
  return json.name;
}
async function pcDelete(kind, id) {
  const c = _pc[kind][id];
  const node = `${PC_KINDS[kind].node}/${id}`;
  if (c.builtin) await fbWrite(node, 'PATCH', { deleted: true, updated: Date.now() }, _pcSrc[`${kind}/${id}`]);
  else await fbWrite(node, 'DELETE', null, _pcSrc[`${kind}/${id}`]);
  delete _pc[kind][id];
  if (_pcOpen[kind] === id) _pcOpen[kind] = null;
}

// ── drawing ──
// The campaigns as tabs: yours first, the stopped ones apart.
function pcTabsHtml(kind) {
  const esc = _escapeHtml;
  const K = PC_KINDS[kind];
  const camps = _pc[kind] || {};
  const when = (c) => c.updated || c.created || 0;
  const ids = Object.keys(camps).sort((a, b) => (pcIsMine(camps[b]) - pcIsMine(camps[a])) || (when(camps[b]) - when(camps[a])));
  const open = _pcOpen[kind];
  const tab = (id) => {
    const c = camps[id];
    const who = pcPlayers(c).join(', ');
    return `<button type="button" class="cr-camp${id === open ? ' on' : ''}${c.status ? ' ended' : ''}" data-pc-camp="${esc(id)}" style="--cr-c:${K.color}" aria-expanded="${id === open}">
      <b>${esc(c.name || who || 'A party')}</b>
      <span>${esc(_pcState(kind, id, c))}</span>
      <span class="cr-camp-who">${esc(who)}${c.start ? ` · since ${esc(_pcDate(c.start))}` : ''}</span></button>`;
  };
  const active = ids.filter(id => !camps[id].status), ended = ids.filter(id => camps[id].status);
  const isNew = !open && !!_pcDraft && _pcDraft.kind === kind;
  return `<div class="cr-camps">${active.map(tab).join('')}
      <button type="button" class="cr-camp cr-camp-new${isNew ? ' on' : ''}" data-pc-camp="__new" aria-expanded="${isNew}"><b>+ A new campaign</b><span>For your group</span></button></div>
    ${ended.length ? `<div class="rv-sub">Stopped</div><div class="cr-camps">${ended.map(tab).join('')}</div>` : ''}
    ${!open && !isNew && ids.length ? '<div class="rv-hint cr-camps-hint">Tap a campaign to open it.</div>' : ''}`;
}

// The players, as names with an × and a field to add one (typed, with everyone offered).
function _pcPeopleHtml(names, xAttr, who, edit) {
  const esc = _escapeHtml;
  return `<div class="cr-people">${names.map(p => `<span class="cr-person">${esc(p)}${edit ? `<button type="button" class="cr-person-x" ${xAttr}="${esc(p)}" aria-label="Take ${esc(p)} off">&times;</button>` : ''}</span>`).join('')}
    ${edit && names.length < PC_MAX ? `<input class="rv-in cr-who" data-pc-who="${who}" placeholder="Add a player" maxlength="40" enterkeyhint="done">` : names.length ? '' : '<span class="cr-note">nobody yet</span>'}</div>`;
}

function pcStartHtml(kind) {
  const esc = _escapeHtml;
  const K = PC_KINDS[kind];
  const d = _pcDraft;
  const n = pcPlays(kind, d).length;
  return `<div class="rv-start cr-start pc-start">
    <div class="rv-start-title">Start a campaign</div>
    <div class="rv-start-sub">${K.what} ${K.count}</div>
    <div class="rv-sub">Players <span class="cr-count">${d.players.length} of ${PC_MAX}</span></div>
    ${_pcPeopleHtml(d.players, 'data-pc-draft-x', 'draft', true)}
    <div class="rv-fields pc-fields">
      <label class="rv-field"><span>Name</span><input class="rv-in" data-pc-draft-name value="${esc(d.name)}" placeholder="Optional: the party&rsquo;s name" maxlength="40"></label>
      <label class="rv-field"><span>From</span><input type="date" class="rv-in" data-pc-draft-start value="${esc(d.start)}" max="${_pcToday()}"></label>
    </div>
    <div class="rv-hint">${d.players.length ? `${n} play${n === 1 ? '' : 's'} logged already count${n === 1 ? 's' : ''}. Pick an earlier day to count earlier ones.` : 'Add the players first.'}</div>
    ${_pcMe() ? `<button type="button" class="rv-btn" data-pc-start${d.players.length ? '' : ' disabled'}>Start the campaign</button>` : '<div class="rv-start-sub">Pick who you are to start one.</div>'}
  </div>`;
}

// The open campaign's head: its name, who's in it and since when (editable by them).
function pcHeadHtml(kind, id, c) {
  const esc = _escapeHtml;
  const edit = pcCanEdit(c);
  const players = pcPlayers(c);
  return `<div class="pc-head">
    <div class="rv-head"><input class="rv-party" data-pc-text="name" value="${esc(c.name || '')}" placeholder="${esc(players.join(', ') || 'Party name')}" ${edit ? '' : 'readonly'} aria-label="Party name"></div>
    ${edit ? `<div class="pc-party">${_pcPeopleHtml(players, 'data-pc-x', 'camp', true)}
        <label class="pc-from">From <input type="date" class="rv-in" data-pc-from value="${esc(c.start || '')}" max="${_pcToday()}"></label></div>`
      : `<div class="cr-sub">${esc(players.join(', '))}${c.start ? ` · since ${esc(_pcDate(c.start))}` : ''}</div>
         <div class="rv-ro">${_pcMe() ? 'Only its players can change this campaign.' : 'Pick who you are to change it.'}</div>`}
    ${c.status === 'stopped' ? `<div class="cr-end stopped">Stopped on ${esc(_pcDate(c.stopped))}: it&rsquo;s all kept as it was.${edit ? '<button type="button" class="rv-btn rv-btn-sm" data-pc-resume>Pick it up again</button>' : ''}</div>` : ''}
  </div>`;
}
function pcFootHtml(kind, id, c) {
  if (!pcCanEdit(c)) return '';
  return `<div class="pc-foot">
    ${c.status ? '' : '<button type="button" class="rv-link" data-pc-stop>Stop this campaign</button>'}
    <button type="button" class="rv-link pc-del" data-pc-delete>Delete this campaign</button>
  </div>`;
}

// Everyone who could be at the table: you first, then everyone the app knows.
function _pcNames(not) {
  const me = _pcMe();
  const all = [...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].sort((a, b) => a.localeCompare(b));
  return [...new Set([me, ...all].filter(Boolean))].filter(n => !not.some(x => _pcCanon(x) === _pcCanon(n)));
}
function _pcClean(v) {
  v = String(v || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return _pcNames([]).find(n => n.toLowerCase() === v.toLowerCase()) || v;
}

// The tabs, the start form and the head and foot of the open one: taps and typing.
// rerender() draws the page again.
function pcWire(root, kind, rerender) {
  const add = (where, v) => {
    v = _pcClean(v);
    if (!v) return;
    if (where === 'draft') {
      if (_pcDraft.players.length < PC_MAX && !_pcDraft.players.some(p => _pcCanon(p) === _pcCanon(v))) _pcDraft.players.push(v);
      rerender();
      return;
    }
    const id = _pcOpen[kind], c = _pc[kind][id];
    const players = pcPlayers(c);
    if (!c || players.length >= PC_MAX || players.some(p => _pcCanon(p) === _pcCanon(v))) { rerender(); return; }
    pcPatch(kind, id, { players: [...players, v] }).then(rerender);
  };
  if (typeof comboAttach === 'function') root.querySelectorAll('input[data-pc-who]').forEach(inp => {
    const where = inp.dataset.pcWho;
    const taken = () => (where === 'draft' ? _pcDraft.players : pcPlayers(_pc[kind][_pcOpen[kind]]));
    comboAttach(inp, { options: () => _pcNames(taken()), onPick: (v) => add(where, v), max: 80 });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(where, inp.value); } });
  });
  root.addEventListener('click', async (ev) => {
    const t = ev.target.closest('[data-pc-camp],[data-pc-draft-x],[data-pc-start],[data-pc-x],[data-pc-stop],[data-pc-resume],[data-pc-delete]');
    if (!t || !root.contains(t) || t.disabled) return;
    const ds = t.dataset;
    if (ds.pcCamp) {
      if (ds.pcCamp === '__new') {
        const open = !_pcOpen[kind] && _pcDraft && _pcDraft.kind === kind;
        _pcDraft = open ? null : { kind, name: '', players: _pcMe() ? [_pcMe()] : [], start: _pcToday() };
        _pcOpen[kind] = null;
      } else {
        _pcOpen[kind] = _pcOpen[kind] === ds.pcCamp ? null : ds.pcCamp;
        _pcDraft = null;
      }
      rerender();
      return;
    }
    if (ds.pcDraftX) { _pcDraft.players = _pcDraft.players.filter(p => p !== ds.pcDraftX); rerender(); return; }
    if (ds.pcStart !== undefined) {
      const d = _pcDraft;
      if (!d || !d.players.length) return;
      t.disabled = true;
      try {
        const now = Date.now();
        const id = await pcCreate(kind, { name: d.name.trim(), players: d.players, start: d.start || _pcToday(), by: _pcMe(), created: now, updated: now });
        _pcDraft = null;
        _pcOpen[kind] = id;
      } catch (e) {
        console.warn('Campaign: not started', e);
        t.disabled = false;
        t.textContent = 'Couldn\'t start it. Try again';
        return;
      }
      rerender();
      return;
    }
    const id = _pcOpen[kind], c = id && _pc[kind][id];
    if (!c || !pcCanEdit(c)) return;
    if (ds.pcX) {
      const left = pcPlayers(c).filter(p => p !== ds.pcX);
      if (!left.length) return;
      await pcPatch(kind, id, { players: left });
    } else if (ds.pcStop !== undefined) {
      await pcPatch(kind, id, { status: 'stopped', stopped: Date.now() });
    } else if (ds.pcResume !== undefined) {
      await pcPatch(kind, id, { status: null, stopped: null });
    } else if (ds.pcDelete !== undefined) {
      if (!confirm(`Delete “${c.name || pcPlayers(c).join(', ')}”? Its plays stay in the play log; only the campaign goes.`)) return;
      try { await pcDelete(kind, id); }
      catch (e) { console.warn('Campaign: not deleted', e); alert('Not deleted. Check the connection and try again.'); return; }
    }
    rerender();
  });
  root.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.matches('[data-pc-draft-name]')) { _pcDraft.name = t.value; return; }
    if (t.matches('[data-pc-text]')) {
      const id = _pcOpen[kind], c = id && _pc[kind][id];
      if (!c || !pcCanEdit(c)) return;
      clearTimeout(_pcTimers.name);
      _pcTimers.name = setTimeout(() => pcPatch(kind, id, { name: t.value.trim() }), 700);
    }
  });
  root.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.matches('[data-pc-draft-start]')) { _pcDraft.start = t.value || _pcToday(); rerender(); return; }
    if (t.matches('[data-pc-from]')) {
      const id = _pcOpen[kind], c = id && _pc[kind][id];
      if (!c || !pcCanEdit(c) || !t.value) return;
      pcPatch(kind, id, { start: t.value }).then(rerender);
    }
  });
}
