// ── Gloomhaven: Buttons & Bugs campaigns (the Campaign tab on its game page) ──
// The solo campaign: one player working down the deck of scenario cards, a
// scenario at a time, each campaign kept in Firebase (bbCampaigns/{id}).
// Nothing carries over from one scenario to the next but the story and the
// items. The scenario card sets your level (1 to 5), and the level sets how
// many of your four ability cards are upgraded to level 2 (the level less
// one), the modifier table, your hit points and how many items you carry.
// The items are the ones printed on the cards behind you: every card
// resolved or skipped (the cover and The Collector come with scenario 1's),
// one item from each card. A lost scenario is attempted again; a won one's
// conclusion names the next scenario, by the character who won it (the
// Bruiser goes to 4, the others to 3), and the six scenarios for one
// character can only be played by that character. Each attempt is logged as
// a play, offered to BG Stats.
//
// The scenarios are here in short, from the user's own cards (photographed
// 14 Nov 2026), and so are the Mindthief's ability cards. The level table and
// the items' effects are from Cephalofair's rules
// (cephalofairgames.github.io/bnb-rules, Appendix D). A scenario's text only
// shows once the campaign reaches it, so the story isn't given away.

const BB_BGGID = 393672;
const BB_N = 20;   // scenarios in the deck (with the cover and The Collector, 22 cards)

// The six shrunken mercenaries, as the cards name them.
const BB_CHARS = [
  { id: 'bruiser', name: 'Bruiser', color: '#a8723f', blurb: 'The one the Learn to Play guide follows: a good first pick.' },
  { id: 'tinkerer', name: 'Tinkerer', color: '#c99a35' },
  { id: 'spellweaver', name: 'Spellweaver', color: '#9a5cc0' },
  { id: 'silentknife', name: 'Silent Knife', color: '#4f8fb0' },
  { id: 'cragheart', name: 'Cragheart', color: '#8f8f3c' },
  { id: 'mindthief', name: 'Mindthief', color: '#2fa58a', blurb: 'Controls the battlefield with magic, manipulation and psychic augments. Medium complexity.' },
];
// Each character's four ability cards, from the back of its character card:
// the level 1 card and its level 2 upgrade, each with its B-side. Only the
// Mindthief's are in so far; the others' level 2 names are typed as they're
// first upgraded (kept per campaign, under ups/{character}).
const BB_CHAR_CARDS = {
  mindthief: [
    { l1: 'Parasitic Influence', b1: 'Possession', l2: 'Silent Scream', b2: 'Domination' },
    { l1: 'Withering Claw', b1: 'Empathetic Assault', l2: 'Corrupting Embrace', b2: 'Dark Frenzy' },
    { l1: 'The Mind’s Weakness', b1: 'Into the Night', l2: 'Vicious Blood', b2: 'Phantasmal Killer' },
    { l1: 'Scurry', b1: 'Gnawing Horde', l2: 'Pilfer', b2: 'Many as One' },
  ],
};

// The two story cards: the cover, read before scenario 1, and The Collector, after it.
const BB_STORY = {
  cover: { name: 'That Shrinking Feeling', read: 'Gloomhaven has survived the Void’s tornado and worse. Hail, a mysterious Aesther living in a derelict tavern, the Crooked Bone, is said to turn anyone into a hero. You step across her threshold… and everything grows. You’ve been shrunk!' },
  collector: { name: 'The Collector', read: 'The Vermling was shrunk by Hail too, and lends you the things they’ve collected if they can come along. Your best hope is to take it up with Hail herself, and the only way back into the Crooked Bone is through Button’s Kingdom, across the road.',
    note: 'From now on you can equip items during scenario setup.' },
};
// The scenario cards: name, level, the character it's for (req), the story
// so far (read), monsters, special rules, goal (else: defeat all monsters),
// what the conclusion tells (after), and where it leads: next, the first rule
// that fits the character who won it ({ to, char }); end: the campaign is over.
// pre: a story card to read first.
const BB_CARDS = {
  1: { name: 'A Rude Welcome', level: 1, pre: 'cover', read: 'A scruffy character, as tiny as you, wants your shiny new gear. There’s only one answer to that.',
    monsters: ['Bandit Guard'], after: 'Your gear isn’t shiny any more, and you’ll have to survive long enough to get your size back. Then a Vermling appears: read The Collector.', next: [{ to: '2' }] },
  2: { name: 'Crossing the Road', level: 1, pre: 'collector', read: 'There’s a window into the Crooked Bone, if you zip-line across from the Grumbling Garralev, also known as Button’s Kingdom. A crowd of bandits blocks the cobblestone street.',
    monsters: ['Bandit Guard', 'Bandit Archer'], after: 'Before the towering Garralev, the Collector advises avoiding the eccentric Button: better to sneak in through a crack in the wall.', next: [{ to: '4', char: 'bruiser' }, { to: '3' }] },
  3: { name: 'In the Walls', level: 2, read: 'Through the crack in the wall. King Button is the smallest imp you’ll ever see, and here, still a giant. Then a host of mice comes squeaking.',
    monsters: ['Mouse'], after: 'You come out before a crowd, and an imp carried on a button throne. “Capture the intruders!” King Button roars.', next: [{ to: '5' }] },
  4: { name: 'Barging In', level: 2, req: 'bruiser', read: 'Sneaking just makes you angry, and angry, you bust heads: you march straight at the guards at the door.',
    monsters: ['Bandit Guard', 'Bandit Archer'], after: 'Past the doors, King Button, an imp who was never shrunk, on a button throne: “Capture the intruders! Let’s have some fun in the arena!”', next: [{ to: '5' }] },
  5: { name: 'Button’s Arena', level: 2, read: 'Taken into custody, you’re thrown into an arena made of a serving platter of old, desiccated food, and Button himself jumps in.',
    monsters: ['Rending Beetle', 'Arena Sorcerer', 'King Button'], after: 'Button yields and offers a boon: passage upstairs, over to the Crooked Bone, once you’ve dealt with his pest problem.', next: [{ to: '7', char: 'mindthief' }, { to: '6' }] },
  6: { name: 'Pest Control', level: 2, read: 'Clear the pests out of the tavern’s storeroom, and Button will open his dumbwaiter upstairs to you.',
    monsters: ['Harrowing Infestation', 'Sewer Rat', 'Spitting Moth'], after: 'The rest of the creatures scurry back into the walls. Button sends you to the dumbwaiter, though the upstairs is overrun too.', next: [{ to: '9', char: 'silentknife' }, { to: '8' }] },
  7: { name: 'Mind Control', level: 2, req: 'mindthief', read: 'No favours for this puny imp: under cover of night you go for the dumbwaiter, psychic powers ready for anyone in your way.',
    monsters: ['Arena Sorcerer', 'Gloomtoad'], after: 'You mind control a defeated guard into unlocking the dumbwaiter. Up you go.', next: [{ to: '8' }] },
  8: { name: 'Going Up', level: 3, read: 'Bugs nest in the dumbwaiter’s shadows, and someone has to hit the switches that work the lift: you.',
    monsters: ['Spitting Moth', 'Venomous Centipede'], special: ['At the start of each round after the first, if there are fewer than 3 Venomous Centipedes, spawn one on the next spawn point: A, B, C, then again.'],
    goal: 'End at least one of your turns on each pressure plate.', after: 'The dumbwaiter rumbles upwards. Now to find the window over to the Crooked Bone.', next: [{ to: '10' }] },
  9: { name: 'Back in the Walls', level: 3, req: 'silentknife', read: 'You think better of the dumbwaiter: a crack in the wall nearby will take you exactly where you want to go.',
    monsters: ['Mouse'], after: 'Monsters in the wall, of course, but you’re up on the second floor. Now for the window over to the Crooked Bone.', next: [{ to: '10' }] },
  10: { name: 'Into the Darkness', level: 3, read: 'Upstairs, it’s almost too dark. Demons shrunk by Hail come after her too, the Collector whispers, and something moves ahead.',
    monsters: ['Rending Beetle', 'Gloomtoad'], special: ['All monsters begin the scenario with Invisible.'], after: 'In the moonlight, beyond a doorway, the window: just a dresser to climb. “Easy,” says the Collector.', next: [{ to: '12', char: 'tinkerer' }, { to: '11' }] },
  11: { name: 'Up to the Window', level: 3, read: 'More monsters wait on the dresser drawers between you and the window, and a large rat at the top.',
    monsters: ['Sewer Rat', 'Venomous Centipede'], special: ['You begin the scenario with Muddle.'], after: 'From the window a twine runs down to the Crooked Bone across the street, a rickety wooden platform hanging from it.', next: [{ to: '13' }] },
  12: { name: 'Gathering Materials', level: 3, req: 'tinkerer', read: 'Time to play smart: silk and claws from the local fauna would make a grappling hook to the window sill.',
    monsters: ['Spitting Moth', 'Sewer Rat'], after: 'The grappling hook works beautifully. From the sill a twine runs to the Crooked Bone, a wooden platform hanging from it.', next: [{ to: '13' }] },
  13: { name: 'Zipping Across', level: 4, read: 'As the Collector works the winch, flying pests descend on the platform, a real threat at your size.',
    monsters: ['Harrowing Infestation', 'Spitting Moth'], special: ['Whenever a Harrowing Infestation is defeated, spawn one Spitting Moth at the start of the next round, first in A, then in B.'],
    after: 'Through the Crooked Bone’s window, and nothing happens… until the Collector mentions the Bouncer.', next: [{ to: '14' }] },
  14: { name: 'The Bouncer', level: 4, read: 'The Bouncer is an animated cloth doll with dead button eyes, and he’s all yours.',
    monsters: ['Stuffed Construct', 'Tattered Construct'], special: ['When the Stuffed Construct is defeated, spawn the Tattered Construct in the hex it occupied (it acts in the round it was spawned).'],
    after: 'The doll tumbles off the table. There’s Hail, normal-sized and lost in her studies: now to get her attention.', next: [{ to: '16', char: 'spellweaver' }, { to: '15' }] },
  15: { name: 'Ring the Bell', level: 4, read: 'The service bell on the bar counter should do it, but the counter is home to several shrunken demons.',
    monsters: ['Earth Demon', 'Flame Demon', 'Frost Demon'], special: ['At the start of the scenario, flip all your ability cards to their B-side.'],
    goal: 'Attack the bell twice, then survive the next five rounds.', after: 'Hail notices you at last. Find the tiny green gem she misplaced in the back storeroom, and perhaps she’ll restore you.', next: [{ to: '18', char: 'cragheart' }, { to: '17' }] },
  16: { name: 'Signal Flare', level: 4, req: 'spellweaver', read: 'The demons below the table could power a great flash of light to catch Hail’s eye.',
    monsters: ['Earth Demon', 'Flame Demon', 'Wind Demon'], after: 'Hail notices you at last. Find the tiny green gem she misplaced in the back storeroom, and perhaps she’ll restore you.', next: [{ to: '17' }] },
  17: { name: 'The Long Way Through', level: 5, read: 'Junk blocks the back storeroom, so it’s cracks in the wall again, and more demons.',
    monsters: ['Flame Demon', 'Frost Demon', 'Wind Demon'], goal: 'Defeat all monsters and end your turn in A.', after: 'A large demon riding a beetle means to find Hail’s gem first and destroy it.', next: [{ to: '19' }] },
  18: { name: 'Crush the Clutter', level: 5, req: 'cragheart', read: 'A pile of junk blocks your way into the storeroom. Time to smash through.',
    monsters: ['Earth Demon', 'Frost Demon', 'Wind Demon'], special: ['The Wind Demon begins the scenario with Invisible.'], after: 'A large demon riding a beetle means to find Hail’s gem first and destroy it.', next: [{ to: '19' }] },
  19: { name: 'Hide and Seek', level: 5, read: 'The horde searches the storeroom for the gem, and demons come right at you: keep them busy while the Collector searches.',
    monsters: ['Earth Demon', 'Flame Demon', 'Frost Demon', 'Wind Demon'], after: 'The demon on the beetle holds up the green gem. One shot left to stop them: scenario 20 is unlocked.', next: [{ to: '20' }] },
  20: { name: 'Showdown', level: 5, read: 'No more talk: you charge the demon, and the rest back away to watch.',
    monsters: ['Mounted Prince', 'Goring Beetle', 'Demon Prince'], special: ['When the Mounted Prince is defeated, spawn the Goring Beetle in A and the Demon Prince in B (they act in the round they were spawned).'],
    after: 'Gem in hand, Hail keeps her side of the deal, and the world is your size again. The end.', end: true },
};

