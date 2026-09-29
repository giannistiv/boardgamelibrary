#!/usr/bin/env python3
"""Keep the friends' game lists in data/games.js in step with their BGG collections.

    python3 tools/sync-collections.py             # sync now
    python3 tools/sync-collections.py --dry-run   # only show what would change
    python3 tools/sync-collections.py --auto      # what the pre-commit hook runs

The lists and the BGG collections that feed them:
    GIANNIS_GAMES   JohnnyDgame   Board South votes
    LGEORGE_GAMES   kukugames     Board South votes
    DIMITRIS_GAMES  Rhogarj       Ilioupoli Bros shelf
Στιβ's GAMES isn't synced like those: it's the physical shelf, with
hand-placed cubbies, and his BGG collection doesn't match it. Instead, a game
that newly appears among his owned games on BGG (johnstiv) is added as a "new
arrival": on no shelf yet (row 0), shown first in the library, waiting to be
placed. What BGG listed last time is kept in tools/owned-baseline.json; the
first run only records it.

A game the collection marks as owned but the list lacks is added (name, year,
players, play time and rating from the collection, weight from the game's BGG
entry; Δημητρης's also get a spine colour and a box size from the weight). A
listed game no longer marked owned is removed, and so are any Board South votes
for it in that library (everyone else's ranking keeps its order). If the votes
can't be updated, the game stays until next time. Entries already in a list
are never rewritten, so hand edits survive.

BGG's XML API needs a token since July 2025. Register an app at
https://boardgamegeek.com/applications, create a token for it and save it in
tools/.bgg-token (gitignored, never commit it) or in the BGG_TOKEN environment
variable. Without a token --auto does nothing.

--auto checks at most once an hour, stages data/games.js when it changes and
never fails the commit. It leaves data/games.js alone when that file has
unstaged edits, so it can't sweep them into the commit.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES_JS = os.path.join(ROOT, 'data', 'games.js')
TOKEN_FILE = os.path.join(ROOT, 'tools', '.bgg-token')
STAMP_FILE = os.path.join(ROOT, 'tools', '.collections-synced')
FIREBASE = 'https://boardgamelibrary0-default-rtdb.europe-west1.firebasedatabase.app'
XMLAPI = 'https://boardgamegeek.com/xmlapi2'
UA = 'boardgamelibrary-sync/1.0 (+https://github.com/giannistiv/boardgamelibrary)'

LISTS = [  # (const in data/games.js, BGG username, Firebase votes path or None)
    ('GIANNIS_GAMES', 'JohnnyDgame', 'boardSouthVotesGiannis'),
    ('LGEORGE_GAMES', 'kukugames', 'boardSouthVotesLGeorge'),
    ('DIMITRIS_GAMES', 'Rhogarj', None),
]
SHELF_LISTS = {'DIMITRIS_GAMES'}  # drawn as spines, so entries need spineColor + boxSize
SPINE_COLORS = ['#2e3a6e', '#2e5a7a', '#2e7a73', '#3a6e3a', '#3b7a4f', '#444b6e',
                '#5a2e7a', '#6e2e2e', '#6e4a2e', '#7a2e52', '#7a3b2e', '#7a6b2e']
SHELF_OWNER = 'johnstiv'   # Στιβ's BGG account, for new arrivals on GAMES
BASELINE_FILE = os.path.join(ROOT, 'tools', 'owned-baseline.json')
# BGG categories the shelf's own tags use (plus Co-op from the mechanic)
SHELF_TAGS = {'Card Game': 'Card Game', 'Party Game': 'Party', 'Deduction': 'Deduction', 'Puzzle': 'Puzzle',
              'Abstract Strategy': 'Abstract', 'Dice': 'Dice', 'Adventure': 'Adventure', 'Fantasy': 'Fantasy'}
MIN_INTERVAL = 3600   # --auto: seconds between syncs
QUEUE_WAIT = 45       # seconds to wait for BGG to build a collection (it answers 202 meanwhile)
DELAY = 1.0           # seconds between BGG requests
THING_BATCH = 20      # BGG's limit on ids per /thing request


class Pending(Exception):
    """BGG is still preparing the collection; it will be ready next time."""


class AuthError(Exception):
    pass


def read_token():
    token = os.environ.get('BGG_TOKEN', '').strip()
    if not token:
        try:
            with open(TOKEN_FILE) as f:
                token = f.read().strip()
        except FileNotFoundError:
            pass
    return token or None


def curl(url, token=None, timeout=30):
    """(status, body). The token goes in through curl's stdin config, so it
    never shows up in the process list."""
    cmd = ['curl', '-sS', '--max-time', str(timeout), '-A', UA, '-w', '\n%{http_code}', '-K', '-', url]
    config = f'header = "Authorization: Bearer {token}"\n' if token else ''
    r = subprocess.run(cmd, input=config.encode(), capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f'curl exit {r.returncode}: {r.stderr.decode().strip()[:120]}')
    body, _, status = r.stdout.decode('utf-8', 'replace').rpartition('\n')
    return int(status), body


def bgg(path, token):
    """GET an XML API path, riding out BGG's 202 'queued' and 429/5xx answers."""
    url = f'{XMLAPI}/{path}'
    deadline, pause = time.time() + QUEUE_WAIT, 2
    while True:
        status, body = curl(url, token)
        time.sleep(DELAY)
        if status == 200:
            root = ET.fromstring(body)
            if root.tag == 'errors' or root.find('error') is not None:
                msg = root.findtext('.//message') or 'unknown error'
                raise RuntimeError(f'BGG said: {msg.strip()}')
            return root
        if status == 401:
            raise AuthError('BGG rejected the token (401): check tools/.bgg-token')
        if status in (202, 429) or status >= 500:
            if time.time() + pause > deadline:
                raise Pending(f'BGG still preparing it (HTTP {status})')
            time.sleep(pause)
            pause = min(pause * 2, 10)
            continue
        raise RuntimeError(f'HTTP {status} for {url}')


