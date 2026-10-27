// Оригинальный голос живого ролика LIVE-NNN для композиции — из дорожки
// исходника, без замены, без изменения темпа и высоты. Обработка деликатная
// (как scripts/live04/prepare-voice.mjs, но для любого задания):
//   • срез инфранизких частот ≤ 70 Гц (ветер, шаги);
//   • мягкий де-эссер (свистящие после сжатия в телефоне);
//   • громкость: исходники из телефона пережаты (≈ −9 LUFS, пик 0 дБFS) →
//     −16 LUFS линейно, пик ≤ −1,5 дБTP (двухпроходный loudnorm, linear=true —
//     без «накачки» динамики). Шумоподавление не применяется: голос стал бы
//     «металлическим».
//
//   node scripts/live-videos/prepare-voice.mjs <исходник.mp4> <voice.wav>
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { ffmpeg } from "../lib/audio.mjs";

const [SRC, OUT] = process.argv.slice(2);
if (!SRC || !OUT) {
  console.error("Использование: prepare-voice.mjs <исходник.mp4> <voice.wav>");
  process.exit(2);
}
if (!existsSync(SRC)) throw new Error(`Нет ${SRC}: сначала получите исходник (R2 / Release)`);
mkdirSync(dirname(OUT), { recursive: true });

const pre = "highpass=f=70:poles=2,deesser=i=0.25:m=0.5:f=0.5";
// Первый проход: замер (loudnorm печатает JSON в stderr).
const r = spawnSync("ffmpeg", ["-hide_banner", "-i", SRC, "-vn", "-af", `${pre},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], {
  encoding: "utf8",
});
if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr.slice(-400)}`);
const m = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf("{"), r.stderr.lastIndexOf("}") + 1));
console.log(`Исходник: ${m.input_i} LUFS, пик ${m.input_tp} дБTP, LRA ${m.input_lra}`);
ffmpeg([
  "-i", SRC, "-vn",
  "-af",
  `${pre},loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le",
  OUT,
]);
console.log(`+ ${OUT}`);
