// Экспорт контуров суши Natural Earth (world-atlas, public domain) в GeoJSON
// для процедурной текстуры Земли (scripts/make_textures.py).
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(readFileSync("node_modules/world-atlas/land-50m.json", "utf8"));
const land = feature(topo, topo.objects.land);
writeFileSync(process.argv[2] ?? "output/land-50m.geojson", JSON.stringify(land));
console.log("polygons:", land.features[0].geometry.coordinates.length);
