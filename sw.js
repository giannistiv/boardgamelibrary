// Service worker: lets the site install as an app and keep working offline.
//
//   pages (index.html)       network first (always revalidated), the last copy when offline
//   css / js / data (?v=…)   cache first: a stamped URL never changes
//   covers (images/)         cache first, the most recent MAX_COVERS kept
//   Firebase reads           network first, the last answer when offline
//   everything else          straight to the network
//
// Installing precaches index.html and every stamped asset it references, so
// the app opens offline after the first visit. Each new index.html prunes the
// asset versions it no longer uses.
const SHELL = 'bgl-shell';
const ASSETS = 'bgl-assets';
const COVERS = 'bgl-covers-2';   // a new name when a cover file changes: every phone fetches covers again
const DATA = 'bgl-data';
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
  event.waitUntil(refreshShell().catch(() => {}));
});

self.addEventListener('activate', (event) => {
  // drop caches this version no longer uses (an older covers cache)
  event.waitUntil((async () => {
    const keep = new Set([SHELL, ASSETS, COVERS, DATA]);
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

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
