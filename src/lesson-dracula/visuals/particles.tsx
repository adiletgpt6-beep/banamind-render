// Точечная сборка BM-033: образ собирается из чётких точек (разрозненные
// свидетельства складываются в предмет-доказательство), перестраивается в
// другой образ или рассыпается, когда объяснение не выдерживает проверки.
// Правила качества: точки крупные и контрастные, без размытия и bloom;
// положение каждой точки зависит только от её номера и времени — одинаковое
// в каждом кадре, без мерцания. После сборки силуэт читается.
import React from "react";
import { clamp01, ease } from "./kit";

// стабильный псевдослучайный номер 0…1 для точки i и признака k
export const rnd = (i: number, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7 + 74.7) * 43758.5453;
  return x - Math.floor(x);
};

export type Prim =
  | { c: "circle"; x: number; y: number; r: number; color: string }
  | { c: "ellipse"; x: number; y: number; rx: number; ry: number; color: string }
  | { c: "rect"; x: number; y: number; w: number; h: number; color: string }
  | { c: "poly"; pts: [number, number][]; color: string }
  | { c: "hole"; x: number; y: number; rx: number; ry: number }
  | { c: "cut"; x: number; y: number; w: number; h: number };

const inPoly = (x: number, y: number, pts: [number, number][]) => {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi) ins = !ins;
  }
  return ins;
};

const colorAt = (x: number, y: number, prims: Prim[]): string | null => {
  let col: string | null = null;
  for (const p of prims) {
    if (p.c === "hole") {
      if (((x - p.x) / p.rx) ** 2 + ((y - p.y) / p.ry) ** 2 <= 1) col = null;
      continue;
    }
    if (p.c === "cut") {
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) col = null;
      continue;
    }
    const inside =
      p.c === "circle"
        ? (x - p.x) ** 2 + (y - p.y) ** 2 <= p.r ** 2
        : p.c === "ellipse"
          ? ((x - p.x) / p.rx) ** 2 + ((y - p.y) / p.ry) ** 2 <= 1
          : p.c === "rect"
            ? x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h
            : inPoly(x, y, p.pts);
    if (inside) col = p.color;
  }
  return col;
};

export type Dot = { x: number; y: number; color: string };

// Сетка с полушаговым сдвигом рядов («полутон»): ровные чистые края силуэта.
const cache = new Map<string, Dot[]>();
export const sample = (key: string, prims: Prim[], step = 15, box = { x0: -300, y0: -300, x1: 300, y1: 300 }): Dot[] => {
  const hit = cache.get(key);
  if (hit) return hit;
  const out: Dot[] = [];
  let row = 0;
  for (let y = box.y0; y <= box.y1; y += step * 0.866, row++) {
    for (let x = box.x0 + (row % 2) * step * 0.5; x <= box.x1; x += step) {
      const col = colorAt(x, y, prims);
      if (col) out.push({ x, y, color: col });
    }
  }
  cache.set(key, out);
  return out;
};

