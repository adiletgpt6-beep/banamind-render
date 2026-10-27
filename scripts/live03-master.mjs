// Мастеринг BalaGoLive03 после рендера Remotion:
//   out/balago-live-03-raw.mp4 → out/balago-live-03-final.mp4
// Видео не перекодируется (H.264, yuv420p, 1080×1920, 30 fps из рендера).
// Звук: двухпроходный loudnorm до −15 LUFS, true peak ≤ −1.5 dBTP, AAC
// 48 кГц; +faststart для мгновенного старта в мессенджерах и соцсетях.
// В конце — проверка: параметры потоков, громкость и пик итогового файла.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const RAW = process.argv[2] ?? "out/balago-live-03-raw.mp4";
const FINAL = process.argv[3] ?? "out/balago-live-03-final.mp4";
const TARGET = "I=-15:TP=-1.5:LRA=9";

if (!existsSync(RAW)) {
  console.error(`Нет ${RAW}. Сначала: npm run render:live03:raw`);
  process.exit(1);
}

const measure = (file, filter) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-vn", "-af", filter, "-f", "null", "-"], { encoding: "utf8" });
  return r.stderr;
};

const p1 = measure(RAW, `loudnorm=${TARGET}:print_format=json`);
const m = JSON.parse(p1.slice(p1.lastIndexOf("{")));
console.log(`Рендер: ${m.input_i} LUFS, true peak ${m.input_tp} dBTP`);

execFileSync(
  "ffmpeg",
  [
    "-v", "error", "-y", "-i", RAW,
    "-map", "0:v:0", "-map", "0:a:0",
    "-c:v", "copy",
    "-af",
    `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
      `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,` +
      "alimiter=limit=0.84:attack=2:release=50:level=disabled,aresample=48000",
    "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
    "-movflags", "+faststart",
    FINAL,
  ],
  { stdio: "inherit" },
);

const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,width,height,pix_fmt,r_frame_rate,sample_rate:format=duration", "-of", "json", FINAL], { encoding: "utf8" }),
);
const v = probe.streams.find((s) => s.width);
const a = probe.streams.find((s) => s.sample_rate);
const ebu = measure(FINAL, "ebur128=peak=true");
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(ebu.slice(ebu.lastIndexOf("Summary")))?.[1]);
const TP = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(ebu.slice(ebu.lastIndexOf("Summary")))?.[1]);
console.log(
  `Готово: ${FINAL} — ${v.codec_name} ${v.width}×${v.height} ${v.pix_fmt} ${v.r_frame_rate} fps, ` +
    `${a.codec_name} ${a.sample_rate} Гц, ${Number(probe.format.duration).toFixed(2)} с, ${I} LUFS, true peak ${TP} dBTP`,
);
const ok = v.codec_name === "h264" && v.pix_fmt === "yuv420p" && v.width === 1080 && v.height === 1920 && v.r_frame_rate === "30/1" && a.codec_name === "aac" && I <= -14 && I >= -16 && TP <= -1;
if (!ok) {
  console.error("Итоговый файл не прошёл проверку (формат или громкость).");
  process.exit(1);
}
