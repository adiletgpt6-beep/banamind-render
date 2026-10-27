// Звуковые эффекты «плёнки» BG-041 (детерминированно, локально, без API):
//   rewind.mp3 — мягкий шелест перемотки: фрагмент тёплой темы проекта,
//                развёрнутый назад и ускоренный (тон выше), с полосовым
//                фильтром и лёгким «дрожанием» ленты;
//   ff.mp3     — то же вперёд (короткая быстрая прокрутка для цепочки ▶▶);
//   clunk.mp3  — щелчок кнопки пульта (пауза/воспроизведение).
// Источник — общий файл проекта public/audio/music-story-warm.mp3 (только
// чтение). Результат — public/audio/campaign50/bg-041/sfx/.
//   node scripts/campaign50/bg-041/sfx.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ffmpeg } from "../../lib/audio.mjs";

const OUT = "public/audio/campaign50/bg-041/sfx";
const SRC = "public/audio/music-story-warm.mp3";
mkdirSync(OUT, { recursive: true });
const mp3 = ["-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "128k", "-map_metadata", "-1", "-fflags", "+bitexact"];

ffmpeg([
  "-ss", "12", "-t", "7", "-i", SRC,
  "-af",
  "areverse,asetrate=44100*2.6,aresample=44100,highpass=f=380,lowpass=f=4200,tremolo=f=9:d=0.35,volume=0.9,afade=t=in:d=0.06,afade=t=out:st=2.4:d=0.28",
  "-t", "2.69",
  ...mp3,
  join(OUT, "rewind.mp3"),
]);
ffmpeg([
  "-ss", "40", "-t", "5", "-i", SRC,
  "-af",
  "asetrate=44100*2.4,aresample=44100,highpass=f=380,lowpass=f=4500,tremolo=f=10:d=0.3,volume=0.85,afade=t=in:d=0.06,afade=t=out:st=1.75:d=0.3",
  "-t", "2.08",
  ...mp3,
  join(OUT, "ff.mp3"),
]);
// щелчок: короткий низкий импульс + тихий высокий «клик»
ffmpeg([
  "-f", "lavfi", "-i", "sine=f=180:d=0.09",
  "-f", "lavfi", "-i", "anoisesrc=d=0.03:c=white:a=0.5:seed=41",
  "-filter_complex",
  "[0]volume=0.8,afade=t=out:st=0.02:d=0.07[a];[1]highpass=f=2500,volume=0.5,afade=t=out:d=0.03[b];[a][b]amix=inputs=2:duration=longest:normalize=0,volume=0.9",
  ...mp3,
  join(OUT, "clunk.mp3"),
]);
console.log(`✓ ${OUT}: rewind.mp3, ff.mp3, clunk.mp3`);
