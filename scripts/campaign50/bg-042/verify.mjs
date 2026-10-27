// Проверка готового MP4 BalaGoBG042 по самому файлу (ffprobe/ffmpeg):
// 1080×1920 (или 540×960 с --mobile), 30 fps, H.264 yuv420p + AAC,
// длительность = шкале ролика (±0,15 с), звук есть и не тишина, без
// перегруза, faststart (moov перед mdat), нет чёрных кадров. С --frames=DIR
// сохраняет контрольные кадры 0 / 25 / 50 / 75 / 100 % из файла.
// Ошибка — код выхода 1.
//   node scripts/campaign50/bg-042/verify.mjs out/balago-bg-042-ep42.mp4 [--mobile] [--frames=out/check]
import { execFileSync } from "node:child_process";
import { closeSync, mkdirSync, openSync, readSync } from "node:fs";
import { timeline } from "./common.mjs";

const file = process.argv[2];
const mobile = process.argv.includes("--mobile");
const framesDir = process.argv.find((a) => a.startsWith("--frames="))?.slice(9);
if (!file) {
  console.error("usage: verify.mjs file.mp4 [--mobile] [--frames=DIR]");
  process.exit(2);
}
const sh = (cmd) => execFileSync("sh", ["-c", cmd], { maxBuffer: 1 << 26 }).toString();
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
let loud = "";
if (a) {
  const vd = sh(`ffmpeg -hide_banner -nostats -i "${file}" -map 0:a -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"`);
  const mean = Number(/mean_volume: (-?[\d.]+)/.exec(vd)?.[1] ?? -99);
  const max = Number(/max_volume: (-?[\d.]+)/.exec(vd)?.[1] ?? -99);
  const eb = sh(`ffmpeg -hide_banner -nostats -i "${file}" -map 0:a -af ebur128=peak=true -f null - 2>&1 | tail -14`);
  const lufs = /I:\s+(-?[\d.]+) LUFS/.exec(eb)?.[1];
  const tp = /Peak:\s+(-?[\d.]+) dBFS/.exec(eb)?.[1];
  loud = `средняя ${mean} дБ, пик ${max} дБ, ${lufs} LUFS, true peak ${tp} дБTP`;
  if (mean < -40) problems.push(`звук почти тишина (${mean} дБ)`);
  if (max > -0.1) problems.push(`перегруз (пик ${max} дБ)`);
}
// чёрные кадры
const black = sh(`ffmpeg -hide_banner -nostats -i "${file}" -vf blackdetect=d=0.1:pix_th=0.08 -an -f null - 2>&1 | grep -c black_start || true`).trim();
if (Number(black) > 0) problems.push(`чёрные фрагменты: ${black}`);
// faststart: атом moov раньше mdat
const fd = openSync(file, "r");
const b8 = Buffer.alloc(8);
let pos = 0;
const order = [];
for (let i = 0; i < 20; i++) {
  if (readSync(fd, b8, 0, 8, pos) < 8) break;
  let size = b8.readUInt32BE(0);
  order.push(b8.toString("latin1", 4, 8));
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
if (framesDir) {
  mkdirSync(framesDir, { recursive: true });
  const n = Math.round(dur * 30);
  for (const p of [0, 25, 50, 75, 100]) {
    const fr = Math.min(n - 1, Math.round(((n - 1) * p) / 100));
    sh(`ffmpeg -hide_banner -loglevel error -y -i "${file}" -vf "select=eq(n\\,${fr})" -frames:v 1 "${framesDir}/pct-${String(p).padStart(3, "0")}.png"`);
  }
  console.log(`  кадры 0/25/50/75/100 % → ${framesDir}`);
}
console.log(`${file}: ${v?.width}×${v?.height}, ${v?.r_frame_rate} fps, ${v?.codec_name}/${a?.codec_name} ${a?.sample_rate ?? ""} Гц, ${dur.toFixed(2)} с, атомы ${order.join(" ")}`);
if (loud) console.log(`  звук: ${loud}`);
if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log("  ✓ формат, длительность, звук, faststart и отсутствие чёрных кадров в порядке");
