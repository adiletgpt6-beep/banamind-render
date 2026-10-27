import { shape, printsParts, Print, handParts, heartParts, checkParts } from "../shapes/catalog";
import { Scene, NAVY, C, heading, ayahCaption } from "./types";

// 56–65 с: «Но сура напоминает и о нас. Наши поступки не исчезают бесследно. Что мы оставим после себя?»
const P: Print[] = [
  [460, 1440, 235, -0.12, -1],
  [640, 1225, 235, 0.08, 1],
  [455, 1005, 235, -0.12, -1],
  [640, 785, 235, 0.08, 1],
  [465, 575, 215, -0.1, -1],
];

export const scene07: Scene = {
  id: "s7", title: "Наши поступки", from: 55.6, to: 64.6,
  keyframes: [
    { at: 56.95, shape: shape("s7-p1", printsParts(P.slice(0, 1))), tr: { dur: 1.35, path: "fall", lift: 200, order: "y", stagger: 0.35, staggerBy: "y" } },
    { at: 57.65, shape: shape("s7-p2", printsParts(P.slice(0, 2))), tr: { dur: 0.6, path: "direct", emerge: "center", cx: P[1][0], cy: P[1][1], match: [[[0], [0]]], stagger: 0.4, staggerBy: "random", ease: "out" } },
    { at: 58.35, shape: shape("s7-p3", printsParts(P.slice(0, 3))), tr: { dur: 0.6, path: "direct", emerge: "center", cx: P[2][0], cy: P[2][1], match: [[[0, 1], [0, 1]]], stagger: 0.4, staggerBy: "random", ease: "out" } },
    { at: 59.1, shape: shape("s7-p5", printsParts(P)), tr: { dur: 0.7, path: "direct", emerge: "center", cx: 552, cy: 680, match: [[[0, 1, 2], [0, 1, 2]]], stagger: 0.4, staggerBy: "random", ease: "out" } },
    { at: 61.55, shape: shape("s7-deeds", handParts(250, 800, 0.85), heartParts(250, 1085, 230, 8.5), checkParts(250, 1375, 100)), tr: { dur: 1.3, path: "curve", curl: 0.35, order: "y", stagger: 0.3, staggerBy: "y" } },
  ],
  texts: [
    heading(56.2, 58.25, ["Сура напоминает ", { t: "о нас", c: C.pink }], NAVY, 52),
    heading(58.3, 61.05, [{ t: "НАШИ", c: C.pink }, " ПОСТУПКИ"], NAVY),
    heading(61.1, 64.5, ["Что мы оставим\n", { t: "после себя?", c: C.purple }], NAVY, 52, 290),
    ayahCaption(58.4, 64.5, "Сура Ясин, 36:12", false),
    { from: 61.9, to: 64.5, x: 410, y: 790, size: 44, weight: 800, font: "unbounded", color: C.orange, spans: ["ПОМОЩЬ"], anim: "rise", align: "left" },
    { from: 62.05, to: 64.5, x: 410, y: 1085, size: 44, weight: 800, font: "unbounded", color: C.pink, spans: ["ДОБРО"], anim: "rise", align: "left" },
    { from: 62.2, to: 64.5, x: 410, y: 1375, size: 40, weight: 800, font: "unbounded", color: C.blue, spans: ["ОТВЕТСТВЕННОСТЬ"], anim: "rise", align: "left" },
  ],
  cues: [{ at: 56.95, kind: "sparkle", gain: 0.35 }, { at: 57.65, kind: "sparkle", gain: 0.35 }, { at: 58.35, kind: "sparkle", gain: 0.35 }, { at: 59.1, kind: "sparkle", gain: 0.4 }],
};
