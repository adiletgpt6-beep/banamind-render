// Финальный рендер: node scripts/render-final.mjs [--frames=0-1799] [--out=path] [--concurrency=2]
// → output/final/MuslimKids_LivingBook_003.mp4 (1080×1920, 30 fps, H.264 + AAC, faststart)
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const out = path.resolve(root, arg("out", "output/final/MuslimKids_LivingBook_003.mp4"));
const frames = arg("frames", null);
const concurrency = Number(arg("concurrency", 2));
mkdirSync(path.dirname(out), { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "MuslimKidsLivingBook003", browserExecutable, chromiumOptions });
const tmp = out.replace(/\.mp4$/, ".raw.mp4");
let last = -1;
const t0 = Date.now();
await renderMedia({
  serveUrl,
  composition,
  codec: "h264",
  audioCodec: "aac",
  audioBitrate: "192k",
  crf: 16,
  pixelFormat: "yuv420p",
  colorSpace: "bt709",
  imageFormat: "jpeg",
  jpegQuality: 95,
  outputLocation: tmp,
  concurrency,
  browserExecutable,
  chromiumOptions,
  timeoutInMilliseconds: 120000,
  frameRange: frames ? frames.split("-").map(Number) : null,
  onProgress: ({ renderedFrames, progress }) => {
    const p = Math.floor(progress * 100);
    if (p !== last && p % 2 === 0) {
      last = p;
      const el = (Date.now() - t0) / 1000;
      console.log(`${p}% · ${renderedFrames} кадров · ${el.toFixed(0)} c`);
    }
  },
});
// faststart без пересжатия — воспроизведение сразу по ссылке.
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-c", "copy", "-movflags", "+faststart", out]);
renameSync(tmp, tmp + ".bak");
console.log(`Готово: ${out} за ${((Date.now() - t0) / 60000).toFixed(1)} мин`);
