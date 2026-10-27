// Неподвижная бумажная фактура фильма №36: один PNG 512×512 (серое зерно с
// мягкими волокнами), детерминированный (mulberry32, seed 36). Лежит в мире
// сцены и движется вместе с рисунком — покадрового шума нет, мерцания нет.
// Запуск: node scripts/sd2d-paper.mjs → public/assets/suitcase-36/paper-grain.png
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { mulberry32 } from "./lib/audio.mjs";

const N = 512;
const rnd = mulberry32(36);
const v = new Float32Array(N * N);
// мелкое зерно
for (let i = 0; i < v.length; i++) v[i] = rnd() * 0.55;
// мягкие волокна: короткие светлые/тёмные штрихи под случайными углами
for (let k = 0; k < 900; k++) {
  const x0 = rnd() * N;
  const y0 = rnd() * N;
  const a = rnd() * Math.PI;
  const len = 6 + rnd() * 26;
  const dark = rnd() < 0.5 ? 0.35 : -0.25;
  for (let s = 0; s < len; s++) {
    const x = Math.floor(x0 + Math.cos(a) * s + N) % N;
    const y = Math.floor(y0 + Math.sin(a) * s + N) % N;
    v[y * N + x] += dark;
  }
}
// бесшовное размытие 3×3 (зерно мягче)
const b = new Float32Array(N * N);
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    let acc = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) acc += v[((y + dy + N) % N) * N + ((x + dx + N) % N)];
    b[y * N + x] = acc / 9;
  }
// серый (для multiply): 255 — без изменений, темнее — зерно
const raw = Buffer.alloc((N * 4 + 1) * N);
for (let y = 0; y < N; y++) {
  raw[y * (N * 4 + 1)] = 0;
  for (let x = 0; x < N; x++) {
    const g = Math.max(0, Math.min(255, Math.round(255 - b[y * N + x] * 60)));
    const o = y * (N * 4 + 1) + 1 + x * 4;
    raw[o] = g;
    raw[o + 1] = Math.max(0, g - 3);
    raw[o + 2] = Math.max(0, g - 10);
    raw[o + 3] = 255;
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const x of buf) c = crcTable[(c ^ x) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(N, 0);
ihdr.writeUInt32BE(N, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
mkdirSync("public/assets/suitcase-36", { recursive: true });
writeFileSync("public/assets/suitcase-36/paper-grain.png", png);
console.log(`paper-grain.png: ${png.length} байт`);
