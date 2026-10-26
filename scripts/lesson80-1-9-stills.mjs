// Контрольные кадры Lesson80-1-9 → out/frames-lesson-80-1-9/ и контактные
// листы (contact-*.png). Кадры выбраны по действиям, а не только «красивые»:
// начало, каждая реплика (+0,4 с), до/в середине/после каждой зрительской
// паузы, тарелка до/в момент/после опоры на столик, салфетки Амиру и Юсуфу,
// одна салфетка на подносе, касание последней салфетки, совместный контакт,
// салфетка уже у Билала, кусочек в правой руке, укусы, конец жевания,
// вставка сада, обзор каждые 10 с, последний кадр.
// Использует бандл build/ (npm run bundle); один браузер на все кадры.
//   node scripts/lesson80-1-9-stills.mjs [--quick] [--only a,b] [--frames 120,450]
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { FILM, L80_LINES } from "../src/lesson80/film-1-9/script.ts";
import { buildTimeline, cueById, estimateManifest } from "../src/lesson80/film-1-9/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-9/choreo.ts";
import { buildShots } from "../src/lesson80/film-1-9/shots.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}
const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const { shots: plan } = buildShots(tl, ch);
const FPS = FILM.fps;
const outDir = `out/frames-${FILM.output}`;
const argv = process.argv.slice(2);
const quick = argv.includes("--quick");
const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
const framesArg = argv.includes("--frames") ? argv[argv.indexOf("--frames") + 1] : null;
const ev = ch.events;
const shots = [{ name: "000-first", frame: 0 }];
if (framesArg) {
  shots.length = 0;
  for (const f of framesArg.split(",")) shots.push({ name: `f${String(f).padStart(5, "0")}`, frame: Number(f) });
} else {
  for (const l of L80_LINES) shots.push({ name: `line-${String(l.id).padStart(2, "0")}-${l.role}`, frame: Math.round((cueById(tl, l.id).from + 0.4) * FPS) });
  for (const p of tl.pauses) {
    shots.push({ name: `pause-${p.id}-before`, frame: Math.round(p.from * FPS) - 3 });
    shots.push({ name: `pause-${p.id}-mid`, frame: Math.round(((p.from + p.to) / 2) * FPS) });
    shots.push({ name: `pause-${p.id}-after`, frame: Math.round(p.to * FPS) + 3 });
  }
  const amir = ch.log.events[22];
  const add = (name, frame) => shots.push({ name, frame });
  add("plate-before-contact", ev.plateContact - 8);
  add("plate-contact", ev.plateContact);
  add("plate-released", ev.plateRelease + 10);
  add("bilal-bg01-shared", ch.log.events[0].contact + 2);
  add("bilal-bg10-giving", ch.log.events[9].take + 6);
  add("bilal-bg22-shared", ch.log.events[21].contact + 2);
  add("amir-napkin-shared", amir.contact + 2);
  add("amir-napkin-placed", amir.settle + 6);
  add("tray-two-left", ev.trayOnTable + 20);
  add("yusuf-napkin-carried", ev.yusufNapkinPlaced - 12);
  add("yusuf-napkin-placed", ev.yusufNapkinPlaced + 8);
  add("one-left-on-tray", ev.lastTouch - 30);
  add("last-touch", ev.lastTouch);
  add("last-lifted", ev.lastTake + 10);
  add("last-before-contact", ev.lastContact - 3);
  add("last-shared", ev.lastContact + 2);
  add("last-at-bilal", ev.lastRelease + 6);
  add("last-settled", ch.log.events[24].settle + 10);
  add("slice-before", ev.sliceTake - 8);
  add("slice-in-right-hand", ev.sliceTake + 10);
  add("bite-1", ev.bite1 + 2);
  add("chewing", ev.bite1 + 25);
  add("bite-2", ev.bite2 + 2);
  add("chew-end", ev.chewEnd + 2);
  for (const s of plan.filter((x) => x.kind === "garden")) add(`garden-${s.garden}`, Math.round((s.from + s.to) / 2));
  for (let s = 10; s < tl.durationSec; s += 10) add(`t-${String(s).padStart(3, "0")}s`, Math.round(s * FPS));
  add("999-last", tl.durationInFrames - 1);
}
let list = quick ? shots.filter((_, i) => i % 3 === 0) : shots;
if (only) {
  const keys = only.split(",");
  list = shots.filter((s) => keys.some((k) => s.name.includes(k)));
}
if (!only && !framesArg) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const browser = await openBrowser("chrome", { browserExecutable });
const serveUrl = "build";
const composition = await selectComposition({ serveUrl, id: FILM.id, inputProps: {}, puppeteerInstance: browser, browserExecutable });
const names = [];
const queue = list.map((s) => ({ ...s, frame: Math.max(0, Math.min(tl.durationInFrames - 1, s.frame)) }));
const CONC = Number(process.env.STILLS_CONCURRENCY ?? 3);
const work = async () => {
  for (;;) {
    const s = queue.shift();
    if (!s) return;
    const output = `${outDir}/${s.name}.png`;
    await renderStill({ composition, serveUrl, output, frame: s.frame, puppeteerInstance: browser, browserExecutable, overwrite: true, logLevel: "error" });
    console.log(`✓ ${s.name} — кадр ${s.frame} (${(s.frame / FPS).toFixed(2)} с)`);
    names.push({ output, frame: s.frame });
  }
};
await Promise.all(Array.from({ length: CONC }, work));
await browser.close({ silent: true });
names.sort((a, b) => a.frame - b.frame);
if (!only && !framesArg) {
  // оглавление листов: лист, место (слева направо, сверху вниз), кадр, время
  const index = names.map((n, i) => `contact-${String(Math.floor(i / 12) + 1).padStart(2, "0")} #${(i % 12) + 1}\t${n.output.split("/").pop()}\tкадр ${n.frame}\t${(n.frame / FPS).toFixed(2)} с`);
  writeFileSync(`${outDir}/index.txt`, index.join("\n") + "\n");
  for (let i = 0; i < names.length; i += 12) {
    const part = names.slice(i, i + 12).map((n) => n.output);
    const inputs = part.flatMap((p) => ["-i", p]);
    const scale = part.map((_, j) => `[${j}:v]scale=480:270[s${j}]`).join(";");
    const layout = part.map((_, j) => `${(j % 4) * 480}_${Math.floor(j / 4) * 270}`).join("|");
    const refs = part.map((_, j) => `[s${j}]`).join("");
    const filter = part.length > 1 ? `${scale};${refs}xstack=inputs=${part.length}:layout=${layout}:fill=black[o]` : `[0:v]scale=480:270[o]`;
    execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-map", "[o]", `${outDir}/contact-${String(i / 12 + 1).padStart(2, "0")}.png`]);
  }
}
console.log(`Кадров: ${names.length} → ${outDir}`);
