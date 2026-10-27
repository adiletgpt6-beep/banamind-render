// Раскадровка действия ролика 80-1-4 при неподвижной камере (проверка движения):
//   node scripts/lesson80-1-4-probe.mjs <outDir> <t0> <t1> <n> <cx> <cy> <w> [--scale=0.5]
// Кадры — равномерно от t0 до t1 (секунды фильма), камера — окно в мире комнаты.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [outDir, t0, t1, n, cx, cy, w] = process.argv.slice(2);
const scaleArg = process.argv.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? Number(scaleArg.split("=")[1]) : 0.5;
const N = Number(n);
const times = Array.from({ length: N }, (_, i) => Number(t0) + ((Number(t1) - Number(t0)) * i) / Math.max(1, N - 1));
const inputProps = { manifest: null, times, cam: { cx: Number(cx), cy: Number(cy), w: Number(w) } };
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => undefined });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({ serveUrl, id: "L80-1-4-Probe", inputProps, browserExecutable, logLevel: "error" });
for (let i = 0; i < N; i++) {
  const output = path.join(outDir, `${String(i).padStart(3, "0")}.png`);
  await renderStill({ composition, serveUrl, frame: i, output, scale, inputProps, browserExecutable, logLevel: "error" });
}
console.log(times.map((x) => x.toFixed(2)).join(" "));
