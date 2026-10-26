// Движение 3D-урока: кто куда смотрит, уровень речи, моргание, камера,
// проход и посадка учителя. Всё — функции от номера кадра.
import { Easing, interpolate } from "remotion";
import { LESSON_ENVELOPE } from "./envelope";
import { LESSON_SPEECH, LESSON_VIDEO, type LessonSpeaker } from "./script";

export type V3 = readonly [number, number, number];
const FPS = LESSON_VIDEO.fps;
export const s = (sec: number) => Math.round(sec * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

// ---------- Расстановка (метры; стол в начале координат) ----------
export type KidSpec = {
  readonly id: string;
  readonly pos: V3;
  readonly face: V3; // куда повёрнут корпус
  readonly skin: string;
  readonly hair: string;
  readonly shirt: string;
  readonly pants: string;
  readonly girl?: boolean;
  readonly seed: number;
};

export const faceAngle = (d: V3) => Math.atan2(d[0], d[2]);

export const GIRL: KidSpec = { id: "girl", pos: [0.85, 0, 0.5], face: [-0.55, 0, 1], skin: "#f3cba6", hair: "#5b3a22", shirt: "#f5c531", pants: "#6d6a63", girl: true, seed: 3 };
export const BOY: KidSpec = { id: "boy", pos: [1.75, 0, -0.2], face: [-0.7, 0, 1], skin: "#e9b98e", hair: "#2a1d14", shirt: "#8ec6f2", pants: "#4a5d8a", seed: 5 };
export const KIDS: readonly KidSpec[] = [
  GIRL,
  BOY,
  { id: "k3", pos: [2.75, 0, 0.95], face: [-0.8, 0, 1], skin: "#c98d5e", hair: "#1f1510", shirt: "#5fbf6a", pants: "#4f5a6e", seed: 7 },
  { id: "k4", pos: [2.95, 0, -1.0], face: [-0.8, 0, 1], skin: "#f1c6a3", hair: "#6a4a2e", shirt: "#f08a8a", pants: "#5c6b86", seed: 11 },
  { id: "k5", pos: [3.7, 0, 0.1], face: [-0.8, 0, 1], skin: "#e4b48d", hair: "#2b1c13", shirt: "#9b7fd6", pants: "#4e5b73", seed: 13 },
  { id: "k6", pos: [3.95, 0, 1.45], face: [-0.8, 0, 1], skin: "#f2c9a5", hair: "#4a2f1c", shirt: "#4f7fd0", pants: "#55606f", seed: 17, girl: true },
  { id: "k7", pos: [4.5, 0, -1.05], face: [-0.8, 0, 1], skin: "#d49a6d", hair: "#1c120c", shirt: "#f2a640", pants: "#596377", seed: 19 },
  { id: "k8", pos: [4.8, 0, 0.9], face: [-0.8, 0, 1], skin: "#efc3a0", hair: "#3b2619", shirt: "#49bfb0", pants: "#4c5a70", seed: 23 },
  { id: "k9", pos: [2.3, 0, -1.9], face: [-0.8, 0, 1], skin: "#e7b58b", hair: "#2a1a10", shirt: "#e26a6a", pants: "#4b5a73", seed: 29, girl: true },
];

export const HOUSE_POINT: V3 = [0, 0.6, 0];
const TEACHER_SEAT: V3 = [-1.15, 0, 0.1];
const TEACHER_START: V3 = [-2.9, 0, 1.6];

// ---------- Речь и мимика ----------
export const envelope = (frame: number) => LESSON_ENVELOPE[Math.min(LESSON_ENVELOPE.length - 1, Math.max(0, Math.round(frame)))] ?? 0;

/** Уровень речи персонажа в кадре: огибающая дорожки, если сейчас его реплика. */
export const speech = (frame: number, who: LessonSpeaker) => {
  const t = frame / FPS;
  const seg = LESSON_SPEECH.find((x) => x.who === who && t >= x.from - 0.05 && t <= x.to + 0.05);
  if (!seg) return 0;
  const e = (envelope(frame - 1) + 2 * envelope(frame) + envelope(frame + 1)) / 4;
  return Math.min(1, e * 1.15);
};

/** Моргание: 0 — глаза открыты, 1 — закрыты. Период свой у каждого. */
export const blink = (frame: number, seed: number) => {
  const period = 96 + ((seed * 37) % 61);
  const t = (frame + seed * 53) % period;
  return t > 6 ? 0 : Math.sin((t / 6) * Math.PI);
};

// ---------- Учитель: проход и посадка ----------
/** 1 — стоит, 0 — сидит на коленях. */
export const teacherStand = (frame: number) => interpolate(frame, [s(14.95), s(15.55)], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
/** Фаза шага (0 — стоит на месте). */
export const teacherWalk = (frame: number) => interpolate(frame, [s(14.05), s(14.95)], [0, 1], clamp);
export const teacherPos = (frame: number): V3 => lerp3(TEACHER_START, TEACHER_SEAT, smooth(teacherWalk(frame)));
export const teacherFace = (frame: number): V3 => {
  const w = smooth(teacherWalk(frame));
  const dir: V3 = [TEACHER_SEAT[0] - TEACHER_START[0], 0, TEACHER_SEAT[2] - TEACHER_START[2]];
  return lerp3(dir, [1, 0, 0.05], Math.max(0, (w - 0.75) * 4));
};
/** Жест правой рукой к домику во время объяснения. */
export const teacherGesture = (frame: number) => interpolate(frame, [s(15.7), s(16.5), s(19.1), s(19.6)], [0, 1, 1, 0.55], { ...clamp, easing: Easing.inOut(Easing.quad) });

// ---------- Куда все смотрят ----------
type FocusKey = "house" | "girl" | "boy" | "teacher" | "viewer";
// говорящий ребёнок смотрит в сторону зрителя (туда, где стоит камера)
const VIEWER: V3 = [0.5, 0.95, 2.3];
const FOCUS: readonly { at: number; key: FocusKey }[] = [
  { at: 0, key: "house" },
  { at: 7.9, key: "house" },
  { at: 8.35, key: "girl" },
  { at: 11.7, key: "girl" },
  { at: 12.1, key: "boy" },
  { at: 14.0, key: "boy" },
  { at: 14.5, key: "teacher" },
  { at: 16.0, key: "teacher" },
  { at: 16.6, key: "house" },
  { at: 17.8, key: "house" },
  { at: 18.3, key: "teacher" },
  { at: 99, key: "teacher" },
];
const headOf = (key: FocusKey, frame: number): V3 => {
  if (key === "girl") return [GIRL.pos[0], 0.8, GIRL.pos[2]];
  if (key === "boy") return [BOY.pos[0], 0.8, BOY.pos[2]];
  if (key === "viewer") return VIEWER;
  if (key === "teacher") {
    const p = teacherPos(frame);
    return [p[0], lerp(1.1, 1.65, teacherStand(frame)), p[2]];
  }
  return HOUSE_POINT;
};
/** Точка внимания персонажа `self` (говорящий не смотрит сам на себя). */
export const focus = (frame: number, self: FocusKey | null): V3 => {
  const t = frame / FPS;
  let i = 0;
  while (i < FOCUS.length - 2 && FOCUS[i + 1].at <= t) i++;
  const a = FOCUS[i];
  const b = FOCUS[i + 1];
  const own = (k: FocusKey): FocusKey => (k === self ? (self === "teacher" ? "girl" : "viewer") : k);
  const pa = headOf(own(a.key), frame);
  const pb = headOf(own(b.key), frame);
  const u = b.at === a.at ? 1 : smooth((t - a.at) / (b.at - a.at));
  // переход начинается в момент b.at и занимает 0,4 с — поэтому точка
  // "держится" до b.at: ключи-дубли в FOCUS задают паузы
  return u >= 1 ? pb : lerp3(pa, pb, u);
};

/** Поворот головы (yaw, pitch) в локальных осях персонажа. */
export const headTurn = (from: V3, rotY: number, target: V3, maxYaw = 1.0) => {
  const dx = target[0] - from[0];
  const dy = target[1] - from[1];
  const dz = target[2] - from[2];
  const lx = Math.cos(rotY) * dx - Math.sin(rotY) * dz;
  const lz = Math.sin(rotY) * dx + Math.cos(rotY) * dz;
  const yaw = Math.max(-maxYaw, Math.min(maxYaw, Math.atan2(lx, lz)));
  const pitch = Math.max(-0.5, Math.min(0.45, -Math.atan2(dy, Math.hypot(lx, lz))));
  return { yaw, pitch };
};

// ---------- Камера ----------
export type Cam = { readonly pos: V3; readonly look: V3; readonly fov: number };
type Shot = { readonly from: number; readonly moveIn: number; readonly cam: (t: number) => Cam };
const orbit = (angle: number, radius: number, height: number): V3 => [radius * Math.sin(angle), height, radius * Math.cos(angle)];
const ease = (t: number) => interpolate(t, [0, 1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });

const SHOTS: readonly Shot[] = [
  {
    from: s(0),
    moveIn: 0,
    // облёт домика: от крупного плана к общему, дети раскрываются на фоне
    cam: (t) => ({ pos: orbit(lerp(-0.12, -0.72, t), lerp(1.55, 2.35, t), lerp(0.72, 1.0, t)), look: [lerp(0, 0.35, t), lerp(0.55, 0.52, t), lerp(0, -0.05, t)], fov: lerp(30, 34, t) }),
  },
  {
    from: s(6.3),
    moveIn: 0,
    cam: (t) => ({ pos: lerp3([0.1, 0.98, 2.35], [0.3, 0.9, 2.05], t), look: lerp3([0.9, 0.7, 0.4], [0.9, 0.76, 0.42], t), fov: 34 }),
  },
  {
    from: s(11.4),
    moveIn: 22,
    cam: (t) => ({ pos: lerp3([0.85, 1.0, 2.45], [1.05, 0.97, 2.3], t), look: [1.75, 0.78, -0.2], fov: 34 }),
  },
  {
    from: s(14.1),
    moveIn: 0,
    cam: (t) => ({ pos: lerp3([-1.3, 1.75, 4.9], [-1.0, 1.55, 4.3], t), look: lerp3([-0.9, 0.75, 0.3], [-0.8, 0.65, 0.1], t), fov: 42 }),
  },
  {
    from: s(15.6),
    moveIn: 20,
    cam: (t) => ({ pos: lerp3([-0.05, 1.02, 2.55], [-0.4, 0.92, 2.25], t), look: lerp3([-0.75, 0.75, 0.05], [-0.68, 0.72, 0.05], t), fov: 34 }),
  },
  {
    from: s(19.6),
    moveIn: 0,
    cam: (t) => ({ pos: lerp3([2.3, 2.8, 5.8], [2.1, 2.65, 5.4], t), look: [1.0, 0.45, -0.6], fov: 48 }),
  },
];

const blendCam = (a: Cam, b: Cam, u: number): Cam => ({ pos: lerp3(a.pos, b.pos, u), look: lerp3(a.look, b.look, u), fov: lerp(a.fov, b.fov, u) });

export const cameraAt = (frame: number, totalFrames: number): Cam => {
  let i = 0;
  while (i < SHOTS.length - 1 && SHOTS[i + 1].from <= frame) i++;
  const shot = SHOTS[i];
  const end = i < SHOTS.length - 1 ? SHOTS[i + 1].from : totalFrames;
  const t = ease((frame - shot.from) / Math.max(1, end - shot.from));
  let cam = shot.cam(t);
  if (shot.moveIn > 0 && i > 0 && frame < shot.from + shot.moveIn) {
    const prev = SHOTS[i - 1].cam(1);
    cam = blendCam(prev, cam, ease((frame - shot.from) / shot.moveIn));
  }
  // лёгкое «дыхание» камеры, чтобы кадр не был мёртвым
  const w = 0.004;
  return {
    pos: [cam.pos[0] + w * Math.sin(frame * 0.061), cam.pos[1] + w * Math.sin(frame * 0.047 + 1.3), cam.pos[2]],
    look: [cam.look[0] + w * 0.6 * Math.sin(frame * 0.053 + 2.1), cam.look[1] + w * 0.6 * Math.sin(frame * 0.071), cam.look[2]],
    fov: cam.fov,
  };
};
