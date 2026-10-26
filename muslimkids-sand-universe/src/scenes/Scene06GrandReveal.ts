// SCENE 6 — THE GRAND REVEAL (00:44–00:52)
// «Посмотри! Земля, горы, дерево и звёздное небо — сколько удивительного
// вокруг нас!»
// Spatial choreography: the whole sky moves at once but not chaotically —
// grains on the left curl into a globe (upper left), grains on the right
// settle into a mountain range, the lower part builds a tree on its dune and
// the outer grains remain as a starry backdrop. All four worlds stay alive:
// the Earth turns, the tree sways, the stars drift.
import {buildComposition, GROUP, TREE_SCALE} from '../geometry/composition';
import {TREE_ROOT} from '../geometry/tree';
import type {BuildContext} from '../engines/SandUniverseEngine';
import {LIGHTS} from '../engines/SandLightingSystem';
import {assignGrains, fillState, makeMat, Mat, SandState} from '../engines/SandMorphEngine';
import {gaussian, hash1, mulberry32, smoothstep} from '../utils/random';
import {EARTH_AXIS} from './Scene02Earth';
import {skyFrame, SKY_CENTER} from './Scene05Cosmos';

export const T_GRAND = 43.6;
export const GRAND_CAM: [number, number, number] = [0, 1.3, 26.5];
export type Layout = Record<'earth' | 'mountains' | 'tree' | 'stars', [number, number, number]>;
export const GRAND_LAYOUT: Layout = {
	earth: [-1.0, 5.35, 0],
	mountains: [0.55, 0.15, -1.6],
	tree: [-0.45, -6.2, 1.6],
	stars: GRAND_CAM,
};

export const makeCompositionState = (name: string, base: SandState | null, n: number, layout: Layout, t0: number) => {
	const st = base ? base.clone(name) : new SandState(name, n, 5);
	if (!base) st.shadow.set([1, 0.85, 0.6, 0, 0.7]);
	const sway = (t: number) => smoothstep(t0 + 1.5, t0 + 4, t);
	st.xform = (t: number, g: number, out: Mat) => {
		if (g === GROUP.earth) return makeMat(out, EARTH_AXIS, 0.2 * (t - t0) - 1.1, 1, layout.earth);
		if (g === GROUP.mountains) return makeMat(out, [0, 1, 0], -0.16, 1, layout.mountains);
		if (g === GROUP.stars) return makeMat(out, [0, 0, 1], 0.006 * (t - t0), 1, layout.stars);
		return makeMat(out, [0, 1, 0], 0.3, 1, layout.tree);
	};
	st.displace = (i: number, t: number, p: Float32Array) => {
		if (st.group[i] !== GROUP.tree) return;
		const h = Math.max(0, st.pos[i * 3 + 1] - TREE_ROOT.y * TREE_SCALE) / 3.6;
		const a = 0.045 * sway(t) * h * h;
		p[0] += a * Math.sin(1.3 * t + st.pos[i * 3 + 1]);
	};
	return st;
};

export const buildScene06 = (ctx: BuildContext) => {
	const {N, grains, ids} = ctx;
	const sky = ctx.states[ctx.states.length - 1];
	const counts = {earth: 25000, mountains: 23000, tree: 19000, stars: N - 67000};
	const shape = buildComposition(ctx.mask, counts);
	const grand = makeCompositionState('grand', null, N, GRAND_LAYOUT, T_GRAND);
	const from = ctx.snapshot(sky, T_GRAND);
	const perm = new Int32Array(N);
	const pts = Int32Array.from({length: N}, (_, i) => i);
	const {right, upv} = skyFrame();
	// Key points in composition world space: sky-left → left, sky-top → top.
	const centers = [GRAND_LAYOUT.earth, GRAND_LAYOUT.mountains, GRAND_LAYOUT.tree, GRAND_LAYOUT.stars, GRAND_LAYOUT.tree];
	assignGrains(
		from,
		ids,
		shape,
		pts,
		(x, y, z) => {
			const dx = x - SKY_CENTER[0];
			const dy = y - SKY_CENTER[1];
			const dz = z - SKY_CENTER[2];
			return [dx * right.x + dy * right.y + dz * right.z, dx * upv.x + dy * upv.y + dz * upv.z];
		},
		(x, y, _z, p) => {
			const c = centers[shape.group[p]];
			const far = shape.group[p] === GROUP.stars ? 0.35 : 1;
			return [(x + c[0]) * far, y + c[1]];
		},
		140,
		perm,
	);
	fillState(grand, shape, perm, grains);
	ctx.states.push(grand);

	const rnd = mulberry32(1606);
	const delay = new Float32Array(N);
	const dur = new Float32Array(N);
	const depart = new Float32Array(N * 3);
	const arrive = new Float32Array(N * 3);
	const way1 = new Float32Array(N * 3);
	grand.prepare(T_GRAND + 3);
	const up = new Float32Array(3);
	const tp = new Float32Array(3);
	const misc = new Float32Array(2);
	for (let i = 0; i < N; i++) {
		const g = grand.group[i];
		const r = hash1(i, 61);
		delay[i] = g === GROUP.stars ? r * 1.2 : g === GROUP.earth ? 0.2 + r * 1.4 : g === GROUP.mountains ? 0.6 + r * 1.4 : 1.0 + grand.order[i] * 1.2 + r * 0.3;
		dur[i] = 2.2 + hash1(i, 62) * 0.6;
		depart.set([gaussian(rnd) * 0.6, -1.5 - rnd(), gaussian(rnd) * 0.6], i * 3);
		grand.worldUp(i, up);
		const k = g === GROUP.stars ? 0.5 : 1.1;
		arrive.set([up[0] * k, up[1] * k, up[2] * k], i * 3);
		grand.worldPos(i, T_GRAND + 3, tp, misc);
		// Swirl: grains of the globe orbit its centre before landing.
		const c = centers[g];
		const ang = hash1(i, 63) * Math.PI * 2;
		const rad = g === GROUP.earth ? 2.6 : g === GROUP.stars ? 0 : 1.6;
		way1.set(
			g === GROUP.stars
				? [(from[i * 3] + tp[0]) / 2, (from[i * 3 + 1] + tp[1]) / 2 + 2, (from[i * 3 + 2] + tp[2]) / 2]
				: [c[0] + Math.cos(ang) * rad, c[1] + 2.2 + Math.sin(ang) * rad * 0.5, c[2] + Math.sin(ang) * rad],
			i * 3,
		);
	}
	ctx.specs.push({name: 'sky→grand', from: sky, to: grand, t0: T_GRAND, delay, dur, depart, arrive, way1, spin: 3, settle: 0.8});

	ctx.camera.add(
		{t: 45.0, pos: [0.2, -2.0, 9.5], target: [0.4, 9, -8], fov: 42},
		{t: 47.2, pos: [0, 1.2, 23.5], target: [0, 1.0, 0], fov: 36},
		{t: 49.8, pos: [0, 1.3, 26.0], target: [0, 1.1, 0], fov: 35},
		{t: 51.8, pos: GRAND_CAM, target: [0, 1.15, 0], fov: 35},
	);
	ctx.lights.add(46.0, LIGHTS.grand);
};
