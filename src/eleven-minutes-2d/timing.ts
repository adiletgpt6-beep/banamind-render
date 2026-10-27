// Шкала реплик BalaGoElevenMinutes2D: речь реплики начинается в момент at (с),
// длительность — из файла озвучки. Для губ используются фактические
// тайминги букв (ElevenLabs with-timestamps) и огибающая громкости файла.
// Без озвучки — оценка по тексту (ролик собирается без голоса).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { EM2_DIALOG_END, EM2_LINES, EM2_MIN_GAP, EM2_SCENES, EM2_VIDEO, type Em2Line } from "./script.ts";

export type Em2Word = { readonly text: string; readonly start: number; readonly end: number };
// Буква реплики с временем звучания (от начала файла, с).
export type Em2Char = { readonly c: string; readonly start: number; readonly end: number };

export type Em2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Em2Word[];
  readonly chars?: readonly Em2Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Em2Manifest = {
  readonly version: 1;
  readonly kind: "em2d";
  readonly estimated?: boolean;
  readonly lines: readonly Em2ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Em2Line): Em2ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Em2Word[] = [];
  const chars: Em2Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const per = 1 / 14;
    const d = Math.max(0.2, letters.length * per);
    letters.forEach((c, i) => chars.push({ c, start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * EM2_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / EM2_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateEm2Manifest = (): Em2Manifest => ({
  version: 1,
  kind: "em2d",
  estimated: true,
  lines: EM2_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер по огибающей громкости всех реплик) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Реплика на шкале ролика (абсолютное время, с).
export type Em2Cue = {
  readonly id: string;
  readonly role: Em2Line["role"];
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Em2Word[];
  readonly chars: readonly Em2Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export const buildEm2Cues = (m: Em2Manifest): Em2Cue[] =>
  EM2_LINES.map((l) => {
    const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
    const shift = l.at - ml.speechStart;
    return {
      id: l.id,
      role: l.role,
      file: ml.file,
      audioFrom: shift,
      durationSec: ml.durationSec,
      from: l.at,
      to: l.at + (ml.speechEnd - ml.speechStart),
      words: (ml.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
      chars: (est.chars ?? []).map((c) => ({
        c: c.c,
        start: c.start + shift + (ml.chars ? CHAR_LAG : 0),
        end: c.end + shift + (ml.chars ? CHAR_LAG : 0),
      })),
      env: est.env ?? [],
    };
  });

// Проверка шкалы: реплики не накладываются (≥ 0,3 с между ними, у
// отмеченных в EM2_MIN_GAP — выразительная пауза), не
// выходят за свою сцену и заканчиваются до финального экрана; файл не
// начинается раньше 0 с. Возвращает список проблем (пустой — всё в порядке).
export const checkEm2Timing = (
  lines: readonly Pick<Em2ManifestLine, "id" | "speechStart" | "speechEnd" | "durationSec">[],
): string[] => {
  const problems: string[] = [];
  const cues = buildEm2Cues({ version: 1, kind: "em2d", lines });
  cues.forEach((c, i) => {
    const line = EM2_LINES[i];
    const next = cues[i + 1];
    const scene = EM2_SCENES.find((s) => s.id === line.scene)!;
    const gap = next ? Math.max(0.3, EM2_MIN_GAP[next.id] ?? 0) : 0;
    const limit = Math.min(scene.to - 0.2, next ? next.from - gap : EM2_DIALOG_END, EM2_DIALOG_END);
    if (c.to > limit) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с, а должна закончиться до ${limit.toFixed(2)} с`);
    if (c.from < scene.from) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  return problems;
};
