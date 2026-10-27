// Контрольные кадры BG-012 → out/frames-bg-012/: 0 %, 25 %, 50 %, 75 %,
// финал, середина каждой сцены и ключевые моменты истории (хук, конфликт,
// поступок родителей, переход к BalaGo, условия, контакты).
// Бандл: npx remotion bundle src/campaign50/bg-012/index.ts --out-dir=build-bg-012
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { B12_VIDEO } from "../../../src/campaign50/bg-012/script.ts";
import { buildB12Timeline, estimateB12Manifest } from "../../../src/campaign50/bg-012/timing.ts";

const bundle = process.argv[2] ?? "build-bg-012";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/.`);
  process.exit(1);
}
const mf = `public/${B12_VIDEO.voiceDir}/manifest.json`;
const tl = buildB12Timeline(existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateB12Manifest());
const fps = B12_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const sc = (id) => tl.scenes.find((s) => s.id === id);
const cue = (id) => tl.cues.find((c) => c.id === id);
const shots = [
  { name: "p000", frame: 0 },
  { name: "p025", frame: Math.round(tl.frames * 0.25) },
  { name: "p050", frame: Math.round(tl.frames * 0.5) },
  { name: "p075", frame: Math.round(tl.frames * 0.75) },
  { name: "p100-final", frame: tl.frames - 1 },
  { name: "k1-hook", frame: F(cue("c01").from + 0.6) },
  { name: "k2-conflict-calendar", frame: F(cue("m01").from + 0.8) },
  { name: "k3-unnoticed", frame: F(sc("plans").to - 0.4) },
  { name: "k4-mom-notices", frame: F(cue("c02").to + 1.0) },
  { name: "k5-parents-act", frame: F(sc("turn").from + 2.8) },
  { name: "k6-balago-page", frame: F(sc("turn").to - 0.5) },
  { name: "k7-route", frame: F(cue("n02").to) },
  { name: "k8-terms", frame: F(cue("n03").to + 0.3) },
  { name: "k9-story", frame: F(cue("c03").from + 1.5) },
  { name: "k10-cta", frame: F(tl.ctaFrom + 3) },
];
tl.scenes.forEach((s, i) => shots.push({ name: `s${i + 1}-${s.id}-mid`, frame: F((s.from + s.to) / 2) }));
const outDir = "out/frames-bg-012";
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, B12_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
