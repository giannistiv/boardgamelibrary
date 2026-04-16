(async function() {
  var ids = [105551,118247,122522,124361,128882,129437,131287,132531,133473,136284,140603,141019,141572,142379,143741,14996,15062,15363,153912,15512,155821,157354,158600,158899,160477,161936,163412,167791,169786,170216,171131,171273,172047,172081,172225,172308,173090,173346,174660,175155,176494,176544,178900,180263,181289,181304,182874,185343,192135,1927,195539,196379,1972,199042,200511,201808,201921,204650,204837,205059,209010,210232,214484,216734,21763,218121,218509,21882,21954,220877,222509,223040,2243,225694,227935,230359,232197,232405,233078,233398,233867,237082,237809,239175,2393,243993,244521,244992,245476,245655,245961,246784,246900,247367,248562,249746,250337,250458,2511,251219,251661,253759,25417,254640,254888,255984,256382,256997,257193,258242,262543,263918,264220,265188,265736,266830,266964,271320,271896,272533,273477,274364,276025,276086,277659,278241,28023,280794,281120,281259,28143,281466,281474,283155,284083,284189,284217,284435,285192,285697,286158,287607,290236,290484,291453,291457,291572,291845,291847,291988,293296,295374,295947,296557,297562,298069,298627,300300,300367,300700,302580,30334,304847,304985,30549,30658,306864,307683,308119,310348,310716,311715,312211,312318,312959,314503,314530,315610,317985,318084,318184,318977,320097,320110,321277,325038,329082,329839,329845,330476,331106,336794,336844,337765,338960,339789,34010,340325,340523,340526,341023,341530,342031,342501,342900,343362,343905,344114,345584,34585,345972,34635,347305,347703,348877,349955,350458,351040,351817,351913,354934,355326,355433,356033,356282,35677,358320,358504,358737,359438,359609,359871,360152,360153,364186,364405,366013,366251,368190,370534,370581,371433,371688,371873,371942,372526,373106,374173,376740,377420,377449,377470,377716,378574,380607,380681,380844,384213,38453,385163,385761,386366,393672,393963,394193,39463,3955,397435,397598,39856,402126,403495,404431,404538,405826,40692,408180,41114,411894,415776,418059,42,420033,420087,422121,429293,432,43570,441548,447850,448713,503,5,54043,55690,62219,63888,68448,70323,84876,9209,9674];

  console.log("Step 1: Testing which method works...");

  // Test method A: game page og:image
  var testA = false;
  try {
    var r = await fetch("/boardgame/432");
    if (r.ok) {
      var html = await r.text();
      if (html.indexOf("og:image") !== -1) testA = true;
    }
  } catch(e) {}
  console.log("  Game page scraping: " + (testA ? "WORKS" : "no"));

  // Test method B: xmlapi2
  var testB = false;
  try {
    var r = await fetch("/xmlapi2/thing?id=432");
    if (r.ok) {
      var txt = await r.text();
      if (txt.indexOf("<image>") !== -1) testB = true;
    }
  } catch(e) {}
  console.log("  XML API: " + (testB ? "WORKS" : "no"));

  // Test method C: geekdo API
  var testC = false;
  try {
    var r = await fetch("https://api.geekdo.com/api/images?ajax=1&objectid=432&objecttype=thing&nosession=1&showcount=1&size=original&sort=hot");
    if (r.ok) {
      var data = await r.json();
      if (data && data.images && data.images.length > 0) testC = true;
    }
  } catch(e) {}
  console.log("  Geekdo images API: " + (testC ? "WORKS" : "no"));

  if (!testA && !testB && !testC) {
    console.log("ERROR: No method works. Please make sure you are logged into BGG and try again.");
    return;
  }

  var method = testB ? "xmlapi" : (testA ? "page" : "geekdo");
  console.log("Using method: " + method);
  console.log("Step 2: Fetching image URLs for " + ids.length + " games...");

  var results = {};
  var failed = [];

  if (method === "xmlapi") {
    for (var i = 0; i < ids.length; i += 20) {
      var batch = ids.slice(i, i + 20);
      var batchStr = batch.join(",");
      try {
        var r = await fetch("/xmlapi2/thing?id=" + batchStr);
        var txt = await r.text();
        var parser = new DOMParser();
        var doc = parser.parseFromString(txt, "text/xml");
        var items = doc.querySelectorAll("item");
        for (var j = 0; j < items.length; j++) {
          var img = items[j].querySelector("image");
          if (img) results[items[j].getAttribute("id")] = img.textContent.trim();
        }
      } catch(e) { console.log("Batch error:", e); }
      console.log("Progress: " + Math.min(i + 20, ids.length) + "/" + ids.length);
      await new Promise(function(r) { setTimeout(r, 2000); });
    }
  } else if (method === "page") {
    for (var i = 0; i < ids.length; i++) {
      try {
        var r = await fetch("/boardgame/" + ids[i]);
        var html = await r.text();
        var m = html.match(/og:image[^>]+content="([^"]+)"/);
        if (!m) m = html.match(/content="([^"]+)"[^>]+og:image/);
        if (m && m[1].indexOf("geekdo") !== -1) {
          results[ids[i]] = m[1];
        } else {
          failed.push(ids[i]);
        }
      } catch(e) { failed.push(ids[i]); }
      if (i % 10 === 0) console.log("Progress: " + (i+1) + "/" + ids.length);
      await new Promise(function(r) { setTimeout(r, 800); });
    }
  } else {
    for (var i = 0; i < ids.length; i++) {
      try {
        var r = await fetch("https://api.geekdo.com/api/images?ajax=1&objectid=" + ids[i] + "&objecttype=thing&nosession=1&showcount=1&size=original&sort=hot");
        var data = await r.json();
        if (data && data.images && data.images.length > 0) {
          results[ids[i]] = "https:" + data.images[0].imageurl_lg;
        } else {
          failed.push(ids[i]);
        }
      } catch(e) { failed.push(ids[i]); }
      if (i % 10 === 0) console.log("Progress: " + (i+1) + "/" + ids.length);
      await new Promise(function(r) { setTimeout(r, 500); });
    }
  }

  console.log("Found " + Object.keys(results).length + " image URLs");
  if (failed.length > 0) console.log("Failed: " + failed.length + " IDs");

  var blob = new Blob([JSON.stringify(results)], {type: "application/json"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bgg_image_urls.json";
  a.click();
  console.log("Done! Saved bgg_image_urls.json");
})();
