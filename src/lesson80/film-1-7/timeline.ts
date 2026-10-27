// Шкала фильма 80-1-7 (voice-first): цепочка «ударов» L80_BEATS раскладывается
// по времени из фактической длительности озвучки. Отсюда же — углы глобуса,
// события (лампа, занавеска, повороты, вход метки в свет), зрительские паузы и
// границы сцен. Всё состояние кадра определяется номером кадра и этой шкалой.
// Без зависимостей от Remotion (читается Node-скриптами и тестами).
import { estimateLine, type Cue, type Manifest, type ManifestLine, type SceneSpan, type Timeline } from "../core/timing.ts";
import { FPS } from "../core/video.ts";
import { FILM, L80_BEATS, L80_LINES, L80_PAUSES, L80_PHI, L80_SCENES, lineById, type L80SceneId, type PauseId } from "./script.ts";

export type Spin = {
  readonly from: number; // с
  readonly to: number;
  readonly phiFrom: number; // градусы
  readonly phiTo: number;
  readonly view: "side" | "top";
  readonly label: string;
};
export type Span = { readonly from: number; readonly to: number };

// Фактические границы звука реплики в файле (с): по огибающей громкости
// (кадры с уровнем выше ≈ −41 дБFS), а не по таймингам букв синтезатора —
// хвост последней согласной и затухание входят в звучание вопроса.
export type SoundSpan = { readonly start: number; readonly end: number };
export const soundBounds = (ml: ManifestLine): SoundSpan => {
  const env = ml.env ?? [];
  const THR = 0.06; // ≈ −43 дБFS: хвост согласной входит в звучание
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
  readonly spins: readonly Spin[];
  // абсолютные границы звука каждой реплики (с)
  readonly sound: Readonly<Record<number, SoundSpan>>;
  readonly pauses: readonly { readonly id: PauseId; readonly after: number; readonly from: number; readonly to: number }[];
  // именованные отрезки действий (label удара → отрезок)
  readonly marks: Readonly<Record<string, Span>>;
  readonly sunrise: number; // с: метка входит в прямой свет (реплика 19)
  readonly sceneOf: (sec: number) => L80SceneId;
};

export const estimateManifest = (): Manifest => ({
  version: 1,
  kind: "lesson80",
  film: FILM.id,
  estimated: true,
  lines: L80_LINES.map(estimateLine),
});

// Профиль поворота: плавный разгон, ровный ход, плавное торможение
// (как «медленно поверну глобус» рукой). acc — доля времени на разгон.
export const spinProfile = (u: number, acc = 0.24) => {
  const t = Math.max(0, Math.min(1, u));
  const v = 1 / (1 - acc);
  if (t < acc) return (v * t * t) / (2 * acc);
  if (t > 1 - acc) return 1 - (v * (1 - t) * (1 - t)) / (2 * acc);
  return v * (t - acc / 2);
};
// Обратная функция профиля (бисекция).
const invProfile = (y: number) => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < 48; i++) {
    const m = (a + b) / 2;
    if (spinProfile(m) < y) a = m;
    else b = m;
  }
  return (a + b) / 2;
};

const q = (t: number) => Math.round(t * FPS) / FPS;
const qUp = (t: number) => Math.ceil(t * FPS - 1e-6) / FPS;

export const buildTimeline = (m: Manifest): L80Timeline => {
  const cues: Cue[] = [];
  const spins: Spin[] = [];
  const pauses: { id: PauseId; after: number; from: number; to: number }[] = [];
  const marks: Record<string, Span> = {};
  const sound: Record<number, SoundSpan> = {};
  const sceneStart = new Map<L80SceneId, number>();
  let t = 0;
  let phi: number = L80_PHI.start;
  let scene: L80SceneId | null = null;
  let lastCue = null as Cue | null;
  let sunrise = 0;
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
      marks[b.label] = { from: t, to: t + b.sec };
      t += b.sec;
    } else if (b.kind === "line") {
      enterScene(lineById(b.id).scene);
      const c = pushCue(b.id, nextExact ? t : q(t));
      nextExact = false;
      t = c.to + (b.gapAfter ?? 0.5);
    } else if (b.kind === "pause") {
      const p = L80_PAUSES.find((x) => x.id === b.id)!;
      if (!lastCue || lastCue.id !== p.after) throw new Error(`Пауза ${b.id} должна идти сразу после реплики ${p.after}`);
      // ровно p.sec × FPS кадров от кадра полного окончания звука вопроса
      // (включая последнюю согласную) до кадра первого звука ответа
      const endFrame = Math.ceil(sound[lastCue.id].end * FPS - 1e-6);
      const from = endFrame / FPS;
      const to = from + p.sec;
      pauses.push({ id: b.id, after: p.after, from, to });
      marks[b.id] = { from, to };
      // следующая реплика: её первый звук — ровно в кадре конца паузы
      t = to + leadIn(p.after + 1);
      nextExact = true;
    } else if (b.kind === "spin") {
      const from = q(t);
      const spin: Spin = { from, to: from + b.sec, phiFrom: phi, phiTo: b.to, view: b.view, label: b.label };
      spins.push(spin);
      marks[b.label] = { from, to: spin.to };
      phi = b.to;
      t = spin.to;
    } else if (b.kind === "spinSync") {
      const from = q(t);
      const spin: Spin = { from, to: from + b.sec, phiFrom: phi, phiTo: b.to, view: "side", label: b.label };
      spins.push(spin);
      marks[b.label] = { from, to: spin.to };
      // метка пересекает границу света: первый кадр, в котором φ ≥ cross
      const uc = invProfile((b.cross - phi) / (b.to - phi));
      const tc = qUp(from + uc * b.sec);
      sunrise = tc;
      enterScene(lineById(b.syncLine).scene);
      // первый звук реплики («В-от…») — ровно в кадре пересечения границы
      const c = pushCue(b.syncLine, tc + leadIn(b.syncLine));
      phi = b.to;
      t = Math.max(spin.to, c.to + 0.5);
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
  return { cues, scenes, durationSec, durationInFrames, spins, pauses, marks, sunrise, sceneOf, sound };
};

