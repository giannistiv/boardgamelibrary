const FIREBASE_DB = 'https://boardgamelibrary0-default-rtdb.europe-west1.firebasedatabase.app';

// In-memory cache of all ratings: { bggId: { playerName: {value, updatedAt} } }
// Legacy shape was { bggId: { playerName: number } } — migrated on load.
let ratingsCache = {};
let ratingsCacheReady = false;

async function loadAllRatings() {
  if (!FIREBASE_DB) { ratingsCacheReady = true; return; }
  try {
    const res = await fetch(`${FIREBASE_DB}/ratings.json`);
    const data = await res.json();
    ratingsCache = data || {};
    const migrations = [];
    for (const bggId in ratingsCache) {
      for (const player in ratingsCache[bggId]) {
        const v = ratingsCache[bggId][player];
        if (typeof v === 'number') {
          const obj = { value: v, updatedAt: 0 };
          ratingsCache[bggId][player] = obj;
          migrations.push(
            fetch(`${FIREBASE_DB}/ratings/${bggId}/${encodeURIComponent(player)}.json`, {
              method: 'PUT',
              body: JSON.stringify(obj)
            }).catch(() => {})
          );
        }
      }
    }
    if (migrations.length) await Promise.all(migrations);
    ratingsCacheReady = true;
  } catch (e) {
    console.warn('Failed to load ratings from Firebase:', e);
    ratingsCacheReady = true;
  }
}

// Re-fetch all ratings from Firebase. Returns true when the fresh data
// differs from the in-memory cache (caller decides whether to re-render).
// Unlike loadAllRatings this never writes migrations back — by now every
// stored rating is already in {value, updatedAt} shape.
async function refreshRatings() {
  if (!FIREBASE_DB) return false;
  try {
    const res = await fetch(`${FIREBASE_DB}/ratings.json`);
    const data = await res.json();
    if (!data) return false;
    for (const bggId in data) {
      for (const player in data[bggId]) {
        const v = data[bggId][player];
        if (typeof v === 'number') data[bggId][player] = { value: v, updatedAt: 0 };
      }
    }
    if (JSON.stringify(data) === JSON.stringify(ratingsCache)) return false;
    ratingsCache = data;
    return true;
  } catch (_) {
    return false;
  }
}

async function saveRating(playerName, bggId, rating) {
  if (!ratingsCache[bggId]) ratingsCache[bggId] = {};
  if (rating === 0) {
    delete ratingsCache[bggId][playerName];
    if (Object.keys(ratingsCache[bggId]).length === 0) delete ratingsCache[bggId];
  } else {
    ratingsCache[bggId][playerName] = { value: rating, updatedAt: Date.now() };
  }

  if (!FIREBASE_DB) return;
  // Persist under the original canonical name so a renamed player's ratings
  // stay keyed consistently (matching how they're loaded).
  const key = encodeURIComponent(_origCanon(playerName));
  try {
    if (rating === 0) {
      await fetch(`${FIREBASE_DB}/ratings/${bggId}/${key}.json`, { method: 'DELETE' });
    } else {
      await fetch(`${FIREBASE_DB}/ratings/${bggId}/${key}.json`, {
        method: 'PUT',
        body: JSON.stringify(ratingsCache[bggId][playerName])
      });
    }
  } catch (e) {
    console.warn('Failed to save rating to Firebase:', e);
  }
}

function _ratingValue(r){ return typeof r === 'number' ? r : (r && r.value) || 0; }

// ── Per-game shared notes ──
// Stored in Firebase at /gameNotes/{bggId}/{noteId} = {text, author, createdAt, updatedAt}.
// Loaded once on startup so every browser sees the same shared notes.
let gameNotesCache = {}; // bggId -> { noteId: {text, author, createdAt, updatedAt} }

async function loadAllNotes() {
  if (!FIREBASE_DB) return;
  try {
    const res = await fetch(`${FIREBASE_DB}/gameNotes.json`);
    const data = await res.json();
    // A denied read (locked Firebase rules) returns {error: "..."} — don't let
    // that object pollute the cache; fall back to empty.
    gameNotesCache = (data && typeof data === 'object' && !data.error) ? data : {};
  } catch (e) {
    console.warn('Failed to load notes from Firebase:', e);
  }
}

