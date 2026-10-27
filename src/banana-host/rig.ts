// Позы и выражения банана. Углы рук: 0° — рука висит вниз, 90° — в сторону
// от тела, 180° — вверх; отрицательные — к телу/через грудь. Второй угол —
// поворот предплечья относительно плеча. Всё интерполируется между позами.

export type ArmPose = { a: number; e: number; hand?: "open" | "point" | "fist" };
export type Pose = { l: ArmPose; r: ArmPose; lean: number; hop?: number };

export const POSES = {
  idle: { l: { a: 14, e: 18 }, r: { a: 14, e: 18 }, lean: 0 },
  wave: { l: { a: 14, e: 18 }, r: { a: 140, e: 30 }, lean: -2 },
  hello: { l: { a: 120, e: 25 }, r: { a: 140, e: 30 }, lean: 0, hop: 1 },
  point: { l: { a: 14, e: 18 }, r: { a: 82, e: 4, hand: "point" }, lean: 3 },
  pointLeft: { l: { a: 82, e: 4, hand: "point" }, r: { a: 14, e: 18 }, lean: -3 },
  pointUp: { l: { a: 14, e: 18 }, r: { a: 150, e: 18, hand: "point" }, lean: 1 },
  think: { l: { a: 20, e: -40 }, r: { a: 28, e: -165, hand: "fist" }, lean: -2 },
  open: { l: { a: 70, e: 35 }, r: { a: 70, e: 35 }, lean: 0 },
  present: { l: { a: 14, e: 18 }, r: { a: 55, e: 60 }, lean: 2 },
  presentLeft: { l: { a: 55, e: 60 }, r: { a: 14, e: 18 }, lean: -2 },
  shrug: { l: { a: 60, e: 95 }, r: { a: 60, e: 95 }, lean: 0 },
  cheer: { l: { a: 155, e: 10, hand: "fist" }, r: { a: 155, e: 10, hand: "fist" }, lean: 0, hop: 1 },
  hush: { l: { a: 10, e: -120 }, r: { a: 10, e: -120 }, lean: 0 },
  count: { l: { a: 14, e: 18 }, r: { a: 35, e: 120, hand: "point" }, lean: 1 },
  ask: { l: { a: 30, e: 70 }, r: { a: 120, e: 40 }, lean: 2 },
  heart: { l: { a: 25, e: -110 }, r: { a: 25, e: -110 }, lean: 0 },
  shock: { l: { a: 128, e: -78, hand: "open" }, r: { a: 128, e: -78, hand: "open" }, lean: -3, hop: 1 },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

export type Face = {
  brow: number; // подъём бровей −1…1
  tilt: number; // наклон бровей (+ — удивлённо-домиком, − — нахмуренно)
  eye: number; // раскрытие глаз 0.6…1.3
  smile: number; // улыбка рта −1…1
  lookX: number;
  lookY: number;
  cheek: number;
};

export const MOODS = {
  happy: { brow: 0.15, tilt: 0.1, eye: 1, smile: 0.8, lookX: 0, lookY: 0, cheek: 0.45 },
  calm: { brow: 0, tilt: 0.1, eye: 0.95, smile: 0.45, lookX: 0, lookY: 0, cheek: 0.3 },
  wonder: { brow: 0.7, tilt: 0.45, eye: 1.2, smile: 0.25, lookX: 0, lookY: -0.2, cheek: 0.3 },
  think: { brow: 0.35, tilt: -0.25, eye: 0.9, smile: 0.05, lookX: 0.5, lookY: -0.6, cheek: 0.2 },
  confused: { brow: 0.3, tilt: 0.6, eye: 1.05, smile: -0.35, lookX: -0.3, lookY: 0, cheek: 0.15 },
  serious: { brow: -0.15, tilt: -0.1, eye: 0.95, smile: 0.1, lookX: 0, lookY: 0, cheek: 0.15 },
  joy: { brow: 0.45, tilt: 0.25, eye: 1.1, smile: 1, lookX: 0, lookY: -0.1, cheek: 0.6 },
  shock: { brow: 0.95, tilt: 0.55, eye: 1.32, smile: -0.05, lookX: -0.4, lookY: 0, cheek: 0.35 },
  lookBoard: { brow: 0.2, tilt: 0.1, eye: 1, smile: 0.4, lookX: 0.9, lookY: -0.1, cheek: 0.3 },
} satisfies Record<string, Face>;

export type MoodName = keyof typeof MOODS;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  l: { a: lerp(a.l.a, b.l.a, k), e: lerp(a.l.e, b.l.e, k), hand: k < 0.5 ? a.l.hand : b.l.hand },
  r: { a: lerp(a.r.a, b.r.a, k), e: lerp(a.r.e, b.r.e, k), hand: k < 0.5 ? a.r.hand : b.r.hand },
  lean: lerp(a.lean, b.lean, k),
  hop: lerp(a.hop ?? 0, b.hop ?? 0, k),
});

export const mixFace = (a: Face, b: Face, k: number): Face => {
  const o = {} as Face;
  (Object.keys(a) as (keyof Face)[]).forEach((key) => (o[key] = lerp(a[key], b[key], k)));
  return o;
};
