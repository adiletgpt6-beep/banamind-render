#!/usr/bin/env python3
"""Read a bounded canonical range without silently dropping long paragraphs."""
import argparse
from pathlib import Path

ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument('source', choices=['S01', 'S02', 'S03'])
ap.add_argument('--start', type=int, required=True)
ap.add_argument('--end', type=int, required=True)
ap.add_argument('--offset', type=int, default=0, help='Character offset in the first requested line')
ap.add_argument('--max-chars', type=int, default=14000)
a = ap.parse_args()
assert 1 <= a.start <= a.end and a.offset >= 0 and 500 <= a.max_chars <= 40000
root = Path(__file__).resolve().parents[3]
lines = (root / f'.tb004-work/sources/{a.source}.txt').read_text('utf-8').splitlines()
remaining = a.max_chars
for no in range(a.start, min(a.end, len(lines)) + 1):
    offset = a.offset if no == a.start else 0
    content = lines[no - 1][offset:]
    piece = content[:remaining]
    print(f'{no}@{offset}: {piece}')
    remaining -= len(piece)
    if len(piece) < len(content):
        print(f'CONTINUE: --start {no} --end {a.end} --offset {offset + len(piece)}')
        break
    if remaining <= 0:
        if no < min(a.end, len(lines)):
            print(f'CONTINUE: --start {no + 1} --end {a.end} --offset 0')
        break
