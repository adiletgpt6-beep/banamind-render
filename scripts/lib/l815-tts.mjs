// Синтез одной реплики Lesson80_1_5 и обработка файла.
//
// Провайдеры: openai (gpt-4o-mini-tts + whisper-1 для таймингов слов),
// piper и rhvoice (локально, временная дорожка). Общая обработка:
// обрезка тишины по краям, выравнивание громкости речи, огибающая
// громкости по кадрам (30 к/с) для губ, тайминги слов (whisper или по
// энергии сигнала), оценка высоты голоса (для voice lab). Темп и тон не
// меняются.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { L815_FPS } from "../../src/lesson-80-1-5/script.ts";
import { L815_ELEVEN_TTS, L815_TTS } from "../../src/lesson-80-1-5/voices.ts";
import { SAMPLE_RATE as SR, decodeMono, ffmpeg, writeWav } from "./audio.mjs";

export const TMP = join(tmpdir(), "balago-l815-voice");
mkdirSync(TMP, { recursive: true });
const round = (x) => Number(x.toFixed(3));
const isLetter = (ch) => /\p{L}/u.test(ch);
const OPENAI = process.env.OPENAI_API_BASE?.trim() || "https://api.openai.com";
// Каталог локальных голосов Piper (модель.onnx + .onnx.json).
export const PIPER_DIR = process.env.L815_PIPER_DIR?.trim() || resolve("scripts/l815-voices");
export const PIPER_PY = process.env.L815_PIPER_PY?.trim() || "python3";

export const voiceKey = (v) =>
  v.provider === "openai"
    ? `${v.provider}:${v.model}:${v.voice}`
    : v.provider === "elevenlabs"
      ? `${v.provider}:${v.model}:${v.name}`
      : v.provider === "piper"
        ? `${v.provider}:${v.model}`
        : `${v.provider}:${v.voice}`;
const ELEVEN = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";

export const l815Hash = (line, voice, seed = L815_TTS.seed) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 3, text: line.spoken ?? line.text, voice, seed, speechDb: L815_TTS.speechDb }))
    .digest("hex")
    .slice(0, 16);

const rmsDb = (s, from, to) => {
  let acc = 0;
  const a = Math.max(0, from);
  const b = Math.min(s.length, to);
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};

// ---------- синтез ----------
const headers = () => {
  const h = { "Content-Type": "application/json" };
  const key = process.env.OPENAI_API_KEY?.trim();
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
};

export class ProviderUnavailable extends Error {}

const synthOpenAI = async (line, voice, outWav) => {
  let res;
  try {
    res = await fetch(`${OPENAI}/v1/audio/speech`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: voice.model,
      voice: voice.voice,
      input: line.spoken ?? line.text,
      instructions: voice.instructions,
      response_format: "wav",
    }),
    });
  } catch (e) {
    // сеть: за прокси Node нужен NODE_USE_ENV_PROXY=1 (Node ≥ 22.21)
    throw new ProviderUnavailable(`OpenAI недоступен: ${e.cause?.code ?? e.message}`);
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    if (res.status === 429 || res.status === 401 || res.status === 403) throw new ProviderUnavailable(`OpenAI ${res.status}: ${body}`);
    throw new Error(`OpenAI ${res.status}: ${body}`);
  }
  writeFileSync(outWav, Buffer.from(await res.arrayBuffer()));
};

// Тайминги слов whisper-1 (verbose_json). Возвращает null, если недоступно.
const transcribeOpenAI = async (wavPath, text) => {
  try {
    const fd = new FormData();
    const { readFileSync } = await import("node:fs");
    fd.append("file", new Blob([readFileSync(wavPath)], { type: "audio/wav" }), "line.wav");
    fd.append("model", L815_TTS.transcribeModel);
    fd.append("language", "ru");
    fd.append("response_format", "verbose_json");
    fd.append("timestamp_granularities[]", "word");
    fd.append("prompt", text);
    const h = headers();
    delete h["Content-Type"];
    const res = await fetch(`${OPENAI}/v1/audio/transcriptions`, { method: "POST", headers: h, body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.words) || !data.words.length) return null;
    return { words: data.words.map((w) => ({ text: w.word, start: w.start, end: w.end })), heard: data.text };
  } catch {
    return null;
  }
};

