// ── App shell navigation ──
// Five destinations, in the top bar on wide screens and a bottom tab bar on
// phones (same buttons; CSS moves them). A row of small tabs under the bar
// switches between the screens that belong together (the redesign of 2 Nov
// 2026, after friends found things in unexpected places):
//   Library       → your own games (Στιβ: his bookcase) · Find a game
//   Play          → Latest plays · Tonight · Campaigns (Oathsworn and the Gauntlet on #ilioupoli-view)
//   Crowdfunding  → Campaigns · Backed · Interested · For your games
//   Group         → Leaderboard · Players · Hours · Stats · Board South (regulars)
//   You           → Profile · Achievements · Challenges · Settings
// The views and their switchTo…() functions are unchanged; this module only
// calls them and mirrors whichever view is open (a MutationObserver keeps it
// in sync however a view got opened: a link, the back button, a modal…).

const NAV_ICONS = {
  library: '<svg viewBox="0 0 24 24"><path d="M4 19V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v14M8 19V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12M13.4 6.6l1.9-.5a1 1 0 0 1 1.2.7l3 11.3M3 20h18"/></svg>',
  play: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle class="dot" cx="8.7" cy="8.7" r="1.3"/><circle class="dot" cx="15.3" cy="8.7" r="1.3"/><circle class="dot" cx="12" cy="12" r="1.3"/><circle class="dot" cx="8.7" cy="15.3" r="1.3"/><circle class="dot" cx="15.3" cy="15.3" r="1.3"/></svg>',
  crowd: '<svg viewBox="0 0 24 24"><path d="M12 3 4 7v10l8 4 8-4V7zM4 7l8 4 8-4M12 11v10"/></svg>',
  group: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.3"/><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0"/><path d="M15.2 5.4a3.3 3.3 0 0 1 0 6.3M17.4 13.6a6.2 6.2 0 0 1 3.8 5.9"/></svg>',
  you: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
};
const NAV_ITEMS = [
  ['library', 'Library'], ['play', 'Play'], ['crowd', 'Crowdfunding'], ['group', 'Group'], ['you', 'You'],
];
// the small tab each destination opens on, the last one picked (else the first)
const _navLast = { play: 'plays', crowd: 'campaigns', group: 'leaderboard' };

function _navPlayer() {
  const raw = localStorage.getItem('bgl-player');
  return raw ? (NAME_MAP[raw] || raw) : null;
}

const _navIsOpen = (id) => { const el = document.getElementById(id); return !!(el && el.classList.contains('open')); };

// Which destination (and which small tab) the open view belongs to. `deep`:
// a screen opened from that small tab (a campaign from Campaigns), whose tab
// takes you back.
function _navState() {
  const lib = document.getElementById('library-view');
  if (lib && lib.style.display !== 'none' && !document.querySelector('.stats-view.open')) {
    return { group: 'library', sub: 'shelf' };
  }
  if (_navIsOpen('games-view')) {
    const t = typeof _exploreTab !== 'undefined' ? _exploreTab : 'games';
    if (t === 'games') return { group: 'library', sub: 'find' };
    if (t === 'tonight' || t === 'campaigns' || t === 'plays') return { group: 'play', sub: t };
    if (t === 'trending') {
      const f = typeof _hotFilter !== 'undefined' ? _hotFilter : null;
      return { group: 'crowd', sub: f === 'yours' || f === 'interested' ? f : 'campaigns' };
    }
    return { group: 'group', sub: t };   // players | stats
  }
  if (_navIsOpen('ilioupoli-view')) return { group: 'play', sub: 'campaigns', deep: true };
  if (_navIsOpen('backed-view')) return { group: 'crowd', sub: 'backed' };
  if (_navIsOpen('leaderboard-view')) return { group: 'group', sub: _ranksTab === 'hours' ? 'hours' : 'leaderboard' };
  if (_navIsOpen('boardsouth-view')) return { group: 'group', sub: 'boardsouth' };
  if (_navIsOpen('stats-view')) {
    const visiting = typeof _viewingProfile !== 'undefined' && _viewingProfile;
    if (visiting) return { group: 'group', sub: '', visiting: true };
    return { group: 'you', sub: typeof _youSettings !== 'undefined' && _youSettings ? 'settings' : 'profile' };
  }
  if (_navIsOpen('achievements-view')) return { group: 'you', sub: 'achievements' };
  if (_navIsOpen('challenges-view')) return { group: 'you', sub: 'challenges' };
  return { group: 'library', sub: 'shelf' };
}

