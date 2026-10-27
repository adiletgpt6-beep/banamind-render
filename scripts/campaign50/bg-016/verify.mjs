// Проверка готового MP4 BalaGoBG016 по самому файлу (ffprobe):
// 1080×1920 (или 540×960 с --mobile), 30 fps, H.264 yuv420p + AAC,
// длительность = шкале ролика (±0,15 с), звук есть и не тишина,
// faststart (moov перед mdat). Ошибка — код выхода 1.
//   node scripts/campaign50/bg-016/verify.mjs out/balago-bg-016-ep17.mp4 [--mobile]
import { execFileSync } from "node:child_process";
import { openSync, readSync, closeSync } from "node:fs";
import { timeline } from "./common.mjs";

const file = process.argv[2];
const mobile = process.argv.includes("--mobile");
if (!file) {
  console.error("usage: verify.mjs file.mp4 [--mobile]");
  process.exit(2);
}
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const problems = [];
const [W, H] = mobile ? [540, 960] : [1080, 1920];
if (!v) problems.push("нет видео");
else {
  if (v.width !== W || v.height !== H) problems.push(`размер ${v.width}×${v.height}, нужно ${W}×${H}`);
  if (v.codec_name !== "h264") problems.push(`видео ${v.codec_name}, нужно h264`);
  if (v.pix_fmt !== "yuv420p") problems.push(`pix_fmt ${v.pix_fmt}`);
  const [n, d] = v.r_frame_rate.split("/").map(Number);
  if (Math.abs(n / d - 30) > 0.01) problems.push(`fps ${v.r_frame_rate}`);
}
if (!a) problems.push("нет аудио");
else if (a.codec_name !== "aac") problems.push(`аудио ${a.codec_name}, нужно aac`);
const dur = Number(probe.format.duration);
const tl = timeline(false);
if (Math.abs(dur - tl.durationSec) > 0.15) problems.push(`длительность ${dur.toFixed(2)} с, шкала ${tl.durationSec.toFixed(2)} с`);
// громкость: звук не пустой
if (a) {
  const err = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -map 0:a -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"`]).toString();
  const mean = Number(/mean_volume: (-?[\d.]+)/.exec(err)?.[1] ?? -99);
  const max = Number(/max_volume: (-?[\d.]+)/.exec(err)?.[1] ?? -99);
  console.log(`  громкость: средняя ${mean} дБ, пик ${max} дБ`);
  if (mean < -40) problems.push(`звук почти тишина (${mean} дБ)`);
  if (max > -0.1) problems.push(`перегруз (пик ${max} дБ)`);
}
// faststart: атом moov раньше mdat
const fd = openSync(file, "r");
const buf = Buffer.alloc(8);
let pos = 0;
const order = [];
for (let i = 0; i < 20; i++) {
  if (readSync(fd, buf, 0, 8, pos) < 8) break;
  let size = buf.readUInt32BE(0);
  const type = buf.toString("latin1", 4, 8);
  order.push(type);
  if (size === 1) {
    const big = Buffer.alloc(8);
    readSync(fd, big, 0, 8, pos + 8);
    size = Number(big.readBigUInt64BE(0));
  }
  if (size < 8) break;
  pos += size;
}
closeSync(fd);
if (order.indexOf("moov") < 0 || order.indexOf("moov") > order.indexOf("mdat")) problems.push(`нет faststart (атомы: ${order.join(", ")})`);
console.log(`${file}: ${v?.width}×${v?.height}, ${v?.r_frame_rate} fps, ${v?.codec_name}/${a?.codec_name}, ${dur.toFixed(2)} с, атомы ${order.join(" ")}`);
if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log("  ✓ формат, длительность, звук и faststart в порядке");
