// Индекс писем BM-026 из manifest.json: римский номер → файл part-NN.txt и
// диапазон строк письма в этом файле. Нужен для проверки ссылок сценария
// («XIII §4 p02 L12») и цитат. Заголовки с кириллическими С/Х нормализованы
// только в индексе; сам текст не меняется.
import { readFileSync } from "node:fs";

export const SRC_DIR = "books/500-series/sources/BM-026";
const M = JSON.parse(readFileSync(`${SRC_DIR}/manifest.json`, "utf8"));

export const PARTS = M.parts.map((p, i) => {
  const n = i + 1;
  const text = readFileSync(`${SRC_DIR}/${p.file}`, "utf8");
  return { n, file: p.file, text, lines: text.split("\n") };
});

// письмо → { part, from, to } (строки файла, включительно)
export const LETTERS = new Map();
M.parts.forEach((p, i) => {
  const idx = p.letter_index;
  idx.forEach((l, k) => {
    const to = k + 1 < idx.length ? idx[k + 1].part_line - 1 : PARTS[i].lines.length;
    LETTERS.set(l.roman_normalized, { number: l.number, part: i + 1, from: l.part_line, to });
  });
});

// разбор ссылки сценария: «XIII §4 p02 L12», «XIII §4–5 p02 L12–13», «XCV §12 p10 L40»
export const parseRef = (r) => {
  const m = /^([IVXLC]+) §(\d+)(?:–(\d+))? p(\d\d) L(\d+)(?:–(\d+))?$/.exec(r);
  if (!m) return null;
  return { roman: m[1], par: [Number(m[2]), Number(m[3] ?? m[2])], part: Number(m[4]), lines: [Number(m[5]), Number(m[6] ?? m[5])] };
};

// параграф «(n)» действительно есть в указанных строках письма
export const checkRef = (r) => {
  const p = parseRef(r);
  if (!p) return `формат ссылки: ${r}`;
  const L = LETTERS.get(p.roman);
  if (!L) return `нет письма ${p.roman}`;
  if (L.part !== p.part) return `${r}: письмо ${p.roman} в part-${String(L.part).padStart(2, "0")}`;
  if (p.lines[0] < L.from || p.lines[1] > L.to) return `${r}: строки вне письма (L${L.from}–${L.to})`;
  const lines = PARTS[p.part - 1].lines;
  const text = lines.slice(p.lines[0] - 1, p.lines[1]).join("\n");
  // параграф, продолжающийся с предыдущих строк письма (абзац без номера)
  let carried = 1;
  for (let i = L.from - 1; i < p.lines[0] - 1; i++) for (const m of lines[i].matchAll(/\((\d+)\)/g)) carried = Number(m[1]);
  for (const n of p.par) if (n > 1 && n !== carried && !text.includes(`(${n})`)) return `${r}: в строках нет § (${n})`;
  return null;
};
