// Фигуры из цветных точек — визуальный язык фильма «Государство».
// Каждая фигура возвращает ровно N точек (x, y, цвет, размер, яркость):
// основная часть складывается в рисунок (город, весы, пещера, солнце…),
// остаток уходит в «звёздную пыль» фона. Всё детерминировано (seed),
// поэтому любой кадр рендерится одинаково в любом процессе.
import { DOT } from "../theme.ts";

export type Pt = { x: number; y: number; c: string; r: number; a: number };
export type ShapeSpec = { kind: string; x?: number; y?: number; s?: number; [key: string]: unknown };

export const N_DOTS = 1400;

// ── случайность с зерном ──────────────────────────────────────────────
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
export const hash01 = (i: number, k = 0) => {
  const r = rng(i * 7919 + k * 104729 + 13);
  r();
  return r();
};
const strSeed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

// ── примитивы ─────────────────────────────────────────────────────────
type Pred = (x: number, y: number) => boolean;
type Box = [number, number, number, number]; // x0 y0 x1 y1
type Gen = (n: number, r: () => number) => Pt[];
const P = (x: number, y: number, c: string, r = 1, a = 1): Pt => ({ x, y, c, r, a });

// заливка области по шестиугольной сетке: ровные, «дизайнерские» точки
const fill =
  (pred: Pred, box: Box, color: string | ((x: number, y: number) => string), rad = 1, alpha = 1): Gen =>
  (n, r) => {
    if (n <= 0) return [];
    const [x0, y0, x1, y1] = box;
    let inside = 0;
    const S = 60;
    for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) if (pred(x0 + ((i + 0.5) * (x1 - x0)) / S, y0 + ((j + 0.5) * (y1 - y0)) / S)) inside++;
    const area = Math.max(1, ((x1 - x0) * (y1 - y0) * inside) / (S * S));
    let d = Math.sqrt(area / n / 0.866);
    let pts: [number, number][] = [];
    for (let tries = 0; tries < 14; tries++) {
      pts = [];
      const dy = d * 0.866;
      let row = 0;
      for (let y = y0 + dy / 2; y <= y1; y += dy, row++)
        for (let x = x0 + (row % 2 ? d / 2 : 0) + d / 4; x <= x1; x += d) if (pred(x, y)) pts.push([x, y]);
      if (pts.length >= n) break;
      d *= 0.94;
    }
    // лишние точки убираем равномерно-случайно
    while (pts.length > n) pts.splice(Math.floor(r() * pts.length), 1);
    while (pts.length < n) pts.push([x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)]);
    const col = typeof color === "function" ? color : () => color;
    return pts.map(([x, y]) => P(x + (r() - 0.5) * d * 0.12, y + (r() - 0.5) * d * 0.12, col(x, y), rad, alpha));
  };

// точки вдоль ломаной (контур), равномерно по длине
const path =
  (pts: [number, number][], color: string, rad = 1, alpha = 1, closed = false): Gen =>
  (n) => {
    if (n <= 0) return [];
    const p = closed ? [...pts, pts[0]] : pts;
    const seg: number[] = [];
    let total = 0;
    for (let i = 1; i < p.length; i++) {
      const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      seg.push(l);
      total += l;
    }
    const out: Pt[] = [];
    for (let k = 0; k < n; k++) {
      let d = (total * (k + 0.5)) / n;
      let i = 0;
      while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
      const f = seg[i] ? d / seg[i] : 0;
      out.push(P(p[i][0] + (p[i + 1][0] - p[i][0]) * f, p[i][1] + (p[i + 1][1] - p[i][1]) * f, color, rad, alpha));
    }
    return out;
  };

const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, k = 48): [number, number][] =>
  Array.from({ length: k + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / k;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });

