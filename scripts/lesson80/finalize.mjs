// Финальная сборка звука и проверка MP4 80-1-14:
//   node scripts/lesson80/finalize.mjs out/raw.mp4 out/lesson-80-1-14-can-we-count-the-gifts.mp4
// • громкость всего файла → −16 LUFS, true peak ≤ −1 dBTP (двухпроходный
//   loudnorm, линейный режим); видео копируется без перекодирования;
// • AAC 48 кГц 192 кбит/с, faststart;
// • проверка: 1920×1080, 30 к/с, H.264 yuv420p, AAC, длительность 200–240 с.
import { execFileSync } from "node:child_process";

const [inp, out] = process.argv.slice(2);
const run = (args) => execFileSync("ffmpeg", ["-hide_banner", "-nostats", "-y", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
// loudnorm печатает замер JSON в stderr
const loud = (file) => {
  const r = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`], { encoding: "utf8" });
  return JSON.parse(r.slice(r.lastIndexOf("{"), r.lastIndexOf("}") + 1));
};
const j = loud(inp);
console.log(`до: ${j.input_i} LUFS, TP ${j.input_tp} dBTP`);
const af = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
run(["-i", inp, "-map", "0:v", "-map", "0:a", "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
const k = loud(out);
console.log(`после: ${k.input_i} LUFS, TP ${k.input_tp} dBTP`);
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", out], { encoding: "utf8" }));
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const ok = v.codec_name === "h264" && v.pix_fmt === "yuv420p" && v.width === 1920 && v.height === 1080 && v.r_frame_rate === "30/1" && a?.codec_name === "aac" && dur >= 200 && dur <= 240;
console.log(`${v.width}×${v.height}, ${v.r_frame_rate}, ${v.codec_name} ${v.pix_fmt}, ${a?.codec_name} ${a?.sample_rate} Гц, ${dur.toFixed(2)} с, ${(Number(probe.format.size) / 1e6).toFixed(1)} МБ`);
if (!ok || Math.abs(Number(k.input_i) + 16) > 1.5 || Number(k.input_tp) > -0.9) {
  console.error("✗ MP4 не соответствует требованиям");
  process.exit(1);
}
console.log("✓ MP4 соответствует требованиям");
