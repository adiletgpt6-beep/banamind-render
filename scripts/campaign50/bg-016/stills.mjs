// Контрольные кадры BalaGoBG016 → out/frames-bg-016/:
// 0 %, 25 %, 50 %, 75 %, финал; начало/середина/конец каждой сцены;
// середина каждой реплики. Без озвучки — с флагом --preview (оценка).
//   node scripts/campaign50/bg-016/stills.mjs [--preview] [--scale=0.5]
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { BG016_VIDEO } from "../../../src/campaign50/bg-016/script.ts";
import { browserArgs, BUNDLE, ENTRY, timeline } from "./common.mjs";

const preview = process.argv.includes("--preview");
const scale = process.argv.find((a) => a.startsWith("--scale="))?.slice(8) ?? "1";
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const tl = timeline(preview);
const fps = BG016_VIDEO.fps;
const last = tl.frames - 1;
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(last * p) }));
shots.push({ name: "pct-100-final", frame: last });
tl.scenes.forEach((s, i) => {
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 8 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 8 });
});
for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round(((c.from + c.to) / 2) * fps) });

execFileSync("npx", ["remotion", "bundle", ENTRY, `--out-dir=${BUNDLE}`, "--log=error"], { stdio: "inherit" });
const outDir = "out/frames-bg-016";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const props = JSON.stringify({ allowEstimate: preview });
for (const { name, frame } of shots) {
  if (only && !name.includes(only)) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", BUNDLE, BG016_VIDEO.id, output, `--frame=${frame}`, `--scale=${scale}`, `--props=${props}`, "--log=error", ...browserArgs()], { stdio: "inherit" });
}
console.log(`Кадров: ${shots.length}, длительность ${tl.durationSec.toFixed(2)} с${tl.estimated ? " (оценка без озвучки)" : ""}`);
