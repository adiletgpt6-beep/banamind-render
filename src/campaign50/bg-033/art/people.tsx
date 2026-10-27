// =============================================================================
// BG-033 · art/people.tsx — персонажи ролика (мама, ребёнок, руки мамы).
// -----------------------------------------------------------------------------
// Все компоненты рисуются в кадре 1080×1920 (абсолютные px кадра) и зависят
// только от номера кадра (prop f или useCurrentFrame) — без Math.random/Date.
// Стиль: плоская заливка, мягкий контур C.ink ≈ 85 % (≈ 4 px кадра, у мелких
// фигур тоньше), скруглённые соединения, одна тень-тон.
//
// Каждый компонент есть в двух вариантах:
//   <Mom …/>  — готовый слой: <svg> во весь кадр (position:absolute, left/top 0);
//   <MomG …/> — то же как <g>, чтобы вставить в СВОЙ <svg viewBox="0 0 1080 1920">
//               (например, внутри clipPath рамки FRAME_SQ). Аналогично Kid/KidG,
//               MomKidHug/MomKidHugG, MomHand/MomHandG, MomPhoneHand/MomPhoneHandG.
//
// ── Mom ── мама ≈ 35 лет: тёмные волосы в низком пучке, миндалевидные глаза,
//   голубой кардиган поверх кремовой блузы, тёмные брюки, серьги-гвоздики.
//   x, y   — px кадра. view="standing"|"seated": точка на полу между ступнями;
//            view="bust": линия талии (низ бюста; ниже ещё ≈ 125·s px кардигана —
//            его закрывает стол или край кадра).
//   s      — масштаб: при s=1 высота головы 190 px, рост стоя ≈ 1275 px.
//   view   — "bust" (по пояс) | "seated" (сидит на стуле, анфас) | "standing".
//   f      — кадр (по умолчанию useCurrentFrame()).
//   expr   — "neutral" | "doubt" | "hopeful" | "relief" | "smile".
//   exprTo, exprT — плавный переход expr → exprTo (exprT 0…1). Пример «брови
//            хмурые → приподнятые»: expr="doubt" exprTo="hopeful" exprT={t}.
//   look   — {x, y} −1…1: взгляд (зрачки + лёгкий поворот головы); y>0 — вниз.
//   mouth  — 0…1 открытие рта (useMouth("mother")); 0 — рот закрыт по expr.
//   blinks — кадры моргания; без него — автоморгание ≈ раз в 3,4 с.
//   tilt   — наклон головы, градусы (+ по часовой). nod — 0…1 кивок.
//   armL / armR — поза левой / правой (в кадре) руки:
//            "rest" | "onTable" | "holdPhone" | "holdPen" | "hug" | "reach" | "wave";
//            плавная смена — кортеж [из, в, t]: armR={["holdPen","holdPhone",t]}.
//   handL / handR — сдвиг кисти {dx, dy} (px при s=1), чтобы попасть в предмет.
//   phoneLift — 0…1: телефон (рука "holdPhone") поднимается от стола к груди/лицу.
//   phoneScreen — true: телефон экраном к зрителю (светится); по умолчанию
//            видна задняя крышка, а свет экрана мягко падает на лицо мамы.
//   flip   — зеркально по горизонтали. opacity — 0…1.
//   Пример: <Mom x={540} y={1920} s={1.4} view="bust" expr="doubt" exprTo="hopeful"
//             exprT={t} mouth={useMouth("mother")} armL="onTable"
//             armR={["holdPen","holdPhone",u]} phoneLift={u} look={{x:0.2,y:0.6}} />
//   Стол: для "bust" верх столешницы на y + MOM_METRICS.bustTableY·s,
//         для "seated" — на y + MOM_METRICS.tableY·s (предплечья "onTable" лежат
//         на этой линии). Стол рисуйте ПОСЛЕ мамы — он закроет низ фигуры.
//
// ── Kid ── девочка ≈ 8 лет: два хвостика с жёлтыми резинками, белая блузка,
//   тёмно-синие жилет и юбка, белые гольфы; рюкзак тёмно-синий с жёлтым.
//   x, y   — точка на полу между ступнями ("seated": пол под стулом; сиденье на
//            y − 450·s, стол на y − 635·s — те же высоты, что у мамы).
//   s      — при s=1 голова 180 px, рост ≈ 980 px. Одинаковый s у мамы и
//            ребёнка даёт правильное соотношение роста.
//   view   — "seated" (анфас за столом) | "standing" | "walking" (¾, идёт вправо;
//            flip=true — идёт влево).
//   expr   — "calm" | "happy" | "focused".
//   walk   — фаза шага (цикл 0…1 = два шага). Ноги не скользят, если
//            walk = kidWalkPhase(пройдено_px, s) (KID_METRICS.stride·s px за цикл).
//   wave   — 0…1 рука поднимается и машет. hug — 0…1 руки обнимают (вперёд,
//            по направлению взгляда; flip=true — влево).
//   arms   — для seated: "write" (по умолчанию: пишет карандашом, другой рукой
//            держит лист) | "onTable" | "rest".
//   backpack — рюкзак. look, blinks, mouth, flip, opacity — как у мамы.
//   Пример: <Kid x={x0 + d} y={1500} s={0.3} view="walking" walk={kidWalkPhase(d, 0.3)} backpack />
//
// ── MomKidHug ── встреча у подъезда: мама стоит, ребёнок подходит и обнимает
//   её за талию, мама кладёт руки ребёнку на плечо и спину.
//   x, y, s — как у Mom standing; t — 0…1 (0: ребёнок в шаге справа, руки
//   опущены; 1: объятие). flip — ребёнок слева.
//
// ── MomHand ── крупная рука мамы с манжетой кардигана (макро S1/S5).
//   x, y — запястье (px кадра); s — при s=1 кисть ≈ 100 px; angle — направление
//   пальцев, градусы (0 — вправо, 90 — вниз); kind — "open" | "flat" | "relax" |
//   "fist" | "pen" | "point"; mirror — большой палец на другую сторону;
//   sleeve — длина рукава от запястья назад (px при s=1; 0 — без рукава);
//   layer — "all" | "base" (ладонь/пальцы позади предмета) | "front" (большой
//   палец / указательный поверх предмета): кошелёк рисуйте между слоями;
//   pen — показывать ручку для kind="pen" (по умолчанию да).
//   momHandTip(props) → [x, y] кончика указательного / ручки (px кадра).
//
// ── MomPhoneHand ── рука мамы держит телефон крупно (S2, вид «из-за плеча»).
//   phone — прямоугольник телефона {x, y, w, h} (обычно PHONE из layout.ts);
//   layer — "back" рисовать ДО телефона (ладонь, рукав, пальцы за кромкой),
//   "front" — ПОСЛЕ (большой палец на экране, кончики пальцев на кромке);
//   thumb — 0…1 прокрутка большим пальцем (кончик поднимается);
//   shoulder — размытое плечо и пучок мамы на переднем плане (слой back).
//   momPhoneThumbTip(phone, thumb) → [x, y] кончика большого пальца.
//
// Листы предпросмотра: PeopleSheet (обзор), MomCloseSheet, KidCloseSheet,
// HandsSheet — анимированы по кадру (0…90).
// =============================================================================
import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { blinkAt, breathe, clamp, easeInOut, lerp } from "../anim";
import { C } from "../palette";

// ---------------------------------------------------------------- общее ----
export type Pt = readonly [number, number];
type Pose<T extends string> = T | readonly [T, T, number];

/** Цвет контура: C.ink ≈ 85 % на светлом. */
export const OL = "#33446B";

/** Цвета персонажей (общие для people.tsx и car.tsx). */
export const K = {
  skin: C.skin,
  skinShade: C.skinShade,
  skinDeep: "#C98A66",
  nail: "#F8DCCB",
  blush: "#F29A88",
  hair: C.hair,
  hairShine: "#4D3C37",
  hairGray: "#A29C9C",
  iris: "#3E2B23",
  pupil: "#1B1311",
  lipLine: "#A9554E",
  lip: "#D98479",
  mouthIn: "#7A3036",
  tongue: "#E58A82",
  cardigan: "#AACDEC",
  cardiganShade: "#90BAE1",
  cardiganRib: "#9CC4E8",
  blouse: "#FFF4E2",
  blouseShade: "#F0DFC2",
  trousers: "#56627F",
  trousersShade: "#48536F",
  shoe: "#3A3F55",
  shirt: "#FFFFFF",
  shirtShade: "#E2E8F2",
  vest: "#203768",
  vestShade: "#182B55",
  skirt: "#223A6E",
  skirtShade: "#1A2F5C",
  sock: "#FFFFFF",
  kidShoe: "#22304F",
  bag: "#2A4384",
  bagShade: "#213874",
  strap: "#3D5DA2",
  tie: C.yellow,
  pen: "#2C4A8C",
  phone: "#2A3654",
  phoneEdge: "#46526F",
  screen: "#EAF3FC",
  driverShirt: "#7DA2C6",
  driverShirtShade: "#6A8FB4",
} as const;

const RAD = Math.PI / 180;
const r1 = (v: number) => Math.round(v * 10) / 10;
const fp = (p: Pt) => `${r1(p[0])},${r1(p[1])}`;
const line = (a: readonly Pt[]) =>
  a.map((p, i) => `${i ? "L" : "M"}${fp(p)}`).join(" ");
const mixP = (a: Pt, b: Pt, t: number): Pt => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];
const addP = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const polar = (len: number, deg: number): Pt => [
  len * Math.cos(deg * RAD),
  len * Math.sin(deg * RAD),
];
const angOf = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD;
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const dirv = (a: Pt, b: Pt): Pt => {
  const l = dist(a, b) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};
const nrm = (a: Pt, b: Pt): Pt => {
  const d = dirv(a, b);
  return [-d[1], d[0]];
};
const offP = (p: Pt, n: Pt, k: number): Pt => [p[0] + n[0] * k, p[1] + n[1] * k];
const lineX = (p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null => {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-6) return null;
  const t =
    ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
};

const segX = (a: Pt, b: Pt, c: Pt, d: Pt): Pt | null => {
  const X = lineX(a, b, c, d);
  if (!X) return null;
  const within = (p: Pt, q: Pt) =>
    X[0] >= Math.min(p[0], q[0]) - 0.5 &&
    X[0] <= Math.max(p[0], q[0]) + 0.5 &&
    X[1] >= Math.min(p[1], q[1]) - 0.5 &&
    X[1] <= Math.max(p[1], q[1]) + 0.5;
  return within(a, b) && within(c, d) ? X : null;
};

/**
 * Нижняя граница «плеча поверх руки»: точка, где внешний край рукава
 * выходит из силуэта торса (контур задан для левой стороны).
 */
const capBottom = (
  s0: Pt,
  e: Pt,
  wU: number,
  wE: number,
  side: number,
  contour: readonly Pt[],
  sx: number,
  fallback: number,
) => {
  const n1 = nrm(s0, e);
  const sg = n1[0] * side > 0 ? 1 : -1;
  const a = offP(s0, n1, (sg * wU) / 2);
  const b = offP(e, n1, (sg * wE) / 2);
  const cx = (p: Pt): Pt => [p[0] * -side * sx, p[1]];
  for (let i = 0; i < contour.length - 1; i++) {
    const X = segX(a, b, cx(contour[i]), cx(contour[i + 1]));
    if (X) return X[1];
  }
  return fallback;
};

/** Двухзвенная ИК: колено/локоть между a и c (bend ±1 — сторона сгиба). */
const ik = (a: Pt, c: Pt, l1: number, l2: number, bend: number): Pt => {
  const d = clamp(dist(a, c), Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01);
  const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const t = ang - bend * A;
  return [a[0] + l1 * Math.cos(t), a[1] + l1 * Math.sin(t)];
};

/**
 * Контур конечности a→b→c с сужением (ширины wa, wb, wc): скруглённый
 * внешний изгиб, аккуратный внутренний угол, круглый «плечевой» торец у a,
 * плоский торец у c (его закрывает манжета).
 */
const limbPath = (a: Pt, b: Pt, c: Pt, wa: number, wb: number, wc: number) => {
  const n1 = nrm(a, b);
  const n2 = nrm(b, c);
  const d2 = dirv(b, c);
  const turn = n1[0] * d2[0] + n1[1] * d2[1];
  const side = (sg: number) => {
    const p1 = offP(a, n1, (sg * wa) / 2);
    const p2 = offP(b, n1, (sg * wb) / 2);
    const p3 = offP(b, n2, (sg * wb) / 2);
    const p4 = offP(c, n2, (sg * wc) / 2);
    const X = lineX(p1, p2, p3, p4);
    if (Math.abs(turn) < 0.03 || !X) return { p1, p4, mid: [p2, p3] as Pt[], q: null as Pt | null };
    if (sg * turn > 0) {
      const XX = dist(X, b) > wb * 1.1 ? mixP(p2, p3, 0.5) : X;
      return { p1, p4, mid: [XX], q: null };
    }
    const nb = dirv([0, 0], [n1[0] + n2[0], n1[1] + n2[1]]);
    const Q = dist(X, b) > wb * 1.4 ? offP(b, nb, sg * wb * 0.62) : X;
    return { p1, p4, mid: [p2, p3], q: Q };
  };
  const A = side(1);
  const B = side(-1);
  const fwd = (S: ReturnType<typeof side>) =>
    S.q ? `L${fp(S.mid[0])} Q${fp(S.q)} ${fp(S.mid[1])}` : S.mid.map((p) => `L${fp(p)}`).join(" ");
  const back = (S: ReturnType<typeof side>) =>
    S.q
      ? `L${fp(S.mid[1])} Q${fp(S.q)} ${fp(S.mid[0])}`
      : [...S.mid].reverse().map((p) => `L${fp(p)}`).join(" ");
  const ra = r1(wa / 2);
  return `M${fp(A.p1)} ${fwd(A)} L${fp(A.p4)} L${fp(B.p4)} ${back(B)} L${fp(B.p1)} A${ra},${ra} 0 0 0 ${fp(A.p1)} Z`;
};

