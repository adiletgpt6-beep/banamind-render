// SandMorphEngine — the heart of Sand Universe.
//
// * States hold the per-grain target (indexed by persistent grain ID) for one
//   sand object; an optional per-group affine transform animates it over time
//   (Earth rotation, tree growth and sway, drifting stars).
// * assignGrains() maps shape points to grain IDs with a strip-sorted
//   rank matching (a cheap optimal-transport approximation), so neighbouring
//   grains travel together and trajectories rarely cross.
// * Transitions move every grain individually: own delay, own duration,
//   cubic-Hermite trajectory through optional flow waypoints, eased timing,
//   tumbling rotation, colour change and a damped settling bounce on landing.
// Everything is a pure function of time → any frame renders on its own.
import {clamp01, easeInOutCubic, hash1, smoothstep} from '../utils/random';
import type {GrainProps} from './SandGrainGenerator';
import type {ShapePoints} from '../geometry/types';

export type Mat = Float32Array; // 12 floats: 3x3 linear (column-major) + translation

export const identityMat = (): Mat => new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);

export const makeMat = (out: Mat, ax: number[], angle: number, scale: number, t: number[]) => {
	// Rotation about unit axis `ax` by `angle`, uniform scale, then translate.
	const [x, y, z] = ax;
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	const C = 1 - c;
	out[0] = (c + x * x * C) * scale;
	out[1] = (y * x * C + z * s) * scale;
	out[2] = (z * x * C - y * s) * scale;
	out[3] = (x * y * C - z * s) * scale;
	out[4] = (c + y * y * C) * scale;
	out[5] = (z * y * C + x * s) * scale;
	out[6] = (x * z * C + y * s) * scale;
	out[7] = (y * z * C - x * s) * scale;
	out[8] = (c + z * z * C) * scale;
	out[9] = t[0];
	out[10] = t[1];
	out[11] = t[2];
	return out;
};

/** Current key-light direction (unit, world), set by the engine every frame. */
export const LIGHT_DIR = new Float32Array([1, 0, 0]);
const NIGHT_FLOOR = 0.1;
/** Shading of a surface whose normal makes cosine d with the key light. */
export const radialShade = (d: number) => NIGHT_FLOOR + (1 - NIGHT_FLOOR) * smoothstep(-0.18, 0.5, d);

export type DynamicHook = (i: number, t: number, pos: Float32Array, misc: Float32Array) => void;

export class SandState {
	name: string;
	n: number;
	pos: Float32Array;
	col: Float32Array;
	size: Float32Array;
	glow: Float32Array;
	up: Float32Array;
	group: Uint8Array;
	order: Float32Array;
	groupCount: number;
	/** Per-group amount of macro self-shadowing (0 = none, 1 = full day/night). */
	shadow: Float32Array;
	xform: (t: number, g: number, out: Mat) => void;
	/** Optional per-grain displacement (tree sway) applied after xform. */
	displace?: (i: number, t: number, p: Float32Array) => void;
	/** Optional fully procedural state (the opening sand flow). */
	dynamic?: DynamicHook;
	dynamicShade?: (i: number, pos: Float32Array, t: number) => number;
	private mats: Mat[] = [];
	private matTime = NaN;

	constructor(name: string, n: number, groupCount = 1) {
		this.name = name;
		this.n = n;
		this.pos = new Float32Array(n * 3);
		this.col = new Float32Array(n * 3);
		this.size = new Float32Array(n).fill(1);
		this.glow = new Float32Array(n);
		this.up = new Float32Array(n * 3);
		this.group = new Uint8Array(n);
		this.order = new Float32Array(n);
		this.groupCount = groupCount;
		this.shadow = new Float32Array(groupCount);
		this.xform = (_t, _g, out) => out.set(identityMat());
		for (let g = 0; g < groupCount; g++) this.mats.push(identityMat());
	}

	/** Same grains, colours and shapes with an independent transform (new layout). */
	clone(name: string): SandState {
		const s = new SandState(name, this.n, this.groupCount);
		s.pos = this.pos;
		s.col = this.col;
		s.size = this.size;
		s.glow = this.glow;
		s.up = this.up;
		s.group = this.group;
		s.order = this.order;
		s.shadow = this.shadow.slice();
		return s;
	}

