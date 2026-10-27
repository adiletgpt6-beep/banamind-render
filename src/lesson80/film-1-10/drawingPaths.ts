// Детские рисунки фильма 80-1-10: 25 карточек (по одной на ученика), бумажная
// лодочка на карточке Амира, подпись «Лодочку сложил Амир» и прежний рисунок
// Земли из 80-1-7. Чистый модуль без React: его читают хореография (кончик
// карандаша), компоненты карточек и Node-тесты.
//
// Каждый рисунок — упорядоченный список штрихов цветными карандашами и
// мелками: сначала контуры, затем заливки «каракулями» и штриховкой (один
// непрерывный зигзаг на заливку — так ребёнок закрашивает, не отрывая руки).
// Неровность линий задана в самих путях: детерминированный шум по длине
// линии (сид — от названия рисунка), с возрастом ребёнка линии ровнее, а
// рисунок подробнее. Природа без лиц и улыбок. Единицы карточки — 300 × 202
// (CARD_UNITS), ось y вниз.
//
// Проявление: доля progress 0…1 проходит штрихи по порядку пропорционально
// длине; между штрихами карандаш переносится по воздуху (небольшая доля
// progress резервируется на перенос, поэтому кончик движется непрерывно).
import { getLength, getPointAtLength } from "@remotion/paths";
import type { DrawingKind } from "./roster.ts";
import { CARD_UNITS } from "./layout.ts";

// ---------- Типы ----------
export type Stroke = {
  readonly d: string; // один непрерывный подпуть (кончик карандаша идёт по нему)
  readonly color: string;
  readonly w: number; // толщина, единицы карточки
  readonly o: number; // непрозрачность штриха
  readonly fill: boolean; // заливка мелком (рисуется под контурами)
  readonly under?: number; // ширина мягкого широкого прохода мелка вдоль того же пути
  readonly clip?: string; // область отсечения (even-odd), единицы карточки
  readonly cut?: string; // вырез: области, где штриха нет (кольцо вокруг листа + дыры, even-odd)
  readonly pre?: number; // дополнительная пауза с поднятым карандашом перед штрихом (единицы плана)
  readonly len: number; // длина пути (getLength)
};

export type Tip = { readonly x: number; readonly y: number; readonly down: boolean; readonly color: string };

type P = readonly [number, number];
type Rnd = () => number;

export const CARD_W = CARD_UNITS.w;
export const CARD_H = CARD_UNITS.h;

// Возраст автора каждого рисунка (как в составе класса roster.ts).
export const DRAWING_AGE: Record<DrawingKind, number> = {
  apple: 4,
  tree: 8,
  earth: 11,
  sun: 5,
  tulip: 5,
  cloud: 6,
  bird: 6,
  daisy: 7,
  mountains: 7,
  river: 7,
  lake: 8,
  leaf: 8,
  rainbow: 9,
  grass: 9,
  berryBush: 9,
  butterfly: 10,
  shell: 10,
  stone: 10,
  rain: 11,
  hills: 11,
  snowflake: 11,
  moon: 12,
  sea: 12,
  stars: 12,
  waterfall: 12,
};

// ---------- Детерминированный шум ----------
const rnd = (seed: number): Rnd => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const seedOf = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const sym = (r: Rnd, a: number) => (r() * 2 - 1) * a;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const dist = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerpP = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const DEG = Math.PI / 180;

// ---------- Пути ----------
const n1 = (v: number) => String(Math.round(v * 10) / 10);
const pt = (p: P) => `${n1(p[0])} ${n1(p[1])}`;

// Сглаженный путь через точки (Катмулл — Ром → кубические Безье).
const curveD = (pts: readonly P[], closed = false): string => {
  const n = pts.length;
  if (n === 0) return "M 0 0";
  if (n === 1) return `M ${pt(pts[0])} l 0.1 0`;
  if (n === 2) return `M ${pt(pts[0])} L ${pt(pts[1])}`;
  const g = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${pt(pts[0])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? `${d} Z` : d;
};
const lineD = (pts: readonly P[], closed = false) => `M ${pts.map(pt).join(" L ")}${closed ? " Z" : ""}`;

// Точки сглаженной кривой с шагом ≈ step.
const sampleCR = (ctrl: readonly P[], closed: boolean, step = 4): P[] => {
  const n = ctrl.length;
  const g = (i: number) => (closed ? ctrl[((i % n) + n) % n] : ctrl[Math.max(0, Math.min(n - 1, i))]);
  const out: P[] = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    const k = Math.max(2, Math.ceil(dist(p1, p2) / step));
    for (let j = 0; j < k; j++) {
      const t = j / k;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  if (!closed) out.push(ctrl[n - 1]);
  return out;
};

// Ломаная с шагом ≈ step (вершины сохраняются).
const resample = (pts: readonly P[], step: number, closed = false): P[] => {
  const n = pts.length;
  const out: P[] = [];
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const k = Math.max(1, Math.ceil(dist(a, b) / step));
    for (let j = 0; j < k; j++) out.push(lerpP(a, b, j / k));
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
};

// Плавная «дрожь руки»: смещение по нормали, узлы шума через ≈ wl единиц.
const wobble = (pts: readonly P[], r: Rnd, amp: number, wl = 22, closed = false): P[] => {
  const n = pts.length;
  if (n < 3 || amp <= 0) return pts.slice();
  const s: number[] = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + dist(pts[i - 1], pts[i]));
  const total = s[n - 1] + (closed ? dist(pts[n - 1], pts[0]) : 0) || 1;
  const knots = Math.max(2, Math.round(total / wl) + 1);
  const kv = Array.from({ length: knots + 1 }, () => sym(r, amp));
  if (closed) kv[knots] = kv[0];
  const val = (u: number) => {
    const x = (u / total) * knots;
    const i = Math.min(knots - 1, Math.floor(x));
    const f = x - i;
    const e = (1 - Math.cos(Math.PI * f)) / 2;
    return kv[i] + (kv[i + 1] - kv[i]) * e;
  };
  return pts.map((p, i) => {
    const prev = pts[i > 0 ? i - 1 : closed ? n - 1 : 0];
    const next = pts[i < n - 1 ? i + 1 : closed ? 0 : n - 1];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const l = Math.hypot(tx, ty) || 1;
    const v = val(s[i]);
    return [p[0] - (ty / l) * v, p[1] + (tx / l) * v] as P;
  });
};

// ---------- Формы (замкнутые многоугольники) ----------
const blob = (ctrl: readonly P[], step = 4): P[] => sampleCR(ctrl, true, step);
const polyShape = (ctrl: readonly P[], step = 4): P[] => resample(ctrl, step, true);
const ellipse = (cx: number, cy: number, rx: number, ry: number, rot = 0, step = 4): P[] => {
  const n = Math.max(14, Math.ceil((2 * Math.PI * Math.max(rx, ry)) / step));
  const c = Math.cos(rot * DEG);
  const s = Math.sin(rot * DEG);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    return [cx + x * c - y * s, cy + x * s + y * c] as P;
  });
};
const rect = (x0: number, y0: number, x1: number, y1: number): P[] => polyShape([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 8);
// Облачко/куст: объединение кругов, обход по углу от центра.
const circles = (cs: readonly (readonly [number, number, number])[], step = 4): P[] => {
  const pts: P[] = [];
  cs.forEach(([cx, cy, rr], k) => {
    const n = Math.max(12, Math.ceil((2 * Math.PI * rr) / step));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const p: P = [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
      if (!cs.some(([x, y, q], j) => j !== k && Math.hypot(p[0] - x, p[1] - y) < q - 0.2)) pts.push(p);
    }
  });
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  return pts.sort((a, b) => Math.atan2(a[1] - my, a[0] - mx) - Math.atan2(b[1] - my, b[0] - mx));
};
// Детское облако: «барашки» — дуги кругов слева направо по верху, снизу —
// почти ровная, чуть провисшая линия. bs — круги-барашки слева направо.
const cloudShape = (bs: readonly (readonly [number, number, number])[], sag = 3, step = 3): P[] => {
  const n = bs.length;
  const upper = (a: readonly [number, number, number], b: readonly [number, number, number]) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const aa = (a[2] * a[2] - b[2] * b[2] + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, a[2] * a[2] - aa * aa));
    const xm = a[0] + (aa * (b[0] - a[0])) / d;
    const ym = a[1] + (aa * (b[1] - a[1])) / d;
    const p1: P = [xm + (h * (b[1] - a[1])) / d, ym - (h * (b[0] - a[0])) / d];
    const p2: P = [xm - (h * (b[1] - a[1])) / d, ym + (h * (b[0] - a[0])) / d];
    return p1[1] < p2[1] ? p1 : p2;
  };
  const angOf = (c: readonly [number, number, number], p: P) => {
    let t = Math.atan2(p[1] - c[1], p[0] - c[0]);
    while (t < Math.PI / 2) t += Math.PI * 2;
    while (t > (Math.PI * 5) / 2) t -= Math.PI * 2;
    return t;
  };
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const c = bs[i];
    const t0 = i === 0 ? Math.PI / 2 : angOf(c, upper(bs[i - 1], c));
    let t1 = i === n - 1 ? (Math.PI * 5) / 2 : angOf(c, upper(c, bs[i + 1]));
    if (t1 < t0) t1 += Math.PI * 2;
    const k = Math.max(2, Math.ceil(((t1 - t0) * c[2]) / step));
    for (let j = 0; j < k; j++) {
      const t = t0 + ((t1 - t0) * j) / k;
      pts.push([c[0] + Math.cos(t) * c[2], c[1] + Math.sin(t) * c[2]]);
    }
  }
  const last = bs[n - 1];
  const first = bs[0];
  const a: P = [last[0], last[1] + last[2]];
  const b: P = [first[0], first[1] + first[2]];
  const m = Math.max(2, Math.ceil(dist(a, b) / step));
  for (let j = 0; j < m; j++) {
    const t = j / m;
    const q = lerpP(a, b, t);
    pts.push([q[0], q[1] + sag * Math.sin(Math.PI * t)]);
  }
  return pts;
};
type C3 = readonly [number, number, number];
// Верхняя огибающая цепочки кругов слева направо (кусты, пена): от левой
// точки первого круга через верх к правой точке последнего. up = false —
// нижняя огибающая (тоже слева направо).
const arcChain = (bs: readonly C3[], up = true, step = 3): P[] => {
  const src = up ? bs : bs.map(([x, y, q]) => [x, -y, q] as C3);
  const top = (a: C3, b: C3): P => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6;
    const aa = (a[2] * a[2] - b[2] * b[2] + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, a[2] * a[2] - aa * aa));
    const xm = a[0] + (aa * (b[0] - a[0])) / d;
    const ym = a[1] + (aa * (b[1] - a[1])) / d;
    const p1: P = [xm + (h * (b[1] - a[1])) / d, ym - (h * (b[0] - a[0])) / d];
    const p2: P = [xm - (h * (b[1] - a[1])) / d, ym + (h * (b[0] - a[0])) / d];
    return p1[1] < p2[1] ? p1 : p2;
  };
  const ang = (c: C3, p: P) => {
    const t = Math.atan2(p[1] - c[1], p[0] - c[0]);
    return t <= 0 ? t + Math.PI * 2 : t;
  };
  const pts: P[] = [];
  const n = src.length;
  for (let i = 0; i < n; i++) {
    const c = src[i];
    const t0 = i === 0 ? Math.PI : ang(c, top(src[i - 1], c));
    const t1 = i === n - 1 ? Math.PI * 2 : ang(c, top(c, src[i + 1]));
    const k = Math.max(2, Math.ceil((Math.abs(t1 - t0) * c[2]) / step));
    for (let j = 0; j < k + (i === n - 1 ? 1 : 0); j++) {
      const t = t0 + ((t1 - t0) * j) / k;
      pts.push([c[0] + Math.cos(t) * c[2], c[1] + Math.sin(t) * c[2]]);
    }
  }
  return up ? pts : pts.map(([x, y]) => [x, -y] as P);
};
// Кудрявая линия-«барашки» (пена): петли вдоль отрезка a → b.
const curlPts = (a: P, b: P, loops: number, R: number, r: Rnd): P[] => {
  const L = dist(a, b);
  const ux = (b[0] - a[0]) / L;
  const uy = (b[1] - a[1]) / L;
  const adv = L / (Math.PI * 2 * loops);
  const n = Math.ceil(loops * 14);
  const rr = Array.from({ length: loops + 2 }, () => R * (0.8 + r() * 0.4));
  return Array.from({ length: n + 1 }, (_, i) => {
    const th = (i / n) * loops * Math.PI * 2;
    const k = Math.min(loops, Math.floor(th / (Math.PI * 2)));
    const q = rr[k];
    const u = adv * th - q * Math.sin(th);
    const v = -q * (1 - Math.cos(th)) * 0.8;
    return [a[0] + ux * u - uy * v, a[1] + uy * u + ux * v] as P;
  });
};
// Рамка-«край раскраски»: чуть неровный прямоугольник внутри полей листа.
const frameShape = (r: Rnd, inset = 12.5): P[] =>
  wobble(polyShape([[inset, inset], [CARD_W - inset, inset], [CARD_W - inset, CARD_H - inset], [inset, CARD_H - inset]], 6), r, 0.8, 26, true);

// Волнистый край (крона, куст): «фестоны» по эллипсу.
const scallop = (cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number, phase = 0, step = 3.5): P[] => {
  const n = Math.ceil((2 * Math.PI * Math.max(rx, ry)) / step);
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2 - Math.PI / 2;
    const ph = (((t + Math.PI / 2) / (Math.PI * 2)) * bumps + phase) % 1;
    const k = 1 - depth + depth * Math.pow(Math.sin(Math.PI * ph), 0.55);
    return [cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k] as P;
  });
};
// Пятиконечная (или n-конечная) звезда.
const starShape = (cx: number, cy: number, R: number, ri: number, rot: number, points = 5): P[] =>
  polyShape(
    Array.from({ length: points * 2 }, (_, i) => {
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2 + rot * DEG;
      const rr = i % 2 === 0 ? R : ri;
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as P;
    }),
    3,
  );
