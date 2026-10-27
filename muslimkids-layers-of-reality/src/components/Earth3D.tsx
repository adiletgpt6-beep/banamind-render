// Earth3D — textured planet built from closed spherical shell sectors.
// The octant window (EarthCutaway) opens radially: atmosphere, crust,
// mantle, outer and inner core each lift out as thick, section-faced pieces.
import React, { useMemo } from "react";
import * as THREE from "three";
import { EARTH } from "../compositions/layout";
import {
  EARTH_CYCLES, EARTH_QUAT, EARTH_SPECS, EARTH_WEDGE, earthSpin,
} from "../engines/ExplodedViewController";
import { sphericalSector } from "../engines/LayerGeometryEngine";
import { earthMaterials } from "../engines/LayerMaterialSystem";
import { layerPose } from "../engines/LayerSeparationEngine";
import { EARTH_LAYERS, earthSectionColor } from "../engines/ScientificCutawayEngine";
import { CUE } from "../compositions/cues";
import { smoothstep, window4 } from "../utils/math";

const HALF = Math.PI / 2;
const W = EARTH_WEDGE;

type Parts = { lower: THREE.BufferGeometry; body: THREE.BufferGeometry; wedge: THREE.BufferGeometry };
const sectorParts = (r0: number, r1: number, seg: number, cut = true): Parts => {
  const cc = cut ? earthSectionColor : undefined;
  return {
    lower: sphericalSector({ r0, r1, phiStart: 0, phiLength: Math.PI * 2, thetaStart: HALF, thetaLength: HALF, segments: seg, cutColor: cc }),
    body: sphericalSector({ r0, r1, phiStart: W.phiStart + W.phiLength, phiLength: Math.PI * 2 - W.phiLength, thetaStart: 0, thetaLength: HALF, segments: seg, cutColor: cc }),
    wedge: sphericalSector({ r0, r1, phiStart: W.phiStart, phiLength: W.phiLength, thetaStart: 0, thetaLength: HALF, segments: seg, cutColor: cc }),
  };
};

let cache: {
  layers: Record<string, Parts>;
  clouds: Parts;
  atmo: Parts;
  seam: THREE.TubeGeometry;
} | null = null;

const sph = (r: number, phi: number, th: number) =>
  new THREE.Vector3(-r * Math.cos(phi) * Math.sin(th), r * Math.cos(th), r * Math.sin(phi) * Math.sin(th));

const geometries = () => {
  if (cache) return cache;
  const layers: Record<string, Parts> = {};
  for (const L of EARTH_LAYERS) layers[L.id] = sectorParts(L.r0, L.r1, L.id === "crust" ? 96 : 48);
  // golden seam around the octant (two meridians + equator arc)
  const pts: THREE.Vector3[] = [];
  const R = 1.004;
  for (let i = 0; i <= 40; i++) pts.push(sph(R, 0, HALF - (HALF * i) / 40));
  for (let i = 1; i <= 40; i++) pts.push(sph(R, HALF, (HALF * i) / 40));
  for (let i = 1; i <= 40; i++) pts.push(sph(R, HALF - (HALF * i) / 40, HALF));
  const seam = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05), 240, 0.0085, 8, false);
  cache = {
    layers,
    clouds: sectorParts(1.012, 1.013, 72, false),
    atmo: sectorParts(1.055, 1.056, 72, false),
    seam,
  };
  return cache;
};

const poseOf = (id: string, t: number) =>
  layerPose(EARTH_SPECS.find((s) => s.id === id)!, EARTH_SPECS, EARTH_CYCLES, t);

export const Earth3D: React.FC<{ t: number; showGuides?: boolean }> = ({ t, showGuides = true }) => {
  const g = geometries();
  const m = earthMaterials();
  const spin = earthSpin(t);
  m.surface.map!.offset.x = -spin / (Math.PI * 2);
  m.surface.roughnessMap!.offset.x = -spin / (Math.PI * 2);
  m.clouds.alphaMap!.offset.x = -(spin * 1.04 + t * 0.004) / (Math.PI * 2);

  const atmo = poseOf("atmosphere", t);
  const atmoW = poseOf("atmosphereWedge", t);
  // the shell stays readable while lifted: brighter base when separated
  (m.atmosphere.uniforms.uBase.value as number) = 0.04 + 0.1 * atmo.progress;
  const seamK = showGuides ? window4(t, CUE.seam, CUE.seam + 0.6, 6.1, 6.6) : 0;
  const mats = useMemo(
    () =>
      Object.fromEntries(
        EARTH_LAYERS.map((L) => [L.id, [m.layerOuter[L.id], m.layerInner[L.id], m.section]]),
      ) as Record<string, THREE.Material[]>,
    [m],
  );

  return (
    <group position={EARTH.position} quaternion={EARTH_QUAT}>
      {EARTH_LAYERS.map((L) => {
        const p = poseOf(L.id, t);
        const parts = g.layers[L.id];
        const inner = L.id !== "crust";
        return (
          <group key={L.id}>
            {/* inner shells are hidden by the crust until the window opens */}
            <mesh geometry={parts.lower} material={mats[L.id]} castShadow={!inner} receiveShadow />
            <mesh geometry={parts.body} material={mats[L.id]} castShadow={!inner} receiveShadow />
            <group position={p.position} quaternion={p.quaternion}>
              <mesh geometry={parts.wedge} material={mats[L.id]} castShadow receiveShadow />
            </group>
          </group>
        );
      })}
      {/* ATMOSPHERE + clouds: a translucent shell that lifts away */}
      <group scale={atmo.scale}>
        <mesh geometry={g.clouds.lower} material={m.clouds} renderOrder={2} />
        <mesh geometry={g.clouds.body} material={m.clouds} renderOrder={2} />
        <mesh geometry={g.atmo.lower} material={m.atmosphere} renderOrder={3} />
        <mesh geometry={g.atmo.body} material={m.atmosphere} renderOrder={3} />
      </group>
      <group position={atmoW.position} scale={atmoW.scale}>
        <mesh geometry={g.clouds.wedge} material={m.clouds} renderOrder={2} />
        <mesh geometry={g.atmo.wedge} material={m.atmosphere} renderOrder={3} />
      </group>
      {seamK > 0.001 && (
        <mesh geometry={g.seam} renderOrder={4}>
          <meshBasicMaterial color="#EFC374" transparent opacity={seamK} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

/** Anchor (world) of a separated Earth layer, for 2D labels. */
export const earthLayerAnchor = (id: string, t: number) => {
  const L = EARTH_LAYERS.find((l) => l.id === id)!;
  const p = poseOf(id, t);
  const r = (L.r0 + L.r1) / 2 + (id === "outerCore" ? 0.02 : 0);
  const local = sph(Math.max(r, 0.12), Math.PI / 4, 0.95).add(p.position);
  return local.applyQuaternion(EARTH_QUAT).add(EARTH.position);
};
export const earthSeparation = (t: number) => smoothstep(0, 1, poseOf("crust", t).progress);
