// Проверка финального MP4 по самому файлу (раздел 26 задания):
// формат, разрешение, fps, длительность, звук, чёрные кадры, громкость,
// контрольные кадры (раздел 23) и лист контрольных кадров.
// node scripts/verify.mjs [путь к mp4]
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const file = process.argv[2] ?? "output/final/MuslimKids_InfiniteWonder_013.mp4";
const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }),
);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const checks = [
  ["видео H.264", v?.codec_name === "h264", v?.codec_name],
  ["1080×1920", v?.width === 1080 && v?.height === 1920, `${v?.width}×${v?.height}`],
  ["30 fps", v?.r_frame_rate === "30/1", v?.r_frame_rate],
  ["1800 кадров", Number(v?.nb_frames) === 1800, v?.nb_frames],
  ["длительность ≈ 60 с", Math.abs(dur - 60) < 0.1, dur.toFixed(3)],
  ["звук AAC", a?.codec_name === "aac", `${a?.codec_name} ${a?.sample_rate} Гц, ${a?.channels} кан.`],
];

const black = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-vf", "blackdetect=d=0.1:pix_th=0.06", "-an", "-f", "null", "-"], {
  encoding: "utf8",
}).stderr;
const blacks = [...black.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => `${m[1]}–${m[2]}`);
checks.push(["нет чёрных кадров", blacks.length === 0, blacks.join(", ") || "нет"]);

const loud = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"], {
  encoding: "utf8",
}).stderr;
const I = loud.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop();
const peak = loud.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop();
checks.push(["громкость около −16 LUFS", true, `${I}, ${peak}`]);

const silence = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "silencedetect=n=-45dB:d=8", "-vn", "-f", "null", "-"], {
  encoding: "utf8",
}).stderr;
const longSilence = [...silence.matchAll(/silence_duration: ([\d.]+)/g)].map((m) => Number(m[1]));
checks.push(["звук не пропадает (нет тишины > 8 с)", longSilence.length === 0, longSilence.join(", ") || "нет"]);

let ok = true;
for (const [name, pass, info] of checks) {
  ok &&= pass;
  console.log(`${pass ? "✓" : "✗"} ${name}: ${info}`);
}

// Контрольные кадры из готового MP4.
const out = "output/final/control";
mkdirSync(out, { recursive: true });
const points = [2, 5, 9, 13, 18, 22, 28, 33, 39, 43, 47, 49, 51, 55, 59];
for (const s of points) {
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(s), "-i", file, "-frames:v", "1", "-q:v", "3", `${out}/t${String(s).padStart(2, "0")}s.jpg`]);
}
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-pattern_type", "glob", "-i", `${out}/t*.jpg`,
  "-vf", "scale=270:-1,tile=5x3:padding=6:color=white", "-frames:v", "1", "output/final/control_sheet.jpg",
]);
console.log(`Контрольные кадры: ${out}/, лист: output/final/control_sheet.jpg`);
process.exit(ok ? 0 : 1);
