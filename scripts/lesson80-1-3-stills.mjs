// Контрольные кадры ролика 80-1-3 и его технических листов одним бандлом.
//   node scripts/lesson80-1-3-stills.mjs <compositionId> <outDir> <frame|сек s>[,…] [--scale=0.5] [--entry=src/index.ts] [--props='{…}']
// Пример: node scripts/lesson80-1-3-stills.mjs Lesson80-1-3-WhatIfICantSee out/l3 0,12.5s,300
// --entry — свой входной файл (технический лист отдельно от всего проекта).
// Если Chrome Headless Shell не скачивается: REMOTION_BROWSER_EXECUTABLE=/путь/к/chrome
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [id, outDir, list] = process.argv.slice(2);
const opt = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const scale = opt("scale") ? Number(opt("scale")) : 0.5;
const entry = opt("entry") ?? "src/index.ts";
const inputProps = opt("props") ? JSON.parse(opt("props")) : {};
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve(entry), onProgress: () => undefined });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, logLevel: "error" });
const frames = list.split(",").map((s) => (s.endsWith("s") ? Math.round(Number(s.slice(0, -1)) * composition.fps) : Number(s)));
for (const frame of frames) {
  const output = path.join(outDir, `${String(frame).padStart(5, "0")}.png`);
  await renderStill({ composition, serveUrl, frame: Math.min(frame, composition.durationInFrames - 1), output, scale, inputProps, browserExecutable, logLevel: "error" });
  console.log(output);
}
