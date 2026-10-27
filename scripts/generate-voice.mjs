// Озвучка ролика ИИ-голосом ElevenLabs (модель eleven_v3, кыргызский).
// Текст и тайминги фраз — VOICE_LINES в src/config.ts.
//
// Нужна переменная окружения ELEVENLABS_API_KEY (в GitHub — секрет
// репозитория с тем же именем). Необязательно: ELEVENLABS_VOICE_ID,
// ELEVENLABS_MODEL_ID (по умолчанию eleven_v3).
//
// Для каждой фразы скрипт: синтезирует речь → обрезает тишину по краям →
// выравнивает громкость (-16 LUFS) → при необходимости слегка ускоряет,
// чтобы фраза уложилась в свою сцену → пишет public/audio/voice/<id>.mp3
// и manifest.json, который читает Remotion.
//
// Запуск: npm run audio:voice
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { AUDIO, VOICE_LINES } from "../src/config.ts";
import {
  SAMPLE_RATE as SR,
  decodeMono,
  ffmpeg,
  writeWav,
} from "./lib/audio.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
// Голос по умолчанию: «George» — тёплый спокойный мужской голос из
// стандартной библиотеки ElevenLabs. Можно заменить своим voice_id.
const voiceId =
  process.env.ELEVENLABS_VOICE_ID?.trim() || "JBFqnCBsd6RMkjVDRZzb";
const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_v3";
const MAX_TEMPO = 1.2;
// Адрес API (переопределяется только для локальных тестов).
const apiBase =
  process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";

const OUT = join("public", AUDIO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const TMP = join(tmpdir(), "balago-voice");

if (!apiKey) {
  console.log(
    "ELEVENLABS_API_KEY не задан — озвучка не создаётся. " +
      "Ролик будет собран с музыкой и эффектами, но без голоса.",
  );
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const settingsHash = (line) =>
  createHash("sha1")
    .update(
      JSON.stringify({
        text: line.text,
        voiceId,
        modelId,
        max: line.maxSeconds,
      }),
    )
    .digest("hex")
    .slice(0, 12);

const previous = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : null;

const synthesize = async (text, withLanguage) => {
  // 128 кбит/с доступны на Starter; 192 кбит/с требуют Creator и выше.
  const url = `${apiBase}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const body = {
    text,
    model_id: modelId,
    // eleven_v3 принимает stability 0.0 / 0.5 / 1.0; 0.5 — спокойная естественная подача.
    voice_settings: { stability: 0.5, similarity_boost: 0.8 },
  };
  if (withLanguage) body.language_code = "ky";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text();
    const err = new Error(`ElevenLabs ${res.status}: ${msg.slice(0, 500)}`);
    err.status = res.status;
    err.body = msg;
    throw err;
  }
  return Buffer.from(await res.arrayBuffer());
};

// Обрезает тишину в начале и конце (порог -45 дБ, оставляет 40 мс воздуха).
const trimSilence = (samples) => {
  const threshold = Math.pow(10, -45 / 20);
  const win = Math.round(0.01 * SR);
  const loud = (i) => {
    let m = 0;
    for (let k = i; k < Math.min(samples.length, i + win); k++)
      m = Math.max(m, Math.abs(samples[k]));
    return m > threshold;
  };
  let start = 0;
  while (start < samples.length && !loud(start)) start += win;
  let end = samples.length - win;
  while (end > start && !loud(end)) end -= win;
  const pad = Math.round(0.04 * SR);
  return samples.slice(
    Math.max(0, start - pad),
    Math.min(samples.length, end + win + pad),
  );
};

const manifest = { voiceId, modelId, lines: [] };

for (const line of VOICE_LINES) {
  const hash = settingsHash(line);
  const file = `${line.id}.mp3`;
  const outPath = join(OUT, file);
  const cached = previous?.lines?.find(
    (l) => l.id === line.id && l.hash === hash,
  );
  if (cached && existsSync(outPath)) {
    console.log(
      `= ${line.id}: без изменений, ${cached.durationSec.toFixed(2)} с`,
    );
    manifest.lines.push({ ...cached, startFrame: line.startFrame });
    continue;
  }

  console.log(`→ ${line.id}: «${line.text}»`);
  let mp3;
  try {
    mp3 = await synthesize(line.text, true);
  } catch (e) {
    // Если модель не принимает language_code — повторяем без него
    // (язык определяется по тексту).
    if (e.status === 400 || e.status === 422) {
      console.log(`  language_code не принят (${e.status}), повтор без него`);
      mp3 = await synthesize(line.text, false);
    } else {
      throw e;
    }
  }
  const rawPath = join(TMP, `${line.id}-raw.mp3`);
  writeFileSync(rawPath, mp3);

  const trimmed = trimSilence(decodeMono(rawPath));
  const trimmedWav = join(TMP, `${line.id}-trim.wav`);
  writeWav(trimmedWav, [trimmed]);
  const naturalSec = trimmed.length / SR;

  let tempo = 1;
  if (naturalSec > line.maxSeconds) {
    tempo = Math.min(MAX_TEMPO, naturalSec / line.maxSeconds);
    if (naturalSec / tempo > line.maxSeconds + 0.05) {
      console.warn(
        `  ⚠ фраза длится ${naturalSec.toFixed(2)} с при лимите ${line.maxSeconds} с — ` +
          `даже с ускорением ×${MAX_TEMPO} не помещается. Сократите текст в VOICE_LINES.`,
      );
    }
  }
  const filters = [
    ...(tempo > 1 ? [`atempo=${tempo.toFixed(3)}`] : []),
    "loudnorm=I=-16:TP=-1.5:LRA=7",
  ].join(",");
  ffmpeg([
    "-i",
    trimmedWav,
    "-af",
    filters,
    "-ar",
    String(SR),
    "-ac",
    "1",
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outPath,
  ]);
  const durationSec = decodeMono(outPath).length / SR;
  console.log(
    `  ✓ ${durationSec.toFixed(2)} с` +
      (tempo > 1 ? ` (ускорено ×${tempo.toFixed(2)})` : ""),
  );
  manifest.lines.push({
    id: line.id,
    file,
    startFrame: line.startFrame,
    durationSec: Number(durationSec.toFixed(3)),
    hash,
  });
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
rmSync(TMP, { recursive: true, force: true });
console.log(`+ ${MANIFEST}`);
