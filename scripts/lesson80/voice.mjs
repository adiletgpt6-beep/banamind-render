// Общая постобработка реплики LESSON-80 и сборка строки manifest:
//   • обрезка тишины по краям (небольшой запас), плавные края;
//   • выравнивание громкости речи (≈ −16,5 дБFS RMS) и ограничитель;
//   • mp3 44,1 кГц 192 кбит/с;
//   • тайминги слов → буквы (равномерно внутри слова, если провайдер не дал
//     буквенных таймингов) и огибающая громкости по кадрам (30 к/с) для губ.
import { createHash } from "node:crypto";
import { join } from "node:path";
import { SAMPLE_RATE as SR, decodeMono, ffmpeg, writeWav } from "../lib/audio.mjs";
import { FPS } from "../../src/lesson80/core/video.ts";

const round = (x) => Number(x.toFixed(3));
const isLetter = (ch) => /\p{L}/u.test(ch);

export const rmsDb = (s, from, to) => {
  let acc = 0;
  const a = Math.max(0, from);
  const b = Math.min(s.length, to);
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};

export const lineHash = (line, provider, spec, version) =>
  createHash("sha1").update(JSON.stringify({ v: version, text: line.spoken ?? line.text, provider, spec })).digest("hex").slice(0, 16);

// pcm — Float32 моно SR; words — тайминги слов от начала pcm (с).
export const finishLine = ({ pcm, words, chars, outPath, tmpDir, id }) => {
  const thr = Math.pow(10, -45 / 20);
  const win = Math.round(0.01 * SR);
  const loudAt = (i) => {
    let m = 0;
    for (let k = i; k < Math.min(pcm.length, i + win); k++) m = Math.max(m, Math.abs(pcm[k]));
    return m > thr;
  };
  let first = 0;
  while (first < pcm.length && !loudAt(first)) first += win;
  let last = pcm.length - win;
  while (last > first && !loudAt(last)) last -= win;
  const a = Math.max(0, first - Math.round(0.06 * SR));
  const b = Math.min(pcm.length, last + win + Math.round(0.16 * SR));
  const out = pcm.slice(a, b);
  const fi = Math.round(0.01 * SR);
  const fo = Math.round(0.04 * SR);
  for (let i = 0; i < Math.min(fi, out.length); i++) out[i] *= i / fi;
  for (let i = 0; i < Math.min(fo, out.length); i++) out[out.length - 1 - i] *= i / fo;
  // громкость речи: средняя мощность громких блоков 50 мс
  const blk = Math.round(0.05 * SR);
  let acc = 0;
  let cnt = 0;
  for (let i = 0; i + blk <= out.length; i += blk) {
    const db = rmsDb(out, i, i + blk);
    if (db > -40) {
      acc += Math.pow(10, db / 10);
      cnt++;
    }
  }
  const speechDb = cnt ? 10 * Math.log10(acc / cnt) : -30;
  const gainDb = -16.5 - speechDb;
  const wav = join(tmpDir, `${id}.wav`);
  writeWav(wav, [out]);
  ffmpeg([
    "-i", wav,
    "-af", `volume=${gainDb.toFixed(2)}dB,alimiter=limit=0.75:attack=3:release=60:level=disabled`,
    "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "192k",
    outPath,
  ]);
  const shift = a / SR;
  const final = decodeMono(outPath);
  let peak = 0;
  for (const v of final) peak = Math.max(peak, Math.abs(v));
  const per = SR / FPS;
  const env = [];
  for (let i = 0; i * per < final.length; i++) {
    const db = rmsDb(final, Math.round(i * per), Math.round((i + 1) * per));
    env.push(Number(Math.max(0, Math.min(1, (db + 45) / 33)).toFixed(2)));
  }
  const rel = (t) => round(Math.max(0, t - shift));
  const w2 = words.map((w) => ({ text: w.text, start: rel(w.start), end: round(Math.max(rel(w.start) + 0.05, w.end - shift)) }));
  // буквы: от провайдера или равномерно внутри слова
  let c2;
  if (chars?.length) c2 = chars.map((c) => ({ c: c.c, start: rel(c.start), end: round(c.end - shift) }));
  else {
    c2 = [];
    for (const w of w2) {
      const letters = [...w.text.toLowerCase()].filter(isLetter);
      const d = (w.end - w.start) / Math.max(1, letters.length);
      letters.forEach((c, i) => c2.push({ c, start: round(w.start + i * d), end: round(w.start + (i + 1) * d) }));
    }
  }
  const speechStart = w2.length ? Math.max(0, w2[0].start) : round(Math.max(0, first / SR - shift));
  const speechEnd = w2.length ? Math.min(final.length / SR, w2[w2.length - 1].end) : round((last + win) / SR - shift);
  return {
    durationSec: round(final.length / SR),
    speechStart: round(speechStart),
    speechEnd: round(speechEnd),
    words: w2,
    chars: c2,
    env,
    gainDb: round(gainDb),
    peakDb: round(20 * Math.log10(peak || 1e-9)),
  };
};
