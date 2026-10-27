// Крупный план лодочки (1920×1080) на высоте стола со стороны камеры комнаты:
// лодочка стоит на нижнем свободном поле большого листа, за краем листа —
// дерево столика, дальше не в фокусе — свитер Амира (слева) и футболка
// Юсуфа (справа) и тёплая стена. Руки детей входят сверху: Амира — слева
// сверху, Юсуфа — справа сверху (направление на экране не меняется, руки не
// перекрещиваются). Всё состояние — из BoatPlan по номеру кадра f.
import { useId } from "react";
import { BoatBack, BoatDefs, BoatFlap, BoatHull, BoatShadow } from "./boat";
import { BOAT_GEOM, BOAT_GRIPS, BOAT_LENGTH_MM, HINGE_MID, boatLocalToWorld, boatScale, boatTransform, flapCorner, pinchIndexTip, type BoatPlace, type Vec } from "./boatModel";
import type { BoatPlan, CloseHandState, HandGrip, HandShape } from "./boatPlan";
import { DESK } from "./layout";

// ---------- Постановка кадра ----------
export const CLOSE = {
  boatX: 836, // центр контакта днища на экране (лодочка чуть левее центра)
  boatY: 776,
  boatW: 760,
  sheetEdgeY: 664, // дальний (у детей) край листа за лодочкой
  tableEdgeY: 588, // дальний край столика
} as const;
const PX_PER_MM = CLOSE.boatW / BOAT_LENGTH_MM;

// Где лодочка на крупном плане при данном положении на столе (мм).
// Путь по столу (сцены 5 и 7) длиннее кадра, поэтому смещение от места у
// дерева сжато: камера ведёт лодочку (см. closePan), и лодочка с рукой
// видны с самого начала переноса, а не влетают в кадр в конце.
const PATH_GAIN_X = 0.18;
const PATH_GAIN_Y = 0.1;
const clampN = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerpV2 = (p: Vec, q: Vec, t: number): Vec => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
export const closeBoatPlace = (desk: Vec, lift: number, tilt: number, pivot: Vec): BoatPlace => {
  const dx = (desk.x - DESK.boatByTree.x) * PX_PER_MM;
  const dv = desk.y - DESK.boatByTree.y; // + — ближе к камере
  return {
    x: CLOSE.boatX + dx * PATH_GAIN_X,
    y: CLOSE.boatY + clampN(dv * PX_PER_MM * PATH_GAIN_Y, -60, 120),
    w: CLOSE.boatW * (1 + clampN(dv * 0.0003, -0.05, 0.08)),
    lift,
    tilt,
    pivot,
  };
};
// Панорама камеры за лодочкой (px экрана): фон и лист сдвигаются в сторону,
// противоположную оставшемуся пути лодочки. У дерева — 0.
export const closePan = (desk: Vec): Vec => {
  const p = closeBoatPlace(desk, 0, 0, BOAT_GRIPS.sail);
  return { x: -(p.x - CLOSE.boatX) * 0.4, y: -(p.y - CLOSE.boatY) * 0.4 };
};

// ====================================================================
// Рука крупным планом
// ====================================================================
// Каноническая кисть (px при scale = 1): (0, 0) — середина запястья, пальцы
// вдоль +y, большой палец на +x (side = −1 зеркалит). Вид — тыльная сторона
// кисти (видны ногти и костяшки).
type FingerDef = { readonly base: Vec; readonly len: readonly [number, number, number]; readonly w: readonly [number, number, number, number] };
type FP = { readonly a: number; readonly b: readonly [number, number, number]; readonly f: readonly [number, number, number] };
type Pose = { readonly fingers: readonly [FP, FP, FP, FP]; readonly thumb: FP };

const FINGER_DEFS: readonly FingerDef[] = [
  { base: { x: 39, y: 147 }, len: [56, 35, 29], w: [31, 29, 27, 25] }, // указательный
  { base: { x: 12, y: 155 }, len: [62, 39, 31], w: [32, 30, 28, 26] }, // средний
  { base: { x: -15, y: 151 }, len: [58, 37, 29], w: [30, 28, 26, 24] }, // безымянный
  { base: { x: -40, y: 140 }, len: [45, 29, 25], w: [26, 24, 22, 21] }, // мизинец
];
const THUMB_DEF: FingerDef = { base: { x: 46, y: 26 }, len: [88, 56, 44], w: [42, 35, 31, 28] };
const PALM: readonly Vec[] = [
  { x: -40, y: -8 },
  { x: 38, y: -8 },
  { x: 47, y: 30 },
  { x: 52, y: 84 },
  { x: 53, y: 126 },
  { x: 47, y: 150 },
  { x: 28, y: 158 },
  { x: 12, y: 163 },
  { x: -4, y: 160 },
  { x: -18, y: 158 },
  { x: -32, y: 153 },
  { x: -46, y: 144 },
  { x: -55, y: 122 },
  { x: -55, y: 80 },
  { x: -49, y: 32 },
];

