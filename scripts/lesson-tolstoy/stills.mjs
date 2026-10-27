// Контрольные кадры фильма: середина каждой реплики выбранных сцен (или всех).
// node scripts/lesson-tolstoy/stills.mjs [h01,c05] [--scale=0.5] [--at=mid|end|scene] → out/tolstoy-frames/*.jpg
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
mkdirSync("out/tolstoy-frames", { recursive: true });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  // --at=scene: один кадр на сцену — конец речи последней реплики (все элементы схемы уже на месте)
  for (const ln of where === "scene" ? sc.lines.slice(-1) : sc.lines) {
    const tt = where === "end" || where === "scene" ? ln.speechTo - 0.05 : (ln.speechFrom + ln.speechTo) / 2;
    frames.push({ name: `${String(tl.scenes.indexOf(sc)).padStart(2, "0")}-${ln.id}`, f: Math.round(tt * FPS) });
  }
}
const serveUrl = await bundle({ entryPoint: path.resolve("src/lesson-tolstoy/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: "TolstoyLesson", puppeteerInstance: browser, browserExecutable });
for (const fr of frames) {
  await renderStill({ serveUrl, composition, frame: fr.f, output: `out/tolstoy-frames/${fr.name}.jpg`, imageFormat: "jpeg", scale, puppeteerInstance: browser, browserExecutable });
}
await browser.close({ silent: true });
console.log(`✓ кадров: ${frames.length}`);
