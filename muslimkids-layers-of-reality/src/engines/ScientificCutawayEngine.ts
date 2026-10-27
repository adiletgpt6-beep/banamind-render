// ScientificCutawayEngine — the educational models behind every cutaway.
// Each object has its own structure: Earth (spherical shells), mountains
// (folded rock strata), leaf (plant tissues). Sizes are schematic and are
// labelled on screen as such ("Схема. Не в масштабе", "Увеличенная схема").
import { clamp01, fbm2, lerp, mix3, smoothstep } from "../utils/math";
import { hexToRgb } from "./LayerGeometryEngine";

type RGB = [number, number, number];

// ---------------------------------------------------------------- Earth
/** Radii relative to the planet radius. Mantle/core are close to reality;
 *  the crust is exaggerated (real ≈ 0.005 R) so a child can see it. */
export const EARTH_LAYERS = [
  { id: "innerCore", r0: 0, r1: 0.22, colors: ["#FFF3CF", "#F3C766"] },
  { id: "outerCore", r0: 0.22, r1: 0.55, colors: ["#F2B24E", "#D98A34"] },
  { id: "mantle", r0: 0.55, r1: 0.86, colors: ["#C9693A", "#93512F"] },
  { id: "crust", r0: 0.86, r1: 1.0, colors: ["#7B5B40", "#B08D66"] },
] as const;
export type EarthLayerId = (typeof EARTH_LAYERS)[number]["id"];

const earthRGB = EARTH_LAYERS.map((l) => [hexToRgb(l.colors[0]), hexToRgb(l.colors[1])]);

/** Section-face colour: smooth gradient inside a layer, darker rim at each
 *  boundary so the shells read clearly; faint convection banding in the
 *  (solid, slowly flowing) mantle — not a lava ocean. */
export const earthSectionColor = (r: number, a: number): RGB => {
  const i = EARTH_LAYERS.findIndex((l) => r <= l.r1 + 1e-6);
  const L = EARTH_LAYERS[Math.max(0, i)];
  const k = clamp01((r - L.r0) / (L.r1 - L.r0));
  let c = mix3(earthRGB[Math.max(0, i)][0], earthRGB[Math.max(0, i)][1], k);
  const edge = Math.min(k, 1 - k) * (L.r1 - L.r0);
  const rim = L.id === "innerCore" ? 1 : 0.82 + 0.18 * smoothstep(0, 0.018, edge);
  let band = 1;
  if (L.id === "mantle") band = 0.94 + 0.06 * Math.sin(a * 7 + r * 26);
  if (L.id === "crust") band = 0.92 + 0.08 * Math.sin(r * 160 + a * 3);
  c = c.map((v) => v * rim * band) as RGB;
  return c;
};

export const EARTH_LABELS: { layer: EarthLayerId; text: string }[] = [
  { layer: "crust", text: "КОРА" },
  { layer: "mantle", text: "МАНТИЯ" },
  { layer: "outerCore", text: "ЯДРО" },
];

// ------------------------------------------------------------ Mountains
/** Block extents (model units, before MOUNTAIN.scale). */
export const BLOCK = { x0: -1.6, x1: 1.6, z0: -1.1, z1: 1.1, base: -0.85, cutZ: 0.28 };
const PEAKS = [
  { x: 0.12, z: 0.3, h: 1.0, r: 0.5 },
  { x: -0.98, z: -0.38, h: 0.8, r: 0.48 },
  { x: 1.05, z: -0.55, h: 0.78, r: 0.45 },
  { x: -0.25, z: -0.78, h: 0.68, r: 0.5 },
  { x: 0.92, z: 0.6, h: 0.5, r: 0.4 },
  { x: -1.2, z: 0.62, h: 0.42, r: 0.45 },
];
export const riverX = (z: number) => -0.5 + 0.2 * Math.sin(1.9 * z + 0.6);

export const terrainHeight = (x: number, z: number) => {
  let h = 0.1;
  for (const p of PEAKS) {
    const d2 = ((x - p.x) ** 2 + (z - p.z) ** 2) / (p.r * p.r);
    h = Math.max(h, p.h * Math.exp(-d2 * 1.1) + 0.06);
  }
  // ridged detail grows with altitude
  const ridge = 1 - Math.abs(fbm2(x * 2.6 + 3, z * 2.6 - 1, 4, 5) * 2 - 1);
  h += (ridge - 0.5) * 0.16 * smoothstep(0.15, 0.7, h);
  h += (fbm2(x * 6, z * 6, 3, 9) - 0.5) * 0.035;
  // river valley
  const v = Math.exp(-(((x - riverX(z)) / 0.26) ** 2));
  h = lerp(h, 0.045, 0.8 * v);
  return h;
};
export const isRiver = (x: number, z: number) => Math.abs(x - riverX(z)) < 0.045;

const fold = (x: number, z: number) =>
  0.15 * Math.sin(1.7 * x + 0.4) + 0.06 * Math.sin(3.3 * x - 1.2 * z) + 0.05 * z;
