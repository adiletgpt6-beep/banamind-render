// Проверка готового MP4 фильма (--any-duration — для пилота): H.264 1920×1080 16:9, 30 fps, AAC, длительность
// 29:30–30:30, звук не пустой, нет чёрных участков длиннее 1 с.
// Запуск: node scripts/lesson-sapiens/verify.mjs out/sapiens.mp4
import { execFileSync } from "node:child_process";

const f = process.argv[2];
const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", f]).toString());
const v = j.streams.find((s) => s.codec_type === "video");
const a = j.streams.find((s) => s.codec_type === "audio");
const dur = Number(j.format.duration);
const fps = v.r_frame_rate.split("/").reduce((x, y) => x / y);
const errors = [];
if (v.codec_name !== "h264") errors.push(`видео ${v.codec_name}`);
if (v.width !== 1920 || v.height !== 1080) errors.push(`размер ${v.width}×${v.height}`);
if (Math.abs(fps - 30) > 0.01) errors.push(`fps ${fps}`);
if (v.pix_fmt !== "yuv420p") errors.push(`pix_fmt ${v.pix_fmt}`);
if (!a || a.codec_name !== "aac") errors.push(`звук ${a?.codec_name ?? "нет"}`);
if (!process.argv.includes("--any-duration") && (dur < 1770 || dur > 1830)) errors.push(`длительность ${dur.toFixed(1)} с`);
const loud = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${f}" -vn -af ebur128 -f null - 2>&1 | tail -n 12`]).toString();
const I = Number(/I:\s*(-?[\d.]+) LUFS/.exec(loud)?.[1]);
if (!(I > -35)) errors.push(`громкость ${I} LUFS`);
const black = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${f}" -vf "fps=2,blackdetect=d=1:pix_th=0.08" -an -f null - 2>&1 | grep blackdetect || true`]).toString().trim();
if (black) errors.push(`чёрные участки: ${black.split("\n").length}`);
const mm = `${Math.floor(Math.round(dur) / 60)}:${String(Math.round(dur) % 60).padStart(2, "0")}`;
console.log(`${f}: ${v.width}×${v.height} ${v.codec_name} ${fps} fps, ${a?.codec_name} ${a?.sample_rate} Гц, ${mm} (${dur.toFixed(2)} с), ${I} LUFS, ${(Number(j.format.size) / 1e6).toFixed(1)} МБ`);
if (black) console.log(black);
if (errors.length) {
  console.error("✗ " + errors.join("; "));
  process.exit(1);
}
console.log("✓ формат, длительность, звук и отсутствие чёрных кадров проверены");
