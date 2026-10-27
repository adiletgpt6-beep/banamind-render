// Технический лист сада ролика 80-1-2: состояния дерева и вставок по кадрам.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GardenView, type GardenState, type GardenCam } from "./sets/garden";

const CASES: { s: Omit<GardenState, "t">; cam: GardenCam }[] = [
  { s: { season: "summer", treeA: { season: "summer", fruit: 1, fruitCount: 8 }, treeB: { season: "summer" } }, cam: { cx: 1900, cy: 950, w: 3000 } },
  { s: { season: "summer", treeA: { season: "summer", fruit: 1, fruitCount: 8 }, cut: 1, roots: 1, wet: 0.7, soilWater: 1, arrows: 1, rain: 0.8 }, cam: { cx: 1600, cy: 1350, w: 1900 } },
  { s: { season: "summer", treeA: { season: "summer" }, cut: 1, roots: 1, watering: 0.8 }, cam: { cx: 1500, cy: 1200, w: 1500 } },
  { s: { season: "spring", treeA: { season: "spring", bloom: 1 }, treeB: { season: "spring", bloom: 1 } }, cam: { cx: 2300, cy: 900, w: 2900 } },
  { s: { season: "autumn", treeA: { season: "autumn", leaf: 0.7 } }, cam: { cx: 1600, cy: 900, w: 2200 } },
  { s: { season: "winter", treeA: { season: "winter", leaf: 0 }, snow: 1 }, cam: { cx: 1600, cy: 900, w: 2200 } },
  { s: { season: "summer", treeA: { season: "summer" }, growth: { stage: "sprout", g: 0.9 }, cut: 0.5 }, cam: { cx: 1600, cy: 1330, w: 700 } },
  { s: { season: "summer", treeA: { season: "summer" }, growth: { stage: "young", g: 0.8 } }, cam: { cx: 1600, cy: 1150, w: 1100 } },
  { s: { season: "summer", treeA: { season: "summer" }, growth: { stage: "tree", s: 0.35 } }, cam: { cx: 1600, cy: 1050, w: 1600 } },
];

export const GardenTest: React.FC = () => {
  const fr = useCurrentFrame();
  const c = CASES[fr % CASES.length];
  return (
    <AbsoluteFill>
      <GardenView s={{ ...c.s, t: 3 }} cam={c.cam} />
    </AbsoluteFill>
  );
};