	prepare(t: number) {
		if (t === this.matTime) return;
		this.matTime = t;
		for (let g = 0; g < this.groupCount; g++) this.xform(t, g, this.mats[g]);
	}

	/** World position of grain i at time t (prepare(t) must have been called). */
	worldPos(i: number, t: number, out: Float32Array, misc: Float32Array) {
		misc[0] = 1;
		misc[1] = 0;
		if (this.dynamic) {
			this.dynamic(i, t, out, misc);
			return;
		}
		const m = this.mats[this.group[i]];
		const x = this.pos[i * 3];
		const y = this.pos[i * 3 + 1];
		const z = this.pos[i * 3 + 2];
		out[0] = m[0] * x + m[3] * y + m[6] * z + m[9];
		out[1] = m[1] * x + m[4] * y + m[7] * z + m[10];
		out[2] = m[2] * x + m[5] * y + m[8] * z + m[11];
		if (this.displace) this.displace(i, t, out);
	}

	/**
	 * Macro shading: each grain is lit by its own facets, but the object as a
	 * whole must still show light and shadow (night side of the Earth, shady
	 * slopes). Grains whose surface normal faces away from the key light are
	 * darkened as if shadowed by the sand mass around them.
	 */
	shade(i: number, pos: Float32Array, t: number) {
		if (this.dynamic) return this.dynamicShade ? this.dynamicShade(i, pos, t) : 1;
		const amt = this.shadow[this.group[i]];
		if (amt === 0) return 1;
		this.worldUp(i, SH_UP);
		const d = SH_UP[0] * LIGHT_DIR[0] + SH_UP[1] * LIGHT_DIR[1] + SH_UP[2] * LIGHT_DIR[2];
		return 1 - amt * (1 - radialShade(d));
	}

	worldUp(i: number, out: Float32Array) {
		const m = this.mats[this.group[i]];
		const x = this.up[i * 3];
		const y = this.up[i * 3 + 1];
		const z = this.up[i * 3 + 2];
		out[0] = m[0] * x + m[3] * y + m[6] * z;
		out[1] = m[1] * x + m[4] * y + m[7] * z;
		out[2] = m[2] * x + m[5] * y + m[8] * z;
		const l = Math.hypot(out[0], out[1], out[2]) || 1;
		out[0] /= l;
		out[1] /= l;
		out[2] /= l;
	}
}

export type KeyFn = (x: number, y: number, z: number, i: number) => [number, number];

/**
 * Map shape points to grains. Grains (by their previous world position) and
 * points are both split into equal-count strips along key[0] and matched by
 * rank of key[1] inside each strip. Returns pointIndex for every grain.
 */
export const assignGrains = (
	grainPos: Float32Array,
	grainIds: Int32Array,
	points: ShapePoints,
	pointIds: Int32Array,
	keyGrain: KeyFn,
	keyPoint: KeyFn,
	strips: number,
	out: Int32Array,
) => {
	const n = grainIds.length;
	if (pointIds.length !== n) throw new Error(`assign: ${n} grains vs ${pointIds.length} points`);
	const kg = grainIds.length ? Array.from(grainIds, (g) => keyGrain(grainPos[g * 3], grainPos[g * 3 + 1], grainPos[g * 3 + 2], g)) : [];
	const kp = Array.from(pointIds, (p) => keyPoint(points.pos[p * 3], points.pos[p * 3 + 1], points.pos[p * 3 + 2], p));
	const og = Array.from({length: n}, (_, i) => i).sort((a, b) => kg[a][0] - kg[b][0]);
	const op = Array.from({length: n}, (_, i) => i).sort((a, b) => kp[a][0] - kp[b][0]);
	for (let s = 0; s < strips; s++) {
		const a = Math.floor((s * n) / strips);
		const b = Math.floor(((s + 1) * n) / strips);
		const sg = og.slice(a, b).sort((p, q) => kg[p][1] - kg[q][1]);
		const sp = op.slice(a, b).sort((p, q) => kp[p][1] - kp[q][1]);
		for (let j = 0; j < sg.length; j++) out[grainIds[sg[j]]] = pointIds[sp[j]];
	}
};

