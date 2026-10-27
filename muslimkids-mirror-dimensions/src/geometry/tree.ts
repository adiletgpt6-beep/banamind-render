// Процедурное дерево с «временем рождения» каждой ветви и каждого пучка листьев:
// ствол → ветви → веточки → листва появляются последовательно (не масштабирование картинки).
import * as THREE from "three";
import { mulberry32 } from "../utils/math";

export type Branch = {
  start: THREE.Vector3; // в финальных координатах
  dir: THREE.Vector3;
  length: number;
  r0: number;
  r1: number;
  depth: number;
  birth: number; // 0..1 — когда начинает расти
  span: number; // длительность роста (в долях g)
};

export type LeafCluster = { pos: THREE.Vector3; size: number; birth: number; color: THREE.Color; branch: number; along: number };

export type TreeModel = { branches: Branch[]; leaves: LeafCluster[]; height: number };

const UP = new THREE.Vector3(0, 1, 0);

export const generateTree = (seed: number, opts?: { depth?: number; trunk?: number; spread?: number }): TreeModel => {
  const rnd = mulberry32(seed);
  const maxDepth = opts?.depth ?? 4;
  const branches: Branch[] = [];
  const leaves: LeafCluster[] = [];
  const greens = ["#2F7D55", "#439C78", "#3A8F5E", "#5BAE6E", "#2A6B4B"].map((c) => new THREE.Color(c));

  const grow = (b: Branch) => {
    const idx = branches.push(b) - 1;
    if (b.depth >= 2) {
      const n = b.depth === maxDepth ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const along = b.depth === maxDepth ? 0.55 + 0.45 * (i / (n - 1)) : 0.65 + rnd() * 0.35;
        const p = b.start.clone().addScaledVector(b.dir, b.length * along);
        p.add(new THREE.Vector3(rnd() - 0.5, rnd() * 0.5, rnd() - 0.5).multiplyScalar(b.length * 0.25));
        leaves.push({
          pos: p,
          size: (0.5 + rnd() * 0.45) * (b.depth === maxDepth ? 0.85 : 1.05) * (opts?.trunk ?? 3.2) * 0.2,
          birth: b.birth + b.span * along + 0.04,
          color: greens[Math.floor(rnd() * greens.length)].clone().offsetHSL(0, 0, (rnd() - 0.5) * 0.06),
          branch: idx,
          along,
        });
      }
    }
    if (b.depth >= maxDepth) return;
    const kids = b.depth === 0 ? 3 : 2 + (rnd() > 0.45 ? 1 : 0);
    const az0 = rnd() * Math.PI * 2;
    for (let i = 0; i < kids; i++) {
      const f = b.depth === 0 ? 0.55 + 0.4 * (i / kids) + rnd() * 0.06 : 0.5 + rnd() * 0.45;
      const az = az0 + i * 2.39996; // золотой угол
      const tilt = ((b.depth === 0 ? 34 : 30) + rnd() * 16) * (Math.PI / 180) * (opts?.spread ?? 1);
      const perp = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
      perp.addScaledVector(b.dir, -perp.dot(b.dir)).normalize();
      const dir = b.dir.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(perp, Math.sin(tilt));
      dir.lerp(UP, 0.18).normalize();
      const start = b.start.clone().addScaledVector(b.dir, b.length * f);
      const rAt = b.r0 + (b.r1 - b.r0) * f;
      grow({
        start,
        dir,
        length: b.length * (0.62 + rnd() * 0.16),
        r0: rAt * 0.72,
        r1: rAt * 0.72 * 0.55,
        depth: b.depth + 1,
        birth: b.birth + b.span * f,
        span: b.span * 0.82,
      });
    }
  };

  const trunk = opts?.trunk ?? 3.2;
  grow({
    start: new THREE.Vector3(0, 0, 0),
    dir: new THREE.Vector3(0.04, 1, 0.02).normalize(),
    length: trunk,
    r0: trunk * 0.075,
    r1: trunk * 0.05,
    depth: 0,
    birth: 0,
    span: 0.3,
  });
  // нормировка времени: всё дерево вырастает к g = 1
  const end = Math.max(...branches.map((b) => b.birth + b.span), ...leaves.map((l) => l.birth + 0.12));
  for (const b of branches) { b.birth /= end; b.span /= end; }
  for (const l of leaves) l.birth /= end;
  let height = 0;
  for (const b of branches) height = Math.max(height, b.start.y + b.dir.y * b.length);
  return { branches, leaves, height };
};
