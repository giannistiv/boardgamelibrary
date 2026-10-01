#!/usr/bin/env python3
"""Write data/marvel-champions.js: every Marvel Champions product in release
order, with its wave, heroes and scenarios (villains, recommended modular sets,
card art), for the Marvel Champions campaign on the Ilioupoli page.

    python3 tools/build-mc-data.py

Everything comes from MarvelCDB's public API (packs, and every card with the
encounter cards), so new products appear on their own when this runs. A few
products MarvelCDB doesn't describe yet (no encounter cards or no pack at all)
are filled in from the publisher's announcements below.

Waves: a new wave starts with the Core Set and with each campaign box, and
takes in every hero pack and scenario pack released after it, until the next
campaign box. (Wave 1: Core Set … Hulk; wave 2: The Rise of Red Skull …
Scarlet Witch; and so on.)

Community numbers come from Marvel Champions Tracker's public all-player stats
(marvelchampionstracker.com/stats): each scenario's win rate in games played
with the Expert set, and each hero's win rate overall and per aspect. That's
about 140 small requests, so it's a snapshot taken when this runs;
--no-stats keeps the numbers already in the file.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'marvel-champions.js')
API = 'https://marvelcdb.com/api/public'
IMG = 'https://marvelcdb.com'

# Announced but not (fully) on MarvelCDB yet. date: US release (estimated when only the month is known).
EXTRA_PRODUCTS = [
    {'code': 'shadowland', 'name': 'Shadowland', 'date': '2026-10-30', 'type': 'scenario', 'heroes': [],
     'scenarios': [{'id': 'shadowland', 'name': 'Shadowland', 'villains': ['The Hand'], 'modulars': []}],
     'note': 'Scenario pack: Daredevil against the Hand. Announced for fall 2026.'},
    {'code': 'elektra', 'name': 'Elektra', 'date': '2026-11-20', 'type': 'hero', 'heroes': [{'id': 'elektra', 'name': 'Elektra', 'alter': 'Elektra Natchios'}], 'scenarios': []},
    {'code': 'iron_fist', 'name': 'Iron Fist', 'date': '2026-11-20', 'type': 'hero', 'heroes': [{'id': 'iron_fist', 'name': 'Iron Fist', 'alter': 'Danny Rand'}], 'scenarios': []},
]
# Encounter content MarvelCDB doesn't have yet, by pack code.
EXTRA_SCENARIOS = {
    'fne': [
        {'id': 'fne_bullseye', 'name': 'Bullseye', 'villains': ['Bullseye'], 'modulars': []},
        {'id': 'fne_electro', 'name': 'Electro', 'villains': ['Electro'], 'modulars': []},
        {'id': 'fne_hammerhead', 'name': 'Hammerhead', 'villains': ['Hammerhead'], 'modulars': []},
        {'id': 'fne_purple_man', 'name': 'Purple Man', 'villains': ['Purple Man'], 'modulars': []},
        {'id': 'fne_typhoid_mary', 'name': 'Typhoid Mary', 'villains': ['Typhoid Mary'], 'modulars': []},
        {'id': 'fne_kingpin', 'name': 'Kingpin', 'villains': ['Kingpin'], 'modulars': [], 'final': True},
    ],
}
# The Civil War boxes have hero "leaders" instead of villains: one scenario per leader.
LEADER_PACKS = {'cw': 'campaign', 'synthezoid': 'scenario'}
NOTES = {
    'cw': 'No villains: you face hero leaders, Iron Man and Captain Marvel for Registration, Captain America and Spider-Woman for the Resistance.',
    'synthezoid': 'Leaders again: She-Hulk and Vision, on opposite sides of the Registration Act.',
    'fne': "Kingpin's underlings in any order, then Kingpin himself.",
    'mojo': 'Three scenarios in the Mojoverse.',
    'toafk': 'One scenario: Kang through five versions of himself.',
    'twc': 'One scenario: the four members of the Wrecking Crew at once.',
}


def get(path):
    r = subprocess.run(['curl', '-sSL', '--fail', '--max-time', '120', f'{API}/{path}'], capture_output=True, check=True)
    return json.loads(r.stdout)


def clean(text):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', text or '')).strip()


SET_FIX = {"Batrocs's Brigade": "Batroc's Brigade", 'S.H.I.E.L.D': 'S.H.I.E.L.D.'}
# Scenarios whose modular sets are a rule rather than a list.
MODULAR_RULES = {
    'magog': '1 random modular set from the Mojo Mania pack',
    'spiral': '3 modular sets from the Mojo Mania pack',
    'mojo': '1 modular set + 1 per player, from the Mojo Mania pack',
    'the_hood': '7 modular sets of your choice; they enter the deck one at a time',
    'thunderbolts': '1 + 1 per player modular sets that have an Elite Thunderbolt minion',
}
NAME_FIX = {'MaGog': 'Magog', 'Brotherhood Of Badoon': 'Brotherhood of Badoon'}


def modulars_of(text):
    t = clean(text)
    found = re.findall(r'modular (?:encounter )?sets?\.?\s*\(([^)]*)\)', t, re.I)
    out = []
    for f in found:
        f = re.sub(r'^recommended:\s*', '', f.strip(' .'), flags=re.I)
        for part in re.split(r',\s*|\s+and\s+', f):
            part = re.sub(r'^and\s+', '', part.strip(' .'))
            if part:
                out.append(SET_FIX.get(part, part))
    return out


# --- Marvel Champions Tracker community stats --------------------------------
MCT = 'https://marvelchampionstracker.com'


def _norm(s):
    s = re.sub(r'^the\s+', '', (s or '').lower())
    return re.sub(r'[^a-z0-9]', '', s)


class Tracker:
    """The tracker's stats page asks for each table, then polls until it's ready. curl, like get()."""
    def __init__(self):
        import tempfile
        self.jar = tempfile.NamedTemporaryFile(suffix='.cookies', delete=False).name
        page = self._curl(MCT + '/stats/').decode()
        self.token = re.search(r'csrf_token = "([^"]+)"', page).group(1)
        self._dash = {}

    def _curl(self, url, *extra):
        r = subprocess.run(['curl', '-sSL', '--fail', '--max-time', '60', '-A', 'boardgamelibrary build-mc-data',
                            '-c', self.jar, '-b', self.jar, *extra, url], capture_output=True, check=True)
        return r.stdout

    def kickoff(self, path, body):
        return json.loads(self._curl(MCT + path, '-X', 'POST', '-H', f'X-CSRFToken: {self.token}', '-H', 'Content-Type: application/json',
                                     '-H', f'Referer: {MCT}/stats/', '--data', json.dumps(body)))

    def _get(self, url):
        return json.loads(self._curl(url))

    def poll(self, path, task_id, widget):
        for _ in range(60):
            q = urllib.parse.urlencode([('task_ids[]', task_id)])
            got = self._get(f'{MCT}{path}?{q}').get(widget) or {}
            if got.get('state') == 'SUCCESS':
                return got.get('data')
            if got.get('state') == 'FAILURE':
                return None
            time.sleep(1.5)
        return None

    def one(self, widget, public_id=None):
        """A dashboard widget, or one villain's or hero's details; None when the site won't say."""
        for attempt in range(4):
            try:
                return self._one(widget, public_id)
            except (subprocess.CalledProcessError, ValueError, KeyError):
                time.sleep(5 * (attempt + 1))
        print(f'  no answer for {widget} {public_id or ""}', file=sys.stderr)
        return None

    def _one(self, widget, public_id=None):
        if public_id:
            k = self.kickoff('/api/stats/aggregate/more-details-kickoff/', {widget: {'public_id': public_id, 'dates': None}})
            return self.poll('/api/stats/aggregate/more-details-polling/', k[widget], widget)
        if widget not in self._dash:
            self._dash = self.kickoff('/api/stats/aggregate/dashboard-kickoff/', {})
        return self.poll('/api/stats/aggregate/dashboard-polling/', self._dash[widget], widget)


