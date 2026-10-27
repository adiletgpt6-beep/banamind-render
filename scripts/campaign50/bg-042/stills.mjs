// Контрольные кадры BalaGoBG042 → out/frames-bg-042/ (один браузер на все кадры):
//   по умолчанию: 0 %, 25 %, 50 %, 75 %, финал; начало/середина/конец каждой
//   сцены; стыки сцен (последний кадр сцены и первый следующей); середина
//   каждой реплики.
//   --preview          шкала по оценке текста (без озвучки, черновик)
//   --scale=0.5        масштаб кадра
//   --only=hook        только кадры, в имени которых есть подстрока
//   --frames=10,20     только указанные кадры ролика
//   --scene=search:8   8 равномерных кадров сцены
//   --sheet            дополнительно склеить кадры в контактный лист (ffmpeg)
//   --no-bundle        использовать готовую сборку
//   --bundle=DIR       папка сборки (по умолчанию build/bg-042)
//   node scripts/campaign50/bg-042/stills.mjs [флаги]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { BG42_VIDEO } from "../../../src/campaign50/bg-042/script.ts";
import { BUNDLE, ENTRY, timeline } from "./common.mjs";

const has = (k) => process.argv.includes(`--${k}`);
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const preview = has("preview");
const scale = Number(arg("scale") ?? "1");
const only = arg("only");
const frames = arg("frames");
const scene = arg("scene");
const outDir = arg("out") ?? "out/frames-bg-042";
const tl = timeline(preview);
const fps = BG42_VIDEO.fps;
const last = tl.frames - 1;
const pad = (n, k = 4) => String(n).padStart(k, "0");

let shots = [];
if (frames) {
  shots = frames.split(",").map((x) => ({ name: `f${pad(Number(x), 5)}`, frame: Number(x) }));
} else if (scene) {
  const [id, nStr] = scene.split(":");
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps) - 1;
  const n = Number(nStr ?? 8);
  shots = Array.from({ length: n }, (_, i) => {
    const fr = Math.round(a + ((b - a) * i) / Math.max(1, n - 1));
    return { name: `${id}-${pad(i, 2)}-f${pad(fr, 5)}`, frame: fr };
  });
} else {
  shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `pct-${pad(p * 100, 3)}`, frame: Math.round(last * p) }));
  shots.push({ name: "pct-100-final", frame: last });
  tl.scenes.forEach((s, i) => {
    const a = Math.round(s.from * fps);
    const b = Math.round(s.to * fps);
    const n = pad(i + 1, 2);
    shots.push({ name: `${n}a-${s.id}-start`, frame: a + 2 });
    shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
    shots.push({ name: `${n}c-${s.id}-end`, frame: b - 2 });
    if (i > 0) {
      shots.push({ name: `${n}j-${s.id}-joint-prev`, frame: a - 1 });
      shots.push({ name: `${n}j-${s.id}-joint-next`, frame: a });
    }
  });
  for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round(((c.from + c.to) / 2) * fps) });
}
if (only) shots = shots.filter((s) => s.name.includes(only));

const { openBrowser, renderStill, selectComposition } = await import("@remotion/renderer");

// сборка — через CLI (учитывает remotion.config.ts: rspack)
const serveUrl = arg("bundle") ?? BUNDLE;
if (!has("no-bundle") || !existsSync(serveUrl)) {
  execFileSync("npx", ["remotion", "bundle", ENTRY, `--out-dir=${serveUrl}`, "--log=error"], { stdio: "inherit" });
}
if (!frames && !scene && !only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const browser = await openBrowser("chrome", { browserExecutable });
const inputProps = { allowEstimate: preview };
const composition = await selectComposition({ serveUrl, id: BG42_VIDEO.id, inputProps, puppeteerInstance: browser, browserExecutable });
const done = [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl, composition, frame: Math.min(frame, composition.durationInFrames - 1), output, inputProps, scale, puppeteerInstance: browser, imageFormat: "png", overwrite: true });
  console.log(`✓ кадр ${frame} → ${output}`);
  done.push(output);
}
await browser.close({ silent: true });
if (has("sheet") && done.length) {
  const cols = Math.min(6, done.length);
  const sheet = `${outDir}/_sheet.png`;
  const inputs = done.flatMap((p) => ["-i", p]);
  const w = Math.round(1080 * scale * 0.33);
  const h = Math.round(1920 * scale * 0.33);
  const rows = Math.ceil(done.length / cols);
  const layout = done.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join("|");
  const scaled = done.map((_, i) => `[${i}:v]scale=${w}:${h}[s${i}]`).join(";");
  const xs = done.map((_, i) => `[s${i}]`).join("");
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", `${scaled};${xs}xstack=inputs=${done.length}:layout=${layout}:fill=white[o]`, "-map", "[o]", sheet]);
  console.log(`Лист: ${sheet} (${cols}×${rows})`);
}
console.log(`Кадров: ${shots.length}, длительность ${tl.durationSec.toFixed(2)} с${tl.estimated ? " (оценка без озвучки)" : ""}`);
