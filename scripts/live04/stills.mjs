// Контрольные кадры BalaGoLive04Motion → out/frames-live04/ (по 2–4 кадра
// на каждый смысловой блок, начало, склейки и финал) + лист-превью.
// Нужен бандл: npm run bundle. Браузер: REMOTION_BROWSER_EXECUTABLE (опц.).
//   node scripts/live04/stills.mjs [секунды через запятую]
import { mkdirSync, rmSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { ffmpeg } from "../lib/audio.mjs";

const OUT = "out/frames-live04";
const custom = process.argv[2]?.split(",").map(Number);
const T = custom ?? [
  0.3, 1.4, 2.5, 3.5, // хук
  4.7, 5.6, 6.6, 8.6, // шаги
  9.9, 10.9, 12.0, 13.2, 14.0, // кайра жумушка / темп
  15.0, 16.0, 16.9, 17.75, 18.1, // неделя
  18.45, 18.9, 19.9, 21.2, // BalaGo
  22.5, 23.9, 24.6, 26.0, 26.9, // маршрут
  28.5, 30.2, 32.4, 34.0, 34.6, // призыв
  35.5, 38.0, 41.0, -1, // финал (−1 = последний кадр)
];
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const puppeteerInstance = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl: "build", id: "BalaGoLive04Motion", puppeteerInstance, browserExecutable });
const files = [];
for (const [i, s] of T.entries()) {
  const frame = s < 0 ? composition.durationInFrames - 1 : Math.round(s * composition.fps);
  const output = `${OUT}/${String(i).padStart(2, "0")}-${(frame / composition.fps).toFixed(2)}s.png`;
  await renderStill({ composition, serveUrl: "build", output, frame, puppeteerInstance, browserExecutable, imageFormat: "png" });
  files.push(output);
  console.log(`✓ ${output}`);
}
await puppeteerInstance.close({ silent: true });
// лист-превью (6 в ряд, 270×480)
ffmpeg(["-pattern_type", "glob", "-i", `${OUT}/*.png`, "-vf", "scale=270:480,tile=6x6:padding=6:color=white", "-frames:v", "1", `${OUT}/contact-sheet.jpg`]);
console.log(`Кадров: ${files.length}, лист: ${OUT}/contact-sheet.jpg (длительность ${(composition.durationInFrames / composition.fps).toFixed(2)} с)`);
