// Контрольные кадры BalaGoBG005 → out/frames-bg-005/: 0 %, 25 %, 50 %,
// 75 %, финал; смысловые блоки и связующее действие; начало/середина/конец
// каждой сцены.
// Использует бандл точки входа BG-005 (build/bg-005/).
// REMOTION_BG005_ESTIMATE=1 — черновые кадры без озвучки.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bg05Beats } from "../../../src/campaign50/bg-005/beats.ts";
import { BG05_VIDEO } from "../../../src/campaign50/bg-005/script.ts";
import { buildBg05Timeline, estimateBg05Manifest } from "../../../src/campaign50/bg-005/timing.ts";

const bundle = process.argv[2] ?? "build/bg-005";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-005/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifestPath = `public/${BG05_VIDEO.voiceDir}/manifest.json`;
const manifest = !process.env.REMOTION_BG005_ESTIMATE && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg05Manifest();
const tl = buildBg05Timeline(manifest);
const b = bg05Beats(tl);
const fps = BG05_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
// смысловые блоки: хук (карта) → крюк и разорванный день → мама сравнивает
// пути и спрашивает → связующее действие (поиск, нажатие на BalaGo) →
// заявка → круг ҮЙ → МЕКТЕП → ҮЙ → группа → пробная поездка → CTA
shots.push({ name: "k1a-hook-tap", frame: F(b.hook.tap + 0.2) });
shots.push({ name: "k1b-hook-road", frame: F(b.hook.drawTo) });
shots.push({ name: "k2a-detour-pickup", frame: F(b.detour.pickup[0] + 0.2) });
shots.push({ name: "k2b-detour-split", frame: F(b.detour.leg3[1] - 0.3) });
shots.push({ name: "k3a-compare-cards", frame: F(b.compare.speak - 0.2) });
shots.push({ name: "k3b-mom-asks", frame: F((b.compare.speak + b.compare.speakTo) / 2) });
shots.push({ name: "k3c-phone-search", frame: F(b.compare.typeTo) });
shots.push({ name: "k3d-tap-balago", frame: F(b.compare.tap + 0.15) });
shots.push({ name: "k4a-form", frame: F(b.apply.fields[2] + 0.6) });
shots.push({ name: "k4b-send", frame: F(b.apply.send + 0.2) });
shots.push({ name: "k4c-loop", frame: F(b.apply.loopTo + 0.3) });
shots.push({ name: "k5a-group-homes", frame: F(b.group.converge + 0.6) });
shots.push({ name: "k5b-trial-free", frame: F(b.group.free + 0.5) });
shots.push({ name: "k6a-cta-straighten", frame: F(b.cta.from - 0.2) });
shots.push({ name: "k6b-cta", frame: F(b.cta.from + 1.5) });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: F(s.from + 0.25) });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
});
shots.push({ name: "cta-last-word-plus-3s", frame: F(tl.cues[tl.cues.length - 1].to + 3) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const only = process.env.BG05_STILLS?.split(",");
const outDir = "out/frames-bg-005";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG05_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
