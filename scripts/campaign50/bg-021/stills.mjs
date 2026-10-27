// Контрольные кадры BalaGoBG021 → out/frames-bg-021/: 0 %, 25 %, 50 %, 75 %,
// последний кадр, середина каждой сцены и ключевые моменты.
// Нужен бандл своей точки входа:
//   npx remotion bundle src/campaign50/bg-021/index.ts --out-dir=out/build-bg-021
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { BG021_VIDEO } from "../../../src/campaign50/bg-021/script.ts";
import { buildBg021Timeline } from "../../../src/campaign50/bg-021/timing.ts";

const BUNDLE = process.env.BG021_BUNDLE ?? "out/build-bg-021";
if (!existsSync(`${BUNDLE}/index.html`)) {
  console.error(`Нет бандла ${BUNDLE}/. Сначала: npx remotion bundle src/campaign50/bg-021/index.ts --out-dir=${BUNDLE}`);
  process.exit(1);
}
const manifestPath = `public/${BG021_VIDEO.voiceDir}/manifest.json`;
const tl = buildBg021Timeline(existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null);
const fps = BG021_VIDEO.fps;
const last = tl.totalFrames - 1;
const shots = [0.0, 0.25, 0.5, 0.75].map((p) => ({ name: `p${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * last) }));
tl.scenes.forEach((s, i) => shots.push({ name: `s${i + 1}-${s.id}-mid`, frame: Math.round(((s.from + s.to) / 2) * fps) }));
for (const s of tl.scenes) shots.push({ name: `s-${s.id}-end`, frame: Math.round(s.to * fps) - 4 });
shots.push({ name: "p100-last", frame: last });
const only = process.argv.slice(2);
const list = only.length ? shots.filter((s) => only.some((o) => s.name.includes(o))) : shots;

const outDir = "out/frames-bg-021";
if (!only.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
const scale = process.env.BG021_STILL_SCALE ? [`--scale=${process.env.BG021_STILL_SCALE}`] : [];
console.log(`Шкала: ${tl.totalSec.toFixed(2)} с, озвучка ${tl.voiced ? "полная" : "НЕТ (оценка)"}`);
for (const { name, frame } of list) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} (${(frame / fps).toFixed(2)} с) → ${output}`);
  execFileSync("npx", ["remotion", "still", BUNDLE, BG021_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...scale, ...browser], { stdio: "inherit" });
}
