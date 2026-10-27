// Контрольные кадры одной сцены BalaGoBG035 → out/scene-stills/<сцена>/:
// равномерно по сцене (n кадров) и моменты реплик этой сцены.
// Запуск: node scripts/campaign50/bg-035/scene-stills.mjs <hook|ask|fill|full|trial|cta> [n] [кадр сцены …]
// STILL_SCALE (по умолчанию 0.5), REMOTION_BROWSER — путь к Chrome (необязательно).
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BG35_VIDEO } from "../../../src/campaign50/bg-035/script.ts";
import { buildBg35Timeline, estimateBg35Manifest } from "../../../src/campaign50/bg-035/timing.ts";

const [id, nArg, ...extra] = process.argv.slice(2);
const mf = `public/${BG35_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : estimateBg35Manifest();
const tl = buildBg35Timeline(manifest);
const sc = tl.scenes.find((s) => s.id === id);
if (!sc) throw new Error(`Нет сцены ${id}: ${tl.scenes.map((s) => s.id).join(", ")}`);
const n = Number(nArg ?? 8);
const shots = [];
for (let k = 0; k < n; k++) {
  const rel = Math.round(4 + ((sc.frames - 8) * k) / Math.max(1, n - 1));
  shots.push({ name: `s${String(rel).padStart(4, "0")}`, frame: sc.from + rel });
}
for (const c of tl.cues.filter((x) => x.scene === id)) {
  const rel = Math.round(c.from * BG35_VIDEO.fps) - sc.from + 10;
  shots.push({ name: `s${String(rel).padStart(4, "0")}-${c.id}`, frame: sc.from + rel });
}
for (const e of extra) shots.push({ name: `s${String(e).padStart(4, "0")}-x`, frame: sc.from + Number(e) });
const outDir = `out/scene-stills/${id}`;
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/campaign50/bg-035/index.ts" });
const inputProps = { requireVoice: false };
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id: BG35_VIDEO.id, inputProps, browserExecutable });
console.log(`${id}: кадры ролика ${sc.from}…${sc.from + sc.frames - 1} (${sc.frames} кадров), речь: ${tl.cues.filter((x) => x.scene === id).map((c) => `${c.id} ${(c.from * 30 - sc.from).toFixed(0)}–${(c.to * 30 - sc.from).toFixed(0)}`).join(", ")}`);
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  await renderStill({ serveUrl, composition, frame, output, inputProps, browserExecutable, scale: Number(process.env.STILL_SCALE ?? 0.5) });
  console.log(`→ кадр сцены ${frame - sc.from} → ${output}`);
}