async function saveNote(bggId, noteId, obj) {
  if (!gameNotesCache[bggId]) gameNotesCache[bggId] = {};
  gameNotesCache[bggId][noteId] = obj;
  if (!FIREBASE_DB) return;
  try {
    await fetch(`${FIREBASE_DB}/gameNotes/${bggId}/${encodeURIComponent(noteId)}.json`, {
      method: 'PUT',
      body: JSON.stringify(obj)
    });
  } catch (e) {
    console.warn('Failed to save note to Firebase:', e);
  }
}

async function deleteNote(bggId, noteId) {
  if (gameNotesCache[bggId]) {
    delete gameNotesCache[bggId][noteId];
    if (Object.keys(gameNotesCache[bggId]).length === 0) delete gameNotesCache[bggId];
  }
  if (!FIREBASE_DB) return;
  try {
    await fetch(`${FIREBASE_DB}/gameNotes/${bggId}/${encodeURIComponent(noteId)}.json`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Failed to delete note from Firebase:', e);
  }
}

// ── Imported plays persistence ──
// Stored in Firebase at /importedPlays/{uuid} = {bggId, date, sc, d?, b?}
// Merged into the in-memory PLAY_HISTORY on startup so new browsers see them.
let importedPlaysCache = {}; // uuid -> play entry (includes bggId)

function _mergePlayIntoHistory(uuid, p) {
  if (!p || !p.bggId || !p.date || !Array.isArray(p.sc)) return;
  const bggId = p.bggId;
  if (!PLAY_HISTORY[bggId]) PLAY_HISTORY[bggId] = [];
  for (const s of p.sc) {
    if (s && s.n && NAME_MAP[s.n]) s.n = NAME_MAP[s.n];
  }
  _applyPlayOverrides(p.bggId, p);
  if (p.l && LOCATION_MAP[p.l]) p.l = LOCATION_MAP[p.l];
  const entry = { date: p.date, sc: p.sc, _uuid: uuid };
  if (p.t) entry.t = p.t;
  if (p.d) entry.d = p.d;
  if (p.b) entry.b = p.b;
  if (p.l) entry.l = p.l;

  const newNames = new Set(p.sc.map(s => s.n));
  const isHardcodedDup = (e) => {
    if (e._uuid) return false;
    if (e.date !== p.date) return false;
    if (e.sc.length !== p.sc.length) return false;
    let overlap = 0;
    for (const s of e.sc) if (newNames.has(s.n)) overlap++;
    return overlap >= Math.max(1, e.sc.length - 1);
  };

  // 1. Prefer matching the existing entry by uuid across all bggIds
  let placed = false;
  for (const existingBggId in PLAY_HISTORY) {
    const arr = PLAY_HISTORY[existingBggId];
    const uuidIdx = arr.findIndex(e => e._uuid === uuid);
    if (uuidIdx !== -1) {
      if (existingBggId == bggId) {
        arr[uuidIdx] = entry;
      } else {
        arr.splice(uuidIdx, 1);
        PLAY_HISTORY[bggId].push(entry);
        PLAY_HISTORY[bggId].sort((a,b) => b.date.localeCompare(a.date));
      }
      placed = true;
      break;
    }
  }

  // 2. Fall back to hardcoded dedup: same date + same player count + ≥ N-1
  // players overlap (set-based, order-independent) → replace.
  if (!placed) {
    const idx = PLAY_HISTORY[bggId].findIndex(isHardcodedDup);
    if (idx !== -1) {
      PLAY_HISTORY[bggId][idx] = entry;
    } else {
      PLAY_HISTORY[bggId].push(entry);
      PLAY_HISTORY[bggId].sort((a,b) => b.date.localeCompare(a.date));
    }
    return;
  }

  // 3. After uuid match placed the entry, also clean up any leftover
  // hardcoded duplicates of the same play (e.g. old PLAY_HISTORY entry
  // that was imported separately before — now that it has a uuid, its
  // hardcoded twin should go away).
  PLAY_HISTORY[bggId] = PLAY_HISTORY[bggId].filter(e =>
    e._uuid === uuid || !isHardcodedDup(e)
  );
}

async function loadImportedPlays() {
  if (!FIREBASE_DB) return;
  try {
    const res = await fetch(`${FIREBASE_DB}/importedPlays.json`);
    const data = await res.json();
    importedPlaysCache = data || {};
    for (const uuid in importedPlaysCache) {
      _mergePlayIntoHistory(uuid, importedPlaysCache[uuid]);
    }
  } catch (e) {
    console.warn('Failed to load imported plays from Firebase:', e);
  }
}

async function persistImportedPlay(uuid, p) {
  importedPlaysCache[uuid] = p;
  if (!FIREBASE_DB) return;
  try {
    await fetch(`${FIREBASE_DB}/importedPlays/${encodeURIComponent(uuid)}.json`, {
      method: 'PUT',
      body: JSON.stringify(p)
    });
  } catch (e) {
    console.warn('Failed to save imported play to Firebase:', e);
  }
}

async function loadImportedGames() {
  if (!FIREBASE_DB) return;
  try {
    const res = await fetch(`${FIREBASE_DB}/importedGames.json`);
    const data = await res.json();
    if (!data) return;
    for (const bggId in data) {
      if (!EXTRA_GAMES[bggId]) EXTRA_GAMES[bggId] = data[bggId];
    }
  } catch (e) {
    console.warn('Failed to load imported games from Firebase:', e);
  }
}

async function persistImportedGame(entry) {
  if (!FIREBASE_DB || !entry || !entry.bggId) return;
  try {
    await fetch(`${FIREBASE_DB}/importedGames/${entry.bggId}.json`, {
      method: 'PUT',
      body: JSON.stringify(entry)
    });
  } catch (e) {
    console.warn('Failed to save imported game to Firebase:', e);
  }
}

function getPlayerRating(playerName, bggId) {
  return _ratingValue(ratingsCache[bggId] && ratingsCache[bggId][playerName]);
}

function getCommunityRating(bggId) {
  const gameRatings = ratingsCache[bggId];
  if (!gameRatings) return null;
  const values = Object.values(gameRatings).map(_ratingValue).filter(v => v > 0);
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return { avg: Math.round(avg * 10) / 10, count: values.length };
}

function buildStarRatingHtml(bggId) {
  const player = localStorage.getItem('bgl-player');
  const current = player ? getPlayerRating(player, bggId) : 0;

  let html = '<div class="star-rating-section">';

  // Player rating
  if (player) {
    html += `<div class="star-rating-label">${current ? 'Your Rating' : 'Rate this game'}</div>`;
    html += `<div style="display:flex;align-items:center">`;
    html += `<div class="star-rating-row" id="star-row" data-bgg="${bggId}" data-current="${current}">`;
    for (let i = 1; i <= 10; i++) {
      html += `<span class="star${i <= current ? ' filled' : ''}" data-val="${i}">&#9733;</span>`;
    }
    html += `</div>`;
    if (current) html += `<span class="star-rating-val">${current}/10</span>`;
    if (current) html += `<button class="star-rating-clear" data-bgg="${bggId}">clear</button>`;
    html += `</div>`;
  }

  html += '</div>';
  return html;
}

function wireStarRating() {
  const row = document.getElementById('star-row');
  if (!row) return;
  const stars = row.querySelectorAll('.star');
  const bggId = Number(row.dataset.bgg);
  const player = localStorage.getItem('bgl-player');

  // Hover effect
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = Number(star.dataset.val);
      stars.forEach(s => {
        s.classList.toggle('hovered', Number(s.dataset.val) <= val);
      });
    });
  });
  row.addEventListener('mouseleave', () => {
    stars.forEach(s => s.classList.remove('hovered'));
  });

  // Click to rate
  stars.forEach(star => {
    star.addEventListener('click', async () => {
      const val = Number(star.dataset.val);
      if (player) {
        await saveRating(player, bggId, val);
        const section = row.closest('.star-rating-section');
        if (section) {
          section.outerHTML = buildStarRatingHtml(bggId);
          wireStarRating();
        }
      }
    });
  });

  // Clear button
  const clearBtn = document.querySelector('.star-rating-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (player) {
        await saveRating(player, Number(clearBtn.dataset.bgg), 0);
        const section = clearBtn.closest('.star-rating-section');
        if (section) {
          section.outerHTML = buildStarRatingHtml(Number(clearBtn.dataset.bgg));
          wireStarRating();
        }
      }
    });
  }
}

