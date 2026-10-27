// Контрольные кадры урока: середина каждой реплики выбранных сцен (или всех) — один
// бандл Remotion на все кадры.
// node scripts/lesson-habits/stills.mjs [s01,s07] [--scale=0.5] [--at=0.5] → out/lesson-frames/*.jpg
// REMOTION_BROWSER_EXECUTABLE — путь к Chrome Headless Shell (если не скачивается сам).
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { FPS, timeline } from "./lib.mjs";

const args = process.argv.slice(2);
const only = args[0] && !args[0].startsWith("--") ? args[0].split(",") : null;
const opt = (name, def) => Number(args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? def);
const scale = opt("scale", 0.5);
const frac = opt("at", 0.5);
const tl = timeline();
mkdirSync("out/lesson-frames", { recursive: true });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  for (const ln of sc.lines) frames.push({ name: ln.id, f: Math.round((ln.speechFrom + (ln.speechTo - ln.speechFrom) * frac) * FPS) });
}
const serveUrl = await bundle({ entryPoint: "src/lesson-habits/index.ts" });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({ serveUrl, id: "HabitsLesson", browserExecutable });
for (const fr of frames) {
  await renderStill({ serveUrl, composition, frame: fr.f, output: `out/lesson-frames/${fr.name}.jpg`, imageFormat: "jpeg", jpegQuality: 85, scale, browserExecutable });
}
console.log(`✓ кадров: ${frames.length}`);
