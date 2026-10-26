// Шкала Lesson80_1_5: собирается из битов (script.ts) и фактической
// длительности озвучки. Каждая реплика начинает звучать после предыдущего
// события с естественным зазором; четыре обязательные паузы отсчитываются
// от фактического конца речи вопроса (по звуку), ответ начинается после
// паузы. Длительность композиции — результат, а не исходная константа.
// Без зависимостей от Remotion (читается Node-скриптами).
import {
  L815_ANSWER_LEAD,
  L815_BEATS,
  L815_FPS,
  L815_LEAD,
  L815_LINES,
  L815_VIDEO,
  lineById,
  type L815Line,
  type L815Role,
  type L815SceneId,
} from "./script.ts";

export type L815Word = { readonly text: string; readonly start: number; readonly end: number };
export type L815Char = { readonly c: string; readonly start: number; readonly end: number };

export type L815ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number; // от начала файла (с)
  readonly speechEnd: number;
  readonly words?: readonly L815Word[];
  readonly chars?: readonly L815Char[];
  readonly env?: readonly number[]; // громкость по кадрам (30 к/с), 0…1
  readonly provider?: string;
  readonly voice?: string;
  readonly temporary?: boolean; // временная дорожка (не финальный голос)
};

export type L815Manifest = {
  readonly version: 1;
  readonly kind: "lesson-80-1-5";
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly provider?: string;
  readonly temporary?: boolean;
  readonly lines: readonly L815ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка без озвучки: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: L815Line): L815ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.05;
  const words: L815Word[] = [];
  const chars: L815Char[] = [];
  for (const w of tokens) {
    const letters = [...w.toLowerCase()].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.22, letters.length / 13);
    letters.forEach((c, i) => chars.push({ c, start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—:]$/.test(w) ? 0.32 : 0.08);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.12;
  const env = Array.from({ length: Math.ceil(dur * L815_FPS) }, (_, i) => {
    const s = (i + 0.5) / L815_FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.05, speechEnd: end, words, chars, env };
};

export const estimateL815Manifest = (): L815Manifest => ({
  version: 1,
  kind: "lesson-80-1-5",
  estimated: true,
  lines: L815_LINES.map(estimateLine),
});

// Реплика на шкале (абсолютные секунды и кадры).
export type L815Cue = {
  readonly id: string;
  readonly n: number;
  readonly role: L815Role;
  readonly scene: L815SceneId;
  readonly text: string;
  readonly file?: string;
  readonly audioFromFrame: number; // кадр начала файла
  readonly durationSec: number;
  readonly from: number; // начало речи (с)
  readonly to: number; // конец речи (с, по звуку)
  readonly fromFrame: number;
  readonly toFrame: number; // первый кадр после конца речи
  readonly words: readonly L815Word[];
  readonly chars: readonly L815Char[];
  readonly env: readonly number[]; // по кадрам от audioFromFrame
  readonly pauseAfter?: number;
  readonly answer?: string;
};

export type L815Scene = {
  readonly id: L815SceneId;
  readonly from: number; // кадр
  readonly to: number; // кадр (исключительно)
};

export type L815Action = { readonly id: string; readonly scene: L815SceneId; readonly from: number; readonly to: number }; // кадры

export type L815Pause = {
  readonly question: string;
  readonly answer: string;
  readonly sec: number;
  readonly frames: number;
  readonly from: number; // первый кадр ожидания (после конца речи вопроса)
  readonly to: number; // первый кадр, в который может начаться ответ
};

export type L815Timeline = {
  readonly cues: readonly L815Cue[];
  readonly scenes: readonly L815Scene[];
  readonly actions: readonly L815Action[];
  readonly pauses: readonly L815Pause[];
  readonly durationInFrames: number;
  readonly durationSec: number;
};

const FPS = L815_FPS;
const TAIL_FRAMES = Math.round(0.6 * FPS); // спокойное удержание после последнего события

export const buildL815Timeline = (m: L815Manifest): L815Timeline => {
  const byId = new Map(m.lines.map((l) => [l.id, l]));
  const cues: L815Cue[] = [];
  const scenes: L815Scene[] = [];
  const actions: L815Action[] = [];
  const pauses: L815Pause[] = [];
  let cursor = 0; // кадр, с которого может начаться следующее событие
  let scene: L815SceneId | null = null;
  let sceneFrom = 0;
  let lastSpeechEndFrame = 0; // точный (дробный) кадр конца речи
  let pendingPause: { line: L815Line; from: number; to: number } | null = null;

  for (const b of L815_BEATS) {
    if (b.kind === "scene") {
      if (scene) scenes.push({ id: scene, from: sceneFrom, to: cursor });
      scene = b.id;
      sceneFrom = cursor;
      continue;
    }
    if (b.kind === "action") {
      const frames = Math.round(b.sec * FPS);
      actions.push({ id: b.id, scene: scene!, from: cursor, to: cursor + frames });
      cursor += frames;
      continue;
    }
    const line = lineById(b.id);
    const ml = byId.get(line.id) ?? estimateLine(line);
    const est = ml.chars && ml.env ? ml : { ...estimateLine(line), ...ml };
    let fromFrame: number;
    if (pendingPause && pendingPause.line.answer === line.id) {
      // ответ — строго после окончания обязательной паузы
      fromFrame = Math.max(cursor, pendingPause.to + Math.round(L815_ANSWER_LEAD * FPS));
    } else {
      const lead = Math.round((line.lead ?? L815_LEAD) * FPS);
      fromFrame = Math.max(cursor, Math.ceil(lastSpeechEndFrame) + lead);
    }
    // кадр начала файла — целый; начало речи внутри файла сдвигает речь
    const audioFromFrame = Math.max(0, Math.round(fromFrame - ml.speechStart * FPS));
    const speechFrom = audioFromFrame / FPS + ml.speechStart;
    const speechTo = audioFromFrame / FPS + ml.speechEnd;
    const speechEndFrame = speechTo * FPS;
    const toFrame = Math.ceil(speechEndFrame);
    const shift = audioFromFrame / FPS;
    const cue: L815Cue = {
      id: line.id,
      n: line.n,
      role: line.role,
      scene: scene!,
      text: line.text,
      file: ml.file,
      audioFromFrame,
      durationSec: ml.durationSec,
      from: speechFrom,
      to: speechTo,
      fromFrame: Math.floor(speechFrom * FPS),
      toFrame,
      words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
      chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift, end: c.end + shift })),
      env: est.env ?? [],
      pauseAfter: line.pauseAfter,
      answer: line.answer,
    };
    cues.push(cue);
    lastSpeechEndFrame = speechEndFrame;
    pendingPause = null;
    // файл дозвучивает (хвост тишины) — следующий файл после него
    cursor = Math.max(toFrame, audioFromFrame + Math.ceil(ml.durationSec * FPS));
    if (line.pauseAfter) {
      const frames = Math.round(line.pauseAfter * FPS);
      // ожидание начинается с первого полного кадра после конца речи
      const from = toFrame;
      const to = from + frames;
      pauses.push({ question: line.id, answer: line.answer!, sec: line.pauseAfter, frames, from, to });
      pendingPause = { line, from, to };
      cursor = Math.max(cursor, to);
    }
  }
  cursor += TAIL_FRAMES;
  if (scene) scenes.push({ id: scene, from: sceneFrom, to: cursor });
  return { cues, scenes, actions, pauses, durationInFrames: cursor, durationSec: cursor / FPS };
};

