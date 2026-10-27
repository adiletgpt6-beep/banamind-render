// Check frames for IslamicFinanceShort01 → out/frames-islamic-finance-01/.
// Every scene: start, middle, end, plus the first second (frames 0, 8, 15, 30)
// and the transaction steps. Uses the bundle (npm run bundle → build/).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { IF01_FRAMES, IF01_SCENES, IF01_VIDEO } from "../src/islamic-finance-01/script.ts";

if (!existsSync("build/index.html")) {
  console.error("No bundle in build/. Run: npm run bundle");
  process.exit(1);
}
const outDir = process.argv[2] ?? "out/frames-islamic-finance-01";
const compositionId = process.argv[3] ?? IF01_VIDEO.id;
const fps = IF01_VIDEO.fps;
const shots = [
  { name: "000-f0", frame: 0 },
  { name: "000-f8", frame: 8 },
  { name: "000-f15", frame: 15 },
  { name: "000-f30", frame: 30 },
];
IF01_SCENES.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `${n}a-${s.id}-start`, frame: a + 10 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: b - 6 });
});
// transitions and transaction steps
for (const [name, t] of [["t-morph", 3.2], ["t-bluein", 9.3], ["deal-buys", 14.9], ["deal-handover", 15.6], ["deal-resells", 16.8], ["deal-price", 18.3], ["deal-pay", 20.3], ["deal-pay2", 21.3], ["t-navy", 22.2], ["t-navyout", 24.6], ["cta-final", 29.9]]) {
  shots.push({ name, frame: Math.min(IF01_FRAMES - 1, Math.round(t * fps)) });
}
if (compositionId !== IF01_VIDEO.id) {
  // lip-sync spot checks inside words: "banks" (0.6 s), "riba" (4.8 s), "twenty" (10.4 s), "murabaha" (22.9 s), "follow" (27.7 s)
  for (const [name, t] of [["lip-banks", 0.62], ["lip-riba", 4.86], ["lip-twenty", 10.45], ["lip-resells", 16.3], ["lip-murabaha", 22.95], ["lip-follow", 27.72], ["lip-pause", 12.3]]) {
    shots.push({ name, frame: Math.round(t * fps) });
  }
}
shots.push({ name: "999-last", frame: IF01_FRAMES - 1 });
shots.sort((x, y) => x.frame - y.frame);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${String(frame).padStart(3, "0")}-${name}.png`;
  execFileSync("npx", ["remotion", "still", "build", compositionId, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
  console.log(`→ ${output}`);
}
