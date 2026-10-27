// Контрольные кадры ролика 80-1-2 (и тестовых композиций) одним бандлом.
//   node scripts/lesson80-1-2-stills.mjs <compositionId> <outDir> <frame|сек s>[,…] [--scale=0.5]
// Пример: node scripts/lesson80-1-2-stills.mjs Lesson80-1-2-WhatIsInsideApple out/l2 0,12.5s,300
// Если Chrome Headless Shell не скачивается: REMOTION_BROWSER_EXECUTABLE=/путь/к/chrome
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [id, outDir, list] = process.argv.slice(2);
const scaleArg = process.argv.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? Number(scaleArg.split("=")[1]) : 0.5;
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => undefined });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({ serveUrl, id, browserExecutable, logLevel: "error" });
const frames = list.split(",").map((s) => (s.endsWith("s") ? Math.round(Number(s.slice(0, -1)) * composition.fps) : Number(s)));
for (const frame of frames) {
  const output = path.join(outDir, `${String(frame).padStart(5, "0")}.png`);
  await renderStill({ composition, serveUrl, frame: Math.min(frame, composition.durationInFrames - 1), output, scale, browserExecutable, logLevel: "error" });
  console.log(output);
}
