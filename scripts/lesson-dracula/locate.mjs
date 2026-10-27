// Помощник сценариста BM-033: по фрагменту текста печатает точную опору
// «гл.N pNN LNNN» (все вхождения в русской редакции 2013 года).
//   node scripts/lesson-dracula/locate.mjs "не похоже на Джонатана" "Записи помогут мне"
import { CHAPTERS, norm, PARTS } from "./source.mjs";

const chapterOf = (part, line) => {
  let best = null;
  for (const [n, c] of CHAPTERS) if (c.part === part && line >= c.from && line <= c.to) best = n;
  return best;
};

export const locate = (frag) => {
  const f = norm(frag);
  const out = [];
  for (const p of PARTS)
    p.lines.forEach((l, i) => {
      if (i >= 3 && norm(l).includes(f)) out.push(`гл.${chapterOf(p.n, i + 1)} p${String(p.n).padStart(2, "0")} L${i + 1}`);
    });
  return out.length ? out.join(", ") : "не найдено";
};

if (import.meta.url === `file://${process.argv[1]}`) for (const a of process.argv.slice(2)) console.log(a.padEnd(50), "→", locate(a));
