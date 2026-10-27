// PlantCell — magnified 3D section of leaf tissue ("Увеличенная схема"):
// epidermis cells (no chloroplasts), columnar palisade cells and rounded
// spongy cells with chloroplasts, nuclei, air spaces, a vascular bundle
// (the inside of a vein) and a stoma with two guard cells.
import React from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CELLS } from "../compositions/layout";
import { plantMaterials } from "../engines/LayerMaterialSystem";
import { easeOutCubic, seeded, span } from "../utils/math";

type Inst = THREE.Matrix4[];
let cache: {
  box: THREE.BufferGeometry; sphere: THREE.BufferGeometry; plast: THREE.BufferGeometry;
  tube: THREE.BufferGeometry; guard: THREE.BufferGeometry;
  epidermis: Inst; palisade: Inst; spongy: Inst; plastsP: Inst; plastsS: Inst; nuclei: Inst;
  xylem: Inst; phloem: Inst; sheath: Inst; guards: Inst; guardPlasts: Inst;
} | null = null;

const M = (p: THREE.Vector3, s: THREE.Vector3, q = new THREE.Quaternion()) => new THREE.Matrix4().compose(p, q, s);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Block: x ∈ [-0.8, 0.8], z ∈ [-0.5, 0.5], y ∈ [0, 1.15]
const build = () => {
  const rnd = seeded(2024);
  const q = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
  const epidermis: Inst = [], palisade: Inst = [], spongy: Inst = [];
  const plastsP: Inst = [], plastsS: Inst = [], nuclei: Inst = [];
  // upper + lower epidermis: flat tile cells (rows), stoma gap in the lower one
  for (const [y0, h] of [[1.02, 0.11], [0.0, 0.1]] as const)
    for (let i = 0; i < 8; i++)
      for (let k = 0; k < 5; k++) {
        const x = -0.7 + i * 0.2, z = -0.4 + k * 0.2;
        if (y0 === 0 && Math.abs(x - 0.1) < 0.12 && Math.abs(z) < 0.12) continue;
        epidermis.push(M(V(x, y0 + h / 2, z), V(0.19, h, 0.19)));
      }
  // palisade: tall columns
  for (let i = 0; i < 10; i++)
    for (let k = 0; k < 6; k++) {
      const x = -0.72 + i * 0.16 + (rnd() - 0.5) * 0.015, z = -0.42 + k * 0.168;
      const h = 0.38 + rnd() * 0.04;
      const c = V(x, 0.97 - h / 2, z);
      palisade.push(M(c, V(0.145, h, 0.15)));
      nuclei.push(M(c.clone().add(V(0.02, 0.08, 0.02)), V(0.035, 0.035, 0.035)));
      for (let n = 0; n < 9; n++) {
        const a = rnd() * Math.PI * 2;
        plastsP.push(M(
          c.clone().add(V(Math.cos(a) * 0.05, (rnd() - 0.5) * h * 0.8, Math.sin(a) * 0.05)),
          V(0.026, 0.016, 0.02), q(rnd() * 3, rnd() * 3, 0),
        ));
      }
    }
  // spongy: loose rounded cells, keep the bundle region free
  const placed: THREE.Vector3[] = [];
  for (let n = 0; n < 2000 && placed.length < 34; n++) {
    const p = V(-0.7 + rnd() * 1.4, 0.18 + rnd() * 0.33, -0.42 + rnd() * 0.84);
    if (Math.hypot(p.x + 0.3, p.y - 0.33) < 0.22) continue; // vascular bundle
    if (placed.some((o) => o.distanceTo(p) < 0.17)) continue;
    placed.push(p);
    const s = V(0.085 + rnd() * 0.03, 0.065 + rnd() * 0.02, 0.08 + rnd() * 0.03);
    spongy.push(M(p, s, q(rnd(), rnd(), rnd())));
    nuclei.push(M(p.clone().add(V(0.02, 0.01, 0)), V(0.028, 0.028, 0.028)));
    for (let k = 0; k < 5; k++)
      plastsS.push(M(
        p.clone().add(V((rnd() - 0.5) * s.x, (rnd() - 0.5) * s.y, (rnd() - 0.5) * s.z)),
        V(0.024, 0.015, 0.019), q(rnd() * 3, rnd() * 3, 0),
      ));
  }
  // vascular bundle along z (a vein in section): xylem, phloem, sheath
  const along = q(Math.PI / 2, 0, 0);
  const xylem: Inst = [], phloem: Inst = [], sheath: Inst = [];
  for (const [dx, dy] of [[-0.05, 0.05], [0.0, 0.07], [0.05, 0.04], [-0.02, 0.0]] as const)
    xylem.push(M(V(-0.3 + dx, 0.36 + dy, 0), V(0.035, 0.98, 0.035), along));
  for (const [dx, dy] of [[-0.06, -0.07], [0.0, -0.09], [0.06, -0.06], [0.04, 0.0]] as const)
    phloem.push(M(V(-0.3 + dx, 0.33 + dy, 0), V(0.022, 0.98, 0.022), along));
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    sheath.push(M(V(-0.3 + Math.cos(a) * 0.16, 0.33 + Math.sin(a) * 0.15, 0), V(0.045, 0.98, 0.045), along));
  }
  // stoma: two kidney-shaped guard cells (with chloroplasts)
  const guards: Inst = [], guardPlasts: Inst = [];
  for (const side of [-1, 1]) {
    const c = V(0.1 + side * 0.045, 0.05, 0);
    guards.push(M(c, V(1, 1, 1), q(0, side > 0 ? Math.PI : 0, 0)));
    for (let k = 0; k < 4; k++)
      guardPlasts.push(M(c.clone().add(V(side * 0.012, 0, -0.06 + k * 0.04)), V(0.016, 0.012, 0.014)));
  }
  const guardGeo = new THREE.TorusGeometry(0.075, 0.032, 12, 24, Math.PI);
  guardGeo.rotateY(Math.PI / 2);
  return {
    box: new RoundedBoxGeometry(1, 1, 1, 3, 0.18),
    sphere: new THREE.SphereGeometry(1, 20, 14),
    plast: new THREE.SphereGeometry(1, 12, 8),
    tube: new THREE.CylinderGeometry(1, 1, 1, 14, 1, true),
    guard: guardGeo,
    epidermis, palisade, spongy, plastsP, plastsS, nuclei, xylem, phloem, sheath, guards, guardPlasts,
  };
};
const geometries = () => (cache ??= build());

