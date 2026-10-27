// Покадровый контроль ролика 80-1-4: каждый N-й кадр фильма (или отрезка) в PNG.
//   node scripts/lesson80-1-4-frames.mjs <outDir> [--every=8] [--from=сек] [--to=сек] [--scale=0.5] [--lang=ky]
// Файлы называются по номеру кадра фильма: 00000.png, 00008.png, …
// Нужен для просмотра движений последовательностями кадров, а не отдельными стоп-кадрами.
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { PACK, positional } from "./lib/a4-lang.mjs";

const A4_VIDEO = PACK.video; // --lang=ky — кыргызская версия
const outDir = positional()[0];
if (!outDir) throw new Error("укажите папку для кадров");
const arg = (name, def) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? Number(a.split("=")[1]) : def;
};
const every = arg("every", 8);
const scale = arg("scale", 0.5);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => undefined });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({ serveUrl, id: A4_VIDEO.id, browserExecutable, logLevel: "error" });
const fps = composition.fps;
const from = Math.max(0, Math.round(arg("from", 0) * fps));
const to = Math.min(composition.durationInFrames - 1, Math.round(arg("to", composition.durationInFrames / fps) * fps));
// начало отрезка выравнивается на шаг, чтобы номера кадров совпадали между запусками
const start = Math.ceil(from / every) * every;
await renderFrames({
  composition,
  serveUrl,
  inputProps: composition.props,
  frameRange: [start, to],
  everyNthFrame: every,
  imageFormat: "png",
  scale,
  outputDir: outDir,
  concurrency: Math.max(1, Math.min(4, os.cpus().length)),
  browserExecutable,
  logLevel: "error",
  onStart: () => undefined,
  onFrameUpdate: () => undefined,
});
// renderFrames пишет element-<i>.png по порядку; переименовываем в номер кадра фильма
const files = readdirSync(outDir).filter((f) => /^element-\d+\.png$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
files.forEach((f, i) => {
  const frame = start + i * every;
  renameSync(path.join(outDir, f), path.join(outDir, `${String(frame).padStart(5, "0")}.png`));
});
console.log(`${files.length} кадров (${start}…${to}, шаг ${every}) → ${outDir}`);
