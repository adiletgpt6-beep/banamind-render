// Контрольные кадры Lesson80-1-8 → out/frames-lesson-80-1-8/ и контактные
// листы (contact-*.png): начало, каждая реплика (+0,4 с), кадры до / в
// середине / после каждой зрительской паузы, ключевые действия (лодочка,
// рисунок, лист рядом с лодочкой, книга на подставке, карточка, письмо,
// готовая карточка, карточка в папке), обзор каждые 10 с, последний кадр.
// Использует бандл build/ (npm run bundle). --quick: каждый третий кадр;
// --only a,b — только кадры, в имени которых есть a или b (без контактных листов).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { FILM, L80_LINES } from "../src/lesson80/film-1-8/script.ts";
import { buildTimeline, cueById, estimateManifest } from "../src/lesson80/film-1-8/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-8/choreo.ts";

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
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const shots = [{ name: "000-first", frame: 0 }];
for (const l of L80_LINES) shots.push({ name: `line-${String(l.id).padStart(2, "0")}-${l.role}`, frame: Math.round((cueById(tl, l.id).from + 0.4) * FPS) });
for (const p of tl.pauses) {
  shots.push({ name: `pause-${p.id}-before`, frame: Math.round(p.from * FPS) - 3 });
  shots.push({ name: `pause-${p.id}-mid`, frame: Math.round(((p.from + p.to) / 2) * FPS) });
  shots.push({ name: `pause-${p.id}-after`, frame: Math.round(p.to * FPS) + 3 });
}
const ev = ch.events;
shots.push({ name: "boat-moving", frame: Math.round((ev.boatMove.from + ev.boatMove.to) / 2) });
shots.push({ name: "sheet-laid", frame: ev.sheetLaid + 6 });
shots.push({ name: "loose-carried", frame: Math.round((ev.looseTaken + ev.loosePlaced) / 2) });
shots.push({ name: "loose-placed", frame: ev.loosePlaced + 8 });
shots.push({ name: "book-carried", frame: Math.round((ev.bookLifted + ev.bookSet) / 2) });
shots.push({ name: "book-set", frame: ev.bookSet + 10 });
shots.push({ name: "card-handoff", frame: Math.round((ev.cardTaken + ev.cardPlaced) / 2) });
shots.push({ name: "card-placed-blank", frame: ev.cardPlaced + 6 });
shots.push({ name: "writing-start", frame: ev.writeStart + 20 });
shots.push({ name: "writing-mid", frame: Math.round((ev.writeStart + ev.writeEnd) / 2) });
shots.push({ name: "writing-end", frame: ev.writeEnd - 4 });
shots.push({ name: "card-complete", frame: ev.pencilDown + 40 });
shots.push({ name: "card-to-folder", frame: Math.round((ev.pencilDown + ev.cardInFolder) / 2 + 40) });
shots.push({ name: "card-in-folder", frame: ev.cardInFolder + 10 });
for (let s = 10; s < tl.durationSec; s += 10) shots.push({ name: `t-${String(s).padStart(3, "0")}s`, frame: Math.round(s * FPS) });
shots.push({ name: "999-last", frame: tl.durationInFrames - 1 });
let list = quick ? shots.filter((_, i) => i % 3 === 0) : shots;
if (only) {
  const keys = only.split(",");
  list = shots.filter((s) => keys.some((k) => s.name.includes(k)));
}

if (!only) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const names = [];
for (const { name, frame } of list) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} (${(frame / FPS).toFixed(1)} с) → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", FILM.id, output, `--frame=${Math.max(0, Math.min(tl.durationInFrames - 1, frame))}`, "--log=error", ...browser], { stdio: "inherit" });
  names.push(output);
}
if (!only) {
  for (let i = 0; i < names.length; i += 12) {
    const part = names.slice(i, i + 12);
    const inputs = part.flatMap((p) => ["-i", p]);
    const scale = part.map((_, j) => `[${j}:v]scale=480:270[s${j}]`).join(";");
    const layout = part.map((_, j) => `${(j % 4) * 480}_${Math.floor(j / 4) * 270}`).join("|");
    const refs = part.map((_, j) => `[s${j}]`).join("");
    const filter = part.length > 1 ? `${scale};${refs}xstack=inputs=${part.length}:layout=${layout}:fill=black[o]` : `[0:v]scale=480:270[o]`;
    execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-map", "[o]", `${outDir}/contact-${String(i / 12 + 1).padStart(2, "0")}.png`]);
  }
}
console.log(`Кадров: ${names.length} → ${outDir}`);
