// SCENE 3 — MOUNTAINS FROM SAND (00:15–00:24)
// «Теперь песчинки собираются снова. Перед нами горы, долины и реки.
// Какой удивительный мир!»
// SAND DISINTEGRATION + SAND FLOW + SAND REFORMATION: the globe peels away
// from its lower-right limb (no explosion), grains wrap around the planet in
// three ribbons, the ribbons split and rain down onto the valley. The range
// assembles base → slopes → summits; then the camera skims the foothills
// until the "solid" slopes resolve into individual grains (macro ↔ micro).
import {buildMountains} from '../geometry/mountains';
import type {BuildContext} from '../engines/SandUniverseEngine';
import {LIGHTS} from '../engines/SandLightingSystem';
import {assignGrains, fillState, makeMat, SandState} from '../engines/SandMorphEngine';
import {gaussian, hash1, mulberry32} from '../utils/random';
import {EARTH_R} from './Scene02Earth';

export const GROUND_Y = -8;
export const T_MOUNTAINS = 13.5;

export const buildScene03 = (ctx: BuildContext) => {
	const {N, grains, ids} = ctx;
	const earth = ctx.states[ctx.states.length - 1];
	const shape = buildMountains(N);
	const mountains = new SandState('mountains', N, 1);
	mountains.shadow.set([0.85]);
	mountains.xform = (_t, _g, out) => makeMat(out, [0, 1, 0], 0, 1, [0, GROUND_Y, 0]);
	const from = ctx.snapshot(earth, T_MOUNTAINS);
	const perm = new Int32Array(N);
	const pts = Int32Array.from({length: N}, (_, i) => i);
	// Left of the globe → left of the range; lower globe → foreground.
	assignGrains(from, ids, shape, pts, (x, y) => [x, -y], (x, _y, z) => [x, z], 160, perm);
	fillState(mountains, shape, perm, grains);
	ctx.states.push(mountains);

	const delay = new Float32Array(N);
	const dur = new Float32Array(N);
	const depart = new Float32Array(N * 3);
	const arrive = new Float32Array(N * 3);
	const way1 = new Float32Array(N * 3);
	const way2 = new Float32Array(N * 3);
	const rnd = mulberry32(1303);
	const dir = [0.62, -0.62, 0.48];
	const streams = [-2.35, -0.55, 1.35]; // three ribbons around the planet
	mountains.prepare(20);
	const tp = new Float32Array(3);
	const misc = new Float32Array(2);
	for (let i = 0; i < N; i++) {
		const x = from[i * 3];
		const y = from[i * 3 + 1];
		const z = from[i * 3 + 2];
		const r = Math.hypot(x, y, z) + 1e-6;
		const peel = ((x * dir[0] + y * dir[1] + z * dir[2]) / r) * -0.5 + 0.5; // 0 at the lower-right limb
		delay[i] = 2.6 * (0.55 * peel + 0.45 * mountains.order[i]) + hash1(i, 31) * 0.35;
		dur[i] = 2.6 + hash1(i, 32) * 0.7;
		depart.set([(x / r) * 0.9, (y / r) * 0.9 - 0.2, (z / r) * 0.9], i * 3);
		arrive.set([gaussian(rnd) * 0.15, 1.0, gaussian(rnd) * 0.15], i * 3);
		// Flow ribbon: nearest stream angle, swept ahead around the globe.
		const ang = Math.atan2(z, x);
		let k = 0;
		let bd = 1e9;
		streams.forEach((s, j) => {
			const d = Math.abs(Math.atan2(Math.sin(ang - s), Math.cos(ang - s)));
			if (d < bd) {
				bd = d;
				k = j;
			}
		});
		const sa = streams[k] + 0.75 + gaussian(rnd) * 0.12;
		const rr = EARTH_R * (1.42 + gaussian(rnd) * 0.07);
		way1.set([Math.cos(sa) * rr, -1.6 - EARTH_R * 0.35 + gaussian(rnd) * 0.22, Math.sin(sa) * rr], i * 3);
		mountains.worldPos(i, 20, tp, misc);
		way2.set([tp[0] * 0.75 + gaussian(rnd) * 0.25, tp[1] + 2.4 + rnd() * 1.2, tp[2] * 0.75 + 0.6 + gaussian(rnd) * 0.25], i * 3);
	}
	ctx.specs.push({
		name: 'earth→mountains',
		from: earth,
		to: mountains,
		t0: T_MOUNTAINS,
		delay,
		dur,
		depart,
		arrive,
		way1,
		way2,
		spin: 4,
		settle: 1.2,
		settleDir: 'gravity',
	});

	ctx.camera.add(
		{t: 15.6, pos: [0.2, -1.2, 18.2], target: [0, -4.2, -0.5]},
		{t: 18.2, pos: [0, -2.6, 15.6], target: [0, -6.5, -2]},
		{t: 20.4, pos: [-0.2, -3.4, 12.8], target: [0, -7.0, -2.3]},
		{t: 22.6, pos: [0.9, -5.7, 5.4], target: [0.6, -6.8, -1.4]},
		{t: 23.2, pos: [1.0, -5.8, 5.0], target: [0.6, -6.9, -1.4]},
	);
	ctx.lights.add(16.6, LIGHTS.mountains);
};
