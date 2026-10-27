// Геометрия рисунка BG-017 (координаты листа альбома, 940 × 1100).
//
// Одни и те же линии проходят весь фильм: жёлтые петли дней недели
// (дом → школа → дом) сначала сплетены в клубок вместе с синими/зелёными
// линиями работы родителей; затем они расправляются в пять строк недели
// (повтор ҮЙ → МЕКТЕП → ҮЙ виден в каждой строке); после касания мамы по
// экрану все пять строк сходятся в одну ровную петлю маршрута. Линии
// иллюстративные — не реальные улицы.

export type Pt = readonly [number, number];

// Лист на столе (мировые координаты = кадр 1080 × 1920 при z = 1).
export const SHEET = { x: 70, y: 400, w: 940, h: 1100 } as const;

export const HOME: Pt = [170, 850];
export const SCHOOL: Pt = [770, 300];
export const MOM_WORK: Pt = [185, 300];
export const DAD_WORK: Pt = [790, 780];
export const CAR_SPOT: Pt = [470, 600];

// детерминированный «случайный» генератор
const rnd = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerpPt = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// Кривая от a к b с изгибом bow (перпендикулярно) и мелкой «детской» дрожью.
const stroke = (a: Pt, b: Pt, bow: number, wob: number, waves: number, phase: number, n = 40): Pt[] => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = bow * Math.sin(Math.PI * t) + wob * Math.sin(Math.PI * 2 * waves * t + phase) * Math.sin(Math.PI * t);
    out.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
  }
  return out;
};

// Маленькая петелька-завиток (ребёнок «закрутил» мелок).
const curl = (c: Pt, r: number, turns: number, start: number, n = 22): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = start + (Math.PI * 2 * turns * i) / n;
    out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return out;
};

const join = (...parts: Pt[][]): Pt[] => parts.flatMap((p, i) => (i === 0 ? p : p.slice(1)));

// Ресэмплинг ломаной по длине дуги до n точек (для плавного морфинга).
export const resample = (pts: readonly Pt[], n: number): Pt[] => {
  const d: number[] = [0];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = d[d.length - 1] || 1;
  const out: Pt[] = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = (total * i) / (n - 1);
    while (j < d.length - 2 && d[j + 1] < s) j++;
    const k = (s - d[j]) / (d[j + 1] - d[j] || 1);
    out.push(lerpPt(pts[j], pts[j + 1], Math.min(1, Math.max(0, k))));
  }
  return out;
};

export const morph = (a: readonly Pt[], b: readonly Pt[], k: number): Pt[] => a.map((p, i) => lerpPt(p, b[i], k));

// Плавный путь через точки (Catmull-Rom → кубические Безье).
export const smoothPath = (pts: readonly Pt[]): string => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

// Точка на ломаной в доле k (0…1) — кончик мелка, машинка на маршруте.
export const pointAt = (pts: readonly Pt[], k: number): Pt => {
  const x = Math.min(pts.length - 1, Math.max(0, k * (pts.length - 1)));
  const i = Math.min(pts.length - 2, Math.floor(x));
  return lerpPt(pts[i], pts[i + 1], x - i);
};
export const angleAt = (pts: readonly Pt[], k: number): number => {
  const a = pointAt(pts, Math.max(0, k - 0.01));
  const b = pointAt(pts, Math.min(1, k + 0.01));
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
};

export const N = 120;

// ---------- 1. Клубок: петли дней ----------
// Каждый день жёлтая линия идёт из дома в школу и обратно своим путём,
// с завитками — вместе они дают огромный жёлтый клубок.
export const DAY_LOOPS: readonly Pt[][] = [0, 1, 2, 3, 4].map((i) => {
  const r = rnd(101 + i * 17);
  const bowOut = (i % 2 ? 1 : -1) * (90 + 60 * r());
  const bowBack = (i % 2 ? -1 : 1) * (120 + 90 * r());
  const mid = lerpPt(HOME, SCHOOL, 0.35 + 0.3 * r());
  const out1 = stroke(HOME, mid, bowOut * 0.6, 26, 2 + i, r() * 6);
  const c = curl([mid[0] + 10, mid[1] - 30], 34 + 14 * r(), 1, Math.PI * (0.5 + r()));
  const out2 = stroke(c[c.length - 1], SCHOOL, bowOut, 22, 2, r() * 6);
  const back = stroke(SCHOOL, HOME, bowBack, 30, 3 + (i % 2), r() * 6, 50);
  return resample(join(out1, c, out2, back), N);
});

// Линии работы родителей (синяя — мама, зелёная — папа) переплетены
// со школьными: из школы на работу, с работы снова к школе.
export const WORK_COLORS = ["#2F6BD8", "#2EA05A", "#2F6BD8", "#2EA05A", "#2F6BD8"] as const;
export const WORK_LINES: readonly Pt[][] = [0, 1, 2, 3, 4].map((i) => {
  const r = rnd(301 + i * 29);
  const w = i % 2 ? DAD_WORK : MOM_WORK;
  const a = stroke(SCHOOL, w, (i % 2 ? -1 : 1) * (70 + 60 * r()), 18, 2, r() * 6);
  const b = stroke(w, HOME, (i % 2 ? 1 : -1) * (60 + 70 * r()), 20, 2, r() * 6);
  return resample(join(a, b), N);
});

// ---------- 2. Строки недели ----------
export const ROW_Y = [270, 395, 520, 645, 770] as const;
export const ROW_X = { home: 210, school: 545, back: 880 } as const;
export const DAY_ROWS: readonly Pt[][] = ROW_Y.map((y, i) => {
  const r = rnd(501 + i * 13);
  const a = stroke([ROW_X.home, y], [ROW_X.school, y], -26, 4, 2, r() * 6, 50);
  const b = stroke([ROW_X.school, y], [ROW_X.back, y], -26, 4, 2, r() * 6, 50);
  return resample(join(a, b), N);
});

// ---------- 3. Маршрут: одна ровная петля ----------
// Верхняя полоса — утром ҮЙ → МЕКТЕП, поворот у школы, нижняя — после
// уроков МЕКТЕП → ҮЙ.
export const ROUTE = { left: 215, right: 715, top: 370, bottom: 580 } as const;
export const ROUTE_LOOP: readonly Pt[] = (() => {
  const { left, right, top, bottom } = ROUTE;
  const r = (bottom - top) / 2;
  const cy = top + r;
  const pts: Pt[] = [];
  for (let i = 0; i <= 40; i++) pts.push([left + ((right - left) * i) / 40, top]);
  for (let i = 1; i <= 20; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 20;
    pts.push([right + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  for (let i = 1; i <= 40; i++) pts.push([right - ((right - left) * i) / 40, bottom]);
  return resample(pts, N);
})();

// Ярлыки дней: внизу листа (клубок) → слева от строк (неделя).
export const TAB_BOTTOM = (i: number): Pt => [130 + i * 170, 1010];
export const TAB_ROW = (i: number): Pt => [92, ROW_Y[i]];