const inPoly = (poly: [number, number][]): Pred => (x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const polyBox = (poly: [number, number][]): Box => [
  Math.min(...poly.map((p) => p[0])),
  Math.min(...poly.map((p) => p[1])),
  Math.max(...poly.map((p) => p[0])),
  Math.max(...poly.map((p) => p[1])),
];
const polyFill = (poly: [number, number][], color: string, rad = 1, alpha = 1) => fill(inPoly(poly), polyBox(poly), color, rad, alpha);
const disc = (cx: number, cy: number, rr: number, color: string | ((x: number, y: number) => string), rad = 1, alpha = 1) =>
  fill((x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr, [cx - rr, cy - rr, cx + rr, cy + rr], color, rad, alpha);
const ring = (cx: number, cy: number, rx: number, ry: number, color: string, rad = 1, alpha = 1) => path(arcPts(cx, cy, rx, ry, 0, Math.PI * 2, 96), color, rad, alpha);
const rect = (x: number, y: number, w: number, h: number, color: string, rad = 1, alpha = 1) => fill(() => true, [x, y, x + w, y + h], color, rad, alpha);
const line = (x1: number, y1: number, x2: number, y2: number, color: string, rad = 1, alpha = 1) => path([[x1, y1], [x2, y2]], color, rad, alpha);

// человечек: голова + плечи/туловище (силуэт из точек)
const personPred = (cx: number, cy: number, h: number): Pred => {
  const hr = h * 0.16;
  const hy = cy - h * 0.34;
  return (x, y) => {
    if ((x - cx) ** 2 + (y - hy) ** 2 <= hr * hr) return true;
    const top = cy - h * 0.12;
    const bot = cy + h * 0.5;
    if (y < top || y > bot) return false;
    const k = (y - top) / (bot - top);
    const half = h * (0.2 + 0.1 * Math.min(1, k * 3));
    const rr = h * 0.12;
    if (y < top + rr) {
      const inner = half - rr;
      if (Math.abs(x - cx) <= inner) return true;
      return (Math.abs(x - cx) - inner) ** 2 + (y - top - rr) ** 2 <= rr * rr;
    }
    return Math.abs(x - cx) <= half;
  };
};
const person = (cx: number, cy: number, h: number, color: string | ((x: number, y: number) => string), rad = 1, alpha = 1) =>
  fill(personPred(cx, cy, h), [cx - h * 0.32, cy - h * 0.52, cx + h * 0.32, cy + h * 0.5], color, rad, alpha);

// распределение N точек по частям рисунка пропорционально весам
type Part = { w: number; g: Gen };
const compose = (parts: Part[], n: number, r: () => number): Pt[] => {
  const total = parts.reduce((a, p) => a + p.w, 0);
  const counts = parts.map((p) => Math.floor((p.w / total) * n));
  let left = n - counts.reduce((a, b) => a + b, 0);
  for (let i = 0; left > 0; i = (i + 1) % parts.length, left--) counts[i]++;
  return parts.flatMap((p, i) => p.g(counts[i], r));
};

// фон: звёздная пыль по всему кадру
const dust = (n: number, r: () => number, alpha = 0.32): Pt[] =>
  Array.from({ length: n }, () => P(r() * 1920, r() * 1080, r() < 0.5 ? DOT.dim : DOT.silver, 0.55 + r() * 0.35, alpha * (0.5 + r() * 0.6)));

const PALETTE = [DOT.gold, DOT.coral, DOT.sky, DOT.mint, DOT.violet, DOT.pink, DOT.amber, DOT.cyan, DOT.lime];
const pick = (r: () => number, list = PALETTE) => list[Math.floor(r() * list.length)];

// ── фигуры (локальные координаты вокруг (0,0), масштаб s) ─────────────
type Ctx = { r: () => number; o: ShapeSpec };
type Def = { n: number; parts: (c: Ctx) => Part[]; dustAlpha?: number };

const num = (o: ShapeSpec, k: string, d: number) => (typeof o[k] === "number" ? (o[k] as number) : d);
const str = (o: ShapeSpec, k: string, d: string) => (typeof o[k] === "string" ? (o[k] as string) : d);

// город-полис: кварталы, колонны храма на холме, стены
const cityParts = (o: ShapeSpec, r: () => number, zones = false): Part[] => {
  const parts: Part[] = [];
  const hill: [number, number][] = [[-520, 250], [-380, 170], [-180, 110], [0, 90], [180, 110], [380, 170], [520, 250]];
  parts.push({ w: 10, g: path(hill, DOT.dim, 0.9, 0.8) });
  const xs = [-470, -390, -310, -230, 160, 240, 320, 400, 470];
  xs.forEach((x, i) => {
    const h = 70 + ((i * 53) % 90);
    const base = 230 - Math.abs(x) * 0.12;
    const c = zones ? (Math.abs(x) > 300 ? DOT.bronze : DOT.silver) : pick(r);
    parts.push({ w: h / 9, g: rect(x - 32, base - h, 64, h, c) });
    parts.push({ w: 2.2, g: polyFill([[x - 38, base - h], [x, base - h - 34], [x + 38, base - h]], c) });
  });
  // храм наверху холма
  const tc = zones ? DOT.gold : DOT.gold;
  parts.push({ w: 6, g: polyFill([[-150, -60], [0, -140], [150, -60]], tc) });
  parts.push({ w: 3, g: rect(-150, -58, 300, 18, tc) });
  [-120, -60, 0, 60, 120].forEach((x) => parts.push({ w: 3.4, g: rect(x - 10, -36, 20, 120, tc) }));
  parts.push({ w: 3, g: rect(-170, 86, 340, 16, tc) });
  return parts;
};

// весы: стойка, коромысло с наклоном tilt (градусы), две чаши
const scalesParts = (o: ShapeSpec): Part[] => {
  const tilt = (num(o, "tilt", 0) * Math.PI) / 180;
  const L = 330;
  const lx = -Math.cos(tilt) * L;
  const ly = -Math.sin(tilt) * L;
  const rx = Math.cos(tilt) * L;
  const ry = Math.sin(tilt) * L;
  const pan = (cx: number, cy: number, c: string): Part[] => [
    { w: 3, g: path([[cx, cy - 170], [cx - 110, cy]], DOT.silver, 0.8, 0.8) },
    { w: 3, g: path([[cx, cy - 170], [cx + 110, cy]], DOT.silver, 0.8, 0.8) },
    { w: 8, g: fill((x, y) => y >= cy && ((x - cx) / 130) ** 2 + ((y - cy) / 55) ** 2 <= 1, [cx - 130, cy, cx + 130, cy + 55], c) },
  ];
  return [
    { w: 6, g: rect(-14, -250, 28, 480, DOT.silver) },
    { w: 4, g: polyFill([[-120, 260], [0, 205], [120, 260]], DOT.silver) },
    { w: 2, g: disc(0, -262, 26, DOT.gold) },
    { w: 7, g: path([[lx, -250 + ly], [rx, -250 + ry]], DOT.gold, 1.1) },
    ...pan(lx, -250 + ly + 170, str(o, "left", DOT.sky)),
    ...pan(rx, -250 + ry + 170, str(o, "right", DOT.coral)),
  ];
};

// пещера (Книга VII): освещённая стена-экран слева, тени — «дыры» в свете;
// узники в оковах лицом к стене; за ними низкая стена с куклами и огонь;
// крутой подъём к выходу, наверху — дневной свет.
// lit: 0 — видны только стена с тенями и узники; 1 — видны стена, куклы, огонь
// exit: свет у выхода; free: один узник поднимается по пути наверх (0…1)
const caveShadow = (x: number, y: number) =>
  // ваза, зверь (четвероногий силуэт), человек с ношей — тени предметов
  ((x + 610) / 38) ** 2 + ((y + 40) / 70) ** 2 < 1 || (y > -150 && y < -100 && Math.abs(x + 610) < 14) ||
  (((x + 470) / 70) ** 2 + ((y + 20) / 32) ** 2 < 1) || (y > 0 && y < 60 && (Math.abs(x + 520) < 9 || Math.abs(x + 425) < 9)) || ((x + 395) ** 2 + (y + 50) ** 2 < 24 ** 2);
const caveParts = (o: ShapeSpec): Part[] => {
  const lit = num(o, "lit", 0);
  const exit = num(o, "exit", 0);
  const free = num(o, "free", -1);
  const wall: Pred = (x, y) => x > -720 && x < -330 && y > -240 && y < 140 && !caveShadow(x, y);
  const parts: Part[] = [
    // свод и подъём к выходу
    { w: 14, g: path([[-780, 300], [-800, -120], [-700, -330], [-300, -400], [150, -390], [420, -330], [560, -430], [700, -470]], DOT.shadow, 1.1, 0.95) },
    { w: 6, g: path([[-780, 300], [330, 300], [520, 230], [640, 60], [720, -120], [790, -330]], DOT.shadow, 1, 0.9) },
    // освещённая стена с тенями
    { w: 30, g: fill(wall, [-720, -240, -330, 140], (x) => (x > -460 ? DOT.amber : DOT.bronze), 0.95, 0.75) },
    // узники
    ...[-250, -150, -50].map((x, i) => {
      if (i !== 1 || free < 0) return { w: 5, g: person(x, 210, 140, DOT.silver, 0.9, 0.9) };
      // освобождённый узник идёт по подъёму к выходу: free 0…1 — путь, >1 — снаружи
      const route: [number, number][] = [[-150, 280], [500, 260], [640, 60], [720, -120], [790, -330], [900, -420]];
      const seg = Math.min(route.length - 2, Math.floor(free * (route.length - 1)));
      const f = Math.min(1, free * (route.length - 1) - seg);
      const gx = route[seg][0] + (route[seg + 1][0] - route[seg][0]) * f;
      const gy = route[seg][1] + (route[seg + 1][1] - route[seg][1]) * f;
      return { w: 5, g: person(gx, gy - 70, 140, DOT.white) };
    }),
    { w: 3, g: line(-310, 270, 10, 270, DOT.dim, 0.8, 0.9) },
  ];
  if (lit > 0) {
    parts.push({ w: 6, g: rect(80, 180, 330, 30, DOT.bronze) }); // низкая стена
    parts.push({ w: 3, g: fill((x, y) => ((x - 160) / 26) ** 2 + ((y - 130) / 45) ** 2 < 1, [130, 80, 190, 180], DOT.amber) }); // кукла-ваза
    parts.push({ w: 4, g: fill((x, y) => ((x - 300) / 55) ** 2 + ((y - 145) / 24) ** 2 < 1 || (y > 145 && y < 180 && (Math.abs(x - 265) < 7 || Math.abs(x - 335) < 7)), [240, 120, 360, 180], DOT.amber) });
    parts.push({ w: 12, g: fill((x, y) => ((x - 540) / 70) ** 2 + ((y - 160) / 120) ** 2 <= 1 && y < 250 && Math.abs(x - 540) < 70 - (250 - y) * 0.25 + 40, [470, 40, 610, 250], (x, y) => (y < 120 ? DOT.gold : y < 190 ? DOT.amber : DOT.coral)) });
  }
  if (exit > 0) parts.push({ w: 14, g: disc(760, -470, 80, (x, y) => ((x - 760) ** 2 + (y + 470) ** 2 < 40 ** 2 ? DOT.white : DOT.gold)) });
  return parts;
};

// разделённая линия: 4 отрезка (тени, вещи, рассуждение, понимание)
const lineParts = (o: ShapeSpec): Part[] => {
  const cols = [DOT.dim, DOT.sky, DOT.mint, DOT.gold];
  const lens = [150, 230, 230, 330];
  let y = 430;
  const out: Part[] = [];
  lens.forEach((l, i) => {
    out.push({ w: l / 10, g: rect(-22, y - l + 8, 44, l - 16, cols[i], 1, num(o, "lit", 1) >= i ? 1 : 0.35) });
    y -= l;
  });
  return out;
};

// солнце: диск + лучи
const sunParts = (o: ShapeSpec): Part[] => {
  const rays: Part[] = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return { w: 3, g: line(Math.cos(a) * 200, Math.sin(a) * 200, Math.cos(a) * (i % 2 ? 300 : 360), Math.sin(a) * (i % 2 ? 300 : 360), DOT.amber, 1, 0.9) };
  });
  return [{ w: 40, g: disc(0, 0, 170, (x, y) => (x * x + y * y < 90 * 90 ? DOT.white : DOT.gold), 1.1) }, ...rays];
};

