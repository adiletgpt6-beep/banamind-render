// Контрольные кадры фильма №35 → out/frames-programmers-hardest-task/.
// Кадры считаются по фактической озвучке (тот же планировщик, что и в
// композиции): начало, середина и конец каждой сцены, момент каждой
// реплики и ключевые моменты (вопрос сына, форма, рисунок, финал).
// Один браузер на все кадры. Использует собранный бандл (npm run bundle).
//
//   node scripts/render-pht-stills.mjs                  — полный набор
//   node scripts/render-pht-stills.mjs --frames=10,250  — только эти кадры
//   node scripts/render-pht-stills.mjs --scene=question — кадры одной сцены
//   --scale=0.5 — уменьшенные кадры; --out=папка
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { PHT_VIDEO } from "../src/programmers-hardest-task/script.ts";
import { estimatePhtManifest, planPht } from "../src/programmers-hardest-task/timing.ts";

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const serveUrl = arg("bundle") ?? "build";
if (!existsSync(`${serveUrl}/index.html`)) {
  console.error(`Нет бандла ${serveUrl}/. Сначала выполните: npm run bundle`);
  process.exit(1);
}
const manifestPath = `public/${PHT_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimatePhtManifest();
const plan = planPht(manifest);
const fps = PHT_VIDEO.fps;
const outDir = arg("out") ?? "out/frames-programmers-hardest-task";
const scale = Number(arg("scale") ?? 1);

let shots = [];
if (arg("frames")) {
  shots = arg("frames").split(",").map((x) => ({ name: `f${x.padStart(5, "0")}`, frame: Number(x) }));
} else {
  const only = arg("scene");
  plan.scenes.forEach((s, i) => {
    if (only && s.id !== only) return;
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 4 });
    shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((s.from + s.to) / 2) });
    shots.push({ name: `${n}c-${s.id}-end`, frame: s.to - 4 });
  });
  for (const c of plan.cues) {
    if (only && c.scene !== only) continue;
    shots.push({ name: `line-${c.id}`, frame: Math.min(plan.totalFrames - 1, Math.round((c.from + 0.6) * fps)) });
  }
  if (!only) shots.push({ name: "999-last", frame: plan.totalFrames - 1 });
}
shots.sort((a, b) => a.frame - b.frame);

if (!arg("frames") && !arg("scene")) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: arg("id") ?? PHT_VIDEO.id, inputProps: {}, puppeteerInstance: browser, browserExecutable });
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ composition, serveUrl, output, frame, puppeteerInstance: browser, scale, browserExecutable, overwrite: true });
  console.log(`✓ кадр ${frame} (${(frame / fps).toFixed(2)} с) → ${output}`);
}
await browser.close({ silent: true });
