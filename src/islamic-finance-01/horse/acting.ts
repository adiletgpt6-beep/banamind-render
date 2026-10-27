// Procedural acting layers on top of the keyframed pose: deterministic blinks,
// breathing, speech-driven micro-nods and eyebrow lifts on emphasised words,
// and a little ear life. Everything is a pure function of the frame.
import { interpolate } from "remotion";
import type { If01Manifest } from "../narration";
import { IF01_LINES } from "../script";
import { envAt, type LipsyncData } from "./lipsync";
import type { Pose } from "./pose";

const FPS = 30;

// Blink schedule (seconds): natural spacing 2–4 s, plus blinks placed on
// scene cuts so they read as reactions. Fixed list → identical every render.
export const BLINKS = [0.9, 2.95, 4.6, 6.55, 8.2, 9.05, 11.3, 13.05, 15.1, 16.9, 18.6, 20.4, 22.05, 23.3, 24.55, 26.3, 27.55, 29.0];

const blinkAt = (frame: number): number => {
  const t = frame / FPS;
  let v = 0;
  for (const b of BLINKS) {
    const d = t - b;
    if (d < -0.02 || d > 0.2) continue;
    // close in 60 ms, hold 30 ms, open in 110 ms
    v = Math.max(v, interpolate(d, [-0.02, 0.05, 0.08, 0.19], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  return v;
};

/** Start frames of emphasised words (from the narration manifest). */
export const emphasisFrames = (m: If01Manifest): number[] => {
  const out: number[] = [];
  for (const line of m.lines) {
    const spec = IF01_LINES.find((l) => l.id === line.id);
    const emph = new Set((spec?.emphasis ?? []).map((w) => w.toLowerCase()));
    for (const w of line.words) if (emph.has(w.text.toLowerCase().replace(/[^a-z0-9'-]/g, ""))) out.push(Math.round(w.start * FPS));
  }
  return out;
};

export type ActingInput = { readonly lipsync: LipsyncData; readonly emphasis: readonly number[]; readonly speaking: boolean };

/** Adds blinks, breathing and speech micro-motion to a keyframed pose. */
export const applyActing = (pose: Pose, frame: number, input: ActingInput): Pose => {
  const out: Pose = { ...pose };
  // blink: keyframed widening (negative) still shows through
  const b = blinkAt(frame);
  out.blink = Math.max(pose.blink, b) * (1 - Math.max(0, -pose.blink) * 0.3) + (pose.blink < 0 ? pose.blink * (1 - b) : 0);
  // breathing: 3.4 s cycle
  out.breath = 0.5 + 0.5 * Math.sin((frame / FPS / 3.4) * Math.PI * 2);
  // speech energy → tiny nod and lift (low-passed envelope)
  const env = input.speaking ? (envAt(input.lipsync, frame) + envAt(input.lipsync, frame - 1) + envAt(input.lipsync, frame - 2)) / 3 : 0;
  out.headNod += env * 2.2;
  out.lookY += env * 0.03;
  // emphasised word: brows lift and head dips slightly, 14 frames
  for (const f0 of input.emphasis) {
    const d = frame - f0;
    if (d < -2 || d > 16) continue;
    const k = interpolate(d, [-2, 3, 8, 16], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    out.browL += 0.35 * k;
    out.browR += 0.35 * k;
    out.headNod += 2.5 * k;
    out.earL += -4 * k;
    out.earR += -4 * k;
  }
  // slow ear life (very small, ±2°)
  out.earL += Math.sin(frame / 37) * 1.5;
  out.earR += Math.sin(frame / 41 + 1.2) * 1.5;
  return out;
};
