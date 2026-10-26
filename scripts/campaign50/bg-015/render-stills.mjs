// Контрольные кадры BalaGoBG015 → out/frames-bg-015/: 0 %, 25 %, 50 %,
// 75 %, финал, середина каждой сцены и момент каждой реплики.
// Нужен бандл: npx remotion bundle src/campaign50/bg-015/index.ts --out-dir=build-bg-015
// PREVIEW=1 — по оценочным таймингам без озвучки.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { BG15_VIDEO } from "../../../src/campaign50/bg-015/script.ts";
import { buildTimeline, estimateManifest, requireManifest } from "../../../src/campaign50/bg-015/timeline.ts";

const bundle = process.env.BUNDLE ?? "build-bg-015";
if (!existsSync(join(bundle, "index.html"))) {
  console.error(`Нет бандла ${bundle}/`);
  process.exit(1);
}
const preview = process.env.PREVIEW === "1";
const m = preview ? estimateManifest() : requireManifest(JSON.parse(readFileSync(join("public", BG15_VIDEO.voiceDir, "manifest.json"), "utf8")));
const tl = buildTimeline(m);
const fps = BG15_VIDEO.fps;
const out = "out/frames-bg-015";
const shots = [0, 0.25, 0.5, 0.75].map((p) => ({ name: `p${Math.round(p * 100).toString().padStart(3, "0")}`, frame: Math.round(p * (tl.frames - 1)) }));
shots.push({ name: "p100-final", frame: tl.frames - 1 });
tl.scenes.forEach((s, i) => shots.push({ name: `s${i + 1}-${s.id}`, frame: Math.round(((s.from + s.to) / 2) * fps) }));
for (const c of tl.cues) shots.push({ name: `line-${c.id}`, frame: Math.round((c.from + 0.6) * fps) });
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const extra = [];
if (process.env.REMOTION_BROWSER) extra.push(`--browser-executable=${process.env.REMOTION_BROWSER}`);
if (preview) extra.push(`--props={"preview":true}`);
for (const { name, frame } of shots) {
  console.log(`→ кадр ${frame} → ${out}/${name}.png`);
  execFileSync("npx", ["remotion", "still", bundle, BG15_VIDEO.id, `${out}/${name}.png`, `--frame=${frame}`, "--log=error", ...extra], { stdio: "inherit" });
}
