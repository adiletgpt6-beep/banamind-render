// Шкала речи BalaGoFiveUnsentMessages2D: каждый сегмент (FU2_SEGMENTS) —
// воспроизведение речевого файла (FU2_LINES) с момента at (с); длительность
// — из файла озвучки. Файл записи понедельника звучит дважды (суббота и
// совместное прослушивание) — это один и тот же файл. Для губ используются фактические
// тайминги букв (ElevenLabs with-timestamps) и огибающая громкости файла.
// Без озвучки — оценка по тексту (ролик собирается без голоса).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { FU2_DIALOG_END, FU2_LINES, FU2_MIN_GAP, FU2_SCENES, FU2_SEGMENTS, FU2_VIDEO, lineById, type Fu2Line, type Fu2Mode, type Fu2RecordId } from "./script.ts";

export type Fu2Word = { readonly text: string; readonly start: number; readonly end: number };
// Буква реплики с временем звучания (от начала файла, с).
export type Fu2Char = { readonly c: string; readonly start: number; readonly end: number };

export type Fu2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Fu2Word[];
  readonly chars?: readonly Fu2Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Fu2Manifest = {
  readonly version: 1;
  readonly kind: "fu2d";
  readonly estimated?: boolean;
  readonly lines: readonly Fu2ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Fu2Line): Fu2ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Fu2Word[] = [];
  const chars: Fu2Char[] = [];
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
  const env = Array.from({ length: Math.ceil(dur * FU2_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / FU2_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateFu2Manifest = (): Fu2Manifest => ({
  version: 1,
  kind: "fu2d",
  estimated: true,
  lines: FU2_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер по огибающей громкости всех реплик) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Сегмент речи на шкале ролика (абсолютное время, с).
export type Fu2Cue = {
  readonly id: string; // сегмент
  readonly line: string; // речевой файл
  readonly role: Fu2Line["role"];
  readonly mode: Fu2Mode;
  readonly record?: Fu2RecordId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Fu2Word[];
  readonly chars: readonly Fu2Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export const buildFu2Cues = (m: Fu2Manifest): Fu2Cue[] =>
  FU2_SEGMENTS.map((sg) => {
    const l = lineById(sg.line);
    const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
    const shift = sg.at - ml.speechStart;
    return {
      id: sg.id,
      line: l.id,
      role: l.role,
      mode: sg.mode,
      record: sg.record,
      file: ml.file,
      audioFrom: shift,
      durationSec: ml.durationSec,
      from: sg.at,
      to: sg.at + (ml.speechEnd - ml.speechStart),
      words: (ml.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
      chars: (est.chars ?? []).map((c) => ({
        c: c.c,
        start: c.start + shift + (ml.chars ? CHAR_LAG : 0),
        end: c.end + shift + (ml.chars ? CHAR_LAG : 0),
      })),
      env: est.env ?? [],
    };
  });

// Окно сегмента: речь должна закончиться до limit (с) — следующий сегмент
// (с паузой ≥ 0,3 с или выразительной из FU2_MIN_GAP), конец сцены,
// конец диалогов.
export const segmentLimit = (i: number) => {
  const sg = FU2_SEGMENTS[i];
  const next = FU2_SEGMENTS[i + 1];
  const scene = FU2_SCENES.find((s) => s.id === sg.scene)!;
  const gap = next ? Math.max(0.3, FU2_MIN_GAP[next.id] ?? 0) : 0;
  return Math.min(scene.to - 0.2, next ? next.at - gap : FU2_DIALOG_END, FU2_DIALOG_END);
};

// Проверка шкалы: реплики не накладываются (≥ 0,3 с между ними, у
// отмеченных в FU2_MIN_GAP — выразительная пауза), не
// выходят за свою сцену и заканчиваются до финального экрана; файл не
// начинается раньше 0 с. Возвращает список проблем (пустой — всё в порядке).
export const checkFu2Timing = (
  lines: readonly Pick<Fu2ManifestLine, "id" | "speechStart" | "speechEnd" | "durationSec">[],
): string[] => {
  const problems: string[] = [];
  const cues = buildFu2Cues({ version: 1, kind: "fu2d", lines });
  cues.forEach((c, i) => {
    const sg = FU2_SEGMENTS[i];
    const scene = FU2_SCENES.find((s) => s.id === sg.scene)!;
    const limit = segmentLimit(i);
    if (c.to > limit) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с, а должна закончиться до ${limit.toFixed(2)} с`);
    if (c.from < scene.from) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (i > 0 && c.from < cues[i - 1].from) problems.push(`${c.id}: нарушен порядок сегментов`);
  });
  return problems;
};
