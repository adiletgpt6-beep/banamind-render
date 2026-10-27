#!/usr/bin/env python3
"""Read-only validation of actual TB-005 sources, graph, cash states and publication text."""
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import unicodedata
from zipfile import ZipFile

ROOT=Path(__file__).resolve().parents[3]
EP=ROOT/'three-books/episodes/TB-005'
J=lambda p:json.loads(p.read_text('utf-8'))
sha=lambda b:hashlib.sha256(b).hexdigest()
def tokens(s):
    s=re.sub(r'(?<=\w)[\u00ad-]\n\s*(?=\w)','',s)
    return re.findall(r'[a-zа-я0-9]+',unicodedata.normalize('NFKC',s).lower().replace('ё','е'))
def flat(s):return ''.join(tokens(s))


def main():
    manifest=J(EP/'SOURCE_MANIFEST.json');texts=[];coverage=[]
    for s in manifest['sources']:
        packed=(ROOT/s['repository_path']).read_bytes();assert sha(packed)==s['archive_sha256']
        data=gzip.decompress(packed);assert sha(data)==s['sha256'] and len(data)==s['bytes']
        text=data.decode('utf-8');assert len(text.splitlines())==s['lines'] and '\ufffd' not in text;texts.append(text)
        raw=b''.join((ROOT/p['repository_path']).read_bytes() for p in s['original_parts'])
        assert sha(raw)==s['input_sha256'] and len(raw)==s['input_bytes']
        idx=J(EP/s['index_file'])
        if s['input_format']=='zip+txt':
            with ZipFile(io.BytesIO(raw)) as z:
                assert z.testzip() is None
                original=z.read(idx['archive_member_name']).decode('utf-8-sig').replace('\r\n','\n').replace('\r','\n')
                if not original.endswith('\n'):original+='\n'
                assert original==text
            for h in idx['headings']:assert text.splitlines()[h['line']-1].strip()==h['title']
        else:
            assert len(idx['pages'])==670 and [p['pdf_page'] for p in idx['pages']]==list(range(1,671))
            for p in idx['pages']:assert text.splitlines()[p['marker_line']-1]==f'[PDF_PAGE:{p["pdf_page"]:04}]'
            alternate=gzip.decompress((ROOT/s['alternate_layer']['repository_path']).read_bytes());assert sha(alternate)==s['alternate_layer']['sha256']
            ai=J(EP/s['alternate_layer']['index_file']);assert len(ai['pages'])==670
            altlines=alternate.decode().splitlines()
            for p in ai['pages']:assert altlines[p['first_line']-2]==f'[PDF_PAGE:{p["pdf_page"]:04}]'
            texts.append(alternate.decode())
            audit=J(EP/'PDF_LAYER_AUDIT.json');diff=audit['independent_character_multiset_comparison']
            assert diff['exact_pages']==655 and len(diff['mismatches'])==15
            assert not ({p['pdf_page'] for p in diff['mismatches']} & set(range(546,558)))
        coverage.append(dict(id=s['id'],format=s['input_format'],lines=s['lines'],original_bytes=s['input_bytes']))
    script=(EP/'SCRIPT.md').read_text();bs=re.findall(r'### (B\d{3})\n(.*?)(?=\n(?:### B|## A)|\Z)',script,re.S)
    assert [b for b,t in bs]==[f'B{i:03}' for i in range(1,59)]
    speech='\n'.join(t for b,t in bs);st=tokens(speech);twelve=set()
    for t in texts:
        ts=tokens(t);twelve.update(tuple(ts[i:i+12]) for i in range(len(ts)-11))
    overlap=[' '.join(st[i:i+12]) for i in range(len(st)-11) if tuple(st[i:i+12]) in twelve]
    assert not overlap,overlap[:5]
    aliases=J(EP/'PRIVATE_LEXICON.json')['forbidden_viewer_aliases']
    for p in [EP/'SCRIPT.md',*(EP/'metadata').glob('*.md')]:
        t=flat(p.read_text());bad=[x for x in aliases if flat(x) in t];assert not bad,(p.name,bad)
    model=J(EP/'RISK_MODEL.json');assert model['probabilities']=='unknown' and model['expected_value'] is None
    assert model['initial_capital']==600 and model['contract_receipt']==600
    assert model['complete_units_required']==100==model['crate_count']*model['units_per_crate']==sum(model['halves'])
    for pid,p in model['plans'].items():
        costs=sum(v for k,v in p.items() if k in ['production','land','water','carrier1','carrier2']);assert costs==p['base_cost']
    for key,state in model['states'].items():
        if key=='C.overflow80':
            assert state['total_required']==state['base']+state['correction']+state['transfer']==620
            assert state['total_required']-state['available']==20 and state['receipt'] is None;continue
        assert state['cash_before_receipt']==600-state['cost']
        assert state['cash_after']==600-state['cost']+state['receipt']
        assert state['net_cash_change']==state['receipt']-state['cost']
        assert state['receipt'] in [0,600]
        if state['receipt']:assert state['complete_units']==100
    actual=model['states'][model['actual_state']];assert (actual['cost'],actual['cash_after'],actual['net_cash_change'])==(500,700,100)
    assert model['states']['C.actual_after_repair']['receipt']==0 and model['states']['C.actual_after_repair']['cash_after']==100
    assert model['states']['C.combined40']['cost']==580 and model['states']['C.combined40']['cash_before_receipt']==20
    assert model['states']['C.bridge_closed']['cost']==540 and model['states']['C.bridge_closed']['net_cash_change']==60
    graph=model['graph'];assert all('bridge' in graph[x] for x in ['direct','two_names_1','two_names_2','land_C'])
    assert 'bridge' not in graph['water_C'] and 'bridge' not in graph['transfer_C'] and graph['water_capacity_units']>=100
    scenes=J(EP/'SCENES.json')['scenes'];assert len(scenes)==43 and scenes[0]['start_frame']==0 and scenes[-1]['end_frame']==54000
    assert all(a['end_frame']==b['start_frame'] for a,b in zip(scenes,scenes[1:]))
    assert [b for q in scenes for b in q['speech_blocks']]==[b for b,t in bs]
    for q in scenes:
        for ref in q['state_refs']:
            state=model['states'][ref]
            if q['mode']=='actual':assert state['status'].startswith('actual'),(q['scene_id'],ref)
    shots=J(EP/'BENCHMARK_SHOTS.json')['shots'];assert len(shots)==8
    assert all(s['scene_id'] in {q['scene_id'] for q in scenes} for s in shots)
    old=J(ROOT/'three-books/rules/BASELINE-001.json')['rules']
    for ep in ['TB-002','TB-003','TB-004']:old+=J(ROOT/f'three-books/episodes/{ep}/UPGRADES_100.json')['rules']
    assert len(old)==500
    batch=J(EP/'UPGRADES_100.json');assert len(batch['rules'])==100
    keys={r.get('semantic_key') for r in old};oldtext={flat(r.get('requirement',r.get('text',''))) for r in old}
    assert all(r['semantic_key'] not in keys and flat(r['requirement']) not in oldtext for r in batch['rules'])
    assert len(set(r['semantic_key'] for r in batch['rules']))==100
    assert len(re.findall(r'^[1-5]\. ',(EP/'metadata/TITLES.md').read_text(),re.M))==5
    print(json.dumps(dict(sources=coverage,pdf=dict(physical_pages=670,layers=2,exact_character_multiset_pages=655,review_differences=15,no_fresh_ocr=True),
        blocks=58,words_for_overlap=len(st),scenes=43,parts=10,planned_frames=54000,exact_12word_source_matches=overlap,viewer_aliases=0,
        model='PASS: topology/receipt/capital/interim/final/unknown probabilities',actual=[500,700,100],new_rules=100,prior_rules=500,
        titles=5,thumbnail_briefs=5,visual_quality='NOT_MEASURED',production='NOT_RENDERED'),ensure_ascii=False,indent=2))


if __name__=='__main__':main()
