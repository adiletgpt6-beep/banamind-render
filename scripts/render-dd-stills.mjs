// Контрольные кадры BalaGo32DadDriver → out/frames-dad-driver/.
// Для каждой сцены: вход (во время перехода), начало, середина, конец; для
// каждой реплики — кадр посередине речи; первый и последний кадр.
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { DD_VIDEO } from "../src/dad-driver/script.ts";
import { buildDdTimeline, estimateDdManifest } from "../src/dad-driver/timing.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const MANIFEST = `public/${DD_VIDEO.voiceDir}/manifest.json`;
const estimate = !existsSync(MANIFEST) || process.argv.includes("--estimate");
const tl = buildDdTimeline(estimate ? estimateDdManifest() : JSON.parse(readFileSync(MANIFEST, "utf8")));
const fps = DD_VIDEO.fps;
const outDir = "out/frames-dad-driver";
const shots = [{ name: "000-first", frame: 0 }];
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  if (i > 0) shots.push({ name: `${n}0-${s.id}-enter`, frame: s.from - 4 });
  shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 6 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: s.to - 3 });
});
for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round(((c.from + c.to) / 2) * fps) });
shots.push({ name: "999-last", frame: tl.frames - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
const props = estimate ? [`--props=${JSON.stringify({ allowEstimate: true })}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", DD_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...props, ...browser], { stdio: "inherit" });
}
