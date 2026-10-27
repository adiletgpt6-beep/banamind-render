// Шкала речи BalaGoUnansweredLetter2D: каждый сегмент (UL2_SEGMENTS) —
// воспроизведение речевого файла (UL2_LINES) с момента at (с); длительность
// — из файла озвучки. Для губ используются фактические
// тайминги букв (ElevenLabs with-timestamps) и огибающая громкости файла.
// Без озвучки — оценка по тексту (ролик собирается без голоса).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { UL2_DIALOG_END, UL2_LINES, UL2_MIN_GAP, UL2_SCENES, UL2_SEGMENTS, UL2_VIDEO, lineById, type Ul2Line, type Ul2Mode } from "./script.ts";

export type Ul2Word = { readonly text: string; readonly start: number; readonly end: number };
// Буква реплики с временем звучания (от начала файла, с).
export type Ul2Char = { readonly c: string; readonly start: number; readonly end: number };

export type Ul2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Ul2Word[];
  readonly chars?: readonly Ul2Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Ul2Manifest = {
  readonly version: 1;
  readonly kind: "ul2d";
  readonly estimated?: boolean;
  readonly lines: readonly Ul2ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Ul2Line): Ul2ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Ul2Word[] = [];
  const chars: Ul2Char[] = [];
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
  const env = Array.from({ length: Math.ceil(dur * UL2_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / UL2_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateUl2Manifest = (): Ul2Manifest => ({
  version: 1,
  kind: "ul2d",
  estimated: true,
  lines: UL2_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер по огибающей громкости всех реплик) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Сегмент речи на шкале ролика (абсолютное время, с).
export type Ul2Cue = {
  readonly id: string; // сегмент
  readonly line: string; // речевой файл
  readonly role: Ul2Line["role"];
  readonly mode: Ul2Mode;
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Ul2Word[];
  readonly chars: readonly Ul2Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export const buildUl2Cues = (m: Ul2Manifest): Ul2Cue[] =>
  UL2_SEGMENTS.map((sg) => {
    const l = lineById(sg.line);
    const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
    const shift = sg.at - ml.speechStart;
    return {
      id: sg.id,
      line: l.id,
      role: l.role,
      mode: sg.mode,
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
// (с паузой ≥ 0,3 с или выразительной из UL2_MIN_GAP), конец сцены,
// конец диалогов.
export const segmentLimit = (i: number) => {
  const sg = UL2_SEGMENTS[i];
  const next = UL2_SEGMENTS[i + 1];
  const scene = UL2_SCENES.find((s) => s.id === sg.scene)!;
  const gap = next ? Math.max(0.3, UL2_MIN_GAP[next.id] ?? 0) : 0;
  return Math.min(scene.to - 0.2, next ? next.at - gap : UL2_DIALOG_END, UL2_DIALOG_END);
};

// Проверка шкалы: реплики не накладываются (≥ 0,3 с между ними, у
// отмеченных в UL2_MIN_GAP — выразительная пауза), не
// выходят за свою сцену и заканчиваются до финального экрана; файл не
// начинается раньше 0 с. Возвращает список проблем (пустой — всё в порядке).
export const checkUl2Timing = (
  lines: readonly Pick<Ul2ManifestLine, "id" | "speechStart" | "speechEnd" | "durationSec">[],
): string[] => {
  const problems: string[] = [];
  const cues = buildUl2Cues({ version: 1, kind: "ul2d", lines });
  cues.forEach((c, i) => {
    const sg = UL2_SEGMENTS[i];
    const scene = UL2_SCENES.find((s) => s.id === sg.scene)!;
    const limit = segmentLimit(i);
    if (c.to > limit) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с, а должна закончиться до ${limit.toFixed(2)} с`);
    if (c.from < scene.from) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (i > 0 && c.from < cues[i - 1].from) problems.push(`${c.id}: нарушен порядок сегментов`);
  });
  return problems;
};
