// Контрольные кадры BalaGoBG044 (PNG).
// Без аргументов → out/frames-bg-044/: начало, середина и конец каждой
// сцены, момент каждой реплики, 0/25/50/75 % и последний кадр (100 %).
//
//   node scripts/campaign50/bg-044/stills.mjs [опции]
//     --voice            требовать полную озвучку (как финальный рендер)
//     --scene <id>       только сцена id: кадры каждые --every с (по умолч. 0.5)
//     --every <сек>      шаг для --scene
//     --at <id:кадр,…>   кадры от начала сцены, например hook:0,hook:45,cta:300
//     --frames <n,…>     абсолютные кадры ролика
//     --out <папка>      папка вывода (по умолч. out/frames-bg-044)
//     --scale <k>        масштаб кадра (0.5 → 540×960, дешёвый предпросмотр)
//   Браузер: REMOTION_BROWSER=/путь/к/headless_shell (если не скачан свой).
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BG44_VIDEO } from "../../../src/campaign50/bg-044/script.ts";
import { buildBg44Timeline, estimateBg44Manifest } from "../../../src/campaign50/bg-044/timing.ts";

const argv = process.argv.slice(2);
const opt = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
const requireVoice = argv.includes("--voice");
const mf = `public/${BG44_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateBg44Manifest();
const tl = buildBg44Timeline(manifest);
const fps = BG44_VIDEO.fps;
const sceneOf = (id) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

const shots = [];
const pad = (n) => String(n).padStart(5, "0");
if (opt("frames")) {
  for (const f of opt("frames").split(",").map(Number)) shots.push({ name: `f${pad(f)}`, frame: f });
} else if (opt("at")) {
  for (const it of opt("at").split(",")) {
    const [id, rel] = it.split(":");
    const s = sceneOf(id);
    const f = Math.min(s.from + s.frames - 1, s.from + Number(rel));
    shots.push({ name: `${id}-${String(rel).padStart(4, "0")}`, frame: f });
  }
} else if (opt("scene")) {
  const s = sceneOf(opt("scene"));
  const step = Math.max(1, Math.round(Number(opt("every", "0.5")) * fps));
  for (let r = 0; r < s.frames; r += step) shots.push({ name: `${s.id}-${String(r).padStart(4, "0")}`, frame: s.from + r });
  shots.push({ name: `${s.id}-last`, frame: s.from + s.frames - 1 });
} else {
  tl.scenes.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 6 });
    shots.push({ name: `${n}b-${s.id}-mid`, frame: s.from + Math.round(s.frames / 2) });
    shots.push({ name: `${n}c-${s.id}-end`, frame: s.from + s.frames - 6 });
  });
  for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.6) * fps) });
  [0, 25, 50, 75, 100].forEach((p) => shots.push({ name: `pct-${String(p).padStart(3, "0")}`, frame: Math.round(((tl.frames - 1) * p) / 100) }));
}

const outDir = opt("out", "out/frames-bg-044");
if (!opt("frames") && !opt("at") && !opt("scene")) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/campaign50/bg-044/index.ts" });
const inputProps = { requireVoice };
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id: BG44_VIDEO.id, inputProps, browserExecutable });
console.log(`${composition.id}: ${composition.durationInFrames} кадров (${(composition.durationInFrames / fps).toFixed(2)} с)`);
const scale = Number(opt("scale", process.env.STILL_SCALE ?? "1"));
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl, composition, frame, output, inputProps, browserExecutable, scale });
  console.log(`→ ${frame} → ${output}`);
}
