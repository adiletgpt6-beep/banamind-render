#!/usr/bin/env node
/**
 * BanaMind universal local gallery: 5 original thumbnails and optional contact sheet.
 * Zero dependencies. Run in Claude Code/Codespaces with a PRIVATE forwarded port.
 * Example: node books/500-series/tools/thumbnail-gallery.mjs --dir books/<slug>/thumbnails --port 8765
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const argv=process.argv.slice(2);
const value=(key,other)=>{const i=argv.indexOf(key);return i<0?other:argv[i+1];};
if(argv.includes('--help') || !argv.includes('--dir')){
 console.log('Usage: node books/500-series/tools/thumbnail-gallery.mjs --dir <folder> [--port 8765] [--host 127.0.0.1]');
 process.exit(argv.includes('--help')?0:2);
}
const dir=path.resolve(value('--dir','.')), port=Number(value('--port','8765')), host=value('--host','127.0.0.1');
if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory())throw Error('Thumbnails folder not found: '+dir);
function resolution(b){
 if(b.length>=24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
  return [b.readUInt32BE(16),b.readUInt32BE(20)];
 if(b.length>=4&&b[0]===255&&b[1]===216){
  let i=2;while(i+4<b.length){
   if(b[i++]!==255)continue;
   let m=b[i++];while(m===255)m=b[i++];
   if([0xD8,0xD9,0x01].includes(m)||(m>=0xD0&&m<=0xD7))continue;
   if(i+2>b.length)break;
   let len=b.readUInt16BE(i);if(len<2||i+len>b.length)break;
   if((m>=0xC0&&m<=0xC3)||(m>=0xC5&&m<=0xC7)||(m>=0xC9&&m<=0xCB)||(m>=0xCD&&m<=0xCF))
    return [b.readUInt16BE(i+5),b.readUInt16BE(i+3)];
   i+=len;
  }
 }
 throw Error('Invalid image: expected JPG or PNG');
}
const allowed=new Map(), thumbnails=[];
for(let n=1;n<=5;n++){
 const stem='thumbnail-'+String(n).padStart(2,'0');
 const fn=['jpg','jpeg','png'].map(ext=>stem+'.'+ext).find(name=>fs.existsSync(path.join(dir,name)));
 if(!fn)throw Error('Missing '+stem+' (JPG/PNG)');
 const full=path.join(dir,fn),dims=resolution(fs.readFileSync(full));
 if(dims[0]!==1280||dims[1]!==720)throw Error(fn+' must be 1280x720, got '+dims.join('x'));
 allowed.set(fn,full);thumbnails.push(fn);
}
const sheet=['thumbnail-contact-sheet.jpg','thumbnail-contact-sheet.jpeg','thumbnail-contact-sheet.png']
 .find(fn=>fs.existsSync(path.join(dir,fn)));
if(sheet){const file=path.join(dir,sheet);resolution(fs.readFileSync(file));allowed.set(sheet,file);}
const link=(mode,name)=>'/'+mode+'/'+encodeURIComponent(name);
const cards=thumbnails.map((f,i)=>'<article><h2>Обложка №'+(i+1)+'</h2><a target="_blank" href="'+link('view',f)+'"><img src="'+link('view',f)+'" alt="Обложка №'+(i+1)+'"></a><p><a href="'+link('view',f)+'" target="_blank">👁 Просмотреть №'+(i+1)+'</a><a href="'+link('download',f)+'">⬇ Скачать №'+(i+1)+'</a></p><small>Оригинал JPG/PNG · 1280×720</small></article>').join('');
const extras=sheet?'<section><h2>Все 5 обложек вместе</h2><a target="_blank" href="'+link('view',sheet)+'"><img src="'+link('view',sheet)+'" alt="Сводный лист"></a><p><a target="_blank" href="'+link('view',sheet)+'">👁 Посмотреть все</a><a href="'+link('download',sheet)+'">⬇ Скачать общий лист</a></p></section>':'';
const html='<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BanaMind — обложки</title><style>body{font:16px system-ui,Arial;background:#0b2835;color:#fff;margin:auto;padding:25px;max-width:1150px}h1{color:#fbd25e}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:17px}article,section{background:#164051;padding:16px;border-radius:14px;margin:18px 0}img{max-width:100%;height:auto;border-radius:9px}p{display:flex;gap:12px;flex-wrap:wrap}p a{color:#122a36;background:#f4cc52;padding:11px;border-radius:8px;font-weight:bold;text-decoration:none}small{color:#bfd4df}</style></head><body><h1>🍌 BanaMind — 5 обложек</h1><div class="grid">'+cards+'</div>'+extras+'<small>Кнопка «Скачать» отдаёт оригинальный файл без повторного сжатия. Галерея работает, пока запущен сервер. Для Codespaces оставьте port forwarding PRIVATE.</small></body></html>';
const srv=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/'||url.pathname==='/index.html'){
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);return;
 }
 const m=url.pathname.match(/^\/(view|download)\/([^/]+)$/);
 if(!m){res.writeHead(404);res.end('Not found');return;}
 let fn;try{fn=decodeURIComponent(m[2]);}catch{res.writeHead(400);res.end('Bad name');return;}
 if(!allowed.has(fn)){res.writeHead(404);res.end('Not found');return;}
 const b=fs.readFileSync(allowed.get(fn));
 res.writeHead(200,{'Content-Type':fn.endsWith('.png')?'image/png':'image/jpeg','Content-Length':b.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Disposition':(m[1]==='download'?'attachment':'inline')+'; filename="'+fn+'"'});
 res.end(b);
});
srv.listen(port,host,()=>{
 const addr=srv.address();console.log('BanaMind gallery: http://'+host+':'+addr.port+'/');
 console.log('Five originals validated at 1280x720. Image view + uncompressed download links ready.');
 if(host==='0.0.0.0')console.log('SECURITY: keep forwarded Codespaces port PRIVATE, never Public.');
});
