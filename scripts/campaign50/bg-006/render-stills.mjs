// Контрольные кадры BG-006 → out/frames-bg-006/: 0 %, 25 %, 50 %, 75 %,
// финал, начало/середина каждой сцены, стоп-кадры и связующие действия.
// Использует бандл: npx remotion bundle src/campaign50/bg-006/index.ts --out-dir=build-bg-006
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { B6_FRAMES, B6_SCENES, B6_VIDEO } from "../../../src/campaign50/bg-006/script.ts";

const bundle = process.argv[2] ?? "build-bg-006";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/.`);
  process.exit(1);
}
const outDir = "out/frames-bg-006";
const fps = B6_VIDEO.fps;
const shots = [
  { name: "p000", frame: 0 },
  { name: "p025", frame: Math.round(B6_FRAMES * 0.25) },
  { name: "p050", frame: Math.round(B6_FRAMES * 0.5) },
  { name: "p075", frame: Math.round(B6_FRAMES * 0.75) },
  { name: "p100-final", frame: B6_FRAMES - 1 },
  { name: "freeze1-reminder", frame: 160 },
  { name: "freeze2-watch", frame: 195 + 265 },
  { name: "link-calendar-colleague", frame: Math.round(16.5 * fps) + 100 },
  { name: "link-colleague-advice", frame: Math.round(26.8 * fps) },
  { name: "link-search", frame: Math.round(31 * fps) + 80 },
  { name: "link-slide-to-route", frame: Math.round(31 * fps) + 250 },
  { name: "link-save", frame: Math.round(41.5 * fps) + 300 },
];
B6_SCENES.forEach((s, i) => {
  const a = Math.round(s.from * fps);
  const b = Math.round(s.to * fps);
  shots.push({ name: `s${i + 1}-${s.id}-mid`, frame: Math.round((a + b) / 2) });
});
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, B6_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
