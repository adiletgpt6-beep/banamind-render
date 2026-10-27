// Шкала речи BalaGo36SuitcaseByTheDoor2D. Сначала размещается речь
// (layoutTimeline в script.ts: паузы и длительности сцен по фактической
// длительности каждой реплики), затем к репликам привязываются действия.
// Для губ — фактические тайминги букв (ElevenLabs with-timestamps) и
// огибающая громкости файла. Без озвучки — оценка по тексту (только превью).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  SD2_CTA_HOLD_SEC,
  SD2_CTA_WORDS,
  SD2_END_PAD_SEC,
  SD2_LINES,
  SD2_SCENE_SPECS,
  SD2_VIDEO,
  estimateSpeech,
  layoutTimeline,
  lineById,
  modeOf,
  type Sd2Layout,
  type Sd2Line,
  type Sd2Mode,
  type Sd2SceneId,
} from "./script.ts";

export type Sd2Word = { readonly text: string; readonly start: number; readonly end: number };
export type Sd2Char = { readonly c: string; readonly start: number; readonly end: number };

export type Sd2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Sd2Word[];
  readonly chars?: readonly Sd2Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Sd2Manifest = {
  readonly version: 1;
  readonly kind: "sd2d";
  readonly estimated?: boolean;
  readonly lines: readonly Sd2ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);
export const normWord = (s: string) => s.toLowerCase().replace(/[^\p{L}-]/gu, "");

// Оценка тайминга букв по тексту (до генерации озвучки).
export const estimateLine = (l: Sd2Line): Sd2ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  const total = estimateSpeech(l.id);
  const letters = tokens.reduce((a, w) => a + [...w].filter(isLetter).length, 0) || 1;
  const pauses = tokens.filter((w) => /[.,!?…—:]$/.test(w)).length;
  const per = (total - pauses * 0.25) / letters;
  let t = 0.15;
  const words: Sd2Word[] = [];
  const chars: Sd2Char[] = [];
  for (const w of tokens) {
    const ls = [...w].filter(isLetter);
    if (!ls.length) continue;
    const d = ls.length * per;
    ls.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + i * per, end: t + (i + 1) * per }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—:]$/.test(w) ? 0.25 : 0.02);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * SD2_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / SD2_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateSd2Manifest = (): Sd2Manifest => ({
  version: 1,
  kind: "sd2d",
  estimated: true,
  lines: SD2_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type Sd2Cue = {
  readonly id: string;
  readonly role: Sd2Line["role"];
  readonly mode: Sd2Mode;
  readonly scene: Sd2SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла на шкале, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly Sd2Word[];
  readonly chars: readonly Sd2Char[];
  readonly env: readonly number[];
};

export type Sd2Timeline = Sd2Layout & {
  readonly cues: readonly Sd2Cue[];
  // кадр, с которого финальная композиция собрана целиком
  readonly ctaAssembledFrame: number;
};

const lineOf = (m: Sd2Manifest, id: string): Sd2ManifestLine => m.lines.find((x) => x.id === id) ?? estimateLine(lineById(id));

// Начало слова реплики (с от начала речи реплики); слово ищется по началу.
export const wordOffset = (ml: Sd2ManifestLine, w: string): number | null => {
  const k = (ml.words ?? []).findIndex((x) => normWord(x.text).startsWith(normWord(w)));
  return k < 0 ? null : ml.words![k].start - ml.speechStart;
};

export const buildSd2Timeline = (m: Sd2Manifest): Sd2Timeline => {
  const speech = (id: string) => {
    const ml = lineOf(m, id);
    return ml.speechEnd - ml.speechStart;
  };
  const n16 = lineOf(m, "N16");
  // собранный кадр: начало слова «Ватсап» (WhatsApp с номером — последний
  // элемент) + 0,5 с на появление
  const lastAt = wordOffset(n16, SD2_CTA_WORDS.whatsapp);
  const layout = layoutTimeline(speech, lastAt === null ? undefined : lastAt + 0.5);
  const cues = layout.segments.map((sg): Sd2Cue => {
    const l = lineById(sg.id);
    const ml = lineOf(m, sg.id);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
    const lag = ml.chars && !m.estimated ? CHAR_LAG : 0;
    const shift = sg.at - ml.speechStart;
    return {
      id: sg.id,
      role: l.role,
      mode: modeOf(l.id),
      scene: sg.scene,
      file: ml.file,
      audioFrom: shift,
      durationSec: ml.durationSec,
      from: sg.at,
      to: sg.end,
      words: (est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
      chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift + lag, end: c.end + shift + lag })),
      env: est.env ?? [],
    };
  });
  const n16Cue = cues.find((c) => c.id === "N16")!;
  const lastWord = n16Cue.words.find((x) => normWord(x.text).startsWith(normWord(SD2_CTA_WORDS.whatsapp)));
  const ctaAssembledFrame = Math.ceil(((lastWord?.start ?? n16Cue.from + (n16Cue.to - n16Cue.from) * 0.7) + 0.5) * SD2_VIDEO.fps); // 0,7 — как в layoutTimeline
  return { ...layout, cues, ctaAssembledFrame };
};

// Проверка шкалы: реплики идут по порядку, не накладываются (≥ 0,25 с),
// не выходят за свою сцену (запас ≥ 0,2 с до смены), файл не начинается
// раньше 0 с; финальная композиция собрана ≥ SD2_CTA_HOLD_SEC − 0,1 с и
// речь заканчивается ≥ SD2_END_PAD_SEC до конца ролика.
export const checkSd2Timeline = (tl: Sd2Timeline): string[] => {
  const problems: string[] = [];
  const fps = SD2_VIDEO.fps;
  tl.cues.forEach((c, i) => {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.from < sc.from / fps) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.to > sc.to / fps - 0.2) problems.push(`${c.id}: речь выходит за сцену`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (i > 0 && c.from < tl.cues[i - 1].to + 0.25) problems.push(`${c.id}: накладывается на ${tl.cues[i - 1].id}`);
    if (c.audioFrom + c.durationSec > tl.frames / fps - SD2_END_PAD_SEC + 0.15 && c.id !== "N16") problems.push(`${c.id}: звук у конца ролика`);
  });
  const last = tl.cues[tl.cues.length - 1];
  if (last.to > tl.frames / fps - SD2_END_PAD_SEC) problems.push(`последняя реплика заканчивается ближе ${SD2_END_PAD_SEC} с к концу`);
  const hold = (tl.frames - tl.ctaAssembledFrame) / fps;
  if (hold < SD2_CTA_HOLD_SEC - 0.1) problems.push(`собранный финальный кадр держится ${hold.toFixed(2)} с (< ${SD2_CTA_HOLD_SEC})`);
  if (tl.scenes.length !== SD2_SCENE_SPECS.length) problems.push("не все сцены на шкале");
  return problems;
};
