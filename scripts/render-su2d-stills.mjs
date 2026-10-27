// Контрольные кадры BalaGoTwoSundays2D → out/frames-two-sundays-2d/.
// Для каждой сцены: начало, середина, конец; кадр каждой реплики; ключевые
// действия (KEYFRAMES); первый кадр контактной карточки и последний кадр.
// Использует собранный бандл (npm run bundle → build/) и timeline.json.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { SU2_VIDEO } from "../src/two-sundays-2d/script.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const tl = JSON.parse(readFileSync(`public/${SU2_VIDEO.voiceDir}/timeline.json`, "utf8"));
const outDir = "out/frames-two-sundays-2d";
const fps = SU2_VIDEO.fps;
const only = process.argv.slice(2);
const shots = [{ name: "000-first", frame: 0 }];
tl.scenes.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  shots.push({ name: `${n}a-${s.id}-start`, frame: s.fromFrame + 6 });
  shots.push({ name: `${n}b-${s.id}-mid`, frame: Math.round((s.fromFrame + s.toFrame) / 2) });
  shots.push({ name: `${n}c-${s.id}-end`, frame: s.toFrame - 6 });
});
for (const s of tl.segments) shots.push({ name: `line-${s.id}`, frame: Math.round((s.from + 0.6) * fps) });
shots.push({ name: "998-contact-first", frame: tl.contactFromFrame });
shots.push({ name: "999-last", frame: tl.frames - 1 });

const list = only.length ? shots.filter((s) => only.some((o) => s.name.includes(o))) : shots;
if (!only.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of list) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", SU2_VIDEO.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
