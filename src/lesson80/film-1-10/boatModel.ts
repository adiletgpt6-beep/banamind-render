// Бумажная лодочка Амира (сложена в 80-1-5): ОДНА непрерывная
// параметрическая модель для всех планов фильма 80-1-10. Меняется только
// маленький левый уголок (у левого носа): он разгибается по своему старому
// сгибу a–b и возвращается по нему же. Все остальные сгибы, слои, размер,
// цвет и ориентация постоянны.
//
// Локальные единицы — как у Boat из 80-1-5: начало в центре палубной линии
// (y вниз), ширина 236 ед. (нос −118 … нос +118), низ корпуса y = 40,
// вершина паруса y = −68. Модуль без React/Remotion — его читают тесты.
import { MM, type Vec } from "./layout.ts";

export type { Vec } from "./layout.ts";

// ---------- Цвета бумаги (серия) ----------
export const BOAT_COLORS = {
  paper: "#FBFAF6",
  shade: "#E7E3D8",
  line: "#C9C4B8",
  shadow: "rgba(40,35,60,0.16)",
  crease: "#9FA7B8",
  // внутренняя сторона корпуса и изнанка слоёв — чуть темнее тени бумаги
  inner: "#DDD8CB",
  edge: "#FFFFFF",
} as const;

// ---------- Размеры ----------
export const BOAT_WIDTH_UNITS = 236;
export const BOAT_HEIGHT_UNITS = 108; // от вершины паруса (−68) до низа (40)
export const BOAT_BOTTOM_Y = 40;
// Точка опоры (центр линии контакта днища со столом), локальные ед.
export const BOAT_CONTACT: Vec = { x: 0, y: BOAT_BOTTOM_Y };
// Лодочка в комнате — 72 px мира, то есть ≈ 169 мм в длину.
export const BOAT_LENGTH_MM = 72 / MM;
export const MM_PER_UNIT = BOAT_LENGTH_MM / BOAT_WIDTH_UNITS;

const v = (x: number, y: number): Vec => ({ x, y });

// ---------- Ключевые точки ----------
// Нижняя кромка двойной полосы борта (отворот «шляпы») — y = 14.
const BAND_Y = 14;
const bowX = (y: number) => -118 + (y + 6); // левая кромка носа: (−118,−6) → (−72,40), наклон 1:1

export const BOAT_GEOM = {
  deckL: v(-118, -6),
  deckR: v(118, -6),
  botL: v(-72, 40),
  botR: v(72, 40),
  // дальний (внутренний) борт над палубной линией
  farL: v(-58, -22),
  farR: v(64, -22),
  // парус
  sailTop: v(0, -68),
  sailL: v(-44, -8),
  sailR: v(44, -8),
  sailCrease: [v(0, -62), v(0, -10)] as const,
  // двойная полоса борта: нижняя кромка верхнего слоя
  bandY: BAND_Y,
  bandL: v(bowX(BAND_Y), BAND_Y),
  bandR: v(-bowX(BAND_Y), BAND_Y),
  // нижний сгиб днища и центральный вертикальный сгиб корпуса (едва видны)
  keelY: 34,
  keelL: v(-60, 34),
  keelR: v(60, 34),
  centerFold: [v(0, -4), v(0, 38)] as const,
  // контурные пути (как в 80-1-5)
  paths: {
    hull: "M-118 -6 L118 -6 L72 40 L-72 40 Z",
    rim: "M-118 -6 L118 -6 L64 -22 L-58 -22 Z",
    sail: "M0 -68 L44 -8 L-44 -8 Z",
    shadow: "M-112 4 L112 4 L70 46 L-64 46 Z",
  },
} as const;

// ---------- Подвижный уголок ----------
// Угол у левого носа и его старый сгиб a–b (a — на палубной линии, b — на
// кромке носа). Треугольник a–P–b прямоугольный (прямой угол при b).
export const CORNER: Vec = v(-118, -6);
export const HINGE = { a: v(-88, -6), b: v(-103, 9) } as const;
// open = 1 → поворот на 0.58 полуоборота: уголок отскочил вверх-наружу,
// стоит над носом и показывает изнанку (SHADE); не порван и не смят.
export const OPEN_K = 0.58;
// Борт стоит вертикально, поэтому выход уголка из плоскости борта на виде
// сбоку читается как подъём: к подъёму foldPoint (0.55·|d|) добавляется ещё
// FLAP_RISE·|d|·sin(π·OPEN_K)·(t/OPEN_K)³ — добавка растёт вместе с поворотом
// (а не горбом посередине), поэтому кромки уголка почти не тянутся
// (|b−P'| ≤ 1.09·|b−P|) и в конце уголок стоит над палубой.
export const FLAP_RISE = 0.6;

// Сгиб: точка p за линией a–b поворачивается вокруг неё. t = 0 — на месте,
// t = 1 — зеркально по другую сторону, 0.5 — ребром (приподнята).
export const foldPoint = (p: Vec, a: Vec, b: Vec, t: number): Vec => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const dist = (p.x - a.x) * nx + (p.y - a.y) * ny;
  const k = Math.cos(Math.PI * t);
  const lift = Math.sin(Math.PI * t) * Math.abs(dist) * 0.55;
  return { x: p.x - dist * nx + dist * k * nx, y: p.y - dist * ny + dist * k * ny - lift };
};

