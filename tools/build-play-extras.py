#!/usr/bin/env python3
"""What the BG Stats exports know about plays beyond the plays themselves.

data/play-extras.js gets:
  PLAY_EXTRAS     bggId -> play time ("YYYY-MM-DD HH:MM:SS", as in
                  data/play-history.js) -> { x: [expansion ids played with],
                  ss: { category: { player: points } } } — the expansions from
                  the play's expansionPlays, the points from its score sheet
                  (rounds added up per row; ticks count their value; outright
                  wins, stats-only rows and numbered rounds left out)
  EXPANSIONS_OF   base game id -> [[expansion id, name], ...]: the expansions
                  anyone here owns (data/games.js, data/collections.js), has
                  played with, or has score sheet rows for; their base games
                  from BGG, kept in tools/expansion-bases.json between runs

  python3 tools/build-play-extras.py [export.json ...]   (default: BGStatsExport.json)
"""
import json
import os
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'play-extras.js')
CACHE = os.path.join(ROOT, 'tools', 'expansion-bases.json')
TOKEN = os.path.join(ROOT, 'tools', '.bgg-token')
ROUNDS = re.compile(r'\{(row|round|roundLabel)\}|^Round \d+$')


def num(v):
    try:
        return float(str(v).replace(',', '.'))
    except (TypeError, ValueError):
        return None


def breakdown(ss, uuid_name):
    """{category: {player: points}} from a play's score sheet."""
    out = {}
    for g in ss.get('groups') or ss.get('rounds') or []:
        for r in g.get('rows', []):
            label = (r.get('label') or '').strip()
            t = r.get('type')
            if not label or ROUNDS.search(label) or t in ('radioOverall', 'ignoredForTotal'):
                continue
            for uuid, v in (r.get('scores') or {}).items():
                name = uuid_name.get(uuid)
                if not name or v in (None, '', False):
                    continue
                if t in ('checkbox', 'radio'):
                    x = num(r.get('value'))
                    if x is None or not v or str(v).lower() == 'false':
                        continue
                else:
                    x = num(v)
                    if x is None:
                        continue
                if r.get('negative'):
                    x = -abs(x)
                cat = out.setdefault(label, {})
                cat[name] = round(cat.get(name, 0) + x, 2)
    return {k: v for k, v in out.items() if v}


def owned_expansions():
    """Every game id in the owned lists that BGG calls an expansion (node reads the data files)."""
    js = """
const vm=require('vm'),fs=require('fs');const c={};vm.createContext(c);
for(const f of ['data/games.js','data/collections.js','data/bgg-extras.js']) vm.runInContext(fs.readFileSync(f,'utf8').replace(/^const /gm,'var '),c);
const ids=new Set();
for(const g of c.GAMES) if(g.bggId>0) ids.add(+g.bggId);
for(const k of ['DIMITRIS_GAMES','GIANNIS_GAMES','LGEORGE_GAMES']) for(const id in c[k]||{}) ids.add(+id);
for(const u in c.BGG_COLLECTIONS) for(const id in c.BGG_COLLECTIONS[u]) ids.add(+id);
console.log(JSON.stringify([...ids].filter(id=>c.BGG_EXTRAS[id] && c.BGG_EXTRAS[id][3]===1)));
"""
    return json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))


def lookup(ids, cache):
    """Fill the cache with each expansion's name and base games, 20 at a time from BGG."""
    todo = [i for i in ids if str(i) not in cache]
    if not todo:
        return
    token = open(TOKEN).read().strip()
    for k in range(0, len(todo), 20):
        batch = todo[k:k + 20]
        url = f'https://boardgamegeek.com/xmlapi2/thing?id={",".join(map(str, batch))}'
        for attempt in range(5):
            # curl, as the other tools: the system's certificates, and BGG's 202 "come back" answered by waiting
            r = subprocess.run(['curl', '-sS', '--max-time', '60', '-w', '\\n%{http_code}', '-H', f'Authorization: Bearer {token}', url],
                               capture_output=True)
            body, _, code = r.stdout.decode('utf-8', 'replace').rpartition('\n')
            if r.returncode == 0 and code == '200':
                root = ET.fromstring(body)
                break
            print(f'build-play-extras: BGG answered {code or r.stderr.decode()[:80]}, waiting', file=sys.stderr)
            time.sleep(5 * (attempt + 1))
        else:
            raise SystemExit('build-play-extras: BGG did not answer')
        for item in root.findall('item'):
            name = next((n.get('value') for n in item.findall('name') if n.get('type') == 'primary'), '')
            bases = [int(l.get('id')) for l in item.findall('link')
                     if l.get('type') == 'boardgameexpansion' and l.get('inbound') == 'true']
            cache[item.get('id')] = {'n': name, 'b': bases}
        for i in batch:
            cache.setdefault(str(i), {'n': '', 'b': []})
        time.sleep(2)


