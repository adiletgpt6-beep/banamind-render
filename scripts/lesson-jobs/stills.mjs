// Контрольные кадры фильма: середина каждой реплики выбранных сцен (или всех).
// node scripts/lesson-jobs/stills.mjs [h01,c05] [--scale=0.5] [--at=mid|end] → out/jobs-frames/*.jpg
// Один бандл и один браузер на все кадры.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { FPS, timeline } from "./lib.mjs";

const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2].split(",") : null;
const scale = Number(process.argv.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? "0.5");
const where = process.argv.find((a) => a.startsWith("--at="))?.split("=")[1] ?? "mid";
const tl = timeline();
mkdirSync("out/jobs-frames", { recursive: true });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  for (const ln of sc.lines) {
    const tt = where === "end" ? ln.speechTo - 0.05 : (ln.speechFrom + ln.speechTo) / 2;
    frames.push({ name: ln.id, f: Math.round(tt * FPS) });
  }
}
const serveUrl = await bundle({ entryPoint: path.resolve("src/lesson-jobs/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: "JobsLesson", puppeteerInstance: browser, browserExecutable });
for (const fr of frames) {
  await renderStill({ serveUrl, composition, frame: fr.f, output: `out/jobs-frames/${fr.name}.jpg`, imageFormat: "jpeg", scale, puppeteerInstance: browser, browserExecutable });
}
await browser.close({ silent: true });
console.log(`✓ кадров: ${frames.length}`);