// пирамида/три группы полиса: правители (золото), стражи (серебро), производители (бронза)
const tiersParts = (o: ShapeSpec): Part[] => {
  const labels = (o.colors as string[] | undefined) ?? [DOT.gold, DOT.silver, DOT.bronze];
  return [
    { w: 5, g: polyFill([[-120, -150], [120, -150], [0, -330]], labels[0]) },
    { w: 10, g: polyFill([[-250, 30], [250, 30], [130, -130], [-130, -130]], labels[1]) },
    { w: 16, g: polyFill([[-400, 230], [400, 230], [270, 50], [-270, 50]], labels[2]) },
  ];
};

// душа из трёх начал внутри силуэта: разум (голова), дух (грудь), вожделение (живот)
const soulParts = (o: ShapeSpec): Part[] => {
  const pr = personPred(0, 40, 620);
  const col = (x: number, y: number) => (y < -110 ? DOT.gold : y < 110 ? DOT.coral : DOT.mint);
  const glow = str(o, "glow", "");
  return [{ w: 1, g: fill(pr, [-200, -290, 200, 350], glow ? (x, y) => (col(x, y) === glow ? glow : DOT.shadow) : col) }];
};

// корабль: корпус, мачта, парус; кормчий — золотая точка
const shipParts = (): Part[] => [
  { w: 14, g: polyFill([[-380, 40], [380, 40], [290, 150], [-300, 150]], DOT.bronze) },
  { w: 4, g: rect(-8, -330, 16, 370, DOT.silver) },
  { w: 14, g: polyFill([[10, -320], [250, -20], [10, -20]], DOT.white) },
  { w: 8, g: polyFill([[-10, -280], [-210, -20], [-10, -20]], DOT.sky) },
  ...[-300, -200, -100, 100, 200].map((x, i) => ({ w: 2.4, g: person(x, 0, 80, i % 2 ? DOT.coral : DOT.pink, 0.9) })),
  { w: 2, g: disc(320, -10, 24, DOT.gold) },
  { w: 6, g: path(arcPts(0, 190, 520, 30, 0, Math.PI, 40).map(([x, y], i) => [x, y + Math.sin(i) * 10]), DOT.sky, 0.9, 0.7) },
];

