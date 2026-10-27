// Синтез реплик BalaGoBG042: общий модуль проекта scripts/lib/ts2d-tts.mjs
// (только импорт, без изменений) — ElevenLabs eleven_v3, кыргызский,
// страховочное слово против обрезанного конца, выравнивание громкости,
// тайминги слов и букв, огибающая громкости для губ. Темп и высота тона
// не меняются.
import { createHash } from "node:crypto";
import { BG42_VOICES, spokenOf } from "../../../src/campaign50/bg-042/script.ts";
import { TS2_TTS } from "../../../src/two-schedules-2d/script.ts";
import { synthLine as ts2Synth } from "../../lib/ts2d-tts.mjs";

export const voiceOf = (role) => {
  const v = BG42_VOICES[role];
  if (!v?.voiceId) throw new Error(`Нет голоса для роли ${role}`);
  return { name: v.name, voiceId: v.voiceId };
};

// Хэш реплики: текст произношения, тег, голос, модель, настройки, seed.
// Тот же хэш → файл не синтезируется повторно (кэш, без лишних расходов).
export const lineHash = (line, voiceId = voiceOf(line.role).voiceId, seed = line.seed) =>
  createHash("sha1")
    .update(
      JSON.stringify({
        v: 1,
        text: spokenOf(line),
        tag: line.tag ?? null,
        voiceId,
        modelId: TS2_TTS.modelId,
        languageCode: TS2_TTS.languageCode,
        voiceSettings: TS2_TTS.voiceSettings,
        seed,
      }),
    )
    .digest("hex")
    .slice(0, 16);

export const synthLine = (apiKey, line, outPath, seed) =>
  ts2Synth(apiKey, { id: line.id, role: line.role, text: line.text, spoken: spokenOf(line), tag: line.tag, seed: line.seed }, voiceOf(line.role), outPath, seed);
