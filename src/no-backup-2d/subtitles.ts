// Субтитры BalaGoNoBackup2D: точный кыргызский текст реплики, короткими
// смысловыми фрагментами (до двух строк), по фактическим таймингам слов
// записи. Без зависимостей от Remotion (проверяется тестом).
import { NB2_LINES } from "./script.ts";
import type { Nb2Cue } from "./timing.ts";

export type Nb2Subtitle = { readonly id: string; readonly text: string; readonly from: number; readonly to: number };

// Короткая реплика — одним блоком; длинная делится по предложениям
// (слишком короткие куски присоединяются к соседним), а предложение
// длиннее двух строк — по запятой с наиболее ровными частями.
export const SUB_WHOLE = 40;
export const SUB_MAX_CHARS = 52;
const SUB_MIN = 12;
const HOLD = 0.35; // после последнего слова субтитр держится ещё немного

const len = (g: readonly string[]) => g.join(" ").length;

const bySentence = (tokens: string[]): string[][] => {
  const out: string[][] = [[]];
  tokens.forEach((t, i) => {
    out[out.length - 1].push(t);
    if (/[.?!…]$/.test(t) && i < tokens.length - 1) out.push([]);
  });
  // короткий кусок («BalaGo.») — вместе со следующим
  for (let i = 0; i < out.length - 1; ) {
    if (len(out[i]) < SUB_MIN || len(out[i + 1]) < SUB_MIN) out.splice(i, 2, [...out[i], ...out[i + 1]]);
    else i++;
  }
  return out;
};

const byComma = (g: string[]): string[][] => {
  let best: string[][] | null = null;
  g.forEach((t, i) => {
    if (!/[,—]$/.test(t) || i === g.length - 1) return;
    const a = g.slice(0, i + 1);
    const b = g.slice(i + 1);
    if (len(a) < SUB_MIN || len(b) < SUB_MIN) return;
    if (!best || Math.max(len(a), len(b)) < Math.max(len(best[0]), len(best[1]))) best = [a, b];
  });
  if (best) return best;
  // без подходящей запятой — по границе слов, ближе к середине
  let mid: string[][] = [g];
  for (let i = 1; i < g.length; i++) {
    const a = g.slice(0, i);
    const b = g.slice(i);
    if (Math.max(len(a), len(b)) < Math.max(...mid.map(len))) mid = [a, b];
  }
  return mid;
};

export const chunkText = (text: string): string[][] => {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (text.length <= SUB_WHOLE) return [tokens];
  return bySentence(tokens).flatMap((g) => (len(g) > SUB_MAX_CHARS ? byComma(g) : [g]));
};

export const buildNb2Subtitles = (cues: readonly Nb2Cue[]): Nb2Subtitle[] => {
  const all = buildRaw(cues);
  // следующий фрагмент сменяет предыдущий без наложения
  return all.map((s, i) => (all[i + 1] && all[i + 1].from < s.to ? { ...s, to: all[i + 1].from } : s));
};

const buildRaw = (cues: readonly Nb2Cue[]): Nb2Subtitle[] =>
  cues.flatMap((cue) => {
    const line = NB2_LINES.find((l) => l.id === cue.id)!;
    // текст уже на экране (сообщение коллеги, финальная карточка)
    if (line.noSubtitle) return [];
    const groups = line.subtitle ? line.subtitle.map((g) => g.split(/\s+/)) : chunkText(line.text);
    // слова экранного текста ↔ слова записи (тире без букв не звучит)
    let w = 0;
    const starts = groups.map((g) => {
      const first = cue.words[w]?.start ?? cue.from;
      w += g.filter((t) => /\p{L}/u.test(t)).length;
      return first;
    });
    return groups.map((g, i) => ({
      id: `${cue.id}-${i}`,
      text: g.join(" "),
      from: Math.max(cue.from - 0.1, starts[i] - 0.1),
      to: i < groups.length - 1 ? starts[i + 1] - 0.1 : cue.to + HOLD,
    }));
  });
