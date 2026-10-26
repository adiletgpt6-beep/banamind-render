// Проверка готового MP4 Lesson80_1_5: H.264 yuv420p 1920×1080 30 fps, AAC
// 48 кГц, длительность = шкала (245–300 с), звук на всю длину, без
// перегруза (true peak ≤ −1 дБTP), громкость ≈ −16 LUFS (−20…−13),
// faststart, нет чёрных кадров; паузы: в окнах ожидания нет речи
// (уровень звука не выше фона), ответ звучит после паузы.
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { join } from "node:path";
import { L815_VIDEO } from "../src/lesson-80-1-5/script.ts";
import { buildL815Timeline } from "../src/lesson-80-1-5/timing.ts";

const file = process.argv[2] ?? `out/${L815_VIDEO.output}.mp4`;
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
if (!file || !existsSync(file) || statSync(file).size < 1_000_000) fail("MP4 не создан");
const manifest = JSON.parse(readFileSync(join("public", L815_VIDEO.voiceDir, "manifest.json"), "utf8"));
const tl = buildL815Timeline(manifest);
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
if (!v) fail("нет видеопотока");
if (!a) fail("нет звуковой дорожки");
if (v.codec_name !== "h264") fail(`видео ${v.codec_name}, нужно h264`);
if (v.width !== 1920 || v.height !== 1080) fail(`размер ${v.width}×${v.height}, нужно 1920×1080`);
if (v.r_frame_rate !== "30/1") fail(`fps ${v.r_frame_rate}, нужно 30`);
if (v.pix_fmt !== "yuv420p") fail(`пиксельный формат ${v.pix_fmt}, нужно yuv420p`);
if (a.codec_name !== "aac") fail(`звук ${a.codec_name}, нужно aac`);
if (Number(a.sample_rate) !== 48000) fail(`частота звука ${a.sample_rate}, нужно 48000`);
const dur = Number(probe.format.duration);
if (Math.abs(dur - tl.durationSec) > 0.15) fail(`длительность ${dur.toFixed(3)} с, по шкале ${tl.durationSec.toFixed(3)} с`);
if (dur < L815_VIDEO.minSec || dur > L815_VIDEO.maxSec) fail(`длительность ${dur.toFixed(1)} с вне 245–300 с`);
const adur = Number(a.duration);
if (!(Math.abs(adur - dur) <= 0.2)) fail(`звуковая дорожка ${adur} с при видео ${dur} с`);
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
const moov = atoms.indexOf("moov");
const mdat = atoms.indexOf("mdat");
if (moov < 0 || mdat < 0 || moov > mdat) fail(`нет faststart: атомы ${atoms.join(", ")}`);
const frames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim());
if (frames !== tl.durationInFrames) fail(`кадров ${frames}, по шкале ${tl.durationInFrames}`);
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(log)?.[1]);
const P = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(log)?.[1]);
const black = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -an -vf blackdetect=d=0.05:pix_th=0.06 -f null - 2>&1 | grep -c black_start || true`]).toString().trim();
// паузы: уровень звука в окне ожидания (без первых/последних 0,2 с) не выше фона
const rms = (from, to) => {
  const out = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -ss ${from.toFixed(3)} -t ${(to - from).toFixed(3)} -i "${file}" -vn -af astats=measure_overall=RMS_level:measure_perchannel=none -f null - 2>&1 | grep "RMS level" | tail -1`]).toString();
  return Number(/RMS level dB:\s*(-?[\d.]+)/.exec(out)?.[1] ?? NaN);
};
const pauseReport = [];
for (const p of tl.pauses) {
  const q = tl.cues.find((c) => c.id === p.question);
  const ans = tl.cues.find((c) => c.id === p.answer);
  const quiet = rms(q.to + 0.25, ans.from - 0.1);
  const speech = rms(ans.from + 0.05, Math.min(ans.to, ans.from + 0.6));
  pauseReport.push(`${p.question}→${p.answer}: ожидание ${(ans.from - q.to).toFixed(3)} с, фон ${quiet.toFixed(1)} дБ, ответ ${speech.toFixed(1)} дБ`);
  if (!(quiet < -45)) fail(`в паузе после ${p.question} есть звук (${quiet.toFixed(1)} дБ RMS)`);
  if (!(speech > quiet + 12)) fail(`ответ ${p.answer} не слышен после паузы`);
  if (ans.from - q.to < p.sec) fail(`пауза после ${p.question} короче ${p.sec} с`);
}
const mb = (statSync(file).size / 1048576).toFixed(1);
console.log(`${file}: ${v.codec_name} ${v.pix_fmt} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц, ${dur.toFixed(3)} с (звук ${adur.toFixed(3)} с), ${frames} кадров, faststart, ${mb} МБ, ${I} LUFS, пик ${P} дБTP, чёрных участков: ${black}`);
for (const r of pauseReport) console.log(`  ${r}`);
if (!(P <= -1)) fail(`клиппинг/перегруз: пик ${P} дБTP`);
if (!(I > -20 && I < -13)) fail(`громкость ${I} LUFS вне −20…−13`);
if (Number(black) > 0) fail(`чёрные/пустые кадры: ${black} участков`);
if (manifest.temporary) console.log("⚠ Озвучка — временная дорожка (локальные голоса): не финальные голоса.");
