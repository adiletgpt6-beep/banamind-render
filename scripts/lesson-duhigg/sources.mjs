// Источник BM-035: books/500-series/sources/BM-035/part-01…16.txt. Ссылка сцены
// «p05 L17» = файл part-05.txt, строка 17 этого файла (строки 1–3 — служебный
// заголовок координатора, не текст книги). Исходная строка книги = начало
// диапазона из заголовка + (L − 4).
import { readFileSync } from "node:fs";

const DIR = "books/500-series/sources/BM-035";
export const PARTS = Array.from({ length: 16 }, (_, i) => {
  const n = i + 1;
  const text = readFileSync(`${DIR}/part-${String(n).padStart(2, "0")}.txt`, "utf8");
  const lines = text.split("\n");
  const m = /Исходные строки (\d+)[–-](\d+)/.exec(lines[1]);
  return { n, text: lines.slice(3).join("\n"), lines, from: Number(m?.[1] ?? 0), to: Number(m?.[2] ?? 0) };
});

export const parseRef = (r) => {
  const m = /^p(\d{2}) L(\d+)(?:–L?(\d+))?$/.exec(r);
  return m ? { part: Number(m[1]), line: Number(m[2]), end: m[3] ? Number(m[3]) : Number(m[2]) } : null;
};
export const original = (r) => {
  const p = parseRef(r);
  if (!p) return null;
  return PARTS[p.part - 1].from + p.line - 4;
};

// null — ссылка верна (файл есть, строка — текст книги, не пустая)
export const checkRef = (r) => {
  const p = parseRef(r);
  if (!p) return `не ссылка: ${r}`;
  const part = PARTS[p.part - 1];
  if (!part) return `нет файла p${p.part}`;
  for (const L of [p.line, p.end]) {
    if (L < 4 || L > part.lines.length) return `${r}: строки ${L} нет`;
    if (!part.lines[L - 1].trim()) return `${r}: пустая строка`;
  }
  return null;
};
