// Учебный глобус: одна модель состояния для всех ракурсов.
//   • фиксированная ось (наклонена к зрителю на 23,4°), один непрерывный
//     угол поворота φ (азимут метки относительно направления на лампу);
//   • метка закреплена на поверхности (широта 40° с. ш.);
//   • фиксированный источник света: лампа справа, на уровне центра,
//     направление света перпендикулярно оси (L = +x);
//   • камеры («сбоку» из класса и «сверху» со стороны Северного полюса)
//     наблюдают одно и то же состояние: ортографическая проекция,
//     видимая полусфера z > 0, непрозрачность настоящая.
// Земля вращается с запада на восток: при взгляде со стороны Северного
// полюса — против часовой стрелки; на переднем крае (вид сбоку) поверхность
// движется слева направо. Без зависимостей от React/Remotion.

export type V3 = readonly [number, number, number];
export type P2 = { readonly x: number; readonly y: number; readonly z: number };

const d2r = Math.PI / 180;
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Мир: x — вправо (к лампе), y — в глубину (от основного зрителя), z — вверх.
export const AXIS_TILT_DEG = 23.4;
export const LIGHT: V3 = [1, 0, 0];
export const MARK_LAT = 40;
export const MARK_LON = 0; // долгота метки в системе глобуса

// Ось глобуса: верх наклонён к зрителю (−y).
const tilt = AXIS_TILT_DEG * d2r;
export const AXIS: V3 = [0, -Math.sin(tilt), Math.cos(tilt)];

// Точка на единичной сфере в системе глобуса (ось — z).
export const sphere = (latDeg: number, lonDeg: number): V3 => {
  const la = latDeg * d2r;
  const lo = lonDeg * d2r;
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
};

// Поворот точки глобуса на угол φ вокруг оси и наклон оси → мир.
export const toWorld = (p: V3, phiDeg: number): V3 => {
  const a = phiDeg * d2r;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r: V3 = [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  // наклон вокруг x: y → z
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return [r[0], r[1] * ct - r[2] * st, r[1] * st + r[2] * ct];
};

export type Camera = { readonly d: V3; readonly r: V3; readonly u: V3; readonly id: "side" | "top" };

// Камера: d — направление от центра к камере (видно, если p·d > 0),
// r — вправо на экране, u — вверх на экране.
const makeCam = (d0: V3, upRef: V3, id: "side" | "top"): Camera => {
  const d = norm(d0);
  const r = norm(cross(upRef, d));
  const u = cross(d, r);
  return { d, r, u, id };
};

// Вид из класса: камера чуть левее фронта (азимут −100°) и выше (20°).
export const SIDE_AZ = -100;
export const SIDE_EL = 20;
export const CAM_SIDE: Camera = makeCam(
  [Math.cos(SIDE_EL * d2r) * Math.cos(SIDE_AZ * d2r), Math.cos(SIDE_EL * d2r) * Math.sin(SIDE_AZ * d2r), Math.sin(SIDE_EL * d2r)],
  [0, 0, 1],
  "side",
);
// Вид сверху, со стороны Северного полюса: основной зритель внизу кадра.
export const CAM_TOP: Camera = makeCam(AXIS, [0, 1, 0], "top");

export const project = (cam: Camera, p: V3): P2 => ({ x: dot(p, cam.r), y: -dot(p, cam.u), z: dot(p, cam.d) });

export const markWorld = (phiDeg: number): V3 => toWorld(sphere(MARK_LAT, MARK_LON), phiDeg);
// Признак прямого света: положительное скалярное произведение внешней
// нормали и направления на лампу (приближение удалённого источника).
export const isLit = (pWorld: V3) => dot(pWorld, LIGHT) > 0;

export type MarkState = { readonly screen: P2; readonly visible: boolean; readonly lit: boolean; readonly world: V3 };
export const markState = (cam: Camera, phiDeg: number): MarkState => {
  const w = markWorld(phiDeg);
  const s = project(cam, w);
  return { screen: s, visible: s.z > 0.02, lit: isLit(w), world: w };
};

// Отсечение многоугольника видимой полусферой (z ≥ 0) в координатах камеры.
const clipFront = (pts: readonly P2[]): P2[] => {
  const out: P2[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const ain = a.z >= 0;
    const bin = b.z >= 0;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = a.z / (a.z - b.z);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: 0 });
    }
  }
  return out;
};

// Сгущение рёбер многоугольника (широта/долгота) до шага ≈ step°.
const densify = (poly: readonly (readonly [number, number])[], step = 3): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i < poly.length; i++) {
    const [la0, lo0] = poly[i];
    const [la1, lo1] = poly[(i + 1) % poly.length];
    let dlo = lo1 - lo0;
    if (dlo > 180) dlo -= 360;
    if (dlo < -180) dlo += 360;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(la1 - la0), Math.abs(dlo)) / step));
    for (let k = 0; k < n; k++) out.push([la0 + ((la1 - la0) * k) / n, lo0 + (dlo * k) / n]);
  }
  return out;
};

