// SCENE 1 — THE FIRST GRAIN (00:00–00:06)
// «Смотри внимательно. Всего одна песчинка. А что будет, если их станет тысячи?»
// Macro close-up of one grain; the camera pulls back exponentially (macro →
// world) while grains join one by one, then tens, hundreds, thousands. They
// stream in a two-armed spiral that finally curls into a spherical vortex.
import type {BuildContext} from '../engines/SandUniverseEngine';
import {LIGHTS} from '../engines/SandLightingSystem';
import {LIGHT_DIR, radialShade, SandState} from '../engines/SandMorphEngine';
import {gaussian, hash1, mulberry32, smoothstep} from '../utils/random';

/** Camera distance: slow macro drift, then a constant-rate (exponential) pull-back. */
export const introDistance = (t: number) => (t < 1 ? 0.3 + 0.05 * t : t < 5 ? 0.35 * Math.pow(60, (t - 1) / 4) : 21 + (t - 5) * 0.6);
const halfView = (t: number) => introDistance(t) * Math.tan((17.5 * Math.PI) / 180);
export const SWIRL_SPHERE_R = 3.0;
/** Grains below this ID form the spiral; the bulk flows straight into the sphere. */
const BULK = 7000;

export const birthTime = (i: number, N: number) => {
	if (i === 0) return 0;
	if (i === 1) return 1.25;
	if (i === 2) return 1.75;
	if (i < 15) return 2.15 + ((i - 3) / 12) * 0.6;
	if (i < 300) return 2.75 + ((i - 15) / 285) * 0.75;
	if (i < BULK) return 3.4 + Math.pow((i - 300) / (BULK - 300), 0.8) * 1.0;
	return 4.2 + ((i - BULK) / (N - BULK)) * 1.4;
};

