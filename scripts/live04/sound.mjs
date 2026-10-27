// Музыка и UI-звуки BalaGoLive04Motion, синтезированные кодом.
// Это оригинальные звуки проекта (без сэмплов и чужих треков) — их можно
// использовать в рекламе без лицензионных ограничений. Результат
// детерминирован и сохраняется в public/audio/live04/.
//
// Музыка: уверенный современный поп-эмбиент без вокала, 105,5 BPM, такт
// 2,275 с — 8 тактов ровно до склейки 18,2 с, где начинается решение BalaGo.
//   0–18,2 с   — проблема: ля минор (Am–F–C–G), тикающий мотив часов;
//   18,2–34,5 с — решение: до мажор (C–G–Am–F), светлее и шире;
//   34,5 с–конец — финал: разреженно, последний аккорд затухает.
//
// Запуск: npm run audio:live04
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAMPLE_RATE as SR, mulberry32, normalizePeak, wavToMp3, writeWav } from "../lib/audio.mjs";

const OUT = "public/audio/live04";
const TMP = join(tmpdir(), "balago-live04-sound");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BAR = 2.275;
const BEAT = BAR / 4;
const SOLUTION = 18.2; // склейка, на которой начинается решение
const OUTRO = 34.5; // конец живой съёмки
const LENGTH = 48; // с запасом: финал обрезает и затухает Remotion

const save = (name, channels, peakDb) => {
  normalizePeak(channels, peakDb);
  const wav = join(TMP, `${name}.wav`);
  writeWav(wav, channels);
  wavToMp3(wav, join(OUT, `${name}.mp3`));
  rmSync(wav);
  console.log(`+ ${OUT}/${name}.mp3`);
};

const stereo = (sec) => {
  const n = Math.round(sec * SR);
  return [new Float32Array(n), new Float32Array(n)];
};
const panGains = (pan) => [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];

// Однополюсный фильтр нижних частот (для мягких тембров и шумов).
const lowpass = (cut) => {
  const a = 1 - Math.exp((-TAU * cut) / SR);
  let y = 0;
  return (x) => (y += a * (x - y));
};

