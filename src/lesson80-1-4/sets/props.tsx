// Предметы ролика 80-1-4 «Один Создатель»: росток фасоли в горшке на поддоне,
// детская лейка и струя воды, учебные карточки (подставка и стопка), закрытый
// Коран на подставке на тумбе и солнечное пятно на столе.
//
// Единицы — как у предметов 80-1-2: 5 ед. ≈ 1 см при масштабе 1; на столе всё
// масштабируется вместе со столом (s ≈ 0.92). Вверх — отрицательный y. Свет —
// из окна справа сверху: блики справа сверху, мягкая тень слева снизу (Коран на
// тумбе стоит правее окна — у него свет слева, см. lightFrom). Без свечения,
// искр, лиц и надписей. Всё детерминировано (псевдослучайность — только hash01).
//
// Точка (x, y) у каждого предмета (все — «опора на поверхности»):
//   SproutPot     — центр следа поддона на столе (передний край поддона на POT.frontY·s ниже y)
//   WateringCan   — самая нижняя передняя точка дна при tilt = 0 (центр следа дна — y + CAN.footY·s)
//   WaterStream   — без своей точки: tip / dir / land уже в координатах родителя
//   Card          — середина нижнего края карточки (ось поворота rot)
//   CardRail      — середина нижнего переднего ребра подставки
//   CardStack     — середина нижнего переднего ребра стопки
//   QuranOnStand  — середина основания подставки на верхней доске тумбы
//   SunPatch      — центр пятна на поверхности стола
import React from "react";
import { hash01 } from "../../lesson01/rig/geom";
import { OUTLINE } from "../../lesson01/rig/looks";

type P = { x: number; y: number };
type Seg = [P, P, P, P];

const f = (n: number) => n.toFixed(2);
const OL = 1.6; // контур мелких предметов
const SHADOW = "#3b2418";
const K = 0.32; // сжатие круга в эллипс (взгляд чуть сверху) = сжатие глубины
const DEP = 0.55; // скос глубины вправо, как у столешницы (topD·0.55 вправо, −topD вверх)
const TAU = Math.PI * 2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const rad = (d: number) => (d * Math.PI) / 180;
const frac = (v: number) => v - Math.floor(v);
const rotP = (p: P, deg: number, c: P = { x: 0, y: 0 }): P => {
  const a = rad(deg);
  const cs = Math.cos(a);
  const sn = Math.sin(a);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * cs - dy * sn, y: c.y + dx * sn + dy * cs };
};
const pt = (p: P) => `${f(p.x)} ${f(p.y)}`;
const poly = (pts: P[], close = true) => `M ${pts.map(pt).join(" L ")}${close ? " Z" : ""}`;
const hexRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hexRgb(a);
  const B = hexRgb(b);
  const k = clamp01(t);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
};
// Уникальный id для clipPath/фильтров внутри одного SVG.
const useUid = (prefix: string) => `${prefix}${React.useId().replace(/[^A-Za-z0-9_-]/g, "")}`;

const bez = (s: Seg, u: number): P => {
  const a = (1 - u) ** 3;
  const b = 3 * u * (1 - u) ** 2;
  const c = 3 * u * u * (1 - u);
  const d = u ** 3;
  return { x: a * s[0].x + b * s[1].x + c * s[2].x + d * s[3].x, y: a * s[0].y + b * s[1].y + c * s[2].y + d * s[3].y };
};
const segsPath = (segs: Seg[], close = true) => `M ${pt(segs[0][0])} ${segs.map((s) => `C ${pt(s[1])} ${pt(s[2])} ${pt(s[3])}`).join(" ")}${close ? " Z" : ""}`;

// Точка на горизонтальной окружности радиуса r на высоте h; phi = 0 — ближняя
// к зрителю точка, +90 — правая.
const ring = (r: number, h: number, phi: number): P => ({ x: r * Math.sin(rad(phi)), y: -h + r * K * Math.cos(rad(phi)) });
// Участок боковой поверхности усечённого конуса (видимая сторона), углы a…b.
const conePatch = (r0: number, h0: number, r1: number, h1: number, a: number, b: number, n = 40) => {
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) pts.push(ring(r0, h0, a + ((b - a) * i) / n));
  for (let i = n; i >= 0; i--) pts.push(ring(r1, h1, a + ((b - a) * i) / n));
  return poly(pts);
};
// Передняя половина кольца между двумя окружностями на одной высоте.
const ringFront = (rOut: number, rIn: number, h: number, n = 40) => {
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) pts.push(ring(rOut, h, -90 + (180 * i) / n));
  for (let i = n; i >= 0; i--) pts.push(ring(rIn, h, -90 + (180 * i) / n));
  return poly(pts);
};
const arcFront = (r: number, h: number, n = 40) => {
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) pts.push(ring(r, h, -90 + (180 * i) / n));
  return poly(pts, false);
};
// Гладкая замкнутая «клякса» вокруг центра (лужица и т. п.).
const blobPath = (c: P, rx: number, ry: number, seed: number, n = 12, wob = 0.22) => {
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const k = 1 - wob / 2 + wob * hash01(seed + i * 7);
    pts.push({ x: c.x + Math.cos(a) * rx * k, y: c.y + Math.sin(a) * ry * k });
  }
  const mid = (i: number) => ({ x: (pts[i % n].x + pts[(i + 1) % n].x) / 2, y: (pts[i % n].y + pts[(i + 1) % n].y) / 2 });
  let d = `M ${pt(mid(0))}`;
  for (let i = 1; i <= n; i++) d += ` Q ${pt(pts[i % n])} ${pt(mid(i))}`;
  return `${d} Z`;
};

// =====================================================================
// 1. Росток фасоли в горшке на поддоне
// =====================================================================
export const POT = {
  k: K,
  trayH: 7, // высота поддона
  trayRt: 30, // радиус края поддона
  trayRb: 25, // радиус дна поддона
  trayFloor: 1.8, // толщина дна поддона (на нём стоит горшок)
  frontY: 8, // передний нижний край поддона — на 8 ед. ниже точки (x, y) (= trayRb·K)
  rBot: 17, // радиус дна горшка (ширина 34)
  rBody: 21.4, // радиус стенки под ободком
  rBand0: 22.6, // радиус ободка внизу
  rRim: 23, // радиус ободка вверху (ширина 46)
  rIn: 21, // внутренний радиус у края
  base: 1.8, // высота дна горшка над точкой опоры
  bandH: 33.8, // высота низа ободка
  top: 41.8, // высота верха горшка (горшок 40 ед.)
  soilH: 37.8, // высота поверхности земли
  rSoil: 20.4,
  holes: [-11, 11], // x дренажных вырезов у дна (видны спереди)
  clay: "#c97a55",
  clayTop: "#d88c63",
  clayLight: "#efb48a",
  clayShade: "#9f583a",
  clayIn: "#74402c",
  tray: "#b4673f",
  trayTop: "#c2734a",
  trayIn: "#8a4a2d",
} as const;

// Поверхность земли: y — высота поверхности относительно точки опоры,
// land — куда удобнее всего лить воду (видимая земля справа от стебля, со
// стороны лейки — струя не пересекает стебель),
// dent — где палец проверяет влажность.
export const POT_SOIL = {
  y: -POT.soilH,
  rx: POT.rSoil,
  ry: POT.rSoil * K,
  land: { x: 7, y: -37.4 },
  dent: { x: -8.5, y: -39.6 },
} as const;

const SOIL = { dry: "#b38660", wet: "#5e3b25", crumbL: "#d0a77e", crumbD: "#87603f", haze: "#4a2a19" } as const;

export const PLANT = {
  stemH: 62, // длина стебля над землёй
  node: 0.84, // доля длины, где сидят первые листья
  stemW: 2.3,
  leafLen: 22, // длина первого (сердцевидного) листа
  leafLenR: 21,
  leafW: 0.8, // ширина / длина
  petiole: 5.5,
  leafUp: 26, // лист поднят над горизонталью, градусы
  droop: 9,
  triLen: 10, // центральный листочек тройчатого листа
  triSide: 8.2,
  triAng: 36,
  green: "#67ab52",
  light: "#9ad074",
  dark: "#4a8a3f",
  vein: "#3f7a36",
  young: "#86c262",
  stem: "#69a84f",
} as const;

type Leaf = { segs: Seg[]; litHi: boolean; mid: [P, P]; young: boolean };
type PlantG = { stem: P[]; node: number; petioles: [P, P][]; leaves: Leaf[]; base: P };

// Сердцевидный лист: u — от основания (выемка) к кончику, v — поперёк.
const heartLeaf = (L: number, W: number): Seg[] => {
  const h = W / 2;
  const N = { x: 0.07 * L, y: 0 };
  const A = { x: 0.32 * L, y: -h };
  const T = { x: L, y: 0 };
  const B = { x: 0.32 * L, y: h };
  return [
    [N, { x: -0.07 * L, y: -0.2 * h }, { x: 0.01 * L, y: -1.04 * h }, A],
    [A, { x: 0.6 * L, y: -0.96 * h }, { x: 0.84 * L, y: -0.42 * h }, T],
    [T, { x: 0.84 * L, y: 0.42 * h }, { x: 0.6 * L, y: 0.96 * h }, B],
    [B, { x: 0.01 * L, y: 1.04 * h }, { x: -0.07 * L, y: 0.2 * h }, N],
  ];
};
// Молодой листочек: овальный, заострённый, ещё полусложенный.
const ovateLeaf = (L: number, W: number): Seg[] => {
  const h = W / 2;
  const O = { x: 0, y: 0 };
  const A = { x: 0.4 * L, y: -h };
  const T = { x: L, y: 0 };
  const B = { x: 0.4 * L, y: h };
  return [
    [O, { x: 0.05 * L, y: -0.6 * h }, { x: 0.2 * L, y: -h }, A],
    [A, { x: 0.65 * L, y: -h }, { x: 0.88 * L, y: -0.45 * h }, T],
    [T, { x: 0.88 * L, y: 0.45 * h }, { x: 0.65 * L, y: h }, B],
    [B, { x: 0.2 * L, y: h }, { x: 0.05 * L, y: 0.6 * h }, O],
  ];
};
const LIGHT_DIR = { x: 0.6, y: -0.8 };
const placeLeaf = (segs: Seg[], O: P, ang: number, young: boolean, midEnd: number): Leaf => {
  const d = { x: Math.sin(rad(ang)), y: -Math.cos(rad(ang)) };
  const n = { x: Math.cos(rad(ang)), y: Math.sin(rad(ang)) };
  const tr = (p: P): P => ({ x: O.x + p.x * d.x + p.y * n.x, y: O.y + p.x * d.y + p.y * n.y });
  const out = segs.map((s) => s.map(tr) as Seg);
  // половина с v > 0 смотрит вдоль n; освещена та, что обращена к свету
  const litHi = n.x * LIGHT_DIR.x + n.y * LIGHT_DIR.y > 0;
  const L = segs[1][3].x;
  return { segs: out, litHi, mid: [tr(segs[0][0]), tr({ x: L * midEnd, y: 0 })], young };
};

const stemAngle0 = (u: number) => -7 + 16 * u - 6 * u * u; // лёгкий естественный изгиб

