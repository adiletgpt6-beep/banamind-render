// SandUniverseEngine — builds the whole film's sand choreography once
// (grains, shapes, assignments, transitions, camera, light) and evaluates any
// frame as a pure function of time into GPU-ready instance buffers.
import timeline from '../timeline.json';
import {buildScene01} from '../scenes/Scene01FirstGrain';
import {buildScene02} from '../scenes/Scene02Earth';
import {buildScene03} from '../scenes/Scene03Mountains';
import {buildScene04} from '../scenes/Scene04Tree';
import {buildScene05} from '../scenes/Scene05Cosmos';
import {buildScene06} from '../scenes/Scene06GrandReveal';
import {buildScene07} from '../scenes/Scene07Quran';
import {buildScene08} from '../scenes/Scene08Ending';
import {SandCameraController, CameraPose} from './SandCameraController';
import {generateGrains, GrainProps, GRAIN_TYPES} from './SandGrainGenerator';
import {SandLightingSystem, LightPreset} from './SandLightingSystem';
import {GrainSample, LIGHT_DIR, SandState, SandTransition, TransitionSpec} from './SandMorphEngine';

export const MACRO_GRAINS = 320; // grain IDs below this use the detailed LOD

export type BuildContext = {
	N: number;
	grains: GrainProps;
	mask: Uint8Array;
	states: SandState[];
	specs: TransitionSpec[];
	camera: SandCameraController;
	lights: SandLightingSystem;
	ids: Int32Array;
	/** World positions of every grain in `state` at time t. */
	snapshot: (state: SandState, t: number) => Float32Array;
};

export type MeshBuffers = {
	type: number;
	lod: 'macro' | 'mid';
	count: number;
	matrices: Float32Array;
	colors: Float32Array;
	glow: Float32Array;
};

export type FrameOutput = {
	camera: CameraPose;
	light: LightPreset;
	hero: {matrix: Float32Array; color: [number, number, number]; visible: boolean};
};

export class SandUniverseEngine {
	N: number;
	grains: GrainProps;
	ctx: BuildContext;
	transitions: SandTransition[] = [];
	cumSpin: Float32Array[] = [];
	meshes: MeshBuffers[] = [];
	meshOf: Uint8Array;
	localIndex: Int32Array;
	private sample: GrainSample = {pos: new Float32Array(3), col: new Float32Array(3), size: 1, glow: 0, spin: 0, extraAngle: 0, shade: 1};
	private heroMatrix = new Float32Array(16);
	private misc0 = new Float32Array(2);

	constructor(mask: Uint8Array, count = timeline.grains) {
		this.N = count;
		this.grains = generateGrains(count);
		const misc = new Float32Array(2);
		const ctx: BuildContext = {
			N: count,
			grains: this.grains,
			mask,
			states: [],
			specs: [],
			camera: new SandCameraController(),
			lights: new SandLightingSystem(),
			ids: Int32Array.from({length: count}, (_, i) => i),
			snapshot: (state, t) => {
				const out = new Float32Array(count * 3);
				const p = new Float32Array(3);
				state.prepare(t);
				for (let i = 0; i < count; i++) {
					state.worldPos(i, t, p, misc);
					out.set(p, i * 3);
				}
				return out;
			},
		};
		this.ctx = ctx;
		// Scene choreography, in story order. Each scene adds its states,
		// transitions, camera keys and light keys to the shared context.
		buildScene01(ctx);
		buildScene02(ctx);
		buildScene03(ctx);
		buildScene04(ctx);
		buildScene05(ctx);
		buildScene06(ctx);
		buildScene07(ctx);
		buildScene08(ctx);
		this.transitions = ctx.specs.map((s, k) => new SandTransition(s, k));
		// Tumble accumulates: completed transitions keep their final rotation.
		let acc = new Float32Array(count);
		for (const tr of this.transitions) {
			this.cumSpin.push(acc);
			const next = new Float32Array(count);
			for (let i = 0; i < count; i++) next[i] = acc[i] + tr.spinAmt[i];
			acc = next;
		}
		// Instanced mesh layout: 5 grain types × 2 LODs.
		this.meshOf = new Uint8Array(count);
		this.localIndex = new Int32Array(count);
		const counts = new Array(GRAIN_TYPES.length * 2).fill(0);
		for (let i = 0; i < count; i++) {
			const m = this.grains.type[i] * 2 + (i < MACRO_GRAINS ? 0 : 1);
			this.meshOf[i] = m;
			this.localIndex[i] = counts[m]++;
		}
		for (let m = 0; m < counts.length; m++) {
			this.meshes.push({
				type: m >> 1,
				lod: m % 2 === 0 ? 'macro' : 'mid',
				count: counts[m],
				matrices: new Float32Array(counts[m] * 16),
				colors: new Float32Array(counts[m] * 3),
				glow: new Float32Array(counts[m]),
			});
		}
	}

