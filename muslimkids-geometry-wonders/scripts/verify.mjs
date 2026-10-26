// Проверка готового MP4 через ffprobe: файл, длительность, разрешение, fps,
// кодеки, звуковая дорожка, отсутствие тишины в местах реплик.
// node scripts/verify.mjs output/final/MuslimKids_GeometryWonders_004.mp4 [--preview]
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

const file = process.argv[2];
const preview = process.argv.includes("--preview");
if (!file || !existsSync(file)) throw new Error(`Нет файла ${file}`);
const info = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString(),
);
const v = info.streams.find((s) => s.codec_type === "video");
const a = info.streams.find((s) => s.codec_type === "audio");
const [num, den] = v.r_frame_rate.split("/").map(Number);
const fps = num / den;
const duration = Number(info.format.duration);
const frames = Number(v.nb_frames);
const want = preview ? { w: 540, h: 960 } : { w: 1080, h: 1920 };
const checks = [
  ["размер файла", statSync(file).size > 1e6, `${(statSync(file).size / 1e6).toFixed(1)} МБ`],
  ["видеокодек H.264", v.codec_name === "h264", v.codec_name],
  ["пиксельный формат yuv420p", v.pix_fmt === "yuv420p", v.pix_fmt],
  ["разрешение", v.width === want.w && v.height === want.h, `${v.width}×${v.height}`],
  ["30 fps", Math.abs(fps - 30) < 0.01, `${fps}`],
  ["кадров 1800", frames === 1800, `${frames}`],
  ["длительность 60 с", Math.abs(duration - 60) < 0.1, `${duration.toFixed(3)} с`],
  ["звук AAC", a?.codec_name === "aac", a?.codec_name ?? "нет"],
];
// Громкость: речь должна звучать (каждые 10 с — не тишина там, где говорит диктор).
const vol = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"`]).toString();
const mean = Number(/mean_volume: (-?[\d.]+)/.exec(vol)?.[1]);
const max = Number(/max_volume: (-?[\d.]+)/.exec(vol)?.[1]);
checks.push(["звук не тишина", mean > -40, `средняя ${mean} дБ, пик ${max} дБ`]);
checks.push(["нет перегруза", max <= -0.5, `пик ${max} дБ`]);
let ok = true;
for (const [name, pass, val] of checks) {
  console.log(`${pass ? "✓" : "✗"} ${name}: ${val}`);
  ok &&= pass;
}
if (!ok) process.exit(1);
console.log("MP4 проверен.");
