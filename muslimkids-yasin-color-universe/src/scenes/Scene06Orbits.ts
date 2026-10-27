import { shape, orbitParts, arcsParts, Orbit } from "../shapes/catalog";
import { STARS } from "./Scene05DayNight";
import { Scene, WHITE, MUTED_DARK } from "./types";

// 46–56 с: «В суре „Ясин“ сказано: „Каждый плывет по орбите“. Посмотри, как удивительно устроено небесное движение».
// Схематическая инфографика, а не модель Солнечной системы.
const T = -0.18;
const O3: Orbit[] = [
  { rx: 200, ry: 84, tilt: T, speed: 0.7, phase: 0.6, body: 26, ring: "ring1", bodyGrad: "sun" },
  { rx: 300, ry: 126, tilt: T, speed: 0.5, phase: 2.6, body: 34, ring: "ring2", bodyGrad: "heart" },
  { rx: 400, ry: 168, tilt: T, speed: 0.36, phase: 4.6, body: 24, ring: "ring3", bodyGrad: "land" },
];
const O5: Orbit[] = [
  { rx: 150, ry: 66, tilt: T, speed: 0.8, phase: 0.6, body: 20, ring: "ring1", bodyGrad: "sun" },
  { rx: 230, ry: 100, tilt: T, speed: 0.6, phase: 2.0, body: 28, ring: "ring2", bodyGrad: "heart" },
  { rx: 310, ry: 136, tilt: T, speed: 0.46, phase: 3.6, body: 22, ring: "ring3", bodyGrad: "land" },
  { rx: 390, ry: 172, tilt: T, speed: 0.36, phase: 5.0, body: 30, ring: "ring1", bodyGrad: "grapes" },
  { rx: 470, ry: 206, tilt: T, speed: 0.28, phase: 1.2, body: 22, ring: "ring2", bodyGrad: "rain" },
];

export const scene06: Scene = {
  id: "s6", title: "Движение по орбитам", from: 45.4, to: 55.6,
  keyframes: [
    { at: 47.0, shape: shape("s6-orbits", orbitParts(540, 1070, 85, O3), STARS()), tr: { dur: 1.55, path: "spiral", turns: 0.35, cx: 540, cy: 1070, match: [[[6], [7]]], order: "angle", stagger: 0.35, staggerBy: "radial" } },
    { at: 50.6, shape: shape("s6-wide", orbitParts(540, 1090, 70, O5), arcsParts(540, 1090), STARS()), tr: { dur: 1.6, path: "spiral", turns: 0.15, cx: 540, cy: 1090, match: [[[0], [0]], [[1, 2, 3], [1, 2, 3, 4, 5]], [[4, 5, 6], [6, 7, 8, 9, 10]], [[7], [15]]], order: "angle", stagger: 0.35, staggerBy: "radial" } },
  ],
  texts: [
    { from: 46.0, to: 55.4, y: 245, size: 40, weight: 700, font: "manrope", color: MUTED_DARK, spans: ["В суре «Ясин» сказано:"], anim: "fade" },
    // цитата — неподвижный цельный типографский слой (не из точек, не по словам)
    { from: 47.3, to: 55.4, y: 335, size: 62, weight: 800, font: "manrope", color: WHITE, spans: ["«Каждый плывет по орбите»"], anim: "fade" },
    { from: 47.6, to: 55.4, y: 440, size: 30, weight: 600, font: "manrope", color: MUTED_DARK, spans: ["Сура Ясин, 36:40 · часть аята\nПеревод смысла Э. Кулиева"], anim: "fade", lineHeight: 1.35 },
  ],
  cues: [{ at: 45.5, kind: "whoosh", dur: 1.6, gain: 0.5 }, { at: 49.0, kind: "whoosh", dur: 1.7, gain: 0.35 }],
};
