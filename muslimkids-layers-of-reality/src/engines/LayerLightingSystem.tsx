// LayerLightingSystem — key (sun) with soft shadows, cool fill, teal rim,
// sky/ground ambient. Presets per shot are blended by time; the shadow
// frustum follows the subject so separated layers cast contact shadows.
import React from "react";
import * as THREE from "three";
import { SUN_DIR } from "../compositions/layout";
import { lerp } from "../utils/math";

export interface LightPreset {
  key: number; fill: number; rim: number; hemi: number;
  focus: THREE.Vector3; radius: number;
}
export const blendPreset = (a: LightPreset, b: LightPreset, k: number): LightPreset => ({
  key: lerp(a.key, b.key, k), fill: lerp(a.fill, b.fill, k), rim: lerp(a.rim, b.rim, k), hemi: lerp(a.hemi, b.hemi, k),
  focus: a.focus.clone().lerp(b.focus, k), radius: lerp(a.radius, b.radius, k),
});

export const LayerLighting: React.FC<{ p: LightPreset }> = ({ p }) => {
  const keyPos = p.focus.clone().addScaledVector(SUN_DIR, 12);
  const target = React.useMemo(() => new THREE.Object3D(), []);
  target.position.copy(p.focus);
  target.updateMatrixWorld();
  const r = p.radius;
  return (
    <>
      <primitive object={target} />
      <hemisphereLight args={["#A0DCF1", "#3A2C22", p.hemi]} />
      <directionalLight
        position={keyPos}
        target={target}
        intensity={p.key}
        color="#FFF1DC"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={4}
        shadow-camera-left={-r}
        shadow-camera-right={r}
        shadow-camera-top={r}
        shadow-camera-bottom={-r}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />
      <directionalLight position={p.focus.clone().add(new THREE.Vector3(6, 1.5, 5))} intensity={p.fill} color="#A0DCF1" />
      <directionalLight position={p.focus.clone().add(new THREE.Vector3(2, 4, -9))} intensity={p.rim} color="#59CED6" />
    </>
  );
};
