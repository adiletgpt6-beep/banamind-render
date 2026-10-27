// Тихие фоновые звуки LESSON-80 (детерминированный синтез, без внешних
// файлов): тон комнаты, далёкие птицы, шорох травинки, взмах крыльев.
// Запуск: npm run audio:sfx:lesson-80-1-6 → public/lesson-80-1-6/audio/sfx/
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mulberry32, normalizePeak, SAMPLE_RATE as SR, wavToMp3, writeWav } from "../lib/audio.mjs";
import { FILM } from "../../src/lesson80/film-1-6/script.ts";

const OUT = join("public", FILM.voiceDir, "sfx");
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), "lesson80-sfx");
mkdirSync(TMP, { recursive: true });

const save = (name, ch, peakDb) => {
  normalizePeak(ch, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, ch);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`✓ ${name}.mp3 (${(ch[0].length / SR).toFixed(2)} с)`);
};
const lowpass = (x, alpha) => {
  let y = 0;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    y += alpha * (x[i] - y);
    out[i] = y;
  }
  return out;
};
const env = (x, a, r) => {
  const n = x.length;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const g = Math.min(1, t / a) * Math.min(1, (n / SR - t) / r);
    x[i] *= g;
  }
  return x;
};

// Тон комнаты: очень тихий низкочастотный шум + едва слышная «улица».
{
  const rnd = mulberry32(80);
  const n = 31 * SR;
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = rnd() * 2 - 1;
  const l = lowpass(lowpass(w, 0.02), 0.02);
  const r = lowpass(lowpass(w.map((v, i) => (i > 777 ? w[i - 777] : v)), 0.02), 0.02);
  save("room", [env(l, 1, 1), env(r, 1, 1)], -30);
}
// Далёкие птицы: короткие свисты с глиссандо, редкие, в правом канале чуть громче.
{
  const rnd = mulberry32(81);
  const n = 10 * SR;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let t0 = 0.4;
  while (t0 < 9) {
    const notes = 2 + Math.floor(rnd() * 3);
    let t = t0;
    for (let k = 0; k < notes; k++) {
      const f0 = 2600 + rnd() * 1800;
      const f1 = f0 * (0.8 + rnd() * 0.5);
      const d = 0.08 + rnd() * 0.12;
      const s0 = Math.round(t * SR);
      const len = Math.round(d * SR);
      let ph = 0;
      for (let i = 0; i < len; i++) {
        const u = i / len;
        ph += (2 * Math.PI * (f0 + (f1 - f0) * u)) / SR;
        const g = Math.sin(Math.PI * u) * 0.5;
        const v = Math.sin(ph) * g;
        if (s0 + i < n) {
          L[s0 + i] += v * 0.7;
          R[s0 + i] += v;
        }
      }
      t += d + 0.06 + rnd() * 0.1;
    }
    t0 += 1.6 + rnd() * 2.4;
  }
  save("birds-far", [lowpass(L, 0.6), lowpass(R, 0.6)], -24);
}
// Шорох травинки о растительный материал: короткий фильтрованный шум.
{
  const rnd = mulberry32(82);
  const n = Math.round(0.42 * SR);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = (rnd() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 900));
  const hp = x.map((v, i) => (i ? v - x[i - 1] * 0.92 : v));
  const y = lowpass(hp, 0.35);
  save("rustle", [env(y, 0.04, 0.2), env(Float32Array.from(y), 0.05, 0.2)], -20);
}
// Взмах крыльев: 4 мягких шумовых импульса с убыванием.
{
  const rnd = mulberry32(83);
  const n = Math.round(0.9 * SR);
  const x = new Float32Array(n);
  for (let k = 0; k < 4; k++) {
    const s0 = Math.round((0.05 + k * 0.2) * SR);
    const len = Math.round(0.12 * SR);
    for (let i = 0; i < len && s0 + i < n; i++) x[s0 + i] += (rnd() * 2 - 1) * Math.sin((Math.PI * i) / len) * (1 - k * 0.18);
  }
  const y = lowpass(x, 0.08);
  save("wings", [y, Float32Array.from(y)], -22);
}
