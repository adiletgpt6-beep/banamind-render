// Контрольные кадры BalaGoBG009 → out/frames-bg-009/: 0 %, 25 %, 50 %,
// 75 %, финал; смысловые блоки (хук → пять дней → повтор → связующий
// поступок субботы → BalaGo → условия → CTA); начало/середина/конец сцен.
// Использует бандл точки входа BG-009 (build/bg-009/).
// REMOTION_BG009_ESTIMATE=1 — черновые кадры без озвучки.
// BG9_STILLS=префикс1,префикс2 — только выбранные кадры.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { BG9_VIDEO } from "../../../src/campaign50/bg-009/script.ts";
import { buildBg9Timeline, cueOf, estimateBg9Manifest, sceneOf, wordTime } from "../../../src/campaign50/bg-009/timing.ts";

const bundle = process.argv[2] ?? "build/bg-009";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-009/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifestPath = `public/${BG9_VIDEO.voiceDir}/manifest.json`;
const manifest = !process.env.REMOTION_BG009_ESTIMATE && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg9Manifest();
const tl = buildBg9Timeline(manifest);
const fps = BG9_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const S = (id) => sceneOf(tl, id);
const C = (id) => cueOf(tl, id);
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
shots.push({ name: "k1-hook-question", frame: F(S("hook").to - 0.9) });
shots.push({ name: "k1b-door-zoom", frame: F(S("hook").to - 0.3) });
for (const id of ["mon", "tue", "wed", "thu", "fri"]) {
  shots.push({ name: `k2-${id}-door`, frame: F(S(id).from + 0.35) });
  shots.push({ name: `k2-${id}-chip`, frame: F(S(id).from + 1.4) });
  shots.push({ name: `k2-${id}-work`, frame: F(S(id).to - 0.3) });
}
shots.push({ name: "k3-repeat", frame: F(wordTime(C("n07"), "кайталанат", 0.8) + 0.8) });
shots.push({ name: "k4a-sat-look", frame: F(S("sat").from + 1.2) });
shots.push({ name: "k4b-sat-mom-speaks", frame: F(wordTime(C("m01"), "алдын", 0.6) + 0.5) });
shots.push({ name: "k4c-sat-form", frame: F(C("m01").to + 2.1) });
shots.push({ name: "k4d-sat-sent", frame: F(C("m01").to + 3.1) });
shots.push({ name: "k5-balago-line", frame: F(C("n08").to - 0.2) });
shots.push({ name: "k6a-route", frame: F(wordTime(C("n09"), "сабактан", 0.3) + 0.8) });
shots.push({ name: "k6b-steps", frame: F(C("n09").to + 0.6) });
shots.push({ name: "k7-cta", frame: F(S("cta").from + 1.5) });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: F(s.from + 0.25) });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
});
shots.push({ name: "cta-last-word-plus-3s", frame: F(tl.cues[tl.cues.length - 1].to + 3) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const only = process.env.BG9_STILLS?.split(",");
const outDir = "out/frames-bg-009";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG9_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