// ---------------------------------------------------------------- музыка
const music = () => {
  const [L, R] = stereo(LENGTH);
  const n = L.length;
  const rand = mulberry32(404);
  const add = (i, v, pan = 0) => {
    if (i < 0 || i >= n) return;
    const [gl, gr] = panGains(pan);
    L[i] += v * gl;
    R[i] += v * gr;
  };

  // Мягкий «пад»: несколько расстроенных пил через ФНЧ, медленная атака.
  const pad = (start, len, notes, amp, cut) => {
    const s0 = Math.floor(start * SR);
    const total = Math.floor((len + 0.8) * SR);
    for (const [k, m] of notes.entries()) {
      const pan = (k / Math.max(1, notes.length - 1)) * 1.2 - 0.6;
      for (const det of [-0.0035, 0.0035]) {
        const f = hz(m) * (1 + det);
        const lp = lowpass(cut);
        let ph = rand();
        for (let i = 0; i < total; i++) {
          const t = i / SR;
          const env = Math.min(1, t / 0.45) * (t > len ? Math.max(0, 1 - (t - len) / 0.8) : 1);
          ph += f / SR;
          const saw = 2 * (ph - Math.floor(ph)) - 1;
          add(s0 + i, lp(saw) * env * amp, pan * (det > 0 ? 1 : -1));
        }
      }
    }
  };

  // Щипок (пианино/маримба): затухающий синус с обертонами.
  const pluck = (start, m, amp, pan, decay = 0.38) => {
    const s0 = Math.floor(start * SR);
    const f = hz(m);
    for (let i = 0; i < 1.6 * SR; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.004) * Math.exp(-t / decay);
      const v =
        Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t) * Math.exp(-t / 0.12) + 0.1 * Math.sin(TAU * f * 3.01 * t) * Math.exp(-t / 0.06);
      add(s0 + i, v * env * amp, pan);
    }
  };

  // Саб-бас: синус с лёгкой сатурацией.
  const bass = (start, len, m, amp) => {
    const s0 = Math.floor(start * SR);
    const f = hz(m);
    for (let i = 0; i < (len + 0.08) * SR; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.02) * (t > len ? Math.max(0, 1 - (t - len) / 0.08) : 1);
      add(s0 + i, Math.tanh(1.6 * Math.sin(TAU * f * t)) * env * amp);
    }
  };

  const kick = (start, amp) => {
    const s0 = Math.floor(start * SR);
    let ph = 0;
    for (let i = 0; i < 0.32 * SR; i++) {
      const t = i / SR;
      ph += (TAU * (46 + 80 * Math.exp(-t / 0.035))) / SR;
      add(s0 + i, Math.sin(ph) * Math.exp(-t / 0.11) * amp);
    }
  };

  const noiseHit = (start, len, amp, cut, pan, attack = 0.002, decay = 0.03) => {
    const s0 = Math.floor(start * SR);
    const lp = lowpass(cut);
    let prev = 0;
    for (let i = 0; i < len * SR; i++) {
      const t = i / SR;
      const x = rand() * 2 - 1;
      const hp = x - prev;
      prev = x;
      const env = Math.min(1, t / attack) * Math.exp(-t / decay);
      add(s0 + i, lp(hp) * env * amp, pan);
    }
  };

  // Сайдчейн-«дыхание» пада под бочку — мягко.
  const pump = new Float32Array(n).fill(1);

  const minor = [
    { bass: 45, pad: [57, 60, 64, 67] }, // Am7
    { bass: 41, pad: [57, 60, 64, 65] }, // Fmaj7
    { bass: 48, pad: [55, 60, 64, 67] }, // C
    { bass: 43, pad: [55, 59, 62, 67] }, // G
  ];
  const major = [
    { bass: 48, pad: [60, 64, 67, 71] }, // Cmaj7
    { bass: 43, pad: [59, 62, 67, 69] }, // G6
    { bass: 45, pad: [60, 64, 67, 69] }, // Am7
    { bass: 41, pad: [60, 65, 69, 72] }, // Fmaj7
  ];

  const bars = Math.ceil(LENGTH / BAR);
  for (let b = 0; b < bars; b++) {
    const t0 = b * BAR;
    const solution = t0 >= SOLUTION - 0.01;
    const outro = t0 >= OUTRO - 0.01;
    const ch = (solution ? major : minor)[b % 4];
    // пад
    pad(t0, BAR, ch.pad, solution ? 0.05 : 0.042, solution ? 2400 : 1500);
    // бас: восьмые с паузами в проблеме, ровные четверти в решении
    if (b >= 1) {
      for (let q = 0; q < 4; q++) {
        if (!solution && q === 3) continue;
        bass(t0 + q * BEAT, BEAT * (solution ? 0.85 : 0.6), ch.bass - 12 + (q === 2 && solution ? 12 : 0), outro ? 0.12 : 0.16);
      }
    }
    // бочка: с 2-го такта; в финале — только на «раз»
    if (b >= 1) {
      for (let q = 0; q < 4; q++) {
        if (outro && q !== 0) continue;
        kick(t0 + q * BEAT, 0.5);
        const s = Math.floor((t0 + q * BEAT) * SR);
        for (let i = 0; i < 0.25 * SR && s + i < n; i++) pump[s + i] = Math.min(pump[s + i], 0.6 + 0.4 * Math.min(1, i / SR / 0.25));
      }
    }
    // «Тиканье часов» в проблеме: сухие шестнадцатые, акцент на долях
    if (!solution) {
      for (let s = 0; s < 16; s++) {
        const acc = s % 4 === 0 ? 1 : 0.55;
        noiseHit(t0 + (s * BEAT) / 4, 0.03, 0.05 * acc, 7000, s % 2 ? 0.35 : -0.35, 0.0005, 0.006);
      }
      // мотив щипков (ля минор): тревожный, но мягкий
      const motif = [69, 72, 76, 72, 74, 72, 69, 67];
      for (let k = 0; k < 8; k++) pluck(t0 + (k * BEAT) / 2, motif[k] - (b % 4 === 1 ? 4 : 0), 0.045, k % 2 ? 0.3 : -0.3, 0.22);
    } else {
      // решение: шейкер, хлопок на 2 и 4, светлые арпеджио
      for (let s = 0; s < 8; s++) noiseHit(t0 + (s * BEAT) / 2 + BEAT / 4, 0.08, outro ? 0.03 : 0.055, 9000, s % 2 ? 0.4 : -0.4, 0.004, 0.022);
      if (!outro) {
        for (const q of [1, 3]) noiseHit(t0 + q * BEAT, 0.18, 0.12, 3500, 0, 0.002, 0.05);
      }
      const arp = ch.pad.concat([ch.pad[1] + 12, ch.pad[2] + 12]);
      const steps = outro ? 4 : 8;
      for (let k = 0; k < steps; k++) pluck(t0 + (k * BAR) / steps, arp[(k * 3) % arp.length] + 12, outro ? 0.04 : 0.05, k % 2 ? 0.45 : -0.45, 0.3);
    }
  }

  // Подъём к решению: мягкий шумовой «вдох» за такт до склейки.
  {
    const s0 = Math.floor((SOLUTION - 1.2) * SR);
    const lp = lowpass(1200);
    for (let i = 0; i < 1.2 * SR; i++) {
      const t = i / SR;
      const k = t / 1.2;
      add(s0 + i, lp(rand() * 2 - 1) * k * k * 0.18);
    }
  }

  for (let i = 0; i < n; i++) {
    // пампинг действует только на верх (пад и щипки уже смешаны) — мягко
    L[i] *= 0.7 + 0.3 * pump[i];
    R[i] *= 0.7 + 0.3 * pump[i];
  }
  // финальное затухание файла (Remotion дополнительно гасит по длине ролика)
  const fade = Math.floor(3 * SR);
  for (let i = 0; i < fade; i++) {
    const g = i / fade;
    L[n - 1 - i] *= g;
    R[n - 1 - i] *= g;
  }
  save("music", [L, R], -3);
};

