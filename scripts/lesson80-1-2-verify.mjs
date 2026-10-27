// Проверка готового MP4 ролика 80-1-2: 1920×1080, 30 к/с, H.264 + AAC 48 кГц,
// длительность в рабочем диапазоне 4:00–4:45, громкость ≈ −16…−18 LUFS,
// true peak ≤ −1 dBTP, нет чёрных кадров; паузы для ответа зрителя — по
// звуку готового файла (тишина речи от конца вопроса до начала ответа).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { A2_VIDEO } from "../src/lesson80-1-2/script.ts";
import { buildTimeline, checkViewerPauses } from "../src/lesson80-1-2/timeline.ts";

const file = process.argv[2] ?? `out/${A2_VIDEO.output}.mp4`;
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }));
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const fails = [];
const ok = (c, msg) => (c ? console.log(`✓ ${msg}`) : fails.push(msg));
ok(v && v.width === 1920 && v.height === 1080, `видео 1920×1080 (${v?.width}×${v?.height})`);
ok(v && v.codec_name === "h264" && v.pix_fmt === "yuv420p", `H.264 yuv420p (${v?.codec_name}, ${v?.pix_fmt})`);
ok(v && v.r_frame_rate === "30/1", `30 к/с (${v?.r_frame_rate})`);
ok(a && a.codec_name === "aac" && a.sample_rate === "48000", `AAC 48 кГц (${a?.codec_name}, ${a?.sample_rate})`);
ok(dur >= 240 && dur <= 285, `длительность ${Math.floor(dur / 60)}:${(dur % 60).toFixed(2).padStart(5, "0")} (${dur.toFixed(2)} с) в диапазоне 4:00–4:45`);
const r128 = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -map 0:a -af ebur128=peak=true -f null - 2>&1 | tail -14`], { encoding: "utf8" });
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(r128)?.[1]);
const TP = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(r128.slice(r128.indexOf("True peak")))?.[1]);
ok(I <= -15.5 && I >= -18.5, `громкость ${I} LUFS (цель −16…−18)`);
ok(TP <= -1, `true peak ${TP} dBTP (≤ −1)`);
const black = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vf blackdetect=d=0.1:pic_th=0.98 -an -f null - 2>&1 | grep -c black_start || true`], { encoding: "utf8" }).trim();
ok(black === "0", `чёрных фрагментов: ${black}`);
// паузы по звуку: в интервале между концом вопроса и началом ответа нет речи
const T = buildTimeline(JSON.parse(readFileSync(`public/${A2_VIDEO.voiceDir}/manifest.json`, "utf8")), A2_VIDEO.fps);
for (const p of checkViewerPauses(T)) {
  // границы речи в манифесте — акустические (по порогу громкости)
  const from = T.seg[p.q].end + 0.02;
  const to = T.seg[p.a].start - 0.02;
  const vol = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -ss ${from.toFixed(3)} -t ${(to - from).toFixed(3)} -i "${file}" -af volumedetect -f null - 2>&1 | grep max_volume`], { encoding: "utf8" });
  const max = Number(/max_volume:\s+(-?[\d.]+)/.exec(vol)?.[1]);
  ok(p.ok && max < -30, `пауза ${p.q} → ${p.a}: ${p.seconds.toFixed(2)} с (нужно ≥ ${p.need / 30}), макс. уровень внутри ${max} дБFS`);
}
if (fails.length) {
  for (const f of fails) console.error(`✗ ${f}`);
  process.exit(1);
}
