// Генераторы облаков точек (единичные координаты, центр 0,0, y вниз).
// Заполнение — последовательность Халтона: равномерно и без «дыр», детерминировано.
import { hash01 } from "./math";

export type Pt = [number, number];

const halton = (i: number, b: number) => {
  let f = 1;
  let r = 0;
  let k = i;
  while (k > 0) {
    f /= b;
    r += f * (k % b);
    k = Math.floor(k / b);
  }
  return r;
};

// n точек внутри фигуры inside(x,y) в рамке [x0,x1]×[y0,y1]
export const fill = (
  n: number,
  inside: (x: number, y: number) => boolean,
  box = [-1, -1, 1, 1],
): Pt[] => {
  const [x0, y0, x1, y1] = box;
  const out: Pt[] = [];
  for (let i = 1; out.length < n && i < n * 400; i++) {
    const x = x0 + (x1 - x0) * halton(i, 2);
    const y = y0 + (y1 - y0) * halton(i, 3);
    if (inside(x, y)) out.push([x, y]);
  }
  return out;
};

// n точек на ломаной/кривой, заданной параметрически t∈[0,1]
export const along = (n: number, at: (t: number) => Pt, jitter = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const [x, y] = at((i + 0.5) / n);
    return [
      x + (hash01(i, 31) - 0.5) * jitter,
      y + (hash01(i, 32) - 0.5) * jitter,
    ];
  });

// порядок по углу вокруг центра — соседние частицы летят в соседние места
export const byAngle = (pts: Pt[], cx = 0, cy = 0): Pt[] =>
  [...pts].sort(
    (a, b) =>
      Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx),
  );
export const byY = (pts: Pt[]): Pt[] =>
  [...pts].sort((a, b) => a[1] - b[1] || a[0] - b[0]);

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

// диск подсолнухом (Фогель) — равномерно, красиво читается как «точечная» графика
export const disc = (n: number): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / n);
    const a = i * GOLDEN;
    return [r * Math.cos(a), r * Math.sin(a)];
  });

export const ring = (n: number, r = 1, jitter = 0): Pt[] =>
  along(
    n,
    (t) => [r * Math.cos(t * Math.PI * 2), r * Math.sin(t * Math.PI * 2)],
    jitter,
  );

// Луна-серп: диск минус смещённый диск (освещённая часть справа — растущая луна)
export const crescent = (n: number): Pt[] => {
  const inside = (x: number, y: number) =>
    x * x + y * y <= 1 && (x + 0.48) ** 2 + (y + 0.06) ** 2 > 0.82 ** 2;
  const edge = Math.round(n * 0.22);
  const outer = along(edge, (t) => {
    const a = -Math.PI / 2 + t * Math.PI * 1.0;
    return [Math.cos(a), Math.sin(a)];
  }).filter(([x, y]) => inside(x * 0.999, y * 0.999));
  return [...outer, ...fill(n - outer.length, inside)];
};

// Солнце: плотное ядро + кольцо + 12 лучей
export const sun = (n: number): Pt[] => {
  const nCore = Math.round(n * 0.62);
  const nRing = Math.round(n * 0.1);
  const nRays = n - nCore - nRing;
  const core = disc(nCore).map(([x, y]) => [x * 0.62, y * 0.62] as Pt);
  const rim = ring(nRing, 0.66);
  const rays: Pt[] = [];
  const per = Math.ceil(nRays / 12);
  for (let k = 0; k < 12 && rays.length < nRays; k++) {
    const a = (k / 12) * Math.PI * 2;
    for (let j = 0; j < per && rays.length < nRays; j++) {
      const t = (j + 0.5) / per;
      const r = 0.8 + t * 0.28;
      const w = (j % 2 ? 1 : -1) * 0.006;
      rays.push([
        r * Math.cos(a) - w * Math.sin(a),
        r * Math.sin(a) + w * Math.cos(a),
      ]);
    }
  }
  return [...core, ...rim, ...rays];
};

// капля: круг снизу + сужение кверху
export const drop = (n: number): Pt[] =>
  fill(n, (x, y) => {
    if (y > 0) return x * x + (y * 1.0) ** 2 <= 0.36;
    const w = 0.6 * Math.pow(Math.max(0, (y + 1) / 1), 1.6);
    return Math.abs(x) <= w && y >= -1;
  });

