#!/usr/bin/env python3
"""Bring the players' BGG ratings into the app's ratings (Firebase ratings/),
for the games they haven't rated in the app.

    python3 tools/sync-ratings.py             # now
    python3 tools/sync-ratings.py --dry-run   # only show what would change

Whose: js/players.js's BGG_USERS, and anyone signed in who linked a BGG
username in Profile settings (users/{uid}/bgg, which wins for their player).
Only games the site knows (a shelf, a collection, a play) are brought, so the
ratings everyone loads stay small; a game that comes later is brought by a
later run. BGG allows 7.5; the app's stars are whole, so it's rounded (8).

A rating made in the app is never touched, nor one cleared there (kept as
value 0). One brought from BGG is marked src: 'bgg' and follows BGG's when it
changes, until the player rates the game in the app. It has no date
(updatedAt 0), so Explore's newest ratings stay the ones given in the app.
The page does the same at once when someone links a username (js/my-library.js
myBggRatings); the BGG sync Action runs this every 6 hours.

Needs the BGG token, like tools/sync-collections.py.
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location('sync_collections', os.path.join(ROOT, 'tools', 'sync-collections.py'))
sync = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sync)

FIREBASE = sync.FIREBASE
PATCH_SIZE = 400   # ratings per write


def fb_get(path):
    status, body = sync.curl(f'{FIREBASE}/{path}.json', timeout=30)
    if status != 200:
        raise RuntimeError(f'Firebase {path}: HTTP {status}')
    return json.loads(body) or {}


def fb_patch(path, data):
    cmd = ['curl', '-sS', '--max-time', '60', '-X', 'PATCH', '-w', '\n%{http_code}', '--data-binary', '@-', f'{FIREBASE}/{path}.json']
    r = subprocess.run(cmd, input=json.dumps(data, ensure_ascii=False).encode(), capture_output=True)
    status = r.stdout.decode('utf-8', 'replace').rpartition('\n')[2]
    if r.returncode != 0 or status != '200':
        raise RuntimeError(f'Firebase {path}: HTTP {status or r.stderr.decode().strip()[:120]}')


def bgg_players():
    """{player: BGG username}, the player as the app's ratings key it (its canonical name)."""
    with open(sync.PLAYERS_JS, encoding='utf-8') as f:
        block = re.search(r'const BGG_USERS = \{(.*?)\};', f.read(), re.S).group(1)
    out = dict(re.findall(r"'([^']+)'\s*:\s*'([^']+)'", block))
    for user in fb_get('users').values():
        if isinstance(user, dict) and user.get('bgg') and user.get('player'):
            out[str(user['player'])] = str(user['bgg']).strip()
    return {p: u for p, u in out.items()
            if re.fullmatch(r'[A-Za-z0-9_ .-]{1,40}', u) and not re.search(r'[.#$\[\]/]', p)}


def known_games():
    """The games the site knows: on a shelf, in a collection, or played."""
    ids = set()
    for name in ('games.js', 'collections.js'):
        with open(os.path.join(ROOT, 'data', name), encoding='utf-8') as f:
            ids |= {int(x) for x in re.findall(r'bggId["\']?\s*:\s*(\d+)', f.read())}
    with open(os.path.join(ROOT, 'data', 'play-history.js'), encoding='utf-8') as f:
        ids |= {int(x) for x in re.findall(r'^\s*(\d+):\s*\[', f.read(), re.M)}
    ids |= {int(k) for k in fb_get('importedGames') if str(k).isdigit()}
    for node in ('importedPlays', 'plays'):
        ids |= {int(p['bggId']) for p in fb_get(node).values() if isinstance(p, dict) and str(p.get('bggId', '')).isdigit()}
    return ids


def bgg_ratings(user, token):
    """{bggId: whole rating 1-10} from the user's BGG collection."""
    root = sync.bgg(f'collection?username={urllib.parse.quote(user)}&rated=1&stats=1', token)
    out = {}
    for it in root.findall('item'):
        r = it.find('stats/rating')
        v = sync._float(r.get('value')) if r is not None else None
        if it.get('objectid', '').isdigit() and v:
            out[int(it.get('objectid'))] = max(1, min(10, int(v + 0.5)))
    return out


def main():
    dry = '--dry-run' in sys.argv
    token = sync.read_token()
    if not token:
        sys.exit('sync-ratings: no BGG token (tools/.bgg-token or BGG_TOKEN)')
    players = bgg_players()
    known = known_games()
    ratings = fb_get('ratings')
    patch = {}
    for player, user in sorted(players.items()):
        try:
            theirs = bgg_ratings(user, token)
        except Exception as e:   # a wrong username, BGG busy: the next run
            print(f'  {player} ({user}): skipped, {e}')
            continue
        new = changed = 0
        for gid, v in theirs.items():
            if gid not in known:
                continue
            cur = (ratings.get(str(gid)) or {}).get(player)
            if cur is not None and not (isinstance(cur, dict) and cur.get('src') == 'bgg'):
                continue   # rated (or cleared) in the app: that one stays
            if isinstance(cur, dict) and cur.get('value') == v:
                continue
            patch[f'{gid}/{player}'] = {'value': v, 'updatedAt': 0, 'src': 'bgg'}
            if cur is None:
                new += 1
            else:
                changed += 1
        print(f'  {player} ({user}): {len(theirs)} rated on BGG, {new} new' + (f', {changed} changed' if changed else ''))
    if dry or not patch:
        print(f'sync-ratings: {len(patch)} to write' + (' (dry run)' if dry else ''))
        return
    keys = sorted(patch)
    for i in range(0, len(keys), PATCH_SIZE):
        fb_patch('ratings', {k: patch[k] for k in keys[i:i + PATCH_SIZE]})
    print(f'sync-ratings: {len(patch)} ratings written')


if __name__ == '__main__':
    main()
