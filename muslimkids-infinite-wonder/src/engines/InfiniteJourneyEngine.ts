// INFINITE JOURNEY ENGINE
//
// Всё путешествие описано одной «осью масштаба» s:
//   0 — вся картина на холсте, 1 — нарисованная Земля, 2 — Земля поднялась,
//   3 — орбита (день/ночь), 4 — над горами Земли, 5 — в облаках,
//   6 — горы, 7 — долина, 8 — дерево, 9 — ветка, 10 — лист,
//   11 — увеличенная схема среза, 12 — ткань, 13 — клетка.
// Камера, раскрытие слоёв, прозрачность и превращение краски — функции s.
// Прямой путь и «Великое возвращение» — две гладкие кривые t → s,
// поэтому возвращение собирает лист и уплощает Землю ровно в обратном
// порядке, без отдельной «обратной нарезки».
import { Matrix4, Quaternion, Vector3 } from "three";
import timeline from "../timeline.json";
import { DEG, MonotoneCurve, Pose, PoseTrack, smootherstep } from "./CameraTransitionEngine";
import { HERO, HERO_VIEW } from "../geometry/tree";
import { TREE_SPOT } from "../geometry/terrain";
import { BLOCK, palisadeCellCenter } from "./LayerDiscoveryEngine";

const fwd = new MonotoneCurve(timeline.forward.map((p) => p[0]), timeline.forward.map((p) => p[1]));
const back = new MonotoneCurve(timeline.return.map((p) => p[0]), timeline.return.map((p) => p[1]));
export const RETURN_START = timeline.return[0][0];

export function journeyS(t: number) {
  return t < RETURN_START ? fwd.at(t) : back.at(t);
}

/** Мир, в котором находится камера: космос/холст или природа. */
export const WORLD_SWITCH = 5;

// ---------- Земля ----------
export const EARTH_TILT = 23.4 * DEG;
/** Регион погружения: горы и леса Центральной Азии (≈ 75° в. д., 42° с. ш.). */
const REGION = { lon: 75.5 * DEG, lat: 42.2 * DEG };
const regionLocal = new Vector3(
  Math.cos(REGION.lat) * Math.cos(REGION.lon),
  Math.sin(REGION.lat),
  -Math.cos(REGION.lat) * Math.sin(REGION.lon),
);

export function earthQuaternion(theta: number) {
  const tilt = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), EARTH_TILT);
  const spin = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), theta);
  return tilt.multiply(spin);
}

/** Угол, при котором регион смотрит на камеру подлёта (азимут ≈ +18°). */
const THETA_LOCK = (() => {
  let best = 0;
  let bestErr = Infinity;
  for (let i = 0; i < 7200; i++) {
    const th = (i / 7200) * Math.PI * 2;
    const d = regionLocal.clone().applyQuaternion(earthQuaternion(th));
    if (d.z <= 0) continue;
    const err = Math.abs(Math.atan2(d.x, d.z) - 18 * DEG);
    if (err < bestErr) {
      bestErr = err;
      best = th;
    }
  }
  return best;
})();
export const REGION_DIR = regionLocal.clone().applyQuaternion(earthQuaternion(THETA_LOCK));
const REGION_AZ = Math.atan2(REGION_DIR.x, REGION_DIR.z) / DEG;
const REGION_EL = Math.asin(REGION_DIR.y) / DEG;

// Земля вращается вокруг своей оси (а не Солнце вокруг Земли): за прямой
// путь — 285°, за возвращение — ещё 75°, ровно полный оборот. Поэтому
// финальная картина совпадает с той, с которой всё началось.
const SPIN_FWD = 285 * DEG;
const SPIN_BACK = 75 * DEG;
const THETA0 = THETA_LOCK - SPIN_FWD;
const omega = SPIN_FWD / 8.2;
const spinFwd = new MonotoneCurve(
  [5.0, 6.0, 12.7, 14.7],
  [THETA0, THETA0 + omega * 0.5, THETA0 + omega * 7.2, THETA_LOCK],
);

export function earthSpin(t: number) {
  if (t < RETURN_START) return spinFwd.at(t);
  return THETA_LOCK + SPIN_BACK * smootherstep(49.3, 51.35, t);
}

export const EARTH_LIFT = 1.6;
export const earthLift = (s: number) => EARTH_LIFT * smootherstep(1.0, 2.0, s);

// ---------- ключевые позы камеры ----------
const surface = (alt: number): [number, number, number] => {
  const p = REGION_DIR.clone().multiplyScalar(1 + alt).add(new Vector3(0, 0, EARTH_LIFT));
  return [p.x, p.y, p.z];
};

export const SPACE_TRACK = new PoseTrack([
  { s: 0, pose: { target: [0, -0.5, 0], dist: 13.2, az: 0, el: 0, fov: 35 } },
  { s: 1, pose: { target: [0, 0, 0], dist: 7.4, az: 0, el: 0, fov: 35 } },
  { s: 2, pose: { target: [0, 0, EARTH_LIFT], dist: 6.3, az: -22, el: 9, fov: 35 } },
  { s: 2.55, pose: { target: [0, 0, EARTH_LIFT], dist: 5.6, az: -30, el: 13, fov: 35 } },
  { s: 3, pose: { target: [0, 0, EARTH_LIFT], dist: 5.0, az: -34, el: 15, fov: 35 } },
  { s: 4, pose: { target: surface(0), dist: 0.7, az: REGION_AZ - 6, el: REGION_EL - 18, fov: 38 } },
  { s: 5, pose: { target: surface(0), dist: 0.045, az: REGION_AZ + 4, el: REGION_EL - 4, fov: 40 } },
]);

