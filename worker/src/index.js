// ── BGG search for Board Game Library (a Cloudflare Worker) ──
// The app can't ask BoardGameGeek itself: BGG's XML API needs a token, which
// must stay secret, and its pages don't answer other sites' requests. This
// small service holds the token (the BGG_TOKEN secret) and answers the
// site's two questions:
//   GET /search?q=brass   → { results: [{ id, name, year, exp, img, players, time, rated }] }
//   GET /thing?id=1,2     → { items: [{ id, name, year, exp, img, image, players, playTime, weight, rating, rated, designers, mechanics, categories }] }
// Only the site's own pages may use it (ALLOWED_ORIGINS). Answers are kept
// for a day, so the same search doesn't ask BGG again.
//
// It also sends the app's notifications (Web Push, ./push.js):
//   POST /push/subscribe   { subscription }   a phone or browser that wants them
//   POST /push/unsubscribe { endpoint }
//   POST /push/play        { id, game }       a play was just logged: tell the others in it
//   POST /push/test                           "notifications are on"
// each with the person's Firebase sign-in token, and every morning (the cron
// trigger) it tells people about campaigns they watch ending and backed games
// due that month.
import { handlePush, daily } from './push.js';

const BGG = 'https://boardgamegeek.com/xmlapi2/';
const DAY = 86400;
const memo = new Map();   // url → { at, body }: this instance's answers

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const cors = allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : null;
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: cors ? 204 : 403, headers: { ...(cors || {}), 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': String(DAY) } });
    }
    if (!cors) return json({ error: 'Only Board Game Library can use this.' }, 403);
    if (url.pathname.startsWith('/push/')) {
      if (request.method !== 'POST') return json({ error: 'POST only' }, 405, cors);
      try {
        const { status, body } = await handlePush(url.pathname.slice(6), request, env);
        return json(body, status, cors, true);
      } catch (e) {
        const msg = String(e && e.message || e);
        return json({ error: msg }, /sign/i.test(msg) ? 401 : 500, cors, true);
      }
    }
    if (request.method !== 'GET') return json({ error: 'GET only' }, 405, cors);
    if (!env.BGG_TOKEN) return json({ error: 'The BGG token is missing (wrangler secret put BGG_TOKEN).' }, 500, cors);

    const key = url.pathname + url.search;
    const kept = memo.get(key);
    if (kept && Date.now() - kept.at < DAY * 1000) return json(kept.body, 200, cors);
    try {
      let body;
      if (url.pathname === '/search') {
        const q = (url.searchParams.get('q') || '').trim();
        if (q.length < 2 || q.length > 100) return json({ error: 'Search for 2 to 100 characters.' }, 400, cors);
        body = { results: await search(q, env) };
      } else if (url.pathname === '/thing') {
        const ids = (url.searchParams.get('id') || '').split(',').map(s => s.trim()).filter(s => /^\d{1,7}$/.test(s)).slice(0, 20);
        if (!ids.length) return json({ error: 'Which game? (id=…)' }, 400, cors);
        body = { items: await things(ids, env) };
      } else {
        return json({ error: 'Not found' }, 404, cors);
      }
      if (memo.size > 500) memo.clear();
      memo.set(key, { at: Date.now(), body });
      return json(body, 200, cors);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 502, cors);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(daily(env));
  },
};

function json(body, status, cors, noStore) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': status === 200 && !noStore ? `public, max-age=${DAY}` : 'no-store', ...(cors || {}) },
  });
}

async function bgg(path, env) {
  for (let tries = 0; tries < 3; tries++) {
    const res = await fetch(BGG + path, { headers: { Authorization: `Bearer ${env.BGG_TOKEN}`, 'User-Agent': 'BoardGameLibrary/1.0 (giannistiv.github.io)' } });
    if (res.status === 202 || res.status === 429 || res.status >= 500) {   // BGG is busy or still preparing: wait and ask again
      await new Promise(r => setTimeout(r, 900 * (tries + 1)));
      continue;
    }
    if (res.status === 401) throw new Error('BGG refused the token');
    if (!res.ok) throw new Error(`BGG answered ${res.status}`);
    return res.text();
  }
  throw new Error('BGG is busy: try again in a moment');
}

