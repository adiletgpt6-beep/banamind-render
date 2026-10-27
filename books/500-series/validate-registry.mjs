#!/usr/bin/env node
/**
 * Cheap registry validation only; DOES NOT render videos or spend TTS credits.
 */
import fs from "node:fs";
const p = "books/500-series/REGISTRY.csv";
const raw = fs.readFileSync(p, "utf8").trimEnd().split(/\r?\n/);
const expected = "book_id,status,slug,title,source_kind,source_uri,task_path,pr_url,release_url,last_verified_utc";
if(raw[0]!==expected) throw Error("Unexpected registry header");
if(raw.length!==501) throw Error("Registry must have header and exactly 500 slots; got "+(raw.length-1));
const known = new Set(["RESERVED","SOURCE_READY","BRIEF_READY","APPROVED","IN_PRODUCTION","QA_REVIEW","FINAL_APPROVED","PUBLISHED","BLOCKED","PR_OPEN"]);
const slugs=new Set();
// Parse a CSV record including quoted titles with commas or escaped quotes.
function parseCSV(line){
  const cells=[];let cell="";let quote=false;
  for(let j=0;j<line.length;j++){
    const c=line[j];
    if(c==='"' && quote && line[j+1]==='"'){cell+='"';j++;continue;}
    if(c==='"'){quote=!quote;continue;}
    if(c==="," && !quote){cells.push(cell);cell="";continue;}
    cell+=c;
  }
  if(quote) throw Error("Unclosed CSV quote");
  cells.push(cell);return cells;
}
for(let i=1;i<=500;i++){
  const cells = parseCSV(raw[i]);
  if(cells.length<10) throw Error("Row "+(i+1)+" incomplete: "+cells.length+" columns");
  const expectedId="BM-"+String(i).padStart(3,"0");
  if(cells[0]!==expectedId) throw Error("Row "+(i+1)+": expected "+expectedId+", got "+cells[0]);
  if(!known.has(cells[1])) throw Error("Unknown status "+cells[1]+" at "+expectedId);
  const slug=cells[2];
  if(slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw Error("Invalid slug: "+slug);
  if(slug && slugs.has(slug)) throw Error("Duplicate slug: "+slug);
  if(slug) slugs.add(slug);
  if(cells[1]!=="RESERVED" && !slug) throw Error("Assigned book has no slug: "+expectedId);
  if(cells[1]==="RESERVED" && cells.slice(2).some(Boolean)) throw Error("Reserved slot cannot pretend to have a book: "+expectedId);
}
console.log("BanaMind registry OK: 500 numbered slots, "+slugs.size+" assigned, "+(500-slugs.size)+" reserved.");
