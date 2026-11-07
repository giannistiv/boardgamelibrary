// ── Mini Rogue campaigns (the Campaign tab on Mini Rogue's and The Council's game pages) ──
// The solo campaign: one player, one character for the whole campaign, a
// chapter at a time, each kept in Firebase (mrCampaigns/{id}). A chapter is
// read (and may offer a choice), or played: its setup, what wins it, where a
// win leads. Every game earns Perk Points (1 per Floor completed, a won
// chapter counting its last Floor, and 1 per Level past the first), spent on
// the campaign sheet's skill tree: three paths, at most two of them, one
// branch of each. Each attempt is logged as a play, offered to BG Stats.
//
// The two campaigns differ:
//   Mini Rogue   each chapter starts afresh (Roguelike difficulty, the
//                character's starting stats); a death replays the chapter, or
//                the book sends you elsewhere; Relics are kept for good.
//   The Council  the stats carry on from chapter to chapter (the sheet keeps
//                them: HP, XP, Armor, Food, Gold, Potions, the Item held),
//                with Notoriety and an Inventory (Council Token, Hint, Hand of
//                Selinas, Skeleton Key); some chapters test your Notoriety or
//                your skill first, and only a failure means a fight; a death
//                restarts the whole campaign from chapter 1, with the starting
//                stats and an empty Inventory, keeping the Skills and the
//                Perk Points.
//
// The chapters are here in short, from the campaign books (Nuts! Publishing):
// Mini Rogue's is published (nutspublishing.com, Mini Rogue downloads); The
// Council's and the campaign sheet were read from the user's own copy. A
// chapter's text shows once the campaign reaches it, so the story isn't
// given away.

const MR_BGGID = 311715;
const MRC_BGGID = 417020;

// The characters, by box (Rat Catcher's starting stats: the rulebook's example).
const MR_CHARS = [
  { id: 'rogue', name: 'Rogue', box: 'Mini Rogue', color: '#8a5ab0', blurb: 'Cunning, deadly strikes, and an expert at not being seen.' },
  { id: 'crusader', name: 'Crusader', box: 'Mini Rogue', color: '#b8892c', blurb: 'Uses armor both to attack and to shield from monsters.' },
  { id: 'priestess', name: 'Priestess', box: 'Mini Rogue', color: '#3f8f8a', blurb: 'Spends her life force to strengthen her attacks; calls for blessings.' },
  { id: 'mage', name: 'Mage', box: 'Mini Rogue', color: '#3c6fb4', blurb: 'Conjures magic attacks and foresees the dangers ahead.' },
  { id: 'ratcatcher', name: 'Rat Catcher', box: 'The Council', color: '#7d6a3a', blurb: 'Powers that trigger on spending and gaining Food.', start: { hp: 10, food: 3, gold: 5, armor: 0, potions: ['poison'] } },
  { id: 'flagellant', name: 'Flagellant', box: 'The Council', color: '#a0392f', blurb: 'Uses his own health as a resource.' },
  { id: 'plaguedoctor', name: 'Plague Doctor', box: 'The Council', color: '#4f7a3a', blurb: 'Powers that trigger when characters are poisoned.' },
  { id: 'alchemist', name: 'Alchemist', box: 'The Council', color: '#b06a2a', blurb: 'Buys potions while exploring; gold buys rerolls.' },
  { id: 'thief', name: 'Thief', box: 'Expansions', color: '#5b5f6b' },
  { id: 'cleric', name: 'Cleric', box: 'Expansions', color: '#c2a14a' },
  { id: 'witch', name: 'Witch', box: 'Expansions', color: '#6d3f8c' },
  { id: 'bones', name: 'Bones', box: 'Expansions', color: '#8c8c80' },
  { id: 'occultist', name: 'Occultist', box: 'Expansions', color: '#5a4a7a' },
  { id: 'tinkerer', name: 'Tinkerer', box: 'Expansions', color: '#7a6a4a' },
];

// ── The chapters ──
// kind: 'story' (read: its opts say where to go), 'play' (a game), 'end'.
// opts: [{ to, text, if, fx }]: where to go from here; if: what it needs
// ({char: [...]} the book's character branches, {inv}, {noto: n+}, {gold: n+},
// {visited}/{notVisited} a chapter since the campaign (re)started, {coop}).
// acts: [{ text, fx, if }]: something done here without leaving.
// fx: what happens to the sheet (The Council: {hp, gold, food, xp, armor}
// as changes, set: {...} as values, hpToStart, inv: {id: bool}, noto, item).
// A story chapter's fx happen on arriving, a played one's when it starts;
// winFx when it's won. test: a Notoriety test ({what: 'noto', pass: 'above' |
// 'below'}) or Skill Checks ({what: 'skill', n}) before the game: passed,
// go to ok; failed, the game (a fight) is played, or retry costs that.
// win / boss: where a win, or being killed by the chapter's boss, leads (by
// character when the book says so). floors: Floors to complete (Mini Rogue:
// from start to last); 0, a fight with no exploration: no Perk Points for
// winning it.
const MR_BASE_CHAPTERS = [
  { n: '1', kind: 'story', place: 'The City', read: 'The King sends his elected champion north for the Og\'s Blood. Around his neck, an obsidian amulet shimmers.',
    opts: [{ to: '8', text: 'Set out for the Emerald Tower', if: { char: ['rogue', 'crusader'] } }, { to: '10', text: 'Ride through the Ivory Plains', if: { char: ['priestess', 'mage', 'cleric'] } }] },
  { n: '8', kind: 'play', place: 'An old sewer', side: 'Dungeon', start: 1, last: 2,
    read: 'On the way to the Emerald Tower, two robed figures ambush you in the Murky Forest. You wake in an old sewer.',
    setup: ['Add the Curse and Poison dice to your dice pool.'], goal: 'Defeat the Boss at the end of the second Floor.', win: '11', boss: '4' },
  { n: '10', kind: 'play', place: 'A derelict tower', side: 'Tower', start: 1, last: 2,
    read: 'Lost in the fog of the Ivory Plains, you enter an old tower and its doors seal behind you.',
    setup: ['Set the Cursed Dragon as the second Boss.', 'Add the Curse die to your dice pool.'], goal: 'Defeat the Cursed Dragon.', win: '11', boss: '5', bossName: 'the Cursed Dragon' },
  { n: '4', kind: 'play', place: 'The black tower', side: 'Tower', start: 1, last: 3, relic: 'pilgrim',
    read: 'An old man and young Eddar pulled you out of the sewers. Your potions are shards. You need the Eye to find the Og\'s Blood.',
    setup: ['Remove the Cursed Dragon from the game.', 'Gain the Pilgrim\'s Flesh.'], goal: 'Defeat the Boss of the third Floor.', win: { rogue: '6', crusader: '9' } },
  { n: '5', kind: 'play', place: 'The tower', side: 'Tower', start: 2, last: 3,
    read: 'The dragon\'s village ties you to a pyre. Strange words pour out of you, and you wake on cold ground.',
    setup: ['Start on the second Floor.', 'Remove the Cursed Dragon from the game.'], goal: 'Defeat the Boss of the third Floor.', win: { mage: '6', priestess: '9', cleric: '9' } },
  { n: '11', kind: 'play', place: 'The tower', side: 'Tower', start: 2, last: 3, relic: 'bone',
    read: 'A one-eyed woman nurses you and fastens an amulet around your neck: "They want you to finish what you\'ve started."',
    setup: ['Start on the second Floor.', 'Remove the Cursed Dragon from the game.', 'Gain the Bone of Ernazar.'], goal: 'Defeat the Boss of the third Floor.', win: { rogue: '6', mage: '6', priestess: '9', crusader: '9', cleric: '9' } },
  { n: '6', kind: 'play', place: 'The dungeon', side: 'Dungeon', start: 1, last: 4, relic: 'eye', final: true,
    read: 'The Eye of Constantine is yours, and you give in to its whispers: "Find the traitor\'s heart."',
    setup: ['HP 12 with the Pilgrim\'s Flesh, otherwise 10.', '1 XP more with the Bone of Ernazar.', 'Gain the Eye of Constantine.'], goal: 'Defeat Og\'s Remains on the last Floor.', win: '3', bossName: 'Og\'s Remains' },
  { n: '9', kind: 'play', place: 'The dungeon', side: 'Dungeon', start: 1, last: 4, relic: 'eye', final: true,
    read: 'The Eye of Constantine is yours, and it leads you to the dungeon of the Og\'s Blood.',
    setup: ['1 XP more with the Bone of Ernazar.', 'Gain the Eye of Constantine.'], goal: 'Defeat Og\'s Remains.', win: '3', bossName: 'Og\'s Remains' },
  { n: '3', kind: 'story', place: 'Og\'s Remains', read: 'The ruby is a blood-filled vial. A voice inside you says: "Wear the blood of the traitor."',
    opts: [{ to: '7', text: 'Put the Og\'s Blood around your neck' }, { to: '2', text: 'Honor your word: bring it back to the King' }] },
  { n: '2', kind: 'end', place: 'The City', read: 'You bring the King the Og\'s Blood and the Eye. They make him a god, and not a merciful one. You end up in his deepest cell… or do you?' },
  { n: '7', kind: 'end', place: 'Og\'s domain', read: 'The Old Gods speak to you. His lifeblood is now yours, and your life is theirs: you have become Og.' },
];

