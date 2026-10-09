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
 },
 "216132": {
  "src": "the Clans of Caledonia rulebook (Karma Games)",
  "goal": "Most **VP** after 5 rounds: spread your clan over Scotland, produce and process goods, trade at the market and fulfil export contracts.",
  "turnTitle": "Each round",
  "turn": [
   "**Preparation** (from round 2): refill the export board, take your merchants back.",
   "**Actions**: one action per turn, in turn order, until everyone has passed. Every action except Pass can be repeated.",
   "**Production**, then **scoring** by this round's scoring tile."
  ],
  "actions": [
   [
    "Trade",
    "Send merchants to the market, one per good: buy or sell one type at its price, then the price moves that many steps. Never buy and sell the same good in a round."
   ],
   [
    "Export contract",
    "Pay this round's cost (in round 1 you get £5 instead). Only one unfulfilled contract at a time."
   ],
   [
    "Expand",
    "Place a unit next to yours or within shipping reach, paying for the unit and the land. Next to an opponent: buy their good at a discount (max 3)."
   ],
   [
    "Shipping",
    "£4 per level: cross rivers, then one more loch per level."
   ],
   [
    "Technology",
    "£10: that worker type earns £2 more each production."
   ],
   [
    "Hire a merchant",
    "£4 for one more merchant."
   ],
   [
    "Fulfil a contract",
    "Pay its goods (meat by slaughtering a cow or sheep) for its imports and bonuses: money, a free land space, an upgrade."
   ],
   [
    "Pass",
    "Take the pass money; the order you pass in is next round's turn order."
   ]
  ],
  "round": [
   "Woodcutters £4, miners £6 (+£2 upgraded); sheep 1 wool, cows 1 milk, fields 2 grain.",
   "Then you may process: dairy milk → cheese, bakery grain → bread, distillery grain → whisky.",
   "Glory for the round's scoring tile."
  ],
  "end": [
   "Glory; basic goods 1 VP, processed goods 2; £10 = 1 VP; hops 1 each.",
   "Cotton, tobacco and sugar cane: 3 / 4 / 5 VP each, the least imported overall worth the most.",
   "Most fulfilled contracts 12 / 6 VP; most settlements within shipping reach 18 / 12 / 6. Ties: leftover money."
  ],
  "forget": [
   "Grassland takes animals, fields and buildings; forest only woodcutters; mountains only miners.",
   "Port bonuses within reach are free extras, each once per game.",
   "Settlements are separate clusters of your units: several small ones beat one big one.",
   "Contracts never ask for grain or milk."
  ]
 },
 "350458": {
  "src": "the Terracotta Army rulebook",
  "goal": "Most **VP** after 5 rounds: sculpt warriors and specialists for the emperor's mausoleum and win majorities in its rows, columns, quarters and groups.",
  "turn": [
   "In turn order, place one worker at a time on the action wheel until everyone's are used.",
   "First you may pay 2 coins to turn the inner ring (clockwise) or the middle ring (counterclockwise) one step.",
   "An empty segment takes any worker; next to a craftsman only an artisan fits; nobody joins an artisan.",
   "Do the segment's actions from the inner ring out. Instead of an inner or middle action you may take 1 wet clay or 1 coin."
  ],
  "actions": [
   [
    "Coins / clay",
    "Take 2–4 coins or 2–4 wet clay."
   ],
   [
    "Make a warrior",
    "Pay 2–4 wet clay (one goes dry to the nearby warehouse), place it anywhere in the mausoleum, score its row on the organiser. You may then spend its weapon for its ability."
   ],
   [
    "Warrior abilities",
    "Officer (sword) 1 VP + move an inspector 1; Guard (halberd) 3 VP + slide one of your warriors; Crossbowman (crossbow) 1 VP per empty space to a statue in line; Soldier (spear) 1 VP + 2 coins."
   ],
   [
    "Soak the clay",
    "Turn all your dry clay wet."
   ],
   [
    "Upgrade",
    "The craftsman you used becomes an artisan."
   ],
   [
    "Master",
    "Buy it once (the coins on your token), then use its ability every time."
   ],
   [
    "Priority",
    "Take the top priority token: you go earlier next round."
   ],
   [
    "Outer ring",
    "Ready that weapon, or buy a specialist with coins and its weapon."
   ]
  ],
  "round": [
   "Inspectors: your warriors in the inspector's row, then column: dominance 7 VP, presence 3. Then each inspector moves on.",
   "Musicians: 1 VP per warrior of yours in their row or column.",
   "This round's scoring tile: dominance and presence.",
   "Cleanup: priority tokens set the turn order, **all wet clay dries**, masters pay 1 coin (or keep 1 clay wet), the rings turn."
  ],
  "end": [
   "Footmen: most warriors in the 8 spaces around: 8 VP, presence 2.",
   "Warriors outside a group (2+ of one type touching) are removed. In each group every warrior is worth 1 VP per player in it; with 2+ players, dominance 5 / presence 2.",
   "Kneeling archers: 2 VP to the owner of the warrior they face. 1 VP per 2 clay and coins. Ties: turn order."
  ],
  "forget": [
   "Dominance means most **alone**: a tie gives nobody dominance, only presence.",
   "A kneeling archer breaks ties for the warrior it faces.",
   "Wet clay dries every round: spend it, protect it, or soak it again.",
   "A specialist needs its weapon ready, and spends it."
  ]
 },
 "300322": {
  "src": "the Hallertau rulebook (Lookout Games)",
  "goal": "Most **VP** after 6 rounds: deliver goods to move your village's craft buildings and community centre, raise sheep, rotate fields and play cards.",
  "turnTitle": "Each round",
  "turn": [
   "Remove the top row of workers from the action spaces (1–3 players: only in the quadrant(s) on the quadrant card).",
   "New workers: the number in your community centre's window. Sheep on this round's farmyard card die.",
   "Income from your played bonus cards (not round 1).",
   "**Actions**: in turn order, place workers on a space or swap workers for tools, until all are used.",
   "Then: new card, fallow fields, harvest, milking, **progress**, boulders."
  ],
  "actions": [
   [
    "Placing workers",
    "Bottom row 1 worker, middle row 2, top row 3; a full space is closed. Take each of its actions once, all optional."
   ],
   [
    "Card spaces",
    "The corners: draw from that deck and take the first player marker."
   ],
   [
    "Sow",
    "Move crops from your '1' supply onto empty fields; the field's row (2–5) is what it yields."
   ],
   [
    "Sheep",
    "Breed (2 milk = 1 sheep, 4 = 2), shear (1 wool per sheep), butcher (1 sheep = 4 meat + 2 hides). Shearing and Small Trade also move 1 sheep a card on."
   ],
   [
    "Tools",
    "Instead of placing, swap any number of workers for tools."
   ],
   [
    "Cards",
    "Play any time, even on others' turns: meet the book's condition or pay the arrow's cost."
   ]
  ],
  "round": [
   "**Fallow**: every empty field moves up a row, then one of them moves up again.",
   "**Harvest**: each planted field yields its row's amount, then drops a row. **Milking**: 1 milk per sheep.",
   "**Progress**: move a craft building one space right for goods equal to the round number (or 1 jewelry). The community centre follows once all have moved: more workers, later VP.",
   "Each tool moves a boulder 1 space; tools only break (are spent) in round 6."
  ],
  "end": [
   "Community centre VP (18 / 34 / 50 / 70) plus 3 per '3 VP' symbol left of a craft building.",
   "Sheep in the stables and jewelry 1 VP each; fields (their row), goods and tools: 1 VP per 5.",
   "VP on your played bonus and point cards. Ties: the remainder of the 1-per-5 category."
  ],
  "forget": [
   "Sheep die three rounds on unless moved along; in the stables they're safe.",
   "You can never discard resources by choice.",
   "Carpentry needs more clay than rye, the brewhouse more barley than hops, the bakehouse at most 1 flax.",
   "From round 3, paying different types of goods makes progress cheaper.",
   "The first player only changes when someone uses a card space."
  ]
 },
 "2651": {
  "src": "the Power Grid rulebook (2F-Spiele)",
  "goal": "Be able to **power the most cities** when the game ends: buy power plants, buy fuel and grow your network.",
  "turnTitle": "Each round",
  "turn": [
   "**Player order**: most cities first (tie: biggest power plant).",
   "**Auction**, in order: put a plant from the current market up for auction or pass. At most 1 plant each per round; in round 1 everyone must buy one.",
   "**Resources**, in reverse order: buy fuel your plants can use, up to twice what each burns.",
   "**Build**, in reverse order: pay connections plus 10 / 15 / 20 to add cities to your network.",
   "**Bureaucracy**: power cities for money, refill the resource market, update the plant market."
  ],
  "actions": [
   [
    "Bidding",
    "Open at least at the plant's number (the discounted smallest one: 1). Once you pass you're out of that auction."
   ],
   [
    "Plants",
    "Max 3; a 4th scraps one. A plant burns exactly the fuel shown and powers the cities on it. Green plants need no fuel."
   ],
   [
    "Hybrid plants",
    "Coal and oil in any mix."
   ],
   [
    "First city",
    "Any empty city in the play area, for 10."
   ],
   [
    "More cities",
    "The cheapest route from your network plus the city's next free space. You may pass through cities."
   ]
  ],
  "roundTitle": "Steps",
  "round": [
   "**Step 1**: one house per city. In Steps 1 and 2, each round the biggest future-market plant goes under the deck.",
   "**Step 2** starts once someone has 7 cities (6 with 6 players): two houses per city; the smallest plant leaves once.",
   "**Step 3** starts when its card is drawn: three houses per city, all 6 plants on sale, the smallest leaves each round."
  ],
  "end": [
   "Ends after building, once someone has 17 cities (18 with 2, 15 with 5, 14 with 6).",
   "Then whoever can power the most cities wins; tie: most money."
  ],
  "forget": [
   "Resources and building go in reverse order: the leader pays more and builds last.",
   "Powering no cities still pays 10.",
   "Most cities isn't enough: you must be able to power them at the end."
  ]
 },
 "304783": {
  "src": "the Hadrian's Wall rulebook (Garphill Games)",
  "goal": "Most **VP** after 6 years: build up your fort and its town on your sheets, raise your four attributes and fulfil your 6 Path cards, while holding off the Picts.",
  "turnTitle": "Each year",
  "turn": [
   "Reveal a Fate card: everyone takes its workers and resources.",
   "Draw 2 player cards: keep one as a Path card (end goal), the other as a Prospect card (its bonus, trade good and scouting pattern).",
   "Gain from your sheets: resource production, hotel (civilians), workshop (builders), road (attributes).",
   "Everyone acts at once, spending workers and resources to fill boxes, until done. Leftovers are lost."
  ],
  "actions": [
   [
    "Tracks",
    "Fill left to right; a box with icons gives you them. A # box takes the year number (limited each year)."
   ],
   [
    "Cohorts",
    "Each cohort icon you fill adds a box to one cohort: your defence."
   ],
   [
    "Fort, cippi, wall",
    "Fort: 1 builder or soldier (raises infrastructure). Cippi and wall: 1 resource each, only where the fort is built."
   ],
   [
    "Granaries",
    "Medium and large granaries open the middle and right columns of the left sheet."
   ],
   [
    "Wall guard / training",
    "1 soldier per wall guard box; training turns 1 builder into a soldier once a year."
   ],
   [
    "Citizens",
    "1 civilian per box on a citizen track; they open the right sheet's buildings (market, theatre, temples, baths…)."
   ],
   [
    "Forum",
    "Once a year swap 2 workers for 1 of another type (no soldiers)."
   ],
   [
    "Market and scouts",
    "Buy a trade good (1 resource) or scout a pattern (1 soldier) from your or a neighbour's prospect card; a neighbour gets the payment."
   ]
  ],
  "roundTitle": "End of a year",
  "round": [
   "The Picts attack: reveal Fate cards (more each year). Each cohort needs at least as many filled boxes as arrows against it.",
   "All held: Valour equal to the year's grey flag. Each attack through: 1 Disdain (up to the flag), the rest as Valour.",
   "Favour cancels attack cards: from temples any card, from a diplomat only for its cohort."
  ],
  "end": [
   "After year 6's attack: total the scoring column on your sheet (attributes and path cards, minus Disdain).",
   "Ties: least Disdain, then most from path cards."
  ],
  "forget": [
   "Path cards score 1–3 VP each for how far you got.",
   "The baths remove Disdain (2 bribes a year).",
   "Attributes past 25 are wasted.",
   "Workers gained from Valour carry over to next year."
  ]
 },
 "316554": {
  "src": "the Dune: Imperium rulebook (Dire Wolf)",
  "goal": "Most **VP** when the game ends: at the end of a round in which someone has 10+, or when the conflict deck runs out. Win conflicts, gain influence and alliances, build your deck.",
  "turnTitle": "Each round",
  "turn": [
   "Reveal a conflict card; everyone draws 5.",
   "In turn order, take **Agent turns** until you choose (or have) to take your **Reveal turn**.",
   "**Combat**, then **Makers**: 1 bonus spice on each maker space without an agent.",
   "**Recall** your agents; the first player passes left."
  ],
  "actions": [
   [
    "Agent turn",
    "Play a card to send an agent to a free space with a matching icon. Pay its cost; get the space's effects and the card's agent box."
   ],
   [
    "Faction spaces",
    "+1 influence. At 2: 1 VP (lost if you drop). At 4: the bonus, and the first there takes the alliance (+1 VP) until someone passes them."
   ],
   [
    "Combat spaces",
    "Deploy the troops you recruit this turn plus up to 2 from your garrison."
   ],
   [
    "Reveal turn",
    "Reveal the rest of your hand: persuasion buys cards (to your discard pile), swords add strength."
   ],
   [
    "Key spaces",
    "High Council 5 Solari (+2 persuasion every reveal); Swordmaster 8 Solari (a 3rd agent); Mentat 2 Solari (an extra agent this round)."
   ],
   [
    "Intrigue",
    "Plot cards on your turns, combat cards in combat, endgame cards at the end."
   ]
  ],
  "roundTitle": "Combat",
  "round": [
   "Strength: 2 per troop in the conflict + 1 per sword. No troops there = 0 strength.",
   "Highest takes the first reward, second the second (third too with 4 players).",
   "Tie for first: no winner, the tied players take the second reward. Tie for second: the third.",
   "Troops in the conflict return to your supply, not your garrison."
  ],
  "end": [
   "Play endgame intrigues; most VP wins.",
   "Ties: spice, then Solari, water, garrisoned troops."
  ],
  "forget": [
   "One agent per space, and one card sends one agent.",
   "Waiting to reveal (and to commit troops) keeps your strength hidden.",
   "Unspent persuasion is lost after your reveal.",
   "Sietch Tabr needs 2 Fremen influence."
  ]
 },
 "227935": {
  "src": "the Wonderland's War rulebook (Druid City Games)",
  "goal": "Most points after 3 rounds (castles, quests and VP). Each round is a **Tea Party** to gather allies and supporters, then a **War** fought region by region with chips drawn from your bag.",
  "turnTitle": "Tea Party",
  "turn": [
   "Move your leader clockwise to any free chair with a card and take its rewards; its supporters go into one region.",
   "Reaching the Head of the Table: stop, roll the shard die and take the shards, refill the empty chairs, then move on (once per turn).",
   "With 4 cards (5 with 2 players), put your leader into a region instead. When all leaders are out, the tea party ends.",
   "Then everyone adds 1 Madness to their bag; whoever has the most shards adds another and discards half their shards."
  ],
  "actions": [
   [
    "Card rewards",
    "Units into one region, ally chips into your bag, Wonderlandians, faction abilities, castles, leader strength, quests, discarding madness or shards."
   ],
   [
    "Split cards",
    "Take the top or the bottom half (the supporters and the shard die always count)."
   ],
   [
    "Battle draw",
    "In each region where you have units, everyone draws a chip at once and adds its strength. Start with your leader, Wonderlandian figures and +2 for a castle."
   ],
   [
    "Madness",
    "No strength, and you lose the units shown (a shield can block it). No units left = bust: strength 0, active chips exhausted."
   ],
   [
    "Halt",
    "After the first draw you may stop at any time; stopping on a Forge symbol lets you forge."
   ],
   [
    "Forge",
    "Put an active chip on a forge track for its reward; a finished track gives your artifact chip."
   ],
   [
    "Wager",
    "Not in a battle? Bet on the winner: right = a weak ally chip, wrong = a shard."
   ]
  ],
  "roundTitle": "End of a battle",
  "round": [
   "A battle ends when everyone has halted or bust, someone reaches 25, or the only one still drawing is in the lead.",
   "Highest strength takes the region's award for this round and builds a castle; second gets half. Tied for first: each picks the award or a castle.",
   "Then quests (one feat per battle), abilities, forging and wagers; active chips go to your exhausted area.",
   "When your 4th madness space fills, your madness and exhausted chips go back into the bag."
  ],
  "end": [
   "After round 3's war: your VP, plus 3–6 per castle (by your forge track).",
   "Quests: the feat 3, the objective 3, both 9.",
   "−1 per shard. Ties: fewest shards, then most units on the board."
  ],
  "forget": [
   "No peeking into your bag during the war.",
   "Supporters add no strength: they're your lives in battle.",
   "Shields only flip back when you bust (or a card says so), not at the end of a round.",
   "An uncontested region: take its award or a castle, no drawing (except with 2 players)."
  ]
 },
 "256916": {
  "src": "the Concordia Venus rulebook (PD-Verlag)",
  "goal": "Most VP at the end, scored by the gods on your personality cards: build houses across the empire, produce and trade goods, buy more cards.",
  "turn": [
   "Play one personality card from your hand and do its action.",
   "The Tribune brings your played cards back to your hand.",
   "Team play: you play a card, then your partner does its action as well."
  ],
  "actions": [
   [
    "Tribune",
    "Take back your played cards (+1 sestertius per card beyond 3); you may buy a colonist for 1 food + 1 tool."
   ],
   [
    "Architect",
    "Move colonists (steps = your colonists on the board), then build next to them: goods (1 food in a brick city, else 1 brick + that city's good) and 1–5 coins by city type × the houses there after building."
   ],
   [
    "Prefect",
    "A province showing its good produces: you take the bonus good and every house there produces for its owner. Or take 1 sestertius per coin showing and flip them all back."
   ],
   [
    "Mercator",
    "3 sestertii (5 if bought), then trade up to two types of goods at the storehouse prices."
   ],
   [
    "Diplomat",
    "Copy the top card of an opponent's discard pile."
   ],
   [
    "Magister",
    "Repeat your previous card (not a Senator)."
   ],
   [
    "Colonist",
    "New colonists (1 food + 1 tool each) in Rome or a city with your house; or 5 sestertii + 1 per colonist on the board."
   ],
   [
    "Specialists",
    "Each of your houses of that good produces 1."
   ],
   [
    "Senator / Consul",
    "Buy up to 2 cards (card cost + display cost), or 1 card for its card cost only."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Your storehouse has 12 spaces for colonists and goods; you can't throw goods away to make room.",
   "The Praefectus Magnus doubles a Prefect's province bonus, then passes to the right.",
   "One house of yours per city at most, never in Rome."
  ],
  "end": [
   "Buying the last card or building your 15th house: the Concordia card (+7 VP); everyone else takes one last turn.",
   "Each card scores for its god: Vesta 1 per 10 sestertii (goods at their price), Jupiter 1 per house outside brick cities, Saturnus 1 per province, Venus 2 per province with 2+ houses, Mercurius 2 per good you produce, Mars 2 per colonist, Minerva per its card.",
   "Ties: whoever holds (or gets next) the Praefectus Magnus."
  ],
  "forget": [
   "A house's coins multiply by the houses in that city after you build.",
   "A Prefect's province must show its goods side to produce.",
   "Team play Venus: 1 per province where both partners have a house."
  ]
 },
 "286749": {
  "src": "the Hansa Teutonica rulebook (Argentum Verlag)",
  "goal": "Most prestige points: claim trade routes, open offices in cities and improve your skills.",
  "turn": [
   "Take as many actions as your Actions skill (2–5), in any order, repeats allowed."
  ],
  "actions": [
   [
    "Take pieces",
    "Move traders or merchants from stock to your supply, up to your Money skill (3, 5, 7, all)."
   ],
   [
    "Place",
    "Put one from your supply on any free space on a route."
   ],
   [
    "Displace",
    "Replace an opponent's piece, paying 1 extra to stock (2 for a merchant). They re-place it plus 1 (2) more from stock on an adjacent route."
   ],
   [
    "Move",
    "Rearrange up to your Book of Lore number of your pieces on the routes."
   ],
   [
    "Claim a route",
    "All its spaces are yours: offices next to it give their controller 1 prestige; take its bonus marker; then open an office in an adjacent city, raise a skill (in its city), or put a merchant in Coellen."
   ]
  ],
  "roundTitle": "Claiming",
  "round": [
   "Offices: leftmost free space only; square spaces need a trader, round ones a merchant; the colour needs your Privilege level.",
   "Controlling a city = most offices there (tie: the rightmost).",
   "First to link Arnheim and Stendal with offices: 7 prestige (then 4, 2).",
   "Each bonus marker taken puts a new one out at the end of the turn; use yours later as free actions."
  ],
  "end": [
   "Ends at once when someone reaches 20 prestige, a bonus marker can't be replaced, or 10 cities are completed.",
   "+4 per maxed skill (not keys); bonus markers 1 / 3 / 6 / 10 / 15 / 21; Coellen merchants; 2 per controlled city.",
   "Town Keys level × the offices in your largest connected network. Ties share."
  ],
  "forget": [
   "Claiming is an action: a full route isn't claimed automatically.",
   "A displaced player places extra pieces for free.",
   "A new skill level counts immediately."
  ]
 },
 "312484": {
  "src": "the Lost Ruins of Arnak rulebook (Czech Games Edition)",
  "goal": "Most points after 5 rounds: dig at sites, discover new ones, overcome guardians, buy items and artifacts, and research toward the Lost Temple.",
  "turnTitle": "Each round",
  "turn": [
   "Everyone draws up to 5 cards.",
   "In turn order, take **one main action** a turn, plus any number of free actions (⚡).",
   "Pass when you're done; the others carry on until all have passed.",
   "Archaeologists come home (a guardian on their site = a Fear card); your play area goes to the bottom of your deck; the start player passes left; the moon staff moves."
  ],
  "actions": [
   [
    "Dig",
    "Send an archaeologist to a free site, paying its travel cost with cards' travel icons; take its reward."
   ],
   [
    "Discover",
    "Pay compasses and travel to a new I or II site: take the idol, reveal the site and its reward, and wake a guardian there."
   ],
   [
    "Overcome a guardian",
    "With your archaeologist there, pay its cost: 5 points and a one-time boon."
   ],
   [
    "Buy",
    "Items for coins (to the bottom of your deck); artifacts for compasses (to your play area, used free right away)."
   ],
   [
    "Play a card",
    "For its effect; artifacts played from hand cost their tablet."
   ],
   [
    "Research",
    "Move your magnifying glass or notebook up a row, paying the bridge; the notebook never goes above the glass."
   ],
   [
    "Travel",
    "A plane pays anything (2 coins buys one); car and boat don't swap; anything pays a boot."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "A card is played for its travel icon or its effect, never both.",
   "Idol slots: put an idol in for a one-time bonus (free action); empty slots score at the end.",
   "Assistants come from notebook rows: once per round each, upgraded to gold later.",
   "Lost Temple: the earlier your glass arrives the more it scores; later research there buys temple tiles."
  ],
  "end": [
   "Research tokens by row, temple tiles, idols 3 each plus empty-slot points, guardians 5, cards' points.",
   "Fear cards −1 each (fear tiles −2).",
   "Ties: first to the Lost Temple, then research score."
  ],
  "forget": [
   "Guardians don't stop digging, but coming home from their site costs a Fear card.",
   "Items go to the bottom of your deck: you'll see them next round.",
   "Exiling (trash icon) thins your deck."
  ]
 },
 "284653": {
  "src": "the Mind MGMT rulebook (Off the Page Games)",
  "goal": "One player is the **Recruiter**, moving secretly across the city; everyone else plays the **Rogue Agents**. The Recruiter wins with 12 recruits (9 in the training mission) or by reaching 16:00 (14:00); the agents win by capturing them.",
  "turnTitle": "Each round",
  "turn": [
   "Recruiter: 1 action, then advance the time token.",
   "Agents: activate any 2 agents.",
   "Recruiter: 1 action, advance time, and at the alert reveal how many recruits this round.",
   "Agents: activate the other 2, then stand them all up."
  ],
  "actions": [
   [
    "Recruiter: Step",
    "Move orthogonally to a never-visited location and write the next number on your secret map. Temples allow diagonals."
   ],
   [
    "Recruiter: Mind Slip",
    "Your card's special jump; jumped-over spaces don't count. Its token goes on the time track."
   ],
   [
    "Recruiting",
    "Each circled feature you visit that matches one of your 3 secret feature cards is a recruit, revealed only at the alert."
   ],
   [
    "Immortals (full game)",
    "Move one a turn, any direction. Two on features of their open card = a recruit. Agents can't Ask, Reveal or Capture with one there."
   ],
   [
    "Agent: Ask",
    "Name a feature here: if visited, the Recruiter puts a step token on one such location."
   ],
   [
    "Agent: Reveal",
    "On a step token: the Recruiter says when they were there (a confirmed note)."
   ],
   [
    "Agent: Shakedown (full game)",
    "With an Immortal: guess one of the Recruiter's features, and push the Immortal."
   ],
   [
    "Agent: Capture",
    "If the Recruiter is here right now, the agents win."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Each agent moves up to 2 orthogonal steps and takes 1 action (not mid-move).",
   "The agents may only keep notes with mental note tokens (max 15).",
   "Asked about a feature, the Recruiter reveals only one location."
  ],
  "end": [
   "Agents win on a capture, or if the Recruiter has no legal move.",
   "The Recruiter wins at 12 recruits (training: 9) or when time reaches 16:00 (training: 14:00); agents get no turn at the final time."
  ],
  "forget": [
   "The Recruiter can never revisit a location.",
   "Mayhem blocks orthogonal moves (Mind Slips jump over it).",
   "Recruits are only announced at the alert, as one total for the round."
  ]
 },
 "231581": {
  "src": "the AuZtralia rulebook (SchilMil Games)",
  "goal": "Most VP: build railways, mine, farm and fight the Old Ones waking in the outback. The Old Ones score too, and can win.",
  "turn": [
   "Whoever is furthest back on the time track acts (tie: the top disc).",
   "Put a cube from your HQ in an action box, do it, and move your disc forward by its time cost. A box you've used costs 1 gold per cube already in it.",
   "When every player is past the Old Ones' purple disc, it moves 1: a revelation on an illuminated space, then 2 Old One cards for movement."
  ],
  "actions": [
   [
    "Build railway",
    "1 coal + 1 iron: 2 tracks joined to your network (2 time; 3 if any go into hills)."
   ],
   [
    "Mine",
    "Take all of one resource from a hex on your clear rail line; phosphate also gives 1 gold."
   ],
   [
    "Farm",
    "Up to 3 different farms on matching empty hexes by your rail: 1 gold and 1 time each."
   ],
   [
    "Buy military",
    "One unit for gold (or 1–2 infantry at 1 gold each)."
   ],
   [
    "Recruit help",
    "Take a personality card (or pay 1 gold to choose from the top 2 of the deck)."
   ],
   [
    "Import / export",
    "Two of: take a coal or iron; sell a coal or iron for 1 gold."
   ],
   [
    "Attack",
    "Send units against an Old One hex in range of your rail. Time = the number of different ground unit types (min 1)."
   ],
   [
    "Retrieve cubes",
    "All your cubes back (2 time if none were left)."
   ]
  ],
  "roundTitle": "Combat",
  "round": [
   "Draw Old One cards: your unit types shown on the left deal damage; take the damage, airship damage and sanity loss on the right.",
   "3 sanity per combat: losing one with none left, or losing all your units, is defeat.",
   "Before each card you may withdraw your airships, your ground units, or both.",
   "Kill it alone and keep the tile; shared kills split its VP. Defending your port: everything fights, no withdrawing, and losing the port ends the game."
  ],
  "end": [
   "Ends when all discs (the Old Ones' too) reach 53, or someone loses their port.",
   "Players: unblighted farms 2, phosphate 3, personalities, Old One tiles and VP tokens.",
   "Old Ones: revealed tiles still on the board their value, hidden ones double, blighted farms 1. A tie with the Old Ones goes to them."
  ],
  "forget": [
   "Rail through an Old One's hex is cut until it's gone.",
   "Old Ones head for the nearest port or farm; a farm they reach is blighted.",
   "Leftover gold and resources score nothing."
  ]
 },
 "331106": {
  "src": "the Witcher: Old World rulebook (Go On Board)",
  "goal": "First to **4 trophies** wins at once: defeat monsters (the main way), beat other witchers you attack, or meditate once an attribute reaches 5.",
  "turn": [
   "**Move and act**: discard cards to move (matching terrain; any 2 cards, or 1 card + 1 gold, for any terrain). At each stop: the location action once, dice poker, quests. You must move before acting.",
   "**Fight, meditate or explore** (one of them): fight a monster or witcher here, take an attribute-5 trophy, or draw a City or Wilds card.",
   "**Draw**: discard any cards, draw up to 3, then you must take 1 card from the row, paying its cost by discarding (rightmost 1 cheaper, two leftmost 1 dearer)."
  ],
  "actions": [
   [
    "Dice poker",
    "With a witcher here who has gold: 1 gold each + 1 from the bank; roll 5 dice, each may reroll once (other player first). Best hand wins the pot."
   ],
   [
    "Fight setup",
    "Your deck and discards become your life pool; you keep your hand. Life runs out and your hand is empty = knocked out."
   ],
   [
    "Your fight turn",
    "Potions (up to your Alchemy, per fight), specialties, then play a combo: each card must match a colour extension of the one below. Deal its damage, raise your shield, then draw cards = your Combat."
   ],
   [
    "Monster's turn",
    "The player on your right runs it; players take turns choosing charge or bite and reveal its top card. A trail token lets you strike first."
   ],
   [
    "Damage to a witcher",
    "Comes off your shield first, then your deck, then your hand."
   ],
   [
    "Explore",
    "The player on your right reads the card; you pick an option before hearing any result. Quests send you to a location later."
   ]
  ],
  "roundTitle": "After a fight",
  "round": [
   "Monster defeated: its card, 2 gold, a trophy and fatigue; a stronger monster spawns.",
   "Knocked out with the monster at 0–1 life: drive it away (2 gold, a 0-cost card). Otherwise a trail token and a 0-cost card, and only 2 cards in phase III.",
   "Witcher fight: the attacker who wins takes a trophy (one per school) and gold; the loser takes a 0-cost card. Spectators may wager 1 gold.",
   "Fatigue: trash cards equal to your fatigue value. Everyone reshuffles and resets their shield to Defense."
  ],
  "end": [
   "Reaching the last trophy space wins immediately.",
   "A meditation can never give the final trophy."
  ],
  "forget": [
   "No witcher fights on a school location or where the Closed Tavern token is.",
   "You can't fight a witcher you played dice poker with this turn.",
   "Hand limit 7; at most 4 potions held."
  ]
 },
 "424981": {
  "src": "the Eternal Decks rulebook",
  "goal": "**Co-op**: keep everyone's cards flowing by playing to the Field to revive Eternals and gain their decks. Stage A: win with 4 **Stars**; other stages need 4 **Keys**. Anyone unable to act on their turn and you all lose.",
  "turn": [
   "Do one of: play a card, generate a Jewel, or give a card to a teammate.",
   "Then draw back up to 3 (none if you already have 3 or more)."
  ],
  "actions": [
   [
    "Play to the Field",
    "Leftmost empty space of a row: never the same colour or number next to each other, plus the row's own rule (Mountain up, Cave down, …)."
   ],
   [
    "Revive an Eternal",
    "Fill a row up to the Eternals: pick one, its 8 cards go under your deck, the row is cleared, and its Curse starts."
   ],
   [
    "Play to the River",
    "No placement rules. The 5th card there gives a River Rare card; none left = game over."
   ],
   [
    "Generate a Jewel",
    "Pay a recipe (each once) to the River and give the Jewel to a revived Eternal to lift its Curse. 1/5/9 also gives a Star."
   ],
   [
    "Give a card",
    "Spend a Heart to hand a teammate any card, face down."
   ],
   [
    "Rare cards",
    "Any colour and number, and ignore placement rules."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Curses only stop cards going to the Field; cursed cards can still go to the River or into Jewels.",
   "Each row closes after its 4th lap, with a bonus: Camp card, all Hearts back, or a Star.",
   "Stage A stars: Jewels on Eternals 1–3 and 4–6, all 9 revived, the 1/5/9 Jewel, the bottom row's 4th lap, all three A ability cards."
  ],
  "end": [
   "Win at the 4th Star (Keys in later stages).",
   "Lose if someone can't take an action, or draws the Game Over card. A win and a loss on the same turn is a win."
  ],
  "forget": [
   "Never say the numbers or colours in your hand; talk around them and use your two Communication Discs.",
   "Only the player who revives an Eternal gets its deck: plan who runs out next.",
   "An empty deck takes a revived Eternal's cards straight away."
  ]
 },
 "270844": {
  "src": "the Imperial Settlers: Empires of the North rulebook (Portal Games)",
  "goal": "Most **VP**: grow your clan's empire and sail to the islands. The game ends at the end of the round in which someone reaches 25 VP during the action phase.",
  "turnTitle": "Each round",
  "turn": [
   "**Lookout**: draw 4 cards; keep each by spending a worker, discard the rest. Storage cards pay out.",
   "**Actions**: one action at a time in turn order until everyone has passed.",
   "**Expedition**: ships resolve in queue order, each pillaging or conquering one island.",
   "**Cleanup**: workers back, unexhaust cards, take back pawns, new islands, first player passes left. Goods stay."
  ],
  "actions": [
   [
    "Build",
    "Pay a location's cost from your supply; it's ready to use at once. Fields are built by declaring their action instead."
   ],
   [
    "Clan pawn",
    "Place it on Explore (1 card), Populate (1 worker), Construct (build a card free, not fields), Harvest (one field and its upgrades) or Sail (queue a ship, with fish for distant islands, a raze token to conquer)."
   ],
   [
    "Second use",
    "Later, pay 1 food to move a pawn to an adjacent tile and use it again (flip it to exhausted)."
   ],
   [
    "Boost / field",
    "When declaring a pawn action, first play one Boost card or build one Field naming that action."
   ],
   [
    "Raid",
    "Discard a raze token to exhaust an opponent's action location (not after they've passed)."
   ],
   [
    "Location action",
    "Pay its cost and exhaust it."
   ]
  ],
  "roundTitle": "Expedition",
  "round": [
   "Pillage: take the island's goods and discard it.",
   "Conquer (ship has a raze token): add the island to your empire, with its ability and building bonus.",
   "Fish and raze tokens on a ship are lost whether used or not."
  ],
  "end": [
   "+1 VP per card in your empire (fields, upgrades and islands too), +1 per 2 resources, +1 per gold left.",
   "Ties: most locations, then workers, then cards in hand."
  ],
  "forget": [
   "No production phase: goods only come from harvesting and actions.",
   "Gold replaces any resource, never the other way round.",
   "Only action locations exhaust; features and fields keep working."
  ]
 },
 "246684": {
  "src": "the Smartphone Inc. rulebook (Cosmodrome Games)",
  "goal": "Most VP (money) after 5 rounds: sell phones, control regions, and be first to patent technologies.",
  "turnTitle": "Each round",
  "turn": [
   "**Plan** in secret: lay one pad on the other, covering 1–4 cells (improvements may cover more). Visible symbols are active.",
   "**Price** starts at 5: ±1 per price symbol. Lowest price acts first from now on (tie: fewest VP).",
   "**Produce**: 1 per production symbol, 1 per covered cell, plus face-down improvements and goods tokens.",
   "**Improve, research, logistics, sell**, then score."
  ],
  "actions": [
   [
    "Improve",
    "Improve symbol active: take an improvement (from next round); otherwise a goods token."
   ],
   [
    "Research",
    "1 progress marker per research symbol, placed on technologies; enough = an office there. The first to finish takes the patent (and it's 1 cheaper afterwards)."
   ],
   [
    "Logistics",
    "1 progress per logistics symbol, in regions next to yours; enough = an office in its leftmost free space."
   ],
   [
    "Sell",
    "In your regions without a retailer, fill buyers left to right: red ones only up to their price, purple ones need their technology."
   ]
  ],
  "roundTitle": "Scoring",
  "round": [
   "Goods sold × your price.",
   "Most goods sold in a region: the VP above its rightmost office (and second place if shown). Ties: the office further left.",
   "Then reset prices to 5 and put out 5 new improvements."
  ],
  "end": [
   "After round 5: add patents and retailer VP.",
   "Ties: most technologies, then most patents."
  ],
  "forget": [
   "Unsold goods are lost at the end of the round.",
   "Unused progress markers vanish at the end of your turn.",
   "A cheap price acts first but earns less per phone."
  ]
 },
 "301880": {
  "src": "the Raiders of Scythia rulebook (Garphill Games)",
  "goal": "Most **VP**: hire a crew, train animals, gather provisions and raid settlements, then take plunder and complete quests.",
  "turn": [
   "**Work**: place your worker on a free building in the village and use it, then pick up a **different** worker there and use that building too.",
   "Or **Raid**: place the right colour worker on a settlement with enough crew, provisions and wagons."
  ],
  "actions": [
   [
    "Stables",
    "2 silver for an eagle, or 1 equipment for a horse (grey or red worker)."
   ],
   [
    "Barracks",
    "Hire a crew card from hand for its silver (max 5), or 1 kumis to heal 2 wounds."
   ],
   [
    "Silversmith / Farm",
    "Silver (3 with blue, 2 otherwise) / provisions (2; red: 3 or a wagon)."
   ],
   [
    "Chief's Tent",
    "1 livestock for 2 provisions + 1 kumis, or complete a quest (grey or red worker)."
   ],
   [
    "Town Centre",
    "Play a card's action, your hero's ability, or an eagle's."
   ],
   [
    "Meeting Tent / Market",
    "Draw 2 cards or 1 + 2 kumis / discard cards for silver, a wagon or equipment."
   ],
   [
    "Raid",
    "Pay provisions and wagons, spend kumis (+1 strength each), roll the dice shown, add crew and animal strength. Take VP or wounds, then a plunder space and its new worker."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Wounds go on crew (not heroes or animals); each cuts its strength by 1. A wound at 0 strength kills.",
   "Animals only count when sitting with a crew member.",
   "Limits at the end of your turn: 8 silver, 8 provisions, 8 kumis, 8 cards."
  ],
  "end": [
   "When only 2 raid spaces or 2 quests are left, finish the turn; everyone (you too) gets one last turn.",
   "Crew, animals, quests and plunder VP; gold 2 each, equipment and wagons 1, every 2 livestock 1.",
   "Ties: most quests + crew + animals, then silver + provisions + kumis."
  ],
  "forget": [
   "Blue workers can't use the Stables or the Chief's Tent.",
   "Raid workers stay on the settlement for the rest of the game.",
   "Yellow dice: one per raid space there still holding gold."
  ]
 },
 "277659": {
  "src": "the Final Girl rulebook (Van Ryder Games)",
  "goal": "**Solo**: kill the Killer before it kills you. Save victims along the way for rewards and your ultimate ability.",
  "turn": [
   "**Action**: play action cards (move, search, attack, rest…). Most need a horror roll; each costs time.",
   "**Planning**: spend leftover time buying cards from the tableau (not ones played since the last planning), then reset time to 6.",
   "**Killer**: its Finale action, then a Terror card.",
   "**Panic**: if a victim died this turn, victims with the Killer flee by die roll.",
   "**Upkeep**: no Terror cards left = reveal the Finale; rearrange items."
  ],
  "actions": [
   [
    "Horror roll",
    "Dice = the horror level. 5–6 success; 3–4 a success if you discard 2 cards; none = failure. The card shows results for 2+, 1 and fail."
   ],
   [
    "Discard for time",
    "Any time in the action phase, discard cards for +1 time each."
   ],
   [
    "Moving",
    "Take up to 2 victims with you, but they won't follow you into the Killer's space."
   ],
   [
    "Saving victims",
    "On an exit space, save the victims there for the rewards on your Final Girl card."
   ],
   [
    "Reaction cards",
    "Only against an attack on you: roll to reduce or cancel it."
   ]
  ],
  "roundTitle": "The Killer",
  "round": [
   "It targets the closest (victim or you, as shown), moves by its bloodlust speed, and attacks by its bloodlust damage.",
   "Each victim it kills raises bloodlust.",
   "Horror past the top of the track raises bloodlust; past the bottom gives 1 time."
  ],
  "end": [
   "Win when the Killer is dead (its last, black health token may save it); lose when you die. Both at once is a win."
  ],
  "forget": [
   "The action phase ends at once if time drops below 0.",
   "Played cards can't be bought back until after the next planning phase.",
   "Hand limit 10 when buying."
  ]
 },
 "275974": {
  "src": "the Margraves of Valeria rulebook (Daily Magic Games)",
  "goal": "Most **VP**, mostly from guild icons × how far your influence has climbed on each guild's track. Build ward towers, slay monsters and ship goods.",
  "turn": [
   "Play one citizen card next to your board and use it one way: its **pennant actions**, its **power text**, **Recall**, or **Build**.",
   "With only 1 card in hand at the start of your turn, you must Recall.",
   "End of turn: hero tomb rewards, refill privilege tiles, flip monsters, refill the citizen line."
  ],
  "actions": [
   [
    "Pennants",
    "Top to bottom, skipping any: +1 strength, +1 wild resource, +2 gold, move your margrave, deploy a knight."
   ],
   [
    "Moving",
    "Your margrave (or a knight) entering a location triggers its power, or take 2 gold instead."
   ],
   [
    "Power text",
    "Do it in order; 'all players' powers go round the table. Some let you slay an adjacent monster."
   ],
   [
    "Slay a monster",
    "Pay its magic, then its strength from your track or knights sent to the hero tombs (1 each). Take its rewards and influence."
   ],
   [
    "Recall",
    "Remove 1 card from the citizen line from the game, take your played cards back, then you may hire a citizen for its gold."
   ],
   [
    "Build",
    "Pay stone, wood, magic and a gem: a ward tower in your margrave's location (one per location), its slot reward and 3 influence."
   ],
   [
    "Influence",
    "Move up a guild track; crossing a river costs gold and gives a privilege tile."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Storage holds 12 tokens (resources, gems, knights, towers); gold and strength don't use it. Strength caps at 8.",
   "Knights on the board belong to nobody: anyone can deploy them.",
   "Filling a hero tomb row or column pays its reward at the end of your turn."
  ],
  "end": [
   "Triggered by a 4th ward tower, an empty citizen deck, or no privilege tiles to refill; play on until everyone has had equal turns.",
   "Guild icons (end-game tiles, citizens in hand and played, towers' locations) × your influence level on that guild.",
   "Banner tiles: different banners squared per set; gems 2, 3 resources 1, 5 gold 1. Ties: most gold."
  ],
  "forget": [
   "Not using a location's power gives 2 gold.",
   "Each location you build in counts its 2 guild icons.",
   "Knights in the hero tombs give strength but go back to the barracks when it fills."
  ]
 },
 "422780": {
  "src": "the Mistborn: The Deckbuilding Game rulebook (Brotherwise Games)",
  "goal": "Win one of three ways: reach the top of **all three mission tracks**, be the **last one alive**, or burn 4 atium on Confrontation.",
  "turn": [
   "Move 1 up your training track.",
   "In any order and as often as you like: play cards, burn or flare metals, use cards as metals, discard to refresh a flared metal, use allies and your character, move up missions, buy from the market.",
   "Attack allies, then players; discard everything (not allies) and draw 5."
  ],
  "actions": [
   [
    "Burn",
    "Up to your burn icons per turn: put a metal token on a card to fire its ability (once per turn each)."
   ],
   [
    "Flare",
    "More metals beyond that: flip a token over. It stays used until refreshed by discarding a card of that metal pairing."
   ],
   [
    "Cards as metal",
    "Use a card as either metal of its pairing (savant abilities fire this way)."
   ],
   [
    "Allies",
    "Stay in play above your character; their metal effects trigger whenever you burn that metal."
   ],
   [
    "Buy",
    "Coins buy market cards (to your discard) and boxings (2 coins, cash in later for 1)."
   ],
   [
    "Missions",
    "Mission points move you up any track; rewards on the way, first-player bonuses, a prize at the top (12)."
   ]
  ],
  "roundTitle": "Combat",
  "round": [
   "Damage is dealt at the end of your turn; allies die only to their full defence in one go. Defenders must be dealt with first.",
   "2 players: hit your opponent and their allies as you like.",
   "3–4 players: after allies, all damage goes to whoever holds the **Target**; a holder who takes damage may pass it on."
  ],
  "end": [
   "Top of all three missions, last character standing, or 4 atium on Confrontation: an instant win."
  ],
  "forget": [
   "A metal fires each ability only once a turn, however many you burn.",
   "Health caps at 40.",
   "Unspent coins and combat are lost."
  ]
 },
 "291845": {
  "src": "the Three Sisters rulebook (Bitewing Games)",
  "goal": "Most points after 8 rounds: grow corn, beans and pumpkins, and fill your sheet's perennials, apiary, fruit and shed for chains of bonuses.",
  "turnTitle": "Each round",
  "turn": [
   "**Planning**: the first player rolls all the dice and groups them by value onto the rondel, lowest first from Farmer Edith.",
   "**Gardening**: in turn order, take a die: a garden action in that die's zone **and** the rondel action of its space.",
   "Then everyone uses the lowest remaining die at once.",
   "**Event**: the round's shed, rain or market event for everyone; the first player passes left."
  ],
  "actions": [
   [
    "Plant",
    "Fill the bottom box of up to 2 crops in the zone (a bean only once its corn is 2 high)."
   ],
   [
    "Water",
    "Fill the next box of every planted crop in the zone."
   ],
   [
    "Rondel",
    "Plant or water (again); shed time; 1 compost and 4 goods; apiary or fruit; farmer's market."
   ],
   [
    "Farmer's market",
    "Your goods total picks the row: compost, perennial, fruit or bonus actions."
   ],
   [
    "Compost",
    "Spend 1 to change a die's zone by ±1 (wraps 6↔1)."
   ],
   [
    "Bonus action",
    "From stars on the goods track: fill a box in perennials, apiary, fruit or shed (not the garden)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Filling a circle harvests it; two adjacent harvested pumpkins give the perennial between them.",
   "Perennials, apiary and crops fill bottom to top; fruit and shed left to right.",
   "Rain waters every zone, 1 to 6."
  ],
  "end": [
   "Corn 3, beans 1 (pumpkins 0); completed perennials; wax and honey as listed, split hive 3.",
   "Apples 3, blackberries 2, raspberries as listed (peaches 0); completed shed items.",
   "Ties: most garden points."
  ],
  "forget": [
   "With a plant-or-water rondel space, both actions use the same (adjusted) zone.",
   "Later wax, honey and raspberries are worth more, and add up.",
   "Iris works like free compost."
  ]
 },
 "356123": {
  "src": "the Turing Machine rulebook (Le Scorpion Masqué)",
  "goal": "Be first to find the one 3-digit code (▲ ■ ⬤, each 1–5) that passes every verifier's hidden criterion, asking the fewest questions.",
  "turnTitle": "Each round",
  "turn": [
   "**Compose** a proposal from three punch cards (same proposal all round).",
   "**Question** up to 3 verifiers: stack the verification card under it and read ✔ or ✘. Note each answer.",
   "**Deduce** on your note sheet.",
   "Everyone shows a thumb at once: up if you think you've got the code."
  ],
  "actions": [
   [
    "What a verifier tells you",
    "Only whether your proposal meets **its** one criterion, never anything else about the code."
   ],
   [
    "Criteria cards",
    "List the criteria that verifier might be checking; work out which one it is."
   ],
   [
    "Public / secret",
    "Your proposal and which verifiers you ask are public; your answers and notes are secret."
   ]
  ],
  "roundTitle": "Verification",
  "round": [
   "Thumbs up: write your code, then check it against the solution.",
   "Several right: fewest questions wins (then a shared win).",
   "Wrong guesses are out; the rest keep playing (the last one left wins)."
  ],
  "end": [
   "The first right code (fewest questions on a tie) wins."
  ],
  "forget": [
   "Every verifier is needed and none repeats another: that's a clue in itself.",
   "A ✔ on '▲ < 3' with ▲ = 2 doesn't mean ▲ is 2.",
   "Erase the ✔ marks on the verification cards after the game."
  ]
 },
 "365717": {
  "src": "the Clank! Catacombs rulebook (Dire Wolf)",
  "goal": "Grab an **artifact** and get back to the Crypt alive, with more points than everyone else. Be quiet: clank feeds the dragon.",
  "turn": [
   "Play all 5 cards in any order, for skill, swords, boots, gold, clank and draws.",
   "Take actions as often as you can pay for them.",
   "End: discard your play area, draw 5, refill the dungeon row (6 cards); a new dragon symbol means an attack."
  ],
  "actions": [
   [
    "Acquire",
    "Skill buys blue cards from the row or reserve, to your discard pile; the row isn't refilled until the turn ends."
   ],
   [
    "Device",
    "Pay skill to use a purple card at once; it's discarded."
   ],
   [
    "Fight",
    "Swords beat a red monster for its reward (the reserve goblin can be fought again and again)."
   ],
   [
    "Move",
    "1 boot per tunnel (footprints 2); monster icons hurt unless you pay swords; locks need a lockpick. Off the edge, place a new tile."
   ],
   [
    "Artifact",
    "Take one (only one, ever); the dragon's rage goes up."
   ],
   [
    "Market and locks",
    "In a market, 7 gold buys an item. A lockpick opens a chest, library or prison."
   ]
  ],
  "roundTitle": "Dragon attack",
  "round": [
   "All clank cubes go in the bag; draw cubes = the rage level (+1 per Danger card in the row).",
   "Each coloured cube is 1 damage to its owner; a ghost cube hurts everyone.",
   "A full health meter knocks you out."
  ],
  "end": [
   "Ends when everyone has escaped (back in the Crypt with an artifact: +20 mastery) or been knocked out.",
   "Knocked out in the Depths, or without an artifact: 0 points.",
   "Otherwise: artifact, gold, tokens and card points. Ties: the more valuable artifact."
  ],
  "forget": [
   "A Crystal Cave stops your boots for the rest of the turn.",
   "Once you're out, each of your turns draws 4 cubes (6 with 2 players) from the bag.",
   "Reward rooms pay once per turn."
  ]
 },
 "279537": {
  "src": "The Search for Planet X rulebook (Foxtrot Games)",
  "goal": "Most points: find **Planet X** and submit correct theories about the other objects. The app hides a new solar system every game.",
  "turn": [
   "Whoever is furthest back on the time track takes one action and moves their pawn by its time cost.",
   "Then rotate the earth board toward the rearmost pawn, pausing for conference and theory phases on the way."
  ],
  "actions": [
   [
    "Survey",
    "An object type and a range of visible sectors: how many are there (1–3 sectors 4 time, 4–6 sectors 3 time). Comet ranges must start and end on comet sectors."
   ],
   [
    "Target",
    "One visible sector: what's in it (4 time, 2 tokens a game)."
   ],
   [
    "Research",
    "A topic's logic rule (1 time); never twice in a row."
   ],
   [
    "Locate Planet X",
    "Its sector and both neighbours' objects (5 time). Right ends the game."
   ]
  ],
  "roundTitle": "Theories",
  "round": [
   "Theory phase: everyone secretly picks 1 theory (2 in expert), placed in back-to-front order; all theories move one step in.",
   "Theories reaching the centre are peer-reviewed: right ones stay (and confirm the sector); wrong ones cost 1 time.",
   "Conference phase: everyone learns a new Planet X clue (once each)."
  ],
  "end": [
   "Players behind the finder get a last chance: theories (1–3 back: 1, 4–5 back: 2) or try to locate it (2 points per sector back).",
   "1 point per sector you were first to theorise correctly; asteroids 2, comets 3, gas clouds 4, dwarf planets 4 (expert 2).",
   "Finding Planet X first: 10. Ties: Planet X points, then leader bonuses."
  ],
  "forget": [
   "Planet X looks empty in surveys and targets.",
   "Survey and target results are private; announce only what you asked.",
   "Don't reveal where Planet X is when you find it."
  ]
 },
 "360153": {
  "src": "the Marvel Dice Throne rulebook (Roxley)",
  "goal": "Bring your opponent's health to **0** (start: 50 in a duel). Roll your hero's five dice for abilities, and play cards with combat points (CP).",
  "turn": [
   "**Upkeep**: status effects and passives that trigger now.",
   "**Income**: +1 CP (max 15) and draw 1 (the start player skips their first).",
   "**Main 1**: play upgrades and main-phase actions; sell any card for 1 CP.",
   "**Offensive roll**: up to 3 roll attempts, then activate one offensive ability your dice meet.",
   "**Defensive roll**: the defender rolls their defence once (if the damage is defendable). Then **Main 2**, then discard down to 6 (selling for CP)."
  ],
  "actions": [
   [
    "Upgrades",
    "Permanently replace an ability on your board (main phases only); level II → III pays only the difference."
   ],
   [
    "Instant cards (red)",
    "Any time, even to interrupt; nothing interrupts them."
   ],
   [
    "Roll-phase cards (orange)",
    "During any player's roll phases, e.g. to change dice."
   ],
   [
    "Status effects",
    "Tokens with stack limits; spendable ones can be used any time, persistent ones stay."
   ],
   [
    "Damage types",
    "Normal (defendable, preventable, modifiable), undefendable, pure (can't be modified), collateral, and ultimate (can't be stopped or reduced at all)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "All damage, prevention and healing in a phase land together at its end.",
   "You can heal up to 10 above your starting health.",
   "Before an ability activates, opponents may change your dice; you may then pick another ability or use your remaining rerolls."
  ],
  "end": [
   "Reach 0 health and you're out; everyone left at 0 together is a draw.",
   "3 players (King of the Hill, 35 health): attacking the leader draws you a card. 2v2: teams share 50 health; roll a die to target."
  ],
  "forget": [
   "Once an ultimate activates nothing can stop or reduce it; the only answer is changing the dice before it does.",
   "Selling any card is always worth 1 CP.",
   "Hand limit 6 at the end of your turn; CP max 15."
  ]
 },
 "360061": {
  "src": "the Marvel Dice Throne rulebook (Roxley)",
  "goal": "Bring your opponent's health to **0** (start: 50 in a duel). Roll your hero's five dice for abilities, and play cards with combat points (CP).",
  "turn": [
   "**Upkeep**: status effects and passives that trigger now.",
   "**Income**: +1 CP (max 15) and draw 1 (the start player skips their first).",
   "**Main 1**: play upgrades and main-phase actions; sell any card for 1 CP.",
   "**Offensive roll**: up to 3 roll attempts, then activate one offensive ability your dice meet.",
   "**Defensive roll**: the defender rolls their defence once (if the damage is defendable). Then **Main 2**, then discard down to 6 (selling for CP)."
  ],
  "actions": [
   [
    "Upgrades",
    "Permanently replace an ability on your board (main phases only); level II → III pays only the difference."
   ],
   [
    "Instant cards (red)",
    "Any time, even to interrupt; nothing interrupts them."
   ],
   [
    "Roll-phase cards (orange)",
    "During any player's roll phases, e.g. to change dice."
   ],
   [
    "Status effects",
    "Tokens with stack limits; spendable ones can be used any time, persistent ones stay."
   ],
   [
    "Damage types",
    "Normal (defendable, preventable, modifiable), undefendable, pure (can't be modified), collateral, and ultimate (can't be stopped or reduced at all)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "All damage, prevention and healing in a phase land together at its end.",
   "You can heal up to 10 above your starting health.",
   "Before an ability activates, opponents may change your dice; you may then pick another ability or use your remaining rerolls."
  ],
  "end": [
   "Reach 0 health and you're out; everyone left at 0 together is a draw.",
   "3 players (King of the Hill, 35 health): attacking the leader draws you a card. 2v2: teams share 50 health; roll a die to target."
  ],
  "forget": [
   "Once an ultimate activates nothing can stop or reduce it; the only answer is changing the dice before it does.",
   "Selling any card is always worth 1 CP.",
   "Hand limit 6 at the end of your turn; CP max 15."
  ]
 },
 "360152": {
  "src": "the Marvel Dice Throne rulebook (Roxley)",
  "goal": "Bring your opponent's health to **0** (start: 50 in a duel). Roll your hero's five dice for abilities, and play cards with combat points (CP).",
  "turn": [
   "**Upkeep**: status effects and passives that trigger now.",
   "**Income**: +1 CP (max 15) and draw 1 (the start player skips their first).",
   "**Main 1**: play upgrades and main-phase actions; sell any card for 1 CP.",
   "**Offensive roll**: up to 3 roll attempts, then activate one offensive ability your dice meet.",
   "**Defensive roll**: the defender rolls their defence once (if the damage is defendable). Then **Main 2**, then discard down to 6 (selling for CP)."
  ],
  "actions": [
   [
    "Upgrades",
    "Permanently replace an ability on your board (main phases only); level II → III pays only the difference."
   ],
   [
    "Instant cards (red)",
    "Any time, even to interrupt; nothing interrupts them."
   ],
   [
    "Roll-phase cards (orange)",
    "During any player's roll phases, e.g. to change dice."
   ],
   [
    "Status effects",
    "Tokens with stack limits; spendable ones can be used any time, persistent ones stay."
   ],
   [
    "Damage types",
    "Normal (defendable, preventable, modifiable), undefendable, pure (can't be modified), collateral, and ultimate (can't be stopped or reduced at all)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "All damage, prevention and healing in a phase land together at its end.",
   "You can heal up to 10 above your starting health.",
   "Before an ability activates, opponents may change your dice; you may then pick another ability or use your remaining rerolls."
  ],
  "end": [
   "Reach 0 health and you're out; everyone left at 0 together is a draw.",
   "3 players (King of the Hill, 35 health): attacking the leader draws you a card. 2v2: teams share 50 health; roll a die to target."
  ],
  "forget": [
   "Once an ultimate activates nothing can stop or reduce it; the only answer is changing the dice before it does.",
   "Selling any card is always worth 1 CP.",
   "Hand limit 6 at the end of your turn; CP max 15."
  ]
 },
 "348406": {
  "src": "the Marvel Dice Throne rulebook (Roxley)",
  "goal": "Bring your opponent's health to **0** (start: 50 in a duel). Roll your hero's five dice for abilities, and play cards with combat points (CP).",
  "turn": [
   "**Upkeep**: status effects and passives that trigger now.",
   "**Income**: +1 CP (max 15) and draw 1 (the start player skips their first).",
   "**Main 1**: play upgrades and main-phase actions; sell any card for 1 CP.",
   "**Offensive roll**: up to 3 roll attempts, then activate one offensive ability your dice meet.",
   "**Defensive roll**: the defender rolls their defence once (if the damage is defendable). Then **Main 2**, then discard down to 6 (selling for CP)."
  ],
  "actions": [
   [
    "Upgrades",
    "Permanently replace an ability on your board (main phases only); level II → III pays only the difference."
   ],
   [
    "Instant cards (red)",
    "Any time, even to interrupt; nothing interrupts them."
   ],
   [
    "Roll-phase cards (orange)",
    "During any player's roll phases, e.g. to change dice."
   ],
   [
    "Status effects",
    "Tokens with stack limits; spendable ones can be used any time, persistent ones stay."
   ],
   [
    "Damage types",
    "Normal (defendable, preventable, modifiable), undefendable, pure (can't be modified), collateral, and ultimate (can't be stopped or reduced at all)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "All damage, prevention and healing in a phase land together at its end.",
   "You can heal up to 10 above your starting health.",
   "Before an ability activates, opponents may change your dice; you may then pick another ability or use your remaining rerolls."
  ],
  "end": [
   "Reach 0 health and you're out; everyone left at 0 together is a draw.",
   "3 players (King of the Hill, 35 health): attacking the leader draws you a card. 2v2: teams share 50 health; roll a die to target."
  ],
  "forget": [
   "Once an ultimate activates nothing can stop or reduce it; the only answer is changing the dice before it does.",
   "Selling any card is always worth 1 CP.",
   "Hand limit 6 at the end of your turn; CP max 15."
  ]
 },
 "403494": {
  "src": "the Marvel Dice Throne rulebook (Roxley)",
  "goal": "Bring your opponent's health to **0** (start: 50 in a duel). Roll your hero's five dice for abilities, and play cards with combat points (CP).",
  "turn": [
   "**Upkeep**: status effects and passives that trigger now.",
   "**Income**: +1 CP (max 15) and draw 1 (the start player skips their first).",
   "**Main 1**: play upgrades and main-phase actions; sell any card for 1 CP.",
   "**Offensive roll**: up to 3 roll attempts, then activate one offensive ability your dice meet.",
   "**Defensive roll**: the defender rolls their defence once (if the damage is defendable). Then **Main 2**, then discard down to 6 (selling for CP)."
  ],
  "actions": [
   [
    "Upgrades",
    "Permanently replace an ability on your board (main phases only); level II → III pays only the difference."
   ],
   [
    "Instant cards (red)",
    "Any time, even to interrupt; nothing interrupts them."
   ],
   [
    "Roll-phase cards (orange)",
    "During any player's roll phases, e.g. to change dice."
   ],
   [
    "Status effects",
    "Tokens with stack limits; spendable ones can be used any time, persistent ones stay."
   ],
   [
    "Damage types",
    "Normal (defendable, preventable, modifiable), undefendable, pure (can't be modified), collateral, and ultimate (can't be stopped or reduced at all)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "All damage, prevention and healing in a phase land together at its end.",
   "You can heal up to 10 above your starting health.",
   "Before an ability activates, opponents may change your dice; you may then pick another ability or use your remaining rerolls."
  ],
  "end": [
   "Reach 0 health and you're out; everyone left at 0 together is a draw.",
   "3 players (King of the Hill, 35 health): attacking the leader draws you a card. 2v2: teams share 50 health; roll a die to target."
  ],
  "forget": [
   "Once an ultimate activates nothing can stop or reduce it; the only answer is changing the dice before it does.",
   "Selling any card is always worth 1 CP.",
   "Hand limit 6 at the end of your turn; CP max 15."
  ]
 },
 "266964": {
  "src": "the Dice Throne Season Two rulebook (Roxley)",
  "goal": "Bring your opponent's health to **0** (start: 50 in a duel). Roll your hero's five dice for abilities, and play cards with combat points (CP).",
  "turn": [
   "**Upkeep**: status effects and passives that trigger now.",
   "**Income**: +1 CP (max 15) and draw 1 (the start player skips their first).",
   "**Main 1**: play upgrades and main-phase actions; sell any card for 1 CP.",
   "**Offensive roll**: up to 3 roll attempts, then activate one offensive ability your dice meet.",
   "**Defensive roll**: the defender rolls their defence once (if the damage is defendable). Then **Main 2**, then discard down to 6 (selling for CP)."
  ],
  "actions": [
   [
    "Upgrades",
    "Permanently replace an ability on your board (main phases only); level II → III pays only the difference."
   ],
   [
    "Instant cards (red)",
    "Any time, even to interrupt; nothing interrupts them."
   ],
   [
    "Roll-phase cards (orange)",
    "During any player's roll phases, e.g. to change dice."
   ],
   [
    "Status effects",
    "Tokens with stack limits; spendable ones can be used any time, persistent ones stay."
   ],
   [
    "Damage types",
    "Normal (defendable, preventable), undefendable, pure, and ultimate (can't be stopped or reduced at all)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "All damage, prevention and healing in a phase land together at its end.",
   "You can heal up to 10 above your starting health.",
   "Before an ability activates, opponents may change your dice; you may then pick another ability or use your remaining rerolls."
  ],
  "end": [
   "Reach 0 health and you're out; everyone left at 0 together is a draw."
  ],
  "forget": [
   "Once an ultimate activates nothing can stop or reduce it; the only answer is changing the dice before it does.",
   "Selling any card is always worth 1 CP.",
   "Hand limit 6 at the end of your turn; CP max 15."
  ]
 },
 "374595": {
  "src": "the Kelp: Shark vs Octopus rulebook",
  "goal": "Asymmetric duel. The **Octopus** wins by eating all 4 food blocks or outlasting the Shark (7 dice on its hunger track). The **Shark** wins only by striking the Octopus and winning the confrontation.",
  "turnTitle": "Octopus turn",
  "turn": [
   "Take **2 actions** (repeats allowed): play a card, draw back up to your hand size, or discard a card to hide 1 block.",
   "Card costs are paid by revealing that many hidden blocks (the double shell counts 2)."
  ],
  "actions": [
   [
    "Move cards",
    "Swap two adjacent blocks (they keep their state), or shuffle hidden blocks into the bag and redraw them where the Shark points."
   ],
   [
    "Hide",
    "Stand blocks back up."
   ],
   [
    "Learn",
    "Gain new cards or new blocks (swapped for revealed blocks); an Eat card brings its food block."
   ],
   [
    "Eat",
    "Octopus next to its food and the matching Eat card: the food goes to the food track, with a one-time bonus."
   ],
   [
    "Shark turn",
    "Draw 2 dice and roll; place currents, move (you must), search (yellow) or strike (red) adjacent zones with dice at least the zone value, then growth, then energy."
   ],
   [
    "Energy",
    "Leftover dice are stored; their pips buy shark cards (new dice). Using stored energy puts a die on the hunger track."
   ]
  ],
  "roundTitle": "Confrontation",
  "round": [
   "A strike on the Octopus: both secretly pick one of 3 colour cards.",
   "Shark picks the matching colour: the Shark wins. Otherwise the Octopus escapes and uses its card; both cards leave the game.",
   "So the second confrontation is 50-50, and the third always goes to the Shark."
  ],
  "end": [
   "Octopus: 4th food on the food track, or the Shark's 7th hunger die.",
   "Shark: a winning confrontation."
  ],
  "forget": [
   "Every strike puts its red die on the hunger track, hit or miss.",
   "The Shark can't stop on a current, turn round or stand still.",
   "Traps fire when the Shark reveals them."
  ]
 },
 "274364": {
  "src": "the Watergate rulebook (Frosted Games / Capstone Games)",
  "goal": "Two players. **Nixon** wins with 5 momentum tokens (or if momentum runs out); the **Editor** wins by linking 2 informants to Nixon on the evidence board through face-up evidence.",
  "turnTitle": "Each round",
  "turn": [
   "Both draw 4 or 5 cards (as the initiative card shows). Nixon draws 3 evidence tokens and puts them face down at 0 on the research track.",
   "Starting with the initiative, alternate playing one card until both hands are empty.",
   "Evaluation: tokens on your side of the track are yours."
  ],
  "actions": [
   [
    "Value",
    "Move one token (initiative, momentum, or evidence of the card's colour) that many spaces your way. Reaching your 5 takes it at once."
   ],
   [
    "Face-down evidence",
    "Nixon flips and moves it. The Editor asks for a colour; Nixon must flip a match, or the Editor moves something else."
   ],
   [
    "Action",
    "Do the card's text instead. Events leave the game; conspirators and journalists go back to your discard pile."
   ],
   [
    "Pinning evidence",
    "On a matching empty space: the Editor face up (links), Nixon face down (blocks). Momentum-symbol evidence also nudges momentum your way."
   ]
  ],
  "roundTitle": "Evaluation",
  "round": [
   "Evidence still at 0 goes back in the bag.",
   "Initiative to whoever's side it's on (at 0: the player who didn't have it).",
   "Momentum to whoever's side it's on (at 0: back to the supply); then reset initiative and a new momentum at 0.",
   "Finally each player pins their evidence (initiative first)."
  ],
  "end": [
   "Nixon: the 5th momentum on the momentum card, or no momentum left to place.",
   "Editor: 2 face-up informants connected to Nixon by face-up evidence."
  ],
  "forget": [
   "Nixon may look at face-down evidence on the research track any time; the Editor may not.",
   "Either player may look through both discard piles and removed cards.",
   "Momentum the Editor gains with a full card is removed from the game."
  ]
 },
 "329082": {
  "src": "the Radlands rulebook (Roxley)",
  "goal": "Two players. Destroy all 3 of your opponent's **camps**.",
  "turn": [
   "**Events**: resolve the one in your [1] space, then move your events forward.",
   "**Replenish**: draw a card, take 3 water (the start player gets 1 on their first turn).",
   "**Actions**, any order, as often as you can pay. Unspent water is lost."
  ],
  "actions": [
   [
    "Play a person",
    "Pay water; place in a column in front of a camp (max 2 people per column). Not ready the turn it's played."
   ],
   [
    "Play an event",
    "Pay water; it goes in the queue space its bomb shows (or further back). A [0] event happens at once."
   ],
   [
    "Junk",
    "Discard a card for its junk icon effect."
   ],
   [
    "Draw / Water Silo",
    "2 water: draw a card. 1 water: take your Water Silo into hand (junk it later for 1 water)."
   ],
   [
    "Use an ability",
    "On a ready camp or person: pay water; it's no longer ready this turn."
   ],
   [
    "Raid",
    "Play your Raiders to [2], or move them 1 forward; when they resolve, your opponent damages one of their own camps."
   ]
  ],
  "roundTitle": "Damage",
  "round": [
   "Damage only hits **unprotected** cards (nothing in front of them), unless stated.",
   "Damaged cards turn sideways; a second damage destroys. A damaged punk is destroyed.",
   "A person isn't ready if played, restored or used this turn, or if damaged."
  ],
  "end": [
   "Win when all three enemy camps are destroyed.",
   "The deck running out a second time is a draw."
  ],
  "forget": [
   "Traits only work on undamaged people.",
   "A card can't restore itself.",
   "'Enemy' means people, not camps."
  ]
 },
 "218074": {
  "src": "the Detective: City of Angels rulebook (Van Ryder Games)",
  "goal": "Detectives race to solve the murder (suspect, weapon and a motive); the **Chisel** plays the suspects, lies through them, and wins if the case goes cold.",
  "turnTitle": "Each day",
  "turn": [
   "Detectives take turns (from the Chisel's left), 4 actions each, in any order and repeats allowed.",
   "Attempts to solve happen at the start of your turn, before acting.",
   "End of day: the day marker moves down; removed evidence may come back."
  ],
  "actions": [
   [
    "Move",
    "Anywhere in your district (border spaces count as both)."
   ],
   [
    "Search",
    "A location or a suspect: the Chisel hands you its search card."
   ],
   [
    "Question",
    "Ask a suspect here about one case card you know (by its letter). The Chisel picks the response: the one true most useful answer, or a lie."
   ],
   [
    "Challenge",
    "Think it's a lie? Hand over leverage. Right: you gain leverage over the suspect and get the true answer. Wrong: the Chisel gains leverage over you."
   ],
   [
    "Analyze / Kickback",
    "1 scratch per Analyze; Kickback at a mob joint once a day = scratch equal to the number of players."
   ],
   [
    "Bribes",
    "Goon 2 (force an answer), detective 2, officer 3 (at a station), snitch 3 (hear another's answer)."
   ]
  ],
  "roundTitle": "Leverage",
  "round": [
   "Your leverage over a suspect forces their most useful answer and blocks snitches.",
   "The Chisel's leverage over you can block a question or a snitch.",
   "If both could, the detective decides first."
  ],
  "end": [
   "Solve once: write suspect, weapon (cards you've seen) and one motive. Wrong: the Chisel tells you how many parts were right.",
   "After the last day everyone makes a final guess; if nobody's right, the Chisel wins. Ties: reverse player order."
  ],
  "forget": [
   "Don't show your case cards to the other detectives.",
   "Taken evidence must come back face up three days later.",
   "A newly found suspect gives a free question."
  ]
 },
 "118048": {
  "src": "the Targi rulebook (Kosmos)",
  "goal": "Two players. Most **VP** from tribe cards and tokens: place your Targis on the border, take the crossings in the middle.",
  "turnTitle": "Each round",
  "turn": [
   "The robber moves one border card (a corner = a raid).",
   "Alternate placing your 3 Targis on border cards: not on the robber, a corner, an occupied card, or opposite an opponent's Targi.",
   "Put your 2 tribe markers where your Targis' lines cross in the middle.",
   "Each player does all their actions; then flip the new middle cards and pass the first-player amulet."
  ],
  "actions": [
   [
    "Border cards",
    "Each Targi takes its card's action (goods, gold, trades, the Noble to play your held card)."
   ],
   [
    "Middle cards",
    "Goods cards give their goods; tribe cards are played by paying their cost, or one may be kept in hand. Each taken card is replaced by the other type."
   ],
   [
    "Tribe cards",
    "Build a display of up to 3 rows of 4, left to right; many give an advantage."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "End of a round: keep at most 10 goods and 3 gold.",
   "Raids: each player loses the goods shown (gold on the last) or VP instead.",
   "Two Targis in the same row or column cross nowhere: only 1 tribe marker then."
  ],
  "end": [
   "At the end of the round in which someone has 12 tribe cards, or when the robber reaches the last raid card.",
   "Tribe card VP, VP tokens, card bonuses; a row of 4 same symbols +4, 4 different +2.",
   "Ties: most gold, then most goods."
  ],
  "forget": [
   "Only one tribe card can be held in hand; play it later with the Noble.",
   "Gold isn't a good.",
   "Taking the card facing the robber is allowed."
  ]
 },
 "344258": {
  "src": "the That Time You Killed Me rulebook (Rock Manor Games)",
  "goal": "Two rival time travellers. Wipe your opponent out of **two of the three eras** (past, present, future), checked at the end of your turn.",
  "turn": [
   "**Choose a copy** of yourself in the era where your focus token is.",
   "**Take 2 actions** with that copy (the same one twice is fine; you must take both if you can).",
   "**Shift focus** to a different era: that's where you'll act next turn."
  ],
  "actions": [
   [
    "Move",
    "1 space orthogonally in your era."
   ],
   [
    "Push",
    "Moving into your opponent pushes them 1 space. Into a wall or an unmovable object: squished (dead)."
   ],
   [
    "Paradox",
    "Push them into another copy of themselves and both die. Never move into your own copy."
   ],
   [
    "Travel forward",
    "To the same space in the next era (must be empty)."
   ],
   [
    "Travel back",
    "To the same space in the previous era (empty), leaving a new copy of yourself behind from your supply."
   ],
   [
    "Chapters",
    "Each new chapter adds pieces and actions (seeds and trees, statues, elephants); its own rules apply."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "No copies in your focus era: you lose your actions; just shift focus.",
   "Dead copies are gone for good; your supply can run out, and then you can't travel back.",
   "An action in an earlier era can change later ones (objects carry forward)."
  ],
  "end": [
   "At the end of your turn, if your opponent has copies in only one era (or none), you win.",
   "You can't lose on your own turn."
  ],
  "forget": [
   "Your focus can't stay in the same era two turns running.",
   "Two actions to cross two eras: the middle era's space must be empty too.",
   "Your active copy keeps acting even after it travels."
  ]
 },
 "155987": {
  "src": "the Abyss rulebook (Bombyx)",
  "goal": "Most **influence points**: recruit lords with allies, control locations, slay monsters.",
  "turn": [
   "**Plot at court** (optional): 1 pearl per lord added to an empty court space.",
   "**One action**: explore the depths, ask the council for support, or recruit a lord.",
   "**Control a location** at once when you hold 3 keys."
  ],
  "actions": [
   [
    "Explore",
    "Reveal cards one by one. Each ally is first offered to the others: the first buyer pays you 1, then 2, then 3 pearls (one buy per opponent per turn). Nobody buys: take it (turn ends) or keep going."
   ],
   [
    "Monsters",
    "Fight (automatic win, reward by the threat track, threat resets, turn ends) or keep exploring (threat +1)."
   ],
   [
    "Track full",
    "The last space forces you to take that ally (+1 pearl) or fight that monster (+1 pearl). Leftover allies go to the council by race."
   ],
   [
    "Council",
    "Take a whole council stack of one race, unseen."
   ],
   [
    "Recruit a lord",
    "Play allies of exactly the number of races shown (including the big-bubble one), worth at least the total; pearls cover missing points. Your lowest played ally is affiliated, the rest discarded."
   ],
   [
    "Locations",
    "With 3 keys, take a face-up location or draw 1–4 and choose; the lords used go underneath and lose their powers."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Lord powers with an arrow happen once when recruited; others last until the lord goes under a location.",
   "When only 2 lords remain at court, you get 2 pearls and refill it.",
   "Ambassadors carry 3 keys on their own."
  ],
  "end": [
   "Someone's 7th lord, or the court can't be refilled: finish the turn, then everyone else gets one more.",
   "Affiliate the lowest ally of each race still in hand. Score locations, lords, your highest affiliated ally of each race, monster tokens.",
   "Ties: most pearls, then the highest lord."
  ],
  "forget": [
   "Each opponent may buy only one ally per explore.",
   "Overpaying a lord gives no change.",
   "Lords under a location still score."
  ]
 },
 "318084": {
  "src": "the Furnace rulebook (Hobby World / Arcane Wonders)",
  "goal": "Most **money** after 4 rounds: win companies at auction (or get paid for losing), then run your production chain.",
  "turnTitle": "Each round",
  "turn": [
   "**Auction**: deal a row of company cards (players + 4). In turn order, place one capital disc at a time on a card: never two of yours on one card, never two equal values on one card.",
   "Resolve cards left to right: the highest disc takes the card; every other bidder there gets its **compensation** × their disc's value.",
   "**Production**: run each of your cards once, in any order you choose."
  ],
  "actions": [
   [
    "Extraction",
    "Gain the resources shown (mandatory)."
   ],
   [
    "Processing",
    "Swap the left resources for the right ones, up to the number above the arrow (optional)."
   ],
   [
    "Compensation",
    "For outbid players only: extraction × disc value, or processing up to disc value times."
   ],
   [
    "Upgrade",
    "Your start-up card gives an upgrade token; flip companies for 1 coal + 1 token each. Upgraded cards add their second effect."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "An empty card in the auction row is discarded.",
   "The winner of a card gets no compensation from it.",
   "Once you move on to the next card in production, you can't go back."
  ],
  "end": [
   "After round 4, most money wins.",
   "Ties: most cards, then most resources."
  ],
  "forget": [
   "Left-to-right resolution matters: gain resources from one compensation before spending them on the next.",
   "Upgrade a card before using it to get both its effects this round."
  ]
 },
 "75547": {
  "src": "the Shipwrights of the North Sea rulebook (Garphill Games)",
  "goal": "Most **VP** when someone finishes their 4th ship: build longships, buildings, and win military majority.",
  "turnTitle": "Each day",
  "turn": [
   "**Morning**: three drafts — draw players + 1 cards, keep 1, pass on; repeat until everyone holds 3.",
   "**Afternoon**: in turn, take actions as you like; you must play or discard all 3 cards.",
   "**Evening**: gold and workers come in; trim goods and workers to capacity."
  ],
  "actions": [
   [
    "Buy goods",
    "2 gold + 2 workers: oak, wool or iron, as the back of the top draw card shows."
   ],
   [
    "Tools",
    "Buy for gold (only one at a time): build a ship without one good, or the Trade Cart."
   ],
   [
    "Craftsmen",
    "Keep up to 4 under your board for later ships."
   ],
   [
    "Townsfolk",
    "Play now or discard: raids, theft, gold, protection (Watchman), start player (Pioneer)…"
   ],
   [
    "Ships",
    "Place in one of your 2 workshops, then finish later by paying its gold, workers, goods and craftsmen."
   ],
   [
    "Buildings",
    "Pay gold and workers; one of each type."
   ]
  ],
  "roundTitle": "Evening",
  "round": [
   "Gold: 1 per worker in your village + gold icons on your ships (max 12).",
   "Workers: 1 + ship worker modifiers (always at least 1).",
   "Overnight limits: 8 goods in the mill (± ships), 8 workers."
  ],
  "end": [
   "Ends after the evening of the day someone builds a 4th ship.",
   "Ship VP + building VP + 3 for the most military points.",
   "Ties: most gold."
  ],
  "forget": [
   "Unbuilt ships only leave a workshop when finished or barbarians destroy them.",
   "Limits apply only overnight.",
   "Tools are discarded once used."
  ]
 },
 "194607": {
  "src": "the Mystic Vale rulebook (AEG)",
  "goal": "Most **VP** when the VP pool runs out: improve your cards by sleeving advancements into them, and buy vales.",
  "turn": [
   "**Plant**: push your on-deck card into your field (reveal a new on-deck) or pass. 4+ decay showing (field + on-deck, minus growth) = **spoil**: skip the harvest, flip your mana token active.",
   "**Harvest**: harvest abilities, VP from cards' left side, buy up to 2 vales (spirit symbols) and up to 2 advancements (mana).",
   "**Discard**: sleeve the new advancements into field cards, discard the field, refill the market.",
   "**Prep**: lay out your next field until 3 decay show."
  ],
  "actions": [
   [
    "Mana",
    "Only cards in your field count (not the on-deck card); your active mana token adds 1."
   ],
   [
    "Spirit symbols",
    "Each pays for one vale; wild pays for any."
   ],
   [
    "Sleeving",
    "An advancement can't cover another (except long abilities over long abilities)."
   ],
   [
    "Abilities",
    "When Played (on entering the field), Harvest (field only), Ongoing (always)."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "On-deck cards count only for decay and growth.",
   "Vale abilities can't be used the turn you buy them.",
   "Each growth cancels one decay."
  ],
  "end": [
   "When the VP pool empties, finish the round.",
   "VP tokens + right-side VP on advancements and vales.",
   "Ties: most level 3 advancements + level 2 vales."
  ],
  "forget": [
   "Avoid crafting cards with 2+ decay.",
   "You can't buy an advancement with nowhere legal to sleeve it.",
   "Unspent mana is lost; an unspent active mana token stays."
  ]
 },
 "258779": {
  "src": "the Planet Unknown rulebook (Adam's Apple Games)",
  "goal": "Most **medals**: fill your planet with tiles, climb five resource tracks, rescue lifepods and clear meteorites.",
  "turnTitle": "Each round",
  "turn": [
   "The station commander may turn the space station.",
   "Everyone at once drafts one of the 2 tiles at their depot and places it on their planet.",
   "Advance a resource track for each resource on the tile; then the commander passes left."
  ],
  "actions": [
   [
    "Placement",
    "The first tile touches the edge; later ones touch an earlier tile. No overlaps, on the grid. A tile on a lifepod or rover destroys it."
   ],
   [
    "Meteors",
    "A tile with a meteor symbol gets a meteorite on it; that row and column can't score."
   ],
   [
    "Water",
    "Only advances if a water square covers planetary ice."
   ],
   [
    "Energy",
    "Advances the tile's other resource or a resource touching the energy area."
   ],
   [
    "Rovers",
    "Rover milestones place a rover; rover numbers move them; driving over meteorites and lifepods collects them."
   ],
   [
    "Civ / tech / biomass",
    "Civ cards, tech powers for the rest of the game, biomass patches to fill gaps."
   ]
  ],
  "roundTitle": "Good to know",
  "round": [
   "Synergy boosts: advance any one track.",
   "A track at the top gives no more from that resource (rovers still move).",
   "If you can play one of your 2 tiles, you must."
  ],
  "end": [
   "Ends when someone can't place either tile (finish the round) or a depot empties.",
   "Complete rows and columns without meteorites: their medal; each track's highest medal reached; 1 per lifepod, 1 per 3 meteorites; end-game civ cards; neighbour objectives.",
   "Ties: fewest empty squares, then fewest meteorites left."
  ],
  "forget": [
   "Each resource on a tile advances once, whatever the tile's size.",
   "A player who can't place still takes a tile and advances both resources."
  ]
 }
};
