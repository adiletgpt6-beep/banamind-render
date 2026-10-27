// Контрольные кадры из настоящей композиции (тот же код, что и видео).
// node scripts/stills.mjs [кадр ...]  → output/previews/frame_XXXX.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
const BROWSER = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
import { resolve } from "node:path";

const frames = process.argv.slice(2).map(Number);
const list = frames.length ? frames : [60, 150, 300, 540, 660, 810, 930, 1170, 1470, 1710, 1770];
const browserExecutable = existsSync(BROWSER) ? BROWSER : undefined;
const serveUrl = await bundle({ entryPoint: resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, browserExecutable, id: "MuslimKidsInvisiblePainter005" });
mkdirSync("output/previews", { recursive: true });
const scale = Number(process.env.SCALE ?? 0.5);
for (const frame of list) {
  const t0 = Date.now();
  const output = `output/previews/frame_${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ serveUrl, browserExecutable, composition, frame, output, scale, imageFormat: "jpeg", jpegQuality: 88 });
  console.log(output, `${Date.now() - t0} ms`);
}
