// Шкала речи BalaGo34ExtraLine. Сначала размещается речь
// (layoutTimeline в script.ts: паузы и длительности сцен по фактической
// длительности каждой реплики), затем к репликам привязываются действия.
// Для губ — фактические тайминги букв (ElevenLabs with-timestamps) и
// огибающая громкости файла. Без озвучки — оценка по тексту (только превью).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  EL_LINES,
  EL_SCENE_SPECS,
  EL_VIDEO,
  estimateSpeech,
  layoutTimeline,
  lineById,
  modeOf,
  type ElLayout,
  type ElLine,
  type ElMode,
  type ElSceneId,
} from "./script.ts";

export type ElWord = { readonly text: string; readonly start: number; readonly end: number };
export type ElChar = { readonly c: string; readonly start: number; readonly end: number };

export type ElManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly ElWord[];
  readonly chars?: readonly ElChar[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type ElManifest = {
  readonly version: 1;
  readonly kind: "el34";
  readonly estimated?: boolean;
  readonly lines: readonly ElManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка тайминга букв по тексту (до генерации озвучки).
export const estimateLine = (l: ElLine): ElManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  const total = estimateSpeech(l.id);
  const letters = tokens.reduce((a, w) => a + [...w].filter(isLetter).length, 0) || 1;
  const pauses = tokens.filter((w) => /[.,!?…—]$/.test(w)).length;
  const per = (total - pauses * 0.25) / letters;
  let t = 0.15;
  const words: ElWord[] = [];
  const chars: ElChar[] = [];
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
  const env = Array.from({ length: Math.ceil(dur * EL_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / EL_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateElManifest = (): ElManifest => ({
  version: 1,
  kind: "el34",
  estimated: true,
  lines: EL_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type ElCue = {
  readonly id: string;
  readonly line: string;
  readonly role: ElLine["role"];
  readonly mode: ElMode;
  readonly scene: ElSceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла на шкале, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly ElWord[];
  readonly chars: readonly ElChar[];
  readonly env: readonly number[];
};

export type ElTimeline = ElLayout & { readonly cues: readonly ElCue[] };

const lineOf = (m: ElManifest, id: string): ElManifestLine => m.lines.find((x) => x.id === id) ?? estimateLine(lineById(id));

export const buildElTimeline = (m: ElManifest): ElTimeline => {
  const speech = (id: string) => {
    const ml = lineOf(m, id);
    return ml.speechEnd - ml.speechStart;
  };
  const layout = layoutTimeline(speech);
  const cues = layout.segments.map((sg): ElCue => {
    const l = lineById(sg.id);
    const ml = lineOf(m, sg.id);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
    const lag = ml.chars && ml.file ? CHAR_LAG : 0;
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
// не выходят за свою сцену (с запасом 0,2 с), файл не начинается раньше
// 0 с; последняя реплика заканчивается не позже чем за 2,5 с до конца —
// финальный экран остаётся читаемым после голоса.
export const checkElTimeline = (tl: ElTimeline): string[] => {
  const problems: string[] = [];
  const fps = EL_VIDEO.fps;
  tl.cues.forEach((c, i) => {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.from < sc.from / fps) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.to > sc.to / fps - 0.2) problems.push(`${c.id}: речь выходит за сцену`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (i > 0 && c.from < tl.cues[i - 1].to + 0.3) problems.push(`${c.id}: накладывается на ${tl.cues[i - 1].id}`);
    if (c.audioFrom + c.durationSec > tl.frames / fps - 0.3) problems.push(`${c.id}: файл не заканчивается до конца ролика`);
  });
  const last = tl.cues[tl.cues.length - 1];
  if (last && last.to > tl.frames / fps - 2.5) problems.push(`${last.id}: после последней реплики меньше 2,5 с`);
  if (tl.scenes.length !== EL_SCENE_SPECS.length) problems.push("не все сцены на шкале");
  return problems;
};