// Условные материки (широта, долгота — в системе глобуса; метка на 0°
// долготы лежит на большом северном материке, ≈ там, где у настоящей Земли
// долгота 70° в. д.). Формы упрощены по-детски, без названий.
const REL = -70;
const CONTINENTS_RAW: readonly (readonly (readonly [number, number])[])[] = [
  // большой северный материк
  [[70, -10], [72, 60], [75, 100], [70, 140], [62, 170], [55, 160], [45, 140], [30, 122], [20, 105], [8, 100], [15, 80], [8, 77], [22, 70], [25, 57], [12, 45], [30, 35], [36, 30], [40, 10], [36, -6], [43, -9], [48, -2], [60, -5], [65, 12]],
  // южный материк под ним
  [[36, -5], [37, 10], [32, 32], [12, 43], [2, 42], [-12, 40], [-25, 33], [-34, 20], [-30, 15], [-15, 12], [-5, 9], [5, 0], [5, -8], [10, -15], [15, -17], [28, -13], [35, -6]],
  // северный материк на другой стороне
  [[70, -160], [72, -90], [68, -70], [60, -62], [48, -55], [44, -66], [35, -76], [30, -82], [25, -80], [29, -90], [26, -97], [18, -90], [16, -95], [22, -106], [32, -117], [45, -124], [58, -138], [60, -150], [68, -165]],
  // южный материк на другой стороне
  [[12, -72], [8, -60], [0, -50], [-5, -35], [-15, -39], [-23, -42], [-33, -52], [-45, -66], [-54, -70], [-50, -75], [-35, -73], [-18, -71], [-5, -81], [5, -78]],
  // большой остров на юго-востоке
  [[-12, 131], [-11, 142], [-17, 146], [-28, 153], [-38, 147], [-35, 137], [-32, 129], [-34, 116], [-25, 113], [-20, 118], [-14, 126]],
  // северный остров
  [[60, -45], [70, -22], [80, -30], [82, -55], [77, -70], [70, -55]],
];
export const CONTINENTS: readonly (readonly [number, number][])[] = CONTINENTS_RAW.map((poly) => densify(poly.map(([la, lo]) => [la, lo + REL] as const)));
// Южная полярная шапка
export const SOUTH_CAP: readonly [number, number][] = Array.from({ length: 72 }, (_, i) => [-72, i * 5] as [number, number]);

// Видимая часть многоугольника поверхности → точки на экране (в долях радиуса).
export const surfacePolygon = (cam: Camera, phiDeg: number, poly: readonly (readonly [number, number])[]): P2[] =>
  clipFront(poly.map(([la, lo]) => project(cam, toWorld(sphere(la, lo), phiDeg))));

// Ночная область видимого диска: ограничена видимой дугой терминатора и
// дугой лимба с ночной стороны. Световой рисунок не зависит от φ.
export const nightPolygon = (cam: Camera): P2[] => {
  const L = LIGHT;
  const u1 = norm(cross(L, cam.d[0] === 0 && cam.d[2] === 0 ? [0, 0, 1] : [0, 0, 1]));
  const u2 = cross(L, u1);
  const A = dot(u1, cam.d);
  const B = dot(u2, cam.d);
  const C = Math.hypot(A, B);
  const Lv = project(cam, L);
  if (C < 1e-6) return Lv.z < 0 ? Array.from({ length: 90 }, (_, i) => ({ x: Math.cos((i / 90) * 2 * Math.PI), y: Math.sin((i / 90) * 2 * Math.PI), z: 0 })) : [];
  const phi0 = Math.atan2(B, A);
  const pts: P2[] = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const a = phi0 - Math.PI / 2 + (Math.PI * i) / N;
    const w = add(scale(u1, Math.cos(a)), scale(u2, Math.sin(a)));
    const s = project(cam, w);
    pts.push({ x: s.x, y: s.y, z: Math.max(0, s.z) });
  }
  // дуга лимба от последней точки терминатора к первой через ночную сторону
  const b2 = Math.atan2(pts[N].y, pts[N].x);
  const b1 = Math.atan2(pts[0].y, pts[0].x);
  const nightAt = (b: number) => Math.cos(b) * Lv.x + Math.sin(b) * -Lv.y < 0;
  let span = b1 - b2;
  while (span < 0) span += 2 * Math.PI;
  const midA = b2 + span / 2;
  const dir = nightAt(midA) ? 1 : -1;
  const len = dir === 1 ? span : 2 * Math.PI - span;
  const M = 90;
  for (let i = 1; i < M; i++) {
    const b = b2 + (dir * len * i) / M;
    pts.push({ x: Math.cos(b), y: Math.sin(b), z: 0 });
  }
  return pts;
};

// Подсолнечная точка на экране (центр светового пятна) — доли радиуса.
export const subsolar = (cam: Camera): P2 => project(cam, LIGHT);

// Полюса на экране (для оси/штифта подставки).
export const pole = (cam: Camera, north: boolean): P2 => project(cam, north ? AXIS : scale(AXIS, -1));

// Круг широты метки (для вида сверху — подсказка пути), точки на экране.
export const latitudeCircle = (cam: Camera, phiDeg: number, latDeg = MARK_LAT, n = 120): P2[] =>
  clipFront(Array.from({ length: n }, (_, i) => project(cam, toWorld(sphere(latDeg, (i * 360) / n), phiDeg))));
