import hashlib, json, re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
STATE = ROOT/'continuation'
CACHE = STATE/'migration-cache'
FIXTURES = {'9390f26f40afe48088a99d1c364dde89ce9fde16','6eb3ad794b351ee6650b865d2b8ce6c36b600e69','851a42618b03ff611f975c6be44bcc8b42cb58f3','b2fb5a1f65a00f341274d8bbd8f187f2d21444ad','157128a58838dad67267a9afcc27c588874a0a2b'}
def read(path, default=None): return json.loads(path.read_text()) if path.exists() else default
def write(path, value):
    tmp=path.with_suffix(path.suffix+'.tmp');tmp.write_text(json.dumps(value,ensure_ascii=False));tmp.replace(path)
def git(*args): return subprocess.check_output(['git','--git-dir='+str(ROOT/'target-audit.git'),*args])
def put(value):
    raw=(json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode()
    sha=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest();(CACHE/'publish-blobs'/sha).write_bytes(raw);return sha
def tree_sha(files):
    root={}
    for f in files:
        node=root;parts=f['path'].split('/')
        for part in parts[:-1]: node=node.setdefault(part,{})
        assert parts[-1] not in node
        node[parts[-1]]=(f['mode'].lstrip('0'),f['sha'])
    def digest(node):
        rows=[]
        for name,item in node.items():
            if isinstance(item,dict): mode,sha,key='40000',digest(item),(name+'/').encode()
            else: mode,sha=item;key=name.encode()
            rows.append((key,mode.encode()+b' '+name.encode()+b'\0'+bytes.fromhex(sha)))
        raw=b''.join(v for _,v in sorted(rows));return hashlib.sha1(b'tree '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    return digest(root)
def filemap(commit):
    result={}
    for line in git('ls-tree','-rz','--full-tree',commit).split(b'\0'):
        if not line: continue
        left,path=line.split(b'\t',1);mode,kind,sha=left.decode().split();assert kind=='blob'
        result[path.decode()]={'path':path.decode(),'mode':mode,'sha':sha}
    return result
def recover():
    original=read(CACHE/'publish-plan.json');progress=read(STATE/'progress.json');available=set()
    for v in progress.values(): available.update(f['sha'] for f in filemap(v['commit']).values())
    available.update(read(STATE/'remotely-verified-fonts.json',[]));plans={};exclusions=[];verified=0
    for head,value in original.items():
        assert tree_sha(value['files'])==value['expected_tree'],head
        p=json.loads(json.dumps(value));excluded=[];kept=[]
        for f in p['files']:
            reason=None
            if f.get('binary') and f['sha'] not in available: reason='font_not_uploaded_in_previous_session; no_binary_retry'
            if Path(f['path']).name=='PRIVATE_LEXICON.json': reason='explicitly_private_lexicon'
            if reason: excluded.append({**f,'reason':reason})
            else: kept.append(f)
        if excluded:
            p['original_expected_tree']=p['expected_tree']
            for f in kept:
                if f['path']=='.migration/BINARY_ASSETS.json':
                    assets=read(CACHE/'publish-blobs'/f['sha']);assets=[a for a in assets if not any(a['path']==e['path'] for e in excluded)];f['sha']=put(assets)
                elif f['path']=='.migration/SNAPSHOT.json':
                    meta=read(CACHE/'publish-blobs'/f['sha']);meta['reviewed_binary_assets']-=sum(bool(e.get('binary')) for e in excluded);meta['continuation_date']='2026-10-27';meta['continuation_exclusions']=excluded;f['sha']=put(meta)
        p['files']=sorted(kept,key=lambda f:f['path'])
        actual=filemap(progress[head]['commit']) if head in progress else {}
        keep_old_fixtures=head in progress and any(f['sha'] in FIXTURES for f in actual.values())
        removed=[] if keep_old_fixtures else [{**f,'reason':'credential_like_test_fixture_omitted_after_automatic_review_rejection'} for f in p['files'] if f['sha'] in FIXTURES]
        if removed:
            p['original_expected_tree']=value['expected_tree'];p['files']=[f for f in p['files'] if f['sha'] not in FIXTURES]
            for f in p['files']:
                if f['path']=='.migration/SNAPSHOT.json':
                    meta=read(CACHE/'publish-blobs'/f['sha']);meta['continuation_date']='2026-10-27';meta.setdefault('continuation_exclusions',[]).extend(removed);f['sha']=put(meta)
        p['expected_tree']=tree_sha(p['files'])
        assert not any(f['path'].startswith('.github/workflows/') for f in p['files'])
        if head in progress:
            assert p['expected_tree']==progress[head]['tree'],(head,p['expected_tree'],progress[head]['tree'])
            verified+=1
        if excluded or removed: exclusions.append({'source_head':head,'branches':p['branches'],'original_expected_tree':value['expected_tree'],'files':excluded+removed,'published_expected_tree':p['expected_tree']})
        plans[head]=p
    write(STATE/'safe-publish-plan.json',plans);write(STATE/'available-shas.json',sorted(available));write(STATE/'additional-exclusions.json',exclusions)
    print(json.dumps({'restored_plans':len(plans),'verified_published_trees':verified,'pending_snapshots':len(plans)-len(progress),'available_blobs':len(available),'additional_exclusion_plans':len(exclusions)}))
def prepare():
    plans=read(STATE/'safe-publish-plan.json');progress=read(STATE/'progress.json');available=set(read(STATE/'available-shas.json'));pending=[v for h,v in plans.items() if h not in progress]
    if not pending: print(json.dumps({'complete':True,'snapshots':len(progress)}));return
    def priority(v):
        n=v['branches'][0];return (0 if n.startswith('docs/') else 1 if 'banamind' in n else 2 if n.startswith('feature/') else 3,n)
    target=min(pending,key=priority);target_map={f['path']:f for f in target['files']}
    def cost(head):
        base={f['path']:f for f in plans[head]['files']};return len(set(base)-set(target_map))+sum(1 for path,f in target_map.items() if path not in base or base[path]['sha']!=f['sha'] or base[path]['mode']!=f['mode'])
    base_head=min(progress,key=cost);base={f['path']:f for f in plans[base_head]['files']};entries=[];new=[]
    for path in sorted(set(base)-set(target_map)): entries.append({'path':path,'mode':base[path]['mode'],'type':'blob','sha':None})
    for path,f in target_map.items():
        if path in base and base[path]['sha']==f['sha'] and base[path]['mode']==f['mode']: continue
        e={'path':path,'mode':f['mode'],'type':'blob'}
        if f['sha'] in available: e['sha']=f['sha']
        else:
            assert not f.get('binary'),f;e['content']=(CACHE/'publish-blobs'/f['sha']).read_bytes().decode('utf-8');new.append(f['sha'])
        entries.append(e)
    pages=[];batch=[];size=0
    for e in entries:
        length=len(json.dumps(e,ensure_ascii=False))
        if batch and (len(batch)>=200 or size+length>2000000): pages.append(batch);batch=[];size=0
        batch.append(e);size+=length
    if batch: pages.append(batch)
    sizes=[]
    for i,page in enumerate(pages):
        raw=json.dumps(page,ensure_ascii=False);(STATE/('page-%d.json'%i)).write_text(raw);sizes.append({'index':i,'chars':len(raw),'entries':len(page)})
    job={'head':target['head'],'branches':target['branches'],'expected_tree':target['expected_tree'],'base_tree':progress[base_head]['tree'],'base_source_head':base_head,'pages':sizes,'new_shas':new,'delta_count':len(entries),'file_count':len(target['files']),'checkpoint':read(STATE/('work-'+target['head']+'.json'),{})}
    write(STATE/'current-job.json',job);print(json.dumps({k:v for k,v in job.items() if k!='new_shas'}))
def part():
    page,offset,limit=map(int,sys.argv[2:5]);raw=(STATE/('page-%d.json'%page)).read_text();print(json.dumps({'part':raw[offset:offset+limit],'next_offset':min(len(raw),offset+limit),'total':len(raw)},ensure_ascii=False))
def checkpoint():
    head,key,value=sys.argv[2:5];assert re.fullmatch('[0-9a-f]{40}',head);p=STATE/('work-'+head+'.json');d=read(p,{});d[key]=value;write(p,d);print(json.dumps({'saved':key}))
def record():
    head,commit,tree=sys.argv[2:5];job=read(STATE/'current-job.json');assert head==job['head'] and tree==job['expected_tree'];p=read(STATE/'progress.json');p[head]={'head':head,'commit':commit,'tree':tree,'branches':job['branches']};write(STATE/'progress.json',p);available=set(read(STATE/'available-shas.json'));available.update(job['new_shas']);write(STATE/'available-shas.json',sorted(available));print(json.dumps({'snapshots':len(p),'branches':sum(len(v['branches']) for v in p.values()),'available_blobs':len(available)}))
if __name__=='__main__': {'recover':recover,'next':prepare,'part':part,'checkpoint':checkpoint,'record':record}[sys.argv[1]]()
