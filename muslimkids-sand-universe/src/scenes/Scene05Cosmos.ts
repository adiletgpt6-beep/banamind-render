// SCENE 5 — SKY FROM SAND (00:34–00:44)
// «Поднимем взгляд. Перед нами небо и звёзды. Коран призывает нас размышлять
// о сотворении небес и земли.»
// A few grains leave the crown, then more: a rising spiral of sand that the
// camera follows upwards. Leaves first, then branches, trunk and the dune.
// The grains spread over a dome into a star field with a band of dense sand
// and a crescent of pale grains. Stars are grains with a soft light.
import * as THREE from 'three';
import {buildCosmos} from '../geometry/cosmos';
import type {BuildContext} from '../engines/SandUniverseEngine';
import {LIGHTS} from '../engines/SandLightingSystem';
import {assignGrains, fillState, makeMat, SandState} from '../engines/SandMorphEngine';
import {gaussian, hash1, mulberry32} from '../utils/random';

export const T_SKY = 33.2;
export const SKY_CENTER: [number, number, number] = [0, -1.5, 12];
export const SKY_LOOK: [number, number, number] = [0, 22, -8];
export const SKY_R = 30;

export const skyFrame = () => {
	const view = new THREE.Vector3(SKY_LOOK[0] - SKY_CENTER[0], SKY_LOOK[1] - SKY_CENTER[1], SKY_LOOK[2] - SKY_CENTER[2]).normalize();
	const right = new THREE.Vector3(1, 0, 0);
	const upv = new THREE.Vector3().crossVectors(right, view).normalize().negate();
	if (upv.y < 0) upv.negate();
	return {view, right, upv};
};

export const buildScene05 = (ctx: BuildContext) => {
	const {N, grains, ids} = ctx;
	const tree = ctx.states[ctx.states.length - 1];
	const {view, right, upv} = skyFrame();
	const shape = buildCosmos({n: N, radius: SKY_R, view, spread: 1.05, seed: 515, sizeScale: 1.35});
	const sky = new SandState('sky', N, 1);
	const vAxis = [view.x, view.y, view.z];
	sky.xform = (t, _g, out) => makeMat(out, vAxis, 0.012 * (t - T_SKY), 1, SKY_CENTER);
	const from = ctx.snapshot(tree, T_SKY);
	const perm = new Int32Array(N);
	const pts = Int32Array.from({length: N}, (_, i) => i);
	assignGrains(
		from,
		ids,
		shape,
		pts,
		(x, y) => [x, y],
		(x, y, z) => [x * right.x + y * right.y + z * right.z, x * upv.x + y * upv.y + z * upv.z],
		150,
		perm,
	);
	fillState(sky, shape, perm, grains);
	ctx.states.push(sky);

	const rnd = mulberry32(1505);
	const delay = new Float32Array(N);
	const dur = new Float32Array(N);
	const depart = new Float32Array(N * 3);
	const arrive = new Float32Array(N * 3);
	const way1 = new Float32Array(N * 3);
	let topY = -1e9;
	let botY = 1e9;
	for (let i = 0; i < N; i++) {
		topY = Math.max(topY, from[i * 3 + 1]);
		botY = Math.min(botY, from[i * 3 + 1]);
	}
	sky.prepare(T_SKY + 4);
	const tp = new Float32Array(3);
	const misc = new Float32Array(2);
	for (let i = 0; i < N; i++) {
		const x = from[i * 3];
		const y = from[i * 3 + 1];
		const z = from[i * 3 + 2];
		const h = (y - botY) / (topY - botY);
		const g = tree.group[i];
		const r = hash1(i, 51);
		if (g === 2) delay[i] = 0.25 + Math.pow(r, 0.4) * 1.3 + (1 - h) * 0.4; // a few early grains, then many
		else if (g === 1) delay[i] = 1.5 + (1 - h) * 0.8 + r * 0.4;
		else delay[i] = 2.3 + Math.hypot(x, z) * 0.18 + r * 0.6;
		dur[i] = 2.7 + hash1(i, 52) * 1.0;
		depart.set([gaussian(rnd) * 0.25, 1.1 + rnd() * 0.5, gaussian(rnd) * 0.25], i * 3);
		sky.worldPos(i, T_SKY + 4, tp, misc);
		arrive.set([(SKY_CENTER[0] - tp[0]) * 0.12, (SKY_CENTER[1] - tp[1]) * 0.12, (SKY_CENTER[2] - tp[2]) * 0.12], i * 3);
		// Rising spiral stream above the crown.
		const a = hash1(i, 53) * Math.PI * 2;
		const hh = 1.0 + hash1(i, 54) * 4.5;
		const rr = 0.8 + hh * 0.35 + gaussian(rnd) * 0.15;
		const spiralA = a * 0.15 + hh * 1.1;
		way1.set([Math.cos(spiralA) * rr, topY + hh, Math.sin(spiralA) * rr * 0.8], i * 3);
	}
	ctx.specs.push({name: 'tree→sky', from: tree, to: sky, t0: T_SKY, delay, dur, depart, arrive, way1, spin: 5, settle: 0});

	ctx.camera.add(
		{t: 35.2, pos: [0.3, -4.0, 14.5], target: [0, -1.5, 0], fov: 38},
		{t: 37.3, pos: [0.1, -2.6, 13.0], target: [0, 8, -4], fov: 42},
		{t: 39.4, pos: SKY_CENTER, target: SKY_LOOK, fov: 44},
		{t: 42.6, pos: [0.25, -1.4, 12.2], target: [0.8, 22, -8], fov: 44},
	);
	ctx.lights.add(36.6, LIGHTS.sky);
};
