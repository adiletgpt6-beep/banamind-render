// Субтитры ролика №32 файлами SRT и WebVTT (рядом, то же имя) — те же
// части и те же моменты, что в кадре (src/dad-driver/subs.ts, шкала по
// фактической озвучке).
// Запуск: node scripts/dd-srt.mjs out/balago-32-dad-driver.srt
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DD_VIDEO } from "../src/dad-driver/script.ts";
import { buildDdTimeline } from "../src/dad-driver/timing.ts";
import { requireDdManifest } from "../src/dad-driver/manifestGuard.ts";
import { subtitleWindows } from "../src/dad-driver/subs.ts";

const out = process.argv[2] ?? `out/${DD_VIDEO.output}.srt`;
const manifest = requireDdManifest(JSON.parse(readFileSync(`public/${DD_VIDEO.voiceDir}/manifest.json`, "utf8")));
const tl = buildDdTimeline(manifest);
const ts = (sec, sep = ",") => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}${sep}${p(ms % 1000, 3)}`;
};
// в кадре окно отсчитывается от середины кадра — в SRT те же границы
const wins = subtitleWindows(tl.cues);
const body = wins.map((w, i) => `${i + 1}\n${ts(w.from)} --> ${ts(w.to)}\n${w.text}\n`).join("\n");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, body);
const vtt = out.replace(/\.srt$/i, "") + ".vtt";
writeFileSync(vtt, `WEBVTT\n\n${wins.map((w) => `${ts(w.from, ".")} --> ${ts(w.to, ".")}\n${w.text}\n`).join("\n")}`);
console.log(`✓ ${out}, ${vtt}: ${wins.length} субтитров, ${(tl.frames / DD_VIDEO.fps).toFixed(2)} с`);
