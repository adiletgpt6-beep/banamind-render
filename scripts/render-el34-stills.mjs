// Контрольные кадры BalaGo34ExtraLine → out/frames-extra-line-34/.
// Для каждой сцены: начало, середина, конец; кадр каждой реплики; первый и
// последний кадр фильма. Один браузер на все кадры (быстрее, чем `remotion
// still` на каждый кадр). Использует собранный бандл (npm run bundle →
// build/).
//
//   node scripts/render-el34-stills.mjs                 все контрольные кадры
//   node scripts/render-el34-stills.mjs reading delete  только кадры с этими словами в имени
//   node scripts/render-el34-stills.mjs --frames=120,480 --scale=0.5
//   node scripts/render-el34-stills.mjs --sheet         + лист-раскладка out/frames-extra-line-34/sheet-*.png
//   node scripts/render-el34-stills.mjs --preview       черновые кадры до полной озвучки
//   node scripts/render-el34-stills.mjs --comp=El34SheetUI --frames=0,90 --out=out/sheet-ui
//                                                       кадры рабочего листа (src/extra-line-34/dev)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { EL_VIDEO } from "../src/extra-line-34/script.ts";

const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
// --build=<каталог> — свой бандл (npx remotion bundle --out-dir <каталог>)
const serveUrl = opt("build") ?? "build";
if (!existsSync(`${serveUrl}/index.html`)) {
  console.error(`Нет бандла ${serveUrl}/. Сначала выполните: npm run bundle`);
  process.exit(1);
}
const flags = new Set(args.filter((a) => a.startsWith("--")).map((a) => a.split("=")[0]));
const words = args.filter((a) => !a.startsWith("--"));
const scale = Number(opt("scale") ?? 1);
const outDir = opt("out") ?? "out/frames-extra-line-34";
const fps = EL_VIDEO.fps;

const browserExecutable = process.env.REMOTION_BROWSER ?? process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "swangle" } });
// --preview: готовые реплики + оценка недостающих (до полной озвучки)
const inputProps = { preview: flags.has("--preview") };
const compId = opt("comp") ?? EL_VIDEO.id;
const composition = await selectComposition({ serveUrl, id: compId, puppeteerInstance: browser, logLevel: "error", inputProps });
const { buildElTimeline, estimateElManifest } = await import("../src/extra-line-34/timing.ts");
const tl = buildElTimeline(composition.props.manifest ?? estimateElManifest());

let shots;
if (opt("frames")) {
  shots = opt("frames").split(",").map((x) => ({ name: `f${String(x).padStart(5, "0")}`, frame: Number(x) }));
} else {
  shots = [{ name: "000-first", frame: 0 }];
  tl.scenes.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 6 });
    shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((s.from + s.to) / 2) });
    shots.push({ name: `${n}c-${s.id}-end`, frame: s.to - 6 });
  });
  for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.6) * fps) });
  shots.push({ name: "999-last", frame: tl.frames - 1 });
  if (words.length) shots = shots.filter((s) => words.some((w) => s.name.includes(w)));
}
if (!words.length && !opt("frames") && !opt("out")) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ composition, serveUrl, output, frame: Math.min(frame, composition.durationInFrames - 1), puppeteerInstance: browser, scale, logLevel: "error", inputProps: composition.props });
  console.log(`✓ кадр ${frame} → ${output}`);
}
await browser.close({ silent: true });

if (flags.has("--sheet")) {
  // раскладки по 8 кадров (4×2), каждый 270×480
  const files = readdirSync(outDir).filter((f) => f.endsWith(".png") && !f.startsWith("sheet-")).sort();
  for (let i = 0; i < files.length; i += 8) {
    const part = files.slice(i, i + 8);
    const inputs = part.flatMap((f) => ["-i", `${outDir}/${f}`]);
    const scaled = part.map((_, k) => `[${k}]scale=270:480,drawtext=text='${part[k].replace(/\.png$/, "").replace(/'/g, "")}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6[s${k}]`).join(";");
    const pad = Array.from({ length: 8 - part.length }, (_, k) => `color=c=gray:s=270x480:d=1[p${k}]`).join(";");
    const cells = [...part.map((_, k) => `[s${k}]`), ...Array.from({ length: 8 - part.length }, (_, k) => `[p${k}]`)].join("");
    const graph = `${scaled}${pad ? `;${pad}` : ""};${cells}xstack=inputs=8:layout=0_0|w0_0|w0+w1_0|w0+w1+w2_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0`;
    execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", graph, "-frames:v", "1", `${outDir}/sheet-${String(i / 8 + 1).padStart(2, "0")}.png`]);
  }
  console.log(`раскладки: ${outDir}/sheet-*.png`);
}
