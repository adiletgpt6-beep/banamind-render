// Шкала фильма 80-1-11 (voice-first): цепочка «ударов» L80_BEATS раскладывается
// по времени из фактической длительности озвучки. Отсюда же — зрительские
// паузы (ровно 150/150/150 кадров от кадра полного окончания звука вопроса до
// кадра первого звука ответа), именованные отрезки действий и границы сцен.
// Всё состояние кадра определяется номером кадра и этой шкалой.
// Без зависимостей от Remotion (читается Node-скриптами и тестами).
import { estimateLine, type Cue, type Manifest, type ManifestLine, type SceneSpan, type Timeline } from "../core/timing.ts";
import { FPS } from "../core/video.ts";
import { FILM, L80_BEATS, L80_LINES, L80_PAUSES, L80_SCENES, lineById, type L80SceneId, type PauseId } from "./script.ts";

export type Span = { readonly from: number; readonly to: number };

// Фактические границы звука реплики в файле (с): по огибающей громкости
// (кадры с уровнем выше ≈ −43 дБFS), а не по таймингам букв синтезатора —
// хвост последней согласной и затухание входят в звучание вопроса.
export type SoundSpan = { readonly start: number; readonly end: number };
export const soundBounds = (ml: ManifestLine): SoundSpan => {
  const env = ml.env ?? [];
  const THR = 0.06;
  let first = -1;
  let last = -1;
  env.forEach((v, i) => {
    if (v > THR) {
      if (first < 0) first = i;
      last = i;
    }
  });
  if (first < 0) return { start: ml.speechStart, end: ml.speechEnd };
  return { start: Math.min(ml.speechStart, first / FPS), end: Math.max(ml.speechEnd, (last + 1) / FPS) };
};

export type L80Timeline = Timeline & {
  readonly sound: Readonly<Record<number, SoundSpan>>;
  readonly pauses: readonly { readonly id: PauseId; readonly after: number; readonly from: number; readonly to: number }[];
  readonly marks: Readonly<Record<string, Span>>;
  readonly sceneOf: (sec: number) => L80SceneId;
};

export const estimateManifest = (): Manifest => ({
  version: 1,
  kind: "lesson80",
  film: FILM.id,
  estimated: true,
  lines: L80_LINES.map(estimateLine),
});

const q = (t: number) => Math.round(t * FPS) / FPS;

export const buildTimeline = (m: Manifest): L80Timeline => {
  const cues: Cue[] = [];
  const pauses: { id: PauseId; after: number; from: number; to: number }[] = [];
  const marks: Record<string, Span> = {};
  const sound: Record<number, SoundSpan> = {};
  const sceneStart = new Map<L80SceneId, number>();
  let t = 0;
  let scene: L80SceneId | null = null;
  let lastCue = null as Cue | null;
  let nextExact = false;

  const enterScene = (id: L80SceneId) => {
    if (scene !== id) {
      scene = id;
      sceneStart.set(id, t);
    }
  };
  const mlOf = (id: number): ManifestLine => {
    const l = lineById(id);
    const ml = m.lines.find((x) => x.id === id) ?? estimateLine(l);
    return ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
  };
  const pushCue = (id: number, start: number): Cue => {
    const l = lineById(id);
    const ml = mlOf(id);
    const speech = ml.speechEnd - ml.speechStart;
    const shift = start - ml.speechStart;
    const cue: Cue = {
      id,
      role: l.role,
      scene: l.scene,
      file: ml.file,
      audioFrom: shift,
      durationSec: ml.durationSec,
      from: start,
      to: start + speech,
      words: (ml.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
      chars: (ml.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift, end: c.end + shift })),
      env: ml.env ?? [],
    };
    cues.push(cue);
    lastCue = cue;
    const sb = soundBounds(ml);
    sound[id] = { start: shift + sb.start, end: shift + sb.end };
    return cue;
  };
  // сдвиг начала речи относительно первого звука файла (для точного старта ответа)
  const leadIn = (id: number) => {
    const ml = mlOf(id);
    return ml.speechStart - soundBounds(ml).start;
  };

  for (const b of L80_BEATS) {
    if (b.kind === "hold") {
      if (b.scene) enterScene(b.scene);
      if (marks[b.label]) throw new Error(`Отрезок «${b.label}» задан дважды`);
      marks[b.label] = { from: t, to: t + b.sec };
      t += b.sec;
    } else if (b.kind === "line") {
      enterScene(lineById(b.id).scene);
      const c = pushCue(b.id, nextExact ? t : q(t));
      nextExact = false;
      t = c.to + (b.gapAfter ?? 0.5);
    } else {
      const p = L80_PAUSES.find((x) => x.id === b.id)!;
      if (!lastCue || lastCue.id !== p.after) throw new Error(`Пауза ${b.id} должна идти сразу после реплики ${p.after}`);
      // ровно p.sec × FPS кадров от кадра полного окончания звука вопроса
      // (включая последнюю согласную) до кадра первого звука ответа
      const endFrame = Math.ceil(sound[lastCue.id].end * FPS - 1e-6);
      const from = endFrame / FPS;
      const to = from + p.sec;
      pauses.push({ id: b.id, after: p.after, from, to });
      marks[b.id] = { from, to };
      t = to + leadIn(p.after + 1);
      nextExact = true;
    }
  }
  const durationInFrames = Math.round(t * FPS);
  const durationSec = durationInFrames / FPS;
  const scenes: SceneSpan[] = L80_SCENES.map((s, i) => {
    const from = sceneStart.get(s.id) ?? 0;
    const next = L80_SCENES[i + 1];
    const to = next ? sceneStart.get(next.id) ?? durationSec : durationSec;
    return { id: s.id, title: s.title, from, to };
  });
  const sceneOf = (sec: number): L80SceneId => {
    let cur: L80SceneId = "s1";
    for (const s of scenes) if (sec >= s.from) cur = s.id as L80SceneId;
    return cur;
  };
  return { cues, scenes, durationSec, durationInFrames, pauses, marks, sceneOf, sound };
};

