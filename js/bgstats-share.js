// ── Send a play to BG Stats ──
// BG Stats takes a play through a link (app.bgstatsapp.com/createPlay.html,
// bgstatsapp.com/support/push-plays-to-bg-stats-from-other-apps-or-websites):
// opened on a phone with BG Stats, it shows the import screen, where the
// players, the game and the place are matched (and remembered for next time).
// The sheet shows that link as a QR code for the other phone's camera, a
// button for this phone, and a share or copy to send it in a message.

const BGS_SOURCE = 'Board Game Library';
const BGS_LINK = 'https://app.bgstatsapp.com/createPlay.html?data=';
const BGS_QR_SRC = 'js/vendor/qrcode.js?v=1.4.4';

const _bgsScore = (v) => {
  const t = String(v == null ? '' : v).trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  if (/^[\d.+\s]+$/.test(t) && t.includes('+')) {   // "16+3+16": the total
    const n = t.split('+').reduce((a, b) => a + (Number(b.trim()) || 0), 0);
    return isFinite(n) ? n : null;
  }
  return null;
};

// A short id that stays the same for a name (BG Stats remembers its matches by it).
function _bgsId(name) {
  let h = 0x811c9dc5;
  for (const ch of String(name)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

// "yyyy-MM-dd HH:mm:ss" in UTC, as BG Stats wants: when the play ended.
// The logged time is when it started, on this phone's clock.
function _bgsEndUtc(play) {
  const start = new Date(String(play.t || `${play.date} 20:00:00`).replace(' ', 'T'));
  if (isNaN(start)) return `${play.date} 18:00:00`;
  const end = new Date(start.getTime() + (Number(play.d) || 0) * 60000);
  return end.toISOString().slice(0, 19).replace('T', ' ');
}

// The play in BG Stats' words. BG Stats on Android complains about a missing
// startPlayer, so every player carries startPlayer, winner and role, and the
// game its highestWins and noPoints; only a score nobody kept is left out.
function bgsPlayData(bggId, play) {
  const id = Number(bggId);
  const game = findGameByBggId(id);
  const all = PLAY_HISTORY[id] || [];
  const anyScore = all.some(p => (p.sc || []).some(s => _bgsScore(s.s) !== null));
  const g = {
    name: game ? game.name : `Game #${id}`,
    sourceGameId: String(id),
    highestWins: !(anyScore && typeof _recLowBest === 'function' && _recLowBest(all, false)),
    noPoints: !anyScore,
  };
  if (id > 0) g.bggId = id;
  const players = (play.sc || []).map(s => {
    const p = { startPlayer: false, name: s.n, sourcePlayerId: _bgsId(s.n), winner: !!s.w, role: s.r || '' };
    const v = _bgsScore(s.s);
    if (v !== null) p.score = v;
    return p;
  });
  const out = {
    sourceName: BGS_SOURCE,
    // a play from a BG Stats file keeps its own id, so the same play is known again
    sourcePlayId: play._uuid || (play.mp ? `bgl-${play.mp}` : '') || `bgl-${id}-${String(play.t || play.date).replace(/\D/g, '')}-${String(play.e || '').replace(/\D/g, '')}`,
    playDate: _bgsEndUtc(play),
    game: g,
    players,
  };
  if (Number(play.d) > 0) out.durationMin = Number(play.d);
  if (play.b) out.board = play.b;
  if (play.l) out.location = play.l;
  return out;
}

function bgsPlayLink(bggId, play) {
  // ':' and ',' may stay as they are in a link's query: a shorter link, a QR code easier to scan
  const data = encodeURIComponent(JSON.stringify(bgsPlayData(bggId, play))).replace(/%3A/g, ':').replace(/%2C/g, ',');
  return BGS_LINK + data;
}

// ── A BG Stats play file (.bgsplay) ──
// The link can't carry a score sheet or expansions (BG Stats' createPlay takes
// names, scores, winners and roles), so a play that has them can also go as a
// play file: BG Stats' own way of sharing a play, laid out like its exports
// (players, games, locations, plays). The sheet goes back in BG Stats' words,
// with the ids its own sheet for the game uses (data/scoresheets.js). The ids
// are made from the names, so BG Stats knows the same player or game again.
function _bgsUuid(key) {
  let hex = '';
  for (let seed = 1; seed <= 4; seed++) {
    let h = Math.imul(0x811c9dc5, seed) >>> 0;
    for (const ch of `${key}#${seed}`) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    hex += h.toString(16).padStart(8, '0');
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
const _bgsPad = (n) => String(n).padStart(2, '0');
const _bgsLocal = (d) => `${d.getFullYear()}-${_bgsPad(d.getMonth() + 1)}-${_bgsPad(d.getDate())} ${_bgsPad(d.getHours())}:${_bgsPad(d.getMinutes())}:${_bgsPad(d.getSeconds())}`;

// The play's score sheet as BG Stats keeps it, or null: only a sheet logged in
// this app on the game's own BG Stats sheet (the rounds sheet has none there).
function _bgsSheet(id, play, uuids) {
  if (!play.mp || !play.ss || typeof scoreSheetUnpack !== 'function') return null;
  const s = scoreSheetUnpack(play.ss, play.sc);
  if (!s || s.key === 'rounds' || !s.sheet.g) return null;
  const n = play.sc.length;
  const type = { check: 'checkbox', radio: 'radio', win: 'radioOverall', stat: 'ignoredForTotal' };
  const groups = [];
  s.sheet.g.forEach((g, gi) => {
    if ((g.pmin && n < g.pmin) || (g.pmax && n > g.pmax)) return;
    const reps = g.rep == null ? 1 : Math.max(g.min || 1, s.reps[gi] || 0);
    for (let r = 1; r <= reps; r++) {
      groups.push({
        templateId: g.tid || String(gi + 1), maxRepeat: g.mr == null ? -1 : g.mr, repetition: r,
        hasSubTotal: false, hasSubTotalOfNonScoringFields: false, hideSingleGroupLabel: false, isExtra: false, scores: {},
        rows: g.rows.map((row, ri) => {
          const o = { templateId: row.id || `row${ri + 1}`, label: row.l, repetition: 1, repeatable: false, negative: !!row.neg, isExtra: false };
          if (type[row.t]) o.type = type[row.t];
          if (row.v != null) o.value = String(row.v);
          if (row.x) o.showWithExpansions = row.x;
          o.scores = {};
          const cell = s.v[`${gi}.${r}.${ri}`] || {};
          play.sc.forEach((p, i) => {
            const v = cell[p.n];
            if (v == null || v === '' || v === false) return;
            o.scores[uuids[i]] = type[row.t] && row.t !== 'stat' ? String(row.v) : String(v);
          });
          return o;
        }),
      });
    }
  });
  const sheet = s.sheet;
  const out = { bggId: id, version: 1, langCode: 'en', defaultLanguage: 'en', scoreType: 'bestTotalWins' };
  if (sheet.vid) out.variantId = sheet.vid;
  if (sheet.var) out.variantLabel = sheet.var;
  out[sheet.fmt === 'rounds' ? 'rounds' : 'groups'] = groups;
  return out;
}

function bgsPlayFile(bggId, play) {
  const id = Number(bggId);
  const link = bgsPlayData(id, play);
  const game = findGameByBggId(id) || {};
  const now = _bgsLocal(new Date());
  const range = (v) => { const m = String(v || '').match(/(\d+)\D*(\d+)?/); return m ? [Number(m[1]), Number(m[2] || m[1])] : [0, 0]; };
  const [minP, maxP] = range(game.players), [minT, maxT] = range(game.playTime);
  const gameOf = (gid, name, extra) => ({
    uuid: _bgsUuid(`bgl-game:${gid}`), id: 0, name, modificationDate: now, usesTeams: false, bggName: name, bggId: gid, ...extra,
  });
  const games = [gameOf(id, link.game.name, {
    cooperative: typeof isCoop === 'function' && !!game.categories && isCoop(game), highestWins: link.game.highestWins, noPoints: link.game.noPoints,
    bggYear: Number(game.year) || 0, isBaseGame: 1, isExpansion: 0, minPlayerCount: minP, maxPlayerCount: maxP, minPlayTime: minT, maxPlayTime: maxT,
  })];
  const xs = typeof playExpansionsOf === 'function' ? playExpansionsOf(id, play) : [];
  const named = new Map((typeof expansionsOf === 'function' ? expansionsOf(id) : []).map(([x, n]) => [Number(x), n]));
  for (const x of xs) {
    games.push(gameOf(x, named.get(x) || (findGameByBggId(x) || {}).name || `Expansion #${x}`,
      { cooperative: games[0].cooperative, highestWins: link.game.highestWins, noPoints: link.game.noPoints, isBaseGame: 0, isExpansion: 1 }));
  }
  games.forEach((g, i) => { g.id = i + 1; });
  const players = play.sc.map((s, i) => ({ uuid: _bgsUuid(`bgl-player:${s.n}`), id: i + 1, name: s.n, isAnonymous: /^anonymous/i.test(s.n), modificationDate: now }));
  const uuids = players.map(p => p.uuid);
  const sheet = _bgsSheet(id, play, uuids);
  const p = {
    uuid: _bgsUuid(`bgl-play:${link.sourcePlayId}`), modificationDate: now, entryDate: play.e || play.t || now,
    playDate: play.t || `${play.date} 20:00:00`, usesTeams: false, durationMin: Number(play.d) || 0, ignored: false,
    manualWinner: false, rounds: 0, gameRefId: 1, scoringSetting: link.game.noPoints ? 6 : 0,
    playerScores: play.sc.map((s, i) => {
      const v = _bgsScore(s.s);
      return { score: v === null ? null : String(v), winner: !!s.w, newPlayer: false, startPlayer: false, playerRefId: i + 1,
        rank: 0, seatOrder: i, role: s.r || null, metaData: sheet ? JSON.stringify({ scoreUuid: uuids[i] }) : null };
    }),
    expansionPlays: xs.map((x, k) => ({ gameRefId: k + 2 })),
  };
  if (play.b) p.board = play.b;
  if (play.c) p.comments = play.c;
  const locations = play.l ? [{ uuid: _bgsUuid(`bgl-place:${play.l}`), id: 1, name: play.l, modificationDate: now }] : [];
  if (locations.length) p.locationRefId = 1;
  if (sheet) p.scoresheet = JSON.stringify(sheet);
  const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
  const meIdx = play.sc.findIndex(s => s.n === me);
  return {
    about: 'This is a Play file that can be read by Board Game Stats. If you see this text, try to use a share, export or open-in function to open it with Board Game Stats.',
    players, locations, games, plays: [p], userInfo: { meRefId: meIdx >= 0 ? meIdx + 1 : 1 },
  };
}
// What a play file adds to the link: its score sheet and expansions.
function _bgsFileExtras(bggId, play) {
  const xs = typeof playExpansionsOf === 'function' ? playExpansionsOf(Number(bggId), play) : [];
  const sheet = !!(play.mp && play.ss && typeof scoreSheetUnpack === 'function' && (scoreSheetUnpack(play.ss, play.sc) || {}).key !== 'rounds');
  return [sheet ? 'score sheet' : '', xs.length ? (xs.length === 1 ? 'expansion' : 'expansions') : ''].filter(Boolean);
}
// Share the file to BG Stats (the phone's share sheet), or save it where sharing files can't.
function _bgsSendFile(bggId, play, name) {
  const json = JSON.stringify(bgsPlayFile(bggId, play));
  const fname = `${String(name).replace(/[^\p{L}\p{N} -]+/gu, '').trim().replace(/\s+/g, '-') || 'play'}-${play.date}.bgsplay`;
  const file = new File([json], fname, { type: 'application/octet-stream' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    return navigator.share({ files: [file], title: `${name}, ${play.date}` }).then(() => 'shared', (e) => (e && e.name === 'AbortError' ? 'cancelled' : 'failed'));
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return Promise.resolve('saved');
}

let _bgsQrLoading = null;
function _bgsLoadQr() {
  if (typeof qrcode === 'function') return Promise.resolve(true);
  if (!_bgsQrLoading) {
    _bgsQrLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = BGS_QR_SRC;
      s.onload = () => resolve(typeof qrcode === 'function');
      s.onerror = () => { _bgsQrLoading = null; resolve(false); };
      document.head.appendChild(s);
    });
  }
  return _bgsQrLoading;
}

function _bgsQrSvg(text) {
  const qr = qrcode(0, 'L');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true });
}

// Whose BG Stats a play came from: a friend's own upload, or the library's.
function _bgsFrom(play) {
  if (play.mp) return '';   // logged in this app (js/log-play.js)
  return play.src || (typeof WRAPPED_OWNER !== 'undefined' ? WRAPPED_OWNER : '');
}

function openBgsShare(bggId, idx) {
  const play = (PLAY_HISTORY[bggId] || [])[idx];
  if (!play) return;
  const esc = _escapeHtml;
  const game = findGameByBggId(Number(bggId));
  const name = game ? game.name : `Game #${bggId}`;
  const link = bgsPlayLink(bggId, play);
  const from = _bgsFrom(play);
  const extras = _bgsFileExtras(bggId, play);   // what only a play file carries
  const meta = [typeof _fmtDateShort === 'function' ? _fmtDateShort(play.date) : play.date, play.l, play.b].filter(Boolean).map(esc).join(' &middot; ');
  const who = (play.sc || []).map(s => `<span class="bgs-p${s.w ? ' w' : ''}">${s.w ? '&#9733; ' : ''}${esc(s.n)}${s.s !== '' && s.s != null ? ` <small>${esc(s.s)}</small>` : ''}</span>`).join('');

  let ov = document.getElementById('bgs-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'bgs-overlay';
    ov.className = 'bgs-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
  }
  ov.innerHTML = `<div class="bgs-sheet">
      <div class="bgs-head"><span class="bgs-title">Send to BG Stats</span><button type="button" class="bgs-x" aria-label="Close">&times;</button></div>
      <div class="bgs-play">
        <img class="bgs-cover" src="images/${Number(bggId)}.jpg" alt="" onerror="this.style.visibility='hidden'">
        <div><div class="bgs-name">${esc(name)}</div><div class="bgs-meta">${meta}</div></div>
      </div>
      <div class="bgs-players">${who}</div>
      <div class="bgs-qr" aria-label="QR code with the play">Making the QR code…</div>
      <div class="bgs-hint">Scan it with the other phone's camera: BG Stats opens with this play, ready to import.</div>
      <div class="bgs-acts">
        <a class="bgs-btn bgs-main" href="${esc(link)}">Open in BG Stats on this phone</a>
        <button type="button" class="bgs-btn" data-bgs-share>${navigator.share ? 'Share link' : 'Copy link'}</button>
        ${extras.length ? `<button type="button" class="bgs-btn" data-bgs-file>Send as a BG Stats file, with the ${extras.join(' and ')}</button>
        <div class="bgs-small bgs-file-note">The QR code and the link carry the players, scores and winners. The ${extras.join(' and ')} go only in a file: share it to BG Stats${navigator.canShare ? '' : ' (it\'s saved here; open it with BG Stats)'}.</div>` : ''}
      </div>
      <div class="bgs-small">The first time, BG Stats asks which of its players, game and place each one is, and remembers it.${from ? ` This play is already in ${esc(from)}'s BG Stats.` : ''}</div>
    </div>`;

  const close = () => {
    ov.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    ov._navClose = null;
    navOverlayClosed('bgs');
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  ov.onclick = async (e) => {
    if (e.target === ov || e.target.closest('.bgs-x')) { close(); return; }
    const fb = e.target.closest('[data-bgs-file]');
    if (fb) {
      const was = fb.textContent;
      const r = await _bgsSendFile(bggId, play, name);
      if (r === 'saved' || r === 'failed') {
        fb.textContent = r === 'saved' ? 'Saved: open it with BG Stats' : 'Couldn\'t share it';
        setTimeout(() => { fb.textContent = was; }, 3000);
      }
      return;
    }
    const sh = e.target.closest('[data-bgs-share]');
    if (!sh) return;
    if (navigator.share) {
      try { await navigator.share({ title: `${name}, ${play.date}`, text: `${name} (${play.date}): tap to add the play to BG Stats`, url: link }); } catch (_) {}
      return;
    }
    try { await navigator.clipboard.writeText(link); sh.textContent = 'Link copied'; }
    catch (_) { sh.textContent = 'Couldn\'t copy'; }
    setTimeout(() => { sh.textContent = 'Copy link'; }, 2000);
  };
  document.addEventListener('keydown', onKey);
  ov._navClose = close;
  ov.classList.add('open');
  navOverlayOpened('bgs');

  _bgsLoadQr().then((ok) => {
    const box = ov.querySelector('.bgs-qr');
    if (!box) return;
    try { box.innerHTML = ok ? _bgsQrSvg(link) : 'The QR code needs a connection the first time. The buttons below still work.'; }
    catch (_) { box.textContent = 'This play is too long for a QR code. Use the buttons below.'; }
  });
}

// The small button on a play (game page, full play log).
function bgsSendBtnHtml(bggId, idx) {
  if (idx < 0) return '';
  return `<button type="button" class="bgs-send" data-bgs-send="${Number(bggId)}|${idx}" title="Send to BG Stats" aria-label="Send this play to BG Stats">`
    + '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 4h1v1H4zM11 4h1v1h-1zM4 11h1v1H4zM9 9h2v2H9zM12 12h2v2h-2zM12 9h2v1h-2zM9 12h1v2H9z" fill="currentColor"/></svg></button>';
}

// Caught before the row's own click (the full play log opens the game on a tap).
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('[data-bgs-send]');
  if (!b) return;
  e.stopPropagation();
  e.preventDefault();
  const [id, idx] = b.dataset.bgsSend.split('|').map(Number);
  openBgsShare(id, idx);
}, true);
