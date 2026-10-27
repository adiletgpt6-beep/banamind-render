// Процедурное дерево с ветвлением и главным листом.
// Координаты — в системе дерева (основание ствола в начале координат).
import {
  BufferGeometry,
  CatmullRomCurve3,
  Matrix4,
  Quaternion,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry32 } from "../utils/random";

export type LeafInstance = { pos: Vector3; quat: Quaternion; scale: number; tint: number; phase: number };

type Branch = { curve: CatmullRomCurve3; r0: number; r1: number; depth: number };

/** Куда смотрит камера на главный лист — лицевая сторона листа к ней. */
export const HERO_VIEW = { az: -36, el: 22 };
/** Основание черешка главного листа (система дерева). */
export const HERO_BASE = new Vector3(-1.85, 4.25, 2.55);
export const HERO_LEN = 0.1;

const DEG = Math.PI / 180;

function heroFrame() {
  const az = HERO_VIEW.az * DEG;
  const el = HERO_VIEW.el * DEG;
  const n = new Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  // Верхушка листа смотрит вниз по кадру и немного вбок — лист «висит».
  const down = new Vector3(0.18, -1, 0.05);
  const x = down.sub(n.clone().multiplyScalar(down.dot(n))).normalize();
  const z = new Vector3().crossVectors(x, n).normalize();
  const m = new Matrix4().makeBasis(x, n, z);
  return { quat: new Quaternion().setFromRotationMatrix(m), x, n };
}

export const HERO = (() => {
  const f = heroFrame();
  const petiole = 0.022;
  const bladeBase = HERO_BASE.clone().add(f.x.clone().multiplyScalar(petiole));
  const center = bladeBase.clone().add(f.x.clone().multiplyScalar(HERO_LEN * 0.5));
  return { ...f, petiole, bladeBase, center };
})();

