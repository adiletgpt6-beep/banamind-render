import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import timingJson from "./timing.json";

// Шрифты (OFL, public/voicestudio-demo/fonts/OFL-*.txt) лежат в репозитории,
// рендер не зависит от Google Fonts.
const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const CYRILLIC = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";

const FONT_FILES: Array<[family: string, file: string, weights: number[]]> = [
  ["VS Display", "unbounded", [800, 900]],
  ["VS Text", "manrope", [600, 700, 800]],
  ["VS Mono", "jetbrains-mono", [500, 700]],
];

for (const [family, file, weights] of FONT_FILES) {
  for (const weight of weights) {
    for (const [subset, range] of [
      ["latin", LATIN],
      ["cyrillic", CYRILLIC],
    ] as const) {
      loadFont({
        family,
        url: staticFile(`voicestudio-demo/fonts/${file}-${subset}-${weight}-normal.woff2`),
        weight: String(weight),
        unicodeRange: range,
        format: "woff2",
      });
    }
  }
}

export const FONT = {
  display: '"VS Display", sans-serif',
  text: '"VS Text", sans-serif',
  mono: '"VS Mono", monospace',
};

export const C = {
  bg: "#F4F6FB",
  navy: "#0E1B3D",
  ink: "#26345C",
  muted: "#A9B2C8",
  soft: "#E7EBF5",
  white: "#FFFFFF",
  orange: "#FF6A2B",
  orange2: "#FF9F43",
  blue: "#2F9BFF",
  cyan: "#3CD3F5",
  violet: "#7A5CFF",
  pink: "#F25FA8",
  green: "#1FBF86",
};

export const GRAD = {
  orange: `linear-gradient(135deg, ${C.orange2} 0%, ${C.orange} 100%)`,
  blue: `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 100%)`,
  violet: `linear-gradient(135deg, #A08BFF 0%, ${C.violet} 100%)`,
  brand: `linear-gradient(120deg, ${C.orange} 0%, ${C.pink} 45%, ${C.violet} 100%)`,
};

export const SHADOW = {
  card: "0 24px 60px rgba(30, 44, 90, 0.12), 0 4px 14px rgba(30, 44, 90, 0.06)",
  lift: "0 30px 80px rgba(30, 44, 90, 0.18), 0 6px 18px rgba(30, 44, 90, 0.08)",
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Безопасные зоны Reels: шапка и нижний интерфейс приложения.
export const SAFE = { top: 200, bottom: 1560, side: 60 };

export type Word = { w: string; s: number; e: number };
export type SceneTiming = {
  id: SceneId;
  text: string;
  keywords: string[];
  speechStart: number;
  speechEnd: number;
  words: Word[];
};
export type SceneId = "hook" | "intro" | "voices" | "mcp" | "uses" | "finale";
export type Timing = {
  fps: number;
  durationInFrames: number;
  estimated: boolean;
  speechEnd: number;
  scenes: SceneTiming[];
  envelope: number[];
};

export const TIMING = timingJson as unknown as Timing;

export const sceneTiming = (id: SceneId): SceneTiming => {
  const s = TIMING.scenes.find((x) => x.id === id);
  if (!s) {
    throw new Error(`Нет тайминга для сцены ${id}`);
  }
  return s;
};

/** Кадр, на котором начинается слово (поиск по подстроке, без регистра). */
export const wordFrame = (id: SceneId, needle: string, fallbackSec = 0): number => {
  const s = sceneTiming(id);
  const n = needle.toLowerCase();
  const w = s.words.find((x) => x.w.toLowerCase().includes(n));
  return Math.round((w ? w.s : s.speechStart + fallbackSec) * FPS);
};

/** Видимые границы сцен: начинаются чуть раньше реплики. */
export const SCENE_LEAD = 0.25;
export const sceneWindows = () => {
  const ids = TIMING.scenes.map((s) => s.id);
  return ids.map((id, i) => {
    const s = TIMING.scenes[i];
    const from = i === 0 ? 0 : Math.round((s.speechStart - SCENE_LEAD) * FPS);
    const to =
      i === ids.length - 1
        ? TIMING.durationInFrames
        : Math.round((TIMING.scenes[i + 1].speechStart - SCENE_LEAD) * FPS);
    return { id, from, to, duration: to - from };
  });
};

/** Громкость речи (0..1) на кадре, сглаженная. */
export const levelAt = (frame: number): number => {
  const env = TIMING.envelope;
  if (!env.length) {
    return 0;
  }
  let sum = 0;
  let n = 0;
  for (let k = -1; k <= 1; k++) {
    const v = env[frame + k];
    if (v !== undefined) {
      sum += v;
      n++;
    }
  }
  return n ? sum / n : 0;
};
