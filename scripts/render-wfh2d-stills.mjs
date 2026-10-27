// Контрольные кадры BalaGoWorkFromHome2D → out/frames-work-from-home-2d/.
// Для каждой сцены — начало, середина, конец; кадр каждой реплики;
// первый кадр контактной карточки и последний кадр фильма.
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { WFH_CARD_FROM, WFH_FRAMES, WFH_LINES, WFH_SCENES, WFH_VIDEO } from "../src/work-from-home-2d/script.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const outDir = "out/frames-work-from-home-2d";
const fps = WFH_VIDEO.fps;
const shots = [{ name: "000-first", frame: 0 }];
WFH_SCENES.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 6 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 6 });
});
for (const l of WFH_LINES) shots.push({ name: `line-${l.id}`, frame: Math.round((l.at + 0.6) * fps) });
shots.push({ name: "998-card-first", frame: WFH_CARD_FROM });
shots.push({ name: "999-last", frame: WFH_FRAMES - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", WFH_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
