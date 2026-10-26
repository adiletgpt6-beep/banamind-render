// Deterministic randomness: every grain property derives from a fixed seed,
// so any frame renders identically in any order (a Remotion requirement).

export const mulberry32 = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Stateless hash → [0,1). Used for per-grain constants by ID. */
export const hash1 = (n: number, salt = 0) => {
	let h = (n * 374761393 + salt * 668265263) | 0;
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
};

export const gaussian = (rnd: () => number) => {
	const u = Math.max(1e-9, rnd());
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
};

// --- 3D value-gradient noise (compact Perlin-style) ---------------------------
const PERM = (() => {
	const r = mulberry32(1414);
	const p = Array.from({length: 256}, (_, i) => i);
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(r() * (i + 1));
		[p[i], p[j]] = [p[j], p[i]];
	}
	return new Uint8Array([...p, ...p]);
})();
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const grad = (h: number, x: number, y: number, z: number) => {
	const k = h & 15;
	const u = k < 8 ? x : y;
	const v = k < 4 ? y : k === 12 || k === 14 ? x : z;
	return ((k & 1) === 0 ? u : -u) + ((k & 2) === 0 ? v : -v);
};

export const noise3 = (x: number, y: number, z: number) => {
	const X = Math.floor(x) & 255;
	const Y = Math.floor(y) & 255;
	const Z = Math.floor(z) & 255;
	x -= Math.floor(x);
	y -= Math.floor(y);
	z -= Math.floor(z);
	const u = fade(x);
	const v = fade(y);
	const w = fade(z);
	const A = PERM[X] + Y;
	const AA = PERM[A] + Z;
	const AB = PERM[A + 1] + Z;
	const B = PERM[X + 1] + Y;
	const BA = PERM[B] + Z;
	const BB = PERM[B + 1] + Z;
	const l = (a: number, b: number, t: number) => a + t * (b - a);
	return l(
		l(l(grad(PERM[AA], x, y, z), grad(PERM[BA], x - 1, y, z), u), l(grad(PERM[AB], x, y - 1, z), grad(PERM[BB], x - 1, y - 1, z), u), v),
		l(
			l(grad(PERM[AA + 1], x, y, z - 1), grad(PERM[BA + 1], x - 1, y, z - 1), u),
			l(grad(PERM[AB + 1], x, y - 1, z - 1), grad(PERM[BB + 1], x - 1, y - 1, z - 1), u),
			v,
		),
		w,
	);
};

export const fbm3 = (x: number, y: number, z: number, oct = 4) => {
	let s = 0;
	let a = 0.5;
	let f = 1;
	for (let i = 0; i < oct; i++) {
		s += a * noise3(x * f, y * f, z * f);
		f *= 2.03;
		a *= 0.5;
	}
	return s;
};

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smoothstep = (a: number, b: number, x: number) => {
	const t = clamp01((x - a) / (b - a));
	return t * t * (3 - 2 * t);
};
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