/** Fill a state's arrays from shape points using an assignment, mixing paint with each grain's natural mineral tint. */
export const fillState = (state: SandState, shape: ShapePoints, grainToPoint: Int32Array, grains: GrainProps, grainIds?: Int32Array) => {
	const ids = grainIds ?? Int32Array.from({length: state.n}, (_, i) => i);
	for (const g of ids) {
		const p = grainToPoint[g];
		state.pos.set(shape.pos.subarray(p * 3, p * 3 + 3), g * 3);
		state.up.set(shape.up.subarray(p * 3, p * 3 + 3), g * 3);
		const w = shape.paint[p];
		for (let c = 0; c < 3; c++) state.col[g * 3 + c] = grains.natural[g * 3 + c] * (1 - w) + shape.col[p * 3 + c] * w * (0.88 + 0.24 * (grains.shade[g] - 0.9) * 5) * 1.0;
		state.size[g] = shape.size[p];
		state.glow[g] = shape.glow[p];
		state.order[g] = shape.order[p];
		state.group[g] = shape.group[p];
	}
};

export type TransitionSpec = {
	name: string;
	from: SandState;
	to: SandState;
	t0: number;
	delay: Float32Array; // seconds after t0
	dur: Float32Array; // flight seconds
	colorDelay?: Float32Array; // seconds after t0 (default: mid-flight)
	colorDur?: number;
	depart: Float32Array; // N*3 start tangent (Bezier handle, world units)
	arrive: Float32Array; // N*3 end handle offset from target (world units)
	way1?: Float32Array; // N*3 optional flow waypoint
	way2?: Float32Array;
	spin: number; // max tumble (radians) during flight
	settle: number; // landing bounce amplitude (in grain radii)
	settleDir?: 'up' | 'gravity';
};

const SH_UP = new Float32Array(3);
const P0 = new Float32Array(3);
const P3 = new Float32Array(3);
const UP = new Float32Array(3);
const MISC_A = new Float32Array(2);
const MISC_B = new Float32Array(2);

const hermite = (p0: number, m0: number, p1: number, m1: number, s: number) => {
	const s2 = s * s;
	const s3 = s2 * s;
	return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
};

export type GrainSample = {pos: Float32Array; col: Float32Array; size: number; glow: number; spin: number; extraAngle: number; shade: number};

export class SandTransition {
	spec: TransitionSpec;
	spinAmt: Float32Array;
	end: number;
	constructor(spec: TransitionSpec, index: number) {
		this.spec = spec;
		const n = spec.from.n;
		this.spinAmt = new Float32Array(n);
		let end = spec.t0;
		for (let i = 0; i < n; i++) {
			this.spinAmt[i] = (hash1(i, 100 + index) * 2 - 1) * spec.spin;
			end = Math.max(end, spec.t0 + spec.delay[i] + spec.dur[i]);
		}
		this.end = end;
	}

	progress(i: number, t: number) {
		const s = this.spec;
		return (t - s.t0 - s.delay[i]) / s.dur[i];
	}

