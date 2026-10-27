// Контрольные кадры BalaGoBG020 → out/frames-bg-020/: 0 %, 25 %, 50 %, 75 %,
// финал, а также начало/середина/конец каждой сцены и кадр каждой реплики.
//   node scripts/campaign50/bg-020/stills.mjs [--estimate] [--scale=0.5] [--only=name,...]
// --estimate — без озвучки (оценочные тайминги, только черновик).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { BG020_VIDEO } from "../../../src/campaign50/bg-020/script.ts";
import { buildBg020Timeline, estimateBg020Manifest } from "../../../src/campaign50/bg-020/timeline.ts";

const args = process.argv.slice(2);
const estimate = args.includes("--estimate");
const scale = args.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? "1";
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1]?.split(",");
const BUNDLE = "out/bundle-bg-020";
const manifestPath = `public/${BG020_VIDEO.voiceDir}/manifest.json`;
const manifest = !estimate && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg020Manifest();
const tl = buildBg020Timeline(manifest);
const fps = BG020_VIDEO.fps;
const N = tl.durationInFrames;

if (!existsSync(`${BUNDLE}/index.html`) || args.includes("--rebundle")) {
  execFileSync("npx", ["remotion", "bundle", "src/campaign50/bg-020/index.ts", `--out-dir=${BUNDLE}`, "--log=error"], { stdio: "inherit" });
}
const shots = [
  { name: "p000", frame: 0 },
  { name: "p025", frame: Math.round(N * 0.25) },
  { name: "p050", frame: Math.round(N * 0.5) },
  { name: "p075", frame: Math.round(N * 0.75) },
  { name: "p100-final", frame: N - 1 },
];
tl.scenes.forEach((s, i) => {
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `s${n}a-${s.id}`, frame: a + 8 });
  shots.push({ name: `s${n}b-${s.id}`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `s${n}c-${s.id}`, frame: b - 6 });
});
for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.6) * fps) });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const outDir = "out/frames-bg-020";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const props = JSON.stringify({ manifest: null, allowEstimate: estimate });
console.log(`Длительность: ${tl.durationSec.toFixed(2)} с (${N} кадров)${estimate ? " — ОЦЕНКА без озвучки" : ""}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.includes(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", BUNDLE, BG020_VIDEO.id, output, `--frame=${frame}`, `--scale=${scale}`, `--props=${props}`, "--log=error", ...browser], { stdio: "inherit" });
}
