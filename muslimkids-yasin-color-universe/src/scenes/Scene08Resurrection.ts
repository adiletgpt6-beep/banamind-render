import { shape, question, groundParts, rainParts, sproutParts } from "../shapes/catalog";
import { Scene, WHITE, C, heading, ayahCaption } from "./types";

// 65–73 с: «Ещё „Ясин“ напоминает о Воскрешении. Аллах способен оживить после смерти».
// Только спокойная иллюстрация обновления природы — без изображения воскрешения людей.
const DROPS: Array<[number, number]> = [[230, 760], [380, 980], [520, 700], [670, 930], [810, 740], [900, 1010], [300, 1110]];
const dry = () => groundParts(540, 1270, 880, 210, true);

export const scene08: Scene = {
  id: "s8", title: "Вопрос о Воскрешении", from: 64.6, to: 71.9,
  keyframes: [
    { at: 65.9, shape: shape("s8-question", question(540, 1010, 860, "questionNight")), tr: { dur: 1.35, path: "scatter", spread: 380, cy: 1000, order: "hilbert", stagger: 0.35, staggerBy: "random" } },
    { at: 67.95, shape: shape("s8-dry", dry()), tr: { dur: 1.2, path: "fall", lift: 180, order: "x", stagger: 0.35, staggerBy: "x" } },
    { at: 68.85, shape: shape("s8-rain", dry(), rainParts(DROPS)), tr: { dur: 0.8, path: "direct", emerge: "above", match: [[[0], [0]]], stagger: 0.5, staggerBy: "random", ease: "out" } },
    { at: 70.15, shape: shape("s8-sprout", groundParts(540, 1270, 880, 210, false), sproutParts(540, 1285, 1.15, true)), tr: { dur: 1.25, path: "fall", lift: 60, match: [[[0], [0]]], order: "y", stagger: 0.55, staggerBy: "-y", via: "rain" } },
  ],
  texts: [
    heading(66.6, 71.8, [{ t: "ВОСКРЕШЕНИЕ", c: C.cyan }], WHITE, 60),
    ayahCaption(66.8, 71.8, "Сура Ясин, 36:78–83"),
  ],
  cues: [{ at: 65.7, kind: "chime", gain: 0.4 }, { at: 68.1, kind: "rain", dur: 2.2, gain: 0.5 }, { at: 69.9, kind: "rustle", dur: 1.5, gain: 0.45 }],
};
