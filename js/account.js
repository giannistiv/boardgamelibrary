// ── Accounts: sign in with Google or an email, join through a friend's link ──
// Firebase Authentication, loaded only on a device that has signed in before
// or opened a join link. A signed-in person has
//   users/{uid}           = { name, player, friendOf: {stiv, dimitris}, joined, photo }
//   playerClaims/{player} = uid      (one account per player name)
// Their player name becomes this device's player (bgl-player): their plays,
// ratings and profile, as picking a name in the picker does. Join links
// (?join=stiv, ?join=dimitris) make them that person's friend: they see that
// shelf in the Library next to their own games (js/my-library.js). Writes to
// these nodes carry the sign-in token; the database rules check it.

const FB_CONFIG = {
  apiKey: 'AIzaSyBfWuyUZrOMrGrK8U_vsmzIkgolV3urgE8',
  authDomain: 'boardgamelibrary0.firebaseapp.com',
  databaseURL: 'https://boardgamelibrary0-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'boardgamelibrary0',
  storageBucket: 'boardgamelibrary0.firebasestorage.app',
  messagingSenderId: '735519464209',
  appId: '1:735519464209:web:7f09ffbc8674527d510ab0',
};
const FB_SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
const ACCT_OWNERS = { stiv: 'Στιβ', dimitris: 'Δημητρης' };   // whose friends people are

let _acct = null;         // the signed-in person: { uid, email, provider, name, player, friendOf, joined }
let _acctAuth = null;     // firebase.auth(), once loaded
let _acctSdk = null;      // the SDK loading
let _acctClaims = null;   // playerClaims: player name → uid
let _acctFresh = false;   // signed in on this page: the profile says so until the next refresh

// What this device remembers of the account, so the app knows who it is
// before Firebase has loaded (and offline).
function _acctCached() {
  try { return JSON.parse(localStorage.getItem('bgl-acct') || 'null'); } catch (_) { return null; }
}
function _acctRemember(a) {
  try {
    if (a) localStorage.setItem('bgl-acct', JSON.stringify({ uid: a.uid, name: a.name, player: a.player, friendOf: a.friendOf || {}, bgg: a.bgg || '', email: a.email || '', provider: a.provider || '' }));
    else localStorage.removeItem('bgl-acct');
  } catch (_) {}
}
// The signed-in person with a player name, or null.
function acctMe() {
  const a = _acct || _acctCached();
  return a && a.uid && a.player ? a : null;
}
// Whose shelf someone sees: the people they've played with (Στιβ, Δημητρης),
// and whoever's join link brought them in. Worked out from the plays each
// time, so the first game with the other one opens that shelf too.
function acctFriendOf(owner, a) {
  a = a || acctMe();
  if (!a || !ACCT_OWNERS[owner]) return false;
  if (a.friendOf && a.friendOf[owner]) return true;
  const me = _acctDisplay(a.player), them = ACCT_OWNERS[owner];
  if (!me || me === them || typeof PLAY_HISTORY === 'undefined') return false;
  let n = 0;
  for (const id in PLAY_HISTORY) n += PLAY_HISTORY[id].length;
  const key = `${me}|${them}|${n}`;   // the plays changed (an import, a logged play): look again
  const memo = acctFriendOf.memo || (acctFriendOf.memo = new Map());
  if (!memo.has(key)) {
    let met = false;
    for (const id in PLAY_HISTORY) {
      if (PLAY_HISTORY[id].some(p => p.sc.some(s => s.n === me) && p.sc.some(s => s.n === them))) { met = true; break; }
    }
    memo.set(key, met);
  }
  return memo.get(key);
}
// Στιβ and Δημητρης: their library is their shelf, not a list of their own.
function acctIsOwner(a) { a = a || acctMe(); return !!(a && Object.values(ACCT_OWNERS).includes(_acctDisplay(a.player))); }

