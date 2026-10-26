// Сцена 2 — тканая Земля.
// Земля сплетена из настоящего полотна: утки — параллели (шёлк), основа — меридианы (хлопок).
// Цвет каждой нити меняется вдоль её длины по реальной маске суши (world-atlas 1:50m),
// поэтому материки узнаваемы, а нити повторяют геометрию поверхности планеты.
import landmask from "../data/landmask.json";
import { buildPath, buildColors, Path } from "../engines/ThreadContinuityEngine";
import { weftOffset, warpOffset } from "../engines/ThreadWeavingEngine";
import { bendToSphere, offsetAlong } from "../engines/WovenSculptureEngine";
import { COL } from "../engines/palette";
import { V3, add, clamp, fbm2, mix3, rotateAxis, smoother, progress } from "../utils/math";

const DEG = Math.PI / 180;

export interface EarthSpec {
  R: number;
  NR: number; // утки-параллели
  NM: number; // основа-меридианы
  latMin: number;
  latMax: number;
  thread: number; // радиус нити
  A: number; // амплитуда переплетения
  center: V3;
  ringN: number; // точек на параллель
  merN: number; // точек на меридиан
}

export const EARTH: EarthSpec = {
  R: 1, NR: 35, NM: 48, latMin: -80 * DEG, latMax: 80 * DEG, thread: 0.024, A: 0.026,
  center: [0, 0, 0], ringN: 240, merN: 140,
};

/** Земля в большом гобелене (сцена 5): меньше и реже, та же технология. */
export const EARTH2: EarthSpec = {
  R: 0.85, NR: 23, NM: 32, latMin: -77 * DEG, latMax: 77 * DEG, thread: 0.021, A: 0.023,
  center: [-1.5, 7.25, -0.8], ringN: 150, merN: 90,
};

export const ringLat = (e: EarthSpec, i: number) => e.latMin + (i * (e.latMax - e.latMin)) / (e.NR - 1);
export const merLon = (e: EarthSpec, j: number) => -Math.PI + ((j + 0.5) * 2 * Math.PI) / e.NM;
const dLon = (e: EarthSpec) => (2 * Math.PI) / e.NM;
const dLat = (e: EarthSpec) => (e.latMax - e.latMin) / (e.NR - 1);
/** Меридианы прореживаются к полюсам, чтобы нити не сходились в одну точку. */
export const merLatMax = (e: EarthSpec, j: number) => (j % 4 === 0 ? e.latMax + 4 * DEG : j % 2 === 0 ? e.latMax - 4 * DEG : e.latMax - 16 * DEG);

// ---------- маска суши и цвет поверхности ----------
const LM = landmask as { w: number; h: number; rows: string[] };
export const isLand = (lon: number, lat: number) => {
  const x = Math.floor(((lon / DEG + 180) / 360) * LM.w) % LM.w;
  const y = clamp(Math.floor(((90 - lat / DEG) / 180) * LM.h), 0, LM.h - 1);
  return LM.rows[y].charCodeAt((x + LM.w) % LM.w) === 49;
};

export const earthColor = (lon: number, lat: number): V3 => {
  const n = fbm2(lon * 3.1, lat * 3.1, 3);
  const latD = Math.abs(lat / DEG);
  if (isLand(lon, lat)) {
    if (latD > 64 || lat / DEG < -58) return mix3(COL.milk, COL.silver, 0.25 + 0.2 * n);
    let c = mix3(COL.emeraldLight, COL.emerald, clamp(0.5 - n * 1.5));
    // засушливые пояса — тёплый оттенок, в пределах палитры
    const arid = clamp(1 - Math.abs(latD - 23) / 11) * clamp(0.5 + n);
    c = mix3(c, COL.brownLight, arid * 0.55);
    return c;
  }
  return mix3(COL.ocean, COL.oceanDeep, clamp(0.5 + n * 0.9));
};

// ---------- вращение Земли ----------
/** Угол суточного вращения (рад): старт после формирования, остановка перед расплетением. */
export const spinAngle = (f: number) => {
  // ω = 0.0062 рад/кадр с мягким разгоном 225→265 и торможением 420→465
  const w = 0.0062;
  const ramp = (a: number, b: number) => {
    // интеграл smoothstep-скорости
    const t = clamp((f - a) / (b - a));
    return (b - a) * (t * t * t - 0.5 * t * t * t * t) ;
  };
  const up = ramp(225, 265);
  const full = Math.max(0, Math.min(f, 420) - 265);
  const down = f > 420 ? (Math.min(f, 465) - 420) - ramp(420, 465) : 0;
  return w * (up + full + down);
};
/** Наклон оси 23,4° — вводится плавно, пока полотно сворачивается. */
export const tiltAngle = (f: number) => -23.4 * DEG * smoother(progress(f, 200, 250));

export const earthTransform = (e: EarthSpec, spin: number, tilt: number) => (p: V3): V3 => {
  // p задано относительно центра сферы (0,0,0)
  let q = rotateAxis(p, [0, 1, 0], spin);
  q = rotateAxis(q, [0, 0, 1], tilt);
  return add(q, e.center);
};