// Серп: круг c1 без круга c2.
const lune = (c1: readonly [number, number, number], c2: readonly [number, number, number], step = 3): P[] => {
  const ring = (c: readonly [number, number, number], keepInside: boolean, o: readonly [number, number, number]) => {
    const n = Math.ceil((2 * Math.PI * c[2]) / step);
    const pts: P[] = [];
    const flags: boolean[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const p: P = [c[0] + Math.cos(a) * c[2], c[1] + Math.sin(a) * c[2]];
      pts.push(p);
      flags.push(Math.hypot(p[0] - o[0], p[1] - o[1]) < o[2] === keepInside);
    }
    let s = flags.findIndex((f, i) => f && !flags[(i - 1 + n) % n]);
    if (s < 0) s = 0;
    const out: P[] = [];
    for (let i = 0; i < n; i++) {
      const j = (s + i) % n;
      if (!flags[j]) break;
      out.push(pts[j]);
    }
    return out;
  };
  const a = ring(c1, false, c2);
  let b = ring(c2, true, c1);
  if (b.length && dist(a[a.length - 1], b[0]) > dist(a[a.length - 1], b[b.length - 1])) b = b.slice().reverse();
  return [...a, ...b];
};
const shift = (pts: readonly P[], dx: number, dy: number): P[] => pts.map((p) => [p[0] + dx, p[1] + dy] as P);
// Контур, раздвинутый наружу на d (по нормали; ориентация — по знаку площади).
const grow = (shape: readonly P[], d: number): P[] => {
  const n = shape.length;
  let A = 0;
  for (let i = 0; i < n; i++) {
    const a = shape[i];
    const b = shape[(i + 1) % n];
    A += a[0] * b[1] - b[0] * a[1];
  }
  const sg = A > 0 ? 1 : -1;
  return shape.map((p, i) => {
    const prev = shape[(i - 1 + n) % n];
    const next = shape[(i + 1) % n];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const l = Math.hypot(tx, ty) || 1;
    return [p[0] + (sg * ty * d) / l, p[1] - (sg * tx * d) / l] as P;
  });
};
const mirrorX = (pts: readonly P[]): P[] => pts.map((p) => [CARD_W - p[0], p[1]] as P).reverse();
const areaD = (shape: readonly P[]) => curveD(shape.filter((_, i) => i % 2 === 0), true);
const polyD = (shape: readonly P[]) => lineD(shape, true);
const cardRect = rect(10, 10, 290, 192);
// Вырез: кольцо далеко вокруг листа + дыры (дыры не должны пересекаться друг с другом).
const RING = "M -40 -40 L 340 -40 L 340 242 L -40 242 Z";
const cutD = (...holes: readonly string[]) => [RING, ...holes].join(" ");

// ---------- Линии ребёнка ----------
type LineOpts = { readonly smooth?: boolean; readonly wl?: number };
// Открытая линия через опорные точки, с «дрожью руки».
const handD = (ctrl: readonly P[], r: Rnd, amp: number, o: LineOpts = {}): string => {
  const smooth = o.smooth ?? true;
  const dense = smooth ? sampleCR(ctrl, false, 5) : resample(ctrl, 5);
  const w = wobble(dense, r, amp, o.wl ?? 22);
  return smooth ? curveD(w) : lineD(w);
};
type LoopOpts = { readonly amp: number; readonly over?: number; readonly drift?: number; readonly start?: number; readonly wl?: number };
// Обводка замкнутой формы: ребёнок начинает в одной точке и заходит чуть
// дальше начала, конец линии немного «уезжает» — линия не смыкается идеально.
const loopD = (shape: readonly P[], r: Rnd, o: LoopOpts): string => {
  const pts = shape.filter((_, i) => i % 2 === 0);
  const n = pts.length;
  const st = Math.floor((o.start ?? r()) * n) % n;
  let per = 0;
  for (let i = 0; i < n; i++) per += dist(pts[i], pts[(i + 1) % n]);
  const step = per / n;
  const extra = Math.max(1, Math.round((o.over ?? 10) / step));
  const seq: P[] = [];
  for (let i = 0; i <= n + extra; i++) seq.push(pts[(st + i) % n]);
  const drift = o.drift ?? 0;
  const sign = r() < 0.5 ? -1 : 1;
  const m = seq.length;
  const ramp = extra * 2 + 2;
  const shifted = seq.map((p, i) => {
    const k = clamp01((i - (m - 1 - ramp)) / ramp);
    const k0 = clamp01(1 - i / (extra + 1));
    const off = sign * (drift * k * k - drift * 0.35 * k0);
    const prev = seq[Math.max(0, i - 1)];
    const next = seq[Math.min(m - 1, i + 1)];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const l = Math.hypot(tx, ty) || 1;
    return [p[0] - (ty / l) * off, p[1] + (tx / l) * off] as P;
  });
  return curveD(wobble(shifted, r, o.amp, o.wl ?? 24));
};

// ---------- Заливки мелком ----------
type Scrib = {
  readonly angle: number; // направление штрихов, градусы
  readonly gap: number; // расстояние между соседними проходами
  readonly over?: number; // заход за край формы (отрицательный — не доходит)
  readonly jit?: number; // разброс точек разворота
  readonly vj?: number; // неравномерность шага (0…0,6)
  readonly smooth?: boolean; // скруглённые развороты (каракули) или острые (штриховка)
};
const crossings = (poly: readonly P[], v: number): number[] => {
  const xs: number[] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    if ((a[1] <= v && b[1] > v) || (b[1] <= v && a[1] > v)) xs.push(a[0] + ((v - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
  }
  return xs;
};
// Один непрерывный зигзаг, покрывающий форму (ребёнок не отрывает руку).
const scribble = (shape: readonly P[], r: Rnd, s: Scrib): string => {
  const a = s.angle * DEG;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const loc = shape.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca] as P);
  let vmin = Infinity;
  let vmax = -Infinity;
  for (const p of loc) {
    vmin = Math.min(vmin, p[1]);
    vmax = Math.max(vmax, p[1]);
  }
  const half = s.gap / 2;
  const jit = s.jit ?? 1;
  const pts: P[] = [];
  let side = r() < 0.5 ? 0 : 1;
  for (let v = vmin + half * 0.7; v <= vmax - half * 0.5; v += half * (1 + sym(r, s.vj ?? 0))) {
    const xs = crossings(loc, v);
    if (xs.length < 2) continue;
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    const over = (s.over ?? 1.5) + sym(r, jit);
    pts.push([side ? hi + over : lo - over, v + sym(r, jit * 0.3)]);
    side = 1 - side;
  }
  if (pts.length < 2) {
    const c = loc.reduce((acc, p) => [acc[0] + p[0] / loc.length, acc[1] + p[1] / loc.length] as P, [0, 0] as P);
    pts.push([c[0] - 1, c[1]], [c[0] + 1, c[1]]);
  }
  const world = pts.map(([u, v]) => [u * ca - v * sa, u * sa + v * ca] as P);
  return s.smooth ? curveD(world) : lineD(world);
};
// Спираль — маленький закрашенный кружок (ягода, глаз, точка).
const spiralD = (cx: number, cy: number, rr: number, r: Rnd, turns = 2.2): string => {
  const n = Math.ceil(turns * 14);
  const a0 = r() * Math.PI * 2;
  return curveD(
    Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      const a = a0 + t * turns * Math.PI * 2;
      const q = rr * (1 - 0.85 * t);
      return [cx + Math.cos(a) * q, cy + Math.sin(a) * q] as P;
    }),
  );
};
// «Барашки» листвы внутри кроны/куста: ⌒⌒⌒ от a к b (n дуг высотой h).
const bumpsLine = (a: P, b: P, n: number, h: number): P[] => {
  const L = dist(a, b);
  const ux = (b[0] - a[0]) / L;
  const uy = (b[1] - a[1]) / L;
  const m = n * 8;
  return Array.from({ length: m + 1 }, (_, i) => {
    const t = i / m;
    const up = h * Math.pow(Math.abs(Math.sin(Math.PI * n * t)), 0.7);
    return [a[0] + (b[0] - a[0]) * t + uy * up, a[1] + (b[1] - a[1]) * t - ux * up] as P;
  });
};

// Пучок травы «\|/» одной линией: кончик → основание → кончик …
const tuftPts = (x: number, y: number, h: number): P[] => [
  [x - 6, y - h * 0.7],
  [x - 1, y],
  [x - 0.5, y - h],
  [x + 1, y],
  [x + 6, y - h * 0.75],
];
// Колосок «ёлочкой» на вершине стебля (x, y — верх колоска).
const earPts = (x: number, y: number, len: number): P[] => {
  const pts: P[] = [];
  const n = Math.round(len / 3.4);
  for (let k = 0; k <= n; k++) {
    const c: P = [x, y + len - k * 3.4];
    const s = k % 2 ? 1 : -1;
    const w = 4.2 * (1 - (k / n) * 0.45);
    pts.push(c, [x + s * w, c[1] - 4.2], c);
  }
  pts.push([x, y - 2]);
  return pts;
};
// Область отсечения фона, у которой края на полях листа вынесены за край
// карточки: внешний край заливки задают сами развороты штрихов (неровно).
const outerD = (poly: readonly P[]) =>
  polyD(poly.map(([x, y]) => [x <= 13 ? -4 : x >= 287 ? 304 : x, y <= 13 ? -4 : y >= 191 ? 206 : y] as P));

// ---------- Конструктор штрихов ----------
type More = { readonly o?: number; readonly under?: number; readonly clip?: string; readonly cut?: string; readonly pre?: number };
const extras = (m: More) => ({
  ...(m.under ? { under: m.under } : {}),
  ...(m.clip ? { clip: m.clip } : {}),
  ...(m.cut ? { cut: m.cut } : {}),
  ...(m.pre ? { pre: m.pre } : {}),
});
const line = (d: string, color: string, w: number, m: More = {}): Stroke => ({ d, color, w, o: m.o ?? 0.92, fill: false, ...extras(m), len: getLength(d) });
type FillOpts = Scrib & More & { readonly w: number };
const fillS = (shape: readonly P[], r: Rnd, color: string, f: FillOpts): Stroke => {
  const d = scribble(shape, r, f);
  return { d, color, w: f.w, o: f.o ?? 0.72, fill: true, ...extras(f), len: getLength(d) };
};
const dot = (cx: number, cy: number, rr: number, r: Rnd, color: string, w: number, o = 0.95): Stroke => line(spiralD(cx, cy, rr, r), color, w, { o });

// Ровность руки по возрасту: 4 года — заметно дрожит, 12 лет — почти ровно.
const ampOf = (age: number) => 2.5 - (Math.min(12, Math.max(4, age)) - 4) * 0.24;

// ---------- Палитра карандашей и мелков ----------
const C = {
  graphite: "#3B3A44",
  red: "#E2483C",
  redDark: "#C1362C",
  orange: "#F18E2C",
  orangeDark: "#E0742A",
  yellow: "#F7C934",
  yellowSoft: "#F6DE86",
  ochre: "#D8A24A",
  green: "#5DAE48",
  greenLight: "#86C95E",
  greenDark: "#3B8A3E",
  sky: "#8EC8EE",
  skyLight: "#B9E0F7",
  blue: "#4A93DC",
  blueDark: "#2F68B4",
  navy: "#22306E",
  brown: "#8A5A35",
  brownLight: "#A9784C",
  pink: "#EE5A72",
  violet: "#9466C4",
  grey: "#9B9EA8",
  greyDark: "#676A76",
  white: "#FFFFFF",
} as const;

// ================= 25 рисунков =================
type Maker = (r: Rnd, a: number) => Stroke[];

// Юсуф, 4 года: кривоватое яблоко, красные каракули чуть за линией.
const apple: Maker = (r, a) => {
  const body = wobble(
    blob([[150, 66], [168, 52], [196, 52], [218, 74], [224, 110], [210, 146], [184, 168], [163, 165], [146, 171], [116, 165], [90, 144], [79, 110], [86, 78], [108, 56], [132, 57]], 4),
    r,
    2.2,
    46,
    true,
  );
  const leaf = blob([[153, 48], [162, 37], [180, 29], [197, 31], [188, 44], [170, 51]], 3);
  const s = [
    line(loopD(body, r, { amp: a, over: 26, drift: 5, start: 0 }), C.redDark, 3.4),
    line(handD([[150, 70], [150, 57], [147, 45], [142, 33]], r, 1.2), C.brown, 5),
    line(loopD(leaf, r, { amp: 1.5, over: 8, drift: 2.5, start: 0 }), C.greenDark, 2.9),
    fillS(body, r, C.red, { angle: -28, gap: 10, over: 4, jit: 3.5, vj: 0.25, smooth: true, w: 5.2, o: 0.8, under: 10 }),
    fillS(ellipse(130, 128, 40, 30, -20), r, C.red, { angle: 24, gap: 9, over: 1, jit: 3, smooth: true, w: 4.4, o: 0.5 }),
    fillS(leaf, r, C.green, { angle: 70, gap: 5, over: 0.5, jit: 1.2, smooth: true, w: 3.6, o: 0.8 }),
  ];
  // Листик закрашивают сразу после его контура, красные заливки — последними:
  // в крупных планах (сцена 1) Юсуф рисует только красным карандашом.
  // Штрихи создаются в исходном порядке, чтобы случайные формы не менялись.
  return [s[0], s[1], s[2], s[5], s[3], s[4]];
};

// Амир, 8 лет: дерево в верхней части карточки (y ≈ 6…136), низ свободен.
const tree: Maker = (r, a) => {
  const crown = wobble(scallop(150, 57, 88, 49, 11, 0.12, 0.3), r, 1.6, 40, true);
  const crownClip = areaD(crown);
  const trunk = polyShape([[135, 136], [140, 122], [142, 104], [142, 92], [158, 92], [159, 104], [161, 122], [166, 136]]);
  return [
    line(handD([[134, 136], [140, 124], [142, 106], [141, 92], [128, 77], [112, 66]], r, a * 0.8), C.brown, 2.8),
    line(handD([[167, 136], [161, 124], [159, 106], [160, 92], [174, 75], [190, 64]], r, a * 0.8), C.brown, 2.8),
    line(handD([[150, 96], [149, 78], [152, 58]], r, a * 0.6), C.brown, 2.6),
    line(handD([[124, 72], [120, 56]], r, 0.6), C.brown, 2.3),
    line(handD([[178, 70], [184, 54]], r, 0.6), C.brown, 2.3),
    line(loopD(crown, r, { amp: a * 0.7, over: 8, drift: 1.2, start: 0.25 }), C.greenDark, 2.7),
    line(handD(Array.from({ length: 6 }, (_, i) => [112 + i * 4.6, i % 2 ? 129 + sym(r, 1.5) : 136] as P), r, 0.4, { smooth: false }), C.green, 2.4),
    line(handD(Array.from({ length: 6 }, (_, i) => [166 + i * 4.6, i % 2 ? 136 : 129 + sym(r, 1.5)] as P), r, 0.4, { smooth: false }), C.green, 2.4),
    fillS(trunk, r, C.brownLight, { angle: 78, gap: 5, over: 1, jit: 0.8, w: 3.2, o: 0.8, under: 6, clip: polyD(trunk) }),
    fillS(crown, r, C.greenLight, { angle: -32, gap: 6.5, over: 2, jit: 1.5, vj: 0.15, smooth: true, w: 4.4, o: 0.74, under: 8, clip: crownClip }),
    fillS(ellipse(170, 74, 62, 28, 8), r, C.greenDark, { angle: 56, gap: 5, over: 0.5, jit: 1.5, smooth: true, w: 2.6, o: 0.42, clip: crownClip }),
    line(handD(bumpsLine([94, 62], [130, 76], 3, 6), r, 0.3), C.greenDark, 2, { o: 0.8 }),
    line(handD(bumpsLine([170, 84], [208, 68], 3, 6), r, 0.3), C.greenDark, 2, { o: 0.8 }),
    line(handD(bumpsLine([126, 34], [166, 30], 3, 6), r, 0.3), C.greenDark, 2, { o: 0.8 }),
    line(handD(bumpsLine([186, 42], [214, 50], 2, 6), r, 0.3), C.greenDark, 2, { o: 0.8 }),
  ];
};

