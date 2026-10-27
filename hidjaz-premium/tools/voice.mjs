// Озвучка ElevenLabs (eleven_v3, кыргызский) для hidjaz-premium.
// Реплики — CONTENT.lines (src/content.ts). Файл на реплику + тайминги слов
// (with-timestamps) → public/audio/voice/manifest.json. Реплика с тем же
// хэшем (текст, голос, модель, настройки) повторно не синтезируется.
//
//   node hidjaz-premium/tools/voice.mjs            — озвучка ролика
//   node hidjaz-premium/tools/voice.mjs --samples  — короткие пробы голосов
// Ключ: ELEVENLABS_API_KEY (только из окружения, в лог не выводится).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONTENT } from "../src/content.ts";
import { TTS, VOICES } from "../src/tts.ts";

const API = "https://api.elevenlabs.io";
const OUT = "hidjaz-premium/public/audio/voice";
const MANIFEST = join(OUT, "manifest.json");
const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) throw new Error("ELEVENLABS_API_KEY не задан.");
mkdirSync(OUT, { recursive: true });

const isLetter = (c) => /[\p{L}\p{N}]/u.test(c);
const synth = async (voiceId, text, seed) => {
  const r = await fetch(`${API}/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_192`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: TTS.modelId, language_code: TTS.languageCode, seed, voice_settings: TTS.voiceSettings }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
};
const durationOf = (file) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

if (process.argv.includes("--samples")) {
  const dir = "hidjaz-premium/research/voice-samples";
  mkdirSync(dir, { recursive: true });
  for (const v of Object.values(VOICES)) {
    const d = await synth(v.voiceId, TTS.sampleText, TTS.seed);
    writeFileSync(join(dir, `${v.name}.mp3`), Buffer.from(d.audio_base64, "base64"));
    console.log(`+ ${dir}/${v.name}.mp3`);
  }
  process.exit(0);
}

const voice = VOICES[TTS.voice];
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
for (const line of CONTENT.lines) {
  const text = line.spoken ?? line.text;
  const hash = createHash("sha1").update(JSON.stringify({ text, voice: voice.voiceId, ...TTS, sampleText: undefined })).digest("hex").slice(0, 16);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    continue;
  }
  console.log(`→ ${line.id}: «${text}»`);
  const d = await synth(voice.voiceId, text, TTS.seed);
  const raw = join(OUT, `${line.id}.raw.mp3`);
  writeFileSync(raw, Buffer.from(d.audio_base64, "base64"));
  const al = d.alignment;
  const chars = al.characters.join("");
  // слова субтитров (line.text) по таймингам символов
  const words = [];
  let pos = 0;
  for (const w of line.text.split(/\s+/).filter(Boolean)) {
    const core = [...w].filter(isLetter).join("");
    const lower = chars.toLowerCase();
    const i = core ? lower.indexOf([...core][0].toLowerCase(), pos) : -1;
    if (i < 0) continue;
    let j = i;
    let k = 0;
    const cs = [...core.toLowerCase()];
    while (j < chars.length && k < cs.length) {
      if (lower[j] === cs[k]) k++;
      j++;
    }
    words.push({ text: w, start: al.character_start_times_seconds[i], end: al.character_end_times_seconds[Math.max(i, j - 1)] });
    pos = j;
  }
  // обрезка тишины в начале (оставляем 40 мс) и громкость −16 LUFS
  const lead = Math.max(0, (words[0]?.start ?? 0) - 0.04);
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(lead), "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=7,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", join(OUT, file)]);
  execFileSync("rm", ["-f", raw]);
  const shifted = words.map((w) => ({ text: w.text, start: +(w.start - lead).toFixed(3), end: +(w.end - lead).toFixed(3) }));
  lines.push({ id: line.id, file, hash, voice: voice.name, duration: +durationOf(join(OUT, file)).toFixed(3), words: shifted });
}
writeFileSync(MANIFEST, JSON.stringify({ version: 1, lines }, null, 2) + "\n");
console.log(`manifest: ${lines.length} реплик`);
