// Шкала реплик BalaGoHalfHour2D: реплика начинается в момент at (с), её
// длительность берётся из файла озвучки. Без озвучки — оценка по тексту.
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  HH2_DIALOG_END,
  HH2_LINES,
  HH2_SCENES,
  type Hh2Line,
} from "./script.ts";

export type Hh2Word = { readonly text: string; readonly start: number; readonly end: number };

export type Hh2ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Hh2Word[];
};

export type Hh2Manifest = {
  readonly version: 1;
  readonly kind: "hh2d";
  readonly estimated?: boolean;
  readonly lines: readonly Hh2ManifestLine[];
};

// Оценка: ≈ 13 букв в секунду, паузы на знаках препинания.
const estimateLine = (l: Hh2Line): Hh2ManifestLine => {
  const tokens = l.text.split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Hh2Word[] = [];
  for (const w of tokens) {
    const letters = [...w].filter((c) => /[\p{L}\p{N}]/u.test(c)).length;
    if (!letters) continue;
    const d = Math.max(0.18, letters / 13);
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.28 : 0.06);
  }
  const end = words.length ? words[words.length - 1].end : t;
  return { id: l.id, durationSec: end + 0.15, speechStart: 0.15, speechEnd: end, words };
};

export const estimateHh2Manifest = (): Hh2Manifest => ({
  version: 1,
  kind: "hh2d",
  estimated: true,
  lines: HH2_LINES.map(estimateLine),
});

// Реплика на шкале ролика (секунды).
export type Hh2Cue = {
  readonly id: string;
  readonly role: Hh2Line["role"];
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Hh2Word[]; // абсолютное время
};

export const buildHh2Cues = (m: Hh2Manifest): Hh2Cue[] =>
  HH2_LINES.map((l) => {
    const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
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
    };
  });

// Проверка шкалы: реплики не накладываются (минимум 0,3 с между ними),
// не выходят за свою сцену (или за maxEnd) и заканчиваются до финального
// экрана. Возвращает список проблем (пустой — всё в порядке).
export const checkHh2Timing = (
  lines: readonly Pick<Hh2ManifestLine, "id" | "speechStart" | "speechEnd" | "durationSec">[],
): string[] => {
  const problems: string[] = [];
  const cues = buildHh2Cues({ version: 1, kind: "hh2d", lines });
  cues.forEach((c, i) => {
    const line = HH2_LINES[i];
    const next = cues[i + 1];
    const scene = HH2_SCENES.find((s) => s.id === line.scene)!;
    const limit = Math.min(
      line.maxEnd ?? scene.to - 0.2,
      next ? next.from - 0.3 : HH2_DIALOG_END,
      HH2_DIALOG_END,
    );
    if (c.to > limit)
      problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с, а должна закончиться до ${limit.toFixed(2)} с`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  return problems;
};
