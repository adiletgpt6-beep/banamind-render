// Монтаж ролика «Бүгүн жеткире турган киши жок» (ровно 120 с). Сцены идут по
// жёсткому плану из сценария; реплики ставятся на «якоря» и сдвигаются
// вперёд, если реальная длительность предыдущей реплики больше оценки.
// Проверка (scripts/no-backup.test.mjs): речь не пересекается, каждая
// реплика остаётся в своей сцене, речь заканчивается не позже 108 с.
//
// Файл без зависимостей от Remotion.
import { NB_LINES, NB_VIDEO, type NBRole } from "./script.ts";

export type NBShotId = "morning" | "call" | "tries" | "decide" | "drive" | "office" | "evening" | "form" | "cta";

// Сцены (секунды ролика) — как в сценарии.
export const NB_SHOTS: readonly { id: NBShotId; from: number; to: number; title: string }[] = [
  { id: "morning", from: 0, to: 14, title: "Обычное утро" },
  { id: "call", from: 14, to: 32, title: "Звонок бабушке" },
  { id: "tries", from: 32, to: 47, title: "Ещё одна попытка" },
  { id: "decide", from: 47, to: 61, title: "Мама решает сама" },
  { id: "drive", from: 61, to: 80, title: "Дорога и школа" },
  { id: "office", from: 80, to: 94, title: "Опоздание" },
  { id: "evening", from: 94, to: 108, title: "Вечерний разговор" },
  { id: "form", from: 108, to: 114, title: "Предварительная заявка" },
  { id: "cta", from: 114, to: 120, title: "Финальный экран" },
];

// Якоря реплик (секунды ролика). Сцена реплики — по якорю.
export const NB_ANCHORS: Record<string, { at: number; shot: NBShotId }> = {
  d01: { at: 2.2, shot: "morning" },
  f01: { at: 5.7, shot: "morning" },
  m01: { at: 10.2, shot: "morning" },
  m02: { at: 16.2, shot: "call" },
  g01: { at: 21.0, shot: "call" },
  m03: { at: 26.4, shot: "call" },
  b01: { at: 33.8, shot: "tries" },
  d02: { at: 48.6, shot: "decide" },
  m04: { at: 52.8, shot: "decide" },
  d03: { at: 73.4, shot: "drive" },
  m05: { at: 75.2, shot: "drive" },
  c01: { at: 86.8, shot: "office" },
  m06: { at: 88.1, shot: "office" },
  m07: { at: 95.6, shot: "evening" },
  f02: { at: 100.9, shot: "evening" },
};
export const NB_MIN_GAP = 0.35;

export type NBWord = { text: string; start: number; end: number };
export type NBManifestLine = {
  id: string;
  role: NBRole;
  text: string;
  file?: string;
  durationSec: number;
  speechStart: number;
  speechEnd: number;
  words: NBWord[];
};
export type NBManifest = { version: 1; kind: "no-backup"; lines: NBManifestLine[] };

// Оценка без озвучки: ~15 знаков в секунду (как в пробах eleven_v3).
export const estimateNBManifest = (): NBManifest => ({
  version: 1,
  kind: "no-backup",
  lines: NB_LINES.map((l) => {
    const text = l.spoken ?? l.text;
    const dur = Math.max(0.9, text.length / 15);
    const ws = l.text.split(/\s+/).filter((w) => /\p{L}/u.test(w));
    const tot = ws.reduce((a, w) => a + w.length + 2, 0);
    let t = 0.08;
    const words = ws.map((w) => {
      const d = ((w.length + 2) / tot) * (dur - 0.1);
      const o = { text: w, start: t, end: t + d * 0.88 };
      t += d;
      return o;
    });
    return { id: l.id, role: l.role, text: l.text, durationSec: dur + 0.15, speechStart: 0.08, speechEnd: dur, words };
  }),
});

export type NBPlacedLine = NBManifestLine & {
  shot: NBShotId;
  startSec: number; // начало файла на шкале ролика
  speechFromSec: number;
  speechToSec: number;
};

export const placeLines = (m: NBManifest): NBPlacedLine[] => {
  const out: NBPlacedLine[] = [];
  let prevEnd = 0;
  for (const def of NB_LINES) {
    const l = m.lines.find((x) => x.id === def.id);
    const a = NB_ANCHORS[def.id];
    if (!l || !a) throw new Error(`Нет реплики или якоря: ${def.id}`);
    const speechFrom = Math.max(a.at, prevEnd + NB_MIN_GAP);
    const startSec = speechFrom - l.speechStart;
    const speechTo = startSec + l.speechEnd;
    prevEnd = speechTo;
    out.push({ ...l, shot: a.shot, startSec, speechFromSec: speechFrom, speechToSec: speechTo });
  }
  return out;
};

// Допуск: реплика может закончиться не позже чем через reserve секунд после
// якоря следующей (монтаж сцены рассчитан на это время).
const RESERVE: Record<string, number> = {
  d01: 3.3, f01: 4.4, m01: 3.0, m02: 4.3, g01: 4.6, m03: 3.2, b01: 4.6, d02: 2.6, m04: 3.0,
  d03: 1.5, m05: 1.8, c01: 1.2, m06: 4.9, m07: 4.8, f02: 5.2,
};

export const checkTimeline = (lines: readonly NBPlacedLine[]) => {
  const errors: string[] = [];
  for (const l of lines) {
    const s = NB_SHOTS.find((x) => x.id === l.shot)!;
    if (l.speechFromSec < s.from || l.speechToSec > s.to - 0.2)
      errors.push(`${l.id}: речь ${l.speechFromSec.toFixed(2)}–${l.speechToSec.toFixed(2)} с вне сцены ${s.id} (${s.from}–${s.to})`);
    const a = NB_ANCHORS[l.id];
    const r = RESERVE[l.id];
    if (r !== undefined && l.speechToSec > a.at + r + 0.6)
      errors.push(`${l.id}: речь до ${l.speechToSec.toFixed(2)} с — дольше, чем рассчитан монтаж (${(a.at + r).toFixed(2)} с)`);
  }
  const last = lines[lines.length - 1];
  if (last && last.speechToSec > NB_VIDEO.speechEndMaxSec)
    errors.push(`речь заканчивается на ${last.speechToSec.toFixed(2)} с > ${NB_VIDEO.speechEndMaxSec}`);
  return errors;
};

export const wordsAbs = (l: NBPlacedLine | undefined): NBWord[] =>
  l ? l.words.map((w) => ({ text: w.text, start: l.startSec + w.start, end: l.startSec + w.end })) : [];
