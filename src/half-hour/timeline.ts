// Монтаж ролика «Жумуштан жарым саатка» (ровно 120 с). Сцены идут по
// жёсткому плану; реплики ставятся на «якоря» и сдвигаются вперёд, если
// реальная длительность предыдущей реплики больше оценки. Проверка
// (scripts/half-hour.test.mjs): речь не пересекается, каждая реплика
// остаётся в своей сцене, речь заканчивается не позже 114 с.
//
// Файл без зависимостей от Remotion.
import { HH_LINES, HH_VIDEO, type HHRole } from "./script.ts";

export type HHShotId =
  | "office"
  | "desk"
  | "meeting"
  | "school"
  | "road"
  | "pickup"
  | "afternoon"
  | "home"
  | "form"
  | "cta";

// Сцены (секунды ролика).
export const HH_SHOTS: readonly { id: HHShotId; from: number; to: number; title: string }[] = [
  { id: "office", from: 0, to: 12, title: "Офис, утро: «можно отлучиться?»" },
  { id: "desk", from: 12, to: 25.4, title: "Напоминание и просьба коллеги" },
  { id: "meeting", from: 25.4, to: 30, title: "Встреча затягивается" },
  { id: "school", from: 30, to: 45, title: "Школа: уроки закончились" },
  { id: "road", from: 45, to: 65, title: "Дорога и школьный двор" },
  { id: "pickup", from: 65, to: 82, title: "Встреча у школы" },
  { id: "afternoon", from: 82, to: 95, title: "Снова в офисе" },
  { id: "home", from: 95, to: 109, title: "Вечер дома" },
  { id: "form", from: 109, to: 114, title: "Заявка BalaGo" },
  { id: "cta", from: 114, to: 120, title: "Финальный экран" },
];

// Якоря реплик (секунды ролика) и минимальная пауза между репликами.
export const HH_ANCHORS: Record<string, { at: number; shot: HHShotId }> = {
  m01: { at: 3.6, shot: "office" },
  b01: { at: 9.4, shot: "office" },
  c01: { at: 16.4, shot: "desk" },
  m02: { at: 22.6, shot: "desk" },
  s01: { at: 35.6, shot: "school" },
  t01: { at: 41.7, shot: "school" },
  m03: { at: 66.4, shot: "pickup" },
  t02: { at: 70.4, shot: "pickup" },
  s02: { at: 72.3, shot: "pickup" },
  m04: { at: 76.3, shot: "pickup" },
  m05: { at: 78.5, shot: "pickup" },
  m06: { at: 95.7, shot: "home" },
  h01: { at: 99.9, shot: "home" },
  h02: { at: 103.4, shot: "home" },
  m07: { at: 109.2, shot: "form" },
};
export const HH_MIN_GAP = 0.3;

export type HHWord = { text: string; start: number; end: number };
export type HHManifestLine = {
  id: string;
  role: HHRole;
  text: string;
  file?: string;
  durationSec: number;
  speechStart: number;
  speechEnd: number;
  words: HHWord[];
};
export type HHManifest = { version: 1; kind: "half-hour"; lines: HHManifestLine[] };

// Оценка без озвучки: ~16 знаков в секунду (как в пробах eleven_v3),
// многоточие — пауза.
export const estimateHHManifest = (): HHManifest => ({
  version: 1,
  kind: "half-hour",
  lines: HH_LINES.map((l) => {
    const text = l.spoken ?? l.text;
    const dur = Math.max(0.9, text.length / 16 + (text.match(/\.\.\./g)?.length ?? 0) * 0.4);
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

export type HHPlacedLine = HHManifestLine & {
  shot: HHShotId;
  startSec: number; // начало файла на шкале ролика
  speechFromSec: number;
  speechToSec: number;
};

export const placeLines = (m: HHManifest): HHPlacedLine[] => {
  const out: HHPlacedLine[] = [];
  let prevEnd = 0;
  for (const def of HH_LINES) {
    const l = m.lines.find((x) => x.id === def.id);
    const a = HH_ANCHORS[def.id];
    if (!l || !a) throw new Error(`Нет реплики или якоря: ${def.id}`);
    const speechFrom = Math.max(a.at, prevEnd + HH_MIN_GAP);
    const startSec = speechFrom - l.speechStart;
    const speechTo = startSec + l.speechEnd;
    prevEnd = speechTo;
    out.push({ ...l, shot: a.shot, startSec, speechFromSec: speechFrom, speechToSec: speechTo });
  }
  return out;
};

export const checkTimeline = (lines: readonly HHPlacedLine[]) => {
  const errors: string[] = [];
  for (const l of lines) {
    const s = HH_SHOTS.find((x) => x.id === l.shot)!;
    if (l.speechFromSec < s.from || l.speechToSec > s.to + 0.05)
      errors.push(`${l.id}: речь ${l.speechFromSec.toFixed(2)}–${l.speechToSec.toFixed(2)} с вне сцены ${s.id} (${s.from}–${s.to})`);
  }
  const last = lines[lines.length - 1];
  if (last && last.speechToSec > HH_VIDEO.speechEndMaxSec)
    errors.push(`речь заканчивается на ${last.speechToSec.toFixed(2)} с > ${HH_VIDEO.speechEndMaxSec}`);
  return errors;
};

// Слова реплики во времени сцены (для губ): t — секунды ролика.
export const lineAt = (lines: readonly HHPlacedLine[], id: string) => lines.find((l) => l.id === id);
export const wordsAbs = (l: HHPlacedLine | undefined): HHWord[] =>
  l ? l.words.map((w) => ({ text: w.text, start: l.startSec + w.start, end: l.startSec + w.end })) : [];