export function buildTree() {
  const rnd = mulberry32(77);
  const branches: Branch[] = [];
  const leaves: LeafInstance[] = [];
  const blobs: { pos: Vector3; r: number }[] = [];

  const grow = (start: Vector3, dir: Vector3, len: number, r0: number, depth: number) => {
    const pts = [start.clone()];
    const d = dir.clone().normalize();
    let p = start.clone();
    const steps = 4;
    for (let i = 1; i <= steps; i++) {
      // Лёгкая кривизна и тяга вверх к свету.
      d.add(new Vector3((rnd() - 0.5) * 0.35, 0.12, (rnd() - 0.5) * 0.35)).normalize();
      p = p.clone().add(d.clone().multiplyScalar(len / steps));
      pts.push(p);
    }
    const curve = new CatmullRomCurve3(pts);
    const r1 = r0 * 0.55;
    branches.push({ curve, r0, r1, depth });
    if (depth >= 3) {
      clusterAt(curve.getPoint(0.9), 0.55);
      return;
    }
    const kids = depth === 0 ? 5 : 3;
    for (let k = 0; k < kids; k++) {
      const t = depth === 0 ? 1 : 0.45 + 0.55 * (k / (kids - 1));
      const at = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const azi = (k / kids) * Math.PI * 2 + rnd() * 0.8 + depth;
      const spread = depth === 0 ? 0.95 : 0.7;
      const side = new Vector3(Math.cos(azi), 0.15, Math.sin(azi));
      const nd = tan.clone().multiplyScalar(depth === 0 ? 0.55 : 0.8).add(side.multiplyScalar(spread));
      grow(at, nd, len * (depth === 0 ? 0.78 : 0.62), r0 * (depth === 0 ? 0.48 : 0.6), depth + 1);
    }
    if (depth >= 2) clusterAt(curve.getPoint(0.7), 0.4);
  };

  const clusterAt = (c: Vector3, radius: number) => {
    blobs.push({ pos: c.clone(), r: radius * 0.55 });
    const n = 150;
    for (let i = 0; i < n; i++) {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const rr = radius * Math.cbrt(0.25 + 0.75 * rnd());
      const off = new Vector3(Math.sqrt(1 - u * u) * Math.cos(th), u * 0.8, Math.sqrt(1 - u * u) * Math.sin(th)).multiplyScalar(rr);
      const pos = c.clone().add(off);
      // Не заслоняем главный лист от камеры.
      if (occludesHero(pos)) continue;
      const out = off.clone().normalize();
      const q = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), out.clone().add(new Vector3(0, -0.6, 0)).normalize());
      q.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), (rnd() - 0.5) * 2.4));
      leaves.push({ pos, quat: q, scale: 1.05 + rnd() * 0.5, tint: rnd(), phase: rnd() * 6.28 });
    }
  };

  grow(new Vector3(0, 0, 0), new Vector3(0.05, 1, 0.02), 3.3, 0.3, 0);

  // Веточка к главному листу: от ближайшей ветви к основанию черешка.
  let best = branches[0];
  let bestT = 0;
  let bestD = Infinity;
  for (const b of branches) {
    if (b.depth < 1 || b.depth > 2) continue;
    for (let t = 0.3; t <= 1; t += 0.05) {
      const d = b.curve.getPoint(t).distanceTo(HERO_BASE);
      if (d < bestD) {
        bestD = d;
        best = b;
        bestT = t;
      }
    }
  }
  const from = best.curve.getPoint(bestT);
  const mid = from.clone().lerp(HERO_BASE, 0.5).add(new Vector3(0, 0.12, 0));
  const twig = new CatmullRomCurve3([from, mid, HERO_BASE.clone().add(new Vector3(0.0, 0.015, 0))]);
  branches.push({ curve: twig, r0: Math.max(0.012, best.r0 * 0.35), r1: 0.0035, depth: 4 });
  // Соседние листья на той же веточке — живой контекст, но не перед камерой.
  for (let i = 0; i < 9; i++) {
    const t = 0.35 + i * 0.07;
    const p = twig.getPoint(t);
    const side = i % 2 ? 1 : -1;
    const dir = new Vector3(side * 0.6, -0.7, -0.5 + rnd() * 0.3).normalize();
    const q = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), dir);
    q.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), side * 0.9));
    const pos = p.clone().add(new Vector3(0, -0.01, -0.03));
    if (!occludesHero(pos, 0.07)) leaves.push({ pos, quat: q, scale: 0.9 + 0.2 * rnd(), tint: rnd(), phase: rnd() * 6.28 });
  }

  const tubes: BufferGeometry[] = branches.map((b) => {
    const seg = b.depth === 0 ? 24 : b.depth >= 4 ? 16 : 10;
    const g = new TubeGeometry(b.curve, seg, 1, b.depth <= 1 ? 10 : 6, false);
    // Сужение к концу ветви: масштабируем кольца трубки.
    const pos = g.attributes.position;
    const rings = seg + 1;
    const radial = (b.depth <= 1 ? 10 : 6) + 1;
    for (let i = 0; i < rings; i++) {
      const t = i / seg;
      const c = b.curve.getPoint(t);
      const r = b.r0 + (b.r1 - b.r0) * t;
      for (let j = 0; j < radial; j++) {
        const k = i * radial + j;
        const v = new Vector3(pos.getX(k), pos.getY(k), pos.getZ(k)).sub(c).multiplyScalar(r).add(c);
        pos.setXYZ(k, v.x, v.y, v.z);
      }
    }
    g.computeVertexNormals();
    return g;
  });
  const bark = mergeGeometries(tubes);
  return { bark, leaves, blobs, twig };
}

/** Лист заслоняет главный, если лежит у отрезка «главный лист → камера». */
function occludesHero(p: Vector3, minR = 0.32) {
  const a = HERO.center;
  const dir = HERO.n;
  const ap = p.clone().sub(a);
  const t = ap.dot(dir);
  if (t < -0.05 || t > 3.5) return false;
  const perp = ap.sub(dir.clone().multiplyScalar(t)).length();
  return perp < minR + t * 0.35;
}