// The Council's: the City side or the Cathedral side of the City mat.
const MR_PALACE_DECK = ['Shuffle all the Monster and Item cards (those put aside or in your inventory too) into a separate deck and fill the rest of the Area with it.', 'Discard your Item cards after completing Area 1.'];
const MR_COUNCIL_CHAPTERS = [
  { n: '1', kind: 'story', place: 'The Palace dungeon', read: 'By the King\'s decree, the forsaken Champion of the City will be executed for treason at the next full moon.',
    opts: [{ to: '19', text: 'You are the Champion who brought the King the Og\'s Blood, 11 years ago' }, { to: '46', text: 'You are the cellmate of the Champion who died in the cell' }] },
  { n: '19', kind: 'story', place: 'Your cell', read: '"Treason," you spit. Eleven years beaten in a cell, for bringing back the most prized treasure of all.', opts: [{ to: '44' }] },
  { n: '46', kind: 'story', place: 'Your cell', read: 'Thrown in the Champion\'s cell for your own crimes, you heard their tale until they died. Now you wear their mantle: no one remembers their face.',
    fx: { noto: 1 }, opts: [{ to: '44' }] },
  { n: '44', kind: 'story', place: 'Your cell', read: 'Sentenced to death within a week. Then the High Priestess of the Church of the Sacred Stone comes to your cell: "And who is this wretch behind you?"',
    opts: [{ to: '8', text: 'Playing solo', if: { coop: false } }, { to: '16', text: 'Playing co-op', if: { coop: true } }] },
  { n: '8', kind: 'story', place: 'Your cell', read: 'Your cellmate lies dead against the wall. You stay silent; the High Priestess only says "Very well."', opts: [{ to: '41' }] },
  { n: '16', kind: 'story', place: 'Your cell', read: 'Your cellmate speaks up for the first time in years, seizing the chance. "Very well…"', opts: [{ to: '41' }] },
  { n: '41', kind: 'play', place: 'The Palace dungeon', side: 'City', floors: 1,
    read: 'The High Priestess buys you a reprieve: bring her the Hand of Selinas, an ancient relic in this very dungeon.',
    fx: { set: { hp: 3, food: 1, gold: 0, armor: 0, potions: [] } },
    setup: ['Start at Floor 1, Area 1.', 'HP 3, Food 1, Gold 0. Lose all your Potions and Armor.', 'The Floor 1 Boss is the Honor Guard.'],
    special: ['For the first Area only, take the Monster and Trap cards out of the Room deck for the Preparation Phase, then shuffle them back.'],
    goal: 'Kill the Boss of Area 2.', win: '42' },
  { n: '42', kind: 'story', place: 'The Palace', read: 'The High Priestess reveals the Council, sworn to stop the King as he raises the dead. Two honor guards burst in: one attacks the Espliani diplomat, the other goes for the Hand.',
    opts: [{ to: '22', text: 'Help the diplomat' }, { to: '27', text: 'Save the relic' }] },
  { n: '22', kind: 'play', place: 'The Palace', side: 'City', floors: 1, read: 'You rush to the diplomat\'s aid, leaving the relic to the honor guard.',
    fx: { set: { hp: 10 } }, setup: ['Start at Floor 1, Area 1. HP 10.', 'The Honor Guard Boss faceup as the starting Room.'], special: MR_PALACE_DECK,
    goal: 'Complete Area 1.', winFx: { item: '' }, win: '6' },
  { n: '27', kind: 'play', place: 'The Palace', side: 'City', floors: 1, read: 'You leap at the honor guard grabbing the relic; the diplomat falls, wounded.',
    fx: { set: { hp: 10 } }, setup: ['Start at Floor 1, Area 1. HP 10.', 'The Honor Guard Boss faceup as the starting Room.'], special: MR_PALACE_DECK,
    goal: 'Complete Area 1.', winFx: { inv: { hand: true }, item: '' }, win: '49' },
  { n: '6', kind: 'story', place: 'The Palace', read: 'The diplomat lives, but the relic is gone. The Espliani presses his Council token into your hand: hide in the Cathedral\'s dome.',
    fx: { inv: { token: true }, item: 'Potion Bandolier' }, opts: [{ to: '40', text: 'Leave the Palace' }] },
  { n: '49', kind: 'story', place: 'The Palace', read: 'The Scrollmaster: the Hand of Selinas dispels magic for a short while. Keep it against the King\'s enchantments, and go.', opts: [{ to: '40', text: 'Leave the Palace' }] },
  { n: '40', kind: 'story', place: 'Outside the Palace', read: 'Sunlight, for the first time in a decade. You must hide in the Cathedral\'s dome, with meagre equipment and little gold.',
    opts: [{ to: '47', text: 'Spend some coin first' }, { to: '5', text: 'Head for the Cathedral' }] },
  { n: '47', kind: 'play', place: 'The Merchant District', floors: 0, read: 'Spices and grill smoke; and a guard who has watched you since the corner shop.',
    test: { what: 'noto', pass: 'above', ok: '31' }, setup: ['The City Guard card, Floor 2.'], goal: 'Kill the City Guard.', winFx: { noto: 1 }, win: '31' },
  { n: '31', kind: 'story', place: 'The Merchant District', read: 'The blacksmith\'s, and a tavern.', acts: [{ text: 'Shop at the blacksmith\'s: resolve the Blacksmith Room card.' }],
    opts: [{ to: '43', text: 'Visit the tavern', if: { notVisited: '43' } }, { to: '5', text: 'Head for the Cathedral' }] },
  { n: '43', kind: 'story', place: 'The Tavern of the Screaming Boar', read: 'A den of thieves. "Food," you croak. "Two gold pieces."',
    opts: [{ to: '24', text: 'Pay for food (2 Gold)', if: { gold: 2 } }, { to: '31', text: 'Change your mind, or you can\'t pay' }] },
  { n: '24', kind: 'story', place: 'The Tavern of the Screaming Boar', read: 'Steaming food, after years. Rumours of the Champion\'s escape, and of a way up the Cathedral\'s dark side. A lone figure watches you.',
    fx: { gold: -2, hp: 4, inv: { hint: true } }, opts: [{ to: '31' }] },
  { n: '5', kind: 'play', place: 'The Old Quarter', side: 'City', floors: 2, read: 'You head for the dome over the ruined Old Quarter, where a riot was crushed.',
    setup: ['Start at Floor 1, Area 1.'], special: ['Keep the Boss card facedown at Areas 2 and 4.', 'The Floor 1 Boss: the Ravenous Rats and the Murder of Crows, one after the other.', 'The Floor 2 Boss: the Archer and the City Guard, one after the other.'],
    goal: 'Complete Area 4.', winFx: { noto: 1 }, win: '23' },
  { n: '23', kind: 'story', place: 'The Cathedral of St. Anastasius', read: 'At the giant doors. You must reach the dome without drawing the crowd\'s eyes.',
    opts: [{ to: '45', text: 'Climb the side of the Cathedral' }, { to: '36', text: 'Go through the front doors' }, { to: '13', text: 'Climb it the way the hint said', if: { inv: 'hint' }, fx: { inv: { hint: false } } }] },
  { n: '45', kind: 'story', place: 'The Cathedral\'s side', read: 'Halfway up, no more holds: a difficult jump to the next ledge.',
    test: { what: 'skill', n: 1, ok: '13', retry: { hp: -1 } }, opts: [{ to: '23', text: 'Climb down' }] },
  { n: '36', kind: 'play', place: 'The Cathedral', side: 'Cathedral', floors: 2, read: 'Through the front doors, into the City Watch posted inside.',
    opts: [{ to: '23', text: 'Second thoughts: go back and climb' }],
    setup: ['Start at Floor 2, Area 5.', 'During the Preparation Phase, set the City Guard as the first Room of the Area.'],
    special: ['Go backwards, from Area 5 to Area 2.', 'The Area 4 Boss is the Archer; the Area 2 Boss is the Inquisitor, resolved with Floor 2. Read the Dialogue when you face him.'],
    goal: 'Kill the Inquisitor.', win: '28' },
  { n: '13', kind: 'play', place: 'The dome', side: 'Cathedral', floors: 1, read: 'Atop the dome, a sealed-off attic: your hiding place.',
    setup: ['Start at Floor 1, Area 1.'], special: ['The Area 2 Boss is the Inquisitor, resolved with Floor 2. Read the Dialogue when you face him.'],
    goal: 'Kill the Inquisitor.', win: '28' },
  { n: '28', kind: 'story', place: 'The dome', read: 'The Inquisitor dies. The High Priestess finds you: "Your next quarry will be the Arcanist," in the Merchant District, or the Shadow Gardens.', opts: [{ to: '11' }] },
  { n: '11', kind: 'play', place: 'The Merchant District', floors: 0, read: 'Night, and only criminals in the streets. A cutpurse closes in.',
    test: { what: 'noto', pass: 'below', ok: '25' }, setup: ['The Criminal card: the Cutpurse, Floor 2.'], goal: 'Kill the Criminal.', winFx: { noto: 1 }, win: '25' },
  { n: '25', kind: 'story', place: 'The Merchant District plaza', read: 'All shut but the tavern and the inn; the tavern is no place for someone of your notoriety.',
    opts: [{ to: '2', text: 'Rest at the inn', if: { notVisited: '2' } }, { to: '20', text: 'Search for the Arcanist' }] },
  { n: '2', kind: 'story', place: 'The inn', read: 'The innkeeper points to the board: "3 gold for room."',
    opts: [{ to: '10', text: 'Rent a room (3 Gold): refresh your Skills and heal', if: { gold: 3 } }, { to: '25', text: 'Leave the inn now' }] },
  { n: '10', kind: 'play', place: 'The inn', floors: 0, read: 'A hot meal and a bed, then a dark figure at the window: an Assassin!',
    fx: { gold: -3, set: { hp: 20 } }, setup: ['Lose 3 Gold. HP 20, and refresh your Skills.', 'The Criminal card: fight the Assassin, Floor 4.'], goal: 'Kill the Criminal.', win: '48' },
  { n: '48', kind: 'story', place: 'The inn', read: '"Who sent you?" The assassin dies without a word. Out the window, before anyone comes.', opts: [{ to: '25' }] },
  { n: '20', kind: 'play', place: 'The Merchant District', side: 'City', floors: 2, read: 'The Arcanist is nowhere to be seen: the shops are shut. You search harder.',
    fx: { hpToStart: true }, setup: ['Start at Floor 2, Area 3.', 'HP back to its starting value, if it\'s below it.', 'The Floor 2 Boss is the Honor Guard.'],
    special: ['Go from Area 3 to Area 7. At the end of each Area, two Skill Checks: both succeed and you\'ve found the Arcanist.', 'Otherwise she\'s the Boss of Area 7. The Arcanist is resolved with Floor 3; read the Dialogue when you face her.'],
    goal: 'Kill the Arcanist.', win: '7' },
  { n: '7', kind: 'story', place: 'The Shadow Gardens', read: 'The Arcanist falls. A hooded figure brings a letter from the Loremaster: spare him and the Pen of St. Anastasius is yours. Meet at the Cathedral\'s Shrine at sundown.',
    opts: [{ to: '3', text: 'Gear up first' }, { to: '26', text: 'Look into the High Priestess at the Royal Archives' }, { to: '4', text: 'Go to the meeting with the Loremaster' }] },
  { n: '3', kind: 'play', place: 'The Merchant District', floors: 0, read: 'Patrols have doubled since the Arcanist and the Inquisitor died; the Loremaster may be next.',
    opts: [{ to: '4', text: 'Ready for the Cathedral now' }],
    test: { what: 'noto', pass: 'above', ok: '39', text: 'Slip into the shop unnoticed' }, setup: ['The City Guard card, Floor 3.'], goal: 'Kill the City Guard.', winFx: { noto: 1 }, win: '39' },
  { n: '39', kind: 'story', place: 'The blacksmith\'s', read: '"Heard the Arcanist\'s gone too, now," sighs the blacksmith.',
    acts: [{ text: 'Resolve both the Blacksmith and the Ritualist Room cards.' }, { text: 'Rest at the inn (1 Gold): HP back to its starting value', if: { gold: 1 }, fx: { gold: -1, hpToStart: true } }],
    opts: [{ to: '17', text: 'Follow the shady person to a hidden shop', if: { noto: 4 } }, { to: '4', text: 'Go to the meeting' }, { to: '26', text: 'Sneak into the Royal Plaza' }] },
  { n: '17', kind: 'story', place: 'A hidden shop', read: 'Keys and lockpicks line the wall. "3 Gold pieces, you will not regret it."',
    opts: [{ to: '3', text: 'Buy the skeleton key (3 Gold), then back', if: { gold: 3 }, fx: { gold: -3, inv: { key: true } } }, { to: '3', text: 'Back, without it' }] },
  { n: '26', kind: 'play', place: 'The Royal Plaza', floors: 0, read: 'Guards everywhere. You must sneak into the Plaza to reach the Royal Archives.',
    test: { what: 'skill', n: 1, ok: '32' }, setup: ['The Honor Guard Boss card, Floor 3.'], goal: 'Kill the Honor Guard.', winFx: { noto: 1 }, win: '32' },
  { n: '32', kind: 'play', place: 'The Royal Plaza', side: 'City', floors: 1, read: 'Inside the Plaza, deep into its long alleys toward the Royal Archives.',
    setup: ['Start at Floor 4, Area 8.'], special: ['No Boss on Area 10.'], goal: 'Get to the Exit of Area 10.', win: '38' },
  { n: '38', kind: 'story', place: 'The Royal Archives', read: 'Scholars eye the blood on your clothes. Find what you came for, fast.', opts: [{ to: '18' }] },
  { n: '18', kind: 'story', place: 'The Royal Archives', read: 'A half-burnt book: the High Priestess, born in 1722, an Elf, a spawn of the Oroa. Guards are coming; a staircase leads down to a door.', opts: [{ to: '34' }] },
  { n: '34', kind: 'play', place: 'The Royal Archives', floors: 0, read: 'The door is locked, and the guards are coming.',
    opts: [{ to: '9', text: 'Unlock it with the Skeleton Key', if: { inv: 'key' } }],
    test: { what: 'skill', n: 3, ok: '9', text: 'Pick the lock' }, setup: ['The Honor Guard Boss card, Floor 3.'], goal: 'Kill the Honor Guard.', win: '9' },
  { n: '9', kind: 'play', place: 'The Cathedral courtyard', side: 'Cathedral', floors: 2, read: 'A moving tapestry carries you into the Cathedral\'s courtyard; the Loremaster waits in the Shrine.',
    setup: ['Start at Floor 2, Area 3.'], special: ['A Boss before Area 7: the Murder of Crows and the Ravenous Rats instead, one after the other.', 'No Boss on Area 7.'],
    goal: 'Get to the Exit of Area 7.', win: '15' },
  { n: '4', kind: 'play', place: 'The Cathedral', side: 'Cathedral', floors: 3, read: 'Guards at every corner of the Cathedral; you\'ll have to scale it.',
    opts: [{ to: '15', text: 'Show the Council Token: straight to the Shrine', if: { inv: 'token' } }],
    setup: ['Start at Floor 1, Area 1.'], special: ['The Boss of Area 2 and of Area 4: the Archer and the City Guard, one after the other.', 'No Boss on Area 7.'],
    goal: 'Get to the Exit of Floor 3.', win: '15' },
  { n: '15', kind: 'story', place: 'The Cathedral\'s Shrine', read: 'The Loremaster revels in the chaos you\'ve sown, and begs to be spared, holding out an unremarkable pen.',
    opts: [{ to: '33', text: 'Spare the Loremaster' }, { to: '12', text: 'Don\'t' }] },
  { n: '33', kind: 'story', place: 'The Cathedral\'s Shrine', read: '"A prudent decision. But first, a lesson: do you truly grasp the High Priestess\'s nature?"',
    opts: [{ to: '14', text: 'You read her records in the Royal Archives', if: { visited: '18' } }, { to: '29', text: 'You didn\'t', if: { notVisited: '18' } }] },
  { n: '14', kind: 'story', place: 'The Cathedral\'s Shrine', read: 'The High Priestess, an Elf, is cutting down the Royal Aegis one by one, and you are her tool. The Pen? A fabrication.', opts: [{ to: '35' }] },
  { n: '29', kind: 'story', place: 'The Cathedral\'s Shrine', read: 'Elves are human flesh possessed by an Old God. The High Priestess conceived the Royal Aegis, then the Council. The King awaits below; the Pen was a lie.', opts: [{ to: '35' }] },
  { n: '35', kind: 'play', place: 'The Sacrificial Pit', side: 'Cathedral', floors: 1, read: 'The Loremaster shoves you down the stairs. Betrayed, twice.',
    fx: { hp: -3 }, setup: ['Lose 3 HP.', 'Start at Floor 4, Area 8.'], goal: 'Reach the King\'s Remains, and do not start the Combat.', win: '30' },
  { n: '12', kind: 'play', place: 'The Cathedral\'s Shrine', floors: 0, read: '"Guards! Guards!"',
    setup: ['Fight the City Guard, the Archer and the Loremaster, one after the other, at Floor 3.'], special: ['When the Loremaster is defeated, read the Dialogue, then fight him again.'],
    goal: 'Kill the Loremaster twice.', win: '21' },
  { n: '21', kind: 'play', place: 'The Sacrificial Pit', side: 'Cathedral', floors: 1, read: 'The Loremaster\'s last whisper: "another trap…" The floor opens beneath you.',
    fx: { hp: -3 }, setup: ['Lose 3 HP.', 'Start at Floor 4, Area 8.'], goal: 'Reach the King\'s Remains, and do not start the Combat.', win: '30' },
  { n: '30', kind: 'play', place: 'The Dark Alleys', side: 'City', floors: 8, final: true, read: 'The King seizes you by the throat and drains your strength. You wake in the Dark Alleys, as if in a dream.',
    fx: { set: { xp: 0 } }, setup: ['Lose all XP: reset it to 0.', 'Start at Floor 1, Area 1.'],
    special: ['Defeat the King\'s Remains at the end of Area 10, then set up the Cathedral mat at Floor 1, Area 1, and reset your XP to 1.'],
    goal: 'Defeat the King\'s Remains on the Cathedral mat.', win: '37', bossName: 'the King\'s Remains' },
  { n: '37', kind: 'end', place: 'The Sacrificial Pit', read: 'The High Priestess takes the Og\'s Blood: the Church of the Sacred Stone reclaims its dominion. She sends you through a purplish portal: "The Oroa await."' },
];

