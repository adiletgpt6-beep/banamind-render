// Проверка готового MP4 BalaGoNoBackup2D. Завершается с ошибкой, если файла
// нет или формат не тот: H.264 + AAC, 30 fps, ровно 120 с (3600 кадров),
// 1080×1920 (или 720×1280 с --phone), звук без перегруза (пик ≤ −0,5 дБTP),
// нет чёрных/пустых кадров (blackdetect). Каждая актуальная реплика
// должна присутствовать в миксе, звучать слышимо и сохранять окончание.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { NB2_LINES, NB2_VIDEO } from "../src/no-backup-2d/script.ts";
import { checkNb2Timing } from "../src/no-backup-2d/timing.ts";
import { decodeMono } from "./lib/audio.mjs";
import { nb2Hash, voiceOfRole } from "./lib/nb2d-tts.mjs";
import { inspectVoiceClip, VOICE_QC_RATE, voiceManifestProblems } from "./lib/voice-mix-qc.mjs";

const file = process.argv[2];
const phone = process.argv.includes("--phone");
const fail = (msg) => {
  console.error(`::error::${file}: ${msg}`);
  process.exit(1);
};
if (!file || !existsSync(file) || statSync(file).size < 100_000) fail("MP4 не создан");
const voiceDir = join("public", NB2_VIDEO.voiceDir);
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(voiceDir, "manifest.json"), "utf8"));
} catch {
  fail("нет корректного манифеста полной озвучки");
}
const voiceProblems = voiceManifestProblems(manifest, NB2_LINES, {
  kind: "nb2d",
  hasFile: name => existsSync(join(voiceDir, name)),
  hashForLine: line => {
    const voice = voiceOfRole(line.role);
    return voice ? nb2Hash(line, voice.voiceId) : null;
  },
});
if (voiceProblems.length) fail(`неполная/устаревшая озвучка: ${voiceProblems.join("; ")}`);
const timingProblems = checkNb2Timing(manifest.lines);
if (timingProblems.length) fail(`речь обрезается монтажом: ${timingProblems.join("; ")}`);
const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString(),
);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
if (!v) fail("нет видеопотока");
if (!a) fail("нет звуковой дорожки");
const [w, h] = phone ? [720, 1280] : [1080, 1920];
if (v.codec_name !== "h264") fail(`видео ${v.codec_name}, нужно h264`);
if (v.width !== w || v.height !== h) fail(`размер ${v.width}×${v.height}, нужно ${w}×${h}`);
if (v.r_frame_rate !== "30/1") fail(`fps ${v.r_frame_rate}, нужно 30`);
if (a.codec_name !== "aac") fail(`звук ${a.codec_name}, нужно aac`);
const dur = Number(probe.format.duration);
if (Math.abs(dur - 120) > 0.1) fail(`длительность ${dur.toFixed(3)} с, нужно 120 с`);
const frames = Number(
  execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim(),
);
if (frames !== 3600) fail(`кадров ${frames}, нужно 3600`);
const runFfmpeg = args => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, ...args, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) fail(`не удалось измерить MP4: ${r.error?.message ?? r.stderr.slice(-600)}`);
  return r.stderr;
};
const log = runFfmpeg(["-vn", "-af", "ebur128=peak=true"]);
const I = Number([...log.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].at(-1)?.[1]);
const P = Number([...log.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].at(-1)?.[1]);
const black = (runFfmpeg(["-an", "-vf", "blackdetect=d=0.05:pix_th=0.06"]).match(/black_start:/g) ?? []).length;
console.log(`${file}: ${v.codec_name} ${v.width}×${v.height} ${v.r_frame_rate}, ${a.codec_name} ${a.sample_rate} Гц, ${dur.toFixed(3)} с, ${frames} кадров, ${I} LUFS, пик ${P} дБTP, чёрных участков: ${black}`);
if (!(P <= -0.5)) fail(`клиппинг/перегруз: пик ${P} дБTP`);
if (!(I > -30)) fail(`звук слишком тихий (${I} LUFS)`);
if (Number(black) > 0) fail(`чёрные/пустые кадры: ${black} участков`);
const mixed = decodeMono(file, VOICE_QC_RATE);
for (const line of NB2_LINES) {
  const ml = manifest.lines.find(x => x.id === line.id);
  const source = decodeMono(join(voiceDir, ml.file), VOICE_QC_RATE);
  const result = inspectVoiceClip(mixed, source, { line, manifestLine: ml, fps: NB2_VIDEO.fps });
  console.log(`${line.id}: голос ${result.speech.voiceDb.toFixed(1)} дБFS, совпадение ${(100 * result.speech.correlation).toFixed(1)} %, окончание ${(100 * result.ending.correlation).toFixed(1)} %`);
  if (result.problems.length) fail(result.problems.join("; "));
}
console.log(`✓ В MP4 присутствуют все ${NB2_LINES.length} реплик. Произношение требует проверки на слух.`);
