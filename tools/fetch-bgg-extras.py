#!/usr/bin/env python3
"""Keep data/bgg-extras.js in step with BGG for every game the site knows.

    python3 tools/fetch-bgg-extras.py            # add games that are missing
    python3 tools/fetch-bgg-extras.py --refresh  # re-fetch every game
    python3 tools/fetch-bgg-extras.py --auto     # what the pre-commit hook runs

For each game it stores BGG's community player-count poll (the counts voted
"best" and "recommended", and how many voted), whether the game is an
expansion, whether it's co-operative, and what kind of game it is (BGG's
game types and a few categories). The game page shows the poll; the
game-night picker uses all of it, for its suggestions and its filters. It
also keeps BGG's play time (min and max), the game's mechanics (their names
go in BGG_MECHANICS) and its overall BGG rank (for the Top 100 achievements).

    python3 tools/fetch-bgg-extras.py --ranks  # refresh play times, mechanics
                                               # and ranks of every game (weekly)

Same sources and rules as fetch-covers.py: the games in data/games.js,
data/play-history.js and the ones imported into Firebase; BGG's public
website API (no token needed). --auto only fetches games that are missing,
stages the file and never fails the commit.
"""
import importlib.util
import json
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'bgg-extras.js')
API = 'https://api.geekdo.com/api'
HEADER = '''// BGG community data per game. Written by tools/fetch-bgg-extras.py; don't edit by hand.
//   bggId: [player counts voted best, voted recommended, number of votes, 1 if an expansion,
//           1 if co-operative, kinds, min play time, max play time, mechanics, BGG rank]
// Player counts read like "4", "3-5" or "2,4" ("" when nobody has voted).
// Kinds, one letter each: F family, S strategy, T thematic, P party, A abstract,
// W wargame, K children's, C card game, D deduction, Z puzzle.
// Play times are minutes (0 = unknown); mechanics are BGG ids (names in
// BGG_MECHANICS), space-separated; the rank is BGG's overall board game rank (0 = none).
'''
ROW_LEN = 10

# BGG ids behind the kinds: game types (boardgamesubdomain) and categories
KINDS = {'5499': 'F', '5497': 'S', '5496': 'T', '5498': 'P', '4666': 'A', '4664': 'W', '4665': 'K',
         '1030': 'P', '1002': 'C', '1039': 'D', '1028': 'Z'}
COOP_MECHANIC = '2023'   # Cooperative Game

_spec = importlib.util.spec_from_file_location('fetch_covers', os.path.join(ROOT, 'tools', 'fetch-covers.py'))
covers = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(covers)


MECHANICS = {}   # BGG mechanic id -> name, kept across runs


def load():
    """{bggId: row} from the data file (and the mechanic names into MECHANICS)."""
    try:
        with open(OUT, encoding='utf-8') as f:
            src = f.read()
    except FileNotFoundError:
        return {}
    if 'const BGG_MECHANICS' in src:
        start = src.index('{', src.index('const BGG_MECHANICS'))
        MECHANICS.update(json.loads(src[start:src.index('};', start) + 1]))
    body = src[src.index('{', src.index('const BGG_EXTRAS')) + 1:src.rindex('}')]
    out = {}
    for line in body.splitlines():
        line = line.strip().rstrip(',')
        if line and not line.startswith('//'):
            k, v = line.split(':', 1)
            out[k.strip()] = json.loads(v)
    return out


