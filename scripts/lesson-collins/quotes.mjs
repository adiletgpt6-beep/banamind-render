// Цитаты сценария BM-037: каждый фрагмент в «ёлочках» (кроме названий и слов-сигналов
// из NOT_QUOTES) должен дословно найтись в тексте книги books/500-series/sources/BM-037/part-NN.txt
// (без учёта регистра, ё/е, вида тире, неразрывных пробелов, кавычек и склеенных пробелов;
// многоточие внутри цитаты = пропуск).
import { readFileSync } from "node:fs";
import { SCENES } from "../../src/lesson-collins/script.ts";

// не цитаты: название книги и слова-сигналы фильма
export const NOT_QUOTES = new Set(["От хорошего к великому", "сегодня", "в этих компаниях наблюдали", "это точно сработает у вас", "Рост!"]);
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/ /g, " ").replace(/[–—-]/g, "-").replace(/[«»"„“”]/g, "").replace(/\s+/g, " ").trim();
let src = "";
for (let i = 1; i <= 25; i++) src += " " + readFileSync(`books/500-series/sources/BM-037/part-${String(i).padStart(2, "0")}.txt`, "utf8");
// текст, напечатанный только на рисунках (расшифровки — source-map/04-parts-12-14.md, 02-parts-04-07.md)
const FIGURE_TEXT = [
  // imgd8a4/img3c40 — таблица 8.1 «Не было чудесного момента»
  "Не было судьбоносного собрания или божественного открытия, не было яркого света, который бы засверкал, как только что вкрученная лампочка. Это была скорее эволюция.",
  "Не было чудесного события, не было поворотного момента. Это была комбинация факторов, эволюция, хотя результаты и были поразительными.",
  "Я не думаю, что это произошло так внезапно, как кажется. Это не случается в один день.",
  // imgb — табличка «Парадокс Стокдейла»
  "Сохраняйте веру и вы победите, невзирая ни на какие трудности, и в то же самое время смотрите суровой правде в лицо, какой бы жестокой эта правда ни казалась.",
];
src += " " + FIGURE_TEXT.join(" ");
export const SOURCE = norm(src);
// в тексте издания много слипшихся слов («Этопониманиетого») — запасное сравнение без пробелов
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