// ---------- формы нитей ----------
/**
 * Параллель i. k — доля изгиба полотна (0 — плоское полотно, 1 — сфера).
 * closed: при k = 1 параллель замыкается в кольцо.
 */
export const ringShape = (e: EarthSpec, i: number, k: number, xf: (p: V3) => V3, closed: boolean): Path => {
  const lat = ringLat(e, i);
  const n = e.ringN;
  const lon0 = merLon(e, 0), dl = dLon(e);
  return buildPath(closed ? n : n + 1, (_s, idx) => {
    const lon = -Math.PI + (idx * 2 * Math.PI) / n;
    const sp = bendToSphere(lon, lat, e.R, k);
    const h = weftOffset(i, lon, lon0, dl, e.A);
    return xf(offsetAlong(sp, h));
  });
};

export const merShape = (e: EarthSpec, j: number, k: number, xf: (p: V3) => V3): Path => {
  const lon = merLon(e, j);
  const lm = merLatMax(e, j);
  const lat0 = e.latMin, dla = dLat(e);
  return buildPath(e.merN, (s) => {
    const lat = -lm + s * 2 * lm;
    const sp = bendToSphere(lon, lat, e.R, k);
    const h = warpOffset(j, lat, lat0, dla, e.A);
    return xf(offsetAlong(sp, h));
  });
};

export const ringColors = (e: EarthSpec, i: number, n: number) => {
  const lat = ringLat(e, i);
  return buildColors(n, (s) => earthColor(-Math.PI + s * 2 * Math.PI, lat));
};
export const merColors = (e: EarthSpec, j: number, n: number) => {
  const lon = merLon(e, j), lm = merLatMax(e, j);
  return buildColors(n, (s) => earthColor(lon, -lm + s * 2 * lm));
};

/** Полярная «шапка» — спираль из белой шерсти поверх схождения меридианов. */
export const capShape = (e: EarthSpec, north: boolean, xf: (p: V3) => V3): Path => {
  const turns = e === EARTH ? 4.2 : 3.2;
  const rimLat = e.latMax - 3.5 * DEG;
  return buildPath(220, (s) => {
    const r = Math.sqrt(s); // равномерная длина дуги
    const lat = (Math.PI / 2 - (Math.PI / 2 - rimLat) * r) * (north ? 1 : -1);
    const lon = turns * 2 * Math.PI * r * (north ? 1 : -1);
    const sp = bendToSphere(lon, lat, e.R, 1);
    return xf(offsetAlong(sp, e.A * 1.9));
  });
};

/** Облако — петлистая нить из шерсти над поверхностью (кудрявая «вышивка»). */
export interface CloudDef { lon: number; lat: number; span: number; loops: number; amp: number }
export const CLOUDS: CloudDef[] = [
  { lon: -0.4, lat: 0.62, span: 1.1, loops: 9, amp: 0.05 },
  { lon: 0.9, lat: 0.3, span: 0.9, loops: 7, amp: 0.045 },
  { lon: 2.2, lat: -0.25, span: 1.2, loops: 9, amp: 0.05 },
  { lon: -1.7, lat: -0.5, span: 1.0, loops: 8, amp: 0.05 },
  { lon: 3.0, lat: 0.85, span: 0.8, loops: 6, amp: 0.04 },
  { lon: -2.8, lat: 0.15, span: 1.0, loops: 8, amp: 0.045 },
  { lon: 0.2, lat: -0.95, span: 1.1, loops: 8, amp: 0.05 },
  { lon: 1.6, lat: 1.0, span: 0.9, loops: 7, amp: 0.04 },
  { lon: -1.0, lat: 1.08, span: 0.9, loops: 7, amp: 0.04 },
];
export const cloudShape = (e: EarthSpec, c: CloudDef, xf: (p: V3) => V3, drift: number): Path =>
  buildPath(200, (s) => {
    const th = s * c.loops * 2 * Math.PI;
    const lon = c.lon + drift + (s - 0.5) * c.span - Math.sin(th) * c.amp * 1.3;
    const lat = c.lat + Math.cos(th) * c.amp + Math.sin(s * Math.PI) * 0.03;
    const sp = bendToSphere(lon, lat, e.R, 1);
    return xf(offsetAlong(sp, 0.075 + 0.012 * Math.sin(th)));
  });

/**
 * Окна видимости при «прорастании» полотна: область переплетения — круг радиуса r
 * в угловых координатах (lon, lat) вокруг точки (0, 0). Возвращает полуширину окна в долях длины.
 */
export const ringWindow = (e: EarthSpec, i: number, r: number) => {
  const lat = ringLat(e, i);
  if (r <= Math.abs(lat)) return 0;
  return Math.min(0.5, Math.sqrt(r * r - lat * lat) / (2 * Math.PI));
};
export const merWindow = (e: EarthSpec, j: number, r: number) => {
  const lon = merLon(e, j);
  if (r <= Math.abs(lon)) return 0;
  return Math.min(0.5, Math.sqrt(r * r - lon * lon) / (2 * merLatMax(e, j)));
};
