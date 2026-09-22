window.__bsOpenGame = function(bggId) {
  const g = (typeof findGameByBggId === 'function') ? findGameByBggId(Number(bggId)) : null;
  if (g && typeof openModal === 'function') { try { openModal(g); } catch (_) {} }
};

// Expand/collapse the "rest" of the Board South plays list.
window.__bsTogglePlays = function(btn) {
  const wrap = document.getElementById('bs-plays-list');
  if (!wrap) return;
  const expanded = wrap.classList.toggle('expanded');
  btn.textContent = expanded
    ? 'Show fewer plays'
    : ('Show all ' + (btn.dataset.total || '') + ' plays');
};

function _boardSouthPlaysSectionHtml() {
  const currentYear = new Date().getFullYear();
  const yearStart = _yearStartCutoff();
  const INITIAL = 6;

  let perPlay;
  try { perPlay = _computePerPlayElo('south'); } catch (_) { perPlay = new Map(); }

  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  // Collect this year's Board South plays, keeping the PLAY_HISTORY array index
  // so the per-play delta key (`${bggId}|${date}|${idx}`) lines up.
  const plays = [];
  for (const bggId in PLAY_HISTORY) {
    PLAY_HISTORY[bggId].forEach((p, idx) => {
      if (!p || !p.date || !Array.isArray(p.sc)) return;
      if (p.date < yearStart) return;
      if (!_isBoardSouthPlay(p)) return;
      plays.push({ bggId: Number(bggId), idx, p });
    });
  }
  // Newest first. When two plays share the same timestamp they were logged
  // together in one upload (BGStats stamps a whole batch identically), so the
  // timestamp can't tell them apart. Break that tie in natural insertion order
  // (ascending) rather than reversed — this matches the profile "latest plays"
  // list and keeps a day's later-played games sitting above the earlier ones.
  plays.sort((a, b) => {
    const at = a.p.t || a.p.date, bt = b.p.t || b.p.date;
    if (at !== bt) return bt.localeCompare(at);
    if (a.bggId !== b.bggId) return a.bggId - b.bggId;
    return a.idx - b.idx;
  });

  const formula = _boardSouthFormulaHtml(currentYear);

  if (plays.length === 0) {
    return `<div class="bs-plays-section">
      ${formula}
      <div class="bs-plays-head">🎲 Board South Plays · ${currentYear}</div>
      <div class="lb-empty">No Board South plays recorded yet this year.</div>
    </div>`;
  }

  const rowsHtml = plays.map((entry, i) => {
    const { bggId, idx, p } = entry;
    const game = findGameByBggId(bggId);
    const name = game ? game.name : ('Game #' + bggId);
    const deltas = perPlay.get(`${bggId}|${p.date}|${idx}`) || null;

    // Order the scoreboard by computed rank (so lower-score-wins games still
    // list the winner first); fall back to win-flag then original order.
    const ranks = _leaderboardRanksForPlay(p.sc, bggId) || [];
    const rankByName = {};
    for (const r of ranks) {
      const m = NAME_MAP[r.player] || r.player;
      if (rankByName[m] == null || r.rank < rankByName[m]) rankByName[m] = r.rank;
    }
    const indexed = p.sc.map((s, k) => ({ s, k, rank: rankByName[NAME_MAP[s.n] || s.n] }));
    indexed.sort((a, b) => {
      if (a.rank != null && b.rank != null && a.rank !== b.rank) return a.rank - b.rank;
      const aw = !!a.s.w, bw = !!b.s.w;
      if (aw !== bw) return aw ? -1 : 1;
      return a.k - b.k;
    });

    const sb = indexed.map(({ s }) => {
      const canon = NAME_MAP[s.n] || s.n;
      const cls = ['bs-sb-name'];
      if (s.w) cls.push('winner');
      const role = s.r ? ` <span class="bs-sb-role">(${esc(s.r)})</span>` : '';
      const score = (s.s != null && s.s !== '') ? esc(s.s) : '—';
      let dHtml = '<span class="bs-sb-delta"></span>';
      if (deltas && Object.prototype.hasOwnProperty.call(deltas, canon)) {
        const d = deltas[canon];
        const c = d > 0 ? 'pos' : (d < 0 ? 'neg' : '');
        const sign = d > 0 ? '+' : '';
        dHtml = `<span class="bs-sb-delta ${c}">${sign}${d.toFixed(1)}</span>`;
      }
      return `<div class="bs-sb-row">
        <span class="${cls.join(' ')}">${esc(canon)}${role}</span>
        <span class="bs-sb-score">${score}</span>
        ${dHtml}
      </div>`;
    }).join('');

    const metaBits = [_fmtDateShort(p.date)];
    if (p.b) metaBits.push(esc(p.b));
    if (p.l && p.l !== 'Board South') metaBits.push(esc(p.l));
    metaBits.push(`${p.sc.length} player${p.sc.length !== 1 ? 's' : ''}`);

    const localCover = bggId >= 0 ? `images/${bggId}.jpg` : '';
    const fallback = ((game && game.urlImage) || '').replace(/'/g, "\\'");
    const cover = (localCover || fallback)
      ? `<img class="bs-play-cover" src="${localCover || fallback}" alt="" loading="lazy" onerror="window.__lpmImgFallback(this, '${fallback}')">`
      : '<div class="bs-play-cover"></div>';

    const extraCls = i >= INITIAL ? ' extra' : '';
    return `<div class="bs-play-row${extraCls}" onclick="window.__bsOpenGame(${bggId})">
      <div class="bs-play-top">
        ${cover}
        <div class="bs-play-info">
          <div class="bs-play-name">${esc(name)}</div>
          <div class="bs-play-meta">${metaBits.join(' · ')}</div>
        </div>
      </div>
      <div class="bs-scoreboard">${sb}</div>
    </div>`;
  }).join('');

  const moreBtn = plays.length > INITIAL
    ? `<button class="bs-plays-more" data-total="${plays.length}" onclick="window.__bsTogglePlays(this)">Show all ${plays.length} plays</button>`
    : '';

  return `<div class="bs-plays-section">
    ${formula}
    <div class="bs-plays-head">🎲 Board South Plays · ${currentYear}</div>
    <div class="bs-plays-list" id="bs-plays-list">${rowsHtml}</div>
    ${moreBtn}
  </div>`;
}

function showBoardSouthView() {
  const container = document.getElementById('boardsouth-view');
  if (_bsSubTab === 'vote') {
    _renderBoardSouthVoteView(container);
    return;
  }
  // Render BS leaderboard wrapped in the BS sub-tab nav so the user can flip
  // between Leaderboard and Vote inside the Board South tab.
  const subTabsHtml = `
    <div class="bs-subtabs">
      <button class="bs-subtab active" data-bs-sub="leaderboard">🏆 Leaderboard</button>
      <button class="bs-subtab" data-bs-sub="vote">🗳️ Vote</button>
    </div>`;
  // Render leaderboard content into a temporary host, then prepend sub-tabs.
  const host = document.createElement('div');
  _renderEloLeaderboardInto(host, 'south');
  container.innerHTML = subTabsHtml + host.innerHTML;
  // Re-wire the visit-player handlers since we copied innerHTML.
  container.querySelectorAll('[data-visit-player]').forEach(el => {
    el.addEventListener('click', () => {
      showStatsView(el.dataset.visitPlayer, 'visiting');
      window.scrollTo(0, 0);
    });
  });
  container.querySelectorAll('[data-bs-sub]').forEach(el => {
    el.addEventListener('click', () => {
      const s = el.dataset.bsSub;
      if (s !== _bsSubTab) {
        _bsSubTab = s;
        showBoardSouthView();
      }
    });
  });
  window.scrollTo(0, 0);
}

// ── Board South: "What to play next?" voting view ──
let _bsvSearchQuery = ''; // current aggregate-list filter
let _bsvSearchModalOpen = false;

const _BSV_PLACEHOLDER = 'images/game-placeholder.svg';

function _bsvCoverHtml(game, size) {
  // size is the CSS size class suffix (my / agg / modal)
  const cls = `bsv-${size}thumb`;
  const local = (game && game.bggId >= 0) ? `images/${game.bggId}.jpg` : '';
  const fallback = (game && game.urlImage || '').replace(/'/g, "\\'");
  // Resolution chain: local → urlImage → generic placeholder. Always render
  // an <img> so the visual is consistent (no empty divs in the list).
  const initialSrc = local || fallback || _BSV_PLACEHOLDER;
  return `<div class="${cls}"><img src="${initialSrc}" alt="" loading="lazy"
    onerror="window.__bsvImgFallback(this, '${fallback}')"></div>`;
}

window.__bsvImgFallback = function(img, fallback) {
  if (!img.dataset.bsvFb && fallback) {
    img.dataset.bsvFb = '1';
    img.src = fallback;
    return;
  }
  // Final fallback: a generic dice placeholder so the row never goes blank.
  if (img.src.indexOf('game-placeholder.svg') === -1) {
    img.src = 'images/game-placeholder.svg';
    return;
  }
  // If even the placeholder failed for some reason, hide the image cleanly.
  img.style.display = 'none';
};

function _renderBoardSouthVoteView(container) {
  const currentYear = new Date().getFullYear();
  const voter = _activeBoardSouthVoter();
  const lib = _bsvLibrary;
  const myList = voter ? (_bsvGetVotes(lib)[voter] || []) : [];

  const libTabsHtml = `
    <div class="bsv-lib-tabs">
      ${BSV_LIBRARIES.map(L => `
        <button class="bsv-lib-tab${L === lib ? ' active' : ''}" data-bsv-lib="${L}">
          ${BSV_LIB_LABEL[L]}
        </button>`).join('')}
    </div>`;

  const tabsHtml = `
    <div class="bs-subtabs">
      <button class="bs-subtab" data-bs-sub="leaderboard">🏆 Leaderboard</button>
      <button class="bs-subtab active" data-bs-sub="vote">🗳️ Vote</button>
    </div>
    ${libTabsHtml}`;

  // Permission notice for non-voters
  const permissionHtml = voter ? '' : `
    <div class="bsv-permission">
      Only Board South regulars can vote. ${localStorage.getItem('bgl-player')
        ? `Logged in as <b>${localStorage.getItem('bgl-player')}</b> — view-only access.`
        : 'Pick your name from the player list to participate.'}
    </div>`;

  // ── My priority list ──
  let myListHtml = '';
  if (voter) {
    // Add-game button sits at the top so it's always reachable without
    // scrolling past the existing list.
    myListHtml = `<button class="bsv-add-btn" id="bsv-open-search">+ Vote a game from the library</button>`;
    if (myList.length === 0) {
      myListHtml += `<div class="bsv-empty">You haven't voted yet. Tap above to add games you want to play next.</div>`;
    } else {
      myListHtml += '<div class="bsv-mylist">' + myList.map((bggId, idx) => {
        const game = _bsvFindGame(lib, bggId);
        const name = game ? game.name : `Game #${bggId}`;
        const cover = _bsvCoverHtml(game, 'my');
        const upDisabled = idx === 0 ? 'disabled' : '';
        const downDisabled = idx === myList.length - 1 ? 'disabled' : '';
        return `<div class="bsv-myitem" draggable="true" data-bsv-idx="${idx}" data-bgg-id="${bggId}">
          <div class="bsv-myrank" title="Drag to reorder">
            <span class="bsv-myrank-num">${idx + 1}</span>
            <span class="bsv-mygrip">⠿</span>
          </div>
          ${cover}
          <div class="bsv-myname">${_escapeHtml(name)}</div>
          <div class="bsv-myactions">
            <button class="bsv-mybtn" data-bsv-act="up" ${upDisabled} title="Move up">▲</button>
            <button class="bsv-mybtn" data-bsv-act="down" ${downDisabled} title="Move down">▼</button>
            <button class="bsv-mybtn danger" data-bsv-act="remove" title="Remove">✕</button>
          </div>
        </div>`;
      }).join('') + '</div>';
    }
  }

  // ── Aggregate ranking ──
  const ranking = _computeBoardSouthVoteRanking(lib);
  const q = (_bsvSearchQuery || '').trim().toLowerCase();
  const filtered = q
    ? ranking.filter(r => {
        const g = _bsvFindGame(lib, r.bggId);
        return g && g.name && g.name.toLowerCase().includes(q);
      })
    : ranking;

  // The owner of the currently-selected library may prune entries from the
  // group ranking (e.g. games they no longer own / are unavailable). This
  // strips the bggId from every voter's list for the active library.
  const isLibOwner = voter && voter === BSV_LIB_OWNER[lib];

  let aggHtml;
  if (ranking.length === 0) {
    aggHtml = `<div class="bsv-empty">No votes yet. Be the first to suggest what to play next!</div>`;
  } else if (filtered.length === 0) {
    aggHtml = `<div class="bsv-empty">No voted games match "${_escapeHtml(q)}".</div>`;
  } else {
    const maxVotes = ranking[0].votes;
    aggHtml = '<div class="bsv-agg-list">' + filtered.map((r, i) => {
      const game = _bsvFindGame(lib, r.bggId);
      const name = game ? game.name : `Game #${r.bggId}`;
      const cover = _bsvCoverHtml(game, 'agg');
      const isHot = r.votes === maxVotes;
      const voterStr = r.voters
        .sort((a, b) => a.position - b.position)
        .map(v => {
          const isYou = voter && v.name === voter;
          const cls = isYou ? 'you' : '';
          return `<span class="${cls}">${_escapeHtml(v.name)}#${v.position}</span>`;
        })
        .join(', ');
      const removeBtnHtml = isLibOwner
        ? `<button class="bsv-aggremove" data-bsv-remove="${r.bggId}" title="Remove from group ranking — you no longer have this game" aria-label="Remove game">✕</button>`
        : '';
      return `<div class="bsv-aggrow${isLibOwner ? ' has-remove' : ''}" data-bgg-id="${r.bggId}">
        <div class="bsv-aggrank">#${i + 1}</div>
        ${cover}
        <div>
          <div class="bsv-aggname">${_escapeHtml(name)}</div>
          <div class="bsv-aggvoters">${voterStr}</div>
        </div>
        <div class="bsv-aggvotes ${isHot ? 'hot' : ''}">${r.votes}</div>
        ${removeBtnHtml}
      </div>`;
    }).join('') + '</div>';
  }

  container.innerHTML = `
    <div class="lb-header">
      <div class="lb-title">What to Play Next?</div>
      <div class="lb-count">${ranking.length} game${ranking.length !== 1 ? 's' : ''} voted</div>
    </div>
    ${tabsHtml}
    ${permissionHtml}
    ${voter ? `
      <div class="bsv-section-title">Your Priority List ${myList.length ? `· ${myList.length}` : ''}</div>
      ${myListHtml}
    ` : ''}
    <div class="bsv-section-title">Group Ranking ${currentYear}</div>
    <input type="text" class="bsv-search-bar" id="bsv-search-agg"
           placeholder="Search voted games…" value="${_escapeHtml(_bsvSearchQuery)}">
    ${aggHtml}
    <div class="lb-explain">
      <b>How voting works:</b> Each Board South regular adds the games they want to play next, ordered by personal priority (top = most wanted). Games are ranked first by total vote count, then by combined priority — a game placed #1 by everyone outranks a game placed #5 by everyone, even with the same vote count. Reorder your list with ▲/▼ or drag to break ties in your favour. Votes are saved live and shared across devices.
    </div>`;

  // Wire BS sub-tabs
  container.querySelectorAll('[data-bs-sub]').forEach(el => {
    el.addEventListener('click', () => {
      const s = el.dataset.bsSub;
      if (s !== _bsSubTab) {
        _bsSubTab = s;
        showBoardSouthView();
      }
    });
  });

  // Wire library tabs (Στιβ ↔ Γιαννης)
  container.querySelectorAll('[data-bsv-lib]').forEach(el => {
    el.addEventListener('click', () => {
      const L = el.dataset.bsvLib;
      if (L && L !== _bsvLibrary && BSV_LIBRARIES.includes(L)) {
        _bsvLibrary = L;
        _bsvSearchQuery = '';
        showBoardSouthView();
      }
    });
  });

  // Voting actions on my list
  if (voter) {
    container.querySelectorAll('.bsv-myitem').forEach(item => {
      const idx = Number(item.dataset.bsvIdx);
      item.querySelectorAll('[data-bsv-act]').forEach(btn => {
        btn.addEventListener('click', async (ev) => {
          ev.stopPropagation();
          const act = btn.dataset.bsvAct;
          const list = (_bsvGetVotes(lib)[voter] || []).slice();
          if (act === 'remove') {
            list.splice(idx, 1);
          } else if (act === 'up' && idx > 0) {
            const tmp = list[idx];
            list[idx] = list[idx - 1];
            list[idx - 1] = tmp;
          } else if (act === 'down' && idx < list.length - 1) {
            const tmp = list[idx];
            list[idx] = list[idx + 1];
            list[idx + 1] = tmp;
          } else {
            return;
          }
          _bsvGetVotes(lib)[voter] = list;
          showBoardSouthView();
          persistBoardSouthVote(voter, list, lib);
        });
      });
    });

    // Unified pointer-based drag-and-drop reordering (works for mouse + touch).
    // Live-swaps DOM rows during the drag so the user sees the new ordering
    // immediately; persists once on pointerup so we don't churn Firebase.
    _wireBoardSouthDrag(container, voter, lib);

    const openBtn = container.querySelector('#bsv-open-search');
    if (openBtn) openBtn.addEventListener('click', _openBoardSouthAddModal);
  }

  // Aggregate search
  const searchInput = container.querySelector('#bsv-search-agg');
  if (searchInput) {
    searchInput.addEventListener('input', (ev) => {
      _bsvSearchQuery = ev.target.value;
      // Re-render only the aggregate region for snappier typing
      showBoardSouthView();
      // Restore focus + cursor
      const fresh = document.getElementById('bsv-search-agg');
      if (fresh) {
        fresh.focus();
        const len = fresh.value.length;
        fresh.setSelectionRange(len, len);
      }
    });
  }

  // Library-owner can prune a game from the group ranking (removes that
  // bggId from every voter's list for the active library, both in memory
  // and in Firebase). Stops propagation so the row-level click below
  // doesn't also open the game's modal.
  if (isLibOwner) {
    container.querySelectorAll('[data-bsv-remove]').forEach(btn => {
      btn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        const bggId = Number(btn.dataset.bsvRemove);
        if (!Number.isFinite(bggId)) return;
        const game = _bsvFindGame(lib, bggId);
        const gameName = game ? game.name : `game #${bggId}`;
        const ok = window.confirm(`Remove "${gameName}" from the ${BSV_LIB_LABEL[lib]} group ranking?\n\nThis clears the game from every voter's list for this library.`);
        if (!ok) return;
        const votesNow = _bsvGetVotes(lib);
        const updates = [];
        for (const v in votesNow) {
          const cur = votesNow[v] || [];
          if (!cur.includes(bggId)) continue;
          const next = cur.filter(id => id !== bggId);
          votesNow[v] = next;
          updates.push(persistBoardSouthVote(v, next, lib));
        }
        showBoardSouthView();
        await Promise.all(updates);
      });
    });
  }

  // Click an aggregate row → open the game's modal (only when the underlying
  // game exists in the global library — Γιαννης-only games don't have a
  // detail modal yet so they're silently no-ops).
  container.querySelectorAll('.bsv-aggrow').forEach(el => {
    el.addEventListener('click', (ev) => {
      // Skip if the click originated from the remove button.
      if (ev.target.closest('[data-bsv-remove]')) return;
      const bggId = Number(el.dataset.bggId);
      const game = findGameByBggId(bggId);
      if (game && typeof openModal === 'function') {
        try { openModal(game); } catch (_) {}
      }
    });
  });

  if (_bsvSearchModalOpen) _openBoardSouthAddModal(true);

  window.scrollTo(0, 0);
}