const MR_BASE_RELICS = [
  { id: 'pilgrim', name: 'Pilgrim\'s Flesh' },
  { id: 'eye', name: 'Eye of Constantine' },
  { id: 'bone', name: 'Bone of Ernazar' },
];
// The Council's Inventory: lost when you die.
const MR_INV = [
  { id: 'hand', name: 'Hand of Selinas', text: 'Cancel one Enemy effect once per Combat.' },
  { id: 'hint', name: 'Hint' },
  { id: 'token', name: 'Council Token' },
  { id: 'key', name: 'Skeleton Key' },
];
const MR_POTIONS = [['fire', 'Fire'], ['frost', 'Frost'], ['poison', 'Poison'], ['healing', 'Healing'], ['holy', 'Holy'], ['perception', 'Perception']];
// The sheet's stats: [key, label, min, max].
const MR_STATS = [['hp', 'HP', 0, 20], ['xp', 'XP', 0, 23], ['armor', 'Armor', 0, 4], ['food', 'Food', 0, 4], ['gold', 'Gold', 0, 10]];
const MR_START = { hp: 10, food: 3, gold: 3, armor: 0, potions: [] };

// The skill tree, from the campaign sheet: a Tier 1 Skill, then two branches
// of a Tier 2 and a Tier 3 (1, 2 and 4 Perk Points).
const MR_SKILLS = [
  { path: 'exploration', name: 'Exploration', color: '#4f8fa8',
    t1: { id: 'nimble1', name: 'Nimble 1', text: 'Once per Area, you may reveal 1 Room card.' },
    branches: [[{ id: 'nimble2', name: 'Nimble 2', text: 'Once per Area, you may reveal 2 Room cards.' }, { id: 'intuitive', name: 'Intuitive', text: 'Once per Area, switch the position of any 2 adjacent Room cards.' }],
      [{ id: 'sharpeyes', name: 'Sharp Eyes', text: 'You can now find a Treasure item on a roll of 4, 5 or 6.' }, { id: 'charismatic', name: 'Charismatic', text: 'You pay 2 Gold less when buying a Potion or an Armor.' }]] },
  { path: 'survival', name: 'Survival', color: '#d0763a',
    t1: { id: 'survivalist', name: 'Survivalist', text: 'Only lose 1 HP when starving.' },
    branches: [[{ id: 'hunter', name: 'Hunter', text: 'When searching for Food at a Bonfire, you now get 2 Food.' }, { id: 'healer', name: 'Healer', text: 'When you Rest at a Bonfire, you now heal 4 HP.' }],
      [{ id: 'perceptive', name: 'Perceptive', text: 'Rooms with a Skill Check ±1 become a Skill Check ±2.' }, { id: 'agile', name: 'Agile', text: 'You can perform a Feat when performing a Skill Check.' }]] },
  { path: 'combat', name: 'Combat', color: '#c8463a',
    t1: { id: 'resolute1', name: 'Resolute 1', text: 'Once per combat, you may perform a Feat by paying 1 HP.' },
    branches: [[{ id: 'resolute2', name: 'Resolute 2', text: 'Twice per combat, you may perform a Feat by paying 1 HP.' }, { id: 'swordsman', name: 'Swordsman', text: 'In combat, treat every Miss as a 3.' }],
      [{ id: 'robust1', name: 'Robust 1', text: 'In combat, a 6 on the Dungeon die ignores only 2 Armor.' }, { id: 'robust2', name: 'Robust 2', text: 'In combat, a 6 on the Dungeon die doesn\'t ignore your Armor.' }]] },
];
const MR_SKILL = {};   // id → { ...skill, path, tier, cost, needs }
for (const P of MR_SKILLS) {
  MR_SKILL[P.t1.id] = { ...P.t1, path: P.path, tier: 1, cost: 1, needs: null };
  P.branches.forEach(([a, b]) => {
    MR_SKILL[a.id] = { ...a, path: P.path, tier: 2, cost: 2, needs: P.t1.id, other: P.branches.map(x => x[0].id).filter(x => x !== a.id) };
    MR_SKILL[b.id] = { ...b, path: P.path, tier: 3, cost: 4, needs: a.id };
  });
}

const MR_GAMES = {
  [MR_BGGID]: { key: 'base', name: 'Mini Rogue', color: '#a3322f', chapters: MR_BASE_CHAPTERS, relics: MR_BASE_RELICS, first: ['Mini Rogue', 'Expansions', 'The Council'] },
  [MRC_BGGID]: { key: 'council', name: 'The Council', color: '#6a4a8c', chapters: MR_COUNCIL_CHAPTERS, relics: [], sheet: true, first: ['The Council', 'Mini Rogue', 'Expansions'] },
};
// Where a chapter can lead: for the progress bar (how far down the book).
function _mrDepths(chapters) {
  const by = Object.fromEntries(chapters.map(c => [c.n, c]));
  const out = { 1: 0 }, queue = ['1'];
  while (queue.length) {
    const ch = by[queue.shift()];
    if (!ch) continue;
    const next = [...(ch.opts || []).map(o => o.to), ...(ch.test ? [ch.test.ok] : []), ch.boss, ...(typeof ch.win === 'string' ? [ch.win] : Object.values(ch.win || {}))].filter(Boolean);
    for (const n of next) if (out[n] === undefined) { out[n] = out[ch.n] + 1; queue.push(n); }
  }
  return out;
}
for (const g of Object.values(MR_GAMES)) {
  g.depth = _mrDepths(g.chapters);
  g.ends = g.chapters.filter(c => c.kind === 'end').map(c => c.n);
  g.deepest = Math.max(...g.ends.map(n => g.depth[n] || 0));
}
// The chapters played as a game, for Log a play's picker ("Chapter 8"; numbers only, no spoilers).
function mrChapterOptions(bggId) {
  const g = MR_GAMES[Number(bggId)];
  return g ? g.chapters.filter(c => c.kind === 'play').map(c => [`Chapter ${c.n}`, c.n]).sort((a, b) => Number(a[1]) - Number(b[1])) : [];
}

let _mrCamps = null;          // mrCampaigns from Firebase: {id: campaign}
let _mrSrc = {};              // id → the store it lives in ('main' | 'spare', see fbWrite)
let _mrGame = null;           // the game page open (its bggId)
let _mrId = null;             // the campaign open; null: none (or the start form, with _mrDraft)
let _mrTab = 'camp';          // 'camp' | 'sheet' | 'notes'
let _mrDraft = null;          // the start form, while it's open
let _mrRes = null;            // the result being filled in on this phone
let _mrPanel = null;
let _mrSaveTimers = {};
let _mrPlaysStale = false;    // an attempt's play was logged: the Plays tab is drawn again when opened
const _mrLogging = new Set(); // id + log key: being logged on this phone

