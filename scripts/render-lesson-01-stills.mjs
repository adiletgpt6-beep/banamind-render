// Контрольные кадры Lesson01WhoBuiltHouse3D → out/frames-lesson-01/:
// начало, середина и конец каждого плана, середина каждой реплики, финал.
//   node scripts/render-lesson-01-stills.mjs            (из исходников)
// Браузер: REMOTION_BROWSER=/path/to/chrome — при необходимости.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { LESSON_FRAMES, LESSON_SHOTS, LESSON_SPEECH, LESSON_VIDEO } from "../src/lesson-01/script.ts";

const outDir = "out/frames-lesson-01";
const fps = LESSON_VIDEO.fps;
const shots = [{ name: "000-first", frame: 0 }];
LESSON_SHOTS.forEach((sh, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(sh.from * fps);
  const b = i + 1 < LESSON_SHOTS.length ? Math.round(LESSON_SHOTS[i + 1].from * fps) : LESSON_FRAMES;
  shots.push({ name: `${n}a-${sh.id}-start`, frame: Math.min(b - 1, a + 8) });
  shots.push({ name: `${n}b-${sh.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${sh.id}-end`, frame: Math.max(a, b - 4) });
});
LESSON_SPEECH.forEach((sp, i) => shots.push({ name: `speech-${i + 1}-${sp.who}`, frame: Math.round(((sp.from + sp.to) / 2) * fps) }));
shots.push({ name: "999-last", frame: LESSON_FRAMES - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", "src/index.ts", LESSON_VIDEO.id, output, `--frame=${frame}`, "--gl=angle", "--log=error", ...browser], { stdio: "inherit" });
}
