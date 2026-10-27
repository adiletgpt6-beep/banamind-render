// Провайдеры синтеза речи для LESSON-80. Каждый возвращает WAV-файл и
// тайминги слов (секунды от начала файла): дальше общая постобработка
// (scripts/lesson80/voice.mjs). Выбор: ELEVENLABS_API_KEY → OpenAI (ключ или
// подключённый прокси) → RHVoice (офлайн, системный пакет Ubuntu).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const isLetter = (ch) => /\p{L}/u.test(ch);
const wordsOfText = (text) => text.split(/\s+/).filter((w) => [...w].some(isLetter));

// ---------- RHVoice (офлайн) ----------
export const rhvoiceAvailable = () => {
  try {
    execFileSync("python3", ["-c", "import ctypes\nfor n in ('libRHVoice.so.5','libRHVoice_core.so.7','libRHVoice.so','libRHVoice_core.so'):\n  try:\n    ctypes.CDLL(n); break\n  except OSError: pass\nelse: raise SystemExit(1)"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

export const synthRhvoice = async ({ text, spec, outWav, tmpJson }) => {
  execFileSync("python3", [
    "scripts/lesson80/rhvoice_tts.py",
    "--voice", spec.voice,
    "--pitch", String(spec.pitch),
    "--rate", String(spec.rate),
    "--text", text,
    "--out", outWav,
    "--json", tmpJson,
  ], { stdio: ["ignore", "ignore", "inherit"] });
  const data = JSON.parse(readFileSync(tmpJson, "utf8"));
  return { wav: outWav, words: data.words.map((w) => ({ text: w.text, start: w.start, end: w.end })), chars: null };
};

// ---------- ElevenLabs (with-timestamps) ----------
export const synthElevenLabs = async ({ text, spec, outWav, apiKey, model = "eleven_v3", seed = 7 }) => {
  const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
  const res = await fetch(`${API}/v1/text-to-speech/${spec.voiceId}/with-timestamps?output_format=pcm_24000`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: model, language_code: "ru", seed, voice_settings: { stability: 0.5, similarity_boost: 0.8 }, apply_text_normalization: "auto" }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const pcm = Buffer.from(data.audio_base64, "base64");
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(48000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  writeFileSync(outWav, Buffer.concat([header, pcm]));
  const al = data.alignment;
  const aligned = al.characters.join("");
  const starts = al.character_start_times_seconds;
  const ends = al.character_end_times_seconds;
  const words = [];
  let pos = 0;
  for (const w of wordsOfText(text)) {
    const i = aligned.indexOf(w, pos);
    if (i < 0) continue;
    words.push({ text: w, start: starts[i], end: ends[i + w.length - 1] });
    pos = i + w.length;
  }
  const chars = [];
  for (let i = 0; i < aligned.length; i++) if (isLetter(aligned[i])) chars.push({ c: aligned[i].toLowerCase(), start: starts[i], end: ends[i] });
  return { wav: outWav, words, chars };
};

// ---------- OpenAI (gpt-4o-mini-tts + whisper-1 word timestamps) ----------
export const synthOpenAI = async ({ text, spec, outWav, apiKey }) => {
  const API = process.env.OPENAI_API_BASE?.trim() || "https://api.openai.com";
  const headers = { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) };
  const res = await fetch(`${API}/v1/audio/speech`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: spec.voice, input: text, instructions: spec.instructions, response_format: "wav" }),
  });
  if (!res.ok) throw new Error(`OpenAI speech ${res.status}: ${(await res.text()).slice(0, 300)}`);
  writeFileSync(outWav, Buffer.from(await res.arrayBuffer()));
  const form = new FormData();
  form.append("file", new Blob([readFileSync(outWav)], { type: "audio/wav" }), "line.wav");
  form.append("model", "whisper-1");
  form.append("language", "ru");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");
  const tr = await fetch(`${API}/v1/audio/transcriptions`, { method: "POST", headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}, body: form });
  if (!tr.ok) throw new Error(`OpenAI transcription ${tr.status}: ${(await tr.text()).slice(0, 300)}`);
  const data = await tr.json();
  const heard = (data.words ?? []).map((w) => ({ text: w.word, start: w.start, end: w.end }));
  // слова сценария по порядку распознанных: по количеству, без сопоставления текста
  const script = wordsOfText(text);
  const words = script.map((w, i) => {
    const h = heard[Math.min(i, heard.length - 1)] ?? { start: 0, end: 0 };
    return { text: w, start: h.start, end: h.end };
  });
  return { wav: outWav, words, chars: null, heard: data.text };
};
