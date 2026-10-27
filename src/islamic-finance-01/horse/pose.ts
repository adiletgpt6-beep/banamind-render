// Pose model and keyframe tracks for the horse rig. Every channel is a
// number; tracks interpolate between keyframes with ease-in-out and hold the
// last value, so scenes can describe acting as a short list of beats.
import { Easing, interpolate } from "remotion";

export type Pose = {
  /** head yaw −1 (screen left) … 1 (screen right); features shift with parallax */
  headTurn: number;
  /** head roll in degrees */
  headTilt: number;
  /** head pitch: positive = chin down (nod) */
  headNod: number;
  /** gaze −1…1 */
  lookX: number;
  lookY: number;
  /** 0 open … 1 closed; negative widens the eyes */
  blink: number;
  /** eyebrow raise −1…1 */
  browL: number;
  browR: number;
  /** inner-end tilt in degrees (positive = inner end up → concerned / curious) */
  browTiltL: number;
  browTiltR: number;
  /** ear rotation in degrees (positive = outward/back) */
  earL: number;
  earR: number;
  /** mouth corners 0…1 */
  smile: number;
  /** manual mouth override (lip-sync normally drives these) */
  mouthOpen: number;
  mouthWide: number;
  mouthRound: number;
  teeth: number;
  tongue: number;
  /** body */
  lean: number; // degrees
  shift: number; // px sideways
  breath: number;
  /** arms: screen-left arm (armL) and screen-right arm (armR) */
  armLShoulder: number; // degrees, 0 = hanging down, positive = raised outward
  armLElbow: number; // degrees bend
  armLHoof: number; // degrees hoof rotation
  armLOpen: number; // 0 fist/relaxed … 1 open presenting
  armRShoulder: number;
  armRElbow: number;
  armRHoof: number;
  armROpen: number;
};

export const REST: Pose = {
  headTurn: 0,
  headTilt: 0,
  headNod: 0,
  lookX: 0,
  lookY: 0,
  blink: 0,
  browL: 0,
  browR: 0,
  browTiltL: 0,
  browTiltR: 0,
  earL: 0,
  earR: 0,
  smile: 0.35,
  mouthOpen: 0,
  mouthWide: 0,
  mouthRound: 0,
  teeth: 0,
  tongue: 0,
  lean: 0,
  shift: 0,
  breath: 0,
  armLShoulder: 8,
  armLElbow: 26,
  armLHoof: 0,
  armLOpen: 0,
  armRShoulder: 8,
  armRElbow: 26,
  armRHoof: 0,
  armROpen: 0,
};

export type PoseKey = keyof Pose;
export type PartialPose = Partial<Pose>;

// ---------------------------------------------------------------- expressions
export const EXPRESSION = {
  neutral: { browL: 0, browR: 0, browTiltL: 0, browTiltR: 0, smile: 0.35, earL: 0, earR: 0, blink: 0 },
  curious: { browL: 0.55, browR: 0.2, browTiltL: 8, browTiltR: -4, headTilt: -5, smile: 0.3, earL: -6, earR: 4 },
  surprised: { browL: 0.9, browR: 0.9, browTiltL: 0, browTiltR: 0, blink: -0.25, earL: -10, earR: -10, smile: 0.1, headTilt: 0 },
  happy: { browL: 0.25, browR: 0.25, browTiltL: 0, browTiltR: 0, smile: 1, earL: -4, earR: -4, blink: 0.12 },
  confident: { browL: 0.1, browR: 0.1, browTiltL: -3, browTiltR: -3, smile: 0.6, earL: -2, earR: -2, headNod: -2 },
  explaining: { browL: 0.35, browR: 0.35, browTiltL: 0, browTiltR: 0, smile: 0.45, earL: 0, earR: 0 },
  thinking: { browL: 0.1, browR: 0.5, browTiltL: -4, browTiltR: 6, smile: 0.2, headTilt: 4, lookX: 0.4, lookY: -0.4 },
} as const satisfies Record<string, PartialPose>;

