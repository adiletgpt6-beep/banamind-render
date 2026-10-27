// Быстрые контрольные кадры фильма №36 для работы над сценами: один бандл
// и один браузер на все кадры (в отличие от render-sd2d-stills.mjs, где
// каждый кадр — отдельный запуск). Кадры задаются как «сцена:смещение»
// (смещение — кадры от начала сцены или доля сцены 0…1) или абсолютным
// номером кадра.
//   node scripts/sd2d-frames.mjs suitcase:10 suitcase:0.5 invite:0.2 1234
//   SD2_PREVIEW=1 — оценочные тайминги (без озвучки)
//   SD2_SCALE=0.5 — уменьшенные кадры (быстрее)
//   SD2_OUT=out/frames-dev — папка
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SD2_VIDEO } from "../src/suitcase-by-the-door-2d/script.ts";
import { buildSd2Timeline, estimateSd2Manifest } from "../src/suitcase-by-the-door-2d/timing.ts";

const preview = process.env.SD2_PREVIEW === "1";
const scale = Number(process.env.SD2_SCALE ?? 0.5);
const outDir = process.env.SD2_OUT ?? "out/frames-dev";
const manifestPath = join("public", SD2_VIDEO.voiceDir, "manifest.json");
// тот же расчёт, что loadSd2ManifestLenient: готовые реплики — фактические
const raw = !preview && existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;
const manifest = raw ? { version: 1, kind: "sd2d", lines: raw.lines.filter((l) => l.file) } : estimateSd2Manifest();
const tl = buildSd2Timeline(manifest);
const frames = process.argv.slice(2).map((arg) => {
  if (/^\d+$/.test(arg)) return { name: `f${arg}`, frame: Number(arg) };
  const [id, off] = arg.split(":");
  const sc = tl.scenes.find((s) => s.id === id);
  if (!sc) throw new Error(`Нет сцены ${id}`);
  const v = Number(off ?? 0);
  const rel = v > 0 && v < 1 && off.includes(".") ? Math.round((sc.to - sc.from) * v) : Math.round(v);
  return { name: `${id}-${String(rel).padStart(4, "0")}`, frame: Math.min(sc.to - 1, sc.from + rel) };
});
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/index.ts", onProgress: () => {} });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const browser = await openBrowser("chrome", { browserExecutable });
const inputProps = { preview: true };
const composition = await selectComposition({ serveUrl, id: SD2_VIDEO.id, inputProps, puppeteerInstance: browser });
for (const { name, frame } of frames) {
  const output = join(outDir, `${name}.png`);
  const t0 = Date.now();
  await renderStill({ serveUrl, composition, frame, output, inputProps, scale, puppeteerInstance: browser, imageFormat: "png" });
  console.log(`✓ ${output} (кадр ${frame}, ${Date.now() - t0} мс)`);
}
await browser.close({ silent: true });
