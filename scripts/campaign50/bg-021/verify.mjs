// Проверка готового MP4 BalaGoBG021. Ошибка, если файла нет или формат не тот:
// H.264 yuv420p + AAC, 30 fps, 1080×1920 (540×960 с --mobile), длительность
// по шкале озвучки, звук на всю длину, не тихий и без перегруза, faststart,
// без чёрных кадров.
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { BG021_VIDEO } from "../../../src/campaign50/bg-021/script.ts";
import { buildBg021Timeline } from "../../../src/campaign50/bg-021/timing.ts";

const file = process.argv[2];
const mobile = process.argv.includes("--mobile");
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
if (!file || !existsSync(file) || statSync(file).size < 100_000) fail("MP4 не создан");
const manifestPath = `public/${BG021_VIDEO.voiceDir}/manifest.json`;
const tl = buildBg021Timeline(existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null);
if (!tl.voiced) fail("озвучка неполная — шкала по оценке");
const expected = tl.totalFrames / BG021_VIDEO.fps;
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
if (Math.abs(dur - expected) > 0.1) fail(`длительность ${dur.toFixed(3)} с, нужно ${expected.toFixed(3)} с`);
if (!(Math.abs(Number(a.duration) - expected) <= 0.15)) fail(`звук ${a.duration} с, нужно ${expected.toFixed(3)} с`);
const atoms = [];
{
  const fd = openSync(file, "r");
  const size = statSync(file).size;
  const hdr = Buffer.alloc(16);
  let pos = 0;
  while (pos + 8 <= size && atoms.length < 50) {
    readSync(fd, hdr, 0, 16, pos);
    let len = hdr.readUInt32BE(0);
    const type = hdr.toString("latin1", 4, 8);
    if (len === 1) len = Number(hdr.readBigUInt64BE(8));
    else if (len === 0) len = size - pos;
    atoms.push(type);
    if (len < 8) break;
    pos += len;
  }
  closeSync(fd);
}
if (atoms.indexOf("moov") < 0 || atoms.indexOf("moov") > atoms.indexOf("mdat")) fail(`нет faststart: ${atoms.join(", ")}`);
const frames = Number(
  execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim(),
);
if (frames !== tl.totalFrames) fail(`кадров ${frames}, нужно ${tl.totalFrames}`);
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1]);
const black = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -an -vf blackdetect=d=0.05:pix_th=0.06 -f null - 2>&1 | grep -c black_start || true`]).toString().trim();
console.log(
  `${file}: ${v.codec_name} ${v.pix_fmt} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц, ${dur.toFixed(3)} с, ${frames} кадров, faststart, ${(statSync(file).size / 1048576).toFixed(1)} МБ, ${I} LUFS, пик ${P} дБTP`,
);
if (!(P <= -0.5)) fail(`перегруз: пик ${P} дБTP`);
if (!(I > -30)) fail(`звук слишком тихий (${I} LUFS)`);
if (Number(black) > 0) fail(`чёрные кадры: ${black}`);
