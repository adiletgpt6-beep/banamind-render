// Палитра и общие функции движения BG-042. Фирменный стиль: белый и светлый
// фон, ярко-жёлтые акценты, тёмно-синие надписи. Новости — «телевизионные»,
// но светлые: тёмно-синие плашки с жёлтым, без красных тревожных цветов.
import { Easing, interpolate, spring } from "remotion";
export { anticipate, clamp as clamp01, easeIn, easeInOut, easeOut, hash01, keys, keysV, lerp, smoothstep, soften } from "../../two-schedules-2d/rig/motion";

export const C = {
  white: "#FFFFFF",
  bg: "#F4F8FD",
  wall: "#EEF3FA",
  wallShade: "#E1E9F4",
  navy: "#14285A",
  navyDeep: "#0E1D45",
  navySoft: "#3A4F80",
  muted: "#7A8AAE",
  yellow: "#FFC90E",
  yellowDeep: "#F2B000",
  yellowSoft: "#FFF4C2",
  sky: "#CFE4FA",
  blue: "#4C8DF0",
  teal: "#3FA99A",
  green: "#38B98A",
  coral: "#FF8D6B",
  wood: "#E7C9A0",
  woodTop: "#F1DBBB",
  woodEdge: "#C9A276",
  woodFront: "#D9B78C",
  glass: "rgba(214, 232, 248, 0.55)",
  shadow: "rgba(20, 40, 90, 0.16)",
  shadowDeep: "rgba(14, 29, 69, 0.28)",
  screen: "#0F1E46",
} as const;

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const sec = (s: number) => Math.round(s * FPS);

/** 0→1 плавно между кадрами a и b. */
export const ramp = (f: number, a: number, b: number, easing: (t: number) => number = Easing.bezier(0.33, 0, 0.2, 1)) =>
  interpolate(f, [a, Math.max(a + 1, b)], [0, 1], { ...clamp, easing });

/** Мягкая пружина с началом в кадре at. */
export const pop = (f: number, at: number, damping = 14, stiffness = 120) =>
  spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 0.9 } });

/** Безопасные области Reels (1080×1920): шапка, правые кнопки, нижняя подпись. */
export const SAFE = { top: 250, bottom: 400, left: 90, right: 150 } as const;
/** Верх полосы титров (выше нижней безопасной зоны). */
export const SUB_TOP = 1392;

/** Лёгкое «дыхание» камеры (детерминированно, ±px). */
export const drift = (f: number, amp = 4, seed = 1) => ({
  x: Math.sin((f + seed * 31) / 47) * amp,
  y: Math.cos((f + seed * 17) / 59) * amp * 0.7,
});
