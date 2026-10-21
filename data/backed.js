// Backed games given as a list rather than tapped in the app (js/backing.js
// adds them to the player's profile, worker/src/push.js to the morning check):
// player → their games. Each counts as that player's backing until they
// change it in the app, which saves it to Firebase like any other.
//   rel   when it should arrive: the campaign's latest estimate (its page, or
//         a newer update from the publisher), looked up on 21 Oct 2026
//   at    when the campaign ended, the start of the countdown bar
//   note  what the pledge was (or a caveat about the date), under the name
//   about, by  for a game BGG doesn't have: its page's description
// Ids from 9000001 up are made up, for what isn't on BGG (the Gloomhaven RPG
// is an RPGGeek item; sleeves and accessories). Kept as JSON so the Worker
// can read it.
const BACKED_FIXED = {
  "Στιβ": [
    { "id": 401596, "name": "DCeased: A Zombicide Game", "on": "kickstarter", "url": "https://www.kickstarter.com/projects/cmon/dceased-zombicide", "at": "2023-11-30", "rel": "2027-03",
      "img": "https://cf.geekdo-images.com/tFZI-lyp2B54d6AWBaI0jw__square100@2x/img/GdbGmbL7G4mAbAWilQmmsjHp16o=/200x200/filters:strip_icc()/pic7839687.jpg" },
    { "id": 9000001, "name": "Gloomhaven: The Role Playing Game", "on": "backerkit", "url": "https://gloomhaven-rpg.backerkit.com/hosted_preorders", "at": "2023-07-20", "rel": "2027-01",
      "note": "Gloomhaven Grand Festival: the RPG, no miniatures",
      "about": ["Cephalofair's tabletop role-playing game, set in the world of Gloomhaven. Characters are built from the classes and ancestries of the Gloomhaven and Frosthaven board games, and fights keep their card-driven play.", "The deluxe set has the core rulebook, card decks for 16 classes and 8 ancestries, modifier decks, a backgrounds deck, a character sheet pad and a Gloom Master screen.", "It came from the Gloomhaven Grand Festival campaign on BackerKit (2023), next to Gloomhaven's second edition, a Frosthaven reprint and a line of miniatures."],
      "by": "Isaac Childres",
      "img": "https://images.backerkit.com/uploads/project/image/34852/ij7gi1r966qve0x0bsnlzcc9sz8m.jpeg?fm=jpg&w=600&h=600&fit=crop&auto=compress" },
    { "id": 449019, "name": "Paperback Adventures: Volume 2", "on": "gamefound", "url": "https://gamefound.com/en/projects/tim-fowers/paperback-adventures-volume-2", "at": "2025-07-17", "rel": "2026-12",
      "note": "Iron Knee and The Binding Nexus",
      "img": "https://imgcdn.gamefound.com/productimage/projects/5481/3aa3f702-f78e-46f5-80fe-cce87cbd97cb.png" },
    { "id": 440147, "name": "Agricola: Special Edition", "on": "gamefound", "url": "https://gamefound.com/en/projects/awaken-realms/agricola-special-edition", "at": "2025-06-28", "rel": "2026-12",
      "img": "https://cf.geekdo-images.com/xjKHDCMXRs7LyKneFV3bxQ__square100@2x/img/W0usecEzczwz_73fFufj-n823N4=/0x0:423x423/200x200/filters:strip_icc()/pic9782075.png" },
    { "id": 454971, "name": "Slay the Spire: Downfall", "on": "kickstarter", "url": "https://www.kickstarter.com/projects/contentiongames/sts-downfall", "at": "2026-04-09", "rel": "2027-04",
      "img": "https://cf.geekdo-images.com/6hxVUNPb8yDYn2mS_GfN7Q__square100@2x/img/Xsqi396lBW-_RJx5fLSApeR8tBQ=/200x200/filters:strip_icc()/pic9126329.png" },
    { "id": 456402, "name": "The Elder Scrolls: Heroes of Tamriel", "on": "gamefound", "url": "https://gamefound.com/en/projects/chip-theory-games/the-elder-scrolls-heroes-of-tamriel", "at": "2025-11-01", "rel": "2026-12",
      "img": "https://cf.geekdo-images.com/ZoRGJjzzxpcD_NHUP5OXtA__square100@2x/img/d08S-F-ZPMaI_4eAQ1OevV9RSRo=/0x0:1610x1610/200x200/filters:strip_icc()/pic9733493.jpg" },
    { "id": 458595, "name": "Rove: Anchorpoint", "on": "gamefound", "url": "https://gamefound.com/en/projects/addax-games/rove-anchorpoint", "at": "2025-12-10", "rel": "2026-12",
      "img": "https://cf.geekdo-images.com/l0VzvYTVfb_feCpuXGEVsw__square100@2x/img/wGnNBZtVOw8XC6F7uoOfufk7Xxo=/0x0:827x827/200x200/filters:strip_icc()/pic9260694.png" },
    { "id": 219650, "name": "Arydia: The Paths We Dare Tread", "on": "gamefound", "url": "https://gamefound.com/en/projects/far-off-games/arydia-2nd-printing", "at": "2025-12-10", "rel": "2027-01",
      "note": "Second printing",
      "img": "https://cf.geekdo-images.com/GGXq2lRAJCtS1yPPPmdVKw__square100@2x/img/RV0-KGJJzMftIkkhWvzobz_RVps=/363x0:1477x1080/fit-in/200x200/filters:fill(blur):strip_icc()/pic6205610.png" },
    { "id": 451233, "name": "The Witcher: Legacy", "on": "gamefound", "url": "https://gamefound.com/en/projects/go-on-board/the-witcher-legacy", "at": "2025-12-24", "rel": "2027-06",
      "img": "https://cf.geekdo-images.com/34xk37m1zQemB0w8P275xQ__square100@2x/img/xgEj77o3T6OjT1a7BjKqS7Jz8ng=/0x0:850x850/200x200/filters:strip_icc()/pic9018016.png" },
    { "id": 447125, "name": "Vampire Survivors: The Board Game", "on": "kickstarter", "url": "https://www.kickstarter.com/projects/152730994/vampire-survivors-the-board-game", "at": "2025-11-20", "rel": "2026-12",
      "img": "https://cf.geekdo-images.com/w9itbSAHL3_zBA8In3S4kg__square100@2x/img/7Tkki0TvbiNBhA3YLejdOP9IAFw=/200x200/filters:strip_icc()/pic9046544.png" },
    { "id": 456729, "name": "Wonderland's War: Caterpillar & White Queen", "on": "kickstarter", "url": "https://www.kickstarter.com/projects/druidcitygames/wonderlands-war-duel", "at": "2025-11-07", "rel": "2027-01",
      "note": "From the Wonderland's War Duel campaign: just the expansion",
      "img": "https://cf.geekdo-images.com/5Abz5vNtrRXauBzP91fy5Q__square100@2x/img/RCD27YyUZvnPYTZOsvshgwoiPe0=/200x200/filters:strip_icc()/pic9209060.png" },
    { "id": 388641, "name": "Defenders of the Dictionary", "on": "kickstarter", "url": "https://www.kickstarter.com/projects/adamsapplegames/defenders-of-the-dictionary", "at": "2026-10-10", "rel": "2027-04",
      "img": "https://cf.geekdo-images.com/rQZ-wLXOOg9HhJmIZlU5Fw__square100@2x/img/l4vC99l8TW6FKhdTiP4AFVPwAEs=/200x200/filters:strip_icc()/pic9683745.png" }
  ],
  "Δημητρης": [
    { "id": 462710, "name": "Bullet Galaxy: Fan+ and Paw+", "on": "gamefound", "url": "https://gamefound.com/en/projects/level-99-games/bullet-galaxy", "at": "2026-07-29", "rel": "2027-03",
      "note": "New Content pledge",
      "img": "https://cf.geekdo-images.com/kP5dM28HJayiz4b7SjIQMw__square100@2x/img/afbpz4AjSZTVylST-xbgxlhqRHE=/0x1627:1719x3346/200x200/filters:strip_icc()/pic9346205.png" },
    { "id": 9000002, "name": "Astral Forge: Tabletop Essentials 2026", "on": "gamefound", "url": "https://gamefound.com/en/projects/astral-forge/gamingcloth", "at": "2026-05-05", "rel": "2026-12",
      "note": "Was due Oct 2026; held up by China's Golden Week, new date to come",
      "about": ["Table accessories from Astral Forge's 2026 Gamefound campaign: GamingCloth play mats, QuickZip and DrawPouch storage bags, and orgaNicer card organisers."],
      "img": "https://imgcdn.gamefound.com/og-image-fb/projects/6127/c8395143-b4a7-41cc-833d-9578076c5373.png" },
    { "id": 9000003, "name": "Paladin Sleeves: Season 11", "on": "gamefound", "url": "https://gamefound.com/en/projects/board-and-dice/paladin-season11", "at": "2026-08-14", "rel": "2026-12",
      "note": "Second shipping wave, from late Nov",
      "about": ["The eleventh season of Board&Dice's Paladin card sleeves: sleeves in the sizes each backer picked, ordered in bulk, from 25 to 500 packs.", "A quarter of the orders went out from stock in September; the second wave reaches the warehouses in late November or early December, and the last few early next year."],
      "img": "https://imgcdn.gamefound.com/og-image-fb/projects/11589/090c666d-781e-42b5-b181-4f1c710e2902.png" },
    { "id": 449019, "name": "Paperback Adventures: Volume 2", "on": "gamefound", "url": "https://gamefound.com/en/projects/tim-fowers/paperback-adventures-volume-2", "at": "2025-07-17", "rel": "2026-12",
      "note": "Big Box + Binding Nexus + Iron Knee",
      "img": "https://imgcdn.gamefound.com/productimage/projects/5481/3aa3f702-f78e-46f5-80fe-cce87cbd97cb.png" },
    { "id": 457260, "name": "Escape the Dark Castle (2nd Edition) & Escape the Dark Forest", "on": "gamefound", "url": "https://gamefound.com/en/projects/themeborne/escape-the-dark-castle-and-forest", "at": "2025-11-20", "rel": "2027-04",
      "note": "Double Pack",
      "img": "https://cf.geekdo-images.com/8o0bCK11BexLWMIWjZJJVQ__square100@2x/img/iq9nmt-oOkxZ_3NFTzz9mch4V_8=/200x200/filters:strip_icc()/pic9204090.jpg" },
    { "id": 448713, "name": "Heroes of the Shire: Light & Shadow", "on": "gamefound", "url": "https://gamefound.com/en/projects/senior-games/heroes-of-the-shire-light-shadow", "at": "2026-03-31", "rel": "2027-05",
      "note": "Returning Hero Gameplay",
      "img": "https://cf.geekdo-images.com/WOR2oYhTqGD9Fx-IfyHV6A__square100@2x/img/NPftxB4hpZDrWxExbt5gG8bMCpg=/278x0:998x720/200x200/filters:strip_icc()/pic8892814.png" },
    { "id": 456213, "name": "Radiance", "on": "gamefound", "url": "https://gamefound.com/en/projects/gabe-barrett/radiance-solo-game-of-the-month", "at": "2025-12-20", "rel": "2026-11",
      "note": "All-In Bundle",
      "img": "https://cf.geekdo-images.com/JpZqCpowQtEfy2bKWlLI2A__square100@2x/img/GLPofPL0OevBhEhvEiV8GE9EzwY=/0x224:527x751/200x200/filters:strip_icc()/pic9161175.jpg" },
    { "id": 456084, "name": "Hellbringer: Bestiary & Forbidden Spells", "on": "gamefound", "url": "https://gamefound.com/en/projects/maxime-gauthier/hellbringer", "at": "2025-10-31", "rel": "2027-03",
      "note": "Monster Tier",
      "img": "https://cf.geekdo-images.com/XYcIR84Dve2Z9du8ideFlA__square100@2x/img/qtBVSBtxeuCwDkCYP56_9G8ZluI=/200x200/filters:strip_icc()/pic9153708.png" }
  ]
};