const lift = (x: number, z: number) => {
  // smoothed relief → anticline: folded rocks bulge up beneath the peaks
  let h = 0;
  for (const p of PEAKS) h = Math.max(h, p.h * Math.exp((-((x - p.x) ** 2 + (z - p.z) ** 2) / (p.r * p.r)) * 0.55));
  return h;
};
export const SKIN = 0.075; // soil / surface layer thickness

export const STRATA = [
  { id: "bedrock", label: "Гранит", color: "#56607A", b: (_x: number, _z: number) => BLOCK.base },
  { id: "slate", label: "Сланец", color: "#7D5C45", b: (x: number, z: number) => -0.56 + 0.6 * fold(x, z) + 0.22 * lift(x, z) },
  { id: "sandstone", label: "Песчаник", color: "#C9A162", b: (x: number, z: number) => -0.34 + 0.8 * fold(x, z) + 0.36 * lift(x, z) },
  { id: "limestone", label: "Известняк", color: "#DCD0B5", b: (x: number, z: number) => -0.14 + fold(x, z) + 0.5 * lift(x, z) },
  { id: "shale", label: "Глина", color: "#A5654A", b: (x: number, z: number) => 0.05 + 1.1 * fold(x, z) + 0.6 * lift(x, z) },
] as const;

/** Bottom / top of stratum i, clipped under the soil skin. */
export const stratumBottom = (i: number, x: number, z: number) =>
  Math.min(STRATA[i].b(x, z), terrainHeight(x, z) - SKIN);
export const stratumTop = (i: number, x: number, z: number) =>
  i + 1 < STRATA.length ? stratumBottom(i + 1, x, z) : terrainHeight(x, z) - SKIN;

const strataRGB = STRATA.map((s) => hexToRgb(s.color));
/** Side-wall colour of a stratum: fine sedimentary bedding lines. */
export const strataSideColor = (i: number) => (x: number, y: number, z: number): RGB => {
  const n = fbm2(x * 9 + i * 3, y * 40, 3, 21 + i);
  const bed = 0.9 + 0.1 * Math.sin(y * 95 + n * 6 + x * 2);
  const c = strataRGB[i];
  return [c[0] * bed, c[1] * bed, c[2] * bed];
};

const G = {
  valley: hexToRgb("#3E9B6C"),
  meadow: hexToRgb("#6DBA7E"),
  rock: hexToRgb("#8C7660"),
  rockDark: hexToRgb("#6B5A4C"),
  snow: hexToRgb("#F7F5EF"),
  water: hexToRgb("#3FA9C4"),
  soil: hexToRgb("#6E5038"),
};
export const terrainTopColor = (x: number, z: number, y: number): RGB => {
  if (isRiver(x, z)) return G.water;
  const n = fbm2(x * 7, z * 7, 4, 2);
  const g = mix3(G.valley, G.meadow, clamp01(n * 1.3 - 0.1));
  const rockK = smoothstep(0.3, 0.55, y + (n - 0.5) * 0.16);
  let c = mix3(g, mix3(G.rock, G.rockDark, n), rockK);
  const snowK = smoothstep(0.6, 0.7, y + (n - 0.5) * 0.12);
  c = mix3(c, G.snow, snowK);
  return c;
};
export const soilSideColor = (_x: number, y: number, z: number): RGB => {
  const t = terrainHeight(_x, z);
  // thin green turf on top of brown soil
  return y > t - 0.018 ? G.valley : mix3(G.soil, G.rockDark, 0.3 + 0.2 * Math.sin(y * 120));
};

// ----------------------------------------------------------------- Leaf
/** Leaf outline: u ∈ [0,1] base→tip, v ∈ [0,1] edge→edge. Returns half-width. */
export const leafHalfWidth = (u: number) => {
  const body = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.85) * (1 - 0.18 * u);
  const serr = 1 + 0.025 * Math.sin(u * 70);
  return 0.56 * body * serr;
};
/** Leaf mid-surface in local space (x along midrib, z up = upper side). */
export const leafSurface = (u: number, v: number, t = 0): [number, number, number] => {
  const x = -1 + 2 * u;
  const w = leafHalfWidth(u);
  const s = v * 2 - 1;
  const y = s * w;
  const cup = 0.22 * s * s * w; // edges curl up
  const arch = -0.22 * (u - 0.45) ** 2 + 0.05;
  const wave = 0.02 * Math.sin(u * 9 + t * 1.6) * s;
  return [x, y, cup + arch + wave];
};

/** Upper side: semi-glossy green, slightly lighter along veins. */
export const veinField = (u: number, v: number) => {
  const s = v * 2 - 1;
  const mid = Math.exp(-((s / 0.035) ** 2));
  // 9 pairs of secondary veins, curving toward the tip
  const k = (((u * 9 - Math.abs(s) * 2.2) % 1) + 1) % 1;
  const sec = Math.exp(-(((k - 0.5) / 0.05) ** 2)) * smoothstep(0.05, 0.25, Math.abs(s)) * (u > 0.06 && u < 0.95 ? 1 : 0);
  return clamp01(mid + sec * 0.65);
};