// Доля полуоборота уголка при данном open (допускается лёгкий перелёт > 1).
export const flapTurn = (open: number) => Math.max(0, Math.min(0.92, OPEN_K * open));
// Видна ли изнанка уголка (бумага повернулась больше чем на 90°).
export const flapShowsBack = (open: number) => flapTurn(open) > 0.5;
// Вершина уголка P' при данном open.
const CORNER_DIST = Math.abs((CORNER.x - HINGE.a.x) * -(HINGE.b.y - HINGE.a.y) + (CORNER.y - HINGE.a.y) * (HINGE.b.x - HINGE.a.x)) / Math.hypot(HINGE.b.x - HINGE.a.x, HINGE.b.y - HINGE.a.y);
const RISE_MAX = FLAP_RISE * CORNER_DIST * Math.sin(Math.PI * OPEN_K);
export const flapCorner = (open: number): Vec => {
  if (open <= 0) return CORNER;
  const t = flapTurn(open);
  const p = foldPoint(CORNER, HINGE.a, HINGE.b, t);
  const g = t / OPEN_K;
  return { x: p.x, y: p.y - RISE_MAX * g * g * g };
};
// Куда падает тень уголка на плоскость борта (свет слева сверху спереди):
// проекция вершины в плоскости борта, сдвинутая вправо-вниз пропорционально
// выходу уголка из плоскости. При open = 0 — сама вершина P.
export const flapShadowTip = (open: number): Vec => {
  const t = flapTurn(open);
  const c = Math.cos(Math.PI * t);
  const z = CORNER_DIST * Math.sin(Math.PI * t);
  return { x: HINGE.b.x + (CORNER.x - HINGE.b.x) * c + 0.45 * z, y: HINGE.b.y + (CORNER.y - HINGE.b.y) * c + 0.3 * z };
};
// Освещённость уголка, непрерывная по повороту: 0 — лицевая сторона в
// плоскости борта (как борт), 1 — уголок ребром к свету (темнее всего), затем
// изнанка снова светлеет до BACK_LIGHT при open = 1. Одна величина для обеих
// сторон, поэтому при переходе через ребро цвет не скачет.
export const FLAP_BACK_LIGHT = 0.42;
export const flapDarkness = (open: number): number => {
  const t = flapTurn(open);
  if (t <= 0.5) {
    const u = t / 0.5;
    return u * u * (3 - 2 * u);
  }
  const u = Math.min(1, (t - 0.5) / (OPEN_K - 0.5));
  return 1 - (1 - FLAP_BACK_LIGHT) * (u * u * (3 - 2 * u));
};
// Уголок: [a, P', b].
export const flapPolygon = (open: number): readonly Vec[] => [HINGE.a, flapCorner(open), HINGE.b];
// Корпус: целый при open = 0, иначе — с вырезом по сгибу [a, …, b].
export const hullPolygon = (open: number): readonly Vec[] =>
  open <= 0 ? [BOAT_GEOM.deckL, BOAT_GEOM.deckR, BOAT_GEOM.botR, BOAT_GEOM.botL] : [HINGE.a, BOAT_GEOM.deckR, BOAT_GEOM.botR, BOAT_GEOM.botL, HINGE.b];
export const HULL_CUT: readonly Vec[] = [HINGE.a, BOAT_GEOM.deckR, BOAT_GEOM.botR, BOAT_GEOM.botL, HINGE.b];

