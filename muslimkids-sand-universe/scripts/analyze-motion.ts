// Exports the sand-motion envelope that drives the sound design: for every
// video frame, how many grains are in flight, departing and landing.
// Run: npx tsx scripts/analyze-motion.ts  → public/audio/motion-envelope.json
import fs from 'node:fs';
import {SandUniverseEngine} from '../src/engines/SandUniverseEngine';
import timeline from '../src/timeline.json';
import {birthTime} from '../src/scenes/Scene01FirstGrain';

const mask = new Uint8Array(fs.readFileSync('public/assets/land-mask-1024x512.bin'));
const engine = new SandUniverseEngine(mask);
const F = timeline.durationInFrames;
const fps = timeline.fps;
const depart = new Float64Array(F);
const land = new Float64Array(F);
const flight = new Float64Array(F);
for (const tr of engine.transitions) {
	const s = tr.spec;
	for (let i = 0; i < engine.N; i++) {
		// Grains that do not move in a transition (same start and end) are silent.
		const a = s.t0 + s.delay[i];
		const b = a + s.dur[i];
		if (s.dur[i] <= 0.5) continue;
		const fa = Math.floor(a * fps);
		const fb = Math.floor(b * fps);
		if (fa >= 0 && fa < F) depart[fa]++;
		if (fb >= 0 && fb < F) land[fb]++;
		for (let f = Math.max(0, fa); f < Math.min(F, fb); f++) flight[f]++;
	}
}
// The opening flow: grains being born and spiralling in (~1.3 s each).
const N = engine.N;
for (let i = 1; i < N; i++) {
	const a = birthTime(i, N);
	const fa = Math.floor(a * fps);
	const fb = Math.min(F, Math.floor((a + 1.3) * fps));
	depart[fa]++;
	for (let f = fa; f < fb; f++) flight[f] += 0.6;
}
const out = {fps, frames: F, grains: N, flight: Array.from(flight, (v) => +(v / N).toFixed(4)), depart: Array.from(depart, (v) => +(v / N).toFixed(5)), land: Array.from(land, (v) => +(v / N).toFixed(5))};
fs.writeFileSync('public/audio/motion-envelope.json', JSON.stringify(out));
console.log('peak flight fraction', Math.max(...out.flight));
