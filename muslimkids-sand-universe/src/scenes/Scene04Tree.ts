// SCENE 4 — TREE FROM SAND (00:24–00:34)
// «А теперь маленькое семечко. Появляется росток. Он растёт, выпускает ветви
// и превращается в дерево.»
// The range crumbles like a sand avalanche (summits first) into a dune; a few
// hundred grains rise and gather into a seed. Then the tree grows: grains
// stream up from the dune through the root and along the limbs — trunk, main
// branches, twigs, leaves, crown — while the whole sapling scales up.
// An artistic picture of growth, not a claim that plants grow from sand.
import {buildTree, TREE_ROOT} from '../geometry/tree';
import type {BuildContext} from '../engines/SandUniverseEngine';
import {LIGHTS} from '../engines/SandLightingSystem';
import {assignGrains, fillState, makeMat, Mat, SandState} from '../engines/SandMorphEngine';
import type {ShapePoints} from '../geometry/types';
import {gaussian, hash1, mulberry32, smoothstep} from '../utils/random';
import {GROUND_Y} from './Scene03Mountains';

export const T_CRUMBLE = 23.0;
export const T_GROW = 26.0;
export const treeScale = (t: number) => 0.3 + 0.7 * smoothstep(T_GROW + 0.2, T_GROW + 5.8, t);
export const TREE_BASE: [number, number, number] = [0, GROUND_Y, 0];

