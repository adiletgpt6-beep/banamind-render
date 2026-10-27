// Процедурная горная долина вокруг озера: гребенчатый шум для острых хребтов,
// несколько узнаваемых массивов со снежными вершинами, пологие зелёные берега.
// Детерминированно (сид), считается один раз.
import * as THREE from "three";
import { clamp, fbm2, ridged2, smooth } from "../utils/math";

export const LAKE = { rx: 52, rz: 64, cx: 0, cz: -6 };
/** Мыс на дальнем берегу, где растёт дерево. */
export const TREE_SPOT = { x: 14, z: -66 };
export const SPROUT_SPOT = { x: 18.6, z: -64.2 };

const PEAKS: [number, number, number, number][] = [
  // x, z, высота, радиус
  [-60, -330, 150, 95],
  [75, -365, 178, 105],
  [195, -300, 120, 85],
  [-205, -285, 128, 90],
  [-330, -120, 104, 95],
  [325, -140, 108, 95],
  [-260, 205, 92, 95],
  [255, 235, 96, 95],
  [0, 365, 88, 105],
];

export const heightAt = (x: number, z: number) => {
  const dx = (x - LAKE.cx) / LAKE.rx, dz = (z - LAKE.cz) / LAKE.rz;
  const r = Math.sqrt(dx * dx + dz * dz); // 1 — линия берега
  const shore = smooth((r - 0.92) / 0.5);
  let h = -4 + 4.6 * shore + 2.2 * smooth((r - 1.1) / 0.8);
  const rough = fbm2(x * 0.02, z * 0.02, 4, 3);
  h += shore * (rough - 0.4) * 4;
  // кольцо гор
  const ring = smooth((r - 1.8) / 2.2);
  h += ring * (ridged2(x * 0.006, z * 0.006, 6, 11) * 46 + fbm2(x * 0.025, z * 0.025, 3, 5) * 5);
  for (const [px, pz, ph, pr] of PEAKS) {
    const d2 = ((x - px) ** 2 + (z - pz) ** 2) / (pr * pr);
    const env = Math.exp(-d2 * 1.6);
    h += env * ph * (0.6 + 0.55 * ridged2(x * 0.011 + px, z * 0.011, 6, 23));
  }
  // плоский мыс для дерева
  const t = Math.exp(-(((x - TREE_SPOT.x) ** 2 + (z - TREE_SPOT.z) ** 2) / 70));
  h = h * (1 - t) + 1.1 * t;
  return h;
};

const C = {
  sand: new THREE.Color("#8C8A6A"),
  grass: new THREE.Color("#3E8A5F"),
  forest: new THREE.Color("#22573F"),
  rock: new THREE.Color("#5E6E80"),
  rockDark: new THREE.Color("#3A4658"),
};

export const createTerrainGeometry = (size = 940, seg = 440) => {
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  g.computeVertexNormals();
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const slope = 1 - nrm.getY(i);
    const n = fbm2(x * 0.08, z * 0.08, 3, 9);
    c.copy(C.sand);
    c.lerp(C.grass, smooth((y - 0.05) / 0.6));
    c.lerp(C.forest, smooth((y - 3 + n * 4) / 7) * 0.9);
    c.lerp(n > 0.5 ? C.rock : C.rockDark, clamp(smooth((y - 16 + n * 10) / 14) + smooth((slope - 0.35) / 0.25) * 0.7));
    // снег рисуется во фрагментном шейдере (чёткая граница по высоте и уклону)
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
};
