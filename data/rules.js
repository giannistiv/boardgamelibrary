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
 }
};