// Unified pointer-based drag for the priority list. Works on mouse + touch.
// Live-reorders DOM rows as the user drags, and persists once on release.
function _wireBoardSouthDrag(container, voter, library) {
  const lib = library || _bsvLibrary;
  let drag = null;

  const items = () => Array.from(container.querySelectorAll('.bsv-myitem'));

  const onDown = (ev) => {
    // Ignore right-click.
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    // A drag only starts from the rank handle (.bsv-myrank). Touching the
    // cover/name lets the page scroll normally — fixes the mobile issue
    // where any touch on a row was hijacked into a reorder.
    if (!ev.target.closest('.bsv-myrank')) return;
    const item = ev.currentTarget;
    if (!item) return;
    ev.preventDefault();

    drag = {
      item,
      startY: ev.clientY,
      lastY: ev.clientY,
      pointerId: ev.pointerId,
      moved: false,
    };
    item.classList.add('dragging');
    try { item.setPointerCapture(ev.pointerId); } catch (_) {}
  };

  const onMove = (ev) => {
    if (!drag) return;
    if (ev.pointerId !== drag.pointerId) return;
    ev.preventDefault();

    const dy = ev.clientY - drag.lastY;
    if (Math.abs(ev.clientY - drag.startY) > 3) drag.moved = true;

    // Visually offset the dragged item so the user sees it follow the pointer.
    const currentTransform = drag.item.style.transform || '';
    const m = currentTransform.match(/translateY\(([-\d.]+)px\)/);
    const prev = m ? Number(m[1]) : 0;
    drag.item.style.transform = `translateY(${prev + dy}px)`;
    drag.lastY = ev.clientY;

    // Find the sibling currently under the pointer (excluding the dragged
    // item and ignoring its visual translation).
    const all = items();
    for (const other of all) {
      if (other === drag.item) continue;
      // Use the un-transformed bounding rect of `other` since it's static.
      const r = other.getBoundingClientRect();
      const mid = (r.top + r.bottom) / 2;
      if (ev.clientY < r.top || ev.clientY > r.bottom) continue;
      // Reorder DOM: insert dragged before/after `other` based on direction
      const fromBefore = drag.item.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING;
      // fromBefore is non-zero when `other` follows the dragged item in DOM
      if (fromBefore) {
        if (ev.clientY > mid) other.after(drag.item);
        else continue;
      } else {
        if (ev.clientY < mid) other.before(drag.item);
        else continue;
      }
      // Clear the visual offset since the row's natural position has moved.
      drag.item.style.transform = '';
      drag.startY = ev.clientY;
      drag.lastY = ev.clientY;
      // Update the rank label for every item to reflect the new order.
      _refreshBsvRanks(container);
      break;
    }
  };

  const onUp = (ev) => {
    if (!drag) return;
    if (ev.pointerId !== drag.pointerId) return;
    drag.item.classList.remove('dragging');
    drag.item.style.transform = '';
    try { drag.item.releasePointerCapture(ev.pointerId); } catch (_) {}

    // Compute the final order from the DOM and persist if changed.
    const newOrder = items().map(el => Number(el.dataset.bggId)).filter(Number.isFinite);
    drag = null;

    const before = (_bsvGetVotes(lib)[voter] || []).map(Number);
    const same = before.length === newOrder.length && before.every((v, i) => v === newOrder[i]);
    if (!same) {
      _bsvGetVotes(lib)[voter] = newOrder;
      persistBoardSouthVote(voter, newOrder, lib);
      // Re-render so the aggregate ranking + voter labels update.
      showBoardSouthView();
    }
  };

  items().forEach(item => {
    item.addEventListener('pointerdown', onDown);
    item.addEventListener('pointermove', onMove);
    item.addEventListener('pointerup', onUp);
    item.addEventListener('pointercancel', onUp);
  });
}

