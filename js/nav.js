// ── App shell navigation ──
// Four destinations — Library, Explore, Ranks, You — in the top bar on wide
// screens and a bottom tab bar on phones (same buttons; CSS moves them).
// A row of sub-tabs under the bar switches between the views that belong
// together:
//   Library  → our shelf · Ilioupoli (members)
//   Explore  → Games · Tonight · Players · Stats · Trending (Board South)
//   Ranks    → Leaderboard · Hours · Board South (regulars)
//   You      → Profile · Achievements · Challenges
// The views and their switchTo…() functions are unchanged; this module only
// calls them and mirrors whichever view is open (a MutationObserver keeps it
// in sync however a view got opened: a link, the back button, a modal…).

const NAV_ICONS = {
  library: '<svg viewBox="0 0 24 24"><path d="M4 19V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v14M8 19V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12M13.4 6.6l1.9-.5a1 1 0 0 1 1.2.7l3 11.3M3 20h18"/></svg>',
  explore: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
  ranks: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4v3h-4z"/></svg>',
  you: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
};
const NAV_ITEMS = [
  ['library', 'Library'], ['explore', 'Explore'], ['ranks', 'Ranks'], ['you', 'You'],
];
let _navLastExploreTab = 'games';

function _navPlayer() {
  const raw = localStorage.getItem('bgl-player');
  return raw ? (NAME_MAP[raw] || raw) : null;
}

const _navIsOpen = (id) => { const el = document.getElementById(id); return !!(el && el.classList.contains('open')); };

// Which destination (and which sub-tab) the open view belongs to.
function _navState() {
  const lib = document.getElementById('library-view');
  if (lib && lib.style.display !== 'none' && !document.querySelector('.stats-view.open')) return { group: 'library', sub: 'shelf' };
  if (_navIsOpen('ilioupoli-view')) return { group: 'library', sub: 'ilioupoli' };
  if (_navIsOpen('games-view')) return { group: 'explore', sub: (typeof _exploreTab !== 'undefined' ? _exploreTab : 'games') };
  if (_navIsOpen('leaderboard-view')) return { group: 'ranks', sub: _ranksTab === 'hours' ? 'hours' : 'everyone' };
  if (_navIsOpen('boardsouth-view')) return { group: 'ranks', sub: 'boardsouth' };
  if (_navIsOpen('stats-view')) {
    const visiting = typeof _viewingProfile !== 'undefined' && _viewingProfile;
    if (visiting) {
      const src = typeof _statsViewSource !== 'undefined' ? _statsViewSource : null;
      return { group: src === 'insights' ? 'explore' : 'ranks', sub: '', visiting: true };
    }
    return { group: 'you', sub: 'profile' };
  }
  if (_navIsOpen('achievements-view')) return { group: 'you', sub: 'achievements' };
  if (_navIsOpen('challenges-view')) return { group: 'you', sub: 'challenges' };
  return { group: 'library', sub: 'shelf' };
}

function _navSubItems(group) {
  const me = _navPlayer();
  if (group === 'library') {
    return (me && typeof ILIOUPOLI_MEMBERS !== 'undefined' && ILIOUPOLI_MEMBERS.has(me))
      ? [['shelf', 'Our shelf'], ['ilioupoli', 'Ilioupoli']] : [];
  }
  if (group === 'explore') {
    const items = [['games', 'Games'], ['tonight', 'Tonight'], ['players', 'Players'], ['stats', 'Stats']];
    return typeof trendingAllowed === 'function' && trendingAllowed() ? items.concat([['trending', 'Trending']]) : items;
  }
  if (group === 'ranks') {
    const bs = typeof _activeBoardSouthVoter === 'function' ? _activeBoardSouthVoter() : null;
    return [['everyone', 'Leaderboard'], ['hours', 'Hours']].concat(bs ? [['boardsouth', 'Board South']] : []);
  }
  if (group === 'you') return me ? [['profile', 'Profile'], ['achievements', 'Achievements'], ['challenges', 'Challenges']] : [];
  return [];
}

function _navGo(group, sub) {
  if (group === 'library') return sub === 'ilioupoli' ? switchToIlioupoli() : switchToLibrary();
  if (group === 'tonight') return _navGo('explore', 'tonight');
  if (group === 'explore') {
    const tab = sub || _navLastExploreTab || 'games';
    const alreadyThere = _navIsOpen('games-view');
    _exploreTab = tab;
    return alreadyThere ? showGamesView() : switchToGames();
  }
  if (group === 'ranks') {
    if (sub === 'boardsouth') return switchToBoardSouth();
    if (sub) _ranksTab = sub === 'hours' ? 'hours' : 'elo';
    return switchToLeaderboard();
  }
  if (group === 'you') {
    if (sub === 'achievements') return switchToAchievements();
    if (sub === 'challenges') return switchToChallenges();
    if (typeof _viewingProfile !== 'undefined') { _viewingProfile = null; _statsViewSource = null; }
    return switchToStats();
  }
}