// ── Game Notes (shared, per-game) ──

function buildNotesHtml(bggId) {
  const player = localStorage.getItem('bgl-player');
  const obj = gameNotesCache[bggId] || {};
  const notes = Object.keys(obj)
    .map(id => ({ id, ...obj[id] }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // oldest first

  const fmt = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d)) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  let html = `<div class="notes-section" data-bgg="${bggId}">
    <div class="notes-header">
      <span class="notes-title">&#128221; Notes</span>
      <span class="notes-sub">shared &middot; visible to everyone</span>
    </div>`;

  if (notes.length === 0) {
    html += `<div class="notes-empty">No notes yet${player ? ' — jot down a rule you forget or a tip for next time.' : '.'}</div>`;
  } else {
    html += `<div class="notes-list">`;
    for (const n of notes) {
      // Anyone with a name picked can edit/delete any note (shared notepad).
      const edited = (n.updatedAt && n.createdAt && n.updatedAt !== n.createdAt) ? ' &middot; edited' : '';
      html += `<div class="note-entry" data-id="${_escapeHtml(n.id)}">
        <div class="note-text">${_escapeHtml(n.text || '')}</div>
        <div class="note-meta">
          <span class="note-author">${_escapeHtml(n.author || 'Someone')}</span>
          <span class="note-date">${fmt(n.createdAt)}${edited}</span>
          ${player ? `<span class="note-actions">
            <button class="note-btn note-edit" data-id="${_escapeHtml(n.id)}">edit</button>
            <button class="note-btn note-del" data-id="${_escapeHtml(n.id)}">delete</button>
          </span>` : ''}
        </div>
      </div>`;
    }
    html += `</div>`;
  }

  if (player) {
    html += `<div class="note-add-wrap">
      <textarea class="note-textarea" id="note-input" rows="2" placeholder="Add a note… (rules you forget, house rules, tips for next time)"></textarea>
      <button class="note-add-btn" id="note-add-btn">Add note</button>
    </div>`;
  } else {
    html += `<div class="notes-login-hint">Pick your name (top-right) to add notes.</div>`;
  }

  html += `</div>`;
  return html;
}