def community_stats():
    t = Tracker()
    villains = t.one('villains_widget') or []
    heroes = t.one('heroes_widget') or []
    vs = {}
    for v in villains:
        if not v.get('rough_count') or v['vs']['name'] == 'Custom Content':
            continue
        d = t.one('villains_widget', v['vs']['public_id']) or {}
        ex = next((m for m in d.get('modulars_used', []) if m['modular'].get('is_expert_set')), None)
        vs[_norm(v['vs']['name'])] = {'wrAll': round(v['win_rate'], 3), 'nAll': v['rough_count'],
                                      **({'wr': round(ex['win_rate'], 3), 'n': ex['rough_count']} if ex and ex.get('rough_count') else {})}
        time.sleep(1)
    hs = {}
    for h in heroes:
        if not h.get('rough_count') or h['hero']['name'] == 'Custom Content':
            continue
        d = t.one('heroes_widget', h['hero']['public_id']) or {}
        asp = {a.lower(): {'wr': round(x['win_rate'], 3), 'n': x['rough_count']}
               for a, x in (d.get('aspect_breakdown') or {}).items()
               if a in ('Aggression', 'Justice', 'Leadership', 'Protection', "'Pool") and x.get('rough_count')}
        hs[_norm(h['hero']['name'])] = {'wr': round(h['win_rate'], 3), 'n': h['rough_count'], 'aspects': asp}
        time.sleep(1)
    print(f'community stats: {len(vs)} scenarios, {len(hs)} heroes', file=sys.stderr)
    return vs, hs


