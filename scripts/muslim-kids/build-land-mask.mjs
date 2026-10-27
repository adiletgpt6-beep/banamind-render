// Маска суши для Земли из частиц: сетка 1°×1° (360×180), бит = суша.
// Источник — Natural Earth 1:110m (пакет npm world-atlas, land-110m.json, public domain).
// TopoJSON декодируется без зависимостей; принадлежность точки — правило чёт/нечет.
//
// Запуск: node scripts/muslim-kids/build-land-mask.mjs path/to/land-110m.json
import { readFileSync, writeFileSync } from "node:fs";

const topo = JSON.parse(readFileSync(process.argv[2], "utf8"));
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
});
const ring = (ids) =>
  ids.flatMap((i, k) => {
    const pts = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
    return k === 0 ? pts : pts.slice(1);
  });
// кольца, пересекающие линию перемены дат (Фиджи, Чукотка), «разворачиваются»
// по долготе без скачка на 360°; точка проверяется со сдвигами ±360°
const unwrap = (r) => {
  const out = [r[0].slice()];
  for (let i = 1; i < r.length; i++) {
    let x = r[i][0];
    const px = out[i - 1][0];
    while (x - px > 180) x -= 360;
    while (px - x > 180) x += 360;
    out.push([x, r[i][1]]);
  }
  return out;
};
const rings = [];
for (const g of topo.objects.land.geometries) {
  const polys = g.type === "Polygon" ? [g.arcs] : g.arcs;
  for (const p of polys) for (const r of p) rings.push(unwrap(ring(r)));
}
const inRing = (r, lon, lat) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    )
      c = !c;
  }
  return c;
};
// Антарктида охватывает весь круг долгот — кольцо не замкнуто по площади;
// её проверяем отдельно: суша южнее береговой линии на этой долготе
const inside = (lon, lat) => {
  let c = false;
  for (const r of rings) {
    const span =
      Math.max(...r.map((p) => p[0])) - Math.min(...r.map((p) => p[0]));
    if (span >= 359) {
      if (
        lat < -55 &&
        inRing([...r, [r[r.length - 1][0], -90], [r[0][0], -90]], lon, lat)
      )
        c = !c;
      continue;
    }
    if (
      inRing(r, lon, lat) ||
      inRing(r, lon + 360, lat) ||
      inRing(r, lon - 360, lat)
    )
      c = !c;
  }
  return c;
};
const W = 360;
const H = 180;
const bytes = new Uint8Array((W * H) / 8);
let land = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // смещение 1e-6° — луч не проходит точно через вершины (иначе ложные полосы)
    const lat = 89.5 - y + 1.3e-6;
    const lon = -179.5 + x + 1.7e-6;
    // полигон Антарктиды в 110m обрывается у −85°: полюс — суша
    if (lat < -85 || inside(lon, lat)) {
      const i = y * W + x;
      bytes[i >> 3] |= 1 << (i & 7);
      land++;
    }
  }
}
const out = new URL("../../src/muslim-kids/lib/land-mask.ts", import.meta.url);
writeFileSync(
  out,
  `// Сгенерировано scripts/muslim-kids/build-land-mask.mjs из Natural Earth 1:110m.\n` +
    `// Сетка 360×180 (1°), строка 0 — широта 89.5° с.ш., столбец 0 — долгота 179.5° з.д.\n` +
    `export const LAND_W = ${W};\nexport const LAND_H = ${H};\n` +
    `export const LAND_MASK_B64 =\n  "${Buffer.from(bytes).toString("base64")}";\n`,
);
console.log(
  `суша: ${((land / (W * H)) * 100).toFixed(1)}% ячеек → ${out.pathname}`,
);
