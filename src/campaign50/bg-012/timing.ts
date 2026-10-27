// Шкала BalaGoBG012 строится по фактической озвучке: сцена = пауза lead →
// реплики сцены (длительность речи из файла + паузы gapAfter) → пауза tail,
// но не короче min. Речь не ускоряется и не обрезается: монтаж
// подстраивается под голос. Для губ — тайминги букв (ElevenLabs
// with-timestamps) и огибающая громкости файла по кадрам.
// Без озвучки — оценка по тексту (черновой предпросмотр).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  B12_AFTER_LAST_WORD_MIN,
  B12_CTA_LEAD,
  B12_CTA_MIN,
  B12_LINES,
  B12_SCENES,
  B12_VIDEO,
  type B12Line,
  type B12SceneId,
} from "./script.ts";

export type B12Word = { readonly text: string; readonly start: number; readonly end: number };
export type B12Char = { readonly c: string; readonly start: number; readonly end: number };

export type B12ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly B12Word[];
  readonly chars?: readonly B12Char[];
  // громкость файла по кадрам (30 к/с) от начала файла, 0…1
  readonly env?: readonly number[];
};

export type B12Manifest = {
  readonly version: 1;
  readonly kind: "bg012";
  readonly estimated?: boolean;
  readonly lines: readonly B12ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 12 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: B12Line): B12ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: B12Word[] = [];
  const chars: B12Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 12);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * B12_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / B12_VIDEO.fps;
    const w = words.find((x) => s >= x.start && s <= x.end);
    return w ? Number((0.55 + 0.35 * Math.abs(Math.sin(s * 17))).toFixed(2)) : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateB12Manifest = (): B12Manifest => ({
  version: 1,
  kind: "bg012",
  estimated: true,
  lines: B12_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type B12Cue = {
  readonly id: string;
  readonly role: B12Line["role"];
  readonly scene: B12SceneId;
  readonly text: string;
  readonly subtitle: boolean;
  readonly file?: string;
  readonly audioFrom: number; // начало файла, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly B12Word[];
  readonly chars: readonly B12Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export type B12SceneSpan = { readonly id: B12SceneId; readonly title: string; readonly from: number; readonly to: number };

export type B12Timeline = {
  readonly scenes: readonly B12SceneSpan[];
  readonly cues: readonly B12Cue[];
  readonly ctaFrom: number; // финальный экран, с
  readonly lastWord: number; // конец последнего слова, с
  readonly durationSec: number;
  readonly frames: number;
};

const FPS = B12_VIDEO.fps;
const snap = (t: number) => Math.round(t * FPS) / FPS;

export const buildB12Timeline = (m: B12Manifest): B12Timeline => {
  const scenes: B12SceneSpan[] = [];
  const cues: B12Cue[] = [];
  let t = 0;
  for (const sc of B12_SCENES) {
    const start = snap(t);
    let cur = start + sc.lead;
    const lines = B12_LINES.filter((l) => l.scene === sc.id);
    lines.forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const real = Boolean(ml.chars && ml.env);
      const est = real ? ml : { ...estimateLine(l), ...ml };
      const from = snap(cur);
      const shift = from - ml.speechStart;
      const to = from + (ml.speechEnd - ml.speechStart);
      cues.push({
        id: l.id,
        role: l.role,
        scene: sc.id,
        text: l.text,
        subtitle: l.subtitle !== false,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from,
        to,
        words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        chars: (est.chars ?? []).map((c) => ({
          c: c.c,
          start: c.start + shift + (ml.file ? CHAR_LAG : 0),
          end: c.end + shift + (ml.file ? CHAR_LAG : 0),
        })),
        env: est.env ?? [],
      });
      cur = to + (i < lines.length - 1 ? (l.gapAfter ?? 0.5) : 0);
    });
    const end = snap(Math.max(start + sc.min, cur + sc.tail));
    scenes.push({ id: sc.id, title: sc.title, from: start, to: end });
    t = end;
  }
  const n04 = cues.find((c) => c.id === "n04")!;
  const lastWord = cues[cues.length - 1].to;
  const ctaFrom = snap(n04.from - B12_CTA_LEAD);
  // финальный экран ≥ 5 с и ≥ 3 с после последнего слова
  let durationSec = scenes[scenes.length - 1].to;
  durationSec = Math.max(durationSec, ctaFrom + B12_CTA_MIN, lastWord + B12_AFTER_LAST_WORD_MIN + 0.6);
  durationSec = Math.ceil(durationSec * FPS) / FPS;
  scenes[scenes.length - 1] = { ...scenes[scenes.length - 1], to: durationSec };
  return { scenes, cues, ctaFrom, lastWord, durationSec, frames: Math.round(durationSec * FPS) };
};

// Проверка шкалы: реплики не накладываются, файл не начинается раньше 0 с,
// финал по правилам. Возвращает список проблем (пустой — всё в порядке).
export const checkB12Timeline = (tl: B12Timeline): string[] => {
  const problems: string[] = [];
  tl.cues.forEach((c, i) => {
    const next = tl.cues[i + 1];
    if (next && c.to > next.from - 0.25) problems.push(`${c.id}: речь заходит на ${next.id}`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.to > sc.to - 0.3) problems.push(`${c.id}: речь выходит за сцену`);
  });
  if (tl.durationSec - tl.ctaFrom < B12_CTA_MIN) problems.push("контакты на экране < 5 с");
  if (tl.durationSec - tl.lastWord < B12_AFTER_LAST_WORD_MIN) problems.push("после последнего слова < 3 с");
  return problems;
};
