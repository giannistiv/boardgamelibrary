#!/usr/bin/env python3
"""Stamp local JS/CSS references in index.html with a content hash.

    <script src="js/profile.js?v=1a2b3c4d">   <link href="styles.css?v=...">

A file's URL only changes when its contents change, so after a deploy
browsers re-fetch exactly the files that changed and keep the rest cached.
This stops a phone from mixing a new file with a stale cached one (GitHub
Pages caches each file independently for 10 minutes).

Hashes the *staged* version of each file when available, so the stamp always
matches what is being committed. Run by .githooks/pre-commit; safe to run
by hand. Only rewrites index.html when a stamp actually changes.
"""
import hashlib
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')
ASSET_RE = re.compile(r'(src|href)="((?:js|data)/[^"?]+\.js|styles\.css)(?:\?v=[0-9a-f]*)?"')


def content(path):
    """Staged bytes if the file is in the git index, else the working copy."""
    try:
        return subprocess.check_output(['git', 'show', ':' + path], cwd=ROOT,
                                       stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        with open(os.path.join(ROOT, path), 'rb') as f:
            return f.read()


def main():
    with open(INDEX, encoding='utf-8') as f:
        html = f.read()
    missing = []

    def stamp(m):
        attr, path = m.group(1), m.group(2)
        try:
            digest = hashlib.sha1(content(path)).hexdigest()[:8]
        except FileNotFoundError:
            missing.append(path)
            return m.group(0)
        return f'{attr}="{path}?v={digest}"'

    stamped = ASSET_RE.sub(stamp, html)
    if missing:
        sys.exit('stamp-assets: referenced file(s) not found: ' + ', '.join(missing))
    if stamped != html:
        with open(INDEX, 'w', encoding='utf-8') as f:
            f.write(stamped)
        print('stamp-assets: updated asset versions in index.html')


if __name__ == '__main__':
    main()
