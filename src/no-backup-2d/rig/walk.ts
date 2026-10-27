import type { Build } from "./looks.ts";
import type { FootLocal } from "./pose.ts";
import { amountAt, dirAt, footWorld, trackOf, trackSample, type GaitPlace } from "./gait.ts";
import { lerp, soften } from "./motion.ts";

export const walkAt = (place: (t: number) => GaitPlace, from: number, f: number, b: Build, face: (t: number) => number = () => 0) => {
  const P = place(f);
  const k = P.h / 1000;
  const track = trackOf(place, from, Math.max(from, f) + 50, b.stride);
  const phase = trackSample(track.phase, from, f);
  const amtAt = (t: number) => amountAt(place, t);
  const dirFn = (t: number) => dirAt(place, t);
  const walkAmt = soften(amtAt, f, 2);
  const walkDir = soften(dirFn, f, 3);
  // Стопы стоя — по ширине таза. В ходьбе боком к зрителю эта ширина
  // уходит в глубину кадра, а не растягивает шаг по горизонтали.
  const stand = (side: -1 | 1, t: number) => ({ x: side * (b.hipJointX + 8) * 0.85 * (1 - 0.6 * Math.abs(dirFn(t)) * amtAt(t)), y: -14 });
  const feet = ([-1, 1] as const).map(side => {
    const w = footWorld(place, track, f, side, b.stride, stand);
    return { x: (w.x - P.x) / k, y: (w.y - P.y - w.lift) / k, roll: w.roll };
  }) as unknown as readonly [FootLocal, FootLocal];
  const faceEff = (t: number) => lerp(face(t), dirFn(t) * 0.85, amtAt(t));
  return { phase, walkAmt, walkDir, feet, faceEff };
};
