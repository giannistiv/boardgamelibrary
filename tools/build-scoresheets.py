#!/usr/bin/env python3
"""Score sheets for Log a play, from BG Stats exports.

A play scored on a BG Stats score sheet carries the sheet's layout in the
export (the play's "scoresheet": its rows, which count negative, which are
ticks or one-player bonuses). This takes, for each game, the layout of the
latest play scored with one, without anyone's scores, and writes
data/scoresheets.js. Generic sheets (numbered rows, no game's own rows) are
left out: the app has its own rounds sheet for every game.

  python3 tools/build-scoresheets.py [export.json ...]   (default: BGStatsExport.json)
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'scoresheets.js')
GENERIC = re.compile(r'\{row\}')


def row_of(r):
    out = {'l': r.get('label', '').strip()}
    if r.get('negative'):
        out['neg'] = 1
    t = r.get('type')
    if t == 'checkbox':
        out['t'] = 'check'
    elif t == 'radio':
        out['t'] = 'radio'
    elif t == 'radioOverall':
        out['t'] = 'win'
    elif t == 'ignoredForTotal':
        out['t'] = 'stat'
    if 'value' in r and r['value'] is not None:
        v = r['value']
        out['v'] = v if v in ('win', 'lose') else float(v) if '.' in str(v) else int(v)
    if r.get('showWithExpansions'):
        out['opt'] = 1
        out['x'] = r['showWithExpansions']
    return out


def sheet_of(ss):
    groups = ss.get('groups') or ss.get('rounds') or []
    out, seen = [], set()
    for g in groups:
        if g.get('templateId') in seen or g.get('isExtra'):
            continue
        seen.add(g.get('templateId'))
        rows, rseen = [], set()
        for r in g.get('rows', []):
            if r.get('templateId') in rseen or r.get('isExtra'):
                continue
            rseen.add(r.get('templateId'))
            rows.append(row_of(r))
        if not rows:
            continue
        o = {'rows': rows}
        # BG Stats' maxRepeat: -1 a block once, 0 rounds without end, N up to N rounds
        rep = g.get('maxRepeat', -1)
        if rep >= 0:
            o['rep'] = rep
            o['min'] = max(1, g.get('minRepeat') or 1)
        if g.get('minPlayerCount'):
            o['pmin'] = g['minPlayerCount']
        if g.get('maxPlayerCount'):
            o['pmax'] = g['maxPlayerCount']
        out.append(o)
    labels = [r['l'] for g in out for r in g['rows']]
    if not labels or all(GENERIC.search(l) for l in labels):
        return None
    if all(r.get('t') == 'win' for g in out for r in g['rows']):
        return None   # a co-op's won or lost: Log a play's Everyone won / lost does it
    # the same rows in block after block (Sushi Go!'s three rounds): number them
    same = {}
    for g in out:
        same.setdefault(tuple(r['l'] for r in g['rows']), []).append(g)
    for blocks in same.values():
        if len(blocks) > 1 and len(blocks[0]['rows']) > 1:
            for i, g in enumerate(blocks):
                g['h'] = f'Round {i + 1}'
    return out


def main():
    files = sys.argv[1:] or [os.path.join(ROOT, 'BGStatsExport.json')]
    best = {}   # bggId -> (playDate, name, sheet)
    for f in files:
        d = json.load(open(f, encoding='utf-8'))
        games = {g['id']: g for g in d.get('games', [])}
        for p in d.get('plays', []):
            if not p.get('scoresheet'):
                continue
            ss = json.loads(p['scoresheet'])
            game = games.get(p.get('gameRefId'), {})
            bgg = ss.get('bggId') or game.get('bggId')
            sheet = sheet_of(ss)
            if not bgg or not sheet:
                continue
            when = p.get('playDate', '')
            if bgg not in best or when > best[bgg][0]:
                best[bgg] = (when, game.get('name', ''), sheet, ss.get('variantLabel'))
    lines = []
    for bgg in sorted(best, key=lambda k: best[k][1].lower()):
        _, name, sheet, variant = best[bgg]
        entry = {'g': sheet}
        if variant:
            entry['var'] = variant
        lines.append(f'  {bgg}: {json.dumps(entry, ensure_ascii=False, separators=(",", ":"))},   // {name}')
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('// Score sheets for Log a play, by BGG id: the rows of the BG Stats score\n'
                 '// sheet last used for each game (tools/build-scoresheets.py). A group of\n'
                 '// rows: rows, h its heading, rep/min (rounds: up to rep, 0 no end; min to\n'
                 '// start with), pmin/pmax (only at those player counts). A row: l label\n'
                 '// ({round} the round), neg (counts against you),\n'
                 '// t check (a tick worth v) | radio (one player gets v) | win (wins outright)\n'
                 '// | stat (not added up), opt (with an expansion only), x (those expansions).\n'
                 'const SCORESHEETS = {\n' + '\n'.join(lines) + '\n};\n')
    print(f'build-scoresheets: {len(best)} games')


if __name__ == '__main__':
    main()
