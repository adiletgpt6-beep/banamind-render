// Narration for IslamicFinanceShort01 (American English, one male narrator).
//
// Providers, in order of preference:
//   1. ElevenLabs (ELEVENLABS_API_KEY set) — premium voice with character
//      timestamps → word-level captions. Voice: IF01_VOICE_ID (default "Brian").
//   2. Local draft: Kokoro-82M via kokoro-onnx (scripts/if01_tts.py) with
//      PocketSphinx forced alignment. Needs IF01_KOKORO_MODEL and
//      IF01_KOKORO_VOICES (paths to kokoro-v1.0.onnx / voices-v1.0.bin) and a
//      Python with kokoro-onnx, soundfile, pocketsphinx (IF01_PYTHON).
//      The manifest is marked draft: true so the render can label itself.
//
// Each line is synthesized separately, trimmed, loudness-matched and placed at
// its planned start (src/islamic-finance-01/script.ts); a line never starts
// before the previous one has finished (+0.3 s) and the script fails if speech
// would spill into the next scene. Speech is never sped up or cut.
//
// Output: public/audio/islamic-finance-01/narration.mp3 (44.1 kHz mono) and
//         public/audio/islamic-finance-01/manifest.json (absolute word times).
//
// Run: npm run audio:voice:if01
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IF01_LINES, IF01_VIDEO } from "../src/islamic-finance-01/script.ts";
import { SAMPLE_RATE as SR, decodeMono, ffmpeg, writeWav } from "./lib/audio.mjs";

const OUT = join("public", IF01_VIDEO.voiceDir);
const TMP = join(tmpdir(), "balago-if01-voice");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });
const round = (x) => Number(x.toFixed(3));
const MIN_GAP = 0.3;
const TARGET_SPEECH_DB = -17; // average RMS of voiced blocks
const EL_KEY = process.env.ELEVENLABS_API_KEY?.trim();

const rmsDb = (s, from, to) => {
  let acc = 0;
  const a = Math.max(0, from);
  const b = Math.min(s.length, to);
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};
const speechDb = (pcm) => {
  const blk = Math.round(0.05 * SR);
  let acc = 0;
  let cnt = 0;
  for (let i = 0; i + blk <= pcm.length; i += blk) {
    const db = rmsDb(pcm, i, i + blk);
    if (db > -40) {
      acc += Math.pow(10, db / 10);
      cnt++;
    }
  }
  return cnt ? 10 * Math.log10(acc / cnt) : -30;
};

