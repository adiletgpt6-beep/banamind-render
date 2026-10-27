// ExplodedViewController — how each model opens and closes. Different
// logic per object: Earth opens radially along the octant bisector
// (spherical logic), mountains slide out and stack their strata (geological
// logic), the leaf spreads its tissues along the leaf normal (anatomical).
import * as THREE from "three";
import { CUE } from "../compositions/cues";
import { EARTH } from "../compositions/layout";
import type { ExplodeCycle, LayerSpec, Vec3 } from "./LayerSeparationEngine";
import { STRATA } from "./ScientificCutawayEngine";

// ---------------------------------------------------------------- Earth
/** Octant window: φ ∈ [0, π/2], θ ∈ [0, π/2] (local); bisector direction. */
export const EARTH_WEDGE = { phiStart: 0, phiLength: Math.PI / 2 };
export const EARTH_BISECTOR = new THREE.Vector3(-1, 1, 1).normalize();
const b = (d: number): Vec3 => [EARTH_BISECTOR.x * d, EARTH_BISECTOR.y * d, EARTH_BISECTOR.z * d];

export const EARTH_SPECS: LayerSpec[] = [
  { id: "atmosphere", kind: "SHELL", offset: [0, 0, 0], scale: 1.12, order: 0, reorder: 4 },
  { id: "atmosphereWedge", kind: "SHELL", offset: b(1.6), scale: 1.12, order: 0, reorder: 4 },
  { id: "crust", kind: "CUTAWAY", label: "КОРА", offset: b(1.32), order: 1, reorder: 3 },
  { id: "mantle", kind: "CUTAWAY", label: "МАНТИЯ", offset: b(0.92), order: 2, reorder: 2 },
  { id: "outerCore", kind: "CUTAWAY", label: "ЯДРО", offset: b(0.58), order: 3, reorder: 1 },
  { id: "innerCore", kind: "CUTAWAY", offset: b(0.3), order: 4, reorder: 0 },
];

export const EARTH_CYCLES: ExplodeCycle[] = [
  // Scene 1 hook: the segment barely lifts on "Посмотри!"
  {
    separateStart: CUE.look, separateDuration: 0.9, stagger: 0.04,
    reassembleStart: 6.05, reassembleDuration: 0.75, reassembleStagger: 0.02,
    amplitude: 0.07,
  },
  // Scene 2: full layer reveal
  {
    separateStart: CUE.inside + 0.15, separateDuration: 1.3, stagger: 0.22,
    inspectStart: 12.2,
    reassembleStart: 13.0, reassembleDuration: 0.95, reassembleStagger: 0.15,
  },
  // Scene 5: grand composition (opens off-screen, closes on cue)
  {
    separateStart: 35.0, separateDuration: 1.4, stagger: 0.12,
    reassembleStart: 40.35, reassembleDuration: 1.5, reassembleStagger: 0.24,
  },
];

/** Earth spin (rad) — integral of a smooth rate curve, evaluated in closed
 *  form per frame (no state). Fast while explaining day/night, almost still
 *  while the layers are open. A constant phase brings Central Asia (Tian
 *  Shan) toward the camera for the dive into the mountains. */
const spinRate = (t: number) => {
  const k = (a: number, b: number) => THREE.MathUtils.smoothstep(t, a, b);
  let r = 0.22;
  r += 0.3 * k(6.2, 7.0) * (1 - k(9.4, 10.4)); // day/night demonstration
  r -= 0.2 * k(9.6, 10.6) * (1 - k(13.6, 14.4)); // almost still while open
  r -= 0.12 * k(34.5, 36) * (1 - k(41.5, 43)); // grand: slow
  r -= 0.1 * k(44, 45.5); // quote: very calm
  return r;
};
const SPIN_TABLE = (() => {
  const dt = 1 / 120;
  const out: number[] = [0];
  let a = 0;
  for (let i = 1; i <= 62 * 120; i++) {
    a += spinRate((i - 0.5) * dt) * dt;
    out.push(a);
  }
  return out;
})();
const rawSpin = (t: number) => {
  const x = Math.max(0, t) * 120;
  const i = Math.min(Math.floor(x), SPIN_TABLE.length - 2);
  return THREE.MathUtils.lerp(SPIN_TABLE[i], SPIN_TABLE[i + 1], x - i);
};

