#!/usr/bin/env python3
"""Write data/rove.js: what the Rove campaign tab needs to know about the game
(the Campaign tab on Rove's game page, js/rove-campaign.js).

    python3 tools/build-rove-data.py

Classes (base → prime → apex, health, ether limit, affinities, traits),
quests and encounters, and the item catalogue (slot, price, merchant level)
come from the data files of Rove Assistant (roveassistant.com), a fan-made
companion app. The rest is the official campaign sheets (core and Xulc, as
published at roveassistant.com/files): milestones, reward armor and weapons,
the adversary ether fields, the Xulc infestation stages.

The page loads data/rove.js on its own when the tab opens, so the rest of the
site doesn't carry it.
"""
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'rove.js')
SRC = 'https://www.roveassistant.com/assets/assets'


def get(path):
    r = subprocess.run(['curl', '-sSL', '--fail', '--max-time', '60', f'{SRC}/{path}'], capture_output=True, check=True)
    return json.loads(r.stdout)


# ── From the campaign sheets ──
MILESTONES = [
    ('ahma', 1, 'Subdued the Ahma'),
    ('sovereign', 2, 'Dispatched the Sovereign'),
    ('advocate', 2, 'Dispatched the Advocate'),
    ('balatronists', 3, 'Encountered the Balatronists'),
    ('absolute', 3, 'Vanquished the Absolute'),
    ('king_rejoined', 4, 'Rejoined The King of Storms'),
    ('svaraka', 5, 'Conquered the Svaraka'),
    ('zeepurah', 6, 'Zeepurah was…', ['contained', 'lost', 'slain']),
    ('querists', 7, 'Rescued Querists', ['0', '1', '2', '3']),
    ('progenitor', 7, 'Vanquished the Progenitor'),
    ('king_galvanized', 8, 'Galvanized The King of Storms'),
    ('ambush', 'bonus', 'Intervened in an ambush'),
]
REWARD_ARMOR = ['Ahma Cowl', 'Ezmenite Plate', 'Gruv Scale-Mail', 'Miasma Cape', 'Gallant Crown', 'Coruscant Amblers',
                'Twisted Chargers', 'Thundering Hikers', 'Thick Briarshawl', 'Ethereal Catena', 'Ethereal Aegis', 'Zyderos Cuirass']
REWARD_WEAPONS = ['Cutting Galewing', 'Tindervine Ward', 'Ezmenite Lance', 'Scour Brand', 'Mercurial Bough', "Rakifa's Garrote",
                  "Zaghan's Limb", "Uzem's Judgment", 'Ezmenite Guard', "Zeepurah's Piercer"]
# Adversary ether fields: per quest range, the aura (☀) and miasma (☾) effect, a choice of A or B from quest 3 on.
ETHER_FIELDS = [
    {'id': 'q0_2', 'label': 'Quest 0–2', 'aura': [['', '+2']], 'miasma': [['', '−2']]},
    {'id': 'q3_4', 'label': 'Quest 3–4', 'aura': [['A', '+2'], ['B', '+2 · you recover 1']], 'miasma': [['A', '−2'], ['B', '−2 · you suffer 1']]},
    {'id': 'q5_6', 'label': 'Quest 5–6', 'aura': [['A', '+1 · you and one ally recover 1'], ['B', '+2 · you recover 1']],
     'miasma': [['A', '−1 · you and one ally suffer 1'], ['B', '−2 · you suffer 1']]},
    {'id': 'q7_9', 'label': 'Quest 7–9', 'aura': [['A', '+3'], ['B', '+2 · you recover 1']], 'miasma': [['A', '−3'], ['B', '−2 · you suffer 1']]},
]
# The campaign's shape: the prologue, then a choice between two quests at
# each step. Quest 5 follows Quest 1 and Quest 6 follows Quest 2; Quest 8
# follows Quest 3 and Quest 7 follows Quest 4. A bonus encounter sits between
# the chapters.
CHAPTERS = [
    {'quests': ['0']},
    {'quests': ['1', '2']},
    {'bonus': 'chapter_2.I'},
    {'quests': ['3', '4']},
    {'bonus': 'chapter_3.I'},
    {'quests': ['5', '6'], 'after': {'5': '1', '6': '2'}},
    {'bonus': 'chapter_4.I'},
    {'quests': ['7', '8'], 'after': {'7': '4', '8': '3'}},
    {'bonus': 'chapter_5.I'},
    {'quests': ['9']},
]
XULC = {
    'encounters': [
        ('1', 'The Nameless Black of a Name'), ('2', 'Nidifugous by Nature'), ('3', 'Keen Debtors'), ('4', 'Ought Never to Sprout'),
        ('5', 'Knowable Only by Analogy'), ('6', 'Mapping Oblivion'), ('7', 'Half in Another World'),
        ('8', 'Thief of Light, Giver of Light'), ('9', 'Promethean Purpose'), ('10', 'Collapse, Greying & Disintegration'),
    ],
    # 1, then 2–4 in any order, 5, then 6–8 in any order, 9, 10
    'groups': [['1'], ['2', '3', '4'], ['5'], ['6', '7', '8'], ['9'], ['10']],
    'milestones': [
        ('ally', 'Made a Powerful Ally'), ('samples', 'Acquired the Samples'), ('shop', 'The Shop is Open'),
        ('merchant_deck', 'Unlocked Xulc merchant deck'), ('nidus', 'Slayed the Nidus'), ('ritual', 'Completed the Ritual'),
        ('marl', 'Hra “Marl” has joined you'), ('ether_charged', 'Hra “Ether-Charged” has joined you'),
        ('merchants', 'Rescued the Merchants… Again'), ('mountain', 'Hra The Mountain'),
    ],
    'infestation': [
        ('1', '+3 health · +1 infected card (doesn\'t count against your hand size)'),
        ('2', '+1 infected card (counts against your hand size)'),
        ('3', '+1 infected trait (replaces one of your traits)'),
        ('4', '−3 health, or +1 infected card (counts against your hand size)'),
    ],
    'ether': {'id': 'q10', 'label': 'Quest 10', 'aura': [['', '+3 · you suffer 2']], 'miasma': [['', '−3 · you recover 2']]},
}


