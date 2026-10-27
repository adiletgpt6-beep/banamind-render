// Шкала реплик фильма №33: речь реплики начинается в момент lineAt (с),
// длительность — из файла озвучки. Губы двигаются по фактическим таймингам
// букв (ElevenLabs with-timestamps) и огибающей громкости файла.
// Без озвучки — оценка по тексту (только для предпросмотра в Studio).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  lineAt,
  MOV_LINES,
  MOV_MIN_GAP,
  MOV_OVERLAP_OK,
  MOV_SCENES,
  MOV_SPEECH_END,
  MOV_VIDEO,
  type MovLine,
} from "./script.ts";

export type MovWord = { readonly text: string; readonly start: number; readonly end: number };
// Буква реплики с временем звучания (от начала файла, с).
export type MovChar = { readonly c: string; readonly start: number; readonly end: number };

export type MovManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly MovWord[];
  readonly chars?: readonly MovChar[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type MovManifest = {
  readonly version: 1;
  readonly kind: "mov33";
  readonly estimated?: boolean;
  readonly lines: readonly MovManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 12,5 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: MovLine): MovManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: MovWord[] = [];
  const chars: MovChar[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 12.5);
    letters.forEach((c, i) => chars.push({ c, start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.!?…]$/.test(w) ? 0.4 : /[,—]$/.test(w) ? 0.2 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * MOV_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / MOV_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateMovManifest = (): MovManifest => ({
  version: 1,
  kind: "mov33",
  estimated: true,
  lines: MOV_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер проекта по огибающей громкости) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Реплика на шкале фильма (абсолютное время, с).
export type MovCue = {
  readonly id: string;
  readonly role: MovLine["role"];
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly MovWord[];
  readonly chars: readonly MovChar[];
  readonly env: readonly number[]; // по кадрам от audioFrom
  readonly volume: number;
};

export const buildMovCues = (m: MovManifest): MovCue[] =>
  MOV_LINES.map((l) => {
    const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
    const at = lineAt(l);
    const shift = at - ml.speechStart;
    return {
      id: l.id,
      role: l.role,
      file: ml.file,
      audioFrom: shift,
      durationSec: ml.durationSec,
      from: at,
      to: at + (ml.speechEnd - ml.speechStart),
      words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
      chars: (est.chars ?? []).map((c) => ({
        c: c.c,
        start: c.start + shift + (ml.chars ? CHAR_LAG : 0),
        end: c.end + shift + (ml.chars ? CHAR_LAG : 0),
      })),
      env: est.env ?? [],
      volume: l.volume ?? 1,
    };
  });

// Проверка шкалы: реплики не накладываются (≥ 0,3 с между ними, у
// отмеченных в MOV_MIN_GAP — больше), не выходят за свою сцену, файл не
// начинается раньше 0 с, последнее слово — не позже MOV_SPEECH_END.
// Возвращает список проблем (пустой — всё в порядке).
export const checkMovTiming = (
  lines: readonly Pick<MovManifestLine, "id" | "speechStart" | "speechEnd" | "durationSec">[],
): string[] => {
  const problems: string[] = [];
  const cues = buildMovCues({ version: 1, kind: "mov33", lines });
  cues.forEach((c, i) => {
    const line = MOV_LINES[i];
    const scene = MOV_SCENES.find((s) => s.id === line.scene)!;
    // ближайшая следующая реплика, с которой нельзя накладываться
    const next = cues.slice(i + 1).find((n) => !(MOV_OVERLAP_OK.has(n.id) && MOV_OVERLAP_OK.has(c.id)));
    const gap = next ? Math.max(0.3, MOV_MIN_GAP[next.id] ?? 0) : 0;
    const limit = Math.min(scene.to - 0.25, next ? next.from - gap : MOV_SPEECH_END, MOV_SPEECH_END);
    if (c.to > limit + 1e-6) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с, а должна закончиться до ${limit.toFixed(2)} с`);
    if (c.from < scene.from) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  return problems;
};
