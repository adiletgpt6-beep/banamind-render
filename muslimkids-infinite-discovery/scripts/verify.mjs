// Technical QA of the final MP4 with ffprobe/ffmpeg: format, duration, codecs, audio level,
// black frames. Usage: node scripts/verify.mjs [file]
import { execFileSync } from "node:child_process";

const file = process.argv[2] ?? "output/final/MuslimKids_InfiniteDiscovery_001.mp4";
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const checks = [];
const ok = (name, pass, info) => checks.push({ name, pass, info });
ok("video codec H.264", v?.codec_name === "h264", v?.codec_name);
ok("resolution 1080×1920", v?.width === 1080 && v?.height === 1920, `${v?.width}×${v?.height}`);
ok("30 fps", v?.r_frame_rate === "30/1", v?.r_frame_rate);
ok("1800 frames", Number(v?.nb_frames) === 1800, v?.nb_frames);
ok("pixel format yuv420p", v?.pix_fmt === "yuv420p", v?.pix_fmt);
ok("audio codec AAC", a?.codec_name === "aac", a?.codec_name);
const dur = Number(probe.format.duration);
ok("duration ≈ 60 s", Math.abs(dur - 60) < 0.2, dur.toFixed(2) + " s");
const vd = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"`]).toString().trim();
const mean = Number(/mean_volume: (-?[\d.]+)/.exec(vd)?.[1]);
ok("audio present (mean > -40 dB)", mean > -40, vd.replace(/\n/g, " | "));
const bd = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -vf "blackdetect=d=0.25:pix_th=0.04" -an -f null - 2>&1 | grep blackdetect || true`]).toString().trim();
ok("no unplanned black segments (≥0.25 s)", bd === "", bd || "none");
for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.name}  —  ${c.info}`);
process.exit(checks.every((c) => c.pass) ? 0 : 1);