// Билал, 11 лет: аккуратная, но рисованная от руки планета Земля.
const earth: Maker = (r, a) => {
  const ball = wobble(ellipse(150, 101, 81, 80, 0, 3), r, 0.9, 50, true);
  const ballD = areaD(ball);
  const lands = [
    blob([[96, 46], [116, 37], [138, 41], [143, 54], [132, 64], [124, 76], [112, 84], [100, 80], [92, 70], [84, 60]], 3),
    blob([[118, 96], [133, 99], [139, 113], [132, 130], [123, 152], [116, 143], [111, 120]], 3),
    blob([[166, 48], [186, 40], [204, 50], [200, 66], [210, 82], [208, 106], [196, 128], [184, 142], [175, 124], [172, 104], [160, 94], [161, 72]], 3),
    blob([[188, 144], [202, 140], [207, 150], [196, 157], [186, 153]], 3),
  ].map((s) => wobble(s, r, 1.2, 18, true));
  const landD = lands.map(areaD);
  const shade = lune([150, 101, 80], [136, 88, 80]);
  // пустыни разной формы и не на одной высоте; облачка смещены (без «лица»)
  const desert = [blob([[178, 74], [192, 76], [198, 88], [190, 98], [180, 92]], 3), ellipse(106, 66, 16, 5, -38)];
  return [
    line(loopD(ball, r, { amp: a, over: 10, drift: 1.4, start: 0.6 }), C.blueDark, 2.5),
    ...lands.map((s) => line(loopD(s, r, { amp: 0.6, over: 4, drift: 0.8 }), C.greenDark, 1.9, { clip: ballD })),
    fillS(ball, r, C.blue, { angle: -32, gap: 6.2, over: 2, jit: 0.6, w: 3.4, o: 0.74, under: 7.2, clip: [ballD, ...landD].join(" ") }),
    fillS(shade, r, C.blueDark, { angle: 48, gap: 5.6, over: 1, jit: 0.8, smooth: true, w: 2.6, o: 0.5, clip: [areaD(shade), ...landD].join(" ") }),
    ...lands.map((s, i) => fillS(s, r, C.green, { angle: 55 + i * 9, gap: 4.4, over: 1.5, jit: 0.5, w: 3, o: 0.8, under: 5.5, clip: landD[i] })),
    fillS(desert[0], r, C.ochre, { angle: -20, gap: 3.4, over: 1, jit: 0.5, w: 2.4, o: 0.7, clip: landD[2] }),
    fillS(desert[1], r, C.ochre, { angle: -20, gap: 3.4, over: 1, jit: 0.5, w: 2.4, o: 0.7, clip: landD[0] }),
    line(handD([[84, 92], [96, 86], [110, 90], [118, 86]], r, 0.4), C.white, 3.2, { o: 0.95 }),
    line(handD([[144, 127], [154, 122], [166, 126], [177, 122]], r, 0.4), C.white, 3.2, { o: 0.95 }),
    line(handD([[100, 159], [112, 154], [124, 158], [135, 154]], r, 0.4), C.white, 3.2, { o: 0.95 }),
    line(handD([[164, 40], [176, 36], [188, 40]], r, 0.4), C.white, 3, { o: 0.95 }),
    ...[[44, 46, 7], [256, 58, 6], [252, 156, 8], [48, 150, 5]].map(([x, y, s]) =>
      line(loopD(starShape(x, y, s, s * 0.32, 0, 4), r, { amp: 0.2, over: 1, start: 0 }), C.ochre, 1.6),
    ),
  ];
};

// 5 лет: солнце без лица — круг и лучи.
const sun: Maker = (r, a) => {
  const disc = wobble(ellipse(150, 100, 46, 45, 0, 4), r, 2, 40, true);
  const rays = Array.from({ length: 11 }, (_, i) => {
    const ang = (i / 11) * Math.PI * 2 + sym(r, 0.12);
    const r0 = 56 + sym(r, 3);
    const r1 = 76 + r() * 14;
    return line(handD([[150 + Math.cos(ang) * r0, 100 + Math.sin(ang) * r0], [150 + Math.cos(ang) * r1, 100 + Math.sin(ang) * r1]], r, 1.2), C.orange, 3.8);
  });
  return [
    line(loopD(disc, r, { amp: a, over: 20, drift: 4.5, start: 0.1 }), C.orangeDark, 3.4),
    ...rays,
    fillS(disc, r, C.yellow, { angle: -16, gap: 9, over: 3, jit: 3, vj: 0.2, smooth: true, w: 5.6, o: 0.88, under: 10 }),
    fillS(ellipse(164, 116, 30, 24, 30), r, C.orange, { angle: -40, gap: 7, over: 0, jit: 2, smooth: true, w: 3.6, o: 0.38 }),
  ];
};

// 5 лет: тюльпан на стебле, два листа, травка.
const tulip: Maker = (r, a) => {
  const head = wobble(blob([[150, 44], [164, 70], [182, 48], [188, 80], [172, 101], [150, 107], [128, 101], [112, 80], [118, 48], [136, 70]], 3), r, 1.5, 30, true);
  const leafL = blob([[148, 182], [128, 168], [114, 142], [110, 120], [130, 140], [147, 162]], 3);
  const leafR = blob([[153, 178], [168, 158], [186, 134], [194, 122], [188, 146], [166, 172]], 3);
  const grass: P[] = Array.from({ length: 23 }, (_, i) => [30 + i * 10 + sym(r, 1.5), i % 2 ? 177 + sym(r, 3) : 189 + sym(r, 1.2)] as P);
  return [
    line(handD([[151, 187], [148, 152], [152, 124], [150, 104]], r, a * 0.7), C.greenDark, 3.8),
    line(loopD(head, r, { amp: a, over: 16, drift: 4, start: 0 }), C.redDark, 3.2),
    line(loopD(leafL, r, { amp: a * 0.7, over: 10, drift: 3, start: 0 }), C.greenDark, 3),
    line(loopD(leafR, r, { amp: a * 0.7, over: 10, drift: 3, start: 0 }), C.greenDark, 3),
    line(handD(grass, r, 0.8, { smooth: false }), C.green, 3),
    fillS(head, r, C.pink, { angle: -20, gap: 9, over: 3, jit: 3, vj: 0.2, smooth: true, w: 5.2, o: 0.82, under: 9, clip: areaD(grow(head, 2.5)) }),
    fillS(leafL, r, C.greenLight, { angle: 58, gap: 7.5, over: 2.5, jit: 2.5, smooth: true, w: 4.6, o: 0.78 }),
    fillS(leafR, r, C.greenLight, { angle: -58, gap: 7.5, over: 2.5, jit: 2.5, smooth: true, w: 4.6, o: 0.78 }),
  ];
};

// 6 лет: белое облако, вокруг — голубое небо каракулями.
const cloud: Maker = (r, a) => {
  const cl = wobble(cloudShape([[86, 110, 20], [112, 86, 28], [150, 72, 34], [190, 84, 28], [216, 108, 20]], 4), r, 1.2, 30, true);
  const clD = areaD(cl);
  const skyClip = `${polyD(cardRect)} ${clD}`;
  return [
    line(loopD(cl, r, { amp: a, over: 16, drift: 3.5, start: 0.15 }), "#6A8DBF", 3),
    fillS(rect(16, 14, 284, 188), r, C.sky, { angle: -12, gap: 9, over: -4, jit: 5, vj: 0.25, smooth: true, w: 5.2, o: 0.66, under: 9, clip: skyClip }),
    fillS(rect(20, 16, 280, 62), r, C.blue, { angle: 18, gap: 13, over: -6, jit: 6, smooth: true, w: 3.8, o: 0.42, clip: skyClip }),
    fillS(ellipse(152, 126, 68, 9), r, "#B3C4DC", { angle: -6, gap: 6, over: 1, jit: 2, smooth: true, w: 3.6, o: 0.55, clip: clD }),
  ];
};

// 6 лет: птичка в профиль — только глаз-точка, без улыбки и бровей.
const bird: Maker = (r, a) => {
  const body = wobble(ellipse(146, 110, 54, 33, -8, 4), r, 1.5, 36, true);
  const head = wobble(ellipse(197, 78, 24, 23, 0, 4), r, 1.2, 30, true);
  const tail = polyShape([[100, 102], [62, 82], [70, 106], [60, 128], [102, 118]], 4);
  const beak = polyShape([[219, 71], [242, 80], [219, 89]], 3);
  return [
    line(loopD(head, r, { amp: a * 0.8, over: 12, drift: 3, start: 0.6 }), C.blueDark, 3),
    line(loopD(body, r, { amp: a, over: 14, drift: 3.5, start: 0.1 }), C.blueDark, 3),
    line(handD([[100, 102], [62, 82], [70, 106], [60, 128], [102, 118]], r, a * 0.6, { smooth: false }), C.blueDark, 3),
    line(handD([[219, 71], [242, 80], [219, 89]], r, 0.6, { smooth: false }), C.orangeDark, 3),
    line(handD([[120, 100], [130, 122], [154, 128], [174, 106]], r, a * 0.6), C.blueDark, 3),
    line(handD([[136, 140], [132, 164], [122, 168], [132, 164], [142, 169]], r, 0.5, { smooth: false }), C.orangeDark, 2.8),
    line(handD([[158, 141], [160, 164], [151, 169], [160, 164], [170, 168]], r, 0.5, { smooth: false }), C.orangeDark, 2.8),
    line(handD([[40, 168], [110, 165], [190, 168], [264, 163]], r, a * 0.7), C.brown, 5.2),
    line(handD([[228, 165], [244, 150], [252, 146]], r, 0.8), C.brown, 3.4),
    fillS(body, r, C.blue, { angle: -24, gap: 8.5, over: 2.5, jit: 2.5, vj: 0.2, smooth: true, w: 5, o: 0.74, under: 8 }),
    fillS(head, r, C.blue, { angle: 30, gap: 8, over: 2, jit: 2, smooth: true, w: 5, o: 0.74, under: 8 }),
    fillS(tail, r, C.blue, { angle: 80, gap: 8, over: 1.5, jit: 2, smooth: true, w: 4.6, o: 0.72 }),
    fillS(beak, r, C.orange, { angle: 90, gap: 5, over: 1, jit: 1, smooth: true, w: 4, o: 0.85 }),
    dot(204, 72, 3.6, r, "#2A2A33", 3.2),
  ];
};

// 7 лет: ромашка — белые лепестки одной линией вокруг жёлтой серединки.
const daisy: Maker = (r, a) => {
  const cx = 150;
  const cy = 78;
  const petalPts: P[] = [];
  for (let k = 0; k < 12; k++) {
    const th = (k / 12) * Math.PI * 2 - Math.PI / 2 + sym(r, 0.06);
    const L = 52 + sym(r, 4);
    const at = (rr: number, d: number) => [cx + Math.cos(th + d) * rr, cy + Math.sin(th + d) * rr] as P;
    petalPts.push(at(19, -0.2), at(36, -0.2), at(L, 0), at(36, 0.2), at(19, 0.2));
  }
  const flower = sampleCR(petalPts, true, 3);
  const mid = wobble(ellipse(cx, cy, 17, 16, 0, 3), r, 0.8, 20, true);
  const leafL = blob([[150, 142], [132, 128], [114, 124], [124, 136], [140, 144]], 3);
  const leafR = blob([[151, 160], [170, 146], [188, 142], [180, 154], [162, 162]], 3);
  const grass: P[] = Array.from({ length: 29 }, (_, i) => [16 + i * 9.5 + sym(r, 1.5), i % 2 ? 172 + sym(r, 3) : 186 + sym(r, 1)] as P);
  const skyClip = [polyD(cardRect), areaD(flower), areaD(leafL), areaD(leafR)].join(" ");
  return [
    line(curveD(wobble(flower, r, a * 0.4, 16, true).filter((_, i) => i % 2 === 0), true), "#8D97AD", 2.4),
    line(loopD(mid, r, { amp: 0.6, over: 8, drift: 1.5 }), C.orangeDark, 2.6),
    line(handD([[150, 124], [148, 140], [151, 160], [150, 186]], r, a * 0.6), C.greenDark, 3.2, { clip: [polyD(cardRect), areaD(flower)].join(" ") }),
    line(loopD(leafL, r, { amp: 0.8, over: 6, drift: 2, start: 0 }), C.greenDark, 2.6),
    line(loopD(leafR, r, { amp: 0.8, over: 6, drift: 2, start: 0 }), C.greenDark, 2.6),
    line(handD(grass, r, 0.6, { smooth: false }), C.greenDark, 2.6),
    fillS(mid, r, C.yellow, { angle: -20, gap: 5, over: 1.5, jit: 1, smooth: true, w: 4.2, o: 0.9, under: 7, clip: areaD(mid) }),
    fillS(leafL, r, C.greenLight, { angle: 60, gap: 5.5, over: 1.5, jit: 1.2, smooth: true, w: 4, o: 0.8 }),
    fillS(leafR, r, C.greenLight, { angle: -60, gap: 5.5, over: 1.5, jit: 1.2, smooth: true, w: 4, o: 0.8 }),
    fillS(rect(14, 14, 286, 174), r, C.skyLight, { angle: -18, gap: 8.5, over: -2, jit: 3.5, vj: 0.15, smooth: true, w: 4.8, o: 0.6, under: 8.5, clip: skyClip }),
    fillS(rect(14, 176, 286, 192), r, C.greenLight, { angle: 80, gap: 6, over: 0, jit: 2, smooth: true, w: 4, o: 0.7 }),
    // серединка — сеточка семечек (не точки: три точки читались бы как лицо)
    fillS(mid, r, C.orangeDark, { angle: 40, gap: 8.4, over: 3, jit: 0.3, w: 1.2, o: 0.6, clip: areaD(mid) }),
    fillS(mid, r, C.orangeDark, { angle: -40, gap: 8.4, over: 3, jit: 0.3, w: 1.2, o: 0.6, clip: areaD(mid) }),
  ];
};

