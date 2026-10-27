// Контрольные кадры BalaGoBG027: начало, 25 %, 50 %, 75 %, финал и ключевые
// моменты каждой сцены (по шкале из фактической или оценочной озвучки).
//   node scripts/campaign50/bg-027/stills.mjs [--estimate] [--scale=0.5] [--no-bundle] [сек …]
// --estimate — черновые кадры без озвучки (оценочные тайминги).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BG27_VIDEO } from "../../../src/campaign50/bg-027/script.ts";
import { buildBg27Timeline, estimateBg27Manifest } from "../../../src/campaign50/bg-027/timing.ts";

const args = process.argv.slice(2);
const estimate = args.includes("--estimate");
const scale = Number(args.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? 1);
const manifestPath = join("public", BG27_VIDEO.voiceDir, "manifest.json");
const manifest = !estimate && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg27Manifest();
const tl = buildBg27Timeline(manifest);
const OUT = join("out", "frames-bg-027");
mkdirSync(OUT, { recursive: true });

const times = args.filter((a) => !a.startsWith("--")).map(Number);
const frames = new Map();
if (times.length) for (const t of times) frames.set(`t${t.toFixed(2)}`, Math.min(tl.frames - 1, Math.round(t * BG27_VIDEO.fps)));
else {
  [0, 0.25, 0.5, 0.75].forEach((p) => frames.set(`p${Math.round(p * 100)}`, Math.round(tl.frames * p)));
  frames.set("p100-final", tl.frames - 1);
  for (const s of tl.scenes) frames.set(`${s.id}-mid`, Math.round(((s.from + s.to) / 2) * BG27_VIDEO.fps));
}

const bundle = join("out", "bundle-bg-027");
if (!args.includes("--no-bundle") || !existsSync(bundle))
  execFileSync("npx", ["remotion", "bundle", "src/campaign50/bg-027/index.ts", "--out-dir", bundle, "--log=error"], { stdio: "inherit" });
const props = JSON.stringify({ allowEstimate: estimate });
// локально можно указать установленный Chromium (REMOTION_BROWSER=/путь)
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const [name, frame] of frames) {
  const file = join(OUT, `${String(frame).padStart(5, "0")}-${name}.png`);
  execFileSync("npx", ["remotion", "still", bundle, BG27_VIDEO.id, file, `--frame=${frame}`, `--props=${props}`, `--scale=${scale}`, "--log=error", ...browser], { stdio: "inherit" });
  console.log(`✓ ${file}`);
}
console.log(`Длительность: ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
