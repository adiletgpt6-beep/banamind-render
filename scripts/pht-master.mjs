// Мастеринг готового MP4 фильма №35: громкость к ориентиру −15 LUFS
// (диапазон −16…−14), true peak не выше −1,5 dBTP — двухпроходный
// loudnorm в линейном режиме (без «качания» громкости), видео копируется
// без перекодирования, faststart (moov в начале файла).
//   node scripts/pht-master.mjs out/balago-35-programmers-hardest-task.mp4
import { execFileSync } from "node:child_process";
import { renameSync } from "node:fs";

const file = process.argv[2] ?? "out/balago-35-programmers-hardest-task.mp4";
const I = -15;
const TP = -1.5;
const LRA = 11;
const run = (args) => execFileSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { stdio: ["ignore", "pipe", "pipe"] });

// 1. замер
const measure = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json -f null - 2>&1`]).toString();
const json = JSON.parse(measure.slice(measure.lastIndexOf("{"), measure.lastIndexOf("}") + 1));
console.log(`до: ${json.input_i} LUFS, TP ${json.input_tp} dBTP, LRA ${json.input_lra}`);
// 2. применение (линейно, по замеру)
const tmp = file.replace(/\.mp4$/, ".master.mp4");
const af = `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}:linear=true,aresample=48000`;
run(["-y", "-i", file, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", tmp]);
renameSync(tmp, file);
// 3. контрольный замер
const after = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
const Ia = /I:\s+(-?[\d.]+) LUFS/.exec(after)?.[1];
const Pa = /Peak:\s+(-?[\d.]+) dBFS/.exec(after)?.[1];
console.log(`после: ${Ia} LUFS, true peak ${Pa} dBTP → ${file}`);