// Update the visible "1, 2, 3…" rank labels and the up/down disabled
// states after a live drag-reorder, without a full re-render.
function _refreshBsvRanks(container) {
  const items = container.querySelectorAll('.bsv-myitem');
  const last = items.length - 1;
  items.forEach((item, i) => {
    item.dataset.bsvIdx = String(i);
    const rankEl = item.querySelector('.bsv-myrank-num');
    if (rankEl) rankEl.textContent = String(i + 1);
    const upBtn = item.querySelector('[data-bsv-act="up"]');
    const downBtn = item.querySelector('[data-bsv-act="down"]');
    if (upBtn) upBtn.disabled = i === 0;
    if (downBtn) downBtn.disabled = i === last;
  });
}

function _openBoardSouthAddModal(skipFlagSet) {
  const voter = _activeBoardSouthVoter();
  if (!voter) return;
  if (!skipFlagSet) _bsvSearchModalOpen = true;
  const lib = _bsvLibrary;

  // Avoid stacking duplicates
  document.querySelectorAll('.bsv-modal-overlay').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'bsv-modal-overlay';

  const myListSet = new Set((_bsvGetVotes(lib)[voter] || []).map(Number));

  // Library catalogue depends on which collection we're voting on.
  // Skip expansions and campaign/legacy games when those flags are known
  // (the Γιαννης catalogue doesn't carry expansion data, so isExpansion is
  // guarded).
  const _safeIsExpansion = (g) => { try { return isExpansion(g); } catch (_) { return false; } };
  const _safeIsCampaign  = (g) => { try { return isCampaign(g);  } catch (_) { return false; } };
  const libraryGames = _bsvLibraryCatalogue(lib)
    .filter(g => !_safeIsExpansion(g) && !_safeIsCampaign(g))
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Parse a game's player range into a [min, max] tuple for filtering.
  const parsePlayers = (g) => {
    if (!g || !g.players) return [null, null];
    const m = String(g.players).match(/^(\d+)(?:\s*-\s*(\d+))?/);
    if (!m) return [null, null];
    const min = Number(m[1]);
    const max = m[2] ? Number(m[2]) : min;
    return [min, max];
  };

  overlay.innerHTML = `
    <div class="bsv-modal" role="dialog" aria-modal="true">
      <div class="bsv-modal-head">
        <div class="bsv-modal-title">Add a game · ${BSV_LIB_LABEL[lib]}</div>
        <button class="bsv-modal-close" id="bsv-modal-close" aria-label="Close">×</button>
      </div>
      <input type="text" class="bsv-search-bar" id="bsv-modal-search" placeholder="Search ${BSV_LIB_LABEL[lib]}…" autocomplete="off">
      <div class="bsv-modal-filters">
        <label class="bsv-filter">
          <span>Players</span>
          <select id="bsv-f-players">
            <option value="">Any</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6+</option>
          </select>
        </label>
        <label class="bsv-filter">
          <span>Weight</span>
          <select id="bsv-f-weight">
            <option value="">Any</option>
            <option value="light">Light (≤ 2)</option>
            <option value="medium">Medium (2–3)</option>
            <option value="heavy">Heavy (3+)</option>
          </select>
        </label>
        <label class="bsv-filter">
          <span>Sort</span>
          <select id="bsv-f-sort">
            <option value="name">Name</option>
            <option value="rating">BGG rating</option>
            <option value="weight">Weight</option>
          </select>
        </label>
      </div>
      <div class="bsv-modal-count" id="bsv-modal-count"></div>
      <div class="bsv-modal-results" id="bsv-modal-results"></div>
    </div>`;

  document.body.appendChild(overlay);
  // Lock background scroll while the modal is open so swiping on iOS
  // doesn't accidentally move the BS view underneath.
  const _prevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const close = () => {
    _bsvSearchModalOpen = false;
    overlay.remove();
    document.body.style.overflow = _prevBodyOverflow;
  };
  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });
  overlay.querySelector('#bsv-modal-close').addEventListener('click', close);

  const resultsEl = overlay.querySelector('#bsv-modal-results');
  const searchEl = overlay.querySelector('#bsv-modal-search');
  const playersEl = overlay.querySelector('#bsv-f-players');
  const weightEl = overlay.querySelector('#bsv-f-weight');
  const sortEl = overlay.querySelector('#bsv-f-sort');
  const countEl = overlay.querySelector('#bsv-modal-count');

  const renderResults = () => {
    const q = (searchEl.value || '').trim().toLowerCase();
    const wantPlayers = playersEl.value ? Number(playersEl.value) : null;
    const wantWeight = weightEl.value;
    const sortBy = sortEl.value || 'name';

    let matches = libraryGames.filter(g => {
      if (q && !(g.name || '').toLowerCase().includes(q)) return false;
      if (wantPlayers != null) {
        const [mn, mx] = parsePlayers(g);
        if (mn == null) return false;
        if (wantPlayers === 6) {
          // "6+" → any game whose max ≥ 6
          if (mx < 6) return false;
        } else if (!(mn <= wantPlayers && mx >= wantPlayers)) {
          return false;
        }
      }
      if (wantWeight) {
        const cx = Number(g.complexity);
        if (!Number.isFinite(cx)) return false;
        if (wantWeight === 'light' && cx > 2) return false;
        if (wantWeight === 'medium' && (cx < 2 || cx > 3)) return false;
        if (wantWeight === 'heavy' && cx < 3) return false;
      }
      return true;
    });

    if (sortBy === 'rating') {
      matches.sort((a, b) => (Number(b.bggRating) || 0) - (Number(a.bggRating) || 0)
        || (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'weight') {
      matches.sort((a, b) => (Number(a.complexity) || 0) - (Number(b.complexity) || 0)
        || (a.name || '').localeCompare(b.name || ''));
    } else {
      matches.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    countEl.textContent = `${matches.length} game${matches.length !== 1 ? 's' : ''}`;

    if (matches.length === 0) {
      resultsEl.innerHTML = `<div class="bsv-empty">${q ? `No games match "${_escapeHtml(q)}".` : 'No games match these filters.'}</div>`;
      return;
    }
    resultsEl.innerHTML = matches.map(g => {
      const cover = _bsvCoverHtml(g, 'modal');
      const already = myListSet.has(Number(g.bggId));
      const meta = [
        g.players ? _escapeHtml(g.players) + 'p' : '',
        g.complexity ? `wt ${Number(g.complexity).toFixed(1)}` : '',
        g.bggRating ? `★ ${Number(g.bggRating).toFixed(1)}` : '',
      ].filter(Boolean).join(' · ');
      return `<div class="bsv-modal-row" data-bgg-id="${g.bggId}">
        ${cover}
        <div>
          <div class="bsv-modal-name">${_escapeHtml(g.name)}</div>
          <div class="bsv-modal-meta">${meta}</div>
        </div>
        ${already ? '<div class="bsv-modal-already">In list</div>' : '<div style="color:var(--accent);font-size:1.2rem;font-weight:700">+</div>'}
      </div>`;
    }).join('');

    resultsEl.querySelectorAll('[data-bgg-id]').forEach(row => {
      row.addEventListener('click', async () => {
        const bggId = Number(row.dataset.bggId);
        if (!Number.isFinite(bggId)) return;
        const list = (_bsvGetVotes(lib)[voter] || []).slice();
        if (list.includes(bggId)) {
          // Already there — close modal anyway
          close();
          showBoardSouthView();
          return;
        }
        list.push(bggId);
        _bsvGetVotes(lib)[voter] = list;
        close();
        showBoardSouthView();
        persistBoardSouthVote(voter, list, lib);
      });
    });
  };

  searchEl.addEventListener('input', renderResults);
  playersEl.addEventListener('change', renderResults);
  weightEl.addEventListener('change', renderResults);
  sortEl.addEventListener('change', renderResults);
  // Focus the search box and render initial results
  setTimeout(() => searchEl.focus(), 30);
  renderResults();
}

function _escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function _renderInsightsPlayers(players, wrColor) {
  return players.map(p => {
    const initial = p.name.charAt(0).toUpperCase();
    return `<div class="stats-player-row" data-visit-player="${p.name.replace(/"/g, '&quot;')}">
      <div class="stats-player-avatar">${initial}</div>
      <div class="stats-player-info">
        <div class="stats-player-info-name">${p.name}</div>
        <div class="stats-player-info-detail">${p.plays} plays &middot; ${p.games} games &middot; ${p.wr}% WR</div>
      </div>
      <div class="stats-player-wr" style="color:${wrColor(p.wr)}">${p.wr}%</div>
    </div>`;
  }).join('');
}

function _wireInsightsPlayerClicks(container) {
  container.querySelectorAll('[data-visit-player]').forEach(el => {
    el.addEventListener('click', () => {
      showStatsView(el.dataset.visitPlayer, 'visiting');
      window.scrollTo(0, 0);
    });
  });
}

// ── Favorites System ──