def import_sources():
    """data/import-sources.js: a friend's export, matched to our people as the app's import does."""
    js = """
const vm=require('vm'),fs=require('fs');const c={};vm.createContext(c);
vm.runInContext(fs.readFileSync('data/import-sources.js','utf8').replace(/^const /gm,'var '),c);
console.log(JSON.stringify(c.IMPORT_SOURCES));
"""
    return json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))


def main():
    files = sys.argv[1:] or [os.path.join(ROOT, 'BGStatsExport.json')]
    sources = import_sources()
    extras, played_with, sheet_exps, names = {}, {}, {}, {}
    for f in files:
        d = json.load(open(f, encoding='utf-8'))
        games = {g['id']: g for g in d.get('games', [])}
        # Στιβ's own export keeps its names (the app's NAME_MAP reads them); a
        # friend's is matched by player uuid, and the plays with Στιβ are his copy's
        owner = str((d.get('userInfo') or {}).get('bggUsername') or '').lower()
        src = next((v for v in sources.values() if v.get('bgg') == owner), None)
        players = {p['id']: (src['players'].get(p.get('uuid')) if src else None) or (p.get('name') or '').strip()
                   for p in d.get('players', [])}
        for p in d.get('plays', []):
            if src:
                people = {players.get(s.get('playerRefId')) for s in p.get('playerScores', [])}
                if people & set(src.get('skipWith', [])) and p.get('uuid') not in src.get('importAnyway', []):
                    continue
            game = games.get(p.get('gameRefId')) or {}
            bgg = game.get('bggId')
            when = p.get('playDate')
            if not bgg or not when:
                continue
            e = {}
            xs = []
            for x in p.get('expansionPlays') or []:
                xg = games.get(x.get('gameRefId')) or {}
                if xg.get('bggId'):
                    xs.append(xg['bggId'])
                    names[xg['bggId']] = xg.get('name') or ''
                    played_with.setdefault(bgg, set()).add(xg['bggId'])
            if xs:
                e['x'] = sorted(set(xs))
            if p.get('scoresheet'):
                ss = json.loads(p['scoresheet'])
                uuid_name = {}
                for s in p.get('playerScores', []):
                    try:
                        meta = json.loads(s.get('metaData') or '{}')
                    except ValueError:
                        meta = {}
                    if meta.get('scoreUuid'):
                        uuid_name[meta['scoreUuid']] = players.get(s.get('playerRefId'), '')
                b = breakdown(ss, uuid_name)
                if b:
                    e['ss'] = b
                for g in ss.get('groups') or ss.get('rounds') or []:
                    for r in g.get('rows', []):
                        for xid in r.get('showWithExpansions') or []:
                            sheet_exps.setdefault(bgg, set()).add(xid)
            if e:
                extras.setdefault(str(bgg), {})[when] = e

    owned = owned_expansions()
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    every = set(owned) | {x for s in played_with.values() for x in s} | {x for s in sheet_exps.values() for x in s}
    lookup(sorted(every), cache)
    json.dump(cache, open(CACHE, 'w'), ensure_ascii=False, indent=0, sort_keys=True)

    of = {}
    for xid in owned:
        for base in cache.get(str(xid), {}).get('b', []):
            of.setdefault(base, set()).add(xid)
    for base, xs in list(played_with.items()) + list(sheet_exps.items()):
        of.setdefault(base, set()).update(xs)
    expansions_of = {str(b): sorted([[x, cache.get(str(x), {}).get('n') or names.get(x, '')] for x in xs], key=lambda e: e[1].lower())
                     for b, xs in sorted(of.items())}

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('// What the BG Stats exports know beyond the plays, and which expansions go\n'
                 '// with which game. Written by tools/build-play-extras.py; don\'t edit by hand.\n'
                 '//   PLAY_EXTRAS[bggId][play time] = { x: [expansion ids], ss: { category: { player: points } } }\n'
                 '//   EXPANSIONS_OF[bggId] = [[expansion id, name], ...]\n')
        fh.write('const PLAY_EXTRAS = ' + json.dumps(extras, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
        fh.write('const EXPANSIONS_OF = ' + json.dumps(expansions_of, ensure_ascii=False, separators=(',', ':')) + ';\n')
    n_ss = sum(1 for g in extras.values() for e in g.values() if 'ss' in e)
    n_x = sum(1 for g in extras.values() for e in g.values() if 'x' in e)
    print(f'build-play-extras: {n_ss} plays with points by category, {n_x} with expansions, '
          f'{len(expansions_of)} games with expansions ({len(owned)} owned expansions)')


if __name__ == '__main__':
    main()