const _mrG = (c) => MR_GAMES[(c && c.game) || _mrGame] || MR_GAMES[MR_BGGID];
const _mrChar = (id) => MR_CHARS.find(x => x.id === id) || null;
const _mrCharName = (c) => { const ch = _mrChar(c && c.char); return ch ? ch.name : (c && c.charName) || 'Adventurer'; };
const _mrCh = (c, n) => _mrG(c).chapters.find(x => x.n === String(n)) || null;
const _mrMe = () => (typeof _navPlayer === 'function' ? _navPlayer() : null);
const _mrLevel = (xp) => (xp >= 18 ? 3 : xp >= 6 ? 2 : 1);
const _mrList = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
function _mrDate(v) {
  if (!v) return '';
  const d = typeof v === 'number' ? new Date(v) : new Date(`${v}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
// The player's, and whoever started it: the ones who fill it in.
function _mrCanEdit(c) {
  const me = _mrMe();
  if (!me || !c) return false;
  return !c.player || c.player === me || c.by === me;
}
// Where a result leads: a chapter, by character when the book says so (null:
// the book names other characters, so the player picks).
function _mrLead(c, to) {
  if (!to) return null;
  if (typeof to === 'string') return to;
  return to[c.char] || null;
}
// Perk Points for a game: a point per Floor completed, a point per Level past the first.
const _mrPP = (floors, level) => Math.max(0, floors || 0) + Math.max(0, (level || 1) - 1);
// The chapters reached, in order ('†': a death that restarted the campaign).
function _mrRoad(c) {
  const out = [];
  for (const n of _mrList(c.road).map(String)) if (out[out.length - 1] !== n) out.push(n);
  return out;
}
// The chapters reached since the campaign (re)started.
function _mrSince(c) {
  const road = _mrRoad(c);
  return road.slice(road.lastIndexOf('†') + 1);
}
const _mrStats = (c) => ({ ...MR_START, ...(c.stats || {}), potions: _mrList((c.stats || {}).potions) });
const _mrStartStats = (c) => ({ ...MR_START, ...(c.start || {}), potions: _mrList((c.start || {}).potions) });

async function _mrLoad(force) {
  if (force || !_mrCamps) {
    const { main, spare } = await fbReadBoth('mrCampaigns');
    _mrCamps = {};
    _mrSrc = {};
    for (const [store, data] of [['spare', spare], ['main', main]]) {
      for (const id in (data || {})) { if (data[id] && typeof data[id] === 'object') { _mrCamps[id] = data[id]; _mrSrc[id] = store; } }
    }
  }
  if (_mrId && !_mrCamps[_mrId]) _mrId = null;
}
// Some fields of the campaign: {path: value}, path relative to it; null removes.
async function _mrPatch(updates, id = _mrId) {
  const c = _mrCamps[id];
  if (!c) return;
  for (const [path, v] of Object.entries(updates)) _mrSetAt(c, path.split('/'), v);
  c.updated = Date.now();
  try {
    await fbWrite(`mrCampaigns/${id}`, 'PATCH', { ...updates, updated: c.updated }, _mrSrc[id]);
  } catch (e) {
    console.warn('Mini Rogue campaign: not saved', e);
    _mrToast('Not saved. Check the connection and try again.');
  }
}
function _mrSetAt(o, parts, v) {
  for (const k of parts.slice(0, -1)) o = (o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {});
  const last = parts[parts.length - 1];
  if (v === null || v === undefined) delete o[last]; else o[last] = v;
}
// A message under the campaign; it stays its time even if the tab is drawn
// again meanwhile (the play logged just after a result redraws it).
let _mrSaid = null;   // { msg, ok, until }
function _mrToast(msg, ok) {
  _mrSaid = { msg, ok: !!ok, until: Date.now() + 6000 };
  _mrShowSaid();
}
function _mrShowSaid() {
  const el = _mrPanel && _mrPanel.querySelector('.rv-toast');
  if (!el || !_mrSaid || Date.now() >= _mrSaid.until) return;
  el.textContent = _mrSaid.msg;
  el.classList.toggle('ok', _mrSaid.ok);
  el.hidden = false;
  clearTimeout(_mrShowSaid.t);
  _mrShowSaid.t = setTimeout(() => { const e = _mrPanel && _mrPanel.querySelector('.rv-toast'); if (e) e.hidden = true; }, _mrSaid.until - Date.now());
}

// ── What a condition, or an effect, comes to for this campaign ──
// { ok, why }: whether an option or an action is open.
function _mrCheck(c, cond) {
  if (!cond) return { ok: true };
  const st = _mrStats(c), inv = c.inv || {};
  if (cond.inv) { const it = MR_INV.find(x => x.id === cond.inv); return { ok: !!inv[cond.inv], why: `only with the ${it ? it.name : cond.inv}` }; }
  if (cond.noto) return { ok: (c.noto || 1) >= cond.noto, why: `only with Notoriety ${cond.noto} or more` };
  if (cond.gold) return { ok: (st.gold || 0) >= cond.gold, why: `you need ${cond.gold} Gold` };
  if (cond.visited) return { ok: _mrSince(c).includes(cond.visited), why: `only if you went to chapter ${cond.visited}` };
  if (cond.notVisited) return { ok: !_mrSince(c).slice(0, -1).includes(cond.notVisited), why: 'done already' };
  if ('coop' in cond) return { ok: !!c.coop === cond.coop, why: cond.coop ? 'a co-op campaign only' : 'a solo campaign only' };
  return { ok: true };
}
// "−3 Gold · HP 20 · Council Token"
function _mrFxText(fx) {
  if (!fx) return '';
  const name = { hp: 'HP', xp: 'XP', food: 'Food', gold: 'Gold', armor: 'Armor' };
  const out = [];
  for (const k of Object.keys(name)) if (fx[k]) out.push(`${fx[k] > 0 ? '+' : '−'}${Math.abs(fx[k])} ${name[k]}`);
  for (const [k, v] of Object.entries(fx.set || {})) out.push(k === 'potions' ? 'no Potions' : `${name[k]} ${v}`);
  if (fx.hpToStart) out.push('HP back to its starting value');
  if (fx.noto) out.push('Notoriety +1');
  for (const [k, v] of Object.entries(fx.inv || {})) { const it = MR_INV.find(x => x.id === k); out.push(v ? `${it.name} gained` : `${it.name} used`); }
  if (fx.item) out.push(`Item: ${fx.item}`);
  else if (fx.item === '') out.push('Item cards discarded');
  return out.join(' · ');
}
// An effect's changes, added to `up` (on top of what `up` already changes).
function _mrApply(c, fx, up) {
  if (!fx || !_mrG(c).sheet) return;
  const st = _mrStats(c), start = _mrStartStats(c);
  const cur = (k) => (up[`stats/${k}`] !== undefined ? up[`stats/${k}`] : st[k]);
  const clamp = (k, v) => { const s = MR_STATS.find(x => x[0] === k); return s ? Math.max(s[2], Math.min(s[3], v)) : v; };
  for (const [k] of MR_STATS) if (fx[k]) up[`stats/${k}`] = clamp(k, (cur(k) || 0) + fx[k]);
  for (const [k, v] of Object.entries(fx.set || {})) up[`stats/${k}`] = k === 'potions' ? [] : clamp(k, v);
  if (fx.hpToStart && cur('hp') < start.hp) up['stats/hp'] = start.hp;
  if (fx.noto) up.noto = Math.min(5, (up.noto !== undefined ? up.noto : c.noto || 1) + fx.noto);
  for (const [k, v] of Object.entries(fx.inv || {})) up[`inv/${k}`] = v || null;
  if (fx.item !== undefined) up['stats/item'] = fx.item;
}

// ── Where a campaign stands ──
function _mrState(c) {
  if (c.status === 'won') { const e = _mrCh(c, c.at); return e && e.kind === 'end' ? `ending ${e.n} reached` : 'won'; }
  if (c.status === 'stopped') return `stopped ${_mrDate(c.stopped)}`;
  const ch = _mrCh(c, c.at);
  if (c.playing && ch && ch.kind === 'play') return `playing chapter ${c.at}`;
  if (ch && ch.kind === 'story') return `read chapter ${c.at}`;
  return `chapter ${c.at || 1}`;
}
// For Play → Campaigns: { pct, text, done }.
function mrSummary(c) {
  const done = c.status === 'won';
  const g = _mrG(c);
  const pct = Math.min(95, Math.round(((g.depth[c.at] || 0) / (g.deepest || 1)) * 100));
  return { pct: done ? 100 : pct, text: `${_mrCharName(c)} · ${_mrState(c)}`, done };
}
// Each campaign of the game, for its own tab: the viewer's first, then the latest.
function _mrIdsOf(game) {
  const me = _mrMe();
  const mine = (c) => !!(me && (c.player === me || c.by === me));
  return Object.keys(_mrCamps || {}).filter(id => Number(_mrCamps[id].game) === Number(game))
    .sort((a, b) => { const A = _mrCamps[a], B = _mrCamps[b]; return (mine(B) - mine(A)) || ((B.updated || 0) - (A.updated || 0)); });
}

// ── rendering ──
function buildMrCampaignHtml(game) {
  if (!game || !MR_GAMES[Number(game.bggId)]) return '';
  return `<div class="rv cr mr" data-mr="${Number(game.bggId)}"><div class="rv-loading">Opening the campaigns…</div></div>`;
}

function wireMrCampaign(content) {
  const panel = content.querySelector('[data-mr]');
  if (!panel) return;
  const game = Number(panel.dataset.mr);
  if (_mrGame !== game) { _mrGame = game; _mrId = null; _mrDraft = null; _mrRes = null; _mrTab = 'camp'; }
  _mrPanel = panel;
  _mrLoad(true).then(() => {
    if (_mrId && Number((_mrCamps[_mrId] || {}).game) !== game) _mrId = null;
    _mrRender(panel);
  }).catch(e => {
    panel.innerHTML = `<div class="rv-loading">The campaigns couldn't be loaded. Try again in a moment.</div>`;
    console.warn('Mini Rogue campaign:', e);
  });
  panel.addEventListener('click', (ev) => _mrClick(panel, ev));
  panel.addEventListener('input', (ev) => _mrInput(panel, ev));
  // an attempt's play logged since the page opened: its Plays tab drawn again
  const tabs = content.querySelector('.gm-tabs');
  if (tabs) tabs.addEventListener('click', (ev) => {
    const t = ev.target.closest('.gm-tab');
    if (!t || t.dataset.tab !== 'plays' || !_mrPlaysStale) return;
    _mrPlaysStale = false;
    _modalTab = 'plays';
    _modalTabFor = game;
    openModal(findGameByBggId(game));
  });
}

function _mrTabsHtml() {
  const esc = _escapeHtml;
  const ids = _mrIdsOf(_mrGame);
  const tab = (id) => {
    const c = _mrCamps[id], ch = _mrChar(c.char);
    return `<button type="button" class="cr-camp${id === _mrId ? ' on' : ''}${c.status ? ` ended ${c.status}` : ''}" data-mr-camp="${esc(id)}" style="--cr-c:${esc((ch && ch.color) || '#888')}" aria-expanded="${id === _mrId}">
      <b>${esc(c.name || `The ${_mrCharName(c)}`)}</b>
      <span>${esc(_mrCharName(c))} · ${esc(_mrState(c))}</span>
      ${c.player ? `<span class="cr-camp-who">${esc(c.player)}</span>` : ''}</button>`;
  };
  const active = ids.filter(id => !_mrCamps[id].status), ended = ids.filter(id => _mrCamps[id].status);
  const isNew = !_mrId && !!_mrDraft;
  return `<div class="cr-camps">${active.map(tab).join('')}
      <button type="button" class="cr-camp cr-camp-new${isNew ? ' on' : ''}" data-mr-camp="__new" aria-expanded="${isNew}"><b>+ A new campaign</b><span>Solo · one character, start to end</span></button></div>
    ${ended.length ? `<div class="rv-sub">Stopped and finished</div><div class="cr-camps">${ended.map(tab).join('')}</div>` : ''}
    ${!_mrId && !_mrDraft && ids.length ? '<div class="rv-hint cr-camps-hint">Tap a campaign to open it.</div>' : ''}`;
}

