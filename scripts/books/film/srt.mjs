// SRT фильма книги BanaMind из тех же титров, что в кадре.
// Запуск: node scripts/books/film/srt.mjs src/books/<slug>/film/film.ts out/film.srt
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [MOD, OUT = "out/film.srt"] = process.argv.slice(2);
const film = await import(pathToFileURL(MOD).href);
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const tl = film.timeline();
const list = film.buildCues(tl);
writeFileSync(OUT, list.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${film.cueText(c).join("\n")}\n`).join("\n"));
console.log(`✓ ${OUT}: ${list.length} титров, ${tl.duration.toFixed(2)} с`);