def save(data):
    rows = [f'  {k}:{json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in sorted(data.items(), key=lambda kv: int(kv[0]))]
    names = json.dumps(dict(sorted(MECHANICS.items(), key=lambda kv: int(kv[0]))), ensure_ascii=False, separators=(',', ':'))
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(HEADER + f'const BGG_MECHANICS = {names};\n' + 'const BGG_EXTRAS = {\n' + ',\n'.join(rows) + '\n};\n')


def ranges(poll):
    return ','.join(str(r['min']) if r['min'] == r['max'] else f"{r['min']}-{r['max']}" for r in poll or [])


def get_item(bgg_id):
    item = covers.get(f'{API}/geekitems?objectid={bgg_id}&objecttype=thing').get('item') or {}
    time.sleep(covers.DELAY)
    return item


def _minutes(v):
    try:
        return max(0, int(v or 0))
    except (TypeError, ValueError):
        return 0


def item_fields(item):
    """[1 if an expansion, 1 if co-operative, kinds, min time, max time, mechanics]
    from a geekitems answer."""
    links = item.get('links') or {}
    ids = lambda kind: {str(x.get('objectid')) for x in links.get(kind) or []}
    tags = ids('boardgamesubdomain') | ids('boardgamecategory')
    kinds = ''.join(sorted({KINDS[t] for t in tags if t in KINDS}))
    for x in links.get('boardgamemechanic') or []:
        if x.get('objectid') and x.get('name'):
            MECHANICS[str(x['objectid'])] = x['name']
    mechs = ' '.join(sorted(ids('boardgamemechanic'), key=int))
    tmin, tmax = _minutes(item.get('minplaytime')), _minutes(item.get('maxplaytime'))
    return [1 if item.get('subtype') == 'boardgameexpansion' else 0,
            1 if COOP_MECHANIC in ids('boardgamemechanic') else 0, kinds,
            tmin, max(tmin, tmax), mechs]


def overall_rank(dyn):
    for r in dyn.get('rankinfo') or []:
        if str(r.get('rankobjectid')) == '1':   # "Board Game Rank"
            try:
                return int(r.get('rank'))
            except (TypeError, ValueError):
                return 0
    return 0


def fetch_one(bgg_id):
    item = get_item(bgg_id)
    dyn = covers.get(f'{API}/dynamicinfo?objectid={bgg_id}&objecttype=thing').get('item') or {}
    time.sleep(covers.DELAY)
    poll = (dyn.get('polls') or {}).get('userplayers') or {}
    return ([ranges(poll.get('best')), ranges(poll.get('recommended')), int(poll.get('totalvotes') or 0)]
            + item_fields(item) + [overall_rank(dyn)])


def main():
    args = sys.argv[1:]
    auto, refresh = '--auto' in args, '--refresh' in args or '--ranks' in args
    data = load()
    known = [i for i in covers.known_games() if i != '0']
    # missing games, and rows from before the latest fields
    todo = known if refresh else [i for i in known if i not in data or len(data[i]) < ROW_LEN]
    if not todo:
        if not auto:
            print('nothing to do: every game already has BGG data')
        return
    failed = []

    def work(i):
        try:
            data[i] = fetch_one(i)
        except covers.NotFound:
            data[i] = ['', '', 0, 0, 0, '', 0, 0, '', 0]   # BGG has no such game: remember that, don't ask again
        except Exception as e:          # offline, timeout…: try again next time
            failed.append((i, f'{type(e).__name__}: {e}'))

    workers = 1 if auto else 4
    with ThreadPoolExecutor(workers) as ex:
        for n, _ in enumerate(ex.map(work, todo), 1):
            if not auto and n % 50 == 0:
                print(f'{n}/{len(todo)}', flush=True)
    save(data)
    got = len(todo) - len(failed)
    if auto:
        subprocess.run(['git', 'add', OUT], cwd=ROOT, capture_output=True)
        if got:
            print(f'fetch-bgg-extras: added BGG data for {got} game(s)')
        if failed:
            print(f'fetch-bgg-extras: warning: {len(failed)} game(s) failed; will retry next commit')
    else:
        print(f'done: {got} fetched, {len(failed)} failed')
        for i, why in failed[:10]:
            print(f'  FAILED {i}: {why}')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # the hook must never block a commit
        if '--auto' in sys.argv:
            print(f'fetch-bgg-extras: warning: {type(e).__name__}: {e}')
        else:
            raise
