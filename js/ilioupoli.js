const ILIOUPOLI_MEMBERS = new Set(['Στιβ', 'Δημητρης', 'Μαντσος']);
let _ilioSubTab = 'oathsworn'; // 'oathsworn' | 'gauntlet' | 'rove': the group's campaigns (Play → Campaigns opens them; the library they once had is on the Library's tabs)

// ── Oathsworn boss ranking ──
// Each Oathsworn play stores its boss in the play's "board" field as
// "Chapter # - Boss Name". The three players each keep a personal drag-to-
// order ranking of every boss; an Overall ranking aggregates them.
const OATHSWORN_BGGID = 251661;
const OATHSWORN_VOTERS = ['Στιβ', 'Δημητρης', 'Μαντσος'];
let oathswornRanks = {};      // canonical voter name → ordered [bossName, …]
let _oathSubTab = 'campaign'; // inner tab: 'campaign' (the trail) | 'overall' | a voter name

// Derive the master boss list from PLAY_HISTORY, in chapter order. Picking
// it up live means later imported plays add their bosses automatically.
function _oathswornBosses() {
  const plays = (typeof PLAY_HISTORY !== 'undefined' && PLAY_HISTORY[OATHSWORN_BGGID]) || [];
  const seen = new Map(); // boss → earliest chapter number seen
  for (const p of plays) {
    if (!p || typeof p.b !== 'string') continue;
    const idx = p.b.indexOf(' - ');
    if (idx === -1) continue;               // old "Chapter N" rows have no boss
    const boss = p.b.slice(idx + 3).trim();
    if (!boss) continue;
    const chMatch = p.b.match(/([\d.]+)/);
    const ch = chMatch ? parseFloat(chMatch[1]) : 999;
    if (!seen.has(boss) || ch < seen.get(boss)) seen.set(boss, ch);
  }
  return Array.from(seen.entries()).sort((a, b) => a[1] - b[1]).map(e => e[0]);
}

// A voter's full ranking: their stored order, with any boss they haven't
// placed appended at the end and any stale (renamed/removed) boss dropped.
function _oathswornRankFor(voter) {
  const bosses = _oathswornBosses();
  const stored = (oathswornRanks[voter] || []).filter(b => bosses.includes(b));
  const missing = bosses.filter(b => !stored.includes(b));
  return [...stored, ...missing];
}

// Overall ranking: sum of each boss's position across every voter who has
// submitted a list. Because each list is normalised to cover all bosses,
// the sum is comparable and fair — lower total = better. Ties break on the
// best single placement, then name.
function _oathswornOverall() {
  const bosses = _oathswornBosses();
  const activeVoters = OATHSWORN_VOTERS.filter(v =>
    Array.isArray(oathswornRanks[v]) && oathswornRanks[v].length);
  const lists = {};
  activeVoters.forEach(v => { lists[v] = _oathswornRankFor(v); });
  const rows = bosses.map(boss => {
    const placements = activeVoters.map(v => ({ voter: v, pos: lists[v].indexOf(boss) + 1 }));
    const sum = placements.reduce((s, p) => s + p.pos, 0);
    return { boss, sum, placements };
  });
  rows.sort((a, b) => {
    if (!activeVoters.length) return 0;
    if (a.sum !== b.sum) return a.sum - b.sum;
    const aBest = Math.min(...a.placements.map(p => p.pos));
    const bBest = Math.min(...b.placements.map(p => p.pos));
    if (aBest !== bBest) return aBest - bBest;
    return a.boss.localeCompare(b.boss);
  });
  return { rows, activeVoters };
}