// A player's name as the app shows it now (a rename in Profile settings changes it).
function _acctDisplay(canon) {
  return (typeof PROFILE_OVERRIDES !== 'undefined' && PROFILE_OVERRIDES[canon]) || canon;
}
// A player name as a database key: Firebase keys can't hold . # $ [ ] /
// (it stores the name itself, decoded, so lookups use this form too).
const _acctKey = (name) => String(name).replace(/[.#$\[\]\/]/g, '_');

function _acctScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Firebase could not load'));
    document.head.appendChild(s);
  });
}
function _acctLoad() {
  if (!_acctSdk) {
    _acctSdk = (async () => {
      if (!window.firebase || !firebase.initializeApp) await _acctScript(FB_SDK + 'firebase-app-compat.js');
      if (!firebase.auth) await _acctScript(FB_SDK + 'firebase-auth-compat.js');
      if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
      _acctAuth = firebase.auth();
      _acctAuth.onAuthStateChanged(_acctOnUser);
      return _acctAuth;
    })().catch((e) => { _acctSdk = null; throw e; });
  }
  return _acctSdk;
}

// ── Reading and writing with the sign-in token ──
async function _acctGet(path) {
  const res = await fetch(`${FIREBASE_DB}/${path}.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
// The sign-in token, for the site's own service (notifications: js/notify.js).
async function acctIdToken() {
  const user = _acctAuth && _acctAuth.currentUser;
  return user ? user.getIdToken() : null;
}
// The signed-in user once the sign-in library is up (loading it again if it
// couldn't load before, e.g. the app was opened without signal).
async function acctReady() {
  const auth = await _acctLoad();
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve) => { const off = auth.onAuthStateChanged((u) => { off(); resolve(u); }); });
}
async function acctWrite(path, method, data) {
  let user = _acctAuth && _acctAuth.currentUser;
  if (!user && _acctCached()) user = await acctReady().catch(() => null);
  if (!user) {
    // remembered on this phone, but the library can't load: no signal (Log a play keeps the play)
    if (_acctCached() && (!_acctAuth || navigator.onLine === false)) { const e = new Error('No connection.'); e.code = 'offline'; throw e; }
    throw new Error('You\'re not signed in on this device.');
  }
  const token = await user.getIdToken();
  const res = await fetch(`${FIREBASE_DB}/${path}.json?auth=${encodeURIComponent(token)}`, { method, body: data === undefined ? undefined : JSON.stringify(data) });
  if (res.status === 401 || res.status === 403) throw new Error('The database refused it (its rules may not be updated yet).');
  if (!res.ok) throw new Error(`The save failed (HTTP ${res.status}).`);
  return res.json();
}

// ── Starting up ──
// Called once the plays have loaded (boot.js). A join link waits in this
// tab's session until the person has signed in and picked their player.
function acctBoot() {
  const params = new URLSearchParams(location.search);
  const join = params.get('join');
  if (join) {
    if (ACCT_OWNERS[join]) { try { sessionStorage.setItem('bgl-join', join); } catch (_) {} }
    params.delete('join');
    const q = params.toString();
    history.replaceState(history.state, '', location.pathname + (q ? '?' + q : '') + location.hash);
  }
  const cached = _acctCached();
  if (cached && cached.player) localStorage.setItem('bgl-player', _acctDisplay(cached.player));
  if (cached || acctJoinPending()) _acctLoad().catch(() => {});
}
function acctJoinPending() {
  try { return sessionStorage.getItem('bgl-join') || null; } catch (_) { return null; }
}

async function _acctOnUser(user) {
  const wasHere = !!_acctCached();
  if (!user) {
    if (_acctCached()) _acctSignedOut();
    if (acctJoinPending() && !_acctOpen) acctOpenSheet();
    return;
  }
  const provider = (user.providerData[0] || {}).providerId === 'google.com' ? 'google' : 'email';
  let rec = null;
  try { rec = await _acctGet(`users/${user.uid}`); } catch (_) { rec = (_acctCached() || {}).uid === user.uid ? _acctCached() : null; }
  _acct = { ...(rec || {}), uid: user.uid, email: user.email || '', provider, photoURL: user.photoURL || '' };
  if (!rec || !rec.player) { acctOpenSheet('player'); return; }
  const join = acctJoinPending();
  if (join && !(_acct.friendOf || {})[join]) {
    try {
      await acctWrite(`users/${user.uid}/friendOf/${join}`, 'PUT', true);
      _acct.friendOf = { ...(_acct.friendOf || {}), [join]: true };
      _acctToast(`You're ${ACCT_OWNERS[join]}'s friend now: their shelf is in your Library.`);
    } catch (e) { _acctToast(e.message); }
  }
  try { sessionStorage.removeItem('bgl-join'); } catch (_) {}
  if (!wasHere) _acctFresh = true;
  _acctApply();
  if (_acctOpen) _acctClose();
}

// The account's player becomes this device's player, and everything that
// depends on who's looking redraws.
function _acctApply() {
  _acctRemember(_acct);
  if (typeof notifySync === 'function' && _acctAuth && _acctAuth.currentUser) notifySync();
  const before = localStorage.getItem('bgl-player');
  const name = _acctDisplay(_acct.player);
  localStorage.setItem('bgl-player', name);
  if (typeof myLibLoad === 'function') myLibLoad();
  if (typeof _navRenderMe === 'function') _navRenderMe();
  if (typeof _libRefresh === 'function') _libRefresh();
  if (typeof _navSync === 'function') _navSync();
  if (before !== name && typeof showStatsView === 'function') {
    document.getElementById('picker-overlay').classList.remove('open');
    showStatsView(name);
  }
}

function _acctSignedOut() {
  _acct = null;
  _acctRemember(null);
  localStorage.removeItem('bgl-player');
  if (typeof myLibLoad === 'function') myLibLoad();
  if (typeof _navRenderMe === 'function') _navRenderMe();
  if (typeof _libRefresh === 'function') _libRefresh();
  if (typeof _navSync === 'function') _navSync();
}
async function acctSignOut() {
  try { if (typeof notifyOff === 'function') await notifyOff(); } catch (_) {}   // this device stops getting their notifications
  try { if (_acctAuth) await _acctAuth.signOut(); } catch (_) {}
  _acctSignedOut();
  if (typeof switchToLibrary === 'function') switchToLibrary();
}

// ── The sheet: sign in, then "which player are you?" ──
let _acctOpen = false;
let _acctStep = 'signin';     // 'signin' | 'email' | 'player'
let _acctMode = 'in';         // email form: 'in' (sign in) | 'up' (create an account)
let _acctMsg = '';

function _acctEl() {
  let ov = document.getElementById('acct-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'acct-overlay';
    ov.className = 'acct-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
    ov.addEventListener('click', _acctClick);
    ov.addEventListener('submit', _acctSubmit);
    ov.addEventListener('input', (e) => { if (e.target.id === 'acct-psearch') _acctRenderPlayers(); });
  }
  return ov;
}

function acctOpenSheet(step) {
  _acctStep = step || 'signin';
  _acctMsg = '';
  const ov = _acctEl();
  _acctRender();
  if (!_acctOpen) {
    _acctOpen = true;
    ov.classList.add('open');
    document.getElementById('picker-overlay').classList.remove('open');
    ov._navClose = _acctClose;
    if (typeof navOverlayOpened === 'function') navOverlayOpened('acct');
  }
  _acctLoad().catch(() => { _acctMsg = 'Sign-in couldn\'t load. Check the connection and try again.'; _acctRender(); });
}
function _acctClose() {
  const ov = document.getElementById('acct-overlay');
  if (!ov || !_acctOpen) return;
  _acctOpen = false;
  ov.classList.remove('open');
  ov._navClose = null;
  if (typeof navOverlayClosed === 'function') navOverlayClosed('acct');
  // signed in but no player picked yet: nothing is saved, so sign out again
  if (_acct && !_acct.player && _acctAuth) _acctAuth.signOut().catch(() => {});
}

function _acctRender() {
  const ov = _acctEl();
  const esc = _escapeHtml;
  const join = acctJoinPending();
  const inviter = join ? ACCT_OWNERS[join] : '';
  const msg = _acctMsg ? `<div class="acct-msg">${esc(_acctMsg)}</div>` : '';
  let body = '';
  if (_acctStep === 'player') {
    body = `
      <div class="acct-title">Which player are you?</div>
      <div class="acct-sub">If you've played with us, pick your name: your plays and ratings come with it. Each name belongs to one account.</div>
      <input type="search" class="acct-input" id="acct-psearch" placeholder="Search players…" autocomplete="off">
      <div class="acct-players" id="acct-players"><div class="acct-sub">Loading the players…</div></div>
      <div class="acct-or"><span>or</span></div>
      <form class="acct-form" data-acct-form="new">
        <label class="acct-label" for="acct-newname">I'm new here. My name is</label>
        <input class="acct-input" id="acct-newname" maxlength="40" autocomplete="name" value="${esc((_acct && _acct.newName) || '')}" placeholder="Your name">
        <button type="submit" class="acct-btn acct-main">Join as a new player</button>
      </form>
      ${msg}
      <button type="button" class="acct-link" data-acct="cancel">Cancel</button>`;
  } else if (_acctStep === 'email') {
    const up = _acctMode === 'up';
    body = `
      <div class="acct-title">${up ? 'Create an account' : 'Sign in with email'}</div>
      <form class="acct-form" data-acct-form="email">
        <input class="acct-input" type="email" id="acct-email" placeholder="Email" autocomplete="email" required>
        <input class="acct-input" type="password" id="acct-pass" placeholder="${up ? 'Choose a password (6+ characters)' : 'Password'}" autocomplete="${up ? 'new-password' : 'current-password'}" minlength="6" required>
        <button type="submit" class="acct-btn acct-main">${up ? 'Create the account' : 'Sign in'}</button>
      </form>
      ${msg}
      <div class="acct-row">
        <button type="button" class="acct-link" data-acct="mode">${up ? 'I have an account: sign in' : 'New here? Create an account'}</button>
        ${up ? '' : '<button type="button" class="acct-link" data-acct="reset">Forgot the password?</button>'}
      </div>
      <button type="button" class="acct-link" data-acct="back">&lsaquo; Other ways to sign in</button>`;
  } else {
    body = `
      <div class="acct-title">${inviter ? `${esc(inviter)} invited you` : 'Sign in'}</div>
      <div class="acct-sub">${inviter
        ? `Join Board Game Library: keep a list of your own games, log your plays, and see ${esc(inviter)}'s shelf.`
        : 'Keep a list of your own games and log your plays. New here? Signing in creates your account.'}</div>
      <button type="button" class="acct-btn acct-google" data-acct="google"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Continue with Google</button>
      <button type="button" class="acct-btn" data-acct="email">Continue with email</button>
      ${msg}`;
  }
  ov.innerHTML = `<div class="acct-sheet">
      <button type="button" class="acct-x" data-acct="close" aria-label="Close">&times;</button>
      ${body}
    </div>`;
  if (_acctStep === 'player') _acctLoadPlayers();
}

// The players with plays, the taken ones marked.
async function _acctLoadPlayers() {
  if (!_acctClaims) {
    try { _acctClaims = (await _acctGet('playerClaims')) || {}; } catch (_) { _acctClaims = {}; }
  }
  _acctRenderPlayers();
}
function _acctRenderPlayers() {
  const box = document.getElementById('acct-players');
  if (!box || !_acctClaims) return;
  const q = ((document.getElementById('acct-psearch') || {}).value || '').trim().toLowerCase();
  const players = (typeof getAllPlayers === 'function' ? getAllPlayers() : []).filter(p => !q || p.name.toLowerCase().includes(q));
  const taken = (name) => {
    const by = _acctClaims[_acctKey(typeof _origCanon === 'function' ? _origCanon(name) : name)];
    return by && !(_acct && by === _acct.uid);
  };
  box.innerHTML = players.slice(0, 60).map(p => `<button type="button" class="acct-player${taken(p.name) ? ' taken' : ''}" data-acct-player="${_escapeHtml(p.name)}"${taken(p.name) ? ' disabled' : ''}>
      <span class="picker-avatar" aria-hidden="true">${avatarInner(p.name)}</span>
      <span class="acct-pname">${_escapeHtml(p.name)}</span>
      <span class="acct-pmeta">${taken(p.name) ? 'taken' : `${p.plays} play${p.plays !== 1 ? 's' : ''}`}</span>
    </button>`).join('') || '<div class="acct-sub">No player by that name. Join as a new player below.</div>';
}

async function _acctClick(e) {
  const ov = document.getElementById('acct-overlay');
  if (e.target === ov) { _acctClose(); return; }
  const b = e.target.closest('[data-acct], [data-acct-player]');
  if (!b) return;
  const what = b.dataset.acct;
  if (what === 'close' || what === 'cancel') { _acctClose(); return; }
  if (what === 'email') { _acctStep = 'email'; _acctMsg = ''; _acctRender(); return; }
  if (what === 'back') { _acctStep = 'signin'; _acctMsg = ''; _acctRender(); return; }
  if (what === 'mode') { _acctMode = _acctMode === 'up' ? 'in' : 'up'; _acctMsg = ''; _acctRender(); return; }
  if (what === 'google') { await _acctGoogle(); return; }
  if (what === 'reset') {
    const email = (document.getElementById('acct-email') || {}).value || '';
    if (!email) { _acctSay('Type your email above first.'); return; }
    try { await (await _acctLoad()).sendPasswordResetEmail(email.trim()); _acctSay('Sent: check your email for a link to choose a new password.'); }
    catch (err) { _acctSay(_acctError(err)); }
    return;
  }
  if (b.dataset.acctPlayer) await _acctClaim(b.dataset.acctPlayer, false);
}

async function _acctSubmit(e) {
  e.preventDefault();
  const form = e.target.closest('[data-acct-form]');
  if (!form) return;
  if (form.dataset.acctForm === 'email') {
    const email = document.getElementById('acct-email').value.trim();
    const pass = document.getElementById('acct-pass').value;
    _acctSay(_acctMode === 'up' ? 'Creating the account…' : 'Signing in…');
    try {
      const auth = await _acctLoad();
      if (_acctMode === 'up') await auth.createUserWithEmailAndPassword(email, pass);
      else await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) { _acctSay(_acctError(err)); }
    return;
  }
  if (form.dataset.acctForm === 'new') {
    const name = document.getElementById('acct-newname').value.trim().replace(/\s+/g, ' ');
    await _acctClaim(name, true);
  }
}

async function _acctGoogle() {
  _acctSay('Opening Google…');
  try {
    const auth = await _acctLoad();
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } catch (err) {
    _acctSay(err && err.code === 'auth/popup-blocked'
      ? 'The browser blocked the Google window. Allow pop-ups for this site, or continue with email.'
      : _acctError(err));
  }
}

// Take a player name: an existing player's (their plays come with it) or a new one.
async function _acctClaim(name, isNew) {
  if (!_acct || !_acct.uid) { _acctSay('Sign in first.'); return; }
  if (!name) { _acctSay('Type your name.'); return; }
  if (name.length > 40) { _acctSay('That name is too long (40 characters at most).'); return; }
  const known = typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : new Set();
  if (isNew && known.has(name)) { _acctSay(`Someone has already played as ${name}. If that's you, pick the name from the list above.`); return; }
  const canon = typeof _origCanon === 'function' ? _origCanon(name) : name;
  const key = _acctKey(canon);
  // whose shelf they see comes from who they play with (acctFriendOf); a join link counts too
  const friendOf = { ...(_acct.friendOf || {}) };
  const join = acctJoinPending();
  if (join) friendOf[join] = true;
  _acctSay('Saving…');
  try {
    const claims = (await _acctGet('playerClaims')) || {};
    if (claims[key] && claims[key] !== _acct.uid) { _acctClaims = claims; _acctRenderPlayers(); _acctSay(`${name} already belongs to another account.`); return; }
    if (!claims[key]) await acctWrite(`playerClaims/${encodeURIComponent(key)}`, 'PUT', _acct.uid);
    const rec = { name: _acctDisplay(canon), player: canon, joined: _acct.joined || Date.now(), friendOf };
    if (_acct.photoURL) rec.photo = _acct.photoURL;
    await acctWrite(`users/${_acct.uid}`, 'PUT', rec);
    Object.assign(_acct, rec);
    _acctFresh = true;
    try { sessionStorage.removeItem('bgl-join'); } catch (_) {}
    _acctClose();
    _acctApply();
    _acctToast(`Welcome, ${rec.name}!`);
  } catch (err) { _acctSay(err.message || 'The save failed. Try again.'); }
}

function _acctSay(text) {
  _acctMsg = text;
  const ov = document.getElementById('acct-overlay');
  const old = ov && ov.querySelector('.acct-msg');
  if (old) { old.textContent = text; return; }
  const sheet = ov && ov.querySelector('.acct-sheet form, .acct-sheet .acct-btn:last-of-type');
  if (sheet) sheet.insertAdjacentHTML('afterend', `<div class="acct-msg">${_escapeHtml(text)}</div>`);
}

function _acctError(err) {
  const code = (err && err.code) || '';
  const say = {
    'auth/invalid-credential': 'That email and password don\'t match.',
    'auth/wrong-password': 'That email and password don\'t match.',
    'auth/user-not-found': 'No account with that email. Create one instead.',
    'auth/email-already-in-use': 'There\'s already an account with that email: sign in instead (or with Google, if you made it that way).',
    'auth/weak-password': 'Choose a longer password (6 characters at least).',
    'auth/invalid-email': 'That email doesn\'t look right.',
    'auth/too-many-requests': 'Too many tries. Wait a few minutes and try again.',
    'auth/popup-closed-by-user': 'The Google window closed before signing in.',
    'auth/cancelled-popup-request': 'The Google window closed before signing in.',
    'auth/network-request-failed': 'No connection. Try again when you\'re online.',
    'auth/unauthorized-domain': 'This site isn\'t on the sign-in list yet (Firebase → Authentication → Settings → Authorized domains).',
    'auth/operation-not-allowed': 'This way of signing in isn\'t switched on yet (Firebase → Authentication → Sign-in method).',
    'auth/account-exists-with-different-credential': 'That email already has an account that signs in another way. Use that.',
  }[code];
  return say || (err && err.message) || 'Something went wrong. Try again.';
}

function _acctToast(text, ms) {
  let t = document.getElementById('acct-toast');
  if (!t) { t = document.createElement('div'); t.id = 'acct-toast'; t.className = 'acct-toast'; document.body.appendChild(t); }
  t.textContent = text;   // line breaks show (white-space: pre-line)
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), ms || 4000);
}

