// Мастеринг готового рендера BalaGoWorkFromHome2D:
//   1) звук — двухпроходный loudnorm к −14 LUFS, true peak ≤ −2 dBTP
//      (видео копируется без перекодирования — это тот же рендер из исходников);
//   2) faststart (moov в начале файла);
//   3) мобильная копия 540×960 из готового фильма — тот же звук и субтитры.
// Запуск: node scripts/wfh2d-master.mjs raw.mp4 out.mp4 mobile.mp4
import { execFileSync } from "node:child_process";

const [raw, out, mobile] = process.argv.slice(2);
if (!raw || !out || !mobile) {
  console.error("usage: wfh2d-master.mjs raw.mp4 out.mp4 mobile.mp4");
  process.exit(2);
}
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-nostats", "-y", ...args], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 });
const TARGET = { I: -14, TP: -2, LRA: 11 };
const pass1 = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${raw}" -vn -af loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:print_format=json -f null - 2>&1`]).toString();
const m = JSON.parse(pass1.slice(pass1.lastIndexOf("{"), pass1.lastIndexOf("}") + 1));
console.log(`До мастеринга: ${m.input_i} LUFS, true peak ${m.input_tp} dBTP, LRA ${m.input_lra}`);
const af = `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
ff(["-i", raw, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out]);
ff(["-i", out, "-vf", "scale=540:960:flags=lanczos", "-r", "30", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", mobile]);
const check = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${out}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
console.log(check.trim());
