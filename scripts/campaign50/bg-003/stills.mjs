// Контрольные кадры BalaGoBG003 → out/frames-bg-003/: 0 %, 25 %, 50 %, 75 %,
// финал; смысловые блоки (хук → таймлапс → неделя → связующее действие:
// мама берёт телефон и ищет → BalaGo → шаги → CTA); начало/середина/конец
// каждой сцены. Использует бандл точки входа BG-003 (build/bg-003/).
// REMOTION_BG003_ESTIMATE=1 — черновые кадры без озвучки.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bg3Beats } from "../../../src/campaign50/bg-003/beats.ts";
import { BG3_VIDEO } from "../../../src/campaign50/bg-003/script.ts";
import { buildBg3Timeline, estimateBg3Manifest } from "../../../src/campaign50/bg-003/timing.ts";

const bundle = process.argv[2] ?? "build/bg-003";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-003/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifestPath = `public/${BG3_VIDEO.voiceDir}/manifest.json`;
const manifest = !process.env.REMOTION_BG003_ESTIMATE && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg3Manifest();
const tl = buildBg3Timeline(manifest);
const b = bg3Beats(tl);
const fps = BG3_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
shots.push({ name: "k1-hook-plate-to-hourglass", frame: F(b.hook.morph + 0.3) });
shots.push({ name: "k2a-drive-mom-exits-office", frame: F((b.drive.exit + b.drive.inCar) / 2) });
shots.push({ name: "k2b-drive-son-runs-to-car", frame: F(b.drive.kidIn - 0.4) });
shots.push({ name: "k2c-drive-granny-home", frame: F(b.drive.kidOut - 0.2) });
shots.push({ name: "k2d-drive-lunch-over", frame: F(b.drive.over + 0.3) });
shots.push({ name: "k3a-week-every-day", frame: F(b.week.more + 1.0) });
shots.push({ name: "k3b-week-mom-thinks", frame: F(b.week.think + 1.2) });
shots.push({ name: "k3c-LINK-mom-takes-phone", frame: F(b.week.phone + 0.9) });
shots.push({ name: "k4a-LINK-search-typing", frame: F(b.search.typed - 0.4) });
shots.push({ name: "k4b-search-results-tap", frame: F(b.search.tap) });
shots.push({ name: "k4c-old-way-on-map", frame: F(b.search.plan - 0.1) });
shots.push({ name: "k4d-one-planned-route", frame: F(b.search.back + 1.3) });
shots.push({ name: "k5-steps", frame: F(b.steps.s3 + 1.0) });
shots.push({ name: "k6-cta", frame: F(b.cta.from + 1.5) });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: F(s.from + 0.25) });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
});
shots.push({ name: "cta-last-word-plus-3s", frame: F(tl.cues[tl.cues.length - 1].to + 3) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const only = process.env.BG3_STILLS?.split(",");
const outDir = "out/frames-bg-003";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG3_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
