const EXTRA_GAMES = {
  432:{id:"six_nimmt",name:"6 nimmt!",bggId:432,year:1994,designer:"Wolfgang Kramer",
    description:"A fast-paced card game where players simultaneously play numbered cards onto four rows, trying to avoid taking the sixth card in any row. Each card taken scores penalty points equal to the bull heads printed on it, and the player with the fewest points wins.",
    categories:["Card Game","Party","Family"],players:"2-10",playTime:"45 min",
    complexity:1.2,bggRating:7.1,spineColor:"#c0392b",boxSize:"sm",
    mechanics:["Hand Management","Simultaneous Action Selection"]},
  68448:{id:"seven_wonders",name:"7 Wonders",bggId:68448,year:2010,designer:"Antoine Bauza",
    description:"Players lead ancient civilizations through three ages by drafting cards representing resources, buildings, and military forces to construct their city and wonders. Strategic card selection and awareness of neighbors' progress is key to scoring the most victory points across science, commerce, guilds, and military.",
    categories:["Strategy","Card Game","Euro"],players:"2-7",playTime:"30 min",
    complexity:2.3,bggRating:7.7,spineColor:"#e67e22",boxSize:"md",
    mechanics:["Card Drafting","Hand Management","Simultaneous Action Selection"]},
  173346:{id:"seven_wonders_duel",name:"7 Wonders Duel",bggId:173346,year:2015,designer:"Antoine Bauza, Bruno Cathala",
    description:"A two-player adaptation of 7 Wonders where opponents draft cards from a shared pyramid layout, racing to develop science, military, and commerce while constructing one of seven ancient wonders. Victory can be achieved outright via military supremacy or scientific dominance, or by points at the game's end.",
    categories:["Strategy","Card Game","Euro"],players:"2-2",playTime:"30 min",
    complexity:2.2,bggRating:8.1,spineColor:"#2980b9",boxSize:"sm",
    mechanics:["Card Drafting","Hand Management","Set Collection"]},
  200511:{id:"after_the_empire",name:"After the Empire",bggId:200511,year:2021,designer:"Evan Halbert, Ryan Mauk",
    description:"Set in the aftermath of a collapsed empire, players manage a medieval realm balancing resource production, population growth, and defensive fortifications against barbarian raids. Simultaneous action selection and a shared threat create tense decisions about whether to invest in your own kingdom or prepare for the coming onslaught.",
    categories:["Strategy","Worker Placement","Euro"],players:"2-4",playTime:"60-120 min",
    complexity:3.11,bggRating:7.3,spineColor:"#7f8c8d",boxSize:"md",
    mechanics:["Simultaneous Action Selection","Resource Management","Variable Player Powers"]},
  6707:{id:"age_of_mythology",name:"Age of Mythology: The Boardgame",bggId:6707,year:2003,designer:"Glenn Drover",
    description:"Based on the classic PC game, players command Greek, Egyptian, or Norse civilizations competing for territorial dominance through armies, mythological creatures, and divine favor. Players gather resources, build settlements, recruit units, and invoke god powers to conquer opponents across a modular map.",
    categories:["Strategy","Thematic","Area Control"],players:"2-4",playTime:"120 min",
    complexity:3.0,bggRating:6.1,spineColor:"#8e44ad",boxSize:"lg",
    mechanics:["Area Control","Variable Player Powers","Resource Management"]},
  247367:{id:"air_land_and_sea",name:"Air, Land, and Sea",bggId:247367,year:2019,designer:"Jon Perry",
    description:"A tense two-player card game of bluffing and tactical placement where players battle for control of three theaters of war using a hand of just six cards. Players may choose to withdraw and concede fewer points rather than risk a devastating loss, creating constant psychological pressure.",
    categories:["Card Game","Strategy","Abstract"],players:"2-2",playTime:"20 min",
    complexity:1.74,bggRating:7.5,spineColor:"#2c3e50",boxSize:"sm",
    mechanics:["Hand Management","Bluffing","Area Control"]},
  380844:{id:"altar_of_the_gods",name:"Altar of the Gods",bggId:380844,year:2024,designer:"Vasilis Patroulias",
    description:"Players take on the roles of Greek heroes exploring a mythological landscape, collecting offerings and completing rituals to earn the favor of the Olympian gods. The game blends tile placement and set collection as heroes race to build the most impressive altar before the final ceremony.",
    categories:["Strategy","Card Game","Family"],players:"2-5",playTime:"30 min",
    complexity:2.4,bggRating:7.5,spineColor:"#f39c12",boxSize:"md",
    mechanics:["Tile Placement","Set Collection","Hand Management"]},
  185343:{id:"anachrony",name:"Anachrony",bggId:185343,year:2017,designer:"Dávid Turczi, Richard Amann, Viktor Peter",
    description:"In a post-apocalyptic Earth, players lead one of four ideological factions mining resources, constructing buildings, and recruiting workers—even borrowing resources from their own future selves through time travel. The looming impact of a meteorite creates a ticking-clock urgency as factions race to power their exosuits and evacuate survivors.",
    categories:["Strategy","Worker Placement","Euro","Solo"],players:"1-4",playTime:"30-120 min",
    complexity:4.0,bggRating:7.9,spineColor:"#1a252f",boxSize:"lg",
    mechanics:["Worker Placement","Resource Management","Time Travel","Variable Player Powers"]},
  380681:{id:"apex_legends_board_game",name:"Apex Legends: The Board Game",bggId:380681,year:2025,designer:"Thanos Argyris, Michalis Nikolaou",
    description:"Based on the hit battle royale video game, squads of Legends compete across a shrinking map using unique character abilities, weapon loadouts, and tactical positioning to be the last team standing. Players manage action points, loot drops, and ring closures in a dynamic skirmish experience faithful to the source material.",
    categories:["Thematic","Strategy","Area Control"],players:"2-6",playTime:"60-90 min",
    complexity:3.39,bggRating:7.9,spineColor:"#c0392b",boxSize:"lg",
    mechanics:["Variable Player Powers","Area Control","Action Points","Modular Board"]},
  105551:{id:"archipelago",name:"Archipelago",bggId:105551,year:2012,designer:"Christophe Boelinger",
    description:"Players are European powers colonizing a tropical archipelago, exploring islands, harvesting resources, and building markets and cities while managing a restless native population. A semi-cooperative element looms as a shared rebellion track threatens everyone with defeat if the indigenous people revolt.",
    categories:["Strategy","Euro","Area Control","Thematic"],players:"2-5",playTime:"30-240 min",
    complexity:3.74,bggRating:7.3,spineColor:"#16a085",boxSize:"lg",
    mechanics:["Area Control","Worker Placement","Resource Management","Variable Player Powers"]},
  359871:{id:"arcs",name:"Arcs",bggId:359871,year:2024,designer:"Cole Wehrle",
    description:"A sci-fi card-driven game of galactic empire-building where players vie for dominance across a crumbling interstellar civilization through clever card play and political maneuvering. The trick-taking-inspired action system creates cascading turns where seizing initiative forces opponents into reactive spirals.",
    categories:["Strategy","Area Control","Card Game"],players:"2-4",playTime:"60-120 min",
    complexity:3.6,bggRating:8.0,spineColor:"#2c3e50",boxSize:"md",
    mechanics:["Card Drafting","Area Control","Variable Player Powers","Action Points"]},
  359609:{id:"arkham_horror_lcg_revised",name:"Arkham Horror: The Card Game (Revised Edition)",bggId:359609,year:2021,designer:"Nate French, MJ Newman",
    description:"A cooperative Living Card Game set in H.P. Lovecraft's Cthulhu Mythos where investigators build custom decks to explore haunted locations, uncover dark conspiracies, and battle unspeakable horrors. Choices carry lasting consequences across linked campaign scenarios as investigators gain trauma, earn experience, and upgrade their decks between sessions.",
    categories:["Card Game","Co-op","Campaign","Thematic","Adventure"],players:"1-4",playTime:"45-180 min",
    complexity:3.6,bggRating:8.6,spineColor:"#2e4a2e",boxSize:"md",
    mechanics:["Deck Building","Cooperative Play","Campaign","Variable Player Powers"]},
  378574:{id:"ascension_tactics_inferno",name:"Ascension Tactics: Inferno",bggId:378574,year:2025,designer:"Gary Arant, Justin Gary",
    description:"A tactical miniatures game fusing deck-building with skirmish combat, where players draft cards to summon heroes and monsters onto a grid battlefield. Each card purchase strengthens your deck while immediately deploying forces, blending the strategic depth of deckbuilding with dynamic positional combat.",
    categories:["Strategy","Deck Building","Thematic"],players:"1-4",playTime:"45-90 min",
    complexity:2.33,bggRating:8.0,spineColor:"#8e2020",boxSize:"lg",
    mechanics:["Deck Building","Grid Movement","Variable Player Powers","Modular Board"]},
  176544:{id:"automania",name:"Automania",bggId:176544,year:2015,designer:"Kenneth Minde, Kristian Amundsen Østby",
    description:"Players run competing automobile factories, hiring workers to research upgrades, manufacture cars, and satisfy the ever-changing demands of global markets. Worker placement on a shared factory floor creates tense competition for limited spaces while players optimize their production lines for maximum profit.",
    categories:["Strategy","Worker Placement","Euro"],players:"2-4",playTime:"60-90 min",
    complexity:2.7,bggRating:7.3,spineColor:"#e74c3c",boxSize:"md",
    mechanics:["Worker Placement","Resource Management","Set Collection"]},
  3955:{id:"bang",name:"BANG!",bggId:3955,year:2002,designer:"Emiliano Sciarra",
    description:"A hidden role card game set in the Wild West where a Sheriff, Deputies, Outlaws, and a Renegade face off in a chaotic gunfight. Players use distance and character abilities to shoot, heal, and manipulate, with each secret role pursuing conflicting win conditions that create bluffing and paranoia.",
    categories:["Card Game","Party","Thematic"],players:"4-7",playTime:"20-40 min",
    complexity:1.7,bggRating:6.5,spineColor:"#a04000",boxSize:"sm",
    mechanics:["Hand Management","Hidden Roles","Variable Player Powers"]},
  143741:{id:"bang_dice_game",name:"BANG! The Dice Game",bggId:143741,year:2013,designer:"Michael Palm, Lukas Zach",
    description:"A streamlined dice version of the classic BANG! hidden role game, where players roll custom dice to shoot rivals, draw cards, drink beer, and trigger dynamic events. The push-your-luck dice rolling keeps the Wild West chaos alive in a much faster and more accessible format.",
    categories:["Dice","Party","Card Game"],players:"3-8",playTime:"15 min",
    complexity:1.2,bggRating:6.9,spineColor:"#b7950b",boxSize:"sm",
    mechanics:["Dice Rolling","Hidden Roles","Push Your Luck"]},
  344114:{id:"bag_of_chips",name:"Bag of Chips",bggId:344114,year:2021,designer:"Mathieu Aubert, Théo Rivière",
    description:"A light card game where players draw multicolored chip tokens from a bag and bet on which color will score most, then play cards to manipulate the final tally in their favor. Simple rules and quick decisions make it an engaging filler with a satisfying push-your-luck element.",
    categories:["Card Game","Party","Family"],players:"2-5",playTime:"15-20 min",
    complexity:1.2,bggRating:6.4,spineColor:"#e91e63",boxSize:"sm",
    mechanics:["Push Your Luck","Hand Management","Betting"]},
  25417:{id:"battlelore",name:"BattleLore",bggId:25417,year:2006,designer:"Richard Borg",
    description:"A fantasy tactical battle game using the Commands & Colors system, where players command armies of humans, goblins, dwarves, and creatures across historical and mystical battlefields. Lore cards summon powerful creatures and cast spells, adding a magical layer to the classic command card-driven unit maneuvering.",
    categories:["Strategy","Thematic","Area Control"],players:"2-2",playTime:"60 min",
    complexity:2.7,bggRating:7.2,spineColor:"#1565c0",boxSize:"lg",
    mechanics:["Grid Movement","Hand Management","Variable Player Powers","Modular Board"]},
  358504:{id:"betrayal_3rd_edition",name:"Betrayal at House on the Hill: 3rd Edition",bggId:358504,year:2022,designer:"Dave Chalker, Banana Chan, Noah Cohen, Bruce Glassco, Brian Neff, Will Sobel, Jabari Weathers",
    description:"Players explore a haunted mansion room by room, revealing tiles and triggering omens until one player becomes a traitor and unleashes one of dozens of unique horror scenarios. The game splits into a cooperative exploration phase followed by a dramatic asymmetric haunt where the traitor pursues their secret goal against the surviving heroes.",
    categories:["Thematic","Adventure","Co-op"],players:"3-6",playTime:"60 min",
    complexity:2.4,bggRating:7.3,spineColor:"#4a235a",boxSize:"lg",
    mechanics:["Tile Placement","Variable Player Powers","Modular Board","Hidden Roles"]},
  317985:{id:"beyond_the_sun",name:"Beyond the Sun",bggId:317985,year:2020,designer:"Dennis K. Chan",
    description:"Players lead interstellar civilizations competing to develop technologies, colonize star systems, and achieve political dominance in a shared tech tree space opera. Strategic choices about which technologies to advance shape each faction's unique development path while fleets vie for control of planetary systems.",
    categories:["Strategy","Worker Placement","Euro"],players:"2-4",playTime:"60-120 min",
    complexity:3.15,bggRating:7.8,spineColor:"#1a237e",boxSize:"lg",
    mechanics:["Worker Placement","Technology Trees","Area Control","Resource Management"]},
  70:{id:"big_city",name:"Big City",bggId:70,year:1999,designer:"Franz-Benno Delonge",
    description:"Players collaboratively and competitively build a growing metropolis by placing buildings like parks, banks, hotels, and stadiums on a shared city grid. Clever tile placement scores points for adjacency and connectivity, but placing buildings in the wrong order can benefit opponents as much as yourself.",
    categories:["Family","Strategy","Abstract"],players:"2-5",playTime:"60 min",
    complexity:2.22,bggRating:6.8,spineColor:"#546e7a",boxSize:"md",
    mechanics:["Tile Placement","Hand Management","Set Collection"]},
  170216:{id:"blood_rage",name:"Blood Rage",bggId:170216,year:2015,designer:"Eric M. Lang",
    description:"Viking clans draft cards granting powerful saga abilities, then wage war, quest, and pillage across a mythological Norse map as Ragnarok destroys the world province by province. Death is not feared—warriors sent to Valhalla still score glory—making aggression a viable and dramatic path to victory.",
    categories:["Strategy","Thematic","Area Control","Deck Building"],players:"2-4",playTime:"60-90 min",
    complexity:2.9,bggRating:8.0,spineColor:"#922b21",boxSize:"lg",
    mechanics:["Card Drafting","Area Control","Variable Player Powers","Modular Board"]},
  21882:{id:"blue_moon_city",name:"Blue Moon City",bggId:21882,year:2006,designer:"Reiner Knizia",
    description:"Players work together and against each other to reconstruct the ancient city of Blue Moon by contributing colored cards to building sites spread across a modular tile map. Completing buildings earns crystals that are offered to the central Obelisk, and the first player to donate enough offerings claims victory.",
    categories:["Strategy","Card Game","Family"],players:"2-4",playTime:"30-50 min",
    complexity:2.29,bggRating:6.9,spineColor:"#1e88e5",boxSize:"md",
    mechanics:["Hand Management","Tile Placement","Set Collection"]},
  300367:{id:"boomerang_europe",name:"Boomerang: Europe",bggId:300367,year:2020,designer:"Scott Almes",
    description:"Players draft cards depicting European countries and tourist attractions, simultaneously selecting one card to keep and passing the rest, then scoring points from completed sets and collections. The game evokes a whirlwind sightseeing tour with scoring categories for collections, landmarks, and round-trip routes.",
    categories:["Card Game","Family","Puzzle"],players:"2-4",playTime:"15-30 min",
    complexity:1.5,bggRating:6.8,spineColor:"#1565c0",boxSize:"sm",
    mechanics:["Card Drafting","Set Collection","Hand Management"]},
  343905:{id:"boonlake",name:"Boonlake",bggId:343905,year:2021,designer:"Alexander Pfister",
    description:"Players settle an unspoiled wilderness region by claiming land tiles, developing settlements, and fulfilling contracts in a rich multi-layered Euro game. An innovative card-based action system lets players activate sequences of developments, creating powerful chain effects as their personal tableau grows.",
    categories:["Strategy","Euro","Worker Placement"],players:"1-4",playTime:"80-160 min",
    complexity:3.8,bggRating:7.6,spineColor:"#2e7d32",boxSize:"lg",
    mechanics:["Action Chaining","Tile Placement","Resource Management","Variable Player Powers"]},
  337765:{id:"brian_boru",name:"Brian Boru: High King of Ireland",bggId:337765,year:2021,designer:"Peer Sylvester",
    description:"Players vie to become the dominant king in medieval Ireland through a trick-taking card game that drives area control, marriage alliances, and Viking raids. The results of each trick cascade into map influence and scoring bonuses, creating an elegant fusion of card game tactics and strategic board presence.",
    categories:["Strategy","Card Game","Area Control"],players:"3-5",playTime:"60-90 min",
    complexity:2.56,bggRating:7.3,spineColor:"#4e342e",boxSize:"md",
    mechanics:["Trick Taking","Area Control","Hand Management"]},
  172308:{id:"broom_service",name:"Broom Service",bggId:172308,year:2015,designer:"Andreas Pelikan, Alexander Pfister",
    description:"Witches and druids race across an enchanted forest to deliver potions, with players choosing between brave and cowardly versions of their character roles each round. Playing brave grants a stronger action but risks being blocked by opponents who also declare the same role, creating a delightful bluffing and prediction mechanic.",
    categories:["Strategy","Card Game","Family"],players:"2-5",playTime:"30-75 min",
    complexity:2.39,bggRating:7.2,spineColor:"#6a1b9a",boxSize:"md",
    mechanics:["Hand Management","Bluffing","Variable Player Powers","Action Selection"]},
  172081:{id:"burgle_bros",name:"Burgle Bros.",bggId:172081,year:2015,designer:"Tim Fowers",
    description:"A cooperative heist game where a crew of quirky thieves must crack safes on multiple floors of a procedurally generated building while evading patrolling guards. Players coordinate movement, share special abilities, and manage limited tools to pull off the perfect robbery without getting caught.",
    categories:["Co-op","Thematic","Adventure"],players:"1-4",playTime:"45-90 min",
    complexity:2.31,bggRating:7.5,spineColor:"#e65100",boxSize:"md",
    mechanics:["Cooperative Play","Modular Board","Hand Management","Variable Player Powers"]},
  283155:{id:"calico",name:"Calico",bggId:283155,year:2020,designer:"Kevin Russ",
    description:"Players sew a patchwork quilt by placing hexagonal tiles of different colors and patterns, trying to attract cats while fulfilling design goals that score for color groups and pattern sequences. The puzzle of simultaneously satisfying multiple overlapping scoring criteria in a limited grid space creates a meditative and satisfying challenge.",
    categories:["Abstract","Puzzle","Family","Solo"],players:"1-4",playTime:"30-45 min",
    complexity:2.2,bggRating:7.5,spineColor:"#f48fb1",boxSize:"sm",
    mechanics:["Tile Placement","Pattern Building","Hand Management"]},
  290236:{id:"canvas",name:"Canvas",bggId:290236,year:2021,designer:"Jeff Chin, Andrew Nerger",
    description:"Players layer transparent art cards to compose paintings that score points based on the unique symbol combinations visible through the overlapping layers. The striking visual result of each painting and the puzzle of optimizing symbol visibility makes Canvas a deeply satisfying and artistically beautiful experience.",
    categories:["Abstract","Puzzle","Family","Solo"],players:"1-5",playTime:"30 min",
    complexity:1.8,bggRating:7.3,spineColor:"#e8a838",boxSize:"sm",
    mechanics:["Card Drafting","Set Collection","Pattern Building"]},
  171131:{id:"captain_sonar",name:"Captain Sonar",bggId:171131,year:2016,designer:"Roberto Fraga, Yohan Lemonnier",
    description:"Two submarine crews face off in a real-time or turn-based battle, with each player taking a specialized role—captain, first mate, radio operator, or engineer—to track, maneuver, and fire upon the enemy sub. The split roles create exhilarating team communication and deduction as each crew tries to locate and destroy the other before their own systems fail.",
    categories:["Thematic","Deduction","Party"],players:"2-8",playTime:"45-60 min",
    complexity:2.21,bggRating:7.6,spineColor:"#0d47a1",boxSize:"md",
    mechanics:["Real-Time","Deduction","Cooperative Play","Variable Player Powers"]},
  364405:{id:"carcassonne_big_box_7",name:"Carcassonne Big Box 7",bggId:364405,year:2021,designer:"Klaus-Jürgen Wrede",
    description:"The classic tile-laying game bundled with multiple expansions, where players build a medieval landscape of cities, roads, farms, and monasteries by placing tiles and deploying meeple followers to claim features. Competing for the same incomplete features creates constant tension as players decide when to commit their limited followers.",
    categories:["Family","Strategy","Abstract"],players:"2-6",playTime:"35 min",
    complexity:1.96,bggRating:8.2,spineColor:"#795548",boxSize:"xl",
    mechanics:["Tile Placement","Area Control","Hand Management"]},
  295947:{id:"cascadia",name:"Cascadia",bggId:295947,year:2021,designer:"Randy Flynn",
    description:"Players build a Pacific Northwest habitat by drafting terrain tiles and wildlife tokens, creating interconnected ecosystems of forests, rivers, and prairies to score points. Each game uses a different set of wildlife scoring cards, ensuring that optimal placement of bears, salmon, foxes, hawks, and elk changes every session.",
    categories:["Family","Abstract","Puzzle","Solo"],players:"1-4",playTime:"30-45 min",
    complexity:1.8,bggRating:7.9,spineColor:"#388e3c",boxSize:"md",
    mechanics:["Tile Placement","Pattern Building","Set Collection"]},
  345972:{id:"cat_in_the_box",name:"Cat in the Box: Deluxe Edition",bggId:345972,year:2022,designer:"Muneyuki Yokouchi",
    description:"A quantum-physics-themed trick-taking game where cards have no fixed suit—players declare the suit of each card as they play it, placing a token on a shared research board to mark that suit's use. The board creates a secondary puzzle as players risk paradox if the suit they declare is already exhausted.",
    categories:["Card Game","Abstract","Strategy"],players:"2-5",playTime:"20-40 min",
    complexity:2.1,bggRating:7.4,spineColor:"#7b1fa2",boxSize:"sm",
    mechanics:["Trick Taking","Hand Management","Pattern Building"]},
  377449:{id:"chomp",name:"Chomp",bggId:377449,year:2023,designer:"Clarence Simpson",
    description:"A light and colorful card game where players compete to feed their hungry creatures by matching and collecting the tastiest food combinations. Quick turns and accessible rules make it a great family filler with just enough tactical bite in the card management.",
    categories:["Card Game","Family","Party"],players:"1-4",playTime:"20 min",
    complexity:1.6,bggRating:6.7,spineColor:"#f9a825",boxSize:"sm",
    mechanics:["Hand Management","Set Collection","Card Drafting"]},
  300300:{id:"chronicles_of_crime_1400",name:"Chronicles of Crime: 1400",bggId:300300,year:2020,designer:"David Cicurel, Wojciech Grajkowski",
    description:"A cooperative mystery-solving game set in medieval Paris, where players use a companion app to scan cards and investigate crime scenes, interrogate suspects, and piece together clues from the 15th century. The app drives narrative branching and location exploration, blending tactile card play with a rich historical detective story.",
    categories:["Co-op","Adventure","Deduction"],players:"1-4",playTime:"60-90 min",
    complexity:2.0,bggRating:7.8,spineColor:"#4e342e",boxSize:"md",
    mechanics:["Cooperative Play","Deduction","App-Assisted","Variable Outcomes"]},
  201808:{id:"clank_deck_building",name:"Clank!: A Deck-Building Adventure",bggId:201808,year:2016,designer:"Paul Dennen",
    description:"Players are thieves descending into a dragon's dungeon to steal artifacts, building their decks to fight monsters, acquire loot, and navigate the board—but every action risks generating noise (clank) that attracts the dragon's fury. The escalating danger as the dragon bag fills with clank cubes creates mounting tension on every turn.",
    categories:["Deck Building","Adventure","Thematic"],players:"2-4",playTime:"30-60 min",
    complexity:2.3,bggRating:7.9,spineColor:"#6d4c41",boxSize:"md",
    mechanics:["Deck Building","Modular Board","Push Your Luck","Hand Management"]},
  314503:{id:"codex_naturalis",name:"Codex Naturalis",bggId:314503,year:2021,designer:"Thomas Dupont",
    description:"Players build expanding tableaux of illustrated nature cards—depicting plants, animals, fungi, and insects—by overlapping them to cover resource symbols and satisfy scoring objectives. The elegantly simple placement rules give way to a satisfying spatial puzzle of maximizing visible resources and unlocking high-value cards.",
    categories:["Card Game","Abstract","Family"],players:"1-4",playTime:"20-30 min",
    complexity:1.8,bggRating:7.2,spineColor:"#558b2f",boxSize:"sm",
    mechanics:["Tile Placement","Hand Management","Pattern Building","Set Collection"]},
  447850:{id:"colosseum_grand_spectacle",name:"Colosseum: The Grand Spectacle",bggId:447850,year:2026,designer:"Wolfgang Kramer, Markus Lübke",
    description:"Players manage competing Roman entertainment impresarios putting on ever-grander spectacles in the Colosseum, recruiting performers, trading assets, and staging events to draw the largest crowds. Strategic trading, performer management, and timing of star performer appearances create a rich economic competition with theatrical flair.",
    categories:["Strategy","Euro","Family"],players:"1-5",playTime:"60-90 min",
    complexity:2.71,bggRating:7.8,spineColor:"#c09b5a",boxSize:"lg",
    mechanics:["Set Collection","Trading","Resource Management","Variable Player Powers"]},
  158899:{id:"colt_express",name:"Colt Express",bggId:158899,year:2014,designer:"Christophe Raimbault",
    description:"Players are bandits robbing a moving train in the Wild West, programming their actions into a shared deck that resolves in chaotic, unpredictable sequence. The 3D train model serves as the board while bullets, punches, and sudden marshal interventions disrupt even the best-laid plans.",
    categories:["Family","Thematic","Card Game"],players:"2-6",playTime:"40 min",
    complexity:1.9,bggRating:7.1,spineColor:"#bf360c",boxSize:"md",
    mechanics:["Action Programming","Hand Management","Modular Board"]},
  124361:{id:"concordia",name:"Concordia",bggId:124361,year:2013,designer:"Mac Gerdts",
    description:"Players expand a Roman trading empire across the Mediterranean by acquiring colonists, building houses, and purchasing cards that both enable actions and score victory points. The elegant card-driven action system and the dual role of cards as actions and end-game scoring ensures every purchase is a meaningful strategic decision.",
    categories:["Strategy","Euro","Card Game"],players:"2-5",playTime:"100 min",
    complexity:2.9,bggRating:8.0,spineColor:"#b5651d",boxSize:"md",
    mechanics:["Hand Management","Route Building","Resource Management","Engine Building"]},
  39463:{id:"cosmic_encounter",name:"Cosmic Encounter",bggId:39463,year:2008,designer:"Bill Eberle, Jack Kittredge, Bill Norton, Peter Olotka, Kevin Wilson",
    description:"Alien races compete to be the first to establish five colonies in other players' systems, each species wielding a unique and often rule-breaking power that shapes its entire strategy. Negotiation, bluffing, and the ever-present option to ally with attackers or defenders creates explosive diplomatic chaos with every encounter.",
    categories:["Strategy","Thematic","Card Game","Party"],players:"3-5",playTime:"60-120 min",
    complexity:2.58,bggRating:7.4,spineColor:"#6a1b9a",boxSize:"md",
    mechanics:["Variable Player Powers","Negotiation","Hand Management","Bluffing"]},
  377716:{id:"couture",name:"Couture",bggId:377716,year:2023,designer:"Yusuke Sato",
    description:"Players are fashion designers competing to create the most stunning outfits by drafting and layering card elements representing fabrics, colors, and accessories. Scoring rewards both individual garment elegance and stylistic coherence across a complete seasonal collection.",
    categories:["Card Game","Family","Abstract"],players:"3-6",playTime:"20 min",
    complexity:1.84,bggRating:6.8,spineColor:"#e91e63",boxSize:"sm",
    mechanics:["Card Drafting","Set Collection","Hand Management"]},
  8172:{id:"coyote",name:"Coyote",bggId:8172,year:2003,designer:"Spartaco Albertarelli",
    description:"A bluffing game where players hold a card on their forehead—visible to everyone except themselves—and must collectively bid on the total value of all cards in play without seeing their own. Players escalate bids or challenge the current bid, and the combination of hidden information and social deduction creates constant laughs.",
    categories:["Party","Card Game","Deduction"],players:"3-6",playTime:"20-30 min",
    complexity:1.2,bggRating:6.6,spineColor:"#d4ac0d",boxSize:"sm",
    mechanics:["Bluffing","Hidden Information","Bidding"]},
  246784:{id:"cryptid",name:"Cryptid",bggId:246784,year:2018,designer:"Hal Duncan, Ruth Veevers",
    description:"A deduction game where each player holds one secret clue about the habitat of a hidden cryptid. Players take turns questioning each other and placing cubes or discs on the map to logically eliminate possibilities until one player can pinpoint the exact location. Pure logical deduction with no hidden traitor mechanics.",
    categories:["Deduction","Strategy"],players:"3-5",playTime:"30-50 min",
    complexity:2.27,bggRating:7.4,spineColor:"#3a6b4a",boxSize:"md",
    mechanics:["Deduction","Map Deduction"]},
  245476:{id:"cubirds",name:"CuBirds",bggId:245476,year:2018,designer:"Stefan Alexander",
    description:"A card-collecting game where players lay bird cards in rows shared by all players, triggering flock effects to gather cards into their hands. Collect enough birds of a species to add them to your personal collection, and be the first to complete sets of different species. Light and breezy with lovely illustrated bird artwork.",
    categories:["Card Game","Family"],players:"2-5",playTime:"20 min",
    complexity:1.38,bggRating:6.9,spineColor:"#4a9e6b",boxSize:"sm",
    mechanics:["Set Collection","Hand Management"]},
  298069:{id:"cubitos",name:"Cubitos",bggId:298069,year:2021,designer:"John D. Clair",
    description:"A dice-building racing game where players draft and purchase custom dice representing various abilities, then roll them each round to power their runner around the track. Each die face shows different symbols that trigger movement, money, or special powers — but rolling blanks ends your turn early. Tense push-your-luck decisions meet deckbuilding.",
    categories:["Dice","Racing","Engine Building"],players:"2-4",playTime:"30-60 min",
    complexity:2.17,bggRating:7.4,spineColor:"#d45f1a",boxSize:"md",
    mechanics:["Dice Building","Push Your Luck","Racing"]},
  286158:{id:"dei_divide_et_impera",name:"D.E.I.: Divide et Impera",bggId:286158,year:2022,designer:"Tommaso Battista",
    description:"An area control game set in ancient Rome where players expand their influence across territories by deploying legions and managing political alliances. Players balance military conquest with economic development, using action cards to outmaneuver rivals and claim dominance over the Mediterranean world. Strategic depth emerges from the tension between expansion and consolidation.",
    categories:["Area Control","Strategy"],players:"2-4",playTime:"60-90 min",
    complexity:3.17,bggRating:7.5,spineColor:"#8b2020",boxSize:"md",
    mechanics:["Area Control","Hand Management","Variable Player Powers"]},
  8946:{id:"da_vinci_code",name:"Da Vinci Code",bggId:8946,year:2002,designer:"Hiroaki Suzuki, Eiji Wakasugi",
    description:"A deduction game where each player arranges a secret row of numbered tiles in ascending order and opponents must guess their values. On your turn, place a new tile in your row and challenge others to identify it — guess correctly and it stays face-up, guess wrong and you give away free information. Tense bluffing meets logical elimination.",
    categories:["Deduction","Family"],players:"2-4",playTime:"15 min",
    complexity:1.48,bggRating:6.1,spineColor:"#1a1a2e",boxSize:"sm",
    mechanics:["Deduction","Bluffing"]},
  304985:{id:"dark_ages_holy_roman_empire",name:"Dark Ages: Holy Roman Empire",bggId:304985,year:2021,designer:"Adam Kwapiński, Andrei Novac",
    description:"A competitive strategy game set in the turbulent medieval Holy Roman Empire where players build armies, seize territories, and vie for the Imperial Crown. Players recruit followers from a shared pool, manage resources, and engage in tactical battles across a modular board representing medieval Europe. Deep asymmetric factions and shifting political alliances drive the conflict.",
    categories:["Strategy","Area Control","Thematic"],players:"1-4",playTime:"120-180 min",
    complexity:3.4,bggRating:7.8,spineColor:"#5c3d1e",boxSize:"lg",
    mechanics:["Area Control","Variable Player Powers","Hand Management"]},
  225694:{id:"decrypto",name:"Decrypto",bggId:225694,year:2018,designer:"Thomas Dagenais-Lespérance",
    description:"A team word game where each side must transmit a secret code using clue words, but cannot be too obvious or the opposing team will intercept. Over multiple rounds, both teams accumulate knowledge of the other's keywords, creating escalating tension as giving vague clues risks your own team misunderstanding. Clever wordplay and strategic misdirection in one.",
    categories:["Party","Card Game"],players:"3-8",playTime:"15-45 min",
    complexity:1.8,bggRating:7.7,spineColor:"#1a4a6b",boxSize:"sm",
    mechanics:["Team-Based Game","Clue Giving","Pattern Recognition"]},
  285192:{id:"destinies",name:"Destinies",bggId:285192,year:2021,designer:"Michał Gołąb Gołębiowski, Filip Miłuński",
    description:"An app-driven competitive adventure game where players explore a richly detailed medieval world pursuing their own hidden quests. The companion app serves as the game master, tracking your choices and dynamically responding to your actions with narrative outcomes. Each scenario tells a branching story through investigation, combat, and moral decisions.",
    categories:["Thematic","Adventure","Solo"],players:"1-3",playTime:"90-150 min",
    complexity:1.92,bggRating:7.6,spineColor:"#3d2a5e",boxSize:"lg",
    mechanics:["App-Driven","Storytelling","Variable Player Powers"]},
  218121:{id:"dice_hospital",name:"Dice Hospital",bggId:218121,year:2018,designer:"Stan Kordonskiy, Mike Nudd",
    description:"A worker placement game where players run competing hospitals, admitting patients represented by dice and treating them to raise their pip values before discharging them for points. Specialized wards and staff cards give different abilities for manipulating dice, and new patients arrive each round adding urgent triage decisions. Clever thematic integration of dice as patients with clever euro mechanics.",
    categories:["Worker Placement","Dice","Strategy"],players:"1-4",playTime:"45-90 min",
    complexity:2.34,bggRating:7.1,spineColor:"#2a7a9e",boxSize:"md",
    mechanics:["Worker Placement","Dice Manipulation","Set Collection"]},
  256382:{id:"disney_villainous",name:"Disney Villainous",bggId:256382,year:2018,designer:"Aaron Donogh, Prospero Hall, Brian Kirk",
    description:"An asymmetric strategy game where each player takes on the role of a classic Disney villain with a unique board, card deck, and victory condition. Players move between locations to perform actions like playing cards, gaining power, and advancing their own nefarious scheme while playing fate cards to hinder opponents. A thematic showcase of beloved villains with surprising strategic depth.",
    categories:["Strategy","Thematic","Family"],players:"2-6",playTime:"45-120 min",
    complexity:2.48,bggRating:6.9,spineColor:"#2a1a5e",boxSize:"md",
    mechanics:["Variable Player Powers","Hand Management","Asymmetric Game"]},
  39856:{id:"dixit",name:"Dixit",bggId:39856,year:2008,designer:"Jean-Louis Roubira",
    description:"A storytelling game where players give a clue — a word, phrase, sound, or song — for one of their beautifully illustrated cards, then others secretly choose which of their own cards best matches. Points go to the clue-giver only if some but not all players identify the right card, rewarding creativity over obviousness. Dreamy surrealist artwork drives this gentle party gem.",
    categories:["Party","Card Game","Family"],players:"3-6",playTime:"30 min",
    complexity:1.12,bggRating:7.3,spineColor:"#7a4a9e",boxSize:"md",
    mechanics:["Storytelling","Voting","Hand Management"]},
  397598:{id:"dune_imperium_uprising",name:"Dune: Imperium – Uprising",bggId:397598,year:2023,designer:"Paul Dennen",
    description:"An expanded standalone deck-building worker placement game set in the Dune universe, introducing six-player support, a new Maker mechanic for riding sandworms, and two-sided board with new locations. Players send agents to contested locations while building their intrigue deck, balancing military strength with political maneuvering for control of Arrakis. More factions, more betrayal, and deeper strategic options than the original.",
    categories:["Deck Building","Worker Placement","Strategy"],players:"1-6",playTime:"60-120 min",
    complexity:3.53,bggRating:8.7,spineColor:"#c8761a",boxSize:"lg",
    mechanics:["Deck Building","Worker Placement","Area Control"]},
  210232:{id:"dungeon_degenerates_hand_of_doom",name:"Dungeon Degenerates: Hand of Doom",bggId:210232,year:2017,designer:"Eric Radey",
    description:"A cooperative sandbox adventure through a gritty, darkly humorous fantasy world where players travel between locations completing quests and battling bizarre monsters. The game features an enormous illustrated event deck and a sandbox map crawl dripping with pulp horror aesthetic and counterculture art. Variable scenario lengths and a sprawling encounter system make each playthrough feel chaotic and unpredictable.",
    categories:["Co-op","Thematic","Adventure","Campaign"],players:"1-4",playTime:"30-360 min",
    complexity:3.64,bggRating:8.0,spineColor:"#3a1a0a",boxSize:"lg",
    mechanics:["Cooperative Game","Sandbox","Storytelling"]},
  320097:{id:"eck_solo_trick_taking",name:"ECK: A solo trick-taking card game",bggId:320097,year:2020,designer:"John Burton",
    description:"A solo trick-taking puzzle where a single player competes against a simulated opponent governed by a simple algorithmic ruleset, trying to win a precise number of tricks across multiple hands. The challenge lies in reading the automa's predictable behavior and exploiting it just enough to hit your exact target — no more, no less. A clever rethinking of trick-taking conventions for one.",
    categories:["Solo","Card Game","Puzzle"],players:"1-1",playTime:"15-30 min",
    complexity:1.38,bggRating:6.3,spineColor:"#2a4a2a",boxSize:"sm",
    mechanics:["Trick-Taking","Solo / Solitaire Game"]},
  342900:{id:"earthborne_rangers",name:"Earthborne Rangers",bggId:342900,year:2023,designer:"Andrew Fischer, Brooks Flugaur-Leavitt, Andrew Navaro, Adam Sadler, Brady Sadler",
    description:"A cooperative card-driven campaign game set in a far-future wilderness where players are rangers protecting the natural world from encroaching industrial threats. Each player builds a personal deck over the campaign, exploring modular terrain tiles, uncovering narrative events, and managing stamina and resources in a richly detailed ecological setting. Expansive campaign length and deep character customization reward long-term investment.",
    categories:["Co-op","Campaign","Deck Building","Adventure"],players:"1-4",playTime:"60-240 min",
    complexity:3.48,bggRating:8.1,spineColor:"#2d5c3a",boxSize:"lg",
    mechanics:["Deck Building","Cooperative Game","Campaign / Legacy"]},
  246900:{id:"eclipse_second_dawn",name:"Eclipse: Second Dawn for the Galaxy",bggId:246900,year:2020,designer:"Touko Tahkokallio",
    description:"A grand 4X space epic where players expand their civilization across a hex-tile galaxy, researching technologies, building fleets, and fighting for control of rare resource sectors. The game balances economic engine-building with sudden tactical fleet combat, and a traitor-free diplomatic system creates tense negotiations. The revised second edition streamlines rules and updates components dramatically.",
    categories:["Strategy","Area Control","Euro"],players:"2-6",playTime:"60-200 min",
    complexity:3.67,bggRating:8.4,spineColor:"#0d1a3a",boxSize:"xl",
    mechanics:["Area Control","Technology Trees","Variable Player Powers"]},
  218509:{id:"empires_of_the_void_ii",name:"Empires of the Void II",bggId:218509,year:2018,designer:"Ryan Laukat",
    description:"A 4X space exploration and conquest game with rich narrative flavor where players spread across a galaxy of alien worlds, each with unique traits and inhabitants to ally with or subjugate. Players build their empire's military, technology, and political influence while encountering event cards and story beats that give the game a storybook quality. Laukat's distinctive illustrated art style brings a whimsical edge to a crunchy strategy game.",
    categories:["Strategy","Area Control","Thematic"],players:"2-5",playTime:"90-180 min",
    complexity:3.5,bggRating:7.4,spineColor:"#1a2a5e",boxSize:"lg",
    mechanics:["Area Control","Variable Player Powers","Hand Management"]},
  233398:{id:"endeavor_age_of_sail",name:"Endeavor: Age of Sail",bggId:233398,year:2018,designer:"Carl de Visser, Jarratt Gray",
    description:"A streamlined euro game of exploration and colonialism where players build up attributes — industry, culture, finance, and influence — to open new sea routes and occupy cities across a world map. Buildings placed in your home city grant recurring actions while tokens placed on the board earn end-game points and special abilities. Elegant action selection and tight resource interplay reward careful planning.",
    categories:["Euro","Strategy","Area Control"],players:"2-5",playTime:"60-90 min",
    complexity:2.72,bggRating:7.8,spineColor:"#1a4a6b",boxSize:"md",
    mechanics:["Area Control","Variable Phase Order","Engine Building"]},
  142379:{id:"escape_plan",name:"Escape Plan",bggId:142379,year:2019,designer:"Vital Lacerda",
    description:"A competitive heist game where players are criminals who just robbed a bank and must escape the city before the police lock it down entirely. Each turn the city loses more exit points and accessible zones as a modular tension track advances, forcing players to decide when to cash out their loot and flee. Lacerda's signature interlocking action systems create a tense puzzle of diminishing options.",
    categories:["Strategy","Euro","Thematic"],players:"1-5",playTime:"60-120 min",
    complexity:3.68,bggRating:7.5,spineColor:"#1a1a1a",boxSize:"lg",
    mechanics:["Variable Phase Order","Network Building","Modular Board"]},
  280794:{id:"etherfields",name:"Etherfields",bggId:280794,year:2020,designer:"Michał Oracz",
    description:"A cooperative campaign game set in a dreamlike world where players take on the roles of dreamers navigating surreal landscapes filled with strange creatures and cryptic puzzles. Actions are powered by cards played from a shared hand, and the game's dream logic means narrative surprises can fundamentally alter how mechanics work from scenario to scenario. Hauntingly beautiful miniatures and deeply atmospheric art define the experience.",
    categories:["Co-op","Campaign","Thematic","Adventure"],players:"1-4",playTime:"90-180 min",
    complexity:3.59,bggRating:7.8,spineColor:"#2d1a5e",boxSize:"xl",
    mechanics:["Cooperative Game","Campaign / Legacy","Hand Management"]},
  172225:{id:"exploding_kittens",name:"Exploding Kittens",bggId:172225,year:2015,designer:"Matthew Inman, Elan Lee, Shane Small",
    description:"A fast card game of kitty-powered Russian roulette where players draw cards hoping to avoid the dreaded Exploding Kitten card. A hand full of action cards lets you skip draws, peek at the deck, shuffle, steal, or force others to take their turn — all to ensure someone else blows up first. Absurdist humor and quick plays make it a go-to party opener.",
    categories:["Party","Card Game","Family"],players:"2-5",playTime:"15 min",
    complexity:1.07,bggRating:6.1,spineColor:"#e8a020",boxSize:"sm",
    mechanics:["Hand Management","Take That","Press Your Luck"]},
  171273:{id:"fuse",name:"FUSE",bggId:171273,year:2015,designer:"Kane Klenko",
    description:"A real-time cooperative game where players race against a 10-minute timer to defuse a series of bombs by placing dice matching specific color and number requirements on bomb cards. All players roll their dice simultaneously each round and must quickly negotiate who places which die where — every second counts. Frantic, loud, and enormously replayable with increasing difficulty options.",
    categories:["Co-op","Dice","Party"],players:"1-5",playTime:"10 min",
    complexity:1.63,bggRating:7.0,spineColor:"#c0392b",boxSize:"sm",
    mechanics:["Cooperative Game","Real-Time","Dice Rolling"]},
  223040:{id:"fantasy_realms",name:"Fantasy Realms",bggId:223040,year:2017,designer:"Bruce Glassco",
    description:"A hand-optimization card game where players draft cards from a central tableau to build a hand of exactly seven cards, maximizing the synergistic bonuses and penalties between them. Every card has a scoring rule that interacts with other cards in your hand — royals boost armies, wizards negate dragons, floods wipe out lands. A single game plays in 20 minutes but produces remarkably surprising combinations.",
    categories:["Card Game","Strategy"],players:"2-6",playTime:"20 min",
    complexity:1.75,bggRating:7.5,spineColor:"#4a2a6b",boxSize:"sm",
    mechanics:["Hand Management","Set Collection","Card Drafting"]},
  385761:{id:"faraway",name:"Faraway",bggId:385761,year:2023,designer:"Johannes Goupy, Corentin Lebrat",
    description:"A card drafting game where players journey into an unexplored land by playing region cards one at a time, then score sanctuary cards in reverse order of play — meaning your first choices are scored last. This unusual scoring twist demands you think backward from the destination to the starting point. Simple rules mask a deeply puzzly optimization challenge.",
    categories:["Card Game","Strategy","Puzzle"],players:"2-6",playTime:"25 min",
    complexity:1.8,bggRating:7.4,spineColor:"#6b9e4a",boxSize:"sm",
    mechanics:["Card Drafting","Hand Management","Set Collection"]},
  347703:{id:"first_rat",name:"First Rat",bggId:347703,year:2022,designer:"Gabriele Ausiello, Virginio Gigli",
    description:"A family racing game where players move their colony of rats along a track toward a rocket ship, collecting resources and building shortcuts to accelerate their journey. The path is shared by all, and positioning determines what resources you can collect, creating meaningful interaction without direct conflict. Charming artwork and accessible rules make it equally enjoyable for families and hobby gamers.",
    categories:["Racing","Family","Euro"],players:"1-5",playTime:"30-75 min",
    complexity:2.27,bggRating:7.5,spineColor:"#c8a020",boxSize:"md",
    mechanics:["Racing","Network Building","Set Collection"]},
  157354:{id:"five_tribes",name:"Five Tribes",bggId:157354,year:2014,designer:"Bruno Cathala",
    description:"A mancala-inspired euro game set in the Arabian Nights world of Naqala where players move colored meeples across a grid of tiles, claiming locations by ending a move on a tile whose last meeple matches its color. The five tribes each grant unique powers — assassins eliminate meeples, merchants generate gold, builders score tiles — and turn order is bid for each round. A brilliant blend of area control and hand-feel puzzle.",
    categories:["Euro","Strategy","Area Control"],players:"2-4",playTime:"40-80 min",
    complexity:2.76,bggRating:7.7,spineColor:"#c8761a",boxSize:"md",
    mechanics:["Mancala","Area Control","Bidding"]},
  245961:{id:"fleet_dice_game",name:"Fleet: The Dice Game",bggId:245961,year:2018,designer:"Ben Pinchback, Matt Riddle",
    description:"A press-your-luck dice game of deep-sea fishing where players roll and assign dice to launch boats, catch fish, and process their haul for points. Licensing different boat types unlocks new dice symbols and chain-reaction bonuses, building a personal tableau engine over the course of the game. Satisfying escalation as your fishing fleet grows more capable each round.",
    categories:["Dice","Engine Building","Solo"],players:"1-4",playTime:"30-45 min",
    complexity:2.5,bggRating:7.6,spineColor:"#1a5e8b",boxSize:"sm",
    mechanics:["Dice Rolling","Push Your Luck","Engine Building"]},
  175155:{id:"forbidden_stars",name:"Forbidden Stars",bggId:175155,year:2015,designer:"Samuel Bailey, James Kniffen, Corey Konieczka",
    description:"A Warhammer 40,000 strategic conquest game where players command Space Marines, Orks, Eldar, or Chaos Marines competing to retrieve ancient objective tokens scattered across a modular star system. Orders are placed simultaneously on planets using stacking order tokens that resolve in layered priority, creating deep bluffing and read-your-opponent gameplay. Intricate combat resolution and rich faction asymmetry reward deep study.",
    categories:["Strategy","Area Control","Thematic"],players:"2-4",playTime:"120-180 min",
    complexity:3.7,bggRating:8.1,spineColor:"#1a0a2a",boxSize:"xl",
    mechanics:["Area Control","Simultaneous Action Selection","Variable Player Powers"]},
  30334:{id:"fort_boyard",name:"Fort Boyard",bggId:30334,year:1998,designer:"(Uncredited)",
    description:"A family game based on the French television adventure show of the same name where players send their team on challenges across the famous fort to collect keys and earn the final treasure code. Largely luck-driven mini-challenges and card draws replicate the chaotic game-show energy of the original program. A nostalgic curiosity piece for fans of the beloved European TV franchise.",
    categories:["Family","Party","Thematic"],players:"2-6",playTime:"45 min",
    complexity:1.0,bggRating:5.0,spineColor:"#c8a020",boxSize:"md",
    mechanics:["Variable Player Powers","Hand Management","Push Your Luck"]},
  284189:{id:"foundations_of_rome",name:"Foundations of Rome",bggId:284189,year:2022,designer:"Emerson Matsuuchi",
    description:"A city-building game where players purchase land plots in an ever-growing ancient Rome and construct residences, shops, and grand monuments to score income and prestige. The shared city board means every building placement directly impacts what neighboring opponents can build, turning spatial competition into a delicious puzzle. Stunning production with detailed miniature buildings brings the city to life visually.",
    categories:["Strategy","Euro","Family"],players:"1-5",playTime:"60-90 min",
    complexity:2.02,bggRating:8.0,spineColor:"#c87840",boxSize:"xl",
    mechanics:["Area Control","Network Building","Income"]},
  370581:{id:"fractured_sky",name:"Fractured Sky",bggId:370581,year:2024,designer:"Max Anderson, Zac Dixon, Austin Harrison",
    description:"A competitive strategy game where players command factions vying for dominance across a world of floating islands, deploying airships and units to capture territory and control powerful sky rifts. Resource management, area control, and asymmetric faction powers combine in a layered conflict over a modular board that changes with each setup. Dynamic momentum swings reward aggressive tactical play.",
    categories:["Strategy","Area Control","Thematic"],players:"1-5",playTime:"45-75 min",
    complexity:2.37,bggRating:7.5,spineColor:"#3a6b9e",boxSize:"lg",
    mechanics:["Area Control","Variable Player Powers","Modular Board"]},
  140603:{id:"francis_drake",name:"Francis Drake",bggId:140603,year:2013,designer:"Peter Hawes",
    description:"A simultaneous action selection and pickup-and-deliver game where players outfit their ships in Plymouth's harbor before setting sail on a shared Caribbean adventure. In the harbor phase, players race to claim limited supplies and crew from a shared track using hidden planning; at sea, they visit ports, attack enemies, and race home with their plunder. Elegant dual-phase structure creates high tension in both halves.",
    categories:["Strategy","Euro","Adventure"],players:"3-5",playTime:"90-120 min",
    complexity:2.86,bggRating:7.3,spineColor:"#1a4a2a",boxSize:"lg",
    mechanics:["Simultaneous Action Selection","Pick-up and Deliver","Racing"]},
  43570:{id:"friday",name:"Friday",bggId:43570,year:2011,designer:"Friedemann Friese",
    description:"A solo deck-building survival game where you play as Friday helping Robinson Crusoe battle the hazards of a tropical island and grow strong enough to defeat the pirates who arrive at the game's end. Each failed encounter forces you to age Robinson's deck with useless aging cards, while successful fights let you absorb powerful hazard cards as skills. A cleverly designed solo puzzle with escalating pressure.",
    categories:["Solo","Deck Building","Card Game"],players:"1-1",playTime:"25 min",
    complexity:2.16,bggRating:7.1,spineColor:"#2d7a3a",boxSize:"sm",
    mechanics:["Deck Building","Solo / Solitaire Game","Hand Management"]},
  384213:{id:"fromage",name:"Fromage",bggId:384213,year:2024,designer:"Matthew OMalley, Ben Rosset",
    description:"A card-drafting and set-collection game themed around artisanal cheese-making where players select cheese wheels and pairings to build a scoring tableau. Each card scores differently depending on adjacent cards and fulfilled conditions, rewarding careful arrangement over simple accumulation. Delightfully flavorful theme is matched by satisfying puzzle-like card placement decisions.",
    categories:["Card Game","Strategy","Puzzle"],players:"1-4",playTime:"30-45 min",
    complexity:2.37,bggRating:7.7,spineColor:"#e0c050",boxSize:"sm",
    mechanics:["Card Drafting","Set Collection","Tableau Building"]},
  318084:{id:"furnace",name:"Furnace",bggId:318084,year:2020,designer:"Ivan Lashin",
    description:"An industrial engine-building game set in the steam age where players bid on company cards to build their industrial empire, then use their acquired companies to process resources into goods and goods into points. The clever bidding mechanism means that outbid players receive compensation tokens to power their existing engines, ensuring no turn is ever wasted. A tight, satisfying euro with minimal downtime.",
    categories:["Euro","Engine Building","Strategy"],players:"2-4",playTime:"30-60 min",
    complexity:2.35,bggRating:7.4,spineColor:"#8b3a1a",boxSize:"sm",
    mechanics:["Auction / Bidding","Engine Building","Commodity Speculation"]},
  336794:{id:"galaxy_trucker",name:"Galaxy Trucker",bggId:336794,year:2021,designer:"Vlaada Chvátil",
    description:"A chaotic ship-building and space-trucking race where players frantically grab tiles in real time to assemble their spacecraft before launching into a shared adventure deck full of meteors, pirates, and slavers trying to demolish everything you built. The faster you finish building, the earlier you depart — but a rushed ship falls apart spectacularly under fire. Hilarious entropy as lovingly built ships disintegrate piece by piece.",
    categories:["Racing","Family","Thematic"],players:"2-4",playTime:"20-30 min",
    complexity:2.24,bggRating:7.4,spineColor:"#1a3a6b",boxSize:"md",
    mechanics:["Real-Time","Modular Board","Racing"]},
  204837:{id:"game_of_thrones_iron_throne",name:"Game of Thrones: The Iron Throne",bggId:204837,year:2016,designer:"Bill Eberle, Justin Kemppainen, Peter Olotka, Greg Olotka",
    description:"A negotiation and betrayal game set in the HBO Game of Thrones universe where players represent the great houses competing for dominance of the Seven Kingdoms through shifting alliances and backstabbing deals. Players make and break promises freely as they maneuver characters to claim objectives, with the Iron Throne offering powerful abilities to whoever holds it. Unabashedly political with constant table talk and treachery.",
    categories:["Thematic","Strategy","Party"],players:"3-5",playTime:"30-60 min",
    complexity:2.7,bggRating:6.8,spineColor:"#1a1a1a",boxSize:"md",
    mechanics:["Negotiation","Variable Player Powers","Area Control"]},
  265188:{id:"glen_more_ii_chronicles",name:"Glen More II: Chronicles",bggId:265188,year:2019,designer:"Matthias Cramer",
    description:"A tile-drafting and area-expansion euro game set in the Scottish Highlands where players build their clan's estate by acquiring land tiles representing villages, pastures, lochs, and whisky distilleries. Players move a shared market pawn to select tiles, meaning going further ahead for a better tile lets opponents take more turns. Modular chronicle cards introduce new rules that make each game distinctly different.",
    categories:["Euro","Strategy","Engine Building"],players:"2-4",playTime:"90-120 min",
    complexity:2.9,bggRating:7.8,spineColor:"#2d5c2d",boxSize:"lg",
    mechanics:["Tile Placement","Variable Phase Order","Engine Building"]},
  393672:{id:"gloomhaven_buttons_and_bugs",name:"Gloomhaven: Buttons & Bugs",bggId:393672,year:2024,designer:"Joe Klipfel, Nikki Valens",
    description:"A tiny solo adaptation of Gloomhaven where you play a miniaturized mercenary battling insects and household hazards across a grid-based dungeon on a deck of cards. The core Gloomhaven card-play system — choosing two cards each round for top and bottom actions — is faithfully preserved in a remarkably compact format. A surprisingly deep dungeon crawl that fits in your pocket.",
    categories:["Solo","Co-op","Card Game","Adventure"],players:"1-1",playTime:"20 min",
    complexity:3.32,bggRating:7.5,spineColor:"#3a5a2a",boxSize:"sm",
    mechanics:["Hand Management","Cooperative Game","Grid Movement"]},
  250337:{id:"gloomhaven_forgotten_circles",name:"Gloomhaven: Forgotten Circles",bggId:250337,year:2019,designer:"Isaac Childres, Marcel Dragomir",
    description:"An expansion campaign for Gloomhaven featuring a new Aesther Diviner character class and a story that ties into the lore of the mysterious Gloom itself. Players work through a series of new scenarios with revised puzzle elements and level designs that challenge experienced Gloomhaven veterans. Introduces circles as interactive map elements that add new tactical dimensions to combat.",
    categories:["Co-op","Campaign","Thematic","Adventure"],players:"1-4",playTime:"60-120 min",
    complexity:4.3,bggRating:7.7,spineColor:"#2a3a5e",boxSize:"md",
    mechanics:["Cooperative Game","Campaign / Legacy","Hand Management"]},
  291457:{id:"gloomhaven_jaws_of_the_lion",name:"Gloomhaven: Jaws of the Lion",bggId:291457,year:2020,designer:"Isaac Childres",
    description:"A streamlined standalone entry point into the Gloomhaven universe where four new mercenaries investigate the sinister Vermling cult in a 25-scenario campaign. The box includes simplified setup with dungeon books replacing map tiles, and a tutorial-style first few scenarios that gradually introduce the deep card-management combat system. Excellent value and accessibility make it the best Gloomhaven starting point.",
    categories:["Co-op","Campaign","Thematic","Adventure"],players:"1-4",playTime:"30-120 min",
    complexity:3.6,bggRating:8.3,spineColor:"#4a2a1a",boxSize:"lg",
    mechanics:["Cooperative Game","Campaign / Legacy","Hand Management"]},
  182874:{id:"grand_austria_hotel",name:"Grand Austria Hotel",bggId:182874,year:2015,designer:"Virginio Gigli, Simone Luciani",
    description:"A worker placement and dice manipulation euro game set in early 20th century Vienna where players run competing hotels, preparing food and drink for guests and fulfilling their demanding requirements to earn points and imperial patronage. Each round a dice pool is rolled, and players take actions based on die face values — lower numbers give more workers, higher values indicate fewer pieces of that type to grab. Elegant tension between the dice economy and guest demands.",
    categories:["Euro","Strategy","Worker Placement","Dice"],players:"2-4",playTime:"60-120 min",
    complexity:3.04,bggRating:8.0,spineColor:"#8b1a2a",boxSize:"md",
    mechanics:["Dice Manipulation","Worker Placement","Hand Management"]},
  380607:{id:"great_western_trail_new_zealand",name:"Great Western Trail: New Zealand",bggId:380607,year:2023,designer:"Alexander Pfister",
    description:"A standalone reimplementation of Great Western Trail set in New Zealand where players drive sheep instead of cattle, navigating a new map with distinctive terrain and updated mechanics. Players build their personal trail network, hire skilled workers, and deliver livestock to Auckland via routes that interact with opponents' trails in new ways. Fresh setting and refined mechanics offer familiar depth with new strategic wrinkles.",
    categories:["Euro","Strategy","Engine Building"],players:"1-4",playTime:"75-150 min",
    complexity:3.99,bggRating:8.4,spineColor:"#3a7a3a",boxSize:"lg",
    mechanics:["Network Building","Hand Management","Engine Building"]},
  250458:{id:"gugong",name:"Gùgōng",bggId:250458,year:2018,designer:"Andreas Steding",
    description:"A worker placement game set in the Forbidden City of imperial China where players send servants to exchange gifts with officials, gaining favors and influence by giving higher-value cards than those they receive. The gift exchange mechanism ensures cards continuously cycle through the game, creating meaningful card management decisions alongside classic worker placement competition. Elegant theme integration and tight action economy reward careful planning.",
    categories:["Euro","Strategy","Worker Placement"],players:"1-5",playTime:"60-90 min",
    complexity:3.08,bggRating:7.4,spineColor:"#c82020",boxSize:"md",
    mechanics:["Worker Placement","Hand Management","Variable Player Powers"]},
  214484:{id:"hexplore_it_valley",name:"HEXplore It: The Valley of the Dead King",bggId:214484,year:2017,designer:"Kat Kimoundri, Nathan Loos, Jonathan Mariucci",
    description:"A cooperative hex-based adventure game set in a dark fantasy world where players build heroes and explore a modular board filled with monsters, dungeons, and deadly encounters. Players level up their characters by combining role cards, collecting items, and growing stronger to ultimately challenge the Dead King.",
    categories:["Co-op","Adventure","Thematic"],players:"1-6",playTime:"60-180 min",
    complexity:3.2,bggRating:7.8,spineColor:"#3a1a4a",boxSize:"lg",
    mechanics:["Cooperative Game","Modular Board","Role Playing","Variable Player Powers"]},
  371688:{id:"huang",name:"HUANG",bggId:371688,year:2024,designer:"Reiner Knizia",
    description:"An abstract area-control game set in ancient China where players compete to dominate provinces along the Yellow River. Players place tiles to claim regions, balancing expansion with defensive positioning as the river's course shifts the value of territories.",
    categories:["Abstract","Area Control","Strategy"],players:"2-4",playTime:"90 min",
    complexity:3.07,bggRating:7.9,spineColor:"#c8860a",boxSize:"md",
    mechanics:["Area Majority / Influence","Tile Placement","Hand Management"]},
  276086:{id:"hamlet_village_building",name:"Hamlet: The Village Building Game",bggId:276086,year:2022,designer:"David Chircop",
    description:"Players cooperate to grow a small hamlet into a thriving village by placing buildings and connecting roads across a modular hex board. Resources are transported along paths between buildings, and players must efficiently route goods to complete construction projects before time runs out.",
    categories:["Euro","Strategy","Co-op"],players:"1-4",playTime:"25-100 min",
    complexity:2.8,bggRating:6.8,spineColor:"#5a7a3a",boxSize:"md",
    mechanics:["Cooperative Game","Network and Route Building","Tile Placement","Resource Management"]},
  98778:{id:"hanabi",name:"Hanabi",bggId:98778,year:2010,designer:"Antoine Bauza",
    description:"A cooperative card game where players hold their hands facing outward so only their teammates can see their cards. Using carefully worded clues, players work together to play numbered fireworks cards in the correct sequence without ever seeing their own hand.",
    categories:["Co-op","Card Game","Party"],players:"2-5",playTime:"25 min",
    complexity:1.8,bggRating:7.0,spineColor:"#c0392b",boxSize:"sm",
    mechanics:["Cooperative Game","Hand Management","Communication Limits"]},
  158600:{id:"hanamikoji",name:"Hanamikoji",bggId:158600,year:2013,designer:"Kota Nakayama",
    description:"A two-player card game of subtle negotiation set in the world of Japanese geisha, where players compete to earn the favor of seven geisha by placing gifts along a central street. Each round players must choose four actions exactly once, including secretly discarding cards and offering the opponent a choice of sets.",
    categories:["Card Game","Strategy","Abstract"],players:"2-2",playTime:"15 min",
    complexity:1.8,bggRating:7.4,spineColor:"#b03060",boxSize:"sm",
    mechanics:["Hand Management","Set Collection","Simultaneous Action Selection"]},
  199042:{id:"harry_potter_hogwarts_battle",name:"Harry Potter: Hogwarts Battle",bggId:199042,year:2016,designer:"Sean Fletcher, Forrest-Pruzan Creative, Kami Mandell, Andrew Wolf",
    description:"A cooperative deck-building game that follows the story of all seven Harry Potter books, with each chapter introducing new cards, villains, and mechanics into the box. Players build their decks by acquiring spells, items, and allies to push back Dark Arts cards and defeat villains before Hogwarts locations fall.",
    categories:["Co-op","Deck Building","Thematic"],players:"2-4",playTime:"30-60 min",
    complexity:2.0,bggRating:7.3,spineColor:"#5c1a1a",boxSize:"lg",
    mechanics:["Cooperative Game","Deck Construction","Hand Management","Variable Set-up"]},
  366013:{id:"heat_pedal_to_metal",name:"Heat: Pedal to the Metal",bggId:366013,year:2022,designer:"Asger Aleksandrov Granerud, Daniel Skjold Pedersen",
    description:"A racing game that uses hand management to simulate the push and pull of high-speed driving, where players must manage heat cards that accumulate in their deck when pushing too hard on straights or failing to brake for corners. The risk of crossing the finish line with too much heat creates thrilling last-lap decisions.",
    categories:["Racing","Card Game","Family"],players:"1-6",playTime:"30-60 min",
    complexity:2.2,bggRating:7.9,spineColor:"#c0392b",boxSize:"lg",
    mechanics:["Hand Management","Push Your Luck","Race","Variable Player Powers"]},
  355326:{id:"heroes_might_magic_3",name:"Heroes of Might & Magic III: The Board Game",bggId:355326,year:2024,designer:"Kamil Białkowski, Jakub S. Olekszyk",
    description:"A faithful adaptation of the beloved PC strategy classic, where players command heroes exploring a fantasy world, recruiting creature stacks and capturing resource mines. Turn-based combat occurs on a grid battlefield when armies meet, recreating the iconic hex-combat system of the original game.",
    categories:["Strategy","Thematic","Area Control"],players:"1-3",playTime:"90-120 min",
    complexity:3.5,bggRating:7.7,spineColor:"#2e4a1e",boxSize:"xl",
    mechanics:["Area Majority / Influence","Grid Movement","Modular Board","Variable Player Powers"]},
  448713:{id:"heroes_shire_light_shadow",name:"Heroes of the Shire: Light & Shadow",bggId:448713,year:2026,designer:"Damian Senior",
    description:"A cooperative adventure game set in a Tolkien-inspired world where players take on the roles of hobbit heroes defending the Shire from encroaching darkness. Players explore modular tiles, manage limited resources, and face escalating shadow threats in a campaign-style narrative adventure.",
    categories:["Co-op","Adventure","Thematic"],players:"1-6",playTime:"30-180 min",
    complexity:2.8,bggRating:7.5,spineColor:"#3a5a2a",boxSize:"lg",
    mechanics:["Cooperative Game","Modular Board","Variable Player Powers","Campaign / Legacy"]},
  304847:{id:"hidden_games_new_haven",name:"Hidden Games Crime Scene: The New Haven Case",bggId:304847,year:2019,designer:"",
    description:"A real crime-scene investigation game where players examine physical evidence cards, photographs, and documents to solve an authentic unsolved case. Players piece together clues, research leads online, and submit their conclusions through a website to receive feedback on their detective work.",
    categories:["Co-op","Deduction","Puzzle"],players:"1-6",playTime:"90-180 min",
    complexity:2.43,bggRating:8.0,spineColor:"#2a2a3a",boxSize:"sm",
    mechanics:["Cooperative Game","Deduction","Storytelling"]},
  254888:{id:"high_rise",name:"High Rise",bggId:254888,year:2020,designer:"Gil Hova",
    description:"A cutthroat city-building game where players construct skyscrapers across a Manhattan-inspired grid, competing to have the tallest buildings in as many neighborhoods as possible. Corruption is an ever-present temptation — taking corrupt actions accelerates your building but permanently handicaps your final scoring.",
    categories:["Strategy","Euro","Worker Placement"],players:"1-4",playTime:"100-150 min",
    complexity:2.94,bggRating:7.1,spineColor:"#1a2a4a",boxSize:"lg",
    mechanics:["Area Majority / Influence","Worker Placement","Hand Management","Income"]},
  282524:{id:"horrified",name:"Horrified",bggId:282524,year:2019,designer:"Prospero Hall, Peter Lee",
    description:"A cooperative game where players work together to defeat iconic Universal Monsters roaming a town, each with their own unique defeat condition and threatening behavior. Players move around the board collecting items, rescuing villagers, and fulfilling multi-step monster-specific tasks before the terror track reaches the end.",
    categories:["Co-op","Thematic","Family"],players:"1-5",playTime:"60 min",
    complexity:2.0,bggRating:7.5,spineColor:"#2a1a3a",boxSize:"md",
    mechanics:["Cooperative Game","Modular Board","Variable Player Powers","Hand Management"]},
  318184:{id:"imperium_classics",name:"Imperium: Classics",bggId:318184,year:2021,designer:"Nigel Buckle, Dávid Turczi",
    description:"An asymmetric deck-building game where each player leads a historical civilization — from Rome to Carthage — through a unique development path from barbarism to empire. Each nation plays completely differently, with special cards and mechanics that reflect its historical character, creating highly varied game experiences.",
    categories:["Deck Building","Strategy","Card Game"],players:"1-4",playTime:"40-160 min",
    complexity:3.5,bggRating:7.7,spineColor:"#7a4a1a",boxSize:"lg",
    mechanics:["Deck Construction","Asymmetric Factions","Hand Management","Variable Player Powers"]},
  15512:{id:"incan_gold",name:"Incan Gold",bggId:15512,year:2005,designer:"Bruno Faidutti, Alan R. Moon",
    description:"A push-your-luck exploration game where players venture deeper into an Incan temple, voting simultaneously each round whether to press on for more treasure or retreat to safety. Hazard cards accumulate with each deck shuffle, and any explorer caught in the temple when a second hazard of the same type appears loses everything.",
    categories:["Card Game","Party","Family"],players:"3-8",playTime:"20-40 min",
    complexity:1.1,bggRating:6.9,spineColor:"#c8a020",boxSize:"sm",
    mechanics:["Push Your Luck","Simultaneous Action Selection","Negotiation"]},
  155821:{id:"inis",name:"Inis",bggId:155821,year:2016,designer:"Christian Martinez",
    description:"An area-control game steeped in Celtic mythology where players draft action cards each round and use them to move clans, gather deeds, and contest territories across a modular island map. Victory requires holding three of the four win conditions simultaneously — being a king of a territory, leading a sanctuary, or presiding over a large clan gathering.",
    categories:["Area Control","Strategy","Thematic"],players:"2-4",playTime:"60-90 min",
    complexity:2.95,bggRating:7.8,spineColor:"#2a5a2a",boxSize:"md",
    mechanics:["Area Majority / Influence","Card Drafting","Modular Board","Variable Player Powers"]},
  347305:{id:"inventions_evolution_ideas",name:"Inventions: Evolution of Ideas",bggId:347305,year:2024,designer:"Vital Lacerda",
    description:"A worker-placement and engine-building game tracing humanity's technological progress, where players develop inventions that build upon each other in a vast innovation tree. Players share discoveries with opponents in exchange for future benefits, creating an intricate web of interdependencies that rewards long-term planning.",
    categories:["Strategy","Euro","Worker Placement","Engine Building"],players:"1-4",playTime:"60-150 min",
    complexity:4.6,bggRating:7.9,spineColor:"#3a4a6a",boxSize:"xl",
    mechanics:["Worker Placement","Engine Building","Technology Trees / Tech Tracks","Hand Management"]},
  176494:{id:"isle_of_skye",name:"Isle of Skye: From Chieftain to King",bggId:176494,year:2015,designer:"Andreas Pelikan, Alexander Pfister",
    description:"A tile-laying game where players bid on landscape tiles to build their Scottish kingdoms, but the twist is that each player sets the prices for their own tiles before seeing what others will pay. The shifting scoring categories each game ensure that different tile combinations matter in every play.",
    categories:["Strategy","Euro","Abstract"],players:"2-5",playTime:"30-50 min",
    complexity:2.2,bggRating:7.3,spineColor:"#4a6a8a",boxSize:"md",
    mechanics:["Tile Placement","Auction / Bidding","Variable Set-up","Modular Board"]},
  251219:{id:"istanbul_big_box",name:"Istanbul: Big Box",bggId:251219,year:2018,designer:"Rüdiger Dorn",
    description:"The complete Istanbul collection combines the base game and all expansions, where players race through a bustling bazaar by moving merchant tokens across a grid of tiles to gather resources and collect rubies. A unique stack mechanism means leaving assistants behind and returning to collect them forms the core optimization puzzle.",
    categories:["Euro","Strategy","Family"],players:"2-5",playTime:"40-90 min",
    complexity:2.51,bggRating:8.0,spineColor:"#c87820",boxSize:"xl",
    mechanics:["Grid Movement","Modular Board","Variable Set-up","Route / Network Building"]},
  314530:{id:"iwari_deluxe",name:"Iwari: Deluxe Edition",bggId:314530,year:2020,designer:"Michael Schacht",
    description:"A rethemed and expanded version of Kahuna, Iwari is a spiritual area-control game where players place totems across a map of islands connected by bridges. Controlling a majority of a region's connections lets you remove opponent totems, creating a fluid back-and-forth territorial struggle.",
    categories:["Area Control","Abstract","Strategy"],players:"1-6",playTime:"45 min",
    complexity:2.43,bggRating:7.7,spineColor:"#6a4a2a",boxSize:"md",
    mechanics:["Area Majority / Influence","Hand Management","Network and Route Building"]},
  28023:{id:"jamaica",name:"Jamaica",bggId:28023,year:2007,designer:"Malcolm Braff, Bruno Cathala, Sébastien Pauchon",
    description:"A pirate racing game around the island of Jamaica where players roll dice and assign them to movement and storage actions, managing their hold to carry food, gold, and cannons. Ships collide at sea ports and fight with cannon dice, making this a lively family game that blends racing with light combat.",
    categories:["Racing","Family","Dice"],players:"2-6",playTime:"30-60 min",
    complexity:1.66,bggRating:7.0,spineColor:"#1a3a5a",boxSize:"md",
    mechanics:["Dice Rolling","Race","Variable Player Powers","Hand Management"]},
  34010:{id:"journey_center_earth",name:"Journey to the Center of the Earth",bggId:34010,year:2008,designer:"Rüdiger Dorn",
    description:"An adventure game inspired by Jules Verne's classic novel, where players lead expeditions through underground passages collecting minerals and fossils. Players must manage limited resources while racing to reach the earth's core, balancing exploration with the danger of being left behind.",
    categories:["Adventure","Family","Strategy"],players:"2-4",playTime:"60 min",
    complexity:2.03,bggRating:6.3,spineColor:"#4a2a1a",boxSize:"md",
    mechanics:["Hand Management","Route / Network Building","Variable Player Powers"]},
  8098:{id:"jungle_speed",name:"Jungle Speed",bggId:8098,year:1997,designer:"Thomas Vuarchex, Pierrick Yakovenko",
    description:"A fast-paced reflex card game where players flip cards onto personal discard piles and race to grab a central totem whenever their symbol matches another player's. Special cards add chaos with color matching, reversals, and everyone-grabs moments, making each round unpredictably frantic.",
    categories:["Card Game","Party","Family"],players:"2-10",playTime:"10 min",
    complexity:1.0,bggRating:6.4,spineColor:"#2a7a2a",boxSize:"sm",
    mechanics:["Real-Time","Pattern Recognition","Take That"]},
  254640:{id:"just_one",name:"Just One",bggId:254640,year:2018,designer:"Ludovic Roudy, Bruno Sautter",
    description:"A cooperative party game where one player must guess a secret word based on single-word clues written by all other players, but duplicate clues are cancelled out before the guesser sees them. The challenge is writing a clue unique enough to survive the duplicate-elimination while still being helpful.",
    categories:["Co-op","Party","Card Game"],players:"3-7",playTime:"20-60 min",
    complexity:1.1,bggRating:7.7,spineColor:"#e06a1a",boxSize:"sm",
    mechanics:["Cooperative Game","Communication Limits","Simultaneous Action Selection"]},
  34585:{id:"keltis",name:"Keltis",bggId:34585,year:2008,designer:"Reiner Knizia",
    description:"A card-and-path game where players advance stone pieces along Celtic paths by playing number cards in ascending or descending order on each track. Scoring rewards advancing pieces far along paths and reaching certain bonus stones, while ending paths prematurely carries penalties.",
    categories:["Abstract","Family","Card Game"],players:"2-4",playTime:"30 min",
    complexity:1.7,bggRating:6.5,spineColor:"#5a7a3a",boxSize:"md",
    mechanics:["Hand Management","Set Collection","Track Movement"]},
  411894:{id:"kinfire_council",name:"Kinfire Council",bggId:411894,year:2025,designer:"Kevin Wilson",
    description:"A competitive deck-building game set in the Kinfire universe where players lead councils competing to complete quests and earn influence. Players build decks of advisors and resources while navigating political intrigue and tactical quest competition against opponents.",
    categories:["Deck Building","Strategy","Card Game"],players:"2-6",playTime:"90-120 min",
    complexity:3.24,bggRating:7.6,spineColor:"#4a2a6a",boxSize:"lg",
    mechanics:["Deck Construction","Hand Management","Variable Player Powers","Action Points"]},
  404538:{id:"kinfire_delve_scorns_stockade",name:"Kinfire Delve: Scorn's Stockade",bggId:404538,year:2024,designer:"Kevin Wilson",
    description:"A solo or two-player dungeon-crawling card game where players explore a dungeon by revealing cards and managing limited hand resources against escalating threats. Each room presents a unique puzzle of resource management and card play as heroes delve deeper into Scorn's fortress.",
    categories:["Deck Building","Card Game","Puzzle"],players:"1-2",playTime:"60 min",
    complexity:2.2,bggRating:7.8,spineColor:"#3a1a2a",boxSize:"sm",
    mechanics:["Deck Construction","Hand Management","Solo / Solitaire Game","Push Your Luck"]},
  70323:{id:"king_of_tokyo",name:"King of Tokyo",bggId:70323,year:2011,designer:"Richard Garfield",
    description:"A dice-chucking game where giant monsters battle for dominance over Tokyo, using Yahtzee-style re-rolls to collect energy, deal damage, and heal. Occupying Tokyo earns extra victory points but makes you the target for every other monster at the table.",
    categories:["Dice","Family","Thematic"],players:"2-6",playTime:"30 min",
    complexity:1.5,bggRating:7.2,spineColor:"#2a6a1a",boxSize:"md",
    mechanics:["Dice Rolling","Push Your Luck","Take That","Variable Player Powers"]},
  415776:{id:"kingdom_legacy_feudal",name:"Kingdom Legacy: Feudal Kingdom",bggId:415776,year:2024,designer:"Jonathan Fryxelius",
    description:"A solo epic kingdom-management legacy game where a single player builds and defends a feudal realm across a sweeping campaign spanning hundreds of decisions. Players manage resources, expand territory, and respond to events that permanently alter the game's map and rules over many sessions.",
    categories:["Solo","Campaign","Strategy"],players:"1-1",playTime:"360-480 min",
    complexity:2.26,bggRating:8.0,spineColor:"#6a4a1a",boxSize:"xl",
    mechanics:["Campaign / Legacy","Solo / Solitaire Game","Variable Set-up","Resource Management"]},
  272533:{id:"kingdom_rush_rift_in_time",name:"Kingdom Rush: Rift in Time",bggId:272533,year:2020,designer:"Alara Cameron, Helana Hope, Sen-Foong Lim",
    description:"A cooperative tower-defense game based on the popular video game series, where players place portal and tower pieces on a puzzle board to stop waves of enemies from reaching the exit. Each scenario has unique maps and enemy patterns, scaling in difficulty across a full campaign.",
    categories:["Co-op","Puzzle","Strategy"],players:"1-4",playTime:"45-90 min",
    complexity:2.98,bggRating:7.3,spineColor:"#3a1a1a",boxSize:"lg",
    mechanics:["Cooperative Game","Puzzle","Variable Set-up","Modular Board"]},
  394193:{id:"kosmogonia_2086_kronos",name:"Kosmogonia 2086: Kronos Epilogue",bggId:394193,year:2023,designer:"Isidoros Davazoglou, Panagiotis Vasilakos",
    description:"A science-fiction card game set in a post-apocalyptic future where players compete to shape the remnants of civilization through faction cards and resource management. Players balance short-term tactical plays with long-term strategic goals in a tense card-driven struggle for dominance.",
    categories:["Card Game","Strategy","Thematic"],players:"1-4",playTime:"25-45 min",
    complexity:2.0,bggRating:7.7,spineColor:"#1a1a4a",boxSize:"sm",
    mechanics:["Hand Management","Deck Construction","Variable Player Powers"]},
  243993:{id:"la_stanza",name:"La Stanza",bggId:243993,year:2019,designer:"Nuno Bizarro Sentieiro, Paulo Soledade",
    description:"A worker-placement game set in the salons of Renaissance Italy where players compete to commission artworks, collect paintings, and build the most prestigious collection. Players move shared noble pawns around a grand room to activate locations, creating an elegant tension between helping yourself and advancing opponents.",
    categories:["Euro","Strategy","Worker Placement"],players:"2-4",playTime:"60-90 min",
    complexity:2.9,bggRating:6.7,spineColor:"#7a4a2a",boxSize:"md",
    mechanics:["Worker Placement","Set Collection","Hand Management","Shared Action Queue"]},
  96913:{id:"lancaster",name:"Lancaster",bggId:96913,year:2011,designer:"Matthias Cramer",
    description:"A worker-placement game set in medieval England where players command knights to claim valuable regions and influence laws being debated in Parliament. Knights can be outbid by opponents, so players must decide how many squires to assign to protect key positions while still expanding across the kingdom.",
    categories:["Strategy","Euro","Worker Placement"],players:"2-5",playTime:"60 min",
    complexity:2.99,bggRating:7.4,spineColor:"#8a2a1a",boxSize:"md",
    mechanics:["Worker Placement","Area Majority / Influence","Voting","Variable Player Powers"]},
  35677:{id:"le_havre",name:"Le Havre",bggId:35677,year:2008,designer:"Uwe Rosenberg",
    description:"An economic city-building game set in the French port of Le Havre, where players use actions to collect resources, construct buildings, and ship goods for profit. Buildings become available to all players once built, so acquiring them early grants income while denying opponents free use, creating a deep web of economic decisions.",
    categories:["Strategy","Euro","Worker Placement"],players:"1-5",playTime:"30-150 min",
    complexity:3.71,bggRating:7.9,spineColor:"#2a3a5a",boxSize:"lg",
    mechanics:["Worker Placement","Hand Management","Income","Variable Set-up"]},
  354934:{id:"legacy_of_yu",name:"Legacy of Yu",bggId:354934,year:2023,designer:"Shem Phillips",
    description:"A solo deck-building game set in ancient China where the player must construct canals to tame the Yellow River while simultaneously defending against barbarian invasions. The game features a persistent campaign where each session's outcome shapes the starting conditions of the next, telling the legendary story of Yu the Great.",
    categories:["Solo","Deck Building","Co-op"],players:"1-1",playTime:"60 min",
    complexity:2.88,bggRating:8.1,spineColor:"#c87820",boxSize:"sm",
    mechanics:["Deck Construction","Solo / Solitaire Game","Campaign / Legacy","Hand Management"]},
  129437:{id:"legendary_marvel",name:"Legendary: A Marvel Deck Building Game",bggId:129437,year:2012,designer:"Devin Low",
    description:"A cooperative deck-building game where players recruit Marvel heroes and build powerful combos to fight iconic villains and a mastermind. Each villain scheme creates unique win and loss conditions, while hero decks feature distinct abilities that reward thoughtful team composition and card synergy.",
    categories:["Co-op","Deck Building","Thematic"],players:"1-5",playTime:"30-60 min",
    complexity:2.43,bggRating:7.5,spineColor:"#8a1a1a",boxSize:"lg",
    mechanics:["Cooperative Game","Deck Construction","Hand Management","Variable Player Powers"]},
  358737:{id:"leviathan_wilds",name:"Leviathan Wilds",bggId:358737,year:2024,designer:"Justin Kemppainen",
    description:"A cooperative game of monster hunting where players work as a team to study and bring down massive leviathans using specialized equipment and coordinated attacks. Players must read the monster's behavior patterns and exploit weaknesses while managing stamina and positioning on a dynamic encounter board.",
    categories:["Co-op","Thematic","Adventure"],players:"1-4",playTime:"45-90 min",
    complexity:2.6,bggRating:7.9,spineColor:"#1a3a5a",boxSize:"lg",
    mechanics:["Cooperative Game","Variable Player Powers","Modular Board","Hand Management"]},
  356033:{id:"libertalia_winds_galecrest",name:"Libertalia: Winds of Galecrest",bggId:356033,year:2022,designer:"Paolo Mori",
    description:"A simultaneous-action game of pirate plunder where players select crew members from identical starting hands to send on shared voyages, each member resolving in a strict priority order. Reading opponents' likely plays and timing your own characters to trigger at advantageous moments is the heart of this elegant deduction puzzle.",
    categories:["Card Game","Strategy","Thematic"],players:"1-6",playTime:"45-60 min",
    complexity:2.2,bggRating:7.4,spineColor:"#1a3a6a",boxSize:"md",
    mechanics:["Simultaneous Action Selection","Hand Management","Variable Player Powers","Deduction"]},
  295374:{id:"long_shot_dice_game",name:"Long Shot: The Dice Game",bggId:295374,year:2022,designer:"Chris Handy",
    description:"A horse racing dice game where players bet on and sponsor competing horses while rolling dice to advance them around the track. Players use money management and timely card plays to influence which horses run well, making it a light gambling experience that plays quickly with many players.",
    categories:["Dice","Racing","Family"],players:"1-8",playTime:"25 min",
    complexity:1.96,bggRating:7.5,spineColor:"#2a5a2a",boxSize:"sm",
    mechanics:["Dice Rolling","Race","Betting / Wagering","Push Your Luck"]},
  222509:{id:"lords_of_hellas",name:"Lords of Hellas",bggId:222509,year:2018,designer:"Adam Kwapiński",
    description:"An area-control game blending ancient Greek mythology with action-figure miniatures, where players command heroes and armies competing to achieve one of several alternate victory conditions. Building colossal monuments grants powerful abilities and points toward an instant-win condition, while military conquest and monster hunting offer alternative paths to glory.",
    categories:["Area Control","Thematic","Strategy"],players:"1-4",playTime:"60-90 min",
    complexity:3.32,bggRating:7.6,spineColor:"#c8a020",boxSize:"xl",
    mechanics:["Area Majority / Influence","Variable Player Powers","Modular Board","Hand Management"]},
  118247:{id:"lucky_numbers",name:"Lucky Numbers",bggId:118247,year:2012,designer:"Michael Schacht",
    description:"A fast filler game where players draw number tiles and arrange them in a 4x4 grid that must remain in ascending order both horizontally and vertically. Discarded tiles are available to opponents, so every draw and discard has a strategic ripple effect as players race to complete their grids.",
    categories:["Abstract","Family","Puzzle"],players:"1-4",playTime:"20 min",
    complexity:1.2,bggRating:6.4,spineColor:"#e8c020",boxSize:"sm",
    mechanics:["Tile Placement","Pattern Building","Solo / Solitaire Game"]},
  248562:{id:"mage_knight_ultimate",name:"Mage Knight: Ultimate Edition",bggId:248562,year:2018,designer:"Vlaada Chvátil, Paul Grogan, Phil Pettifer",
    description:"An epic deck-building exploration game where players command powerful Mage Knights conquering a mysterious land filled with cities, dungeons, and enemies. The complex interplay between card combinations, terrain exploration, and tactical combat makes it one of the deepest solo or cooperative experiences in board gaming.",
    categories:["Co-op","Deck Building","Adventure"],players:"1-5",playTime:"150 min",
    complexity:4.6,bggRating:8.8,spineColor:"#2a1a4a",boxSize:"xl",
    mechanics:["Deck Construction","Cooperative Game","Modular Board","Hand Management","Variable Player Powers"]},
  258242:{id:"magnate_first_city",name:"Magnate: The First City",bggId:258242,year:2021,designer:"James Naylor",
    description:"A real-estate speculation game where players construct buildings on a city grid, pricing and selling properties to generate cash flow in a market that will eventually crash. The game ends when the property bubble bursts, rewarding players who cashed out at the right time rather than those who over-leveraged.",
    categories:["Strategy","Euro"],players:"1-5",playTime:"60-120 min",
    complexity:3.12,bggRating:7.4,spineColor:"#2a3a2a",boxSize:"lg",
    mechanics:["Auction / Bidding","Network and Route Building","Variable Set-up","Market"]},
  8147:{id:"maka_bana",name:"Maka Bana",bggId:8147,year:2003,designer:"François Haffner",
    description:"A light strategy game where players compete to harvest coconuts from a shared island, taking turns placing and moving monkeys to claim fruit. The placement and blocking mechanics create a gentle abstract puzzle that plays quickly and accessibly for all ages.",
    categories:["Abstract","Family","Strategy"],players:"3-6",playTime:"45-60 min",
    complexity:2.01,bggRating:6.7,spineColor:"#5a8a2a",boxSize:"sm",
    mechanics:["Area Majority / Influence","Tile Placement","Pattern Building"]},
  205059:{id:"mansions_madness_2e",name:"Mansions of Madness: Second Edition",bggId:205059,year:2016,designer:"Nikki Valens",
    description:"A cooperative app-driven horror adventure game set in the Arkham Horror universe, where an app controls the mansion's monster placement, narrative events, and puzzle solutions while players explore room by room. Investigators solve mysteries, fight eldritch creatures, and struggle to maintain their sanity across richly illustrated scenario books.",
    categories:["Co-op","Thematic","Adventure"],players:"1-5",playTime:"120-180 min",
    complexity:2.69,bggRating:7.9,spineColor:"#2a1a1a",boxSize:"xl",
    mechanics:["Cooperative Game","Modular Board","Variable Player Powers","Storytelling"]},
  291847:{id:"mantis_falls",name:"Mantis Falls",bggId:291847,year:2021,designer:"Adrian Kerrihard",
    description:"A tense 2-3 player hidden-role card game where witnesses to a crime attempt to escape a corrupt town, but one or two players may secretly be assassins sabotaging the escape. Players cooperate to play survival cards in sequence while carefully reading each other for signs of betrayal.",
    categories:["Card Game","Thematic","Deduction"],players:"2-3",playTime:"60-90 min",
    complexity:2.74,bggRating:7.1,spineColor:"#2a3a2a",boxSize:"sm",
    mechanics:["Hand Management","Deduction","Hidden Roles","Cooperative Game"]},
  276025:{id:"maracaibo",name:"Maracaibo",bggId:276025,year:2019,designer:"Alexander Pfister",
    description:"A campaign-style strategy game set in the 17th-century Caribbean where players sail between ports, fulfilling contracts, building influence, and advancing a narrative story across multiple rounds. Each voyage balances immediate scoring opportunities against long-term engine development through cards and player boards.",
    categories:["Strategy","Euro","Adventure","Campaign"],players:"1-4",playTime:"30-120 min",
    complexity:3.9,bggRating:7.9,spineColor:"#1a5276",boxSize:"lg",
    mechanics:["Hand Management","Route Building","Variable Player Powers","Campaign"]},
  403495:{id:"marvel_dice_throne_missions",name:"Marvel Dice Throne Missions",bggId:403495,year:2025,designer:"Gavan Brown, Nate Chatellier",
    description:"A cooperative expansion for Marvel Dice Throne that introduces mission-based scenarios where players team up as Marvel heroes to overcome escalating threats. Players combine their unique dice-rolling hero abilities and special cards to complete objectives before the villain's plan succeeds.",
    categories:["Dice","Thematic","Co-op"],players:"1-4",playTime:"30-75 min",
    complexity:2.27,bggRating:8.3,spineColor:"#8e1a1a",boxSize:"md",
    mechanics:["Cooperative Game","Dice Rolling","Variable Player Powers"]},
  360153:{id:"marvel_dice_throne_sw_thor_loki_spiderman",name:"Marvel Dice Throne: Scarlet Witch v. Thor v. Loki v. Spider-Man",bggId:360153,year:2022,designer:"Gavan Brown, Nate Chatellier, Manny Trembley",
    description:"A head-to-head dice combat game featuring four iconic Marvel heroes and villains, each with a unique deck of cards and custom dice representing their powers. Players roll and re-roll dice to trigger powerful abilities, deflect attacks, and whittle down opponents' health in fast, tactical duels.",
    categories:["Dice","Thematic","Card Game"],players:"2-4",playTime:"20-40 min",
    complexity:2.44,bggRating:7.6,spineColor:"#6e2090",boxSize:"md",
    mechanics:["Dice Rolling","Hand Management","Variable Player Powers","Take That"]},
  351817:{id:"marvel_zombies",name:"Marvel Zombies: A Zombicide Game",bggId:351817,year:2023,designer:"Fabio Cury, Michael Shinall",
    description:"A cooperative dungeon crawler using the Zombicide system where players control zombie Marvel heroes hunting for flesh across modular tile maps. Balancing hunger and evolving zombie powers, teams must complete mission objectives before their hunger drives them to devour each other.",
    categories:["Thematic","Co-op","Adventure"],players:"1-6",playTime:"60 min",
    complexity:2.35,bggRating:8.0,spineColor:"#2c2c2c",boxSize:"xl",
    mechanics:["Cooperative Game","Modular Board","Variable Player Powers","Action Points"]},
  315610:{id:"massive_darkness_2_hellscape",name:"Massive Darkness 2: Hellscape",bggId:315610,year:2022,designer:"Alex Olteanu, Marco Portugal",
    description:"A dungeon-crawl cooperative game where heroes descend into demon-filled levels, leveling up characters and finding loot while battling roaming monsters. The light and shadow system creates tactical positioning choices, as heroes in darkness gain bonuses while enemies lurk unseen.",
    categories:["Thematic","Co-op","Adventure"],players:"1-6",playTime:"60 min",
    complexity:2.8,bggRating:8.0,spineColor:"#3d0000",boxSize:"xl",
    mechanics:["Cooperative Game","Modular Board","Dice Rolling","Variable Player Powers","Action Points"]},
  209010:{id:"mechs_vs_minions",name:"Mechs vs. Minions",bggId:209010,year:2016,designer:"Chris Cantrell, Rick Ernst, Stone Librande, Prashant Saraswat, Nathan Tiras",
    description:"A cooperative programming game set in the League of Legends universe where players command giant mechs through a series of campaign missions against waves of minions. Each round players draft command cards to program their mech's actions, then execute them simultaneously — with chaotic but satisfying results.",
    categories:["Co-op","Thematic","Campaign"],players:"2-4",playTime:"60-120 min",
    complexity:2.6,bggRating:7.8,spineColor:"#4a3000",boxSize:"xl",
    mechanics:["Cooperative Game","Action Programming","Modular Board","Campaign"]},
  404431:{id:"men_nefer",name:"Men-Nefer",bggId:404431,year:2024,designer:"Germán P. Millán",
    description:"A worker placement and area control game set in ancient Memphis, Egypt, where players act as nobles vying for influence by constructing monuments and managing resources along the Nile. Strategic placement of workers and clever use of the rotating action board creates a tight, evolving competition.",
    categories:["Strategy","Euro","Worker Placement","Area Control"],players:"1-4",playTime:"60-120 min",
    complexity:3.68,bggRating:8.1,spineColor:"#b8860b",boxSize:"md",
    mechanics:["Worker Placement","Area Control","Resource Management"]},
  318977:{id:"micromacro_crime_city",name:"MicroMacro: Crime City",bggId:318977,year:2020,designer:"Johannes Sich",
    description:"A cooperative mystery game played on a single giant black-and-white map of a dense city, where players follow trails of clues across the illustration to solve criminal cases. Each case unfolds sequentially through a deck of cards guiding detectives from crime scene to resolution.",
    categories:["Co-op","Deduction","Family"],players:"1-4",playTime:"15-45 min",
    complexity:1.2,bggRating:7.4,spineColor:"#2c2c2c",boxSize:"md",
    mechanics:["Cooperative Game","Deduction","Storytelling"]},
  377420:{id:"mind_space",name:"Mind Space",bggId:377420,year:2023,designer:"Nao Shimamura",
    description:"A puzzle-style polyomino game where players fill their personal brain-shaped boards with differently shaped thought tiles scored based on color adjacency and placement patterns. Each round players simultaneously choose from a shared market of tiles, making efficient spatial decisions against limited space.",
    categories:["Puzzle","Abstract"],players:"1-5",playTime:"30 min",
    complexity:1.8,bggRating:7.2,spineColor:"#6a3d8f",boxSize:"sm",
    mechanics:["Tile Placement","Puzzle","Simultaneous Action Selection"]},
  345584:{id:"mindbug_first_contact",name:"Mindbug: First Contact",bggId:345584,year:2022,designer:"Skaff Elias, Richard Garfield, Marvin Hegen, Christian Kudahl",
    description:"A two-player card combat game where each player commands hybrid creatures to attack the opponent's life points, but either player can use a Mindbug token to steal any creature played by their opponent. This hijacking mechanic turns every card play into a tense bluff and counter-bluff decision.",
    categories:["Card Game","Strategy","Abstract"],players:"2-2",playTime:"15-25 min",
    complexity:1.9,bggRating:7.5,spineColor:"#1a3a1a",boxSize:"sm",
    mechanics:["Hand Management","Take That","Variable Player Powers"]},
  311715:{id:"mini_rogue",name:"Mini Rogue",bggId:311715,year:2020,designer:"Paolo Di Stefano, Gabriel Gendron",
    description:"A tiny dungeon-crawl game played with a small deck of cards and two dice where heroes descend through randomized rooms, fighting monsters, collecting treasure, and growing in power. Each run is quick and deadly, with meaningful choices about when to risk deeper floors versus collecting resources.",
    categories:["Dice","Adventure","Solo","Co-op"],players:"1-2",playTime:"30-45 min",
    complexity:2.0,bggRating:7.2,spineColor:"#5c3317",boxSize:"sm",
    mechanics:["Cooperative Game","Dice Rolling","Push Your Luck","Deck Building"]},
  366251:{id:"mistwind",name:"Mistwind",bggId:366251,year:2024,designer:"Adrian Adamescu, Daryl Andrews",
    description:"A fantasy adventure game set in a world of floating islands where players explore, gather resources, and build their tableau of abilities while navigating shifting wind currents. Drafting cards each round shapes each player's unique strategy as they race to complete objectives across the archipelago.",
    categories:["Strategy","Euro","Adventure"],players:"1-5",playTime:"75-120 min",
    complexity:3.17,bggRating:7.6,spineColor:"#4a7fbf",boxSize:"md",
    mechanics:["Card Drafting","Hand Management","Tableau Building","Variable Player Powers"]},
  21763:{id:"mr_jack",name:"Mr. Jack",bggId:21763,year:2006,designer:"Bruno Cathala, Ludovic Maublanc",
    description:"An asymmetric two-player deduction game set in Victorian London where one player controls Jack the Ripper trying to escape the city while the other moves detective characters to narrow down which suspect Jack is hiding among. Clever use of the rotating character order and alibi system creates deep bluffing opportunities each round.",
    categories:["Deduction","Strategy","Abstract"],players:"2-2",playTime:"30 min",
    complexity:2.1,bggRating:7.0,spineColor:"#2c1a0e",boxSize:"md",
    mechanics:["Deduction","Hidden Identity","Action Points","Asymmetric Gameplay"]},
  1927:{id:"munchkin",name:"Munchkin",bggId:1927,year:2001,designer:"Steve Jackson",
    description:"A satirical dungeon-crawl card game where players kick open doors, fight monsters for levels, and backstab each other on the way to level 10. Loaded with humor and take-that mechanics, every fight can be interrupted by other players offering help — for a steep price.",
    categories:["Card Game","Party","Thematic"],players:"3-6",playTime:"60-120 min",
    complexity:1.7,bggRating:5.9,spineColor:"#c0392b",boxSize:"sm",
    mechanics:["Hand Management","Take That","Player Elimination","Negotiation"]},
  181304:{id:"mysterium",name:"Mysterium",bggId:181304,year:2015,designer:"Oleksandr Nevskiy, Oleg Sidorenko",
    description:"A cooperative deduction game where one player acts as a ghost communicating through abstract dream-vision cards while other players act as psychic investigators trying to identify the murderer, location, and weapon. Interpreting the ghost's surreal imagery collaboratively is both the puzzle and the pleasure.",
    categories:["Co-op","Deduction","Party","Thematic"],players:"2-7",playTime:"42 min",
    complexity:1.9,bggRating:7.2,spineColor:"#2e0854",boxSize:"md",
    mechanics:["Cooperative Game","Deduction","Communication Limits","Storytelling"]},
  153912:{id:"mystery_of_the_abbey",name:"Mystery of the Abbey",bggId:153912,year:2007,designer:"Bruno Faidutti, Serge Laget",
    description:"A deduction mystery game set in a medieval monastery where players move through rooms gathering clues to identify a murderous monk. Players question each other about suspects and use mass and chapter-house events to gain and share information across the abbey.",
    categories:["Deduction","Strategy"],players:"3-6",playTime:"60-90 min",
    complexity:2.1,bggRating:7.0,spineColor:"#4a3800",boxSize:"md",
    mechanics:["Deduction","Movement","Hidden Information"]},
  249746:{id:"nanty_narking",name:"Nanty Narking",bggId:249746,year:2019,designer:"Martin Wallace",
    description:"A reimplementation of Discworld: Ankh-Morpork set in a colorful Victorian-fantasy city where players control hidden factions with secret victory conditions, competing for control of districts through cards, agents, and events. Each faction wins differently, creating layers of bluffing and deduction about opponents' goals.",
    categories:["Strategy","Area Control","Thematic"],players:"2-4",playTime:"60 min",
    complexity:2.32,bggRating:7.4,spineColor:"#8b4513",boxSize:"md",
    mechanics:["Area Control","Hand Management","Hidden Objectives","Variable Player Powers"]},
  66589:{id:"navegador",name:"Navegador",bggId:66589,year:2010,designer:"Mac Gerdts",
    description:"A rondel-action strategy game about Portuguese maritime exploration where players use sailing, building, and trading actions to colonize new territories and profit from goods markets. Timing your rondel movements and reading the market before competitors drives the deep economic tension.",
    categories:["Strategy","Euro"],players:"2-5",playTime:"60-90 min",
    complexity:3.1,bggRating:7.5,spineColor:"#c0a020",boxSize:"md",
    mechanics:["Rondel","Route Building","Market","Variable Player Powers"]},
  174660:{id:"new_york_1901",name:"New York 1901",bggId:174660,year:2015,designer:"Chénier La Salle",
    description:"A tile-laying game set in turn-of-the-century Manhattan where players acquire lots and construct skyscrapers of different sizes across city blocks, scoring for clustering buildings of the same type. Upgrading old buildings by demolishing and rebuilding adds a tense timing element to the spatial puzzle.",
    categories:["Strategy","Euro","Family"],players:"2-4",playTime:"30-60 min",
    complexity:2.0,bggRating:6.8,spineColor:"#1a3a5c",boxSize:"md",
    mechanics:["Tile Placement","Area Control","Set Collection"]},
  15363:{id:"nexus_ops",name:"Nexus Ops",bggId:15363,year:2005,designer:"Charlie Catino, Steven Kimball",
    description:"A sci-fi area control and combat game where players mine energy, recruit alien units, and battle across a hexagonal moonscape to complete secret mission cards for points. The energize mechanic rewards the losing side after bad luck, keeping all players competitive until the final mission is scored.",
    categories:["Strategy","Thematic","Area Control","Dice"],players:"2-4",playTime:"90 min",
    complexity:2.3,bggRating:7.2,spineColor:"#1a1a4a",boxSize:"md",
    mechanics:["Area Control","Dice Rolling","Variable Player Powers","Hand Management"]},
  284435:{id:"nova_luna",name:"Nova Luna",bggId:284435,year:2019,designer:"Uwe Rosenberg, Corné van Moorsel",
    description:"An abstract tile placement game where players fill their personal tableau with moon tiles, completing the color-adjacency tasks printed on each tile to score tokens. A shared rondel determines the cost and timing of tile selection, making turn order itself a key resource to manage.",
    categories:["Abstract","Puzzle","Family"],players:"1-4",playTime:"30-60 min",
    complexity:2.0,bggRating:7.2,spineColor:"#1a2a4a",boxSize:"sm",
    mechanics:["Tile Placement","Rondel","Puzzle","Pattern Building"]},
  343362:{id:"oak",name:"Oak",bggId:343362,year:2022,designer:"Wim Goossens",
    description:"A deck-building game themed around druid clans nurturing a sacred forest over generations, where players cultivate their decks with animal and nature cards to grow the great oak and fulfill seasonal rituals. The generational reset mechanic periodically reshapes what cards remain, adding a unique twist to the deckbuilding arc.",
    categories:["Deck Building","Strategy","Euro"],players:"1-4",playTime:"60-90 min",
    complexity:3.13,bggRating:7.1,spineColor:"#2d5a1b",boxSize:"md",
    mechanics:["Deck Building","Hand Management","Engine Building","Variable Player Powers"]},
  291572:{id:"oath",name:"Oath",bggId:291572,year:2021,designer:"Cole Wehrle",
    description:"A deeply asymmetric political strategy game about power and legacy in an ancient land, where one player controls the Chancellor defending the realm while others play Exiles or Denizens seeking to seize or reshape power. Each game's outcome permanently alters the starting conditions for the next, creating a living chronicle.",
    categories:["Strategy","Area Control","Campaign","Thematic"],players:"1-6",playTime:"45-150 min",
    complexity:4.13,bggRating:7.7,spineColor:"#3d1a00",boxSize:"lg",
    mechanics:["Area Control","Hand Management","Asymmetric Gameplay","Variable Player Powers","Legacy"]},
  251661:{id:"oathsworn_into_the_deepwood",name:"Oathsworn: Into the Deepwood",bggId:251661,year:2022,designer:"Jamie Jolly",
    description:"A narrative-driven cooperative campaign game where players guide a band of mercenaries through a dark, story-rich world, fighting massive creatures using an innovative card-combat system tied to an audio soundtrack. Boss battles unfold through multi-stage encounter decks with dramatic twists unique to each monster.",
    categories:["Co-op","Thematic","Adventure","Campaign"],players:"1-4",playTime:"30-90 min",
    complexity:3.69,bggRating:8.7,spineColor:"#1a2a10",boxSize:"xl",
    mechanics:["Cooperative Game","Deck Building","Campaign","Storytelling","Variable Player Powers"]},
  273477:{id:"obscurio",name:"Obscurio",bggId:273477,year:2019,designer:"L'Atelier",
    description:"A cooperative deduction game set in a magical library where a Grimoire player gives visual clues via an illustrated book to guide teammates to the correct exit card, while a traitor among the group secretly tries to mislead the team. Managing trust and reading subtle illusions makes every round tense.",
    categories:["Co-op","Deduction","Party","Thematic"],players:"2-8",playTime:"40 min",
    complexity:1.8,bggRating:7.1,spineColor:"#1e1040",boxSize:"md",
    mechanics:["Cooperative Game","Communication Limits","Hidden Traitor","Deduction"]},
  160477:{id:"onitama",name:"Onitama",bggId:160477,year:2014,designer:"Shimpei Sato",
    description:"A two-player abstract strategy game played on a 5x5 grid where each player uses a pair of move cards drawn from a shared rotating pool to advance pawns toward the opponent's master or temple. With only five move cards in circulation at any time, anticipating your opponent's options is central to the deep tactical play.",
    categories:["Abstract","Strategy"],players:"2-2",playTime:"15-20 min",
    complexity:1.66,bggRating:7.3,spineColor:"#8b1a1a",boxSize:"sm",
    mechanics:["Grid Movement","Hand Management","Variable Player Powers","Asymmetric Gameplay"]},
  253759:{id:"paint_the_roses",name:"Paint the Roses",bggId:253759,year:2022,designer:"Ben Goldman",
    description:"A cooperative logic puzzle game set in Wonderland where players deduce the Queen of Hearts' secret gardening rules by placing and observing hedge tile patterns. Each player knows one part of the rule but cannot speak freely, making the shared tableau of clues the only language available.",
    categories:["Co-op","Deduction","Puzzle","Family"],players:"2-5",playTime:"50-70 min",
    complexity:2.5,bggRating:7.1,spineColor:"#c0003c",boxSize:"md",
    mechanics:["Cooperative Game","Deduction","Communication Limits","Tile Placement"]},
  131287:{id:"panamax",name:"Panamax",bggId:131287,year:2014,designer:"Gil d'Orey, Nuno Bizarro Sentieiro, Paulo Soledade",
    description:"A logistics and economic strategy game about shipping companies navigating the Panama Canal, where players load cargo onto ships, manage locks, and invest in shared shipping lines for profit. The joint ownership of ships and competitive use of canal infrastructure creates layered negotiation and blocking opportunities.",
    categories:["Strategy","Euro"],players:"2-4",playTime:"90-120 min",
    complexity:3.76,bggRating:7.2,spineColor:"#005f87",boxSize:"md",
    mechanics:["Route Building","Stock Holding","Negotiation","Action Points"]},
  30549:{id:"pandemic",name:"Pandemic",bggId:30549,year:2008,designer:"Matt Leacock",
    description:"The landmark cooperative game where players work as disease-fighting specialists to contain and cure four viral outbreaks spreading across a global map. Balancing outbreak prevention with the race to discover cures creates intense collaborative decisions under mounting pressure each turn.",
    categories:["Co-op","Strategy","Family"],players:"2-4",playTime:"45 min",
    complexity:2.4,bggRating:7.6,spineColor:"#1a3a1a",boxSize:"md",
    mechanics:["Cooperative Game","Hand Management","Variable Player Powers","Point-to-Point Movement"]},
  161936:{id:"pandemic_legacy_s1",name:"Pandemic Legacy: Season 1",bggId:161936,year:2015,designer:"Rob Daviau, Matt Leacock",
    description:"A campaign evolution of Pandemic where the world map, rules, and characters permanently change based on each session's outcome across a 12-month story. Stickers, destroyed cities, and evolving character abilities accumulate into a deeply personal narrative arc that rewards playing the full campaign.",
    categories:["Co-op","Strategy","Campaign"],players:"2-4",playTime:"60 min",
    complexity:2.8,bggRating:8.6,spineColor:"#2a1a00",boxSize:"md",
    mechanics:["Cooperative Game","Legacy Game","Hand Management","Variable Player Powers","Campaign"]},
  141572:{id:"paperback",name:"Paperback",bggId:141572,year:2014,designer:"Tim Fowers",
    description:"A deck-building word game where players buy letter cards to build their deck and then use those cards to spell words, with longer and rarer letters scoring more victory points. Balancing the acquisition of useful consonants, vowels, and wild cards makes each deck feel like a personal word-crafting engine.",
    categories:["Deck Building","Card Game","Family"],players:"2-5",playTime:"45 min",
    complexity:2.1,bggRating:7.1,spineColor:"#8b4513",boxSize:"sm",
    mechanics:["Deck Building","Word Game","Hand Management"]},
  163412:{id:"patchwork",name:"Patchwork",bggId:163412,year:2014,designer:"Uwe Rosenberg",
    description:"A two-player tile-placement game where players purchase irregularly shaped button-covered patches to fill their 9x9 quilting board, paying in both time and buttons. The shared time track governs turn order and income, making the race to earn the most buttons while minimizing holes into a tight spatial duel.",
    categories:["Abstract","Puzzle","Family"],players:"2-2",playTime:"15-30 min",
    complexity:1.6,bggRating:7.6,spineColor:"#d4748a",boxSize:"sm",
    mechanics:["Tile Placement","Puzzle","Resource Management","Pattern Building"]},
  308119:{id:"pax_renaissance_2e",name:"Pax Renaissance: 2nd Edition",bggId:308119,year:2021,designer:"Phil Eklund, Matt Eklund",
    description:"A card-driven historical game set during the Renaissance where players are banking families funding wars, trade, and religious movements to steer Europe toward one of four ideological endgames. Dense iconography and deeply interlocking systems reward study and create remarkable historical emergence.",
    categories:["Strategy","Card Game","Thematic"],players:"1-4",playTime:"60-120 min",
    complexity:4.65,bggRating:8.4,spineColor:"#6b3a00",boxSize:"sm",
    mechanics:["Hand Management","Card Drafting","Area Control","Variable Player Powers","Auction"]},
  21954:{id:"perikles",name:"Perikles",bggId:21954,year:2006,designer:"Martin Wallace",
    description:"A strategic game of ancient Greek politics and warfare where players compete for leadership of city-states and then command those states' armies in battles across the Aegean. The split between the political influence phase and the military resolution phase creates a game of long commitments and uncertain payoffs.",
    categories:["Strategy","Area Control","Thematic"],players:"3-5",playTime:"120 min",
    complexity:3.28,bggRating:6.8,spineColor:"#c8a850",boxSize:"md",
    mechanics:["Area Control","Auction","Dice Rolling","Hand Management"]},
  256997:{id:"perseverance_castaway_chronicles",name:"Perseverance: Castaway Chronicles",bggId:256997,year:2022,designer:"Richard Ámann, Thomas Vande Ginste, Viktor Péter, Wolf Plancke, Dávid Turczi",
    description:"A narrative campaign game where shipwrecked survivors explore a dinosaur-inhabited island, building a settlement and uncovering the island's secrets across multiple episodes. Players choose between cooperation and competition for resources while the branching story adapts to collective decisions.",
    categories:["Strategy","Adventure","Campaign","Thematic"],players:"1-4",playTime:"80-180 min",
    complexity:4.23,bggRating:7.7,spineColor:"#2d5a1b",boxSize:"lg",
    mechanics:["Worker Placement","Deck Building","Campaign","Variable Player Powers","Storytelling"]},
  402126:{id:"pocket_cats",name:"Pocket Cats",bggId:402126,year:2024,designer:"Alexandre Aguilar, Romaric Galonnier",
    description:"A tiny two-player card game where players compete to collect sets of charming cat cards by playing hand cards to claim cats from a central market. Quick to learn and play, it packs sharp bluffing and set-collection decisions into a pocket-sized package.",
    categories:["Card Game","Abstract","Family"],players:"2-2",playTime:"15 min",
    complexity:1.52,bggRating:6.1,spineColor:"#e8a0c0",boxSize:"sm",
    mechanics:["Hand Management","Set Collection","Take That"]},
  266830:{id:"qe",name:"QE",bggId:266830,year:2019,designer:"Gavin Birnbaum",
    description:"A bidding game where players representing central banks print unlimited money to acquire industries, with the twist that the player who bids the most total money across the entire game is eliminated from scoring. Tracking approximate competitor spending to stay under the elimination threshold while winning valuable tiles is the core tension.",
    categories:["Strategy","Card Game","Party"],players:"3-5",playTime:"45 min",
    complexity:1.7,bggRating:7.3,spineColor:"#006400",boxSize:"sm",
    mechanics:["Auction","Bidding","Hidden Information","Set Collection"]},
  300700:{id:"quetzal",name:"Quetzal",bggId:300700,year:2020,designer:"Alexandre Garcia",
    description:"A worker placement game set in a Mesoamerican archaeological excavation where players place workers of different expertise levels to excavate artifacts and sell them at market. The shared excavation grid means workers of the same type block each other, creating tense competition for the best dig sites.",
    categories:["Strategy","Euro","Worker Placement"],players:"2-5",playTime:"30-75 min",
    complexity:2.15,bggRating:6.8,spineColor:"#1a6b30",boxSize:"md",
    mechanics:["Worker Placement","Set Collection","Market","Variable Player Powers"]},
  624:{id:"quoridor",name:"Quoridor",bggId:624,year:1997,designer:"Mirko Marchesi",
    description:"An abstract two or four-player game where each player races their pawn to the opposite side of the board while using fence tiles to create walls that redirect opponents. The interplay between moving forward and placing walls creates elegant spatial puzzles with no randomness and infinite depth.",
    categories:["Abstract","Family"],players:"2-4",playTime:"15 min",
    complexity:1.8,bggRating:6.6,spineColor:"#8b6914",boxSize:"sm",
    mechanics:["Grid Movement","Network Building","Blocking"]},
  28143:{id:"race_for_the_galaxy",name:"Race for the Galaxy",bggId:28143,year:2007,designer:"Thomas Lehmann",
    description:"A card game of galactic civilization building where players simultaneously and secretly choose actions from the same set, activating them for everyone but granting bonuses only to the chooser. Reading opponents' likely selections while optimizing your own tableau of world and development cards creates deep strategic tension.",
    categories:["Strategy","Card Game","Engine Building"],players:"2-4",playTime:"30-60 min",
    complexity:3.0,bggRating:7.8,spineColor:"#1a2a4a",boxSize:"sm",
    mechanics:["Simultaneous Action Selection","Hand Management","Tableau Building","Engine Building"]},
  329082:{id:"radlands",name:"Radlands",bggId:329082,year:2021,designer:"Daniel Piechnick",
    description:"A two-player post-apocalyptic card game where players manage camps and field people and events to attack and destroy the opponent's three camp cards. Resource management is tightly constrained — water is both currency and the lifeblood that keeps your fighters in play.",
    categories:["Card Game","Strategy","Thematic"],players:"2-2",playTime:"20-40 min",
    complexity:2.4,bggRating:7.7,spineColor:"#8b3a00",boxSize:"sm",
    mechanics:["Hand Management","Resource Management","Take That","Asymmetric Gameplay"]},
  220877:{id:"rajas_of_the_ganges",name:"Rajas of the Ganges",bggId:220877,year:2017,designer:"Inka Brand, Markus Brand",
    description:"A dice-worker-placement game set in Mughal India where players use dice as workers to build provinces, trade goods, and sail the Ganges River, with two separate tracks — money and fame — racing toward each other to determine the winner. The dual-track victory condition creates perpetual tension between competing economic strategies.",
    categories:["Strategy","Euro","Dice","Worker Placement"],players:"2-4",playTime:"45-75 min",
    complexity:2.9,bggRating:7.7,spineColor:"#c07820",boxSize:"md",
    mechanics:["Dice Placement","Worker Placement","Resource Management","Set Collection"]},
  312959:{id:"rallyman_dirt",name:"Rallyman: DIRT",bggId:312959,year:2022,designer:"Jean-Christophe Bouvier",
    description:"A rally racing game where players roll gear dice and push their luck to move along modular track sections, managing speed versus the risk of accumulating danger tokens. Drafting the route you'll race before the game and then executing it under dice pressure captures the tension of real off-road rallying.",
    categories:["Dice","Racing","Strategy","Solo"],players:"1-6",playTime:"45-60 min",
    complexity:2.3,bggRating:7.4,spineColor:"#c04000",boxSize:"md",
    mechanics:["Dice Rolling","Push Your Luck","Racing","Modular Board"]},
  351040:{id:"ready_set_bet",name:"Ready Set Bet",bggId:351040,year:2022,designer:"John D. Clair",
    description:"A real-time horse racing betting game where one player rolls dice to advance horses while all other players simultaneously place bets on the evolving race using betting tiles on a central board. The excitement of watching probabilities shift and scrambling to secure the best odds before others captures the energy of a real racetrack.",
    categories:["Dice","Family","Party","Racing"],players:"2-9",playTime:"45-60 min",
    complexity:1.5,bggRating:7.4,spineColor:"#1a4a1a",boxSize:"md",
    mechanics:["Dice Rolling","Betting","Real-Time","Racing"]},
  51:{id:"ricochet_robots",name:"Ricochet Robots",bggId:51,year:1999,designer:"Alex Randolph",
    description:"A simultaneous puzzle game played on a grid where players race to find the minimum number of moves to slide robots to a target square, with robots stopping only when they hit a wall or another robot. The pure logic challenge rewards spatial reasoning and creates vocal, competitive fun as players shout out solutions.",
    categories:["Abstract","Puzzle","Family"],players:"1-99",playTime:"30 min",
    complexity:2.37,bggRating:7.0,spineColor:"#cc3300",boxSize:"md",
    mechanics:["Puzzle","Simultaneous Action Selection","Grid Movement"]},
  30658:{id:"rise_of_empires",name:"Rise of Empires",bggId:30658,year:2009,designer:"Martin Wallace",
    description:"A civilization-building game spanning ancient to medieval history where players develop cities, expand territory, and compete for dominance across three ages. Workers are placed on a central board to gather resources and trigger developments, while barbarian invasions threaten everyone equally and force temporary cooperation.",
    categories:["Strategy","Area Control","Worker Placement"],players:"2-5",playTime:"150 min",
    complexity:3.54,bggRating:7.1,spineColor:"#8b6914",boxSize:"lg",
    mechanics:["Area Majority / Influence","Worker Placement","Variable Setup"]},
  132531:{id:"roll_for_the_galaxy",name:"Roll for the Galaxy",bggId:132531,year:2014,designer:"Wei-Hwa Huang, Thomas Lehmann",
    description:"A dice-based reimagining of Race for the Galaxy where players simultaneously assign custom dice to five phases — explore, develop, settle, produce, ship — then reveal to see which phases everyone activates. Building a tableau of worlds and developments creates special powers that multiply your dice pool and scoring options.",
    categories:["Strategy","Dice","Engine Building"],players:"2-5",playTime:"45 min",
    complexity:2.9,bggRating:7.6,spineColor:"#1a3a6e",boxSize:"md",
    mechanics:["Dice Rolling","Simultaneous Action Selection","Tableau Building"]},
  284217:{id:"rush_md",name:"Rush M.D.",bggId:284217,year:2020,designer:"Anthony Howgego, Konstantinos Kokkinis, Dávid Turczi",
    description:"A real-time cooperative game set in a hospital emergency room where players race against sand timers to treat patients, run tests, and perform operations simultaneously. Each role has a different set of actions and the group must coordinate flipping timers, moving resources, and completing treatment chains before patients deteriorate.",
    categories:["Co-op","Dice","Strategy"],players:"1-4",playTime:"30-45 min",
    complexity:2.37,bggRating:7.4,spineColor:"#1a6e4a",boxSize:"md",
    mechanics:["Cooperative Game","Real-Time","Worker Placement"]},
  291453:{id:"scout",name:"SCOUT",bggId:291453,year:2019,designer:"Kei Kajino",
    description:"A hand-management card game where players cannot rearrange their hand — cards are held in the order dealt and may only be played from either end. On your turn you play a set that beats the current top combination, or you scout a card from the field, inserting it anywhere in your hand.",
    categories:["Card Game","Abstract"],players:"2-5",playTime:"20 min",
    complexity:1.4,bggRating:7.8,spineColor:"#c84b2f",boxSize:"sm",
    mechanics:["Hand Management","Ladder Climbing","Take That"]},
  418059:{id:"seti",name:"SETI: Search for Extraterrestrial Intelligence",bggId:418059,year:2024,designer:"Tomáš Holek",
    description:"Players run competing research organizations scanning the cosmos for alien signals, launching probes, analyzing data, and advancing technologies across a modular board representing deep space. The asymmetric factions and layered action-selection create an engine-building race where different scientific breakthroughs score differently for each player.",
    categories:["Strategy","Euro","Engine Building"],players:"1-4",playTime:"40-160 min",
    complexity:3.84,bggRating:8.4,spineColor:"#0d1b3e",boxSize:"lg",
    mechanics:["Action Selection","Engine Building","Variable Player Powers","Solo / Solitaire Game"]},
  9220:{id:"saboteur",name:"Saboteur",bggId:9220,year:2004,designer:"Fréderic Moyersoen",
    description:"A hidden-role card game where dwarf miners race to dig a tunnel to the gold, but one or more secret saboteurs among them want the excavation to fail. Players play path cards to extend the mine or action cards to block tools and destroy tunnels, with identities only revealed at round's end.",
    categories:["Card Game","Party","Deduction"],players:"3-10",playTime:"30 min",
    complexity:1.4,bggRating:6.6,spineColor:"#7a5c1e",boxSize:"sm",
    mechanics:["Hand Management","Hidden Roles","Take That"]},
  377470:{id:"sail",name:"Sail",bggId:377470,year:2023,designer:"Akiyama Koryo, Kozu Yusei",
    description:"A two-player cooperative trick-taking game where partners sail a ship together by winning tricks to fill wind and current conditions. Players must communicate only through the cards they play, reading the situation to time their contributions and steer the vessel safely to its destination.",
    categories:["Co-op","Card Game","Abstract"],players:"2-2",playTime:"20 min",
    complexity:2.21,bggRating:7.3,spineColor:"#1e5f8c",boxSize:"sm",
    mechanics:["Cooperative Game","Trick-taking"]},
  169786:{id:"scythe",name:"Scythe",bggId:169786,year:2016,designer:"Jamey Stegmaier",
    description:"An alternate-history 1920s Europe game where factions of mechs and workers compete to control a mysterious factory on a modular board. Players choose from five actions each turn using a personal action mat — the catch being you cannot repeat your previous action — building an economic engine while positioning for military confrontations that rarely escalate into full war.",
    categories:["Strategy","Area Control","Engine Building"],players:"1-5",playTime:"115 min",
    complexity:3.4,bggRating:8.2,spineColor:"#4a3728",boxSize:"xl",
    mechanics:["Area Majority / Influence","Engine Building","Variable Player Powers","Action Retrieval","Solo / Solitaire Game"]},
  408180:{id:"shackleton_base",name:"Shackleton Base: A Journey to the Moon",bggId:408180,year:2024,designer:"Fabio Lopiano, Nestore Mangone",
    description:"Players are competing space agencies developing a permanent lunar base at the Moon's south pole, managing resources, constructing facilities, and sending specialists to complete missions. A rondel-driven action system governs resource extraction and building, while shared infrastructure creates interdependence and tension between rivals.",
    categories:["Strategy","Euro","Worker Placement"],players:"1-4",playTime:"60-120 min",
    complexity:3.93,bggRating:8.0,spineColor:"#2c3d5a",boxSize:"lg",
    mechanics:["Rondel","Worker Placement","Network and Route Building","Variable Setup"]},
  15062:{id:"shadows_over_camelot",name:"Shadows over Camelot",bggId:15062,year:2005,designer:"Bruno Cathala, Serge Laget",
    description:"King Arthur's knights cooperate to complete quests — retrieving Excalibur, defending Camelot, seeking the Grail — while Siege engines accumulate and evil progresses. The twist is that one player may secretly be a traitor working to ensure the knights fail, creating paranoia and uncertainty at the table throughout.",
    categories:["Co-op","Thematic","Adventure"],players:"3-7",playTime:"60-90 min",
    complexity:2.5,bggRating:7.1,spineColor:"#6b1a1a",boxSize:"lg",
    mechanics:["Cooperative Game","Hidden Roles","Hand Management","Variable Player Powers"]},
  2511:{id:"sherlock_holmes_consulting_detective",name:"Sherlock Holmes Consulting Detective: The Thames Murders & Other Cases",bggId:2511,year:1981,designer:"Raymond Edwards, Suzanne Goldberg, Gary Grady",
    description:"Players become investigators working through ten interconnected murder cases set in Victorian London, consulting newspapers, directories, and a map to visit witnesses and gather clues. There are no game mechanics in the traditional sense — success depends entirely on deductive reasoning, and your score is compared to Holmes's own solution path.",
    categories:["Deduction","Adventure","Co-op"],players:"1-8",playTime:"60-120 min",
    complexity:2.66,bggRating:7.6,spineColor:"#3a2a1a",boxSize:"md",
    mechanics:["Cooperative Game","Narrative Choice / Paragraph","Role Playing"]},
  386366:{id:"shipwrights_of_the_north_sea_redux",name:"Shipwrights of the North Sea: Redux",bggId:386366,year:2024,designer:"Shem Phillips",
    description:"A Viking-era worker placement game where players compete to construct the greatest longships by gathering timber, wool, and iron from a shared marketplace and hiring skilled craftsmen. The revised edition overhauls card art and component quality while preserving the original's tight engine of resource collection and ship construction.",
    categories:["Strategy","Euro","Worker Placement"],players:"1-5",playTime:"60-80 min",
    complexity:2.7,bggRating:7.6,spineColor:"#2e4a3a",boxSize:"md",
    mechanics:["Worker Placement","Hand Management","Set Collection"]},
  55600:{id:"shipyard",name:"Shipyard",bggId:55600,year:2009,designer:"Vladimír Suchý",
    description:"Players run competing shipyards, assembling steamships piece by piece from bow to stern before sending them on voyages for prestige. A canal-like action track moves you through resource acquisition, hiring specialists, and completing ships — the further around the track a space is, the longer until you return to it.",
    categories:["Strategy","Euro","Engine Building"],players:"2-4",playTime:"120 min",
    complexity:3.6,bggRating:7.3,spineColor:"#1a3a5e",boxSize:"lg",
    mechanics:["Action Selection","Network and Route Building","Set Collection","Track Movement"]},
  196379:{id:"shit_happens",name:"Shit Happens",bggId:196379,year:2016,designer:"Andy Breckman",
    description:"A party card game of relative misfortune where players must correctly rank nasty scenarios by their official Misery Index score. Each turn you see a new situation and must decide where it falls in your ordered row of cards — too high or too low and the card goes to another player.",
    categories:["Party","Card Game"],players:"2-8",playTime:"20-60 min",
    complexity:1.0,bggRating:5.3,spineColor:"#8b2a2a",boxSize:"sm",
    mechanics:["Ordering","Simultaneous Action Selection"]},
  239175:{id:"shiver_me_timbers",name:"Shiver Me Timbers",bggId:239175,year:2021,designer:"Michal Vitkovsky",
    description:"A pirate-themed adventure game where players captain ships across an archipelago, trading goods, hiring crew, and raiding rivals to amass the greatest fortune. The open-world feel comes from a modular island map and emergent conflicts as players compete over the same trade routes and buried treasures.",
    categories:["Strategy","Adventure","Thematic"],players:"2-4",playTime:"90-150 min",
    complexity:3.35,bggRating:7.9,spineColor:"#1a3e5a",boxSize:"lg",
    mechanics:["Hand Management","Modular Board","Route/Network Building","Variable Player Powers"]},
  373106:{id:"sky_team",name:"Sky Team",bggId:373106,year:2023,designer:"Luc Rémond",
    description:"A two-player cooperative game where one player is the pilot and the other the co-pilot of a commercial airliner, silently assigning dice to cockpit controls to land the plane safely. Communication is prohibited during dice placement, so partners must read each other's intentions and manage speed, altitude, engine power, and brake deployment without speaking.",
    categories:["Co-op","Dice","Strategy"],players:"2-2",playTime:"20 min",
    complexity:2.04,bggRating:8.1,spineColor:"#1b3a6b",boxSize:"sm",
    mechanics:["Cooperative Game","Dice Placement","Simultaneous Action Selection"]},
  359438:{id:"skymines",name:"Skymines",bggId:359438,year:2022,designer:"Viktor Kobilke, Alexander Pfister",
    description:"A reimagining of Mombasa set on the moon where players invest in competing mining corporations, expand their networks of extraction sites, and build up personal action tracks across five areas. The interplay between hand management and the advancement tracks rewards players who plan several turns ahead and read the corporate stock trajectories.",
    categories:["Strategy","Euro","Deck Building"],players:"1-4",playTime:"75-150 min",
    complexity:4.0,bggRating:7.8,spineColor:"#1f2e4a",boxSize:"lg",
    mechanics:["Deck Building","Hand Management","Network and Route Building","Stock Holding"]},
  338960:{id:"slay_the_spire",name:"Slay the Spire: The Board Game",bggId:338960,year:2024,designer:"Gary Dworetsky, Anthony Giovannetti, Casey Yano",
    description:"A cooperative adaptation of the video game where players ascend a procedurally generated dungeon, building card-based combat decks and acquiring relics that alter the rules. Each character starts with a different starter deck and evolves uniquely as the group fights monsters and chooses paths through branching encounter maps.",
    categories:["Co-op","Deck Building","Campaign"],players:"1-4",playTime:"30-150 min",
    complexity:3.0,bggRating:8.6,spineColor:"#2a1a3e",boxSize:"xl",
    mechanics:["Cooperative Game","Deck Building","Modular Board","Variable Player Powers"]},
  255984:{id:"sleeping_gods",name:"Sleeping Gods",bggId:255984,year:2021,designer:"Ryan Laukat",
    description:"A narrative campaign game where players are the crew of a 1929 steam ship transported to a strange atlas of islands, searching for totems to awaken the gods and return home. The atlas is a large hand-illustrated map explored by moving the ship between ports and encounters, with persistent consequences tracked across sessions.",
    categories:["Adventure","Campaign","Thematic"],players:"1-4",playTime:"60-1200 min",
    complexity:3.26,bggRating:8.2,spineColor:"#1a2e4a",boxSize:"xl",
    mechanics:["Cooperative Game","Narrative Choice / Paragraph","Modular Board","Action Points"]},
  358320:{id:"sleeping_gods_distant_skies",name:"Sleeping Gods: Distant Skies",bggId:358320,year:2023,designer:"Ryan Laukat",
    description:"A standalone companion to Sleeping Gods where players pilot an airship through a surreal sky world in search of totems, encountering strange civilizations and ancient dangers. The adventure uses the same exploration and card-driven combat system as the original but features an entirely new illustrated atlas and story.",
    categories:["Co-op","Adventure","Campaign"],players:"1-4",playTime:"60-600 min",
    complexity:3.0,bggRating:8.3,spineColor:"#2a3e5a",boxSize:"xl",
    mechanics:["Cooperative Game","Narrative Choice / Paragraph","Modular Board","Action Points"]},
  40692:{id:"small_world",name:"Small World",bggId:40692,year:2009,designer:"Philippe Keyaerts",
    description:"A fantasy area-control game where races of orcs, elves, dwarves, and more compete for territory on an intentionally overcrowded map. Each race is paired with a random special power at game start, and when a race is too spread thin, you send it into decline and pick an entirely new one — encouraging aggressive expansion and creative power combinations.",
    categories:["Strategy","Area Control","Thematic"],players:"2-5",playTime:"40-80 min",
    complexity:2.2,bggRating:7.1,spineColor:"#4a7a3e",boxSize:"md",
    mechanics:["Area Majority / Influence","Variable Player Powers","Take That","Deck Building"]},
  122522:{id:"smash_up",name:"Smash Up",bggId:122522,year:2012,designer:"Paul Peterson",
    description:"A shufflebuilding game where each player selects two faction decks — pirates, ninjas, zombies, aliens, and more — and shuffles them into a single 40-card deck. Players then race to capture bases by accumulating enough minion and action power, with each faction interaction producing wild and surprising combo chains.",
    categories:["Card Game","Thematic","Strategy"],players:"2-4",playTime:"45 min",
    complexity:2.06,bggRating:6.7,spineColor:"#8b1a4a",boxSize:"md",
    mechanics:["Hand Management","Area Majority / Influence","Take That","Variable Player Powers"]},
  329839:{id:"so_clover",name:"So Clover!",bggId:329839,year:2021,designer:"François Romain",
    description:"A cooperative word-association game where each player writes one clue for each pair of adjacent keywords on their four-sided clover card, then the group collaboratively reconstructs whose clues belong to which board and in what orientation. The deduction phase — piecing together the original arrangements — is where the laughs and misdirections emerge.",
    categories:["Co-op","Party","Card Game"],players:"3-6",playTime:"30 min",
    complexity:1.12,bggRating:7.6,spineColor:"#2a7a3e",boxSize:"sm",
    mechanics:["Cooperative Game","Deduction","Word Association"]},
  38453:{id:"space_alert",name:"Space Alert",bggId:38453,year:2008,designer:"Vlaada Chvátil",
    description:"A real-time cooperative game played against a ten-minute audio track that announces incoming threats to your spaceship. During the action phase, players simultaneously program a sequence of moves and actions; afterward, the program runs and the group discovers whether their plan actually worked — or spectacularly failed.",
    categories:["Co-op","Strategy","Thematic"],players:"1-5",playTime:"30 min",
    complexity:3.1,bggRating:7.4,spineColor:"#0d2a4a",boxSize:"md",
    mechanics:["Cooperative Game","Real-Time","Action Queue","Programmed Movement"]},
  293296:{id:"splendor_marvel",name:"Splendor: Marvel",bggId:293296,year:2020,designer:"Marc André",
    description:"A Marvel-skinned redesign of Splendor where players recruit heroes to form teams, collect Infinity Stones as currency, and compete to recruit the most powerful Avengers and Guardians. Locations replace the original's noble tiles, and hero cards still chain into powerful free recruitment as your team grows.",
    categories:["Strategy","Card Game","Family"],players:"2-4",playTime:"30 min",
    complexity:1.8,bggRating:7.6,spineColor:"#8b1a1a",boxSize:"md",
    mechanics:["Set Collection","Hand Management","Engine Building"]},
  271896:{id:"star_wars_outer_rim",name:"Star Wars: Outer Rim",bggId:271896,year:2019,designer:"Corey Konieczka, Tony Fanchi",
    description:"An open-world adventure game where players take on roles of iconic scoundrels — Boba Fett, Han Solo, Greedo — roaming the outer rim completing jobs, upgrading ships, and building a crew while managing bounties on their heads. Fame tracks and patrol encounters give each session a different competitive tension as outlaws pursue their own agendas.",
    categories:["Adventure","Thematic","Strategy"],players:"1-4",playTime:"120-180 min",
    complexity:2.6,bggRating:7.8,spineColor:"#2a1a0d",boxSize:"xl",
    mechanics:["Hand Management","Modular Board","Variable Player Powers","Route/Network Building"]},
  374173:{id:"star_wars_deckbuilding",name:"Star Wars: The Deckbuilding Game",bggId:374173,year:2023,designer:"Caleb Grace",
    description:"A head-to-head deckbuilding game where one player commands the Rebel Alliance and the other the Galactic Empire, each acquiring iconic characters and vehicles to attack the opponent's bases. Destroying three enemy bases wins the game, and a central galaxy row of cards shifts with each purchase, creating dynamic card availability.",
    categories:["Deck Building","Card Game","Strategy"],players:"2-2",playTime:"30 min",
    complexity:2.05,bggRating:7.8,spineColor:"#1a1a2e",boxSize:"md",
    mechanics:["Deck Building","Hand Management","Take That"]},
  257193:{id:"starcadia_quest",name:"Starcadia Quest",bggId:257193,year:2020,designer:"Leo Almeida, Thiago Aranha, Guilherme Goulart, Eric M. Lang, Fred Perret",
    description:"A sci-fi dungeon-crawl campaign game where teams of galactic heroes battle through modular space stations in a PvE-meets-PvP structure — players cooperate against the boss but compete to land the killing blow and earn glory. Heroes level up, collect loot, and unlock new abilities across a branching campaign.",
    categories:["Adventure","Thematic","Campaign"],players:"2-4",playTime:"60 min",
    complexity:2.67,bggRating:7.4,spineColor:"#2a1a4e",boxSize:"xl",
    mechanics:["Dice Rolling","Modular Board","Take That","Variable Player Powers","Campaign / Legacy"]},
  329845:{id:"stella_dixit_universe",name:"Stella: Dixit Universe",bggId:329845,year:2021,designer:"Gérald Cattiaux, Jean-Louis Roubira",
    description:"A word-association game in the Dixit universe where all players simultaneously write a secret word they believe connects several cards in the central display, then reveal and score points for matching others without matching everyone. The risk-reward of picking popular versus niche associations gives it a distinct feel from Dixit itself.",
    categories:["Party","Card Game","Family"],players:"3-6",playTime:"30 min",
    complexity:1.3,bggRating:7.2,spineColor:"#3a1a5e",boxSize:"sm",
    mechanics:["Simultaneous Action Selection","Voting","Pattern Recognition"]},
  34635:{id:"stone_age",name:"Stone Age",bggId:34635,year:2008,designer:"Bernd Brunnhofer",
    description:"A prehistoric worker placement game where players send tribe members to hunt, farm, gather resources, and build huts and tools on a communal board. Feeding your workers at round's end is a constant pressure, and a single resource-gathering roll introduces just enough luck to keep the euro-planning accessible to newcomers.",
    categories:["Strategy","Euro","Worker Placement"],players:"2-4",playTime:"60-90 min",
    complexity:2.5,bggRating:7.4,spineColor:"#8b6a2a",boxSize:"lg",
    mechanics:["Worker Placement","Dice Rolling","Set Collection","End Game Bonuses"]},
  341530:{id:"super_mega_lucky_box",name:"Super Mega Lucky Box",bggId:341530,year:2021,designer:"Phil Walker-Harding",
    description:"A flip-and-write game where players draft small card sets and cross off numbers on personal 3x3 bingo-style grids, completing rows and columns to trigger chain reactions and bonus actions. The escalating combos from completed lines make each card selection feel impactful despite the game's light footprint.",
    categories:["Dice","Family","Card Game"],players:"1-6",playTime:"20 min",
    complexity:1.3,bggRating:7.0,spineColor:"#e07b1a",boxSize:"sm",
    mechanics:["Flip and Write","Set Collection","Simultaneous Action Selection"]},
  133473:{id:"sushi_go",name:"Sushi Go!",bggId:133473,year:2013,designer:"Phil Walker-Harding",
    description:"A fast card-drafting game where players simultaneously choose one card from their hand and pass the rest, collecting sets of sushi dishes that score differently depending on who has the most, the fewest, or complete combinations. Three short rounds keep the game breezy while the hidden drafting adds light strategic tension.",
    categories:["Card Game","Family","Party"],players:"2-5",playTime:"15 min",
    complexity:1.2,bggRating:7.0,spineColor:"#e02a5a",boxSize:"sm",
    mechanics:["Card Drafting","Hand Management","Set Collection"]},
  181289:{id:"terra_mystica_big_box",name:"Terra Mystica: Big Box",bggId:181289,year:2015,designer:"Jens Drögemüller, Helge Ostertag",
    description:"A deep fantasy area-expansion game where fourteen asymmetric factions terraform a shared landscape of seven terrain types, each building on only their home terrain while paying to convert adjacent land. The base game and both expansions are included, adding factions, maps, and additional cult track and town tile options.",
    categories:["Strategy","Euro","Area Control"],players:"2-5",playTime:"60-150 min",
    complexity:3.9,bggRating:8.5,spineColor:"#2a4a1a",boxSize:"xl",
    mechanics:["Area Majority / Influence","Network and Route Building","Variable Player Powers","Income","End Game Bonuses"]},
  364186:{id:"terra_nova",name:"Terra Nova",bggId:364186,year:2022,designer:"Andreas Faul",
    description:"A streamlined area-enclosure game inspired by Terra Mystica where players expand their faction's settlements across a shared terrain, scoring by enclosing regions and building structures. Simplified resource and cult systems make the strategic landscape accessible without sacrificing the satisfaction of tight territorial competition.",
    categories:["Strategy","Euro","Abstract"],players:"2-4",playTime:"60-90 min",
    complexity:2.87,bggRating:7.2,spineColor:"#3a6a2a",boxSize:"md",
    mechanics:["Area Majority / Influence","Network and Route Building","Variable Player Powers"]},
  350458:{id:"terracotta_army",name:"Terracotta Army",bggId:350458,year:2022,designer:"Przemysław Fornal, Adam Kwapiński",
    description:"Players are workshops competing to craft the most distinguished warriors for the First Emperor's burial mound, placing workers on a rotating central wheel to gather clay, tools, and craftsmen. The unique rondel-like action wheel forces you to plan ahead as spaces shift each round, rewarding long-term efficiency over short-term grabs.",
    categories:["Strategy","Euro","Worker Placement"],players:"1-4",playTime:"90-120 min",
    complexity:3.4,bggRating:7.4,spineColor:"#8b5a2a",boxSize:"lg",
    mechanics:["Worker Placement","Rondel","Set Collection","End Game Bonuses"]},
  167791:{id:"terraforming_mars",name:"Terraforming Mars",bggId:167791,year:2016,designer:"Jacob Fryxelius",
    description:"Players are corporations competing to raise oxygen, temperature, and ocean coverage on Mars to habitable levels while building the highest-scoring personal engine of cities, greeneries, and special projects. Hundreds of unique project cards drive wildly different strategies, and the corporation selection at setup determines your starting economic engine.",
    categories:["Strategy","Euro","Engine Building"],players:"1-5",playTime:"120 min",
    complexity:3.2,bggRating:8.4,spineColor:"#8b3a1a",boxSize:"lg",
    mechanics:["Card Drafting","Hand Management","Tableau Building","Engine Building","Solo / Solitaire Game"]},
  371433:{id:"terrorscape",name:"Terrorscape",bggId:371433,year:2023,designer:"Jeffrey CCH",
    description:"A hidden-movement horror game where one player takes the role of a slasher villain stalking survivors through a haunted location, while the other players cooperate to complete objectives and escape. The asymmetric roles create a tense cat-and-mouse dynamic as survivors deduce the killer's position from clues and noise tokens.",
    categories:["Thematic","Deduction","Co-op"],players:"2-4",playTime:"30-45 min",
    complexity:2.27,bggRating:8.1,spineColor:"#2a0a0a",boxSize:"md",
    mechanics:["Hidden Movement","Cooperative Game","Deduction","Variable Player Powers"]},
  180263:{id:"the_7th_continent",name:"The 7th Continent",bggId:180263,year:2017,designer:"Ludovic Roudy, Bruno Sautter",
    description:"A solo or cooperative exploration game where players wander a vast, folding card-based continent trying to lift an ancient curse that kills the explorer at a random moment. The continent unfolds as you move, with every action — walking, searching, crafting, fighting — consuming cards from a shared action deck that also functions as your life total.",
    categories:["Co-op","Adventure","Campaign"],players:"1-4",playTime:"5-1000 min",
    complexity:2.9,bggRating:7.7,spineColor:"#2a4a1a",boxSize:"xl",
    mechanics:["Cooperative Game","Narrative Choice / Paragraph","Modular Board","Hand Management","Solo / Solitaire Game"]},
  336844:{id:"binding_of_isaac_four_souls_requiem",name:"The Binding of Isaac: Four Souls Requiem",bggId:336844,year:2023,designer:"Edmund McMillen",
    description:"A competitive card game based on the video game where players collect soul cards by defeating monsters using loot cards and items from personal play areas, with the first to four souls winning. Chaotic interaction between hundreds of items and loot effects rewards familiarity with the dense combo possibilities drawn from the cult PC game.",
    categories:["Card Game","Thematic","Strategy"],players:"1-4",playTime:"20-60 min",
    complexity:2.72,bggRating:8.3,spineColor:"#3a2a0a",boxSize:"md",
    mechanics:["Hand Management","Take That","Variable Player Powers","Deck Building"]},
  325038:{id:"the_brambles",name:"The Brambles: A Solo Card Game",bggId:325038,year:2020,designer:"John Burton",
    description:"A compact solo card game where the player navigates a thorny forest of overlapping cards, revealing paths and managing a limited hand to reach an exit before resources run out. Simple rules create a tight spatial puzzle that fits in a pocket while delivering meaningful decisions across its short play time.",
    categories:["Solo","Card Game","Puzzle"],players:"1-1",playTime:"15-25 min",
    complexity:2.0,bggRating:7.3,spineColor:"#2a4a1a",boxSize:"sm",
    mechanics:["Cooperative Game","Solo / Solitaire Game","Hand Management","Puzzle"]},
  271320:{id:"castles_of_burgundy",name:"The Castles of Burgundy",bggId:271320,year:2019,designer:"Stefan Feld",
    description:"Players are medieval princes developing their personal estates by drafting hex tiles — mines, pastures, cities, monasteries — and placing them in matching regions for immediate and end-game bonuses. Two dice rolled each turn determine which tiles are available, but a silver token system lets you compensate for bad rolls, keeping luck from overwhelming planning.",
    categories:["Strategy","Euro","Dice"],players:"1-4",playTime:"70-120 min",
    complexity:3.0,bggRating:8.5,spineColor:"#6b3a1a",boxSize:"lg",
    mechanics:["Dice Rolling","Tile Placement","Set Collection","End Game Bonuses"]},
  284083:{id:"the_crew_quest_for_planet_nine",name:"The Crew: The Quest for Planet Nine",bggId:284083,year:2019,designer:"Thomas Sing",
    description:"A cooperative trick-taking game where players work together to complete 50 missions, each assigning specific cards as tasks that must be won by designated players in the correct order. Communication is limited to a single token per round, so reading your partners' leads and adjusting on the fly is the core challenge.",
    categories:["Co-op","Card Game","Deduction"],players:"2-5",playTime:"20 min",
    complexity:2.0,bggRating:7.8,spineColor:"#0d2a4a",boxSize:"sm",
    mechanics:["Cooperative Game","Trick-taking","Hand Management","Campaign / Legacy"]},
  429293:{id:"fellowship_of_the_ring_trick_taking",name:"The Fellowship of the Ring: Trick-Taking Game",bggId:429293,year:2025,designer:"Bryan Bornmueller",
    description:"A cooperative trick-taking game following the Fellowship's journey from the Shire to Mordor, where players must collectively win tricks in ways that fulfill quest objectives without communicating card contents. Each chapter presents new constraints and dangers that map the story beats onto evolving trick-taking rules.",
    categories:["Co-op","Card Game","Adventure"],players:"1-4",playTime:"20 min",
    complexity:2.0,bggRating:8.0,spineColor:"#2a3a1a",boxSize:"sm",
    mechanics:["Cooperative Game","Trick-taking","Hand Management"]},
  173090:{id:"the_game",name:"The Game",bggId:173090,year:2015,designer:"Steffen Benndorf",
    description:"A cooperative card game where players collectively try to play all 98 numbered cards onto four discard piles — two counting up, two counting down — without violating pile direction. Limited communication rules make coordinating who plays what and when surprisingly tense, and losing by a handful of cards feels devastatingly close.",
    categories:["Co-op","Card Game","Abstract"],players:"1-5",playTime:"20 min",
    complexity:1.24,bggRating:6.7,spineColor:"#1a1a3a",boxSize:"sm",
    mechanics:["Cooperative Game","Hand Management","Sorting"]},
  195539:{id:"the_godfather_corleones_empire",name:"The Godfather: Corleone's Empire",bggId:195539,year:2017,designer:"Eric M. Lang",
    description:"A streamlined area-control game set in the Godfather's New York where mob families compete to control neighborhoods through worker placement and extortion. Each round, underbosses and thugs occupy city locations to collect cash and favors, but at the end of each act, most workers are recalled and the Don cleans up loose ends — the player with the most money wins.",
    categories:["Strategy","Area Control","Thematic"],players:"2-5",playTime:"60-90 min",
    complexity:2.6,bggRating:7.5,spineColor:"#1a1a1a",boxSize:"md",
    mechanics:["Area Majority / Influence","Worker Placement","Hand Management","Take That"]},
  929:{id:"the_great_dalmuti",name:"The Great Dalmuti",bggId:929,year:1995,designer:"Richard Garfield",
    description:"A card shedding game of social hierarchy where players race to empty their hands and climb the ranks from Greater Dalmuti to lowly Peon. Each round reshuffles the social order based on performance, creating a lively and often hilarious power dynamic.",
    categories:["Card Game","Party","Family"],players:"4-8",playTime:"60 min",
    complexity:1.2,bggRating:6.5,spineColor:"#8B1A1A",boxSize:"sm",
    mechanics:["Hand Management","Shedding"]},
  281259:{id:"the_isle_of_cats",name:"The Isle of Cats",bggId:281259,year:2019,designer:"Frank West",
    description:"Players are explorers rescuing cats from a cursed island by drafting polyomino cat tiles and fitting them into their boats. The puzzle of arranging cats into families while managing lesson cards creates a rich blend of drafting and spatial optimization.",
    categories:["Euro","Puzzle","Family"],players:"1-4",playTime:"60-90 min",
    complexity:2.37,bggRating:7.6,spineColor:"#E8A020",boxSize:"md",
    mechanics:["Tile Placement","Drafting","Hand Management"]},
  245655:{id:"the_kings_dilemma",name:"The King's Dilemma",bggId:245655,year:2019,designer:"Hjalmar Hach, Lorenzo Silva",
    description:"A legacy narrative game where players represent noble houses advising a king through a series of moral and political dilemmas that permanently alter the kingdom. Choices ripple across sessions as the kingdom's stats shift and the story evolves based on collective decisions.",
    categories:["Thematic","Campaign","Card Game"],players:"3-5",playTime:"45-60 min",
    complexity:2.26,bggRating:7.6,spineColor:"#4A2060",boxSize:"md",
    mechanics:["Voting","Legacy","Hand Management"]},
  244992:{id:"the_mind",name:"The Mind",bggId:244992,year:2018,designer:"Wolfgang Warsch",
    description:"A cooperative card game where players must silently play numbered cards in ascending order without communicating, relying purely on intuition and timing. The tension escalates as the deck grows and the team must synchronize without words.",
    categories:["Card Game","Co-op","Party"],players:"2-4",playTime:"20 min",
    complexity:1.0,bggRating:6.7,spineColor:"#1A1A4E",boxSize:"sm",
    mechanics:["Cooperative","Real-Time","Hand Management"]},
  172047:{id:"the_others",name:"The Others",bggId:172047,year:2016,designer:"Eric M. Lang",
    description:"An asymmetric miniature game where one player controls a demonic force of one of the Seven Sins while other players cooperate as the FAITH organization fighting to stop them. Intense thematic combat takes place across a gritty urban environment filled with corruption and despair.",
    categories:["Thematic","Area Control","Adventure"],players:"2-5",playTime:"90 min",
    complexity:3.2,bggRating:7.3,spineColor:"#2B0A0A",boxSize:"lg",
    mechanics:["Dice Rolling","Variable Player Powers","Asymmetric"]},
  244521:{id:"the_quacks_of_quedlinburg",name:"The Quacks of Quedlinburg",bggId:244521,year:2018,designer:"Wolfgang Warsch",
    description:"Players are quack doctors brewing potions by drawing ingredient tokens from their own bags in a push-your-luck frenzy, hoping their cauldron doesn't explode. Between rounds, players purchase new ingredients to customize their bag and improve their brewing engine.",
    categories:["Family","Dice","Engine Building"],players:"2-4",playTime:"45 min",
    complexity:1.9,bggRating:7.8,spineColor:"#C04000",boxSize:"md",
    mechanics:["Push Your Luck","Bag Building","Engine Building"]},
  349955:{id:"the_quacks_of_quedlinburg_megabox",name:"The Quacks of Quedlinburg: MegaBox",bggId:349955,year:2021,designer:"Wolfgang Warsch",
    description:"A comprehensive collection of The Quacks of Quedlinburg base game bundled with major expansions including The Alchemists and The Herb Witches. It offers enormous variety in ingredient books and game modes, supporting up to five players with expanded content.",
    categories:["Family","Dice","Engine Building"],players:"2-5",playTime:"45-60 min",
    complexity:2.1,bggRating:8.2,spineColor:"#8B2500",boxSize:"xl",
    mechanics:["Push Your Luck","Bag Building","Engine Building"]},
  41114:{id:"the_resistance",name:"The Resistance",bggId:41114,year:2009,designer:"Don Eskridge",
    description:"A social deduction game of spies and traitors where resistance fighters try to complete missions while government spies secretly sabotage them. Players vote on mission teams and analyze behavior to root out the hidden spies in their midst.",
    categories:["Deduction","Party","Card Game"],players:"5-10",playTime:"30 min",
    complexity:1.6,bggRating:7.3,spineColor:"#1C3A1C",boxSize:"sm",
    mechanics:["Social Deduction","Voting","Hidden Roles"]},
  128882:{id:"the_resistance_avalon",name:"The Resistance: Avalon",bggId:128882,year:2012,designer:"Don Eskridge",
    description:"Set in the world of Arthurian legend, Avalon refines the Resistance formula with named roles like Merlin and the Assassin that add layers of hidden information and strategic deception. The loyal servants of Arthur must complete quests while Mordred's minions work to undermine them.",
    categories:["Deduction","Party","Card Game"],players:"5-10",playTime:"30 min",
    complexity:1.7,bggRating:7.6,spineColor:"#1A1A6E",boxSize:"sm",
    mechanics:["Social Deduction","Voting","Hidden Roles"]},
  371942:{id:"the_white_castle",name:"The White Castle",bggId:371942,year:2023,designer:"Isra C., Shei S.",
    description:"A worker placement and dice game set in feudal Japan where players send courtiers into the stunning Himeji Castle to gain influence and resources. The elegant design revolves around clever use of dice bridges to place workers at discounted costs.",
    categories:["Euro","Worker Placement","Dice"],players:"1-4",playTime:"80 min",
    complexity:3.07,bggRating:8.0,spineColor:"#C8B090",boxSize:"md",
    mechanics:["Worker Placement","Dice Placement","Action Selection"]},
  331106:{id:"the_witcher_old_world",name:"The Witcher: Old World",bggId:331106,year:2023,designer:"Łukasz Woźniak",
    description:"Players take on the roles of Witchers from rival schools traveling the Continent to slay monsters, explore locations, and build their combat decks in a time before Geralt. The game blends deck building and adventure with rich lore from the Witcher universe.",
    categories:["Adventure","Deck Building","Campaign"],players:"1-5",playTime:"90-150 min",
    complexity:2.88,bggRating:7.9,spineColor:"#2E4A1C",boxSize:"lg",
    mechanics:["Deck Building","Dice Rolling","Action Points"]},
  141019:{id:"thermopyles",name:"Thermopyles",bggId:141019,year:2013,designer:"Touko Tahkokallio",
    description:"A cooperative abstract game inspired by the Battle of Thermopylae where Spartan defenders must hold a narrow pass against overwhelming Persian forces. Players coordinate tile placement and unit positioning to survive wave after wave of attackers.",
    categories:["Co-op","Abstract","Strategy"],players:"1-4",playTime:"20 min",
    complexity:1.21,bggRating:3.9,spineColor:"#8B6914",boxSize:"sm",
    mechanics:["Cooperative","Tile Placement","Area Control"]},
  503:{id:"through_the_desert",name:"Through the Desert",bggId:503,year:1998,designer:"Reiner Knizia",
    description:"Players place pastel-colored camel trains across a desert landscape to claim oases and cut off opponents in this elegant abstract area-control game. The simultaneously simple and deep design rewards territorial thinking and long-term planning.",
    categories:["Abstract","Area Control","Strategy"],players:"2-5",playTime:"45 min",
    complexity:2.16,bggRating:7.1,spineColor:"#D4A050",boxSize:"md",
    mechanics:["Area Control","Network Building","Enclosure"]},
  14996:{id:"ticket_to_ride_europe",name:"Ticket to Ride: Europe",bggId:14996,year:2005,designer:"Alan R. Moon",
    description:"Players collect colored train cards to claim railway routes across a beautifully illustrated map of Europe, completing destination tickets for points. Tunnels, ferries, and stations add new strategic layers beyond the original Ticket to Ride.",
    categories:["Family","Strategy","Card Game"],players:"2-5",playTime:"30-60 min",
    complexity:1.9,bggRating:7.6,spineColor:"#2244AA",boxSize:"lg",
    mechanics:["Set Collection","Route Building","Hand Management"]},
  42:{id:"tigris_and_euphrates",name:"Tigris & Euphrates",bggId:42,year:1997,designer:"Reiner Knizia",
    description:"One of Knizia's masterpieces, players build ancient civilizations along the fertile crescent by placing tiles representing different aspects of society, with internal and external conflicts determining dominance. The unique scoring system rewards balanced development across all four civilization types.",
    categories:["Strategy","Abstract","Area Control"],players:"2-4",playTime:"60-120 min",
    complexity:3.5,bggRating:7.7,spineColor:"#B8860B",boxSize:"md",
    mechanics:["Tile Placement","Area Control","Conflict"]},
  351913:{id:"tiletum",name:"Tiletum",bggId:351913,year:2022,designer:"Simone Luciani, Daniele Tascini",
    description:"Set during the flourishing Renaissance, players travel across Europe to collect resources and construct magnificent buildings using a unique dice selection mechanism. The interplay between dice drafting and action activation creates a deeply strategic Euro experience.",
    categories:["Euro","Strategy","Worker Placement"],players:"1-4",playTime:"60-100 min",
    complexity:3.5,bggRating:7.9,spineColor:"#7B3F00",boxSize:"md",
    mechanics:["Dice Drafting","Action Selection","Route Building"]},
  321277:{id:"tinners_trail",name:"Tinners' Trail",bggId:321277,year:2021,designer:"Martin Wallace",
    description:"Players are Victorian-era mining entrepreneurs in Cornwall bidding on land parcels and extracting tin and copper while managing their companies' finances. The revised edition streamlines Wallace's original design into a tense economic contest of investment and exploitation.",
    categories:["Euro","Strategy"],players:"1-5",playTime:"60-90 min",
    complexity:3.0,bggRating:7.1,spineColor:"#5A7A5A",boxSize:"md",
    mechanics:["Bidding","Action Points","Network Building"]},
  201921:{id:"tiny_epic_quest",name:"Tiny Epic Quest",bggId:201921,year:2017,designer:"Scott Almes",
    description:"A pocket-sized adventure game where heroes explore a fantasy world to recover stolen ancient artifacts from marauding goblins, moving across a modular board by day and managing perilous quests by night. The ITEMeeples system cleverly incorporates equipment directly onto the hero meeples.",
    categories:["Adventure","Family","Solo"],players:"1-4",playTime:"30-60 min",
    complexity:2.69,bggRating:6.8,spineColor:"#2A5C2A",boxSize:"sm",
    mechanics:["Modular Board","Action Points","Hand Management"]},
  192135:{id:"too_many_bones",name:"Too Many Bones",bggId:192135,year:2017,designer:"Josh J. Carlson, Adam Carlson",
    description:"A cooperative RPG-style dice builder where players control unique Gearloc characters venturing across a dangerous world to defeat a Baddie threatening the land. The game features stunning production with custom dice representing each character's unique skills and abilities.",
    categories:["Co-op","Dice","Adventure"],players:"1-4",playTime:"60-120 min",
    complexity:3.87,bggRating:8.3,spineColor:"#3A6A3A",boxSize:"lg",
    mechanics:["Dice Building","Cooperative","Variable Player Powers"]},
  441548:{id:"trickerion_anniversary_edition",name:"Trickerion: Anniversary Edition",bggId:441548,year:2025,designer:"Richard Amann, Viktor Peter",
    description:"Players are rival stage magicians competing for fame in a dark steampunk city by learning spectacular tricks and performing them at the grand Trickerion theater. This anniversary edition collects the base game and expansions into one definitive package with updated components.",
    categories:["Euro","Worker Placement","Strategy"],players:"1-4",playTime:"60-180 min",
    complexity:4.59,bggRating:8.9,spineColor:"#1A0A2E",boxSize:"xl",
    mechanics:["Worker Placement","Action Planning","Hand Management"]},
  371873:{id:"trolls_and_princesses",name:"Trolls & Princesses",bggId:371873,year:2023,designer:"Pim Thunborg",
    description:"An asymmetric game where one side plays cunning trolls and the other plays resourceful princesses in a battle of wits across a fairy-tale landscape. Players use unique abilities to outsmart and outwit their opponents through clever card play and board positioning.",
    categories:["Thematic","Strategy","Family"],players:"2-4",playTime:"90-120 min",
    complexity:3.26,bggRating:7.5,spineColor:"#4A7A3A",boxSize:"md",
    mechanics:["Asymmetric","Action Selection","Hand Management"]},
  233078:{id:"twilight_imperium_fourth_edition",name:"Twilight Imperium: Fourth Edition",bggId:233078,year:2017,designer:"Dane Beltrami, Corey Konieczka, Christian T. Petersen",
    description:"An epic space opera of galactic conquest where 3-6 players command unique alien civilizations vying for control of the galaxy's seat of power through warfare, diplomacy, and political maneuvering. Each session is a massive multi-hour saga with shifting alliances and dramatic reversals.",
    categories:["Strategy","Area Control","Thematic"],players:"3-6",playTime:"240-480 min",
    complexity:4.3,bggRating:8.6,spineColor:"#0A0A3E",boxSize:"xl",
    mechanics:["Area Control","Diplomacy","Variable Player Powers"]},
  136284:{id:"uluru_neuer_tumult_am_ayers_rock",name:"Uluru: Neuer Tumult am Ayers Rock",bggId:136284,year:2013,designer:"Lauge Luchau",
    description:"A quick puzzle-like game set around the iconic Australian rock formation where players position animals on a circular board to score points through clever adjacency. Simple rules mask a surprising depth of spatial reasoning and tactical placement.",
    categories:["Abstract","Family","Puzzle"],players:"1-5",playTime:"20 min",
    complexity:1.5,bggRating:6.3,spineColor:"#C04000",boxSize:"sm",
    mechanics:["Tile Placement","Pattern Recognition"]},
  376740:{id:"undergrove",name:"Undergrove",bggId:376740,year:2024,designer:"Elizabeth Hargrave, Mark Wootton",
    description:"Players grow forests and build the underground fungal networks that connect trees, sharing nutrients and supporting the ecosystem in this gentle Euro game. Taking inspiration from forest ecology, players cultivate trees and mycorrhizal connections to score points and thrive.",
    categories:["Euro","Engine Building","Solo"],players:"1-4",playTime:"60-75 min",
    complexity:2.9,bggRating:7.0,spineColor:"#2A5C2A",boxSize:"md",
    mechanics:["Network Building","Engine Building","Set Collection"]},
  290484:{id:"unsettled",name:"Unsettled",bggId:290484,year:2021,designer:"Tom Mattson, Marc Neidlinger",
    description:"A cooperative survival game where players are stranded on bizarre alien worlds with unique rules and mechanics on each planet, struggling to gather resources and repair their ship. The game's modular planet design ensures no two sessions feel alike as players adapt to strange new environments.",
    categories:["Co-op","Adventure","Strategy"],players:"2-4",playTime:"60-90 min",
    complexity:3.29,bggRating:8.0,spineColor:"#204060",boxSize:"md",
    mechanics:["Cooperative","Modular Board","Hand Management"]},
  340325:{id:"vagrantsong",name:"Vagrantsong",bggId:340325,year:2022,designer:"Matt Carter, Justin Gibbs, Kyle Rowan",
    description:"A cooperative campaign game set on a haunted ghost train where players are drifters working together to help the spirits of the dead find peace and pass on. Each scenario unfolds a new ghostly story with evolving mechanics and character progression between sessions.",
    categories:["Co-op","Campaign","Thematic"],players:"2-4",playTime:"45-120 min",
    complexity:3.19,bggRating:7.4,spineColor:"#2A2A2A",boxSize:"md",
    mechanics:["Cooperative","Campaign","Dice Rolling"]},
  420033:{id:"vantage",name:"Vantage",bggId:420033,year:2025,designer:"Jamey Stegmaier",
    description:"Players build mountain communities in a stunning landscape, placing structures on tiered terrain to capture views and generate resources in this tableau-building Euro game. The layered mountain board creates a striking visual experience while rewarding clever spatial planning.",
    categories:["Euro","Engine Building","Strategy"],players:"1-6",playTime:"120-180 min",
    complexity:2.34,bggRating:8.2,spineColor:"#4A6A8A",boxSize:"lg",
    mechanics:["Tile Placement","Engine Building","Set Collection"]},
  7479:{id:"warcraft_the_board_game",name:"WarCraft: The Board Game",bggId:7479,year:2003,designer:"Kevin Wilson",
    description:"Based on Blizzard's legendary RTS video game, players command the armies of the Alliance or Horde across scenario maps, gathering resources and battling for control of the land. The game faithfully recreates the unit upgrade trees and faction asymmetry of its digital inspiration.",
    categories:["Thematic","Area Control","Strategy"],players:"2-4",playTime:"120 min",
    complexity:2.76,bggRating:6.1,spineColor:"#5A1A00",boxSize:"lg",
    mechanics:["Area Control","Variable Player Powers","Dice Rolling"]},
  274364:{id:"watergate",name:"Watergate",bggId:274364,year:2019,designer:"Matthias Cramer",
    description:"A tense two-player card-driven game recreating the political crisis as one player controls the Nixon administration trying to stonewall investigations while the other plays determined journalists racing to connect informants to the President. Momentum cards create swinging narrative tension in every game.",
    categories:["Strategy","Card Game","Deduction"],players:"2-2",playTime:"30-60 min",
    complexity:2.3,bggRating:7.7,spineColor:"#1A1A1A",boxSize:"sm",
    mechanics:["Card Drafting","Asymmetric","Network Building"]},
  262543:{id:"wavelength",name:"Wavelength",bggId:262543,year:2019,designer:"Alex Hague, Justin Vickers, Wolfgang Warsch",
    description:"A social party game where a clue giver tries to guide their team to the correct spot on a spectrum between two opposing concepts by giving a single clever clue. The game sparks hilarious debate about how concepts relate to each other on a psychic wavelength.",
    categories:["Party","Deduction","Card Game"],players:"2-12",playTime:"30-45 min",
    complexity:1.2,bggRating:7.2,spineColor:"#E040A0",boxSize:"md",
    mechanics:["Clue Giving","Deduction","Team Play"]},
  233867:{id:"welcome_to",name:"Welcome To...",bggId:233867,year:2018,designer:"Benoit Turpin",
    description:"A flip-and-write game where players are architects designing the perfect 1950s American suburb by assigning house numbers to streets and constructing parks and pools. Because everyone plays with the same cards simultaneously, it scales to any group size without conflict.",
    categories:["Family","Puzzle","Solo"],players:"1-100",playTime:"25 min",
    complexity:1.7,bggRating:7.5,spineColor:"#4A8AC0",boxSize:"sm",
    mechanics:["Roll and Write","Simultaneous Action","Set Collection"]},
  339789:{id:"welcome_to_the_moon",name:"Welcome to the Moon",bggId:339789,year:2021,designer:"Alexis Allard, Benoit Turpin",
    description:"A flip-and-write sequel to Welcome To... featuring eight standalone scenarios of increasing complexity that can be chained together into a campaign. Players fill rockets and lunar colonies with clever number placement as the narrative escalates from Earth to deep space.",
    categories:["Family","Puzzle","Campaign"],players:"1-6",playTime:"25-30 min",
    complexity:2.46,bggRating:7.7,spineColor:"#1A2A5E",boxSize:"sm",
    mechanics:["Roll and Write","Simultaneous Action","Campaign"]},
  232405:{id:"western_legends",name:"Western Legends",bggId:232405,year:2018,designer:"Hervé Lemaître",
    description:"An open-world sandbox game set in the American Wild West where players pursue their own legend as outlaws, lawmen, or everything in between through poker, cattle drives, and shootouts. The narrative freedom and emergent storytelling make every game a unique tale of the frontier.",
    categories:["Thematic","Adventure","Dice"],players:"2-6",playTime:"60-90 min",
    complexity:2.7,bggRating:7.5,spineColor:"#8B4513",boxSize:"lg",
    mechanics:["Sandbox","Action Points","Dice Rolling"]},
  422121:{id:"witness_the_treasure_of_othesis",name:"Witness: The Treasure of Othesis",bggId:422121,year:2024,designer:"Dominique Bodin",
    description:"A cooperative deduction game where four players must pass a secret clue around the table by whispering only to their neighbors, reconstructing the original message to solve a mystery. The telephone-game mechanic creates both hilarity and satisfying detective work as clues evolve through transmission.",
    categories:["Co-op","Deduction","Party"],players:"4-4",playTime:"10-25 min",
    complexity:1.5,bggRating:6.6,spineColor:"#6A3A1A",boxSize:"sm",
    mechanics:["Cooperative","Deduction","Clue Giving"]},
  227935:{id:"wonderlands_war",name:"Wonderland's War",bggId:227935,year:2022,designer:"Tim Eisner, Ben Eisner, Ian Moss",
    description:"Set in a twisted version of Wonderland, players act as Alice, the Queen of Hearts, and other iconic characters competing for control of the Mad Land through deck building and area control. Chaotic, colorful battles are resolved by drawing chips from a bag in a blend of bag building and deckbuilding.",
    categories:["Deck Building","Area Control","Thematic"],players:"2-5",playTime:"45-125 min",
    complexity:3.0,bggRating:7.9,spineColor:"#CC0066",boxSize:"lg",
    mechanics:["Deck Building","Bag Building","Area Control"]},
  2393:{id:"xiangqi",name:"Xiangqi",bggId:2393,year:762,designer:"(Uncredited)",
    description:"The ancient Chinese form of chess played on a 9x10 board with a river dividing the two sides, featuring unique pieces like the Cannon that must jump over another piece to capture. One of the most played games in human history, Xiangqi demands deep strategic planning and tactical precision.",
    categories:["Abstract","Strategy"],players:"2-2",playTime:"60 min",
    complexity:3.5,bggRating:7.1,spineColor:"#8B0000",boxSize:"sm",
    mechanics:["Grid Movement","Capture","Perfect Information"]},
  2243:{id:"yahtzee",name:"Yahtzee",bggId:2243,year:1956,designer:"Edwin S. Lowe",
    description:"A classic dice game where players roll and re-roll five dice up to three times per turn to achieve specific combinations for points, such as full houses, straights, and the coveted Yahtzee. Balancing risk and reward in choosing which categories to fill makes each turn a mini-decision.",
    categories:["Dice","Family","Party"],players:"2-10",playTime:"30 min",
    complexity:1.17,bggRating:5.6,spineColor:"#CC2200",boxSize:"sm",
    mechanics:["Dice Rolling","Push Your Luck","Set Collection"]},
  281466:{id:"yedo_deluxe_master_set",name:"Yedo: Deluxe Master Set",bggId:281466,year:2020,designer:"Thomas Vande Ginste, Wolf Plancke",
    description:"Players lead clans of samurai in feudal Edo-era Japan, sending agents across the city to complete missions and gain influence over the Shogun's court. The action selection system with its moving guard mechanic creates dynamic tension and shifting opportunities each round.",
    categories:["Euro","Worker Placement","Strategy"],players:"1-5",playTime:"60-90 min",
    complexity:3.3,bggRating:7.8,spineColor:"#8B1A1A",boxSize:"xl",
    mechanics:["Worker Placement","Action Selection","Set Collection"]},
  296557:{id:"zen_garden",name:"Zen Garden",bggId:296557,year:2020,designer:"Mike Georgiou",
    description:"A tranquil abstract game where players rake sand and place stones and plants to create a serene Japanese garden while scoring for patterns and symmetry. The soothing theme and beautiful components make this a meditative yet tactically interesting experience.",
    categories:["Abstract","Puzzle","Family"],players:"2-4",playTime:"30-40 min",
    complexity:1.8,bggRating:7.0,spineColor:"#8AB090",boxSize:"md",
    mechanics:["Tile Placement","Pattern Recognition","Area Control"]},
  9149:{id:"zitternix",name:"Zitternix",bggId:9149,year:2000,designer:"Heinz Meister",
    description:"A dexterity game where players carefully remove colored sticks from a bundle balanced on a hedgehog figure without causing the stack to collapse. Simple enough for young children but with genuine nail-biting tension in every trembling extraction.",
    categories:["Family","Party"],players:"2-4",playTime:"10 min",
    complexity:1.0,bggRating:6.0,spineColor:"#CC8800",boxSize:"sm",
    mechanics:["Dexterity","Push Your Luck"]},
  355433:{id:"boop",name:"boop.",bggId:355433,year:2022,designer:"Scott Brady",
    description:"A delightful two-player abstract game where players place kittens on a soft quilted bed, and each placement boops nearby pieces away in potentially chain-reactive fashion. The goal is to graduate three kittens into cats and align three cats in a row to win.",
    categories:["Abstract","Strategy"],players:"2-2",playTime:"20-30 min",
    complexity:1.36,bggRating:7.0,spineColor:"#E890B0",boxSize:"sm",
    mechanics:["Placement","Pattern Building","Displacement"]},
  0:{id:"i_geografia_einai_poly_koul",name:"Η γεωγραφία ειναι πολυ κουλ",bggId:0,year:0,designer:"Unknown",
    description:"A geography-themed party game celebrating how fascinating and fun the world of geography can be. Players engage with maps, locations, and spatial knowledge in a casual and entertaining setting.",
    categories:["Party","Family","Puzzle"],players:"2-8",playTime:"20-30 min",
    complexity:1.5,bggRating:7.0,spineColor:"#2080C0",boxSize:"sm",
    mechanics:["Trivia","Team Play"]},
  // Sold from Στιβ's shelf (2026-09): kept so their plays keep full details.
  281442:{id:"trismegistus",name:"Trismegistus: The Ultimate Formula",bggId:281442,year:2019,designer:"Federico Pierlorenzi, Daniele Tascini",
    description:"Players are alchemists competing to master the art of transmutation and claim the title of Hermes Trismegistus's successor. Each round, dice are rolled and players draft them by color — each color corresponds to one of three alchemical stages, and the die value determines how many steps you advance. Use acquired elements to perform experiments, complete publications, and craft artifacts for points. A follow mechanism lets others benefit from your chosen action at reduced effect. For players who enjoy dice drafting and heavy engine-building with interconnected systems.",
    categories:["Strategy","Euro","Dice"],players:"1-4",playTime:"90-120 min",
    complexity:4.19,bggRating:7.5,spineColor:"#3f3f2c",boxSize:"md",
    mechanics:["Action Points","Contracts","Dice Rolling","End Game Bonuses","Follow","Open Drafting"]},
  97842:{id:"last_will",name:"Last Will",bggId:97842,year:2011,designer:"Vladimír Suchý",
    description:"Your uncle's will states that his fortune goes to the nephew who can spend money the fastest. Players use worker placement and card play to burn through cash — buying depreciating properties, hiring expensive companions, hosting lavish events, and dining at overpriced restaurants. Properties lose value each turn, so buying high and selling low is the strategy. First player to go completely broke wins. A Euro played in reverse. For players who enjoy economic games with a comedic twist.",
    categories:["Strategy","Euro","Worker Placement"],players:"2-5",playTime:"45-75 min",
    complexity:2.72,bggRating:7.2,spineColor:"#4e3123",boxSize:"md",
    mechanics:["Action Points","Hand Management","Victory Points as a Resource","Worker Placement"]},
  361545:{id:"twilight_inscription",name:"Twilight Inscription",bggId:361545,year:2022,designer:"James Kniffen",
    description:"A roll-and-write game set in the Twilight Imperium universe. Each player has four large sheets — navigation, expansion, industry, and warfare — and uses shared dice rolls each round to fill in sections, unlock abilities, and score points. Event cards add narrative flavor and interaction between players. Supports up to eight players with minimal downtime since everyone writes simultaneously. For fans of Twilight Imperium who want the flavor without the eight-hour commitment.",
    categories:["Strategy","Euro"],players:"1-8",playTime:"90-120 min",
    complexity:3.21,bggRating:7.4,spineColor:"#13133f",boxSize:"md",
    mechanics:["Dice Rolling","Paper-and-Pencil","Variable Player Powers"]},
  245934:{id:"carpe_diem",name:"Carpe Diem",bggId:245934,year:2018,designer:"Stefan Feld",
    description:"Players are wealthy patricians in ancient Rome competing to build the most prestigious city district. Each turn you move a token along a shared selection track to draft a building tile, then place it in your personal grid. Buildings score based on adjacency and how well you fulfill end-game scoring cards, which are different each game. The selection track creates natural competition for tiles. A Stefan Feld design — elegant, modular scoring, and more depth than the setup suggests.",
    categories:["Strategy","Euro"],players:"2-4",playTime:"45-75 min",
    complexity:2.54,bggRating:7.5,spineColor:"#59707f",boxSize:"md",
    mechanics:["Area Movement","Contracts","End Game Bonuses","Open Drafting","Tile Placement","Turn Order: Progressive"]},
  312318:{id:"century_golem_os",name:"Century: Golem Edition",bggId:312318,year:2020,designer:"Emerson Matsuuchi",
    description:"A re-themed edition of Century: Spice Road with gorgeous golem artwork. Players build a card engine to acquire and upgrade gems, trading them for valuable golem cards.",
    categories:["Strategy","Card Game","Family"],players:"2-4",playTime:"30-45 min",
    complexity:2.16,bggRating:7.6,spineColor:"#2e86c1",boxSize:"sm",
    mechanics:["Card Drafting","Hand Management","Engine Building"]},
  // Imported through the app (these used to come only from Firebase); numbers checked against BGG, 2026-09.
  200680:{id:"imported_200680",name:"Agricola (Revised Edition)",bggId:200680,year:2016,designer:"Uwe Rosenberg",players:"1-4",playTime:"30-120 min",complexity:3.45,bggRating:8.0,urlImage:"https://cf.geekdo-images.com/YCGWJMFwOI5efji2RJ2mSw__original/img/jC_He46LcIcKWU-kSwkYdr9Z45E=/0x0/filters:format(jpeg)/pic8093340.jpg"},
  334649:{id:"imported_334649",name:"Bullet: Orange",bggId:334649,year:2021,designer:"Joshua Van Laningham",players:"1-4",playTime:"15-30 min",complexity:2.2,bggRating:8.1,urlImage:"https://cf.geekdo-images.com/NiU6SgW3L4tumEqpUtECag__original/img/MT5GGDpmCxvA4eiZmflOI5n0H24=/0x0/filters:format(jpeg)/pic9053253.jpg"},
  307305:{id:"imported_307305",name:"Bullet♥︎",bggId:307305,year:2021,designer:"Joshua Van Laningham",players:"1-4",playTime:"10-20 min",complexity:2.15,bggRating:7.6,urlImage:"https://cf.geekdo-images.com/315gnIdET7dlQ_fASt8p0w__original/img/X2MDGNIMouqDtC6617rzlxW5LDw=/0x0/filters:format(jpeg)/pic6007944.jpg"},
  147:{id:"imported_147",name:"Crude: The Oil Game",bggId:147,year:1974,designer:"James J. St. Laurent",players:"2-4",playTime:"90 min",complexity:2.73,bggRating:6.7,urlImage:"https://cf.geekdo-images.com/I3eBzN15oKeaTLEdjdUEXA__original/img/XAeJPfkjBXikQHsWt9OnbU2Pw44=/0x0/filters:format(jpeg)/pic1389675.jpg"},
  276182:{id:"imported_276182",name:"Dead Reckoning",bggId:276182,year:2022,designer:"John D. Clair",players:"1-4",playTime:"90-150 min",complexity:3.44,bggRating:8.1,urlImage:"https://cf.geekdo-images.com/4q_5Ox7oYtK3Ma73iRtfAg__original/img/67KL6z6m8eD2MprJ7JfsxXoAPlM=/0x0/filters:format(jpeg)/pic4650725.jpg"},
  397931:{id:"imported_397931",name:"Deep Regrets",bggId:397931,year:2025,designer:"Judson Cowan",players:"1-5",playTime:"30-150 min",complexity:2.34,bggRating:7.3,urlImage:"https://cf.geekdo-images.com/WUvpRzsNSZgq1gyvjiQcWw__original/img/wXnREOcKLkysXorXqRQXKslz-iI=/0x0/filters:format(jpeg)/pic8156363.jpg"},
  254683:{id:"imported_254683",name:"Dodos Riding Dinos",bggId:254683,year:2021,designer:"Rubén Hernández",players:"1-8",playTime:"20 min",complexity:1.63,bggRating:7.5,urlImage:"https://cf.geekdo-images.com/qqpMTyv4vy-q7qYpl0NLFA__original/img/zOuoaKc0Q3Zc8m1gJLxGJlqvrXI=/0x0/filters:format(png)/pic5182751.png"},
  463441:{id:"imported_463441",name:"Flip 7: With A Vengeance",bggId:463441,year:2026,designer:"Eric Olsen, Alyssa Swatek",players:"3-28",playTime:"20 min",complexity:1.05,bggRating:7.1,urlImage:"https://cf.geekdo-images.com/ZW3pPCcG069GkXkk7HSHlg__original/img/A-MS4ZUWEhiaDBSKChOq50Qcdnw=/0x0/filters:format(jpeg)/pic9385115.jpg"},
  360899:{id:"imported_360899",name:"Harrow County: The Game of Gothic Conflict",bggId:360899,year:2024,designer:"Jay Cormier, Shad",players:"1-3",playTime:"45-90 min",complexity:3.6,bggRating:7.7,urlImage:"https://cf.geekdo-images.com/dXOckpZFmnRjTGnPq8bH_A__original/img/rGJEOjI0nFaR6VG2VP8ssBMTKH0=/0x0/filters:format(png)/pic7104746.png"},
  271088:{id:"imported_271088",name:"Ishtar: Gardens of Babylon",bggId:271088,year:2019,designer:"Bruno Cathala, Evan Singh",players:"2-4",playTime:"45 min",complexity:2.28,bggRating:7.0,urlImage:"https://cf.geekdo-images.com/xXXGSdY52lm_CjMibn0aWQ__original/img/Wugkl4LbYYpP8IrCQ6vIlOVWyxQ=/0x0/filters:format(jpeg)/pic4775121.jpg"},
  1219:{id:"imported_1219",name:"Labyrinth",bggId:1219,year:1986,designer:"Max J. Kobbert",players:"2-4",playTime:"20 min",complexity:1.35,bggRating:6.4,urlImage:"https://cf.geekdo-images.com/qpL225YNN5iKRPotB7Q7MA__original/img/5ZGo501PquASeGxpQLBIglcVSYs=/0x0/filters:format(jpeg)/pic6173371.jpg"},
  143063:{id:"imported_143063",name:"Last Will: Getting Sacked",bggId:143063,year:2013,designer:"Vladimír Suchý",players:"2-5",playTime:"45-75 min",complexity:2.67,bggRating:7.5,urlImage:"https://cf.geekdo-images.com/tvUdzkyc5bne9hnqowl-HQ__original/img/H98XC9XNLqF8wcx5s6QPg1et8B4=/0x0/filters:format(jpeg)/pic1788540.jpg"},
  454103:{id:"imported_454103",name:"Magical Athlete",bggId:454103,year:2025,designer:"Richard Garfield, Takashi Ishida",players:"2-6",playTime:"30 min",complexity:1.21,bggRating:7.8,urlImage:"https://cf.geekdo-images.com/1uW8t9AkuqOF0xjv_sXKgw__original/img/iBRrCDdqyVY1ckqWIjo0xQ_k70A=/0x0/filters:format(png)/pic9106864.png"},
  238799:{id:"imported_238799",name:"Messina 1347",bggId:238799,year:2021,designer:"Raúl Fernández Aparicio, Vladimír Suchý",players:"1-4",playTime:"60-140 min",complexity:3.61,bggRating:7.5,urlImage:"https://cf.geekdo-images.com/Pw9TGohEb7PITFJnuq48bQ__original/img/W4JriNN41N9CK2e2pQgmz9Ud9bY=/0x0/filters:format(jpeg)/pic6397342.jpg"},
  310100:{id:"imported_310100",name:"Nemesis: Lockdown",bggId:310100,year:2022,designer:"Adam Kwapiński",players:"1-5",playTime:"90-180 min",complexity:3.92,bggRating:8.2,urlImage:"https://cf.geekdo-images.com/NEbmFFGhKwegIryUArgw6w__original/img/YCDNmHN9DiyAnjSvFRen1sjAug4=/0x0/filters:format(jpeg)/pic7110034.jpg"},
  434367:{id:"imported_434367",name:"Nippon: Zaibatsu",bggId:434367,year:2026,designer:"Nuno Bizarro Sentieiro, Paulo Soledade",players:"1-4",playTime:"60-120 min",complexity:3.61,bggRating:8.5,urlImage:"https://cf.geekdo-images.com/bOs_Um4cUUOpKnypCMykJA__original/img/RE_9_-ioTp31Fq_r5GZ_XKVGwzw=/0x0/filters:format(png)/pic8844519.png"},
  431929:{id:"imported_431929",name:"Onward",bggId:431929,year:2025,designer:"Giacomo Neri, Riccardo Neri",players:"2-4",playTime:"45-90 min",complexity:3.09,bggRating:8.4,urlImage:"https://cf.geekdo-images.com/As2LEVwwoHE9UEmaCekgAQ__original/img/WIa__KGWhvVDjq426Nib9GUgQoM=/0x0/filters:format(jpeg)/pic8729695.jpg"},
  205896:{id:"imported_205896",name:"Rising Sun",bggId:205896,year:2018,designer:"Eric M. Lang",players:"3-5",playTime:"90-120 min",complexity:3.3,bggRating:7.8,urlImage:"https://cf.geekdo-images.com/iwevA6XmiNLHn1QnGUucqw__original/img/pKJ1XyLN4hvHim5eRj2VJHijv1E=/0x0/filters:format(jpeg)/pic3880340.jpg"},
  169426:{id:"imported_169426",name:"Roll Player",bggId:169426,year:2016,designer:"Keith Matejka",players:"1-4",playTime:"60-90 min",complexity:2.42,bggRating:7.4,urlImage:"https://cf.geekdo-images.com/enmQAOQl99U6wiQvZoL5GQ__original/img/iiKhufERu8v8JpErc5kUoO8WiNw=/0x0/filters:format(jpeg)/pic2556921.jpg"},
  196202:{id:"imported_196202",name:"Rum & Bones: Second Tide",bggId:196202,year:2017,designer:"Michael Shinall",players:"2-6",playTime:"60 min",complexity:2.83,bggRating:7.6,urlImage:"https://cf.geekdo-images.com/IiZsfcuK9NrVwRBqvLyO0A__original/img/VzTm4d6ckh7xLvqsZ5C-s789Ve4=/0x0/filters:format(jpeg)/pic2945727.jpg"},
  303553:{id:"imported_303553",name:"Skulls of Sedlec",bggId:303553,year:2020,designer:"Dustin Dobson",players:"2-3",playTime:"20 min",complexity:1.24,bggRating:7.3,urlImage:"https://cf.geekdo-images.com/LR0EXZNM9ISEF11WmMM-Lw__original/img/KfhEVVprCfmI8iihlHklomP5nN4=/0x0/filters:format(png)/pic8332459.png"},
  316251:{id:"imported_316251",name:"Skulls of Sedlec: Executioners",bggId:316251,year:2020,designer:"Dustin Dobson",players:"1-4",playTime:"15-30 min",complexity:2.0,bggRating:7.6,urlImage:"https://cf.geekdo-images.com/RjhWfCszhp1K9wex2OK3Ww__original/img/M4Cpy3O9nes0mAtxtYqTcquu4LU=/0x0/filters:format(png)/pic7007053.png"},
  375459:{id:"imported_375459",name:"Speakeasy",bggId:375459,year:2025,designer:"Vital Lacerda",players:"1-4",playTime:"50-180 min",complexity:4.44,bggRating:8.4,urlImage:"https://cf.geekdo-images.com/Y7vIlh-m_Ugnv0jrUuOW3g__original/img/anztl_yjkT6QMcW4p5Dit7KAChE=/0x0/filters:format(jpeg)/pic8165052.jpg"},
  302882:{id:"imported_302882",name:"The Dwarves: Big Box",bggId:302882,year:2021,designer:"Michael Palm, Lukas Zach",players:"2-6",playTime:"60-90 min",complexity:2.07,bggRating:7.4,urlImage:"https://cf.geekdo-images.com/QTMskhIW33ud8GSfh42bbw__original/img/Y5ZaHPr_4YxNMhnOZ4gUyHZhEYQ=/0x0/filters:format(jpeg)/pic6502437.jpg"},
  275557:{id:"imported_275557",name:"The Last Bottle of Rum",bggId:275557,year:2021,designer:"Quentin Vernet",players:"2-5",playTime:"45-60 min",complexity:1.92,bggRating:7.1,urlImage:"https://cf.geekdo-images.com/W-28SI7dtFwOM6KYD9egrQ__original/img/LBChAU399HrE1U1nnWmk9_l-WzQ=/0x0/filters:format(jpeg)/pic5715210.jpg"},
  160069:{id:"imported_160069",name:"Ticket to Ride: 10th Anniversary",bggId:160069,year:2014,designer:"Alan R. Moon",players:"2-5",playTime:"30-60 min",complexity:1.88,bggRating:8.2,urlImage:"https://cf.geekdo-images.com/oXUOPeRynJB1sLEYQiKzTg__original/img/rioxsnue27C86XI-zWTuG_c-GuE=/0x0/filters:format(jpeg)/pic1927856.jpg"},
  241491:{id:"imported_241491",name:"Who Did It?",bggId:241491,year:2018,designer:"Jonathan Favre-Godal",players:"3-6",playTime:"15 min",complexity:1.02,bggRating:6.6,urlImage:"https://cf.geekdo-images.com/OiQ8TUN72CTd732UjHqXXw__original/img/pEiUXL_99NxxTiRIbmYlJfJ3_RI=/0x0/filters:format(jpeg)/pic3981301.jpg"}
};

const GIANNIS_GAMES = {
  208766:{name:"13 Clues",bggId:208766,year:2016,complexity:1.97,players:"2-6",playTime:"30 min",bggRating:6.5},
  1899:{name:"13 Dead End Drive",bggId:1899,year:1993,complexity:1.39,players:"2-4",playTime:"45 min",bggRating:6.1},
  206150:{name:"1754: Conquest – The French and Indian War",bggId:206150,year:2017,complexity:2.33,players:"2-4",playTime:"120 min",bggRating:7.7},
  158837:{name:"27th Passenger: A Hunt on Rails",bggId:158837,year:2014,complexity:2.0,players:"3-6",playTime:"45 min",bggRating:6.7},
  197754:{name:"27th Passenger: A Hunt on Rails – Chatty Bunch Promo Pack",bggId:197754,year:2016,players:"3-6",playTime:"45 min",bggRating:8.0},
  166990:{name:"27th Passenger: A Hunt on Rails – Spiel 2014 Promo Pack",bggId:166990,year:2014,complexity:1.67,players:"3-6",playTime:"45 min",bggRating:7.2},
  197753:{name:"27th Passenger: A Hunt on Rails – True Colors Promo Pack",bggId:197753,year:2016,players:"3-6",playTime:"45 min",bggRating:7.9},
  410103:{name:"7 Empires",bggId:410103,year:2024,complexity:2.96,players:"2-6",playTime:"150 min",bggRating:7.5},
  204516:{name:"878 Vikings: Invasions of England",bggId:204516,year:2017,complexity:2.63,players:"2-4",playTime:"120 min",bggRating:7.5},
  177736:{name:"A Feast for Odin",bggId:177736,year:2016,complexity:3.87,players:"1-4",playTime:"120 min",bggRating:8.2},
  338376:{name:"A Gest of Robin Hood",bggId:338376,year:2024,complexity:3.05,players:"2",playTime:"90 min",bggRating:7.7},
  239472:{name:"Abomination: The Heir of Frankenstein",bggId:239472,year:2019,complexity:3.24,players:"2-4",playTime:"180 min",bggRating:7.4},
  1315:{name:"Africa",bggId:1315,year:2001,complexity:1.77,players:"2-5",playTime:"60 min",bggRating:6.0},
  200511:{name:"After the Empire",bggId:200511,year:2021,complexity:3.11,players:"2-4",playTime:"120 min",bggRating:7.4},
  203740:{name:"Age of Thieves",bggId:203740,year:2016,complexity:2.62,players:"2-4",playTime:"120 min",bggRating:6.7},
  227798:{name:"Age of Thieves: Masters of Disguise",bggId:227798,year:2017,players:"2-4",playTime:"90 min",bggRating:7.6},
  1387:{name:"Alaska",bggId:1387,year:1979,complexity:1.45,players:"2-4",playTime:"60 min",bggRating:5.9},
  161970:{name:"Alchemists",bggId:161970,year:2014,complexity:3.92,players:"2-4",playTime:"120 min",bggRating:7.6},
  204650:{name:"Alchemists: The King's Golem",bggId:204650,year:2016,complexity:4.55,players:"2-4",playTime:"120 min",bggRating:8.4},
  45358:{name:"Alhambra: Big Box",bggId:45358,year:2009,complexity:2.34,players:"2-6",playTime:"60 min",bggRating:7.5},
  354568:{name:"Amun-Re: 20th Anniversary Edition",bggId:354568,year:2023,complexity:2.93,players:"2-5",playTime:"90 min",bggRating:7.5},
  185343:{name:"Anachrony",bggId:185343,year:2017,complexity:4.0,players:"1-4",playTime:"120 min",bggRating:8.0},
  218791:{name:"Anachrony: Exosuit Commander Pack",bggId:218791,year:2017,complexity:3.67,players:"1-4",playTime:"120 min",bggRating:8.5},
  272077:{name:"Anachrony: Fractures of Time",bggId:272077,year:2020,complexity:4.53,players:"1-4",playTime:"150 min",bggRating:8.8},
  286574:{name:"Anachrony: Future Imperfect",bggId:286574,year:2020,complexity:4.07,players:"2-4",playTime:"150 min",bggRating:8.6},
  429653:{name:"Andromeda's Edge: Deluxe Edition",bggId:429653,year:2024,complexity:3.75,players:"1-5",playTime:"160 min",bggRating:8.8},
  285967:{name:"Ankh: Gods of Egypt",bggId:285967,year:2021,complexity:3.13,players:"2-5",playTime:"90 min",bggRating:7.7},
  308321:{name:"Ankh: Gods of Egypt – Guardians Set",bggId:308321,year:2021,complexity:3.0,players:"2-5",playTime:"90 min",bggRating:7.9},
  307807:{name:"Ankh: Gods of Egypt – Pantheon",bggId:307807,year:2021,complexity:3.0,players:"2-5",playTime:"90 min",bggRating:8.2},
  308505:{name:"Ankh: Gods of Egypt – Pharaoh",bggId:308505,year:2021,complexity:3.64,players:"2-5",playTime:"90 min",bggRating:8.1},
  308966:{name:"Ankh: Gods of Egypt – Tomb of Wonders",bggId:308966,year:2021,complexity:2.67,players:"2-5",playTime:"180 min",bggRating:8.4},
  150783:{name:"Antidote",bggId:150783,year:2013,complexity:1.67,players:"2-7",playTime:"30 min",bggRating:6.3},
  218495:{name:"Antidote: Lab Alliance",bggId:218495,year:2018,complexity:2.0,players:"3-9",playTime:"40 min",bggRating:6.5},
  236457:{name:"Architects of the West Kingdom",bggId:236457,year:2018,complexity:2.76,players:"1-5",playTime:"80 min",bggRating:7.7},
  248492:{name:"Architects of the West Kingdom: Extra Apprentices",bggId:248492,year:2018,complexity:2.5,players:"1-5",playTime:"80 min",bggRating:7.7},
  248491:{name:"Architects of the West Kingdom: Extra Buildings",bggId:248491,year:2018,complexity:2.46,players:"1-5",playTime:"80 min",bggRating:7.7},
  248493:{name:"Architects of the West Kingdom: Extra Player Boards",bggId:248493,year:2018,complexity:2.47,players:"1-5",playTime:"80 min",bggRating:7.9},
  274783:{name:"Architects of the West Kingdom: Paladins Apprentices",bggId:274783,year:2019,complexity:2.5,players:"1-5",playTime:"80 min",bggRating:7.7},
  342942:{name:"Ark Nova",bggId:342942,year:2021,complexity:3.8,players:"1-4",playTime:"150 min",bggRating:8.5},
  368966:{name:"Ark Nova: Marine Worlds",bggId:368966,year:2023,complexity:3.85,players:"1-4",playTime:"150 min",bggRating:8.9},
  65200:{name:"Asteroyds",bggId:65200,year:2010,complexity:2.15,players:"2-6",playTime:"30 min",bggRating:6.3},
  6752:{name:"Attack!",bggId:6752,year:2003,complexity:2.55,players:"2-6",playTime:"180 min",bggRating:5.8},
  252555:{name:"Bad Maps",bggId:252555,year:2019,complexity:2.25,players:"3-5",playTime:"60 min",bggRating:5.1},
  3955:{name:"BANG!",bggId:3955,year:2002,complexity:1.63,players:"4-7",playTime:"40 min",bggRating:6.5},
  161953:{name:"BANG! High Noon/A Fistful of Cards",bggId:161953,year:2014,complexity:1.5,players:"4-7",playTime:"40 min",bggRating:7.0},
  130046:{name:"BANG! The Valley of Shadows",bggId:130046,year:2011,complexity:1.92,players:"4-7",playTime:"40 min",bggRating:7.3},
  219832:{name:"Barbarians: The Invasion",bggId:219832,year:2018,complexity:3.2,players:"1-4",playTime:"90 min",bggRating:7.4},
  251247:{name:"Barrage",bggId:251247,year:2019,complexity:4.11,players:"1-4",playTime:"180 min",bggRating:8.1},
  30328:{name:"Battleground: Crossbows & Catapults",bggId:30328,year:2007,complexity:1.33,players:"2",playTime:"60 min",bggRating:6.6},
  10547:{name:"Betrayal at House on the Hill",bggId:10547,year:2004,complexity:2.4,players:"3-6",playTime:"60 min",bggRating:7.0},
  198452:{name:"Betrayal at House on the Hill: Widow's Walk",bggId:198452,year:2016,complexity:2.76,players:"3-6",playTime:"60 min",bggRating:7.4},
  34219:{name:"Biblios",bggId:34219,year:2007,complexity:1.69,players:"2-4",playTime:"30 min",bggRating:7.2},
  157403:{name:"Black Fleet",bggId:157403,year:2014,complexity:1.94,players:"3-4",playTime:"60 min",bggRating:7.0},
  268797:{name:"Black Rose Wars: Inferno",bggId:268797,year:2021,complexity:3.0,players:"1-6",playTime:"90 min",bggRating:8.1},
  438707:{name:"Black Rose Wars: Magister Box",bggId:438707,year:2024,players:"2-4",bggRating:8.8},
  342444:{name:"Black Rose Wars: Rebirth",bggId:342444,year:2023,complexity:3.74,players:"1-4",playTime:"240 min",bggRating:8.4},
  412687:{name:"Black Rose Wars: Rebirth – Apocalypse",bggId:412687,year:2024,players:"1-4",playTime:"90 min",bggRating:8.7},
  414161:{name:"Black Rose Wars: Rebirth – Deadly Masks",bggId:414161,year:2024,complexity:4.0,players:"1-6",bggRating:8.5},
  414160:{name:"Black Rose Wars: Rebirth – Dreadforge",bggId:414160,year:2024,complexity:3.5,players:"1-4",bggRating:8.5},
  413564:{name:"Black Rose Wars: Rebirth – Jukas",bggId:413564,year:2024,players:"2-4",bggRating:8.2},
  412735:{name:"Black Rose Wars: Rebirth – Rotas Box",bggId:412735,year:2023,complexity:4.0,players:"1-4",playTime:"120 min",bggRating:8.9},
  312230:{name:"Black Rose Wars: Sator Box",bggId:312230,year:2020,complexity:3.33,players:"1-6",playTime:"180 min",bggRating:8.8},
  36739:{name:"Black Sheep",bggId:36739,year:2008,complexity:1.43,players:"2-4",playTime:"30 min",bggRating:5.9},
  253861:{name:"Black Skull Island",bggId:253861,year:2018,complexity:1.29,players:"2-9",playTime:"25 min",bggRating:5.6},
  25685:{name:"Blackbeard: The Golden Age of Piracy",bggId:25685,year:2008,complexity:3.31,players:"1-5",playTime:"120 min",bggRating:6.1},
  14258:{name:"Blood Feud in New York",bggId:14258,year:2004,complexity:2.69,players:"2-6",playTime:"180 min",bggRating:6.1},
  170216:{name:"Blood Rage",bggId:170216,year:2015,complexity:2.88,players:"2-4",playTime:"90 min",bggRating:7.9},
  174801:{name:"Blood Rage: Gods of Ásgard",bggId:174801,year:2015,complexity:2.57,players:"2-4",playTime:"90 min",bggRating:7.6},
  175100:{name:"Blood Rage: Mystics of Midgard",bggId:175100,year:2015,complexity:2.74,players:"2-4",playTime:"90 min",bggRating:7.9},
  343905:{name:"Boonlake",bggId:343905,year:2021,complexity:3.8,players:"1-4",playTime:"160 min",bggRating:7.6},
  12477:{name:"Bootleggers",bggId:12477,year:2004,complexity:2.62,players:"3-6",playTime:"90 min",bggRating:6.7},
  224517:{name:"Brass: Birmingham",bggId:224517,year:2018,complexity:3.86,players:"2-4",playTime:"120 min",bggRating:8.6},
  249277:{name:"Brazil: Imperial",bggId:249277,year:2021,complexity:3.01,players:"1-4",playTime:"100 min",bggRating:7.5},
  337765:{name:"Brian Boru: High King of Ireland",bggId:337765,year:2021,complexity:2.56,players:"3-5",playTime:"90 min",bggRating:7.5},
  308989:{name:"Bristol 1350",bggId:308989,year:2021,complexity:1.62,players:"1-9",playTime:"40 min",bggRating:6.9},
  280106:{name:"Britannia: Classic and New Duel Edition",bggId:280106,year:2020,complexity:3.44,players:"2-4",playTime:"240 min",bggRating:7.5},
  172308:{name:"Broom Service",bggId:172308,year:2015,complexity:2.39,players:"2-5",playTime:"75 min",bggRating:7.2},
  341496:{name:"Caesar's Empire",bggId:341496,year:2022,complexity:1.56,players:"2-5",playTime:"60 min",bggRating:7.2},
  1324:{name:"Café International: Das Kartenspiel",bggId:1324,year:2001,complexity:1.32,players:"2-5",playTime:"45 min",bggRating:5.7},
  260605:{name:"Camel Up (Second Edition)",bggId:260605,year:2018,complexity:1.51,players:"3-8",playTime:"45 min",bggRating:7.5},
  290236:{name:"Canvas",bggId:290236,year:2021,complexity:1.73,players:"1-5",playTime:"30 min",bggRating:7.2},
  335172:{name:"Canvas: Reflections",bggId:335172,year:2022,complexity:2.04,players:"1-5",playTime:"30 min",bggRating:7.7},
  337330:{name:"Canvas: Reflections – Deluxe Edition",bggId:337330,year:2022,complexity:1.8,players:"1-5",playTime:"30 min",bggRating:7.9},
  269789:{name:"Caravan",bggId:269789,year:2019,complexity:1.77,players:"2-4",playTime:"45 min",bggRating:6.6},
  822:{name:"Carcassonne",bggId:822,year:2000,complexity:1.89,players:"2-5",playTime:"45 min",bggRating:7.4},
  310873:{name:"Carnegie",bggId:310873,year:2022,complexity:3.82,players:"1-4",playTime:"120 min",bggRating:8.0},
  263918:{name:"Cartographers",bggId:263918,year:2019,complexity:1.89,players:"1-100",playTime:"45 min",bggRating:7.6},
  401216:{name:"Cascadero",bggId:401216,year:2024,complexity:2.57,players:"2-4",playTime:"60 min",bggRating:7.3},
  357841:{name:"Castles by the Sea",bggId:357841,year:2023,complexity:2.15,players:"1-4",playTime:"60 min",bggRating:6.9},
  13:{name:"Catan",bggId:13,year:1995,complexity:2.28,players:"3-4",playTime:"120 min",bggRating:7.1},
  244144:{name:"Catan Histories: Rise of the Inkas",bggId:244144,year:2018,complexity:2.67,players:"3-4",playTime:"90 min",bggRating:7.2},
  926:{name:"Catan: Cities & Knights",bggId:926,year:1998,complexity:2.9,players:"3-4",playTime:"150 min",bggRating:7.5},
  4101:{name:"Catan: Cities & Knights – 5-6 Player Extension",bggId:4101,year:2000,complexity:2.74,players:"5-6",playTime:"120 min",bggRating:7.1},
  282853:{name:"Catan: Starfarers",bggId:282853,year:2019,complexity:2.59,players:"3-4",playTime:"120 min",bggRating:7.5},
  27760:{name:"Catan: Traders & Barbarians",bggId:27760,year:2007,complexity:2.57,players:"2-4",playTime:"60 min",bggRating:7.0},
  310789:{name:"Catapult Feud",bggId:310789,year:2021,complexity:1.07,players:"2",playTime:"30 min",bggRating:7.0},
  330302:{name:"Catapult Feud: Artificer's Tower!",bggId:330302,year:2021,complexity:1.0,players:"2",playTime:"30 min",bggRating:7.1},
  371905:{name:"Catapult Feud: Holiday Ammo",bggId:371905,year:2022,players:"2",playTime:"30 min",bggRating:7.6},
  371907:{name:"Catapult Feud: Secret Santa",bggId:371907,year:2022,players:"2",playTime:"30 min",bggRating:7.6},
  360951:{name:"Catherine: The Cities of the Tsarina",bggId:360951,year:2022,complexity:2.26,players:"2-4",playTime:"45 min",bggRating:6.6},
  4491:{name:"Cave Troll",bggId:4491,year:2002,complexity:1.98,players:"2-4",playTime:"60 min",bggRating:6.4},
  357912:{name:"Chachapoya (Second Edition)",bggId:357912,year:2022,complexity:1.5,players:"2-5",playTime:"45 min",bggRating:7.4},
  172287:{name:"Champions of Midgard",bggId:172287,year:2015,complexity:2.62,players:"2-4",playTime:"90 min",bggRating:7.7},
  30379:{name:"Change Horses",bggId:30379,year:2008,complexity:1.62,players:"2-5",playTime:"30 min",bggRating:5.4},
  239189:{name:"Chronicle X",bggId:239189,year:2021,complexity:2.5,players:"1-7",playTime:"180 min",bggRating:6.1},
  478:{name:"Citadels",bggId:478,year:2000,complexity:2.05,players:"2-8",playTime:"60 min",bggRating:7.1},
  205398:{name:"Citadels",bggId:205398,year:2016,complexity:2.05,players:"2-8",playTime:"60 min",bggRating:7.2},
  220095:{name:"City of Spies: Double Agent",bggId:220095,year:2017,complexity:2.67,players:"2-5",playTime:"60 min",bggRating:7.5},
  169318:{name:"City of Spies: Estoril 1942",bggId:169318,year:2015,complexity:2.49,players:"2-4",playTime:"60 min",bggRating:7.0},
  400602:{name:"Civolution",bggId:400602,year:2024,complexity:4.25,players:"1-4",playTime:"180 min",bggRating:8.2},
  140279:{name:"Clacks: A Discworld Board Game",bggId:140279,year:2015,complexity:2.6,players:"1-4",playTime:"45 min",bggRating:6.2},
  257276:{name:"Clank! Expeditions: Gold and Silk",bggId:257276,year:2018,complexity:2.2,players:"2-4",playTime:"60 min",bggRating:8.0},
  282426:{name:"Clank! Expeditions: Temple of the Ape Lords",bggId:282426,year:2019,complexity:2.0,players:"2-4",playTime:"60 min",bggRating:8.0},
  233371:{name:"Clank! In! Space!: A Deck-Building Adventure",bggId:233371,year:2017,complexity:2.58,players:"2-4",playTime:"90 min",bggRating:7.8},
  275532:{name:"Clank! Legacy: Acquisitions Incorporated – Upper Management Pack",bggId:275532,year:2019,complexity:1.2,players:"2-4",playTime:"60 min",bggRating:7.7},
  201808:{name:"Clank!: A Deck-Building Adventure",bggId:201808,year:2016,complexity:2.23,players:"2-4",playTime:"60 min",bggRating:7.8},
  365717:{name:"Clank!: Catacombs",bggId:365717,year:2022,complexity:2.48,players:"2-4",playTime:"90 min",bggRating:8.2},
  218103:{name:"Clank!: Sunken Treasures",bggId:218103,year:2017,complexity:2.22,players:"2-4",playTime:"60 min",bggRating:8.0},
  245377:{name:"Clank!: The Mummy's Curse",bggId:245377,year:2018,complexity:2.26,players:"2-4",playTime:"60 min",bggRating:7.9},
  299659:{name:"Clash of Cultures: Monumental Edition",bggId:299659,year:2021,complexity:3.74,players:"2-4",playTime:"240 min",bggRating:8.3},
  265784:{name:"Cleopatra and the Society of Architects: Deluxe Edition",bggId:265784,year:2020,complexity:2.21,players:"2-4",playTime:"60 min",bggRating:7.3},
  31506:{name:"Cliffhanger",bggId:31506,year:2007,complexity:1.21,players:"3-6",playTime:"15 min",bggRating:6.2},
  262211:{name:"Cloudspire",bggId:262211,year:2019,complexity:4.4,players:"1-4",playTime:"180 min",bggRating:8.2},
  178900:{name:"Codenames",bggId:178900,year:2015,complexity:1.26,players:"2-8",playTime:"15 min",bggRating:7.5},
  220774:{name:"Codenames: Marvel",bggId:220774,year:2017,complexity:1.21,players:"2-8",playTime:"15 min",bggRating:6.1},
  341504:{name:"Colt Express: Big Box",bggId:341504,year:2022,complexity:2.18,players:"2-9",playTime:"40 min",bggRating:7.8},
  124361:{name:"Concordia",bggId:124361,year:2013,complexity:2.99,players:"2-5",playTime:"100 min",bggRating:8.1},
  17710:{name:"Conquest of the Empire",bggId:17710,year:2005,complexity:3.07,players:"2-6",playTime:"240 min",bggRating:6.7},
  31483:{name:"Constantinopolis",bggId:31483,year:2010,complexity:3.13,players:"2-5",playTime:"90 min",bggRating:6.9},
  840:{name:"Corsairs",bggId:840,year:2000,complexity:1.67,players:"2-4",playTime:"60 min",bggRating:6.1},
  173101:{name:"Council of 4",bggId:173101,year:2015,complexity:2.69,players:"2-4",playTime:"75 min",bggRating:7.1},
  181372:{name:"Coup: Rebellion G54 – Anarchy",bggId:181372,year:2015,complexity:1.75,players:"3-6",playTime:"15 min",bggRating:7.3},
  13284:{name:"Cowpoker",bggId:13284,year:2006,complexity:1.52,players:"2-4",playTime:"30 min",bggRating:5.5},
  266937:{name:"Cradle of Civilization",bggId:266937,year:2021,complexity:2.67,players:"1-6",playTime:"240 min",bggRating:7.0},
  147:{name:"Crude: The Oil Game",bggId:147,year:1974,complexity:2.73,players:"2-4",playTime:"90 min",bggRating:6.7},
  192457:{name:"Cry Havoc",bggId:192457,year:2016,complexity:3.3,players:"2-4",playTime:"120 min",bggRating:7.1},
  404509:{name:"Cthulhu: Dark Providence",bggId:404509,year:2025,complexity:3.27,players:"1-5",playTime:"120 min",bggRating:7.5},
  253344:{name:"Cthulhu: Death May Die",bggId:253344,year:2019,complexity:2.5,players:"1-5",playTime:"120 min",bggRating:8.2},
  30380:{name:"Cuba",bggId:30380,year:2007,complexity:3.26,players:"2-5",playTime:"120 min",bggRating:7.1},
  40794:{name:"Cuba: El Presidente",bggId:40794,year:2009,complexity:3.13,players:"2-5",playTime:"120 min",bggRating:7.6},
  1867:{name:"Curse of the Idol",bggId:1867,year:1990,complexity:1.19,players:"2-4",playTime:"60 min",bggRating:5.4},
  380619:{name:"Cyclades: Legendary Edition",bggId:380619,year:2024,complexity:2.84,players:"2-6",playTime:"90 min",bggRating:8.1},
  295535:{name:"Dark Ages: Heritage of Charlemagne",bggId:295535,year:2021,complexity:3.52,players:"1-4",playTime:"180 min",bggRating:7.8},
  304985:{name:"Dark Ages: Holy Roman Empire",bggId:304985,year:2021,complexity:3.48,players:"1-4",playTime:"180 min",bggRating:7.8},
  418826:{name:"Dark Blood",bggId:418826,year:2025,complexity:3.33,players:"1-4",playTime:"120 min",bggRating:7.8},
  353677:{name:"Darkest Doom",bggId:353677,year:2025,complexity:3.27,players:"1-4",playTime:"150 min",bggRating:7.3},
  264321:{name:"Dead Man's Cabal",bggId:264321,year:2019,complexity:2.67,players:"2-4",playTime:"60 min",bggRating:6.7},
  286070:{name:"Dead Man's Cabal: Undeading Pack",bggId:286070,year:2019,players:"2-4",playTime:"90 min",bggRating:6.2},
  149155:{name:"Dead Man's Draw",bggId:149155,year:2014,complexity:1.32,players:"2-4",playTime:"15 min",bggRating:6.9},
  141423:{name:"Dead Men Tell No Tales",bggId:141423,year:2015,complexity:2.56,players:"2-5",playTime:"75 min",bggRating:7.1},
  276182:{name:"Dead Reckoning",bggId:276182,year:2022,complexity:3.44,players:"1-4",playTime:"150 min",bggRating:8.1},
  340404:{name:"Dead Reckoning: Deep Legends",bggId:340404,year:2022,complexity:3.5,players:"1-4",playTime:"150 min",bggRating:8.4},
  340406:{name:"Dead Reckoning: Salt & Thunder",bggId:340406,year:2022,complexity:4.0,players:"1-4",playTime:"150 min",bggRating:8.5},
  39798:{name:"Deadlands: The Battle for Slaughter Gulch",bggId:39798,year:2009,complexity:2.92,players:"2-6",playTime:"60 min",bggRating:5.8},
  156129:{name:"Deception: Murder in Hong Kong",bggId:156129,year:2014,complexity:1.59,players:"4-12",playTime:"20 min",bggRating:7.4},
  295571:{name:"Deckscape Crew vs Crew: The Pirates' Island",bggId:295571,year:2021,complexity:1.5,players:"2-6",playTime:"90 min",bggRating:6.1},
  225694:{name:"Decrypto",bggId:225694,year:2018,complexity:1.83,players:"3-8",playTime:"45 min",bggRating:7.8},
  17226:{name:"Descent: Journeys in the Dark",bggId:17226,year:2005,complexity:3.35,players:"2-5",playTime:"240 min",bggRating:7.3},
  118410:{name:"Dirty Pig",bggId:118410,year:2012,complexity:1.05,players:"2-4",playTime:"10 min",bggRating:6.1},
  358027:{name:"Disney Big Thunder Mountain Railroad",bggId:358027,year:2022,complexity:1.83,players:"2-4",playTime:"45 min",bggRating:6.5},
  309129:{name:"Disney: The Haunted Mansion – Call of the Spirits Game",bggId:309129,year:2020,complexity:1.87,players:"2-6",playTime:"30 min",bggRating:6.9},
  39856:{name:"Dixit",bggId:39856,year:2008,complexity:1.19,players:"3-6",playTime:"30 min",bggRating:7.2},
  256237:{name:"Dixit: Anniversary",bggId:256237,year:2018,complexity:1.2,players:"3-6",playTime:"60 min",bggRating:7.9},
  234553:{name:"Dixit: Harmonies",bggId:234553,year:2017,complexity:1.21,players:"3-6",playTime:"60 min",bggRating:7.8},
  205761:{name:"Dixit: Revelations",bggId:205761,year:2016,complexity:1.18,players:"3-6",playTime:"30 min",bggRating:7.9},
  262941:{name:"Dominant Species: Marine",bggId:262941,year:2021,complexity:3.69,players:"2-4",playTime:"150 min",bggRating:7.9},
  232219:{name:"Dragon Castle",bggId:232219,year:2017,complexity:1.99,players:"1-4",playTime:"45 min",bggRating:7.1},
  23107:{name:"Drakon (Third Edition)",bggId:23107,year:2006,complexity:1.81,players:"2-6",playTime:"60 min",bggRating:6.5},
  397598:{name:"Dune: Imperium – Uprising",bggId:397598,year:2023,complexity:3.52,players:"1-6",playTime:"120 min",bggRating:8.7},
  472:{name:"DungeonQuest",bggId:472,year:1985,complexity:1.92,players:"1-4",playTime:"60 min",bggRating:6.8},
  157958:{name:"DungeonQuest: Revised Edition",bggId:157958,year:2014,complexity:2.0,players:"1-4",playTime:"60 min",bggRating:7.2},
  246900:{name:"Eclipse: Second Dawn for the Galaxy",bggId:246900,year:2020,complexity:3.67,players:"2-6",playTime:"200 min",bggRating:8.4},
  375216:{name:"Eclipse: Second Dawn for the Galaxy – Gamemat",bggId:375216,year:2020,complexity:1.0,players:"2-9",playTime:"240 min",bggRating:8.9},
  368378:{name:"Eclipse: Second Dawn for the Galaxy – Outcasts",bggId:368378,year:2024,complexity:3.5,bggRating:8.6},
  305955:{name:"Eclipse: Second Dawn for the Galaxy – Rift Cannon",bggId:305955,year:2020,complexity:2.75,players:"2-6",bggRating:7.9},
  308388:{name:"Egizia: Shifting Sands – Kickstarter Edition",bggId:308388,year:2019,complexity:3.25,players:"2-4",playTime:"90 min",bggRating:7.7},
  171908:{name:"El Grande Big Box",bggId:171908,year:2015,complexity:2.8,players:"2-5",playTime:"90 min",bggRating:8.2},
  280475:{name:"Element: Silver",bggId:280475,year:2019,complexity:2.14,players:"2-4",playTime:"60 min",bggRating:7.5},
  173442:{name:"Empires: Age of Discovery",bggId:173442,year:2015,complexity:3.31,players:"2-6",playTime:"150 min",bggRating:7.8},
  206931:{name:"Encore!",bggId:206931,year:2016,complexity:1.16,players:"1-6",playTime:"20 min",bggRating:6.9},
  305096:{name:"Endless Winter: Paleoamericans",bggId:305096,year:2022,complexity:3.33,players:"1-4",playTime:"120 min",bggRating:7.6},
  187777:{name:"Endure the Stars",bggId:187777,year:2017,complexity:2.25,players:"1-6",playTime:"180 min",bggRating:6.5},
  24037:{name:"Escape from Atlantis",bggId:24037,year:1986,complexity:1.55,players:"2-4",playTime:"60 min",bggRating:6.6},
  113294:{name:"Escape: The Curse of the Temple",bggId:113294,year:2012,complexity:1.48,players:"1-5",playTime:"10 min",bggRating:7.0},
  199792:{name:"Everdell",bggId:199792,year:2018,complexity:2.83,players:"1-4",playTime:"80 min",bggRating:8.0},
  318983:{name:"Faiyum",bggId:318983,year:2020,complexity:3.07,players:"1-5",playTime:"140 min",bggRating:7.5},
  187121:{name:"Far East War 1592",bggId:187121,year:2016,complexity:2.5,players:"2-4",playTime:"120 min",bggRating:6.9},
  198609:{name:"Fate of the Elder Gods",bggId:198609,year:2017,complexity:2.83,players:"1-4",playTime:"90 min",bggRating:7.2},
  7805:{name:"Fearsome Floors",bggId:7805,year:2003,complexity:1.81,players:"2-7",playTime:"60 min",bggRating:6.7},
  278304:{name:"Fief: France",bggId:278304,year:2023,complexity:3.92,players:"3-6",playTime:"180 min",bggRating:7.6},
  233020:{name:"Fireball Island: The Curse of Vul-Kar",bggId:233020,year:2018,complexity:1.46,players:"2-4",playTime:"60 min",bggRating:6.7},
  249326:{name:"Fireball Island: The Curse of Vul-Kar – Crouching Tiger, Hidden Bees!",bggId:249326,year:2018,complexity:1.29,players:"2-4",playTime:"60 min",bggRating:7.2},
  274536:{name:"Fireball Island: The Curse of Vul-Kar – Spider Springs",bggId:274536,year:2019,complexity:1.33,players:"2-4",playTime:"60 min",bggRating:7.3},
  249325:{name:"Fireball Island: The Curse of Vul-Kar – The Last Adventurer",bggId:249325,year:2018,complexity:1.22,players:"2-5",playTime:"60 min",bggRating:7.1},
  250648:{name:"Fireball Island: The Curse of Vul-Kar – Treasure Trove",bggId:250648,year:2018,complexity:1.4,players:"2-4",playTime:"45 min",bggRating:7.2},
  249792:{name:"Fireball Island: The Curse of Vul-Kar – Wreck of the Crimson Cutlass",bggId:249792,year:2018,complexity:1.57,players:"2-4",playTime:"60 min",bggRating:6.9},
  176677:{name:"Five Tribes: The Artisans of Naqala",bggId:176677,year:2015,complexity:2.8,players:"2-4",playTime:"80 min",bggRating:8.1},
  157354:{name:"Five Tribes: The Djinns of Naqala",bggId:157354,year:2014,complexity:2.84,players:"2-4",playTime:"80 min",bggRating:7.8},
  226828:{name:"Five Tribes: Whims of the Sultan",bggId:226828,year:2017,complexity:2.88,players:"2-5",playTime:"90 min",bggRating:8.0},
  424765:{name:"Food for Thought",bggId:424765,year:2025,complexity:2.67,players:"1-4",playTime:"90 min",bggRating:7.4},
  318709:{name:"For Sale Autorama",bggId:318709,year:2021,complexity:1.79,players:"3-6",playTime:"45 min",bggRating:7.2},
  3945:{name:"Forbidden Bridge",bggId:3945,year:1992,complexity:1.35,players:"2-4",playTime:"10 min",bggRating:6.3},
  175155:{name:"Forbidden Stars",bggId:175155,year:2015,complexity:3.84,players:"2-4",playTime:"180 min",bggRating:8.0},
  37904:{name:"Formula D",bggId:37904,year:2008,complexity:1.96,players:"2-10",playTime:"60 min",bggRating:7.0},
  115293:{name:"Fortress America",bggId:115293,year:2012,complexity:2.71,players:"2-4",playTime:"150 min",bggRating:6.8},
  95103:{name:"Fortune and Glory: The Cliffhanger Game",bggId:95103,year:2011,complexity:2.87,players:"1-8",playTime:"240 min",bggRating:7.1},
  446703:{name:"Fortunes of Scoundrel Bay",bggId:446703,year:2025,complexity:3.25,players:"1-4",playTime:"120 min",bggRating:7.4},
  284189:{name:"Foundations of Rome",bggId:284189,year:2022,complexity:2.02,players:"1-5",playTime:"90 min",bggRating:8.0},
  422433:{name:"Foundations of Rome (Emperor Edition)",bggId:422433,year:2022,complexity:2.0,players:"2-5",playTime:"60 min",bggRating:8.5},
  140603:{name:"Francis Drake",bggId:140603,year:2013,complexity:2.91,players:"3-5",playTime:"120 min",bggRating:7.4},
  170813:{name:"Francis Drake: The Expansions",bggId:170813,year:2015,complexity:2.5,players:"2-6",playTime:"90 min",bggRating:7.4},
  12891:{name:"Friedrich: Anniversary Edition",bggId:12891,year:2004,complexity:3.13,players:"3-4",playTime:"210 min",bggRating:7.5},
  217362:{name:"Frogriders",bggId:217362,year:2017,complexity:1.27,players:"2-4",playTime:"30 min",bggRating:6.5},
  181279:{name:"Fury of Dracula (Third/Fourth Edition)",bggId:181279,year:2015,complexity:3.28,players:"2-5",playTime:"180 min",bggRating:7.4},
  220308:{name:"Gaia Project",bggId:220308,year:2017,complexity:4.4,players:"1-4",playTime:"150 min",bggRating:8.4},
  312789:{name:"Gardens of Babylon: Deluxe Edition",bggId:312789,year:2019,players:"1-4",playTime:"60 min",bggRating:7.1},
  140613:{name:"Gear & Piston",bggId:140613,year:2013,complexity:2.12,players:"2-6",playTime:"60 min",bggRating:5.7},
  142365:{name:"Gear & Piston: Engineer Assistants",bggId:142365,year:2013,complexity:2.5,players:"2-6",playTime:"60 min",bggRating:6.3},
  146312:{name:"Ghost Fightin' Treasure Hunters",bggId:146312,year:2013,complexity:1.63,players:"2-4",playTime:"30 min",bggRating:7.1},
  3846:{name:"Ghostly Galleon",bggId:3846,year:1991,complexity:1.6,players:"2-4",playTime:"45 min",bggRating:5.5},
  364048:{name:"Go Ahead Punk!",bggId:364048,year:2024,complexity:2.25,players:"1-4",playTime:"90 min",bggRating:8.1},
  57163:{name:"Gonzaga",bggId:57163,year:2009,complexity:2.47,players:"2-4",playTime:"60 min",bggRating:6.6},
  153064:{name:"Good Cop Bad Cop",bggId:153064,year:2014,complexity:1.26,players:"4-8",playTime:"20 min",bggRating:6.5},
  168037:{name:"Good Cop Bad Cop: Bombers and Traitors",bggId:168037,year:2015,complexity:1.67,players:"3-8",playTime:"20 min",bggRating:6.5},
  182874:{name:"Grand Austria Hotel",bggId:182874,year:2015,complexity:3.2,players:"2-4",playTime:"120 min",bggRating:8.0},
  320780:{name:"Grand Austria Hotel: Let's Waltz!",bggId:320780,year:2021,complexity:3.28,players:"1-4",playTime:"120 min",bggRating:8.4},
  380607:{name:"Great Western Trail: New Zealand",bggId:380607,year:2023,complexity:4.0,players:"1-4",playTime:"150 min",bggRating:8.5},
  286749:{name:"Hansa Teutonica: Big Box",bggId:286749,year:2020,complexity:2.97,players:"3-5",playTime:"90 min",bggRating:8.4},
  360899:{name:"Harrow County: The Game of Gothic Conflict",bggId:360899,year:2024,complexity:3.71,players:"1-3",playTime:"90 min",bggRating:7.8},
  366013:{name:"Heat: Pedal to the Metal",bggId:366013,year:2022,complexity:2.2,players:"1-6",playTime:"60 min",bggRating:8.0},
  227789:{name:"Heaven & Ale",bggId:227789,year:2017,complexity:3.17,players:"2-4",playTime:"90 min",bggRating:7.5},
  3439:{name:"HeroClix",bggId:3439,year:2002,complexity:2.82,players:"2",playTime:"60 min",bggRating:6.5},
  699:{name:"HeroQuest",bggId:699,year:1989,complexity:2.13,players:"2-5",playTime:"90 min",bggRating:7.2},
  367490:{name:"Hickory Dickory",bggId:367490,year:2023,complexity:2.66,players:"1-4",playTime:"120 min",bggRating:7.0},
  282524:{name:"Horrified",bggId:282524,year:2019,complexity:2.02,players:"1-5",playTime:"60 min",bggRating:7.6},
  58110:{name:"Horse Fever",bggId:58110,year:2009,complexity:2.37,players:"2-6",playTime:"90 min",bggRating:6.9},
  1502:{name:"Hotel",bggId:1502,year:1974,complexity:1.39,players:"2-4",playTime:"60 min",bggRating:5.6},
  371688:{name:"HUANG",bggId:371688,year:2024,complexity:3.02,players:"2-4",playTime:"90 min",bggRating:8.0},
  420898:{name:"HUANG: The Dragon Dynasty",bggId:420898,year:2024,complexity:3.0,players:"2-5",bggRating:7.9},
  115:{name:"I'm the Boss!",bggId:115,year:1994,complexity:1.97,players:"3-6",playTime:"60 min",bggRating:6.8},
  31133:{name:"Ice Flow",bggId:31133,year:2008,complexity:2.15,players:"2-4",playTime:"75 min",bggRating:6.4},
  221:{name:"Ikusa",bggId:221,year:1986,complexity:2.95,players:"2-5",playTime:"360 min",bggRating:7.0},
  54138:{name:"Imperial 2030",bggId:54138,year:2009,complexity:3.5,players:"2-6",playTime:"180 min",bggRating:7.6},
  206480:{name:"Imperial Struggle",bggId:206480,year:2020,complexity:4.07,players:"2",playTime:"240 min",bggRating:8.2},
  393165:{name:"Inferno",bggId:393165,year:2024,complexity:3.62,players:"1-4",playTime:"120 min",bggRating:7.9},
  304285:{name:"Infinity Gauntlet: A Love Letter Game",bggId:304285,year:2020,complexity:1.25,players:"2-6",playTime:"15 min",bggRating:6.9},
  181797:{name:"Inhabit the Earth",bggId:181797,year:2015,complexity:3.18,players:"2-4",playTime:"90 min",bggRating:6.9},
  155821:{name:"Inis",bggId:155821,year:2016,complexity:2.94,players:"2-4",playTime:"90 min",bggRating:7.8},
  255588:{name:"Inis: Seasons of Inis",bggId:255588,year:2019,complexity:3.02,players:"2-5",playTime:"90 min",bggRating:8.2},
  378387:{name:"Inventors of the South Tigris",bggId:378387,year:2024,complexity:4.46,players:"1-4",playTime:"120 min",bggRating:7.9},
  235627:{name:"Iquazú",bggId:235627,year:2017,complexity:1.82,players:"2-4",playTime:"50 min",bggRating:6.9},
  68182:{name:"Isla Dorada",bggId:68182,year:2010,complexity:2.16,players:"3-6",playTime:"90 min",bggRating:6.7},
  176494:{name:"Isle of Skye: From Chieftain to King",bggId:176494,year:2015,complexity:2.26,players:"2-5",playTime:"50 min",bggRating:7.4},
  251219:{name:"Istanbul: Big Box",bggId:251219,year:2018,complexity:2.5,players:"2-5",playTime:"90 min",bggRating:8.0},
  28023:{name:"Jamaica",bggId:28023,year:2007,complexity:1.66,players:"2-6",playTime:"60 min",bggRating:7.1},
  64:{name:"Joan of Arc",bggId:64,year:1998,complexity:2.54,players:"3-6",playTime:"150 min",bggRating:6.3},
  8098:{name:"Jungle Speed",bggId:8098,year:1997,complexity:1.13,players:"2-10",playTime:"10 min",bggRating:6.4},
  137900:{name:"Jupiter Rescue",bggId:137900,year:2013,complexity:1.88,players:"2-7",playTime:"60 min",bggRating:6.6},
  313475:{name:"Kemet: Blood and Sand – Book of the Dead",bggId:313475,year:2021,complexity:3.0,players:"2-5",playTime:"120 min",bggRating:7.5},
  336849:{name:"Kemet: Blood and Sand – Kickstarter Edition",bggId:336849,year:2021,complexity:3.0,players:"2-5",playTime:"120 min",bggRating:8.1},
  419158:{name:"Kemet: Rise of the Gods",bggId:419158,year:2025,complexity:3.0,players:"1-6",playTime:"150 min",bggRating:8.1},
  1933:{name:"Key to the Kingdom",bggId:1933,year:1990,complexity:1.59,players:"2-6",playTime:"45 min",bggRating:5.6},
  147930:{name:"King & Assassins",bggId:147930,year:2013,complexity:1.85,players:"2",playTime:"30 min",bggRating:6.8},
  70323:{name:"King of Tokyo",bggId:70323,year:2011,complexity:1.48,players:"2-6",playTime:"30 min",bggRating:7.1},
  127067:{name:"King of Tokyo: Power Up!",bggId:127067,year:2012,complexity:1.71,players:"2-6",playTime:"30 min",bggRating:7.6},
  199966:{name:"Kingsburg (Second Edition)",bggId:199966,year:2017,complexity:2.44,players:"2-5",playTime:"120 min",bggRating:7.4},
  391124:{name:"Kraftwagen: Age of Engineering",bggId:391124,year:2024,complexity:2.9,players:"2-4",playTime:"90 min",bggRating:7.4},
  1219:{name:"Labyrinth",bggId:1219,year:1986,complexity:1.34,players:"2-4",playTime:"20 min",bggRating:6.4},
  96913:{name:"Lancaster",bggId:96913,year:2011,complexity:2.99,players:"2-5",playTime:"60 min",bggRating:7.4},
  30932:{name:"Lascaux",bggId:30932,year:2007,complexity:1.57,players:"3-5",playTime:"25 min",bggRating:6.3},
  192927:{name:"Last Friday",bggId:192927,year:2016,complexity:2.26,players:"2-6",playTime:"120 min",bggRating:6.4},
  315727:{name:"Last Light",bggId:315727,year:2023,complexity:2.78,players:"2-4",playTime:"75 min",bggRating:7.3},
  381132:{name:"Last Light: Infinity",bggId:381132,year:2023,complexity:3.0,players:"2-8",playTime:"90 min",bggRating:7.6},
  29368:{name:"Last Night on Earth: The Zombie Game",bggId:29368,year:2007,complexity:2.3,players:"2-6",playTime:"90 min",bggRating:6.9},
  97842:{name:"Last Will",bggId:97842,year:2011,complexity:2.72,players:"2-5",playTime:"75 min",bggRating:7.2},
  143063:{name:"Last Will: Getting Sacked",bggId:143063,year:2013,complexity:2.67,players:"2-5",playTime:"75 min",bggRating:7.5},
  6554:{name:"Lawless",bggId:6554,year:2003,complexity:1.82,players:"2-6",playTime:"45 min",bggRating:6.0},
  3794:{name:"Legend of Zagor",bggId:3794,year:1993,complexity:1.7,players:"1-4",playTime:"60 min",bggRating:6.2},
  59959:{name:"Letters from Whitechapel",bggId:59959,year:2011,complexity:2.64,players:"2-6",playTime:"90 min",bggRating:7.3},
  161533:{name:"Lisboa",bggId:161533,year:2017,complexity:4.57,players:"1-4",playTime:"120 min",bggRating:8.2},
  770:{name:"Loot",bggId:770,year:1992,complexity:1.38,players:"2-8",playTime:"20 min",bggRating:6.3},
  3201:{name:"Lord of the Rings: The Confrontation",bggId:3201,year:2002,complexity:2.15,players:"2",playTime:"30 min",bggRating:7.2},
  338476:{name:"Lorenzo il Magnifico: Big Box",bggId:338476,year:2021,complexity:3.38,players:"2-5",playTime:"120 min",bggRating:8.4},
  312484:{name:"Lost Ruins of Arnak",bggId:312484,year:2020,complexity:2.93,players:"1-4",playTime:"120 min",bggRating:8.1},
  341254:{name:"Lost Ruins of Arnak: Expedition Leaders",bggId:341254,year:2021,complexity:3.1,players:"1-4",playTime:"120 min",bggRating:8.7},
  129622:{name:"Love Letter",bggId:129622,year:2012,complexity:1.18,players:"2-4",playTime:"20 min",bggRating:7.2},
  196326:{name:"Love Letter: Premium Edition",bggId:196326,year:2016,complexity:1.29,players:"2-8",playTime:"30 min",bggRating:7.4},
  198740:{name:"Lovecraft Letter",bggId:198740,year:2017,complexity:1.44,players:"2-6",playTime:"15 min",bggRating:7.2},
  66:{name:"Löwenherz",bggId:66,year:1997,complexity:2.78,players:"2-4",playTime:"90 min",bggRating:7.1},
  258242:{name:"Magnate: The First City",bggId:258242,year:2021,complexity:3.13,players:"1-5",playTime:"120 min",bggRating:7.5},
  9440:{name:"Maharaja: The Game of Palace Building in India",bggId:9440,year:2004,complexity:3.17,players:"2-5",playTime:"90 min",bggRating:7.1},
  199:{name:"Manhattan",bggId:199,year:1994,complexity:1.92,players:"2-4",playTime:"45 min",bggRating:6.7},
  14808:{name:"Marvel Heroes",bggId:14808,year:2006,complexity:3.08,players:"2-4",playTime:"120 min",bggRating:6.4},
  351817:{name:"Marvel Zombies: A Zombicide Game",bggId:351817,year:2023,complexity:2.39,players:"1-6",playTime:"60 min",bggRating:7.9},
  356524:{name:"Marvel Zombies: A Zombicide Game – Clash of the Sinister Six",bggId:356524,year:2023,complexity:3.0,players:"1-6",playTime:"60 min",bggRating:8.5},
  355481:{name:"Marvel Zombies: A Zombicide Game – Fantastic 4: Under Siege",bggId:355481,year:2023,complexity:2.67,players:"1-6",playTime:"60 min",bggRating:8.5},
  355817:{name:"Marvel Zombies: A Zombicide Game – Guardians of the Galaxy Set",bggId:355817,year:2023,complexity:3.0,players:"1-6",playTime:"60 min",bggRating:8.4},
  355200:{name:"Marvel Zombies: X-Men Resistance",bggId:355200,year:2023,complexity:2.53,players:"1-6",playTime:"60 min",bggRating:8.5},
  139030:{name:"Mascarade",bggId:139030,year:2013,complexity:1.53,players:"2-13",playTime:"30 min",bggRating:6.5},
  241106:{name:"Masque of the Red Death",bggId:241106,year:2018,complexity:2.44,players:"4-7",playTime:"90 min",bggRating:6.5},
  65673:{name:"Masques",bggId:65673,year:2010,complexity:2.01,players:"2-4",playTime:"45 min",bggRating:6.5},
  280453:{name:"Masters of Renaissance: Lorenzo il Magnifico – The Card Game",bggId:280453,year:2019,complexity:2.13,players:"1-4",playTime:"45 min",bggRating:7.1},
  317526:{name:"Masters of The Universe: Fields of Eternia The Board Game",bggId:317526,year:2022,complexity:3.1,players:"1-6",playTime:"180 min",bggRating:7.0},
  209010:{name:"Mechs vs. Minions",bggId:209010,year:2016,complexity:2.45,players:"2-4",playTime:"120 min",bggRating:7.9},
  31069:{name:"Medievalia",bggId:31069,year:2007,complexity:2.16,players:"2-4",playTime:"50 min",bggRating:5.6},
  42839:{name:"Medievalia Action!",bggId:42839,year:2009,complexity:3.0,players:"2-4",playTime:"50 min",bggRating:6.5},
  266304:{name:"MegaCity: Oceania",bggId:266304,year:2019,complexity:1.85,players:"2-4",playTime:"60 min",bggRating:6.7},
  10630:{name:"Memoir '44",bggId:10630,year:2004,complexity:2.27,players:"2-4",playTime:"45 min",bggRating:7.5},
  125755:{name:"Memoir '44: Equipment Pack",bggId:125755,year:2012,complexity:2.5,players:"2-8",playTime:"120 min",bggRating:7.8},
  37911:{name:"Memoir '44: Operation Overlord",bggId:37911,year:2008,complexity:2.49,players:"2-8",playTime:"90 min",bggRating:7.8},
  244794:{name:"Mercado",bggId:244794,year:2018,complexity:1.8,players:"2-4",playTime:"30 min",bggRating:6.5},
  25292:{name:"Merchants & Marauders",bggId:25292,year:2010,complexity:3.26,players:"2-4",playTime:"180 min",bggRating:7.4},
  161167:{name:"Merchants & Marauders: Seas of Glory",bggId:161167,year:2015,complexity:3.43,players:"2-4",playTime:"180 min",bggRating:8.3},
  277700:{name:"Merchants Cove",bggId:277700,year:2021,complexity:2.74,players:"1-4",playTime:"90 min",bggRating:7.4},
  364640:{name:"Merchants Cove: Master Craft",bggId:364640,year:2025,complexity:3.33,players:"1-5",playTime:"90 min",bggRating:8.1},
  286985:{name:"Merchants Cove: The Innkeeper",bggId:286985,year:2021,complexity:2.83,players:"1-5",playTime:"90 min",bggRating:7.7},
  286986:{name:"Merchants Cove: The Oracle",bggId:286986,year:2021,complexity:2.33,players:"1-5",playTime:"90 min",bggRating:7.9},
  230933:{name:"Merlin",bggId:230933,year:2017,complexity:3.1,players:"2-4",playTime:"75 min",bggRating:7.1},
  238799:{name:"Messina 1347",bggId:238799,year:2021,complexity:3.61,players:"1-4",playTime:"140 min",bggRating:7.5},
  357010:{name:"Mind MGMT: Secret Missions",bggId:357010,year:2021,players:"1-5",bggRating:7.9},
  284653:{name:"Mind MGMT: The Psychic Espionage “Game.”",bggId:284653,year:2021,complexity:2.91,players:"1-5",playTime:"60 min",bggRating:7.8},
  260927:{name:"Mississippi Queen",bggId:260927,year:2019,complexity:1.88,players:"2-6",playTime:"45 min",bggRating:6.7},
  358124:{name:"Mists over Carcassonne",bggId:358124,year:2022,complexity:2.16,players:"1-5",playTime:"35 min",bggRating:7.3},
  201048:{name:"Monkey Butt",bggId:201048,year:2016,complexity:1.5,players:"2-8",playTime:"30 min",bggRating:6.3},
  17835:{name:"Monsters Menace America",bggId:17835,year:2005,complexity:1.84,players:"2-4",playTime:"90 min",bggRating:6.0},
  441663:{name:"Monsters Menace the World",bggId:441663,year:2025,players:"2-4",playTime:"90 min",bggRating:6.6},
  329551:{name:"Mosaic: A Story of Civilization",bggId:329551,year:2022,complexity:3.05,players:"2-6",playTime:"120 min",bggRating:7.5},
  21763:{name:"Mr. Jack",bggId:21763,year:2006,complexity:2.17,players:"2",playTime:"30 min",bggRating:7.0},
  55427:{name:"Mr. Jack in New York",bggId:55427,year:2009,complexity:2.52,players:"2",playTime:"30 min",bggRating:7.2},
  30362:{name:"Mr. Jack: Extension",bggId:30362,year:2007,complexity:2.28,players:"2",playTime:"30 min",bggRating:7.2},
  260303:{name:"Mr. Jack: Extension",bggId:260303,year:2018,complexity:2.0,players:"2",playTime:"30 min",bggRating:7.5},
  189848:{name:"Munchkin Marvel",bggId:189848,year:2016,complexity:2.04,players:"3-6",playTime:"120 min",bggRating:6.8},
  109969:{name:"Mutant Meeples",bggId:109969,year:2012,complexity:2.44,players:"2-7",playTime:"45 min",bggRating:6.6},
  181304:{name:"Mysterium",bggId:181304,year:2015,complexity:1.89,players:"2-7",playTime:"42 min",bggRating:7.2},
  192661:{name:"Mysterium: Hidden Signs",bggId:192661,year:2016,complexity:1.73,players:"2-7",playTime:"42 min",bggRating:7.7},
  216465:{name:"Mysterium: Secrets & Lies",bggId:216465,year:2017,complexity:1.71,players:"2-7",playTime:"42 min",bggRating:7.8},
  65907:{name:"Mystery Express",bggId:65907,year:2010,complexity:2.66,players:"3-5",playTime:"90 min",bggRating:6.5},
  915:{name:"Mystery of the Abbey",bggId:915,year:1995,complexity:2.2,players:"3-6",playTime:"90 min",bggRating:6.5},
  153912:{name:"Mystery of the Abbey with The Pilgrims' Chronicles",bggId:153912,year:2007,complexity:2.24,players:"3-6",playTime:"90 min",bggRating:6.9},
  198455:{name:"Mystic ScROLLS",bggId:198455,year:2017,complexity:1.62,players:"2-4",playTime:"15 min",bggRating:6.5},
  186751:{name:"Mythic Battles: Pantheon",bggId:186751,year:2017,complexity:3.06,players:"2-4",playTime:"90 min",bggRating:8.3},
  220000:{name:"Mythic Battles: Pantheon – Pandora's Box",bggId:220000,year:2017,complexity:3.0,players:"1-4",playTime:"90 min",bggRating:8.7},
  244191:{name:"Naga Raja",bggId:244191,year:2019,complexity:2.02,players:"2",playTime:"30 min",bggRating:7.1},
  249746:{name:"Nanty Narking",bggId:249746,year:2019,complexity:2.32,players:"2-4",playTime:"60 min",bggRating:7.5},
  253106:{name:"Narcos: The Board Game",bggId:253106,year:2018,complexity:2.93,players:"2-5",playTime:"100 min",bggRating:7.0},
  381248:{name:"Nemesis: Retaliation",bggId:381248,year:2025,complexity:3.76,players:"1-5",playTime:"180 min",bggRating:8.7},
  15363:{name:"Nexus Ops",bggId:15363,year:2005,complexity:2.23,players:"2-4",playTime:"90 min",bggRating:7.2},
  306321:{name:"Night of the Ninja",bggId:306321,year:2021,complexity:1.84,players:"4-11",playTime:"30 min",bggRating:7.2},
  357659:{name:"Nightmare Cathedral",bggId:357659,year:2023,complexity:3.49,players:"1-4",playTime:"60 min",bggRating:7.5},
  101013:{name:"Ninja: Legend of the Scorpion Clan",bggId:101013,year:2011,complexity:2.65,players:"2-4",playTime:"45 min",bggRating:6.5},
  434367:{name:"Nippon: Zaibatsu",bggId:434367,year:2026,complexity:3.59,players:"1-4",playTime:"120 min",bggRating:8.6},
  213984:{name:"Notre Dame: 10th Anniversary",bggId:213984,year:2017,complexity:2.52,players:"2-5",playTime:"75 min",bggRating:7.5},
  324538:{name:"Nova Aetas Renaissance: Hyperion",bggId:324538,year:2023,players:"1-6",playTime:"90 min",bggRating:8.4},
  324537:{name:"Nova Aetas Renaissance: The Mediceo",bggId:324537,year:2023,players:"1-6",playTime:"90 min",bggRating:8.3},
  396790:{name:"Nucleum",bggId:396790,year:2023,complexity:4.19,players:"1-4",playTime:"150 min",bggRating:8.1},
  65515:{name:"Nuns on the Run",bggId:65515,year:2010,complexity:2.07,players:"2-8",playTime:"60 min",bggRating:6.5},
  343362:{name:"Oak",bggId:343362,year:2022,complexity:3.13,players:"1-4",playTime:"90 min",bggRating:7.1},
  172158:{name:"Oath of the Brotherhood",bggId:172158,year:2015,complexity:2.1,players:"2-5",playTime:"60 min",bggRating:6.3},
  232414:{name:"Oceans",bggId:232414,year:2020,complexity:2.85,players:"2-4",playTime:"90 min",bggRating:7.4},
  271762:{name:"Oh My Gold!",bggId:271762,year:2019,complexity:1.0,players:"2-4",playTime:"10 min",bggRating:5.9},
  406933:{name:"Omertà: The Five Families",bggId:406933,year:2025,complexity:3.75,players:"2-5",playTime:"180 min",bggRating:8.1},
  184267:{name:"On Mars",bggId:184267,year:2020,complexity:4.63,players:"1-4",playTime:"150 min",bggRating:8.2},
  296981:{name:"On Mars: Upgrade Pack",bggId:296981,year:2020,complexity:4.0,players:"1-4",playTime:"150 min",bggRating:8.1},
  176361:{name:"One Night Revolution",bggId:176361,year:2015,complexity:1.87,players:"3-10",playTime:"15 min",bggRating:6.1},
  164928:{name:"Orléans",bggId:164928,year:2014,complexity:3.01,players:"2-5",playTime:"90 min",bggRating:8.0},
  191051:{name:"Outlive",bggId:191051,year:2017,complexity:3.04,players:"2-4",playTime:"110 min",bggRating:7.3},
  321596:{name:"P'achakuna",bggId:321596,year:2021,complexity:1.81,players:"2",playTime:"60 min",bggRating:6.8},
  129050:{name:"P.I.",bggId:129050,year:2012,complexity:2.23,players:"2-5",playTime:"60 min",bggRating:6.7},
  297674:{name:"Pacific Rails Inc.",bggId:297674,year:2020,complexity:3.42,players:"2-4",playTime:"90 min",bggRating:6.7},
  266810:{name:"Paladins of the West Kingdom",bggId:266810,year:2019,complexity:3.71,players:"1-4",playTime:"120 min",bggRating:8.0},
  274782:{name:"Paladins of the West Kingdom: 2019 Promos",bggId:274782,year:2019,complexity:3.0,players:"1-4",playTime:"120 min",bggRating:8.0},
  32412:{name:"Palastgeflüster",bggId:32412,year:2007,complexity:1.64,players:"3-5",playTime:"45 min",bggRating:6.8},
  104581:{name:"Panic on Wall Street!",bggId:104581,year:2011,complexity:1.68,players:"3-11",playTime:"45 min",bggRating:7.0},
  280136:{name:"Paranormal Detectives",bggId:280136,year:2019,complexity:1.67,players:"2-6",playTime:"50 min",bggRating:6.9},
  308119:{name:"Pax Renaissance: 2nd Edition",bggId:308119,year:2021,complexity:4.65,players:"1-4",playTime:"120 min",bggRating:8.4},
  90040:{name:"Pergamon",bggId:90040,year:2011,complexity:2.24,players:"2-4",playTime:"45 min",bggRating:6.9},
  21954:{name:"Perikles",bggId:21954,year:2006,complexity:3.28,players:"3-5",playTime:"120 min",bggRating:6.9},
  165095:{name:"Pirate Loot: Base Set",bggId:165095,year:2015,complexity:2.0,players:"2-4",playTime:"60 min",bggRating:6.1},
  2987:{name:"Pirate's Cove",bggId:2987,year:2002,complexity:2.01,players:"3-5",playTime:"90 min",bggRating:6.6},
  117663:{name:"Piraten Kapern",bggId:117663,year:2012,complexity:1.1,players:"2-5",playTime:"30 min",bggRating:6.4},
  258779:{name:"Planet Unknown",bggId:258779,year:2022,complexity:2.25,players:"1-6",playTime:"80 min",bggRating:7.8},
  393509:{name:"Planet Unknown: Supermoon",bggId:393509,year:2025,complexity:2.5,players:"1-6",playTime:"80 min",bggRating:7.6},
  201920:{name:"Pocket Madness",bggId:201920,year:2016,complexity:1.29,players:"2-4",playTime:"30 min",bggRating:6.0},
  331265:{name:"Port Royal: Big Box",bggId:331265,year:2022,complexity:1.75,players:"1-5",playTime:"50 min",bggRating:7.5},
  105624:{name:"Poseidon's Kingdom",bggId:105624,year:2011,complexity:2.39,players:"2-4",playTime:"60 min",bggRating:6.8},
  180974:{name:"Potion Explosion",bggId:180974,year:2015,complexity:1.78,players:"2-4",playTime:"45 min",bggRating:7.1},
  257729:{name:"Potion Explosion: The 6th Student",bggId:257729,year:2019,complexity:2.14,players:"2-6",playTime:"45 min",bggRating:7.5},
  203542:{name:"Potion Explosion: The Fifth Ingredient",bggId:203542,year:2017,complexity:1.95,players:"2-4",playTime:"60 min",bggRating:7.5},
  487:{name:"Power",bggId:487,year:1981,complexity:2.59,players:"2-4",playTime:"30 min",bggRating:6.1},
  2651:{name:"Power Grid",bggId:2651,year:2004,complexity:3.25,players:"2-6",playTime:"120 min",bggRating:7.8},
  25031:{name:"Power Grid: Benelux/Central Europe",bggId:25031,year:2006,complexity:3.14,players:"2-6",playTime:"120 min",bggRating:8.0},
  285448:{name:"Power Grid: Middle East/South Africa",bggId:285448,year:2019,complexity:3.0,players:"2-6",playTime:"120 min",bggRating:8.0},
  78727:{name:"Power Grid: Russia & Japan",bggId:78727,year:2010,complexity:3.08,players:"2-6",playTime:"120 min",bggRating:7.9},
  344429:{name:"Power Grid: The New Power Plants – Set 2",bggId:344429,year:2021,complexity:3.0,players:"2-6",playTime:"120 min",bggRating:7.8},
  181971:{name:"Power Grid: The Stock Companies",bggId:181971,year:2015,complexity:3.52,players:"2-6",playTime:"120 min",bggRating:6.7},
  12451:{name:"Pro Action Football",bggId:12451,year:1994,complexity:1.12,players:"2",playTime:"90 min",bggRating:6.4},
  108687:{name:"Puerto Rico",bggId:108687,year:2011,complexity:3.22,players:"2-5",playTime:"150 min",bggRating:8.3},
  331979:{name:"Quartermaster General WW2: 2nd Edition",bggId:331979,year:2020,complexity:2.62,players:"2-6",playTime:"120 min",bggRating:7.7},
  208773:{name:"Quartermaster General: 1914",bggId:208773,year:2016,complexity:2.68,players:"2-5",playTime:"120 min",bggRating:7.5},
  6068:{name:"Queen's Necklace",bggId:6068,year:2003,complexity:1.91,players:"2-4",playTime:"45 min",bggRating:6.4},
  20445:{name:"Quest for the DragonLords (Second Edition)",bggId:20445,year:2006,complexity:3.11,players:"2-4",playTime:"120 min",bggRating:6.2},
  3190:{name:"Quixo",bggId:3190,year:1995,complexity:1.62,players:"2-4",playTime:"15 min",bggRating:6.3},
  125752:{name:"Race! Formula 90",bggId:125752,year:2013,complexity:3.56,players:"2-6",playTime:"270 min",bggRating:7.9},
  301880:{name:"Raiders of Scythia",bggId:301880,year:2020,complexity:2.77,players:"1-4",playTime:"80 min",bggRating:7.7},
  249301:{name:"Raiders of the North Sea: Solo Variant",bggId:249301,year:2018,complexity:2.44,players:"1",playTime:"50 min",bggRating:8.1},
  245654:{name:"Railroad Ink: Deep Blue Edition",bggId:245654,year:2018,complexity:1.47,players:"1-6",playTime:"30 min",bggRating:7.1},
  207691:{name:"Railroad Revolution",bggId:207691,year:2016,complexity:3.24,players:"2-4",playTime:"90 min",bggRating:7.3},
  214988:{name:"Railways of Nippon",bggId:214988,year:2018,complexity:2.21,players:"2-4",playTime:"120 min",bggRating:7.6},
  17133:{name:"Railways of the World",bggId:17133,year:2005,complexity:3.02,players:"2-6",playTime:"120 min",bggRating:7.7},
  202732:{name:"Raise Your Goblets",bggId:202732,year:2016,complexity:1.39,players:"2-12",playTime:"45 min",bggRating:6.1},
  312959:{name:"Rallyman: DIRT",bggId:312959,year:2022,complexity:2.32,players:"1-6",playTime:"60 min",bggRating:7.5},
  432591:{name:"Rallyman: DIRT – Monte-Carlo",bggId:432591,year:2025,complexity:3.0,players:"1-6",playTime:"60 min",bggRating:8.4},
  143690:{name:"Rattus: Arabian Traders",bggId:143690,year:2013,complexity:2.33,players:"2-6",playTime:"45 min",bggRating:6.9},
  360212:{name:"Rattus: Big Box",bggId:360212,year:2023,complexity:2.14,players:"2-6",playTime:"60 min",bggRating:7.2},
  143689:{name:"Rattus: Mercatus",bggId:143689,year:2013,complexity:2.25,players:"2-4",playTime:"45 min",bggRating:7.0},
  351040:{name:"Ready Set Bet",bggId:351040,year:2022,complexity:1.33,players:"2-9",playTime:"60 min",bggRating:7.5},
  277:{name:"Res Publica",bggId:277,year:1991,complexity:1.71,players:"3-5",playTime:"60 min",bggRating:5.9},
  256680:{name:"Return to Dark Tower",bggId:256680,year:2022,complexity:2.65,players:"1-4",playTime:"120 min",bggRating:8.2},
  118695:{name:"Riff Raff",bggId:118695,year:2012,complexity:1.19,players:"2-4",playTime:"30 min",bggRating:6.9},
  30658:{name:"Rise of Empires",bggId:30658,year:2009,complexity:3.54,players:"2-5",playTime:"150 min",bggRating:7.0},
  205896:{name:"Rising Sun",bggId:205896,year:2018,complexity:3.3,players:"3-5",playTime:"120 min",bggRating:7.8},
  224654:{name:"Rising Sun: Daimyo Box",bggId:224654,year:2018,complexity:3.36,players:"3-6",playTime:"120 min",bggRating:8.5},
  223782:{name:"Rising Sun: Dynasty Invasion",bggId:223782,year:2018,complexity:3.12,players:"3-6",playTime:"120 min",bggRating:8.2},
  224479:{name:"Rising Sun: Kami Unbound",bggId:224479,year:2018,complexity:3.47,players:"3-5",playTime:"120 min",bggRating:8.0},
  224653:{name:"Rising Sun: Monster Pack",bggId:224653,year:2018,complexity:3.0,players:"3-5",playTime:"120 min",bggRating:8.1},
  10383:{name:"Risk: Godstorm",bggId:10383,year:2004,complexity:2.69,players:"2-5",playTime:"120 min",bggRating:6.3},
  66056:{name:"Rivals for Catan",bggId:66056,year:2010,complexity:2.33,players:"2",playTime:"60 min",bggRating:6.9},
  93401:{name:"Rivals for Catan: Age of Darkness",bggId:93401,year:2011,complexity:2.27,players:"2",playTime:"75 min",bggRating:7.5},
  127437:{name:"Rivals for Catan: Age of Enlightenment",bggId:127437,year:2012,complexity:2.26,players:"2",playTime:"75 min",bggRating:7.7},
  168788:{name:"Rum & Bones",bggId:168788,year:2015,complexity:2.34,players:"2-6",playTime:"60 min",bggRating:6.9},
  198584:{name:"Rum & Bones: Blutrausch Legion",bggId:198584,year:2017,players:"2-6",playTime:"60 min",bggRating:7.9},
  181631:{name:"Rum & Bones: La Brise Sanguine",bggId:181631,year:2015,complexity:2.0,players:"2-6",bggRating:7.5},
  196202:{name:"Rum & Bones: Second Tide",bggId:196202,year:2017,complexity:2.83,players:"2-6",playTime:"60 min",bggRating:7.6},
  230221:{name:"Rum & Bones: Second Tide – Captains Promos Set",bggId:230221,year:2017,players:"2-6",playTime:"75 min",bggRating:7.8},
  198890:{name:"Rum & Bones: Second Tide – Cutthroats Hero Pack",bggId:198890,year:2017,players:"2-6",bggRating:7.8},
  217667:{name:"Rum & Bones: Second Tide – Deep Lords Heroes Set #1",bggId:217667,year:2017,players:"2-6",playTime:"75 min",bggRating:7.8},
  198326:{name:"Rum & Bones: Second Tide – Fairy Tale Hero Pack",bggId:198326,year:2017,players:"2-6",bggRating:7.8},
  198405:{name:"Rum & Bones: Second Tide – Iron Inquisition Heroes Set #1",bggId:198405,year:2017,players:"2-6",bggRating:8.0},
  202680:{name:"Rum & Bones: Second Tide – KS exclusives",bggId:202680,year:2017,players:"2-6",playTime:"75 min",bggRating:7.9},
  198923:{name:"Rum & Bones: Second Tide – League of Extraordinary Pirates Hero Pack",bggId:198923,year:2017,players:"2-6",bggRating:7.6},
  217669:{name:"Rum & Bones: Second Tide – Marea de la Muerte Heroes Set #1",bggId:217669,year:2017,players:"2-6",playTime:"75 min",bggRating:7.7},
  230218:{name:"Rum & Bones: Second Tide – Mercenaries Promos Set #3",bggId:230218,year:2017,players:"2-6",playTime:"75 min",bggRating:7.8},
  230219:{name:"Rum & Bones: Second Tide – Mercenaries Promos Set #4",bggId:230219,year:2017,players:"2-6",playTime:"75 min",bggRating:7.9},
  217670:{name:"Rum & Bones: Second Tide – Sea Monsters",bggId:217670,year:2017,complexity:3.0,players:"2-6",playTime:"75 min",bggRating:7.9},
  202681:{name:"Rum & Bones: Second Tide – Season One Upgrade Kit",bggId:202681,year:2017,players:"2-6",playTime:"75 min",bggRating:8.4},
  21523:{name:"Runebound: Second Edition",bggId:21523,year:2005,complexity:2.68,players:"2-6",playTime:"240 min",bggRating:6.9},
  59294:{name:"Runewars",bggId:59294,year:2010,complexity:3.79,players:"2-4",playTime:"240 min",bggRating:7.6},
  288316:{name:"Rurik: Dawn of Kiev – Kickstarter Edition",bggId:288316,year:2019,complexity:2.8,players:"1-4",playTime:"120 min",bggRating:7.9},
  312983:{name:"Rurik: Stone & Blade",bggId:312983,year:2021,complexity:3.14,players:"1-4",playTime:"140 min",bggRating:8.1},
  168215:{name:"Saboteur: The Duel",bggId:168215,year:2014,complexity:1.29,players:"1-2",playTime:"30 min",bggRating:6.0},
  245214:{name:"Saboteur: The Lost Mines",bggId:245214,year:2018,complexity:2.0,players:"3-9",playTime:"45 min",bggRating:6.3},
  128667:{name:"Samurai Sword",bggId:128667,year:2012,complexity:1.76,players:"3-7",playTime:"40 min",bggRating:6.7},
  104347:{name:"Santiago de Cuba",bggId:104347,year:2011,complexity:2.15,players:"2-4",playTime:"75 min",bggRating:6.9},
  194655:{name:"Santorini",bggId:194655,year:2016,complexity:1.72,players:"2-4",playTime:"20 min",bggRating:7.3},
  324090:{name:"Scarface 1920",bggId:324090,year:2023,complexity:3.83,players:"1-4",playTime:"150 min",bggRating:7.9},
  388682:{name:"Scarface 1920: Bloody Business",bggId:388682,year:2025,complexity:3.5,players:"1-4",playTime:"180 min",bggRating:8.6},
  367041:{name:"Scholars of the South Tigris",bggId:367041,year:2023,complexity:4.13,players:"1-4",playTime:"90 min",bggRating:8.0},
  169786:{name:"Scythe",bggId:169786,year:2016,complexity:3.45,players:"1-5",playTime:"115 min",bggRating:8.1},
  199727:{name:"Scythe: Invaders from Afar",bggId:199727,year:2016,complexity:3.44,players:"1-7",playTime:"140 min",bggRating:8.3},
  279304:{name:"Scythe: Modular Board",bggId:279304,year:2019,complexity:3.3,players:"1-5",playTime:"115 min",bggRating:8.2},
  242277:{name:"Scythe: The Rise of Fenris",bggId:242277,year:2018,complexity:3.42,players:"1-5",playTime:"150 min",bggRating:8.7},
  223555:{name:"Scythe: The Wind Gambit",bggId:223555,year:2017,complexity:3.41,players:"1-7",playTime:"140 min",bggRating:7.8},
  189052:{name:"Sea of Clouds",bggId:189052,year:2016,complexity:1.72,players:"2-4",playTime:"45 min",bggRating:6.6},
  343525:{name:"Seas of Havoc",bggId:343525,year:2023,complexity:2.53,players:"1-5",playTime:"75 min",bggRating:7.3},
  200847:{name:"Secrets",bggId:200847,year:2017,complexity:1.5,players:"4-8",playTime:"35 min",bggRating:6.4},
  418059:{name:"SETI: Search for Extraterrestrial Intelligence",bggId:418059,year:2024,complexity:3.83,players:"1-4",playTime:"160 min",bggRating:8.4},
  102898:{name:"Sewer Pirats",bggId:102898,year:2012,complexity:2.11,players:"2-5",playTime:"60 min",bggRating:6.6},
  24068:{name:"Shadow Hunters",bggId:24068,year:2005,complexity:1.82,players:"4-8",playTime:"60 min",bggRating:6.8},
  15062:{name:"Shadows over Camelot",bggId:15062,year:2005,complexity:2.57,players:"3-7",playTime:"90 min",bggRating:7.1},
  35704:{name:"Shadows over Camelot: Merlin's Company",bggId:35704,year:2008,complexity:2.54,players:"3-8",playTime:"90 min",bggRating:7.4},
  129904:{name:"Shadows over Camelot: The Card Game",bggId:129904,year:2012,complexity:1.94,players:"1-7",playTime:"20 min",bggRating:5.7},
  121615:{name:"Shadows Over the Empire",bggId:121615,year:2013,complexity:2.85,players:"2-4",playTime:"120 min",bggRating:5.9},
  298638:{name:"Sheriff of Nottingham: 2nd Edition",bggId:298638,year:2020,complexity:1.71,players:"3-6",playTime:"60 min",bggRating:7.2},
  226065:{name:"Sheriff of Nottingham: Merry Men",bggId:226065,year:2017,complexity:2.0,players:"3-6",playTime:"60 min",bggRating:7.5},
  393179:{name:"Shipyard (Second Edition)",bggId:393179,year:2023,complexity:3.28,players:"1-4",playTime:"120 min",bggRating:7.4},
  239175:{name:"Shiver Me Timbers",bggId:239175,year:2021,complexity:3.29,players:"2-4",playTime:"150 min",bggRating:7.9},
  176103:{name:"Shogun Big Box",bggId:176103,year:2015,complexity:3.31,players:"3-5",playTime:"150 min",bggRating:8.0},
  125534:{name:"Skeleton Island",bggId:125534,year:2012,complexity:1.0,players:"2-4",playTime:"15 min",bggRating:5.9},
  150145:{name:"Skull King",bggId:150145,year:2013,complexity:1.73,players:"2-8",playTime:"30 min",bggRating:7.5},
  298231:{name:"Skyrise",bggId:298231,year:2024,complexity:2.24,players:"2-4",playTime:"90 min",bggRating:7.7},
  317191:{name:"Skytear (Kickstarter edition)",bggId:317191,year:2020,players:"2-8",playTime:"45 min",bggRating:7.3},
  594:{name:"Sleuth",bggId:594,year:1971,complexity:2.47,players:"3-7",playTime:"45 min",bggRating:6.9},
  284616:{name:"Small Samurai Empires",bggId:284616,year:2020,complexity:2.75,players:"2-4",playTime:"90 min",bggRating:7.5},
  40692:{name:"Small World",bggId:40692,year:2009,complexity:2.35,players:"2-5",playTime:"80 min",bggRating:7.2},
  97786:{name:"Small World Underground",bggId:97786,year:2011,complexity:2.59,players:"2-5",playTime:"90 min",bggRating:7.2},
  1568:{name:"Space Crusade",bggId:1568,year:1990,complexity:2.3,players:"2-4",playTime:"120 min",bggRating:7.1},
  128671:{name:"Spartacus: A Game of Blood and Treachery",bggId:128671,year:2012,complexity:2.73,players:"3-4",playTime:"180 min",bggRating:7.5},
  256606:{name:"Spirits of the Wild",bggId:256606,year:2018,complexity:1.44,players:"2",playTime:"30 min",bggRating:7.3},
  166384:{name:"Spyfall",bggId:166384,year:2014,complexity:1.23,players:"3-8",playTime:"15 min",bggRating:6.7},
  187645:{name:"Star Wars: Rebellion",bggId:187645,year:2016,complexity:3.75,players:"2-4",playTime:"240 min",bggRating:8.4},
  226840:{name:"Star Wars: Rebellion – Rise of the Empire",bggId:226840,year:2017,complexity:3.69,players:"2-4",playTime:"240 min",bggRating:8.9},
  22827:{name:"StarCraft: The Board Game",bggId:22827,year:2007,complexity:3.86,players:"2-6",playTime:"240 min",bggRating:7.4},
  363369:{name:"Starship Captains",bggId:363369,year:2022,complexity:2.36,players:"1-4",playTime:"100 min",bggRating:7.1},
  260009:{name:"Steam Pirates",bggId:260009,year:2018,complexity:2.5,players:"2-4",playTime:"90 min",bggRating:6.1},
  331992:{name:"Steampunk Rally Fusion: Atomic Edition",bggId:331992,year:2021,complexity:2.86,players:"2-8",playTime:"60 min",bggRating:7.7},
  302413:{name:"Steamwatchers",bggId:302413,year:2021,complexity:3.17,players:"2-5",playTime:"90 min",bggRating:7.3},
  215312:{name:"Stop Thief!",bggId:215312,year:2017,complexity:1.48,players:"1-5",playTime:"60 min",bggRating:6.9},
  207809:{name:"Sultans of Wind",bggId:207809,year:2016,complexity:1.5,players:"2-4",playTime:"40 min",bggRating:6.3},
  18745:{name:"Sun Tzu",bggId:18745,year:2005,complexity:2.09,players:"2",playTime:"30 min",bggRating:7.0},
  194517:{name:"Super Fantasy Brawl",bggId:194517,year:2022,complexity:2.28,players:"2-4",playTime:"40 min",bggRating:7.5},
  427084:{name:"Superstore 3000",bggId:427084,year:2024,complexity:1.95,players:"2-4",playTime:"45 min",bggRating:6.4},
  2653:{name:"Survive: Escape from Atlantis!",bggId:2653,year:1982,complexity:1.69,players:"2-4",playTime:"60 min",bggRating:7.3},
  349369:{name:"Tabriz",bggId:349369,year:2025,complexity:2.02,players:"1-5",playTime:"60 min",bggRating:7.2},
  475:{name:"Taj Mahal",bggId:475,year:2000,complexity:2.85,players:"2-5",playTime:"90 min",bggRating:7.3},
  223481:{name:"Take the Gold",bggId:223481,year:2017,complexity:1.0,players:"2-6",playTime:"15 min",bggRating:6.5},
  34119:{name:"Tales of the Arabian Nights",bggId:34119,year:2009,complexity:2.15,players:"2-6",playTime:"120 min",bggRating:7.2},
  422406:{name:"Talisman: Alliances – Fate Beckons",bggId:422406,year:2024,complexity:2.5,players:"2-6",bggRating:7.3},
  415550:{name:"Talisman: The Magical Quest Game – 5th Edition",bggId:415550,year:2024,complexity:2.11,players:"2-6",bggRating:7.3},
  306481:{name:"Tawantinsuyu: The Inca Empire",bggId:306481,year:2020,complexity:4.09,players:"1-4",playTime:"120 min",bggRating:7.4},
  9464:{name:"Teenage Mutant Ninja Turtles: Pizza Power Game",bggId:9464,year:1987,complexity:1.3,players:"2-4",playTime:"20 min",bggRating:4.8},
  229853:{name:"Teotihuacan: City of Gods",bggId:229853,year:2018,complexity:3.78,players:"1-4",playTime:"120 min",bggRating:7.8},
  167791:{name:"Terraforming Mars",bggId:167791,year:2016,complexity:3.27,players:"1-5",playTime:"120 min",bggRating:8.3},
  311247:{name:"Terraforming Mars: Big Box",bggId:311247,year:2021,complexity:2.06,players:"1-5",playTime:"120 min",bggRating:8.3},
  255681:{name:"Terraforming Mars: Colonies",bggId:255681,year:2018,complexity:3.01,players:"1-5",playTime:"120 min",bggRating:8.1},
  401114:{name:"Terraforming Mars: Milestones & Awards",bggId:401114,year:2024,complexity:3.0,players:"2-5",bggRating:8.4},
  247030:{name:"Terraforming Mars: Prelude",bggId:247030,year:2018,complexity:2.56,players:"1-5",playTime:"120 min",bggRating:8.8},
  387809:{name:"Terraforming Mars: Prelude 2",bggId:387809,year:2024,complexity:2.38,players:"1-5",playTime:"120 min",bggRating:8.4},
  273473:{name:"Terraforming Mars: Turmoil",bggId:273473,year:2019,complexity:3.68,players:"1-5",playTime:"150 min",bggRating:7.5},
  371433:{name:"Terrorscape",bggId:371433,year:2023,complexity:2.27,players:"2-4",playTime:"45 min",bggRating:8.1},
  385270:{name:"Terrorscape: Amorphous Peril",bggId:385270,year:2023,complexity:2.0,players:"2-4",bggRating:8.6},
  385269:{name:"Terrorscape: Feral Instincts",bggId:385269,year:2023,complexity:2.5,players:"2-4",bggRating:8.6},
  385271:{name:"Terrorscape: Lethal Immortals",bggId:385271,year:2023,complexity:2.0,players:"2-4",bggRating:8.4},
  423733:{name:"Terrorscape: Putrefied Enmity",bggId:423733,year:2025,players:"2-4",bggRating:8.6},
  98315:{name:"The Adventurers: The Pyramid of Horus",bggId:98315,year:2011,complexity:1.75,players:"2-6",playTime:"45 min",bggRating:6.8},
  43868:{name:"The Adventurers: The Temple of Chac",bggId:43868,year:2009,complexity:1.66,players:"2-6",playTime:"45 min",bggRating:6.6},
  271320:{name:"The Castles of Burgundy",bggId:271320,year:2019,complexity:2.91,players:"1-4",playTime:"120 min",bggRating:8.5},
  129351:{name:"The Cave",bggId:129351,year:2012,complexity:2.52,players:"2-5",playTime:"60 min",bggRating:6.5},
  170437:{name:"The Curse of the Black Dice",bggId:170437,year:2015,complexity:1.74,players:"2-4",playTime:"40 min",bggRating:6.1},
  184648:{name:"The Exiled: Siege",bggId:184648,year:2016,complexity:2.8,players:"1-5",playTime:"120 min",bggRating:6.5},
  238164:{name:"The Faceless",bggId:238164,year:2018,complexity:2.29,players:"2-4",playTime:"45 min",bggRating:6.6},
  2921:{name:"The Game of Life",bggId:2921,year:1960,complexity:1.17,players:"2-6",playTime:"60 min",bggRating:4.4},
  195539:{name:"The Godfather: Corleone's Empire",bggId:195539,year:2017,complexity:2.64,players:"2-5",playTime:"90 min",bggRating:7.5},
  292375:{name:"The Great Wall",bggId:292375,year:2021,complexity:3.91,players:"1-4",playTime:"180 min",bggRating:7.8},
  254513:{name:"The Grimm Masquerade",bggId:254513,year:2019,complexity:1.69,players:"2-5",playTime:"40 min",bggRating:6.9},
  339906:{name:"The Hunger",bggId:339906,year:2021,complexity:2.33,players:"2-6",playTime:"60 min",bggRating:7.0},
  358559:{name:"The Hunger: High Stakes",bggId:358559,year:2022,complexity:2.6,players:"2-6",playTime:"60 min",bggRating:7.7},
  368260:{name:"The Hunger: Severin Promo Card",bggId:368260,year:2022,players:"2-6",playTime:"60 min",bggRating:6.9},
  319966:{name:"The King Is Dead: Second Edition",bggId:319966,year:2020,complexity:2.17,players:"2-4",playTime:"45 min",bggRating:7.6},
  275557:{name:"The Last Bottle of Rum",bggId:275557,year:2021,complexity:1.92,players:"2-5",playTime:"60 min",bggRating:7.2},
  41916:{name:"The Magic Labyrinth",bggId:41916,year:2009,complexity:1.21,players:"2-4",playTime:"30 min",bggRating:6.8},
  1950:{name:"The Mysteries of Peking",bggId:1950,year:1987,complexity:1.31,players:"2-6",playTime:"30 min",bggRating:5.8},
  555:{name:"The Princes of Florence",bggId:555,year:2000,complexity:3.24,players:"1-5",playTime:"100 min",bggRating:7.5},
  36811:{name:"The Princes of Machu Picchu",bggId:36811,year:2008,complexity:3.1,players:"2-5",playTime:"90 min",bggRating:6.9},
  181796:{name:"The Prodigals Club",bggId:181796,year:2015,complexity:3.26,players:"2-5",playTime:"100 min",bggRating:7.3},
  349955:{name:"The Quacks of Quedlinburg: MegaBox",bggId:349955,year:2021,complexity:2.05,players:"2-5",playTime:"60 min",bggRating:8.2},
  217372:{name:"The Quest for El Dorado",bggId:217372,year:2017,complexity:1.94,players:"2-4",playTime:"60 min",bggRating:7.7},
  128882:{name:"The Resistance: Avalon",bggId:128882,year:2012,complexity:1.74,players:"5-10",playTime:"30 min",bggRating:7.5},
  358557:{name:"The Search for Lost Species",bggId:358557,year:2023,complexity:2.95,players:"1-4",playTime:"75 min",bggRating:7.7},
  279537:{name:"The Search for Planet X",bggId:279537,year:2020,complexity:2.43,players:"1-4",playTime:"75 min",bggRating:7.9},
  257987:{name:"The Towers of Arkhanos",bggId:257987,year:2019,complexity:1.38,players:"2-4",playTime:"30 min",bggRating:6.7},
  282775:{name:"The Warp",bggId:282775,year:2023,complexity:3.52,players:"1-4",playTime:"180 min",bggRating:7.8},
  503:{name:"Through the Desert",bggId:503,year:1998,complexity:2.16,players:"2-5",playTime:"45 min",bggRating:7.2},
  21790:{name:"Thurn and Taxis",bggId:21790,year:2006,complexity:2.26,players:"2-4",playTime:"60 min",bggRating:7.1},
  329841:{name:"Ticket to Ride: Europe – 15th Anniversary",bggId:329841,year:2021,complexity:1.87,players:"2-5",playTime:"60 min",bggRating:8.2},
  202670:{name:"Ticket to Ride: Rails & Sails",bggId:202670,year:2016,complexity:2.48,players:"2-5",playTime:"120 min",bggRating:7.4},
  34127:{name:"Ticket to Ride: The Card Game",bggId:34127,year:2008,complexity:1.88,players:"2-4",playTime:"30 min",bggRating:6.1},
  42:{name:"Tigris & Euphrates",bggId:42,year:1997,complexity:3.48,players:"2-4",playTime:"120 min",bggRating:7.7},
  54:{name:"Tikal",bggId:54,year:1999,complexity:2.78,players:"2-4",playTime:"90 min",bggRating:7.3},
  42215:{name:"Tobago",bggId:42215,year:2009,complexity:2.13,players:"2-4",playTime:"60 min",bggRating:7.1},
  319398:{name:"Tobago: Volcano",bggId:319398,year:2020,complexity:2.0,players:"2-4",playTime:"45 min",bggRating:7.5},
  273993:{name:"Tonari",bggId:273993,year:2019,complexity:1.11,players:"2-4",playTime:"45 min",bggRating:6.4},
  218530:{name:"Tortuga 1667",bggId:218530,year:2017,complexity:2.05,players:"2-9",playTime:"40 min",bggRating:6.9},
  242639:{name:"Treasure Island",bggId:242639,year:2018,complexity:2.2,players:"2-5",playTime:"45 min",bggRating:7.2},
  297566:{name:"Treasure Island: Captain Silver – Revenge Island",bggId:297566,year:2020,complexity:2.0,players:"2-5",playTime:"45 min",bggRating:7.7},
  172659:{name:"Trickerion: Dahlgaard's Gifts",bggId:172659,year:2015,complexity:4.05,players:"2-4",playTime:"120 min",bggRating:8.2},
  163068:{name:"Trickerion: Legends of Illusion",bggId:163068,year:2015,complexity:4.26,players:"2-4",playTime:"180 min",bggRating:8.0},
  281442:{name:"Trismegistus: The Ultimate Formula",bggId:281442,year:2019,complexity:4.19,players:"1-4",playTime:"120 min",bggRating:7.5},
  72478:{name:"Trollhalla",bggId:72478,year:2011,complexity:2.02,players:"2-4",playTime:"60 min",bggRating:6.6},
  124172:{name:"Tsuro of the Seas",bggId:124172,year:2012,complexity:1.41,players:"2-8",playTime:"40 min",bggRating:6.5},
  356123:{name:"Turing Machine",bggId:356123,year:2022,complexity:2.54,players:"1-4",playTime:"20 min",bggRating:7.6},
  233078:{name:"Twilight Imperium: Fourth Edition",bggId:233078,year:2017,complexity:4.35,players:"3-6",playTime:"480 min",bggRating:8.6},
  126163:{name:"Tzolk'in: The Mayan Calendar",bggId:126163,year:2012,complexity:3.66,players:"2-4",playTime:"90 min",bggRating:7.8},
  249410:{name:"U.S. Telegraph",bggId:249410,year:2018,complexity:1.73,players:"2-4",playTime:"60 min",bggRating:6.9},
  46396:{name:"Ubongo 3D",bggId:46396,year:2009,complexity:1.91,players:"2-4",playTime:"30 min",bggRating:7.1},
  340466:{name:"Unfathomable",bggId:340466,year:2021,complexity:3.12,players:"3-6",playTime:"240 min",bggRating:7.5},
  252399:{name:"Vast: The Mysterious Manor",bggId:252399,year:2019,complexity:3.75,players:"1-5",playTime:"120 min",bggRating:7.4},
  1001:{name:"Vendetta",bggId:1001,year:1988,complexity:1.28,players:"2-4",playTime:"30 min",bggRating:5.1},
  205477:{name:"Vengeance",bggId:205477,year:2018,complexity:2.86,players:"1-4",playTime:"120 min",bggRating:7.1},
  104006:{name:"Village",bggId:104006,year:2011,complexity:3.06,players:"2-4",playTime:"90 min",bggRating:7.5},
  280143:{name:"Volcanic Isle",bggId:280143,year:2019,complexity:1.67,players:"2-4",playTime:"60 min",bggRating:6.2},
  19:{name:"Wacky Wacky West",bggId:19,year:1991,complexity:1.82,players:"2-4",playTime:"45 min",bggRating:6.3},
  2718:{name:"War! Age of Imperialism",bggId:2718,year:2001,complexity:2.78,players:"2-6",playTime:"180 min",bggRating:5.6},
  22038:{name:"Warrior Knights",bggId:22038,year:2006,complexity:3.51,players:"2-6",playTime:"240 min",bggRating:6.9},
  396618:{name:"Waterfall Park",bggId:396618,year:2023,complexity:1.95,players:"3-5",playTime:"45 min",bggRating:7.0},
  262543:{name:"Wavelength",bggId:262543,year:2019,complexity:1.11,players:"2-12",playTime:"45 min",bggRating:7.2},
  232405:{name:"Western Legends",bggId:232405,year:2018,complexity:2.85,players:"2-6",playTime:"90 min",bggRating:7.6},
  267545:{name:"Western Legends: Ante Up",bggId:267545,year:2019,complexity:3.29,players:"2-6",playTime:"90 min",bggRating:8.1},
  295026:{name:"Western Legends: Blood Money",bggId:295026,year:2021,complexity:3.17,players:"2-6",playTime:"90 min",bggRating:8.2},
  244936:{name:"Western Legends: Fistful of Extras",bggId:244936,year:2018,complexity:2.75,players:"2-6",playTime:"90 min",bggRating:7.9},
  272253:{name:"Western Legends: Man in Black Promo Card",bggId:272253,year:2019,complexity:3.0,players:"2-6",playTime:"90 min",bggRating:7.7},
  270728:{name:"Western Legends: Wild Bunch of Extras",bggId:270728,year:2019,complexity:3.0,players:"2-6",playTime:"90 min",bggRating:8.1},
  198454:{name:"When I Dream",bggId:198454,year:2016,complexity:1.19,players:"4-10",playTime:"40 min",bggRating:6.9},
  335427:{name:"Wild: Serengeti",bggId:335427,year:2022,complexity:2.59,players:"1-4",playTime:"120 min",bggRating:7.0},
  244654:{name:"Wildlands",bggId:244654,year:2018,complexity:2.25,players:"2-4",playTime:"60 min",bggRating:7.3},
  1382:{name:"Winner's Circle",bggId:1382,year:2001,complexity:1.6,players:"2-6",playTime:"60 min",bggRating:7.0},
  318560:{name:"Witchstone",bggId:318560,year:2021,complexity:2.77,players:"2-4",playTime:"90 min",bggRating:7.5},
  353890:{name:"Witchstone: Full Moon",bggId:353890,year:2023,complexity:3.0,players:"2-4",playTime:"90 min",bggRating:7.0},
  355093:{name:"Woodcraft",bggId:355093,year:2022,complexity:3.82,players:"1-4",playTime:"120 min",bggRating:7.6},
  365258:{name:"World Wonders",bggId:365258,year:2023,complexity:2.26,players:"1-5",playTime:"70 min",bggRating:7.6},
  406746:{name:"World Wonders: Mundo Wonders Pack",bggId:406746,year:2024,complexity:2.3,players:"1-5",playTime:"70 min",bggRating:8.0},
  199329:{name:"Xia: Embers of a Forsaken Star",bggId:199329,year:2017,complexity:3.47,players:"1-5",playTime:"180 min",bggRating:8.7},
  82222:{name:"Xia: Legends of a Drift System",bggId:82222,year:2014,complexity:3.2,players:"3-5",playTime:"180 min",bggRating:7.9},
  281466:{name:"Yedo: Deluxe Master Set",bggId:281466,year:2020,complexity:3.21,players:"1-5",playTime:"90 min",bggRating:7.9},
  196340:{name:"Yokohama",bggId:196340,year:2016,complexity:3.27,players:"2-4",playTime:"90 min",bggRating:7.8},
  22345:{name:"Yspahan",bggId:22345,year:2006,complexity:2.37,players:"2-4",playTime:"60 min",bggRating:7.0},
  337568:{name:"Zombicide (2nd Edition): Daily Zombie Spawn Set",bggId:337568,year:2021,players:"1-6",playTime:"60 min",bggRating:8.4},
  294327:{name:"Zombicide (2nd Edition): Danny Trejo – Badass Survivor and Zombie Set",bggId:294327,year:2021,complexity:2.0,players:"1-6",playTime:"60 min",bggRating:8.2},
  336729:{name:"Zombicide (2nd Edition): Gabriel",bggId:336729,year:2021,complexity:3.0,players:"1-6",playTime:"60 min",bggRating:7.8},
  336634:{name:"Zombicide (2nd Edition): Presidential Box",bggId:336634,year:2021,complexity:2.5,players:"1-6",playTime:"60 min",bggRating:7.9},
  336637:{name:"Zombicide (2nd Edition): Reboot Box",bggId:336637,year:2021,complexity:3.0,players:"1-6",playTime:"60 min",bggRating:8.4},
  379907:{name:"Zombicide (2nd Edition): Rio Z Janeiro",bggId:379907,year:2023,complexity:2.0,players:"1-6",playTime:"120 min",bggRating:8.6},
  299071:{name:"Zombicide (2nd Edition): Urban Legends Abominations",bggId:299071,year:2022,complexity:2.0,players:"1-6",playTime:"60 min",bggRating:8.3},
  292122:{name:"Zombicide (2nd Edition): Washington Z.C.",bggId:292122,year:2021,complexity:2.75,players:"1-6",playTime:"60 min",bggRating:8.1},
  286751:{name:"Zombicide: 2nd Edition",bggId:286751,year:2021,complexity:2.38,players:"1-6",playTime:"60 min",bggRating:7.9},
  293546:{name:"Zombicide: 2nd Edition – Fort Hendrix",bggId:293546,year:2021,complexity:3.0,players:"1-6",playTime:"60 min",bggRating:8.3},
  180483:{name:"Zombicide: Black Plague – Zombie Bosses Abomination Pack",bggId:180483,year:2015,complexity:2.14,players:"1-6",playTime:"60 min",bggRating:8.1},
  209671:{name:"Zona: The Secret of Chernobyl",bggId:209671,year:2019,complexity:2.71,players:"1-4",playTime:"180 min",bggRating:7.3},
  94639:{name:"Μονοκράτορας",bggId:94639,year:1992,complexity:2.0,players:"2-4",playTime:"30 min",bggRating:6.3},
};

const LGEORGE_GAMES = {
  210625:{name:"Agricola: Expansion for 5 and 6 Players",bggId:210625,year:2016,complexity:3.5,players:"1-6",playTime:"120 min",bggRating:7.8},
  380681:{name:"Apex Legends: The Board Game",bggId:380681,year:2025,complexity:3.33,players:"2-6",playTime:"90 min",bggRating:7.9},
  359871:{name:"Arcs",bggId:359871,year:2024,complexity:3.44,players:"2-4",playTime:"120 min",bggRating:8.0},
  378574:{name:"Ascension Tactics: Inferno",bggId:378574,year:2025,complexity:2.25,players:"1-4",playTime:"90 min",bggRating:8.1},
  176544:{name:"Automania",bggId:176544,year:2015,complexity:2.76,players:"2-4",playTime:"90 min",bggRating:7.3},
  172308:{name:"Broom Service",bggId:172308,year:2015,complexity:2.39,players:"2-5",playTime:"75 min",bggRating:7.2},
  397598:{name:"Dune: Imperium – Uprising",bggId:397598,year:2023,complexity:3.52,players:"1-6",playTime:"120 min",bggRating:8.7},
  246900:{name:"Eclipse: Second Dawn for the Galaxy",bggId:246900,year:2020,complexity:3.67,players:"2-6",playTime:"200 min",bggRating:8.4},
  218509:{name:"Empires of the Void II",bggId:218509,year:2018,complexity:3.47,players:"2-5",playTime:"180 min",bggRating:7.4},
  245271:{name:"Forbidden Sky",bggId:245271,year:2018,complexity:2.52,players:"2-5",playTime:"60 min",bggRating:6.4},
  250458:{name:"Gùgōng",bggId:250458,year:2018,complexity:3.08,players:"1-5",playTime:"90 min",bggRating:7.4},
  271088:{name:"Ishtar: Gardens of Babylon",bggId:271088,year:2019,complexity:2.28,players:"2-4",playTime:"45 min",bggRating:7.0},
  411894:{name:"Kinfire Council",bggId:411894,year:2025,complexity:3.25,players:"2-6",playTime:"120 min",bggRating:7.8},
  363622:{name:"The Castles of Burgundy: Special Edition",bggId:363622,year:2023,complexity:2.85,players:"1-4",playTime:"120 min",bggRating:9.1},
  325293:{name:"The Pursuit of Happiness: Big Box",bggId:325293,year:2022,complexity:2.9,players:"1-5",playTime:"120 min",bggRating:7.8},
  42:{name:"Tigris & Euphrates",bggId:42,year:1997,complexity:3.48,players:"2-4",playTime:"120 min",bggRating:7.7},
  227935:{name:"Wonderland's War",bggId:227935,year:2022,complexity:3.04,players:"2-5",playTime:"125 min",bggRating:8.0},
};

const DIMITRIS_GAMES = {
  373167:{name:"20 Strong",bggId:373167,spineColor:"#7a3b2e",boxSize:"md",year:2023,complexity:2.36,players:"1",playTime:"40 min",bggRating:7.4},
  173346:{name:"7 Wonders Duel",bggId:173346,spineColor:"#5a2e7a",boxSize:"md",year:2015,complexity:2.23,players:"2",playTime:"30 min",bggRating:8.1},
  172818:{name:"Above and Below",bggId:172818,spineColor:"#2e3a6e",boxSize:"md",year:2015,complexity:2.52,players:"2-4",playTime:"90 min",bggRating:7.3},
  6707:{name:"Age of Mythology: The Boardgame",bggId:6707,spineColor:"#7a2e52",boxSize:"lg",year:2003,complexity:2.93,players:"2-4",playTime:"120 min",bggRating:6.1},
  6249:{name:"Alhambra",bggId:6249,spineColor:"#7a2e52",boxSize:"md",year:2003,complexity:2.1,players:"2-6",playTime:"60 min",bggRating:7.0},
  205637:{name:"Arkham Horror: The Card Game",bggId:205637,spineColor:"#3b7a4f",boxSize:"lg",year:2016,complexity:3.57,players:"1-2",playTime:"120 min",bggRating:8.1},
  359609:{name:"Arkham Horror: The Card Game (Revised Core Set)",bggId:359609,spineColor:"#3a6e3a",boxSize:"xl",year:2021,complexity:3.74,players:"1-4",playTime:"180 min",bggRating:8.6},
  340036:{name:"Arkham Horror: The Card Game – Edge of the Earth: Investigator Expansion",bggId:340036,spineColor:"#7a6b2e",boxSize:"xl",year:2021,complexity:3.77,players:"1-4",playTime:"180 min",bggRating:8.7},
  382510:{name:"Arkham Horror: The Card Game – The Circle Undone: Campaign Expansion",bggId:382510,spineColor:"#6e4a2e",boxSize:"xl",year:2023,complexity:3.83,players:"1-4",playTime:"180 min",bggRating:8.4},
  382509:{name:"Arkham Horror: The Card Game – The Circle Undone: Investigator Expansion",bggId:382509,spineColor:"#3a6e3a",boxSize:"xl",year:2023,complexity:3.75,players:"1-4",playTime:"180 min",bggRating:8.8},
  347148:{name:"Arkham Horror: The Card Game – The Dunwich Legacy: Investigator Expansion",bggId:347148,spineColor:"#2e7a73",boxSize:"xl",year:2022,complexity:3.67,players:"1-4",playTime:"120 min",bggRating:8.7},
  377055:{name:"Arkham Horror: The Card Game – The Forgotten Age: Campaign Expansion",bggId:377055,spineColor:"#7a2e52",boxSize:"xl",year:2023,complexity:3.91,players:"1-4",playTime:"180 min",bggRating:8.6},
  377056:{name:"Arkham Horror: The Card Game – The Forgotten Age: Investigator Expansion",bggId:377056,spineColor:"#6e4a2e",boxSize:"xl",year:2023,complexity:3.88,players:"1-4",playTime:"180 min",bggRating:8.7},
  358212:{name:"Arkham Horror: The Card Game – The Path to Carcosa: Campaign Expansion",bggId:358212,spineColor:"#3b7a4f",boxSize:"xl",year:2022,complexity:3.69,players:"1-4",playTime:"180 min",bggRating:8.9},
  225563:{name:"Arkham Horror: The Card Game – The Path to Carcosa: Expansion",bggId:225563,spineColor:"#6e4a2e",boxSize:"lg",year:2017,complexity:3.52,players:"1-2",playTime:"120 min",bggRating:8.7},
  358213:{name:"Arkham Horror: The Card Game – The Path to Carcosa: Investigator Expansion",bggId:358213,spineColor:"#444b6e",boxSize:"xl",year:2022,complexity:3.83,players:"1-4",bggRating:8.8},
  12005:{name:"Around the World in 80 Days",bggId:12005,spineColor:"#2e3a6e",boxSize:"md",year:2004,complexity:1.81,players:"2-6",playTime:"70 min",bggRating:6.5},
  25417:{name:"BattleLore",bggId:25417,spineColor:"#6e2e2e",boxSize:"lg",year:2006,complexity:2.77,players:"2",playTime:"60 min",bggRating:7.3},
  21882:{name:"Blue Moon City",bggId:21882,spineColor:"#5a2e7a",boxSize:"md",year:2006,complexity:2.29,players:"2-4",playTime:"50 min",bggRating:7.0},
  132:{name:"Caesar & Cleopatra",bggId:132,spineColor:"#7a2e52",boxSize:"md",year:1997,complexity:1.91,players:"2",playTime:"60 min",bggRating:6.4},
  283155:{name:"Calico",bggId:283155,spineColor:"#2e3a6e",boxSize:"md",year:2020,complexity:2.19,players:"1-4",playTime:"45 min",bggRating:7.5},
  345972:{name:"Cat in the Box: Deluxe Edition",bggId:345972,spineColor:"#2e7a73",boxSize:"md",year:2022,complexity:2.04,players:"2-5",playTime:"40 min",bggRating:7.4},
  13:{name:"Catan",bggId:13,spineColor:"#5a2e7a",boxSize:"md",year:1995,complexity:2.28,players:"3-4",playTime:"120 min",bggRating:7.1},
  2807:{name:"Catan: 5-6 Player Expansion",bggId:2807,spineColor:"#2e5a7a",boxSize:"md",year:1996,complexity:2.31,players:"5-6",playTime:"120 min",bggRating:7.0},
  926:{name:"Catan: Cities & Knights",bggId:926,spineColor:"#6e4a2e",boxSize:"lg",year:1998,complexity:2.9,players:"3-4",playTime:"150 min",bggRating:7.5},
  325:{name:"Catan: Seafarers",bggId:325,spineColor:"#7a2e52",boxSize:"md",year:1997,complexity:2.37,players:"3-4",playTime:"90 min",bggRating:7.2},
  201808:{name:"Clank!: A Deck-Building Adventure",bggId:201808,spineColor:"#7a6b2e",boxSize:"md",year:2016,complexity:2.23,players:"2-4",playTime:"60 min",bggRating:7.8},
  178900:{name:"Codenames",bggId:178900,spineColor:"#7a2e52",boxSize:"sm",year:2015,complexity:1.26,players:"2-8",playTime:"15 min",bggRating:7.5},
  237031:{name:"D100 Dungeon",bggId:237031,spineColor:"#2e7a73",boxSize:"lg",year:2018,complexity:2.79,players:"1",playTime:"90 min",bggRating:7.7},
  313306:{name:"Dawn on Titan",bggId:313306,spineColor:"#6e2e2e",boxSize:"md",year:2022,complexity:2.2,players:"1-4",playTime:"30 min",bggRating:6.7},
  17226:{name:"Descent: Journeys in the Dark",bggId:17226,spineColor:"#2e3a6e",boxSize:"lg",year:2005,complexity:3.35,players:"2-5",playTime:"240 min",bggRating:7.3},
  285192:{name:"Destinies",bggId:285192,spineColor:"#7a2e52",boxSize:"md",year:2021,complexity:1.92,players:"1-3",playTime:"150 min",bggRating:7.6},
  316554:{name:"Dune: Imperium",bggId:316554,spineColor:"#5a2e7a",boxSize:"lg",year:2020,complexity:3.08,players:"1-4",playTime:"120 min",bggRating:8.4},
  210232:{name:"Dungeon Degenerates: Hand of Doom",bggId:210232,spineColor:"#7a3b2e",boxSize:"xl",year:2017,complexity:3.66,players:"1-4",playTime:"360 min",bggRating:8.1},
  261393:{name:"Dungeon Universalis",bggId:261393,spineColor:"#2e3a6e",boxSize:"xl",year:2019,complexity:4.35,players:"1-6",playTime:"180 min",bggRating:8.7},
  6366:{name:"Dungeons & Dragons: The Fantasy Adventure Board Game",bggId:6366,spineColor:"#2e7a73",boxSize:"md",year:2003,complexity:2.18,players:"2-5",playTime:"60 min",bggRating:6.6},
  112686:{name:"Epic Spell Wars of the Battle Wizards: Duel at Mt. Skullzfyre",bggId:112686,spineColor:"#5a2e7a",boxSize:"sm",year:2012,complexity:1.57,players:"2-6",playTime:"30 min",bggRating:6.4},
  175914:{name:"Food Chain Magnate",bggId:175914,spineColor:"#6e4a2e",boxSize:"xl",year:2015,complexity:4.19,players:"2-5",playTime:"240 min",bggRating:8.0},
  65244:{name:"Forbidden Island",bggId:65244,spineColor:"#6e2e2e",boxSize:"md",year:2010,complexity:1.74,players:"2-4",playTime:"30 min",bggRating:6.8},
  393672:{name:"Gloomhaven: Buttons & Bugs",bggId:393672,spineColor:"#5a2e7a",boxSize:"lg",year:2024,complexity:3.32,players:"1",playTime:"20 min",bggRating:7.5},
  638:{name:"Hera and Zeus",bggId:638,spineColor:"#6e4a2e",boxSize:"md",year:2000,complexity:2.05,players:"2",playTime:"30 min",bggRating:6.5},
  355326:{name:"Heroes of Might and Magic III: The Board Game",bggId:355326,spineColor:"#444b6e",boxSize:"lg",year:2024,complexity:3.49,players:"1-3",playTime:"120 min",bggRating:7.8},
  448703:{name:"Heroes of the Shire: Fire & Ice",bggId:448703,spineColor:"#3b7a4f",boxSize:"md",year:2024,players:"1-6",playTime:"180 min"},
  214484:{name:"HEXplore It: The Valley of the Dead King",bggId:214484,spineColor:"#7a2e52",boxSize:"lg",year:2017,complexity:3.22,players:"1-6",playTime:"180 min",bggRating:7.7},
  401658:{name:"Hoplomachus: Pandora's Might",bggId:401658,spineColor:"#7a2e52",boxSize:"md",year:2025,players:"1-4",bggRating:8.4},
  338434:{name:"Hoplomachus: Remastered",bggId:338434,spineColor:"#5a2e7a",boxSize:"lg",year:2023,complexity:2.72,players:"1-4",playTime:"60 min",bggRating:8.0},
  401657:{name:"Hoplomachus: Remastered – Pandora's Wake",bggId:401657,spineColor:"#3b7a4f",boxSize:"md",year:2025,players:"1-4",playTime:"60 min",bggRating:8.3},
  313889:{name:"Hoplomachus: Victorum",bggId:313889,spineColor:"#2e5a7a",boxSize:"lg",year:2023,complexity:3.54,players:"1",playTime:"90 min",bggRating:8.3},
  401655:{name:"Hoplomachus: Victorum – Pandora's Ruin",bggId:401655,spineColor:"#7a2e52",boxSize:"md",year:2025,players:"1",playTime:"90 min",bggRating:8.6},
  216070:{name:"Hunt for the Ring",bggId:216070,spineColor:"#6e4a2e",boxSize:"lg",year:2017,complexity:3.18,players:"2-5",playTime:"180 min",bggRating:7.1},
  318184:{name:"Imperium: Classics",bggId:318184,spineColor:"#3a6e3a",boxSize:"xl",year:2021,complexity:3.62,players:"1-4",playTime:"160 min",bggRating:7.7},
  34010:{name:"Journey to the Center of the Earth",bggId:34010,spineColor:"#7a3b2e",boxSize:"md",year:2008,complexity:2.03,players:"2-4",playTime:"60 min",bggRating:6.3},
  34585:{name:"Keltis",bggId:34585,spineColor:"#2e5a7a",boxSize:"md",year:2008,complexity:1.64,players:"2-4",playTime:"30 min",bggRating:6.4},
  406174:{name:"Kinfire Delve: Callous' Lab",bggId:406174,spineColor:"#6e4a2e",boxSize:"md",year:2024,complexity:2.17,players:"1-2",playTime:"60 min",bggRating:8.0},
  404538:{name:"Kinfire Delve: Scorn's Stockade",bggId:404538,spineColor:"#3a6e3a",boxSize:"md",year:2024,complexity:2.09,players:"1-2",playTime:"60 min",bggRating:8.0},
  391795:{name:"Kinfire Delve: Vainglory's Grotto",bggId:391795,spineColor:"#3a6e3a",boxSize:"md",year:2023,complexity:2.14,players:"1-2",playTime:"60 min",bggRating:7.9},
  415776:{name:"Kingdom Legacy: Feudal Kingdom",bggId:415776,spineColor:"#2e3a6e",boxSize:"md",year:2024,complexity:2.26,players:"1",playTime:"480 min",bggRating:8.1},
  272533:{name:"Kingdom Rush: Rift in Time",bggId:272533,spineColor:"#5a2e7a",boxSize:"lg",year:2020,complexity:2.98,players:"1-4",playTime:"90 min",bggRating:7.3},
  287667:{name:"Kingdom Rush: Rift in Time – Spider Goddess Expansion",bggId:287667,spineColor:"#2e3a6e",boxSize:"lg",year:2020,complexity:3.0,players:"1-4",playTime:"90 min",bggRating:7.5},
  394193:{name:"Kosmogonia 2086: Kronos Epilogue – The Card Game!",bggId:394193,spineColor:"#2e7a73",boxSize:"md",year:2023,complexity:2.0,players:"1-4",playTime:"45 min",bggRating:7.8},
  358737:{name:"Leviathan Wilds",bggId:358737,spineColor:"#7a3b2e",boxSize:"md",year:2024,complexity:2.47,players:"1-4",playTime:"90 min",bggRating:7.9},
  96848:{name:"Mage Knight Board Game",bggId:96848,spineColor:"#6e2e2e",boxSize:"xl",year:2011,complexity:4.38,players:"1-4",playTime:"240 min",bggRating:8.1},
  209778:{name:"Magic Maze",bggId:209778,spineColor:"#2e5a7a",boxSize:"md",year:2017,complexity:1.75,players:"1-8",playTime:"15 min",bggRating:6.9},
  8147:{name:"Maka Bana",bggId:8147,spineColor:"#2e3a6e",boxSize:"md",year:2003,complexity:2.01,players:"3-6",playTime:"60 min",bggRating:6.7},
  311715:{name:"Mini Rogue",bggId:311715,spineColor:"#7a6b2e",boxSize:"md",year:2020,complexity:2.02,players:"1-2",playTime:"45 min",bggRating:7.3},
  363396:{name:"Mini Rogue: Coaster Expansion",bggId:363396,spineColor:"#2e3a6e",boxSize:"md",year:2021,bggRating:7.3},
  420358:{name:"Mini Rogue: Forgotten Guardians",bggId:420358,spineColor:"#444b6e",boxSize:"md",year:2026,players:"1-4",playTime:"60 min",bggRating:8.5},
  424603:{name:"Mini Rogue: Literature-Inspired Lore Cards",bggId:424603,spineColor:"#3b7a4f",boxSize:"md",year:2026,bggRating:8.5},
  418367:{name:"Mini Rogue: Mountain of Torments",bggId:418367,spineColor:"#3b7a4f",boxSize:"md",year:2026,players:"1-3",playTime:"60 min",bggRating:8.2},
  417020:{name:"Mini Rogue: The Council",bggId:417020,spineColor:"#7a6b2e",boxSize:"md",year:2026,complexity:2.0,players:"1-3",playTime:"60 min",bggRating:8.0},
  424602:{name:"Mini Rogue: Treasure Map",bggId:424602,spineColor:"#7a2e52",boxSize:"md",year:2026,bggRating:8.1},
  1927:{name:"Munchkin",bggId:1927,spineColor:"#2e3a6e",boxSize:"md",year:2001,complexity:1.82,players:"3-6",playTime:"120 min",bggRating:5.9},
  3943:{name:"Munchkin 2: Unnatural Axe",bggId:3943,spineColor:"#5a2e7a",boxSize:"md",year:2002,complexity:1.8,players:"3-6",playTime:"90 min",bggRating:6.4},
  6606:{name:"Munchkin 3: Clerical Errors",bggId:6606,spineColor:"#7a6b2e",boxSize:"md",year:2003,complexity:1.86,players:"3-6",playTime:"90 min",bggRating:6.5},
  308762:{name:"Mystic Vale: Essential Edition",bggId:308762,spineColor:"#3a6e3a",boxSize:"md",year:2020,complexity:2.38,players:"2-4",playTime:"60 min",bggRating:7.8},
  251661:{name:"Oathsworn: Into the Deepwood",bggId:251661,spineColor:"#3a6e3a",boxSize:"xl",year:2022,complexity:3.69,players:"1-4",playTime:"90 min",bggRating:8.8},
  295146:{name:"One Deck Dungeon: Abyssal Depths",bggId:295146,spineColor:"#2e7a73",boxSize:"md",year:2021,complexity:2.43,players:"1-2",playTime:"45 min",bggRating:7.1},
  224821:{name:"One Deck Dungeon: Forest of Shadows",bggId:224821,spineColor:"#3b7a4f",boxSize:"md",year:2017,complexity:2.33,players:"1-2",playTime:"45 min",bggRating:7.1},
  30549:{name:"Pandemic",bggId:30549,spineColor:"#444b6e",boxSize:"md",year:2008,complexity:2.39,players:"2-4",playTime:"45 min",bggRating:7.5},
  338468:{name:"Paperback Adventures",bggId:338468,spineColor:"#3a6e3a",boxSize:"lg",year:2022,complexity:2.79,players:"1-2",playTime:"150 min",bggRating:7.6},
  263938:{name:"Paupers' Ladder",bggId:263938,spineColor:"#6e2e2e",boxSize:"md",year:2019,complexity:2.2,players:"1-4",playTime:"90 min",bggRating:7.8},
  3267:{name:"Pizarro & Co.",bggId:3267,spineColor:"#3a6e3a",boxSize:"md",year:2002,complexity:2.44,players:"3-6",playTime:"45 min",bggRating:6.5},
  156009:{name:"Port Royal",bggId:156009,spineColor:"#2e7a73",boxSize:"md",year:2014,complexity:1.63,players:"2-5",playTime:"50 min",bggRating:7.1},
  28143:{name:"Race for the Galaxy",bggId:28143,spineColor:"#7a6b2e",boxSize:"lg",year:2007,complexity:2.99,players:"2-4",playTime:"60 min",bggRating:7.7},
  251678:{name:"Railroad Ink: Blazing Red Edition",bggId:251678,spineColor:"#3b7a4f",boxSize:"sm",year:2018,complexity:1.47,players:"1-6",playTime:"30 min",bggRating:7.1},
  417426:{name:"Rogue Dungeon: 2nd Edition",bggId:417426,spineColor:"#3a6e3a",boxSize:"md",year:2024,complexity:2.12,players:"1-3",playTime:"60 min",bggRating:8.1},
  127024:{name:"Room 25",bggId:127024,spineColor:"#2e7a73",boxSize:"md",year:2013,complexity:1.93,players:"1-6",playTime:"30 min",bggRating:6.7},
  369751:{name:"Sagrada Artisans",bggId:369751,spineColor:"#2e7a73",boxSize:"md",year:2023,complexity:2.4,players:"2-4",playTime:"60 min",bggRating:7.7},
  228855:{name:"Set a Watch",bggId:228855,spineColor:"#7a6b2e",boxSize:"md",year:2019,complexity:2.42,players:"1-4",playTime:"80 min",bggRating:7.2},
  246297:{name:"Shadows: Amsterdam",bggId:246297,spineColor:"#3a6e3a",boxSize:"sm",year:2018,complexity:1.29,players:"2-8",playTime:"20 min",bggRating:6.6},
  204305:{name:"Sherlock Holmes Consulting Detective: Jack the Ripper & West End Adventures",bggId:204305,spineColor:"#6e2e2e",boxSize:"md",year:2016,complexity:2.21,players:"1-8",playTime:"90 min",bggRating:7.5},
  303553:{name:"Skulls of Sedlec",bggId:303553,spineColor:"#2e5a7a",boxSize:"sm",year:2020,complexity:1.25,players:"2-3",playTime:"20 min",bggRating:7.4},
  373106:{name:"Sky Team",bggId:373106,spineColor:"#3a6e3a",boxSize:"md",year:2023,complexity:2.04,players:"2",playTime:"20 min",bggRating:8.1},
  344789:{name:"Skytear Horde",bggId:344789,spineColor:"#7a6b2e",boxSize:"lg",year:2023,complexity:2.69,players:"1-3",playTime:"30 min",bggRating:7.4},
  385325:{name:"Skytear Horde: Monoliths",bggId:385325,spineColor:"#3a6e3a",boxSize:"lg",year:2024,complexity:2.91,players:"1-3",playTime:"40 min",bggRating:8.1},
  40692:{name:"Small World",bggId:40692,spineColor:"#2e7a73",boxSize:"md",year:2009,complexity:2.35,players:"2-5",playTime:"80 min",bggRating:7.2},
  122522:{name:"Smash Up",bggId:122522,spineColor:"#7a6b2e",boxSize:"md",year:2012,complexity:2.06,players:"2-4",playTime:"45 min",bggRating:6.7},
  372559:{name:"Spots",bggId:372559,spineColor:"#7a6b2e",boxSize:"sm",year:2022,complexity:1.27,players:"1-4",playTime:"30 min",bggRating:7.1},
  34635:{name:"Stone Age",bggId:34635,spineColor:"#3b7a4f",boxSize:"md",year:2008,complexity:2.46,players:"2-4",playTime:"90 min",bggRating:7.5},
  133473:{name:"Sushi Go!",bggId:133473,spineColor:"#444b6e",boxSize:"sm",year:2013,complexity:1.16,players:"2-5",playTime:"15 min",bggRating:7.0},
  120677:{name:"Terra Mystica",bggId:120677,spineColor:"#7a2e52",boxSize:"xl",year:2012,complexity:3.97,players:"2-5",playTime:"150 min",bggRating:8.0},
  358741:{name:"Terraforming Mars: Ares Expedition – Discovery · Foundations · Crisis",bggId:358741,spineColor:"#7a2e52",boxSize:"lg",year:2023,complexity:2.83,players:"1-6",playTime:"60 min",bggRating:8.0},
  244522:{name:"That's Pretty Clever!",bggId:244522,spineColor:"#6e2e2e",boxSize:"md",year:2018,complexity:1.85,players:"1-4",playTime:"30 min",bggRating:7.6},
  286063:{name:"The 7th Citadel",bggId:286063,spineColor:"#5a2e7a",boxSize:"lg",year:2024,complexity:2.95,players:"1-4",playTime:"1000 min",bggRating:8.3},
  84876:{name:"The Castles of Burgundy",bggId:84876,spineColor:"#6e4a2e",boxSize:"lg",year:2011,complexity:2.97,players:"2-4",playTime:"90 min",bggRating:8.2},
  284083:{name:"The Crew: The Quest for Planet Nine",bggId:284083,spineColor:"#3b7a4f",boxSize:"md",year:2019,complexity:1.97,players:"2-5",playTime:"20 min",bggRating:7.8},
  281259:{name:"The Isle of Cats",bggId:281259,spineColor:"#444b6e",boxSize:"md",year:2019,complexity:2.36,players:"1-4",playTime:"90 min",bggRating:7.6},
  421006:{name:"The Lord of the Rings: Duel for Middle-earth",bggId:421006,spineColor:"#7a2e52",boxSize:"md",year:2024,complexity:2.07,players:"2",playTime:"30 min",bggRating:8.4},
  349955:{name:"The Quacks of Quedlinburg: MegaBox",bggId:349955,spineColor:"#6e2e2e",boxSize:"md",year:2021,complexity:2.05,players:"2-5",playTime:"60 min",bggRating:8.2},
  1144:{name:"The Warlock of Firetop Mountain",bggId:1144,spineColor:"#7a2e52",boxSize:"md",year:1986,complexity:1.88,players:"2-6",playTime:"120 min",bggRating:6.0},
  503:{name:"Through the Desert",bggId:503,spineColor:"#2e3a6e",boxSize:"md",year:1998,complexity:2.16,players:"2-5",playTime:"45 min",bggRating:7.2},
  390092:{name:"Ticket to Ride Legacy: Legends of the West",bggId:390092,spineColor:"#6e4a2e",boxSize:"md",year:2023,complexity:2.57,players:"2-5",playTime:"90 min",bggRating:8.6},
  14996:{name:"Ticket to Ride: Europe",bggId:14996,spineColor:"#7a6b2e",boxSize:"md",year:2005,complexity:1.92,players:"2-5",playTime:"60 min",bggRating:7.5},
  347900:{name:"Tin Helm",bggId:347900,spineColor:"#2e5a7a",boxSize:"sm",year:2021,complexity:1.39,players:"1",playTime:"30 min",bggRating:7.5},
  412068:{name:"Tin Realm",bggId:412068,spineColor:"#6e2e2e",boxSize:"md",year:2024,complexity:1.67,players:"1",playTime:"30 min",bggRating:8.1},
  238656:{name:"Tiny Epic Defenders (Second Edition)",bggId:238656,spineColor:"#7a2e52",boxSize:"md",year:2018,complexity:2.05,players:"1-4",playTime:"60 min",bggRating:6.9},
  331787:{name:"Tiny Epic Dungeons",bggId:331787,spineColor:"#3a6e3a",boxSize:"lg",year:2021,complexity:3.11,players:"1-4",playTime:"60 min",bggRating:7.4},
  201921:{name:"Tiny Epic Quest",bggId:201921,spineColor:"#7a6b2e",boxSize:"lg",year:2017,complexity:2.69,players:"1-4",playTime:"60 min",bggRating:6.9},
  192135:{name:"Too Many Bones",bggId:192135,spineColor:"#2e5a7a",boxSize:"xl",year:2017,complexity:3.87,players:"1-4",playTime:"120 min",bggRating:8.3},
  242639:{name:"Treasure Island",bggId:242639,spineColor:"#6e4a2e",boxSize:"md",year:2018,complexity:2.2,players:"2-5",playTime:"45 min",bggRating:7.2},
  361545:{name:"Twilight Inscription",bggId:361545,spineColor:"#3a6e3a",boxSize:"lg",year:2022,complexity:3.22,players:"1-8",playTime:"120 min",bggRating:7.4},
  3230:{name:"Tyros",bggId:3230,spineColor:"#2e3a6e",boxSize:"md",year:2002,complexity:2.46,players:"3-4",playTime:"90 min",bggRating:6.4},
  75223:{name:"Utopia Engine",bggId:75223,spineColor:"#7a3b2e",boxSize:"md",year:2010,complexity:2.03,players:"1",playTime:"60 min",bggRating:6.9},
  420033:{name:"Vantage",bggId:420033,spineColor:"#5a2e7a",boxSize:"md",year:2025,complexity:2.34,players:"1-6",playTime:"180 min",bggRating:8.2},
  350736:{name:"Voyages",bggId:350736,spineColor:"#7a6b2e",boxSize:"md",year:2021,complexity:1.78,players:"1-100",playTime:"30 min",bggRating:7.4},
  7479:{name:"WarCraft: The Board Game",bggId:7479,spineColor:"#5a2e7a",boxSize:"lg",year:2003,complexity:2.76,players:"2-4",playTime:"120 min",bggRating:6.1},
  296237:{name:"Warp's Edge",bggId:296237,spineColor:"#7a2e52",boxSize:"md",year:2020,complexity:2.39,players:"1",playTime:"45 min",bggRating:7.6},
  357008:{name:"Warp's Edge: Anomaly",bggId:357008,spineColor:"#6e2e2e",boxSize:"md",year:2022,complexity:2.56,players:"1",playTime:"45 min",bggRating:7.8},
  262543:{name:"Wavelength",bggId:262543,spineColor:"#3b7a4f",boxSize:"sm",year:2019,complexity:1.11,players:"2-12",playTime:"45 min",bggRating:7.2},
  195043:{name:"Welcome Back to the Dungeon",bggId:195043,spineColor:"#6e2e2e",boxSize:"sm",year:2016,complexity:1.31,players:"2-4",playTime:"30 min",bggRating:6.7},
  150312:{name:"Welcome to the Dungeon",bggId:150312,spineColor:"#444b6e",boxSize:"sm",year:2013,complexity:1.24,players:"2-4",playTime:"30 min",bggRating:6.5},
};

// =============================================
// GAME DATA - Enriched with BoardGameGeek data
// =============================================

const GAMES = [
  {id:"mu_asgard",name:"Marvel United: Tales of Asgard"
   ,row:1,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-4",playTime:"30-45 min"
   ,complexity:2.19,bggId:302668
   ,spineColor:"#195436",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang"
   ,year:2021
   ,bggRating:7.9
   ,mechanics:["Cooperative Game"]
   ,description:"Asgard is under threat. Players take turns playing hero cards from their unique decks, each card chaining with the previous player's actions to move, fight, or rescue. Together you must clear threats from locations and foil Loki's master plan before time runs out. A cooperative Marvel experience that rewards careful card sequencing."},

  {id:"mu_panther",name:"Marvel United: Rise of the Black Panther"
   ,row:1,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-4",playTime:"30-45 min"
   ,complexity:2.14,bggId:302669
   ,spineColor:"#6a1f1f",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang"
   ,year:2021
   ,bggRating:7.9
   ,mechanics:["Cooperative Game"]
   ,description:"Killmonger is making his move on Wakanda. Players cooperate by playing hero cards whose actions build on the previous turn's card, creating escalating combos of movement, attacks, and rescues across the board. Managing which cards to play and when is the heart of the challenge. Best for fans of light cooperative games with strong theme."},

  {id:"mu_spider",name:"Marvel United: Enter the Spider-Verse"
   ,row:1,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-4",playTime:"30-45 min"
   ,complexity:2.2,bggId:303600
   ,spineColor:"#65597f",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang"
   ,year:2021
   ,bggRating:7.9
   ,mechanics:["Cooperative Game"]
   ,description:"An expansion adding Spider-People from across the multiverse and Green Goblin as a new villain. Each hero brings a unique deck with different action distributions, changing how combos develop during play. Slots into any Marvel United base game to expand the roster and add variety to the cooperative puzzle."},

  {id:"mu_deadpool",name:"Marvel United: Deadpool"
   ,row:1,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-5",playTime:"40 min"
   ,complexity:1.8,bggId:339131
   ,spineColor:"#3f2c2c",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang, Francesco Rugerfred Sedda"
   ,year:2022
   ,bggRating:7.7
   ,mechanics:["Cooperative Game", "Hand Management", "Modular Board", "Solo / Solitaire Game", "Variable Player Powers"],description:"Three versions of Deadpool — each playable as either hero or villain — plus Bob, Agent of Hydra. Deadpool can also appear as a roaming Challenge card that disrupts any game. His decks break the usual rules with fourth-wall humor and unpredictable effects. For groups who want chaos injected into their Marvel United sessions."},

  {id:"mu_xmen_gold",name:"Marvel United: X-Men - Gold Team"
   ,row:1,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-6",playTime:"40 min"
   ,complexity:1.8,bggId:339128
   ,spineColor:"#132b3f",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang, Francesco Rugerfred Sedda"
   ,year:2022
   ,bggRating:8.3
   ,mechanics:["Cooperative Game", "Hand Management", "Modular Board", "Solo / Solitaire Game", "Team-Based Game", "Variable Player Powers"],description:"The Gold Team expansion adds classic X-Men heroes, each with their own deck, and introduces a Team vs Team mode where players split into rival squads before facing the Hellfire Club villain. The team mechanic adds a competitive layer to the cooperative card play. Ideal if you want more player interaction and X-Men flavor."},

  {id:"mu_gotg",name:"Marvel United: Guardians of the Galaxy Remix"
   ,row:1,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-4",playTime:"30-45 min"
   ,complexity:2.07,bggId:302670
   ,spineColor:"#1b1b3f",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang"
   ,year:2021
   ,bggRating:8.0
   ,mechanics:["Cooperative Game"],description:"The Guardians face Ronan the Accuser in this expansion. Each Guardian's deck has a different mix of actions — attacks, movement, heroics — that combo with teammates' plays. Ronan's master plan introduces new threat patterns to manage. Adds cosmic-scale heroes and a formidable villain to any Marvel United collection."},

  {id:"mu_xmen_blue",name:"Marvel United: X-Men - Blue Team"
   ,row:1,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-6",playTime:"40 min"
   ,complexity:2.0,bggId:339129
   ,spineColor:"#142643",boxSize:"lg"
   ,designer:"Andrea Chiarvesio, Eric M. Lang, Francesco Rugerfred Sedda"
   ,year:2022
   ,bggRating:8.3
   ,mechanics:["Cooperative Game", "Hand Management", "Modular Board", "Solo / Solitaire Game", "Team-Based Game", "Variable Player Powers"],description:"The Blue Team X-Men bring unique hero decks and a villain extracting mutant DNA. Also includes the Team vs Team mode rules and components. Players alternate between cooperating against the villain and competing with the rival team. Good for groups who enjoy both cooperative and semi-competitive dynamics."},

  {id:"underwater_cities",name:"Underwater Cities"
   ,row:1,col:2,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"1-4",playTime:"80-150 min"
   ,complexity:3.59,bggId:247763
   ,spineColor:"#2c3f2c",boxSize:"lg"
   ,designer:"Vladimír Suchý"
   ,year:2018
   ,bggRating:8.0
   ,mechanics:["End Game Bonuses", "Hand Management", "Income", "Network and Route Building", "Solo / Solitaire Game", "Turn Order: Claim Action"]
   ,description:"With the surface overpopulated, players build civilization beneath the ocean. Each turn you place a card into one of fifteen action slots — matching the card color to the slot color lets you take both the slot action and the card effect. You build domed cities, connect them with tunnels, and manage three types of resources across multiple rounds. Appeals to players who enjoy tight action selection and long-term engine building."},

  {id:"horrified_am",name:"Horrified: American Monsters"
   ,row:1,col:2,categories:["Co-op", "Family", "Thematic"]
   ,players:"1-5",playTime:"60 min"
   ,complexity:2.25,bggId:343562
   ,spineColor:"#3f243f",boxSize:"md"
   ,designer:"Michael Mulvihill"
   ,year:2021
   ,bggRating:7.5
   ,mechanics:["Action Points", "Cooperative Game", "Pick-up and Deliver", "Point to Point Movement", "Solo / Solitaire Game"]
   ,description:"Creatures of American folklore — Bigfoot, Mothman, the Chupacabra, the Jersey Devil, the Banshee of the Badlands, and the Ozark Howler — terrorize the countryside. Players cooperate using actions to move, collect items, and work toward each monster's unique defeat condition. Like the original Horrified but with American cryptids and new mechanics for each creature. Scales from family-friendly to challenging depending on how many monsters you include."},

  {id:"dominant_species",name:"Dominant Species"
   ,row:1,col:2,categories:["Strategy", "Area Control", "Worker Placement"]
   ,players:"2-6",playTime:"120-240 min"
   ,complexity:4.04,bggId:62219
   ,spineColor:"#3f3f24",boxSize:"lg"
   ,designer:"Chad Jensen"
   ,year:2010
   ,bggRating:7.8
   ,mechanics:["Action Drafting", "Action Queue", "Area Majority / Influence", "End Game Bonuses", "Grid Movement", "Hexagon Grid"]
   ,description:"Set during an approaching ice age, each player controls an animal class — mammals, reptiles, birds, amphibians, arachnids, or insects. Through worker placement on a shared action display, you adapt your species, spread across terrain tiles, and compete for dominance in each region. Scoring comes from area majority, and a powerful Domination card lets the leader of any region trigger bonus scoring. A long, deeply interactive game for players who enjoy confrontation and long-term planning."},

  {id:"brass_birmingham",name:"Brass: Birmingham"
   ,row:1,col:2,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"2-4",playTime:"60-120 min"
   ,complexity:3.86,bggId:224517
   ,spineColor:"#3f2c2c",boxSize:"lg"
   ,designer:"Gavan Brown, Matt Tolman, Martin Wallace"
   ,year:2018
   ,bggRating:8.6
   ,mechanics:["Chaining", "End Game Bonuses", "Hand Management", "Income", "Loans", "Market"]
   ,description:"Set during the Industrial Revolution, players build industries and trade networks across Birmingham. The game spans two eras — canal and rail — with a scoring phase between them. You play cards to build cotton mills, potteries, breweries, and ironworks, then connect them to markets. Money is tight, loans are available but costly, and the shared market for iron and coal fluctuates. Rewards players who can read the board state and adapt long-term plans over both eras."},

  {id:"auztralia",name:"AuZtralia"
   ,row:1,col:3,categories:["Strategy", "Thematic", "Adventure"]
   ,players:"1-4",playTime:"30-120 min"
   ,complexity:2.89,bggId:231581
   ,spineColor:"#3f2c2c",boxSize:"md"
   ,designer:"Martin Wallace"
   ,year:2018
   ,bggRating:7.3
   ,mechanics:["Action Retrieval", "Cooperative Game", "Hexagon Grid", "Network and Route Building", "Semi-Cooperative Game", "Solo / Solitaire Game"]
   ,description:"An alternate-history 1930s where Lovecraftian Old Ones lurk in the Australian outback. Players spend time (the core resource) to build railways, farms, and military units. Midway through the game, the Old Ones awaken and begin attacking settlements. A shared time track determines turn order, so efficient planning matters. Blends network building with light wargaming — suits players who enjoy Martin Wallace's style of strategic tension."},

  {id:"that_time_you_killed_me",name:"That Time You Killed Me"
   ,row:1,col:3,categories:["Strategy", "Abstract"]
   ,players:"2",playTime:"15-30 min"
   ,complexity:2.33,bggId:344258
   ,spineColor:"#7f6859",boxSize:"md"
   ,designer:"Peter C. Hayward"
   ,year:2021
   ,bggRating:7.3
   ,mechanics:["Grid Movement", "King of the Hill", "Multiple Maps", "Scenario / Mission / Campaign Game", "Slide / Push", "Square Grid"]
   ,description:"Two time travelers try to eliminate each other across three boards representing past, present, and future. On your turn, you move one piece on each board, pushing opponents off the grid to remove them from that timeline. Killing your rival in all three eras wins the game. A campaign of escalating scenarios introduces new rules and twists each session. Best for two players who enjoy abstract puzzles with narrative."},

  {id:"margraves_of_valeria",name:"Margraves of Valeria"
   ,row:1,col:3,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"2-5",playTime:"60-120 min"
   ,complexity:2.7,bggId:275974
   ,spineColor:"#26697f",boxSize:"md"
   ,designer:"Isaias Vallejo"
   ,year:2020
   ,bggRating:7.4
   ,mechanics:["Area Movement", "Deck, Bag, and Pool Building", "Worker Placement"]
   ,description:"Set in the fantasy world of Valeria, players are military commanders building influence by deploying knights to slay monsters and activate location abilities. The core mechanic is hand-building — you start with a basic deck of command cards and add more powerful ones through play, then place workers using those cards. Earn favor with four guilds to score. Approachable for mid-weight gamers who enjoy deck growth paired with worker placement."},

  {id:"this_war_of_mine",name:"This War of Mine: The Board Game"
   ,row:1,col:3,categories:["Co-op", "Thematic", "Campaign"]
   ,players:"1-6",playTime:"45-120 min"
   ,complexity:3.33,bggId:188920
   ,spineColor:"#2c2c3f",boxSize:"lg"
   ,designer:"Michał Oracz, Jakub Wiśniewski"
   ,year:2017
   ,bggRating:7.8
   ,mechanics:["Action Points", "Cooperative Game", "Dice Rolling", "Events", "Grid Movement", "Narrative Choice / Paragraph"]
   ,description:"Based on the video game, players control civilians trapped in a besieged city. During the day, you manage your shelter — cooking, crafting, resting. At night, you send scavengers into dangerous locations, making moral choices that affect the group's morale and survival. A narrative book drives events, and characters can die, leave, or break down. For players who want a deeply emotional, story-driven experience where every decision has weight."},

  {id:"kelp",name:"Kelp: Shark vs Octopus"
   ,row:1,col:4,categories:["Strategy", "Thematic"]
   ,players:"2",playTime:"40-60 min"
   ,complexity:2.4,bggId:374595
   ,spineColor:"#154848",boxSize:"md"
   ,designer:"Carl Robinson"
   ,year:2024
   ,bggRating:7.5
   ,mechanics:["Area Movement", "Deck, Bag, and Pool Building", "Dice Rolling", "Hidden Movement", "Variable Player Powers"]
   ,description:"An asymmetric two-player game set in a South African kelp forest. The Octopus hides among kelp tiles and builds a dice bag to generate escape resources. The Shark builds a deck to hunt, using movement and detection cards. Each side has a completely different win condition and play style. The Octopus needs to survive long enough; the Shark needs to find and catch it. Ideal for couples or duos who enjoy asymmetric cat-and-mouse games."},

  {id:"raiders_of_scythia",name:"Raiders of Scythia"
   ,row:1,col:4,categories:["Strategy", "Worker Placement"]
   ,players:"1-4",playTime:"60-80 min"
   ,complexity:2.77,bggId:301880
   ,spineColor:"#543c2d",boxSize:"md"
   ,designer:"Shem Phillips"
   ,year:2020
   ,bggRating:7.7
   ,mechanics:["Contracts", "Dice Rolling", "Hand Management", "Open Drafting", "Solo / Solitaire Game", "Variable Player Powers"]
   ,description:"Players lead Scythian warriors on raids against ancient empires. The central mechanic is place-one-take-one worker placement — you place a worker to take an action, then pick up a different worker from the board, giving you options for next turn. Assemble a crew of fighters with different strengths, gather provisions, and raid locations for points and plunder. Streamlined, satisfying, and plays well at all player counts including solo."},

  {id:"eternal_decks",name:"Eternal Decks"
   ,row:1,col:4,categories:["Card Game", "Strategy"]
   ,players:"1-4",playTime:"30-40 min"
   ,complexity:2.81,bggId:424981
   ,spineColor:"#62597f",boxSize:"md"
   ,designer:"Hiroken"
   ,year:2025
   ,bggRating:8.3
   ,mechanics:["Communication Limits", "Cooperative Game", "Deck, Bag, and Pool Building", "Hand Management", "Once-Per-Game Abilities", "Ordering"],description:"A cooperative game with strict communication limits. Players recruit Eternals — characters with unique eight-card decks — and must play cards to fulfill stage objectives before anyone runs out of moves. You cannot discuss your hand openly, so reading the table and making educated guesses is essential. Cards can be played to the field, to a shared river, or for special abilities. For groups who enjoy the tension of limited-communication co-ops like The Crew or Hanabi."},

  {id:"parks",name:"PARKS"
   ,row:1,col:4,categories:["Family", "Strategy", "Thematic"]
   ,players:"1-5",playTime:"30-60 min"
   ,complexity:2.12,bggId:266524
   ,spineColor:"#3f3927",boxSize:"md"
   ,designer:"Henry Audubon"
   ,year:2019
   ,bggRating:7.6
   ,mechanics:["Contracts", "End Game Bonuses", "Events", "Modular Board", "Solo / Solitaire Game", "Track Movement"]
   ,description:"Players hike through US National Parks across four seasons. Two hikers per player move along a trail of action spaces, collecting resource tokens representing mountains, forests, water, and wildlife. These tokens are traded to visit Park cards worth points. Gear and canteen cards provide bonuses. The trail changes each season, keeping routes fresh. A gentle, scenic game that appeals to families and nature lovers, with more strategic depth than it first appears."},

  {id:"chronicles_1900",name:"Chronicles of Crime: 1900"
   ,row:1,col:4,categories:["Co-op", "Deduction", "Thematic"]
   ,players:"1-4",playTime:"60-90 min"
   ,complexity:1.91,bggId:302098
   ,spineColor:"#3f1313",boxSize:"md"
   ,designer:"David Cicurel, Wojciech Grajkowski"
   ,year:2021
   ,bggRating:7.9
   ,mechanics:["Cooperative Game", "Scenario / Mission / Campaign Game", "Storytelling", "Variable Player Powers"]
   ,description:"A cooperative detective game set during the Paris 1900 World's Fair. Players use a companion app to scan QR codes on physical character and location cards, unlocking clues, dialogue, and evidence. You travel across Paris, interrogate suspects, and piece together the crime before time runs out. The app tracks your performance and scores your investigation. For players who enjoy narrative-driven puzzle-solving and the atmosphere of Belle Epoque Paris."},

  {id:"rove",name:"Rove"
   ,row:1,col:5,categories:["Co-op", "Thematic", "Campaign"]
   ,players:"1-4",playTime:"60-120 min"
   ,complexity:3.5,bggId:365670
   ,spineColor:"#3d5e7f",boxSize:"md"
   ,designer:"Motti Eisenbach, Tyvan Grossi"
   ,year:2025
   ,bggRating:7.9
   ,mechanics:["Cooperative Game", "Grid Movement", "Hand Management", "Variable Player Powers", "Scenario / Mission / Campaign Game"]
   ,description:"An immersive cooperative campaign board game set on Chorus, a world on the brink of being consumed by nature. Players take on roles as Rovers — adventurers exploring a wild planet filled with dangerous flora and fauna. Features a branching story with consequences, turn-based tactical combat inspired by classic strategy RPGs, and a 25-encounter campaign with deep progression and leveling choices. Double-faced Rally and Rave cards flip when played, creating unique tactical decisions. For groups who enjoy Gloomhaven-style cooperative adventure with narrative depth."},

  {id:"rove_xulc",name:"Rove: Xulc Expansion"
   ,row:1,col:5,categories:["Co-op", "Thematic", "Campaign"]
   ,players:"1-4",playTime:"45-90 min"
   ,complexity:3.3,bggId:439995
   ,spineColor:"#4e546f",boxSize:"md"
   ,designer:"Motti Eisenbach, Tyvan Grossi"
   ,year:2025
   ,bggRating:8.3
   ,mechanics:["Cooperative Game", "Grid Movement", "Hand Management", "Variable Player Powers", "Scenario / Mission / Campaign Game"]
   ,description:"The story continues as the Rovers face a new threat that has emerged on Chorus. This expansion adds 10 new scenarios, new playable Xulc classes with unique parasitic-ally mechanics, additional tracking components, and Xulc Dice. Extends the campaign with fresh encounters and deeper strategic options. Requires the Rove base game."},

  {id:"detective_coa",name:"Detective: City of Angels"
   ,row:1,col:6,categories:["Thematic", "Deduction"]
   ,players:"1-5",playTime:"30-150 min"
   ,complexity:2.36,bggId:218074
   ,spineColor:"#2c2c3f",boxSize:"lg"
   ,designer:"Evan Derrick"
   ,year:2019
   ,bggRating:7.9
   ,mechanics:["Action Points", "Area Movement", "Cooperative Game", "Team-Based Game", "Traitor Game"]
   ,description:"Set in 1940s noir Los Angeles, one to four players work as LAPD detectives investigating murders, while one player acts as the Chisel — a saboteur who controls the suspects and can manipulate testimony. Detectives move between locations, interview witnesses, and gather evidence. The Chisel can bluff and misdirect. Cases play out through a narrative book with branching paths. Best for groups who enjoy hidden roles and deductive reasoning."},

  {id:"aeons_end_legacy",name:"Aeon's End: Legacy"
   ,row:1,col:6,categories:["Co-op", "Deck Building", "Campaign"]
   ,players:"1-4",playTime:"45-90 min"
   ,complexity:2.87,bggId:241451
   ,spineColor:"#24323f",boxSize:"lg"
   ,designer:"Jenny Iglesias, Nick Little (I), Kevin Riley"
   ,year:2019
   ,bggRating:8.0
   ,mechanics:["Cooperative Game", "Deck, Bag, and Pool Building", "Hand Management", "Legacy Game", "Open Drafting", "Scenario / Mission / Campaign Game"]
   ,description:"A legacy campaign deck-builder where players train as breach mages defending humanity's last city, Gravehold. Each session you fight a Nemesis using a market of gems, relics, and spells — but you never shuffle your deck, so the order you gain and play cards matters. Between sessions, permanent upgrades and narrative choices alter your decks and the story. For players who want a deck-builder with lasting consequences and cooperative tension."},

  {id:"crimson_scales",name:"The Crimson Scales"
   ,row:1,col:6,categories:["Strategy", "Co-op", "Campaign", "Thematic"]
   ,players:"1-4",playTime:"30-120 min"
   ,complexity:3.9,bggId:365186
   ,spineColor:"#3f321d",boxSize:"lg"
   ,designer:"Motti Eisenbach"
   ,year:2021
   ,bggRating:9.2
   ,mechanics:["Action Retrieval", "Campaign / Battle Card Driven", "Communication Limits", "Deck, Bag, and Pool Building", "Grid Movement", "Hand Management"]
   ,description:"A fan-made expansion for Gloomhaven containing 66 new scenarios, up to 14 new character classes, 100 items, and new monsters. Gameplay follows the same tactical combat system — hand management of ability cards on a hex grid with limited communication between players. Requires the Gloomhaven base game. For groups who have finished the original campaign and want substantially more content in the same system."},

  {id:"turing_machine",name:"Turing Machine"
   ,row:2,col:1,categories:["Puzzle", "Deduction"]
   ,players:"1-4",playTime:"20 min"
   ,complexity:2.55,bggId:356123
   ,spineColor:"#2f7b4b",boxSize:"md"
   ,designer:"Fabien Gridel, Yoann Levet"
   ,year:2022
   ,bggRating:7.6
   ,mechanics:["Deduction", "Paper-and-Pencil", "Solo / Solitaire Game"]
   ,description:"Players race to crack a secret three-digit code by querying an analog computer made of punch cards and plastic overlays — no app or electricity required. Each round you propose a code and check it against verification cards that give partial information. Fewer questions means a better score. The deduction is pure logic, not guessing. For players who enjoy Mastermind-style reasoning elevated to a genuinely clever physical system."},

  {id:"great_western_trail",name:"Great Western Trail (Second Edition)"
   ,row:2,col:1,categories:["Strategy", "Euro", "Deck Building"]
   ,players:"1-4",playTime:"75-150 min"
   ,complexity:3.71,bggId:341169
   ,spineColor:"#17173f",boxSize:"lg"
   ,designer:"Alexander Pfister"
   ,year:2021
   ,bggRating:8.3
   ,mechanics:["Deck, Bag, and Pool Building", "Hand Management", "Ownership", "Set Collection", "Solo / Solitaire Game", "Tags"]
   ,description:"Players are 19th-century ranchers herding cattle from Texas to Kansas City. On the way, you move along a trail of buildings — some yours, some rivals' — triggering actions to buy cattle, hire workers, or build new structures. At Kansas City, you ship cattle by train, scoring based on the variety in your hand. Combines deck building, route planning, and building placement into a deeply layered strategy game that reveals new depths over many plays."},

  {id:"bomb_busters",name:"Bomb Busters"
   ,row:2,col:1,categories:["Co-op", "Family", "Card Game"]
   ,players:"2-5",playTime:"30 min"
   ,complexity:2.0,bggId:413246
   ,spineColor:"#7f2a34",boxSize:"md"
   ,designer:"Hisashi Hayashi"
   ,year:2024
   ,bggRating:8.0
   ,mechanics:["Communication Limits", "Cooperative Game", "Deduction", "Memory", "Once-Per-Game Abilities", "Real-Time"],description:"A real-time cooperative game about defusing a bomb. Each player has a tile holder with colored wires visible only to others. Through limited communication, the team must identify matching wire pairs and cut them — but cutting a red wire ends the game instantly. Scenarios escalate in difficulty, adding equipment cards and new challenges. Tight, tense, and quick. For groups who enjoy cooperative pressure games like The Crew or Hanabi."},

  {id:"magic_maze",name:"Magic Maze"
   ,row:2,col:1,categories:["Co-op", "Family", "Puzzle"]
   ,players:"1-8",playTime:"15 min"
   ,complexity:1.75,bggId:209778
   ,spineColor:"#7f597f",boxSize:"md"
   ,designer:"Kasper Lapp"
   ,year:2017
   ,bggRating:6.9
   ,mechanics:["Communication Limits", "Cooperative Game", "Elapsed Real Time Ending", "Grid Movement", "Map Addition", "Modular Board"]
   ,description:"Four fantasy characters need to simultaneously steal equipment from a shopping mall and escape. Each player controls only one direction of movement — one player moves everyone north, another moves everyone south, and so on. No talking allowed during the timed rounds; the only communication tool is an angry red pawn you can place in front of someone. Frantic, hilarious, and surprisingly demanding. Best for groups comfortable with real-time silence and chaos."},

  {id:"hansa_teutonica",name:"Hansa Teutonica: Big Box"
   ,row:2,col:1,categories:["Strategy", "Euro", "Area Control"]
   ,players:"3-5",playTime:"45-90 min"
   ,complexity:2.96,bggId:286749
   ,spineColor:"#3f362c",boxSize:"md"
   ,designer:"Andreas Steding"
   ,year:2020
   ,bggRating:8.4
   ,mechanics:["Action Points", "Area Majority / Influence", "End Game Bonuses", "Network and Route Building", "Ownership", "Take That"]
   ,description:"Players are medieval merchants competing for prestige in the Hanseatic League. On your turn, you place traders on routes between cities — completing a route establishes an office there. But opponents can displace your traders, forcing you to react. You also upgrade personal abilities: more actions per turn, more traders to place, or better scoring. The interaction is constant and direct. This Big Box includes the base game and all expansions. A Euro where blocking and timing matter as much as building."},

  {id:"hadrians_wall",name:"Hadrian's Wall"
   ,row:2,col:2,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"1-6",playTime:"30-60 min"
   ,complexity:3.17,bggId:304783
   ,spineColor:"#7f6659",boxSize:"md"
   ,designer:"Bobby Hill"
   ,year:2021
   ,bggRating:7.9
   ,mechanics:["Hand Management", "Paper-and-Pencil", "Solo / Solitaire Game", "Tech Trees / Tech Tracks"]
   ,description:"Players are Roman generals each building a section of Hadrian's Wall. Each round, you receive worker and resource cards, then fill in tracks on two large player sheets — constructing wall sections, training soldiers, building civilian infrastructure, and manning defenses. Completing rows triggers cascading bonuses across interconnected systems. A flip-and-write game with the depth of a full Euro. For players who enjoy solo-puzzle optimization with meaningful decisions."},

  {id:"search_planet_x",name:"The Search for Planet X"
   ,row:2,col:2,categories:["Deduction", "Solo", "Puzzle"]
   ,players:"1-4",playTime:"60 min"
   ,complexity:2.44,bggId:279537
   ,spineColor:"#24323f",boxSize:"md"
   ,designer:"Matthew O'Malley, Ben Rosset"
   ,year:2020
   ,bggRating:7.9
   ,mechanics:["Action Points", "Deduction", "End Game Bonuses", "Paper-and-Pencil", "Rondel", "Solo / Solitaire Game"]
   ,description:"Players are astronomers scanning the sky to find a hypothetical ninth planet. A companion app arranges objects — asteroids, comets, gas clouds, dwarf planets — in a circular sky map. Each turn you spend time to survey sectors, getting partial clues about what's where. Through logical elimination you narrow down Planet X's location, then publish your theory. First correct publication wins. For deduction fans who enjoy structured logic puzzles with an app-driven twist."},

  {id:"marvel_dice_throne_box1",name:"Marvel Dice Throne"
   ,row:2,col:2,categories:["Dice", "Card Game", "Thematic"]
   ,players:"2-6",playTime:"20-40 min"
   ,complexity:2.15,bggId:348406
   ,spineColor:"#141f3f",boxSize:"lg"
   ,designer:"Gavan Brown, Nate Chatellier, Manny Trembley"
   ,year:2022
   ,bggRating:8.0
   ,mechanics:["Dice Rolling", "Take That", "Team-Based Game", "Variable Player Powers"]
   ,description:"A head-to-head dice combat game where each player controls a Marvel hero with a unique set of abilities triggered by dice combinations. On your turn, roll dice up to three times, Yahtzee-style, trying to activate attacks, defensive moves, or ultimate abilities. Play cards from your hero's deck to modify rolls or enhance effects. Eight asymmetric heroes each play completely differently. Fast, tactical, and works in 1v1, 2v2, or free-for-all formats."},

  {id:"horizons_spirit_island",name:"Horizons of Spirit Island"
   ,row:2,col:2,categories:["Co-op", "Strategy", "Thematic"]
   ,players:"1-3",playTime:"90-120 min"
   ,complexity:3.57,bggId:367498
   ,spineColor:"#2a2a3f",boxSize:"md"
   ,designer:"R. Eric Reuss"
   ,year:2022
   ,bggRating:8.1
   ,mechanics:["Action Retrieval", "Area Majority / Influence", "Automatic Resource Growth", "Campaign / Battle Card Driven", "Cooperative Game", "Events"]
   ,description:"A standalone introduction to Spirit Island with five new beginner-friendly spirits and a streamlined board. Players are nature spirits defending an island from colonizing invaders — each turn you play power cards to push back explorers, destroy towns, and spread fear. Spirits grow stronger each round, gaining new powers. The invaders follow a predictable build-and-ravage cycle you must disrupt. Fully cooperative, with the strategic depth Spirit Island is known for but a faster setup."},

  {id:"concordia_venus",name:"Concordia Venus"
   ,row:2,col:2,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"2-6",playTime:"60-120 min"
   ,complexity:3.01,bggId:256916
   ,spineColor:"#39213f",boxSize:"lg"
   ,designer:"Mac Gerdts"
   ,year:2018
   ,bggRating:8.3
   ,mechanics:["Action Retrieval", "Advantage Token", "Auction: Dutch", "Communication Limits", "Deck, Bag, and Pool Building", "Hand Management"]
   ,description:"Players expand a trading network across the Roman Mediterranean. On your turn you play one card from your hand — each card type lets you produce, trade, build colonists, or move them to new cities. Crucially, scoring happens only at game end, and each card in your hand scores for a different Roman god: one rewards city presence, another rewards goods variety, and so on. So your strategy IS your score. Supports up to six with team play. Elegant, low-conflict, and deeply replayable."},

  {id:"planet_unknown_super",name:"Planet Unknown: Supermoon"
   ,row:2,col:3,categories:["Strategy", "Puzzle"]
   ,players:"1-6",playTime:"65-80 min"
   ,complexity:2.5,bggId:393509
   ,spineColor:"#1c475f",boxSize:"md"
   ,designer:"Ryan Lambert, Adam Rehberg"
   ,year:2025
   ,bggRating:7.6
   ,mechanics:["Multiple Maps", "Open Drafting", "Tile Placement", "Track Movement", "Variable Set-up"],description:"An expansion for Planet Unknown adding a Supermoon board, new maps (Japan and Mexico), and meteorite hazards. The base game's simultaneous polyomino tile-drafting system remains: a shared rotating station serves tiles to all players each round. New purple-drop cooldown mechanics and submerged sections add decision layers. For groups who want more variety and challenge in their Planet Unknown sessions."},

  {id:"trickerion",name:"Trickerion: Legends of Illusion"
   ,row:2,col:3,categories:["Strategy", "Euro", "Worker Placement", "Thematic"]
   ,players:"2-4",playTime:"60-180 min"
   ,complexity:4.26,bggId:163068
   ,spineColor:"#7f6a45",boxSize:"lg"
   ,designer:"Richard Ámann, Viktor Péter"
   ,year:2015
   ,bggRating:8.0
   ,mechanics:["Action Points", "Action Queue", "Catch the Leader", "Dice Rolling", "Simultaneous Action Selection", "Tile Placement"]
   ,description:"Players are rival stage magicians in a Victorian-era city. Each round, you assign your magician and assistants to different city locations — the market for components, the workshop to prepare tricks, the theater to perform them. Tricks require specific components and preparation steps before they can be staged for audiences. Points come from performing, but the competition for stage slots and components is fierce. A deeply thematic, heavy worker placement game for players who enjoy planning several turns ahead."},

  {id:"dead_cells",name:"Dead Cells: The Rogue-Lite Board Game"
   ,row:2,col:3,categories:["Co-op", "Thematic", "Dice"]
   ,players:"1-4",playTime:"45 min"
   ,complexity:2.36,bggId:380135
   ,spineColor:"#221d3f",boxSize:"lg"
   ,designer:"Antoine Bauza, Corentin Lebrat, Ludovic Maublanc, Théo Rivière"
   ,year:2024
   ,bggRating:7.6
   ,mechanics:["Action Queue", "Communication Limits", "Cooperative Game", "Deck, Bag, and Pool Building", "Delayed Purchase", "Legacy Game"]
   ,description:"Based on the roguelite video game, players cooperate as Beheaded characters exploring a shifting dungeon. Each run, you fight enemies using a deck of equipment cards, collect cells to buy upgrades, and face a boss. Death resets most progress — but some permanent upgrades carry over between runs. Limited communication adds cooperative tension. Plays in about 45 minutes per run. For groups who enjoy the retry loop of roguelites and cooperative dungeon crawlers."},

  {id:"frosthaven",name:"Frosthaven"
   ,row:3,col:1,categories:["Strategy", "Co-op", "Campaign", "Thematic"]
   ,players:"1-4",playTime:"90-180 min"
   ,complexity:4.41,bggId:295770
   ,spineColor:"#59727f",boxSize:"xl"
   ,designer:"Isaac Childres"
   ,year:2022
   ,bggRating:8.7
   ,mechanics:["Campaign / Battle Card Driven", "Communication Limits", "Cooperative Game", "Deck Construction", "Deck, Bag, and Pool Building", "Grid Movement"]
   ,description:"A northern outpost barely surviving harsh winters and unknown threats. Players control mercenaries fighting through tactical hex-grid combat using a hand of ability cards — each card has a top and bottom action, and playing it brings you closer to exhaustion. Between scenarios, you build up the outpost, craft equipment, and make story decisions that permanently change the campaign. Over 100 scenarios with evolving characters. The sequel to Gloomhaven, bigger in every dimension. For dedicated groups who commit to long cooperative campaigns."},

  {id:"gloomhaven",name:"Gloomhaven"
   ,row:3,col:1,categories:["Strategy", "Co-op", "Campaign", "Thematic"]
   ,players:"1-4",playTime:"60-120 min"
   ,complexity:3.92,bggId:174430
   ,spineColor:"#3f1f14",boxSize:"xl"
   ,designer:"Isaac Childres"
   ,year:2017
   ,bggRating:8.5
   ,mechanics:["Action Queue", "Action Retrieval", "Campaign / Battle Card Driven", "Card Play Conflict Resolution", "Communication Limits", "Cooperative Game"]
   ,description:"Mercenaries delve into dungeons across a branching campaign in a dark fantasy world. Combat is card-driven: each turn you play two ability cards, using the top of one and bottom of the other. Cards are your actions, your timer, and your health — once you run out, you're exhausted. Between scenarios, characters level up, retire, and unlock new classes. Decisions shape the storyline and open new locations on the world map. A massive, evolving cooperative experience for groups who want tactical depth and persistent consequences."},

  {id:"bad_company",name:"Bad Company"
   ,row:3,col:3,categories:["Strategy", "Engine Building", "Dice"]
   ,players:"1-6",playTime:"30 min"
   ,complexity:1.93,bggId:340677
   ,spineColor:"#5f422f",boxSize:"md"
   ,designer:"Kenneth Minde, Kristian Amundsen Østby, Eilif Svensson"
   ,year:2021
   ,bggRating:7.2
   ,mechanics:["Area Majority / Influence", "Contracts", "Dice Rolling", "Random Production", "Re-rolling and Locking", "Set Collection"]
   ,description:"Each player runs a criminal gang, represented by a player board with eleven gang members you can upgrade by slotting overlay cards onto them. Dice are rolled to generate resources, which fund heists and recruit new specialists. The police advance each round, threatening to end the game. Plays quickly even at six players because everyone resolves dice simultaneously. For players who enjoy light engine-building with a push-your-luck edge."},

  {id:"chronicles_of_crime",name:"Chronicles of Crime"
   ,row:3,col:3,categories:["Co-op", "Deduction", "Thematic"]
   ,players:"1-4",playTime:"60-90 min"
   ,complexity:2.06,bggId:239188
   ,spineColor:"#2c2c3f",boxSize:"md"
   ,designer:"David Cicurel"
   ,year:2018
   ,bggRating:7.5
   ,mechanics:["Cooperative Game", "Scenario / Mission / Campaign Game", "Solo / Solitaire Game", "Storytelling"]
   ,description:"A cooperative crime-solving game driven by a companion app. The board displays locations around the city; character and item cards have QR codes you scan to unlock clues, dialogue, and evidence. You can even examine crime scenes in VR through your phone. Each scenario is a unique case with a time limit based on actions taken. Scored by how quickly and accurately you solve the case. For groups who enjoy immersive detective experiences with modern tech integration."},

  {id:"mistborn",name:"Mistborn: The Deckbuilding Game",bggId:422780,year:2024,designer:"John D. Clair",row:3,col:3,categories:["Card Game","Fantasy"],players:"1-4",playTime:"30-60 min",complexity:2.68,bggRating:7.7,spineColor:"#2c2c3f",boxSize:"md",mechanics:["Cooperative Game","Deck, Bag, and Pool Building","Market","Solo / Solitaire Game"],description:"Based on Brandon Sanderson's Mistborn novel series, players control iconic characters — Vin, Kelsier, Marsh, or Shan — and burn metals to unlock Allomantic powers in fast-paced battles. Build and improve your deck by purchasing cards from a shared market. Each metal type has different strengths: damaging opponents, earning mission points, or manipulating allies. Win through allomantic combat or by completing perilous missions. Play head-to-head or take on The Lord Ruler in solo or co-op mode."},

  {id:"empires_of_the_north",name:"Imperial Settlers: Empires of the North"
   ,row:3,col:3,categories:["Strategy", "Euro", "Engine Building", "Card Game"]
   ,players:"1-4",playTime:"45-90 min"
   ,complexity:2.81,bggId:270844
   ,spineColor:"#436f7f",boxSize:"lg"
   ,designer:"Joanna Kijanka, Ignacy Trzewiczek"
   ,year:2019
   ,bggRating:7.4
   ,mechanics:["Hand Management", "Take That", "Variable Player Powers", "Worker Placement"]
   ,description:"A card-driven engine builder set in a world of northern factions — Scotsmen, Inuits, and Vikings. Each faction has two unique pre-constructed decks with completely different strategies. On your turn, you play cards from your hand to gather resources, build locations, and send expeditions to nearby islands for one-time bonuses. Managing your action economy and knowing when to raid versus build is key. For players who like asymmetric factions and tableau building."},

  {id:"lost_ruins_of_arnak",name:"Lost Ruins of Arnak"
   ,row:3,col:4,categories:["Strategy", "Euro", "Deck Building", "Worker Placement"]
   ,players:"1-4",playTime:"30-120 min"
   ,complexity:2.93,bggId:312484
   ,spineColor:"#2a3f34",boxSize:"lg"
   ,designer:"Elwen, Mín"
   ,year:2020
   ,bggRating:8.1
   ,mechanics:["Area Movement", "Contracts", "Deck, Bag, and Pool Building", "Delayed Purchase", "End Game Bonuses", "Hand Management"]
   ,description:"Archaeologists explore an uncharted island, uncovering artifacts and researching a lost civilization. The game blends deck building with worker placement — cards provide resources and travel abilities, while workers are placed on exploration sites that unlock as the island is mapped. A research track offers powerful bonuses for advancing. Guardians block some sites until defeated. Plays in about 90 minutes with satisfying tension between exploring and researching. Accessible to mid-weight gamers, with depth for experienced players."},

  {id:"ark_nova",name:"Ark Nova"
   ,row:3,col:4,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"1-4",playTime:"90-150 min"
   ,complexity:3.8,bggId:342942
   ,spineColor:"#267b7f",boxSize:"lg"
   ,designer:"Mathias Wigge"
   ,year:2021
   ,bggRating:8.5
   ,mechanics:["Contracts", "End Game Bonuses", "Events", "Grid Coverage", "Hand Management", "Hexagon Grid"]
   ,description:"Players design and manage a modern zoo, balancing visitor appeal with conservation goals. Five action cards — Animals, Build, Cards, Association, Sponsors — sit in a row; their position determines their strength, and using one resets it to the weakest slot. You build enclosures on a personal map, fill them with animals that have specific habitat needs, and support conservation projects worldwide. The game ends when your appeal track and conservation track cross. A long, deeply strategic engine builder for players who enjoy variable setup and card combos."},

  {id:"thunder_road",name:"Thunder Road: Vendetta"
   ,row:3,col:4,categories:["Thematic", "Dice", "Family"]
   ,players:"2-4",playTime:"45-75 min"
   ,complexity:1.97,bggId:342070
   ,spineColor:"#432b30",boxSize:"lg"
   ,designer:"Dave Chalker, Brett Myers, Noah Cohen, Rob Daviau, Justin D. Jacobson, Jim Keifer, Brian Neff"
   ,year:2023
   ,bggRating:7.9
   ,mechanics:["Dice Rolling", "Die Icon Resolution", "Grid Movement", "Hexagon Grid", "Player Elimination", "Roll / Spin and Move"]
   ,description:"A vehicular combat racing game on a desert highway. Players roll dice to move their cars and shoot at opponents, trying to wreck rival vehicles or push them off the trailing edge of the ever-scrolling board. Damage tokens add chaotic effects — spinouts, lost control, chain reactions. The board drops its rear tile and adds a new one at the front each round, so falling behind means elimination. A revival of the 1986 classic with modern additions. For groups who want fast, loud, unapologetically fun mayhem."},

  {id:"abyss",name:"Abyss"
   ,row:3,col:5,categories:["Strategy", "Card Game", "Thematic"]
   ,players:"2-4",playTime:"30-60 min"
   ,complexity:2.32,bggId:155987
   ,spineColor:"#13213f",boxSize:"md"
   ,designer:"Bruno Cathala, Charles Chevallier"
   ,year:2014
   ,bggRating:7.3
   ,mechanics:["Auction / Bidding", "Hand Management", "Memory", "Open Drafting", "Push Your Luck", "Set Collection"]
   ,description:"Players compete for the throne of an underwater kingdom. The core loop is recruiting allies from a council (a push-your-luck draft where rivals can buy cards you reveal), then spending sets of allies to recruit powerful Lords with special abilities, then using Lords to claim strategic location tiles. Locations form a personal tableau scoring bonus points. The art is lavish, the decisions tight. For players who enjoy set collection with auction tension and tableau synergies."},

  {id:"mystic_vale",name:"Mystic Vale"
   ,row:3,col:5,categories:["Card Game", "Strategy", "Engine Building"]
   ,players:"2-4",playTime:"45 min"
   ,complexity:2.26,bggId:194607
   ,spineColor:"#2c3f2c",boxSize:"md"
   ,designer:"John D. Clair"
   ,year:2016
   ,bggRating:7.2
   ,mechanics:["Deck, Bag, and Pool Building", "End Game Bonuses", "Hand Management", "Layering", "Open Drafting", "Push Your Luck"]
   ,description:"Druids work to cleanse a cursed valley using a unique card-crafting system. Cards are transparent sleeves with printed abilities — on your turn you physically slide new advancement strips into your existing cards, upgrading them permanently. Push your luck by revealing cards from your deck; three decay symbols spoil your turn. Points come from advancements and vale cards. For players who want a deck builder with a tactile, physical twist."},

  {id:"spirit_island_je",name:"Spirit Island: Jagged Earth"
   ,row:3,col:5,categories:["Co-op", "Strategy", "Thematic"]
   ,players:"1-6",playTime:"90-120 min"
   ,complexity:4.52,bggId:262722
   ,spineColor:"#2c2c3f",boxSize:"lg"
   ,designer:"R. Eric Reuss"
   ,year:2020
   ,bggRating:9.3
   ,mechanics:["Area Majority / Influence", "Cooperative Game", "Hand Management", "Modular Board", "Set Collection", "Simultaneous Action Selection"]
   ,description:"A large expansion for Spirit Island adding ten new spirits, two new adversaries, new event cards, and additional game mechanics including Badlands tokens and new power cards. The new spirits range from beginner-friendly to highly complex. Requires the base game. Dramatically expands the variety and replayability for experienced Spirit Island players who want more asymmetric options and tougher challenges."},

  {id:"spirit_island",name:"Spirit Island"
   ,row:3,col:5,categories:["Co-op", "Strategy", "Thematic"]
   ,players:"1-4",playTime:"90-120 min"
   ,complexity:4.07,bggId:162886
   ,spineColor:"#26667f",boxSize:"xl"
   ,designer:"R. Eric Reuss"
   ,year:2017
   ,bggRating:8.3
   ,mechanics:["Action Retrieval", "Area Majority / Influence", "Automatic Resource Growth", "Campaign / Battle Card Driven", "Cooperative Game", "Deck, Bag, and Pool Building"]
   ,description:"Players are nature spirits defending an island from colonizing invaders. Each spirit has unique powers — one spreads fear, another commands beasts, a third reshapes the land itself. Every round, invaders explore, build, and ravage in a predictable pattern you must disrupt using slow and fast power cards. Spirits grow stronger each turn, gaining major powers. Fully cooperative with no hidden information. For players who enjoy heavy cooperative strategy where every spirit combination creates a different puzzle."},

  {id:"hegemony",name:"Hegemony: Lead Your Class to Victory"
   ,row:3,col:6,categories:["Strategy", "Euro", "Thematic"]
   ,players:"2-4",playTime:"90-180 min"
   ,complexity:4.26,bggId:321608
   ,spineColor:"#2c363f",boxSize:"xl"
   ,designer:"Vangelis Bagiartakis, Varnavas Timotheou"
   ,year:2023
   ,bggRating:8.4
   ,mechanics:["Action / Event", "Hand Management", "Simulation", "Variable Player Powers", "Voting", "Worker Placement, Different Worker Types"]
   ,description:"A political-economic simulation where each player controls a different social class: working class, middle class, capitalist, or the state. Workers seek higher wages and public services; capitalists want deregulation and profit; the state balances budgets and passes laws through a voting mechanism. Actions include hiring, producing, selling, striking, and legislating. Each class has completely different victory conditions and levers. For groups who enjoy heavy, asymmetric games grounded in real-world political dynamics."},

  {id:"caverna_forgotten",name:"Caverna: The Forgotten Folk"
   ,row:3,col:6,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"1-7",playTime:"30-210 min"
   ,complexity:3.79,bggId:245932
   ,spineColor:"#2c2c3f",boxSize:"md"
   ,designer:"Uwe Rosenberg, Alex Wilber"
   ,year:2018
   ,bggRating:8.2
   ,mechanics:["Tile Placement", "Variable Player Powers", "Worker Placement"]
   ,description:"An expansion for Caverna replacing the standard dwarves with eight fantasy races — elves, trolls, dark elves, and more. Each race has unique abilities, restrictions, and scoring bonuses that fundamentally change how you approach farming and mining. Requires the base game. For experienced Caverna players who want to shake up the familiar optimization puzzle with asymmetric starting conditions."},

  {id:"caverna",name:"Caverna: The Cave Farmers"
   ,row:3,col:6,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"1-7",playTime:"30-210 min"
   ,complexity:3.78,bggId:102794
   ,spineColor:"#2c2c3f",boxSize:"xl"
   ,designer:"Uwe Rosenberg"
   ,year:2013
   ,bggRating:7.9
   ,mechanics:["Automatic Resource Growth", "Increase Value of Unchosen Resources", "Solo / Solitaire Game", "Tile Placement", "Turn Order: Claim Action", "Worker Placement"]
   ,description:"Players lead dwarf families farming the land outside their cave and mining tunnels deeper into the mountain. Each round, new action spaces appear and players take turns placing workers to plow fields, sow crops, breed animals, mine ore and rubies, and furnish cave rooms with special abilities. A massive sandbox with many paths to victory and very little direct conflict. The spiritual successor to Agricola — more generous, more options, less punishing. For players who enjoy open-ended optimization and building personal economies."},

  {id:"shipwrights",name:"Shipwrights of the North Sea"
   ,row:3,col:6,categories:["Strategy", "Card Game", "Euro"]
   ,players:"2-5",playTime:"60 min"
   ,complexity:2.31,bggId:75547
   ,spineColor:"#41707f",boxSize:"md"
   ,designer:"Shem Phillips"
   ,year:2014
   ,bggRating:6.3
   ,mechanics:["Commodity Speculation", "Hand Management", "Open Drafting", "Trading"]
   ,description:"Set in the early Viking Age, players compete to build the most impressive fleet. Each round you draft cards representing workers, resources, and townsfolk, then use them to construct ships worth victory points. Ships require specific combinations of oak, wool, iron, and gold. Trading with other players is encouraged and sometimes necessary. A lighter card game with negotiation elements. For groups who enjoy drafting and resource management without heavy complexity."},

  {id:"seven_wonders_architects",name:"7 Wonders: Architects"
   ,row:4,col:2,categories:["Family", "Card Game", "Strategy"]
   ,players:"2-7",playTime:"25 min"
   ,complexity:1.37,bggId:346703
   ,spineColor:"#2f557f",boxSize:"md"
   ,designer:"Antoine Bauza"
   ,year:2021
   ,bggRating:7.0
   ,mechanics:["Neighbor Scope", "Open Drafting", "Set Collection", "Variable Player Powers"]
   ,description:"Players each receive an unconstructed wonder and race to complete it first. On your turn, draw a card from one of three face-down or face-up decks shared with your neighbors. Cards provide resources to build wonder stages, military strength for periodic conflicts, or science symbols for set bonuses. Simple drafting with no hand management — you play every card immediately. A gateway game that plays in about 25 minutes with up to seven players."},

  {id:"feast_for_odin_exp",name:"A Feast for Odin: The Norwegians"
   ,row:4,col:2,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"1-4",playTime:"30-120 min"
   ,complexity:3.99,bggId:216788
   ,spineColor:"#596c7f",boxSize:"md"
   ,designer:"Gernot Köpke, Uwe Rosenberg"
   ,year:2018
   ,bggRating:8.9
   ,mechanics:["Dice Rolling", "Income", "Pattern Building", "Solo / Solitaire Game", "Tile Placement", "Worker Placement"]
   ,description:"The first major expansion for A Feast for Odin. Adds a redesigned action board with new action spaces (elk-hunting, fishing, butchering) that change based on player count. Includes new islands for exploration, additional puzzle tiles, and adjusted balance. The expansion tightens the experience and adds strategic variety without increasing complexity. Requires the base game. For players who want more options and replayability in their Viking sandbox."},

  {id:"carnegie",name:"Carnegie"
   ,row:4,col:2,categories:["Strategy", "Euro", "Worker Placement", "Engine Building"]
   ,players:"1-4",playTime:"90-120 min"
   ,complexity:3.82,bggId:310873
   ,spineColor:"#36464e",boxSize:"lg"
   ,designer:"Xavier Georges"
   ,year:2022
   ,bggRating:8.0
   ,mechanics:["Action Retrieval", "Area Movement", "Connections", "End Game Bonuses", "Follow", "Grid Movement"]
   ,description:"Inspired by Andrew Carnegie's life, players build companies and expand across America. Each round, one player selects a shared action that everyone performs — human resources, management, construction, or R&D — but with different effects based on your company's state. Workers are sent on missions across the US map to gain bonuses. Philanthropy tiles provide end-game scoring. A medium-heavy Euro about following other players' chosen actions while pursuing your own plan. For players who enjoy shared-action selection and long-range strategy."},

  {id:"adventure_tactics",name:"Adventure Tactics: Domianne's Tower"
   ,row:4,col:3,categories:["Co-op", "Campaign", "Strategy", "Thematic"]
   ,players:"1-5",playTime:"45-90 min"
   ,complexity:2.54,bggId:268504
   ,spineColor:"#133f3f",boxSize:"xl"
   ,designer:"Nicholas Yu"
   ,year:2021
   ,bggRating:7.8
   ,mechanics:["Campaign / Battle Card Driven", "Cooperative Game", "Dice Rolling", "Grid Movement", "Role Playing", "Scenario / Mission / Campaign Game"]
   ,description:"A cooperative tactical RPG played over a branching campaign. Players start as one of five basic classes — warrior, mage, healer, ranger, rogue — and level up between scenarios, choosing from an expanding class tree with over 15 advanced classes. Combat takes place on a grid using dice and ability cards. Enemies are controlled by an AI system. Characters retain their progression throughout the campaign. For groups who enjoy tactical combat with RPG-style character growth."},

  {id:"heat_heavy_rain",name:"Heat: Heavy Rain"
   ,row:4,col:4,categories:["Racing", "Thematic", "Family"]
   ,players:"1-7",playTime:"30-60 min"
   ,complexity:2.4,bggId:410291
   ,spineColor:"#22303f",boxSize:"md"
   ,designer:"Asger Aleksandrov Granerud, Daniel Skjold Pedersen"
   ,year:2024
   ,bggRating:8.1
   ,mechanics:["Catch the Leader", "Hand Management", "Push Your Luck", "Race", "Simulation", "Simultaneous Action Selection"],description:"An expansion for Heat: Pedal to the Metal adding two new circuits (Japan and Mexico), an orange player for seven-racer games, and rain mechanics. Submerged track sections cost extra heat to downshift through, and new upgrade cards introduce a purple cooldown that recovers heat differently. Also adds new event, stress, and championship cards. Requires the base game. For groups wanting more tracks and weather-based variability."},

  {id:"dune_imperium",name:"Dune: Imperium"
   ,row:4,col:4,categories:["Strategy", "Deck Building", "Worker Placement", "Thematic"]
   ,players:"1-4",playTime:"60-120 min"
   ,complexity:3.08,bggId:316554
   ,spineColor:"#3f2c3f",boxSize:"lg"
   ,designer:"Paul Dennen"
   ,year:2020
   ,bggRating:8.4
   ,mechanics:["Card Play Conflict Resolution", "Deck, Bag, and Pool Building", "Delayed Purchase", "Force Commitment", "Increase Value of Unchosen Resources", "Multi-Use Cards"]
   ,description:"Set on Arrakis, players lead Great Houses competing for spice and political power. Each turn you play a card from your hand that determines which worker placement spaces are available to you — so deck building directly controls your action options. Rounds end with a combat phase where players commit troops and reveal hidden combat cards. Four factions — Emperor, Spacing Guild, Bene Gesserit, Fremen — offer alliance tracks with escalating rewards. Blends deck building, worker placement, and hidden-bid combat. For players who enjoy strategic layering and the Dune universe."},

  {id:"feast_for_odin",name:"A Feast for Odin"
   ,row:4,col:4,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"1-4",playTime:"30-120 min"
   ,complexity:3.87,bggId:177736
   ,spineColor:"#59727f",boxSize:"xl"
   ,designer:"Uwe Rosenberg"
   ,year:2016
   ,bggRating:8.2
   ,mechanics:["Action Points", "Automatic Resource Growth", "Dice Rolling", "Enclosure", "Grid Coverage", "Hand Management"]
   ,description:"Players live as Vikings — raiding, whaling, trading, exploring, and settling new lands. The central board has over 60 action spaces; each round, players take turns placing workers to gather resources in the form of polyomino-shaped tiles. These tiles fill income boards on your player mat — the more you cover, the more income and points you earn. Islands and houses provide additional grids to fill. A massive sandbox with many viable strategies and a satisfying spatial puzzle. For players who want a grand-scale worker placement game with tile-fitting optimization."},

  {id:"thunderbirds",name:"Thunderbirds"
   ,row:4,col:4,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-4",playTime:"45-60 min"
   ,complexity:2.48,bggId:160610
   ,spineColor:"#38557b",boxSize:"md"
   ,designer:"Matt Leacock"
   ,year:2015
   ,bggRating:7.5
   ,mechanics:["Action Points", "Area Movement", "Cooperative Game", "Dice Rolling", "Pick-up and Deliver", "Set Collection"]
   ,description:"Based on the 1960s TV series, players pilot International Rescue vehicles on cooperative missions to save lives around the globe. Each turn you move a Thunderbird machine to a disaster location and use action points and character abilities to attempt rescues. Meanwhile, the Hood advances his scheme, adding time pressure. Equipment and specialist tokens help with tougher missions. A family-weight cooperative game with nostalgic appeal and straightforward pick-up-and-deliver mechanics."},

  {id:"blitzkrieg",name:"Blitzkrieg!: WW2 in 20 Minutes"
   ,row:4,col:6,categories:["Strategy", "Area Control"]
   ,players:"1-2",playTime:"20 min"
   ,complexity:1.91,bggId:258210
   ,spineColor:"#641e1e",boxSize:"md"
   ,designer:"Paolo Mori"
   ,year:2019
   ,bggRating:7.5
   ,mechanics:["Area Majority / Influence", "Deck, Bag, and Pool Building", "Hand Management", "Kill Steal", "Race", "Solo / Solitaire Game"]
   ,description:"A two-player game representing World War II across five theaters — Western Europe, Eastern Europe, Pacific, Mediterranean, and the Atlantic. Players draw military unit tokens blindly from a bag and place them on campaign spaces to win theaters by majority. Special tokens represent nukes, codebreaking, and espionage. No dice, no combat resolution — placement IS the conflict. Plays in about 20 minutes. For players who want a distilled wargaming experience with bag-building and area majority."},

  {id:"mdt_deadpool",name:"Marvel Dice Throne: Deadpool"
   ,row:4,col:6,categories:["Dice", "Card Game", "Thematic"]
   ,players:"2-6",playTime:"20-40 min"
   ,complexity:2.0,bggId:403511
   ,spineColor:"#3f1313",boxSize:"md"
   ,designer:"Gavan Brown, Nate Chatellier, Manny Trembley"
   ,year:2025
   ,bggRating:8.4
   ,mechanics:["Dice Rolling", "Variable Player Powers"],description:"A standalone hero for the Marvel Dice Throne system. Deadpool has his own unique dice, card deck, and ability board with fourth-wall-breaking mechanics. Roll dice Yahtzee-style to activate attacks, defensive moves, and ultimate abilities while playing cards to modify results. Requires another Marvel Dice Throne or Dice Throne set to play against. For fans of the character and the Dice Throne combat system."},

  {id:"mdt_cap_panther",name:"Marvel Dice Throne: Captain Marvel v. Black Panther"
   ,row:4,col:6,categories:["Dice", "Card Game", "Thematic"]
   ,players:"2",playTime:"20-40 min"
   ,complexity:2.4,bggId:360061
   ,spineColor:"#3f2d1b",boxSize:"md"
   ,designer:"Gavan Brown, Nate Chatellier, Manny Trembley"
   ,year:2022
   ,bggRating:7.7
   ,mechanics:["Dice Rolling"],description:"A two-hero box for Marvel Dice Throne containing Captain Marvel and Black Panther. Each hero has a unique dice set, card deck, and ability board. Captain Marvel channels cosmic energy for powerful offense; Black Panther accumulates vibranium counters for devastating combos. Players roll dice up to three times per turn, Yahtzee-style, playing cards to modify outcomes. Fast asymmetric duels that play in 20-40 minutes."},

  {id:"cthulhu_dmd",name:"Cthulhu: Death May Die"
   ,row:4,col:6,categories:["Co-op", "Thematic", "Dice"]
   ,players:"1-5",playTime:"90-120 min"
   ,complexity:2.5,bggId:253344
   ,spineColor:"#3f2c2c",boxSize:"xl"
   ,designer:"Rob Daviau, Eric M. Lang"
   ,year:2019
   ,bggRating:8.2
   ,mechanics:["Action Points", "Area Movement", "Cooperative Game", "Dice Rolling", "Role Playing", "Scenario / Mission / Campaign Game"]
   ,description:"Investigators in the 1920s deliberately summon Elder Gods — then try to destroy them. Each player chooses an investigator with a unique ability and a shared insanity track that escalates throughout the game. Each round you spend action points to move, attack cultists, and disrupt rituals using custom dice. Failing stress checks pushes you toward madness, which grants stronger abilities but risks death. Scenario-based with different Elder Gods as final bosses. For players who enjoy thematic dice combat with a Lovecraftian horror setting."},

  {id:"kill_hitler",name:"I Would Kill Hitler"
   ,row:5,col:1,categories:["Party", "Card Game"]
   ,players:"3-8",playTime:"20-60 min"
   ,complexity:1.0,bggId:335204
   ,spineColor:"#645b1e",boxSize:"md"
   ,designer:"(Uncredited)"
   ,year:2021
   ,bggRating:6.9
   ,mechanics:["Player Judge", "Storytelling"],description:"A party game of absurd hypothetical scenarios. Each round, a rotating judge reads a wild premise, and other players must craft a story using random plot cards from their hand — items, characters, dialogue, or twists they must work into their answer. The judge picks the most entertaining response. Similar to Apples to Apples or Cards Against Humanity, but focused on improvised storytelling. For groups who enjoy creative, no-pressure party games."},

  {id:"kitchen_rush",name:"Kitchen Rush (Revised Edition)"
   ,row:5,col:5,categories:["Co-op", "Family", "Worker Placement"]
   ,players:"2-4",playTime:"20-60 min"
   ,complexity:2.12,bggId:287938
   ,spineColor:"#56567b",boxSize:"md"
   ,designer:"Vangelis Bagiartakis, Dávid Turczi"
   ,year:2019
   ,bggRating:7.4
   ,mechanics:["Action Timer", "Cooperative Game", "Modular Board", "Real-Time", "Variable Phase Order", "Worker Placement"]
   ,description:"A cooperative real-time game where players run a restaurant together. Workers are represented by sand timers — place one to take an action (buy ingredients, cook, serve), but you cannot use that worker again until the sand runs out. Orders arrive with time limits, ingredients spoil, and guests get impatient. Eight scenarios ramp up the difficulty as your restaurant grows. Genuinely chaotic and funny. For groups who enjoy cooperative games with physical real-time pressure."},

  {id:"detective",name:"Detective: A Modern Crime Board Game"
   ,row:5,col:5,categories:["Co-op", "Deduction", "Thematic", "Campaign"]
   ,players:"1-5",playTime:"120-180 min"
   ,complexity:2.74,bggId:223321
   ,spineColor:"#13213f",boxSize:"lg"
   ,designer:"Jakub Łapot, Przemysław Rymer, Ignacy Trzewiczek"
   ,year:2018
   ,bggRating:7.6
   ,mechanics:["Cooperative Game", "Narrative Choice / Paragraph", "Scenario / Mission / Campaign Game", "Solo / Solitaire Game", "Storytelling", "Variable Player Powers"]
   ,description:"A cooperative investigation game spanning five interconnected cases. Players are detectives at a modern agency with access to a real online database of case files, suspect profiles, and evidence reports. Each day you have a limited number of action points to visit locations, interview witnesses, or analyze evidence. The game actively encourages using the internet to cross-reference clues. Final scoring is based on how accurately you answer case questions. For players who want a detective experience that feels like actual investigative work."},

  {id:"mdt_xmen",name:"Marvel Dice Throne: X-Men"
   ,row:5,col:5,categories:["Dice", "Card Game", "Thematic"]
   ,players:"2-6",playTime:"20-40 min"
   ,complexity:2.14,bggId:403494
   ,spineColor:"#34193f",boxSize:"md"
   ,designer:"Gavan Brown, Nate Chatellier, Manny Trembley"
   ,year:2025
   ,bggRating:8.4
   ,mechanics:["Dice Rolling", "Take That", "Team-Based Game", "Variable Player Powers"],description:"Eight iconic X-Men — Wolverine, Storm, Cyclops, Rogue, Gambit, Psylocke, Iceman, and Jean Grey — each with unique dice, cards, and ability boards. On your turn, roll five hero dice up to three times, then activate abilities based on combinations rolled. Play cards from your hand to modify dice or trigger effects. Supports 1v1, team battles (2v2, 3v3), and free-for-all. Each hero's playstyle matches their comic counterpart. For Marvel fans and players who enjoy asymmetric dice-driven combat."},

  {id:"kelp_expansion",name:"Kelp: Brilliant Behaviours"
   ,row:5,col:5,categories:["Strategy", "Thematic"]
   ,players:"2",playTime:"45-60 min"
   ,complexity:2.25,bggId:405987
   ,spineColor:"#314e36",boxSize:"md"
   ,designer:"Carl Robinson"
   ,year:2024
   ,mechanics:["Area Movement","Deck, Bag, and Pool Building","Dice Rolling","Hidden Movement"]
   ,bggRating:7.9,description:"Six mini-expansions for Kelp, each adding a new mechanical twist to the asymmetric Shark vs Octopus duel. Modules include a rideable jellyfish, board-manipulating zones for the Shark, and new ability cards. They can be used individually, combined, or stacked for increasingly complex games. Requires the base game. For players who want more variety and replayability in their Kelp matches."},

  {id:"dune_immortality",name:"Dune: Imperium - Immortality"
   ,row:5,col:6,categories:["Strategy", "Deck Building", "Worker Placement", "Thematic"]
   ,players:"1-4",playTime:"60-120 min"
   ,complexity:3.33,bggId:367466
   ,spineColor:"#1b1b3f",boxSize:"md"
   ,designer:"Paul Dennen"
   ,year:2022
   ,bggRating:8.5
   ,mechanics:["Card Play Conflict Resolution", "Deck, Bag, and Pool Building", "Force Commitment", "Open Drafting", "Race", "Solo / Solitaire Game"]
   ,description:"An expansion for Dune: Imperium introducing the Bene Tleilax faction. New mechanics include specimen harvesting, grafting cards together for stronger effects, and hiring Face Dancer spies. Adds new board spaces, cards, and a research track for genetic science. Integrates with the base game and other expansions. For players who want a new faction and more strategic depth in their Dune: Imperium sessions."},

  {id:"spirit_ff",name:"Spirit Island: Feather & Flame"
   ,row:5,col:6,categories:["Co-op", "Strategy", "Thematic"]
   ,players:"1-4",playTime:"90-120 min"
   ,complexity:4.55,bggId:356510
   ,spineColor:"#7f6e2d",boxSize:"md"
   ,designer:"R. Eric Reuss"
   ,year:2022
   ,bggRating:9.0
   ,mechanics:["Cooperative Game", "Hand Management", "Modular Board", "Open Drafting", "Simultaneous Action Selection", "Variable Player Powers"],description:"A collection of promotional content for Spirit Island, bundling promo spirits and power cards released over time. Each new spirit has unique innate powers and growth options, expanding the roster of playable spirits. Compatible with the base game and all expansions. For Spirit Island enthusiasts who want to maximize the variety of spirits available."},

  {id:"spirit_bc",name:"Spirit Island: Branch & Claw"
   ,row:5,col:6,categories:["Co-op", "Strategy", "Thematic"]
   ,players:"1-4",playTime:"90-120 min"
   ,complexity:4.24,bggId:193065
   ,spineColor:"#2c3f3f",boxSize:"md"
   ,designer:"R. Eric Reuss"
   ,year:2017
   ,bggRating:9.0
   ,mechanics:["Cooperative Game", "Hand Management", "Modular Board", "Open Drafting", "Simultaneous Action Selection", "Variable Player Powers"]
   ,description:"The first expansion for Spirit Island, adding two new spirits (Sharp Fangs Behind the Leaves and Keeper of the Forbidden Wilds), a new adversary (France), and an Event deck that introduces unpredictable invader-phase effects each turn. New tokens — disease, beasts, wilds, and strife — give spirits additional tools to disrupt invaders. Requires the base game. For players who want more variety and unpredictability in their Spirit Island games."},

  {id:"coffee_roaster",name:"Coffee Roaster"
   ,row:5,col:6,categories:["Solo", "Strategy"]
   ,players:"1",playTime:"10-30 min"
   ,complexity:2.17,bggId:196526
   ,spineColor:"#7f6c54",boxSize:"md"
   ,designer:"Saashi"
   ,year:2015
   ,bggRating:7.3
   ,mechanics:["Deck, Bag, and Pool Building", "Memory", "Once-Per-Game Abilities", "Push Your Luck", "Solo / Solitaire Game", "Variable Set-up"]
   ,description:"A solo bag-building game about roasting coffee to perfection. You select a bean variety, fill a bag with tokens matching its profile, then draw tokens each round to advance their roast level. At the end, you taste-test by drawing a final hand — matching the ideal roast level and minimizing defects scores points. Push your luck: more draws mean better control but risk over-roasting. For solo gamers who enjoy push-your-luck with a cozy, thematic wrapper."},

  {id:"l_project",name:"Project L"
   ,row:5,col:6,categories:["Strategy", "Abstract"]
   ,players:"1-4",playTime:"20-40 min"
   ,complexity:1.56,bggId:260180
   ,spineColor:"#24667b",boxSize:"md"
   ,designer:"Michal Mikeš, Jan Soukal, Adam Španěl"
   ,year:2020
   ,bggRating:7.4
   ,mechanics:["Action Points", "Contracts", "Open Drafting", "Pattern Building", "Resource Queue", "Solo / Solitaire Game"],description:"A fast-paced puzzle game with acrylic Tetris-shaped pieces. On your turn, take one of three actions: claim a puzzle card from the display, place a piece on one of your puzzles, or upgrade a piece to a larger shape. Completed puzzles reward you with new pieces and points. The engine builds quickly — small pieces become bigger ones that fill puzzles faster. Games last 20-30 minutes. For players who enjoy spatial puzzles with engine-building efficiency."},

  {id:"targi",name:"Targi"
   ,row:5,col:6,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"2",playTime:"60 min"
   ,complexity:2.34,bggId:118048
   ,spineColor:"#24323f",boxSize:"md"
   ,designer:"Andreas Steiger"
   ,year:2012
   ,bggRating:7.6
   ,mechanics:["End Game Bonuses", "Modular Board", "Open Drafting", "Pattern Building", "Set Collection", "Square Grid"]
   ,description:"A two-player worker placement game set among Tuareg desert tribes. Players place three workers along the outer edges of a 5x5 card grid, then claim the inner cards at the intersections of their workers' rows and columns. Cards provide resources (dates, salt, pepper, gold) or tribe members that form scoring tableaux. A robber token blocks one edge space each round, shifting available options. Tight, clever, and plays in about an hour. For couples or duos who enjoy spatial strategy and indirect competition."},

  {id:"hallertau",name:"Hallertau"
   ,row:6,col:1,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"1-4",playTime:"50-140 min"
   ,complexity:3.29,bggId:300322
   ,spineColor:"#132c3f",boxSize:"lg"
   ,designer:"Uwe Rosenberg"
   ,year:2020
   ,bggRating:7.8
   ,mechanics:["Action Points", "Advantage Token", "Automatic Resource Growth", "Contracts", "End Game Bonuses", "Hand Management"]
   ,description:"Set in 19th-century Bavaria, players manage a small village in the world's largest hop-growing region. Each round, workers are placed on a shared action board to farm crops, tend sheep, and supply local craftsmen. Resources fill contract boards covering income slots, and contract cards scored at game end require specific goods combinations. An Uwe Rosenberg design that focuses on the tension between expanding your fields and fulfilling demands. For players who enjoy pastoral worker placement with tight resource management."},

  {id:"mu_xmen",name:"Marvel United: X-Men"
   ,row:6,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-5",playTime:"40 min"
   ,complexity:1.99,bggId:336382
   ,spineColor:"#14343f",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang, Francesco Rugerfred Sedda"
   ,year:2021
   ,bggRating:8.0
   ,mechanics:["Cooperative Game", "Hand Management", "Modular Board", "Solo / Solitaire Game", "Team-Based Game", "Variable Player Powers"]
   ,description:"A standalone Marvel United game featuring X-Men heroes and classic X-Men villains. Players cooperate by chaining hero cards in sequence, each card's actions adding to those of the previous player's play. Heroes move around modular location boards, fight enemies, and counter the villain's escalating master plan. Includes team mode rules and a solo variant. For fans of the Marvel United system who want X-Men characters and stories."},

  {id:"marvel_united",name:"Marvel United"
   ,row:6,col:1,categories:["Co-op", "Thematic", "Family"]
   ,players:"1-4",playTime:"40 min"
   ,complexity:1.84,bggId:298047
   ,spineColor:"#32243f",boxSize:"md"
   ,designer:"Andrea Chiarvesio, Eric M. Lang"
   ,year:2020
   ,bggRating:7.5
   ,mechanics:["Cooperative Game", "Hand Management", "Modular Board", "Solo / Solitaire Game", "Variable Player Powers"]
   ,description:"The base Marvel United cooperative game, featuring iconic heroes against villains like Red Skull, Taskmaster, and Ultron. Each hero has a unique deck of cards; on your turn you play one, and its actions stack with the card played before it. Locations generate threats each round, and the villain advances their master plan. Fast, accessible, and driven by the card-chaining mechanic. An entry point to the Marvel United system, supporting solo play and up to four players."},

  {id:"clank_catacombs",name:"Clank!: Catacombs"
   ,row:6,col:2,categories:["Strategy", "Deck Building", "Thematic", "Adventure"]
   ,players:"2-4",playTime:"45-90 min"
   ,complexity:2.48,bggId:365717
   ,spineColor:"#362c3f",boxSize:"lg"
   ,designer:"Paul Dennen"
   ,year:2022
   ,bggRating:8.2
   ,mechanics:["Deck, Bag, and Pool Building", "Delayed Purchase", "End Game Bonuses", "Map Addition", "Map Deformation", "Modular Board"]
   ,description:"A standalone deck-building dungeon crawler in the Clank! series. The dungeon is built tile by tile as you explore, so the layout is never the same twice. Players buy cards to improve their deck, moving deeper to find artifacts and secrets — but every attack card generates Clank noise, filling the dragon bag. When the dragon strikes, players with the most noise take damage. Reach an artifact and escape before the dragon kills you. For players who enjoy deck-building combined with push-your-luck dungeon exploration."},

  {id:"witcher_skellige",name:"The Witcher: Old World - Skellige"
   ,row:6,col:2,categories:["Strategy", "Thematic"]
   ,players:"1-5",playTime:"90-150 min"
   ,complexity:2.33,bggId:340529
   ,spineColor:"#1f343f",boxSize:"md"
   ,designer:"Łukasz Woźniak"
   ,year:2023
   ,bggRating:8.2
   ,mechanics:["Card Play Conflict Resolution", "Deck, Bag, and Pool Building", "Dice Rolling", "Events", "Hand Management", "Increase Value of Unchosen Resources"],description:"A board expansion for The Witcher: Old World, adding the Skellige archipelago to the main map. New sea routes connect the islands, adding travel options and new location tokens to explore. Characters can sail between islands, hunt sea monsters, and follow island-specific quests. Adds new cards for all character types and additional location events. Requires the base game. For groups who want a larger map and more content in their Witcher campaigns."},

  {id:"witcher_wild_hunt",name:"The Witcher: Old World - Wild Hunt"
   ,row:6,col:2,categories:["Strategy", "Thematic", "Adventure"]
   ,players:"1-5",playTime:"90-150 min"
   ,complexity:3.2,bggId:340983
   ,spineColor:"#1b2d3f",boxSize:"lg"
   ,designer:"Łukasz Woźniak"
   ,year:2023
   ,bggRating:8.3
   ,mechanics:["Card Play Conflict Resolution", "Cooperative Game", "Deck, Bag, and Pool Building", "Dice Rolling", "Events", "Hand Management"]
   ,description:"A large expansion for The Witcher: Old World introducing a fully cooperative and solo mode. The Wild Hunt — spectral riders from another world — advance across the continent each round according to their own movement rules. Players must cooperate to defeat Wild Hunt warriors and ultimately face their leader. Adds new character cards, locations, and a dedicated cooperative board. Requires the base game. For groups who prefer cooperative play or want a formidable shared enemy."},

  {id:"planet_unknown",name:"Planet Unknown"
   ,row:6,col:2,categories:["Strategy", "Puzzle"]
   ,players:"1-6",playTime:"60-80 min"
   ,complexity:2.25,bggId:258779
   ,spineColor:"#1f3f34",boxSize:"lg"
   ,designer:"Ryan Lambert, Adam Rehberg"
   ,year:2022
   ,bggRating:7.8
   ,mechanics:["End Game Bonuses", "Events", "Grid Coverage", "Grid Movement", "Hidden Victory Points", "Map Addition"]
   ,description:"Players colonize planets by placing polyomino tiles on their personal planet boards. Each round, a shared rotating space station presents tile options; everyone drafts simultaneously, so there is no downtime. Tiles cover two resource tracks at once, triggering bonuses as the tracks advance. Rovers explore the planet unlocking new areas. Includes six different planet boards with different terrain layouts and asymmetric conditions. For groups who want a competitive tile-placement game where everyone plays at the same time."},

  {id:"power_grid",name:"Power Grid"
   ,row:6,col:3,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"2-6",playTime:"120 min"
   ,complexity:3.25,bggId:2651
   ,spineColor:"#353f2c",boxSize:"md"
   ,designer:"Friedemann Friese"
   ,year:2004
   ,bggRating:7.8
   ,mechanics:["Auction / Bidding", "Auction: Turn Order Until Pass", "Catch the Leader", "Income", "Market", "Network and Route Building"]
   ,description:"Players are energy companies competing to power the most cities. Each round has five phases: determine turn order, auction power plants, buy fuel at fluctuating commodity prices, build network connections between cities, and generate power. The player with the most cities powered wins — but the player in the lead pays more for resources and goes last at auction. A clean, deeply strategic Euro with a catch-up mechanism baked into every round. For players who enjoy economic games with tight resource and network management."},

  {id:"mind_mgmt",name:"Mind MGMT: The Psychic Espionage Game"
   ,row:6,col:3,categories:["Strategy", "Deduction", "Thematic"]
   ,players:"1-5",playTime:"60 min"
   ,complexity:2.92,bggId:284653
   ,spineColor:"#7f7358",boxSize:"md"
   ,designer:"Jay Cormier, Sen-Foong Lim"
   ,year:2021
   ,bggRating:7.8
   ,mechanics:["Cooperative Game", "Deduction", "Grid Movement", "Hidden Movement", "Paper-and-Pencil", "Point to Point Movement"]
   ,description:"An asymmetric hidden movement game. One player controls a Recruiter moving secretly around a city grid, visiting safe houses and recruiting agents. The other players are Agents trying to locate and catch the Recruiter before time runs out. The Recruiter writes clues on a notepad — these clues are genuine hints but require interpretation. Agents share information and move cooperatively. The information asymmetry and deduction create sustained tension. For groups who enjoy hidden movement games and the give-and-take of one-vs-many formats."},

  {id:"alchemists",name:"Alchemists"
   ,row:6,col:3,categories:["Strategy", "Euro", "Deduction"]
   ,players:"2-4",playTime:"120 min"
   ,complexity:3.92,bggId:161970
   ,spineColor:"#3f2213",boxSize:"lg"
   ,designer:"Matúš Kotry"
   ,year:2014
   ,bggRating:7.6
   ,mechanics:["Action Drafting", "Constrained Bidding", "Deduction", "End Game Bonuses", "Events", "Hand Management"]
   ,description:"Two to four alchemists compete to identify the properties of eight ingredients by mixing them into potions. A companion app evaluates your experiments privately, giving partial information you use to deduce formulas. You then publish theories to score points — but if a rival tests your theory with conflicting evidence, your reputation suffers. A mix of deduction, worker placement, and academic rivalry. For players who enjoy logical deduction with a competitive, reputation-at-risk scoring layer."},

  {id:"clans_of_caledonia",name:"Clans of Caledonia"
   ,row:6,col:3,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"1-4",playTime:"30-120 min"
   ,complexity:3.47,bggId:216132
   ,spineColor:"#3f4822",boxSize:"md"
   ,designer:"Juma Al-JouJou"
   ,year:2017
   ,bggRating:7.9
   ,mechanics:["Commodity Speculation", "Contracts", "Hexagon Grid", "Income", "Market", "Modular Board"]
   ,description:"Set in 19th-century Scotland during the shift from farming to industry, players lead clans — Campbells, Gordons, MacLeans, and others — each with a unique starting ability. Expand your territory on a modular hex map, produce goods, and trade on a shared market that fluctuates with supply and demand. Export contracts require specific goods combinations and score heavily at game end. Player proximity generates trade opportunities and competition. For players who enjoy economic Euros with meaningful player interaction and faction asymmetry."},

  {id:"twilight_struggle",name:"Twilight Struggle"
   ,row:6,col:3,categories:["Strategy", "Area Control", "Card Game"]
   ,players:"2",playTime:"120-180 min"
   ,complexity:3.61,bggId:12333
   ,spineColor:"#6f2621",boxSize:"md"
   ,designer:"Ananda Gupta, Jason Matthews"
   ,year:2005
   ,bggRating:8.2
   ,mechanics:["Action / Event", "Advantage Token", "Area Majority / Influence", "Campaign / Battle Card Driven", "Dice Rolling", "Events"]
   ,description:"The Cold War from 1945 to 1989, played as a card-driven duel between the US and USSR. Each card is a historical event — played for its event effect or for operations points to spread influence on the world map. The catch: your opponent's cards can also trigger their events, so every hand is full of difficult choices. The DEFCON track escalates if either side is too aggressive, and dropping to DEFCON 1 loses the game instantly. Long, tense, and historically resonant. For players who enjoy card-driven wargames and strategic bluffing."},

  {id:"smartphone",name:"Smartphone Inc."
   ,row:6,col:4,categories:["Strategy", "Euro", "Engine Building"]
   ,players:"1-5",playTime:"60-90 min"
   ,complexity:2.81,bggId:246684
   ,spineColor:"#3f2c2c",boxSize:"md"
   ,designer:"Ivan Lashin"
   ,year:2018
   ,bggRating:7.6
   ,mechanics:["Action Queue", "Area Majority / Influence", "Layering", "Network and Route Building", "Simultaneous Action Selection", "Solo / Solitaire Game"]
   ,description:"Players run smartphone companies in the early days of the mobile industry. Each round, everyone simultaneously programs their turn by stacking planning tiles — each tile sets one decision: price, production volume, tech research, or geographic expansion. All decisions resolve at once, creating market competition for regions and price points. Five rounds, then final scoring based on market share and research. For players who enjoy simultaneous action selection and economic games where reading the competition matters."},

  {id:"burano",name:"Burano"
   ,row:6,col:4,categories:["Strategy", "Euro"]
   ,players:"2-4",playTime:"90-120 min"
   ,complexity:3.79,bggId:181260
   ,spineColor:"#7b422f",boxSize:"md"
   ,designer:"Yu-Chen Tseng, Eros Lin"
   ,year:2015
   ,bggRating:6.7
   ,mechanics:["Action Points", "Area Majority / Influence", "Pick-up and Deliver", "Point to Point Movement", "Set Collection"]
   ,description:"Players develop the colorful island of Burano near Venice by building houses, managing fishing boats, and producing lace. A point-to-point movement system sends workers between island locations to gather fish, thread, and goods. Completed houses and fulfilled orders generate prestige. A moderate Euro with set collection and area scoring. For players who enjoy resource conversion games with a Mediterranean flavor and attractive components."},

  {id:"azul",name:"Azul"
   ,row:6,col:4,categories:["Family", "Abstract", "Puzzle"]
   ,players:"2-4",playTime:"30-45 min"
   ,complexity:1.77,bggId:230802
   ,spineColor:"#7f2926",boxSize:"md"
   ,designer:"Michael Kiesling"
   ,year:2017
   ,bggRating:7.7
   ,mechanics:["Chaining", "End Game Bonuses", "Grid Coverage", "Open Drafting", "Pattern Building", "Set Collection"]
   ,description:"Players draft ceramic azulejo tiles from factory displays and arrange them on their personal pattern walls. Each round, all tiles on a factory must be taken together, and leftover tiles accumulate in a central pool. Completing rows and columns on your wall scores points; tiles you place but cannot immediately use become penalties. Clean drafting mechanics with meaningful decisions and significant player interaction. For players who enjoy abstract games with tactical depth and minimal rules overhead."},

  {id:"founders_of_gloomhaven",name:"Founders of Gloomhaven"
   ,row:6,col:4,categories:["Strategy", "Euro"]
   ,players:"1-4",playTime:"90-120 min"
   ,complexity:4.12,bggId:214032
   ,spineColor:"#3f3828",boxSize:"lg"
   ,designer:"Isaac Childres"
   ,year:2018
   ,bggRating:6.6
   ,mechanics:["Action Retrieval", "Auction / Bidding", "Deck, Bag, and Pool Building", "Follow", "Hand Management", "Network and Route Building"]
   ,description:"A competitive city-building game set in the Gloomhaven universe, centuries before the dungeon-crawling campaigns. Players represent fantasy races vying to gain influence over the founding city. Each turn, play action cards to place resource tokens on the city grid, then build roads and structures connecting those resources. A contribution system lets you piggyback on others' placements, creating indirect cooperation within competition. For strategy gamers who enjoy network building and the Gloomhaven lore."},

  {id:"on_mars",name:"On Mars"
   ,row:6,col:5,categories:["Strategy", "Euro", "Worker Placement"]
   ,players:"1-4",playTime:"90-150 min"
   ,complexity:4.63,bggId:184267
   ,spineColor:"#431414",boxSize:"xl"
   ,designer:"Vital Lacerda"
   ,year:2020
   ,bggRating:8.2
   ,mechanics:["Contracts", "Delayed Purchase", "End Game Bonuses", "Hexagon Grid", "Income", "Movement Points"]
   ,description:"Players lead private companies colonizing Mars alongside a UN agency. The central mechanism is a two-zone action system: some actions happen on the surface, others in orbit, and moving between them costs a turn. You build habitats, oxygen generators, and water systems, fulfilling colonization contracts for points. Specialists on your player board unlock stronger action variants. A long, complex Vital Lacerda design where the timing of zone transitions is as important as the buildings you place."},

  {id:"lisboa",name:"Lisboa"
   ,row:6,col:5,categories:["Strategy", "Euro"]
   ,players:"1-4",playTime:"60-120 min"
   ,complexity:4.57,bggId:161533
   ,spineColor:"#7f7259",boxSize:"xl"
   ,designer:"Vital Lacerda"
   ,year:2017
   ,bggRating:8.2
   ,mechanics:["Area Majority / Influence", "Hand Management", "Multi-Use Cards", "Open Drafting", "Set Collection", "Solo / Solitaire Game"]
   ,description:"Players help rebuild Lisbon after the catastrophic 1755 earthquake under the direction of the Marques of Pombal. Each turn, play a card to perform one of four action types: construct buildings, open shops, send ships to trade, or influence nobles. Buildings and shops generate income and open additional actions. The Writ track advances the rebuilding timeline, triggering scoring phases. Interlocking systems with careful hand and resource management. A heavy Vital Lacerda design for experienced gamers who enjoy layered economic engines."},

  {id:"terra_mystica",name:"Terra Mystica"
   ,row:6,col:5,categories:["Strategy", "Euro", "Area Control"]
   ,players:"2-5",playTime:"60-150 min"
   ,complexity:3.97,bggId:120677
   ,spineColor:"#384b59",boxSize:"xl"
   ,designer:"Jens Drögemüller, Helge Ostertag"
   ,year:2012
   ,bggRating:8.0
   ,mechanics:["Chaining", "End Game Bonuses", "Hexagon Grid", "Income", "Increase Value of Unchosen Resources", "Network and Route Building"]
   ,description:"Fourteen asymmetric factions compete on a shared hex map, each bound to one terrain type. Expanding to adjacent hexes requires terraforming them to your home type — a costly but necessary investment. Building structures advances income and power, and proximity to other factions generates power tokens that fuel bonus actions. Four cult tracks offer end-game bonuses. No luck — every outcome is deterministic. For players who enjoy highly strategic games where faction choice fundamentally changes how you play."},

  {id:"the_crew_deep_sea",name:"The Crew: Mission Deep Sea"
   ,row:6,col:5,categories:["Co-op", "Card Game", "Family"]
   ,players:"2-5",playTime:"20 min"
   ,complexity:2.05,bggId:324856
   ,spineColor:"#133f3f",boxSize:"md"
   ,designer:"Thomas Sing"
   ,year:2021
   ,bggRating:8.1
   ,mechanics:["Communication Limits", "Cooperative Game", "Deduction", "Hand Management", "Scenario / Mission / Campaign Game", "Trick-taking"]
   ,description:"A cooperative trick-taking game where players must fulfill specific task cards each mission. Tasks assign certain cards to certain players — someone must win the 4 of blue, someone else must avoid winning any yellow cards, and so on. Only one clue token per player per round can be shared, communicating limited information about your hand. Thirty-two escalating missions, each introducing new constraints. For players who enjoy trick-taking and cooperative puzzles that reward precise communication and planning."},

  {id:"paleo",name:"Paleo"
   ,row:6,col:6,categories:["Co-op", "Thematic", "Card Game"]
   ,players:"2-4",playTime:"45-60 min"
   ,complexity:2.66,bggId:300531
   ,spineColor:"#596c7f",boxSize:"md"
   ,designer:"Peter Rustemeyer"
   ,year:2020
   ,bggRating:7.7
   ,mechanics:["Action / Event", "Cooperative Game", "Deck, Bag, and Pool Building", "Memory", "Scenario / Mission / Campaign Game", "Simultaneous Action Selection"]
   ,description:"A cooperative Stone Age survival game played over a series of missions. Each round, players select card stacks from a shared pool without knowing what they contain, then reveal them simultaneously to face dangers, gather resources, or discover tools. Humans die permanently if the skull track fills. The long-term goal is completing a cave painting requiring specific materials collected over many sessions. For groups who enjoy narrative cooperative games with meaningful risk and resource decisions."},

  {id:"marvel_champions",name:"Marvel Champions: The Card Game"
   ,row:6,col:6,categories:["Co-op", "Card Game", "Thematic", "Deck Building"]
   ,players:"1-4",playTime:"45-90 min"
   ,complexity:2.96,bggId:285774
   ,spineColor:"#2c2c3f",boxSize:"lg"
   ,designer:"Michael Boggs, Nate French, Caleb Grace"
   ,year:2019
   ,bggRating:8.1
   ,mechanics:["Card Play Conflict Resolution", "Cooperative Game", "Deck Construction", "Events", "Hand Management", "Interrupts"]
   ,description:"A cooperative living card game where players take on Marvel hero identities. Each hero has two forms — hero and alter-ego — with different hand sizes and abilities. On your turn, play cards from your hand to attack, thwart villain schemes, or use special powers, then ready for the villain's counterattack phase. Each villain has a unique modular encounter deck. Heroes are built from a fixed identity set plus a chosen aspect deck (aggression, protection, leadership, justice). Expansions continually add heroes and villains. For players who enjoy deckbuilding customization in a cooperative setting."},

  {id:"aeons_end",name:"Aeon's End"
   ,row:6,col:6,categories:["Co-op", "Deck Building", "Thematic"]
   ,players:"1-4",playTime:"60 min"
   ,complexity:2.8,bggId:191189
   ,spineColor:"#2b3943",boxSize:"lg"
   ,designer:"Jenny Iglesias, Nick Little (I), Kevin Riley"
   ,year:2016
   ,bggRating:7.9
   ,mechanics:["Chit-Pull System", "Cooperative Game", "Deck, Bag, and Pool Building", "Delayed Purchase", "Hand Management", "Open Drafting"]
   ,description:"Breach mages defend the underground city of Gravehold from Nameless creatures. A cooperative deck-builder with one distinctive rule: you never shuffle your discard pile. Instead, you choose the order cards go back to your deck, making future turns predictable and planning essential. Breaches must be opened and focused to cast powerful spells against the Nemesis. Turn order is randomized each round, adding tension. Different mages and Nemesis combinations produce very different games. For players who want cooperative deck-building with deliberate, calculated decision-making."},
  // ══════════════════════════════════════════
  // OTHER SIDE GAMES (blue glow, otherSide)
  // ══════════════════════════════════════════

  // ── Row 2, Col 4 ──
  {id:"witcher_old_world_os",name:"The Witcher: Old World",bggId:331106,year:2023,designer:"Łukasz Woźniak",row:2,col:4,otherSide:true,categories:["Adventure","Thematic"],players:"1-5",playTime:"90-150 min",complexity:2.88,bggRating:7.9,spineColor:"#2e4a1e",boxSize:"sm",mechanics:["Deck Building","Variable Player Powers","Hand Management"],description:"Competitive adventure game set in the Witcher universe before the saga. Players train as witcher apprentices, exploring the Continent, fighting monsters, and developing combat skills through deck building."},
  {id:"etherfields_os",name:"Etherfields",bggId:280794,year:2020,designer:"Michał Oracz",row:2,col:4,otherSide:true,categories:["Adventure","Thematic","Co-op"],players:"1-4",playTime:"90-180 min",complexity:3.59,bggRating:7.8,spineColor:"#4a2060",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Hand Management","Variable Player Powers"],description:"A dreamworld exploration game where players navigate surreal landscapes through an innovative map system. Each dream has its own logic and rules that players must discover through experimentation and storytelling."},
  {id:"marvel_zombies_os",name:"Marvel Zombies: A Zombicide Game",bggId:351817,year:2023,designer:"Fabio Cury, Michael Shinall",row:2,col:4,otherSide:true,categories:["Thematic","Co-op","Adventure"],players:"1-6",playTime:"60 min",complexity:2.35,bggRating:7.9,spineColor:"#8b0000",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Modular Board","Variable Player Powers"],description:"A Zombicide game where players control zombie Marvel heroes hunting for flesh across modular maps. Balancing hunger and evolving zombie powers while completing mission objectives."},
  {id:"the_7th_citadel",name:"The 7th Citadel",bggId:286063,year:2024,designer:"Ludovic Roudy, Bruno Sautter",row:2,col:4,otherSide:true,categories:["Adventure","Co-op"],players:"1-4",playTime:"5-1000 min",complexity:3,bggRating:8.3,spineColor:"#3d1f5e",boxSize:"sm",mechanics:["Cooperative Game","Hand Management","Map Addition","Push Your Luck","Solo / Solitaire Game","Variable Player Powers"],description:"A cooperative card-based exploration and adventure game set in a post-apocalyptic medieval fantasy world, from the creators of The 7th Continent. You play as a slave-gardener who has escaped the Citadel of Necrodruid Ninidazir', only to face an even greater Threat. Gradually unveil the board using numbered terrain and event cards, interact with inhabitants, and build a city to signal renewal. Challenges are resolved by drawing cards in a push-your-luck system. Features persistent campaign play across multiple episodes, a save-anywhere mechanism, and hundreds of hours of content."},  {id:"cthulhu_dmd_s2",name:"Cthulhu: Death May Die – Season 2",bggId:256972,year:2019,designer:"Rob Daviau, Eric M. Lang",row:2,col:4,otherSide:true,categories:["Adventure","Thematic","Co-op"],players:"1-5",playTime:"90-120 min",complexity:2.8,bggRating:8.7,spineColor:"#1a1a2e",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Modular Board","Variable Player Powers"],description:"Season 2 expands Cthulhu: Death May Die with new investigators, Elder Gods, and episode tiles. Players stop Lovecraftian horrors while deliberately driving their investigators insane to gain power."},
  {id:"slay_the_spire_os",name:"Slay the Spire: The Board Game",bggId:338960,year:2024,designer:"Gary Dworetsky, Anthony Giovannetti, Casey Yano",row:2,col:4,otherSide:true,categories:["Co-op","Deck Building","Adventure"],players:"1-4",playTime:"30-150 min",complexity:2.91,bggRating:8.5,spineColor:"#1a2a3a",boxSize:"sm",mechanics:["Cooperative Game","Deck Building","Hand Management","Variable Player Powers"],description:"Faithful adaptation of the hit video game. Players ascend a spire of increasingly dangerous encounters, building a unique deck of cards through choices at each node of a branching map."},
  {id:"earthborne_rangers_os",name:"Earthborne Rangers",bggId:342900,year:2023,designer:"Andrew Fischer, Brooks Flugaur-Leavitt, Andrew Navaro, Adam Sadler, Brady Sadler",row:2,col:4,otherSide:true,categories:["Adventure","Co-op"],players:"1-4",playTime:"60-240 min",complexity:3.48,bggRating:8.0,spineColor:"#4a7c59",boxSize:"sm",mechanics:["Cooperative Game","Deck Building","Hand Management","Variable Player Powers"],description:"A cooperative open-world card game set in a lush far-future Earth. Rangers explore, build relationships, and protect communities using a living card system where players craft their own decks."},
  {id:"sleeping_gods_ds",name:"Sleeping Gods: Distant Skies",bggId:358320,year:2023,designer:"Ryan Laukat",row:2,col:4,otherSide:true,categories:["Adventure","Co-op"],players:"1-4",playTime:"60-600 min",complexity:3.0,bggRating:8.3,spineColor:"#2a4a6a",boxSize:"sm",mechanics:["Cooperative Game","Storytelling","Hand Management","Variable Player Powers"],description:"A cooperative storybook adventure where players explore a vast world map, encounter strange civilizations, and uncover mysteries. Each session continues a persistent campaign with hundreds of branching narrative paths."},
  {id:"wonderlands_war_os",name:"Wonderland's War",bggId:227935,year:2022,designer:"Tim Eisner, Ben Eisner, Ian Moss",row:2,col:4,otherSide:true,categories:["Strategy","Thematic"],players:"2-5",playTime:"45-125 min",complexity:3.05,bggRating:8.0,spineColor:"#6a1b6a",boxSize:"sm",mechanics:["Bag Building","Area Control","Worker Placement","Variable Player Powers"],description:"Players are Wonderland factions preparing for war through a tea party draft phase, then battling for territory using a bag-building combat system with push-your-luck chip draws."},
  // ── Row 2, Col 6 ──
  {id:"heat_pedal_os",name:"Heat: Pedal to the Metal",bggId:366013,year:2022,designer:"Asger Aleksandrov Granerud, Daniel Skjold Pedersen",row:2,col:6,otherSide:true,categories:["Racing","Strategy"],players:"1-6",playTime:"30-60 min",complexity:2.2,bggRating:7.9,spineColor:"#cc3300",boxSize:"sm",mechanics:["Hand Management","Push Your Luck","Simultaneous Action Selection"],description:"A racing game where players manage a hand of speed cards and a personal heat engine. Pushing too hard overheats your car, but playing it safe lets rivals pull ahead."},
  {id:"furnace_os",name:"Furnace",bggId:318084,year:2020,designer:"Ivan Lashin",row:2,col:6,otherSide:true,categories:["Strategy","Euro","Engine Building"],players:"2-4",playTime:"30-60 min",complexity:2.32,bggRating:7.4,spineColor:"#c0392b",boxSize:"sm",mechanics:["Auction","Engine Building","Resource Management"],description:"An engine-building auction game set during the industrial revolution. Players bid on factory cards, but losing bids grant compensation resources, making every auction outcome strategically valuable."},
  {id:"splendor_marvel_os",name:"Splendor: Marvel",bggId:293296,year:2020,designer:"Marc André",row:2,col:6,otherSide:true,categories:["Strategy","Card Game","Family"],players:"2-4",playTime:"30 min",complexity:1.8,bggRating:7.6,spineColor:"#1a1a8b",boxSize:"sm",mechanics:["Card Drafting","Engine Building","Set Collection"],description:"A Marvel-themed reimplementation of Splendor where players collect infinity gems to recruit heroes and complete the Infinity Gauntlet. Adds new Avengers Assemble location tiles."},
  {id:"legacy_of_yu_os",name:"Legacy of Yu",bggId:354934,year:2023,designer:"Shem Phillips",row:2,col:6,otherSide:true,categories:["Solo","Strategy"],players:"1-1",playTime:"60 min",complexity:2.88,bggRating:8.1,spineColor:"#b8860b",boxSize:"sm",mechanics:["Deck Building","Hand Management","Campaign"],description:"A solo-only campaign game about the legendary Chinese figure Yu the Great. Players manage workers and resources across a branching campaign to build canals and control devastating floods."},
  {id:"pandemic_legacy_s1_os",name:"Pandemic Legacy: Season 1",bggId:161936,year:2015,designer:"Rob Daviau, Matt Leacock",row:2,col:6,otherSide:true,categories:["Co-op","Strategy","Campaign"],players:"2-4",playTime:"60 min",complexity:2.8,bggRating:8.6,spineColor:"#2a1a00",boxSize:"sm",mechanics:["Cooperative Game","Legacy Game","Hand Management","Variable Player Powers"],description:"A campaign evolution of Pandemic where the world map, rules, and characters permanently change across a 12-month story. Stickers, destroyed cities, and evolving abilities create a deeply personal narrative."},
  {id:"terracotta_army_os",name:"Terracotta Army",bggId:350458,year:2022,designer:"Przemysław Fornal, Adam Kwapiński",row:2,col:6,otherSide:true,categories:["Strategy","Euro","Worker Placement"],players:"1-4",playTime:"90-120 min",complexity:3.3,bggRating:7.4,spineColor:"#8b6914",boxSize:"sm",mechanics:["Worker Placement","Area Control","Resource Management"],description:"Players craft the famous Terracotta Army of Emperor Qin, placing warrior figures in the mausoleum while managing resources and competing for the emperor's favor through area majority."},
  {id:"kings_dilemma_os",name:"The King's Dilemma",bggId:245655,year:2019,designer:"Hjalmar Hach, Lorenzo Silva",row:2,col:6,otherSide:true,categories:["Strategy","Thematic"],players:"3-5",playTime:"45-60 min",complexity:2.2,bggRating:7.6,spineColor:"#c8a850",boxSize:"sm",mechanics:["Negotiation","Voting","Legacy Game","Hand Management"],description:"A legacy negotiation game where players are members of the king's council voting on dilemmas that permanently shape the kingdom. Secret agendas and alliances shift across an evolving political narrative."},
  {id:"lands_of_galzyr_os",name:"Lands of Galzyr",bggId:281474,year:2022,designer:"Seppo Kuukasjärvi, Sami Laakso",row:2,col:6,otherSide:true,categories:["Adventure","Thematic"],players:"1-4",playTime:"60-150 min",complexity:1.71,bggRating:7.9,spineColor:"#5c3317",boxSize:"sm",mechanics:["Dice Rolling","Variable Player Powers","Storytelling"],description:"An open-world adventure game with anthropomorphic animal characters exploring a fantasy world through an ever-evolving story. Decisions are remembered across sessions with no campaign end."},
  // ── Row 3, Col 2 ──
  {id:"codenames_os",name:"Codenames",bggId:178900,year:2015,designer:"Vlaada Chvátil",row:3,col:2,otherSide:true,categories:["Party","Card Game","Deduction"],players:"2-8",playTime:"15 min",complexity:1.3,bggRating:7.6,spineColor:"#b22222",boxSize:"sm",mechanics:["Communication Limits","Team-Based Game"],description:"Two rival spymasters give one-word clues to guide teammates in identifying secret agents hidden among a grid of word cards. A modern classic of deductive word play."},
  {id:"decrypto_os",name:"Decrypto",bggId:225694,year:2018,designer:"Thomas Dagenais-Lespérance",row:3,col:2,otherSide:true,categories:["Party","Deduction"],players:"3-8",playTime:"15-45 min",complexity:1.8,bggRating:7.7,spineColor:"#1a1a1a",boxSize:"sm",mechanics:["Communication Limits","Deduction","Team-Based Game"],description:"Teams give coded clues to communicate secret numbers while opponents try to intercept the pattern. Getting intercepted twice loses; miscommunicating twice also loses."},
  {id:"so_clover_os",name:"So Clover!",bggId:329839,year:2021,designer:"François Romain",row:3,col:2,otherSide:true,categories:["Party","Co-op"],players:"3-6",playTime:"30 min",complexity:1.12,bggRating:7.5,spineColor:"#2e7d32",boxSize:"sm",mechanics:["Cooperative Game","Communication Limits"],description:"Players write one-word clues linking pairs of keywords on a four-leaf clover board. Others must reconstruct which words were paired from the clues alone."},
  {id:"hanamikoji_os",name:"Hanamikoji",bggId:158600,year:2013,designer:"Kota Nakayama",row:3,col:2,otherSide:true,categories:["Card Game","Abstract"],players:"2-2",playTime:"15 min",complexity:1.7,bggRating:7.5,spineColor:"#c0392b",boxSize:"sm",mechanics:["Hand Management","Set Collection"],description:"A two-player card game of elegant tension where players use four unique actions to offer gifts to geishas, always giving opponents a choice. Winning requires reading your opponent's desires."},
  {id:"the_crew_os",name:"The Crew: The Quest for Planet Nine",bggId:284083,year:2019,designer:"Thomas Sing",row:3,col:2,otherSide:true,categories:["Co-op","Card Game"],players:"2-5",playTime:"20 min",complexity:2.0,bggRating:7.7,spineColor:"#1a3a6b",boxSize:"sm",mechanics:["Cooperative Game","Trick-Taking","Communication Limits"],description:"A cooperative trick-taking game where players must win specific tricks assigned as mission tasks. Communication is severely limited, making each card play a nail-biting deduction exercise."},
  {id:"air_land_sea_os",name:"Air, Land, and Sea",bggId:247367,year:2019,designer:"Jon Perry",row:3,col:2,otherSide:true,categories:["Card Game","Strategy"],players:"2-2",playTime:"20 min",complexity:1.74,bggRating:7.5,spineColor:"#2c3e50",boxSize:"sm",mechanics:["Hand Management","Bluffing","Area Control"],description:"A tense two-player card game where players battle for control of three theaters of war with just six cards. Withdrawing early concedes fewer points, creating constant psychological pressure."},
  {id:"mind_extreme_os",name:"The Mind Extreme",bggId:287607,year:2019,designer:"Wolfgang Warsch",row:3,col:2,otherSide:true,categories:["Party","Card Game","Co-op"],players:"2-4",playTime:"20 min",complexity:1.33,bggRating:6.9,spineColor:"#ff6600",boxSize:"sm",mechanics:["Cooperative Game","Real-Time"],description:"Standalone sequel to The Mind adding ascending AND descending card piles simultaneously. No verbal communication allowed — only shared intuition and nerve."},
  {id:"avalon_os",name:"The Resistance: Avalon",bggId:128882,year:2012,designer:"Don Eskridge",row:3,col:2,otherSide:true,categories:["Party","Deduction"],players:"5-10",playTime:"30 min",complexity:1.7,bggRating:7.5,spineColor:"#1a237e",boxSize:"sm",mechanics:["Hidden Identity","Voting","Deduction","Team-Based Game"],description:"A social deduction game set in Arthurian legend. Loyal servants of Arthur must complete quests while hidden minions of Mordred try to sabotage them. Merlin knows the traitors but must stay hidden."},
  {id:"sail_os",name:"Sail",bggId:377470,year:2023,designer:"Akiyama Koryo, Kozu Yusei",row:3,col:2,otherSide:true,categories:["Co-op","Card Game"],players:"2-2",playTime:"20 min",complexity:2.21,bggRating:7.3,spineColor:"#0077b6",boxSize:"sm",mechanics:["Cooperative Game","Hand Management","Communication Limits"],description:"A two-player cooperative card game where players navigate a ship through dangerous waters. Communication is limited — you can only signal through which cards you play, not discuss strategy."},
  // ── Row 4, Col 5 ──
  {id:"sky_team_os",name:"Sky Team",bggId:373106,year:2023,designer:"Luc Rémond",row:4,col:5,otherSide:true,categories:["Co-op","Strategy"],players:"2-2",playTime:"20 min",complexity:2.04,bggRating:8.1,spineColor:"#1b3a6b",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Communication Limits"],description:"A two-player cooperative game where pilot and co-pilot must land a plane by silently assigning dice to shared controls. Communication is forbidden once dice are rolled."},
  {id:"marvel_dt_scarlet_os",name:"Marvel Dice Throne: Scarlet Witch v. Thor v. Loki v. Spider-Man",bggId:360153,year:2022,designer:"Gavan Brown, Nate Chatellier, Manny Trembley",row:4,col:5,otherSide:true,categories:["Dice","Thematic","Card Game"],players:"2-4",playTime:"20-40 min",complexity:2.44,bggRating:7.6,spineColor:"#6e2090",boxSize:"sm",mechanics:["Dice Rolling","Hand Management","Variable Player Powers"],description:"Four Marvel heroes clash in dice-powered combat. Each hero has unique dice, ability cards, and combo chains for fast tactical duels."},
  {id:"three_sisters_os",name:"Three Sisters",bggId:291845,year:2022,designer:"Ben Pinchback, Matt Riddle",row:4,col:5,otherSide:true,categories:["Dice","Strategy"],players:"1-4",playTime:"30-60 min",complexity:2.63,bggRating:7.5,spineColor:"#2e7d32",boxSize:"sm",mechanics:["Dice Rolling","Paper-and-Pencil"],description:"A roll-and-write game about companion planting: corn, beans, and squash. Players draft dice to fill their garden sheets, unlocking abilities and scoring objectives."},
  {id:"boomerang_europe_os",name:"Boomerang: Europe",bggId:300367,year:2020,designer:"Scott Almes",row:4,col:5,otherSide:true,categories:["Card Game","Family"],players:"2-4",playTime:"15-30 min",complexity:1.7,bggRating:6.8,spineColor:"#2980b9",boxSize:"sm",mechanics:["Card Drafting","Set Collection"],description:"A draft-and-write game themed around European travel. Players draft cards and mark visited countries, collecting sets of activities, landmarks, and regions for points."},
  {id:"fellowship_ring_os",name:"The Fellowship of the Ring: Trick-Taking Game",bggId:429293,year:2025,designer:"Bryan Bornmueller",row:4,col:5,otherSide:true,categories:["Card Game","Co-op"],players:"1-4",playTime:"20 min",complexity:1.8,bggRating:8.0,spineColor:"#2c1a0e",boxSize:"sm",mechanics:["Cooperative Game","Trick-Taking","Hand Management"],description:"A cooperative trick-taking game following the Fellowship's journey through Middle-earth. Players must carefully manage which tricks to win and lose to overcome challenges on the path."},
  {id:"friday_os",name:"Friday",bggId:43570,year:2011,designer:"Friedemann Friese",row:4,col:5,otherSide:true,categories:["Solo","Card Game","Deck Building"],players:"1-1",playTime:"25 min",complexity:2.16,bggRating:7.2,spineColor:"#2e7d32",boxSize:"sm",mechanics:["Deck Building","Hand Management","Push Your Luck"],description:"A solo-only deck-building game where you help Robinson Crusoe survive on a deserted island. Deliberately losing fights lets you thin your deck of weak cards to build toward defeating pirates."},
  {id:"mind_space_os",name:"Mind Space",bggId:377420,year:2023,designer:"Nao Shimamura",row:4,col:5,otherSide:true,categories:["Puzzle","Abstract"],players:"1-5",playTime:"30 min",complexity:1.8,bggRating:7.2,spineColor:"#6a3d8f",boxSize:"sm",mechanics:["Tile Placement","Puzzle","Simultaneous Action Selection"],description:"A puzzle polyomino game where players fill brain-shaped boards with thought tiles scored on color adjacency and placement patterns."},
  {id:"qe_os",name:"QE",bggId:266830,year:2019,designer:"Gavin Birnbaum",row:4,col:5,otherSide:true,categories:["Strategy","Party"],players:"3-5",playTime:"45 min",complexity:1.7,bggRating:7.3,spineColor:"#006400",boxSize:"sm",mechanics:["Auction","Hidden Information","Set Collection"],description:"Players are central banks printing unlimited money to buy industries — but the player who spends the most total is eliminated. A brilliantly simple auction game of hidden brinkmanship."},
  // ── Row 5, Col 2 ──
  {id:"paint_roses_os",name:"Paint the Roses",bggId:253759,year:2022,designer:"Ben Goldman",row:5,col:2,otherSide:true,categories:["Co-op","Deduction","Puzzle"],players:"2-5",playTime:"50-70 min",complexity:2.5,bggRating:7.1,spineColor:"#c0003c",boxSize:"sm",mechanics:["Cooperative Game","Deduction","Communication Limits","Tile Placement"],description:"A cooperative logic puzzle set in Wonderland. Players deduce the Queen's secret gardening rules by placing tiles and observing patterns. Each player knows part of the rule but cannot speak freely."},
  {id:"watergate_os",name:"Watergate",bggId:274364,year:2019,designer:"Matthias Cramer",row:5,col:2,otherSide:true,categories:["Strategy","Card Game"],players:"2-2",playTime:"30-60 min",complexity:2.4,bggRating:7.7,spineColor:"#1a2a4a",boxSize:"sm",mechanics:["Hand Management","Tug of War"],description:"An asymmetric two-player card game recreating the Watergate scandal. Nixon tries to build momentum while the Editor connects informants to evidence on a shared investigation board."},
  {id:"patchwork_os",name:"Patchwork",bggId:163412,year:2014,designer:"Uwe Rosenberg",row:5,col:2,otherSide:true,categories:["Abstract","Puzzle"],players:"2-2",playTime:"15-30 min",complexity:1.6,bggRating:7.6,spineColor:"#d4748a",boxSize:"sm",mechanics:["Tile Placement","Puzzle","Resource Management"],description:"A two-player tile-placement game where players purchase patches to fill their quilting board, paying in time and buttons. The shared time track governs turn order and income."},
  {id:"final_girl_os",name:"Final Girl",bggId:277659,year:2021,designer:"Evan Derrick, A. J. Porfirio",row:5,col:2,otherSide:true,categories:["Solo","Thematic"],players:"1-1",playTime:"20-60 min",complexity:2.76,bggRating:8.2,spineColor:"#8b0000",boxSize:"sm",mechanics:["Deck Building","Hand Management","Variable Player Powers"],description:"A solo horror game where you play the lone survivor facing a supernatural killer. Manage action cards, track the killer, and save victims before the final confrontation."},
  {id:"radlands_os",name:"Radlands",bggId:329082,year:2021,designer:"Daniel Piechnick",row:5,col:2,otherSide:true,categories:["Card Game","Strategy"],players:"2-2",playTime:"20-40 min",complexity:2.4,bggRating:7.7,spineColor:"#8b3a00",boxSize:"sm",mechanics:["Hand Management","Resource Management","Take That"],description:"A post-apocalyptic two-player card game where players manage camps and deploy fighters to destroy the opponent's three camp cards. Water is both currency and lifeblood."},
  {id:"flip_7_os",name:"Flip 7",bggId:420087,year:2024,designer:"Eric Olsen",row:5,col:2,otherSide:true,categories:["Card Game","Party"],players:"3-18",playTime:"20 min",complexity:1.1,bggRating:7.1,spineColor:"#d94f30",boxSize:"sm",mechanics:["Push Your Luck","Take That"],description:"A press-your-luck card game where players flip cards one at a time, trying to collect up to seven without a duplicate number. The pyramid distribution plus action cards make each flip tense."},
  {id:"mindbug_os",name:"Mindbug: First Contact",bggId:345584,year:2022,designer:"Skaff Elias, Richard Garfield, Marvin Hegen, Christian Kudahl",row:5,col:2,otherSide:true,categories:["Card Game","Strategy"],players:"2-2",playTime:"15-25 min",complexity:1.9,bggRating:7.5,spineColor:"#1a3a1a",boxSize:"sm",mechanics:["Hand Management","Take That","Variable Player Powers"],description:"A two-player combat card game where either player can use a Mindbug token to steal any creature played by the opponent. Every card play becomes a tense bluff and counter-bluff."},
  {id:"paperback_os",name:"Paperback",bggId:141572,year:2014,designer:"Tim Fowers",row:5,col:2,otherSide:true,categories:["Deck Building","Card Game"],players:"2-5",playTime:"45 min",complexity:2.1,bggRating:7.1,spineColor:"#8b4513",boxSize:"sm",mechanics:["Deck Building","Word Game","Hand Management"],description:"A deck-building word game where players buy letter cards to build their deck and spell words. Longer and rarer letters score more, making each deck a personal word-crafting engine."},
  {id:"cat_in_box_os",name:"Cat in the Box",bggId:345972,year:2022,designer:"Muneyuki Yokouchi",row:5,col:2,otherSide:true,categories:["Card Game","Strategy"],players:"2-5",playTime:"20-40 min",complexity:2.1,bggRating:7.5,spineColor:"#2c3e50",boxSize:"sm",mechanics:["Trick-Taking","Deduction"],description:"A quantum trick-taking game where cards have no fixed suit until played. Players declare colors when playing, marking a shared board and trying not to create paradoxes."},
  // ── Row 5, Col 4 ──
  {id:"vagrantsong_os",name:"Vagrantsong",bggId:340325,year:2022,designer:"Matt Carter, Justin Gibbs, Kyle Rowan",row:5,col:4,otherSide:true,categories:["Co-op","Adventure","Thematic"],players:"2-4",playTime:"45-120 min",complexity:3.19,bggRating:7.4,spineColor:"#4a3000",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Variable Player Powers"],description:"A cooperative boss-battler set on a haunted train during the Great Depression. Vagrant heroes face ghostly Haints in scenario-based encounters using a unique skill-coin system."},
  {id:"sw_deckbuilding_os",name:"Star Wars: The Deckbuilding Game",bggId:374173,year:2023,designer:"Caleb Grace",row:5,col:4,otherSide:true,categories:["Card Game","Deck Building"],players:"2-2",playTime:"30 min",complexity:2.0,bggRating:7.8,spineColor:"#1a1a1a",boxSize:"sm",mechanics:["Deck Building","Hand Management"],description:"A two-player deckbuilding duel between the Rebel Alliance and Galactic Empire. Players buy cards from a shared galaxy row and attack each other's bases to win."},
  {id:"dwar7s_fall_os",name:"Dwar7s Fall",bggId:193483,year:2016,designer:"Luís Brüeh",row:5,col:4,otherSide:true,categories:["Strategy","Fantasy"],players:"2-4",playTime:"20-60 min",complexity:2.23,bggRating:6.5,spineColor:"#d2691e",boxSize:"sm",mechanics:["Worker Placement","Hand Management","Tile Placement","Set Collection"],description:"To survive the long and terrible winter approaching, the dwarves need to prepare. Collect gems, build castles, and stock up enough food. Dwar7s Fall is a fast-paced worker placement and resource management game where players take turns placing dwarves on realm tiles to mine gems, fight monsters, and build their dwarf kingdom. Multiple paths to victory — be the first to complete three goals to trigger the endgame."},  
  {id:"katamino_os",name:"Katamino",bggId:6931,year:1992,designer:"André Perriolat",row:5,col:4,otherSide:true,categories:["Puzzle","Abstract"],players:"1-2",playTime:"10 min",complexity:1.75,bggRating:6.5,spineColor:"#e63946",boxSize:"sm",mechanics:["Tile Placement","Pattern Recognition"],description:"A classic wooden puzzle game using pentomino pieces to fill a segmented tray. Hundreds of solo challenges of increasing difficulty, plus a two-player speed mode."},
  {id:"hot_streak_os",name:"Hot Streak",bggId:446497,year:2025,designer:"Jon Perry",row:5,col:4,otherSide:true,categories:["Racing","Party"],players:"2-8",playTime:"20 min",complexity:1.3,bggRating:7.8,spineColor:"#ff8c00",boxSize:"sm",mechanics:["Betting","Push Your Luck","Racing"],description:"A chaotic betting and racing game where hard luck gamblers bet on off-brand mascots. Draft betting tickets and decide between risk and safety payouts as races run continuously."},
  {id:"dt_vl_seraph_os",name:"Dice Throne: Seraph v. Vampire Lord",bggId:266964,year:2018,designer:"Nate Chatellier, Manny Trembley",row:5,col:4,otherSide:true,categories:["Dice","Card Game"],players:"2-2",playTime:"20-40 min",complexity:2.1,bggRating:7.7,spineColor:"#4b0082",boxSize:"sm",mechanics:["Dice Rolling","Hand Management","Variable Player Powers"],description:"Two heroes from Dice Throne Season Two: the holy Seraph and the dark Vampire Lord clash with unique dice, ability cards, and combo chains."},
  {id:"marvel_dt_bw_ds_os",name:"Marvel Dice Throne: Black Widow v. Doctor Strange",bggId:360152,year:2022,designer:"Gavan Brown, Nate Chatellier, Manny Trembley",row:5,col:4,otherSide:true,categories:["Dice","Thematic"],players:"2-2",playTime:"30 min",complexity:2.4,bggRating:7.9,spineColor:"#8b0000",boxSize:"sm",mechanics:["Dice Rolling","Hand Management","Variable Player Powers"],description:"Black Widow and Doctor Strange face off in Marvel Dice Throne combat. Each hero has unique dice and ability cards for asymmetric head-to-head duels."},
  {id:"cartographers_os",name:"Cartographers",bggId:263918,year:2019,designer:"Jordy Adan",row:5,col:4,otherSide:true,categories:["Strategy","Puzzle"],players:"1-100",playTime:"30-45 min",complexity:1.9,bggRating:7.5,spineColor:"#4b6858",boxSize:"sm",mechanics:["Grid Coverage","Paper-and-Pencil"],description:"A flip-and-write mapping game where players draw terrain shapes on their map sheets to fulfill seasonal royal edicts. Accessible, quick, and excellent solo support."},
  {id:"poly_koul_os",name:"Η γεωγραφία ειναι πολυ κουλ",bggId:0,year:0,designer:"",row:5,col:4,otherSide:true,categories:["Family","Party"],players:"2-8",playTime:"20-30 min",complexity:1.0,bggRating:0,spineColor:"#3498db",boxSize:"sm",mechanics:["Trivia"],description:"A fun Greek geography trivia game. Players answer questions about geography in an entertaining and educational format."},
  // ══════════════════════════════════════════
  // ROW 7 - OTHER SIDE OVERFLOW (swap view)
  // ══════════════════════════════════════════

  // ── Row 7, Col 1 ──
  {id:"marvel_legendary_os",name:"Legendary: A Marvel Deck Building Game",bggId:129437,year:2012,designer:"Devin Low",row:7,col:1,otherSide:true,categories:["Deck Building","Co-op","Thematic"],players:"1-5",playTime:"30-60 min",complexity:2.5,bggRating:7.5,spineColor:"#1a237e",boxSize:"sm",mechanics:["Cooperative Game","Deck Building","Hand Management"],description:"A semi-cooperative deck-building game where players recruit Marvel heroes to battle iconic villains and masterminds. Build synergistic hero combos to defeat escalating threats."},
  {id:"drunagor_os",name:"Chronicles of Drunagor: Age of Darkness",bggId:268012,year:2021,designer:"Eurico Cunha Neto",row:7,col:1,otherSide:true,categories:["Co-op","Adventure","Thematic"],players:"1-5",playTime:"120 min",complexity:3.36,bggRating:8.2,spineColor:"#1c1c3a",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Modular Board","Variable Player Powers"],description:"A cooperative dungeon-crawler with 3D terrain, detailed miniatures, and a deep campaign. Heroes battle through a dark fantasy world corrupted by an ancient evil."},
  {id:"tanares_os",name:"Arena: The Contest – Tanares Adventures",bggId:298627,year:2023,designer:"Alexandre Aboud, Danilo de Alcantara, Michael Alves, Keli L. Cruz, Toi von Glehn, Clayton Machado, Guilherme Vasconcelos",row:7,col:1,otherSide:true,categories:["Co-op","Adventure","Thematic"],players:"1-8",playTime:"45-90 min",complexity:3.96,bggRating:8.2,spineColor:"#1a237e",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Variable Player Powers"],description:"A cooperative dungeon-crawl campaign expansion for Arena: The Contest. Players work together through a narrative campaign using the arena combat system."},
  {id:"lobotomy_2_os",name:"Lobotomy 2: Manhunt",bggId:348877,year:2022,designer:"Judgement Dave, Sebastian Kozak",row:7,col:1,otherSide:true,categories:["Thematic","Co-op"],players:"1-5",playTime:"60-120 min",complexity:3.2,bggRating:8.0,spineColor:"#2c0b0b",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Modular Board","Variable Player Powers"],description:"A dungeon-crawler set in a nightmarish asylum overrun by monsters from patients' nightmares. Psychotic anti-heroes hunt creatures through tile-based corridors with campaign progression."},
  {id:"witcher_monster_trail_os",name:"The Witcher: Old World – Monster Trail",bggId:341023,year:2023,designer:"Łukasz Woźniak",row:7,col:1,otherSide:true,categories:["Adventure","Thematic"],players:"1-5",playTime:"90-150 min",complexity:3.3,bggRating:8.7,spineColor:"#2e4a1e",boxSize:"sm",mechanics:["Deck Building","Modular Board","Variable Player Powers"],description:"Expansion adding new monster hunting mechanics, trail tokens, and additional monster cards. Deepens the competitive monster-hunting experience."},
  {id:"witcher_mages_os",name:"The Witcher: Old World – Mages",bggId:340523,year:2023,designer:"Łukasz Woźniak",row:7,col:1,otherSide:true,categories:["Adventure","Thematic"],players:"1-5",playTime:"90-150 min",complexity:2.7,bggRating:8.1,spineColor:"#6a0dad",boxSize:"sm",mechanics:["Deck Building","Variable Player Powers"],description:"Expansion adding powerful mage characters with spell-based abilities and new location cards associated with magical factions."},
  // ── Row 7, Col 2 ──
  {id:"witcher_legend_hunt_os",name:"The Witcher: Old World – Legendary Hunt",bggId:340526,year:2023,designer:"Łukasz Woźniak",row:7,col:2,otherSide:true,categories:["Adventure","Thematic"],players:"1-5",playTime:"90-150 min",complexity:2.85,bggRating:8.4,spineColor:"#7a4800",boxSize:"sm",mechanics:["Cooperative Game","Deck Building","Modular Board"],description:"Expansion introducing massive legendary monsters with detailed miniatures and cooperative boss-fight scenarios."},
  {id:"etherfields_harpy_os",name:"Etherfields: Stretch Goals – Harpy & She-Wolf Campaigns",bggId:351544,year:2022,designer:"Michał Oracz",row:7,col:2,otherSide:true,categories:["Adventure","Co-op","Thematic"],players:"1-4",playTime:"90-180 min",complexity:4.0,bggRating:8.0,spineColor:"#9b2d77",boxSize:"sm",mechanics:["Cooperative Game","Deck, Bag, and Pool Building","Dice Rolling","Grid Movement","Hand Management","Narrative Choice / Paragraph","Solo / Solitaire Game"],description:"Expansion for Etherfields adding two full campaigns and stretch goal content. The Harpy campaign follows Dreamers pursuing a thief through the Dreamworld — visiting the Infinite Market, the Prison, and joining parades and carnivals. The She-Wolf campaign portrays a war between chaotic Parasites and the Endless Forest — exploring the frozen taiga, confronting a corrupted elven king, and preparing for a final battle."},  
  {id:"earthborne_legacy_os",name:"Earthborne Rangers: Legacy of the Ancestors",bggId:354291,year:2025,designer:"Luke Eddy, Andrew Fischer, Brooks Flugaur-Leavitt, Andrew Navaro, Davi Paulino, Adam Sadler, Brady Sadler",row:7,col:2,otherSide:true,categories:["Adventure","Co-op"],players:"1-4",playTime:"60-240 min",complexity:3.5,bggRating:8.5,spineColor:"#4a7c59",boxSize:"sm",mechanics:["Card Play Conflict Resolution","Cooperative Game","Deck Construction","Hand Management","Move Through Deck","Narrative Choice / Paragraph","Role Playing","Scenario / Mission / Campaign Game","Solo / Solitaire Game","Variable Set-up"],description:"Campaign expansion for Earthborne Rangers featuring a new story arc that takes Rangers beyond, above, and below the Valley to explore strange new places. Includes 250+ new Ranger and Valley cards, new maps, and a campaign guide. Uncover the secrets of the Arcology left behind by the Estians, meet familiar faces, and encounter new people, creatures, and machines. Utilizes both cards and maps from the core set alongside the new content. Requires the Earthborne Rangers base game to play."},  {id:"on_mars_alien_os",name:"On Mars: Alien Invasion",bggId:278241,year:2022,designer:"Vital Lacerda",row:7,col:2,otherSide:true,categories:["Strategy","Euro"],players:"1-5",playTime:"80-150 min",complexity:4.0,bggRating:7.9,spineColor:"#8b2500",boxSize:"sm",mechanics:["Worker Placement","Cooperative Game","Area Control"],description:"Expansion changing On Mars into a semi-cooperative struggle for survival against an alien threat alongside competitive colony-building."},
  {id:"alchemists_golem_os",name:"Alchemists: The King's Golem",bggId:204650,year:2016,designer:"Matúš Kotry",row:7,col:2,otherSide:true,categories:["Deduction","Strategy"],players:"2-4",playTime:"120 min",complexity:4.55,bggRating:8.4,spineColor:"#4a3728",boxSize:"sm",mechanics:["Deduction","Worker Placement","Variable Player Powers"],description:"Essential expansion for Alchemists adding a narrative campaign where players must collectively create a golem for the king. New ingredients, artifacts, and deeper deduction."},
  // ── Row 7, Col 3 ──
  {id:"hegemony_crisis_os",name:"Hegemony: Crisis & Control",bggId:374250,year:2023,designer:"Vangelis Bagiartakis, Anastasios Grigoriadis, Varnavas Timotheou",row:7,col:3,otherSide:true,categories:["Strategy","Euro"],players:"1-4",playTime:"90-180 min",complexity:4.55,bggRating:8.3,spineColor:"#8b1a1a",boxSize:"sm",mechanics:["Hand Management","Negotiation","Variable Player Powers"],description:"Major expansion for Hegemony adding crisis events, new policy mechanisms, and deeper class asymmetry. Intensifies the economic and political warfare."},
  {id:"crimson_scales_os",name:"The Crimson Scales: Trail of Ashes",bggId:367751,year:2023,designer:"Motti Eisenbach",row:7,col:3,otherSide:true,categories:["Adventure","Co-op"],players:"1-4",playTime:"60-150 min",complexity:3.5,bggRating:9.0,spineColor:"#8b1a1a",boxSize:"sm",mechanics:["Cooperative Game","Hand Management","Modular Board","Solo / Solitaire Game","Variable Player Powers"],description:"Fan-made expansion for The Crimson Scales, itself a Gloomhaven-compatible campaign. Adds 16 new scenarios in a spiral-bound book, 5 new classes with 3D-printable miniatures, 20+ new items, 24 new events, 2+ new bosses, and a new Smoke Spirit monster type. Also includes metal token upgrades and an artbook featuring Alexandr Elichev's original artwork. Requires The Crimson Scales base game to play. Not an official Cephalofair Games product."},  {id:"dune_rise_ix_os",name:"Dune: Imperium – Rise of Ix",bggId:342031,year:2022,designer:"Paul Dennen",row:7,col:3,otherSide:true,categories:["Deck Building","Strategy"],players:"1-4",playTime:"60-120 min",complexity:3.23,bggRating:8.8,spineColor:"#c87941",boxSize:"sm",mechanics:["Deck Building","Worker Placement","Hand Management"],description:"First major expansion for Dune: Imperium adding the Ixian technology track, dreadnoughts, and new leaders. Significantly expands strategic options."},
  {id:"kingdom_legacy_os",name:"Kingdom Legacy: Feudal Kingdom",bggId:415776,year:2024,designer:"Jonathan Fryxelius",row:7,col:3,otherSide:true,categories:["Strategy","Campaign"],players:"1-1",playTime:"360-480 min",complexity:2.26,bggRating:8.0,spineColor:"#6b3a00",boxSize:"sm",mechanics:["Engine Building","Campaign","Hand Management"],description:"A solo legacy game by the designer of Terraforming Mars. Build a medieval kingdom across a branching campaign with permanent choices shaping future sessions."},
  {id:"auztralia_taz_os",name:"AuZtralia: TaZmania",bggId:320110,year:2022,designer:"Martin Wallace",row:7,col:3,otherSide:true,categories:["Adventure","Strategy"],players:"1-2",playTime:"30-90 min",complexity:2.71,bggRating:8.0,spineColor:"#5c8a00",boxSize:"sm",mechanics:["Area Movement","Network Building"],description:"Expansion for AuZtralia adding Tasmania as a new map designed for 1-2 players. Tightens the Ancient Ones fighting experience into a focused solo or duet game."},
  {id:"thunder_road_cc_os",name:"Thunder Road: Vendetta – Carnival of Chaos",bggId:415878,year:2024,designer:"Noah Cohen, Rob Daviau, Justin D. Jacobson, Brian Neff",row:7,col:3,otherSide:true,categories:["Racing","Thematic"],players:"2-5",playTime:"45-75 min",complexity:2.29,bggRating:8.1,spineColor:"#cc3300",boxSize:"sm",mechanics:["Dice Rolling","Modular Board","Hand Management"],description:"Carnival-themed expansion for Thunder Road: Vendetta: shoot and slam the other cars to win the crowd's favor and collect scrap. Requires Thunder Road: Vendetta."},
  // ── Row 7, Col 4 ──
  {id:"marvel_dt_missions_os",name:"Marvel Dice Throne Missions",bggId:403495,year:2025,designer:"Gavan Brown, Nate Chatellier",row:8,col:1,otherSide:true,categories:["Dice","Co-op","Thematic"],players:"1-4",playTime:"30-75 min",complexity:2.27,bggRating:8.3,spineColor:"#8e1a1a",boxSize:"sm",mechanics:["Cooperative Game","Dice Rolling","Variable Player Powers"],description:"Cooperative expansion for Marvel Dice Throne introducing mission-based scenarios where heroes team up against escalating villain threats."},
  {id:"chron_crime_1400_os",name:"Chronicles of Crime: 1400",bggId:300300,year:2020,designer:"David Cicurel, Wojciech Grajkowski",row:8,col:1,otherSide:true,categories:["Deduction","Co-op"],players:"1-4",playTime:"60-90 min",complexity:2.0,bggRating:7.7,spineColor:"#5c3317",boxSize:"sm",mechanics:["Cooperative Game","Deduction","Storytelling"],description:"A standalone Chronicles of Crime set in medieval Paris. Players investigate crimes using the app-driven scanning system in a historical mystery setting."},
  {id:"midnight_crown_os",name:"Hidden Games Crime Scene: The Midnight Crown",bggId:309917,year:2020,designer:"",row:8,col:1,otherSide:true,categories:["Deduction","Co-op"],players:"1-6",playTime:"90-150 min",complexity:2.0,bggRating:7.9,spineColor:"#5c3317",boxSize:"sm",mechanics:["Cooperative Game","Deduction"],description:"A mystery case game where players investigate clues and piece together evidence to solve the case of the famous Midnight Crown."},
  {id:"detective_bullets_os",name:"Detective: Bullets over Hollywood",bggId:237900,year:2019,designer:"Evan Derrick",row:8,col:1,otherSide:true,categories:["Deduction","Co-op"],players:"1-5",playTime:"30-150 min",complexity:2.89,bggRating:8.4,spineColor:"#2e1b1b",boxSize:"sm",mechanics:["Cooperative Game","Deduction","Storytelling"],description:"Expansion for Detective: City of Angels with more cases set in the gritty Los Angeles of the 1940s, tougher to crack than the base game's. Requires Detective: City of Angels."},
  {id:"detective_saints_os",name:"Detective: City of Angels – Saints & Sinners",bggId:388374,year:2023,designer:"Alara Cameron, Evan Derrick, Logan Giannini",row:8,col:1,otherSide:true,categories:["Deduction","Thematic"],players:"1-5",playTime:"120 min",complexity:2.8,bggRating:8.6,spineColor:"#1a2a4a",boxSize:"sm",mechanics:["Cooperative Game","Deduction","Narrative Choice / Paragraph","Semi-Cooperative Game","Solo / Solitaire Game"],description:"An expansion for Detective: City of Angels featuring three new cases set in the dark, violent world of 1940s Los Angeles. Most players step into the shoes of LAPD Homicide detectives, while one player takes on The Chisel — whose goal is to stall and misdirect at every turn. Cases include 'One Last Hit for the Hitman', 'Cloak & Daggered', and 'Blast from the Past'. Requires Detective: City of Angels to play."},  {id:"sherlock_thames_os",name:"Sherlock Holmes Consulting Detective: The Thames Murders & Other Cases",bggId:2511,year:1981,designer:"Raymond Edwards, Suzanne Goldberg, Gary Grady",row:8,col:1,otherSide:true,categories:["Deduction","Co-op"],players:"1-8",playTime:"60-120 min",complexity:2.66,bggRating:7.6,spineColor:"#2b4a6e",boxSize:"sm",mechanics:["Cooperative Game","Deduction","Storytelling"],description:"The classic detective game where players follow leads across Victorian London using a map, directory, and newspapers. Work as a team to solve ten cases and compare your efficiency against Sherlock Holmes himself."},
  // ── Row 7, Col 5 ──
  {id:"gh_buttons_bugs_os",name:"Gloomhaven: Buttons & Bugs",bggId:393672,year:2024,designer:"Joe Klipfel, Nikki Valens",row:8,col:2,otherSide:true,categories:["Adventure","Solo"],players:"1",playTime:"20 min",complexity:3.32,bggRating:7.5,spineColor:"#2c3e50",boxSize:"sm",mechanics:["Hand Management","Modular Board"],description:"A compact solo-only Gloomhaven experience in a tiny box. Players control a single character navigating hexagonal encounters using the familiar card-based combat system."},
  {id:"smartphone_update_os",name:"Smartphone Inc.: Update 1.1",bggId:306864,year:2020,designer:"Ivan Lashin",row:8,col:2,otherSide:true,categories:["Strategy","Euro"],players:"1-5",playTime:"60-90 min",complexity:3.0,bggRating:7.9,spineColor:"#2c3e50",boxSize:"sm",mechanics:["Simultaneous Action Selection","Worker Placement"],description:"Comprehensive expansion for Smartphone Inc. adding asymmetric company powers, new product tiles, and additional market mechanisms."},
  {id:"paleo_new_beg_os",name:"Paleo: A New Beginning",bggId:342501,year:2021,designer:"Peter Rustemeyer",row:8,col:2,otherSide:true,categories:["Co-op","Adventure"],players:"2-4",playTime:"45-60 min",complexity:3.18,bggRating:8.2,spineColor:"#8b5e3c",boxSize:"sm",mechanics:["Cooperative Game","Hand Management"],description:"First major expansion for Paleo adding new card packs, complex tribal narratives, and the cave painting mechanic. Deepens cooperative survival."},
  {id:"final_girl_ht_os",name:"Final Girl: The Happy Trails Horror",bggId:307683,year:2021,designer:"Evan Derrick, A. J. Porfirio",row:8,col:2,otherSide:true,categories:["Solo","Thematic"],players:"1-1",playTime:"20-60 min",complexity:2.6,bggRating:8.2,spineColor:"#2d5a27",boxSize:"sm",mechanics:["Deck Building","Hand Management","Variable Player Powers"],description:"A Feature Film scenario for Final Girl set in a summer camp stalked by a masked killer — homage to Friday the 13th. Requires the Core Box."},
  {id:"azul_crystal_os",name:"Azul: Crystal Mosaic",bggId:294345,year:2020,designer:"Michael Kiesling",row:8,col:2,otherSide:true,categories:["Abstract","Puzzle"],players:"2-4",playTime:"30-45 min",complexity:1.67,bggRating:7.25,spineColor:"#1e6b8c",boxSize:"sm",mechanics:["Open Drafting","Pattern Building","Tile Placement"],description:"Expansion for Azul adding four double-sided player boards with new tile layouts and fresh strategic opportunities. The crystal-clear plastic overlays provide recesses that keep tiles neatly in place during play. Each board side offers new mid- and end-game scoring challenges. Requires the base Azul game to play."},  {id:"magic_maze_ms_os",name:"Magic Maze: Maximum Security",bggId:230359,year:2017,designer:"Kasper Lapp",row:8,col:2,otherSide:true,categories:["Co-op","Puzzle"],players:"1-8",playTime:"1-24 min",complexity:2.1,bggRating:7.5,spineColor:"#cc5500",boxSize:"sm",mechanics:["Cooperative Game","Real-Time","Communication Limits"],description:"Expansion adding security systems, alarm triggers, and new movement restrictions to the cooperative real-time Magic Maze heist."},
  // ── Row 7, Col 6 ──
  {id:"case_gomersal_os",name:"The Case of Little Gomersal",bggId:304847,year:2019,designer:"",row:8,col:3,otherSide:true,categories:["Deduction","Co-op"],players:"1-6",playTime:"90-180 min",complexity:2.43,bggRating:8.0,spineColor:"#5c3317",boxSize:"sm",mechanics:["Cooperative Game","Deduction"],description:"A mystery case game where players investigate clues and piece together evidence to solve the case of Little Gomersal."},
  {id:"targi_exp_os",name:"Targi: The Expansion",bggId:202453,year:2016,designer:"Andreas Steiger",row:8,col:3,otherSide:true,categories:["Strategy","Euro"],players:"2-2",playTime:"60 min",complexity:2.5,bggRating:8.0,spineColor:"#c9a66b",boxSize:"sm",mechanics:["Worker Placement","Hand Management","Set Collection"],description:"Expansion for Targi adding water tokens, the Targia pawn, shifting sand cards, and a new tribe deck that deepens the desert trading duel."},
  {id:"paint_roses_esc_os",name:"Paint the Roses: Escape the Castle",bggId:348997,year:2022,designer:"Daryl Andrews, Dominic Crapuchettes, Ben Goldman, Steph Hodge, Matthew O'Malley",row:8,col:3,otherSide:true,categories:["Co-op","Deduction"],players:"2-5",playTime:"60 min",complexity:3.0,bggRating:7.5,spineColor:"#8b1a52",boxSize:"sm",mechanics:["Cooperative Game","Deduction","Tile Placement"],description:"Escape the Castle is a collection of 6 modules. Each module features a unique challenge, along with a lovable Wonderland character to help you."},
  {id:"abyss_leviathan_os",name:"Abyss: Leviathan",bggId:232197,year:2018,designer:"Bruno Cathala, Charles Chevallier",row:8,col:3,otherSide:true,categories:["Card Game","Strategy"],players:"2-5",playTime:"30-60 min",complexity:2.41,bggRating:8.0,spineColor:"#00688b",boxSize:"sm",mechanics:["Card Drafting","Set Collection"],description:"Expansion for Abyss adding the monstrous Leviathan faction that prowls the ocean depths as a new threat players must manage."},
  {id:"take_time_os",name:"Take Time",bggId:440540,year:2025,designer:"Alexi Piovesan, Julien Prothière",row:8,col:3,otherSide:true,categories:["Co-op","Card Game","Campaign"],players:"2-4",playTime:"30 min",complexity:1.62,bggRating:7.7,spineColor:"#1e3a5f",boxSize:"sm",mechanics:["Cooperative Game","Communication Limits","Scenario / Mission / Campaign Game"],description:"A cooperative card game about time itself. Players place 12 cards face down around a clock while respecting each test's constraints, communicating only in limited ways. The campaign spans 40 tests across 10 chapters, each introducing new rules and subtleties — from Awakening to Rebirth."},
  {id:"cozy_stickerville_os",name:"Cozy Stickerville",bggId:456440,year:2026,designer:"Corey Konieczka",row:8,col:3,otherSide:true,categories:["Co-op","Family","Campaign"],players:"1-6",playTime:"30 min",complexity:1.21,bggRating:8.2,spineColor:"#4a7a3b",boxSize:"sm",mechanics:["Cooperative Game","Legacy Game","Narrative Choice / Paragraph","Scenario / Mission / Campaign Game","Solo / Solitaire Game"],description:"A comfy cooperative village-building campaign with over 800 stickers. Across 10 games covering a decade of life in the country, players sticker their way through seasons, develop their town, and build relationships with its inhabitants — every choice permanently shaping the village."},
  {id:"world_order_os",name:"World Order",bggId:403150,year:2026,designer:"Vangelis Bagiartakis, Varnavas Timotheou",row:8,col:3,otherSide:true,categories:["Strategy","Area Control","Thematic"],players:"2-4",playTime:"120-180 min",complexity:3.75,bggRating:8.1,spineColor:"#7a1f1f",boxSize:"lg",mechanics:["Area Majority / Influence","Bag Building","Hand Management","Multi-Use Cards","Variable Player Powers","Solo / Solitaire Game"],description:"A heavy politico-economic area-control game of modern geopolitics. Players take command of one of four global powers — the USA, China, Russia, or the EU — wielding diplomatic, economic, and military might to expand influence across the world. Deck/bag/pool building and multi-use cards drive a tense race for global hegemony."},
  {id:"witness_chameleon_os",name:"Witness: On the Trail of the Chameleon",bggId:422120,year:2024,designer:"Dominique Bodin",row:8,col:3,otherSide:true,categories:["Co-op","Deduction","Party"],players:"4",playTime:"10-25 min",complexity:1.6,bggRating:6.9,spineColor:"#2e4a3a",boxSize:"sm",mechanics:["Communication Limits","Deduction","Storytelling","Cooperative Game"],description:"A cooperative, silent-deduction detective game for four. Each player reads a private clue, then passes information around the table by whispering only to a neighbor — reconstructing the case as the message mutates through transmission. Across a series of cases you piece together the truth from fragments, balancing hilarity and genuine detective work."},
  {id:"underwater_data_os",name:"Underwater Cities: Data Era",bggId:440715,year:2025,designer:"Vladimír Suchý",row:8,col:3,otherSide:true,categories:["Strategy","Euro"],players:"1-4",playTime:"80-150 min",complexity:3.2,bggRating:8.5,spineColor:"#006994",boxSize:"sm",mechanics:["Hand Management","Income","Network Building","Solo / Solitaire Game","Worker Placement"],description:"Second expansion for Underwater Cities, also compatible with the New Discoveries expansion. Introduces a new resource type — data discs — which unlock additional actions alongside new data center buildings and a new city type, information cities. Both new structures provide fresh scoring paths. Also includes upgraded components that can be used with the base game and New Discoveries expansion. Requires Underwater Cities to play."},
];
