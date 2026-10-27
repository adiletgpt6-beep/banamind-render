// Контрольные кадры BalaGoBG013 → out/frames-bg-013/: 0 %, 25 %, 50 %,
// 75 %, финал; смысловые точки (хук → мамин день → вечер → рисунок и
// поступок мамы → карта и условия → CTA); начало/середина/конец сцен.
// Использует бандл точки входа BG-013 (build/bg-013/).
// REMOTION_BG013_ESTIMATE=1 — черновые кадры без озвучки.
// BG13_STILLS=префикс1,префикс2 — только выбранные кадры.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { BG13_VIDEO } from "../../../src/campaign50/bg-013/script.ts";
import { buildBg13Timeline, cueOf, estimateBg13Manifest, sceneOf, wordTime } from "../../../src/campaign50/bg-013/timing.ts";

const bundle = process.argv[2] ?? "build/bg-013";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-013/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifestPath = `public/${BG13_VIDEO.voiceDir}/manifest.json`;
const manifest = !process.env.REMOTION_BG013_ESTIMATE && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg13Manifest();
const tl = buildBg13Timeline(manifest);
const fps = BG13_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const S = (id) => sceneOf(tl, id);
const C = (id) => cueOf(tl, id);
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
shots.push({ name: "k1a-hook-clock", frame: F(S("hook").from + 1.0) });
shots.push({ name: "k1b-hook-legs", frame: F(S("hook").from + 1.5) });
shots.push({ name: "k1c-hook-reveal", frame: F(S("hook").to - 1.2) });
shots.push({ name: "k1d-hook-wipe", frame: F(S("hook").to + 0.3) });
shots.push({ name: "k2a-office-wave", frame: F(S("pickup").from + 0.6) });
shots.push({ name: "k2b-office-stand", frame: F(S("pickup").from + 1.9) });
shots.push({ name: "k2c-school-car", frame: F(wordTime(C("n01"), "баласын", 0.2) + 1.2) });
shots.push({ name: "k2d-school-belt", frame: F(wordTime(C("n01"), "баласын", 0.2) + 2.8) });
shots.push({ name: "k2e-home", frame: F(wordTime(C("n01"), "анан", 0.5) + 0.8) });
shots.push({ name: "k2f-work-lapse", frame: F(S("pickup").to - 0.4) });
shots.push({ name: "k3a-call", frame: F(S("evening").from + 1.5) });
shots.push({ name: "k3b-rub-eyes", frame: F(C("s02").from - 0.8) });
shots.push({ name: "k3c-son-asks", frame: F(C("s02").from + 0.8) });
shots.push({ name: "k3d-mom-answers", frame: F(C("m01").from + 1.0) });
shots.push({ name: "k4a-unfold", frame: F(S("drawing").from + 0.4) });
shots.push({ name: "k4b-arrows", frame: F(S("drawing").from + 2.2) });
shots.push({ name: "k4c-mom-traces", frame: F(C("m02").from + 1.4) });
shots.push({ name: "k4d-search", frame: F(C("m02").to + 2.3) });
shots.push({ name: "k4e-balago-page", frame: F(S("drawing").to - 0.3) });
shots.push({ name: "k5a-map-route", frame: F(wordTime(C("n02"), "сабактан", 0.45) + 0.8) });
shots.push({ name: "k5b-steps", frame: F(S("map").to - 0.5) });
shots.push({ name: "k6a-sun", frame: F(S("cta").from + 1.1) });
shots.push({ name: "k6b-iris", frame: F(S("cta").from + 1.9) });
shots.push({ name: "k6c-cta", frame: F(S("cta").from + 3) });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: F(s.from + 0.25) });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
});
shots.push({ name: "cta-last-word-plus-3s", frame: F(tl.cues[tl.cues.length - 1].to + 3) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const only = process.env.BG13_STILLS?.split(",");
const outDir = "out/frames-bg-013";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG13_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