// 7 лет: три горы со снежными шапками, небо и зелёный луг.
const mountains: Maker = (r, a) => {
  const midSnow: P[] = [[123.6, 70], [132, 81], [140, 72], [150, 85], [160, 72], [168, 81], [176.4, 70]];
  const lSnow: P[] = [[56.9, 82], [64, 91], [72, 84], [80, 92], [88.5, 82]];
  const rSnow: P[] = [[216, 74], [224, 83], [232, 76], [240, 84], [246, 74]];
  const midRock = polyShape([[56, 158], [123.6, 70], ...midSnow.slice(1, -1), [176.4, 70], [244, 158]]);
  const lRock = polyShape([[13, 158], [13, 124], [56.9, 82], ...lSnow.slice(1, -1), [88.5, 82], [103, 98], [56, 158]]);
  const rRock = polyShape([[244, 158], [196, 97], [216, 74], ...rSnow.slice(1, -1), [246, 74], [287, 115], [287, 158]]);
  const sky = polyShape([[12, 12], [288, 12], [288, 118], [230, 58], [196, 97], [150, 34], [103, 98], [74, 66], [12, 124]]);
  const groundTop: P[] = [[10, 150], [60, 146], [120, 155], [180, 147], [240, 154], [290, 146]];
  const ground = polyShape([...groundTop, [290, 192], [10, 192]]);
  // всё, что ниже линии луга, у гор срезано (линии и заливки не заходят под траву)
  const underGround = cutD(polyD(polyShape([[-4, 150], ...sampleCR(groundTop, false, 4), [304, 146], [304, 206], [-4, 206]], 4)));
  const purple = "#5B5577";
  return [
    line(handD([[63, 151], [150, 34], [237, 151]], r, a * 0.6, { smooth: false }), purple, 2.7, { cut: underGround }),
    line(handD([[12, 124], [74, 66], [103, 98]], r, a * 0.6, { smooth: false }), purple, 2.6),
    line(handD([[196, 97], [230, 58], [290, 118]], r, a * 0.6, { smooth: false }), purple, 2.6),
    line(handD(midSnow, r, 0.5, { smooth: false }), "#7F93B8", 2.3),
    line(handD(lSnow, r, 0.5, { smooth: false }), "#7F93B8", 2.2),
    line(handD(rSnow, r, 0.5, { smooth: false }), "#7F93B8", 2.2),
    line(handD(groundTop, r, a * 0.6), C.greenDark, 2.8),
    fillS(midRock, r, "#8C86B8", { angle: -30, gap: 7, over: 1.5, jit: 2, smooth: true, w: 4.4, o: 0.74, under: 8, clip: polyD(midRock), cut: underGround }),
    fillS(lRock, r, "#A9A5CC", { angle: 35, gap: 7, over: 1.5, jit: 2, smooth: true, w: 4.4, o: 0.72, under: 8, clip: outerD(lRock), cut: underGround }),
    fillS(rRock, r, "#A9A5CC", { angle: -35, gap: 7, over: 1.5, jit: 2, smooth: true, w: 4.4, o: 0.72, under: 8, clip: outerD(rRock), cut: underGround }),
    fillS(ground, r, C.greenLight, { angle: 12, gap: 7, over: -0.5, jit: 2.5, smooth: true, w: 4.6, o: 0.74, under: 8, clip: outerD(ground) }),
    fillS(sky, r, C.skyLight, { angle: -10, gap: 9, over: -1.5, jit: 3, vj: 0.15, smooth: true, w: 4.8, o: 0.62, under: 8.5, clip: outerD(sky) }),
  ];
};

// 7 лет: река уходит вдаль между зелёными берегами.
const river: Maker = (r, a) => {
  const hills: P[] = [[10, 48], [60, 36], [110, 46], [146, 40], [162, 40], [200, 34], [240, 44], [290, 36]];
  const L: P[] = [[146, 41], [138, 64], [151, 90], [132, 126], [110, 160], [90, 194]];
  const R: P[] = [[162, 41], [165, 64], [186, 94], [178, 130], [199, 164], [232, 194]];
  const Ls = sampleCR(L, false, 4);
  const Rs = sampleCR(R, false, 4);
  const water = polyShape([...Ls, ...Rs.slice().reverse()], 4);
  const left = polyShape([[10, 194], [10, 48], [60, 36], [110, 46], ...Ls], 4);
  const right = polyShape([[290, 194], [232, 194], ...Rs.slice().reverse(), [200, 34], [240, 44], [290, 36]], 4);
  const sky = polyShape([[12, 12], [288, 12], ...hills.slice().reverse().map((p) => [Math.min(288, Math.max(12, p[0])), p[1]] as P)], 4);
  return [
    line(handD(hills, r, a * 0.4), C.greenDark, 2.5),
    line(handD(L, r, a * 0.6), C.blueDark, 2.7),
    line(handD(R, r, a * 0.6), C.blueDark, 2.7),
    fillS(water, r, C.blue, { angle: 2, gap: 6, over: 1.5, jit: 1.5, smooth: true, w: 4.2, o: 0.74, under: 7.5, clip: outerD(water) }),
    fillS(left, r, C.greenLight, { angle: 28, gap: 7.5, over: -1.5, jit: 2.5, smooth: true, w: 4.6, o: 0.7, under: 8, clip: outerD(left) }),
    fillS(right, r, C.greenLight, { angle: -28, gap: 7.5, over: -1.5, jit: 2.5, smooth: true, w: 4.6, o: 0.7, under: 8, clip: outerD(right) }),
    fillS(sky, r, C.skyLight, { angle: -6, gap: 8, over: -1.5, jit: 2.5, smooth: true, w: 4.4, o: 0.62, under: 8, clip: outerD(sky) }),
    line(handD([[146, 72], [152, 69], [158, 72]], r, 0.3), C.white, 2.6),
    line(handD([[150, 104], [158, 100], [166, 104]], r, 0.3), C.white, 2.6),
    line(handD([[134, 146], [144, 141], [154, 146], [164, 141]], r, 0.4), C.white, 2.8),
    line(handD([[124, 178], [136, 172], [148, 178], [160, 172], [172, 178]], r, 0.4), C.white, 2.8),
    line(handD(tuftPts(58, 120, 12), r, 0.3, { smooth: false }), C.greenDark, 2.4),
    line(handD(tuftPts(234, 112, 12), r, 0.3, { smooth: false }), C.greenDark, 2.4),
    line(handD(tuftPts(56, 172, 14), r, 0.3, { smooth: false }), C.greenDark, 2.4),
    line(loopD(ellipse(104, 146, 8, 5, -10, 2), r, { amp: 0.4, over: 3 }), C.greyDark, 2.2),
    line(loopD(ellipse(200, 140, 7, 4.5, 8, 2), r, { amp: 0.4, over: 3 }), C.greyDark, 2.2),
    fillS(ellipse(104, 146, 7, 4, -10), r, C.grey, { angle: 0, gap: 2.6, over: 0.5, jit: 0.3, w: 2.4, o: 0.9 }),
    fillS(ellipse(200, 140, 6, 3.6, 8), r, C.grey, { angle: 0, gap: 2.6, over: 0.5, jit: 0.3, w: 2.4, o: 0.9 }),
  ];
};

// 8 лет: озеро на лугу, камыши, дальние холмы.
const lake: Maker = (r, a) => {
  const hills: P[] = [[10, 66], [50, 52], [100, 60], [160, 46], [220, 58], [290, 48]];
  const sky = polyShape([[12, 12], [288, 12], [288, 48], [220, 58], [160, 46], [100, 60], [50, 52], [12, 64]], 4);
  const meadow = polyShape([[12, 64], [50, 52], [100, 60], [160, 46], [220, 58], [288, 48], [288, 192], [12, 192]], 4);
  const pond = wobble(ellipse(158, 128, 98, 40, 0, 3), r, 1.4, 40, true);
  const pondD = areaD(pond);
  // тень у дальнего берега: полоса вдоль верхнего края пруда, низ — волнистый
  const shoreY = (x: number) => 128 - 40 * Math.sqrt(Math.max(0, 1 - ((x - 158) / 98) ** 2));
  const xs = Array.from({ length: 25 }, (_, i) => 62 + i * 8);
  const farShade = polyShape([...xs.map((x) => [x, shoreY(x) - 5] as P), ...xs.reverse().map((x) => [x, shoreY(x) + 10 + 3 * Math.sin(x * 0.11) + sym(r, 1.5)] as P)], 3);
  // рябь «∼» — пятью короткими волнами в шахматном порядке
  const ripple = (x: number, y: number, L: number, waves: number) =>
    line(handD(Array.from({ length: waves * 4 + 1 }, (_, i) => [x + (L * i) / (waves * 4), y - [0, 2, 0, -2][i % 4]] as P), r, 0.2), C.white, 2.4);
  const reeds = [70, 80, 90, 100].map((x, i) => {
    const top = 120 + (i % 2) * 10 + sym(r, 3);
    return line(handD([[x + sym(r, 2), 178], [x + 2, 150], [x + 4 + sym(r, 2), top]], r, 0.6), C.greenDark, 2.3);
  });
  return [
    line(handD(hills, r, a * 0.5), C.greenDark, 2.5),
    line(loopD(pond, r, { amp: a * 0.6, over: 12, drift: 2, start: 0.75 }), C.blueDark, 2.6),
    ...reeds,
    line(handD([[71, 140], [72, 128]], r, 0.3), "#7A4E2C", 5.4),
    line(handD([[93, 132], [94, 120]], r, 0.3), "#7A4E2C", 5.4),
    line(handD([[82, 178], [64, 150], [58, 134]], r, 0.5), C.greenDark, 2.2),
    fillS(pond, r, C.blue, { angle: 0, gap: 5.5, over: 1.5, jit: 1.2, smooth: true, w: 4, o: 0.74, under: 7, clip: pondD }),
    fillS(farShade, r, C.blueDark, { angle: 28, gap: 5.5, over: 0, jit: 3, vj: 0.25, smooth: true, w: 3, o: 0.36, clip: pondD }),
    fillS(meadow, r, C.greenLight, { angle: 24, gap: 7, over: -1.5, jit: 2.2, smooth: true, w: 4.4, o: 0.7, under: 8, clip: `${outerD(meadow)} ${pondD}` }),
    fillS(sky, r, C.skyLight, { angle: -6, gap: 7, over: -1.5, jit: 2.2, smooth: true, w: 4.2, o: 0.6, under: 7.5, clip: outerD(sky) }),
    ripple(114, 120, 18, 1),
    ripple(196, 115, 22, 2),
    ripple(150, 136, 20, 1),
    ripple(224, 142, 16, 1),
    ripple(122, 154, 22, 2),
    line(handD(tuftPts(236, 178, 13), r, 0.3, { smooth: false }), C.greenDark, 2.3),
    line(handD(tuftPts(262, 84, 10), r, 0.3, { smooth: false }), C.greenDark, 2.2),
  ];
};

// 8 лет: зелёный лист с прожилками.
const leaf: Maker = (r, a) => {
  const B: P = [84, 160];
  const T: P = [234, 38];
  const L = dist(B, T);
  const u: P = [(T[0] - B[0]) / L, (T[1] - B[1]) / L];
  const nv: P = [-u[1], u[0]];
  const hw = (t: number) => 58 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.8) * (1 - 0.18 * t);
  const axis = (t: number): P => [B[0] + (T[0] - B[0]) * t + nv[0] * 6 * Math.sin(Math.PI * t), B[1] + (T[1] - B[1]) * t + nv[1] * 6 * Math.sin(Math.PI * t)];
  const edge = (t: number, s: number): P => {
    const p = axis(t);
    const h = hw(t) * (s > 0 ? 1 : 0.92);
    return [p[0] + nv[0] * h * s, p[1] + nv[1] * h * s];
  };
  const ts = Array.from({ length: 13 }, (_, i) => i / 12);
  const side1 = ts.map((t) => edge(t, 1));
  const side2 = ts.map((t) => edge(t, -1)).reverse();
  const shape = wobble(blob([...side1.slice(0, -1), T, ...side2.slice(1, -1)], 3), r, 0.9, 30, true);
  const half1 = polyShape([...ts.map((t) => edge(t, 1)), ...ts.map((t) => axis(t)).reverse()]);
  const veins: Stroke[] = [];
  [0.2, 0.36, 0.52, 0.68, 0.83].forEach((t) => {
    for (const s of [1, -1]) {
      const p0 = axis(t);
      const p1 = edge(Math.min(1, t + 0.1), s * 0.78);
      veins.push(line(handD([p0, lerpP(p0, p1, 0.5), p1], r, 0.4), C.greenDark, 1.8));
    }
  });
  const clip = areaD(shape);
  return [
    line(loopD(shape, r, { amp: a * 0.6, over: 10, drift: 2, start: 0 }), C.greenDark, 2.5),
    line(handD([B, [72, 174], [60, 188]], r, 0.6), "#5E8A34", 3.4),
    line(handD(ts.filter((t) => t <= 0.9).map(axis), r, 0.5), C.greenDark, 2.4),
    ...veins,
    fillS(shape, r, C.green, { angle: 51, gap: 4.4, over: 1.5, jit: 0.9, smooth: true, w: 3.4, o: 0.76, under: 6.5, clip }),
    fillS(half1, r, "#A9D65E", { angle: -39, gap: 5.5, over: 1, jit: 1, smooth: true, w: 3, o: 0.55, clip }),
  ];
};

// 9 лет: радуга из шести дуг, концы прячутся в облаках.
const rainbow: Maker = (r) => {
  const cx = 150;
  const cy = 178;
  const cols = [C.red, C.orange, C.yellow, C.green, C.blue, C.violet];
  const cloudL = wobble(cloudShape([[22, 177, 11], [40, 163, 16], [64, 162, 15], [84, 176, 10]], 3), r, 0.7, 24, true);
  const cloudR = wobble(cloudShape([[216, 176, 10], [236, 162, 15], [260, 163, 16], [278, 177, 11]], 3), r, 0.7, 24, true);
  const clip = [polyD(cardRect), areaD(cloudL), areaD(cloudR)].join(" ");
  const bands = cols.map((col, i) => {
    const rb = 126 - i * 10;
    const out = Array.from({ length: 25 }, (_, k) => {
      const t = Math.PI + (k / 24) * Math.PI;
      return [cx + Math.cos(t) * (rb + 2.6), cy + Math.sin(t) * (rb + 2.6)] as P;
    });
    const back = Array.from({ length: 25 }, (_, k) => {
      const t = 2 * Math.PI - (k / 24) * Math.PI;
      return [cx + Math.cos(t) * (rb - 2.6), cy + Math.sin(t) * (rb - 2.6)] as P;
    });
    const d = curveD(wobble(sampleCR([...out, ...back.slice(1)], false, 6), r, 0.7, 30));
    return { d, color: col, w: 6.6, o: 0.86, fill: true, clip, len: getLength(d) } as Stroke;
  });
  return [
    line(loopD(cloudL, r, { amp: 0.8, over: 8, drift: 1.5, start: 0.4 }), "#7F9CC4", 2.4),
    line(loopD(cloudR, r, { amp: 0.8, over: 8, drift: 1.5, start: 0.4 }), "#7F9CC4", 2.4),
    ...bands,
    fillS(ellipse(52, 182, 28, 5), r, "#C9D6E6", { angle: 0, gap: 4, over: 0.5, jit: 1, smooth: true, w: 3, o: 0.6, clip: areaD(cloudL) }),
    fillS(ellipse(248, 182, 28, 5), r, "#C9D6E6", { angle: 0, gap: 4, over: 0.5, jit: 1, smooth: true, w: 3, o: 0.6, clip: areaD(cloudR) }),
  ];
};