// ---------- provider: ElevenLabs ----------
const synthElevenLabs = async (line, voiceId) => {
  const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
  const spoken = line.text.replace(/—/g, ",");
  const res = await fetch(`${API}/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": EL_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: spoken,
      model_id: process.env.IF01_EL_MODEL || "eleven_multilingual_v2",
      language_code: "en",
      seed: 7,
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
      // pronunciation help for the two Arabic terms
      pronunciation_dictionary_locators: [],
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const raw = join(TMP, `${line.id}-el.mp3`);
  writeFileSync(raw, Buffer.from(data.audio_base64, "base64"));
  const al = data.alignment;
  const chars = al.characters;
  const starts = al.character_start_times_seconds;
  const ends = al.character_end_times_seconds;
  const words = [];
  let i = 0;
  for (const w of spoken.split(/\s+/).filter(Boolean)) {
    const idx = chars.join("").indexOf(w, i);
    if (idx < 0) continue;
    words.push({ text: w, start: starts[idx], end: ends[idx + w.length - 1] });
    i = idx + w.length;
  }
  return { pcm: decodeMono(raw), words, aligner: "elevenlabs" };
};

// ---------- provider: local Kokoro draft ----------
const synthKokoroAll = () => {
  const py = process.env.IF01_PYTHON || "python3";
  const model = process.env.IF01_KOKORO_MODEL;
  const voices = process.env.IF01_KOKORO_VOICES;
  if (!model || !voices || !existsSync(model) || !existsSync(voices)) {
    throw new Error("No TTS provider: set ELEVENLABS_API_KEY, or IF01_KOKORO_MODEL + IF01_KOKORO_VOICES for a local draft.");
  }
  const linesJson = join(TMP, "lines.json");
  writeFileSync(linesJson, JSON.stringify(IF01_LINES.map((l) => ({ id: l.id, text: l.text }))));
  const dir = join(TMP, "kokoro");
  execFileSync(
    py,
    ["-I", "scripts/if01_tts.py", "--lines", linesJson, "--out", dir, "--model", model, "--voices", voices, "--voice", process.env.IF01_KOKORO_VOICE || "am_michael", "--speed", process.env.IF01_KOKORO_SPEED || "1.0"],
    { stdio: "inherit" },
  );
  return IF01_LINES.map((l) => {
    const info = JSON.parse(readFileSync(join(dir, `${l.id}.json`), "utf8"));
    return { pcm: decodeMono(join(dir, `${l.id}.wav`)), words: info.words, aligner: info.aligner, voice: info.voice };
  });
};

// ---------- assembly ----------
const trimEdges = (pcm, thrDb = -45) => {
  const thr = Math.pow(10, thrDb / 20);
  let a = 0;
  while (a < pcm.length && Math.abs(pcm[a]) < thr) a++;
  let b = pcm.length - 1;
  while (b > a && Math.abs(pcm[b]) < thr) b--;
  const pad = Math.round(0.04 * SR);
  const from = Math.max(0, a - pad);
  const to = Math.min(pcm.length, b + pad);
  return { pcm: pcm.slice(from, to), shift: from / SR };
};

const main = async () => {
  let provider;
  let voiceName;
  let takes;
  if (EL_KEY) {
    provider = "elevenlabs";
    voiceName = process.env.IF01_VOICE_ID || "nPczCjzI2devNBz1zQrb"; // "Brian" — calm American male
    takes = [];
    for (const line of IF01_LINES) {
      console.log(`→ ${line.id}: «${line.text}»`);
      takes.push(await synthElevenLabs(line, voiceName));
    }
  } else {
    provider = "kokoro-onnx";
    takes = synthKokoroAll();
    voiceName = takes[0]?.voice ?? "am_michael";
    console.log("⚠ Draft narration (local Kokoro-82M). Set ELEVENLABS_API_KEY for the premium voice.");
  }

  const total = Math.round(IF01_VIDEO.durationSec * SR);
  const track = new Float32Array(total);
  const lines = [];
  let cursor = 0;
  const problems = [];
  IF01_LINES.forEach((line, i) => {
    const t = takes[i];
    const { pcm, shift } = trimEdges(t.pcm);
    const gain = Math.pow(10, (TARGET_SPEECH_DB - speechDb(pcm)) / 20);
    const start = Math.max(line.at, cursor + MIN_GAP);
    const dur = pcm.length / SR;
    if (start + dur > line.endBy) problems.push(`${line.id} ends at ${(start + dur).toFixed(2)} s, must end by ${line.endBy} s (${dur.toFixed(2)} s of speech)`);
    const o = Math.round(start * SR);
    const fade = Math.round(0.01 * SR);
    for (let k = 0; k < pcm.length && o + k < total; k++) {
      const env = Math.min(1, k / fade, (pcm.length - k) / (fade * 3));
      track[o + k] += pcm[k] * gain * env;
    }
    cursor = start + dur;
    lines.push({
      id: line.id,
      scene: line.scene,
      text: line.text,
      start: round(start),
      end: round(start + dur),
      aligner: t.aligner,
      words: t.words.map((w) => ({ text: w.text, start: round(start + Math.max(0, w.start - shift)), end: round(start + Math.max(0, w.end - shift)) })),
    });
    console.log(`✓ ${line.id}: ${start.toFixed(2)}–${(start + dur).toFixed(2)} s (${t.aligner})`);
  });
  if (problems.length) {
    for (const p of problems) console.error(`✗ ${p}`);
    console.error("Speech does not fit the storyboard. Adjust `at`/`endBy` in src/islamic-finance-01/script.ts (speech is never sped up).");
    process.exit(1);
  }
  const wav = join(TMP, "narration.wav");
  writeWav(wav, [track]);
  ffmpeg(["-i", wav, "-af", "alimiter=limit=0.8:attack=3:release=60:level=disabled", "-ar", String(SR), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "192k", join(OUT, "narration.mp3")]);
  const final = decodeMono(join(OUT, "narration.mp3"));
  let peak = 0;
  for (const v of final) peak = Math.max(peak, Math.abs(v));
  const manifest = {
    version: 1,
    video: IF01_VIDEO.id,
    provider,
    draft: provider !== "elevenlabs",
    voice: voiceName,
    file: "narration.mp3",
    durationSec: round(final.length / SR),
    peakDb: round(20 * Math.log10(peak || 1e-9)),
    speechDb: TARGET_SPEECH_DB,
    lines,
  };
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`+ ${OUT}/narration.mp3 (${manifest.durationSec} s, peak ${manifest.peakDb} dBFS) and manifest.json [${provider}${manifest.draft ? ", DRAFT" : ""}]`);
};

await main();