	/** Evaluate grain i at time t into out; u = raw progress (may be >1). */
	evaluate(i: number, t: number, u: number, out: GrainSample) {
		const s = this.spec;
		const A = s.from;
		const B = s.to;
		A.prepare(t);
		B.prepare(t);
		const uc = clamp01(u);
		// Per-grain easing variety: some grains accelerate harder than others.
		const e = easeInOutCubic(uc);
		const pos = out.pos;
		if (uc >= 1) {
			B.worldPos(i, t, pos, MISC_B);
			const tau = t - (s.t0 + s.delay[i] + s.dur[i]);
			if (s.settle > 0 && tau < 0.9) {
				if (s.settleDir === 'gravity') {
					UP[0] = 0;
					UP[1] = 1;
					UP[2] = 0;
				} else B.worldUp(i, UP);
				const amp = s.settle * 0.028 * Math.exp(-6 * tau) * Math.sin(15 * tau) * (0.6 + hash1(i, 7));
				pos[0] -= UP[0] * amp;
				pos[1] -= UP[1] * amp;
				pos[2] -= UP[2] * amp;
			}
			out.size = B.size[i] * MISC_B[0];
			out.glow = B.glow[i];
			out.extraAngle = MISC_B[1];
			out.shade = B.shade(i, pos, t);
		} else {
			A.worldPos(i, t, P0, MISC_A);
			B.worldPos(i, t, P3, MISC_B);
			const d = s.depart;
			const a = s.arrive;
			const i3 = i * 3;
			if (!s.way1) {
				for (let c = 0; c < 3; c++) {
					const p1 = P0[c] + d[i3 + c];
					const p2 = P3[c] + a[i3 + c];
					const m = 1 - e;
					pos[c] = m * m * m * P0[c] + 3 * m * m * e * p1 + 3 * m * e * e * p2 + e * e * e * P3[c];
				}
			} else {
				// Piecewise Hermite through flow waypoints; segment split by chord length.
				const w1 = s.way1;
				const w2 = s.way2;
				const pts = w2 ? 4 : 3;
				const L0 = Math.hypot(w1[i3] - P0[0], w1[i3 + 1] - P0[1], w1[i3 + 2] - P0[2]) + 1e-4;
				let L1: number;
				let L2 = 0;
				if (w2) {
					L1 = Math.hypot(w2[i3] - w1[i3], w2[i3 + 1] - w1[i3 + 1], w2[i3 + 2] - w1[i3 + 2]) + 1e-4;
					L2 = Math.hypot(P3[0] - w2[i3], P3[1] - w2[i3 + 1], P3[2] - w2[i3 + 2]) + 1e-4;
				} else L1 = Math.hypot(P3[0] - w1[i3], P3[1] - w1[i3 + 1], P3[2] - w1[i3 + 2]) + 1e-4;
				const Lt = L0 + L1 + L2;
				const e1 = L0 / Lt;
				const e2 = (L0 + L1) / Lt;
				for (let c = 0; c < 3; c++) {
					const q0 = P0[c];
					const q1 = w1[i3 + c];
					const q2 = w2 ? w2[i3 + c] : P3[c];
					const q3 = P3[c];
					// Global-parameter derivatives at interior points (Catmull-Rom).
					const g1 = (q2 - q0) / e2;
					const g2 = pts === 4 ? (q3 - q1) / (1 - e1) : 0;
					if (e <= e1) {
						const sl = e / e1;
						pos[c] = hermite(q0, 3 * d[i3 + c], q1, g1 * e1, sl);
					} else if (pts === 3) {
						const sl = (e - e1) / (1 - e1);
						pos[c] = hermite(q1, g1 * (1 - e1), q3, -3 * a[i3 + c], sl);
					} else if (e <= e2) {
						const sl = (e - e1) / (e2 - e1);
						pos[c] = hermite(q1, g1 * (e2 - e1), q2, g2 * (e2 - e1), sl);
					} else {
						const sl = (e - e2) / (1 - e2);
						pos[c] = hermite(q2, g2 * (1 - e2), q3, -3 * a[i3 + c], sl);
					}
				}
			}
			const se = smoothstep(0, 1, e);
			out.size = (A.size[i] * MISC_A[0]) * (1 - se) + B.size[i] * MISC_B[0] * se;
			out.glow = A.glow[i] * (1 - se) + B.glow[i] * se;
			out.extraAngle = MISC_A[1] * (1 - se) + MISC_B[1] * se;
			// Free-flying grains catch the light; resting grains share their object's shading.
			const sh = A.shade(i, P0, t) * (1 - se) + B.shade(i, P3, t) * se;
			out.shade = sh + (1 - sh) * Math.sin(Math.PI * e) * 0.55;
		}
		// Colour timing is independent from motion (e.g. Earth: silhouette first, paint after).
		const cd = s.colorDelay ? s.colorDelay[i] : s.delay[i] + s.dur[i] * 0.3;
		const cdur = s.colorDur ?? s.dur[i] * 0.5;
		const cu = smoothstep(0, 1, (t - s.t0 - cd) / cdur);
		for (let c = 0; c < 3; c++) out.col[c] = A.col[i * 3 + c] * (1 - cu) + B.col[i * 3 + c] * cu;
		out.spin = this.spinAmt[i] * e;
	}
}
