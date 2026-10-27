// Звуки BG-030, синтезированные локально (ffmpeg и код, без сторонних
// библиотек и платных сервисов) → public/audio/campaign50/bg-030/:
//   sfx/*.mp3 — сдержанные эффекты (касание экрана, карточка на стол,
//               мягкий щелчок, колокольчик, шелест перехода, «отправить»,
//               проезд машины);
//   music.mp3 — тихий тёплый эмбиент без ударных (ре мажор, 80 BPM,
//               I–V–vi–IV), детерминированный; громкость и приглушение под
//               голос задаёт Remotion.
// Запуск: node scripts/campaign50/bg-030/sfx.mjs
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SAMPLE_RATE as SR, ffmpeg, mulberry32, normalizePeak, wavToMp3, writeWav } from "./audio.mjs";

const DIR = "public/audio/campaign50/bg-030";
const OUT = join(DIR, "sfx");
mkdirSync(OUT, { recursive: true });

const SFX = {
  tap: "sine=f=1500:d=0.05,afade=t=out:st=0.004:d=0.045,volume=0.55",
  tick: "sine=f=1180:d=0.08,afade=t=out:st=0.006:d=0.07,volume=0.4",
  pop: "sine=f=700:d=0.14,vibrato=f=10:d=0.25,afade=t=out:st=0.02:d=0.12,volume=0.6",
  paper: "anoisesrc=d=0.18:c=pink:a=0.5,highpass=f=1200,lowpass=f=6000,afade=t=in:d=0.02,afade=t=out:st=0.05:d=0.13",
  slide: "anoisesrc=d=0.32:c=pink:a=0.35,bandpass=f=2200:w=1800,afade=t=in:d=0.08,afade=t=out:st=0.12:d=0.2",
  chime: "sine=f=1175:d=1.0,afade=t=out:st=0.02:d=0.98,volume=0.33[a];sine=f=1568:d=1.0,adelay=80,afade=t=out:st=0.1:d=0.9,volume=0.22[b];[a][b]amix=inputs=2:normalize=0[out0]",
  whoosh: "anoisesrc=d=0.55:c=pink:a=0.45,bandpass=f=850:w=700,afade=t=in:d=0.24,afade=t=out:st=0.26:d=0.29",
  send: "sine=f=880:d=0.09,afade=t=out:st=0.01:d=0.08,volume=0.5[a];sine=f=1320:d=0.12,adelay=70,afade=t=out:st=0.02:d=0.1,volume=0.45[b];[a][b]amix=inputs=2:normalize=0[out0]",
  car: "anoisesrc=d=2.4:c=brown:a=0.6,lowpass=f=420,afade=t=in:d=0.9,afade=t=out:st=1.2:d=1.2,volume=0.9",
};
for (const [name, graph] of Object.entries(SFX)) {
  ffmpeg(["-f", "lavfi", "-i", graph, "-t", "3", "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "128k", join(OUT, `${name}.mp3`)]);
  console.log(`✓ sfx/${name}.mp3`);
}

// ---------- музыка ----------
const TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const music = () => {
  const duration = 96;
  const n = Math.round(duration * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const beat = 60 / 80;
  const bar = beat * 4;
  // D – A/C# – Bm – G (бас — первая нота)
  const chords = [
    [50, 57, 62, 66],
    [49, 57, 61, 64],
    [47, 54, 59, 62],
    [43, 55, 59, 62],
  ];
  const rand = mulberry32(31);
  const tone = (start, len, f0, amp, attack, release, harm, pan, detune = 0) => {
    const s0 = Math.floor(start * SR);
    const total = Math.floor((len + release) * SR);
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < total && s0 + i < n; i++) {
      const t = i / SR;
      const env = t < attack ? Math.sin(((t / attack) * Math.PI) / 2) : t < len ? 1 : Math.cos((((t - len) / release) * Math.PI) / 2);
      let v = 0;
      for (const [m, a] of harm) v += a * Math.sin(TAU * f0 * m * (1 + detune) * t);
      L[s0 + i] += v * env * amp * gl;
      R[s0 + i] += v * env * amp * gr;
    }
  };
  const pluck = (start, f0, amp, pan) => {
    const s0 = Math.floor(start * SR);
    const len = Math.floor(2.2 * SR);
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < len && s0 + i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.008) * Math.exp(-t / 0.6);
      const v = Math.sin(TAU * f0 * t) + 0.2 * Math.sin(TAU * f0 * 2 * t) * Math.exp(-t / 0.2) + 0.06 * Math.sin(TAU * f0 * 3.003 * t) * Math.exp(-t / 0.09);
      L[s0 + i] += v * env * amp * gl;
      R[s0 + i] += v * env * amp * gr;
    }
  };
  const pad = [
    [1, 1],
    [2, 0.14],
    [3, 0.04],
  ];
  const bars = Math.ceil(duration / bar);
  for (let b = 0; b < bars; b++) {
    const ch = chords[b % 4];
    const t0 = b * bar;
    ch.slice(1).forEach((m, k) => {
      tone(t0, bar, hz(m), 0.06, 1.4, 1.4, pad, -0.5 + k * 0.5, 0.0012);
      tone(t0, bar, hz(m), 0.045, 1.4, 1.4, pad, 0.5 - k * 0.5, -0.0012);
    });
    tone(t0, bar * 0.95, hz(ch[0] - 12), 0.12, 0.25, 0.9, [[1, 1], [2, 0.1]], 0);
    // редкое «перебирание» по нотам аккорда, со 2-го такта
    if (b >= 1) {
      const notes = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12];
      for (let k = 0; k < 4; k++) {
        if (rand() < 0.2) continue;
        pluck(t0 + k * beat + (k % 2 ? beat * 0.5 : 0), hz(notes[k]), 0.07, k % 2 ? 0.35 : -0.35);
      }
    }
  }
  const fade = Math.round(3 * SR);
  for (let i = 0; i < fade; i++) {
    const g = i / fade;
    L[i] *= g;
    R[i] *= g;
    L[n - 1 - i] *= g;
    R[n - 1 - i] *= g;
  }
  normalizePeak([L, R], -3);
  const tmp = join(tmpdir(), "bg030-music.wav");
  writeWav(tmp, [L, R]);
  wavToMp3(tmp, join(DIR, "music.mp3"));
  console.log("✓ music.mp3");
};
music();
