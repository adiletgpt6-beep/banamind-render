// Сцена 5: крупный план сот → повторение ячеек → перестройка в орнамент.
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COMB, Honeycomb, type CombTimes } from "../components/Honeycomb";
import { cameraPlan, GeometryCamera } from "../engines/GeometryCameraController";
import { ramp } from "../engines/GeometryWondersEngine";
import { blendPresets, GeometryLights, LIGHTS } from "../engines/GeometryLightingSystem";
import { T } from "../timeline";

export const COMB_TIMES: CombTimes = {
  first: T.combIn[0],
  second: T.cell1,
  third: T.cell2,
  grow: T.combGrow,
  repeat: T.repeat,
  flatten: T.combToPattern,
};

// Масштаб первой ячейки совпадает с центральным шестиугольником цветка.
export const COMB_START_Z = 11.1;
export const PATTERN_Z = 17;

function combCamera() {
  return cameraPlan([
    { t: T.combIn[0], pos: [0, 0, COMB_START_Z], target: [0, 0, 0], fov: 40 },
    { t: T.cell2 + 0.3, pos: [0, 0, COMB_START_Z - 0.6], target: [0, 0, 0] },
    { t: T.combGrow[1] - 0.6, pos: [3.4, -5.2, 10.5], target: [0, 0, -0.6] },
    { t: T.repeat[1], pos: [2.4, -4.4, 11.5], target: [0, 0.4, -0.6] },
    { t: T.combToPattern[1], pos: [0, 0, PATTERN_Z], target: [0, 0, 0] },
  ]);
}

export const HoneycombBackground: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, #3a2408 0%, #1c1a1f 55%, #081525 100%)" }} />
);

export const HoneycombWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const plan = useMemo(combCamera, []);
  const light = blendPresets(LIGHTS.honey, LIGHTS.ornament, ramp(t, T.combToPattern[0], T.combToPattern[1]));
  return (
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true, alpha: true }} shadows style={{ position: "absolute" }}>
      <GeometryCamera plan={plan} t={t} drift={0.04} />
      <GeometryLights preset={light} shadow={{ size: COMB.rings * COMB.size * 2.2, center: [0, 0, -0.6], mapSize: 2048 }} />
      <Honeycomb t={t} times={COMB_TIMES} />
    </ThreeCanvas>
  );
};
