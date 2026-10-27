#!/usr/bin/env python3
"""Verify three source containers and prepare full searchable copies, without paid services."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import sys
import tempfile
from zipfile import ZipFile

sha=lambda b:hashlib.sha256(b).hexdigest()


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--originals',action='store_true')
    ap.add_argument('--verify-pdf',action='store_true',help='Optional re-extraction; requires recorded Poppler tools')
    args=ap.parse_args()
    root=Path(__file__).resolve().parents[3]
    ep=root/'three-books/episodes/TB-005'
    m=json.loads((ep/'SOURCE_MANIFEST.json').read_text('utf-8'))
    assert [s['id'] for s in m['sources']]==['S01','S02','S03']
    for tool in m['conversion_tools']:
        assert sha((root/tool['repository_path']).read_bytes())==tool['sha256'],'Converter mismatch'
    sys.path.insert(0,str(root/'scripts/three-books'))
    from extract_epub_txt import extract as zipped
    verified=[]
    with tempfile.TemporaryDirectory(prefix='tb005-source-check-') as td:
        for s in m['sources']:
            packed=(root/s['repository_path']).read_bytes()
            assert len(packed)==s['archive_bytes'] and sha(packed)==s['archive_sha256']
            data=gzip.decompress(packed)
            assert len(data)==s['bytes'] and sha(data)==s['sha256']
            text=data.decode('utf-8');assert '\ufffd' not in text and len(text.splitlines())==s['lines']
            idata=(ep/s['index_file']).read_bytes();assert sha(idata)==s['index_sha256'];idx=json.loads(idata)
            chunks=[]
            for part in s['original_parts']:
                b=(root/part['repository_path']).read_bytes();assert len(b)==part['bytes'] and sha(b)==part['sha256'];chunks.append(b)
            original=b''.join(chunks);assert len(original)==s['input_bytes'] and sha(original)==s['input_sha256']
            alt=None
            ext='.pdf' if s['input_format']=='pdf' else '.zip'
            sourcepath=Path(td)/(s['id']+ext);sourcepath.write_bytes(original)
            if s['input_format']=='zip+txt':
                rt,meta=zipped(sourcepath,s['id'])
                assert rt.encode()==data and meta['members']==idx['members'] and meta['headings']==idx['headings']
            else:
                assert original.startswith(b'%PDF-') and b'%%EOF' in original[-2048:]
                packedraw=(root/s['raw_extract_path']).read_bytes();assert sha(packedraw)==s['raw_extract_gzip_sha256']
                raw=gzip.decompress(packedraw);assert sha(raw)==s['raw_extract_sha256']
                pages=raw.decode('utf-8').split('\f')
                if len(pages)==671 and not pages[-1].strip():pages.pop()
                assert len(pages)==670==idx['page_count']==len(idx['pages'])
                rt='\n'.join(line for no,p in enumerate(pages,1) for line in [f'[PDF_PAGE:{no:04}]',*p.splitlines()])+'\n'
                assert rt.encode()==data,'Canonical PDF text does not match full stored extraction'
                for p in idx['pages']:
                    assert text.splitlines()[p['marker_line']-1]==f'[PDF_PAGE:{p["pdf_page"]:04}]'
                a=s['alternate_layer'];pa=(root/a['repository_path']).read_bytes();assert sha(pa)==a['archive_sha256']
                alt=gzip.decompress(pa);assert len(alt)==a['bytes'] and sha(alt)==a['sha256']
                ai=(ep/a['index_file']).read_bytes();assert sha(ai)==a['index_sha256']
                assert len(json.loads(ai)['pages'])==670 and len(alt.decode().splitlines())==a['lines']
                if args.verify_pdf:
                    from extract_pdf_pages import extract as pdf
                    fresh,meta,freshraw=pdf(sourcepath,s['id'])
                    assert fresh.encode()==data and sha(freshraw)==s['raw_extract_sha256'],'Different PDF extraction/version; inspect, do not overwrite'
            verified.append((s,data,original,idx,alt))
    work=root/'.tb005-work';work.mkdir(exist_ok=True);(work/'.gitignore').write_text('*\n')
    target=work/'sources';target.mkdir(exist_ok=True)
    nav=['# TB-005 — private source navigation','','Canonical text and page numbers are in the stored indexes. No source belongs in viewer assets.','']
    for s,data,original,idx,alt in verified:
        (target/(s['id']+'.txt')).write_bytes(data)
        nav+=['## '+s['id'],'',s['title'],'']
        if s['input_format']=='pdf':
            (target/'S02_ALT.txt').write_bytes(alt)
            nav+=['670 physical PDF pages; use read_source.py S02 --page 547.',
                  'Tables/differences: read canonical and --layer alternate for '+', '.join(map(str,s['alternate_layer']['required_comparison_pages'])),
                  'Low-text pages reviewed: 1/670 are covers; 295/401/489 are blank. Original PDF retains images.','']
        else:
            nav += [f'{h["line"]}: {h["title"]}' for h in idx['headings']]+['']
        if args.originals:
            p=root/s['original_reconstruct_path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(original)
        print(f'{s["id"]}: {s["input_format"]}, {s["lines"]} lines, original SHA and normalized text verified')
    (target/'INDEX.md').write_text('\n'.join(nav)+'\n',encoding='utf-8')
    print('Next: TASK / SOURCE_MAP; PDF has two full extraction layers. No repeat uploads needed.')


if __name__=='__main__':main()
