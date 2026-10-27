// Контрольные кадры BalaGoBG026 → out/frames-bg-026/: начало, середина и
// конец каждой сцены, момент каждой реплики, 0/25/50/75 % и последний кадр.
// Запуск: node scripts/campaign50/bg-026/stills.mjs [--voice] [кадр …]
//   --voice — требовать полную озвучку (как финальный рендер).
//   STILL_SCALE=0.5 — уменьшенные кадры (черновой предпросмотр).
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BG26_VIDEO } from "../../../src/campaign50/bg-026/script.ts";
import { buildBg26Timeline, estimateBg26Manifest, sceneOf } from "../../../src/campaign50/bg-026/timing.ts";
import { lineFrames, wordFrame } from "../../../src/campaign50/bg-026/beats.ts";

const args = process.argv.slice(2);
const requireVoice = args.includes("--voice");
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const mf = `public/${BG26_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateBg26Manifest();
const tl = buildBg26Timeline(manifest);
const fps = BG26_VIDEO.fps;
const shots = [];
if (only.length) only.forEach((f) => shots.push({ name: `f${String(f).padStart(5, "0")}`, frame: f }));
else {
  tl.scenes.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 6 });
    shots.push({ name: `${n}b-${s.id}-mid`, frame: s.from + Math.round(s.frames / 2) });
    shots.push({ name: `${n}c-${s.id}-end`, frame: s.from + s.frames - 6 });
  });
  for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.6) * fps) });
  // ключевые моменты условного примера (как в scenes/Group.tsx и Location.tsx)
  const g = sceneOf(tl, "group");
  const s2 = wordFrame(tl, "n03", "айдоочу");
  shots.push({ name: "key-group-typing", frame: g.from + s2 + 24 });
  shots.push({ name: "key-group-kid", frame: g.from + s2 + 100 });
  const l = sceneOf(tl, "location");
  const send = wordFrame(tl, "n04", "шилтемени") - 4;
  const tap = Math.max(send + 8 + 26, wordFrame(tl, "n04", "жөнөтөт") + 6);
  shots.push({ name: "key-location-link", frame: l.from + send + 24 });
  shots.push({ name: "key-location-map", frame: l.from + tap + 30 });
  shots.push({ name: "key-location-notauto", frame: l.from + Math.max(tap + 40, wordFrame(tl, "n04", "бул") + 12) });
  shots.push({ name: "key-location-school", frame: l.from + l.frames - 8 });
  const n05 = lineFrames(tl, "n05");
  shots.push({ name: "key-order-typing", frame: sceneOf(tl, "order").from + Math.min(n05.to, 120) });
  [0, 25, 50, 75].forEach((p) => shots.push({ name: `pct-${String(p).padStart(2, "0")}`, frame: Math.round(((tl.frames - 1) * p) / 100) }));
  shots.push({ name: "pct-100-last", frame: tl.frames - 1 });
}
const outDir = process.env.STILL_OUT || "out/frames-bg-026";
if (!only.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/campaign50/bg-026/index.ts" });
const inputProps = { requireVoice };
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id: BG26_VIDEO.id, inputProps, browserExecutable });
console.log(`${composition.id}: ${composition.durationInFrames} кадров (${(composition.durationInFrames / fps).toFixed(2)} с)`);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl, composition, frame, output, inputProps, browserExecutable, scale: Number(process.env.STILL_SCALE ?? 1) });
  console.log(`→ ${frame} → ${output}`);
}
