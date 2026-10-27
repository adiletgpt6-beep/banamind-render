// Проверка готового MP4 Lesson80-1-10: H.264 yuv420p 1920×1080 30 fps, AAC
// стерео 48 кГц, длительность равна шкале и в допуске 3:40–4:20, звук на всю
// длину, пик ≤ −1 дБTP, без чёрных кадров. По звуку самого файла: четыре
// зрительские паузы — не короче 5 с тишины речи (порог −40 дБFS, окна
// 20 мс), внутри пауз нет речи; после последнего слова — 4–5 с финального
// плана без речи.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { FILM } from "../src/lesson80/film-1-10/script.ts";
import { buildTimeline } from "../src/lesson80/film-1-10/timeline.ts";

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
if (Number(a.channels) !== 2) fail(`каналов ${a.channels}, нужно стерео`);
const dur = Number(probe.format.duration);
const manifest = JSON.parse(readFileSync(`public/${FILM.voiceDir}/manifest.json`, "utf8"));
const tl = buildTimeline(manifest);
if (Math.abs(dur - tl.durationSec) > 0.25) fail(`длительность ${dur.toFixed(2)} с, по шкале ${tl.durationSec.toFixed(2)} с`);
if (dur < FILM.minSec || dur > FILM.maxSec) fail(`длительность ${dur.toFixed(1)} с вне допуска ${FILM.minSec}–${FILM.maxSec} с`);
if (Math.abs(Number(a.duration) - dur) > 0.25) fail(`звук ${a.duration} с короче видео`);
const frames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim());
if (frames !== tl.durationInFrames) fail(`кадров ${frames}, по шкале ${tl.durationInFrames}`);
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1]);
const black = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -an -vf blackdetect=d=0.05:pix_th=0.06 -f null - 2>&1 | grep -c black_start || true`]).toString().trim();

// Огибающая звука файла: окна 20 мс, дБFS (моно-сумма).
const SR = 16000;
const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
const x = new Float32Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 4));
const W = SR / 50;
const db = [];
for (let i = 0; i + W <= x.length; i += W) {
  let s = 0;
  for (let k = 0; k < W; k++) s += x[i + k] * x[i + k];
  db.push(10 * Math.log10(s / W + 1e-12));
}
const THR = -40;
const loudAt = (sec) => (db[Math.floor(sec * 50)] ?? -120) > THR;
// длина тишины речи вокруг паузы: от последнего громкого окна вопроса до
// первого громкого окна ответа. Поиск идёт от середины паузы: окно 20 мс на
// самой границе может захватить затухающий хвост последнего звука вопроса.
const silenceAround = (from, to) => {
  const mid = Math.floor(((from + to) / 2) * 50);
  let a0 = mid;
  while (a0 > 0 && db[a0 - 1] <= THR) a0--;
  let b0 = mid;
  while (b0 < db.length && db[b0] <= THR) b0++;
  return { start: a0 / 50, end: b0 / 50, len: (b0 - a0) / 50, insideLoud: (() => { for (let s = from + 0.06; s < to - 0.06; s += 0.02) if (loudAt(s)) return s; return null; })() };
};
const pauseReport = [];
for (const p of tl.pauses) {
  const r = silenceAround(p.from, p.to);
  pauseReport.push(`${p.id} ${r.start.toFixed(2)}–${r.end.toFixed(2)} с: ${r.len.toFixed(2)} с тишины (по шкале ${((p.to - p.from) * 30).toFixed(0)} кадров)`);
  if (r.insideLoud !== null) fail(`${p.id}: звук громче ${THR} дБFS внутри паузы на ${r.insideLoud.toFixed(2)} с`);
  if (r.len < 4.96) fail(`${p.id}: тишина речи ${r.len.toFixed(2)} с < 5 с`);
}
const lastEnd = tl.sound[44].end;
const tail = silenceAround(lastEnd + 0.05, dur);
const finalHold = dur - tail.start;
if (finalHold < 4 || finalHold > 5.2) fail(`после последнего слова ${finalHold.toFixed(2)} с до конца, нужно 4–5 с`);

const mb = (statSync(file).size / 1048576).toFixed(1);
const m = Math.floor(dur / 60);
console.log(`${file}: ${v.codec_name} ${v.pix_fmt} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц ${a.channels} кан., ${m}:${String(Math.round(dur - m * 60)).padStart(2, "0")} (${dur.toFixed(2)} с, ${frames} кадров), ${mb} МБ, ${I} LUFS, пик ${P} дБTP, чёрных участков: ${black}`);
for (const r of pauseReport) console.log(`  ${r}`);
console.log(`  после последнего слова: ${finalHold.toFixed(2)} с`);
if (!(P <= -1)) fail(`клиппинг/перегруз: пик ${P} дБTP`);
if (!(I > -24 && I < -12)) fail(`громкость ${I} LUFS вне ожидаемого диапазона (ориентир ≈ −18)`);
if (Number(black) > 0) fail(`чёрные/пустые кадры: ${black} участков`);
