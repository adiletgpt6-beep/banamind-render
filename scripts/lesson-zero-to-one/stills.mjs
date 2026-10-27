// Контрольные кадры фильма: по кадру на сцену (момент, когда схема уже собрана) —
// один бандл и один браузер на все кадры.
// node scripts/lesson-zero-to-one/stills.mjs [z01,m02] [--at=0.85] [--scale=0.5] → out/zero-frames/*.jpg
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { FPS, timeline } from "./lib.mjs";

const args = process.argv.slice(2);
const only = args[0] && !args[0].startsWith("--") ? args[0].split(",") : null;
const opt = (k, d) => Number(args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d);
const AT = opt("at", 0.88);
const SCALE = opt("scale", 0.5);
const OUT = "out/zero-frames";
mkdirSync(OUT, { recursive: true });
const tl = timeline();
const serveUrl = await bundle({ entryPoint: "src/lesson-zero-to-one/index.ts" });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const composition = await selectComposition({ serveUrl, id: "ZeroToOneLesson", browserExecutable });
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  const lastLine = sc.lines[sc.lines.length - 1];
  const t = sc.from + (Math.min(sc.to, lastLine.speechTo) - sc.from) * AT;
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * FPS));
  await renderStill({ serveUrl, composition, frame, output: `${OUT}/${sc.id}.jpg`, imageFormat: "jpeg", scale: SCALE, browserExecutable, jpegQuality: 85 });
  console.log(`✓ ${sc.id} @ ${t.toFixed(1)} с`);
}
