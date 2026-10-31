#!/usr/bin/env python3
"""The Codenames: Critical Role Adventures artwork for its Campaign tab
(js/cncr-campaign.js): CGE's printable campaign maps and hero sheets, as
images in images/cncr/, and where each box on them is, in data/cncr.js "art".

    python3 tools/build-cncr-art.py

Downloads the two PDFs from Czech Games Edition (the game's downloads page),
renders the left copy of each A4 page (each holds two A5 copies; Wildemount
and Marquet lie on their side, so they're turned upright), and reads the
boxes from the PDFs' own shapes: the mission circles, shops, fail counter and
treasure on the maps; the roll modifiers, hearts, XP boxes, ability tabs,
item slots, FCG's Stress slots and Nott's curse on the sheets. Each box is
[x, y, w, h] as fractions of its image. Needs PyMuPDF (pip install pymupdf).
"""
import json, os, re, subprocess, tempfile
import pymupdf as fitz

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'cncr')
DATA = os.path.join(ROOT, 'data', 'cncr.js')
CGE = 'https://filemanager.czechgames.com/storage/files/codenames-critical-role-adventures/other-downloads/'
PDFS = {'maps': CGE + 'campaign-maps-full-color/cncr-maps-en-A4_no_bleed-color.pdf',
        'sheets': CGE + 'hero-sheets-full-color/cncr-hero_sheets-en-A4_no_bleed-color.pdf'}
SCALE = 2.4
TMP = tempfile.mkdtemp()

def pdf(which):
    path = os.path.join(TMP, which + '.pdf')
    if not os.path.exists(path):
        subprocess.run(['curl', '-sSfL', '--max-time', '120', '-o', path, PDFS[which]], check=True)
    return path

os.makedirs(OUT, exist_ok=True)
art = {'maps': {}, 'heroes': {}}

def render(page, rot, name):
    clip = fitz.Rect(0, 0, page.rect.width / 2, page.rect.height)
    M = fitz.Matrix(SCALE, SCALE).prerotate(rot)
    pix = page.get_pixmap(matrix=M, clip=clip)
    with open(os.path.join(OUT, name), 'wb') as f:
        f.write(pix.tobytes('jpeg', jpg_quality=78))
    origin = (clip * M)
    ox, oy = min(origin.x0, origin.x1), min(origin.y0, origin.y1)
    W, H = pix.width, pix.height
    def box(r):
        q = fitz.Rect(r) * M
        x0, x1 = sorted((q.x0, q.x1)); y0, y1 = sorted((q.y0, q.y1))
        return [round((x0 - ox) / W, 4), round((y0 - oy) / H, 4), round((x1 - x0) / W, 4), round((y1 - y0) / H, 4)]
    return box, (W, H), clip

