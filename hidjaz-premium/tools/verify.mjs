// Проверка готового MP4 по самому файлу: 1080×1920, 30 fps, H.264 + AAC,
// 60 с, нет чёрных кадров, голос слышен (громкость), нет клиппинга.
// node hidjaz-premium/tools/verify.mjs <file.mp4> [--mobile]
import { execFileSync } from "node:child_process";

const file = process.argv[2];
const mobile = process.argv.includes("--mobile");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const [w, h] = mobile ? [540, 960] : [1080, 1920];
const errors = [];
if (!v || v.codec_name !== "h264") errors.push(`видео не H.264: ${v?.codec_name}`);
if (v && (v.width !== w || v.height !== h)) errors.push(`разрешение ${v.width}×${v.height}, нужно ${w}×${h}`);
if (v && v.r_frame_rate !== "30/1") errors.push(`fps ${v.r_frame_rate}`);
if (v && v.pix_fmt !== "yuv420p") errors.push(`pix_fmt ${v.pix_fmt}`);
if (!a || a.codec_name !== "aac") errors.push(`аудио не AAC: ${a?.codec_name}`);
if (Math.abs(dur - 60) > 0.15) errors.push(`длительность ${dur.toFixed(2)} с`);
const blackErr = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -vf blackdetect=d=0.1:pix_th=0.08 -an -f null - 2>&1 | grep black_start || true`]).toString().trim();
if (blackErr) errors.push(`чёрные кадры: ${blackErr.split("\n").length}`);
const loud = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -af ebur128=peak=true -vn -f null - 2>&1 | tail -12`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(loud)?.[1]);
const peak = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(loud)?.[1]);
if (!(I > -24 && I < -9)) errors.push(`громкость ${I} LUFS`);
if (peak > -0.5) errors.push(`пик ${peak} dBFS`);
console.log(JSON.stringify({ file, width: v?.width, height: v?.height, fps: v?.r_frame_rate, video: v?.codec_name, audio: a?.codec_name, duration: +dur.toFixed(3), lufs: I, peakDb: peak, sizeMB: +(probe.format.size / 1e6).toFixed(1) }));
if (errors.length) {
  console.error("Ошибки:\n- " + errors.join("\n- "));
  process.exit(1);
}
