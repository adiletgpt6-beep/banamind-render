// Принимает прослушанный дубль реплики BalaGoHalfHour в кэш озвучки.
//   node scripts/hh-adopt-take.mjs <id> <words.json>
// words.json — [[слово, начало, конец], …] в секундах исходного дубля
// (пословные метки распознавания; слитные слова делятся по длине заранее).
// Обработка та же, что в generate-hh-voice.mjs: обрезка тишины по краям,
// средний уровень речи −16,5 дБFS, пик ≤ −2,5 дБFS. Темп не меняется.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { HH_LINES, HH_TTS, HH_VIDEO, HH_VOICE_CHOICE, HH_VOICES } from "../src/half-hour/script.ts";
import { SAMPLE_RATE as SR, decodeMono, ffmpeg, writeWav } from "./lib/audio.mjs";
import { lineHash } from "./lib/hh-hash.mjs";

const [id, wordsPath] = process.argv.slice(2);
const line = HH_LINES.find((l) => l.id === id);
if (!line?.take) throw new Error(`У реплики ${id} нет выбранного дубля (take)`);
const marks = JSON.parse(readFileSync(wordsPath, "utf8"));
const scriptWords = line.text.split(/\s+/).filter((w) => /\p{L}/u.test(w));
if (marks.length !== scriptWords.length) throw new Error(`${id}: ${marks.length} меток на ${scriptWords.length} слов`);

const round = (x) => Number(x.toFixed(3));
const rmsDb = (s, a, b) => {
  let acc = 0;
  for (let i = Math.max(0, a); i < Math.min(s.length, b); i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};
const pcm = decodeMono(line.take);
const thr = Math.pow(10, -45 / 20), win = Math.round(0.01 * SR);
const loudAt = (i) => {
  for (let k = i; k < Math.min(pcm.length, i + win); k++) if (Math.abs(pcm[k]) > thr) return true;
  return false;
};
let first = 0;
while (first < pcm.length && !loudAt(first)) first += win;
let last = pcm.length - win;
while (last > first && !loudAt(last)) last -= win;
const a = Math.max(0, first - Math.round(0.05 * SR));
const b = Math.min(pcm.length, last + win + Math.round(0.15 * SR));
const out = pcm.slice(a, b);
const fi = Math.round(0.01 * SR), fo = Math.round(0.03 * SR);
for (let i = 0; i < Math.min(fi, out.length); i++) out[i] *= i / fi;
for (let i = 0; i < Math.min(fo, out.length); i++) out[out.length - 1 - i] *= i / fo;
const blk = Math.round(0.05 * SR);
let acc = 0, cnt = 0;
for (let i = 0; i + blk <= out.length; i += blk) {
  const db = rmsDb(out, i, i + blk);
  if (db > -40) { acc += Math.pow(10, db / 10); cnt++; }
}
const gainDb = -16.5 - (cnt ? 10 * Math.log10(acc / cnt) : -30);
const OUT = join("public", HH_VIDEO.voiceDir);
const file = `${id}.mp3`;
const wav = join(tmpdir(), `hh-adopt-${id}.wav`);
writeWav(wav, [out]);
ffmpeg(["-i", wav, "-af", `volume=${gainDb.toFixed(2)}dB,alimiter=limit=0.75:attack=3:release=60:level=disabled`,
  "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, file)]);
const final = decodeMono(join(OUT, file));
const shift = a / SR;
// Речь: от первого звука до конца последнего слова (не раньше звука).
const speechStart = round(Math.max(0, first / SR - shift));
const words = scriptWords.map((text, i) => ({
  text,
  start: round(Math.max(speechStart, marks[i][1] - shift)),
  end: round(Math.min(final.length / SR, marks[i][2] - shift)),
}));
const speechEnd = round(Math.max(words.at(-1).end, (last + win) / SR - shift));
const voice = HH_VOICE_CHOICE[line.role];
const manifestPath = join(OUT, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const take = line.take.split("/").at(-1);
const seed = Number(/-s(\d+)/.exec(take)?.[1] ?? HH_TTS.seed);
manifest.lines = manifest.lines.map((l) => l.id !== id ? l : {
  id, role: line.role, character: HH_VOICES[line.role].role, text: line.text,
  spoken: line.spoken ?? line.text, voiceName: voice.name, voiceId: voice.voiceId,
  modelId: HH_TTS.modelId, voiceSettings: HH_TTS.voiceSettings, seed, take: line.take,
  hash: lineHash(line, voice.voiceId), file,
  durationSec: round(final.length / SR), speechStart, speechEnd, words,
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`✓ ${file} ← ${line.take}: ${round(final.length / SR)} с, речь ${speechStart}–${speechEnd} с, усиление ${round(gainDb)} дБ`);
