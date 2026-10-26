// Starry sky built from sand: a dome of grains with a Milky-Way-like band,
// a crescent moon of pale sand and a few larger "star" grains. Only the sky
// grains get a soft self-light so they read as stars while keeping their
// faceted grain geometry. This is an artistic image, not a model of space.
import * as THREE from 'three';
import {fbm3, gaussian, mulberry32} from '../utils/random';
import {allocShape, hexLinear, mixRgb, ShapePoints} from './types';

const STAR = [hexLinear(0xf8f5ed), hexLinear(0xf0e0c4), hexLinear(0xe8c88c), hexLinear(0xbfe3f2), hexLinear(0x9fd3ea)];
const MOON = [hexLinear(0xf0e0c4), hexLinear(0xf8f5ed), hexLinear(0xe8c88c)];

export type CosmosOptions = {n: number; radius: number; view: THREE.Vector3; spread: number; sizeScale: number; seed?: number; moon?: boolean};

export const buildCosmos = (opt: CosmosOptions): ShapePoints => {
	const {n, radius: R, spread} = opt;
	const s = allocShape(n);
	const rnd = mulberry32(opt.seed ?? 99);
	const view = opt.view.clone().normalize();
	// Orthonormal frame around the viewing direction.
	const right = new THREE.Vector3(1, 0, 0).cross(view).normalize().negate();
	if (right.lengthSq() < 0.1) right.set(1, 0, 0);
	const upv = new THREE.Vector3().crossVectors(right, view).normalize();
	const dir = (a: number, b: number) =>
		view.clone().multiplyScalar(Math.cos(Math.hypot(a, b))).add(right.clone().multiplyScalar(Math.sin(a))).add(upv.clone().multiplyScalar(Math.sin(b))).normalize();
	const nMoon = opt.moon === false ? 0 : Math.round(n * 0.06);
	const nBand = Math.round(n * 0.46);
	const nAccent = Math.round(n * 0.004);
	let k = 0;
	const put = (d: THREE.Vector3, size: number, col: number[], glow: number, order: number) => {
		const r = R * (0.92 + rnd() * 0.16);
		s.pos.set([d.x * r, d.y * r, d.z * r], k * 3);
		s.up.set([-d.x, -d.y, -d.z], k * 3);
		s.col.set(col, k * 3);
		s.paint[k] = 0.9;
		s.size[k] = size;
		s.glow[k] = glow;
		s.order[k] = order;
		k++;
	};
	const sizeScale = opt.sizeScale;
	// Crescent moon: dense disk minus an offset disk, upper right of view.
	const mc = [0.1, 0.2];
	const mr = 0.075;
	while (k < nMoon) {
		const a = rnd() * Math.PI * 2;
		const r = mr * Math.sqrt(rnd());
		const x = Math.cos(a) * r;
		const y = Math.sin(a) * r;
		if (Math.hypot(x - mr * 0.45, y + mr * 0.2) < mr * 0.86) continue;
		put(dir(mc[0] + x, mc[1] + y), sizeScale * (1.0 + rnd() * 0.5), MOON[Math.floor(rnd() * 3)], 0.35, rnd());
	}
	// Band: diagonal great-circle strip with clumpy density.
	const bandAng = -0.75;
	const ca = Math.cos(bandAng);
	const sa = Math.sin(bandAng);
	let guard = 0;
	while (k < nMoon + nBand && guard++ < n * 50) {
		const t = (rnd() * 2 - 1) * spread * 0.75;
		const w = gaussian(rnd) * spread * 0.07;
		const a = t * ca - w * sa;
		const b = t * sa + w * ca;
		const dens = 0.55 + fbm3(a * 3, b * 3, 1.7, 3) * 1.6;
		if (rnd() > dens) continue;
		const col = mixRgb(STAR[Math.floor(rnd() * STAR.length)], STAR[3], rnd() * 0.3);
		put(dir(a, b), sizeScale * (0.7 + rnd() * 0.6), col, 0.18 + rnd() * 0.2, rnd());
	}
	// Bright accent stars: big faceted grains with a soft glow.
	for (let i = 0; i < nAccent; i++) {
		put(dir((rnd() * 2 - 1) * spread, (rnd() * 2 - 1) * spread * 1.35), sizeScale * (3.0 + rnd() * 2.2), STAR[Math.floor(rnd() * 3)], 0.6, rnd());
	}
	// Remaining grains: scattered field stars over the whole view.
	while (k < n) {
		const col = STAR[Math.floor(rnd() * STAR.length)];
		put(dir((rnd() * 2 - 1) * spread * 1.1, (rnd() * 2 - 1) * spread * 1.5), sizeScale * (0.8 + rnd() * 0.9), col, 0.16 + rnd() * 0.2, rnd());
	}
	return s;
};
