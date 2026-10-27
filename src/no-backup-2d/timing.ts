// Шкала реплик BalaGoNoBackup2D: речь реплики начинается в момент at (с),
// длительность — из файла озвучки. Для губ используются фактические
// тайминги букв (ElevenLabs with-timestamps) и огибающая громкости файла.
// Оценка по тексту используется только для явно отмеченного черновика.
// Без зависимостей от Remotion (читается и Node-скриптами).
import { NB2_CALLS, NB2_DIALOG_END, NB2_LINES, NB2_SCENES, NB2_VIDEO, type Nb2Line } from "./script.ts";

export type Nb2Word = { readonly text: string; readonly start: number; readonly end: number };
// Буква реплики с временем звучания (от начала файла, с).
export type Nb2Char = { readonly c: string; readonly start: number; readonly end: number };

export type Nb2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly text?: string;
  readonly spoken?: string;
  readonly hash?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Nb2Word[];
  readonly chars?: readonly Nb2Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Nb2Manifest = {
  readonly version: 1;
  readonly kind: "nb2d";
  readonly estimated?: boolean;
  readonly lines: readonly Nb2ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Только беззвучный черновик: ≈ 14 букв/с, короткие вопросы по телефону
// ≈ 16 букв/с. Готовая речь и рот всегда используют длительность файла;
// ни скорость, ни высота существующих MP3 не изменяются.
export const estimateLine = (l: Nb2Line): Nb2ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Nb2Word[] = [];
  const chars: Nb2Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const per = 1 / (NB2_CALLS.some(c => c.lines[0] === l.id) ? 16 : 14);
    const d = Math.max(0.2, letters.length * per);
    letters.forEach((c, i) => chars.push({ c, start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * NB2_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / NB2_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateNb2Manifest = (): Nb2Manifest => ({
  version: 1,
  kind: "nb2d",
  estimated: true,
  lines: NB2_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер по огибающей громкости всех реплик) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Реплика на шкале ролика (абсолютное время, с).
export type Nb2Cue = {
  readonly id: string;
  readonly role: Nb2Line["role"];
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Nb2Word[];
  readonly chars: readonly Nb2Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export const buildNb2Cues = (m: Nb2Manifest): Nb2Cue[] =>
  NB2_LINES.map((l) => {
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

// Проверка шкалы: реплики не накладываются (≥ 0,3 с между ними), не
// выходят за свою сцену и заканчиваются до финального экрана; файл не
// начинается раньше 0 с. Возвращает список проблем (пустой — всё в порядке).
export const checkNb2Timing = (
  lines: readonly Pick<Nb2ManifestLine, "id" | "speechStart" | "speechEnd" | "durationSec">[],
): string[] => {
  const problems: string[] = [];
  const cues = buildNb2Cues({ version: 1, kind: "nb2d", lines });
  cues.forEach((c, i) => {
    const line = NB2_LINES[i];
    const next = cues[i + 1];
    const scene = NB2_SCENES.find((s) => s.id === line.scene)!;
    const call = NB2_CALLS.find(c => (c.lines as readonly string[]).includes(line.id));
    const limit = Math.min(scene.to - 0.2, call ? call.to - 0.2 : NB2_DIALOG_END, next ? next.from - 0.3 : NB2_DIALOG_END, NB2_DIALOG_END);
    if (c.to > limit) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с, а должна закончиться до ${limit.toFixed(2)} с`);
    if (c.from < scene.from) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  return problems;
};
