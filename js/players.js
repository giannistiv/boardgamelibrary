// =============================================
// PLAY HISTORY - Imported from BGStats
// =============================================





// Canonical-name → BGG username map. Profiles for these players render a
// "View collection on BGG" button that links to
//   https://boardgamegeek.com/collection/user/{USERNAME}?own=1&subtype=boardgame&gallery=large&ff=1
const BGG_USERS = {
  'Στιβ':                  'johnstiv',
  'Γιαννης Φωτοπουλος':    'JohnnyDgame',
  'LGeorge':               'kukugames',
  'Βασιλης - Argo':        'airmil',
  'Γιαννης Αγγουριδακης':  'petinis',
  'Δημητρης':              'Rhogarj',
  'Δημητρης Σελιτσιανος':  'aristomenes',
  'Πανος':                 'panowar',
  'Γιωργος Γεωργιαδης':    'GiorGeo',
  'Κωστας Ρεταλης':        'Fabregus',
  'Οδυσσεας Ηλιοπουλος':   'BlizzBoy',
  'Σωτηρης - Argo':        'S0tiris',
};
function _bggCollectionUrl(playerName) {
  const u = BGG_USERS[playerName];
  return u ? `https://boardgamegeek.com/collection/user/${u}?own=1&subtype=boardgame&gallery=large&ff=1` : null;
}

// Auto-convert old Latin player names to Greek when new data is uploaded
const NAME_MAP = {
  'Aggelos - BS':'Αγγελος - BS','Aggelos Bellos':'Αγγελος Μπελλος',
  'Akis - BS':'Ακης - BS','Alexis - BS':'Αλεξης - BS',
  'Andreas - BS':'Αντρεας - BS','Antonis':'Αντωνης',
  'Antreas Papan':'Αντρεας','Apostolis':'Αποστολης',
  'Chap - filos Dimitri':'Τσαπ','Danai Xristou':'Δαναη',
  'Despoina Antrea':'Δεσποινα','Dimitris - Argo':'Δημητρης Σελιτσιανος',
  'Dimitris - BS':'Δημητρης - BS','Dimitris Christodoulou':'Δημητρης',
  'Elena Bezz':'Ελενα Bezz','Euag':'Ευαγγελια',
  'Foivos':'Φοιβος','Fokionas Dimitri':'Φωκιωνας',
  'George Ios - BS':'Γιωργος Ιος - BS','Giannis A - Argo':'Γιαννης Αγγουριδακης',
  'Giannis Fot - BS':'Γιαννης Φωτοπουλος','Giannis Frantz':'Γιαννης Φρατζεσκακης',
  'Giannis Giaour - BS':'Γιαννης Γιαουριδακης','Giannis Kz':'Γιαννης Κζ',
  'Giorgos - Argo':'Γιωργος Γεωργιαδης','Giorgos - Sleeping':'Γιωργος - Sleeping',
  // The shared friend-of-Dimitri tag is the real Τσερβενης; Giorgos 2 has his
  // own tag. Older logs that break this rule are fixed in PLAY_NAME_OVERRIDES.
  'Giorgos - filos Dimitri':'Γιωργος Τσερβενης',
  'Γιωργος - φιλος Δημητρη':'Γιωργος Τσερβενης',
  'Giorgos 2 - filos Dimitri':'Γιωργος 2 - φιλος Δημητρη',
  'Iasonas':'Ιασονας','Ilias - BS':'Ηλιας - BS','Javier':'Javi',
  'Kornilia':'Κορνηλια','Kostas - Argo':'Κωστας Ρεταλης',
  'Kostas - BS':'Κωστας - BS','Kostas Kornilias':'Κωστας Κορνηλιας',
  'Madrileña':'Μαρια','Mantsos':'Μαντσος','Maria Karts':'Μαρια Καρτσωνακη',
  'Mimikos':'Μιμικος','Nikolleta Dimitri':'Νικολετα',
  'Nikos - BS':'Νικος Παπακης - BS','Nikos Xristou':'Νικος Χρηστου',
  'Odisseas I - Argo':'Οδυσσεας Ηλιοπουλος','Olga':'Ολγα',
  'Olga Fotopoulou':'Ολγα Σιδερη',
  'Panagiota-Kostantina':'Παναγιωτα Μπευ','Panos':'Πανος',
  'Panos Mantsou':'Πανος Μαντσου','Paulos - filos Dimitri':'Παυλος - φιλος Δημητρη',
  'Peliroja':'Μαρια Peliroja','Sakis - filos Mantsou':'Σακης - φιλος Μαντσου',
  'Skrekas':'Σκρεκας','Sotiris - Argo':'Σωτηρης - Argo',
  'Spiros - BS':'Σπυρος - BS','Stavros - Argo':'Σταυρος - Argo',
  'Stefanos Kirito':'Στεφανος','Stiv':'Στιβ','Tasos':'Τασος',
  'Thanasis - BS':'Θανασης - BS','Thanasis kanali':'Θανασης youtuber',
  'Thanos':'Θανος','Vaggelis - Argo':'Βαγγελης - Argo',
  'Valantis':'Βαλαντης - Argo','Vasilis - Argo':'Βασιλης - Argo',
  'Vlasis - Argo':'Βλασης - Argo','Xristina Marias':'Χριστινα Πελεκανου',
  'Xristos Antoni':'Χρηστος Σταυρακακης','Xristos Apostolou':'Χρηστος Αποστολου',
  'Xristos Madrileñas':'Χρηστος Ρετσος','Anastasiia Deel':'Anastasia Deel',
  'Χρηστος Καραφουλιδης':'Χρηστος Ρετσος',
  'Leonidas Marias':'Λεωνιδας',
  'Γιώργος':'George-Alex'
};
const LOCATION_MAP = {
  'South Board': 'Board South',
};

