// Контрольные кадры выпуска: середина каждой сцены + ключевые моменты.
// Запуск: node scripts/finance/stills.mjs [--draft]  → out/finance-frames/*.png
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { langOf } from "./lang.mjs";
import { buildTimeline } from "../../src/finance/timeline.ts";

const LANG = process.argv.find((a) => a.startsWith("--lang="))?.slice(7) ?? "en";
const L = langOf(LANG);
const MAN = `${L.voiceDir}/manifest.json`;
const draft = process.argv.includes("--draft") || !existsSync(MAN);
const manifest = draft ? null : JSON.parse(readFileSync(MAN, "utf8"));
const tl = buildTimeline(L.scenes, manifest);
const comp = draft ? `${L.composition.replace("Ep01Ru", "Ep01RuDraft").replace(/Ep01$/, "Ep01Draft")}` : L.composition;
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
mkdirSync("out/finance-frames", { recursive: true });
const prefix = LANG === "en" ? "" : `${LANG}-`;
const frames = [];
for (const s of tl.scenes) {
  if (only && !only.includes(s.id)) continue;
  const end = s.lines.at(-1)?.speechTo ?? s.to;
  frames.push([`${s.id}-a`, Math.round((s.from + 0.9) * 30)]);
  frames.push([`${s.id}-b`, Math.round(((s.from + end) / 2) * 30)]);
  frames.push([`${s.id}-c`, Math.round((end - 0.1) * 30)]);
}
execFileSync("npx", ["remotion", "bundle", "src/finance/index.ts", "--out-dir=out/finance-bundle", "--log=error"], { stdio: "inherit" });
for (const [name, frame] of frames) {
  execFileSync("npx", ["remotion", "still", "out/finance-bundle", comp, `out/finance-frames/${prefix}${name}.png`, `--frame=${frame}`, "--log=error"], { stdio: "inherit" });
}
console.log(`Кадров: ${frames.length} (${comp})`);
