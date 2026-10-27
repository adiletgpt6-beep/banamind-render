// Проверка готового MP4 ролика 80-1-4 «Один Создатель»:
//   • 1920×1080 (16:9), 30 к/с, H.264 yuv420p + AAC 48 кГц, видео и звук есть;
//   • длительность 4:15–5:00 и совпадает со шкалой (±0,2 с);
//   • громкость ≈ −16…−18 LUFS, true peak ≤ −1 dBTP;
//   • нет чёрных кадров и «пустых» фрагментов (почти однотонный кадр);
//   • четыре паузы для ответа зрителя — по звуку готового файла: от конца
//     вопроса до начала ответа нет речи (только тихий фон комнаты).
// Запуск: npm run verify:80-1-4 [-- путь.mp4] [--lang=ky]
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { A4_DURATION } from "../src/lesson80-1-4/script.ts";
import { buildTimeline, checkViewerPauses } from "../src/lesson80-1-4/timeline.ts";
import { LANG, PACK, positional, VOICE_DIR } from "./lib/a4-lang.mjs";

// языковая версия: --lang=ky — кыргызский файл и его озвучка
const A4_VIDEO = PACK.video;
const file = positional()[0] ?? `out/${A4_VIDEO.output}.mp4`;
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }));
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const fails = [];
const ok = (c, msg) => (c ? console.log(`✓ ${msg}`) : fails.push(msg));
const mmss = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
ok(v && v.width === 1920 && v.height === 1080, `видео 1920×1080, 16:9 (${v?.width}×${v?.height})`);
ok(v && v.codec_name === "h264" && v.pix_fmt === "yuv420p", `H.264 yuv420p (${v?.codec_name}, ${v?.pix_fmt})`);
ok(v && v.r_frame_rate === "30/1", `30 к/с (${v?.r_frame_rate})`);
ok(a && a.codec_name === "aac" && a.sample_rate === "48000", `AAC 48 кГц (${a?.codec_name}, ${a?.sample_rate})`);
ok(dur >= A4_DURATION.min && dur <= A4_DURATION.max, `длительность ${mmss(dur)} (${dur.toFixed(2)} с) в диапазоне 4:15–5:00`);
const T = buildTimeline(JSON.parse(readFileSync(`${VOICE_DIR}/manifest.json`, "utf8")), A4_VIDEO.fps, LANG);
ok(Math.abs(dur - (T.frames + 3) / 30) < 0.25, `длительность совпадает со шкалой (${(T.frames / 30).toFixed(2)} с)`);
const r128 = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -map 0:a -af ebur128=peak=true -f null - 2>&1 | tail -14`], { encoding: "utf8" });
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(r128)?.[1]);
const TP = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(r128.slice(r128.indexOf("True peak")))?.[1]);
ok(I <= -15.5 && I >= -18.5, `громкость ${I} LUFS (цель −16…−18)`);
ok(TP <= -1, `true peak ${TP} dBTP (≤ −1)`);
const black = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vf blackdetect=d=0.1:pic_th=0.98 -an -f null - 2>&1 | grep -c black_start || true`], { encoding: "utf8" }).trim();
ok(black === "0", `чёрных фрагментов: ${black}`);
// почти однотонные кадры (пропуск отрисовки): разброс яркости кадра 64×36
// (90-й минус 10-й процентиль) каждые 0,5 с; у нарисованного кадра он больше 12
const FW = 64;
const FH = 36;
const gray = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", `fps=2,scale=${FW}:${FH},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 28 });
let flat = 0;
for (let o = 0; o + FW * FH <= gray.length; o += FW * FH) {
  const px = Array.from(gray.subarray(o, o + FW * FH)).sort((x, y) => x - y);
  if (px[Math.floor(px.length * 0.9)] - px[Math.floor(px.length * 0.1)] < 12) flat++;
}
ok(flat === 0, `кадров без изображения (однотонных): ${flat}`);
// паузы по звуку: в интервале между концом вопроса и началом ответа нет речи
for (const p of checkViewerPauses(T)) {
  const from = T.seg[p.q].end + 0.06;
  const to = T.seg[p.a].start - 0.02;
  const vol = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -ss ${from.toFixed(3)} -t ${(to - from).toFixed(3)} -i "${file}" -af volumedetect -f null - 2>&1 | grep max_volume`], { encoding: "utf8" });
  const max = Number(/max_volume:\s+(-?[\d.]+)/.exec(vol)?.[1]);
  ok(p.ok && max < -30, `пауза ${p.q} → ${p.a}: ${p.seconds.toFixed(2)} с (нужно ≥ ${p.need / 30}), макс. уровень внутри ${max} дБFS`);
}
if (fails.length) {
  for (const f of fails) console.error(`✗ ${f}`);
  process.exit(1);
}
