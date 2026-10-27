// Контрольные кадры BalaGoUnansweredLetter2D → out/frames-unanswered-letter-2d/.
// Для каждой сцены: начало, середина, конец; плюс кадры реплик и финал.
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { UL2_FRAMES, UL2_SCENES, UL2_SEGMENTS, UL2_VIDEO } from "../src/unanswered-letter-2d/script.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const outDir = "out/frames-unanswered-letter-2d";
const fps = UL2_VIDEO.fps;
const shots = [{ name: "000-first", frame: 0 }];
UL2_SCENES.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 6 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 6 });
});
for (const s of UL2_SEGMENTS) shots.push({ name: `line-${s.id}`, frame: Math.round((s.at + 0.6) * fps) });
shots.push({ name: "999-last", frame: UL2_FRAMES - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", UL2_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
