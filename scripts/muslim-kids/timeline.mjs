// Печатает тайм-лайн ролика по манифесту озвучки (длительность, сцены, слова-ориентиры).
// Запуск: node scripts/muslim-kids/timeline.mjs [--seconds]
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { VIDEO } from "../../src/muslim-kids/ali-imran/script.ts";
import { buildTimeline } from "../../src/muslim-kids/ali-imran/timeline.ts";

const path = join("public", VIDEO.voiceDir, "manifest.json");
const manifest = existsSync(path)
  ? JSON.parse(readFileSync(path, "utf8"))
  : null;
const tl = buildTimeline(manifest);
if (process.argv.includes("--seconds")) {
  console.log((tl.total / 30).toFixed(3));
} else {
  console.log(
    `Всего ${tl.total} кадров = ${(tl.total / 30).toFixed(2)} с${tl.estimated ? " (оценка без озвучки)" : ""}`,
  );
  for (const s of tl.scenes)
    console.log(
      `  ${s.id}: ${(s.from / 30).toFixed(2)}–${((s.from + s.dur) / 30).toFixed(2)} с (${(s.dur / 30).toFixed(2)} с)`,
    );
}
