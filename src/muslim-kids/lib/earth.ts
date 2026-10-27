// Земля из частиц: точки сферы Фибоначчи, материки по маске Natural Earth,
// вращение с запада на восток вокруг наклонённой оси (23,4°), освещение
// параллельным солнечным светом — ровно половина шара на свету.
import { LAND_H, LAND_MASK_B64, LAND_W } from "./land-mask";

const decode = (b64: string) => {
  const bin =
    typeof atob === "function"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
const MASK = decode(LAND_MASK_B64);

export const isLand = (latDeg: number, lonDeg: number) => {
  const y = Math.min(LAND_H - 1, Math.max(0, Math.floor(90 - latDeg)));
  let x = Math.floor(lonDeg + 180) % LAND_W;
  if (x < 0) x += LAND_W;
  const i = y * LAND_W + x;
  return ((MASK[i >> 3] >> (i & 7)) & 1) === 1;
};

export type Globe = {
  lat: Float32Array;
  lon: Float32Array;
  land: Uint8Array;
  n: number;
};

// n точек равномерно по сфере (спираль Фибоначчи)
export const fibSphere = (n: number): Globe => {
  const lat = new Float32Array(n);
  const lon = new Float32Array(n);
  const land = new Uint8Array(n);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const la = Math.asin(y);
    const lo = (((i * golden) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    lat[i] = la;
    lon[i] = lo - Math.PI;
    land[i] = isLand((la * 180) / Math.PI, ((lo - Math.PI) * 180) / Math.PI)
      ? 1
      : 0;
  }
  return { lat, lon, land, n };
};

export type View = {
  cx: number;
  cy: number;
  R: number;
  spin: number; // рад, поворот вокруг оси (растёт → вращение на восток)
  tilt: number; // рад, наклон оси в плоскости экрана
  light: readonly [number, number, number]; // направление НА солнце (экранные оси, z к зрителю)
};

export type Proj = { x: number; y: number; z: number; lit: number };

// Ось y — на север, z — к зрителю, x — вправо. Поворот на восток при виде
// с севера идёт против часовой: точки ближней стороны движутся слева направо.
export const project = (lat: number, lon: number, v: View, out: Proj) => {
  const cl = Math.cos(lat);
  const a = lon + v.spin;
  const x0 = cl * Math.sin(a);
  const y0 = Math.sin(lat);
  const z = cl * Math.cos(a);
  // наклон оси: поворот в плоскости экрана
  const ct = Math.cos(v.tilt);
  const st = Math.sin(v.tilt);
  const x = x0 * ct - y0 * st;
  const y = x0 * st + y0 * ct;
  const [lx, ly, lz] = v.light;
  out.x = v.cx + x * v.R;
  out.y = v.cy - y * v.R;
  out.z = z;
  out.lit = x * lx + y * ly + z * lz;
};

export const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// единичный вектор
export const unit = (x: number, y: number, z: number) => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l] as const;
};
