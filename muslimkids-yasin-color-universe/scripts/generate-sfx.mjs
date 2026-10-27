// Деликатный звуковой дизайн БЕЗ МУЗЫКИ: мягкие воздушные переходы на морфингах,
// тихие «собирания», дождь, шелест листьев. Всё синтезируется детерминированно.
// Тайминги берутся из того же таймлайна, что и анимация (src/timeline.ts).
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const tmp = path.resolve("output/.cues.mjs");
mkdirSync("output", { recursive: true });
await build({
  stdin: { contents: `export { KEYFRAMES, CUES, DURATION_S } from "./src/timeline.ts";`, resolveDir: process.cwd(), loader: "ts" },
  bundle: true, format: "esm", platform: "node", outfile: tmp, logLevel: "error",
});
const { KEYFRAMES, CUES, DURATION_S } = await import(tmp + `?t=${Date.now()}`);

const SR = 48000;
const out = new Float32Array(SR * DURATION_S);
let seed = 12345;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const add = (t0, buf) => {
  const i0 = Math.round(t0 * SR);
  for (let i = 0; i < buf.length && i0 + i < out.length; i++) if (i0 + i >= 0) out[i0 + i] += buf[i];
};

const whoosh = (dur, gain) => {
  const n = Math.round(dur * SR);
  const b = new Float32Array(n);
  let lp = 0, lp2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.15)), 2);
    const cut = 0.012 + 0.05 * Math.sin(Math.PI * x); // плавное «дыхание» фильтра
    lp += cut * (rnd() * 2 - 1 - lp);
    lp2 += cut * (lp - lp2);
    b[i] = (lp - lp2 * 0.6) * env * gain * 1.6;
  }
  return b;
};

const chime = (gain, f = 659.25) => {
  const n = Math.round(1.8 * SR);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.012);
    b[i] = gain * 0.11 * att * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.6) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 4.5) + 0.12 * Math.sin(2 * Math.PI * f * 3.02 * t) * Math.exp(-t * 7));
  }
  return b;
};

const sparkle = (gain) => {
  const n = Math.round(1.2 * SR);
  const b = new Float32Array(n);
  const notes = [1318.5, 1567.98, 1760, 2093, 2349.3, 2637];
  for (let k = 0; k < 7; k++) {
    const t0 = rnd() * 0.8, f = notes[Math.floor(rnd() * notes.length)];
    const s0 = Math.round(t0 * SR);
    for (let i = 0; i < SR * 0.35 && s0 + i < n; i++) {
      const t = i / SR;
      b[s0 + i] += gain * 0.03 * Math.min(1, t / 0.004) * Math.exp(-t * 14) * Math.sin(2 * Math.PI * f * t);
    }
  }
  return b;
};

const rain = (dur, gain) => {
  const n = Math.round(dur * SR);
  const b = new Float32Array(n);
  let hp = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const env = Math.min(1, x * 5) * Math.min(1, (1 - x) * 4);
    const w = rnd() * 2 - 1;
    hp = 0.92 * (hp + w - prev);
    prev = w;
    b[i] = hp * env * gain * 0.05;
  }
  for (let k = 0; k < dur * 26; k++) {
    const s0 = Math.floor(rnd() * (n - SR * 0.05)), f = 1800 + rnd() * 2600, a = 0.02 + rnd() * 0.04;
    for (let i = 0; i < SR * 0.03; i++) b[s0 + i] += gain * a * Math.exp(-i / SR * 160) * Math.sin(2 * Math.PI * f * (i / SR));
  }
  return b;
};

const rustle = (dur, gain) => {
  const n = Math.round(dur * SR);
  const b = new Float32Array(n);
  let lp = 0, am = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const env = Math.sin(Math.PI * x);
    lp += 0.35 * (rnd() * 2 - 1 - lp);
    if (i % 480 === 0) am = 0.4 + 0.6 * rnd();
    b[i] = (rnd() * 2 - 1 - lp) * env * am * gain * 0.045;
  }
  return b;
};

// мягкий воздух на каждом морфинге (тише явных акцентов)
KEYFRAMES.forEach((k, i) => {
  if (!k.tr || i === 0) return;
  add(k.at - k.tr.dur, whoosh(k.tr.dur * 1.05, 0.05 + 0.04 * Math.min(1, k.tr.dur)));
});
const chimeNotes = [659.25, 783.99, 880, 1046.5];
let ci = 0;
for (const c of CUES) {
  if (c.kind === "whoosh") add(c.at, whoosh(c.dur ?? 1.2, 0.09 * (c.gain ?? 1)));
  if (c.kind === "chime") add(c.at, chime(c.gain ?? 1, chimeNotes[ci++ % chimeNotes.length]));
  if (c.kind === "sparkle") add(c.at, sparkle(c.gain ?? 1));
  if (c.kind === "rain") add(c.at, rain(c.dur ?? 2, c.gain ?? 1));
  if (c.kind === "rustle") add(c.at, rustle(c.dur ?? 1.5, c.gain ?? 1));
}
// мягкий конец
for (let i = 0; i < SR * 1.2; i++) out[out.length - 1 - i] *= i / (SR * 1.2);

const pcm = Buffer.alloc(44 + out.length * 2);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + out.length * 2, 4); pcm.write("WAVE", 8); pcm.write("fmt ", 12);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(out.length * 2, 40);
let peak = 0;
for (let i = 0; i < out.length; i++) {
  const v = Math.max(-1, Math.min(1, out[i]));
  peak = Math.max(peak, Math.abs(v));
  pcm.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
}
writeFileSync("public/audio/sfx.wav", pcm);
console.log(`sfx.wav: ${DURATION_S}s, peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS, cues ${CUES.length}`);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "public/audio/sfx.wav", "-af", "ebur128", "-f", "null", "-"], { stdio: "ignore" });
