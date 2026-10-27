import { shape, earthParts, sunParts, crescentParts, palmParts, grapesParts, sproutParts, printsParts, starsParts, ribbons } from "../shapes/catalog";
import { ellipsePoints } from "../shapes/draw";
import { Scene, WHITE, C } from "./types";

// 73–80 с: «Какое знамение удивило тебя больше всего? Поделись своим ответом и прочитай суру „Ясин“!»
const avoidUniverse = (x: number, y: number) =>
  Math.hypot(x - 540, y - 1000) < 300 || Math.hypot(x - 250, y - 560) < 170 || Math.hypot(x - 840, y - 560) < 150 ||
  (x < 400 && y > 1030) || (x > 720 && y > 1040 && y < 1450) || (y > 1380 && x > 330 && x < 800);

export const scene09: Scene = {
  id: "s9", title: "Большая цветная вселенная", from: 71.9, to: 80,
  keyframes: [
    // GRAND COLOR UNIVERSE: потоки точек одновременно собирают Землю, Солнце, Луну, пальму, виноград, росток и следы
    {
      at: 73.5,
      shape: shape(
        "s9-universe",
        earthParts(540, 1000, 175),
        [{ points: ellipsePoints(540, 1000, 270, 72, -0.25, 18), r: 3.2, rJitter: 0, grad: "ring2", map: "angle", noise: 0, alpha: 0.75, shimmer: 0.1 }],
        sunParts(250, 560, 80, 8.5),
        crescentParts(840, 560, 105, 8.5),
        palmParts(205, 1530, 0.52, 7.5),
        grapesParts(865, 1170, 0.5, 7.5),
        sproutParts(445, 1580, 0.55),
        printsParts([[630, 1555, 110, -0.12, -1], [720, 1455, 110, 0.1, 1]], 7.5),
        starsParts(909, 85, 330, 1650, avoidUniverse),
      ),
      tr: { dur: 1.6, path: "scatter", spread: 560, cy: 1000, order: "hilbert", stagger: 0.4, staggerBy: "random", swell: 0.3 },
    },
    // все изображения сливаются в одну большую разноцветную композицию вокруг названия
    {
      at: 77.0,
      shape: shape("s9-final", ribbons([440, 512, 584], [1270, 1342, 1414], 22, true), starsParts(77, 46, 330, 1640, (x, y) => (y > 380 && y < 640) || (y > 700 && y < 1160) || (y > 1220 && y < 1640))),
      tr: { dur: 1.3, path: "spiral", turns: 0.22, cx: 540, cy: 960, order: "angle", stagger: 0.35, staggerBy: "radial" },
    },
  ],
  texts: [
    { from: 76.55, to: 80.5, y: 800, size: 100, weight: 800, font: "unbounded", color: WHITE, spans: ["СУРА «ЯСИН»"], anim: "rise" },
    { from: 76.85, to: 80.5, y: 920, size: 46, weight: 700, font: "manrope", color: C.cyan, spans: ["36-я сура • 83 аята"], anim: "rise" },
    { from: 77.2, to: 80.5, y: 1060, size: 44, weight: 800, font: "unbounded", color: C.yellow, spans: ["А ЧТО УДИВИЛО ТЕБЯ?"], anim: "rise" },
    { from: 77.85, to: 80.5, y: 1545, size: 58, weight: 800, font: "unbounded", color: WHITE, spans: ["MUSLIM ", { t: "KIDS", c: C.yellow }], anim: "scale", letterSpacing: 6 },
  ],
  cues: [{ at: 72.1, kind: "whoosh", dur: 1.9, gain: 0.6 }, { at: 73.7, kind: "sparkle", gain: 0.6 }, { at: 75.7, kind: "whoosh", dur: 1.3, gain: 0.45 }, { at: 77.0, kind: "chime", gain: 0.6 }],
};