async function loadOathswornRanks() {
  oathswornRanks = {};
  if (!FIREBASE_DB) return;
  try {
    const res = await fetch(`${FIREBASE_DB}/oathswornRanks.json`);
    const data = await res.json();
    if (!data) return;
    for (const enc in data) {
      const decoded = decodeURIComponent(enc);
      const list = data[enc];
      if (Array.isArray(list)) {
        oathswornRanks[decoded] = list.filter(x => typeof x === 'string');
      } else if (list && typeof list === 'object') {
        const ordered = Object.keys(list).sort((a, b) => Number(a) - Number(b)).map(k => list[k]);
        oathswornRanks[decoded] = ordered.filter(x => typeof x === 'string');
      }
    }
  } catch (e) {
    console.warn('Failed to load Oathsworn ranks from Firebase:', e);
  }
}

async function persistOathswornRank(voter, list) {
  if (!voter) return;
  const clean = (list || []).filter(x => typeof x === 'string');
  oathswornRanks[voter] = clean;
  if (!FIREBASE_DB) return;
  try {
    await fetch(`${FIREBASE_DB}/oathswornRanks/${_bsVoteEncodeName(voter)}.json`, {
      method: 'PUT',
      body: JSON.stringify(clean),
    });
  } catch (e) {
    console.warn('Failed to save Oathsworn rank to Firebase:', e);
  }
}

// Pointer-based drag for an Oathsworn personal ranking (mouse + touch).
function _wireOathswornDrag(container, voter) {
  let drag = null;
  const items = () => Array.from(container.querySelectorAll('.oath-item'));

  const refreshRanks = () => {
    items().forEach((el, i) => {
      const rk = el.querySelector('.oath-rank');
      if (rk) rk.textContent = String(i + 1);
    });
  };

  const onDown = (ev) => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    // Only the grip handle starts a drag — touching elsewhere on the row
    // leaves the page free to scroll vertically.
    if (!ev.target.closest('.oath-grip')) return;
    const item = ev.currentTarget;
    if (!item) return;
    ev.preventDefault();
    drag = { item, startY: ev.clientY, lastY: ev.clientY, pointerId: ev.pointerId };
    item.classList.add('dragging');
    try { item.setPointerCapture(ev.pointerId); } catch (_) {}
  };

  const onMove = (ev) => {
    if (!drag || ev.pointerId !== drag.pointerId) return;
    ev.preventDefault();
    const dy = ev.clientY - drag.lastY;
    const m = (drag.item.style.transform || '').match(/translateY\(([-\d.]+)px\)/);
    drag.item.style.transform = `translateY(${(m ? Number(m[1]) : 0) + dy}px)`;
    drag.lastY = ev.clientY;
    for (const other of items()) {
      if (other === drag.item) continue;
      const r = other.getBoundingClientRect();
      const mid = (r.top + r.bottom) / 2;
      if (ev.clientY < r.top || ev.clientY > r.bottom) continue;
      const otherFollows = drag.item.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING;
      if (otherFollows) {
        if (ev.clientY > mid) other.after(drag.item); else continue;
      } else {
        if (ev.clientY < mid) other.before(drag.item); else continue;
      }
      drag.item.style.transform = '';
      drag.startY = ev.clientY;
      drag.lastY = ev.clientY;
      refreshRanks();
      break;
    }
  };

  const onUp = (ev) => {
    if (!drag || ev.pointerId !== drag.pointerId) return;
    drag.item.classList.remove('dragging');
    drag.item.style.transform = '';
    try { drag.item.releasePointerCapture(ev.pointerId); } catch (_) {}
    const newOrder = items().map(el => el.dataset.oathBoss);
    drag = null;
    const before = _oathswornRankFor(voter);
    const same = before.length === newOrder.length && before.every((v, i) => v === newOrder[i]);
    if (!same) {
      persistOathswornRank(voter, newOrder);
      showIlioupoliView();
    }
  };

  items().forEach(item => {
    item.addEventListener('pointerdown', onDown);
    item.addEventListener('pointermove', onMove);
    item.addEventListener('pointerup', onUp);
    item.addEventListener('pointercancel', onUp);
  });
}

