// Контрольные кадры: node scripts/render-stills.mjs [секунды...] [--scale=0.5] [--out=dir]
// Без аргументов — 10 ключевых моментов из задания + промежуточные кадры переходов.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const scale = Number(args.find((a) => a.startsWith("--scale="))?.slice(8) ?? 0.5);
const out = args.find((a) => a.startsWith("--out="))?.slice(6) ?? join(ROOT, "output/keyframes");
const KEY = [2, 5, 10, 18, 27, 31, 38, 48, 56, 59];
const TRANSITIONS = [3.4, 7.2, 8.4, 9.6, 11, 22.8, 23.8, 24.6, 25.6, 29, 32, 33.6, 34.4, 36, 41, 42.4, 43.4, 45, 47, 53.2, 57.6];
const times = args.filter((a) => !a.startsWith("--")).map(Number);
const list = times.length ? times : [...KEY, ...TRANSITIONS].sort((a, b) => a - b);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.ts"), publicDir: join(ROOT, "public") });
const composition = await selectComposition({ serveUrl, id: "MuslimKidsGeometryWonders004", browserExecutable, chromiumOptions: { gl: "angle" } });
const files = [];
for (const s of list) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * 30));
  const name = `t${String(s.toFixed(1)).padStart(4, "0")}.jpg`;
  const file = join(out, name);
  await renderStill({ serveUrl, composition, frame, output: file, scale, imageFormat: "jpeg", jpegQuality: 88, browserExecutable, chromiumOptions: { gl: "angle" } });
  files.push(file);
  console.log(`${s}s → ${file}`);
}
// Лист кадров (контактный лист).
if (files.length > 1) {
  const cols = Math.min(6, files.length);
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...files.flatMap((f) => ["-i", f]),
    "-filter_complex", `${files.map((_, i) => `[${i}:v]scale=270:480[v${i}]`).join(";")};${files.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join("|")}:fill=black`,
    join(out, "contact-sheet.jpg")]);
}
