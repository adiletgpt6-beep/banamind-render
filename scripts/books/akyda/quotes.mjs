// Проверка цитат сценария BM-003: каждая «цитата» из трёх и более слов в репликах
// должна дословно (после нормализации пробелов, переносов, ё/е, тире и кавычек)
// встречаться в тексте книги. Короткие термины в кавычках не проверяются.
// node scripts/books/akyda/quotes.mjs
import { readFileSync } from "node:fs";
import { SCENES } from "../../../src/books/islamskoe-verouchenie-akyda/script.ts";

const SRC = "books/500-series/tasks/BM-003/source-text/islam_akaida_full_text.txt";
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[«»"“”„'’`]/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/-\s*\n\s*/g, "")
    .replace(/[.,!?;:()\[\]…]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const book = norm(
  readFileSync(SRC, "utf8")
    .split("\n")
    .filter((l) => !/СТРАНИЦА PDF|^\s*\d+\s*$/.test(l))
    .join("\n"),
);
// внешние «…» с учётом вложенных кавычек
const quotes = (text) => {
  const out = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "«") {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (text[i] === "»" && depth > 0) {
      depth--;
      if (depth === 0) out.push(text.slice(start, i));
    }
  }
  return out;
};
let checked = 0;
const bad = [];
for (const s of SCENES)
  for (const l of s.lines)
    for (const q of quotes(l.text)) {
      const n = norm(q);
      if (n.split(" ").length < 3) continue;
      checked++;
      if (!book.includes(n)) bad.push(`${l.id}: «${q}»`);
    }
console.log(`цитат проверено: ${checked}, не найдено: ${bad.length}`);
for (const b of bad) console.log("  ✗ " + b);
if (bad.length) process.exit(1);
