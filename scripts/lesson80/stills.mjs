// Контрольные кадры Lesson80_1_14 → out/frames-lesson80/ (бандл build/).
//   node scripts/lesson80/stills.mjs                — ключевые моменты
//   node scripts/lesson80/stills.mjs 120 900 ...    — заданные кадры
//   L80_SCALE=0.5 — уменьшенные кадры для быстрого просмотра
import { existsSync, mkdirSync } from "node:fs";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

if (!existsSync("build/index.html")) {
  console.error("Нет бандла build/. Сначала: npx remotion bundle");
  process.exit(1);
}
const outDir = "out/frames-lesson80";
mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const browser = await openBrowser("chrome", { browserExecutable });
const comp = await selectComposition({ serveUrl: "build", id: "Lesson80-1-14", puppeteerInstance: browser });
const marks = comp.props.manifest ? null : null;
void marks;
const args = process.argv.slice(2);
let shots;
if (args.length) shots = args.map((a) => (a.includes("=") ? { name: a.split("=")[0], frame: Number(a.split("=")[1]) } : { name: `f${a.padStart(5, "0")}`, frame: Number(a) }));
else {
  const M = comp.props.marks;
  const tl = { total: M.total };
  shots = [
    ["00-wide", 20],
    ["01-drink", M["s1.sip"] + 20],
    ["02-line03", M["03.start"] + 20],
    ["03-paper", M["s2.paper"] + 30],
    ["04-pause1-start", M["p1.start"] + 10],
    ["05-pause1-pov", M["p1.start"] + 120],
    ["06-draw-water", M["d1"] + 30],
    ["07-three-icons", M["s2.to"] - 10],
    ["08-window", M["s3.window"] + 20],
    ["09-count", M["s3.count"] + 40],
    ["10-line17", M["17.start"] + 10],
    ["11-empty", M["s4.empty"] + 20],
    ["12-pause2", M["p2.start"] + 75],
    ["13-line22", M["22.start"] + 40],
    ["14-water", M["s5.jug"] + 40],
    ["15-care", M["s5.care"] + 30],
    ["16-amircup", M["s6.amirSet"] + 10],
    ["17-pause3", M["p3.start"] + 75],
    ["18-grasp", M["s6.grasp"] + 2],
    ["19-carry", M["s6.carry"] + 20],
    ["20-tgrasp", M["s6.tgrasp"] + 4],
    ["21-tset", M["s6.tset"] + 4],
    ["22-pour", M["s6.pour"] + 40],
    ["23-place", M["s6.place"] + 20],
    ["24-amirsip", M["s6.amirSip"] + 20],
    ["25-turn", M["s7.turn"] + 20],
    ["26-touch", M["s7.touch"] + 20],
    ["27-view", M["s7.view"] + 30],
    ["28-write", M["s8.write"] + 60],
    ["29-board", M["s8.board"] + 40],
    ["30-pinned", M["40.start"] + 10],
    ["31-final", tl.total - 1],
  ].map(([name, frame]) => ({ name, frame }));
}
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ composition: comp, serveUrl: "build", output, frame, puppeteerInstance: browser, scale: Number(process.env.L80_SCALE ?? 1) });
  console.log(`✓ ${frame} → ${output}`);
}
await browser.close({ silent: true });