// 9 лет: трава — два ряда травинок, колоски, земля.
const grass: Maker = (r, a) => {
  const row = (x0: number, x1: number, stepX: number, yTop: readonly [number, number], base: number): P[] => {
    const pts: P[] = [[x0, base]];
    for (let x = x0; x < x1 - stepX * 1.2; x += stepX + sym(r, 2)) {
      const tip: P = [x + stepX * 0.5 + sym(r, 6), yTop[0] + r() * (yTop[1] - yTop[0])];
      const lean = sym(r, 4);
      pts.push([x + stepX * 0.2 + lean * 0.4, (base + tip[1]) / 2], tip, [x + stepX * 0.8 + lean * 0.4, (base + tip[1]) / 2], [x + stepX, base]);
    }
    return pts;
  };
  const back = row(14, 288, 14, [62, 96], 178);
  const front = row(15, 290, 17, [100, 136], 180);
  const soilTop: P[] = [[12, 176], [80, 179], [150, 175], [220, 179], [288, 176]];
  const soil = polyShape([...soilTop, [288, 194], [12, 194]]);
  const stalks = [
    [56, 44],
    [176, 38],
    [246, 52],
  ] as const;
  return [
    line(handD(back, r, 0.6, { smooth: false }), C.greenDark, 2.2),
    line(handD(front, r, 0.6, { smooth: false }), "#4C9A3E", 2.2),
    ...stalks.map(([x, y]) => line(handD([[x - 4, 176], [x - 1, 110], [x, y + 22]], r, 0.6), C.ochre, 2)),
    ...stalks.map(([x, y]) => line(handD(earPts(x, y, 22), r, 0.15, { smooth: false }), "#C48F35", 2.2)),
    line(handD(soilTop, r, a * 0.4), "#7A5233", 2.4),
    fillS(soil, r, "#B5865A", { angle: 14, gap: 5, over: -1, jit: 2, smooth: true, w: 3.6, o: 0.72, under: 6.5, clip: outerD(soil) }),
    fillS(polyShape(back, 3), r, "#5BA84A", { angle: 84, gap: 4.6, over: 1, jit: 0.8, w: 3, o: 0.72, under: 5.5, clip: polyD(back) }),
    fillS(polyShape(front, 3), r, "#8ED062", { angle: 86, gap: 4.6, over: 1, jit: 0.8, w: 3, o: 0.78, under: 5.5, clip: polyD(front) }),
  ];
};

// 9 лет: куст с красными ягодами.
const berryBush: Maker = (r, a) => {
  const bush = wobble(circles([[92, 122, 32], [116, 88, 36], [160, 74, 40], [198, 92, 36], [214, 126, 30], [150, 122, 40], [108, 140, 24], [192, 142, 24]]), r, 1, 30, true);
  const bushD = areaD(bush);
  const groundTop: P[] = [[14, 164], [80, 160], [150, 166], [220, 160], [286, 165]];
  const ground = polyShape([...groundTop, [288, 192], [12, 192]]);
  const berries: P[] = [[98, 108], [124, 76], [152, 102], [178, 64], [206, 100], [134, 132], [172, 124], [214, 136], [90, 138], [192, 150], [150, 56], [114, 108]];
  return [
    line(loopD(bush, r, { amp: a * 0.5, over: 10, drift: 2, start: 0.3 }), C.greenDark, 2.5),
    line(handD(groundTop, r, a * 0.4), "#6B8E3A", 2.4, { cut: cutD(bushD) }),
    fillS(bush, r, C.green, { angle: -30, gap: 5.2, over: 1.5, jit: 1, smooth: true, w: 4, o: 0.76, under: 7, clip: bushD }),
    fillS(ellipse(176, 132, 72, 30, 8), r, "#2F7D3A", { angle: 50, gap: 6, over: 1, jit: 1.5, smooth: true, w: 3.2, o: 0.5, clip: bushD }),
    fillS(ground, r, C.greenLight, { angle: 8, gap: 6, over: -1.5, jit: 2.2, smooth: true, w: 4, o: 0.66, under: 7, clip: outerD(ground), cut: cutD(bushD) }),
    line(handD(bumpsLine([84, 100], [120, 112], 3, 6), r, 0.3), "#2F7D3A", 2, { o: 0.75 }),
    line(handD(bumpsLine([168, 98], [206, 88], 3, 6), r, 0.3), "#2F7D3A", 2, { o: 0.75 }),
    line(handD(bumpsLine([128, 148], [164, 150], 3, 5.5), r, 0.3), "#2F7D3A", 2, { o: 0.75 }),
    ...berries.map(([x, y]) => dot(x, y, 7, r, "#D3303D", 3.7)),
    ...berries.slice(0, 6).map(([x, y]) => line(handD([[x - 3.4, y - 3.6], [x - 1, y - 4.6]], r, 0.1), C.white, 1.8, { o: 0.9 })),
  ];
};

// 10 лет: бабочка — симметричные крылья, пятна, усики.
const butterfly: Maker = (r, a) => {
  const upL = wobble(blob([[146, 76], [120, 52], [88, 30], [60, 28], [44, 48], [50, 80], [72, 100], [106, 106], [144, 98]], 3), r, 0.8, 30, true);
  const loL = wobble(blob([[145, 106], [114, 110], [86, 124], [76, 152], [92, 174], [118, 170], [136, 150], [146, 126]], 3), r, 0.8, 30, true);
  const upR = wobble(mirrorX(upL), r, 0.5, 30, true);
  const loR = wobble(mirrorX(loL), r, 0.5, 30, true);
  const body = blob([[150, 60], [155, 68], [156, 102], [154, 140], [150, 152], [146, 140], [144, 102], [145, 68]], 2.5);
  const head = ellipse(150, 52, 8, 8, 0, 2);
  const outline = "#4A3F5C";
  const wings = [upL, upR, loL, loR];
  const wingD = wings.map(areaD);
  return [
    ...wings.map((w) => line(loopD(w, r, { amp: a * 0.5, over: 6, drift: 1.2, start: 0 }), outline, 2.2)),
    line(loopD(body, r, { amp: 0.3, over: 4, drift: 0.6, start: 0 }), outline, 2.2),
    line(loopD(head, r, { amp: 0.3, over: 3, drift: 0.5, start: 0 }), outline, 2.2),
    line(handD([[147, 45], [138, 30], [124, 20]], r, 0.5), outline, 2),
    line(handD([[153, 45], [162, 30], [176, 20]], r, 0.5), outline, 2),
    fillS(upL, r, C.orange, { angle: 32, gap: 4.2, over: 1.5, jit: 0.8, smooth: true, w: 3.2, o: 0.8, under: 6, clip: wingD[0] }),
    fillS(upR, r, C.orange, { angle: -32, gap: 4.2, over: 1.5, jit: 0.8, smooth: true, w: 3.2, o: 0.8, under: 6, clip: wingD[1] }),
    fillS(ellipse(62, 44, 26, 20), r, "#DC5F28", { angle: -40, gap: 4.6, over: 1, jit: 0.8, smooth: true, w: 2.8, o: 0.6, clip: wingD[0] }),
    fillS(ellipse(238, 44, 26, 20), r, "#DC5F28", { angle: 40, gap: 4.6, over: 1, jit: 0.8, smooth: true, w: 2.8, o: 0.6, clip: wingD[1] }),
    fillS(loL, r, C.violet, { angle: -30, gap: 4.2, over: 1.5, jit: 0.8, smooth: true, w: 3.2, o: 0.8, under: 6, clip: wingD[2] }),
    fillS(loR, r, C.violet, { angle: 30, gap: 4.2, over: 1.5, jit: 0.8, smooth: true, w: 3.2, o: 0.8, under: 6, clip: wingD[3] }),
    fillS(body, r, outline, { angle: 0, gap: 3.4, over: 0.5, jit: 0.3, w: 2.4, o: 0.85, clip: areaD(body) }),
    fillS(head, r, outline, { angle: 0, gap: 3, over: 0.5, jit: 0.3, w: 2.4, o: 0.85, clip: areaD(head) }),
    dot(82, 62, 9, r, C.yellow, 4),
    dot(218, 62, 9, r, C.yellow, 4),
    dot(116, 84, 5.5, r, C.yellow, 3.6),
    dot(184, 84, 5.5, r, C.yellow, 3.6),
    dot(102, 150, 6, r, "#8CC6F0", 3.6),
    dot(198, 150, 6, r, "#8CC6F0", 3.6),
    dot(124, 20, 3, r, outline, 2.6),
    dot(176, 20, 3, r, outline, 2.6),
  ];
};

// 10 лет: ракушка-гребешок на песке.
const shell: Maker = (r, a) => {
  // веер створки с вершиной H; у вершины — два маленьких «ушка», они
  // закрывают острый угол веера; ракушка лежит на песке
  const H: P = [150, 157];
  const SPAN = 66;
  const fan: P[] = [H];
  const R = (phi: number) => {
    const ph = ((phi + SPAN) / (SPAN * 2)) * 9;
    return 104 + 7 * Math.pow(Math.abs(Math.sin(Math.PI * ph)), 0.6);
  };
  for (let k = 0; k <= 66; k++) {
    const phi = -SPAN + (k / 66) * SPAN * 2;
    fan.push([H[0] + R(phi) * Math.sin(phi * DEG), H[1] - R(phi) * Math.cos(phi * DEG)]);
  }
  const fanShape = wobble(resample(fan, 3, true), r, 0.6, 30, true);
  const ears = wobble(polyShape([[150, 146], [121, 145], [119, 149], [123, 154], [138, 156.5], [150, 159.5], [162, 156.5], [177, 154], [181, 149], [179, 145]], 2.5), r, 0.3, 16, true);
  const earsD = areaD(ears);
  const noEars = cutD(earsD);
  const ribs = Array.from({ length: 8 }, (_, i) => {
    const phi = (-SPAN + ((i + 1) / 9) * SPAN * 2) * DEG;
    const p0: P = [H[0] + 30 * Math.sin(phi), H[1] - 30 * Math.cos(phi)];
    const p1: P = [H[0] + 101 * Math.sin(phi), H[1] - 101 * Math.cos(phi)];
    return line(handD([p0, lerpP(p0, p1, 0.5), p1], r, 0.4), "#C6684F", 1.8);
  });
  const sandTop: P[] = [[12, 156], [60, 152], [110, 157], [150, 153], [190, 157], [240, 152], [288, 156]];
  const sand = polyShape([...sandTop, [288, 194], [12, 194]]);
  const fanD = polyD(fanShape);
  const outline = "#B35A44";
  const seaEdge: P[] = Array.from({ length: 23 }, (_, i) => [12 + i * 12.5, 32 + 3 * Math.sin(i * 1.3)] as P);
  const sea = polyShape([[12, 12], [288, 12], ...seaEdge.slice().reverse()]);
  return [
    line(loopD(fanShape, r, { amp: a * 0.5, over: 6, drift: 1, start: 0.02 }), outline, 2.3, { cut: noEars }),
    line(curveD(ears, true), outline, 2.2),
    ...ribs,
    line(handD([[139, 146.5], [143, 156.5]], r, 0.1), outline, 1.6, { o: 0.75 }),
    line(handD([[161, 146.5], [157, 156.5]], r, 0.1), outline, 1.6, { o: 0.75 }),
    line(handD(sandTop, r, 0.6), "#C9A262", 2, { cut: noEars }),
    fillS(fanShape, r, "#F5B593", { angle: 20, gap: 4, over: 1.5, jit: 0.6, smooth: true, w: 3, o: 0.8, under: 6, clip: fanD, cut: noEars }),
    fillS(ellipse(150, 150, 56, 46), r, "#E5886A", { angle: -40, gap: 4.4, over: 1, jit: 0.6, smooth: true, w: 2.6, o: 0.5, clip: fanD, cut: noEars }),
    fillS(ears, r, "#E8977A", { angle: 10, gap: 3.4, over: 1, jit: 0.5, w: 2.6, o: 0.82, clip: earsD }),
    fillS(sand, r, "#EBCB8C", { angle: 8, gap: 5.5, over: -1, jit: 1.6, smooth: true, w: 3.6, o: 0.66, under: 6.5, clip: outerD(sand), cut: noEars }),
    fillS(sea, r, C.sky, { angle: 0, gap: 4.4, over: -1, jit: 1.6, smooth: true, w: 3.2, o: 0.66, under: 5.5, clip: outerD(sea) }),
    line(handD(seaEdge, r, 0.4), C.blue, 2.2),
    line(loopD(ellipse(52, 178, 6, 4, 0, 1.5), r, { amp: 0.3, over: 2 }), "#A8875A", 1.8),
    line(loopD(ellipse(242, 182, 5, 3, 0, 1.5), r, { amp: 0.3, over: 2 }), "#A8875A", 1.8),
    fillS(ellipse(52, 178, 5, 3), r, "#C9A77A", { angle: 0, gap: 2.4, over: 0.5, jit: 0.2, w: 2.2, o: 0.9 }),
    fillS(ellipse(242, 182, 4, 2.4), r, "#C9A77A", { angle: 0, gap: 2.4, over: 0.5, jit: 0.2, w: 2.2, o: 0.9 }),
  ];
};

// 10 лет: гладкий камень с тенью, рядом камешки и травинки.
const stone: Maker = (r, a) => {
  const big = wobble(blob([[70, 150], [66, 120], [80, 92], [110, 72], [150, 64], [196, 70], [226, 90], [238, 122], [232, 150], [200, 160], [150, 162], [104, 160]], 3), r, 1, 40, true);
  const p1 = wobble(ellipse(42, 164, 18, 10, -6, 3), r, 0.6, 20, true);
  const p2 = wobble(ellipse(262, 168, 14, 8, 8, 3), r, 0.6, 20, true);
  const groundTop: P[] = [[12, 158], [60, 154], [120, 160], [180, 156], [240, 160], [288, 154]];
  const ground = polyShape([...groundTop, [288, 194], [12, 194]]);
  const bigD = areaD(big);
  const stonesCut = cutD(bigD, areaD(p1), areaD(p2));
  const shade = lune([150, 112, 100], [126, 88, 100]);
  return [
    line(loopD(big, r, { amp: a * 0.5, over: 8, drift: 1.4, start: 0.1 }), "#4B4B57", 2.4),
    line(loopD(p1, r, { amp: 0.5, over: 5, drift: 1 }), "#4B4B57", 2.2),
    line(loopD(p2, r, { amp: 0.5, over: 5, drift: 1 }), "#4B4B57", 2.2),
    line(handD(groundTop, r, 0.6), C.greenDark, 2.2, { cut: stonesCut }),
    fillS(big, r, "#AEB0B9", { angle: -35, gap: 4.2, over: 1.5, jit: 0.8, smooth: true, w: 3.2, o: 0.76, under: 6.5, clip: bigD }),
    fillS(shade, r, "#6E707B", { angle: 45, gap: 4.4, over: 1, jit: 0.8, w: 2.4, o: 0.6, clip: bigD }),
    fillS(p1, r, "#9A9CA6", { angle: 30, gap: 3.6, over: 1, jit: 0.5, w: 2.6, o: 0.8, clip: areaD(p1) }),
    fillS(p2, r, "#9A9CA6", { angle: -30, gap: 3.6, over: 1, jit: 0.5, w: 2.6, o: 0.8, clip: areaD(p2) }),
    fillS(ground, r, C.greenLight, { angle: 10, gap: 6, over: -1, jit: 2.5, smooth: true, w: 4, o: 0.66, under: 7, clip: outerD(ground), cut: stonesCut }),
    fillS(ellipse(196, 166, 50, 6), r, "#4E8F40", { angle: 0, gap: 3.4, over: 0, jit: 1, smooth: true, w: 2.6, o: 0.45, clip: polyD(ground), cut: stonesCut }),
    line(handD([[100, 92], [118, 80], [140, 76]], r, 0.4), C.white, 3.4, { o: 0.9 }),
    line(handD([[96, 104], [104, 98]], r, 0.3), C.white, 3, { o: 0.9 }),
    line(handD([[222, 98], [214, 108], [218, 118], [212, 126]], r, 0.4), "#55565F", 1.7),
    line(handD(tuftPts(82, 161, 13), r, 0.2, { smooth: false }), C.greenDark, 2),
    line(handD(tuftPts(222, 160, 12), r, 0.2, { smooth: false }), C.greenDark, 2),
  ];
};

