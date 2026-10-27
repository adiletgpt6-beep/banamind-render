// Планировщик монтажа фильма №35 по ФАКТИЧЕСКИМ файлам озвучки.
//
// Порядок: сцены идут подряд (PHT_SCENES). В сцене первая реплика начинается
// через scene.lead, каждая следующая — через свою паузу gap после конца речи
// предыдущей; сцена заканчивается через scene.tail после последней реплики
// (но не короче scene.min). Опорные точки — целые кадры (30 к/с): начало
// файла реплики ставится на целый кадр, всё остальное считается от него,
// поэтому округление не накапливается. Изменилась длина файла — сцены,
// субтитры и губы пересчитываются сами.
//
// Без озвучки (Studio, тесты) — оценка по тексту; финальный рендер без
// полной актуальной озвучки запрещён (manifestGuard.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { PHT_GAP, PHT_LINES, PHT_SCENES, PHT_VIDEO, type PhtLine, type PhtRole, type PhtSceneId } from "./script.ts";

const FPS = PHT_VIDEO.fps;

export type PhtWord = { readonly text: string; readonly start: number; readonly end: number };
export type PhtChar = { readonly c: string; readonly start: number; readonly end: number };

export type PhtManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number; // от начала файла, с
  readonly speechEnd: number;
  readonly words?: readonly PhtWord[];
  readonly chars?: readonly PhtChar[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type PhtManifest = {
  readonly version: 1;
  readonly kind: "pht";
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly PhtManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: PhtLine): PhtManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.12;
  const words: PhtWord[] = [];
  const chars: PhtChar[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 13);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.18;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.12, speechEnd: end, words, chars, env };
};

export const estimatePhtManifest = (): PhtManifest => ({
  version: 1,
  kind: "pht",
  estimated: true,
  lines: PHT_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер ролика №12 по огибающей громкости) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Реплика на шкале фильма (абсолютное время, с; кадры — целые).
export type PhtCue = {
  readonly id: string;
  readonly role: PhtRole;
  readonly scene: PhtSceneId;
  readonly text: string;
  readonly file?: string;
  readonly audioFromFrame: number; // первый кадр файла
  readonly audioFrom: number; // то же, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly PhtWord[];
  readonly chars: readonly PhtChar[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export type PhtSceneSpan = { readonly id: PhtSceneId; readonly title: string; readonly from: number; readonly to: number };

export type PhtPlan = {
  readonly cues: readonly PhtCue[];
  readonly scenes: readonly PhtSceneSpan[];
  readonly totalFrames: number;
};

export const planPht = (m: PhtManifest): PhtPlan => {
  const cues: PhtCue[] = [];
  const scenes: PhtSceneSpan[] = [];
  let cursor = 0; // первый кадр сцены
  let audioEnd = 0; // последний кадр звучания файлов
  for (const sc of PHT_SCENES) {
    let prevEnd: number | null = null;
    for (const l of PHT_LINES.filter((x) => x.scene === sc.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const gap = prevEnd === null ? sc.lead : l.gap ?? PHT_GAP;
      const target = (prevEnd === null ? cursor / FPS : prevEnd) + gap;
      // кадр, с которого звучит речь, — целый; файл стартует на целом кадре
      const speechFrame = Math.ceil(target * FPS - 1e-6);
      const audioFromFrame = speechFrame - Math.round(ml.speechStart * FPS);
      const a = audioFromFrame / FPS;
      const lag = ml.chars ? CHAR_LAG : 0;
      cues.push({
        id: l.id,
        role: l.role,
        scene: sc.id,
        text: l.text,
        file: ml.file,
        audioFromFrame,
        audioFrom: a,
        durationSec: ml.durationSec,
        from: a + ml.speechStart,
        to: a + ml.speechEnd,
        words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: w.start + a, end: w.end + a })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + a + lag, end: c.end + a + lag })),
        env: est.env ?? [],
      });
      prevEnd = a + ml.speechEnd;
      audioEnd = Math.max(audioEnd, audioFromFrame + Math.ceil(ml.durationSec * FPS));
    }
    const end = prevEnd === null ? cursor : Math.ceil((prevEnd + sc.tail) * FPS - 1e-6);
    const to = Math.max(end, cursor + Math.ceil((sc.min ?? 0) * FPS));
    scenes.push({ id: sc.id, title: sc.title, from: cursor, to });
    cursor = to;
  }
  // последний файл звучит до конца (финальные слова не обрываются)
  const totalFrames = Math.max(cursor, audioEnd + 2);
  if (totalFrames > cursor) scenes[scenes.length - 1] = { ...scenes[scenes.length - 1], to: totalFrames };
  return { cues, scenes, totalFrames };
};

export const sceneSpan = (plan: PhtPlan, id: PhtSceneId) => {
  const s = plan.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

// Проверка плана: реплики не накладываются (≥ 0,2 с тишины между речью),
// файл не начинается раньше 0, последняя реплика заканчивается не позже
// чем за 1,5 с до конца фильма (финальная композиция держится).
export const checkPhtPlan = (plan: PhtPlan): string[] => {
  const problems: string[] = [];
  plan.cues.forEach((c, i) => {
    const prev = plan.cues[i - 1];
    if (prev && c.from < prev.to + 0.2) problems.push(`${c.id}: начинается через ${(c.from - prev.to).toFixed(2)} с после ${prev.id}`);
    if (c.audioFromFrame < 0) problems.push(`${c.id}: файл начинается раньше 0`);
    const sc = sceneSpan(plan, c.scene);
    if (c.from * FPS < sc.from || c.to * FPS > sc.to) problems.push(`${c.id}: речь выходит за сцену ${sc.id}`);
  });
  const last = plan.cues[plan.cues.length - 1];
  if (last && plan.totalFrames / FPS - last.to < 1.5) problems.push("финальная композиция держится меньше 1,5 с после речи");
  return problems;
};
