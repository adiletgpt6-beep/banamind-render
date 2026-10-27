// Контрольные кадры BM-036: по кадру на сцену (конец речи последней реплики — все элементы
// экспоната уже на месте). Один бандл, быстрый рендер через @remotion/renderer.
// node scripts/books/bm036/stills.mjs [a01,b02] [--mid] → out/bm036-frames/<scene>.jpg (960×540)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { COMPOSITION, FPS, timeline } from "./lib.mjs";

const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2].split(",") : null;
const mid = process.argv.includes("--mid");
const tl = timeline();
mkdirSync("out/bm036-frames", { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/books/richest-man-in-babylon-clason/film/index.ts" });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const composition = await selectComposition({ serveUrl, id: COMPOSITION, browserExecutable });
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  const last = sc.lines[sc.lines.length - 1];
  const t = mid ? (sc.from + sc.to) / 2 : Math.min(sc.to - 0.5, last.speechTo - 0.2);
  await renderStill({ serveUrl, composition, frame: Math.round(t * FPS), output: `out/bm036-frames/${sc.id}.jpg`, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5, browserExecutable });
  process.stdout.write(".");
}
console.log(`\n✓ кадры: out/bm036-frames`);