// 11 лет: серая туча и капли дождя, внизу лужица.
const rain: Maker = (r, a) => {
  const cl = wobble(circles([[90, 66, 24], [120, 48, 29], [160, 42, 31], [196, 56, 27], [214, 76, 19], [150, 76, 24], [110, 80, 18], [184, 80, 20]]), r, 0.8, 30, true);
  const clD = areaD(cl);
  const drops: P[] = [[86, 116], [130, 112], [174, 118], [218, 112], [106, 142], [152, 140], [196, 144], [80, 168], [128, 166], [176, 170], [224, 164]];
  const drop = (x: number, y: number) => polyShape(sampleCR([[x, y - 10], [x + 3.4, y - 3], [x + 5.4, y + 3], [x, y + 7.6], [x - 5.4, y + 3], [x - 3.4, y - 3]], true, 2), 2);
  const puddle = wobble(ellipse(152, 186, 66, 7, 0, 3), r, 0.5, 30, true);
  return [
    line(loopD(cl, r, { amp: a * 0.5, over: 8, drift: 1.4, start: 0.3 }), "#5D6170", 2.3),
    ...drops.map(([x, y]) => line(loopD(drop(x, y), r, { amp: 0.25, over: 2, drift: 0.4, start: 0 }), C.blueDark, 2)),
    line(loopD(puddle, r, { amp: 0.4, over: 6, drift: 1 }), C.blueDark, 2),
    fillS(cl, r, "#9EA2AE", { angle: -20, gap: 4.4, over: 1.5, jit: 0.7, smooth: true, w: 3.2, o: 0.8, under: 6.5, clip: clD }),
    fillS(ellipse(152, 92, 84, 18), r, "#6C7080", { angle: 28, gap: 4.6, over: 1, jit: 0.7, w: 2.6, o: 0.6, clip: clD }),
    ...drops.map(([x, y]) => fillS(drop(x, y), r, "#6CB2EE", { angle: 60, gap: 3, over: -0.5, jit: 0.2, w: 2.4, o: 0.9 })),
    fillS(puddle, r, "#8CC4F0", { angle: 0, gap: 3.4, over: 1, jit: 0.4, w: 2.6, o: 0.8, clip: areaD(puddle) }),
    line(handD([[120, 176], [116, 170]], r, 0.2), C.blueDark, 1.6),
    line(handD([[184, 176], [188, 170]], r, 0.2), C.blueDark, 1.6),
  ];
};

// 11 лет: зелёные холмы слоями, тропинка, деревца, облака.
const hills: Maker = (r, a) => {
  const backL: P[] = [[10, 92], [50, 74], [96, 68], [150, 82], [200, 70], [250, 60], [290, 72]];
  const midL: P[] = [[10, 132], [60, 112], [120, 104], [180, 118], [240, 134], [290, 138]];
  const frontL: P[] = [[10, 178], [60, 170], [120, 160], [180, 146], [240, 140], [290, 150]];
  const bS = sampleCR(backL, false, 4);
  const mS = sampleCR(midL, false, 4);
  const fS = sampleCR(frontL, false, 4);
  const backBand = polyShape([...bS, ...mS.slice().reverse()]);
  const midBand = polyShape([...mS, ...fS.slice().reverse()]);
  const frontBand = polyShape([...fS, [290, 194], [10, 194]]);
  const sky = polyShape([[12, 12], [288, 12], ...bS.slice().reverse().map((p) => [Math.min(288, Math.max(12, p[0])), p[1]] as P)]);
  const c1 = wobble(cloudShape([[70, 36, 8], [85, 29, 11], [100, 36, 8]], 2), r, 0.4, 20, true);
  const c2 = wobble(cloudShape([[202, 31, 7], [215, 25, 10], [229, 31, 7]], 2), r, 0.4, 20, true);
  const path = polyShape([[128, 194], [146, 172], [170, 152], [188, 128], [194, 129], [184, 154], [170, 176], [168, 194]], 3);
  const trees: P[] = [[58, 74], [232, 66], [92, 108]];
  return [
    line(handD(backL, r, a * 0.4), "#6FA84E", 2.2),
    line(handD(midL, r, a * 0.4), "#4E9A46", 2.2),
    line(handD(frontL, r, a * 0.4), "#3D7F3A", 2.3),
    line(loopD(c1, r, { amp: 0.4, over: 4, drift: 0.8 }), "#8FA9CE", 2),
    line(loopD(c2, r, { amp: 0.4, over: 4, drift: 0.8 }), "#8FA9CE", 2),
    line(handD([[128, 194], [146, 172], [170, 152], [188, 128]], r, 0.5), "#B88A4A", 1.9),
    line(handD([[194, 129], [184, 154], [170, 176], [168, 194]], r, 0.5), "#B88A4A", 1.9),
    fillS(backBand, r, "#B8DE88", { angle: -14, gap: 5, over: 1, jit: 1, smooth: true, w: 3.4, o: 0.78, under: 6.5, clip: polyD(backBand) }),
    fillS(midBand, r, "#86C866", { angle: 12, gap: 5, over: 1, jit: 1, smooth: true, w: 3.4, o: 0.78, under: 6.5, clip: `${polyD(midBand)} ${polyD(path)}` }),
    fillS(frontBand, r, "#55AA47", { angle: -10, gap: 5, over: 1, jit: 1, smooth: true, w: 3.4, o: 0.8, under: 6.5, clip: `${polyD(frontBand)} ${polyD(path)}` }),
    fillS(polyShape([[10, 182], [80, 176], [160, 170], [240, 164], [290, 166], [290, 194], [10, 194]]), r, "#3F8E3C", { angle: 20, gap: 5.5, over: 1, jit: 1, w: 2.6, o: 0.45, clip: `${polyD(frontBand)} ${polyD(path)}` }),
    fillS(path, r, "#E8C27E", { angle: 30, gap: 3.6, over: 1, jit: 0.5, w: 2.6, o: 0.85, clip: polyD(path) }),
    fillS(sky, r, C.skyLight, { angle: -8, gap: 5.5, over: 1, jit: 1.2, smooth: true, w: 3.4, o: 0.6, under: 6, clip: [polyD(sky), areaD(c1), areaD(c2)].join(" ") }),
    ...trees.map(([x, y]) => line(handD([[x, y + 8], [x, y - 4]], r, 0.2), C.brown, 2.4)),
    ...trees.map(([x, y]) => dot(x, y - 10, 8, r, "#3E8E3E", 3.8)),
    dot(70, 182, 2.2, r, C.red, 2.2),
    dot(232, 168, 2.2, r, C.yellow, 2.4),
    dot(110, 186, 2, r, C.yellow, 2.2),
    dot(258, 176, 2, r, C.red, 2.2),
  ];
};

// 11 лет: шестилучевая снежинка на голубом фоне.
const snowflake: Maker = (r) => {
  const cx = 150;
  const cy = 101;
  const col = "#3C78C2";
  const strokes: Stroke[] = [];
  const at = (th: number, rr: number): P => [cx + Math.cos(th) * rr, cy + Math.sin(th) * rr];
  for (let k = 0; k < 6; k++) {
    const th = -Math.PI / 2 + (k * Math.PI) / 3;
    strokes.push(line(handD([at(th, 9), at(th, 44), at(th, 80)], r, 0.4), col, 2.6));
  }
  for (let k = 0; k < 6; k++) {
    const th = -Math.PI / 2 + (k * Math.PI) / 3;
    for (const [rr, len] of [
      [30, 18],
      [52, 15],
      [70, 9],
    ] as const) {
      const base = at(th, rr);
      const tipA: P = [base[0] + Math.cos(th - 0.75) * len, base[1] + Math.sin(th - 0.75) * len];
      const tipB: P = [base[0] + Math.cos(th + 0.75) * len, base[1] + Math.sin(th + 0.75) * len];
      strokes.push(line(handD([tipA, base, tipB], r, 0.25, { smooth: false }), col, 2.3));
    }
  }
  const hex = polyShape(Array.from({ length: 6 }, (_, k) => at(-Math.PI / 2 + (k * Math.PI) / 3 + Math.PI / 6, 10)), 2);
  // маленькая снежинка: шесть лучей «туда-обратно» из центра одной линией
  const mini = (x: number, y: number, s: number) => {
    const pts: P[] = [[x, y]];
    for (let k = 0; k < 6; k++) {
      const th = (k * Math.PI) / 3 + 0.3;
      pts.push([x + Math.cos(th) * s, y + Math.sin(th) * s], [x, y]);
    }
    return line(lineD(pts), "#6FA4DA", 1.7);
  };
  return [
    ...strokes,
    line(loopD(hex, r, { amp: 0.2, over: 3, start: 0 }), col, 2.3),
    mini(40, 36, 9),
    mini(262, 44, 7),
    mini(250, 166, 10),
    mini(46, 160, 7),
    fillS(rect(6, 6, 294, 196), r, "#C7E3F7", { angle: -30, gap: 5, over: 2, jit: 2.5, smooth: true, w: 3.2, o: 0.6, under: 6 }),
    fillS(ellipse(150, 101, 34, 34), r, "#A9D2F2", { angle: 30, gap: 5, over: -0.5, jit: 1.5, smooth: true, w: 2.6, o: 0.45 }),
  ];
};

// 12 лет: серп луны (без лица) на сиреневом вечернем небе, звёзды разной
// величины; фон закрашен до неровной рамки.
const moon: Maker = (r, a) => {
  const cres = wobble(lune([140, 100, 66], [172, 84, 58]), r, 0.5, 30, true);
  const cresD = polyD(cres);
  const rim = lune([140, 100, 66], [152, 92, 64]);
  const stars = (
    [
      [236, 46, 9, 3.4, 4],
      [258, 118, 6.5, 2.4, -6],
      [214, 162, 5.5, 2.1, 10],
      [46, 36, 6, 2.3, -8],
      [274, 72, 4.2, 1.7, 12],
      [30, 150, 5, 1.9, 0],
      [178, 182, 4.4, 1.7, -14],
    ] as const
  ).map(([x, y, R, ri, rot]) => starShape(x, y, R, ri, rot));
  const tiny: P[] = [[112, 22], [34, 92], [198, 110], [283, 30], [250, 188], [66, 182], [232, 132], [188, 34], [80, 128]];
  const skyClip = [polyD(cardRect), cresD, ...stars.map(polyD)].join(" ");
  return [
    line(loopD(cres, r, { amp: a * 0.4, over: 8, drift: 1, start: 0 }), "#D29B2E", 2.3),
    ...stars.map((s) => line(lineD(wobble(s, r, 0.12, 10, true), true), "#E5B23A", 1.7)),
    fillS(cres, r, C.yellowSoft, { angle: -40, gap: 3.8, over: 1, jit: 0.5, w: 2.8, o: 0.88, under: 5.5, clip: cresD }),
    fillS(rim, r, "#EDB850", { angle: 50, gap: 4, over: 1, jit: 0.5, w: 2.4, o: 0.6, clip: cresD }),
    ...stars.map((s) => fillS(s, r, "#F7DC7A", { angle: 0, gap: 2.4, over: 1, jit: 0.2, w: 2.2, o: 0.95, clip: polyD(s) })),
    fillS(rect(6, 6, 294, 196), r, "#5361AE", { angle: -25, gap: 4.4, over: 2, jit: 2.2, smooth: true, w: 3.2, o: 0.78, under: 6, clip: skyClip }),
    fillS(ellipse(150, 46, 126, 30), r, "#36428A", { angle: 35, gap: 6, over: -1, jit: 2.2, smooth: true, w: 2.6, o: 0.36, clip: skyClip }),
    line(loopD(ellipse(92, 80, 5, 4.2, 0, 1.5), r, { amp: 0.2, over: 2 }), "#DDB04E", 1.5, { o: 0.8 }),
    line(loopD(ellipse(99, 120, 3.4, 3, 0, 1.5), r, { amp: 0.2, over: 2 }), "#DDB04E", 1.5, { o: 0.8 }),
    line(loopD(ellipse(120, 150, 4.6, 3.6, 0, 1.5), r, { amp: 0.2, over: 2 }), "#DDB04E", 1.5, { o: 0.8 }),
    ...tiny.map(([x, y], i) => dot(x, y, i % 3 === 0 ? 1.8 : 1.3, r, "#F8E08A", 1.9)),
  ];
};

