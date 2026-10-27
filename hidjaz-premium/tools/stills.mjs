// Контрольные кадры по одному на каждую сцену и контакт-лист.
// node hidjaz-premium/tools/stills.mjs <outDir>
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "out/hidjaz-frames";
mkdirSync(out, { recursive: true });
const frames = [20, 120, 240, 400, 560, 760, 960, 1150, 1350, 1560, 1700, 1790];
for (const f of frames) {
  execFileSync("npx", ["remotion", "still", "hidjaz-premium/src/index.ts", "HidjazPremiumAd", `${out}/f${String(f).padStart(4, "0")}.jpg`, `--frame=${f}`, "--public-dir=hidjaz-premium/public", "--scale=0.5", "--log=error"], { stdio: "inherit" });
}
execFileSync("sh", ["-c", `ffmpeg -v error -y -pattern_type glob -i '${out}/f*.jpg' -vf tile=6x2 ${out}/contact-sheet.jpg`]);
console.log(`${out}/contact-sheet.jpg`);
