// Контрольные кадры BalaGoBG004 → out/frames-bg-004/: 0 %, 25 %, 50 %,
// 75 %, финал; смысловые блоки и связующее действие; начало/середина/конец
// каждой сцены.
// Использует бандл точки входа BG-004 (build/bg-004/).
// REMOTION_BG004_ESTIMATE=1 — черновые кадры без озвучки.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bg04Beats } from "../../../src/campaign50/bg-004/beats.ts";
import { BG04_VIDEO } from "../../../src/campaign50/bg-004/script.ts";
import { buildBg04Timeline, estimateBg04Manifest } from "../../../src/campaign50/bg-004/timing.ts";

const bundle = process.argv[2] ?? "build/bg-004";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-004/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifestPath = `public/${BG04_VIDEO.voiceDir}/manifest.json`;
const manifest = !process.env.REMOTION_BG004_ESTIMATE && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg04Manifest();
const tl = buildBg04Timeline(manifest);
const b = bg04Beats(tl);
const fps = BG04_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
// смысловые блоки: хук → таблица дня → «күн сайын» → связующее действие
// (перенос маршрута) → BalaGo → полный круг и шаги → CTA
shots.push({ name: "k1-hook-calculator", frame: F(b.hook.equals) });
shots.push({ name: "k2-day-rows", frame: F(b.rows.sum + 0.9) });
shots.push({ name: "k3a-fill-week", frame: F((b.week.fillFrom + b.week.fillTo) / 2) });
shots.push({ name: "k3b-daily-selected", frame: F(b.week.daily + 0.6) });
shots.push({ name: "k4a-select-route", frame: F(b.plan.grab - 0.15) });
shots.push({ name: "k4b-drag-route", frame: F((b.plan.grab + b.plan.drop) / 2) });
shots.push({ name: "k4c-dropped-formula", frame: F(b.plan.brand - 0.2) });
shots.push({ name: "k5-balago-card", frame: F(b.plan.back + 0.6) });
shots.push({ name: "k6a-full-circle", frame: F(b.trial.steps[0] - 0.2) });
shots.push({ name: "k6b-steps-free", frame: F(b.trial.free + 0.6) });
shots.push({ name: "k7-cta", frame: F(b.cta.from + 1.5) });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: F(s.from + 0.25) });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
});
shots.push({ name: "cta-last-word-plus-3s", frame: F(tl.cues[tl.cues.length - 1].to + 3) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const only = process.env.BG04_STILLS?.split(",");
const outDir = "out/frames-bg-004";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG04_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
