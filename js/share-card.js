// ── Share cards: a play or a game as a picture, for WhatsApp, Messenger… ──
// The user, 27 Nov 2026: "A share card would be amazing… in the same menu as
// the QR for BG Stats… It could even be different for every game. You set the
// scope. But give me a way to send it to someone through Messenger, WhatsApp".
// A play's card: the cover, the game in its own colour (its spine colour),
// when and where, the scenario, the result, everyone at the table with their
// scores, and a part of its own for games that have one: Dorfromantik's
// score by part, Sky Team's flight, the Moon's Adventure, Hanabi's firework,
// a mission's tries, or where the points came from on the score sheet (Blood
// on the Clocktower's winning team is its result line, "Evil wins"). A game's card: your record with it.
// Drawn on a canvas (1080×1350, what chat apps show whole), then shared
// through the phone's own share sheet as a picture; or copied, saved, or sent
// to WhatsApp as text with a link that opens the game here (?go=game:ID).

const SC_W = 1080, SC_H = 1350, SC_PAD = 64;
const SC_BG = '#14110e', SC_TEXT = '#f4ece1', SC_TEXT2 = 'rgba(244,236,225,0.74)', SC_TEXT3 = 'rgba(244,236,225,0.5)';
const SC_SERIF = 'Literata, Georgia, serif', SC_SANS = 'Inter, system-ui, sans-serif';
const SC_GOLD = '#f2c14e', SC_WIN = '#5ad68a', SC_LOSS = '#f47c7c';

