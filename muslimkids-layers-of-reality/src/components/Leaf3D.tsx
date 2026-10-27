// Leaf3D + LeafCutaway — a magnified schematic leaf made of real tissue
// layers: upper epidermis, palisade tissue, vein network (vascular bundles),
// spongy tissue, lower epidermis. X-ray: the surface turns translucent,
// veins light up, then the layers separate along the leaf normal.
import React from "react";
import * as THREE from "three";
import { LEAF } from "../compositions/layout";
import { LEAF_CYCLES, LEAF_SPECS, LEAF_XRAY } from "../engines/ExplodedViewController";
import { surfaceSlab } from "../engines/LayerGeometryEngine";
import { plantMaterials } from "../engines/LayerMaterialSystem";
import { layerPose } from "../engines/LayerSeparationEngine";
import { leafSurface } from "../engines/ScientificCutawayEngine";
import { smoothstep, span } from "../utils/math";

const V = (a: [number, number, number]) => new THREE.Vector3(...a);
const eps = 1e-3;
const normalAt = (u: number, v: number) => {
  const du = V(leafSurface(Math.min(u + eps, 1), v)).sub(V(leafSurface(Math.max(u - eps, 0), v)));
  const dv = V(leafSurface(u, Math.min(v + eps, 1))).sub(V(leafSurface(u, Math.max(v - eps, 0))));
  const n = new THREE.Vector3().crossVectors(du, dv);
  return n.lengthSq() < 1e-12 ? new THREE.Vector3(0, 0, 1) : n.normalize();
};
/** Surface displaced by d along the leaf normal (layers never intersect). */
export const leafPoint = (u: number, v: number, d = 0) => V(leafSurface(u, v)).addScaledVector(normalAt(u, v), d);

// assembled depth (centre) and thickness of each layer
const STACK = {
  upperEpidermis: { d: 0.05, th: 0.016 },
  palisade: { d: 0.02, th: 0.04 },
  spongy: { d: -0.026, th: 0.045 },
  lowerEpidermis: { d: -0.057, th: 0.016 },
} as const;

let cache: {
  slabs: Record<keyof typeof STACK, THREE.BufferGeometry>;
  veins: THREE.BufferGeometry[];
} | null = null;

const veinCurves = () => {
  const curves: { pts: THREE.Vector3[]; r: number }[] = [];
  const mid: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) mid.push(leafPoint(i / 60 * 0.97, 0.5, 0));
  // petiole: the midrib continues into the leaf stalk
  const base = leafPoint(0, 0.5, 0);
  const stalk = [base.clone().add(new THREE.Vector3(-0.38, 0, -0.07)), base.clone().add(new THREE.Vector3(-0.18, 0, -0.02))];
  curves.push({ pts: [...stalk, ...mid], r: 0.024 });
  for (let k = 0; k < 9; k++) {
    const c = (k + 0.5) / 9 * 9 - 0.5;
    for (const side of [-1, 1]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 14; i++) {
        const a = (i / 14) * 0.86; // |s|
        const u = (c + a * 2.2 + 0.5) / 9;
        if (u > 0.97) break;
        pts.push(leafPoint(u, 0.5 + (side * a) / 2, 0));
      }
      if (pts.length > 3) curves.push({ pts, r: 0.009 });
    }
  }
  return curves;
};

const geometries = () => {
  if (cache) return cache;
  const slab = (d: number, th: number) =>
    surfaceSlab({
      nu: 140, nv: 48,
      surface: (u, v) => leafPoint(u, v, d),
      thickness: () => th,
    });
  cache = {
    slabs: {
      upperEpidermis: slab(STACK.upperEpidermis.d, STACK.upperEpidermis.th),
      palisade: slab(STACK.palisade.d, STACK.palisade.th),
      spongy: slab(STACK.spongy.d, STACK.spongy.th),
      lowerEpidermis: slab(STACK.lowerEpidermis.d, STACK.lowerEpidermis.th),
    },
    veins: veinCurves().map(
      (c) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c.pts), c.pts.length * 3, c.r, 8, false),
    ),
  };
  return cache;
};

const poseOf = (id: string, t: number) => layerPose(LEAF_SPECS.find((s) => s.id === id)!, LEAF_SPECS, LEAF_CYCLES, t);

const setOpacity = (m: THREE.Material, o: number) => {
  m.opacity = o;
  m.depthWrite = o > 0.97;
  m.transparent = o < 0.999;
};

export const Leaf3D: React.FC<{ t: number; position?: THREE.Vector3; rotation?: THREE.Euler; scale?: number }> = ({
  t, position = LEAF.position, rotation = LEAF.rotation, scale = LEAF.scale,
}) => {
  const g = geometries();
  const m = plantMaterials();
  // X-ray (scene 4) and its reversal on the grand reassembly
  const xray = span(t, LEAF_XRAY.start, LEAF_XRAY.end) * (1 - span(t, LEAF_XRAY.back[0], LEAF_XRAY.back[1]));
  const surfaceOpacity = 1 - 0.68 * xray;
  setOpacity(m.upper, surfaceOpacity);
  setOpacity(m.leafRim, surfaceOpacity);
  setOpacity(m.palisade, 1 - 0.55 * xray);
  setOpacity(m.rimPalisade, 1 - 0.55 * xray);
  m.vein.emissiveIntensity = 0.55 * xray;
  const sway = Math.sin(t * 0.9) * 0.025;
  // final scene: the small leaf turns gently in the foreground
  const turn = smoothstep(53.4, 55.5, t) * 0.32 * Math.sin((t - 53.4) * 0.55);
  const layers: { id: keyof typeof STACK; mats: THREE.Material[] }[] = [
    { id: "upperEpidermis", mats: [m.upper, m.bottomSide, m.leafRim] },
    { id: "palisade", mats: [m.palisade, m.palisade, m.rimPalisade] },
    { id: "spongy", mats: [m.spongy, m.spongy, m.rimSpongy] },
    { id: "lowerEpidermis", mats: [m.bottomSide, m.lower, m.leafRim] },
  ];
  const veins = poseOf("veins", t);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[sway, sway * 0.6, turn]}>
        {layers.map((l) => {
          const p = poseOf(l.id, t);
          return (
            <group key={l.id} position={p.position} quaternion={p.quaternion}>
              <mesh
                geometry={g.slabs[l.id]}
                material={l.mats}
                castShadow
                receiveShadow
                renderOrder={l.id === "upperEpidermis" ? 5 : l.id === "palisade" ? 4 : 1}
              />
            </group>
          );
        })}
        <group position={veins.position}>
          {g.veins.map((geo, i) => (
            <mesh key={i} geometry={geo} material={m.vein} castShadow />
          ))}
        </group>
      </group>
    </group>
  );
};

/** World anchor of a leaf layer (labels / callout), u,v on the leaf. */
export const leafAnchor = (id: string, t: number, u = 0.62, v = 0.82) => {
  const d = id in STACK ? STACK[id as keyof typeof STACK].d : 0;
  const local = leafPoint(u, v, d).add(poseOf(id, t).position);
  return local.multiplyScalar(LEAF.scale).applyEuler(LEAF.rotation).add(LEAF.position);
};
export const leafOpen = (t: number) => smoothstep(0, 1, poseOf("palisade", t).progress);
