// Русская озвучка «Когда краски оживают» — ElevenLabs (eleven_multilingual_v2, ru).
// Одна фраза на сцену. Обрезка тишины, громкость −16 LUFS, темп не меняется.
// Длительности фраз → public/audio/voice.json (AudioSyncSystem строит по ним таймлайн).
// Нужна переменная ELEVENLABS_API_KEY (в GitHub — секрет репозитория).
// Запуск: node scripts/voice.mjs   (из папки muslimkids-invisible-painter)
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { LINES, VOICE } from "./lines.mjs";

const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) throw new Error("Нет ELEVENLABS_API_KEY");
mkdirSync("public/audio/raw", { recursive: true });
const out = [];
for (const l of LINES) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE.voiceId}?output_format=mp3_44100_192`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: l.text,
        model_id: VOICE.modelId,
        language_code: "ru",
        seed: VOICE.seed,
        voice_settings: { ...VOICE.settings, ...(l.settings ?? {}) },
        previous_text: l.prev,
        next_text: l.next,
      }),
    },
  );
  if (!res.ok) throw new Error(`${l.id}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  const raw = `public/audio/raw/${l.id}.mp3`;
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  const file = `public/audio/${l.id}.wav`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af",
    "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11",
    "-ar", "48000", "-ac", "1", file]);
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
  out.push({ id: l.id, text: l.text, file: `audio/${l.id}.wav`, duration: +dur.toFixed(3) });
  console.log(l.id, dur.toFixed(2), "s —", l.text);
}
writeFileSync("public/audio/voice.json", JSON.stringify({ engine: `elevenlabs ${VOICE.modelId} ${VOICE.name}`, lines: out }, null, 2) + "\n");
