// Сдержанные звуковые эффекты BG-029, синтезированные локально (ffmpeg,
// без сторонних библиотек и платных сервисов): нажатие (предмет ложится), щелчок пряжки,
// колокольчик отметки, мягкий шелест перехода.
// Запуск: node scripts/campaign50/bg-029/sfx.mjs → public/audio/campaign50/bg-029/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ffmpeg } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-029/sfx";
mkdirSync(OUT, { recursive: true });
const SFX = {
  tap: "sine=f=1400:d=0.06,afade=t=out:st=0.005:d=0.05,volume=0.6",
  pop: "sine=f=660:d=0.14,vibrato=f=12:d=0.3,afade=t=out:st=0.02:d=0.12,volume=0.7",
  snap: "anoisesrc=d=0.05:c=pink:a=0.6,highpass=f=900,afade=t=out:st=0.004:d=0.045",
  chime: "sine=f=1318:d=0.9,afade=t=out:st=0.02:d=0.88,volume=0.35[a];sine=f=1760:d=0.9,adelay=90,afade=t=out:st=0.1:d=0.8,volume=0.25[b];[a][b]amix=inputs=2:normalize=0[out0]",
  whoosh: "anoisesrc=d=0.5:c=pink:a=0.5,bandpass=f=900:w=700,afade=t=in:d=0.22,afade=t=out:st=0.24:d=0.26",
};
for (const [name, graph] of Object.entries(SFX)) {
  ffmpeg(["-f", "lavfi", "-i", graph, "-t", "1", "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "128k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
}