const lerpV = (p: Vec, q: Vec, t: number): Vec => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
export const HINGE_MID: Vec = lerpV(HINGE.a, HINGE.b, 0.5);
// Где пальцы держат уголок (на бумаге, у самой вершины).
export const flapTip = (open: number): Vec => lerpV(HINGE_MID, flapCorner(open), 0.82);
// Щепоть уголка: большой палец лежит на уголке у вершины (flapTip), а кончик
// указательного — за уголком и выглядывает на ~2.5 ед. за его свободной
// кромкой P'–b (снаружи носа), напротив большого пальца: видно, что бумага
// зажата между двумя пальцами. Это точка кончика указательного в плане.
export const pinchIndexTip = (open: number): Vec => {
  const P = flapCorner(open);
  const ex = HINGE.b.x - P.x;
  const ey = HINGE.b.y - P.y;
  const l = Math.hypot(ex, ey) || 1;
  // нормаль к кромке P'–b в сторону от a (наружу)
  let nx = -ey / l;
  let ny = ex / l;
  if ((HINGE.a.x - P.x) * nx + (HINGE.a.y - P.y) * ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  return { x: P.x + nx * 2.6 + (ex / l) * 3.2, y: P.y + ny * 2.6 + (ey / l) * 3.2 };
};
// Точка на восстановленном сгибе: u = 0 — у b, u = 1 — у a.
export const creasePoint = (u: number): Vec => lerpV(HINGE.b, HINGE.a, u);

// Удобные точки захвата (локальные ед.).
export const BOAT_GRIPS = {
  sail: v(0, -58), // щепоть у вершины паруса (перенос лодочки)
  rimLeft: v(-74, -4), // край борта слева, правее сгиба уголка (Юсуф поднимает; большой палец не закрывает a)
  holdMid: v(14, -6), // кончик указательного при поддержке посередине (Юсуф)
  pointAt: v(-112, -22), // куда показывает Амир: рядом с раскрытым уголком, без касания
} as const;

export const polyPath = (pts: readonly Vec[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") + " Z";

// ---------- Мир: размещение лодочки ----------
// place: x, y — центр контакта днища со столом (px); w — ширина (px);
// lift — мм над столом; tilt — градусы (SVG: + по часовой) вокруг pivot
// (локальные ед.; по умолчанию — центр контакта).
export type BoatPlace = { readonly x: number; readonly y: number; readonly w: number; readonly lift?: number; readonly tilt?: number; readonly pivot?: Vec };
export const boatScale = (w: number) => w / BOAT_WIDTH_UNITS;
export const boatPxPerMm = (w: number) => w / BOAT_LENGTH_MM;
export const liftPx = (w: number, liftMm: number) => liftMm * boatPxPerMm(w);

// Локальная точка лодочки → мир (px).
export const boatLocalToWorld = (p: Vec, place: BoatPlace): Vec => {
  const s = boatScale(place.w);
  const piv = place.pivot ?? BOAT_CONTACT;
  const r = ((place.tilt ?? 0) * Math.PI) / 180;
  const c = Math.cos(r);
  const sn = Math.sin(r);
  const dx = p.x - piv.x;
  const dy = p.y - piv.y;
  const qx = piv.x + dx * c - dy * sn;
  const qy = piv.y + dx * sn + dy * c;
  return { x: place.x + qx * s, y: place.y - liftPx(place.w, place.lift ?? 0) + (qy - BOAT_BOTTOM_Y) * s };
};
// Мир → локальные единицы (обратное преобразование).
export const boatWorldToLocal = (q: Vec, place: BoatPlace): Vec => {
  const s = boatScale(place.w);
  const piv = place.pivot ?? BOAT_CONTACT;
  const r = (-(place.tilt ?? 0) * Math.PI) / 180;
  const lx = (q.x - place.x) / s;
  const ly = (q.y - place.y + liftPx(place.w, place.lift ?? 0)) / s + BOAT_BOTTOM_Y;
  const dx = lx - piv.x;
  const dy = ly - piv.y;
  return { x: piv.x + dx * Math.cos(r) - dy * Math.sin(r), y: piv.y + dx * Math.sin(r) + dy * Math.cos(r) };
};
// На сколько мм самая низкая точка днища уходит ниже стола при наклоне tilt
// (градусы) вокруг pivot (локальные ед.); 0 — если не уходит. План добавляет
// это к подъёму, чтобы наклонённая лодочка не проваливалась в стол.
export const tiltDipMm = (tilt: number, pivot: Vec): number => {
  const r = (tilt * Math.PI) / 180;
  const c = Math.cos(r);
  const sn = Math.sin(r);
  let low = BOAT_BOTTOM_Y;
  for (const p of [BOAT_GEOM.botL, BOAT_GEOM.botR, BOAT_GEOM.deckL, BOAT_GEOM.deckR]) {
    const y = pivot.y + (p.x - pivot.x) * sn + (p.y - pivot.y) * c;
    if (y > low) low = y;
  }
  return (low - BOAT_BOTTOM_Y) * MM_PER_UNIT;
};

// SVG-трансформация той же постановки (для <g transform=…>).
export const boatTransform = (place: BoatPlace): string => {
  const s = boatScale(place.w);
  const piv = place.pivot ?? BOAT_CONTACT;
  return `translate(${place.x} ${place.y - liftPx(place.w, place.lift ?? 0)}) scale(${s}) translate(0 ${-BOAT_BOTTOM_Y}) rotate(${place.tilt ?? 0} ${piv.x} ${piv.y})`;
};

// ---------- Вид сверху ----------
// Локальные ед. той же длины (−118…118). y вниз; ближний к камере комнаты
// борт (с уголком) — сверху (−y), как в плане стола (v растёт вверх).
export const TOP_GEOM = {
  outline: [v(-118, 0), v(-64, -27), v(64, -27), v(118, 0), v(64, 27), v(-64, 27)] as const,
  inner: [v(-98, 0), v(-58, -17), v(58, -17), v(98, 0), v(58, 17), v(-58, 17)] as const,
  // уголок: шарнир на ближнем борту у левого носа
  hingeA: v(-88, -15),
  hingeB: v(-108, -5),
  cornerClosed: v(-117, -1),
  cornerOpen: v(-107, -27),
  sailHalfLen: 44,
} as const;
export const topFlapPolygon = (open: number): readonly Vec[] => {
  const o = Math.max(0, Math.min(1.1, open));
  return [TOP_GEOM.hingeA, lerpV(TOP_GEOM.cornerClosed, TOP_GEOM.cornerOpen, o), TOP_GEOM.hingeB];
};
