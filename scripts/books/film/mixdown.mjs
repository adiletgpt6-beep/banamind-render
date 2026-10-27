// Звуковая дорожка фильма книги BanaMind: каждая реплика — на своё место тайм-лайна
// (то же время, что и в кадре). Без музыки и сигналов-отсчётов. WAV 48 кГц моно.
// Запуск: node scripts/books/film/mixdown.mjs src/books/<slug>/film/film.ts out/audio.wav
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [MOD, OUT = "out/audio.wav"] = process.argv.slice(2);
const film = await import(pathToFileURL(MOD).href);
const SR = 48000;
const tl = film.timeline();
const missing = tl.lines.filter((l) => !l.file);
if (missing.length && !process.argv.includes("--allow-missing")) throw new Error(`Нет озвучки для ${missing.length} реплик (${missing[0].id}…)`);
const total = Math.ceil(tl.duration * SR);
const mix = new Float32Array(total);
const decode = (f) => {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
};
for (const ln of tl.lines) {
  if (!ln.file) continue;
  const s = decode(join(film.VOICE_DIR, ln.file));
  const at = Math.round(ln.from * SR);
  for (let i = 0; i < s.length && at + i < total; i++) mix[at + i] += s[i];
}
const pcm = Buffer.alloc(total * 2);
for (let i = 0; i < total; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i])) * 32767), i * 2);
const h = Buffer.alloc(44);
h.write("RIFF", 0);
h.writeUInt32LE(36 + pcm.length, 4);
h.write("WAVEfmt ", 8);
h.writeUInt32LE(16, 16);
h.writeUInt16LE(1, 20);
h.writeUInt16LE(1, 22);
h.writeUInt32LE(SR, 24);
h.writeUInt32LE(SR * 2, 28);
h.writeUInt16LE(2, 32);
h.writeUInt16LE(16, 34);
h.write("data", 36);
h.writeUInt32LE(pcm.length, 40);
writeFileSync(OUT, Buffer.concat([h, pcm]));
console.log(`✓ ${OUT}: ${tl.duration.toFixed(2)} с, реплик ${tl.lines.length}`);
