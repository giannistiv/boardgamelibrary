#!/usr/bin/env python3
"""Write data/bgg-play-notes.js: the notes ("comments") on our BGG plays of a
few games, which BGStats exports leave out.

    python3 tools/fetch-play-notes.py

Spirit Island's notes hold the adversary level ("Level 2\\n\\nSweden"), which
the Spirit Island board on its game page reads. Each play keeps its date, its
notes and its players (BGG's "color" field is the spirit, cut at 32
characters), so the page can tell which of its plays a note belongs to.

Needs the BGG token, like tools/sync-collections.py (tools/.bgg-token or the
BGG_TOKEN environment variable); the BGG sync Action runs it every 6 hours.
"""
import importlib.util
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'bgg-play-notes.js')
_spec = importlib.util.spec_from_file_location('sync_collections', os.path.join(ROOT, 'tools', 'sync-collections.py'))
sync = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sync)

# Games whose notes the site uses, and whose BGG accounts log them.
GAMES = {162886: 'Spirit Island'}
USERS = ['johnstiv', 'Rhogarj']


def plays_of(user, game, token):
    out, page = [], 1
    while True:
        root = sync.bgg(f'plays?username={user}&id={game}&type=thing&page={page}', token)
        got = root.findall('play')
        for p in got:
            players = [{'name': x.get('name') or x.get('username') or '', 'user': x.get('username') or '',
                        'color': x.get('color') or '', 'win': x.get('win') == '1'}
                       for x in p.findall('players/player')]
            out.append({'id': int(p.get('id')), 'date': p.get('date'), 'by': user,
                        'notes': (p.findtext('comments') or '').strip(), 'players': players})
        if len(got) < 100:
            return out
        page += 1


def main():
    token = sync.read_token()
    if not token:
        sys.exit('fetch-play-notes: no BGG token (tools/.bgg-token or BGG_TOKEN)')
    notes = {}
    for game in GAMES:
        rows = []
        for user in USERS:
            rows += plays_of(user, game, token)
        rows.sort(key=lambda r: (r['date'], r['id']))
        notes[game] = rows
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('// Notes on our BGG plays of a few games (BGStats exports leave them out).\n')
        f.write("// Written by tools/fetch-play-notes.py; don't edit by hand.\n")
        f.write('const BGG_PLAY_NOTES = ' + json.dumps(notes, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('fetch-play-notes: ' + ', '.join(f'{GAMES[g]} {len(r)} plays' for g, r in notes.items()))


if __name__ == '__main__':
    main()
