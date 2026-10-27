// Позы и «жизнь» ведущего: плавные переходы между позами, моргание по
// детерминированному расписанию, дыхание, мелкие жесты во время речи, рот —
// по фактическим таймингам букв озвучки (см. lipsync.ts).
import { interpolate, spring } from "remotion";
import type { ArmPose, HorseState } from "./Horse";

export type PoseName =
  | "idle"
  | "explain"
  | "question"
  | "pointRight"
  | "pointLeft"
  | "count"
  | "oops"
  | "summary"
  | "welcome"
  | "think";

type Pose = {
  armL: ArmPose;
  armR: ArmPose;
  headTilt: number;
  brow: number;
  browAsym: number;
  smile: number;
  gazeX: number;
  gazeY: number;
  ears: number;
};

const base: Pose = {
  armL: { shoulder: 8, fore: 4 },
  armR: { shoulder: 8, fore: 4 },
  headTilt: 0,
  brow: 0,
  browAsym: 0,
  smile: 0.35,
  gazeX: 0,
  gazeY: 0,
  ears: 0,
};

export const POSES: Record<PoseName, Pose> = {
  idle: base,
  explain: { ...base, armR: { shoulder: 28, fore: 112 }, headTilt: -3, brow: 0.2, smile: 0.45 },
  question: {
    ...base,
    armL: { shoulder: 34, fore: 118 },
    armR: { shoulder: 34, fore: 118 },
    headTilt: 7,
    brow: 0.45,
    browAsym: 1,
    smile: 0.1,
    ears: 8,
  },
  pointRight: { ...base, armR: { shoulder: 86, fore: 72 }, headTilt: 4, gazeX: 0.9, smile: 0.5, ears: -6 },
  pointLeft: { ...base, armL: { shoulder: 86, fore: 72 }, headTilt: -4, gazeX: -0.9, smile: 0.5, ears: 6 },
  count: { ...base, armR: { shoulder: 18, fore: 158 }, armL: { shoulder: 10, fore: -40 }, brow: 0.3, gazeX: 0.3, gazeY: -0.3, smile: 0.4 },
  oops: {
    ...base,
    armL: { shoulder: 26, fore: -150 },
    armR: { shoulder: 26, fore: -150 },
    headTilt: -6,
    brow: -0.2,
    browAsym: 0.6,
    smile: -0.6,
    ears: -18,
  },
  summary: { ...base, armL: { shoulder: 22, fore: -62 }, armR: { shoulder: 22, fore: -62 }, smile: 0.6, brow: 0.15 },
  welcome: { ...base, armL: { shoulder: 46, fore: 74 }, armR: { shoulder: 46, fore: 74 }, smile: 0.8, brow: 0.35, ears: 4 },
  think: { ...base, armR: { shoulder: 12, fore: -150 }, armL: { shoulder: 10, fore: -38 }, headTilt: 6, gazeX: 0.5, gazeY: -0.7, brow: 0.2, browAsym: 0.5, smile: 0.05 },
};

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  armL: { shoulder: mix(a.armL.shoulder, b.armL.shoulder, k), fore: mix(a.armL.fore, b.armL.fore, k) },
  armR: { shoulder: mix(a.armR.shoulder, b.armR.shoulder, k), fore: mix(a.armR.fore, b.armR.fore, k) },
  headTilt: mix(a.headTilt, b.headTilt, k),
  brow: mix(a.brow, b.brow, k),
  browAsym: mix(a.browAsym, b.browAsym, k),
  smile: mix(a.smile, b.smile, k),
  gazeX: mix(a.gazeX, b.gazeX, k),
  gazeY: mix(a.gazeY, b.gazeY, k),
  ears: mix(a.ears, b.ears, k),
});

export type PoseCue = { frame: number; pose: PoseName };

/** Поза в кадре: переход от предыдущей подсказки к следующей пружиной. */
export const poseAt = (cues: PoseCue[], frame: number, fps: number): Pose => {
  let cur: Pose = POSES.idle;
  for (const c of cues) {
    if (c.frame > frame) break;
    const k = spring({ frame: frame - c.frame, fps, config: { damping: 16, stiffness: 120, mass: 0.8 } });
    cur = mixPose(cur, POSES[c.pose], Math.min(1, k));
  }
  return cur;
};

// Детерминированное «случайное» число из целого.
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Моргание: каждые 2.6–5.0 с, длительность 5 кадров, иногда двойное. */
export const blinkAt = (frame: number, fps: number) => {
  let t = 0;
  let i = 0;
  while (t <= frame + 10) {
    const start = t;
    const d = frame - start;
    if (d >= 0 && d < 6) return [0, 0.7, 1, 0.8, 0.3, 0][d];
    if (hash(i) > 0.82) {
      const d2 = d - 8;
      if (d2 >= 0 && d2 < 6) return [0, 0.7, 1, 0.8, 0.3, 0][d2];
    }
    t += Math.round(fps * (2.6 + hash(i + 99) * 2.4));
    i++;
  }
  return 0;
};

export type Live = {
  frame: number;
  fps: number;
  pose: Pose;
  mouthOpen: number;
  mouthRound: number;
  speaking: number; // 0…1 сглаженная активность речи
  headTurn?: number;
};

export const makeState = ({ frame, fps, pose, mouthOpen, mouthRound, speaking, headTurn = 0 }: Live): HorseState => {
  const s = frame / fps;
  // мелкие «живые» колебания: дыхание, голова, жесты при речи
  const sway = Math.sin(s * 1.3) * 1.2 + Math.sin(s * 0.47 + 1) * 0.8;
  const beat = speaking * (Math.sin(s * 5.1) * 0.5 + Math.sin(s * 3.3 + 0.7) * 0.5);
  const nod = speaking * Math.max(0, Math.sin(s * 4.2)) * 3;
  const earTwitch = interpolate(Math.sin(s * 0.9 + 2) , [0.96, 1], [0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return {
    armL: { shoulder: pose.armL.shoulder + beat * 2.5, fore: pose.armL.fore + beat * 6 },
    armR: { shoulder: pose.armR.shoulder - beat * 2.5, fore: pose.armR.fore - beat * 7 },
    headTilt: pose.headTilt + sway,
    headTurn: headTurn + Math.sin(s * 0.6) * 0.12,
    headNod: nod,
    brow: pose.brow + speaking * Math.max(0, Math.sin(s * 2.3)) * 0.25,
    browAsym: pose.browAsym,
    blink: blinkAt(frame, fps),
    gazeX: pose.gazeX + Math.sin(s * 0.37) * 0.1,
    gazeY: pose.gazeY,
    mouthOpen,
    mouthRound,
    smile: pose.smile,
    earL: -pose.ears - earTwitch,
    earR: pose.ears + Math.sin(s * 0.8) * 2,
    breathe: (Math.sin(s * 1.6) + 1) / 2,
  };
};
