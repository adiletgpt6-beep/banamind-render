// Точечная сборка BM-019: образ собирается из чётких точек (репутация из
// неполных наблюдений), письмо переставляет точки, ложная уверенность
// распадается. Правила качества: точки крупные и контрастные, без размытия
// и bloom; положение каждой точки зависит только от её номера и времени —
// одинаковое в каждом кадре, без мерцания. После сборки силуэт читается.
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

// Готовые силуэты (координаты относительно центра, размер ≈ 560×560).
const INK = "#1f2a3d";
export const SHAPES: Record<string, Prim[]> = {
  // портрет-оценка: голова, шея, плечи во фраке/платье
  man: [
    { c: "poly", pts: [[-230, 270], [-200, 120], [-120, 70], [-40, 55], [40, 55], [120, 70], [200, 120], [230, 270]], color: "#2f8f9d" },
    { c: "poly", pts: [[-40, 55], [0, 150], [40, 55]], color: "#fbf5e8" },
    { c: "rect", x: -30, y: 10, w: 60, h: 55, color: "#f1c9a5" },
    { c: "ellipse", x: 0, y: -70, rx: 95, ry: 110, color: "#f1c9a5" },
    { c: "poly", pts: [[-100, -80], [-90, -160], [-30, -195], [50, -190], [100, -150], [100, -80], [70, -130], [-60, -135]], color: INK },
    // холодное лицо: брови к переносице, прямой рот
    { c: "poly", pts: [[-62, -104], [-18, -86], [-20, -74], [-62, -90]], color: INK },
    { c: "poly", pts: [[62, -104], [18, -86], [20, -74], [62, -90]], color: INK },
    { c: "ellipse", x: -36, y: -56, rx: 13, ry: 11, color: INK },
    { c: "ellipse", x: 36, y: -56, rx: 13, ry: 11, color: INK },
    { c: "rect", x: -34, y: -8, w: 68, h: 10, color: "#b0604a" },
  ],
  // «приятный» портрет: тёплый мундир, волнистые волосы, улыбка
  man2: [
    { c: "poly", pts: [[-230, 270], [-200, 120], [-120, 70], [-40, 55], [40, 55], [120, 70], [200, 120], [230, 270]], color: "#c94a4a" },
    { c: "poly", pts: [[-40, 55], [0, 150], [40, 55]], color: "#fbf5e8" },
    { c: "rect", x: -150, y: 150, w: 300, h: 14, color: "#e3a93a" },
    { c: "rect", x: -30, y: 10, w: 60, h: 55, color: "#f1c9a5" },
    { c: "ellipse", x: 0, y: -70, rx: 95, ry: 110, color: "#f1c9a5" },
    { c: "poly", pts: [[-104, -60], [-110, -150], [-60, -200], [10, -205], [80, -190], [112, -140], [104, -60], [80, -120], [30, -140], [-20, -128], [-70, -130]], color: "#6b4a2a" },
    { c: "poly", pts: [[-60, -100], [-16, -106], [-16, -96], [-60, -90]], color: "#6b4a2a" },
    { c: "poly", pts: [[60, -100], [16, -106], [16, -96], [60, -90]], color: "#6b4a2a" },
    { c: "ellipse", x: -36, y: -58, rx: 13, ry: 13, color: INK },
    { c: "ellipse", x: 36, y: -58, rx: 13, ry: 13, color: INK },
    { c: "ellipse", x: 0, y: -8, rx: 46, ry: 26, color: "#b0604a" },
    { c: "ellipse", x: 0, y: -24, rx: 50, ry: 22, color: "#f1c9a5" },
    { c: "ellipse", x: -62, y: -20, rx: 16, ry: 10, color: "#eaa59a" },
    { c: "ellipse", x: 62, y: -20, rx: 16, ry: 10, color: "#eaa59a" },
  ],
  woman: [
    { c: "poly", pts: [[-210, 270], [-190, 130], [-110, 80], [-40, 62], [40, 62], [110, 80], [190, 130], [210, 270]], color: "#e0697a" },
    { c: "rect", x: -28, y: 10, w: 56, h: 60, color: "#f1c9a5" },
    { c: "ellipse", x: 0, y: -66, rx: 88, ry: 104, color: "#f1c9a5" },
    { c: "poly", pts: [[-98, -40], [-104, -130], [-50, -180], [50, -180], [104, -130], [98, -40], [70, -120], [-70, -120]], color: "#6b3f2a" },
    { c: "circle", x: 0, y: -185, r: 52, color: "#6b3f2a" },
  ],
  house: [
    { c: "rect", x: -250, y: -60, w: 500, h: 300, color: "#c9a27a" },
    { c: "poly", pts: [[-280, -60], [0, -230], [280, -60]], color: "#b8664a" },
    { c: "rect", x: -40, y: 120, w: 80, h: 120, color: INK },
    { c: "rect", x: -200, y: 0, w: 80, h: 80, color: "#fbf5e8" },
    { c: "rect", x: 120, y: 0, w: 80, h: 80, color: "#fbf5e8" },
    { c: "rect", x: -200, y: 130, w: 80, h: 70, color: "#fbf5e8" },
    { c: "rect", x: 120, y: 130, w: 80, h: 70, color: "#fbf5e8" },
  ],
  letter: [
    { c: "rect", x: -260, y: -170, w: 520, h: 340, color: "#efe2c6" },
    { c: "poly", pts: [[-260, -170], [0, 30], [260, -170]], color: "#e3a93a" },
    { c: "circle", x: 0, y: 30, r: 34, color: "#cc4646" },
  ],
  heart: [
    { c: "circle", x: -95, y: -60, r: 120, color: "#e0697a" },
    { c: "circle", x: 95, y: -60, r: 120, color: "#e0697a" },
    { c: "poly", pts: [[-205, -10], [0, 230], [205, -10], [0, -40]], color: "#e0697a" },
  ],
  question: [
    { c: "ellipse", x: 0, y: -90, rx: 150, ry: 140, color: "#2f8f9d" },
    { c: "hole", x: 0, y: -90, rx: 80, ry: 72 },
    { c: "cut", x: -170, y: -90, w: 170, h: 120 },
    { c: "rect", x: -40, y: -10, w: 80, h: 110, color: "#2f8f9d" },
    { c: "circle", x: 0, y: 185, r: 48, color: "#2f8f9d" },
  ],
  ring: [
    { c: "ellipse", x: 0, y: 30, rx: 200, ry: 200, color: "#e3a93a" },
    { c: "hole", x: 0, y: 30, rx: 150, ry: 150 },
    { c: "poly", pts: [[-70, -170], [0, -260], [70, -170], [0, -120]], color: "#9cc6e8" },
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
  breakAt?: number; // момент распада (ложная уверенность распадается)
  breakDur?: number;
  morphTo?: string; // перестройка в другой силуэт (письмо переставляет точки)
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
    dots.push(<circle key={i} cx={px} cy={py} r={r} fill={col} opacity={op} stroke={outline ? "#1f2a3d" : undefined} strokeWidth={outline ? 0.9 : 0} strokeOpacity={0.35} />);
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{dots}</g>;
};
