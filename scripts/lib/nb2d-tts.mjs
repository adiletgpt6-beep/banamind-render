// Синтез одной реплики BalaGoNoBackup2D (ElevenLabs eleven_v3, ky).
//
// • Сначала синтезируется точная реплика. При проблеме с окончанием —
//   одна повторная попытка со страховочным словом и паузой перед ним.
// • Тишина по краям обрезается, громкость реплик выравнивается.
// • Темп и высота тона НЕ меняются.
// • Для губ сохраняются тайминги букв (alignment) и огибающая громкости
//   файла по кадрам (30 к/с): рот движется по фактической речи и закрыт в паузах.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { NB2_TTS, NB2_VIDEO } from "../../src/no-backup-2d/script.ts";
import { SAMPLE_RATE as SR, decodeMono, ffmpeg, writeWav } from "./audio.mjs";

const TMP = join(tmpdir(), "balago-nb2d-voice");
mkdirSync(TMP, { recursive: true });
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const round = (x) => Number(x.toFixed(3));
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);

// Голоса ролей: voice-samples/no-backup-2d/design/voices.json (роль → voiceId),
// создаются scripts/nb2d-voice-design.mjs.
export const VOICES = "voice-samples/no-backup-2d/design/voices.json";
export const voiceOfRole = (role) => {
  const map = existsSync(VOICES) ? JSON.parse(readFileSync(VOICES, "utf8")) : {};
  const v = map[role];
  return v?.voiceId ? { name: `KG-${role}`, voiceId: v.voiceId } : null;
};

export const lineSeed = (line) => line.seed ?? NB2_TTS.seed;

export const nb2Hash = (line, voiceId, seed = lineSeed(line)) =>
  createHash("sha1")
    .update(
      JSON.stringify({
        v: 1,
        text: line.spoken ?? line.text,
        voiceId,
        modelId: NB2_TTS.modelId,
        languageCode: NB2_TTS.languageCode,
        voiceSettings: NB2_TTS.voiceSettings,
        seed,
      }),
    )
    .digest("hex")
    .slice(0, 16);

const rmsDb = (s, from, to) => {
  let acc = 0;
  const a = Math.max(0, from);
  const b = Math.min(s.length, to);
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};

const PAD = "Рахмат.";

