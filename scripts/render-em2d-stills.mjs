// Контрольные кадры BalaGoElevenMinutes2D → out/frames-eleven-minutes-2d/.
// Для каждой сцены: начало, середина, конец; плюс кадры реплик и финал.
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { EM2_FRAMES, EM2_LINES, EM2_SCENES, EM2_VIDEO } from "../src/eleven-minutes-2d/script.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const outDir = "out/frames-eleven-minutes-2d";
const fps = EM2_VIDEO.fps;
const shots = [{ name: "000-first", frame: 0 }];
EM2_SCENES.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 6 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 6 });
});
for (const l of EM2_LINES) shots.push({ name: `line-${l.id}`, frame: Math.round((l.at + 0.6) * fps) });
shots.push({ name: "999-last", frame: EM2_FRAMES - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", EM2_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