// Готовые силуэты (координаты относительно центра, размер ≈ 560×560) — образы
// Бюро невозможных доказательств BM-033: замок на скале, раскрытый дневник,
// конверт, фонограф, пишущая машинка, корабль, лупа, лампа, колба, дверь,
// группа людей (условные силуэты без лиц), карта-маршрут, знак вопроса.
// Никаких клыков, крови, гробов и кинообразов графа: страх — через холод и тень.
const INK = "#1d2333";
const AMB = "#f0a640";
const PAPER = "#f8eedb";
const FROST = "#9fc3f0";
const STONE = "#8a8fa6";
const STONED = "#5d6380";
const TEAL = "#2aa39a";
const PLUM = "#7d63b0";
const WINE = "#b4415a";
const SKIN = "#f1c9a5";
export const SHAPES: Record<string, Prim[]> = {
  castle: [
    { c: "poly", pts: [[-300, 280], [-230, 160], [-120, 130], [120, 120], [240, 170], [300, 280]], color: STONED },
    { c: "rect", x: -170, y: -60, w: 340, h: 200, color: STONE },
    { c: "rect", x: -230, y: -170, w: 90, h: 310, color: STONE },
    { c: "poly", pts: [[-245, -170], [-185, -290], [-125, -170]], color: STONED },
    { c: "rect", x: 130, y: -120, w: 80, h: 260, color: STONE },
    { c: "poly", pts: [[118, -120], [170, -220], [222, -120]], color: STONED },
    { c: "rect", x: -40, y: -200, w: 80, h: 160, color: STONE },
    { c: "poly", pts: [[-52, -200], [0, -300], [52, -200]], color: STONED },
    { c: "rect", x: -200, y: -110, w: 30, h: 46, color: AMB },
    { c: "rect", x: 155, y: -60, w: 28, h: 40, color: AMB },
    { c: "rect", x: -14, y: -150, w: 28, h: 42, color: FROST },
    { c: "poly", pts: [[-40, 140], [-40, 60], [0, 30], [40, 60], [40, 140]], color: INK },
  ],
  diary: [
    { c: "poly", pts: [[-280, -170], [-10, -200], [-10, 210], [-280, 240]], color: PAPER },
    { c: "poly", pts: [[10, -200], [280, -170], [280, 240], [10, 210]], color: PAPER },
    { c: "rect", x: -12, y: -205, w: 24, h: 420, color: "#8a5a34" },
    { c: "rect", x: -240, y: -120, w: 200, h: 14, color: STONED },
    { c: "rect", x: -240, y: -80, w: 180, h: 14, color: STONED },
    { c: "rect", x: -240, y: -40, w: 200, h: 14, color: STONED },
    { c: "rect", x: -240, y: 0, w: 140, h: 14, color: STONED },
    { c: "rect", x: 50, y: -110, w: 200, h: 14, color: STONED },
    { c: "rect", x: 50, y: -70, w: 170, h: 14, color: STONED },
    { c: "rect", x: 50, y: -30, w: 200, h: 14, color: STONED },
    { c: "circle", x: 160, y: 110, r: 52, color: AMB },
  ],
  envelope: [
    { c: "rect", x: -260, y: -170, w: 520, h: 340, color: "#e9cf9c" },
    { c: "poly", pts: [[-260, -170], [0, 30], [260, -170]], color: AMB },
    { c: "poly", pts: [[-260, 170], [0, 10], [260, 170]], color: "#d9b77a" },
    { c: "circle", x: 0, y: 30, r: 40, color: WINE },
  ],
  phonograph: [
    { c: "rect", x: -220, y: 130, w: 440, h: 110, color: "#8a5a34" },
    { c: "rect", x: -150, y: 60, w: 260, h: 70, color: STONED },
    { c: "rect", x: -170, y: 70, w: 300, h: 50, color: AMB },
    { c: "poly", pts: [[60, 70], [120, -40], [170, -40], [110, 80]], color: STONED },
    { c: "poly", pts: [[120, -40], [40, -260], [300, -250], [170, -40]], color: AMB },
    { c: "ellipse", x: 170, y: -255, rx: 132, ry: 34, color: "#c9852a" },
  ],
  typewriter: [
    { c: "poly", pts: [[-280, 230], [-220, 40], [220, 40], [280, 230]], color: INK },
    { c: "rect", x: -230, y: -10, w: 460, h: 60, color: STONED },
    { c: "rect", x: -170, y: -250, w: 340, h: 260, color: PAPER },
    { c: "rect", x: -130, y: -210, w: 240, h: 12, color: STONED },
    { c: "rect", x: -130, y: -175, w: 200, h: 12, color: STONED },
    { c: "rect", x: -130, y: -140, w: 240, h: 12, color: STONED },
    { c: "circle", x: -150, y: 110, r: 18, color: PAPER },
    { c: "circle", x: -90, y: 110, r: 18, color: PAPER },
    { c: "circle", x: -30, y: 110, r: 18, color: PAPER },
    { c: "circle", x: 30, y: 110, r: 18, color: PAPER },
    { c: "circle", x: 90, y: 110, r: 18, color: PAPER },
    { c: "circle", x: 150, y: 110, r: 18, color: PAPER },
    { c: "circle", x: -120, y: 170, r: 18, color: PAPER },
    { c: "circle", x: -60, y: 170, r: 18, color: PAPER },
    { c: "circle", x: 0, y: 170, r: 18, color: PAPER },
    { c: "circle", x: 60, y: 170, r: 18, color: PAPER },
    { c: "circle", x: 120, y: 170, r: 18, color: PAPER },
  ],
  ship: [
    { c: "poly", pts: [[-260, 90], [260, 90], [190, 200], [-190, 200]], color: "#8a5a34" },
    { c: "rect", x: -12, y: -230, w: 24, h: 320, color: INK },
    { c: "poly", pts: [[20, -220], [220, 60], [20, 60]], color: PAPER },
    { c: "poly", pts: [[-20, -170], [-190, 60], [-20, 60]], color: FROST },
    { c: "poly", pts: [[-300, 230], [-150, 205], [0, 230], [150, 205], [300, 230], [300, 270], [-300, 270]], color: "#5f86c4" },
  ],
  magnifier: [
    { c: "circle", x: -60, y: -60, r: 200, color: INK },
    { c: "circle", x: -60, y: -60, r: 160, color: "#d6e6fa" },
    { c: "circle", x: -110, y: -110, r: 46, color: "#ffffff" },
    { c: "poly", pts: [[70, 100], [110, 60], [290, 240], [250, 280]], color: "#8a5a34" },
  ],
  lamp: [
    { c: "rect", x: -150, y: 200, w: 300, h: 50, color: "#8a5a34" },
    { c: "rect", x: -24, y: 40, w: 48, h: 170, color: "#c9852a" },
    { c: "ellipse", x: 0, y: -60, rx: 140, ry: 130, color: AMB },
    { c: "ellipse", x: 0, y: -60, rx: 90, ry: 84, color: "#ffe2a0" },
    { c: "ellipse", x: 0, y: -80, rx: 30, ry: 50, color: "#fff6dc" },
    { c: "rect", x: -70, y: 50, w: 140, h: 22, color: STONED },
  ],
  flask: [
    { c: "rect", x: -60, y: -260, w: 120, h: 150, color: "#cfe0f2" },
    { c: "poly", pts: [[-60, -110], [-230, 220], [230, 220], [60, -110]], color: "#cfe0f2" },
    { c: "poly", pts: [[-150, 70], [-230, 220], [230, 220], [150, 70]], color: TEAL },
    { c: "circle", x: -40, y: 140, r: 26, color: "#ffffff" },
    { c: "circle", x: 50, y: 110, r: 18, color: "#ffffff" },
    { c: "rect", x: -80, y: -280, w: 160, h: 30, color: STONED },
  ],
  door: [
    { c: "rect", x: -200, y: -270, w: 400, h: 540, color: STONED },
    { c: "poly", pts: [[-160, 270], [-160, -120], [0, -240], [160, -120], [160, 270]], color: "#7b5634" },
    { c: "rect", x: -8, y: -200, w: 16, h: 470, color: "#5c3e22" },
    { c: "circle", x: 50, y: 60, r: 20, color: AMB },
    { c: "circle", x: -50, y: 60, r: 20, color: AMB },
  ],
  people: [
    { c: "poly", pts: [[-300, 270], [-290, 140], [-240, 110], [-150, 110], [-110, 140], [-100, 270]], color: TEAL },
    { c: "circle", x: -195, y: 40, r: 64, color: SKIN },
    { c: "poly", pts: [[-100, 270], [-90, 90], [-40, 60], [40, 60], [90, 90], [100, 270]], color: AMB },
    { c: "circle", x: 0, y: -20, r: 70, color: SKIN },
    { c: "poly", pts: [[100, 270], [110, 140], [150, 110], [240, 110], [290, 140], [300, 270]], color: PLUM },
    { c: "circle", x: 195, y: 40, r: 64, color: SKIN },
  ],
  route: [
    { c: "poly", pts: [[-300, -60], [-230, -150], [-150, -120], [-120, -40], [-170, 60], [-260, 50]], color: "#8fb98a" },
    { c: "poly", pts: [[110, -90], [200, -170], [300, -120], [290, 20], [190, 60], [120, 10]], color: "#8fb98a" },
    { c: "circle", x: -200, y: -50, r: 22, color: AMB },
    { c: "circle", x: 210, y: -60, r: 22, color: WINE },
    { c: "circle", x: -100, y: 30, r: 10, color: INK },
    { c: "circle", x: -40, y: 60, r: 10, color: INK },
    { c: "circle", x: 20, y: 70, r: 10, color: INK },
    { c: "circle", x: 80, y: 50, r: 10, color: INK },
    { c: "circle", x: 130, y: 10, r: 10, color: INK },
  ],
  question: [
    { c: "ellipse", x: 0, y: -90, rx: 150, ry: 140, color: AMB },
    { c: "hole", x: 0, y: -90, rx: 80, ry: 72 },
    { c: "cut", x: -170, y: -90, w: 170, h: 120 },
    { c: "rect", x: -40, y: -10, w: 80, h: 110, color: AMB },
    { c: "circle", x: 0, y: 185, r: 48, color: AMB },
  ],
};

