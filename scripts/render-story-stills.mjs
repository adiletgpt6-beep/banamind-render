// Контрольные кадры седьмого ролика (BalaGoMorningStory) → out/frames-morning-story/.
// Для каждой сцены: начало, середина, конец; плюс первый кадр, конец
// последней реплики, финальный экран и последний кадр.
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { MS_VIDEO } from "../src/morning-story/script.ts";
import {
  buildStoryTimeline,
  estimateStoryManifest,
} from "../src/morning-story/storyTimeline.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const outDir = "out/frames-morning-story";
const manifestPath = `public/${MS_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : estimateStoryManifest();
const tl = buildStoryTimeline(manifest, MS_VIDEO.fps);

const shots = [{ name: "00-first-frame", frame: 0 }];
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const end = s.from + s.durationInFrames;
  shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 8 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((s.from + end) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: end - 8 });
});
shots.push({ name: "90-speech-end", frame: tl.speechEndFrame });
shots.push({ name: "99-last-frame", frame: tl.durationInFrames - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
console.log(
  `Длина ролика: ${(tl.durationInFrames / MS_VIDEO.fps).toFixed(2)} с` +
    (manifest.estimated ? " (оценка, озвучки нет)" : ""),
);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync(
    "npx",
    ["remotion", "still", "build", MS_VIDEO.id, output, `--frame=${frame}`],
    { stdio: "inherit" },
  );
}