// лестница пяти устройств: аристократия → тимократия → олигархия → демократия → тирания
const stairsParts = (o: ShapeSpec): Part[] => {
  const cols = [DOT.gold, DOT.coral, DOT.amber, DOT.sky, DOT.red];
  const upto = num(o, "upto", 4);
  return cols.map((c, i) => ({
    w: 9,
    g: i <= upto ? rect(-520 + i * 210, -260 + i * 110, 180, 90, c) : rect(-520 + i * 210, -260 + i * 110, 180, 90, DOT.shadow, 0.8, 0.4),
  }));
};

// веретено Необходимости: ось и восемь вложенных кругов-валов (миф Эра)
const spindleParts = (): Part[] => {
  const cols = [DOT.white, DOT.gold, DOT.coral, DOT.sky, DOT.mint, DOT.violet, DOT.amber, DOT.pink];
  return [
    { w: 10, g: line(0, -380, 0, 380, DOT.silver, 1.1) },
    ...cols.map((c, i) => ({ w: 4 + i * 1.5, g: ring(0, 120, 60 + i * 52, 18 + i * 13, c) })),
  ];
};

// три кровати Книги X: идея — мастер — художник (каждая бледнее)
const bedsParts = (): Part[] => {
  const bed = (cx: number, c: string, a: number): Part[] => [
    { w: 6, g: rect(cx - 150, -10, 300, 40, c, 1, a) },
    { w: 3, g: rect(cx - 150, -110, 30, 180, c, 1, a) },
    { w: 2, g: rect(cx + 120, -50, 30, 120, c, 1, a) },
    { w: 2, g: rect(cx - 110, -50, 80, 36, c, 1, a) },
  ];
  return [...bed(-520, DOT.gold, 1), ...bed(0, DOT.sky, 0.85), ...bed(520, DOT.violet, 0.55)];
};

