// Natural Earth land polygons (public domain, via world-atlas) → plain JSON
// rings [[lon,lat],...] for the texture generator (scripts/make-textures.py).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(
  readFileSync("node_modules/world-atlas/land-50m.json", "utf8"),
);
const land = feature(topo, topo.objects.land);
const rings = [];
for (const f of land.features) {
  const polys =
    f.geometry.type === "Polygon"
      ? [f.geometry.coordinates]
      : f.geometry.coordinates;
  for (const poly of polys)
    poly.forEach((ring, i) => rings.push({ hole: i > 0, ring }));
}
mkdirSync("scripts/.cache", { recursive: true });
writeFileSync("scripts/.cache/land-rings.json", JSON.stringify(rings));
console.log(`rings: ${rings.length}`);
