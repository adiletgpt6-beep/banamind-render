// EarthRenderer — a small CPU "pixel shader" for the planet.
// Ray-casts an orthographic sphere per screen pixel, samples equirectangular textures
// (generated once from geo outlines + noise), lights it with ONE fixed sun direction
// (day/night is caused only by rotation), adds ocean glint, clouds, city lights and an
// atmosphere rim. When the camera dives in, procedural terrain octaves are added with
// level-of-detail (more octaves the closer we are), so mountains and the forest belt
// emerge continuously out of the planet instead of switching pictures.
import { DESERT, DESTINATION, LAND, MOUNTAINS, WATER } from "../content/geo";
import { clamp, noise3, perlin3, smoothstep } from "./math";

/** Sun direction in view space (x right, y up, z toward viewer). Fixed for the whole film. */
export const SUN = (() => {
  const v = [-0.86, 0.3, 0.3];
  const l = Math.hypot(v[0], v[1], v[2]);
  return v.map((c) => c / l) as [number, number, number];
})();

const TW = 2048, TH = 1024; // surface texture
const CW = 1024, CH = 512; // cloud texture

type Tex = {
  color: Float32Array; // rgb 0..1
  land: Float32Array;
  mtn: Float32Array;
  city: Float32Array;
  shelf: Float32Array;
  cloud: Float32Array;
};
let TEX: Tex | null = null;

const rasterise = (polys: [number, number][][], blur: number, base?: HTMLCanvasElement, erase?: [number, number][][]) => {
  const c = document.createElement("canvas");
  c.width = TW; c.height = TH;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.fillStyle = "#000"; g.fillRect(0, 0, TW, TH);
  if (blur) g.filter = `blur(${blur}px)`;
  if (base) g.drawImage(base, 0, 0);
  g.fillStyle = "#fff";
  const path = (p: [number, number][]) => {
    g.beginPath();
    p.forEach(([lo, la], i) => {
      const x = ((lo + 180) / 360) * TW, y = ((90 - la) / 180) * TH;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    });
    g.closePath();
  };
  polys.forEach((p) => { path(p); g.fill(); });
  if (erase) { g.fillStyle = "#000"; erase.forEach((p) => { path(p); g.fill(); }); }
  const d = g.getImageData(0, 0, TW, TH).data;
  const out = new Float32Array(TW * TH);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
  return { out, canvas: c };
};

const mix3 = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

const OCEAN_DEEP = hex("#0b2f5c");
const OCEAN_SHELF = hex("#1f6f95");
const FOREST_TROP = hex("#2e7046");
const GREEN_TEMP = hex("#5b9a5a");
const BOREAL = hex("#3d6a4c");
const TUNDRA = hex("#8f9c7c");
const SAND = hex("#d8b57c");
const ROCK = hex("#8d7d69");
const ICE = hex("#eef3f6");
const NIGHT = hex("#06101f");
const CITY = hex("#f4c66a");