function _mrRender(panel) {
  const esc = _escapeHtml;
  _mrPanel = panel;
  const c = _mrId && _mrCamps[_mrId];
  if (!c) {
    panel.innerHTML = `${_mrTabsHtml()}${_mrDraft ? _mrStartHtml() : ''}<div class="rv-toast" hidden></div>${_mrCreditHtml()}`;
    _mrWire(panel);
    _mrShowSaid();
    return;
  }
  const edit = _mrCanEdit(c);
  const g = _mrG(c), ch = _mrChar(c.char);
  const nSk = Object.keys(c.skills || {}).length + (g.sheet ? 0 : Object.keys(c.relics || {}).length);
  const tabs = [['camp', 'Campaign'], ['sheet', `${g.sheet ? 'Skills' : 'Skills &amp; Relics'}${nSk ? ` <span class="gm-tab-n">${nSk}</span>` : ''}`], ['notes', 'Notes']];
  const body = { camp: _mrCampHtml, sheet: _mrSheetHtml, notes: _mrNotesHtml }[_mrTab](c, edit);
  panel.innerHTML = `
    ${_mrTabsHtml()}
    <div class="cr-open" style="--cr-m:${esc((ch && ch.color) || g.color)}">
    <div class="rv-head">
      <input class="rv-party" data-mr-text="name" value="${esc(c.name || '')}" placeholder="Campaign name" ${edit ? '' : 'readonly'} aria-label="Campaign name">
    </div>
    <div class="cr-sub">${esc(g.name)} campaign · ${esc(c.player || '?')} as the <b style="color:${esc((ch && ch.color) || 'inherit')}">${esc(_mrCharName(c))}</b>${g.sheet ? '' : ' · Roguelike'}</div>
    ${edit ? '' : `<div class="rv-ro">${_mrMe() ? 'Only its player can fill in this campaign.' : 'Log in to fill in the campaign.'}</div>`}
    <div class="rv-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" class="rv-tab${_mrTab === k ? ' on' : ''}" data-mr-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rv-body${edit ? '' : ' rv-readonly'}">${body}</div>
    </div>
    <div class="rv-toast" hidden></div>
    ${_mrCreditHtml()}`;
  _mrWire(panel);
  _mrShowSaid();
}
function _mrCreditHtml() {
  return `<div class="rv-credit">The chapters and the campaign sheet from Nuts! Publishing's <a href="https://www.nutspublishing.com/eshop/mini-rogue-en" target="_blank" rel="noopener">campaign books</a>, in short here: the books have them in full.</div>`;
}

// The player: typed, with the names the app knows offered as you type.
function _mrWire(panel) {
  if (typeof comboAttach !== 'function') return;
  panel.querySelectorAll('input[data-mr-who]').forEach(inp => {
    const names = () => {
      const top = [...new Set([...(_mrMe() ? [_mrMe()] : []), ...(typeof ILIOUPOLI_MEMBERS !== 'undefined' ? ILIOUPOLI_MEMBERS : [])])];
      return [...top, ...[...(typeof _knownPlayerNames === 'function' ? _knownPlayerNames() : [])].filter(n => !top.includes(n)).sort()];
    };
    comboAttach(inp, { options: names, onPick: (v) => { if (_mrDraft) _mrDraft.player = v; }, max: 80 });
  });
}
function _mrClean(v) { return String(v || '').trim().replace(/\s+/g, ' ').slice(0, 40); }

// ── Starting a campaign: the character, the player (The Council: the starting stats) ──
function _mrStartHtml() {
  const esc = _escapeHtml;
  const d = _mrDraft, g = MR_GAMES[_mrGame];
  const boxes = g.first.map(box => {
    const chars = MR_CHARS.filter(x => x.box === box);
    return `<div class="rv-sub">${esc(box)}</div><div class="cr-hpicks">${chars.map(x => `<button type="button" class="cr-hpick${d.char === x.id ? ' on' : ''}" data-mr-draft-char="${x.id}" style="--cr-c:${esc(x.color)}" aria-pressed="${d.char === x.id}">
      <b>${esc(x.name)}</b>${x.blurb ? `<span>${esc(x.blurb)}</span>` : ''}</button>`).join('')}</div>`;
  }).join('');
  const stats = g.sheet ? `<div class="rv-sub">Starting stats <span class="cr-note">from the Character card</span></div>
    <div class="mr-stats">${MR_STATS.filter(s => s[0] !== 'xp').map(([k, label, lo, hi]) => `<div class="mr-stat"><span class="cr-lbl">${label}</span>
      <button type="button" class="rv-dot" data-mr-draft-stat="${k}|-1" aria-label="One less"${d.start[k] > lo ? '' : ' disabled'}>&minus;</button><b class="cr-n">${d.start[k]}</b>
      <button type="button" class="rv-dot" data-mr-draft-stat="${k}|1" aria-label="One more"${d.start[k] < hi ? '' : ' disabled'}>+</button></div>`).join('')}</div>
    <div class="cr-seg cr-seg-sm mr-potions">${MR_POTIONS.map(([k, l]) => `<button type="button" class="cr-seg-b${d.start.potions.includes(k) ? ' on' : ''}" data-mr-draft-potion="${k}">${l}</button>`).join('')}</div>
    <div class="rv-hint">Kept for a restart: when you die, the campaign starts over from chapter 1 with these.</div>` : '';
  return `<div class="rv-start cr-start">
    <div class="rv-start-title">Start a ${esc(g.name)} campaign</div>
    <div class="rv-start-sub">${g.sheet
      ? 'Solo. Your stats carry on from chapter to chapter; die, and the campaign starts over from chapter 1, keeping only the Skills you\'ve unlocked.'
      : 'Solo, in Roguelike difficulty: each chapter starts from the character\'s starting stats, with only the Skills unlocked and the Relics carried.'} The character stays for the whole campaign: a different one means a new campaign.</div>
    <div class="rv-sub">Who's playing</div>
    <input class="rv-in cr-who cr-who-wide" data-mr-who="player" value="${esc(d.player)}" placeholder="The player" maxlength="40" enterkeyhint="done">
    <div class="rv-sub">The character</div>
    ${boxes}
    ${stats}
    <label class="rv-field cr-draft-name"><span>Campaign name</span><input class="rv-in" data-mr-draft-name value="${esc(d.name)}" placeholder="Optional"></label>
    ${_mrMe() ? `<button type="button" class="rv-btn" data-mr-start>Start the campaign</button>` : '<div class="rv-start-sub">Log in to start one.</div>'}
  </div>`;
}

// ── The Campaign tab: the chapter, the character, the Perk Points, the road, the attempts ──
function _mrCampHtml(c, edit) {
  const esc = _escapeHtml;
  const g = _mrG(c);
  const top = c.status === 'stopped'
    ? `<div class="cr-end stopped">Stopped on ${esc(_mrDate(c.stopped))}: it's all kept as it was.${edit ? '<button type="button" class="rv-btn rv-btn-sm" data-mr-resume>Pick it up again</button>' : ''}</div>`
    : _mrChapterHtml(c, edit);
  const earned = Object.values(c.log || {}).reduce((n, l) => n + ((l && l.pp) || 0), 0);
  const log = Object.entries(c.log || {}).sort((a, b) => b[1].at - a[1].at);
  const road = _mrRoad(c);
  return `${top}
    ${g.sheet ? _mrCharHtml(c, edit) : ''}
    <div class="rv-sec">Perk Points</div>
    <div class="cr-coins mr-pp">
      <button type="button" class="rv-dot" data-mr-pp="-1" aria-label="One Perk Point less"${c.perks > 0 ? '' : ' disabled'}>&minus;</button>
      <span class="cr-coins-n"><b>${c.perks || 0}</b> to spend</span>
      <button type="button" class="rv-dot" data-mr-pp="1" aria-label="One Perk Point more">+</button>
      <span class="cr-note">${earned} earned in all</span>
    </div>
    <div class="rv-hint">Spend them on the ${g.sheet ? 'Skills' : 'Skills &amp; Relics'} tab. A game adds its own when you die or complete the chapter: 1 per Floor completed, 1 per Level past the first.</div>
    ${road.length > 1 ? `<div class="rv-sec">Your road</div><div class="mr-road">${road.map((n, i) => n === '†'
      ? '<span class="mr-road-die" title="Died: the campaign started over">&#10013;</span>'
      : `${i && road[i - 1] !== '†' ? '<span class="mr-road-to" aria-hidden="true">&rarr;</span>' : ''}<span class="mr-road-ch${n === String(c.at) && i === road.length - 1 && !c.status ? ' at' : ''}" title="${esc(((_mrCh(c, n) || {}).place) || `Chapter ${n}`)}">${esc(n)}</span>`).join('')}</div>` : ''}
    ${log.length ? `<div class="rv-sec">Games <span class="cr-count">${log.length}</span></div><div class="cr-log mr-log">${log.map(([ts, l]) => `<div class="cr-log-row"><span>${esc(_mrDate(l.at))}</span><span>Chapter ${esc(l.ch)}<i> · ${esc(_mrResText(c, l))}</i></span><b class="${l.won ? 'won' : 'lost'}">+${l.pp || 0}&#8202;PP</b><span class="cr-log-acts">${_mrLogActs(c, ts, l, edit)}</span></div>`).join('')}</div>` : ''}
    ${edit ? `<div class="pc-foot">${c.status ? '' : '<button type="button" class="rv-link" data-mr-stop>Stop this campaign</button>'}<button type="button" class="rv-link pc-del" data-mr-delete>Delete this campaign</button></div>` : ''}`;
}
function _mrResText(c, l) {
  const lv = `Level ${l.level || 1}`;
  if (l.won) return `won · ${lv}`;
  const ch = _mrCh(c, l.ch);
  if (l.boss) return `killed by ${(ch && ch.bossName) || 'the Boss'} · ${lv}`;
  return `died${l.floor ? ` on Floor ${l.floor}` : ''} · ${lv}`;
}

