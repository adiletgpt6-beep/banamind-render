// MountainLandscape + GeologicalCutaway — a diorama massif (peaks, snow,
// river valley, forest, clouds) whose front chunk is made of folded rock
// strata. The chunk slides out of the massif and its strata stack apart.
import React from "react";
import * as THREE from "three";
import { MOUNTAIN } from "../compositions/layout";
import { MOUNTAIN_CYCLES, MOUNTAIN_SPECS } from "../engines/ExplodedViewController";
import { heightSlab } from "../engines/LayerGeometryEngine";
import { rockMaterials } from "../engines/LayerMaterialSystem";
import { layerPose } from "../engines/LayerSeparationEngine";
import {
  BLOCK, SKIN, STRATA, isRiver, riverX, soilSideColor, strataSideColor, stratumBottom, stratumTop,
  terrainHeight, terrainTopColor,
} from "../engines/ScientificCutawayEngine";
import { softDotTexture } from "../materials/textures";
import { seeded, smoothstep } from "../utils/math";

type Part = { strata: THREE.BufferGeometry[]; surface: THREE.BufferGeometry; trees: THREE.Matrix4[] };
let cache: { back: Part; front: Part; cone: THREE.ConeGeometry } | null = null;

const buildPart = (z0: number, z1: number, nz: number): Part => {
  const nx = 110;
  const strata = STRATA.map((_, i) =>
    heightSlab({
      x0: BLOCK.x0, x1: BLOCK.x1, z0, z1, nx, nz,
      bottom: (x, z) => stratumBottom(i, x, z),
      top: (x, z) => stratumTop(i, x, z),
      topColor: (x, z, y) => strataSideColor(i)(x, y, z),
      sideColor: strataSideColor(i),
      wallRows: 6,
    }),
  );
  const surface = heightSlab({
    x0: BLOCK.x0, x1: BLOCK.x1, z0, z1, nx: 160, nz: Math.round(nz * 1.45),
    bottom: (x, z) => terrainHeight(x, z) - SKIN,
    top: terrainHeight,
    topColor: terrainTopColor,
    sideColor: soilSideColor,
    wallRows: 3,
  });
  // forest on lower slopes, away from the river
  const rnd = seeded(z0 > 0 ? 404 : 202);
  const trees: THREE.Matrix4[] = [];
  for (let i = 0; i < 900 && trees.length < 150; i++) {
    const x = BLOCK.x0 + 0.05 + rnd() * (BLOCK.x1 - BLOCK.x0 - 0.1);
    const z = z0 + 0.04 + rnd() * (z1 - z0 - 0.08);
    const h = terrainHeight(x, z);
    if (h > 0.34 || h < 0.07 || isRiver(x, z) || Math.abs(x - riverX(z)) < 0.09) continue;
    const s = 0.035 + rnd() * 0.03;
    trees.push(new THREE.Matrix4().compose(
      new THREE.Vector3(x, h + s * 1.1, z),
      new THREE.Quaternion(),
      new THREE.Vector3(s, s * 2.4, s),
    ));
  }
  return { strata, surface, trees };
};
const geometries = () =>
  (cache ??= {
    back: buildPart(BLOCK.z0, BLOCK.cutZ, 70),
    front: buildPart(BLOCK.cutZ, BLOCK.z1, 40),
    cone: new THREE.ConeGeometry(1, 1, 7),
  });

const Forest: React.FC<{ matrices: THREE.Matrix4[] }> = ({ matrices }) => {
  const m = rockMaterials();
  const g = geometries();
  const ref = React.useCallback(
    (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      matrices.forEach((mx, i) => mesh.setMatrixAt(i, mx));
      mesh.instanceMatrix.needsUpdate = true;
    },
    [matrices],
  );
  return <instancedMesh ref={ref} args={[g.cone, m.forest, matrices.length]} castShadow receiveShadow />;
};

const CLOUDS = [
  { p: [0.3, 1.25, 0.1], s: 0.9 },
  { p: [-0.9, 1.05, -0.5], s: 0.75 },
  { p: [1.15, 1.0, -0.3], s: 0.7 },
  { p: [-0.2, 1.35, -0.9], s: 1.0 },
] as const;

const poseOf = (id: string, t: number) =>
  layerPose(MOUNTAIN_SPECS.find((s) => s.id === id)!, MOUNTAIN_SPECS, MOUNTAIN_CYCLES, t);

export const MountainLandscape: React.FC<{ t: number }> = ({ t }) => {
  const g = geometries();
  const m = rockMaterials();
  const surf = poseOf("surface", t);
  // clouds drift and thin out while the section is open
  const cloudK = (1 - 0.85 * smoothstep(0.05, 0.4, surf.progress)) * (1 - smoothstep(52.4, 53.4, t));
  m.cloud.map = softDotTexture();
  m.cloud.opacity = 0.38 * cloudK;
  const mats: THREE.Material[] = [m.strata, m.strata, m.strata];
  const smats: THREE.Material[] = [m.surface, m.strata, m.strata];
  return (
    <group position={MOUNTAIN.position} rotation={[0, MOUNTAIN.rotationY, 0]} scale={MOUNTAIN.scale}>
      {/* massif (stays) */}
      {g.back.strata.map((geo, i) => (
        <mesh key={`b${i}`} geometry={geo} material={mats} castShadow receiveShadow />
      ))}
      <mesh geometry={g.back.surface} material={smats} castShadow receiveShadow />
      <Forest matrices={g.back.trees} />
      {/* front chunk — geological cutaway */}
      {g.front.strata.map((geo, i) => {
        const p = poseOf(STRATA[i].id, t);
        return (
          <group key={`f${i}`} position={p.position}>
            <mesh geometry={geo} material={mats} castShadow receiveShadow />
          </group>
        );
      })}
      <group position={surf.position}>
        <mesh geometry={g.front.surface} material={smats} castShadow receiveShadow />
        <Forest matrices={g.front.trees} />
      </group>
      {cloudK > 0.02 &&
        CLOUDS.map((c, i) => (
          <sprite
            key={i}
            material={m.cloud}
            position={[c.p[0] + Math.sin(t * 0.15 + i) * 0.12, c.p[1], c.p[2]]}
            scale={[c.s * 1.3, c.s * 0.5, 1]}
          />
        ))}
    </group>
  );
};

/** World anchor of a stratum in the exploded front chunk (labels). */
export const strataAnchor = (i: number, t: number) => {
  const p = poseOf(STRATA[i].id, t).position;
  const x = 0.2, z = BLOCK.z1;
  const y = (stratumBottom(i, x, z) + stratumTop(i, x, z)) / 2;
  return new THREE.Vector3(x, y, z)
    .add(p)
    .multiplyScalar(MOUNTAIN.scale)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), MOUNTAIN.rotationY)
    .add(MOUNTAIN.position);
};
export const mountainOpen = (t: number) => poseOf("surface", t).progress;