// ---------------------------------------------------------------- gestures (arms)
export const GESTURE = {
  rest: { armLShoulder: 8, armLElbow: 26, armLHoof: 0, armLOpen: 0, armRShoulder: 8, armRElbow: 26, armRHoof: 0, armROpen: 0 },
  /** screen-left arm points to the left */
  pointLeft: { armLShoulder: 78, armLElbow: 8, armLHoof: -10, armLOpen: 0.2 },
  /** screen-right arm points to the right */
  pointRight: { armRShoulder: 78, armRElbow: 8, armRHoof: 10, armROpen: 0.2 },
  /** screen-left arm presents (open hoof) to the left */
  presentLeft: { armLShoulder: 52, armLElbow: 40, armLHoof: -30, armLOpen: 1 },
  presentRight: { armRShoulder: 52, armRElbow: 40, armRHoof: 30, armROpen: 1 },
  /** both hooves open — "here is the idea" */
  bothOpen: { armLShoulder: 34, armLElbow: 62, armLHoof: -40, armLOpen: 1, armRShoulder: 34, armRElbow: 62, armRHoof: 40, armROpen: 1 },
  /** one hoof raised beside the head — asking a question */
  raiseRight: { armRShoulder: 22, armRElbow: 118, armRHoof: 20, armROpen: 0.8 },
  raiseLeft: { armLShoulder: 22, armLElbow: 118, armLHoof: -20, armLOpen: 0.8 },
  /** wave: hoof up, open */
  waveRight: { armRShoulder: 40, armRElbow: 120, armRHoof: 0, armROpen: 1 },
  /** pointing up-right (toward a title above) */
  pointUpRight: { armRShoulder: 110, armRElbow: 30, armRHoof: -20, armROpen: 0.2 },
  pointUpLeft: { armLShoulder: 110, armLElbow: 30, armLHoof: 20, armLOpen: 0.2 },
  /** small emphasis: forearm raised, hoof closed */
  emphasisRight: { armRShoulder: 18, armRElbow: 95, armRHoof: 0, armROpen: 0 },
} as const satisfies Record<string, PartialPose>;

// ---------------------------------------------------------------- tracks
export type Beat = { readonly at: number; readonly pose: PartialPose; readonly dur?: number; readonly ease?: (t: number) => number };

const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const smooth = Easing.bezier(0.4, 0, 0.2, 1);

/**
 * Evaluates a track at `frame`. A beat at frame `at` moves each channel it
 * mentions from its current value to the new one over `dur` frames (default
 * 12), starting at `at`. Channels not mentioned hold. Deterministic.
 */
export const evalTrack = (beats: readonly Beat[], frame: number, base: Pose = REST): Pose => {
  const out: Pose = { ...base };
  const sorted = [...beats].sort((a, b) => a.at - b.at);
  // per channel: list of (at, dur, value, ease)
  const channels = new Map<PoseKey, { at: number; dur: number; value: number; ease: (t: number) => number }[]>();
  for (const b of sorted) {
    for (const k of Object.keys(b.pose) as PoseKey[]) {
      const v = b.pose[k];
      if (v === undefined) continue;
      if (!channels.has(k)) channels.set(k, []);
      channels.get(k)!.push({ at: b.at, dur: b.dur ?? 12, value: v, ease: b.ease ?? smooth });
    }
  }
  for (const [k, keys] of channels) {
    let value = base[k];
    for (const key of keys) {
      if (frame < key.at) break;
      const p = key.dur <= 0 ? 1 : interpolate(frame, [key.at, key.at + key.dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: key.ease });
      value = value + (key.value - value) * p;
    }
    out[k] = value;
  }
  return out;
};

export const mix = (a: Pose, b: PartialPose, t: number): Pose => {
  const out: Pose = { ...a };
  for (const k of Object.keys(b) as PoseKey[]) {
    const v = b[k];
    if (v !== undefined) out[k] = a[k] + (v - a[k]) * t;
  }
  return out;
};

export { easeInOut as beatEase };
