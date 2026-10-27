// Контрольные кадры BalaGoBG049 → out/frames-bg-049/: начало, середина и
// конец каждой сцены, момент каждой реплики, 0/25/50/75 % и последний кадр.
// Запуск: node scripts/campaign50/bg-049/stills.mjs [--voice] [кадр …]
//   --voice — требовать полную озвучку (как финальный рендер).
// Без озвучки (локально, до CI) — оценочные тайминги реплик.
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BG49_VIDEO } from "../../../src/campaign50/bg-049/script.ts";
import {
  buildBg49Timeline,
  estimateBg49Manifest,
} from "../../../src/campaign50/bg-049/timing.ts";

const args = process.argv.slice(2);
const requireVoice = args.includes("--voice");
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const mf = `public/${BG49_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(mf)
  ? JSON.parse(readFileSync(mf, "utf8"))
  : estimateBg49Manifest();
const tl = buildBg49Timeline(manifest);
const fps = BG49_VIDEO.fps;
const shots = [];
if (only.length)
  only.forEach((f) =>
    shots.push({ name: `f${String(f).padStart(5, "0")}`, frame: f }),
  );
else {
  tl.scenes.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 8 });
    shots.push({
      name: `${n}b-${s.id}-mid`,
      frame: s.from + Math.round(s.frames / 2),
    });
    shots.push({ name: `${n}c-${s.id}-end`, frame: s.from + s.frames - 6 });
  });
  for (const c of tl.cues)
    shots.push({
      name: `line-${c.id}`,
      frame: Math.round((c.from + 0.6) * fps),
    });
  [0, 25, 50, 75].forEach((p) =>
    shots.push({
      name: `pct-${String(p).padStart(2, "0")}`,
      frame: Math.round(((tl.frames - 1) * p) / 100),
    }),
  );
  shots.push({ name: "pct-100-last", frame: tl.frames - 1 });
}
const outDir = process.env.STILLS_DIR || "out/frames-bg-049";
if (!only.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/campaign50/bg-049/index.ts" });
const inputProps = { requireVoice };
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({
  serveUrl,
  id: BG49_VIDEO.id,
  inputProps,
  browserExecutable,
});
console.log(
  `${composition.id}: ${composition.durationInFrames} кадров (${(composition.durationInFrames / fps).toFixed(2)} с)`,
);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({
    serveUrl,
    composition,
    frame,
    output,
    inputProps,
    browserExecutable,
    scale: Number(process.env.STILL_SCALE ?? 1),
  });
  console.log(`→ ${frame} → ${output}`);
}
