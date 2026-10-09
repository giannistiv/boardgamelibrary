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
 },
 "120677": {
  "src": "the Terra Mystica rulebook (Feuerland / Z-Man Games)",
  "goal": "Most **VP** after 6 rounds: build on your home terrain, upgrade buildings, climb the four cults. Each round's scoring tile pays for certain builds.",
  "turn": [
   "**Income**: workers (dwellings), coins (trading houses), priests (temples), power, plus bonus card and favor tiles.",
   "**Actions**: one action per turn, around the table, until everyone passes. Conversions are free any time on your turn.",
   "**Cult bonuses and clean-up**: the scoring tile's cult rewards; +1 coin on each unused bonus card."
  ],
  "actions": [
   [
    "Transform and build",
    "Terraform a space next to your buildings (1 spade per step on your terrain cycle; workers at your exchange rate) and build a dwelling there: 1 worker + 2 coins."
   ],
   [
    "Shipping",
    "1 priest + 4 coins: +1 shipping (reach across rivers), VP as shown."
   ],
   [
    "Spade exchange",
    "2 workers + 5 coins + 1 priest: spades get cheaper, +6 VP."
   ],
   [
    "Upgrade",
    "Dwelling to trading house (2 workers + 6 coins, 3 if an opponent is adjacent); trading house to stronghold (faction ability) or temple (2 workers + 5 coins, favor tile); temple to sanctuary (favor tile)."
   ],
   [
    "Priest to a cult",
    "Place a priest for +3 or +2 on that cult (it stays), or return it for +1."
   ],
   [
    "Power actions",
    "Spend power from bowl III (once per round each): bridge, priest, 2 workers, 7 coins, 1 or 2 spades."
   ],
   [
    "Special action",
    "From your stronghold, a favor tile or a bonus card, once per round."
   ],
   [
    "Pass",
    "Swap your bonus card for an available one; the first to pass starts next round."
   ]
  ],
  "round": [
   "When an opponent builds or upgrades next to you, you may gain power = your adjacent buildings' power (dwelling 1, trading house/temple 2, stronghold/sanctuary 3) paying VP equal to the power gained **minus 1**.",
   "Power moves bowl I to II, then II to III; you spend from III. Sacrifice: burn one token from II to move another to III.",
   "Conversions: 5 power = priest, 3 = worker, 1 = coin; priest to worker, worker to coin.",
   "Town: 4+ directly adjacent buildings (3 if one is the sanctuary) with power 7+ found a town: take a town tile."
  ],
  "end": [
   "After round 6: each cult 8/4/2 VP for the top three.",
   "Largest connected area 18/12/6 VP.",
   "Turn everything into coins: every 3 coins is 1 VP."
  ],
  "forget": [
   "Only one player per cult can reach space 10, and it needs a town key.",
   "Cult rewards at 3/5/7/10: 1/2/2/3 power.",
   "Spades must be used at once; cult-bonus spades can't build a dwelling.",
   "You can't take less power from an opponent's build to pay fewer VP: all or nothing."
  ]
 },
 "161970": {
  "src": "the Alchemists rulebook (Czech Games Edition)",
  "goal": "Most **points** after 6 rounds, mostly from **publishing correct theories** about what each ingredient is. Reputation, artifacts and grants also score. The app tells you what you mix.",
  "turn": [
   "**Order**: from the start player, pick an order space: lower spaces give more ingredients and favors but act later.",
   "**Declare**: from the lowest order space up, place all your action cubes at once (3 cubes in round 1).",
   "**Resolve** the action spaces in board order; on each one the top row acts first. You may always decline a cube (unused pairs give a favor card).",
   "**End of round**: top alchemist (+1 reputation for most seals), favors for unused cube pairs, new adventurer, new ingredients."
  ],
  "actions": [
   [
    "Forage",
    "Take a face-up ingredient or draw one."
   ],
   [
    "Transmute",
    "Discard an ingredient for 1 gold."
   ],
   [
    "Buy artifact",
    "Pay its cost; it lasts the game or acts once, and most are worth points."
   ],
   [
    "Sell potion (2 cubes)",
    "Bid a discount for order, pick a potion the adventurer wants and a guarantee; paid only if your mix is at least that good. Wrong sign or neutral: −1 reputation."
   ],
   [
    "Debunk",
    "Reveal an aspect of a published ingredient. Theory proven wrong: +2 reputation, and every seal on it loses 5 reputation unless it hedged that colour. Theory holds: −1 reputation."
   ],
   [
    "Publish",
    "Put an alchemical token on an ingredient and your seal on it: 1 gold, +1 reputation. Or endorse someone's: 1 gold to each seal already there."
   ],
   [
    "Test on student",
    "Mix two ingredients; free until someone makes a negative potion, then 1 gold."
   ],
   [
    "Drink potion",
    "Mix on yourself: insanity −1 reputation, paralysis act last next round, poison lose a cube next round."
   ]
  ],
  "round": [
   "Conferences at the end of rounds 3 and 5: enough seals on the board = +1 reputation, too few loses reputation (see the tile); new artifacts come out.",
   "Grants: seals on 2 ingredients of a grant tile (3 for later grants) give 2 gold and points.",
   "Final round: exhibit potions (+1 reputation for the first to show one, +2 for both signs of a colour)."
  ],
  "end": [
   "Reputation becomes points; add artifacts and grants; favors are 2 gold, gold is 1/3 point.",
   "Then the truth: correct theory gold seal +5, silver +3; wrong theory starred seal −4, unstarred −4 unless it hedged the wrong colour.",
   "Ties: leftover gold."
  ],
  "forget": [
   "Starred seals are bets: +5/+3 points if right, but they can never hedge, so a debunk always costs 5 reputation.",
   "Reputation never drops below 1; in the blue zone (18+) every loss costs 2 more.",
   "Ingredients left in hand are worth nothing at the end.",
   "A negative potion can't hit you twice in the same round."
  ]
 },
 "177736": {
  "src": "the A Feast for Odin rulebook (Feuerland / Z-Man Games)",
  "goal": "Most points after 7 rounds (6 in the short game): cover your home board and islands with goods, earn income, keep everyone fed.",
  "turn": [
   "Each round: new Viking, harvest, exploration boards turn, new weapon card.",
   "**Actions**: in turn order, put Vikings on one free action space (1–4 Vikings, by its column) and do it at once. Keep going until everyone passes.",
   "Then: start player (last to place), income, animals breed, **feast**, board bonuses, mountain strips move, Vikings come home."
  ],
  "actions": [
   [
    "Production",
    "Take the goods shown."
   ],
   [
    "Exchange",
    "Build sheds, houses and ships; upgrade or craft goods."
   ],
   [
    "Mountains",
    "Take wood, stone, ore and silver from the mountain strips, nearest the arrow first."
   ],
   [
    "Trading",
    "Upgrade goods one step: orange, red, green, blue."
   ],
   [
    "Overseas trading",
    "Needs a knarr: upgrade different green goods to blue."
   ],
   [
    "Emigration",
    "Pay silver = the round: turn a knarr or longship over onto the leftmost banquet space, so you serve less food. You keep your Vikings."
   ],
   [
    "Raid, pillage, hunt",
    "Roll the die and add weapon cards (and ore on your longship) to reach a better tile. Raid and pillage need a longship; hunting wants a low roll."
   ],
   [
    "Exploration",
    "Take an island board with the ship and Vikings it needs; you keep the ship."
   ],
   [
    "Occupations",
    "Play occupation cards for their effects."
   ]
  ],
  "round": [
   "**Income**: the lowest uncovered number on your board's income diagonal.",
   "**Feast**: fill your banquet table with food; orange and red can't touch their own colour, silver can. Each empty space is a −3 penalty.",
   "**Bonus**: fully surround a bonus space on your boards and its good is yours every round.",
   "Animals breed every second round."
  ],
  "end": [
   "Ships 3/5/8, emigrated ships 18/21, islands and buildings their value, animals, occupations, silver, final income.",
   "Minus uncovered spaces on all your boards and 3 per feast penalty."
  ],
  "forget": [
   "Green goods may not touch each other side by side (corners are fine); blue, silver and ore may.",
   "Income is the smallest number still uncovered on the diagonal, so one gap holds it back.",
   "Once placed on a board, goods can't be taken back.",
   "A bonus space only pays if you leave it uncovered and cover all 8 spaces around it."
  ]
 },
 "224517": {
  "src": "the Brass: Birmingham rulebook (Roxley)",
  "goal": "Most **VP** after the Canal and Rail eras: links and flipped industries score at the end of each era.",
  "turn": [
   "In turn order, take **2 actions** (1 in the game's first round), discarding a card for each.",
   "Refill your hand to 8. Money you spend goes on your character: the least spent goes first next round."
  ],
  "actions": [
   [
    "Build",
    "A location card (anywhere there) or an industry card (in your network); pay the tile, plus coal and iron."
   ],
   [
    "Network",
    "Canal era: a canal for £3. Rail era: a rail for £5 + 1 coal, or two for £15 + 2 coal + 1 beer."
   ],
   [
    "Develop",
    "Remove 1–2 of your lowest tiles from your mat, 1 iron each."
   ],
   [
    "Sell",
    "Flip cotton, manufacturers or pottery connected to a matching merchant, paying the beer shown; merchant beer gives its bonus."
   ],
   [
    "Loan",
    "Take £30, income drops 3 levels."
   ],
   [
    "Scout",
    "Discard 3 cards to take the wild location and wild industry."
   ],
   [
    "Pass",
    "Discard without acting."
   ]
  ],
  "round": [
   "**Income**: your income level (negative: pay, selling tiles if short).",
   "Coal: the nearest connected mine (free), else the market, which needs a link to a merchant. Iron: any iron works, else the market.",
   "Beer: your own brewery anywhere, or a connected opponent's, or merchant beer when selling."
  ],
  "end": [
   "Each era ends when the deck and hands run out (8/9/10 rounds for 4/3/2 players).",
   "Links: 1 VP per link icon in their two locations; then flipped industries' VP.",
   "After the Canal era level 1 industries are removed; level 2+ stay and score again.",
   "Ties: income, then money."
  ],
  "forget": [
   "In the Canal era you may have only one industry per location.",
   "Opponents' coal mines and iron works can be overbuilt only when none of that resource is left anywhere.",
   "A brewery holds 1 beer in the Canal era, 2 in the Rail era.",
   "A loan can't take your income below −10; you can't Scout while holding a wild card."
  ]
 },
 "310873": {
  "src": "the Carnegie rulebook (Quined Games)",
  "goal": "Most **VP** after 20 rounds: projects across the US, linked cities, departments, donations and active employees.",
  "turn": [
   "The first player picks one of the four timelines: **everyone** takes that action type this round.",
   "Its space triggers an event: **income** from a region (bring employees home: transport income per employee + income from your built projects) and/or **donations**.",
   "Each player uses their departments of that type, once per active employee in each, one department at a time.",
   "End of round: pay to activate employees; the first player passes left."
  ],
  "actions": [
   [
    "Human Resources",
    "3 moves per active employee: move employees around your company (moving an active one lays it down)."
   ],
   [
    "Management",
    "Commerce: $3, a goods cube, or a mission ($6 or 2 goods). Strategic planning: build a new department (1 or 2 goods)."
   ],
   [
    "Construction",
    "Send an employee on a mission to a region, pay 1–2 goods, place a project disk from your tabs."
   ],
   [
    "R&D",
    "Study points: advance a project tab or a regional transport track."
   ]
  ],
  "round": [
   "Donations: $5, then $10, $15… each, scored at the end (max 12 VP each).",
   "3–4 players: an Action Choice tile lets you take a different action once (3 VP if unused).",
   "A transport track's last space gives a one-off reward to the first to get there."
  ],
  "end": [
   "Linking New York, Chicago, New Orleans and San Francisco: up to 36 VP, by your lowest transport level on the way.",
   "Departments 2–3 VP, active employees 1 VP, project tabs, projects by city 0–3, donations.",
   "Tied players share the win."
  ],
  "forget": [
   "Employees activate only at the end of a round, and it costs money.",
   "A department works once per active employee in it.",
   "Employees on missions are inactive until an income event brings them home.",
   "Transport income = your level in that region × employees returned."
  ]
 },
 "342942": {
  "src": "the Ark Nova rulebook (Feuerland / Capstone Games)",
  "goal": "Build a zoo and push your **Appeal** and **Conservation** counters toward each other: your score is how far they've crossed.",
  "turn": [
   "Choose one of your 5 action cards: its **strength = its slot** (1–5). Each X-token spent adds +1.",
   "Do the action, then move that card to slot 1 and slide the others right.",
   "Or take 1 X-token instead (the card still moves; max 5 X-tokens)."
  ],
  "actions": [
   [
    "Cards",
    "Advance the break 2; draw by strength (max 3), maybe discard one. Strength 5+: snap 1 card from the display instead, any reputation. Upgraded: also from the display within reputation range."
   ],
   [
    "Build",
    "One building up to size X, 2 money per space. Upgraded: several buildings totalling X, plus the reptile house and aviary."
   ],
   [
    "Animals",
    "Play animals (the card shows how many) into empty enclosures that fit (size, rock, water, conditions); pay, gain appeal and effects. Upgraded: from the display too."
   ],
   [
    "Association",
    "One task with strength ≥ its value: reputation (2), partner zoo (3), university (4), conservation project (5). Upgraded: several, plus a donation."
   ],
   [
    "Sponsors",
    "Play 1 sponsor with level ≤ X, or advance the break X and take X money. Upgraded: several sponsors, or 2X money."
   ]
  ],
  "round": [
   "**Break** when the break token reaches the end (that player gets an X-token): hand down to 3 (5 with the right university), association workers return, display refreshes, everyone takes income (appeal, kiosks, recurring effects)."
  ],
  "end": [
   "When someone's two counters reach the same scoring area at the end of their turn, everyone else takes one more turn (during a break: everyone, them included).",
   "Add final scoring cards (up to 4 conservation each) and sponsors' end-game effects.",
   "Score = the gap between your counters; highest wins."
  ],
  "forget": [
   "The further right an action card sits, the stronger it is.",
   "Each partner zoo makes its continent's animals 3 cheaper per continent icon on the card.",
   "Releasing an animal for a project loses its appeal.",
   "Only 4 upgrades a game (conservation track, reputation track, 2nd partner zoo, 2nd university): you can't upgrade every action."
  ]
 },
 "181260": {
  "src": "the Burano rulebook",
  "goal": "Most **VP** after 4 seasons (14 turns): build houses on the main island to fish, make lace and earn coins, and roof them for points.",
  "turnTitle": "Each season",
  "turn": [
   "**Pyramid**: everyone secretly stacks 14 cubes (3×3, then 2×2, then 1). Each cube left in your reserve goes back for 1 coin.",
   "**Turns** (4, 4, 3, 3 per season): up to 4 moves in any mix and order. The 1st move pays you 1 coin; the 2nd costs 3, the 3rd 3, the 4th 4.",
   "No move at all: take 1 coin instead."
  ],
  "actions": [
   [
    "Pick up a house",
    "Move a free cube (nothing on top of it) from your pyramid to your preparation area (3 spaces)."
   ],
   [
    "Build a house",
    "Put a prepared cube on the main island, touching another cube there (a corner is enough), or on a rooftop block (matching colour: +1 privilege). Then do the action its colour has this season."
   ],
   [
    "Roof houses",
    "Lay a roof tile across 2 cubes in its two colours, side by side on the same floor (never the 3rd). Take 2 privilege or a building card, then score the roof."
   ],
   [
    "Fishing",
    "Move your boat one step. To an island: 1–3 fish cards for the colours your schedule ring's arrows match there, and send workers. To a port: sell one set to a merchant ship for VP."
   ],
   [
    "Lace making",
    "Send up to 3 workers to workshop spaces in your arrows' colours, each next to your other lace workers."
   ],
   [
    "Earning",
    "1 coin per visible coin on your schedule ring, plus 1 per worker you call back home."
   ],
   [
    "Privilege",
    "1 point each: swap two dock houses before fishing, place a lace worker anywhere (bumping one), add a cube to your pyramid, or take 1 coin."
   ]
  ],
  "roundTitle": "End of a season",
  "round": [
   "Each island's majority: 4 VP (3 with 3 players, 2 with 2); ties split it.",
   "Lace: for each lace worker, return a pyramid cube matching its space for 2 VP, plus a bonus for each group of connected paid workers (2: +1 … 9: +21).",
   "Then (not after winter): action colours reshuffle, cubes and roofs refill, the start player passes left."
  ],
  "end": [
   "After winter's island and lace scoring: privilege counts as coins, every 5 coins is 1 VP.",
   "Unsold fish 1 VP each; building cards their VP.",
   "Ties: most cubes in the preparation area, then most coins."
  ],
  "forget": [
   "The action colours change every season: check the action board before you build.",
   "Your schedule ring must always keep at least one worker.",
   "Sending workers to an island bumps one worker of each other player there (they get 2 coins).",
   "Roofs only go on cubes on the same floor, never on the 3rd floor."
  ]
 },
 "102794": {
  "src": "the Caverna: The Cave Farmers rulebook (Lookout Games)",
  "goal": "Most **gold points** after 12 rounds (11 with 2 players): grow your dwarf family, furnish caverns, farm, raise animals and fill your home board.",
  "turnTitle": "Each round",
  "turn": [
   "Reveal a new action space; accumulating spaces get their goods (they pile up).",
   "In turn order, place one dwarf at a time on a free action space and do it at once. Unarmed dwarfs go first, then armed ones from the weakest weapon up.",
   "Dwarfs return home, then the harvest (if any)."
  ],
  "actions": [
   [
    "Excavation / Drift mining",
    "Take the stone; place a cavern/tunnel twin tile on 2 mountain spaces joined to your cave."
   ],
   [
    "Clearing / Sustenance / Slash-and-burn",
    "Take the goods; place a meadow/field twin tile in the forest (the first one at the cave entrance)."
   ],
   [
    "Sow",
    "Up to 2 grain fields (1 becomes 3) and 2 vegetable fields (1 becomes 2)."
   ],
   [
    "Furnish",
    "Pay for a furnishing tile and put it in an empty cavern; dwellings make room for more dwarfs."
   ],
   [
    "Family growth",
    "Only with free room in your dwellings: a new dwarf who works from next round (max 5, 6 with the Additional dwelling)."
   ],
   [
    "Fences and stables",
    "Small pasture 2 wood, large pasture 4 wood; a stable 1 stone (max 3)."
   ],
   [
    "Mines",
    "Ore mine on 2 tunnels (+3 ore); ruby mine on a tunnel (+1 ruby if it's a deep tunnel)."
   ],
   [
    "Weapons and expeditions",
    "Forge: an unarmed dwarf spends up to 8 ore for a weapon of that strength. Expedition: pick loot up to your strength, then the weapon gets +1."
   ],
   [
    "Starting player",
    "Take the token and the food there, plus 2 ore (1–3 players) or 1 ruby (4+)."
   ]
  ],
  "roundTitle": "Harvest",
  "round": [
   "**Fields**: take 1 grain or vegetable from each sown field.",
   "**Feed**: 2 food per dwarf (1 for one born this round). Each missing food is a begging marker: −3 points.",
   "**Breed**: each farm animal type with 2+ gets one baby, if you have room for it.",
   "No harvest after rounds 1, 2 and 4 (after 4: just 1 food per dwarf). From round 5, every round, unless a red ? harvest marker changes it."
  ],
  "end": [
   "+1 per animal (dogs too) and per dwarf; −2 per missing farm animal type (sheep, donkey, boar, cattle).",
   "Grain ½ (rounded up), vegetables, rubies and gold 1 each; −1 per unused home board space; −3 per begging marker.",
   "Pastures 2/4, ore mine 3, ruby mine 4, furnishing tiles their value, plus parlor, storage and chamber bonuses."
  ],
  "forget": [
   "The starting player only changes when someone takes the Starting player action.",
   "Rubies are wild: 1 for most goods, a field, meadow or tunnel; 2 for a cavern; or to play an armed dwarf out of order.",
   "Animals can't wait in your supply: house them at once or turn them into food.",
   "Food any time: grain 1, vegetable 2, sheep 1, boar 2, cattle 3, ruby 2; gold buys food at one more gold than the food.",
   "Dogs let a meadow or pasture hold one more sheep than there are dogs."
  ]
 },
 "403150": {
  "src": "the World Order rulebook",
  "goal": "Most **VP** after 6 rounds: spread Influence across the world's regions (each cube pays the VP on its slot), with region majorities scored after rounds 3 and 6.",
  "turnTitle": "Each round",
  "turn": [
   "**Preparation** (from round 2): draw 6, reveal new country cards, fewest VP picks turn order first, produce Energy, Raw Materials and Food, choose a Focus.",
   "**Actions**: in turn order, play one Ability card per turn, 4 turns each. Or place a card face down to use a Strategic Asset, or to pass for 10 Ordis.",
   "**Research** (not in round 6): discard what you played; the cards left in hand give their bonus and Research to buy Market cards onto your deck."
  ],
  "actions": [
   [
    "Improve Relations",
    "Pay Diplomacy = a country's value to ally it. Exhausting your allies in that region pays part of it."
   ],
   [
    "Engage",
    "Pay the region's Diplomacy cost (allies there discount it): +1 Influence and an Engage token."
   ],
   [
    "Trade",
    "Export by the icons on your allies (5 / 15 / 20 Ordis); import from allies or players (3 / 10). Each resource in one deal only."
   ],
   [
    "Invest",
    "Pay and exhaust a ready ally: an FDI token (money every round) and +1 Influence."
   ],
   [
    "Move",
    "5 Ordis per army moved to your zone of interest, or to a region where you have a base."
   ],
   [
    "Build a Base",
    "Exhaust a ready ally showing your flag: send armies up to its value, 5 Ordis for the base and per army, +1 Influence."
   ],
   [
    "Growth card",
    "Pay for the next level up: its VP now, its ability from the round matching its level."
   ],
   [
    "Produce",
    "Primary resources as your production shows; secondary ones up to your production, paying their inputs."
   ]
  ],
  "roundTitle": "Aftermath",
  "round": [
   "Investments: 2 Ordis × each FDI country's value. Discard Engage tokens for 5 Ordis per ally in that region.",
   "Prosperity: pay Consumer Goods to move one step, for VP and money.",
   "THREAT: in each region of your zone of interest, lose 2 VP per opponent with more armies than your defence.",
   "Rounds 3 and 6: regions with all permanent slots full score 1 VP per cube plus majority bonuses (ties: most armies). Then the money, armies-on-board and allies majorities."
  ],
  "end": [
   "At the final scoring: +2 VP per unused Strategic Asset.",
   "Ties: most first places in the final region scoring, then most Influence on the board."
  ],
  "forget": [
   "Temporary slots pay more VP, but when the row is full the leftmost cube is pushed out (and the newcomer gets no VP).",
   "A region with an empty permanent slot scores nothing for anyone.",
   "Focus: Domestic +2 Research; Diplomatic Engage 2 cheaper; Military +1 THREAT and +1 defence.",
   "USA and EU ignore each other's THREAT (NATO)."
  ]
 },
 "341169": {
  "src": "the Great Western Trail: Second Edition rulebook",
  "goal": "Most **VP**: drive your herd to Kansas City again and again (5–7 times), ship it by rail, and build, hire and collect along the trail.",
  "turn": [
   "**Move** your herder 1 up to your step limit locations forward (empty spaces don't count). Pay for the hands you pass: hazards and outlaws to the bank, others' buildings to their owner.",
   "**Act**: on a neutral building or your own, use each local action once. Anywhere else, or instead, one single auxiliary action.",
   "**Draw** back up to your hand limit (4, up to 6)."
  ],
  "actions": [
   [
    "Hire a worker",
    "Pay its row's cost (± the icon), never from the job market token's row. Cowboys buy cattle, builders build, engineers drive the train."
   ],
   [
    "Buy cattle",
    "Spend cowboys and money on market cattle (more cowboys, better deals); a spare cowboy can add 2 cards to the market."
   ],
   [
    "Build",
    "Place a private building for 2 Dollars per builder it needs, or replace one of yours paying the difference."
   ],
   [
    "Move the engine",
    "Up to 1 space per engineer; stop at a station to upgrade it (disc, VP) and you may make one of your workers its station master for the tile."
   ],
   [
    "Objective card",
    "Take one to your discard pile; play it from hand for its bonus. Met at the end: VP; missed: the minus."
   ],
   [
    "Hazards and outlaws",
    "Remove a hazard (VP at the end) or collect an outlaw's bounty."
   ],
   [
    "Auxiliary actions",
    "1 Dollar, draw and discard, engine forward, or engine back for certificates or to trim your deck. Unlocked as you clear discs."
   ]
  ],
  "roundTitle": "In Kansas City",
  "round": [
   "Take 3 foresight tiles: workers go to the job market, hazards and outlaws onto the trail.",
   "**Income**: the breeding value of each **different** cattle type in hand, plus any certificates. Take that many Dollars.",
   "**Delivery**: a disc on a city worth no more than that (no repeats, except Kansas City and New York). Pay 1 Dollar per cross if your engine is behind it.",
   "Back to the start of the trail; refill the foresight spaces."
  ],
  "end": [
   "When the last job market space fills, everyone else takes one final turn.",
   "1 VP per 5 Dollars; buildings, cities, stations, hazards, cattle cards, objectives (minus the missed ones), station masters.",
   "4 VP per worker on a 5th or 6th space; 3 for clearing the step-limit disc marked with VP; 2 for the job market token. Ties share."
  ],
  "forget": [
   "Each cattle type counts once at income: variety beats duplicates.",
   "Discs from dark-cornered spaces only go on dark-cornered cities and stations.",
   "Delivering to Kansas City pays 4 Dollars but costs 6 VP at the end.",
   "A cattle cost with a red arrow means those exact cards from your hand."
  ]
 },
 "12333": {
  "src": "the Twilight Struggle rulebook (GMT Games)",
  "goal": "Pull the VP track your way: plus for the US, minus for the USSR. **20 VP**, controlling Europe when it's scored, or your opponent starting nuclear war wins at once.",
  "turnTitle": "Each turn",
  "turn": [
   "DEFCON improves by 1 (if below 5); deal up to 8 cards (9 from turn 4).",
   "**Headline**: both secretly pick a card for its event; the higher Ops goes first (ties: US).",
   "**Action rounds**: 6 (7 from turn 4), USSR first. You must play a card every round, for its event or its Ops.",
   "10 turns in all."
  ],
  "actions": [
   [
    "Event",
    "Do the card's text. Play your opponent's event for Ops and it still happens; you choose before or after."
   ],
   [
    "Place influence",
    "1 Op per marker, 2 into an enemy-controlled country; only in or next to countries where you had influence at the start of the round."
   ],
   [
    "Realign",
    "1 Op per roll; both roll, +1 per adjacent controlled country, for more influence there, and for an adjacent superpower. The winner removes the difference."
   ],
   [
    "Coup",
    "Roll + Ops against twice the stability: remove enemy influence by the excess, then add yours. Counts as military ops; in a battleground it lowers DEFCON."
   ],
   [
    "Space race",
    "Once per turn, a card with Ops ≥ the box: roll to advance for VP or abilities."
   ],
   [
    "China Card",
    "An extra card: +1 Ops if all spent in Asia, then it passes face down to your opponent."
   ]
  ],
  "roundTitle": "End of a turn",
  "round": [
   "Military ops: each player needs at least the DEFCON number; the opponent gains 1 VP per point short.",
   "Usually one card stays in hand for next turn; a scoring card can never be held.",
   "Mid War cards join at turn 4, Late War at turn 8."
  ],
  "end": [
   "After turn 10, score every region as if its card were played; most VP wins (zero is a draw).",
   "Regions: presence, domination or control, +1 per battleground controlled and per country next to the enemy superpower."
  ],
  "forget": [
   "Control = influence at least the stability **and** at least the stability more than your opponent's.",
   "DEFCON 4: no coups or realignments in Europe; 3: Asia too; 2: the Middle East too. Whoever takes it to 1 loses.",
   "Starred (*) events leave the game once played.",
   "The China Card can't be a headline."
  ]
 },
 "247763": {
  "src": "the Underwater Cities rulebook (Delicious Games)",
  "goal": "Most **points** after 10 rounds and 3 Productions: build cities, tunnels and buildings, connect them, and keep your people fed.",
  "turn": [
   "Each round everyone takes 3 turns, in play order.",
   "Put an action tile on a free action slot and play 1 card. Same colour: also use the card (before or after the action). Different: just the action.",
   "End of your turn: draw 1 card. Start each turn with 3 (discard down)."
  ],
  "actions": [
   [
    "Colours",
    "Green cards are strongest but match the weakest slots; yellow cards are weakest but match the strongest; red in between. The colourless slot is always open: 2 cards and 2 credits."
   ],
   [
    "Build a city",
    "Next to an existing city: 2 steelplast, 1 kelp, 1 credit. Symbiotic cities need biomatter but make 2 points each Production."
   ],
   [
    "Build a tunnel",
    "1 steelplast + 1 credit, always joined to your network."
   ],
   [
    "Build a building",
    "Farm 1 kelp, desalination plant 1 credit, laboratory 1 steelplast; next to a city or city site."
   ],
   [
    "Upgrade",
    "Usually 1 science: upgraded structures produce more."
   ],
   [
    "Claim cards",
    "Matching permanent, action, production and end-scoring cards stay. Max 4 action cards (the Personal Assistant counts), each once per era."
   ],
   [
    "Biomatter",
    "Can replace kelp or steelplast when building."
   ]
  ],
  "round": [
   "Action tiles come back; next round's order follows the Federation track (furthest ahead first).",
   "Production after rounds 4, 7 and 10: tunnels next to cities, connected buildings and symbiotic cities produce, then production cards and metropolises.",
   "Then feed 1 kelp per connected city; short: 1 biomatter, then 3 points per unfed city.",
   "New era: draw 3 new cards, keep 3 in all; action cards are ready again."
  ],
  "end": [
   "Your connected metropolis and end-scoring cards.",
   "Each connected city: 2 points, or 3 / 4 / 6 with 1 / 2 / 3 building types next to it.",
   "Biomatter sells for 2 credits; every 4 credits, kelp, science or steelplast is 1 point. Ties: the final play order."
  ],
  "forget": [
   "Disconnected cities and buildings don't produce, don't eat and don't score.",
   "A tunnel only produces next to a city.",
   "Moving up the Federation track is how you go first next round."
  ]
 }
};
