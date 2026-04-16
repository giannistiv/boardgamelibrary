#!/usr/bin/env python3
"""
Download board game box art images from BoardGameGeek.

Usage:
  pip install cloudscraper
  python3 download_images.py
"""

import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

try:
    import cloudscraper
except ImportError:
    print("Install cloudscraper first:  pip install cloudscraper")
    sys.exit(1)

IMAGES_DIR = Path(__file__).parent / "images"
IMAGES_DIR.mkdir(exist_ok=True)

NEED_IMAGES = [
    105551,118247,122522,124361,128882,129437,131287,132531,133473,136284,
    140603,141019,141572,142379,143741,14996,15062,15363,153912,15512,
    155821,157354,158600,158899,160477,161936,163412,167791,169786,170216,
    171131,171273,172047,172081,172225,172308,173090,173346,174660,175155,
    176494,176544,178900,180263,181289,181304,182874,185343,192135,1927,
    195539,196379,1972,199042,200511,201808,201921,204650,204837,205059,
    209010,210232,214484,216734,21763,218121,218509,21882,21954,220877,
    222509,223040,2243,225694,227935,230359,232197,232405,233078,233398,
    233867,237082,237809,239175,2393,243993,244521,244992,245476,245655,
    245961,246784,246900,247367,248562,249746,250337,250458,2511,251219,
    251661,253759,25417,254640,254888,255984,256382,256997,257193,258242,
    262543,263918,264220,265188,265736,266830,266964,271320,271896,272533,
    273477,274364,276025,276086,277659,278241,28023,280794,281120,281259,
    28143,281466,281474,283155,284083,284189,284217,284435,285192,285697,
    286158,287607,290236,290484,291453,291457,291572,291845,291847,291988,
    293296,295374,295947,296557,297562,298069,298627,300300,300367,300700,
    302580,30334,304847,304985,30549,30658,306864,307683,308119,310348,
    310716,311715,312211,312318,312959,314503,314530,315610,317985,318084,
    318184,318977,320097,320110,321277,325038,329082,329839,329845,330476,
    331106,336794,336844,337765,338960,339789,34010,340325,340523,340526,
    341023,341530,342031,342501,342900,343362,343905,344114,345584,34585,
    345972,34635,347305,347703,348877,349955,350458,351040,351817,351913,
    354934,355326,355433,356033,356282,35677,358320,358504,358737,359438,
    359609,359871,360152,360153,364186,364405,366013,366251,368190,370534,
    370581,371433,371688,371873,371942,372526,373106,374173,376740,377420,
    377449,377470,377716,378574,380607,380681,380844,384213,38453,385163,
    385761,386366,393672,393963,394193,39463,3955,397435,397598,39856,
    402126,403495,404431,404538,405826,40692,408180,41114,411894,415776,
    418059,42,420033,420087,422121,429293,432,43570,441548,447850,448713,
    503,5,54043,55690,62219,63888,68448,70323,84876,9209,9674
]


def main():
    scraper = cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "darwin", "mobile": False}
    )

    # Test connection first
    print("Testing BGG API access...")
    try:
        resp = scraper.get("https://boardgamegeek.com/xmlapi2/thing?id=432", timeout=20)
        print(f"  Status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"  Response: {resp.text[:300]}")
            print("\nIf this still fails, BGG may be fully blocking automated access.")
            print("As a last resort, see the browser console method below.")
            return
        print("  Connection OK!")
    except Exception as e:
        print(f"  Failed: {e}")
        return

    existing = {int(f.stem) for f in IMAGES_DIR.glob("*.jpg")}
    todo = [i for i in NEED_IMAGES if i not in existing]
    print(f"\nNeed to download {len(todo)} images ({len(existing)} already exist)")

    if not todo:
        print("All images already downloaded!")
        return

    # Process in batches of 20
    batch_size = 20
    downloaded = 0
    failed = []

    for i in range(0, len(todo), batch_size):
        batch = todo[i:i + batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(todo) + batch_size - 1) // batch_size
        print(f"\nBatch {batch_num}/{total_batches}: fetching URLs for {len(batch)} games...")

        ids_str = ",".join(str(x) for x in batch)
        url = f"https://boardgamegeek.com/xmlapi2/thing?id={ids_str}"

        url_map = {}
        for attempt in range(3):
            try:
                resp = scraper.get(url, timeout=30)
                if resp.status_code == 202:
                    print("  BGG queued request, waiting 5s...")
                    time.sleep(5)
                    continue
                resp.raise_for_status()
                root = ET.fromstring(resp.content)
                for item in root.findall("item"):
                    item_id = int(item.get("id"))
                    img_el = item.find("image")
                    if img_el is not None and img_el.text:
                        url_map[item_id] = img_el.text.strip()
                break
            except Exception as e:
                print(f"  Attempt {attempt+1} failed: {e}")
                if attempt < 2:
                    time.sleep(3)

        print(f"  Got {len(url_map)} image URLs")

        for bgg_id in batch:
            dest = IMAGES_DIR / f"{bgg_id}.jpg"
            if bgg_id in url_map:
                print(f"  Downloading {bgg_id}...", end=" ", flush=True)
                try:
                    img_resp = scraper.get(url_map[bgg_id], timeout=30)
                    img_resp.raise_for_status()
                    if len(img_resp.content) > 1000:
                        with open(dest, "wb") as f:
                            f.write(img_resp.content)
                        downloaded += 1
                        print("OK")
                    else:
                        failed.append(bgg_id)
                        print("FAILED (too small)")
                except Exception as e:
                    failed.append(bgg_id)
                    print(f"FAILED ({e})")
            else:
                failed.append(bgg_id)

        if i + batch_size < len(todo):
            time.sleep(3)

    print(f"\n{'='*50}")
    print(f"Downloaded: {downloaded}/{len(todo)}")
    if failed:
        print(f"Failed ({len(failed)}): {failed}")


# ─────────────────────────────────────────────────────────
# FALLBACK: If the script above still fails, paste this
# into your browser console on boardgamegeek.com:
#
# (async()=>{
#   const ids = [PASTE_IDS_HERE];
#   const results = {};
#   for(let i=0; i<ids.length; i+=20){
#     const batch = ids.slice(i,i+20).join(',');
#     const r = await fetch(`/xmlapi2/thing?id=${batch}`);
#     const txt = await r.text();
#     const parser = new DOMParser();
#     const doc = parser.parseFromString(txt,'text/xml');
#     doc.querySelectorAll('item').forEach(item=>{
#       const img = item.querySelector('image');
#       if(img) results[item.getAttribute('id')] = img.textContent.trim();
#     });
#     console.log(`Fetched ${i+20}/${ids.length}`);
#     await new Promise(r=>setTimeout(r,2000));
#   }
#   // Download as JSON file
#   const blob = new Blob([JSON.stringify(results)],{type:'application/json'});
#   const a = document.createElement('a');
#   a.href = URL.createObjectURL(blob);
#   a.download = 'bgg_image_urls.json';
#   a.click();
#   console.log('Done! Saved bgg_image_urls.json');
# })();
# ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    main()
