// Tree target: a recursive branching skeleton (trunk → main branches →
// small twigs) with bark grains on every limb and leafy clusters of green
// grains forming the crown. A sand dune lies under the tree; the seed and
// the grains waiting to grow are hidden inside it.
import * as THREE from 'three';
import {clamp01, fbm3, gaussian, mulberry32} from '../utils/random';
import {allocShape, hexLinear, mixRgb, ShapePoints} from './types';

export type Segment = {a: THREE.Vector3; b: THREE.Vector3; ra: number; rb: number; o0: number; o1: number; depth: number};

export const DUNE = {radius: 5.4, height: 0.6, core: 2.7};
export const duneHeight = (x: number, z: number) => {
	const r = Math.hypot(x, z * 1.15);
	const mound = DUNE.height * Math.exp(-Math.pow(r / DUNE.core, 2));
	const ripples = 0.035 * Math.sin(x * 2.4 + Math.sin(z * 0.8) * 1.5) * clamp01(r / 1.5);
	return Math.max(0, mound + ripples + 0.05 * fbm3(x * 0.6, 0.3, z * 0.6, 2));
};
export const TREE_ROOT = new THREE.Vector3(0, DUNE.height - 0.04, 0);

export const buildSkeleton = (seed = 5) => {
	const rnd = mulberry32(seed);
	const segs: Segment[] = [];
	const tips: {p: THREE.Vector3; o: number; size: number}[] = [];
	const up = new THREE.Vector3(0, 1, 0);
	const grow = (a: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number, o: number) => {
		// Each limb is two slightly bent sub-segments for a natural silhouette.
		let p = a.clone();
		let d = dir.clone();
		const bend = new THREE.Vector3(gaussian(rnd), gaussian(rnd) * 0.3, gaussian(rnd)).multiplyScalar(0.12);
		const pieces = 2;
		let rr = r;
		let oo = o;
		for (let k = 0; k < pieces; k++) {
			d = d.clone().add(bend).add(up.clone().multiplyScalar(0.06)).normalize();
			const q = p.clone().add(d.clone().multiplyScalar(len / pieces));
			const rEnd = r * (1 - ((k + 1) / pieces) * 0.38);
			const oEnd = oo + len / pieces / 9.5;
			segs.push({a: p, b: q, ra: rr, rb: rEnd, o0: oo, o1: oEnd, depth});
			p = q;
			rr = rEnd;
			oo = oEnd;
		}
		if (depth >= 4) {
			tips.push({p, o: oo, size: 0.55 + rnd() * 0.25});
			return;
		}
		const kids = depth === 0 ? 4 : depth === 1 ? 3 : 2 + (rnd() < 0.5 ? 1 : 0);
		const base = rnd() * Math.PI * 2;
		for (let c = 0; c < kids; c++) {
			const az = base + (c / kids) * Math.PI * 2 + (rnd() - 0.5) * 0.7;
			const tilt = depth === 0 ? 0.62 + rnd() * 0.25 : 0.45 + rnd() * 0.35;
			const side = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
			const nd = d.clone().multiplyScalar(Math.cos(tilt)).add(side.multiplyScalar(Math.sin(tilt))).add(up.clone().multiplyScalar(0.22)).normalize();
			const nl = len * (depth === 0 ? 0.62 : 0.72) * (0.85 + rnd() * 0.3);
			grow(p, nd, nl, rr * 0.78, depth + 1, oo);
		}
		if (depth >= 2) tips.push({p, o: oo, size: 0.42 + rnd() * 0.2});
	};
	grow(TREE_ROOT.clone(), new THREE.Vector3(0.05, 1, 0).normalize(), 2.15, 0.2, 0, 0);
	return {segs, tips};
};

const BARK = [hexLinear(0x6e4f36), hexLinear(0x8b6a4a), hexLinear(0x5a3f2b), hexLinear(0x8b7056)];
const LEAF = [hexLinear(0x48a985), hexLinear(0x3c9474), hexLinear(0x5fbf8f), hexLinear(0x7cc79a), hexLinear(0x2f7d5c)];
const LEAF_WARM = hexLinear(0xa8c66c);
const SEED = [hexLinear(0xa87b4f), hexLinear(0xc9975e), hexLinear(0x8e6340)];

