// Цитаты сценария BM-032 «Джейн Эйр»: каждый фрагмент в «ёлочках» (кроме названий и
// терминов из списка NOT_QUOTES) должен дословно найтись в тексте романа
// books/500-series/sources/BM-032/part-NN.txt (сравнение без учёта регистра,
// ё/е, вида тире и пробелов; многоточие внутри цитаты = пропуск).
import { readFileSync } from "node:fs";
import { SCENES } from "../../src/lesson-jane/script.ts";

export const NOT_QUOTES = new Set(["Джейн Эйр", "нет", "да"]);
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[–—-]/g, "-").replace(/[«»"„“]/g, "").replace(/[\s\u00a0]+/g, " ").trim();
let src = "";
for (let i = 1; i <= 25; i++) src += " " + readFileSync(`books/500-series/sources/BM-032/part-${String(i).padStart(2, "0")}.txt`, "utf8");
export const SOURCE = norm(src);

export const checkQuotes = () => {
  const bad = [];
  let n = 0;
  for (const s of SCENES)
    for (const l of s.lines)
      for (const m of l.text.matchAll(/«([^»]+)»/g)) {
        const q = m[1];
        if (NOT_QUOTES.has(q)) continue;
        const pieces = q.split(/…|\.\.\./).map((p) => norm(p).replace(/^[\s,.!?:;-]+|[\s,.!?:;-]+$/g, "")).filter((p) => p.length > 0);
        n++;
        for (const p of pieces) if (!SOURCE.includes(p)) bad.push(`${l.id}: «${q}» → нет «${p}»`);
      }
  return { n, bad };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const { n, bad } = checkQuotes();
  console.log(`цитат: ${n}, не найдено: ${bad.length}`);
  for (const b of bad) console.log("✗ " + b);
  if (bad.length) process.exit(1);
}
