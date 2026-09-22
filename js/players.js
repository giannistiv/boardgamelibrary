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
  'Giorgos - filos Dimitri':'Γιωργος - φιλος Δημητρη',
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

// Apply name + location conversions to PLAY_HISTORY
for (const bggId in PLAY_HISTORY) {
  for (const play of PLAY_HISTORY[bggId]) {
    for (const s of play.sc) {
      if (NAME_MAP[s.n]) s.n = NAME_MAP[s.n];
    }
    if (play.l && LOCATION_MAP[play.l]) play.l = LOCATION_MAP[play.l];
  }
}

// ── Distinct "Giorgos" identity corrections ──
// Several different Georges were logged under overlapping names; a plain
// NAME_MAP swap would chain-corrupt (Τσερβενης is both a source and a target).
// These per-play rules read the co-players, so they separate the people safely:
//  • The person tagged "Γιωργος Τσερβενης" who never plays with Τσαπ is really
//    "Γιωργος - Sleeping"; the REAL Τσερβενης is the friend-of-Dimitri who does.
//  • That friend-of-Dimitri pool also hides "Γιωργος 2 - φιλος Δημητρη", who
//    plays only with Δημητρης+Στιβ (no Τσαπ).
// Idempotent: the real Τσερβενης always has Τσαπ, so re-running never re-touches
// him, and none of the resulting names are NAME_MAP keys.
function _fixGiorgosInPlay(play){
  if (!play || !Array.isArray(play.sc)) return;
  const chap = play.sc.some(x => x && x.n === 'Τσαπ');
  for (const s of play.sc){
    if (!s) continue;
    if (s.n === 'Γιωργος Τσερβενης' && !chap) s.n = 'Γιωργος - Sleeping';
    else if (s.n === 'Γιωργος - φιλος Δημητρη') s.n = chap ? 'Γιωργος Τσερβενης' : 'Γιωργος 2 - φιλος Δημητρη';
  }
}
function _fixGiorgosIdentities(){
  for (const bggId in PLAY_HISTORY)
    for (const play of PLAY_HISTORY[bggId])
      _fixGiorgosInPlay(play);
}
_fixGiorgosIdentities();

// Games with play history that aren't on the shelf (for stats/modal)


// Cubby configuration
