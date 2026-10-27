// Оригинальность текста BM-031: озвучка — наш пересказ, а не текст перевода.
// 1) Ни одна реплика не совпадает с книгой фрагментом из 7 слов подряд и длиннее
//    (без учёта регистра, ё/е, знаков препинания и слипшихся слов источника).
// 2) Фрагменты в «ёлочках» короткие (≤ 6 слов): это ярлыки и пересказ, а не цитаты.
// Источник: books/500-series/sources/BM-031/part-01…25.txt.
import { readFileSync } from "node:fs";
import { SCENES } from "../../src/books/harry-potter-philosophers-stone/film/script.ts";

const words = (s) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
let src = "";
for (let i = 1; i <= 25; i++) src += " " + readFileSync(`books/500-series/sources/BM-031/part-${String(i).padStart(2, "0")}.txt`, "utf8");
const W = words(src);
export const N = 7;
const grams = new Set();
for (let i = 0; i + N <= W.length; i++) grams.add(W.slice(i, i + N).join(" "));

export const checkOriginality = () => {
  const overlaps = [];
  const longQuotes = [];
  for (const s of SCENES)
    for (const l of s.lines) {
      const w = words(l.text);
      for (let i = 0; i + N <= w.length; i++) {
        const g = w.slice(i, i + N).join(" ");
        if (grams.has(g)) overlaps.push(`${l.id}: «${g}»`);
      }
      for (const m of l.text.matchAll(/«([^»]+)»/g)) if (m[1].split(/\s+/).length > 6) longQuotes.push(`${l.id}: «${m[1]}»`);
    }
  return { overlaps, longQuotes };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const { overlaps, longQuotes } = checkOriginality();
  console.log(`совпадений ${N}+ слов с книгой: ${overlaps.length}; длинных «цитат»: ${longQuotes.length}`);
  for (const b of [...overlaps, ...longQuotes]) console.log("✗ " + b);
  if (overlaps.length || longQuotes.length) process.exit(1);
}