export const cueById = (tl: L80Timeline, id: number): Cue => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id} на шкале`);
  return c;
};

export const markOf = (tl: L80Timeline, label: string): Span => {
  const m = tl.marks[label];
  if (!m) throw new Error(`Нет отрезка «${label}»`);
  return m;
};

// Кадры зрительской паузы по звуку: от кадра полного окончания вопроса до
// кадра первого звука ответа.
export const pauseFrames = (tl: L80Timeline, after: number) =>
  Math.round(tl.sound[after + 1].start * FPS) - Math.ceil(tl.sound[after].end * FPS - 1e-6);

// Проверки шкалы: 45 реплик по порядку без наложений; три паузы ровно по
// 150 кадров от кадра полного окончания звука вопроса до кадра первого звука
// ответа; длительность 6600–7800 кадров; последний общий план 120–150 кадров
// и ≥ 3 с после последней реплики; первая реплика не раньше 3 с.
export const checkTimeline = (tl: L80Timeline): string[] => {
  const p: string[] = [];
  if (tl.cues.length !== L80_LINES.length) p.push(`реплик на шкале ${tl.cues.length}, нужно ${L80_LINES.length}`);
  tl.cues.forEach((c, i) => {
    if (c.id !== i + 1) p.push(`реплика №${c.id} стоит на месте ${i + 1}`);
    const n = tl.cues[i + 1];
    if (n && n.from < c.to + 0.25) p.push(`реплики ${c.id} и ${n.id} слишком близко (${(n.from - c.to).toFixed(2)} с)`);
    if (n && tl.sound[n.id].start < tl.sound[c.id].end) p.push(`звук реплик ${c.id} и ${n.id} накладывается`);
    if (c.audioFrom < 0) p.push(`${c.id}: файл начинается раньше 0 с`);
    if (c.audioFrom + c.durationSec > tl.durationSec) p.push(`${c.id}: аудио выходит за конец фильма`);
  });
  for (const ps of L80_PAUSES) {
    const frames = pauseFrames(tl, ps.after);
    if (frames !== ps.sec * FPS) p.push(`пауза ${ps.id}: ${frames} кадров вместо ${ps.sec * FPS}`);
    const span = tl.pauses.find((x) => x.id === ps.id);
    if (!span) p.push(`пауза ${ps.id} не задана`);
    else if (tl.sound[ps.after].end > span.from + 1e-6) p.push(`пауза ${ps.id}: звук вопроса заходит в паузу`);
  }
  const frames = tl.durationInFrames;
  if (frames < FILM.minSec * FPS || frames > FILM.maxSec * FPS) p.push(`длительность ${tl.durationSec.toFixed(1)} с (${frames} кадров) вне допуска ${FILM.minSec}–${FILM.maxSec} с`);
  const last = tl.cues[tl.cues.length - 1];
  if (last && tl.durationSec - tl.sound[last.id].end < 3) p.push("после последней реплики меньше 3 с");
  if (tl.cues[0] && tl.cues[0].from < 3) p.push("первая реплика раньше 3 с");
  const fin = tl.marks["финал: класс"];
  const finFrames = fin ? Math.round(fin.to * FPS) - Math.round(fin.from * FPS) : 0;
  if (!fin || finFrames < 120 || finFrames > 150 || Math.abs(fin.to - tl.durationSec) > 1 / FPS) p.push(`последний общий план ${finFrames} кадров (нужно 120–150 в самом конце)`);
  return p;
};