// Азимут метки (градусы, непрерывный, не свёрнутый) в момент sec.
export const phiAt = (tl: L80Timeline, sec: number): number => {
  let phi: number = L80_PHI.start;
  for (const s of tl.spins) {
    if (sec >= s.to) phi = s.phiTo;
    else if (sec >= s.from) return s.phiFrom + (s.phiTo - s.phiFrom) * spinProfile((sec - s.from) / (s.to - s.from));
    else break;
  }
  return phi;
};

// Идёт ли поворот в момент sec (для звука и руки учителя).
export const spinAt = (tl: L80Timeline, sec: number): Spin | null => tl.spins.find((s) => sec >= s.from && sec < s.to) ?? null;

export const cueById = (tl: L80Timeline, id: number): Cue => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id} на шкале`);
  return c;
};

// Проверки шкалы: 44 реплики по порядку без наложений; четыре паузы ровно
// 180/150/150/180 кадров; угол неподвижен на P1; реплика 19 начинается в
// кадре входа метки в свет; длительность в допуске; 3 с после последней реплики.
export const checkTimeline = (tl: L80Timeline): string[] => {
  const p: string[] = [];
  if (tl.cues.length !== 44) p.push(`реплик на шкале ${tl.cues.length}, нужно 44`);
  tl.cues.forEach((c, i) => {
    if (c.id !== i + 1) p.push(`реплика №${c.id} стоит на месте ${i + 1}`);
    const n = tl.cues[i + 1];
    if (n && n.from < c.to + 0.25) p.push(`реплики ${c.id} и ${n.id} слишком близко (${(n.from - c.to).toFixed(2)} с)`);
    if (c.audioFrom < 0) p.push(`${c.id}: файл начинается раньше 0 с`);
    if (c.audioFrom + c.durationSec > tl.durationSec) p.push(`${c.id}: аудио выходит за конец фильма`);
  });
  for (const ps of L80_PAUSES) {
    const a = cueById(tl, ps.after);
    const b = cueById(tl, ps.after + 1);
    // по звуку: от кадра полного окончания вопроса до кадра первого звука ответа
    const frames = Math.round(tl.sound[b.id].start * FPS) - Math.ceil(tl.sound[a.id].end * FPS - 1e-6);
    if (frames !== ps.sec * FPS) p.push(`пауза ${ps.id}: ${frames} кадров вместо ${ps.sec * FPS}`);
    if (tl.sound[a.id].end > tl.pauses.find((x) => x.id === ps.id)!.from + 1e-6) p.push(`пауза ${ps.id}: звук вопроса заходит в паузу`);
    // во время паузы нет поворота
    for (let f = Math.ceil(a.to * FPS); f <= Math.round(b.from * FPS); f += 5) {
      if (Math.abs(phiAt(tl, f / FPS) - phiAt(tl, a.to)) > 1e-9) {
        p.push(`пауза ${ps.id}: глобус движется`);
        break;
      }
    }
  }
  const f19 = Math.round(tl.sound[19].start * FPS);
  if (Math.abs(tl.sound[19].start - tl.sunrise) > 1 / FPS + 1e-6) p.push("реплика 19 не привязана к входу метки в свет");
  if (!(phiAt(tl, f19 / FPS) >= L80_PHI.sunrise && phiAt(tl, (f19 - 1) / FPS) < L80_PHI.sunrise)) p.push("вход метки в свет не совпадает с началом реплики 19");
  // ночь перед репликой 25 и на P2; свет в конце сцены 2
  const night = (phi: number) => Math.cos((phi * Math.PI) / 180) < 0;
  if (!night(phiAt(tl, cueById(tl, 25).from))) p.push("перед репликой 25 метка не в тени");
  if (!night(phiAt(tl, cueById(tl, 34).to + 1))) p.push("на P2 метка не в тени");
  if (!night(phiAt(tl, cueById(tl, 14).from))) p.push("перед репликой 14 метка не в тени");
  if (night(phiAt(tl, cueById(tl, 11).from))) p.push("перед репликой 11 метка не освещена");
  if (night(phiAt(tl, cueById(tl, 20).from))) p.push("на реплике 20 метка не освещена");
  if (tl.durationSec < FILM.minSec || tl.durationSec > FILM.maxSec) p.push(`длительность ${tl.durationSec.toFixed(1)} с вне допуска ${FILM.minSec}–${FILM.maxSec} с`);
  const last = tl.cues[tl.cues.length - 1];
  if (last && tl.durationSec - last.to < 3) p.push("после последней реплики меньше 3 с");
  if (tl.cues[0] && tl.cues[0].from < 3) p.push("первая реплика раньше 3 с");
  return p;
};
