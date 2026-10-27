// Контрольные кадры BalaGoBG007 → out/frames-bg-007/: начало, середина и
// конец каждой сцены, момент каждой реплики, 0/25/50/75 % и последний кадр.
// Запуск: node scripts/campaign50/bg-007/stills.mjs [--voice] [кадр …]
//   --voice — требовать полную озвучку (как финальный рендер).
import { mkdirSync, readFileSync, existsSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BG7_VIDEO } from "../../../src/campaign50/bg-007/script.ts";
import { buildBg7Timeline, estimateBg7Manifest } from "../../../src/campaign50/bg-007/timing.ts";

const args = process.argv.slice(2);
const requireVoice = args.includes("--voice");
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const mf = `public/${BG7_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateBg7Manifest();
const tl = buildBg7Timeline(manifest);
const fps = BG7_VIDEO.fps;
const shots = [];
if (only.length) only.forEach((f) => shots.push({ name: `f${String(f).padStart(5, "0")}`, frame: f }));
else {
  tl.scenes.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 6 });
    shots.push({ name: `${n}b-${s.id}-mid`, frame: s.from + Math.round(s.frames / 2) });
    shots.push({ name: `${n}c-${s.id}-end`, frame: s.from + s.frames - 6 });
  });
  for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.6) * fps) });
  [0, 25, 50, 75].forEach((p) => shots.push({ name: `pct-${String(p).padStart(2, "0")}`, frame: Math.round(((tl.frames - 1) * p) / 100) }));
  shots.push({ name: "999-last", frame: tl.frames - 1 });
}
const outDir = "out/frames-bg-007";
if (!only.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/campaign50/bg-007/index.ts" });
const inputProps = { requireVoice };
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id: BG7_VIDEO.id, inputProps, browserExecutable });
console.log(`${composition.id}: ${composition.durationInFrames} кадров (${(composition.durationInFrames / fps).toFixed(2)} с)`);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl, composition, frame, output, inputProps, browserExecutable, scale: Number(process.env.STILL_SCALE ?? 1) });
  console.log(`→ ${frame} → ${output}`);
}