export const getTextures = (): Tex => {
  if (TEX) return TEX;
  const landR = rasterise(LAND, 0, undefined, WATER);
  const land = rasterise(LAND, 1.2, undefined, WATER).out;
  const shelf = rasterise([], 14, landR.canvas).out;
  const mtn = rasterise(MOUNTAINS, 7).out;
  const desert = rasterise(DESERT, 12).out;
  const color = new Float32Array(TW * TH * 3);
  const city = new Float32Array(TW * TH);
  for (let y = 0; y < TH; y++) {
    const lat = 90 - ((y + 0.5) / TH) * 180;
    const al = Math.abs(lat);
    const cl = Math.cos((lat * Math.PI) / 180), sl = Math.sin((lat * Math.PI) / 180);
    for (let x = 0; x < TW; x++) {
      const i = y * TW + x;
      const lon = ((x + 0.5) / TW) * 360 - 180;
      const lr = (lon * Math.PI) / 180;
      const px = cl * Math.sin(lr), py = sl, pz = cl * Math.cos(lr);
      const n1 = noise3(px * 9, py * 9, pz * 9) * 0.6 + noise3(px * 23, py * 23, pz * 23) * 0.4;
      // biome by latitude
      let c = al < 18 ? mix3(FOREST_TROP, GREEN_TEMP, al / 18)
        : al < 50 ? mix3(GREEN_TEMP, BOREAL, smoothstep(38, 50, al))
        : al < 66 ? mix3(BOREAL, TUNDRA, smoothstep(55, 66, al)) : mix3(TUNDRA, ICE, smoothstep(64, 72, al));
      c = mix3(c, SAND, clamp(desert[i] * 1.15 + n1 * 0.15));
      c = mix3(c, ROCK, clamp(mtn[i] * 0.85));
      c = mix3(c, ICE, clamp((mtn[i] - 0.55) * 1.6 + n1 * 0.3) * (al > 25 ? 1 : 0.4));
      const v = 1 + n1 * 0.12;
      const ocean = mix3(OCEAN_DEEP, OCEAN_SHELF, shelf[i] * 0.55 + n1 * 0.04);
      const l = land[i];
      color[i * 3] = ocean[0] + (c[0] * v - ocean[0]) * l;
      color[i * 3 + 1] = ocean[1] + (c[1] * v - ocean[1]) * l;
      color[i * 3 + 2] = ocean[2] + (c[2] * v - ocean[2]) * l;
      // city lights: clustered noise on habitable land
      const hab = l * (1 - desert[i] * 0.8) * (1 - mtn[i] * 0.7) * (al < 62 ? 1 : 0) * (1 - smoothstep(0, 1, shelf[i] < 0.95 ? 0 : 0));
      const cn = noise3(px * 70, py * 70, pz * 70) * 0.6 + noise3(px * 160, py * 160, pz * 160) * 0.4;
      city[i] = hab * smoothstep(0.32, 0.62, cn) * (0.55 + 0.45 * shelf[i]);
    }
  }
  const cloud = new Float32Array(CW * CH);
  for (let y = 0; y < CH; y++) {
    const lat = 90 - ((y + 0.5) / CH) * 180;
    const cl = Math.cos((lat * Math.PI) / 180), sl = Math.sin((lat * Math.PI) / 180);
    const band = 0.75 + 0.25 * Math.cos((lat * Math.PI) / 30); // mild latitude banding
    for (let x = 0; x < CW; x++) {
      const lr = (((x + 0.5) / CW) * 360 - 180) * (Math.PI / 180);
      const px = cl * Math.sin(lr), py = sl, pz = cl * Math.cos(lr);
      // domain-warped fbm → soft swirls
      const wx = noise3(px * 2.1 + 5, py * 2.1, pz * 2.1) * 0.6;
      let s = 0, a = 0.5, f = 3;
      for (let o = 0; o < 6; o++) {
        s += a * noise3(px * f + wx, py * f + wx * 0.7, pz * f - wx);
        a *= 0.5; f *= 2.1;
      }
      cloud[y * CW + x] = smoothstep(0.02, 0.42, s * band) * 0.92;
    }
  }
  TEX = { color, land, mtn, city, shelf, cloud };
  return TEX;
};

const DEG = Math.PI / 180;

/** Earth-frame unit vector for lon/lat */
export const lonLatToVec = (lon: number, lat: number) => {
  const cl = Math.cos(lat * DEG);
  return [cl * Math.sin(lon * DEG), Math.sin(lat * DEG), cl * Math.cos(lon * DEG)];
};

/** Projects a lon/lat point into view space for a globe looking at (lonC, latC). */
export const projectLonLat = (lon: number, lat: number, lonC: number, latC: number) => {
  const [x, y, z] = lonLatToVec(lon, lat);
  // inverse of: n_earth = Ry(lonC) * Rx(-latC) * n_view
  const cb = Math.cos(lonC * DEG), sb = Math.sin(lonC * DEG);
  const x1 = cb * x - sb * z, z1 = sb * x + cb * z;
  const ca = Math.cos(latC * DEG), sa = Math.sin(latC * DEG);
  // Rx(latC)
  const y2 = ca * y - sa * z1, z2 = sa * y + ca * z1;
  return { x: x1, y: y2, z: z2 }; // y up
};

export type EarthParams = {
  R: number; // radius in screen px
  gx: number; gy: number; // globe centre on screen
  lonC: number; latC: number;
  cloudLon: number; // cloud layer drift (degrees)
  reveal: number; // 0..1 radial fill-in used by the opening
  J: number; // journey depth (controls terrain LOD and haze)
};

