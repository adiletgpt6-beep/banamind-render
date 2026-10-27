// Звуки BalaGoBG047 (детерминированный синтез, без API):
//   fwip    — бумажная фигурка раскладывается из листа (pop-up);
//   hop     — мягкий прыжок точки; land — мягкое приземление;
//   pencil  — карандаш пишет по бумаге; sticker — наклейка ложится на лист;
//   sparkle — тихий перезвон (поле заполнено, группа совпала);
//   send    — сообщение ушло (мягкий взмах + щелчок).
// Запуск: node scripts/campaign50/bg-047/sfx.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, writeWav } from "../../lib/audio.mjs";
import { BG47_VIDEO } from "../../../src/campaign50/bg-047/script.ts";

const OUT = join("public", BG47_VIDEO.sfxDir);
const TMP = join(tmpdir(), "balago-bg047-sfx");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });
const rnd = mulberry32(4747);
const noise = () => rnd() * 2 - 1;
const buf = (sec) => new Float32Array(Math.round(sec * SR));

const normalize = (b, peakDb) => {
  let p = 0;
  for (const v of b) p = Math.max(p, Math.abs(v));
  const g = Math.pow(10, peakDb / 20) / (p || 1);
  for (let i = 0; i < b.length; i++) b[i] *= g;
  const fo = Math.min(b.length, Math.round(0.02 * SR));
  for (let i = 0; i < fo; i++) b[b.length - 1 - i] *= i / fo;
  return b;
};

const save = (name, b, filter = "") => {
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, [b, b]);
  ffmpeg(["-i", wav, ...(filter ? ["-af", filter] : []), "-ar", String(SR), "-ac", "2", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ ${name}.mp3`);
};

// pop-up: шорох бумаги с подъёмом
{
  const b = buf(0.24);
  let lp = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.015) * Math.exp(-t / 0.06);
    const k = 0.08 + 0.5 * Math.min(1, t / 0.12);
    lp += k * (noise() - lp);
    b[i] = lp * env;
  }
  save("fwip", normalize(b, -6), "highpass=f=400,lowpass=f=7000");
}
// прыжок: мягкий восходящий «блоп»
{
  const b = buf(0.2);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const fr = 280 + 520 * Math.pow(t / 0.2, 0.7);
    ph += (2 * Math.PI * fr) / SR;
    b[i] = Math.sin(ph) * Math.min(1, t / 0.01) * Math.exp(-t / 0.07);
  }
  save("hop", normalize(b, -8), "lowpass=f=3000");
}
// приземление: мягкий глухой стук
{
  const b = buf(0.16);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const fr = 160 - 60 * (t / 0.16);
    ph += (2 * Math.PI * fr) / SR;
    b[i] = (Math.sin(ph) * 0.9 + noise() * 0.15 * Math.exp(-t / 0.01)) * Math.min(1, t / 0.003) * Math.exp(-t / 0.045);
  }
  save("land", normalize(b, -7), "lowpass=f=1800");
}
// карандаш: шуршащие штрихи ≈ 9 в секунду
{
  const b = buf(1.0);
  let lp = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const stroke = Math.pow(Math.abs(Math.sin(Math.PI * 9 * t)), 1.6);
    lp += 0.35 * (noise() - lp);
    b[i] = (noise() - lp) * stroke * Math.min(1, t / 0.03) * Math.min(1, (1 - t) / 0.08);
  }
  save("pencil", normalize(b, -10), "highpass=f=1800,lowpass=f=9000");
}
// наклейка: бумажный хлопок
{
  const b = buf(0.18);
  let lp = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    lp += 0.25 * (noise() - lp);
    b[i] = (lp * Math.exp(-t / 0.02) + Math.sin(2 * Math.PI * 110 * t) * 0.5 * Math.exp(-t / 0.04)) * Math.min(1, t / 0.002);
  }
  save("sticker", normalize(b, -7), "lowpass=f=5000");
}
// перезвон: три тихие высокие ноты
{
  const b = buf(0.9);
  [[0, 1568], [0.07, 2093], [0.14, 2637]].forEach(([at, fr]) => {
    const o = Math.round(at * SR);
    for (let i = 0; o + i < b.length; i++) {
      const t = i / SR;
      b[o + i] += (Math.sin(2 * Math.PI * fr * t) + 0.3 * Math.sin(2 * Math.PI * fr * 2.01 * t)) * Math.min(1, t / 0.004) * Math.exp(-t / 0.22);
    }
  });
  save("sparkle", normalize(b, -9), "lowpass=f=8000");
}
// сообщение отправлено: взмах + щелчок
{
  const b = buf(0.42);
  let lp = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const k = 0.04 + 0.4 * (t / 0.42);
    lp += k * (noise() - lp);
    const sweep = lp * Math.sin(Math.PI * Math.min(1, t / 0.3)) * (t < 0.3 ? 1 : 0);
    const pop = t > 0.3 ? Math.sin(2 * Math.PI * 900 * (t - 0.3)) * Math.exp(-(t - 0.3) / 0.03) : 0;
    b[i] = sweep * 0.7 + pop;
  }
  save("send", normalize(b, -8), "highpass=f=200");
}
