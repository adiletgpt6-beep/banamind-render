// Procedural mountain landscape: several sharp peaks shaped with ridged noise,
// a winding valley with a river of blue sand, snowy summits and rocky slopes.
// Grains are distributed with equal density per surface area (steep slopes
// receive more grains) plus a subsurface layer, so the landscape never shows
// holes but stays visibly granular when the camera flies close.
import {clamp01, fbm3, mulberry32, noise3, smoothstep} from '../utils/random';
import {allocShape, hexLinear, mixRgb, ShapePoints} from './types';

const PEAKS: [number, number, number, number][] = [
	// x, z, height, width
	[0.4, -3.6, 4.3, 2.3],
	[-3.3, -2.6, 3.2, 2.0],
	[3.7, -2.9, 3.5, 2.1],
	[-5.2, -5.6, 2.9, 2.2],
	[5.4, -6.0, 2.7, 2.2],
	[-1.7, -6.1, 3.3, 2.3],
	[2.0, -6.4, 3.0, 2.0],
	[-5.6, -0.8, 1.6, 1.7],
	[5.6, -0.5, 1.5, 1.6],
];
// Horizontal squeeze: the range is framed in a vertical 9:16 shot.
const SX = 0.7;
export const TERRAIN = {xMin: -4.7, xMax: 4.7, zMin: -7.6, zMax: 3.2};

export const riverX = (z: number) => SX * (0.85 * Math.sin(z * 0.42 + 0.6) + 0.35 * Math.sin(z * 1.1));

const ridged = (x: number, z: number) => {
	let s = 0;
	let a = 0.55;
	let f = 1;
	for (let i = 0; i < 4; i++) {
		s += a * (1 - Math.abs(noise3(x * f, 3.7, z * f)));
		f *= 2.1;
		a *= 0.5;
	}
	return s;
};

export const terrainHeight = (xw: number, z: number) => {
	const x = xw / SX;
	let h = 0;
	for (const [px, pz, ph, w] of PEAKS) {
		const d = Math.hypot(x - px, (z - pz) * 1.1) / w;
		h = Math.max(h, ph * Math.exp(-Math.pow(d, 1.35)));
	}
	const crag = ridged(x * 0.42, z * 0.42);
	h += (crag - 0.55) * 1.1 * smoothstep(0.3, 2.0, h);
	h += 0.18 * fbm3(x * 0.7, 1.3, z * 0.7, 3);
	// River valley carves through the range and runs to the viewer.
	const dv = Math.abs(xw - riverX(z)) / SX;
	h *= 0.25 + 0.75 * smoothstep(0.25, 2.2, dv);
	return Math.max(0, h) + 0.12;
};

const WATER = hexLinear(0x58bce0);
const WATER_LIGHT = hexLinear(0x8fd8ef);
const MEADOW = hexLinear(0x48a985);
const MEADOW_DRY = hexLinear(0x9aa86a);
const SAND = hexLinear(0xd9b57b);
const ROCK = hexLinear(0x8b7056);
const ROCK_GREY = hexLinear(0x7a7068);
const SNOW = hexLinear(0xf8f5ed);

export const buildMountains = (n: number, seed = 77): ShapePoints => {
	const s = allocShape(n);
	const rnd = mulberry32(seed);
	const {xMin, xMax, zMin, zMax} = TERRAIN;
	const nRiver = Math.round(n * 0.055);
	const nSub = Math.round(n * 0.17);
	const nSurf = n - nRiver - nSub;
	let k = 0;
	const e = 0.03;
	const grad = (x: number, z: number) => [
		(terrainHeight(x + e, z) - terrainHeight(x - e, z)) / (2 * e),
		(terrainHeight(x, z + e) - terrainHeight(x, z - e)) / (2 * e),
	];
	const place = (x: number, z: number, kind: 'surf' | 'sub') => {
		const h = terrainHeight(x, z);
		const [gx, gz] = grad(x, z);
		const nl = Math.hypot(gx, 1, gz);
		const slope = 1 - 1 / nl;
		const depth = kind === 'sub' ? 0.05 + rnd() * 0.12 : rnd() * 0.012;
		s.pos.set([x, h - depth, z], k * 3);
		s.up.set([-gx / nl, 1 / nl, -gz / nl], k * 3);
		const nn = fbm3(x * 0.9, 5.1, z * 0.9, 3);
		const snowLine = 2.45 + nn * 0.7;
		let c: number[];
		let paint = 0.82;
		if (h > snowLine && slope < 0.72) c = SNOW;
		else if (slope > 0.5 || h > 1.6) c = mixRgb(ROCK, ROCK_GREY, clamp01(0.5 + nn * 1.5));
		else if (h < 0.55) c = mixRgb(MEADOW, MEADOW_DRY, clamp01(0.5 + nn * 2));
		else {
			c = mixRgb(SAND, ROCK, clamp01((h - 0.55) / 1.2));
			paint = 0.35;
		}
		const dark = kind === 'sub' ? 0.6 : 1;
		s.col.set([c[0] * dark, c[1] * dark, c[2] * dark], k * 3);
		s.paint[k] = paint;
		// Base first, then slopes, then the summits.
		s.order[k] = clamp01(h / 4.4) * 0.85 + rnd() * 0.15;
		s.size[k] = kind === 'sub' ? 1.15 : 1;
		k++;
	};
	let guard = 0;
	while (k < nSurf && guard++ < n * 60) {
		const x = xMin + rnd() * (xMax - xMin);
		const z = zMin + rnd() * (zMax - zMin);
		const [gx, gz] = grad(x, z);
		const w = Math.sqrt(1 + gx * gx + gz * gz);
		if (rnd() * 3.2 < w) place(x, z, 'surf');
	}
	while (k < nSurf + nSub) place(xMin + rnd() * (xMax - xMin), zMin + rnd() * (zMax - zMin), 'sub');
	// River: a ribbon of blue sand along the valley floor.
	while (k < n) {
		const z = zMin + 1.2 + rnd() * (zMax - zMin - 1.2);
		const w = 0.16 + 0.22 * clamp01((z - zMin) / (zMax - zMin));
		const x = riverX(z) + (rnd() * 2 - 1) * w;
		const h = terrainHeight(x, z);
		s.pos.set([x, h + 0.015, z], k * 3);
		s.up.set([0, 1, 0], k * 3);
		const c = mixRgb(WATER, WATER_LIGHT, rnd() * rnd());
		s.col.set(c, k * 3);
		s.paint[k] = 0.92;
		s.order[k] = 0.2 + rnd() * 0.3;
		s.size[k] = 0.95;
		k++;
	}
	return s;
};
