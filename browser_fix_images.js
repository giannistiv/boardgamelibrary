(async function() {
  var ids = [372526,297562,302580,397435,264220,356282,393963,312211,265736,281120,368190,285697,370534,385163,310348,300367,312318,300300,393672,446497,202453];
  var results = {};
  var failed = [];
  console.log("Fetching image URLs for " + ids.length + " games...");
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    try {
      var r = await fetch("/boardgame/" + id);
      var html = await r.text();
      var m = html.match(/og:image[^>]+content="([^"]+)"/);
      if (!m) m = html.match(/content="([^"]+)"[^>]+og:image/);
      if (m && m[1].indexOf("geekdo") !== -1) {
        results[id] = m[1];
        console.log("[" + (i+1) + "/" + ids.length + "] " + id + " OK");
      } else {
        failed.push(id);
        console.log("[" + (i+1) + "/" + ids.length + "] " + id + " FAILED (no image)");
      }
    } catch(e) {
      failed.push(id);
      console.log("[" + (i+1) + "/" + ids.length + "] " + id + " ERROR: " + e);
    }
    await new Promise(function(r) { setTimeout(r, 800); });
  }
  var blob = new Blob([JSON.stringify(results)], {type: "application/json"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bgg_fix_urls.json";
  a.click();
  console.log("Done! " + Object.keys(results).length + " URLs saved. Failed: " + failed.length);
})();
