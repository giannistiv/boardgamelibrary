// Run this in the browser console while logged into BGG
// These 15 games were flagged by audit as having potentially wrong images
// (separate from the 21 you already fixed)
//
// Category 1: Square box art (492x492) - may show base game art instead of expansion
// Category 2: Tiny/placeholder images - likely broken downloads

var bggIds = [
  // Category 1: Expansion images that are square (may be base game art)
  262722,  // Spirit Island: Jagged Earth
  302668,  // Marvel United: Tales of Asgard
  302669,  // Marvel United: Rise of the Black Panther
  302670,  // Marvel United: Guardians of the Galaxy Remix
  303600,  // Marvel United: Enter the Spider-Verse
  339128,  // Marvel United: X-Men - Gold Team
  339129,  // Marvel United: X-Men - Blue Team
  339131,  // Marvel United: Deadpool
  340529,  // The Witcher: Old World - Skellige
  340983,  // The Witcher: Old World - Wild Hunt
  393509,  // Planet Unknown: Supermoon
  410291,  // Heat: Heavy Rain

  // Category 2: Tiny or placeholder images
  367466,  // Dune: Imperium - Immortality (246x177, too small)
  405826,  // Hegemony: Crisis & Control (14.5KB, suspiciously small)
  415776   // Kingdom Legacy: Feudal Kingdom (351x185, too small)
];

var results = {};
var done = 0;

function fetchImage(id) {
  var url = "https://boardgamegeek.com/boardgame/" + id;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function() {
    var match = xhr.responseText.match(/property="og:image"\s+content="([^"]+)"/);
    if (match) {
      results[id] = match[1];
    } else {
      results[id] = "NOT_FOUND";
    }
    done++;
    console.log("Done: " + done + "/" + bggIds.length + " - " + id + " -> " + results[id]);
    if (done === bggIds.length) {
      console.log("=== ALL DONE ===");
      console.log(JSON.stringify(results, null, 2));
    }
  };
  xhr.onerror = function() {
    results[id] = "ERROR";
    done++;
    console.log("Error for " + id);
  };
  xhr.send();
}

// Stagger requests to avoid rate limiting
for (var i = 0; i < bggIds.length; i++) {
  (function(idx) {
    setTimeout(function() { fetchImage(bggIds[idx]); }, idx * 1500);
  })(i);
}

console.log("Fetching og:image URLs for " + bggIds.length + " games...");
console.log("This will take about " + Math.ceil(bggIds.length * 1.5) + " seconds.");
console.log("When done, copy the JSON output and save it as bgg_audit_urls.json");
