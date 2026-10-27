// Технический лист крупных природных планов ролика 80-1-2.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BloomView, beeAt, LeafPlate } from "./sets/nature";

export const NatureTest: React.FC = () => {
  const fr = useCurrentFrame();
  if (fr === 0) return <AbsoluteFill><LeafPlate fx={{ light: 1, water: 1, air: 1, food: 0, t: 2 }} u={0} /></AbsoluteFill>;
  if (fr === 1) return <AbsoluteFill><LeafPlate fx={{ light: 1, water: 0.4, air: 0.4, food: 1, t: 4 }} u={0.5} /></AbsoluteFill>;
  const cases = [
    { u: 1.0, stage: 0, cam: { cx: 960, cy: 540, w: 1920 } },
    { u: 3.6, stage: 0, cam: { cx: 600, cy: 440, w: 760 } },
    { u: 5.5, stage: 0, cam: { cx: 960, cy: 500, w: 1920 } },
    { u: 8.2, stage: 0, cam: { cx: 1390, cy: 520, w: 760 } },
    { u: 20, stage: 1.0, cam: { cx: 620, cy: 520, w: 1200 } },
    { u: 20, stage: 2.2, cam: { cx: 620, cy: 560, w: 1200 } },
    { u: 20, stage: 4, cam: { cx: 620, cy: 600, w: 1200 } },
  ];
  const c = cases[(fr - 2) % cases.length];
  const bee = c.stage === 0 ? beeAt(c.u) : null;
  return (
    <AbsoluteFill>
      <BloomView fx={{ t: c.u, bee, stage: c.stage, pollenB: c.u > 7.4 ? 1 : 0, pollenA: c.u > 3 ? 0.4 : 1 }} cam={c.cam} />
    </AbsoluteFill>
  );
};