const fp = (a: number, b: readonly [number, number, number], f: readonly [number, number, number]): FP => ({ a, b, f });
// Согнутые пальцы (вид с тыла): из-под костяшек виден только короткий
// округлый бугорок первой фаланги, дальше палец уходит под ладонь.
const CURL: readonly [FP, FP, FP] = [fp(5, [4, 0, 0], [0.58, 0, 0]), fp(-1, [3, 0, 0], [0.56, 0, 0]), fp(-7, [2, 0, 0], [0.54, 0, 0])];
// Большой палец при указании/нажиме: прижат сбоку к основанию указательного,
// кончик спрятан под ним (рисуется ПОД пальцами — второго «ногтя» нет).
const THUMB_TUCK = fp(26, [-14, -12, -10], [0.88, 0.55, 0.5]);
const POSES: Record<HandShape, Pose> = {
  relax: {
    fingers: [fp(7, [4, 9, 7], [0.95, 0.88, 0.84]), fp(1, [3, 9, 7], [0.95, 0.88, 0.84]), fp(-6, [1, 8, 7], [0.94, 0.86, 0.82]), fp(-13, [-1, 8, 7], [0.92, 0.84, 0.8])],
    thumb: fp(26, [-8, -8, 0], [1, 0.95, 0.9]),
  },
  point: {
    fingers: [fp(3, [0, -1, -1], [1, 1, 0.98]), ...CURL],
    thumb: THUMB_TUCK,
  },
  press: {
    fingers: [fp(2, [0, 3, -9], [1, 0.97, 0.8]), ...CURL],
    thumb: THUMB_TUCK,
  },
  pinch: {
    // указательный уходит в глубину (укорочен), подушечка большого — напротив его кончика
    fingers: [fp(8, [6, 10, 8], [0.62, 0.42, 0.5]), fp(3, [8, 0, 0], [0.4, 0, 0]), fp(-3, [6, 0, 0], [0.38, 0, 0]), fp(-9, [4, 0, 0], [0.36, 0, 0])],
    thumb: fp(30, [0, 0, 0], [1, 1, 1]), // фаланги подбираются IK к точке напротив кончика указательного
  },
  hold: {
    fingers: [fp(6, [3, 6, 4], [0.92, 0.88, 0.82]), fp(1, [2, 6, 4], [0.92, 0.88, 0.82]), fp(-4, [1, 5, 4], [0.9, 0.86, 0.8]), fp(-9, [0, 5, 4], [0.88, 0.84, 0.78])],
    thumb: fp(30, [0, -4, -2], [0.98, 0.95, 0.92]),
  },
};

