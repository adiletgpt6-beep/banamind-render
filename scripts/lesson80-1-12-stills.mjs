// Контрольные кадры Lesson80-1-12 → out/frames-lesson-80-1-12-allah-hears-me/
// и контактные листы (contact-*.png): обязательные отметки задания (00:05,
// 00:15, 00:35, 01:05, 01:35, 02:05, 02:45, 03:00, 03:20, 03:45, последний
// кадр), каждая реплика (на гласной в начале фразы), кадры до / в середине / после каждой
// зрительской паузы, критические точки работы с деталями (взятие, упор,
// поворот, соединение, пятая и шестая детали, палец вдоль края), коробка,
// финальный общий план. Использует бандл build/ (npm run bundle) и один
// браузер на все кадры. --only a,b — только кадры с a или b в имени.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { FILM, L80_LINES } from "../src/lesson80/film-1-12/script.ts";
import { buildTimeline, cueById, estimateManifest, markOf } from "../src/lesson80/film-1-12/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-12/choreo.ts";
import { CAST } from "../src/lesson80/film-1-12/cast.ts";
import { blinkAt } from "../src/lesson80/rig/motion.ts";

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
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const at = (s) => Math.round(s * FPS);
const M = (label, k = 0.5) => {
  const m = markOf(tl, label);
  return at(m.from + (m.to - m.from) * k);
};
const shots = [];
const add = (name, frame) => shots.push({ name, frame: Math.max(0, Math.min(tl.durationInFrames - 1, frame)) });
for (const t of ["00:05", "00:15", "00:35", "01:05", "01:35", "02:05", "02:45", "03:00", "03:20", "03:45", "03:57"]) {
  const [mm, ss] = t.split(":").map(Number);
  add(`mark-${t.replace(":", "m")}s`, at(mm * 60 + ss));
}
// кадр реплики — середина первой протяжной гласной после 0,25 с от начала
// (а не произвольный момент, который может прийтись на «м» или запятую)
const VOWEL = /[аеёиоуыэюя]/i;
// когда голос действительно звучит, и не на моргании говорящего
const seedOf = (role) => (role === "muhammad" ? 3 : CAST.find((p) => p.id === role)?.seed ?? 1);
const lineFrame = (c) => {
  const loud = (f) => (c.env[f - Math.round(c.audioFrom * FPS)] ?? 0) >= 0.5; // на кадре звучит голос
  const open = (f) => loud(f) && [-1, 0, 1].every((d) => blinkAt(f + d, seedOf(c.role)) === 0);
  const vowels = c.chars.filter((x) => x.start >= c.from + 0.25 && VOWEL.test(x.c) && x.end - x.start >= 0.06);
  const v = vowels.find((x) => open(at((x.start + x.end) / 2))) ?? vowels[0] ?? c.chars.find((x) => VOWEL.test(x.c));
  return v ? at((v.start + v.end) / 2) : at(c.from + 0.4);
};
for (const l of L80_LINES) add(`line-${String(l.id).padStart(2, "0")}-${l.role}`, lineFrame(cueById(tl, l.id)));
for (const p of tl.pauses) {
  add(`pause-${p.id}-before`, at(p.from) - 3);
  add(`pause-${p.id}-mid`, at((p.from + p.to) / 2));
  add(`pause-${p.id}-after`, at(p.to) + 3);
}
add("act-01-study", M("Юсуф рассматривает картинку", 0.7));
add("act-02-take", M("Юсуф берёт деталь", 0.8));
add("act-03-bump", ch.events.bumps[0] + 2);
add("act-04-wiggle", M("попытка: не подходит", 0.7));
add("act-05-aside", M("Юсуф откладывает деталь", 0.8));
add("act-06-teacher-walk", M("учитель подходит", 0.5));
add("act-07-teacher-sit-mid", M("учитель садится", 0.4));
add("act-08-teacher-seated", M("учитель садится", 1));
add("act-09-bilal-book", M("Билал откладывает книгу", 0.5));
add("act-10-amir-scoot", M("Амир придвигается", 0.6));
add("act-11-not-done", M("картинка не собрана", 0.5));
add("act-12-take-leaf", M("Юсуф берёт деталь с листиком", 0.85));
add("act-13-exam-leaf", M("Юсуф рассматривает листик", 0.5));
add("act-14-amir-points", M("Амир смотрит на ветку", 0.8));
add("act-15-rotate-mid", M("поворот и соединение", 0.32));
add("act-16-rotated", M("поворот и соединение", 0.45));
add("act-17-align", M("поворот и соединение", 0.58));
add("act-18-fit", M("поворот и соединение", 0.72));
add("act-19-check", M("поворот и соединение", 0.9));
add("act-20-five-carry", M("пятая деталь", 0.5));
add("act-21-five-fit", M("пятая деталь", 0.95));
add("act-22-six-turn", M("шестая деталь", 0.6));
add("act-23-six-fit", M("шестая деталь", 0.97));
add("act-24-complete", M("картинка собрана", 0.6));
add("act-25-finger", M("палец вдоль края", 0.5));
add("act-26-box-lift", M("коробка", 0.3));
add("act-27-box-handoff", M("коробка", 0.5));
add("act-28-box-set", M("коробка", 0.85));
add("act-29-pull", M("камера отходит", 0.5));
add("act-30-final", M("финал: класс", 0.5));
for (let s = 10; s < tl.durationSec; s += 10) add(`t-${String(s).padStart(3, "0")}s`, at(s));
add("999-last", tl.durationInFrames - 1);
let list = shots;
if (only) {
  const keys = only.split(",");
  list = shots.filter((s) => keys.some((k) => s.name.includes(k)));
}
const listOnly = process.argv.includes("--list");
if (!only && !listOnly) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
// список кадров (имя, номер, время) — для просмотра и автоматических проверок
writeFileSync(`${outDir}/index.json`, JSON.stringify(shots.map((s) => ({ ...s, sec: Number((s.frame / FPS).toFixed(2)) })), null, 1) + "\n");
if (listOnly) process.exit(0);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl: "build", id: FILM.id, inputProps: {}, puppeteerInstance: browser, browserExecutable });
const names = [];
for (const { name, frame } of list) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl: "build", composition, frame, output, puppeteerInstance: browser, browserExecutable, imageFormat: "png", overwrite: true });
  console.log(`✓ ${(frame / FPS).toFixed(2)} с → ${output}`);
  names.push(output);
}
await browser.close({ silent: true });
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
