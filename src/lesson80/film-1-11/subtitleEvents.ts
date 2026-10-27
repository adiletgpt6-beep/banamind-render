// События субтитров (общие для встроенных субтитров и SRT): по фактически
// звучащим 45 репликам; начало — с первым звуком реплики (не раньше),
// конец — через 0,3 с после речи, но до начала следующей реплики. Вопрос
// зрителю держится на экране до конца паузы (за 0,1 с до первого звука
// ответа). Длинная реплика делится на части по предложениям (≤ 2 строк по
// 44 знака), вторая часть появляется по своему слову в озвучке. Без имён,
// номеров и пометок. Без зависимостей от Remotion.
import { L80_PAUSES, lineById } from "./script.ts";
import type { L80Timeline } from "./timeline.ts";

export const SUB_MAX = 44;

export type SubEvent = { readonly id: number; readonly part: number; readonly from: number; readonly to: number; readonly text: string };

// Хороший перенос — после конца предложения или после «,:;» (не после тире
// «Аллах — наш Создатель» и не внутри цитаты в «ёлочках»).
const SENTENCE_END = /[.!?…]»?$/;
const SOFT_END = /[,:;]$/;
const openQuote = (s: string) => (s.match(/«/g)?.length ?? 0) > (s.match(/»/g)?.length ?? 0);
const breaks = (text: string) => {
  const words = text.split(" ");
  return words.slice(1).map((_, k) => ({ a: words.slice(0, k + 1).join(" "), b: words.slice(k + 1).join(" ") })).filter((x) => x.a.length <= SUB_MAX && x.b.length <= SUB_MAX);
};
const fitsWell = (text: string) => text.length <= SUB_MAX || breaks(text).some((x) => (SENTENCE_END.test(x.a) || SOFT_END.test(x.a)) && !openQuote(x.a));

// Длинная реплика — части по предложениям: предложения объединяются в один
// субтитр, только если его можно красиво разбить на две строки.
const chunks = (text: string): string[] => {
  const sentences = text.match(/[^.!?…]+[.!?…»]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    const next = cur ? `${cur} ${s}` : s;
    if (!cur || fitsWell(next)) cur = next;
    else {
      out.push(cur);
      cur = s;
    }
  }
  if (cur) out.push(cur);
  return out;
};

// Перенос на две строки по словам: ближе к середине, лучше — после конца
// предложения или запятой/двоеточия; не внутри цитаты и не после коротких слов.
export const wrap = (text: string): string => {
  if (text.length <= SUB_MAX) return text;
  let best = text;
  let bestScore = Infinity;
  for (const { a, b } of breaks(text)) {
    const last = a.split(" ").pop() ?? "";
    const score = Math.abs(a.length - b.length) - (SENTENCE_END.test(a) ? 20 : SOFT_END.test(a) ? 10 : 0) + (openQuote(a) ? 30 : 0) + (last.replace(/[^А-Яа-яЁё]/g, "").length <= 2 ? 10 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = `${a}\n${b}`;
    }
  }
  return best;
};

export const subtitleEvents = (tl: L80Timeline): SubEvent[] => {
  const out: SubEvent[] = [];
  for (const c of tl.cues) {
    const line = lineById(c.id);
    const parts = chunks(line.text);
    const words = line.text.split(/\s+/).filter(Boolean);
    let wi = 0;
    const starts = parts.map((p) => {
      const s = wi;
      wi += p.split(/\s+/).filter(Boolean).length;
      return s;
    });
    const next = tl.cues.find((x) => x.id === c.id + 1);
    const nextStart = next ? Math.min(next.from, tl.sound[next.id].start) : c.to + 2;
    const pause = L80_PAUSES.find((p) => p.after === c.id);
    const span = pause ? tl.pauses.find((p) => p.id === pause.id) : undefined;
    const soundStart = tl.sound[c.id].start;
    for (let k = 0; k < parts.length; k++) {
      const from = k === 0 ? Math.max(c.from, soundStart) : (c.words[starts[k]]?.start ?? c.from + ((c.to - c.from) * starts[k]) / words.length) - 0.05;
      let to = k === parts.length - 1 ? c.to + 0.3 : (c.words[starts[k + 1]]?.start ?? c.to) - 0.06;
      if (k === parts.length - 1 && span) to = span.to - 0.1; // вопрос остаётся на время паузы
      to = Math.min(to, nextStart - 0.12);
      out.push({ id: c.id, part: k, from, to: Math.max(to, from + 0.6), text: wrap(parts[k]) });
    }
  }
  return out;
};