// ── On your own profile: who you're signed in as, or an invitation to sign in ──
function acctProfileHtml() {
  const a = acctMe();
  const esc = _escapeHtml;
  if (!a) {
    const me = typeof _navPlayer === 'function' ? _navPlayer() : null;
    if (me && Object.values(ACCT_OWNERS).includes(me)) {
      return `<div class="acct-card"><div><b>Sign in to invite friends</b><span>Your join link lets friends sign up and see your shelf.</span></div>
      <button type="button" class="acct-btn acct-main acct-card-btn" data-acct-open>Sign in</button></div>`;
    }
    return `<div class="acct-card"><div><b>Sign in to keep your own games</b><span>Your list of games, and the plays you log, saved to your account.</span></div>
      <button type="button" class="acct-btn acct-main acct-card-btn" data-acct-open>Sign in or join</button></div>`;
  }
  // signed in: said once, right after signing in (Sign out is in Profile settings)
  if (!_acctFresh) return '';
  return `<div class="acct-card"><div><b>Signed in${a.email ? ` as ${esc(a.email)}` : ''}</b><span>${_acctHow(a)}</span></div></div>`;
}
function _acctHow(a) {
  // Στιβ and Δημητρης have their own shelf: being each other's friend means nothing to them
  const friends = acctIsOwner(a) ? [] : Object.keys(ACCT_OWNERS).filter(k => acctFriendOf(k, a)).map(k => `${ACCT_OWNERS[k]}'s`);
  return `With ${a.provider === 'google' ? 'Google' : 'email'}${friends.length ? ` &middot; ${_escapeHtml(friends.join(' and '))} friend` : ''}`;
}
// Profile settings: the account, and signing out.
function acctSettingsHtml() {
  const a = acctMe();
  if (!a) return `<div class="profile-edit-label">Account</div><button type="button" class="profile-edit-save" data-acct-open>Sign in</button>`;
  const owner = acctIsOwner(a);
  const bgg = a.bgg || (typeof BGG_USERS !== 'undefined' && BGG_USERS[_acctDisplay(a.player)]) || '';
  return `${owner ? '' : `<div class="profile-edit-label">BGG collection</div>
    <div class="acct-bgg"><input type="text" class="profile-name-input" id="acct-bgg" value="${_escapeHtml(bgg)}" placeholder="Your BoardGameGeek username" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false">
    <button type="button" class="profile-edit-save" data-acct-bgg>Save</button></div>
    <div class="acct-bgg-note" id="acct-bgg-note">What you own on BGG comes to My games by itself, with every BGG sync (every few hours).</div>`}
    ${typeof notifySettingsHtml === 'function' ? notifySettingsHtml() : ''}
    <div class="profile-edit-label">Account</div>
    <div class="acct-settings"><span>${a.email ? _escapeHtml(a.email) : 'Signed in'}<small>${_acctHow(a)}</small></span>
    <button type="button" class="profile-edit-cancel" data-acct-signout>Sign out</button></div>
    <div class="acct-del" id="acct-del"><button type="button" class="lp-textbtn acct-del-open" data-acct-del="open">Delete my account</button></div>`;
}
// Link a BGG username: the BGG sync brings that collection to My games.
async function acctSaveBgg() {
  const input = document.getElementById('acct-bgg');
  const note = document.getElementById('acct-bgg-note');
  const name = (input.value || '').trim();
  const say = (t) => { if (note) note.textContent = t; };
  if (name && !/^[A-Za-z0-9_ .-]{1,40}$/.test(name)) { say('A BGG username has letters, numbers, spaces, dots, dashes or underscores.'); return; }
  say('Saving…');
  try {
    await acctWrite(`users/${_acct.uid}/bgg`, name ? 'PUT' : 'DELETE', name || undefined);
    _acct.bgg = name;
    _acctRemember(_acct);
    input.blur();
    if (!name) { if (typeof myBggForget === 'function') myBggForget(); say('Unlinked.'); return; }
    // the games now, from BGG; the 6-hourly sync keeps them in step from here (js/my-library.js)
    say('Saved. Getting your collection from BGG…');
    const got = typeof myBggFetch === 'function' ? await myBggFetch(name) : { pending: true };
    // and their BGG ratings, for the games they haven't rated here
    const rated = !got.error && typeof myBggRatings === 'function' ? await myBggRatings(name).catch(() => 0) : 0;
    const also = rated ? ` ${rated} of your BGG ratings came too, for games you hadn't rated here.` : '';
    say(got.error ? `Saved, but BGG said: ${got.error}. Check the username; the collection comes with the next sync if BGG has it.`
      : got.pending ? 'Saved. BGG is still preparing your collection: it comes to My games within a few hours, with the next sync.' + also
      : got.count ? `${got.count} game${got.count !== 1 ? 's' : ''} from your BGG collection are in My games now. They stay in step with BGG, every 6 hours.` + also
      : `Saved, but BGG shows no games owned by ${name}. Is the collection public, with games marked "Own"?` + also);
  } catch (e) { say(e.message); }
}
// ── Deleting your account (Profile settings) ──
// Your sign-in, your player link, My games, your Interested / Backed marks and
// the notifications on every device go. The plays you logged stay: the
// others in them keep them. Firebase wants a fresh sign-in before it deletes
// one, so it asks for it first: Google's window, or your password.
function _acctDelHtml(step, msg) {
  const a = acctMe();
  const esc = _escapeHtml;
  if (step !== 'confirm') return '<button type="button" class="lp-textbtn acct-del-open" data-acct-del="open">Delete my account</button>';
  return `<div class="acct-del-box">
      <b>Delete your account?</b>
      <p>Your sign-in, your link to ${esc(_acctDisplay(a.player))}, My games, your Interested and Backed marks and your notifications go, for good. The plays you logged stay, since others were in them.</p>
      ${a.provider === 'google' ? '<p class="acct-del-note">Google will ask you to sign in once more, to be sure it&rsquo;s you.</p>'
        : '<label class="lp-field"><span>Your password, to be sure it&rsquo;s you</span><input type="password" class="lp-input" id="acct-del-pass" autocomplete="current-password"></label>'}
      ${msg ? `<div class="acct-del-msg">${esc(msg)}</div>` : ''}
      <div class="acct-del-btns">
        <button type="button" class="profile-edit-cancel" data-acct-del="cancel">Keep it</button>
        <button type="button" class="acct-del-go" data-acct-del="go">Delete my account</button>
      </div>
    </div>`;
}
function _acctDelShow(step, msg) {
  const box = document.getElementById('acct-del');
  if (box) box.innerHTML = _acctDelHtml(step, msg);
}
async function acctDelete() {
  const a = acctMe();
  const user = _acctAuth && _acctAuth.currentUser;
  if (!a || !user) { _acctDelShow('confirm', 'You\'re not signed in on this device.'); return; }
  const go = document.querySelector('[data-acct-del="go"]');
  if (go) { go.disabled = true; go.textContent = 'Deleting…'; }
  try {
    // 1. a fresh sign-in (Firebase asks for one before deleting an account)
    if (a.provider === 'google') await user.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider());
    else {
      const pass = (document.getElementById('acct-del-pass') || {}).value || '';
      if (!pass) throw new Error('Type your password first.');
      await user.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, pass));
    }
    // 2. notifications: this device, and the service forgets the others (js/notify.js)
    try { if (typeof notifyOff === 'function') await notifyOff(); } catch (_) {}
    try { if (typeof _notifyCall === 'function') await _notifyCall('forget'); } catch (_) {}
    // 3. what's theirs in the database
    const uid = a.uid;
    const backing = (await _acctGet('backing')) || {};
    for (const id in backing) if (backing[id] && backing[id][uid]) await acctWrite(`backing/${id}/${uid}`, 'DELETE');
    await acctWrite(`libraries/${uid}`, 'DELETE');
    const claims = (await _acctGet('playerClaims')) || {};
    for (const k in claims) if (claims[k] === uid) await acctWrite(`playerClaims/${encodeURIComponent(k)}`, 'DELETE');
    await acctWrite(`users/${uid}`, 'DELETE');
    // 4. the sign-in itself
    await user.delete();
  } catch (e) {
    const code = e && e.code || '';
    const msg = /popup-closed|cancelled-popup/.test(code) ? 'Nothing was deleted: the Google window was closed.'
      : /wrong-password|invalid-credential|invalid-login/.test(code) ? 'That password isn\'t right. Nothing was deleted.'
      : /too-many-requests/.test(code) ? 'Too many tries: wait a little and try again.'
      : e.message || 'It couldn\'t be deleted. Try again.';
    _acctDelShow('confirm', msg);
    return;
  }
  // gone: this device forgets it too
  try { ['bgl-mylib', 'bgl-bggcoll', 'bgl-hot-seen'].forEach(k => localStorage.removeItem(k)); } catch (_) {}
  _acct = null;
  _acctSignedOut();
  if (typeof switchToLibrary === 'function') switchToLibrary();
  _acctToast('Your account is deleted.');
}

