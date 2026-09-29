#!/usr/bin/env python3
"""Keep data/bgg-hot.js in step with BGG's hot list ("The Hotness"): the 50
games trending on BGG right now, with a few facts, whether each is still to
come out, pictures from its gallery, and for its detail sheet BGG's
description, mechanics, categories and designers. A game that drops off the list drops
off here too.

    python3 tools/fetch-hot.py

Run every few hours by .github/workflows/bgg-sync.yml. Public BGG data, so no
token is needed. Facts and pictures are fetched once per game and kept while
it stays on the list; the order and the ups and downs are fresh every run.
"""
import html
import importlib.util
import json
import os
import re
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'bgg-hot.js')
API = 'https://api.geekdo.com/api'
PICTURES = 8          # gallery pictures per game
UPCOMING_OWNERS = 150  # fewer BGG owners than this and it's not out yet
ABOUT_MAX = 2500      # characters of BGG's description kept per game

_spec = importlib.util.spec_from_file_location('fetch_covers', os.path.join(ROOT, 'tools', 'fetch-covers.py'))
covers = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(covers)


def get(url):
    data = covers.get(url)
    time.sleep(covers.DELAY)
    return data


def load():
    try:
        with open(OUT, encoding='utf-8') as f:
            src = f.read()
        return {str(g['id']): g for g in json.loads(src[src.index('{'):src.rindex('}') + 1])['games']}
    except (FileNotFoundError, ValueError, KeyError):
        return {}


def _int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return 0


def pictures(gid):
    """Up to PICTURES gallery pictures: the game's own gallery (components,
    boxes), else everything."""
    for gallery in ('game', 'all'):
        found = get(f'{API}/images?ajax=1&gallery={gallery}&nosession=1&objecttype=thing&objectid={gid}'
                    f'&pageid=1&showcount={PICTURES}&size=thumb&sort=hot').get('images') or []
        if found:
            return [{'s': im.get('imageurl@2x') or im.get('imageurl'), 'l': im.get('imageurl_lg'),
                     'c': (im.get('caption') or '').strip()[:120]} for im in found if im.get('imageurl_lg')]
    return []


def about(html_text):
    """BGG's description (HTML) as plain paragraphs, cut at ABOUT_MAX characters."""
    text = re.sub(r'<br\s*/?>|</p>|</li>|</h\d>', '\n', html_text or '', flags=re.I)
    text = re.sub(r'<li[^>]*>', '\n\u2022 ', text, flags=re.I)
    text = html.unescape(re.sub(r'<[^>]+>', '', text))
    paras, total = [], 0
    for line in text.split('\n'):
        line = re.sub(r'\s+', ' ', line).strip()
        if not line:
            continue
        if total + len(line) > ABOUT_MAX:
            cut = line[:max(0, ABOUT_MAX - total)]
            cut = cut[:cut.rfind('. ') + 1] if '. ' in cut else ''
            if cut:
                paras.append(cut)
            paras.append('\u2026')
            break
        paras.append(line)
        total += len(line)
    return paras


def item_fields(item):
    """What the detail sheet shows, from BGG's page for the game."""
    links = item.get('links') or {}
    names = lambda kind, n=12: [l.get('name') for l in (links.get(kind) or [])[:n] if l.get('name')]
    return {
        'cover': item.get('imageurl@2x') or item.get('imageurl') or '',
        'about': about(item.get('description')),
        'mechs': names('boardgamemechanic'),
        'cats': names('boardgamecategory'),
        'by': names('boardgamedesigner', 3),
    }


def details(gid):
    item = get(f'{API}/geekitems?objectid={gid}&objecttype=thing').get('item') or {}
    dyn = get(f'{API}/dynamicinfo?objectid={gid}&objecttype=thing').get('item') or {}
    st = dyn.get('stats') or {}
    img = (item.get('images') or {})
    return {
        'minp': _int(item.get('minplayers')), 'maxp': _int(item.get('maxplayers')),
        'tmin': _int(item.get('minplaytime')), 'tmax': _int(item.get('maxplaytime')),
        'weight': round(float(st.get('avgweight') or 0), 2),
        'rating': round(float(st.get('average') or 0), 1),
        'owned': _int(st.get('numowned')),
        'img': img.get('previewthumb') or img.get('thumb') or img.get('square200') or '',
        'desc': re.sub(r'\s+', ' ', item.get('short_description') or '').strip()[:300],
        **item_fields(item),
        'pics': pictures(gid),
    }


def main():
    before = load()
    hot = get(f'{API}/hotness?geeksite=boardgame&objecttype=thing&showcount=50').get('items') or []
    if len(hot) < 10:
        raise RuntimeError(f'the hot list came back with {len(hot)} games; keeping the old one')
    this_year = int(time.strftime('%Y'))
    games = []
    for pos, it in enumerate(hot, 1):
        gid = str(it.get('objectid'))
        g = before.get(gid)
        if not g or 'pics' not in g:
            try:
                g = {'id': int(gid), **details(gid)}
            except Exception as e:   # one game failing shouldn't sink the list
                print(f'fetch-hot: {gid}: {type(e).__name__}: {e}')
                g = {'id': int(gid), 'pics': []}
        elif 'mechs' not in g:       # kept from before the detail sheet: add what it shows
            try:
                g.update(item_fields(get(f'{API}/geekitems?objectid={gid}&objecttype=thing').get('item') or {}))
            except Exception as e:
                print(f'fetch-hot: {gid}: {type(e).__name__}: {e}')
        year = _int(it.get('yearpublished'))
        g.update({
            'name': it.get('name') or g.get('name') or f'Game #{gid}',
            'year': year, 'pos': pos, 'delta': _int(it.get('delta')), 'rank': _int(it.get('rank')),
            'img': g.get('img') or ((it.get('images') or {}).get('square100') or {}).get('src@2x', ''),
            'desc': g.get('desc') or re.sub(r'\s+', ' ', it.get('description') or '').strip()[:300],
        })
        g['upcoming'] = 1 if year > this_year or (year >= this_year - 1 and g.get('owned', 0) < UPCOMING_OWNERS) else 0
        games.append(g)
    payload = {'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'games': games}
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write("// BGG's hot list, written by tools/fetch-hot.py (every few hours); don't edit by hand.\n")
        f.write('const BGG_HOT = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    new = [g['name'] for g in games if str(g['id']) not in before]
    gone = [g['name'] for gid, g in before.items() if gid not in {str(x['id']) for x in games}]
    print(f'fetch-hot: {len(games)} games ({sum(g["upcoming"] for g in games)} upcoming); '
          f'{len(new)} new on the list, {len(gone)} dropped off')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'fetch-hot: {type(e).__name__}: {e}')
        sys.exit(1)