const plantGeom = (sway: number, tilt: number, t: number): PlantG => {
  const base = { x: 0, y: -POT.soilH };
  const N = 32;
  const flS = 0.3 * Math.sin((TAU * t) / 3.3);
  const ang = (u: number) => stemAngle0(u) + sway * u ** 1.5 + flS * u * u;
  const stem: P[] = [base];
  const ds = PLANT.stemH / N;
  for (let i = 0; i < N; i++) {
    const a = rad(ang((i + 0.5) / N));
    const p = stem[i];
    stem.push({ x: p.x + ds * Math.sin(a), y: p.y - ds * Math.cos(a) });
  }
  const ni = Math.round(PLANT.node * N);
  const node = stem[ni];
  const aN = ang(PLANT.node);
  const petioles: [P, P][] = [];
  const leaves: Leaf[] = [];
  ([-1, 1] as const).forEach((side) => {
    // лёгкое колыхание листа: вместе со стеблем не больше 1.5°
    const flut = side < 0 ? 0.9 * Math.sin((TAU * t) / 2.9 + 0.4) : 1.0 * Math.sin((TAU * t) / 3.4 + 2.1);
    const pa = aN + side * (90 - PLANT.leafUp) + 0.35 * sway + 0.2 * flut;
    const pe = { x: node.x + PLANT.petiole * Math.sin(rad(pa)), y: node.y - PLANT.petiole * Math.cos(rad(pa)) };
    petioles.push([node, pe]);
    const L = side < 0 ? PLANT.leafLen : PLANT.leafLenR;
    const la = pa + side * PLANT.droop + 0.45 * sway + flut;
    const O = { x: pe.x - 0.07 * L * Math.sin(rad(la)), y: pe.y + 0.07 * L * Math.cos(rad(la)) };
    leaves.push(placeLeaf(heartLeaf(L, L * PLANT.leafW), O, la, false, 0.9));
  });
  // молодой тройчатый лист на самой верхушке
  const tip = stem[N];
  const aT = ang(1);
  const flT = 0.8 * Math.sin((TAU * t) / 2.3 + 0.7);
  ([-1, 1, 0] as const).forEach((k) => {
    const L = k === 0 ? PLANT.triLen : PLANT.triSide;
    const a = aT + k * PLANT.triAng + flT * (k === 0 ? 0.6 : 1) + 0.3 * sway;
    leaves.push(placeLeaf(ovateLeaf(L, L * 0.46), tip, a, true, 0.82));
  });
  // наклон всего растения от основания стебля
  if (tilt) {
    const R = (p: P) => rotP(p, tilt, base);
    return {
      base,
      node: ni,
      stem: stem.map(R),
      petioles: petioles.map(([a, b]) => [R(a), R(b)] as [P, P]),
      leaves: leaves.map((l) => ({ ...l, segs: l.segs.map((s) => s.map(R) as Seg), mid: [R(l.mid[0]), R(l.mid[1])] as [P, P], litHi: litAfterTilt(l, tilt) })),
    };
  }
  return { base, node: ni, stem, petioles, leaves };
};
// после наклона освещённая половина листа может смениться
const litAfterTilt = (l: Leaf, tilt: number) => {
  const [a, b] = l.mid;
  const d = { x: b.x - a.x, y: b.y - a.y };
  const r = rotP(d, tilt);
  const n = { x: -r.y, y: r.x };
  return n.x * LIGHT_DIR.x + n.y * LIGHT_DIR.y > 0;
};

// Габариты растения в локальных единицах горшка (масштаб 1): {x, y, w, h}.
// Геометрия одна и та же при любых параметрах — растение не растёт.
export const plantBox = (sway = 0, tilt = 0, t = 0) => {
  const g = plantGeom(sway, tilt, t);
  const pts: P[] = [...g.stem];
  g.petioles.forEach(([a, b]) => pts.push(a, b));
  g.leaves.forEach((l) => l.segs.forEach((s) => {
    for (let i = 0; i <= 8; i++) pts.push(bez(s, i / 8));
  }));
  const pad = 0.8;
  const x0 = Math.min(...pts.map((p) => p.x)) - pad;
  const x1 = Math.max(...pts.map((p) => p.x)) + pad;
  const y0 = Math.min(...pts.map((p) => p.y)) - pad;
  const y1 = Math.max(...pts.map((p) => p.y)) + pad;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

const LeafShape: React.FC<{ l: Leaf; light: number }> = ({ l, light }) => {
  const [s0, s1, s2, s3] = l.segs;
  // половины: v < 0 — сегменты 0–1, v > 0 — сегменты 2–3 (+ средняя жилка)
  const half = (a: Seg, b: Seg, back: P) => `M ${pt(a[0])} C ${pt(a[1])} ${pt(a[2])} ${pt(a[3])} C ${pt(b[1])} ${pt(b[2])} ${pt(b[3])} L ${pt(back)} Z`;
  const lo = half(s0, s1, s0[0]);
  const hi = half(s2, s3, s2[0]);
  const lit = l.litHi ? hi : lo;
  const shd = l.litHi ? lo : hi;
  const edge = l.litHi ? [s2, s3] : [s0, s1];
  const base = l.young ? PLANT.young : PLANT.green;
  // светлая кромка освещённой половины — чуть внутри контура
  const c = { x: (l.mid[0].x + l.mid[1].x) / 2, y: (l.mid[0].y + l.mid[1].y) / 2 };
  const inset = (p: P): P => ({ x: c.x + (p.x - c.x) * 0.84, y: c.y + (p.y - c.y) * 0.84 });
  const edgeD = `M ${pt(inset(edge[0][0]))} C ${pt(inset(edge[0][1]))} ${pt(inset(edge[0][2]))} ${pt(inset(edge[0][3]))} C ${pt(inset(edge[1][1]))} ${pt(inset(edge[1][2]))} ${pt(inset(edge[1][3]))}`;
  const full = segsPath(l.segs);
  return (
    <g>
      <path d={full} fill={base} />
      <path d={shd} fill={PLANT.dark} opacity={0.32} />
      <path d={lit} fill={PLANT.light} opacity={0.28 + 0.3 * light} />
      <path d={edgeD} fill="none" stroke="#d4f0a8" strokeWidth={0.8} strokeLinecap="round" opacity={0.35 + 0.35 * light} />
      <path d={`M ${pt(l.mid[0])} L ${pt(l.mid[1])}`} stroke={PLANT.vein} strokeWidth={0.7} strokeLinecap="round" />
      <path d={full} fill="none" stroke={OUTLINE} strokeWidth={1} strokeLinejoin="round" />
    </g>
  );
};

// Тёмная дымка на дальней половине земли (эллипс относительно центра земли).
const SOIL_HAZE = { dx: -3, dy: -2.4, rx: POT.rSoil * 0.95, ry: POT.rSoil * K * 0.5, a: 0.18 } as const;
// нижний край дымки под стеблем (x = 0), относительно центра земли
const HAZE_EDGE = SOIL_HAZE.dy + SOIL_HAZE.ry * Math.sqrt(1 - (SOIL_HAZE.dx / SOIL_HAZE.rx) ** 2);

// soil — цвет земли у самого стебля: back — под дымкой, front — перед её краем
// (край проходит по «воротничку» на edge ниже основания). Земляной «воротничок»
// прячет круглый конец стебля, и росток выходит из земли, а не лежит на ней.
type StemSoil = { back: string; front: string; edge: number };
const Plant: React.FC<{ sway: number; tilt: number; t: number; light: number; soil: StemSoil }> = ({ sway, tilt, t, light, soil }) => {
  const uid = useUid("stem");
  const g = plantGeom(sway, tilt, t);
  const b = g.base;
  const lower = poly(g.stem.slice(0, g.node + 1), false);
  const upper = poly(g.stem.slice(g.node), false);
  const line = (d: string, w: number, c: string) => <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <g>
      {g.petioles.map(([a, b], i) => (
        <g key={`p${i}`}>
          {line(`M ${pt(a)} L ${pt(b)}`, 2.7, OUTLINE)}
          {line(`M ${pt(a)} L ${pt(b)}`, 1.2, PLANT.stem)}
        </g>
      ))}
      {line(lower, PLANT.stemW + 1.7, OUTLINE)}
      {line(upper, 1.7 + 1.6, OUTLINE)}
      {line(lower, PLANT.stemW, PLANT.stem)}
      {line(upper, 1.7, PLANT.stem)}
      {/* светлая сторона стебля (справа) */}
      <path d={poly(g.stem.slice(2, g.node).map((p) => ({ x: p.x + 0.55, y: p.y })), false)} fill="none" stroke={PLANT.light} strokeWidth={0.6} opacity={0.5 + 0.3 * light} />
      {/* земля у стебля: неровный комочек закрывает основание — того же цвета, что
          земля вокруг (с краем дымки), чтобы не читался диском; по бокам от стебля —
          два коротких тёмных штриха (земля чуть приподнята), без сплошной дуги */}
      <defs>
        <linearGradient id={`${uid}c`} gradientUnits="userSpaceOnUse" x1={0} y1={f(b.y + soil.edge - 0.05)} x2={0} y2={f(b.y + soil.edge + 0.05)}>
          <stop offset={0} stopColor={soil.back} />
          <stop offset={1} stopColor={soil.front} />
        </linearGradient>
      </defs>
      <path d={blobPath({ x: b.x, y: b.y + 0.7 }, 3.4, 1.5, 41, 10, 0.18)} fill={`url(#${uid}c)`} />
      {[-1, 1].map((k) => (
        <path key={k} d={`M ${f(b.x + k * 3.2)} ${f(b.y + 0.9)} Q ${f(b.x + k * 2.2)} ${f(b.y - 0.1)} ${f(b.x + k * 1.3)} ${f(b.y - 0.3)}`} fill="none" stroke={SOIL.haze} strokeWidth={0.5} strokeLinecap="round" opacity={0.45} />
      ))}
      {g.leaves.map((l, i) => (
        <LeafShape key={i} l={l} light={light} />
      ))}
    </g>
  );
};

