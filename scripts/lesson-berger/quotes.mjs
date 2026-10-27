// Цитаты сценария BM-038 «Почему мы рассказываем?»: каждый фрагмент в «ёлочках» (кроме названий, слов-сигналов
// и терминов из NOT_QUOTES) должен дословно найтись в тексте книги
// books/500-series/sources/BM-038/part-NN.txt (без учёта регистра, ё/е, вида тире,
// неразрывных пробелов и кавычек; многоточие внутри цитаты = пропуск).
import { readFileSync } from "node:fs";
import { SCENES } from "../../src/lesson-berger/script.ts";

// не цитаты: название книги, слова-ощущения и подписи фильма
export const NOT_QUOTES = new Set([
  "Заразительный", "что-то ещё", "степс", "Пожалуйста, не говорите", "собака", "переслать", "распродажа",
  "Зачем тебе усы?", "почему", "как сделать её громче", "чего она стоит, если её передадут",
]);
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/ /g, " ").replace(/[–—-]/g, "-").replace(/[«»"„“”]/g, "").replace(/\s+/g, " ").trim();
let src = "";
for (let i = 1; i <= 16; i++) src += " " + readFileSync(`books/500-series/sources/BM-038/part-${String(i).padStart(2, "0")}.txt`, "utf8");
export const SOURCE = norm(src);
// в тексте издания встречаются слипшиеся слова («Выпозвоните») — запасное сравнение без пробелов
const SOURCE_NS = SOURCE.replace(/ /g, "");

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
        for (const p of pieces) if (!SOURCE.includes(p) && !SOURCE_NS.includes(p.replace(/ /g, ""))) bad.push(`${l.id}: «${q}» → нет «${p}»`);
      }
  return { n, bad };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const { n, bad } = checkQuotes();
  console.log(`цитат: ${n}, не найдено: ${bad.length}`);
  for (const b of bad) console.log("✗ " + b);
  if (bad.length) process.exit(1);
}