const sample = (tex: Float32Array, w: number, h: number, u: number, v: number) => {
  // bilinear, wraps horizontally
  const x = u * w - 0.5, y = v * h - 0.5;
  let x0 = Math.floor(x), y0 = Math.floor(y);
  let fx = x - x0, fy = y - y0;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  if (y0 < 0) y0 = 0; if (y0 > h - 2) y0 = h - 2;
  x0 = ((x0 % w) + w) % w; const x1 = (x0 + 1) % w;
  const r0 = y0 * w, r1 = r0 + w;
  return (tex[r0 + x0] * (1 - fx) + tex[r0 + x1] * fx) * (1 - fy) + (tex[r1 + x0] * (1 - fx) + tex[r1 + x1] * fx) * fy;
};
const sampleColor = (u: number, v: number, out: number[]) => {
  const t = TEX!.color;
  const x = u * TW - 0.5, y = v * TH - 0.5;
  let x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  if (y0 < 0) y0 = 0; if (y0 > TH - 2) y0 = TH - 2;
  x0 = ((x0 % TW) + TW) % TW; const x1 = (x0 + 1) % TW;
  const a = (y0 * TW + x0) * 3, b = (y0 * TW + x1) * 3, c = ((y0 + 1) * TW + x0) * 3, d = ((y0 + 1) * TW + x1) * 3;
  for (let k = 0; k < 3; k++) out[k] = (t[a + k] * (1 - fx) + t[b + k] * fx) * (1 - fy) + (t[c + k] * (1 - fx) + t[d + k] * fx) * fy;
};

let hBuf = new Float32Array(0);
let mBuf = new Float32Array(0);
let ex = new Float64Array(0);
let nBuf = new Float32Array(0);

const DEST = lonLatToVec(DESTINATION.lon, DESTINATION.lat);

