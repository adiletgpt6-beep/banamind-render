// Условная карта Бишкека для BG-005: прямоугольная сетка улиц (как в центре
// города), горы Ала-Тоо на горизонте, канал и парки. Без названий улиц и
// адресов — только «Жумуш», «Мектеп», «Үй» и районы «Бир район» / «Башка район».
// Мировые координаты плоскости карты: 1400 × 2000, улицы через 120.
// Без зависимостей от Remotion.

export type Pt = { readonly x: number; readonly y: number };

export const WORLD = { w: 1400, h: 2000, step: 120, off: 40 } as const;

// перекрёсток сетки (i, j) → мировые координаты
const g = (i: number, j: number): Pt => ({
  x: WORLD.off + i * WORLD.step,
  y: WORLD.off + j * WORLD.step,
});

export const P = {
  work: g(8, 4), // офис мамы — «Бир район»
  school: g(2, 11), // школа — «Башка район»
  home: g(6, 12),
  // соседние дома совместимой группы (условные)
  h2: g(3, 14),
  h3: g(1, 13),
  h4: g(4, 12),
} as const;

// Районы (мягкая заливка с пунктиром)
export const DISTRICTS = {
  a: { x: g(6, 2).x - 60, y: g(6, 2).y - 60, w: 480, h: 420 },
  b: { x: g(0, 10).x - 60, y: g(0, 10).y - 60, w: 860, h: 600 },
} as const;

// Хук: извилистая дорога «Жумуш» → «Мектеп»
export const ROUTE_HOOK: readonly Pt[] = [
  P.work,
  g(8, 6),
  g(6, 6),
  g(6, 8),
  g(4, 8),
  g(4, 10),
  g(2, 10),
  P.school,
];

// Крюк мамы: жумуш → мектеп → үй → снова жумуш
export const ROUTE_DETOUR_1: readonly Pt[] = ROUTE_HOOK;
export const ROUTE_DETOUR_2: readonly Pt[] = [P.school, g(2, 12), P.home];
export const ROUTE_DETOUR_3: readonly Pt[] = [
  P.home,
  g(9, 12),
  g(9, 4),
  P.work,
];

// Отдельный школьный круг ҮЙ → МЕКТЕП → ҮЙ (BalaGo)
export const ROUTE_LOOP: readonly Pt[] = [
  P.home,
  g(6, 11),
  P.school,
  g(2, 12),
  P.home,
];

// Круг совместимой группы: үй → соседи → мектеп → (обратно тем же кругом)
export const ROUTE_GROUP: readonly Pt[] = [
  P.home,
  P.h4,
  g(4, 14),
  P.h2,
  g(1, 14),
  P.h3,
  g(1, 11),
  P.school,
  g(2, 12),
  P.home,
];

// ---------- Ломаная: длина, точка по длине, направление ----------
export const lengthOf = (pts: readonly Pt[]) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++)
    L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
};

// точка на доле u (0…1) длины и угол движения (градусы)
export const pointAt = (
  pts: readonly Pt[],
  u: number,
): { x: number; y: number; angle: number } => {
  const L = lengthOf(pts);
  let d = Math.max(0, Math.min(1, u)) * L;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const s = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= s || i === pts.length - 1) {
      const k = s ? Math.min(1, d / s) : 0;
      return {
        x: a.x + (b.x - a.x) * k,
        y: a.y + (b.y - a.y) * k,
        angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      };
    }
    d -= s;
  }
  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
};

// плавный угол машины на поворотах: среднее направление вокруг точки
export const headingAt = (pts: readonly Pt[], u: number, win = 0.025) => {
  const a = pointAt(pts, Math.max(0, u - win));
  const b = pointAt(pts, Math.min(1, u + win));
  if (Math.hypot(b.x - a.x, b.y - a.y) < 0.5) return pointAt(pts, u).angle;
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
};

export const pathD = (pts: readonly Pt[]) =>
  pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");

// ---------- Камера: наклонённая плоскость карты (как CSS perspective + rotateX) ----------
export type Cam = {
  readonly cx: number;
  readonly cy: number;
  readonly zoom: number;
  readonly tilt: number;
};
export const PERSPECTIVE = 1700;
export const SCREEN = { cx: 540, cy: 1000 } as const;

// мировая точка → экран (та же математика, что у CSS-трансформа плоскости)
export const project = (cam: Cam, p: Pt) => {
  const px = (p.x - cam.cx) * cam.zoom;
  const py = (p.y - cam.cy) * cam.zoom;
  const th = (cam.tilt * Math.PI) / 180;
  const z = py * Math.sin(th);
  const s = PERSPECTIVE / (PERSPECTIVE - z);
  return { x: SCREEN.cx + px * s, y: SCREEN.cy + py * Math.cos(th) * s, s };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

// ключи камеры [время, камера] → камера в момент t (плавно между ключами)
export const camAt = (
  keys: readonly (readonly [number, Cam])[],
  t: number,
): Cam => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, c1] = keys[i];
    const [t0, c0] = keys[i - 1];
    if (t <= t1) {
      const u = smooth((t - t0) / Math.max(1e-6, t1 - t0));
      return {
        cx: lerp(c0.cx, c1.cx, u),
        cy: lerp(c0.cy, c1.cy, u),
        zoom: lerp(c0.zoom, c1.zoom, u),
        tilt: lerp(c0.tilt, c1.tilt, u),
      };
    }
  }
  return keys[keys.length - 1][1];
};