const _bbSlug = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// The items, two per card: [name, the scenario that opens them, the card
// they're on ('cover', 'collector' or the scenario), hands (0: an item, 1:
// one hand, 2: both), use ('spent': back on a long rest, 'lost': back after
// the scenario, '': passive), what it does].
const BB_ITEMS = [
  ['Sparrow Skull Helm', 1, 'cover', 0, 'spent', 'During your attack, gain advantage.'],
  ['Bottle Cap Helm', 1, 'cover', 0, 'spent', 'During an enemy’s attack, treat its plus attack modifier as a neutral one.'],
  ['Venomous Fang', 1, 1, 1, 'spent', 'During your melee attack, add Poison.'],
  ['Rosethorn Knife', 1, 1, 1, '', 'During your attack, consume Ice or Earth to add Pierce 1.'],
  ['Old Spring', 1, 'collector', 0, 'spent', 'During your turn, add Jump to all your movement.'],
  ['Shrunken Weathered Boots', 1, 'collector', 0, 'spent', 'During your movement, add +1 Move.'],
  ['Drop of Clean Water', 2, 2, 0, '', 'During your turn, consume Ice or Wind to remove one negative condition.'],
  ['Drop of Power Potion', 2, 2, 0, 'lost', 'During your turn, add +1 Attack to all your attacks.'],
  ['Button Shield', 3, 3, 1, 'spent', 'During an enemy’s attack, gain Shield 1.'],
  ['Spring Hammer', 3, 3, 2, 'spent', 'During your melee attack, add Push 2.'],
  ['Tanglevine Whip', 4, 4, 1, '', 'During your attack, consume Earth or Light to add Immobilize.'],
  ['Iron Nail', 4, 4, 2, 'spent', 'During your turn, add Pierce 2 to all your melee attacks.'],
  ['Leftover Table Scraps', 5, 5, 0, 'spent', 'During your turn, Heal 1 self.'],
  ['Magnetic Needle', 5, 5, 0, 'lost', 'During your turn, control one enemy within Range 5: Move 2.'],
  ['Nightshade Pollen', 6, 6, 0, '', 'After an enemy’s attack, consume Earth or Dark to Poison that enemy.'],
  ['Robin’s Feather Arrows', 6, 6, 0, '', 'During your single-target ranged attack, consume Fire or Wind to add +1 Range, Pierce 1.'],
  ['Volatile Powder', 7, 7, 0, 'lost', 'During your single-target ranged attack, add a triangle area of effect.'],
  ['Drop of Healing Potion', 7, 7, 0, 'lost', 'During your turn, Heal 3 self.'],
  ['Chestnut Shell Shield', 8, 8, 1, 'spent', 'During an enemy’s attack, gain Shield 1 and Retaliate 1.'],
  ['Fishing Hook and Line', 8, 8, 2, 'spent', 'During your ranged attack, add Pierce 2, Pull 2.'],
  ['Lubricating Oil', 9, 9, 0, 'spent', 'During your movement, add +2 Move.'],
  ['Brass Cog', 9, 9, 0, 'spent', 'After determining initiative, increase or decrease your initiative by 10.'],
  ['Drop of Stamina Potion', 10, 10, 0, 'lost', 'During your turn, recover one level 1 card from your hand or discard pile to its A-side.'],
  ['Drop of Element Potion', 10, 10, 0, 'lost', 'During your turn, create any two elements.'],
  ['Sewing Needles', 11, 11, 1, 'spent', 'During your attack, add Pierce 1.'],
  ['Pinch of Doom Powder', 11, 11, 0, 'lost', 'During your attack, add Disarm, Poison.'],
  ['Coin Shield', 12, 12, 1, 'spent', 'During an enemy’s attack, gain Shield 2.'],
  ['Sharpened Pencil', 12, 12, 2, 'spent', 'During your single-target melee attack, add a line area of effect, three hexes long.'],
  ['Shrunken Longsword', 13, 13, 1, 'spent', 'During your melee attack, add +1 Attack.'],
  ['Shrunken Longbow', 13, 13, 2, 'spent', 'During your ranged attack, add +1 Attack, Pierce 1.'],
  ['Lucky Cat’s-Eye Marble', 14, 14, 0, 'spent', 'During your attack, treat your minus attack modifier as a neutral one.'],
  ['Embernettle', 14, 14, 0, '', 'After an enemy’s attack, consume Fire or Earth to Wound that enemy.'],
  ['Playing Card Shield', 15, 15, 2, 'spent', 'During an enemy’s attack, gain Shield 4.'],
  ['Shard of Glass', 15, 15, 1, 'spent', 'During your melee attack, add Wound.'],
  ['Drop of Stamina Elixir', 16, 16, 0, 'lost', 'During your turn, recover one card from your hand or discard pile to its A-side.'],
  ['Drop of Haste Elixir', 16, 16, 0, 'lost', 'After performing the top action of an ability card, also perform its bottom action.'],
  ['Drop of Strength Potion', 17, 17, 0, 'lost', 'During your turn, Strengthen self.'],
  ['Prismatic Gem', 17, 17, 0, 'spent', 'During your attack, consume any element to add +1 Attack.'],
  ['Brightlure Gem', 18, 18, 0, '', 'After your attack, consume Wind or Light to control the target of the attack: Move 1.'],
  ['Duskhaze Gem', 18, 18, 0, '', 'During an enemy’s attack, consume Wind or Dark to gain Shield 1 and Muddle that enemy.'],
  ['Pocket Knife', 19, 19, 2, 'spent', 'During your melee attack, add +1 Attack, Pierce 2, Wound.'],
  ['Iridescent Shell Shield', 19, 19, 1, 'spent', 'During your turn, gain Shield 1 for the round. Create any element.'],
].map(([name, card, on, hands, use, text]) => ({ id: _bbSlug(name), name, card, on: String(on), hands, use, text }));
const BB_ITEM = Object.fromEntries(BB_ITEMS.map(i => [i.id, i]));
const BB_ON = { cover: 'The cover card', collector: 'The Collector’s card' };
const _bbOnName = (on) => BB_ON[on] || `Scenario ${on}’s card`;
const BB_HANDS = ['Item', 'One hand', 'Two hands'];
const BB_USE = { spent: 'Spent: back on a long rest', lost: 'Lost: back after the scenario', '': 'Passive' };

