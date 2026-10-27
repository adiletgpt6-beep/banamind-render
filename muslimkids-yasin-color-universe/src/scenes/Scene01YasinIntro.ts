import { shape, seed, seeds5, swirl, question, ribbons } from "../shapes/catalog";
import { Scene, WHITE, C, heading } from "./types";

// 0–7 с: «Сколько удивительного может рассказать одна сура? Сегодня познакомимся с сурой „Ясин“».
export const scene01: Scene = {
  id: "s1", title: "Загадка суры Ясин", from: 0, to: 6.9,
  keyframes: [
    { at: 0, shape: shape("s1-seed", seed()), float: 0 },
    { at: 1.15, shape: shape("s1-seeds5", seeds5()), tr: { dur: 0.95, path: "curve", curl: 0.5, stagger: 0.4, staggerBy: "random" } },
    { at: 2.4, shape: shape("s1-swirl", swirl()), tr: { dur: 1.15, path: "spiral", turns: 0.35, stagger: 0.45, staggerBy: "radial", order: "angle", swell: 0.3 } },
    { at: 3.6, shape: shape("s1-question", question(540, 1010, 980, "question")), tr: { dur: 1.1, path: "spiral", turns: 0.2, order: "angle", stagger: 0.3, staggerBy: "radial", cy: 1000 } },
    { at: 5.4, shape: shape("s1-ribbons", ribbons([560, 630, 700], [1250, 1320, 1390])), tr: { dur: 1.3, path: "curve", curl: 0.35, swirl: 0, order: "y", stagger: 0.35, staggerBy: "-radial", cy: 980 } },
  ],
  texts: [
    heading(0.55, 4.7, ["Сколько ", { t: "удивительного", c: C.yellow }, "\nв одной суре?"], WHITE, 56),
    { from: 5.1, to: 6.85, y: 790, size: 130, font: "amiri", color: C.yellow, spans: ["يسٓ"], anim: "fade", dir: "rtl" },
    { from: 5.3, to: 6.85, y: 1000, size: 100, weight: 800, font: "unbounded", color: WHITE, spans: ["СУРА «ЯСИН»"], anim: "rise" },
    { from: 5.6, to: 6.85, y: 1115, size: 50, weight: 700, font: "manrope", color: C.cyan, spans: ["36-я сура Корана"], anim: "rise" },
  ],
  cues: [{ at: 0.05, kind: "sparkle", gain: 0.6 }, { at: 3.4, kind: "chime", gain: 0.5 }, { at: 5.3, kind: "chime", gain: 0.6 }],
};
