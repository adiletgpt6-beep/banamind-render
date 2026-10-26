// GeometricMorphEngine — превращения фигур без случайных скачков.
//
// • resamplePolygon / morphPolygon — полигоны с разным числом вершин
//   приводятся к одному числу точек по длине контура, начало контура
//   выравнивается (минимум суммарного сдвига), затем — интерполяция вершин.
// • matchByPolar — соответствие фигур двух множеств (shape correspondence):
//   элементы сортируются по радиусу и углу, i-й идёт в i-й.
// • rollToSphere — «сворачивание» плоского узора в шар: плоскость изгибается
//   с растущей кривизной (диск → чаша → сфера), длины вдоль радиусов
//   сохраняются — грани не рвутся и не телепортируются.
// • edgeUnfold — раскрытие треугольника из соседнего через общее ребро
//   (поворот в 3D вокруг ребра — фигура «поднимается» из плоскости).
import { clamp, lerp, type Vec2, type Vec3 } from "./GeometryWondersEngine";

export function polygonPerimeter(pts: Vec2[]) {
  let L = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    L += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return L;
}

/** Равномерно по длине контура: n точек. */
export function resamplePolygon(pts: Vec2[], n: number): Vec2[] {
  const L = polygonPerimeter(pts);
  const out: Vec2[] = [];
  let seg = 0;
  let acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (k / n) * L;
    for (;;) {
      const a = pts[seg % pts.length];
      const b = pts[(seg + 1) % pts.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (acc + len >= target || seg > pts.length * 2) {
        const u = len > 0 ? (target - acc) / len : 0;
        out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
        break;
      }
      acc += len;
      seg++;
    }
  }
  return out;
}

/** Сдвиг начала контура b для минимального пути вершин из a. */
export function alignStart(a: Vec2[], b: Vec2[]): Vec2[] {
  let best = 0;
  let bestD = Infinity;
  for (let s = 0; s < b.length; s++) {
    let d = 0;
    for (let i = 0; i < a.length; i++) {
      const q = b[(i + s) % b.length];
      d += (a[i][0] - q[0]) ** 2 + (a[i][1] - q[1]) ** 2;
    }
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return b.map((_, i) => b[(i + best) % b.length]);
}

/** Морфинг двух полигонов с любым числом вершин. */
export function morphPolygon(a: Vec2[], b: Vec2[], t: number, samples = 48): Vec2[] {
  const ra = resamplePolygon(a, samples);
  const rb = alignStart(ra, resamplePolygon(b, samples));
  const k = clamp(t);
  return ra.map((p, i) => [lerp(p[0], rb[i][0], k), lerp(p[1], rb[i][1], k)]);
}

/** Соответствие элементов по полярным координатам (радиус, затем угол). */
export function matchByPolar<T extends { x: number; y: number }>(src: T[], dst: T[]): number[] {
  const key = (p: { x: number; y: number }) => [Math.hypot(p.x, p.y), (Math.atan2(p.y, p.x) + Math.PI * 2) % (Math.PI * 2)];
  const order = (arr: T[]) =>
    arr
      .map((p, i) => ({ i, k: key(p) }))
      .sort((a, b) => a.k[0] - b.k[0] || a.k[1] - b.k[1])
      .map((x) => x.i);
  const so = order(src);
  const dO = order(dst);
  const map = new Array<number>(src.length).fill(-1);
  so.forEach((si, rank) => {
    map[si] = dO[Math.min(rank, dO.length - 1)];
  });
  return map;
}

/**
 * Изгиб плоскости в шар. (x, y) — точка плоского узора, rho ∈ [0,1] —
 * нормированное расстояние от центра до края узора по своему направлению,
 * arc — длина дуги от полюса до края в замкнутом шаре, fold ∈ [0,1].
 * fold=0 — плоскость z=0; fold=1 — сфера радиуса arc/π, передний полюс в (0,0,0).
 */
export function rollToSphere(x: number, y: number, rho: number, arc: number, fold: number): Vec3 {
  const r = Math.hypot(x, y);
  const phi = Math.atan2(y, x);
  const f = clamp(fold);
  // Длина дуги: от реального радиуса (шестиугольник) к нормированной (круг).
  const s = lerp(r, rho * arc, Math.min(1, f * 1.4));
  const kappa = (f * Math.PI * 0.995) / arc; // кривизна 0 → π/arc
  if (kappa < 1e-5) return [s * Math.cos(phi), s * Math.sin(phi), 0];
  const R = 1 / kappa;
  const th = s * kappa;
  return [R * Math.sin(th) * Math.cos(phi), R * Math.sin(th) * Math.sin(phi), R * (Math.cos(th) - 1)];
}

/** Полярный угол и азимут точки узора после полного сворачивания. */
export function sphereAngles(x: number, y: number, rho: number) {
  return { theta: rho * Math.PI * 0.995, phi: Math.atan2(y, x) };
}

/** Поворот точки c вокруг оси a→b на угол ang (Родриг). */
export function rotateAboutEdge(c: Vec3, a: Vec3, b: Vec3, ang: number): Vec3 {
  const k = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const kl = Math.hypot(k[0], k[1], k[2]) || 1;
  k[0] /= kl;
  k[1] /= kl;
  k[2] /= kl;
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  const dot = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  const cr = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
  return [
    a[0] + v[0] * cos + cr[0] * sin + k[0] * dot * (1 - cos),
    a[1] + v[1] * cos + cr[1] * sin + k[1] * dot * (1 - cos),
    a[2] + v[2] * cos + cr[2] * sin + k[2] * dot * (1 - cos),
  ];
}

/**
 * Раскрытие треугольника через общее ребро (a, b) с родителем: при p=0
 * вершина c лежит поверх родителя (сложено), при p=1 — на своём месте.
 * Положительная высота (z) в середине поворота — фигура выходит из плоскости.
 */
export function edgeUnfold(a: Vec3, b: Vec3, c: Vec3, p: number): Vec3 {
  // Направление оси выбираем так, чтобы фигура поднималась к зрителю (+z).
  const up = rotateAboutEdge(c, a, b, Math.PI / 2)[2] >= a[2];
  return up ? rotateAboutEdge(c, a, b, Math.PI * (1 - clamp(p))) : rotateAboutEdge(c, b, a, Math.PI * (1 - clamp(p)));
}

/** Ступенчатый прогресс элемента: старт delay∈[0,1] доли общего окна, длина span. */
export const stagger = (t: number, delay: number, span: number) => clamp((t - delay * (1 - span)) / span);
