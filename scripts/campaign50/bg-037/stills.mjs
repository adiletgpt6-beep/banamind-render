// Контрольные кадры BalaGoBG037 → out/frames-bg-037/: 0 %, 25 %, 50 %,
// 75 %, финал; смысловые моменты (вопрос мамы → «ТӨЛӨМ» → три конверта →
// «Азыр төлөм жок» → «Биринчи сыноо акысыз» → выбор и карта → CTA);
// начало/середина/конец каждой сцены.
// Использует бандл точки входа BG-037 (build/bg-037/).
// REMOTION_BG037_ESTIMATE=1 — черновые кадры без озвучки.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bg37Beats } from "../../../src/campaign50/bg-037/beats.ts";
import { BG37_VIDEO } from "../../../src/campaign50/bg-037/script.ts";
import { buildBg37Timeline, estimateBg37Manifest } from "../../../src/campaign50/bg-037/timing.ts";

const bundle = process.argv[2] ?? "build/bg-037";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-037/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifestPath = `public/${BG37_VIDEO.voiceDir}/manifest.json`;
const manifest = !process.env.REMOTION_BG037_ESTIMATE && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateBg37Manifest();
const tl = buildBg37Timeline(manifest);
const b = bg37Beats(tl);
const fps = BG37_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
shots.push({ name: "k1-question", frame: F(b.hook.line.to - 0.2) });
shots.push({ name: "k2-tolom-insert", frame: F(b.hook.insert + 0.9) });
shots.push({ name: "k3-three-envelopes", frame: F(b.rules.read + 0.6) });
shots.push({ name: "k4-card-down", frame: F(b.rules.withdraw + 0.8) });
shots.push({ name: "k5-push-top", frame: F(b.rules.to - 0.3) });
shots.push({ name: "k6-group-nopay", frame: F(b.group.noPay + 0.8) });
shots.push({ name: "k7-group-tomorrow", frame: F(b.group.to - 0.4) });
shots.push({ name: "k8-trial-morning", frame: F(b.trial.morning + 1.2) });
shots.push({ name: "k9-trial-free", frame: F(b.trial.free + 0.8) });
shots.push({ name: "k10-decide-pick", frame: F(b.decide.pick + 0.6) });
shots.push({ name: "k11-decide-pay", frame: F(b.decide.pay + 0.7) });
shots.push({ name: "k12-kitchen-outro", frame: F(b.decide.to - 0.4) });
shots.push({ name: "k13-cta", frame: F(b.cta.from + 1.5) });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: F(s.from + 0.25) });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
});
shots.push({ name: "cta-last-word-plus-3s", frame: F(tl.cues[tl.cues.length - 1].to + 3) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const only = process.env.BG37_STILLS?.split(",");
const outDir = process.env.BG37_STILLS_DIR ?? "out/frames-bg-037";
if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
const scale = process.env.BG37_STILLS_SCALE ? [`--scale=${process.env.BG37_STILLS_SCALE}`] : [];
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG37_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser, ...scale], { stdio: "inherit" });
}
