#!/usr/bin/env python3
"""Keep data/bgg-top100.js in step with BGG's overall ranking: the 100 best
ranked games, for the "BGG Top 100" challenge.

    python3 tools/fetch-top100.py

BGG has no public list of its ranking (the ranking page turns scripts away),
so this checks the current rank of every game that could be in it: the top
200 as read from BGG on 2026-09-29 (tools/top-seed.json), the current top 100,
every game the site knows that BGG ranks in its top 250 (data/bgg-extras.js)
and the hot list's (data/bgg-hot.js). Games move into the top 100 from just
below it or from the hot list, so this keeps up. Run weekly by
.github/workflows/bgg-sync.yml; public BGG data, no token needed.
"""
import importlib.util
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'bgg-top100.js')
SEED = os.path.join(ROOT, 'tools', 'top-seed.json')
API = 'https://api.geekdo.com/api'
NEARBY = 250   # known games ranked up to here are candidates



def _tool(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, 'tools', file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


covers = _tool('fetch_covers', 'fetch-covers.py')
extras = _tool('fetch_bgg_extras', 'fetch-bgg-extras.py')


def _js_object(path, const):
    """The JSON value assigned to `const` in a data file, or None."""
    try:
        with open(path, encoding='utf-8') as f:
            src = f.read()
    except FileNotFoundError:
        return None
    i = src.find(f'const {const} = ')
    if i < 0:
        return None
    start = src.index('{', i)
    return json.loads(src[start:src.index('};', start) + 1])


def candidates():
    """{bggId: name or ''} of every game that could be in the top 100."""
    out = {}
    with open(SEED, encoding='utf-8') as f:
        for _, gid, name in json.load(f):
            out[gid] = name
    for g in (_js_object(OUT, 'BGG_TOP100') or {}).get('games', []):
        out[g['id']] = g['name']
    for gid, row in extras.load().items():
        if len(row) > 9 and 0 < (row[9] or 0) <= NEARBY:
            out.setdefault(int(gid), '')
    for g in (_js_object(os.path.join(ROOT, 'data', 'bgg-hot.js'), 'BGG_HOT') or {}).get('games', []):
        if 0 < (g.get('rank') or 0) <= NEARBY:
            out.setdefault(g['id'], g.get('name', ''))
    return out


def rank_of(gid):
    dyn = covers.get(f'{API}/dynamicinfo?objectid={gid}&objecttype=thing').get('item') or {}
    time.sleep(covers.DELAY)
    for r in dyn.get('rankinfo') or []:
        if str(r.get('rankobjectid')) == '1':   # "Board Game Rank"
            try:
                return int(r.get('rank'))
            except (TypeError, ValueError):
                return 0
    return 0


def name_and_year(gid):
    item = covers.get(f'{API}/geekitems?objectid={gid}&objecttype=thing').get('item') or {}
    time.sleep(covers.DELAY)
    try:
        year = int(item.get('yearpublished') or 0)
    except ValueError:
        year = 0
    return item.get('name') or f'Game #{gid}', year


def main():
    cands = candidates()
    ranked, failed = [], 0
    for gid, name in cands.items():
        try:
            rank = rank_of(gid)
        except Exception:
            failed += 1
            continue
        if 0 < rank <= 100:
            ranked.append((rank, gid, name))
    if len(ranked) < 90:
        raise RuntimeError(f'only {len(ranked)} of the top 100 found ({failed} lookups failed); keeping the old list')
    ranked.sort()
    before = {g['id']: g for g in (_js_object(OUT, 'BGG_TOP100') or {}).get('games', [])}
    games = []
    for rank, gid, name in ranked[:100]:
        year = before.get(gid, {}).get('year', 0)
        if not name or not year:
            name, year = name_and_year(gid)
        games.append({'id': gid, 'rank': rank, 'name': name, 'year': year})
    payload = {'updated': time.strftime('%Y-%m-%d'), 'games': games}
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write("// BGG's top 100, written by tools/fetch-top100.py (weekly); don't edit by hand.\n")
        f.write('const BGG_TOP100 = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    moved_in = [g['name'] for g in games if g['id'] not in before] if before else []
    print(f'fetch-top100: {len(games)} games from {len(cands)} candidates'
          + (f'; new in the top 100: {", ".join(moved_in)}' if moved_in else ''))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'fetch-top100: {type(e).__name__}: {e}')
        sys.exit(1)
