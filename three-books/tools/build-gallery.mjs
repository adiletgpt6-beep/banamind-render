import {readFileSync,writeFileSync,mkdirSync,copyFileSync,statSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {createHash} from "node:crypto";

const [manifestArg,outArg]=process.argv.slice(2);
if(!manifestArg||!outArg) {
  console.error("Usage: node three-books/tools/build-gallery.mjs <DELIVERY.json> <gallery-directory>");
  process.exit(1);
}
const manifestPath=resolve(manifestArg), out=resolve(outArg);
const data=JSON.parse(readFileSync(manifestPath,"utf8"));
if(!/^TB-\d{3}$/.test(data.episode_id??""))throw new Error("Real TB-ID required");
if(!Array.isArray(data.thumbnails)||data.thumbnails.length!==5)throw new Error("Exactly five real local thumbnails required");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function imageSize(b) {
  if(b.length>=24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {w:b.readUInt32BE(16),h:b.readUInt32BE(20),ext:"png"};
  if(b.length>4&&b[0]===255&&b[1]===216) {
    let p=2;
    while(p+4<b.length) {
      if(b[p]!==255){p++;continue;}
      while(b[p]===255)p++;
      const marker=b[p++];if(marker===217||marker===218)break;
      if(marker===0||marker===1||(marker>=208&&marker<=215))continue;
      if(p+2>b.length)break;
      const size=b.readUInt16BE(p);if(size<2||p+size>b.length)break;
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&size>=7)return {h:b.readUInt16BE(p+3),w:b.readUInt16BE(p+5),ext:"jpg"};
      p+=size;
    }
  }
  throw new Error("Unsupported/corrupt image: use original PNG/JPEG");
}
const seen=new Set();
const cards=data.thumbnails.map((item,i)=>{
  if(typeof item.path!=="string"||/^[a-z]+:\/\//i.test(item.path))throw new Error("thumbnail.path must reference a real local file");
  const source=resolve(dirname(manifestPath),item.path);
  if(!statSync(source).isFile())throw new Error("Not a regular file: "+source);
  const bytes=readFileSync(source), size=imageSize(bytes);
  if(size.w!==1280||size.h!==720)throw new Error("Expected 1280x720: "+source);
  const hash=createHash("sha256").update(bytes).digest("hex");
  if(seen.has(hash))throw new Error("Duplicate thumbnail image: "+source);
  seen.add(hash);
  return {source,name:data.episode_id+"-thumbnail-"+String(i+1).padStart(2,"0")+"."+size.ext,label:item.label||"Обложка "+(i+1),bytes:bytes.length,sha256:hash};
});
mkdirSync(out,{recursive:true});
for(const card of cards)if(resolve(card.source)!==resolve(join(out,card.name)))copyFileSync(card.source,join(out,card.name));
const body=cards.map(c=>'<article><a href="'+esc(c.name)+'" target="_blank" rel="noopener"><img src="'+esc(c.name)+'" alt="'+esc(c.label)+'"></a><h2>'+esc(c.label)+'</h2><p><a href="'+esc(c.name)+'" target="_blank" rel="noopener">Открыть оригинал</a><a href="'+esc(c.name)+'" download>Скачать</a></p></article>').join("");
const html='<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(data.episode_id)+' — пять обложек</title><style>body{margin:0;padding:24px;background:#0a1120;color:#f5f6fa;font:16px system-ui,sans-serif}main{max-width:1200px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}article{background:#172136;border-radius:16px;overflow:hidden}img{display:block;width:100%;height:auto}h2,p{margin:16px}h2{font-size:20px}p{display:flex;gap:12px;flex-wrap:wrap}a{color:#8de7da}p a{padding:10px 12px;background:#22344c;border-radius:8px;text-decoration:none}:focus-visible{outline:3px solid #ffbd3f;outline-offset:3px}</style><main><h1>'+esc(data.episode_id)+' — пять обложек</h1><p>Откройте оригинал или скачайте отдельный файл. Все изображения — 1280×720.</p><section class="grid">'+body+'</section></main></html>';
writeFileSync(join(out,"index.html"),html,"utf8");
writeFileSync(join(out,"gallery-manifest.json"),JSON.stringify({episode_id:data.episode_id,revision_id:data.revision_id,thumbnails:cards.map(({source,...rest})=>rest)},null,2)+"\n","utf8");
console.log("Created "+join(out,"index.html")+" with five verified distinct image files. Serve through the existing private preview and verify the real owner-accessible URL.");
