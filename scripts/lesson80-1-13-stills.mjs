// Контрольные кадры Lesson80-1-13 → out/frames-lesson-80-1-13-allah-saw/
// и контактные листы (contact-*.png): кадр каждой из восьми сцен, каждая
// реплика (на гласной), начало / середина / конец каждой зрительской паузы,
// моменты контакта рук с деталями, крышкой, коробкой и книжками, первый и
// последний общие планы, кадры каждые 10 с. Использует бандл build/ (npm run bundle) и один
// браузер на все кадры. --only a,b — только кадры с a или b в имени.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { FILM, L80_LINES } from "../src/lesson80/film-1-13/script.ts";
import { buildTimeline, cueById, estimateManifest, markOf } from "../src/lesson80/film-1-13/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-13/choreo.ts";
import { CAST } from "../src/lesson80/film-1-13/cast.ts";
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
for (const sc of tl.scenes) add(`scene-${sc.id}`, at(sc.from + Math.min(4, (sc.to - sc.from) / 2)));
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
  add(`pause-${p.id}-start`, at(p.from) + 2);
  add(`pause-${p.id}-mid`, at((p.from + p.to) / 2));
  add(`pause-${p.id}-end`, at(p.to) - 2);
}
add("act-00-wide-first", 45);
const tr = (i) => M("Амир кладёт детали", (0.3 + i * 1.3 + 0.5) / 8.4);
for (let i = 0; i < 6; i++) add(`act-01-piece-${i + 1}`, tr(i));
add("act-02-lid", M("Амир закрывает коробку", 0.65));
add("act-03-box-lift", M("Амир встаёт", 0.6));
add("act-04-box-carry", M("Амир несёт коробку", 0.6));
add("act-05-box-set", M("Амир ставит коробку", 0.65));
add("act-06-notice", M("Юсуф замечает книжку", 0.8));
add("act-07-squat", M("Юсуф поднимает книжку", 0.4));
add("act-08-grip", M("Юсуф поднимает книжку", 0.45));
add("act-09-rise", M("Юсуф поднимает книжку", 0.75));
add("act-10-carry", M("Юсуф несёт книжку", 0.5));
add("act-11-set", M("Юсуф ставит книжку", 0.43));
add("act-12-check", M("Юсуф ставит книжку", 0.85));
add("act-13-walk-teacher", M("Юсуф идёт к учителю", 0.5));
add("act-14-teacher-turn", M("учитель поворачивается", 0.8));
add("act-15-teacher-sit", M("учитель садится", 0.6));
add("act-16-shelf-insert", M("книжка на полке", 0.5));
add("act-17-pencils", M("карандаши", 0.5));
add("act-18-amir-go", M("Амир идёт к столику", 0.6));
add("act-19-amir-grip", M("Амир берёт две книжки", 0.45));
add("act-20-amir-carry", M("Амир несёт книжки", 0.5));
add("act-21-amir-set", M("Амир ставит книжки", 0.5));
add("act-22-yusuf-walk", M("Юсуф идёт к столику", 0.6));
add("act-23-red-grip", M("Юсуф берёт красную книжку", 0.5));
add("act-24-red-carry", M("Юсуф несёт красную книжку", 0.6));
add("act-25-red-set", M("Юсуф ставит красную книжку", 0.45));
add("act-26-look", M("мальчики смотрят друг на друга", 0.5));
add("act-27-return", M("дети возвращаются", 0.5));
add("act-28-seated", M("дети возвращаются", 0.99));
add("act-29-final", M("финал: класс", 0.5));
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
