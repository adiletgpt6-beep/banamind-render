// Контрольные кадры BalaGoBG023 → out/frames-bg-023/: начало, середина и конец
// каждой сцены, момент каждой реплики и последний кадр.
//   node scripts/campaign50/bg-023/stills.mjs [--silent] [--scale=0.5]
// --silent: черновые кадры без озвучки (оценочные тайминги).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { BG23_VIDEO, buildBg23Timeline } from "../../../src/campaign50/bg-023/script.ts";

const silent = process.argv.includes("--silent");
const scale = process.argv.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? "1";
const manifestPath = join("public", BG23_VIDEO.voiceDir, "manifest.json");
const manifest = !silent && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;
if (!silent && !manifest) {
  console.error("Нет озвучки — для черновых кадров используйте --silent");
  process.exit(1);
}
const tl = buildBg23Timeline(manifest);
const fps = BG23_VIDEO.fps;
const bundle = "out/bundle-bg-023";
execFileSync("npx", ["remotion", "bundle", "src/campaign50/bg-023/index.ts", `--out-dir=${bundle}`, "--log=error"], { stdio: "inherit" });

const shots = [];
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 10 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 4 });
});
for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.8) * fps) });
shots.push({ name: "999-last", frame: tl.durationInFrames - 1 });

const outDir = "out/frames-bg-023";
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const props = JSON.stringify({ allowSilent: silent });
console.log(`Длительность ${tl.durationSec} с (${tl.durationInFrames} кадров)${tl.estimated ? ", оценочные тайминги" : ""}`);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG23_VIDEO.id, output, `--frame=${frame}`, `--props=${props}`, `--scale=${scale}`, "--log=error", ...browser], { stdio: "inherit" });
}
