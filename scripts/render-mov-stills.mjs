// Контрольные кадры фильма №33 → out/frames-moms-old-video/.
// Для каждой сцены: начало, середина, конец; кадры реплик (через 0,6 с
// после начала речи), кадры до и после каждого перехода, финал.
// Использует собранный бандл (npm run bundle → build/).
//   MOV_PREVIEW=1 — черновые кадры без полной озвучки (оценочные тайминги).
//   MOV_FRAMES=12,340 — только эти кадры.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { lineAt, MOV_FRAMES, MOV_LINES, MOV_SCENES, MOV_VIDEO } from "../src/moms-old-video/script.ts";

// MOV_BUNDLE — свой каталог бандла (несколько параллельных проверок)
const bundle = process.env.MOV_BUNDLE ?? "build";
if (!existsSync(`${bundle}/index.html`)) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const outDir = process.env.MOV_OUT ?? "out/frames-moms-old-video";
const fps = MOV_VIDEO.fps;
let shots = [{ name: "000-first", frame: 0 }];
MOV_SCENES.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 3 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 3 });
});
for (const l of MOV_LINES) shots.push({ name: `line-${l.id}`, frame: Math.round((lineAt(l) + 0.6) * fps) });
shots.push({ name: "999-last", frame: MOV_FRAMES - 1 });
if (process.env.MOV_FRAMES) shots = process.env.MOV_FRAMES.split(",").map((x) => ({ name: `f${x.padStart(5, "0")}`, frame: Number(x) }));

if (!process.env.MOV_FRAMES) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const props = process.env.MOV_PREVIEW === "1" ? ["--props", JSON.stringify({ preview: true })] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, MOV_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...props, ...browser], { stdio: "inherit" });
}