// Resolve remap chains once (a→b, b→c ⇒ a→c) so a single application always
// gives the final name, no matter how many times NAME_MAP is applied later.
// Re-run after profile renames fold into NAME_MAP (see _applyProfileOverrides).
function _resolveNameMapChains() {
  for (const k in NAME_MAP) {
    let v = NAME_MAP[k];
    const seen = new Set([k]);
    while (NAME_MAP[v] !== undefined && NAME_MAP[v] !== v && !seen.has(v)) { seen.add(v); v = NAME_MAP[v]; }
    NAME_MAP[k] = v;
  }
}
_resolveNameMapChains();

// Apply name + location conversions to PLAY_HISTORY
for (const bggId in PLAY_HISTORY) {
  for (const play of PLAY_HISTORY[bggId]) {
    for (const s of play.sc) {
      if (NAME_MAP[s.n]) s.n = NAME_MAP[s.n];
    }
    if (play.l && LOCATION_MAP[play.l]) play.l = LOCATION_MAP[play.l];
  }
}

// ── Per-play identity corrections ──
// For logs whose name can't tell two people apart, list the exact plays:
// game (bggId) + date + the post-NAME_MAP name to replace → the right person.
// Applied after NAME_MAP (static load, every import, and after profile renames);
// idempotent since no `to` name is ever a `from`.
const PLAY_NAME_OVERRIDES = [
  // 2022-23 logs of the Sleeping George that were saved as "Γιωργος Τσερβενης".
  { b: 161970, d: '2022-02-27', from: 'Γιωργος Τσερβενης', to: 'Γιωργος - Sleeping' },
  { b: 275974, d: '2023-02-21', from: 'Γιωργος Τσερβενης', to: 'Γιωργος - Sleeping' },
  { b: 304783, d: '2022-07-13', from: 'Γιωργος Τσερβενης', to: 'Γιωργος - Sleeping' },
  { b: 316554, d: '2022-07-13', from: 'Γιωργος Τσερβενης', to: 'Γιωργος - Sleeping' },
  // Giorgos 2 logged under the shared friend-of-Dimitri tag, before he had his own.
  { b: 253344, d: '2024-08-19', from: 'Γιωργος Τσερβενης', to: 'Γιωργος 2 - φιλος Δημητρη' },
  { b: 279537, d: '2025-09-04', from: 'Γιωργος Τσερβενης', to: 'Γιωργος 2 - φιλος Δημητρη' },
  { b: 454103, d: '2026-08-06', from: 'Γιωργος Τσερβενης', to: 'Γιωργος 2 - φιλος Δημητρη' },
];
const _playOverrideIndex = new Map(PLAY_NAME_OVERRIDES.map(o => [o.b + '|' + o.d + '|' + o.from, o.to]));
function _applyPlayOverrides(bggId, play) {
  if (!play || !Array.isArray(play.sc)) return;
  for (const s of play.sc) {
    if (!s) continue;
    const to = _playOverrideIndex.get(Number(bggId) + '|' + play.date + '|' + s.n);
    if (to) s.n = to;
  }
}
function _applyAllPlayOverrides() {
  for (const bggId in PLAY_HISTORY)
    for (const play of PLAY_HISTORY[bggId])
      _applyPlayOverrides(bggId, play);
}
_applyAllPlayOverrides();

// Games with play history that aren't on the shelf (for stats/modal)


// Cubby configuration
