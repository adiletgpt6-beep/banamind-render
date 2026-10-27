import * as THREE from "three";
import type { Cam } from "./three/stage";

// Камеры для вертикального кадра 9:16: горизонтальный угол обзора узкий,
// поэтому два персонажа «помещаются» только с расчётным расстоянием.
const ASPECT = 1080 / 1920;
const hHalf = (fov: number) => Math.atan(Math.tan(((fov / 2) * Math.PI) / 180) * ASPECT);

// Двухплан: камера на стороне toward (точка, откуда смотреть), оба
// объекта a и b (головы) — в кадре с запасом margin (м) по краям.
export const twoShot = (a: THREE.Vector3, b: THREE.Vector3, toward: THREE.Vector3, fov = 38, margin = 0.22, drop = 0.18): Cam => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const s = b.clone().sub(a).setY(0);
  const half = s.length() / 2 + margin;
  let n = new THREE.Vector3(-s.z, 0, s.x).normalize();
  const to = toward.clone().sub(mid).setY(0);
  if (n.dot(to) < 0) n = n.negate();
  // немного развернуть к желаемой точке (не строго перпендикулярно)
  n.lerp(to.normalize(), 0.35).normalize();
  const dist = half / Math.tan(hHalf(fov));
  const target = mid.clone().add(new THREE.Vector3(0, -drop, 0));
  const pos = target.clone().add(n.multiplyScalar(dist)).add(new THREE.Vector3(0, drop * 0.6, 0));
  return { pos, target, fov };
};

// Средний/крупный план: камера на расстоянии dist от точки p, со стороны dir.
export const single = (p: THREE.Vector3, dir: THREE.Vector3, dist: number, fov = 34, drop = 0.1, up = 0): Cam => {
  const target = p.clone().add(new THREE.Vector3(0, -drop, 0));
  const d = dir.clone().setY(0).normalize();
  return { pos: target.clone().add(d.multiplyScalar(dist)).add(new THREE.Vector3(0, up + drop * 0.5, 0)), target, fov };
};

// Плавный переход между двумя камерами (k 0..1).
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => {
  const s = k * k * (3 - 2 * k);
  return { pos: a.pos.clone().lerp(b.pos, s), target: a.target.clone().lerp(b.target, s), fov: (a.fov ?? 38) + ((b.fov ?? 38) - (a.fov ?? 38)) * s };
};

// Камера через плечо персонажа (голова head, смотрит на target), со стороны
// side («L» — его левое плечо, «R» — правое).
export const overShoulder = (head: THREE.Vector3, target: THREE.Vector3, side: "L" | "R", back = 0.5, out = 0.22, up = 0.08, fov = 34): Cam => {
  const f = target.clone().sub(head).setY(0).normalize();
  const left = new THREE.Vector3(f.z, 0, -f.x);
  const pos = head.clone().sub(f.clone().multiplyScalar(back)).add(left.multiplyScalar(side === "L" ? out : -out)).add(new THREE.Vector3(0, up, 0));
  return { pos, target, fov };
};
