#!/usr/bin/env python3
"""Write data/game-news.js: what's new for the games we play. For each game,
its newest expansions and promos, new games that reimplement it (a new
edition, a spin-off), and new English or Greek printings, from BGG.

    python3 tools/fetch-game-news.py          # the stalest games (a share of them)
    python3 tools/fetch-game-news.py --all    # every game

"Our games" are the ones on Στιβ's shelf, and the ones the group has played
twice or more or played since last year (data/play-history.js and the plays
imported into Firebase). That's a few hundred games and three requests each,
so the BGG sync Action refreshes the games checked longest ago, a share per
run, and every game comes round about once a day. Public BGG data: no token.

The game page shows a game's news, and Explore → Trending shows the news for
the games you play, with any live crowdfunding campaign among it.
"""
import importlib.util
import json
import os
import re
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'game-news.js')
API = 'https://api.geekdo.com/api'
FIREBASE = 'https://boardgamelibrary0-default-rtdb.europe-west1.firebasedatabase.app'
PER_RUN = 100         # games refreshed per run (four runs a day: every game about once a day)
RECENT_DAYS = 400     # added to BGG within this many days counts as news
UPCOMING_OWNERS = 150 # fewer BGG owners than this and it's likely not out yet

_spec = importlib.util.spec_from_file_location('fetch_covers', os.path.join(ROOT, 'tools', 'fetch-covers.py'))
covers = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(covers)


def get(url):
    data = covers.get(url)
    time.sleep(covers.DELAY)
    return data


def our_games():
    """{bggId: name-or-''} for the games whose news we follow."""
    year = int(time.strftime('%Y'))
    since = f'{year - 1}-01-01'
    ids = {}
    with open(os.path.join(ROOT, 'data', 'games.js'), encoding='utf-8') as f:
        src = f.read()
    shelf = src[src.index('const GAMES'):]
    for i in re.findall(r'bggId\s*:\s*(\d+)', shelf):
        ids[i] = ''
    with open(os.path.join(ROOT, 'data', 'play-history.js'), encoding='utf-8') as f:
        for line in f:
            m = re.match(r'\s*(\d+)\s*:\s*\[', line)
            if not m:
                continue
            dates = re.findall(r'date:"(\d{4}-\d\d-\d\d)"', line)
            if len(dates) >= 2 or (dates and max(dates) >= since):
                ids.setdefault(m.group(1), '')
    try:
        imported = covers.get(f'{FIREBASE}/importedPlays.json', timeout=20, retries=1) or {}
        count = {}
        for p in imported.values():
            if isinstance(p, dict) and str(p.get('bggId', '')).isdigit():
                k = str(p['bggId'])
                count[k] = count.get(k, 0) + 1
                if count[k] >= 2 or (p.get('date') or '') >= since:
                    ids.setdefault(k, '')
    except Exception as e:
        print(f'fetch-game-news: no Firebase plays this time ({e})')
    ids.pop('0', None)   # games with no BGG page
    return ids


def linked(gid, index, n):
    url = (f'{API}/geekitem/linkeditems?ajax=1&linkdata_index={index}&nosession=1&objectid={gid}'
           f'&objecttype=thing&pageid=1&showcount={n}&sort=yearpublished')
    return get(url).get('items') or []


FOREIGN = re.compile(r'[äöüßéèêàâñçãõąęłńśźżčřšžåøæ]|[Ѐ-ӿ぀-ヿ一-鿿가-힯]', re.I)


def item(it, kind, year_now, cutoff):
    year = int(it.get('yearpublished') or 0)
    posted = (it.get('postdate') or '')[:10]
    if not (year >= year_now - 1 or posted >= cutoff):
        return None
    name = it.get('name') or ''
    if re.search(r'\bfan\b|fan-made|homebrew', name, re.I):
        return None
    if kind == 'printing':
        # only printings in a language we read
        if not re.search(r'english|greek|[Ͱ-Ͽ]', name, re.I) or year < year_now - 1:
            return None
    elif FOREIGN.search(name):   # a German/French/... edition of an expansion: not news to us
        return None
    if kind == 'expansion' and re.search(r'\bpromo\b', name, re.I):
        kind = 'promo'
    owned = int(it.get('numowned') or 0) if it.get('numowned') is not None else None
    imgs = it.get('images') or {}
    return {'id': int(it.get('objectid')), 'name': name, 'kind': kind, 'year': year, 'posted': posted,
            **({'owned': owned} if owned is not None else {}),
            'img': imgs.get('square200') or imgs.get('thumb') or '',
            'href': it.get('href') or '',
            'soon': year > year_now or (kind in ('expansion', 'edition') and owned is not None and owned < UPCOMING_OWNERS and year >= year_now)}


def news_for(gid, year_now, cutoff):
    out = []
    for index, kind, n in (('boardgameexpansion', 'expansion', 12), ('reimplementation', 'edition', 5), ('boardgameversion', 'printing', 12)):
        try:
            for it in linked(gid, index, n):
                x = item(it, kind, year_now, cutoff)
                if x:
                    out.append(x)
        except covers.NotFound:
            pass
    out.sort(key=lambda x: (x['soon'], x['posted']), reverse=True)
    return out


def load():
    try:
        with open(OUT, encoding='utf-8') as f:
            src = f.read()
        return json.loads(src[src.index('{'):src.rindex('}') + 1])
    except (FileNotFoundError, ValueError):
        return {'games': {}, 'checked': {}}


def main():
    year_now = int(time.strftime('%Y'))
    cutoff = time.strftime('%Y-%m-%d', time.gmtime(time.time() - RECENT_DAYS * 86400))
    data = load()
    games, checked = data.get('games', {}), data.get('checked', {})
    ours = our_games()
    for gid in set(games) | set(checked):   # a game we no longer follow drops off
        if gid not in ours:
            games.pop(gid, None)
            checked.pop(gid, None)
    todo = sorted(ours, key=lambda g: checked.get(g, ''))
    if '--all' not in sys.argv:
        todo = todo[:PER_RUN]
    failed = 0
    for gid in todo:
        try:
            n = news_for(gid, year_now, cutoff)
        except Exception as e:
            failed += 1
            print(f'fetch-game-news: {gid}: {type(e).__name__}: {e}')
            if failed >= 5:
                break
            continue
        if n:
            games[gid] = n
        else:
            games.pop(gid, None)
        checked[gid] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    payload = {'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
               'games': dict(sorted(games.items(), key=lambda kv: int(kv[0]))),
               'checked': dict(sorted(checked.items(), key=lambda kv: int(kv[0])))}
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write("// What's new for the games we play: new expansions and promos, new editions and\n"
                "// English/Greek printings, from BGG. Written by tools/fetch-game-news.py; don't edit by hand.\n")
        f.write('const GAME_NEWS = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f'fetch-game-news: checked {len(todo) - failed} of {len(ours)} games; '
          f'{len(games)} have news ({sum(len(v) for v in games.values())} items)')


if __name__ == '__main__':
    main()
