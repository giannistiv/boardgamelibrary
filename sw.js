// Service worker: lets the site install as an app and keep working offline.
//
//   pages (index.html)       network first (always revalidated), the last copy when offline
//   css / js / data (?v=…)   cache first: a stamped URL never changes
//   covers (images/)         cache first, the most recent MAX_COVERS kept
//   Firebase reads           network first, the last answer when offline
//   a shared BGStats export  kept for the page, which imports it (boot.js)
//   everything else          straight to the network
//
// Installing precaches index.html and every stamped asset it references, so
// the app opens offline after the first visit. Each new index.html prunes the
// asset versions it no longer uses.
const SHELL = 'bgl-shell';
const ASSETS = 'bgl-assets';
const COVERS = 'bgl-covers-2';   // a new name when a cover file changes: every phone fetches covers again
const DATA = 'bgl-data';
const SHARED = 'bgl-shared';     // a file shared to the app from BGStats, until the page takes it
const MAX_COVERS = 600;
const FIREBASE = 'firebasedatabase.app';

const assetUrls = (html) => {
  const out = new Set();
  const re = /(?:src|href)="([^"]+\?v=[^"]+)"/g;
  let m;
  while ((m = re.exec(html))) out.add(new URL(m[1], self.registration.scope).href);
  return out;
};

// Keep `res` (a fresh index.html) as the offline page, and bring the asset
// cache in line with what it references.
async function storeShell(res) {
  const html = await res.clone().text();
  const shell = await caches.open(SHELL);
  await shell.put('./', res);
  const wanted = assetUrls(html);
  const assets = await caches.open(ASSETS);
  for (const req of await assets.keys()) if (!wanted.has(req.url)) await assets.delete(req);
  const have = new Set((await assets.keys()).map(r => r.url));
  await Promise.all([...wanted].filter(u => !have.has(u)).map(u => assets.add(u).catch(() => {})));
}

async function refreshShell() {
  const res = await fetch('./', { cache: 'no-cache' });
  if (res.ok) await storeShell(res);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // take over within seconds (a shared file must reach the newest version);
  // whatever isn't precached by then is cached as it's used
  event.waitUntil(Promise.race([refreshShell().catch(() => {}), new Promise(r => setTimeout(r, 4000))]));
});

self.addEventListener('activate', (event) => {
  // drop caches this version no longer uses (an older covers cache)
  event.waitUntil((async () => {
    const keep = new Set([SHELL, ASSETS, COVERS, DATA, SHARED]);
    for (const name of await caches.keys()) if (name.startsWith('bgl-') && !keep.has(name)) await caches.delete(name);
    await self.clients.claim();
  })());
});

async function trimCovers() {
  const cache = await caches.open(COVERS);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_COVERS; i++) await cache.delete(keys[i]);
}

async function cacheFirst(cacheName, req, after) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) { await cache.put(req, res.clone()); if (after) after(); }
  return res;
}

async function networkFirst(cacheName, req, key) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) await cache.put(key || req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(key || req);
    if (hit) return hit;
    throw e;
  }
}

// Chrome on Android can hand the worker an empty FormData although the body
// holds the file: take the parts out of the body itself.
function multipartParts(buf, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!m) return [];
  const bnd = new TextEncoder().encode('--' + (m[1] || m[2]).trim());
  const bytes = new Uint8Array(buf);
  const at = [];
  for (let i = 0; i <= bytes.length - bnd.length; i++) {
    let j = 0;
    while (j < bnd.length && bytes[i + j] === bnd[j]) j++;
    if (j === bnd.length) { at.push(i); i += bnd.length - 1; }
  }
  const parts = [];
  for (let k = 0; k < at.length - 1; k++) {
    let start = at[k] + bnd.length;
    if (bytes[start] === 13 && bytes[start + 1] === 10) start += 2;
    const end = at[k + 1] - 2;   // the CRLF before the next boundary
    let h = -1;
    for (let i = start; i + 3 < end; i++) {
      if (bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10) { h = i; break; }
    }
    if (h < 0) continue;
    const head = new TextDecoder().decode(bytes.subarray(start, h));
    parts.push({
      name: (/name="([^"]*)"/i.exec(head) || [])[1] || '',
      filename: (/filename="([^"]*)"/i.exec(head) || [])[1],
      type: ((/content-type:\s*([^\r\n]+)/i.exec(head) || [])[1] || '').trim(),
      body: bytes.slice(h + 4, Math.max(h + 4, end)),
    });
  }
  return parts;
}

