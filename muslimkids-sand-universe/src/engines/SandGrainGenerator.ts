// SandGrainGenerator — real, irregular sand grains instead of dots.
//
// Every grain type is a rounded convex polyhedron defined by a radial
// function: r(d) = (Σ max(d·nₖ,0)^p / hₖ^p)^(-1/p) over K random facet planes.
// Large p gives sharp facets (angular grains), small p rounded mineral grains.
// Fractal noise adds surface roughness and pits. The same function is sampled
// on an icosphere at three levels of detail:
//   HERO  — one macro grain for the opening close-up (≈30k faces, smooth normals)
//   MACRO — the first few hundred grains that are seen up close (≈1k faces)
//   MID   — tens of thousands of grains, 80 flat-shaded facets each
import * as THREE from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {fbm3, gaussian, hash1, mulberry32} from '../utils/random';

export type GrainTypeDef = {
	name: string;
	planes: number;
	sharpness: number;
	aspect: [number, number, number];
	roughness: number;
	seed: number;
};

export const GRAIN_TYPES: GrainTypeDef[] = [
	{name: 'Grain_A quartz', planes: 10, sharpness: 16, aspect: [1.15, 0.9, 1.0], roughness: 0.05, seed: 11},
	{name: 'Grain_B angular', planes: 7, sharpness: 30, aspect: [1.3, 0.85, 0.95], roughness: 0.03, seed: 23},
	{name: 'Grain_C rounded', planes: 12, sharpness: 4.5, aspect: [1.0, 0.92, 1.0], roughness: 0.04, seed: 37},
	{name: 'Grain_D flat', planes: 8, sharpness: 10, aspect: [1.2, 0.58, 1.05], roughness: 0.04, seed: 41},
	{name: 'Grain_E polyhedral', planes: 6, sharpness: 20, aspect: [1.1, 1.0, 0.8], roughness: 0.05, seed: 59},
];
export const TYPE_WEIGHTS = [0.26, 0.22, 0.2, 0.14, 0.18];

export type Lod = 'hero' | 'macro' | 'mid';
const LOD_DETAIL: Record<Lod, number> = {hero: 40, macro: 7, mid: 1};

const radialFunction = (def: GrainTypeDef) => {
	const rnd = mulberry32(def.seed);
	const normals: THREE.Vector3[] = [];
	const offsets: number[] = [];
	// Half random normals plus perturbed opposites guarantee a closed hull.
	const half = Math.ceil(def.planes / 2);
	for (let k = 0; k < half; k++) {
		const n = new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).normalize();
		normals.push(n);
		offsets.push(0.82 + rnd() * 0.18);
		const o = n.clone().negate().add(new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).multiplyScalar(0.35)).normalize();
		normals.push(o);
		offsets.push(0.82 + rnd() * 0.18);
	}
	const p = def.sharpness;
	return (d: THREE.Vector3) => {
		let s = 0;
		for (let k = 0; k < normals.length; k++) {
			const c = Math.max(d.dot(normals[k]), 0) / offsets[k];
			s += Math.pow(c, p);
		}
		// Sphere term keeps directions far from every plane bounded.
		s += Math.pow(1 / 1.45, p);
		return Math.pow(s, -1 / p);
	};
};