const synthesize = async (apiKey, line, voice, seed, padMode) => {
  const body = line.spoken ?? line.text;
  const withPad = padMode !== "none";
  const sep = padMode === "pause" ? " ... " : " ";
  const text = `${body}${withPad ? `${sep}${PAD}` : ""}`;
  console.log(`→ ${line.id} [${line.role}: ${voice.name}] seed ${seed} (${padMode}): «${body}»`);
  const res = await fetch(`${API}/v1/text-to-speech/${voice.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: NB2_TTS.modelId,
      language_code: NB2_TTS.languageCode,
      seed,
      voice_settings: NB2_TTS.voiceSettings,
      apply_text_normalization: "auto",
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const al = data.alignment;
  if (!al?.characters?.length) throw new Error("Нет таймингов (alignment).");
  const starts = al.character_start_times_seconds;
  const ends = al.character_end_times_seconds;
  const aligned = al.characters.join("");
  const span = (from, needle) => {
    const i = aligned.indexOf(needle, from);
    if (i < 0) return null;
    let a = i;
    let b = i + needle.length - 1;
    while (a < b && !isLetter(aligned[a])) a++;
    while (b > a && !isLetter(aligned[b])) b--;
    return { a, b, next: i + needle.length };
  };
  const whole = span(0, body);
  if (!whole) throw new Error(`Реплика ${line.id} не найдена в таймингах.`);
  const words = [];
  let wc = aligned.indexOf(body);
  for (const w of body.split(/\s+/).filter((x) => [...x].some(isLetter))) {
    const r = span(wc, w);
    if (!r) continue;
    words.push({ text: w, start: starts[r.a], end: ends[r.b] });
    wc = r.next;
  }
  const chars = [];
  for (let i = whole.a; i <= whole.b; i++) {
    if (/\p{L}/u.test(aligned[i])) chars.push({ c: aligned[i].toLowerCase(), start: starts[i], end: ends[i] });
  }
  const pad = withPad ? span(whole.next, PAD) : null;
  return {
    audio: Buffer.from(data.audio_base64, "base64"),
    start: starts[whole.a],
    end: ends[whole.b],
    padStart: pad ? starts[pad.a] : null,
    words,
    chars,
  };
};

// Две попытки: точная реплика, затем пауза и страховочное слово.
// Принимается только файл с отделённым тишиной окончанием.
const attempt = async (apiKey, line, voice, baseSeed) => {
  const raw = join(TMP, `${line.id}-${baseSeed}-raw.mp3`);
  const plan = [[0, "none"], [1, "pause"]];
  for (let i = 0; i < plan.length; i++) {
    const [ds, padMode] = plan[i];
    const seed = baseSeed + ds;
    const res = await synthesize(apiKey, line, voice, seed, padMode);
    writeFileSync(raw, res.audio);
    const pcm = decodeMono(raw);
    const withPad = padMode !== "none";
    const cutAt = withPad && res.padStart !== null ? Math.min(res.padStart - 0.04, res.end + 0.5) : pcm.length / SR;
    const cut = Math.min(pcm.length, Math.round(cutAt * SR));
    const win = withPad ? 0.12 : 0.04;
    const tail = rmsDb(pcm, cut - Math.round(win * SR), cut);
    const after = cutAt - res.end;
    const ok = withPad ? tail < -35 && after >= 0.08 : tail < -30 && after >= 0;
    const cand = { ...res, pcm: pcm.slice(0, cut), seed, tail };
    if (ok) return cand;
    console.warn(`  ⚠ ${line.id}, попытка ${i + 1} (${padMode}): конец не отделён тишиной (${tail.toFixed(1)} дБ)`);
  }
  throw new Error(`${line.id}: окончание не отделено тишиной после двух попыток. Необходимо проверить реплику, файл не принят.`);
};

// Обрезка тишины, выравнивание громкости (речь −16,5 дБFS, пик ≤ −2,5 дБFS),
// огибающая по кадрам для губ.
const finish = (res, outPath, id) => {
  const { pcm } = res;
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
  const a = Math.max(0, Math.max(first, Math.round((res.start - 0.15) * SR)) - Math.round(0.05 * SR));
  const b = Math.min(pcm.length, Math.max(last + win, Math.round(res.end * SR)) + Math.round(0.15 * SR));
  const out = pcm.slice(a, b);
  const fi = Math.round(0.01 * SR);
  const fo = Math.round(0.03 * SR);
  for (let i = 0; i < Math.min(fi, out.length); i++) out[i] *= i / fi;
  for (let i = 0; i < Math.min(fo, out.length); i++) out[out.length - 1 - i] *= i / fo;
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
  const wav = join(TMP, `${id}.wav`);
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
  // огибающая: RMS кадра (1/30 с) → 0…1 (−45 дБ → 0, −12 дБ → 1)
  const fps = NB2_VIDEO.fps;
  const per = SR / fps;
  const env = [];
  for (let i = 0; i * per < final.length; i++) {
    const db = rmsDb(final, Math.round(i * per), Math.round((i + 1) * per));
    env.push(Number(Math.max(0, Math.min(1, (db + 45) / 33)).toFixed(2)));
  }
  const rel = (t) => round(Math.max(0, t - shift));
  return {
    durationSec: round(final.length / SR),
    speechStart: rel(res.start),
    speechEnd: round(res.end - shift),
    words: res.words.map((w) => ({ text: w.text, start: rel(w.start), end: round(w.end - shift) })),
    chars: res.chars.map((c) => ({ c: c.c, start: rel(c.start), end: round(c.end - shift) })),
    env,
    gainDb: round(gainDb),
    peakDb: round(20 * Math.log10(peak || 1e-9)),
  };
};

// Синтезирует реплику голосом voice в outPath; возвращает описание файла.
export const synthLine = async (apiKey, line, voice, outPath, seed = lineSeed(line)) => {
  const res = await attempt(apiKey, line, voice, seed);
  const fin = finish(res, outPath, `${line.id}-${seed}`);
  console.log(
    `  ✓ ${outPath}: ${fin.durationSec.toFixed(2)} с, речь ${fin.speechStart.toFixed(2)}–${fin.speechEnd.toFixed(2)} с, пик ${fin.peakDb} дБFS`,
  );
  return {
    id: line.id,
    role: line.role,
    text: line.text,
    spoken: line.spoken ?? line.text,
    voiceName: voice.name,
    voiceId: voice.voiceId,
    modelId: NB2_TTS.modelId,
    seed: res.seed,
    ...fin,
  };
};
