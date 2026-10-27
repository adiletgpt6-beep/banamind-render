// Контрольные кадры BG-002 → out/frames-bg-002/: 0 %, 25 %, 50 %, 75 %,
// финал; начало/середина/конец каждой сцены; кадр каждой реплики;
// связующие действия (конфликт в календаре, эскертме, касание BalaGo,
// таймер у двери). Использует бандл точки входа BG-002:
//   npx remotion bundle src/campaign50/bg-002/index.ts --out-dir=out/bundle-bg-002
// Аргумент --draft — беззвучный черновик BG002-Draft (до синтеза голоса).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { BG2_LINES, BG2_SCENES, BG2_TIMER, BG2_VIDEO } from "../../../src/campaign50/bg-002/script.ts";
import { bg2DurationFrames, estimateBg2Manifest } from "../../../src/campaign50/bg-002/timing.ts";

const bundle = process.env.BG2_BUNDLE ?? "out/bundle-bg-002";
const draft = process.argv.includes("--draft");
if (!existsSync(join(bundle, "index.html"))) {
  console.error(`Нет бандла ${bundle}/. Сначала: npx remotion bundle src/campaign50/bg-002/index.ts --out-dir=${bundle}`);
  process.exit(1);
}
const manPath = join("public", BG2_VIDEO.voiceDir, "manifest.json");
const manifest = !draft && existsSync(manPath) ? JSON.parse(readFileSync(manPath, "utf8")) : estimateBg2Manifest();
const total = bg2DurationFrames(manifest);
const id = draft ? `${BG2_VIDEO.id}-Draft` : BG2_VIDEO.id;
const outDir = "out/frames-bg-002";
const fps = BG2_VIDEO.fps;
const sc = (k) => Math.round(BG2_SCENES.find((s) => s.id === k).from * fps);
const shots = [
  { name: "p000", frame: 0 },
  { name: "p025", frame: Math.round(total * 0.25) },
  { name: "p050", frame: Math.round(total * 0.5) },
  { name: "p075", frame: Math.round(total * 0.75) },
  { name: "p100-final", frame: total - 1 },
  { name: "link-1-calendar-conflict", frame: sc("calendar") + 70 },
  { name: "link-2-note-decision", frame: sc("calendar") + 270 },
  { name: "link-3-open-balago", frame: sc("app") + 44 },
  { name: "link-4-route", frame: sc("app") + 150 },
  { name: "link-5-form-open", frame: sc("terms") + 270 },
  { name: "link-6-timer-door", frame: Math.round(BG2_TIMER.stopAt * fps) + 6 },
];
BG2_SCENES.forEach((s, i) => {
  const n = String(i + 1).padStart(2, "0");
  const a = Math.round(s.from * fps);
  const b = Math.min(total, Math.round(s.to * fps));
  shots.push({ name: `s${n}a-${s.id}-start`, frame: a + 6 }, { name: `s${n}b-${s.id}-mid`, frame: Math.round((a + b) / 2) }, { name: `s${n}c-${s.id}-end`, frame: b - 6 });
});
for (const l of BG2_LINES) shots.push({ name: `line-${l.id}`, frame: Math.round((l.at + 0.6) * fps) });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
for (const { name, frame } of shots) {
  const output = `${outDir}/${name}.png`;
  console.log(`→ кадр ${frame} → ${output}`);
  execFileSync("npx", ["remotion", "still", bundle, id, output, `--frame=${frame}`, "--log=error", ...browser], { stdio: "inherit" });
}
