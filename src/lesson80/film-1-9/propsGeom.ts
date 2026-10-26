// Чистая геометрия реквизита фильма 80-1-9 (без React): тарелка и гнёзда
// долек, сложенная салфетка и точка её хвата, стопка на подносе и ручки
// подноса. Её используют и рисунки (props.tsx), и хореография с тестами —
// руки приходят ровно туда, где нарисован предмет.
// Сжатие лежащего круга/квадрата при взгляде чуть сверху.
export const K = 0.3;

export type Pt = { readonly x: number; readonly y: number };

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ======================= долька яблока =======================
// Долька лежит кожурой вниз («лодочкой»): снизу — дуга с кожурой, сверху —
// срез у сердцевины с лёгкой выемкой. Местные единицы: длина s по оси x,
// высота H, центр (0, 0). Укус — с конца +x (зубчатая вогнутая выемка).
export const SLICE_H = 0.44;

// Длина дольки для тарелки ширины w.
export const sliceW = (w: number) => w * 0.27;

// ======================= тарелка =======================
// Гнёзда долек на тарелке: передний ряд (ближе к камере) и задний ряд
// «кирпичиком». Индексы: сначала передний ряд слева направо, затем задний.
export const slotRows = (n: number) => {
  if (n === 5) return { front: [-1, 0, 1], back: [-0.5, 0.5], rf: [-7, 2, 8], rb: [5, -5] };
  if (n === 4) return { front: [-0.62, 0.62], back: [-1.0, 0.28], rf: [-5, 6], rb: [7, -4] };
  const nf = Math.ceil(n / 2);
  const nb = n - nf;
  const row = (m: number) => Array.from({ length: m }, (_, i) => i - (m - 1) / 2);
  return { front: row(nf), back: row(nb).map((u) => u + 0.5 * (nf > nb ? 0 : 1)), rf: row(nf).map((u) => u * 6), rb: row(nb).map((u) => -u * 6) };
};

export const plateGeo = (x: number, y: number, w: number) => {
  const R = w / 2;
  const hp = w * 0.085; // высота борта тарелки
  const rimY = y - hp;
  const ry = R * K;
  return { R, hp, rimY, ry, wellY: rimY + w * 0.02, wellRx: R * 0.72, wellRy: ry * 0.72, footRx: w * 0.3, footRy: w * 0.3 * K };
};

// Мировое положение и наклон дольки i из n на тарелке (центр дольки).
export const plateSlot = (x: number, y: number, w: number, n: number, i: number): { x: number; y: number; rot: number } => {
  const g = plateGeo(x, y, w);
  const s = sliceW(w);
  const H = s * SLICE_H;
  const sp = s * 0.86;
  const rows = slotRows(n);
  const front = i < rows.front.length;
  const j = front ? i : i - rows.front.length;
  const u = front ? rows.front[j] : rows.back[j];
  const rot = front ? rows.rf[j] : rows.rb[j];
  // низ дольки — на дне тарелки: передний ряд ближе к камере, задний дальше
  const bottom = g.wellY + (front ? 0.36 : -0.42) * g.wellRy;
  return { x: x + (u ?? 0) * sp, y: bottom - H / 2 + 0.6, rot: rot ?? 0 };
};

// ======================= салфетка =======================
// Сложенная вчетверо мягкая бумажная салфетка с тиснением «ромбиком».
// flat = 1 — лежит (сжата перспективой, rot — поворот в плоскости
// поверхности); flat = 0 — в пальцах (почти прямой квадрат, rot — поворот в
// кадре; держат за угол 0 — верхний левый, свободный угол 2 мягко
// провисает, от щепоти расходятся мягкие складки). У открытого угла (2)
// слои бумаги чуть разъезжаются. (x, y) — центр.
export const napkinCorners = (x: number, y: number, w: number, rot: number, flat: number): Pt[] => {
  const h = w / 2;
  const a = (rot * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = clamp01(flat);
  const base = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const;
  // провисание свободных углов (только в руке), доли w в кадре
  const droop = [
    [0, 0],
    [-0.03, 0.07],
    [-0.1, 0.17],
    [0.03, 0.06],
  ] as const;
  return base.map(([u, v], i) => {
    const rx = (c * u - s * v) * h;
    const ry = (s * u + c * v) * h;
    const hx = rx * 0.97 + droop[i][0] * w;
    const hy = ry * 0.94 + droop[i][1] * w;
    return { x: x + lerp(hx, rx, t), y: y + lerp(hy, ry * K, t) };
  });
};

export const towards = (p: Pt, q: Pt, k: number): Pt => ({ x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k) });

