// Проверка готового MP4 урока: файл есть, H.264 yuv420p + AAC, размер кадра
// 1920×1080 (или 960×540 с --light), 30 fps, длительность ≈ 20,17 с.
//   node scripts/verify-lesson-01.mjs out/lesson-01-who-built-the-house-3d.mp4 [--light]
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { LESSON_VIDEO } from "../src/lesson-01/script.ts";

const file = process.argv[2];
const light = process.argv.includes("--light");
const fail = (msg) => {
  console.error(`✗ ${file}: ${msg}`);
  process.exit(1);
};
if (!file || !existsSync(file)) fail("файл не найден");
if (statSync(file).size < 200_000) fail("файл подозрительно мал");
const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = info.streams.find((s) => s.codec_type === "video");
const a = info.streams.find((s) => s.codec_type === "audio");
if (!v) fail("нет видеодорожки");
if (!a) fail("нет звуковой дорожки");
if (v.codec_name !== "h264") fail(`видеокодек ${v.codec_name}, ожидался h264`);
if (v.pix_fmt !== "yuv420p") fail(`pix_fmt ${v.pix_fmt}, ожидался yuv420p`);
if (a.codec_name !== "aac") fail(`аудиокодек ${a.codec_name}, ожидался aac`);
const [w, h] = light ? [LESSON_VIDEO.width / 2, LESSON_VIDEO.height / 2] : [LESSON_VIDEO.width, LESSON_VIDEO.height];
if (v.width !== w || v.height !== h) fail(`размер ${v.width}×${v.height}, ожидался ${w}×${h}`);
if (v.r_frame_rate !== `${LESSON_VIDEO.fps}/1`) fail(`частота кадров ${v.r_frame_rate}, ожидалась ${LESSON_VIDEO.fps}/1`);
const dur = Number(info.format.duration);
if (Math.abs(dur - LESSON_VIDEO.durationSec) > 0.25) fail(`длительность ${dur.toFixed(2)} с, ожидалась ≈${LESSON_VIDEO.durationSec} с`);
console.log(`✓ ${file}: ${v.width}×${v.height}, ${v.codec_name}/${a.codec_name}, ${dur.toFixed(2)} с`);