export type HandLook = {
  readonly skin: string;
  readonly shade: string;
  readonly nail: string;
  readonly scale: number;
  readonly chub: number; // ширина кисти и пальцев
  readonly len: number; // длина пальцев
  readonly sleeve: { readonly c: string; readonly d: string } | null; // длинный рукав (свитер с манжетой)
  readonly tee: { readonly c: string; readonly d: string } | null; // короткий рукав футболки выше локтя
  readonly arm: readonly [number, number]; // полуширина предплечья у запястья и у локтя (px при chub = 1)
};
export const HAND_LOOKS = {
  amir: { skin: "#EBBE9A", shade: "#D8A57F", nail: "#F5D6C2", scale: 1.1, chub: 1, len: 1, sleeve: { c: "#3E6FB5", d: "#2F5590" }, tee: null, arm: [41, 60] },
  // Юсуф (4 года): кисть меньше, пухлее, пальцы короче, предплечье пухлое
  yusuf: { skin: "#E8B48D", shade: "#D29A73", nail: "#F2CDB4", scale: 0.92, chub: 1.1, len: 0.92, sleeve: null, tee: { c: "#F2C53D", d: "#D9A92C" }, arm: [46, 72] },
} as const satisfies Record<string, HandLook>;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const dirOf = (th: number): Vec => ({ x: Math.sin(rad(th)), y: Math.cos(rad(th)) });
const add = (p: Vec, q: Vec, k = 1): Vec => ({ x: p.x + q.x * k, y: p.y + q.y * k });
const dist = (p: Vec, q: Vec) => Math.hypot(p.x - q.x, p.y - q.y);
const f2 = (n: number) => n.toFixed(2);
const mixColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((x, i) => Math.round(x + (pb[i] - x) * t)).join(",")})`;
};

type Geo = { readonly fingers: readonly FingerDef[]; readonly thumb: FingerDef; readonly palm: readonly Vec[]; readonly pl: number };
const geoFor = (look: HandLook): Geo => {
  const pl = 0.55 + 0.45 * look.len;
  const sc = (d: FingerDef, lenK: number): FingerDef => ({
    base: { x: d.base.x * look.chub, y: d.base.y * pl },
    len: [d.len[0] * lenK, d.len[1] * lenK, d.len[2] * lenK],
    w: [d.w[0] * look.chub, d.w[1] * look.chub, d.w[2] * look.chub, d.w[3] * look.chub],
  });
  return {
    fingers: FINGER_DEFS.map((d) => sc(d, look.len)),
    thumb: sc(THUMB_DEF, 0.5 + 0.5 * look.len),
    palm: PALM.map((p) => ({ x: p.x * look.chub, y: p.y * pl })),
    pl,
  };
};

// Цепочка суставов пальца (4 точки: основание, два сустава, кончик).
const chainOf = (d: FingerDef, p: FP): Vec[] => {
  const pts: Vec[] = [d.base];
  let th = p.a;
  let cur = d.base;
  for (let k = 0; k < 3; k++) {
    th += p.b[k];
    cur = add(cur, dirOf(th), d.len[k] * p.f[k]);
    pts.push(cur);
  }
  return pts;
};

// Большой палец щепотью к цели t (двухзвенная IK, сустав выгнут наружу).
const thumbToward = (d: FingerDef, base: FP, t: Vec): FP => {
  const m = add(d.base, dirOf(base.a), d.len[0] * base.f[0]);
  let l1 = d.len[1] * base.f[1];
  let l2 = d.len[2] * base.f[2];
  const dd = dist(m, t);
  if (dd > (l1 + l2) * 0.995) {
    const k = Math.min(1.3, (dd / (l1 + l2)) * 1.005);
    l1 *= k;
    l2 *= k;
  }
  const dc = clamp(dd, Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01);
  const baseAng = Math.atan2(t.x - m.x, t.y - m.y);
  const A = Math.acos(clamp((l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc), -1, 1));
  const th1 = baseAng + A;
  const j = add(m, { x: Math.sin(th1), y: Math.cos(th1) }, l1);
  const th2 = Math.atan2(t.x - j.x, t.y - j.y);
  // звенья: [пястная (a), проксимальная, ногтевая]
  return { a: base.a, b: [0, deg(th1) - base.a, deg(th2 - th1)], f: [base.f[0], l1 / d.len[1], l2 / d.len[2]] };
};

const lerpFP = (p: FP, q: FP, t: number): FP => ({
  a: lerp(p.a, q.a, t),
  b: [lerp(p.b[0], q.b[0], t), lerp(p.b[1], q.b[1], t), lerp(p.b[2], q.b[2], t)],
  f: [lerp(p.f[0], q.f[0], t), lerp(p.f[1], q.f[1], t), lerp(p.f[2], q.f[2], t)],
});

// Поза формы с решённым большим пальцем (для щепоти — к кончику указательного).
const resolvePose = (geo: Geo, shape: HandShape, thumbOff: Vec): Pose => {
  const p = POSES[shape];
  if (shape !== "pinch") return p;
  const tip = chainOf(geo.fingers[0], p.fingers[0])[3];
  return { fingers: p.fingers, thumb: thumbToward(geo.thumb, p.thumb, add(tip, thumbOff)) };
};

// ---------- Контуры ----------
// Плавный замкнутый контур через точки (Catmull-Rom → кубические Безье).
const smoothClosed = (pts: readonly Vec[]) => {
  const n = pts.length;
  let d = `M${f2(pts[0].x)} ${f2(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f2(c1.x)} ${f2(c1.y)} ${f2(c2.x)} ${f2(c2.y)} ${f2(p2.x)} ${f2(p2.y)}`;
  }
  return d + " Z";
};
// Плавная открытая линия.
const smoothOpen = (pts: readonly Vec[]) => {
  const n = pts.length;
  let d = `M${f2(pts[0].x)} ${f2(pts[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f2(c1.x)} ${f2(c1.y)} ${f2(c2.x)} ${f2(c2.y)} ${f2(p2.x)} ${f2(p2.y)}`;
  }
  return d;
};

type FingerDraw = {
  readonly fill: string;
  readonly outline: string;
  readonly shadeLine: string | null;
  readonly creases: readonly string[];
  readonly nail: { readonly c: Vec; readonly th: number; readonly l: number; readonly w: number } | null;
  readonly knuckle: { readonly c: Vec; readonly r: number } | null;
  readonly tipShade: string | null; // подогнутый палец: конец бугорка уходит под ладонь — темнее
  readonly tip: Vec;
};

// Палец (или большой палец) из суставов: заливка (с заходом в ладонь),
// боковой контур без линии у основания, полоса тени, складки суставов, ноготь.
// webK — где начинается контур (доля первой фаланги от основания); у большого
// пальца внешний край продолжает контур ладони сразу, а внутренний — ниже.
// thumb — доля первой фаланги, с которой начинается внутренний контур
// большого пальца (false — обычный палец).
const fingerDraw = (pts: readonly Vec[], ws: readonly number[], shadeSign: number, webK: number, backLen = 24, thumb: false | number = false): FingerDraw => {
  const P: Vec[] = [pts[0]];
  const W: number[] = [ws[0]];
  for (let i = 1; i < pts.length; i++) {
    if (dist(pts[i], P[P.length - 1]) > 1.2) {
      P.push(pts[i]);
      W.push(ws[i]);
    }
  }
  if (P.length === 1) {
    // вырожденная цепочка: короткий бугорок вниз от основания
    const d0 = pts.length > 1 ? { x: pts[pts.length - 1].x - pts[0].x, y: pts[pts.length - 1].y - pts[0].y } : { x: 0, y: 1 };
    const l0 = Math.hypot(d0.x, d0.y) || 1;
    P.push(add(P[0], { x: d0.x / l0, y: d0.y / l0 }, Math.max(2, ws[0] * 0.55)));
    W.push(ws[1] ?? ws[0]);
  }
  const segDir = (i: number) => {
    const a = P[i];
    const b = P[i + 1];
    const l = dist(a, b) || 1;
    return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
  };
  const nSeg = P.length - 1;
  const dirAt = (i: number) => {
    if (i === 0) return segDir(0);
    if (i >= nSeg) return segDir(nSeg - 1);
    const u = segDir(i - 1);
    const v = segDir(i);
    const l = Math.hypot(u.x + v.x, u.y + v.y) || 1;
    return { x: (u.x + v.x) / l, y: (u.y + v.y) / l };
  };
  const nrm = (d: Vec): Vec => ({ x: d.y, y: -d.x }); // к +x при пальце вниз
  const last = P[nSeg];
  const dl = segDir(nSeg - 1);
  const rt = W[nSeg] / 2;
  const cTip = add(last, dl, -rt);
  const centres = [...P.slice(0, nSeg), cTip];
  const left = centres.map((c, i) => add(c, nrm(dirAt(i)), W[i] / 2));
  const right = centres.map((c, i) => add(c, nrm(dirAt(i)), -W[i] / 2));
  const d0 = dirAt(0);
  const back = add(P[0], d0, -backLen);
  const lb = add(back, nrm(d0), W[0] / 2);
  const rb = add(back, nrm(d0), -W[0] / 2);
  const R = right[right.length - 1];
  const arc = `A${f2(rt)} ${f2(rt)} 0 0 1 ${f2(R.x)} ${f2(R.y)}`;
  const leftPath = smoothOpen([lb, ...left]);
  const rightRev = [...right].reverse();
  // основание: заход в ладонь (пальцы) или скруглённая пятка (большой палец)
  const cap = backLen > 0 ? "" : ` A${f2(W[0] / 2)} ${f2(W[0] / 2)} 0 0 1 ${f2(lb.x)} ${f2(lb.y)}`;
  const fill = `${leftPath} ${arc} ${smoothOpen([R, ...rightRev.slice(1), rb]).replace(/^M[^C]*/, "")}${cap} Z`;
  // контур — от перепонки (≈ треть первой фаланги) вниз, вокруг кончика и вверх
  const web = Math.min(dist(P[0], P[1]) * webK, 30);
  const webIn = thumb !== false ? Math.min(dist(P[0], P[1]) * thumb, 34) : web;
  const lw = add(add(P[0], d0, web), nrm(d0), W[0] / 2);
  const rw = add(add(P[0], d0, webIn), nrm(d0), -W[0] / 2);
  const outline = `${smoothOpen([lw, ...left.slice(1)])} ${arc} ${smoothOpen([R, ...rightRev.slice(1, -1), rw]).replace(/^M[^C]*/, "")}`;
  // полоса мягкой тени вдоль одной стороны пальца
  const sh = centres.slice(0, -1).map((c, i) => add(c, nrm(dirAt(i)), shadeSign * W[i] * 0.24));
  sh.push(add(cTip, nrm(dl), shadeSign * W[nSeg] * 0.2));
  const shadeLine = smoothOpen([add(add(P[0], d0, web * 0.6), nrm(d0), shadeSign * W[0] * 0.24), ...sh.slice(1)]);
  // складки на суставах (только там, где обе соседние фаланги видны целиком)
  const creases: string[] = [];
  const curled = thumb === false && P.length < 4;
  for (let i = 1; i < nSeg && !curled; i++) {
    if (Math.min(dist(P[i - 1], P[i]), dist(P[i], P[i + 1])) < W[i] * 0.6) continue;
    const dI = dirAt(i);
    const nI = nrm(dI);
    const hw = W[i] * 0.24;
    const reps = i === 1 ? [-3, 2.5] : [0];
    for (const o of reps) {
      const c = add(P[i], dI, o);
      const a = add(c, nI, -hw);
      const b = add(c, nI, hw);
      const m = add(c, dI, 2.6);
      creases.push(`M${f2(a.x)} ${f2(a.y)} Q${f2(m.x)} ${f2(m.y)} ${f2(b.x)} ${f2(b.y)}`);
    }
  }
  // ноготь на последней фаланге, если она видна
  let nail: FingerDraw["nail"] = null;
  const full = thumb !== false ? pts.length === 3 && P.length === 3 : pts.length === 4 && P.length === 4;
  if (full) {
    const segL = dist(P[nSeg - 1], P[nSeg]);
    const wl = W[nSeg];
    const l = Math.min(segL * 0.62, wl * 0.95);
    if (l > wl * 0.32) {
      const c = add(last, dl, -(wl * 0.1 + l / 2));
      nail = { c, th: deg(Math.atan2(dl.x, dl.y)), l, w: wl * 0.62 };
    }
  }
  // подогнутый палец: блик на костяшке со стороны запястья, конец бугорка — в тени
  const segL0 = dist(P[0], P[1]);
  const knuckle = curled ? { c: add(P[0], d0, Math.min(segL0 * 0.45, web + rt * 0.5)), r: W[0] * 0.32 } : null;
  let tipShade: string | null = null;
  if (curled) {
    const r = Math.max(2, rt - 3.6);
    const nl = add(cTip, nrm(dl), r);
    const nr = add(cTip, nrm(dl), -r);
    tipShade = `M${f2(nl.x)} ${f2(nl.y)} A${f2(r)} ${f2(r)} 0 0 1 ${f2(nr.x)} ${f2(nr.y)}`;
  }
  return { fill, outline, shadeLine, creases, nail, knuckle, tipShade, tip: last };
};

export type HandPart = "all" | "back" | "front";

// Рука в экранных px: кончик указательного — в точке tip. angle — градусы
// (0 — пальцы вниз; − — вниз-вправо; +  — вниз-влево). side: +1 — большой
// палец справа (рука Амира), −1 — слева (рука Юсуфа). part: "back" — всё,
// кроме большого пальца; "front" — только большой палец (для щепоти через
// бумагу). contactY — экранная y линии, на которую ложатся кончики (поза hold).
// thumbVec — куда (вектор в px экрана от кончика указательного) ставится
// кончик большого пальца в щепоти; без него — по умолчанию для захвата grip.
export const CloseHand: React.FC<{
  readonly uid: string;
  readonly tip: Vec;
  readonly angle: number;
  readonly side: 1 | -1;
  readonly look: HandLook;
  readonly shape: HandShape;
  readonly from?: HandShape;
  readonly mix?: number;
  readonly contact?: number;
  readonly part?: HandPart;
  readonly contactY?: number;
  readonly grip?: HandGrip;
  readonly zoom?: number;
  readonly thumbVec?: Vec;
}> = ({ uid, tip, angle, side, look, shape, from, mix = 1, contact = 0, part = "all", contactY, grip = "none", zoom = 1, thumbVec }) => {
  const geo = geoFor(look);
  const sc = look.scale * zoom;
  const ca = Math.cos(rad(angle));
  const sa = Math.sin(rad(angle));
  // большой палец при щепоти — с другой стороны бумаги, напротив кончика указательного
  const thumbOff: Vec = thumbVec ? { x: (side * (thumbVec.x * ca + thumbVec.y * sa)) / sc, y: (-thumbVec.x * sa + thumbVec.y * ca) / sc } : grip === "rim" ? { x: 6, y: 16 } : { x: 15, y: -2 };
  const pA = resolvePose(geo, from ?? shape, thumbOff);
  const pB = resolvePose(geo, shape, thumbOff);
  const t = clamp(mix);
  let fingers = pA.fingers.map((fq, i) => lerpFP(fq, pB.fingers[i], t)) as unknown as FP[];
  const thumb = lerpFP(pA.thumb, pB.thumb, t);
  // при указании и нажиме большой палец подогнут под указательный — рисуется под пальцами
  const tuckW = (shape === "point" || shape === "press" ? t : 0) + (from === "point" || from === "press" ? 1 - t : 0);
  const thumbUnder = tuckW > 0.5;
  const anchor = chainOf(geo.fingers[0], fingers[0])[3];
  // каноническая точка → экран
  const toScreen = (p: Vec): Vec => {
    const x = (p.x - anchor.x) * side * sc;
    const y = (p.y - anchor.y) * sc;
    return { x: tip.x + x * ca - y * sa, y: tip.y + x * sa + y * ca };
  };
  // поддержка: кончики ложатся на линию contactY (подбор сгиба каждого пальца)
  const holdW = (shape === "hold" ? t : 0) + (from === "hold" ? 1 - t : 0);
  if (contactY !== undefined && holdW > 0 && contact > 0) {
    fingers = fingers.map((fq, i) => {
      if (i === 0) return fq;
      const tipY = (g: number) => toScreen(chainOf(geo.fingers[i], { ...fq, f: [fq.f[0] * g, fq.f[1] * g, fq.f[2] * g] })[3]).y;
      let lo = 0.3;
      let hi = 1.25;
      if (tipY(hi) < contactY) return fq;
      for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2;
        if (tipY(mid) > contactY) hi = mid;
        else lo = mid;
      }
      const g = lerp(1, (lo + hi) / 2, holdW * clamp(contact * 1.4));
      return { ...fq, f: [fq.f[0] * g, fq.f[1] * g, fq.f[2] * g] as const };
    });
  }
  const shadeSign = side; // тень — к правому краю кадра
  const draws = geo.fingers.map((d, i) => fingerDraw(chainOf(d, fingers[i]), d.w, shadeSign, 0.34));
  const tPts = chainOf(geo.thumb, thumb);
  // подогнутый большой палец: внутренний контур начинается под указательным (не царапает ладонь)
  const thumbRaw = fingerDraw(tPts.slice(1), geo.thumb.w.slice(1), shadeSign, 0, 0, thumbUnder ? 1 : 0.55);
  // ноготь большого пальца виден сбоку — уже и смещён к внешнему краю
  const thumbDraw: FingerDraw = thumbUnder
    ? { ...thumbRaw, nail: null }
    : thumbRaw.nail
    ? (() => {
        const n = thumbRaw.nail;
        const r = rad(n.th);
        return { ...thumbRaw, nail: { ...n, w: n.w * 0.72, c: { x: n.c.x + Math.cos(r) * n.w * 0.2, y: n.c.y - Math.sin(r) * n.w * 0.2 } } };
      })()
    : thumbRaw;
  // силуэт ладони с возвышением большого пальца (пястная кость) и перепонкой
  const palmPts = (() => {
    const m0 = tPts[0];
    const m1 = tPts[1];
    const l = dist(m0, m1) || 1;
    const dm = { x: (m1.x - m0.x) / l, y: (m1.y - m0.y) / l };
    const nm = { x: dm.y, y: -dm.x };
    const w0 = geo.thumb.w[0] / 2;
    const w1 = geo.thumb.w[1] / 2;
    const o0 = add(add(m0, nm, w0), dm, 6);
    const o1 = add(m1, nm, w1);
    const i1 = add(add(m1, nm, -w1), dm, 5);
    const webEnd = geo.palm[5];
    // перепонка: у отведённого пальца — впадина, у подогнутого — ровный край (без дырки под ним)
    const webMid = add({ x: (i1.x + webEnd.x) / 2, y: (i1.y + webEnd.y) / 2 }, nm, lerp(-5, 9, clamp(tuckW)));
    const outer = o0.x > geo.palm[2].x ? [o0, o1] : [geo.palm[2], o1];
    return [geo.palm[0], geo.palm[1], ...outer, i1, webMid, ...geo.palm.slice(5)];
  })();

  const id = `${uid}`;
  const sw = 1.7; // контур (канонические px)
  const skinStroke = { stroke: look.shade, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const tr = `translate(${f2(tip.x)} ${f2(tip.y)}) rotate(${f2(angle)}) scale(${f2(side * sc)} ${f2(sc)}) translate(${f2(-anchor.x)} ${f2(-anchor.y)})`;
  const c = clamp(contact);
  const ch = look.chub;

  const fingerEl = (fd: FingerDraw, key: string) => (
    <g key={key}>
      <path d={fd.fill} fill={`url(#${id}-palm)`} />
      {fd.shadeLine ? <path d={fd.shadeLine} fill="none" stroke={look.shade} strokeWidth={7 * ch} strokeLinecap="round" opacity={0.3} /> : null}
      <path d={fd.outline} fill="none" {...skinStroke} />
      {fd.creases.map((cr, k) => (
        <path key={k} d={cr} fill="none" stroke={look.shade} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
      ))}
      {fd.tipShade ? <path d={fd.tipShade} fill="none" stroke={look.shade} strokeWidth={7 * ch} strokeLinecap="round" opacity={0.42} /> : null}
      {fd.knuckle ? <ellipse cx={fd.knuckle.c.x} cy={fd.knuckle.c.y} rx={fd.knuckle.r * 1.2} ry={fd.knuckle.r * 0.8} fill="#FFFFFF" opacity={0.13} /> : null}
      {fd.nail ? (
        <g transform={`translate(${f2(fd.nail.c.x)} ${f2(fd.nail.c.y)}) rotate(${f2(-fd.nail.th)})`}>
          <rect x={-fd.nail.w / 2} y={-fd.nail.l / 2} width={fd.nail.w} height={fd.nail.l} rx={fd.nail.w * 0.46} fill={look.nail} stroke={look.shade} strokeWidth={1.2} opacity={0.95} />
          <path d={`M${f2(-fd.nail.w * 0.18)} ${f2(-fd.nail.l * 0.25)} L${f2(-fd.nail.w * 0.18)} ${f2(fd.nail.l * 0.22)}`} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
        </g>
      ) : null}
    </g>
  );

  const showBack = part !== "front";
  const showFront = part !== "back";
  // мягкие тени касания под кончиками (на бумаге)
  const touchTips = c > 0.02 ? (shape === "hold" || from === "hold" ? draws.map((d) => d.tip) : [draws[0].tip]) : [];
  const forearmW0 = look.arm[0] * ch;
  const forearmW1 = look.arm[1] * ch;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-palm`} x1={-60 * side * ch} y1="0" x2={60 * side * ch} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={look.skin} />
          <stop offset="0.5" stopColor={look.skin} />
          <stop offset="1" stopColor={mixColor(look.skin, look.shade, 0.75)} />
        </linearGradient>
        <linearGradient id={`${id}-arm`} x1={-70 * side * ch} y1="0" x2={70 * side * ch} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={look.sleeve ? look.sleeve.c : look.skin} />
          <stop offset="0.6" stopColor={look.sleeve ? look.sleeve.c : look.skin} />
          <stop offset="1" stopColor={look.sleeve ? look.sleeve.d : look.shade} />
        </linearGradient>
        <filter id={`${id}-touch`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
        <filter id={`${id}-drop`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx={side * 3} dy={9} stdDeviation={7} floodColor="#3A2A20" floodOpacity={0.16} />
        </filter>
      </defs>
      <g transform={tr}>
        {touchTips.map((p, i) => (
          <ellipse key={i} cx={p.x + 3 * side} cy={p.y + 2} rx={12 * ch} ry={6 * ch} fill="#3A2A20" opacity={0.22 * c} filter={`url(#${id}-touch)`} />
        ))}
        {showBack ? (
          <g filter={`url(#${id}-drop)`}>
            {/* предплечье */}
            {look.sleeve ? (
              <g>
                <path d={`M${-forearmW0 - 2} -10 C${-forearmW0 - 8} -300 ${-forearmW1 - 14} -700 ${-forearmW1 - 26} -1200 L${forearmW1 + 26} -1200 C${forearmW1 + 14} -700 ${forearmW0 + 8} -300 ${forearmW0 + 2} -10 Z`} fill={look.skin} />
                <path d={`M${-forearmW0 - 14} -70 C${-forearmW0 - 18} -300 ${-forearmW1 - 22} -700 ${-forearmW1 - 34} -1200 L${forearmW1 + 34} -1200 C${forearmW1 + 22} -700 ${forearmW0 + 18} -300 ${forearmW0 + 14} -70 Z`} fill={`url(#${id}-arm)`} stroke={look.sleeve.d} strokeWidth={3} />
                {/* светлый край рукава со стороны света — рука отделяется от свитера на фоне */}
                <path d={`M${-(forearmW0 + 10) * side} -90 C${-(forearmW0 + 14) * side} -300 ${-(forearmW1 + 18) * side} -700 ${-(forearmW1 + 30) * side} -1200`} fill="none" stroke="#8FB0E0" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
                {[0, 1, 2].map((k) => (
                  <path key={k} d={`M${(-30 + k * 26) * side} ${-160 - k * 70} q ${12 * side} -40 ${4 * side} -90`} fill="none" stroke={look.sleeve!.d} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
                ))}
                {/* манжета в резинку */}
                <rect x={-forearmW0 - 12} y={-84} width={2 * forearmW0 + 24} height={74} rx={14} fill={look.sleeve.c} />
                {Array.from({ length: 11 }, (_, k) => {
                  const x = -forearmW0 - 6 + (k * (2 * forearmW0 + 12)) / 10;
                  return <line key={k} x1={x} y1={-80} x2={x} y2={-14} stroke={look.sleeve!.d} strokeWidth={2.2} opacity={0.5} />;
                })}
                <rect x={-forearmW0 - 12} y={-84} width={2 * forearmW0 + 24} height={74} rx={14} fill="none" stroke={look.sleeve.d} strokeWidth={2} />
                <path d={`M${-forearmW0 - 6} -14 L${forearmW0 + 6} -14`} stroke={look.sleeve.d} strokeWidth={3} opacity={0.6} />
              </g>
            ) : (
              <g>
                <path d={`M${-forearmW0} -6 C${-forearmW0 - 10} -160 ${-forearmW1 - 4} -300 ${-forearmW1 - 2} -420 C${-forearmW1} -700 ${-forearmW1 - 6} -1000 ${-forearmW1 - 10} -1300 L${forearmW1 + 10} -1300 C${forearmW1 + 6} -1000 ${forearmW1} -700 ${forearmW1 + 2} -420 C${forearmW1 + 4} -300 ${forearmW0 + 10} -160 ${forearmW0} -6 Z`} fill={`url(#${id}-arm)`} {...skinStroke} />
                {/* мягкая складка запястья */}
                <path d={`M${-forearmW0 * 0.6} 4 Q 0 12 ${forearmW0 * 0.6} 4`} fill="none" stroke={look.shade} strokeWidth={1.6} opacity={0.55} />
                {look.tee ? (
                  <g>
                    <path d={`M${-forearmW1 - 26} -1300 L${-forearmW1 - 22} -505 Q 0 -488 ${forearmW1 + 22} -505 L${forearmW1 + 26} -1300 Z`} fill={look.tee.c} />
                    <path d={`M${-forearmW1 - 22} -505 Q 0 -488 ${forearmW1 + 22} -505`} fill="none" stroke={look.tee.d} strokeWidth={4} />
                    <path d={`M${(forearmW1 - 6) * side} -520 L${(forearmW1 + 4) * side} -1300`} stroke={look.tee.d} strokeWidth={22} opacity={0.35} />
                  </g>
                ) : null}
              </g>
            )}
            {/* ладонь (тыльная сторона) и основание большого пальца */}
            <path d={smoothClosed(palmPts)} fill={`url(#${id}-palm)`} {...skinStroke} />
            {/* мягкая тень вдоль возвышения большого пальца */}
            <path d={smoothOpen([add(palmPts[2], { x: -14, y: 6 }), add(palmPts[3], { x: -14, y: 0 })])} fill="none" stroke={look.shade} strokeWidth={9} strokeLinecap="round" opacity={0.18} />
            {/* костяшки */}
            {draws.map((d, i) => (
              <ellipse key={i} cx={geo.fingers[i].base.x - 2 * side} cy={geo.fingers[i].base.y - 8} rx={geo.fingers[i].w[0] * 0.3} ry={geo.fingers[i].w[0] * 0.2} fill="#FFFFFF" opacity={0.22} />
            ))}
            {/* подогнутый большой палец — под пальцами */}
            {thumbUnder && showFront ? fingerEl(thumbDraw, "thumb") : null}
            {/* пальцы: от мизинца к указательному (каждый следующий поверх) */}
            {[3, 2, 1, 0].map((i) => fingerEl(draws[i], `f${i}`))}
          </g>
        ) : null}
        {showFront && !(thumbUnder && showBack) ? <g filter={`url(#${id}-drop)`}>{fingerEl(thumbDraw, "thumb")}</g> : null}
      </g>
    </g>
  );
};

