// Шкала реплик BG-002: речь реплики начинается в момент at (с),
// длительность — из файла озвучки. Для губ используются фактические
// тайминги букв (ElevenLabs with-timestamps) и огибающая громкости файла.
// Без озвучки — оценка по тексту (ролик собирается без голоса).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { BG2_DIALOG_END, BG2_LINES, BG2_MIN_GAP, BG2_SCENES, BG2_VIDEO, type Bg2Line } from "./script.ts";

export type Bg2Word = { readonly text: string; readonly start: number; readonly end: number };
// Буква реплики с временем звучания (от начала файла, с).
export type Bg2Char = { readonly c: string; readonly start: number; readonly end: number };

export type Bg2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg2Word[];
  readonly chars?: readonly Bg2Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Bg2Manifest = {
  readonly version: 1;
  readonly kind: "bg2";
  readonly estimated?: boolean;
  readonly lines: readonly Bg2ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg2Line): Bg2ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg2Word[] = [];
  const chars: Bg2Char[] = [];
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
  const env = Array.from({ length: Math.ceil(dur * BG2_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / BG2_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg2Manifest = (): Bg2Manifest => ({
  version: 1,
  kind: "bg2",
  estimated: true,
  lines: BG2_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер по огибающей громкости всех реплик) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Реплика на шкале ролика (абсолютное время, с).
export type Bg2Cue = {
  readonly id: string;
  readonly role: Bg2Line["role"];
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Bg2Word[];
  readonly chars: readonly Bg2Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export const buildBg2Cues = (m: Bg2Manifest): Bg2Cue[] =>
  BG2_LINES.map((l) => {
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
// отмеченных в BG2_MIN_GAP — выразительная пауза), не
// выходят за свою сцену и заканчиваются до финального экрана; файл не
// начинается раньше 0 с. Возвращает список проблем (пустой — всё в порядке).
export const checkBg2Timing = (
  lines: readonly Pick<Bg2ManifestLine, "id" | "speechStart" | "speechEnd" | "durationSec">[],
): string[] => {
  const problems: string[] = [];
  const cues = buildBg2Cues({ version: 1, kind: "bg2", lines });
  cues.forEach((c, i) => {
    const line = BG2_LINES[i];
    const next = cues[i + 1];
    const scene = BG2_SCENES.find((s) => s.id === line.scene)!;
    const gap = next ? Math.max(0.3, BG2_MIN_GAP[next.id] ?? 0) : 0;
    const limit = Math.min(scene.to - 0.2, next ? next.from - gap : BG2_DIALOG_END, BG2_DIALOG_END);
    if (c.to > limit) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с, а должна закончиться до ${limit.toFixed(2)} с`);
    if (c.from < scene.from) problems.push(`${c.id}: начинается раньше своей сцены`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  return problems;
};

// Длительность ролика (кадры): последнее слово финала + tailSec тишины
// на финальном экране, в пределах minSec…maxSec.
export const bg2DurationFrames = (m: Bg2Manifest): number => {
  const cues = buildBg2Cues(m);
  const last = Math.max(...cues.map((c) => c.to));
  const sec = Math.min(BG2_VIDEO.maxSec, Math.max(BG2_VIDEO.minSec, last + BG2_VIDEO.tailSec));
  return Math.ceil(sec * BG2_VIDEO.fps);
};