export const buildScene04 = (ctx: BuildContext) => {
	const {N, grains, ids} = ctx;
	const mountains = ctx.states[ctx.states.length - 1];
	const T = buildTree(N);
	const shape = T.tree;
	const waitingShape: ShapePoints = {...shape, pos: T.waiting, col: T.waitingCol, paint: T.waitingPaint, group: new Uint8Array(N)};

	const seedDune = new SandState('seed-dune', N, 1);
	seedDune.shadow.set([0.7]);
	seedDune.xform = (_t, _g, out) => makeMat(out, [0, 1, 0], 0, 1, TREE_BASE);
	const tree = new SandState('tree', N, 3);
	tree.shadow.set([0.7, 0.6, 0.55]);
	const rootW = [TREE_ROOT.x + TREE_BASE[0], TREE_ROOT.y + TREE_BASE[1], TREE_ROOT.z + TREE_BASE[2]];
	const growMat = (out: Mat, s: number) => {
		makeMat(out, [0, 1, 0], 0, s, [0, 0, 0]);
		out[9] = rootW[0] - s * TREE_ROOT.x;
		out[10] = rootW[1] - s * TREE_ROOT.y;
		out[11] = rootW[2] - s * TREE_ROOT.z;
		return out;
	};
	tree.xform = (t, g, out) => (g === 0 ? makeMat(out, [0, 1, 0], 0, 1, TREE_BASE) : growMat(out, treeScale(t)));
	// Gentle sway of the finished crown; trunk base stays still.
	tree.displace = (i, t, p) => {
		if (tree.group[i] === 0) return;
		const h = Math.max(0, (tree.pos[i * 3 + 1] - TREE_ROOT.y) / T.height);
		const a = 0.07 * smoothstep(T_GROW + 4.8, T_GROW + 6.5, t) * h * h;
		p[0] += a * Math.sin(1.3 * t + tree.pos[i * 3 + 1] * 0.4);
		p[2] += a * 0.45 * Math.sin(1.05 * t + 1.2);
	};

	// One assignment drives both states (point p = waiting spot + final spot).
	const from = ctx.snapshot(mountains, T_CRUMBLE);
	const perm = new Int32Array(N);
	const pts = Int32Array.from({length: N}, (_, i) => i);
	assignGrains(from, ids, waitingShape, pts, (x, _y, z) => [x, z], (x, _y, z) => [x, z], 160, perm);
	fillState(seedDune, waitingShape, perm, grains);
	fillState(tree, shape, perm, grains);
	ctx.states.push(seedDune, tree);

	// --- Crumble: mountains → dune + seed ---
	const rnd = mulberry32(1404);
	const d1 = new Float32Array(N);
	const u1 = new Float32Array(N);
	const dep1 = new Float32Array(N * 3);
	const arr1 = new Float32Array(N * 3);
	const way1 = new Float32Array(N * 3);
	const seedTop = rootW[1] + 1.4;
	let maxH = 0;
	for (let i = 0; i < N; i++) maxH = Math.max(maxH, from[i * 3 + 1] - GROUND_Y);
	const rankOrder = Array.from(ids).filter((i) => tree.group[i] !== 0).sort((a, b) => tree.order[a] - tree.order[b]);
	const isSeed = new Uint8Array(N);
	rankOrder.slice(0, T.nSeed).forEach((i) => (isSeed[i] = 1));
	seedDune.prepare(T_CRUMBLE);
	const target = new Float32Array(3);
	const misc = new Float32Array(2);
	for (let i = 0; i < N; i++) {
		const h = (from[i * 3 + 1] - GROUND_Y) / maxH;
		seedDune.worldPos(i, T_CRUMBLE, target, misc);
		if (tree.group[i] !== 0) {
			d1[i] = 0.2 + (1 - h) * 0.5 + hash1(i, 41) * 0.5;
			u1[i] = 1.25 + hash1(i, 42) * 0.3;
		} else {
			d1[i] = 0.2 + (1 - h) * 0.6 + hash1(i, 41) * 0.5;
			u1[i] = 1.1 + hash1(i, 42) * 0.5;
		}
		dep1.set([from[i * 3] * 0.12 + gaussian(rnd) * 0.2, 0.25 + rnd() * 0.3, from[i * 3 + 2] * 0.08 + gaussian(rnd) * 0.2], i * 3);
		arr1.set([gaussian(rnd) * 0.1, 0.8, gaussian(rnd) * 0.1], i * 3);
		if (isSeed[i]) {
			// Seed grains rise first, swirl, and gather into the seed.
			d1[i] = 0.4 + hash1(i, 43) * 0.6;
			u1[i] = 1.4;
			way1.set([gaussian(rnd) * 0.5, seedTop + rnd() * 0.6, gaussian(rnd) * 0.5], i * 3);
		} else {
			way1.set([(from[i * 3] + target[0]) / 2, Math.max(from[i * 3 + 1], target[1]) + 0.25, (from[i * 3 + 2] + target[2]) / 2], i * 3);
		}
	}
	ctx.specs.push({name: 'mountains→seed', from: mountains, to: seedDune, t0: T_CRUMBLE, delay: d1, dur: u1, depart: dep1, arrive: arr1, way1, spin: 3, settle: 1.4, settleDir: 'gravity'});

	// --- Growth: seed + dune reserve → trunk, branches, twigs, leaves ---
	const d2 = new Float32Array(N);
	const u2 = new Float32Array(N);
	const dep2 = new Float32Array(N * 3);
	const arr2 = new Float32Array(N * 3);
	const w1 = new Float32Array(N * 3);
	const w2 = new Float32Array(N * 3);
	const up = new Float32Array(3);
	tree.prepare(T_GROW + 6);
	for (let i = 0; i < N; i++) {
		const p = perm[i];
		if (tree.group[i] === 0) {
			d2[i] = 4.5; // dune grains stay put
			u2[i] = 0.5;
			seedDune.worldPos(i, T_GROW, target, misc);
			w1.set(target, i * 3);
			w2.set(target, i * 3);
			continue;
		}
		const o = tree.order[i];
		d2[i] = o * 4.3 + hash1(i, 44) * 0.25;
		u2[i] = (tree.group[i] === 2 ? 1.15 : 0.9) + hash1(i, 45) * 0.4;
		const s = treeScale(T_GROW + d2[i] + u2[i]);
		dep2.set([gaussian(rnd) * 0.05, 0.35, gaussian(rnd) * 0.05], i * 3);
		tree.worldUp(i, up);
		arr2.set([up[0] * 0.12, up[1] * 0.12, up[2] * 0.12], i * 3);
		// Flow: up through the root, then along the limb to its place.
		if (T.depth[p] === 0) w1.set([rootW[0] + gaussian(rnd) * 0.05, rootW[1] + 0.05, rootW[2] + gaussian(rnd) * 0.05], i * 3);
		else {
			// Branch and leaf grains rise inside the trunk, then fan out along the limbs.
			const tt = T.trunkTop;
			w1.set([rootW[0] + s * (tt.x - TREE_ROOT.x) + gaussian(rnd) * 0.05, rootW[1] + s * (tt.y - TREE_ROOT.y), rootW[2] + s * (tt.z - TREE_ROOT.z) + gaussian(rnd) * 0.05], i * 3);
		}
		const ax = T.anchor[p * 3];
		const ay = T.anchor[p * 3 + 1];
		const az = T.anchor[p * 3 + 2];
		w2.set([rootW[0] + s * (ax - TREE_ROOT.x), rootW[1] + s * (ay - TREE_ROOT.y), rootW[2] + s * (az - TREE_ROOT.z)], i * 3);
	}
	ctx.specs.push({name: 'seed→tree', from: seedDune, to: tree, t0: T_GROW, delay: d2, dur: u2, depart: dep2, arrive: arr2, way1: w1, way2: w2, spin: 2, settle: 0.6});

	ctx.camera.add(
		{t: 24.3, pos: [0.7, -4.6, 9.0], target: [0, -7.0, 0], fov: 32},
		{t: 25.8, pos: [0.25, -6.0, 4.2], target: [0, -7.3, 0], fov: 20},
		{t: 26.6, pos: [0.2, -5.95, 4.4], target: [0, -7.22, 0], fov: 20},
		{t: 28.3, pos: [0.2, -5.8, 6.0], target: [0, -6.7, 0], fov: 28},
		{t: 30.2, pos: [0.3, -5.5, 9.0], target: [0, -5.8, 0], fov: 33},
		{t: 32.2, pos: [0.5, -5.0, 12.4], target: [0, -5.25, 0], fov: 35},
		{t: 33.3, pos: [0.9, -4.95, 12.6], target: [0, -5.2, 0], fov: 35},
	);
	ctx.lights.add(25.2, LIGHTS.tree);
};
