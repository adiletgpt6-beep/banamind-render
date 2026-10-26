// SandLightingSystem — key, fill (hemisphere), rim and ambient light presets
// per scene, blended smoothly over time. Sand only reflects these lights; the
// sky grains alone receive a soft self-light ("glow").
import {smoothstep} from '../utils/random';

export type LightPreset = {
	keyDir: [number, number, number];
	keyColor: [number, number, number];
	key: number;
	rimDir: [number, number, number];
	rimColor: [number, number, number];
	rim: number;
	hemiSky: [number, number, number];
	hemiGround: [number, number, number];
	hemi: number;
	ambient: number;
	glow: number; // global multiplier for sky self-light
	fogNear: number;
	fogFar: number;
	bgTop: string;
	bgMid: string;
	bgBottom: string;
};

export type LightKey = {t: number; preset: LightPreset};

const mix = (a: number, b: number, s: number) => a + (b - a) * s;
const mix3 = (a: number[], b: number[], s: number): [number, number, number] => [mix(a[0], b[0], s), mix(a[1], b[1], s), mix(a[2], b[2], s)];
const hexToRgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a: string, b: string, s: number) => {
	const A = hexToRgb(a);
	const B = hexToRgb(b);
	return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], s))).join(',')})`;
};

export class SandLightingSystem {
	keys: LightKey[] = [];
	add(t: number, preset: LightPreset) {
		this.keys.push({t, preset});
		this.keys.sort((a, b) => a.t - b.t);
		return this;
	}
	/** Each key holds until the next one; the blend happens over `blend` seconds before it. */
	at(t: number, blend = 1.6): LightPreset {
		const K = this.keys;
		let i = 0;
		while (i + 1 < K.length && K[i + 1].t <= t) i++;
		const cur = K[i];
		const nxt = K[i + 1];
		if (!nxt) return cur.preset;
		const s = smoothstep(nxt.t - blend, nxt.t, t);
		const a = cur.preset;
		const b = nxt.preset;
		return {
			keyDir: mix3(a.keyDir, b.keyDir, s),
			keyColor: mix3(a.keyColor, b.keyColor, s),
			key: mix(a.key, b.key, s),
			rimDir: mix3(a.rimDir, b.rimDir, s),
			rimColor: mix3(a.rimColor, b.rimColor, s),
			rim: mix(a.rim, b.rim, s),
			hemiSky: mix3(a.hemiSky, b.hemiSky, s),
			hemiGround: mix3(a.hemiGround, b.hemiGround, s),
			hemi: mix(a.hemi, b.hemi, s),
			ambient: mix(a.ambient, b.ambient, s),
			glow: mix(a.glow, b.glow, s),
			fogNear: mix(a.fogNear, b.fogNear, s),
			fogFar: mix(a.fogFar, b.fogFar, s),
			bgTop: mixHex(a.bgTop, b.bgTop, s),
			bgMid: mixHex(a.bgMid, b.bgMid, s),
			bgBottom: mixHex(a.bgBottom, b.bgBottom, s),
		};
	}
}

const WARM: [number, number, number] = [1.0, 0.9, 0.76];
const COOL: [number, number, number] = [0.6, 0.74, 1.0];
const base = {
	keyColor: WARM,
	rimColor: COOL,
	hemiSky: [0.32, 0.42, 0.62] as [number, number, number],
	hemiGround: [0.12, 0.09, 0.07] as [number, number, number],
	ambient: 0.05,
	glow: 0,
	bgTop: '#0e2340',
	bgMid: '#081525',
	bgBottom: '#050c17',
};

export const LIGHTS: Record<string, LightPreset> = {
	macro: {...base, keyDir: [-1, 0.75, 0.55], key: 3.4, rimDir: [0.9, 0.4, -1], rim: 2.2, hemi: 0.35, fogNear: 1.2, fogFar: 60},
	earth: {...base, keyDir: [1, 0.12, -0.02], key: 4.3, rimDir: [-0.8, 0.3, -1], rim: 0.55, hemi: 0.12, ambient: 0.02, fogNear: 30, fogFar: 90},
	mountains: {...base, keyDir: [-0.85, 0.6, 0.55], key: 3.0, rimDir: [0.6, 0.5, -1], rim: 1.1, hemi: 0.55, fogNear: 14, fogFar: 46, bgTop: '#13304f'},
	tree: {...base, keyDir: [-0.6, 0.95, 0.65], key: 2.8, rimDir: [0.8, 0.4, -1], rim: 1.4, hemi: 0.6, fogNear: 12, fogFar: 40, bgTop: '#112b48'},
	sky: {...base, keyDir: [0.2, -0.4, 1], key: 1.3, rimDir: [0, 1, 0], rim: 0.6, hemi: 0.75, glow: 1, fogNear: 40, fogFar: 120, bgTop: '#0b1d36', bgMid: '#071222', bgBottom: '#040a14'},
	grand: {...base, keyDir: [0.75, 0.65, 0.85], key: 3.0, rimDir: [-0.8, 0.4, -1], rim: 1.2, hemi: 0.45, glow: 0.8, fogNear: 30, fogFar: 110},
	quote: {...base, keyDir: [0.75, 0.65, 0.85], key: 2.4, rimDir: [-0.8, 0.4, -1], rim: 1.0, hemi: 0.4, glow: 0.7, fogNear: 30, fogFar: 110},
};