function _navRenderMe() {
  const btn = document.getElementById('appbar-me');
  if (!btn) return;
  const me = _navPlayer();
  btn.innerHTML = me
    ? `<span class="appbar-avatar">${avatarInner(me)}</span><span class="appbar-me-name">${_escapeHtml(me)}</span>`
    : '<span class="appbar-avatar">?</span><span class="appbar-me-name">Who are you?</span>';
  btn.setAttribute('aria-label', me ? `Your profile (${me})` : 'Pick your player');
}

// Phone layout (tabs at the bottom) below 900 px, and always for the
// zoomed-out shelf, whose 1200-px page is scaled back up by --libzoom.
function _navCompact() {
  const html = document.documentElement;
  const zoomed = document.body.classList.contains('mobile-library');
  html.classList.toggle('compact', zoomed || window.innerWidth < 900);
  // the profile's folded sections are only folded on a phone
  if (!html.classList.contains('compact')) document.querySelectorAll('.pc-fold:not([open])').forEach(d => { d.open = true; });
  if (zoomed) {
    const landscape = window.matchMedia && window.matchMedia('(orientation: landscape)').matches;
    const device = landscape ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
    html.style.setProperty('--libzoom', String(Math.max(1, html.clientWidth / device)));
  }
}

// ── Back button ──
// Every screen gets a history entry, and so does each overlay on top of it
// (the game page, the full play log, Wrapped), so the phone's back button (or
// a swipe back) closes what's on top and then walks back through the
// screens, each at the scroll position it was left at. An entry records the
// screen and which overlays were open: {bgl, view, stack, id}.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let _navRestoring = false;
let _navSeq = 0;
const _navScroll = new Map();   // entry id → scrollY on that screen
const NAV_OVERLAYS = { lpm: 'lpm-overlay', wrapped: 'wrapped-overlay', pics: 'pics-overlay' };

function _navKey(st) {
  return st.visiting ? 'visit:' + _viewingProfile : st.group + '/' + (st.sub || '');
}
function _navOpenOverlays() {
  return Object.keys(NAV_OVERLAYS).filter(k => _navIsOpen(NAV_OVERLAYS[k]));
}
function _navModalOpen() { return _navIsOpen('modal-overlay'); }
// The history entry for something opening now: 'view', 'modal' or an overlay name.
function navEntry(kind) {
  return { bgl: kind, view: _navKey(_navState()), stack: _navOpenOverlays(), id: ++_navSeq + '-' + Date.now() };
}
// An overlay opened: give it an entry, so back closes it.
function navOverlayOpened(kind) {
  if (!(history.state && history.state.bgl === kind)) history.pushState(navEntry(kind), '');
}
// An overlay closed from inside it (✕, Escape…): drop its entry too.
function navOverlayClosed(kind) {
  if (history.state && history.state.bgl === kind) history.back();
}

// A new screen: a new entry. Until the app has finished starting (it may
// show the library, then your profile), the screen replaces the entry.
let _navReady = false;
function navBooted() { _navReady = true; _navRecord(); }
setTimeout(() => { if (!_navReady) navBooted(); }, 10000);   // if loading never finishes

function _navRecord() {
  if (_navRestoring || _navModalOpen() || _navOpenOverlays().length) return;
  const key = _navKey(_navState());
  const cur = history.state;
  if (cur && cur.bgl && cur.view === key) return;
  const entry = navEntry('view');
  if (_navReady && cur && cur.bgl) history.pushState(entry, ''); else history.replaceState(entry, '');
}

// Open a screen by its key ('ranks/hours', 'visit:Δημητρης'…).
function _navOpenKey(key) {
  if (key.startsWith('visit:')) return showStatsView(key.slice(6), 'visiting');
  const [group, sub] = key.split('/');
  _navGo(group, sub || undefined);
}

window.addEventListener('popstate', (e) => {
  const s = e.state;
  if (!s || !s.bgl) return;
  // close the overlays this entry didn't have open (the game page closes itself: shell.js)
  const keep = new Set(s.stack || []);
  if (s.bgl in NAV_OVERLAYS) keep.add(s.bgl);
  if (!keep.has('lpm') && _navIsOpen('lpm-overlay')) _closeLatestPlaysModal();
  if (!keep.has('wrapped') && _navIsOpen('wrapped-overlay')) {
    const w = document.getElementById('wrapped-overlay');
    if (w && w._wrClose) w._wrClose();
  }
  if (!keep.has('pics') && _navIsOpen('pics-overlay')) {
    const p = document.getElementById('pics-overlay');
    if (p && p._navClose) p._navClose();
  }
  // and go back to its screen, where it was scrolled to
  if (s.view && s.view !== _navKey(_navState())) {
    _navRestoring = true;
    try { _navOpenKey(s.view); } finally { _navRestoring = false; }
    const y = _navScroll.get(s.id) || 0;
    window.scrollTo(0, y);
    setTimeout(() => window.scrollTo(0, y), 60);   // after late layout (covers, fonts)
  }
});

