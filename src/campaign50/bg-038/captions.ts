// Титры: деление реплики на короткие фрагменты (без зависимостей от
// Remotion — проверяется тестом scripts/campaign50/bg-038/bg038.test.mjs).
const MAX = 24; // символов во фрагменте
const NBSP = String.fromCharCode(0xa0);

// Слова для титров: тире присоединяется к предыдущему слову (не отдельное
// слово озвучки) и завершает фразу.
export const captionWords = (text: string): string[] => {
  const out: string[] = [];
  for (const tok of text.split(/\s+/).filter(Boolean)) {
    if (!/[\p{L}\p{N}]/u.test(tok)) {
      if (out.length) out[out.length - 1] += NBSP + tok;
      continue;
    }
    out.push(tok);
  }
  return out;
};

const lenOf = (words: readonly string[], ids: readonly number[]) => ids.reduce((a, i) => a + words[i].length + 1, -1);

// Связанные слова не разрываются между фрагментами: «эң көп», «андан
// көп», «эки-үч күн», «башка себеп»; послелог не начинает фрагмент.
const NO_END = /^(эң|андан|башка|эки-үч|төрт-беш|алты-жети)$/i;
const NO_START = /^(менен|боюнча|тууралуу|үчүн)$/i;
const broken = (words: readonly string[], parts: readonly number[][]) =>
  parts.slice(0, -1).some((p, j) => NO_END.test(words[p[p.length - 1]]) || NO_START.test(words[parts[j + 1][0]]));

// Лучшее деление фразы на n частей: минимальна самая длинная часть.
const split = (words: readonly string[], ids: readonly number[], n: number): number[][] => {
  if (n <= 1 || ids.length <= 1) return [ids.slice()];
  let best: number[][] = [ids.slice()];
  let score = Infinity;
  for (let k = 1; k < ids.length; k++) {
    const rest = split(words, ids.slice(k), n - 1);
    const parts = [ids.slice(0, k), ...rest];
    const lens = parts.map((p) => lenOf(words, p));
    const s = (broken(words, parts) ? 1e6 : 0) + Math.max(...lens) * 100 + lens.reduce((a, b) => a + b * b, 0) / 100;
    if (s < score) {
      score = s;
      best = parts;
    }
  }
  return best;
};

// Фрагменты: по фразам (знаки препинания, тире), длинная фраза — на
// равные части; короткая фраза (≤ 8 знаков) присоединяется к соседней.
export const chunksOf = (words: readonly string[]): number[][] => {
  const phrases: number[][] = [];
  let cur: number[] = [];
  words.forEach((w, i) => {
    cur.push(i);
    if (/[.!?:,—]$/.test(w)) {
      phrases.push(cur);
      cur = [];
    }
  });
  if (cur.length) phrases.push(cur);
  const merged: number[][] = [];
  for (const ph of phrases) {
    const last = merged[merged.length - 1];
    if (last && (lenOf(words, last) <= 8 || lenOf(words, ph) <= 8)) merged[merged.length - 1] = [...last, ...ph];
    else merged.push(ph);
  }
  return merged.flatMap((ph) => split(words, ph, Math.max(1, Math.ceil(lenOf(words, ph) / MAX))));
};
