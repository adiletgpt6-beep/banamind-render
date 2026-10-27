// Раскадровки действий ролика 80-1-4 (одна сборка, композиция L80-1-4-Probe):
//   node scripts/lesson80-1-4-strips.mjs <strips.json> <outDir>
// strips.json: [{name, t0, t1, n, cam:{cx,cy,w}}]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
const [file, outDir] = process.argv.slice(2);
const strips = JSON.parse(readFileSync(file, "utf8"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => undefined });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
for (const s of strips) {
  const times = Array.from({ length: s.n }, (_, i) => s.t0 + ((s.t1 - s.t0) * i) / Math.max(1, s.n - 1));
  const inputProps = { manifest: null, times, cam: s.cam };
  const composition = await selectComposition({ serveUrl, id: "L80-1-4-Probe", inputProps, browserExecutable, logLevel: "error" });
  const dir = path.join(outDir, s.name);
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < s.n; i++) await renderStill({ composition, serveUrl, frame: i, output: path.join(dir, `${String(i).padStart(3, "0")}.png`), scale: s.scale ?? 0.25, inputProps, browserExecutable, logLevel: "error" });
  console.log(s.name, times.map((x) => x.toFixed(2)).join(" "));
}