// Sharing a file to the installed app (manifest share_target) arrives as a
// form POST: keep the file (whatever field it came in), then open the app,
// which imports it. What arrived is noted too, so the app can say what went
// wrong when there's no file.
async function receiveShare(req) {
  const cache = await caches.open(SHARED);
  const type = req.headers.get('content-type') || '';
  const raw = req.clone();
  const isPlayFile = (t) => /^\s*\{[\s\S]*"plays"/.test(t);
  let note = '', file = null;
  try {
    const entries = [...(await req.formData()).entries()];
    note = entries.map(([k, v]) => typeof v === 'string' ? `${k}: ${v.length} characters` : `${k}: ${v.type || 'no type'}, ${v.name || 'no name'}, ${v.size} bytes`).join('; ')
      || `empty form (${type.split(';')[0] || 'no content type'})`;
    file = entries.map(e => e[1]).find(v => v && typeof v !== 'string' && v.size > 0) || null;
    // some apps share a file's contents as text: a BGStats file is JSON with plays in it
    const text = file ? null : entries.map(e => e[1]).find(v => typeof v === 'string' && isPlayFile(v));
    if (text) file = new File([text], 'shared.bgsplay', { type: 'application/json' });
  } catch (e) {
    note = `the form couldn't be read (${e && e.message})`;
  }
  if (!file) {
    try {
      const buf = await raw.arrayBuffer();
      const parts = multipartParts(buf, type);
      note += `; body ${buf.byteLength} bytes, ${parts.length} part${parts.length !== 1 ? 's' : ''}`;
      const filePart = parts.find(p => p.filename !== undefined && p.body.length);
      const textPart = parts.find(p => p.filename === undefined && isPlayFile(new TextDecoder().decode(p.body)));
      if (filePart) file = new File([filePart.body], filePart.filename || 'shared.bgsplay', { type: filePart.type || 'application/octet-stream' });
      else if (textPart) file = new File([textPart.body], 'shared.bgsplay', { type: 'application/json' });
      if (file) note += ' (read from the body)';
    } catch (e) {
      note += `; the body couldn't be read (${e && e.message})`;
    }
  }
  try {
    if (file) {
      await cache.put('./shared-file', new Response(file, { headers: {
        'Content-Type': file.type || 'application/json',
        'X-File-Name': encodeURIComponent(file.name || 'shared.json'),
        'X-Share-Note': encodeURIComponent(note),
      } }));
    } else {
      await cache.put('./shared-note', new Response('', { headers: { 'X-Share-Note': encodeURIComponent(note) } }));
    }
  } catch (e) { /* the app opens anyway */ }
  return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method === 'POST' && url.origin === location.origin && url.pathname.endsWith('/share-target')) {
    event.respondWith(receiveShare(req));
    return;
  }
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate' && url.origin === location.origin) {
    event.respondWith((async () => {
      try {
        // Ask the server every time (a quick "not modified" when nothing
        // changed): GitHub lets browsers reuse a page for 10 minutes, which
        // would hide an update that long.
        const res = await fetch(req, { cache: 'no-cache' });
        if (res.ok) event.waitUntil(storeShell(res.clone()).catch(() => {}));
        return res;
      } catch (e) {
        return (await caches.match('./', { cacheName: SHELL })) || Response.error();
      }
    })());
    return;
  }
  if (url.origin === location.origin) {
    if (url.searchParams.has('v')) { event.respondWith(cacheFirst(ASSETS, req)); return; }
    if (url.pathname.includes('/images/')) { event.respondWith(cacheFirst(COVERS, req, trimCovers)); return; }
    return;
  }
  if (url.hostname.endsWith(FIREBASE) && url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(DATA, req));
  }
});