export const SproutPot: React.FC<{ x: number; y: number; s?: number; wet?: number; puddle?: number; sway?: number; tilt?: number; light?: number; t?: number; dent?: number }> = ({
  x,
  y,
  s = 1,
  wet = 0,
  puddle = 0,
  sway = 0,
  tilt = 0,
  light = 1,
  t = 0,
  dent = 0,
}) => {
  const uid = useUid("pot");
  const P0 = POT;
  const w = clamp01(wet);
  const pd = clamp01(puddle);
  const dn = clamp01(dent);
  const lt = clamp01(light);
  const sc = { x: 0, y: -P0.soilH };
  const land = POT_SOIL.land;
  // земля: общий тон темнеет, пятно влаги растёт от места полива
  const soilBase = mix(SOIL.dry, SOIL.wet, 0.82 * w ** 1.3);
  const spotR = (0.25 + 1.45 * w) * P0.rSoil;
  const spotA = 0.8 * Math.min(1, w * 3);
  // цвет земли у стебля — с тем же влажным пятном (радиальный градиент ниже) и
  // с той же тёмной дымкой дальней половины земли (SOIL_HAZE), край которой
  // проходит прямо под стеблем: иначе «воротничок» читается светлым диском
  const stemSoil = ((): StemSoil => {
    let c: string = soilBase;
    if (w > 0) {
      const dn = Math.hypot((0 - land.x) / spotR, (sc.y - land.y) / (spotR * K));
      const a = dn < 0.6 ? spotA * (1 - (0.15 * dn) / 0.6) : spotA * 0.85 * Math.max(0, (1 - dn) / 0.4);
      c = mix(soilBase, SOIL.wet, a);
    }
    return { back: mix(c, SOIL.haze, SOIL_HAZE.a), front: c, edge: HAZE_EDGE };
  })();
  const crumbs = Array.from({ length: 18 }, (_, i) => {
    const a = hash01(i * 3 + 101) * TAU;
    const r = Math.sqrt(hash01(i * 3 + 102)) * 0.9;
    const p = { x: sc.x + Math.cos(a) * r * P0.rSoil, y: sc.y + Math.sin(a) * r * P0.rSoil * K };
    return { p, r: 0.5 + 0.5 * hash01(i * 3 + 103), light: i % 3 !== 0 };
  }).filter((c) => Math.abs(c.p.x) > 2.6 || Math.abs(c.p.y - sc.y) > 1.6);
  const notch = (hx: number) => {
    const yb = (xx: number) => -P0.base + P0.rBot * K * Math.sqrt(Math.max(0, 1 - (xx / P0.rBot) ** 2));
    return `M ${f(hx - 2)} ${f(yb(hx - 2) + 0.4)} Q ${f(hx)} ${f(yb(hx) - 5)} ${f(hx + 2)} ${f(yb(hx + 2) + 0.4)} Z`;
  };
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <defs>
        <clipPath id={`${uid}soil`}>
          <ellipse cx={0} cy={f(sc.y)} rx={f(P0.rSoil)} ry={f(P0.rSoil * K)} />
        </clipPath>
        <radialGradient id={`${uid}wet`}>
          <stop offset="0" stopColor={SOIL.wet} stopOpacity={spotA} />
          <stop offset="0.6" stopColor={SOIL.wet} stopOpacity={spotA * 0.85} />
          <stop offset="1" stopColor={SOIL.wet} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* тень на столе (свет справа сверху — тень чуть влево) */}
      <ellipse cx={-3} cy={1.4} rx={31.5} ry={9.6} fill={SHADOW} opacity={0.24} />
      {/* поддон: дальний край и дно */}
      <ellipse cx={0} cy={-P0.trayH} rx={P0.trayRt} ry={P0.trayRt * K} fill={P0.trayTop} stroke={OUTLINE} strokeWidth={OL} />
      <ellipse cx={0} cy={-P0.trayH + 0.4} rx={P0.trayRt - 2} ry={(P0.trayRt - 2) * K} fill={P0.trayIn} />
      <ellipse cx={-2.5} cy={-P0.base - 1} rx={P0.rBot + 3} ry={(P0.rBot + 3) * K} fill={SHADOW} opacity={0.3} />
      {/* горшок */}
      <path d={conePatch(P0.rBot, P0.base, P0.rBody, P0.bandH, -90, 90)} fill={P0.clay} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={conePatch(P0.rBot, P0.base, P0.rBody, P0.bandH, -90, -32)} fill={P0.clayShade} opacity={0.42} />
      <path d={conePatch(P0.rBot, P0.base, P0.rBody, P0.bandH, -32, -12)} fill={P0.clayShade} opacity={0.16} />
      <path d={conePatch(P0.rBot, P0.base, P0.rBody, P0.bandH, 12, 90)} fill="#ffd49a" opacity={0.16 * lt} />
      <path d={conePatch(P0.rBot + 0.3, P0.base + 3, P0.rBody + 0.3, P0.bandH - 2, 34, 50)} fill={P0.clayLight} opacity={0.22 + 0.4 * lt} />
      {/* тень под ободком */}
      <path d={conePatch(P0.rBody, P0.bandH - 2.4, P0.rBody, P0.bandH, -90, 90)} fill={P0.clayShade} opacity={0.38} />
      {/* дренажные вырезы у дна */}
      {P0.holes.map((hx) => (
        <path key={hx} d={notch(hx)} fill="#3a2117" stroke={OUTLINE} strokeWidth={0.8} strokeLinejoin="round" />
      ))}
      {/* верх: кромка и внутренняя стенка */}
      <ellipse cx={0} cy={-P0.top} rx={P0.rRim} ry={P0.rRim * K} fill={P0.clayTop} stroke={OUTLINE} strokeWidth={OL} />
      <ellipse cx={0} cy={-P0.top} rx={P0.rIn} ry={P0.rIn * K} fill={P0.clayIn} />
      <path d={`M ${f(-P0.rIn * 0.8)} ${f(-P0.top - P0.rIn * K * 0.6)} Q 0 ${f(-P0.top - P0.rIn * K * 1.15)} ${f(P0.rIn * 0.8)} ${f(-P0.top - P0.rIn * K * 0.6)}`} fill="none" stroke="#5a301f" strokeWidth={1.4} opacity={0.6} />
      {/* земля */}
      <g clipPath={`url(#${uid}soil)`}>
        <ellipse cx={0} cy={f(sc.y)} rx={f(P0.rSoil)} ry={f(P0.rSoil * K)} fill={soilBase} />
        <ellipse cx={f(SOIL_HAZE.dx)} cy={f(sc.y + SOIL_HAZE.dy)} rx={f(SOIL_HAZE.rx)} ry={f(SOIL_HAZE.ry)} fill={SOIL.haze} opacity={SOIL_HAZE.a} />
        {crumbs.map((c, i) => (
          <ellipse key={i} cx={f(c.p.x)} cy={f(c.p.y)} rx={f(c.r)} ry={f(c.r * 0.7)} fill={c.light ? SOIL.crumbL : SOIL.crumbD} opacity={0.9 - 0.5 * w} />
        ))}
        {w > 0 ? <ellipse cx={f(land.x)} cy={f(land.y)} rx={f(spotR)} ry={f(spotR * K)} fill={`url(#${uid}wet)`} /> : null}
        {dn > 0 ? (
          <g opacity={Math.min(1, dn * 1.5)}>
            {/* ямка от пальца: тёмное дно, затенённая дальняя стенка, светлый край спереди */}
            <ellipse cx={f(POT_SOIL.dent.x)} cy={f(POT_SOIL.dent.y)} rx={f(1.7 + 0.8 * dn)} ry={f((1.7 + 0.8 * dn) * 0.45)} fill="#3e2416" opacity={0.5} />
            <ellipse cx={f(POT_SOIL.dent.x + 0.3)} cy={f(POT_SOIL.dent.y + 0.3)} rx={f(1.0 + 0.5 * dn)} ry={f((1.0 + 0.5 * dn) * 0.4)} fill="#7a5233" opacity={0.6} />
          </g>
        ) : null}
        {pd > 0 ? (
          <g>
            {/* тонкая плёнка воды: тёмная блестящая мокрая земля, у дальнего края —
                узкий отблеск неба (серпиком), и маленький блик */}
            <path d={blobPath(land, 6.8 * (0.45 + 0.55 * pd), 2.4 * (0.45 + 0.55 * pd), 77)} fill="#2f1d12" opacity={0.42 * pd} />
            {(() => {
              const rx = 5.4 * (0.45 + 0.55 * pd);
              const ry = 2.0 * (0.45 + 0.55 * pd);
              const c = { x: land.x + 0.4, y: land.y };
              return <path d={`M ${f(c.x - rx)} ${f(c.y - 0.2 * ry)} Q ${f(c.x)} ${f(c.y - 1.45 * ry)} ${f(c.x + rx)} ${f(c.y - 0.2 * ry)} Q ${f(c.x)} ${f(c.y - 0.75 * ry)} ${f(c.x - rx)} ${f(c.y - 0.2 * ry)} Z`} fill="#cfe8f5" opacity={0.3 * pd} />;
            })()}
            <ellipse cx={f(land.x + 2.4 * (0.5 + 0.5 * pd))} cy={f(land.y - 0.8)} rx={f(1.9 * (0.5 + 0.5 * pd))} ry={0.55} fill="#ffffff" opacity={0.6 * pd} transform={`rotate(-8 ${f(land.x + 2)} ${f(land.y - 0.8)})`} />
          </g>
        ) : null}
      </g>
      {/* передняя часть кромки и ободок поверх земли */}
      <path d={ringFront(P0.rRim, P0.rIn, P0.top)} fill={P0.clayTop} />
      <path d={arcFront(P0.rIn, P0.top)} fill="none" stroke={OUTLINE} strokeWidth={0.9} opacity={0.8} />
      <path d={conePatch(P0.rBand0, P0.bandH, P0.rRim, P0.top, -90, 90)} fill={P0.clay} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={conePatch(P0.rBand0, P0.bandH, P0.rRim, P0.top, -90, -32)} fill={P0.clayShade} opacity={0.4} />
      <path d={conePatch(P0.rBand0, P0.bandH, P0.rRim, P0.top, 12, 90)} fill="#ffd49a" opacity={0.16 * lt} />
      <path d={conePatch(P0.rBand0 + 0.3, P0.bandH + 1.5, P0.rRim + 0.3, P0.top - 1.5, 36, 50)} fill={P0.clayLight} opacity={0.25 + 0.4 * lt} />
      <path d={arcFront(P0.rRim, P0.top)} fill="none" stroke={OUTLINE} strokeWidth={OL} />
      {/* передний край поддона поверх низа горшка */}
      <path d={ringFront(P0.trayRt, P0.trayRt - 2, P0.trayH)} fill={P0.trayTop} />
      <path d={conePatch(P0.trayRb, 0, P0.trayRt, P0.trayH, -90, 90)} fill={P0.tray} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={conePatch(P0.trayRb, 0, P0.trayRt, P0.trayH, -90, -30)} fill={P0.clayShade} opacity={0.4} />
      <path d={conePatch(P0.trayRb + 0.2, 1.2, P0.trayRt + 0.2, P0.trayH - 1.2, 36, 54)} fill={P0.clayLight} opacity={0.2 + 0.3 * lt} />
      <path d={arcFront(P0.trayRt - 2, P0.trayH)} fill="none" stroke={OUTLINE} strokeWidth={0.8} opacity={0.7} />
      <path d={arcFront(P0.trayRt, P0.trayH)} fill="none" stroke={OUTLINE} strokeWidth={OL} />
      <Plant sway={sway} tilt={tilt} t={t} light={lt} soil={stemSoil} />
    </g>
  );
};

// =====================================================================
// 2. Детская лейка
// =====================================================================
const SPOUT_ANG = 40; // носик поднят на 40° над горизонталью, смотрит влево
const SPOUT_D: P = { x: -Math.cos(rad(SPOUT_ANG)), y: -Math.sin(rad(SPOUT_ANG)) };
const HANDLE: Seg = [
  { x: 1, y: -46 },
  { x: 0, y: -72 },
  { x: 38, y: -64 },
  { x: 25.5, y: -31.5 }, // конец ручки прячется в нижнем креплении
];
// Эллипсы дна и крышки сжаты так же, как у горшка (K): лейка и горшок рядом
// видны с одной высоты глаз.
const CAN_RK = 26 * K;
export const CAN = {
  w: 52,
  h: 47.5, // от дна до дальнего края крышки
  rk: CAN_RK, // полуось дна по вертикали: центр следа дна — на rk выше точки (x, y)
  footY: -CAN_RK, // y центра следа дна относительно точки (x, y) (= −rk)
  // центр корпуса — ось наклона. Намеренно не −h/2 (−23.75): h считается до
  // дальнего края крышки, а ось — середина цилиндра корпуса; значение уже
  // поставлено в кадр (canPoint, canAtTip в direction) — не менять.
  pivot: { x: 0, y: -23 },
  topY: -40, // центр эллипса верха корпуса
  rTop: 23.5,
  spoutRoot: { x: -22, y: -13 },
  spoutLen: 48,
  spoutW0: 10,
  spoutW1: 5.6,
  spoutAng: SPOUT_ANG,
  handle: HANDLE,
  body: "#6aa77a",
  top: "#7fba8e",
  light: "#a9d9b4",
  shade: "#4b875c",
  band: "#55946a",
  inside: "#2c4a37",
} as const;