// The chapter the campaign is at, as its book has it.
function _mrChapterHtml(c, edit) {
  const esc = _escapeHtml;
  const g = _mrG(c);
  const ch = _mrCh(c, c.at);
  if (!ch) return `<div class="rv-card cr-card">Chapter ${esc(c.at)} isn't in the book.${edit ? ' <button type="button" class="rv-link" data-mr-goto>Go to another chapter</button>' : ''}</div>`;
  if (c.status === 'won' && ch.kind !== 'end') return `<div class="cr-end won">The campaign is won. &#127881;</div>${edit ? '<button type="button" class="rv-link" data-mr-unfinish>Not over after all</button>' : ''}`;
  const lost = Object.values(c.log || {}).some(l => l && l.ch === ch.n && !l.won);
  const head = (st) => `<div class="cr-card-top"><span class="cr-mc-n">${esc(ch.n)}</span>
      <div class="cr-mc-id"><span class="cr-mc-st">${st}</span><b>Chapter ${esc(ch.n)}</b><span>${esc(ch.place)}${ch.side ? ` · ${esc(ch.side)} side` : ''}${ch.final ? ' · final battle' : ''}</span></div></div>`;
  const read = `<div class="mr-read">${esc(ch.read)}</div>`;
  const goto = edit ? '<button type="button" class="rv-link" data-mr-goto>Go to another chapter</button>' : '';
  if (ch.kind === 'end') {
    return `<div class="rv-card cr-card mr-ending">${head(c.status === 'won' ? 'The end' : 'An ending')}${read}
      <div class="cr-end won">The campaign is won. &#127881;</div>
      ${edit && c.status !== 'won' ? '<button type="button" class="rv-btn" data-mr-finish>It\'s over: the campaign is won</button>' : ''}
      ${edit && g.ends.length > 1 ? `<div class="mr-other"><button type="button" class="rv-link" data-mr-go="3" data-mr-fix>Back to chapter 3, to choose again</button></div>` : ''}</div>`;
  }
  const fxLine = ch.fx && g.sheet ? `<div class="mr-fx">${ch.kind === 'story' ? 'Done on arriving' : 'Done when you start'}: ${esc(_mrFxText(ch.fx))}</div>` : '';
  const acts = (ch.acts || []).map((a, i) => {
    if (!a.fx) return `<li>${esc(a.text)}</li>`;
    const ok = _mrCheck(c, a.if);
    return `<li>${edit ? `<button type="button" class="cr-mini" data-mr-act="${i}"${ok.ok ? '' : ' disabled'}>${esc(a.text)}</button>${ok.ok ? '' : ` <span class="cr-note">${esc(ok.why)}</span>`}` : esc(a.text)}</li>`;
  }).join('');
  const opts = _mrOptsHtml(c, ch, edit);
  const test = ch.test && !c.playing ? _mrTestHtml(c, ch, edit) : '';
  if (ch.kind === 'story') {
    return `<div class="rv-card cr-card">${head('Read')}${read}${fxLine}
      ${acts ? `<ul class="cr-shop-list">${acts}</ul>` : ''}
      ${test}
      ${opts ? `<div class="cr-go">${opts}</div>` : ''}
      <div class="rv-hint">Read chapter ${esc(ch.n)} in the campaign book. No game here.</div>${goto}</div>`;
  }
  // a chapter to play (a test may come first: only a failure means the fight)
  const facts = _mrFactsHtml(c, ch);
  if (c.playing) return `<div class="rv-card cr-card cr-mcard playing">${head(c.fight ? 'Fighting now' : 'Playing now')}${facts}${_mrResultHtml(c, ch, edit)}</div>`;
  return `<div class="rv-card cr-card cr-mcard">${head(lost ? 'Again' : 'Up next')}${read}
    ${opts ? `<div class="cr-go">${opts}</div>` : ''}
    ${test || `${facts}${fxLine}${edit ? `<button type="button" class="rv-btn cr-begin" data-mr-begin>Start chapter ${esc(ch.n)}</button>
      ${ch.relic && !(c.relics || {})[ch.relic] ? `<div class="rv-hint">Starting it adds the ${esc(MR_BASE_RELICS.find(r => r.id === ch.relic).name)} to your Relics.</div>` : ''}` : ''}`}
    ${goto}
  </div>`;
}
// Where the chapter lets you go: the options open to you, and why the others aren't.
function _mrOptsHtml(c, ch, edit) {
  const esc = _escapeHtml;
  const opts = ch.opts || [];
  if (!opts.length) return '';
  // the book's character branches: yours, or every one when it doesn't name your character
  const byChar = opts.filter(o => o.if && o.if.char);
  const mineChar = byChar.filter(o => o.if.char.includes(c.char));
  return opts.map((o, i) => {
    if (o.if && o.if.char && mineChar.length && !mineChar.includes(o)) return '';
    const ok = o.if && o.if.char ? { ok: true } : _mrCheck(c, o.if);
    const sub = o.if && o.if.char && !mineChar.length ? `As ${o.if.char.map(k => (_mrChar(k) || {}).name).join(' or ')}: your pick` : !ok.ok ? ok.why : o.fx ? _mrFxText(o.fx) : `Go to chapter ${o.to}`;
    return `<button type="button" class="cr-gobtn${ok.ok ? '' : ' mr-shut'}" data-mr-opt="${i}"${edit && ok.ok ? '' : ' disabled'}><span class="cr-mis-n">${esc(o.to)}</span><span><b>${esc(o.text || 'Go on')}</b><span>${esc(sub)}</span></span></button>`;
  }).join('');
}
// A test before the game: a Notoriety test or Skill Checks.
function _mrTestHtml(c, ch, edit) {
  const esc = _escapeHtml;
  const t = ch.test, noto = c.noto || 1;
  const what = t.what === 'noto'
    ? `Notoriety test: roll the Dungeon die. ${t.pass === 'above' ? `Above your Notoriety (${noto})` : `Below your Notoriety (${noto})`} passes.`
    : t.n > 1 ? `${t.n} Skill Checks in a row: all ${t.n} must succeed.` : 'A Skill Check.';
  const fail = t.retry ? `Failed: ${_mrFxText(t.retry)}, and try again` : 'Failed: fight';
  return `<div class="mr-test">
    <div class="mr-test-q"><b>${esc(t.text || (t.what === 'noto' ? 'A Notoriety test' : 'A Skill Check'))}</b>${esc(what)}</div>
    ${edit ? `<div class="cr-result-btns"><button type="button" class="rv-btn rv-btn-sm" data-mr-pass>Passed: chapter ${esc(t.ok)}</button><button type="button" class="rv-btn rv-btn-sm rv-btn-soft" data-mr-fail>${esc(fail)}</button></div>` : ''}
    ${t.retry ? '' : `<div class="rv-hint">Failed, you fight: ${esc((ch.setup || []).join(' '))} Win: ${esc(_mrFxText(ch.winFx) || 'go on')}, then chapter ${esc(_mrLead(c, ch.win) || '')}.</div>`}
  </div>`;
}
// What the book says to set up, and what wins the chapter.
function _mrFactsHtml(c, ch) {
  const esc = _escapeHtml;
  const g = _mrG(c);
  const relics = c.relics || {};
  const setup = (ch.setup || []).map(s => {
    // what the setup's conditions come to for this campaign
    if (/^HP 12 with the Pilgrim/.test(s)) return `${esc(s)} <b>${relics.pilgrim ? 'You have it: HP 12.' : 'You don\'t: HP 10.'}</b>`;
    if (/^1 XP more with the Bone of Ernazar/.test(s)) return `${esc(s)} <b>${relics.bone ? 'You have it: start with 1 XP.' : 'You don\'t have it.'}</b>`;
    return esc(s);
  });
  const win = _mrLead(c, ch.win);
  const winText = win ? `${ch.winFx ? `${_mrFxText(ch.winFx)}. ` : ''}Go to chapter ${win}.` : `The book sends ${Object.entries(ch.win).map(([k, n]) => `the ${(_mrChar(k) || {}).name} to ${n}`).join(', ')}: choose.`;
  const last = g.sheet ? '' : ` The chapter ends at Floor ${ch.last}: a Fall there only costs the HP.`;
  return `<div class="cr-facts">
      ${ch.side ? `<div class="cr-fact rule"><span>Setup</span><p>The ${esc(ch.side)} side of the mat.${g.sheet ? ' Your stats as they are.' : ' Roguelike: −1 Food, −2 HP, −3 Gold.'}</p></div>` : ''}
      ${setup.map(s => `<div class="cr-fact rule"><span>Setup</span><p>${s}</p></div>`).join('')}
      ${(ch.special || []).map(s => `<div class="cr-fact rule"><span>Special</span><p>${esc(s)}</p></div>`).join('')}
      <div class="cr-fact win"><span>Goal</span><p>${esc(ch.goal)}${last}</p></div>
      <div class="cr-fact rw"><span>Won</span><p>${esc(winText)}</p></div>
      ${ch.boss ? `<div class="cr-fact boss"><span>Killed</span><p>By ${esc(ch.bossName || `the Boss at the end of Floor ${ch.last}`)}: go to chapter ${esc(ch.boss)}. Dying before it: play the chapter again.</p></div>`
        : `<div class="cr-fact boss"><span>Died</span><p>${g.sheet ? 'The campaign starts over from chapter 1, with your starting stats and an empty Inventory. Skills and Perk Points stay.' : 'Play the chapter again. The Perk Points earned stay.'}</p></div>`}
    </div>`;
}

// A result being filled in: won, killed by the boss, or died; the Floors completed and the Level reached.
function _mrResultHtml(c, ch, edit) {
  const esc = _escapeHtml;
  if (!edit) return '<div class="rv-hint">The chapter is being played.</div>';
  const g = _mrG(c);
  const span = g.sheet ? ch.floors || 0 : ch.last - (ch.start || 1) + 1;
  if (!_mrRes || _mrRes.id !== _mrId || _mrRes.ch !== String(c.at)) {
    _mrRes = { id: _mrId, ch: String(c.at), out: null, floors: 0, level: g.sheet ? _mrLevel(_mrStats(c).xp || 0) : 1, pick: null };
  }
  const r = _mrRes;
  const outs = [['won', 'Won']].concat(ch.boss ? [['boss', `Killed by ${ch.bossName || 'the Boss'}`]] : []).concat([['died', 'Died']]);
  let lead = '';
  if (r.out === 'won') {
    const to = _mrLead(c, ch.win);
    lead = to ? `${ch.winFx && g.sheet ? `${esc(_mrFxText(ch.winFx))}, then ` : 'Then '}chapter ${esc(to)}.`
      : `<div class="cr-ask-q">Where does the book send you?</div><div class="cr-seg">${[...new Set(Object.values(ch.win))].map(n => `<button type="button" class="cr-seg-b${r.pick === n ? ' on' : ''}" data-mr-res-pick="${n}">Chapter ${n}</button>`).join('')}</div>`;
  } else if (r.out === 'boss') lead = `Then chapter ${esc(ch.boss)}.`;
  else if (r.out === 'died') lead = g.sheet ? 'Then the campaign starts over from chapter 1: your starting stats, an empty Inventory, Notoriety back to 1. Skills and Perk Points stay.' : 'Then the chapter again.';
  // a won fight with no exploration earns no Perk Points
  const noPP = r.out === 'won' && span === 0;
  const pp = noPP ? 0 : _mrPP(r.floors, r.level);
  return `<div class="mr-result">
    <div class="cr-ask-q">How did it go?</div>
    <div class="cr-seg">${outs.map(([k, l]) => `<button type="button" class="cr-seg-b${r.out === k ? ' on' : ''}" data-mr-res-out="${k}">${esc(l)}</button>`).join('')}</div>
    ${r.out ? `
    ${noPP ? '<div class="rv-hint">No exploration in this chapter: winning it earns no Perk Points.</div>' : `
    <div class="cr-row"><span class="cr-lbl cr-lbl-wide">Floors completed${span ? ` <span class="cr-note">(of ${span})</span>` : ''}</span>
      <button type="button" class="rv-dot" data-mr-res-floors="-1" aria-label="One less"${r.floors > 0 ? '' : ' disabled'}>&minus;</button><b class="cr-n">${r.floors}</b>
      <button type="button" class="rv-dot" data-mr-res-floors="1" aria-label="One more"${r.floors < Math.max(span, 4) ? '' : ' disabled'}>+</button></div>
    <div class="cr-row"><span class="cr-lbl cr-lbl-wide">Level reached</span>
      <span class="cr-seg cr-seg-sm">${[1, 2, 3].map(n => `<button type="button" class="cr-seg-b${r.level === n ? ' on' : ''}" data-mr-res-level="${n}">${n}</button>`).join('')}</span></div>
    <div class="mr-pp-sum"><b>+${pp}</b> Perk Point${pp === 1 ? '' : 's'}<span class="cr-note">${r.floors} for the Floors, ${Math.max(0, r.level - 1)} for the Levels</span></div>`}
    <div class="mr-lead">${lead}</div>
    <button type="button" class="rv-btn cr-begin" data-mr-save>Save the result</button>` : ''}
    <button type="button" class="rv-link" data-mr-cancel>Not playing it after all</button>
  </div>`;
}

