// ── Notifications for Board Game Library (Web Push) ──
// Who wants them: each phone or browser that turned them on, kept in the PUSH
// KV store as sub:{uid}:{hash of its endpoint} → { sub, at }. Who's asking is
// proved with their Firebase sign-in token (checked against Google's keys).
// A notification is encrypted for its browser (RFC 8291, aes128gcm) and
// signed with the site's VAPID key (VAPID_PRIVATE secret, VAPID_PUBLIC var).

const SITE = 'https://giannistiv.github.io/boardgamelibrary/';
const enc = (s) => new TextEncoder().encode(s);

// ── base64url ──
export function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function unb64url(str) {
  const s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
}
async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data));
}

// ── Who's asking: a Firebase ID token, checked with Google's public keys ──
let _jwks = { at: 0, keys: [] };
async function googleKeys() {
  if (Date.now() - _jwks.at < 3600 * 1000 && _jwks.keys.length) return _jwks.keys;
  const res = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  _jwks = { at: Date.now(), keys: ((await res.json()).keys) || [] };
  return _jwks.keys;
}
export async function verifyIdToken(token, project) {
  const [h, p, s] = String(token || '').split('.');
  if (!h || !p || !s) throw new Error('Sign in first.');
  let head, body;
  try {
    head = JSON.parse(new TextDecoder().decode(unb64url(h)));
    body = JSON.parse(new TextDecoder().decode(unb64url(p)));
  } catch (_) { throw new Error('Sign in first.'); }
  const now = Date.now() / 1000;
  if (head.alg !== 'RS256' || body.aud !== project || body.iss !== `https://securetoken.google.com/${project}`
    || !body.sub || body.exp < now || body.iat > now + 300) throw new Error('The sign-in has expired: open the app again.');
  const jwk = (await googleKeys()).find(k => k.kid === head.kid);
  if (!jwk) throw new Error('Unknown sign-in key.');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, unb64url(s), enc(`${h}.${p}`)))) throw new Error('Bad sign-in.');
  return body.sub;
}

// ── Sending one: VAPID signature + aes128gcm encryption ──
export async function vapidAuth(endpoint, env) {
  const head = b64url(enc(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const body = b64url(enc(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || SITE })));
  const key = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVATE), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc(`${head}.${body}`)));
  return `vapid t=${head}.${body}.${b64url(sig)}, k=${env.VAPID_PUBLIC}`;
}
export async function encryptPayload(p256dh, auth, text) {
  const uaPublic = unb64url(p256dh), authSecret = unb64url(auth);
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, pair.privateKey, 256));
  const prkKey = await hmac(authSecret, shared);
  const ikm = await hmac(prkKey, concat(enc('WebPush: info\0'), uaPublic, asPublic, new Uint8Array([1])));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(enc('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(enc('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, concat(enc(text), new Uint8Array([2]))));
  const head = new Uint8Array(16 + 4 + 1 + asPublic.length);
  head.set(salt, 0);
  new DataView(head.buffer).setUint32(16, 4096);
  head[20] = asPublic.length;
  head.set(asPublic, 21);
  return concat(head, cipher);
}
async function sendOne(sub, msg, env) {
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { TTL: '86400', Urgency: 'normal', 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', Authorization: await vapidAuth(sub.endpoint, env) },
    body: await encryptPayload(sub.keys.p256dh, sub.keys.auth, JSON.stringify(msg)),
  });
  return res.status;
}

// ── People's phones and browsers ──
async function endpointKey(uid, endpoint) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc(endpoint)));
  return `sub:${uid}:${[...h.slice(0, 12)].map(b => b.toString(16).padStart(2, '0')).join('')}`;
}
// Send to every device of one person; a device that's gone away is forgotten.
export async function notifyUser(env, uid, msg) {
  const list = await env.PUSH.list({ prefix: `sub:${uid}:` });
  let sent = 0;
  for (const k of list.keys) {
    const rec = await env.PUSH.get(k.name, 'json');
    if (!rec || !rec.sub) continue;
    try {
      const st = await sendOne(rec.sub, msg, env);
      if (st === 404 || st === 410) await env.PUSH.delete(k.name);
      else if (st >= 200 && st < 300) sent++;
    } catch (_) { /* one device failing doesn't stop the rest */ }
  }
  return sent;
}