function showIlioupoliView() {
  const container = document.getElementById('ilioupoli-view');
  if (!container) return;
  if (!['oathsworn', 'gauntlet', 'rove'].includes(_ilioSubTab)) _ilioSubTab = 'oathsworn';

  const subTabsHtml = `
    <button type="button" class="ilio-back" data-ilio-back>&lsaquo; All campaigns</button>
    <div class="bs-subtabs ilio-subtabs">
      <button class="bs-subtab${_ilioSubTab === 'oathsworn' ? ' active' : ''}" data-ilio-sub="oathsworn">⚔️ Oathsworn</button>
      <button class="bs-subtab${_ilioSubTab === 'gauntlet' ? ' active' : ''}" data-ilio-sub="gauntlet">🦸 Marvel Champions</button>
      <button class="bs-subtab${_ilioSubTab === 'rove' ? ' active' : ''}" data-ilio-sub="rove">🧭 Rove</button>
    </div>`;

  const wireSubTabs = () => {
    // the strip scrolls sideways on a phone: keep the open tab in view
    const strip = container.querySelector('.ilio-subtabs');
    const act = strip && strip.querySelector('.active');
    if (act) strip.scrollLeft = act.offsetLeft - (strip.clientWidth - act.offsetWidth) / 2;
    const back = container.querySelector('[data-ilio-back]');
    if (back) back.addEventListener('click', () => _navGo('play', 'campaigns'));
    container.querySelectorAll('[data-ilio-sub]').forEach(el => {
      el.addEventListener('click', () => {
        const s = el.dataset.ilioSub;
        if (s !== _ilioSubTab) { _ilioSubTab = s; showIlioupoliView(); }
      });
    });
  };

  // ── Marvel Champions sub-tab: the Gauntlet (js/mc-gauntlet.js) ──
  if (_ilioSubTab === 'gauntlet') {
    container.innerHTML = `
      <div class="lb-header">
        <div class="lb-title">Ilioupoli Bros</div>
        <div class="lb-count">Marvel Champions Gauntlet</div>
      </div>
      ${subTabsHtml}
      ${buildGauntletHtml()}`;
    wireSubTabs();
    wireGauntlet(container, showIlioupoliView);
    window.scrollTo(0, 0);
    return;
  }

  // ── Rove sub-tab: the campaign sheet (js/rove-campaign.js), as on Rove's game page ──
  if (_ilioSubTab === 'rove') {
    const rove = findGameByBggId(ROVE_BGGID);
    container.innerHTML = `
      <div class="lb-header">
        <div class="lb-title">Ilioupoli Bros</div>
        <div class="lb-count">Rove campaign</div>
      </div>
      ${subTabsHtml}
      <div class="ilio-rove">${buildRoveCampaignHtml(rove || { bggId: ROVE_BGGID })}</div>`;
    wireSubTabs();
    wireRoveCampaign(container);
    window.scrollTo(0, 0);
    return;
  }

  // ── Oathsworn sub-tab — boss ranking ──
  if (_ilioSubTab === 'oathsworn') {
    const bosses = _oathswornBosses();
    const rawPlayer = localStorage.getItem('bgl-player');
    const me = rawPlayer ? (NAME_MAP[rawPlayer] || rawPlayer) : null;

    // Inner tabs: Overall + one per voter.
    const innerTabs = ['campaign', 'overall', ...OATHSWORN_VOTERS];
    if (!innerTabs.includes(_oathSubTab)) _oathSubTab = 'campaign';
    const innerTabsHtml = `
      <div class="bs-subtabs oath-subtabs">
        ${innerTabs.map(t => {
          const label = t === 'campaign' ? '🌲 Campaign' : t === 'overall' ? '🏆 Overall' : t;
          return `<button class="bs-subtab${t === _oathSubTab ? ' active' : ''}" data-oath-sub="${_escapeHtml(t)}">${_escapeHtml(label)}</button>`;
        }).join('')}
      </div>`;

    let body;
    if (_oathSubTab === 'campaign') {
      // the campaign: the trail through the Deepwood, from the logged chapters (progress-boards.js)
      const game = findGameByBggId(OATHSWORN_BGGID) || { bggId: OATHSWORN_BGGID, name: 'Oathsworn' };
      body = (typeof buildMissionMapHtml === 'function' && buildMissionMapHtml(game, PLAY_HISTORY[OATHSWORN_BGGID] || [], { trail: true }))
        || `<div class="bsv-empty">The trail appears once Oathsworn plays are logged with their chapter ("Chapter 12 - …").</div>`;
    } else if (bosses.length === 0) {
      body = `<div class="bsv-empty">No bosses yet. Once Oathsworn plays are imported with a
        "Chapter # - Boss Name" board label, the bosses appear here to rank.</div>`;
    } else if (_oathSubTab === 'overall') {
      const { rows, activeVoters } = _oathswornOverall();
      if (!activeVoters.length) {
        body = `<div class="bsv-empty">Nobody has ranked the bosses yet. Open your own tab and
          drag them into your preferred order.</div>`;
      } else {
        const initials = { 'Στιβ': 'Σ', 'Δημητρης': 'Δ', 'Μαντσος': 'Μ' };
        body = `<div class="oath-list">` + rows.map((r, i) => {
          const breakdown = r.placements
            .map(p => `<span class="oath-chip" title="${_escapeHtml(p.voter)}">${initials[p.voter] || p.voter[0]} #${p.pos}</span>`)
            .join('');
          return `<div class="oath-overrow">
            <div class="oath-rank">${i + 1}</div>
            <div class="oath-name">${_escapeHtml(r.boss)}</div>
            <div class="oath-breakdown">${breakdown}</div>
            <div class="oath-sum" title="Sum of placements">${r.sum}</div>
          </div>`;
        }).join('') + `</div>
        <div class="lb-explain">Overall order is the sum of everyone's placements — a boss
          everyone puts near the top wins. Lower total = higher rank.</div>`;
      }
    } else {
      // A voter's personal list.
      const voter = _oathSubTab;
      const list = _oathswornRankFor(voter);
      const editable = me === voter;
      body = `<div class="oath-list" id="oath-list">` + list.map((boss, i) =>
        `<div class="oath-item${editable ? ' editable' : ''}" data-oath-boss="${_escapeHtml(boss)}">
          <div class="oath-rank">${i + 1}</div>
          <div class="oath-name">${_escapeHtml(boss)}</div>
          ${editable ? '<div class="oath-grip">⠿</div>' : ''}
        </div>`).join('') + `</div>
        <div class="lb-explain">${editable
          ? 'Drag the bosses into your order — top = favourite. Saved automatically.'
          : `This is ${_escapeHtml(voter)}'s order. Only ${_escapeHtml(voter)} can change it.`}</div>`;
    }

    container.innerHTML = `
      <div class="lb-header">
        <div class="lb-title">Ilioupoli Bros</div>
        <div class="lb-count">${_oathSubTab === 'campaign' ? 'Oathsworn campaign' : 'Oathsworn boss ranking'}</div>
      </div>
      ${subTabsHtml}
      ${innerTabsHtml}
      ${body}`;

    wireSubTabs();
    if (_oathSubTab === 'campaign' && typeof wireProgressBoards === 'function') wireProgressBoards(container);
    container.querySelectorAll('[data-oath-sub]').forEach(el => {
      el.addEventListener('click', () => {
        const s = el.dataset.oathSub;
        if (s !== _oathSubTab) { _oathSubTab = s; showIlioupoliView(); }
      });
    });
    // Drag only the logged-in player's own list.
    if (_oathSubTab !== 'overall' && me === _oathSubTab) {
      _wireOathswornDrag(container, _oathSubTab);
    }
    window.scrollTo(0, 0);
    return;
  }
}

// ── Stats Dashboard ──
