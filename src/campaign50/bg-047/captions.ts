// Титры: деление реплики на короткие фрагменты (без зависимостей от
// Remotion — проверяется тестом scripts/campaign50/bg-047/bg047.test.mjs).
const MAX = 22; // символов во фрагменте
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

// Лучшее деление фразы на n частей: минимальна самая длинная часть.
const split = (words: readonly string[], ids: readonly number[], n: number): number[][] => {
  if (n <= 1 || ids.length <= 1) return [ids.slice()];
  let best: number[][] = [ids.slice()];
  let score = Infinity;
  for (let k = 1; k < ids.length; k++) {
    const rest = split(words, ids.slice(k), n - 1);
    const parts = [ids.slice(0, k), ...rest];
    const lens = parts.map((p) => lenOf(words, p));
    const s = Math.max(...lens) * 100 + lens.reduce((a, b) => a + b * b, 0) / 100;
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
  const out: number[][] = [];
  for (const ph of merged) for (const part of split(words, ph, Math.max(1, Math.ceil(lenOf(words, ph) / MAX)))) out.push(part);
  return out;
};

// Группы слов реплики: ручные фрагменты (captions), если заданы, иначе
// автоматическое деление chunksOf.
export const captionGroups = (text: string, captions?: readonly string[]): number[][] => {
  const words = captionWords(text);
  if (!captions?.length) return chunksOf(words);
  const groups: number[][] = [];
  let k = 0;
  for (const part of captions) {
    const n = captionWords(part).length;
    groups.push(Array.from({ length: n }, (_, i) => k + i));
    k += n;
  }
  if (k !== words.length) return chunksOf(words);
  return groups;
};