// 12 лет: море — горизонт, островок, чайки, ряды волн с белыми гребнями,
// пена и блики на воде.
const sea: Maker = (r, a) => {
  const sky = rect(12, 12, 288, 74);
  const water = rect(12, 74, 288, 192);
  const c1 = wobble(cloudShape([[62, 40, 9], [78, 31, 13], [96, 39, 9]], 2), r, 0.4, 20, true);
  const c2 = wobble(cloudShape([[205, 31, 7], [219, 24, 11], [234, 31, 7]], 2), r, 0.4, 20, true);
  const island = polyShape([...sampleCR([[208, 74.5], [214, 68], [226, 63.5], [240, 66], [252, 74.5]], false, 3), [230, 75]], 3);
  const wave = (y0: number, period: number, amp: number, phase: number): P[] => {
    const pts: P[] = [];
    for (let x = 12; x <= 288; x += period / 8) {
      const t = ((x - 12) / period + phase) % 1;
      pts.push([x, y0 - amp * Math.sin(Math.PI * t)]);
    }
    return pts;
  };
  const rows = [
    [98, 30, 5, 0.2],
    [124, 38, 7, 0.6],
    [152, 46, 8, 0.1],
    [180, 54, 9, 0.5],
  ] as const;
  // чайка «︵︵»: два крыла-дуги, острый излом посередине
  const gull = (x: number, y: number, s: number) => {
    const wing = (tip: P, ctl: P): P[] => Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      return [(1 - t) * (1 - t) * tip[0] + 2 * t * (1 - t) * ctl[0] + t * t * x, (1 - t) * (1 - t) * tip[1] + 2 * t * (1 - t) * ctl[1] + t * t * y] as P;
    });
    return line(lineD([...wing([x - s, y - s * 0.1], [x - s * 0.55, y - s * 0.9]), ...wing([x + s, y - s * 0.25], [x + s * 0.5, y - s * 0.95]).reverse().slice(1)]), "#4A4A58", 1.7);
  };
  return [
    line(handD([[12, 74], [150, 73], [288, 74]], r, 0.3), "#24508F", 2.2),
    line(handD([[208, 74.5], [214, 68], [226, 63.5], [240, 66], [252, 74.5]], r, 0.2), C.greenDark, 2),
    line(loopD(c1, r, { amp: 0.4, over: 4, drift: 0.8 }), "#8FA9CE", 2),
    line(loopD(c2, r, { amp: 0.4, over: 4, drift: 0.8 }), "#8FA9CE", 2),
    gull(128, 44, 7),
    gull(150, 54, 5),
    ...rows.map(([y, p, am, ph]) => line(handD(wave(y, p, am, ph), r, a * 0.3), "#24508F", 2.2)),
    fillS(water, r, C.blue, { angle: 3, gap: 4.4, over: 0, jit: 0.8, smooth: true, w: 3.2, o: 0.74, under: 6, clip: polyD(cardRect) }),
    fillS(rect(12, 138, 288, 192), r, C.blueDark, { angle: -8, gap: 5, over: 0, jit: 0.8, w: 2.8, o: 0.5, clip: polyD(cardRect) }),
    fillS(rect(12, 76, 288, 88), r, "#7FB8E8", { angle: 0, gap: 3.6, over: 0, jit: 0.5, w: 2.4, o: 0.6, clip: polyD(cardRect) }),
    fillS(island, r, C.green, { angle: 60, gap: 3.4, over: 1, jit: 0.4, w: 2.4, o: 0.85, clip: polyD(island) }),
    fillS(sky, r, C.skyLight, { angle: -6, gap: 5, over: 0, jit: 1, smooth: true, w: 3.2, o: 0.62, under: 5.5, clip: [polyD(cardRect), areaD(c1), areaD(c2), polyD(island)].join(" ") }),
    ...rows.map(([y, p, am, ph]) => line(handD(shift(wave(y, p, am, ph), 0, -3.2), r, 0.3), C.white, 2.6, { o: 0.95 })),
    // блики у горизонта и пена на гребнях
    ...[[48, 81, 10], [132, 83, 7], [182, 80, 12]].map(([x, y, l]) => line(handD([[x, y], [x + l, y - 0.4]], r, 0.1), C.white, 1.8, { o: 0.9 })),
    ...[[160, 110], [76, 137], [214, 137], [120, 164], [228, 164]].flatMap(([x, y]) => [dot(x - 1.6, y + 0.6, 1.1, r, C.white, 1.9), dot(x + 2.2, y - 1.6, 0.8, r, C.white, 1.6)]),
  ];
};

// 12 лет: звёзды на тёмно-синем ночном небе (фон закрашен до неровной рамки).
const stars: Maker = (r) => {
  const list = [
    [62, 52, 24, -6],
    [150, 40, 16, 8],
    [234, 66, 28, 4],
    [110, 122, 20, -12],
    [202, 152, 18, 14],
    [54, 158, 13, 2],
  ] as const;
  const shapes = list.map(([x, y, R, rot]) => wobble(starShape(x, y, R, R * 0.45, rot), r, 0.3, 14, true));
  const sclip = [polyD(cardRect), ...shapes.map(polyD)].join(" ");
  const dots: P[] = [[186, 104], [270, 128], [142, 176], [26, 100], [96, 84], [252, 184], [268, 22], [178, 20], [26, 24]];
  return [
    ...shapes.map((s) => line(loopD(s, r, { amp: 0.2, over: 3, drift: 0.4, start: 0 }), "#E2A52B", 2)),
    ...shapes.map((s) => fillS(s, r, "#F8D449", { angle: 20, gap: 2.8, over: 1, jit: 0.3, w: 2.6, o: 0.92, under: 5, clip: polyD(s) })),
    fillS(rect(6, 6, 294, 196), r, C.navy, { angle: -30, gap: 4.2, over: 2, jit: 2.2, smooth: true, w: 3.4, o: 0.82, under: 6.5, clip: sclip }),
    fillS(rect(6, 6, 294, 196), r, "#18204E", { angle: 38, gap: 6, over: 2, jit: 2.5, smooth: true, w: 2.4, o: 0.42, clip: sclip }),
    ...dots.map(([x, y]) => dot(x, y, 2.2, r, "#F8E08A", 2.2)),
  ];
};

// 12 лет (самый подробный): водопад между скалами, брызги и озерцо.
// Кусты лежат на верхнем крае скал (их нижний край — линия скалы), небо
// обходит кусты; пена — широкая неровная полоса «барашков» у подножия.
const waterfall: Maker = (r, a) => {
  const rock = "#5E4634";
  // верх скал (нижний край кустов) и внутренние края скал
  const topL: P[] = [[6, 61], [30, 58], [70, 54], [104, 50], [121, 47]];
  const edgeL: P[] = [[121, 47], [116, 80], [121, 112], [113, 146]];
  const topR: P[] = [[178, 44], [206, 46], [240, 49], [272, 50], [294, 52]];
  const edgeR: P[] = [[178, 44], [183, 78], [176, 112], [185, 146]];
  const tlS = sampleCR(topL, false, 4);
  const trS = sampleCR(topR, false, 4);
  const elS = sampleCR(edgeL, false, 4);
  const erS = sampleCR(edgeR, false, 4);
  // кусты: «барашки» поверх линии скалы
  const bsL: C3[] = [[2, 53, 11], [19, 48, 12], [37, 45, 12], [55, 43, 11], [72, 42, 12], [90, 40, 12], [109, 41, 11]];
  const bsR: C3[] = [[189, 38, 11], [207, 35, 12], [225, 37, 11], [243, 35, 12], [261, 37, 11], [279, 38, 12], [298, 42, 11]];
  const bushTopL = wobble(arcChain(bsL), r, 0.5, 18);
  const bushTopR = wobble(arcChain(bsR), r, 0.5, 18);
  const bushL = [...bushTopL, [121, 44] as P, ...tlS.slice().reverse()];
  const bushR = [[178, 41] as P, ...bushTopR, ...trS.slice().reverse()];
  // ручей наверху между кустами и кромка водопада
  const lip: P[] = [[178, 44], [150, 47.5], [121, 47]];
  const streamTop: P[] = [[121, 46], [131, 39.5], [150, 37], [168, 39], [178, 43]];
  const stream = polyShape([...sampleCR(streamTop, false, 3), ...sampleCR(lip, false, 3).slice(1)], 3);
  const sky = polyShape([[6, 6], [294, 6], ...bushTopR.slice().reverse(), ...sampleCR(streamTop, false, 3).reverse(), ...bushTopL.slice().reverse()], 4);
  // скалы, падающая вода, озерцо
  const cliffL = polyShape([...tlS, ...elS.slice(1), [60, 151], [6, 155]], 4);
  const cliffR = polyShape([...trS.slice().reverse(), ...erS.slice(1), [240, 151], [294, 150]], 4);
  const fall = polyShape([...sampleCR(lip, false, 3).reverse(), ...erS.slice(1), [150, 148], ...elS.slice(1).reverse()], 4);
  const pool = polyShape([[6, 155], [60, 151], [113, 146], [150, 148], [185, 146], [240, 151], [294, 150], [294, 196], [6, 196]], 4);
  // пена: широкая неровная полоса пузырей у подножия (верх — над водой и
  // основаниями скал, низ — в озерце)
  const fTop: C3[] = [[97, 154, 6], [108, 148, 8], [122, 142, 9], [137, 145, 8], [152, 139, 9], [167, 144, 8], [181, 141, 8], [194, 148, 7], [205, 154, 6]];
  const fBot: C3[] = [[97, 154, 6], [109, 159, 7], [124, 163, 9], [141, 160, 7], [157, 164, 8], [175, 162, 9], [192, 159, 7], [205, 154, 6]];
  const fTopPts = arcChain(fTop);
  const foam = wobble([...fTopPts, ...arcChain(fBot, false).reverse().slice(1, -1)], r, 0.4, 14, true);
  const foamBottom = [...foam.slice(fTopPts.length - 1), foam[0]].reverse(); // низ пены слева направо
  const foamShade = polyShape([...foamBottom, ...shift(foamBottom, 0, -7).reverse()], 3);
  const foamD = polyD(foam);
  const noFoam = cutD(foamD);
  const shadeL = polyShape([[94, 46], [121, 47], [116, 80], [121, 112], [113, 146], [92, 150], [100, 112], [96, 80]]);
  const shadeR = polyShape([[178, 44], [202, 46], [198, 78], [204, 112], [208, 150], [185, 146], [176, 112], [183, 78]]);
  const clL = polyD(cliffL);
  const clR = polyD(cliffR);
  return [
    // контуры: кусты, скалы (линия скалы — нижний край куста), ручей, низ пены
    line(curveD([...bushTopL.filter((p, i) => i % 2 === 0 && p[0] > 13), [121, 44]]), C.greenDark, 2.1),
    line(curveD([[178, 41], ...bushTopR.filter((p, i) => i % 2 === 0 && p[0] < 287)]), C.greenDark, 2.1),
    line(handD([[14, 60], ...topL.slice(1), ...edgeL.slice(1)], r, a * 0.4), rock, 2.3, { cut: noFoam }),
    line(handD([[286, 51.6], ...topR.slice().reverse().slice(1, -1), ...edgeR], r, a * 0.4), rock, 2.3, { cut: noFoam }),
    line(handD(streamTop, r, 0.3), C.blueDark, 1.8, { o: 0.8 }),
    line(curveD(foamBottom.filter((_, i) => i % 2 === 0)), "#4F8FD0", 2, { o: 0.85 }),
    line(handD([[14, 154.5], [60, 151], [113, 146], [150, 148], [185, 146], [240, 151], [286, 150]], r, 0.4), "#3F7FC4", 1.8, { cut: noFoam }),
    // заливки
    fillS(cliffL, r, "#B08A6A", { angle: 60, gap: 4.6, over: 1, jit: 0.8, smooth: true, w: 3, o: 0.8, under: 6, clip: clL, cut: noFoam }),
    fillS(cliffR, r, "#B08A6A", { angle: -60, gap: 4.6, over: 1, jit: 0.8, smooth: true, w: 3, o: 0.8, under: 6, clip: clR, cut: noFoam }),
    fillS(shadeL, r, "#7A5A42", { angle: -48, gap: 4.8, over: 1, jit: 0.6, w: 2.4, o: 0.55, clip: clL, cut: noFoam }),
    fillS(shadeR, r, "#7A5A42", { angle: 48, gap: 4.8, over: 1, jit: 0.6, w: 2.4, o: 0.55, clip: clR, cut: noFoam }),
    fillS(bushL, r, C.green, { angle: 20, gap: 4, over: 1.5, jit: 0.6, smooth: true, w: 3, o: 0.85, under: 5.5, clip: polyD(bushL) }),
    fillS(bushR, r, C.green, { angle: -20, gap: 4, over: 1.5, jit: 0.6, smooth: true, w: 3, o: 0.85, under: 5.5, clip: polyD(bushR) }),
    fillS(stream, r, "#6FB4EA", { angle: 0, gap: 3.4, over: 1, jit: 0.4, w: 2.6, o: 0.8, clip: polyD(stream) }),
    fillS(fall, r, "#8FCDF2", { angle: 90, gap: 4, over: 1, jit: 0.6, smooth: true, w: 3, o: 0.8, under: 6, clip: polyD(fall), cut: noFoam }),
    fillS(pool, r, C.blue, { angle: 0, gap: 4.6, over: 0.5, jit: 0.8, smooth: true, w: 3.2, o: 0.76, under: 6, clip: polyD(pool), cut: noFoam }),
    fillS(polyShape([[6, 176], [100, 172], [200, 175], [294, 171], [294, 196], [6, 196]]), r, C.blueDark, { angle: -4, gap: 5, over: 0, jit: 1.2, smooth: true, w: 2.6, o: 0.45, clip: polyD(pool), cut: noFoam }),
    fillS(sky, r, C.skyLight, { angle: -6, gap: 5, over: 0.5, jit: 1, smooth: true, w: 3.2, o: 0.6, under: 5.5, clip: polyD(sky) }),
    // струи
    line(handD([[137, 43.5], [150, 41.5], [163, 43.5]], r, 0.15), C.white, 2, { o: 0.95 }),
    ...[128, 142, 158, 170].map((x, i) => line(handD([[x, 50], [x + (i % 2 ? 2 : -2), 92], [x + (i % 2 ? -1 : 1), 136]], r, 0.5), C.white, 2.4, { o: 0.95, cut: noFoam })),
    ...[135, 150, 164].map((x) => line(handD([[x, 53], [x - 1, 96], [x + 1, 132]], r, 0.5), "#3F8AD6", 1.6, { cut: noFoam })),
    // слои камня — только внутри скал
    ...([
      [[14, 83], [40, 80], [76, 82], [124, 77]],
      [[14, 113], [36, 110], [70, 113], [124, 107]],
      [[14, 137], [46, 134], [80, 137], [124, 133]],
    ] as P[][]).map((pts) => line(handD(pts, r, 0.5), rock, 1.6, { o: 0.72, clip: clL, cut: noFoam })),
    ...([
      [[174, 74], [226, 70], [258, 73], [286, 70]],
      [[174, 104], [222, 101], [254, 104], [286, 101]],
      [[174, 131], [230, 128], [262, 131], [286, 129]],
    ] as P[][]).map((pts) => line(handD(pts, r, 0.5), rock, 1.6, { o: 0.72, clip: clR, cut: noFoam })),
    // пена: кудрявые «барашки» и лёгкая голубая тень снизу
    fillS(foamShade, r, "#BFDDF4", { angle: 80, gap: 3.4, over: -0.5, jit: 0.8, smooth: true, w: 2.2, o: 0.6, clip: foamD }),
    line(handD(curlPts([102, 151], [196, 150], 9, 4.2, r), r, 0.2), "#8DC0EA", 1.5, { o: 0.9, clip: foamD }),
    line(handD(curlPts([110, 159], [188, 160], 7, 3.4, r), r, 0.2), "#8DC0EA", 1.4, { o: 0.8, clip: foamD }),
    // брызги: капли над основанием водопада и дуги над озерцом (несимметрично)
    dot(131, 130, 2.2, r, C.white, 2.4),
    dot(160, 124, 1.6, r, C.white, 2.2),
    line(handD([[205, 156], [211, 151], [217, 151], [222, 155]], r, 0.15), C.white, 2.1, { o: 0.95 }),
    dot(225, 149, 1.5, r, C.white, 2.1),
    dot(91, 164, 1.4, r, C.white, 2),
    // рябь на озерце
    line(handD([[30, 172], [44, 168], [58, 172]], r, 0.3), C.white, 2.4),
    line(handD([[226, 178], [242, 174], [258, 178]], r, 0.3), C.white, 2.4),
    line(handD([[118, 182], [134, 178], [150, 182], [166, 178]], r, 0.3), C.white, 2.4),
  ];
};

const MAKERS: Record<DrawingKind, Maker> = {
  apple,
  tree,
  earth,
  sun,
  tulip,
  cloud,
  bird,
  daisy,
  mountains,
  river,
  lake,
  leaf,
  rainbow,
  grass,
  berryBush,
  butterfly,
  shell,
  stone,
  rain,
  hills,
  snowflake,
  moon,
  sea,
  stars,
  waterfall,
};

