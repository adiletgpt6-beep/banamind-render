// Сдержанные звуковые эффекты BG-024, синтезированные локально (ffmpeg,
// без сторонних библиотек и платных сервисов): нажатие, щелчок детали
// пазла, тихий «отказ», колокольчик, отметка, мягкий шелест перехода.
// Запуск: node scripts/campaign50/bg-024/sfx.mjs → public/audio/campaign50/bg-024/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ffmpeg } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-024/sfx";
mkdirSync(OUT, { recursive: true });
const SFX = {
  tap: "sine=f=1400:d=0.06,afade=t=out:st=0.005:d=0.05,volume=0.6",
  pop: "sine=f=660:d=0.14,vibrato=f=12:d=0.3,afade=t=out:st=0.02:d=0.12,volume=0.7",
  snap: "anoisesrc=d=0.05:c=pink:a=0.6,highpass=f=900,afade=t=out:st=0.004:d=0.045",
  tick: "sine=f=1046:d=0.12,afade=t=out:st=0.01:d=0.1,volume=0.5",
  deny: "sine=f=330:d=0.11,afade=t=out:st=0.03:d=0.08,apad=pad_dur=0.04[a];sine=f=262:d=0.18,afade=t=out:st=0.05:d=0.13[b];[a][b]concat=n=2:v=0:a=1,volume=0.6[out0]",
  chime: "sine=f=1318:d=0.9,afade=t=out:st=0.02:d=0.88,volume=0.35[a];sine=f=1760:d=0.9,adelay=90,afade=t=out:st=0.1:d=0.8,volume=0.25[b];[a][b]amix=inputs=2:normalize=0[out0]",
  whoosh: "anoisesrc=d=0.5:c=pink:a=0.5,bandpass=f=900:w=700,afade=t=in:d=0.22,afade=t=out:st=0.24:d=0.26",
};
for (const [name, graph] of Object.entries(SFX)) {
  ffmpeg(["-f", "lavfi", "-i", graph, "-t", "1", "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "128k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
}
