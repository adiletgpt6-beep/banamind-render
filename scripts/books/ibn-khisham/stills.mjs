// Контрольные кадры фильма: по кадру в выбранный момент каждой сцены (или реплики),
// один бандл на все кадры. node scripts/books/ibn-khisham/stills.mjs [i01,a02] [--lines] [--scale=0.5]
// → out/bm002-frames/*.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { ENTRY, COMP, FPS, timeline } from "./lib.mjs";

const args = process.argv.slice(2);
const only = args[0] && !args[0].startsWith("--") ? args[0].split(",") : null;
const perLine = args.includes("--lines");
const scale = Number((args.find((a) => a.startsWith("--scale=")) ?? "--scale=0.5").split("=")[1]);
const tl = timeline();
const OUT = "out/bm002-frames";
mkdirSync(OUT, { recursive: true });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  if (perLine) for (const ln of sc.lines) frames.push({ name: ln.id, f: Math.round(((ln.speechFrom + ln.speechTo) / 2) * FPS) });
  else frames.push({ name: sc.id, f: Math.round((sc.lines[sc.lines.length - 1].speechTo - 0.3) * FPS) });
}
const serveUrl = await bundle({ entryPoint: ENTRY });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({ serveUrl, id: COMP, browserExecutable });
for (const fr of frames) {
  await renderStill({ serveUrl, composition, frame: fr.f, output: `${OUT}/${fr.name}.jpg`, imageFormat: "jpeg", jpegQuality: 85, scale, browserExecutable });
  process.stdout.write(`${fr.name} `);
}
console.log(`\n✓ кадров: ${frames.length} → ${OUT}`);