// ── Drawing helpers ──
function _scImg(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}
async function _scFonts(sample) {
  if (!document.fonts || !document.fonts.load) return;
  const t = sample || 'Aa Ωω';
  try {
    await Promise.all(['700 60px Literata', '600 60px Literata', '400 30px Inter', '600 30px Inter', '800 30px Inter']
      .map(f => document.fonts.load(f, t)));
  } catch (_) {}
}
function _scRound(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// the image covering a box, cropped to fill it
function _scCover(ctx, im, x, y, w, h) {
  const s = Math.max(w / im.width, h / im.height);
  const sw = w / s, sh = h / s;
  ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
}
function _scFit(ctx, text, max) {
  let t = String(text);
  if (ctx.measureText(t).width <= max) return t;
  while (t.length > 1 && ctx.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}
// words over up to `lines` lines, the last one cut short
function _scWrap(ctx, text, max, lines) {
  const words = String(text).split(/\s+/);
  const out = [];
  let cur = '';
  for (let i = 0; i < words.length; i++) {
    const next = cur ? `${cur} ${words[i]}` : words[i];
    if (ctx.measureText(next).width <= max || !cur) { cur = next; continue; }
    out.push(cur);
    cur = words[i];
    if (out.length === lines - 1) { cur = words.slice(i).join(' '); break; }
  }
  if (cur) out.push(cur);
  if (out.length > lines) out.length = lines;
  out[out.length - 1] = _scFit(ctx, out[out.length - 1], max);
  return out;
}
// a game's colour, lifted until it reads on the dark card
function _scAccent(hex) {
  const m = String(hex || '').match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  let [r, g, b] = m ? m.slice(1).map(x => parseInt(x, 16)) : [232, 176, 75];
  const lum = () => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  while (lum() < 0.55) { r += (255 - r) * 0.18; g += (255 - g) * 0.18; b += (255 - b) * 0.18; }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}
const _scAlpha = (rgb, a) => rgb.replace('rgb(', 'rgba(').replace(')', `,${a})`);
function _scHue(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}
async function _scAvatar(ctx, name, cx, cy, r) {
  const photo = typeof playerPhoto === 'function' ? playerPhoto(name) : null;
  const im = photo ? await _scImg(photo) : null;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  if (im) { ctx.clip(); _scCover(ctx, im, cx - r, cy - r, r * 2, r * 2); }
  else {
    ctx.fillStyle = `hsl(${_scHue(name)} 35% 32%)`;
    ctx.fill();
    ctx.fillStyle = SC_TEXT;
    ctx.font = `700 ${Math.round(r * 0.95)}px ${SC_SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(name || '?').charAt(0).toUpperCase(), cx, cy + 2);
  }
  ctx.restore();
}
const _scNum = (v) => (Math.round(v * 10) / 10).toLocaleString('en');
const _scDate = (d) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const _scGameLink = (id) => `${location.origin}${location.pathname}?go=game:${Number(id)}`;
const _scScore = (s) => (s && typeof _recScore === 'function' ? _recScore(s.s) : null);

// The background and the game's header: cover, name, a line under it.
async function _scHeader(ctx, game, bggId, sub) {
  const accent = _scAccent(game && game.spineColor);
  ctx.fillStyle = SC_BG;
  ctx.fillRect(0, 0, SC_W, SC_H);
  const cover = await _scImg(`images/${Number(bggId)}.jpg`);
  if (cover) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    _scCover(ctx, cover, 0, 0, SC_W, 520);
    ctx.restore();
  }
  let g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, 'rgba(20,17,14,0.15)');
  g.addColorStop(0.75, 'rgba(20,17,14,0.92)');
  g.addColorStop(1, SC_BG);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SC_W, 560);
  // the game's colour, a glow from the corner
  g = ctx.createRadialGradient(SC_W, SC_H, 0, SC_W, SC_H, 900);
  g.addColorStop(0, _scAlpha(accent, 0.22));
  g.addColorStop(1, _scAlpha(accent, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SC_W, SC_H);
  // the cover itself, and the name beside it
  const T = 250, ty = 210;
  if (cover) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 30;
    _scRound(ctx, SC_PAD, ty, T, T, 26);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
    ctx.save();
    _scRound(ctx, SC_PAD, ty, T, T, 26);
    ctx.clip();
    _scCover(ctx, cover, SC_PAD, ty, T, T);
    ctx.restore();
  }
  const nx = cover ? SC_PAD + T + 40 : SC_PAD, nw = SC_W - nx - SC_PAD;
  ctx.fillStyle = SC_TEXT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 60px ${SC_SERIF}`;
  let lines = _scWrap(ctx, game ? game.name : `Game #${bggId}`, nw, 3);
  if (lines.length === 3) { ctx.font = `700 50px ${SC_SERIF}`; lines = _scWrap(ctx, game ? game.name : '', nw, 3); }
  const lh = lines.length === 3 ? 58 : 70;
  let y = ty + T / 2 - (lines.length * lh) / 2 + lh * 0.75 - (sub ? 20 : 0);
  for (const l of lines) { ctx.fillText(l, nx, y); y += lh; }
  if (sub) {
    ctx.font = `500 30px ${SC_SANS}`;
    ctx.fillStyle = SC_TEXT2;
    ctx.fillText(_scFit(ctx, sub, nw), nx, y + 2);
  }
  return { accent, top: ty + T + 44 };
}
function _scFooter(ctx, left, right, accent, H) {
  const y = (H || SC_H) - 56;
  ctx.strokeStyle = 'rgba(255,232,200,0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(SC_PAD, y - 46); ctx.lineTo(SC_W - SC_PAD, y - 46); ctx.stroke();
  ctx.font = `700 26px ${SC_SERIF}`;
  ctx.fillStyle = accent;
  ctx.textAlign = 'left';
  ctx.fillText('Board Game Library', SC_PAD, y);
  if (left) {
    const w = ctx.measureText('Board Game Library').width;
    ctx.font = `500 26px ${SC_SANS}`;
    ctx.fillStyle = SC_TEXT3;
    ctx.fillText(_scFit(ctx, ` · ${left}`, SC_W - SC_PAD * 2 - w - 300), SC_PAD + w, y);
  }
  if (right) {
    ctx.font = `600 26px ${SC_SANS}`;
    ctx.fillStyle = SC_TEXT2;
    ctx.textAlign = 'right';
    ctx.fillText(_scFit(ctx, right, 380), SC_W - SC_PAD, y);
    ctx.textAlign = 'left';
  }
}
function _scChip(ctx, text, x, y, accent) {
  ctx.font = `600 28px ${SC_SANS}`;
  const t = _scFit(ctx, text, SC_W - SC_PAD * 2 - 40);
  const w = ctx.measureText(t).width + 40;
  _scRound(ctx, x, y, w, 50, 25);
  ctx.fillStyle = _scAlpha(accent, 0.16);
  ctx.fill();
  ctx.strokeStyle = _scAlpha(accent, 0.5);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.textBaseline = 'middle';
  ctx.fillText(t, x + 20, y + 26);
  ctx.textBaseline = 'alphabetic';
  return x + w;
}

// The card as tall as what's on it: from a square up to 1350, the footer under it.
function _scFinish(cv, endY, left, right, accent) {
  const H = Math.max(SC_W, Math.min(SC_H, Math.ceil(endY + 140)));
  const out = document.createElement('canvas');
  out.width = SC_W; out.height = H;
  const ctx = out.getContext('2d');
  ctx.drawImage(cv, 0, 0, SC_W, H, 0, 0, SC_W, H);
  _scFooter(ctx, left, right, accent, H);
  return out;
}

// ── A play ──
// What a play's card says about the result, in a line.
function _scResult(bggId, play) {
  const sc = play.sc || [];
  const noRes = (typeof isNoResultGame === 'function' && isNoResultGame(bggId)) || play.nr;
  if (noRes) {
    const v = Math.max(...sc.map(_scScore).filter(x => x != null), -Infinity);
    return { text: isFinite(v) && sc.every(s => _scScore(s) === v) ? `${_scNum(v)} points together` : 'Played together', tone: 'gold' };
  }
  const ws = sc.filter(s => s.w);
  const teams = [...new Set(ws.map(s => s.tm).filter(Boolean))];
  const coop = typeof isCoop === 'function' && (() => { const g = findGameByBggId(Number(bggId)); return g && g.categories ? isCoop(g) : false; })();
  if (!ws.length) return { text: coop || sc.length === 1 ? 'The game won this time' : 'No winner', tone: 'loss' };
  if (ws.length === sc.length && sc.length > 1) return { text: 'Won together', tone: 'win' };
  if (teams.length === 1 && !/^\d+$/.test(teams[0])) return { text: `${teams[0]} wins`, tone: 'win' };
  if (ws.length === 1) return { text: `${ws[0].n} wins`, tone: 'gold' };
  return { text: `${ws.map(s => String(s.n).split(/\s/)[0]).join(' & ')} win`, tone: 'gold' };
}
// The players, best first (winners, then by score; the lowest first where the lowest wins).
function _scRanked(bggId, play) {
  const low = typeof _recLowBest === 'function' && _recLowBest(PLAY_HISTORY[bggId] || [], false);
  const sc = (play.sc || []).map((s, i) => ({ ...s, i, v: _scScore(s) }));
  if (sc.every(s => s.v == null)) return sc.sort((a, b) => (b.w - a.w) || a.i - b.i);
  return sc.sort((a, b) => (b.w - a.w) || ((a.v == null) - (b.v == null)) || (low ? a.v - b.v : b.v - a.v) || a.i - b.i);
}

// A game's own part of the card: { title, h (height wanted), draw(ctx, x, y, w, h, accent) }.
const SC_FLAIR = {};
function _scFlairFor(bggId, play) {
  const own = SC_FLAIR[Number(bggId)];
  const f = own ? own(play) : null;
  return f || _scFlairMission(bggId, play) || _scFlairPoints(bggId, play);
}
// Where the points came from (the score sheet): the winner's, or the table's.
function _scFlairPoints(bggId, play) {
  const pts = typeof playPointsOf === 'function' ? playPointsOf(Number(bggId), play) : null;
  if (!pts) return null;
  const cats = Array.isArray(pts) ? Object.fromEntries(pts.map(x => [x.c, Object.fromEntries((x.n || []).map((n, i) => [n, x.v[i]]))])) : pts;
  const people = new Set(Object.values(cats).flatMap(c => Object.keys(c)));
  const winner = (play.sc || []).find(s => s.w);
  const who = people.has('Together') ? 'Together' : winner && people.has(winner.n) ? winner.n : [...people][0];
  if (!who) return null;
  const rows = Object.entries(cats).map(([c, m]) => [c, Number(m[who])]).filter(([, v]) => isFinite(v) && v !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6);
  if (rows.length < 2) return null;
  const top = Math.max(...rows.map(r => Math.abs(r[1])));
  return {
    title: who === 'Together' ? 'Where the points came from' : `Where ${String(who).split(/\s/)[0]}’s points came from`,
    h: 70 + rows.length * 52,
    draw(ctx, x, y, w, h, accent) {
      rows.forEach(([c, v], i) => {
        const yy = y + i * 52;
        ctx.font = `500 28px ${SC_SANS}`;
        ctx.fillStyle = SC_TEXT2;
        ctx.textAlign = 'left';
        ctx.fillText(_scFit(ctx, c, 330), x, yy + 30);
        const bx = x + 350, bw = w - 350 - 110;
        _scRound(ctx, bx, yy + 12, bw, 22, 11);
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fill();
        _scRound(ctx, bx, yy + 12, Math.max(22, bw * Math.abs(v) / top), 22, 11);
        ctx.fillStyle = v < 0 ? SC_LOSS : accent;
        ctx.fill();
        ctx.font = `800 30px ${SC_SANS}`;
        ctx.fillStyle = SC_TEXT;
        ctx.textAlign = 'right';
        ctx.fillText(_scNum(v), x + w, yy + 32);
        ctx.textAlign = 'left';
      });
    },
  };
}
// A numbered mission or chapter: which one, and which try it was for this table.
function _scFlairMission(bggId, play) {
  if (typeof _pbMission !== 'function' || !play.b) return null;
  const m = _pbMission(play);
  if (!m) return null;
  const who = new Set((play.sc || []).map(s => s.n));
  const same = (PLAY_HISTORY[bggId] || []).filter(p => {
    const pm = _pbMission(p);
    return pm && pm.key === m.key && (p.sc || []).filter(s => who.has(s.n)).length >= Math.min(2, who.size);
  }).sort(typeof byPlayOrder === 'function' ? byPlayOrder : () => 0);
  const tryN = same.indexOf(play) + 1;
  const won = (play.sc || []).some(s => s.w);
  const names = typeof PB_NAMES !== 'undefined' && PB_NAMES[Number(bggId)];
  const named = names && names[m.n - 1] ? names[m.n - 1] : m.title || '';
  const word = (String(play.b).match(/^(?:[^／]*?)?\b(mission|scenario|campaign|chapter|adventure|case|map|year|episode|level|quest|game)\b/i) || [, 'Mission'])[1];
  const label = `${word[0].toUpperCase()}${word.slice(1).toLowerCase().replace(/^campaign$/, 'Chapter')} ${m.key}`;
  const line = won ? (tryN > 1 ? `Beaten on try ${tryN}` : 'Beaten first try') : tryN > 1 ? `Try ${tryN}: not yet` : 'First try: not yet';
  return {
    title: '', h: 150,
    draw(ctx, x, y, w, h, accent) {
      ctx.font = `700 64px ${SC_SERIF}`;
      ctx.fillStyle = accent;
      ctx.textAlign = 'left';
      ctx.fillText(_scFit(ctx, `${label}${named ? ` · ${named}` : ''}`, w), x, y + 60);
      ctx.font = `600 34px ${SC_SANS}`;
      ctx.fillStyle = won ? SC_WIN : SC_TEXT2;
      ctx.fillText(line, x, y + 118);
    },
  };
}

// The card for a play: a canvas, drawn.
async function shareCardPlay(bggId, play) {
  const game = findGameByBggId(Number(bggId)) || { name: `Game #${bggId}` };
  await _scFonts(`${game.name} ${(play.sc || []).map(s => s.n).join(' ')}`);
  const cv = document.createElement('canvas');
  cv.width = SC_W; cv.height = SC_H;
  const ctx = cv.getContext('2d');
  const sub = [_scDate(play.date), play.l].filter(Boolean).join(' · ');
  const { accent, top } = await _scHeader(ctx, game, bggId, sub);
  let y = top;
  // the scenario, and how the game went
  const scen = String(play.b || '').split(/\s*[／|]\s*/).filter(Boolean).join(' · ');
  if (scen) { _scChip(ctx, scen, SC_PAD, y, accent); y += 80; }
  const res = _scResult(bggId, play);
  ctx.font = `700 64px ${SC_SERIF}`;
  ctx.fillStyle = res.tone === 'win' ? SC_WIN : res.tone === 'loss' ? SC_LOSS : SC_GOLD;
  ctx.textAlign = 'left';
  ctx.fillText(_scFit(ctx, `${res.tone === 'loss' ? '' : '★ '}${res.text}`, SC_W - SC_PAD * 2), SC_PAD, y + 56);
  y += 100;
  // the table
  const flair = _scFlairFor(bggId, play);
  const footY = SC_H - 150;
  const ranked = _scRanked(bggId, play);
  const room = footY - y - (flair ? flair.h + (flair.title ? 60 : 20) : 0);
  // a big table in two columns (Blood on the Clocktower's town), else one
  const cols = ranked.length > 6 ? 2 : 1;
  const perCol = Math.ceil(ranked.length / cols);
  const rowH = Math.min(84, Math.max(cols > 1 ? 62 : 56, Math.floor(room / Math.max(1, perCol))));
  const fitRows = Math.max(1, Math.floor(room / rowH));
  const shown = Math.min(ranked.length, fitRows * cols);
  const scoresAll = ranked.some(s => s.v != null);
  const shared = scoresAll && ranked.every(s => s.v === ranked[0].v) && ranked.length > 1;
  const colW = (SC_W - SC_PAD * 2 - (cols - 1) * 40) / cols;
  const rowsUsed = Math.ceil(shown / cols);
  for (let k = 0; k < shown; k++) {
    const s = ranked[k];
    const c = cols > 1 ? Math.floor(k / rowsUsed) : 0, row = cols > 1 ? k % rowsUsed : k;
    const x0 = SC_PAD + c * (colW + 40), x1 = x0 + colW;
    const cy = y + row * rowH + rowH / 2;
    if (k === shown - 1 && ranked.length > shown) {
      ctx.font = `600 30px ${SC_SANS}`;
      ctx.fillStyle = SC_TEXT3;
      ctx.textAlign = 'left';
      ctx.fillText(`+ ${ranked.length - shown + 1} more`, x0, cy + 10);
      break;
    }
    const r = Math.round(rowH * 0.36);
    await _scAvatar(ctx, s.n, x0 + r, cy, r);
    ctx.textAlign = 'left';
    const nameX = x0 + r * 2 + 22;
    const right = (s.v != null || s.w) && !shared ? 110 : 0;
    ctx.font = `${s.w ? 700 : 500} ${Math.round(rowH * 0.42)}px ${SC_SANS}`;
    ctx.fillStyle = s.w ? SC_TEXT : SC_TEXT2;
    const nameMax = x1 - nameX - right - 10;
    const nameT = _scFit(ctx, `${s.n}`, cols > 1 && s.r ? nameMax * 0.6 : nameMax);
    ctx.fillText(nameT, nameX, cy + rowH * 0.15);
    if (s.r) {
      const nw = ctx.measureText(nameT).width;
      ctx.font = `500 ${Math.round(rowH * 0.32)}px ${SC_SANS}`;
      ctx.fillStyle = SC_TEXT3;
      const room2 = nameMax - nw;
      if (room2 > 60) ctx.fillText(_scFit(ctx, ` · ${s.r}`, room2), nameX + nw, cy + rowH * 0.14);
    }
    if (s.v != null && !shared) {
      ctx.textAlign = 'right';
      ctx.font = `800 ${Math.round(rowH * 0.46)}px ${SC_SANS}`;
      ctx.fillStyle = s.w ? SC_GOLD : SC_TEXT;
      ctx.fillText(_scNum(s.v), x1, cy + rowH * 0.16);
      ctx.textAlign = 'left';
    } else if (s.w && !shared) {
      ctx.textAlign = 'right';
      ctx.font = `700 ${Math.round(rowH * 0.46)}px ${SC_SANS}`;
      ctx.fillStyle = SC_GOLD;
      ctx.fillText('★', x1, cy + rowH * 0.16);
      ctx.textAlign = 'left';
    }
  }
  y += rowsUsed * rowH;
  // the game's own part
  if (flair) {
    y += 20;
    if (flair.title) {
      ctx.font = `700 26px ${SC_SANS}`;
      ctx.fillStyle = SC_TEXT3;
      ctx.fillText(flair.title.toUpperCase(), SC_PAD, y + 26);
      y += 50;
    }
    flair.draw(ctx, SC_PAD, y, SC_W - SC_PAD * 2, Math.min(flair.h, footY - y), accent);
    y += flair.h;
  }
  // a milestone, how long it took
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  let left = '';
  if (me && typeof playerMilestones === 'function' && typeof milestoneText === 'function') {
    const hits = playerMilestones(me).byPlay.get(play);
    if (hits && hits.length) left = `${String(me).split(/\s/)[0]}’s ${milestoneText(hits[0], true).replace(/^Your /, '')} game`;
  }
  const mins = Number(play.d) || 0;
  const right = mins ? `${mins >= 60 ? `${Math.floor(mins / 60)} h ` : ''}${mins % 60 ? `${mins % 60} min` : ''}`.trim() : '';
  return _scFinish(cv, y, left, right, accent);
}
// What goes with the picture as text: the game, the result, the link.
function shareTextPlay(bggId, play) {
  const game = findGameByBggId(Number(bggId)) || { name: `Game #${bggId}` };
  const res = _scResult(bggId, play);
  const scores = _scRanked(bggId, play).filter(s => s.v != null);
  const shared = scores.length > 1 && scores.every(s => s.v === scores[0].v);
  const lines = [`${game.name} · ${_scDate(play.date)}${play.l ? ` · ${play.l}` : ''}`];
  if (play.b) lines.push(String(play.b).replace(/\s*／\s*/g, ' · '));
  lines.push(`${res.tone === 'loss' ? '' : '★ '}${res.text}`);
  if (scores.length && !shared) lines.push(scores.map(s => `${s.n} ${_scNum(s.v)}`).join(', '));
  lines.push(_scGameLink(bggId));
  return lines.join('\n');
}

// ── Games with a part of their own ──
// Dorfromantik: this game's score by part, and where it stands in the campaign.
SC_FLAIR[370591] = (play) => {
  if (typeof _dorfGame !== 'function') return null;
  const g = _dorfGame(play);
  if (g.total == null) return null;
  const camps = typeof _dorfCampaigns === 'function' ? _dorfCampaigns((PLAY_HISTORY[370591] || []).filter(p => (p.sc || []).some(s => (play.sc || []).some(x => x.n === s.n)))) : [];
  const camp = camps.find(c => c.games.some(x => x.p === play));
  const high = camp ? Math.max(...camp.games.map(x => x.total || 0)) : g.total;
  const parts = [['Tasks', g.tasks, '#6aa84f'], ['Flags', g.flags, '#e0b84a'], ['Track & Stream', g.long, '#5b9bd5'], ['Unlocked', g.open, '#d46a8a']].filter(p => p[1] > 0);
  return {
    title: `${g.n ? `Game ${g.n} of the campaign` : 'The campaign'}${g.total >= high && camp && camp.games.length > 1 ? ' · a new high score' : high > g.total ? ` · high score ${_scNum(high)}` : ''}`,
    h: 170,
    draw(ctx, x, y, w) {
      const sum = parts.reduce((a, p) => a + p[1], 0) || 1;
      let bx = x;
      parts.forEach(([, v, c], i) => {
        const bw = w * v / sum;
        ctx.save();
        _scRound(ctx, x, y, w, 56, 18);
        ctx.clip();
        ctx.fillStyle = c;
        ctx.fillRect(bx, y, bw + (i < parts.length - 1 ? 1 : 0), 56);
        ctx.restore();
        bx += bw;
      });
      let lx = x;
      ctx.font = `600 28px ${SC_SANS}`;
      parts.forEach(([l, v, c]) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(lx + 10, y + 104, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = SC_TEXT2;
        const t = `${l} ${_scNum(v)}`;
        ctx.fillText(t, lx + 28, y + 114);
        lx += ctx.measureText(t).width + 60;
      });
      if (g.circles != null) {
        ctx.fillStyle = SC_TEXT3;
        ctx.fillText(`${g.circles} circles crossed on the Campaign sheet`, x, y + 160);
      }
    },
  };
};
// Sky Team: the flight, as a strip of a boarding pass.
SC_FLAIR[373106] = (play) => {
  if (typeof _skyTeamParse !== 'function') return null;
  const t = _skyTeamParse(play.b);
  if (!t) return null;
  const diff = t.diff || (typeof _skyTeamEasiestDiff === 'function' ? _skyTeamEasiestDiff(t.code) : '');
  const ap = (typeof SKY_TEAM_AIRPORTS !== 'undefined' ? SKY_TEAM_AIRPORTS : []).find(a => a.code.toUpperCase() === t.code) || {};
  const D = (typeof SKY_TEAM_DIFFS !== 'undefined' && SKY_TEAM_DIFFS[diff]) || { label: diff || '', color: '#e8b04b' };
  const landed = (play.sc || []).some(s => s.w);
  return {
    title: 'Boarding pass', h: 190,
    draw(ctx, x, y, w) {
      _scRound(ctx, x, y, w, 180, 24);
      ctx.fillStyle = '#f3ead8';
      ctx.fill();
      ctx.fillStyle = '#2a2118';
      ctx.font = `800 96px ${SC_SANS}`;
      ctx.fillText(t.code, x + 36, y + 110);
      const cw = ctx.measureText(t.code).width;
      ctx.font = `600 30px ${SC_SANS}`;
      ctx.fillStyle = '#5a4a36';
      ctx.fillText(_scFit(ctx, ap.name || '', w - cw - 340), x + 60 + cw, y + 104);
      ctx.font = `700 30px ${SC_SANS}`;
      ctx.fillStyle = D.color;
      ctx.textAlign = 'right';
      ctx.fillText(D.label, x + w - 36, y + 66);
      ctx.fillStyle = landed ? '#2e8b57' : '#b23b3b';
      ctx.fillText(landed ? 'Landed ✓' : 'Didn’t land', x + w - 36, y + 120);
      ctx.textAlign = 'left';
      ctx.font = `600 24px ${SC_SANS}`;
      ctx.fillStyle = '#8a7a64';
      ctx.fillText('SKY TEAM · ' + (play.sc || []).map(s => String(s.n).split(/\s/)[0].toUpperCase()).join(' & '), x + 36, y + 158);
    },
  };
};
// Welcome to the Moon: the Adventure.
SC_FLAIR[339789] = (play) => {
  if (typeof moonAdventureOf !== 'function') return null;
  const n = moonAdventureOf(play);
  if (!n || typeof MOON_ADV === 'undefined') return null;
  return {
    title: '', h: 130,
    draw(ctx, x, y, w, h, accent) {
      ctx.font = `700 64px ${SC_SERIF}`;
      ctx.fillStyle = accent;
      ctx.fillText(_scFit(ctx, `Adventure #${n} · ${MOON_ADV[n - 1][0]}`, w), x, y + 66);
      ctx.font = `500 30px ${SC_SANS}`;
      ctx.fillStyle = SC_TEXT3;
      ctx.fillText(`${n} of the 8 Adventures, from the Earth to the stars`, x, y + 116);
    },
  };
};
// Hanabi: the fireworks, as big as the score.
SC_FLAIR[98778] = (play) => {
  const v = Math.max(...(play.sc || []).map(_scScore).filter(x => x != null), -Infinity);
  if (!isFinite(v)) return null;
  const says = typeof _hanabiSays === 'function' ? _hanabiSays(v) : '';
  return {
    title: '', h: 220,
    draw(ctx, x, y, w) {
      const cols = ['#f0544f', '#f5c242', '#4fb3f0', '#5ad68a', '#f4ece1'];
      const r = 30 + v / 25 * 70;
      const cx = x + 110, cy = y + 110;
      cols.forEach((c, k) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          const a = (k * 4 + i) / 20 * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3);
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.stroke();
        }
      });
      ctx.font = `800 80px ${SC_SANS}`;
      ctx.fillStyle = SC_TEXT;
      ctx.fillText(`${_scNum(v)}`, x + 250, y + 100);
      const vw = ctx.measureText(`${_scNum(v)}`).width;
      ctx.font = `600 36px ${SC_SANS}`;
      ctx.fillStyle = SC_TEXT3;
      ctx.fillText('/ 25', x + 262 + vw, y + 100);
      ctx.font = `italic 500 30px ${SC_SERIF}`;
      ctx.fillStyle = SC_TEXT2;
      const ls = _scWrap(ctx, says ? `“${says[0].toUpperCase()}${says.slice(1)}.”` : '', w - 250, 2);
      ls.forEach((l, i) => ctx.fillText(l, x + 250, y + 150 + i * 40));
    },
  };
};
// ── A game: your record with it ──
async function shareCardGame(game) {
  const bggId = Number(game.bggId);
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  const all = PLAY_HISTORY[bggId] || [];
  const canon = (n) => (typeof _origCanon === 'function' ? _origCanon(n) : n);
  const isMe = (s) => me && s && (s.n === me || canon(s.n) === canon(me));
  const mine = all.filter(p => (p.sc || []).some(isMe)).slice().sort(typeof byPlayOrder === 'function' ? byPlayOrder : () => 0);
  await _scFonts(`${game.name} ${me || ''}`);
  const cv = document.createElement('canvas');
  cv.width = SC_W; cv.height = SC_H;
  const ctx = cv.getContext('2d');
  const sub = [game.year, game.designer ? `by ${game.designer}` : ''].filter(Boolean).join(' · ');
  const { accent, top } = await _scHeader(ctx, game, bggId, sub);
  let y = top;
  const tile = (x, yy, w, big, small, col) => {
    _scRound(ctx, x, yy, w, 170, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();
    ctx.font = `800 64px ${SC_SANS}`;
    ctx.fillStyle = col || SC_TEXT;
    ctx.fillText(_scFit(ctx, big, w - 50), x + 28, yy + 92);
    ctx.font = `600 26px ${SC_SANS}`;
    ctx.fillStyle = SC_TEXT3;
    ctx.fillText(_scFit(ctx, small.toUpperCase(), w - 50), x + 28, yy + 138);
  };
  const facts = [game.players ? `${String(game.players).replace(/^(\d+)-\1$/, '$1')} players` : '', typeof gameTimeText === 'function' ? gameTimeText(game) : game.playTime || '',
    game.complexity > 0 ? `weight ${Number(game.complexity).toFixed(1)}` : '', game.bggRating ? `BGG ${Number(game.bggRating).toFixed(1)}` : ''].filter(Boolean);
  let x = SC_PAD;
  for (const f of facts) { x = _scChip(ctx, f, x, y, accent) + 14; if (x > SC_W - 260) break; }
  y += 96;
  const W3 = (SC_W - SC_PAD * 2 - 40) / 3;
  if (mine.length) {
    const noRes = typeof isNoResultGame === 'function' && isNoResultGame(bggId);
    const decided = mine.filter(p => !(typeof isNoResultPlay === 'function' && isNoResultPlay(p, bggId, p.sc.find(isMe))));
    const wins = mine.filter(p => p.sc.some(s => isMe(s) && s.w)).length;
    const scores = mine.map(p => _scScore(p.sc.find(isMe))).filter(v => v != null);
    const low = typeof _recLowBest === 'function' && _recLowBest(all, false);
    const best = scores.length ? (low ? Math.min : Math.max)(...scores) : null;
    ctx.font = `700 26px ${SC_SANS}`;
    ctx.fillStyle = SC_TEXT3;
    ctx.fillText(`${String(me).toUpperCase()}’S RECORD`, SC_PAD, y + 4);
    y += 26;
    tile(SC_PAD, y, W3, String(mine.length), mine.length === 1 ? 'play' : 'plays');
    tile(SC_PAD + W3 + 20, y, W3, noRes ? '–' : decided.length ? `${Math.round(wins / decided.length * 100)}%` : '–', noRes ? 'no winners here' : `won ${wins} of ${decided.length}`, noRes ? null : SC_WIN);
    const pt = typeof playTimeOnGame === 'function' ? playTimeOnGame(bggId).players.find(p => p.name === me) : null;
    const time = pt && typeof fmtPlayTime === 'function' ? fmtPlayTime(pt.min) : '';
    // the third tile: the best score, or (a game without scores) the time at the table
    if (best != null) tile(SC_PAD + (W3 + 20) * 2, y, W3, _scNum(best), low ? 'best (lowest)' : 'best score', SC_GOLD);
    else tile(SC_PAD + (W3 + 20) * 2, y, W3, time || '–', 'at the table', SC_GOLD);
    y += 200;
    // time at the table, first and last, most played with
    const lines = [];
    if (time && best != null) lines.push(['⏱', `${time} at the table`]);
    lines.push(['📅', mine.length > 1 ? `${_scDate(mine[0].date)} → ${_scDate(mine[mine.length - 1].date)}` : `Played ${_scDate(mine[0].date)}`]);
    const withN = new Map();
    for (const p of mine) for (const s of p.sc) if (!isMe(s)) withN.set(s.n, (withN.get(s.n) || 0) + 1);
    const buddy = [...withN.entries()].sort((a, b) => b[1] - a[1])[0];
    if (buddy) lines.push(['🤝', `Most often with ${buddy[0]} (${buddy[1]}×)`]);
    const cp = typeof campaignProgress === 'function' ? campaignProgress(bggId, mine) : null;
    if (cp) lines.push(['🗺', cp.complete ? (cp.reachedText || 'Campaign finished').replace(/^✓\s*/, '') : `Campaign: ${cp.stageText}`]);
    if (bggId === 373106 && typeof _skyTeamCompleted === 'function' && typeof SKY_TEAM_AIRPORTS !== 'undefined') {
      lines.push(['✈', `${_skyTeamCompleted(mine).size} of ${SKY_TEAM_AIRPORTS.length} flights landed`]);
    }
    const rating = typeof getPlayerRating === 'function' ? getPlayerRating(me, bggId) : 0;
    if (rating) lines.push(['★', `Rated ${rating}/10`]);
    ctx.font = `500 34px ${SC_SANS}`;
    for (const [ic, t] of lines.slice(0, 6)) {
      if (y > SC_H - 230) break;
      ctx.fillStyle = accent;
      ctx.fillText(ic, SC_PAD, y + 34);
      ctx.fillStyle = SC_TEXT2;
      ctx.fillText(_scFit(ctx, t, SC_W - SC_PAD * 2 - 70), SC_PAD + 64, y + 34);
      y += 66;
    }
  } else {
    ctx.font = `600 40px ${SC_SERIF}`;
    ctx.fillStyle = SC_TEXT2;
    const ls = _scWrap(ctx, game.description || 'Not played yet.', SC_W - SC_PAD * 2, 8);
    ls.forEach((l, i) => ctx.fillText(l, SC_PAD, y + 40 + i * 56));
    y += ls.length * 56 + 60;
    if (all.length) {
      ctx.font = `600 32px ${SC_SANS}`;
      ctx.fillStyle = accent;
      ctx.fillText(`Played ${all.length} time${all.length > 1 ? 's' : ''} in our group`, SC_PAD, y);
    }
  }
  return _scFinish(cv, y, '', '', accent);
}
function shareTextGame(game) {
  return `${game.name}${game.year ? ` (${game.year})` : ''}\n${_scGameLink(game.bggId)}`;
}

// ── Sending it ──
function _scBlob(cv) {
  return new Promise((resolve) => cv.toBlob(b => resolve(b), 'image/png'));
}
const _scFileName = (name, tail) => `${String(name).replace(/[^\p{L}\p{N} -]+/gu, '').trim().replace(/\s+/g, '-') || 'game'}${tail ? `-${tail}` : ''}.png`;
// The phone's share sheet with the picture (WhatsApp, Messenger…); the text goes with it.
async function _scShare(blob, fname, text) {
  const file = new File([blob], fname, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return 'shared'; }
    catch (e) { return e && e.name === 'AbortError' ? 'cancelled' : 'failed'; }
  }
  return 'nofiles';
}
async function _scCopy(blob) {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (_) { return false; }
}
function _scSave(blob, fname) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
// The picture's part of a share sheet: a preview and the ways to send it.
function shareCardPanelHtml() {
  return `<div class="sc-prev" aria-live="polite"><span>Drawing the picture…</span></div>
    <div class="bgs-acts">
      <button type="button" class="bgs-btn bgs-main" data-sc="share" disabled>Share the picture…</button>
      <div class="sc-row">
        <button type="button" class="bgs-btn" data-sc="copy" disabled>Copy picture</button>
        <button type="button" class="bgs-btn" data-sc="save" disabled>Save picture</button>
      </div>
      <a class="bgs-btn sc-wa" data-sc="wa" target="_blank" rel="noopener">WhatsApp: the result as text</a>
    </div>
    <div class="bgs-small">Share opens your phone&rsquo;s own list: WhatsApp, Messenger, Instagram and the rest. On a computer, copy the picture and paste it into the chat.</div>`;
}
// Draw the card into a panel and wire its buttons. make() → canvas; text, fname.
async function shareCardWire(panel, make, text, fname) {
  const prev = panel.querySelector('.sc-prev');
  const btn = (k) => panel.querySelector(`[data-sc="${k}"]`);
  const wa = btn('wa');
  if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  let blob = null;
  try {
    const cv = await make();
    blob = await _scBlob(cv);
    if (!panel.isConnected) return;
    const url = URL.createObjectURL(blob);
    prev.innerHTML = `<img src="${url}" alt="The picture to share">`;
  } catch (e) {
    console.warn('Share card:', e);
    if (prev) prev.innerHTML = '<span>The picture couldn&rsquo;t be drawn here. The text link still works.</span>';
    return;
  }
  const file = new File([blob], fname, { type: 'image/png' });
  const canFiles = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  const canCopy = !!(navigator.clipboard && window.ClipboardItem);
  ['share', 'copy', 'save'].forEach(k => { const b = btn(k); if (b) b.disabled = false; });
  if (!canFiles && btn('share')) btn('share').hidden = true;
  if (!canCopy && btn('copy')) btn('copy').hidden = true;
  panel.onclick = async (e) => {
    const b = e.target.closest('[data-sc]');
    if (!b || b.disabled) return;
    const k = b.dataset.sc;
    const say = (t) => { const was = b.textContent; b.textContent = t; setTimeout(() => { b.textContent = was; }, 2200); };
    if (k === 'share') {
      const r = await _scShare(blob, fname, text);
      if (r === 'failed') say('Couldn’t share it');
    } else if (k === 'copy') {
      say(await _scCopy(blob) ? 'Copied: paste it in the chat' : 'Couldn’t copy');
    } else if (k === 'save') {
      _scSave(blob, fname);
      say('Saved');
    }
  };
}