// многоголовый зверь, лев и человек внутри одного человека (Книга IX)
const beastParts = (): Part[] => [
  { w: 16, g: fill((x, y) => ((x + 330) / 230) ** 2 + ((y - 80) / 150) ** 2 <= 1, [-560, -70, -100, 230], DOT.mint) },
  ...Array.from({ length: 7 }, (_, i) => {
    const a = Math.PI * (1.05 + i * 0.13);
    return { w: 1.6, g: disc(-330 + Math.cos(a) * 270, 80 + Math.sin(a) * 190, 30, i % 2 ? DOT.lime : DOT.mint) };
  }),
  { w: 10, g: disc(40, 40, 120, (x, y) => ((x - 40) ** 2 + (y - 40) ** 2 < 70 ** 2 ? DOT.amber : DOT.coral)) },
  { w: 3, g: rect(-20, 150, 120, 90, DOT.amber) },
  { w: 8, g: person(390, 40, 330, DOT.gold) },
];

// кольцо Гига: золотое кольцо с камнем; invisible — человек растворяется
const ringParts = (o: ShapeSpec): Part[] => {
  const fade = num(o, "fade", 0);
  return [
    { w: 22, g: fill((x, y) => { const d = Math.hypot(x, y * 1.25); return d < 190 && d > 130; }, [-190, -160, 190, 160], DOT.gold, 1.05) },
    { w: 6, g: polyFill([[-40, -150], [0, -215], [40, -150], [0, -120]], DOT.cyan) },
    ...(o.person ? [{ w: 14, g: person(420, 30, 420, DOT.silver, 1, 1 - 0.85 * fade) }] : []),
  ];
};

// волны Книги V: три волны возражений
const wavesParts = (o: ShapeSpec): Part[] => {
  const k = num(o, "count", 3);
  const cols = [DOT.sky, DOT.violet, DOT.pink];
  return cols.slice(0, k).map((c, i) => {
    const base = -150 + i * 150;
    const amp = 40 + i * 25;
    return { w: 10, g: fill((x, y) => y > base + Math.sin((x + i * 90) / 90) * amp && y < base + 60 + Math.sin((x + i * 90) / 90) * amp, [-560, base - amp, 560, base + 60 + amp], c) };
  });
};