let _navScrollTimer = null;
window.addEventListener('scroll', () => {
  clearTimeout(_navScrollTimer);
  _navScrollTimer = setTimeout(() => {
    const s = history.state;
    if (s && s.bgl === 'view' && !_navModalOpen() && !_navOpenOverlays().length) _navScroll.set(s.id, window.scrollY);
  }, 120);
}, { passive: true });

function _navSync() {
  _navCompact();
  const st = _navState();
  if (st.group === 'explore' && st.sub) _navLastExploreTab = st.sub;
  document.querySelectorAll('#appnav [data-nav]').forEach(b => {
    const on = b.dataset.nav === st.group;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  const subnav = document.getElementById('subnav');
  if (subnav) {
    const items = st.visiting ? [] : _navSubItems(st.group);
    const html = items.length > 1
      ? `<div class="subnav-inner" role="tablist">${items.map(([k, label]) =>
          `<button type="button" role="tab" class="subnav-btn${k === st.sub ? ' active' : ''}" aria-selected="${k === st.sub}" data-group="${st.group}" data-sub="${k}">${label}</button>`).join('')}</div>`
      : '';
    if (subnav.innerHTML !== html) subnav.innerHTML = html;
    subnav.hidden = !html;
  }
  document.body.dataset.nav = st.group;
  _navRenderMe();
  _navRecord();
}

function initNav() {
  const nav = document.getElementById('appnav');
  if (!nav || nav.dataset.ready) return;
  nav.dataset.ready = '1';
  nav.innerHTML = NAV_ITEMS.map(([k, label]) =>
    `<button type="button" class="appnav-btn" data-nav="${k}"><span class="appnav-ico" aria-hidden="true">${NAV_ICONS[k]}</span><span class="appnav-label">${label}</span></button>`).join('');
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-nav]');
    if (!b) return;
    const st = _navState();
    if (b.dataset.nav === st.group && !st.visiting) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    _navGo(b.dataset.nav);
  });
  document.getElementById('subnav').addEventListener('click', (e) => {
    const b = e.target.closest('.subnav-btn');
    if (b && !b.classList.contains('active')) _navGo(b.dataset.group, b.dataset.sub);
  });
  document.getElementById('appbar-me').addEventListener('click', () => {
    if (!_navPlayer()) return openPicker();
    _navGo('you', 'profile');
  });
  document.getElementById('appbar-brand').addEventListener('click', () => _navGo('library'));

  // Mirror the open view, however it was opened.
  // (called straight away, not on the next frame: frames don't run in background tabs)
  const obs = new MutationObserver(() => _navSync());
  ['library-view', 'stats-view', 'games-view', 'leaderboard-view', 'achievements-view',
   'challenges-view', 'boardsouth-view', 'ilioupoli-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'], childList: true });
  });
  // …and after every view has rendered: some views flip state (visiting a
  // profile, the Explore sub-tab) after the DOM change the observer sees.
  ['showStatsView', 'showGamesView', 'showLeaderboardView', 'showBoardSouthView', 'showIlioupoliView',
   'showAchievementsView', 'showChallengesView'].forEach(name => {
    const f = window[name];
    if (typeof f !== 'function') return;
    window[name] = function () { const r = f.apply(this, arguments); _navSync(); return r; };
  });
  window.addEventListener('storage', _navSync);
  window.addEventListener('resize', _navCompact);
  _navSync();
}
// ── "Put it on your home screen" card (own profile) ──
// Chrome/Android offer a real install prompt (beforeinstallprompt); iOS Safari
// has none, so it gets the two-tap instructions. Hidden once installed.
let _deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredInstall = e;
  document.querySelectorAll('#install-btn').forEach(b => { b.hidden = false; });
});
window.addEventListener('appinstalled', () => document.querySelectorAll('.install-card').forEach(c => c.remove()));

function _isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
}
function _isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function buildInstallCardHtml() {
  if (_isStandalone()) return '';
  const ios = _isIOS(), android = /android/i.test(navigator.userAgent);
  if (!ios && !android && !_deferredInstall) return '';   // a desktop browser that can't install
  const how = ios ? 'In Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>.'
    : android ? 'In Chrome, tap <b>&#8942;</b>, then <b>Install app</b>.'
    : 'Install it and it opens in its own window.';
  return `<div class="install-card">
      <img src="icons/icon-192.png" alt="" width="52" height="52">
      <div class="install-text">
        <div class="install-title">Put it on your home screen</div>
        <div class="install-sub">Opens full screen and works without signal. ${how}</div>
      </div>
      ${ios ? '' : `<button type="button" class="btn-primary" id="install-btn"${_deferredInstall ? '' : ' hidden'}>Install</button>`}
    </div>`;
}

function wireInstallCard(container) {
  const btn = container.querySelector('#install-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (!_deferredInstall) return;
    _deferredInstall.prompt();
    const choice = await _deferredInstall.userChoice.catch(() => null);
    _deferredInstall = null;
    if (choice && choice.outcome === 'accepted') btn.closest('.install-card').remove();
  });
}

initNav();