// ElevenLabs eleven_v3 с таймингами букв (with-timestamps); тег интонации
// перед текстом не звучит; возвращает слова по алignment.
const synthEleven = async (line, voice, outWav) => {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) throw new ProviderUnavailable("ELEVENLABS_API_KEY не задан");
  const body = line.spoken ?? line.text;
  // страховочное слово в конце: модель договаривает последнее слово реплики,
  // затем хвост вырезается по таймингам (как в scripts/lib/ts2d-tts.mjs)
  const PAD = "Спасибо.";
  const text = `${voice.tag ? `${voice.tag} ` : ""}${body} ... ${PAD}`;
  let res;
  try {
    res = await fetch(`${ELEVEN}/v1/text-to-speech/${voice.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: voice.model, language_code: L815_ELEVEN_TTS.languageCode, seed: L815_ELEVEN_TTS.seed, voice_settings: L815_ELEVEN_TTS.voiceSettings, apply_text_normalization: "auto" }),
    });
  } catch (e) {
    throw new ProviderUnavailable(`ElevenLabs недоступен: ${e.cause?.code ?? e.message}`);
  }
  if (!res.ok) {
    const t = (await res.text()).slice(0, 300);
    if ([401, 402, 403, 429].includes(res.status)) throw new ProviderUnavailable(`ElevenLabs ${res.status}: ${t}`);
    throw new Error(`ElevenLabs ${res.status}: ${t}`);
  }
  const data = await res.json();
  const mp3 = join(TMP, `${line.id}-eleven.mp3`);
  writeFileSync(mp3, Buffer.from(data.audio_base64, "base64"));
  const al = data.alignment;
  const aligned = al?.characters?.length ? al.characters.join("") : "";
  const starts = al?.character_start_times_seconds ?? [];
  const ends = al?.character_end_times_seconds ?? [];
  // вырезать страховочное слово: по концу последней буквы реплики (+0,28 с
  // на затухание), но не позже начала страховочного слова минус 40 мс
  const bodyAt = aligned.indexOf(body);
  let bodyEnd = -1;
  if (bodyAt >= 0) {
    for (let i = bodyAt + body.length - 1; i >= bodyAt; i--) {
      if (isLetter(aligned[i])) {
        bodyEnd = ends[i];
        break;
      }
    }
  }
  const padAt = bodyAt >= 0 ? aligned.indexOf(PAD.replace(".", ""), bodyAt + body.length) : -1;
  let cutAt = bodyEnd >= 0 ? bodyEnd + 0.28 : null;
  if (padAt >= 0) cutAt = Math.min(cutAt ?? Infinity, starts[padAt] - 0.04);
  const cutArgs = cutAt !== null && Number.isFinite(cutAt) ? ["-t", String(Math.max(0.2, cutAt))] : [];
  ffmpeg(["-i", mp3, ...cutArgs, "-ar", "44100", "-ac", "1", outWav]);
  if (!aligned) return null;
  const words = [];
  let from = aligned.indexOf(body);
  if (from < 0) from = 0;
  for (const w of body.split(/\s+/).filter((x) => [...x].some(isLetter))) {
    const i = aligned.indexOf(w, from);
    if (i < 0) continue;
    let a = i;
    let b = i + w.length - 1;
    while (a < b && !isLetter(aligned[a])) a++;
    while (b > a && !isLetter(aligned[b])) b--;
    words.push({ text: w, start: starts[a], end: ends[b] });
    from = i + w.length;
  }
  return words.length ? words : null;
};

const synthPiper = (line, voice, outWav) => {
  const model = join(PIPER_DIR, `${voice.model}.onnx`);
  if (!existsSync(model)) throw new ProviderUnavailable(`Нет модели Piper ${model}`);
  const args = ["-m", "piper", "-m", model, "-f", outWav, "--length-scale", String(voice.lengthScale ?? 1), "--sentence-silence", "0.25"];
  if (voice.noiseScale !== undefined) args.push("--noise-scale", String(voice.noiseScale));
  if (voice.noiseW !== undefined) args.push("--noise-w-scale", String(voice.noiseW));
  execFileSync(PIPER_PY, args, { input: line.spoken ?? line.text, stdio: ["pipe", "ignore", "inherit"] });
};

const synthRhvoice = (line, voice, outWav) => {
  try {
    execFileSync("RHVoice-test", ["-p", voice.voice, "-r", String(voice.rate ?? 100), "-R", "24000", "-o", outWav], {
      input: line.spoken ?? line.text,
      stdio: ["pipe", "ignore", "inherit"],
    });
  } catch (e) {
    throw new ProviderUnavailable(`RHVoice недоступен: ${e.message.split("\n")[0]}`);
  }
};

export const synthRaw = async (line, voice, outWav) => {
  if (voice.provider === "openai") return synthOpenAI(line, voice, outWav);
  if (voice.provider === "elevenlabs") return synthEleven(line, voice, outWav);
  if (voice.provider === "piper") return synthPiper(line, voice, outWav);
  if (voice.provider === "rhvoice") return synthRhvoice(line, voice, outWav);
  throw new Error(`Неизвестный провайдер ${voice.provider}`);
};

// ---------- анализ ----------
// Участки речи по энергии (окно 10 мс): [start, end] в секундах.
export const voicedSpans = (pcm, thrDb = -38, minGap = 0.09, minLen = 0.04) => {
  const hop = Math.round(0.01 * SR);
  const n = Math.floor(pcm.length / hop);
  const loud = new Array(n).fill(false);
  for (let i = 0; i < n; i++) loud[i] = rmsDb(pcm, i * hop, (i + 1) * hop) > thrDb;
  const spans = [];
  let cur = null;
  for (let i = 0; i <= n; i++) {
    const on = i < n && loud[i];
    if (on && !cur) cur = [i, i + 1];
    else if (on) cur[1] = i + 1;
    else if (cur) {
      // короткий разрыв — продолжение того же участка
      if (spans.length && (cur[0] - spans[spans.length - 1][1]) * hop < minGap * SR) spans[spans.length - 1][1] = cur[1];
      else spans.push(cur);
      cur = null;
    }
  }
  return spans.filter(([a, b]) => (b - a) * hop >= minLen * SR).map(([a, b]) => [(a * hop) / SR, (b * hop) / SR]);
};

// Слова по энергии: озвученные участки конкатенируются в «речевое время»,
// каждое слово получает долю по числу букв (с весом за знак препинания).
export const alignByEnergy = (pcm, text, start, end) => {
  const tokens = text.split(/\s+/).filter((w) => [...w].some(isLetter));
  let spans = voicedSpans(pcm).filter(([a, b]) => b > start && a < end).map(([a, b]) => [Math.max(a, start), Math.min(b, end)]);
  if (!spans.length) spans = [[start, end]];
  const total = spans.reduce((s, [a, b]) => s + (b - a), 0);
  const weights = tokens.map((w) => [...w].filter(isLetter).length + (/[,.!?…:;—]$/.test(w) ? 1.2 : 0));
  const wsum = weights.reduce((a, b) => a + b, 0);
  // речевое время → реальное
  const toReal = (u) => {
    let d = u * total;
    for (const [a, b] of spans) {
      if (d <= b - a) return a + d;
      d -= b - a;
    }
    return spans[spans.length - 1][1];
  };
  const words = [];
  let acc = 0;
  tokens.forEach((w, i) => {
    const s = toReal(acc / wsum);
    acc += weights[i];
    const e = toReal(acc / wsum);
    words.push({ text: w, start: round(s), end: round(Math.max(s + 0.05, e)) });
  });
  return words;
};

export const charsFromWords = (words) => {
  const chars = [];
  for (const w of words) {
    const letters = [...w.text.toLowerCase()].filter(isLetter);
    const d = (w.end - w.start) / Math.max(1, letters.length);
    letters.forEach((c, i) => chars.push({ c, start: round(w.start + i * d), end: round(w.start + (i + 1) * d) }));
  }
  return chars;
};

// Высота голоса: автокорреляция на громких окнах 40 мс, медиана (Гц).
export const measureF0 = (pcm) => {
  const win = Math.round(0.04 * SR);
  const hop = Math.round(0.02 * SR);
  const minLag = Math.round(SR / 500);
  const maxLag = Math.round(SR / 70);
  const f0s = [];
  for (let i = 0; i + win < pcm.length; i += hop) {
    if (rmsDb(pcm, i, i + win) < -30) continue;
    let best = 0;
    let bestLag = 0;
    let e0 = 0;
    for (let k = 0; k < win; k++) e0 += pcm[i + k] * pcm[i + k];
    for (let lag = minLag; lag <= maxLag; lag++) {
      let acc = 0;
      for (let k = 0; k + lag < win; k++) acc += pcm[i + k] * pcm[i + k + lag];
      const r = acc / (e0 || 1e-9);
      if (r > best) {
        best = r;
        bestLag = lag;
      }
    }
    if (best > 0.55 && bestLag) f0s.push(SR / bestLag);
  }
  if (!f0s.length) return null;
  f0s.sort((a, b) => a - b);
  return Math.round(f0s[Math.floor(f0s.length / 2)]);
};

// ---------- обработка файла ----------
// Обрезка тишины (−45 дБ), выравнивание речи к speechDb, лимитер, MP3;
// огибающая по кадрам; тайминги слов (переданные или по энергии).
export const finish = (rawWav, outPath, text, words = null) => {
  const pcm = decodeMono(rawWav);
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
  const fi = Math.round(0.012 * SR);
  const fo = Math.round(0.05 * SR);
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
  const gainDb = L815_TTS.speechDb - speechDb;
  const wav = join(TMP, `fin-${process.pid}-${Math.random().toString(36).slice(2, 8)}.wav`);
  writeWav(wav, [out]);
  ffmpeg([
    "-i", wav,
    "-af", `volume=${gainDb.toFixed(2)}dB,alimiter=limit=0.75:attack=3:release=60:level=disabled`,
    "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "192k",
    outPath,
  ]);
  const final = decodeMono(outPath);
  const shift = a / SR;
  const speechStart = round((first - a) / SR);
  const speechEnd = round((last + win - a) / SR);
  let peak = 0;
  for (const v of final) peak = Math.max(peak, Math.abs(v));
  const per = SR / L815_FPS;
  const env = [];
  for (let i = 0; i * per < final.length; i++) {
    const db = rmsDb(final, Math.round(i * per), Math.round((i + 1) * per));
    env.push(Number(Math.max(0, Math.min(1, (db + 45) / 33)).toFixed(2)));
  }
  const w = words
    ? words.map((x) => ({ text: x.text, start: round(Math.max(0, x.start - shift)), end: round(Math.max(0, x.end - shift)) })).filter((x) => x.end > x.start)
    : alignByEnergy(final, text, speechStart, speechEnd);
  return {
    durationSec: round(final.length / SR),
    speechStart,
    speechEnd,
    words: w,
    chars: charsFromWords(w),
    env,
    gainDb: round(gainDb),
    peakDb: round(20 * Math.log10(peak || 1e-9)),
    f0: measureF0(final),
    wordsFrom: words ? "aligned" : "energy",
  };
};

// Полный цикл для одной реплики и одного голоса.
export const synthLine = async (line, voice, outPath, tag = "") => {
  const raw = join(TMP, `${line.id}${tag}-raw.wav`);
  const aligned = await synthRaw(line, voice, raw);
  let words = Array.isArray(aligned) ? aligned : null;
  if (voice.provider === "openai") {
    const tr = await transcribeOpenAI(raw, line.spoken ?? line.text);
    if (tr) words = tr.words;
  }
  const fin = finish(raw, outPath, line.spoken ?? line.text, words);
  return { id: line.id, role: line.role, text: line.text, spoken: line.spoken ?? line.text, provider: voice.provider, voice: voiceKey(voice), ...fin };
};

// Хор: несколько голосов одного текста, сведённых с небольшими сдвигами.
export const synthChorus = async (line, chorus, outPath) => {
  const parts = [];
  for (let i = 0; i < chorus.voices.length; i++) {
    const raw = join(TMP, `${line.id}-ch${i}-raw.wav`);
    await synthRaw(line, chorus.voices[i], raw);
    const tmp = join(TMP, `${line.id}-ch${i}.mp3`);
    finish(raw, tmp, line.spoken ?? line.text);
    parts.push(decodeMono(tmp));
  }
  const len = Math.max(...parts.map((p, i) => p.length + Math.round((chorus.offsetsMs[i] / 1000) * SR))) + Math.round(0.2 * SR);
  const mix = new Float32Array(len);
  parts.forEach((p, i) => {
    const o = Math.round((chorus.offsetsMs[i] / 1000) * SR);
    const g = chorus.gains[i] / parts.length;
    for (let k = 0; k < p.length; k++) mix[o + k] += p[k] * g;
  });
  const wav = join(TMP, `${line.id}-chorus.wav`);
  writeWav(wav, [mix]);
  const fin = finish(wav, outPath, line.spoken ?? line.text);
  return {
    id: line.id,
    role: line.role,
    text: line.text,
    spoken: line.spoken ?? line.text,
    provider: chorus.voices[0].provider,
    voice: `chorus(${chorus.voices.map(voiceKey).join("+")})`,
    ...fin,
  };
};
