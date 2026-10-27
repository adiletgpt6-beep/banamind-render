// Шкала фильма LESSON-80 (voice-first): реплики идут подряд, начало каждой
// вычисляется из фактической длительности предыдущей озвучки и паузы перед
// ней. Сцены получают наблюдательное время до первой и после последней
// реплики. Без зависимостей от Remotion (читается Node-скриптами).
import { FPS } from "./video.ts";
import { FILM, LEARNING_PAUSES, LINES, SCENES, type L80Line, type L80Role, type L80SceneId } from "../film-1-6/script.ts";

export type Word = { readonly text: string; readonly start: number; readonly end: number };
export type Char = { readonly c: string; readonly start: number; readonly end: number };

export type ManifestLine = {
  readonly id: number;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Word[];
  readonly chars?: readonly Char[];
  // громкость файла по кадрам (30 к/с) от начала файла, 0…1
  readonly env?: readonly number[];
};

export type Manifest = {
  readonly version: 1;
  readonly kind: "lesson80";
  readonly film: string;
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly provider?: string;
  readonly lines: readonly ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка без озвучки: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: L80Line): ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.12;
  const words: Word[] = [];
  const chars: Char[] = [];
  for (const w of tokens) {
    const letters = [...w.toLowerCase()].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.18, letters.length / 13);
    letters.forEach((c, i) => chars.push({ c, start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.!?…]$/.test(w) ? 0.35 : /[,—:;]$/.test(w) ? 0.2 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.12, speechEnd: end, words, chars, env };
};

export const estimateManifest = (): Manifest => ({
  version: 1,
  kind: "lesson80",
  film: FILM.id,
  estimated: true,
  lines: LINES.map(estimateLine),
});

// Реплика на шкале фильма (абсолютные секунды).
export type Cue = {
  readonly id: number;
  readonly role: L80Role;
  readonly scene: L80SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Word[];
  readonly chars: readonly Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export type SceneSpan = { readonly id: L80SceneId; readonly from: number; readonly to: number };

export type Timeline = {
  readonly cues: readonly Cue[];
  readonly scenes: readonly SceneSpan[];
  readonly durationSec: number;
  readonly durationInFrames: number;
};

const q = (t: number) => Math.round(t * FPS) / FPS; // к границе кадра

// Шкала строится в два прохода: сначала с паузами как в сценарии, затем
// наблюдательные паузы (gapBefore без learning, lead и tail сцен)
// масштабируются общим коэффициентом так, чтобы фильм вышел на ориентир
// FILM.targetSec при любом темпе озвучки. Учебные паузы и речь не меняются.
const build = (m: Manifest, k: number): Timeline => {
  const cues: Cue[] = [];
  const scenes: SceneSpan[] = [];
  let t = 0;
  for (const sc of SCENES) {
    const from = t;
    t = q(t + sc.lead * k);
    let lastEnd = t;
    for (const l of LINES.filter((x) => x.scene === sc.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const gap = l.learning ? l.gapBefore : l.gapBefore * k;
      const start = q(lastEnd + gap);
      const speech = ml.speechEnd - ml.speechStart;
      const shift = start - ml.speechStart;
      cues.push({
        id: l.id,
        role: l.role,
        scene: l.scene,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from: start,
        to: start + speech,
        words: (ml.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift, end: c.end + shift })),
        env: est.env ?? [],
      });
      lastEnd = start + speech;
    }
    t = q(lastEnd + sc.tail * k);
    scenes.push({ id: sc.id, from, to: t });
  }
  const durationInFrames = Math.round(t * FPS);
  return { cues, scenes, durationSec: durationInFrames / FPS, durationInFrames };
};

// Коэффициент наблюдательных пауз: 1 — как в сценарии; подбирается так,
// чтобы длительность была ≈ FILM.targetSec (в пределах 0,75…1,5).
export const pauseFactor = (m: Manifest): number => {
  const base = build(m, 1);
  const flex = SCENES.reduce((a, s) => a + s.lead + s.tail, 0) + LINES.filter((l) => !l.learning).reduce((a, l) => a + l.gapBefore, 0);
  const fixed = base.durationSec - flex;
  const k = (FILM.targetSec - fixed) / flex;
  return Math.round(Math.max(0.75, Math.min(1.5, k)) * 1000) / 1000;
};

export const buildTimeline = (m: Manifest): Timeline => build(m, pauseFactor(m));

// Проверки шкалы: учебные паузы ровно по сценарию, реплики по порядку и
// без наложений, длительность в допуске, файлы не начинаются раньше нуля.
export const checkTimeline = (tl: Timeline): string[] => {
  const problems: string[] = [];
  const by = new Map(tl.cues.map((c) => [c.id, c]));
  for (const [afterStr, pause] of Object.entries(LEARNING_PAUSES)) {
    const after = Number(afterStr);
    const a = by.get(after);
    const b = by.get(after + 1);
    if (!a || !b) {
      problems.push(`нет реплик ${after}/${after + 1} для учебной паузы`);
      continue;
    }
    const gap = b.from - a.to;
    if (Math.abs(gap - pause) > 1 / FPS + 1e-6) problems.push(`учебная пауза после №${after}: ${gap.toFixed(3)} с вместо ${pause} с`);
  }
  tl.cues.forEach((c, i) => {
    const n = tl.cues[i + 1];
    if (n && n.from < c.to + 0.25) problems.push(`реплики ${c.id} и ${n.id} слишком близко (${(n.from - c.to).toFixed(2)} с)`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.from < sc.from || c.to > sc.to) problems.push(`${c.id}: выходит за сцену ${c.scene}`);
    if (c.audioFrom + c.durationSec > tl.durationSec) problems.push(`${c.id}: аудио выходит за конец фильма`);
  });
  if (tl.durationSec < FILM.minSec || tl.durationSec > FILM.maxSec) problems.push(`длительность ${tl.durationSec.toFixed(1)} с вне допуска ${FILM.minSec}–${FILM.maxSec} с`);
  const last = tl.cues[tl.cues.length - 1];
  if (last && tl.durationSec - last.to < 3) problems.push("после последней реплики меньше 3 с");
  return problems;
};
