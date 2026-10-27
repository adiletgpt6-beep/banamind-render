// Деление реплики на короткие фразы субтитров по фактическим таймингам слов
// (без зависимостей от Remotion — проверяется в check.test.mjs).
import type { B48Cue } from "./timing.ts";

export const MAX = 28;
export const CONJ = new Set(["же", "жана", "анан", "бирок"]);
const isWord = (w: string) => /[\p{L}\p{N}]/u.test(w);

export type Chunk = { readonly text: string; readonly from: number; readonly to: number };

// Делит реплику на фразы; время фразы — от первого её слова до начала
// следующей (последняя — до конца речи + 0,35 с).
export const chunkCue = (c: B48Cue): Chunk[] => {
  // тире — к предыдущему слову («кадам —»)
  const tokens: string[] = [];
  for (const tok of c.text.split(/\s+/).filter(Boolean)) {
    if (!isWord(tok) && tokens.length) tokens[tokens.length - 1] += ` ${tok}`;
    else tokens.push(tok);
  }
  const len = (g: string[]) => g.join(" ").length;
  let groups: string[][] = [];
  if (len(tokens) <= MAX + 4) groups = [tokens];
  else {
    let cur: string[] = [];
    tokens.forEach((tok, i) => {
      cur.push(tok);
      const next = tokens[i + 1];
      const endSentence = /[.!?…]$/.test(tok);
      const comma = /[,:—]$/.test(tok);
      const tooLong = next !== undefined && len([...cur, next]) > MAX;
      if (next === undefined || endSentence || (comma && len(cur) >= 8) || tooLong) {
        // не заканчивать фразу союзом — перенести его в следующую
        const last = cur[cur.length - 1].toLowerCase().replace(/[^\p{L}]/gu, "");
        if (next !== undefined && !endSentence && cur.length > 1 && CONJ.has(last)) {
          const moved = cur.pop()!;
          groups.push(cur);
          cur = [moved];
        } else {
          groups.push(cur);
          cur = [];
        }
      }
    });
    if (cur.length) groups.push(cur);
    // короткий хвост («эмес.», «акысыз.») — забрать к нему слово из
    // предыдущей фразы, если та не кончается точкой
    for (let i = 1; i < groups.length; i++) {
      const prev = groups[i - 1];
      while (len(groups[i]) < 13 && prev.length > 2 && !/[.!?…,:]$/.test(prev[prev.length - 1]) && len([prev[prev.length - 1], ...groups[i]]) <= MAX) {
        groups[i] = [prev.pop()!, ...groups[i]];
      }
    }
  }
  // индекс первого слова каждой группы → время слова
  let wi = 0;
  const starts: number[] = [];
  for (const g of groups) {
    starts.push(c.words[wi]?.start ?? c.from);
    wi += g.length;
  }
  return groups.map((g, i) => ({
    text: g.join(" "),
    from: i === 0 ? c.from : starts[i],
    to: i < groups.length - 1 ? starts[i + 1] : c.to + 0.35,
  }));
};
