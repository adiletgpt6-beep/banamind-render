// Контрольные кадры BalaGoBG036 → out/frames-bg-036/ (или --out DIR):
// начало, середина и конец каждой сцены, момент каждой реплики,
// 0/25/50/75 % и последний кадр (100 %).
// Запуск: node scripts/campaign50/bg-036/stills.mjs [--voice] [--scene ID [--n N]] [--scale S] [--out DIR] [кадр …]
//   --voice — требовать полную озвучку (как финальный рендер);
//   --scene ID — N равномерных кадров одной сцены (по умолчанию 6);
//   --scale S — масштаб (0.5 → 540×960 для быстрого просмотра).
// Браузер: REMOTION_BROWSER=/path/to/chrome (если Chrome Headless Shell не скачан).
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BG36_VIDEO } from "../../../src/campaign50/bg-036/script.ts";
import { buildBg36Timeline, estimateBg36Manifest } from "../../../src/campaign50/bg-036/timing.ts";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const requireVoice = args.includes("--voice");
const scene = opt("--scene", null);
const perScene = Number(opt("--n", 6));
const scale = Number(opt("--scale", process.env.STILL_SCALE ?? 1));
const outDir = opt("--out", "out/frames-bg-036");
const skip = new Set(["--scene", "--n", "--scale", "--out"].flatMap((k) => (args.includes(k) ? [args[args.indexOf(k) + 1]] : [])));
const only = args.filter((a) => /^\d+$/.test(a) && !skip.has(a)).map(Number);

const mf = `public/${BG36_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateBg36Manifest();
const tl = buildBg36Timeline(manifest);
const fps = BG36_VIDEO.fps;
const shots = [];
if (only.length) only.forEach((f) => shots.push({ name: `f${String(f).padStart(5, "0")}`, frame: f }));
else if (scene) {
  const s = tl.scenes.find((x) => x.id === scene);
  if (!s) throw new Error(`Нет сцены ${scene}`);
  for (let i = 0; i < perScene; i++) {
    const frame = s.from + Math.round(((s.frames - 1) * i) / Math.max(1, perScene - 1));
    shots.push({ name: `${scene}-${String(i).padStart(2, "0")}-f${frame}`, frame });
  }
} else {
  tl.scenes.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 6 });
    shots.push({ name: `${n}b-${s.id}-mid`, frame: s.from + Math.round(s.frames / 2) });
    shots.push({ name: `${n}c-${s.id}-end`, frame: s.from + s.frames - 6 });
  });
  for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.6) * fps) });
  [0, 25, 50, 75].forEach((p) => shots.push({ name: `pct-${String(p).padStart(3, "0")}`, frame: Math.round(((tl.frames - 1) * p) / 100) }));
  shots.push({ name: "pct-100-last", frame: tl.frames - 1 });
}
if (!only.length && !scene) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/campaign50/bg-036/index.ts" });
const inputProps = { requireVoice };
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id: BG36_VIDEO.id, inputProps, browserExecutable });
console.log(`${composition.id}: ${composition.durationInFrames} кадров (${(composition.durationInFrames / fps).toFixed(2)} с)`);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl, composition, frame, output, inputProps, browserExecutable, scale });
  console.log(`→ ${frame} → ${output}`);
}