function wireNotes() {
  const section = document.querySelector('.notes-section');
  if (!section) return;
  const bggId = Number(section.dataset.bgg);
  const player = localStorage.getItem('bgl-player');

  const rerender = () => {
    const cur = document.querySelector('.notes-section');
    if (!cur) return;
    cur.outerHTML = buildNotesHtml(bggId);
    wireNotes();
  };

  const addBtn = document.getElementById('note-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const ta = document.getElementById('note-input');
      const text = (ta && ta.value || '').trim();
      if (!text || !player) return;
      addBtn.disabled = true;
      const id = 'n' + Date.now() + Math.random().toString(36).slice(2, 8);
      const now = Date.now();
      await saveNote(bggId, id, { text, author: player, createdAt: now, updatedAt: now });
      rerender();
    });
  }

  section.querySelectorAll('.note-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this note?')) return;
      await deleteNote(bggId, btn.dataset.id);
      rerender();
    });
  });

  section.querySelectorAll('.note-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const entry = btn.closest('.note-entry');
      if (!entry) return;
      const existing = (gameNotesCache[bggId] && gameNotesCache[bggId][id]) || {};
      entry.innerHTML = `
        <textarea class="note-textarea note-edit-area" rows="2"></textarea>
        <div class="note-edit-actions">
          <button class="note-add-btn note-save">Save</button>
          <button class="note-btn note-cancel">cancel</button>
        </div>`;
      const ta = entry.querySelector('.note-edit-area');
      ta.value = existing.text || '';
      ta.focus();
      entry.querySelector('.note-save').addEventListener('click', async () => {
        const text = (ta.value || '').trim();
        if (!text) return;
        await saveNote(bggId, id, {
          text,
          author: existing.author || player,
          createdAt: existing.createdAt || Date.now(),
          updatedAt: Date.now()
        });
        rerender();
      });
      entry.querySelector('.note-cancel').addEventListener('click', rerender);
    });
  });
}

// ── Pie Chart Builder ──
