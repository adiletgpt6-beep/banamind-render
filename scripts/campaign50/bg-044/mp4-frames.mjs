// Кадры ГОТОВОГО MP4 BG-044 для человеческой проверки: 0/25/50/75/100 %,
// середина каждой сцены и финал (контакты), плюс громкость по секундам
// (видно, что звук идёт до конца). По шкале озвучки (manifest.json).
//   node scripts/campaign50/bg-044/mp4-frames.mjs out/balago-bg-044.mp4 [out/mp4-frames]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { BG44_VIDEO } from "../../../src/campaign50/bg-044/script.ts";
import { buildBg44Timeline } from "../../../src/campaign50/bg-044/timing.ts";

const file = process.argv[2];
const outDir = process.argv[3] ?? "out/mp4-frames-bg-044";
if (!file) throw new Error("Укажите MP4");
mkdirSync(outDir, { recursive: true });
const tl = buildBg44Timeline(JSON.parse(readFileSync(`public/${BG44_VIDEO.voiceDir}/manifest.json`, "utf8")));
const fps = BG44_VIDEO.fps;
const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
const shots = [];
for (const p of [0, 25, 50, 75, 100]) shots.push({ name: `pct-${String(p).padStart(3, "0")}`, t: Math.min(dur - 0.12, (dur * p) / 100) });
tl.scenes.forEach((s, i) => shots.push({ name: `scene-${i + 1}-${s.id}-mid`, t: (s.from + s.frames / 2) / fps }));
const cta = tl.scenes.find((s) => s.id === "cta");
shots.push({ name: "cta-contacts-in", t: cta.from / fps + 1.4 });
shots.push({ name: "cta-after-last-word", t: tl.speechEnd + 0.5 });
for (const s of shots) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", s.t.toFixed(3), "-i", file, "-frames:v", "1", `${outDir}/${s.name}.png`]);
  console.log(`${s.name}: ${s.t.toFixed(2)} с`);
}
// громкость по секундам (RMS, дБFS)
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -ac 1 -ar 48000 -af asetnsamples=n=48000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level -f null - 2>&1 | grep RMS_level | awk -F= '{print $2}'`]).toString().trim().split("\n");
console.log(`RMS по секундам: ${log.map((x) => (x === "-inf" ? "∞" : Math.round(Number(x)))).join(" ")}`);
console.log(`Последнее слово: ${tl.speechEnd.toFixed(2)} с; длительность: ${dur.toFixed(2)} с; финал после речи: ${(dur - tl.speechEnd).toFixed(2)} с`);
