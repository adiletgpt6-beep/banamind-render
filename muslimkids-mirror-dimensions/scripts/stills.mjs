// Контрольные кадры из настоящего рендера: node scripts/stills.mjs [scale] [сек1 сек2 ...]
// По умолчанию — контрольные точки из ТЗ (00:02, 00:05, … 00:59).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const scale = Number(args[0] ?? 0.5);
const secs = args.length > 1 ? args.slice(1).map(Number) : [2, 5, 10, 14, 19, 22, 27, 31, 38, 43, 49, 57, 59];
const outDir = path.resolve(process.env.STILLS_DIR ?? (scale >= 1 ? "output/control-frames" : "output/previews"));
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? null,
  chromiumOptions: { gl: "swangle" },
});
const composition = await selectComposition({ serveUrl, id: "MuslimKidsMirrorDimensions010", puppeteerInstance: browser });
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const name = `t${String(s.toFixed(1)).padStart(4, "0")}s_f${frame}.jpg`;
  const t0 = Date.now();
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: path.join(outDir, name),
    imageFormat: "jpeg",
    jpegQuality: 90,
    scale,
    puppeteerInstance: browser,
    chromiumOptions: { gl: "swangle" },
    timeoutInMilliseconds: 240000,
    onBrowserLog: (l) => { if (l.type === "error" || l.type === "warning") console.log("[browser]", l.type, l.text.slice(0, 400)); },
  });
  console.log(`${name}  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
await browser.close({ silent: true });
