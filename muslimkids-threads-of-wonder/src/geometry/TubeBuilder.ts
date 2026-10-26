// Процедурная геометрия нитей: объединённые буферы на материал (одна draw call на тип волокна).
//
// Каждая нить — настоящая трубка вдоль 3D-кривой, а не линия:
//  • сечение трёхпрядное: r(θ) = R·(1 + lobe·cos(3(θ − φ(a)))), φ растёт вдоль длины —
//    пряди закручиваются, как у настоящей нити (шаг скрутки ≈ 11R, угол ≈ 30°);
//  • рамки параллельного переноса без скручивания, для замкнутых петель — с компенсацией;
//  • кончики сужаются в точку (видимое «вытягивание» нити);
//  • нормали аналитические с учётом прядей; UV: u — вдоль длины, v — по окружности.
import type { ThreadDraw } from "../engines/types";
import { PLY_LOBE } from "../engines/palette";

export interface BucketBuffers {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
  indexCount: number;
}

const makeBucket = (vCap: number, iCap: number): BucketBuffers => ({
  positions: new Float32Array(vCap * 3),
  normals: new Float32Array(vCap * 3),
  uvs: new Float32Array(vCap * 2),
  colors: new Float32Array(vCap * 3),
  indices: new Uint32Array(iCap),
  vertexCount: 0,
  indexCount: 0,
});

const ensure = (b: BucketBuffers, addV: number, addI: number): BucketBuffers => {
  const needV = b.vertexCount + addV, needI = b.indexCount + addI;
  if (needV * 3 <= b.positions.length && needI <= b.indices.length) return b;
  const nb = makeBucket(Math.max(needV, (b.positions.length / 3) * 2), Math.max(needI, b.indices.length * 2));
  nb.positions.set(b.positions.subarray(0, b.vertexCount * 3));
  nb.normals.set(b.normals.subarray(0, b.vertexCount * 3));
  nb.uvs.set(b.uvs.subarray(0, b.vertexCount * 2));
  nb.colors.set(b.colors.subarray(0, b.vertexCount * 3));
  nb.indices.set(b.indices.subarray(0, b.indexCount));
  nb.vertexCount = b.vertexCount;
  nb.indexCount = b.indexCount;
  return nb;
};

// Рабочие массивы, переиспользуемые между нитями (без аллокаций в горячем цикле).
let S_pos = new Float32Array(0), S_col = new Float32Array(0), S_rad = new Float32Array(0), S_a = new Float32Array(0);
let S_T = new Float32Array(0), S_N = new Float32Array(0), S_B = new Float32Array(0);
const ensureScratch = (m: number) => {
  if (S_a.length >= m) return;
  const c = Math.ceil(m * 1.5);
  S_pos = new Float32Array(c * 3); S_col = new Float32Array(c * 3); S_rad = new Float32Array(c);
  S_a = new Float32Array(c); S_T = new Float32Array(c * 3); S_N = new Float32Array(c * 3); S_B = new Float32Array(c * 3);
};

export const bucketKeyOf = (d: ThreadDraw) => (d.glow !== undefined ? "hero" : d.mat);

/** Глобальный множитель детализации (превью можно рендерить грубее). */
export let LOD_SCALE = 1;
export const setLodScale = (v: number) => {
  LOD_SCALE = v;
};

