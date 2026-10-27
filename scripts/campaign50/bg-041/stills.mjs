// Контрольные кадры BalaGoBG041 → out/frames-bg-041/: 0 %, 25 %, 50 %,
// 75 %, финал; смысловые точки каждой сцены (начало/середина/конец,
// перемотка, пауза с подписью, склейки по предмету); финал + 3 с после
// последнего слова. Один браузер на все кадры.
//   node scripts/campaign50/bg-041/stills.mjs [бандл=build/bg-041]
//   BG41_STILLS=префикс1,префикс2 — только выбранные кадры
//   BG41_AT=12.5,30 — дополнительные кадры по секундам (имя at-12.50)
//   BG41_SCALE=0.5 — уменьшенные кадры (быстрее)
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { BG41_VIDEO } from "../../../src/campaign50/bg-041/script.ts";
import { buildBg41Timeline, cueOf, sceneOf } from "../../../src/campaign50/bg-041/timing.ts";

const bundle = process.argv[2] ?? "build/bg-041";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-041/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(`public/${BG41_VIDEO.voiceDir}/manifest.json`, "utf8"));
const tl = buildBg41Timeline(manifest);
const fps = BG41_VIDEO.fps;
const F = (sec) => Math.min(tl.frames - 1, Math.max(0, Math.round(sec * fps)));
const S = (id) => sceneOf(tl, id);
const C = (id) => cueOf(tl, id);
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${String(p * 100).padStart(3, "0")}`, frame: Math.round(p * tl.frames) }));
shots.push({ name: "pct-100", frame: tl.frames - 1 });
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const len = s.to - s.from;
  for (const [k, p] of [["a", 0.03], ["b", 0.2], ["c", 0.4], ["d", 0.6], ["e", 0.8], ["f", 0.97]]) shots.push({ name: `${n}${k}-${s.id}-${Math.round(p * 100)}`, frame: F(s.from + len * p) });
});
shots.push({ name: "x-cta-contacts-start", frame: F(S("cta").from + 1.6) });
shots.push({ name: "x-cta-last-word", frame: F(C("n10").to) });
shots.push({ name: "x-cta-last-word-plus-3s", frame: F(C("n10").to + 3) });
for (const a of (process.env.BG41_AT ?? "").split(",").filter(Boolean)) shots.push({ name: `at-${Number(a).toFixed(2)}`, frame: F(Number(a)) });

const only = process.env.BG41_STILLS?.split(",");
const outDir = "out/frames-bg-041";
if (!only && !process.env.BG41_AT) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
console.log(`Длительность ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
const browser = await openBrowser("chrome", process.env.REMOTION_BROWSER ? { browserExecutable: process.env.REMOTION_BROWSER } : {});
const composition = await selectComposition({ serveUrl: bundle, id: BG41_VIDEO.id, puppeteerInstance: browser });
const scale = Number(process.env.BG41_SCALE ?? 1);
for (const { name, frame } of shots) {
  if (only && !only.some((o) => name.startsWith(o))) continue;
  if (process.env.BG41_AT && !only && !name.startsWith("at-")) continue;
  const output = `${outDir}/${name}.png`;
  await renderStill({ composition, serveUrl: bundle, output, frame, puppeteerInstance: browser, scale, overwrite: true });
  console.log(`✓ кадр ${frame} (${(frame / fps).toFixed(2)} с) → ${output}`);
}
await browser.close({ silent: true });
