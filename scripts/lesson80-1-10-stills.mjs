// Контрольные кадры Lesson80-1-10 → out/frames-<output>/ и контактные листы
// (contact-*.png): восемь обязательных контрольных кадров из задания
// (ctl-1…ctl-8), начало каждой реплики (+0,4 с), кадры до / в середине /
// после каждой зрительской паузы, ключевые действия с реквизитом и лодочкой,
// обзор каждые 10 с, последний кадр. Использует бандл build/ (npm run bundle).
// --quick: восемь контрольных и каждый третий из остальных; --only a,b — только кадры, в имени которых
// есть a или b (без контактных листов); --ctl — только восемь контрольных.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { FILM, L80_LINES } from "../src/lesson80/film-1-10/script.ts";
import { buildTimeline, cueById, estimateManifest, markOf } from "../src/lesson80/film-1-10/timeline.ts";
import { buildPlan } from "../src/lesson80/film-1-10/plan.ts";
import { buildBoatPlan } from "../src/lesson80/film-1-10/boatPlan.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const pl = buildPlan(tl);
const bp = buildBoatPlan(tl);
const FPS = FILM.fps;
const f = (s) => Math.round(s * FPS);
const M = (label) => markOf(tl, label);
const outDir = `out/frames-${FILM.output}`;
const quick = process.argv.includes("--quick");
const ctlOnly = process.argv.includes("--ctl");
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const P = (id) => tl.pauses.find((p) => p.id === id);
const ev = bp.events;

// восемь контрольных кадров из задания
const ctl = [
  { name: "ctl-1-start-25-boys", frame: 45 },
  { name: "ctl-2-pause1-three-drawings", frame: f(P("pause01").from + 1.2) },
  { name: "ctl-3-pause2-title-no-one-card", frame: f(P("pause02").from + 1.2) },
  { name: "ctl-4-pause3-folder-closed", frame: f(P("pause03").from + 1.2) },
  { name: "ctl-5-pause4-corner-open", frame: f(P("pause04").to - 0.8) },
  { name: "ctl-6-mid-repair", frame: Math.round((ev.foldBack + ev.foldEnd) / 2) },
  { name: "ctl-7-amir-card-caption", frame: f(M("карточка Амира").from + 0.8) },
  { name: "ctl-8-final-wide", frame: tl.durationInFrames - 30 },
];
const shots = [{ name: "000-first", frame: 0 }, ...ctl];
for (const l of L80_LINES) shots.push({ name: `line-${String(l.id).padStart(2, "0")}-${l.role}`, frame: f(cueById(tl, l.id).from + 0.4) });
for (const p of tl.pauses) {
  shots.push({ name: `${p.id}-before`, frame: f(p.from) - 3 });
  shots.push({ name: `${p.id}-mid`, frame: f((p.from + p.to) / 2) });
  shots.push({ name: `${p.id}-last`, frame: f(p.to) - 1 });
  shots.push({ name: `${p.id}-after`, frame: f(p.to) + 3 });
}
const keys = [
  ["sheet-spread", Math.round((pl.spread.from + pl.spread.to) / 2)],
  ["deal-amir", pl.dealTo.amir.give + 10],
  ["pencil-yusuf", pl.pencilTake.yusuf.grab + 4],
  ["draw-yusuf", f(M("рисует Юсуф").from + 1)],
  ["draw-amir", f(M("рисует Амир").from + 1)],
  ["draw-bilal", f(M("рисует Билал").from + 1)],
  ["class-draws", f(M("класс рисует").from + 1)],
  ["lay-three", pl.layOf.amir.put + 6],
  ["title-mid", Math.round((pl.write.start + pl.write.end) / 2)],
  ["title-done", f(M("заголовок готов").to) - 10],
  ["bird-pass", pl.birdPass.take + 4],
  ["text-one-flip", pl.textOneEv.flipped],
  ["text-one-taped", pl.textOneEv.tape2 + 10],
  ["folder-touch", pl.folderTouch.touch + 10],
  ["text-two-taped", pl.textTwoEv.tape2 + 10],
  ["boat-to-tree", Math.round((ev.moveToTree.from + ev.moveToTree.to) / 2)],
  ["boat-take", ev.lift + 6],
  ["boat-corner-opens", Math.round((ev.openStart + ev.openEnd) / 2)],
  ["boat-point", ev.point + 10],
  ["boat-hold", ev.holdSettled + 4],
  ["boat-pinch", ev.pinch + 4],
  ["boat-press", Math.round((ev.pressFrom + ev.pressTo) / 2)],
  ["boat-released", ev.letGo + 20],
  ["boat-draw-yusuf", Math.round((pl.boatPencil.yStart + pl.boatPencil.yEnd) / 2)],
  ["boat-draw-amir", Math.round((pl.boatPencil.aStart + pl.boatPencil.aEnd) / 2)],
  ["caption-mid", Math.round((pl.boatPencil.capStart + pl.boatPencil.capEnd) / 2)],
  ["brigade", f(M("сборка: карточки передают").from + 1.5)],
  ["assembly", f(M("сборка: крепления").from + 1)],
  ["grid-done", f(M("сетка готова").to) - 5],
  ["poster-lift", f(M("учитель поднимает лист").from + 2)],
  ["walk", f(M("к доске").from + 2)],
  ["hang", pl.hangEv.top2 + 5],
  ["boat-aside-final", tl.durationInFrames - 60],
];
for (const [name, frame] of keys) shots.push({ name: `key-${name}`, frame });
for (let s = 10; s < tl.durationSec; s += 10) shots.push({ name: `t-${String(s).padStart(3, "0")}s`, frame: f(s) });
shots.push({ name: "999-last", frame: tl.durationInFrames - 1 });
// --quick: восемь контрольных кадров целиком, из остальных — каждый третий
let list = ctlOnly ? ctl : quick ? [...shots.slice(0, 1 + ctl.length), ...shots.slice(1 + ctl.length).filter((_, i) => i % 3 === 0)] : shots;
if (only) {
  const ks = only.split(",");
  list = shots.filter((s) => ks.some((k) => s.name.includes(k)));
}

if (!only && !ctlOnly) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const names = [];
for (const { name, frame } of list) {
  const output = `${outDir}/${name}.png`;
  const fr = Math.max(0, Math.min(tl.durationInFrames - 1, frame));
  console.log(`→ кадр ${fr} (${(fr / FPS).toFixed(1)} с) → ${output}`);
  execFileSync("npx", ["remotion", "still", "build", FILM.composition, output, `--frame=${fr}`, "--log=error", ...browser], { stdio: "inherit" });
  names.push(output);
}
const sheet = (part, idx, tag) => {
  const inputs = part.flatMap((p) => ["-i", p]);
  const scale = part.map((_, j) => `[${j}:v]scale=480:270[s${j}]`).join(";");
  const layout = part.map((_, j) => `${(j % 4) * 480}_${Math.floor(j / 4) * 270}`).join("|");
  const refs = part.map((_, j) => `[s${j}]`).join("");
  const filter = part.length > 1 ? `${scale};${refs}xstack=inputs=${part.length}:layout=${layout}:fill=black[o]` : `[0:v]scale=480:270[o]`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-map", "[o]", `${outDir}/${tag}-${String(idx).padStart(2, "0")}.png`]);
};
if (!only) {
  if (ctlOnly) sheet(names, 1, "control");
  else {
    sheet(names.slice(1, 9), 1, "control");
    for (let i = 0; i < names.length; i += 12) sheet(names.slice(i, i + 12), i / 12 + 1, "contact");
  }
}
console.log(`Кадров: ${names.length} → ${outDir}`);
