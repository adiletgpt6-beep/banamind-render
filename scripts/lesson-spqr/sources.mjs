// Источник BM-040: books/500-series/sources/BM-040/part-01…42.txt (без служебных
// заголовков — каждая строка файла = строка исходного TXT). Ссылка сцены
// «p05 L17» = файл part-05.txt, строка 17 этого файла; «p05 L17–20» — диапазон.
// Исходная строка книги — по line-index.csv (part-01 содержит разрыв 3 → 10).
import { readFileSync } from "node:fs";

const DIR = "books/500-series/sources/BM-040";
const INDEX = new Map();
for (const row of readFileSync(`${DIR}/line-index.csv`, "utf8").trim().split("\n").slice(1)) {
  const [file, local, orig] = row.split(",");
  INDEX.set(`${file}:${local}`, Number(orig));
}

export const PARTS = Array.from({ length: 42 }, (_, i) => {
  const n = i + 1;
  const name = `part-${String(n).padStart(2, "0")}.txt`;
  const text = readFileSync(`${DIR}/${name}`, "utf8");
  const lines = text.replace(/\n$/, "").split("\n");
  return { n, name, text, lines };
});

export const parseRef = (r) => {
  const m = /^p(\d{2}) L(\d+)(?:–L?(\d+))?$/.exec(r);
  return m ? { part: Number(m[1]), line: Number(m[2]), end: m[3] ? Number(m[3]) : Number(m[2]) } : null;
};
export const original = (r) => {
  const p = parseRef(r);
  return p ? (INDEX.get(`${PARTS[p.part - 1]?.name}:${p.line}`) ?? null) : null;
};

// null — ссылка верна (файл есть, строка — непустой текст книги)
export const checkRef = (r) => {
  if (/^png _\d+$/.test(r)) return null; // хронологическая таблица / карта из reference/
  const p = parseRef(r);
  if (!p) return `не ссылка: ${r}`;
  const part = PARTS[p.part - 1];
  if (!part) return `нет файла p${p.part}`;
  if (p.end < p.line) return `${r}: обратный диапазон`;
  for (const L of [p.line, p.end]) {
    if (L < 1 || L > part.lines.length) return `${r}: строки ${L} нет`;
    if (!part.lines[L - 1].trim()) return `${r}: пустая строка`;
  }
  return null;
};