export type TreeShape = {
	tree: ShapePoints; // dune + trunk/branches + leaves (groups 0,1,2)
	waiting: Float32Array; // N*3 position of every point before it grows (dune interior or seed)
	waitingCol: Float32Array; // N*3 colour while waiting (seed colours; dune grains natural)
	waitingPaint: Float32Array;
	anchor: Float32Array; // N*3 skeleton point the grain flows through while growing
	nSeed: number;
	height: number;
	trunkTop: THREE.Vector3;
	depth: Uint8Array; // limb depth per point (0 = trunk), leaves 9
};

export const buildTree = (n: number, seed = 5): TreeShape => {
	const {segs, tips} = buildSkeleton(seed);
	const rnd = mulberry32(seed * 31 + 7);
	const s = allocShape(n);
	const waiting = new Float32Array(n * 3);
	const anchor = new Float32Array(n * 3);
	const depthArr = new Uint8Array(n).fill(9);
	const waitingCol = new Float32Array(n * 3);
	const waitingPaint = new Float32Array(n);
	const nBark = Math.round(n * 0.2);
	const nLeaf = Math.round(n * 0.29);
	const nDune = n - nBark - nLeaf;
	let k = 0;
	let maxO = 0;
	for (const sg of segs) maxO = Math.max(maxO, sg.o1);
	for (const t of tips) maxO = Math.max(maxO, t.o);
	// --- bark: grains per limb proportional to its lateral area ---
	const areas = segs.map((g) => (g.ra + g.rb) * g.a.distanceTo(g.b));
	const total = areas.reduce((a, b) => a + b, 0);
	const tmp = new THREE.Vector3();
	const ax = new THREE.Vector3();
	const u = new THREE.Vector3();
	const v = new THREE.Vector3();
	segs.forEach((g, gi) => {
		const cnt = gi === segs.length - 1 ? nBark - k : Math.round((areas[gi] / total) * nBark);
		ax.subVectors(g.b, g.a);
		const L = ax.length();
		ax.normalize();
		u.set(1, 0, 0).cross(ax);
		if (u.lengthSq() < 0.01) u.set(0, 0, 1).cross(ax);
		u.normalize();
		v.crossVectors(ax, u);
		for (let c = 0; c < cnt && k < nBark; c++) {
			const t = rnd();
			const phi = rnd() * Math.PI * 2;
			const r = (g.ra + (g.rb - g.ra) * t) * (rnd() < 0.8 ? 0.93 + rnd() * 0.07 : 0.4 + rnd() * 0.5);
			tmp.copy(g.a).addScaledVector(ax, t * L).addScaledVector(u, Math.cos(phi) * r).addScaledVector(v, Math.sin(phi) * r);
			s.pos.set([tmp.x, tmp.y, tmp.z], k * 3);
			const nx = u.x * Math.cos(phi) + v.x * Math.sin(phi);
			const ny = u.y * Math.cos(phi) + v.y * Math.sin(phi);
			const nz = u.z * Math.cos(phi) + v.z * Math.sin(phi);
			s.up.set([nx, ny, nz], k * 3);
			const c0 = mixRgb(BARK[Math.floor(rnd() * BARK.length)], BARK[1], 0.2 * fbm3(tmp.x * 6, tmp.y * 6, tmp.z * 6, 2));
			s.col.set(c0, k * 3);
			s.paint[k] = 0.86;
			s.order[k] = (g.o0 + (g.o1 - g.o0) * t) / maxO;
			s.size[k] = g.depth === 0 ? 1.05 : 0.95;
			s.group[k] = 1;
			depthArr[k] = g.depth;
			anchor.set([g.a.x + ax.x * t * L * 0.6, g.a.y + ax.y * t * L * 0.6, g.a.z + ax.z * t * L * 0.6], k * 3);
			k++;
		}
	});
	// --- leaves: clusters around twig tips, denser at the cluster shell ---
	const tipW = tips.map((t) => t.size ** 2);
	const tipTotal = tipW.reduce((a, b) => a + b, 0);
	tips.forEach((tp, ti) => {
		const cnt = ti === tips.length - 1 ? nBark + nLeaf - k : Math.round((tipW[ti] / tipTotal) * nLeaf);
		for (let c = 0; c < cnt && k < nBark + nLeaf; c++) {
			const d = new THREE.Vector3(gaussian(rnd), gaussian(rnd) * 0.8, gaussian(rnd)).normalize();
			const r = tp.size * (rnd() < 0.7 ? 0.8 + rnd() * 0.2 : Math.cbrt(rnd()) * 0.8);
			tmp.copy(tp.p).addScaledVector(d, r);
			tmp.y += 0.12;
			s.pos.set([tmp.x, tmp.y, tmp.z], k * 3);
			s.up.set([d.x, d.y, d.z], k * 3);
			const light = clamp01(0.5 + d.y * 0.5);
			let c0 = mixRgb(LEAF[Math.floor(rnd() * LEAF.length)], LEAF[3], light * 0.35);
			if (rnd() < 0.05) c0 = LEAF_WARM;
			s.col.set(c0, k * 3);
			s.paint[k] = 0.9;
			s.order[k] = Math.min(1, tp.o / maxO + 0.05 + rnd() * 0.12);
			s.size[k] = 0.95 + rnd() * 0.2;
			s.group[k] = 2;
			anchor.set([tp.p.x, tp.p.y, tp.p.z], k * 3);
			k++;
		}
	});
	// --- dune surface (natural sand) ---
	while (k < n) {
		const a = rnd() * Math.PI * 2;
		const r = DUNE.radius * Math.sqrt(rnd());
		const x = Math.cos(a) * r;
		const z = (Math.sin(a) * r) / 1.15;
		const sub = rnd() < 0.18;
		const y = duneHeight(x, z) - (sub ? 0.04 + rnd() * 0.08 : rnd() * 0.01);
		s.pos.set([x, y, z], k * 3);
		const e = 0.04;
		const gx = (duneHeight(x + e, z) - duneHeight(x - e, z)) / (2 * e);
		const gz = (duneHeight(x, z + e) - duneHeight(x, z - e)) / (2 * e);
		const nl = Math.hypot(gx, 1, gz);
		s.up.set([-gx / nl, 1 / nl, -gz / nl], k * 3);
		s.col.set([0, 0, 0], k * 3);
		s.paint[k] = sub ? 0.35 : 0; // subsurface grains slightly darker (painted black at 35%)
		s.order[k] = clamp01(r / DUNE.radius) * 0.8 + rnd() * 0.2;
		s.size[k] = 1;
		s.group[k] = 0;
		anchor.set([x, y, z], k * 3);
		k++;
	}
	// --- waiting positions: dune points stay; tree points wait inside the dune ---
	const treeIdx = Array.from({length: nBark + nLeaf}, (_, i) => i).sort((p, q) => s.order[p] - s.order[q]);
	const nSeed = 650;
	treeIdx.forEach((pi, rank) => {
		if (rank < nSeed) {
			// The seed: a small almond-shaped cluster resting on the dune top.
			const d = new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).normalize();
			const r = Math.cbrt(rnd());
			waiting.set([d.x * 0.17 * r, TREE_ROOT.y + 0.1 + d.y * 0.1 * r, d.z * 0.11 * r], pi * 3);
			waitingCol.set(SEED[rank % 3], pi * 3);
			waitingPaint[pi] = 0.85;
		} else {
			const a = rnd() * Math.PI * 2;
			const r = DUNE.core * 0.85 * Math.sqrt(rnd());
			const x = Math.cos(a) * r;
			const z = (Math.sin(a) * r) / 1.15;
			waiting.set([x, duneHeight(x, z) * (0.15 + rnd() * 0.65), z], pi * 3);
		}
	});
	for (let i = nBark + nLeaf; i < n; i++) {
		waiting.set(s.pos.subarray(i * 3, i * 3 + 3), i * 3);
		waitingPaint[i] = s.paint[i];
	}
	let height = 0;
	for (let i = 0; i < nBark + nLeaf; i++) height = Math.max(height, s.pos[i * 3 + 1]);
	let trunkTop = TREE_ROOT.clone();
	for (const g of segs) if (g.depth === 0) trunkTop = g.b.clone();
	return {tree: s, waiting, waitingCol, waitingPaint, anchor, nSeed, height, trunkTop, depth: depthArr};
};
export {SEED as SEED_COLORS, BARK as BARK_COLORS};
