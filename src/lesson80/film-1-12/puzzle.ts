// Деревянная картинка из шести деталей (3 × 2) — модель без зависимостей от
// Remotion: её читают хореография, рисунок (комната и вид сверху) и тесты.
//
// Системы координат (одни на весь фильм):
//   • рисунок — единицы картинки 300 × 200, начало в левом верхнем углу,
//     y вниз; «верх» картинки — от Юсуфа (он собирает её для себя);
//     клетка детали 100 × 100;
//   • плоскость столешницы — (u, w): u = мировой x (px), w — глубина от
//     переднего края стола (сторона камеры) к заднему (сторона детей), px;
//     z — высота над столешницей (px);
//   • вид сверху: камера над столом, Юсуф внизу кадра — картинка в кадре
//     прямая; вид из комнаты: та же плоскость, видимая с противоположной
//     стороны стола (поворот на 180°) и сжатая по глубине (FS).
// Деталь — отдельный объект: своя форма (выступы и пазы), свой участок
// общего рисунка, положение (u, w, z) и угол поворота θ (градусы, по часовой
// в виде сверху). Состояние деталей во времени задаёт хореография.

export type Edge = -1 | 0 | 1; // −1 паз, 0 ровный край, 1 выступ
export type PieceId = "r0c0" | "r0c1" | "r0c2" | "r1c0" | "r1c1" | "r1c2";
export type PieceDef = {
  readonly id: PieceId;
  readonly row: 0 | 1;
  readonly col: 0 | 1 | 2;
  readonly edges: { readonly top: Edge; readonly right: Edge; readonly bottom: Edge; readonly left: Edge };
  readonly what: string;
};

// Стыки (знак: +1 — выступ уходит в правую/нижнюю деталь, −1 — в левую/верхнюю).
// Детали с листиком (r0c1) нужен паз слева (выступ r0c0) и выступ снизу
// (паз r1c1): повёрнутая на четверть оборота, она упирается выступом в
// выступ r0c0 и не входит — так и задумано для первой неудачной попытки.
const V = { r0c0: 1, r0c1: -1, r1c0: -1, r1c1: 1 } as const; // вертикальные стыки справа от детали
const H = { c0: 1, c1: 1, c2: -1 } as const; // горизонтальные стыки под деталями верхнего ряда

export const PIECES: readonly PieceDef[] = [
  { id: "r0c0", row: 0, col: 0, edges: { top: 0, left: 0, right: V.r0c0 as Edge, bottom: H.c0 as Edge }, what: "крона дерева, начало ветки" },
  { id: "r0c1", row: 0, col: 1, edges: { top: 0, left: -V.r0c0 as Edge, right: V.r0c1 as Edge, bottom: H.c1 as Edge }, what: "ветка с зелёным листиком" },
  { id: "r0c2", row: 0, col: 2, edges: { top: 0, left: -V.r0c1 as Edge, right: 0, bottom: H.c2 as Edge }, what: "конец ветки и птица" },
  { id: "r1c0", row: 1, col: 0, edges: { top: -H.c0 as Edge, left: 0, right: V.r1c0 as Edge, bottom: 0 }, what: "ствол и трава" },
  { id: "r1c1", row: 1, col: 1, edges: { top: -H.c1 as Edge, left: -V.r1c0 as Edge, right: V.r1c1 as Edge, bottom: 0 }, what: "трава и цветок" },
  { id: "r1c2", row: 1, col: 2, edges: { top: -H.c2 as Edge, left: -V.r1c1 as Edge, right: 0, bottom: 0 }, what: "трава и куст" },
];

export const pieceById = (id: PieceId): PieceDef => {
  const p = PIECES.find((x) => x.id === id);
  if (!p) throw new Error(`Нет детали ${id}`);
  return p;
};

// Центр клетки детали в единицах рисунка.
export const homeCenter = (p: PieceDef) => ({ x: 50 + p.col * 100, y: 50 + p.row * 100 });

// ---------- форма детали ----------
// Классический выступ в локальных координатах края: x 0…100 вдоль края,
// y — наружу (для паза — внутрь). Голова ≈ 36, шейка ≈ 22, высота ≈ 26.
const KNOB: readonly (readonly number[])[] = [
  [35, 0],
  [37, 0, 40, 2, 39, 6],
  [37, 12, 31, 21, 41, 25],
  [47, 28, 53, 28, 59, 25],
  [69, 21, 63, 12, 61, 6],
  [60, 2, 63, 0, 65, 0],
  [100, 0],
];

type Pt = { readonly x: number; readonly y: number };
const edgePath = (a: Pt, b: Pt, n: Pt, k: Edge, first: boolean): string => {
  const at = (x: number, y: number) => {
    const px = a.x + ((b.x - a.x) * x) / 100 + n.x * y * k;
    const py = a.y + ((b.y - a.y) * x) / 100 + n.y * y * k;
    return `${px.toFixed(2)} ${py.toFixed(2)}`;
  };
  const head = first ? `M ${at(0, 0)} ` : "";
  if (k === 0) return `${head}L ${at(100, 0)} `;
  let d = head;
  for (const s of KNOB) {
    if (s.length === 2) d += `L ${at(s[0], s[1])} `;
    else d += `C ${at(s[0], s[1])} ${at(s[2], s[3])} ${at(s[4], s[5])} `;
  }
  return d;
};