/** Local direction of a lon/lat point on the textured sphere for spin s. */
export const earthLocalDir = (lonDeg: number, latDeg: number, spin: number) => {
  const phi = (2 * Math.PI * (lonDeg + 180)) / 360 + spin;
  const th = THREE.MathUtils.degToRad(90 - latDeg);
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th));
};
export const EARTH_QUAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, EARTH.tilt));
export const TIAN_SHAN = { lon: 77, lat: 42 };
export const DIVE_TIME = 15.0;
/** Direction (world) from which the camera dives toward Tian Shan. */
export const DIVE_VIEW = new THREE.Vector3(0.28, 0.42, 1).normalize();

const SPIN_PHASE = (() => {
  let best = 0, bestDot = -2;
  for (let i = 0; i < 3600; i++) {
    const ph = (i / 3600) * Math.PI * 2;
    const d = earthLocalDir(TIAN_SHAN.lon, TIAN_SHAN.lat, rawSpin(DIVE_TIME) + ph).applyQuaternion(EARTH_QUAT);
    const dot = d.dot(DIVE_VIEW);
    if (dot > bestDot) { bestDot = dot; best = ph; }
  }
  return best;
})();
export const earthSpin = (t: number) => rawSpin(t) + SPIN_PHASE;
/** World position of a lon/lat point on the Earth surface at time t. */
export const earthSurfacePoint = (lon: number, lat: number, t: number, r = 1) =>
  earthLocalDir(lon, lat, earthSpin(t)).applyQuaternion(EARTH_QUAT).multiplyScalar(r * EARTH.radius).add(EARTH.position);

// ------------------------------------------------------------ Mountains
const GAP = 0.25;
/** Front chunk: slides forward out of the massif, strata stack upward,
 *  surface skin rises highest. Order: surface first, deepest rock last. */
export const MOUNTAIN_SPECS: LayerSpec[] = [
  ...STRATA.map((s, i): LayerSpec => ({
    id: s.id,
    kind: "SOLID",
    label: s.label,
    offset: [0, GAP * i, 0.62],
    arc: [0, 0.04, 0.12],
    order: STRATA.length - i,
  })),
  { id: "surface", kind: "SURFACE", offset: [0, GAP * STRATA.length + 0.28, 0.72], arc: [0, 0.1, 0.1], order: 0 },
];
export const MOUNTAIN_CYCLES: ExplodeCycle[] = [
  {
    separateStart: CUE.rocks + 0.2, separateDuration: 1.3, stagger: 0.24,
    inspectStart: 21.6,
    reassembleStart: 22.75, reassembleDuration: 1.0, reassembleStagger: 0.16,
  },
  {
    separateStart: 35.2, separateDuration: 1.3, stagger: 0.12,
    reassembleStart: 40.35, reassembleDuration: 1.5, reassembleStagger: 0.2,
  },
];

// ----------------------------------------------------------------- Leaf
export const LEAF_SPECS: LayerSpec[] = [
  { id: "upperEpidermis", kind: "SURFACE", label: "Верхняя кожица", offset: [0.04, 0.0, 0.66], order: 0, reorder: 4 },
  { id: "palisade", kind: "INTERNAL", offset: [0.02, 0.0, 0.32], order: 1, reorder: 3 },
  { id: "veins", kind: "INTERNAL", label: "ПРОЖИЛКИ", offset: [0, 0, 0.0], order: 2, reorder: 2 },
  { id: "spongy", kind: "INTERNAL", offset: [-0.02, 0.0, -0.32], order: 3, reorder: 1 },
  { id: "lowerEpidermis", kind: "SURFACE", offset: [-0.04, 0.0, -0.64], order: 4, reorder: 0 },
];
export const LEAF_CYCLES: ExplodeCycle[] = [
  {
    separateStart: CUE.veins - 0.1, separateDuration: 1.25, stagger: 0.14,
    inspectStart: 31.6,
    reassembleStart: 40.35, reassembleDuration: 1.5, reassembleStagger: 0.22,
  },
  // Scene 7: a short 3-layer reminder
  {
    separateStart: CUE.question + 1.3, separateDuration: 0.8, stagger: 0.08,
    reassembleStart: CUE.question + 2.65, reassembleDuration: 0.9, reassembleStagger: 0.08,
    amplitude: 0.7,
    weights: { upperEpidermis: 1, palisade: 0, veins: 0.5, spongy: 0, lowerEpidermis: 1 },
  },
];
/** X-ray: the opaque surface turns translucent before it separates. */
export const LEAF_XRAY = { start: CUE.veins - 0.9, end: CUE.veins - 0.15, back: [40.2, 41.6] as const };
