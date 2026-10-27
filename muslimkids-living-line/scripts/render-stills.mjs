// Renders control stills (QA) at the key moments of the episode.
// Usage: node scripts/render-stills.mjs [frames...] [--scale=0.5]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const scaleArg = args.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? scaleArg.split("=")[1] : "0.5";
const frames = args.filter((a) => !a.startsWith("--")).map(Number);
const list = frames.length ? frames : [90, 300, 540, 840, 1170, 1470, 1710];
mkdirSync("output/previews/stills", { recursive: true });
for (const f of list) {
  const t = (f / 30).toFixed(1).padStart(4, "0");
  execFileSync(
    "npx",
    ["remotion", "still", "MuslimKidsLivingLine001", `output/previews/stills/t${t}s_f${f}.png`, `--frame=${f}`, `--scale=${scale}`, "--log=error"],
    { stdio: "inherit" },
  );
}
