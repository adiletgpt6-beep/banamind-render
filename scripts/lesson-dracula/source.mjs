// Источник фильма BM-033: 12 частей русской редакции 2013 года «Дракулы»
// (books/500-series/sources/BM-033/part-01…12.txt, 23 главы). Строки 1–3 каждой
// части — служебная шапка BanaMind; номера строк — как в файле (1-based).
// Опора сцены: «гл.4 p02 L76» — глава этой редакции, файл part-02.txt, строка 76.
// checkRef проверяет, что строка существует, не служебная и лежит внутри главы.
import { readFileSync } from "node:fs";

const DIR = "books/500-series/sources/BM-033";
export const PARTS = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const text = readFileSync(`${DIR}/part-${String(n).padStart(2, "0")}.txt`, "utf8");
  return { n, text, lines: text.split("\n") };
});

// Главы: заголовок «Глава N» в начале строки (после пробелов) → [part, from, to].
export const CHAPTERS = new Map();
for (const p of PARTS)
  p.lines.forEach((l, i) => {
    const m = /^\s*Глава (\d+)/.exec(l);
    if (m) CHAPTERS.set(Number(m[1]), { part: p.n, from: i + 1, to: p.lines.length });
  });
for (const [n, c] of CHAPTERS) {
  const next = CHAPTERS.get(n + 1);
  if (next && next.part === c.part) c.to = next.from - 1;
}

export const parseRef = (r) => {
  const m = /^гл\.(\d+) p(\d\d) L(\d+)(?:-(\d+))?$/.exec(r);
  return m ? { ch: Number(m[1]), part: Number(m[2]), line: Number(m[3]), to: m[4] ? Number(m[4]) : Number(m[3]) } : null;
};

export const checkRef = (r) => {
  const p = parseRef(r);
  if (!p) return `неверный формат опоры «${r}»`;
  const c = CHAPTERS.get(p.ch);
  if (!c) return `нет главы ${p.ch}`;
  if (c.part !== p.part) return `глава ${p.ch} в part-${String(c.part).padStart(2, "0")}, а не p${String(p.part).padStart(2, "0")}`;
  if (p.line < Math.max(4, c.from) || p.to > c.to || p.to < p.line) return `строки ${p.line}–${p.to} вне главы ${p.ch} (${c.from}–${c.to})`;
  const txt = PARTS[p.part - 1].lines.slice(p.line - 1, p.to).join(" ").trim();
  if (!txt) return `пустая строка ${r}`;
  return null;
};

// Нормализация для сверки цитат: регистр, ё/е, тире, кавычки, пробелы.
export const norm = (s) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[–—-]/g, "-")
    .replace(/[«»"„“”]/g, "")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Текст романа без служебных шапок (строки 1–3 каждой части).
export const SOURCE = norm(PARTS.map((p) => p.lines.slice(3).join("\n")).join("\n"));
export const lineText = (part, line) => PARTS[part - 1].lines[line - 1] ?? "";
