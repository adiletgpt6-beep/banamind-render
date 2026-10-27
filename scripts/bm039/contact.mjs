// Контрольный лист кадров: по кадру на каждую сцену (середина последней реплики
// или указанная доля), один бандл на все кадры. → out/bm039-frames/*.jpg + sheet
//   node scripts/bm039/contact.mjs [frac=0.6] [ids,через,запятую]
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { FPS, timeline } from "./lib.mjs";

const frac = Number(process.argv[2] ?? 0.6);
const only = process.argv[3] ? process.argv[3].split(",") : null;
const tl = timeline();
const dir = "out/bm039-frames";
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
execFileSync("npx", ["remotion", "bundle", "src/bm039-republic/index.ts", "--out-dir=out/bm039-bundle", "--log=error"], { stdio: "inherit" });
const frames = tl.scenes.filter((s) => !only || only.includes(s.id)).map((s) => ({ id: s.id, f: Math.round((s.from + (s.to - s.from) * frac) * FPS) }));
frames.forEach((fr, i) => {
  execFileSync("npx", ["remotion", "still", "out/bm039-bundle", "RepublicFilm", `${dir}/${String(i).padStart(3, "0")}-${fr.id}.jpg`, `--frame=${fr.f}`, "--image-format=jpeg", "--scale=0.5", "--log=error", ...browser], { stdio: "inherit" });
});
console.log(`✓ кадров: ${frames.length}`);