const SPOUT_TIP: P = { x: CAN.spoutRoot.x + SPOUT_D.x * CAN.spoutLen, y: CAN.spoutRoot.y + SPOUT_D.y * CAN.spoutLen };
const SPOUT_TIP_OUT = 0.8; // canPoint("spoutTip") — на столько дальше центра кромки вдоль носика
const CAN_PTS: Record<"spoutTip" | "handleGrip" | "bodyGrip" | "bottomFront" | "bottomBack" | "bodyCenter", P> = {
  spoutTip: { x: SPOUT_TIP.x + SPOUT_D.x * SPOUT_TIP_OUT, y: SPOUT_TIP.y + SPOUT_D.y * SPOUT_TIP_OUT },
  handleGrip: bez(HANDLE, 0.42),
  bodyGrip: { x: -25, y: -24 },
  bottomFront: { x: -20, y: -2.4 }, // на нижнем контуре дна (дно при x = ±20 — y ≈ −3)
  bottomBack: { x: 20, y: -2.4 },
  bodyCenter: { x: 0, y: -23 },
};
export type CanPointName = "spoutTip" | "spoutDir" | "handleGrip" | "bodyGrip" | "bottomFront" | "bottomBack" | "bodyCenter";
// Одно и то же преобразование для рисунка и для точек: поворот на −tilt
// (носик уходит вниз-влево) вокруг центра корпуса.
const canXf = (p: P, tilt: number) => rotP(p, -tilt, CAN.pivot);
// Локальные координаты (масштаб 1, до translate/scale, после наклона).
// spoutDir — единичный вектор вдоль носика (куда вытекает вода).
export const canPoint = (name: CanPointName, tilt: number): P => (name === "spoutDir" ? rotP(SPOUT_D, -tilt) : canXf(CAN_PTS[name], tilt));

// water — сколько воды внутри (0…1): снаружи не видно, оставлено для совместимости.
// shadow (0…1) — контактная тень на столе; рисуйте её, когда лейка стоит на
// поверхности (в руках над столом — 0).
export const WateringCan: React.FC<{ x: number; y: number; s?: number; tilt?: number; water?: number; shadow?: number }> = ({ x, y, s = 1, tilt = 0, shadow = 0 }) => {
  const uid = useUid("can");
  const C = CAN;
  const R = C.spoutRoot;
  const n = { x: -SPOUT_D.y, y: SPOUT_D.x }; // поперёк носика (вниз-влево → вверх-вправо)
  const nU = n.y < 0 ? n : { x: -n.x, y: -n.y }; // верхняя сторона носика
  const sp = (k: number, side: number, w: number): P => ({ x: R.x + SPOUT_D.x * C.spoutLen * k + nU.x * side * w, y: R.y + SPOUT_D.y * C.spoutLen * k + nU.y * side * w });
  const spoutD = poly([sp(0, 1, C.spoutW0 / 2), sp(1, 1, C.spoutW1 / 2), sp(1, -1, C.spoutW1 / 2), sp(0, -1, C.spoutW0 / 2)]);
  const lip = { x: SPOUT_TIP.x, y: SPOUT_TIP.y };
  const lipAng = (Math.atan2(nU.y, nU.x) * 180) / Math.PI;
  const lidR = C.rTop * K;
  const rk = C.rk;
  const ty = C.topY;
  const body = `M ${f(-C.rTop)} ${f(ty)} C -25.6 ${f(ty + 0.6)} -26 ${f(ty + 2)} -26 ${f(ty + 4.5)} L -26 ${f(-rk)} A 26 ${f(rk)} 0 0 0 26 ${f(-rk)} L 26 ${f(ty + 4.5)} C 26 ${f(ty + 2)} 25.6 ${f(ty + 0.6)} ${f(C.rTop)} ${f(ty)} A ${f(C.rTop)} ${f(lidR)} 0 0 1 ${f(-C.rTop)} ${f(ty)} Z`;
  const bandY = -rk - 4.5;
  const handleD = segsPath([HANDLE], false);
  return (
    <g>
      {/* контактная тень: по следу дна, чуть влево (свет справа) */}
      {shadow > 0 ? <ellipse cx={f(x - 3 * s)} cy={f(y + (C.footY + 1.4) * s)} rx={f(29.5 * s)} ry={f(9.6 * s)} fill={SHADOW} opacity={0.24 * clamp01(shadow)} /> : null}
      <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(-tilt)} ${f(C.pivot.x)} ${f(C.pivot.y)})`}>
        <defs>
          <clipPath id={`${uid}b`}>
            <path d={body} />
          </clipPath>
        </defs>
        {/* ручка (дальний конец уходит за корпус) */}
        <path d={handleD} fill="none" stroke={OUTLINE} strokeWidth={7.4} strokeLinecap="round" />
        <path d={handleD} fill="none" stroke={C.body} strokeWidth={4.2} strokeLinecap="round" />
        <path d={segsPath([[bez(HANDLE, 0.08), bez(HANDLE, 0.25), bez(HANDLE, 0.45), bez(HANDLE, 0.62)]], false)} fill="none" stroke={C.light} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} transform="translate(0.9 -0.9)" />
        {/* носик */}
        <path d={spoutD} fill={C.body} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
        <path d={poly([sp(0.05, -0.15, C.spoutW0 / 2), sp(1, -0.15, C.spoutW1 / 2), sp(1, -1, C.spoutW1 / 2), sp(0.05, -1, C.spoutW0 / 2)])} fill={C.shade} opacity={0.45} />
        <path d={`M ${pt(sp(0.12, 0.45, C.spoutW0 / 2))} L ${pt(sp(0.92, 0.45, C.spoutW1 / 2))}`} stroke={C.light} strokeWidth={1.1} strokeLinecap="round" opacity={0.8} />
        {/* литой поясок у корпуса */}
        <path d={`M ${pt(sp(0.16, 1, C.spoutW0 / 2 - 0.4))} L ${pt(sp(0.16, -1, C.spoutW0 / 2 - 0.4))}`} stroke={OUTLINE} strokeWidth={0.9} opacity={0.75} />
        {/* открытый кончик носика */}
        <ellipse cx={f(lip.x)} cy={f(lip.y)} rx={f(C.spoutW1 / 2 + 1)} ry={1.9} transform={`rotate(${f(lipAng)} ${f(lip.x)} ${f(lip.y)})`} fill={C.top} stroke={OUTLINE} strokeWidth={1.2} />
        <ellipse cx={f(lip.x + SPOUT_D.x * 0.2)} cy={f(lip.y + SPOUT_D.y * 0.2)} rx={f(C.spoutW1 / 2 - 0.4)} ry={1} transform={`rotate(${f(lipAng)} ${f(lip.x)} ${f(lip.y)})`} fill={C.inside} />
        {/* корпус */}
        <path d={body} fill={C.body} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
        <g clipPath={`url(#${uid}b)`}>
          <rect x={-27} y={-50} width={11} height={56} fill={C.shade} opacity={0.42} />
          <rect x={-16} y={-50} width={6} height={56} fill={C.shade} opacity={0.16} />
          <rect x={11.5} y={-50} width={5.5} height={56} fill={C.light} opacity={0.55} />
          <rect x={18.5} y={-50} width={1.6} height={56} fill={C.light} opacity={0.35} />
          {/* нижний поясок */}
          <path d={`M -27 ${f(bandY)} L -26 ${f(bandY)} A 26 ${f(rk)} 0 0 0 26 ${f(bandY)} L 27 ${f(bandY)} L 27 4 L -27 4 Z`} fill={C.band} />
          <path d={`M -26 ${f(bandY)} A 26 ${f(rk)} 0 0 0 26 ${f(bandY)}`} fill="none" stroke={OUTLINE} strokeWidth={0.9} opacity={0.7} />
        </g>
        <path d={body} fill="none" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
        {/* верх корпуса и заливное отверстие */}
        <ellipse cx={0} cy={ty} rx={C.rTop} ry={f(lidR)} fill={C.top} stroke={OUTLINE} strokeWidth={OL} />
        <ellipse cx={-9} cy={ty - 0.2} rx={6.8} ry={2.3} fill={C.band} stroke={OUTLINE} strokeWidth={1.1} />
        <ellipse cx={-9} cy={ty - 0.4} rx={5.1} ry={1.5} fill={C.inside} />
        {/* крепления ручки */}
        <ellipse cx={1.2} cy={-45.6} rx={3.6} ry={1.6} fill={C.band} stroke={OUTLINE} strokeWidth={1} />
        <ellipse cx={25.6} cy={-31.2} rx={1.8} ry={4.4} fill={C.band} stroke={OUTLINE} strokeWidth={1} />
        <ellipse cx={14} cy={ty + 2.5} rx={2.2} ry={1.1} fill="#ffffff" opacity={0.45} />
      </g>
    </g>
  );
};

// =====================================================================
// 3. Струя воды
// =====================================================================
type Curve = { at: (u: number) => P; tan: (u: number) => P };
// Баллистическая парабола: вылет из tip вдоль dir, приземление ровно в land.
// p(u) = tip + V·u + (0, a)·u², V ∥ dir (V = v·dir, v > 0), a > 0 (тяжесть вниз).
// Если такую параболу построить нельзя (land позади вылета или прямо под
// носиком) — тоже баллистика, но с горизонтальной скоростью прямо к land:
// струя никогда не загибается назад.
const warned = new Set<string>();
const warnOnce = (tip: P, land: P, msg: string) => {
  const key = `${Math.round(tip.x)},${Math.round(tip.y)},${Math.round(land.x)},${Math.round(land.y)}`;
  if (process.env.NODE_ENV !== "production" && !warned.has(key) && warned.size < 20) {
    warned.add(key);
    console.warn(`[WaterStream] ${msg}`);
  }
};
const streamCurve = (tip: P, dir: P, land: P): Curve => {
  const dx = land.x - tip.x;
  const dy = land.y - tip.y;
  const len = Math.hypot(dx, dy) || 1;
  const dl = Math.hypot(dir.x, dir.y) || 1;
  const d = { x: dir.x / dl, y: dir.y / dl };
  let C: P | null = null;
  if (Math.abs(d.x) > 1e-3) {
    const v = dx / d.x;
    const a = dy - v * d.y;
    if (v > 0 && a > 0 && v < 3 * len) C = { x: tip.x + (v * d.x) / 2, y: tip.y + (v * d.y) / 2 };
  }
  if (!C) {
    const slope = Math.abs(d.x) > 1e-3 ? d.y / Math.abs(d.x) : d.y >= 0 ? 1e3 : -1e3;
    const vy = Math.max(-3 * len, Math.min(slope * Math.abs(dx), dy - 1));
    C = { x: tip.x + dx / 2, y: tip.y + vy / 2 };
    warnOnce(tip, land, `land (${land.x.toFixed(1)}, ${land.y.toFixed(1)}) is not reachable along dir (${d.x.toFixed(2)}, ${d.y.toFixed(2)}) from tip (${tip.x.toFixed(1)}, ${tip.y.toFixed(1)}); using a fallback arc`);
  }
  const Cq: P = C;
  const at = (u: number): P => ({
    x: (1 - u) ** 2 * tip.x + 2 * u * (1 - u) * Cq.x + u * u * land.x,
    y: (1 - u) ** 2 * tip.y + 2 * u * (1 - u) * Cq.y + u * u * land.y,
  });
  const tan = (u: number): P => {
    const t = { x: 2 * (1 - u) * (Cq.x - tip.x) + 2 * u * (land.x - Cq.x), y: 2 * (1 - u) * (Cq.y - tip.y) + 2 * u * (land.y - Cq.y) };
    const m = Math.hypot(t.x, t.y);
    if (m < 1e-6) return { x: dx / len, y: dy / len }; // падение с места: касательная — к land
    return { x: t.x / m, y: t.y / m };
  };
  return { at, tan };
};

// flight — время полёта фронта и хвоста струи, с; drips — последние капли:
// f0 — капля начинает набухать на носике, r0 — отрывается (с после stop);
// dripG — ускорение падения капли, ед/с² при s = 1 (как у самой струи);
// dripReach — насколько капля может сместиться от land по x (ед при s = 1),
// чтобы упасть в землю, а не мимо горшка. Когда всё кончится — streamEndsAt(),
// когда каждая капля коснётся земли — dripLandTimes().
export const STREAM = {
  flight: 0.25,
  drips: [
    { f0: 0.24, r0: 0.4, r: 1.3 },
    { f0: 0.44, r0: 0.58, r: 1.0 }, // последняя капля касается земли к ≈ stop + 0.85 с
  ],
  dripG: 1400,
  dripReach: 6,
} as const;

