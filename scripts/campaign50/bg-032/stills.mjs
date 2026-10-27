// Контрольные кадры BalaGoBG032 → out/frames-bg-032/: 0 %, 25 %, 50 %,
// 75 %, финал; пять смысловых блоков (вопрос → база расчёта → три тарифа →
// полный круг → CTA); начало/середина/конец каждой сцены; ценники.
// Использует бандл точки входа BG-032 (build/bg-032/).
// REMOTION_BG032_ESTIMATE=1 — черновые кадры без озвучки.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bg32Beats } from "../../../src/campaign50/bg-032/beats.ts";
import { BG32_VIDEO } from "../../../src/campaign50/bg-032/script.ts";
import { buildBg32Timeline, estimateBg32Manifest } from "../../../src/campaign50/bg-032/timing.ts";

const bundle = process.argv[2] ?? "build/bg-032";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-032/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifestPath = `public/${BG32_VIDEO.voiceDir}/manifest.json`;
const manifest = !process.env.REMOTION_BG032_ESTIMATE && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg32Manifest();
const tl = buildBg32Timeline(manifest);
const b = bg32Beats(tl);
const fps = BG32_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
// пять смысловых блоков
shots.push({ name: "k1-question", frame: F(b.hook.to - 0.4) });
shots.push({ name: "k2-basis", frame: F(b.t1.range - 0.1) });
shots.push({ name: "k3a-1000", frame: F(b.t1.price + 0.9) });
shots.push({ name: "k3b-1200", frame: F(b.t2.price + 0.9) });
shots.push({ name: "k3c-1500-over20", frame: F(b.t3.over + 0.8) });
shots.push({ name: "k4-full-trip", frame: F(b.full.onePrice + 0.6) });
shots.push({ name: "k5-cta", frame: F(b.cta.from + 1.5) });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: F(s.from + 0.25) });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
});
shots.push({ name: "cta-last-word-plus-3s", frame: F(tl.cues[tl.cues.length - 1].to + 3) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const only = process.env.BG32_STILLS?.split(",");
const outDir = "out/frames-bg-032";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG32_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
