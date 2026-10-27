// Проверка готового MP4: node scripts/verify.mjs [путь]
// Формат 1080×1920, 30 fps, 1800 кадров, H.264 + AAC, без чёрных кадров, звук не тише −30 LUFS.
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const file = path.resolve(root, process.argv[2] ?? "output/final/MuslimKids_LivingBook_003.mp4");
const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", file]).toString(),
);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const run = (args) => spawnSync("ffmpeg", args, { encoding: "utf8" }).stderr ?? "";
const blackErr = run(["-hide_banner", "-i", file, "-vf", "blackdetect=d=0.05:pix_th=0.06", "-an", "-f", "null", "-"]);
const loud = run(["-hide_banner", "-i", file, "-vn", "-af", "ebur128", "-f", "null", "-"]);
const I = Number((loud.match(/I:\s+(-?[\d.]+) LUFS/g) ?? []).pop()?.match(/-?[\d.]+/)?.[0]);
const checks = [
  ["разрешение 1080×1920", v.width === 1080 && v.height === 1920, `${v.width}×${v.height}`],
  ["30 fps", v.r_frame_rate === "30/1", v.r_frame_rate],
  ["1800 кадров", Number(v.nb_read_frames) === 1800, v.nb_read_frames],
  ["H.264", v.codec_name === "h264", `${v.codec_name} ${v.pix_fmt}`],
  ["AAC", a?.codec_name === "aac", a ? `${a.codec_name} ${a.sample_rate} Гц ${a.channels} кан.` : "нет"],
  ["длительность ≈ 60 c", Math.abs(Number(probe.format.duration) - 60) < 0.1, probe.format.duration],
  ["нет чёрных кадров", !/black_start/.test(blackErr), /black_start/.test(blackErr) ? "есть" : "нет"],
  ["громкость звука", I > -24 && I < -12, `${I} LUFS`],
];
let ok = true;
for (const [name, pass, val] of checks) {
  ok &&= pass;
  console.log(`${pass ? "✔" : "✘"} ${name}: ${val}`);
}
console.log(`Размер: ${(Number(probe.format.size) / 1e6).toFixed(1)} МБ, битрейт ${(Number(probe.format.bit_rate) / 1e6).toFixed(1)} Мбит/с`);
process.exit(ok ? 0 : 1);
