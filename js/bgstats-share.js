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

// The play in BG Stats' words. Empty fields are left out: the link has to fit in a QR code.
function bgsPlayData(bggId, play) {
  const id = Number(bggId);
  const game = findGameByBggId(id);
  const all = PLAY_HISTORY[id] || [];
  const anyScore = all.some(p => (p.sc || []).some(s => _bgsScore(s.s) !== null));
  const g = { name: game ? game.name : `Game #${id}`, sourceGameId: String(id) };
  if (id > 0) g.bggId = id;
  if (!anyScore) g.noPoints = true;
  else if (typeof _recLowBest === 'function' && _recLowBest(all, false)) g.highestWins = false;
  const players = (play.sc || []).map(s => {
    const p = { name: s.n, sourcePlayerId: _bgsId(s.n) };
    if (s.w) p.winner = true;
    const v = _bgsScore(s.s);
    if (v !== null) p.score = v;
    if (s.r) p.role = s.r;
    return p;
  });
  const out = {
    sourceName: BGS_SOURCE,
    // a play from a BG Stats file keeps its own id, so the same play is known again
    sourcePlayId: play._uuid || `bgl-${id}-${String(play.t || play.date).replace(/\D/g, '')}-${String(play.e || '').replace(/\D/g, '')}`,
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
