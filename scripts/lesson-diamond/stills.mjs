// Контрольные кадры фильма BM-027: по кадру на сцену (момент «доля» сцены) или
// середины реплик выбранных сцен. Один бандл, один браузер.
//   node scripts/lesson-diamond/stills.mjs [c01,c07] [--lines] [--at=0.8] [--out=out/diamond-frames] [--scale=0.5]
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { FPS, timeline } from "./lib.mjs";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2].split(",") : null;
const OUT = arg("out", "out/diamond-frames");
const AT = Number(arg("at", "0.8"));
const scale = Number(arg("scale", "0.5"));
const tl = timeline();
mkdirSync(OUT, { recursive: true });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  if (process.argv.includes("--lines")) for (const ln of sc.lines) frames.push({ name: ln.id, f: Math.round(((ln.speechFrom + ln.speechTo) / 2) * FPS) });
  else frames.push({ name: sc.id, f: Math.round((sc.from + (sc.to - sc.from) * AT) * FPS) });
}
const serveUrl = await bundle({ entryPoint: "src/lesson-diamond/index.ts" });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({ serveUrl, id: "DiamondLesson", browserExecutable });
for (const fr of frames) {
  await renderStill({ serveUrl, composition, frame: fr.f, output: `${OUT}/${fr.name}.jpg`, imageFormat: "jpeg", scale, browserExecutable });
}
console.log(`✓ кадров: ${frames.length} → ${OUT} (фильм ${(tl.duration / 60).toFixed(2)} мин${tl.natural ? `, естественная ${(tl.natural / 60).toFixed(2)}` : ""})`);
