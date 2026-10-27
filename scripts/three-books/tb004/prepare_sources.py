#!/usr/bin/env python3
"""Verify originals, conversion and normalized texts, then prepare private reading copies."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import sys
import tempfile


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--originals', action='store_true')
    args = ap.parse_args()
    root = Path(__file__).resolve().parents[3]
    episode = root / 'three-books/episodes/TB-004'
    manifest = json.loads((episode / 'SOURCE_MANIFEST.json').read_text('utf-8'))
    if sha((root / manifest['conversion_tool']).read_bytes()) != manifest['conversion_tool_sha256']:
        raise SystemExit('Converter fingerprint mismatch')
    sys.path.insert(0, str(root / 'scripts/three-books'))
    from extract_epub_txt import extract
    if [s['id'] for s in manifest['sources']] != ['S01', 'S02', 'S03']:
        raise SystemExit('Expected three supplied source containers')
    verified = []
    with tempfile.TemporaryDirectory(prefix='tb004-verify-') as temp:
        for s in manifest['sources']:
            packed = (root / s['repository_path']).read_bytes()
            assert len(packed) == s['archive_bytes'] and sha(packed) == s['archive_sha256'], s['id'] + ': gzip'
            data = gzip.decompress(packed)
            assert len(data) == s['bytes'] and sha(data) == s['sha256'], s['id'] + ': UTF-8'
            text = data.decode('utf-8')
            assert '\ufffd' not in text and len(text.splitlines()) == s['lines'], s['id'] + ': lines'
            index_data = (episode / s['index_file']).read_bytes()
            assert sha(index_data) == s['index_sha256'], s['id'] + ': index'
            index = json.loads(index_data)
            original_parts = []
            for part in s['original_parts']:
                b = (root / part['repository_path']).read_bytes()
                assert len(b) == part['bytes'] and sha(b) == part['sha256'], s['id'] + ': part'
                original_parts.append(b)
            original = b''.join(original_parts)
            assert len(original) == s['input_bytes'] and sha(original) == s['input_sha256'], s['id'] + ': original'
            tmp = Path(temp) / (s['id'] + ('.epub' if s['input_format'] == 'epub' else '.zip'))
            tmp.write_bytes(original)
            roundtrip, meta = extract(tmp, s['id'])
            assert roundtrip.encode('utf-8') == data, s['id'] + ': conversion round trip'
            assert meta['headings'] == index['headings'], s['id'] + ': heading index'
            assert meta['members'] == index['members'], s['id'] + ': archive inventory'
            if s['input_format'] == 'epub':
                assert meta['spine'] == index['spine'] and meta['documents'] == index['documents'], 'EPUB order/structure'
            verified.append((s, data, original, index))
    work = root / '.tb004-work'
    work.mkdir(exist_ok=True)
    (work / '.gitignore').write_text('*\n', encoding='utf-8')
    out = work / 'sources'
    out.mkdir(exist_ok=True)
    nav = ['# TB-004: private source navigation', '',
           'Line numbers refer to complete UTF-8 files. These books are not release assets.', '']
    for s, data, original, index in verified:
        (out / (s['id'] + '.txt')).write_bytes(data)
        nav += ['## ' + s['id'], '', s['title'], '']
        nav += [f'{h["line"]}: {h["title"]}' for h in index['headings']]
        nav += ['']
        if args.originals:
            target = root / s['original_reconstruct_path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(original)
        print(f'{s["id"]}: {s["input_format"]}, {s["lines"]} lines, CRC/SHA + full conversion verified')
    (out / 'INDEX.md').write_text('\n'.join(nav) + '\n', encoding='utf-8')
    print('Next: read SOURCE_MAP.md and .tb004-work/sources/INDEX.md; no uploads are needed.')


if __name__ == '__main__':
    main()