// Точка — неподвижная или как функция времени фильма t (с).
export type PointAt = P | ((t: number) => P);
const atTime = (v: PointAt, t: number): P => (typeof v === "function" ? v(t) : v);
const unit = (v: P): P => {
  const l = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / l, y: v.y / l };
};

// Нижняя точка кромки носика (в координатах родителя): tip — кончик
// (canPoint("spoutTip"), на SPOUT_TIP_OUT ед. дальше кромки вдоль носика), dir —
// направление носика, s — масштаб. Тут набухает и отсюда отрывается капля:
// у поднятого носика — снизу на кромке, а не во «рту» носика.
const dripAnchor = (tip: P, dir: P, s: number): P => {
  const d = unit(dir);
  const nd = d.x >= 0 ? { x: -d.y, y: d.x } : { x: d.y, y: -d.x }; // поперёк носика, nd.y ≥ 0 (вниз)
  const back = SPOUT_TIP_OUT * s;
  const r = (CAN.spoutW1 / 2) * s;
  return { x: tip.x - d.x * back + nd.x * r, y: tip.y - d.y * back + nd.y * r };
};
// центр набухающей капли радиуса rr висит под точкой кромки
const DRIP_HANG = 0.9;
// Минимальная высота падения капли / перепад струи (ед при s = 1): ниже — вода
// не рисуется (иначе пришлось бы течь вверх).
const MIN_DROP = 0.5;

// Падение i-й капли: отрыв в момент stop + r0 из нижней точки кромки носика в
// этот момент; центр капли — из-под кромки (как у набухающей капли) свободно
// падает с ускорением dripG·s до уровня land.y и ровно тогда касается земли.
// null — капле некуда падать (земля не ниже носика).
type DripFall = { from: P; lx: number; release: number; T: number };
const dripFall = (i: number, tip: PointAt, dir: PointAt, land: P, stop: number, s: number): DripFall | null => {
  const dr = STREAM.drips[i];
  const release = stop + dr.r0;
  const a = dripAnchor(atTime(tip, release), atTime(dir, release), s);
  const from = { x: a.x, y: a.y + DRIP_HANG * dr.r * s };
  const h = land.y - from.y;
  if (h <= MIN_DROP * s) return null;
  const reach = STREAM.dripReach * s;
  const lx = Math.min(land.x + reach, Math.max(land.x - reach, from.x)); // куда падает капля
  return { from, lx, release, T: Math.sqrt((2 * h) / (STREAM.dripG * s)) };
};

// Точные моменты (с, время фильма), когда капли STREAM.drips касаются земли, по
// порядку; капли, которым некуда падать, пропущены. ЭТО ТА ЖЕ МАТЕМАТИКА, ЧТО
// РИСУЕТ WaterStream (dripFall): рисунок и эти времена должны совпадать с
// точностью лучше 1/60 с — по ним звук ставит по одной капле. Поэтому сюда
// передаются те же tip/dir, что получает WaterStream: функции tipAt/dirAt, если
// они переданы и в WaterStream, иначе — tip/dir носика в момент отрыва.
export const dripLandTimes = (tip: PointAt, land: P, stop: number, s: number, dir: PointAt): number[] =>
  STREAM.drips.flatMap((_, i) => {
    const d = dripFall(i, tip, dir, land, stop, s);
    return d ? [d.release + d.T] : [];
  });

// Момент, после которого WaterStream с этим stop больше ничего не рисует.
// tip — где носик в момент отрыва капель (точка или tipAt); dir (или dirAt) —
// направление носика; без dir капли считаются от самого tip (оценка с запасом
// 0.15 с — колечко на земле).
export const streamEndsAt = (tip: PointAt, land: P, stop: number, s = 1, dir?: PointAt) => {
  const lands = dir
    ? dripLandTimes(tip, land, stop, s, dir)
    : STREAM.drips.map((dr) => {
        const p = atTime(tip, stop + dr.r0);
        return stop + dr.r0 + Math.sqrt((2 * Math.max(0, land.y - p.y)) / (STREAM.dripG * s));
      });
  return Math.max(stop + STREAM.flight + 0.12, ...lands.map((x) => x + 0.15));
};

const WATER = { fill: "#a6d8f2", edge: "#5fa7d3", foam: "#d9f0fb" } as const;

// Координаты — в пространстве родителя; s масштабирует только толщину.
// detach — геометрия носика в момент stop (для оторвавшегося хвоста, если лейка
// после остановки двигается); по умолчанию — текущие tip/dir.
// tipAt / dirAt (необязательно) — кончик и направление носика как функции
// времени фильма: оторвавшаяся капля падает из того места, где носик был в
// момент её отрыва, а не догоняет движущийся носик. Без них — текущие tip/dir.
// Если земля не ниже носика (land.y ≤ tip.y + 0.5·s), струя не рисуется.
export const WaterStream: React.FC<{
  tip: P;
  dir: P;
  land: P;
  start: number;
  stop: number | null;
  t: number;
  s?: number;
  detach?: { tip: P; dir: P };
  tipAt?: (t: number) => P;
  dirAt?: (t: number) => P;
}> = ({ tip, dir, land, start, stop, t, s = 1, detach, tipAt, dirAt }) => {
  if (t < start) return null;
  const F = STREAM.flight;
  const head = clamp01((t - start) / F);
  const stopped = stop !== null && t >= stop;
  const tail = stopped ? clamp01((t - (stop as number)) / F) : 0;
  const src = stopped && detach ? detach : { tip, dir };
  // вода не течёт вверх: земля выше носика (или вровень) — струи нет
  const uphill = land.y <= src.tip.y + MIN_DROP * s;
  if (uphill) warnOnce(src.tip, land, `land (${land.x.toFixed(1)}, ${land.y.toFixed(1)}) is not below tip (${src.tip.x.toFixed(1)}, ${src.tip.y.toFixed(1)}); the stream is not drawn`);
  const cur = streamCurve(src.tip, src.dir, land);
  const out: React.ReactNode[] = [];
  const wAt = (u: number) => s * (2.7 - 1.0 * u);
  if (!uphill && head > tail + 1e-3) {
    const n = Math.max(6, Math.ceil((head - tail) * 30));
    const tm = cur.tan((head + tail) / 2);
    const up = -tm.y * LIGHT_DIR.x + tm.x * LIGHT_DIR.y > 0 ? 1 : -1; // блик — на стороне к свету
    const L: P[] = [];
    const Rr: P[] = [];
    const mid: P[] = [];
    for (let i = 0; i <= n; i++) {
      const u = tail + ((head - tail) * i) / n;
      const p = cur.at(u);
      const tg = cur.tan(u);
      const nn = { x: -tg.y, y: tg.x };
      const w = wAt(u) / 2;
      L.push({ x: p.x + nn.x * w, y: p.y + nn.y * w });
      Rr.push({ x: p.x - nn.x * w, y: p.y - nn.y * w });
      mid.push({ x: p.x + nn.x * w * 0.45 * up, y: p.y + nn.y * w * 0.45 * up });
    }
    const rh = wAt(head) / 2;
    const rt = wAt(tail) / 2;
    const d = `M ${pt(L[0])} L ${L.slice(1).map(pt).join(" L ")} A ${f(rh)} ${f(rh)} 0 0 0 ${pt(Rr[n])} L ${Rr.slice(0, n).reverse().map(pt).join(" L ")} A ${f(rt)} ${f(rt)} 0 0 0 ${pt(L[0])} Z`;
    out.push(<path key="body" d={d} fill={WATER.fill} opacity={0.82} stroke={WATER.edge} strokeWidth={f(0.45 * s)} strokeOpacity={0.7} strokeLinejoin="round" />);
    if (mid.length > 3) {
      out.push(
        <path
          key="hl"
          d={poly(mid.slice(1, -1), false)}
          fill="none"
          stroke="#ffffff"
          strokeWidth={f(0.6 * s)}
          strokeLinecap="round"
          strokeDasharray={`${f(4.5 * s)} ${f(3.2 * s)}`}
          strokeDashoffset={f(-t * 95 * s)}
          opacity={0.7}
        />,
      );
    }
  }
  // брызги и рябь, пока вода прибывает в точку приземления
  const arrive = clamp01((t - (start + F)) / 0.06);
  const leave = stop === null ? 1 : 1 - clamp01((t - (stop + F)) / 0.12);
  const sk = uphill ? 0 : arrive * leave;
  if (sk > 0.01) {
    [0, 1].forEach((j) => {
      const ph = frac(t * 1.9 + j * 0.5);
      const rx = (1.6 + 5.2 * ph) * s;
      out.push(<ellipse key={`rp${j}`} cx={f(land.x)} cy={f(land.y)} rx={f(rx)} ry={f(rx * K)} fill="none" stroke={WATER.foam} strokeWidth={f(0.4 * s)} opacity={0.22 * sk * (1 - ph)} />);
    });
    out.push(<ellipse key="gl" cx={f(land.x + 0.5 * s)} cy={f(land.y - 0.25 * s)} rx={f(1.3 * s)} ry={f(0.45 * s)} fill="#ffffff" opacity={0.45 * sk} />);
    [0, 1, 2].forEach((i) => {
      const ph = frac(t * 2.7 + hash01(i * 7 + 3));
      const vx = (hash01(i * 13 + 5) - 0.5) * 2;
      const p = { x: land.x + vx * 8 * ph * s, y: land.y - 4 * ph * (1 - ph) * 4.2 * s };
      const r = (0.5 + 0.25 * hash01(i * 5 + 1)) * s * (1 - 0.35 * ph);
      out.push(<circle key={`sp${i}`} cx={f(p.x)} cy={f(p.y)} r={f(r)} fill={WATER.foam} opacity={0.85 * sk * (1 - ph ** 3)} />);
    });
  }
  // последние капли: набухают на нижней точке кромки носика (вместе с носиком),
  // отрываются и падают (почти отвесно, с тем же ускорением, что у струи) из
  // точки отрыва в землю у места полива. Математика падения — dripFall, общая
  // с dripLandTimes (по ней ставится звук капель).
  if (stop !== null && t > stop) {
    const dt = t - stop;
    const g = STREAM.dripG * s;
    STREAM.drips.forEach((dr, i) => {
      if (dt < dr.f0) return;
      const fall = dripFall(i, tipAt ?? tip, dirAt ?? dir, land, stop, s);
      if (!fall) return;
      const r = dr.r * s;
      if (dt < dr.r0) {
        const a = dripAnchor(tip, dir, s);
        const k = (dt - dr.f0) / (dr.r0 - dr.f0);
        const rr = r * (0.35 + 0.65 * k);
        out.push(<ellipse key={`dr${i}`} cx={f(a.x)} cy={f(a.y + rr * DRIP_HANG)} rx={f(rr)} ry={f(rr * 1.1)} fill={WATER.fill} stroke={WATER.edge} strokeWidth={f(0.35 * s)} opacity={0.9} />);
        return;
      }
      const tau = dt - dr.r0;
      if (tau < fall.T) {
        const p = { x: fall.from.x + (fall.lx - fall.from.x) * (tau / fall.T), y: fall.from.y + 0.5 * g * tau * tau };
        out.push(<ellipse key={`dr${i}`} cx={f(p.x)} cy={f(Math.min(p.y, land.y))} rx={f(r * 0.9)} ry={f(r * 1.25)} fill={WATER.fill} stroke={WATER.edge} strokeWidth={f(0.35 * s)} opacity={0.9} />);
        return;
      }
      // капля впиталась: короткое колечко на земле
      const k = (tau - fall.T) / 0.15;
      if (k < 1) out.push(<ellipse key={`dr${i}`} cx={f(fall.lx)} cy={f(land.y)} rx={f((1.2 + 2.6 * k) * s)} ry={f((1.2 + 2.6 * k) * s * K)} fill="none" stroke={WATER.foam} strokeWidth={f(0.4 * s)} opacity={0.3 * (1 - k)} />);
    });
  }
  return <g>{out}</g>;
};

