// ── Notifications ──
// Web Push through the site's service (worker/, BGG_PROXY): turned on per
// phone or browser in Profile settings. It sends a play someone logged with
// you, a campaign you marked Interested ending, and a backed game due that
// month. sw.js shows them; tapping one opens the app at ?go=… (boot.js).
// On an iPhone they only work in the app added to the Home Screen.

const PUSH_KEY = 'BBe4fg0Y6TYnt2dDtKDEzOf850CkG9t1KSWvuyuvPruex5IN5sJf-Z3WcYSyF7YefjgZX3nL8DOXjHb_WnCb0rc';   // the service's public VAPID key

function notifySupported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
function _notifyIOSBrowser() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return ios && !standalone;
}
const _pushKeyBytes = () => {
  const s = PUSH_KEY.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};

async function _notifyCall(path, body) {
  const token = typeof acctIdToken === 'function' ? await acctIdToken() : null;
  if (!token) throw new Error('Sign in first.');
  const res = await fetch(`${BGG_PROXY}/push/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
async function _notifySub() {
  if (!notifySupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}
async function notifyState() {
  if (!notifySupported()) return _notifyIOSBrowser() ? 'ios' : 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return (await _notifySub()) ? 'on' : 'off';
}
async function notifyOn() {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error(perm === 'denied' ? 'Notifications are blocked for this site in the browser\'s settings.' : 'Not turned on.');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: _pushKeyBytes() });
  await _notifyCall('subscribe', { subscription: sub.toJSON() });
  await _notifyCall('test');
}
async function notifyOff() {
  const sub = await _notifySub();
  if (!sub) return;
  try { await _notifyCall('unsubscribe', { endpoint: sub.endpoint }); } catch (_) { /* gone from the service anyway once the browser drops it */ }
  await sub.unsubscribe();
}
// This device's notifications follow whoever is signed in on it.
async function notifySync() {
  try {
    const sub = await _notifySub();
    if (sub) await _notifyCall('subscribe', { subscription: sub.toJSON() });
  } catch (_) { /* tried again at the next sign-in */ }
}
// A play just logged: the others in it hear about it.
function notifyPlayLogged(id, game) {
  _notifyCall('play', { id, game }).catch(() => {});
}

// ── Profile settings ──
function notifySettingsHtml() {
  setTimeout(notifyRenderRow, 0);
  return `<div class="profile-edit-label">Notifications</div><div class="acct-settings nt-row" id="nt-row"><span>…</span></div>`;
}
async function notifyRenderRow(msg) {
  const row = document.getElementById('nt-row');
  if (!row) return;
  const st = await notifyState().catch(() => 'unsupported');
  const say = msg ? `<small class="nt-msg">${_escapeHtml(msg)}</small>` : '';
  const what = '<small>A play someone logs with you, a campaign you\'re interested in ending, a backed game due.</small>';
  row.innerHTML = st === 'on'
    ? `<span>On for this device${what}${say}</span><span class="nt-btns"><button type="button" class="profile-edit-cancel" data-nt="test">Test</button><button type="button" class="profile-edit-cancel" data-nt="off">Turn off</button></span>`
    : st === 'off'
      ? `<span>Off${what}${say}</span><button type="button" class="profile-edit-save" data-nt="on">Turn on</button>`
      : st === 'denied'
        ? `<span>Blocked<small>They're blocked for this site in the browser's settings: allow them there, then turn them on here.</small></span>`
        : st === 'ios'
          ? `<span>Needs the app<small>On an iPhone, add the app to the Home Screen first (Share → Add to Home Screen), open it from there, and turn them on here.</small></span>`
          : `<span>Not available<small>This browser can't show notifications.</small></span>`;
}
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-nt]');
  if (!b) return;
  e.preventDefault();
  b.disabled = true;
  let msg = '';
  try {
    if (b.dataset.nt === 'on') { await notifyOn(); msg = 'A test notification is on its way.'; }
    else if (b.dataset.nt === 'off') { await notifyOff(); msg = 'Turned off for this device.'; }
    else { const r = await _notifyCall('test'); msg = r.sent ? 'Sent: it should show in a moment.' : 'Nothing was sent: turn them off and on again.'; }
  } catch (err) { msg = err.message; }
  b.disabled = false;
  notifyRenderRow(msg);
});
