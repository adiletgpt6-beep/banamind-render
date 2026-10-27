// Голос Адилета для BalaGoLive04Motion — из оригинальной дорожки исходника,
// без замены и без изменения темпа/высоты.
//
// В записи (петличный микрофон, InShot) уличный шум уже подавлен: паузы
// ≈ −100 дБ, поэтому шумоподавитель не применяется — он сделал бы голос
// «металлическим». Обработка деликатная:
//   • срез инфранизких частот (≤ 70 Гц: ветер, шаги);
//   • мягкий де-эссер (свистящие после компрессии InShot);
//   • громкость: исходник −9 LUFS (пересжат) → −16 LUFS линейно, пик ≤ −1,5 дБTP
//     (двухпроходный loudnorm с linear=true — без «накачки» динамики).
// Результат: public/live04/voice.wav (в Git не хранится, собирается из Release).
//
//   node scripts/live04/prepare-voice.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { ffmpeg } from "../lib/audio.mjs";

const SRC = "public/live04/src/1000211283.mp4";
const OUT = "public/live04/voice.wav";
if (!existsSync(SRC)) throw new Error(`Нет ${SRC}: сначала node scripts/live04/fetch-sources.mjs`);
mkdirSync("public/live04", { recursive: true });

const pre = "highpass=f=70:poles=2,deesser=i=0.25:m=0.5:f=0.5";
// Первый проход: замер (loudnorm печатает JSON в stderr).
const r = spawnSync("ffmpeg", ["-hide_banner", "-i", SRC, "-vn", "-af", `${pre},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], {
  encoding: "utf8",
});
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
