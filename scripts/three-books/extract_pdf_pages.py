#!/usr/bin/env python3
"""Extract a complete, page-indexed PDF text layer without rewriting the PDF.

Reproduction requires the recorded Poppler tools. Reading stored UTF-8 does not.
No OCR or visual layout reconstruction is claimed by this converter.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess


def sha(b):
    return hashlib.sha256(b).hexdigest()


def extract(path, source_id):
    path=Path(path)
    original=path.read_bytes()
    if not original.startswith(b'%PDF-'):
        raise ValueError('PDF signature missing')
    info=subprocess.run(['pdfinfo',str(path)],capture_output=True,text=True,check=True).stdout
    count=int(re.search(r'^Pages:\s+(\d+)',info,re.M).group(1))
    result=subprocess.run(['pdftotext','-layout','-enc','UTF-8',str(path),'-'],capture_output=True,check=True)
    raw=result.stdout.decode('utf-8')
    if '\ufffd' in raw:
        raise ValueError('Replacement characters in text extraction')
    pages=raw.split('\f')
    if len(pages)==count+1 and not pages[-1].strip():
        pages.pop()
    if len(pages)!=count:
        raise ValueError(f'Page count mismatch: {len(pages)} vs {count}')
    lines=[]
    index=[]
    for no,page in enumerate(pages,1):
        marker=len(lines)+1
        lines.append(f'[PDF_PAGE:{no:04}]')
        body=page.splitlines()
        start=len(lines)+1
        lines.extend(body)
        cyr=len(re.findall('[А-Яа-яЁё]',page))
        index.append(dict(pdf_page=no,marker_line=marker,first_line=start,last_line=len(lines),
            extracted_chars=len(page),cyrillic_chars=cyr,text_sha256=sha(page.encode('utf-8')),
            status='REVIEW_LOW_TEXT' if cyr<30 else 'TEXT_LAYER_AVAILABLE'))
    text='\n'.join(lines)+'\n'
    version=subprocess.run(['pdftotext','-v'],capture_output=True,text=True,check=True)
    meta=dict(id=source_id,input_format='pdf',input_bytes=len(original),input_sha256=sha(original),
        title='Разумный инвестор',author='Бенджамин Грэхем',edition_note='Обновлённое издание с комментариями Джейсона Цвейга, Вильямс, 2009',
        encoding='utf-8',bytes=len(text.encode('utf-8')),lines=len(text.splitlines()),words=len(text.split()),
        sha256=sha(text.encode('utf-8')),page_count=count,pages=index,headings=[],pdfinfo=info,
        extractor='pdftotext -layout -enc UTF-8 input.pdf -',extractor_version=(version.stderr+version.stdout).splitlines()[0],
        raw_extract_sha256=sha(result.stdout),raw_extract_bytes=len(result.stdout),
        low_text_pages=[p['pdf_page'] for p in index if p['status']=='REVIEW_LOW_TEXT'],
        preservation='All 670 physical pages represented, including empty text layers. Original PDF retained. Source layout spaces, line wraps and soft hyphens retained; PDF page markers added. No OCR, table reconstruction or visual completeness claimed by extraction alone.')
    for p in index:
        body='\n'.join(lines[p['first_line']-1:p['last_line']])
        hs=[l.strip() for l in body.splitlines()[:7] if re.match(r'^(Глава\s+\d+|Предисловие|Эпилог|Сноски|Примечания|Оглавление|Содержание)',l.strip())]
        for h in hs:
            meta['headings'].append(dict(line=p['first_line'],title=h,pdf_page=p['pdf_page'],kind='page_header_candidate_not_book_structure'))
    return text,meta,result.stdout


if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('input');ap.add_argument('output');ap.add_argument('--source-id',required=True)
    a=ap.parse_args()
    text,meta,raw=extract(a.input,a.source_id)
    out=Path(a.output);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(text,encoding='utf-8')
    out.with_suffix('.index.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    out.with_suffix('.poppler.txt').write_bytes(raw)
    print(json.dumps({k:meta[k] for k in ['id','page_count','low_text_pages','lines','sha256']},ensure_ascii=False))
