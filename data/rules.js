// Rules cards for the game pages' Rules tab (js/rules.js), by BGG id: one
// screen each, written from each game's rulebook. Loaded only when the tab
// opens. Edit freely; keep it valid JSON between the outer braces.
const RULES = {
 "184267": {
  "src": "the On Mars rulebook (Eagle-Gryphon Games)",
  "goal": "Earn the most **Opportunity Points (OP)** building the Mars colony. The end comes after **3 Missions** are completed (fewer at higher colony levels): finish the round, then play one more without the final Shuttle phase.",
  "turn": [
   "Turn order: the Orbit spaces left to right, then the Colony spaces.",
   "Take **1 Main action** on the side of the board you're on: place a Colonist from your Living Quarters on its slot. Pay 1 Crystal or move 1 Colonist to your Working Area **per other colour** already there.",
   "Optionally take **1 Executive action** (paid in Crystals) before or after it.",
   "Boost actions by moving extra Colonists to your Working Area or paying Crystals, as shown.",
   "Contributing to a Mission earns Crystals. Lay your Player marker down when done."
  ],
  "actions": [
   [
    "Landing Pod (Orbit)",
    "Travel to the Colony now (no Discovery tile)."
   ],
   [
    "Blueprint (Orbit)",
    "Take a Blueprint and its Resource or Crystal. Boost: +1 Blueprint per Colonist."
   ],
   [
    "Technology (Orbit)",
    "Take a Tech tile into your Lab's left column (bottom row free, middle 1 Battery, top 1 Battery + 1 Resource). One of each type only."
   ],
   [
    "R&D (Orbit)",
    "Move Tech tiles right (one tile twice or two once), paying each column's cost and taking its benefit."
   ],
   [
    "Resupply (Orbit)",
    "Take 1 Resource or Crystal from the Warehouse. Boost: +1 per Colonist."
   ],
   [
    "Control Center (Colony)",
    "Move Bots 2 and the Rover 2 (+1 per Crystal in your Depot). The Rover picks up Crystals and claims Discovery tiles."
   ],
   [
    "Construct (Colony)",
    "In a Bot's zone: exactly 2 hexes from a building of the same type, or next to one to make or grow a Complex (needs a Tech of that type at least the Complex size). Gain Resources = Complex size."
   ],
   [
    "Upgrade (Colony)",
    "Use a Blueprint on a building in a Bot's zone: pay 1 Mineral, put your Advanced marker on it (level 3 needs a Complex of 3+)."
   ],
   [
    "Welcome a Ship (Colony)",
    "Pay 1 Plant + 1 Water: ship to your Hangar, gain 1 Colonist + 1 Bot or 2 Colonists."
   ],
   [
    "Scientist or Contract (Colony)",
    "Take a Scientist or an Earth Contract from the display."
   ]
  ],
  "round": [
   "**Shuttle phase**: the Shuttle moves one space toward the middle; on the red space it flies to the other side.",
   "You travel free if it left from your side; otherwise discard a ship from your Hangar to travel.",
   "To the Colony: place a Discovery tile 3 hexes from your Rover, take your Colonists back, pick a Colony turn-order space.",
   "To Orbit: **production** (Advanced Buildings produce, those on Shelters a Crystal, mines Minerals), take Colonists back, pick an Orbit space."
  ],
  "end": [
   "Colonists: OP for your highest Colonist in your Living Quarters.",
   "Progress cubes 1/2/4/7/11 OP; 3 OP per ship in your Hangar; Tech OP below your Lab columns.",
   "Advanced Buildings 3 OP (level 1) or 5 OP (level 3); **minus** 3/5 per Blueprint never built.",
   "Scientists 3 OP per Advanced Building of their type (anyone's); Contracts gain or lose OP.",
   "Ties: Crystals, then Advanced Buildings, then Progress cubes."
  ],
  "forget": [
   "Only the actions on **your** side of the board are available.",
   "Unbuilt Blueprints **cost** points at the end.",
   "Travel gets rarer as the colony level rises.",
   "You may discard a Private Goal unseen to use it as a Crystal."
  ]
 },
 "161533": {
  "src": "the Lisboa rulebook (Eagle-Gryphon Games)",
  "goal": "Most **wigs** after two periods, rebuilding Lisbon: stores, public buildings, ships, decrees and the Church.",
  "turn": [
   "**Dock your ships**: any ship at sea (full hold) returns its goods to the supply.",
   "**Play a card** for one of the four actions, or discard one for 1 gold.",
   "**Refill** to 5 cards from the face-up Political cards."
  ],
  "actions": [
   [
    "Sell Goods (card to Portfolio)",
    "Noble: take its reward/penalty. Treasury card: take réis = Treasury value. Then sell goods onto docked ships (anyone's); a ship that fills sets sail and its owner gets 1 wig per crate."
   ],
   [
    "Trade with Nobles (card to Portfolio)",
    "Give 1–2 goods for State actions. Manuel da Maia (tools/gold): officials, plans. Marquis (books/gold): build a ship, produce goods. King (cloth/gold): Cardinal, Royal Favor."
   ],
   [
    "Visit a Noble (Noble to Court)",
    "Pay Influence = value left of the Treasury marker + rivals' officials in that office. Take 1 free State action, then the main one: Maia **builds a store**, the Marquis **gives a Decree**, the King **opens a Public Building**. Players with that Noble's Royal Favor may follow."
   ],
   [
    "Sponsor an Event (Treasury card to Court)",
    "Pay réis = Treasury value and do the card's centre action."
   ]
  ],
  "round": [
   "Your Portfolio starts with room for 2 cards; each completed rubble set adds a slot and warehouse space.",
   "Influence = the total on your top-row cards (Nobles and ships), gained each time; the 10 space gives a wig.",
   "**Church scoring** when the Cardinal reaches the Church icon: give up Clergy tiles for their wigs and Influence."
  ],
  "end": [
   "Period 1 ends at someone's 2nd rubble set or when 3 decks run out; the game at the 4th set or 3 decks again, plus one final round.",
   "Wigs: hull sizes of ships in your Portfolio; 3 per rubble set (at each period end).",
   "Store majorities: gold 3/2/1, tools 6/3/1, books and cloth 9/6/3.",
   "1 wig per 5 réis; fulfilled Decrees; officials in Public Buildings 15/10/5 (2 players 15/5); 2 per Royal Favor."
  ],
  "forget": [
   "Playing to your Portfolio **forces** Sell Goods or Trade with Nobles right after.",
   "A store's land costs the Treasury value + rubble left in its row and column (earthquake 3, fire 2, tsunami 1).",
   "Opening a Public Building pays **every** matching store's owner.",
   "You can pay a Visit's missing Influence in wigs."
  ]
 },
 "163068": {
  "src": "the Trickerion rulebook (Mindclash Games)",
  "goal": "Most **Fame** after five turns (weeks), mostly from performing tricks in the Theater.",
  "turn": [
   "**Roll** the six Downtown dice.",
   "**Initiative**: least Fame goes first (from turn 2).",
   "**Advertise**: once, pay coins = your initiative position for 2 Fame.",
   "**Assign**: secretly put an Assignment card under each Character (no card = idle, no wage).",
   "**Place**: in initiative order, one Character at a time; it spends all its AP there (Apprentice 1, Specialist 2, Magician 3; +1 for a Shard, not in the Theater).",
   "**Perform**: Thursday to Sunday, each Magician on a Performance slot performs one card holding their tricks.",
   "**End**: wages (1 per Apprentice, 2 per Specialist working; −2 Fame per coin unpaid), orders arrive, cards move on."
  ],
  "actions": [
   [
    "Downtown",
    "Learn a trick (3 AP; matching a die or your favourite category; pay coins for missing Fame) · Hire (3) · Take coins (3) · Reroll a die (1) · Set a die (2)."
   ],
   [
    "Market Row",
    "Buy up to 3 of one component (1 AP) · Bargain: −1 coin per AP · Order (1) · Quick Order (2, +1 coin)."
   ],
   [
    "Workshop",
    "Prepare a trick whose components you hold: markers = overlapping squares (components aren't used up)."
   ],
   [
    "Theater",
    "Set up a trick (1 AP): a marker onto a Performance card; matching symbols in a Link circle link for a bonus. Reschedule (1). Magicians on the bottom row perform."
   ]
  ],
  "end": [
   "After turn 5: +1 Fame per Shard, +1 per 3 coins, +2 per Apprentice, +3 per Specialist.",
   "Ties go to the player ahead in initiative."
  ],
  "forget": [
   "Your Characters can use only **one weekday** in the Theater each turn.",
   "Thursday: −1 to your tricks' Fame and coins; Sunday: +1.",
   "Opponents whose tricks are on a card you perform earn their yields too.",
   "You can learn a trick without its components; you need them to prepare it."
  ]
 },
 "321608": {
  "src": "the Hegemony rulebook (Hegemonic Project Games)",
  "goal": "Five rounds of class struggle. The Working Class gains VP raising **Prosperity**, the Capitalists by building **capital**, the Middle Class from both, the State by keeping **legitimacy**. Policies change by vote.",
  "turn": [
   "Round: **Preparation → Action → Production → Elections → Scoring**.",
   "Action phase: 5 turns each (keep 2 cards), in order Working, Middle, Capitalist, State.",
   "On your turn play 1 card for its effect (if its requirement is met) **or** discard it for a Basic action, plus 1 Free action before or after."
  ],
  "actions": [
   [
    "Everyone",
    "Propose a Bill: move a Policy one step (3 markers; 1 Influence for an immediate vote)."
   ],
   [
    "Working Class",
    "Assign up to 3 Workers · Buy one good (up to your Population) · Strike · Demonstration. Free: spend Health, Education or Luxury = Population for +1 Prosperity."
   ],
   [
    "Middle Class",
    "Assign Workers · Build or sell a company · Sell abroad · Buy goods · Extra shift · Political pressure."
   ],
   [
    "Capitalist Class",
    "Build or sell a company · Sell to the Foreign Market · Business deal · Lobby (30 for 3 Influence) · Political pressure (+3 cubes) · Repay a loan. Free: prices, wages, bonus, storage."
   ],
   [
    "State",
    "Event action · Sell abroad · Meet a party's MPs · Extra tax · Campaign."
   ]
  ],
  "round": [
   "**Production** (reverse order): companies pay wages and produce; Working and Middle Class buy Food = Population (or take a loan); taxes.",
   "**Elections**: for each Bill draw 5 cubes + secret Influence; ties pass. Proposer +3 VP, supporters +1.",
   "**Scoring**: each class by its own track (unions, wealth, legitimacy…)."
  ],
  "end": [
   "After round 5: Capitalists −5 VP per loan; others repay 55 per loan or lose 1 VP per 5 short.",
   "Policies in your section (A Working, B Middle, C Capitalist): 1/4/8/12/18 VP (Middle 1/3/6/10/15).",
   "Leftover goods and money convert to VP, differently for each class."
  ],
  "forget": [
   "Loans only when forced to pay something mandatory; 5 interest each round.",
   "Committed Workers can't move and their wage can't drop.",
   "Wages must respect the Labor Market policy.",
   "The IMF steps in if the State holds too many loans."
  ]
 },
 "214032": {
  "src": "the Founders of Gloomhaven rulebook (Cephalofair)",
  "goal": "Most points building the city together: import resources, upgrade them, deliver them to prestige buildings. Every time a resource is used, **its owner** scores.",
  "turn": [
   "Play a card **face up** for its main action (the others may then follow) or **face down** for a basic action (no follow).",
   "Then each other player in turn: the card's follow action, or a basic action.",
   "With 2+ cards played (3 with 2 players) you may play **Call to Vote** instead."
  ],
  "actions": [
   [
    "Recruit",
    "Take an adviser (you need its resource; pay $1–2) + 1 fleeting influence. Follow: recruit."
   ],
   [
    "Trade",
    "Import your basic resource (not touching your tiles) or buy access to someone's tile. Red space $1 import / $2 access, +$1 white, +$2 grey or green; neutral import with access $4. Follow: red or white spaces only."
   ],
   [
    "Upgrade",
    "Build a tier 2 ($4) or tier 3 ($6) building connected to its prerequisites, plus 1 connected road. Follow: no road."
   ],
   [
    "Construct",
    "A house (green space, one per section, frees a worker) or a bridge/gate: $3. Follow: $4."
   ],
   [
    "Basic",
    "$1 · 1 fleeting influence · 1 connected road · a worker on your race mat or a prestige building you've delivered to."
   ]
  ],
  "round": [
   "**Call to Vote**: the caller gets $1, 1 fleeting influence or a road per card left in hand, then takes back cards and workers.",
   "The others collect income: $1 per different resource owned, +1 fleeting influence per house.",
   "Secret vote on the 3 proposals: 1 + fleeting influence (1 each) + lasting (2 each). Whoever gave the most influence places the winner."
  ],
  "end": [
   "Ends when the **6th** prestige building is completed (finish that turn and its follows).",
   "Lasting influence 1 point each; every $4 is 1 point.",
   "Ties: closest to the active player."
  ],
  "forget": [
   "A delivery happens the moment a resource is **connected** to a building that needs it.",
   "Using another player's resource pays them; tier 3 payouts cascade down to the prerequisites.",
   "Only one tile of each resource type per city section.",
   "Your new tiles can't touch your own tiles (bridges/gates excepted)."
  ]
 },
 "62219": {
  "src": "the Dominant Species rulebook (GMT Games)",
  "goal": "Most **VP** when the Ice Age card comes out: score tiles by majority, claim Dominance cards, hold the tundra.",
  "turn": [
   "**Planning**: in initiative order, place action pawns one at a time on free eyeball spaces.",
   "**Execution**: resolve top to bottom, left to right (actions are optional).",
   "**Reset**: Extinction (endangered species die; the mammal saves one), Survival card to the most species on tundra, refill elements and cards."
  ],
  "actions": [
   [
    "Initiative",
    "Step up one place on the initiative track, then place the pawn again."
   ],
   [
    "Adaptation",
    "Take an element onto your animal (max 6)."
   ],
   [
    "Regression",
    "Lose matching elements (a pawn here saves one; reptiles save one free)."
   ],
   [
    "Abundance",
    "Place an element on a tile corner."
   ],
   [
    "Wasteland",
    "Remove an element type from the tundra."
   ],
   [
    "Depletion",
    "Remove a matching element from the board."
   ],
   [
    "Glaciation",
    "Turn a tile next to tundra into tundra (bonus VP)."
   ],
   [
    "Speciation",
    "Add species around an element: 4 sea/wetland, 3 savannah/jungle/forest, 2 desert/mountain, 1 tundra."
   ],
   [
    "Wanderlust",
    "Place a new tile (+ element, + VP); everyone may move onto it."
   ],
   [
    "Migration",
    "Move up to X species one tile (birds two)."
   ],
   [
    "Competition",
    "Remove an opposing species on up to 3 terrain types."
   ],
   [
    "Domination",
    "Score a tile by species count; the dominant animal takes a Dominance card."
   ]
  ],
  "end": [
   "When the Ice Age card is drawn: finish the turn (no refill), then score every tile once more (no cards).",
   "Ties go higher on the food chain: mammal, reptile, bird, amphibian, arachnid, insect."
  ],
  "forget": [
   "Dominance = most matching elements on a tile; a tie means nobody.",
   "Species with zero matches are endangered and die in Extinction.",
   "Removed species go to the box, not back to your gene pool.",
   "Insects place a free species and arachnids compete for free every turn."
  ]
 }
};
