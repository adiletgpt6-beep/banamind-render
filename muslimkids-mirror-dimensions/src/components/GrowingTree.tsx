// Растущее дерево: ветви вытягиваются последовательно (InstancedMesh с
// конусообразными сегментами), пучки листьев раскрываются после своей ветви.
// Тот же объект отражается в воде — рост виден одновременно и над водой, и в отражении.
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { generateTree } from "../geometry/tree";
import { clamp, smoother } from "../utils/math";

const BARK = new THREE.MeshStandardMaterial({ color: "#5A4232", roughness: 0.85, metalness: 0 });
const LEAF = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, metalness: 0, flatShading: false });

const seg = new THREE.CylinderGeometry(0.62, 1, 1, 9, 1, false).translate(0, 0.5, 0);
const leafGeo = (() => {
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 3).deleteAttribute("normal").deleteAttribute("uv"));
  const p = g.attributes.position as THREE.BufferAttribute;
  // неровная «крона-облачко»
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    const k = 1 + 0.16 * Math.sin(v.x * 5.1 + v.y * 3.3) * Math.cos(v.z * 4.2);
    v.multiplyScalar(k);
    v.y *= 0.78;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
})();

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export const GrowingTree: React.FC<{
  seed: number;
  growth: number; // 0..1
  position: [number, number, number];
  scale?: number;
  time: number;
  trunk?: number;
  sway?: number;
  leafTint?: number;
}> = ({ seed, growth, position, scale = 1, time, trunk = 3.2, sway = 1, leafTint = 1 }) => {
  const model = useMemo(() => generateTree(seed, { trunk }), [seed, trunk]);
  const bRef = useRef<THREE.InstancedMesh>(null);
  const lRef = useRef<THREE.InstancedMesh>(null);
  const leafMat = useMemo(() => LEAF.clone(), []);
  leafMat.color.setScalar(leafTint);

  useLayoutEffect(() => {
    const bm = bRef.current, lm = lRef.current;
    if (!bm || !lm) return;
    // вторичный рост: дерево постепенно становится толще и выше
    const girth = 0.18 + 0.82 * smoother(clamp(growth * 1.1));
    model.branches.forEach((b, i) => {
      const p = clamp((growth - b.birth) / b.span);
      const len = b.length * smoother(p);
      _q.setFromUnitVectors(UP, b.dir);
      const r = b.r0 * girth * (p > 0 ? 1 : 0);
      _s.set(r, Math.max(len, 1e-4), r);
      _m.compose(b.start, _q, _s);
      bm.setMatrixAt(i, _m);
    });
    bm.instanceMatrix.needsUpdate = true;
    model.leaves.forEach((l, i) => {
      const p = smoother(clamp((growth - l.birth * 0.82) / 0.14));
      const w = Math.sin(time * 1.3 + i * 0.7) * 0.03 * sway;
      _p.copy(l.pos).add(new THREE.Vector3(w, 0, w * 0.6).multiplyScalar(l.pos.y * 0.15));
      _q.identity();
      _s.setScalar(l.size * p + 1e-4);
      _m.compose(_p, _q, _s);
      lm.setMatrixAt(i, _m);
      lm.setColorAt(i, l.color);
    });
    lm.instanceMatrix.needsUpdate = true;
    if (lm.instanceColor) lm.instanceColor.needsUpdate = true;
  });

  return (
    <group position={position} scale={scale} rotation={[0, 0, Math.sin(time * 0.6) * 0.006 * sway]}>
      <instancedMesh ref={bRef} args={[seg, BARK, model.branches.length]} frustumCulled={false} />
      <instancedMesh ref={lRef} args={[leafGeo, leafMat, model.leaves.length]} frustumCulled={false} />
    </group>
  );
};