/** Толщина контура в локальных единицах фигуры масштаба s (≈ 4 px кадра). */
export const lineW = (s: number) => (4 * clamp(s / 0.35, 0.45, 1)) / s;

/** Автоморгание: кадры моргания около f (детерминированно). */
const autoBlinks = (f: number, offset: number, period = 101) => {
  const b = Math.floor((f - offset) / period) * period + offset;
  return [b - period, b, b + period, b + period - 37];
};

const useF = (f?: number) => {
  const cur = useCurrentFrame();
  return f ?? cur;
};
const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, "");

// Заливка с контуром.
const Sh: React.FC<{ d: string; fill: string; sw: number; op?: number }> = ({
  d,
  fill,
  sw,
  op,
}) => (
  <path
    d={d}
    fill={fill}
    stroke={OL}
    strokeWidth={sw}
    strokeLinejoin="round"
    strokeLinecap="round"
    opacity={op}
  />
);

// Линия без заливки.
const Ln: React.FC<{ d: string; c: string; w: number; op?: number; cap?: "round" | "butt" }> = ({
  d,
  c,
  w,
  op,
  cap,
}) => (
  <path
    d={d}
    fill="none"
    stroke={c}
    strokeWidth={w}
    strokeLinecap={cap ?? "round"}
    strokeLinejoin="round"
    opacity={op}
  />
);

/** Слой во весь кадр 1080×1920. */
const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    viewBox="0 0 1080 1920"
    width={1080}
    height={1920}
    style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
  >
    {children}
  </svg>
);

// ------------------------------------------------------------------ кисти --
export type HandKind = "open" | "flat" | "relax" | "fist" | "pen" | "point";
type Finger = { pts: Pt[]; w: number; nail?: boolean };
type HandGeom = {
  palm: string;
  fingers: Finger[]; // в слое base
  thumb: Finger;
  thumbFront: boolean; // большой палец поверх ладони/предмета
  front?: Finger[]; // пальцы поверх предмета
  seps?: Pt[][]; // линии между сомкнутыми пальцами
  pen?: readonly [Pt, Pt];
  tip: Pt; // кончик указательного / ручки
};

const fingerPts = (base: Pt, deg: number, len: number, curl: number): Pt[] => {
  const m = addP(base, polar(len * 0.55, deg));
  const tip = addP(m, polar(len * 0.45, deg + curl));
  return [base, m, tip];
};

// Кисть: запястье в (0,0), пальцы по +x, большой палец со стороны −y.
// Длина ≈ 100 (ладонь ≈ 58 + пальцы ≈ 46), ширина ладони ≈ 52.
const PALM_OPEN =
  "M0,-19 C9,-21 17,-27 26,-31 C38,-32 50,-30 58,-27 C64,-24 65,-14 65,-6 L65,12 C64,22 58,27 49,27 C34,27 14,24 0,20 Z";
const PALM_FIST =
  "M0,-20 C14,-23 30,-27 46,-27 C60,-27 70,-22 73,-10 C76,2 74,16 66,23 C58,28 46,28 34,27 C22,26 10,23 0,20 Z";
const handGeom = (kind: HandKind): HandGeom => {
  switch (kind) {
    case "open":
      return {
        palm: PALM_OPEN,
        fingers: [
          { pts: fingerPts([57, -20], -15, 43, -4), w: 13, nail: true },
          { pts: fingerPts([60, -6], -4, 49, -2), w: 13.5, nail: true },
          { pts: fingerPts([59, 8], 6, 45, 2), w: 13, nail: true },
          { pts: fingerPts([54, 19], 16, 35, 4), w: 11.5, nail: true },
        ],
        thumb: { pts: [[22, -24], [36, -40], [47, -52]], w: 15, nail: true },
        thumbFront: false,
        tip: [104, -14],
      };
    case "flat":
      return {
        palm: PALM_OPEN,
        fingers: [
          { pts: fingerPts([57, -18], -4, 41, 3), w: 13.5, nail: true },
          { pts: fingerPts([60, -5], -1, 46, 3), w: 14, nail: true },
          { pts: fingerPts([59, 8], 3, 43, 3), w: 13.5, nail: true },
          { pts: fingerPts([54, 19], 7, 34, 3), w: 12, nail: true },
        ],
        thumb: { pts: [[20, -22], [33, -31], [47, -33]], w: 14.5, nail: true },
        thumbFront: false,
        seps: [
          [[66, -11], [96, -13]],
          [[68, 2], [100, 4]],
          [[66, 14], [91, 18]],
        ],
        tip: [106, -6],
      };
    case "relax":
      return {
        palm: "M0,-17 C16,-20 38,-22 52,-20 C64,-18 72,-10 76,2 C80,14 76,24 66,26 C52,28 40,24 30,22 C18,20 8,19 0,17 Z",
        fingers: [],
        thumb: { pts: [[14, -13], [32, -19], [47, -14]], w: 13 },
        thumbFront: true,
        seps: [
          [[60, 2], [73, 6]],
          [[55, 13], [68, 18]],
        ],
        tip: [76, 6],
      };
    case "fist":
      return {
        palm: PALM_FIST,
        fingers: [],
        thumb: { pts: [[18, -17], [36, -13], [50, -5]], w: 14, nail: true },
        thumbFront: true,
        seps: [
          [[62, -10], [72, -10]],
          [[63, 3], [74, 3]],
          [[61, 15], [70, 15]],
        ],
        tip: [74, 0],
      };
    case "pen":
      return {
        palm: PALM_FIST,
        fingers: [],
        thumb: { pts: [[18, -18], [37, -26], [54, -22]], w: 14, nail: true },
        thumbFront: true,
        front: [{ pts: [[58, -14], [74, -16], [84, -6]], w: 13, nail: true }],
        seps: [
          [[63, 5], [73, 5]],
          [[60, 16], [69, 16]],
        ],
        pen: [
          [36, -52],
          [102, 16],
        ],
        tip: [102, 16],
      };
    case "point":
      return {
        palm: PALM_FIST,
        fingers: [],
        thumb: { pts: [[18, -18], [36, -13], [51, -6]], w: 14, nail: true },
        thumbFront: true,
        front: [{ pts: [[58, -15], [82, -16], [104, -15]], w: 13, nail: true }],
        seps: [
          [[63, 4], [73, 4]],
          [[61, 15], [70, 15]],
        ],
        tip: [110, -15],
      };
  }
};

type HandOpts = {
  kind: HandKind;
  at: Pt;
  angle: number; // градусы
  sc: number; // масштаб кисти (1 — взрослая)
  mirror: boolean;
  sw: number; // контур в единицах родителя
  skin?: string;
  item?: "pen" | "phone" | null;
  phoneScreen?: boolean;
  detail?: boolean; // ногти / складки (крупный план)
};

const handTf = (o: { at: Pt; angle: number; sc: number; mirror: boolean }) =>
  `translate(${fp(o.at)}) rotate(${r1(o.angle)}) scale(${o.sc},${o.mirror ? -o.sc : o.sc})`;

// Пальцы в два прохода: сначала контур всех, потом заливка — без швов.
const fingersArt = (fs: Finger[], sw: number, skin: string, nails: boolean) => (
  <>
    {fs.map((fg, i) => (
      <Ln key={`o${i}`} d={line(fg.pts)} c={OL} w={fg.w + 2 * sw} />
    ))}
    {fs.map((fg, i) => (
      <Ln key={`f${i}`} d={line(fg.pts)} c={skin} w={fg.w} />
    ))}
    {nails
      ? fs.map((fg, i) => {
          if (!fg.nail) return null;
          const tip = fg.pts[fg.pts.length - 1];
          const prev = fg.pts[fg.pts.length - 2];
          const a = angOf(prev, tip);
          const c = addP(tip, polar(-fg.w * 0.2, a));
          return (
            <ellipse
              key={`n${i}`}
              cx={c[0]}
              cy={c[1]}
              rx={fg.w * 0.34}
              ry={fg.w * 0.26}
              transform={`rotate(${r1(a)} ${fp(c)})`}
              fill={K.nail}
            />
          );
        })
      : null}
  </>
);

// Телефон в руке «мамы смотрит в экран»: кисть тыльной стороной к зрителю,
// пальцы поперёк задней крышки. Локально: телефон по +x (x 4…128), по −y.
const PHONE_D = "M12,-72 L122,-72 Q130,-72 130,-64 L130,-8 Q130,0 122,0 L12,0 Q4,0 4,-8 L4,-64 Q4,-72 12,-72 Z";
const phoneGrip = (o: HandOpts, sw: number, skin: string) => {
  const tf = handTf(o);
  const screen = !!o.phoneScreen;
  const phone = (
    <g transform={tf}>
      {screen ? null : <ellipse cx={86} cy={-36} rx={66} ry={52} fill={C.sky} opacity={0.75} />}
      <path d={PHONE_D} fill={screen ? "#1E2740" : K.phone} stroke={OL} strokeWidth={sw * 1.1} strokeLinejoin="round" />
      {screen ? (
        <>
          <rect x={10} y={-66} width={114} height={60} rx={6} fill={K.screen} />
          <rect x={92} y={-60} width={24} height={10} rx={4} fill={C.yellow} />
          <rect x={20} y={-44} width={92} height={7} rx={3} fill={C.skyDeep} />
          <rect x={20} y={-30} width={70} height={7} rx={3} fill={C.skyDeep} />
        </>
      ) : (
        <>
          <rect x={96} y={-64} width={26} height={26} rx={7} fill={K.phoneEdge} />
          <circle cx={109} cy={-51} r={6} fill="#1C2438" />
          <Ln d="M14,-68 L118,-68" c="#56648A" w={3} />
        </>
      )}
    </g>
  );
  const dorsal = (
    <g transform={tf}>
      <path d="M0,-16 C18,-20 44,-16 70,-10 C80,-6 82,10 72,18 C50,24 22,24 0,20 Z" fill={OL} stroke={OL} strokeWidth={2 * sw} strokeLinejoin="round" />
      {fingersArt(
        [62, 48, 34, 21].map((x, i) => ({
          pts: [[x, -2], [x + 2, -52], [x + 7, i === 3 ? -58 : -66]] as Pt[],
          w: i === 3 ? 12 : 13.5,
        })),
        sw,
        skin,
        false,
      )}
      <path d="M0,-16 C18,-20 44,-16 70,-10 C80,-6 82,10 72,18 C50,24 22,24 0,20 Z" fill={skin} />
      {[55, 41, 28].map((x) => (
        <Ln key={x} d={`M${x},-6 L${x + 1},-50`} c={K.skinDeep} w={Math.max(1.4, sw * 0.5)} op={0.75} />
      ))}
      <Ln d="M10,8 Q36,14 62,8" c={K.skinShade} w={4} />
    </g>
  );
  const thumbFront = (
    <g transform={tf}>
      {fingersArt([{ pts: [[8, -6], [30, -22], [52, -30]], w: 14, nail: true }], sw, skin, true)}
    </g>
  );
  return screen
    ? { base: dorsal, item: phone, front: thumbFront }
    : { base: null as React.ReactNode, item: phone, front: dorsal };
};

// Кисть в слоях: base (ладонь, пальцы) → [предмет] → front (большой палец…).
const handLayers = (o: HandOpts) => {
  const sw = o.sw / o.sc;
  const skin = o.skin ?? K.skin;
  if (o.item === "phone") return phoneGrip(o, sw, skin);
  const g = handGeom(o.kind);
  const tf = handTf(o);
  const nails = !!o.detail;
  const base = (
    <g transform={tf}>
      <path d={g.palm} fill={OL} stroke={OL} strokeWidth={2 * sw} strokeLinejoin="round" />
      {fingersArt(g.thumbFront ? g.fingers : [...g.fingers, g.thumb], sw, skin, nails)}
      <path d={g.palm} fill={skin} />
      {(g.seps ?? []).map((sp, i) => (
        <Ln key={i} d={line(sp)} c={K.skinDeep} w={Math.max(1.5, sw * 0.55)} op={0.8} />
      ))}
      {o.detail ? <Ln d="M20,10 Q34,16 48,13" c={K.skinShade} w={2.6} /> : null}
    </g>
  );
  let item: React.ReactNode = null;
  if (o.item === "pen" && g.pen) {
    const [a, b] = g.pen;
    item = (
      <g transform={tf}>
        <Ln d={line([a, b])} c={OL} w={7 + 2 * sw} />
        <Ln d={line([a, mixP(a, b, 0.84)])} c={K.pen} w={7} />
        <Ln d={line([mixP(a, b, 0.84), mixP(a, b, 0.97)])} c="#E8ECF4" w={5.5} cap="butt" />
        <Ln d={line([a, mixP(a, b, 0.18)])} c={C.yellow} w={4} />
      </g>
    );
  }
  const frontFingers = [...(g.front ?? []), ...(g.thumbFront ? [g.thumb] : [])];
  const front = frontFingers.length ? (
    <g transform={tf}>{fingersArt(frontFingers, sw, skin, nails)}</g>
  ) : null;
  return { base, item, front };
};