// ── Reading BGG's XML ──
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
export function unxml(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, e) => ENT[e]);
}
const attr = (xml, tag, extra = '') => {
  const m = new RegExp(`<${tag}\\b${extra}[^>]*\\bvalue="([^"]*)"`).exec(xml);
  return m ? unxml(m[1]) : '';
};
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
export function items(xml) {
  const out = [];
  const re = /<item\b([^>]*)>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const id = /\bid="(\d+)"/.exec(m[1]);
    const type = /\btype="([^"]+)"/.exec(m[1]);
    if (id) out.push({ id: Number(id[1]), type: type ? type[1] : '', xml: m[2] });
  }
  return out;
}
const range = (a, b, unit = '') => (a && b && a !== b ? `${a}-${b}${unit}` : a || b ? `${a || b}${unit}` : '');

export function parseThing(it) {
  const x = it.xml;
  const links = (type) => [...x.matchAll(new RegExp(`<link type="${type}"[^>]*\\bvalue="([^"]*)"`, 'g'))].map(m => unxml(m[1]));
  const tag = (t) => { const m = new RegExp(`<${t}>\\s*([^<]+?)\\s*</${t}>`).exec(x); return m ? unxml(m[1]) : ''; };
  const minp = num(attr(x, 'minplayers')), maxp = num(attr(x, 'maxplayers'));
  const mint = num(attr(x, 'minplaytime')), maxt = num(attr(x, 'maxplaytime')) || num(attr(x, 'playingtime'));
  return {
    id: it.id,
    name: attr(x, 'name', ' type="primary"') || attr(x, 'name'),
    year: num(attr(x, 'yearpublished')) || null,
    exp: it.type === 'boardgameexpansion',
    img: tag('thumbnail'),
    image: tag('image'),
    players: range(minp, maxp),
    playTime: range(mint, maxt, ' min'),
    weight: Math.round(num(attr(x, 'averageweight')) * 100) / 100,
    rating: Math.round(num(attr(x, 'average')) * 10) / 10,
    rated: num(attr(x, 'usersrated')),
    designers: links('boardgamedesigner').slice(0, 4),
    mechanics: links('boardgamemechanic'),
    categories: links('boardgamecategory'),
  };
}

async function things(ids, env) {
  const xml = await bgg(`thing?id=${ids.join(',')}&stats=1`, env);
  return items(xml).map(parseThing);
}

// The closest names first (the same name, then names starting with it,
// then a word starting with it), base games before expansions, then the
// games most people have rated.
export function lexicalTier(name, q) {
  const n = name.toLowerCase(), s = q.toLowerCase();
  if (n === s) return 0;
  if (n.startsWith(s)) return 1;
  if (n.split(/[\s:–—-]+/).some(w => w.startsWith(s))) return 2;
  return 3;
}

async function search(q, env) {
  const xml = await bgg(`search?query=${encodeURIComponent(q)}&type=boardgame,boardgameexpansion`, env);
  // an expansion comes back twice (as a game and as an expansion): one entry, marked an expansion
  const byId = new Map();
  for (const it of items(xml)) {
    const g = byId.get(it.id) || { id: it.id, name: '', year: null, exp: false };
    g.name = g.name || attr(it.xml, 'name', ' type="primary"') || attr(it.xml, 'name');
    g.year = g.year || num(attr(it.xml, 'yearpublished')) || null;
    g.exp = g.exp || it.type === 'boardgameexpansion';
    byId.set(it.id, g);
  }
  const found = [...byId.values()].filter(g => g.name);
  found.sort((a, b) => (lexicalTier(a.name, q) - lexicalTier(b.name, q)) || (a.exp - b.exp) || a.name.localeCompare(b.name));
  // the 40 closest get their cover, players, time and how many have rated them
  const top = found.slice(0, 40);
  const details = new Map();
  for (let i = 0; i < top.length; i += 20) {
    try { for (const t of await things(top.slice(i, i + 20).map(g => String(g.id)), env)) details.set(t.id, t); } catch (_) { break; }
  }
  return top.map(g => {
    const d = details.get(g.id) || {};
    return { ...g, exp: d.id ? d.exp : g.exp, img: d.img || '', players: d.players || '', time: d.playTime || '', rated: d.rated || 0 };
  }).sort((a, b) => (lexicalTier(a.name, q) - lexicalTier(b.name, q)) || (a.exp - b.exp) || (b.rated - a.rated) || a.name.localeCompare(b.name));
}