/** Камера в начале: макросъёмка бумаги и капли. */
export const MACRO_POSE: Pose = { target: [0, 0, 0], dist: 1.7, az: 0, el: 0, fov: 35 };

// ---------- природа ----------
export const TREE = new Vector3(TREE_SPOT.x, TREE_SPOT.y, TREE_SPOT.z);
export const LEAF_CENTER = TREE.clone().add(HERO.center);

/** Поза увеличенного блока среза в мире (после «вылета» из листа). */
export const BLOCK_WORLD = (() => {
  const pos = LEAF_CENTER.clone().add(HERO.n.clone().multiplyScalar(0.05)).add(new Vector3(0, 0.004, 0));
  const quat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), HERO_VIEW.az * DEG);
  const scale = 0.075 / BLOCK.sizeX;
  return { pos, quat, scale };
})();

/** Поза блока на поверхности листа (кусочек, который будет увеличен). */
export const BLOCK_ON_LEAF = (() => {
  const pos = LEAF_CENTER.clone().add(HERO.x.clone().multiplyScalar(0.012));
  // Ось y блока — по нормали листа, ось x — вдоль листа.
  const z = new Vector3().crossVectors(HERO.x, HERO.n).normalize();
  const m = new Matrix4().makeBasis(HERO.x, HERO.n, z);
  const quat = new Quaternion().setFromRotationMatrix(m);
  const scale = 0.011 / BLOCK.sizeX;
  return { pos, quat, scale };
})();

export function blockMatrix(pos: Vector3, quat: Quaternion, scale: number) {
  return new Matrix4().compose(pos, quat, new Vector3(scale, scale, scale));
}

const FOCUS_CELL = palisadeCellCenter();
const focusWorld = (explode: number) =>
  FOCUS_CELL.clone()
    .add(new Vector3(0, BLOCK.explode.palisade * explode, 0))
    .applyMatrix4(blockMatrix(BLOCK_WORLD.pos, BLOCK_WORLD.quat, BLOCK_WORLD.scale));
export const FOCUS_CELL_WORLD = focusWorld(1);

const v = (p: Vector3): [number, number, number] => [p.x, p.y, p.z];
const blockCenter = BLOCK_WORLD.pos.clone().add(new Vector3(0, BLOCK.sizeY * 0.55 * BLOCK_WORLD.scale, 0));

export const NATURE_TRACK = new PoseTrack([
  { s: 5, pose: { target: [TREE.x - 320, 0, TREE.z - 140], dist: 2400, az: 12, el: 80, fov: 40 } },
  { s: 6, pose: { target: [TREE.x + 260, 140, TREE.z - 80], dist: 1500, az: -66, el: 19, fov: 38 } },
  { s: 7, pose: { target: [TREE.x, TREE.y + 12, TREE.z], dist: 230, az: -78, el: 9, fov: 36 } },
  { s: 8, pose: { target: [TREE.x, TREE.y + 4.6, TREE.z], dist: 16.5, az: -56, el: 6, fov: 35 } },
  { s: 9, pose: { target: v(LEAF_CENTER), dist: 1.45, az: -42, el: 14, fov: 35 } },
  { s: 10, pose: { target: v(LEAF_CENTER), dist: 0.165, az: HERO_VIEW.az, el: HERO_VIEW.el, fov: 35 } },
  { s: 11, pose: { target: v(blockCenter), dist: 0.235, az: HERO_VIEW.az + 24, el: 26, fov: 35 } },
  { s: 12, pose: { target: v(FOCUS_CELL_WORLD), dist: 0.06, az: HERO_VIEW.az + 12, el: 13, fov: 35 } },
  { s: 13, pose: { target: v(FOCUS_CELL_WORLD), dist: 0.021, az: HERO_VIEW.az + 5, el: 7, fov: 36 } },
]);

export function cameraPose(t: number, s: number): Pose {
  if (s >= WORLD_SWITCH) return NATURE_TRACK.at(s);
  const p = SPACE_TRACK.at(s);
  // Начало: макро → кадр всей нарисованной Земли, пока краска растекается.
  if (t < RETURN_START && s <= 1.0001) {
    const k = smootherstep(0.9, 4.6, t);
    return {
      target: p.target,
      dist: Math.exp(Math.log(MACRO_POSE.dist) + (Math.log(p.dist) - Math.log(MACRO_POSE.dist)) * k),
      az: 0,
      el: 0,
      fov: 35,
    };
  }
  return p;
}

/** Поза блока среза при вылете из листа (emerge 0 → 1). */
export function blockTransform(emerge: number) {
  const e = emerge;
  const pos = BLOCK_ON_LEAF.pos.clone().lerp(BLOCK_WORLD.pos, e);
  pos.add(HERO.n.clone().multiplyScalar(0.012 * Math.sin(Math.PI * e)));
  const quat = BLOCK_ON_LEAF.quat.clone().slerp(BLOCK_WORLD.quat, smootherstep(0.1, 0.9, e));
  const scale = Math.exp(Math.log(BLOCK_ON_LEAF.scale) + (Math.log(BLOCK_WORLD.scale) - Math.log(BLOCK_ON_LEAF.scale)) * e);
  return { pos, quat, scale, matrix: blockMatrix(pos, quat, scale) };
}
