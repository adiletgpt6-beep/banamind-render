// Сдержанные звуковые эффекты BG-049, синтезированные локально (ffmpeg,
// без сторонних библиотек и платных сервисов): «росчерк» жёлтой линии,
// письмо ручкой, набор текста, щелчок мыши, отметка поля, «отправить»,
// мягкое мерцание луча, колокольчик, тихий шелест перехода.
// Запуск: node scripts/campaign50/bg-049/sfx.mjs → public/audio/campaign50/bg-049/sfx/
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  decodeMono,
  ffmpeg,
  normalizePeak,
  wavToMp3,
  writeWav,
} from "./audio.mjs";

const TMP = join(tmpdir(), "balago-bg049-sfx");
mkdirSync(TMP, { recursive: true });

const OUT = "public/audio/campaign50/bg-049/sfx";
mkdirSync(OUT, { recursive: true });
const SFX = {
  // мягкий «росчерк» маркера: розовый шум в полосе 1,5–4 кГц с плавной огибающей
  draw: [
    "anoisesrc=d=1.1:c=pink:a=0.5:seed=7,bandpass=f=2600:t=h:w=2200,afade=t=in:d=0.25,afade=t=out:st=0.55:d=0.55,volume=0.7",
    1.2,
  ],
  // ручка по бумаге: короткие штрихи
  pen: [
    "anoisesrc=d=3.6:c=brown:a=0.6:seed=3,highpass=f=1800,lowpass=f=6000,volume='0.35+0.3*sin(2*PI*5.5*t)':eval=frame,afade=t=in:d=0.1,afade=t=out:st=3.2:d=0.4",
    3.7,
  ],
  typing: [
    "anoisesrc=d=1.6:c=white:a=0.5:seed=5,highpass=f=2500,volume='if(lt(mod(t,0.11),0.018),1,0)':eval=frame,lowpass=f=7000,volume=0.6",
    1.7,
  ],
  click: [
    "sine=f=2100:d=0.03,afade=t=out:st=0.005:d=0.025,volume=0.8[a];anoisesrc=d=0.03:c=white:a=0.4,highpass=f=3000[b];[a][b]amix=inputs=2:normalize=0[out0]",
    0.2,
  ],
  tick: ["sine=f=1318:d=0.16,afade=t=out:st=0.01:d=0.15,volume=0.45", 0.3],
  send: [
    "sine=f=880:d=0.09,afade=t=out:st=0.02:d=0.07,volume=0.5[a];sine=f=1320:d=0.14,adelay=70,afade=t=out:st=0.02:d=0.12,volume=0.45[b];[a][b]amix=inputs=2:normalize=0[out0]",
    0.4,
  ],
  pop: [
    "sine=f=620:d=0.14,vibrato=f=12:d=0.3,afade=t=out:st=0.02:d=0.12,volume=0.6",
    0.3,
  ],
  shimmer: [
    "sine=f=1568:d=1.6,afade=t=in:d=0.4,afade=t=out:st=0.6:d=1.0,volume=0.18[a];sine=f=2093:d=1.6,adelay=120,afade=t=in:d=0.5,afade=t=out:st=0.6:d=1.0,volume=0.14[b];sine=f=2637:d=1.4,adelay=240,afade=t=in:d=0.5,afade=t=out:st=0.5:d=0.9,volume=0.1[c];[a][b][c]amix=inputs=3:normalize=0,aecho=0.6:0.5:120:0.3[out0]",
    2.0,
  ],
  chime: [
    "sine=f=1318:d=1.0,afade=t=out:st=0.02:d=0.98,volume=0.32[a];sine=f=1760:d=1.0,adelay=90,afade=t=out:st=0.1:d=0.9,volume=0.22[b];[a][b]amix=inputs=2:normalize=0[out0]",
    1.2,
  ],
  whoosh: [
    "anoisesrc=d=0.55:c=pink:a=0.5:seed=11,bandpass=f=900:t=h:w=700,afade=t=in:d=0.24,afade=t=out:st=0.26:d=0.29",
    0.6,
  ],
};
// Каждый эффект приводится к одному пиковому уровню (−6 дБFS); итоговую
// громкость задаёт Bg49Audio.tsx.
for (const [name, [graph, dur]] of Object.entries(SFX)) {
  const raw = join(TMP, `${name}-raw.wav`);
  ffmpeg([
    "-f",
    "lavfi",
    "-i",
    graph,
    "-t",
    String(dur),
    "-ar",
    "44100",
    "-ac",
    "1",
    raw,
  ]);
  const pcm = decodeMono(raw);
  normalizePeak([pcm], -6);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [pcm]);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`✓ ${name}.mp3`);
}
