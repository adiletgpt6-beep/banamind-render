// Рендерит контрольные кадры каждой сцены в out/frames/*.png.
// Кадры берутся из монтажа под речь (src/timeline.ts): середина каждой
// сцены и момент после появления ключевой надписи, плюс первый кадр.
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { AUDIO, VIDEO } from "../src/config.ts";
import { buildTimeline, estimateManifest } from "../src/timeline.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}

const manifestPath = `public/${AUDIO.voiceDir}/manifest.json`;
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : estimateManifest();
const timeline = buildTimeline(manifest, VIDEO.fps);

const shots = [{ name: "00-first-frame", frame: 0 }];
timeline.scenes.forEach((scene, i) => {
  const next = timeline.scenes[i + 1];
  const end = next ? next.from : timeline.durationInFrames;
  // Кадр ближе к концу сцены: все надписи уже появились.
  const frame = Math.max(scene.from, end - Math.round(0.35 * VIDEO.fps));
  shots.push({ name: `${String(i + 1).padStart(2, "0")}-${scene.id}`, frame });
});
shots.push({ name: "99-last-frame", frame: timeline.durationInFrames - 1 });

rmSync("out/frames", { recursive: true, force: true });
mkdirSync("out/frames", { recursive: true });
console.log(
  `Длина ролика: ${(timeline.durationInFrames / VIDEO.fps).toFixed(2)} с` +
    (manifest.estimated ? " (оценка, озвучки нет)" : ""),
);
for (const { name, frame } of shots) {
  const output = `out/frames/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync(
    "npx",
    ["remotion", "still", "build", VIDEO.id, output, `--frame=${frame}`],
    { stdio: "inherit" },
  );
}
