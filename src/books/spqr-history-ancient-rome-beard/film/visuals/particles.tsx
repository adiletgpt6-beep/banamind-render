// Точечная сборка BM-040 (механика из BM-027): образ собирается из чётких точек (мысль письма
// складывается в предмет-схему), перестраивается в другой образ после
// аргумента или распадается, когда ложная опора оказывается внешней. Правила качества: точки крупные и контрастные, без размытия
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

// Готовые силуэты (координаты относительно центра, размер ≈ 560×560) — образы
// Мастерской BM-027: конверт, коробка, человек, двое друзей, дерево с корнями,
// компас, корабль, весы, лампа, лестница желаний, знак вопроса. Без часов,
// песочных часов и циферблатов: тема времени не превращается в отсчёт.
const INK = "#1f2a3d";
const AMB = "#e39a2d";
const TEAL = "#1f9a9a";
const CORAL = "#e8735f";
const SKIN = "#f1c9a5";
export const SHAPES: Record<string, Prim[]> = {
  envelope: [
    { c: "rect", x: -260, y: -170, w: 520, h: 340, color: "#e9cf9c" },
    { c: "poly", pts: [[-260, -170], [0, 30], [260, -170]], color: AMB },
    { c: "poly", pts: [[-260, 170], [0, 10], [260, 170]], color: "#d9b77a" },
    { c: "circle", x: 0, y: 30, r: 40, color: CORAL },
  ],
  box: [
    { c: "rect", x: -220, y: -180, w: 440, h: 360, color: TEAL },
    { c: "rect", x: -190, y: -150, w: 380, h: 300, color: "#bfe6e2" },
    { c: "poly", pts: [[-220, -180], [-150, -250], [290, -250], [220, -180]], color: "#167a7a" },
    { c: "poly", pts: [[220, -180], [290, -250], [290, 110], [220, 180]], color: "#167a7a" },
  ],
  person: [
    { c: "poly", pts: [[-170, 270], [-160, 90], [-90, 50], [90, 50], [160, 90], [170, 270]], color: TEAL },
    { c: "circle", x: 0, y: -60, r: 100, color: SKIN },
    { c: "ellipse", x: -34, y: -70, rx: 13, ry: 13, color: INK },
    { c: "ellipse", x: 34, y: -70, rx: 13, ry: 13, color: INK },
    { c: "rect", x: -34, y: -18, w: 68, h: 10, color: "#b0604a" },
  ],
  friends: [
    { c: "poly", pts: [[-280, 270], [-270, 110], [-210, 70], [-90, 70], [-40, 110], [-30, 270]], color: TEAL },
    { c: "circle", x: -150, y: -30, r: 80, color: SKIN },
    { c: "poly", pts: [[30, 270], [40, 110], [90, 70], [210, 70], [270, 110], [280, 270]], color: AMB },
    { c: "circle", x: 150, y: -30, r: 80, color: SKIN },
    { c: "rect", x: -40, y: 140, w: 80, h: 34, color: SKIN },
  ],
  tree: [
    { c: "ellipse", x: 0, y: -120, rx: 230, ry: 150, color: "#6c9a6e" },
    { c: "ellipse", x: -120, y: -60, rx: 110, ry: 90, color: "#7fb07f" },
    { c: "ellipse", x: 120, y: -70, rx: 110, ry: 90, color: "#7fb07f" },
    { c: "rect", x: -30, y: -20, w: 60, h: 200, color: "#8a5a34" },
    { c: "poly", pts: [[-30, 170], [-200, 260], [-180, 270], [0, 200], [180, 270], [200, 260], [30, 170]], color: "#8a5a34" },
    { c: "poly", pts: [[-10, 190], [-60, 280], [-40, 284], [0, 220], [40, 284], [60, 280], [10, 190]], color: "#8a5a34" },
  ],
  compass: [
    { c: "circle", x: 0, y: 0, r: 240, color: INK },
    { c: "circle", x: 0, y: 0, r: 210, color: "#fff9ee" },
    { c: "poly", pts: [[0, -190], [40, 0], [0, 30], [-40, 0]], color: CORAL },
    { c: "poly", pts: [[0, 190], [40, 0], [0, -30], [-40, 0]], color: TEAL },
    { c: "circle", x: 0, y: 0, r: 26, color: AMB },
  ],
  ship: [
    { c: "poly", pts: [[-260, 90], [260, 90], [190, 200], [-190, 200]], color: "#8a5a34" },
    { c: "rect", x: -12, y: -230, w: 24, h: 320, color: INK },
    { c: "poly", pts: [[20, -220], [220, 60], [20, 60]], color: "#fff9ee" },
    { c: "poly", pts: [[-20, -170], [-190, 60], [-20, 60]], color: AMB },
    { c: "poly", pts: [[-300, 230], [-150, 205], [0, 230], [150, 205], [300, 230], [300, 270], [-300, 270]], color: "#8fc3e6" },
  ],
  scales: [
    { c: "rect", x: -14, y: -210, w: 28, h: 400, color: INK },
    { c: "rect", x: -120, y: 180, w: 240, h: 30, color: INK },
    { c: "rect", x: -250, y: -200, w: 500, h: 22, color: INK },
    { c: "poly", pts: [[-260, -60], [-110, -60], [-150, 0], [-220, 0]], color: AMB },
    { c: "poly", pts: [[110, -60], [260, -60], [220, 0], [150, 0]], color: TEAL },
    { c: "circle", x: 0, y: -230, r: 30, color: AMB },
  ],
  lamp: [
    { c: "ellipse", x: 0, y: 60, rx: 240, ry: 90, color: AMB },
    { c: "ellipse", x: 0, y: 40, rx: 200, ry: 60, color: "#f8d9a6" },
    { c: "poly", pts: [[180, 60], [290, 10], [300, 40], [200, 100]], color: AMB },
    { c: "ellipse", x: -230, y: 40, rx: 50, ry: 70, color: AMB },
    { c: "hole", x: -230, y: 40, rx: 26, ry: 42 },
    { c: "ellipse", x: 300, y: -40, rx: 34, ry: 70, color: CORAL },
    { c: "ellipse", x: 300, y: -60, rx: 16, ry: 36, color: "#ffd23f" },
  ],
  ladder: [
    { c: "rect", x: -170, y: -270, w: 30, h: 540, color: CORAL },
    { c: "rect", x: 140, y: -270, w: 30, h: 540, color: CORAL },
    { c: "rect", x: -150, y: 200, w: 300, h: 26, color: CORAL },
    { c: "rect", x: -150, y: 100, w: 300, h: 26, color: CORAL },
    { c: "rect", x: -150, y: 0, w: 300, h: 26, color: CORAL },
    { c: "rect", x: -150, y: -100, w: 300, h: 26, color: CORAL },
    { c: "rect", x: -150, y: -200, w: 300, h: 26, color: CORAL },
  ],
  door: [
    { c: "rect", x: -190, y: -270, w: 380, h: 540, color: INK },
    { c: "rect", x: -160, y: -240, w: 320, h: 510, color: "#fff4d6" },
    { c: "poly", pts: [[-160, -240], [40, -200], [40, 290], [-160, 270]], color: TEAL },
    { c: "circle", x: 10, y: 40, r: 16, color: AMB },
  ],
  question: [
    { c: "ellipse", x: 0, y: -90, rx: 150, ry: 140, color: TEAL },
    { c: "hole", x: 0, y: -90, rx: 80, ry: 72 },
    { c: "cut", x: -170, y: -90, w: 170, h: 120 },
    { c: "rect", x: -40, y: -10, w: 80, h: 110, color: TEAL },
    { c: "circle", x: 0, y: 185, r: 48, color: TEAL },
  ],
  // ── образы «Мастерской городских ворот» BM-040 (условные, не реконструкции) ──
  gate: [
    { c: "rect", x: -270, y: -200, w: 540, h: 470, color: "#d9c6a2" },
    { c: "rect", x: -300, y: -250, w: 160, h: 520, color: "#c9b796" },
    { c: "rect", x: 140, y: -250, w: 160, h: 520, color: "#c9b796" },
    { c: "rect", x: -310, y: -280, w: 620, h: 50, color: CORAL },
    { c: "rect", x: -300, y: -310, w: 50, h: 40, color: CORAL },
    { c: "rect", x: -190, y: -310, w: 50, h: 40, color: CORAL },
    { c: "rect", x: 140, y: -310, w: 50, h: 40, color: CORAL },
    { c: "rect", x: 250, y: -310, w: 50, h: 40, color: CORAL },
    { c: "ellipse", x: 0, y: -40, rx: 120, ry: 120, color: "#fff4d6" },
    { c: "rect", x: -120, y: -40, w: 240, h: 310, color: "#fff4d6" },
    { c: "rect", x: -96, y: -10, w: 86, h: 280, color: AMB },
    { c: "rect", x: 10, y: -10, w: 86, h: 280, color: AMB },
  ],
  tablet: [
    { c: "rect", x: -270, y: -190, w: 540, h: 380, color: "#b9772f" },
    { c: "rect", x: -240, y: -160, w: 480, h: 320, color: AMB },
    { c: "rect", x: -200, y: -120, w: 400, h: 22, color: "#8a5a34" },
    { c: "rect", x: -200, y: -70, w: 360, h: 22, color: "#8a5a34" },
    { c: "rect", x: -200, y: -20, w: 400, h: 22, color: "#8a5a34" },
    { c: "rect", x: -200, y: 30, w: 300, h: 22, color: "#8a5a34" },
    { c: "rect", x: -200, y: 80, w: 380, h: 22, color: "#8a5a34" },
    { c: "circle", x: -250, y: -170, r: 14, color: "#8a5a34" },
    { c: "circle", x: 250, y: -170, r: 14, color: "#8a5a34" },
  ],
  scroll: [
    { c: "rect", x: -200, y: -220, w: 400, h: 440, color: "#f3e3bf" },
    { c: "ellipse", x: 0, y: -230, rx: 230, ry: 40, color: "#d9b77a" },
    { c: "ellipse", x: 0, y: 230, rx: 230, ry: 40, color: "#d9b77a" },
    { c: "rect", x: -150, y: -140, w: 300, h: 16, color: INK },
    { c: "rect", x: -150, y: -90, w: 260, h: 16, color: INK },
    { c: "rect", x: -150, y: -40, w: 300, h: 16, color: INK },
    { c: "rect", x: -150, y: 10, w: 220, h: 16, color: INK },
    { c: "rect", x: -150, y: 60, w: 280, h: 16, color: INK },
    { c: "circle", x: 110, y: 140, r: 42, color: CORAL },
  ],
  ballot: [
    { c: "rect", x: -230, y: -40, w: 460, h: 300, color: TEAL },
    { c: "rect", x: -200, y: -10, w: 400, h: 240, color: "#bfe6e2" },
    { c: "rect", x: -120, y: -30, w: 240, h: 26, color: INK },
    { c: "poly", pts: [[-90, -60], [90, -60], [90, -280], [-90, -280]], color: "#fff9ee" },
    { c: "rect", x: -60, y: -240, w: 120, h: 18, color: INK },
    { c: "rect", x: -60, y: -200, w: 90, h: 18, color: INK },
    { c: "circle", x: 0, y: 120, r: 46, color: AMB },
  ],
  badge: [
    { c: "circle", x: 0, y: 0, r: 230, color: "#b9772f" },
    { c: "circle", x: 0, y: 0, r: 196, color: AMB },
    { c: "circle", x: 0, y: 0, r: 120, color: "#f8d9a6" },
    { c: "poly", pts: [[0, -90], [26, -28], [92, -28], [38, 12], [58, 78], [0, 38], [-58, 78], [-38, 12], [-92, -28], [-26, -28]], color: CORAL },
    { c: "rect", x: -40, y: 220, w: 80, h: 60, color: TEAL },
  ],
  diploma: [
    { c: "rect", x: -250, y: -180, w: 240, h: 360, color: AMB },
    { c: "rect", x: 10, y: -180, w: 240, h: 360, color: "#b9772f" },
    { c: "rect", x: -220, y: -140, w: 180, h: 16, color: "#8a5a34" },
    { c: "rect", x: -220, y: -100, w: 150, h: 16, color: "#8a5a34" },
    { c: "rect", x: -220, y: -60, w: 180, h: 16, color: "#8a5a34" },
    { c: "rect", x: 40, y: -140, w: 180, h: 16, color: "#f8d9a6" },
    { c: "rect", x: 40, y: -100, w: 140, h: 16, color: "#f8d9a6" },
    { c: "rect", x: -10, y: 30, w: 20, h: 230, color: INK },
    { c: "circle", x: 0, y: 140, r: 60, color: TEAL },
  ],
  coin: [
    { c: "circle", x: 0, y: 0, r: 240, color: "#b9772f" },
    { c: "circle", x: 0, y: 0, r: 210, color: "#e3a93a" },
    { c: "ellipse", x: 0, y: -10, rx: 90, ry: 110, color: "#b9772f" },
    { c: "rect", x: -60, y: 90, w: 120, h: 70, color: "#b9772f" },
    { c: "hole", x: 30, y: -30, rx: 16, ry: 16 },
  ],
  stele: [
    { c: "poly", pts: [[-170, 280], [-170, -150], [0, -270], [170, -150], [170, 280]], color: "#d9c6a2" },
    { c: "poly", pts: [[-130, -140], [0, -230], [130, -140]], color: "#c9b796" },
    { c: "rect", x: -120, y: -100, w: 240, h: 150, color: "#e9dfcc" },
    { c: "circle", x: -40, y: -40, r: 34, color: SKIN },
    { c: "circle", x: 40, y: -40, r: 34, color: SKIN },
    { c: "rect", x: -110, y: 90, w: 220, h: 14, color: INK },
    { c: "rect", x: -110, y: 130, w: 180, h: 14, color: INK },
    { c: "rect", x: -110, y: 170, w: 200, h: 14, color: INK },
  ],
  network: [
    { c: "circle", x: 0, y: 0, r: 70, color: CORAL },
    { c: "circle", x: -230, y: -150, r: 34, color: TEAL },
    { c: "circle", x: 240, y: -170, r: 34, color: TEAL },
    { c: "circle", x: 260, y: 140, r: 34, color: TEAL },
    { c: "circle", x: -250, y: 160, r: 34, color: TEAL },
    { c: "circle", x: 0, y: 250, r: 30, color: TEAL },
    { c: "poly", pts: [[-10, -10], [-230, -160], [-220, -140], [10, 10]], color: AMB },
    { c: "poly", pts: [[10, -10], [240, -180], [230, -160], [-10, 10]], color: AMB },
    { c: "poly", pts: [[10, 10], [260, 130], [250, 150], [-10, -10]], color: AMB },
    { c: "poly", pts: [[-10, 10], [-250, 150], [-240, 170], [10, -10]], color: AMB },
    { c: "rect", x: -8, y: 0, w: 16, h: 250, color: AMB },
  ],
  column: [
    { c: "rect", x: -170, y: -270, w: 340, h: 50, color: "#c9b796" },
    { c: "rect", x: -120, y: -220, w: 240, h: 450, color: "#e9dfcc" },
    { c: "rect", x: -90, y: -220, w: 14, h: 450, color: "#c9b796" },
    { c: "rect", x: -30, y: -220, w: 14, h: 450, color: "#c9b796" },
    { c: "rect", x: 30, y: -220, w: 14, h: 450, color: "#c9b796" },
    { c: "rect", x: 80, y: -220, w: 14, h: 450, color: "#c9b796" },
    { c: "rect", x: -170, y: 230, w: 340, h: 50, color: "#c9b796" },
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
    dots.push(<circle key={i} cx={px} cy={py} r={r} fill={col} opacity={op} stroke={outline ? "#1f2a3d" : undefined} strokeWidth={outline ? 0.9 : 0} strokeOpacity={0.35} />);
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{dots}</g>;
};
