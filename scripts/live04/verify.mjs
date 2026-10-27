// Проверка готового MP4 BalaGoLive04Motion (падает, если что-то не так):
// H.264 yuv420p + AAC, 30 fps, 1080×1920 (или 540×960 с --mobile),
// длительность = длительность композиции, звук на всю длину, без перегруза,
// faststart (moov перед mdat).
//   node scripts/live04/verify.mjs out/balago-live04-motion.mp4 [--mobile] [--seconds=44.7]
import { execFileSync, spawnSync } from "node:child_process";
import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";

const file = process.argv[2];
const mobile = process.argv.includes("--mobile");
const secArg = process.argv.find((a) => a.startsWith("--seconds="));
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
if (!file || !existsSync(file) || statSync(file).size < 100_000) fail("MP4 не создан");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
if (!v) fail("нет видеопотока");
if (!a) fail("нет звуковой дорожки");
const [w, h] = mobile ? [540, 960] : [1080, 1920];
if (v.codec_name !== "h264") fail(`видео ${v.codec_name}, нужно h264`);
if (v.width !== w || v.height !== h) fail(`размер ${v.width}×${v.height}, нужно ${w}×${h}`);
if (v.r_frame_rate !== "30/1") fail(`fps ${v.r_frame_rate}, нужно 30`);
if (v.pix_fmt !== "yuv420p") fail(`пиксельный формат ${v.pix_fmt}`);
if (a.codec_name !== "aac") fail(`звук ${a.codec_name}, нужно aac`);
const dur = Number(probe.format.duration);
if (secArg) {
  const want = Number(secArg.split("=")[1]);
  if (Math.abs(dur - want) > 0.15) fail(`длительность ${dur.toFixed(3)} с, ожидалось ${want.toFixed(3)} с`);
} else if (dur < 40 || dur > 60) fail(`длительность ${dur.toFixed(2)} с вне 40–60 с`);
const adur = Number(a.duration ?? dur);
if (adur < dur - 0.3) fail(`звук ${adur.toFixed(2)} с короче видео ${dur.toFixed(2)} с`);
// громкость: целиком и по частям (голос в начале, финал)
const loud = (from, len) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-ss", String(from), "-t", String(len), "-i", file, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" });
  const s = r.stderr;
  const i = Number(/I:\s+(-?[\d.]+) LUFS/.exec(s.slice(s.lastIndexOf("Summary")))?.[1]);
  const pk = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(s.slice(s.lastIndexOf("Summary")))?.[1]);
  return { i, pk };
};
const all = loud(0, dur);
if (!(all.i > -24 && all.i < -10)) fail(`громкость ${all.i} LUFS вне −24…−10`);
if (all.pk > -0.3) fail(`перегруз: пик ${all.pk} дБTP`);
const start = loud(0.4, 3);
if (!(start.i > -30)) fail(`в начале нет голоса (${start.i} LUFS)`);
// faststart
const fd = openSync(file, "r");
const buf = Buffer.alloc(Math.min(statSync(file).size, 1 << 20));
readSync(fd, buf, 0, buf.length, 0);
closeSync(fd);
const moov = buf.indexOf("moov");
const mdat = buf.indexOf("mdat");
if (moov < 0 || (mdat >= 0 && moov > mdat)) fail("нет faststart (moov после mdat)");
console.log(`✓ ${file}: ${v.width}×${v.height}, ${v.r_frame_rate} fps, ${dur.toFixed(2)} с, H.264/AAC, ${all.i} LUFS, пик ${all.pk} дБTP, faststart`);
