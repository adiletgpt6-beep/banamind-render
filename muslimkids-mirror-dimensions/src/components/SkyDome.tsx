// Купол неба (MirrorCosmos): космос, день, вечер, ночь — общий шейдер.
import { useMemo } from "react";
import * as THREE from "three";
import { PALETTE } from "../engines/MirrorLightingSystem";
import { skyFragment, skyVertex } from "../shaders/sky";

export type SkyState = {
  space?: number;
  day?: number;
  dusk?: number;
  night?: number;
  clouds?: number;
  stars?: number;
  moon?: number;
  sunDir?: [number, number, number];
  moonDir?: [number, number, number];
};

export const SkyDome: React.FC<{ radius: number; state: SkyState; time: number; position?: [number, number, number] }> = ({
  radius,
  state,
  time,
  position,
}) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        clipping: true,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uSpace: { value: 0 },
          uDay: { value: 0 },
          uDusk: { value: 0 },
          uNight: { value: 0 },
          uClouds: { value: 0 },
          uStars: { value: 0 },
          uMoon: { value: 0 },
          uSunDir: { value: new THREE.Vector3(0, 1, 0) },
          uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
          uTime: { value: 0 },
          cNavy: { value: new THREE.Color(PALETTE.navy) },
          cSapphire: { value: new THREE.Color(PALETTE.sapphire) },
          cViolet: { value: new THREE.Color(PALETTE.violet) },
          cGold: { value: new THREE.Color(PALETTE.gold) },
          cTurq: { value: new THREE.Color(PALETTE.turquoise) },
        },
      }),
    [],
  );
  const u = material.uniforms;
  u.uSpace.value = state.space ?? 0;
  u.uDay.value = state.day ?? 0;
  u.uDusk.value = state.dusk ?? 0;
  u.uNight.value = state.night ?? 0;
  u.uClouds.value = state.clouds ?? 0;
  u.uStars.value = state.stars ?? 0;
  u.uMoon.value = state.moon ?? 0;
  u.uSunDir.value.set(...(state.sunDir ?? [0, 1, 0]));
  u.uMoonDir.value.set(...(state.moonDir ?? [0, 1, 0]));
  u.uTime.value = time;
  return (
    <mesh material={material} position={position} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[radius, 64, 32]} />
    </mesh>
  );
};
