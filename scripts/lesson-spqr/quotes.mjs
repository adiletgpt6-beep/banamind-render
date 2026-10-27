// Цитаты сценария BM-040: каждый фрагмент в «ёлочках» (кроме названий, терминов и
// образов фильма из списка NOT_QUOTES) должен дословно найтись в тексте книги
// books/500-series/sources/BM-040/part-NN.txt (сравнение без учёта регистра,
// ё/е, вида тире, неразрывных пробелов, сносок [n] и пробелов; многоточие
// внутри цитаты = пропуск).
import { SCENES } from "../../src/books/spqr-history-ancient-rome-beard/film/script.ts";
import { PARTS } from "./sources.mjs";

export const NOT_QUOTES = new Set([
  "римлянин", "сенат и народ римский", "Деяниях", "отцом отечества", "Я римский гражданин!", "И ты, Брут?",
  "Приветствуем тебя, Цезарь!", "мистер Рим", "Трою", "либерализм", "Октавианом", "царь", "римским",
  "достойных", "смиренных", "свободные", "британчиках", "британчиках»", "Жди", "играйте, римляне",
]);
// склейки слов в исходнике (курсив при конвертации) не мешают сравнению: пробелы убираются
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/\[\d+\]/g, "").replace(/[–—-]/g, "-").replace(/[«»"„“]/g, "").replace(/[\s ]+/g, "").trim();
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