/** Render the globe into an RGBA buffer of size w×h that maps onto the 1080×1920 frame. */
export const renderEarth = (img: ImageData, p: EarthParams) => {
  const T = getTextures();
  const w = img.width, h = img.height, data = img.data;
  const sc = w / 1080;
  const R = p.R * sc, gx = p.gx * sc, gy = p.gy * sc;
  const cb = Math.cos(p.lonC * DEG), sb = Math.sin(p.lonC * DEG);
  const ca = Math.cos(p.latC * DEG), sa = Math.sin(p.latC * DEG);
  const [Sx, Sy, Sz] = SUN;
  // half vector for glint (viewer = +z)
  const hl = Math.hypot(Sx, Sy, Sz + 1), Hx = Sx / hl, Hy = Sy / hl, Hz = (Sz + 1) / hl;
  const J = p.J;
  const terrain = smoothstep(1.6, 3.2, J); // amount of procedural relief
  const cloudFade = 1 - smoothstep(2.6, 4.6, J);
  const haze = smoothstep(1.4, 3.0, J) * (1 - smoothstep(6.5, 9.0, J)) * 0.32;
  const f0 = 18;
  // LOD: octaves whose cells are at least ~1.5 px on screen
  const Rpx = p.R; // in 1080-space px, independent of buffer scale
  const maxOct = terrain > 0 ? Math.max(1, Math.min(16, Math.floor(Math.log2(Rpx / (f0 * 1.5))))) : 0;
  const amp = 0.012; // relief amplitude (radians) — slopes stay scale-invariant
  const cloudShift = p.cloudLon / 360;
  const col = [0, 0, 0];
  const needH = maxOct > 0;
  if (needH && hBuf.length !== w * h) { hBuf = new Float32Array(w * h); mBuf = new Float32Array(w * h); nBuf = new Float32Array(w * h); }
  if (ex.length !== w * h * 3) ex = new Float64Array(w * h * 3); // earth-frame vectors
  const lift = 1 / R;
  // ---- pass 1: geometry + height ----
  for (let y = 0; y < h; y++) {
    const dy = (y + 0.5 - gy) * lift;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const dx = (x + 0.5 - gx) * lift;
      const d2 = dx * dx + dy * dy;
      if (d2 >= 1) { if (needH) hBuf[i] = 0; continue; }
      const nz = Math.sqrt(1 - d2), nx = dx, ny = -dy;
      // view → earth: Rx(-latC) then Ry(lonC)
      const y1 = ca * ny + sa * nz, z1 = -sa * ny + ca * nz;
      const X = cb * nx + sb * z1, Z = -sb * nx + cb * z1, Y = y1;
      ex[i * 3] = X; ex[i * 3 + 1] = Y; ex[i * 3 + 2] = Z;
      if (needH) {
        const u = Math.atan2(X, Z) / (2 * Math.PI) + 0.5, v = Math.acos(Math.max(-1, Math.min(1, Y))) / Math.PI;
        // destination: high Tian Shan ridges around a forested valley belt
        const ddx = X - DEST[0], ddy = Y - DEST[1], ddz = Z - DEST[2];
        const dd = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);
        const region = 1 - smoothstep(0.03, 0.09, dd);
        const m = Math.max(sample(T.mtn, TW, TH, u, v), region * 0.95);
        const near = 1 - smoothstep(0.0005, 0.0035, dd);
        nBuf[i] = region;
        let s = 0, a = 1, f = f0, nrm = 0;
        let qx = X, qy = Y, qz = Z;
        for (let o = 0; o < maxOct; o++) {
          const r = 1 - Math.abs(perlin3(qx * f + 3.1, qy * f - 1.7, qz * f + 0.5) * 1.4);
          s += a * r * r; nrm += a; a *= 0.5; f *= 2;
          // rotate the domain between octaves (breaks lattice alignment)
          const tx = 0.8 * qx - 0.6 * qz, tz = 0.6 * qx + 0.8 * qz;
          qx = tx; qz = 0.8 * tz + 0.6 * qy; qy = -0.6 * tz + 0.8 * qy;
        }
        let hh = s / nrm;
        const base = 0.15 + m * 0.85;
        hh = base * (0.2 + 1.0 * hh);
        hh = hh * (1 - near) + (0.36 + (hh - 0.36) * 0.25) * near;
        hBuf[i] = hh;
        mBuf[i] = Math.max(m, near * 0.6);
      }
    }
  }
  // ---- pass 2: shading ----
  for (let y = 0; y < h; y++) {
    const dy = (y + 0.5 - gy) * lift;
    for (let x = 0; x < w; x++) {
      const i = y * w + x, o = i * 4;
      const dx = (x + 0.5 - gx) * lift;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2);
      if (d2 >= 1) {
        // atmosphere halo outside the disc
        const t = (d - 1) * R;
        const lightSide = clamp(0.5 + 0.5 * ((dx * Sx - dy * Sy) / d));
        const g = Math.exp(-t / (R * 0.045 + 6)) * (0.55 * lightSide + 0.08) * p.reveal;
        data[o] = 120; data[o + 1] = 210; data[o + 2] = 235; data[o + 3] = clamp(g) * 255;
        continue;
      }
      const nz = Math.sqrt(1 - d2), nx = dx, ny = -dy;
      const X = ex[i * 3], Y = ex[i * 3 + 1], Z = ex[i * 3 + 2];
      const u = Math.atan2(X, Z) / (2 * Math.PI) + 0.5, v = Math.acos(Math.max(-1, Math.min(1, Y))) / Math.PI;
      sampleColor(u, v, col);
      const land = needH ? Math.max(sample(T.land, TW, TH, u, v), nBuf[i]) : sample(T.land, TW, TH, u, v);
      let lam = nx * Sx + ny * Sy + nz * Sz;
      let r = col[0], g = col[1], b = col[2];
      if (needH && land > 0.05) {
        // slope from neighbours (scale-invariant): Δh / Δangle
        const hc = hBuf[i];
        const hxp = x + 1 < w ? hBuf[i + 1] : hc, hxm = x > 0 ? hBuf[i - 1] : hc;
        const hyp = y + 1 < h ? hBuf[i + w] : hc, hym = y > 0 ? hBuf[i - w] : hc;
        const k = (R / 2) * amp * 17;
        const sx = (hxp - hxm) * k, sy = (hym - hyp) * k; // y up
        // perturbed normal (tangent approx in view space)
        let pnx = nx - sx * terrain, pny = ny - sy * terrain, pnz = nz;
        const pl = Math.hypot(pnx, pny, pnz); pnx /= pl; pny /= pl; pnz /= pl;
        lam = lam * 0.45 + (pnx * Sx + pny * Sy + pnz * Sz) * 0.55;
        // altitude colouring
        const m = mBuf[i];
        const hh = hc;
        const fr = perlin3(X * 4200, Y * 4200, Z * 4200) * 0.8 + perlin3(Z * 9000, X * 9000, Y * 9000) * 0.6;
        let tr = 0.48, tg = 0.62, tb = 0.36; // valley meadow
        const forest = smoothstep(0.18, 0.3, hh) * (1 - smoothstep(0.42, 0.5, hh));
        const crown = 0.75 + 0.45 * fr * smoothstep(5.5, 8.5, J);
        tr = tr + (0.17 * crown - tr) * forest; tg = tg + (0.4 * crown - tg) * forest; tb = tb + (0.25 * crown - tb) * forest;
        const alp = smoothstep(0.44, 0.52, hh) * (1 - smoothstep(0.56, 0.62, hh));
        tr += (0.55 - tr) * alp; tg += (0.6 - tg) * alp; tb += (0.4 - tb) * alp;
        const rock = smoothstep(0.55, 0.62, hh);
        tr += (0.55 - tr) * rock; tg += (0.5 - tg) * rock; tb += (0.45 - tb) * rock;
        const snow = smoothstep(0.62, 0.7, hh + fr * 0.02);
        tr += (0.95 - tr) * snow; tg += (0.97 - tg) * snow; tb += (0.99 - tb) * snow;
        const tm = terrain * Math.max(clamp(m * 1.6) * land, nBuf[i]);
        r += (tr - r) * tm; g += (tg - g) * tm; b += (tb - b) * tm;
      }
      const day = smoothstep(-0.1, 0.16, lam);
      const diff = 0.28 + 0.9 * Math.max(0, lam);
      r *= diff; g *= diff; b *= diff;
      // ocean glint
      const spec = Math.pow(Math.max(0, nx * Hx + ny * Hy + nz * Hz), 70) * 0.75 * (1 - land) * day;
      r += spec * 0.95; g += spec * 0.9; b += spec * 0.8;
      // clouds
      const cd = cloudFade > 0 ? sample(T.cloud, CW, CH, (u + cloudShift) % 1, v) * cloudFade : 0;
      const cl = 0.25 + 0.85 * Math.max(0, lam);
      r += (0.97 * cl - r) * cd; g += (0.98 * cl - g) * cd; b += (1.0 * cl - b) * cd;
      // night side + city lights
      const cityL = sample(T.city, TW, TH, u, v) * (1 - cd * 0.8) * (1 - day) * (1 - smoothstep(2, 4, J));
      r = r * day + (NIGHT[0] + CITY[0] * cityL * 1.1) * (1 - day);
      g = g * day + (NIGHT[1] + CITY[1] * cityL * 0.95) * (1 - day);
      b = b * day + (NIGHT[2] + CITY[2] * cityL * 0.6) * (1 - day);
      // atmosphere rim (fresnel), stronger on the lit side
      const rim = Math.pow(1 - nz, 2.6) * (1 - smoothstep(2.0, 3.5, J));
      const rl = clamp(0.15 + 0.85 * smoothstep(-0.3, 0.4, lam));
      r += (0.45 - r) * rim * 0.85 * rl; g += (0.82 - g) * rim * 0.85 * rl; b += (0.95 - b) * rim * 0.85 * rl;
      // aerial haze while descending
      r += (0.66 - r) * haze; g += (0.85 - g) * haze; b += (0.95 - b) * haze;
      // edge antialias + opening reveal
      const edge = clamp((1 - d) * R * 1.2);
      const rev = p.reveal >= 1 ? 1 : smoothstep(d - 0.12, d, p.reveal * 1.12);
      data[o] = clamp(r) * 255; data[o + 1] = clamp(g) * 255; data[o + 2] = clamp(b) * 255;
      data[o + 3] = edge * rev * 255;
    }
  }
};
