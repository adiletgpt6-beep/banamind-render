// Шкала речи BalaGoNineYearOldEmployee2D. Сначала размещается речь
// (layoutTimeline в script.ts: паузы и длительности сцен по фактической
// длительности каждой реплики), затем к репликам привязываются действия.
// Для губ — фактические тайминги букв (ElevenLabs with-timestamps) и
// огибающая громкости файла. Без озвучки — оценка по тексту (только превью).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  NY2_CONTACT_FRAMES,
  NY2_LINES,
  NY2_SCENE_SPECS,
  NY2_VIDEO,
  estimateSpeech,
  layoutTimeline,
  lineById,
  modeOf,
  type Ny2Layout,
  type Ny2Line,
  type Ny2Mode,
  type Ny2SceneId,
} from "./script.ts";

export type Ny2Word = { readonly text: string; readonly start: number; readonly end: number };
export type Ny2Char = { readonly c: string; readonly start: number; readonly end: number };

export type Ny2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Ny2Word[];
  readonly chars?: readonly Ny2Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Ny2Manifest = {
  readonly version: 1;
  readonly kind: "ny2d";
  readonly estimated?: boolean;
  readonly lines: readonly Ny2ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка тайминга букв по тексту (до генерации озвучки).
export const estimateLine = (l: Ny2Line): Ny2ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  const total = estimateSpeech(l.id);
  const letters = tokens.reduce((a, w) => a + [...w].filter(isLetter).length, 0) || 1;
  const pauses = tokens.filter((w) => /[.,!?…—]$/.test(w)).length;
  const per = (total - pauses * 0.25) / letters;
  let t = 0.15;
  const words: Ny2Word[] = [];
  const chars: Ny2Char[] = [];
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
  const env = Array.from({ length: Math.ceil(dur * NY2_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / NY2_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateNy2Manifest = (): Ny2Manifest => ({
  version: 1,
  kind: "ny2d",
  estimated: true,
  lines: NY2_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type Ny2Cue = {
  readonly id: string;
  readonly line: string;
  readonly role: Ny2Line["role"];
  readonly mode: Ny2Mode;
  readonly scene: Ny2SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла на шкале, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly Ny2Word[];
  readonly chars: readonly Ny2Char[];
  readonly env: readonly number[];
};

export type Ny2Timeline = Ny2Layout & { readonly cues: readonly Ny2Cue[] };

const lineOf = (m: Ny2Manifest, id: string): Ny2ManifestLine => m.lines.find((x) => x.id === id) ?? estimateLine(lineById(id));

export const buildNy2Timeline = (m: Ny2Manifest): Ny2Timeline => {
  const speech = (id: string) => {
    const ml = lineOf(m, id);
    return ml.speechEnd - ml.speechStart;
  };
  const layout = layoutTimeline(speech);
  const cues = layout.segments.map((sg): Ny2Cue => {
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
// не выходят за свою сцену, файл не начинается раньше 0 с, речь не заходит
// в контактную карточку (последние NY2_CONTACT_FRAMES кадров).
export const checkNy2Timeline = (tl: Ny2Timeline): string[] => {
  const problems: string[] = [];
  const fps = NY2_VIDEO.fps;
  tl.cues.forEach((c, i) => {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.from < sc.from / fps) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.to > sc.to / fps - 0.2) problems.push(`${c.id}: речь выходит за сцену`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (i > 0 && c.from < tl.cues[i - 1].to + 0.3) problems.push(`${c.id}: накладывается на ${tl.cues[i - 1].id}`);
    if (c.audioFrom + c.durationSec > tl.contactFrom / fps) problems.push(`${c.id}: звук заходит в контактную карточку`);
  });
  if (tl.frames - tl.contactFrom !== NY2_CONTACT_FRAMES) problems.push("контактная карточка не равна 150 кадрам");
  if (tl.scenes.length !== NY2_SCENE_SPECS.length) problems.push("не все сцены на шкале");
  return problems;
};
