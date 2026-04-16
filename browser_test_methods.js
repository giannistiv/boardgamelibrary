// Run on boardgamegeek.com while logged in
// STEP 1: Tests which method gives FULL box art (not cropped)
// STEP 2: Downloads URLs using the working method
// Auto-downloads JSON when done

(async function() {
  console.log("=== Testing methods to get FULL box art ===");

  // Method A: xmlapi2 (same-origin, should use cookies)
  var methodA = false;
  try {
    var r = await fetch("/xmlapi2/thing?id=13");
    if (r.ok) {
      var txt = await r.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(txt, "text/xml");
      var img = doc.querySelector("item image");
      if (img && img.textContent.indexOf("geekdo") !== -1) {
        methodA = img.textContent.trim();
        console.log("  A) xmlapi2: WORKS -> " + methodA);
      }
    } else {
      console.log("  A) xmlapi2: " + r.status);
    }
  } catch(e) { console.log("  A) xmlapi2: ERROR " + e); }

  // Method B: geekdo images API with different sort
  var methodB = false;
  try {
    var r = await fetch("https://api.geekdo.com/api/images?ajax=1&objectid=13&objecttype=thing&nosession=1&showcount=10&size=original&sort=recent");
    if (r.ok) {
      var data = await r.json();
      if (data && data.images && data.images.length > 0) {
        // Look for an image that seems like box art (usually the one with most "thumbs")
        var best = data.images[0];
        var url = best.imageurl_lg || best.imageurl;
        if (url && !url.startsWith("http")) url = "https:" + url;
        methodB = url;
        console.log("  B) geekdo sort=recent: WORKS -> " + methodB);
        console.log("     (numthumbs=" + best.numthumbs + ", numrecommend=" + best.numrecommend + ")");
      }
    } else {
      console.log("  B) geekdo sort=recent: " + r.status);
    }
  } catch(e) { console.log("  B) geekdo: ERROR " + e); }

  // Method C: geekdo images API looking for "cover" specifically
  var methodC = false;
  try {
    var r = await fetch("https://api.geekdo.com/api/images?ajax=1&objectid=13&objecttype=thing&nosession=1&showcount=50&size=original&sort=hot");
    if (r.ok) {
      var data = await r.json();
      if (data && data.images) {
        // Try to find one with "cover" or "box" in the caption, or the one with most recommendations
        for (var img of data.images) {
          var cap = (img.caption || "").toLowerCase();
          if (cap.indexOf("cover") !== -1 || cap.indexOf("box") !== -1) {
            var url = img.imageurl_lg || img.imageurl;
            if (url && !url.startsWith("http")) url = "https:" + url;
            methodC = url;
            console.log("  C) geekdo 'cover' caption: WORKS -> " + methodC);
            break;
          }
        }
        if (!methodC) console.log("  C) geekdo 'cover' caption: no match in " + data.images.length + " images");
      }
    }
  } catch(e) { console.log("  C) geekdo cover: ERROR " + e); }

  // Method D: internal geekpay/geekitem API
  var methodD = false;
  var apiPaths = [
    "/api/geekitem/thing?objectid=13",
    "/api/geekitem?objectid=13&objecttype=thing&subtype=boardgame",
    "/api/thing/13"
  ];
  for (var path of apiPaths) {
    try {
      var r = await fetch(path);
      if (r.ok) {
        var data = await r.json();
        var imgUrl = null;
        if (data && data.item && data.item.images) imgUrl = data.item.images.original || data.item.images.large;
        else if (data && data.images) imgUrl = data.images.original || data.images.large;
        else if (data && data.imageurl) imgUrl = data.imageurl;
        if (imgUrl) {
          if (!imgUrl.startsWith("http")) imgUrl = "https:" + imgUrl;
          methodD = imgUrl;
          console.log("  D) " + path + ": WORKS -> " + methodD);
          break;
        }
      } else {
        console.log("  D) " + path + ": " + r.status);
      }
    } catch(e) { console.log("  D) " + path + ": ERROR"); }
  }

  // Method E: Page scrape looking in script tags / JSON blobs
  var methodE = false;
  try {
    var r = await fetch("/boardgame/13");
    if (r.ok) {
      var html = await r.text();
      // Look for __original in any context
      var m = html.match(/https:\/\/cf\.geekdo-images\.com\/[A-Za-z0-9_-]+__original\/img\/[^"'\s\\]+/);
      if (m) {
        methodE = m[0];
        console.log("  E) page __original: WORKS -> " + methodE);
      } else {
        // Try __imagepage
        m = html.match(/https:\/\/cf\.geekdo-images\.com\/[A-Za-z0-9_-]+__imagepage\/img\/[^"'\s\\]+/);
        if (m) {
          methodE = m[0];
          console.log("  E) page __imagepage: WORKS -> " + methodE);
        } else {
          // Try __large
          m = html.match(/https:\/\/cf\.geekdo-images\.com\/[A-Za-z0-9_-]+__large\/img\/[^"'\s\\]+/);
          if (m) {
            methodE = m[0];
            console.log("  E) page __large: WORKS -> " + methodE);
          } else {
            console.log("  E) page scrape: no full-size URLs found");
          }
        }
      }
    }
  } catch(e) { console.log("  E) page scrape: ERROR " + e); }

  console.log("\n=== RESULTS ===");
  console.log("A) xmlapi2:       " + (methodA || "FAILED"));
  console.log("B) geekdo recent: " + (methodB || "FAILED"));
  console.log("C) geekdo cover:  " + (methodC || "FAILED"));
  console.log("D) internal API:  " + (methodD || "FAILED"));
  console.log("E) page scrape:   " + (methodE || "FAILED"));
  console.log("\nCopy these results and paste them back to Claude.");
  console.log("I'll use the working method to fetch all 244 URLs.");
})();
