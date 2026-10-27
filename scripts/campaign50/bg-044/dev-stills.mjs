// Кадры отладочной композиции BG-044 (одна сцена или лист деталей),
// см. src/campaign50/bg-044/dev/harness.tsx.
//   node scripts/campaign50/bg-044/dev-stills.mjs --entry src/campaign50/bg-044/dev/hook.tsx --comp Bg44Dev-hook \
//        [--every 0.5 | --frames 0,30,60] [--out out/dev-hook] [--scale 0.5]
// Браузер: REMOTION_BROWSER=/путь/к/headless_shell (если не скачан свой).
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const argv = process.argv.slice(2);
const opt = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
const entryPoint = opt("entry");
const id = opt("comp");
if (!entryPoint || !id) throw new Error("Нужны --entry и --comp");
const outDir = opt("out", `out/dev-${id}`);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint });
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id, inputProps: {}, browserExecutable });
const n = composition.durationInFrames;
let frames;
if (opt("frames")) frames = opt("frames").split(",").map(Number).filter((f) => f >= 0 && f < n);
else {
  const step = Math.max(1, Math.round(Number(opt("every", "0.5")) * composition.fps));
  frames = [];
  for (let f = 0; f < n; f += step) frames.push(f);
  if (frames[frames.length - 1] !== n - 1) frames.push(n - 1);
}
const scale = Number(opt("scale", "0.5"));
console.log(`${id}: ${n} кадров; рендер ${frames.length} кадров (scale ${scale}) → ${outDir}`);
for (const frame of frames) {
  const output = `${outDir}/${String(frame).padStart(4, "0")}.png`;
  await renderStill({ serveUrl, composition, frame, output, inputProps: {}, browserExecutable, scale });
  console.log(`→ ${output}`);
}
