// Проверка готового MP4 Lesson80-1-11: H.264 yuv420p 1920×1080 30 fps, AAC
// 48 кГц, длительность и число кадров равны шкале (в допуске 3:40–4:20),
// звук на всю длину, истинный пик ≤ −1 дБTP, интегральная громкость
// −20…−13 LUFS, без чёрных кадров. Три зрительские паузы — тихий тон
// комнаты без голоса: мгновенная громкость (M, окно 400 мс) в каждой ≤ −35 LUFS.
// Запуск: npm run verify:lesson-80-1-11 [-- путь.mp4]
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { FILM } from "../src/lesson80/film-1-11/script.ts";
import { buildTimeline } from "../src/lesson80/film-1-11/timeline.ts";

const file = process.argv[2] ?? `out/${FILM.output}.mp4`;
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
const ffmpegLog = (args) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).stderr ?? "";
if (!existsSync(file) || statSync(file).size < 1_000_000) fail("MP4 не создан или слишком мал");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
if (!v) fail("нет видеопотока");
if (!a) fail("нет звуковой дорожки");
if (v.codec_name !== "h264") fail(`видео ${v.codec_name}, нужно h264`);
if (v.width !== 1920 || v.height !== 1080) fail(`размер ${v.width}×${v.height}`);
if (v.r_frame_rate !== "30/1") fail(`fps ${v.r_frame_rate}`);
if (v.pix_fmt !== "yuv420p") fail(`пиксельный формат ${v.pix_fmt}`);
if (a.codec_name !== "aac") fail(`звук ${a.codec_name}`);
if (Number(a.sample_rate) !== 48000) fail(`частота звука ${a.sample_rate}`);
const dur = Number(probe.format.duration);
const manifest = JSON.parse(readFileSync(`public/${FILM.voiceDir}/manifest.json`, "utf8"));
const tl = buildTimeline(manifest);
if (Math.abs(dur - tl.durationSec) > 0.25) fail(`длительность ${dur.toFixed(2)} с, по шкале ${tl.durationSec.toFixed(2)} с`);
if (dur < FILM.minSec || dur > FILM.maxSec) fail(`длительность ${dur.toFixed(1)} с вне допуска ${FILM.minSec}–${FILM.maxSec} с`);
if (Math.abs(Number(a.duration) - dur) > 0.25) fail(`звук ${a.duration} с короче видео`);
const last = tl.cues[tl.cues.length - 1];
if (last.audioFrom + last.durationSec > dur) fail("последняя реплика выходит за конец файла");
const frames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim());
if (frames !== tl.durationInFrames) fail(`кадров ${frames}, по шкале ${tl.durationInFrames}`);
const log = ffmpegLog(["-i", file, "-vn", "-af", "ebur128=peak=true"]);
const summary = log.slice(log.lastIndexOf("Summary:"));
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1]);
const black = (ffmpegLog(["-i", file, "-an", "-vf", "blackdetect=d=0.05:pix_th=0.06"]).match(/black_start/g) ?? []).length;
const mb = (statSync(file).size / 1048576).toFixed(1);
const m = Math.floor(dur / 60);
console.log(`${file}: ${v.codec_name} ${v.pix_fmt} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц ${a.channels} кан., ${m}:${String(Math.round(dur - m * 60)).padStart(2, "0")} (${dur.toFixed(2)} с, ${frames} кадров), ${mb} МБ, ${I} LUFS, пик ${P} дБTP, чёрных участков: ${black}`);
if (!(P <= -1)) fail(`клиппинг/перегруз: пик ${P} дБTP`);
if (!(I >= -20 && I <= -13)) fail(`громкость ${I} LUFS вне диапазона −20…−13 LUFS`);
if (black > 0) fail(`чёрные/пустые кадры: ${black} участков`);

// Зрительские паузы: окно паузы без 0,05 с по краям (стык AAC-кадров с
// последним звуком вопроса и первым звуком ответа); M — максимум мгновенной
// громкости, I — интегральная громкость окна (−70 = ниже абсолютного порога).
const EDGE = 0.05;
const loud = [];
for (const p of tl.pauses) {
  const from = p.from + EDGE;
  const len = p.to - p.from - 2 * EDGE;
  const plog = ffmpegLog(["-ss", from.toFixed(3), "-t", len.toFixed(3), "-i", file, "-vn", "-af", "ebur128"]);
  const ms = [...plog.matchAll(/\bt:\s*[\d.]+\s+TARGET:.*?\bM:\s*(-?[\d.]+)/g)].map((x) => Number(x[1]));
  const pi = Number(/I:\s+(-?[\d.]+) LUFS/.exec(plog.slice(plog.lastIndexOf("Summary:")))?.[1]);
  if (!ms.length) fail(`пауза ${p.id}: не удалось измерить громкость`);
  const maxM = Math.max(...ms);
  loud.push({ id: p.id, maxM, pi });
  console.log(`  пауза ${p.id} (после №${p.after}, ${p.from.toFixed(2)}–${p.to.toFixed(2)} с): M макс ${maxM.toFixed(1)} LUFS, I ${pi} LUFS`);
}
for (const p of loud) if (p.maxM > -35) fail(`пауза ${p.id}: мгновенная громкость ${p.maxM.toFixed(1)} LUFS > −35 LUFS (в паузе слышен голос или эффект)`);
