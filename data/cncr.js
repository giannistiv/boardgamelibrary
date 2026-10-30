// Codenames: Critical Role Adventures: the heroes' sheets, for the Campaign tab on its game page (js/cncr-campaign.js).
// From Czech Games Edition's printable hero sheets (czechgames.com, downloads); the wording is short, the sheets have it in full.
// track: the XP boxes in rows (|): . a box, 1-3 an ability, M a roll modifier, H a heart, S an item slot,
// T a Stress token, C a heart or a modifier, X a Stress token or a modifier. mods: the roll modifiers in order (the first to start);
// hearts / stress: [to start, at most]. Loaded only when the tab opens; JSON after the "=", so it's read with JSON.parse.
const CNCR_DATA = {"heroes":[
{"id":"grog","name":"Grog","color":"#5d7468","mods":[-4,-2,2],"hearts":[3,8],
 "track":".H...1..C.....C....2|..C..S...C....C....C",
 "blurb":"Throws himself in harm's way to fire his abilities, trusting his stamina and his self-healing.",
 "trait":{"name":"Tough","text":"His roll modifier gets +2 for each heart he has lost. At the start of every mission he heals 1 heart."},
 "abilities":[
  {"name":"Twin Fury","when":"Before Grog guesses","text":"Roll. Either ignore it and guess normally, or take the damage below and point at 2 words: the GM picks which one is Grog's guess.","table":[["28+","No damage"],["15–27","1 damage"],["5–14","2 damage"],["≤ 4","3 damage"]]},
  {"name":"Face-First","when":"After Grog's guess is resolved","text":"The GM covers 1 gold word around Grog, if there is one (no XP for it). Roll:","table":[["15+","Grog takes 1 damage for each uncovered gray word around him."],["≤ 14","Grog takes 1 damage for each uncovered gray and burgundy word around him."]]}]},
{"id":"vex","name":"Vex'ahlia","color":"#8a5a3b","mods":[0,2,4,7],"hearts":[2,5],
 "track":"....H....1..S..M...C|....C..2.....C.....C",
 "blurb":"With Trinket, her loyal bear, she tracks the deadliest threat and profits from it.",
 "trait":{"name":"& Trinket","text":"Trinket may guess too, at most once a round; any XP he gains goes to Vex. He isn't a hero: he never has to guess and doesn't stop a hero guessing twice. He can't use roll modifiers or items. If he takes damage he's gone for the rest of the mission, back at the start of the next."},
 "abilities":[
  {"name":"Tracking","when":"After Vex's guess is resolved","text":"Roll. The GM tells you:","table":[["20+","The size of the same-colour cluster Vex stands on (words of one colour joined side by side, on the key card), and whether the black word is around her."],["11–19","Whether the black word is around her."]]},
  {"name":"Long Shot","when":"Anytime, once per mission","text":"Point at 1 word, then roll. The GM says whether it's the black word, without covering it: if it is, add +20.","table":[["37+","The GM covers any 2 gold words."],["21–36","The GM covers any 1 gold word."],["≤ 20","Vex takes 2 damage."]]}]},
{"id":"nott","name":"Nott","alt":"Veth","color":"#6b8e23","altColor":"#c98f22","mods":[0,2,4,7],"hearts":[1,3],
 "track":"...1...M.....C...S..|C.2......C.........C",
 "blurb":"Veth begins the campaign cursed, in the form of Nott. Can you lift the curse?",
 "trait":{"name":"Nimble","text":"The first time Nott would take damage in a mission, another hero must take it instead."},
 "altTrait":{"name":"Lucky","text":"Veth takes no damage from the first gray word she guesses each mission, and the party may keep guessing."},
 "curse":"When anyone rolls a natural 1 or a natural 20 (before modifiers), cross it off. With both crossed off, Nott turns back into Veth: Nimble goes, and Lucky works from then on.",
 "abilities":[
  {"name":"Serendipity","when":"After her guess is resolved","text":"Roll. The GM tells you how many spaces around her are:","table":[["20+","Gold, and gray (each separately)."],["12–19","Gold."]]},
  {"name":"Silver Lining","when":"At mission start","text":"Put a coin on each of the 4 words shown. Roll; the GM removes one coin, then tells you how many of the words with a coin are:","grid":[[1,1],[1,3],[3,1],[3,3]],"table":[["20+","Burgundy, and gray (each separately)."],["14–19","Burgundy."],["≤ 13","Gray."]]}]},
{"id":"jester","name":"Jester","color":"#b23a7a","mods":[0,3,5,7],"hearts":[2,4],
 "track":".1.....C....C..2...C|..S.......C........C",
 "blurb":"Pays for her abilities with Prank tokens on the words: danger for everyone.",
 "trait":{"name":"Prank tokens","text":"Each prank goes on a word that has none (skip it if every word has one). Whoever steps on a prank removes it and rolls with their own modifiers: Jester takes 1 damage on 7 or less, anyone else on 16 or less."},
 "abilities":[
  {"name":"Party Starter","when":"After the GM gives a clue","text":"Choose a hero (Jester too) to heal 1 heart or gain 1 XP. Then roll, and place that many pranks:","table":[["20+","1"],["15–19","2"],["9–14","3"],["4–8","4"],["≤ 3","5"]]},
  {"name":"Traveler's Aid","when":"Anytime, once per mission","text":"Place 2 pranks. Roll, adding +1 for each prank in play. The GM tells you:","table":[["18+","How many spaces with a prank are gold."],["12–17","How many spaces with a prank are burgundy."],["≤ 11","Whether the black word is under a prank."]]}]},
{"id":"percy","name":"Percy","color":"#4a55a2","mods":[0,2,4,6],"hearts":[2,4],
 "track":"....1..H..M......2..|C........C....S....C",
 "blurb":"His guns let him guess at range: a one-of-a-kind tactician.",
 "trait":{"name":"Guesses at range","text":"Put his standee on any word or tile and point his gun at a word next to it (not diagonally): that's the word he guesses. He only resolves tokens on his own space."},
 "abilities":[
  {"name":"Ingenuity","when":"After Percy's guess is resolved","text":"Roll: the space he stands on works twice (17+), once (7–16) or not at all (6 or less).","table":[["A word","Point at any word: the GM says if it's the same colour as the word Percy stands on."],["Gold / blue tile","Heal 1 heart of Percy's, or of another hero on this tile."],["Gray tile","Gain 1 XP."]]},
  {"name":"Vengeance","when":"Anytime, once per mission","text":"Percy must stand on a burgundy tile: put it back at the bottom of its stack. Roll, then Ingenuity is lost for the rest of the mission.","table":[["20+","Nothing more."],["14–19","Percy takes 1 damage."],["≤ 13","Everyone takes 1 damage."]]}]},
{"id":"dorian","name":"Dorian","color":"#2a8fa3","mods":[0,2,3,5],"hearts":[2,3],
 "track":"..1..M...2...S..C...|..3.....C..........C",
 "blurb":"A bard with a wide repertoire of songs that help the rest of the party.",
 "trait":{"name":"Songs","text":"His abilities are songs. After Dorian guesses he may roll, then pick from his unlocked songs; their tokens go under his standee and work until he leaves that space (taking them with him).","table":[["23+","All 3 songs, and gain 1 coin."],["19–22","Choose 2 songs."],["6–18","Choose 1 song."]]},
 "abilities":[
  {"name":"Shan'ty","when":"While the song is on","text":"Anyone on the same diagonal as Dorian may prevent 1 damage they'd take while guessing."},
  {"name":"Opera-tunity","when":"While the song is on","text":"Anyone in Dorian's row or column gains 1 extra XP if they gain any on their guess."},
  {"name":"Lulla-Bye","when":"While the song is on","text":"Anyone around Dorian may leave the guess they just made unresolved: the tile goes back to its stack and their standee stays on the word. Then Lulla-Bye is lost for the rest of the mission."}]},
{"id":"fcg","name":"Fresh Cut Grass","short":"FCG","color":"#c99a2e","mods":[0,3,5,8],"hearts":[1,1],"stress":[1,4],
 "track":"...T.1....X.S....X..|2......X......X.....X",
 "blurb":"An empathetic aeormaton, prone to dangerous overloads.",
 "trait":{"name":"Stress","text":"FCG may stop anyone taking 1 damage by flipping a calm Stress token to charged. After every clue, if he has a charged token, he rolls: lower than the threshold for his charged tokens and a Stress Overload starts. All tokens flip back to calm; only FCG may guess this round, and he can't stop by choice until the win condition is met (a wrong guess still ends it). Stress can't prevent damage during it, but anyone else may take all of it.","table":[["1 charged","Threshold 5"],["2 charged","Threshold 9"],["3 charged","Threshold 15"],["4 charged","Threshold 22"]]},
 "abilities":[
  {"name":"Hazard Detection","when":"After FCG's guess is resolved","text":"Roll. The GM tells you:","table":[["20+","How many spaces in FCG's row or column are burgundy, and then how many are gray."],["12–19","How many spaces in his row or column are burgundy."],["6–11","Nothing."],["≤ 5","Flip 1 calm token to charged (if he can)."]]},
  {"name":"Smiley Day","when":"At mission start","text":"Put an XP token on each of the 4 words shown. Roll; the GM removes one, then tells you how many of the words with XP are:","grid":[[0,2],[2,0],[2,4],[4,2]],"table":[["20+","Gold, and burgundy (each separately)."],["14–19","Gold."],["≤ 13","Gold, and flip 1 calm token to charged (if he can)."]]}]}
]};
