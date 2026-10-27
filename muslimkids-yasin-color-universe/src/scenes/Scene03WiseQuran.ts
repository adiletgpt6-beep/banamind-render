import { shape, bookParts, heartParts, printsParts } from "../shapes/catalog";
import { Scene, WHITE, C, heading, ayahCaption } from "./types";

// 15–24 с: «Сура начинается напоминанием о мудром Коране. Она говорит о вере и о наших поступках».
export const scene03: Scene = {
  id: "s3", title: "Мудрый Коран", from: 14.6, to: 23.8,
  keyframes: [
    // COLOR WAVE: книга перекрашивается волной слева направо и вырастает
    { at: 15.9, shape: shape("s3-book", bookParts(540, 1000, 900, 580, "bookDark")), tr: { dur: 1.2, path: "wave", lift: 36, order: "hilbert", stagger: 0.6, staggerBy: "x", swell: 0.15 } },
    { at: 19.35, shape: shape("s3-heart", heartParts(540, 1010, 680)), tr: { dur: 1.1, path: "spiral", turns: 0.18, order: "angle", stagger: 0.25, staggerBy: "radial", cy: 1000 } },
    {
      at: 20.65,
      shape: shape("s3-steps", printsParts([[430, 1360, 250, -0.15, -1], [640, 1130, 250, 0.1, 1], [440, 900, 250, -0.15, -1], [650, 670, 250, 0.1, 1]])),
      tr: { dur: 1.0, path: "curve", curl: 0.3, order: "y", stagger: 0.35, staggerBy: "-y" },
    },
    {
      at: 22.35,
      shape: shape("s3-summary", bookParts(205, 1010, 300, 210, "bookDark", 8), heartParts(540, 1010, 230, 8), printsParts([[835, 1050, 150, -0.15, -1], [925, 960, 150, 0.12, 1]], 8)),
      tr: { dur: 1.1, path: "curve", curl: 0.3, order: "x", stagger: 0.3, staggerBy: "x" },
    },
  ],
  texts: [
    heading(15.2, 18.3, [{ t: "МУДРЫЙ", c: C.yellow }, " КОРАН"], WHITE),
    ayahCaption(15.5, 18.3, "Сура Ясин, 36:2"),
    heading(18.4, 20.15, [{ t: "ВЕРА", c: C.pink }], WHITE),
    heading(20.2, 22.05, [{ t: "ПОСТУПКИ", c: C.orange }], WHITE),
    heading(22.1, 23.75, ["О чём напоминает сура"], WHITE, 46),
    { from: 22.6, to: 23.75, x: 205, y: 1215, size: 36, weight: 800, font: "manrope", color: C.cyan, spans: ["КОРАН"], anim: "rise" },
    { from: 22.7, to: 23.75, x: 540, y: 1215, size: 36, weight: 800, font: "manrope", color: C.pink, spans: ["ВЕРА"], anim: "rise" },
    { from: 22.8, to: 23.75, x: 875, y: 1215, size: 36, weight: 800, font: "manrope", color: C.orange, spans: ["ПОСТУПКИ"], anim: "rise" },
  ],
  cues: [{ at: 15.0, kind: "sparkle", gain: 0.5 }, { at: 19.3, kind: "chime", gain: 0.45 }],
};