// ---------------------------------------------------------------- руки -----
type ArmDraw = {
  s0: Pt;
  e: Pt;
  w: Pt;
  wU: number; // ширина рукава у плеча
  wE: number; // у локтя
  wF: number; // у запястья
  sleeve: string;
  cuff: string;
  hand: HandOpts;
  sw: number;
};

const armLayers = (a: ArmDraw) => {
  const dir = dirv(a.e, a.w);
  const h = handLayers({ ...a.hand, at: offP(a.w, dir, -5) });
  const n = nrm(a.e, a.w);
  const cl = a.wF * 0.42;
  const c0 = offP(a.w, dir, -cl);
  const hw = a.wF / 2 + 2;
  const cuff = `M${fp(offP(c0, n, hw))} L${fp(offP(a.w, n, hw))} L${fp(offP(a.w, n, -hw))} L${fp(offP(c0, n, -hw))} Z`;
  const sleeve = (
    <g>
      <path d={limbPath(a.s0, a.e, c0, a.wU, a.wE, a.wF)} fill={a.sleeve} stroke={OL} strokeWidth={a.sw} strokeLinejoin="round" />
      <path d={cuff} fill={a.cuff} stroke={OL} strokeWidth={a.sw * 0.9} strokeLinejoin="round" />
    </g>
  );
  return { base: h.base, sleeve, item: h.item, front: h.front };
};

const ArmG: React.FC<{ a: ArmDraw }> = ({ a }) => {
  const L = armLayers(a);
  return (
    <g>
      {L.base}
      {L.sleeve}
      {L.item}
      {L.front}
    </g>
  );
};

type ArmDef = {
  e: Pt;
  w: Pt;
  ha: number;
  hk: HandKind;
  mir: boolean;
  front: boolean; // рука перед торсом (иначе — за ним)
  item?: "pen" | "phone";
};

const mirrorDef = (d: ArmDef): ArmDef => ({
  ...d,
  e: [-d.e[0], d.e[1]],
  w: [-d.w[0], d.w[1]],
  ha: 180 - d.ha,
  mir: !d.mir,
});

const blendDef = (a: ArmDef, b: ArmDef, t: number): ArmDef => {
  const k = easeInOut(t);
  const first = k < 0.5;
  return {
    e: mixP(a.e, b.e, k),
    w: mixP(a.w, b.w, k),
    ha: lerp(a.ha, b.ha, k),
    hk: first ? a.hk : b.hk,
    mir: first ? a.mir : b.mir,
    front: first ? a.front : b.front,
    item: first ? a.item : b.item,
  };
};

const resolveArm = <T extends string>(
  pose: Pose<T>,
  side: -1 | 1,
  def: (p: T) => ArmDef,
): ArmDef => {
  const one = (p: T) => (side < 0 ? def(p) : mirrorDef(def(p)));
  if (typeof pose === "string") return one(pose as T);
  const [a, b, t] = pose as readonly [T, T, number];
  return blendDef(one(a), one(b), t);
};

// ---------------------------------------------------------------- лица -----
type FaceKind = "mom" | "kid" | "driver";
export type MomExpr = "neutral" | "doubt" | "hopeful" | "relief" | "smile";
export type KidExpr = "calm" | "happy" | "focused";
type AnyExpr = MomExpr | KidExpr | "driver";
type ExprP = {
  iy: number; // внутренний край брови (+ вниз)
  oy: number; // внешний край
  arch: number; // изгиб
  asym: number; // асимметрия (правая бровь)
  eye: number; // раскрытие глаз
  lower: number; // «улыбка» нижнего века
  hw: number; // полуширина рта
  bend: number; // изгиб рта (+ улыбка)
  fill: number; // 1 — улыбка с зубами
  masym: number; // асимметрия уголков
};
const EXPR: Record<AnyExpr, ExprP> = {
  neutral: { iy: 0, oy: 1, arch: 6, asym: 0, eye: 1, lower: 0, hw: 15, bend: 3, fill: 0, masym: 0 },
  doubt: { iy: 7, oy: -2, arch: 2, asym: -5, eye: 0.9, lower: 0.12, hw: 14, bend: -2.5, fill: 0, masym: 3 },
  hopeful: { iy: -9, oy: 2, arch: 4, asym: 0, eye: 1.06, lower: 0, hw: 15, bend: 6, fill: 0, masym: 0 },
  relief: { iy: -4, oy: -3, arch: 8, asym: 0, eye: 0.62, lower: 0.3, hw: 18, bend: 8, fill: 0, masym: 0 },
  smile: { iy: -6, oy: -5, arch: 9, asym: 0, eye: 0.74, lower: 0.6, hw: 22, bend: 13, fill: 1, masym: 0 },
  calm: { iy: -2, oy: 0, arch: 6, asym: 0, eye: 1, lower: 0.1, hw: 12, bend: 6, fill: 0, masym: 0 },
  happy: { iy: -6, oy: -4, arch: 9, asym: 0, eye: 0.8, lower: 0.55, hw: 19, bend: 14, fill: 1, masym: 0 },
  focused: { iy: 5, oy: 0, arch: 3, asym: 0, eye: 0.84, lower: 0.05, hw: 9, bend: 1, fill: 0, masym: 2 },
  driver: { iy: 0, oy: 0, arch: 4, asym: 0, eye: 1, lower: 0.15, hw: 15, bend: 5, fill: 0, masym: 0 },
};
const mixExpr = (a: ExprP, b: ExprP, t: number): ExprP => {
  const k = easeInOut(t);
  const o = {} as Record<keyof ExprP, number>;
  (Object.keys(a) as (keyof ExprP)[]).forEach((key) => {
    o[key] = lerp(a[key], b[key], k);
  });
  return o as ExprP;
};

type FaceGeo = {
  outline: string;
  eyeX: number;
  eyeY: number;
  eyeW: number;
  eyeH: number;
  iris: number;
  browY: number;
  browLen: number;
  browIn: number;
  browT: number;
  mouthY: number;
  earX: number;
  earY: number;
  earR: [number, number];
  shift: number;
};
const FACE: Record<FaceKind, FaceGeo> = {
  mom: {
    outline:
      "M0,-80 C46,-80 70,-50 70,-6 C70,30 60,58 42,76 C28,89 14,95 0,95 C-14,95 -28,89 -42,76 C-60,58 -70,30 -70,-6 C-70,-50 -46,-80 0,-80 Z",
    eyeX: 31,
    eyeY: 6,
    eyeW: 35,
    eyeH: 14,
    iris: 8.2,
    browY: -20,
    browLen: 38,
    browIn: 11,
    browT: 7,
    mouthY: 60,
    earX: 69,
    earY: 10,
    earR: [12, 19],
    shift: 14,
  },
  kid: {
    outline:
      "M0,-78 C50,-78 75,-46 75,2 C75,42 60,70 38,82 C26,88 14,90 0,90 C-14,90 -26,88 -38,82 C-60,70 -75,42 -75,2 C-75,-46 -50,-78 0,-78 Z",
    eyeX: 30,
    eyeY: 14,
    eyeW: 32,
    eyeH: 19,
    iris: 10.5,
    browY: -12,
    browLen: 30,
    browIn: 12,
    browT: 5.5,
    mouthY: 58,
    earX: 74,
    earY: 16,
    earR: [12, 17],
    shift: 13,
  },
  driver: {
    outline:
      "M0,-82 C48,-82 72,-52 72,-8 C72,30 67,56 52,74 C38,88 18,95 0,95 C-18,95 -38,88 -52,74 C-67,56 -72,30 -72,-8 C-72,-52 -48,-82 0,-82 Z",
    eyeX: 32,
    eyeY: 4,
    eyeW: 31,
    eyeH: 11,
    iris: 7.4,
    browY: -20,
    browLen: 38,
    browIn: 11,
    browT: 9,
    mouthY: 62,
    earX: 71,
    earY: 8,
    earR: [12, 20],
    shift: 13,
  },
};

type EyeO = {
  cid: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  side: number;
  open: number;
  lower: number;
  lx: number;
  ly: number;
  iris: number;
  lid: number;
  lash: boolean;
};
const eyeArt = (o: EyeO) => {
  const { cx, cy, w, h, side } = o;
  const op = clamp(o.open, 0, 1.15);
  const inner: Pt = [cx - (side * w) / 2, cy + 1.5];
  const outer: Pt = [cx + (side * w) / 2, cy - 2.5];
  if (op < 0.16) {
    const happy = o.lower > 0.4;
    const midY = happy ? cy - h * 0.55 : cy + h * 0.28;
    return <Ln d={`M${fp(inner)} Q${r1(cx)},${r1(midY)} ${fp(outer)}`} c={K.hair} w={o.lid} />;
  }
  const top = cy - h * op;
  const bot = cy + h * 0.74 * op * (1 - o.lower * 0.5);
  const upper = `M${fp(inner)} C${r1(cx - side * w * 0.22)},${r1(top)} ${r1(cx + side * w * 0.2)},${r1(top)} ${fp(outer)}`;
  const d = `${upper} C${r1(cx + side * w * 0.2)},${r1(bot)} ${r1(cx - side * w * 0.24)},${r1(bot)} ${fp(inner)} Z`;
  const ix = cx + o.lx * w * 0.2;
  const iy = cy + o.ly * h * 0.32 + h * 0.08;
  return (
    <g>
      <clipPath id={o.cid}>
        <path d={d} />
      </clipPath>
      <path d={d} fill="#FFFFFF" />
      <g clipPath={`url(#${o.cid})`}>
        <circle cx={ix} cy={iy} r={o.iris} fill={K.iris} />
        <circle cx={ix} cy={iy} r={o.iris * 0.52} fill={K.pupil} />
        <circle cx={ix - o.iris * 0.38} cy={iy - o.iris * 0.42} r={o.iris * 0.3} fill="#FFFFFF" />
      </g>
      <Ln d={upper} c={K.hair} w={o.lid} />
      {o.lash ? <Ln d={`M${fp(outer)} l${r1(side * 6)},-5`} c={K.hair} w={o.lid * 0.75} /> : null}
      {o.lower > 0.25 ? (
        <Ln
          d={`M${r1(cx - side * w * 0.3)},${r1(bot + 2.5)} Q${r1(cx)},${r1(bot + 0.5)} ${r1(cx + side * w * 0.36)},${r1(bot)}`}
          c={K.skinDeep}
          w={o.lid * 0.45}
          op={0.7}
        />
      ) : null}
    </g>
  );
};

