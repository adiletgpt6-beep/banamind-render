// Контрольные кадры BG-017 → out/frames-bg-017/: 0 %, 25 %, 50 %, 75 %,
// финал, середина каждой сцены и ключевые моменты истории (клубок, неделя,
// повтор и решение родителей, поиск и касание, маршрут, условия, контакты).
// Бандл: npx remotion bundle src/campaign50/bg-017/index.ts --out-dir=build-bg-017
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { B17_VIDEO } from "../../../src/campaign50/bg-017/script.ts";
import { buildB17Timeline, estimateB17Manifest } from "../../../src/campaign50/bg-017/timing.ts";

const bundle = process.argv[2] ?? "build-bg-017";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/.`);
  process.exit(1);
}
const mf = `public/${B17_VIDEO.voiceDir}/manifest.json`;
const tl = buildB17Timeline(existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateB17Manifest());
const fps = B17_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const sc = (id) => tl.scenes.find((s) => s.id === id);
const cue = (id) => tl.cues.find((c) => c.id === id);
const shots = [
  { name: "p000", frame: 0 },
  { name: "p025", frame: Math.round(tl.frames * 0.25) },
  { name: "p050", frame: Math.round(tl.frames * 0.5) },
  { name: "p075", frame: Math.round(tl.frames * 0.75) },
  { name: "p100-final", frame: tl.frames - 1 },
  { name: "k1-hook-tangle", frame: F(sc("hook").from + 1.6) },
  { name: "k2-title", frame: F(cue("k01").to) },
  { name: "k3-week-wed-car", frame: F(sc("week").from + 0.5 + 2 * 2.25 + 1.0) },
  { name: "k4-mom-points", frame: F(cue("m01").from + 0.8) },
  { name: "k5-rows", frame: F(sc("notice").from + 3.2) },
  { name: "k6-circled-x5", frame: F(cue("n01").to + 0.2) },
  { name: "k7-question", frame: F(cue("n01b").to + 0.3) },
  { name: "k8-search-results", frame: F(cue("m02").from + 1.0) },
  { name: "k9-tap-straighten", frame: F(cue("m02").to + 1.0) },
  { name: "k10-route", frame: F(cue("n03").from) },
  { name: "k11-terms", frame: F(cue("n03b").to + 0.3) },
  { name: "k12-cta", frame: F(tl.ctaFrom + 3) },
];
tl.scenes.forEach((s, i) => shots.push({ name: `s${i + 1}-${s.id}-mid`, frame: F((s.from + s.to) / 2) }));
const outDir = "out/frames-bg-017";
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, B17_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
