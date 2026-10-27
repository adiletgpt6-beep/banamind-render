// «Цветные точки» BM-036: предметы фильма собираются из чётких ярких точек на шестиугольной
// сетке (стабильные позиции, без случайности по кадрам, без размытия и мерцания), могут
// перетекать в другой предмет (morph) и рассыпаться (explode). Формы — простые примитивы в поле
// 200×200: круг, эллипс, прямоугольник, многоугольник, толстая линия, кольцо. Цвет точки — цвет
// последнего примитива, который её накрывает (null — «ластик»). Ключи $a/$b/$c — цвета героя.
import React from "react";
import { C } from "../theme";
import { clamp01 } from "./kit";

type Col = string | null;
type Prim =
  | { t: "c"; x: number; y: number; r: number; col: Col }
  | { t: "e"; x: number; y: number; rx: number; ry: number; col: Col }
  | { t: "r"; x: number; y: number; w: number; h: number; rr: number; col: Col }
  | { t: "p"; pts: [number, number][]; col: Col }
  | { t: "l"; x1: number; y1: number; x2: number; y2: number; w: number; col: Col }
  | { t: "ring"; x: number; y: number; r: number; w: number; col: Col };

const c = (x: number, y: number, r: number, col: Col): Prim => ({ t: "c", x, y, r, col });
const e = (x: number, y: number, rx: number, ry: number, col: Col): Prim => ({ t: "e", x, y, rx, ry, col });
const r = (x: number, y: number, w: number, h: number, col: Col, rr = 0): Prim => ({ t: "r", x, y, w, h, rr, col });
const p = (pts: [number, number][], col: Col): Prim => ({ t: "p", pts, col });
const l = (x1: number, y1: number, x2: number, y2: number, w: number, col: Col): Prim => ({ t: "l", x1, y1, x2, y2, w, col });
const ring = (x: number, y: number, rad: number, w: number, col: Col): Prim => ({ t: "ring", x, y, r: rad, w, col });

const LEATHER = "#dc7a2c";
const LEATHER_D = "#a9521a";
const LEATHER_L = "#f6aa5e";
const SKIN = "#e9b183";
const SAND = "#ecd3a3";
const CAMEL = "#d39a55";
const WHITE = "#ffffff";
const SHEEP = "#f4f1ea";
const LEAF = "#38b26a";
const LEAF_L = "#6fd38f";

