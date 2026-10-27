import { Easing, interpolate, spring } from "remotion";

export const C = {
  bg: "#F5F9FE",
  paper: "#FFFFFF",
  navy: "#14285A",
  navySoft: "#3A4F80",
  muted: "#7A8AAE",
  yellow: "#FFC90E",
  yellowSoft: "#FFF4C2",
  blue: "#4C8DF0",
  green: "#38B98A",
  coral: "#FF8D6B",
  street: "#FFFFFF",
  block: "#E3ECF7",
  park: "#D5F0E1",
  mountain: "#C9D7EA",
  shadow: "rgba(20, 40, 90, 0.16)",
  belt: "#2B3A66",
} as const;

// Цвета четырёх пазлов-домов: 1–3 совместимы, 4-й — другой маршрут.
export const PIECE = [C.yellow, C.blue, C.green, C.coral] as const;

export const FPS = 30;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const sec = (s: number) => Math.round(s * FPS);

/** 0→1 плавно между a и b (с). */
export const ease = (frame: number, a: number, b: number) =>
  interpolate(frame, [sec(a), sec(b)], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });

/** Мягкая пружина с началом в момент at (с). */
export const pop = (frame: number, at: number, damping = 14) =>
  spring({ frame: frame - sec(at), fps: FPS, config: { damping, stiffness: 120, mass: 0.9 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Безопасные области Reels (1080×1920). */
export const SAFE = { top: 250, bottom: 400, left: 90, right: 150 } as const;