export type ParticleProps = {
  shape: string;
  t: number; // время сцены, с
  at: number; // начало сборки
  dur?: number; // длительность сборки
  x?: number;
  y?: number;
  s?: number;
  r?: number; // радиус точки
  step?: number; // шаг сетки
  breakAt?: number; // момент распада (внешняя опора не держит)
  breakDur?: number;
  morphTo?: string; // перестройка в другой силуэт (аргумент меняет критерий)
  morphAt?: number;
  morphDur?: number;
  spread?: number; // насколько далеко разлетаются исходные точки
  mono?: string; // один цвет для всех точек
  outline?: boolean; // тонкий контур-обводка точек для контраста на светлом фоне
};

// Позиция одной точки в разлёте: стабильный «хаос» по номеру.
const scatterOf = (i: number, spread: number): [number, number] => {
  const a = rnd(i, 1) * Math.PI * 2;
  const d = (0.55 + rnd(i, 2) * 0.6) * spread;
  return [Math.cos(a) * d, Math.sin(a) * d * 0.62];
};

export const Particles: React.FC<ParticleProps> = ({
  shape, t, at, dur = 1.8, x = 960, y = 520, s = 1, r = 5.2, step = 15, breakAt, breakDur = 1.6, morphTo, morphAt, morphDur = 1.8, spread = 760, mono, outline = true,
}) => {
  const A = sample(`${shape}:${step}`, SHAPES[shape], step);
  const B = morphTo ? sample(`${morphTo}:${step}`, SHAPES[morphTo], step) : null;
  const n = B ? Math.max(A.length, B.length) : A.length;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = A[i % A.length];
    const delay = rnd(i, 3) * dur * 0.45;
    const k = ease(clamp01((t - at - delay) / (dur * 0.55)));
    if (k <= 0) continue;
    const [sx, sy] = scatterOf(i, spread);
    let px = sx + (a.x - sx) * k;
    let py = sy + (a.y - sy) * k;
    let col = mono ?? a.color;
    let op = clamp01(k * 1.6);
    if (B && morphAt !== undefined) {
      const b = B[i % B.length];
      const md = rnd(i, 4) * morphDur * 0.4;
      const m = ease(clamp01((t - morphAt - md) / (morphDur * 0.6)));
      if (m > 0) {
        // точка летит по дуге: видно, что связь «переставляется», а не исчезает
        const lift = Math.sin(m * Math.PI) * (rnd(i, 5) - 0.5) * 140;
        px = px + (b.x - px) * m + lift;
        py = py + (b.y - py) * m - Math.abs(lift) * 0.4;
        if (m > 0.5) col = mono ?? b.color;
        if (i >= B.length && m > 0.6) op *= clamp01((1 - m) * 2.5); // лишние точки растворяются
        if (i >= A.length && m < 0.2) op *= m * 5;
      } else if (i >= A.length) continue;
    }
    if (breakAt !== undefined) {
      const bd = rnd(i, 6) * breakDur * 0.5;
      const b = clamp01((t - breakAt - bd) / (breakDur * 0.6));
      if (b > 0) {
        const fall = b * b;
        px += (rnd(i, 7) - 0.5) * 260 * b;
        py += fall * (220 + rnd(i, 8) * 260);
        op *= 1 - b;
      }
    }
    if (op <= 0.02) continue;
    dots.push(<circle key={i} cx={px} cy={py} r={r} fill={col} opacity={op} stroke={outline ? "#1d2333" : undefined} strokeWidth={outline ? 0.9 : 0} strokeOpacity={0.35} />);
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{dots}</g>;
};
