// SceneTransitionEngine — builds the single continuous journey.
//
// Scenes never "cut". Each scene receives the JourneyBuilder in the state the
// previous scene left it (tip position, direction, frame) and continues from
// there. `travel()` creates a visible, eased flight of the tip to the next
// object (its tail retracts, so no clutter remains); `draw()` refuses a path
// that does not start under the tip. The result is guaranteed continuous.

import { Easing } from "remotion";
import {
  add,
  clamp,
  dist,
  norm,
  scale,
  sub,
  travelPath,
  type Vec,
} from "../utils/geometry.ts";
import { at, ease, type Stroke } from "./LivingLineEngine.ts";
import { pathEnd, pathStart, pointAt, samplePath } from "./PathSampler.ts";

export type Scene = { id: string; from: number; to: number; title: string };

export class JourneyBuilder {
  strokes: Stroke[] = [];
  frame: number;
  private last: Stroke | null = null;
  private startPos: Vec;
  private startDir: Vec;

  constructor(start: Vec, frame: number, dir: Vec = { x: 1, y: 0 }) {
    this.startPos = start;
    this.frame = frame;
    this.startDir = dir;
  }

  /** Tip position at frame f (follows a morphing / moving last stroke). */
  posAt(f: number): Vec {
    return this.last ? pathEnd(at(this.last.d, f)) : this.startPos;
  }

  dirAt(f: number): Vec {
    if (!this.last) return this.startDir;
    const smp = samplePath(at(this.last.d, f));
    return pointAt(smp, smp.length).t;
  }

  /** Tip position / direction at the current cursor frame. */
  get pos(): Vec {
    return this.posAt(this.frame);
  }

  get dir(): Vec {
    return this.dirAt(this.frame);
  }

  /** Draw a contour that must begin at the tip. Returns the stroke. */
  draw(
    id: string,
    d: Stroke["d"],
    frames: number,
    opts: Omit<Stroke, "id" | "d" | "from" | "to"> & { at?: number } = {},
  ): Stroke {
    const from = opts.at ?? this.frame;
    if (from < this.frame) throw new Error(`Journey: ${id} starts before the tip is free`);
    const to = from + frames;
    const startPath = at(d, from);
    const gap = dist(pathStart(startPath), this.posAt(from));
    if (gap > 0.75) {
      throw new Error(`Journey: ${id} starts ${gap.toFixed(1)} units away from the tip`);
    }
    const s: Stroke = { ...opts, id, d, from, to };
    this.strokes.push(s);
    this.last = s;
    this.frame = to;
    return s;
  }

  /** Eased flight of the tip to `target`, arriving along `inDir`. */
  travel(
    id: string,
    target: Vec,
    frames: number,
    opts: Omit<Stroke, "id" | "d" | "from" | "to" | "kind"> & {
      inDir?: Vec;
      bend?: number;
      at?: number;
    } = {},
  ): Stroke {
    const from = opts.at ?? this.frame;
    const p = this.posAt(from);
    const inDir = opts.inDir ?? norm(sub(target, p));
    const d = travelPath(p, target, this.dirAt(from), inDir, opts.bend ?? 0.42);
    return this.draw(id, d, frames, {
      kind: "travel",
      ease: ease.flow,
      trail: dist(p, target) * 0.45,
      ...opts,
    });
  }

  /** Aux contour (does not move the tip). */
  branch(id: string, d: Stroke["d"], from: number, frames: number, opts: Partial<Stroke> = {}): Stroke {
    const s: Stroke = { width: 4, glow: 0.4, ...opts, id, d, from, to: from + frames, kind: "branch" };
    this.strokes.push(s);
    return s;
  }

  wait(frames: number): this {
    this.frame += frames;
    return this;
  }

  /** Move the cursor to an absolute frame (the tip rests until then). */
  until(frame: number): this {
    this.frame = Math.max(this.frame, frame);
    return this;
  }

  /** Point a little ahead of the tip — handy for organic continuations. */
  ahead(k: number): Vec {
    return add(this.pos, scale(this.dir, k));
  }
}

/** Smooth 0→1→0 envelope used for labels, glows and environment blends. */
export const envelope = (f: number, a: number, b: number, c: number, d: number): number => {
  const e = Easing.inOut(Easing.sin);
  if (f <= a || f >= d) return 0;
  if (f < b) return e(clamp((f - a) / (b - a)));
  if (f <= c) return 1;
  return 1 - e(clamp((f - c) / (d - c)));
};

export const rise = (f: number, a: number, b: number, fn = Easing.inOut(Easing.sin)): number =>
  fn(clamp((f - a) / (b - a)));

export const sceneAt = (scenes: Scene[], f: number): Scene =>
  scenes.find((s) => f >= s.from && f < s.to) ?? scenes[scenes.length - 1];

export { dist };
