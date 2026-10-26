// SCENE 2 — EARTH FROM SAND (00:06–00:15)
// «Песчинки собираются — и появляется Земля! Она вращается. На одной стороне
// день, на другой — ночь.»
// SAND ASSEMBLY: the vortex contracts onto the globe — silhouette first in
// natural sand, then painted sand spreads (oceans, continents, ice, clouds).
// The globe turns on its tilted axis under a sun on the right: day and night
// are a consequence of the rotation. The camera then pushes in until single
// grains are visible.
import {buildEarth} from '../geometry/earth';
import type {BuildContext} from '../engines/SandUniverseEngine';
import {LIGHTS} from '../engines/SandLightingSystem';
import {assignGrains, fillState, makeMat, SandState} from '../engines/SandMorphEngine';
import {hash1} from '../utils/random';

export const EARTH_R = 3;
export const EARTH_AXIS = (() => {
	const v = [-0.3, 0.92, 0.25];
	const l = Math.hypot(...v);
	return v.map((x) => x / l);
})();
/** Earth spin angle: west → east, Central Asia faces the viewer around 11.5 s. */
export const earthAngle = (t: number) => (-150 * Math.PI) / 180 + 0.17 * (t - 11.5);
export const T_EARTH = 6.0;

export const buildScene02 = (ctx: BuildContext) => {
	const {N, grains, ids} = ctx;
	const intro = ctx.states[0];
	const shape = buildEarth(ctx.mask, {radius: EARTH_R, n: N});
	const earth = new SandState('earth', N, 1);
	earth.shadow.set([1]);
	earth.xform = (t, _g, out) => makeMat(out, EARTH_AXIS, earthAngle(t), 1, [0, 0, 0]);

	// Assignment: by longitude strips, then height — the vortex wraps the globe.
	const from = ctx.snapshot(intro, T_EARTH);
	const m = new Float32Array(12);
	makeMat(m, EARTH_AXIS, earthAngle(T_EARTH + 2), 1, [0, 0, 0]);
	const world = (x: number, y: number, z: number) => [m[0] * x + m[3] * y + m[6] * z, m[1] * x + m[4] * y + m[7] * z, m[2] * x + m[5] * y + m[8] * z];
	const perm = new Int32Array(N);
	const pts = Int32Array.from({length: N}, (_, i) => i);
	// The hero grain (0) lands at the front of the globe, facing the camera.
	let best = 0;
	let bestZ = -1e9;
	for (let p = 0; p < N; p++) {
		if (shape.order[p] > 0.65) continue;
		const w = world(shape.pos[p * 3], shape.pos[p * 3 + 1], shape.pos[p * 3 + 2]);
		const score = w[2] - Math.abs(w[1] - 0.4) - Math.abs(w[0] - 0.3);
		if (score > bestZ) {
			bestZ = score;
			best = p;
		}
	}
	perm[0] = best;
	const restG = ids.filter((i) => i !== 0);
	const restP = pts.filter((p) => p !== best);
	assignGrains(
		from,
		restG,
		shape,
		restP,
		(x, y, z) => [Math.atan2(z, x), y],
		(x, y, z) => {
			const w = world(x, y, z);
			return [Math.atan2(w[2], w[0]), w[1]];
		},
		180,
		perm,
	);
	fillState(earth, shape, perm, grains);
	ctx.states.push(earth);

	// Transition: assembly with radial landing and a soft settle.
	const delay = new Float32Array(N);
	const dur = new Float32Array(N);
	const colorDelay = new Float32Array(N);
	const depart = new Float32Array(N * 3);
	const arrive = new Float32Array(N * 3);
	earth.prepare(T_EARTH + 3);
	const up = new Float32Array(3);
	const wp = new Float32Array(3);
	const misc = new Float32Array(2);
	for (let i = 0; i < N; i++) {
		delay[i] = earth.order[i] * 2.4 + hash1(i, 21) * 0.4;
		dur[i] = 1.4 + hash1(i, 22) * 0.6;
		const x = from[i * 3];
		const z = from[i * 3 + 2];
		const l = Math.hypot(x, z) + 1e-6;
		depart.set([(-z / l) * 0.9, 0.05, (x / l) * 0.9], i * 3);
		earth.worldUp(i, up);
		arrive.set([up[0] * 0.75, up[1] * 0.75, up[2] * 0.75], i * 3);
		// Paint sweeps around the globe once its sand silhouette is complete.
		earth.worldPos(i, T_EARTH + 3, wp, misc);
		const lonFrac = (Math.atan2(wp[0], wp[2]) + Math.PI) / (2 * Math.PI);
		colorDelay[i] = 2.75 + lonFrac * 1.3 + hash1(i, 23) * 0.3;
	}
	delay[0] = 1.2;
	dur[0] = 2.2;
	ctx.specs.push({
		name: 'intro→earth',
		from: intro,
		to: earth,
		t0: T_EARTH,
		delay,
		dur,
		colorDelay,
		colorDur: 0.9,
		depart,
		arrive,
		spin: 2.5,
		settle: 1,
	});

	ctx.camera.add(
		{t: 7.5, pos: [1.6, 1.6, 21.6], target: [0, 0, 0]},
		{t: 10.6, pos: [1.0, 1.0, 20.2], target: [0, 0.1, 0]},
		{t: 12.6, pos: [0.9, 0.9, 19.0], target: [0.1, 0.15, 0]},
		{t: 13.9, pos: [0.9, 0.7, 12.6], target: [0.6, 0.3, 0]},
	);
	ctx.lights.add(6.6, LIGHTS.earth);
};
