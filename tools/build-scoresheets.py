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
    out = {'l': r.get('label', '').strip(), 'id': r.get('templateId', '')}
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


def sheet_of(ss, heads=False):
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
        o = {'rows': rows, 'tid': g.get('templateId', '1'), 'mr': g.get('maxRepeat', -1)}
        if heads and (g.get('label') or '').strip():
            o['h'] = g['label'].strip()   # "Missions", "Plants": a variant sheet's blocks keep their names
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


# Sheets of our own, for games no BG Stats export has one for: own: 1 (never
# sent to BG Stats as one of its sheets). Clank! Legacy's scoring is its
# rulebook's: the Artifact, cards, tokens (the Mug for escaping, market items,
# secrets) and gold; knocked out without an Artifact or in the Danger Zone,
# you score 0 (v 'zero': a tick that makes the total 0).
OWN = {
    266507: ('Clank! Legacy: Acquisitions Incorporated', {'g': [{'rows': [
        {'l': 'Knocked out: scores 0', 't': 'check', 'v': 'zero'},
        {'l': 'Artifact'},
        {'l': 'Mug (escaped to HQ)', 't': 'check', 'v': 20},
        {'l': 'Cards'},
        {'l': 'Other tokens'},
        {'l': 'Gold'},
    ]}], 'own': 1}),
    # Dorfromantik's score pad (rulebook, End of Game): one score for the whole
    # table (shared: 1), the circles to cross on the Campaign sheet kept beside
    # it (a stat, not points; js/game-boards.js adds them up)
    370591: ('Dorfromantik: The Board Game', {'g': [
        {'h': 'Completed tasks (B)', 'rows': [{'l': 'Forest tasks'}, {'l': 'Grain tasks'}, {'l': 'Village tasks'},
                                              {'l': 'Track tasks'}, {'l': 'Stream tasks'}]},
        {'h': 'Flags and the longest (C, D)', 'rows': [{'l': 'Green Flags'}, {'l': 'Yellow Flags'}, {'l': 'Red Flags'},
                                                       {'l': 'Longest Track'}, {'l': 'Longest Stream'}]},
        {'h': 'Unlocked (E)', 'rows': [{'l': 'Unlocked components'}]},
        {'h': 'Campaign sheet', 'rows': [{'l': 'Circles crossed off', 't': 'stat'}]},
    ], 'own': 1, 'shared': 1}),
}


# A game whose BG Stats sheet depends on the scenario (Welcome to the Moon's
# 8 Adventures, a sheet each) keeps every one, by variant id, in
# SCORESHEET_VARS; Log a play takes the one for the scenario picked
# (js/score-sheet.js, _ssVariantOf). Variants no export has are our own,
# from the rulebook (own: 1). Welcome to the Moon's last three Adventures:
_MISSIONS = {'rows': [{'l': 'A'}, {'l': 'B'}, {'l': 'C'}], 'h': 'Missions'}
OWN_VARS = {
    339789: {
        'adventure6': {'var': 'Adventure #6: The Virus', 'own': 1, 'g': [_MISSIONS, {'rows': [
            {'l': 'Plants and water'}, {'l': 'Evacuated quarters'}, {'l': 'Infected housing spaces', 'neg': 1},
            {'l': 'System Errors', 'neg': 1}]}]},
        'adventure7': {'var': 'Adventure #7: The Escape', 'own': 1, 'g': [_MISSIONS, {'rows': [
            {'l': 'Greenhouses'}, {'l': 'Modules'}, {'l': 'Planning', 'neg': 1}, {'l': 'System Errors', 'neg': 1}]}]},
        'adventure8': {'var': 'Adventure #8: The Battle', 'own': 1, 'g': [
            {'rows': [{'l': 'A'}, {'l': 'B'}, {'l': 'C'}], 'h': 'Missions (both sheets)'}, {'rows': [
            {'l': 'Plants and water'}, {'l': 'Planets'}, {'l': 'Planning', 'neg': 1}, {'l': 'System Errors', 'neg': 1}],
            'h': 'Both sheets added up'}]},
    },
}


def main():
    files = sys.argv[1:] or [os.path.join(ROOT, 'BGStatsExport.json')]
    best = {}   # bggId -> (playDate, name, sheet)
    variants = {}   # bggId -> {variant id: (playDate, entry)}
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
            vid = ss.get('variantId')
            if vid:
                v = variants.setdefault(bgg, {})
                if vid not in v or when > v[vid][0]:
                    entry = {'g': sheet_of(ss, heads=True)}
                    if ss.get('variantLabel'):
                        entry['var'] = ss['variantLabel']
                    entry['vid'] = vid
                    if ss.get('rounds'):
                        entry['fmt'] = 'rounds'
                    v[vid] = (when, entry)
            if bgg not in best or when > best[bgg][0]:
                best[bgg] = (when, game.get('name', ''), sheet, ss.get('variantLabel'),
                             'rounds' if ss.get('rounds') else 'groups', ss.get('variantId'))
    lines = []
    for bgg, (name, entry) in OWN.items():
        if bgg not in best:
            lines.append(f'  {bgg}: {json.dumps(entry, ensure_ascii=False, separators=(",", ":"))},   // {name} (our own)')
    for bgg in sorted(best, key=lambda k: best[k][1].lower()):
        _, name, sheet, variant, fmt, vid = best[bgg]
        entry = {'g': sheet}
        if variant:
            entry['var'] = variant
        if vid:
            entry['vid'] = vid
        if fmt == 'rounds':
            entry['fmt'] = 'rounds'
        lines.append(f'  {bgg}: {json.dumps(entry, ensure_ascii=False, separators=(",", ":"))},   // {name}')
    vlines = []
    for bgg in sorted(set(variants) | set(OWN_VARS)):
        v = {vid: e for vid, (_, e) in sorted(variants.get(bgg, {}).items())}
        for vid, e in OWN_VARS.get(bgg, {}).items():
            v.setdefault(vid, e)
        if len(v) < 2:
            continue
        name = best[bgg][1] if bgg in best else ''
        vlines.append(f'  {bgg}: {{   // {name}')
        for vid in sorted(v):
            vlines.append(f'    {json.dumps(vid)}: {json.dumps(v[vid], ensure_ascii=False, separators=(",", ":"))},')
        vlines.append('  },')
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('// Score sheets for Log a play, by BGG id: the rows of the BG Stats score\n'
                 '// sheet last used for each game (tools/build-scoresheets.py). A group of\n'
                 '// rows: rows, h its heading, rep/min (rounds: up to rep, 0 no end; min to\n'
                 '// start with), pmin/pmax (only at those player counts). A row: l label\n'
                 '// ({round} the round), neg (counts against you),\n'
                 '// t check (a tick worth v) | radio (one player gets v) | win (wins outright)\n'
                 '// | stat (not added up), opt (with an expansion only), x (those expansions).\n'
                 '// BG Stats\' own ids, to send a sheet back (js/bgstats-share.js): fmt\n'
                 '// (rounds), vid (variant), a group\'s tid and mr (maxRepeat), a row\'s id.\n'
                 'const SCORESHEETS = {\n' + '\n'.join(lines) + '\n};\n'
                 '// A sheet for each scenario, where BG Stats has one per variant (Welcome to\n'
                 '// the Moon\'s Adventures): { bggId: { variant id: sheet } }, picked by the\n'
                 '// scenario\'s number; h names a block, own: 1 a sheet of our own.\n'
                 'const SCORESHEET_VARS = {\n' + '\n'.join(vlines) + '\n};\n')
    print(f'build-scoresheets: {len(best)} games')


if __name__ == '__main__':
    main()