// вопросительный знак
const questionParts = (o: ShapeSpec): Part[] => [
  { w: 30, g: fill((x, y) => {
    const d = Math.hypot(x, y + 120);
    if (y < -60 && d < 170 && d > 95 && !(x < -40 && y > -150)) return true;
    if (y >= -60 && y < 90 && Math.abs(x - 20 + (y + 60) * 0.12) < 38) return true;
    return false;
  }, [-180, -300, 180, 100], str(o, "c", DOT.gold)) },
  { w: 4, g: disc(10, 170, 40, str(o, "c", DOT.gold)) },
];

// перекрёсток двух путей (выбор)
const forkParts = (o: ShapeSpec): Part[] => [
  { w: 10, g: fill((x, y) => y > 60 && Math.abs(x) < 40 + (y - 60) * 0.1, [-80, 60, 80, 330], DOT.silver) },
  { w: 12, g: fill((x, y) => y <= 60 && y > -300 && Math.abs(x + (60 - y) * 1.0) < 40, [-420, -300, 80, 60], str(o, "left", DOT.mint)) },
  { w: 12, g: fill((x, y) => y <= 60 && y > -300 && Math.abs(x - (60 - y) * 1.0) < 40, [-80, -300, 420, 60], str(o, "right", DOT.coral)) },
];

// толпа людей: строки человечков разных цветов (или одного)
const crowdParts = (o: ShapeSpec, r: () => number): Part[] => {
  const cols = num(o, "cols", 7);
  const rows = num(o, "rows", 2);
  const h = num(o, "h", 150);
  const color = o.color as string | undefined;
  const out: Part[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x = (i - (cols - 1) / 2) * h * 0.72 + (j % 2 ? h * 0.36 : 0);
      const y = (j - (rows - 1) / 2) * h * 1.1;
      out.push({ w: 1, g: person(x, y, h * 0.92, color ?? pick(r)) });
    }
  return out;
};

// люди-участники спора: позиции и цвета задаются списком
const peopleParts = (o: ShapeSpec): Part[] => {
  const list = (o.list as { x: number; y?: number; h?: number; c: string }[]) ?? [];
  return list.map((p) => ({ w: (p.h ?? 300) / 30, g: person(p.x, p.y ?? 0, p.h ?? 300, p.c) }));
};

// корона тирана
const crownParts = (): Part[] => [
  { w: 20, g: polyFill([[-260, 120], [260, 120], [300, -140], [150, 0], [0, -200], [-150, 0], [-300, -140]], DOT.red) },
  { w: 4, g: rect(-260, 130, 520, 50, DOT.coral) },
  ...[-300, 0, 300].map((x) => ({ w: 1.5, g: disc(x, x === 0 ? -215 : -150, 22, DOT.gold) })),
];

// цепь: звенья по прямой
const chainParts = (): Part[] =>
  Array.from({ length: 7 }, (_, i) => ({ w: 4, g: ring(-480 + i * 160, 0, 90, 46, i % 2 ? DOT.silver : DOT.dim, 1.1) }));

// сердце-баланс: три концентрических круга (гармония трёх начал)
const harmonyParts = (): Part[] => [
  { w: 10, g: ring(0, 0, 320, 320, DOT.mint) },
  { w: 8, g: ring(0, 0, 220, 220, DOT.coral) },
  { w: 6, g: ring(0, 0, 120, 120, DOT.gold) },
  { w: 3, g: disc(0, 0, 40, DOT.white) },
];

// глаз (видеть/знать)
const eyeParts = (): Part[] => [
  { w: 16, g: path([...arcPts(0, 140, 420, 260, Math.PI * 1.17, Math.PI * 1.83, 40), ...arcPts(0, -140, 420, 260, Math.PI * 0.17, Math.PI * 0.83, 40)], DOT.sky) },
  { w: 12, g: disc(0, 0, 100, (x, y) => (x * x + y * y < 45 ** 2 ? "#0f1530" : DOT.cyan)) },
];

// маятник «качели»: столбики-график (для демократии/свободы и т. п.)
const barsParts = (o: ShapeSpec): Part[] => {
  const vals = (o.vals as number[]) ?? [0.4, 0.7, 1, 0.6];
  const cols = (o.colors as string[]) ?? PALETTE;
  return vals.map((v, i) => ({ w: 3 + v * 8, g: rect(-60 * vals.length + i * 120 + 10, 250 - v * 480, 100, v * 480, cols[i % cols.length]) }));
};

