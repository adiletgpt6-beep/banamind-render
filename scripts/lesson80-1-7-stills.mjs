// Контрольные кадры Lesson80-1-7 → out/frames-lesson-80-1-7/ и контактные
// листы (contact-*.png): начало, каждая реплика (+0,4 с), середина каждой
// зрительской паузы, ключевые моменты (установка глобуса, щелчок лампы,
// занавеска, метка в тени, утро, две стороны, рисунок), последний кадр.
// Использует бандл build/ (npm run bundle). --quick: каждый третий кадр.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { FILM, L80_LINES } from "../src/lesson80/film-1-7/script.ts";
import { buildTimeline, cueById, estimateManifest } from "../src/lesson80/film-1-7/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-7/choreo.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const FPS = FILM.fps;
const outDir = `out/frames-${FILM.output}`;
const quick = process.argv.includes("--quick");
const shots = [{ name: "000-first", frame: 0 }];
for (const l of L80_LINES) shots.push({ name: `line-${String(l.id).padStart(2, "0")}-${l.role}`, frame: Math.round((cueById(tl, l.id).from + 0.4) * FPS) });
for (const p of tl.pauses) shots.push({ name: `pause-${p.id}`, frame: Math.round(((p.from + p.to) / 2) * FPS) });
const ev = ch.events;
shots.push({ name: "globe-contact", frame: ev.globeContact + 2 });
shots.push({ name: "lamp-on", frame: ev.lampOn + 4 });
shots.push({ name: "curtain-closed", frame: ev.curtainClose.to + 10 });
shots.push({ name: "curtain-open", frame: ev.curtainOpen.to + 10 });
for (const s of tl.spins) {
  shots.push({ name: `spin-${s.label.replace(/\s+/g, "_")}-mid`, frame: Math.round(((s.from + s.to) / 2) * FPS) });
  shots.push({ name: `spin-${s.label.replace(/\s+/g, "_")}-end`, frame: Math.round(s.to * FPS) + 2 });
}
shots.push({ name: "sunrise", frame: Math.round(tl.sunrise * FPS) });
shots.push({ name: "drawing-dot", frame: ev.drawSpans[1].to });
shots.push({ name: "drawing-arrow", frame: ev.drawSpans[2].to });
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
for (let i = 0; i < names.length; i += 12) {
  const part = names.slice(i, i + 12);
  const inputs = part.flatMap((p) => ["-i", p]);
  const scale = part.map((_, j) => `[${j}:v]scale=480:270[s${j}]`).join(";");
  const layout = part.map((_, j) => `${(j % 4) * 480}_${Math.floor(j / 4) * 270}`).join("|");
  const refs = part.map((_, j) => `[s${j}]`).join("");
  const filter = part.length > 1 ? `${scale};${refs}xstack=inputs=${part.length}:layout=${layout}:fill=black[o]` : `[0:v]scale=480:270[o]`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-map", "[o]", `${outDir}/contact-${String(i / 12 + 1).padStart(2, "0")}.png`]);
}
console.log(`Кадров: ${names.length}, контактных листов: ${Math.ceil(names.length / 12)} → ${outDir}`);
