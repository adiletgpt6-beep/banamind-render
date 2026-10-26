// SCENE 7 — WORDS OF THE QURAN (00:52–00:58)
// «Господь наш! Ты не сотворил это понапрасну». (3:191, part of the ayah,
// translation of meaning by E. Kuliev)
// Motion nearly stops. The four sand worlds glide calmly to the edges to free
// the centre for the quote, which is a separate, static, crisp text layer
// (see components/Typography.tsx) — never made of sand, never deformed.
import type {BuildContext} from '../engines/SandUniverseEngine';
import {LIGHTS} from '../engines/SandLightingSystem';
import {hash1} from '../utils/random';
import {GRAND_CAM, GRAND_LAYOUT, makeCompositionState, T_GRAND} from './Scene06GrandReveal';
import {GROUP} from '../geometry/composition';

export const T_QUOTE_LAYOUT = 51.9;
export const QUOTE_LAYOUT = {
	earth: [-2.2, 7.5, -0.4] as [number, number, number],
	mountains: [1.7, -4.0, -1.8] as [number, number, number],
	tree: [-1.7, -6.6, 1.4] as [number, number, number],
	stars: GRAND_CAM,
};

export const buildScene07 = (ctx: BuildContext) => {
	const {N} = ctx;
	const grand = ctx.states[ctx.states.length - 1];
	const quote = makeCompositionState('quote', grand, N, QUOTE_LAYOUT, T_GRAND);
	ctx.states.push(quote);
	const delay = new Float32Array(N);
	const dur = new Float32Array(N);
	const depart = new Float32Array(N * 3);
	const arrive = new Float32Array(N * 3);
	const keys = ['earth', 'mountains', 'tree', 'stars', 'tree'] as const;
	for (let i = 0; i < N; i++) {
		const g = grand.group[i];
		delay[i] = g === GROUP.stars ? 4 : 0.05 * g + hash1(i, 71) * 0.25;
		dur[i] = g === GROUP.stars ? 0.5 : 1.7;
		const a = GRAND_LAYOUT[keys[g]];
		const b = QUOTE_LAYOUT[keys[g]];
		// Whole objects drift together: handles along the displacement.
		for (let c = 0; c < 3; c++) {
			depart[i * 3 + c] = (b[c] - a[c]) * 0.3;
			arrive[i * 3 + c] = (a[c] - b[c]) * 0.3;
		}
	}
	ctx.specs.push({name: 'grand→quote', from: grand, to: quote, t0: T_QUOTE_LAYOUT, delay, dur, depart, arrive, spin: 0, settle: 0});
	ctx.camera.add({t: 53.6, pos: [0, 1.3, 26.9], target: [0, 1.15, 0], fov: 35}, {t: 57.6, pos: [0, 1.3, 27.2], target: [0, 1.15, 0], fov: 35});
	ctx.lights.add(53.2, LIGHTS.quote);
};