// Смещение точки хвата от центра салфетки: в руке — у угла 0, лежащую
// берут щепотью у центра. Центр в руке = кисть − napkinGrip(...).
const cornerGrip = (w: number, rot: number, flat: number, i: number): Pt => {
  const P = napkinCorners(0, 0, w, rot, flat);
  const g = towards(P[i], { x: 0, y: 0 }, 0.2);
  const t = clamp01(flat);
  return { x: lerp(g.x, 0, t), y: lerp(g.y, 0, t) };
};
export const napkinGrip = (w: number, rot: number, flat: number): Pt => cornerGrip(w, rot, flat, 0);

// Второй верхний угол (соседний с углом 0): за него берётся тот, кому
// передают салфетку, пока её ещё держит первый.
export const napkinOtherGrip = (w: number, rot: number, flat: number): Pt => {
  const P = napkinCorners(0, 0, w, rot, 0);
  return cornerGrip(w, rot, flat, P[1].y <= P[3].y ? 1 : 3);
};

// ======================= поднос =======================
// Светлый деревянный поднос с низким бортом; длинные борта у концов
// поднимаются «ушками» с прорезями-ручками. (x, y) — центр опоры, w — длина.
export const trayGeo = (x: number, y: number, w: number) => {
  const D = w * 0.64 * K; // глубина в кадре
  const rh = w * 0.04; // высота борта
  const eh = w * 0.15; // высота ушка
  const ft = w * 0.012; // толщина дна
  const yF = y + D / 2;
  const yB = y - D / 2;
  return { D, rh, eh, ft, yF, yB, x0: x - w / 2, x1: x + w / 2 };
};

export const NAPKIN_T = 0.72; // толщина одной салфетки в стопке, px мира
export const STACK_JX = [0, 2.8, -1.4, 0.9, -0.7, 1.3, -1.6, 0.5, -0.3, 1.1, -1.0, 0.4, -1.5, 1.2, -0.6, 0.8, -1.2, 1.6, -0.2, 0.7, -0.9, 1.4, -0.4, 0.2, -1.1];
export const STACK_JR = [0, 6.5, -3.5, 2.2, -1.8, 3, -2.6, 1.4, -0.8, 2.6, -2.2, 1, -3, 2.4, -1.2, 1.8, -2.8, 3.2, -0.6, 1.6, -2, 2.8, -1, 0.6, -2.4];
export const stackNapkinW = (w: number) => w * (44 / 112);

// Центр верхней салфетки стопки (откуда её берут) и её поворот; count = 0 —
// место на дне подноса.
export const trayTop = (x: number, y: number, w: number, count: number): { x: number; y: number; rot: number } => {
  const g = trayGeo(x, y, w);
  const i = Math.max(0, Math.min(STACK_JX.length, Math.round(count)) - 1);
  const base = y - g.ft - g.D * 0.12;
  const n = Math.max(0, Math.round(count));
  return { x: x + (n > 0 ? STACK_JX[i] * (w / 112) : 0), y: base - Math.max(0, n - 1) * NAPKIN_T - (n > 0 ? NAPKIN_T : 0), rot: n > 0 ? STACK_JR[i] : 0 };
};

// Точки хвата двумя руками (прорези в передних ушках).
export const trayHandles = (x: number, y: number, w: number): { L: Pt; R: Pt } => {
  const g = trayGeo(x, y, w);
  const hy = g.yF - g.eh * HOLE_Y;
  return { L: { x: x - w * HOLE_X, y: hy }, R: { x: x + w * HOLE_X, y: hy } };
};

export const HOLE_X = 0.415; // центр прорези от центра подноса, доли w
export const HOLE_Y = 0.74; // высота прорези, доли высоты ушка
