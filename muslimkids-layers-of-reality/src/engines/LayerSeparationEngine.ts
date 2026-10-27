// LayerSeparationEngine — per-layer exploded-view state as a pure function of
// time. Every layer has a base pose (assembled) and an exploded pose; a model
// owns a list of explode "cycles" (separate → hold/inspect → reassemble).
// Nothing depends on previous frames: frame N is always rendered identically.
import * as THREE from "three";
import { clamp01, easeInOutCubic, easeSettle, lerp } from "../utils/math";

export type LayerState =
  | "ASSEMBLED"
  | "SEPARATING"
  | "EXPLODED"
  | "INSPECTING"
  | "REASSEMBLING"
  | "COMPLETE";

/** Brief §13: layer types A–F. */
export type LayerKind =
  | "SOLID" // A — rock strata
  | "SHELL" // B — translucent shell (atmosphere)
  | "SURFACE" // C — outer surface (leaf skin, terrain skin)
  | "INTERNAL" // D — internal structure (tissue, veins)
  | "CUTAWAY" // E — volumetric section (Earth wedge)
  | "ENVIRONMENT"; // F — spatial environment layers

export type Vec3 = [number, number, number];

export interface LayerSpec {
  id: string;
  kind: LayerKind;
  label?: string;
  /** Translation in the model's local space when fully exploded. */
  offset: Vec3;
  /** Extra Euler rotation (radians) when exploded. */
  rotation?: Vec3;
  /** Uniform scale when exploded (shells expand). */
  scale?: number;
  /** Sideways bulge of the trajectory (keeps paths from crossing). */
  arc?: Vec3;
  /** Separation order (0 = first). */
  order: number;
  /** Reassembly order (0 = first). Defaults to reverse separation order. */
  reorder?: number;
  /** Material opacity when exploded (1 = unchanged). */
  explodedOpacity?: number;
  /** How far this layer travels in a cycle with amplitude < 1. */
  weight?: number;
}

export interface ExplodeCycle {
  /** Seconds. */
  separateStart: number;
  separateDuration: number;
  stagger: number;
  /** Inspection window start (camera studies the exploded model). */
  inspectStart?: number;
  reassembleStart: number;
  reassembleDuration: number;
  reassembleStagger: number;
  /** 0..1 — fraction of the full exploded offset used in this cycle. */
  amplitude?: number;
  /** Per-layer travel weights for this cycle (e.g. only 2–3 layers move). */
  weights?: Record<string, number>;
}

export interface LayerPose {
  progress: number;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  opacity: number;
}

const ID = new THREE.Quaternion();

export const layerProgress = (
  spec: LayerSpec,
  layerCount: number,
  cycles: ExplodeCycle[],
  t: number,
): number => {
  let p = 0;
  for (const c of cycles) {
    if (t < c.separateStart) continue;
    const s0 = c.separateStart + spec.order * c.stagger;
    const sep = easeInOutCubic(clamp01((t - s0) / c.separateDuration));
    const ro = spec.reorder ?? layerCount - 1 - spec.order;
    const r0 = c.reassembleStart + ro * c.reassembleStagger;
    const back = easeSettle(clamp01((t - r0) / c.reassembleDuration));
    const amp = (c.amplitude ?? 1) * (c.weights?.[spec.id] ?? spec.weight ?? 1);
    p = Math.max(p, sep * (1 - back) * amp);
  }
  return p;
};

export const modelState = (
  layers: LayerSpec[],
  cycles: ExplodeCycle[],
  t: number,
): LayerState => {
  let seen = false;
  for (const c of cycles) {
    if (t < c.separateStart) continue;
    seen = true;
    const sepEnd =
      c.separateStart + (layers.length - 1) * c.stagger + c.separateDuration;
    const reEnd =
      c.reassembleStart +
      (layers.length - 1) * c.reassembleStagger +
      c.reassembleDuration;
    if (t < sepEnd) return "SEPARATING";
    if (t < c.reassembleStart)
      return c.inspectStart !== undefined && t >= c.inspectStart
        ? "INSPECTING"
        : "EXPLODED";
    if (t < reEnd) return "REASSEMBLING";
  }
  return seen ? "COMPLETE" : "ASSEMBLED";
};

/** Pose of a layer at progress p: eased translation along a gentle arc,
 *  quaternion slerp for rotation, uniform scale lerp. */
export const poseAt = (spec: LayerSpec, p: number): LayerPose => {
  const bulge = Math.sin(Math.PI * Math.min(p, 1));
  const a = spec.arc ?? [0, 0, 0];
  const position = new THREE.Vector3(
    spec.offset[0] * p + a[0] * bulge,
    spec.offset[1] * p + a[1] * bulge,
    spec.offset[2] * p + a[2] * bulge,
  );
  const r = spec.rotation ?? [0, 0, 0];
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2]));
  const quaternion = ID.clone().slerp(q, p);
  return {
    progress: p,
    position,
    quaternion,
    scale: lerp(1, spec.scale ?? 1, p),
    opacity: lerp(1, spec.explodedOpacity ?? 1, p),
  };
};

export const layerPose = (
  spec: LayerSpec,
  layers: LayerSpec[],
  cycles: ExplodeCycle[],
  t: number,
) => poseAt(spec, layerProgress(spec, layers.length, cycles, t));
