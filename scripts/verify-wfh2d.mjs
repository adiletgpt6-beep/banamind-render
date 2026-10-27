// Проверка готового MP4 BalaGoWorkFromHome2D. Ошибка, если файла нет или
// формат не тот: H.264 yuv420p + AAC, 30 fps, длительность = шкале фильма
// (кадров ровно WFH_FRAMES), 1080×1920 (540×960 с --mobile), звук на всю
// длину, громкость ≈ −14 LUFS, true peak ≤ −1 dBTP, faststart, без чёрных
// участков; голосовые интервалы manifest попадают на звучащие места.
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { WFH_FRAMES, WFH_VIDEO } from "../src/work-from-home-2d/script.ts";
import { buildWfhCues } from "../src/work-from-home-2d/timing.ts";

const file = process.argv[2];
const mobile = process.argv.includes("--mobile");
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
const durSec = WFH_FRAMES / WFH_VIDEO.fps;
if (v.codec_name !== "h264") fail(`видео ${v.codec_name}, нужно h264`);
if (v.width !== w || v.height !== h) fail(`размер ${v.width}×${v.height}, нужно ${w}×${h}`);
if (v.r_frame_rate !== "30/1") fail(`fps ${v.r_frame_rate}, нужно 30`);
if (v.pix_fmt !== "yuv420p") fail(`пиксельный формат ${v.pix_fmt}`);
const rot = v.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? 0;
if (rot) fail(`видео повернуто (${rot}°)`);
if (a.codec_name !== "aac") fail(`звук ${a.codec_name}, нужно aac`);
const dur = Number(probe.format.duration);
if (Math.abs(dur - durSec) > 0.1) fail(`длительность ${dur.toFixed(3)} с, нужно ${durSec} с`);
const adur = Number(a.duration);
if (!(Math.abs(adur - durSec) <= 0.15)) fail(`звуковая дорожка ${adur} с, нужно ${durSec} с`);
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
const frames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim());
if (frames !== WFH_FRAMES) fail(`кадров ${frames}, нужно ${WFH_FRAMES}`);
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1]);
const black = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -an -vf blackdetect=d=0.05:pix_th=0.06 -f null - 2>&1 | grep -c black_start || true`]).toString().trim();
// громкость звука в интервалах речи (из manifest) против тишины в паузах
const manifest = JSON.parse(readFileSync(`public/${WFH_VIDEO.voiceDir}/manifest.json`, "utf8"));
const cues = buildWfhCues(manifest);
const pcm = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
const rms = (t0, t1) => {
  let acc = 0;
  let n = 0;
  for (let i = Math.floor(t0 * 8000); i < Math.min(pcm.length / 2, t1 * 8000); i++) {
    const s = pcm.readInt16LE(i * 2) / 32768;
    acc += s * s;
    n++;
  }
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, n)) || 1e-9);
};
const quiet = cues.map((c) => ({ id: c.id, db: rms(c.from, c.to) })).filter((x) => x.db < -36);
if (quiet.length) fail(`речь не слышна: ${quiet.map((q) => `${q.id} ${q.db.toFixed(1)} дБ`).join(", ")}`);
const tail = rms(durSec - 0.25, durSec);
console.log(`${file}: ${v.codec_name} ${v.pix_fmt} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц, ${dur.toFixed(3)} с (звук ${adur.toFixed(3)} с), ${frames} кадров, faststart, ${(statSync(file).size / 1048576).toFixed(1)} МБ, ${I} LUFS, пик ${P} dBTP, хвост ${tail.toFixed(1)} дБ, чёрных участков: ${black}`);
if (!(P <= -1)) fail(`true peak ${P} dBTP > −1`);
if (!(Math.abs(I + 14) <= 1.5)) fail(`громкость ${I} LUFS, нужно ≈ −14`);
if (Number(black) > 0) fail(`чёрные/пустые кадры: ${black}`);
if (tail > -45) fail(`звук не затухает к концу файла (${tail.toFixed(1)} дБ)`);
