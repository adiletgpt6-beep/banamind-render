// Горная долина (ландшафт) с освещением по времени суток.
import { useMemo } from "react";
import * as THREE from "three";
import { createTerrainGeometry } from "../geometry/terrain";
import { terrainFragment, terrainVertex } from "../shaders/terrain";

let sharedGeometry: THREE.BufferGeometry | null = null;
const terrainGeometry = () => (sharedGeometry ??= createTerrainGeometry());

export type TerrainLight = {
  sunDir: [number, number, number];
  sunColor: string;
  sky: string;
  ground: string;
  fog: string;
  fogDensity: number;
  exposure: number;
};

export const DAY_LIGHT: TerrainLight = {
  sunDir: [-0.75, 0.5, 0.25],
  sunColor: "#FFF1DA",
  sky: "#9CC2E6",
  ground: "#3D4A3A",
  fog: "#A8C8E6",
  fogDensity: 0.0018,
  exposure: 1.05,
};

export const NIGHT_LIGHT: TerrainLight = {
  sunDir: [-0.3, 0.55, -0.6],
  sunColor: "#6F86B8",
  sky: "#2A3D6B",
  ground: "#0E1626",
  fog: "#15284A",
  fogDensity: 0.0026,
  exposure: 1.15,
};

export const DUSK_LIGHT: TerrainLight = {
  sunDir: [-0.6, 0.18, -0.6],
  sunColor: "#F1B97A",
  sky: "#5F5E8F",
  ground: "#2A2230",
  fog: "#C9A08A",
  fogDensity: 0.0034,
  exposure: 0.95,
};

export const mixLight = (a: TerrainLight, b: TerrainLight, t: number): TerrainLight => {
  const c = (x: string, y: string) => "#" + new THREE.Color(x).lerp(new THREE.Color(y), t).getHexString();
  const v = (x: number[], y: number[]) => x.map((xi, i) => xi + (y[i] - xi) * t) as [number, number, number];
  return {
    sunDir: v(a.sunDir, b.sunDir),
    sunColor: c(a.sunColor, b.sunColor),
    sky: c(a.sky, b.sky),
    ground: c(a.ground, b.ground),
    fog: c(a.fog, b.fog),
    fogDensity: a.fogDensity + (b.fogDensity - a.fogDensity) * t,
    exposure: a.exposure + (b.exposure - a.exposure) * t,
  };
};

export const MirrorMountains: React.FC<{ light: TerrainLight; worldScale?: number }> = ({ light, worldScale = 1 }) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: terrainVertex,
        clipping: true,
        fragmentShader: terrainFragment,
        uniforms: {
          uSunDir: { value: new THREE.Vector3() },
          uSunColor: { value: new THREE.Color() },
          uSkyColor: { value: new THREE.Color() },
          uGroundColor: { value: new THREE.Color() },
          uFogColor: { value: new THREE.Color() },
          uFogDensity: { value: 0.003 },
          uExposure: { value: 1 },
          uWorldScale: { value: 1 },
        },
      }),
    [],
  );
  const u = material.uniforms;
  u.uSunDir.value.set(...light.sunDir).normalize();
  u.uSunColor.value.set(light.sunColor);
  u.uSkyColor.value.set(light.sky);
  u.uGroundColor.value.set(light.ground);
  u.uFogColor.value.set(light.fog);
  u.uFogDensity.value = light.fogDensity;
  u.uExposure.value = light.exposure;
  u.uWorldScale.value = worldScale;
  return <mesh geometry={terrainGeometry()} material={material} />;
};