# Where the app's data and the printed sheet spell an item differently, the sheet wins.
SPELLING = {'Tendervine Ward': 'Tindervine Ward'}


def main():
    classes = get('core/classes.json')['classes'] + get('xulc/classes.json')['classes']
    out_classes = []
    for c in classes:
        if c['name'] == 'Infected':
            continue   # the Xulc infestation, not a class you pick
        rb = c.get('rulebook_description') or {}
        out_classes.append({
            'name': c['name'], 'tier': c['evolution'], 'base': c.get('base') or (c['name'] if c['evolution'] == 'base' else ''),
            'prime': c.get('prime') or '', 'x': c.get('expansion') == 'xulc',
            'hp': c.get('health'), 'ether': c.get('ether_limit'), 'def': c.get('defense'),
            'color': '#' + c.get('color_rgb', '888888'),
            'aff': {k: v for k, v in (c.get('affinities') or {}).items() if k in ('fire', 'water', 'ice', 'earth', 'wind', 'crux', 'morph')},
            'start': c.get('starting_equipment') or [],
            'summons': [s['name'] for s in c.get('summons') or []],
            'traits': [t['name'] for t in c.get('traits') or []],
            **({'style': {k: rb[k] for k in ('complexity', 'melee', 'range', 'defense', 'support') if k in rb}} if rb else {}),
        })

    quests = {}
    for f in ('core/quests.json',):
        for q in get(f)['quests']:
            encs = [{'id': e['id'], 'title': e['title'], **({'after': e['requires_quest']} if e.get('requires_quest') else {})}
                    for e in q.get('encounters') or []]
            title = re.sub(r'^Quest \d+ • ', '', q['title'])
            quests[q['id']] = {'id': q['id'], 'title': title, 'encounters': encs}

    items = []
    for f, x in (('core/items.json', False), ('xulc/items.json', True)):
        for it in get(f)['items']:
            name = SPELLING.get(it['name'], it['name'])
            items.append({'id': it.get('card_id') or name, 'name': name, 'slot': it.get('slot_type') or '',
                          'hands': it.get('slots') or 1, 'price': it.get('price') or 0,
                          **({'ml': it['merchant_level']} if it.get('merchant_level') else {}),
                          **({'reward': True} if it.get('reward') else {}), **({'x': True} if x else {})})

    data = {
        'classes': out_classes, 'quests': quests, 'chapters': CHAPTERS, 'items': items,
        'milestones': [{'id': m[0], 'quest': m[1], 'label': m[2], **({'options': m[3]} if len(m) > 3 else {})} for m in MILESTONES],
        'rewardArmor': REWARD_ARMOR, 'rewardWeapons': REWARD_WEAPONS, 'etherFields': ETHER_FIELDS,
        'xulc': {'encounters': [{'id': i, 'title': t} for i, t in XULC['encounters']], 'groups': XULC['groups'],
                 'milestones': [{'id': i, 'label': t} for i, t in XULC['milestones']],
                 'infestation': [{'stage': s, 'text': t} for s, t in XULC['infestation']], 'ether': XULC['ether']},
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('// Rove: classes, quests, items and the campaign sheets, for the Campaign tab on its game page.\n')
        f.write("// Written by tools/build-rove-data.py from Rove Assistant's data and the campaign sheets; don't edit by hand.\n")
        f.write('const ROVE_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f'build-rove-data: {len(out_classes)} classes, {len(quests)} quests, {len(items)} items')


if __name__ == '__main__':
    main()