// Контур детали вокруг её центра (0, 0), единицы рисунка, по часовой.
export const piecePath = (p: PieceDef): string => {
  const e = p.edges;
  const h = 50;
  return (
    edgePath({ x: -h, y: -h }, { x: h, y: -h }, { x: 0, y: -1 }, e.top, true) +
    edgePath({ x: h, y: -h }, { x: h, y: h }, { x: 1, y: 0 }, e.right, false) +
    edgePath({ x: h, y: h }, { x: -h, y: h }, { x: 0, y: 1 }, e.bottom, false) +
    edgePath({ x: -h, y: h }, { x: -h, y: -h }, { x: -1, y: 0 }, e.left, false) +
    "Z"
  );
};

// Подходит ли деталь, повёрнутая на θ (кратно 90°), в своё гнездо при
// уже стоящих соседях: каждый край против соседа должен быть парой
// «выступ — паз» (и не выступ против выступа).
export const fitsAt = (p: PieceDef, thetaDeg: number, placed: ReadonlySet<PieceId>): boolean => {
  const q = ((Math.round(thetaDeg / 90) % 4) + 4) % 4;
  const order = ["top", "right", "bottom", "left"] as const;
  // при повороте по часовой на 90° верхний край становится правым и т. д.
  const sideAt = (side: (typeof order)[number]): Edge => p.edges[order[(order.indexOf(side) - q + 4) % 4]];
  const nb = (dr: number, dc: number) => PIECES.find((x) => x.row === p.row + dr && x.col === p.col + dc);
  const checks: [(typeof order)[number], PieceDef | undefined, (typeof order)[number]][] = [
    ["top", nb(-1, 0), "bottom"],
    ["right", nb(0, 1), "left"],
    ["bottom", nb(1, 0), "top"],
    ["left", nb(0, -1), "right"],
  ];
  for (const [side, n, nside] of checks) {
    const mine = sideAt(side);
    if (!n) {
      if (mine !== 0) return false; // край картинки должен быть ровным
      continue;
    }
    if (!placed.has(n.id)) continue;
    if (mine + n.edges[nside] !== 0 || mine === 0) return false;
  }
  return true;
};

// ---------- картинка на столе ----------
// Масштаб: 1 единица рисунка = S px мира; деталь 36 px (≈ 7 см в мире
// персонажей), картинка 108 × 72 px. Центр собранной картинки — перед
// Юсуфом, ближе к его краю стола.
export const S = 0.36;
export const PICTURE = { u: 2020, w: 110 } as const;
export const PIECE_THICK = 3.2; // толщина дерева, px мира
// Глубина столешницы и сжатие её по вертикали в виде из комнаты.
export const TABLE_PLANE = { depth: 210, fs: 0.22 } as const;

// Гнездо детали в плоскости стола (центр детали при θ = 0).
export const slotOf = (p: PieceDef) => {
  const c = homeCenter(p);
  return { u: PICTURE.u - S * (c.x - 150), w: PICTURE.w + S * (c.y - 100) };
};

// Положение детали в плоскости стола.
export type PiecePose = {
  readonly u: number;
  readonly w: number;
  readonly z: number; // высота над столом, px
  readonly theta: number; // градусы, по часовой в виде сверху
  readonly placed: boolean; // стоит в картинке (соединена)
  readonly held: "left" | "right" | "both" | null; // в какой руке Юсуфа (анатомически) или в обеих
};

// Точка детали (локальные единицы рисунка от её центра, θ — поворот) → плоскость стола.
export const pieceToPlane = (pose: Pick<PiecePose, "u" | "w" | "theta">, lx: number, ly: number) => {
  const r = (pose.theta * Math.PI) / 180;
  const rx = lx * Math.cos(r) - ly * Math.sin(r);
  const ry = lx * Math.sin(r) + ly * Math.cos(r);
  return { u: pose.u - S * rx, w: pose.w + S * ry };
};

// Плоскость стола → мир комнаты (вид из комнаты). Передний край стола —
// y = top; дальний край выше на fs · depth; поднятый предмет — выше на z.
export const planeToRoom = (tableTop: number, u: number, w: number, z = 0) => ({ x: u, y: tableTop - TABLE_PLANE.fs * w - z });

// Сколько деталей соединено в картинке.
export const placedCount = (poses: readonly PiecePose[]) => poses.filter((p) => p.placed).length;

// Начальные положения (сцена 1): три соединены, три лежат отдельно.
export const START_PLACED: readonly PieceId[] = ["r0c0", "r1c0", "r1c1"];
export const LOOSE_START: Readonly<Record<"r0c1" | "r0c2" | "r1c2", { u: number; w: number; theta: number }>> = {
  // деталь с листиком — слева от Юсуфа (справа в кадре комнаты), повёрнута на четверть оборота
  r0c1: { u: 2111, w: 66, theta: 90 },
  // две детали правой стороны картинки — справа от Юсуфа, у своих гнёзд
  r1c2: { u: 1923, w: 62, theta: -32 },
  r0c2: { u: 1917, w: 150, theta: 24 },
};
// Куда Юсуф откладывает деталь с листиком после неудачной попытки.
export const LEAF_ASIDE = { u: 2113, w: 72, theta: 96 } as const;

// Пустая коробка (плоскость стола; размеры — px мира).
export const BOX = { w: 118, d: 84, h: 30, start: { u: 2222, w: 140 }, end: { u: 2152, w: 108 } } as const; // в начале — не между Амиром и его книгой
