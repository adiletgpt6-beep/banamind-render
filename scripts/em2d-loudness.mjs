// Громкость готового MP4 BalaGoElevenMinutes2D: двухпроходный loudnorm до
// −14 LUFS, true peak ≤ −1,5 dBTP; видео копируется без перекодирования,
// moov — в начало файла (faststart). Запуск: node scripts/em2d-loudness.mjs out/x.mp4
import { execFileSync } from "node:child_process";
import { renameSync } from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("Укажите MP4");
const target = "I=-14:TP=-1.5:LRA=11";
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${file}" -vn -af loudnorm=${target}:print_format=json -f null - 2>&1`]).toString();
const m = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1));
const af = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
const tmp = file.replace(/\.mp4$/, "-ln.mp4");
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", file, "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp], { stdio: "inherit" });
renameSync(tmp, file);
console.log(`${file}: громкость ${m.input_i} → −14 LUFS (пик был ${m.input_tp} dBTP)`);
