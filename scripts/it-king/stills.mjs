// Контрольные кадры BM-020: середина каждой реплики выбранных сцен (или всех).
// [PILOT=1] node scripts/it-king/stills.mjs [p01,p02] [--scale=0.5] → out/it-frames/*.jpg
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { COMPOSITION, ENTRY, FPS, timeline } from "./lib.mjs";

const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2].split(",") : null;
const scale = process.argv.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? "0.5";
const tl = timeline();
mkdirSync("out/it-frames", { recursive: true });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  for (const ln of sc.lines) frames.push({ name: `${ln.id}`, f: Math.round(((ln.speechFrom + ln.speechTo) / 2) * FPS) });
}
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
for (const fr of frames) {
  execFileSync("npx", ["remotion", "still", ENTRY, COMPOSITION, `out/it-frames/${fr.name}.jpg`, `--frame=${fr.f}`, "--image-format=jpeg", `--scale=${scale}`, "--log=error", ...browser], { stdio: "inherit" });
}
console.log(`✓ кадров: ${frames.length}`);