// =====================================================================
// 4. Учебные карточки, подставка и стопка
// =====================================================================
export const CARD = { w: 36, h: 48, thick: 2, r: 3, edge: { x: 1.5, y: -1.9 } } as const;
export type CardKind = "sun" | "drop" | "soil" | "wind";
// где пальцы держат карточку (сверху по центру), от нижней середины, без поворота
export const CARD_GRIP = { x: 0, y: -44.5 } as const;
export const CARD_LEAN = 12; // наклон назад в подставке, градусы (lean = 1)

const CARD_ACCENT: Record<CardKind, string> = { sun: "#e3a43a", drop: "#4f9ad2", soil: "#9a6a43", wind: "#62a356" };
const CARD_BG: Record<CardKind, string> = { sun: "#cfe7f6", drop: "#e4f2fa", soil: "#dfeff7", wind: "#e2f1ea" };
const roundRect = (x0: number, y0: number, w: number, h: number, r: number) =>
  `M ${f(x0 + r)} ${f(y0)} H ${f(x0 + w - r)} Q ${f(x0 + w)} ${f(y0)} ${f(x0 + w)} ${f(y0 + r)} V ${f(y0 + h - r)} Q ${f(x0 + w)} ${f(y0 + h)} ${f(x0 + w - r)} ${f(y0 + h)} H ${f(x0 + r)} Q ${f(x0)} ${f(y0 + h)} ${f(x0)} ${f(y0 + h - r)} V ${f(y0 + r)} Q ${f(x0)} ${f(y0)} ${f(x0 + r)} ${f(y0)} Z`;

const roundRectPts = (x0: number, y0: number, w: number, h: number, r: number, n = 6): P[] => {
  const out: P[] = [];
  const corners: [number, number, number][] = [
    [x0 + w - r, y0 + r, -90],
    [x0 + w - r, y0 + h - r, 0],
    [x0 + r, y0 + h - r, 90],
    [x0 + r, y0 + r, 180],
  ];
  corners.forEach(([cx, cy, a0]) => {
    for (let i = 0; i <= n; i++) {
      const a = rad(a0 + (90 * i) / n);
      out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
  });
  return out;
};
// выпуклая оболочка (монотонная цепь)
const hull = (pts: P[]): P[] => {
  const ps = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: P, a: P, b: P) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo: P[] = [];
  for (const p of ps) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  const up: P[] = [];
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};
// Силуэт карточки вместе с толщиной картона. Толщина всегда видна сверху и
// справа на экране, поэтому сдвиг ребра задаётся в мировых осях и переводится
// в оси повёрнутой карточки (поворот на −rot).
const CARD_PTS = roundRectPts(-CARD.w / 2, -CARD.h, CARD.w, CARD.h, CARD.r);
const cardSolid = (rot: number) => {
  const e = rotP(CARD.edge, -rot);
  return poly(hull([...CARD_PTS, ...CARD_PTS.map((p) => ({ x: p.x + e.x, y: p.y + e.y }))]));
};

const smallLeaf = (L: number) => {
  const W = L * 0.36;
  return `M 0 0 C ${f(L * 0.28)} ${f(-W)} ${f(L * 0.72)} ${f(-W)} ${f(L)} 0 C ${f(L * 0.72)} ${f(W)} ${f(L * 0.28)} ${f(W)} 0 0 Z`;
};

