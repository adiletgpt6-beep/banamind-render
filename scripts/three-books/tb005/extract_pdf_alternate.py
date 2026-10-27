#!/usr/bin/env python3
"""Reproduce the supplementary PDF layer. Optional dependency: PyMuPDF (recorded version)."""
import argparse
import json
from pathlib import Path


def extract(path):
    import fitz
    document=fitz.open(path)
    lines=[];pages=[]
    for no,page in enumerate(document,1):
        lines.append(f'[PDF_PAGE:{no:04}]')
        start=len(lines)+1;text=page.get_text(sort=True)
        lines.extend(text.splitlines())
        pages.append(dict(pdf_page=no,first_line=start,last_line=len(lines),chars=len(text)))
    meta=dict(source_id='S02',layer='alternate',engine='PyMuPDF '+fitz.VersionBind,sort=True,page_count=len(document),pages=pages)
    return '\n'.join(lines)+'\n',meta


if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('input');ap.add_argument('output');a=ap.parse_args()
    text,idx=extract(a.input);p=Path(a.output);p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(text,encoding='utf-8');p.with_suffix('.index.json').write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Full alternate PDF layer:',len(idx['pages']),'physical pages')
