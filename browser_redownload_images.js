// Run this in the browser console while logged into BGG
// Downloads full box art images for 243 games that currently have cropped OG banners (600x315)
//
// Step 1: Run this script — it fetches the actual image URLs from BGG's XML API
// Step 2: Copy the JSON output when done
// Step 3: Paste it back so we can download the real images

var bggIds = [118247,122522,124361,128882,129437,131287,132531,133473,140603,141019,141572,142379,143741,14996,15062,15363,153912,15512,155821,158600,158899,160477,161936,163412,167791,169786,170216,171131,171273,172047,172225,173346,174660,175155,176494,176544,178900,181304,182874,192135,195539,196379,199042,201808,201921,202453,204650,204837,205059,209010,210232,214484,216734,21763,218121,21882,220877,2243,227935,230359,232405,233078,233867,237082,239175,2393,243993,244521,245961,246784,246900,247367,248562,249746,250337,250458,2511,251219,251661,253759,254640,254888,255984,256382,256997,257193,258242,262543,263918,264220,265188,265736,266830,266964,271320,271896,272533,273477,276025,276086,277659,278241,28023,280794,281259,281466,281474,283155,284083,284189,284217,284435,285697,286158,290236,291453,291457,291572,291845,291988,293296,295947,296557,298069,300700,302580,30334,304847,304985,306864,307683,308119,310348,311715,312959,314503,314530,315610,317985,318084,318184,318977,320110,321277,325038,329839,330476,331106,336794,337765,338960,339789,34010,340325,340523,340526,341023,341530,342031,342501,343362,343905,344114,345584,34585,345972,347305,347703,349955,350458,351040,351817,351913,354934,355433,356033,356282,358320,358504,358737,359438,359609,359871,360152,360153,364186,364405,366013,366251,370534,370581,371433,371688,371873,372526,373106,374173,376740,377420,377449,377470,377716,378574,380607,380681,380844,384213,38453,385761,386366,393672,393963,394193,39463,397598,39856,402126,403495,404431,404538,405826,40692,408180,411894,418059,42,420033,420087,422121,432,43570,441548,446497,447850,448713,5,503,63888,68448,70323,84876,9209,9674];

var results = {};
var done = 0;
var total = bggIds.length;

// BGG XML API allows batching up to ~20 IDs per request
var BATCH_SIZE = 20;
var batches = [];
for (var i = 0; i < bggIds.length; i += BATCH_SIZE) {
  batches.push(bggIds.slice(i, i + BATCH_SIZE));
}

function fetchBatch(batchIdx) {
  if (batchIdx >= batches.length) {
    console.log("=== ALL DONE ===");
    console.log("Found " + Object.keys(results).length + " image URLs");
    console.log("Copy the JSON below:");
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  var batch = batches[batchIdx];
  var ids = batch.join(",");
  var url = "https://boardgamegeek.com/xmlapi2/thing?id=" + ids;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function() {
    if (xhr.status === 202) {
      // BGG returns 202 when data is being prepared, retry after delay
      console.log("Batch " + (batchIdx + 1) + "/" + batches.length + " - got 202, retrying in 5s...");
      setTimeout(function() { fetchBatch(batchIdx); }, 5000);
      return;
    }

    var parser = new DOMParser();
    var xml = parser.parseFromString(xhr.responseText, "text/xml");
    var items = xml.querySelectorAll("item");

    items.forEach(function(item) {
      var id = item.getAttribute("id");
      var imageEl = item.querySelector("image");
      if (imageEl && imageEl.textContent) {
        results[id] = imageEl.textContent.trim();
      }
      done++;
    });

    console.log("Batch " + (batchIdx + 1) + "/" + batches.length + " done (" + done + "/" + total + " games)");

    // Wait 2s between batches to be polite
    setTimeout(function() { fetchBatch(batchIdx + 1); }, 2000);
  };
  xhr.onerror = function() {
    console.log("Error on batch " + (batchIdx + 1) + ", retrying in 5s...");
    setTimeout(function() { fetchBatch(batchIdx); }, 5000);
  };
  xhr.send();
}

console.log("Fetching full box art URLs for " + total + " games in " + batches.length + " batches...");
console.log("This will take about " + Math.ceil(batches.length * 2.5) + " seconds.");
fetchBatch(0);