const mouthArt = (o: { x: number; y: number; e: ExprP; open: number; f: number; lw: number; kid: boolean }) => {
  const { x, y, e } = o;
  const m = clamp(o.open);
  if (m > 0.04) {
    const round = (0.5 + 0.5 * Math.sin(o.f * 0.47)) * m * 0.55;
    const hw = (e.hw + 2 + e.fill * 2) * (1 - round * 0.45) * (o.kid ? 0.9 : 1);
    const cy = y - e.bend * 0.25;
    const cl: Pt = [x - hw, cy];
    const cr: Pt = [x + hw, cy + e.masym * 0.5];
    const upY = cy - 3 - m * 5 + e.bend * 0.15;
    const lowY = cy + e.bend * 0.7 + 5 + m * (o.kid ? 24 : 28);
    const d = `M${fp(cl)} Q${r1(x)},${r1(upY)} ${fp(cr)} Q${r1(x)},${r1(lowY)} ${fp(cl)} Z`;
    const teeth = m > 0.22 || e.fill > 0.5;
    const tY = upY + 7 + m * 3;
    return (
      <g>
        <path d={d} fill={K.mouthIn} />
        <path
          d={`M${r1(x - hw * 0.5)},${r1(lowY - 2 - m * 5)} Q${r1(x)},${r1(lowY - 4 - m * 12)} ${r1(x + hw * 0.5)},${r1(lowY - 2 - m * 5)} Q${r1(x)},${r1(lowY - 1)} ${r1(x - hw * 0.5)},${r1(lowY - 2 - m * 5)} Z`}
          fill={K.tongue}
        />
        {teeth ? (
          <path
            d={`M${r1(x - hw * 0.72)},${r1(cy - 1)} Q${r1(x)},${r1(upY + 1)} ${r1(x + hw * 0.72)},${r1(cy - 1 + e.masym * 0.4)} L${r1(x + hw * 0.6)},${r1(tY - 2)} Q${r1(x)},${r1(tY + 2)} ${r1(x - hw * 0.6)},${r1(tY - 2)} Z`}
            fill="#FFFFFF"
          />
        ) : null}
        <path d={d} fill="none" stroke={K.lipLine} strokeWidth={o.lw} strokeLinejoin="round" />
      </g>
    );
  }
  const hw = e.hw;
  const cl: Pt = [x - hw, y - e.bend * 0.3];
  const cr: Pt = [x + hw, y - e.bend * 0.3 + e.masym];
  if (e.fill > 0.5) {
    const d = `M${fp(cl)} Q${r1(x)},${r1(y + e.bend * 0.1)} ${fp(cr)} Q${r1(x)},${r1(y + e.bend * 1.05)} ${fp(cl)} Z`;
    return (
      <g>
        <path d={d} fill={K.mouthIn} />
        <path
          d={`M${r1(x - hw * 0.8)},${r1(cl[1] + 1)} Q${r1(x)},${r1(y + e.bend * 0.12)} ${r1(x + hw * 0.8)},${r1(cr[1] + 1)} Q${r1(x)},${r1(y + e.bend * 0.55)} ${r1(x - hw * 0.8)},${r1(cl[1] + 1)} Z`}
          fill="#FFFFFF"
        />
        <path d={d} fill="none" stroke={K.lipLine} strokeWidth={o.lw} strokeLinejoin="round" />
      </g>
    );
  }
  return (
    <g>
      <Ln d={`M${fp(cl)} Q${r1(x)},${r1(y + e.bend)} ${fp(cr)}`} c={K.lipLine} w={o.lw * 1.15} />
      {o.kid ? null : (
        <Ln
          d={`M${r1(x - hw * 0.45)},${r1(y + e.bend * 0.5 + 7)} Q${r1(x)},${r1(y + e.bend * 0.5 + 10)} ${r1(x + hw * 0.45)},${r1(y + e.bend * 0.5 + 7)}`}
          c={K.lip}
          w={o.lw * 1.3}
          op={0.55}
        />
      )}
    </g>
  );
};

export type HeadOpts = {
  kind: FaceKind;
  f: number;
  expr: AnyExpr;
  exprTo?: AnyExpr;
  exprT?: number;
  look?: { x: number; y: number };
  turn?: number; // −1…1 поворот лица (черты смещаются); по умолчанию от look.x
  mouth?: number;
  open?: number; // моргание 0…1
  nod?: number;
  sw: number; // контур (локальные единицы головы)
  uid: string; // уникальный префикс id (clipPath)
  sway?: number; // покачивание хвостиков, градусы
  glow?: number; // свет экрана телефона на лице 0…1
};

/**
 * Голова в локальных координатах: центр (0,0), высота ≈ 190 (mom, driver)
 * или 180 (kid). Используется также в car.tsx (водитель, ребёнок в окне).
 */
export const HeadArt: React.FC<HeadOpts> = (o) => {
  const g = FACE[o.kind];
  const e = o.exprTo ? mixExpr(EXPR[o.expr], EXPR[o.exprTo], o.exprT ?? 0) : EXPR[o.expr];
  const look = o.look ?? { x: 0, y: 0 };
  const turn = clamp(o.turn ?? look.x * 0.45, -1, 1);
  const nod = o.nod ?? 0;
  const sh = turn * g.shift;
  const fy = nod * 7 + look.y * 3;
  const sw = o.sw;
  const lid = Math.max(3.4, sw * 0.95);
  const open = clamp((o.open ?? 1) * e.eye * (1 - Math.max(0, look.y) * 0.22), 0, 1.15);
  const far = (side: number) => (Math.sign(turn) === side ? 1 - Math.abs(turn) * 0.22 : 1);
  const ear = (side: number) => {
    const hidden = Math.sign(turn) === side ? Math.abs(turn) : 0;
    const sx = Math.max(0.05, 1 - hidden * 0.9);
    const cx = side * g.earX + turn * 6;
    return (
      <g transform={`translate(${r1(cx)},${r1(g.earY + fy * 0.5)}) scale(${r1(sx * 100) / 100},1)`}>
        <ellipse rx={g.earR[0]} ry={g.earR[1]} fill={K.skin} stroke={OL} strokeWidth={sw} />
        <Ln d={`M${side * 2},-9 Q${side * 7},0 ${side * 1},9`} c={K.skinDeep} w={sw * 0.6} op={0.8} />
        {o.kind === "mom" ? (
          <circle cx={side * 1} cy={g.earR[1] - 1} r={3.8} fill={C.yellow} stroke={OL} strokeWidth={1.2} />
        ) : null}
      </g>
    );
  };
  let back: React.ReactNode = null;
  let front: React.ReactNode = null;
  let ties: React.ReactNode = null;
  if (o.kind === "mom") {
    const bs = turn >= 0 ? -1 : 1;
    const bx = bs * (50 + 30 * Math.abs(turn));
    back = (
      <g>
        <circle cx={bx} cy={52} r={31} fill={K.hair} stroke={OL} strokeWidth={sw} />
        <Ln d={`M${r1(bx + bs * 8)},30 Q${r1(bx + bs * 24)},52 ${r1(bx + bs * 10)},76`} c={K.hairShine} w={4} op={0.9} />
        <ellipse cx={0} cy={-8} rx={78} ry={86} fill={K.hair} stroke={OL} strokeWidth={sw} />
      </g>
    );
    front = (
      <g transform={`translate(${r1(turn * 5)},0)`}>
        <Sh
          d="M-77,16 C-83,-44 -52,-99 4,-99 C58,-99 85,-48 77,16 C73,-12 63,-36 45,-50 C33,-60 23,-64 14,-67 C4,-58 -18,-51 -38,-43 C-58,-33 -71,-12 -77,16 Z"
          fill={K.hair}
          sw={sw}
        />
        <Ln d="M-52,-74 Q-24,-92 8,-90" c={K.hairShine} w={6} />
        <Ln d="M30,-82 Q50,-70 60,-50" c={K.hairShine} w={4} op={0.8} />
      </g>
    );
  } else if (o.kind === "kid") {
    const sway = o.sway ?? 0;
    const tail = (side: number) => (
      <g transform={`rotate(${r1(side * 2 + sway)} ${side * 78},-28)`}>
        <Sh
          d={`M${side * 70},-40 C${side * 106},-44 ${side * 122},-8 ${side * 118},38 C${side * 116},70 ${side * 106},94 ${side * 96},106 C${side * 98},78 ${side * 94},48 ${side * 84},24 C${side * 78},10 ${side * 72},0 ${side * 66},-10 Z`}
          fill={K.hair}
          sw={sw}
        />
        <Ln d={`M${side * 96},-14 Q${side * 112},18 ${side * 106},62`} c={K.hairShine} w={5} op={0.9} />
      </g>
    );
    back = (
      <g>
        {tail(-1)}
        {tail(1)}
        <ellipse cx={0} cy={-8} rx={81} ry={84} fill={K.hair} stroke={OL} strokeWidth={sw} />
      </g>
    );
    front = (
      <g transform={`translate(${r1(turn * 5)},0)`}>
        <Sh
          d="M-81,10 C-86,-50 -50,-96 0,-96 C50,-96 86,-50 81,10 C78,-18 66,-42 44,-52 C28,-58 12,-58 3,-64 C-6,-58 -22,-58 -40,-52 C-62,-44 -78,-18 -81,10 Z"
          fill={K.hair}
          sw={sw}
        />
        <Ln d="M-50,-72 Q-24,-88 -4,-86" c={K.hairShine} w={6} />
        <Ln d="M14,-86 Q40,-84 56,-68" c={K.hairShine} w={4} op={0.8} />
      </g>
    );
    ties = (
      <g>
        {[-1, 1].map((side) => (
          <g key={side} transform={`rotate(${r1(side * 2 + sway)} ${side * 78},-28)`}>
            <ellipse
              cx={side * 80}
              cy={-32}
              rx={9}
              ry={13}
              fill={K.tie}
              stroke={OL}
              strokeWidth={sw * 0.8}
              transform={`rotate(${side * -24} ${side * 80},-32)`}
            />
          </g>
        ))}
      </g>
    );
  } else {
    back = <ellipse cx={0} cy={-14} rx={76} ry={80} fill={K.hair} stroke={OL} strokeWidth={sw} />;
    front = (
      <g transform={`translate(${r1(turn * 4)},0)`}>
        <Sh
          d="M-75,-2 C-81,-62 -44,-101 2,-101 C48,-101 81,-64 75,-2 C73,-28 66,-42 54,-50 C30,-60 -10,-62 -40,-54 C-60,-46 -71,-30 -75,-2 Z"
          fill={K.hair}
          sw={sw}
        />
        <path d="M-74,-14 L-66,-14 L-66,14 L-72,12 Z" fill={K.hair} />
        <path d="M74,-14 L66,-14 L66,14 L72,12 Z" fill={K.hair} />
        <Ln d="M-70,-30 Q-66,-12 -68,4" c={K.hairGray} w={5} op={0.9} />
        <Ln d="M70,-30 Q66,-12 68,4" c={K.hairGray} w={5} op={0.9} />
        <Ln d="M-40,-82 Q-10,-94 24,-90" c={K.hairShine} w={6} />
      </g>
    );
  }
  const eyeY = g.eyeY + fy;
  const blush = o.kind === "driver" ? 0.12 : o.kind === "kid" ? 0.42 : 0.3;
  return (
    <g>
      {back}
      {ear(-1)}
      {ear(1)}
      <path d={g.outline} transform={`translate(${r1(turn * 3)},0)`} fill={K.skin} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
      {o.kind === "driver" ? (
        <path
          d="M-62,36 C-56,64 -34,90 0,92 C34,90 56,64 62,36 C48,56 30,66 0,66 C-30,66 -48,56 -62,36 Z"
          transform={`translate(${r1(turn * 4)},0)`}
          fill={K.skinShade}
          opacity={0.45}
        />
      ) : null}
      {o.glow ? <ellipse cx={sh} cy={24} rx={58} ry={66} fill="#FFFFFF" opacity={0.2 * o.glow} /> : null}
      <ellipse cx={-g.eyeX * 1.35 + sh} cy={eyeY + 30} rx={14} ry={8} fill={K.blush} opacity={blush} />
      <ellipse cx={g.eyeX * 1.35 + sh} cy={eyeY + 30} rx={14} ry={8} fill={K.blush} opacity={blush} />
      {[-1, 1].map((side) => (
        <g key={side}>
          {eyeArt({
            cid: `${o.uid}e${side > 0 ? "r" : "l"}`,
            cx: side * g.eyeX + sh,
            cy: eyeY,
            w: g.eyeW * far(side),
            h: g.eyeH,
            side,
            open,
            lower: e.lower,
            lx: look.x,
            ly: look.y,
            iris: g.iris,
            lid,
            lash: o.kind !== "driver",
          })}
        </g>
      ))}
      {[-1, 1].map((side) => {
        const by = g.browY + fy * 0.8 + (side > 0 ? e.asym : 0);
        const inn: Pt = [side * g.browIn + sh, by + e.iy];
        const out: Pt = [side * (g.browIn + g.browLen * far(side)) + sh, by + e.oy + 4];
        const mid: Pt = [(inn[0] + out[0]) / 2, Math.min(inn[1], out[1]) - e.arch];
        return <Ln key={side} d={`M${fp(inn)} Q${fp(mid)} ${fp(out)}`} c={K.hair} w={g.browT} />;
      })}
      {o.kind === "kid" ? (
        <Ln d={`M${r1(sh * 1.3 + 2)},${r1(34 + fy)} Q${r1(sh * 1.3 + 7)},${r1(42 + fy)} ${r1(sh * 1.3 - 3)},${r1(44 + fy)}`} c={K.skinDeep} w={3.2} />
      ) : o.kind === "mom" ? (
        <Ln
          d={`M${r1(sh * 1.3 + 3)},${r1(16 + fy)} Q${r1(sh * 1.3 + 10)},${r1(36 + fy)} ${r1(sh * 1.3 + 4)},${r1(40 + fy)} Q${r1(sh * 1.3)},${r1(42 + fy)} ${r1(sh * 1.3 - 5)},${r1(39 + fy)}`}
          c={K.skinDeep}
          w={3.4}
        />
      ) : (
        <Ln
          d={`M${r1(sh * 1.3 + 3)},${r1(10 + fy)} Q${r1(sh * 1.3 + 13)},${r1(38 + fy)} ${r1(sh * 1.3 + 5)},${r1(44 + fy)} Q${r1(sh * 1.3 - 1)},${r1(46 + fy)} ${r1(sh * 1.3 - 8)},${r1(42 + fy)}`}
          c={K.skinDeep}
          w={3.8}
        />
      )}
      {mouthArt({
        x: sh * 1.1,
        y: g.mouthY + fy,
        e,
        open: o.mouth ?? 0,
        f: o.f,
        lw: Math.max(2.6, sw * 0.7),
        kid: o.kind === "kid",
      })}
      {front}
      {ties}
    </g>
  );
};

