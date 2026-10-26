// Контрольные кадры из реальной анимации Remotion (те же кадры, что в фильме).
// node scripts/render-stills.mjs [preview|full] [кадры через запятую]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "preview";
const CHECK = [60, 150, 300, 420, 540, 660, 810, 930, 1140, 1260, 1470, 1710, 1770];
const frames = process.argv[3] ? process.argv[3].split(",").map(Number) : CHECK;
const id = mode === "full" ? "MuslimKidsThreadsOfWonder011" : "ThreadsOfWonderPreview";
const outDir = path.resolve(`output/previews/${mode}`);
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.BROWSER_EXECUTABLE ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "swangle" } });
const inputProps = { withAudio: false, lod: mode === "full" ? 1 : 0.7 };
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, puppeteerInstance: browser });
for (const frame of frames) {
  const t0 = Date.now();
  const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, frame, output, inputProps, browserExecutable, puppeteerInstance: browser, chromiumOptions: { gl: "swangle" }, timeoutInMilliseconds: 240000 });
  console.log(`кадр ${frame} (${(frame / 30).toFixed(2)} с) → ${output} за ${((Date.now() - t0) / 1000).toFixed(1)} с`);
}
await browser.close({ silent: true });