	get initialState() {
		return this.ctx.states[0];
	}

	/** Evaluate grain i at time t (into this.sample); returns tumble angle. */
	private evalGrain(i: number, t: number, active: number[]) {
		const s = this.sample;
		for (const k of active) {
			const tr = this.transitions[k];
			const u = tr.progress(i, t);
			if (u > 0) {
				tr.evaluate(i, t, u, s);
				return this.grains.angle0[i] + this.cumSpin[k][i] + s.spin + s.extraAngle;
			}
		}
		const st = this.initialState;
		const misc = this.misc0;
		st.prepare(t);
		st.worldPos(i, t, s.pos, misc);
		s.size = st.size[i] * misc[0];
		s.glow = st.glow[i];
		s.col.set(st.col.subarray(i * 3, i * 3 + 3));
		s.shade = st.shade(i, s.pos, t);
		return this.grains.angle0[i] + misc[1];
	}

	update(t: number): FrameOutput {
		const active: number[] = [];
		for (let k = this.transitions.length - 1; k >= 0; k--) if (this.transitions[k].spec.t0 <= t) active.push(k);
		const g = this.grains;
		const s = this.sample;
		const light = this.ctx.lights.at(t);
		const kl = Math.hypot(...light.keyDir);
		LIGHT_DIR.set([light.keyDir[0] / kl, light.keyDir[1] / kl, light.keyDir[2] / kl]);
		let heroVisible = true;
		for (let i = 0; i < this.N; i++) {
			const angle = this.evalGrain(i, t, active);
			const r = g.radius[i] * s.size;
			const ax = g.axis[i * 3];
			const ay = g.axis[i * 3 + 1];
			const az = g.axis[i * 3 + 2];
			const c = Math.cos(angle);
			const sn = Math.sin(angle);
			const C = 1 - c;
			const sx = r * g.aspect[i * 3];
			const sy = r * g.aspect[i * 3 + 1];
			const sz = r * g.aspect[i * 3 + 2];
			const mesh = this.meshes[this.meshOf[i]];
			const li = this.localIndex[i];
			const m = i === 0 ? this.heroMatrix : mesh.matrices;
			const o = i === 0 ? 0 : li * 16;
			m[o] = (c + ax * ax * C) * sx;
			m[o + 1] = (ay * ax * C + az * sn) * sx;
			m[o + 2] = (az * ax * C - ay * sn) * sx;
			m[o + 3] = 0;
			m[o + 4] = (ax * ay * C - az * sn) * sy;
			m[o + 5] = (c + ay * ay * C) * sy;
			m[o + 6] = (az * ay * C + ax * sn) * sy;
			m[o + 7] = 0;
			m[o + 8] = (ax * az * C + ay * sn) * sz;
			m[o + 9] = (ay * az * C - ax * sn) * sz;
			m[o + 10] = (c + az * az * C) * sz;
			m[o + 11] = 0;
			m[o + 12] = s.pos[0];
			m[o + 13] = s.pos[1];
			m[o + 14] = s.pos[2];
			m[o + 15] = 1;
			const sh = g.shade[i] * s.shade;
			if (i === 0) {
				// The hero grain is drawn by its own high-detail mesh; hide its instance.
				mesh.matrices.fill(0, li * 16, li * 16 + 16);
				heroVisible = r > 0;
				continue;
			}
			mesh.colors[li * 3] = s.col[0] * sh;
			mesh.colors[li * 3 + 1] = s.col[1] * sh;
			mesh.colors[li * 3 + 2] = s.col[2] * sh;
			mesh.glow[li] = s.glow * light.glow;
		}
		// Re-evaluate the hero colour (loop above skipped it).
		this.evalGrain(0, t, active);
		const hs = s.shade;
		return {
			camera: this.ctx.camera.pose(t),
			light,
			hero: {matrix: this.heroMatrix, color: [s.col[0] * hs, s.col[1] * hs, s.col[2] * hs], visible: heroVisible},
		};
	}
}
