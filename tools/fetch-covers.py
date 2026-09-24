#!/usr/bin/env python3
"""Download BGG cover art into images/<bggId>.jpg for games that lack one.

    python3 tools/fetch-covers.py 13 822 6931        # specific ids
    python3 tools/fetch-covers.py -f ids.txt         # ids from a file
    python3 tools/fetch-covers.py --auto             # every game the site knows about
    python3 tools/fetch-covers.py --auto --dry-run   # only list what's missing

--auto is what the pre-commit hook runs, so a game added to the data files (or
imported through the app) gets its cover in the next commit. It scans
data/games.js and data/play-history.js plus the games imported into Firebase,
downloads any missing cover and `git add`s it. It never fails the commit:
problems are printed as warnings and retried on the next commit. Games BGG has
no art for are remembered in tools/covers-none.txt so they aren't re-queried.

Where an image comes from:
  - the game's own urlImage when it has one (BGStats imports carry one), else
  - BGG's public website API (api.geekdo.com — the official XML API now needs a
    registered token): geekitems -> primary image id -> images/<id> -> the
    signed "medium" (500px) URL.
Images are converted like the existing covers (JPEG q85, max 500px) with macOS
`sips`, or Pillow where sips isn't available. Existing files are never
overwritten, so it's always safe to re-run.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, 'images')
NONE_FILE = os.path.join(ROOT, 'tools', 'covers-none.txt')
FIREBASE = 'https://boardgamelibrary0-default-rtdb.europe-west1.firebasedatabase.app'
API = 'https://api.geekdo.com/api'
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126 Safari/537.36')
DELAY = 0.35          # seconds between API calls
MAX_SIDE = 500        # cap, matches the "medium" size we request
SIZES = ('medium', 'itempage', 'imagepage', 'small')  # preference order


class NotFound(Exception):
    """BGG says the game (or its image) doesn't exist — retrying won't help."""


class HTTPStatusError(Exception):
    def __init__(self, status, url):
        super().__init__(f'HTTP {status} for {url[:80]}')
        self.status = status


def get(url, binary=False, timeout=30, retries=4):
    # curl (not urllib): uses the system certificate store, and --retry backs
    # off on transient failures (429 and 5xx included).
    r = subprocess.run(['curl', '-sSL', '--fail', '--max-time', str(timeout), '--retry', str(retries),
                        '--retry-delay', '3', '-A', UA, url], capture_output=True)
    if r.returncode != 0:
        err = r.stderr.decode().strip()
        m = re.search(r'returned error: (\d{3})', err)
        if m and int(m.group(1)) in (404, 410):
            raise NotFound(url)
        if m:
            raise HTTPStatusError(int(m.group(1)), url)
        raise RuntimeError(f'curl exit {r.returncode}: {err[:120]}')
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
        try:
            subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85', src, '--out', out],
                           check=True, capture_output=True)
            subprocess.run(['sips', '-Z', str(MAX_SIDE), out], check=True, capture_output=True)
        except FileNotFoundError:  # not macOS
            from PIL import Image
            im = Image.open(src).convert('RGB')
            im.thumbnail((MAX_SIDE, MAX_SIDE))
            im.save(out, 'JPEG', quality=85)
        os.replace(out, dest)


def cover_path(bgg_id):
    return os.path.join(IMAGES, f'{bgg_id}.jpg')


def load_none():
    try:
        with open(NONE_FILE) as f:
            return set(f.read().split())
    except FileNotFoundError:
        return set()


def known_games():
    """{bggId: urlImage-or-None} for every game the site references."""
    games = {}
    with open(os.path.join(ROOT, 'data', 'games.js'), encoding='utf-8') as f:
        for i in re.findall(r'bggId\s*:\s*(\d+)', f.read()):
            games.setdefault(i, None)
    with open(os.path.join(ROOT, 'data', 'play-history.js'), encoding='utf-8') as f:
        for i in re.findall(r'^\s*(\d+)\s*:\s*\[', f.read(), re.M):
            games.setdefault(i, None)
    try:  # games imported through the app live in Firebase, not in the repo
        imported = get(f'{FIREBASE}/importedGames.json', timeout=5, retries=0) or {}
        for g in imported.values():
            if isinstance(g, dict) and str(g.get('bggId', '')).isdigit():
                games[str(g['bggId'])] = g.get('urlImage') or games.get(str(g['bggId']))
    except Exception as e:
        print(f'fetch-covers: warning: could not read imported games from Firebase ({e}); '
              'skipping them this time')
    return games


def fetch(todo, auto=False):
    """todo: {bggId: urlImage-or-None}. Returns (downloaded, failed) where each
    failure is (bggId, name, reason, permanent)."""
    done, failed = [], []
    for n, (bgg_id, url) in enumerate(todo.items(), 1):
        dest = cover_path(bgg_id)
        name = None
        try:
            raw = None
            if url:
                try:
                    raw = get(url, binary=True)
                except (NotFound, HTTPStatusError) as e:
                    # A 4xx on the stored link means it's stale or malformed:
                    # ask BGG for the current image instead. 5xx is transient.
                    if isinstance(e, HTTPStatusError) and e.status >= 500:
                        raise
            if raw is None:
                url, name = image_url(bgg_id)  # NotFound if BGG has no such game
                if not url:
                    raise NotFound(bgg_id)     # the game exists but has no art
                raw = get(url, binary=True)
            save_jpeg(raw, dest)
            done.append((bgg_id, name))
            if auto:
                subprocess.run(['git', 'add', dest], cwd=ROOT, capture_output=True)
                print(f'fetch-covers: added cover for {bgg_id}' + (f' ({name})' if name else ''))
            else:
                print(f'[{n}/{len(todo)}] {bgg_id:>7}  {name or ""}', flush=True)
        except NotFound:
            failed.append((bgg_id, name or '?', 'no game or no art on BGG', True))
            if auto:  # remember, so the hook doesn't ask again every commit
                with open(NONE_FILE, 'a') as f:
                    f.write(f'{bgg_id}\n')
                subprocess.run(['git', 'add', NONE_FILE], cwd=ROOT, capture_output=True)
        except Exception as e:  # transient (offline, timeout…): keep going, retry later
            failed.append((bgg_id, name or '?', f'{type(e).__name__}: {e}', False))
    return done, failed


def main():
    args = sys.argv[1:]
    auto, dry = '--auto' in args, '--dry-run' in args
    if auto:
        skip = load_none()
        todo = {i: u for i, u in known_games().items()
                if not os.path.exists(cover_path(i)) and i not in skip}
    else:
        ids = open(args[1]).read().split() if args[:1] == ['-f'] else args
        todo = {i: None for i in dict.fromkeys(ids) if i.isdigit() and not os.path.exists(cover_path(i))}
    if dry:
        print(f'{len(todo)} game(s) missing a cover' + (': ' + ' '.join(todo) if todo else ''))
        return
    if not todo:
        if not auto:
            print('nothing to do: every requested game already has a cover')
        return
    done, failed = fetch(todo, auto)
    if not auto:
        print(f'\ndone: {len(done)} downloaded, {len(failed)} failed')
    for bgg_id, name, why, permanent in failed:
        if not auto:
            print(f'  FAILED {bgg_id} {name}: {why}')
        elif permanent:
            print(f'fetch-covers: warning: {bgg_id} has {why.replace("no game or no art on BGG", "no art on BGG")} '
                  '— remembered in tools/covers-none.txt (delete the line to retry)')
        else:
            print(f'fetch-covers: warning: could not fetch cover for {bgg_id} ({why}); will retry next commit')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # the hook must never block a commit
        if '--auto' in sys.argv:
            print(f'fetch-covers: warning: {type(e).__name__}: {e}')
        else:
            raise
