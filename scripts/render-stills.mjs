// Рендерит контрольные кадры каждой сцены в out/frames/*.png.
// Кадры задаются в src/config.ts (CHECK_FRAMES).
// Использует уже собранный бандл (npm run bundle → build/), чтобы не
// пересобирать проект для каждого кадра.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { CHECK_FRAMES, VIDEO } from "../src/config.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}

mkdirSync("out/frames", { recursive: true });

for (const { name, frame } of CHECK_FRAMES) {
  const output = `out/frames/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync(
    "npx",
    ["remotion", "still", "build", VIDEO.id, output, `--frame=${frame}`],
    { stdio: "inherit" },
  );
}
