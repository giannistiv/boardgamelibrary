// Run this in the browser console on boardgamegeek.com (logged in)
// Extracts FULL box art URLs (not cropped og:image banners)
// by finding __original or __imagepage URLs in the page source
// Auto-downloads bgg_image_urls.json when done

(async function() {
  var ids = [96913,118247,122522,124361,128882,129437,131287,132531,133473,140603,141019,141572,142379,143741,14996,15062,15363,153912,15512,155821,158600,158899,160477,161936,163412,167791,169786,170216,171131,171273,172047,172225,173346,174660,175155,176494,176544,178900,181304,182874,192135,195539,196379,199042,201808,201921,202453,204650,204837,205059,209010,210232,214484,216734,21763,218121,21882,220877,2243,227935,230359,232405,233078,233867,237082,239175,2393,243993,244521,245961,246784,246900,247367,248562,249746,250337,250458,2511,251219,251661,253759,254640,254888,255984,256382,256997,257193,258242,262543,263918,264220,265188,265736,266830,266964,271320,271896,272533,273477,276025,276086,277659,278241,28023,280794,281259,281466,281474,283155,284083,284189,284217,284435,285697,286158,290236,291453,291457,291572,291845,291988,293296,295947,296557,298069,300700,302580,30334,304847,304985,306864,307683,308119,310348,311715,312959,314503,314530,315610,317985,318084,318184,318977,320110,321277,325038,329839,330476,331106,336794,337765,338960,339789,34010,340325,340523,340526,341023,341530,342031,342501,343362,343905,344114,345584,34585,345972,347305,347703,349955,350458,351040,351817,351913,354934,355433,356033,356282,358320,358504,358737,359438,359609,359871,360152,360153,364186,364405,366013,366251,370534,370581,371433,371688,371873,372526,373106,374173,376740,377420,377449,377470,377716,378574,380607,380681,380844,384213,38453,385761,386366,393672,393963,394193,39463,397598,39856,402126,403495,404431,404538,405826,40692,408180,411894,418059,42,420033,420087,422121,432,43570,441548,446497,447850,448713,5,503,63888,68448,70323,84876,9209,9674];

  var results = {};
  var failed = [];
  console.log("Fetching full box art URLs for " + ids.length + " games...");
  console.log("Method: scraping game pages for __original/__imagepage image URLs");

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    try {
      var r = await fetch("/boardgame/" + id);
      var html = await r.text();

      // Strategy: find the COVER image URL in the page source
      // BGG embeds image data in JSON/script tags with different size presets
      // Priority: __original > __imagepage > __large > og:image transformed

      var url = null;

      // Try to find __original URL (full resolution cover)
      var origMatch = html.match(/https:\/\/cf\.geekdo-images\.com\/[A-Za-z0-9_-]+__original\/img\/[^"'\s]+\.(?:jpg|png)/);
      if (origMatch) {
        url = origMatch[0];
      }

      // Fallback: __imagepage (large cover)
      if (!url) {
        var ipMatch = html.match(/https:\/\/cf\.geekdo-images\.com\/[A-Za-z0-9_-]+__imagepage\/img\/[^"'\s]+\.(?:jpg|png)/);
        if (ipMatch) url = ipMatch[0];
      }

      // Fallback: __large
      if (!url) {
        var lgMatch = html.match(/https:\/\/cf\.geekdo-images\.com\/[A-Za-z0-9_-]+__large\/img\/[^"'\s]+\.(?:jpg|png)/);
        if (lgMatch) url = lgMatch[0];
      }

      // Last resort: transform og:image from __opengraph to a guess at __original
      if (!url) {
        var ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/);
        if (!ogMatch) ogMatch = html.match(/content="([^"]+)"[^>]+property="og:image"/);
        if (ogMatch) {
          // Try swapping opengraph -> original in the URL
          url = ogMatch[1].replace(/__opengraph\//, '__original/');
          // If it didn't change (no __opengraph found), use og:image as-is
          if (url === ogMatch[1]) url = ogMatch[1];
        }
      }

      if (url) {
        results[id] = url;
        if ((i+1) % 10 === 0) console.log("[" + (i+1) + "/" + ids.length + "] " + Object.keys(results).length + " found");
      } else {
        failed.push(id);
        console.log("[" + (i+1) + "/" + ids.length + "] " + id + " FAILED");
      }
    } catch(e) {
      failed.push(id);
      console.log("[" + (i+1) + "/" + ids.length + "] " + id + " ERROR: " + e);
    }
    await new Promise(function(resolve) { setTimeout(resolve, 800); });
  }

  console.log("=== DONE === Found " + Object.keys(results).length + " URLs. Failed: " + failed.length);
  if (failed.length > 0) console.log("Failed IDs:", failed);

  // Show a sample to verify they look right
  var sample = Object.entries(results).slice(0, 3);
  sample.forEach(function(e) { console.log("Sample: " + e[0] + " -> " + e[1]); });

  var blob = new Blob([JSON.stringify(results)], {type: "application/json"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bgg_image_urls.json";
  a.click();
  console.log("Saved bgg_image_urls.json — paste its contents back to Claude");
})();