async function fbGet(env, path) {
  const res = await fetch(`${env.FIREBASE_DB}/${path}.json`);
  return res.ok ? res.json() : null;
}
const keyOf = (name) => String(name).replace(/[.#$[\]/]/g, '_');
const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

export async function handlePush(action, request, env) {
  if (!env.VAPID_PRIVATE || !env.VAPID_PUBLIC) return { status: 500, body: { error: 'Notifications aren\'t set up yet.' } };
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const uid = await verifyIdToken(token, env.FIREBASE_PROJECT);
  const data = await request.json().catch(() => ({}));
  if (action === 'subscribe') {
    const sub = data.subscription;
    if (!sub || !/^https:\/\//.test(sub.endpoint || '') || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return { status: 400, body: { error: 'Not a push subscription.' } };
    await env.PUSH.put(await endpointKey(uid, sub.endpoint), JSON.stringify({ sub: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, at: Date.now() }));
    return { status: 200, body: { ok: true } };
  }
  if (action === 'unsubscribe') {
    if (data.endpoint) await env.PUSH.delete(await endpointKey(uid, data.endpoint));
    return { status: 200, body: { ok: true } };
  }
  if (action === 'test') {
    const sent = await notifyUser(env, uid, { title: 'Board Game Library', body: 'Notifications are on. You\'ll hear when someone logs a play with you.', url: SITE, tag: 'test' });
    return { status: 200, body: { sent } };
  }
  if (action === 'play') {
    // a play just logged: everyone else in it who has an account hears about it, once
    const id = clip(data.id, 40);
    if (!/^[-\w]+$/.test(id)) return { status: 400, body: { error: 'Which play?' } };
    if (await env.PUSH.get(`told:${id}`)) return { status: 200, body: { sent: 0, already: true } };
    const play = await fbGet(env, `plays/${id}`);
    if (!play || play.by !== uid) return { status: 403, body: { error: 'Only whoever logged the play can announce it.' } };
    const [claims, users] = await Promise.all([fbGet(env, 'playerClaims'), fbGet(env, 'users')]);
    const from = clip((users && users[uid] && users[uid].name) || 'Someone', 40);
    const sc = Array.isArray(play.sc) ? play.sc : Object.values(play.sc || {});
    const winners = sc.filter(s => s && s.w).map(s => s.n);
    const result = winners.length === sc.length && sc.length > 1 ? 'You all won.'
      : winners.length ? `${winners.slice(0, 2).join(' and ')} won.` : 'The game won.';
    const game = clip(data.game, 80) || 'a game';
    let sent = 0;
    const told = new Set([uid]);
    for (const s of sc) {
      const to = s && claims && claims[keyOf(s.n)];
      if (!to || told.has(to)) continue;
      told.add(to);
      sent += await notifyUser(env, to, {
        title: `${from} logged ${game}`,
        body: `With you${play.date ? `, ${new Date(play.date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}. ${result} Tap to see it and rate the game.`,
        url: `${SITE}?go=game:${Number(play.bggId)}`, tag: `play-${id}`,
      });
    }
    await env.PUSH.put(`told:${id}`, '1', { expirationTtl: 30 * 86400 });
    return { status: 200, body: { sent } };
  }
  return { status: 404, body: { error: 'Not found' } };
}

// ── Every morning: campaigns ending, backed games due ──
async function once(env, key, ttl, fn) {
  if (await env.PUSH.get(key)) return;
  await fn();
  await env.PUSH.put(key, '1', { expirationTtl: ttl });
}
export async function daily(env) {
  if (!env.VAPID_PRIVATE) return;
  const backing = (await fbGet(env, 'backing')) || {};
  // BGG's latest release months for backed games (tools/fetch-hot.py)
  let fresh = {};
  try {
    const src = await (await fetch(`${SITE}data/bgg-hot.js`, { cf: { cacheTtl: 3600 } })).text();
    fresh = (JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1)).backed) || {};
  } catch (_) { /* the saved months will do */ }
  // backings given as a list (data/backed.js), until their backer changes one in the app
  try {
    const src = await (await fetch(`${SITE}data/backed.js`, { cf: { cacheTtl: 3600 } })).text();
    const fixed = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
    const users = (await fbGet(env, 'users')) || {};
    for (const [player, list] of Object.entries(fixed)) {
      const uid = Object.keys(users).find(u => users[u] && users[u].player === player);
      if (!uid || !Array.isArray(list)) continue;
      for (const f of list) {
        const people = (backing[f.id] = backing[f.id] || {});
        if (!people[uid]) people[uid] = { s: 'backed', name: f.name, relMine: f.rel };
      }
    }
  } catch (_) { /* the ones in Firebase still go */ }
  const now = Date.now();
  const d = new Date();
  const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  for (const [gid, people] of Object.entries(backing)) {
    for (const [uid, e] of Object.entries(people || {})) {
      if (!e || !e.s) continue;
      if (e.s === 'interested' && e.ends) {
        const left = Date.parse(e.ends) - now;
        if (left > 0 && left < 30 * 3600 * 1000) {
          const hours = Math.max(1, Math.round(left / 3600000));
          await once(env, `sent:${uid}:${gid}:ends`, 10 * 86400, () => notifyUser(env, uid, {
            title: clip(e.name, 80), body: `Its campaign ends in ${hours} hour${hours !== 1 ? 's' : ''}. You marked it Interested.`,
            url: `${SITE}?go=hot:${gid}`, tag: `ends-${gid}`,
          }));
        }
      }
      if (e.s === 'backed' && !e.arrived) {
        const rel = e.relMine || (fresh[gid] && fresh[gid].rel) || e.rel || '';
        if (rel === ym) {
          await once(env, `sent:${uid}:${gid}:due:${ym}`, 40 * 86400, () => notifyUser(env, uid, {
            title: clip(e.name, 80), body: `Due this month, by ${e.relMine ? 'its estimate' : 'BGG\'s date'}. When it arrives, mark it in Backed.`,
            url: `${SITE}?go=backed`, tag: `due-${gid}`,
          }));
        }
      }
    }
  }
}
