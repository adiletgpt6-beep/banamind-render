// Рендерит контрольные кадры каждой сцены.
//   node scripts/render-stills.mjs               → out/frames/ (первый ролик)
//   node scripts/render-stills.mjs driver-intro  → out/frames-driver-intro/
// Кадры берутся из монтажа под речь (src/timeline.ts): середина каждой
// сцены и момент после появления ключевой надписи, плюс первый кадр.
// Использует собранный бандл (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { VIDEO, VIDEOS } from "../src/config.ts";
import { buildTimeline, estimateManifest } from "../src/timeline.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}

const videoKey = process.argv[2] ?? "promo";
const spec = VIDEOS[videoKey];
if (!spec) throw new Error(`Неизвестный ролик «${videoKey}».`);
const outDir = videoKey === "promo" ? "out/frames" : `out/frames-${videoKey}`;

const manifestPath = `public/${spec.voiceDir}/manifest.json`;
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : estimateManifest(spec.narration);
const timeline = buildTimeline(manifest, VIDEO.fps, spec.scenePlan);

const shots = [{ name: "00-first-frame", frame: 0 }];
timeline.scenes.forEach((scene, i) => {
  const next = timeline.scenes[i + 1];
  const end = next ? next.from : timeline.durationInFrames;
  const n = String(i + 1).padStart(2, "0");
  // Середина сцены — проверка появления надписей по ходу речи.
  shots.push({
    name: `${n}a-${scene.id}-mid`,
    frame: Math.round((scene.from + end) / 2),
  });
  // Кадр ближе к концу сцены: все надписи уже появились.
  const frame = Math.max(scene.from, end - Math.round(0.35 * VIDEO.fps));
  shots.push({ name: `${n}b-${scene.id}`, frame });
});
shots.push({ name: "99-last-frame", frame: timeline.durationInFrames - 1 });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
console.log(
  `Длина ролика: ${(timeline.durationInFrames / VIDEO.fps).toFixed(2)} с` +
    (manifest.estimated ? " (оценка, озвучки нет)" : ""),
);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync(
    "npx",
    ["remotion", "still", "build", spec.id, output, `--frame=${frame}`],
    { stdio: "inherit" },
  );
}
