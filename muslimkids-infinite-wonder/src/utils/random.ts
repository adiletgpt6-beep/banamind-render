// Детерминированная случайность: фиксированный seed — одинаковый кадр
// при любом порядке рендера и любом числе потоков.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(ix: number, iy: number, seed: number) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1013904223);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function vnoise2(x: number, y: number, seed = 0) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

export function fbm2(x: number, y: number, octaves = 5, seed = 0) {
  let s = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    s += amp * vnoise2(x, y, seed + o * 17);
    norm += amp;
    x = x * 2.03 + 3.1;
    y = y * 2.03 - 1.7;
    amp *= 0.5;
  }
  return s / norm;
}

/** Хребтовый шум: острые гребни для гор. */
export function ridged2(x: number, y: number, octaves = 6, seed = 0) {
  let s = 0;
  let amp = 0.5;
  let norm = 0;
  let w = 1;
  for (let o = 0; o < octaves; o++) {
    let n = 1 - Math.abs(vnoise2(x, y, seed + o * 31) * 2 - 1);
    n *= n * w;
    w = Math.min(1, n * 2);
    s += amp * n;
    norm += amp;
    x = x * 2.1 + 5.3;
    y = y * 2.1 + 1.9;
    amp *= 0.5;
  }
  return s / norm;
}
