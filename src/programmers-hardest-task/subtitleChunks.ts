// Деление реплики на фрагменты субтитров (общая логика для видео и SRT).
// Конец фрагмента — после знака препинания, при ≥ MAX_WORDS словах или
// когда следующий фрагмент длиннее MAX_CHARS; короткое последнее слово
// не остаётся одно. Время фрагмента — по фактическим таймингам слов.
// Без зависимостей от Remotion.
import { lineById } from "./script.ts";
import type { PhtCue } from "./timing.ts";

const MAX_WORDS = 5;
const MAX_CHARS = 26;

// слово субтитра — токен с буквами или цифрами (цифры номера телефона)
const isWord = (w: string) => /[\p{L}\p{N}]/u.test(w);

export type SubChunk = { readonly words: readonly string[]; readonly from: number; readonly to: number };

// Слова субтитра реплики (токены с буквами/цифрами; «—» прилипает к соседу).
const textGroups = (text: string): string[][] => {
  const groups: string[][] = [];
  for (const t of text.split(/\s+/).filter(Boolean)) {
    if (!isWord(t) && groups.length) groups[groups.length - 1].push(t);
    else groups.push([t]);
  }
  return groups;
};

// Номер первого слова озвучки для каждого слова субтитра (line.spokenWords —
// если слово субтитра звучит несколькими словами, как цифры номера).
export const spokenStarts = (id: string): { readonly first: readonly number[]; readonly total: number; readonly groups: readonly (readonly string[])[] } => {
  const line = lineById(id);
  const groups = textGroups(line.text);
  const first: number[] = [];
  let total = 0;
  groups.forEach((_, i) => {
    first.push(total);
    total += line.spokenWords?.[i] ?? 1;
  });
  return { first, total, groups };
};

// Деление реплики на фрагменты: конец фрагмента — после знака препинания,
// или при ≥ MAX_WORDS словах / > MAX_CHARS символах.
export const chunkLine = (cue: PhtCue): SubChunk[] => {
  // слова субтитра ↔ слова озвучки (по порядку)
  const { first, total: spokenN, groups } = spokenStarts(cue.id);
  const n = groups.length;
  const startOf = (i: number) => (cue.words.length === spokenN ? cue.words[first[i]].start : cue.from + ((cue.to - cue.from) * i) / n);
  const out: { idx: number[] }[] = [];
  let cur: number[] = [];
  const len = (ix: number[]) => ix.map((i) => groups[i].join(" ")).join(" ").length;
  groups.forEach((g, i) => {
    cur.push(i);
    const text = g.join(" ");
    const punct = /[.,!?…:;]$/.test(text);
    const nextLen = i + 1 < n ? len([...cur, i + 1]) : 0;
    const rest = n - 1 - i;
    if (i === n - 1 || (punct && rest > 1) || cur.length >= MAX_WORDS || nextLen > MAX_CHARS) {
      // не оставлять одно короткое слово в конце
      if (rest === 1 && groups[n - 1].join(" ").length <= 6 && len(cur) + 7 <= MAX_CHARS + 6) return;
      out.push({ idx: cur });
      cur = [];
    }
  });
  if (cur.length) out.push({ idx: cur });
  return out.map((c, k) => ({
    words: c.idx.flatMap((i) => groups[i]),
    from: k === 0 ? cue.from - 0.1 : startOf(c.idx[0]) - 0.05,
    to: k === out.length - 1 ? cue.to + 0.35 : startOf(out[k + 1].idx[0]) - 0.05,
  }));
};

