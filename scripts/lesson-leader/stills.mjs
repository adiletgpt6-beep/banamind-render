// Контрольные кадры урока: середина каждой реплики выбранных сцен (или всех).
// node scripts/lesson-leader/stills.mjs [s01,s07] [--every=1] → out/lesson-frames/*.jpg
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { FPS, timeline } from "./lib.mjs";

const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2].split(",") : null;
const tl = timeline();
mkdirSync("out/lesson-frames", { recursive: true });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  for (const ln of sc.lines) frames.push({ name: `${ln.id}`, f: Math.round(((ln.speechFrom + ln.speechTo) / 2) * FPS) });
}
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
for (const fr of frames) {
  execFileSync("npx", ["remotion", "still", "src/lesson-leader/index.ts", "LeaderLesson", `out/lesson-frames/${fr.name}.jpg`, `--frame=${fr.f}`, "--image-format=jpeg", "--scale=0.5", "--log=error", ...browser], { stdio: "inherit" });
}
console.log(`✓ кадров: ${frames.length}`);