// ───────── формы ─────────
export const SHAPES: Record<string, Prim[]> = {
  wallet: [
    e(100, 132, 72, 58, LEATHER_D),
    e(100, 128, 68, 54, LEATHER),
    p([[64, 96], [136, 96], [122, 62], [78, 62]], LEATHER),
    e(100, 58, 34, 11, LEATHER_D),
    r(66, 86, 68, 11, C.gold, 5),
    c(100, 91, 10, C.goldDeep),
    e(74, 128, 10, 24, LEATHER_L),
    e(100, 176, 46, 8, LEATHER_D),
  ],
  walletFull: [
    e(100, 128, 84, 66, LEATHER_D),
    e(100, 124, 80, 62, LEATHER),
    p([[64, 86], [136, 86], [124, 50], [76, 50]], LEATHER),
    e(100, 46, 32, 10, LEATHER_D),
    r(64, 76, 72, 11, C.gold, 5),
    c(100, 81, 10, C.goldDeep),
    e(70, 124, 11, 26, LEATHER_L),
    c(84, 40, 13, C.gold),
    c(110, 36, 13, C.gold),
    c(98, 26, 12, C.goldLight),
  ],
  coin: [c(100, 100, 82, C.goldDeep), c(100, 100, 70, C.gold), ring(100, 100, 54, 7, C.goldDeep), r(88, 68, 24, 64, C.goldDeep, 6), e(68, 70, 12, 22, C.goldLight)],
  chariot: [
    ring(68, 140, 46, 12, C.woodDeep),
    c(68, 140, 10, C.woodDeep),
    l(68, 96, 68, 184, 7, C.wood),
    l(24, 140, 112, 140, 7, C.wood),
    l(37, 109, 99, 171, 7, C.wood),
    l(37, 171, 99, 109, 7, C.wood),
    p([[56, 72], [172, 72], [160, 126], [94, 126]], C.spend),
    r(52, 62, 124, 13, C.goldDeep, 5),
    l(158, 112, 198, 96, 9, C.woodDeep),
  ],
  lyre: [
    l(58, 36, 66, 100, 13, C.goldDeep),
    l(66, 100, 86, 160, 13, C.goldDeep),
    l(142, 36, 134, 100, 13, C.goldDeep),
    l(134, 100, 114, 160, 13, C.goldDeep),
    l(46, 44, 154, 44, 12, C.wood),
    r(70, 150, 60, 22, C.woodDeep, 6),
    l(86, 50, 92, 150, 6, WHITE),
    l(100, 50, 100, 150, 6, WHITE),
    l(114, 50, 108, 150, 6, WHITE),
  ],
  tablet: [
    r(34, 20, 132, 160, C.clayDeep, 16),
    r(38, 22, 124, 152, C.clay, 14),
    ...[48, 70, 92, 114, 136, 158].flatMap((y, i) => [0, 1, 2, 3].map((k) => l(52 + k * 28 + ((i * 7) % 10), y, 66 + k * 28 + ((i * 7) % 10), y, 6, C.clayDeep))),
  ],
  city: [
    r(0, 172, 200, 28, SAND),
    r(52, 86, 96, 40, C.clay),
    r(66, 58, 68, 30, C.clayLight),
    r(80, 36, 40, 24, C.clay),
    r(92, 22, 16, 14, C.gold),
    r(8, 122, 184, 52, C.clayDeep),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => r(10 + i * 24, 110, 13, 14, C.clayDeep)),
    r(84, 132, 32, 42, C.lapis),
    c(100, 132, 16, C.lapis),
    l(26, 172, 32, 112, 6, C.woodDeep),
    e(34, 108, 20, 7, LEAF),
    e(22, 116, 12, 6, LEAF),
    l(176, 172, 170, 116, 6, C.woodDeep),
    e(168, 112, 20, 7, LEAF),
    e(180, 120, 12, 6, LEAF),
  ],
  wall: [
    r(6, 72, 188, 112, C.clayDeep),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => r(8 + i * 24, 52, 14, 22, C.clayDeep)),
    r(6, 96, 188, 6, C.clay),
    r(6, 124, 188, 6, C.clay),
    r(6, 152, 188, 6, C.clay),
    r(78, 112, 44, 72, C.lapis),
    c(100, 112, 22, C.lapis),
    l(100, 96, 100, 184, 5, C.gold),
  ],
  tree: [
    p([[90, 192], [110, 192], [106, 116], [94, 116]], C.wood),
    c(100, 84, 50, LEAF),
    c(62, 104, 32, LEAF),
    c(138, 104, 32, LEAF),
    c(100, 52, 34, LEAF_L),
    c(76, 70, 9, C.gold),
    c(124, 64, 9, C.gold),
    c(104, 104, 9, C.gold),
    c(60, 108, 8, C.gold),
    c(142, 106, 8, C.gold),
  ],
  sprout: [
    e(100, 176, 70, 14, C.woodDeep),
    e(100, 162, 14, 9, C.gold),
    l(100, 154, 100, 110, 7, LEAF),
    p([[100, 116], [66, 96], [76, 122]], LEAF),
    p([[100, 108], [134, 88], [126, 114]], LEAF_L),
  ],
  basket: [
    ring(100, 100, 58, 9, C.woodDeep),
    e(70, 84, 15, 19, WHITE),
    e(98, 78, 15, 19, WHITE),
    e(126, 84, 15, 19, WHITE),
    p([[34, 100], [166, 100], [148, 178], [52, 178]], C.wood),
    r(40, 120, 120, 8, C.woodDeep),
    r(46, 146, 108, 8, C.woodDeep),
    r(28, 92, 144, 15, C.woodDeep, 7),
  ],
  egg: [e(100, 104, 44, 58, "#e8e0d2"), e(100, 100, 40, 54, WHITE), e(84, 80, 8, 14, "#fffaf0")],
  house: [r(48, 92, 104, 90, C.clayLight), p([[36, 96], [100, 38], [164, 96]], C.spend), r(88, 128, 26, 54, C.woodDeep), r(60, 110, 22, 22, C.sky), r(120, 110, 22, 22, C.sky)],
  camel: [
    e(98, 112, 58, 28, CAMEL),
    c(78, 86, 22, CAMEL),
    c(116, 86, 20, CAMEL),
    p([[146, 104], [160, 108], [176, 62], [162, 58]], CAMEL),
    e(176, 56, 17, 10, CAMEL),
    l(62, 130, 58, 184, 9, C.woodDeep),
    l(80, 132, 82, 184, 9, C.woodDeep),
    l(122, 130, 126, 184, 9, C.woodDeep),
    l(138, 128, 144, 184, 9, C.woodDeep),
    l(42, 106, 34, 132, 5, C.woodDeep),
    r(66, 92, 64, 20, C.spend, 6),
    r(66, 104, 64, 5, C.gold),
  ],
  ship: [
    p([[24, 128], [176, 128], [154, 166], [46, 166]], C.wood),
    r(24, 124, 152, 8, C.woodDeep),
    l(100, 34, 100, 128, 6, C.woodDeep),
    p([[106, 42], [106, 118], [164, 118]], WHITE),
    p([[94, 50], [94, 118], [44, 118]], C.paper),
    p([[100, 30], [120, 37], [100, 44]], C.spend),
    e(100, 176, 92, 8, C.sky),
  ],
  gem: [
    p([[100, 30], [154, 78], [100, 176], [46, 78]], C.lapis),
    p([[100, 30], [126, 78], [74, 78]], C.skyLight),
    p([[46, 78], [74, 78], [100, 176]], C.sky),
    p([[154, 78], [126, 78], [100, 176]], "#5d86e8"),
  ],
  shards: [p([[40, 60], [86, 52], [70, 110]], "#cfe6ea"), p([[100, 70], [150, 90], [116, 140]], "#bfdce2"), p([[54, 130], [96, 128], [76, 172]], "#d8eef0"), p([[124, 150], [162, 132], [158, 176]], "#c5e1e6")],
  bag: [
    e(100, 134, 66, 54, "#c99a5b"),
    p([[76, 92], [124, 92], [114, 60], [86, 60]], "#c99a5b"),
    e(100, 58, 22, 8, "#a87b40"),
    r(74, 86, 52, 9, C.goldDeep, 4),
    c(100, 136, 26, C.gold),
    ring(100, 136, 18, 5, C.goldDeep),
    e(74, 130, 9, 22, "#ddb57c"),
  ],
  ox: [
    e(96, 112, 60, 32, "#9b5d36"),
    e(164, 100, 22, 18, "#9b5d36"),
    c(176, 108, 9, "#c98b63"),
    l(158, 86, 146, 66, 7, "#f2e6c8"),
    l(172, 86, 182, 66, 7, "#f2e6c8"),
    l(62, 132, 60, 184, 10, "#6e3f22"),
    l(82, 136, 84, 184, 10, "#6e3f22"),
    l(116, 136, 116, 184, 10, "#6e3f22"),
    l(134, 132, 138, 184, 10, "#6e3f22"),
    l(38, 106, 30, 140, 5, "#6e3f22"),
  ],
  donkey: [
    e(98, 114, 52, 26, "#9aa0ad"),
    e(154, 92, 20, 14, "#9aa0ad"),
    c(168, 98, 9, "#d7dbe3"),
    l(146, 80, 140, 46, 8, "#7f8594"),
    l(158, 80, 160, 46, 8, "#7f8594"),
    l(68, 132, 66, 184, 8, "#6c7180"),
    l(86, 134, 88, 184, 8, "#6c7180"),
    l(114, 134, 114, 184, 8, "#6c7180"),
    l(130, 130, 134, 184, 8, "#6c7180"),
    l(46, 108, 38, 138, 4, "#6c7180"),
  ],
  chest: [
    p([[30, 92], [170, 92], [160, 54], [40, 54]], C.wood),
    r(30, 88, 140, 86, C.woodDeep, 8),
    r(30, 100, 140, 9, C.gold),
    r(30, 152, 140, 9, C.gold),
    r(90, 92, 20, 26, C.gold, 4),
    c(100, 104, 4, C.woodDeep),
  ],
  key: [ring(56, 100, 30, 15, C.gold), r(80, 93, 96, 14, C.gold, 4), r(150, 106, 11, 24, C.gold), r(128, 106, 11, 17, C.gold), c(56, 100, 5, C.goldDeep)],
  door: [r(44, 60, 112, 132, C.clayDeep), c(100, 62, 56, C.clayDeep), r(60, 66, 80, 126, C.skyLight), c(100, 66, 40, C.skyLight), l(100, 30, 100, 192, 4, C.gold), r(58, 186, 84, 8, C.clay)],
  sheep: [
    c(78, 112, 28, "#b9b2a4"),
    c(102, 100, 31, "#b9b2a4"),
    c(126, 112, 28, "#b9b2a4"),
    c(100, 126, 30, "#b9b2a4"),
    c(78, 112, 24, SHEEP),
    c(102, 100, 27, SHEEP),
    c(126, 112, 24, SHEEP),
    c(100, 126, 26, SHEEP),
    c(80, 128, 18, "#e6e1d6"),
    e(150, 102, 13, 17, C.ink),
    l(82, 140, 82, 170, 6, C.ink),
    l(118, 140, 118, 170, 6, C.ink),
  ],
  cake: [c(100, 112, 62, C.goldDeep), c(100, 106, 58, "#f0a43a"), e(100, 98, 44, 26, "#ffcf6a"), e(82, 88, 14, 7, C.goldLight), c(76, 116, 4, C.woodDeep), c(120, 122, 4, C.woodDeep), c(104, 132, 4, C.woodDeep)],
  stone: [r(46, 46, 108, 108, "#d9a700", 26), r(52, 50, 96, 96, "#ffd23f", 22), e(78, 74, 12, 18, "#fff1a6")],
  scroll: [r(40, 28, 120, 148, "#f2e3c4", 8), ...[50, 70, 90, 110, 130].map((y) => r(56, y, 88, 6, "#9c8a6f", 3)), c(138, 152, 12, C.spend)],
  star: [p([[100, 24], [120, 78], [176, 78], [130, 110], [148, 166], [100, 132], [52, 166], [70, 110], [24, 78], [80, 78]], C.gold)],
  heart: [c(74, 84, 32, C.spend), c(126, 84, 32, C.spend), p([[44, 96], [156, 96], [100, 166]], C.spend), e(68, 76, 8, 12, "#ffb3a8")],
  lamp: [e(100, 150, 56, 20, C.clayDeep), p([[48, 142], [152, 142], [134, 118], [66, 118]], C.clay), l(150, 132, 176, 112, 9, C.clay), e(100, 94, 13, 26, C.orange), e(100, 102, 7, 14, C.goldLight)],
  ring: [ring(100, 114, 42, 13, C.gold), c(100, 66, 16, C.spend), c(96, 62, 5, "#ffc1b8")],
  river: [r(0, 128, 200, 52, C.sky), r(0, 136, 200, 6, C.skyLight), r(16, 106, 168, 14, C.wood), r(36, 118, 12, 46, C.woodDeep), r(152, 118, 12, 46, C.woodDeep)],
  plan: [r(36, 24, 128, 156, C.clay, 14), r(52, 46, 14, 14, C.green, 3), r(74, 49, 70, 8, C.clayDeep, 4), r(52, 78, 14, 14, C.green, 3), r(74, 81, 60, 8, C.clayDeep, 4), r(52, 110, 14, 14, C.green, 3), r(74, 113, 76, 8, C.clayDeep, 4), r(52, 142, 14, 14, C.spend, 3), r(74, 145, 54, 8, C.clayDeep, 4)],
  ingot: [p([[30, 140], [170, 140], [150, 90], [50, 90]], "#b8742c"), p([[50, 90], [150, 90], [140, 76], [60, 76]], "#e7a250"), e(78, 112, 12, 6, "#f3c27c")],
  magnifier: [ring(86, 86, 50, 16, C.lapis), c(86, 86, 40, C.skyLight), l(124, 124, 170, 170, 18, C.woodDeep), e(70, 70, 10, 14, WHITE)],
  sun: [...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => l(100 + Math.cos((i * Math.PI) / 4) * 62, 100 + Math.sin((i * Math.PI) / 4) * 62, 100 + Math.cos((i * Math.PI) / 4) * 90, 100 + Math.sin((i * Math.PI) / 4) * 90, 12, C.orange)), c(100, 100, 50, C.gold), e(84, 84, 10, 14, C.goldLight)],
  tunic: [p([[60, 40], [140, 40], [176, 74], [158, 96], [140, 84], [140, 176], [60, 176], [60, 84], [42, 96], [24, 74]], C.rose), r(60, 120, 80, 10, C.gold), e(100, 44, 18, 8, "#ffd1df")],
  field: [r(0, 60, 200, 120, "#c98a46"), ...[72, 96, 120, 144, 168].map((y) => r(0, y, 200, 6, "#a96a2c")), r(0, 40, 200, 22, LEAF)],
  canal: [r(0, 120, 200, 70, SAND), p([[40, 120], [160, 120], [138, 176], [62, 176]], "#c48a4a"), r(64, 160, 72, 16, C.sky), c(170, 40, 18, C.orange)],
  // фигуры героев: $a — одежда, $b — пояс/повязка, $c — особая деталь
  person: [c(100, 50, 25, SKIN), e(100, 32, 27, 12, "$b"), p([[60, 186], [140, 186], [126, 80], [74, 80]], "$a"), r(68, 126, 64, 9, "$b"), c(100, 186, 1, null)],
  elder: [c(100, 50, 25, SKIN), e(100, 31, 27, 12, "$b"), e(100, 74, 18, 16, WHITE), p([[58, 188], [142, 188], [128, 84], [72, 84]], "$a"), r(66, 128, 68, 9, "$b"), l(150, 96, 156, 188, 7, C.woodDeep)],
  traveler: [c(100, 50, 25, SKIN), e(100, 34, 30, 13, "$b"), p([[60, 186], [140, 186], [126, 80], [74, 80]], "$a"), r(68, 126, 64, 9, "$b"), r(126, 96, 28, 40, "$c", 8)],
};

