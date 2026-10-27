// Контрольные кадры Lesson80-1-11 → out/frames-lesson-80-1-11/ и контактные
// листы по 12 кадров (contact-*.png): начало, каждая реплика (+0,4 с), кадры
// до / в середине / после каждой зрительской паузы, ключевые действия (дверь,
// сумка, касание земли, вода в чашку, передача чашки, полив, чашка выпрямлена
// и на столике, письмо, готовая карточка, карточка у горшка, касание плеча,
// все на местах), обзор каждые 10 с, последний кадр.
// Бандл — каталог из L80_BUNDLE (по умолчанию build/, npm run bundle).
// --quick: каждый третий кадр; --only a,b — только кадры, в имени которых есть
// a или b (без контактных листов); --diag — только два диагностических кадра
// (diag-establishing.png, diag-final.png) с входным свойством { diag: true }.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { FILM, L80_LINES } from "../src/lesson80/film-1-11/script.ts";
import { buildTimeline, cueById, estimateManifest } from "../src/lesson80/film-1-11/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-11/choreo.ts";

const bundle = process.env.L80_BUNDLE || "build";
if (!existsSync(`${bundle}/index.html`)) {
  console.error(`Нет бандла ${bundle}/. Сначала выполните: npm run bundle (или задайте L80_BUNDLE)`);
  process.exit(1);
}
const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const FPS = FILM.fps;
const outDir = `out/frames-lesson-${FILM.productionId}`;
const quick = process.argv.includes("--quick");
const diag = process.argv.includes("--diag");
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const mid = (s) => Math.round((s.from + s.to) / 2);

const shots = [{ name: "000-first", frame: 0 }];
for (const l of L80_LINES) shots.push({ name: `line-${String(l.id).padStart(2, "0")}-${l.role}`, frame: Math.round((cueById(tl, l.id).from + 0.4) * FPS) });
for (const p of tl.pauses) {
  shots.push({ name: `pause-${p.id}-before`, frame: Math.round(p.from * FPS) - 3 });
  shots.push({ name: `pause-${p.id}-mid`, frame: Math.round(((p.from + p.to) / 2) * FPS) });
  shots.push({ name: `pause-${p.id}-after`, frame: Math.round(p.to * FPS) + 3 });
}
const ev = ch.events;
shots.push({ name: "door-open", frame: ev.doorOpen });
shots.push({ name: "bag-down", frame: ev.bagDown });
shots.push({ name: "soil-touch", frame: ev.soilTouch[0] });
shots.push({ name: "pour-cup", frame: mid(ev.pourCup) });
shots.push({ name: "cup-handoff", frame: mid(ev.handoff) });
shots.push({ name: "watering", frame: mid(ev.waterOn) });
shots.push({ name: "cup-upright", frame: ev.cupUpright + 5 });
shots.push({ name: "cup-down", frame: ev.cupDown + 10 });
shots.push({ name: "writing-start", frame: ev.writeStart + 20 });
shots.push({ name: "writing-end", frame: ev.writeEnd - 4 });
shots.push({ name: "card-complete", frame: ev.writeEnd + 30 });
shots.push({ name: "card-at-pot", frame: ev.cardPlaced + 10 });
shots.push({ name: "shoulder-touch", frame: mid(ev.touch) });
shots.push({ name: "all-seated", frame: ev.allSeated + 5 });
for (let s = 10; s < tl.durationSec; s += 10) shots.push({ name: `t-${String(s).padStart(3, "0")}s`, frame: Math.round(s * FPS) });
shots.push({ name: "999-last", frame: tl.durationInFrames - 1 });

let list = quick ? shots.filter((_, i) => i % 3 === 0) : shots;
if (only) {
  const keys = only.split(",");
  list = shots.filter((s) => keys.some((k) => s.name.includes(k)));
}
// диагностика: общий план с подписями ID (Film рисует их по свойству diag)
if (diag)
  list = [
    // первый общий план (Амир уже в комнате, у своего места) и финальный
    { name: "diag-establishing", frame: ev.doorClosed + 40, props: { diag: true } },
    { name: "diag-final", frame: tl.durationInFrames - 20, props: { diag: true } }, // до затемнения последних 12 кадров
  ];
const sheets = !only && !diag;

if (sheets) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const names = [];
for (const { name, frame, props } of list) {
  const output = `${outDir}/${name}.png`;
  const f = Math.max(0, Math.min(tl.durationInFrames - 1, frame));
  console.log(`→ кадр ${f} (${(f / FPS).toFixed(1)} с) → ${output}`);
  const extra = props ? [`--props=${JSON.stringify(props)}`] : [];
  execFileSync("npx", ["remotion", "still", bundle, FILM.id, output, `--frame=${f}`, "--log=error", ...extra, ...browser], { stdio: "inherit" });
  names.push(output);
}
if (sheets) {
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
