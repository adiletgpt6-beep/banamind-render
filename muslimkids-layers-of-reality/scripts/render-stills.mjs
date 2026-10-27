// Renders control frames from the real composition (brief §29).
// Usage: node scripts/render-stills.mjs [outDir] [sec,sec,...]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "output/previews/qa";
const secs = (process.argv[3] ?? "2,5,10,14,19,22,28,32,34,39,43,49,57,59").split(",").map(Number);
mkdirSync(out, { recursive: true });
const frames = secs.map((s) => Math.min(1799, Math.round(s * 30)));
for (const f of frames) {
  const name = `${out}/frame_${String(f).padStart(4, "0")}_${(f / 30).toFixed(1)}s.jpg`;
  execFileSync("npx", ["remotion", "still", "MuslimKidsLayersOfReality012", name, `--frame=${f}`, "--gl=angle", "--image-format=jpeg", "--jpeg-quality=88", "--log=error"], { stdio: "inherit" });
  console.log(name);
}
