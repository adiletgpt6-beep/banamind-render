// Субтитры ролика №32 — данные без React: деление реплик на смысловые
// части, окна показа по фактическим таймингам слов, выделения. Этим же
// модулем пользуются рендер (Subtitles.tsx), файл SRT и тесты.
import { DD_LINES } from "./script.ts";
import type { DdCue } from "./timing.ts";

const MAX_CHUNK = 52; // символов в части (две строки по ≈ 28)
// Послелоги и служебные слова не отрываются от предыдущего слова.
const STICKY = new Set(["бери", "менен", "үчүн", "жөнүндө", "тууралуу", "кийин", "чейин", "сайын", "деп", "да", "болуп", "келеби", "берет"]);

// Выделение: начало слова (без кавычек) → цвет. В части — не больше одного.
export const SUB_HIGHLIGHT: Readonly<Record<string, readonly (readonly [string, "yellow" | "teal"])[]>> = {
  vo01: [["айдоочу", "yellow"], ["инженер", "teal"]],
  vo02: [["кесиби", "yellow"], ["чакырды", "yellow"]],
  vo03: [["эмне", "yellow"]],
  vo04a: [["мектепке", "yellow"]],
  vo04b: [["жумушка", "yellow"]],
  vo04c: [["алып", "yellow"]],
  vo04d: [["оңдоодо", "yellow"]],
  vo05: [["рулда", "yellow"]],
  vo06: [["жакшы", "yellow"], ["сени", "yellow"]],
  vo07: [["макет", "teal"]],
  vo08: [["жумушта", "teal"]],
  vo09: [["макетти", "teal"], ["чиймелерин", "teal"], ["жабдууга", "teal"]],
  vo10: [["кеңсесине", "teal"], ["кесиптеши", "teal"]],
  vo11: [["ушул", "yellow"]],
  vo12: [["кайра", "yellow"]],
  vo13: [["графигин", "yellow"], ["талкуулары", "teal"], ["жолугушуулар", "yellow"], ["чоң", "yellow"]],
  vo14: [["жардам", "yellow"], ["алдын", "yellow"]],
  vo15: [["инженер", "teal"]],
  vo16: [["дагы", "yellow"]],
  vo17a: [["жакшы", "yellow"]],
  vo17b: [["түшүнүктүү", "teal"]],
  vo18: [["жылмайды", "yellow"]],
  vo19: [["BalaGo", "yellow"], ["Бишкекте", "yellow"], ["үйдөн", "yellow"], ["жолго", "yellow"], ["шилтеме", "yellow"], ["вотсаптан", "yellow"]],
};

const hasLetter = (s: string) => /\p{L}/u.test(s);

// Часть реплики: текст и диапазон слов (по словам с буквами).
export type SubChunk = { readonly text: string; readonly w0: number; readonly w1: number };

export const chunkLine = (text: string): SubChunk[] => {
  const sentences = text.match(/[^.!?…]+[.!?…»]*["»]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const parts: string[] = [];
  for (const s of sentences) {
    if (s.length <= MAX_CHUNK) {
      parts.push(s);
      continue;
    }
    // делим по запятой/тире ближе к середине, иначе — по середине по словам
    const toks = s.split(" ");
    let best = -1;
    let bestScore = Infinity;
    let acc = 0;
    for (let i = 0; i < toks.length - 1; i++) {
      acc += toks[i].length + 1;
      const punct = /[,:;—]$/.test(toks[i]) || toks[i + 1] === "—";
      const sticky = STICKY.has(toks[i + 1].toLowerCase().replace(/[.,!?»]/g, ""));
      const score = Math.abs(acc - s.length / 2) - (punct ? 14 : 0) + (sticky ? 30 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    parts.push(toks.slice(0, best + 1).join(" "), toks.slice(best + 1).join(" "));
  }
  // склеиваем слишком короткие части с соседней (если помещается)
  const merged: string[] = [];
  for (const p of parts) {
    const last = merged[merged.length - 1];
    if (last && (p.length < 12 || last.length < 12) && last.length + p.length + 1 <= MAX_CHUNK) merged[merged.length - 1] = `${last} ${p}`;
    else merged.push(p);
  }
  let w = 0;
  return merged.map((p) => {
    const n = p.split(/\s+/).filter(hasLetter).length;
    const c = { text: p, w0: w, w1: w + n - 1 };
    w += n;
    return c;
  });
};

// Окна показа частей (секунды) — для рендера и для файла SRT.
export type SubWindow = { readonly id: string; readonly text: string; readonly from: number; readonly to: number; readonly chunk: number };

export const subtitleWindows = (cues: readonly DdCue[]): SubWindow[] => {
  const out: SubWindow[] = [];
  cues.forEach((cue, ci) => {
    const line = DD_LINES.find((l) => l.id === cue.id)!;
    const parts = chunkLine(line.text);
    const nextCue = cues[ci + 1];
    const startOf = (w: number) => cue.words[w]?.start ?? cue.from + ((cue.to - cue.from) * w) / Math.max(1, cue.words.length);
    const endOf = (w: number) => cue.words[w]?.end ?? cue.from + ((cue.to - cue.from) * (w + 1)) / Math.max(1, cue.words.length);
    parts.forEach((p, i) => {
      const from = Math.max(cue.from - 0.1, startOf(p.w0) - 0.1);
      const nextStart = i + 1 < parts.length ? startOf(parts[i + 1].w0) - 0.1 : nextCue ? nextCue.from - 0.15 : Infinity;
      const to = Math.min(nextStart, Math.max(endOf(p.w1), i + 1 === parts.length ? cue.to : 0) + 0.45);
      out.push({ id: cue.id, text: p.text, from, to, chunk: i });
    });
  });
  return out;
};

