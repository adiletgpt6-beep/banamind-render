import {readFileSync,readdirSync} from "node:fs";
import {resolve,relative,join} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

export function validateDocuments(files) {
  const errors=[], notes=[];
  const fail=s=>errors.push(s), root="three-books/";
  const must=p=>{if(!Object.hasOwn(files,root+p))fail("Missing "+root+p);return files[root+p];};
  const json=p=>{const text=must(p);if(text===undefined)return null;try{return JSON.parse(text);}catch(e){fail("Invalid JSON "+p+": "+e.message);return null;}};
  const norm=s=>String(s).normalize("NFKC").toLowerCase().replace(/[\p{P}\p{S}\s]+/gu,"");
  for(const p of ["README.md","AGENTS.md","CURRENT_RULES.md","MASTER_CLAUDE.md","WORKFLOW.md","HANDOFF.md","STATUS.md","PROMPTS.md","RULES_POLICY.md","DECISIONS.md"])must(p);
  const base=json("rules/BASELINE-001.json");
  const old=base?.rules??[];
  if(old.length!==200)fail("Baseline must have 200 inherited rules");
  const expectedOld=["V","G"].flatMap(p=>Array.from({length:100},(_,i)=>p+String(i+1).padStart(3,"0")));
  if(old.map(x=>x.id).join("|")!==expectedOld.join("|"))fail("Baseline IDs differ from V001..V100/G001..G100");
  const knownText=new Set(old.map(x=>norm(x.text)));
  const knownKeys=new Set(), episodeIds=new Set();
  const registry=json("REGISTRY.json");
  const allowed=new Set(["AWAITING_SOURCES","SOURCE_READY","BRIEF_READY","READY","IN_PRODUCTION","QA_REVIEW","DELIVERED","USER_APPROVED","BLOCKED","CANCELLED","IMPORTED_REFERENCE"]);
  const productionStates=new Set(["READY","IN_PRODUCTION","QA_REVIEW","DELIVERED","USER_APPROVED"]);
  const phases=new Set(["brief","script","voice","animation","render","metadata","qa","handoff"]);
  if(registry?.series_id!=="TB")fail("Registry series_id must be TB");
  const episodes=registry?.episodes??[];
  if(!episodes.length)fail("Registry has no episodes");
  for(const ep of episodes) {
    const id=ep.episode_id;
    if(!/^TB-\d{3}$/.test(id??"")){fail("Invalid episode ID "+id);continue;}
    if(episodeIds.has(id))fail("Duplicate episode "+id);
    episodeIds.add(id);
    if(!allowed.has(ep.status))fail(id+": unknown status "+ep.status);
    const expectedPath="episodes/"+id;
    if(ep.path!==expectedPath)fail(id+": unexpected path");
    for(const name of ["TASK.md","STATUS.md","NOVELTY.md"])must(expectedPath+"/"+name);
    const manifest=json(expectedPath+"/SOURCE_MANIFEST.json");
    const sources=manifest?.sources??[];
    if(ep.source_count!==sources.length)fail(id+": source_count mismatch");
    if(sources.length>3)fail(id+": more than 3 sources");
    if(productionStates.has(ep.status)&&sources.length!==3)fail(id+": production requires 3 sources");
    for(const [i,s] of sources.entries()) {
      if(!s.file_name||!s.author||!s.title)fail(id+": source "+(i+1)+" incomplete");
      if(s.sha256!==null&&s.sha256!==undefined&&!/^[a-f0-9]{64}$/i.test(s.sha256))fail(id+": invalid source hash");
    }
    if(id!=="TB-001") {
      const path=expectedPath+"/UPGRADES_100.json";
      if(ep.new_rules!==path)fail(id+": new_rules path mismatch");
      const batch=json(path), rules=batch?.rules??[];
      if(batch?.episode_id!==id)fail(id+": rules episode_id mismatch");
      if(!["DRAFT","FROZEN"].includes(batch?.status))fail(id+": invalid batch status");
      if(rules.length!==100)fail(id+": expected exactly 100 new rules, got "+rules.length);
      for(const [i,r] of rules.entries()) {
        const expected=id+"-N"+String(i+1).padStart(3,"0");
        if(r.id!==expected)fail(id+": invalid sequential rule ID "+r.id);
        if(!r.semantic_key||knownKeys.has(r.semantic_key))fail(id+": duplicate/missing semantic_key "+r.semantic_key);
        knownKeys.add(r.semantic_key);
        if(!r.area||String(r.requirement??"").length<50||String(r.verification??"").length<30)fail(r.id+": rule/check is underspecified");
        if(!phases.has(r.phase))fail(r.id+": invalid phase");
        const key=norm(r.requirement);
        if(knownText.has(key))fail(r.id+": exact duplicate of inherited/prior requirement");
        knownText.add(key);
      }
      const md=must(expectedPath+"/UPGRADES_100.md")??"";
      const ids=[...md.matchAll(/^## (TB-\d{3}-N\d{3})/gm)].map(x=>x[1]);
      if(ids.join("|")!==rules.map(x=>x.id).join("|"))fail(id+": readable 100-rule export does not match JSON IDs");
      if(productionStates.has(ep.status)) {
        if(batch?.status!=="FROZEN")fail(id+": production requires a FROZEN rules batch");
        if(batch?.comparison?.sources_received!==true)fail(id+": frozen source comparison missing");
        if(batch?.comparison?.editorial_review_completed!==true)fail(id+": semantic review not completed");
        must(expectedPath+"/BRIEF.md");must(expectedPath+"/SCRIPT.md");
        if((files[root+expectedPath+"/NOVELTY.md"]??"").includes("| Ожидается |"))fail(id+": novelty still pending");
      }
      notes.push(id+": "+rules.length+" new rules, "+batch?.status+", "+sources.length+"/3 sources");
    }
    const publicCandidates=Object.entries(files).filter(([p])=>p.startsWith(root+expectedPath+"/metadata/")||p===root+expectedPath+"/SCRIPT.md"||p.endsWith("/"+id+"/final-youtube.srt")||p.endsWith("/"+id+"/final-youtube.vtt"));
    for(const [path,text] of publicCandidates)for(const source of sources) {
      const tokens=[source.author,source.title].filter(Boolean);
      for(const token of tokens)if(norm(text).includes(norm(token)))fail(path+": public book attribution detected: "+token);
    }
    if(["DELIVERED","USER_APPROVED"].includes(ep.status)) {
      const d=json(expectedPath+"/DELIVERY.json");
      if(d?.episode_id!==id||!d?.revision_id)fail(id+": delivery identity/version missing");
      if(!d?.video?.watch_url||!d?.video?.download_url)fail(id+": both video access URLs required");
      if(d?.thumbnails?.length!==5)fail(id+": five thumbnails required for delivery");
      for(const t of d?.thumbnails??[])if(!t.download_url||!t.view_url)fail(id+": thumbnail lacks access URLs");
      if(!d?.qa_report)fail(id+": QA report missing");
      const titles=must(expectedPath+"/metadata/TITLES.md")??"";
      if([...titles.matchAll(/^[1-5]\.\s+\S/gm)].length!==5)fail(id+": exactly five titles required");
    }
  }
  if(registry?.current_episode_id&&!episodeIds.has(registry.current_episode_id))fail("Current episode is absent from registry");
  for(const [path,text] of Object.entries(files)) {
    if(!path.startsWith(root)||!path.endsWith(".md"))continue;
    for(const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target=m[1].split("#")[0];
      if(!target||/^[a-z][a-z0-9+.-]*:/i.test(target)||target.includes("<"))continue;
      const pieces=path.split("/");pieces.pop();
      for(const part of target.split("/"))if(part==="..")pieces.pop();else if(part&&part!==".")pieces.push(part);
      const resolved=pieces.join("/");
      if(resolved.startsWith(root)&&!Object.hasOwn(files,resolved))fail(path+": broken relative link "+target);
    }
  }
  return {ok:errors.length===0,errors,notes,episode_count:episodes.length,baseline_rules:old.length};
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  const base=fileURLToPath(new URL("..",import.meta.url)), files={};
  function scan(dir) {
    for(const entry of readdirSync(dir,{withFileTypes:true})) {
      const path=join(dir,entry.name);
      if(entry.isDirectory()) {if(!["assets","source","sources","renders","node_modules"].includes(entry.name))scan(path);}
      else if(entry.isFile()&&/\.(md|json|txt|mjs|srt|vtt)$/i.test(entry.name))files["three-books/"+relative(base,path).split("\\").join("/")]=readFileSync(path,"utf8");
    }
  }
  scan(base);
  const report=validateDocuments(files);
  for(const n of report.notes)console.log(n);
  if(!report.ok){for(const e of report.errors)console.error(e);process.exitCode=1;}
  else console.log("OK: "+report.episode_count+" episodes; "+report.baseline_rules+" inherited rules; all new batches/links/state gates checked.");
}
