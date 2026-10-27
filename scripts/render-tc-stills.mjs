// Контрольные кадры TaxiChildLessonsOver → out/frames-taxi-child/.
// Для каждой сцены: начало, середина, поздний момент, конец; плюс первый и
// последний кадр. Сцены — по той же шкале, что и в ролике (озвучка или оценка).
// TC_PREVIEW=1 — до озвучки: оценочная шкала без голоса (только кадры).
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { TC_FRAMES, TC_VIDEO } from "../src/taxi-child/script.ts";
import { buildTcTimeline, estimateTcManifest } from "../src/taxi-child/timing.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const preview = process.env.TC_PREVIEW === "1";
const manifestPath = `public/${TC_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(manifestPath) && !preview ? JSON.parse(readFileSync(manifestPath, "utf8")) : estimateTcManifest();
const tl = buildTcTimeline(manifest);
const outDir = "out/frames-taxi-child";
const shots = [{ name: "000-first", frame: 0 }];
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 8 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-late`, frame: Math.round(s.from + (s.to - s.from) * 0.8) });
  shots.push({ name: `${n}d-${s.id}-end`, frame: s.to - 4 });
});
shots.push({ name: "999-last", frame: TC_FRAMES - 1 });

const only = process.argv.slice(2);
if (!only.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
const props = preview ? [`--props=${JSON.stringify({ preview: true })}`] : [];
for (const { name, frame } of shots) {
  if (only.length && !only.some((o) => name.includes(o))) continue;
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", TC_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...props, ...browser], { stdio: "inherit" });
}