// ====================================================================
// Фон: стена, дети не в фокусе, столик (один размытый слой) и лист
// ====================================================================
// pan — сдвиг камеры (px): дальний фон смещается меньше листа (параллакс).
const Backdrop: React.FC<{ readonly uid: string; readonly near: number; readonly pan: Vec }> = ({ uid, near, pan }) => {
  const ax = lerp(0, 120, near); // Амир пересаживается ближе к Юсуфу
  const px0 = pan.x * 0.55;
  const py0 = pan.y * 0.55;
  // свитер Амира на фоне светлее и мягче рукава в фокусе, чтобы рука читалась
  const sweater = mixColor("#3E6FB5", "#F3E4CF", 0.2);
  const sweaterD = mixColor("#2F5590", "#F3E4CF", 0.2);
  return (
    <div style={{ position: "absolute", left: -300 + px0, top: -120 + py0, width: 2520, height: 1320, filter: "blur(11px)" }}>
      <svg width={2520} height={1320} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3E4CF" />
            <stop offset="1" stopColor="#EAD4B6" />
          </linearGradient>
          <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C9A37C" />
            <stop offset="1" stopColor="#D8B994" />
          </linearGradient>
        </defs>
        {/* исходные координаты кадра: (0,0) фона = (−40, −40) экрана */}
        <g transform="translate(260 80)">
          <rect x={-260} y={-80} width={2520} height={1320} fill={`url(#${uid}-wall)`} />
          {/* тёплое пятно света на стене */}
          <ellipse cx={1010} cy={250} rx={520} ry={300} fill="#FFF3DF" opacity={0.6} />
          {/* Амир — синий свитер (слева) */}
          <g transform={`translate(${ax} 0)`}>
            <path d="M-420 1240 L-420 40 C 120 -10 520 -20 700 60 C 780 140 800 400 790 700 L 790 1240 Z" fill={sweater} />
            <path d="M 640 80 C 760 160 790 420 785 700 L 785 1240 L 700 1240 C 712 700 700 300 600 120 Z" fill={sweaterD} opacity={0.5} />
            <path d="M 120 60 C 260 30 420 26 560 60" fill="none" stroke={sweaterD} strokeWidth={26} opacity={0.3} />
            <path d="M 300 300 C 330 420 340 520 330 660" fill="none" stroke={sweaterD} strokeWidth={14} opacity={0.22} />
          </g>
          {/* Юсуф — жёлтая футболка (справа) */}
          <path d="M 2300 1240 L 1180 1240 L 1186 500 C 1190 260 1260 150 1420 120 C 1600 90 1820 100 2300 150 Z" fill="#F2C53D" />
          <path d="M 1186 1240 L 1186 500 C 1190 300 1230 190 1300 150 C 1250 260 1250 600 1260 1240 Z" fill="#D9A92C" opacity={0.6} />
          <path d="M 1500 110 C 1560 160 1660 160 1720 108" fill="none" stroke="#D9A92C" strokeWidth={16} opacity={0.5} />
          {/* столик: дальний край и поверхность за листом */}
          <rect x={-260} y={CLOSE.tableEdgeY + 40 - 14} width={2520} height={1240} fill={`url(#${uid}-wood)`} />
          <rect x={-260} y={CLOSE.tableEdgeY + 40 - 14} width={2520} height={12} fill="#A98058" opacity={0.45} />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M-260 ${CLOSE.tableEdgeY + 62 + k * 22} C 500 ${CLOSE.tableEdgeY + 52 + k * 22} 1200 ${CLOSE.tableEdgeY + 74 + k * 22} 2260 ${CLOSE.tableEdgeY + 60 + k * 22}`} fill="none" stroke="#A9794C" strokeWidth={3} opacity={0.35} />
          ))}
        </g>
      </svg>
    </div>
  );
};

// Лист плаката под лодочкой (в фокусе): кремовая бумага, край у детей.
const SHEET_X0 = -420;
const SHEET_X1 = 2340;
const SHEET_SPECKS = Array.from({ length: 100 }, (_, i) => {
  const hx = Math.sin(i * 91.7 + 13.1) * 43758.5453;
  const hy = Math.sin(i * 57.3 + 7.7) * 24634.6345;
  const ha = Math.sin(i * 33.1 + 3.3) * 12345.678;
  const fa = ha - Math.floor(ha);
  return { u: hx - Math.floor(hx), v: hy - Math.floor(hy), a: fa * Math.PI, l: 3 + fa * 6, light: i % 3 === 0 };
});
const Sheet: React.FC<{ readonly uid: string }> = ({ uid }) => {
  const y0 = CLOSE.sheetEdgeY;
  const w = SHEET_X1 - SHEET_X0;
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sheet`} x1="0" y1={y0} x2="0" y2={1200} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F1E6D0" />
          <stop offset="0.22" stopColor="#F8F0DF" />
          <stop offset="1" stopColor="#F4EAD6" />
        </linearGradient>
        <radialGradient id={`${uid}-light`} cx={960} cy={y0 + 60} r={1300} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* тень края листа на дереве */}
      <rect x={SHEET_X0} y={y0 - 3} width={w} height={8} fill="#5A3E26" opacity={0.18} />
      <rect x={SHEET_X0} y={y0} width={w} height={1220 - y0} fill={`url(#${uid}-sheet)`} />
      <rect x={SHEET_X0} y={y0} width={w} height={1220 - y0} fill={`url(#${uid}-light)`} />
      <line x1={SHEET_X0} y1={y0 + 1} x2={SHEET_X1} y2={y0 + 1} stroke="#FFFFFF" strokeWidth={2} opacity={0.8} />
      {SHEET_SPECKS.map((k, i) => {
        const x = SHEET_X0 + k.u * w;
        const y = y0 + 10 + k.v * (1200 - y0 - 10);
        return <line key={i} x1={x} y1={y} x2={x + Math.cos(k.a) * k.l} y2={y + Math.sin(k.a) * k.l * 0.4} stroke={k.light ? "rgba(255,255,255,0.7)" : "rgba(150,130,100,0.10)"} strokeWidth={1.2} strokeLinecap="round" />;
      })}
    </g>
  );
};

