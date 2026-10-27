// Small deterministic math toolkit shared by every engine. Nothing here reads the clock:
// all motion is a pure function of the frame, so Remotion renders are reproducible.

export type Vec2 = { x: number; y: number };

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = invLerp(a, b, v);
  return t * t * (3 - 2 * t);
};
export const smootherstep = (a: number, b: number, v: number) => {
  const t = invLerp(a, b, v);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
/** 0 → 1 → 0 window with soft edges: rises over [a,b], falls over [c,d]. */
export const window4 = (a: number, b: number, c: number, d: number, v: number) =>
  smoothstep(a, b, v) * (1 - smoothstep(c, d, v));

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export const v2 = (x: number, y: number): Vec2 => ({ x, y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k });
export const len = (a: Vec2) => Math.hypot(a.x, a.y);
export const lerpV = (a: Vec2, b: Vec2, t: number): Vec2 => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const rot = (a: Vec2, ang: number): Vec2 => {
  const c = Math.cos(ang), s = Math.sin(ang);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
};

/** Seeded PRNG (mulberry32) — geometry is generated once and identical on every render worker. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------- value noise (2D / 3D) ----------
const PERM = (() => {
  const r = rng(1337);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const out = new Uint8Array(512);
  for (let i = 0; i < 512; i++) out[i] = p[i & 255];
  return out;
})();
const VAL = (() => {
  const r = rng(7331);
  const v = new Float32Array(256);
  for (let i = 0; i < 256; i++) v[i] = r() * 2 - 1;
  return v;
})();
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export const noise2 = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const X = xi & 255, Y = yi & 255;
  const a = VAL[PERM[PERM[X] + Y]], b = VAL[PERM[PERM[X + 1] + Y]];
  const c = VAL[PERM[PERM[X] + Y + 1]], d = VAL[PERM[PERM[X + 1] + Y + 1]];
  const u = fade(xf), v = fade(yf);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
};

export const noise3 = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const X = xi & 255, Y = yi & 255, Z = zi & 255;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const h = (i: number, j: number, k: number) => VAL[PERM[PERM[PERM[X + i] + Y + j] + Z + k]];
  return lerp(
    lerp(lerp(h(0, 0, 0), h(1, 0, 0), u), lerp(h(0, 1, 0), h(1, 1, 0), u), v),
    lerp(lerp(h(0, 0, 1), h(1, 0, 1), u), lerp(h(0, 1, 1), h(1, 1, 1), u), v),
    w,
  );
};

export const fbm2 = (x: number, y: number, oct: number) => {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * noise2(x * f, y * f);
    n += a; a *= 0.5; f *= 2.03;
  }
  return s / n;
};

/** Monotone cubic (Fritsch–Carlson) spline: smooth velocity, no overshoot, flat on holds. */
export const monotoneSpline = (pts: [number, number][]) => {
  const n = pts.length;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const d: number[] = [], m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  // flatten ends so the film starts/ends at rest
  m[0] = 0; m[n - 1] = 0;
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
};

// ---------- gradient (Perlin) noise 3D — no lattice-aligned blocks, used for terrain ----------
const G3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1], [1, 1, 0], [0, -1, 1], [-1, 1, 0], [0, -1, -1],
];
const grad = (hsh: number, x: number, y: number, z: number) => {
  const g = G3[hsh & 15];
  return g[0] * x + g[1] * y + g[2] * z;
};
export const perlin3 = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const X = xi & 255, Y = yi & 255, Z = zi & 255;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const A = PERM[X] + Y, AA = PERM[A] + Z, AB = PERM[A + 1] + Z;
  const B = PERM[X + 1] + Y, BA = PERM[B] + Z, BB = PERM[B + 1] + Z;
  return lerp(
    lerp(lerp(grad(PERM[AA], xf, yf, zf), grad(PERM[BA], xf - 1, yf, zf), u),
      lerp(grad(PERM[AB], xf, yf - 1, zf), grad(PERM[BB], xf - 1, yf - 1, zf), u), v),
    lerp(lerp(grad(PERM[AA + 1], xf, yf, zf - 1), grad(PERM[BA + 1], xf - 1, yf, zf - 1), u),
      lerp(grad(PERM[AB + 1], xf, yf - 1, zf - 1), grad(PERM[BB + 1], xf - 1, yf - 1, zf - 1), u), v),
    w,
  );
};
