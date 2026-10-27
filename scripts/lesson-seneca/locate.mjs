// Помощник сценариста BM-026: по письму и фрагменту текста печатает точную
// ссылку «XIII §4 p02 L17» (параграф — ближайший маркер «(n)» перед фрагментом
// в пределах письма; § 1 — если маркера ещё не было).
//   node scripts/lesson-seneca/locate.mjs "XIII|воображение, мой Луцилий" "I|одно лишь время наше"
import { LETTERS, PARTS } from "./letters.mjs";

const norm = (s) => s.replace(/\[\d+\]/g, "").replace(/ /g, " ");
export const locate = (roman, frag) => {
  const L = LETTERS.get(roman);
  if (!L) return `нет письма ${roman}`;
  const lines = PARTS[L.part - 1].lines;
  let par = 1;
  for (let i = L.from - 1; i < L.to; i++) {
    const ln = norm(lines[i]);
    const k = ln.indexOf(norm(frag));
    const before = k >= 0 ? ln.slice(0, k) : ln;
    const ms = [...before.matchAll(/\((\d+)\)/g)];
    if (ms.length) par = Number(ms[ms.length - 1][1]);
    if (k >= 0) return `${roman} §${par} p${String(L.part).padStart(2, "0")} L${i + 1}`;
  }
  return `не найдено: ${roman} | ${frag}`;
};

if (import.meta.url === `file://${process.argv[1]}`) for (const a of process.argv.slice(2)) console.log(a.padEnd(60), "→", locate(...a.split("|")));
