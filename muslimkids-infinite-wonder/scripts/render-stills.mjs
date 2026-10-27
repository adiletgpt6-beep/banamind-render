// Контрольные кадры из настоящей анимации (не отдельные картинки).
// node scripts/render-stills.mjs [scale=0.5] [секунды...]
// По умолчанию — контрольные точки задания (раздел 23).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const scale = Number(args[0] ?? 0.5);
const secs = args.length > 1 ? args.slice(1).map(Number) : [2, 5, 9, 13, 18, 22, 28, 33, 39, 43, 47, 49, 51, 55, 59];
const out = path.resolve("output/frames");
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const inputProps = { withAudio: false };
const composition = await selectComposition({ serveUrl, id: "MuslimKidsInfiniteWonder013", inputProps, browserExecutable });
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const file = path.join(out, `f${String(frame).padStart(4, "0")}.jpg`);
  const t0 = Date.now();
  await renderStill({
    composition,
    serveUrl,
    frame,
    output: file,
    scale,
    inputProps,
    imageFormat: "jpeg",
    jpegQuality: 90,
    browserExecutable,
    chromiumOptions: { gl: "swangle" },
  });
  console.log(`✓ ${s}s (кадр ${frame}) — ${((Date.now() - t0) / 1000).toFixed(1)} с`);
}
