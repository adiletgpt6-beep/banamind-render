import { shape, groundParts, rainParts, sproutParts, wheatParts, palmParts, grapesParts } from "../shapes/catalog";
import { Scene, WHITE, C, heading, ayahCaption } from "./types";

// 24–35 с: «Посмотри на землю. Мёртвая земля оживает. Появляются зёрна, финиковые пальмы, виноград и плоды».
const DROPS: Array<[number, number]> = [[200, 700], [330, 900], [460, 640], [590, 860], [720, 690], [850, 920], [270, 1060], [650, 1050], [900, 610]];
const dry = () => groundParts(540, 1200, 900, 230, true);
const green = () => groundParts(540, 1200, 900, 230, false);

export const scene04: Scene = {
  id: "s4", title: "Ожившая земля", from: 23.8, to: 34.4,
  keyframes: [
    { at: 25.0, shape: shape("s4-dry", dry()), tr: { dur: 1.2, path: "fall", lift: 160, order: "x", stagger: 0.35, staggerBy: "x" } },
    // капли дождя собираются из маленьких точек и падают
    { at: 26.05, shape: shape("s4-rain", dry(), rainParts(DROPS)), tr: { dur: 0.85, path: "direct", emerge: "above", match: [[[0], [0]]], stagger: 0.5, staggerBy: "random", ease: "out" } },
    // COLOR WAVE снизу вверх: коричневые точки становятся зелёными, капли превращаются в росток
    { at: 27.35, shape: shape("s4-sprout", green(), sproutParts(540, 1215, 1.0)), tr: { dur: 1.25, path: "fall", lift: 60, match: [[[0], [0]]], order: "y", stagger: 0.55, staggerBy: "-y", via: "rain" } },
    { at: 28.65, shape: shape("s4-grains", green(), sproutParts(540, 1215, 1.05, true), wheatParts(290, 1230, 0.8, -40), wheatParts(800, 1230, 0.8, 40)), tr: { dur: 1.0, path: "rise", lift: 80, match: [[[0], [0]], [[1], [1]]], order: "y", stagger: 0.4, staggerBy: "-y" } },
    { at: 29.75, shape: shape("s4-palm", groundParts(540, 1490, 760, 100, false), palmParts(560, 1505, 1.1)), tr: { dur: 1.0, path: "rise", lift: 140, order: "hilbert", stagger: 0.4, staggerBy: "-y" } },
    { at: 31.2, shape: shape("s4-garden", groundParts(540, 1490, 900, 100, false), palmParts(290, 1505, 0.78), grapesParts(800, 1010, 0.8)), tr: { dur: 0.9, path: "curve", curl: 0.25, match: [[[0], [0]], [[1], [1]], [[2], [2]], [[3], [3]]], stagger: 0.35, staggerBy: "x" } },
    // пальма перестраивается в большую гроздь винограда
    { at: 32.9, shape: shape("s4-grapes", grapesParts(520, 830, 1.28)), tr: { dur: 1.2, path: "curve", curl: 0.35, swirl: -1, order: "hilbert", stagger: 0.3, staggerBy: "random" } },
  ],
  texts: [
    heading(24.4, 27.9, [{ t: "ЗЕМЛЯ", c: C.orange }], WHITE),
    heading(28.0, 29.65, [{ t: "ЗЁРНА", c: C.yellow }], WHITE),
    heading(29.7, 31.0, [{ t: "САДЫ", c: C.green }], WHITE),
    heading(31.05, 34.3, [{ t: "ПЛОДЫ", c: C.pink }], WHITE),
    ayahCaption(24.7, 34.3, "Сура Ясин, 36:33–35"),
  ],
  cues: [
    { at: 25.25, kind: "rain", dur: 2.4, gain: 0.55 },
    { at: 27.3, kind: "rustle", dur: 1.6, gain: 0.5 },
    { at: 29.3, kind: "rustle", dur: 2.0, gain: 0.55 },
    { at: 32.6, kind: "chime", gain: 0.4 },
  ],
};
