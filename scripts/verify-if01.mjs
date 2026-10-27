// Verifies the rendered IslamicFinanceShort01 MP4. Fails if the file is
// missing or not: H.264 yuv420p 1080×1920, 30 fps, exactly 900 frames (30 s),
// AAC audio for the whole length, no clipping (peak ≤ −0.5 dBTP), no black frames.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

const file = process.argv[2] ?? "out/islamic-finance-short-01.mp4";
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
if (!file || !existsSync(file) || statSync(file).size < 100_000) fail("MP4 not created");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
if (!v) fail("no video stream");
if (!a) fail("no audio stream");
if (v.codec_name !== "h264") fail(`video codec ${v.codec_name}, expected h264`);
if (v.width !== 1080 || v.height !== 1920) fail(`size ${v.width}×${v.height}, expected 1080×1920`);
if (v.r_frame_rate !== "30/1") fail(`fps ${v.r_frame_rate}, expected 30`);
if (v.pix_fmt !== "yuv420p") fail(`pixel format ${v.pix_fmt}, expected yuv420p`);
if (a.codec_name !== "aac") fail(`audio codec ${a.codec_name}, expected aac`);
const dur = Number(probe.format.duration);
if (Math.abs(dur - 30) > 0.1) fail(`duration ${dur.toFixed(3)} s, expected 30 s`);
const adur = Number(a.duration);
if (!(Math.abs(adur - 30) <= 0.15)) fail(`audio track ${adur} s, expected 30 s`);
const frames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim());
if (frames !== 900) fail(`${frames} frames, expected 900`);
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1]);
const black = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -an -vf blackdetect=d=0.05:pix_th=0.06 -f null - 2>&1 | grep -c black_start || true`]).toString().trim();
const mb = (statSync(file).size / 1048576).toFixed(1);
console.log(`${file}: ${v.codec_name} ${v.pix_fmt} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Hz, ${dur.toFixed(3)} s (audio ${adur.toFixed(3)} s), ${frames} frames, ${mb} MB, ${I} LUFS, peak ${P} dBTP, black segments: ${black}`);
if (!(P <= -0.5)) fail(`clipping: peak ${P} dBTP`);
if (!(I > -30)) fail(`audio too quiet (${I} LUFS)`);
if (Number(black) > 0) fail(`black/empty frames: ${black} segments`);