// ---------------------------------------------------------------- UI-звуки
const sfx = (name, sec, fill, peakDb = -6) => {
  const [L, R] = stereo(sec);
  fill(L, R);
  save(`sfx-${name}`, [L, R], peakDb);
};

const tone = (L, R, start, len, f0, f1, amp, attack = 0.005, decay = 0.08, pan = 0) => {
  const [gl, gr] = panGains(pan);
  let ph = 0;
  const s0 = Math.floor(start * SR);
  for (let i = 0; i < len * SR && s0 + i < L.length; i++) {
    const t = i / SR;
    const f = f0 * Math.pow(f1 / f0, Math.min(1, t / len));
    ph += (TAU * f) / SR;
    const env = Math.min(1, t / attack) * Math.exp(-t / decay);
    const v = (Math.sin(ph) + 0.15 * Math.sin(2 * ph)) * env * amp;
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
};

const sounds = () => {
  const rand = mulberry32(77);
  // мягкий «поп» появления карточки
  sfx("pop", 0.25, (L, R) => tone(L, R, 0, 0.12, 620, 980, 0.8, 0.003, 0.05), -9);
  // короткий щелчок (слово, тик)
  sfx("tick", 0.08, (L, R) => {
    const lp = lowpass(5000);
    let prev = 0;
    for (let i = 0; i < 0.03 * SR; i++) {
      const x = rand() * 2 - 1;
      const v = lp(x - prev) * Math.exp(-i / SR / 0.004);
      prev = x;
      L[i] += v;
      R[i] += v;
    }
    tone(L, R, 0, 0.03, 2400, 2200, 0.25, 0.001, 0.01);
  }, -12);
  // мягкий воздушный «вжух» (переходы)
  sfx("whoosh", 0.6, (L, R) => {
    let y = 0;
    for (let i = 0; i < L.length; i++) {
      const t = i / SR;
      const k = t / 0.6;
      const cut = 300 + 2600 * Math.sin(Math.PI * k);
      const a = 1 - Math.exp((-TAU * cut) / SR);
      y += a * (rand() * 2 - 1 - y);
      const env = Math.sin(Math.PI * Math.min(1, k)) ** 2;
      L[i] += y * env * (1 - 0.6 * k);
      R[i] += y * env * (0.4 + 0.6 * k);
    }
  }, -10);
  // уведомление: два мягких колокольчика
  sfx("notify", 0.6, (L, R) => {
    tone(L, R, 0, 0.4, hz(88), hz(88), 0.6, 0.004, 0.18, -0.2);
    tone(L, R, 0.09, 0.45, hz(93), hz(93), 0.6, 0.004, 0.22, 0.2);
  }, -10);
  // «пауза» (работа остановлена): глухой клик + нисходящий тон
  sfx("stop", 0.45, (L, R) => {
    tone(L, R, 0, 0.3, 520, 300, 0.7, 0.002, 0.09);
    tone(L, R, 0, 0.05, 140, 90, 0.8, 0.001, 0.03);
  }, -9);
  // движение по маршруту: мягкое восходящее скольжение
  sfx("glide", 0.7, (L, R) => tone(L, R, 0, 0.6, 440, 880, 0.5, 0.06, 0.35), -14);
  // успех: светлое арпеджио до мажор
  sfx("success", 0.9, (L, R) => {
    [84, 88, 91].forEach((m, k) => tone(L, R, k * 0.07, 0.5, hz(m), hz(m), 0.5, 0.004, 0.25, (k - 1) * 0.4));
  }, -10);
  // мягкий низкий «удар» под появление логотипа (без резкой атаки)
  sfx("thump", 0.8, (L, R) => {
    tone(L, R, 0, 0.7, 90, 48, 1, 0.015, 0.22);
    tone(L, R, 0, 0.5, hz(72), hz(72), 0.12, 0.02, 0.3);
  }, -8);
  // предупреждение (переполнение времени): два низких мягких тона
  sfx("alert", 0.7, (L, R) => {
    tone(L, R, 0, 0.25, hz(64), hz(64), 0.6, 0.006, 0.12, -0.15);
    tone(L, R, 0.2, 0.3, hz(61), hz(61), 0.6, 0.006, 0.15, 0.15);
  }, -11);
};

const only = process.argv[2];
if (!only || only === "music") music();
if (!only || only === "sfx") sounds();
