// Контрольные кадры BalaGoBG040: начало, 25 %, 50 %, 75 %, финал и
// середина каждой сцены (по шкале из фактической или оценочной озвучки).
//   node scripts/campaign50/bg-040/stills.mjs [--estimate] [--scale=0.5] [--sheet] [сек …]
// --estimate — черновые кадры без озвучки (оценочные тайминги);
// --sheet — дополнительно контактный лист out/frames-bg-040/sheet.png.
// Браузер: REMOTION_BROWSER_EXECUTABLE (если задан) — один на все кадры.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { BG40_VIDEO } from "../../../src/campaign50/bg-040/script.ts";
import { buildBg40Timeline, estimateBg40Manifest } from "../../../src/campaign50/bg-040/timing.ts";

const args = process.argv.slice(2);
const estimate = args.includes("--estimate");
const sheet = args.includes("--sheet");
const scale = Number(args.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? 1);
const manifestPath = join("public", BG40_VIDEO.voiceDir, "manifest.json");
const manifest = !estimate && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg40Manifest();
const tl = buildBg40Timeline(manifest);
const OUT = join("out", "frames-bg-040");
mkdirSync(OUT, { recursive: true });

const times = args.filter((a) => !a.startsWith("--")).map(Number);
const frames = new Map();
if (times.length) for (const t of times) frames.set(`t${t.toFixed(2)}`, Math.min(tl.frames - 1, Math.round(t * BG40_VIDEO.fps)));
else {
  [0, 0.25, 0.5, 0.75].forEach((p) => frames.set(`p${Math.round(p * 100)}`, Math.round(tl.frames * p)));
  frames.set("p100-final", tl.frames - 1);
  for (const s of tl.scenes) frames.set(`${s.id}-mid`, Math.round(((s.from + s.to) / 2) * BG40_VIDEO.fps));
}

const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const serveUrl = await bundle({ entryPoint: resolve("src/campaign50/bg-040/index.ts"), publicDir: resolve("public") });
const browser = await openBrowser("chrome", { browserExecutable });
const inputProps = { allowEstimate: estimate };
const composition = await selectComposition({ serveUrl, id: BG40_VIDEO.id, inputProps, puppeteerInstance: browser, browserExecutable });
const files = [];
for (const [name, frame] of [...frames].sort((a, b) => a[1] - b[1])) {
  const file = join(OUT, `${String(frame).padStart(5, "0")}-${name}.png`);
  await renderStill({ composition, serveUrl, output: file, frame, inputProps, scale, puppeteerInstance: browser, browserExecutable, overwrite: true });
  files.push(file);
  console.log(`✓ ${file}`);
}
await browser.close({ silent: true });
if (sheet && files.length) {
  const cols = Math.min(5, files.length);
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap((f) => ["-i", f]);
  const pad = Array.from({ length: cols * rows - files.length }, (_, i) => `color=c=white:s=${Math.round(1080 * scale)}x${Math.round(1920 * scale)}[pad${i}]`);
  const labels = files.map((_, i) => `[${i}:v]`).concat(pad.map((_, i) => `[pad${i}]`));
  const layout = Array.from({ length: cols * rows }, (_, i) => `${(i % cols) * Math.round(1080 * scale)}_${Math.floor(i / cols) * Math.round(1920 * scale)}`).join("|");
  const filter = `${pad.length ? pad.join(";") + ";" : ""}${labels.join("")}xstack=inputs=${cols * rows}:layout=${layout},scale=${Math.min(2400, cols * 480)}:-1`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-frames:v", "1", join(OUT, "sheet.png")]);
  console.log(`✓ ${join(OUT, "sheet.png")}`);
}
console.log(`Длительность: ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
