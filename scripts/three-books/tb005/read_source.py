#!/usr/bin/env python3
"""Read canonical ranges or physical PDF pages with explicit long-line continuation."""
import argparse
import json
from pathlib import Path

ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('source',choices=['S01','S02','S03'])
ap.add_argument('--page',type=int)
ap.add_argument('--layer',choices=['canonical','alternate'],default='canonical')
ap.add_argument('--start',type=int);ap.add_argument('--end',type=int)
ap.add_argument('--offset',type=int,default=0);ap.add_argument('--max-chars',type=int,default=14000)
a=ap.parse_args();root=Path(__file__).resolve().parents[3];ep=root/'three-books/episodes/TB-005'
if a.layer=='alternate' and a.source!='S02':ap.error('Alternate layer exists only for S02 PDF')
filename=a.source+('_ALT' if a.layer=='alternate' else '')+'.txt'
lines=(root/'.tb005-work/sources'/filename).read_text('utf-8').splitlines()
if a.page is not None:
    if a.source!='S02' or a.start is not None or a.end is not None:ap.error('Use --page only for S02, without line range')
    idx=json.loads((ep/('S02_ALTERNATE_INDEX.json' if a.layer=='alternate' else 'S02_INDEX.json')).read_text())
    if not 1<=a.page<=670:ap.error('Physical PDF page is 1..670')
    p=idx['pages'][a.page-1];a.start=p['first_line'];a.end=p['last_line']
if a.start is None or a.end is None:ap.error('Provide --start/--end or --page')
assert 1<=a.start and a.end>=a.start-1 and a.offset>=0 and 500<=a.max_chars<=40000
remaining=a.max_chars
for no in range(a.start,min(a.end,len(lines))+1):
    offset=a.offset if no==a.start else 0;content=lines[no-1][offset:];piece=content[:remaining]
    print(f'{no}@{offset}: {piece}');remaining-=len(piece)
    if len(piece)<len(content):
        print(f'CONTINUE: {a.source} --layer {a.layer} --start {no} --end {a.end} --offset {offset+len(piece)}');break
    if remaining<=0:
        if no<a.end:print(f'CONTINUE: {a.source} --layer {a.layer} --start {no+1} --end {a.end} --offset 0')
        break