// ================================================================== МАМА ====
export type MomArm = "rest" | "onTable" | "holdPhone" | "holdPen" | "hug" | "reach" | "wave";
export type MomView = "bust" | "seated" | "standing";
export type MomProps = {
  x: number;
  y: number;
  s: number;
  view: MomView;
  f?: number;
  expr?: MomExpr;
  exprTo?: MomExpr;
  exprT?: number;
  look?: { x: number; y: number };
  mouth?: number;
  blinks?: readonly number[];
  tilt?: number;
  nod?: number;
  armL?: Pose<MomArm>;
  armR?: Pose<MomArm>;
  handL?: { dx: number; dy: number };
  handR?: { dx: number; dy: number };
  phoneLift?: number;
  phoneScreen?: boolean;
  flip?: boolean;
  opacity?: number;
};

/** Опорные размеры мамы (px при s=1, относительно точки x,y). */
export const MOM_METRICS = {
  headH: 190,
  height: 1275,
  /** bust: верх стола (линия предплечий "onTable") и центр головы относительно y. */
  bustTableY: -85,
  bustHeadY: -440,
  /** seated: сиденье стула и верх стола относительно y (пол). */
  seatY: -450,
  tableY: -635,
  /** standing: центр головы и талия относительно y (пол). */
  standingHeadY: -1180,
  standingWaistY: -836,
} as const;

// Тело мамы — координаты «от бёдер» (0,0): голова (0,−540), плечевые
// суставы (±118,−350), стол −185, пол +640 (стоя) / +450 (сидя).
const MOM_HEAD_Y = -540;
const MOM_SH: Pt = [-118, -350];
const ORIGIN: Record<MomView, number> = { standing: 640, seated: 450, bust: -100 };
const MOM_TORSO =
  "M-42,-406 C-78,-406 -110,-400 -128,-384 C-142,-370 -146,-344 -142,-318 C-138,-286 -126,-258 -116,-232 C-106,-206 -100,-184 -102,-160 C-104,-120 -114,-70 -118,-20 L-118,26 Q0,38 118,26 L118,-20 C114,-70 104,-120 102,-160 C100,-184 106,-206 116,-232 C126,-258 138,-286 142,-318 C146,-344 142,-370 128,-384 C110,-400 78,-406 42,-406 Z";

// Левый контур кардигана у плеча (для стыка плеча и рукава).
const MOM_SIDE: readonly Pt[] = [
  [-118, -392],
  [-134, -378],
  [-142, -362],
  [-145, -340],
  [-142, -318],
  [-136, -290],
  [-126, -258],
  [-116, -232],
];

// Позы ЛЕВОЙ (в кадре) руки мамы; правая — зеркально.
const momArmDef = (pose: MomArm, lift: number, f: number, view: MomView): ArmDef => {
  const sit = view !== "standing";
  switch (pose) {
    case "rest":
      return sit
        ? { e: [-160, -170], w: [-100, -40], ha: 28, hk: "relax", mir: false, front: true }
        : { e: [-162, -158], w: [-160, 22], ha: 91, hk: "relax", mir: false, front: false };
    case "onTable":
      return { e: [-178, -208], w: [-66, -204], ha: 6, hk: "flat", mir: false, front: true };
    case "holdPen":
      return { e: [-174, -210], w: [-50, -214], ha: 8, hk: "pen", mir: false, front: true, item: "pen" };
    case "holdPhone": {
      const t = easeInOut(lift);
      return {
        e: mixP([-178, -208], [-168, -226], t),
        w: mixP([-80, -212], [-62, -294], t),
        ha: lerp(-24, -78, t),
        hk: "fist",
        mir: true,
        front: true,
        item: "phone",
      };
    }
    case "hug":
      return { e: [-172, -240], w: [-46, -150], ha: 20, hk: "open", mir: false, front: true };
    case "reach":
      return { e: [-212, -250], w: [-318, -172], ha: 160, hk: "open", mir: true, front: false };
    case "wave": {
      const wv = Math.sin(f * 0.32) * 14;
      const e: Pt = [-222, -296];
      return { e, w: addP(e, polar(176, -96 + wv)), ha: -96 + wv * 1.3, hk: "open", mir: true, front: false };
    }
  }
};

const momArmDraw = (d: ArmDef, side: -1 | 1, sw: number, breath: number, nudge?: { dx: number; dy: number }, phoneScreen?: boolean): ArmDraw => {
  const w = nudge ? addP(d.w, [nudge.dx, nudge.dy]) : d.w;
  return {
    s0: [side * -MOM_SH[0], MOM_SH[1] - breath],
    e: d.e,
    w,
    wU: 54,
    wE: 48,
    wF: 42,
    sleeve: K.cardigan,
    cuff: K.cardiganRib,
    sw,
    hand: { kind: d.hk, at: w, angle: d.ha, sc: 1, mirror: d.mir, sw, item: d.item, phoneScreen },
  };
};

// Кардиган и шея (без головы и рук).
const momTorsoArt = (sw: number, breath: number) => (
  <g>
    <path d="M-23,-470 L-25,-398 Q0,-388 25,-398 L23,-470 Z" fill={K.skin} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M-23,-462 Q0,-438 23,-462 L23,-470 L-23,-470 Z" fill={K.skinShade} />
    <g transform={`translate(0,${r1(-breath)})`}>
      <Sh d={MOM_TORSO} fill={K.cardigan} sw={sw} />
      <path
        d="M142,-318 C138,-286 126,-258 116,-232 C106,-206 100,-184 102,-160 C104,-120 114,-70 118,-20 L118,26 Q104,30 92,31 C90,-40 82,-120 84,-170 C86,-220 108,-270 120,-330 Z"
        fill={K.cardiganShade}
      />
      <path d="M-117,0 Q0,12 117,0 L118,26 Q0,38 -118,26 Z" fill={K.cardiganRib} stroke={OL} strokeWidth={sw * 0.6} />
      <Sh d="M-42,-406 L-26,-406 C-20,-386 20,-386 26,-406 L42,-406 L0,-266 Z" fill={K.blouse} sw={sw} />
      <path d="M-26,-406 C-20,-386 20,-386 26,-406 L22,-404 C16,-394 -16,-394 -22,-404 Z" fill={K.blouseShade} />
      <Ln d="M0,-266 L0,30" c={OL} w={sw * 0.8} />
      {[-232, -176, -120, -64].map((yy) => (
        <circle key={yy} cx={0} cy={yy} r={6} fill={K.blouse} stroke={OL} strokeWidth={sw * 0.6} />
      ))}
    </g>
  </g>
);

// Плечо поверх корня руки, если рука перед торсом.
const momShoulderCap = (a: ArmDraw, side: -1 | 1, sw: number, breath: number, cid: string) => {
  const x0 = side < 0 ? -175 : 40;
  const yb = capBottom(a.s0, a.e, a.wU, a.wE, side, MOM_SIDE, 1, MOM_SH[1] + 4) + breath;
  return (
    <g>
      <clipPath id={cid}>
        <rect x={x0} y={-440} width={135} height={440 + yb} />
      </clipPath>
      <g clipPath={`url(#${cid})`} transform={`translate(0,${r1(-breath)})`}>
        <Sh d={MOM_TORSO} fill={K.cardigan} sw={sw} />
        <Sh d="M-42,-406 L-26,-406 C-20,-386 20,-386 26,-406 L42,-406 L0,-266 Z" fill={K.blouse} sw={sw} />
      </g>
    </g>
  );
};

const momLegs = (view: MomView, sw: number) => {
  if (view === "standing") {
    return (
      <g>
        <Sh
          d="M-114,-14 C-116,120 -96,260 -86,330 C-80,430 -78,520 -76,604 L-32,604 C-30,500 -26,380 -20,300 C-14,180 -6,80 0,46 C6,80 14,180 20,300 C26,380 30,500 32,604 L76,604 C78,520 80,430 86,330 C96,260 116,120 114,-14 Z"
          fill={K.trousers}
          sw={sw}
        />
        <path d="M114,-14 C116,120 96,260 86,330 C80,430 78,520 76,604 L58,604 C62,480 66,360 70,300 C80,200 92,80 96,-14 Z" fill={K.trousersShade} />
        <rect x={-70} y={600} width={34} height={16} fill={K.skin} />
        <rect x={36} y={600} width={34} height={16} fill={K.skin} />
        <Sh d="M-86,618 C-88,606 -40,604 -30,614 C-22,628 -34,642 -58,642 C-82,642 -94,634 -86,618 Z" fill={K.shoe} sw={sw} />
        <Sh d="M86,618 C88,606 40,604 30,614 C22,628 34,642 58,642 C82,642 94,634 86,618 Z" fill={K.shoe} sw={sw} />
      </g>
    );
  }
  if (view === "seated") {
    return (
      <g>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <Sh d={`M${sd * 100},64 L${sd * 90},400 L${sd * 38},400 L${sd * 30},70 Z`} fill={K.trousers} sw={sw} />
            <rect x={sd > 0 ? 44 : -84} y={398} width={40} height={18} fill={K.skin} />
            <Sh
              d={`M${sd * 98},420 C${sd * 104},408 ${sd * 30},404 ${sd * 24},418 C${sd * 20},434 ${sd * 34},446 ${sd * 62},446 C${sd * 90},446 ${sd * 104},436 ${sd * 98},420 Z`}
              fill={K.shoe}
              sw={sw}
            />
          </g>
        ))}
        <path d="M60,64 L90,400 L70,400 L48,70 Z" fill={K.trousersShade} />
        <Sh d="M-112,-12 C-122,30 -110,74 -72,82 C-42,88 -12,82 -4,62 L4,62 C12,82 42,88 72,82 C110,74 122,30 112,-12 Z" fill={K.trousers} sw={sw} />
        <Ln d="M0,-4 L0,60" c={OL} w={sw * 0.8} />
      </g>
    );
  }
  return null;
};

type MomInner = MomProps & {
  /** Внутреннее: свои позы рук (для объятия). */
  armDefs?: { l: ArmDef | null; r: ArmDef | null };
  /** Внутреннее: "body" — без рук перед торсом, "frontArms" — только они. */
  part?: "all" | "body" | "frontArms";
};

const MomInnerG: React.FC<MomInner> = (p) => {
  const f = useF(p.f);
  const uid = useUid();
  const s = p.s;
  const sw = lineW(s);
  const br = breathe(f, 96) * 2.4;
  const open = blinkAt(f, p.blinks ?? autoBlinks(f, 37));
  const look = p.look ?? { x: 0, y: 0 };
  const idle = Math.sin(f * 0.047) * 1.1;
  const tilt = (p.tilt ?? 0) + idle + look.x * 3;
  const nod = p.nod ?? 0;
  const lift = p.phoneLift ?? 0;
  const defL = p.armDefs ? p.armDefs.l : resolveArm(p.armL ?? "rest", -1, (q) => momArmDef(q, lift, f, p.view));
  const defR = p.armDefs ? p.armDefs.r : resolveArm(p.armR ?? "rest", 1, (q) => momArmDef(q, lift, f, p.view));
  const arms = [
    { d: defL, side: -1 as const, nudge: p.handL },
    { d: defR, side: 1 as const, nudge: p.handR },
  ];
  const usesPhone = (pose?: Pose<MomArm>) =>
    pose === "holdPhone" || (Array.isArray(pose) && (pose[0] === "holdPhone" || pose[1] === "holdPhone"));
  const glow = !p.phoneScreen && (usesPhone(p.armL) || usesPhone(p.armR)) ? clamp((lift - 0.4) / 0.6) : 0;
  const part = p.part ?? "all";
  const armArt = (front: boolean) =>
    arms.map((a) =>
      a.d && a.d.front === front ? (
        <g key={a.side}>
          <ArmG a={momArmDraw(a.d, a.side, sw, br, a.nudge, p.phoneScreen)} />
          {front
            ? momShoulderCap(momArmDraw(a.d, a.side, sw, br, a.nudge), a.side, sw, br, `${uid}c${a.side > 0 ? "r" : "l"}`)
            : null}
        </g>
      ) : null,
    );
  const head = (
    <g transform={`translate(0,${r1(MOM_HEAD_Y - br + nod * 8)}) rotate(${r1(tilt)} 0,60)`}>
      <HeadArt
        kind="mom"
        f={f}
        expr={p.expr ?? "neutral"}
        exprTo={p.exprTo}
        exprT={p.exprT}
        look={look}
        mouth={p.mouth}
        open={open}
        nod={nod}
        sw={sw}
        uid={uid}
        glow={glow}
      />
    </g>
  );
  return (
    <g
      transform={`translate(${r1(p.x)},${r1(p.y)}) scale(${p.flip ? -s : s},${s}) translate(0,${-ORIGIN[p.view]})`}
      opacity={p.opacity}
    >
      {part !== "frontArms" ? (
        <>
          {armArt(false)}
          {momLegs(p.view, sw)}
          {momTorsoArt(sw, br)}
          {head}
        </>
      ) : null}
      {part !== "body" ? armArt(true) : null}
    </g>
  );
};

