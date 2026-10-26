// ThreadContinuityEngine — непрерывность нитей между сценами.
//
// Каждая основная нить имеет постоянный ID, цвет, толщину, материал и цепочку форм
// (ключевых состояний). Переход между формами — не замена объекта, а перетекание
// той же нити: точки нити переходят к новой форме «бегущим фронтом» вдоль длины,
// по пути приподнимаясь (провисание/натяжение), поэтому зритель видит, откуда
// пришёл новый объект. Число точек сохраняется — никаких телепортаций.
import { clamp, smoother, V3 } from "../utils/math";

export type Path = Float32Array; // n×3

/** Построить кривую из параметрической функции s∈[0,1] → xyz. */
export const buildPath = (n: number, fn: (s: number, i: number) => V3): Path => {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = fn(n === 1 ? 0 : i / (n - 1), i);
    out[i * 3] = p[0];
    out[i * 3 + 1] = p[1];
    out[i * 3 + 2] = p[2];
  }
  return out;
};

export const buildColors = (n: number, fn: (s: number, i: number) => V3): Float32Array => buildPath(n, fn);

export const pointCount = (p: Path) => p.length / 3;

/** Накопленная длина дуги. */
export const arcLengths = (p: Path, closed = false): Float32Array => {
  const n = p.length / 3;
  const out = new Float32Array(n + (closed ? 1 : 0));
  let acc = 0;
  for (let i = 1; i < n; i++) {
    acc += Math.hypot(p[i * 3] - p[i * 3 - 3], p[i * 3 + 1] - p[i * 3 - 2], p[i * 3 + 2] - p[i * 3 - 1]);
    out[i] = acc;
  }
  if (closed) {
    const j = (n - 1) * 3;
    acc += Math.hypot(p[0] - p[j], p[1] - p[j + 1], p[2] - p[j + 2]);
    out[n] = acc;
  }
  return out;
};

/** Равномерная по длине дуги передискретизация в m точек (для согласования форм в морфинге). */
export const resample = (p: Path, m: number): Path => {
  const n = p.length / 3;
  if (n === m) return p;
  const L = arcLengths(p);
  const total = L[n - 1] || 1e-9;
  const out = new Float32Array(m * 3);
  let k = 0;
  for (let i = 0; i < m; i++) {
    const target = (i / (m - 1)) * total;
    while (k < n - 2 && L[k + 1] < target) k++;
    const seg = L[k + 1] - L[k] || 1e-9;
    const t = clamp((target - L[k]) / seg);
    for (let c = 0; c < 3; c++) out[i * 3 + c] = p[k * 3 + c] + (p[(k + 1) * 3 + c] - p[k * 3 + c]) * t;
  }
  return out;
};

export interface MorphOptions {
  /** Кадр начала перехода. */
  start: number;
  /** Длительность перехода одной точки (кадры). */
  dur: number;
  /** Задержка фронта от начала до конца нити (кадры): «нить вытягивается с конца». */
  spread?: number;
  /** Фронт идёт с конца нити к началу. */
  reverse?: boolean;
  /** Высота дуги перелёта (провисание/натяжение). */
  lift?: number;
  /** Направление подъёма — вектор или функция от позиции. */
  liftDir?: V3 | ((x: number, y: number, z: number) => V3);
  /** Боковой «закрут» перелёта вокруг оси Y (рад). */
  swirl?: number;
}

/** Прогресс точки s в момент f (0 — исходная форма, 1 — целевая). */
export const morphProgress = (f: number, s: number, o: MorphOptions) => {
  const ss = o.reverse ? 1 - s : s;
  return smoother(clamp((f - o.start - (o.spread ?? 0) * ss) / o.dur));
};

/**
 * Морфинг формы A → B той же нити. A и B должны иметь одинаковое число точек.
 * Возвращает новую кривую и (опционально) смешанные цвета.
 */
export const morph = (
  f: number,
  A: Path,
  B: Path,
  o: MorphOptions,
  colA?: Float32Array,
  colB?: Float32Array,
): { pts: Path; cols?: Float32Array; done: number } => {
  const n = A.length / 3;
  const out = new Float32Array(n * 3);
  const cols = colA && colB ? new Float32Array(n * 3) : undefined;
  let doneSum = 0;
  for (let i = 0; i < n; i++) {
    const s = n === 1 ? 0 : i / (n - 1);
    const e = morphProgress(f, s, o);
    doneSum += e;
    const ax = A[i * 3], ay = A[i * 3 + 1], az = A[i * 3 + 2];
    let x = ax + (B[i * 3] - ax) * e;
    let y = ay + (B[i * 3 + 1] - ay) * e;
    let z = az + (B[i * 3 + 2] - az) * e;
    if (o.lift && e > 0 && e < 1) {
      const bump = Math.sin(Math.PI * e) * o.lift;
      const d = typeof o.liftDir === "function" ? o.liftDir(ax, ay, az) : o.liftDir ?? [0, 1, 0];
      x += d[0] * bump;
      y += d[1] * bump;
      z += d[2] * bump;
    }
    if (o.swirl && e > 0 && e < 1) {
      const a = Math.sin(Math.PI * e) * o.swirl;
      const c = Math.cos(a), sn = Math.sin(a);
      const rx = x * c - z * sn, rz = x * sn + z * c;
      x = rx;
      z = rz;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
    if (cols && colA && colB) {
      for (let c = 0; c < 3; c++) cols[i * 3 + c] = colA[i * 3 + c] + (colB[i * 3 + c] - colA[i * 3 + c]) * e;
    }
  }
  return { pts: out, cols, done: doneSum / n };
};

/** Ключевое состояние нити: форма как функция кадра (форма может сама двигаться). */
export interface ThreadKey {
  /** Кадр, с которого начинается переход к этой форме (для первой формы игнорируется). */
  at: number;
  shape: (f: number) => Path;
  /** Цвета по точкам, n — число точек нити. */
  colors?: (f: number, n: number) => Float32Array;
  morph?: Omit<MorphOptions, "start">;
}

/**
 * Хореография одной нити: цепочка форм с переходами.
 * Возвращает форму в кадре f. Все формы передискретизируются в n точек.
 */
export const evalChain = (
  f: number,
  keys: ThreadKey[],
  n: number,
): { pts: Path; cols?: Float32Array; stage: number; blend: number } => {
  let k = 0;
  while (k + 1 < keys.length && f >= keys[k + 1].at) k++;
  const cur = keys[k];
  const prev = k > 0 ? keys[k - 1] : undefined;
  const curPts = resample(cur.shape(f), n);
  const curCol = cur.colors ? cur.colors(f, n) : undefined;
  if (!prev || !cur.morph) return { pts: curPts, cols: curCol, stage: k, blend: 1 };
  const o: MorphOptions = { ...cur.morph, start: cur.at };
  const endF = cur.at + o.dur + (o.spread ?? 0);
  if (f >= endF) return { pts: curPts, cols: curCol, stage: k, blend: 1 };
  const prevPts = resample(prev.shape(f), n);
  const prevCol = prev.colors ? prev.colors(f, n) : undefined;
  const r = morph(f, prevPts, curPts, o, prevCol, curCol);
  return { pts: r.pts, cols: r.cols ?? curCol, stage: k, blend: r.done };
};
