// Сцена 4 (и начало 5): грани Земли → горы → лес → цветок.
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { GeometryFlower } from "../components/GeometryFlower";
import { GeometryForest } from "../components/GeometryForest";
import { GeometryMountains } from "../components/GeometryMountains";
import { cameraPlan, GeometryCamera } from "../engines/GeometryCameraController";
import { blendPresets, GeometryLights, LIGHTS } from "../engines/GeometryLightingSystem";
import { terrainHeight } from "../engines/ProceduralWorldBuilder";
import { T } from "../timeline";

export const FLOWER_POS: [number, number, number] = [0, terrainHeight(0, 7.2) + 0.55, 7.2];

function landscapeCamera() {
  const f = FLOWER_POS;
  return cameraPlan([
    // Сверху — как продолжение подлёта к Земле.
    { t: T.landIn[0], pos: [0, 15.5, 4.2], target: [0, 0, 3.2], fov: 40 },
    { t: T.rise[0], pos: [0, 14.5, 6.5], target: [0, 0, 1.5] },
    // Горы поднимаются — камера наклоняется к горизонту.
    { t: T.rise[1] - 0.4, pos: [1.5, 7.2, 15.5], target: [-0.5, 4.4, -6] },
    { t: T.snow[1], pos: [2.6, 6.8, 13.2], target: [-1, 4.0, -8] },
    // Лес собирается перед нами.
    { t: T.trees[1] - 0.4, pos: [-0.6, 4.4, 15.2], target: [0, 1.6, 1.5] },
    // К цветку: плавно вниз, почти сверху.
    { t: T.flower[0] + 1.2, pos: [0, f[1] + 3.2, f[2] + 3.0], target: [0, f[1], f[2]], fov: 40 },
    { t: T.combIn[1], pos: [0, f[1] + 1.75, f[2] + 0.12], target: [0, f[1], f[2]], fov: 40 },
  ]);
}

export const LandscapeWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const plan = useMemo(landscapeCamera, []);
  const light = blendPresets(LIGHTS.landscape, LIGHTS.honey, 0.25 * ((t - T.flower[0]) / 3 > 0 ? Math.min(1, (t - T.flower[0]) / 3) : 0));
  const fog = useMemo(() => new THREE.Fog("#cfe8f4", 26, 70), []);
  return (
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true, alpha: true }} shadows style={{ position: "absolute" }}>
      <primitive attach="fog" object={fog} />
      <GeometryCamera plan={plan} t={t} drift={0.05} />
      <GeometryLights preset={light} shadow={{ size: 20, center: [0, 0, -2], mapSize: 2048 }} />
      <GeometryMountains t={t} rise={T.rise} snow={T.snow} />
      <GeometryForest t={t} window={T.trees} />
      <GeometryFlower t={t} at={T.flower} position={FLOWER_POS} />
    </ThreeCanvas>
  );
};
