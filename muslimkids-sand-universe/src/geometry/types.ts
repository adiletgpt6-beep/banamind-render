// A "shape" is a cloud of target points for the sand to assemble into.
// Points are generated in arbitrary order and later assigned to persistent
// grain IDs by SandMorphEngine (so every grain keeps its identity).
export type ShapePoints = {
	n: number;
	pos: Float32Array; // N*3 local target position
	col: Float32Array; // N*3 linear RGB paint colour
	paint: Float32Array; // 0 = natural mineral colour, 1 = fully painted sand
	size: Float32Array; // grain size multiplier
	glow: Float32Array; // soft self-light (only for the starry sky)
	order: Float32Array; // assembly order 0..1 (who arrives first)
	up: Float32Array; // N*3 settling direction (grains land along -up)
	group: Uint8Array; // sub-object id (used by the grand composition)
};

export const allocShape = (n: number): ShapePoints => ({
	n,
	pos: new Float32Array(n * 3),
	col: new Float32Array(n * 3),
	paint: new Float32Array(n),
	size: new Float32Array(n).fill(1),
	glow: new Float32Array(n),
	order: new Float32Array(n),
	up: new Float32Array(n * 3),
	group: new Uint8Array(n),
});

import * as THREE from 'three';
const tmp = new THREE.Color();
export const hexLinear = (hex: number): [number, number, number] => {
	tmp.setHex(hex, THREE.SRGBColorSpace);
	return [tmp.r, tmp.g, tmp.b];
};
export const mixRgb = (a: number[], b: number[], t: number): [number, number, number] => [
	a[0] + (b[0] - a[0]) * t,
	a[1] + (b[1] - a[1]) * t,
	a[2] + (b[2] - a[2]) * t,
];