// The Council's character sheet: the stats carried from chapter to chapter, Notoriety and the Inventory.
function _mrCharHtml(c, edit) {
  const esc = _escapeHtml;
  const st = _mrStats(c), start = _mrStartStats(c), inv = c.inv || {}, noto = c.noto || 1;
  const lvl = _mrLevel(st.xp || 0);
  const rows = MR_STATS.map(([k, label, lo, hi]) => `<div class="mr-stat"><span class="cr-lbl">${label}${k === 'xp' ? `<i>Level ${lvl}</i>` : k === 'hp' ? `<i>start ${start.hp}</i>` : ''}</span>
      <button type="button" class="rv-dot" data-mr-stat="${k}|-1" aria-label="One ${label} less"${st[k] > lo ? '' : ' disabled'}>&minus;</button><b class="cr-n">${st[k] || 0}</b>
      <button type="button" class="rv-dot" data-mr-stat="${k}|1" aria-label="One ${label} more"${st[k] < hi ? '' : ' disabled'}>+</button></div>`).join('');
  return `<div class="rv-sec">The ${esc(_mrCharName(c))}</div>
    <div class="mr-stats">${rows}</div>
    <div class="rv-sub">Potions <span class="cr-note">two at most</span></div>
    <div class="cr-seg cr-seg-sm mr-potions">${MR_POTIONS.map(([k, l]) => `<button type="button" class="cr-seg-b${st.potions.includes(k) ? ' on' : ''}" data-mr-potion="${k}">${l}</button>`).join('')}</div>
    <label class="cr-row mr-item"><span class="cr-lbl">Item</span><input class="rv-in" data-mr-text="stats/item" value="${esc(st.item || '')}" placeholder="The Item card you carry" maxlength="40" ${edit ? '' : 'readonly'}></label>
    <div class="rv-sub">Notoriety</div>
    <div class="mr-noto">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="mr-noto-n n${n}${n <= noto ? ' on' : ''}${n === noto ? ' at' : ''}" data-mr-noto="${n}" aria-label="Notoriety ${n}">${n}</button>`).join('')}</div>
    <div class="rv-sub">Inventory <span class="cr-note">lost when you die</span></div>
    <div class="mr-inv">${MR_INV.map(it => `<button type="button" class="cr-flag${inv[it.id] ? ' on' : ''}" data-mr-inv="${it.id}"><span class="rv-check">${inv[it.id] ? '&#10003;' : ''}</span><span><b>${esc(it.name)}</b>${it.text ? `<span class="cr-note"> ${esc(it.text)}</span>` : ''}</span></button>`).join('')}</div>
    <details class="mr-startstats"><summary>Starting stats: HP ${start.hp}, Food ${start.food}, Gold ${start.gold}, Armor ${start.armor}${start.potions.length ? `, ${start.potions.map(p => (MR_POTIONS.find(x => x[0] === p) || [p, p])[1]).join(' and ')} Potion` : ''}</summary>
      <div class="mr-stats">${MR_STATS.filter(s => s[0] !== 'xp').map(([k, label, lo, hi]) => `<div class="mr-stat"><span class="cr-lbl">${label}</span>
        <button type="button" class="rv-dot" data-mr-start-stat="${k}|-1" aria-label="One less"${start[k] > lo ? '' : ' disabled'}>&minus;</button><b class="cr-n">${start[k]}</b>
        <button type="button" class="rv-dot" data-mr-start-stat="${k}|1" aria-label="One more"${start[k] < hi ? '' : ' disabled'}>+</button></div>`).join('')}</div>
      <div class="rv-hint">What a restart goes back to, and what "HP back to its starting value" means.</div>
    </details>`;
}

// A line of the games: its play (BG Stats' QR code and the pencil), or a button to log it.
function _mrLogActs(c, ts, l, edit) {
  if (l.play) {
    const i = (PLAY_HISTORY[c.game] || []).findIndex(e => e.mp === l.play);
    if (i < 0) return '';
    return (typeof bgsSendBtnHtml === 'function' ? bgsSendBtnHtml(c.game, i) : '')
      + (typeof logPlayEditBtnHtml === 'function' ? logPlayEditBtnHtml(PLAY_HISTORY[c.game][i]) : '');
  }
  const signed = typeof acctMe === 'function' && acctMe();
  return edit && signed ? `<button type="button" class="cr-mini" data-mr-logplay="${_escapeHtml(ts)}">Log the play</button>` : '';
}

// ── The skill tree (and Mini Rogue's Relics) ──
// { on, ok, why }: whether a Skill is unlocked, or can be.
function _mrSkillState(c, id) {
  const S = MR_SKILL[id], skills = c.skills || {};
  if (skills[id]) return { on: true };
  const paths = new Set(Object.keys(skills).map(k => MR_SKILL[k] && MR_SKILL[k].path).filter(Boolean));
  if (!paths.has(S.path) && paths.size >= 2) return { ok: false, why: 'Two paths taken already' };
  if (S.needs && !skills[S.needs]) return { ok: false, why: `Unlock ${MR_SKILL[S.needs].name} first` };
  if (S.other && S.other.some(o => skills[o])) return { ok: false, why: 'The other branch is taken' };
  if (S.cost > (c.perks || 0)) return { ok: false, why: `${S.cost} Perk Points needed`, short: true };
  return { ok: true };
}
function _mrSheetHtml(c, edit) {
  const esc = _escapeHtml;
  const g = _mrG(c);
  const node = (S, tier) => {
    const s = _mrSkillState(c, S.id), cost = [0, 1, 2, 4][tier];
    return `<button type="button" class="mr-node${s.on ? ' on' : s.ok ? ' can' : s.short ? ' short' : ' no'}" data-mr-skill="${S.id}">
      <span class="mr-node-h"><b>${esc(S.name)}</b><span class="mr-cost">${s.on ? '&#10003;' : `${cost}&#8202;PP`}</span></span>
      <span class="mr-node-t">${esc(S.text)}</span>
      ${!s.on && !s.ok ? `<span class="mr-node-why">${esc(s.why)}</span>` : ''}</button>`;
  };
  const used = new Set(Object.keys(c.skills || {}).map(k => MR_SKILL[k] && MR_SKILL[k].path).filter(Boolean));
  const tree = MR_SKILLS.map(P => `<div class="mr-tpath${!used.has(P.path) && used.size >= 2 ? ' closed' : ''}" style="--mr-p:${P.color}">
      <div class="mr-path-h">${esc(P.name)}</div>
      ${node(P.t1, 1)}
      <div class="mr-branches">${P.branches.map(([a, b]) => `<div class="mr-branch">${node(a, 2)}${node(b, 3)}</div>`).join('')}</div>
    </div>`).join('');
  const relics = c.relics || {};
  const known = g.relics.map(r => {
    const have = relics[r.id];
    return `<div class="mr-relic${have ? ' on' : ''}">
      <button type="button" class="cr-flag${have ? ' on' : ''}" data-mr-relic="${r.id}"><span class="rv-check">${have ? '&#10003;' : ''}</span><b>${esc(r.name)}</b></button>
      ${have ? `<input class="rv-in mr-relic-note" data-mr-text="relics/${r.id}/note" value="${esc(have.note || '')}" placeholder="What it does (from the campaign sheet)" maxlength="160" ${edit ? '' : 'readonly'}>` : ''}</div>`;
  }).join('');
  return `<div class="rv-sec">Skills <span class="cr-count">${c.perks || 0} Perk Point${c.perks === 1 ? '' : 's'} to spend</span></div>
    <div class="rv-hint rv-hint-top">Tap a Skill to unlock it. At most two paths, and one branch of each. Skills are passive: they apply in every game from now on${g.sheet ? ', and stay when you die' : ''}.</div>
    <div class="mr-tree">${tree}</div>
    ${g.relics.length ? `<div class="rv-sec">Relics</div>
    <div class="rv-hint rv-hint-top">Kept for good: they don't count towards your Item limit and aren't lost when you die.</div>
    <div class="mr-relics">${known}</div>` : ''}`;
}

function _mrNotesHtml(c, edit) {
  return `<textarea class="rv-in cr-notes" data-mr-text="notes" rows="10" placeholder="Choices made, what the story revealed, where you stopped…" ${edit ? '' : 'readonly'}>${_escapeHtml(c.notes || '')}</textarea>`;
}

// ── A game's play: logged in the app (js/log-play.js) and offered to BG Stats ──
// The player, with the character as their role; "Chapter 8" as the scenario,
// from when the chapter was started.
async function _mrLogPlay(id, ts) {
  const c = _mrCamps[id], l = c && (c.log || {})[ts];
  if (!l || l.play) return null;
  if (typeof logPlaySave !== 'function' || !(typeof acctMe === 'function' && acctMe())) return { err: 'Sign in to have the chapter logged as a play.' };
  const start = l.from && l.from < l.at && l.at - l.from < 12 * 3600e3 ? l.from : l.at;
  const d = new Date(start), pad = (n) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const player = c.player || _mrMe();
  const rec = {
    bggId: Number(c.game), date, t: `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    sc: [{ n: player, w: !!l.won, r: _mrCharName(c) }],
    b: `Chapter ${l.ch}`,
    c: `${c.name ? `${c.name}: ` : ''}campaign${_mrG(c).sheet ? '' : ', Roguelike'} · ${_mrResText(c, l)} · +${l.pp || 0} Perk Point${l.pp === 1 ? '' : 's'}`,
  };
  const mins = start === l.from ? Math.round((l.at - l.from) / 60000) : 0;
  if (mins >= 1) rec.d = mins;
  try {
    const r = await logPlaySave(rec);
    await _mrPatch({ [`log/${ts}/play`]: r.id }, id);
    _mrPlaysStale = true;
    return r;
  } catch (e) {
    return { err: `The play wasn't logged: ${e.message || 'try again'}. The "Log the play" button on the game's line tries again.` };
  }
}
async function _mrAfter(id, ts) {
  if (_mrLogging.has(id + ts)) return;
  _mrLogging.add(id + ts);
  const r = await _mrLogPlay(id, ts).finally(() => _mrLogging.delete(id + ts));
  if (!r) return;
  if (r.err) { _mrToast(r.err); _mrRedraw(); return; }
  _mrRedraw();
  const c = _mrCamps[id];
  const i = (PLAY_HISTORY[c.game] || []).findIndex(e => e.mp === r.id);
  if (i >= 0 && typeof openBgsShare === 'function') openBgsShare(c.game, i);
}
function _mrRedraw() {
  const p = _mrPanel;
  if (!p || !p.isConnected) return;
  const a = document.activeElement;
  if (a && p.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
  _mrRender(p);
}

// ── what a tap does ──
async function _mrClick(panel, ev) {
  const t = ev.target.closest('button');
  if (!t || !panel.contains(t) || t.disabled) return;
  const ds = t.dataset;
  if (ds.mrTab) { _mrTab = ds.mrTab; _mrRender(panel); return; }
  if (ds.mrCamp) {
    const id = ds.mrCamp;
    if (id === '__new') {
      const open = !_mrId && _mrDraft;
      _mrId = null;
      _mrDraft = open ? null : _mrNewDraft(MR_GAMES[_mrGame].key === 'council' ? 'ratcatcher' : 'rogue');
    } else if (_mrId === id) _mrId = null;
    else { _mrId = id; _mrDraft = null; _mrTab = 'camp'; _mrRes = null; }
    _mrRender(panel);
    return;
  }
  if (!_mrId) return _mrDraftClick(panel, t, ds);
  // the result as this phone fills it in, saved with "Save the result"
  if (ds.mrResOut || ds.mrResFloors || ds.mrResLevel || ds.mrResPick) {
    const r = _mrRes, c = _mrCamps[_mrId];
    if (!r || !c) return;
    const ch = _mrCh(c, c.at), g = _mrG(c);
    const span = g.sheet ? ch.floors || 0 : ch.last - (ch.start || 1) + 1;
    if (ds.mrResOut) {
      r.out = ds.mrResOut;
      // a won chapter has all its Floors; a death keeps what was counted, less the last
      if (r.out === 'won') r.floors = span;
      else if (r.out === 'boss') r.floors = Math.max(0, span - 1);
      else r.floors = Math.min(r.floors, Math.max(0, span - 1));
    } else if (ds.mrResFloors) r.floors = Math.max(0, Math.min(Math.max(span, 4), r.floors + Number(ds.mrResFloors)));
    else if (ds.mrResLevel) r.level = Number(ds.mrResLevel);
    else r.pick = ds.mrResPick;
    _mrRender(panel);
    return;
  }
  const c = _mrCamps[_mrId];
  if (!c || !_mrCanEdit(c)) return;
  if (ds.mrDelete !== undefined) {
    if (!confirm(`Delete “${c.name || 'this campaign'}”? Its plays stay in the play log; only the campaign goes.`)) return;
    const id = _mrId;
    try { await fbWrite(`mrCampaigns/${id}`, 'DELETE', null, _mrSrc[id]); }
    catch (e) { console.warn('Mini Rogue campaign: not deleted', e); _mrToast('Not deleted. Check the connection and try again.'); return; }
    delete _mrCamps[id];
    _mrId = null;
    _mrRender(panel);
    return;
  }
  if (ds.mrLogplay) {
    if (_mrLogging.has(_mrId + ds.mrLogplay)) return;
    t.disabled = true;
    _mrAfter(_mrId, ds.mrLogplay);
    return;
  }
  const g = _mrG(c), ch = _mrCh(c, c.at);
  const up = {};
  let note = '', ok = false, after = null;
  const road = _mrRoad(c);
  // to another chapter: what a story chapter does on arriving happens (unless
  // it's a correction); what it did, for the toast
  const moveTo = (n, fix) => {
    n = String(n);
    up.at = n;
    up.road = [...road, n];
    up.playing = null;
    up.fight = null;
    const to = _mrCh(c, n);
    if (to && to.kind === 'end') { up.status = 'won'; up.ending = n; ok = true; return 'An ending: the campaign is won!'; }
    if (to && to.kind === 'story' && to.fx && !fix && g.sheet) { _mrApply(c, to.fx, up); return `Chapter ${n}: ${_mrFxText(to.fx)}.`; }
    return '';
  };
  if (ds.mrStop !== undefined) {
    if (!confirm('Stop this campaign? Everything stays as it is, under "Stopped and finished", and it can be picked up again any time.')) return;
    Object.assign(up, { status: 'stopped', stopped: Date.now(), playing: null });
    note = 'Stopped. Pick it up again from its tab any time.';
  } else if (ds.mrResume !== undefined) { up.status = null; up.stopped = null; }
  else if (ds.mrPp) up.perks = Math.max(0, (c.perks || 0) + Number(ds.mrPp));
  else if (ds.mrOpt) {
    const o = (ch.opts || [])[Number(ds.mrOpt)];
    if (!o) return;
    if (o.fx) _mrApply(c, o.fx, up);
    note = [o.fx && g.sheet ? `${_mrFxText(o.fx)}.` : '', moveTo(o.to)].filter(Boolean).join(' ');
    ok = true;
  } else if (ds.mrGo) {
    if (c.status === 'won') { up.status = null; up.ending = null; }
    note = moveTo(ds.mrGo, ds.mrFix !== undefined);
  } else if (ds.mrGoto !== undefined) {
    const n = _mrClean(prompt('Which chapter? (to correct where the campaign is: nothing else changes)', c.at || '1'));
    if (!n) return;
    if (!_mrCh(c, n)) { _mrToast(`The book has no chapter ${n}.`); return; }
    if (c.status === 'won') { up.status = null; up.ending = null; }
    moveTo(n, true);
  } else if (ds.mrAct) {
    const a = (ch.acts || [])[Number(ds.mrAct)];
    if (!a || !a.fx || !_mrCheck(c, a.if).ok) return;
    _mrApply(c, a.fx, up);
    note = _mrFxText(a.fx);
    ok = true;
  } else if (ds.mrPass !== undefined) {
    note = `Passed: chapter ${ch.test.ok}. ${moveTo(ch.test.ok)}`;
    ok = true;
  } else if (ds.mrFail !== undefined) {
    if (ch.test.retry) { _mrApply(c, ch.test.retry, up); note = `${_mrFxText(ch.test.retry)}. Try again.`; }
    else { up.playing = Date.now(); up.fight = true; _mrRes = null; note = 'Failed: fight!'; }
  } else if (ds.mrFinish !== undefined) {
    if (!c.status && !confirm('Mark the campaign as won?')) return;
    up.status = 'won';
    up.playing = null;
    note = 'The campaign is won!';
    ok = true;
  } else if (ds.mrUnfinish !== undefined) up.status = null;
  else if (ds.mrBegin !== undefined) {
    up.playing = Date.now();
    _mrRes = null;
    const said = [];
    if (ch.relic && !(c.relics || {})[ch.relic]) {
      up[`relics/${ch.relic}`] = { name: MR_BASE_RELICS.find(r => r.id === ch.relic).name, at: Date.now() };
      said.push(`You gain the ${up[`relics/${ch.relic}`].name}.`);
    }
    if (ch.fx && g.sheet) { _mrApply(c, ch.fx, up); said.push(`${_mrFxText(ch.fx)}.`); }
    note = `Chapter ${c.at} on. ${said.join(' ')} Good luck!`;
    ok = true;
  } else if (ds.mrCancel !== undefined) { up.playing = null; up.fight = null; _mrRes = null; }
  else if (ds.mrSave !== undefined) {
    const r = _mrRes;
    if (!r || !r.out) return;
    let next = String(c.at);
    if (r.out === 'won') {
      next = _mrLead(c, ch.win) || r.pick;
      if (!next) { _mrToast('Where does the book send you? Pick the chapter.'); return; }
    } else if (r.out === 'boss') next = ch.boss;
    const span = g.sheet ? ch.floors || 0 : ch.last - (ch.start || 1) + 1;
    const pp = r.out === 'won' && span === 0 ? 0 : _mrPP(r.floors, r.level);
    after = String(Date.now());
    const first = g.sheet ? 1 : ch.start || 1;
    up[`log/${after}`] = { ch: String(c.at), won: r.out === 'won', ...(r.out === 'boss' ? { boss: true } : {}), ...(r.out !== 'won' && span ? { floor: first + r.floors } : {}),
      ...(c.fight ? { fight: true } : {}), level: r.level, pp, at: Date.now(), from: c.playing || Date.now(), by: _mrMe() || '' };
    up.perks = (c.perks || 0) + pp;
    _mrRes = null;
    const ppText = `+${pp} Perk Point${pp === 1 ? '' : 's'}${pp ? ': spend them on the Skills tab' : ''}.`;
    if (r.out === 'won') {
      if (ch.winFx) _mrApply(c, ch.winFx, up);
      const arrived = moveTo(next);
      note = `${ppText} ${ch.winFx && g.sheet ? `${_mrFxText(ch.winFx)}. ` : ''}${up.status === 'won' ? arrived : `Next: chapter ${next}. ${arrived}`}`;
      ok = true;
    } else if (r.out === 'died' && g.sheet) {
      // The Council: the campaign starts over, keeping the Skills and the Perk Points
      const start = _mrStartStats(c);
      Object.assign(up, { at: '1', road: [...road, '†', '1'], playing: null, fight: null, inv: null, noto: 1,
        stats: { hp: start.hp, xp: 0, armor: start.armor, food: start.food, gold: start.gold, potions: start.potions, item: '' } });
      note = `${ppText} The campaign starts over from chapter 1.`;
    } else {
      const arrived = next !== String(c.at) ? moveTo(next) : '';
      if (next === String(c.at)) { up.playing = null; up.fight = null; }
      note = `${ppText} ${next !== String(c.at) ? `The book sends you to chapter ${next}. ${arrived}` : 'Play the chapter again.'}`;
    }
  } else if (ds.mrStat || ds.mrStartStat) {
    const [k, d] = (ds.mrStat || ds.mrStartStat).split('|');
    const s = MR_STATS.find(x => x[0] === k);
    const base = ds.mrStat ? _mrStats(c) : _mrStartStats(c);
    up[`${ds.mrStat ? 'stats' : 'start'}/${k}`] = Math.max(s[2], Math.min(s[3], (base[k] || 0) + Number(d)));
  } else if (ds.mrPotion) {
    const p = _mrStats(c).potions;
    if (p.includes(ds.mrPotion)) up['stats/potions'] = p.filter(x => x !== ds.mrPotion);
    else if (p.length >= 2) { _mrToast('Two Potions at most: drop one first.'); return; }
    else up['stats/potions'] = [...p, ds.mrPotion];
  } else if (ds.mrNoto) up.noto = Number(ds.mrNoto) === (c.noto || 1) && Number(ds.mrNoto) > 1 ? Number(ds.mrNoto) - 1 : Number(ds.mrNoto);
  else if (ds.mrInv) up[`inv/${ds.mrInv}`] = (c.inv || {})[ds.mrInv] ? null : true;
  else if (ds.mrSkill) {
    const S = MR_SKILL[ds.mrSkill], s = _mrSkillState(c, ds.mrSkill);
    if (s.on) {
      const dep = Object.keys(c.skills || {}).find(k => MR_SKILL[k] && MR_SKILL[k].needs === S.id);
      if (dep) { _mrToast(`Take ${MR_SKILL[dep].name} off first.`); return; }
      if (!confirm(`Take ${S.name} off and get its ${S.cost} Perk Point${S.cost === 1 ? '' : 's'} back?`)) return;
      up[`skills/${S.id}`] = null;
      up.perks = (c.perks || 0) + S.cost;
    } else if (!s.ok) { _mrToast(`${S.name}: ${s.why}.`); return; }
    else {
      up[`skills/${S.id}`] = Date.now();
      up.perks = (c.perks || 0) - S.cost;
      note = `${S.name} unlocked for ${S.cost} Perk Point${S.cost === 1 ? '' : 's'}.`;
      ok = true;
    }
  } else if (ds.mrRelic) {
    const k = ds.mrRelic, r = g.relics.find(x => x.id === k);
    up[`relics/${k}`] = (c.relics || {})[k] ? null : { name: r.name, at: Date.now() };
  }
  if (!Object.keys(up).length) return;
  const id = _mrId;
  const saved = _mrPatch(up);
  _mrRender(panel);
  if (note) _mrToast(note.trim(), ok);
  if (after) saved.then(() => _mrAfter(id, after));
}

function _mrNewDraft(char) {
  const ch = _mrChar(char) || {};
  return { char, player: _mrMe() || '', name: '', start: { ...MR_START, ...(ch.start || {}), potions: [...((ch.start || {}).potions || [])] } };
}
async function _mrDraftClick(panel, t, ds) {
  const d = _mrDraft;
  if (!d) return;
  if (ds.mrDraftChar) {
    const keep = { player: d.player, name: d.name };
    _mrDraft = Object.assign(_mrNewDraft(ds.mrDraftChar), keep);
  } else if (ds.mrDraftStat) {
    const [k, v] = ds.mrDraftStat.split('|'), s = MR_STATS.find(x => x[0] === k);
    d.start[k] = Math.max(s[2], Math.min(s[3], d.start[k] + Number(v)));
  } else if (ds.mrDraftPotion) {
    const p = ds.mrDraftPotion;
    if (d.start.potions.includes(p)) d.start.potions = d.start.potions.filter(x => x !== p);
    else if (d.start.potions.length < 2) d.start.potions.push(p);
  } else if (ds.mrStart !== undefined) {
    d.player = _mrClean((panel.querySelector('[data-mr-who="player"]') || {}).value) || _mrMe();
    if (!d.player) { _mrToast('Who\'s playing?'); return; }
    t.disabled = true;
    const g = MR_GAMES[_mrGame];
    const c = { game: _mrGame, name: d.name.trim(), player: d.player, char: d.char, at: '1', road: ['1'], perks: 0, created: Date.now(), updated: Date.now(), by: _mrMe() };
    if (g.sheet) Object.assign(c, { start: d.start, stats: { ...d.start, xp: 0, item: '' }, noto: 1 });
    try {
      const { store, json } = await fbWrite('mrCampaigns', 'POST', c);
      _mrCamps[json.name] = c;
      _mrSrc[json.name] = store;
      _mrId = json.name;
    } catch (e) {
      console.warn('Mini Rogue campaign: not started', e);
      t.disabled = false;
      t.textContent = 'Couldn\'t start it. Try again';
      return;
    }
    _mrDraft = null;
    _mrTab = 'camp';
  } else return;
  _mrRender(panel);
}

// Typing in the name, the Item, a Relic's note or the notes: saved a moment after you stop.
function _mrInput(panel, ev) {
  const t = ev.target;
  if (t.matches('[data-mr-draft-name]') && _mrDraft) { _mrDraft.name = t.value; return; }
  if (t.matches('[data-mr-who="player"]') && _mrDraft) { _mrDraft.player = t.value; return; }
  const path = t.dataset && t.dataset.mrText;
  if (!path) return;
  const c = _mrCamps[_mrId];
  if (!c || !_mrCanEdit(c)) return;
  clearTimeout(_mrSaveTimers[path]);
  _mrSaveTimers[path] = setTimeout(() => _mrPatch({ [path]: t.value }), 700);
}
