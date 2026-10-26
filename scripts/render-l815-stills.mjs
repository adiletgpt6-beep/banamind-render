// Контрольные кадры Lesson80_1_5 → out/frames-lesson-80-1-5/: начало, середина
// и конец каждой сцены, середина каждой реплики, середина каждой паузы,
// ключевые действия (сгибы, вода, первый сгиб), финал.
// Запуск: node scripts/render-l815-stills.mjs [--bundle build]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { L815_VIDEO } from "../src/lesson-80-1-5/script.ts";
import { buildL815Timeline, estimateL815Manifest } from "../src/lesson-80-1-5/timing.ts";

const MANIFEST = join("public", L815_VIDEO.voiceDir, "manifest.json");
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateL815Manifest();
const tl = buildL815Timeline(manifest);
const entry = process.argv.includes("--bundle") ? "build" : "src/index.ts";
const outDir = "out/frames-lesson-80-1-5";
const shots = [{ name: "000-first", frame: 0 }];
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: s.from + 6 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((s.from + s.to) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: s.to - 6 });
});
for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.fromFrame + c.toFrame) / 2) });
for (const p of tl.pauses) shots.push({ name: `pause-${p.question}`, frame: Math.round((p.from + p.to) / 2) });
for (const a of tl.actions) shots.push({ name: `action-${a.id}`, frame: Math.round((a.from + a.to) / 2) });
shots.push({ name: "999-last", frame: tl.durationInFrames - 1 });
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", entry, L815_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