# How a hero's deck is built, when it isn't "one aspect of your choice".
HERO_ASPECT_RULE = {
    'spider_woman': 'two aspects',
    'warlock': 'all four aspects, one of each',
    'deadpool': "'Pool only",
}


def rules_text(text):
    """A main scheme's Contents and Setup paragraphs, readable: the expert stages, sets and setup."""
    t = clean(text)
    t = re.sub(r'\[\[([^\]]+)\]\]', lambda m: m.group(1).title(), t)
    t = re.sub(r'\[per_hero\]', ' per player', t)
    t = re.sub(r'\[(\w+)\]', lambda m: m.group(1).title(), t)
    t = re.sub(r'\s+([.,)])', r'\1', t).replace('( ', '(')
    m = re.search(r'Contents?\s*:\s*(.*?)(?:\s*Setup\s*:\s*(.*))?$', t, re.I)
    if not m:
        return '', ''
    contents = re.sub(r'^Scenario\s+', '', m.group(1)).strip()
    contents = contents.replace("Batrocs's", "Batroc's").replace('MaGog', 'Magog')
    contents = re.sub(r'S\.H\.I\.E\.L\.D(?!\.)', 'S.H.I.E.L.D.', contents)
    return contents, (m.group(2) or '').strip()


def villains_mentioned(text, villains_by_set):
    """Villain sets a scenario's Contents line names (the Wrecking Crew's four, the Marauders)."""
    t = clean(text)
    out = []
    for s, names in villains_by_set.items():
        if s and re.search(r'\b' + re.escape(s) + r'\b', t):
            out += [s] if len(names) > 1 and s not in names else names
    return out


def read_existing():
    try:
        s = open(OUT, encoding='utf-8').read()
        return json.loads(s[s.index('['):s.rindex(']') + 1])
    except (OSError, ValueError):
        return []


