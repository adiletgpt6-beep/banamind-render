// Контрольные кадры LESSON-80-1-6 → out/frames-lesson-80-1-6/ и контактные
// листы (contact-*.png). Кадры: начало, каждая реплика (+0,5 с), середина
// каждой учебной паузы, ключевые действия птицы (захват, посадка, укладка,
// полёт), финальная надпись, последний кадр. Использует бандл build/.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { FILM, LEARNING_PAUSES, LINES } from "../../src/lesson80/film-1-6/script.ts";
import { buildTimeline, estimateManifest } from "../../src/lesson80/core/timing.ts";
import { buildBirdPlan } from "../../src/lesson80/film-1-6/birdPlan.ts";
import { FPS } from "../../src/lesson80/core/video.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const outDir = `out/frames-${FILM.output}`;
const quick = process.argv.includes("--quick");
const shots = [{ name: "000-first", frame: 0 }];
const cue = (id) => tl.cues.find((c) => c.id === id);
for (const l of LINES) shots.push({ name: `line-${String(l.id).padStart(2, "0")}-${l.role}`, frame: Math.round((cue(l.id).from + 0.5) * FPS) });
for (const [after, p] of Object.entries(LEARNING_PAUSES)) shots.push({ name: `pause-after-${after}`, frame: Math.round((cue(Number(after)).to + p / 2) * FPS) });
const plan = buildBirdPlan(tl);
const want = { pick: 0.68, land: 0.5, place: 0.5, flyIn: 0.5, flyUp: 0.5, takeOff: 0.7, flyOut: 0.5 };
const seen = new Set();
for (const s of plan) {
  const k = want[s.state];
  if (k === undefined) continue;
  const key = `${s.state}-${Math.floor(s.at / 60)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  shots.push({ name: `bird-${s.state}-${String(Math.round(s.at)).padStart(3, "0")}s`, frame: Math.round((s.at + s.dur * k) * FPS) });
}
shots.push({ name: "caption", frame: tl.durationInFrames - Math.round(FILM.captionSec * FPS) + 40 });
shots.push({ name: "999-last", frame: tl.durationInFrames - 1 });
const list = quick ? shots.filter((_, i) => i % 3 === 0) : shots;

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const names = [];
for (const { name, frame } of list) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} (${(frame / FPS).toFixed(1)} с) → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", FILM.id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
  names.push(output);
}
// контактные листы по 12 кадров (4×3, 480×270)
for (let i = 0; i < names.length; i += 12) {
  const part = names.slice(i, i + 12);
  const inputs = part.flatMap((p) => ["-i", p]);
  const scale = part.map((_, j) => `[${j}:v]scale=480:270[s${j}]`).join(";");
  const layout = part.map((_, j) => `${(j % 4) * 480}_${Math.floor(j / 4) * 270}`).join("|");
  const refs = part.map((_, j) => `[s${j}]`).join("");
  const filter = part.length > 1 ? `${scale};${refs}xstack=inputs=${part.length}:layout=${layout}[o]` : `[0:v]scale=480:270[o]`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-map", "[o]", `${outDir}/contact-${String(i / 12 + 1).padStart(2, "0")}.png`]);
}
console.log(`Кадров: ${names.length}, контактных листов: ${Math.ceil(names.length / 12)} → ${outDir}`);
