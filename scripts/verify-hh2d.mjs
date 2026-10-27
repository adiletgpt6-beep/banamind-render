// Проверка готового MP4 BalaGoHalfHour2D. Завершается с ошибкой, если
// файла нет или формат не тот: H.264 + AAC, 30 fps, ровно 120 с,
// 1080×1920 (или 720×1280 с --phone), звук без клиппинга (пик ≤ −0,5 дБTP).
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

const file = process.argv[2];
const phone = process.argv.includes("--phone");
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
if (!file || !existsSync(file) || statSync(file).size < 100_000) fail("MP4 не создан");
const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString(),
);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
if (!v) fail("нет видеопотока");
if (!a) fail("нет звуковой дорожки");
const [w, h] = phone ? [720, 1280] : [1080, 1920];
if (v.codec_name !== "h264") fail(`видео ${v.codec_name}, нужно h264`);
if (v.width !== w || v.height !== h) fail(`размер ${v.width}×${v.height}, нужно ${w}×${h}`);
if (v.r_frame_rate !== "30/1") fail(`fps ${v.r_frame_rate}, нужно 30`);
if (a.codec_name !== "aac") fail(`звук ${a.codec_name}, нужно aac`);
const dur = Number(probe.format.duration);
if (Math.abs(dur - 120) > 0.1) fail(`длительность ${dur.toFixed(3)} с, нужно 120 с`);
const frames = Number(
  execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim(),
);
if (frames !== 3600) fail(`кадров ${frames}, нужно 3600`);
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1]);
console.log(`${file}: ${v.codec_name} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц, ${dur.toFixed(3)} с, ${frames} кадров, ${I} LUFS, пик ${P} дБTP`);
if (!(P <= -0.5)) fail(`клиппинг/перегруз: пик ${P} дБTP`);
if (!(I > -30)) fail(`звук слишком тихий (${I} LUFS)`);
