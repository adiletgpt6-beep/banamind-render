// Контрольные кадры любого живого ролика: равномерно (по умолчанию каждые 1,5 с)
// + последний кадр, и лист-превью. Нужен бандл (npm run bundle → build/).
//   node scripts/live-videos/stills.mjs <CompositionId> <outDir> [шаг_сек | t1,t2,…]
import { mkdirSync, rmSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { ffmpeg } from "../lib/audio.mjs";

const [id, out = `out/frames-${process.argv[2]}`, spec = "1.5"] = process.argv.slice(2);
if (!id) throw new Error("usage: stills.mjs <CompositionId> [outDir] [step|t1,t2]");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const puppeteerInstance = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl: "build", id, puppeteerInstance, browserExecutable });
const total = composition.durationInFrames / composition.fps;
const times = spec.includes(",") ? spec.split(",").map(Number) : Array.from({ length: Math.floor(total / Number(spec)) + 1 }, (_, i) => 0.3 + i * Number(spec)).filter((x) => x < total);
const frames = [...new Set([...times.map((x) => Math.round(x * composition.fps)), composition.durationInFrames - 1])];
for (const [i, frame] of frames.entries()) {
  const output = `${out}/${String(i).padStart(2, "0")}-${(frame / composition.fps).toFixed(2)}s.png`;
  await renderStill({ composition, serveUrl: "build", output, frame, puppeteerInstance, browserExecutable, imageFormat: "png", scale: 0.5 });
}
await puppeteerInstance.close({ silent: true });
ffmpeg(["-pattern_type", "glob", "-i", `${out}/*.png`, "-vf", "scale=270:480,tile=8x4:padding=6:color=white", "-frames:v", "1", `${out}/contact-sheet.jpg`]);
console.log(`${id}: ${frames.length} кадров, ${total.toFixed(2)} с → ${out}/contact-sheet.jpg`);
