// Контрольные кадры BalaGoBG048 → out/frames-bg-048/: 0/25/50/75/100 %,
// начало, середина и конец каждой сцены, момент каждой реплики и ключевые
// моменты истории (хук, приборы, раскрытие пульта, отправка сообщения,
// условный пример, финал с контактами).
// Запуск: node scripts/campaign50/bg-048/stills.mjs [--voice] [--scale=0.5] [кадр …]
//   --voice — требовать полную озвучку (как финальный рендер).
//   REMOTION_BROWSER — путь к Chrome Headless Shell (если нужен свой).
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { B48_VIDEO } from "../../../src/campaign50/bg-048/script.ts";
import { buildB48Timeline, estimateB48Manifest } from "../../../src/campaign50/bg-048/timing.ts";

const args = process.argv.slice(2);
const requireVoice = args.includes("--voice");
const scale = Number(args.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? 1);
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const mf = `public/${B48_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateB48Manifest();
const tl = buildB48Timeline(manifest);
const fps = B48_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const shots = [];
if (only.length) only.forEach((f) => shots.push({ name: `f${String(f).padStart(5, "0")}`, frame: f }));
else {
  [0, 25, 50, 75].forEach((p) => shots.push({ name: `p${String(p).padStart(3, "0")}`, frame: Math.round(((tl.frames - 1) * p) / 100) }));
  shots.push({ name: "p100-final", frame: tl.frames - 1 });
  tl.scenes.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `s${n}a-${s.id}-start`, frame: F(s.from + 0.2) });
    shots.push({ name: `s${n}b-${s.id}-mid`, frame: F((s.from + s.to) / 2) });
    shots.push({ name: `s${n}c-${s.id}-end`, frame: F(s.to - 0.2) });
  });
  for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: F(c.from + 0.6) });
  shots.push({ name: "k-cta-contacts", frame: F(tl.ctaFrom + 1) });
}
const outDir = "out/frames-bg-048";
if (!only.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/campaign50/bg-048/index.ts" });
const inputProps = { requireVoice };
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id: B48_VIDEO.id, inputProps, browserExecutable });
console.log(`${composition.id}: ${composition.durationInFrames} кадров (${(composition.durationInFrames / fps).toFixed(2)} с)`);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl, composition, frame, output, inputProps, browserExecutable, scale });
  console.log(`→ ${frame} → ${output}`);
}
