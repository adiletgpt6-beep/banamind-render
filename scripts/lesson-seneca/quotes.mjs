// Цитаты сценария BM-026: каждый фрагмент в «ёлочках» (кроме названий и
// терминов из списка NOT_QUOTES) должен дословно найтись в тексте писем
// books/500-series/sources/BM-026/part-NN.txt (сравнение без учёта регистра,
// ё/е, вида тире, сносок [n] и пробелов; многоточие внутри цитаты = пропуск).
// Повтор из XXVII внутри XXVIII (дефект копии) не считается текстом XXVIII:
// цитата, найденная только в этом участке, не принимается.
import { SCENES } from "../../src/lesson-seneca/script.ts";
import { LETTERS, PARTS } from "./letters.mjs";

export const NOT_QUOTES = new Set(["Нравственные письма к Луцилию", "время", "одобрение", "достаток", "страх", "отношения"]);
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/\[\d+\]/g, "").replace(/[–—-]/g, "-").replace(/[«»"„“]/g, "").replace(/\s+/g, " ").trim();

// текст без повреждённого первого параграфа XXVIII (L45 и далее до § 2)
const x28 = LETTERS.get("XXVIII");
let src = "";
for (const p of PARTS) {
  if (p.n !== x28.part) {
    src += " " + p.text;
    continue;
  }
  const lines = p.lines.slice();
  for (let i = x28.from - 1; i < x28.to; i++) {
    const k = lines[i].indexOf("(2)");
    if (k >= 0) {
      lines[i] = lines[i].slice(k);
      break;
    }
    lines[i] = "";
  }
  src += " " + lines.join("\n");
}
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
