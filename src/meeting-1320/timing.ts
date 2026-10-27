// Шкала речи BalaGoMeeting1320. Сначала размещается речь
// (layoutTimeline в script.ts: паузы и длительности сцен по фактической
// длительности каждой реплики), затем к репликам привязываются действия.
// Для губ — фактические тайминги букв (ElevenLabs with-timestamps) и
// огибающая громкости файла. Без озвучки — оценка по тексту (только превью).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  BRAND_INTRO,
  M13_CONTACT_FRAMES,
  M13_FINAL_HOLD,
  M13_LINES,
  M13_SCENE_SPECS,
  M13_VIDEO,
  estimateSpeech,
  layoutTimeline,
  lineById,
  modeOf,
  type M13Layout,
  type M13Line,
  type M13Mode,
  type M13SceneId,
} from "./script.ts";

export type M13Word = { readonly text: string; readonly start: number; readonly end: number };
export type M13Char = { readonly c: string; readonly start: number; readonly end: number };

export type M13ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly M13Word[];
  readonly chars?: readonly M13Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type M13Manifest = {
  readonly version: 1;
  readonly kind: "m1320";
  readonly estimated?: boolean;
  readonly lines: readonly M13ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка тайминга букв по тексту (до генерации озвучки).
export const estimateLine = (l: M13Line): M13ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  const total = estimateSpeech(l.id);
  const letters = tokens.reduce((a, w) => a + [...w].filter(isLetter).length, 0) || 1;
  const pauses = tokens.filter((w) => /[.,!?…—]$/.test(w)).length;
  const per = (total - pauses * 0.25) / letters;
  let t = 0.15;
  const words: M13Word[] = [];
  const chars: M13Char[] = [];
  for (const w of tokens) {
    const ls = [...w].filter(isLetter);
    if (!ls.length) continue;
    const d = ls.length * per;
    ls.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + i * per, end: t + (i + 1) * per }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.25 : 0.02);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * M13_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / M13_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateM13Manifest = (): M13Manifest => ({
  version: 1,
  kind: "m1320",
  estimated: true,
  lines: M13_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type M13Cue = {
  readonly id: string;
  readonly line: string;
  readonly role: M13Line["role"];
  readonly mode: M13Mode;
  readonly scene: M13SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла на шкале, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly M13Word[];
  readonly chars: readonly M13Char[];
  readonly env: readonly number[];
};

export type M13Timeline = M13Layout & { readonly cues: readonly M13Cue[] };

const lineOf = (m: M13Manifest, id: string): M13ManifestLine => m.lines.find((x) => x.id === id) ?? estimateLine(lineById(id));

export const buildM13Timeline = (m: M13Manifest): M13Timeline => {
  const speech = (id: string) => {
    const ml = lineOf(m, id);
    return ml.speechEnd - ml.speechStart;
  };
  const layout = layoutTimeline(speech);
  const cues = layout.segments.map((sg): M13Cue => {
    const l = lineById(sg.id);
    const ml = lineOf(m, sg.id);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
    const lag = ml.chars && !m.estimated ? CHAR_LAG : 0;
    const shift = sg.at - ml.speechStart;
    return {
      id: sg.id,
      line: l.id,
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
  return { ...layout, cues };
};

// Проверка шкалы: реплики идут по порядку, не накладываются (≥ 0,3 с),
// не выходят за свою сцену, файл не начинается раньше 0 с; после последнего
// слова финал держится не меньше M13_FINAL_HOLD с; карточка с контактами
// неподвижна не меньше M13_CONTACT_FRAMES кадров до конца ролика и
// начинается в сцене brand после вступления (не короче BRAND_INTRO).
export const checkM13Timeline = (tl: M13Timeline): string[] => {
  const problems: string[] = [];
  const fps = M13_VIDEO.fps;
  const brand = tl.scenes.find((s) => s.id === "brand")!;
  tl.cues.forEach((c, i) => {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.from < sc.from / fps) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.to > sc.to / fps - 0.2) problems.push(`${c.id}: речь выходит за сцену`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (i > 0 && c.from < tl.cues[i - 1].to + 0.3) problems.push(`${c.id}: накладывается на ${tl.cues[i - 1].id}`);
    if (c.scene !== "brand" && c.audioFrom + c.durationSec > brand.from / fps + 0.05) problems.push(`${c.id}: звук заходит в финальную сцену`);
  });
  const last = tl.cues[tl.cues.length - 1];
  if (last && last.to > tl.frames / fps - M13_FINAL_HOLD) problems.push(`${last.id}: после последнего слова меньше ${M13_FINAL_HOLD} с финала`);
  if (last && last.audioFrom + last.durationSec > tl.frames / fps) problems.push(`${last.id}: файл длиннее ролика`);
  if (tl.frames - tl.contactFrom < M13_CONTACT_FRAMES) problems.push("карточка с контактами короче 150 кадров");
  if (tl.contactFrom - brand.from < BRAND_INTRO * fps - 1) problems.push("вступление бренда короче BRAND_INTRO");
  if (tl.scenes.length !== M13_SCENE_SPECS.length) problems.push("не все сцены на шкале");
  return problems;
};