export const createGrainGeometry = (typeIndex: number, lod: Lod): THREE.BufferGeometry => {
	const def = GRAIN_TYPES[typeIndex];
	const r = radialFunction(def);
	const base = new THREE.IcosahedronGeometry(1, LOD_DETAIL[lod]);
	// Indexed for every LOD: flat facets of the mid LOD come from screen-space
	// derivatives (flatShading), so shared vertices cut vertex work ~6×.
	let geo: THREE.BufferGeometry = mergeVertices(base);
	const pos = geo.attributes.position as THREE.BufferAttribute;
	const d = new THREE.Vector3();
	const so = def.seed * 1.7;
	let mean = 0;
	for (let i = 0; i < pos.count; i++) {
		d.fromBufferAttribute(pos, i).normalize();
		let rr = r(d);
		// Roughness: low-frequency lumps + fine grit (+ pits on macro levels).
		rr *= 1 + def.roughness * fbm3(d.x * 2.1 + so, d.y * 2.1, d.z * 2.1, 3);
		if (lod !== 'mid') {
			rr *= 1 + 0.012 * fbm3(d.x * 7 + so, d.y * 7, d.z * 7, 3);
			const pit = fbm3(d.x * 4.1 - so, d.y * 4.1, d.z * 4.1, 2);
			rr *= 1 - 0.02 * Math.max(0, pit - 0.25) * 4;
		}
		pos.setXYZ(i, d.x * rr * def.aspect[0], d.y * rr * def.aspect[1], d.z * rr * def.aspect[2]);
		mean += rr;
	}
	mean /= pos.count;
	geo.scale(1 / mean, 1 / mean, 1 / mean);
	geo.computeVertexNormals();
	geo.computeBoundingSphere();
	return geo;
};

// Natural mineral palette (sRGB hex) with mixing weights.
export const NATURAL_PALETTE: [number, number][] = [
	[0xf0e0c4, 0.24], // light quartz
	[0xd9b57b, 0.25], // beige
	[0xe8c88c, 0.2], // golden sand
	[0x8b7056, 0.12], // dark mineral
	[0xa49c90, 0.11], // grey grain
	[0xf8f5ed, 0.08], // very light
];

export type GrainProps = {
	count: number;
	type: Uint8Array;
	radius: Float32Array;
	aspect: Float32Array; // N*3 per-grain non-uniform scale
	axis: Float32Array; // N*3 rotation axis
	angle0: Float32Array;
	natural: Float32Array; // N*3 linear RGB
	shade: Float32Array; // brightness jitter
};

export const BASE_GRAIN_RADIUS = 0.028;

const pickWeighted = (u: number, w: number[]) => {
	let acc = 0;
	for (let i = 0; i < w.length; i++) {
		acc += w[i];
		if (u <= acc) return i;
	}
	return w.length - 1;
};

export const generateGrains = (count: number): GrainProps => {
	const type = new Uint8Array(count);
	const radius = new Float32Array(count);
	const aspect = new Float32Array(count * 3);
	const axis = new Float32Array(count * 3);
	const angle0 = new Float32Array(count);
	const natural = new Float32Array(count * 3);
	const shade = new Float32Array(count);
	const c = new THREE.Color();
	const natW = NATURAL_PALETTE.map((p) => p[1]);
	for (let i = 0; i < count; i++) {
		const rnd = mulberry32(9001 + i * 7919);
		type[i] = pickWeighted(rnd(), TYPE_WEIGHTS);
		// Log-normal size distribution: many medium grains, few big ones.
		radius[i] = BASE_GRAIN_RADIUS * Math.min(1.9, Math.max(0.55, Math.exp(gaussian(rnd) * 0.28)));
		for (let k = 0; k < 3; k++) aspect[i * 3 + k] = 0.86 + rnd() * 0.28;
		const ax = new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).normalize();
		axis.set([ax.x, ax.y, ax.z], i * 3);
		angle0[i] = rnd() * Math.PI * 2;
		c.setHex(NATURAL_PALETTE[pickWeighted(rnd(), natW)][0], THREE.SRGBColorSpace);
		const j = 0.92 + rnd() * 0.16;
		natural.set([c.r * j, c.g * j, c.b * j], i * 3);
		shade[i] = 0.9 + hash1(i, 5) * 0.2;
	}
	// Grain 0 is the hero of the opening shot: a well-proportioned quartz grain.
	type[0] = 0;
	radius[0] = BASE_GRAIN_RADIUS * 1.05;
	aspect.set([1, 1, 1], 0);
	c.setHex(0xe8c88c, THREE.SRGBColorSpace);
	natural.set([c.r, c.g, c.b], 0);
	return {count, type, radius, aspect, axis, angle0, natural, shade};
};
