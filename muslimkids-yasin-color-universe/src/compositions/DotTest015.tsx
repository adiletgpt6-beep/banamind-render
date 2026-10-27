// Обязательный первый тест (9 с): точки появляются → 36 → 83 → разноцветная сетка из 83 точек.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ColorDotField } from "../components/ColorDotField";
import { Typography } from "../components/Typography";
import { shape, seed, swirl, digits, grid83 } from "../shapes/catalog";
import type { Keyframe } from "../engines/DotMorphEngine";
import type { BgKey } from "../engines/ColorDotEngine";
import { NAVY, C, heading } from "../scenes/types";

const KF: Keyframe[] = [
  { at: 0, shape: shape("s1-seed", seed()), float: 0 },
  { at: 1.6, shape: shape("s1-swirl", swirl()), tr: { dur: 1.5, path: "spiral", turns: 0.35, stagger: 0.45, staggerBy: "radial", order: "angle", swell: 0.3 } },
  { at: 3.6, shape: shape("s2-36", digits("36", "num36")), tr: { dur: 1.4, path: "scatter", spread: 430, cy: 1000, stagger: 0.35, staggerBy: "random", swell: 0.35 } },
  { at: 5.8, shape: shape("s2-83", digits("83", "num83")), tr: { dur: 1.15, path: "curve", curl: 0.55, swirl: 1, stagger: 0.3, staggerBy: "x", swell: 0.25 } },
  { at: 7.2, shape: shape("s2-grid83", grid83()), tr: { dur: 0.9, path: "curve", curl: 0.2, order: "y", stagger: 0.25, staggerBy: "y" }, float: 0.6 },
];
const BG: BgKey[] = [
  { at: 0, dur: 0, top: "#081126", bottom: "#0D1A3F" },
  { at: 2.2, dur: 0.8, top: "#F8FAFF", bottom: "#EEF2FF" },
];

export const DotTest015: React.FC = () => (
  <AbsoluteFill>
    <ColorDotField id="test" pool={7000} keyframes={KF} backgrounds={BG} camera={[{ at: 0, s: 1 }]} />
    <Typography items={[heading(3.4, 5.6, [{ t: "36", c: C.pink }, "-я сура"], NAVY, 60), heading(5.7, 9, ["В ней ", { t: "83", c: C.purple }, " аята"], NAVY, 60)]} />
  </AbsoluteFill>
);
