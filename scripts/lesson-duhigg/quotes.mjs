// Цитаты сценария BM-035: каждый фрагмент в «ёлочках» (кроме названий и
// терминов из списка NOT_QUOTES) должен дословно найтись в тексте книги
// books/500-series/sources/BM-035/part-NN.txt (сравнение без учёта регистра,
// ё/е, вида тире, неразрывных пробелов, сносок [n] и пробелов; многоточие
// внутри цитаты = пропуск).
import { SCENES } from "../../src/lesson-duhigg/script.ts";
import { PARTS } from "./sources.mjs";

export const NOT_QUOTES = new Set(["Сила привычки", "видеофильм", "знак", "верно", "Как водичка?", "привычка", "прямо — налево — шоколад", "так получилось", "я это выбираю"]);
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/\[\d+\]/g, "").replace(/[–—-]/g, "-").replace(/[«»"„“]/g, "").replace(/\s+/g, " ").trim();
export const SOURCE = norm(PARTS.map((p) => p.text).join(" "));

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