const CardPicture: React.FC<{ kind: CardKind }> = ({ kind }) => {
  if (kind === "sun") {
    const c = { x: 0, y: -24 };
    return (
      <g>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * TAU + Math.PI / 8;
          return <line key={i} x1={f(c.x + Math.cos(a) * 10.6)} y1={f(c.y + Math.sin(a) * 10.6)} x2={f(c.x + Math.cos(a) * 14)} y2={f(c.y + Math.sin(a) * 14)} stroke="#f0ac2e" strokeWidth={2.3} strokeLinecap="round" />;
        })}
        <circle cx={c.x} cy={c.y} r={7.8} fill="#f8c94a" stroke="#cf8a28" strokeWidth={0.9} />
        {/* тень снизу — заливной серп, концы на краю диска (не дуга-«улыбка») */}
        <path d={`M ${f(c.x - 7.11)} ${f(c.y + 3.2)} A 7.8 7.8 0 0 0 ${f(c.x + 7.11)} ${f(c.y + 3.2)} A 9.5 9.5 0 0 1 ${f(c.x - 7.11)} ${f(c.y + 3.2)} Z`} fill="#e9a632" opacity={0.45} />
        <circle cx={c.x + 2.6} cy={c.y - 2.6} r={2.6} fill="#fff0b0" opacity={0.85} />
      </g>
    );
  }
  if (kind === "drop") {
    const d = "M 0 -39 C 1.6 -34.5 8.6 -28.5 8.6 -20.6 A 8.6 8.6 0 0 1 -8.6 -20.6 C -8.6 -28.5 -1.6 -34.5 0 -39 Z";
    return (
      <g>
        <ellipse cx={0} cy={-8.6} rx={6.4} ry={1.3} fill="#bcd9ea" opacity={0.8} />
        <path d={d} fill="#4f9fd8" stroke="#2c6c9c" strokeWidth={0.9} strokeLinejoin="round" />
        <path d="M -7.2 -22 A 7.4 7.4 0 0 0 3.5 -13.6 A 8.6 8.6 0 0 1 -7.2 -22 Z" fill="#2f7fbd" opacity={0.55} />
        <ellipse cx={3.6} cy={-24.4} rx={1.6} ry={3.6} transform="rotate(18 3.6 -24.4)" fill="#ffffff" opacity={0.85} />
        <circle cx={1.9} cy={-30.2} r={0.9} fill="#ffffff" opacity={0.8} />
      </g>
    );
  }
  if (kind === "soil") {
    // камешки — вразброс, разной величины и на разной высоте: никакие два
    // одинаковых не стоят рядом по горизонтали над третьим (не складываются в «лицо»)
    const pebbles: [number, number, number, number][] = [
      [-9.6, -16.6, 2.3, 1.5],
      [-6.1, -14.4, 1.2, 0.85],
      [7.6, -12.4, 1.8, 1.2],
      [10.0, -5.4, 2.6, 1.7],
      [-10.6, -6.0, 1.5, 1.0],
    ];
    const crumbs: [number, number, number][] = [
      [-4, -17.5, 0.7],
      [1.5, -13.2, 0.6],
      [10.6, -13.4, 0.75],
      [-12, -12, 0.6],
      [4.4, -9.5, 0.7],
      [-6.6, -10.6, 0.55],
      [12.2, -4.6, 0.6],
      [0.8, -4.2, 0.65],
    ];
    return (
      <g>
        <path d="M -16 -21.2 C -10 -23.2 -5 -20.6 0 -22 C 5 -23.4 10 -21 16 -22.2 L 16 -2 L -16 -2 Z" fill="#8f5d37" stroke="#5e3a22" strokeWidth={0.8} />
        <path d="M -16 -11.2 C -7 -12.6 3 -10 16 -11.6 L 16 -2 L -16 -2 Z" fill="#6d4429" />
        <path d="M -16 -20.4 C -10 -22.4 -5 -19.8 0 -21.2 C 5 -22.6 10 -20.2 16 -21.4" fill="none" stroke="#b07a4e" strokeWidth={1} opacity={0.8} />
        {crumbs.map(([cx, cy, r], i) => (
          <circle key={`c${i}`} cx={cx} cy={cy} r={r} fill={i % 2 ? "#4c2f1b" : "#b4835a"} />
        ))}
        {pebbles.map(([cx, cy, rx, ry], i) => (
          <g key={`p${i}`}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#cdb99a" stroke="#7e6a52" strokeWidth={0.5} />
            <ellipse cx={cx + rx * 0.3} cy={cy - ry * 0.35} rx={rx * 0.35} ry={ry * 0.28} fill="#f1e6d2" opacity={0.8} />
          </g>
        ))}
        {[-12.5, -11, -5.5, -4, 3.5, 5, 10.5, 12].map((gx, i) => (
          <path key={`g${i}`} d={`M ${f(gx)} ${f(-21.6 + Math.sin(gx * 0.4) * 0.6)} q ${f(i % 2 ? 0.8 : -0.6)} -2 ${f(i % 2 ? 0.4 : -0.9)} ${f(-3.2 - (i % 3) * 0.5)}`} fill="none" stroke="#5f9e4c" strokeWidth={1} strokeLinecap="round" />
        ))}
      </g>
    );
  }
  // wind: листья летят по диагонали снизу-слева вверх-вправо; рядом, не касаясь
  // листьев, — мягкие линии движения воздуха с завитком на конце
  const gust = (sx: number, sy: number, ang: number, len: number, amp: number, curl: boolean) => {
    const d = { x: Math.cos(rad(ang)), y: Math.sin(rad(ang)) };
    const up = { x: d.y, y: -d.x }; // поперёк, «вверх» от направления
    const pts: P[] = [];
    for (let i = 0; i <= 20; i++) {
      const u = (len * i) / 20;
      const w = amp * Math.sin((1.5 * Math.PI * u) / len);
      pts.push({ x: sx + d.x * u + up.x * w, y: sy + d.y * u + up.y * w });
    }
    if (curl) {
      const e = pts[pts.length - 1];
      const rc = 3.3;
      const c = { x: e.x + up.x * rc, y: e.y + up.y * rc };
      const a0 = Math.atan2(e.y - c.y, e.x - c.x);
      // открытый завиток (меньше витка), без замкнутой «петли»
      for (let i = 1; i <= 18; i++) {
        const k = i / 18;
        const r = rc * (1 - 0.32 * k);
        const a = a0 - k * 0.78 * TAU;
        pts.push({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r });
      }
    }
    return poly(pts, false);
  };
  const lines = [gust(-13.6, -16.5, -14, 8.5, 0.7, false), gust(-13.6, -28.5, -15, 11.5, 0.8, true), gust(0.5, -6.2, -12, 9, 0.6, true)];
  const leaves: [number, number, number, number, string][] = [
    [-6.4, -9.6, -24, 8.4, "#5d9a4c"],
    [0.6, -19.2, -66, 8.0, "#88bf5e"],
    [7, -28.6, -14, 8.6, "#6fae5a"],
    [10.6, -38.6, -56, 7.4, "#7cb757"],
  ];
  return (
    <g>
      {lines.map((d, i) => (
        <path key={`l${i}`} d={d} fill="none" stroke="#6f97b0" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {leaves.map(([lx, ly, a, L, c], i) => (
        <g key={`v${i}`} transform={`translate(${f(lx - L / 2)} ${f(ly)}) rotate(${f(a)} ${f(L / 2)} 0)`}>
          <path d={smallLeaf(L)} fill={c} stroke="#3f6e34" strokeWidth={0.8} strokeLinejoin="round" />
          <path d={`M 0.6 0 L ${f(L * 0.85)} 0`} stroke="#3f7a36" strokeWidth={0.55} />
          <path d={`M 0 0 l -1.8 0.6`} stroke="#3f6e34" strokeWidth={0.8} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

// Восьмиконечная звезда (контур двух наложенных квадратов с полустороной a).
const star8 = (a: number) =>
  poly(
    Array.from({ length: 16 }, (_, i) => {
      const r = i % 2 === 0 ? a * Math.SQRT2 : a / Math.cos(Math.PI / 8);
      const ang = (i * Math.PI) / 8 - Math.PI / 2;
      return { x: r * Math.cos(ang), y: r * Math.sin(ang) };
    }),
  );

// Рубашка: двойная рамка, ромбики в углах и восьмиконечная звезда; в её центре —
// маленькая сплошная звёздочка (кружок-точка в звезде читался бы как глаз).
const CardBackDesign: React.FC = () => (
  <g>
    <path d={roundRect(-15, -45, 30, 42, 2)} fill="none" stroke="#b9965a" strokeWidth={1.1} />
    <path d={roundRect(-12.6, -42.6, 25.2, 37.2, 1.4)} fill="none" stroke="#b9965a" strokeWidth={0.55} />
    <g transform="translate(0 -24)">
      <rect x={-4.4} y={-4.4} width={8.8} height={8.8} fill="#e8dbbd" stroke="#b9965a" strokeWidth={0.8} />
      <rect x={-4.4} y={-4.4} width={8.8} height={8.8} fill="#e8dbbd" stroke="#b9965a" strokeWidth={0.8} transform="rotate(45)" />
      <path d={star8(1.25)} fill="#b9965a" />
    </g>
    {[
      [-12.6, -42.6],
      [12.6, -42.6],
      [-12.6, -5.4],
      [12.6, -5.4],
    ].map(([cx, cy], i) => (
      <rect key={i} x={cx - 1.3} y={cy - 1.3} width={2.6} height={2.6} transform={`rotate(45 ${cx} ${cy})`} fill="#b9965a" />
    ))}
  </g>
);

// Карточка: (x, y) — середина нижнего края; rot — поворот вокруг этой точки;
// lean (0…1) — наклон назад, как в подставке; back — оборотная сторона.
export const Card: React.FC<{ x: number; y: number; s?: number; kind: CardKind; rot?: number; back?: boolean; lean?: number; shadow?: boolean }> = ({ x, y, s = 1, kind, rot = 0, back = false, lean = 0, shadow = false }) => {
  const uid = useUid("card");
  const { w, h, r } = CARD;
  const ln = clamp01(lean);
  const lm = `matrix(1 0 ${f(-0.036 * ln)} ${f(1 - 0.045 * ln)} 0 0)`;
  const face = roundRect(-w / 2, -h, w, h, r);
  return (
    <g>
      {shadow ? <ellipse cx={f(x - 2.5 * s)} cy={f(y + 0.3 * s)} rx={f((w / 2 + 2) * s)} ry={f(1.8 * s)} fill={SHADOW} opacity={0.22} /> : null}
      <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)}) ${lm}`}>
        <defs>
          <clipPath id={`${uid}p`}>
            <path d={roundRect(-15, -45, 30, 42, 2)} />
          </clipPath>
        </defs>
        {/* толщина картона; контур силуэта — как у других предметов (OL), но только
            снаружи (paint-order: обводка под заливкой), чтобы узкое ребро не пропало */}
        <path d={cardSolid(rot)} fill="#cfc2a4" stroke={OUTLINE} strokeWidth={2 * OL} strokeLinejoin="round" paintOrder="stroke" />
        <path d={face} fill={back ? "#f1e8d4" : "#fbf7ec"} stroke={OUTLINE} strokeWidth={0.9} strokeLinejoin="round" />
        {back ? (
          <CardBackDesign />
        ) : (
          <g>
            <path d={roundRect(-15, -45, 30, 42, 2)} fill={CARD_BG[kind]} />
            <g clipPath={`url(#${uid}p)`}>
              <CardPicture kind={kind} />
            </g>
            <path d={roundRect(-15, -45, 30, 42, 2)} fill="none" stroke={CARD_ACCENT[kind]} strokeWidth={1.2} />
          </g>
        )}
        {/* мягкий блик бумаги справа сверху */}
        <path d={`M ${f(w / 2 - 1.2)} ${f(-h + 5)} L ${f(w / 2 - 1.2)} ${f(-h + 16)}`} stroke="#ffffff" strokeWidth={0.8} strokeLinecap="round" opacity={0.6} />
      </g>
    </g>
  );
};

// Низкая деревянная подставка с пазом на 4 карточки. (x, y) — середина
// нижнего переднего ребра. RAIL.slots — x нижней середины карточки в пазу
// (уже с учётом глубины паза), RAIL.baseY — её y.
const RAIL_H = 9; // передняя грань
const RAIL_D = 6; // видимая глубина верхней грани
const RAIL_LEN = 184;
const GROOVE = { v0: 0.36, v1: 0.6 }; // доли глубины: передний и задний края паза
const GROOVE_MID = (GROOVE.v0 + GROOVE.v1) / 2;
export const RAIL = {
  len: RAIL_LEN,
  h: RAIL_H,
  d: RAIL_D,
  slots: [-66, -22, 22, 66].map((sx) => sx + DEP * RAIL_D * GROOVE_MID),
  // паз 2.8 ед. глубиной от середины паза (≈2.1 ед. карточки за передней кромкой):
  // скругления нижних углов спрятаны, а цветная внутренняя рамка лица (3 ед. от
  // низа) ещё видна над кромкой
  baseY: -RAIL_H - RAIL_D * GROOVE_MID + 2.8,
  lean: CARD_LEAN,
} as const;
const WOODC = { top: "#c9925f", front: "#a87347", side: "#8a5b36", dark: "#5c3b24", grain: "#b07a4c" } as const;

export const CardRail: React.FC<{ x: number; y: number; s?: number; cards: (CardKind | null)[] }> = ({ x, y, s = 1, cards }) => {
  const hl = RAIL_LEN / 2;
  const tp = (u: number, v: number): P => ({ x: u + DEP * RAIL_D * v, y: -RAIL_H - RAIL_D * v });
  const topQ = (v0: number, v1: number) => poly([tp(-hl, v0), tp(hl, v0), tp(hl, v1), tp(-hl, v1)]);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      {/* тень на столе */}
      <path d={poly([{ x: -hl - 4, y: 1.6 }, { x: hl - 2, y: 1.6 }, { x: hl + 1.5, y: -3 }, { x: -hl - 1, y: -3 }])} fill={SHADOW} opacity={0.24} />
      {/* задняя часть верхней грани и паз */}
      <path d={topQ(GROOVE.v1, 1)} fill={WOODC.top} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={topQ(GROOVE.v0, GROOVE.v1)} fill={WOODC.dark} />
      <path d={`M ${pt(tp(-hl, GROOVE.v1))} L ${pt(tp(hl, GROOVE.v1))}`} stroke={OUTLINE} strokeWidth={0.7} opacity={0.6} />
      {/* тени карточек на задней кромке */}
      {cards.map((c, i) =>
        c ? <path key={`sh${i}`} d={poly([tp(RAIL.slots[i] - 21 - DEP * RAIL_D * GROOVE_MID, GROOVE.v1), tp(RAIL.slots[i] + 14 - DEP * RAIL_D * GROOVE_MID, GROOVE.v1), tp(RAIL.slots[i] + 12 - DEP * RAIL_D * GROOVE_MID, 0.92), tp(RAIL.slots[i] - 23 - DEP * RAIL_D * GROOVE_MID, 0.92)])} fill={SHADOW} opacity={0.18} /> : null,
      )}
      {cards.map((c, i) => (c ? <Card key={`c${i}`} x={RAIL.slots[i]} y={RAIL.baseY} kind={c} lean={1} /> : null))}
      {/* передняя кромка паза перекрывает низ карточек */}
      <path d={topQ(0, GROOVE.v0)} fill={WOODC.top} />
      <path d={`M ${pt(tp(-hl, GROOVE.v0))} L ${pt(tp(hl, GROOVE.v0))}`} stroke={OUTLINE} strokeWidth={0.9} />
      {/* лёгкая тень карточек на передней кромке */}
      {cards.map((c, i) =>
        c ? <path key={`fs${i}`} d={poly([tp(RAIL.slots[i] - 20.5 - DEP * RAIL_D * GROOVE_MID, GROOVE.v0), tp(RAIL.slots[i] + 13 - DEP * RAIL_D * GROOVE_MID, GROOVE.v0), tp(RAIL.slots[i] + 11 - DEP * RAIL_D * GROOVE_MID, 0.05), tp(RAIL.slots[i] - 22.5 - DEP * RAIL_D * GROOVE_MID, 0.05)])} fill={SHADOW} opacity={0.14} /> : null,
      )}
      {/* передняя и торцевая грани */}
      <path d={poly([{ x: -hl, y: 0 }, { x: hl, y: 0 }, { x: hl, y: -RAIL_H }, { x: -hl, y: -RAIL_H }])} fill={WOODC.front} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={`M ${f(-hl + 14)} ${f(-RAIL_H * 0.45)} q 40 -1.4 80 0 t 70 -0.6`} fill="none" stroke={WOODC.side} strokeWidth={0.9} opacity={0.5} />
      <path d={`M ${f(-hl + 2)} ${f(-RAIL_H + 1.4)} L ${f(hl - 2)} ${f(-RAIL_H + 1.4)}`} stroke="#c58e5c" strokeWidth={0.9} opacity={0.7} />
      <path d={poly([{ x: hl, y: 0 }, tp(hl, 0), tp(hl, 1), { x: hl + DEP * RAIL_D, y: -RAIL_D }])} fill={WOODC.side} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      {/* контур верхней грани без заднего ребра (оно уже нарисовано за карточками) */}
      <path d={`M ${pt(tp(-hl, 1))} L ${pt(tp(-hl, 0))} L ${pt(tp(hl, 0))} L ${pt(tp(hl, 1))}`} fill="none" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
    </g>
  );
};

// Стопка карточек рубашкой вверх, лежит на столе в косой проекции столешницы.
// (x, y) — середина переднего нижнего ребра стопки.
// Контур стопки: снаружи — STACK_OL (только наружу, подложкой под гранями), внутри
// (рёбра между карточками, перегиб верх/бок) — тонкие линии STACK_IN: картон тонкий
// (2 ед.), и толстые линии на каждом ребре слили бы бок стопки в тёмную полосу.
const STACK_OL = 1.15;
const STACK_IN = 0.8;
export const CardStack: React.FC<{ x: number; y: number; s?: number; n: number }> = ({ x, y, s = 1, n }) => {
  const cnt = Math.max(0, Math.min(4, Math.round(n)));
  if (cnt === 0) return null;
  const { w, h, thick } = CARD;
  const dp = h * K; // видимая глубина лежащей карточки
  const dv = { x: DEP * dp, y: -dp };
  const cards = Array.from({ length: cnt }, (_, i) => {
    const jx = i === 0 ? 0 : (hash01(i * 17 + 3) - 0.5) * 1.8;
    const jv = i === 0 ? 0 : (hash01(i * 29 + 7) - 0.5) * 0.9;
    const y0 = -i * thick;
    const FL = { x: -w / 2 + jx + dv.x * jv * 0.1, y: y0 + jv * 0.6 };
    return { FL, y0 };
  });
  const quad = (FL: P, lift: number) => {
    const a = { x: FL.x, y: FL.y - lift };
    const b = { x: FL.x + w, y: FL.y - lift };
    return [a, b, { x: b.x + dv.x, y: b.y + dv.y }, { x: a.x + dv.x, y: a.y + dv.y }];
  };
  const top = cards[cnt - 1];
  const tq = quad(top.FL, thick);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <path d={poly([{ x: -w / 2 - 4, y: 1.4 }, { x: w / 2 - 1, y: 1.4 }, { x: w / 2 + dv.x - 2, y: dv.y + 0.5 }, { x: -w / 2 + dv.x - 5, y: dv.y + 0.5 }])} fill={SHADOW} opacity={0.24} />
      {/* наружный контур всей стопки */}
      {cards.map(({ FL }, i) => (
        <path key={`o${i}`} d={poly(hull([...quad(FL, 0), ...quad(FL, thick)]))} fill={OUTLINE} stroke={OUTLINE} strokeWidth={2 * STACK_OL} strokeLinejoin="round" />
      ))}
      {cards.map(({ FL }, i) => {
        const lo = quad(FL, 0);
        const hi = quad(FL, thick);
        return (
          <g key={i}>
            <path d={poly([lo[1], lo[2], hi[2], hi[1]])} fill="#cbbd9f" stroke={OUTLINE} strokeWidth={STACK_IN} strokeLinejoin="round" />
            <path d={poly([lo[0], lo[1], hi[1], hi[0]])} fill="#e3d8bf" stroke={OUTLINE} strokeWidth={STACK_IN} strokeLinejoin="round" />
            <path d={poly(hi)} fill="#f1e8d4" stroke={OUTLINE} strokeWidth={STACK_IN} strokeLinejoin="round" />
          </g>
        );
      })}
      {/* рубашка верхней карточки — тот же узор, что у стоящей карточки, лёжа в косой проекции */}
      <g transform={`matrix(1 0 ${f(-K * DEP)} ${f(K)} ${f(tq[0].x + w / 2)} ${f(tq[0].y)})`}>
        <CardBackDesign />
      </g>
    </g>
  );
};

// =====================================================================
// 5. Закрытый Коран на деревянной подставке (рехаль) на тумбе
// =====================================================================
// (x, y) — середина основания подставки на верхней доске тумбы. Подставка
// закрывает старый простой рисунок подставки из комнаты (линии на
// CABINET.x+90…+210); cover — полоска верхней доски тумбы под ножками, чтобы
// скругления старых линий не выглядывали ниже края.
// standW — ширина основания подставки (нижняя передняя доска); cover-полоска
// тумбы на 4 ед. шире с каждой стороны.
export const QURAN = { w: 82, h: 106, thick: 14, bottom: -44, standW: 136, lean: 0.08, shorten: 0.96, cover: "#2f6b4f", gold: "#d8b45c" } as const;

// lightFrom — с какой стороны окно: тумба стоит правее окна, поэтому по
// умолчанию свет слева (блик сверху и слева, тень справа и снизу).
export const QuranOnStand: React.FC<{ x: number; y: number; s?: number; cover?: boolean; lightFrom?: "left" | "right" }> = ({ x, y, s = 1, cover = true, lightFrom = "left" }) => {
  const Q = QURAN;
  const y0 = Q.bottom;
  const y1 = y0 - Q.h;
  const hw = Q.w / 2;
  const dpb = Q.thick * K;
  const dv = { x: DEP * dpb, y: -dpb };
  const m = lightFrom === "left" ? -1 : 1; // зеркалит блик и тень
  // книга и задняя доска откинуты назад: верх уходит в глубину (вправо) и
  // чуть укорачивается; низ (y0) остаётся на шарнире
  const lean = `matrix(1 0 ${f(-QURAN.lean)} ${f(QURAN.shorten)} ${f(QURAN.lean * y0)} ${f(y0 * (1 - QURAN.shorten))})`;
  const gold = Q.gold;
  const cy = (y0 + y1) / 2;
  const sw = Q.standW / 2; // полуширина основания подставки (68)
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      {cover ? (
        <g>
          <rect x={f(-sw - 4)} y={0.9} width={f(2 * sw + 8)} height={6.5} fill="#c99a68" />
          <line x1={f(-sw - 4)} y1={0} x2={f(sw + 4)} y2={0} stroke={OUTLINE} strokeWidth={2} />
        </g>
      ) : null}
      {/* контактная тень — от света: при свете слева уходит вправо */}
      <ellipse cx={f(-4 * m)} cy={-1.4} rx={f(sw - 2)} ry={3} fill={SHADOW} opacity={0.2} />
      {/* верхняя доска подставки за книгой */}
      <path d="M -52 -46 L 52 -46 L 51 -92 Q 51 -97 46 -97 L -46 -97 Q -51 -97 -51 -92 Z" transform={lean} fill="#93623b" stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
      <path d="M -47 -50 L -47 -92 M 47 -50 L 47 -92" transform={lean} stroke="#7a4f2e" strokeWidth={1.4} />
      {/* нижняя передняя доска с резной аркой */}
      <path d={`M ${f(-sw)} 0 L ${f(sw)} 0 L 52 -46 L -52 -46 Z`} fill="#a87347" stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
      <path d="M -38 0 C -38 -13 -15 -21 0 -29 C 15 -21 38 -13 38 0 Z" fill="#5c3b24" stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M -30 0 C -30 -10 -12 -16.5 0 -23 C 12 -16.5 30 -10 30 0" fill="none" stroke="#4a2f1c" strokeWidth={1.2} opacity={0.7} />
      <path d="M -60.5 -3 L -48.6 -41.6 L 48.6 -41.6 L 60.5 -3" fill="none" stroke="#8a5b36" strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M -50.2 -44 L 50.2 -44" stroke="#c9925f" strokeWidth={1.4} opacity={0.8} />
      <path d="M 0 -40.6 L 4.6 -36 L 0 -31.4 L -4.6 -36 Z" fill="#c9925f" stroke="#7a4f2e" strokeWidth={1} />
      {[-1, 1].map((k) => (
        <path key={k} d={`M ${f(k * 44)} -12 L ${f(k * 46.6)} -9.4 L ${f(k * 44)} -6.8 L ${f(k * 41.4)} -9.4 Z`} fill="#c9925f" stroke="#7a4f2e" strokeWidth={0.9} />
      ))}
      {/* шарнир */}
      <rect x={-54} y={-48.5} width={108} height={5.5} rx={2} fill="#8a5b36" stroke={OUTLINE} strokeWidth={1.6} />
      {[-48, 48].map((px) => (
        <circle key={px} cx={px} cy={-45.75} r={1.6} fill="#4a2f1c" />
      ))}
      {/* книга */}
      <g transform={lean}>
        {/* верхний срез: страницы и края переплёта */}
        <path d={poly([{ x: -hw, y: y1 }, { x: hw, y: y1 }, { x: hw + dv.x, y: y1 + dv.y }, { x: -hw + dv.x, y: y1 + dv.y }])} fill="#f3ead2" stroke={OUTLINE} strokeWidth={1.8} strokeLinejoin="round" />
        {[0.3, 0.5, 0.7].map((k) => (
          <path key={k} d={`M ${f(-hw + 2 + dv.x * k)} ${f(y1 + dv.y * k)} L ${f(hw - 1 + dv.x * k)} ${f(y1 + dv.y * k)}`} stroke="#d8caa4" strokeWidth={0.5} />
        ))}
        {/* корешок справа (книга открывается справа налево) */}
        <path d={poly([{ x: hw, y: y0 }, { x: hw, y: y1 }, { x: hw + dv.x, y: y1 + dv.y }, { x: hw + dv.x, y: y0 + dv.y }])} fill="#245a41" stroke={OUTLINE} strokeWidth={1.8} strokeLinejoin="round" />
        {[0.12, 0.16, 0.84, 0.88].map((k) => (
          <path key={k} d={`M ${f(hw)} ${f(y1 + (y0 - y1) * k)} l ${f(dv.x)} ${f(dv.y)}`} stroke={gold} strokeWidth={0.9} />
        ))}
        {/* лицевая крышка */}
        <path d={roundRect(-hw, y1, Q.w, Q.h, 2.4)} fill={Q.cover} stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
        {/* тень — со стороны от окна и снизу, блик — сверху и со стороны окна */}
        <path d={`M ${f(m * (-hw + 1))} ${f(y1 + 3)} L ${f(m * (-hw + 1))} ${f(y0 - 3)} Q ${f(m * (-hw + 1))} ${f(y0 - 1)} ${f(m * (-hw + 3))} ${f(y0 - 1)} L ${f(m * (hw - 3))} ${f(y0 - 1)}`} fill="none" stroke="#244f3b" strokeWidth={3} opacity={0.55} />
        <path d={`M ${f(m * (-hw + 4))} ${f(y1 + 1.4)} L ${f(m * (hw - 1.4))} ${f(y1 + 1.4)} L ${f(m * (hw - 1.4))} ${f(y0 - 5)}`} fill="none" stroke="#4f8c6c" strokeWidth={1.1} opacity={0.8} />
        {/* золотой геометрический орнамент: двойная рамка, уголки, звезда-медальон
            (ничего круглого и парного по горизонтали — ничто не похоже на глаза) */}
        <path d={roundRect(-hw + 6, y1 + 6, Q.w - 12, Q.h - 12, 1.5)} fill="none" stroke={gold} strokeWidth={1.9} />
        <path d={roundRect(-hw + 9.5, y1 + 9.5, Q.w - 19, Q.h - 19, 1)} fill="none" stroke={gold} strokeWidth={0.8} />
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sy], i) => {
          const cx = sx * (hw - 9.5);
          const cyy = cy + sy * (Q.h / 2 - 9.5);
          return <path key={i} d={`M ${f(cx)} ${f(cyy)} l ${f(-sx * 8)} 0 l ${f(sx * 8)} ${f(-sy * 8)} Z`} fill={gold} opacity={0.95} />;
        })}
        <g transform={`translate(0 ${f(cy)})`}>
          <path d={star8(11)} fill="#285e45" stroke={gold} strokeWidth={1.6} strokeLinejoin="miter" />
          <path d={star8(7.4)} fill="none" stroke={gold} strokeWidth={0.7} strokeLinejoin="miter" />
          {/* в центре — маленькая сплошная звёздочка: кольцо с точкой читалось как глаз */}
          <path d={star8(2.4)} fill={gold} strokeLinejoin="miter" />
          {[-1, 1].map((k) => (
            <path key={k} d={`M 0 ${f(k * 19.5)} l 3.4 ${f(k * 4.4)} l -3.4 ${f(k * 4.4)} l -3.4 ${f(-k * 4.4)} Z`} fill={gold} opacity={0.95} />
          ))}
        </g>
      </g>
      {/* закладка-ленточка из нижнего среза страниц */}
      <path d={`M -27 ${f(y0 + 0.5)} C -27.6 -36 -26.4 -30 -27.2 -22 L -25.2 -24.6 L -23.2 -22 C -22.6 -30 -23.6 -36 -23 ${f(y0 + 0.5)} Z`} fill="#b5443a" stroke={OUTLINE} strokeWidth={1} strokeLinejoin="round" />
    </g>
  );
};