// ====================================================================
// Крупный план
// ====================================================================
type Placed = { readonly st: CloseHandState; readonly tip: Vec; readonly contactY?: number; readonly thumbVec?: Vec };

export const BoatCloseView: React.FC<{ readonly f: number; readonly plan: BoatPlan; readonly foreground?: React.ReactNode }> = ({ f, plan, foreground }) => {
  const uid = `bcv${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const open = plan.open(f);
  const pressed = plan.pressed(f);
  const desk = plan.desk(f);
  const place = closeBoatPlace(desk, plan.lift(f), plan.tilt(f), plan.pivot(f));
  const pan = closePan(desk);
  const tablePlace: BoatPlace = { x: place.x, y: place.y, w: place.w };
  const s = boatScale(place.w);
  const zoom = place.w / CLOSE.boatW;
  const hs = plan.hands(f);
  // экранный вектор между двумя локальными точками лодочки
  const vecW = (a: Vec, b: Vec): Vec => {
    const p = boatLocalToWorld(a, place);
    const q = boatLocalToWorld(b, place);
    return { x: q.x - p.x, y: q.y - p.y };
  };

  const placeHand = (st: CloseHandState | null, who: "amir" | "yusuf"): Placed | null => {
    if (!st || st.visible <= 0.001) return null;
    const p = boatLocalToWorld(st.tip, place);
    // убрана — сдвиг назад вдоль предплечья за верх кадра
    const off = (1 - st.visible) * 980;
    const r = (st.angle * Math.PI) / 180;
    const tip = { x: p.x + Math.sin(r) * off, y: p.y - Math.cos(r) * off };
    const contactY = st.shape === "hold" || st.from === "hold" ? boatLocalToWorld({ x: st.tip.x, y: BOAT_GEOM.deckL.y }, place).y : undefined;
    // щепоть: большой палец — напротив кончика указательного, подушечкой на
    // бумаге: на уголке (ближе к вершине, сгиб остаётся открытым), на краю
    // борта — на лицевой стороне под кромкой
    const usesThumb = st.shape === "pinch" || st.from === "pinch";
    const repair = f >= plan.events.point && f < plan.events.letGo + 30;
    const thumbVec = !usesThumb
      ? undefined
      : who === "amir"
        ? repair
          ? vecW(pinchIndexTip(open), lerpV2(HINGE_MID, flapCorner(open), 0.6))
          : undefined
        : vecW(BOAT_GRIPS.rimLeft, { x: BOAT_GRIPS.rimLeft.x - 2.5, y: BOAT_GRIPS.rimLeft.y + 9 });
    return { st, tip, contactY, thumbVec };
  };
  const amir = placeHand(hs.amir, "amir");
  const yusuf = placeHand(hs.yusuf, "yusuf");

  const handEl = (h: Placed | null, who: "amir" | "yusuf", part: "all" | "back" | "front") =>
    h ? (
      <CloseHand
        key={`${who}-${part}`}
        uid={`${uid}-${who}-${part}`}
        tip={h.tip}
        angle={h.st.angle}
        side={who === "amir" ? 1 : -1}
        look={HAND_LOOKS[who]}
        shape={h.st.shape}
        from={h.st.from}
        mix={h.st.mix}
        contact={h.st.contact}
        part={part}
        contactY={h.contactY}
        grip={h.st.grip}
        zoom={zoom}
        thumbVec={h.thumbVec}
      />
    ) : null;
  // слой «за бумагой» для каждого вида захвата
  const behind = (grip: HandGrip) =>
    [amir && amir.st.grip === grip ? handEl(amir, "amir", "back") : null, yusuf && yusuf.st.grip === grip ? handEl(yusuf, "yusuf", "back") : null];
  const split = (h: Placed | null) => h !== null && (h.st.grip === "sail" || h.st.grip === "rim" || h.st.grip === "flap");
  const bt = boatTransform(place);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "hidden", backgroundColor: "#EFDCC2" }}>
      <Backdrop uid={uid} near={plan.amirNear(f)} pan={pan} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(${pan.x.toFixed(2)} ${pan.y.toFixed(2)})`}>
          <Sheet uid={uid} />
        </g>
        <BoatDefs uid={uid} s={s} />
        <g transform={boatTransform(tablePlace)}>
          <BoatShadow uid={uid} s={s} lift={place.lift} />
        </g>
        {behind("sail")}
        <g transform={bt}>
          <BoatBack uid={uid} s={s} />
        </g>
        {behind("rim")}
        <g transform={bt}>
          <BoatHull uid={uid} s={s} open={open} />
        </g>
        {behind("flap")}
        <g transform={bt}>
          <BoatFlap uid={uid} s={s} open={open} pressed={pressed} />
        </g>
      </svg>
      {foreground ? <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${pan.x.toFixed(2)}px, ${pan.y.toFixed(2)}px)` }}>{foreground}</div> : null}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {split(yusuf) ? handEl(yusuf, "yusuf", "front") : handEl(yusuf, "yusuf", "all")}
        {split(amir) ? handEl(amir, "amir", "front") : handEl(amir, "amir", "all")}
      </svg>
    </div>
  );
};
