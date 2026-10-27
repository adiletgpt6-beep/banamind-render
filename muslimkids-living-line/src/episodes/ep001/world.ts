// Episode 001 — the world in which the line travels.
//
// One continuous world (no cuts): the planet sits at the origin; the
// sunrise happens on its top edge, the mountains, cloud, seed and tree live
// on its upper-left surface, the constellations in the sky above it, the
// ornament and the boy's hill further "down" the canvas. The camera
// flies between these places.

import { deg, polar, rotate, v, type Vec } from "../../utils/geometry.ts";

export const FPS = 30;
export const DURATION = 1800;

/** Scene table (frames). */
export const SCENES = [
  { id: "s1", from: 0, to: 180, title: "Первая загадка" },
  { id: "s2", from: 180, to: 420, title: "Секрет дня и ночи" },
  { id: "s3", from: 420, to: 690, title: "Путешествие по миру" },
  { id: "s4", from: 690, to: 990, title: "Маленькое чудо" },
  { id: "s5", from: 990, to: 1320, title: "Знамения" },
  { id: "s6", from: 1320, to: 1620, title: "Главная мысль" },
  { id: "s7", from: 1620, to: 1800, title: "Вопрос ребёнку" },
];

// ── Planet ────────────────────────────────────────────────────────────────
export const E: Vec = v(0, 0);
export const R = 300;

/** Horizon of the first scene: from x = -215 to x = 110 on the planet top. */
export const HZ_LEFT_X = -215;
export const HZ_RIGHT_X = 110;
export const angleAtX = (x: number): number => Math.atan2(-Math.sqrt(R * R - x * x), x);
export const HZ_A0 = angleAtX(HZ_LEFT_X);
export const HZ_A1 = angleAtX(HZ_RIGHT_X);

/** Axis tilt (screen) and viewing elevation of the globe. */
export const TILT = deg(23.4);
export const ELEV = deg(14);

/** Spin of the globe (radians) — starts in scene 2 and never stops. */
export const SPIN0 = deg(-56);
export const SPIN_START = 250;
export const SPIN_SPEED = deg(0.36); // per frame
export const spinAt = (f: number): number => {
  const t = f - SPIN_START;
  if (t <= 0) return SPIN0;
  const ramp = 24; // ease-in so the planet starts turning softly
  const eased = t < ramp ? (t * t) / (2 * ramp) : t - ramp / 2;
  return SPIN0 + SPIN_SPEED * eased;
};

/** Orthographic projection of lon/lat (degrees) at frame f. z > 0 = visible. */
export const project = (lon: number, lat: number, f: number, radius = R): { p: Vec; z: number } => {
  const la = deg(lat);
  const lo = deg(lon) + spinAt(f);
  const x = Math.cos(la) * Math.sin(lo);
  const y = -Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  const y1 = y * Math.cos(ELEV) + z * Math.sin(ELEV);
  const z1 = -y * Math.sin(ELEV) + z * Math.cos(ELEV);
  const r = rotate(v(x, y1), TILT);
  return { p: v(E.x + r.x * radius, E.y + r.y * radius), z: z1 };
};

/** Projected point, with far-side points folded onto the limb. */
export const projectFolded = (lon: number, lat: number, f: number, radius = R): Vec => {
  const { p, z } = project(lon, lat, f, radius);
  if (z >= 0) return p;
  const d = Math.hypot(p.x - E.x, p.y - E.y) || 1;
  return v(E.x + ((p.x - E.x) / d) * radius, E.y + ((p.y - E.y) / d) * radius);
};

/** Pole positions (axis drawn a little beyond the surface). */
export const axisPoint = (north: boolean, ext = 1.17): Vec => {
  const y = north ? -1 : 1;
  const y1 = y * Math.cos(ELEV);
  const r = rotate(v(0, y1 * ext), TILT);
  return v(E.x + r.x * R, E.y + r.y * R);
};

/** Stylised continents (lon, lat in degrees). */
export const CONTINENTS: { id: string; pts: [number, number][] }[] = [
  {
    id: "afro-eurasia",
    pts: [
      [-10, 36], [-4, 43], [2, 50], [12, 56], [28, 60], [40, 52], [33, 40], [35, 31],
      [43, 13], [51, 11], [41, -12], [34, -26], [20, -34], [13, -18], [9, 4], [-8, 5],
      [-17, 15], [-16, 23], [-10, 30],
    ],
  },
  {
    id: "americas",
    pts: [
      [-125, 49], [-102, 60], [-80, 62], [-62, 50], [-77, 33], [-82, 25], [-97, 19],
      [-84, 11], [-77, 8], [-68, 11], [-50, 0], [-36, -7], [-41, -22], [-57, -37],
      [-68, -53], [-74, -42], [-71, -18], [-81, -4], [-92, 14], [-106, 21], [-118, 33],
    ],
  },
  {
    id: "asia",
    pts: [
      [48, 46], [62, 56], [90, 68], [126, 66], [148, 56], [140, 44], [126, 38], [121, 28],
      [108, 19], [101, 7], [94, 19], [80, 9], [72, 21], [60, 25], [50, 32],
    ],
  },
];

/** The "you are here" marker that travels from day into night. */
export const MARKER = { lon: 18, lat: 8 };

// ── Sunrise (scene 1) ─────────────────────────────────────────────────────
export const SUN1_R = 34;
export const SUN1_X = 0;
export const sun1Y = (f: number): number => {
  const t = Math.min(1, Math.max(0, (f - 100) / 40));
  const e = t * t * (3 - 2 * t);
  return -320 + (-372 + 320) * e;
};
export const MOON_C: Vec = v(0, -372);
export const SHADOW_C: Vec = v(-17, -378);
export const SHADOW_R = 31;

// ── The sun of scene 2 (light from the left) ─────────────────────────────
export const SUN2_C: Vec = v(-470, -70);
export const SUN2_R = 56;

// ── Surface frame of scenes 3–4 (upper-left of the planet, lit side) ──────
export const SURF_A = deg(-125);
/** Local (u along the surface → right, v up / outward) → world. */
export const surf = (u: number, h: number): Vec => polar(E, R + h, SURF_A + u / R);
/** Camera rotation that makes the local horizon level at u. */
export const levelRot = (u: number): number => -Math.PI / 2 - (SURF_A + u / R);

export const TREE_U = -95;

// ── Space (scene 5) ───────────────────────────────────────────────────────
export const ORBIT_R = 462;

// ── Ornament (scene 6) ────────────────────────────────────────────────────
export const ORN_C: Vec = v(0, 1600);
export const ORN_R = 1100;
export const ORN_INNER = ORN_R * (Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8));

// ── Hill and boy (scene 7) ───────────────────────────────────────────────
export const HILL_TOP: Vec = v(0, 3240);
export const BOY_SCALE = 1;
