// Контрольные кадры BalaGoBG039: начало, 25 %, 50 %, 75 %, финал и середина
// каждой сцены (по шкале из фактической или оценочной озвучки).
//   node scripts/campaign50/bg-039/stills.mjs [--estimate] [--scale=0.5] [--bundle=dir] [сек …]
// --estimate — черновые кадры без озвучки (оценочные тайминги).
// --bundle   — готовая сборка (иначе собирается в out/bundle-bg-039).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BG39_VIDEO } from "../../../src/campaign50/bg-039/script.ts";
import { buildBg39Timeline, estimateBg39Manifest } from "../../../src/campaign50/bg-039/timing.ts";

const args = process.argv.slice(2);
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const estimate = args.includes("--estimate");
const scale = Number(opt("scale") ?? 1);
const manifestPath = join("public", BG39_VIDEO.voiceDir, "manifest.json");
const manifest = !estimate && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg39Manifest();
const tl = buildBg39Timeline(manifest);
const OUT = join("out", "frames-bg-039");
mkdirSync(OUT, { recursive: true });

const times = args.filter((a) => !a.startsWith("--")).map(Number);
const frames = new Map();
if (times.length) for (const t of times) frames.set(`t${t.toFixed(2)}`, Math.min(tl.frames - 1, Math.round(t * BG39_VIDEO.fps)));
else {
  [0, 0.25, 0.5, 0.75].forEach((p) => frames.set(`p${Math.round(p * 100)}`, Math.round(tl.frames * p)));
  frames.set("p100-final", tl.frames - 1);
  for (const s of tl.scenes) frames.set(`${s.id}-mid`, Math.round(((s.from + s.to) / 2) * BG39_VIDEO.fps));
}

let bundle = opt("bundle");
if (!bundle) {
  bundle = join("out", "bundle-bg-039");
  execFileSync("npx", ["remotion", "bundle", "src/campaign50/bg-039/index.ts", "--out-dir", bundle, "--log=error"], { stdio: "inherit" });
}
const props = JSON.stringify({ allowEstimate: estimate });
// Локально (без доступа к загрузке Chrome) — свой браузер: REMOTION_BROWSER=/путь.
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const [name, frame] of frames) {
  const file = join(OUT, `${String(frame).padStart(5, "0")}-${name}.png`);
  execFileSync("npx", ["remotion", "still", bundle, BG39_VIDEO.id, file, `--frame=${frame}`, `--props=${props}`, `--scale=${scale}`, "--log=error", ...browser], { stdio: "inherit" });
  console.log(`✓ ${file}`);
}
console.log(`Длительность: ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
