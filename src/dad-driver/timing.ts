// Монтаж BalaGo32DadDriver по фактической речи. Каждая реплика начинается
// через свою паузу (pre) после конца предыдущей; сцена длится до конца
// своей последней реплики плюс выдержка (tail). Поэтому длина ролика,
// начала сцен и субтитры следуют за реальными длительностями файлов
// озвучки, а не за заранее заданными таймкодами.
// Без озвучки — оценка по тексту (только для разработки; финальный
// рендер без голоса запрещён, см. manifestGuard.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { DD_LINES, DD_SCENES, DD_VIDEO, type DdLine, type DdRole, type DdSceneId } from "./script.ts";

export type DdWord = { readonly text: string; readonly start: number; readonly end: number };
// Буква реплики с временем звучания (от начала файла, с).
export type DdChar = { readonly c: string; readonly start: number; readonly end: number };

export type DdManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly DdWord[];
  readonly chars?: readonly DdChar[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type DdManifest = {
  readonly version: 1;
  readonly kind: "dd";
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly DdManifestLine[];
};

const FPS = DD_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13,5 буквы в секунду, паузы на знаках препинания.
export const estimateLine = (l: DdLine): DdManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.12;
  const words: DdWord[] = [];
  const chars: DdChar[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 13.5);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…:»]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: Number(dur.toFixed(3)), speechStart: 0.12, speechEnd: Number(end.toFixed(3)), words, chars, env };
};

export const estimateDdManifest = (): DdManifest => ({
  version: 1,
  kind: "dd",
  estimated: true,
  lines: DD_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер ролика №12) — сдвигаем их к звуку.
export const CHAR_LAG = 0.065;

// Реплика на шкале ролика (абсолютное время, с).
export type DdCue = {
  readonly id: string;
  readonly role: DdRole;
  readonly scene: DdSceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly DdWord[];
  readonly chars: readonly DdChar[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export type DdSceneSpan = {
  readonly id: DdSceneId;
  readonly from: number; // кадр начала (абсолютный)
  readonly to: number; // кадр конца (не включая)
};

export type DdTimeline = {
  readonly cues: readonly DdCue[];
  readonly scenes: readonly DdSceneSpan[];
  readonly frames: number;
  readonly estimated: boolean;
};

const f = (sec: number) => Math.round(sec * FPS);

export const buildDdTimeline = (m: DdManifest): DdTimeline => {
  const cues: DdCue[] = [];
  const scenes: DdSceneSpan[] = [];
  let cursor = 0; // секунды
  for (const sc of DD_SCENES) {
    const sceneFrom = cursor;
    let tcur = sceneFrom;
    for (const l of DD_LINES.filter((x) => x.scene === sc.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const from = tcur + l.pre;
      const shift = from - ml.speechStart;
      const to = from + (ml.speechEnd - ml.speechStart);
      const lag = ml.chars && !m.estimated ? CHAR_LAG : 0;
      cues.push({
        id: l.id,
        role: l.role,
        scene: sc.id,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from,
        to,
        words: (est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift + lag, end: w.end + shift + lag })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift + lag, end: c.end + shift + lag })),
        env: est.env ?? [],
      });
      tcur = to;
    }
    // файл реплики не обрезается сменой сцены: хвост файла (тишина)
    // может звучать поверх следующей сцены, речь — нет
    let end = tcur + sc.tail;
    if (sc.minSec) end = Math.max(end, sceneFrom + sc.minSec);
    scenes.push({ id: sc.id, from: f(sceneFrom), to: f(end) });
    cursor = f(end) / FPS;
  }
  const last = cues[cues.length - 1];
  const frames = Math.max(scenes[scenes.length - 1].to, Math.ceil((last.audioFrom + last.durationSec) * FPS));
  return { cues, scenes, frames, estimated: Boolean(m.estimated) };
};

// Проверка шкалы: реплики не накладываются, начинаются не раньше 0 с,
// речь сцены не выходит за сцену, длина — в разумных пределах.
export const checkDdTiming = (m: DdManifest): string[] => {
  const problems: string[] = [];
  const tl = buildDdTimeline(m);
  tl.cues.forEach((c, i) => {
    const next = tl.cues[i + 1];
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (next && next.from - c.to < 0.25) problems.push(`${c.id}: пауза до ${next.id} меньше 0,25 с`);
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (f(c.from) < sc.from || f(c.to) > sc.to) problems.push(`${c.id}: речь выходит за сцену ${sc.id}`);
  });
  const sec = tl.frames / FPS;
  if (!m.estimated && (sec < 110 || sec > DD_VIDEO.targetMax)) problems.push(`длина ${sec.toFixed(1)} с вне 110–${DD_VIDEO.targetMax} с`);
  const lastCue = tl.cues[tl.cues.length - 1];
  if (tl.frames / FPS - lastCue.to < 1.2) problems.push("финальный кадр держится меньше 1,2 с после последнего слова");
  return problems;
};

// Кадры сцены → удобные помощники для сцен.
export const sceneSpan = (tl: DdTimeline, id: DdSceneId) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};