// =====================================================================
// 6. Солнечное пятно на столешнице
// =====================================================================
// (x, y) — центр пятна на поверхности стола; w — ширина; k — сила (0…1).
// Пятно — свет из окна: четыре мягких «стекла» с тенью от переплёта.
export const SunPatch: React.FC<{ x: number; y: number; s?: number; w?: number; k?: number; id?: string }> = ({ x, y, s = 1, w = 120, k = 1, id }) => {
  const kk = clamp01(k);
  if (kk <= 0) return null;
  const uid = id ?? `sunpatch-${Math.round(x * 10)}-${Math.round(y * 10)}-${Math.round(w)}`;
  const dp = w * 0.3;
  const dv = { x: DEP * dp, y: -dp };
  const at = (u: number, v: number): P => ({ x: -w / 2 + u * w + dv.x * (v - 0.5), y: dv.y * (v - 0.5) });
  const gu = 0.025;
  const gv = 0.05;
  const panes: [number, number, number, number][] = [
    [0, 0.5 - gu, 0, 0.45 - gv],
    [0.5 + gu, 1, 0, 0.45 - gv],
    [0, 0.5 - gu, 0.45 + gv, 1],
    [0.5 + gu, 1, 0.45 + gv, 1],
  ];
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`} opacity={0.35 * kk}>
      <defs>
        <filter id={uid} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation={3.2} />
        </filter>
      </defs>
      <g filter={`url(#${uid})`}>
        {panes.map(([u0, u1, v0, v1], i) => (
          <path key={i} d={poly([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)])} fill="#fff1c8" />
        ))}
      </g>
    </g>
  );
};