// ───────── геометрия ─────────
const inPoly = (x: number, y: number, pts: [number, number][]) => {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi) ins = !ins;
  }
  return ins;
};
const segDist = (x: number, y: number, a: Prim & { t: "l" }) => {
  const dx = a.x2 - a.x1;
  const dy = a.y2 - a.y1;
  const k = Math.max(0, Math.min(1, ((x - a.x1) * dx + (y - a.y1) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x - a.x1 - dx * k, y - a.y1 - dy * k);
};
const hit = (q: Prim, x: number, y: number): boolean => {
  switch (q.t) {
    case "c":
      return (x - q.x) ** 2 + (y - q.y) ** 2 <= q.r * q.r;
    case "e":
      return ((x - q.x) / q.rx) ** 2 + ((y - q.y) / q.ry) ** 2 <= 1;
    case "r": {
      if (x < q.x || x > q.x + q.w || y < q.y || y > q.y + q.h) return false;
      if (!q.rr) return true;
      const cx = Math.max(q.x + q.rr, Math.min(q.x + q.w - q.rr, x));
      const cy = Math.max(q.y + q.rr, Math.min(q.y + q.h - q.rr, y));
      return (x - cx) ** 2 + (y - cy) ** 2 <= q.rr * q.rr;
    }
    case "p":
      return inPoly(x, y, q.pts);
    case "l":
      return segDist(x, y, q) <= q.w / 2;
    case "ring": {
      const d = Math.hypot(x - q.x, y - q.y);
      return Math.abs(d - q.r) <= q.w / 2;
    }
  }
};

export type Dot = { x: number; y: number; col: string; i: number };
const cache = new Map<string, Dot[]>();
// точки формы в пикселях: центр (0,0), сторона поля size px, шаг сетки sp px
export const dotsOf = (shape: string, size: number, sp: number): Dot[] => {
  const key = `${shape}|${size}|${sp}`;
  const hitC = cache.get(key);
  if (hitC) return hitC;
  const prims = SHAPES[shape];
  if (!prims) throw new Error(`Нет формы ${shape}`);
  const u = size / 200;
  const out: Dot[] = [];
  const rowH = sp * 0.866;
  let row = 0;
  for (let py = -size / 2; py <= size / 2; py += rowH, row++) {
    for (let px = -size / 2 + (row % 2 ? sp / 2 : 0); px <= size / 2; px += sp) {
      const x = px / u + 100;
      const y = py / u + 100;
      let col: Col = null;
      for (const q of prims) if (hit(q, x, y)) col = q.col;
      if (col) out.push({ x: px, y: py, col, i: out.length });
    }
  }
  cache.set(key, out);
  return out;
};

export const hash = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const backOut = (x: number) => {
  const s = 1.25;
  return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2;
};
const mixHex = (a: string, b: string, k: number) => {
  if (k <= 0 || a === b) return a;
  if (k >= 1) return b;
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
};

export type DotsProps = {
  shape: string;
  x: number;
  y: number;
  size: number;
  t: number;
  at: number; // начало сборки, с (время сцены)
  sp?: number; // шаг сетки, px
  colors?: { a?: string; b?: string; c?: string };
  from?: "cloud" | [number, number]; // откуда летят точки: облако вокруг или точка кадра
  dur?: number; // длительность сборки одной точки
  spread?: number; // разброс задержек
  out?: number; // момент рассыпания, с
  outMode?: "explode" | "fade" | "fall";
  morph?: { shape: string; at: number; colors?: DotsProps["colors"]; dx?: number; dy?: number; size?: number };
  dim?: number; // 0…1 приглушение (для фона сцены)
};

const resolve = (col: string, colors?: DotsProps["colors"]) =>
  col === "$a" ? (colors?.a ?? C.sky) : col === "$b" ? (colors?.b ?? C.gold) : col === "$c" ? (colors?.c ?? C.clay) : col;

export const Dots: React.FC<DotsProps> = ({ shape, x, y, size, t, at, sp = 11, colors, from = "cloud", dur = 0.9, spread = 0.6, out, outMode = "explode", morph, dim = 0 }) => {
  if (t < at - 0.05) return null;
  const A = dotsOf(shape, size, sp);
  const B = morph ? dotsOf(morph.shape, morph.size ?? size, sp) : null;
  const n = B ? Math.max(A.length, B.length) : A.length;
  const rad = sp * 0.42;
  const els: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const a = B ? A[Math.floor((k * A.length) / n)] : A[k];
    let px = a.x;
    let py = a.y;
    let col = resolve(a.col, colors);
    let op = 1;
    let rr = rad;
    // сборка
    const d0 = at + hash(k, 1) * spread + ((a.x / size + 0.5) * spread) / 2;
    const ka = clamp01((t - d0) / dur);
    if (ka < 1) {
      let sx: number;
      let sy: number;
      if (from === "cloud") {
        const th = hash(k, 3) * Math.PI * 2;
        const R = size * (0.55 + 0.7 * hash(k, 4));
        sx = a.x + Math.cos(th) * R;
        sy = a.y + Math.sin(th) * R;
      } else {
        sx = from[0] - x + (hash(k, 5) - 0.5) * 60;
        sy = from[1] - y + (hash(k, 6) - 0.5) * 60;
      }
      const m = backOut(ka);
      px = sx + (a.x - sx) * m;
      py = sy + (a.y - sy) * m;
      op = clamp01(ka * 3);
      rr = rad * (0.5 + 0.5 * easeOut(ka));
    }
    // перетекание в другую форму
    if (B && morph && t > morph.at) {
      const b = B[Math.floor((k * B.length) / n)];
      const dm = morph.at + hash(k, 7) * 0.45;
      const km = easeOut(clamp01((t - dm) / 0.85));
      const bx = b.x + (morph.dx ?? 0);
      const by = b.y + (morph.dy ?? 0);
      // дуга: точки слегка поднимаются в середине пути
      const lift = Math.sin(km * Math.PI) * (20 + 40 * hash(k, 8));
      px = px + (bx - px) * km;
      py = py + (by - py) * km - lift;
      col = mixHex(col, resolve(b.col, morph.colors), km);
    }
    // рассыпание
    if (out !== undefined && t > out) {
      const ko = clamp01((t - out - hash(k, 9) * 0.25) / 0.9);
      if (ko >= 1) continue;
      if (outMode === "fade") op *= 1 - ko;
      else {
        const th = Math.atan2(py, px) + (hash(k, 10) - 0.5) * 1.4;
        const v = (outMode === "fall" ? 60 : 160) + 260 * hash(k, 11);
        const tt = ko * 0.9;
        px += Math.cos(th) * v * tt * (outMode === "fall" ? 0.4 : 1);
        py += Math.sin(th) * v * tt * (outMode === "fall" ? 0.2 : 1) + 520 * tt * tt;
        op *= 1 - ko;
        rr *= 1 - 0.4 * ko;
      }
    }
    if (dim > 0) col = mixHex(col, "#ffffff", dim * 0.6);
    els.push(<circle key={k} cx={px.toFixed(1)} cy={py.toFixed(1)} r={rr.toFixed(2)} fill={col} opacity={op < 1 ? op.toFixed(3) : undefined} />);
  }
  return <g transform={`translate(${x} ${y})`}>{els}</g>;
};
