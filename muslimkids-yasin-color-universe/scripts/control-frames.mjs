// Контрольные кадры из настоящего рендера композиции (renderStill по одному бандлу).
// node scripts/control-frames.mjs [секунды...]  → output/frames/t_XX.XX.png + contact sheet
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const times = process.argv.slice(2).filter((a) => !a.startsWith("--")).map(Number);
const comp = process.argv.find((a) => a.startsWith("--comp="))?.slice(7) ?? "MuslimKidsYasinColorUniverse015";
const T = times.length ? times : [2, 5, 10, 13, 18, 27, 31, 34, 39, 44, 50, 54, 60, 68, 75, 79];
const out = path.resolve("output/frames");
mkdirSync(out, { recursive: true });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
const files = [];
for (const t of T) {
  const f = path.join(out, `t_${t.toFixed(2).padStart(5, "0")}.png`);
  await renderStill({ composition, serveUrl, output: f, frame: Math.min(composition.durationInFrames - 1, Math.round(t * 30)), browserExecutable });
  files.push(f);
  console.log("frame", t, "→", f);
}
const cols = Math.min(8, files.length);
execFileSync("ffmpeg", ["-v", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex",
  `${files.map((_, i) => `[${i}]scale=270:480,drawtext=text='${T[i]}s':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5[v${i}]`).join(";")};${files.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join("|")}:fill=black`,
  path.join(out, "sheet.png")]);
console.log("sheet:", path.join(out, "sheet.png"));