// зеркало: рамка + отражение (подражание)
const mirrorParts = (): Part[] => [
  { w: 10, g: ring(0, 0, 230, 310, DOT.silver) },
  { w: 18, g: fill((x, y) => (x / 210) ** 2 + (y / 290) ** 2 < 1, [-210, -290, 210, 290], (x, y) => (y < -80 ? DOT.sky : y < 60 ? DOT.mint : DOT.gold), 0.9, 0.6) },
];

// лестница вверх (путь из пещеры, образование)
const ladderParts = (): Part[] => [
  { w: 8, g: line(-160, 330, 40, -330, DOT.silver) },
  { w: 8, g: line(80, 330, 280, -330, DOT.silver) },
  ...Array.from({ length: 8 }, (_, i) => ({ w: 3, g: line(-160 + i * 25 + 12, 330 - i * 83 - 40, 80 + i * 25 + 12, 330 - i * 83 - 40, i > 5 ? DOT.gold : DOT.sky) })),
];

// текстовый знак «=» / «≠» (сравнение двух понятий)
const equalParts = (o: ShapeSpec): Part[] => {
  const ne = !!o.ne;
  const out: Part[] = [{ w: 6, g: rect(-130, -60, 260, 34, DOT.white) }, { w: 6, g: rect(-130, 26, 260, 34, DOT.white) }];
  if (ne) out.push({ w: 5, g: line(70, -140, -70, 140, DOT.red, 1.2) });
  return out;
};

// круг-орбита из N цветных кругов-«людей» (диалог, собрание)
const circleParts = (o: ShapeSpec): Part[] => {
  const k = num(o, "k", 6);
  const R = num(o, "R", 300);
  return Array.from({ length: k }, (_, i) => {
    const a = (i / k) * Math.PI * 2 - Math.PI / 2;
    return { w: 1, g: disc(Math.cos(a) * R, Math.sin(a) * R, num(o, "rr", 60), PALETTE[i % PALETTE.length]) };
  });
};

// трутни: маленькие колючие точки вокруг улья (Книга VIII)
const hiveParts = (): Part[] => [
  { w: 20, g: fill((x, y) => (x / 220) ** 2 + ((y - 30) / 260) ** 2 < 1, [-220, -230, 220, 290], (x, y) => (Math.floor((y + 300) / 60) % 2 ? DOT.amber : DOT.gold)) },
  ...Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    return { w: 1.2, g: disc(Math.cos(a) * 400, Math.sin(a) * 300, 22, DOT.red) };
  }),
];


// раскрытая книга: две страницы со строками (сказания, поэзия); censored — часть строк погашена
const bookParts = (o: ShapeSpec): Part[] => {
  const cut = !!o.censored;
  const page = (side: -1 | 1): Part[] => {
    const poly: [number, number][] = side < 0 ? [[-20, -200], [-420, -240], [-420, 200], [-20, 240]] : [[20, -200], [420, -240], [420, 200], [20, 240]];
    const lines: Part[] = Array.from({ length: 6 }, (_, i) => {
      const y = -150 + i * 60;
      const off = cut && (i + (side > 0 ? 1 : 0)) % 2 === 0;
      return { w: 3, g: line(side * 60, y + 10, side * 380, y - 18, off ? DOT.shadow : side < 0 ? DOT.sky : DOT.violet, 0.9, off ? 0.5 : 1) };
    });
    return [{ w: 10, g: path(poly, DOT.silver, 1, 0.9, true) }, ...lines];
  };
  return [...page(-1), ...page(1), { w: 3, g: line(0, -205, 0, 245, DOT.gold) }];
};

// лира: две дуги-рога, перекладина и струны (музыка, поэзия)
const lyreParts = (): Part[] => [
  { w: 12, g: path(arcPts(-150, 60, 120, 300, Math.PI * 0.5, Math.PI * 1.35, 40), DOT.gold, 1.1) },
  { w: 12, g: path(arcPts(150, 60, 120, 300, Math.PI * -0.35, Math.PI * 0.5, 40), DOT.gold, 1.1) },
  { w: 5, g: line(-250, -190, 250, -190, DOT.amber, 1.1) },
  { w: 6, g: fill((x, y) => ((x) / 170) ** 2 + ((y - 300) / 70) ** 2 < 1, [-170, 230, 170, 370], DOT.amber) },
  ...[-90, -45, 0, 45, 90].map((x, i) => ({ w: 4, g: line(x, -190, x, 250, [DOT.sky, DOT.mint, DOT.white, DOT.pink, DOT.violet][i], 0.85) })),
];

