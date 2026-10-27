import * as THREE from "three";
import { clamp } from "../utils/math";

/**
 * PaperFoldEngine — геометрия складной бумаги.
 *
 * Каждая функция строит НАСТОЯЩУЮ трёхмерную форму из плоских граней,
 * которые поворачиваются вокруг линий сгиба (шарниров). Параметр fold:
 * 0 — заготовка лежит плоско на странице, 1 — конструкция собрана.
 */

export type V2 = [number, number];
export type V3 = [number, number, number];

const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();

/** Поворот точки P вокруг оси (A → B) на угол a. */
export const rotateAboutEdge = (P: THREE.Vector3, A: THREE.Vector3, B: THREE.Vector3, a: number) => {
  const axis = tmpV.copy(B).sub(A).normalize();
  tmpQ.setFromAxisAngle(axis, a);
  return P.clone().sub(A).applyQuaternion(tmpQ).add(A);
};

/**
 * Развёртка пирамиды («гора»): основание — многоугольник на странице,
 * боковые грани — треугольники, шарнирно прикреплённые к рёбрам основания.
 * fold = 0: грани лежат звездой на бумаге; fold = 1: вершины сходятся в apex.
 * snow — доля высоты, выше которой грань покрыта отдельным слоем «снега».
 * Возвращает треугольники в двух группах: 0 — склон, 1 — снег.
 * В режиме "lift" гора вытягивается из линии сгиба вверх.
 */
export const pyramidNet = (base: V2[], apex: V3, fold: number, snow = 0.7, mode: "net" | "lift" = "net") => {
  const n = base.length;
  const cx = base.reduce((a, p) => a + p[0], 0) / n;
  const cz = base.reduce((a, p) => a + p[1], 0) / n;
  // "lift": вершина-гребень вытягивается из сгиба вверх (грани остаются
  // на рёбрах основания) — для крупных гор, чтобы развёртка не выходила
  // за пределы страницы. "net": грани поворачиваются вокруг рёбер.
  const A = new THREE.Vector3(apex[0], mode === "lift" ? Math.max(apex[1] * clamp(fold), 0.002) : apex[1], apex[2]);
  const slope: number[] = [];
  const cap: number[] = [];
  const shade: number[] = [];
  const capShade: number[] = [];
  const f = clamp(fold);
  for (let i = 0; i < n; i++) {
    const p0 = base[i];
    const p1 = base[(i + 1) % n];
    const B0 = new THREE.Vector3(p0[0], 0, p0[1]);
    const B1 = new THREE.Vector3(p1[0], 0, p1[1]);
    // Направление «наружу» в плоскости страницы.
    const e = B1.clone().sub(B0).normalize();
    let out = new THREE.Vector3(e.z, 0, -e.x);
    const mid = B0.clone().add(B1).multiplyScalar(0.5);
    if (out.dot(new THREE.Vector3(mid.x - cx, 0, mid.z - cz)) < 0) out = out.negate();
    // Угол собранной грани относительно страницы (снаружи).
    const foot = B0.clone().add(e.clone().multiplyScalar(A.clone().sub(B0).dot(e)));
    const a = A.clone().sub(foot);
    const psiFinal = Math.atan2(a.y, a.dot(out));
    // Поворот вокруг ребра так, чтобы грань легла наружу (ψ = 0).
    const rot = (P: THREE.Vector3) => {
      // ось вращения: ребро B0→B1, знак выбираем по направлению «наружу».
      const sign = new THREE.Vector3().crossVectors(e, out).y > 0 ? 1 : -1;
      if (mode === "lift") return P;
      return rotateAboutEdge(P, B0, B1, -sign * psiFinal * (1 - f));
    };
    const P = (u: number, w: number) => {
      const b = B0.clone().lerp(B1, u);
      return rot(b.lerp(A, w));
    };
    const s = snow;
    // Нижняя трапеция склона: (0,0) (1,0) (1,s) (0,s) в координатах (u, w).
    const q = [P(0, 0), P(1, 0), P(1, s), P(0, s)];
    const top = P(0.5, 1);
    const push = (arr: number[], ...vs: THREE.Vector3[]) => vs.forEach((v) => arr.push(v.x, v.y, v.z));
    push(slope, q[0], q[3], q[1], q[1], q[3], q[2]);
    // Снежная шапка — отдельный слой, слегка приподнятый над склоном.
    const nrm = new THREE.Vector3().crossVectors(q[3].clone().sub(q[0]), q[1].clone().sub(q[0])).normalize();
    const lift = nrm.multiplyScalar(0.004);
    const c0 = P(0, s - 0.06).add(lift);
    const c1 = P(1, s - 0.06).add(lift);
    const cm = P(0.5, s - 0.12).add(lift);
    push(cap, c0, top.clone().add(lift), cm, cm, top.clone().add(lift), c1);
    shade.push(i);
    capShade.push(i);
  }
  return { slope: new Float32Array(slope), cap: new Float32Array(cap), faces: n };
};

