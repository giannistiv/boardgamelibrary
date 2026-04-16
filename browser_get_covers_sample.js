// SAMPLE: Run in browser console on boardgamegeek.com (logged in)
// Tests 3 games and prints image URLs — verify these look like box covers
// before running the full version

(async function() {
  var sampleIds = [169786, 202453, 5];
  var results = {};

  for (var id of sampleIds) {
    try {
      var r = await fetch('/boardgame/' + id);
      var html = await r.text();
      var doc = new DOMParser().parseFromString(html, 'text/html');

      var url = null;

      // 1. Look in __NEXT_DATA__ JSON blob (Next.js page data — has the primary cover)
      var nextScript = doc.getElementById('__NEXT_DATA__');
      if (nextScript) {
        try {
          var pageData = JSON.parse(nextScript.textContent);
          var str = JSON.stringify(pageData);
          // Find the first __imagepage or __original URL in the page data
          var m = str.match(/https:\\\/\\\/cf\.geekdo-images\.com\\\/[A-Za-z0-9_-]+__(?:imagepage|original)\\\/img\\\/[^"\\\\]+/);
          if (m) url = m[0].replace(/\\\//g, '/');
        } catch(e) {}
      }

      // 2. Fallback: look for __imagepage or __original in raw HTML
      if (!url) {
        var m = html.match(/https:\/\/cf\.geekdo-images\.com\/[A-Za-z0-9_-]+__(?:imagepage|original)\/img\/[^"'\s\\]+/);
        if (m) url = m[0];
      }

      // 3. Fallback: og:image (correct image, but cropped to 1200x630)
      if (!url) {
        var og = doc.querySelector('meta[property="og:image"]');
        if (og) url = og.getAttribute('content');
      }

      results[id] = url;
      console.log(id + ':', url);
    } catch(e) {
      console.error(id + ' ERROR:', e);
      results[id] = null;
    }

    await new Promise(res => setTimeout(res, 800));
  }

  console.log('\n=== SAMPLE RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\nCheck if these URLs look like box covers.');
  console.log('If yes, run browser_get_covers_full.js for all 241 games.');
})();