def main():
    packs = get('packs/')
    cards = get('cards/?encounter=1')
    by_pack = {}
    for c in cards:
        by_pack.setdefault(c['pack_code'], []).append(c)
    for v in by_pack.values():
        v.sort(key=lambda c: c.get('position') or 0)

    products = []
    for p in sorted(packs, key=lambda p: (p.get('available') or '9999', p.get('position') or 0)):
        code = p['code']
        pc = by_pack.get(code, [])
        heroes = []
        seen = set()
        for c in pc:
            if c.get('type_code') == 'hero' and c.get('card_set_code') and c['card_set_code'] not in seen:
                seen.add(c['card_set_code'])
                alter = c.get('linked_card') or {}
                heroes.append({'id': c['card_set_code'], 'name': c['name'].replace(' Suit', ''),
                               'alter': (c.get('linked_to_name') or '').replace(' Suit', ''),
                               'hp': c.get('health'), 'hand': c.get('hand_size'), 'handAE': alter.get('hand_size'),
                               'thw': c.get('thwart'), 'atk': c.get('attack'), 'def': c.get('defense'), 'rec': alter.get('recover'),
                               'traits': [t.strip() for t in (c.get('traits') or '').split('.') if t.strip()],
                               **({'aspectRule': HERO_ASPECT_RULE[c['card_set_code']]} if c['card_set_code'] in HERO_ASPECT_RULE else {}),
                               'img': IMG + c['imagesrc'] if c.get('imagesrc') else ''})
        scenarios = []
        if code in LEADER_PACKS:
            for c in pc:
                if c.get('type_code') == 'leader' and not any(s['name'] == c['name'] for s in scenarios):
                    nm = c['name'].replace('Spider Woman', 'Spider-Woman')
                    scenarios.append({'id': f'{code}_{c["card_set_code"] or c["name"]}'.lower().replace(' ', '_'), 'name': nm,
                                      'villains': [nm], 'modulars': [], 'img': IMG + c['imagesrc'] if c.get('imagesrc') else '', 'leader': True})
        else:
            villains_by_set = {}
            img_by_set = {}
            for c in pc:
                if c.get('type_code') == 'villain':
                    names = villains_by_set.setdefault(c.get('card_set_name'), [])
                    nm = NAME_FIX.get(c['name'], c['name'])
                    if nm not in names:
                        names.append(nm)
                    if c.get('card_set_name') not in img_by_set and c.get('imagesrc'):
                        img_by_set[c['card_set_name']] = IMG + c['imagesrc']
            for c in pc:
                if c.get('type_code') == 'main_scheme' and 'Contents' in (c.get('text') or ''):
                    s = c.get('card_set_name')
                    if any(x['name'] == NAME_FIX.get(s, s) for x in scenarios):
                        continue
                    sid = (c.get('card_set_code') or s).lower()
                    vill = villains_by_set.get(s) or villains_mentioned(c.get('text'), villains_by_set)
                    img = img_by_set.get(s) or next((img_by_set[v] for v in villains_by_set if v in img_by_set and (v in vill or set(villains_by_set[v]) & set(vill))), '')
                    contents, setup = rules_text(c.get('text'))
                    scenarios.append({'id': sid, 'name': NAME_FIX.get(s, s), 'scheme': c['name'], 'villains': vill,
                                      'modulars': [MODULAR_RULES[sid]] if sid in MODULAR_RULES else modulars_of(c.get('text')), 'img': img,
                                      'contents': contents, 'setup': setup})
        if code in EXTRA_SCENARIOS and not scenarios:
            scenarios = EXTRA_SCENARIOS[code]
        if code == 'core':
            kind = 'core'
        elif code in LEADER_PACKS:
            kind = LEADER_PACKS[code]
        elif len(scenarios) >= 5 or (heroes and scenarios):
            kind = 'campaign'
        elif scenarios:
            kind = 'scenario'
        elif heroes:
            kind = 'hero'
        else:
            continue   # print-and-play modular sets and the like
        products.append({'code': code, 'name': p['name'], 'date': p.get('available') or '', 'type': kind, 'pos': p.get('position'),
                         'heroes': heroes, 'scenarios': scenarios, **({'note': NOTES[code]} if code in NOTES else {})})

    have = {p['code'] for p in products}
    for x in EXTRA_PRODUCTS:
        if x['code'] not in have:
            products.append(dict(x, upcoming=True))
    products.sort(key=lambda p: (p['date'] or '9999', p.get('pos') or 999))
    wave = 0
    for p in products:
        if p['type'] in ('core', 'campaign'):
            wave += 1
        p['wave'] = max(wave, 1)
        p.pop('pos', None)

    # community win rates: fresh, or the ones already in the file
    if '--no-stats' in sys.argv:
        old = {(s['id']): s for p in read_existing() for s in p['scenarios']}
        oldh = {(h['id']): h for p in read_existing() for h in p['heroes']}
        for p in products:
            for s in p['scenarios']:
                s.update({k: v for k, v in old.get(s['id'], {}).items() if k in ('wr', 'n', 'wrAll', 'nAll')})
            for h in p['heroes']:
                h.update({k: v for k, v in oldh.get(h['id'], {}).items() if k in ('wr', 'n', 'aspects')})
    else:
        vs, hs = community_stats()
        alias = {'thunderbolts': 'citizenv'}
        for p in products:
            for s in p['scenarios']:
                k = _norm(s['name'])
                st = vs.get(alias.get(k, k))
                if st:
                    s.update(st)
            for h in p['heroes']:
                st = hs.get(_norm(f"{h['name']} ({h['alter']})")) or hs.get(_norm(h['name']))
                if st:
                    h.update(st)
        miss = [s['name'] for p in products if not p.get('upcoming') for s in p['scenarios'] if 'wrAll' not in s]
        missh = [h['name'] for p in products if not p.get('upcoming') for h in p['heroes'] if 'wr' not in h]
        if miss or missh:
            print('no community numbers for:', miss, missh, file=sys.stderr)

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('// Marvel Champions products in release order, with waves, heroes and scenarios.\n')
        f.write('// Written by tools/build-mc-data.py from MarvelCDB and Marvel Champions Tracker; don\'t edit by hand.\n')
        f.write('// wr/n: community win rate and games with the Expert set (scenarios), overall (heroes); wrAll/nAll: every difficulty.\n')
        f.write(f"const MC_STATS_DATE = '{time.strftime('%Y-%m-%d')}';\n")
        f.write('const MC_PRODUCTS = ' + json.dumps(products, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f'build-mc-data: {len(products)} products, {sum(len(p["heroes"]) for p in products)} heroes, '
          f'{sum(len(p["scenarios"]) for p in products)} scenarios, {products[-1]["wave"]} waves')


if __name__ == '__main__':
    main()