/** Плоская BufferGeometry из массива вершин треугольников (плоские нормали). */
export const setTriangles = (g: THREE.BufferGeometry, arr: Float32Array) => {
  const old = g.getAttribute("position") as THREE.BufferAttribute | undefined;
  if (old && old.array.length === arr.length) {
    (old.array as Float32Array).set(arr);
    old.needsUpdate = true;
  } else {
    g.setAttribute("position", new THREE.BufferAttribute(arr.slice(), 3));
  }
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
};

/**
 * Долька глобуса (лунка) от полюса до полюса шириной dLon по долготе.
 * Текстура берётся по глобальной долготе lon0..lon0+dLon — после
 * раскрытия веера дольки складываются в целую карту Земли.
 */
export const luneGeometry = (R: number, lon0: number, dLon: number, segLat = 24, segLon = 4) => {
  const g = new THREE.BufferGeometry();
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segLat; i++) {
    const lat = -Math.PI / 2 + (i / segLat) * Math.PI;
    for (let j = 0; j <= segLon; j++) {
      const lonLocal = -dLon / 2 + (j / segLon) * dLon;
      pos.push(R * Math.cos(lat) * Math.cos(lonLocal), R * Math.sin(lat), -R * Math.cos(lat) * Math.sin(lonLocal));
      const lonGlobal = lon0 + lonLocal + dLon / 2;
      uv.push(lonGlobal / (Math.PI * 2), i / segLat);
    }
  }
  for (let i = 0; i < segLat; i++) {
    for (let j = 0; j < segLon; j++) {
      const a = i * (segLon + 1) + j;
      const b = a + segLon + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/**
 * Лист-«ромб» со сгибом посередине (бумажный листок дерева).
 * open = 0: половинки сложены вдоль средней жилки; 1 — раскрыт (лёгкий V).
 */
export const foldedLeaf = (len: number, wid: number, open: number) => {
  const half = (Math.PI / 2) * (1 - clamp(open)) + 0.18;
  const s = Math.sin(half);
  const c = Math.cos(half);
  const mid = len * 0.42;
  const pts = [
    // правая половинка
    [0, 0, 0],
    [wid * c, mid, wid * s],
    [0, len, 0],
    // левая половинка
    [0, 0, 0],
    [0, len, 0],
    [-wid * c, mid, wid * s],
  ];
  return new Float32Array(pts.flat());
};

/** Изогнутая бумажная лента вдоль кривой (река, дуги). */
export const ribbonAlong = (
  curve: (u: number) => THREE.Vector3,
  width: (u: number) => number,
  up: (u: number) => THREE.Vector3,
  u0: number,
  u1: number,
  seg = 60,
) => {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const u = u0 + ((u1 - u0) * i) / seg;
    const p = curve(u);
    const t = curve(Math.min(u + 0.002, 1)).sub(curve(Math.max(u - 0.002, 0))).normalize();
    const side = new THREE.Vector3().crossVectors(up(u), t).normalize().multiplyScalar(width(u) / 2);
    pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
    uv.push(0, u, 1, u);
    if (i < seg) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  return { pos: new Float32Array(pos), uv: new Float32Array(uv), idx };
};

export const setIndexed = (g: THREE.BufferGeometry, r: { pos: Float32Array; uv: Float32Array; idx: number[] }) => {
  g.setAttribute("position", new THREE.BufferAttribute(r.pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(r.uv, 2));
  g.setIndex(r.idx);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
};

/** Контур облака: несколько дуг-«пузырей» над ровным основанием. */
export const cloudShape = (w: number, h: number, bumps: number[]) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  const n = bumps.length;
  let x = -w / 2;
  for (let i = 0; i < n; i++) {
    const bw = w / n;
    const r = bumps[i] * h;
    s.bezierCurveTo(x, r * 1.25, x + bw, r * 1.25, x + bw, i === n - 1 ? 0 : r * 0.35);
    x += bw;
  }
  s.lineTo(-w / 2, 0);
  return s;
};

/** Многоконечная звезда (для звёзд неба и исламской геометрии). */
export const starShape = (R: number, r: number, points: number, rot = 0) => {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const a = rot + (i * Math.PI) / points;
    const rr = i % 2 === 0 ? R : r;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
};

/** Скруглённый прямоугольник (обложка, подставки). */
export const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

/** Плоская UV-развёртка ShapeGeometry по габаритам. */
export const planarUV = (g: THREE.BufferGeometry, axisU: "x" | "y" | "z", axisV: "x" | "y" | "z", flipU = false, flipV = false) => {
  g.computeBoundingBox();
  const bb = g.boundingBox as THREE.Box3;
  const pos = g.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    let u = (v[axisU] - bb.min[axisU]) / (bb.max[axisU] - bb.min[axisU] || 1);
    let w = (v[axisV] - bb.min[axisV]) / (bb.max[axisV] - bb.min[axisV] || 1);
    if (flipU) u = 1 - u;
    if (flipV) w = 1 - w;
    uv[i * 2] = u;
    uv[i * 2 + 1] = w;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};