function _navSubItems(group) {
  const me = _navPlayer();
  if (group === 'library') {
    // only your own (the user, 2 Nov 2026): Στιβ's bookcase is his shelf, anyone else's are their games
    return [['shelf', typeof _libOwner === 'function' && _libOwner() === 'stiv' ? 'Your shelf' : 'Your games'], ['find', 'Find a game']];
  }
  if (group === 'play') return [['plays', 'Latest plays'], ['tonight', 'Tonight'], ['campaigns', 'Campaigns']];
  if (group === 'crowd') {
    // For your games last (the user, 2 Nov 2026)
    const interested = typeof backingInterestedIds === 'function' && backingInterestedIds().length;
    return [['campaigns', 'Campaigns']]
      .concat(typeof backingMine === 'function' && backingMine() ? [['backed', 'Backed']] : [])
      .concat(interested ? [['interested', 'Interested']] : [])
      .concat([['yours', 'For your games']]);
  }
  if (group === 'group') {
    const bs = typeof _activeBoardSouthVoter === 'function' ? _activeBoardSouthVoter() : null;
    return [['leaderboard', 'Leaderboard'], ['players', 'Players'], ['hours', 'Hours'], ['stats', 'Stats']]
      .concat(bs ? [['boardsouth', 'Board South']] : []);
  }
  if (group === 'you') return me ? [['profile', 'Profile'], ['achievements', 'Achievements'], ['challenges', 'Challenges'], ['settings', 'Settings']] : [];
  return [];
}

// A screen of the shared view (#games-view, js/explore.js): Find a game,
// Tonight, Campaigns, Latest plays, Crowdfunding, Players, Stats.
function _navExplore(tab) {
  const there = _navIsOpen('games-view');
  _exploreTab = tab;
  return there ? showGamesView() : switchToGames();
}

