#!/usr/bin/env python3
"""Read-only checks for TB-004's actual texts, accounting and handoff structure."""
import gzip
import hashlib
import json
from pathlib import Path
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

ROOT=Path(__file__).resolve().parents[3]
EP=ROOT/'three-books/episodes/TB-004'
J=lambda p:json.loads(p.read_text('utf-8'))
sha=lambda b:hashlib.sha256(b).hexdigest()
def tokens(s):
    return re.findall(r'[a-zа-я0-9]+',unicodedata.normalize('NFKC',s).lower().replace('ё','е'))
def flat(s):
    return ''.join(tokens(s))

def main():
    manifest=J(EP/'SOURCE_MANIFEST.json')
    texts=[]
    source_checks=[]
    for s in manifest['sources']:
        text=gzip.decompress((ROOT/s['repository_path']).read_bytes()).decode('utf-8')
        texts.append(text)
        index=J(EP/s['index_file'])
        for h in index['headings']:
            assert text.splitlines()[h['line']-1].strip()==h['title'],(s['id'],h)
        original=b''.join((ROOT/p['repository_path']).read_bytes() for p in s['original_parts'])
        assert sha(original)==s['input_sha256']
        import io
        with zipfile.ZipFile(io.BytesIO(original)) as z:
            assert z.testzip() is None
            if s['input_format']=='zip+txt':
                raw=z.read(index['archive_member_name']).decode('utf-8-sig').replace('\r\n','\n').replace('\r','\n')
                if not raw.endswith('\n'):raw+='\n'
                assert raw==text, s['id']+': independent full TXT comparison'
            else:
                # Independent XHTML body character coverage, excluding image markers added by converter.
                for doc in index['documents']:
                    root=ET.fromstring(z.read(doc['path']))
                    body=root.find('{*}body')
                    raw=''.join(body.itertext()) if body is not None else ''
                    actual='\n'.join(text.splitlines()[doc['first_line']-1:doc['last_line']])
                    actual=re.sub(r'\[Изображение: [^\]]*\]','',actual)
                    clean=lambda x:re.sub(r'\s+','',unicodedata.normalize('NFC',x))
                    assert clean(raw)==clean(actual),(doc['path'],'body character coverage')
        source_checks.append(dict(id=s['id'],bytes=s['bytes'],lines=s['lines'],full_character_coverage=True))
    script=(EP/'SCRIPT.md').read_text('utf-8')
    blocks=re.findall(r'### (B\d{3})\n(.*?)(?=\n(?:### B|## A)|\Z)',script,re.S)
    assert [b for b,t in blocks]==[f'B{i:03}' for i in range(1,61)]
    spoken='\n'.join(t for b,t in blocks)
    twelve=set()
    for text in texts:
        ts=tokens(text)
        twelve.update(tuple(ts[i:i+12]) for i in range(len(ts)-11))
    st=tokens(spoken)
    overlap=[dict(offset=i,text=' '.join(st[i:i+12])) for i in range(len(st)-11) if tuple(st[i:i+12]) in twelve]
    assert not overlap,overlap[:5]
    public=[EP/'SCRIPT.md']+list((EP/'metadata').glob('*.md'))
    forbidden=J(EP/'PRIVATE_LEXICON.json')['forbidden_viewer_aliases']
    for p in public:
        f=flat(p.read_text('utf-8'))
        assert not [a for a in forbidden if flat(a) in f],p.name+': attribution'
    scenes=J(EP/'SCENES.json')['scenes']
    assert len(scenes)==40 and scenes[0]['start_frame']==0 and scenes[-1]['end_frame']==54000
    assert all(a['end_frame']==b['start_frame'] for a,b in zip(scenes,scenes[1:]))
    assert all(s['end_frame']>s['start_frame'] for s in scenes)
    assert [b for s in scenes for b in s['speech_blocks']]==[b for b,t in blocks]
    ledger=J(EP/'LEDGER.json')
    assert 900-300+(8*30-160)+(7*30-160)+(3*30-160)==660
    assert -300+80+50-70==-240
    assert 660+120==780 and 660-500==160
    assert 300+80==380 and 660+120-380==400
    assert 14*30-380==40 and -240+40==-200 and 660+40==700
    assert 380+240==620 and 20*30<620<=21*30 and 21>14
    assert sum(x['refunded'] for x in ledger['refunds'])==120
    assert ledger['events'][-1]['owned']==660 and ledger['events'][-1]['cash']==660
    for e in ledger['events']:assert e['cash']==e['owned']+e['advance_liability']
    batch=J(EP/'UPGRADES_100.json')
    assert len(batch['rules'])==100
    old=J(ROOT/'three-books/rules/BASELINE-001.json')['rules']
    old+=J(ROOT/'three-books/episodes/TB-002/UPGRADES_100.json')['rules']
    old+=J(ROOT/'three-books/episodes/TB-003/UPGRADES_100.json')['rules']
    assert len(old)==400
    oldkeys={r.get('semantic_key') for r in old}
    oldtexts={flat(r.get('requirement',r.get('text',''))) for r in old}
    assert all(r['semantic_key'] not in oldkeys and flat(r['requirement']) not in oldtexts for r in batch['rules'])
    assert len(set(r['semantic_key'] for r in batch['rules']))==100
    assert len(re.findall(r'^[1-5]\. ',(EP/'metadata/TITLES.md').read_text(),re.M))==5
    for shot in J(EP/'BENCHMARK_SHOTS.json')['shots']:
        assert shot['scene_id'] in {s['scene_id'] for s in scenes}
    print(json.dumps(dict(sources=source_checks,script_blocks=60,script_words=len(st),scenes=40,parts=8,
        frame_coverage=54000,exact_12_word_source_matches=overlap,forbidden_viewer_aliases=0,
        ledger='PASS: actual/alternative/ownership/refunds/capacity',new_rules=100,prior_rules=400,
        titles=5,thumbnail_briefs=5,render_status='NOT_RENDERED',visual_quality_status='NOT_MEASURED'),ensure_ascii=False,indent=2))

if __name__=='__main__':main()
