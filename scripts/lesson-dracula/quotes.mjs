// Цитаты сценария BM-033: каждый фрагмент в «ёлочках» (кроме названий и
// терминов из NOT_QUOTES) должен дословно найтись в русской редакции 2013 года
// (books/500-series/sources/BM-033/part-NN.txt). Сравнение без учёта регистра,
// ё/е, вида тире, кавычек и пробелов; многоточие внутри цитаты = пропуск.
// Если у сцены есть опоры «гл.N pNN LNNN», цитата должна найтись в одной из этих строк.
import { SCENES } from "../../src/lesson-dracula/script.ts";
import { lineText, norm, parseRef, SOURCE } from "./source.mjs";

export const NOT_QUOTES = new Set([
  "Дракула", "Бюро невозможных доказательств", "наблюдение", "догадка", "свидетельство",
  "это сон", "это нервы", "это суеверие", "это болезнь", "это совпадение", "разумно", "суеверно",
]);
const clean = (p) => norm(p).replace(/^[\s,.!?:;-]+|[\s,.!?:;-]+$/g, "");

export const checkQuotes = () => {
  const bad = [];
  let n = 0;
  for (const s of SCENES) {
    const refs = s.src.map(parseRef).filter(Boolean);
    const local = norm(refs.map((r) => Array.from({ length: r.to - r.line + 1 + 2 }, (_, k) => lineText(r.part, r.line - 1 + k)).join(" ")).join(" "));
    for (const l of s.lines)
      for (const m of l.text.matchAll(/«([^»]+)»/g)) {
        const q = m[1];
        if (NOT_QUOTES.has(q)) continue;
        const pieces = q.split(/…|\.\.\./).map(clean).filter((p) => p.length > 0);
        n++;
        for (const p of pieces) {
          if (!SOURCE.includes(p)) bad.push(`${l.id}: «${q}» → нет в книге «${p}»`);
          else if (refs.length && !local.includes(p)) bad.push(`${l.id}: «${q}» → есть в книге, но не в опорах сцены ${s.src.join(", ")}`);
        }
      }
  }
  return { n, bad };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const { n, bad } = checkQuotes();
  console.log(`цитат: ${n}, не найдено: ${bad.length}`);
  for (const b of bad) console.log("✗ " + b);
  if (bad.length) process.exit(1);
}