// ── A game's share sheet (the game page's Share button) ──
function openGameShare(bggId) {
  const game = findGameByBggId(Number(bggId));
  if (!game) return;
  let ov = document.getElementById('sc-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'sc-overlay';
    ov.className = 'bgs-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
  }
  ov.innerHTML = `<div class="bgs-sheet">
      <div class="bgs-head"><span class="bgs-title">Share ${_escapeHtml(game.name)}</span><button type="button" class="bgs-x" aria-label="Close">&times;</button></div>
      <div class="sc-panel">${shareCardPanelHtml()}</div>
    </div>`;
  const close = () => {
    ov.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    ov._navClose = null;
    if (typeof navOverlayClosed === 'function') navOverlayClosed('share');
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  ov.onclick = (e) => { if (e.target === ov || e.target.closest('.bgs-x')) close(); };
  document.addEventListener('keydown', onKey);
  ov._navClose = close;
  ov.classList.add('open');
  if (typeof navOverlayOpened === 'function') navOverlayOpened('share');
  shareCardWire(ov.querySelector('.sc-panel'), () => shareCardGame(game), shareTextGame(game), _scFileName(game.name));
}
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('[data-share-game]');
  if (!b) return;
  e.stopPropagation();
  openGameShare(Number(b.dataset.shareGame));
});
