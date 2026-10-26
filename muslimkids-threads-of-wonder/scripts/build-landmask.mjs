// Строит маску суши (1 = суша) по world-atlas land-50m: растеризация полигонов
// в равнопромежуточной проекции (even-odd scanline), сетка 0.5°.
// Результат: src/data/landmask.json  { w, h, rows: string[] } — строка на широту (север → юг).
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/land-50m.json", import.meta.url)));
const land = feature(topo, topo.objects.land);
const W = 720, H = 360;
const grid = Array.from({ length: H }, () => new Uint8Array(W));
const rings = [];
for (const f of land.features) {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const p of polys) for (const r of p) rings.push(r);
}
for (let y = 0; y < H; y++) {
  const lat = 90 - (y + 0.5) * (180 / H);
  const xs = [];
  for (const r of rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [x1, y1] = r[j], [x2, y2] = r[i];
      if ((y1 > lat) !== (y2 > lat) && Math.abs(x2 - x1) < 180) {
        xs.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
  }
  // even-odd по каждому кольцу эквивалентно по объединению при чётности пересечений
  xs.sort((a, b) => a - b);
  for (let k = 0; k + 1 < xs.length; k += 2) {
    const a = Math.ceil((xs[k] + 180) / 0.5 - 0.5), b = Math.floor((xs[k + 1] + 180) / 0.5 - 0.5);
    for (let x = Math.max(0, a); x <= Math.min(W - 1, b); x++) grid[y][x] ^= 1;
  }
}
// Антарктида: в данных кольцо проходит по краю карты, заполняем южнее береговой линии
for (let x = 0; x < W; x++) { for (let y = H - 1; y > H - 40; y--) { if (grid[y][x]) break; grid[y][x] = 1; } }
const rows = grid.map((r) => Array.from(r).join(""));
writeFileSync(new URL("../src/data/landmask.json", import.meta.url), JSON.stringify({ w: W, h: H, rows }));
console.log("landmask", W, "x", H);
