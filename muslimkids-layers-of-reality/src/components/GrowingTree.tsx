// GrowingTree — procedural tree on a small soil island (seeded branching,
// tapered tube branches, instanced leaves). One leaf is singled out with a
// golden outline before the camera moves to the magnified leaf model.
import React from "react";
import * as THREE from "three";
import { TREE } from "../compositions/layout";
import { TREE_HERO_LEAF_LOCAL } from "../compositions/shots";
import { plantMaterials } from "../engines/LayerMaterialSystem";
import { seeded, smoothstep, window4 } from "../utils/math";
import { CUE } from "../compositions/cues";

type Branch = { geo: THREE.TubeGeometry; tip: THREE.Vector3 };
let cache: {
  branches: Branch[]; leaf: THREE.BufferGeometry; leaves: { m: THREE.Matrix4; c: THREE.Color }[];
  island: THREE.BufferGeometry; heroQuat: THREE.Quaternion;
} | null = null;

const leafShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.05, 0.04, 0.07, 0.12, 0, 0.2);
  s.bezierCurveTo(-0.07, 0.12, -0.05, 0.04, 0, 0);
  const g = new THREE.ShapeGeometry(s, 6);
  // slight fold along the midrib
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.abs(p.getX(i)) * 0.35);
  g.computeVertexNormals();
  return g;
};

const build = () => {
  const rnd = seeded(77);
  const branches: Branch[] = [];
  const grow = (start: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
    const pts = [start.clone()];
    const d = dir.clone();
    let p = start.clone();
    for (let i = 1; i <= 4; i++) {
      d.add(new THREE.Vector3((rnd() - 0.5) * 0.25, 0.06, (rnd() - 0.5) * 0.25)).normalize();
      p = p.clone().addScaledVector(d, len / 4);
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 16, r, 8, false);
    // taper along the branch
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const seg = Math.floor(i / 9) / 16;
      const c = curve.getPoint(seg);
      const v = new THREE.Vector3().fromBufferAttribute(pos, i).sub(c).multiplyScalar(1 - 0.55 * seg);
      pos.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z);
    }
    geo.computeVertexNormals();
    branches.push({ geo, tip: p.clone() });
    if (depth > 0) {
      const n = depth === 3 ? 4 : 3;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + rnd() * 0.8;
        const nd = d.clone().multiplyScalar(0.9).add(new THREE.Vector3(Math.cos(a), 0.15, Math.sin(a)).multiplyScalar(0.75)).normalize();
        const from = curve.getPoint(0.7 + rnd() * 0.3);
        grow(from, nd, len * (0.62 + rnd() * 0.1), r * 0.55, depth - 1);
      }
    }
  };
  grow(new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 1, 0), 0.62, 0.075, 3);
  // leaves in clusters around branch tips
  const leaves: { m: THREE.Matrix4; c: THREE.Color }[] = [];
  const greens = ["#2F8A4E", "#45AD80", "#3B9B5E", "#5DBB78", "#2B7A46"];
  for (const b of branches.slice(-48)) {
    for (let k = 0; k < 16; k++) {
      const p = b.tip.clone().add(new THREE.Vector3((rnd() - 0.5) * 0.36, (rnd() - 0.4) * 0.28, (rnd() - 0.5) * 0.36));
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6));
      const s = 0.8 + rnd() * 0.45;
      leaves.push({ m: new THREE.Matrix4().compose(p, q, new THREE.Vector3(s, s, s)), c: new THREE.Color(greens[Math.floor(rnd() * greens.length)]) });
    }
  }
  // soil island with turf
  const island = new THREE.CylinderGeometry(0.85, 0.7, 0.26, 48, 3);
  const cols: number[] = [];
  const pos = island.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const c = new THREE.Color(y > 0.1 ? "#4FA46E" : y > 0.0 ? "#7B5B40" : "#5E4532");
    cols.push(c.r, c.g, c.b);
  }
  island.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  island.translate(0, -0.03, 0);
  const heroQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.05, 0.3, -0.7));
  return { branches, leaf: leafShape(), leaves, island, heroQuat };
};
const geometries = () => (cache ??= build());

export const GrowingTree: React.FC<{ t: number }> = ({ t }) => {
  const g = geometries();
  const m = plantMaterials();
  const sway = Math.sin(t * 1.1) * 0.018 + Math.sin(t * 2.3) * 0.006;
  const ref = React.useCallback(
    (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      g.leaves.forEach((l, i) => {
        mesh.setMatrixAt(i, l.m);
        mesh.setColorAt(i, l.c);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    },
    [g],
  );
  const glow = window4(t, CUE.leaf - 0.1, CUE.leaf + 0.5, 26.9, 27.2);
  m.highlight.opacity = glow;
  const heroS = 1.9 * (1 + 0.08 * smoothstep(CUE.leaf, CUE.leaf + 0.6, t));
  return (
    <group position={TREE.position} scale={TREE.scale}>
      <mesh geometry={g.island} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={0.85} />
      </mesh>
      <group rotation={[sway, 0, sway * 0.7]}>
        {g.branches.map((b, i) => (
          <mesh key={i} geometry={b.geo} material={m.bark} castShadow receiveShadow />
        ))}
        <instancedMesh ref={ref} args={[g.leaf, m.foliage, g.leaves.length]} castShadow receiveShadow />
        <group position={TREE_HERO_LEAF_LOCAL} quaternion={g.heroQuat} scale={heroS}>
          <mesh geometry={g.leaf} castShadow>
            <meshStandardMaterial color="#58B47A" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          {glow > 0.01 && (
            <mesh geometry={g.leaf} material={m.highlight} scale={1.12} position={[0, -0.01, -0.004]} />
          )}
        </group>
      </group>
    </group>
  );
};
