// Проверка готового MP4 Lesson80-1-9: H.264 yuv420p 1920×1080 30 fps, AAC
// стерео 48 кГц, длительность равна шкале и в допуске 3:30–4:20, звук на всю
// длину, пик ≤ −1 дБTP, без чёрных кадров, последняя реплика внутри файла.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { FILM } from "../src/lesson80/film-1-9/script.ts";
import { buildTimeline } from "../src/lesson80/film-1-9/timeline.ts";

const file = process.argv[2] ?? `out/${FILM.output}.mp4`;
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
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
if (dur < FILM.minSec || dur > FILM.maxSec) fail(`длительность ${dur.toFixed(1)} с вне допуска`);
if (Math.abs(Number(a.duration) - dur) > 0.25) fail(`звук ${a.duration} с короче видео`);
const last = tl.cues[tl.cues.length - 1];
if (last.audioFrom + last.durationSec > dur) fail("последняя реплика выходит за конец файла");
const frames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim());
if (frames !== tl.durationInFrames) fail(`кадров ${frames}, по шкале ${tl.durationInFrames}`);
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1]);
const black = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -an -vf blackdetect=d=0.05:pix_th=0.06 -f null - 2>&1 | grep -c black_start || true`]).toString().trim();
const mb = (statSync(file).size / 1048576).toFixed(1);
const m = Math.floor(dur / 60);
console.log(`${file}: ${v.codec_name} ${v.pix_fmt} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц ${a.channels} кан., ${m}:${String(Math.round(dur - m * 60)).padStart(2, "0")} (${dur.toFixed(2)} с, ${frames} кадров), ${mb} МБ, ${I} LUFS, пик ${P} дБTP, чёрных участков: ${black}`);
if (!(P <= -1)) fail(`клиппинг/перегруз: пик ${P} дБTP`);
if (!(I > -26 && I < -10)) fail(`громкость ${I} LUFS вне ожидаемого диапазона`);
if (Number(black) > 0) fail(`чёрные/пустые кадры: ${black} участков`);

// Зрительские паузы по звуку готового файла: окна 1/60 с, порог речи −43 дБFS
// (тон комнаты ≈ −47 дБFS). Последний звук вопроса — у начала паузы, первый
// звук ответа — у её конца, внутри паузы голоса нет.
const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], { maxBuffer: 1 << 30 });
const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
const WIN = 800; // 1/60 с
const dbAt = (i) => {
  let s = 0;
  const a0 = i * WIN;
  for (let k = a0; k < a0 + WIN && k < samples.length; k++) s += (samples[k] / 32768) ** 2;
  return 10 * Math.log10(s / WIN + 1e-12);
};
const TH = -43;
for (const p of tl.pauses) {
  const w0 = Math.round(p.from * 60);
  const w1 = Math.round(p.to * 60);
  let lastVoice = -1;
  for (let i = w0 - 30; i < w0 + 30; i++) if (dbAt(i) > TH) lastVoice = i;
  let firstVoice = -1;
  for (let i = w1 + 30; i > w1 - 30; i--) if (dbAt(i) > TH) firstVoice = i;
  let maxIn = -120;
  for (let i = w0 + 6; i < w1 - 6; i++) maxIn = Math.max(maxIn, dbAt(i));
  const frames = (firstVoice - lastVoice - 1) / 2;
  console.log(`пауза ${p.id} после реплики ${p.after}: звук вопроса до ${(lastVoice / 60 + 1 / 60).toFixed(3)} с, ответ с ${(firstVoice / 60).toFixed(3)} с, ≈ ${frames.toFixed(1)} кадров, максимум внутри ${maxIn.toFixed(1)} дБFS`);
  if (maxIn > TH) fail(`в паузе ${p.id} есть звук выше ${TH} дБFS`);
  const want = Math.round((p.to - p.from) * FILM.fps);
  if (Math.abs(frames - want) > 1) fail(`пауза ${p.id}: ${frames.toFixed(1)} кадров по звуку, нужно ${want}`);
}