export const buildScene01 = (ctx: BuildContext) => {
	const {N} = ctx;
	const st = new SandState('intro-flow', N, 1);
	st.col.set(ctx.grains.natural);
	const birth = new Float32Array(N);
	const travel = new Float32Array(N);
	const spawn = new Float32Array(N * 3);
	const frac = new Float32Array(N);
	const theta0 = new Float32Array(N);
	const omega = new Float32Array(N);
	const lift = new Float32Array(N);
	const sph = new Float32Array(N * 3);
	const sphR = new Float32Array(N);
	const rnd = mulberry32(606);
	const golden = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < N; i++) {
		birth[i] = birthTime(i, N);
		travel[i] = i < 15 ? 1.5 + rnd() * 0.4 : 1.0 + rnd() * 0.6;
		frac[i] = i === 1 ? 0.85 : i === 2 ? 0.95 : i < 15 ? 0.7 + rnd() * 0.3 : 0.12 + Math.pow(rnd(), 0.7) * 0.88;
		const arm = i % 2;
		theta0[i] = arm * Math.PI + 2.4 * Math.log(frac[i]) + gaussian(rnd) * 0.32;
		omega[i] = 0.55 / (Math.sqrt(frac[i]) + 0.3);
		lift[i] = gaussian(rnd);
		// Spawn just outside the frame at the moment of birth.
		const V = halfView(birth[i]);
		const a = i === 1 ? 0.2 : i === 2 ? Math.PI + 0.4 : rnd() * Math.PI * 2;
		const R = i >= BULK ? Math.max(V, SWIRL_SPHERE_R) * (1.7 + rnd() * 0.8) : V * (1.45 + rnd() * 0.5);
		spawn.set([Math.cos(a) * R, Math.sin(a) * R * 1.6, (rnd() - 0.6) * V * 1.5], i * 3);
		// Fibonacci direction from a scrambled index: births fill the sphere evenly.
		const j = (i * 48271) % N;
		const y = 1 - (2 * (j + 0.5)) / N;
		const rr = Math.sqrt(1 - y * y);
		// Jitter breaks the quasi-regular lattice (front/back moiré gaps).
		const jx = Math.cos(golden * j) * rr + gaussian(rnd) * 0.03;
		const jy = y + gaussian(rnd) * 0.03;
		const jz = Math.sin(golden * j) * rr + gaussian(rnd) * 0.03;
		const jl = Math.hypot(jx, jy, jz);
		sph.set([jx / jl, jy / jl, jz / jl], i * 3);
		sphR[i] = SWIRL_SPHERE_R * (1.06 + 0.16 * hash1(i, 3));
	}
	const tilt = 1.12;
	const ct = Math.cos(tilt);
	const stt = Math.sin(tilt);
	st.dynamic = (i, t, out, misc) => {
		if (i === 0) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
			misc[0] = 1;
			misc[1] = 0.32 * t;
			return;
		}
		const b = birth[i];
		if (t <= b) {
			out.set(spawn.subarray(i * 3, i * 3 + 3));
			misc[0] = 0;
			return;
		}
		// Spiral disk (tilted towards the camera).
		const L = Math.min(halfView(t) * 0.62, 3.3);
		const rho = frac[i] * L;
		const th = theta0[i] + omega[i] * (t - b);
		const dx = Math.cos(th) * rho;
		const dz = Math.sin(th) * rho;
		const dy = rho * 0.07 * lift[i] + 0.04 * L * Math.sin(th * 3 + i);
		let x = dx;
		let y = dy * ct - dz * stt;
		let z = dy * stt + dz * ct;
		// Curling into a sphere for the Earth (the bulk inflow goes there directly).
		const w = i >= BULK ? 1 : smoothstep(4.2, 5.9, t);
		if (w > 0) {
			const ang = 0.6 * t;
			const sx = sph[i * 3];
			const sy = sph[i * 3 + 1];
			const sz = sph[i * 3 + 2];
			const R = sphR[i];
			const qx = (sx * Math.cos(ang) + sz * Math.sin(ang)) * R;
			const qz = (-sx * Math.sin(ang) + sz * Math.cos(ang)) * R;
			x += (qx - x) * w;
			y += (sy * R - y) * w;
			z += (qz - z) * w;
		}
		const a = Math.min(1, (t - b) / travel[i]);
		const e = 1 - Math.pow(1 - a, 2.6);
		if (i < 15) {
			// The first grains glide in from the side along a gentle arc.
			const px = spawn[i * 3];
			const py = spawn[i * 3 + 1];
			const pz = spawn[i * 3 + 2];
			const arc = Math.sin(Math.PI * e) * 0.25;
			out[0] = px + (x - px) * e - (y - py) * arc;
			out[1] = py + (y - py) * e + (x - px) * arc;
			out[2] = pz + (z - pz) * e;
		} else {
			// Everyone else spirals in: organised inflow, never a random spray.
			const k = 1 - e;
			const swirl = k * (i >= BULK ? 2.4 : 1.5);
			const grow = 1 + (i >= BULK ? 1.5 : 1.3) * Math.pow(k, 1.4);
			const cs = Math.cos(swirl);
			const sn = Math.sin(swirl);
			out[0] = (x * cs + z * sn) * grow;
			out[1] = y * grow + (i >= BULK ? 0 : k * L * 0.15 * lift[i]);
			out[2] = (-x * sn + z * cs) * grow;
		}
		misc[0] = smoothstep(b, b + 0.25, t);
		misc[1] = 0.4 * (t - b) * (hash1(i, 9) - 0.5);
	};
	st.shadow.set([1]);
	st.dynamicShade = (_i, p, t) => {
		const w = smoothstep(4.6, 6.0, t);
		if (w === 0) return 1;
		const l = Math.hypot(p[0], p[1], p[2]) + 1e-6;
		return 1 - w * (1 - radialShade((p[0] * LIGHT_DIR[0] + p[1] * LIGHT_DIR[1] + p[2] * LIGHT_DIR[2]) / l));
	};
	ctx.states.push(st);

	// Camera: macro close-up → world, sampled from the exponential pull-back.
	for (let t = 0; t <= 6.0001; t += 0.5) {
		const d = introDistance(t);
		const drift = Math.min(1, t / 6);
		ctx.camera.add({t, pos: [d * 0.12 * drift, d * (0.06 + 0.04 * drift), d], target: [0, 0, 0], fov: 35});
	}
	ctx.lights.add(0, LIGHTS.macro);
};