// The level table: level 2 cards (the level less one), items (half the level, rounded up).
const _bbUps = (L) => Math.max(0, Math.min(4, (L || 1) - 1));
const _bbCap = (L) => Math.ceil((L || 1) / 2);
// Variable difficulty: the Struggle cards' total less the Ease cards'.
const _bbDiffName = (d) => (!d ? 'Standard' : d > 0 ? (d >= 4 ? 'Very hard' : 'Hard') : (d <= -4 ? 'Very easy' : 'Easy'));
const _bbSigned = (v) => (v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '0');

let _bbCamps = null;          // bbCampaigns from Firebase: {id: campaign}
let _bbSrc = {};              // id → the store it lives in ('main' | 'spare', see fbWrite)
let _bbId = null;             // the campaign open; null: none (or the start form, with _bbDraft)
let _bbTab = 'camp';          // 'camp' | 'items' | 'chars' | 'notes'
let _bbDraft = null;          // the start form, while it's open
let _bbRes = null;            // the result being filled in on this phone
let _bbPanel = null;
let _bbSaveTimers = {};
let _bbPlaysStale = false;    // an attempt's play was logged: the Plays tab is drawn again when opened
const _bbLogging = new Set(); // id + log key: being logged on this phone

const _bbMe = () => (typeof _navPlayer === 'function' ? _navPlayer() : null);
const _bbChar = (id) => BB_CHARS.find(x => x.id === id) || null;
const _bbCharName = (id) => (_bbChar(id) || {}).name || 'Mercenary';
const _bbList = (v) => (Array.isArray(v) ? v : Object.values(v || {})).filter(x => x !== null && x !== undefined && x !== '');
const _bbLast = (c) => (c && c.prep && c.prep.char) || (c && c.char) || 'bruiser';
const _bbCard = (n) => BB_CARDS[Number(n)] || null;
const _bbTitle = (n) => { const k = _bbCard(n); return k ? `Scenario ${n}: ${k.name}` : `Scenario ${n}`; };
function _bbDate(v) {
  if (!v) return '';
  return new Date(Number(v)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
// The player's, and whoever started it: the ones who fill it in.
function _bbCanEdit(c) {
  const me = _bbMe();
  if (!me || !c) return false;
  return !c.player || c.player === me || c.by === me;
}
// Where a won scenario leads for the character who won it: { to, rule } or { end: true }.
function _bbNext(n, char) {
  const k = _bbCard(n);
  if (!k || k.end) return { end: true };
  const rule = (k.next || []).find(r => !r.char || r.char === char) || (k.next || [])[0];
  return rule ? { to: rule.to, rule } : { end: true };
}

// A card behind you (resolved or skipped): its items are yours to equip.
const _bbBehind = (c, card) => !!((c.won || {})[card]) || card < (Number(c.at) || 1);
const _bbOpen = (c) => BB_ITEMS.filter(it => _bbBehind(c, it.card));

// Why an item can't go with the others (''; it can): two hands, the level's items, one per card.
function _bbWhyNot(ids, it, L) {
  const with_ = ids.filter(x => x !== it.id).map(x => BB_ITEM[x]).filter(Boolean);
  if (it.hands) {
    if (with_.reduce((n, x) => n + x.hands, 0) + it.hands > 2) return 'your hands are full';
  } else if (with_.filter(x => !x.hands).length >= _bbCap(L)) return `${_bbCap(L)} item${_bbCap(L) === 1 ? '' : 's'} at level ${L || 1}`;
  const same = with_.find(x => x.on === it.on);
  if (same) return `one item from each card, and ${same.name} is on the same one`;
  return '';
}
// The next attempt's setup, as it can be for this scenario: its character
// (the card's, if it's for one), the level 2 cards and the items allowed.
function _bbPrep(c) {
  const p = c.prep || {}, card = _bbCard(c.at) || {}, L = card.level || 1;
  const char = card.req || p.char || c.char || 'bruiser';
  const up = (p.char && p.char !== char ? [] : _bbList(p.up).map(String)).slice(0, _bbUps(L));
  const open = new Set(_bbOpen(c).map(i => i.id));
  const items = [];
  for (const id of _bbList(p.items)) if (open.has(id) && BB_ITEM[id] && !_bbWhyNot(items, BB_ITEM[id], L)) items.push(id);
  return { char, up, items, diff: Math.max(-6, Math.min(6, Number(p.diff) || 0)), level: L };
}
// The level 2 cards known for a character: [{ name, for }], from its cards, then the ones typed in this campaign.
function _bbCardNames(c, char) {
  const out = (BB_CHAR_CARDS[char] || []).map(x => ({ name: x.l2, for: x.l1 }));
  for (const n of _bbList(((c && c.ups) || {})[char])) if (!out.some(x => x.name.toLowerCase() === String(n).toLowerCase())) out.push({ name: String(n) });
  return out;
}

async function _bbLoad(force) {
  if (force || !_bbCamps) {
    const { main, spare } = await fbReadBoth('bbCampaigns');
    _bbCamps = {};
    _bbSrc = {};
    for (const [store, data] of [['spare', spare], ['main', main]]) {
      for (const id in (data || {})) { if (data[id] && typeof data[id] === 'object') { _bbCamps[id] = data[id]; _bbSrc[id] = store; } }
    }
  }
  if (_bbId && !_bbCamps[_bbId]) _bbId = null;
}
// Some fields of the campaign: {path: value}, path relative to it; null removes.
async function _bbPatch(updates, id = _bbId) {
  const c = _bbCamps[id];
  if (!c) return;
  for (const [path, v] of Object.entries(updates)) _bbSetAt(c, path.split('/'), v);
  c.updated = Date.now();
  try {
    await fbWrite(`bbCampaigns/${id}`, 'PATCH', { ...updates, updated: c.updated }, _bbSrc[id]);
  } catch (e) {
    console.warn('Buttons & Bugs campaign: not saved', e);
    _bbToast('Not saved. Check the connection and try again.');
  }
}
function _bbSetAt(o, parts, v) {
  for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
  const last = parts[parts.length - 1];
  if (v === null || v === undefined) delete o[last]; else o[last] = v;
}
// A message under the campaign; it stays its time even if the tab is drawn again meanwhile.
let _bbSaid = null;   // { msg, ok, until }
function _bbToast(msg, ok) {
  _bbSaid = { msg, ok: !!ok, until: Date.now() + 6000 };
  _bbShowSaid();
}
function _bbShowSaid() {
  const el = _bbPanel && _bbPanel.querySelector('.rv-toast');
  if (!el || !_bbSaid || Date.now() >= _bbSaid.until) return;
  el.textContent = _bbSaid.msg;
  el.classList.toggle('ok', _bbSaid.ok);
  el.hidden = false;
  clearTimeout(_bbShowSaid.t);
  _bbShowSaid.t = setTimeout(() => { const e = _bbPanel && _bbPanel.querySelector('.rv-toast'); if (e) e.hidden = true; }, _bbSaid.until - Date.now());
}

// ── Where a campaign stands ──
function _bbState(c) {
  if (c.status === 'won') return 'the campaign is won';
  if (c.status === 'stopped') return `stopped ${_bbDate(c.stopped)}`;
  return `${c.playing ? 'playing' : 'up next:'} scenario ${c.at || 1}`;
}
// For Play → Campaigns: { pct, text, done }.
function bbSummary(c) {
  const done = c.status === 'won';
  const pct = done ? 100 : Math.min(95, Math.round(((Number(c.at) || 1) - 1) / BB_N * 100));
  return { pct, text: `${_bbCharName(_bbLast(c))} · ${_bbState(c)}`, done };
}
// The campaigns, for the tab: the viewer's first, then the latest.
function _bbIds() {
  const me = _bbMe();
  const mine = (c) => !!(me && (c.player === me || c.by === me));
  return Object.keys(_bbCamps || {})
    .sort((a, b) => { const A = _bbCamps[a], B = _bbCamps[b]; return (mine(B) - mine(A)) || ((B.updated || 0) - (A.updated || 0)); });
}

// ── rendering ──
function buildBbCampaignHtml(game) {
  if (!game || Number(game.bggId) !== BB_BGGID) return '';
  return `<div class="rv cr bb" data-bb><div class="rv-loading">Opening the campaigns…</div></div>`;
}

function wireBbCampaign(content) {
  const panel = content.querySelector('[data-bb]');
  if (!panel) return;
  _bbPanel = panel;
  _bbLoad(true).then(() => _bbRender(panel)).catch(e => {
    panel.innerHTML = `<div class="rv-loading">The campaigns couldn't be loaded. Try again in a moment.</div>`;
    console.warn('Buttons & Bugs campaign:', e);
  });
  panel.addEventListener('click', (ev) => _bbClick(panel, ev));
  panel.addEventListener('input', (ev) => _bbInput(panel, ev));
  // an attempt's play logged since the page opened: its Plays tab drawn again
  const tabs = content.querySelector('.gm-tabs');
  if (tabs) tabs.addEventListener('click', (ev) => {
    const t = ev.target.closest('.gm-tab');
    if (!t || t.dataset.tab !== 'plays' || !_bbPlaysStale) return;
    _bbPlaysStale = false;
    _modalTab = 'plays';
    _modalTabFor = BB_BGGID;
    openModal(findGameByBggId(BB_BGGID));
  });
}

function _bbTabsHtml() {
  const esc = _escapeHtml;
  const ids = _bbIds();
  const tab = (id) => {
    const c = _bbCamps[id], ch = _bbChar(_bbLast(c));
    return `<button type="button" class="cr-camp${id === _bbId ? ' on' : ''}${c.status ? ` ended ${c.status}` : ''}" data-bb-camp="${esc(id)}" style="--cr-c:${esc((ch && ch.color) || '#888')}" aria-expanded="${id === _bbId}">
      <b>${esc(c.name || `${c.player || 'A'}'s campaign`)}</b>
      <span>${esc(_bbCharName(_bbLast(c)))} · ${esc(_bbState(c))}</span>
      ${c.player ? `<span class="cr-camp-who">${esc(c.player)}</span>` : ''}</button>`;
  };
  const active = ids.filter(id => !_bbCamps[id].status), ended = ids.filter(id => _bbCamps[id].status);
  const isNew = !_bbId && !!_bbDraft;
  return `<div class="cr-camps">${active.map(tab).join('')}
      <button type="button" class="cr-camp cr-camp-new${isNew ? ' on' : ''}" data-bb-camp="__new" aria-expanded="${isNew}"><b>+ A new campaign</b><span>Solo · the deck of scenarios, start to end</span></button></div>
    ${ended.length ? `<div class="rv-sub">Stopped and finished</div><div class="cr-camps">${ended.map(tab).join('')}</div>` : ''}
    ${!_bbId && !_bbDraft && ids.length ? '<div class="rv-hint cr-camps-hint">Tap a campaign to open it.</div>' : ''}`;
}

function _bbRender(panel) {
  const esc = _escapeHtml;
  _bbPanel = panel;
  const c = _bbId && _bbCamps[_bbId];
  if (!c) {
    panel.innerHTML = `${_bbTabsHtml()}${_bbDraft ? _bbStartHtml() : ''}<div class="rv-toast" hidden></div>${_bbCreditHtml()}`;
    _bbWire(panel);
    _bbShowSaid();
    return;
  }
  const edit = _bbCanEdit(c);
  const ch = _bbChar(_bbLast(c));
  const nOpen = _bbOpen(c).length;
  const tabs = [['camp', 'Campaign'], ['items', `Items${nOpen ? ` <span class="gm-tab-n">${nOpen}</span>` : ''}`], ['chars', 'Characters'], ['notes', 'Notes']];
  const body = { camp: _bbCampHtml, items: _bbItemsHtml, chars: _bbCharsHtml, notes: _bbNotesHtml }[_bbTab](c, edit);
  panel.innerHTML = `
    ${_bbTabsHtml()}
    <div class="cr-open" style="--cr-m:${esc((ch && ch.color) || '#5a2e7a')}">
    <div class="rv-head">
      <input class="rv-party" data-bb-text="name" value="${esc(c.name || '')}" placeholder="Campaign name" ${edit ? '' : 'readonly'} aria-label="Campaign name">
    </div>
    <div class="cr-sub">Buttons &amp; Bugs campaign · ${esc(c.player || '?')}, lately as the <b style="color:${esc((ch && ch.color) || 'inherit')}">${esc(_bbCharName(_bbLast(c)))}</b></div>
    ${edit ? '' : `<div class="rv-ro">${_bbMe() ? 'Only its player can fill in this campaign.' : 'Log in to fill in the campaign.'}</div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_bbTab === k ? ' on' : ''}" data-bb-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body${edit ? '' : ' rv-readonly'}">${body}</div>
    </div>
    <div class="rv-toast" hidden></div>
    ${_bbCreditHtml()}`;
  _bbWire(panel);
  _bbShowSaid();
}
function _bbCreditHtml() {
  return `<div class="rv-credit">The scenarios in short, from Cephalofair's scenario cards: the cards have them in full. The level table and the items from the <a href="https://cephalofairgames.github.io/bnb-rules" target="_blank" rel="noopener">rules</a>.</div>`;
}

// The player: typed, with the names the app knows offered as you type.
function _bbWire(panel) {
  if (typeof comboAttach !== 'function') return;
  panel.querySelectorAll('input[data-bb-who]').forEach(inp => {
    const names = () => {
      const top = [...new Set([...(_bbMe() ? [_bbMe()] : []), ...(typeof ILIOUPOLI_MEMBERS !== 'undefined' ? ILIOUPOLI_MEMBERS : [])])];
      return [...top, ...[...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].filter(n => !top.includes(n)).sort()];
    };
    comboAttach(inp, { options: names, onPick: (v) => { if (_bbDraft) _bbDraft.player = v; }, max: 80 });
  });
}
function _bbClean(v, max = 40) { return String(v || '').trim().replace(/\s+/g, ' ').slice(0, max); }

// The characters as buttons, in their colours.
function _bbCharPicks(attr, on, locked) {
  const esc = _escapeHtml;
  return `<div class="cr-seg cr-seg-sm bb-chars">${BB_CHARS.map(x => `<button type="button" class="cr-seg-b${on === x.id ? ' on' : ''}" ${attr}="${x.id}" style="--cr-c:${esc(x.color)}"${locked && on !== x.id ? ' disabled' : ''}>${esc(x.name)}</button>`).join('')}</div>`;
}

// ── Starting a campaign: the player, the character to start with ──
function _bbStartHtml() {
  const esc = _escapeHtml;
  const d = _bbDraft;
  return `<div class="rv-start cr-start">
    <div class="rv-start-title">Start a Buttons &amp; Bugs campaign</div>
    <div class="rv-start-sub">Solo, down the deck of scenario cards. Each card sets your level and the items you can carry; a lost scenario is played again. Change character from one scenario to the next if you like: where a win leads depends on who won it.</div>
    <div class="rv-sub">Who's playing</div>
    <input class="rv-in cr-who cr-who-wide" data-bb-who="player" value="${esc(d.player)}" placeholder="The player" maxlength="40" enterkeyhint="done">
    <div class="rv-sub">The character to start with</div>
    <div class="cr-hpicks">${BB_CHARS.map(x => `<button type="button" class="cr-hpick${d.char === x.id ? ' on' : ''}" data-bb-draft-char="${x.id}" style="--cr-c:${esc(x.color)}" aria-pressed="${d.char === x.id}">
      <b>${esc(x.name)}</b>${x.blurb ? `<span>${esc(x.blurb)}</span>` : ''}</button>`).join('')}</div>
    <label class="rv-field cr-draft-name"><span>Campaign name</span><input class="rv-in" data-bb-draft-name value="${esc(d.name)}" placeholder="Optional"></label>
    ${_bbMe() ? `<button type="button" class="rv-btn" data-bb-start>Start the campaign</button>` : '<div class="rv-start-sub">Log in to start one.</div>'}
  </div>`;
}

// ── The Campaign tab: the scenario, the deck, the attempts ──
function _bbCampHtml(c, edit) {
  const esc = _escapeHtml;
  const top = c.status === 'stopped'
    ? `<div class="cr-end stopped">Stopped on ${esc(_bbDate(c.stopped))}: it's all kept as it was.${edit ? '<button type="button" class="rv-btn rv-btn-sm" data-bb-resume>Pick it up again</button>' : ''}</div>`
    : c.status === 'won'
      ? `<div class="cr-end won">The campaign is won. &#127881;</div>${edit ? '<button type="button" class="rv-link" data-bb-unfinish>Not over after all</button>' : ''}`
      : _bbScenarioHtml(c, edit);
  const log = Object.entries(c.log || {}).sort((a, b) => b[1].at - a[1].at);
  const wins = log.filter(([, l]) => l.won).length;
  return `${top}
    <div class="rv-sec">The deck <span class="cr-count">${Object.keys(c.won || {}).length} of ${BB_N} won</span></div>
    ${_bbDeckHtml(c)}
    ${log.length ? `<div class="rv-sec">Attempts <span class="cr-count">${log.length}${wins < log.length ? ` · ${log.length - wins} lost` : ''}</span></div>
      <div class="cr-log bb-log">${log.map(([ts, l]) => `<div class="cr-log-row"><span>${esc(_bbDate(l.at))}</span><span>Scenario ${esc(l.n)}<i> · ${esc(_bbAttemptText(l))}</i></span><b class="${l.won ? 'won' : 'lost'}">${l.won ? 'Won' : 'Lost'}</b><span class="cr-log-acts">${_bbLogActs(c, ts, l, edit)}</span></div>`).join('')}</div>` : ''}
    ${edit ? `<div class="pc-foot">${c.status ? '' : '<button type="button" class="rv-link" data-bb-stop>Stop this campaign</button>'}<button type="button" class="rv-link pc-del" data-bb-delete>Delete this campaign</button></div>` : ''}`;
}
// "Bruiser · level 2 · Hard +2 · 9 rounds"
function _bbAttemptText(l) {
  return [_bbCharName(l.char), l.level ? `level ${l.level}` : '', l.diff ? `${_bbDiffName(l.diff)} ${_bbSigned(l.diff)}` : '',
    l.rounds ? `${l.rounds} round${l.rounds === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ');
}

// The 20 cards: won, skipped (their items count all the same), the one up next, the ones ahead.
function _bbDeckHtml(c) {
  const esc = _escapeHtml;
  const at = Number(c.at) || 1, won = c.won || {};
  const tiles = [];
  for (let n = 1; n <= BB_N; n++) {
    const st = won[n] ? 'won' : n === at && c.status !== 'won' ? 'at' : n < at ? 'skip' : '';
    const what = { won: 'won', at: c.playing ? 'playing now' : 'up next', skip: 'skipped' }[st] || 'ahead';
    // a name only for the ones reached: the others' would give the story away
    tiles.push(`<span class="bb-tile${st ? ` ${st}` : ''}" title="${esc(`${st === 'won' || st === 'at' ? _bbTitle(n) : `Scenario ${n}`} (${what})`)}">${n}</span>`);
  }
  return `<div class="bb-deck">${tiles.join('')}</div>
    <div class="bb-legend"><span class="bb-key won"></span>won <span class="bb-key skip"></span>skipped: its items are yours all the same <span class="bb-key at"></span>${c.playing ? 'playing' : 'up next'}</div>`;
}

// The scenario the campaign is at: its card, the setup, or the attempt being played.
function _bbScenarioHtml(c, edit) {
  const esc = _escapeHtml;
  const n = String(c.at || 1), card = _bbCard(n);
  const goto = edit ? '<button type="button" class="rv-link" data-bb-goto>Go to another scenario</button>' : '';
  if (!card) return `<div class="rv-card cr-card">The deck has no scenario ${esc(n)}.${goto ? ` ${goto}` : ''}</div>`;
  const lost = Object.values(c.log || {}).filter(l => l && String(l.n) === n && !l.won).length;
  const st = c.playing ? 'Playing now' : lost ? `Again · lost ${lost === 1 ? 'once' : `${lost} times`}` : 'Up next';
  const head = `<div class="cr-card-top"><span class="cr-mc-n">${esc(n)}</span>
      <div class="cr-mc-id"><span class="cr-mc-st">${st}</span><b>${esc(card.name)}</b>
      <span>Scenario ${esc(n)} · level ${card.level}${card.req ? ` · for the ${esc(_bbCharName(card.req))}` : ''}</span></div></div>`;
  if (c.playing) return `<div class="rv-card cr-card cr-mcard playing">${head}${_bbSetupSumHtml(c)}${_bbRulesHtml(card)}${_bbResultHtml(c, card, edit)}</div>`;
  const pre = card.pre && BB_STORY[card.pre];
  return `<div class="rv-card cr-card cr-mcard">${head}
    ${pre ? `<div class="bb-story"><b>First, read ${esc(pre.name)}</b><div class="mr-read">${esc(pre.read)}</div>${pre.note ? `<div class="mr-fx">${esc(pre.note)}</div>` : ''}</div>` : ''}
    <div class="mr-read">${esc(card.read)}</div>
    ${_bbRulesHtml(card)}
    ${_bbLevelHtml(card.level)}
    ${_bbPrepHtml(c, edit)}
    ${goto}
  </div>`;
}
// What the card says to set up and to do: monsters, special rules, the goal.
function _bbRulesHtml(card) {
  const esc = _escapeHtml;
  return `<div class="cr-facts bb-facts">
    <div class="cr-fact rule"><span>Monsters</span><p>${esc(card.monsters.join(', '))}</p></div>
    ${(card.special || []).map(s => `<div class="cr-fact rule"><span>Special</span><p>${esc(s)}</p></div>`).join('')}
    <div class="cr-fact win"><span>Goal</span><p>${esc(card.goal || 'Defeat all monsters.')}</p></div>
    <div class="cr-fact boss"><span>Lost</span><p>Exhausted, or the goal can't be met: play the scenario again.</p></div>
  </div>`;
}
// What the level comes to.
function _bbLevelHtml(L) {
  const cap = _bbCap(L), ups = _bbUps(L);
  return `<div class="rv-sub">Level ${L}</div>
  <div class="cr-facts bb-facts bb-level">
    <div class="cr-fact rule"><span>Cards</span><p>${ups ? `Upgrade ${ups} of your four level 1 cards to level 2 (the pairs are on the back of the character card).` : 'Your four level 1 cards: none upgraded at level 1.'}</p></div>
    <div class="cr-fact rule"><span>Modifier</span><p>The level ${L} modifier table.</p></div>
    <div class="cr-fact rule"><span>Hit points</span><p>The red number under level ${L} on your character card.</p></div>
    <div class="cr-fact rw"><span>Items</span><p>Your hands (two one-hand items or a two-hand one) and ${cap} item${cap === 1 ? '' : 's'}; one item from each card.</p></div>
  </div>`;
}

// The setup for the next attempt: who, the level 2 cards, the items, the difficulty.
function _bbPrepHtml(c, edit) {
  const esc = _escapeHtml;
  const n = String(c.at || 1), card = _bbCard(n), p = _bbPrep(c), L = p.level;
  const need = _bbUps(L);
  const names = _bbCardNames(c, p.char), built = !!BB_CHAR_CARDS[p.char];
  const ups = need ? `<div class="rv-sub">Level 2 cards <span class="cr-note">${p.up.length} of ${need}</span></div>
    <div class="bb-chips">${names.map(x => {
      const on = p.up.includes(x.name);
      return `<button type="button" class="bb-chip${on ? ' on' : p.up.length >= need ? ' no' : ''}" data-bb-up="${esc(x.name)}" aria-pressed="${on}">${esc(x.name)}${x.for ? `<i>for ${esc(x.for)}</i>` : ''}</button>`;
    }).join('')}${edit && !built ? `<button type="button" class="bb-chip bb-chip-add" data-bb-up-add>+ ${names.length ? 'Another card' : `A ${esc(_bbCharName(p.char))} card`}</button>` : ''}</div>
    ${names.length ? '' : `<div class="rv-hint">Type each level 2 card's name as you upgrade it: they're kept for the ${esc(_bbCharName(p.char))} from then on.</div>`}` : '';
  const open = _bbOpen(c);
  const hands = p.items.reduce((s, id) => s + BB_ITEM[id].hands, 0), small = p.items.filter(id => !BB_ITEM[id].hands).length;
  const items = open.length ? `<div class="rv-sub">Items <span class="cr-note">hands ${hands} of 2 · items ${small} of ${_bbCap(L)}</span></div>
    <div class="bb-chips">${open.map(it => {
      const on = p.items.includes(it.id), why = on ? '' : _bbWhyNot(p.items, it, L);
      return `<button type="button" class="bb-chip k${it.hands}${on ? ' on' : why ? ' no' : ''}" data-bb-item="${it.id}" title="${esc(`${BB_HANDS[it.hands]} · ${BB_USE[it.use]}. ${it.text}${why ? ` (${why})` : ''}`)}" aria-pressed="${on}">${esc(it.name)}${it.hands ? `<i>${it.hands}h</i>` : ''}</button>`;
    }).join('')}</div>
    <div class="rv-hint">1h, 2h: one hand, two hands. What each one does: the Items tab.</div>`
    : '<div class="rv-sub">Items</div><div class="rv-hint">None yet: win scenario 1 for the first six, from the cover, scenario 1 and The Collector.</div>';
  return `<div class="bb-prep">
    <div class="rv-sub">Who's playing it${card.req ? ' <span class="cr-note">this scenario is for one character</span>' : ''}</div>
    ${_bbCharPicks('data-bb-char', p.char, !!card.req)}
    ${ups}
    ${items}
    <div class="rv-sub">Difficulty <span class="cr-note">Struggle cards less Ease cards</span></div>
    <div class="bb-diff"><button type="button" class="rv-dot" data-bb-diff="-1" aria-label="Easier"${p.diff > -6 ? '' : ' disabled'}>&minus;</button>
      <b class="cr-n">${_bbSigned(p.diff)}</b>
      <button type="button" class="rv-dot" data-bb-diff="1" aria-label="Harder"${p.diff < 6 ? '' : ' disabled'}>+</button>
      <span class="bb-diff-name d${Math.sign(p.diff)}">${_bbDiffName(p.diff)}</span></div>
    ${edit ? `<button type="button" class="rv-btn cr-begin" data-bb-begin>Start scenario ${esc(n)}</button>` : ''}
  </div>`;
}
// The setup of the attempt being played.
function _bbSetupSumHtml(c) {
  const esc = _escapeHtml;
  const p = _bbPrep(c), ch = _bbChar(p.char);
  return `<div class="cr-facts bb-facts">
    <div class="cr-fact rule"><span>Who</span><p><b style="color:${esc((ch && ch.color) || 'inherit')}">${esc(_bbCharName(p.char))}</b> at level ${p.level}</p></div>
    ${_bbUps(p.level) ? `<div class="cr-fact rule"><span>Level 2</span><p>${p.up.length ? esc(p.up.join(', ')) : 'Not noted'}</p></div>` : ''}
    <div class="cr-fact rw"><span>Items</span><p>${p.items.length ? esc(p.items.map(id => BB_ITEM[id].name).join(', ')) : 'None'}</p></div>
    <div class="cr-fact rule"><span>Difficulty</span><p>${esc(_bbDiffName(p.diff))}${p.diff ? ` (${_bbSigned(p.diff)})` : ''}</p></div>
  </div>`;
}

// The result being filled in: won or lost, the rounds; a win shows the conclusion and where it leads.
function _bbResultHtml(c, card, edit) {
  const esc = _escapeHtml;
  if (!edit) return '<div class="rv-hint">The scenario is being played.</div>';
  const n = String(c.at);
  if (!_bbRes || _bbRes.id !== _bbId || _bbRes.n !== n) _bbRes = { id: _bbId, n, out: null, rounds: '' };
  const r = _bbRes, p = _bbPrep(c);
  let lead = '';
  if (r.out === 'won') {
    const nx = _bbNext(n, p.char);
    lead = `<div class="mr-read">${esc(card.after)}</div>
      <div class="mr-lead">${nx.end ? 'The end: winning it wins the campaign.'
        : `Next: <b>${esc(_bbTitle(nx.to))}</b>${nx.rule.char ? ` <span class="cr-note">as the ${esc(_bbCharName(nx.rule.char))}</span>` : (card.next || []).some(x => x.char) ? ` <span class="cr-note">as any character but the ${esc(_bbCharName(card.next.find(x => x.char).char))}</span>` : ''}`}</div>`;
  } else if (r.out === 'lost') lead = '<div class="mr-lead">Then the scenario again: everything back as it was, the same setup or another.</div>';
  return `<div class="mr-result">
    <div class="cr-ask-q">How did it go?</div>
    <div class="cr-seg"><button type="button" class="cr-seg-b${r.out === 'won' ? ' on' : ''}" data-bb-res-out="won">Won</button><button type="button" class="cr-seg-b${r.out === 'lost' ? ' on' : ''}" data-bb-res-out="lost">Lost</button></div>
    ${r.out ? `
    <label class="cr-row"><span class="cr-lbl cr-lbl-wide">Rounds <span class="cr-note">optional</span></span>
      <input class="rv-in bb-rounds" type="number" inputmode="numeric" min="1" max="99" data-bb-res-rounds value="${esc(r.rounds)}" placeholder="–"></label>
    ${lead}
    <button type="button" class="rv-btn cr-begin" data-bb-save>Save the result</button>` : ''}
    <button type="button" class="rv-link" data-bb-cancel>Not playing it after all</button>
  </div>`;
}

// A line of the attempts: its play (BG Stats' QR code and the pencil), or a button to log it.
function _bbLogActs(c, ts, l, edit) {
  if (l.play) {
    const i = (PLAY_HISTORY[BB_BGGID] || []).findIndex(e => e.mp === l.play);
    if (i < 0) return '';
    return (typeof bgsSendBtnHtml === 'function' ? bgsSendBtnHtml(BB_BGGID, i) : '')
      + (typeof logPlayEditBtnHtml === 'function' ? logPlayEditBtnHtml(PLAY_HISTORY[BB_BGGID][i]) : '');
  }
  const signed = typeof acctMe === 'function' && acctMe();
  return edit && signed ? `<button type="button" class="cr-mini" data-bb-logplay="${_escapeHtml(ts)}">Log the play</button>` : '';
}

// ── The Items tab: the ones unlocked, by card, with what they do ──
function _bbItemsHtml(c) {
  const esc = _escapeHtml;
  const open = _bbOpen(c), p = c.status ? null : _bbPrep(c);
  const shut = BB_ITEMS.length - open.length;
  const byCard = [];
  for (const it of open) { const g = byCard.find(x => x.on === it.on); if (g) g.items.push(it); else byCard.push({ on: it.on, items: [it] }); }
  const row = (it) => {
    const on = p && p.items.includes(it.id);
    return `<div class="bb-item k${it.hands}${on ? ' on' : ''}">
      <div class="bb-item-h"><b>${esc(it.name)}</b>${on ? '<span class="bb-eq">equipped</span>' : ''}</div>
      <span class="bb-item-k">${BB_HANDS[it.hands]} · ${esc(BB_USE[it.use])}</span>
      <span class="bb-item-t">${esc(it.text)}</span></div>`;
  };
  return `<div class="rv-hint rv-hint-top">The items on every card behind you, resolved or skipped: one from each card at a time, as many as your hands and your level allow. ${p ? 'Equip them for the next scenario on the Campaign tab.' : ''}</div>
    ${byCard.length ? byCard.map(g => `<div class="rv-sub">${esc(_bbOnName(g.on))}</div><div class="bb-items">${g.items.map(row).join('')}</div>`).join('')
      : '<div class="cr-end stopped">None yet: win scenario 1 for the first six.</div>'}
    ${shut ? `<div class="rv-hint">${shut} more on the cards ahead.</div>` : ''}`;
}

// ── The Characters tab: each one's attempts, and its ability cards ──
function _bbCharsHtml(c, edit) {
  const esc = _escapeHtml;
  const log = Object.values(c.log || {});
  return `<div class="rv-hint rv-hint-top">Any character can play any scenario but the six that are for one character. A win's next scenario depends on who won it.</div>
    <div class="bb-charlist">${BB_CHARS.map(x => {
      const mine = log.filter(l => l && l.char === x.id), won = mine.filter(l => l.won);
      const built = BB_CHAR_CARDS[x.id];
      const own = _bbList((c.ups || {})[x.id]);
      const cards = built
        ? `<div class="bb-pairs">${built.map(k => `<div class="bb-pair"><span><b>${esc(k.l1)}</b><i>B: ${esc(k.b1)}</i></span><span class="bb-pair-to" aria-hidden="true">&rarr;</span><span><b>${esc(k.l2)}</b><i>B: ${esc(k.b2)}</i></span></div>`).join('')}</div>`
        : own.length || edit ? `<div class="bb-chips">${own.map(nm => `<span class="bb-chip bb-chip-static">${esc(nm)}${edit ? `<button type="button" class="bb-chip-x" data-bb-up-del="${esc(x.id)}|${esc(nm)}" aria-label="Remove ${esc(nm)}">&times;</button>` : ''}</span>`).join('')}
          ${edit ? `<button type="button" class="bb-chip bb-chip-add" data-bb-up-add="${esc(x.id)}">+ A level 2 card</button>` : ''}</div>` : '';
      return `<div class="bb-charrow" style="--cr-c:${esc(x.color)}">
        <div class="bb-charrow-h"><b>${esc(x.name)}</b><span class="cr-note">${mine.length ? `${mine.length} attempt${mine.length === 1 ? '' : 's'}, ${won.length} won${won.length ? `: scenario ${[...new Set(won.map(l => l.n))].join(', ')}` : ''}` : 'not played yet'}</span></div>
        ${cards}
      </div>`;
    }).join('')}</div>`;
}

function _bbNotesHtml(c, edit) {
  return `<textarea class="rv-in cr-notes" data-bb-text="notes" rows="10" placeholder="What the story revealed, which road you took, what worked…" ${edit ? '' : 'readonly'}>${_escapeHtml(c.notes || '')}</textarea>`;
}

// ── An attempt's play: logged in the app (js/log-play.js) and offered to BG Stats ──
// The player, with the character as their role; "Scenario 5" as the scenario,
// as the plays have it; from when the scenario was started.
async function _bbLogPlay(id, ts) {
  const c = _bbCamps[id], l = c && (c.log || {})[ts];
  if (!l || l.play) return null;
  if (typeof logPlaySave !== 'function' || !(typeof acctMe === 'function' && acctMe())) return null;   // signed in, its line offers "Log the play"
  const start = l.from && l.from < l.at && l.at - l.from < 12 * 3600e3 ? l.from : l.at;
  const d = new Date(start), pad = (n) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const items = _bbList(l.items).map(i => (BB_ITEM[i] || {}).name).filter(Boolean), ups = _bbList(l.up);
  const card = _bbCard(l.n);
  const rec = {
    bggId: BB_BGGID, date, t: `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    sc: [{ n: c.player || _bbMe(), w: !!l.won, r: _bbCharName(l.char) }],
    b: `Scenario ${l.n}`,
    c: [`${c.name ? `${c.name}: ` : ''}campaign`, card ? card.name : '', l.level ? `level ${l.level}` : '', l.diff ? `${_bbDiffName(l.diff)} (${_bbSigned(l.diff)})` : '',
      l.rounds ? `${l.rounds} rounds` : '', ups.length ? `level 2: ${ups.join(', ')}` : '', items.length ? `items: ${items.join(', ')}` : ''].filter(Boolean).join(' · '),
  };
  const mins = start === l.from ? Math.round((l.at - l.from) / 60000) : 0;
  if (mins >= 1) rec.d = mins;
  try {
    const r = await logPlaySave(rec);
    await _bbPatch({ [`log/${ts}/play`]: r.id }, id);
    _bbPlaysStale = true;
    return r;
  } catch (e) {
    return { err: `The play wasn't logged: ${e.message || 'try again'}. The "Log the play" button on the attempt's line tries again.` };
  }
}
async function _bbAfter(id, ts) {
  if (_bbLogging.has(id + ts)) return;
  _bbLogging.add(id + ts);
  const r = await _bbLogPlay(id, ts).finally(() => _bbLogging.delete(id + ts));
  if (!r) return;
  if (r.err) { _bbToast(r.err); _bbRedraw(); return; }
  _bbRedraw();
  const i = (PLAY_HISTORY[BB_BGGID] || []).findIndex(e => e.mp === r.id);
  if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(BB_BGGID, i);
}
function _bbRedraw() {
  const p = _bbPanel;
  if (!p || !p.isConnected) return;
  const a = document.activeElement;
  if (a && p.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
  _bbRender(p);
}

// ── what a tap does ──
async function _bbClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.bbTab) { _bbTab = ds.bbTab; _bbRender(panel); return; }
  if (ds.bbCamp) {
    const id = ds.bbCamp;
    if (id === '__new') {
      const open = !_bbId && _bbDraft;
      _bbId = null;
      _bbDraft = open ? null : { char: 'bruiser', player: _bbMe() || '', name: '' };
    } else if (_bbId === id) _bbId = null;
    else { _bbId = id; _bbDraft = null; _bbTab = 'camp'; _bbRes = null; }
    _bbRender(panel);
    return;
  }
  if (!_bbId) return _bbDraftClick(panel, t, ds);
  const c = _bbCamps[_bbId];
  // the result as this phone fills it in, saved with "Save the result"
  if (ds.bbResOut) {
    if (!_bbRes || !c) return;
    _bbRes.out = ds.bbResOut;
    _bbRender(panel);
    return;
  }
  if (!c || !_bbCanEdit(c)) return;
  if (ds.bbDelete !== undefined) {
    if (!confirm(`Delete “${c.name || 'this campaign'}”? Its plays stay in the play log; only the campaign goes.`)) return;
    const id = _bbId;
    try { await fbWrite(`bbCampaigns/${id}`, 'DELETE', null, _bbSrc[id]); }
    catch (e) { console.warn('Buttons & Bugs campaign: not deleted', e); _bbToast('Not deleted. Check the connection and try again.'); return; }
    delete _bbCamps[id];
    _bbId = null;
    _bbRender(panel);
    return;
  }
  if (ds.bbLogplay) {
    if (_bbLogging.has(_bbId + ds.bbLogplay)) return;
    t.disabled = true;
    _bbAfter(_bbId, ds.bbLogplay);
    return;
  }
  const n = String(c.at || 1), card = _bbCard(n);
  const up = {};
  let note = '', ok = false, after = null;
  if (ds.bbStop !== undefined) {
    if (!confirm('Stop this campaign? Everything stays as it is, under "Stopped and finished", and it can be picked up again any time.')) return;
    Object.assign(up, { status: 'stopped', stopped: Date.now(), playing: null });
    note = 'Stopped. Pick it up again from its tab any time.';
  } else if (ds.bbResume !== undefined) { up.status = null; up.stopped = null; }
  else if (ds.bbUnfinish !== undefined) up.status = null;
  else if (ds.bbGoto !== undefined) {
    const k = _bbClean(prompt('Which scenario? (to correct where the campaign is: nothing else changes)', n), 3);
    if (!k) return;
    if (!(Number(k) >= 1 && Number(k) <= BB_N)) { _bbToast(`The deck has scenarios 1 to ${BB_N}.`); return; }
    Object.assign(up, { at: String(Number(k)), playing: null, status: null });
    _bbRes = null;
  } else if (ds.bbChar) up['prep/char'] = ds.bbChar;
  else if (ds.bbDiff) up['prep/diff'] = Math.max(-6, Math.min(6, _bbPrep(c).diff + Number(ds.bbDiff)));
  else if (ds.bbItem) {
    const p = _bbPrep(c), it = BB_ITEM[ds.bbItem];
    if (!it) return;
    if (p.items.includes(it.id)) up['prep/items'] = p.items.filter(x => x !== it.id);
    else {
      const why = _bbWhyNot(p.items, it, p.level);
      if (why) { _bbToast(`${it.name}: ${why}. Take one off first.`); return; }
      up['prep/items'] = [...p.items, it.id];
    }
    Object.assign(up, { 'prep/char': p.char, 'prep/up': p.up });
  } else if (ds.bbUp) {
    const p = _bbPrep(c), need = _bbUps(p.level);
    if (p.up.includes(ds.bbUp)) up['prep/up'] = p.up.filter(x => x !== ds.bbUp);
    else if (p.up.length >= need) { _bbToast(`${need} level 2 card${need === 1 ? '' : 's'} at level ${p.level}: take one off first.`); return; }
    else up['prep/up'] = [...p.up, ds.bbUp];
    up['prep/char'] = p.char;
  } else if (ds.bbUpAdd !== undefined) {
    const p = _bbPrep(c), char = ds.bbUpAdd || p.char;
    const nm = _bbClean(prompt(`A level 2 card of the ${_bbCharName(char)}: its name, as on the card`, ''), 40);
    if (!nm) return;
    const list = _bbList((c.ups || {})[char]);
    const known = _bbCardNames(c, char).find(x => x.name.toLowerCase() === nm.toLowerCase());
    if (!known) up[`ups/${char}`] = [...list, nm];
    // picked for the next scenario too, when there's room
    const name = known ? known.name : nm;
    if (!ds.bbUpAdd && !p.up.includes(name) && p.up.length < _bbUps(p.level)) Object.assign(up, { 'prep/up': [...p.up, name], 'prep/char': p.char });
  } else if (ds.bbUpDel) {
    const [char, nm] = ds.bbUpDel.split('|');
    if (!confirm(`Take “${nm}” off the ${_bbCharName(char)}'s cards?`)) return;
    up[`ups/${char}`] = _bbList((c.ups || {})[char]).filter(x => x !== nm);
  } else if (ds.bbBegin !== undefined) {
    const p = _bbPrep(c);
    Object.assign(up, { playing: Date.now(), char: p.char, prep: { char: p.char, up: p.up, items: p.items, diff: p.diff } });
    _bbRes = null;
    const short = _bbUps(p.level) - p.up.length;
    note = `${_bbTitle(n)} on, as the ${_bbCharName(p.char)}. ${short > 0 ? `(${short} level 2 card${short === 1 ? '' : 's'} not noted.) ` : ''}Good luck!`;
    ok = true;
  } else if (ds.bbCancel !== undefined) { up.playing = null; _bbRes = null; }
  else if (ds.bbSave !== undefined) {
    const r = _bbRes;
    if (!r || !r.out || !card) return;
    const p = _bbPrep(c), won = r.out === 'won';
    after = String(Date.now());
    const rounds = Math.max(0, Math.min(99, parseInt(r.rounds, 10) || 0));
    up[`log/${after}`] = { n, won, char: p.char, level: p.level, ...(p.up.length ? { up: p.up } : {}), ...(p.items.length ? { items: p.items } : {}),
      ...(p.diff ? { diff: p.diff } : {}), ...(rounds ? { rounds } : {}), at: Date.now(), from: c.playing || Date.now(), by: _bbMe() || '' };
    up.playing = null;
    _bbRes = null;
    if (!won) note = `Lost. Scenario ${n} again: the same setup is ready, or change it.`;
    else {
      up[`won/${n}`] = Date.now();
      const nx = _bbNext(n, p.char);
      if (nx.end) { up.status = 'won'; note = 'The campaign is won!'; }
      else {
        up.at = nx.to;
        const was = new Set(_bbOpen(c).map(i => i.id));
        const fresh = BB_ITEMS.filter(it => !was.has(it.id) && (it.card === Number(n) || it.card < Number(nx.to) || (c.won || {})[it.card]));
        note = `Won! ${_bbTitle(nx.to)} next.${fresh.length ? ` New item${fresh.length === 1 ? '' : 's'}: ${fresh.map(i => i.name).join(', ')}.` : ''}`;
      }
      ok = true;
    }
  }
  if (!Object.keys(up).length) return;
  const id = _bbId;
  const saved = _bbPatch(up);
  _bbRender(panel);
  if (note) _bbToast(note.trim(), ok);
  if (after) saved.then(() => _bbAfter(id, after));
}

async function _bbDraftClick(panel, t, ds) {
  const d = _bbDraft;
  if (!d) return;
  if (ds.bbDraftChar) d.char = ds.bbDraftChar;
  else if (ds.bbStart !== undefined) {
    d.player = _bbClean((panel.querySelector('[data-bb-who="player"]') || {}).value) || _bbMe();
    if (!d.player) { _bbToast('Who\'s playing?'); return; }
    t.disabled = true;
    const c = { name: d.name.trim(), player: d.player, char: d.char, at: '1', prep: { char: d.char }, created: Date.now(), updated: Date.now(), by: _bbMe() };
    try {
      const { store, json } = await fbWrite('bbCampaigns', 'POST', c);
      _bbCamps[json.name] = c;
      _bbSrc[json.name] = store;
      _bbId = json.name;
    } catch (e) {
      console.warn('Buttons & Bugs campaign: not started', e);
      t.disabled = false;
      t.textContent = 'Couldn\'t start it. Try again';
      return;
    }
    _bbDraft = null;
    _bbTab = 'camp';
  } else return;
  _bbRender(panel);
}

// Typing in the name, the notes or the rounds: saved a moment after you stop.
function _bbInput(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-bb-draft-name]') && _bbDraft) { _bbDraft.name = t.value; return; }
  if (t.matches('[data-bb-who="player"]') && _bbDraft) { _bbDraft.player = t.value; return; }
  if (t.matches('[data-bb-res-rounds]') && _bbRes) { _bbRes.rounds = t.value; return; }
  const path = t.dataset && t.dataset.bbText;
  if (!path) return;
  const c = _bbCamps[_bbId];
  if (!c || !_bbCanEdit(c)) return;
  clearTimeout(_bbSaveTimers[path]);
  const v = path === 'notes' ? t.value : _bbClean(t.value, 60);
  _bbSaveTimers[path] = setTimeout(() => _bbPatch({ [path]: v || null }), 700);
}