# ── maps ──
maps = fitz.open(pdf('maps'))
LOCKED = {'taldorei': '4c', 'wildemount': '2c', 'marquet': '6'}
SHOPS = {'taldorei': [('s1', 'stilben'), ('s2', 'emon')], 'wildemount': [('s1', 'rexxentrum'), ('s2', 'syrinlya')], 'marquet': [('s1', 'ank'), ('s2', 'yios')]}
for i, (key, rot) in enumerate([('taldorei', 0), ('wildemount', -90), ('marquet', -90)]):
    p = maps[i]
    box, size, clip = render(p, rot, f'map-{key}.jpg')
    imgs = [fitz.Rect(im['bbox']) for im in p.get_image_info() if fitz.Rect(im['bbox']).x1 <= clip.x1 + 1]
    circles = [r for r in imgs if 13 <= r.width <= 19 and 13 <= r.height <= 19]
    words = {}
    for w in p.get_text('words'):
        if w[2] <= clip.x1 + 1: words.setdefault(w[4].lower(), []).append(fitz.Rect(w[:4]))
    ctr = lambda r: ((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)
    dist = lambda a, b: ((ctr(a)[0] - ctr(b)[0]) ** 2 + (ctr(a)[1] - ctr(b)[1]) ** 2) ** 0.5
    # the fail counter: the column of circles by "MISSION FAIL COUNTER"
    fail_w = words['counter'][0]
    fails = sorted([r for r in circles if dist(r, fail_w) < 110 and r.width < 16.5], key=lambda r: dist(r, fail_w))[:5]
    rest = [r for r in circles if r not in fails]
    mis = {}
    for w, rects in words.items():
        k = LOCKED[key] if w == '?' else w
        if not re.fullmatch(r'\d([ab](-\d)?)?|\?', w): continue
        r = rects[0]
        if key != 'taldorei' and w in ('3', '5', '7') and r.x0 > 300: continue   # the fail counter's "Split 3"
        if key == 'taldorei' and w in ('3', '5', '7') and r.y0 > 480: continue
        c = min(rest, key=lambda q: dist(q, r))
        mis[k] = box(c)
    used = {tuple(v) for v in mis.values()}
    shops = {}
    for sk, place in SHOPS[key]:
        pw = next(rs[0] for w, rs in words.items() if w.startswith(place))
        cands = [r for r in rest if tuple(box(r)) not in used]
        shops[sk] = box(min(cands, key=lambda q: dist(q, pw)))
    tw = words['treasure'][0]
    chest = min([r for r in imgs if 50 < r.width < 90], key=lambda q: dist(q, tw))
    fb = [box(r) for r in fails]
    fb.sort(key=lambda b: (b[1], b[0]))
    art['maps'][key] = {'img': f'map-{key}.jpg', 'w': size[0], 'h': size[1], 'm': mis, 'shops': shops, 'fails': fb, 'treasure': box(chest)}
    print(key, size, sorted(mis), shops, len(fb))

# ── hero sheets ──
sheets = fitz.open(pdf('sheets'))
ORDER = ['dorian', 'fcg', 'grog', 'jester', 'nott', 'percy', 'vex']
def clusters(rects, tol=6):
    out = []
    for r in rects:
        cx, cy = (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2
        for c in out:
            if abs(c['cx'] - cx) < tol and abs(c['cy'] - cy) < tol: c['r'] |= r; break
        else: out.append({'cx': cx, 'cy': cy, 'r': fitz.Rect(r)})
    return out
for i, hid in enumerate(ORDER):
    p = sheets[i]
    box, size, clip = render(p, 0, f'hero-{hid}.jpg')
    ds = [x for x in p.get_drawings() if x['rect'].x1 <= clip.x1 + 1]
    hearts = clusters([x['rect'] for x in ds if 54 <= x['rect'].width <= 60 and 45 <= x['rect'].height <= 53 and x['rect'].y1 < 330])
    hearts.sort(key=lambda c: (round(c['cy'] / 20), c['cx']))
    hexes = sorted(clusters([x['rect'] for x in ds if 27 <= x['rect'].width <= 33 and 30 <= x['rect'].height <= 36 and x['rect'].y1 < 230]), key=lambda c: c['cx'])
    white = lambda x: x.get('fill') and all(abs(a - 1) < 0.01 for a in x['fill']) and len(x['items']) == 8
    bx = [x['rect'] for x in ds if white(x) and ((abs(x['rect'].width - 28) < 1.5 and abs(x['rect'].height - 32.4) < 1.5) or (abs(x['rect'].width - 14.8) < 1 and abs(x['rect'].height - 17.2) < 1))]
    rows = {}
    for b in clusters(bx, 4):
        k = next((k for k in rows if abs(k - b['cy']) < 8), b['cy'])
        rows.setdefault(k, []).append(b)
    xp = [box(b['r']) for y in sorted(rows) for b in sorted(rows[y], key=lambda b: b['cx'])]
    words = [w for w in p.get_text('words') if w[2] <= clip.x1 + 1]
    tabs = sorted([w for w in words if w[4] in ('1', '2', '3') and 380 < w[1] < 420], key=lambda w: w[0])
    n = len(tabs)
    top = min(w[1] for w in tabs) - 4
    tabr = [box(fitz.Rect(clip.x1 * k / n, top, clip.x1 * (k + 1) / n, clip.y1)) for k in range(n)]
    h = {'img': f'hero-{hid}.jpg', 'w': size[0], 'h': size[1], 'mods': [box(c['r']) for c in hexes], 'hearts': [box(c['r']) for c in hearts], 'xp': xp, 'tabs': tabr,
         'slots': [box(fitz.Rect(0, 92, 24, 116)), box(fitz.Rect(0, 288, 24, 312))]}
    if hid == 'fcg':
        sq = sorted([c['r'] for c in clusters([x['rect'] for x in ds if 115 < x['rect'].y0 < 175 and 30 < x['rect'].width < 40 and 44 < x['rect'].height < 52])], key=lambda r: r.x0)
        if len(sq) == 3:   # the first slot (its token printed) drawn otherwise: one step to the left
            step = sq[1].x0 - sq[0].x0
            sq.insert(0, fitz.Rect(sq[0].x0 - step, sq[0].y0, sq[0].x1 - step, sq[0].y1))
        assert len(sq) == 4, sq
        h['stress'] = [box(r) for r in sq]
    if hid == 'nott':
        get = lambda t, y0, y1: next(fitz.Rect(w[:4]) for w in words if w[4] == t and y0 < w[1] < y1)
        h['curse'] = [box(get('1', 225, 255) + (-9, -6, 9, 6)), box(get('20', 225, 255) + (-6, -6, 6, 6))]
        nim, luc = get('NIMBLE', 175, 195), get('LUCKY', 175, 195)
        h['nimble'] = box(fitz.Rect(nim.x0 - 38, nim.y0 - 4, nim.x1 + 52, 308))
        h['lucky'] = box(fitz.Rect(luc.x0 - 44, luc.y0 - 4, luc.x1 + 40, 308))
        h['names'] = [box(get('NOTT', 0, 60) + (-6, 0, 6, 0)), box(get('VETH', 0, 60) + (-6, 0, 6, 0))]
    art['heroes'][hid] = h
    print(hid, len(h['mods']), len(h['hearts']), len(xp), len(tabr))

# into data/cncr.js, in place of the "art" it has
with open(DATA, encoding='utf-8') as f:
    src = f.read()
lines = ['"art":{',
         '"maps":{' + ',\n'.join(f'"{k}":' + json.dumps(v, separators=(',', ':')) for k, v in art['maps'].items()) + '},',
         '"heroes":{' + ',\n'.join(f'"{k}":' + json.dumps(v, separators=(',', ':')) for k, v in art['heroes'].items()) + '}',
         '}']
i = src.index('"art":{')
src = src[:i] + '\n'.join(lines) + '\n};\n'
with open(DATA, 'w', encoding='utf-8') as f:
    f.write(src)
print('build-cncr-art: images in images/cncr/, boxes in data/cncr.js')