export const appendThread = (bIn: BucketBuffers, d: ThreadDraw): BucketBuffers => {
  const P = d.pts;
  const n = P.length / 3;
  if (n < 2) return bIn;
  const R = d.radius;
  const closedPath = !!d.closed;
  // длина дуги исходной кривой
  const L = new Float32Array(n + 1);
  for (let i = 1; i < n; i++) {
    L[i] = L[i - 1] + Math.hypot(P[i * 3] - P[i * 3 - 3], P[i * 3 + 1] - P[i * 3 - 2], P[i * 3 + 2] - P[i * 3 - 1]);
  }
  const total = closedPath
    ? L[n - 1] + Math.hypot(P[0] - P[(n - 1) * 3], P[1] - P[(n - 1) * 3 + 1], P[2] - P[(n - 1) * 3 + 2])
    : L[n - 1];
  if (closedPath) L[n] = total;
  if (total < 1e-6) return bIn;
  let s0 = d.s0 ?? 0, s1 = d.s1 ?? 1;
  if (s1 - s0 < 1e-4) return bIn;
  const fullLoop = closedPath && s1 - s0 >= 0.9995;
  if (!closedPath) {
    s0 = Math.max(0, s0);
    s1 = Math.min(1, s1);
    if (s1 - s0 < 1e-4) return bIn;
  }
  if (fullLoop) { s0 = 0; s1 = 1; }
  const winLen = (s1 - s0) * total;
  if (winLen < R * 0.6) return bIn;
  const segK = (d.segK ?? 1.6) / LOD_SCALE;
  const m = Math.max(3, Math.min(2400, Math.ceil(winLen / (R * segK))));
  const radial = Math.max(4, Math.round((d.radial ?? 8) * Math.min(1, LOD_SCALE + 0.25)));
  ensureScratch(m + 2);

  // --- передискретизация по длине дуги ---
  const nn = closedPath ? n + 1 : n; // для замкнутой — виртуальная точка = первая
  const px = (k: number, c: number) => P[(k % n) * 3 + c];
  const cols = d.cols;
  const radii = d.radii;
  let k = 0;
  const startA = s0 * total;
  for (let i = 0; i <= m; i++) {
    let a = startA + (i / m) * winLen;
    if (closedPath) { a = a % total; if (a < 0) a += total; } else a = Math.min(Math.max(a, 0), total);
    // поиск сегмента (монотонно, но для замкнутых возможен переход через 0)
    if (k > 0 && L[k] > a) k = 0;
    while (k < nn - 2 && L[k + 1] < a) k++;
    const seg = L[k + 1] - L[k] || 1e-9;
    const t = Math.min(1, Math.max(0, (a - L[k]) / seg));
    const k1 = k + 1;
    for (let c = 0; c < 3; c++) {
      S_pos[i * 3 + c] = px(k, c) + (px(k1, c) - px(k, c)) * t;
      if (cols) S_col[i * 3 + c] = cols[(k % n) * 3 + c] + (cols[(k1 % n) * 3 + c] - cols[(k % n) * 3 + c]) * t;
    }
    S_rad[i] = radii ? radii[k % n] + (radii[k1 % n] - radii[k % n]) * t : 1;
    S_a[i] = (i / m) * winLen;
  }
  if (!cols) {
    const c = d.color ?? [1, 1, 1];
    for (let i = 0; i <= m; i++) { S_col[i * 3] = c[0]; S_col[i * 3 + 1] = c[1]; S_col[i * 3 + 2] = c[2]; }
  }

  // --- касательные ---
  for (let i = 0; i <= m; i++) {
    let i0 = i - 1, i1 = i + 1;
    if (fullLoop) { if (i0 < 0) i0 = m - 1; if (i1 > m) i1 = 1; } else { i0 = Math.max(0, i0); i1 = Math.min(m, i1); }
    let tx = S_pos[i1 * 3] - S_pos[i0 * 3], ty = S_pos[i1 * 3 + 1] - S_pos[i0 * 3 + 1], tz = S_pos[i1 * 3 + 2] - S_pos[i0 * 3 + 2];
    const l = Math.hypot(tx, ty, tz) || 1;
    tx /= l; ty /= l; tz /= l;
    S_T[i * 3] = tx; S_T[i * 3 + 1] = ty; S_T[i * 3 + 2] = tz;
  }
  // --- рамки параллельного переноса ---
  {
    const tx = S_T[0], ty = S_T[1], tz = S_T[2];
    // начальная нормаль: перпендикуляр к наименьшей компоненте
    let ax = 0, ay = 0, az = 0;
    if (Math.abs(tx) < 0.6) ax = 1; else if (Math.abs(ty) < 0.6) ay = 1; else az = 1;
    let d0 = ax * tx + ay * ty + az * tz;
    let nx = ax - d0 * tx, ny = ay - d0 * ty, nz = az - d0 * tz;
    let l = Math.hypot(nx, ny, nz) || 1;
    S_N[0] = nx / l; S_N[1] = ny / l; S_N[2] = nz / l;
    for (let i = 1; i <= m; i++) {
      const Tx = S_T[i * 3], Ty = S_T[i * 3 + 1], Tz = S_T[i * 3 + 2];
      const px0 = S_N[(i - 1) * 3], py0 = S_N[(i - 1) * 3 + 1], pz0 = S_N[(i - 1) * 3 + 2];
      d0 = px0 * Tx + py0 * Ty + pz0 * Tz;
      nx = px0 - d0 * Tx; ny = py0 - d0 * Ty; nz = pz0 - d0 * Tz;
      l = Math.hypot(nx, ny, nz);
      if (l < 1e-6) { nx = px0; ny = py0; nz = pz0; l = 1; }
      S_N[i * 3] = nx / l; S_N[i * 3 + 1] = ny / l; S_N[i * 3 + 2] = nz / l;
    }
  }
  // компенсация голономии для замкнутой петли
  let corr = 0;
  if (fullLoop) {
    const ex = S_N[m * 3], ey = S_N[m * 3 + 1], ez = S_N[m * 3 + 2];
    const fx = S_N[0], fy = S_N[1], fz = S_N[2];
    const Tx = S_T[0], Ty = S_T[1], Tz = S_T[2];
    const bx = Ty * fz - Tz * fy, by = Tz * fx - Tx * fz, bz = Tx * fy - Ty * fx;
    corr = -Math.atan2(ex * bx + ey * by + ez * bz, ex * fx + ey * fy + ez * fz);
  }
  for (let i = 0; i <= m; i++) {
    const Tx = S_T[i * 3], Ty = S_T[i * 3 + 1], Tz = S_T[i * 3 + 2];
    let Nx = S_N[i * 3], Ny = S_N[i * 3 + 1], Nz = S_N[i * 3 + 2];
    if (corr !== 0) {
      // поворот N вокруг T на corr·(i/m)
      const ang = corr * (i / m), c = Math.cos(ang), s = Math.sin(ang);
      const bx = Ty * Nz - Tz * Ny, by = Tz * Nx - Tx * Nz, bz = Tx * Ny - Ty * Nx;
      Nx = Nx * c + bx * s; Ny = Ny * c + by * s; Nz = Nz * c + bz * s;
      S_N[i * 3] = Nx; S_N[i * 3 + 1] = Ny; S_N[i * 3 + 2] = Nz;
    }
    S_B[i * 3] = Ty * Nz - Tz * Ny; S_B[i * 3 + 1] = Tz * Nx - Tx * Nz; S_B[i * 3 + 2] = Tx * Ny - Ty * Nx;
  }

  // --- вершины ---
  const lobe = PLY_LOBE[d.mat];
  let pitch = 11 * R;
  if (fullLoop) pitch = winLen / Math.max(1, Math.round(winLen / pitch));
  const taper = closedPath && fullLoop ? 0 : 2.6 * R;
  const ring = radial + 1;
  const b = ensure(bIn, (m + 1) * ring, m * radial * 6);
  const base = b.vertexCount;
  let vp = base * 3, vu = base * 2;
  const uScale = 1 / (2 * Math.PI * R);
  for (let i = 0; i <= m; i++) {
    const a = S_a[i];
    let sc = S_rad[i];
    if (taper > 0) {
      const e0 = Math.min(1, a / taper), e1 = Math.min(1, (winLen - a) / taper);
      const e = Math.min(e0, e1);
      sc *= e <= 0 ? 0 : Math.sqrt(e) * (0.35 + 0.65 * e);
    }
    const phi = (2 * Math.PI * (a + startA)) / pitch;
    const cx = S_pos[i * 3], cy = S_pos[i * 3 + 1], cz = S_pos[i * 3 + 2];
    const Nx = S_N[i * 3], Ny = S_N[i * 3 + 1], Nz = S_N[i * 3 + 2];
    const Bx = S_B[i * 3], By = S_B[i * 3 + 1], Bz = S_B[i * 3 + 2];
    const cr = S_col[i * 3], cg = S_col[i * 3 + 1], cb = S_col[i * 3 + 2];
    const u = (a + startA) * uScale;
    for (let j = 0; j <= radial; j++) {
      const th = (j / radial) * Math.PI * 2;
      const ct = Math.cos(th), st = Math.sin(th);
      const lc = Math.cos(3 * (th - phi)), ls = Math.sin(3 * (th - phi));
      const rr = R * sc * (1 + lobe * lc);
      // e_r и e_θ
      const erx = ct * Nx + st * Bx, ery = ct * Ny + st * By, erz = ct * Nz + st * Bz;
      const etx = -st * Nx + ct * Bx, ety = -st * Ny + ct * By, etz = -st * Nz + ct * Bz;
      b.positions[vp] = cx + erx * rr;
      b.positions[vp + 1] = cy + ery * rr;
      b.positions[vp + 2] = cz + erz * rr;
      const kk = 3 * lobe * ls;
      let nx = erx * (1 + lobe * lc) + etx * kk, ny = ery * (1 + lobe * lc) + ety * kk, nz = erz * (1 + lobe * lc) + etz * kk;
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      b.normals[vp] = nx; b.normals[vp + 1] = ny; b.normals[vp + 2] = nz;
      b.colors[vp] = cr; b.colors[vp + 1] = cg; b.colors[vp + 2] = cb;
      b.uvs[vu] = u; b.uvs[vu + 1] = j / radial;
      vp += 3; vu += 2;
    }
  }
  let ip = b.indexCount;
  for (let i = 0; i < m; i++) {
    const r0 = base + i * ring, r1 = r0 + ring;
    for (let j = 0; j < radial; j++) {
      const a0 = r0 + j, a1 = r0 + j + 1, b0 = r1 + j, b1 = r1 + j + 1;
      // обход против часовой снаружи трубки: нормаль грани = T × e_θ … направлена наружу
      b.indices[ip++] = a0; b.indices[ip++] = a1; b.indices[ip++] = b0;
      b.indices[ip++] = a1; b.indices[ip++] = b1; b.indices[ip++] = b0;
    }
  }
  b.vertexCount += (m + 1) * ring;
  b.indexCount = ip;
  return b;
};

const pool = new Map<string, BucketBuffers>();

/** Собрать все нити кадра в буферы по материалам. */
export const buildBuckets = (threads: ThreadDraw[]): Map<string, BucketBuffers> => {
  for (const b of pool.values()) { b.vertexCount = 0; b.indexCount = 0; }
  for (const d of threads) {
    const key = bucketKeyOf(d);
    let b = pool.get(key) ?? makeBucket(65536, 65536 * 6);
    b = appendThread(b, d);
    pool.set(key, b);
  }
  return pool;
};
