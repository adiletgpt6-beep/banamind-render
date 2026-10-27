// Контрольные кадры: node scripts/render-stills.mjs [секунды...] [--scale=0.5]
// По умолчанию — ключевые моменты из задания + середины перелистываний.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const scaleArg = args.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? Number(scaleArg.split("=")[1]) : 0.5;
const secs = args.filter((a) => !a.startsWith("--")).map(Number);
const DEFAULT = [2, 5, 10, 19, 29, 39, 49, 58, 3.2, 4.1, 14.75, 23.7, 34.4, 55.1, 56.9];
const list = secs.length ? secs : DEFAULT;
const out = path.join(root, "output/previews");
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "MuslimKidsLivingBook003", browserExecutable, chromiumOptions });
for (const s of list) {
  const frame = Math.min(Math.round(s * composition.fps), composition.durationInFrames - 1);
  const file = path.join(out, `frame_${String(s.toFixed(2)).padStart(5, "0")}s.jpg`);
  const t0 = Date.now();
  await renderStill({ serveUrl, composition, frame, output: file, imageFormat: "jpeg", jpegQuality: 90, scale, browserExecutable, chromiumOptions });
  console.log(`${s}s → ${path.relative(root, file)} (${Date.now() - t0} ms)`);
}
