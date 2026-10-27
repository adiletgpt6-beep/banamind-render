// Контрольные кадры BalaGoBG047: начало, 25 %, 50 %, 75 %, финал и ключевые
// моменты каждой сцены (по шкале из фактической или оценочной озвучки).
//   node scripts/campaign50/bg-047/stills.mjs [--estimate] [--scale=0.5] [сек …]
// --estimate — черновые кадры без озвучки (оценочные тайминги).
// Локально без скачанного Chrome: BG47_BROWSER=/путь/к/headless_shell.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BG47_VIDEO } from "../../../src/campaign50/bg-047/script.ts";
import { buildBg47Timeline, estimateBg47Manifest } from "../../../src/campaign50/bg-047/timing.ts";

const args = process.argv.slice(2);
const estimate = args.includes("--estimate");
const scale = Number(args.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? 1);
const outDir = args.find((a) => a.startsWith("--out="))?.split("=")[1] ?? join("out", "frames-bg-047");
const manifestPath = join("public", BG47_VIDEO.voiceDir, "manifest.json");
const manifest = !estimate && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg47Manifest();
const tl = buildBg47Timeline(manifest);
mkdirSync(outDir, { recursive: true });

const times = args.filter((a) => !a.startsWith("--")).map(Number);
const frames = new Map();
if (times.length) for (const t of times) frames.set(`t${t.toFixed(2)}`, Math.min(tl.frames - 1, Math.round(t * BG47_VIDEO.fps)));
else {
  [0, 0.25, 0.5, 0.75].forEach((p) => frames.set(`p${Math.round(p * 100)}`, Math.round(tl.frames * p)));
  frames.set("p100-final", tl.frames - 1);
  for (const s of tl.scenes) frames.set(`${s.id}-mid`, Math.round(((s.from + s.to) / 2) * BG47_VIDEO.fps));
}

const browser = process.env.BG47_BROWSER ? [`--browser-executable=${process.env.BG47_BROWSER}`] : [];
const bundle = join("out", "bundle-bg-047");
if (!process.env.BG47_REUSE_BUNDLE || !existsSync(bundle))
  execFileSync("npx", ["remotion", "bundle", "src/campaign50/bg-047/index.ts", "--out-dir", bundle, "--log=error"], { stdio: "inherit" });
const props = JSON.stringify({ allowEstimate: estimate });
for (const [name, frame] of frames) {
  const file = join(outDir, `${String(frame).padStart(5, "0")}-${name}.png`);
  execFileSync("npx", ["remotion", "still", bundle, BG47_VIDEO.id, file, `--frame=${frame}`, `--props=${props}`, `--scale=${scale}`, "--log=error", ...browser], { stdio: "inherit" });
  console.log(`✓ ${file}`);
}
console.log(`Длительность: ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
