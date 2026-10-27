// Контрольные кадры BalaGoBG008 → out/frames-bg-008/: 0 %, 25 %, 50 %,
// 75 %, финал; для каждой сцены — начало, середина, конец; кадр каждой
// реплики; пропущенный звонок, календарь, выбор BalaGo и финальный экран
// (CTA). Использует бандл собственной точки входа BG-008 (build/bg-008/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { BG8_CTA_FROM, BG8_FRAMES, BG8_LINES, BG8_SCENES, BG8_VIDEO } from "../../../src/campaign50/bg-008/script.ts";

const bundle = process.argv[2] ?? "build/bg-008";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-008/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const outDir = "out/frames-bg-008";
const fps = BG8_VIDEO.fps;
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * BG8_FRAMES) }));
BG8_SCENES.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 6 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 6 });
});
for (const l of BG8_LINES) shots.push({ name: `line-${l.id}`, frame: Math.round((l.at + 0.8) * fps) });
for (const [name, sec] of [["key-missed", 18.2], ["key-calendar", 27.4], ["key-balago-tap", 35.3], ["key-lanes-split", 46.5]]) shots.push({ name, frame: Math.round(sec * fps) });
shots.push({ name: "cta-5s", frame: Math.round((BG8_CTA_FROM + 5) * fps) });
shots.push({ name: "999-last", frame: BG8_FRAMES - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, BG8_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