export const DRAWING_KINDS = Object.keys(MAKERS) as DrawingKind[];
const byKind = <T>(f: (k: DrawingKind) => T): Record<DrawingKind, T> => {
  const o = {} as Record<DrawingKind, T>;
  for (const k of DRAWING_KINDS) o[k] = f(k);
  return o;
};

export const DRAWINGS: Record<DrawingKind, readonly Stroke[]> = byKind((k) => MAKERS[k](rnd(seedOf(`80-1-10:${k}`)), ampOf(DRAWING_AGE[k])));

// Рисунки «во весь лист»: всё отсекается по чуть неровной рамке внутри полей
// (ребёнок закрашивал фон до края — край ровный от руки, без «зубчиков»).
const FRAMED: readonly DrawingKind[] = ["waterfall", "stars", "moon", "snowflake"];
export const DRAWING_FRAMES: Partial<Record<DrawingKind, string>> = Object.fromEntries(
  FRAMED.map((k) => [k, areaD(frameShape(rnd(seedOf(`80-1-10:frame:${k}`))))]),
) as Partial<Record<DrawingKind, string>>;
// Тёмный фон: светлые крапинки бумаги приглушены (иначе читаются как снег).
export const DRAWING_GRAIN: Partial<Record<DrawingKind, number>> = { moon: 0.4, stars: 0.35 };

// ================= Проявление и кончик карандаша =================
// План рисования: штрихи и переносы карандаша по воздуху между ними. Время
// плана (его «единицы») — не длина: контур ребёнок ведёт медленно, а
// закрашивает быстрыми каракулями, поэтому заливка стоит ~0,4 своей длины;
// у каждого штриха есть минимальная длительность, у переноса — минимальная
// пауза. Так короткие штрихи в конце рисунка (облачка, искорки) не
// проскакивают за кадр, а кончик карандаша движется без скачков.
export type DrawPlan = {
  readonly strokes: readonly Stroke[];
  readonly start: readonly number[]; // начало каждого штриха (время плана)
  readonly dur: readonly number[]; // длительность каждого штриха (время плана)
  readonly total: number;
  readonly ends: readonly { readonly a: P; readonly b: P }[]; // начало и конец каждого штриха
};
const pointAt = (d: string, l: number): P => {
  const q = getPointAtLength(d, l);
  return q ? [q.x, q.y] : [CARD_W / 2, CARD_H / 2];
};
const FILL_K = 0.4; // каракули заливки быстрее контура
const STROKE_T0 = 22; // у каждого штриха есть «накладное» время: короткий штрих рисуется бережнее
const LIFT_MIN = 10; // перенос по воздуху — не меньше
const LIFT_K = 0.55; // по воздуху карандаш движется быстрее, чем рисует

export const strokeCost = (s: Stroke) => STROKE_T0 + (s.fill ? s.len * FILL_K : s.len);

export const makePlan = (strokes: readonly Stroke[]): DrawPlan => {
  const start: number[] = [];
  const dur: number[] = [];
  const ends: { a: P; b: P }[] = [];
  let c = 0;
  strokes.forEach((s, i) => {
    const a = pointAt(s.d, 0);
    const b = pointAt(s.d, s.len);
    if (i > 0) c += Math.max(LIFT_MIN, LIFT_MIN * 0.5 + LIFT_K * dist(ends[i - 1].b, a)) + (s.pre ?? 0);
    start.push(c);
    dur.push(strokeCost(s));
    ends.push({ a, b });
    c += dur[i];
  });
  return { strokes, start, dur, total: Math.max(1e-6, c), ends };
};

// Сколько каждого штриха нарисовано при доле progress (0…len).
export const drawnLengths = (plan: DrawPlan, progress: number): number[] => {
  const at = clamp01(progress) * plan.total;
  return plan.strokes.map((s, i) => s.len * clamp01((at - plan.start[i]) / plan.dur[i]));
};

// Доля progress, при которой закончен каждый штрих (для ключей хореографии).
export const strokeEndFractions = (plan: DrawPlan): number[] => plan.start.map((s, i) => (s + plan.dur[i]) / plan.total);

const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const tipOf = (plan: DrawPlan, progress: number): Tip => {
  const S = plan.strokes;
  if (S.length === 0) return { x: CARD_W / 2, y: CARD_H / 2, down: false, color: C.graphite };
  const p = clamp01(progress);
  if (p <= 0) return { x: plan.ends[0].a[0], y: plan.ends[0].a[1], down: false, color: S[0].color };
  const last = S.length - 1;
  if (p >= 1) return { x: plan.ends[last].b[0], y: plan.ends[last].b[1], down: false, color: S[last].color };
  const at = p * plan.total;
  for (let i = 0; i <= last; i++) {
    const s0 = plan.start[i];
    if (at < s0) {
      // перенос по воздуху от конца штриха i−1 к началу штриха i (пауза pre — в конце, над началом)
      const prevEnd = plan.start[i - 1] + plan.dur[i - 1];
      const moveEnd = s0 - (S[i].pre ?? 0);
      const t = easeIO(clamp01((at - prevEnd) / Math.max(1e-6, moveEnd - prevEnd)));
      const q = lerpP(plan.ends[i - 1].b, plan.ends[i].a, t);
      return { x: q[0], y: q[1], down: false, color: S[i].color };
    }
    if (at <= s0 + plan.dur[i]) {
      const q = pointAt(S[i].d, (S[i].len * (at - s0)) / plan.dur[i]);
      return { x: q[0], y: q[1], down: true, color: S[i].color };
    }
  }
  return { x: plan.ends[last].b[0], y: plan.ends[last].b[1], down: false, color: S[last].color };
};

export const DRAWING_PLANS: Record<DrawingKind, DrawPlan> = byKind((k) => makePlan(DRAWINGS[k]));

// Кончик карандаша (единицы карточки) при доле progress рисунка kind.
export const drawingTip = (kind: DrawingKind, progress: number): Tip => tipOf(DRAWING_PLANS[kind], progress);

// ================= Бумажная лодочка на карточке Амира =================
// Между деревом и подписью (x ≈ 150, y ≈ 142…176). Первый штрих — нижняя
// линия корпуса (рисует Юсуф, чуть неровно); остальное — борта и верхний
// край, треугольный парус, две короткие линии сгиба (Амир, ровнее).
export const BOAT_BLUE = "#3E6DB5"; // синий карандаш лодочки (им же — подпись)
const boatRnd = rnd(seedOf("80-1-10:boat"));
export const BOAT_STROKES: readonly Stroke[] = [
  line(handD([[131, 175], [140, 176.2], [150, 174.4], [160, 176.4], [169, 175]], boatRnd, 0.9), BOAT_BLUE, 2.8),
  // Амир продолжает от конца линии Юсуфа (после паузы: карандаш переходит из рук в руки)
  line(handD([[169, 175], [184, 160], [150, 160.4], [116, 160], [131, 175]], boatRnd, 0.3, { smooth: false }), BOAT_BLUE, 2.4, { pre: 20 }),
  line(handD([[137, 160], [150, 142], [163, 160]], boatRnd, 0.25, { smooth: false }), BOAT_BLUE, 2.4),
  line(handD([[123, 161.6], [131, 169.4]], boatRnd, 0.15), BOAT_BLUE, 1.8, { o: 0.85 }),
  line(handD([[177, 161.6], [169, 169.4]], boatRnd, 0.15), BOAT_BLUE, 1.8, { o: 0.85 }),
];
export const BOAT_PLAN = makePlan(BOAT_STROKES);
// Доля progress лодочки, которую рисует Юсуф (только нижняя линия корпуса).
// После неё до ≈ 0,2 карандаш поднят и стоит над концом линии (передача
// карандаша Амиру), затем Амир ведёт борт от того же места.
export const BOAT_YUSUF_SHARE = (BOAT_PLAN.start[0] + BOAT_PLAN.dur[0]) / BOAT_PLAN.total;
export const boatTip = (progress: number): Tip => tipOf(BOAT_PLAN, progress);

// ================= Подпись под лодочкой =================
export const CAPTION = "Лодочку сложил Амир";
export const CAPTION_FONT = 13.5; // Nunito 600
export const CAPTION_BASELINE = 194;
// Ширины знаков Nunito 600 (доли кегля, измерены в Chromium).
const ADV: Record<string, number> = {
  Л: 0.746,
  о: 0.577,
  д: 0.604,
  ч: 0.562,
  к: 0.541,
  у: 0.531,
  " ": 0.264,
  с: 0.479,
  л: 0.585,
  ж: 0.803,
  и: 0.593,
  А: 0.736,
  м: 0.671,
  р: 0.602,
};
const capRnd = rnd(seedOf("80-1-10:caption"));
const CAP_CHARS = [...CAPTION];
const CAP_W = CAP_CHARS.reduce((acc, ch) => acc + (ADV[ch] ?? 0.55) * CAPTION_FONT, 0);
const CAP_X0 = CARD_W / 2 - CAP_W / 2;
export type CaptionGlyph = { readonly ch: string; readonly x: number; readonly y: number; readonly rot: number; readonly w: number };
export const CAPTION_LAYOUT: readonly CaptionGlyph[] = (() => {
  let x = CAP_X0;
  return CAP_CHARS.map((ch, i) => {
    const w = (ADV[ch] ?? 0.55) * CAPTION_FONT;
    const slope = (i / CAP_CHARS.length - 0.5) * -0.8; // строка чуть поднимается к концу
    const g = { ch, x: x + sym(capRnd, 0.25), y: CAPTION_BASELINE + slope + sym(capRnd, 0.55), rot: sym(capRnd, 3.5), w };
    x += w;
    return g;
  });
})();
export const CAPTION_BOX = { x0: CAP_X0, x1: CAP_X0 + CAP_W, top: CAPTION_BASELINE - 11, bottom: CAPTION_BASELINE + 4 } as const;

// Кончик карандаша при письме подписи: слева направо по буквам; над
// пробелами карандаш приподнят; внутри буквы — небольшие движения вверх-вниз.
const CAP_CELLS: readonly number[] = CAP_CHARS.reduce<number[]>((acc, ch, i) => [...acc, i === 0 ? CAP_X0 : acc[i - 1] + (ADV[CAP_CHARS[i - 1]] ?? 0.55) * CAPTION_FONT], []);
export const captionTip = (progress: number): { x: number; y: number; down: boolean } => {
  const p = clamp01(progress);
  const x = CAP_X0 + p * CAP_W;
  const G = CAPTION_LAYOUT;
  const n = G.length;
  if (p <= 0) return { x, y: G[0].y - 1.3, down: false };
  if (p >= 1) return { x, y: G[n - 1].y - 1.3, down: false };
  let i = 0;
  while (i < n - 1 && x >= CAP_CELLS[i + 1]) i++;
  const f = clamp01((x - CAP_CELLS[i]) / G[i].w);
  const base = G[i].y + (G[Math.min(n - 1, i + 1)].y - G[i].y) * f;
  if (G[i].ch === " ") return { x, y: base - 1.3 - Math.sin(Math.PI * f) * 3.5, down: false };
  return { x, y: base - 4.5 + Math.cos(f * Math.PI * 4) * 3.2, down: true };
};
// Сколько подписи проявлено: правая граница (x) по кончику карандаша.
export const captionRevealX = (progress: number) => (progress <= 0 ? CAP_X0 - 2 : progress >= 1 ? CAP_X0 + CAP_W + 6 : captionTip(progress).x + 1.2);
// Проявление каждой буквы (0…1): буква появляется целиком, пока карандаш
// проходит по ней (не срезается вертикальной границей).
export const captionGlyphReveal = (progress: number): number[] => {
  const p = clamp01(progress);
  const x = CAP_X0 + p * CAP_W;
  return CAP_CELLS.map((x0, i) => {
    if (p >= 1) return 1;
    const f = clamp01((x - x0 - CAPTION_LAYOUT[i].w * 0.1) / (CAPTION_LAYOUT[i].w * 0.6));
    return f * f * (3 - 2 * f);
  });
};

// ================= Прежний рисунок Земли (80-1-7) =================
// Те же штрихи и цвета, что в 80-1-7 (earthPath.ts), единицы листа 300 × 220.
export const OLD_EARTH_UNITS = { w: 300, h: 220 } as const;
export const OLD_EARTH_STROKES: readonly { readonly id: string; readonly d: string; readonly color: string; readonly w: number; readonly fill?: string }[] = [
  { id: "circle", d: "M 150 48 C 192 46 222 82 220 120 C 218 160 186 190 148 188 C 108 186 78 156 80 116 C 82 78 110 50 150 48 Z", color: "#3B3A44", w: 3 },
  { id: "land1", d: "M 112 84 C 128 76 146 80 150 92 C 154 104 138 112 126 110 C 114 108 104 94 112 84 Z", color: "#4F8A3C", w: 2.4, fill: "#A9D28F" },
  { id: "land2", d: "M 168 110 C 182 102 198 112 196 128 C 194 142 178 150 166 142 C 156 134 158 116 168 110 Z", color: "#4F8A3C", w: 2.4, fill: "#A9D28F" },
  { id: "land3", d: "M 120 140 C 132 136 144 146 140 158 C 136 168 120 166 114 156 C 110 148 112 142 120 140 Z", color: "#4F8A3C", w: 2.4, fill: "#A9D28F" },
  { id: "shade1", d: "M 86 100 L 118 64 M 82 122 L 134 58 M 84 144 L 148 70 M 92 164 L 150 96 M 104 180 L 150 128 M 122 188 L 150 158", color: "#5A6A95", w: 2 },
  { id: "rays", d: "M 252 100 L 270 94 M 254 118 L 274 118 M 252 136 L 270 142", color: "#E0B22C", w: 3 },
  { id: "dot", d: "M 186 88 a 5 5 0 1 0 0.1 0 Z", color: "#C8372D", w: 3, fill: "#E8553D" },
  { id: "arrow", d: "M 214 66 C 232 92 232 146 210 172", color: "#2F4A7A", w: 3 },
  { id: "arrowHead", d: "M 222 160 L 210 172 L 196 164", color: "#2F4A7A", w: 3 },
];

// Проверка: каждый рисунок непустой, штрихи — один подпуть, лодочка в своей
// полосе, подпись внутри карточки. Возвращает список проблем (пустой — норма).
export const checkDrawings = (): string[] => {
  const p: string[] = [];
  for (const k of DRAWING_KINDS) {
    const s = DRAWINGS[k];
    if (s.length < 3) p.push(`${k}: мало штрихов`);
    for (const st of s) {
      if ((st.d.match(/M/g) ?? []).length !== 1) p.push(`${k}: штрих из нескольких подпутей`);
      if (!(st.len > 0)) p.push(`${k}: штрих нулевой длины`);
    }
  }
  if (CAPTION_BOX.x0 < 6 || CAPTION_BOX.x1 > CARD_W - 6 || CAPTION_BOX.bottom > CARD_H - 2) p.push("подпись выходит за карточку");
  if (!(BOAT_YUSUF_SHARE > 0.05 && BOAT_YUSUF_SHARE < 0.5)) p.push("доля Юсуфа в лодочке вне 5–50 %");
  return p;
};
