#!/usr/bin/env python3
"""Blood on the Clocktower's character tokens for the Town Square tab
(js/botc.js): every character's official icon, from the official wiki, on a
parchment disc, all in one picture, images/botc/tokens.jpg, a grid of COLS
columns in data/botc.js's BOTC_CHARS order. A token shows its cell of it.

    python3 tools/build-botc-tokens.py [--icons DIR]

Run it again when BOTC_CHARS changes, then set BOTC_TOKEN_N in js/botc.js to
the number it prints and bump the ?v= on tokens.jpg in styles.css. --icons
keeps the downloaded icons in DIR, so a second run doesn't fetch them again.
Needs PyMuPDF (pip install pymupdf).
"""
import argparse, hashlib, json, math, os, re, subprocess, tempfile, time
import pymupdf as fitz

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'botc', 'tokens.jpg')
DATA = os.path.join(ROOT, 'data', 'botc.js')
WIKI = 'https://wiki.bloodontheclocktower.com/images/'
COLS, CELL = 13, 96
PARCHMENT = (0xee / 255, 0xe4 / 255, 0xcc / 255)


def chars():
    s = open(DATA, encoding='utf-8').read()
    return json.loads('[' + re.search(r'const BOTC_CHARS = \[(.*?)\];', s, re.S).group(1) + ']')


def icon(cid, folder):
    """The character's icon from the wiki, where MediaWiki keeps Icon_{id}.png."""
    path = os.path.join(folder, cid + '.png')
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return path
    name = f'Icon_{cid}.png'
    h = hashlib.md5(name.encode()).hexdigest()
    r = subprocess.run(['curl', '-sf', '--max-time', '30', '-o', path, f'{WIKI}{h[0]}/{h[:2]}/{name}'])
    time.sleep(0.5)
    if r.returncode or not os.path.exists(path):
        print('  no icon for', cid)
        return None
    return path


def reach(path):
    """How far the drawing reaches from the middle, as a share of half the icon."""
    pix = fitz.Pixmap(fitz.Pixmap(path), 120, 120, None)
    n, s, w = pix.n, pix.samples, pix.width
    far = 0.0
    for y in range(w):
        for x in range(w):
            if s[(y * w + x) * n + n - 1] > 24:
                far = max(far, math.hypot(x - 59.5, y - 59.5))
    return far / 60


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--icons', help='keep the downloaded icons here')
    folder = ap.parse_args().icons or tempfile.mkdtemp()
    os.makedirs(folder, exist_ok=True)
    rows = chars()
    n = len(rows)
    lines = math.ceil(n / COLS)
    doc = fitz.open()
    page = doc.new_page(width=COLS * CELL, height=lines * CELL)
    page.draw_rect(page.rect, color=None, fill=PARCHMENT)
    for i, row in enumerate(rows):
        path = icon(row[0], folder)
        if not path:
            continue
        # as big as the round token allows: the drawing reaches 94% of its radius
        size = CELL * min(1.25, 0.94 / max(reach(path), 0.01))
        cx, cy = (i % COLS + 0.5) * CELL, (i // COLS + 0.5) * CELL
        page.insert_image(fitz.Rect(cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2), filename=path)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    page.get_pixmap(alpha=False).save(OUT, jpg_quality=84)
    print(f'{n} tokens, {COLS}×{lines}, {os.path.getsize(OUT) // 1024} KB → {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