function _navGo(group, sub) {
  // the destinations before the redesign (a back-button entry, a link)
  if (group === 'explore') {
    const to = { trending: ['crowd'], tonight: ['play', 'tonight'], players: ['group', 'players'], stats: ['group', 'stats'] }[sub] || ['library', 'find'];
    return _navGo(to[0], to[1]);
  }
  if (group === 'ranks') return _navGo('group', sub === 'everyone' ? 'leaderboard' : sub);
  if (group === 'tonight') return _navGo('play', 'tonight');
  if (group === 'library') {
    if (sub === 'ilioupoli') return _navGo('play', 'campaigns');
    if (sub === 'backed') return _navGo('crowd', 'backed');
    if (sub === 'find') return _navExplore('games');
    return switchToLibrary();   // 'shelf' (and the old 'mine', 'stiv', 'dimitris'): your own
  }
  if (group === 'play') return _navExplore(sub || _navLast.play);
  if (group === 'crowd') {
    sub = sub || _navLast.crowd;
    if (sub === 'backed') return switchToBacked();
    if (sub === 'yours' || sub === 'interested') _hotFilter = sub;
    else if (!['live', 'new', 'soon'].includes(_hotFilter)) _hotFilter = null;   // the campaigns: the page picks which list
    return _navExplore('trending');
  }
  if (group === 'group') {
    sub = sub || _navLast.group;
    if (sub === 'boardsouth') return switchToBoardSouth();
    if (sub === 'players' || sub === 'stats') return _navExplore(sub);
    _ranksTab = sub === 'hours' ? 'hours' : 'elo';
    return switchToLeaderboard();
  }
  if (group === 'you') {
    if (sub === 'achievements') return switchToAchievements();
    if (sub === 'challenges') return switchToChallenges();
    if (typeof _viewingProfile !== 'undefined') { _viewingProfile = null; _statsViewSource = null; }
    _youSettings = sub === 'settings';
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
const NAV_OVERLAYS = { lpm: 'lpm-overlay', wrapped: 'wrapped-overlay', pics: 'pics-overlay', first: 'fc-overlay', bgs: 'bgs-overlay', acct: 'acct-overlay', mylib: 'mylib-overlay', lp: 'lp-overlay' };

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
  for (const k of ['bgs', 'acct', 'mylib', 'lp']) {
    if (!keep.has(k) && _navIsOpen(NAV_OVERLAYS[k])) {
      const el = document.getElementById(NAV_OVERLAYS[k]);
      if (el && el._navClose) el._navClose();
    }
  }
  if (!keep.has('first') && _navIsOpen('fc-overlay')) {
    const f = document.getElementById('fc-overlay');
    if (f && f._navClose) f._navClose();
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

// On a phone the tabs don't all fit: bring the picked one to the middle of
// the strip (gliding there when you tapped it, straight away when the strip
// was just drawn).
function _navCenterTab(subnav, smooth) {
  const inner = subnav.querySelector('.subnav-inner');
  const b = inner && inner.querySelector('.subnav-btn.active');
  if (!b || inner.scrollWidth <= inner.clientWidth) return;
  const x = b.getBoundingClientRect().left - inner.getBoundingClientRect().left + inner.scrollLeft;
  inner.scrollTo({ left: x - (inner.clientWidth - b.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
}

function _navSync() {
  _navCompact();
  const st = _navState();
  if (st.sub && st.group in _navLast && !st.deep) _navLast[st.group] = st.sub;
  document.querySelectorAll('#appnav [data-nav]').forEach(b => {
    const on = b.dataset.nav === st.group;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  const subnav = document.getElementById('subnav');
  if (subnav) {
    const items = st.visiting ? [] : _navSubItems(st.group);
    const tabsKey = `${st.group}:${items.map(i => i.join('=')).join(',')}`;   // a renamed tab (whose shelf) rebuilds them too
    const inner = subnav.querySelector('.subnav-inner');
    if (items.length > 1 && inner && inner.dataset.tabs === tabsKey) {
      // the same tabs, another one picked: move the highlight and leave the
      // strip where it is (rebuilding it would scroll it back to the start)
      inner.querySelectorAll('.subnav-btn').forEach(b => {
        const on = b.dataset.sub === st.sub;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', String(on));
      });
    } else {
      const html = items.length > 1
        ? `<div class="subnav-inner" role="tablist" data-tabs="${tabsKey}">${items.map(([k, label]) =>
            `<button type="button" role="tab" class="subnav-btn${k === st.sub ? ' active' : ''}" aria-selected="${k === st.sub}" data-group="${st.group}" data-sub="${k}">${label}</button>`).join('')}</div>`
        : '';
      if (subnav.innerHTML !== html) subnav.innerHTML = html;
      subnav.hidden = !html;
    }
    if (subnav._active !== `${tabsKey}:${st.sub}`) {
      _navCenterTab(subnav, !!inner && inner.isConnected);
      subnav._active = `${tabsKey}:${st.sub}`;
    }
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
    if (b && (!b.classList.contains('active') || _navState().deep)) _navGo(b.dataset.group, b.dataset.sub);
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
   'challenges-view', 'boardsouth-view', 'ilioupoli-view', 'backed-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'], childList: true });
  });
  // …and after every view has rendered: some views flip state (visiting a
  // profile, the Explore sub-tab) after the DOM change the observer sees.
  ['showStatsView', 'showGamesView', 'showLeaderboardView', 'showBoardSouthView', 'showIlioupoliView', 'showBackedView',
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
