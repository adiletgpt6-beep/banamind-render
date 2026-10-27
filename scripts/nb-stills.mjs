// Контрольные кадры ролика BalaGoNoBackup (3D): один бандл и один браузер на
// все кадры — быстро для проверки постановки.
//   node scripts/nb-stills.mjs [--scale=0.5] [--out=out/frames-no-backup] 2.0 5.5 ...
// Без списка — кадры по всем сценам (начало, середина, конец).
// Бандл: build/ (npm run bundle); с --bundle — собирается заново.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { NB_VIDEO } from "../src/no-backup/script.ts";
import { NB_SHOTS } from "../src/no-backup/timeline.ts";

const args = process.argv.slice(2);
const opt = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const scale = Number(opt("scale", "0.5"));
const outDir = opt("out", "out/frames-no-backup");
const times = args.filter((a) => !a.startsWith("--")).map(Number);
const list = times.length
  ? times
  : NB_SHOTS.flatMap((s) => [s.from + 0.3, (s.from + s.to) / 2, s.to - 0.3]);

const serveUrl =
  args.includes("--bundle") || !existsSync("build/index.html")
    ? await bundle({ entryPoint: path.resolve("src/index.ts") })
    : path.resolve("build");
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const browser = await openBrowser("chrome", {
  browserExecutable,
  chromiumOptions: { gl: "swangle" },
});
const composition = await selectComposition({ serveUrl, id: NB_VIDEO.id, puppeteerInstance: browser, browserExecutable, chromiumOptions: { gl: "swangle" } });
mkdirSync(outDir, { recursive: true });
for (const t of list) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * NB_VIDEO.fps));
  const output = `${outDir}/t${t.toFixed(1).padStart(5, "0")}.jpeg`;
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, output, frame, scale, imageFormat: "jpeg", jpegQuality: 85, puppeteerInstance: browser, browserExecutable, chromiumOptions: { gl: "swangle" }, timeoutInMilliseconds: 120000 });
  console.log(`${output} (${((Date.now() - t0) / 1000).toFixed(1)} с)`);
}
await browser.close({ silent: true });
