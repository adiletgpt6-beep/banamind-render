// Контрольные кадры BalaGoBG018 (только эта композиция): 0 %, 25 %, 50 %,
// 75 %, финал и ключевые моменты сцен. Без озвучки — черновые (по оценке
// таймингов, BG18_DRAFT=1).
//   node scripts/campaign50/bg-018/render-stills.mjs [--scale=0.5] [сек ...]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BG18_VIDEO } from "../../../src/campaign50/bg-018/script.ts";
import { buildBg18Timeline, estimateBg18Manifest } from "../../../src/campaign50/bg-018/timing.ts";

const OUT = join("out", "frames-bg-018");
mkdirSync(OUT, { recursive: true });
const manifestPath = join("public", BG18_VIDEO.voiceDir, "manifest.json");
const draft = process.env.BG18_DRAFT === "1" || !existsSync(manifestPath);
const manifest = draft ? estimateBg18Manifest() : JSON.parse(readFileSync(manifestPath, "utf8"));
const tl = buildBg18Timeline(manifest);
const scaleArg = process.argv.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? scaleArg.split("=")[1] : "1";
const secs = process.argv.slice(2).filter((a) => !a.startsWith("--")).map(Number);
const frames = secs.length
  ? secs.map((s) => ({ name: `t${s.toFixed(1)}`, frame: Math.round(s * BG18_VIDEO.fps) }))
  : [
      ...[0, 0.25, 0.5, 0.75].map((p) => ({ name: `p${Math.round(p * 100)}`, frame: Math.round(p * (tl.frames - 1)) })),
      { name: "final", frame: tl.frames - 1 },
      ...tl.scenes.map((s) => ({ name: `scene-${s.id}`, frame: Math.round(((s.from + s.to) / 2) * BG18_VIDEO.fps) })),
    ];
const props = JSON.stringify({ draft });
// один бандл на все кадры
const BUNDLE = join("out", "bundle-bg-018");
execFileSync("npx", ["remotion", "bundle", "src/campaign50/bg-018/index.ts", "--out-dir", BUNDLE, "--log=error"], { stdio: "inherit" });
for (const { name, frame } of frames) {
  const file = join(OUT, `${name}.png`);
  execFileSync("npx", ["remotion", "still", BUNDLE, BG18_VIDEO.id, file, `--frame=${frame}`, `--scale=${scale}`, `--props=${props}`, "--log=error"], { stdio: "inherit" });
  console.log(`✓ ${file} (кадр ${frame})`);
}