const Instances: React.FC<{ geo: THREE.BufferGeometry; mat: THREE.Material; items: Inst; order?: number; shadow?: boolean }> = ({
  geo, mat, items, order = 0, shadow = false,
}) => {
  const ref = React.useCallback(
    (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      items.forEach((mx, i) => mesh.setMatrixAt(i, mx));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    },
    [items],
  );
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} renderOrder={order} castShadow={shadow} receiveShadow />;
};

/** Grows out of the leaf (31.4–32.4 s) and folds back (34.6–35.4 s). */
export const cellsAppear = (t: number) =>
  easeOutCubic(span(t, 31.35, 32.45)) * (1 - easeOutCubic(span(t, 34.6, 35.45)));

export const PlantCell: React.FC<{ t: number }> = ({ t }) => {
  const k = cellsAppear(t);
  if (k < 0.002) return null;
  const g = geometries();
  const m = plantMaterials();
  const s = CELLS.scale * (0.15 + 0.85 * k);
  return (
    <group position={CELLS.position} rotation={CELLS.rotation} scale={s}>
      <group position={[0, -0.57, 0]} rotation={[0, t * 0.05, 0]}>
        <Instances geo={g.plast} mat={m.chloroplast} items={g.plastsP} shadow />
        <Instances geo={g.plast} mat={m.chloroplast} items={g.plastsS} shadow />
        <Instances geo={g.plast} mat={m.chloroplast} items={g.guardPlasts} />
        <Instances geo={g.sphere} mat={m.nucleus} items={g.nuclei} />
        <Instances geo={g.tube} mat={m.xylem} items={g.xylem} shadow />
        <Instances geo={g.tube} mat={m.phloem} items={g.phloem} />
        <Instances geo={g.guard} mat={m.cellWall} items={g.guards} order={6} />
        <Instances geo={g.box} mat={m.cellWallBack} items={g.palisade} order={5} />
        <Instances geo={g.sphere} mat={m.cellWallBack} items={g.spongy} order={5} />
        <Instances geo={g.tube} mat={m.bundleSheath} items={g.sheath} order={6} />
        <Instances geo={g.box} mat={m.cellWall} items={g.palisade} order={7} />
        <Instances geo={g.sphere} mat={m.cellWall} items={g.spongy} order={7} />
        <Instances geo={g.box} mat={m.epidermisCell} items={g.epidermis} order={8} />
      </group>
    </group>
  );
};