export const MomG: React.FC<MomProps> = (p) => <MomInnerG {...p} />;

export const Mom: React.FC<MomProps> = (p) => (
  <Layer>
    <MomInnerG {...p} />
  </Layer>
);

// ================================================================ РЕБЁНОК ===
export type KidView = "seated" | "standing" | "walking";
export type KidProps = {
  x: number;
  y: number;
  s: number;
  view: KidView;
  f?: number;
  expr?: KidExpr;
  look?: { x: number; y: number };
  walk?: number;
  wave?: number;
  hug?: number;
  arms?: "write" | "onTable" | "rest";
  backpack?: boolean;
  blinks?: readonly number[];
  mouth?: number;
  flip?: boolean;
  opacity?: number;
};

/** Опорные размеры ребёнка (px при s=1, относительно точки x,y). */
export const KID_METRICS = {
  headH: 180,
  height: 980,
  /** Путь (px при s=1) за один цикл ходьбы walk 0→1 (два шага). */
  stride: 440,
  seatY: -450,
  tableY: -635,
  standingHeadY: -890,
  /** Высота плеч стоя (для объятия/руки взрослого). */
  standingShoulderY: -750,
} as const;

/** Фаза шага по пройденному расстоянию (px кадра) — ноги не скользят. */
export const kidWalkPhase = (distancePx: number, s: number) =>
  Math.abs(distancePx) / (KID_METRICS.stride * s);

// Левый контур блузки у плеча.
const KID_SIDE: readonly Pt[] = [
  [-60, -333],
  [-84, -326],
  [-94, -310],
  [-100, -290],
  [-98, -264],
  [-94, -236],
  [-88, -206],
];

// Тело ребёнка — «от бёдер» (0,0): голова (0,−440), плечи (±78,−300),
// лодыжки +430, пол +450.
const KID_HEAD_Y = -440;
const KID_SH: Pt = [-78, -300];
const KID_LEG = { thigh: 220, shin: 210, ankle: 430, floor: 450 };

type KidArmPose = "rest" | "onTable" | "writeL" | "pen" | "wave" | "hugNear" | "hugFar";
const kidArmDef = (pose: KidArmPose, f: number): ArmDef => {
  switch (pose) {
    case "rest":
      return { e: [-104, -172], w: [-102, -54], ha: 90, hk: "relax", mir: false, front: false };
    case "onTable":
      return { e: [-130, -204], w: [-46, -200], ha: 6, hk: "flat", mir: false, front: true };
    case "writeL":
      return { e: [-132, -204], w: [-56, -200], ha: 12, hk: "flat", mir: false, front: true };
    case "pen": {
      const wx = Math.sin(f * 0.55) * 4 + Math.sin(f * 0.21) * 3;
      const wy = Math.cos(f * 0.9) * 2;
      return { e: [-126, -206], w: [-32 + wx, -210 + wy], ha: 4, hk: "pen", mir: false, front: true, item: "pen" };
    }
    case "wave": {
      const wv = Math.sin(f * 0.36) * 16;
      const e: Pt = [-144, -318];
      return { e, w: addP(e, polar(116, -98 + wv)), ha: -98 + wv * 1.3, hk: "open", mir: true, front: false };
    }
    case "hugNear":
      return { e: [-50, -214], w: [78, -224], ha: -2, hk: "open", mir: false, front: true };
    case "hugFar":
      return { e: [118, -246], w: [186, -236], ha: 6, hk: "open", mir: false, front: false };
  }
};

const kidLegsFront = (sw: number, seated: boolean) => {
  if (seated) {
    return (
      <g>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <Sh d={`M${sd * 60},70 L${sd * 56},310 L${sd * 18},310 L${sd * 16},70 Z`} fill={K.skin} sw={sw} />
            <Sh d={`M${sd * 58},200 L${sd * 56},318 L${sd * 18},318 L${sd * 17},200 Z`} fill={K.sock} sw={sw} />
            <Sh
              d={`M${sd * 64},326 C${sd * 66},312 ${sd * 14},310 ${sd * 12},322 C${sd * 10},338 ${sd * 22},346 ${sd * 40},346 C${sd * 60},346 ${sd * 68},338 ${sd * 64},326 Z`}
              fill={K.kidShoe}
              sw={sw}
            />
          </g>
        ))}
        <Sh d="M-104,-30 C-116,20 -108,80 -68,90 C-40,96 -12,88 0,72 C12,88 40,96 68,90 C108,80 116,20 104,-30 Z" fill={K.skirt} sw={sw} />
        <path d="M104,-30 C116,20 108,80 68,90 L58,90 C82,70 90,20 86,-30 Z" fill={K.skirtShade} />
      </g>
    );
  }
  return (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <Sh d={`M${sd * 58},90 L${sd * 55},432 L${sd * 17},432 L${sd * 15},90 Z`} fill={K.skin} sw={sw} />
          <Sh d={`M${sd * 57},282 L${sd * 55},434 L${sd * 17},434 L${sd * 16},282 Z`} fill={K.sock} sw={sw} />
          <Ln d={`M${sd * 56},296 L${sd * 16},296`} c={K.shirtShade} w={4} />
          <Sh
            d={`M${sd * 64},436 C${sd * 66},422 ${sd * 14},420 ${sd * 11},432 C${sd * 8},446 ${sd * 22},452 ${sd * 40},452 C${sd * 60},452 ${sd * 68},446 ${sd * 64},436 Z`}
            fill={K.kidShoe}
            sw={sw}
          />
        </g>
      ))}
    </g>
  );
};

// Фаза ноги: положение лодыжки относительно бедра, подъём и угол стопы.
const legPhase = (q: number, stride: number) => {
  const st = 0.6;
  const half = stride * 0.3;
  const qq = ((q % 1) + 1) % 1;
  if (qq < st) {
    const u = qq / st;
    const fa = u < 0.15 ? -10 * (1 - u / 0.15) : u > 0.75 ? 22 * ((u - 0.75) / 0.25) : 0;
    return { x: lerp(half, -half, u), lift: 0, foot: fa, stance: true };
  }
  const u = (qq - st) / (1 - st);
  return { x: lerp(-half, half, easeInOut(u)), lift: Math.sin(Math.PI * u) * 44, foot: lerp(22, -10, u), stance: false };
};

const kidShoeSide = (at: Pt, ang: number, sw: number) => (
  <g transform={`translate(${fp(at)}) rotate(${r1(ang)})`}>
    <Sh d="M-20,-10 C-20,-18 18,-20 34,-10 C46,-4 46,12 32,14 L-18,14 C-26,14 -26,0 -20,-10 Z" fill={K.kidShoe} sw={sw} />
  </g>
);

// Торс ребёнка (блузка, жилет, воротник, шея). vShift — сдвиг выреза при повороте.
const kidTorsoArt = (sw: number, vShift: number) => (
  <g>
    <path d="M-17,-372 L-18,-322 Q0,-316 18,-322 L17,-372 Z" fill={K.skin} stroke={OL} strokeWidth={sw} />
    <path d="M-17,-366 Q0,-348 17,-366 L17,-372 L-17,-372 Z" fill={K.skinShade} />
    <Sh
      d="M-34,-334 C-62,-334 -84,-328 -94,-310 C-102,-292 -100,-264 -94,-236 C-88,-206 -86,-176 -86,-148 L86,-148 C86,-176 88,-206 94,-236 C100,-264 102,-292 94,-310 C84,-328 62,-334 34,-334 Z"
      fill={K.shirt}
      sw={sw}
    />
    <Sh
      d={`M${r1(-26 + vShift)},-334 L-62,-330 C-70,-316 -74,-298 -80,-280 C-86,-262 -90,-240 -90,-214 L-90,-140 Q0,-128 90,-140 L90,-214 C90,-240 86,-262 80,-280 C74,-298 70,-316 62,-330 L${r1(26 + vShift)},-334 L${r1(vShift)},-244 Z`}
      fill={K.vest}
      sw={sw}
    />
    <path d="M90,-214 C90,-240 86,-262 80,-280 L66,-250 C70,-220 70,-180 68,-138 L90,-140 Z" fill={K.vestShade} />
    {[-214, -184, -154].map((yy) => (
      <circle key={yy} cx={r1(vShift * 0.5)} cy={yy} r={4.5} fill="#C9D4EA" />
    ))}
    <Sh
      d={`M${r1(-1 + vShift)},-338 C${r1(-8 + vShift)},-322 ${r1(-20 + vShift)},-312 ${r1(-32 + vShift)},-314 C${r1(-36 + vShift)},-322 ${r1(-34 + vShift)},-332 ${r1(-28 + vShift)},-340 Z`}
      fill={K.shirt}
      sw={sw * 0.8}
    />
    <Sh
      d={`M${r1(1 + vShift)},-338 C${r1(8 + vShift)},-322 ${r1(20 + vShift)},-312 ${r1(32 + vShift)},-314 C${r1(36 + vShift)},-322 ${r1(34 + vShift)},-332 ${r1(28 + vShift)},-340 Z`}
      fill={K.shirt}
      sw={sw * 0.8}
    />
  </g>
);

