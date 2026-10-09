#!/usr/bin/env python3
"""Keep data/bgg-hot.js in step with the games still to come out, for
Explore → Trending: every live crowdfunding campaign on BGG's crowdfunding
countdown (Kickstarter, Gamefound, BackerKit: how far it's funded, backers,
when it ends, its link) and the games on BGG's hot list ("The Hotness") that
aren't out yet. Each comes with a few facts, pictures from its gallery, and
for its detail sheet BGG's description, mechanics, categories and designers.
A game whose campaign ends and that isn't on the hot list drops off.

    python3 tools/fetch-hot.py

Run every few hours by .github/workflows/bgg-sync.yml. Public BGG data, so no
token is needed. Facts and pictures are fetched once per game and kept while
it stays; the campaigns' numbers and the hot list's order are fresh every run.
"""
import html
import urllib.parse
import importlib.util
import json
import os
import re
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'bgg-hot.js')
API = 'https://api.geekdo.com/api'
PICTURES = 6          # gallery pictures per game
UPCOMING_OWNERS = 150  # fewer BGG owners than this and it's not out yet
ABOUT_MAX = 2500      # characters of BGG's description kept per game
KS_SEARCH = 'https://www.kickstarter.com/discover/advanced?term={}'

_spec = importlib.util.spec_from_file_location('fetch_covers', os.path.join(ROOT, 'tools', 'fetch-covers.py'))
covers = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(covers)


def get(url):
    data = covers.get(url)
    time.sleep(covers.DELAY)
    return data


def load():
    """The last run's games by id, and the hot games it found already out."""
    try:
        with open(OUT, encoding='utf-8') as f:
            src = f.read()
        data = json.loads(src[src.index('{'):src.rindex('}') + 1])
        return {str(g['id']): g for g in data['games']}, set(map(str, data.get('released', [])))
    except (FileNotFoundError, ValueError, KeyError):
        return {}, set()


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


def _real(url):
    return url.startswith('https://') and '%' not in url and 'boardgamegeek.com/project/link' not in url


def campaign_link(c, old):
    """The campaign's page. BGG's countdown gives Kickstarter links without
    the creator ("kickstarter.com/%/parry"); the game version's own record
    has the whole link, looked up once per campaign and kept from the last
    run. Failing that, a Kickstarter search for the campaign."""
    url = (c.get('orderUrl') or '').strip()
    if _real(url):
        return url
    ver = str(c.get('versionid') or '')
    if old and old.get('ver') == ver and _real(old.get('url') or ''):
        return old['url']
    try:
        item = get(f'{API}/geekitems?objectid={ver}&objecttype=version').get('item') or {}
        full = (item.get('orderurl') or '').split('?')[0].strip()
        if _real(full):
            return full
    except Exception as e:
        print(f'fetch-hot: campaign {ver}: {type(e).__name__}: {e}')
    slug = url.rstrip('/').split('/')[-1] if '/' in url else ''
    return KS_SEARCH.format(urllib.parse.quote((slug or c.get('name') or '').replace('-', ' ')))


def campaign(c, old=None):
    """A live crowdfunding campaign, as the tab shows it."""
    return {
        'on': c.get('orderType') or '', 'url': campaign_link(c, old), 'ver': str(c.get('versionid') or ''),
        'ends': c.get('endDate') or '',
        'pct': _int(c.get('progress')), 'backers': _int(c.get('backersCount')),
        'pledged': _int(c.get('pledged')), 'cur': c.get('currency') or '',
        'more': [a.get('name') for a in c.get('additionalItems') or [] if a.get('name')][:6],
    }


def with_details(gid, before):
    """The game from the last run, or fetched from BGG when it's new."""
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
    for k in ('pos', 'delta', 'rank', 'camp', 'upcoming'):   # set afresh every run
        g.pop(k, None)
    g['pics'] = g.get('pics', [])[:PICTURES]
    return g


def main():
    before, released_before = load()
    hot = get(f'{API}/hotness?geeksite=boardgame&objecttype=thing&showcount=50').get('items') or []
    if len(hot) < 10:
        raise RuntimeError(f'the hot list came back with {len(hot)} games; keeping the old one')
    try:
        camps = get(f'{API}/ending_preorder')
        if not isinstance(camps, list) or not camps:
            raise ValueError('no campaigns')
    except Exception as e:           # keep last run's campaigns that haven't ended
        print(f'fetch-hot: crowdfunding: {type(e).__name__}: {e}; keeping the last list')
        camps = None
    this_year = int(time.strftime('%Y'))
    now = time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime())
    games, released = {}, set()

    # every live campaign (BGG's crowdfunding countdown, ending soonest first)
    if camps is None:
        for gid, g in before.items():
            if (g.get('camp') or {}).get('ends', '')[:19] > now:
                games[gid] = dict(g)
                games[gid].pop('pos', None), games[gid].pop('delta', None)
    for c in camps or []:
        item = c.get('item') or {}
        gid = str(item.get('id') or '')
        if not gid.isdigit() or gid in games:
            continue
        old_camp = (before.get(gid) or {}).get('camp')   # (with_details drops it)
        g = with_details(gid, before)
        year = next((_int(d.get('displayValue')) for d in item.get('descriptors') or [] if d.get('name') == 'yearpublished'), 0)
        g.update({'name': item.get('name') or c.get('name') or g.get('name') or f'Game #{gid}',
                  'year': year or g.get('year', 0), 'camp': campaign(c, old_camp)})
        g['img'] = g.get('img') or ((item.get('imageSets') or {}).get('square100') or {}).get('src@2x', '')
        g['desc'] = g.get('desc') or re.sub(r'\s+', ' ', c.get('description') or '').strip()[:300]
        games[gid] = g

    # and the games on BGG's hot list that are still to come out
    for pos, it in enumerate(hot, 1):
        gid = str(it.get('objectid'))
        year = _int(it.get('yearpublished'))
        if gid not in games:
            if (year and year < this_year - 1) or (year <= this_year and gid in released_before):
                released.add(gid)
                continue
            g = with_details(gid, before)
            if year <= this_year and g.get('owned', 0) >= UPCOMING_OWNERS:   # out already
                released.add(gid)
                continue
            g.update({'name': it.get('name') or g.get('name') or f'Game #{gid}', 'year': year})
            g['img'] = g.get('img') or ((it.get('images') or {}).get('square100') or {}).get('src@2x', '')
            g['desc'] = g.get('desc') or re.sub(r'\s+', ' ', it.get('description') or '').strip()[:300]
            games[gid] = g
        games[gid].update({'pos': pos, 'delta': _int(it.get('delta')), 'rank': _int(it.get('rank'))})

    payload = {'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
               'games': list(games.values()), 'released': sorted(released, key=int)}
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write("// Upcoming games: BGG's live crowdfunding campaigns and the hot list's games still to come\n"
                "// out. Written by tools/fetch-hot.py (every few hours); don't edit by hand.\n")
        f.write('const BGG_HOT = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    new = [g['name'] for gid, g in games.items() if gid not in before]
    gone = [g['name'] for gid, g in before.items() if gid not in games]
    print(f'fetch-hot: {sum(1 for g in games.values() if g.get("camp"))} live campaigns, '
          f'{sum(1 for g in games.values() if "pos" in g)} upcoming on the hot list; '
          f'{len(new)} new, {len(gone)} gone')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'fetch-hot: {type(e).__name__}: {e}')
        sys.exit(1)
