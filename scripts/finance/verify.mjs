// Проверка готового MP4: 1920×1080, 30 fps, H.264 yuv420p, AAC, faststart,
// длительность совпадает с хронометражем, звук не пустой, нет чёрных кадров.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { langOf } from "./lang.mjs";
import { buildTimeline } from "../../src/finance/timeline.ts";

const file = process.argv[2];
const L = langOf(process.argv[3]);
const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = j.streams.find((s) => s.codec_type === "video");
const a = j.streams.find((s) => s.codec_type === "audio");
const fail = [];
if (!v || v.codec_name !== "h264") fail.push(`видео не H.264: ${v?.codec_name}`);
if (v?.width !== 1920 || v?.height !== 1080) fail.push(`размер ${v?.width}×${v?.height}`);
if (v?.r_frame_rate !== "30/1") fail.push(`fps ${v?.r_frame_rate}`);
if (v?.pix_fmt !== "yuv420p") fail.push(`pix_fmt ${v?.pix_fmt}`);
if (!a || a.codec_name !== "aac") fail.push(`аудио не AAC: ${a?.codec_name}`);
const dur = Number(j.format.duration);
const manifest = JSON.parse(readFileSync(`${L.voiceDir}/manifest.json`, "utf8"));
const expected = Math.ceil(buildTimeline(L.scenes, manifest).duration * 30) / 30;
if (Math.abs(dur - expected) > 0.2) fail.push(`длительность ${dur} ≠ ${expected}`);
// faststart: атом moov до mdat
const head = readFileSync(file).subarray(0, 64 * 1024).toString("latin1");
if (!(head.indexOf("moov") >= 0 && (head.indexOf("mdat") < 0 || head.indexOf("moov") < head.indexOf("mdat")))) fail.push("нет faststart (moov не в начале)");
const vol = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -map 0:a -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"`]).toString();
const mean = Number(/mean_volume: (-?[\d.]+)/.exec(vol)?.[1]);
const max = Number(/max_volume: (-?[\d.]+)/.exec(vol)?.[1]);
if (!(mean > -40)) fail.push(`звук слишком тихий/пустой: ${mean} dB`);
if (max > -0.5) fail.push(`клиппинг: пик ${max} dB`);
const black = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vf "blackdetect=d=0.1:pix_th=0.1" -an -f null - 2>&1 | grep black_start || true`]).toString().trim();
if (black) fail.push(`чёрные кадры: ${black.slice(0, 300)}`);
console.log(`${file}: ${v?.width}×${v?.height} ${v?.r_frame_rate} ${v?.codec_name}/${v?.pix_fmt}, ${a?.codec_name} ${a?.sample_rate} Гц, ${dur.toFixed(2)} с (ожидалось ${expected.toFixed(2)}), звук mean ${mean} dB / max ${max} dB`);
if (fail.length) {
  console.error("✗ " + fail.join("\n✗ "));
  process.exit(1);
}
console.log("✓ формат, длительность, звук и faststart в порядке");