const KidInnerG: React.FC<KidProps> = (p) => {
  const f = useF(p.f);
  const uid = useUid();
  const s = p.s;
  const sw = lineW(s);
  const open = blinkAt(f, p.blinks ?? autoBlinks(f, 11, 89));
  const expr = p.expr ?? "calm";
  const wave = clamp(p.wave ?? 0);
  const hug = clamp(p.hug ?? 0);
  const view = p.view;
  const walking = view === "walking";
  const ph = p.walk ?? 0;
  const look0 = p.look ?? (expr === "focused" ? { x: 0.1, y: 0.75 } : { x: 0, y: 0 });
  const turn = walking ? 0.55 : clamp(look0.x * 0.45 + hug * 0.5, -1, 1);
  const look = walking ? { x: 0.7, y: look0.y } : { x: clamp(look0.x + hug * 0.6, -1, 1), y: look0.y };
  const br = breathe(f, 80) * 2;
  const sx = walking ? 0.9 : 1;
  const vShift = turn * 14;

  // --- ноги при ходьбе ---
  let hipLift = 0;
  let legs: React.ReactNode = null;
  let swingA = 0;
  if (walking) {
    const L = KID_LEG;
    const A = legPhase(ph, KID_METRICS.stride);
    const B = legPhase(ph + 0.5, KID_METRICS.stride);
    const reach = (lp: { x: number }) => Math.sqrt(Math.max(1, (L.thigh + L.shin) ** 2 * 0.985 - lp.x * lp.x));
    const hipH = Math.min(A.stance ? reach(A) : 1e9, B.stance ? reach(B) : 1e9);
    hipLift = L.ankle - hipH;
    const draw = (lp: ReturnType<typeof legPhase>, hx: number, back: boolean, key: string) => {
      const hip: Pt = [hx, 0];
      const ankle: Pt = [hx + lp.x, L.ankle - hipLift - lp.lift];
      const knee = ik(hip, ankle, L.thigh, L.shin, 1);
      const sockA = mixP(knee, ankle, 0.3);
      return (
        <g key={key}>
          <path d={limbPath(hip, knee, ankle, 44, 38, 32)} fill={back ? K.skinShade : K.skin} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
          <path d={limbPath(sockA, mixP(sockA, ankle, 0.5), ankle, 38, 36, 34)} fill={back ? K.shirtShade : K.sock} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
          {kidShoeSide(addP(ankle, [0, 8]), lp.foot, sw)}
        </g>
      );
    };
    swingA = Math.sin(2 * Math.PI * ph);
    legs = (
      <g>
        {draw(B, 16, true, "b")}
        {draw(A, -12, false, "a")}
      </g>
    );
  }

  // --- руки ---
  const shL: Pt = [KID_SH[0] * sx, KID_SH[1] - br];
  const shR: Pt = [-KID_SH[0] * sx, KID_SH[1] - br];
  const armOf = (d: ArmDef, s0: Pt, back: boolean): ArmDraw => ({
    s0,
    e: d.e,
    w: d.w,
    wU: 40,
    wE: 35,
    wF: 30,
    sleeve: back ? K.shirtShade : K.shirt,
    cuff: back ? K.shirtShade : K.shirt,
    sw,
    hand: { kind: d.hk, at: d.w, angle: d.ha, sc: 0.62, mirror: d.mir, sw, item: d.item, skin: back ? K.skinShade : K.skin },
  });
  const sideDef = (sd: -1 | 1, pose: KidArmPose) => (sd < 0 ? kidArmDef(pose, f) : mirrorDef(kidArmDef(pose, f)));
  let defL: ArmDef;
  let defR: ArmDef;
  if (walking) {
    const swing = (sg: number, s0: Pt): ArmDef => {
      const th = 16 * sg * swingA;
      const e = addP(s0, polar(132, 90 - th));
      const w = addP(e, polar(116, 90 - th - 10 - Math.max(0, th) * 0.5));
      return { e, w, ha: 90 - th - 16, hk: "relax", mir: false, front: sg > 0 };
    };
    defL = blendDef(swing(1, shL), kidArmDef("hugNear", f), hug);
    defR = blendDef(swing(-1, shR), kidArmDef("hugFar", f), hug);
  } else {
    const seated = view === "seated";
    const arms = p.arms ?? (seated ? "write" : "rest");
    const baseL = sideDef(-1, arms === "write" ? "writeL" : arms === "onTable" ? "onTable" : "rest");
    const baseR = sideDef(1, arms === "write" ? "pen" : arms === "onTable" ? "onTable" : "rest");
    defL = blendDef(baseL, kidArmDef("hugNear", f), hug);
    defR = blendDef(blendDef(baseR, kidArmDef("hugFar", f), hug), sideDef(1, "wave"), wave);
  }
  const arms = [
    { d: defL, s0: shL, back: false },
    { d: defR, s0: shR, back: walking || hug > 0.5 },
  ];
  const armArt = (front: boolean) =>
    arms.map((a, i) => (a.d.front === front ? <ArmG key={i} a={armOf(a.d, a.s0, a.back && !front)} /> : null));
  const capArt = (front: boolean) =>
    arms.map((a, i) =>
      a.d.front === front && front ? (
        <g key={`c${i}`}>
          <clipPath id={`${uid}k${i}`}>
            <rect
              x={i === 0 ? -130 : 30}
              y={-380}
              width={100}
              height={380 + capBottom(a.s0, a.d.e, 40, 35, i === 0 ? -1 : 1, KID_SIDE, sx, KID_SH[1] + 4) + br}
            />
          </clipPath>
          <g clipPath={`url(#${uid}k${i})`} transform={`translate(0,${r1(-br)}) scale(${sx},1)`}>
            {kidTorsoArt(sw, vShift)}
          </g>
        </g>
      ) : null,
    );

  const head = (
    <g
      transform={`translate(0,${r1(KID_HEAD_Y - br)}) rotate(${r1(Math.sin(f * 0.05) * 1.2 + (walking ? Math.sin(4 * Math.PI * ph) * 1.2 : 0) - hug * 6)} 0,60)`}
    >
      <HeadArt
        kind="kid"
        f={f}
        expr={expr}
        look={look}
        turn={turn}
        open={open}
        mouth={p.mouth}
        sw={sw}
        uid={uid}
        sway={walking ? Math.sin(4 * Math.PI * ph + 0.8) * 7 : Math.sin(f * 0.06) * 2}
      />
    </g>
  );
  const hemSw = walking ? swingA * 7 : 0;
  const skirt =
    view === "seated" ? null : (
      <g transform={`translate(0,${r1(-br * 0.3)})`}>
        <Sh d={`M-88,-152 L88,-152 L${r1(110 + hemSw)},148 Q0,164 ${r1(-110 + hemSw)},148 Z`} fill={K.skirt} sw={sw} />
        <path d={`M88,-152 L${r1(110 + hemSw)},148 Q92,152 72,156 L62,-152 Z`} fill={K.skirtShade} />
        {[-50, -17, 17, 50].map((xx) => (
          <Ln key={xx} d={`M${r1(xx * 0.8)},-140 L${r1(xx * 1.2 + hemSw * 0.6)},154`} c={K.skirtShade} w={3} />
        ))}
        <Ln d="M-88,-140 L88,-140" c={K.skirtShade} w={4} />
      </g>
    );
  const bp = p.backpack ?? false;
  const bob = walking ? Math.sin(4 * Math.PI * ph) * 2 : 0;
  const backpackBack = !bp ? null : walking ? (
    <g transform={`translate(0,${r1(-br + bob)})`}>
      <Sh d="M-142,-318 Q-142,-338 -122,-338 L-62,-338 Q-46,-338 -46,-320 L-46,-140 Q-46,-122 -64,-122 L-126,-122 Q-148,-122 -148,-142 Z" fill={K.bag} sw={sw} />
      <Sh d="M-142,-318 Q-142,-338 -122,-338 L-62,-338 Q-46,-338 -46,-320 L-46,-262 Q-96,-246 -144,-262 Z" fill={K.bagShade} sw={sw * 0.8} />
      <Ln d="M-142,-254 Q-96,-240 -48,-254" c={C.yellow} w={9} />
      <rect x={-136} y={-206} width={60} height={52} rx={12} fill={K.bagShade} stroke={OL} strokeWidth={sw * 0.7} />
      <rect x={-122} y={-196} width={30} height={8} rx={4} fill={C.yellow} />
    </g>
  ) : (
    <g transform={`translate(0,${r1(-br)})`}>
      <Ln d="M-26,-352 Q0,-386 26,-352" c={OL} w={10 + 2 * sw} />
      <Ln d="M-26,-352 Q0,-386 26,-352" c={K.strap} w={10} />
      <Sh d="M-108,-332 Q-108,-352 -88,-352 L88,-352 Q108,-352 108,-332 L112,-150 Q112,-130 92,-130 L-92,-130 Q-112,-130 -112,-150 Z" fill={K.bag} sw={sw} />
      <Ln d="M-108,-300 L-110,-170" c={C.yellow} w={6} />
      <Ln d="M108,-300 L110,-170" c={C.yellow} w={6} />
    </g>
  );
  const straps = !bp ? null : walking ? (
    <g transform={`translate(0,${r1(-br)}) scale(${sx},1)`}>
      <Ln d="M-58,-332 Q-44,-262 -54,-172" c={OL} w={16 + 2 * sw} />
      <Ln d="M-58,-332 Q-44,-262 -54,-172" c={K.strap} w={16} />
      <rect x={-59} y={-262} width={14} height={10} rx={3} fill={C.yellow} />
    </g>
  ) : (
    <g transform={`translate(0,${r1(-br)})`}>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <Ln d={`M${sd * 50},-334 Q${sd * 60},-262 ${sd * 64},-172`} c={OL} w={16 + 2 * sw} />
          <Ln d={`M${sd * 50},-334 Q${sd * 60},-262 ${sd * 64},-172`} c={K.strap} w={16} />
          <rect x={sd * 59 - 7} y={-262} width={14} height={10} rx={3} fill={C.yellow} />
        </g>
      ))}
    </g>
  );

  const oy = view === "seated" ? 450 : KID_LEG.floor;
  return (
    <g transform={`translate(${r1(p.x)},${r1(p.y)}) scale(${p.flip ? -s : s},${s}) translate(0,${-oy})`} opacity={p.opacity}>
      <g transform={`translate(0,${r1(hipLift)})`}>
        {backpackBack}
        {armArt(false)}
        {walking ? legs : kidLegsFront(sw, view === "seated")}
        {skirt}
        <g transform={`translate(0,${r1(-br)}) scale(${sx},1)`}>{kidTorsoArt(sw, vShift)}</g>
        {straps}
        {head}
        {armArt(true)}
        {capArt(true)}
      </g>
    </g>
  );
};

export const KidG: React.FC<KidProps> = (p) => <KidInnerG {...p} />;

export const Kid: React.FC<KidProps> = (p) => (
  <Layer>
    <KidInnerG {...p} />
  </Layer>
);

// ============================================================= ОБЪЯТИЕ =====
export type MomKidHugProps = {
  x: number;
  y: number;
  s: number;
  t: number;
  f?: number;
  opacity?: number;
  flip?: boolean;
};

export const MomKidHugG: React.FC<MomKidHugProps> = (p) => {
  const f = useF(p.f);
  const s = p.s;
  const t = clamp(p.t);
  const k = easeInOut(t);
  const restL = momArmDef("rest", 0, f, "standing");
  const restR = mirrorDef(restL);
  // Руки мамы в объятии (координаты тела мамы; ребёнок справа, лицом влево).
  const hugL: ArmDef = { e: [-118, -196], w: [-12, -138], ha: 14, hk: "open", mir: false, front: true };
  const hugR: ArmDef = { e: [196, -232], w: [156, -112], ha: 116, hk: "open", mir: true, front: true };
  const defs = { l: blendDef(restL, hugL, t), r: blendDef(restR, hugR, t) };
  const momP: MomInner = {
    x: 0,
    y: 0,
    s: 1,
    view: "standing",
    f,
    expr: "relief",
    exprTo: "smile",
    exprT: k,
    look: { x: lerp(0.5, 0.6, k), y: lerp(0.4, 0.9, k) },
    tilt: lerp(2, 9, k),
    nod: k * 0.5,
    armDefs: defs,
  };
  const kidX = lerp(230, 70, k);
  return (
    <g transform={`translate(${r1(p.x)},${r1(p.y)}) scale(${p.flip ? -s : s},${s})`} opacity={p.opacity}>
      <MomInnerG {...momP} part="body" />
      <KidInnerG x={kidX} y={0} s={1} view="standing" f={f} expr="happy" hug={k} flip look={{ x: 0.3, y: 0.2 }} blinks={k > 0.7 ? [f] : undefined} />
      <MomInnerG {...momP} part="frontArms" />
    </g>
  );
};

export const MomKidHug: React.FC<MomKidHugProps> = (p) => (
  <Layer>
    <MomKidHugG {...p} />
  </Layer>
);

// ============================================================ РУКА МАМЫ ====
export type MomHandProps = {
  x: number;
  y: number;
  s: number;
  angle: number;
  kind: HandKind;
  mirror?: boolean;
  sleeve?: number;
  layer?: "all" | "base" | "front";
  flip?: boolean;
  f?: number;
  opacity?: number;
  pen?: boolean;
};

/** Кончик указательного пальца / ручки MomHand (px кадра). */
export const momHandTip = (p: MomHandProps): Pt => {
  const g = handGeom(p.kind);
  const t: Pt = [(g.tip[0] - 4) * (p.flip ? -1 : 1), g.tip[1] * (p.mirror ? -1 : 1)];
  const r = polar(1, p.angle);
  return [p.x + p.s * (t[0] * r[0] - t[1] * r[1]), p.y + p.s * (t[0] * r[1] + t[1] * r[0])];
};

export const MomHandG: React.FC<MomHandProps> = (p) => {
  const f = useF(p.f);
  const s = p.s;
  const sw = lineW(s);
  const layer = p.layer ?? "all";
  const sl = p.sleeve ?? 160;
  const tremble = Math.sin(f * 0.9) * 0.15;
  const h = handLayers({
    kind: p.kind,
    at: [0, 0],
    angle: tremble,
    sc: 1,
    mirror: p.mirror ?? false,
    sw,
    item: p.kind === "pen" && p.pen !== false ? "pen" : null,
    detail: s > 1.2,
  });
  const sleeve =
    sl > 0 ? (
      <g>
        <path d={`M${-sl},-27 L-4,-25 L-4,25 L${-sl},27 Z`} fill={K.cardigan} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
        <path d={`M${-sl},12 L-22,12 L-22,25 L${-sl},27 Z`} fill={K.cardiganShade} />
        <path d="M-26,-28 L-2,-27 L-2,27 L-26,28 Z" fill={K.cardiganRib} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
        {[-20, -14, -8].map((xx) => (
          <Ln key={xx} d={line([[xx, -24], [xx, 24]])} c={K.cardiganShade} w={1.4} />
        ))}
      </g>
    ) : null;
  return (
    <g transform={`translate(${r1(p.x)},${r1(p.y)}) rotate(${r1(p.angle)}) scale(${p.flip ? -s : s},${s})`} opacity={p.opacity}>
      {layer !== "front" ? (
        <>
          <g transform="translate(-4,0)">{h.base}</g>
          {sleeve}
          <g transform="translate(-4,0)">{h.item}</g>
        </>
      ) : null}
      {layer !== "base" ? <g transform="translate(-4,0)">{h.front}</g> : null}
    </g>
  );
};

export const MomHand: React.FC<MomHandProps> = (p) => (
  <Layer>
    <MomHandG {...p} />
  </Layer>
);

// ====================================================== РУКА С ТЕЛЕФОНОМ ===
export type PhoneRect = { x: number; y: number; w: number; h: number };
export type MomPhoneHandProps = {
  phone: PhoneRect;
  layer: "back" | "front";
  thumb?: number;
  shoulder?: boolean;
  f?: number;
  opacity?: number;
};

/** Кончик большого пальца (px кадра) при прокрутке thumb 0…1. */
export const momPhoneThumbTip = (ph: PhoneRect, thumb = 0): Pt => [
  ph.x + ph.w * lerp(0.6, 0.56, thumb),
  ph.y + ph.h * lerp(0.75, 0.68, thumb),
];

