// Rasterises Natural Earth land polygons (world-atlas, 50m) into an
// equirectangular 1-byte-per-pixel mask used as the Earth colour map.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = require('world-atlas/land-50m.json');
const land = feature(topo, topo.objects.land);
const W = 1024;
const H = 512;
const mask = new Uint8Array(W * H);

// Even-odd scanline fill across all rings of all polygons.
const rings = [];
for (const f of land.features) {
	const g = f.geometry;
	const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
	for (const p of polys) for (const r of p) rings.push(r);
}
for (let y = 0; y < H; y++) {
	const lat = 90 - ((y + 0.5) / H) * 180;
	const xs = [];
	for (const r of rings) {
		for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
			const [x1, y1] = r[i];
			const [x2, y2] = r[j];
			if ((y1 > lat) !== (y2 > lat)) {
				const lon = x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1);
				xs.push(((lon + 180) / 360) * W);
			}
		}
	}
	xs.sort((a, b) => a - b);
	for (let k = 0; k + 1 < xs.length; k += 2) {
		const a = Math.max(0, Math.round(xs[k]));
		const b = Math.min(W, Math.round(xs[k + 1]));
		for (let x = a; x < b; x++) mask[y * W + x] = 1;
	}
}
// Antarctica row fill near the pole (polygon closes along the date line).
for (let y = H - 14; y < H; y++) for (let x = 0; x < W; x++) mask[y * W + x] = 1;

const out = path.resolve('public/assets/land-mask-1024x512.bin');
fs.writeFileSync(out, mask);
let n = 0;
for (const v of mask) n += v;
console.log('land fraction', (n / mask.length).toFixed(3), '->', out);
// Quick ASCII sanity preview
for (let y = 0; y < H; y += 32) {
	let s = '';
	for (let x = 0; x < W; x += 12) s += mask[y * W + x] ? '#' : '.';
	console.log(s);
}
