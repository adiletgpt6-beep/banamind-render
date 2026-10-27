// Сдержанные звуковые эффекты BG-025, синтезированные локально (ffmpeg,
// без сторонних библиотек и платных сервисов): касание экрана, клавиатура,
// отправка сообщения, тихий сигнал сообщения, шелест и сгибы бумажной
// ленты, pop-up, отметка, колокольчик, ползунок, мягкий переход.
// Запуск: node scripts/campaign50/bg-025/sfx.mjs → public/audio/campaign50/bg-025/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ffmpeg } from "./audio.mjs";

const OUT = "public/audio/campaign50/bg-025/sfx";
mkdirSync(OUT, { recursive: true });

// Щелчок клавиши: короткий светлый шум.
const key = (delayMs, label) =>
  `anoisesrc=d=0.03:c=white:a=0.45:seed=${7 + delayMs},highpass=f=2200,lowpass=f=7000,afade=t=out:st=0.003:d=0.026,adelay=${delayMs}[${label}]`;
// Шелест бумаги: розовый шум в полосе, «хруст» — модуляцией амплитуды.
const paper = (d, f, w, trem, seed) =>
  `anoisesrc=d=${d}:c=pink:a=0.55:seed=${seed},bandpass=f=${f}:t=h:w=${w},tremolo=f=${trem}:d=0.75,afade=t=in:d=${(d * 0.25).toFixed(3)},afade=t=out:st=${(d * 0.45).toFixed(3)}:d=${(d * 0.55).toFixed(3)}`;

const SFX = {
  tap: "sine=f=1400:d=0.06,afade=t=out:st=0.005:d=0.05,volume=0.6",
  type: `${key(0, "a")};${key(85, "b")};${key(160, "c")};${key(250, "d")};${key(320, "e")};${key(410, "g")};[a][b][c][d][e][g]amix=inputs=6:normalize=0,volume=0.9[out0]`,
  send: "anoisesrc=d=0.32:c=pink:a=0.5:seed=3,bandpass=f=1900:t=h:w=1300,afade=t=in:d=0.1,afade=t=out:st=0.12:d=0.2",
  ping: "sine=f=1568:d=0.3,afade=t=out:st=0.01:d=0.28,volume=0.32[a];sine=f=2093:d=0.3,adelay=80,afade=t=out:st=0.09:d=0.21,volume=0.24[b];[a][b]amix=inputs=2:normalize=0[out0]",
  unfold: paper(0.75, 2600, 2400, 19, 11),
  fold: `${paper(0.34, 2200, 2000, 24, 21)}[a];sine=f=140:d=0.12,afade=t=out:st=0.01:d=0.1,adelay=180,volume=0.5[b];[a][b]amix=inputs=2:normalize=0[out0]`,
  rustle: paper(0.5, 3000, 2600, 14, 31),
  pop: "sine=f=620:d=0.14,vibrato=f=12:d=0.3,afade=t=out:st=0.02:d=0.12,volume=0.6",
  tick: "sine=f=1046:d=0.12,afade=t=out:st=0.01:d=0.1,volume=0.5",
  chime: "sine=f=1318:d=0.9,afade=t=out:st=0.02:d=0.88,volume=0.35[a];sine=f=1760:d=0.9,adelay=90,afade=t=out:st=0.1:d=0.8,volume=0.25[b];[a][b]amix=inputs=2:normalize=0[out0]",
  slide: "anoisesrc=d=0.45:c=pink:a=0.4:seed=5,bandpass=f=1300:t=h:w=500,tremolo=f=28:d=0.8,afade=t=in:d=0.08,afade=t=out:st=0.25:d=0.2",
  whoosh: "anoisesrc=d=0.5:c=pink:a=0.5:seed=9,bandpass=f=900:t=h:w=700,afade=t=in:d=0.22,afade=t=out:st=0.24:d=0.26",
};
for (const [name, graph] of Object.entries(SFX)) {
  ffmpeg(["-f", "lavfi", "-i", graph, "-t", "1", "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "128k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
}
