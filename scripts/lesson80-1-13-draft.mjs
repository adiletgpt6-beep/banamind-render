// Черновые кадры Lesson80-1-13 для рабочей проверки (по оценочной шкале, если
// озвучки ещё нет): node scripts/lesson80-1-13-draft.mjs <outDir> <scale> <кадр|метка> …
// метка — «label@k» (доля отрезка шкалы) или «L12@k» (доля реплики).
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { FILM } from "../src/lesson80/film-1-13/script.ts";
import { buildTimeline, cueById, estimateManifest, markOf } from "../src/lesson80/film-1-13/timeline.ts";

const [outDir, scaleArg, ...specs] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const MAN = `public/${FILM.voiceDir}/manifest.json`;
const real = existsSync(MAN);
const tl = buildTimeline(real ? JSON.parse(readFileSync(MAN, "utf8")) : estimateManifest());
const frameOf = (s) => {
  if (/^\d+$/.test(s)) return Number(s);
  const [name, kk] = s.split("@");
  const k = Number(kk ?? 0.5);
  if (/^L\d+$/.test(name)) {
    const c = cueById(tl, Number(name.slice(1)));
    return Math.round((c.from + (c.to - c.from) * k) * FILM.fps);
  }
  if (/^P\d$/.test(name)) {
    const p = tl.pauses[Number(name.slice(1)) - 1];
    return Math.round((p.from + (p.to - p.from) * k) * FILM.fps);
  }
  const m = markOf(tl, name);
  return Math.round((m.from + (m.to - m.from) * k) * FILM.fps);
};
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browser = await openBrowser("chrome", { browserExecutable });
const inputProps = real ? {} : { draft: true };
const c = await selectComposition({ serveUrl: "build", id: FILM.id, inputProps, puppeteerInstance: browser, logLevel: "error" });
for (const s of specs) {
  const f = Math.min(c.durationInFrames - 1, frameOf(s));
  const name = `${String(f).padStart(5, "0")}-${s.replace(/[^\p{L}\p{N}@.]+/gu, "_")}`;
  await renderStill({ composition: c, serveUrl: "build", frame: f, output: `${outDir}/${name}.png`, puppeteerInstance: browser, inputProps: c.props, scale: Number(scaleArg), logLevel: "error" });
}
await browser.close({ silent: true });
console.log(`кадров: ${specs.length}, длительность ${c.durationInFrames}, озвучка: ${real ? "есть" : "оценка"}`);