// Next to Profile settings, for Στιβ and Δημητρης: send your join link.
function acctInviteBtnHtml() {
  const a = acctMe();
  const owner = a && Object.entries(ACCT_OWNERS).find(([, n]) => n === _acctDisplay(a.player));
  if (!owner) return '';
  return `<button type="button" class="profile-cog profile-invite" data-acct-invite="${owner[0]}" title="Invite friends: send your join link" aria-label="Invite friends">`
    + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></button>';
}

// Your join link: friends who open it see your shelf.
async function acctInvite(owner) {
  const url = `${location.origin}${location.pathname.replace(/index\.html$/, '')}?join=${owner}`;
  const text = `Join me on Board Game Library: ${url}`;
  if (navigator.share) { try { await navigator.share({ title: 'Board Game Library', text: 'Join me on Board Game Library', url }); return; } catch (_) { return; } }
  try { await navigator.clipboard.writeText(url); _acctToast('Your join link is copied: send it to a friend.'); }
  catch (_) { prompt('Your join link:', text); }
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-acct-open]')) { e.preventDefault(); acctOpenSheet(); return; }
  if (e.target.closest('[data-acct-signout]')) { e.preventDefault(); acctSignOut(); return; }
  const del = e.target.closest('[data-acct-del]');
  if (del) {
    e.preventDefault();
    const step = del.dataset.acctDel;
    if (step === 'go') acctDelete();
    else _acctDelShow(step === 'open' ? 'confirm' : '');
    return;
  }
  if (e.target.closest('[data-acct-bgg]')) { e.preventDefault(); acctSaveBgg(); return; }
  const inv = e.target.closest('[data-acct-invite]');
  if (inv) { e.preventDefault(); acctInvite(inv.dataset.acctInvite); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && _acctOpen) _acctClose(); });
