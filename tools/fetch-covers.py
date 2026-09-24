#!/usr/bin/env python3
"""Download BGG cover art into images/<bggId>.jpg for games that lack one.

    python3 tools/fetch-covers.py 13 822 6931        # ids as arguments
    python3 tools/fetch-covers.py -f ids.txt         # or whitespace-separated in a file

BGG's official XML API now requires a registered token, so this uses the
public JSON API behind the BGG website (api.geekdo.com), which needs no login:
  1. geekitems?objectid=<id>   -> the game's primary image id
  2. images/<imageid>          -> signed URLs per size; we take "medium" (500px)
The 500px image is converted like the existing covers (JPEG q85 via macOS
`sips`). Existing files are never overwritten, so the script is safe to
re-run and resumes where it left off. It is polite to the API: sequential
requests with a short delay and backoff on 429/5xx.
"""
import json
import os
import subprocess
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, 'images')
API = 'https://api.geekdo.com/api'
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126 Safari/537.36')
DELAY = 0.35          # seconds between API calls
MAX_SIDE = 500        # cap, matches the "medium" size we request
SIZES = ('medium', 'itempage', 'imagepage', 'small')  # preference order


def get(url, binary=False):
    # curl (not urllib): uses the system certificate store, and --retry backs
    # off on transient failures (429 and 5xx included).
    r = subprocess.run(['curl', '-sSL', '--fail', '--max-time', '30', '--retry', '4',
                        '--retry-delay', '3', '-A', UA, url], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f'curl exit {r.returncode}: {r.stderr.decode().strip()[:120]}')
    return r.stdout if binary else json.loads(r.stdout)


def image_url(bgg_id):
    item = get(f'{API}/geekitems?objectid={bgg_id}&objecttype=thing').get('item') or {}
    time.sleep(DELAY)
    image_id = item.get('imageid')
    if not image_id:
        return None, item.get('name')
    sizes = get(f'{API}/images/{image_id}').get('images') or {}
    time.sleep(DELAY)
    for size in SIZES:
        url = (sizes.get(size) or {}).get('url')
        if url:
            return url, item.get('name')
    return (item.get('images') or {}).get('previewthumb'), item.get('name')


def save_jpeg(raw, dest):
    with tempfile.TemporaryDirectory() as tmp:
        src, out = os.path.join(tmp, 'src'), os.path.join(tmp, 'out.jpg')
        with open(src, 'wb') as f:
            f.write(raw)
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85', src, '--out', out],
                       check=True, capture_output=True)
        subprocess.run(['sips', '-Z', str(MAX_SIDE), out], check=True, capture_output=True)
        os.replace(out, dest)


def main():
    args = sys.argv[1:]
    if args[:1] == ['-f']:
        with open(args[1]) as f:
            ids = f.read().split()
    else:
        ids = args
    ids = [i for i in dict.fromkeys(ids) if i.isdigit()]
    ok = skipped = 0
    failed = []
    for n, bgg_id in enumerate(ids, 1):
        dest = os.path.join(IMAGES, f'{bgg_id}.jpg')
        if os.path.exists(dest):
            skipped += 1
            continue
        try:
            url, name = image_url(bgg_id)
            if not url:
                failed.append((bgg_id, name or '?', 'no image on BGG'))
                continue
            save_jpeg(get(url, binary=True), dest)
            ok += 1
            print(f'[{n}/{len(ids)}] {bgg_id:>7}  {name}', flush=True)
        except Exception as e:  # keep going; report at the end
            failed.append((bgg_id, '?', f'{type(e).__name__}: {e}'))
    print(f'\ndone: {ok} downloaded, {skipped} already present, {len(failed)} failed')
    for bgg_id, name, why in failed:
        print(f'  FAILED {bgg_id} {name}: {why}')


if __name__ == '__main__':
    main()