def _int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


def _float(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def owned_games(username, token):
    """{bggId: info} for everything the user marks as owned (expansions included,
    like the CSV exports the lists were first built from)."""
    root = bgg(f'collection?username={username}&own=1&stats=1', token)
    games = {}
    for item in root.findall('item'):
        status = item.find('status')
        if status is None or status.get('own') != '1':
            continue
        stats = item.find('stats')
        stats = stats if stats is not None else ET.Element('stats')
        average = stats.find('rating/average')
        games.setdefault(_int(item.get('objectid')), {
            'name': (item.findtext('name') or '').strip(),
            'year': _int(item.findtext('yearpublished')),
            'minp': _int(stats.get('minplayers')),
            'maxp': _int(stats.get('maxplayers')),
            'time': _int(stats.get('playingtime')),
            'rating': _float(average.get('value') if average is not None else None),
        })
    return games


def weights(ids, token):
    """{bggId: (primary name, average weight)} straight from each game's entry."""
    out = {}
    ids = sorted(ids)
    for i in range(0, len(ids), THING_BATCH):
        root = bgg('thing?stats=1&id=' + ','.join(map(str, ids[i:i + THING_BATCH])), token)
        for item in root.findall('item'):
            name = next((n.get('value') for n in item.findall('name') if n.get('type') == 'primary'), '')
            w = item.find('statistics/ratings/averageweight')
            out[_int(item.get('id'))] = (name, _float(w.get('value')) if w is not None else 0.0)
    return out


def thing_details(ids, token):
    """{bggId: details} for a shelf entry, from BGG's /thing (20 ids a call)."""
    out = {}
    ids = sorted(ids)
    for i in range(0, len(ids), THING_BATCH):
        root = bgg('thing?stats=1&id=' + ','.join(map(str, ids[i:i + THING_BATCH])), token)
        for item in root.findall('item'):
            name = item.find("name[@type='primary']")
            links = lambda t: [l.get('value') for l in item.findall(f"link[@type='{t}']")]
            val = lambda tag: (item.find(tag).get('value') if item.find(tag) is not None else '')
            w = item.find('statistics/ratings/averageweight')
            r = item.find('statistics/ratings/average')
            desc = re.sub(r'\s+', ' ', (item.findtext('description') or '')).strip()
            out[_int(item.get('id'))] = {
                'name': name.get('value') if name is not None else '', 'year': _int(val('yearpublished')),
                'minp': _int(val('minplayers')), 'maxp': _int(val('maxplayers')),
                'tmin': _int(val('minplaytime')), 'tmax': _int(val('maxplaytime')),
                'weight': _float(w.get('value')) if w is not None else 0.0,
                'rating': _float(r.get('value')) if r is not None else 0.0,
                'designers': links('boardgamedesigner'), 'mechanics': links('boardgamemechanic'),
                'categories': links('boardgamecategory'), 'description': desc,
            }
    return out


def _short(text, limit=320):
    """The first sentences of a description, within `limit` characters."""
    out = ''
    for sentence in re.split(r'(?<=[.!?])\s+', text):
        if out and len(out) + len(sentence) > limit:
            break
        out = (out + ' ' + sentence).strip()
    return out[:limit]


def shelf_line(gid, d, taken):
    """A GAMES entry for a new arrival: on no shelf yet (row 0), dated today."""
    slug = re.sub(r'[^a-z0-9]+', '_', d['name'].lower()).strip('_')[:40] or 'game'
    ident = slug if slug not in taken else f'{slug}_{gid}'
    taken.add(ident)
    tags = (['Co-op'] if 'Cooperative Game' in d['mechanics'] else []) + \
           [SHELF_TAGS[c] for c in d['categories'] if c in SHELF_TAGS]
    lo, hi = d['minp'] or d['maxp'], d['maxp'] or d['minp']
    t = f"{d['tmin']} min" if d['tmin'] == d['tmax'] or not d['tmax'] else f"{d['tmin']}-{d['tmax']} min"
    j = lambda v: json.dumps(v, ensure_ascii=False)
    parts = [f'id:{j(ident)}', f'name:{j(d["name"])}', f'bggId:{gid}', f'year:{d["year"]}',
             f'designer:{j(", ".join(d["designers"][:3]))}', 'row:0', 'col:0',
             f'newArrival:{j(time.strftime("%Y-%m-%d"))}', f'categories:{j(tags)}',
             f'players:{j(str(lo) if lo == hi else f"{lo}-{hi}")}', f'playTime:{j(t if d["tmin"] else "")}',
             f'complexity:{round(d["weight"], 2)}', f'bggRating:{round(d["rating"], 1)}',
             f'spineColor:{j(spine_color(gid))}', f'boxSize:{j(box_size(d["weight"]))}',
             f'mechanics:{j(d["mechanics"][:6])}', f'description:{j(_short(d["description"]))}']
    return '  {' + ','.join(parts) + '},'


NEW_ARRIVALS_HEAD = '  // ── New arrivals: owned on BGG, not on a shelf yet (row 0) ──'


def new_arrivals(token, src):
    """(games now owned on BGG, True on the first run, new GAMES lines)."""
    owned = owned_games(SHELF_OWNER, token)
    if not owned:
        raise RuntimeError('the collection came back empty (private, or a BGG hiccup)')
    try:
        with open(BASELINE_FILE, encoding='utf-8') as f:
            before = set(json.load(f).get(SHELF_OWNER, []))
    except FileNotFoundError:
        before = None
    block = re.search(r'const GAMES = \[\n(.*?)\n\];', src, re.S).group(1)
    on_shelf = {int(x) for x in re.findall(r'bggId:(\d+)', block)}
    taken = set(re.findall(r'\bid:"([^"]+)"', block))
    fresh = [] if before is None else sorted(set(owned) - before - on_shelf)
    details = thing_details(fresh, token) if fresh else {}
    lines = [shelf_line(gid, details[gid], taken) for gid in fresh if gid in details and details[gid]['name']]
    return set(owned), before is None, lines


def read_votes(path):
    """Board South votes for a library: {voter key: [bggId, ...] in ranked
    order}. None when Firebase can't be read, so nothing gets removed on a guess."""
    status, body = curl(f'{FIREBASE}/{path}.json', timeout=8)
    if status != 200:
        return None
    out = {}
    for voter, picks in (json.loads(body) or {}).items():
        if isinstance(picks, dict):   # an array Firebase stored as {"0": id, …}
            picks = [picks[k] for k in sorted(picks, key=lambda k: int(k) if str(k).isdigit() else 0)]
        out[voter] = [int(v) for v in picks or [] if str(v).isdigit()]
    return out


def drop_votes(path, votes, ids):
    """Take `ids` out of every voter's list (keeping the rest in order).
    True when every changed list was saved."""
    ok = True
    for voter, picks in votes.items():
        keep = [v for v in picks if v not in ids]
        if len(keep) == len(picks):
            continue
        url = f'{FIREBASE}/{path}/{urllib.parse.quote(voter, safe="")}.json'
        r = subprocess.run(['curl', '-sS', '--max-time', '10', '-X', 'PUT', '-d', json.dumps(keep),
                            '-o', '/dev/null', '-w', '%{http_code}', url], capture_output=True)
        ok = ok and r.returncode == 0 and r.stdout.decode().strip() == '200'
    return ok


def box_size(weight):
    # the bands the existing shelf entries were sized with; unknown weight -> md
    if not weight:
        return 'md'
    return 'sm' if weight < 1.6 else 'md' if weight < 2.6 else 'lg' if weight < 3.6 else 'xl'


def spine_color(gid):
    return SPINE_COLORS[(gid * 2654435761 >> 7) % len(SPINE_COLORS)]


def entry_line(gid, g, weight, shelf):
    parts = [f'name:{json.dumps(g["name"], ensure_ascii=False)}', f'bggId:{gid}']
    if shelf:
        parts += [f'spineColor:"{spine_color(gid)}"', f'boxSize:"{box_size(weight)}"']
    parts.append(f'year:{g["year"]}')
    if weight:
        parts.append(f'complexity:{round(weight, 2)}')
    if g['minp'] or g['maxp']:
        lo, hi = g['minp'] or g['maxp'], g['maxp'] or g['minp']
        parts.append(f'players:"{lo}"' if lo == hi else f'players:"{lo}-{hi}"')
    if g['time']:
        parts.append(f'playTime:"{g["time"]} min"')
    if g['rating']:
        parts.append(f'bggRating:{round(g["rating"], 1)}')
    return f'  {gid}:{{{",".join(parts)}}},'


def list_block(src, const):
    m = re.search(r'const ' + const + r' = \{\n(.*?)\n\};', src, re.S)
    if not m:
        raise RuntimeError(f'{const} not found in data/games.js')
    return m


def _line_id(line):
    return int(re.match(r'\s*(\d+):', line).group(1))


def _line_name(line):
    return json.loads(re.search(r'name:("(?:[^"\\]|\\.)*")', line).group(1))


def plan(const, username, votes_path, token, src):
    """Work out one list's changes. Returns (new_body or None, adds, removes,
    unvote, votes, notes): `unvote` are the removed games that have Board South
    votes, which main() takes out of `votes` before writing the list."""
    lines = list_block(src, const).group(1).split('\n')
    current = {_line_id(l): l for l in lines}
    owned = owned_games(username, token)
    if not owned:
        raise RuntimeError('the collection came back empty (private, or a BGG hiccup)')
    add_ids = set(owned) - set(current)
    gone = set(current) - set(owned)
    notes, unvote, votes = [], [], {}
    if len(gone) > max(5, len(current) // 4):
        notes.append(f'{len(gone)} games would go, which looks like a bad read, so nothing was removed')
        gone = set()
    if gone and votes_path:
        votes = read_votes(votes_path)
        if votes is None:
            notes.append('could not read Board South votes, so nothing was removed')
            gone, votes = set(), {}
        else:
            unvote = sorted(gone & {v for picks in votes.values() for v in picks})
    extra = weights(add_ids, token) if add_ids else {}
    adds = []
    for gid in add_ids:
        name, weight = extra.get(gid, ('', 0.0))
        g = dict(owned[gid])
        g['name'] = g['name'] or name or f'Game #{gid}'
        adds.append(entry_line(gid, g, weight, const in SHELF_LISTS))
    if not adds and not gone:
        return None, [], [], unvote, votes, notes
    body = [l for gid, l in current.items() if gid not in gone] + adds
    body.sort(key=lambda l: _line_name(l).lower())  # the lists are kept sorted by name
    removes = [current[gid] for gid in gone]
    return '\n'.join(body), adds, removes, unvote, votes, notes


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, capture_output=True)


def main():
    args = sys.argv[1:]
    auto, dry = '--auto' in args, '--dry-run' in args
    say = (lambda msg: print(f'sync-collections: {msg}')) if auto else print
    token = read_token()
    if not token:
        if not auto:
            print('No BGG token. Register an app at https://boardgamegeek.com/applications, create a\n'
                  'token for it and save it in tools/.bgg-token (or set BGG_TOKEN).')
        return
    if auto:
        try:
            if time.time() - os.path.getmtime(STAMP_FILE) < MIN_INTERVAL:
                return
        except FileNotFoundError:
            pass
        if git('diff', '--quiet', '--', 'data/games.js').returncode != 0:
            say('data/games.js has unstaged edits; skipped this commit')
            return

    with open(GAMES_JS, encoding='utf-8') as f:
        src = f.read()
    all_ok, changed = True, False
    for const, username, votes_path in LISTS:
        label = f'{const} ({username})'
        try:
            body, adds, removes, unvote, votes, notes = plan(const, username, votes_path, token, src)
        except AuthError as e:
            say(str(e))
            return
        except Pending as e:
            say(f'{label}: {e}; will try again next time')
            all_ok = False
            continue
        except Exception as e:
            say(f'{label}: skipped ({type(e).__name__}: {e})')
            all_ok = False
            continue
        for n in notes:
            say(f'{label}: warning: {n}')
        if unvote:
            voters = sorted(v for v, picks in votes.items() if set(picks) & set(unvote))
            names = ', '.join(_line_name(l) for l in removes if _line_id(l) in unvote)
            if dry:
                say(f'{label}: would remove the Board South votes for {names} ({len(voters)} voter(s))')
            elif drop_votes(votes_path, votes, set(unvote)):
                say(f'{label}: removed the Board South votes for {names} ({len(voters)} voter(s))')
            else:
                say(f'{label}: warning: could not update the Board South votes; the list is left as it was')
                all_ok = False
                continue
        if body is None:
            if not auto:
                print(f'{label}: up to date')
            continue
        say(f'{label}: +{len(adds)} -{len(removes)}')
        for l in sorted(adds, key=_line_name):
            say(f'    + {_line_id(l)} {_line_name(l)}')
        for l in sorted(removes, key=_line_name):
            say(f'    - {_line_id(l)} {_line_name(l)}')
        m = list_block(src, const)
        src = src[:m.start(1)] + body + src[m.end(1):]
        changed = True

    # Στιβ's new arrivals
    label = f'GAMES ({SHELF_OWNER})'
    try:
        owned_now, first, lines = new_arrivals(token, src)
        if first:
            say(f'{label}: noted what BGG lists as owned ({len(owned_now)} games); games added from now on become new arrivals')
        elif lines:
            say(f'{label}: +{len(lines)} new arrival{"s" if len(lines) != 1 else ""}')
            for l in lines:
                say(f'    + {_line_name(l)}')
            m = re.search(r'const GAMES = \[\n(.*?)\n\];', src, re.S)
            body = m.group(1)
            if NEW_ARRIVALS_HEAD not in body:
                body += '\n' + NEW_ARRIVALS_HEAD
            src = src[:m.start(1)] + body + '\n' + '\n'.join(lines) + src[m.end(1):]
            changed = True
        elif not auto:
            print(f'{label}: no new games')
        if not dry:
            with open(BASELINE_FILE, 'w', encoding='utf-8') as f:
                json.dump({SHELF_OWNER: sorted(owned_now)}, f)
                f.write('\n')
            if auto:
                git('add', BASELINE_FILE)
    except (Pending, AuthError) as e:
        say(f'{label}: {e}; will try again next time')
        all_ok = False
    except Exception as e:
        say(f'{label}: skipped ({type(e).__name__}: {e})')
        all_ok = False

    if changed and not dry:
        with open(GAMES_JS, 'w', encoding='utf-8') as f:
            f.write(src)
        if auto:
            git('add', 'data/games.js')
    if dry:
        print('(dry run: nothing written)')
    elif all_ok:
        with open(STAMP_FILE, 'w') as f:
            f.write(time.strftime('%Y-%m-%d %H:%M:%S\n'))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # the hook must never block a commit
        if '--auto' in sys.argv:
            print(f'sync-collections: warning: {type(e).__name__}: {e}')
        else:
            raise