export const MomPhoneHandG: React.FC<MomPhoneHandProps> = (p) => {
  const { x, y, w, h } = p.phone;
  const P = (u: number, v: number): Pt => [x + w * u, y + h * v];
  const sw = 4;
  const th = clamp(p.thumb ?? 0);
  const tip = momPhoneThumbTip(p.phone, th);
  const fingerV = [0.6, 0.69, 0.78, 0.865];
  const fw = (i: number) => w * (i === 3 ? 0.105 : 0.125);
  if (p.layer === "back") {
    const palm = `M${fp(P(0.02, 0.88))} C${fp(P(0.04, 1.0))} ${fp(P(0.2, 1.08))} ${fp(P(0.44, 1.1))} L${fp(P(0.62, 1.32))} L${fp(P(1.3, 1.32))} C${fp(P(1.24, 1.1))} ${fp(P(1.16, 0.96))} ${fp(P(1.04, 0.84))} L${fp(P(0.9, 0.84))} Z`;
    return (
      <g opacity={p.opacity}>
        {p.shoulder ? (
          <g opacity={0.9}>
            <path d={`M${fp(P(-0.75, 1.5))} C${fp(P(-0.62, 1.08))} ${fp(P(-0.34, 0.98))} ${fp(P(-0.12, 1.1))} L${fp(P(0.1, 1.5))} Z`} fill={K.cardiganShade} />
            <ellipse cx={P(-0.48, 0.98)[0]} cy={P(-0.48, 0.98)[1]} rx={w * 0.2} ry={w * 0.19} fill={K.hair} />
          </g>
        ) : null}
        {fingerV.map((v, i) => (
          <Ln key={`o${i}`} d={line([P(0.06, v + 0.012), P(-0.07, v)])} c={OL} w={fw(i) + 2 * sw} />
        ))}
        {fingerV.map((v, i) => (
          <Ln key={`f${i}`} d={line([P(0.06, v + 0.012), P(-0.07, v)])} c={K.skin} w={fw(i)} />
        ))}
        {fingerV.slice(0, 3).map((v, i) => (
          <Ln key={`s${i}`} d={line([P(-0.02, v + 0.045), P(-0.09, v + 0.044)])} c={K.skinDeep} w={2} op={0.7} />
        ))}
        <path d={palm} fill={K.skinShade} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
        <path
          d={`M${fp(P(0.52, 1.3))} C${fp(P(0.7, 1.16))} ${fp(P(1.1, 1.14))} ${fp(P(1.36, 1.22))} L${fp(P(1.42, 1.6))} L${fp(P(0.46, 1.6))} Z`}
          fill={K.cardigan}
          stroke={OL}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <path
          d={`M${fp(P(0.52, 1.3))} C${fp(P(0.7, 1.16))} ${fp(P(1.1, 1.14))} ${fp(P(1.36, 1.22))} L${fp(P(1.37, 1.27))} C${fp(P(1.1, 1.2))} ${fp(P(0.72, 1.22))} ${fp(P(0.52, 1.36))} Z`}
          fill={K.cardiganRib}
        />
      </g>
    );
  }
  const mid = P(0.84, lerp(0.86, 0.82, th));
  const thenar = `M${fp(P(0.98, 0.76))} C${fp(P(1.1, 0.8))} ${fp(P(1.14, 0.94))} ${fp(P(1.1, 1.08))} C${fp(P(1.04, 1.18))} ${fp(P(0.86, 1.16))} ${fp(P(0.78, 1.06))} C${fp(P(0.82, 0.96))} ${fp(P(0.9, 0.86))} ${fp(P(0.98, 0.76))} Z`;
  return (
    <g opacity={p.opacity}>
      {fingerV.slice(0, 3).map((v, i) => (
        <g key={i}>
          <Ln d={line([P(-0.01, v), P(0.035, v - 0.004)])} c={OL} w={fw(i) + 2 * sw} />
          <Ln d={line([P(-0.01, v), P(0.035, v - 0.004)])} c={K.skin} w={fw(i)} />
          <ellipse cx={P(0.035, v)[0]} cy={P(0.035, v - 0.004)[1]} rx={w * 0.03} ry={fw(i) * 0.28} fill={K.nail} />
        </g>
      ))}
      <path d={thenar} fill={OL} stroke={OL} strokeWidth={2 * sw} strokeLinejoin="round" />
      <Ln d={line([P(0.95, 0.94), mid, tip])} c={OL} w={w * 0.17 + 2 * sw} />
      <path d={thenar} fill={K.skin} />
      <Ln d={line([P(0.95, 0.94), mid, tip])} c={K.skin} w={w * 0.17} />
      <Ln d={line([P(1.02, 1.04), P(0.9, 0.98)])} c={K.skinShade} w={w * 0.06} op={0.9} />
      <ellipse
        cx={tip[0] + w * 0.012}
        cy={tip[1] + w * 0.01}
        rx={w * 0.048}
        ry={w * 0.038}
        transform={`rotate(${r1(angOf(mid, tip))} ${r1(tip[0] + w * 0.012)},${r1(tip[1] + w * 0.01)})`}
        fill={K.nail}
      />
    </g>
  );
};

export const MomPhoneHand: React.FC<MomPhoneHandProps> = (p) => (
  <Layer>
    <MomPhoneHandG {...p} />
  </Layer>
);

// ============================================================== ЛИСТЫ =====
const Label: React.FC<{ x: number; y: number; t: string; size?: number }> = ({ x, y, t, size }) => (
  <text x={x} y={y} fontFamily={fontFamily} fontSize={size ?? 22} fontWeight={700} fill={C.muted} textAnchor="middle">
    {t}
  </text>
);

const MOM_EXPRS: MomExpr[] = ["neutral", "doubt", "hopeful", "relief", "smile"];
const MOM_EXPR_RU: Record<MomExpr, string> = {
  neutral: "нейтрально",
  doubt: "сомнение",
  hopeful: "надежда",
  relief: "облегчение",
  smile: "улыбка",
};
const cyc = (f: number) => 0.5 - 0.5 * Math.cos(((f % 90) / 90) * Math.PI * 2);

export const PeopleSheet: React.FC = () => {
  const f = useCurrentFrame();
  const tt = cyc(f);
  const lin = (f % 90) / 90;
  const table = (x: number, y: number, w: number) => (
    <rect x={x} y={y} width={w} height={34} rx={8} fill={C.table} stroke={C.tableEdge} strokeWidth={3} />
  );
  return (
    <Layer>
      <rect x={0} y={0} width={1080} height={1920} fill={C.paper} />
      {MOM_EXPRS.map((e, i) => (
        <g key={e}>
          <MomG x={108 + i * 216} y={400} s={0.42} view="bust" f={f} expr={e} armL="onTable" armR="onTable" />
          <Label x={108 + i * 216} y={448} t={MOM_EXPR_RU[e]} />
        </g>
      ))}
      {table(0, 400 - 85 * 0.42, 1080)}
      {(["rest", "wave", "reach", "hug"] as MomArm[]).map((a, i) => (
        <g key={a}>
          <MomG
            x={140 + i * 250}
            y={980}
            s={0.36}
            view="standing"
            f={f}
            expr="smile"
            armR={a}
            armL={a === "wave" || a === "reach" ? "rest" : a}
            look={{ x: 0.3, y: 0 }}
          />
          <Label x={140 + i * 250} y={1010} t={`стоя: ${a}`} />
        </g>
      ))}
      <MomG
        x={180}
        y={1420}
        s={0.36}
        view="seated"
        f={f}
        expr="doubt"
        exprTo="hopeful"
        exprT={tt}
        armL="onTable"
        armR={["holdPen", "holdPhone", tt]}
        phoneLift={tt}
        look={{ x: 0, y: 0.6 - tt }}
        mouth={Math.max(0, Math.sin(f * 0.5)) * 0.7}
      />
      {table(20, 1420 - 0.36 * 635, 340)}
      <Label x={180} y={1450} t="сидя: ручка → телефон" />
      <KidG x={520} y={1420} s={0.36} view="seated" f={f} expr="focused" />
      {table(380, 1420 - 0.36 * 635, 280)}
      <Label x={520} y={1450} t="ребёнок: уроки" />
      <MomKidHugG x={790} y={1420} s={0.3} t={tt} f={f} />
      <Label x={840} y={1450} t="объятие (t)" />
      <KidG x={130} y={1850} s={0.36} view="standing" f={f} expr="calm" backpack />
      <Label x={130} y={1882} t="стоит, рюкзак" />
      <KidG x={320} y={1850} s={0.36} view="standing" f={f} expr="happy" wave={tt} />
      <Label x={320} y={1882} t="машет" />
      <KidG x={520 + lin * 160} y={1850} s={0.36} view="walking" f={f} expr="happy" walk={kidWalkPhase(lin * 160, 0.36)} backpack />
      <Label x={600} y={1882} t="идёт (шаг по пути)" />
      <KidG x={920} y={1850} s={0.36} view="standing" f={f} expr="happy" hug={tt} />
      <Label x={920} y={1882} t="hug" />
    </Layer>
  );
};

export const MomCloseSheet: React.FC = () => {
  const f = useCurrentFrame();
  const tt = cyc(f);
  return (
    <Layer>
      <rect x={0} y={0} width={1080} height={1920} fill={C.wall} />
      <MomG
        x={290}
        y={900}
        s={1.0}
        view="bust"
        f={f}
        expr="doubt"
        exprTo="hopeful"
        exprT={tt}
        armL="onTable"
        armR="holdPen"
        look={{ x: 0.2, y: 0.5 - tt }}
        mouth={Math.max(0, Math.sin(f * 0.45)) * 0.8}
      />
      <rect x={0} y={900 - 85} width={580} height={150} fill={C.table} />
      <MomG x={810} y={900} s={0.95} view="bust" f={f} expr="relief" armL="onTable" armR={["onTable", "holdPhone", tt]} phoneLift={tt} look={{ x: -0.2, y: 0.5 }} nod={0.3} />
      <rect x={560} y={900 - 85 * 0.95} width={520} height={150} fill={C.table} />
      <Label x={290} y={1100} t="сомнение → надежда, губы" size={26} />
      <Label x={810} y={1100} t="телефон к лицу (phoneLift)" size={26} />
      <MomG x={290} y={1880} s={0.8} view="bust" f={f} expr="smile" armL="hug" armR="wave" look={{ x: 0.5, y: 0 }} />
      <MomG x={800} y={1880} s={0.8} view="bust" f={f} expr="neutral" armL="reach" armR="holdPhone" phoneLift={1} phoneScreen look={{ x: -0.6, y: 0.2 }} tilt={-5} />
    </Layer>
  );
};

export const KidCloseSheet: React.FC = () => {
  const f = useCurrentFrame();
  const lin = (f % 90) / 90;
  return (
    <Layer>
      <rect x={0} y={0} width={1080} height={1920} fill={C.paper} />
      <KidG x={270} y={980} s={0.85} view="standing" f={f} expr="calm" backpack />
      <KidG x={700 + lin * 120} y={980} s={0.85} view="walking" f={f} expr="happy" walk={kidWalkPhase(lin * 120, 0.85)} backpack />
      <KidG x={270} y={1900} s={0.85} view="seated" f={f} expr="focused" />
      <rect x={0} y={1900 - 635 * 0.85} width={540} height={60} fill={C.table} />
      <KidG x={800} y={1880} s={0.85} view="standing" f={f} expr="happy" wave={1} />
    </Layer>
  );
};

export const HandsSheet: React.FC = () => {
  const f = useCurrentFrame();
  const kinds: HandKind[] = ["open", "flat", "relax", "fist", "pen", "point"];
  const ph: PhoneRect = { x: 560, y: 1000, w: 300, h: 610 };
  const th = cyc(f);
  return (
    <Layer>
      <rect x={0} y={0} width={1080} height={1920} fill={C.paper} />
      {kinds.map((k, i) => {
        const hp: MomHandProps = { x: 140 + (i % 3) * 330, y: 280 + Math.floor(i / 3) * 360, s: 2.1, angle: -20, kind: k, sleeve: 70, f };
        const tip = momHandTip(hp);
        return (
          <g key={k}>
            <MomHandG {...hp} />
            <circle cx={tip[0]} cy={tip[1]} r={6} fill={C.red} />
            <Label x={200 + (i % 3) * 330} y={440 + Math.floor(i / 3) * 360} t={k} size={26} />
          </g>
        );
      })}
      <MomPhoneHandG phone={ph} layer="back" thumb={th} f={f} shoulder />
      <rect x={ph.x} y={ph.y} width={ph.w} height={ph.h} rx={36} fill={K.phone} stroke={OL} strokeWidth={4} />
      <rect x={ph.x + 14} y={ph.y + 14} width={ph.w - 28} height={ph.h - 28} rx={26} fill={K.screen} />
      <MomPhoneHandG phone={ph} layer="front" thumb={th} f={f} />
      <circle cx={momPhoneThumbTip(ph, th)[0]} cy={momPhoneThumbTip(ph, th)[1]} r={6} fill={C.red} />
      <Label x={710} y={970} t="рука с телефоном (S2)" size={26} />
      <MomHandG x={150} y={1500} s={2.4} angle={-35} kind="fist" sleeve={120} f={f} layer="base" />
      <rect x={210} y={1300} width={230} height={150} rx={18} fill="#B8875A" stroke={OL} strokeWidth={4} transform="rotate(-35 300 1400)" />
      <MomHandG x={150} y={1500} s={2.4} angle={-35} kind="fist" sleeve={120} f={f} layer="front" />
      <Label x={300} y={1640} t="base / предмет / front" size={26} />
    </Layer>
  );
};