const DEFS: Record<string, Def> = {
  dust: { n: 0, parts: () => [] },
  scatter: { n: 760, parts: ({ r, o }) => [{ w: 1, g: (n) => Array.from({ length: n }, () => P((r() - 0.5) * num(o, "w", 1400), (r() - 0.5) * num(o, "h", 700), pick(r), 1, 0.95)) }] },
  city: { n: 900, parts: ({ r, o }) => cityParts(o, r, !!o.zones) },
  scales: { n: 760, parts: ({ o }) => scalesParts(o) },
  cave: { n: 1360, parts: ({ o }) => caveParts(o), dustAlpha: 0.12 },
  line: { n: 640, parts: ({ o }) => lineParts(o) },
  sun: { n: 900, parts: ({ o }) => sunParts(o) },
  tiers: { n: 900, parts: ({ o }) => tiersParts(o) },
  soul: { n: 900, parts: ({ o }) => soulParts(o) },
  ship: { n: 900, parts: () => shipParts() },
  stairs: { n: 800, parts: ({ o }) => stairsParts(o) },
  spindle: { n: 900, parts: () => spindleParts() },
  beds: { n: 900, parts: () => bedsParts() },
  beast: { n: 980, parts: () => beastParts() },
  ring: { n: 760, parts: ({ o }) => ringParts(o) },
  waves: { n: 900, parts: ({ o }) => wavesParts(o) },
  question: { n: 640, parts: ({ o }) => questionParts(o) },
  fork: { n: 820, parts: ({ o }) => forkParts(o) },
  crowd: { n: 900, parts: ({ r, o }) => crowdParts(o, r) },
  people: { n: 820, parts: ({ o }) => peopleParts(o) },
  crown: { n: 800, parts: () => crownParts() },
  chain: { n: 700, parts: () => chainParts() },
  harmony: { n: 720, parts: () => harmonyParts() },
  eye: { n: 700, parts: () => eyeParts() },
  bars: { n: 760, parts: ({ o }) => barsParts(o) },
  mirror: { n: 820, parts: () => mirrorParts() },
  ladder: { n: 720, parts: () => ladderParts() },
  equal: { n: 360, parts: ({ o }) => equalParts(o) },
  circle: { n: 700, parts: ({ o }) => circleParts(o) },
  hive: { n: 860, parts: () => hiveParts() },
  book: { n: 820, parts: ({ o }) => bookParts(o) },
  lyre: { n: 760, parts: () => lyreParts() },
};

export const SHAPE_KINDS = Object.keys(DEFS);

const cache = new Map<string, Pt[]>();
const DUST = dust(N_DOTS, rng(777), 0.32);

// точки фигуры в координатах кадра; ровно N_DOTS, порядок точек стабилен
export const shapePoints = (spec: ShapeSpec): Pt[] => {
  const key = JSON.stringify(spec);
  const hit = cache.get(key);
  if (hit) return hit;
  const def = DEFS[spec.kind];
  if (!def) throw new Error(`Нет фигуры ${spec.kind}`);
  const r = rng(strSeed(key));
  const n = Math.min(N_DOTS, Math.round(def.n * 1.2 * num(spec, "density", 1)));
  const s = num(spec, "s", 1);
  const cx = num(spec, "x", 960);
  const cy = num(spec, "y", 520);
  const color = typeof spec.color === "string" ? (spec.color as string) : null;
  const main = n > 0 ? compose(def.parts({ r, o: spec }), n, r).map((p) => ({ ...p, x: cx + p.x * s, y: cy + p.y * s, c: color ?? p.c })) : [];
  // порядок точек — по углу вокруг центра фигуры: при переходе рисунок
  // «перетекает» по кругу, а не разлетается хаотично
  const ang = (p: Pt) => Math.atan2(p.y - cy, p.x - cx) + hash01(Math.round(p.x * 13 + p.y * 7)) * 0.08;
  main.sort((a, b) => ang(a) - ang(b));
  // фоновая пыль у каждой точки своя и постоянная: свободные точки не мечутся между сценами
  const k = (def.dustAlpha ?? 0.32) / 0.32;
  const bg = DUST.slice(main.length).map((p) => ({ ...p, a: p.a * k }));
  const out = [...main, ...bg];
  cache.set(key, out);
  return out;
};