export const sceneOf = (tl: L815Timeline, id: L815SceneId): L815Scene => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};
export const actionOf = (tl: L815Timeline, id: string): L815Action => {
  const a = tl.actions.find((x) => x.id === id);
  if (!a) throw new Error(`Нет действия ${id}`);
  return a;
};
export const cueOf = (tl: L815Timeline, id: string): L815Cue => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return c;
};

// Проверка шкалы: все 48 реплик по порядку, без наложений, каждая пауза
// ровно нужной длины от конца речи вопроса, ответ не раньше её конца,
// длительность в допустимом диапазоне. Возвращает список проблем.
export const checkL815Timeline = (tl: L815Timeline): string[] => {
  const problems: string[] = [];
  if (tl.cues.length !== L815_LINES.length) problems.push(`реплик ${tl.cues.length}, нужно ${L815_LINES.length}`);
  tl.cues.forEach((c, i) => {
    if (c.id !== L815_LINES[i].id) problems.push(`порядок: ${c.id} на месте ${L815_LINES[i].id}`);
    const next = tl.cues[i + 1];
    if (next) {
      const fileEnd = c.audioFromFrame / FPS + c.durationSec;
      if (next.audioFromFrame / FPS < fileEnd - 0.001) problems.push(`${c.id}: файл накладывается на ${next.id}`);
      if (next.from < c.to + 0.1) problems.push(`${c.id} → ${next.id}: зазор ${(next.from - c.to).toFixed(2)} с`);
    }
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.audioFromFrame < sc.from || c.toFrame > sc.to) problems.push(`${c.id}: выходит за сцену ${c.scene}`);
  });
  for (const p of tl.pauses) {
    const q = cueOf(tl, p.question);
    const a = cueOf(tl, p.answer);
    const wait = a.from - q.to;
    if (wait < p.sec) problems.push(`${p.question}: ответ ${p.answer} через ${wait.toFixed(3)} с, нужно ≥ ${p.sec} с`);
    if (wait > p.sec + 0.5) problems.push(`${p.question}: ответ ${p.answer} через ${wait.toFixed(3)} с — слишком поздно`);
    if (p.to - p.from !== p.frames) problems.push(`${p.question}: ожидание ${p.to - p.from} кадров, нужно ${p.frames}`);
    if (p.from < q.to * FPS - 1e-6) problems.push(`${p.question}: ожидание начинается до конца речи`);
    if (a.audioFromFrame / FPS + 0.001 < p.to / FPS && a.from < p.to / FPS) problems.push(`${p.question}: звук ответа раньше конца ожидания`);
  }
  if (tl.durationSec < L815_VIDEO.minSec || tl.durationSec > L815_VIDEO.maxSec) {
    problems.push(`длительность ${tl.durationSec.toFixed(1)} с вне диапазона ${L815_VIDEO.minSec}–${L815_VIDEO.maxSec} с`);
  }
  return problems;
};

export const fmtTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};
