// Контрольные кадры BalaGoLive03 → out/frames-live-03/.
// Ключевые моменты: первый кадр, 15:00, телефон, календарь, пауза,
// разворот и маршрут, перелистывание, логотип, ҮЙ → МЕКТЕП → ҮЙ, оба жеста
// CTA и концовка. Использует собранный бандл (npm run bundle → build/).
// Кадры можно задать вручную: node scripts/live03-stills.mjs 120 340 …
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { F, GESTURE, LIVE3, LIVE3_FRAMES, LIVE_END, SEGMENT_STARTS, SPEECH } from "../src/live-03/edit.ts";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала выполните: npm run bundle");
  process.exit(1);
}

const auto = [
  ["00-first", 0],
  ["01-15-00", F(SPEECH.sabagy) + 6],
  ["02-link", F(SPEECH.baylanyp) + 6],
  ["03-phone", F(4.2)],
  ["04-calendar", F(SPEECH.bashka) + 12],
  ["05-school-slot", F(SPEECH.ubakyt) + 14],
  ["06-pause", F(SPEECH.toktotosuz) + 10],
  ["07-route-leg1", F(SPEECH.alypKelesiz)],
  ["08-route-leg2", F(SPEECH.kaytyp) + 10],
  ["09-one-day", F(SPEECH.birok) + 10],
  ["10-flip", F(SPEECH.kaytalansa)],
  ["11-kop-ubakyt", F(SPEECH.kop) + 18],
  ["12-logo", F(SPEECH.ataEneler) + 14],
  ["13-route-compact", F(SPEECH.mektepke2) + 6],
  ["14-route-full", F(SPEECH.uyuno) + 12],
  ["15-route-back", F(SPEECH.uyushturabyz) + 6],
  ["16-calendar-balago", F(SPEECH.ubaktysyna) + 14],
  ["17-cta-up", F(GESTURE.upHold) + 10],
  ["18-cta-up-hold", F(41.95)],
  ["19-cta-down", F(GESTURE.downStart) + 8],
  ["20-cta-down-hold", F(43.1)],
  ["21-last-line", F(SPEECH.biz) + 12],
  ["22-endcard", LIVE_END + 30],
  ["23-last", LIVE3_FRAMES - 1],
];
for (let i = 1; i < SEGMENT_STARTS.length; i++) {
  auto.push([`cut-${i}-before`, SEGMENT_STARTS[i] - 1], [`cut-${i}-after`, SEGMENT_STARTS[i]]);
}

const manual = process.argv.slice(2).map(Number).filter(Number.isFinite);
const shots = manual.length ? manual.map((f) => [`f${String(f).padStart(4, "0")}`, f]) : auto;

const outDir = "out/frames-live-03";
if (!manual.length) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl: "build", id: LIVE3.id, puppeteerInstance: browser });
for (const [name, frame] of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl: "build", composition, frame, output, puppeteerInstance: browser, overwrite: true });
  console.log(`→ кадр ${frame} → ${output}`);
}
await browser.close({ silent: true });