// Дерево: ствол и ветви (рекурсивно), крона — скопления точек на концах ветвей.
export type TreePart = { pts: Pt[]; kind: "wood" | "leaf"; depth: number };
export const tree = (
  nWood: number,
  nLeaf: number,
): { wood: Pt[]; leaf: Pt[] } => {
  type Seg = {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    w: number;
    d: number;
  };
  const segs: Seg[] = [];
  const grow = (
    x: number,
    y: number,
    ang: number,
    len: number,
    w: number,
    d: number,
    id: number,
  ) => {
    const x1 = x + Math.cos(ang) * len;
    const y1 = y + Math.sin(ang) * len;
    segs.push({ x0: x, y0: y, x1, y1, w, d });
    if (d >= 5) return;
    const spread = 0.42 + hash01(id, 3) * 0.12;
    const k = 0.74 + hash01(id, 4) * 0.06;
    grow(
      x1,
      y1,
      ang - spread + (hash01(id, 5) - 0.5) * 0.12,
      len * k,
      w * 0.66,
      d + 1,
      id * 2 + 1,
    );
    grow(
      x1,
      y1,
      ang + spread + (hash01(id, 6) - 0.5) * 0.12,
      len * k,
      w * 0.66,
      d + 1,
      id * 2 + 2,
    );
    if (d < 2)
      grow(
        x1,
        y1,
        ang + (hash01(id, 7) - 0.5) * 0.2,
        len * k * 0.9,
        w * 0.6,
        d + 2,
        id * 2 + 3,
      );
  };
  grow(0, 1, -Math.PI / 2, 0.52, 0.11, 0, 1);
  const lens = segs.map(
    (s) => Math.hypot(s.x1 - s.x0, s.y1 - s.y0) * (0.5 + s.w * 6),
  );
  const total = lens.reduce((a, b) => a + b, 0);
  const wood: Pt[] = [];
  segs.forEach((s, si) => {
    const cnt = Math.max(2, Math.round((nWood * lens[si]) / total));
    for (let j = 0; j < cnt; j++) {
      const t = hash01(wood.length, 51);
      const off = (hash01(wood.length, 52) - 0.5) * s.w;
      const dx = s.x1 - s.x0;
      const dy = s.y1 - s.y0;
      const L = Math.hypot(dx, dy) || 1;
      wood.push([
        s.x0 + dx * t + (-dy / L) * off,
        s.y0 + dy * t + (dx / L) * off,
      ]);
    }
  });
  // крона: облако кругов вокруг концов тонких ветвей
  const tips = segs.filter((s) => s.d >= 4);
  const leaf: Pt[] = [];
  for (let i = 0; leaf.length < nLeaf; i++) {
    const s = tips[i % tips.length];
    const a = hash01(i, 61) * Math.PI * 2;
    const r = Math.sqrt(hash01(i, 62)) * 0.17;
    leaf.push([s.x1 + Math.cos(a) * r, s.y1 + Math.sin(a) * r * 0.85]);
  }
  return { wood: wood.slice(0, nWood), leaf };
};

// Открытая книга (вид спереди-сверху): две страницы с изогнутым верхом,
// контур + строки «текста» точками.
export const book = (n: number): Pt[] => {
  const nEdge = Math.round(n * 0.34);
  const nText = n - nEdge;
  // страница: x∈[0,1] от корешка; верх изогнут, низ — тоже, с провисом к корешку
  const top = (u: number) =>
    -0.62 - 0.1 * Math.sin(u * Math.PI * 0.9) + 0.06 * (1 - u) ** 3;
  const bot = (u: number) =>
    0.5 - 0.06 * Math.sin(u * Math.PI * 0.9) + 0.08 * (1 - u) ** 3;
  const pageOutline = (t: number): Pt => {
    // обход: корешок вверх → верх → внешний край → низ
    if (t < 0.38) {
      const u = t / 0.38;
      return [u, top(u)];
    }
    if (t < 0.5) {
      const v = (t - 0.38) / 0.12;
      return [1, top(1) + (bot(1) - top(1)) * v];
    }
    if (t < 0.88) {
      const u = 1 - (t - 0.5) / 0.38;
      return [u, bot(u)];
    }
    const v = (t - 0.88) / 0.12;
    return [0, bot(0) + (top(0) - bot(0)) * v];
  };
  const edge: Pt[] = [];
  const half = Math.round(nEdge / 2);
  for (let i = 0; i < nEdge; i++) {
    const side = i < half ? -1 : 1;
    const k = i < half ? i : i - half;
    const cnt = i < half ? half : nEdge - half;
    const [u, v] = pageOutline((k + 0.5) / cnt);
    edge.push([side * u * 0.92, v]);
  }
  const text: Pt[] = [];
  const rows = 9;
  const per = Math.ceil(nText / (rows * 2));
  for (let side = -1; side <= 1 && text.length < nText; side += 2) {
    for (let r = 0; r < rows && text.length < nText; r++) {
      const v = (r + 0.8) / (rows + 0.6);
      const lineLen =
        r === rows - 1 ? 0.5 : 0.92 - hash01(r * 3 + side, 71) * 0.18;
      for (let j = 0; j < per && text.length < nText; j++) {
        const u = 0.12 + ((j + 0.5) / per) * 0.74 * lineLen;
        const y = top(u) + (bot(u) - top(u)) * (0.1 + v * 0.82);
        text.push([side * u * 0.92, y]);
      }
    }
  }
  return [...edge, ...text];
};

// Звёзды на весь кадр: позиция 0…1 и глубина (для параллакса)
export type Star = { x: number; y: number; z: number; tw: number };
export const starfield = (n: number, seed = 1): Star[] =>
  Array.from({ length: n }, (_, i) => ({
    x: hash01(i, seed * 10 + 1),
    y: hash01(i, seed * 10 + 2),
    z: Math.pow(hash01(i, seed * 10 + 3), 2.2),
    tw: hash01(i, seed * 10 + 4),
  }));
