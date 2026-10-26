// Earth target: continents from a Natural Earth land mask, painted sand for
// oceans, forests, deserts, ice and a floating layer of white cloud grains.
// Grains cover the surface in two layers (surface + subsurface) so the planet
// reads as solid sand from afar with no smooth shell behind it.
import {fbm3, mulberry32} from '../utils/random';
import {allocShape, hexLinear, mixRgb, ShapePoints} from './types';

export const MASK_W = 1024;
export const MASK_H = 512;

const OCEAN = hexLinear(0x58bce0);
const OCEAN_DEEP = hexLinear(0x2f86c0);
const OCEAN_SHALLOW = hexLinear(0x86d6ee);
const GREEN = hexLinear(0x48a985);
const FOREST = hexLinear(0x2f8462);
const DRY = hexLinear(0xc9a46a);
const DESERT = hexLinear(0xd9b57b);
const MOUNTAIN = hexLinear(0x8b7056);
const TUNDRA = hexLinear(0x9db39a);
const ICE = hexLinear(0xf8f5ed);
const CLOUD = hexLinear(0xfbf8f2);

export type EarthOptions = {radius: number; n: number; cloudFraction?: number; subsurfaceFraction?: number; seed?: number};

export const buildEarth = (mask: Uint8Array, opt: EarthOptions): ShapePoints => {
	const {radius: R, n} = opt;
	const s = allocShape(n);
	const rnd = mulberry32(opt.seed ?? 2024);
	const nCloud = Math.round(n * (opt.cloudFraction ?? 0.05));
	const nSub = Math.round(n * (opt.subsurfaceFraction ?? 0.24));
	const nSurf = n - nCloud - nSub;
	const land = (lat: number, lon: number) => {
		let x = Math.floor(((lon + 180) / 360) * MASK_W);
		x = ((x % MASK_W) + MASK_W) % MASK_W;
		const y = Math.min(MASK_H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MASK_H)));
		return mask[y * MASK_W + x];
	};
	const coastal = (lat: number, lon: number) => {
		let c = 0;
		for (const [a, b] of [[2, 0], [-2, 0], [0, 2.5], [0, -2.5]]) c += land(lat + a, lon + b);
		return c;
	};
	const golden = Math.PI * (3 - Math.sqrt(5));
	let k = 0;
	const put = (x: number, y: number, z: number, rad: number, kind: 'surf' | 'sub' | 'cloud', order: number) => {
		const len = Math.hypot(x, y, z);
		const nx = x / len;
		const ny = y / len;
		const nz = z / len;
		s.pos.set([nx * rad, ny * rad, nz * rad], k * 3);
		s.up.set([nx, ny, nz], k * 3);
		const lat = (Math.asin(ny) * 180) / Math.PI;
		const lon = (Math.atan2(-nz, nx) * 180) / Math.PI;
		let c: number[];
		const nn = fbm3(nx * 3.2, ny * 3.2, nz * 3.2, 4);
		if (kind === 'cloud') {
			c = CLOUD;
		} else if (land(lat, lon)) {
			const alat = Math.abs(lat);
			const desertBelt =
				(lat > 14 && lat < 33 && lon > -17 && lon < 60) || (lat < -19 && lat > -32 && lon > 117 && lon < 146) || (lat > 30 && lat < 45 && lon > 75 && lon < 110);
			if (alat > 72 || lat < -62 || (lat > 60 && lon > -60 && lon < -18)) c = ICE;
			else if (alat > 60) c = mixRgb(TUNDRA, ICE, Math.max(0, nn + 0.1));
			else if (desertBelt && nn > -0.25) c = mixRgb(DESERT, DRY, 0.5 + nn);
			else if (alat < 12) c = mixRgb(FOREST, GREEN, 0.4 + nn);
			else if (nn > 0.22) c = mixRgb(MOUNTAIN, DRY, 0.3);
			else c = mixRgb(GREEN, DRY, Math.max(0, nn * 1.4 + 0.15));
		} else {
			const coast = coastal(lat, lon);
			c = coast > 0 ? mixRgb(OCEAN, OCEAN_SHALLOW, coast / 4) : mixRgb(OCEAN, OCEAN_DEEP, Math.max(0, Math.min(1, 0.5 + nn * 1.6)));
		}
		const dark = kind === 'sub' ? 0.62 : 1;
		s.col.set([c[0] * dark, c[1] * dark, c[2] * dark], k * 3);
		s.paint[k] = kind === 'cloud' ? 0.95 : 0.84;
		s.order[k] = order;
		s.size[k] = kind === 'cloud' ? 0.9 : kind === 'sub' ? 1.15 : 1;
		k++;
	};
	for (let i = 0; i < nSurf; i++) {
		const y = 1 - (2 * (i + 0.5)) / nSurf;
		const r = Math.sqrt(1 - y * y);
		const th = golden * i + (rnd() - 0.5) * 0.9 * (2 / Math.sqrt(nSurf));
		const x = Math.cos(th) * r;
		const z = Math.sin(th) * r;
		put(x, y + (rnd() - 0.5) * (1.6 / Math.sqrt(nSurf)), z, R * (1 + (rnd() - 0.5) * 0.006), 'surf', rnd() * 0.65);
	}
	for (let i = 0; i < nSub; i++) {
		const y = rnd() * 2 - 1;
		const th = rnd() * Math.PI * 2;
		const r = Math.sqrt(1 - y * y);
		put(Math.cos(th) * r, y, Math.sin(th) * r, R * (0.955 + rnd() * 0.035), 'sub', 0.25 + rnd() * 0.55);
	}
	// Clouds: rejection-sample swirly noise bands, float slightly above the sand.
	let guard = 0;
	while (k < n && guard < n * 400) {
		guard++;
		const y = rnd() * 2 - 1;
		const th = rnd() * Math.PI * 2;
		const r = Math.sqrt(1 - y * y);
		const x = Math.cos(th) * r;
		const z = Math.sin(th) * r;
		const band = fbm3(x * 2.2 + 7, y * 4.5, z * 2.2, 4) + 0.25 * Math.sin(y * 9);
		if (band > 0.32) put(x, y, z, R * (1.014 + rnd() * 0.006), 'cloud', 0.75 + rnd() * 0.25);
	}
	return s;
};
